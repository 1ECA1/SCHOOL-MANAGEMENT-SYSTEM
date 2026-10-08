from django.contrib import admin

from .models import Applicant, AdmissionOfficerProfile


@admin.register(AdmissionOfficerProfile)
class AdmissionOfficerProfileAdmin(admin.ModelAdmin):
    list_display = (
        "employee_number",
        "user",
        "school",
        "employment_date",
        "is_active",
    )

    search_fields = (
        "employee_number",
        "user__username",
        "user__first_name",
        "user__last_name",
        "user__email",
    )

    list_filter = (
        "school",
        "is_active",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )


@admin.register(Applicant)
class ApplicantAdmin(admin.ModelAdmin):
    list_display = (
        "application_number",
        "full_name",
        "school",
        "academic_session",
        "class_level",
        "department",
        "status",
        "application_date",
    )

    search_fields = (
        "application_number",
        "first_name",
        "middle_name",
        "last_name",
        "email",
        "phone_number",
        "guardian_name",
        "guardian_phone",
    )

    list_filter = (
        "status",
        "gender",
        "school",
        "academic_session",
        "class_level",
        "department",
    )

    readonly_fields = (
        "application_number",
        "application_date",
        "reviewed_at",
        "reviewed_by",
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )