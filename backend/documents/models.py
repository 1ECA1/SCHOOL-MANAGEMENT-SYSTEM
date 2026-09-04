from django.db import models

from academics.models import School


class Document(models.Model):

    class DocumentType(models.TextChoices):
        GENERAL = "GENERAL", "General"
        STUDENT = "STUDENT", "Student"
        STAFF = "STAFF", "Staff"
        ACADEMIC = "ACADEMIC", "Academic"
        FINANCE = "FINANCE", "Finance"
        ADMINISTRATIVE = "ADMINISTRATIVE", "Administrative"

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="documents",
    )

    uploaded_by = models.ForeignKey(
        "accounts.User",
        on_delete=models.PROTECT,
        related_name="uploaded_documents",
    )

    title = models.CharField(
        max_length=255,
    )

    document_type = models.CharField(
        max_length=20,
        choices=DocumentType.choices,
        default=DocumentType.GENERAL,
    )

    description = models.TextField(
        blank=True,
    )

    file = models.FileField(
        upload_to="documents/",
    )

    student = models.ForeignKey(
        "students.Student",
        on_delete=models.CASCADE,
        related_name="documents",
        null=True,
        blank=True,
    )

    staff = models.ForeignKey(
        "teachers.Teacher",
        on_delete=models.CASCADE,
        related_name="documents",
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

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title