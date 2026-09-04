from rest_framework import generics, status

from django.db.models import Sum
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from decimal import Decimal
from students.models import Student

from django.db import models, transaction
from .models import (
    FeeCategory,
    FeeStructure,
    StudentInvoice,
    Payment,
    Scholarship,
    ExpenseCategory,
    Expense,
)

from .serializers import (
    FeeCategorySerializer,
    FeeStructureSerializer,
    StudentInvoiceSerializer,
    PaymentSerializer,
    ScholarshipSerializer,
    ExpenseCategorySerializer,
    ExpenseSerializer,
)


# =========================
# Fee Categories
# =========================

class FeeCategoryListCreateView(
    generics.ListCreateAPIView
):
    queryset = FeeCategory.objects.select_related(
        "school",
    )
    serializer_class = FeeCategorySerializer
    permission_classes = [IsAuthenticated]


class FeeCategoryDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = FeeCategory.objects.select_related(
        "school",
    )
    serializer_class = FeeCategorySerializer
    permission_classes = [IsAuthenticated]


# =========================
# Fee Structures
# =========================

class FeeStructureListCreateView(
    generics.ListCreateAPIView
):
    queryset = FeeStructure.objects.select_related(
        "school",
        "academic_session",
        "term",
        "class_level",
        "fee_category",
    )
    serializer_class = FeeStructureSerializer
    permission_classes = [IsAuthenticated]


class FeeStructureDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = FeeStructure.objects.select_related(
        "school",
        "academic_session",
        "term",
        "class_level",
        "fee_category",
    )
    serializer_class = FeeStructureSerializer
    permission_classes = [IsAuthenticated]


# =========================
# Student Invoices
# =========================

class StudentInvoiceListCreateView(
    generics.ListCreateAPIView
):
    queryset = StudentInvoice.objects.select_related(
        "student",
        "academic_session",
        "term",
        "fee_category",
    )
    serializer_class = StudentInvoiceSerializer
    permission_classes = [IsAuthenticated]


class StudentInvoiceDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = StudentInvoice.objects.select_related(
        "student",
        "academic_session",
        "term",
        "fee_category",
    )
    serializer_class = StudentInvoiceSerializer
    permission_classes = [IsAuthenticated]


# =========================
# Payments
# =========================
# =========================
# Payments
# =========================

class PaymentListCreateView(
    generics.ListCreateAPIView
):
    queryset = Payment.objects.select_related(
        "invoice",
        "invoice__student",
    ).order_by("-payment_date")

    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by student
        student_id = self.request.query_params.get("student")

        if student_id:
            queryset = queryset.filter(
                invoice__student_id=student_id
            )

        # Filter by invoice
        invoice_id = self.request.query_params.get("invoice")

        if invoice_id:
            queryset = queryset.filter(
                invoice_id=invoice_id
            )

        # Filter by payment status
        status = self.request.query_params.get("status")

        if status:
            queryset = queryset.filter(
                status=status
            )

        # Filter by payment method
        payment_method = self.request.query_params.get(
            "payment_method"
        )

        if payment_method:
            queryset = queryset.filter(
                payment_method=payment_method
            )

        # Search by payment reference
        reference = self.request.query_params.get("reference")

        if reference:
            queryset = queryset.filter(
                reference__icontains=reference
            )

        return queryset

    @transaction.atomic
    def perform_create(self, serializer):
        payment = serializer.save()

        if payment.status == Payment.Status.SUCCESSFUL:
            invoice = payment.invoice

            successful_payments = Payment.objects.filter(
                invoice=invoice,
                status=Payment.Status.SUCCESSFUL,
            ).aggregate(
                total=models.Sum("amount")
            )["total"] or Decimal("0.00")

            invoice.amount_paid = successful_payments
            invoice.save()


            
# =========================
# Payment Detail
# =========================

class PaymentDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = Payment.objects.select_related(
        "invoice",
        "invoice__student",
    )

    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def perform_update(self, serializer):
        payment = serializer.save()

        invoice = payment.invoice

        successful_payments = Payment.objects.filter(
            invoice=invoice,
            status=Payment.Status.SUCCESSFUL,
        ).aggregate(
            total=models.Sum("amount")
        )["total"] or Decimal("0.00")

        invoice.amount_paid = successful_payments
        invoice.save()

    @transaction.atomic
    def perform_destroy(self, instance):
        invoice = instance.invoice

        instance.delete()

        successful_payments = Payment.objects.filter(
            invoice=invoice,
            status=Payment.Status.SUCCESSFUL,
        ).aggregate(
            total=models.Sum("amount")
        )["total"] or Decimal("0.00")

        invoice.amount_paid = successful_payments
        invoice.save()


# =========================
# Scholarships
# =========================

class ScholarshipListCreateView(
    generics.ListCreateAPIView
):
    queryset = Scholarship.objects.select_related(
        "student",
    )
    serializer_class = ScholarshipSerializer
    permission_classes = [IsAuthenticated]


class ScholarshipDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = Scholarship.objects.select_related(
        "student",
    )
    serializer_class = ScholarshipSerializer
    permission_classes = [IsAuthenticated]


# =========================
# Finance Summary
# =========================
from django.db.models import Sum, Count

class FinanceSummaryView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        invoices = StudentInvoice.objects.all()

        total_invoiced = (
            invoices.aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        total_collected = (
            invoices.aggregate(
                total=Sum("amount_paid")
            )["total"]
            or Decimal("0.00")
        )

        total_outstanding = (
            invoices.aggregate(
                total=Sum("balance")
            )["total"]
            or Decimal("0.00")
        )

        total_discounts = (
            invoices.aggregate(
                total=Sum("discount")
            )["total"]
            or Decimal("0.00")
        )

        return Response({
            "total_invoiced": total_invoiced,
            "total_collected": total_collected,
            "total_outstanding": total_outstanding,
            "total_discounts": total_discounts,

            "paid_invoices": invoices.filter(
                status=StudentInvoice.Status.PAID
            ).count(),

            "partial_invoices": invoices.filter(
                status=StudentInvoice.Status.PARTIAL
            ).count(),

            "unpaid_invoices": invoices.filter(
                status=StudentInvoice.Status.UNPAID
            ).count(),

            "overdue_invoices": invoices.filter(
                status=StudentInvoice.Status.OVERDUE
            ).count(),
        })


# =========================
# Student Financial Statement
# =========================

class StudentFinancialStatementView(
    generics.GenericAPIView
):
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):

        student = Student.objects.get(
            id=student_id
        )

        invoices = StudentInvoice.objects.filter(
            student=student
        ).select_related(
            "academic_session",
            "term",
            "fee_category",
        )

        payments = Payment.objects.filter(
            invoice__student=student
        ).select_related(
            "invoice",
        )

        total_invoiced = (
            invoices.aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        total_discounts = (
            invoices.aggregate(
                total=Sum("discount")
            )["total"]
            or Decimal("0.00")
        )

        total_paid = (
            invoices.aggregate(
                total=Sum("amount_paid")
            )["total"]
            or Decimal("0.00")
        )

        total_outstanding = (
            invoices.aggregate(
                total=Sum("balance")
            )["total"]
            or Decimal("0.00")
        )

        invoice_data = []

        for invoice in invoices:
            invoice_data.append({
                "id": invoice.id,
                "invoice_number": invoice.invoice_number,
                "academic_session": (
                    invoice.academic_session.name
                ),
                "term": (
                    invoice.term.get_name_display()
                ),
                "fee_category": (
                    invoice.fee_category.name
                ),
                "amount": invoice.amount,
                "discount": invoice.discount,
                "amount_paid": invoice.amount_paid,
                "balance": invoice.balance,
                "due_date": invoice.due_date,
                "status": invoice.status,
                "description": invoice.description,
            })

        payment_data = []

        for payment in payments:
            payment_data.append({
                "id": payment.id,
                "invoice": (
                    payment.invoice.invoice_number
                ),
                "reference": payment.reference,
                "amount": payment.amount,
                "payment_method": (
                    payment.payment_method
                ),
                "status": payment.status,
                "payment_date": payment.payment_date,
                "transaction_id": (
                    payment.transaction_id
                ),
                "notes": payment.notes,
            })

        return Response({
            "student_id": student.id,
            "student_name": student.full_name,

            "total_invoiced": total_invoiced,
            "total_discounts": total_discounts,
            "total_paid": total_paid,
            "total_outstanding": total_outstanding,

            "invoices": invoice_data,
            "payments": payment_data,
        })


# =========================
# Fee Structure
# =========================

class FeeStructureListCreateView(generics.ListCreateAPIView):
    queryset = FeeStructure.objects.select_related(
        "school",
        "academic_session",
        "term",
        "class_level",
        "fee_category",
    )

    serializer_class = FeeStructureSerializer
    permission_classes = [IsAuthenticated]


class FeeStructureDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FeeStructure.objects.select_related(
        "school",
        "academic_session",
        "term",
        "class_level",
        "fee_category",
    )

    serializer_class = FeeStructureSerializer
    permission_classes = [IsAuthenticated]


# =========================
# Generate Student Invoices
# =========================

class GenerateInvoicesView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):

        academic_session_id = request.data.get("academic_session")
        term_id = request.data.get("term")
        class_level_id = request.data.get("class_level")

        if not academic_session_id:
            return Response(
                {"error": "academic_session is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not term_id:
            return Response(
                {"error": "term is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not class_level_id:
            return Response(
                {"error": "class_level is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get fee structures
        fee_structures = FeeStructure.objects.filter(
            academic_session_id=academic_session_id,
            term_id=term_id,
            class_level_id=class_level_id,
            is_active=True,
        ).select_related(
            "fee_category",
        )

        if not fee_structures.exists():
            return Response(
                {
                    "error": (
                        "No active fee structures found "
                        "for this class, session and term."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Get students enrolled in this class/session/term
        from students.models import StudentEnrollment

        enrollments = StudentEnrollment.objects.filter(
            academic_session_id=academic_session_id,
            term_id=term_id,
            class_level_id=class_level_id,
        ).select_related(
            "student",
        )

        if not enrollments.exists():
            return Response(
                {
                    "error": (
                        "No students are enrolled in "
                        "this class for the selected session and term."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        created_invoices = []
        skipped_invoices = []

        for enrollment in enrollments:

            student = enrollment.student

            for fee_structure in fee_structures:

                # Check if invoice already exists
                existing_invoice = StudentInvoice.objects.filter(
                    student=student,
                    academic_session_id=academic_session_id,
                    term_id=term_id,
                    fee_category=fee_structure.fee_category,
                ).first()

                if existing_invoice:
                    skipped_invoices.append({
                        "student": student.full_name,
                        "invoice_number": existing_invoice.invoice_number,
                        "reason": "Invoice already exists.",
                    })
                    continue

                # Generate invoice number
                last_invoice = (
                    StudentInvoice.objects
                    .order_by("-id")
                    .first()
                )

                next_number = (
                    last_invoice.id + 1
                    if last_invoice
                    else 1
                )

                invoice_number = (
                    f"INV-{academic_session_id}-"
                    f"{next_number:04d}"
                )

                invoice = StudentInvoice.objects.create(
                    student=student,
                    academic_session_id=academic_session_id,
                    term_id=term_id,
                    fee_category=fee_structure.fee_category,
                    invoice_number=invoice_number,
                    amount=fee_structure.amount,
                    due_date=fee_structure.due_date,
                    description=fee_structure.description,
                )

                created_invoices.append({
                    "id": invoice.id,
                    "student": student.full_name,
                    "invoice_number": invoice.invoice_number,
                    "fee_category": fee_structure.fee_category.name,
                    "amount": invoice.amount,
                    "balance": invoice.balance,
                    "status": invoice.status,
                })

        return Response(
            {
                "message": "Invoice generation completed.",
                "created_count": len(created_invoices),
                "skipped_count": len(skipped_invoices),
                "created_invoices": created_invoices,
                "skipped_invoices": skipped_invoices,
            },
            status=status.HTTP_201_CREATED,
        )


# =========================
# Expense Category Views
# =========================

class ExpenseCategoryListCreateView(generics.ListCreateAPIView):
    queryset = ExpenseCategory.objects.select_related("school")
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAuthenticated]


class ExpenseCategoryDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = ExpenseCategory.objects.select_related("school")
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAuthenticated]


# =========================
# Expense Views
# =========================

class ExpenseListCreateView(generics.ListCreateAPIView):
    queryset = Expense.objects.select_related(
        "school",
        "expense_category",
        "academic_session",
        "term",
    )

    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]


class ExpenseDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = Expense.objects.select_related(
        "school",
        "expense_category",
        "academic_session",
        "term",
    )

    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]


# =========================
# Expense Summary
# =========================

class ExpenseSummaryView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        expenses = Expense.objects.all()

        total_expenses = (
            expenses.filter(
                status=Expense.Status.PAID
            ).aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        pending_expenses = (
            expenses.filter(
                status=Expense.Status.PENDING
            ).aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        cancelled_expenses = (
            expenses.filter(
                status=Expense.Status.CANCELLED
            ).aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        return Response({
            "total_expenses": total_expenses,
            "pending_expenses": pending_expenses,
            "cancelled_expenses": cancelled_expenses,

            "paid_count": expenses.filter(
                status=Expense.Status.PAID
            ).count(),

            "pending_count": expenses.filter(
                status=Expense.Status.PENDING
            ).count(),

            "cancelled_count": expenses.filter(
                status=Expense.Status.CANCELLED
            ).count(),

            "total_expense_records": expenses.count(),
        })


# =========================
# Finance Dashboard
# =========================

class FinanceDashboardView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        invoices = StudentInvoice.objects.all()
        expenses = Expense.objects.all()

        # -------------------------
        # Income
        # -------------------------

        total_invoiced = (
            invoices.aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        total_collected = (
            invoices.aggregate(
                total=Sum("amount_paid")
            )["total"]
            or Decimal("0.00")
        )

        total_outstanding = (
            invoices.aggregate(
                total=Sum("balance")
            )["total"]
            or Decimal("0.00")
        )

        total_discounts = (
            invoices.aggregate(
                total=Sum("discount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------
        # Expenses
        # -------------------------

        total_expenses = (
            expenses.filter(
                status=Expense.Status.PAID
            ).aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        pending_expenses = (
            expenses.filter(
                status=Expense.Status.PENDING
            ).aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------
        # Net Balance
        # -------------------------

        net_balance = total_collected - total_expenses

        # -------------------------
        # Invoice Counts
        # -------------------------

        paid_invoices = invoices.filter(
            status=StudentInvoice.Status.PAID
        ).count()

        partial_invoices = invoices.filter(
            status=StudentInvoice.Status.PARTIAL
        ).count()

        unpaid_invoices = invoices.filter(
            status=StudentInvoice.Status.UNPAID
        ).count()

        overdue_invoices = invoices.filter(
            status=StudentInvoice.Status.OVERDUE
        ).count()

        return Response({
            "income": {
                "total_invoiced": total_invoiced,
                "total_collected": total_collected,
                "total_outstanding": total_outstanding,
                "total_discounts": total_discounts,
            },

            "expenses": {
                "total_expenses": total_expenses,
                "pending_expenses": pending_expenses,
            },

            "net_balance": net_balance,

            "invoices": {
                "paid": paid_invoices,
                "partial": partial_invoices,
                "unpaid": unpaid_invoices,
                "overdue": overdue_invoices,
                "total": invoices.count(),
            },

            "expense_records": expenses.count(),
        })