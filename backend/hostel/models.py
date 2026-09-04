from django.db import models

from academics.models import School
from students.models import Student


class Hostel(models.Model):

    class Gender(models.TextChoices):
        MALE = "MALE", "Male"
        FEMALE = "FEMALE", "Female"
        MIXED = "MIXED", "Mixed"

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="hostels",
    )

    name = models.CharField(
        max_length=200,
    )

    code = models.CharField(
        max_length=50,
    )

    gender = models.CharField(
        max_length=10,
        choices=Gender.choices,
    )

    address = models.TextField(
        blank=True,
    )

    description = models.TextField(
        blank=True,
    )

    total_rooms = models.PositiveIntegerField(
        default=0,
    )

    total_capacity = models.PositiveIntegerField(
        default=0,
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

    class Meta:
        ordering = ["name"]

        constraints = [
            models.UniqueConstraint(
                fields=["school", "code"],
                name="unique_hostel_code_per_school",
            )
        ]

    def __str__(self):
        return f"{self.name} - {self.school.name}"


class HostelRoom(models.Model):

    hostel = models.ForeignKey(
        Hostel,
        on_delete=models.CASCADE,
        related_name="rooms",
    )

    room_number = models.CharField(
        max_length=50,
    )

    floor = models.CharField(
        max_length=50,
        blank=True,
    )

    capacity = models.PositiveIntegerField(
        default=1,
    )

    description = models.TextField(
        blank=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["room_number"]

        constraints = [
            models.UniqueConstraint(
                fields=["hostel", "room_number"],
                name="unique_room_per_hostel",
            )
        ]

    def __str__(self):
        return f"{self.hostel.name} - Room {self.room_number}"


class Bed(models.Model):

    room = models.ForeignKey(
        HostelRoom,
        on_delete=models.CASCADE,
        related_name="beds",
    )

    bed_number = models.CharField(
        max_length=50,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["bed_number"]

        constraints = [
            models.UniqueConstraint(
                fields=["room", "bed_number"],
                name="unique_bed_per_room",
            )
        ]

    def __str__(self):
        return (
            f"{self.room} - "
            f"Bed {self.bed_number}"
        )


class HostelAllocation(models.Model):

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        CHECKED_OUT = "CHECKED_OUT", "Checked Out"
        CANCELLED = "CANCELLED", "Cancelled"

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="hostel_allocations",
    )

    hostel = models.ForeignKey(
        Hostel,
        on_delete=models.PROTECT,
        related_name="allocations",
    )

    room = models.ForeignKey(
        HostelRoom,
        on_delete=models.PROTECT,
        related_name="allocations",
    )

    bed = models.ForeignKey(
        Bed,
        on_delete=models.PROTECT,
        related_name="allocations",
    )

    academic_session = models.ForeignKey(
        "academics.AcademicSession",
        on_delete=models.PROTECT,
        related_name="hostel_allocations",
    )

    check_in_date = models.DateField()

    check_out_date = models.DateField(
        null=True,
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )

    notes = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-check_in_date"]

    def __str__(self):
        return (
            f"{self.student.full_name} - "
            f"{self.hostel.name} - "
            f"Room {self.room.room_number} - "
            f"Bed {self.bed.bed_number}"
        )