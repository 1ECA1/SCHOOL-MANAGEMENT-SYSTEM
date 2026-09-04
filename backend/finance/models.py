from decimal import Decimal
from django.db import models, transaction
from django.db import models
from django.utils import timezone

from academics.models import School, AcademicSession, Term, ClassLevel
from students.models import Student


class FeeCategory(models.Model):
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="fee_categories",
    )

    name = models.CharField(max_length=100)

    description = models.TextField(blank=True)

    is_mandatory = models.BooleanField(default=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["school", "name"],
                name="unique_school_fee_category",
            )
        ]

    def __str__(self):
        return self.name


class FeeStructure(models.Model):
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="fee_structures",
    )

    academic_session = models.ForeignKey(
        AcademicSession,
        on_delete=models.CASCADE,
        related_name="fee_structures",
    )

    term = models.ForeignKey(
        Term,
        on_delete=models.CASCADE,
        related_name="fee_structures",
    )

    class_level = models.ForeignKey(
        ClassLevel,
        on_delete=models.CASCADE,
        related_name="fee_structures",
    )

    fee_category = models.ForeignKey(
        FeeCategory,
        on_delete=models.CASCADE,
        related_name="fee_structures",
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    due_date = models.DateField(
        null=True,
        blank=True,
    )

    description = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["class_level", "fee_category"]
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "academic_session",
                    "term",
                    "class_level",
                    "fee_category",
                ],
                name="unique_class_term_fee_structure",
            )
        ]

    def __str__(self):
        return (
            f"{self.class_level.name} - "
            f"{self.fee_category.name} - "
            f"{self.amount}"
        )


class StudentInvoice(models.Model):

    class Status(models.TextChoices):
        UNPAID = "UNPAID", "Unpaid"
        PARTIAL = "PARTIAL", "Partially Paid"
        PAID = "PAID", "Paid"
        OVERDUE = "OVERDUE", "Overdue"
        CANCELLED = "CANCELLED", "Cancelled"

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="invoices",
    )

    academic_session = models.ForeignKey(
        AcademicSession,
        on_delete=models.CASCADE,
        related_name="student_invoices",
    )

    term = models.ForeignKey(
        Term,
        on_delete=models.CASCADE,
        related_name="student_invoices",
    )

    fee_category = models.ForeignKey(
        FeeCategory,
        on_delete=models.PROTECT,
        related_name="student_invoices",
    )

    invoice_number = models.CharField(
        max_length=50,
        unique=True,
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    discount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    amount_paid = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    due_date = models.DateField(
        null=True,
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.UNPAID,
    )

    description = models.TextField(blank=True)

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def save(self, *args, **kwargs):
        self.balance = (
            self.amount
            - self.discount
            - self.amount_paid
        )

        if self.balance <= 0:
            self.balance = Decimal("0.00")
            self.status = self.Status.PAID
        elif self.amount_paid > 0:
            self.status = self.Status.PARTIAL
        elif self.due_date and self.due_date < timezone.now().date():
            self.status = self.Status.OVERDUE
        else:
            self.status = self.Status.UNPAID

        super().save(*args, **kwargs)

    def __str__(self):
        return self.invoice_number


class Payment(models.Model):

    class PaymentMethod(models.TextChoices):
        CASH = "CASH", "Cash"
        BANK_TRANSFER = "BANK_TRANSFER", "Bank Transfer"
        CARD = "CARD", "Card"
        ONLINE = "ONLINE", "Online Payment"
        POS = "POS", "POS"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        SUCCESSFUL = "SUCCESSFUL", "Successful"
        FAILED = "FAILED", "Failed"
        REFUNDED = "REFUNDED", "Refunded"

    invoice = models.ForeignKey(
        StudentInvoice,
        on_delete=models.PROTECT,
        related_name="payments",
    )

    reference = models.CharField(
        max_length=100,
        unique=True,
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    payment_date = models.DateTimeField(
        auto_now_add=True,
    )

    transaction_id = models.CharField(
        max_length=150,
        blank=True,
    )

    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.reference} - {self.amount}"


class Scholarship(models.Model):
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="scholarships",
    )

    name = models.CharField(max_length=200)

    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
    )

    fixed_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )

    reason = models.TextField(blank=True)

    start_date = models.DateField()

    end_date = models.DateField(
        null=True,
        blank=True,
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return f"{self.student.full_name} - {self.name}"


class ExpenseCategory(models.Model):
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="expense_categories",
    )

    name = models.CharField(max_length=100)

    description = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["school", "name"],
                name="unique_school_expense_category",
            )
        ]

    def __str__(self):
        return self.name


class Expense(models.Model):

    class PaymentMethod(models.TextChoices):
        CASH = "CASH", "Cash"
        BANK_TRANSFER = "BANK_TRANSFER", "Bank Transfer"
        CARD = "CARD", "Card"
        POS = "POS", "POS"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PAID = "PAID", "Paid"
        CANCELLED = "CANCELLED", "Cancelled"

    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name="expenses",
    )

    expense_category = models.ForeignKey(
        ExpenseCategory,
        on_delete=models.PROTECT,
        related_name="expenses",
    )

    academic_session = models.ForeignKey(
        AcademicSession,
        on_delete=models.CASCADE,
        related_name="expenses",
    )

    term = models.ForeignKey(
        Term,
        on_delete=models.CASCADE,
        related_name="expenses",
    )

    title = models.CharField(max_length=200)

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    expense_date = models.DateField()

    paid_to = models.CharField(
        max_length=200,
        blank=True,
    )

    reference = models.CharField(
        max_length=100,
        blank=True,
    )

    description = models.TextField(blank=True)

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f"{self.title} - {self.amount}"