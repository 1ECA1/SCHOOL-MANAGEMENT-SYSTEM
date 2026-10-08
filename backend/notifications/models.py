import uuid

from django.conf import settings
from django.db import models


class Notification(models.Model):

    class NotificationType(models.TextChoices):
        GENERAL = "GENERAL", "General"
        ASSIGNMENT = "ASSIGNMENT", "Assignment"
        RESULT = "RESULT", "Result"
        FINANCE = "FINANCE", "Finance"
        EXAMINATION = "EXAMINATION", "Examination"
        ANNOUNCEMENT = "ANNOUNCEMENT", "Announcement"
        HOSTEL = "HOSTEL", "Hostel"
        TRANSPORT = "TRANSPORT", "Transport"
        MESSAGE = "MESSAGE", "Message"

    # ============================================================
    # SEND BATCH
    # ============================================================

    batch_id = models.UUIDField(
        default=uuid.uuid4,
        null=True,
        blank=True,
        db_index=True,
    )

    recipient_type = models.CharField(
        max_length=30,
        blank=True,
        null=True,
    )

    # ============================================================
    # SENDER
    # ============================================================

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sent_notifications",
    )

    # ============================================================
    # RECIPIENT
    # ============================================================

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    # ============================================================
    # NOTIFICATION
    # ============================================================

    notification_type = models.CharField(
        max_length=20,
        choices=NotificationType.choices,
        default=NotificationType.GENERAL,
    )

    title = models.CharField(
        max_length=255
    )

    message = models.TextField()

    link = models.CharField(
        max_length=500,
        blank=True,
    )

    # ============================================================
    # READ STATUS
    # ============================================================

    is_read = models.BooleanField(
        default=False
    )

    read_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    # ============================================================
    # DATE
    # ============================================================

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.recipient} - {self.title}"