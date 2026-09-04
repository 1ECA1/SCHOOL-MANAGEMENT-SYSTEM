from rest_framework import serializers

from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    action_display = serializers.CharField(
        source="get_action_display",
        read_only=True,
    )

    class Meta:
        model = AuditLog

        fields = [
            "id",
            "user",
            "user_name",
            "action",
            "action_display",
            "model_name",
            "object_id",
            "object_repr",
            "description",
            "ip_address",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "user_name",
            "action_display",
            "created_at",
        ]

    def get_user_name(self, obj):
        if not obj.user:
            return None

        if hasattr(obj.user, "get_full_name"):
            full_name = obj.user.get_full_name()

            if full_name:
                return full_name

        return obj.user.username