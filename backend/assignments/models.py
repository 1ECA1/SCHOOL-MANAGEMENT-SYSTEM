from django.db import models


class Assignment(models.Model):

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        PUBLISHED = "PUBLISHED", "Published"
        CLOSED = "CLOSED", "Closed"

    school = models.ForeignKey(
        "academics.School",
        on_delete=models.CASCADE,
        related_name="assignments",
    )

    academic_session = models.ForeignKey(
        "academics.AcademicSession",
        on_delete=models.CASCADE,
        related_name="assignments",
    )

    term = models.ForeignKey(
        "academics.Term",
        on_delete=models.CASCADE,
        related_name="assignments",
    )

    class_level = models.ForeignKey(
        "academics.ClassLevel",
        on_delete=models.CASCADE,
        related_name="assignments",
    )

    subject = models.ForeignKey(
        "academics.Subject",
        on_delete=models.PROTECT,
        related_name="assignments",
    )

    teacher = models.ForeignKey(
        "teachers.Teacher",
        on_delete=models.PROTECT,
        related_name="assignments",
    )

    title = models.CharField(max_length=255)

    instructions = models.TextField()

    attachment = models.FileField(
        upload_to="assignment_attachments/",
        blank=True,
        null=True,
    )

    assigned_date = models.DateField()

    due_date = models.DateTimeField()

    maximum_score = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=100,
    )

    allow_late_submission = models.BooleanField(default=False)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-assigned_date", "-created_at"]

    def __str__(self):
        return f"{self.title} - {self.subject.name}"


class AssignmentSubmission(models.Model):

    class Status(models.TextChoices):
        SUBMITTED = "SUBMITTED", "Submitted"
        LATE = "LATE", "Late"
        GRADED = "GRADED", "Graded"
        RETURNED = "RETURNED", "Returned"

    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.CASCADE,
        related_name="submissions",
    )

    student = models.ForeignKey(
        "students.Student",
        on_delete=models.CASCADE,
        related_name="assignment_submissions",
    )

    submission_file = models.FileField(
        upload_to="assignment_submissions/",
        blank=True,
        null=True,
    )

    answer_text = models.TextField(blank=True)

    submitted_at = models.DateTimeField(auto_now_add=True)

    score = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        null=True,
        blank=True,
    )

    teacher_feedback = models.TextField(blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SUBMITTED,
    )

    graded_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["-submitted_at"]

        constraints = [
            models.UniqueConstraint(
                fields=["assignment", "student"],
                name="unique_assignment_student_submission",
            )
        ]

    def __str__(self):
        return (
            f"{self.assignment.title} - "
            f"{self.student.full_name}"
        )