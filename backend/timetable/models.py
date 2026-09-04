from django.db import models
from academics.models import School
from academics.models import AcademicSession, Term, ClassLevel, Subject
from teachers.models import Teacher


class TimetableEntry(models.Model):

    class DayOfWeek(models.TextChoices):
        MONDAY = "MONDAY", "Monday"
        TUESDAY = "TUESDAY", "Tuesday"
        WEDNESDAY = "WEDNESDAY", "Wednesday"
        THURSDAY = "THURSDAY", "Thursday"
        FRIDAY = "FRIDAY", "Friday"
        SATURDAY = "SATURDAY", "Saturday"

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="timetable_entries",
    )

    academic_session = models.ForeignKey(
        AcademicSession,
        on_delete=models.CASCADE,
        related_name="timetable_entries",
    )

    term = models.ForeignKey(
        Term,
        on_delete=models.CASCADE,
        related_name="timetable_entries",
    )

    class_level = models.ForeignKey(
        ClassLevel,
        on_delete=models.CASCADE,
        related_name="timetable_entries",
    )

    subject = models.ForeignKey(
        Subject,
        on_delete=models.PROTECT,
        related_name="timetable_entries",
    )

    teacher = models.ForeignKey(
        Teacher,
        on_delete=models.PROTECT,
        related_name="timetable_entries",
    )

    day = models.CharField(
        max_length=15,
        choices=DayOfWeek.choices,
    )

    start_time = models.TimeField()

    end_time = models.TimeField()

    room = models.CharField(
        max_length=100,
        blank=True,
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["day", "start_time"]

    def __str__(self):
        return (
            f"{self.class_level.name} - "
            f"{self.subject.name} - "
            f"{self.day}"
        )