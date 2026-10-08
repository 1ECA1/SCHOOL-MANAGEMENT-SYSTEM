# from decimal import Decimal, ROUND_HALF_UP

# from django.db import models
# from django.utils import timezone

# from .models import Scholarship


# def get_active_student_scholarships(student, date=None):
#     """
#     Return all active scholarships for a student.

#     A scholarship is active when:
#     - is_active=True
#     - start_date <= date
#     - end_date is empty OR end_date >= date
#     """

#     if date is None:
#         date = timezone.now().date()

#     return (
#         Scholarship.objects
#         .filter(
#             student=student,
#             is_active=True,
#             start_date__lte=date,
#         )
#         .filter(
#             models.Q(end_date__isnull=True)
#             | models.Q(end_date__gte=date)
#         )
#         .prefetch_related(
#             "fee_categories",
#             "invoices",
#         )
#         .order_by("-created_at")
#     )


# def scholarship_applies_to_invoice(
#     scholarship,
#     invoice,
# ):
#     """
#     Determine whether a scholarship applies to
#     a particular invoice.
#     """

#     # Scholarship must belong to the same student.
#     if scholarship.student_id != invoice.student_id:
#         return False

#     # --------------------------------------------------
#     # ALL
#     # --------------------------------------------------

#     if scholarship.scope == Scholarship.Scope.ALL:
#         return True

#     # --------------------------------------------------
#     # SELECTED FEE CATEGORIES
#     # --------------------------------------------------

#     if scholarship.scope == Scholarship.Scope.FEE_CATEGORIES:
#         return scholarship.fee_categories.filter(
#             pk=invoice.fee_category_id
#         ).exists()

#     # --------------------------------------------------
#     # SPECIFIC INVOICES
#     # --------------------------------------------------

#     if scholarship.scope == Scholarship.Scope.INVOICES:
#         return scholarship.invoices.filter(
#             pk=invoice.pk
#         ).exists()

#     return False


# def calculate_scholarship_discount(
#     student,
#     amount,
#     invoice=None,
#     date=None,
# ):
#     """
#     Calculate the scholarship discount for an invoice.

#     Supports:

#     1. ALL
#        Applies to every invoice for the student.

#     2. FEE_CATEGORIES
#        Applies only to selected fee categories.

#     3. INVOICES
#        Applies only to selected invoices.

#     If invoice is not supplied, only ALL scholarships
#     can be evaluated.
#     """

#     amount = Decimal(str(amount))

#     if amount <= 0:
#         return {
#             "scholarship": None,
#             "discount": Decimal("0.00"),
#         }

#     if date is None:
#         date = timezone.now().date()

#     scholarships = get_active_student_scholarships(
#         student=student,
#         date=date,
#     )

#     for scholarship in scholarships:

#         # A specific invoice is required for
#         # category-specific or invoice-specific
#         # scholarships.
#         if (
#             scholarship.scope
#             != Scholarship.Scope.ALL
#             and invoice is None
#         ):
#             continue

#         if invoice is not None:
#             if not scholarship_applies_to_invoice(
#                 scholarship=scholarship,
#                 invoice=invoice,
#             ):
#                 continue

#         # ----------------------------------------------
#         # Percentage scholarship
#         # ----------------------------------------------

#         if scholarship.percentage is not None:
#             discount = (
#                 amount
#                 * scholarship.percentage
#                 / Decimal("100")
#             )

#         # ----------------------------------------------
#         # Fixed amount scholarship
#         # ----------------------------------------------

#         elif scholarship.fixed_amount is not None:
#             discount = scholarship.fixed_amount

#         else:
#             discount = Decimal("0.00")

#         discount = discount.quantize(
#             Decimal("0.01"),
#             rounding=ROUND_HALF_UP,
#         )

#         # Never allow discount to exceed invoice amount.
#         if discount > amount:
#             discount = amount

#         if discount < 0:
#             discount = Decimal("0.00")

#         return {
#             "scholarship": scholarship,
#             "discount": discount,
#         }

#     return {
#         "scholarship": None,
#         "discount": Decimal("0.00"),
#     }


# def apply_scholarship_to_invoice(
#     scholarship,
#     invoice,
# ):
#     """
#     Apply a scholarship to an existing invoice.

#     The scholarship REPLACES the invoice's current
#     discount. It does not stack with another discount.
#     """

#     if scholarship.student_id != invoice.student_id:
#         raise ValueError(
#             "This scholarship does not belong to "
#             "the student on this invoice."
#         )

#     if not scholarship_applies_to_invoice(
#         scholarship=scholarship,
#         invoice=invoice,
#     ):
#         raise ValueError(
#             "This scholarship does not apply to "
#             "this invoice."
#         )

#     amount = Decimal(str(invoice.amount))

#     if scholarship.percentage is not None:
#         discount = (
#             amount
#             * scholarship.percentage
#             / Decimal("100")
#         )

#     elif scholarship.fixed_amount is not None:
#         discount = scholarship.fixed_amount

#     else:
#         discount = Decimal("0.00")

#     discount = discount.quantize(
#         Decimal("0.01"),
#         rounding=ROUND_HALF_UP,
#     )

#     if discount < 0:
#         discount = Decimal("0.00")

#     if discount > amount:
#         discount = amount

#     invoice.discount = discount

#     invoice.save()

#     scholarship.invoices.add(invoice)

#     return invoice





from decimal import Decimal, ROUND_HALF_UP

from django.db import models
from django.db.models import Sum
from django.utils import timezone

from .models import (
    Payment,
    Scholarship,
)


# ============================================================
# SCHOLARSHIP SERVICES
# ============================================================


def get_active_student_scholarships(student, date=None):
    """
    Return all active scholarships for a student.

    A scholarship is active when:
    - is_active=True
    - start_date <= date
    - end_date is empty OR end_date >= date
    """

    if date is None:
        date = timezone.now().date()

    return (
        Scholarship.objects
        .filter(
            student=student,
            is_active=True,
            start_date__lte=date,
        )
        .filter(
            models.Q(end_date__isnull=True)
            | models.Q(end_date__gte=date)
        )
        .prefetch_related(
            "fee_categories",
            "invoices",
        )
        .order_by("-created_at")
    )


def scholarship_applies_to_invoice(
    scholarship,
    invoice,
):
    """
    Determine whether a scholarship applies to
    a particular invoice.
    """

    # Scholarship must belong to the same student.
    if scholarship.student_id != invoice.student_id:
        return False

    # --------------------------------------------------
    # ALL
    # --------------------------------------------------

    if scholarship.scope == Scholarship.Scope.ALL:
        return True

    # --------------------------------------------------
    # SELECTED FEE CATEGORIES
    # --------------------------------------------------

    if scholarship.scope == Scholarship.Scope.FEE_CATEGORIES:
        return scholarship.fee_categories.filter(
            pk=invoice.fee_category_id
        ).exists()

    # --------------------------------------------------
    # SPECIFIC INVOICES
    # --------------------------------------------------

    if scholarship.scope == Scholarship.Scope.INVOICES:
        return scholarship.invoices.filter(
            pk=invoice.pk
        ).exists()

    return False


def calculate_scholarship_discount(
    student,
    amount,
    invoice=None,
    date=None,
):
    """
    Calculate the scholarship discount for an invoice.

    Supports:

    1. ALL
       Applies to every invoice for the student.

    2. FEE_CATEGORIES
       Applies only to selected fee categories.

    3. INVOICES
       Applies only to selected invoices.

    If invoice is not supplied, only ALL scholarships
    can be evaluated.
    """

    amount = Decimal(str(amount))

    if amount <= 0:
        return {
            "scholarship": None,
            "discount": Decimal("0.00"),
        }

    if date is None:
        date = timezone.now().date()

    scholarships = get_active_student_scholarships(
        student=student,
        date=date,
    )

    for scholarship in scholarships:

        # A specific invoice is required for
        # category-specific or invoice-specific
        # scholarships.
        if (
            scholarship.scope
            != Scholarship.Scope.ALL
            and invoice is None
        ):
            continue

        if invoice is not None:
            if not scholarship_applies_to_invoice(
                scholarship=scholarship,
                invoice=invoice,
            ):
                continue

        # ----------------------------------------------
        # Percentage scholarship
        # ----------------------------------------------

        if scholarship.percentage is not None:
            discount = (
                amount
                * scholarship.percentage
                / Decimal("100")
            )

        # ----------------------------------------------
        # Fixed amount scholarship
        # ----------------------------------------------

        elif scholarship.fixed_amount is not None:
            discount = scholarship.fixed_amount

        else:
            discount = Decimal("0.00")

        discount = discount.quantize(
            Decimal("0.01"),
            rounding=ROUND_HALF_UP,
        )

        # Never allow discount to exceed invoice amount.
        if discount > amount:
            discount = amount

        if discount < 0:
            discount = Decimal("0.00")

        return {
            "scholarship": scholarship,
            "discount": discount,
        }

    return {
        "scholarship": None,
        "discount": Decimal("0.00"),
    }


def apply_scholarship_to_invoice(
    scholarship,
    invoice,
):
    """
    Apply a scholarship to an existing invoice.

    The scholarship REPLACES the invoice's current
    discount. It does not stack with another discount.
    """

    if scholarship.student_id != invoice.student_id:
        raise ValueError(
            "This scholarship does not belong to "
            "the student on this invoice."
        )

    if not scholarship_applies_to_invoice(
        scholarship=scholarship,
        invoice=invoice,
    ):
        raise ValueError(
            "This scholarship does not apply to "
            "this invoice."
        )

    amount = Decimal(str(invoice.amount))

    if scholarship.percentage is not None:
        discount = (
            amount
            * scholarship.percentage
            / Decimal("100")
        )

    elif scholarship.fixed_amount is not None:
        discount = scholarship.fixed_amount

    else:
        discount = Decimal("0.00")

    discount = discount.quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )

    if discount < 0:
        discount = Decimal("0.00")

    if discount > amount:
        discount = amount

    invoice.discount = discount

    invoice.save()

    scholarship.invoices.add(invoice)

    return invoice


# ============================================================
# PAYMENT SERVICES
# ============================================================


def update_invoice_payment_totals(invoice):
    """
    Recalculate the amount actually paid on an invoice.

    Only SUCCESSFUL payments count as money actually paid.

    PENDING payments do NOT increase amount_paid.
    FAILED payments do NOT increase amount_paid.
    REFUNDED payments do NOT increase amount_paid.
    """

    successful_paid = (
        Payment.objects
        .filter(
            invoice=invoice,
            status=Payment.Status.SUCCESSFUL,
        )
        .aggregate(
            total=Sum("amount")
        )["total"]
        or Decimal("0.00")
    )

    successful_paid = Decimal(
        str(successful_paid)
    ).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )

    invoice.amount_paid = successful_paid

    invoice.save()

    return invoice


def mark_paystack_payment_successful(
    payment,
    paystack_data,
):
    """
    Mark a Paystack payment successful and update the
    related invoice.

    This function is intentionally idempotent.
    """

    if payment.status == Payment.Status.SUCCESSFUL:
        return payment

    now = timezone.now()

    payment.status = Payment.Status.SUCCESSFUL

    payment.gateway = Payment.Gateway.PAYSTACK

    payment.gateway_reference = (
        paystack_data.get("reference")
        or payment.gateway_reference
    )

    transaction_id = paystack_data.get("id")

    if transaction_id is not None:
        payment.transaction_id = str(
            transaction_id
        )

    payment.payment_date = now

    payment.metadata = {
        **(payment.metadata or {}),
        "paystack": {
            **(
                (payment.metadata or {}).get(
                    "paystack",
                    {}
                )
            ),
            "verified": True,
            "verified_at": now.isoformat(),
            "status": paystack_data.get("status"),
            "currency": paystack_data.get("currency"),
            "amount": paystack_data.get("amount"),
        },
    }

    payment.save(
        update_fields=[
            "status",
            "gateway",
            "gateway_reference",
            "transaction_id",
            "payment_date",
            "metadata",
            "updated_at",
        ]
    )

    update_invoice_payment_totals(
        payment.invoice
    )

    return payment


def mark_paystack_payment_failed(
    payment,
    paystack_data,
):
    """
    Mark a Paystack payment as failed, abandoned,
    or reversed and release the pending amount
    reserved by that payment.

    This function is intentionally idempotent.
    """

    # Never turn an already successful payment
    # into a failed payment.
    if payment.status == Payment.Status.SUCCESSFUL:
        return payment

    # Never modify a refunded payment here.
    if payment.status == Payment.Status.REFUNDED:
        return payment

    now = timezone.now()

    paystack_status = (
        paystack_data.get("status")
        or "unknown"
    )

    payment.status = Payment.Status.FAILED

    payment.gateway = Payment.Gateway.PAYSTACK

    payment.gateway_reference = (
        paystack_data.get("reference")
        or payment.gateway_reference
    )

    transaction_id = paystack_data.get("id")

    if transaction_id is not None:
        payment.transaction_id = str(
            transaction_id
        )

    payment.payment_date = now

    payment.metadata = {
        **(payment.metadata or {}),
        "paystack": {
            **(
                (payment.metadata or {}).get(
                    "paystack",
                    {}
                )
            ),
            "verified": True,
            "verified_at": now.isoformat(),
            "status": paystack_status,
            "currency": paystack_data.get(
                "currency"
            ),
            "amount": paystack_data.get(
                "amount"
            ),
            "gateway_response": paystack_data.get(
                "gateway_response"
            ),
            "message": paystack_data.get(
                "message"
            ),
            "failed": True,
        },
    }

    payment.save(
        update_fields=[
            "status",
            "gateway",
            "gateway_reference",
            "transaction_id",
            "payment_date",
            "metadata",
            "updated_at",
        ]
    )

    update_invoice_payment_totals(
        payment.invoice
    )

    return payment
