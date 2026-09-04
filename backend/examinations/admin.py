from django.contrib import admin

from .models import (
    Examination,
    ExaminationSubject,
)


@admin.register(Examination)
class ExaminationAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "school",
        "academic_session",
        "term",
        "class_level",
        "examination_type",
        "start_date",
        "end_date",
        "is_published",
        "is_active",
    )

    search_fields = (
        "name",
        "description",
        "class_level__name",
    )

    list_filter = (
        "school",
        "academic_session",
        "term",
        "class_level",
        "examination_type",
        "is_published",
        "is_active",
    )

    date_hierarchy = "start_date"

    ordering = (
        "-start_date",
        "name",
    )


@admin.register(ExaminationSubject)
class ExaminationSubjectAdmin(admin.ModelAdmin):
    list_display = (
        "examination",
        "subject",
        "examination_date",
        "start_time",
        "end_time",
        "maximum_score",
        "pass_mark",
        "venue",
    )

    search_fields = (
        "examination__name",
        "subject__name",
        "venue",
    )

    list_filter = (
        "examination",
        "subject",
        "examination_date",
    )

    date_hierarchy = "examination_date"

    ordering = (
        "examination_date",
        "start_time",
    )