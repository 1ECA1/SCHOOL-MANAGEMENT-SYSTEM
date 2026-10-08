from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied

from django.contrib.auth import get_user_model
User = get_user_model()

from .models import (
    School,
    AcademicSession,
    Term,
    ClassLevel,
    Department,
    Subject,
    AcademicSection,
    ClassSubject,
)

from .serializers import (
    SchoolSerializer,
    AcademicSessionSerializer,
    TermSerializer,
    ClassLevelSerializer,
    DepartmentSerializer,
    SubjectSerializer,
    AcademicSectionSerializer,
    ClassSubjectSerializer,
)

from .permissions import (
    IsAcademicManager,
    IsAcademicViewer,
    IsPublicAcademicViewer,
)


# ============================================================
# SCHOOL-SCOPED VIEWSET MIXIN
# ============================================================

class SchoolScopedViewSetMixin:
    """
    Restricts academic records to the user's school.

    SUPER_ADMIN:
        Can access all schools.

    SCHOOL_ADMIN:
        Can access only their assigned school.

    PRINCIPAL:
        Can read records from their assigned school.

    ADMISSION_OFFICER:
        Can read records from their assigned school.

    EXAM_OFFICER:
        Can read records from their assigned school.

    ACCOUNTANT:
        Can read records from the school attached to their
        active AccountantProfile.

    TEACHER:
        Can read records from the school attached to their
        Teacher profile.

    Write access is still controlled separately by
    IsAcademicManager.
    """

    school_filter_field = "school_id"
    direct_school_field = True

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        # Public admission form can read academic data
        if not user.is_authenticated:
            school_id = self.request.query_params.get("school")

            if school_id:
                try:
                    school_id = int(school_id)
                except (TypeError, ValueError):
                    raise ValidationError({
                        "school": "School must be a valid school ID."
                    })

                return queryset.filter(
                    school_id=school_id
                )

            return queryset

        if user.role == "SUPER_ADMIN":

            return queryset

        # --------------------------------------------------------
        # SCHOOL ADMIN / PRINCIPAL / ADMISSION / EXAM
        # --------------------------------------------------------
        if user.role in [
            "SCHOOL_ADMIN",
            "PRINCIPAL",
            "ADMISSION_OFFICER",
            "EXAM_OFFICER",
        ]:
            if not user.school_id:
                return queryset.none()

            return queryset.filter(
                **{
                    self.school_filter_field: user.school_id,
                }
            )

        # --------------------------------------------------------
        # ACCOUNTANT
        # --------------------------------------------------------
        if user.role == "ACCOUNTANT":
            accountant_profile = getattr(
                user,
                "accountant_profile",
                None,
            )

            if not accountant_profile:
                return queryset.none()

            if not accountant_profile.is_active:
                return queryset.none()

            if not accountant_profile.school_id:
                return queryset.none()

            return queryset.filter(
                **{
                    self.school_filter_field: (
                        accountant_profile.school_id
                    ),
                }
            )

        # --------------------------------------------------------
        # TEACHER
        # --------------------------------------------------------
        if user.role == "TEACHER":
            teacher_profile = getattr(
                user,
                "teacher_profile",
                None,
            )

            if not teacher_profile:
                return queryset.none()

            if not teacher_profile.school_id:
                return queryset.none()

            return queryset.filter(
                **{
                    self.school_filter_field: (
                        teacher_profile.school_id
                    ),
                }
            )

        # --------------------------------------------------------
        # ALL OTHER ROLES
        # --------------------------------------------------------
        return queryset.none()

    def get_serializer(self, *args, **kwargs):
        """
        For School Admins, automatically use their assigned school.

        Teachers are read-only here, so they never get school
        assignment behavior from this method.
        """

        user = self.request.user

        if (
            self.direct_school_field
            and user.is_authenticated
            and user.role == "SCHOOL_ADMIN"
            and user.school_id
        ):
            data = kwargs.get("data")

            if data is not None:
                data = data.copy()

                if "school" in data:
                    supplied_school = data.get("school")

                    if (
                        supplied_school not in [None, ""]
                        and str(supplied_school)
                        != str(user.school_id)
                    ):
                        raise ValidationError(
                            {
                                "school": (
                                    "You can only manage academic data "
                                    "for your assigned school."
                                )
                            }
                        )

                data["school"] = user.school_id
                kwargs["data"] = data

        return super().get_serializer(*args, **kwargs)

    def perform_create(self, serializer):
        user = self.request.user

        if (
            user.role == "SCHOOL_ADMIN"
            and user.school_id
            and self.direct_school_field
        ):
            serializer.save(
                school_id=user.school_id
            )
            return

        super().perform_create(serializer)

    def perform_update(self, serializer):
        user = self.request.user

        if (
            user.role == "SCHOOL_ADMIN"
            and user.school_id
            and self.direct_school_field
        ):
            serializer.save(
                school_id=user.school_id
            )
            return

        super().perform_update(serializer)


# ============================================================
# SCHOOL
# ============================================================

# ============================================================
# SCHOOL
# ============================================================

class SchoolViewSet(viewsets.ModelViewSet):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer

    # --------------------------------------------------------
    # PERMISSIONS
    # --------------------------------------------------------

    def get_permissions(self):
        if self.request.method in [
            "GET",
            "HEAD",
            "OPTIONS",
        ]:
            return [IsPublicAcademicViewer()]

        return [IsAcademicManager()]

    # --------------------------------------------------------
    # QUERYSET
    # --------------------------------------------------------

    def get_queryset(self):
        user = self.request.user

        # Public admission form
        if not user.is_authenticated:
            return School.objects.all().order_by("name")

        if user.role == User.Role.SUPER_ADMIN:
            return School.objects.all().order_by("name")

        if user.role in {
            User.Role.SCHOOL_ADMIN,
            User.Role.PRINCIPAL,
            User.Role.ADMISSION_OFFICER,
            User.Role.EXAM_OFFICER,
        }:
            if not user.school_id:
                return School.objects.none()

            return School.objects.filter(
                id=user.school_id
            ).order_by("name")

        return School.objects.none()

 
# ============================================================
# ACADEMIC SESSION
# ============================================================

class AcademicSessionViewSet(
    SchoolScopedViewSetMixin,
    viewsets.ModelViewSet,
):
    """
    Academic sessions are directly attached to a school.

    SUPER_ADMIN:
        Can manage sessions for any school.

        Optional filtering:
            /academics/sessions/?school=1
            /academics/sessions/?school=2

    SCHOOL_ADMIN:
        Can manage sessions only for their assigned school.

    READ:
        SUPER_ADMIN
        SCHOOL_ADMIN
        PRINCIPAL
        ADMISSION_OFFICER
        EXAM_OFFICER
        ACCOUNTANT
        TEACHER

    MANAGE:
        SUPER_ADMIN
        SCHOOL_ADMIN
    """

    queryset = AcademicSession.objects.select_related(
        "school"
    ).all()

    serializer_class = AcademicSessionSerializer

    school_filter_field = "school_id"
    direct_school_field = True

    def get_permissions(self):
        if self.request.method in [
            "GET",
            "HEAD",
            "OPTIONS",
        ]:
            return [IsPublicAcademicViewer()]

        return [IsAcademicManager()]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        # =========================================================
        # PUBLIC ADMISSION APPLICATION
        # =========================================================
        if not user.is_authenticated:
            school_id = self.request.query_params.get("school")

            if school_id:
                try:
                    school_id = int(school_id)
                except (TypeError, ValueError):
                    raise ValidationError({
                        "school": "School must be a valid school ID."
                    })

                return queryset.filter(
                    school_id=school_id
                )

            return queryset

        # =========================================================
        # EXISTING AUTHENTICATED LOGIC
        # =========================================================
        if user.role == "SUPER_ADMIN":
            
            school_id = self.request.query_params.get("school")

            if school_id:
                try:
                    school_id = int(school_id)
                except (TypeError, ValueError):
                    raise ValidationError(
                        {
                            "school": (
                                "School must be a valid school ID."
                            )
                        }
                    )

                return queryset.filter(
                    school_id=school_id
                )

            return queryset

        # --------------------------------------------------------
        # OTHER USERS
        # --------------------------------------------------------
        return queryset

    def perform_create(self, serializer):
        user = self.request.user

        school = serializer.validated_data.get(
            "school"
        )

        # --------------------------------------------------------
        # SCHOOL ADMIN
        # --------------------------------------------------------
        if user.role == "SCHOOL_ADMIN":
            if not user.school_id:
                raise ValidationError(
                    {
                        "school": (
                            "Your School Admin account is not "
                            "assigned to a school."
                        )
                    }
                )

            if not school:
                raise ValidationError(
                    {
                        "school": (
                            "School is required."
                        )
                    }
                )

            if school.id != user.school_id:
                raise ValidationError(
                    {
                        "school": (
                            "You can only create academic "
                            "sessions for your assigned school."
                        )
                    }
                )

        # --------------------------------------------------------
        # SUPER ADMIN
        # --------------------------------------------------------
        elif user.role == "SUPER_ADMIN":
            if not school:
                raise ValidationError(
                    {
                        "school": (
                            "School is required when creating "
                            "an academic session."
                        )
                    }
                )

        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user

        current_school = serializer.instance.school

        school = serializer.validated_data.get(
            "school",
            current_school,
        )

        # --------------------------------------------------------
        # SCHOOL ADMIN
        # --------------------------------------------------------
        if user.role == "SCHOOL_ADMIN":
            if not user.school_id:
                raise ValidationError(
                    {
                        "school": (
                            "Your School Admin account is not "
                            "assigned to a school."
                        )
                    }
                )

            if current_school.id != user.school_id:
                raise ValidationError(
                    {
                        "school": (
                            "You can only manage academic "
                            "sessions for your assigned school."
                        )
                    }
                )

            if school.id != user.school_id:
                raise ValidationError(
                    {
                        "school": (
                            "You can only manage academic "
                            "sessions for your assigned school."
                        )
                    }
                )

        # --------------------------------------------------------
        # SUPER ADMIN
        # --------------------------------------------------------
        elif user.role == "SUPER_ADMIN":
            if not school:
                raise ValidationError(
                    {
                        "school": (
                            "School is required."
                        )
                    }
                )

        serializer.save()


# ============================================================
# TERM
# ============================================================

class TermViewSet(viewsets.ModelViewSet):
    """
    Terms belong to an AcademicSession.

    SUPER_ADMIN:
        Can manage terms for any school.

        Optional filtering:
            /academics/terms/?school=1
            /academics/terms/?school=2

    SCHOOL_ADMIN:
        Can manage terms only for their assigned school.

    READ:
        SUPER_ADMIN
        SCHOOL_ADMIN
        PRINCIPAL
        ADMISSION_OFFICER
        EXAM_OFFICER
        ACCOUNTANT
        TEACHER

    MANAGE:
        SUPER_ADMIN
        SCHOOL_ADMIN
    """

    queryset = Term.objects.select_related(
        "academic_session",
        "academic_session__school",
    ).all()

    serializer_class = TermSerializer

    def get_permissions(self):
        if self.request.method in [
            "GET",
            "HEAD",
            "OPTIONS",
        ]:
            return [IsPublicAcademicViewer()]

        return [IsAcademicManager()]

    def get_queryset(self):
        queryset = self.queryset
        user = self.request.user

        # Public admission form
        if not user.is_authenticated:
            school_id = self.request.query_params.get("school")
            session_id = self.request.query_params.get("academic_session")

            if session_id:
                try:
                    session_id = int(session_id)
                except (TypeError, ValueError):
                    raise ValidationError({
                        "academic_session": "Academic session must be a valid ID."
                    })

                return queryset.filter(
                    academic_session_id=session_id
                )

            if school_id:
                try:
                    school_id = int(school_id)
                except (TypeError, ValueError):
                    raise ValidationError({
                        "school": "School must be a valid school ID."
                    })

                return queryset.filter(
                    academic_session__school_id=school_id
                )

            return queryset


        if user.role == "SUPER_ADMIN":

            school_id = self.request.query_params.get("school")

            if school_id:
                try:
                    school_id = int(school_id)
                except (TypeError, ValueError):
                    raise ValidationError(
                        {
                            "school": (
                                "School must be a valid school ID."
                            )
                        }
                    )

                return queryset.filter(
                    academic_session__school_id=school_id
                )

            return queryset

        # --------------------------------------------------------
        # SCHOOL ADMIN / PRINCIPAL / ADMISSION / EXAM
        # --------------------------------------------------------
        if user.role in [
            "SCHOOL_ADMIN",
            "PRINCIPAL",
            "ADMISSION_OFFICER",
            "EXAM_OFFICER",
        ]:
            if not user.school_id:
                return queryset.none()

            return queryset.filter(
                academic_session__school_id=user.school_id
            )

        # --------------------------------------------------------
        # ACCOUNTANT
        # --------------------------------------------------------
        if user.role == "ACCOUNTANT":
            accountant_profile = getattr(
                user,
                "accountant_profile",
                None,
            )

            if not accountant_profile:
                return queryset.none()

            if not accountant_profile.is_active:
                return queryset.none()

            if not accountant_profile.school_id:
                return queryset.none()

            return queryset.filter(
                academic_session__school_id=(
                    accountant_profile.school_id
                )
            )

        # --------------------------------------------------------
        # TEACHER
        # --------------------------------------------------------
        if user.role == "TEACHER":
            teacher_profile = getattr(
                user,
                "teacher_profile",
                None,
            )

            if not teacher_profile:
                return queryset.none()

            if not teacher_profile.school_id:
                return queryset.none()

            return queryset.filter(
                academic_session__school_id=(
                    teacher_profile.school_id
                )
            )

        # --------------------------------------------------------
        # ALL OTHER ROLES
        # --------------------------------------------------------
        return queryset.none()

    def _validate_school_access(
        self,
        academic_session,
    ):
        user = self.request.user

        # --------------------------------------------------------
        # SUPER ADMIN
        # --------------------------------------------------------
        if user.role == "SUPER_ADMIN":
            return

        # --------------------------------------------------------
        # SCHOOL ADMIN
        # --------------------------------------------------------
        if user.role == "SCHOOL_ADMIN":

            if not user.school_id:
                raise ValidationError(
                    {
                        "detail": (
                            "Your School Admin account is not "
                            "assigned to a school."
                        )
                    }
                )

            if academic_session.school_id != user.school_id:
                raise ValidationError(
                    {
                        "academic_session": (
                            "You can only create or manage terms "
                            "for your assigned school."
                        )
                    }
                )

            return

        raise ValidationError(
            {
                "detail": (
                    "You do not have permission to manage terms."
                )
            }
        )

    def perform_create(self, serializer):
        academic_session = serializer.validated_data.get(
            "academic_session"
        )

        if not academic_session:
            raise ValidationError(
                {
                    "academic_session": (
                        "Academic session is required."
                    )
                }
            )

        self._validate_school_access(
            academic_session
        )

        serializer.save()

    def perform_update(self, serializer):
        academic_session = serializer.validated_data.get(
            "academic_session",
            serializer.instance.academic_session,
        )

        self._validate_school_access(
            academic_session
        )

        serializer.save()

    @action(
        detail=True,
        methods=["post"],
        url_path="set-current",
    )
    def set_current(self, request, pk=None):
        term = self.get_object()

        term.is_current = True
        term.save()

        return Response(
            {
                "message": (
                    f"{term.get_name_display()} is now "
                    f"the current term."
                ),
                "term": TermSerializer(
                    term,
                    context={"request": request},
                ).data,
            }
        )


# ============================================================
# CLASS LEVEL
# ============================================================

class ClassLevelViewSet(
    SchoolScopedViewSetMixin,
    viewsets.ModelViewSet,
):
    """
    Primary, JSS and SS classes.

    READ:
        SUPER_ADMIN
        SCHOOL_ADMIN
        ACCOUNTANT

    MANAGE:
        SUPER_ADMIN
        SCHOOL_ADMIN
    """

    queryset = ClassLevel.objects.select_related(
        "school",
        "department",
    ).all()

    serializer_class = ClassLevelSerializer

    school_filter_field = "school_id"
    direct_school_field = True

    def get_permissions(self):
        if self.request.method in [
            "GET",
            "HEAD",
            "OPTIONS",
        ]:
            return [IsPublicAcademicViewer()]

        return [IsAcademicManager()]

# ============================================================
# DEPARTMENT
# ============================================================

class DepartmentViewSet(
    SchoolScopedViewSetMixin,
    viewsets.ModelViewSet,
):
    queryset = Department.objects.select_related("school").all()
    serializer_class = DepartmentSerializer

    def get_permissions(self):
        if self.request.method in [
            "GET",
            "HEAD",
            "OPTIONS",
        ]:
            return [IsPublicAcademicViewer()]

        return [IsAcademicManager()]

    school_filter_field = "school_id"
    direct_school_field = True


# ============================================================
# SUBJECT
# ============================================================

class SubjectViewSet(
    SchoolScopedViewSetMixin,
    viewsets.ModelViewSet,
):
    """
    School subjects.

    READ:
        - SUPER_ADMIN
        - SCHOOL_ADMIN
        - PRINCIPAL
        - ADMISSION_OFFICER
        - EXAM_OFFICER
        - ACCOUNTANT
        - TEACHER

    WRITE:
        - SUPER_ADMIN
        - SCHOOL_ADMIN

    The existing SubjectSerializer continues to handle:
        - education level
        - department rules
        - school validation
        - duplicate codes
    """

    queryset = Subject.objects.select_related(
        "school",
        "department",
    ).all()

    serializer_class = SubjectSerializer

    permission_classes = [IsAcademicManager]

    school_filter_field = "school_id"
    direct_school_field = True

    def get_permissions(self):
        """
        Academic data is readable by teachers and other
        authorized school-scoped users, but only academic
        managers can create/update/delete subjects.
        """

        if self.request.method in [
            "GET",
            "HEAD",
            "OPTIONS",
        ]:
            return [IsAcademicViewer()]

        return [IsAcademicManager()]


# ============================================================
# CLASS SUBJECT
# ============================================================

class ClassSubjectViewSet(viewsets.ModelViewSet):
    """
    Connects subjects to classes.

    Important rules already exist in ClassSubject.clean() and
    ClassSubjectSerializer:

        PRIMARY/JSS
            - No department subjects
            - No department compulsory assignment type

        SS
            - General compulsory subjects cannot belong to a
              department.
            - Department compulsory subjects must match the
              class department.
            - Optional subjects are allowed.
    """

    queryset = ClassSubject.objects.select_related(
        "class_level",
        "class_level__school",
        "class_level__department",
        "subject",
        "subject__school",
        "subject__department",
    ).all()

    serializer_class = ClassSubjectSerializer
    permission_classes = [IsAcademicManager]

    def get_permissions(self):
        if self.request.method in [
            "GET",
            "HEAD",
            "OPTIONS",
        ]:
            return [IsAcademicViewer()]

        return [IsAcademicManager()]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        # --------------------------------------------------------
        # SUPER ADMIN
        # --------------------------------------------------------
        if user.role == "SUPER_ADMIN":
            return queryset

        # --------------------------------------------------------
        # SCHOOL ADMIN / PRINCIPAL / ADMISSION / EXAM
        # --------------------------------------------------------
        if user.role in [
            "SCHOOL_ADMIN",
            "PRINCIPAL",
            "ADMISSION_OFFICER",
            "EXAM_OFFICER",
        ]:
            if not user.school_id:
                return queryset.none()

            return queryset.filter(
                class_level__school_id=user.school_id
            )

        # --------------------------------------------------------
        # ACCOUNTANT
        # --------------------------------------------------------
        if user.role == "ACCOUNTANT":
            accountant_profile = getattr(
                user,
                "accountant_profile",
                None,
            )

            if not accountant_profile:
                return queryset.none()

            if not accountant_profile.is_active:
                return queryset.none()

            if not accountant_profile.school_id:
                return queryset.none()

            return queryset.filter(
                class_level__school_id=(
                    accountant_profile.school_id
                )
            )

        # --------------------------------------------------------
        # TEACHER
        # --------------------------------------------------------
        if user.role == "TEACHER":
            teacher_profile = getattr(
                user,
                "teacher_profile",
                None,
            )

            if not teacher_profile:
                return queryset.none()

            if not teacher_profile.school_id:
                return queryset.none()

            return queryset.filter(
                class_level__school_id=(
                    teacher_profile.school_id
                )
            )

        # --------------------------------------------------------
        # ALL OTHER ROLES
        # --------------------------------------------------------
        return queryset.none()

    def _validate_school_access(
        self,
        class_level,
        subject,
    ):
        user = self.request.user

        # --------------------------------------------------------
        # SUPER ADMIN
        # --------------------------------------------------------
        if user.role == "SUPER_ADMIN":
            return

        # --------------------------------------------------------
        # SCHOOL ADMIN
        # --------------------------------------------------------
        if user.role != "SCHOOL_ADMIN":
            raise ValidationError(
                {
                    "detail": (
                        "You do not have permission to manage "
                        "class subjects."
                    )
                }
            )

        if not user.school_id:
            raise ValidationError(
                {
                    "detail": (
                        "Your School Admin account is not "
                        "assigned to a school."
                    )
                }
            )

        if class_level.school_id != user.school_id:
            raise ValidationError(
                {
                    "class_level": (
                        "The selected class does not belong "
                        "to your school."
                    )
                }
            )

        if subject.school_id != user.school_id:
            raise ValidationError(
                {
                    "subject": (
                        "The selected subject does not belong "
                        "to your school."
                    )
                }
            )

    def perform_create(self, serializer):
        class_level = serializer.validated_data.get(
            "class_level"
        )

        subject = serializer.validated_data.get(
            "subject"
        )

        if not class_level:
            raise ValidationError(
                {
                    "class_level": (
                        "Class level is required."
                    )
                }
            )

        if not subject:
            raise ValidationError(
                {
                    "subject": (
                        "Subject is required."
                    )
                }
            )

        self._validate_school_access(
            class_level,
            subject,
        )

        serializer.save()

    def perform_update(self, serializer):
        class_level = serializer.validated_data.get(
            "class_level",
            serializer.instance.class_level,
        )

        subject = serializer.validated_data.get(
            "subject",
            serializer.instance.subject,
        )

        self._validate_school_access(
            class_level,
            subject,
        )

        serializer.save()


# ============================================================
# ACADEMIC SECTION
# ============================================================

class AcademicSectionViewSet(
    SchoolScopedViewSetMixin,
    viewsets.ModelViewSet,
):
    queryset = AcademicSection.objects.select_related("school").all()
    serializer_class = AcademicSectionSerializer

    def get_permissions(self):
        if self.request.method in ["GET", "HEAD", "OPTIONS"]:
            return [IsAcademicViewer()]

        return [IsAcademicManager()]

    school_filter_field = "school_id"
    direct_school_field = True