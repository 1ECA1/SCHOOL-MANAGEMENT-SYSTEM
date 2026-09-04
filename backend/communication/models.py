from django.db import models

from academics.models import School


class Announcement(models.Model):

    class Audience(models.TextChoices):
        ALL = "ALL", "Everyone"
        STUDENTS = "STUDENTS", "Students"
        TEACHERS = "TEACHERS", "Teachers"
        PARENTS = "PARENTS", "Parents"
        STAFF = "STAFF", "Staff"

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="announcements",
    )

    title = models.CharField(
        max_length=255,
    )

    content = models.TextField()

    audience = models.CharField(
        max_length=20,
        choices=Audience.choices,
        default=Audience.ALL,
    )

    attachment = models.FileField(
        upload_to="announcements/",
        blank=True,
        null=True,
    )

    is_published = models.BooleanField(
        default=False,
    )

    publish_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    expires_at = models.DateTimeField(
        null=True,
        blank=True,
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


class Message(models.Model):

    class Status(models.TextChoices):
        SENT = "SENT", "Sent"
        READ = "READ", "Read"
        ARCHIVED = "ARCHIVED", "Archived"

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="messages",
    )

    sender = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="sent_messages",
    )

    recipient = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="received_messages",
    )

    subject = models.CharField(
        max_length=255,
        blank=True,
    )

    content = models.TextField()

    attachment = models.FileField(
        upload_to="messages/",
        blank=True,
        null=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SENT,
    )

    read_at = models.DateTimeField(
        null=True,
        blank=True,
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
        return (
            f"{self.sender} → "
            f"{self.recipient}: "
            f"{self.subject or 'Message'}"
        )