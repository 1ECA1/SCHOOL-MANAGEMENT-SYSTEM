from django.contrib import admin

from .models import (
    School,
    Department,
    ClassLevel,
    AcademicSession,
    Term,
    Subject,
)


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "code",
        "phone",
        "email",
        "is_active",
    )

    search_fields = (
        "name",
        "code",
        "email",
    )

    list_filter = (
        "is_active",
    )


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "code",
        "school",
        "is_active",
    )

    search_fields = (
        "name",
        "code",
    )

    list_filter = (
        "school",
        "is_active",
    )


@admin.register(ClassLevel)
class ClassLevelAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "code",
        "school",
        "is_active",
    )

    search_fields = (
        "name",
        "code",
    )

    list_filter = (
        "school",
        "is_active",
    )


@admin.register(AcademicSession)
class AcademicSessionAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "school",
        "start_date",
        "end_date",
        "is_active",
    )

    search_fields = (
        "name",
    )

    list_filter = (
        "school",
        "is_active",
    )


@admin.register(Term)
class TermAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "academic_session",
        "start_date",
        "end_date",
        "is_active",
    )

    list_filter = (
        "name",
        "academic_session",
        "is_active",
    )


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "code",
        "school",
        "is_active",
    )

    search_fields = (
        "name",
        "code",
    )

    list_filter = (
        "school",
        "is_active",
    )