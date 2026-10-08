# from django.contrib import admin

# from .models import (
#     ParentGuardian,
#     Student,
#     StudentEnrollment,
#     StudentSubjectEnrollment,
# )


# @admin.register(ParentGuardian)
# class ParentGuardianAdmin(admin.ModelAdmin):
#     list_display = (
#         "full_name",
#         "relationship",
#         "phone_number",
#         "email",
#         "school",
#         "is_active",
#     )

#     search_fields = (
#         "full_name",
#         "phone_number",
#         "email",
#     )

#     list_filter = (
#         "school",
#         "relationship",
#         "is_active",
#     )


# @admin.register(Student)
# class StudentAdmin(admin.ModelAdmin):
#     list_display = (
#         "admission_number",
#         "full_name",
#         "gender",
#         "date_of_birth",
#         "department",
#         "status",
#     )

#     search_fields = (
#         "admission_number",
#         "first_name",
#         "middle_name",
#         "last_name",
#         "email",
#         "phone_number",
#     )

#     list_filter = (
#         "school",
#         "gender",
#         "status",
#         "department",
#     )


# @admin.register(StudentEnrollment)
# class StudentEnrollmentAdmin(admin.ModelAdmin):
#     list_display = (
#         "student",
#         "academic_session",
#         "term",
#         "class_level",
#         "roll_number",
#         "is_current",
#     )

#     search_fields = (
#         "student__first_name",
#         "student__last_name",
#         "student__admission_number",
#     )

#     list_filter = (
#         "academic_session",
#         "term",
#         "class_level",
#         "is_current",
#     )


# @admin.register(StudentSubjectEnrollment)
# class StudentSubjectEnrollmentAdmin(admin.ModelAdmin):
#     list_display = (
#         "student_enrollment",
#         "subject",
#         "academic_session",
#         "term",
#         "is_core",
#         "is_active",
#     )

#     search_fields = (
#         "student_enrollment__student__first_name",
#         "student_enrollment__student__last_name",
#         "student_enrollment__student__admission_number",
#         "subject__name",
#     )

#     list_filter = (
#         "academic_session",
#         "term",
#         "subject",
#         "is_core",
#         "is_active",
#     )


# from django.contrib import admin

# from .models import OptionalSubjectSelectionSetting


# @admin.register(OptionalSubjectSelectionSetting)
# class OptionalSubjectSelectionSettingAdmin(admin.ModelAdmin):

#     list_display = (
#         "school",
#         "academic_session",
#         "term",
#         "class_level",
#         "is_enabled",
#         "max_optional_subjects",
#         "start_datetime",
#         "end_datetime",
#     )

#     list_filter = (
#         "school",
#         "academic_session",
#         "term",
#         "class_level",
#         "is_enabled",
#     )

#     search_fields = (
#         "school__name",
#         "academic_session__name",
#         "class_level__name",
#     )

#     ordering = (
#         "-academic_session",
#         "term",
#         "class_level",
#     )



from django.contrib import admin

from .models import (
ParentGuardian,
Student,
StudentEnrollment,
StudentSubjectEnrollment,
OptionalSubjectSelectionSetting,
)

# ============================================================

# STUDENT ENROLLMENT INLINE

# ============================================================

class StudentEnrollmentInline(admin.TabularInline):
    model = StudentEnrollment
    extra = 1


    fields = (
        "academic_session",
        "term",
        "class_level",
        "roll_number",
        "is_current",
        "remarks",
    )

    ordering = (
        "-academic_session",
        "term",
        "class_level",
    )


# ============================================================

# PARENT / GUARDIAN

# ============================================================

@admin.register(ParentGuardian)
class ParentGuardianAdmin(admin.ModelAdmin):


    list_display = (
        "full_name",
        "relationship",
        "phone_number",
        "email",
        "school",
        "is_active",
    )

    search_fields = (
        "full_name",
        "phone_number",
        "email",
    )

    list_filter = (
        "school",
        "relationship",
        "is_active",
    )


# ============================================================

# STUDENT

# ============================================================

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):


    list_display = (
        "admission_number",
        "full_name",
        "gender",
        "date_of_birth",
        "department",
        "status",
    )

    search_fields = (
        "admission_number",
        "first_name",
        "middle_name",
        "last_name",
        "email",
        "phone_number",
    )

    list_filter = (
        "school",
        "gender",
        "status",
        "department",
    )

    inlines = [
        StudentEnrollmentInline,
    ]


# ============================================================

# STUDENT ENROLLMENT

# ============================================================

@admin.register(StudentEnrollment)
class StudentEnrollmentAdmin(admin.ModelAdmin):


    list_display = (
        "student",
        "academic_session",
        "term",
        "class_level",
        "roll_number",
        "is_current",
    )

    search_fields = (
        "student__first_name",
        "student__middle_name",
        "student__last_name",
        "student__admission_number",
    )

    list_filter = (
        "academic_session",
        "term",
        "class_level",
        "is_current",
    )


# ============================================================

# STUDENT SUBJECT ENROLLMENT

# ============================================================

@admin.register(StudentSubjectEnrollment)
class StudentSubjectEnrollmentAdmin(admin.ModelAdmin):


    list_display = (
        "student_enrollment",
        "subject",
        "academic_session",
        "term",
        "is_core",
        "is_active",
    )

    search_fields = (
        "student_enrollment__student__first_name",
        "student_enrollment__student__last_name",
        "student_enrollment__student__admission_number",
        "subject__name",
    )

    list_filter = (
        "academic_session",
        "term",
        "subject",
        "is_core",
        "is_active",
    )


# ============================================================

# OPTIONAL SUBJECT SELECTION SETTINGS

# ============================================================

@admin.register(OptionalSubjectSelectionSetting)
class OptionalSubjectSelectionSettingAdmin(admin.ModelAdmin):


    list_display = (
        "school",
        "academic_session",
        "term",
        "class_level",
        "is_enabled",
        "max_optional_subjects",
        "start_datetime",
        "end_datetime",
    )

    list_filter = (
        "school",
        "academic_session",
        "term",
        "class_level",
        "is_enabled",
    )

    search_fields = (
        "school__name",
        "academic_session__name",
        "class_level__name",
    )

    ordering = (
        "-academic_session",
        "term",
        "class_level",
    )

