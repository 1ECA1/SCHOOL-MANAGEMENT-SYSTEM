from django.db import models


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

    def __str__(self):
        return f"{self.academic_session.name} - {self.get_name_display()}"


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
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="class_levels",
    )

    name = models.CharField(
        max_length=100,
        help_text="Example: JSS 1, JSS 2, SS 1",
    )

    code = models.CharField(max_length=20)

    description = models.TextField(blank=True)

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="class_levels",
    )

    capacity = models.PositiveIntegerField(default=40)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["school", "code"],
                name="unique_school_class_code",
            )
        ]

    def __str__(self):
        return self.name


class Subject(models.Model):
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="subjects",
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="subjects",
    )

    name = models.CharField(max_length=150)
    code = models.CharField(max_length=20)

    description = models.TextField(blank=True)

    credit_units = models.PositiveIntegerField(default=1)

    is_core = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["school", "code"],
                name="unique_school_subject_code",
            )
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




# class ClassSubject(models.Model):
#     class_level = models.ForeignKey(
#         ClassLevel,
#         on_delete=models.CASCADE,
#         related_name="class_subjects",
#     )

#     subject = models.ForeignKey(
#         Subject,
#         on_delete=models.CASCADE,
#         related_name="class_subjects",
#     )

#     track = models.ForeignKey(
#         AcademicTrack,
#         on_delete=models.CASCADE,
#         null=True,
#         blank=True,
#         related_name="class_subjects",
#     )

#     is_core = models.BooleanField(default=False)

#     is_active = models.BooleanField(default=True)

#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)

#     class Meta:
#         ordering = ["subject__name"]
#         constraints = [
#             models.UniqueConstraint(
#                 fields=[
#                     "class_level",
#                     "subject",
#                     "track",
#                 ],
#                 name="unique_class_subject_track",
#             )
#         ]

#     def __str__(self):
#         if self.track:
#             return (
#                 f"{self.class_level.name} - "
#                 f"{self.subject.name} - "
#                 f"{self.track.name}"
#             )

#         return (
#             f"{self.class_level.name} - "
#             f"{self.subject.name}"
#         )

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

    track = models.ForeignKey(
        "students.AcademicTrack",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="class_subjects",
    )

    is_core = models.BooleanField(default=False)

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
                    "track",
                ],
                name="unique_class_subject_track",
            )
        ]

    def __str__(self):
        if self.track:
            return (
                f"{self.class_level.name} - "
                f"{self.subject.name} - "
                f"{self.track.name}"
            )

        return (
            f"{self.class_level.name} - "
            f"{self.subject.name}"
        )