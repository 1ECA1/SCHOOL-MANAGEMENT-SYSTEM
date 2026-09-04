from decimal import Decimal

from django.db import models

from students.models import Student
from examinations.models import ExaminationSubject


class GradeScale(models.Model):
    name = models.CharField(
        max_length=100,
        default="Standard Grade Scale",
    )

    minimum_score = models.DecimalField(
        max_digits=6,
        decimal_places=2,
    )

    maximum_score = models.DecimalField(
        max_digits=6,
        decimal_places=2,
    )

    grade = models.CharField(
        max_length=5,
    )

    remark = models.CharField(
        max_length=100,
    )

    grade_point = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=0,
    )

    is_active = models.BooleanField(
        default=True,
    )

    def __str__(self):
        return f"{self.grade} ({self.minimum_score}-{self.maximum_score})"


class StudentResult(models.Model):
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="results",
    )

    examination_subject = models.ForeignKey(
        ExaminationSubject,
        on_delete=models.CASCADE,
        related_name="student_results",
    )

    ca_score = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0,
    )

    exam_score = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0,
    )

    total_score = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0,
    )

    grade = models.CharField(
        max_length=5,
        blank=True,
    )

    remark = models.CharField(
        max_length=100,
        blank=True,
    )

    grade_point = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=0,
    )

    position = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    is_published = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "student",
                    "examination_subject",
                ],
                name="unique_student_examination_result",
            )
        ]

    def save(self, *args, **kwargs):
        self.total_score = (
            Decimal(self.ca_score) +
            Decimal(self.exam_score)
        )

        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.student.full_name} - "
            f"{self.examination_subject.subject.name}"
        )


class ReportCard(models.Model):
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="report_cards",
    )

    academic_session = models.ForeignKey(
        "academics.AcademicSession",
        on_delete=models.CASCADE,
        related_name="report_cards",
    )

    term = models.ForeignKey(
        "academics.Term",
        on_delete=models.CASCADE,
        related_name="report_cards",
    )

    class_level = models.ForeignKey(
        "academics.ClassLevel",
        on_delete=models.CASCADE,
        related_name="report_cards",
    )

    total_score = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    average_score = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0,
    )

    overall_grade = models.CharField(
        max_length=5,
        blank=True,
    )

    position = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    total_students = models.PositiveIntegerField(
        default=0,
    )

    attendance_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0,
    )

    teacher_comment = models.TextField(
        blank=True,
    )

    principal_comment = models.TextField(
        blank=True,
    )

    promoted = models.BooleanField(
        default=False,
    )

    is_published = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "student",
                    "academic_session",
                    "term",
                ],
                name="unique_student_term_report_card",
            )
        ]

    def __str__(self):
        return (
            f"{self.student.full_name} - "
            f"{self.term.get_name_display()} - "
            f"Report Card"
        )