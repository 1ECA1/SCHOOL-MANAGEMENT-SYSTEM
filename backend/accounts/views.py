from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from audit.models import AuditLog
from audit.utils import log_audit

from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
)


User = get_user_model()


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(
            data=request.data
        )

        if serializer.is_valid():
            user = serializer.save()

            # -------------------------------------------------
            # AUDIT: USER CREATED
            # -------------------------------------------------
            log_audit(
                request=request,
                action=AuditLog.Action.CREATE,
                model_name="User",
                object_id=user.id,
                object_repr=str(user),
                description=(
                    f"Created user account "
                    f"'{user.username}'."
                ),
            )

            return Response(
                {
                    "message": "Registration successful.",
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(
            data=request.data
        )

        if serializer.is_valid():
            user = serializer.validated_data["user"]

            refresh = RefreshToken.for_user(user)

            # -------------------------------------------------
            # AUDIT: USER LOGIN
            # -------------------------------------------------
            log_audit(
                request=request,
                action=AuditLog.Action.LOGIN,
                model_name="User",
                object_id=user.id,
                object_repr=str(user),
                description=(
                    f"User '{user.username}' "
                    f"logged in successfully."
                ),
                user=user,
            )

            return Response(
                {
                    "message": "Login successful.",
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        # -------------------------------------------------
        # AUDIT: USER LOGOUT
        # -------------------------------------------------
        log_audit(
            request=request,
            action=AuditLog.Action.LOGOUT,
            model_name="User",
            object_id=user.id,
            object_repr=str(user),
            description=(
                f"User '{user.username}' "
                f"logged out."
            ),
            user=user,
        )

        return Response(
            {
                "message": "Logout successful.",
            },
            status=status.HTTP_200_OK,
        )


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def patch(self, request):
        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():
            user = serializer.save()

            # -------------------------------------------------
            # AUDIT: PROFILE UPDATED
            # -------------------------------------------------
            log_audit(
                request=request,
                action=AuditLog.Action.UPDATE,
                model_name="User",
                object_id=user.id,
                object_repr=str(user),
                description=(
                    f"Updated profile for "
                    f"user '{user.username}'."
                ),
                user=user,
            )

            return Response(
                serializer.data,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )