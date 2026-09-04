from rest_framework import serializers

from .models import (
    FeeCategory,
    FeeStructure,
    StudentInvoice,
    Payment,
    Scholarship,
    ExpenseCategory,
    Expense,
)


class FeeCategorySerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(
        source="school.name",
        read_only=True,
    )

    class Meta:
        model = FeeCategory
        fields = [
            "id",
            "school",
            "school_name",
            "name",
            "description",
            "is_mandatory",
            "is_active",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
        ]


class FeeStructureSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(
        source="school.name",
        read_only=True,
    )
    academic_session_name = serializers.CharField(
        source="academic_session.name",
        read_only=True,
    )
    term_name = serializers.CharField(
        source="term.name",
        read_only=True,
    )
    class_level_name = serializers.CharField(
        source="class_level.name",
        read_only=True,
    )
    fee_category_name = serializers.CharField(
        source="fee_category.name",
        read_only=True,
    )

    class Meta:
        model = FeeStructure
        fields = [
            "id",
            "school",
            "school_name",
            "academic_session",
            "academic_session_name",
            "term",
            "term_name",
            "class_level",
            "class_level_name",
            "fee_category",
            "fee_category_name",
            "amount",
            "due_date",
            "description",
            "is_active",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
        ]


class StudentInvoiceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source="student.full_name",
        read_only=True,
    )
    session_name = serializers.CharField(
        source="academic_session.name",
        read_only=True,
    )
    term_name = serializers.CharField(
        source="term.name",
        read_only=True,
    )
    fee_category_name = serializers.CharField(
        source="fee_category.name",
        read_only=True,
    )

    class Meta:
        model = StudentInvoice
        fields = [
            "id",
            "student",
            "student_name",
            "academic_session",
            "session_name",
            "term",
            "term_name",
            "fee_category",
            "fee_category_name",
            "invoice_number",
            "amount",
            "discount",
            "amount_paid",
            "balance",
            "due_date",
            "status",
            "description",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "balance",
            "status",
            "created_at",
            "updated_at",
        ]


class PaymentSerializer(serializers.ModelSerializer):
    invoice_number = serializers.CharField(
        source="invoice.invoice_number",
        read_only=True,
    )

    student_name = serializers.CharField(
        source="invoice.student.full_name",
        read_only=True,
    )

    class Meta:
        model = Payment
        fields = [
            "id",
            "invoice",
            "invoice_number",
            "student_name",
            "reference",
            "amount",
            "payment_method",
            "status",
            "payment_date",
            "transaction_id",
            "notes",
        ]
        read_only_fields = [
            "id",
            "payment_date",
        ]

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Payment amount must be greater than zero."
            )

        invoice = self.initial_data.get("invoice")

        if not invoice:
            return value

        try:
            invoice = StudentInvoice.objects.get(
                pk=invoice
            )
        except StudentInvoice.DoesNotExist:
            return value

        # Existing payment being edited
        existing_payment = self.instance

        existing_amount = Decimal("0.00")

        if existing_payment:
            existing_amount = existing_payment.amount or Decimal(
                "0.00"
            )

        # Calculate successful payments excluding
        # the payment currently being edited
        successful_payments = Payment.objects.filter(
            invoice=invoice,
            status=Payment.Status.SUCCESSFUL,
        )

        if existing_payment:
            successful_payments = successful_payments.exclude(
                pk=existing_payment.pk
            )

        total_paid = successful_payments.aggregate(
            total=models.Sum("amount")
        )["total"] or Decimal("0.00")

        # Remaining balance
        remaining_balance = (
            invoice.amount
            - invoice.discount
            - total_paid
        )

        if value > remaining_balance:
            raise serializers.ValidationError(
                f"Payment exceeds the remaining invoice balance "
                f"of {remaining_balance:.2f}."
            )

        return value


class ScholarshipSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source="student.full_name",
        read_only=True,
    )

    class Meta:
        model = Scholarship
        fields = [
            "id",
            "student",
            "student_name",
            "name",
            "percentage",
            "fixed_amount",
            "reason",
            "start_date",
            "end_date",
            "is_active",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
        ]

    def validate(self, attrs):
        percentage = attrs.get("percentage")
        fixed_amount = attrs.get("fixed_amount")

        if percentage is not None and fixed_amount is not None:
            raise serializers.ValidationError(
                "Scholarship cannot have both percentage and fixed amount."
            )

        if percentage is not None:
            if percentage <= 0 or percentage > 100:
                raise serializers.ValidationError(
                    "Percentage must be greater than 0 and not more than 100."
                )

        if fixed_amount is not None:
            if fixed_amount <= 0:
                raise serializers.ValidationError(
                    "Fixed amount must be greater than 0."
                )

        return attrs


        # =========================
# Student Financial Statement
# =========================

class StudentFinancialStatementSerializer(
    serializers.Serializer
):
    student_id = serializers.IntegerField()
    student_name = serializers.CharField()

    total_invoiced = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    total_discounts = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    total_paid = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    total_outstanding = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    invoices = serializers.ListField()
    payments = serializers.ListField()


class FeeStructureSerializer(serializers.ModelSerializer):
    class_level_name = serializers.CharField(
        source="class_level.name",
        read_only=True,
    )

    academic_session_name = serializers.CharField(
        source="academic_session.name",
        read_only=True,
    )

    term_name = serializers.CharField(
        source="term.name",
        read_only=True,
    )

    fee_category_name = serializers.CharField(
        source="fee_category.name",
        read_only=True,
    )

    class Meta:
        model = FeeStructure
        fields = [
            "id",
            "school",
            "academic_session",
            "academic_session_name",
            "term",
            "term_name",
            "class_level",
            "class_level_name",
            "fee_category",
            "fee_category_name",
            "amount",
            "due_date",
            "description",
            "is_active",
            "created_at",
        ]

        read_only_fields = [
            "created_at",
        ]


# =========================
# Expense Serializers
# =========================

class ExpenseCategorySerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(
        source="school.name",
        read_only=True,
    )

    class Meta:
        model = ExpenseCategory
        fields = [
            "id",
            "school",
            "school_name",
            "name",
            "description",
            "is_active",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
        ]


class ExpenseSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(
        source="school.name",
        read_only=True,
    )

    expense_category_name = serializers.CharField(
        source="expense_category.name",
        read_only=True,
    )

    session_name = serializers.CharField(
        source="academic_session.name",
        read_only=True,
    )

    term_name = serializers.CharField(
        source="term.name",
        read_only=True,
    )

    payment_method_display = serializers.CharField(
        source="get_payment_method_display",
        read_only=True,
    )

    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )

    class Meta:
        model = Expense
        fields = [
            "id",
            "school",
            "school_name",
            "expense_category",
            "expense_category_name",
            "academic_session",
            "session_name",
            "term",
            "term_name",
            "title",
            "amount",
            "payment_method",
            "payment_method_display",
            "status",
            "status_display",
            "expense_date",
            "paid_to",
            "reference",
            "description",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]