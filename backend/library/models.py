from django.db import models

from academics.models import School
from students.models import Student
from teachers.models import Teacher


class Author(models.Model):

    name = models.CharField(
        max_length=200,
    )

    bio = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return self.name


class Category(models.Model):

    name = models.CharField(
        max_length=150,
        unique=True,
    )

    description = models.TextField(
        blank=True,
    )

    def __str__(self):
        return self.name


class Book(models.Model):

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="library_books",
    )

    title = models.CharField(
        max_length=255,
    )

    isbn = models.CharField(
        max_length=20,
        blank=True,
    )

    author = models.ForeignKey(
        Author,
        on_delete=models.PROTECT,
        related_name="books",
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="books",
    )

    publisher = models.CharField(
        max_length=200,
        blank=True,
    )

    publication_year = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    description = models.TextField(
        blank=True,
    )

    cover_image = models.ImageField(
        upload_to="library/book_covers/",
        blank=True,
        null=True,
    )

    total_copies = models.PositiveIntegerField(
        default=1,
    )

    available_copies = models.PositiveIntegerField(
        default=1,
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
        ordering = ["title"]

    def __str__(self):
        return self.title


class BookLoan(models.Model):

    class Status(models.TextChoices):
        BORROWED = "BORROWED", "Borrowed"
        RETURNED = "RETURNED", "Returned"
        OVERDUE = "OVERDUE", "Overdue"
        LOST = "LOST", "Lost"

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="book_loans",
    )

    book = models.ForeignKey(
        Book,
        on_delete=models.PROTECT,
        related_name="loans",
    )

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="book_loans",
        null=True,
        blank=True,
    )

    teacher = models.ForeignKey(
        Teacher,
        on_delete=models.CASCADE,
        related_name="book_loans",
        null=True,
        blank=True,
    )

    issue_date = models.DateField()

    due_date = models.DateField()

    return_date = models.DateField(
        null=True,
        blank=True,
    )

    fine_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.BORROWED,
    )

    notes = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-issue_date"]

    def __str__(self):
        borrower = self.student or self.teacher

        return (
            f"{self.book.title} - "
            f"{borrower}"
        )