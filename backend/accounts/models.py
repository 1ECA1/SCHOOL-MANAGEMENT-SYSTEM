from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    class Role(models.TextChoices):
        SUPER_ADMIN = "SUPER_ADMIN", "Super Admin"
        SCHOOL_ADMIN = "SCHOOL_ADMIN", "School Admin"
        PRINCIPAL = "PRINCIPAL", "Principal"
        TEACHER = "TEACHER", "Teacher"
        STUDENT = "STUDENT", "Student"
        PARENT = "PARENT", "Parent / Guardian"
        ACCOUNTANT = "ACCOUNTANT", "Accountant"
        LIBRARIAN = "LIBRARIAN", "Librarian"
        HOSTEL_MANAGER = "HOSTEL_MANAGER", "Hostel Manager"
        TRANSPORT_MANAGER = "TRANSPORT_MANAGER", "Transport Manager"
        STAFF = "STAFF", "Staff"

    email = models.EmailField(
        unique=True,
        blank=False,
    )

    role = models.CharField(
        max_length=30,
        choices=Role.choices,
        default=Role.STUDENT,
    )

    phone_number = models.CharField(
        max_length=20,
        blank=True,
    )

    profile_image = models.ImageField(
        upload_to="profile_images/",
        blank=True,
        null=True,
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"