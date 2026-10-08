from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from accounts.models import User

from .models import Principal
from .serializers import PrincipalSerializer


# ============================================================
# ROLE HELPERS
# ============================================================

def is_principal_manager(user):
    """
    Users who can manage Principal records.
    """
    return str(getattr(user, "role", "")).upper() in [
        "SUPER_ADMIN",
        "SCHOOL_ADMIN",
    ]


def is_principal(user):
    """
    Check whether the logged-in user is a Principal.
    """
    return str(getattr(user, "role", "")).upper() == "PRINCIPAL"


# ============================================================
# PRINCIPAL LIST / CREATE
# ============================================================

class PrincipalListCreateView(generics.ListCreateAPIView):
    serializer_class = PrincipalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role = str(getattr(user, "role", "")).upper()

        queryset = Principal.objects.select_related(
            "user",
            "school",
        )

        # ====================================================
        # SUPER ADMIN
        # ====================================================

        if role == "SUPER_ADMIN":
            return queryset

        # ====================================================
        # SCHOOL ADMIN
        # ====================================================

        if role == "SCHOOL_ADMIN":
            if not user.school_id:
                return Principal.objects.none()

            return queryset.filter(
                school_id=user.school_id
            )

        # ====================================================
        # PRINCIPAL
        # ====================================================

        if role == "PRINCIPAL":
            # A Principal can only see their own profile.
            return queryset.filter(
                user_id=user.id
            )

        # ====================================================
        # EVERYONE ELSE
        # ====================================================

        return Principal.objects.none()

    def create(self, request, *args, **kwargs):
        """
        Only Super Admin and School Admin can create
        Principal profiles.
        """

        if not is_principal_manager(request.user):
            raise PermissionDenied(
                "You do not have permission to manage principals."
            )

        return super().create(request, *args, **kwargs)


# ============================================================
# PRINCIPAL DETAIL
# ============================================================

class PrincipalDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = PrincipalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role = str(getattr(user, "role", "")).upper()

        queryset = Principal.objects.select_related(
            "user",
            "school",
        )

        # ====================================================
        # SUPER ADMIN
        # ====================================================

        if role == "SUPER_ADMIN":
            return queryset

        # ====================================================
        # SCHOOL ADMIN
        # ====================================================

        if role == "SCHOOL_ADMIN":
            if not user.school_id:
                return Principal.objects.none()

            return queryset.filter(
                school_id=user.school_id
            )

        # ====================================================
        # PRINCIPAL
        # ====================================================

        if role == "PRINCIPAL":
            # A Principal can only access their own profile.
            return queryset.filter(
                user_id=user.id
            )

        # ====================================================
        # EVERYONE ELSE
        # ====================================================

        return Principal.objects.none()

    def update(self, request, *args, **kwargs):
        """
        Only Super Admin and School Admin can update
        Principal profiles.

        A Principal can retrieve their own profile but
        cannot modify it through this endpoint.
        """

        if not is_principal_manager(request.user):
            raise PermissionDenied(
                "You do not have permission to update principals."
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """
        Only Super Admin and School Admin can delete
        Principal profiles.
        """

        if not is_principal_manager(request.user):
            raise PermissionDenied(
                "You do not have permission to delete principals."
            )

        return super().destroy(request, *args, **kwargs)