from django.contrib import admin

from .models import (
    Teacher,
    TeacherSubject,
    ClassTeacher,
)


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = (
        "employee_id",
        "full_name",
        "school",
        "department",
        "gender",
        "employment_status",
        "is_class_teacher",
    )

    search_fields = (
        "employee_id",
        "first_name",
        "middle_name",
        "last_name",
        "email",
        "phone_number",
        "specialization",
        "qualification",
    )

    list_filter = (
        "school",
        "department",
        "gender",
        "employment_status",
        "is_class_teacher",
    )


@admin.register(TeacherSubject)
class TeacherSubjectAdmin(admin.ModelAdmin):
    list_display = (
        "teacher",
        "subject",
        "class_level",
        "is_primary",
        "assigned_at",
    )

    search_fields = (
        "teacher__first_name",
        "teacher__last_name",
        "teacher__employee_id",
        "subject__name",
        "class_level__name",
    )

    list_filter = (
        "subject",
        "class_level",
        "is_primary",
    )


@admin.register(ClassTeacher)
class ClassTeacherAdmin(admin.ModelAdmin):
    list_display = (
        "teacher",
        "class_level",
        "academic_session",
        "is_active",
        "assigned_at",
    )

    search_fields = (
        "teacher__first_name",
        "teacher__last_name",
        "teacher__employee_id",
        "class_level__name",
        "academic_session__name",
    )

    list_filter = (
        "academic_session",
        "class_level",
        "is_active",
    )