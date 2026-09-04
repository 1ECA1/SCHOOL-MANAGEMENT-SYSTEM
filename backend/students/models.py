from django.conf import settings
from django.db import models

from academics.models import School, AcademicSession, Term, ClassLevel, Department


class ParentGuardian(models.Model):
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="parents_guardians",
    )

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="parent_profile",
        null=True,
        blank=True,
    )

    full_name = models.CharField(max_length=200)
    relationship = models.CharField(
        max_length=50,
        help_text="Example: Father, Mother, Guardian",
    )

    phone_number = models.CharField(max_length=20)
    email = models.EmailField(blank=True)

    address = models.TextField(blank=True)

    occupation = models.CharField(
        max_length=150,
        blank=True,
    )

    emergency_contact = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name


class Student(models.Model):

    class Gender(models.TextChoices):
        MALE = "MALE", "Male"
        FEMALE = "FEMALE", "Female"
        OTHER = "OTHER", "Other"

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        GRADUATED = "GRADUATED", "Graduated"
        TRANSFERRED = "TRANSFERRED", "Transferred"
        SUSPENDED = "SUSPENDED", "Suspended"
        WITHDRAWN = "WITHDRAWN", "Withdrawn"

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="students",
    )

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="student_profile",
    )

    admission_number = models.CharField(
        max_length=50,
        unique=True,
    )

    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(
        max_length=100,
        blank=True,
    )
    last_name = models.CharField(max_length=100)

    date_of_birth = models.DateField()

    gender = models.CharField(
        max_length=10,
        choices=Gender.choices,
    )

    email = models.EmailField(blank=True)
    phone_number = models.CharField(
        max_length=20,
        blank=True,
    )

    profile_image = models.ImageField(
        upload_to="students/profile_images/",
        blank=True,
        null=True,
    )

    address = models.TextField(blank=True)

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="students",
    )

    parents = models.ManyToManyField(
        ParentGuardian,
        blank=True,
        related_name="students",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )

    admission_date = models.DateField()

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

    medical_notes = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["last_name", "first_name"]

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
        return f"{self.full_name} ({self.admission_number})"


class StudentEnrollment(models.Model):
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="enrollments",
    )

    academic_session = models.ForeignKey(
        AcademicSession,
        on_delete=models.CASCADE,
        related_name="student_enrollments",
    )

    term = models.ForeignKey(
        Term,
        on_delete=models.CASCADE,
        related_name="student_enrollments",
    )

    class_level = models.ForeignKey(
        ClassLevel,
        on_delete=models.PROTECT,
        related_name="student_enrollments",
    )

    academic_track = models.ForeignKey(
        "AcademicTrack",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="student_enrollments",
    )

    enrollment_date = models.DateField(
        auto_now_add=True,
    )

    is_current = models.BooleanField(
        default=True,
    )

    roll_number = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    remarks = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["class_level", "roll_number"]

    def __str__(self):
        return (
            f"{self.student.full_name} - "
            f"{self.class_level.name} - "
            f"{self.academic_session.name}"
        )


class StudentSubjectEnrollment(models.Model):
    student_enrollment = models.ForeignKey(
        StudentEnrollment,
        on_delete=models.CASCADE,
        related_name="subject_enrollments",
    )

    subject = models.ForeignKey(
        "academics.Subject",
        on_delete=models.PROTECT,
        related_name="student_enrollments",
    )

    academic_session = models.ForeignKey(
        AcademicSession,
        on_delete=models.CASCADE,
        related_name="student_subject_enrollments",
    )

    term = models.ForeignKey(
        Term,
        on_delete=models.CASCADE,
        related_name="student_subject_enrollments",
    )

    is_core = models.BooleanField(default=False)

    enrolled_at = models.DateTimeField(
        auto_now_add=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    class Meta:
        ordering = ["subject__name"]
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "student_enrollment",
                    "subject",
                    "academic_session",
                    "term",
                ],
                name="unique_student_subject_enrollment",
            )
        ]

    def __str__(self):
        return (
            f"{self.student_enrollment.student.full_name} - "
            f"{self.subject.name} - "
            f"{self.term.get_name_display()}"
        )


        
class AcademicTrack(models.Model):
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="academic_tracks",
    )

    name = models.CharField(max_length=100)

    code = models.CharField(max_length=20)

    description = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["school", "code"],
                name="unique_school_academic_track_code",
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.code})"

