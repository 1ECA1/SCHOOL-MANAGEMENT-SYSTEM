


import re

from audit.utils import log_audit

from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q, Max
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.crypto import get_random_string

from rest_framework.views import APIView
from rest_framework import generics, status, serializers
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


from academics.models import (
    ClassSubject,
    Subject,
    Term,
    AcademicSession,
    ClassLevel,
    School,
)

from rest_framework import serializers
from teachers.models import TeacherSubject

from .models import (
    ParentGuardian,
    Student,
    StudentEnrollment,
    StudentSubjectEnrollment,
    OptionalSubjectSelectionSetting,
    PromotionRecord,
)

from .serializers import (
    ParentGuardianSerializer,
    StudentSerializer,
    StudentEnrollmentSerializer,
    StudentSubjectEnrollmentSerializer,
    StudentSubjectOverviewSerializer,
    OptionalSubjectSelectionSettingSerializer,
    PromotionRecordSerializer,
    GraduationRecordSerializer,
)

from .account_serializers import (
    StudentAccountSerializer,
    CreateStudentAccountSerializer,
    ResetStudentPasswordSerializer,
)

User = get_user_model()

# =========================================================
# PARENT / GUARDIAN
# =========================================================

class ParentGuardianListCreateView(generics.ListCreateAPIView):
    queryset = ParentGuardian.objects.all()
    serializer_class = ParentGuardianSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        self.perform_create(serializer)

        headers = self.get_success_headers(
            serializer.data
        )

        response_data = serializer.data.copy()

        credentials = getattr(
            self,
            "_temporary_credentials",
            None,
        )

        if credentials:
            response_data["login_credentials"] = credentials

        return Response(
            response_data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    # @transaction.atomic
    # def perform_create(self, serializer):

    #     # =====================================================
    #     # 1. CREATE PARENT / GUARDIAN PROFILE
    #     # =====================================================

    #     parent = serializer.save()

    #     # =====================================================
    #     # 2. IF ACCOUNT ALREADY EXISTS, DO NOTHING
    #     # =====================================================

    #     if parent.user:
    #         return

    #     # =====================================================
    #     # 3. GENERATE USERNAME
    #     # =====================================================
    #     #
    #     # Parent does not currently have an employee/admission
    #     # number, so we generate a unique username.
    #     #
    #     # Example:
    #     # PARENT001
    #     # PARENT002
    #     # PARENT003
    #     #
    #     # =====================================================

    #     prefix = "PARENT"

    #     last_user = (
    #         User.objects
    #         .filter(
    #             username__startswith=prefix
    #         )
    #         .order_by("-id")
    #         .first()
    #     )

    #     if last_user:
    #         match = re.search(
    #             r"(\d+)$",
    #             last_user.username,
    #         )

    #         if match:
    #             next_number = (
    #                 int(match.group(1)) + 1
    #             )
    #         else:
    #             next_number = 1

    #     else:
    #         next_number = 1

    #     username = (
    #         f"{prefix}"
    #         f"{next_number:03d}"
    #     )

    #     while User.objects.filter(
    #         username=username
    #     ).exists():

    #         next_number += 1

    #         username = (
    #             f"{prefix}"
    #             f"{next_number:03d}"
    #         )

    #     # =====================================================
    #     # 4. DETERMINE USER EMAIL
    #     # =====================================================

    #     if parent.email:

    #         email = (
    #             parent.email
    #             .strip()
    #             .lower()
    #         )

    #         if User.objects.filter(
    #             email=email
    #         ).exists():

    #             raise serializers.ValidationError({
    #                 "email": (
    #                     "This email address is already "
    #                     "being used by another user."
    #                 )
    #             })

    #     else:

    #         email = (
    #             f"{username.lower()}"
    #             "@parent.edumanage.local"
    #         )

    #         counter = 1

    #         while User.objects.filter(
    #             email=email
    #         ).exists():

    #             email = (
    #                 f"{username.lower()}"
    #                 f".{counter}"
    #                 "@parent.edumanage.local"
    #             )

    #             counter += 1

    #     # =====================================================
    #     # 5. GENERATE TEMPORARY PASSWORD
    #     # =====================================================

    #     temporary_password = get_random_string(
    #         length=10
    #     )

    #     # =====================================================
    #     # 6. CREATE CENTRAL USER ACCOUNT
    #     # =====================================================

    #     user = User.objects.create_user(
    #         username=username,
    #         email=email,
    #         password=temporary_password,
    #         role=User.Role.PARENT,
    #         first_name=parent.full_name,
    #         last_name="",
    #         phone_number=(
    #             parent.phone_number or ""
    #         ),
    #     )

    #     # =====================================================
    #     # 7. LINK USER TO PARENT PROFILE
    #     # =====================================================

    #     parent.user = user

    #     parent.save(
    #         update_fields=[
    #             "user"
    #         ]
    #     )

    #     # =====================================================
    #     # 8. RETURN TEMPORARY LOGIN DETAILS
    #     # =====================================================

    #     self._temporary_credentials = {
    #         "username": username,
    #         "password": temporary_password,
    #     }


@transaction.atomic
def perform_create(self, serializer):
    user = self.request.user

    # =========================================================
    # SCHOOL ADMIN
    # =========================================================
    if user.role == User.Role.SCHOOL_ADMIN:
        school = user.school

        if not school:
            raise serializers.ValidationError({
                "school": "Your account is not assigned to a school."
            })

        student = serializer.save(school=school)

    # =========================================================
    # SUPER ADMIN
    # =========================================================
    elif user.role == User.Role.SUPER_ADMIN:
        school_id = (
            self.request.data.get("school")
            or self.request.data.get("school_id")
        )

        if not school_id:
            raise serializers.ValidationError({
                "school": "Please select a school for this student."
            })

        try:
            school_id = int(school_id)
        except (TypeError, ValueError):
            raise serializers.ValidationError({
                "school": "The selected school is invalid."
            })

        try:
            school = School.objects.get(id=school_id)
        except School.DoesNotExist:
            raise serializers.ValidationError({
                "school": "The selected school does not exist."
            })

        student = serializer.save(school=school)

    # =========================================================
    # SCHOOL-SCOPED STAFF
    # =========================================================
    elif user.role in [
        User.Role.EXAM_OFFICER,
        User.Role.ACCOUNTANT,
        User.Role.ADMISSION_OFFICER,
        User.Role.LIBRARIAN,
        User.Role.COUNSELOR,
        User.Role.HOSTEL_MANAGER,
        User.Role.TRANSPORT_MANAGER,
    ]:
        profile_names = {
            User.Role.EXAM_OFFICER: "exam_officer_profile",
            User.Role.ACCOUNTANT: "accountant_profile",
            User.Role.ADMISSION_OFFICER: "admission_officer_profile",
            User.Role.LIBRARIAN: "librarian_profile",
            User.Role.COUNSELOR: "counselor_profile",
            User.Role.HOSTEL_MANAGER: "hostel_manager_profile",
            User.Role.TRANSPORT_MANAGER: "transport_manager_profile",
        }

        profile = getattr(
            user,
            profile_names[user.role],
            None,
        )

        school = getattr(profile, "school", None)

        if not school:
            raise serializers.ValidationError({
                "school": "Your account is not assigned to a school."
            })

        student = serializer.save(school=school)

    # =========================================================
    # OTHER ROLES
    # =========================================================
    else:
        raise serializers.ValidationError({
            "detail": "You do not have permission to create students."
        })

    # =========================================================
    # STUDENT USER ACCOUNT
    # =========================================================

    if student.user:
        return

    username = student.admission_number.strip()

    if User.objects.filter(username=username).exists():
        raise serializers.ValidationError({
            "admission_number":
                "A login account already exists with this admission number."
        })

    if student.email:
        email = student.email.strip().lower()

        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({
                "email":
                    "This email address is already being used by another user."
            })

    else:
        email = f"{username.lower()}@student.edumanage.local"

        counter = 1

        while User.objects.filter(email=email).exists():
            email = (
                f"{username.lower()}.{counter}"
                "@student.edumanage.local"
            )
            counter += 1

    temporary_password = get_random_string(length=10)

    student_user = User.objects.create_user(
        username=username,
        email=email,
        password=temporary_password,
        role=User.Role.STUDENT,
        first_name=student.first_name,
        last_name=student.last_name,
        phone_number=student.phone_number or "",
        school=student.school,
    )

    student.user = student_user

    student.save(update_fields=["user"])

    # =========================================================
    # AUDIT LOG
    # =========================================================

    log_audit(
        request=self.request,
        action="CREATE",
        model_name="Student",
        object_id=student.id,
        object_repr=(
            f"{student.full_name} - "
            f"{student.admission_number}"
        ),
        description=(
            f"Student '{student.full_name}' "
            f"({student.admission_number}) was created."
        ),
    )

    # =========================================================
    # TEMPORARY LOGIN CREDENTIALS
    # =========================================================

    self._temporary_credentials = {
        "username": username,
        "password": temporary_password,
    }

class ParentGuardianDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = ParentGuardian.objects.all()
    serializer_class = ParentGuardianSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [
        MultiPartParser,
        FormParser,
    ]


# =========================================================
# STUDENT PARENT / GUARDIAN
# =========================================================

class StudentParentListView(generics.ListAPIView):
    serializer_class = ParentGuardianSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        student_id = self.kwargs["student_id"]

        return ParentGuardian.objects.filter(
            students__id=student_id
        ).distinct()


class StudentParentAddView(generics.CreateAPIView):
    serializer_class = ParentGuardianSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        student = get_object_or_404(
            Student,
            id=kwargs["student_id"],
        )

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        phone = (
            serializer.validated_data.get(
                "phone_number"
            )
            or ""
        ).strip()

        email = (
            serializer.validated_data.get(
                "email"
            )
            or ""
        ).strip().lower()

        parent = None

        # =====================================================
        # FIND EXISTING PARENT BY PHONE
        # =====================================================

        if phone:
            parent = ParentGuardian.objects.filter(
                school=student.school,
                phone_number=phone,
            ).first()

        # =====================================================
        # IF NOT FOUND, FIND EXISTING PARENT BY EMAIL
        # =====================================================

        if parent is None and email:
            parent = ParentGuardian.objects.filter(
                school=student.school,
                email__iexact=email,
            ).first()

        parent_created = False
        login_credentials = None

        # =====================================================
        # CREATE PARENT PROFILE IF IT DOES NOT EXIST
        # =====================================================

        if parent is None:
            parent = serializer.save(
                school=student.school
            )

            parent_created = True

        # =====================================================
        # CREATE CENTRAL USER ACCOUNT IF NEEDED
        # =====================================================

        if parent.user is None:

            # -------------------------------------------------
            # GENERATE NEXT PARENT USERNAME
            # Example: PARENT001, PARENT002, PARENT003
            # -------------------------------------------------

            prefix = "PARENT"

            last_user = (
                User.objects
                .filter(
                    username__startswith=prefix
                )
                .order_by("-id")
                .first()
            )

            next_number = 1

            if last_user:
                match = re.search(
                    rf"{prefix}(\d+)$",
                    last_user.username,
                )

                if match:
                    next_number = (
                        int(match.group(1)) + 1
                    )

            username = (
                f"{prefix}{next_number:03d}"
            )

            # Make absolutely sure the username is unique
            while User.objects.filter(
                username=username
            ).exists():
                next_number += 1

                username = (
                    f"{prefix}{next_number:03d}"
                )

            # -------------------------------------------------
            # ACCOUNT EMAIL
            # -------------------------------------------------

            account_email = (
                parent.email.strip().lower()
                if parent.email
                else ""
            )

            # If parent has an email, it must be unique
            if account_email:
                if User.objects.filter(
                    email__iexact=account_email
                ).exists():
                    raise serializers.ValidationError(
                        {
                            "email": (
                                "This email is already "
                                "being used by another user."
                            )
                        }
                    )

            # -------------------------------------------------
            # FALLBACK EMAIL
            # -------------------------------------------------

            if not account_email:
                account_email = (
                    f"{username.lower()}"
                    "@parent.edumanage.local"
                )

                counter = 1

                while User.objects.filter(
                    email=account_email
                ).exists():
                    account_email = (
                        f"{username.lower()}"
                        f"{counter}"
                        "@parent.edumanage.local"
                    )

                    counter += 1

            # -------------------------------------------------
            # GENERATE TEMPORARY PASSWORD
            # -------------------------------------------------

            temporary_password = get_random_string(
                length=10
            )

            # -------------------------------------------------
            # CREATE CENTRAL USER
            # -------------------------------------------------

            user = User.objects.create_user(
                username=username,
                email=account_email,
                password=temporary_password,
                role=User.Role.PARENT,
                first_name=parent.full_name,
                last_name="",
                phone_number=(
                    parent.phone_number or ""
                ),
            )

            # -------------------------------------------------
            # CONNECT PARENT PROFILE TO USER
            # -------------------------------------------------

            parent.user = user

            parent.save(
                update_fields=["user"]
            )

            # -------------------------------------------------
            # RETURN TEMPORARY LOGIN CREDENTIALS
            # -------------------------------------------------

            login_credentials = {
                "username": username,
                "password": temporary_password,
            }

        # =====================================================
        # CHECK WHETHER PARENT IS ALREADY LINKED
        # =====================================================

        already_linked = student.parents.filter(
            id=parent.id
        ).exists()

        # =====================================================
        # LINK PARENT TO STUDENT
        # =====================================================

        if not already_linked:
            student.parents.add(parent)

        # =====================================================
        # RETURN UPDATED PARENT
        # =====================================================

        output_serializer = self.get_serializer(
            parent
        )

        response_data = output_serializer.data.copy()

        # Add credentials only when a new User account
        # was created during this request.
        if login_credentials:
            response_data["login_credentials"] = (
                login_credentials
            )

        # =====================================================
        # RESPONSE STATUS
        # =====================================================

        if parent_created:
            response_status = (
                status.HTTP_201_CREATED
            )
        else:
            response_status = (
                status.HTTP_200_OK
            )

        return Response(
            response_data,
            status=response_status,
        )

class StudentParentRemoveView(generics.DestroyAPIView):
    serializer_class = ParentGuardianSerializer
    permission_classes = [IsAuthenticated]

    def delete(
        self,
        request,
        student_id,
        parent_id,
    ):
        try:
            student = Student.objects.get(
                id=student_id
            )

            parent = ParentGuardian.objects.get(
                id=parent_id
            )

            student.parents.remove(parent)

            log_audit(
                request=request,
                action="UPDATE",
                model_name="Student",
                object_id=student.id,
                object_repr=(
                    f"{student.full_name} - "
                    f"{student.admission_number}"
                ),
                description=(
                    f"Parent/Guardian '{parent.full_name}' "
                    f"was removed from student "
                    f"'{student.full_name}' "
                    f"({student.admission_number})."
                ),
            )

            return Response(
                status=status.HTTP_204_NO_CONTENT
            )

        except Student.DoesNotExist:
            return Response(
                {
                    "detail": "Student not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except ParentGuardian.DoesNotExist:
            return Response(
                {
                    "detail": (
                        "Parent/Guardian not found."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

# =========================================================
# STUDENTS
# =========================================================

class StudentListCreateView(generics.ListCreateAPIView):
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        queryset = (
            Student.objects
            .select_related(
                "school",
                "department",
                "graduation_session",
            )
            .prefetch_related(
                "parents",
                "enrollments__class_level",
                "enrollments__academic_session",
                "enrollments__term",
                "promotion_records__from_class",
                "promotion_records__to_class",
                "promotion_records__from_session",
                "promotion_records__to_session",
                "promotion_records__from_term",
                "promotion_records__to_term",
            )
            .distinct()
        )

        user = self.request.user

        # =====================================================
        # SCHOOL ADMIN
        # =====================================================
        if user.role == User.Role.SCHOOL_ADMIN:
            queryset = queryset.filter(
                school_id=user.school_id
            )

        # =====================================================
        # EXAM OFFICER
        # =====================================================
        exam_officer_profile = getattr(
            user,
            "exam_officer_profile",
            None,
        )

        if exam_officer_profile:
            queryset = queryset.filter(
                school=exam_officer_profile.school
            )

        # =====================================================
        # SEARCH
        # =====================================================
        search = self.request.query_params.get(
            "search",
            ""
        ).strip()

        if search:
            queryset = queryset.filter(
                Q(admission_number__icontains=search)
                | Q(first_name__icontains=search)
                | Q(middle_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(
                    enrollments__class_level__name__icontains=search
                )
            ).distinct()

        return queryset

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        self.perform_create(serializer)

        headers = self.get_success_headers(
            serializer.data
        )

        response_data = serializer.data.copy()

        credentials = getattr(
            self,
            "_temporary_credentials",
            None,
        )

        if credentials:
            response_data["login_credentials"] = credentials

        return Response(
            response_data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    @transaction.atomic
    def perform_create(self, serializer):
        user = self.request.user

        # =========================================================
        # DETERMINE THE SCHOOL FIRST
        # =========================================================

        school = None

        # ---------------------------------------------------------
        # SUPER ADMIN
        # Super Admin must select the school from the form.
        # ---------------------------------------------------------
        if user.role == User.Role.SUPER_ADMIN:

            school_id = (
                self.request.data.get("school")
                or self.request.data.get("school_id")
            )

            if not school_id:
                raise serializers.ValidationError({
                    "school": "Please select a school for this student."
                })

            try:
                school = School.objects.get(pk=int(school_id))
            except (TypeError, ValueError):
                raise serializers.ValidationError({
                    "school": "The selected school is invalid."
                })
            except School.DoesNotExist:
                raise serializers.ValidationError({
                    "school": "The selected school does not exist."
                })

        # ---------------------------------------------------------
        # SCHOOL ADMIN
        # ---------------------------------------------------------
        elif user.role == User.Role.SCHOOL_ADMIN:

            school = user.school

            if not school:
                raise serializers.ValidationError({
                    "school": "Your account is not assigned to a school."
                })

        # ---------------------------------------------------------
        # OTHER SCHOOL-SCOPED STAFF
        # ---------------------------------------------------------
        elif user.role in [
            User.Role.EXAM_OFFICER,
            User.Role.ACCOUNTANT,
            User.Role.ADMISSION_OFFICER,
            User.Role.LIBRARIAN,
            User.Role.COUNSELOR,
            User.Role.HOSTEL_MANAGER,
            User.Role.TRANSPORT_MANAGER,
        ]:

            profile_names = {
                User.Role.EXAM_OFFICER: "exam_officer_profile",
                User.Role.ACCOUNTANT: "accountant_profile",
                User.Role.ADMISSION_OFFICER: "admission_officer_profile",
                User.Role.LIBRARIAN: "librarian_profile",
                User.Role.COUNSELOR: "counselor_profile",
                User.Role.HOSTEL_MANAGER: "hostel_manager_profile",
                User.Role.TRANSPORT_MANAGER: "transport_manager_profile",
            }

            profile = getattr(
                user,
                profile_names[user.role],
                None,
            )

            school = getattr(profile, "school", None)

            if not school:
                raise serializers.ValidationError({
                    "school": "Your account is not assigned to a school."
                })

        # ---------------------------------------------------------
        # EVERY OTHER ROLE
        # ---------------------------------------------------------
        else:
            raise serializers.ValidationError({
                "detail": "You do not have permission to create students."
            })

        # =========================================================
        # CREATE STUDENT
        # =========================================================

        # IMPORTANT:
        # school is read_only in StudentSerializer, so it must be
        # explicitly supplied here.
        student = serializer.save(school=school)

        # =========================================================
        # IF STUDENT ALREADY HAS A USER ACCOUNT, STOP HERE
        # =========================================================

        if student.user:
            return

        # =========================================================
        # CREATE STUDENT LOGIN ACCOUNT
        # =========================================================

        username = student.admission_number.strip()

        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({
                "admission_number":
                    "A login account already exists with this admission number."
            })

        # ---------------------------------------------------------
        # EMAIL
        # ---------------------------------------------------------

        if student.email:
            email = student.email.strip().lower()

            if User.objects.filter(email=email).exists():
                raise serializers.ValidationError({
                    "email":
                        "This email address is already being used by another user."
                })

        else:
            email = f"{username.lower()}@student.edumanage.local"

            counter = 1

            while User.objects.filter(email=email).exists():
                email = (
                    f"{username.lower()}.{counter}"
                    "@student.edumanage.local"
                )
                counter += 1

        # ---------------------------------------------------------
        # PASSWORD
        # ---------------------------------------------------------

        temporary_password = get_random_string(length=10)

        # ---------------------------------------------------------
        # CREATE USER
        # ---------------------------------------------------------

        student_user = User.objects.create_user(
            username=username,
            email=email,
            password=temporary_password,
            role=User.Role.STUDENT,
            first_name=student.first_name,
            last_name=student.last_name,
            phone_number=student.phone_number or "",
            school=student.school,
        )

        # ---------------------------------------------------------
        # LINK USER TO STUDENT
        # ---------------------------------------------------------

        student.user = student_user

        student.save(update_fields=["user"])

        # =========================================================
        # AUDIT LOG
        # =========================================================

        log_audit(
            request=self.request,
            action="CREATE",
            model_name="Student",
            object_id=student.id,
            object_repr=(
                f"{student.full_name} - "
                f"{student.admission_number}"
            ),
            description=(
                f"Student '{student.full_name}' "
                f"({student.admission_number}) was created."
            ),
        )

        # =========================================================
        # TEMPORARY LOGIN CREDENTIALS
        # =========================================================

        self._temporary_credentials = {
            "username": username,
            "password": temporary_password,
        }

    
# =========================================================
# STUDENT ACCOUNTS
# =========================================================
#
# Student academic record:
#     Student
#
# Student login account:
#     accounts.User
#
# Relationship:
#     Student.user
#
# We DO NOT create another StudentAccount model.
#
# =========================================================


# ============================================================
# STUDENT ACCOUNT MANAGEMENT
# ============================================================

STUDENT_ACCOUNT_MANAGEMENT_ROLES = {
    User.Role.SUPER_ADMIN,
    User.Role.SCHOOL_ADMIN,
}


def get_student_account_scope(request):
    """
    Returns the students that the current administrator is
    allowed to manage.

    SUPER_ADMIN:
        Can manage students from every school.

    SCHOOL_ADMIN:
        Can only manage students belonging to their school.

    Everyone else:
        No access.
    """

    user = request.user

    if user.role == User.Role.SUPER_ADMIN:
        return Student.objects.all()

    if user.role == User.Role.SCHOOL_ADMIN:

        if not user.school_id:
            return Student.objects.none()

        return Student.objects.filter(
            school_id=user.school_id
        )

    return Student.objects.none()


def generate_student_temporary_password():
    """
    Generates the temporary password that is given to the
    administrator after account creation.

    The password is NOT stored as plaintext in the database.
    Django stores the hashed version through set_password().
    """

    return get_random_string(
        length=10
    )


# ============================================================
# STUDENT ACCOUNT LIST
# ============================================================

class StudentAccountListView(generics.ListAPIView):
    """
    List students together with their account status.

    Supported query parameters:

        ?search=grace

        ?account_status=HAS_ACCOUNT
        ?account_status=NO_ACCOUNT
        ?account_status=ACTIVE
        ?account_status=INACTIVE
    """

    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = StudentAccountSerializer

    def get_queryset(self):

        user = self.request.user

        if user.role not in STUDENT_ACCOUNT_MANAGEMENT_ROLES:
            return Student.objects.none()

        queryset = (
            get_student_account_scope(self.request)
            .select_related(
                "school",
                "user",
            )
            .prefetch_related(
                "enrollments__class_level",
                "enrollments__academic_session",
            )
            .order_by(
                "last_name",
                "first_name",
                "id",
            )
        )

        # ----------------------------------------------------
        # SEARCH
        # ----------------------------------------------------

        search = self.request.query_params.get(
            "search",
            ""
        ).strip()

        if search:

            queryset = queryset.filter(
                Q(admission_number__icontains=search)
                | Q(first_name__icontains=search)
                | Q(middle_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(email__icontains=search)
                | Q(phone_number__icontains=search)
                | Q(user__username__icontains=search)
                | Q(user__email__icontains=search)
            )

        # =====================================================
        # SCHOOL FILTER
        # =====================================================
        #
        # ?school=2
        #
        # SUPER_ADMIN can use this to filter students by school.
        # School-scoped users remain locked to their own school.
        #
        # =====================================================

        school_id = self.request.query_params.get(
            "school"
        )

        if school_id:
            queryset = queryset.filter(
                school_id=school_id
            )

        # =====================================================
        # CLASS FILTER
        # =====================================================
        #
        # ?class_level=22
        #
        # Uses the student's current enrollment.
        #
        # =====================================================

        class_level_id = self.request.query_params.get(
            "class_level"
        )

        if class_level_id:
            queryset = queryset.filter(
                enrollments__class_level_id=class_level_id,
                enrollments__is_current=True,
            ).distinct()

        # =====================================================
        # CURRENT ENROLLMENT FILTER
        # =====================================================
        #
        # Optional session/term filtering.
        #
        # ?academic_session=2
        # ?term=11
        #
        # These are useful for the Attendance page because
        # attendance belongs to a particular session/term.
        #
        # =====================================================

        academic_session_id = self.request.query_params.get(
            "academic_session"
        )

        if academic_session_id:
            queryset = queryset.filter(
                enrollments__academic_session_id=academic_session_id,
                enrollments__is_current=True,
            ).distinct()

        term_id = self.request.query_params.get(
            "term"
        )

        if term_id:
            queryset = queryset.filter(
                enrollments__term_id=term_id,
                enrollments__is_current=True,
            ).distinct()

        return queryset

        # ----------------------------------------------------
        # ACCOUNT STATUS
        # ----------------------------------------------------

        account_status = self.request.query_params.get(
            "account_status",
            ""
        ).strip().upper()

        if account_status == "HAS_ACCOUNT":

            queryset = queryset.filter(
                user__isnull=False
            )

        elif account_status == "NO_ACCOUNT":

            queryset = queryset.filter(
                user__isnull=True
            )

        elif account_status == "ACTIVE":

            queryset = queryset.filter(
                user__isnull=False,
                user__is_active=True,
            )

        elif account_status == "INACTIVE":

            queryset = queryset.filter(
                user__isnull=False,
                user__is_active=False,
            )

        return queryset


# ============================================================
# CREATE STUDENT ACCOUNT
# ============================================================

class StudentAccountCreateView(APIView):
    """
    Create a login account for an existing active student.

    IMPORTANT:

    The frontend does NOT provide a password.

    The backend automatically generates a temporary password
    and returns it once in the response.
    """

    permission_classes = [
        IsAuthenticated
    ]

    @transaction.atomic
    def post(self, request):

        # ----------------------------------------------------
        # PERMISSION
        # ----------------------------------------------------

        if request.user.role not in STUDENT_ACCOUNT_MANAGEMENT_ROLES:

            return Response(
                {
                    "detail": (
                        "You do not have permission to "
                        "manage student accounts."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # ----------------------------------------------------
        # VALIDATE REQUEST
        # ----------------------------------------------------

        serializer = CreateStudentAccountSerializer(
            data=request.data,
            context={
                "request": request,
            },
        )

        serializer.is_valid(
            raise_exception=True
        )

        student = serializer.validated_data["student"]

        # ----------------------------------------------------
        # EXTRA SCOPE CHECK
        # ----------------------------------------------------

        scope = get_student_account_scope(request)

        if not scope.filter(
            pk=student.pk
        ).exists():

            return Response(
                {
                    "detail": (
                        "You cannot manage this student's "
                        "account."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # ----------------------------------------------------
        # CHECK ACCOUNT
        # ----------------------------------------------------

        if student.user_id:

            return Response(
                {
                    "detail": (
                        "This student already has a "
                        "login account."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # CHECK STUDENT STATUS
        # ----------------------------------------------------

        if student.status != Student.Status.ACTIVE:

            return Response(
                {
                    "detail": (
                        "A login account can only be created "
                        "for an active student."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # USERNAME
        # ----------------------------------------------------

        username = student.admission_number.strip()

        if not username:

            return Response(
                {
                    "detail": (
                        "This student does not have a valid "
                        "admission number."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # CHECK USERNAME
        # ----------------------------------------------------

        if User.objects.filter(
            username__iexact=username
        ).exists():

            return Response(
                {
                    "detail": (
                        "A user account with this admission "
                        "number already exists."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # EMAIL
        # ----------------------------------------------------

        submitted_email = serializer.validated_data.get(
            "email"
        )

        if submitted_email:

            account_email = submitted_email.strip().lower()

        elif student.email:

            account_email = student.email.strip().lower()

        else:

            account_email = (
                f"{username.lower()}@student.edumanage.local"
            )

        # ----------------------------------------------------
        # CHECK EMAIL
        # ----------------------------------------------------

        if User.objects.filter(
            email__iexact=account_email
        ).exists():

            return Response(
                {
                    "detail": (
                        "The email address that would be "
                        "assigned to this account is already "
                        "being used by another user."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ----------------------------------------------------
        # GENERATE TEMPORARY PASSWORD
        # ----------------------------------------------------

        temporary_password = (
            generate_student_temporary_password()
        )

        # ----------------------------------------------------
        # CREATE USER
        # ----------------------------------------------------

        user = User(
            username=username,
            email=account_email,
            first_name=student.first_name,
            last_name=student.last_name,
            role=User.Role.STUDENT,
            school=student.school,
            phone_number=student.phone_number or "",
            is_active=True,
        )

        user.set_password(
            temporary_password
        )

        user.save()

        # ----------------------------------------------------
        # CONNECT USER TO STUDENT
        # ----------------------------------------------------

        student.user = user
        student.save(
            update_fields=[
                "user",
            ]
        )

        log_audit(
            request=request,
            action="CREATE",
            model_name="User",
            object_id=user.id,
            object_repr=f"{user.username} - Student",
            description=(
                f"Student account was created for "
                f"'{student.full_name}' ({student.admission_number})."
            ),
        )

        # ----------------------------------------------------
        # RESPONSE DATA
        # ----------------------------------------------------

        account_data = StudentAccountSerializer(
            student,
            context={
                "request": request,
            },
        ).data

        return Response(
            {
                "message": (
                    "Student login account created successfully."
                ),

                "account": account_data,

                # IMPORTANT:
                # This is the only response containing the
                # temporary password.
                "credentials": {
                    "username": username,
                    "temporary_password": temporary_password,
                },
            },
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# STUDENT ACCOUNT DETAIL 111
# ============================================================

class StudentAccountDetailView(APIView):
    """
    Retrieve one student's account information.

    GET:
        /api/students/accounts/<student_id>/

    SUPER_ADMIN:
        Can view students from any school.

    SCHOOL_ADMIN:
        Can only view students from their own school.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):

        # =====================================================
        # PERMISSION
        # =====================================================

        if request.user.role not in STUDENT_ACCOUNT_MANAGEMENT_ROLES:
            return Response(
                {
                    "detail": (
                        "You do not have permission to manage "
                        "student accounts."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # =====================================================
        # SCHOOL-SCOPED QUERYSET
        # =====================================================

        queryset = (
            get_student_account_scope(request)
            .select_related(
                "school",
                "user",
            )
            .prefetch_related(
                "enrollments__class_level",
                "enrollments__academic_session",
            )
        )

        # =====================================================
        # GET STUDENT
        # =====================================================

        student = queryset.filter(
            id=student_id
        ).first()

        if not student:
            return Response(
                {
                    "detail": "Student not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # =====================================================
        # SERIALIZE
        # =====================================================

        serializer = StudentAccountSerializer(student)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


# ============================================================
# ACTIVATE STUDENT ACCOUNT
# ============================================================

class StudentAccountActivateView(APIView):
    """
    Activate the student's login account.

    IMPORTANT:
    This does NOT change Student.status.
    """

    permission_classes = [
        IsAuthenticated
    ]

    @transaction.atomic
    def post(self, request, student_id):

        if request.user.role not in STUDENT_ACCOUNT_MANAGEMENT_ROLES:

            return Response(
                {
                    "detail": (
                        "You do not have permission to "
                        "manage student accounts."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        student = get_object_or_404(
            get_student_account_scope(request)
            .select_related(
                "school",
                "user",
            ),
            pk=student_id,
        )

        if not student.user_id:

            return Response(
                {
                    "detail": (
                        "This student does not have a "
                        "login account."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        student.user.is_active = True

        student.user.save(
            update_fields=[
                "is_active",
            ]
        )

        log_audit(
            request=request,
            action="UPDATE",
            model_name="User",
            object_id=user.id,
            object_repr=f"{user.username} - Student",
            description=(
                f"Student account for '{student.full_name}' "
                f"({student.admission_number}) was activated."
            ),
        )



        return Response(
            {
                "message": (
                    "Student account activated successfully."
                ),
                "account": StudentAccountSerializer(
                    student,
                    context={
                        "request": request,
                    },
                ).data,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# DEACTIVATE STUDENT ACCOUNT
# ============================================================

class StudentAccountDeactivateView(APIView):
    """
    Deactivate the student's login account.

    IMPORTANT:
    This does NOT change Student.status.
    """

    permission_classes = [
        IsAuthenticated
    ]

    @transaction.atomic
    def post(self, request, student_id):

        if request.user.role not in STUDENT_ACCOUNT_MANAGEMENT_ROLES:

            return Response(
                {
                    "detail": (
                        "You do not have permission to "
                        "manage student accounts."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        student = get_object_or_404(
            get_student_account_scope(request)
            .select_related(
                "school",
                "user",
            ),
            pk=student_id,
        )

        if not student.user_id:

            return Response(
                {
                    "detail": (
                        "This student does not have a "
                        "login account."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        student.user.is_active = False

        student.user.save(
            update_fields=[
                "is_active",
            ]
        )

        log_audit(
            request=request,
            action="UPDATE",
            model_name="User",
            object_id=user.id,
            object_repr=f"{user.username} - Student",
            description=(
                f"Student account for '{student.full_name}' "
                f"({student.admission_number}) was deactivated."
            ),
        )

        return Response(
            {
                "message": (
                    "Student account deactivated successfully."
                ),
                "account": StudentAccountSerializer(
                    student,
                    context={
                        "request": request,
                    },
                ).data,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# RESET STUDENT PASSWORD
# ============================================================

class StudentAccountResetPasswordView(APIView):
    """
    Reset an existing student's password.

    Unlike account creation, this endpoint intentionally accepts
    a password because the administrator is explicitly choosing
    the new password.
    """

    permission_classes = [
        IsAuthenticated
    ]

    @transaction.atomic
    def post(self, request, student_id):

        if request.user.role not in STUDENT_ACCOUNT_MANAGEMENT_ROLES:

            return Response(
                {
                    "detail": (
                        "You do not have permission to "
                        "manage student accounts."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        student = get_object_or_404(
            get_student_account_scope(request)
            .select_related(
                "school",
                "user",
            ),
            pk=student_id,
        )

        if not student.user_id:

            return Response(
                {
                    "detail": (
                        "This student does not have a "
                        "login account."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ResetStudentPasswordSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        new_password = serializer.validated_data[
            "password"
        ]

        student.user.set_password(
            new_password
        )

        student.user.save(
            update_fields=[
                "password",
            ]
        )

        return Response(
            {
                "message": (
                    "Student password reset successfully."
                )
            },
            status=status.HTTP_200_OK,
        )


# # =========================================================
# # STUDENT ACCOUNT DETAIL
# # =========================================================

# class StudentAccountDetailView(APIView):
#     """
#     View one student's login-account information.

#     URL:
#         GET /api/students/accounts/<student_id>/

#     Only SUPER_ADMIN and SCHOOL_ADMIN can access this endpoint.

#     SCHOOL_ADMIN can only view students belonging to their school.
#     SUPER_ADMIN can view students from any school.
#     """

#     permission_classes = [IsAuthenticated]

#     def get(self, request, student_id):
#         # --------------------------------------------------------
#         # PERMISSION
#         # --------------------------------------------------------

#         if request.user.role not in STUDENT_ACCOUNT_MANAGEMENT_ROLES:
#             return Response(
#                 {
#                     "detail": (
#                         "You do not have permission to manage "
#                         "student accounts."
#                     )
#                 },
#                 status=status.HTTP_403_FORBIDDEN,
#             )

#         # --------------------------------------------------------
#         # SCHOOL-SCOPED STUDENT QUERYSET
#         # --------------------------------------------------------

#         queryset = (
#             get_student_account_scope(request)
#             .select_related(
#                 "school",
#                 "user",
#             )
#             .prefetch_related(
#                 "enrollments__class_level",
#                 "enrollments__academic_session",
#             )
#         )

#         # --------------------------------------------------------
#         # GET STUDENT
#         # --------------------------------------------------------

#         student = queryset.filter(id=student_id).first()

#         if not student:
#             return Response(
#                 {
#                     "detail": "Student not found."
#                 },
#                 status=status.HTTP_404_NOT_FOUND,
#             )

#         # --------------------------------------------------------
#         # SERIALIZE
#         # --------------------------------------------------------

#         serializer = StudentAccountSerializer(student)

#         return Response(
#             serializer.data,
#             status=status.HTTP_200_OK,
#         )

class StudentDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = (
        Student.objects
        .select_related(
            "school",
            "department",
            "graduation_session",
        )
        .prefetch_related(
            "parents",
            "enrollments__class_level",
            "enrollments__academic_session",
            "enrollments__term",
            "promotion_records__from_class",
            "promotion_records__to_class",
            "promotion_records__from_session",
            "promotion_records__to_session",
            "promotion_records__from_term",
            "promotion_records__to_term",
        )
    )

    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def perform_update(self, serializer):
        student = serializer.save()

        log_audit(
            request=self.request,
            action="UPDATE",
            model_name="Student",
            object_id=student.id,
            object_repr=(
                f"{student.full_name} - "
                f"{student.admission_number}"
            ),
            description=(
                f"Student '{student.full_name}' "
                f"({student.admission_number}) was updated."
            ),
        )

    def perform_destroy(self, instance):
        student_name = instance.full_name
        admission_number = instance.admission_number
        student_id = instance.id

        log_audit(
            request=self.request,
            action="DELETE",
            model_name="Student",
            object_id=student_id,
            object_repr=(
                f"{student_name} - "
                f"{admission_number}"
            ),
            description=(
                f"Student '{student_name}' "
                f"({admission_number}) was deleted."
            ),
        )

        instance.delete()


# =========================================================
# STUDENT CLASSMATES
# =========================================================

class StudentClassmatesView(APIView):
    """
    Return students who are in the same current class
    and academic session as the selected student.

    The selected student is excluded from the result.

    This automatically follows the student's current
    enrollment, so promotion to a new class/session will
    also change the classmates shown in the Student Portal.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        # -------------------------------------------------
        # Get student
        # -------------------------------------------------

        student = get_object_or_404(
            Student.objects.select_related(
                "school",
                "department",
            ),
            id=student_id,
        )

        # -------------------------------------------------
        # Get current enrollment
        # -------------------------------------------------

        current_enrollment = (
            StudentEnrollment.objects
            .select_related(
                "student",
                "class_level",
                "academic_session",
                "term",
            )
            .filter(
                student=student,
                is_current=True,
            )
            .order_by("-id")
            .first()
        )

        if current_enrollment is None:
            return Response(
                {
                    "student": {
                        "id": student.id,
                        "full_name": student.full_name,
                        "admission_number": (
                            student.admission_number
                        ),
                    },
                    "enrollment": None,
                    "classmates": [],
                    "count": 0,
                    "detail": (
                        "The student does not have "
                        "a current enrollment."
                    ),
                },
                status=status.HTTP_200_OK,
            )

        # -------------------------------------------------
        # Find students in same current class/session
        # -------------------------------------------------

        classmates = (
            Student.objects
            .filter(
                school=student.school,
                enrollments__is_current=True,
                enrollments__class_level=(
                    current_enrollment.class_level
                ),
                enrollments__academic_session=(
                    current_enrollment.academic_session
                ),
            )
            .exclude(
                id=student.id
            )
            .select_related(
                "department",
            )
            .distinct()
            .order_by(
                "last_name",
                "first_name",
                "middle_name",
            )
        )

        # -------------------------------------------------
        # Prepare response
        # -------------------------------------------------

        classmates_data = []

        for classmate in classmates:
            classmates_data.append(
                {
                    "id": classmate.id,

                    "full_name": (
                        classmate.full_name
                    ),

                    "first_name": (
                        classmate.first_name
                    ),

                    "middle_name": (
                        classmate.middle_name
                    ),

                    "last_name": (
                        classmate.last_name
                    ),

                    "admission_number": (
                        classmate.admission_number
                    ),

                    "profile_image": (
                        request.build_absolute_uri(
                            classmate.profile_image.url
                        )
                        if classmate.profile_image
                        else None
                    ),

                    "gender": (
                        classmate.gender
                    ),

                    "department": (
                        classmate.department.name
                        if classmate.department
                        else None
                    ),
                }
            )

        return Response(
            {
                "student": {
                    "id": student.id,

                    "full_name": (
                        student.full_name
                    ),

                    "admission_number": (
                        student.admission_number
                    ),
                },

                "enrollment": {
                    "id": (
                        current_enrollment.id
                    ),

                    "class_level": (
                        current_enrollment
                        .class_level
                        .id
                    ),

                    "class_name": (
                        current_enrollment
                        .class_level
                        .name
                    ),

                    "academic_session": (
                        current_enrollment
                        .academic_session
                        .id
                    ),

                    "session_name": (
                        current_enrollment
                        .academic_session
                        .name
                    ),

                    "term": (
                        current_enrollment
                        .term
                        .id
                    ),

                    "term_name": (
                        current_enrollment
                        .term
                        .get_name_display()
                    ),
                },

                "classmates": classmates_data,

                "count": len(classmates_data),
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# ROLL NUMBER HELPER
# =========================================================

def get_next_roll_number(
    class_level,
    academic_session,
    term,
):
    """
    Return the next available roll number for a class
    within an academic session.

    Roll numbers are assigned sequentially:

        1, 2, 3, 4, ...

    The same roll number can be preserved across terms
    when the student continues to the next term.
    """

    last_roll_number = (
        StudentEnrollment.objects
        .filter(
            class_level=class_level,
            academic_session=academic_session,
            roll_number__isnull=False,
        )
        .aggregate(
            max_roll_number=Max("roll_number")
        )["max_roll_number"]
    )

    if last_roll_number is None:
        return 1

    return last_roll_number + 1


# =========================================================
# STUDENT ENROLLMENT
# =========================================================

class StudentEnrollmentListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = StudentEnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            StudentEnrollment.objects
            .select_related(
                "student",
                "class_level",
                "academic_session",
                "term",
            )
        )

        student = self.request.query_params.get(
            "student"
        )

        class_level = self.request.query_params.get(
            "class_level"
        )

        academic_session = (
            self.request.query_params.get(
                "academic_session"
            )
        )

        term = self.request.query_params.get(
            "term"
        )

        is_current = self.request.query_params.get(
            "is_current"
        )

        if student:
            queryset = queryset.filter(
                student_id=student
            )

        if class_level:
            queryset = queryset.filter(
                class_level_id=class_level
            )

        if academic_session:
            queryset = queryset.filter(
                academic_session_id=academic_session
            )

        if term:
            queryset = queryset.filter(
                term_id=term
            )

        if is_current is not None:
            queryset = queryset.filter(
                is_current=is_current.lower() == "true"
            )

        return queryset

    def perform_create(self, serializer):
        """
        Automatically assign a roll number when one is
        not supplied by the frontend.
        """

        validated_data = serializer.validated_data

        class_level = validated_data.get(
            "class_level"
        )

        academic_session = validated_data.get(
            "academic_session"
        )

        term = validated_data.get(
            "term"
        )

        roll_number = validated_data.get(
            "roll_number"
        )

        # -------------------------------------------------
        # Automatically assign roll number
        # -------------------------------------------------

        if roll_number is None:
            roll_number = get_next_roll_number(
                class_level=class_level,
                academic_session=academic_session,
                term=term,
            )

        serializer.save(
            roll_number=roll_number
        )



class StudentEnrollmentDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = (
        StudentEnrollment.objects
        .select_related(
            "student",
            "class_level",
            "academic_session",
            "term",
        )
    )

    serializer_class = StudentEnrollmentSerializer
    permission_classes = [IsAuthenticated]


# =========================================================
# STUDENT TERM PROGRESSION
# =========================================================

class StudentNextTermEligibilityView(APIView):
    """
    FIRST  -> SECOND
    SECOND -> THIRD

    THIRD TERM is handled by promotion.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        student = get_object_or_404(
            Student,
            id=student_id,
        )

        current_enrollment = (
            StudentEnrollment.objects
            .select_related(
                "student",
                "class_level",
                "academic_session",
                "term",
            )
            .filter(
                student=student,
                is_current=True,
            )
            .order_by("-id")
            .first()
        )

        if current_enrollment is None:
            return Response(
                {
                    "eligible": False,
                    "reason": (
                        "The student does not have "
                        "a current enrollment."
                    ),
                },
                status=status.HTTP_200_OK,
            )

        current_term = current_enrollment.term

        next_term_name = None

        if current_term.name == Term.TermType.FIRST:
            next_term_name = Term.TermType.SECOND

        elif current_term.name == Term.TermType.SECOND:
            next_term_name = Term.TermType.THIRD

        elif current_term.name == Term.TermType.THIRD:
            return Response(
                {
                    "eligible": False,
                    "reason": (
                        "The student is already in "
                        "Third Term. Promotion to the "
                        "next academic session is required."
                    ),
                    "requires_promotion": True,
                    "current_enrollment": (
                        StudentEnrollmentSerializer(
                            current_enrollment
                        ).data
                    ),
                },
                status=status.HTTP_200_OK,
            )

        else:
            return Response(
                {
                    "eligible": False,
                    "reason": "Invalid current term.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        next_term = (
            Term.objects
            .filter(
                academic_session=(
                    current_enrollment.academic_session
                ),
                name=next_term_name,
                is_active=True,
            )
            .first()
        )

        if next_term is None:
            return Response(
                {
                    "eligible": False,
                    "reason": (
                        "The next term has not been "
                        "configured for this academic session."
                    ),
                    "current_term": (
                        current_term.get_name_display()
                    ),
                    "next_term": next_term_name,
                },
                status=status.HTTP_200_OK,
            )

        existing_enrollment = (
            StudentEnrollment.objects
            .filter(
                student=student,
                academic_session=(
                    current_enrollment.academic_session
                ),
                term=next_term,
            )
            .first()
        )

        if existing_enrollment:
            return Response(
                {
                    "eligible": False,
                    "reason": (
                        "The student is already enrolled "
                        "for the next term."
                    ),
                    "existing_enrollment": (
                        StudentEnrollmentSerializer(
                            existing_enrollment
                        ).data
                    ),
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "eligible": True,
                "requires_promotion": False,

                "student": {
                    "id": student.id,
                    "full_name": student.full_name,
                    "admission_number": (
                        student.admission_number
                    ),
                },

                "current_enrollment": {
                    "id": current_enrollment.id,
                    "class_level": (
                        current_enrollment.class_level.id
                    ),
                    "class_name": (
                        current_enrollment.class_level.name
                    ),
                    "academic_session": (
                        current_enrollment
                        .academic_session.id
                    ),
                    "session_name": (
                        current_enrollment
                        .academic_session.name
                    ),
                    "term": current_term.id,
                    "term_name": (
                        current_term.get_name_display()
                    ),
                },

                "next_term": {
                    "id": next_term.id,
                    "name": next_term.name,
                    "term_name": (
                        next_term.get_name_display()
                    ),
                },
            },
            status=status.HTTP_200_OK,
        )


class ContinueStudentTermView(APIView):
    """
    FIRST  -> SECOND
    SECOND -> THIRD

    Third Term is handled by promotion.
    """

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        student_id = request.data.get(
            "student_id"
        )

        if not student_id:
            return Response(
                {
                    "student_id": (
                        "Student ID is required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        student = get_object_or_404(
            Student,
            id=student_id,
        )

        current_enrollment = (
            StudentEnrollment.objects
            .select_related(
                "student",
                "class_level",
                "academic_session",
                "term",
            )
            .filter(
                student=student,
                is_current=True,
            )
            .order_by("-id")
            .first()
        )

        if current_enrollment is None:
            return Response(
                {
                    "detail": (
                        "The student does not have "
                        "a current enrollment."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        current_term = current_enrollment.term

        if current_term.name == Term.TermType.FIRST:
            next_term_name = Term.TermType.SECOND

        elif current_term.name == Term.TermType.SECOND:
            next_term_name = Term.TermType.THIRD

        elif current_term.name == Term.TermType.THIRD:
            return Response(
                {
                    "detail": (
                        "The student is already in "
                        "Third Term. Use the promotion "
                        "workflow to move the student "
                        "to the next academic session."
                    ),
                    "requires_promotion": True,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        else:
            return Response(
                {
                    "detail": "Invalid current term."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        next_term = (
            Term.objects
            .filter(
                academic_session=(
                    current_enrollment.academic_session
                ),
                name=next_term_name,
                is_active=True,
            )
            .first()
        )

        if next_term is None:
            return Response(
                {
                    "detail": (
                        "The next term has not been "
                        "configured for this academic session."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing_enrollment = (
            StudentEnrollment.objects
            .filter(
                student=student,
                academic_session=(
                    current_enrollment.academic_session
                ),
                term=next_term,
            )
            .first()
        )

        if existing_enrollment:
            return Response(
                {
                    "detail": (
                        "The student is already enrolled "
                        "for the next term."
                    ),
                    "enrollment": (
                        StudentEnrollmentSerializer(
                            existing_enrollment
                        ).data
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        roll_number = current_enrollment.roll_number

        if roll_number is None:
            roll_number = get_next_roll_number(
                class_level=current_enrollment.class_level,
                academic_session=current_enrollment.academic_session,
                term=next_term,
            )

        current_enrollment.is_current = False

        current_enrollment.save(
            update_fields=[
                "is_current"
            ]
        )

        new_enrollment = StudentEnrollment.objects.create(
            student=student,
            academic_session=(
                current_enrollment.academic_session
            ),
            term=next_term,
            class_level=(
                current_enrollment.class_level
            ),
            roll_number=roll_number,
            is_current=True,
            remarks=(
                f"Continued from "
                f"{current_term.get_name_display()}."
            ),
        )

        previous_subjects = (
            StudentSubjectEnrollment.objects
            .filter(
                student_enrollment=current_enrollment,
                academic_session=(
                    current_enrollment.academic_session
                ),
                term=current_term,
                is_active=True,
            )
            .select_related("subject")
        )

        copied_subjects = []
        skipped_subjects = []

        for previous_subject in previous_subjects:
            subject = previous_subject.subject

            class_subject = (
                ClassSubject.objects
                .filter(
                    class_level=(
                        new_enrollment.class_level
                    ),
                    subject=subject,
                    is_active=True,
                    subject__is_active=True,
                )
                .first()
            )

            if class_subject is None:
                skipped_subjects.append(
                    {
                        "subject_id": subject.id,
                        "subject_name": subject.name,
                        "reason": (
                            "Subject is no longer "
                            "assigned to this class."
                        ),
                    }
                )
                continue

            subject_enrollment = (
                StudentSubjectEnrollment.objects.create(
                    student_enrollment=new_enrollment,
                    subject=subject,
                    academic_session=(
                        new_enrollment.academic_session
                    ),
                    term=next_term,
                    is_core=class_subject.is_core,
                    is_active=True,
                )
            )

            copied_subjects.append(
                StudentSubjectEnrollmentSerializer(
                    subject_enrollment
                ).data
            )

        return Response(
            {
                "message": (
                    f"Student successfully continued "
                    f"from "
                    f"{current_term.get_name_display()} "
                    f"to "
                    f"{next_term.get_name_display()}."
                ),

                "previous_enrollment": (
                    StudentEnrollmentSerializer(
                        current_enrollment
                    ).data
                ),

                "new_enrollment": (
                    StudentEnrollmentSerializer(
                        new_enrollment
                    ).data
                ),

                "subjects_copied": copied_subjects,
                "subjects_skipped": skipped_subjects,

                "subjects_copied_count": (
                    len(copied_subjects)
                ),

                "subjects_skipped_count": (
                    len(skipped_subjects)
                ),
            },
            status=status.HTTP_201_CREATED,
        )


# =========================================================
# PROMOTION HELPERS
# =========================================================

def get_class_number(class_level):
    """
    Extract numeric level from class name.

    Examples:
        Primary 1 -> 1
        JSS 2     -> 2
        SS 3      -> 3
        SS3 ART   -> 3
    """

    match = re.search(
        r"\d+",
        class_level.name,
    )

    if not match:
        return None

    return int(match.group())


def get_next_academic_session(current_session):
    """
    Get the next active academic session
    belonging to the same school.
    """

    return (
        AcademicSession.objects
        .filter(
            school=current_session.school,
            is_active=True,
            start_date__gt=current_session.start_date,
        )
        .order_by("start_date")
        .first()
    )


def get_first_term(academic_session):
    """
    Get the active First Term of a session.
    """

    return (
        Term.objects
        .filter(
            academic_session=academic_session,
            name=Term.TermType.FIRST,
            is_active=True,
        )
        .first()
    )


def get_promotion_target_classes(
    student,
    current_class,
):
    """
    Determine valid promotion target classes.

    PRIMARY:
        Primary 1 -> Primary 2
        Primary 2 -> Primary 3
        etc.

    JSS:
        JSS1 -> JSS2
        JSS2 -> JSS3
        JSS3 -> SS1

    SS:
        SS1 -> SS2
        SS2 -> SS3
        SS3 -> Graduation
    """

    current_number = get_class_number(
        current_class
    )

    if current_number is None:
        return ClassLevel.objects.none()

    # =====================================================
    # PRIMARY
    # =====================================================

    if (
        current_class.education_level
        == ClassLevel.EducationLevel.PRIMARY
    ):
        next_number = current_number + 1

        return (
            ClassLevel.objects
            .filter(
                school=current_class.school,
                education_level=(
                    ClassLevel.EducationLevel.PRIMARY
                ),
                is_active=True,
            )
            .filter(
                Q(
                    name__icontains=f" {next_number}"
                )
                | Q(
                    name__icontains=f"{next_number}"
                )
                | Q(
                    code__icontains=str(next_number)
                )
            )
            .order_by("name")
        )

    # =====================================================
    # JSS
    # =====================================================

    if (
        current_class.education_level
        == ClassLevel.EducationLevel.JSS
    ):
        if current_number < 3:
            next_number = current_number + 1

            return (
                ClassLevel.objects
                .filter(
                    school=current_class.school,
                    education_level=(
                        ClassLevel.EducationLevel.JSS
                    ),
                    is_active=True,
                )
                .filter(
                    Q(
                        name__icontains=(
                            f" {next_number}"
                        )
                    )
                    | Q(
                        name__icontains=(
                            f"JSS{next_number}"
                        )
                    )
                    | Q(
                        code__icontains=(
                            str(next_number)
                        )
                    )
                )
                .order_by("name")
            )

        # -------------------------------------------------
        # JSS3 -> SS1
        # -------------------------------------------------

        if current_number == 3:
            queryset = (
                ClassLevel.objects
                .filter(
                    school=current_class.school,
                    education_level=(
                        ClassLevel.EducationLevel.SS
                    ),
                    is_active=True,
                )
                .filter(
                    Q(
                        name__icontains="SS 1"
                    )
                    | Q(
                        name__icontains="SS1"
                    )
                    | Q(
                        code__icontains="SS1"
                    )
                    | Q(
                        code__icontains="SS-1"
                    )
                    | Q(
                        code__icontains="1"
                    )
                )
            )

            if student.department_id:
                department_classes = (
                    queryset.filter(
                        department_id=(
                            student.department_id
                        )
                    )
                )

                if department_classes.exists():
                    return (
                        department_classes
                        .order_by(
                            "department__name",
                            "name",
                        )
                    )

            return (
                queryset
                .order_by(
                    "department__name",
                    "name",
                )
            )

    # =====================================================
    # SS
    # =====================================================

    if (
        current_class.education_level
        == ClassLevel.EducationLevel.SS
    ):
        if current_number < 3:
            next_number = current_number + 1

            queryset = (
                ClassLevel.objects
                .filter(
                    school=current_class.school,
                    education_level=(
                        ClassLevel.EducationLevel.SS
                    ),
                    is_active=True,
                )
            )

            # Student remains in same department.
            if current_class.department_id:
                queryset = queryset.filter(
                    department_id=(
                        current_class.department_id
                    )
                )

            return (
                queryset
                .filter(
                    Q(
                        name__icontains=(
                            f"SS {next_number}"
                        )
                    )
                    | Q(
                        name__icontains=(
                            f"SS{next_number}"
                        )
                    )
                    | Q(
                        code__icontains=(
                            f"SS{next_number}"
                        )
                    )
                    | Q(
                        code__icontains=(
                            f"SS-{next_number}"
                        )
                    )
                    | Q(
                        code__icontains=(
                            str(next_number)
                        )
                    )
                )
                .order_by("name")
            )

        # SS3 -> Graduation
        return ClassLevel.objects.none()

    return ClassLevel.objects.none()


# =========================================================
# STUDENT PROMOTION ELIGIBILITY
# =========================================================

class StudentPromotionEligibilityView(APIView):
    """
    Check whether a student can be promoted.

    Promotion is ONLY available after Third Term.

    SS3 students are eligible for graduation.
    """

    permission_classes = [IsAuthenticated]

    def get(
        self,
        request,
        student_id,
    ):
        student = get_object_or_404(
            Student,
            id=student_id,
        )

        current_enrollment = (
            StudentEnrollment.objects
            .filter(
                student=student,
                is_current=True,
            )
            .select_related(
                "academic_session",
                "term",
                "class_level",
                "class_level__department",
            )
            .order_by("-id")
            .first()
        )

        if current_enrollment is None:
            return Response(
                {
                    "eligible": False,
                    "requires_promotion": False,
                    "detail": (
                        "The student does not have "
                        "a current enrollment."
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------------------------------
        # Must be Third Term
        # -------------------------------------------------

        if (
            current_enrollment.term.name
            != Term.TermType.THIRD
        ):
            return Response(
                {
                    "eligible": False,
                    "requires_promotion": False,
                    "detail": (
                        "The student can only be promoted "
                        "after Third Term."
                    ),

                    "current_enrollment": {
                        "id": current_enrollment.id,
                        "session": (
                            current_enrollment
                            .academic_session.name
                        ),
                        "term": (
                            current_enrollment
                            .term.get_name_display()
                        ),
                        "class": (
                            current_enrollment
                            .class_level.name
                        ),
                    },
                },
                status=status.HTTP_200_OK,
            )

        current_class = (
            current_enrollment.class_level
        )

        current_number = get_class_number(
            current_class
        )

        # =================================================
        # SS3 -> GRADUATION
        # =================================================

        if (
            current_class.education_level
            == ClassLevel.EducationLevel.SS
            and current_number == 3
        ):
            return Response(
                {
                    "eligible": True,
                    "requires_promotion": False,
                    "requires_graduation": True,

                    "detail": (
                        "The student has completed SS3 "
                        "and is eligible for graduation."
                    ),

                    "current_enrollment": {
                        "id": current_enrollment.id,
                        "session": (
                            current_enrollment
                            .academic_session.name
                        ),
                        "term": (
                            current_enrollment
                            .term.get_name_display()
                        ),
                        "class": current_class.name,
                        "department": (
                            current_class.department.name
                            if current_class.department
                            else None
                        ),
                    },

                    "next_session": None,
                    "first_term": None,
                    "target_classes": [],
                },
                status=status.HTTP_200_OK,
            )

        # =================================================
        # FIND NEXT SESSION
        # =================================================

        next_session = get_next_academic_session(
            current_enrollment.academic_session
        )

        if next_session is None:
            return Response(
                {
                    "eligible": False,
                    "requires_promotion": True,
                    "detail": (
                        "There is no next academic session "
                        "configured for this school."
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =================================================
        # FIND FIRST TERM
        # =================================================

        first_term = get_first_term(
            next_session
        )

        if first_term is None:
            return Response(
                {
                    "eligible": False,
                    "requires_promotion": True,
                    "detail": (
                        "The First Term for the next "
                        "academic session has not "
                        "been configured."
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =================================================
        # TARGET CLASSES
        # =================================================

        target_classes = get_promotion_target_classes(
            student,
            current_class,
        )

        target_data = []

        for target_class in target_classes:
            target_data.append(
                {
                    "id": target_class.id,
                    "name": target_class.name,
                    "code": target_class.code,
                    "education_level": (
                        target_class.education_level
                    ),
                    "department": (
                        target_class.department.name
                        if target_class.department
                        else None
                    ),
                    "department_id": (
                        target_class.department_id
                    ),
                    "capacity": target_class.capacity,
                }
            )

        # =================================================
        # CHECK DUPLICATE PROMOTION
        # =================================================

        already_promoted = (
            StudentEnrollment.objects
            .filter(
                student=student,
                academic_session=next_session,
                term=first_term,
            )
            .exists()
        )

        if already_promoted:
            return Response(
                {
                    "eligible": False,
                    "requires_promotion": True,
                    "already_promoted": True,

                    "detail": (
                        "This student already has an "
                        "enrollment in the next "
                        "academic session."
                    ),

                    "current_enrollment": {
                        "id": current_enrollment.id,
                        "session": (
                            current_enrollment
                            .academic_session.name
                        ),
                        "term": (
                            current_enrollment
                            .term.get_name_display()
                        ),
                        "class": current_class.name,
                    },

                    "next_session": next_session.name,

                    "first_term": (
                        first_term.get_name_display()
                    ),

                    "target_classes": target_data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "eligible": len(target_data) > 0,

                "requires_promotion": True,
                "requires_graduation": False,
                "already_promoted": False,

                "detail": (
                    "Student is eligible for promotion."
                    if target_data
                    else (
                        "No suitable target class "
                        "was found for this student."
                    )
                ),

                "current_enrollment": {
                    "id": current_enrollment.id,
                    "session": (
                        current_enrollment
                        .academic_session.name
                    ),
                    "term": (
                        current_enrollment
                        .term.get_name_display()
                    ),
                    "class": current_class.name,
                    "department": (
                        current_class.department.name
                        if current_class.department
                        else None
                    ),
                },

                "next_session": {
                    "id": next_session.id,
                    "name": next_session.name,
                },

                "first_term": {
                    "id": first_term.id,
                    "name": (
                        first_term.get_name_display()
                    ),
                },

                "target_classes": target_data,
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# PROMOTE STUDENT
# =========================================================

class PromoteStudentView(APIView):
    """
    Promote a student from Third Term to First Term
    of the next academic session.

    SS3 students are graduated instead.

    IMPORTANT:
    - Old enrollment is preserved as history.
    - New enrollment becomes current.
    - PromotionRecord is created.
    - Graduation details are preserved.
    """

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(
        self,
        request,
    ):
        student_id = request.data.get(
            "student_id"
        )

        target_class_id = request.data.get(
            "target_class_id"
        )

        remarks = (
            request.data.get(
                "remarks",
                ""
            )
            or ""
        ).strip()

        if not student_id:
            return Response(
                {
                    "detail": (
                        "student_id is required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------------------------------
        # Lock student
        # -------------------------------------------------

        student = get_object_or_404(
            Student.objects.select_for_update(),
            pk=student_id,
        )

        # -------------------------------------------------
        # Get current enrollment
        # -------------------------------------------------

        current_enrollment = (
            StudentEnrollment.objects
            .select_for_update()
            .select_related(
                "student",
                "class_level",
                "academic_session",
                "term",
            )
            .filter(
                student=student,
                is_current=True,
            )
            .order_by("-id")
            .first()
        )

        if current_enrollment is None:
            return Response(
                {
                    "detail": (
                        "The student does not have "
                        "a current enrollment."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =================================================
        # MUST BE THIRD TERM
        # =================================================

        if (
            current_enrollment.term.name
            != Term.TermType.THIRD
        ):
            return Response(
                {
                    "detail": (
                        "A student can only be promoted "
                        "after Third Term."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        current_class = (
            current_enrollment.class_level
        )

        current_number = get_class_number(
            current_class
        )

        # =================================================
        # SS3 -> GRADUATION
        # =================================================

        if (
            current_class.education_level
            == ClassLevel.EducationLevel.SS
            and current_number == 3
        ):
            if (
                student.status
                == Student.Status.GRADUATED
            ):
                return Response(
                    {
                        "detail": (
                            "This student has already "
                            "been graduated."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            academic_session = (
                current_enrollment.academic_session
            )

            # -------------------------------------------------
            # Determine graduation year
            # -------------------------------------------------

            if academic_session.end_date:
                graduation_year = (
                    academic_session
                    .end_date
                    .year
                )
            else:
                graduation_year = timezone.now().year

            # -------------------------------------------------
            # Preserve final enrollment as history
            # -------------------------------------------------

            current_enrollment.is_current = False

            current_enrollment.save(
                update_fields=[
                    "is_current"
                ]
            )

            # -------------------------------------------------
            # Graduate student
            # -------------------------------------------------

            student.status = Student.Status.GRADUATED

            student.graduation_session = (
                academic_session
            )

            student.graduation_year = (
                graduation_year
            )

            student.save(
                update_fields=[
                    "status",
                    "graduation_session",
                    "graduation_year",
                ]
            )

            # -------------------------------------------------
            # Create permanent graduation record
            # -------------------------------------------------

            graduation_remarks = (
                remarks
                or
                (
                    "Student graduated after "
                    f"completing {current_class.name}."
                )
            )

            promotion_record = (
                PromotionRecord.objects.create(
                    student=student,

                    from_session=(
                        current_enrollment
                        .academic_session
                    ),

                    from_term=(
                        current_enrollment.term
                    ),

                    from_class=current_class,

                    # Graduation is a final academic
                    # event. Therefore the same final
                    # session/term/class are stored.
                    to_session=(
                        current_enrollment
                        .academic_session
                    ),

                    to_term=(
                        current_enrollment.term
                    ),

                    to_class=current_class,

                    promotion_type=(
                        PromotionRecord
                        .PromotionType
                        .GRADUATED
                    ),

                    graduation_year=(
                        graduation_year
                    ),

                    is_final=True,

                    remarks=graduation_remarks,
                )
            )

            return Response(
                {
                    "success": True,
                    "action": "GRADUATED",

                    "detail": (
                        f"{student.full_name} has been "
                        "graduated successfully."
                    ),

                    "student": {
                        "id": student.id,
                        "name": student.full_name,
                        "admission_number": (
                            student.admission_number
                        ),
                        "status": student.status,
                        "graduation_session": (
                            academic_session.name
                        ),
                        "graduation_year": (
                            graduation_year
                        ),
                    },

                    "previous_enrollment": {
                        "id": current_enrollment.id,
                        "session": (
                            academic_session.name
                        ),
                        "term": (
                            current_enrollment
                            .term
                            .get_name_display()
                        ),
                        "class": current_class.name,
                        "is_current": False,
                    },

                    "promotion_record": (
                        PromotionRecordSerializer(
                            promotion_record
                        ).data
                    ),
                },
                status=status.HTTP_200_OK,
            )

        # =================================================
        # FIND NEXT SESSION
        # =================================================

        next_session = get_next_academic_session(
            current_enrollment.academic_session
        )

        if next_session is None:
            return Response(
                {
                    "detail": (
                        "There is no next academic "
                        "session configured for "
                        "this school."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =================================================
        # FIND FIRST TERM
        # =================================================

        first_term = get_first_term(
            next_session
        )

        if first_term is None:
            return Response(
                {
                    "detail": (
                        "The First Term of the next "
                        "academic session has not "
                        "been configured."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =================================================
        # PREVENT DUPLICATE PROMOTION
        # =================================================

        existing_enrollment = (
            StudentEnrollment.objects
            .filter(
                student=student,
                academic_session=next_session,
                term=first_term,
            )
            .first()
        )

        if existing_enrollment:
            return Response(
                {
                    "detail": (
                        "This student has already "
                        "been promoted to the next "
                        "academic session."
                    ),

                    "existing_enrollment": (
                        StudentEnrollmentSerializer(
                            existing_enrollment
                        ).data
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =================================================
        # GET TARGET CLASSES
        # =================================================

        target_classes = get_promotion_target_classes(
            student,
            current_class,
        )

        if not target_classes.exists():
            return Response(
                {
                    "detail": (
                        "No suitable target class "
                        "was found for this student."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =================================================
        # SELECT TARGET CLASS
        # =================================================

        if target_class_id:
            target_class = (
                target_classes
                .filter(
                    pk=target_class_id
                )
                .first()
            )

            if target_class is None:
                return Response(
                    {
                        "detail": (
                            "The selected target class "
                            "is not valid for this "
                            "promotion."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        else:
            # Automatically select if only one exists.
            if target_classes.count() > 1:
                return Response(
                    {
                        "detail": (
                            "Multiple target classes "
                            "are available. Please "
                            "select a target class."
                        ),

                        "target_classes": [
                            {
                                "id": item.id,
                                "name": item.name,
                                "code": item.code,
                                "education_level": (
                                    item.education_level
                                ),
                                "department": (
                                    item.department.name
                                    if item.department
                                    else None
                                ),
                                "department_id": (
                                    item.department_id
                                ),
                            }
                            for item in target_classes
                        ],
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            target_class = target_classes.first()

        # =================================================
        # JSS3 -> SS1 DEPARTMENT VALIDATION
        # =================================================

        if (
            current_class.education_level
            == ClassLevel.EducationLevel.JSS
            and current_number == 3
            and target_class.education_level
            == ClassLevel.EducationLevel.SS
        ):
            if target_class.department_id is None:
                return Response(
                    {
                        "detail": (
                            "The selected SS1 class "
                            "must have a department."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Synchronize student's department
            # with the selected SS1 department.
            if (
                student.department_id
                != target_class.department_id
            ):
                student.department_id = (
                    target_class.department_id
                )

                student.save(
                    update_fields=[
                        "department"
                    ]
                )

        # =================================================
        # SS1 -> SS2 / SS2 -> SS3
        # MUST KEEP SAME DEPARTMENT
        # =================================================

        if (
            current_class.education_level
            == ClassLevel.EducationLevel.SS
        ):
            if (
                current_class.department_id
                and
                target_class.department_id
                != current_class.department_id
            ):
                return Response(
                    {
                        "detail": (
                            "A student must remain "
                            "in the same department "
                            "when promoted within SS."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # =================================================
        # MARK OLD ENROLLMENT NOT CURRENT
        # =================================================

        current_enrollment.is_current = False

        current_enrollment.save(
            update_fields=[
                "is_current"
            ]
        )

        # =================================================
        # CREATE NEW FIRST TERM ENROLLMENT
        # =================================================

        promotion_remarks = (
            remarks
            or
            (
                f"Promoted from "
                f"{current_class.name} "
                f"({current_enrollment.academic_session.name})."
            )
        )

        new_enrollment = (
            StudentEnrollment.objects.create(
                student=student,

                academic_session=next_session,

                term=first_term,

                class_level=target_class,

                is_current=True,

                roll_number=get_next_roll_number(
                    class_level=target_class,
                    academic_session=next_session,
                    term=first_term,
                ),

                remarks=promotion_remarks,
            )
        )

        # =================================================
        # STUDENT REMAINS ACTIVE
        # =================================================

        if (
            student.status
            != Student.Status.ACTIVE
        ):
            student.status = Student.Status.ACTIVE

            student.save(
                update_fields=[
                    "status"
                ]
            )

        # =================================================
        # CREATE PROMOTION HISTORY
        # =================================================

        promotion_record = (
            PromotionRecord.objects.create(
                student=student,

                from_session=(
                    current_enrollment
                    .academic_session
                ),

                from_term=(
                    current_enrollment.term
                ),

                from_class=current_class,

                to_session=next_session,

                to_term=first_term,

                to_class=target_class,

                promotion_type=(
                    PromotionRecord
                    .PromotionType
                    .PROMOTED
                ),

                is_final=False,

                remarks=(
                    remarks
                    or
                    (
                        f"Promoted from "
                        f"{current_class.name} "
                        f"to "
                        f"{target_class.name}."
                    )
                ),
            )
        )

        log_audit(
            request=request,
            action="UPDATE",
            model_name="StudentEnrollment",
            object_id=new_enrollment.id,
            object_repr=(
                f"{student.full_name} - "
                f"{target_class.name}"
            ),
            description=(
                f"Student '{student.full_name}' "
                f"({student.admission_number}) was promoted "
                f"from {current_class.name} "
                f"to {target_class.name} "
                f"for the {next_session.name} academic session."
            ),
        )

        log_audit(
            request=request,
            action="UPDATE",
            model_name="Student",
            object_id=student.id,
            object_repr=(
                f"{student.full_name} - "
                f"{student.admission_number}"
            ),
            description=(
                f"Student '{student.full_name}' "
                f"({student.admission_number}) was graduated "
                f"after completing {current_class.name}."
            ),
        )

        # =================================================
        # RETURN RESULT
        # =================================================

        return Response(
            {
                "success": True,
                "action": "PROMOTED",

                "detail": (
                    f"{student.full_name} has been "
                    "promoted successfully."
                ),

                "student": {
                    "id": student.id,
                    "name": student.full_name,
                    "admission_number": (
                        student.admission_number
                    ),
                    "status": student.status,
                    "department": (
                        student.department.name
                        if student.department
                        else None
                    ),
                },

                "previous_enrollment": {
                    "id": current_enrollment.id,

                    "session": (
                        current_enrollment
                        .academic_session.name
                    ),

                    "term": (
                        current_enrollment
                        .term.get_name_display()
                    ),

                    "class": current_class.name,

                    "is_current": False,
                },

                "new_enrollment": {
                    "id": new_enrollment.id,

                    "session": next_session.name,

                    "term": (
                        first_term.get_name_display()
                    ),

                    "class": target_class.name,

                    "department": (
                        target_class.department.name
                        if target_class.department
                        else None
                    ),

                    "department_id": (
                        target_class.department_id
                    ),

                    "roll_number": (
                        new_enrollment.roll_number
                    ),

                    "is_current": True,
                },

                "promotion_record": (
                    PromotionRecordSerializer(
                        promotion_record
                    ).data
                ),
            },
            status=status.HTTP_201_CREATED,
        )


# =========================================================
# PROMOTION HISTORY - ONE STUDENT
# =========================================================

class StudentPromotionHistoryView(
    generics.ListAPIView
):
    """
    Return the complete promotion and graduation
    history for one student.
    """

    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = PromotionRecordSerializer

    def get_queryset(self):
        student_id = self.kwargs.get(
            "student_id"
        )

        return (
            PromotionRecord.objects
            .filter(
                student_id=student_id
            )
            .select_related(
                "student",
                "from_session",
                "from_term",
                "from_class",
                "to_session",
                "to_term",
                "to_class",
            )
            .order_by(
                "-promotion_date",
                "-id",
            )
        )


# =========================================================
# ALL PROMOTION RECORDS
# =========================================================

class PromotionRecordListView(
    generics.ListAPIView
):
    """
    Return all promotion and graduation records.

    Optional filters:

        ?student=1
        ?promotion_type=PROMOTED
        ?promotion_type=GRADUATED
        ?session=1
    """

    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = PromotionRecordSerializer

    def get_queryset(self):
        queryset = (
            PromotionRecord.objects
            .select_related(
                "student",
                "from_session",
                "from_term",
                "from_class",
                "to_session",
                "to_term",
                "to_class",
            )
            .order_by(
                "-promotion_date",
                "-id",
            )
        )

        student_id = (
            self.request.query_params.get(
                "student"
            )
        )

        promotion_type = (
            self.request.query_params.get(
                "promotion_type"
            )
        )

        academic_session = (
            self.request.query_params.get(
                "session"
            )
        )

        if student_id:
            queryset = queryset.filter(
                student_id=student_id
            )

        if promotion_type:
            queryset = queryset.filter(
                promotion_type=promotion_type
            )

        if academic_session:
            queryset = queryset.filter(
                from_session_id=academic_session
            )

        return queryset


# =========================================================
# STUDENT SUBJECT ENROLLMENT
# =========================================================

class StudentSubjectEnrollmentListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = StudentSubjectEnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            StudentSubjectEnrollment.objects
            .select_related(
                "student_enrollment__student",
                "student_enrollment__class_level",
                "subject",
                "academic_session",
                "term",
            )
        )


class StudentSubjectEnrollmentDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = (
        StudentSubjectEnrollment.objects
        .select_related(
            "student_enrollment__student",
            "student_enrollment__class_level",
            "subject",
            "academic_session",
            "term",
        )
    )

    serializer_class = StudentSubjectEnrollmentSerializer
    permission_classes = [IsAuthenticated]


# =========================================================
# OPTIONAL SUBJECT SELECTION HELPERS
# =========================================================

def get_optional_subject_setting(enrollment):
    """
    Get optional-subject selection setting for the
    student's current school, session, term and class.
    """

    return (
        OptionalSubjectSelectionSetting.objects
        .filter(
            school=enrollment.student.school,
            academic_session=(
                enrollment.academic_session
            ),
            term=enrollment.term,
            class_level=enrollment.class_level,
        )
        .first()
    )


def get_optional_selection_status(setting):
    """
    Determine the current optional-subject
    selection window status.
    """

    now = timezone.now()

    if setting is None:
        return {
            "status": "NOT_CONFIGURED",
            "can_select": False,
            "can_change": False,
        }

    if not setting.is_enabled:
        return {
            "status": "DISABLED",
            "can_select": False,
            "can_change": False,
        }

    if (
        setting.start_datetime is None
        or setting.end_datetime is None
    ):
        return {
            "status": "NOT_CONFIGURED",
            "can_select": False,
            "can_change": False,
        }

    if now < setting.start_datetime:
        return {
            "status": "NOT_STARTED",
            "can_select": False,
            "can_change": False,
        }

    if now > setting.end_datetime:
        return {
            "status": "CLOSED",
            "can_select": False,
            "can_change": False,
        }

    return {
        "status": "OPEN",
        "can_select": True,
        "can_change": True,
    }


# =========================================================
# STUDENT SUBJECT OVERVIEW
# =========================================================

class StudentSubjectsView(
    generics.RetrieveAPIView
):
    """
    Return all subjects relevant to the student's
    current enrollment.
    """

    permission_classes = [IsAuthenticated]

    def retrieve(
        self,
        request,
        *args,
        **kwargs,
    ):
        student = get_object_or_404(
            Student.objects.select_related(
                "school",
                "department",
            ),
            id=kwargs["student_id"],
        )

        enrollment = (
            StudentEnrollment.objects
            .select_related(
                "student",
                "class_level",
                "academic_session",
                "term",
            )
            .filter(
                student=student,
                is_current=True,
            )
            .order_by("-id")
            .first()
        )

        if enrollment is None:
            return Response(
                {
                    "detail": (
                        "This student does not have a "
                        "current enrollment."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        class_level = enrollment.class_level

        academic_session = (
            enrollment.academic_session
        )

        term = enrollment.term

        optional_setting = (
            get_optional_subject_setting(
                enrollment
            )
        )

        optional_status = (
            get_optional_selection_status(
                optional_setting
            )
        )

        class_subjects = (
            ClassSubject.objects
            .filter(
                class_level=class_level,
                is_active=True,
                subject__is_active=True,
            )
            .select_related(
                "subject",
                "class_level",
                "class_level__department",
                "subject__department",
            )
            .order_by(
                "subject__name"
            )
        )

        teacher_assignments = (
            TeacherSubject.objects
            .filter(
                class_level=class_level,
            )
            .select_related("teacher")
            .order_by(
                "-is_primary",
                "-assigned_at",
                "-id",
            )
        )

        teacher_map = {}

        for assignment in teacher_assignments:
            subject_id = assignment.subject_id

            # Keep the first assignment because the queryset
            # is already ordered with primary assignments first.
            if subject_id not in teacher_map:
                teacher_map[subject_id] = assignment

        selected_subject_ids = set(
            StudentSubjectEnrollment.objects
            .filter(
                student_enrollment=enrollment,
                academic_session=academic_session,
                term=term,
                is_active=True,
            )
            .values_list(
                "subject_id",
                flat=True,
            )
        )

        def subject_data(class_subject):
            subject = class_subject.subject

            # -----------------------------------------------------
            # FIND TEACHER ASSIGNED TO THIS SUBJECT + CLASS
            # -----------------------------------------------------

            teacher_assignment = (
                TeacherSubject.objects
                .select_related("teacher")
                .filter(
                    subject=subject,
                    class_level=class_level,
                )
                .order_by(
                    "-is_primary",
                    "-assigned_at",
                    "-id",
                )
                .first()
            )

            teacher_id = None
            teacher_name = None

            if teacher_assignment:
                teacher_id = (
                    teacher_assignment.teacher.id
                )

                teacher_name = (
                    teacher_assignment.teacher.full_name
                )

            return {
                "class_subject_id": (
                    class_subject.id
                ),

                "subject_id": subject.id,

                "name": subject.name,

                "code": subject.code,

                "education_level": (
                    subject.education_level
                ),

                "department": (
                    subject.department.id
                    if subject.department
                    else None
                ),

                "department_name": (
                    subject.department.name
                    if subject.department
                    else None
                ),

                "assignment_type": (
                    class_subject.assignment_type
                ),

                "is_core": (
                    class_subject.is_core
                ),

                "is_active": (
                    class_subject.is_active
                ),

                # -------------------------------------------------
                # SUBJECT TEACHER
                # -------------------------------------------------

                "teacher_id": teacher_id,

                "teacher_name": teacher_name,
            }

        general_compulsory = []
        department_compulsory = []
        selected_optional = []
        available_optional = []

        for class_subject in class_subjects:
            assignment_type = (
                class_subject.assignment_type
            )

            data = subject_data(
                class_subject
            )

            if (
                assignment_type
                == "GENERAL_COMPULSORY"
            ):
                general_compulsory.append(
                    data
                )

            elif (
                assignment_type
                == "DEPARTMENT_COMPULSORY"
            ):
                department_compulsory.append(
                    data
                )

            elif (
                assignment_type
                == "OPTIONAL"
            ):
                if (
                    class_subject.subject_id
                    in selected_subject_ids
                ):
                    selected_optional.append(
                        data
                    )
                else:
                    available_optional.append(
                        data
                    )

        selected_optional_count = 0

        for selected_id in selected_subject_ids:
            is_optional = (
                ClassSubject.objects
                .filter(
                    class_level=class_level,
                    subject_id=selected_id,
                    assignment_type="OPTIONAL",
                    is_active=True,
                    subject__is_active=True,
                )
                .exists()
            )

            if is_optional:
                selected_optional_count += 1

        if optional_status["status"] == "CLOSED":
            available_optional = []

        optional_selection = {
            "status": (
                optional_status["status"]
            ),

            "is_enabled": (
                optional_setting.is_enabled
                if optional_setting
                else False
            ),

            "max_optional_subjects": (
                optional_setting
                .max_optional_subjects
                if optional_setting
                else 0
            ),

            "selected_count": (
                selected_optional_count
            ),

            "can_select": (
                optional_status["can_select"]
            ),

            "can_change": (
                optional_status["can_change"]
            ),

            "start_datetime": (
                optional_setting.start_datetime
                if optional_setting
                else None
            ),

            "end_datetime": (
                optional_setting.end_datetime
                if optional_setting
                else None
            ),
        }

        return Response(
            {
                "student": {
                    "id": student.id,

                    "full_name": (
                        student.full_name
                    ),

                    "admission_number": (
                        student.admission_number
                    ),

                    "department": (
                        student.department.id
                        if student.department
                        else None
                    ),

                    "department_name": (
                        student.department.name
                        if student.department
                        else None
                    ),
                },

                "enrollment": {
                    "id": enrollment.id,

                    "class_level": (
                        class_level.id
                    ),

                    "class_name": (
                        class_level.name
                    ),

                    "academic_session": (
                        academic_session.id
                    ),

                    "session_name": (
                        academic_session.name
                    ),

                    "term": term.id,

                    "term_name": (
                        term.get_name_display()
                    ),
                },

                "optional_selection": (
                    optional_selection
                ),

                "general_compulsory": (
                    general_compulsory
                ),

                "department_compulsory": (
                    department_compulsory
                ),

                "selected_optional": (
                    selected_optional
                ),

                "available_optional": (
                    available_optional
                ),
            }
        )


# =========================================================
# SELECT OPTIONAL SUBJECT
# =========================================================

class StudentOptionalSubjectSelectView(
    generics.CreateAPIView
):
    permission_classes = [IsAuthenticated]

    def create(
        self,
        request,
        *args,
        **kwargs,
    ):
        student = get_object_or_404(
            Student.objects.select_related(
                "school",
                "department",
            ),
            id=kwargs["student_id"],
        )

        enrollment = (
            StudentEnrollment.objects
            .select_related(
                "student",
                "class_level",
                "academic_session",
                "term",
            )
            .filter(
                student=student,
                is_current=True,
            )
            .order_by("-id")
            .first()
        )

        if enrollment is None:
            return Response(
                {
                    "detail": (
                        "This student does not have "
                        "a current enrollment."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        optional_setting = (
            get_optional_subject_setting(
                enrollment
            )
        )

        optional_status = (
            get_optional_selection_status(
                optional_setting
            )
        )

        if not optional_status["can_select"]:
            messages = {
                "NOT_CONFIGURED": (
                    "Optional subject selection "
                    "has not been configured for "
                    "this class, session and term."
                ),

                "DISABLED": (
                    "Optional subject selection "
                    "is currently disabled."
                ),

                "NOT_STARTED": (
                    "Optional subject selection "
                    "has not started yet."
                ),

                "CLOSED": (
                    "Optional subject selection "
                    "is closed. You can no longer "
                    "change optional subjects."
                ),
            }

            return Response(
                {
                    "detail": messages.get(
                        optional_status["status"],
                        (
                            "Optional subject selection "
                            "is currently unavailable."
                        ),
                    ),

                    "status": (
                        optional_status["status"]
                    ),
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        subject_id = request.data.get(
            "subject_id"
        )

        if not subject_id:
            return Response(
                {
                    "subject_id": (
                        "Subject ID is required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        class_subject = (
            ClassSubject.objects
            .select_related(
                "class_level",
                "subject",
                "subject__department",
            )
            .filter(
                class_level=enrollment.class_level,
                subject_id=subject_id,
                is_active=True,
                subject__is_active=True,
            )
            .first()
        )

        if class_subject is None:
            return Response(
                {
                    "detail": (
                        "This subject is not available "
                        "for the student's current class."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            class_subject.assignment_type
            != "OPTIONAL"
        ):
            return Response(
                {
                    "detail": (
                        "Only optional subjects can "
                        "be selected by the student."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing = (
            StudentSubjectEnrollment.objects
            .filter(
                student_enrollment=enrollment,
                subject=class_subject.subject,
                academic_session=(
                    enrollment.academic_session
                ),
                term=enrollment.term,
            )
            .first()
        )

        if existing and existing.is_active:
            return Response(
                {
                    "detail": (
                        "The student has already "
                        "selected this subject."
                    ),

                    "subject": (
                        StudentSubjectEnrollmentSerializer(
                            existing
                        ).data
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        selected_subject_ids = set(
            StudentSubjectEnrollment.objects
            .filter(
                student_enrollment=enrollment,
                academic_session=(
                    enrollment.academic_session
                ),
                term=enrollment.term,
                is_active=True,
            )
            .values_list(
                "subject_id",
                flat=True,
            )
        )

        selected_optional_count = 0

        for selected_id in selected_subject_ids:
            is_optional = (
                ClassSubject.objects
                .filter(
                    class_level=enrollment.class_level,
                    subject_id=selected_id,
                    assignment_type="OPTIONAL",
                    is_active=True,
                    subject__is_active=True,
                )
                .exists()
            )

            if is_optional:
                selected_optional_count += 1

        if (
            selected_optional_count
            >= optional_setting.max_optional_subjects
        ):
            return Response(
                {
                    "detail": (
                        "The student can select "
                        "a maximum of "
                        f"{optional_setting.max_optional_subjects} "
                        "optional subject(s)."
                    ),

                    "max_optional_subjects": (
                        optional_setting
                        .max_optional_subjects
                    ),

                    "selected_count": (
                        selected_optional_count
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if existing:
            existing.is_active = True

            existing.save(
                update_fields=[
                    "is_active"
                ]
            )

            return Response(
                StudentSubjectEnrollmentSerializer(
                    existing
                ).data,
                status=status.HTTP_200_OK,
            )

        subject_enrollment = (
            StudentSubjectEnrollment.objects.create(
                student_enrollment=enrollment,
                subject=class_subject.subject,
                academic_session=(
                    enrollment.academic_session
                ),
                term=enrollment.term,
                is_core=False,
                is_active=True,
            )
        )

        return Response(
            StudentSubjectEnrollmentSerializer(
                subject_enrollment
            ).data,
            status=status.HTTP_201_CREATED,
        )


# =========================================================
# REMOVE OPTIONAL SUBJECT
# =========================================================

class StudentOptionalSubjectRemoveView(
    generics.DestroyAPIView
):
    permission_classes = [IsAuthenticated]

    def delete(
        self,
        request,
        student_id,
        subject_id,
    ):
        student = get_object_or_404(
            Student.objects.select_related(
                "school"
            ),
            id=student_id,
        )

        enrollment = (
            StudentEnrollment.objects
            .select_related(
                "student",
                "class_level",
                "academic_session",
                "term",
            )
            .filter(
                student=student,
                is_current=True,
            )
            .order_by("-id")
            .first()
        )

        if enrollment is None:
            return Response(
                {
                    "detail": (
                        "This student does not have "
                        "a current enrollment."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        optional_setting = (
            get_optional_subject_setting(
                enrollment
            )
        )

        optional_status = (
            get_optional_selection_status(
                optional_setting
            )
        )

        if not optional_status["can_change"]:
            messages = {
                "NOT_CONFIGURED": (
                    "Optional subject selection "
                    "has not been configured."
                ),

                "DISABLED": (
                    "Optional subject selection "
                    "is currently disabled."
                ),

                "NOT_STARTED": (
                    "Optional subject selection "
                    "has not started yet."
                ),

                "CLOSED": (
                    "Optional subject selection "
                    "is closed. You can no longer "
                    "change optional subjects."
                ),
            }

            return Response(
                {
                    "detail": messages.get(
                        optional_status["status"],
                        (
                            "Optional subject changes "
                            "are currently unavailable."
                        ),
                    ),

                    "status": (
                        optional_status["status"]
                    ),
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        subject_enrollment = (
            StudentSubjectEnrollment.objects
            .filter(
                student_enrollment=enrollment,
                subject_id=subject_id,
                academic_session=(
                    enrollment.academic_session
                ),
                term=enrollment.term,
                is_active=True,
            )
            .first()
        )

        if subject_enrollment is None:
            return Response(
                {
                    "detail": (
                        "This optional subject is "
                        "not selected by the student."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        is_optional = (
            ClassSubject.objects
            .filter(
                class_level=enrollment.class_level,
                subject_id=subject_id,
                assignment_type="OPTIONAL",
                is_active=True,
                subject__is_active=True,
            )
            .exists()
        )

        if not is_optional:
            return Response(
                {
                    "detail": (
                        "This subject is not an "
                        "optional subject."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        subject_enrollment.is_active = False

        subject_enrollment.save(
            update_fields=[
                "is_active"
            ]
        )

        return Response(
            {
                "message": (
                    "Optional subject removed "
                    "successfully."
                )
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# OPTIONAL SUBJECT SELECTION SETTINGS
# =========================================================

class OptionalSubjectSelectionSettingListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = (
        OptionalSubjectSelectionSettingSerializer
    )

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):
        return (
            OptionalSubjectSelectionSetting.objects
            .select_related(
                "school",
                "academic_session",
                "term",
                "class_level",
            )
            .all()
            .order_by(
                "-academic_session",
                "term",
                "class_level",
            )
        )


class OptionalSubjectSelectionSettingDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = (
        OptionalSubjectSelectionSettingSerializer
    )

    permission_classes = [
        IsAuthenticated
    ]

    queryset = (
        OptionalSubjectSelectionSetting.objects
        .select_related(
            "school",
            "academic_session",
            "term",
            "class_level",
        )
    )



from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import (
    GraduateStudentSerializer,
    GraduationRecordSerializer,
)

from .services import graduate_student


class GraduateStudentView(
    generics.CreateAPIView
):
    """
    Graduate one student.

    POST /graduation/

    Example:

    {
        "student": 53,
        "graduation_year": 2027,
        "remarks": "Successfully completed secondary education."
    }
    """

    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = (
        GraduateStudentSerializer
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

        student = serializer.validated_data[
            "student"
        ]

        graduation_year = (
            serializer.validated_data.get(
                "graduation_year"
            )
        )

        remarks = (
            serializer.validated_data.get(
                "remarks",
                "",
            )
        )

        # -----------------------------------------------------
        # SCHOOL ADMIN / SUPER ADMIN PERMISSION
        # -----------------------------------------------------

        allowed_roles = {
            "SUPER_ADMIN",
            "SCHOOL_ADMIN",
        }

        if request.user.role not in allowed_roles:
            return Response(
                {
                    "detail": (
                        "You do not have permission "
                        "to graduate students."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # -----------------------------------------------------
        # SCHOOL SECURITY
        # -----------------------------------------------------

        user_school = getattr(
            request.user,
            "school",
            None,
        )

        if (
            request.user.role != "SUPER_ADMIN"
            and user_school is not None
            and student.school_id != user_school.id
        ):
            return Response(
                {
                    "detail": (
                        "You cannot graduate a student "
                        "from another school."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # -----------------------------------------------------
        # GRADUATE
        # -----------------------------------------------------

        graduation_record = graduate_student(
            student_id=student.id,
            graduation_year=graduation_year,
            remarks=remarks,
        )

        log_audit(
            request=request,
            action="UPDATE",
            model_name="Student",
            object_id=student.id,
            object_repr=(
                f"{student.full_name} - "
                f"{student.admission_number}"
            ),
            description=(
                f"Student '{student.full_name}' "
                f"({student.admission_number}) was manually "
                f"graduated for the {graduation_record.graduation_year} "
                f"graduation year."
            ),
        )

        output_serializer = (
            GraduationRecordSerializer(
                graduation_record
            )
        )

        return Response(
            {
                "message": (
                    f"{student.full_name} "
                    "has been successfully graduated."
                ),
                "graduation": (
                    output_serializer.data
                ),
            },
            status=status.HTTP_201_CREATED,
        )


class GraduationEligibleStudentListView(generics.ListAPIView):
    """
    Return students who are eligible for graduation.

    Graduation eligibility rules:

        1. Student must be ACTIVE.
        2. Student must have a CURRENT enrollment.
        3. Student's current class must be SS3.

    SS3 is automatically considered the graduating class.

    The ClassLevel.is_graduating_class flag is intentionally
    not required here.
    """

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            Student.objects
            .filter(
                status=Student.Status.ACTIVE,
                enrollments__is_current=True,
                enrollments__class_level__education_level=(
                    ClassLevel.EducationLevel.SS
                ),
                enrollments__class_level__name__istartswith="SS3",
            )
            .select_related(
                "school",
                "graduation_session",
            )
            .prefetch_related(
                "enrollments__academic_session",
                "enrollments__term",
                "enrollments__class_level",
            )
            .distinct()
            .order_by(
                "last_name",
                "first_name",
            )
        )

        # ========================================================
        # SCHOOL ACCESS
        # ========================================================

        user_school = getattr(
            self.request.user,
            "school",
            None,
        )

        if (
            self.request.user.role != "SUPER_ADMIN"
            and user_school is not None
        ):
            queryset = queryset.filter(
                school_id=user_school.id
            )

        return queryset

    def list(self, request, *args, **kwargs):
        students = self.get_queryset()

        data = []

        for student in students:

            enrollment = (
                student.enrollments
                .filter(
                    is_current=True,
                    class_level__education_level=(
                        ClassLevel.EducationLevel.SS
                    ),
                    class_level__name__istartswith="SS3",
                )
                .select_related(
                    "academic_session",
                    "term",
                    "class_level",
                )
                .order_by(
                    "-academic_session_id",
                    "-term_id",
                    "-id",
                )
                .first()
            )

            if not enrollment:
                continue

            data.append({
                "id": student.id,

                "full_name": student.full_name,

                "admission_number": (
                    student.admission_number
                ),

                "status": student.status,

                "school": student.school_id,

                "academic_session": (
                    enrollment.academic_session_id
                ),

                "academic_session_name": (
                    enrollment.academic_session.name
                ),

                "term": enrollment.term_id,

                "term_name": (
                    enrollment.term.get_name_display()
                ),

                "class_level": (
                    enrollment.class_level_id
                ),

                "class_name": (
                    enrollment.class_level.name
                ),

                # SS3 is automatically treated
                # as a graduating class.
                "is_graduating_class": True,
            })

        return Response(data)
# ============================================================
# GRADUATION HISTORY
# ============================================================

class GraduationRecordListView(
    generics.ListAPIView
):
    """
    Return graduation records only.

    Optional filters:

        ?student=1
        ?session=1
    """

    permission_classes = [
        IsAuthenticated
    ]

    serializer_class = (
        GraduationRecordSerializer
    )

    def get_queryset(self):

        queryset = (
            PromotionRecord.objects
            .filter(
                promotion_type=(
                    PromotionRecord.PromotionType.GRADUATED
                ),
                is_final=True,
            )
            .select_related(
                "student",
                "from_session",
                "from_term",
                "from_class",
                "to_session",
                "to_term",
                "to_class",
            )
            .order_by(
                "-promotion_date",
                "-id",
            )
        )

        # -----------------------------------------------------
        # STUDENT FILTER
        # -----------------------------------------------------

        student_id = (
            self.request.query_params.get(
                "student"
            )
        )

        if student_id:
            queryset = queryset.filter(
                student_id=student_id
            )

        # -----------------------------------------------------
        # SESSION FILTER
        # -----------------------------------------------------

        academic_session = (
            self.request.query_params.get(
                "session"
            )
        )

        if academic_session:
            queryset = queryset.filter(
                from_session_id=academic_session
            )

        return queryset




# # ============================================================
# # PARENT ASSIGNMENTS
# # ============================================================

# class ParentAssignmentListView(generics.ListAPIView):
#     """
#     Returns assignments belonging ONLY to the authenticated
#     parent's children.

#     Security rules:

#     1. The authenticated user must be a PARENT.
#     2. The parent profile is obtained from request.user.parent_profile.
#     3. Children are obtained from ParentGuardian.students.
#     4. A parent cannot request arbitrary student IDs to bypass
#        ownership.
#     5. WHOLE_CLASS assignments are visible when the assignment
#        matches the child's enrollment.
#     6. SELECTED_STUDENTS assignments are visible only when the
#        child is explicitly included in target_students.
#     7. Only PUBLISHED assignments are visible.
#     """

#     serializer_class = ParentAssignmentSerializer
#     permission_classes = [
#         permissions.IsAuthenticated,
#     ]

#     def get_parent(self):
#         user = self.request.user

#         if user.role != User.Role.PARENT:
#             return None

#         return getattr(
#             user,
#             "parent_profile",
#             None,
#         )

#     def get_children(self):
#         parent = self.get_parent()

#         if not parent:
#             return Student.objects.none()

#         return (
#             Student.objects
#             .filter(
#                 parents=parent,
#                 school_id=parent.school_id,
#             )
#             .select_related(
#                 "school",
#                 "department",
#             )
#             .prefetch_related(
#                 "enrollments__academic_session",
#                 "enrollments__term",
#                 "enrollments__class_level",
#             )
#             .distinct()
#         )

#     def get_queryset(self):
#         parent = self.get_parent()

#         if not parent:
#             return Assignment.objects.none()

#         children = self.get_children()

#         if not children.exists():
#             return Assignment.objects.none()

#         # --------------------------------------------------------
#         # OPTIONAL FILTERS
#         # --------------------------------------------------------

#         session_id = self.request.query_params.get(
#             "academic_session"
#         )

#         term_id = self.request.query_params.get(
#             "term"
#         )

#         student_id = self.request.query_params.get(
#             "student"
#         )

#         # --------------------------------------------------------
#         # IMPORTANT:
#         #
#         # If a student filter is supplied, it MUST belong to
#         # the authenticated parent.
#         # --------------------------------------------------------

#         if student_id:

#             try:
#                 student_id = int(student_id)
#             except (TypeError, ValueError):
#                 return Assignment.objects.none()

#             children = children.filter(
#                 id=student_id
#             )

#             if not children.exists():
#                 return Assignment.objects.none()

#         # --------------------------------------------------------
#         # GET VALID CHILD ENROLLMENTS
#         # --------------------------------------------------------

#         enrollments = (
#             StudentEnrollment.objects
#             .filter(
#                 student__in=children,
#             )
#             .select_related(
#                 "student",
#                 "academic_session",
#                 "term",
#                 "class_level",
#             )
#         )

#         if session_id:
#             enrollments = enrollments.filter(
#                 academic_session_id=session_id
#             )

#         if term_id:
#             enrollments = enrollments.filter(
#                 term_id=term_id
#             )

#         # --------------------------------------------------------
#         # BUILD CHILD-SPECIFIC ACCESS CONDITIONS
#         # --------------------------------------------------------
#         #
#         # Each child may be in a different class.
#         #
#         # We therefore construct conditions based on the actual
#         # enrollment records.
#         # --------------------------------------------------------

#         enrollment_conditions = Q()

#         for enrollment in enrollments:

#             # ----------------------------------------------------
#             # WHOLE CLASS
#             # ----------------------------------------------------

#             enrollment_conditions |= Q(
#                 academic_session_id=(
#                     enrollment.academic_session_id
#                 ),
#                 term_id=enrollment.term_id,
#                 class_level_id=enrollment.class_level_id,
#                 target_type=Assignment.TargetType.WHOLE_CLASS,
#             )

#             # ----------------------------------------------------
#             # SELECTED STUDENT
#             # ----------------------------------------------------

#             enrollment_conditions |= Q(
#                 academic_session_id=(
#                     enrollment.academic_session_id
#                 ),
#                 term_id=enrollment.term_id,
#                 class_level_id=enrollment.class_level_id,
#                 target_type=(
#                     Assignment.TargetType.SELECTED_STUDENTS
#                 ),
#                 target_students=enrollment.student_id,
#             )

#         if not enrollment_conditions:
#             return Assignment.objects.none()

#         queryset = (
#             Assignment.objects
#             .filter(
#                 school_id=parent.school_id,
#                 status=Assignment.Status.PUBLISHED,
#             )
#             .filter(
#                 enrollment_conditions
#             )
#             .select_related(
#                 "school",
#                 "academic_session",
#                 "term",
#                 "class_level",
#                 "subject",
#                 "teacher",
#             )
#             .prefetch_related(
#                 "target_students",
#                 "submissions",
#             )
#             .distinct()
#         )

#         return queryset