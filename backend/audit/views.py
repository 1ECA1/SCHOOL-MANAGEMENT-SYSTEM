from django.db.models import Q
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogListView(generics.ListAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        queryset = (
            AuditLog.objects
            .select_related("user")
            .all()
        )

        # -------------------------------------------------
        # SCHOOL ADMIN
        # -------------------------------------------------
        if user.role == "SCHOOL_ADMIN":
            queryset = queryset.filter(
                Q(user__school_id=user.school_id)
                | Q(user__isnull=True)
            )

        # -------------------------------------------------
        # SUPER ADMIN
        # -------------------------------------------------
        elif user.role == "SUPER_ADMIN":
            pass

        # -------------------------------------------------
        # OTHER USERS
        # -------------------------------------------------
        else:
            queryset = queryset.filter(
                user_id=user.id
            )

        # -------------------------------------------------
        # SEARCH
        # -------------------------------------------------
        search = self.request.query_params.get("search")

        if search:
            queryset = queryset.filter(
                Q(description__icontains=search)
                | Q(model_name__icontains=search)
                | Q(object_repr__icontains=search)
                | Q(user__username__icontains=search)
                | Q(user__first_name__icontains=search)
                | Q(user__last_name__icontains=search)
            )

        # -------------------------------------------------
        # ACTION FILTER
        # -------------------------------------------------
        action = self.request.query_params.get("action")

        if action:
            queryset = queryset.filter(
                action=action.upper()
            )

        # -------------------------------------------------
        # MODEL / MODULE FILTER
        # -------------------------------------------------
        model_name = self.request.query_params.get("model")

        if model_name:
            queryset = queryset.filter(
                model_name__icontains=model_name
            )

        # -------------------------------------------------
        # USER FILTER
        # -------------------------------------------------
        user_id = self.request.query_params.get("user")

        if user_id:
            queryset = queryset.filter(
                user_id=user_id
            )

        # -------------------------------------------------
        # DATE FILTER
        # -------------------------------------------------
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")

        if date_from:
            queryset = queryset.filter(
                created_at__date__gte=date_from
            )

        if date_to:
            queryset = queryset.filter(
                created_at__date__lte=date_to
            )

        return queryset


class AuditLogDetailView(generics.RetrieveAPIView):
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        queryset = (
            AuditLog.objects
            .select_related("user")
            .all()
        )

        if user.role == "SUPER_ADMIN":
            return queryset

        if user.role == "SCHOOL_ADMIN":
            return queryset.filter(
                Q(user__school_id=user.school_id)
                | Q(user__isnull=True)
            )

        return queryset.filter(
            user_id=user.id
        )