from django.contrib import admin

from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "school",
        "document_type",
        "uploaded_by",
        "student",
        "staff",
        "is_active",
        "created_at",
    )

    search_fields = (
        "title",
        "description",
        "school__name",
        "uploaded_by__username",
        "uploaded_by__email",
        "student__first_name",
        "student__last_name",
        "student__admission_number",
        "staff__first_name",
        "staff__last_name",
        "staff__employee_id",
    )

    list_filter = (
        "school",
        "document_type",
        "is_active",
        "created_at",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )