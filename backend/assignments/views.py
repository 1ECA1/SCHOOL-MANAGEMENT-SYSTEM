from rest_framework import generics

from .models import Assignment, AssignmentSubmission
from .serializers import (
    AssignmentSerializer,
    AssignmentSubmissionSerializer,
)


class AssignmentListCreateView(generics.ListCreateAPIView):
    queryset = Assignment.objects.select_related(
        "school",
        "academic_session",
        "term",
        "class_level",
        "subject",
        "teacher",
    ).all()

    serializer_class = AssignmentSerializer


class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Assignment.objects.select_related(
        "school",
        "academic_session",
        "term",
        "class_level",
        "subject",
        "teacher",
    ).all()

    serializer_class = AssignmentSerializer


class AssignmentSubmissionListCreateView(
    generics.ListCreateAPIView
):
    queryset = AssignmentSubmission.objects.select_related(
        "assignment",
        "student",
    ).all()

    serializer_class = AssignmentSubmissionSerializer


class AssignmentSubmissionDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = AssignmentSubmission.objects.select_related(
        "assignment",
        "student",
    ).all()

    serializer_class = AssignmentSubmissionSerializer