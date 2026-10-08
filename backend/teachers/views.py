from django.db import transaction
from django.utils.crypto import get_random_string

from rest_framework import generics, serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import User

from .models import Teacher, TeacherSubject, ClassTeacher

from .serializers import (
    TeacherSerializer,
    TeacherSubjectSerializer,
    ClassTeacherSerializer,
)


class TeacherListCreateView(generics.ListCreateAPIView):
    queryset = Teacher.objects.select_related(
        "school",
        "department",
    ).all()

    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)

        response_data = serializer.data.copy()

        credentials = getattr(
            self,
            "_temporary_credentials",
            None,
        )

        if credentials:
            response_data["login_credentials"] = credentials

        return Response(
            response_data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    @transaction.atomic
    def perform_create(self, serializer):
        teacher = serializer.save()

        # -------------------------------------------------
        # If a User is already connected, do nothing.
        # -------------------------------------------------
        if teacher.user:
            return

        # -------------------------------------------------
        # Employee ID becomes the Teacher username.
        # -------------------------------------------------
        username = teacher.employee_id.strip()

        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({
                "employee_id": (
                    "A login account already exists "
                    "with this employee ID."
                )
            })

        # -------------------------------------------------
        # Use the teacher's email if provided.
        # Otherwise create an internal email.
        # -------------------------------------------------
        if teacher.email:
            email = teacher.email.strip().lower()

            if User.objects.filter(email=email).exists():
                raise serializers.ValidationError({
                    "email": (
                        "This email address is already "
                        "being used by another user."
                    )
                })

        else:
            email = (
                f"{username.lower()}"
                "@teacher.edumanage.local"
            )

            counter = 1

            while User.objects.filter(email=email).exists():
                email = (
                    f"{username.lower()}.{counter}"
                    "@teacher.edumanage.local"
                )

                counter += 1

        # -------------------------------------------------
        # Generate temporary password.
        # -------------------------------------------------
        temporary_password = get_random_string(
            length=10
        )

        # -------------------------------------------------
        # Create central User account.
        # -------------------------------------------------
        user = User.objects.create_user(
            username=username,
            email=email,
            password=temporary_password,
            role=User.Role.TEACHER,
            first_name=teacher.first_name,
            last_name=teacher.last_name,
            phone_number=teacher.phone_number or "",
        )

        # -------------------------------------------------
        # Connect Teacher profile to central User.
        # -------------------------------------------------
        teacher.user = user

        teacher.save(
            update_fields=["user"]
        )

        # -------------------------------------------------
        # Return credentials to the Admin.
        # -------------------------------------------------
        self._temporary_credentials = {
            "username": username,
            "password": temporary_password,
        }


class TeacherDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = Teacher.objects.select_related(
        "school",
        "department",
    ).all()

    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated]


class TeacherSubjectListCreateView(
    generics.ListCreateAPIView
):
    queryset = TeacherSubject.objects.select_related(
        "teacher",
        "subject",
        "class_level",
    ).all()

    serializer_class = TeacherSubjectSerializer
    permission_classes = [IsAuthenticated]


class TeacherSubjectDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = TeacherSubject.objects.select_related(
        "teacher",
        "subject",
        "class_level",
    ).all()

    serializer_class = TeacherSubjectSerializer
    permission_classes = [IsAuthenticated]


class ClassTeacherListCreateView(
    generics.ListCreateAPIView
):
    queryset = ClassTeacher.objects.select_related(
        "teacher",
        "class_level",
        "academic_session",
    ).all()

    serializer_class = ClassTeacherSerializer
    permission_classes = [IsAuthenticated]


class ClassTeacherDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = ClassTeacher.objects.select_related(
        "teacher",
        "class_level",
        "academic_session",
    ).all()

    serializer_class = ClassTeacherSerializer
    permission_classes = [IsAuthenticated]



    # ============================================================
# LOGGED-IN TEACHER: MY SUBJECT ASSIGNMENTS
# ============================================================

class MyTeacherSubjectListView(generics.ListAPIView):
    """
    Returns only TeacherSubject assignments belonging to
    the currently authenticated teacher.

    Used by the Teacher Portal.
    """

    serializer_class = TeacherSubjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        teacher = getattr(user, "teacher_profile", None)

        if not teacher:
            return TeacherSubject.objects.none()

        return (
            TeacherSubject.objects
            .select_related(
                "teacher",
                "subject",
                "class_level",
            )
            .filter(
                teacher=teacher,
            )
            .order_by(
                "class_level__name",
                "subject__name",
            )
        )


# ============================================================
# LOGGED-IN TEACHER: MY CLASS ASSIGNMENTS
# ============================================================

class MyClassTeacherListView(generics.ListAPIView):
    """
    Returns only ClassTeacher assignments belonging to
    the currently authenticated teacher.

    Used by the Teacher Portal.
    """

    serializer_class = ClassTeacherSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        teacher = getattr(user, "teacher_profile", None)

        if not teacher:
            return ClassTeacher.objects.none()

        return (
            ClassTeacher.objects
            .select_related(
                "teacher",
                "class_level",
                "academic_session",
            )
            .filter(
                teacher=teacher,
                is_active=True,
            )
            .order_by(
                "-academic_session_id",
                "class_level__name",
            )
        )