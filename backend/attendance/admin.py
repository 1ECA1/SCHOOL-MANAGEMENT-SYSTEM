from django.contrib import admin

from .models import AttendanceRecord


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "date",
        "status",
        "school",
        "academic_session",
        "term",
        "class_level",
        "subject",
        "check_in_time",
        "check_out_time",
    )

    search_fields = (
        "student__first_name",
        "student__last_name",
        "student__admission_number",
        "subject__name",
    )

    list_filter = (
        "school",
        "academic_session",
        "term",
        "class_level",
        "subject",
        "status",
        "date",
    )

    date_hierarchy = "date"

    ordering = (
        "-date",
        "student__last_name",
    )