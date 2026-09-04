from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import (
    ParentGuardian,
    Student,
    StudentEnrollment,
    StudentSubjectEnrollment,
)

from .serializers import (
    ParentGuardianSerializer,
    StudentSerializer,
    StudentEnrollmentSerializer,
    StudentSubjectEnrollmentSerializer,
)


# =========================
# Parent / Guardian
# =========================

class ParentGuardianListCreateView(generics.ListCreateAPIView):
    queryset = ParentGuardian.objects.all()
    serializer_class = ParentGuardianSerializer
    permission_classes = [IsAuthenticated]


class ParentGuardianDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ParentGuardian.objects.all()
    serializer_class = ParentGuardianSerializer
    permission_classes = [IsAuthenticated]

# =========================
# Student Parent / Guardian
# =========================

class StudentParentListView(generics.ListAPIView):
    serializer_class = ParentGuardianSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        student_id = self.kwargs["student_id"]

        return ParentGuardian.objects.filter(
            students__id=student_id
        )


class StudentParentAddView(generics.CreateAPIView):
    serializer_class = ParentGuardianSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        student = get_object_or_404(
            Student,
            id=kwargs["student_id"]
        )

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        phone = (
            serializer.validated_data.get("phone_number")
            or ""
        ).strip()

        email = (
            serializer.validated_data.get("email")
            or ""
        ).strip().lower()

        parent = None

        # -----------------------------------------
        # 1. Try to find existing parent by phone
        # -----------------------------------------
        if phone:
            parent = ParentGuardian.objects.filter(
                school=student.school,
                phone_number=phone,
            ).first()

        # -----------------------------------------
        # 2. If not found, try email
        # -----------------------------------------
        if parent is None and email:
            parent = ParentGuardian.objects.filter(
                school=student.school,
                email__iexact=email,
            ).first()

        # -----------------------------------------
        # 3. Create parent if they don't exist
        # -----------------------------------------
        if parent is None:
            parent = serializer.save(
                school=student.school
            )
            response_status = status.HTTP_201_CREATED

        else:
            response_status = status.HTTP_200_OK

        # -----------------------------------------
        # 4. Link parent to this student
        # -----------------------------------------
        already_linked = student.parents.filter(
            id=parent.id
        ).exists()

        student.parents.add(parent)

        # -----------------------------------------
        # 5. Return the parent
        # -----------------------------------------
        output_serializer = self.get_serializer(
            parent
        )

        return Response(
            output_serializer.data,
            status=(
                status.HTTP_200_OK
                if already_linked
                else response_status
            )
        )


class StudentParentRemoveView(
    generics.DestroyAPIView
):
    serializer_class = ParentGuardianSerializer
    permission_classes = [IsAuthenticated]

    def delete(self, request, student_id, parent_id):
        try:
            student = Student.objects.get(
                id=student_id
            )

            parent = ParentGuardian.objects.get(
                id=parent_id
            )

            student.parents.remove(parent)

            return Response(
                status=status.HTTP_204_NO_CONTENT
            )

        except Student.DoesNotExist:
            return Response(
                {"detail": "Student not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        except ParentGuardian.DoesNotExist:
            return Response(
                {"detail": "Parent/Guardian not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
# =========================
# Students
# =========================

class StudentListCreateView(generics.ListCreateAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]


class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]


# =========================
# Student Enrollment
# =========================

# class StudentEnrollmentListCreateView(generics.ListCreateAPIView):
#     queryset = StudentEnrollment.objects.all()
#     serializer_class = StudentEnrollmentSerializer
#     permission_classes = [IsAuthenticated]

class StudentEnrollmentListCreateView(generics.ListCreateAPIView):
    serializer_class = StudentEnrollmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = StudentEnrollment.objects.select_related(
            "student", "class_level", "academic_session"
        )

        class_level = self.request.query_params.get("class_level")
        academic_session = self.request.query_params.get("academic_session")
        term = self.request.query_params.get("term")

        if class_level:
            queryset = queryset.filter(class_level_id=class_level)
        if academic_session:
            queryset = queryset.filter(academic_session_id=academic_session)
        if term:
            queryset = queryset.filter(term_id=term)

        return queryset

class StudentEnrollmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StudentEnrollment.objects.all()
    serializer_class = StudentEnrollmentSerializer
    permission_classes = [IsAuthenticated]


# =========================
# Student Subject Enrollment
# =========================

class StudentSubjectEnrollmentListCreateView(
    generics.ListCreateAPIView
):
    queryset = StudentSubjectEnrollment.objects.all()
    serializer_class = StudentSubjectEnrollmentSerializer
    permission_classes = [IsAuthenticated]


class StudentSubjectEnrollmentDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = StudentSubjectEnrollment.objects.all()
    serializer_class = StudentSubjectEnrollmentSerializer
    permission_classes = [IsAuthenticated]