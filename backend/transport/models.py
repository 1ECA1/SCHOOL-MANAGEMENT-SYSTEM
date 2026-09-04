from django.db import models

from academics.models import School
from students.models import Student


class Driver(models.Model):

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="drivers",
    )

    full_name = models.CharField(
        max_length=200,
    )

    phone = models.CharField(
        max_length=20,
    )

    license_number = models.CharField(
        max_length=100,
        unique=True,
    )

    license_expiry_date = models.DateField(
        null=True,
        blank=True,
    )

    address = models.TextField(
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
        return self.full_name


class Vehicle(models.Model):

    class VehicleType(models.TextChoices):
        BUS = "BUS", "Bus"
        VAN = "VAN", "Van"
        CAR = "CAR", "Car"

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="vehicles",
    )

    registration_number = models.CharField(
        max_length=50,
        unique=True,
    )

    vehicle_type = models.CharField(
        max_length=10,
        choices=VehicleType.choices,
        default=VehicleType.BUS,
    )

    model = models.CharField(
        max_length=100,
        blank=True,
    )

    manufacturer = models.CharField(
        max_length=100,
        blank=True,
    )

    capacity = models.PositiveIntegerField(
        default=20,
    )

    driver = models.ForeignKey(
        Driver,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="vehicles",
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
        return self.registration_number


class TransportRoute(models.Model):

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="transport_routes",
    )

    name = models.CharField(
        max_length=200,
    )

    code = models.CharField(
        max_length=50,
    )

    description = models.TextField(
        blank=True,
    )

    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="routes",
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
                name="unique_transport_route_per_school",
            )
        ]

    def __str__(self):
        return self.name


class BusStop(models.Model):

    route = models.ForeignKey(
        TransportRoute,
        on_delete=models.CASCADE,
        related_name="stops",
    )

    name = models.CharField(
        max_length=200,
    )

    address = models.TextField(
        blank=True,
    )

    stop_order = models.PositiveIntegerField(
        default=1,
    )

    pickup_time = models.TimeField(
        null=True,
        blank=True,
    )

    dropoff_time = models.TimeField(
        null=True,
        blank=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    class Meta:
        ordering = ["stop_order"]

        constraints = [
            models.UniqueConstraint(
                fields=["route", "stop_order"],
                name="unique_stop_order_per_route",
            )
        ]

    def __str__(self):
        return f"{self.route.name} - {self.name}"


class StudentTransportAssignment(models.Model):

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        INACTIVE = "INACTIVE", "Inactive"

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="transport_assignments",
    )

    route = models.ForeignKey(
        TransportRoute,
        on_delete=models.PROTECT,
        related_name="student_assignments",
    )

    pickup_stop = models.ForeignKey(
        BusStop,
        on_delete=models.PROTECT,
        related_name="pickup_assignments",
    )

    dropoff_stop = models.ForeignKey(
        BusStop,
        on_delete=models.PROTECT,
        related_name="dropoff_assignments",
    )

    academic_session = models.ForeignKey(
        "academics.AcademicSession",
        on_delete=models.PROTECT,
        related_name="transport_assignments",
    )

    start_date = models.DateField()

    end_date = models.DateField(
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

    def __str__(self):
        return (
            f"{self.student.full_name} - "
            f"{self.route.name}"
        )