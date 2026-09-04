from django.contrib import admin

from .models import (
    GradeScale,
    StudentResult,
    ReportCard,
)


@admin.register(GradeScale)
class GradeScaleAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "minimum_score",
        "maximum_score",
        "grade",
        "remark",
        "grade_point",
        "is_active",
    )

    search_fields = (
        "name",
        "grade",
        "remark",
    )

    list_filter = (
        "grade",
        "is_active",
    )

    ordering = (
        "-minimum_score",
    )


@admin.register(StudentResult)
class StudentResultAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "examination_subject",
        "ca_score",
        "exam_score",
        "total_score",
        "grade",
        "remark",
        "position",
        "is_published",
    )

    search_fields = (
        "student__first_name",
        "student__last_name",
        "student__admission_number",
        "examination_subject__subject__name",
        "examination_subject__examination__name",
    )

    list_filter = (
        "grade",
        "is_published",
        "examination_subject__examination",
        "examination_subject__subject",
    )

    ordering = (
        "examination_subject",
        "student__last_name",
    )


@admin.register(ReportCard)
class ReportCardAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "academic_session",
        "term",
        "class_level",
        "total_score",
        "average_score",
        "overall_grade",
        "position",
        "total_students",
        "promoted",
        "is_published",
    )

    search_fields = (
        "student__first_name",
        "student__last_name",
        "student__admission_number",
        "overall_grade",
    )

    list_filter = (
        "academic_session",
        "term",
        "class_level",
        "overall_grade",
        "promoted",
        "is_published",
    )

    ordering = (
        "academic_session",
        "term",
        "class_level",
        "position",
    )