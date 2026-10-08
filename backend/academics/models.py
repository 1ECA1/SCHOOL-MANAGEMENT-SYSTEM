from django.db import models
from django.core.exceptions import ValidationError


class School(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)

    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)

    website = models.URLField(blank=True)
    logo = models.ImageField(
        upload_to="school_logos/",
        blank=True,
        null=True,
    )

    principal_name = models.CharField(
        max_length=150,
        blank=True,
    )

    established_year = models.PositiveIntegerField(
        blank=True,
        null=True,
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class AcademicSession(models.Model):
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="academic_sessions",
    )

    name = models.CharField(
        max_length=50,
        help_text="Example: 2026/2027",
    )

    start_date = models.DateField()
    end_date = models.DateField()

    is_current = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-start_date"]
        constraints = [
            models.UniqueConstraint(
                fields=["school", "name"],
                name="unique_school_academic_session",
            )
        ]

    def save(self, *args, **kwargs):
        if self.is_current:
            AcademicSession.objects.filter(
                school=self.school,
                is_current=True,
            ).exclude(
                pk=self.pk
            ).update(
                is_current=False
            )

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Term(models.Model):

    class TermType(models.TextChoices):
        FIRST = "FIRST", "First Term"
        SECOND = "SECOND", "Second Term"
        THIRD = "THIRD", "Third Term"

    academic_session = models.ForeignKey(
        AcademicSession,
        on_delete=models.CASCADE,
        related_name="terms",
    )

    name = models.CharField(
        max_length=20,
        choices=TermType.choices,
    )

    start_date = models.DateField()
    end_date = models.DateField()

    is_current = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["start_date"]
        constraints = [
            models.UniqueConstraint(
                fields=["academic_session", "name"],
                name="unique_session_term",
            )
        ]

    def save(self, *args, **kwargs):
        if self.is_current:
            Term.objects.filter(
                academic_session__school=self.academic_session.school,
                is_current=True,
            ).exclude(
                pk=self.pk
            ).update(
                is_current=False
            )

        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.academic_session.name} - "
            f"{self.get_name_display()}"
        )

class Department(models.Model):
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="departments",
    )

    name = models.CharField(max_length=150)
    code = models.CharField(max_length=20)

    description = models.TextField(blank=True)

    head_name = models.CharField(
        max_length=150,
        blank=True,
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["school", "code"],
                name="unique_school_department_code",
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.code})"


class ClassLevel(models.Model):

    class EducationLevel(models.TextChoices):
        PRIMARY = "PRIMARY", "Primary"
        JSS = "JSS", "JSS"
        SS = "SS", "Senior Secondary"


    is_graduating_class = models.BooleanField(
        default=False,
        help_text=(
            "Marks this class as a final graduating class. "
            "Graduation can only be processed for students "
            "currently enrolled in a graduating class."
        ),
    )

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="class_levels",
    )

    name = models.CharField(
        max_length=100,
        help_text="Example: Primary 1, JSS 1, SS 1",
    )

    code = models.CharField(
        max_length=20,
    )

    education_level = models.CharField(
        max_length=10,
        choices=EducationLevel.choices,
        default=EducationLevel.PRIMARY,
    )

    description = models.TextField(
        blank=True,
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="class_levels",
    )

    capacity = models.PositiveIntegerField(
        default=40,
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
        ordering = ["name"]

        constraints = [
            # Primary and JSS:
            # The same class code cannot be used twice
            # within the same school.
            models.UniqueConstraint(
                fields=["school", "code"],
                condition=models.Q(
                    education_level__in=["PRIMARY", "JSS"]
                ),
                name="unique_school_non_ss_class_code",
            ),

            # Senior Secondary:
            # The same class code can be used for different
            # departments within the same school.
            models.UniqueConstraint(
                fields=["school", "code", "department"],
                condition=models.Q(
                    education_level="SS"
                ),
                name="unique_school_ss_class_department",
            ),
        ]

    def __str__(self):
        return self.name


class Subject(models.Model):

    class EducationLevel(models.TextChoices):
        PRIMARY = "PRIMARY", "Primary"
        JSS = "JSS", "JSS"
        SS = "SS", "Senior Secondary"

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="subjects",
    )

    name = models.CharField(max_length=150)

    code = models.CharField(max_length=20)

    education_level = models.CharField(
        max_length=10,
        choices=EducationLevel.choices,
        default=EducationLevel.PRIMARY,
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="subjects",
    )

    description = models.TextField(blank=True)

    is_core = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

        constraints = [
            # ---------------------------------------------
            # PRIMARY / JSS
            #
            # Same subject code cannot be duplicated
            # within the same school.
            # ---------------------------------------------
            models.UniqueConstraint(
                fields=["school", "code"],
                condition=models.Q(
                    education_level__in=["PRIMARY", "JSS"]
                ),
                name="unique_school_non_ss_subject_code",
            ),

            # ---------------------------------------------
            # SENIOR SECONDARY
            #
            # Same code can exist in different departments.
            #
            # Example:
            #
            # Mathematics + Science
            # Mathematics + Arts
            # Mathematics + Commercial
            #
            # But the same combination cannot be duplicated.
            # ---------------------------------------------
            models.UniqueConstraint(
                fields=[
                    "school",
                    "code",
                    "department",
                ],
                condition=models.Q(
                    education_level="SS"
                ),
                name="unique_school_ss_subject_department",
            ),
        ]

    def __str__(self):
        return f"{self.name} ({self.code})"


class AcademicSection(models.Model):
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="academic_sections",
    )

    name = models.CharField(max_length=150)
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
                name="unique_school_academic_section_code",
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.code})"


class ClassSubject(models.Model):
    ASSIGNMENT_TYPE_CHOICES = [
        ("GENERAL_COMPULSORY", "General Compulsory"),
        ("DEPARTMENT_COMPULSORY", "Department Compulsory"),
        ("OPTIONAL", "Optional"),
    ]

    class_level = models.ForeignKey(
        ClassLevel,
        on_delete=models.CASCADE,
        related_name="class_subjects",
    )

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name="class_subjects",
    )

    assignment_type = models.CharField(
        max_length=30,
        choices=ASSIGNMENT_TYPE_CHOICES,
        default="GENERAL_COMPULSORY",
    )

    is_core = models.BooleanField(
        default=True,
        help_text="Legacy field. Assignment type now determines whether the subject is compulsory or optional.",
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["subject__name"]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "class_level",
                    "subject",
                    "assignment_type",
                ],
                name="unique_class_subject_assignment",
            ),
        ]

    def __str__(self):
        return f"{self.class_level.name} - {self.subject.name}"

    def clean(self):
        errors = {}

        if self.class_level_id is None:
            errors["class_level"] = "Class level is required."

        if self.subject_id is None:
            errors["subject"] = "Subject is required."

        if errors:
            raise ValidationError(errors)

        class_level = self.class_level
        subject = self.subject
        assignment_type = self.assignment_type or "GENERAL_COMPULSORY"

        if class_level.school_id != subject.school_id:
            errors["subject"] = (
                "The selected subject does not belong "
                "to the same school as the class."
            )

        if class_level.education_level != subject.education_level:
            errors["subject"] = (
                "The subject education level must match "
                "the class education level."
            )

        if errors:
            raise ValidationError(errors)

        # PRIMARY / JSS
        if class_level.education_level in [
            ClassLevel.EducationLevel.PRIMARY,
            ClassLevel.EducationLevel.JSS,
        ]:
            if subject.department_id is not None:
                errors["subject"] = (
                    "Primary and JSS subjects cannot "
                    "belong to a department."
                )

            if assignment_type == "DEPARTMENT_COMPULSORY":
                errors["assignment_type"] = (
                    "Department compulsory subjects "
                    "are only available for SS classes."
                )

        # SENIOR SECONDARY
        elif class_level.education_level == ClassLevel.EducationLevel.SS:

            class_department = class_level.department
            subject_department = subject.department

            if assignment_type == "GENERAL_COMPULSORY":
                if subject_department is not None:
                    errors["subject"] = (
                        "This subject belongs to a department "
                        "and therefore cannot be used as a "
                        "General Compulsory subject."
                    )

            elif assignment_type == "DEPARTMENT_COMPULSORY":
                if class_department is None:
                    errors["class_level"] = (
                        "The selected SS class must have a department."
                    )
                elif subject_department is None:
                    errors["subject"] = (
                        "A Department Compulsory subject "
                        "must belong to a department."
                    )
                elif class_department.pk != subject_department.pk:
                    errors["subject"] = (
                        f"This subject belongs to the "
                        f"{subject_department.name} department, "
                        f"but the selected class belongs to the "
                        f"{class_department.name} department. "
                        f"A Department Compulsory subject must "
                        f"belong to the same department as the class."
                    )

            elif assignment_type == "OPTIONAL":
                pass

            else:
                errors["assignment_type"] = "Invalid subject assignment type."

        if errors:
            raise ValidationError(errors)