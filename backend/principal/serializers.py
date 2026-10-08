from rest_framework import serializers

from .models import Principal


class PrincipalSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(
        source="user.id",
        read_only=True,
    )

    full_name = serializers.SerializerMethodField()

    email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    phone_number = serializers.CharField(
        source="user.phone_number",
        read_only=True,
    )

    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    school_name = serializers.CharField(
        source="school.name",
        read_only=True,
    )

    class Meta:
        model = Principal

        fields = (
            "id",
            "user_id",
            "username",
            "full_name",
            "email",
            "phone_number",
            "school",
            "school_name",
            "employee_id",
            "appointment_date",
            "qualification",
            "bio",
            "is_active",
            "created_at",
            "updated_at",
        )

        read_only_fields = (
            "id",
            "user_id",
            "username",
            "full_name",
            "email",
            "phone_number",
            "school_name",
            "created_at",
            "updated_at",
        )

    def get_full_name(self, obj):
        return obj.user.get_full_name()