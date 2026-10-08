from django.db import models

from accounts.models import User
from academics.models import (
    School,
    AcademicSession,
    Term,
    ClassLevel,
    Department,
)


class AdmissionOfficerProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="admission_officer_profile",
    )

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="admission_officers",
    )

    employee_number = models.CharField(
        max_length=100,
        unique=True,
    )

    employment_date = models.DateField(
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
        ordering = ["employee_number"]

    def __str__(self):
        full_name = self.user.get_full_name().strip()

        if full_name:
            return f"{full_name} ({self.employee_number})"

        return self.employee_number


class Applicant(models.Model):

    class Gender(models.TextChoices):
        MALE = "MALE", "Male"
        FEMALE = "FEMALE", "Female"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        UNDER_REVIEW = "UNDER_REVIEW", "Under Review"
        ACCEPTED = "ACCEPTED", "Accepted"
        REJECTED = "REJECTED", "Rejected"
        WITHDRAWN = "WITHDRAWN", "Withdrawn"

    class ApplicationSource(models.TextChoices):
        ONLINE = "ONLINE", "Online"
        WALK_IN = "WALK_IN", "Walk-in"

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="applicants",
    )

    academic_session = models.ForeignKey(
        AcademicSession,
        on_delete=models.PROTECT,
        related_name="applicants",
    )

    application_number = models.CharField(
        max_length=50,
        unique=True,
    )

    application_source = models.CharField(
        max_length=20,
        choices=ApplicationSource.choices,
        default=ApplicationSource.ONLINE,
    )

    # =====================================================
    # PERSONAL INFORMATION
    # =====================================================

    first_name = models.CharField(
        max_length=150,
    )

    middle_name = models.CharField(
        max_length=150,
        blank=True,
    )

    last_name = models.CharField(
        max_length=150,
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

    # =====================================================
    # CONTACT INFORMATION
    # =====================================================

    email = models.EmailField(
        blank=True,
    )

    phone_number = models.CharField(
        max_length=30,
        blank=True,
    )

    address = models.TextField(
        blank=True,
    )

    previous_school = models.CharField(
        max_length=255,
        blank=True,
    )

    # =====================================================
    # ACADEMIC INFORMATION
    # =====================================================

    class_level = models.ForeignKey(
        ClassLevel,
        on_delete=models.PROTECT,
        related_name="applicants",
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name="applicants",
        null=True,
        blank=True,
    )

    admission_date = models.DateField(
        null=True,
        blank=True,
    )

    term = models.ForeignKey(
    Term,
        on_delete=models.PROTECT,
        related_name="applicants",
        null=True,
        blank=True,
    )

    roll_number = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    # =====================================================
    # STUDENT INFORMATION
    # =====================================================

    blood_group = models.CharField(
        max_length=10,
        blank=True,
    )

    nationality = models.CharField(
        max_length=100,
        blank=True,
    )

    state_of_origin = models.CharField(
        max_length=100,
        blank=True,
    )

    local_government = models.CharField(
        max_length=100,
        blank=True,
    )

    profile_image = models.ImageField(
        upload_to="applicants/profile_images/",
        blank=True,
        null=True,
    )

    # =====================================================
    # GUARDIAN INFORMATION
    # =====================================================

    guardian_name = models.CharField(
        max_length=255,
        blank=True,
    )

    guardian_phone = models.CharField(
        max_length=30,
        blank=True,
    )

    guardian_email = models.EmailField(
        blank=True,
    )

    guardian_address = models.TextField(
        blank=True,
    )

    # =====================================================
    # APPLICATION STATUS
    # =====================================================

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    application_date = models.DateField(
        auto_now_add=True,
    )

    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_applications",
    )

    review_note = models.TextField(
        blank=True,
    )

    # =====================================================
    # ADMITTED STUDENT
    # =====================================================

    admitted_student = models.OneToOneField(
        "students.Student",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="admission_application",
    )

    # =====================================================
    # TIMESTAMPS
    # =====================================================

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = [
            "-created_at",
        ]

    def __str__(self):
        return (
            f"{self.application_number} - "
            f"{self.first_name} {self.last_name}"
        )

    @property
    def full_name(self):
        names = [
            self.first_name,
            self.middle_name,
            self.last_name,
        ]

        return " ".join(
            name.strip()
            for name in names
            if name and name.strip()
        )