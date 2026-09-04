from django.contrib import admin

from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "action",
        "model_name",
        "object_id",
        "object_repr",
        "ip_address",
        "created_at",
    )

    search_fields = (
        "user__username",
        "model_name",
        "object_id",
        "object_repr",
        "description",
        "ip_address",
    )

    list_filter = (
        "action",
        "model_name",
        "created_at",
    )

    readonly_fields = (
        "user",
        "action",
        "model_name",
        "object_id",
        "object_repr",
        "description",
        "ip_address",
        "created_at",
    )

    ordering = (
        "-created_at",
    )