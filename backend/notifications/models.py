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

    recipient = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    notification_type = models.CharField(
        max_length=20,
        choices=NotificationType.choices,
        default=NotificationType.GENERAL,
    )

    title = models.CharField(
        max_length=255,
    )

    message = models.TextField()

    link = models.CharField(
        max_length=500,
        blank=True,
    )

    is_read = models.BooleanField(
        default=False,
    )

    read_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"{self.recipient} - "
            f"{self.title}"
        )