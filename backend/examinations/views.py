from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import (
    Examination,
    ExaminationSubject,
)

from .serializers import (
    ExaminationSerializer,
    ExaminationSubjectSerializer,
)


# =========================
# Examinations
# =========================

class ExaminationListCreateView(
    generics.ListCreateAPIView
):
    queryset = Examination.objects.select_related(
        "school",
        "academic_session",
        "term",
        "class_level",
    )

    serializer_class = ExaminationSerializer
    permission_classes = [IsAuthenticated]


class ExaminationDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = Examination.objects.select_related(
        "school",
        "academic_session",
        "term",
        "class_level",
    )

    serializer_class = ExaminationSerializer
    permission_classes = [IsAuthenticated]


# =========================
# Examination Subjects
# =========================

class ExaminationSubjectListCreateView(
    generics.ListCreateAPIView
):
    queryset = ExaminationSubject.objects.select_related(
        "examination",
        "subject",
    )

    serializer_class = ExaminationSubjectSerializer
    permission_classes = [IsAuthenticated]


class ExaminationSubjectDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = ExaminationSubject.objects.select_related(
        "examination",
        "subject",
    )

    serializer_class = ExaminationSubjectSerializer
    permission_classes = [IsAuthenticated]