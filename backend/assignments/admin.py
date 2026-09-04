from django.contrib import admin

from .models import (
    Assignment,
    AssignmentSubmission,
)


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "school",
        "academic_session",
        "term",
        "class_level",
        "subject",
        "teacher",
        "assigned_date",
        "due_date",
        "maximum_score",
        "status",
        "allow_late_submission",
    )

    search_fields = (
        "title",
        "instructions",
        "subject__name",
        "teacher__first_name",
        "teacher__last_name",
        "teacher__employee_id",
    )

    list_filter = (
        "school",
        "academic_session",
        "term",
        "class_level",
        "subject",
        "teacher",
        "status",
        "allow_late_submission",
        "assigned_date",
    )

    date_hierarchy = "assigned_date"

    ordering = (
        "-assigned_date",
        "-created_at",
    )


@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = (
        "assignment",
        "student",
        "submitted_at",
        "score",
        "status",
        "graded_at",
    )

    search_fields = (
        "assignment__title",
        "student__first_name",
        "student__last_name",
        "student__admission_number",
        "teacher_feedback",
    )

    list_filter = (
        "status",
        "assignment",
        "submitted_at",
        "graded_at",
    )

    date_hierarchy = "submitted_at"

    ordering = (
        "-submitted_at",
    )