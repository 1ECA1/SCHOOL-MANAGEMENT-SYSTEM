from decimal import Decimal

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import (
    GradeScale,
    StudentResult,
    ReportCard,
)

from .serializers import (
    GradeScaleSerializer,
    StudentResultSerializer,
    ReportCardSerializer,
)


# =========================
# Grade Scale
# =========================

class GradeScaleListCreateView(generics.ListCreateAPIView):
    queryset = GradeScale.objects.all()
    serializer_class = GradeScaleSerializer
    permission_classes = [IsAuthenticated]


class GradeScaleDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = GradeScale.objects.all()
    serializer_class = GradeScaleSerializer
    permission_classes = [IsAuthenticated]


# =========================
# Student Results
# =========================

class StudentResultListCreateView(
    generics.ListCreateAPIView
):
    queryset = StudentResult.objects.select_related(
        "student",
        "examination_subject",
        "examination_subject__subject",
        "examination_subject__examination",
    )

    serializer_class = StudentResultSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        result = serializer.save()

        total = (
            Decimal(result.ca_score)
            + Decimal(result.exam_score)
        )

        result.total_score = total

        grade_scale = (
            GradeScale.objects
            .filter(
                minimum_score__lte=total,
                maximum_score__gte=total,
                is_active=True,
            )
            .order_by("-minimum_score")
            .first()
        )

        if grade_scale:
            result.grade = grade_scale.grade
            result.remark = grade_scale.remark
            result.grade_point = grade_scale.grade_point
        else:
            result.grade = ""
            result.remark = ""
            result.grade_point = Decimal("0.00")

        result.save()


class StudentResultDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = StudentResult.objects.select_related(
        "student",
        "examination_subject",
        "examination_subject__subject",
        "examination_subject__examination",
    )

    serializer_class = StudentResultSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):
        result = serializer.save()

        total = (
            Decimal(result.ca_score)
            + Decimal(result.exam_score)
        )

        result.total_score = total

        grade_scale = (
            GradeScale.objects
            .filter(
                minimum_score__lte=total,
                maximum_score__gte=total,
                is_active=True,
            )
            .order_by("-minimum_score")
            .first()
        )

        if grade_scale:
            result.grade = grade_scale.grade
            result.remark = grade_scale.remark
            result.grade_point = grade_scale.grade_point
        else:
            result.grade = ""
            result.remark = ""
            result.grade_point = Decimal("0.00")

        result.save()


# =========================
# Report Card Helpers
# =========================

def get_student_results(report_card):
    """
    Get all results belonging to the student
    for the selected session, term and class.
    """

    return StudentResult.objects.filter(
        student=report_card.student,
        examination_subject__examination__academic_session=(
            report_card.academic_session
        ),
        examination_subject__examination__term=(
            report_card.term
        ),
        examination_subject__examination__class_level=(
            report_card.class_level
        ),
    )


def calculate_report_card_scores(report_card):
    """
    Calculate total score, average score and
    overall grade for a report card.
    """

    results = get_student_results(report_card)

    total_score = sum(
        (
            Decimal(result.total_score)
            for result in results
        ),
        Decimal("0.00"),
    )

    result_count = results.count()

    if result_count > 0:
        average_score = (
            total_score / Decimal(result_count)
        ).quantize(Decimal("0.01"))
    else:
        average_score = Decimal("0.00")

    grade_scale = (
        GradeScale.objects
        .filter(
            minimum_score__lte=average_score,
            maximum_score__gte=average_score,
            is_active=True,
        )
        .order_by("-minimum_score")
        .first()
    )

    if grade_scale:
        overall_grade = grade_scale.grade
    else:
        overall_grade = ""

    report_card.total_score = total_score
    report_card.average_score = average_score
    report_card.overall_grade = overall_grade

    # Promotion rule:
    # Average score of 50 or above = promoted.
    report_card.promoted = average_score >= Decimal("50.00")

    report_card.save()

    return report_card


def recalculate_class_positions(
    academic_session,
    term,
    class_level,
):
    """
    Recalculate position and total students
    for every report card in the class.

    Uses standard competition ranking:

    90 -> 1
    90 -> 1
    85 -> 3
    80 -> 4
    """

    report_cards = list(
        ReportCard.objects.filter(
            academic_session=academic_session,
            term=term,
            class_level=class_level,
        ).order_by("-average_score")
    )

    total_students = len(report_cards)

    for card in report_cards:

        position = (
            ReportCard.objects.filter(
                academic_session=academic_session,
                term=term,
                class_level=class_level,
                average_score__gt=card.average_score,
            ).count()
            + 1
        )

        card.position = position
        card.total_students = total_students

        card.save(
            update_fields=[
                "position",
                "total_students",
                "updated_at",
            ]
        )


# =========================
# Report Cards
# =========================

class ReportCardListCreateView(
    generics.ListCreateAPIView
):
    queryset = ReportCard.objects.select_related(
        "student",
        "academic_session",
        "term",
        "class_level",
    )

    serializer_class = ReportCardSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):

        report_card = serializer.save()

        # Calculate scores
        calculate_report_card_scores(
            report_card
        )

        # Calculate class ranking
        recalculate_class_positions(
            report_card.academic_session,
            report_card.term,
            report_card.class_level,
        )


class ReportCardDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = ReportCard.objects.select_related(
        "student",
        "academic_session",
        "term",
        "class_level",
    )

    serializer_class = ReportCardSerializer
    permission_classes = [IsAuthenticated]

    def perform_update(self, serializer):

        report_card = serializer.save()

        # Recalculate scores
        calculate_report_card_scores(
            report_card
        )

        # Recalculate class ranking
        recalculate_class_positions(
            report_card.academic_session,
            report_card.term,
            report_card.class_level,
        )