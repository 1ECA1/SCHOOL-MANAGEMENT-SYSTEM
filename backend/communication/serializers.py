from rest_framework import serializers

from .models import Announcement, Message


class AnnouncementSerializer(serializers.ModelSerializer):

    school_name = serializers.CharField(
        source="school.name",
        read_only=True,
    )

    audience_display = serializers.CharField(
        source="get_audience_display",
        read_only=True,
    )

    class Meta:
        model = Announcement

        fields = [
            "id",
            "school",
            "school_name",
            "title",
            "content",
            "audience",
            "audience_display",
            "attachment",
            "is_published",
            "publish_at",
            "expires_at",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]


class MessageSerializer(serializers.ModelSerializer):

    school_name = serializers.CharField(
        source="school.name",
        read_only=True,
    )

    sender_name = serializers.SerializerMethodField()

    recipient_name = serializers.SerializerMethodField()

    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )

    class Meta:
        model = Message

        fields = [
            "id",
            "school",
            "school_name",
            "sender",
            "sender_name",
            "recipient",
            "recipient_name",
            "subject",
            "content",
            "attachment",
            "status",
            "status_display",
            "read_at",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "sender",
            "status",
            "read_at",
            "created_at",
            "updated_at",
        ]

    def get_sender_name(self, obj):
        return obj.sender.get_full_name() or obj.sender.username

    def get_recipient_name(self, obj):
        return (
            obj.recipient.get_full_name()
            or obj.recipient.username
        )