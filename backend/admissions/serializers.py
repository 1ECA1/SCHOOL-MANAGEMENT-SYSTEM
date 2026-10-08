from rest_framework import serializers

from accounts.models import User
from academics.models import School

from .models import (
    AdmissionOfficerProfile,
    Applicant,
)


# ============================================================
# ADMISSION OFFICER PROFILE
# ============================================================

class AdmissionOfficerProfileSerializer(
    serializers.ModelSerializer
):
    user_id = serializers.IntegerField(
        source="user.id",
        read_only=True,
    )

    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    first_name = serializers.CharField(
        source="user.first_name",
        read_only=True,
    )

    last_name = serializers.CharField(
        source="user.last_name",
        read_only=True,
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    phone_number = serializers.CharField(
        source="user.phone_number",
        read_only=True,
    )

    full_name = serializers.SerializerMethodField()

    role = serializers.CharField(
        source="user.role",
        read_only=True,
    )

    role_display = serializers.CharField(
        source="user.get_role_display",
        read_only=True,
    )

    school_name = serializers.CharField(
        source="school.name",
        read_only=True,
    )

    class Meta:
        model = AdmissionOfficerProfile

        fields = [
            "id",
            "user_id",
            "username",
            "first_name",
            "last_name",
            "full_name",
            "email",
            "phone_number",
            "role",
            "role_display",
            "employee_number",
            "school",
            "school_name",
            "employment_date",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "user_id",
            "username",
            "first_name",
            "last_name",
            "full_name",
            "email",
            "phone_number",
            "role",
            "role_display",
            "school_name",
            "created_at",
            "updated_at",
        ]

    def get_full_name(self, obj):
        return obj.user.get_full_name().strip()


# ============================================================
# ADMISSION OFFICER CREATION
# ============================================================

class AdmissionOfficerCreateSerializer(
    serializers.Serializer
):

    first_name = serializers.CharField(
        max_length=150,
    )

    last_name = serializers.CharField(
        max_length=150,
    )

    email = serializers.EmailField(
        required=False,
        allow_blank=True,
    )

    phone_number = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    school = serializers.PrimaryKeyRelatedField(
        queryset=School.objects.all(),
    )

    employee_number = serializers.CharField(
        max_length=100,
    )

    employment_date = serializers.DateField(
        required=False,
        allow_null=True,
    )

    def validate_first_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "First name is required."
            )

        return value

    def validate_last_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Last name is required."
            )

        return value

    def validate_employee_number(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Employee number is required."
            )

        if AdmissionOfficerProfile.objects.filter(
            employee_number__iexact=value
        ).exists():
            raise serializers.ValidationError(
                "This employee number is already in use."
            )

        if User.objects.filter(
            username__iexact=value
        ).exists():
            raise serializers.ValidationError(
                "This employee number is already being used as a username."
            )

        return value


# ============================================================
# APPLICANT SERIALIZER
# ============================================================

class ApplicantSerializer(
    serializers.ModelSerializer
):

    full_name = serializers.SerializerMethodField()

    school_name = serializers.CharField(
        source="school.name",
        read_only=True,
    )

    session_name = serializers.CharField(
        source="academic_session.name",
        read_only=True,
    )

    class_name = serializers.CharField(
        source="class_level.name",
        read_only=True,
    )

    department_name = serializers.CharField(
        source="department.name",
        read_only=True,
        allow_null=True,
    )

    # --------------------------------------------------------
    # TERM
    # --------------------------------------------------------

    term_name = serializers.SerializerMethodField()

    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )

    gender_display = serializers.CharField(
        source="get_gender_display",
        read_only=True,
    )

    application_source = serializers.CharField(
        read_only=True,
    )

    application_source_display = serializers.CharField(
        source="get_application_source_display",
        read_only=True,
    )

    admitted_student = serializers.IntegerField(
        source="admitted_student_id",
        read_only=True,
    )

    admitted_student_name = serializers.CharField(
        source="admitted_student.full_name",
        read_only=True,
        allow_null=True,
    )

    admitted_student_admission_number = serializers.CharField(
        source="admitted_student.admission_number",
        read_only=True,
        allow_null=True,
    )

    reviewed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Applicant

        fields = [
            # ------------------------------------------------
            # BASIC APPLICATION
            # ------------------------------------------------
            "id",
            "application_number",

            "school",
            "school_name",

            "academic_session",
            "session_name",

            # ------------------------------------------------
            # APPLICATION SOURCE
            # ------------------------------------------------
            "application_source",
            "application_source_display",

            # ------------------------------------------------
            # ADMITTED STUDENT
            # ------------------------------------------------
            "admitted_student",
            "admitted_student_name",
            "admitted_student_admission_number",

            # ------------------------------------------------
            # PERSONAL INFORMATION
            # ------------------------------------------------
            "first_name",
            "middle_name",
            "last_name",
            "full_name",

            "date_of_birth",
            "gender",
            "gender_display",

            # ------------------------------------------------
            # CONTACT INFORMATION
            # ------------------------------------------------
            "email",
            "phone_number",
            "address",
            "previous_school",

            # ------------------------------------------------
            # STUDENT INFORMATION
            # ------------------------------------------------
            "admission_date",
            "roll_number",
            "blood_group",
            "nationality",
            "state_of_origin",
            "local_government",
            "profile_image",

            # ------------------------------------------------
            # ACADEMIC INFORMATION
            # ------------------------------------------------
            "class_level",
            "class_name",

            "term",
            "term_name",

            "department",
            "department_name",

            # ------------------------------------------------
            # GUARDIAN INFORMATION
            # ------------------------------------------------
            "guardian_name",
            "guardian_phone",
            "guardian_email",
            "guardian_address",

            # ------------------------------------------------
            # APPLICATION STATUS
            # ------------------------------------------------
            "status",
            "status_display",

            "application_date",
            "reviewed_at",
            "reviewed_by",
            "reviewed_by_name",
            "review_note",

            # ------------------------------------------------
            # TIMESTAMPS
            # ------------------------------------------------
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "application_number",

            "school_name",
            "session_name",

            "full_name",
            "class_name",
            "department_name",

            "term_name",

            "status_display",
            "gender_display",

            "application_source",
            "application_source_display",

            "admitted_student",
            "admitted_student_name",
            "admitted_student_admission_number",

            "application_date",

            "reviewed_at",
            "reviewed_by",
            "reviewed_by_name",

            "created_at",
            "updated_at",
        ]

    def get_full_name(self, obj):
        return obj.full_name

    def get_reviewed_by_name(self, obj):
        if not obj.reviewed_by:
            return None

        return obj.reviewed_by.get_full_name().strip()

    def get_term_name(self, obj):
        if not obj.term:
            return None

        return obj.term.name


# ============================================================
# CREATE APPLICANT
# ============================================================

class ApplicantCreateSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = Applicant

        fields = [
            # ------------------------------------------------
            # SCHOOL / SESSION
            # ------------------------------------------------
            "school",
            "academic_session",
            "term",

            # ------------------------------------------------
            # PERSONAL INFORMATION
            # ------------------------------------------------
            "first_name",
            "middle_name",
            "last_name",

            "date_of_birth",
            "gender",

            # ------------------------------------------------
            # CONTACT INFORMATION
            # ------------------------------------------------
            "email",
            "phone_number",
            "address",
            "previous_school",

            # ------------------------------------------------
            # STUDENT INFORMATION
            # ------------------------------------------------
            "admission_date",
            "roll_number",
            "blood_group",
            "nationality",
            "state_of_origin",
            "local_government",
            "profile_image",

            # ------------------------------------------------
            # ACADEMIC INFORMATION
            # ------------------------------------------------
            "class_level",
            "department",

            # ------------------------------------------------
            # GUARDIAN INFORMATION
            # ------------------------------------------------
            "guardian_name",
            "guardian_phone",
            "guardian_email",
            "guardian_address",
        ]

    def validate(self, attrs):

        request = self.context.get("request")

        school = attrs.get("school")
        academic_session = attrs.get("academic_session")
        term = attrs.get("term")
        class_level = attrs.get("class_level")
        department = attrs.get("department")

        # ====================================================
        # SCHOOL MUST EXIST
        # ====================================================

        if not school:
            raise serializers.ValidationError({
                "school": "School is required."
            })

        # ====================================================
        # CLASS MUST BELONG TO SCHOOL
        # ====================================================

        if (
            class_level
            and class_level.school_id != school.id
        ):
            raise serializers.ValidationError({
                "class_level": (
                    "The selected class does not belong "
                    "to the selected school."
                )
            })

        # ====================================================
        # DEPARTMENT MUST BELONG TO SCHOOL
        # ====================================================

        if (
            department
            and department.school_id != school.id
        ):
            raise serializers.ValidationError({
                "department": (
                    "The selected department does not belong "
                    "to the selected school."
                )
            })

        # ====================================================
        # SESSION MUST BELONG TO SCHOOL
        # ====================================================

        if (
            academic_session
            and academic_session.school_id != school.id
        ):
            raise serializers.ValidationError({
                "academic_session": (
                    "The selected academic session does not "
                    "belong to the selected school."
                )
            })

        # ====================================================
        # TERM MUST BELONG TO SESSION
        # ====================================================

        if (
            term
            and academic_session
            and term.academic_session_id != academic_session.id
        ):
            raise serializers.ValidationError({
                "term": (
                    "The selected term does not belong "
                    "to the selected academic session."
                )
            })

        # ====================================================
        # TERM MUST BELONG TO SCHOOL
        # ====================================================

        if (
            term
            and school
            and term.academic_session.school_id != school.id
        ):
            raise serializers.ValidationError({
                "term": (
                    "The selected term does not belong "
                    "to the selected school."
                )
            })

        # ====================================================
        # TERM REQUIRED FOR NEW ADMISSION OFFICER WALK-IN
        #
        # Public online applications can still omit it.
        # Existing applications are not affected.
        # ====================================================

        is_admission_officer = (
            request
            and request.user.is_authenticated
            and str(
                getattr(
                    request.user,
                    "role",
                    ""
                )
            ).upper()
            == "ADMISSION_OFFICER"
        )

        if (
            self.instance is None
            and is_admission_officer
            and not term
        ):
            raise serializers.ValidationError({
                "term": (
                    "Term is required when registering "
                    "a walk-in applicant."
                )
            })

        # ====================================================
        # DEPARTMENT RULES
        #
        # PRIMARY / JSS:
        #     Department is not required.
        #
        # SS:
        #     Department is required.
        #     Department must match the class department.
        # ====================================================

        if class_level:

            education_level = getattr(
                class_level,
                "education_level",
                None,
            )

            # ------------------------------------------------
            # SENIOR SECONDARY
            # ------------------------------------------------

            if education_level == "SS":

                if not department:
                    raise serializers.ValidationError({
                        "department": (
                            "A department is required for "
                            "Senior Secondary (SS) classes."
                        )
                    })

                class_department_id = getattr(
                    class_level,
                    "department_id",
                    None,
                )

                if (
                    class_department_id
                    and department.id != class_department_id
                ):
                    raise serializers.ValidationError({
                        "department": (
                            "The selected department does not "
                            "match the selected SS class."
                        )
                    })

            # ------------------------------------------------
            # PRIMARY / JSS
            # ------------------------------------------------

            else:

                if department:
                    raise serializers.ValidationError({
                        "department": (
                            "A department is not required for "
                            "Primary or Junior Secondary classes."
                        )
                    })

        return attrs

    def create(self, validated_data):

        request = self.context.get("request")

        academic_session = validated_data[
            "academic_session"
        ]

        # ====================================================
        # GENERATE APPLICATION NUMBER
        #
        # Example:
        # APP-2026-0001
        # ====================================================

        session_name = academic_session.name

        try:
            year = session_name.split("/")[0]
        except (AttributeError, IndexError):
            year = str(academic_session.id)

        prefix = f"APP-{year}-"

        last_applicant = (
            Applicant.objects
            .filter(
                application_number__startswith=prefix
            )
            .order_by("-id")
            .first()
        )

        if last_applicant:

            try:
                last_number = int(
                    last_applicant
                    .application_number
                    .split("-")[-1]
                )
            except (ValueError, IndexError):
                last_number = 0

        else:
            last_number = 0

        application_number = (
            f"{prefix}{last_number + 1:04d}"
        )

        # ====================================================
        # DETERMINE APPLICATION SOURCE AUTOMATICALLY
        #
        # ADMISSION OFFICER -> WALK_IN
        # PUBLIC            -> ONLINE
        #
        # Frontend NEVER chooses the source.
        # ====================================================

        if (
            request
            and request.user.is_authenticated
            and request.user.role
            == User.Role.ADMISSION_OFFICER
        ):

            application_source = (
                Applicant.ApplicationSource.WALK_IN
            )

        else:

            application_source = (
                Applicant.ApplicationSource.ONLINE
            )

        validated_data["application_number"] = (
            application_number
        )

        validated_data["application_source"] = (
            application_source
        )

        return Applicant.objects.create(
            **validated_data
        )


# ============================================================
# APPLICANT STATUS UPDATE
# ============================================================

class ApplicantStatusSerializer(
    serializers.Serializer
):

    status = serializers.ChoiceField(
        choices=Applicant.Status.choices,
    )

    review_note = serializers.CharField(
        required=False,
        allow_blank=True,
    )


# ============================================================
# ADMIT APPLICANT
# ============================================================

class AdmitApplicantSerializer(
    serializers.Serializer
):

    admission_number = serializers.CharField(
        max_length=50,
    )

    def validate_admission_number(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Admission number is required."
            )

        from students.models import Student

        if Student.objects.filter(
            admission_number=value
        ).exists():

            raise serializers.ValidationError(
                "A student already exists with this admission number."
            )

        return value