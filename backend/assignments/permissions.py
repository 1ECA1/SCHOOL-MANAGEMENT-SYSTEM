# from rest_framework.permissions import BasePermission

# from accounts.models import User


# class IsAssignmentManager(BasePermission):
#     """
#     Allows authenticated school administrators and teachers
#     to access assignment management endpoints.
#     """

#     ADMIN_ROLES = {
#         User.Role.SUPER_ADMIN,
#         User.Role.SCHOOL_ADMIN,
#         User.Role.PRINCIPAL,
#     }

#     def has_permission(self, request, view):
#         if not request.user or not request.user.is_authenticated:
#             return False

#         return request.user.role in (
#             self.ADMIN_ROLES
#             | {User.Role.TEACHER}
#         )

from rest_framework.permissions import BasePermission

from accounts.models import User


# ============================================================
# ASSIGNMENT VIEWER
# ============================================================

class IsAssignmentViewer(BasePermission):
    """
    Users allowed to VIEW assignment management data.

    SUPER_ADMIN
        Can view assignments across schools.

    SCHOOL_ADMIN
        Can view assignments belonging to their school.

    PRINCIPAL
        Can view assignments belonging to their school.

    TEACHER
        Can view assignments they are authorized to manage.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        return user.role in {
            User.Role.SUPER_ADMIN,
            User.Role.SCHOOL_ADMIN,
            User.Role.PRINCIPAL,
            User.Role.TEACHER,
        }


# ============================================================
# ASSIGNMENT MANAGER
# ============================================================

class IsAssignmentManager(BasePermission):
    """
    Users allowed to CREATE, UPDATE and DELETE assignments.

    PRINCIPAL
        Full assignment management within their school.

    TEACHER
        Assignment management is further restricted by the
        AssignmentSerializer:

            - Subject teacher
            - Class teacher
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        return user.role in {
            User.Role.PRINCIPAL,
            User.Role.TEACHER,
        }