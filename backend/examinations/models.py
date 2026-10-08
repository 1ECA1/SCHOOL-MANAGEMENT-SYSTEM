from django.db import models
from accounts.models import User

from academics.models import (
    School,
    AcademicSession,
    Term,
    ClassLevel,
    Subject,
)


class ExamOfficerProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="exam_officer_profile",
    )

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="exam_officers",
    )

    employee_number = models.CharField(
        max_length=50,
        unique=True,
    )

    employment_date = models.DateField(
        null=True,
        blank=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return (
            f"{self.user.get_full_name() or self.user.username} "
            f"- {self.employee_number}"
        )

class Examination(models.Model):

    class ExaminationType(models.TextChoices):
        FIRST_CA = "FIRST_CA", "First Continuous Assessment"
        SECOND_CA = "SECOND_CA", "Second Continuous Assessment"
        MID_TERM = "MID_TERM", "Mid-Term Examination"
        MOCK = "MOCK", "Mock Examination"
        TERMINAL = "TERMINAL", "Terminal Examination"
        PROMOTION = "PROMOTION", "Promotion Examination"
        ENTRANCE = "ENTRANCE", "Entrance Examination"

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="examinations",
    )

    academic_session = models.ForeignKey(
        AcademicSession,
        on_delete=models.CASCADE,
        related_name="examinations",
    )

    term = models.ForeignKey(
        Term,
        on_delete=models.CASCADE,
        related_name="examinations",
    )

    class_level = models.ForeignKey(
        ClassLevel,
        on_delete=models.CASCADE,
        related_name="examinations",
    )

    name = models.CharField(max_length=200)

    examination_type = models.CharField(
        max_length=20,
        choices=ExaminationType.choices,
    )

    start_date = models.DateField()
    end_date = models.DateField()

    description = models.TextField(blank=True)

    is_published = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-start_date"]

    def __str__(self):
        return f"{self.name} - {self.class_level.name}"


class ExaminationSubject(models.Model):
    examination = models.ForeignKey(
        Examination,
        on_delete=models.CASCADE,
        related_name="subjects",
    )

    subject = models.ForeignKey(
        Subject,
        on_delete=models.PROTECT,
        related_name="examination_subjects",
    )

    examination_date = models.DateField()

    start_time = models.TimeField()
    end_time = models.TimeField()

    maximum_score = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=100,
    )

    pass_mark = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=40,
    )

    venue = models.CharField(
        max_length=200,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["examination_date", "start_time"]

        constraints = [
            models.UniqueConstraint(
                fields=["examination", "subject"],
                name="unique_examination_subject",
            )
        ]

    def __str__(self):
        return (
            f"{self.examination.name} - "
            f"{self.subject.name}"
        )