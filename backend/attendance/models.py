from django.db import models

from students.models import Student
from academics.models import (
    School,
    AcademicSession,
    Term,
    ClassLevel,
    Subject,
)


# ============================================================
# SCHOOL ATTENDANCE SETTINGS
# ============================================================

class SchoolAttendanceSetting(models.Model):
    """
    Stores the number of times school opened for a particular
    school, academic session and term.

    This is a school-wide setting.

    It is NOT stored separately for each student.
    """

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="attendance_settings",
    )

    academic_session = models.ForeignKey(
        AcademicSession,
        on_delete=models.CASCADE,
        related_name="attendance_settings",
    )

    term = models.ForeignKey(
        Term,
        on_delete=models.CASCADE,
        related_name="attendance_settings",
    )

    times_school_opened = models.PositiveIntegerField(
        default=0,
        help_text="Number of times the school opened during this term.",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = [
            "-academic_session",
            "term",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "school",
                    "academic_session",
                    "term",
                ],
                name="unique_school_attendance_setting",
            )
        ]

    def __str__(self):
        return (
            f"{self.school.name} - "
            f"{self.academic_session.name} - "
            f"{self.term.name} - "
            f"{self.times_school_opened} openings"
        )


# ============================================================
# ATTENDANCE RECORD
# ============================================================

class AttendanceRecord(models.Model):

    class Status(models.TextChoices):
        PRESENT = "PRESENT", "Present"
        ABSENT = "ABSENT", "Absent"
        LATE = "LATE", "Late"
        EXCUSED = "EXCUSED", "Excused"

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="attendance_records",
    )

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="attendance_records",
    )

    academic_session = models.ForeignKey(
        AcademicSession,
        on_delete=models.CASCADE,
        related_name="attendance_records",
    )

    term = models.ForeignKey(
        Term,
        on_delete=models.CASCADE,
        related_name="attendance_records",
    )

    class_level = models.ForeignKey(
        ClassLevel,
        on_delete=models.CASCADE,
        related_name="attendance_records",
    )

    subject = models.ForeignKey(
        Subject,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="attendance_records",
    )

    date = models.DateField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
    )

    check_in_time = models.TimeField(
        null=True,
        blank=True,
    )

    check_out_time = models.TimeField(
        null=True,
        blank=True,
    )

    remarks = models.TextField(
        blank=True,
    )

    recorded_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-date"]

        constraints = [
            models.UniqueConstraint(
                fields=["student", "date"],
                condition=models.Q(subject__isnull=True),
                name="unique_student_general_attendance",
            ),
            models.UniqueConstraint(
                fields=["student", "subject", "date"],
                condition=models.Q(subject__isnull=False),
                name="unique_student_subject_attendance",
            ),
        ]

    def __str__(self):
        return (
            f"{self.student.full_name} - "
            f"{self.date} - "
            f"{self.get_status_display()}"
        )