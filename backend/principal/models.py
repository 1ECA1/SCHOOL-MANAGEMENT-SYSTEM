from django.conf import settings
from django.db import models

from academics.models import School


class Principal(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="principal_profile",
    )

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="principals",
    )

    employee_id = models.CharField(
        max_length=50,
        unique=True,
    )

    appointment_date = models.DateField(
        null=True,
        blank=True,
    )

    qualification = models.CharField(
        max_length=200,
        blank=True,
    )

    bio = models.TextField(
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
        return f"{self.user.get_full_name()} - {self.school.name}"