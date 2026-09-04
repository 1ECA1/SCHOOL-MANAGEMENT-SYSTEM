from django.db import models

from students.models import Student
from academics.models import School, AcademicSession, Term, ClassLevel, Subject


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
                fields=[
                    "student",
                    "subject",
                    "date",
                ],
                name="unique_student_subject_attendance",
            )
        ]

    def __str__(self):
        return (
            f"{self.student.full_name} - "
            f"{self.date} - "
            f"{self.get_status_display()}"
        )