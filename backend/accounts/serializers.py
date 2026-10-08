from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import User


# =========================================================
# USER SERIALIZER
# =========================================================

class UserSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(
        source="get_role_display",
        read_only=True,
    )

    # School information
    school_id = serializers.IntegerField(
        read_only=True,
        allow_null=True,
    )

    school_name = serializers.SerializerMethodField()

    student_id = serializers.SerializerMethodField()
    teacher_id = serializers.SerializerMethodField()
    parent_id = serializers.SerializerMethodField()
    exam_officer_id = serializers.SerializerMethodField()

    class Meta:
        model = User

        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "role_display",
            "phone_number",
            "profile_image",

            # School
            "school_id",
            "school_name",

            # Role profile IDs
            "student_id",
            "teacher_id",
            "parent_id",
            "exam_officer_id",

            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "role_display",

            # School
            "school_id",
            "school_name",

            # Role profile IDs
            "student_id",
            "teacher_id",
            "parent_id",
            "exam_officer_id",

            "created_at",
            "updated_at",
        )

    # =====================================================
    # SCHOOL NAME
    # =====================================================

    def get_school_name(self, obj):
        if not obj.school_id:
            return None

        try:
            return obj.school.name
        except AttributeError:
            return None

    # =====================================================
    # STUDENT PROFILE ID
    # =====================================================

    def get_student_id(self, obj):
        if obj.role != User.Role.STUDENT:
            return None

        try:
            return obj.student_profile.id
        except AttributeError:
            return None

    # =====================================================
    # TEACHER PROFILE ID
    # =====================================================

    def get_teacher_id(self, obj):
        if obj.role != User.Role.TEACHER:
            return None

        try:
            return obj.teacher_profile.id
        except AttributeError:
            return None

    # =====================================================
    # PARENT PROFILE ID
    # =====================================================

    def get_parent_id(self, obj):
        if obj.role != User.Role.PARENT:
            return None

        try:
            return obj.parent_profile.id
        except AttributeError:
            return None

    # =====================================================
    # EXAM OFFICER PROFILE ID
    # =====================================================

    def get_exam_officer_id(self, obj):
        if obj.role != User.Role.EXAM_OFFICER:
            return None

        try:
            return obj.exam_officer_profile.id
        except AttributeError:
            return None


# =========================================================
# LOGIN
# =========================================================

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()

    password = serializers.CharField(
        write_only=True,
    )

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        user = authenticate(
            username=username,
            password=password,
        )

        if user is None:
            raise serializers.ValidationError(
                "Invalid username or password."
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "This account is inactive."
            )

        attrs["user"] = user

        return attrs


# =========================================================
# REGISTER
# =========================================================

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    password_confirm = serializers.CharField(
        write_only=True,
    )

    class Meta:
        model = User

        fields = (
            "username",
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
            "role",
            "phone_number",
        )

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {
                    "password": "Passwords do not match."
                }
            )

        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")

        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            **validated_data,
        )

        return user