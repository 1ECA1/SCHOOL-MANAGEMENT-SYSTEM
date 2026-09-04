from django.conf import settings
from django.db import models

from academics.models import School, Department, Subject, ClassLevel


class Teacher(models.Model):

    class Gender(models.TextChoices):
        MALE = "MALE", "Male"
        FEMALE = "FEMALE", "Female"
        OTHER = "OTHER", "Other"

    class EmploymentStatus(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        ON_LEAVE = "ON_LEAVE", "On Leave"
        SUSPENDED = "SUSPENDED", "Suspended"
        RESIGNED = "RESIGNED", "Resigned"
        RETIRED = "RETIRED", "Retired"

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="teachers",
    )

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="teacher_profile",
    )

    employee_id = models.CharField(
        max_length=50,
        unique=True,
    )

    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(
        max_length=100,
        blank=True,
    )
    last_name = models.CharField(max_length=100)

    email = models.EmailField(blank=True)
    phone_number = models.CharField(
        max_length=20,
        blank=True,
    )

    date_of_birth = models.DateField(
        null=True,
        blank=True,
    )

    gender = models.CharField(
        max_length=10,
        choices=Gender.choices,
        blank=True,
    )

    profile_image = models.ImageField(
        upload_to="teachers/profile_images/",
        blank=True,
        null=True,
    )

    address = models.TextField(blank=True)

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="teachers",
    )

    specialization = models.CharField(
        max_length=200,
        blank=True,
    )

    qualification = models.CharField(
        max_length=200,
        blank=True,
    )

    employment_date = models.DateField(
        null=True,
        blank=True,
    )

    employment_status = models.CharField(
        max_length=20,
        choices=EmploymentStatus.choices,
        default=EmploymentStatus.ACTIVE,
    )

    is_class_teacher = models.BooleanField(
        default=False,
    )

    bio = models.TextField(blank=True)

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    @property
    def full_name(self):
        names = [
            self.first_name,
            self.middle_name,
            self.last_name,
        ]

        return " ".join(
            name for name in names if name
        )

    def __str__(self):
        return f"{self.full_name} ({self.employee_id})"


class TeacherSubject(models.Model):
    teacher = models.ForeignKey(
        Teacher,
        on_delete=models.CASCADE,
        related_name="subject_assignments",
    )

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name="teacher_assignments",
    )

    class_level = models.ForeignKey(
        ClassLevel,
        on_delete=models.CASCADE,
        related_name="teacher_subject_assignments",
    )

    is_primary = models.BooleanField(
        default=False,
    )

    assigned_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "teacher",
                    "subject",
                    "class_level",
                ],
                name="unique_teacher_subject_class",
            )
        ]

    def __str__(self):
        return (
            f"{self.teacher.full_name} - "
            f"{self.subject.name} - "
            f"{self.class_level.name}"
        )


class ClassTeacher(models.Model):
    teacher = models.ForeignKey(
        Teacher,
        on_delete=models.CASCADE,
        related_name="class_teacher_assignments",
    )

    class_level = models.ForeignKey(
        ClassLevel,
        on_delete=models.CASCADE,
        related_name="class_teacher_assignments",
    )

    academic_session = models.ForeignKey(
        "academics.AcademicSession",
        on_delete=models.CASCADE,
        related_name="class_teacher_assignments",
    )

    assigned_at = models.DateTimeField(
        auto_now_add=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "class_level",
                    "academic_session",
                ],
                name="unique_class_teacher_per_session",
            )
        ]

    def __str__(self):
        return (
            f"{self.teacher.full_name} - "
            f"{self.class_level.name} - "
            f"{self.academic_session.name}"
        )