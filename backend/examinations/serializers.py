import secrets
import string

from rest_framework import serializers

from accounts.models import User
from academics.models import School

from .models import (
    ExamOfficerProfile,
    Examination,
    ExaminationSubject,
)


# =========================================================
# EXAM OFFICER CREATE SERIALIZER
# =========================================================

class ExamOfficerCreateSerializer(serializers.Serializer):

    first_name = serializers.CharField(
        max_length=150,
    )

    last_name = serializers.CharField(
        max_length=150,
    )

    email = serializers.EmailField()

    phone_number = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True,
    )

    profile_image = serializers.ImageField(
        required=False,
        allow_null=True,
    )

    school = serializers.PrimaryKeyRelatedField(
        queryset=School.objects.all(),
    )

    employee_number = serializers.CharField(
        max_length=50,
    )

    employment_date = serializers.DateField(
        required=False,
        allow_null=True,
    )

    # -----------------------------------------------------
    # EMPLOYEE NUMBER VALIDATION
    # -----------------------------------------------------

    def validate_employee_number(self, value):

        value = value.strip()

        if ExamOfficerProfile.objects.filter(
            employee_number=value
        ).exists():

            raise serializers.ValidationError(
                "An exam officer with this employee number already exists."
            )

        return value

    # -----------------------------------------------------
    # EMAIL VALIDATION
    # -----------------------------------------------------

    def validate_email(self, value):

        value = value.strip().lower()

        if User.objects.filter(
            email=value
        ).exists():

            raise serializers.ValidationError(
                "A user with this email already exists."
            )

        return value

    # -----------------------------------------------------
    # USERNAME
    # -----------------------------------------------------

    def generate_username(self, employee_number):

        username = employee_number.strip().upper()

        if not User.objects.filter(
            username=username
        ).exists():

            return username

        counter = 2

        while User.objects.filter(
            username=f"{username}-{counter}"
        ).exists():

            counter += 1

        return f"{username}-{counter}"

    # -----------------------------------------------------
    # PASSWORD
    # -----------------------------------------------------

    def generate_password(self):

        alphabet = (
            string.ascii_letters
            + string.digits
            + "!@#$%^&*"
        )

        return "".join(
            secrets.choice(alphabet)
            for _ in range(12)
        )

    # -----------------------------------------------------
    # CREATE
    # -----------------------------------------------------

    def create(self, validated_data):

        profile_image = validated_data.pop(
            "profile_image",
            None,
        )

        school = validated_data.pop(
            "school"
        )

        employee_number = validated_data.pop(
            "employee_number"
        )

        employment_date = validated_data.pop(
            "employment_date",
            None,
        )

        first_name = validated_data.pop(
            "first_name"
        )

        last_name = validated_data.pop(
            "last_name"
        )

        phone_number = validated_data.pop(
            "phone_number",
            "",
        )

        email = validated_data.pop(
            "email"
        )

        # -------------------------------------------------
        # GENERATE LOGIN DETAILS
        # -------------------------------------------------

        username = self.generate_username(
            employee_number
        )

        password = self.generate_password()

        # -------------------------------------------------
        # CREATE USER
        # -------------------------------------------------

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone_number,
            role=User.Role.EXAM_OFFICER,
        )

        # -------------------------------------------------
        # PROFILE IMAGE
        # -------------------------------------------------

        if profile_image:

            user.profile_image = profile_image

            user.save(
                update_fields=["profile_image"]
            )

        # -------------------------------------------------
        # CREATE EXAM OFFICER PROFILE
        # -------------------------------------------------

        exam_officer = ExamOfficerProfile.objects.create(
            user=user,
            school=school,
            employee_number=employee_number,
            employment_date=employment_date,
        )

        return (
            exam_officer,
            username,
            password,
        )


# =========================================================
# EXAM OFFICER PROFILE SERIALIZER
# =========================================================
#
# Used for:
#
# GET
# PUT
# PATCH
#
# It is intentionally separate from
# ExamOfficerCreateSerializer.
# =========================================================

class ExamOfficerProfileSerializer(
    serializers.ModelSerializer
):

    # -----------------------------------------------------
    # USER INFORMATION
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # SCHOOL
    # -----------------------------------------------------

    school_name = serializers.CharField(
        source="school.name",
        read_only=True,
    )

    # -----------------------------------------------------
    # PROFILE IMAGE
    # -----------------------------------------------------

    profile_image = serializers.SerializerMethodField()

    def get_profile_image(self, obj):

        request = self.context.get("request")

        if not obj.user.profile_image:
            return None

        image_url = obj.user.profile_image.url

        if request:
            return request.build_absolute_uri(
                image_url
            )

        return image_url

    # -----------------------------------------------------
    # META
    # -----------------------------------------------------

    class Meta:

        model = ExamOfficerProfile

        fields = [
            "id",
            "user_id",
            "username",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "employee_number",
            "school",
            "school_name",
            "employment_date",
            "is_active",
            "profile_image",
        ]

        read_only_fields = [
            "id",
            "user_id",
            "username",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "school_name",
            "profile_image",
        ]


# =========================================================
# EXAMINATION SERIALIZER
# =========================================================

class ExaminationSerializer(serializers.ModelSerializer):

    school_name = serializers.CharField(
        source="school.name",
        read_only=True,
    )

    academic_session_name = serializers.CharField(
        source="academic_session.name",
        read_only=True,
    )

    term_name = serializers.CharField(
        source="term.name",
        read_only=True,
    )

    class_level_name = serializers.CharField(
        source="class_level.name",
        read_only=True,
    )

    examination_type_display = serializers.CharField(
        source="get_examination_type_display",
        read_only=True,
    )

    class Meta:

        model = Examination

        fields = [
            "id",

            "school",
            "school_name",

            "academic_session",
            "academic_session_name",

            "term",
            "term_name",

            "class_level",
            "class_level_name",

            "name",
            "examination_type",
            "examination_type_display",

            "start_date",
            "end_date",

            "description",

            "is_published",
            "is_active",

            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "school",
            "created_at",
            "updated_at",
        ]

    # -----------------------------------------------------
    # VALIDATION
    # -----------------------------------------------------

    def validate(self, attrs):

        start_date = attrs.get(
            "start_date",
            getattr(
                self.instance,
                "start_date",
                None,
            ),
        )

        end_date = attrs.get(
            "end_date",
            getattr(
                self.instance,
                "end_date",
                None,
            ),
        )

        # -------------------------------------------------
        # START / END DATE
        # -------------------------------------------------

        if start_date and end_date:

            if end_date < start_date:

                raise serializers.ValidationError({
                    "end_date": (
                        "End date cannot be before "
                        "the start date."
                    )
                })

        # -------------------------------------------------
        # SCHOOL
        # -------------------------------------------------

        school = attrs.get(
            "school",
            getattr(
                self.instance,
                "school",
                None,
            ),
        )

        # -------------------------------------------------
        # ACADEMIC SESSION
        # -------------------------------------------------

        academic_session = attrs.get(
            "academic_session",
            getattr(
                self.instance,
                "academic_session",
                None,
            ),
        )

        if school and academic_session:

            if academic_session.school_id != school.id:

                raise serializers.ValidationError({
                    "academic_session": (
                        "The selected academic session "
                        "does not belong to the selected "
                        "school."
                    )
                })

        # -------------------------------------------------
        # TERM
        # -------------------------------------------------

        term = attrs.get(
            "term",
            getattr(
                self.instance,
                "term",
                None,
            ),
        )

        if term and academic_session:

            if (
                term.academic_session_id
                != academic_session.id
            ):

                raise serializers.ValidationError({
                    "term": (
                        "The selected term does not belong "
                        "to the selected academic session."
                    )
                })

        # -------------------------------------------------
        # CLASS LEVEL
        # -------------------------------------------------

        class_level = attrs.get(
            "class_level",
            getattr(
                self.instance,
                "class_level",
                None,
            ),
        )

        if class_level and school:

            if class_level.school_id != school.id:

                raise serializers.ValidationError({
                    "class_level": (
                        "The selected class does not "
                        "belong to the selected school."
                    )
                })

        return attrs


# =========================================================
# EXAMINATION SUBJECT SERIALIZER
# =========================================================

class ExaminationSubjectSerializer(
    serializers.ModelSerializer
):

    examination_name = serializers.CharField(
        source="examination.name",
        read_only=True,
    )

    subject_name = serializers.CharField(
        source="subject.name",
        read_only=True,
    )

    subject_code = serializers.CharField(
        source="subject.code",
        read_only=True,
    )

    class Meta:

        model = ExaminationSubject

        fields = [
            "id",

            "examination",
            "examination_name",

            "subject",
            "subject_name",
            "subject_code",

            "examination_date",

            "start_time",
            "end_time",

            "maximum_score",
            "pass_mark",

            "venue",

            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]

    # -----------------------------------------------------
    # VALIDATION
    # -----------------------------------------------------

    def validate(self, attrs):

        examination = attrs.get(
            "examination"
        )

        subject = attrs.get(
            "subject"
        )

        examination_date = attrs.get(
            "examination_date"
        )

        start_time = attrs.get(
            "start_time"
        )

        end_time = attrs.get(
            "end_time"
        )

        maximum_score = attrs.get(
            "maximum_score"
        )

        pass_mark = attrs.get(
            "pass_mark"
        )

        # =================================================
        # EXAMINATION / SUBJECT
        # =================================================

        if examination and subject:

            # -------------------------------------------------
            # SUBJECT MUST BELONG TO SAME SCHOOL
            # -------------------------------------------------

            if (
                subject.school_id
                != examination.school_id
            ):

                raise serializers.ValidationError({
                    "subject": (
                        "This subject does not belong "
                        "to the examination school."
                    )
                })

            # -------------------------------------------------
            # CLASS SUBJECT CHECK
            # -------------------------------------------------

            class_subject_exists = (
                examination.class_level
                .class_subjects
                .filter(
                    subject=subject,
                    is_active=True,
                )
                .exists()
            )

            if not class_subject_exists:

                raise serializers.ValidationError({
                    "subject": (
                        "This subject is not assigned "
                        "to the selected class."
                    )
                })

        # =================================================
        # EXAMINATION DATE
        # =================================================

        if (
            examination
            and examination_date
        ):

            if (
                examination_date
                < examination.start_date
                or examination_date
                > examination.end_date
            ):

                raise serializers.ValidationError({
                    "examination_date": (
                        "The examination subject date "
                        "must be within the examination "
                        "period."
                    )
                })

        # =================================================
        # TIME
        # =================================================

        if (
            start_time
            and end_time
            and end_time <= start_time
        ):

            raise serializers.ValidationError({
                "end_time": (
                    "End time must be later "
                    "than start time."
                )
            })

        # =================================================
        # MAXIMUM SCORE
        # =================================================

        if (
            maximum_score is not None
            and maximum_score <= 0
        ):

            raise serializers.ValidationError({
                "maximum_score": (
                    "Maximum score must be "
                    "greater than zero."
                )
            })

        # =================================================
        # PASS MARK
        # =================================================

        if pass_mark is not None:

            if pass_mark < 0:

                raise serializers.ValidationError({
                    "pass_mark": (
                        "Pass mark cannot "
                        "be negative."
                    )
                })

            if (
                maximum_score is not None
                and pass_mark > maximum_score
            ):

                raise serializers.ValidationError({
                    "pass_mark": (
                        "Pass mark cannot be "
                        "greater than maximum score."
                    )
                })

        return attrs