from rest_framework import serializers

from accounts.models import User
from academics.models import (
    AcademicSession,
    Term,
    ClassLevel,
    School,
)


# ============================================================
# SCHOOL USER SERIALIZER
# ============================================================

class SchoolUserSerializer(serializers.ModelSerializer):

    role_display = serializers.CharField(
        source="get_role_display",
        read_only=True,
    )

    full_name = serializers.SerializerMethodField()

    school = serializers.SerializerMethodField()

    school_name = serializers.SerializerMethodField()

    profile_id = serializers.SerializerMethodField()

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "role_display",
            "school",
            "school_name",
            "phone_number",
            "profile_image",
            "profile_id",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "username",
            "full_name",
            "role",
            "role_display",
            "school",
            "school_name",
            "profile_id",
            "created_at",
            "updated_at",
        ]

    def get_full_name(self, obj):
        return obj.get_full_name().strip()

    # --------------------------------------------------------
    # GET ACTUAL SCHOOL
    # --------------------------------------------------------

    def get_school(self, obj):

        # First check User.school
        if obj.school_id:
            return obj.school_id

        # Otherwise get school from role-specific profile
        profile_map = {
            User.Role.STUDENT: "student_profile",
            User.Role.TEACHER: "teacher_profile",
            User.Role.PARENT: "parent_profile",
            User.Role.ACCOUNTANT: "accountant_profile",
            User.Role.EXAM_OFFICER: "exam_officer_profile",
            User.Role.LIBRARIAN: "librarian_profile",
            User.Role.ADMISSION_OFFICER: "admission_officer_profile",
            User.Role.PRINCIPAL: "principal_profile",
        }

        related_name = profile_map.get(obj.role)

        if not related_name:
            return None

        try:
            profile = getattr(
                obj,
                related_name,
            )

            return getattr(
                profile,
                "school_id",
                None,
            )

        except AttributeError:
            return None

    # --------------------------------------------------------
    # GET SCHOOL NAME
    # --------------------------------------------------------

    def get_school_name(self, obj):

        # First check User.school
        if obj.school_id and obj.school:
            return obj.school.name

        profile_map = {
            User.Role.STUDENT: "student_profile",
            User.Role.TEACHER: "teacher_profile",
            User.Role.PARENT: "parent_profile",
            User.Role.ACCOUNTANT: "accountant_profile",
            User.Role.EXAM_OFFICER: "exam_officer_profile",
            User.Role.LIBRARIAN: "librarian_profile",
            User.Role.ADMISSION_OFFICER: "admission_officer_profile",
            User.Role.PRINCIPAL: "principal_profile",
        }

        related_name = profile_map.get(obj.role)

        if not related_name:
            return None

        try:
            profile = getattr(
                obj,
                related_name,
            )

            school = getattr(
                profile,
                "school",
                None,
            )

            if school:
                return school.name

        except AttributeError:
            return None

        return None

    # --------------------------------------------------------
    # GET ROLE PROFILE ID
    # --------------------------------------------------------

    def get_profile_id(self, obj):

        profile_map = {
            User.Role.STUDENT: "student_profile",
            User.Role.TEACHER: "teacher_profile",
            User.Role.PARENT: "parent_profile",
            User.Role.ACCOUNTANT: "accountant_profile",
            User.Role.EXAM_OFFICER: "exam_officer_profile",
            User.Role.LIBRARIAN: "librarian_profile",
            User.Role.ADMISSION_OFFICER: "admission_officer_profile",
            User.Role.PRINCIPAL: "principal_profile",
        }

        related_name = profile_map.get(obj.role)

        if not related_name:
            return None

        try:
            profile = getattr(
                obj,
                related_name,
            )

            return profile.id

        except AttributeError:
            return None


# ============================================================
# SCHOOL USER CREATE SERIALIZER
# ============================================================

class SchoolUserCreateSerializer(serializers.Serializer):

    # --------------------------------------------------------
    # COMMON USER INFORMATION
    # --------------------------------------------------------

    role = serializers.ChoiceField(
        choices=User.Role.choices
    )

    first_name = serializers.CharField(
        max_length=150
    )

    middle_name = serializers.CharField(
        max_length=150,
        required=False,
        allow_blank=True,
    )

    last_name = serializers.CharField(
        max_length=150
    )

    email = serializers.EmailField(
        required=False,
        allow_blank=True,
    )

    phone_number = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True,
    )

    profile_image = serializers.ImageField(
        required=False,
        allow_null=True,
    )

    # --------------------------------------------------------
    # STAFF IDENTIFIERS
    # --------------------------------------------------------

    employee_id = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
    )

    employee_number = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
    )

    # --------------------------------------------------------
    # STUDENT IDENTIFICATION
    # --------------------------------------------------------

    admission_number = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
    )

    # --------------------------------------------------------
    # PERSONAL INFORMATION
    # --------------------------------------------------------

    date_of_birth = serializers.DateField(
        required=False,
        allow_null=True,
    )

    gender = serializers.CharField(
        max_length=30,
        required=False,
        allow_blank=True,
    )

    address = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    qualification = serializers.CharField(
        max_length=200,
        required=False,
        allow_blank=True,
    )

    specialization = serializers.CharField(
        max_length=200,
        required=False,
        allow_blank=True,
    )

    employment_date = serializers.DateField(
        required=False,
        allow_null=True,
    )

    appointment_date = serializers.DateField(
        required=False,
        allow_null=True,
    )

    bio = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    # --------------------------------------------------------
    # STUDENT INFORMATION
    # --------------------------------------------------------

    admission_date = serializers.DateField(
        required=False,
        allow_null=True,
    )

    blood_group = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True,
    )

    nationality = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
    )

    state_of_origin = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
    )

    local_government = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
    )

    medical_notes = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    # --------------------------------------------------------
    # STUDENT ENROLLMENT
    # --------------------------------------------------------

    academic_session = serializers.PrimaryKeyRelatedField(
        queryset=AcademicSession.objects.all(),
        required=False,
        allow_null=True,
    )

    term = serializers.PrimaryKeyRelatedField(
        queryset=Term.objects.all(),
        required=False,
        allow_null=True,
    )

    class_level = serializers.PrimaryKeyRelatedField(
        queryset=ClassLevel.objects.all(),
        required=False,
        allow_null=True,
    )

    is_current = serializers.BooleanField(
        required=False,
        default=True,
    )

    remarks = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    # --------------------------------------------------------
    # PARENT / GUARDIAN
    # --------------------------------------------------------

    relationship = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
    )

    occupation = serializers.CharField(
        max_length=200,
        required=False,
        allow_blank=True,
    )

    emergency_contact = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
    )

    # ========================================================
    # FIELD VALIDATION
    # ========================================================

    def validate_first_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "First name is required."
            )

        return value

    def validate_middle_name(self, value):
        return value.strip()

    def validate_last_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Last name is required."
            )

        return value

    def validate_email(self, value):
        value = value.strip().lower()

        if value and User.objects.filter(
            email__iexact=value
        ).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )

        return value

    def validate_role(self, value):

        forbidden_roles = [
            User.Role.SUPER_ADMIN,
            User.Role.SCHOOL_ADMIN,
        ]

        if value in forbidden_roles:
            raise serializers.ValidationError(
                "This role cannot be created from School User Management."
            )

        return value

    # ========================================================
    # COMPLETE VALIDATION
    # ========================================================

    def validate(self, attrs):

        role = attrs.get("role")

        # ----------------------------------------------------
        # TEACHER
        # ----------------------------------------------------

        if role == User.Role.TEACHER:

            employee_id = attrs.get(
                "employee_id",
                "",
            ).strip()

            if not employee_id:
                raise serializers.ValidationError(
                    {
                        "employee_id": (
                            "Employee ID is required "
                            "for a Teacher."
                        )
                    }
                )

            attrs["employee_id"] = employee_id

        # ----------------------------------------------------
        # PRINCIPAL
        # ----------------------------------------------------

        elif role == User.Role.PRINCIPAL:

            employee_id = attrs.get(
                "employee_id",
                "",
            ).strip()

            if not employee_id:
                raise serializers.ValidationError(
                    {
                        "employee_id": (
                            "Employee ID is required "
                            "for a Principal."
                        )
                    }
                )

            attrs["employee_id"] = employee_id

        # ----------------------------------------------------
        # ACCOUNTANT
        # ----------------------------------------------------

        elif role == User.Role.ACCOUNTANT:

            employee_number = attrs.get(
                "employee_number",
                "",
            ).strip()

            if not employee_number:
                raise serializers.ValidationError(
                    {
                        "employee_number": (
                            "Employee number is required "
                            "for an Accountant."
                        )
                    }
                )

            attrs["employee_number"] = employee_number

        # ----------------------------------------------------
        # EXAM OFFICER
        # ----------------------------------------------------

        elif role == User.Role.EXAM_OFFICER:

            employee_number = attrs.get(
                "employee_number",
                "",
            ).strip()

            if not employee_number:
                raise serializers.ValidationError(
                    {
                        "employee_number": (
                            "Employee number is required "
                            "for an Exam Officer."
                        )
                    }
                )

            attrs["employee_number"] = employee_number

        # ----------------------------------------------------
        # LIBRARIAN
        # ----------------------------------------------------

        elif role == User.Role.LIBRARIAN:

            employee_number = attrs.get(
                "employee_number",
                "",
            ).strip()

            if not employee_number:
                raise serializers.ValidationError(
                    {
                        "employee_number": (
                            "Employee number is required "
                            "for a Librarian."
                        )
                    }
                )

            attrs["employee_number"] = employee_number

        # ----------------------------------------------------
        # ADMISSION OFFICER
        # ----------------------------------------------------

        elif role == User.Role.ADMISSION_OFFICER:

            employee_number = attrs.get(
                "employee_number",
                "",
            ).strip()

            if not employee_number:
                raise serializers.ValidationError(
                    {
                        "employee_number": (
                            "Employee number is required "
                            "for an Admission Officer."
                        )
                    }
                )

            attrs["employee_number"] = employee_number

        # ----------------------------------------------------
        # STUDENT
        # ----------------------------------------------------

        elif role == User.Role.STUDENT:

            admission_number = attrs.get(
                "admission_number",
                "",
            ).strip()

            if not admission_number:
                raise serializers.ValidationError(
                    {
                        "admission_number": (
                            "Admission number is required "
                            "for a Student."
                        )
                    }
                )

            attrs["admission_number"] = admission_number

            # ----------------------------------------------
            # DATE OF BIRTH
            # ----------------------------------------------

            if not attrs.get("date_of_birth"):
                raise serializers.ValidationError(
                    {
                        "date_of_birth": (
                            "Date of birth is required "
                            "for a Student."
                        )
                    }
                )

            # ----------------------------------------------
            # GENDER
            # ----------------------------------------------

            gender = str(
                attrs.get("gender", "")
            ).strip()

            if not gender:
                raise serializers.ValidationError(
                    {
                        "gender": (
                            "Gender is required "
                            "for a Student."
                        )
                    }
                )

            attrs["gender"] = gender

            # ----------------------------------------------
            # ADMISSION DATE
            # ----------------------------------------------

            if not attrs.get("admission_date"):
                raise serializers.ValidationError(
                    {
                        "admission_date": (
                            "Admission date is required "
                            "for a Student."
                        )
                    }
                )

            # ----------------------------------------------
            # ACADEMIC SESSION
            # ----------------------------------------------

            academic_session = attrs.get(
                "academic_session"
            )

            if not academic_session:
                raise serializers.ValidationError(
                    {
                        "academic_session": (
                            "Academic session is required "
                            "when creating a Student."
                        )
                    }
                )

            # ----------------------------------------------
            # TERM
            # ----------------------------------------------

            term = attrs.get("term")

            if not term:
                raise serializers.ValidationError(
                    {
                        "term": (
                            "Term is required "
                            "when creating a Student."
                        )
                    }
                )

            # ----------------------------------------------
            # CLASS LEVEL
            # ----------------------------------------------

            class_level = attrs.get(
                "class_level"
            )

            if not class_level:
                raise serializers.ValidationError(
                    {
                        "class_level": (
                            "Class level is required "
                            "when creating a Student."
                        )
                    }
                )

            # ----------------------------------------------
            # TERM MUST BELONG TO SESSION
            # ----------------------------------------------

            if (
                term.academic_session_id
                != academic_session.id
            ):
                raise serializers.ValidationError(
                    {
                        "term": (
                            "The selected term does not "
                            "belong to the selected "
                            "academic session."
                        )
                    }
                )

        # ----------------------------------------------------
        # PARENT
        # ----------------------------------------------------

        elif role == User.Role.PARENT:

            relationship = attrs.get(
                "relationship",
                "",
            ).strip()

            if not relationship:
                raise serializers.ValidationError(
                    {
                        "relationship": (
                            "Relationship is required "
                            "for a Parent / Guardian."
                        )
                    }
                )

            attrs["relationship"] = relationship

        return attrs


# ============================================================
# OTHER STAFF SERIALIZER
# ============================================================

class OtherStaffSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    user_id = serializers.IntegerField()

    full_name = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()

    email = serializers.CharField(
        allow_blank=True,
        allow_null=True,
    )

    phone_number = serializers.CharField(
        allow_blank=True,
        allow_null=True,
    )

    role = serializers.CharField()
    role_display = serializers.CharField()

    employee_number = serializers.CharField()

    employment_date = serializers.DateField(
        allow_null=True,
    )

    is_active = serializers.BooleanField()

    profile_image = serializers.SerializerMethodField()

    def get_profile_image(self, obj):
        user = obj.get("user")

        if not user:
            return None

        if not user.profile_image:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(
                user.profile_image.url
            )

        return user.profile_image.url


# ============================================================
# SUPER ADMIN - CREATE SCHOOL ADMIN SERIALIZER
# ============================================================

class SuperAdminCreateSchoolAdminSerializer(serializers.Serializer):

    school = serializers.PrimaryKeyRelatedField(
        queryset=__import__(
            "academics.models",
            fromlist=["School"],
        ).School.objects.filter(
            is_active=True
        )
    )

    username = serializers.CharField(
        max_length=150
    )

    first_name = serializers.CharField(
        max_length=150
    )

    last_name = serializers.CharField(
        max_length=150
    )

    email = serializers.EmailField(
        required=False,
        allow_blank=True,
    )

    phone_number = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True,
    )

    # --------------------------------------------------------
    # USERNAME
    # --------------------------------------------------------

    def validate_username(self, value):
        value = value.strip().upper()

        if not value:
            raise serializers.ValidationError(
                "Username is required."
            )

        if User.objects.filter(
            username__iexact=value
        ).exists():
            raise serializers.ValidationError(
                "A user with this username already exists."
            )

        return value

    # --------------------------------------------------------
    # FIRST NAME
    # --------------------------------------------------------

    def validate_first_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "First name is required."
            )

        return value

    # --------------------------------------------------------
    # LAST NAME
    # --------------------------------------------------------

    def validate_last_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Last name is required."
            )

        return value

    # --------------------------------------------------------
    # EMAIL
    # --------------------------------------------------------

    def validate_email(self, value):
        value = value.strip().lower()

        if value and User.objects.filter(
            email__iexact=value
        ).exists():
            raise serializers.ValidationError(
                "A user with this email address already exists."
            )

        return value

    # --------------------------------------------------------
    # COMPLETE VALIDATION
    # --------------------------------------------------------

    def validate(self, attrs):
        school = attrs.get("school")

        if not school:
            raise serializers.ValidationError(
                {
                    "school": (
                        "Please select a school."
                    )
                }
            )

        if not school.is_active:
            raise serializers.ValidationError(
                {
                    "school": (
                        "The selected school is inactive."
                    )
                }
            )

        return attrs


class SuperAdminEditSchoolAdminSerializer(serializers.ModelSerializer):
    school = serializers.PrimaryKeyRelatedField(
        queryset=School.objects.filter(is_active=True)
    )

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "school",
            "is_active",
        ]

    def validate_first_name(self, value):
        value = str(value).strip()

        if not value:
            raise serializers.ValidationError(
                "First name is required."
            )

        return value

    def validate_last_name(self, value):
        value = str(value).strip()

        if not value:
            raise serializers.ValidationError(
                "Last name is required."
            )

        return value

    def validate_email(self, value):
        value = str(value).strip()

        if not value:
            return ""

        queryset = User.objects.filter(
            email__iexact=value
        ).exclude(
            pk=self.instance.pk
        )

        if queryset.exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )

        return value

    def validate_school(self, value):
        if not value.is_active:
            raise serializers.ValidationError(
                "The selected school is inactive."
            )

        return value