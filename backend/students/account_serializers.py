# from django.contrib.auth import get_user_model
# from django.contrib.auth.password_validation import validate_password

# from rest_framework import serializers

# from .models import Student


# User = get_user_model()


# # =========================================================
# # STUDENT ACCOUNT SERIALIZER
# # =========================================================


# class StudentAccountSerializer(serializers.ModelSerializer):
#     """
#     Read-only representation of a student's login account.

#     The academic student record remains in Student.

#     The actual login account is accounts.User through:

#         Student.user
#     """

#     full_name = serializers.CharField(
#         read_only=True
#     )

#     has_account = serializers.SerializerMethodField()

#     username = serializers.SerializerMethodField()

#     account_email = serializers.SerializerMethodField()

#     account_is_active = serializers.SerializerMethodField()

#     class_name = serializers.SerializerMethodField()

#     academic_session_name = (
#         serializers.SerializerMethodField()
#     )

#     account_created_at = (
#         serializers.SerializerMethodField()
#     )

#     class Meta:
#         model = Student

#         fields = [
#             "id",
#             "full_name",
#             "admission_number",

#             "school",

#             "email",
#             "phone_number",

#             "status",

#             "has_account",

#             "username",
#             "account_email",
#             "account_is_active",
#             "account_created_at",

#             "class_name",
#             "academic_session_name",
#         ]

#         read_only_fields = fields

#     # =====================================================
#     # FULL NAME
#     # =====================================================

#     def get_full_name(self, obj):

#         return obj.full_name

#     # =====================================================
#     # ACCOUNT EXISTS
#     # =====================================================

#     def get_has_account(self, obj):

#         return bool(obj.user_id)

#     # =====================================================
#     # USERNAME
#     # =====================================================

#     def get_username(self, obj):

#         if not obj.user_id:
#             return None

#         return obj.user.username

#     # =====================================================
#     # ACCOUNT EMAIL
#     # =====================================================

#     def get_account_email(self, obj):

#         if not obj.user_id:
#             return None

#         return obj.user.email

#     # =====================================================
#     # ACCOUNT ACTIVE STATUS
#     # =====================================================

#     def get_account_is_active(self, obj):

#         if not obj.user_id:
#             return None

#         return obj.user.is_active

#     # =====================================================
#     # ACCOUNT CREATED DATE
#     # =====================================================

#     def get_account_created_at(self, obj):

#         if not obj.user_id:
#             return None

#         return obj.user.created_at

#     # =====================================================
#     # CURRENT CLASS
#     # =====================================================

#     def get_class_name(self, obj):

#         enrollment = (
#             obj.enrollments
#             .filter(
#                 is_current=True
#             )
#             .select_related(
#                 "class_level"
#             )
#             .order_by("-id")
#             .first()
#         )

#         if not enrollment:
#             return None

#         if not enrollment.class_level:
#             return None

#         return enrollment.class_level.name

#     # =====================================================
#     # CURRENT ACADEMIC SESSION
#     # =====================================================

#     def get_academic_session_name(self, obj):

#         enrollment = (
#             obj.enrollments
#             .filter(
#                 is_current=True
#             )
#             .select_related(
#                 "academic_session"
#             )
#             .order_by("-id")
#             .first()
#         )

#         if not enrollment:
#             return None

#         if not enrollment.academic_session:
#             return None

#         return enrollment.academic_session.name


# # =========================================================
# # CREATE STUDENT ACCOUNT
# # =========================================================


# class CreateStudentAccountSerializer(
#     serializers.Serializer
# ):
#     """
#     Create a login account for an existing Student.

#     Example:

#         {
#             "student": 53,
#             "email": "grace@example.com",
#             "password": "Grace@123"
#         }

#     Email is optional.

#     If omitted:

#         Student.email

#     will be used.

#     If the student has no email, the view generates an
#     internal fallback email address.
#     """

#     student = serializers.PrimaryKeyRelatedField(
#         queryset=Student.objects.all()
#     )

#     email = serializers.EmailField(
#         required=False,
#         allow_blank=True,
#         allow_null=True,
#     )

#     password = serializers.CharField(
#         write_only=True,
#         min_length=8,
#         trim_whitespace=False,
#     )

#     # =====================================================
#     # STUDENT VALIDATION
#     # =====================================================

#     def validate_student(self, student):

#         # -------------------------------------------------
#         # Student must not already have an account
#         # -------------------------------------------------

#         if student.user_id:

#             raise serializers.ValidationError(
#                 "This student already has a login account."
#             )

#         # -------------------------------------------------
#         # Only active students may receive accounts
#         # -------------------------------------------------

#         if student.status != Student.Status.ACTIVE:

#             raise serializers.ValidationError(
#                 "A login account can only be created "
#                 "for an active student."
#             )

#         # -------------------------------------------------
#         # Check school access
#         # -------------------------------------------------

#         request = self.context.get(
#             "request"
#         )

#         if request:

#             user = request.user

#             if user.role == User.Role.SCHOOL_ADMIN:

#                 if not user.school_id:

#                     raise serializers.ValidationError(
#                         "Your account is not assigned "
#                         "to a school."
#                     )

#                 if student.school_id != user.school_id:

#                     raise serializers.ValidationError(
#                         "You cannot manage a student "
#                         "from another school."
#                     )

#             elif user.role != User.Role.SUPER_ADMIN:

#                 raise serializers.ValidationError(
#                     "You do not have permission "
#                     "to manage student accounts."
#                 )

#         return student

#     # =====================================================
#     # EMAIL VALIDATION
#     # =====================================================

#     def validate_email(self, value):

#         if not value:
#             return value

#         value = value.strip().lower()

#         if User.objects.filter(
#             email__iexact=value
#         ).exists():

#             raise serializers.ValidationError(
#                 "This email address is already "
#                 "being used by another user."
#             )

#         return value

#     # =====================================================
#     # PASSWORD VALIDATION
#     # =====================================================

#     def validate_password(self, value):

#         validate_password(value)

#         return value


# # =========================================================
# # RESET STUDENT PASSWORD
# # =========================================================


# class ResetStudentPasswordSerializer(
#     serializers.Serializer
# ):
#     """
#     Validate a new password before it is assigned to
#     an existing student User account.
#     """

#     password = serializers.CharField(
#         write_only=True,
#         min_length=8,
#         trim_whitespace=False,
#     )

#     # =====================================================
#     # PASSWORD VALIDATION
#     # =====================================================

#     def validate_password(self, value):

#         validate_password(value)

#         return value


from django.contrib.auth import get_user_model

from rest_framework import serializers

from .models import Student


User = get_user_model()


# ============================================================
# STUDENT ACCOUNT SERIALIZER
# ============================================================

class StudentAccountSerializer(serializers.ModelSerializer):
    """
    Returns student information together with the status of
    the student's login account.

    IMPORTANT:
    - The password is NEVER returned here.
    - Temporary passwords are returned only once by the
      account creation endpoint.
    """

    full_name = serializers.SerializerMethodField()
    has_account = serializers.SerializerMethodField()

    username = serializers.SerializerMethodField()
    account_email = serializers.SerializerMethodField()
    account_is_active = serializers.SerializerMethodField()
    account_created_at = serializers.SerializerMethodField()

    class_name = serializers.SerializerMethodField()
    academic_session_name = serializers.SerializerMethodField()

    class Meta:
        model = Student

        fields = [
            "id",
            "full_name",
            "admission_number",
            "school",
            "email",
            "phone_number",
            "status",

            # Account information
            "has_account",
            "username",
            "account_email",
            "account_is_active",
            "account_created_at",

            # Current academic information
            "class_name",
            "academic_session_name",
        ]

        read_only_fields = fields

    # ========================================================
    # STUDENT
    # ========================================================

    def get_full_name(self, obj):
        return obj.full_name

    # ========================================================
    # ACCOUNT
    # ========================================================

    def get_has_account(self, obj):
        return bool(obj.user_id)

    def get_username(self, obj):
        if not obj.user_id:
            return None

        return obj.user.username

    def get_account_email(self, obj):
        if not obj.user_id:
            return None

        return obj.user.email

    def get_account_is_active(self, obj):
        if not obj.user_id:
            return None

        return obj.user.is_active

    def get_account_created_at(self, obj):
        if not obj.user_id:
            return None

        return obj.user.created_at

    # ========================================================
    # CURRENT CLASS
    # ========================================================

    def get_class_name(self, obj):
        enrollment = (
            obj.enrollments
            .filter(is_current=True)
            .select_related("class_level")
            .order_by("-id")
            .first()
        )

        if not enrollment or not enrollment.class_level:
            return None

        return enrollment.class_level.name

    # ========================================================
    # CURRENT ACADEMIC SESSION
    # ========================================================

    def get_academic_session_name(self, obj):
        enrollment = (
            obj.enrollments
            .filter(is_current=True)
            .select_related("academic_session")
            .order_by("-id")
            .first()
        )

        if not enrollment or not enrollment.academic_session:
            return None

        return enrollment.academic_session.name


# ============================================================
# CREATE STUDENT ACCOUNT
# ============================================================

class CreateStudentAccountSerializer(serializers.Serializer):
    """
    Creates a login account for an existing student.

    The password is intentionally NOT accepted from the frontend.

    The backend automatically generates a temporary password.
    """

    student = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all()
    )

    email = serializers.EmailField(
        required=False,
        allow_blank=True,
        allow_null=True,
    )

    # --------------------------------------------------------
    # STUDENT VALIDATION
    # --------------------------------------------------------

    def validate_student(self, student):

        if student.user_id:
            raise serializers.ValidationError(
                "This student already has a login account."
            )

        if student.status != Student.Status.ACTIVE:
            raise serializers.ValidationError(
                "A login account can only be created for an active student."
            )

        request = self.context.get("request")

        if request:
            user = request.user

            if user.role == User.Role.SCHOOL_ADMIN:

                if not user.school_id:
                    raise serializers.ValidationError(
                        "Your account is not assigned to a school."
                    )

                if student.school_id != user.school_id:
                    raise serializers.ValidationError(
                        "You cannot manage a student from another school."
                    )

            elif user.role != User.Role.SUPER_ADMIN:

                raise serializers.ValidationError(
                    "You do not have permission to manage student accounts."
                )

        return student

    # --------------------------------------------------------
    # EMAIL VALIDATION
    # --------------------------------------------------------

    def validate_email(self, value):

        if not value:
            return value

        value = value.strip().lower()

        if User.objects.filter(
            email__iexact=value
        ).exists():

            raise serializers.ValidationError(
                "This email address is already being used by another user."
            )

        return value


# ============================================================
# RESET STUDENT PASSWORD
# ============================================================

class ResetStudentPasswordSerializer(serializers.Serializer):
    """
    Reset password does accept a password because an administrator
    is explicitly choosing a new password during a reset.
    """

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        trim_whitespace=False,
    )

    def validate_password(self, value):

        from django.contrib.auth.password_validation import (
            validate_password,
        )

        validate_password(value)

        return value