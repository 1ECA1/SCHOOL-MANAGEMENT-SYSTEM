from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from django.utils.crypto import get_random_string
import re


from rest_framework import generics, status
from rest_framework.parsers import (
    JSONParser,
    FormParser,
    MultiPartParser,
)
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User

from students.models import (
    Student,
    StudentEnrollment,
    ParentGuardian,
    StudentSubjectEnrollment,
)

from academics.models import (
    AcademicSession,
    Term,
    ClassSubject,
)

from .models import (
    AdmissionOfficerProfile,
    Applicant,
)

from .serializers import (
    AdmissionOfficerCreateSerializer,
    AdmissionOfficerProfileSerializer,
    ApplicantSerializer,
    ApplicantCreateSerializer,
    ApplicantStatusSerializer,
    AdmitApplicantSerializer,
)


User = get_user_model()


# ============================================================
# HELPERS
# ============================================================

def is_school_admin(user):
    return str(
        getattr(user, "role", "")
    ).upper() in [
        "SUPER_ADMIN",
        "SCHOOL_ADMIN",
    ]


def is_admission_officer(user):
    return str(
        getattr(user, "role", "")
    ).upper() == "ADMISSION_OFFICER"


def is_admission_manager(user):
    """
    Roles allowed to manage admissions.
    """

    return str(
        getattr(user, "role", "")
    ).upper() in [
        "SUPER_ADMIN",
        "SCHOOL_ADMIN",
        "ADMISSION_OFFICER",
    ]


def generate_temporary_password():
    return get_random_string(
        length=12,
    )


def generate_application_number():
    """
    Generate a unique application number.

    Example:
        APP-2026-0001
    """

    year = timezone.now().year

    last_applicant = (
        Applicant.objects
        .filter(
            application_number__startswith=f"APP-{year}-"
        )
        .order_by("-id")
        .first()
    )

    if last_applicant:
        try:
            last_number = int(
                last_applicant.application_number.split("-")[-1]
            )
        except (ValueError, IndexError):
            last_number = 0
    else:
        last_number = 0

    return f"APP-{year}-{last_number + 1:04d}"


# ============================================================
# ADMISSION OFFICER LIST / CREATE
# ============================================================

class AdmissionOfficerListCreateView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        if not is_school_admin(request.user):
            return Response(
                {
                    "detail": (
                        "Only SUPER_ADMIN and SCHOOL_ADMIN "
                        "can view Admission Officers."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        queryset = (
            AdmissionOfficerProfile.objects
            .select_related(
                "user",
                "school",
            )
            .all()
        )

        user_role = str(
            getattr(
                request.user,
                "role",
                "",
            )
        ).upper()

        if user_role == "SCHOOL_ADMIN":

            user_school = getattr(
                request.user,
                "school_id",
                None,
            )

            if user_school:
                queryset = queryset.filter(
                    school_id=user_school
                )

        serializer = AdmissionOfficerProfileSerializer(
            queryset,
            many=True,
        )

        return Response(
            serializer.data
        )

    @transaction.atomic
    def post(self, request):

        if not is_school_admin(request.user):
            return Response(
                {
                    "detail": (
                        "Only SUPER_ADMIN and SCHOOL_ADMIN "
                        "can create Admission Officers."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = AdmissionOfficerCreateSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = serializer.validated_data

        school = data["school"]

        user_role = str(
            getattr(
                request.user,
                "role",
                "",
            )
        ).upper()

        if user_role == "SCHOOL_ADMIN":

            user_school = getattr(
                request.user,
                "school_id",
                None,
            )

            if user_school != school.id:
                return Response(
                    {
                        "detail": (
                            "You can only create an "
                            "Admission Officer for your school."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        employee_number = data["employee_number"].strip()

        username = employee_number

        temporary_password = generate_temporary_password()

        new_user = User.objects.create_user(
            username=username,
            password=temporary_password,
            first_name=data["first_name"],
            last_name=data["last_name"],
            email=data.get("email", ""),
            phone_number=data.get(
                "phone_number",
                "",
            ),
            role="ADMISSION_OFFICER",
        )

        if hasattr(new_user, "school_id"):

            new_user.school_id = school.id

            new_user.save(
                update_fields=["school"]
            )

        profile = AdmissionOfficerProfile.objects.create(
            user=new_user,
            school=school,
            employee_number=employee_number,
            employment_date=data.get(
                "employment_date"
            ),
        )

        profile_serializer = AdmissionOfficerProfileSerializer(
            profile
        )

        return Response(
            {
                "message": (
                    "Admission Officer created successfully."
                ),
                "admission_officer": profile_serializer.data,
                "credentials": {
                    "username": username,
                    "password": temporary_password,
                },
                "important": (
                    "Save these login credentials now. "
                    "The generated password is returned "
                    "only during account creation."
                ),
            },
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# ADMISSION OFFICER DETAIL
# ============================================================

class AdmissionOfficerDetailView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get_object(self, pk):

        return (
            AdmissionOfficerProfile.objects
            .select_related(
                "user",
                "school",
            )
            .get(pk=pk)
        )

    def get(self, request, pk):

        if not is_school_admin(request.user):
            return Response(
                {
                    "detail": (
                        "Only SUPER_ADMIN and SCHOOL_ADMIN "
                        "can view Admission Officers."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            profile = self.get_object(pk)

        except AdmissionOfficerProfile.DoesNotExist:
            return Response(
                {
                    "detail": (
                        "Admission Officer not found."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if (
            str(
                getattr(
                    request.user,
                    "role",
                    "",
                )
            ).upper()
            == "SCHOOL_ADMIN"
        ):

            user_school = getattr(
                request.user,
                "school_id",
                None,
            )

            if user_school != profile.school_id:
                return Response(
                    {
                        "detail": (
                            "You can only view an "
                            "Admission Officer in your school."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        serializer = AdmissionOfficerProfileSerializer(
            profile
        )

        return Response(
            serializer.data
        )

    def patch(self, request, pk):

        if not is_school_admin(request.user):
            return Response(
                {
                    "detail": (
                        "Only SUPER_ADMIN and SCHOOL_ADMIN "
                        "can update Admission Officers."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            profile = self.get_object(pk)

        except AdmissionOfficerProfile.DoesNotExist:
            return Response(
                {
                    "detail": (
                        "Admission Officer not found."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if (
            str(
                getattr(
                    request.user,
                    "role",
                    "",
                )
            ).upper()
            == "SCHOOL_ADMIN"
        ):

            user_school = getattr(
                request.user,
                "school_id",
                None,
            )

            if user_school != profile.school_id:
                return Response(
                    {
                        "detail": (
                            "You can only update an "
                            "Admission Officer in your school."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        changed = False

        if "employment_date" in request.data:
            profile.employment_date = request.data[
                "employment_date"
            ]
            changed = True

        if "is_active" in request.data:
            profile.is_active = request.data[
                "is_active"
            ]
            changed = True

        if changed:
            profile.save()

        serializer = AdmissionOfficerProfileSerializer(
            profile
        )

        return Response(
            serializer.data
        )

    @transaction.atomic
    def delete(self, request, pk):

        if not is_school_admin(request.user):
            return Response(
                {
                    "detail": (
                        "Only SUPER_ADMIN and SCHOOL_ADMIN "
                        "can delete Admission Officers."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            profile = self.get_object(pk)

        except AdmissionOfficerProfile.DoesNotExist:
            return Response(
                {
                    "detail": (
                        "Admission Officer not found."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if (
            str(
                getattr(
                    request.user,
                    "role",
                    "",
                )
            ).upper()
            == "SCHOOL_ADMIN"
        ):

            user_school = getattr(
                request.user,
                "school_id",
                None,
            )

            if user_school != profile.school_id:
                return Response(
                    {
                        "detail": (
                            "You can only delete an "
                            "Admission Officer in your school."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        profile.user.delete()

        return Response(
            {
                "message": (
                    "Admission Officer deleted successfully."
                )
            },
            status=status.HTTP_204_NO_CONTENT,
        )


# ============================================================
# MY ADMISSION OFFICER PROFILE
# ============================================================

class MyAdmissionOfficerProfileView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        if not is_admission_officer(
            request.user
        ):
            return Response(
                {
                    "detail": (
                        "Only Admission Officers "
                        "can access this profile."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:

            profile = (
                AdmissionOfficerProfile.objects
                .select_related(
                    "user",
                    "school",
                )
                .get(
                    user=request.user
                )
            )

        except AdmissionOfficerProfile.DoesNotExist:

            return Response(
                {
                    "detail": (
                        "You do not have an "
                        "Admission Officer profile."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AdmissionOfficerProfileSerializer(
            profile
        )

        return Response(
            serializer.data
        )


# ============================================================
# APPLICANT LIST / CREATE
# ============================================================


class ApplicantListCreateView(
        generics.ListCreateAPIView
    ):

        permission_classes = [
            IsAuthenticated
        ]

        parser_classes = [
            MultiPartParser,
            FormParser,
            JSONParser,
        ]

        # ============================================================
        # PERMISSIONS
        # ============================================================

        def get_permissions(self):

            if self.request.method == "POST":
                return [AllowAny()]

            return [IsAuthenticated()]

        # ============================================================
        # SERIALIZER
        # ============================================================

        def get_serializer_class(self):

            if self.request.method == "POST":
                return ApplicantCreateSerializer

            return ApplicantSerializer

        # ============================================================
        # CREATE APPLICANT
        # ============================================================

        def create(self, request, *args, **kwargs):

            serializer = self.get_serializer(
                data=request.data
            )

            serializer.is_valid(
                raise_exception=True
            )

            # --------------------------------------------------------
            # CREATE APPLICANT
            # --------------------------------------------------------

            applicant = serializer.save()

            # --------------------------------------------------------
            # SERIALIZE THE CREATED APPLICANT
            # --------------------------------------------------------

            response_serializer = ApplicantSerializer(
                applicant,
                context={
                    "request": request,
                },
            )

            # --------------------------------------------------------
            # RETURN CREATED APPLICANT
            # --------------------------------------------------------

            return Response(
                {
                    "message": "Applicant created successfully.",

                    "applicant": response_serializer.data,

                    "applicant_id": applicant.id,
                },
                status=status.HTTP_201_CREATED,
            )

        # ============================================================
        # LIST / FILTER APPLICANTS
        # ============================================================

        def get_queryset(self):

            user = self.request.user

            queryset = (
                Applicant.objects
                .select_related(
                    "school",
                    "academic_session",
                    "class_level",
                    "department",
                    "reviewed_by",
                    "admitted_student",
                )
            )

            # --------------------------------------------------------
            # UNAUTHENTICATED USERS
            # --------------------------------------------------------

            if not user.is_authenticated:
                return queryset.none()

            # --------------------------------------------------------
            # SUPER ADMIN
            # --------------------------------------------------------

            if user.role == User.Role.SUPER_ADMIN:

                pass

            # --------------------------------------------------------
            # SCHOOL ADMIN
            # --------------------------------------------------------

            elif user.role == User.Role.SCHOOL_ADMIN:

                if (
                    hasattr(user, "school_id")
                    and user.school_id
                ):

                    queryset = queryset.filter(
                        school_id=user.school_id
                    )

                else:

                    queryset = queryset.none()

            # --------------------------------------------------------
            # ADMISSION OFFICER
            # --------------------------------------------------------

            elif user.role == User.Role.ADMISSION_OFFICER:

                profile = getattr(
                    user,
                    "admission_officer_profile",
                    None,
                )

                if profile:

                    queryset = queryset.filter(
                        school_id=profile.school_id
                    )

                else:

                    queryset = queryset.none()

            # --------------------------------------------------------
            # OTHER ROLES
            # --------------------------------------------------------

            else:

                queryset = queryset.none()

            # ========================================================
            # SEARCH
            # ========================================================

            search = self.request.query_params.get(
                "search",
                "",
            ).strip()

            if search:

                queryset = queryset.filter(
                    Q(
                        application_number__icontains=search
                    )
                    | Q(
                        first_name__icontains=search
                    )
                    | Q(
                        middle_name__icontains=search
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
                        guardian_name__icontains=search
                    )
                    | Q(
                        guardian_phone__icontains=search
                    )
                )

            # ========================================================
            # STATUS FILTER
            # ========================================================

            status_filter = self.request.query_params.get(
                "status",
                "",
            ).strip()

            if status_filter:

                queryset = queryset.filter(
                    status=status_filter
                )

            # ========================================================
            # APPLICATION SOURCE FILTER
            # ========================================================

            source = self.request.query_params.get(
                "application_source",
                "",
            ).strip()

            if source:

                queryset = queryset.filter(
                    application_source=source
                )

            return queryset


# ============================================================
# APPLICANT DETAIL
# ============================================================

class ApplicantDetailView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    parser_classes = [
        MultiPartParser,
        FormParser,
        JSONParser,
    ]

    def get_object(self, pk):

        return (
            Applicant.objects
            .select_related(
                "school",
                "academic_session",
                "class_level",
                "department",
                "reviewed_by",
                "admitted_student",
            )
            .get(pk=pk)
        )

    def get(self, request, pk):

        if not is_admission_manager(
            request.user
        ):
            return Response(
                {
                    "detail": (
                        "You do not have permission "
                        "to view applicants."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            applicant = self.get_object(pk)

        except Applicant.DoesNotExist:
            return Response(
                {
                    "detail": "Applicant not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        user_role = str(
            getattr(
                request.user,
                "role",
                "",
            )
        ).upper()

        if user_role == "SCHOOL_ADMIN":

            user_school = getattr(
                request.user,
                "school_id",
                None,
            )

            if user_school != applicant.school_id:
                return Response(
                    {
                        "detail": (
                            "You can only view applicants "
                            "from your school."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        elif user_role == "ADMISSION_OFFICER":

            profile = getattr(
                request.user,
                "admission_officer_profile",
                None,
            )

            if (
                not profile
                or profile.school_id != applicant.school_id
            ):
                return Response(
                    {
                        "detail": (
                            "You can only view applicants "
                            "from your school."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        serializer = ApplicantSerializer(
            applicant
        )

        return Response(
            serializer.data
        )

    @transaction.atomic
    def patch(self, request, pk):

        if not is_admission_manager(request.user):
            return Response(
                {
                    "detail": (
                        "You do not have permission "
                        "to edit applicants."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            applicant = self.get_object(pk)

        except Applicant.DoesNotExist:
            return Response(
                {
                    "detail": "Applicant not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        user_role = str(
            getattr(
                request.user,
                "role",
                "",
            )
        ).upper()

        # =========================================================
        # SCHOOL ACCESS PROTECTION
        # =========================================================

        if user_role == "SCHOOL_ADMIN":

            if request.user.school_id != applicant.school_id:
                return Response(
                    {
                        "detail": (
                            "You cannot edit an applicant "
                            "from another school."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        elif user_role == "ADMISSION_OFFICER":

            profile = getattr(
                request.user,
                "admission_officer_profile",
                None,
            )

            if (
                not profile
                or profile.school_id != applicant.school_id
            ):
                return Response(
                    {
                        "detail": (
                            "You cannot edit an applicant "
                            "from another school."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        # =========================================================
        # KEEP ORIGINAL VALUES
        #
        # We need these before saving the Applicant because an
        # admitted student may already have an enrollment matching
        # the old session/term/class.
        # =========================================================

        old_session_id = applicant.academic_session_id
        old_term_id = applicant.term_id
        old_class_id = applicant.class_level_id

        admitted_student = applicant.admitted_student

        # =========================================================
        # PROTECTED APPLICANT FIELDS
        # =========================================================

        protected_fields = {
            "id",
            "school",
            "application_number",
            "application_source",
            "status",
            "reviewed_at",
            "reviewed_by",
            "review_note",
            "admitted_student",
            "application_date",
            "created_at",
            "updated_at",
        }

        # =========================================================
        # COPY ONLY ALLOWED FIELDS
        # =========================================================

        update_data = {}

        for key, value in request.data.items():

            if key not in protected_fields:
                update_data[key] = value

        # The frontend does not need to send school.
        # We preserve the Applicant's existing school.
        update_data["school"] = applicant.school_id

        # =========================================================
        # UPDATE APPLICANT
        # =========================================================

        serializer = ApplicantCreateSerializer(
            applicant,
            data=update_data,
            partial=True,
            context={
                "request": request,
            },
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        applicant.refresh_from_db()

        # =========================================================
        # IF THIS APPLICANT HAS NOT BEEN ADMITTED YET
        #
        # There is no Student record to synchronize.
        # The Applicant itself has already been updated.
        # =========================================================

        if not admitted_student:

            return Response(
                {
                    "message": (
                        "Applicant application updated successfully."
                    ),
                    "applicant": ApplicantSerializer(
                        applicant
                    ).data,
                },
                status=status.HTTP_200_OK,
            )

        # =========================================================
        # SYNCHRONIZE ADMITTED STUDENT
        # =========================================================

        student = (
            Student.objects
            .select_related(
                "user",
                "school",
            )
            .prefetch_related(
                "parents",
            )
            .get(
                pk=admitted_student.pk
            )
        )

        # ---------------------------------------------------------
        # Safety check
        # ---------------------------------------------------------

        if student.school_id != applicant.school_id:

            return Response(
                {
                    "detail": (
                        "The admitted student belongs to "
                        "a different school."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =========================================================
        # UPDATE STUDENT PERSONAL INFORMATION
        # =========================================================

        student.first_name = applicant.first_name
        student.middle_name = applicant.middle_name
        student.last_name = applicant.last_name

        student.date_of_birth = applicant.date_of_birth

        if applicant.gender:
            student.gender = applicant.gender

        student.email = applicant.email
        student.phone_number = applicant.phone_number
        student.address = applicant.address

        student.blood_group = applicant.blood_group
        student.nationality = applicant.nationality
        student.state_of_origin = applicant.state_of_origin
        student.local_government = applicant.local_government

        student.admission_date = applicant.admission_date

        # Department belongs to Student, not StudentEnrollment.
        student.department = applicant.department

        # ---------------------------------------------------------
        # Profile image
        # ---------------------------------------------------------

        if applicant.profile_image:
            student.profile_image = applicant.profile_image

        student.save()

        # =========================================================
        # UPDATE LINKED STUDENT USER ACCOUNT
        # =========================================================

        student_user = getattr(
            student,
            "user",
            None,
        )

        if student_user:

            student_user.first_name = applicant.first_name
            student_user.last_name = applicant.last_name

            if hasattr(
                student_user,
                "middle_name",
            ):
                student_user.middle_name = applicant.middle_name

            if hasattr(
                student_user,
                "email",
            ):
                student_user.email = applicant.email

            if hasattr(
                student_user,
                "phone_number",
            ):
                student_user.phone_number = (
                    applicant.phone_number
                )

            student_user.save()

        
        # =========================================================
        # FIND AND UPDATE THE STUDENT'S CURRENT ENROLLMENT
        # =========================================================

        # Prefer the current enrollment so edits affect the
        # placement used by the active student portal.
        enrollment = (
            StudentEnrollment.objects
            .filter(
                student=student,
                is_current=True,
            )
            .order_by("-id")
            .first()
        )

        # Fall back to the application's previous session/term
        # if the student has no current enrollment.
        if enrollment is None and old_session_id and old_term_id:
            enrollment = (
                StudentEnrollment.objects
                .filter(
                    student=student,
                    academic_session_id=old_session_id,
                    term_id=old_term_id,
                )
                .order_by("-id")
                .first()
            )

        target_session_id = applicant.academic_session_id
        target_term_id = applicant.term_id
        target_class_id = applicant.class_level_id
        target_roll_number = applicant.roll_number

        # StudentEnrollment requires a term.
        if not target_session_id or not target_term_id or not target_class_id:
            transaction.set_rollback(True)

            return Response(
                {
                    "detail": (
                        "An academic session, term, and class "
                        "must be selected for an admitted student."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Reject a destination already occupied by another
        # enrollment for this student. Do this before changing
        # the existing enrollment.
        destination_enrollment = (
            StudentEnrollment.objects
            .filter(
                student=student,
                academic_session_id=target_session_id,
                term_id=target_term_id,
            )
            .order_by("-id")
            .first()
        )

        if (
            destination_enrollment is not None
            and (
                enrollment is None
                or destination_enrollment.id != enrollment.id
            )
        ):
            transaction.set_rollback(True)

            return Response(
                {
                    "detail": (
                        "This student already has an enrollment "
                        "for the selected academic session and term. "
                        "Resolve the existing enrollment before "
                        "changing the admission placement."
                    ),
                    "existing_enrollment_id": (
                        destination_enrollment.id
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ---------------------------------------------------------
        # CASE A: No enrollment exists yet.
        # Create one for the selected placement.
        # ---------------------------------------------------------

        if enrollment is None:
            enrollment = StudentEnrollment.objects.create(
                student=student,
                academic_session_id=target_session_id,
                term_id=target_term_id,
                class_level_id=target_class_id,
                roll_number=target_roll_number,
                is_current=True,
                remarks="Enrollment created while updating admission.",
            )

        # ---------------------------------------------------------
        # CASE B: Session or term changed.
        # Preserve the previous enrollment and create a new one.
        # ---------------------------------------------------------

        elif (
            enrollment.academic_session_id != target_session_id
            or enrollment.term_id != target_term_id
        ):
            # Capture the previous active subjects before creating
            # the new enrollment. Only subjects assigned to the
            # destination class will be carried forward.
            previous_subjects = list(
                StudentSubjectEnrollment.objects
                .filter(
                    student_enrollment=enrollment,
                    academic_session_id=(
                        enrollment.academic_session_id
                    ),
                    term_id=enrollment.term_id,
                    is_active=True,
                )
                .select_related("subject")
            )

            enrollment.is_current = False
            enrollment.save(update_fields=["is_current"])

            enrollment = StudentEnrollment.objects.create(
                student=student,
                academic_session_id=target_session_id,
                term_id=target_term_id,
                class_level_id=target_class_id,
                roll_number=target_roll_number,
                is_current=True,
                remarks="New enrollment created after admission placement change.",
            )

            # Copy only subjects that are still assigned to the
            # destination class. Do not rewrite historical subjects.
            for previous_subject in previous_subjects:
                class_subject = (
                    ClassSubject.objects
                    .filter(
                        class_level_id=target_class_id,
                        subject_id=previous_subject.subject_id,
                        is_active=True,
                        subject__is_active=True,
                    )
                    .first()
                )

                if class_subject is None:
                    continue

                StudentSubjectEnrollment.objects.get_or_create(
                    student_enrollment=enrollment,
                    subject_id=previous_subject.subject_id,
                    academic_session_id=target_session_id,
                    term_id=target_term_id,
                    defaults={
                        "is_core": class_subject.is_core,
                        "is_active": True,
                    },
                )

        # ---------------------------------------------------------
        # CASE C: Same session and term.
        # Update class and roll number on the existing enrollment.
        # ---------------------------------------------------------

        else:
            class_changed = (
                enrollment.class_level_id != target_class_id
            )

            enrollment.class_level_id = target_class_id
            enrollment.roll_number = target_roll_number
            enrollment.is_current = True

            enrollment.save(
                update_fields=[
                    "class_level",
                    "roll_number",
                    "is_current",
                ]
            )

            if class_changed:
                class_subjects = list(
                    ClassSubject.objects
                    .filter(
                        class_level_id=target_class_id,
                        is_active=True,
                        subject__is_active=True,
                    )
                )

                assigned_subject_ids = {
                    item.subject_id for item in class_subjects
                }

                # Deactivate subjects that are not assigned to
                # the newly selected class. Keep their records.
                StudentSubjectEnrollment.objects.filter(
                    student_enrollment=enrollment,
                    is_active=True,
                ).exclude(
                    subject_id__in=assigned_subject_ids,
                ).update(is_active=False)

                for class_subject in class_subjects:
                    existing_subject = (
                        StudentSubjectEnrollment.objects
                        .filter(
                            student_enrollment=enrollment,
                            subject_id=class_subject.subject_id,
                            academic_session_id=target_session_id,
                            term_id=target_term_id,
                        )
                        .first()
                    )

                    if existing_subject is not None:
                        # Restore subjects that belong to the new
                        # class and update their legacy core flag.
                        if (
                            not existing_subject.is_active
                            or existing_subject.is_core
                            != class_subject.is_core
                        ):
                            existing_subject.is_active = True
                            existing_subject.is_core = (
                                class_subject.is_core
                            )
                            existing_subject.save(
                                update_fields=[
                                    "is_active",
                                    "is_core",
                                ]
                            )

                    elif (
                        class_subject.assignment_type
                        != "OPTIONAL"
                    ):
                        # Automatically add missing compulsory
                        # subjects, but do not select optional
                        # subjects on the student's behalf.
                        StudentSubjectEnrollment.objects.create(
                            student_enrollment=enrollment,
                            subject_id=class_subject.subject_id,
                            academic_session_id=target_session_id,
                            term_id=target_term_id,
                            is_core=class_subject.is_core,
                            is_active=True,
                        )

        # =========================================================
        # SYNCHRONIZE PARENT / GUARDIAN
        # =========================================================

        parent = (
            student.parents
            .order_by("id")
            .first()
        )

        if parent:

            parent.full_name = applicant.guardian_name
            parent.phone_number = applicant.guardian_phone
            parent.email = applicant.guardian_email
            parent.address = applicant.guardian_address

            parent.save()

            # -----------------------------------------------------
            # Synchronize parent login account where one exists.
            # -----------------------------------------------------

            parent_user = getattr(
                parent,
                "user",
                None,
            )

            if parent_user:

                parent_user.first_name = (
                    applicant.guardian_name or ""
                )

                # ParentGuardian stores full_name rather than
                # separate first/last names.
                if hasattr(
                    parent_user,
                    "last_name",
                ):
                    parent_user.last_name = ""

                if hasattr(
                    parent_user,
                    "email",
                ):
                    parent_user.email = (
                        applicant.guardian_email
                    )

                if hasattr(
                    parent_user,
                    "phone_number",
                ):
                    parent_user.phone_number = (
                        applicant.guardian_phone
                    )

                parent_user.save()

        # =========================================================
        # REFRESH EVERYTHING
        # =========================================================

        student.refresh_from_db()

        applicant.refresh_from_db()

        enrollment_data = None

        if enrollment:

            enrollment.refresh_from_db()

            enrollment_data = {
                "id": enrollment.id,
                "student": enrollment.student_id,
                "academic_session": (
                    enrollment.academic_session_id
                ),
                "term": enrollment.term_id,
                "class_level": (
                    enrollment.class_level_id
                ),
                "roll_number": enrollment.roll_number,
                "is_current": enrollment.is_current,
            }

        # =========================================================
        # RESPONSE
        # =========================================================

        return Response(
            {
                "message": (
                    "Applicant and admitted student "
                    "records updated successfully."
                ),
                "applicant": ApplicantSerializer(
                    applicant
                ).data,
                "student": {
                    "id": student.id,
                    "admission_number": (
                        student.admission_number
                    ),
                    "full_name": student.full_name,
                    "school": student.school_id,
                    "class_level": (
                        enrollment.class_level_id
                        if enrollment
                        else None
                    ),
                    "academic_session": (
                        enrollment.academic_session_id
                        if enrollment
                        else None
                    ),
                    "term": (
                        enrollment.term_id
                        if enrollment
                        else None
                    ),
                    "roll_number": (
                        enrollment.roll_number
                        if enrollment
                        else None
                    ),
                    "department": (
                        student.department_id
                    ),
                },
                "enrollment": enrollment_data,
            },
            status=status.HTTP_200_OK,
        )
    def delete(self, request, pk):

        if not is_admission_manager(
            request.user
        ):
            return Response(
                {
                    "detail": (
                        "You do not have permission "
                        "to delete applicants."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            applicant = self.get_object(pk)

        except Applicant.DoesNotExist:
            return Response(
                {
                    "detail": "Applicant not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        user_role = str(
            getattr(
                request.user,
                "role",
                "",
            )
        ).upper()

        if user_role == "SCHOOL_ADMIN":

            user_school = getattr(
                request.user,
                "school_id",
                None,
            )

            if user_school != applicant.school_id:
                return Response(
                    {
                        "detail": (
                            "You can only delete applicants "
                            "from your school."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        elif user_role == "ADMISSION_OFFICER":

            profile = getattr(
                request.user,
                "admission_officer_profile",
                None,
            )

            if (
                not profile
                or profile.school_id != applicant.school_id
            ):
                return Response(
                    {
                        "detail": (
                            "You can only delete applicants "
                            "from your school."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        applicant.delete()

        return Response(
            {
                "message": (
                    "Applicant deleted successfully."
                )
            },
            status=status.HTTP_204_NO_CONTENT,
        )


# ============================================================
# APPLICANT REVIEW / STATUS
# ============================================================

class ApplicantStatusView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    @transaction.atomic
    def patch(self, request, pk):

        if not is_admission_manager(
            request.user
        ):
            return Response(
                {
                    "detail": (
                        "You do not have permission "
                        "to review applicants."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:

            applicant = (
                Applicant.objects
                .select_related(
                    "school",
                    "reviewed_by",
                )
                .get(pk=pk)
            )

        except Applicant.DoesNotExist:

            return Response(
                {
                    "detail": "Applicant not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        user_role = str(
            getattr(
                request.user,
                "role",
                "",
            )
        ).upper()

        user_school_id = None

        if user_role == "SCHOOL_ADMIN":

            user_school_id = getattr(
                request.user,
                "school_id",
                None,
            )

        elif user_role == "ADMISSION_OFFICER":

            profile = getattr(
                request.user,
                "admission_officer_profile",
                None,
            )

            if profile:
                user_school_id = profile.school_id

        if user_role in [
            "SCHOOL_ADMIN",
            "ADMISSION_OFFICER",
        ]:

            if (
                not user_school_id
                or user_school_id != applicant.school_id
            ):
                return Response(
                    {
                        "detail": (
                            "You can only review applicants "
                            "from your school."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        serializer = ApplicantStatusSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        new_status = serializer.validated_data[
            "status"
        ]

        review_note = serializer.validated_data.get(
            "review_note",
            "",
        )

        applicant.status = new_status
        applicant.review_note = review_note
        applicant.reviewed_by = request.user
        applicant.reviewed_at = timezone.now()

        applicant.save(
            update_fields=[
                "status",
                "review_note",
                "reviewed_by",
                "reviewed_at",
                "updated_at",
            ]
        )

        return Response(
            {
                "message": (
                    "Applicant status updated successfully."
                ),
                "applicant": ApplicantSerializer(
                    applicant
                ).data,
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# ADMIT APPLICANT
# ============================================================

class ApplicantAdmitView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    @transaction.atomic
    def post(self, request, pk):

        # =====================================================
        # 1. CHECK PERMISSION
        # =====================================================

        if not is_admission_manager(
            request.user
        ):
            return Response(
                {
                    "detail": (
                        "You do not have permission "
                        "to admit applicants."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # =====================================================
        # 2. GET APPLICANT
        # =====================================================

        try:

            applicant = (
                Applicant.objects
                .select_related(
                    "school",
                    "academic_session",
                    "class_level",
                    "department",
                    "term",
                    "admitted_student",
                )
                .get(pk=pk)
            )

        except Applicant.DoesNotExist:

            return Response(
                {
                    "detail": "Applicant not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # =====================================================
        # 3. CHECK SCHOOL ACCESS
        # =====================================================

        user_role = str(
            getattr(
                request.user,
                "role",
                "",
            )
        ).upper()

        user_school_id = None

        if user_role == "SCHOOL_ADMIN":

            user_school_id = getattr(
                request.user,
                "school_id",
                None,
            )

        elif user_role == "ADMISSION_OFFICER":

            profile = getattr(
                request.user,
                "admission_officer_profile",
                None,
            )

            if profile:
                user_school_id = profile.school_id

        if user_role in [
            "SCHOOL_ADMIN",
            "ADMISSION_OFFICER",
        ]:

            if (
                not user_school_id
                or user_school_id != applicant.school_id
            ):
                return Response(
                    {
                        "detail": (
                            "You can only admit applicants "
                            "from your school."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        # =====================================================
        # 4. CHECK APPLICATION STATUS
        # =====================================================

        if applicant.status != Applicant.Status.ACCEPTED:

            return Response(
                {
                    "detail": (
                        "Only accepted applicants can "
                        "be admitted."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =====================================================
        # 5. PREVENT DOUBLE ADMISSION
        # =====================================================

        if applicant.admitted_student_id:

            return Response(
                {
                    "detail": (
                        "This applicant has already "
                        "been admitted."
                    ),
                    "student_id": (
                        applicant.admitted_student_id
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =====================================================
        # 6. VALIDATE REQUEST
        # =====================================================

        serializer = AdmitApplicantSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        admission_number = (
            serializer.validated_data[
                "admission_number"
            ]
        ).strip()

        # =====================================================
        # 7. VALIDATE CLASS / SCHOOL
        # =====================================================

        class_level = applicant.class_level

        if not class_level:

            return Response(
                {
                    "detail": (
                        "The applicant does not have "
                        "a class assigned."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if class_level.school_id != applicant.school_id:

            return Response(
                {
                    "detail": (
                        "The applicant's class does not "
                        "belong to the applicant's school."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =====================================================
        # 8. VALIDATE DEPARTMENT
        # =====================================================

        if class_level.education_level == "SS":

            if not applicant.department:

                return Response(
                    {
                        "detail": (
                            "A department is required "
                            "for Senior Secondary applicants."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if (
                class_level.department_id
                and class_level.department_id
                != applicant.department_id
            ):

                return Response(
                    {
                        "detail": (
                            "The applicant's department "
                            "does not match the selected "
                            "SS class department."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # =====================================================
        # 9. VALIDATE DATE OF BIRTH
        # =====================================================

        if not applicant.date_of_birth:

            return Response(
                {
                    "detail": (
                        "The applicant must have a date "
                        "of birth before admission."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =====================================================
        # 10. DETERMINE ENROLLMENT TERM
        # =====================================================

        if applicant.term_id:

            term = applicant.term

            if not term:

                return Response(
                    {
                        "detail": (
                            "The applicant's selected "
                            "enrollment term could not be found."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if (
                term.academic_session_id
                != applicant.academic_session_id
            ):

                return Response(
                    {
                        "detail": (
                            "The applicant's selected term does not "
                            "belong to the selected academic session."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        else:

            # -------------------------------------------------
            # BACKWARD COMPATIBILITY
            # -------------------------------------------------

            term = (
                Term.objects
                .filter(
                    academic_session=applicant.academic_session,
                    name__iexact="FIRST",
                    is_current=True,
                )
                .first()
            )

            if not term:

                return Response(
                    {
                        "detail": (
                            "No enrollment term was found for "
                            "this applicant."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # =====================================================
        # 11. CREATE STUDENT USER
        # =====================================================

        username = admission_number

        if User.objects.filter(
            username=username
        ).exists():

            return Response(
                {
                    "detail": (
                        "A login account already exists "
                        "with this admission number."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =====================================================
        # EMAIL
        # =====================================================

        if applicant.email:

            email = (
                applicant.email
                .strip()
                .lower()
            )

            if User.objects.filter(
                email=email
            ).exists():

                return Response(
                    {
                        "detail": (
                            "This applicant's email address "
                            "is already being used by another user."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        else:

            email = (
                f"{username.lower()}"
                "@student.edumanage.local"
            )

            counter = 1

            while User.objects.filter(
                email=email
            ).exists():

                email = (
                    f"{username.lower()}"
                    f".{counter}"
                    "@student.edumanage.local"
                )

                counter += 1

        # =====================================================
        # PASSWORD
        # =====================================================

        temporary_password = get_random_string(
            length=10
        )

        # =====================================================
        # 12. CREATE STUDENT USER ACCOUNT
        # =====================================================

        user = User.objects.create_user(
            username=username,
            email=email,
            password=temporary_password,
            role=User.Role.STUDENT,
            first_name=applicant.first_name,
            last_name=applicant.last_name,
            phone_number=(
                applicant.phone_number or ""
            ),
        )

        # =====================================================
        # 13. CREATE STUDENT
        # =====================================================

        student = Student.objects.create(
            school=applicant.school,
            user=user,

            admission_number=admission_number,

            first_name=applicant.first_name,
            middle_name=applicant.middle_name,
            last_name=applicant.last_name,

            date_of_birth=applicant.date_of_birth,

            gender=applicant.gender,

            email=applicant.email,
            phone_number=applicant.phone_number,

            address=applicant.address,

            profile_image=applicant.profile_image,
            blood_group=applicant.blood_group,
            nationality=applicant.nationality,
            state_of_origin=applicant.state_of_origin,
            local_government=applicant.local_government,

            department=applicant.department,

            status=Student.Status.ACTIVE,

            admission_date=(
                applicant.admission_date
                or timezone.localdate()
            ),
        )

        # =====================================================
        # 14. CREATE ENROLLMENT
        # =====================================================

        enrollment = StudentEnrollment.objects.create(
            student=student,

            academic_session=(
                applicant.academic_session
            ),

            term=term,

            class_level=class_level,

            is_current=True,

            roll_number=applicant.roll_number,

            remarks=(
                f"Admitted from application "
                f"{applicant.application_number}."
            ),
        )

        # =====================================================
        # 15. FIND / CREATE PARENT GUARDIAN
        # =====================================================

        parent = None
        parent_created = False
        parent_login_created = False
        parent_credentials = None

        guardian_phone = (
            applicant.guardian_phone
            or ""
        ).strip()

        guardian_email = (
            applicant.guardian_email
            or ""
        ).strip().lower()

        # -----------------------------------------------------
        # FIND EXISTING PARENT BY PHONE
        # -----------------------------------------------------

        if guardian_phone:

            parent = (
                ParentGuardian.objects
                .filter(
                    school=applicant.school,
                    phone_number=guardian_phone,
                )
                .first()
            )

        # -----------------------------------------------------
        # FIND EXISTING PARENT BY EMAIL
        # -----------------------------------------------------

        if parent is None and guardian_email:

            parent = (
                ParentGuardian.objects
                .filter(
                    school=applicant.school,
                    email__iexact=guardian_email,
                )
                .first()
            )

        # =====================================================
        # CREATE PARENT PROFILE
        # =====================================================

        if parent is None:

            parent = ParentGuardian.objects.create(
                school=applicant.school,

                full_name=(
                    applicant.guardian_name
                    or ""
                ).strip(),

                relationship="Parent/Guardian",

                phone_number=guardian_phone,

                email=guardian_email,

                address=(
                    applicant.guardian_address
                    or ""
                ).strip(),

                is_active=True,
            )

            parent_created = True

        # =====================================================
        # 16. CREATE PARENT USER IF NEEDED
        # =====================================================

        if parent.user is None:

            # -------------------------------------------------
            # GENERATE NEXT PARENT USERNAME
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

            username_parent = (
                f"{prefix}"
                f"{next_number:03d}"
            )

            while User.objects.filter(
                username=username_parent
            ).exists():

                next_number += 1

                username_parent = (
                    f"{prefix}"
                    f"{next_number:03d}"
                )

            # -------------------------------------------------
            # PARENT EMAIL
            # -------------------------------------------------

            if parent.email:

                parent_email = (
                    parent.email
                    .strip()
                    .lower()
                )

                if User.objects.filter(
                    email__iexact=parent_email
                ).exists():

                    return Response(
                        {
                            "detail": (
                                "The guardian email address "
                                "is already being used by "
                                "another user."
                            )
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            else:

                parent_email = (
                    f"{username_parent.lower()}"
                    "@parent.edumanage.local"
                )

                counter = 1

                while User.objects.filter(
                    email=parent_email
                ).exists():

                    parent_email = (
                        f"{username_parent.lower()}"
                        f".{counter}"
                        "@parent.edumanage.local"
                    )

                    counter += 1

            # -------------------------------------------------
            # GENERATE PARENT PASSWORD
            # -------------------------------------------------

            parent_temporary_password = (
                get_random_string(
                    length=10
                )
            )

            # -------------------------------------------------
            # CREATE PARENT USER
            # -------------------------------------------------

            parent_user = User.objects.create_user(
                username=username_parent,
                email=parent_email,
                password=parent_temporary_password,
                role=User.Role.PARENT,
                first_name=(
                    parent.full_name
                ),
                last_name="",
                phone_number=(
                    parent.phone_number or ""
                ),
            )

            # -------------------------------------------------
            # LINK USER TO PARENT PROFILE
            # -------------------------------------------------

            parent.user = parent_user

            parent.save(
                update_fields=[
                    "user",
                    "updated_at",
                ]
            )

            parent_login_created = True

            parent_credentials = {
                "username": username_parent,
                "password": parent_temporary_password,
            }

        # =====================================================
        # 17. LINK PARENT TO STUDENT
        # =====================================================

        student.parents.add(parent)

        # =====================================================
        # 18. LINK STUDENT TO APPLICANT
        # =====================================================

        applicant.admitted_student = student

        applicant.save(
            update_fields=[
                "admitted_student",
                "updated_at",
            ]
        )

        # =====================================================
        # 19. RESPONSE
        # =====================================================

        response_data = {
            "message": (
                "Applicant admitted successfully."
            ),

            "applicant": ApplicantSerializer(
                applicant
            ).data,

            "student": {
                "id": student.id,

                "admission_number": (
                    student.admission_number
                ),

                "full_name": (
                    student.full_name
                ),

                "school": (
                    student.school_id
                ),

                "class_level": (
                    enrollment.class_level_id
                ),

                "class_name": (
                    enrollment.class_level.name
                ),

                "academic_session": (
                    enrollment.academic_session_id
                ),

                "session_name": (
                    enrollment.academic_session.name
                ),

                "term": (
                    enrollment.term_id
                ),

                "term_name": (
                    enrollment.term.get_name_display()
                ),

                "roll_number": (
                    enrollment.roll_number
                ),
            },

            "credentials": {
                "username": username,
                "password": temporary_password,
            },

            "parent": {
                "id": parent.id,
                "full_name": parent.full_name,
                "relationship": parent.relationship,
                "phone_number": parent.phone_number,
                "email": parent.email,
                "created": parent_created,
                "linked": True,
            },

            "important": (
                "Save the student login credentials now. "
                "The generated student password is returned "
                "only during admission."
            ),
        }

        # =====================================================
        # PARENT LOGIN CREDENTIALS
        # =====================================================

        if parent_login_created:

            response_data["parent"]["login_credentials"] = (
                parent_credentials
            )

            response_data["parent"]["important"] = (
                "Save these parent login credentials now. "
                "The generated parent password is returned "
                "only when the parent account is created."
            )

        # =====================================================
        # FINAL RESPONSE
        # =====================================================

        return Response(
            response_data,
            status=status.HTTP_201_CREATED,
        )