from rest_framework.permissions import BasePermission

from accounts.models import User


# ============================================================
# SCHOOL SUPER ADMIN
# ============================================================

class IsSchoolSuperAdmin(BasePermission):
    message = (
        "Only an active School Admin with an assigned school "
        "can access this module."
    )

    def has_permission(self, request, view):
        user = request.user

        return (
            bool(user and user.is_authenticated)
            and user.is_active
            and user.role == User.Role.SCHOOL_ADMIN
            and user.school_id is not None
        )


# ============================================================
# SYSTEM SUPER ADMIN
# ============================================================

class IsSuperAdmin(BasePermission):
    message = (
        "Only an active Super Admin can perform this action."
    )

    def has_permission(self, request, view):
        user = request.user

        return (
            bool(user and user.is_authenticated)
            and user.is_active
            and user.role == User.Role.SUPER_ADMIN
        )