from django.contrib import admin

from .models import Announcement, Message


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "school",
        "audience",
        "is_published",
        "publish_at",
        "expires_at",
        "created_at",
    )

    search_fields = (
        "title",
        "content",
        "school__name",
    )

    list_filter = (
        "school",
        "audience",
        "is_published",
        "publish_at",
        "expires_at",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = ("-created_at",)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = (
        "subject",
        "school",
        "sender",
        "recipient",
        "status",
        "read_at",
        "created_at",
    )

    search_fields = (
        "subject",
        "content",
        "sender__username",
        "sender__email",
        "recipient__username",
        "recipient__email",
        "school__name",
    )

    list_filter = (
        "school",
        "status",
        "created_at",
        "read_at",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = ("-created_at",)