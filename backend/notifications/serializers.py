

from django.utils import timezone
from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):

    recipient_name = serializers.SerializerMethodField()

    notification_type_display = serializers.CharField(
        source="get_notification_type_display",
        read_only=True,
    )

    class Meta:
        model = Notification

        fields = [
            "id",
            "recipient",
            "recipient_name",
            "notification_type",
            "notification_type_display",
            "title",
            "message",
            "link",
            "is_read",
            "read_at",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "recipient",
            "recipient_name",
            "notification_type_display",
            "read_at",
            "created_at",
        ]

    def get_recipient_name(self, obj):
        if not obj.recipient:
            return None

        return (
            obj.recipient.get_full_name()
            or obj.recipient.username
        )

    def update(self, instance, validated_data):

        is_read = validated_data.get(
            "is_read",
            instance.is_read,
        )

        if is_read and not instance.is_read:
            validated_data["read_at"] = timezone.now()

        elif not is_read:
            validated_data["read_at"] = None

        return super().update(
            instance,
            validated_data,
        )