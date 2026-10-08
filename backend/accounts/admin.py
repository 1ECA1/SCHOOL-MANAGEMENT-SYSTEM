from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        (
            "EduManageERP Information",
            {
                "fields": (
                    "role",
                    "school",
                    "phone",
                    "profile_image",
                )
            },
        ),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "EduManageERP Information",
            {
                "fields": (
                    "role",
                    "school",
                    "phone",
                    "profile_image",
                )
            },
        ),
    )

    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "role",
        "school",
        "is_active",
        "is_staff",
    )

    list_filter = (
        "role",
        "school",
        "is_active",
        "is_staff",
    )