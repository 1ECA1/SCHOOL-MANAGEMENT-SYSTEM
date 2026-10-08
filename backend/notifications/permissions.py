from rest_framework.permissions import BasePermission


class CanSendNotification(BasePermission):
    """
    Allows only authorized roles to send notifications.

    SUPER_ADMIN
    SCHOOL_ADMIN
    PRINCIPAL
    TEACHER
    """

    allowed_roles = {
        "SUPER_ADMIN",
        "SCHOOL_ADMIN",
        "PRINCIPAL",
        "TEACHER",
    }

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        if not user.is_active:
            return False

        return user.role in self.allowed_roles