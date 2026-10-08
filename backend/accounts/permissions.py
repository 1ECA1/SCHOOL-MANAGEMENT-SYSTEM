from rest_framework.permissions import BasePermission
from accounts.models import User


class IsSchoolSuperAdmin(BasePermission):
    """
    Allows access only to an active School Admin
    who has an assigned school.
    """

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


class IsSuperAdmin(BasePermission):
    """
    Allows access only to an active Super Admin.
    """

    message = "Only an active Super Admin can perform this action."

    def has_permission(self, request, view):
        user = request.user

        return (
            bool(user and user.is_authenticated)
            and user.is_active
            and user.role == User.Role.SUPER_ADMIN
        )