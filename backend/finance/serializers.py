
from django.utils import timezone

from .services import calculate_scholarship_discount

from decimal import Decimal

from django.db import models
from rest_framework import serializers

from accounts.models import User
from academics.models import School

from .models import (
    FeeCategory,
    FeeStructure,
    StudentInvoice,
    Payment,
    Scholarship,
    ExpenseCategory,
    Expense,
    AccountantProfile,
    
)


ADMIN_ROLES = (
    User.Role.SUPER_ADMIN,
    User.Role.SCHOOL_ADMIN,
)


# =========================================================
# HELPERS
# =========================================================

def _ensure_same_school(school, **related_objects):
    """
    Make sure every related object that has a school belongs to the
    same school as the record being saved. Objects without a
    `school` attribute (e.g. a global term) are skipped.
    """
    if school is None:
        return

    errors = {}

    for field_name, obj in related_objects.items():

        if obj is None:
            continue

        obj_school_id = getattr(obj, "school_id", None)

        if obj_school_id is not None and obj_school_id != school.id:
            errors[field_name] = (
                "This selection belongs to a different school."
            )

    if errors:
        raise serializers.ValidationError(errors)


def _resolve_school(serializer, attrs):
    """
    Work out which school a fee category / fee structure belongs to.

    ACCOUNTANT              always the school on their profile
                            (never chosen by the client).
    SUPER ADMIN / SCHOOL ADMIN
                            the school sent in the request; when
                            updating without a school, the existing
                            school is kept. Creating without one is
                            an error.
    """
    request = serializer.context.get("request")
    user = getattr(request, "user", None)

    school = attrs.get("school")

    if user and user.is_authenticated:

        # -------------------------------------------------
        # ACCOUNTANT
        # -------------------------------------------------
        if user.role == User.Role.ACCOUNTANT:

            accountant_profile = getattr(
                user,
                "accountant_profile",
                None,
            )

            if not accountant_profile:
                raise serializers.ValidationError({
                    "detail": (
                        "You do not have an Accountant profile."
                    )
                })

            if not accountant_profile.is_active:
                raise serializers.ValidationError({
                    "detail": (
                        "Your Accountant profile is inactive."
                    )
                })

            school = accountant_profile.school
            attrs["school"] = school

        # -------------------------------------------------
        # SUPER ADMIN / SCHOOL ADMIN
        # -------------------------------------------------
        elif user.role in ADMIN_ROLES and school is None:

            if serializer.instance is not None:
                # Editing without changing the school.
                school = serializer.instance.school
                attrs["school"] = school

    if school is None:
        raise serializers.ValidationError({
            "school": "School is required."
        })

    return school


# =========================================================
# ACCOUNTANT
# =========================================================

class AccountantCreateSerializer(serializers.Serializer):
    school = serializers.IntegerField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone_number = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True,
    )
    employee_number = serializers.CharField(
        max_length=100,
    )
    employment_date = serializers.DateField(
        required=False,
        allow_null=True,
    )

    def validate_email(self, value):

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )

        return value

    def validate_employee_number(self, value):

        if AccountantProfile.objects.filter(
            employee_number=value
        ).exists():
            raise serializers.ValidationError(
                "An Accountant with this employee number "
                "already exists."
            )

        return value


class AccountantProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(
        source="user.id",
        read_only=True,
    )

    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    first_name = serializers.CharField(
        source="user.first_name",
        read_only=True,
    )

    last_name = serializers.CharField(
        source="user.last_name",
        read_only=True,
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    phone_number = serializers.CharField(
        source="user.phone_number",
        read_only=True,
    )

    school_name = serializers.CharField(
        source="school.name",
        read_only=True,
    )

    class Meta:
        model = AccountantProfile

        fields = [
            "id",
            "user_id",
            "username",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "school",
            "school_name",
            "employee_number",
            "employment_date",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "user_id",
            "username",
            "first_name",
            "last_name",
            "email",
            "phone_number",
            "school_name",
            "created_at",
            "updated_at",
        ]


# =========================================================
# FEE CATEGORIES
# =========================================================

class FeeCategorySerializer(serializers.ModelSerializer):
    school = serializers.PrimaryKeyRelatedField(
        queryset=School.objects.all(),
        required=False,
        allow_null=True,
    )

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
            "school_name",
            "created_at",
        ]

        # Disable DRF's automatic UniqueTogetherValidator (it would
        # demand `school`). Uniqueness is checked manually below.
        validators = []

    def validate(self, attrs):

        school = _resolve_school(self, attrs)

        # -----------------------------------------
        # UNIQUE CATEGORY NAME PER SCHOOL
        # -----------------------------------------
        name = attrs.get("name")

        if name is not None:

            name = name.strip()
            attrs["name"] = name

            queryset = FeeCategory.objects.filter(
                school=school,
                name__iexact=name,
            )

            if self.instance is not None:
                queryset = queryset.exclude(
                    pk=self.instance.pk
                )

            if queryset.exists():
                raise serializers.ValidationError({
                    "name": (
                        "A fee category with this name "
                        "already exists for this school."
                    )
                })

        return attrs


# =========================================================
# FEE STRUCTURES
# =========================================================

class FeeStructureSerializer(serializers.ModelSerializer):
    school = serializers.PrimaryKeyRelatedField(
        queryset=School.objects.all(),
        required=False,
        allow_null=True,
    )

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
            "school_name",
            "academic_session_name",
            "term_name",
            "class_level_name",
            "fee_category_name",
            "created_at",
        ]

        # The model's unique constraint would make DRF require
        # `school`. Uniqueness is handled manually below.
        validators = []

    def validate(self, attrs):

        school = _resolve_school(self, attrs)

        # =========================================================
        # FEE CATEGORY MUST BELONG TO THE SAME SCHOOL
        # =========================================================
        fee_category = attrs.get(
            "fee_category",
            getattr(self.instance, "fee_category", None),
        )

        if fee_category is None:
            raise serializers.ValidationError({
                "fee_category": "Fee category is required."
            })

        if fee_category.school_id != school.id:
            raise serializers.ValidationError({
                "fee_category": (
                    "The selected fee category does not "
                    "belong to the selected school."
                )
            })

        academic_session = attrs.get(
            "academic_session",
            getattr(self.instance, "academic_session", None),
        )

        term = attrs.get(
            "term",
            getattr(self.instance, "term", None),
        )

        class_level = attrs.get(
            "class_level",
            getattr(self.instance, "class_level", None),
        )

        # Any of these that carry a school must match too.
        _ensure_same_school(
            school,
            academic_session=academic_session,
            term=term,
            class_level=class_level,
        )

        # =========================================================
        # AMOUNT VALIDATION
        # =========================================================
        amount = attrs.get(
            "amount",
            getattr(self.instance, "amount", None),
        )

        if amount is not None and amount <= 0:
            raise serializers.ValidationError({
                "amount": "Fee amount must be greater than zero."
            })

        # =========================================================
        # MANUAL UNIQUENESS CHECK
        # =========================================================
        if (
            academic_session
            and term
            and class_level
            and fee_category
        ):
            queryset = FeeStructure.objects.filter(
                academic_session=academic_session,
                term=term,
                class_level=class_level,
                fee_category=fee_category,
            )

            if self.instance is not None:
                queryset = queryset.exclude(
                    pk=self.instance.pk
                )

            if queryset.exists():
                raise serializers.ValidationError({
                    "fee_category": (
                        "A fee structure already exists for "
                        "this academic session, term, class "
                        "level, and fee category."
                    )
                })

        return attrs


# =========================================================
# STUDENT INVOICES
# =========================================================

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
            "student_name",
            "session_name",
            "term_name",
            "fee_category_name",
            "amount_paid",
            "discount",
            "balance",
            "status",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        # Existing values are needed when performing PATCH/PUT
        student = attrs.get(
            "student",
            getattr(self.instance, "student", None),
        )

        fee_category = attrs.get(
            "fee_category",
            getattr(self.instance, "fee_category", None),
        )

        amount = attrs.get(
            "amount",
            getattr(self.instance, "amount", None),
        )

        discount = attrs.get(
            "discount",
            getattr(self.instance, "discount", None),
        )

        # ---------------------------------------------------------
        # BASIC VALIDATION
        # ---------------------------------------------------------

        if student is None:
            raise serializers.ValidationError({
                "student": "Student is required."
            })

        if fee_category is None:
            raise serializers.ValidationError({
                "fee_category": "Fee category is required."
            })

        if amount is None or amount <= 0:
            raise serializers.ValidationError({
                "amount": "Invoice amount must be greater than zero."
            })

        if discount is None:
            discount = 0

        if discount < 0:
            raise serializers.ValidationError({
                "discount": "Discount cannot be negative."
            })

        if discount > amount:
            raise serializers.ValidationError({
                "discount": (
                    "Discount cannot be greater than "
                    "the invoice amount."
                )
            })

        # ---------------------------------------------------------
        # ACCOUNTANT SCHOOL SECURITY
        # ---------------------------------------------------------

        if (
            user
            and user.is_authenticated
            and user.role == User.Role.ACCOUNTANT
        ):
            accountant_profile = getattr(
                user,
                "accountant_profile",
                None,
            )

            if not accountant_profile:
                raise serializers.ValidationError({
                    "detail": (
                        "You do not have an Accountant profile."
                    )
                })

            if not accountant_profile.is_active:
                raise serializers.ValidationError({
                    "detail": (
                        "Your Accountant profile is inactive."
                    )
                })

            accountant_school_id = (
                accountant_profile.school_id
            )

            # Student must belong to Accountant's school.
            if student.school_id != accountant_school_id:
                raise serializers.ValidationError({
                    "student": (
                        "You cannot create or modify an "
                        "invoice for a student belonging "
                        "to another school."
                    )
                })

            # Fee category must belong to Accountant's school.
            if fee_category.school_id != accountant_school_id:
                raise serializers.ValidationError({
                    "fee_category": (
                        "The selected fee category does not "
                        "belong to your school."
                    )
                })

        # ---------------------------------------------------------
        # FEE CATEGORY / STUDENT SCHOOL CONSISTENCY
        # ---------------------------------------------------------

        if student.school_id != fee_category.school_id:
            raise serializers.ValidationError({
                "fee_category": (
                    "The fee category must belong to the "
                    "same school as the student."
                )
            })

        # ---------------------------------------------------------
        # EXISTING PAYMENTS
        #
        # Prevent lowering an invoice below what was already paid.
        # ---------------------------------------------------------

        if self.instance is not None:

            successful_payments = Payment.objects.filter(
                invoice=self.instance,
                status=Payment.Status.SUCCESSFUL,
            )

            paid_amount = (
                successful_payments.aggregate(
                    total=models.Sum("amount")
                )["total"]
                or Decimal("0.00")
            )

            new_total = (
                Decimal(str(amount))
                - Decimal(str(discount))
            )

            if new_total < paid_amount:
                raise serializers.ValidationError({
                    "amount": (
                        "The invoice total cannot be less "
                        "than the amount already paid."
                    )
                })

        # ---------------------------------------------------------
        # INVOICE NUMBER UNIQUENESS
        # ---------------------------------------------------------

        invoice_number = attrs.get(
            "invoice_number",
            getattr(
                self.instance,
                "invoice_number",
                None,
            ),
        )

        if invoice_number:

            invoice_number = invoice_number.strip()

            queryset = StudentInvoice.objects.filter(
                invoice_number=invoice_number
            )

            if self.instance is not None:
                queryset = queryset.exclude(
                    pk=self.instance.pk
                )

            if queryset.exists():
                raise serializers.ValidationError({
                    "invoice_number": (
                        "An invoice with this invoice "
                        "number already exists."
                    )
                })

            attrs["invoice_number"] = invoice_number

        return attrs
    
    def create(self, validated_data):
        student = validated_data["student"]

        # Always start with no discount.
        # The scholarship service will determine the correct discount
        # after the invoice exists.
        validated_data["discount"] = Decimal("0.00")

        invoice = StudentInvoice.objects.create(**validated_data)

        scholarship_result = calculate_scholarship_discount(
            student=student,
            amount=invoice.amount,
            invoice=invoice,
            date=timezone.now().date(),
        )

        scholarship = scholarship_result["scholarship"]
        discount = scholarship_result["discount"]

        if discount > 0:
            invoice.discount = discount
            invoice.save()

            if scholarship is not None:
                scholarship.invoices.add(invoice)

        return invoice


# =========================================================
# PAYMENTS
# =========================================================

class PaymentSerializer(serializers.ModelSerializer):
    invoice_number = serializers.CharField(
        source="invoice.invoice_number",
        read_only=True,
    )

    student_name = serializers.CharField(
        source="invoice.student.full_name",
        read_only=True,
    )

    payer_name = serializers.SerializerMethodField()

    payer_type_display = serializers.CharField(
        source="get_payer_type_display",
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

    gateway_display = serializers.CharField(
        source="get_gateway_display",
        read_only=True,
    )

    class Meta:
        model = Payment

        fields = [
            "id",
            "invoice",
            "invoice_number",
            "student_name",
            "payer_user",
            "payer_name",
            "payer_type",
            "payer_type_display",
            "reference",
            "amount",
            "payment_method",
            "payment_method_display",
            "status",
            "status_display",
            "gateway",
            "gateway_display",
            "gateway_reference",
            "transaction_id",
            "payment_date",
            "notes",
            "metadata",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "invoice_number",
            "student_name",
            "payer_user",
            "payer_name",
            "payer_type",
            "payer_type_display",
            "payment_method_display",
            "status",
            "status_display",
            "gateway_display",
            "gateway_reference",
            "payment_date",
            "metadata",
            "created_at",
            "updated_at",
        ]

    def get_payer_name(self, obj):

        if not obj.payer_user:
            return None

        full_name = (
            f"{obj.payer_user.first_name} "
            f"{obj.payer_user.last_name}"
        ).strip()

        return full_name or obj.payer_user.username

    def validate_amount(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "Payment amount must be greater than zero."
            )

        invoice_id = self.initial_data.get("invoice")

        if not invoice_id:
            return value

        try:
            invoice = StudentInvoice.objects.get(
                pk=invoice_id
            )
        except (StudentInvoice.DoesNotExist, ValueError, TypeError):
            raise serializers.ValidationError(
                "The selected invoice does not exist."
            )

        existing_payment = self.instance

        successful_payments = Payment.objects.filter(
            invoice=invoice,
            status=Payment.Status.SUCCESSFUL,
        )

        if existing_payment:
            successful_payments = successful_payments.exclude(
                pk=existing_payment.pk
            )

        total_paid = (
            successful_payments.aggregate(
                total=models.Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        remaining_balance = (
            invoice.amount
            - invoice.discount
            - total_paid
        )

        if value > remaining_balance:
            raise serializers.ValidationError(
                f"Payment exceeds the remaining invoice "
                f"balance of {remaining_balance:.2f}."
            )

        return value


# =========================================================
# SCHOLARSHIPS
# =========================================================

class ScholarshipSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(
        source="student.full_name",
        read_only=True,
    )

    fee_category_names = serializers.SerializerMethodField(
        read_only=True
    )

    invoice_numbers = serializers.SerializerMethodField(
        read_only=True
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
            "scope",
            "fee_categories",
            "fee_category_names",
            "invoices",
            "invoice_numbers",
            "reason",
            "start_date",
            "end_date",
            "is_active",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "student_name",
            "fee_category_names",
            "invoice_numbers",
            "created_at",
        ]

    def get_fee_category_names(self, obj):
        return list(
            obj.fee_categories.values_list(
                "name",
                flat=True,
            )
        )

    def get_invoice_numbers(self, obj):
        return list(
            obj.invoices.values_list(
                "invoice_number",
                flat=True,
            )
        )

    def validate(self, attrs):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        student = attrs.get(
            "student",
            getattr(self.instance, "student", None),
        )

        percentage = attrs.get(
            "percentage",
            getattr(self.instance, "percentage", None),
        )

        fixed_amount = attrs.get(
            "fixed_amount",
            getattr(self.instance, "fixed_amount", None),
        )

        scope = attrs.get(
            "scope",
            getattr(
                self.instance,
                "scope",
                Scholarship.Scope.ALL,
            ),
        )

        fee_categories = attrs.get(
            "fee_categories",
            None,
        )

        invoices = attrs.get(
            "invoices",
            None,
        )

        if student is None:
            raise serializers.ValidationError({
                "student": "Student is required."
            })

        if percentage is None and fixed_amount is None:
            raise serializers.ValidationError({
                "detail": (
                    "Provide either a percentage or "
                    "a fixed amount."
                )
            })

        if percentage is not None and percentage < 0:
            raise serializers.ValidationError({
                "percentage": (
                    "Percentage cannot be negative."
                )
            })

        if percentage is not None and percentage > 100:
            raise serializers.ValidationError({
                "percentage": (
                    "Percentage cannot be greater than 100."
                )
            })

        if fixed_amount is not None and fixed_amount < 0:
            raise serializers.ValidationError({
                "fixed_amount": (
                    "Fixed amount cannot be negative."
                )
            })

        if percentage is not None and fixed_amount is not None:
            raise serializers.ValidationError({
                "detail": (
                    "Use either percentage or fixed amount, "
                    "not both."
                )
            })

        if scope not in dict(Scholarship.Scope.choices):
            raise serializers.ValidationError({
                "scope": "Invalid scholarship scope."
            })

        if scope == Scholarship.Scope.FEE_CATEGORIES:
            if fee_categories is not None and not fee_categories:
                raise serializers.ValidationError({
                    "fee_categories": (
                        "Select at least one fee category "
                        "for this scholarship scope."
                    )
                })

        if scope == Scholarship.Scope.INVOICES:
            if invoices is not None and not invoices:
                raise serializers.ValidationError({
                    "invoices": (
                        "Select at least one invoice "
                        "for this scholarship scope."
                    )
                })

        if scope == Scholarship.Scope.ALL:
            if fee_categories:
                raise serializers.ValidationError({
                    "fee_categories": (
                        "Fee categories cannot be selected "
                        "when scope is ALL."
                    )
                })

            if invoices:
                raise serializers.ValidationError({
                    "invoices": (
                        "Invoices cannot be selected "
                        "when scope is ALL."
                    )
                })

        if scope == Scholarship.Scope.FEE_CATEGORIES:
            if invoices:
                raise serializers.ValidationError({
                    "invoices": (
                        "Invoices cannot be selected when "
                        "scope is FEE_CATEGORIES."
                    )
                })

            if fee_categories:
                for fee_category in fee_categories:
                    if fee_category.school_id != student.school_id:
                        raise serializers.ValidationError({
                            "fee_categories": (
                                "All selected fee categories "
                                "must belong to the student's "
                                "school."
                            )
                        })

        if scope == Scholarship.Scope.INVOICES:
            if fee_categories:
                raise serializers.ValidationError({
                    "fee_categories": (
                        "Fee categories cannot be selected "
                        "when scope is INVOICES."
                    )
                })

            if invoices:
                for invoice in invoices:
                    if invoice.student_id != student.id:
                        raise serializers.ValidationError({
                            "invoices": (
                                "All selected invoices must "
                                "belong to the selected student."
                            )
                        })

        if user and user.is_authenticated:
            if user.role == User.Role.ACCOUNTANT:
                accountant_profile = getattr(
                    user,
                    "accountant_profile",
                    None,
                )

                if not accountant_profile:
                    raise serializers.ValidationError({
                        "detail": (
                            "You do not have an Accountant "
                            "profile."
                        )
                    })

                if not accountant_profile.is_active:
                    raise serializers.ValidationError({
                        "detail": (
                            "Your Accountant profile is inactive."
                        )
                    })

                if student.school_id != accountant_profile.school_id:
                    raise serializers.ValidationError({
                        "student": (
                            "You cannot manage a scholarship "
                            "for a student belonging to another "
                            "school."
                        )
                    })

                if fee_categories:
                    for fee_category in fee_categories:
                        if (
                            fee_category.school_id
                            != accountant_profile.school_id
                        ):
                            raise serializers.ValidationError({
                                "fee_categories": (
                                    "A selected fee category "
                                    "does not belong to your school."
                                )
                            })

                if invoices:
                    for invoice in invoices:
                        if (
                            invoice.student.school_id
                            != accountant_profile.school_id
                        ):
                            raise serializers.ValidationError({
                                "invoices": (
                                    "A selected invoice does not "
                                    "belong to your school."
                                )
                            })

        return attrs


# =========================================================
# STUDENT FINANCIAL STATEMENT
# =========================================================

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


# =========================================================
# EXPENSE CATEGORIES
# =========================================================

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
            "school_name",
            "created_at",
        ]


# =========================================================
# EXPENSES
# =========================================================
# =========================================================
# EXPENSES
# =========================================================

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
            "school_name",
            "expense_category_name",
            "session_name",
            "term_name",
            "payment_method_display",
            "status_display",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        # ---------------------------------------------------------
        # DETERMINE SCHOOL
        # ---------------------------------------------------------

        school = attrs.get(
            "school",
            getattr(self.instance, "school", None),
        )

        # ---------------------------------------------------------
        # ACCOUNTANT SCHOOL SECURITY
        # ---------------------------------------------------------

        if (
            user
            and user.is_authenticated
            and user.role == User.Role.ACCOUNTANT
        ):
            accountant_profile = getattr(
                user,
                "accountant_profile",
                None,
            )

            if not accountant_profile:
                raise serializers.ValidationError({
                    "detail": (
                        "You do not have an Accountant profile."
                    )
                })

            if not accountant_profile.is_active:
                raise serializers.ValidationError({
                    "detail": (
                        "Your Accountant profile is inactive."
                    )
                })

            # Accountant can ONLY create/manage expenses
            # belonging to their own school.
            school = accountant_profile.school
            attrs["school"] = school

        # ---------------------------------------------------------
        # SCHOOL ADMIN SCHOOL SECURITY
        # ---------------------------------------------------------

        elif (
            user
            and user.is_authenticated
            and user.role == User.Role.SCHOOL_ADMIN
        ):
            admin_school_id = getattr(
                user,
                "school_id",
                None,
            )

            if admin_school_id:
                try:
                    school = School.objects.get(
                        pk=admin_school_id
                    )
                except School.DoesNotExist:
                    raise serializers.ValidationError({
                        "school": (
                            "Your School Admin account is not "
                            "linked to a valid school."
                        )
                    })

                attrs["school"] = school

        # ---------------------------------------------------------
        # SCHOOL IS REQUIRED
        # ---------------------------------------------------------

        if school is None:
            raise serializers.ValidationError({
                "school": "School is required."
            })

        # ---------------------------------------------------------
        # RELATED OBJECTS
        # ---------------------------------------------------------

        expense_category = attrs.get(
            "expense_category",
            getattr(
                self.instance,
                "expense_category",
                None,
            ),
        )

        academic_session = attrs.get(
            "academic_session",
            getattr(
                self.instance,
                "academic_session",
                None,
            ),
        )

        term = attrs.get(
            "term",
            getattr(
                self.instance,
                "term",
                None,
            ),
        )

        # ---------------------------------------------------------
        # SAME-SCHOOL VALIDATION
        # ---------------------------------------------------------

        _ensure_same_school(
            school,
            expense_category=expense_category,
            academic_session=academic_session,
            term=term,
        )

        # ---------------------------------------------------------
        # EXPENSE CATEGORY REQUIRED
        # ---------------------------------------------------------

        if expense_category is None:
            raise serializers.ValidationError({
                "expense_category": (
                    "Expense category is required."
                )
            })

        # ---------------------------------------------------------
        # AMOUNT VALIDATION
        # ---------------------------------------------------------

        amount = attrs.get(
            "amount",
            getattr(
                self.instance,
                "amount",
                None,
            ),
        )

        if amount is None:
            raise serializers.ValidationError({
                "amount": "Expense amount is required."
            })

        if amount <= 0:
            raise serializers.ValidationError({
                "amount": (
                    "Expense amount must be greater than zero."
                )
            })

        # ---------------------------------------------------------
        # TITLE VALIDATION
        # ---------------------------------------------------------

        title = attrs.get(
            "title",
            getattr(
                self.instance,
                "title",
                None,
            ),
        )

        if title is None:
            raise serializers.ValidationError({
                "title": "Expense title is required."
            })

        title = title.strip()

        if not title:
            raise serializers.ValidationError({
                "title": "Expense title cannot be empty."
            })

        attrs["title"] = title

        return attrs


# =========================================================
# PAYSTACK / PAYMENT INITIATION
# =========================================================

class PaymentInitiateSerializer(serializers.Serializer):
    invoice = serializers.IntegerField()

    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    gateway = serializers.ChoiceField(
        choices=Payment.Gateway.choices,
    )

    def validate_amount(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "Payment amount must be greater than zero."
            )

        return value