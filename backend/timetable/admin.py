from django.contrib import admin

from .models import TimetableEntry


@admin.register(TimetableEntry)
class TimetableEntryAdmin(admin.ModelAdmin):
    list_display = (
        "school",
        "academic_session",
        "term",
        "class_level",
        "subject",
        "teacher",
        "day",
        "start_time",
        "end_time",
        "room",
        "is_active",
    )

    search_fields = (
        "class_level__name",
        "subject__name",
        "teacher__first_name",
        "teacher__last_name",
        "room",
    )

    list_filter = (
        "school",
        "academic_session",
        "term",
        "class_level",
        "day",
        "is_active",
    )

    ordering = (
        "day",
        "start_time",
    )