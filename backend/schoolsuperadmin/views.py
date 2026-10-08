import traceback

from django.contrib.auth import get_user_model
from django.db.models import Q, Sum

from .services import (
    provision_school_user,
    create_school_admin,
)

from notifications.models import Notification

from accounts.permissions import IsSchoolSuperAdmin

from finance.models import (
    AccountantProfile,
    StudentInvoice,
    Payment,
    Expense,
)

from library.models import LibrarianProfile
from admissions.models import AdmissionOfficerProfile
from examinations.models import ExamOfficerProfile

from audit.models import AuditLog

from academics.models import (
    School,
    AcademicSession,
    Term,
    Subject,
    ClassLevel,
)

from students.models import (
    Student,
    StudentEnrollment,
    ParentGuardian,
)

from teachers.models import Teacher

from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from .permissions import (
    IsSchoolSuperAdmin,
    IsSuperAdmin,
)

from .serializers import (
    SchoolUserCreateSerializer,
    SchoolUserSerializer,
    OtherStaffSerializer,
    SuperAdminCreateSchoolAdminSerializer,
    SuperAdminEditSchoolAdminSerializer,
)


User = get_user_model()


# ============================================================
# SCHOOL USER LIST
# ============================================================

class SchoolUserListView(generics.ListAPIView):
    serializer_class = SchoolUserSerializer
    permission_classes = [IsSchoolSuperAdmin]

    def get_queryset(self):
        school_id = self.request.user.school_id

        queryset = (
            User.objects
            .filter(
                Q(school_id=school_id)
                | Q(
                    student_profile__school_id=school_id
                )
                | Q(
                    teacher_profile__school_id=school_id
                )
                | Q(
                    parent_profile__school_id=school_id
                )
                | Q(
                    accountant_profile__school_id=school_id
                )
                | Q(
                    exam_officer_profile__school_id=school_id
                )
                | Q(
                    librarian_profile__school_id=school_id
                )
                | Q(
                    admission_officer_profile__school_id=school_id
                )
                | Q(
                    principal_profile__school_id=school_id
                )
            )
            .exclude(
                role=User.Role.SUPER_ADMIN
            )
            .distinct()
            .select_related("school")
            .order_by(
                "first_name",
                "last_name",
                "username",
            )
        )

        # ----------------------------------------------------
        # ROLE FILTER
        # ----------------------------------------------------

        role = self.request.query_params.get(
            "role"
        )

        if role:
            queryset = queryset.filter(
                role=role
            )

        # ----------------------------------------------------
        # SEARCH
        # ----------------------------------------------------

        search = self.request.query_params.get(
            "search"
        )

        if search:
            search = search.strip()

            queryset = queryset.filter(
                Q(
                    username__icontains=search
                )
                | Q(
                    first_name__icontains=search
                )
                | Q(
                    last_name__icontains=search
                )
                | Q(
                    email__icontains=search
                )
                | Q(
                    phone_number__icontains=search
                )
            )

        # ----------------------------------------------------
        # ACTIVE FILTER
        # ----------------------------------------------------

        is_active = self.request.query_params.get(
            "is_active"
        )

        if is_active in [
            "true",
            "false",
        ]:
            queryset = queryset.filter(
                is_active=(
                    is_active == "true"
                )
            )

        return queryset


# ============================================================
# SCHOOL USER DETAIL
# ============================================================

class SchoolUserDetailView(
    generics.RetrieveUpdateAPIView
):
    serializer_class = SchoolUserSerializer
    permission_classes = [IsSchoolSuperAdmin]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        school_id = self.request.user.school_id

        return (
            User.objects
            .filter(
                Q(school_id=school_id)
                | Q(
                    student_profile__school_id=school_id
                )
                | Q(
                    teacher_profile__school_id=school_id
                )
                | Q(
                    parent_profile__school_id=school_id
                )
                | Q(
                    accountant_profile__school_id=school_id
                )
                | Q(
                    exam_officer_profile__school_id=school_id
                )
                | Q(
                    librarian_profile__school_id=school_id
                )
                | Q(
                    admission_officer_profile__school_id=school_id
                )
                | Q(
                    principal_profile__school_id=school_id
                )
            )
            .exclude(
                role=User.Role.SUPER_ADMIN
            )
            .distinct()
            .select_related("school")
        )

    def update(
        self,
        request,
        *args,
        **kwargs,
    ):
        protected_fields = {
            "id",
            "username",
            "role",
            "school",
        }

        submitted_protected_fields = (
            protected_fields.intersection(
                request.data.keys()
            )
        )

        if submitted_protected_fields:
            errors = {}

            for field in submitted_protected_fields:
                errors[field] = (
                    "This field cannot be changed "
                    "from School User Management."
                )

            raise ValidationError(errors)

        return super().update(
            request,
            *args,
            **kwargs,
        )


# ============================================================
# SCHOOL USER CREATE
# ============================================================

class SchoolUserCreateView(
    generics.CreateAPIView
):
    serializer_class = SchoolUserCreateSerializer
    permission_classes = [IsSchoolSuperAdmin]

    def create(
        self,
        request,
        *args,
        **kwargs,
    ):
        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        validated_data = (
            serializer.validated_data.copy()
        )

        # ----------------------------------------------------
        # SCHOOL
        # ----------------------------------------------------

        school = request.user.school

        if not school:
            raise ValidationError(
                {
                    "detail": (
                        "Your School Admin account "
                        "does not have an assigned school."
                    )
                }
            )

        # ----------------------------------------------------
        # COMMON USER FIELDS
        # ----------------------------------------------------

        role = validated_data.pop(
            "role"
        )

        first_name = validated_data.pop(
            "first_name"
        )

        last_name = validated_data.pop(
            "last_name"
        )

        email = validated_data.pop(
            "email",
            "",
        )

        phone_number = validated_data.pop(
            "phone_number",
            "",
        )

        # ----------------------------------------------------
        # SCHOOL ALWAYS COMES FROM LOGGED-IN SCHOOL ADMIN
        # ----------------------------------------------------

        try:
            result = provision_school_user(
                school=school,
                role=role,
                first_name=first_name,
                last_name=last_name,
                email=email,
                phone_number=phone_number,
                **validated_data,
            )

        except ValueError as exc:
            raise ValidationError(
                {
                    "detail": str(exc)
                }
            )

        except Exception:
            traceback.print_exc()

            raise ValidationError(
                {
                    "detail": (
                        "The user could not be created. "
                        "Please check the supplied information "
                        "and try again."
                    )
                }
            )

        user = result["user"]

        response_data = {
            "message": (
                "User and role profile "
                "created successfully."
            ),
            "school": {
                "id": school.id,
                "name": school.name,
            },
            "user": SchoolUserSerializer(
                user
            ).data,
            "credentials": {
                "username": result[
                    "username"
                ],
                "temporary_password": result[
                    "temporary_password"
                ],
            },
        }

        # ====================================================
        # STUDENT ENROLLMENT
        # ====================================================

        enrollment = result.get(
            "enrollment"
        )

        if enrollment is not None:
            response_data["enrollment"] = {
                "id": enrollment.id,

                "student_id": (
                    enrollment.student_id
                ),

                "academic_session": {
                    "id": (
                        enrollment.academic_session_id
                    ),
                    "name": (
                        enrollment.academic_session.name
                    ),
                },

                "term": {
                    "id": enrollment.term_id,
                    "name": enrollment.term.name,
                },

                "class_level": {
                    "id": (
                        enrollment.class_level_id
                    ),
                    "name": (
                        enrollment.class_level.name
                    ),
                },

                "enrollment_date": (
                    enrollment.enrollment_date
                ),

                "is_current": (
                    enrollment.is_current
                ),

                "roll_number": (
                    enrollment.roll_number
                ),

                "remarks": (
                    enrollment.remarks
                ),
            }

        return Response(
            response_data,
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# OTHER STAFF LIST
# ============================================================

class OtherStaffListView(generics.ListAPIView):

    serializer_class = OtherStaffSerializer
    permission_classes = [IsSchoolSuperAdmin]

    def get_queryset(self):

        school_id = self.request.user.school_id

        if not school_id:
            return []

        profiles = []

        # ----------------------------------------------------
        # ACCOUNTANTS
        # ----------------------------------------------------

        accountants = (
            AccountantProfile.objects
            .filter(
                school_id=school_id,
            )
            .select_related("user")
        )

        for profile in accountants:

            profiles.append(
                {
                    "id": profile.id,
                    "user_id": profile.user_id,
                    "user": profile.user,
                    "full_name": (
                        profile.user.get_full_name()
                        .strip()
                    ),
                    "first_name": (
                        profile.user.first_name
                    ),
                    "last_name": (
                        profile.user.last_name
                    ),
                    "email": (
                        profile.user.email
                    ),
                    "phone_number": (
                        profile.user.phone_number
                    ),
                    "role": User.Role.ACCOUNTANT,
                    "role_display": (
                        profile.user.get_role_display()
                    ),
                    "employee_number": (
                        profile.employee_number
                    ),
                    "employment_date": (
                        profile.employment_date
                    ),
                    "is_active": (
                        profile.is_active
                        and profile.user.is_active
                    ),
                }
            )

        # ----------------------------------------------------
        # LIBRARIANS
        # ----------------------------------------------------

        librarians = (
            LibrarianProfile.objects
            .filter(
                school_id=school_id,
            )
            .select_related("user")
        )

        for profile in librarians:

            profiles.append(
                {
                    "id": profile.id,
                    "user_id": profile.user_id,
                    "user": profile.user,
                    "full_name": (
                        profile.user.get_full_name()
                        .strip()
                    ),
                    "first_name": (
                        profile.user.first_name
                    ),
                    "last_name": (
                        profile.user.last_name
                    ),
                    "email": (
                        profile.user.email
                    ),
                    "phone_number": (
                        profile.user.phone_number
                    ),
                    "role": User.Role.LIBRARIAN,
                    "role_display": (
                        profile.user.get_role_display()
                    ),
                    "employee_number": (
                        profile.employee_number
                    ),
                    "employment_date": (
                        profile.employment_date
                    ),
                    "is_active": (
                        profile.is_active
                        and profile.user.is_active
                    ),
                }
            )

        # ----------------------------------------------------
        # ADMISSION OFFICERS
        # ----------------------------------------------------

        admission_officers = (
            AdmissionOfficerProfile.objects
            .filter(
                school_id=school_id,
            )
            .select_related("user")
        )

        for profile in admission_officers:

            profiles.append(
                {
                    "id": profile.id,
                    "user_id": profile.user_id,
                    "user": profile.user,
                    "full_name": (
                        profile.user.get_full_name()
                        .strip()
                    ),
                    "first_name": (
                        profile.user.first_name
                    ),
                    "last_name": (
                        profile.user.last_name
                    ),
                    "email": (
                        profile.user.email
                    ),
                    "phone_number": (
                        profile.user.phone_number
                    ),
                    "role": User.Role.ADMISSION_OFFICER,
                    "role_display": (
                        profile.user.get_role_display()
                    ),
                    "employee_number": (
                        profile.employee_number
                    ),
                    "employment_date": (
                        profile.employment_date
                    ),
                    "is_active": (
                        profile.is_active
                        and profile.user.is_active
                    ),
                }
            )

        # ----------------------------------------------------
        # EXAM OFFICERS
        # ----------------------------------------------------

        exam_officers = (
            ExamOfficerProfile.objects
            .filter(
                school_id=school_id,
            )
            .select_related("user")
        )

        for profile in exam_officers:

            profiles.append(
                {
                    "id": profile.id,
                    "user_id": profile.user_id,
                    "user": profile.user,
                    "full_name": (
                        profile.user.get_full_name()
                        .strip()
                    ),
                    "first_name": (
                        profile.user.first_name
                    ),
                    "last_name": (
                        profile.user.last_name
                    ),
                    "email": (
                        profile.user.email
                    ),
                    "phone_number": (
                        profile.user.phone_number
                    ),
                    "role": User.Role.EXAM_OFFICER,
                    "role_display": (
                        profile.user.get_role_display()
                    ),
                    "employee_number": (
                        profile.employee_number
                    ),
                    "employment_date": (
                        profile.employment_date
                    ),
                    "is_active": (
                        profile.is_active
                        and profile.user.is_active
                    ),
                }
            )

        # ----------------------------------------------------
        # SEARCH
        # ----------------------------------------------------

        search = self.request.query_params.get(
            "search"
        )

        if search:
            search = search.strip().lower()

            profiles = [
                profile
                for profile in profiles
                if (
                    search
                    in profile["full_name"].lower()
                    or search
                    in profile["employee_number"].lower()
                    or search
                    in (
                        profile["email"] or ""
                    ).lower()
                )
            ]

        # ----------------------------------------------------
        # ROLE FILTER
        # ----------------------------------------------------

        role = self.request.query_params.get(
            "role"
        )

        if role:
            profiles = [
                profile
                for profile in profiles
                if profile["role"] == role
            ]

        # ----------------------------------------------------
        # ACTIVE FILTER
        # ----------------------------------------------------

        is_active = self.request.query_params.get(
            "is_active"
        )

        if is_active in [
            "true",
            "false",
        ]:

            active_value = (
                is_active == "true"
            )

            profiles = [
                profile
                for profile in profiles
                if profile["is_active"]
                == active_value
            ]

        # ----------------------------------------------------
        # SORT
        # ----------------------------------------------------

        profiles.sort(
            key=lambda item: (
                item["full_name"] or ""
            ).lower()
        )

        return profiles


# ============================================================
# SUPER ADMIN DASHBOARD
# ============================================================

class SuperAdminDashboardView(generics.GenericAPIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request, *args, **kwargs):

        # ====================================================
        # SYSTEM STATISTICS
        # ====================================================

        total_schools = School.objects.count()

        active_schools = School.objects.filter(
            is_active=True
        ).count()

        total_students = Student.objects.count()

        active_students = Student.objects.filter(
            status=Student.Status.ACTIVE
        ).count()

        total_teachers = Teacher.objects.count()

        active_teachers = Teacher.objects.filter(
            employment_status=Teacher.EmploymentStatus.ACTIVE
        ).count()

        total_parents = ParentGuardian.objects.count()

        active_parents = ParentGuardian.objects.filter(
            is_active=True
        ).count()

        total_school_admins = User.objects.filter(
            role=User.Role.SCHOOL_ADMIN
        ).count()

        active_school_admins = User.objects.filter(
            role=User.Role.SCHOOL_ADMIN,
            is_active=True,
        ).count()

        # ====================================================
        # CURRENT ENROLLMENTS
        # ====================================================

        current_enrollments = StudentEnrollment.objects.filter(
            is_current=True
        ).count()

        # ====================================================
        # FINANCE
        # ====================================================

        invoiced_result = StudentInvoice.objects.aggregate(
            total=Sum("amount")
        )

        total_invoiced = (
            invoiced_result["total"] or 0
        )

        collected_result = Payment.objects.filter(
            status=Payment.Status.SUCCESSFUL
        ).aggregate(
            total=Sum("amount")
        )

        total_collected = (
            collected_result["total"] or 0
        )

        outstanding_result = StudentInvoice.objects.exclude(
            status=StudentInvoice.Status.CANCELLED
        ).aggregate(
            total=Sum("balance")
        )

        total_outstanding = (
            outstanding_result["total"] or 0
        )

        expenses_result = Expense.objects.filter(
            status=Expense.Status.PAID
        ).aggregate(
            total=Sum("amount")
        )

        total_expenses = (
            expenses_result["total"] or 0
        )

        # ====================================================
        # CURRENT ACADEMIC INFORMATION
        # ====================================================

        current_sessions = AcademicSession.objects.filter(
            is_current=True,
            is_active=True,
        ).select_related(
            "school"
        ).order_by(
            "school__name"
        )

        current_terms = Term.objects.filter(
            is_current=True,
            is_active=True,
        ).select_related(
            "academic_session",
            "academic_session__school",
        ).order_by(
            "academic_session__school__name"
        )

        session_data = []

        for session in current_sessions:
            session_data.append(
                {
                    "id": session.id,
                    "name": session.name,
                    "school_id": session.school_id,
                    "school_name": session.school.name,
                    "start_date": session.start_date,
                    "end_date": session.end_date,
                }
            )

        term_data = []

        for term in current_terms:
            term_data.append(
                {
                    "id": term.id,
                    "name": term.name,
                    "name_display": term.get_name_display(),
                    "academic_session_id": (
                        term.academic_session_id
                    ),
                    "session_name": (
                        term.academic_session.name
                    ),
                    "school_id": (
                        term.academic_session.school_id
                    ),
                    "school_name": (
                        term.academic_session.school.name
                    ),
                    "start_date": term.start_date,
                    "end_date": term.end_date,
                }
            )

        # ====================================================
        # RECENT AUDIT ACTIVITIES
        # ====================================================

        audit_logs = (
            AuditLog.objects
            .select_related("user")
            .order_by("-created_at")[:5]
        )

        recent_activities = []

        for audit in audit_logs:

            if audit.user:
                user_name = (
                    audit.user.get_full_name()
                    or audit.user.username
                )
            else:
                user_name = "System"

            recent_activities.append(
                {
                    "id": audit.id,
                    "action": audit.action,
                    "action_display": (
                        audit.get_action_display()
                    ),
                    "model_name": audit.model_name,
                    "object_id": audit.object_id,
                    "object_repr": audit.object_repr,
                    "description": audit.description,
                    "user_id": audit.user_id,
                    "user_name": user_name,
                    "ip_address": audit.ip_address,
                    "created_at": audit.created_at,
                }
            )

        # ====================================================
        # RECENT NOTIFICATIONS
        # ====================================================

        notifications = (
            Notification.objects
            .filter(
                recipient=request.user
            )
            .order_by("-created_at")[:5]
        )

        notification_data = []

        for notification in notifications:

            notification_data.append(
                {
                    "id": notification.id,
                    "title": notification.title,
                    "message": notification.message,
                    "notification_type": (
                        notification.notification_type
                    ),
                    "notification_type_display": (
                        notification.get_notification_type_display()
                    ),
                    "link": notification.link,
                    "is_read": notification.is_read,
                    "read_at": notification.read_at,
                    "created_at": notification.created_at,
                }
            )

        # ====================================================
        # FINANCE COLLECTION RATE
        # ====================================================

        if total_invoiced:
            collection_rate = (
                float(total_collected)
                / float(total_invoiced)
            ) * 100
        else:
            collection_rate = 0

        # ====================================================
        # RESPONSE
        # ====================================================

        return Response(
            {
                "statistics": {
                    "schools": total_schools,
                    "active_schools": active_schools,

                    "students": total_students,
                    "active_students": active_students,

                    "teachers": total_teachers,
                    "active_teachers": active_teachers,

                    "parents": total_parents,
                    "active_parents": active_parents,

                    "school_admins": total_school_admins,
                    "active_school_admins": (
                        active_school_admins
                    ),

                    "current_enrollments": (
                        current_enrollments
                    ),
                },

                "finance": {
                    "total_invoiced": total_invoiced,
                    "total_collected": total_collected,
                    "total_outstanding": (
                        total_outstanding
                    ),
                    "total_expenses": total_expenses,
                    "collection_rate": round(
                        collection_rate,
                        2,
                    ),
                },

                "academic": {
                    "current_sessions": (
                        len(session_data)
                    ),
                    "current_terms": (
                        len(term_data)
                    ),
                    "sessions": session_data,
                    "terms": term_data,
                },

                "recent_activities": (
                    recent_activities
                ),

                "notices": notification_data,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# SCHOOL ADMIN DASHBOARD
# ============================================================

# ============================================================
# SCHOOL ADMIN DASHBOARD
# ============================================================

class SchoolAdminDashboardView(generics.GenericAPIView):
    permission_classes = [IsSchoolSuperAdmin]

    def get(self, request, *args, **kwargs):

        # ====================================================
        # SCHOOL
        # ====================================================

        school = request.user.school

        # ====================================================
        # PEOPLE STATISTICS
        # ====================================================

        total_students = Student.objects.filter(
            school=school
        ).count()

        active_students = Student.objects.filter(
            school=school,
            status=Student.Status.ACTIVE,
        ).count()

        total_teachers = Teacher.objects.filter(
            school=school
        ).count()

        active_teachers = Teacher.objects.filter(
            school=school,
            employment_status=(
                Teacher.EmploymentStatus.ACTIVE
            ),
        ).count()

        total_parents = ParentGuardian.objects.filter(
            school=school
        ).count()

        active_parents = ParentGuardian.objects.filter(
            school=school,
            is_active=True,
        ).count()

        # ====================================================
        # OTHER SCHOOL STAFF
        # ====================================================

        staff_roles = [
            User.Role.PRINCIPAL,
            User.Role.ACCOUNTANT,
            User.Role.ADMISSION_OFFICER,
            User.Role.LIBRARIAN,
            User.Role.EXAM_OFFICER,
            User.Role.COUNSELOR,
            User.Role.HOSTEL_MANAGER,
            User.Role.TRANSPORT_MANAGER,
        ]

        total_staff = User.objects.filter(
            school=school,
            role__in=staff_roles,
        ).count()

        active_staff = User.objects.filter(
            school=school,
            role__in=staff_roles,
            is_active=True,
        ).count()

        # ====================================================
        # CURRENT ENROLLMENTS
        # ====================================================

        current_enrollments = (
            StudentEnrollment.objects.filter(
                student__school=school,
                is_current=True,
            ).count()
        )

        # ====================================================
        # ACADEMIC STATISTICS
        # ====================================================

        total_classes = ClassLevel.objects.filter(
            school=school
        ).count()

        active_classes = ClassLevel.objects.filter(
            school=school,
            is_active=True,
        ).count()

        total_subjects = Subject.objects.filter(
            school=school
        ).count()

        active_subjects = Subject.objects.filter(
            school=school,
            is_active=True,
        ).count()

        # ====================================================
        # CURRENT ACADEMIC SESSION
        # ====================================================

        current_session = (
            AcademicSession.objects.filter(
                school=school,
                is_current=True,
                is_active=True,
            )
            .order_by("-id")
            .first()
        )

        # ====================================================
        # CURRENT TERM
        # ====================================================

        current_term = None

        if current_session:

            current_term = (
                Term.objects.filter(
                    academic_session=current_session,
                    is_current=True,
                    is_active=True,
                )
                .order_by("-id")
                .first()
            )

        # ====================================================
        # FINANCE
        # ====================================================

        invoices = StudentInvoice.objects.filter(
            student__school=school
        )

        invoiced_result = invoices.exclude(
            status=StudentInvoice.Status.CANCELLED
        ).aggregate(
            total=Sum("amount")
        )

        total_invoiced = (
            invoiced_result["total"] or 0
        )

        collected_result = Payment.objects.filter(
            invoice__student__school=school,
            status=Payment.Status.SUCCESSFUL,
        ).aggregate(
            total=Sum("amount")
        )

        total_collected = (
            collected_result["total"] or 0
        )

        outstanding_result = invoices.exclude(
            status=StudentInvoice.Status.CANCELLED
        ).aggregate(
            total=Sum("balance")
        )

        total_outstanding = (
            outstanding_result["total"] or 0
        )

        expenses_result = Expense.objects.filter(
            school=school,
            status=Expense.Status.PAID,
        ).aggregate(
            total=Sum("amount")
        )

        total_expenses = (
            expenses_result["total"] or 0
        )

        # ====================================================
        # COLLECTION RATE
        # ====================================================

        if total_invoiced:
            collection_rate = (
                float(total_collected)
                / float(total_invoiced)
            ) * 100
        else:
            collection_rate = 0

        # ====================================================
        # RECENT AUDIT ACTIVITIES
        # ====================================================

        audit_logs = (
            AuditLog.objects
            .select_related("user")
            .filter(
                user__school=school
            )
            .order_by("-created_at")[:10]
        )

        recent_activities = []

        for audit in audit_logs:

            if audit.user:
                user_name = (
                    audit.user.get_full_name()
                    or audit.user.username
                )
            else:
                user_name = "System"

            recent_activities.append(
                {
                    "id": audit.id,
                    "action": audit.action,
                    "action_display": (
                        audit.get_action_display()
                    ),
                    "model_name": audit.model_name,
                    "object_id": audit.object_id,
                    "object_repr": audit.object_repr,
                    "description": audit.description,
                    "user_id": audit.user_id,
                    "user_name": user_name,
                    "ip_address": audit.ip_address,
                    "created_at": audit.created_at,
                }
            )

        # ====================================================
        # NOTIFICATIONS
        # ====================================================

        notifications = (
            Notification.objects
            .filter(
                recipient=request.user
            )
            .order_by("-created_at")[:5]
        )

        notification_data = []

        for notification in notifications:

            notification_data.append(
                {
                    "id": notification.id,
                    "title": notification.title,
                    "message": notification.message,
                    "notification_type": (
                        notification.notification_type
                    ),
                    "notification_type_display": (
                        notification.get_notification_type_display()
                    ),
                    "link": notification.link,
                    "is_read": notification.is_read,
                    "read_at": notification.read_at,
                    "created_at": notification.created_at,
                }
            )

        # ====================================================
        # RESPONSE
        # ====================================================

        return Response(
            {
                "school": {
                    "id": school.id,
                    "name": school.name,
                    "code": school.code,
                    "logo": (
                        request.build_absolute_uri(
                            school.logo.url
                        )
                        if school.logo
                        else None
                    ),
                },

                # =================================================
                # STATISTICS
                # =================================================

                "statistics": {
                    "students": total_students,
                    "active_students": active_students,

                    "teachers": total_teachers,
                    "active_teachers": active_teachers,

                    "parents": total_parents,
                    "active_parents": active_parents,

                    "staff": total_staff,
                    "active_staff": active_staff,

                    "current_enrollments": (
                        current_enrollments
                    ),

                    "classes": total_classes,
                    "active_classes": active_classes,

                    "subjects": total_subjects,
                    "active_subjects": active_subjects,
                },

                # =================================================
                # FINANCE
                # =================================================

                "finance": {
                    "total_invoiced": total_invoiced,
                    "total_collected": total_collected,
                    "total_outstanding": (
                        total_outstanding
                    ),
                    "total_expenses": total_expenses,
                    "collection_rate": round(
                        collection_rate,
                        2,
                    ),
                },

                # =================================================
                # ACADEMIC
                # =================================================

                "academic": {
                    "current_session": (
                        {
                            "id": current_session.id,
                            "name": current_session.name,
                            "start_date": (
                                current_session.start_date
                            ),
                            "end_date": (
                                current_session.end_date
                            ),
                        }
                        if current_session
                        else None
                    ),

                    "current_term": (
                        {
                            "id": current_term.id,
                            "name": current_term.name,
                            "name_display": (
                                current_term.get_name_display()
                            ),
                            "start_date": (
                                current_term.start_date
                            ),
                            "end_date": (
                                current_term.end_date
                            ),
                        }
                        if current_term
                        else None
                    ),
                },

                # =================================================
                # RECENT ACTIVITIES
                # =================================================

                "recent_activities": (
                    recent_activities
                ),

                # =================================================
                # NOTIFICATIONS
                # =================================================

                "notices": notification_data,
            },

            status=status.HTTP_200_OK,
        )


# ============================================================
# SUPER ADMIN - CREATE SCHOOL ADMIN
# ============================================================

class SuperAdminCreateSchoolAdminView(
    generics.CreateAPIView
):
    permission_classes = [IsSuperAdmin]
    serializer_class = (
        SuperAdminCreateSchoolAdminSerializer
    )

    def create(
        self,
        request,
        *args,
        **kwargs,
    ):
        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = serializer.validated_data

        try:
            result = create_school_admin(
                school=data["school"],
                username=data["username"],
                first_name=data["first_name"],
                last_name=data["last_name"],
                email=data.get(
                    "email",
                    "",
                ),
                phone_number=data.get(
                    "phone_number",
                    "",
                ),
            )

        except ValueError as exc:
            raise ValidationError(
                {
                    "detail": str(exc)
                }
            )

        except Exception:
            traceback.print_exc()

            raise ValidationError(
                {
                    "detail": (
                        "The School Admin could not "
                        "be created. Please check "
                        "the supplied information "
                        "and try again."
                    )
                }
            )

        user = result["user"]

        return Response(
            {
                "message": (
                    "School Admin created successfully."
                ),

                "school": {
                    "id": user.school_id,
                    "name": (
                        user.school.name
                        if user.school
                        else None
                    ),
                },

                "user": SchoolUserSerializer(
                    user
                ).data,

                "credentials": {
                    "username": result[
                        "username"
                    ],
                    "temporary_password": result[
                        "temporary_password"
                    ],
                },
            },
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# SUPER ADMIN - SCHOOL ADMIN LIST
# ============================================================

class SuperAdminSchoolAdminListView(
    generics.ListAPIView
):
    permission_classes = [IsSuperAdmin]
    serializer_class = SchoolUserSerializer

    def get_queryset(self):
        queryset = (
            User.objects
            .filter(
                role=User.Role.SCHOOL_ADMIN
            )
            .select_related("school")
            .order_by(
                "first_name",
                "last_name",
                "username",
            )
        )

        search = self.request.query_params.get(
            "search",
            "",
        ).strip()

        is_active = self.request.query_params.get(
            "is_active"
        )

        if search:
            queryset = queryset.filter(
                Q(
                    username__icontains=search
                )
                | Q(
                    first_name__icontains=search
                )
                | Q(
                    last_name__icontains=search
                )
                | Q(
                    email__icontains=search
                )
                | Q(
                    phone_number__icontains=search
                )
                | Q(
                    school__name__icontains=search
                )
            )

        if is_active in {
            "true",
            "false",
        }:
            queryset = queryset.filter(
                is_active=(
                    is_active == "true"
                )
            )

        return queryset


# ============================================================
# SUPER ADMIN - SCHOOL ADMIN DETAIL
# ============================================================

class SuperAdminSchoolAdminDetailView(
    generics.RetrieveAPIView
):
    permission_classes = [IsSuperAdmin]
    serializer_class = SchoolUserSerializer

    def get_queryset(self):
        return (
            User.objects
            .filter(
                role=User.Role.SCHOOL_ADMIN
            )
            .select_related("school")
        )


# ============================================================
# SUPER ADMIN - EDIT SCHOOL ADMIN
# ============================================================

class SuperAdminEditSchoolAdminView(
    generics.UpdateAPIView
):
    permission_classes = [IsSuperAdmin]
    serializer_class = (
        SuperAdminEditSchoolAdminSerializer
    )

    def get_queryset(self):
        return (
            User.objects
            .filter(
                role=User.Role.SCHOOL_ADMIN
            )
            .select_related("school")
        )

    def update(
        self,
        request,
        *args,
        **kwargs,
    ):
        partial = kwargs.pop(
            "partial",
            False,
        )

        instance = self.get_object()

        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(
            raise_exception=True
        )

        self.perform_update(
            serializer
        )

        return Response(
            {
                "message": (
                    "School Admin updated successfully."
                ),
                "user": SchoolUserSerializer(
                    instance
                ).data,
            },
            status=status.HTTP_200_OK,
        )