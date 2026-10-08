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

        ACCOUNTANT = "ACCOUNTANT", "Finance Officer / Bursar"
        ADMISSION_OFFICER = "ADMISSION_OFFICER", "Admission Officer"
        LIBRARIAN = "LIBRARIAN", "Librarian"
        EXAM_OFFICER = "EXAM_OFFICER", "Exam / Assessment Officer"
        COUNSELOR = "COUNSELOR", "Guidance Counselor"

        HOSTEL_MANAGER = "HOSTEL_MANAGER", "Hostel Manager"
        TRANSPORT_MANAGER = "TRANSPORT_MANAGER", "Transport Manager"

    email = models.EmailField(
        unique=True,
        blank=False,
    )

    role = models.CharField(
        max_length=30,
        choices=Role.choices,
        default=Role.STUDENT,
    )

    school = models.ForeignKey(
        "academics.School",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
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