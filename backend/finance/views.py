from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied, NotFound, ValidationError
from rest_framework.response import Response
from rest_framework import generics, status, serializers
from rest_framework.views import APIView
from django.db.models import Sum, Count
from datetime import datetime

from .services import (
    calculate_scholarship_discount,
    apply_scholarship_to_invoice,
    mark_paystack_payment_successful,
    mark_paystack_payment_failed,

)

import uuid
import secrets
import string
import hashlib
import hmac
import json

from decimal import Decimal

from django.conf import settings
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone

from accounts.models import User
from academics.models import School
from students.models import Student

from .models import (
    AccountantProfile,
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
    PaymentInitiateSerializer,
    ScholarshipSerializer,
    ExpenseCategorySerializer,
    ExpenseSerializer,
    AccountantProfileSerializer,
    AccountantCreateSerializer,
)


# ============================================================
# ROLE / SCHOOL SCOPING RULES
# ============================================================
#
#   SUPER_ADMIN   any school
#   SCHOOL_ADMIN  any school if the account is not linked to a
#                 school (no `school_id`); otherwise only the
#                 linked school
#   ACCOUNTANT    ONLY the school on their (active) profile
#   STUDENT       only their own records
#   PARENT        only their children's records
#   everyone else nothing
#
# ============================================================

STAFF_ROLES = (
    User.Role.SUPER_ADMIN,
    User.Role.SCHOOL_ADMIN,
    User.Role.ACCOUNTANT,
)


FINANCE_VIEW_ROLES = (
    User.Role.SUPER_ADMIN,
    User.Role.SCHOOL_ADMIN,
    User.Role.ACCOUNTANT,
    User.Role.PRINCIPAL,
)

ADMIN_ROLES = (
    User.Role.SUPER_ADMIN,
    User.Role.SCHOOL_ADMIN,
)


def _school_admin_school_id(user):
    """
    School Admin's linked school, or None when the account is not
    linked to a school (None means: may work with ANY school).
    """
    return getattr(user, "school_id", None)


def _accountant_school_id(user):
    """
    The school on an active Accountant profile, or None when the
    profile is missing / inactive (None means: no access).
    """
    profile = getattr(user, "accountant_profile", None)

    if not profile or not profile.is_active:
        return None

    return profile.school_id


def _principal_school_id(user):
    """
    Return the school assigned to the Principal's profile.

    Principal finance access is strictly limited to their
    own school.
    """
    profile = getattr(
        user,
        "principal_profile",
        None,
    )

    if not profile:
        return None

    return getattr(
        profile,
        "school_id",
        None,
    )


def _school_scoped_for_staff(queryset, user):
    """
    Scope any queryset that has a `school` field to what the
    current staff user may see.

    SUPER_ADMIN
        Can see all schools.

    SCHOOL_ADMIN
        Can see their linked school, or all schools when the
        account has no school assigned.

    ACCOUNTANT
        Can only see the school on their active AccountantProfile.

    PRINCIPAL
        Can only see the school on their PrincipalProfile.

    Everyone else
        Gets no records.
    """

    if user.role == User.Role.SUPER_ADMIN:
        return queryset

    if user.role == User.Role.SCHOOL_ADMIN:
        school_id = _school_admin_school_id(user)

        if school_id:
            return queryset.filter(
                school_id=school_id
            )

        return queryset

    if user.role == User.Role.ACCOUNTANT:
        school_id = _accountant_school_id(user)

        if school_id is None:
            return queryset.none()

        return queryset.filter(
            school_id=school_id
        )

    if user.role == User.Role.PRINCIPAL:
        school_id = _principal_school_id(user)

        if school_id is None:
            return queryset.none()

        return queryset.filter(
            school_id=school_id
        )

    return queryset.none()

    

def fee_categories_visible_to(user):
    return _school_scoped_for_staff(
        FeeCategory.objects.select_related("school"),
        user,
    )


def fee_structures_visible_to(user):
    return _school_scoped_for_staff(
        FeeStructure.objects.select_related(
            "school",
            "academic_session",
            "term",
            "class_level",
            "fee_category",
        ),
        user,
    )


def expenses_visible_to(user):
    return _school_scoped_for_staff(
        Expense.objects.select_related(
            "school",
            "expense_category",
            "academic_session",
            "term",
        ),
        user,
    )


def expense_categories_visible_to(user):
    return _school_scoped_for_staff(
        ExpenseCategory.objects.select_related("school"),
        user,
    )


def invoices_visible_to(user):
    """
    Return only the StudentInvoice records the current user is
    authorized to access.

    Principal:
        Read-only access to invoices belonging to students
        in the Principal's school.
    """

    queryset = StudentInvoice.objects.select_related(
        "student",
        "student__school",
        "academic_session",
        "term",
        "fee_category",
    )

    # ---------------------------------------------------------
    # SUPER ADMIN
    # ---------------------------------------------------------

    if user.role == User.Role.SUPER_ADMIN:
        return queryset

    # ---------------------------------------------------------
    # SCHOOL ADMIN
    # ---------------------------------------------------------

    if user.role == User.Role.SCHOOL_ADMIN:
        school_id = _school_admin_school_id(user)

        if school_id:
            return queryset.filter(
                student__school_id=school_id
            )

        return queryset

    # ---------------------------------------------------------
    # PRINCIPAL
    # ---------------------------------------------------------

    if user.role == User.Role.PRINCIPAL:
        school_id = _principal_school_id(user)

        if school_id is None:
            return queryset.none()

        return queryset.filter(
            student__school_id=school_id
        )

    # ---------------------------------------------------------
    # STUDENT
    # ---------------------------------------------------------

    if user.role == User.Role.STUDENT:

        student = Student.objects.filter(
            user=user
        ).first()

        if not student:
            return queryset.none()

        return queryset.filter(
            student_id=student.id
        )

    # ---------------------------------------------------------
    # PARENT
    # ---------------------------------------------------------

    if user.role == User.Role.PARENT:

        return queryset.filter(
            student__parents__user=user
        ).distinct()

    # ---------------------------------------------------------
    # ACCOUNTANT
    # ---------------------------------------------------------

    if user.role == User.Role.ACCOUNTANT:

        school_id = _accountant_school_id(user)

        if school_id is None:
            return queryset.none()

        return queryset.filter(
            student__school_id=school_id
        )

    return queryset.none()

def filter_invoices_by_school(queryset, request):
    """
    Filter StudentInvoice queryset by the requested school.

    StudentInvoice does not have a direct school field.
    The school is accessed through:
        StudentInvoice -> student -> school
    """

    school_id = request.query_params.get("school")

    if not school_id:
        return queryset

    try:
        school_id = int(school_id)
    except (TypeError, ValueError):
        raise ValidationError(
            {
                "school": (
                    "school must be a valid school ID."
                )
            }
        )

    return queryset.filter(
        student__school_id=school_id
    )


def scholarships_visible_to(user):
    queryset = Scholarship.objects.select_related(
        "student",
        "student__school",
    )

    if user.role == User.Role.SUPER_ADMIN:
        return queryset

    if user.role == User.Role.SCHOOL_ADMIN:
        school_id = _school_admin_school_id(user)

        if school_id:
            return queryset.filter(student__school_id=school_id)

        return queryset

        if user.role == User.Role.PRINCIPAL:
            principal = getattr(
                user,
                "principal_profile",
                None,
            )

            if not principal:
                return queryset.none()

            school_id = getattr(
                principal,
                "school_id",
                None,
            )

            if not school_id:
                return queryset.none()

            return queryset.filter(
                student__school_id=school_id
            )

    if user.role == User.Role.STUDENT:
        student = Student.objects.filter(user=user).first()

        if not student:
            return queryset.none()

        return queryset.filter(student_id=student.id)

    if user.role == User.Role.PARENT:
        return queryset.filter(
            student__parents__user=user
        ).distinct()

    if user.role == User.Role.ACCOUNTANT:
        school_id = _accountant_school_id(user)

        if school_id is None:
            return queryset.none()

        return queryset.filter(student__school_id=school_id)

    return queryset.none()


def user_can_access_student(user, student):
    """
    May this user access this student's records?
    """

    # ---------------------------------------------------------
    # SUPER ADMIN
    # ---------------------------------------------------------

    if user.role == User.Role.SUPER_ADMIN:
        return True

    # ---------------------------------------------------------
    # STUDENT
    # ---------------------------------------------------------

    if user.role == User.Role.STUDENT:
        return student.user_id == user.id

    # ---------------------------------------------------------
    # PARENT
    # ---------------------------------------------------------

    if user.role == User.Role.PARENT:
        return student.parents.filter(
            user_id=user.id
        ).exists()

    # ---------------------------------------------------------
    # SCHOOL ADMIN
    # ---------------------------------------------------------

    if user.role == User.Role.SCHOOL_ADMIN:

        school_id = _school_admin_school_id(user)

        return (
            not school_id
            or student.school_id == school_id
        )

    # ---------------------------------------------------------
    # PRINCIPAL
    # ---------------------------------------------------------

    if user.role == User.Role.PRINCIPAL:

        school_id = _principal_school_id(user)

        return (
            school_id is not None
            and student.school_id == school_id
        )

    # ---------------------------------------------------------
    # ACCOUNTANT
    # ---------------------------------------------------------

    if user.role == User.Role.ACCOUNTANT:

        school_id = _accountant_school_id(user)

        return (
            school_id is not None
            and student.school_id == school_id
        )

    return False


def user_can_manage_invoice(user, invoice):
    """Staff only. Students and parents never manage invoices."""
    if user.role not in STAFF_ROLES:
        return False

    return user_can_access_student(user, invoice.student)


class SchoolDataMixin:
    """
    For views whose model has a `school` field (fee categories,
    fee structures, expense categories, expenses).

    ACCOUNTANT
        The school is forced to the school on their profile and is
        NOT required in the request.
    SCHOOL ADMIN linked to a school
        The school is forced to that school.
    SUPER ADMIN / School Admin not linked to a school
        Must send `school` when creating (any school allowed).
    EVERYONE ELSE
        403 on writes.

    The school is put into the incoming data (not passed to
    serializer.save()) so DRF's unique-together validators, which
    run during validation, don't complain that `school` is missing.
    """

    def get_serializer(self, *args, **kwargs):

        data = kwargs.get("data")

        if data is not None:

            user = self.request.user

            if user.role not in STAFF_ROLES:
                raise PermissionDenied(
                    "You do not have permission to do this."
                )

            data = data.copy()

            if user.role == User.Role.ACCOUNTANT:

                school_id = _accountant_school_id(user)

                if school_id is None:
                    raise PermissionDenied(
                        "You do not have an active "
                        "Accountant profile."
                    )

                data["school"] = school_id

            else:

                admin_school_id = (
                    _school_admin_school_id(user)
                    if user.role == User.Role.SCHOOL_ADMIN
                    else None
                )

                if admin_school_id:
                    data["school"] = admin_school_id

                elif (
                    self.request.method == "POST"
                    and not data.get("school")
                ):
                    raise serializers.ValidationError(
                        {"school": "School is required."}
                    )

            kwargs["data"] = data

        return super().get_serializer(*args, **kwargs)

    def filter_school_param(self, queryset):
        """
        Super Admin / School Admin can narrow a list with
        ?school=<id>. Accountants are already locked to their own
        school by the queryset.
        """
        if self.request.user.role in ADMIN_ROLES:

            school_id = self.request.query_params.get("school")

            if school_id and school_id.isdigit():
                return queryset.filter(school_id=int(school_id))

        return queryset


# ============================================================
# PAYSTACK HELPERS
# ============================================================

def initialize_paystack_transaction(
    payment,
    request,
):
    """
    Initialize a Paystack transaction for an existing pending
    Payment record.

    Paystack expects the amount in the smallest currency unit.

    Example:
        ₦50,000.00 = 5,000,000 kobo
    """

    secret_key = getattr(
        settings,
        "PAYSTACK_SECRET_KEY",
        "",
    )

    if not secret_key:
        raise ValueError(
            "Paystack secret key is not configured."
        )

    customer_email = request.user.email

    if not customer_email:
        raise ValueError(
            "Your account does not have an email address. "
            "Please update your email address before making "
            "an online payment."
        )

    amount_in_kobo = int(
        payment.amount * Decimal("100")
    )

    frontend_url = getattr(
        settings,
        "FRONTEND_URL",
        "http://localhost:5173",
    ).rstrip("/")

    # ============================================================
    # PAYSTACK CALLBACK URL
    # ============================================================

    if getattr(request.user, "role", None) == "PARENT":
        callback_url = f"{frontend_url}/parent/fees"
    else:
        callback_url = f"{frontend_url}/student/fees"

    payload = {
        "email": customer_email,
        "amount": amount_in_kobo,
        "reference": payment.reference,
        "currency": "NGN",
        "callback_url": callback_url,
        "metadata": {
            "payment_id": payment.id,
            "invoice_id": payment.invoice_id,
            "invoice_number": (
                payment.invoice.invoice_number
            ),
            "student_id": (
                payment.invoice.student_id
            ),
            "student_name": (
                payment.invoice.student.full_name
            ),
            "payer_user_id": payment.payer_user_id,
            "referrer": f"{frontend_url}/",
        },
    }

    import requests

    response = requests.post(
        "https://api.paystack.co/transaction/initialize",
        headers={
            "Authorization": f"Bearer {secret_key}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=30,
    )

    try:
        response_data = response.json()
    except ValueError:
        raise ValueError(
            "Paystack returned an invalid response."
        )

    if (
        response.status_code >= 400
        or not response_data.get("status")
        or not response_data.get("data")
    ):
        message = (
            response_data.get("message")
            or "Paystack transaction initialization failed."
        )

        raise ValueError(message)

    paystack_data = response_data["data"]

    paystack_reference = paystack_data.get(
        "reference"
    )

    authorization_url = paystack_data.get(
        "authorization_url"
    )

    access_code = paystack_data.get(
        "access_code"
    )

    if not authorization_url:
        raise ValueError(
            "Paystack did not return an authorization URL."
        )

    payment.gateway_reference = (
        paystack_reference
    )

    payment.metadata = {
        **(payment.metadata or {}),
        "paystack": {
            "authorization_url": authorization_url,
            "access_code": access_code,
            "reference": paystack_reference,
            "callback_url": callback_url,
        },
    }

    payment.save(
        update_fields=[
            "gateway_reference",
            "metadata",
            "updated_at",
        ]
    )

    return {
        "authorization_url": authorization_url,
        "access_code": access_code,
        "reference": paystack_reference,
        "amount": payment.amount,
        "amount_in_kobo": amount_in_kobo,
        "callback_url": callback_url,
    }


def update_invoice_payment_totals(invoice):
    """
    Recalculate invoice amount_paid from successful payments.

    StudentInvoice.save() then recalculates balance and status.
    """

    successful_payments = (
        Payment.objects.filter(
            invoice=invoice,
            status=Payment.Status.SUCCESSFUL,
        )
        .aggregate(
            total=Sum("amount")
        )["total"]
        or Decimal("0.00")
    )

    invoice.amount_paid = successful_payments

    invoice.save()


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
    Mark a Paystack payment as failed/abandoned and release
    the pending amount reserved by that payment.

    This function is intentionally idempotent.
    """

    if payment.status == Payment.Status.SUCCESSFUL:
        return payment

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

# ============================================================
# CREATE ACCOUNTANT
# ============================================================

class AccountantCreateView(generics.CreateAPIView):

    serializer_class = AccountantCreateSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def create(self, request, *args, **kwargs):

        if request.user.role not in ADMIN_ROLES:
            raise PermissionDenied(
                "Only Super Admin and School Admin "
                "can create an Accountant."
            )

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        data = serializer.validated_data

        try:
            school = School.objects.get(
                id=data["school"]
            )
        except School.DoesNotExist:
            return Response(
                {
                    "detail": "School not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # -----------------------------------------------------
        # A School Admin that IS linked to a school can only
        # create Accountants for that school. A School Admin
        # that is not linked to a school may use any school.
        # -----------------------------------------------------

        if request.user.role == User.Role.SCHOOL_ADMIN:

            admin_school_id = _school_admin_school_id(
                request.user
            )

            if admin_school_id and admin_school_id != school.id:
                raise PermissionDenied(
                    "You can only create an Accountant "
                    "for your school."
                )

        base_username = (
            data["employee_number"]
            .strip()
            .upper()
        )

        username = base_username
        counter = 1

        while User.objects.filter(
            username=username
        ).exists():

            username = (
                f"{base_username}{counter}"
            )

            counter += 1

        alphabet = (
            string.ascii_letters
            + string.digits
            + "@#$%"
        )

        temporary_password = "".join(
            secrets.choice(alphabet)
            for _ in range(12)
        )

        user = User.objects.create_user(
            username=username,
            email=data["email"],
            password=temporary_password,
            first_name=data["first_name"],
            last_name=data["last_name"],
            phone_number=data.get(
                "phone_number",
                "",
            ),
            role=User.Role.ACCOUNTANT,
        )

        accountant = AccountantProfile.objects.create(
            user=user,
            school=school,
            employee_number=data[
                "employee_number"
            ],
            employment_date=data.get(
                "employment_date"
            ),
        )

        return Response(
            {
                "message": (
                    "Accountant created successfully."
                ),
                "accountant": (
                    AccountantProfileSerializer(
                        accountant
                    ).data
                ),
                "credentials": {
                    "username": username,
                    "password": temporary_password,
                },
            },
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# ACCOUNTANT PROFILE
# ============================================================

class AccountantProfileView(generics.RetrieveAPIView):

    serializer_class = AccountantProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):

        try:
            return self.request.user.accountant_profile

        except AccountantProfile.DoesNotExist:

            raise NotFound(
                "You do not have an Accountant profile."
            )


# ============================================================
# FEE CATEGORIES
# ============================================================
#
# Accountant: locked to the school on their profile, school NOT
#             required.
# Super Admin / School Admin: any school (must send `school` when
#             creating).
# Everyone else: nothing.
# ============================================================

class FeeCategoryListCreateView(
    SchoolDataMixin,
    generics.ListCreateAPIView,
):

    serializer_class = FeeCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return self.filter_school_param(
            fee_categories_visible_to(self.request.user)
        )


class FeeCategoryDetailView(
    SchoolDataMixin,
    generics.RetrieveUpdateDestroyAPIView,
):

    serializer_class = FeeCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return fee_categories_visible_to(
            self.request.user
        )


# ============================================================
# FEE STRUCTURES
# ============================================================

class FeeStructureListCreateView(
    SchoolDataMixin,
    generics.ListCreateAPIView,
):

    serializer_class = FeeStructureSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return self.filter_school_param(
            fee_structures_visible_to(self.request.user)
        )


class FeeStructureDetailView(
    SchoolDataMixin,
    generics.RetrieveUpdateDestroyAPIView,
):

    serializer_class = FeeStructureSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return fee_structures_visible_to(
            self.request.user
        )


# ============================================================
# STUDENT INVOICES
# ============================================================

class StudentInvoiceListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = StudentInvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return invoices_visible_to(
            self.request.user
        ).order_by("-created_at")

    def perform_create(self, serializer):

        user = self.request.user

        if user.role not in STAFF_ROLES:
            raise PermissionDenied(
                "You do not have permission to create invoices."
            )

        student = serializer.validated_data.get(
            "student"
        )

        if not student:
            raise serializers.ValidationError({
                "student": "Student is required."
            })

        if not user_can_access_student(user, student):
            raise PermissionDenied(
                "You can only create invoices for students "
                "in a school you are allowed to manage."
            )

        serializer.save()


# ============================================================
# STUDENT INVOICE DETAIL
# ============================================================

class StudentInvoiceDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = StudentInvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return invoices_visible_to(
            self.request.user
        )

    def perform_update(self, serializer):

        user = self.request.user

        if user.role not in STAFF_ROLES:
            raise PermissionDenied(
                "You are not authorized to modify an invoice."
            )

        target_student = serializer.validated_data.get(
            "student",
            serializer.instance.student,
        )

        # The resulting invoice must stay inside a school the
        # user is allowed to manage.
        if not user_can_access_student(user, target_student):
            raise PermissionDenied(
                "You cannot move an invoice to a student "
                "from a school you cannot manage."
            )

        serializer.save()

    def perform_destroy(self, instance):

        user = self.request.user

        if user.role not in STAFF_ROLES:
            raise PermissionDenied(
                "You are not authorized to delete an invoice."
            )

        has_payments = Payment.objects.filter(
            invoice=instance
        ).exists()

        if has_payments:
            raise serializers.ValidationError({
                "detail": (
                    "This invoice cannot be deleted because "
                    "it already has payment records."
                )
            })

        instance.delete()


# ============================================================
# PAYMENTS
# ============================================================

class PaymentListCreateView(
    generics.ListCreateAPIView
):

    queryset = Payment.objects.select_related(
        "invoice",
        "invoice__student",
        "invoice__student__school",
        "invoice__academic_session",
        "invoice__term",
        "invoice__fee_category",
        "payer_user",
    ).order_by("-payment_date")

    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        # Only payments on invoices this user is allowed to see:
        # students -> their own, parents -> their children's,
        # accountants -> their school, admins -> per the rules
        # at the top of this file, everyone else -> nothing.
        queryset = super().get_queryset().filter(
            invoice__in=invoices_visible_to(user)
        )

        # Optional filters. The student filter is for staff only,
        # so a student/parent can never widen their own results.
        student_id = self.request.query_params.get(
            "student"
        )

        if student_id and user.role in STAFF_ROLES:
            queryset = queryset.filter(
                invoice__student_id=student_id
            )

        invoice_id = self.request.query_params.get(
            "invoice"
        )

        if invoice_id:
            queryset = queryset.filter(
                invoice_id=invoice_id
            )

        payment_status = self.request.query_params.get(
            "status"
        )

        if payment_status:
            queryset = queryset.filter(
                status=payment_status
            )

        payment_method = (
            self.request.query_params.get(
                "payment_method"
            )
        )

        if payment_method:
            queryset = queryset.filter(
                payment_method=payment_method
            )

        reference = self.request.query_params.get(
            "reference"
        )

        if reference:
            queryset = queryset.filter(
                reference__icontains=reference
            )

        return queryset

    @transaction.atomic
    def perform_create(self, serializer):

        user = self.request.user

        # Students and parents must use PaymentInitiateView.
        if user.role in (
            User.Role.STUDENT,
            User.Role.PARENT,
        ):
            raise PermissionDenied(
                "Please use the payment initiation process "
                "to make a payment."
            )

        if user.role not in STAFF_ROLES:
            raise PermissionDenied(
                "You do not have permission to create payments."
            )

        invoice = serializer.validated_data.get(
            "invoice"
        )

        if not invoice:
            raise serializers.ValidationError({
                "invoice": "Invoice is required."
            })

        if not user_can_manage_invoice(
            user,
            invoice,
        ):
            raise PermissionDenied(
                "You are not authorized to create a payment "
                "for this invoice."
            )

        payment = serializer.save()

        if payment.status == Payment.Status.SUCCESSFUL:

            update_invoice_payment_totals(
                payment.invoice
            )


# ============================================================
# PAYMENT DETAIL
# ============================================================

class PaymentDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Payment.objects.select_related(
            "invoice",
            "invoice__student",
            "invoice__student__school",
            "invoice__academic_session",
            "invoice__term",
            "invoice__fee_category",
            "payer_user",
        ).filter(
            invoice__in=invoices_visible_to(
                self.request.user
            )
        )

    @transaction.atomic
    def perform_update(self, serializer):

        user = self.request.user

        if user.role not in STAFF_ROLES:
            raise PermissionDenied(
                "You are not authorized to modify payments."
            )

        target_invoice = serializer.validated_data.get(
            "invoice",
            serializer.instance.invoice,
        )

        if not user_can_manage_invoice(
            user,
            target_invoice,
        ):
            raise PermissionDenied(
                "You are not authorized to move this payment "
                "to the selected invoice."
            )

        old_invoice = serializer.instance.invoice

        payment = serializer.save()

        update_invoice_payment_totals(
            old_invoice
        )

        if payment.invoice_id != old_invoice.id:
            update_invoice_payment_totals(
                payment.invoice
            )

    @transaction.atomic
    def perform_destroy(self, instance):

        user = self.request.user

        if user.role not in STAFF_ROLES:
            raise PermissionDenied(
                "You are not authorized to delete payments."
            )

        invoice = instance.invoice

        instance.delete()

        update_invoice_payment_totals(
            invoice
        )


# ============================================================
# PAYMENT RECEIPT
# ============================================================

class PaymentReceiptView(
    generics.GenericAPIView
):

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):

        payment = get_object_or_404(
            Payment.objects.select_related(
                "invoice",
                "invoice__student",
                "invoice__student__school",
                "invoice__academic_session",
                "invoice__term",
                "invoice__fee_category",
                "payer_user",
            ),
            pk=pk,
        )

        user = request.user

        student = payment.invoice.student
        school = student.school

        # -------------------------------------------------
        # AUTHORIZATION
        # -------------------------------------------------
        if not user_can_access_student(user, student):

            raise PermissionDenied(
                "You are not authorized to view "
                "this payment receipt."
            )

        # -------------------------------------------------
        # ONLY SUCCESSFUL PAYMENTS
        # -------------------------------------------------
        if payment.status != Payment.Status.SUCCESSFUL:

            return Response(
                {
                    "detail": (
                        "A receipt is only available for "
                        "successful payments."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        student_name = student.full_name

        student_identifier = (
            getattr(student, "student_id", None)
            or getattr(student, "admission_number", None)
            or getattr(student, "registration_number", None)
            or str(student.id)
        )

        payer_name = None

        if payment.payer_user:

            payer_name = (
                f"{payment.payer_user.first_name} "
                f"{payment.payer_user.last_name}"
            ).strip()

            if not payer_name:
                payer_name = payment.payer_user.username

        school_name = (
            school.name
            if school
            else "EduManageERP"
        )

        school_logo_url = None

        if school and school.logo:

            try:

                school_logo_url = (
                    request.build_absolute_uri(
                        school.logo.url
                    )
                )

            except ValueError:

                school_logo_url = None

        session_name = None

        if payment.invoice.academic_session:

            session_name = (
                payment.invoice.academic_session.name
            )

        term_name = None

        if payment.invoice.term:

            term_name = (
                payment.invoice.term.get_name_display()
            )

        payment_method = (
            payment.get_payment_method_display()
        )

        gateway = (
            payment.get_gateway_display()
        )

        return Response(
            {
                "receipt": {
                    "receipt_number": payment.reference,
                    "payment_id": payment.id,
                    "status": payment.status,
                    "status_display": (
                        payment.get_status_display()
                    ),
                    "payment_date": payment.payment_date,
                    "created_at": payment.created_at,
                },

                "school": {
                    "id": (
                        school.id
                        if school
                        else None
                    ),
                    "name": school_name,
                    "code": (
                        school.code
                        if school
                        else None
                    ),
                    "address": (
                        school.address
                        if school
                        else ""
                    ),
                    "phone": (
                        school.phone
                        if school
                        else ""
                    ),
                    "email": (
                        school.email
                        if school
                        else ""
                    ),
                    "logo_url": school_logo_url,
                },

                "student": {
                    "id": student_identifier,
                    "database_id": student.id,
                    "name": student_name,
                },

                "invoice": {
                    "id": payment.invoice.id,
                    "invoice_number": (
                        payment.invoice.invoice_number
                    ),
                    "fee_category": (
                        payment.invoice.fee_category.name
                        if payment.invoice.fee_category
                        else None
                    ),
                    "academic_session": session_name,
                    "term": term_name,
                    "description": (
                        payment.invoice.description
                    ),
                },

                "payment": {
                    "amount": payment.amount,
                    "payment_method": (
                        payment.payment_method
                    ),
                    "payment_method_display": (
                        payment_method
                    ),
                    "gateway": payment.gateway,
                    "gateway_display": gateway,
                    "reference": payment.reference,
                    "gateway_reference": (
                        payment.gateway_reference
                    ),
                    "transaction_id": (
                        payment.transaction_id
                    ),
                    "payment_date": (
                        payment.payment_date
                    ),
                    "notes": payment.notes,
                },

                "payer": {
                    "name": payer_name,
                    "type": payment.payer_type,
                    "type_display": (
                        payment.get_payer_type_display()
                    ),
                },

                "invoice_balance": {
                    "invoice_amount": (
                        payment.invoice.amount
                    ),
                    "discount": (
                        payment.invoice.discount
                    ),
                    "amount_paid": (
                        payment.invoice.amount_paid
                    ),
                    "balance": (
                        payment.invoice.balance
                    ),
                    "status": (
                        payment.invoice.status
                    ),
                },
            },
            status=status.HTTP_200_OK,
        )


# ============================================================
# SCHOLARSHIPS
# ============================================================
#
# Everyone with a matching student can READ (students/parents see
# their own). Only staff can create / change / delete, and only
# for students in a school they may manage.
# ============================================================

class ScholarshipListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = ScholarshipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return scholarships_visible_to(
            self.request.user
        )

    def perform_create(self, serializer):

        user = self.request.user

        if user.role not in STAFF_ROLES:
            raise PermissionDenied(
                "You do not have permission to create "
                "scholarships."
            )

        student = serializer.validated_data["student"]

        if not user_can_access_student(user, student):
            raise PermissionDenied(
                "You can only create scholarships for "
                "students in a school you may manage."
            )

        serializer.save()


class ScholarshipDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = ScholarshipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return scholarships_visible_to(
            self.request.user
        )

    def perform_update(self, serializer):

        user = self.request.user

        if user.role not in STAFF_ROLES:
            raise PermissionDenied(
                "You do not have permission to modify "
                "scholarships."
            )

        student = serializer.validated_data.get(
            "student",
            serializer.instance.student,
        )

        if not user_can_access_student(user, student):
            raise PermissionDenied(
                "You can only assign scholarships to "
                "students in a school you may manage."
            )

        serializer.save()

    def perform_destroy(self, instance):

        if self.request.user.role not in STAFF_ROLES:
            raise PermissionDenied(
                "You do not have permission to delete "
                "scholarships."
            )

        instance.delete()


class ScholarshipApplyView(
    generics.GenericAPIView
):
    serializer_class = ScholarshipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return scholarships_visible_to(
            self.request.user
        )

    def post(self, request, pk):
        user = request.user

        if user.role not in STAFF_ROLES:
            raise PermissionDenied(
                "You do not have permission to apply "
                "scholarships."
            )

        try:
            scholarship = self.get_queryset().get(pk=pk)
        except Scholarship.DoesNotExist:
            raise ValidationError({
                "detail": "Scholarship not found."
            })

        if not scholarship.is_active:
            raise ValidationError({
                "detail": (
                    "This scholarship is not active."
                )
            })

        today = timezone.now().date()

        if scholarship.start_date > today:
            raise ValidationError({
                "detail": (
                    "This scholarship has not started yet."
                )
            })

        if (
            scholarship.end_date is not None
            and scholarship.end_date < today
        ):
            raise ValidationError({
                "detail": (
                    "This scholarship has already expired."
                )
            })

        student = scholarship.student

        if not user_can_access_student(
            user,
            student
        ):
            raise PermissionDenied(
                "You can only apply scholarships to "
                "students in a school you may manage."
            )

        # --------------------------------------------------
        # Determine which invoices should be affected.
        # --------------------------------------------------

        if (
            scholarship.scope
            == Scholarship.Scope.INVOICES
        ):
            invoices = scholarship.invoices.filter(
                student=student
            )

        elif (
            scholarship.scope
            == Scholarship.Scope.FEE_CATEGORIES
        ):
            invoices = StudentInvoice.objects.filter(
                student=student,
                fee_category__in=(
                    scholarship.fee_categories.all()
                ),
            )

        else:
            invoices = StudentInvoice.objects.filter(
                student=student
            )

        invoices = invoices.exclude(
            status=StudentInvoice.Status.CANCELLED
        )

        applied_invoices = []

        for invoice in invoices:
            apply_scholarship_to_invoice(
                scholarship=scholarship,
                invoice=invoice,
            )

            applied_invoices.append({
                "id": invoice.id,
                "invoice_number": invoice.invoice_number,
                "fee_category": (
                    invoice.fee_category.name
                ),
                "amount": invoice.amount,
                "discount": invoice.discount,
                "balance": invoice.balance,
            })

        return Response({
            "message": (
                "Scholarship applied successfully."
            ),
            "scholarship": scholarship.id,
            "scope": scholarship.scope,
            "student": student.full_name,
            "applied_count": len(applied_invoices),
            "invoices": applied_invoices,
        })


# ============================================================
# FINANCE SUMMARY
# ============================================================
# ============================================================
# FINANCE SUMMARY
# ============================================================

class FinanceSummaryView(
    generics.GenericAPIView
):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        # -----------------------------------------------------
        # BASE AUTHORIZED INVOICES
        # -----------------------------------------------------

        invoices = invoices_visible_to(user)

        # -----------------------------------------------------
        # SCHOOL FILTER
        #
        # SUPER ADMIN:
        #   Must be able to select any school.
        #
        # SCHOOL ADMIN:
        #   Can only select their own school when linked.
        #
        # ACCOUNTANT / PRINCIPAL:
        #   Their invoices_visible_to() queryset is already
        #   locked to their school.
        # -----------------------------------------------------

        school_id = request.query_params.get("school")

        if school_id:

            try:
                school_id = int(school_id)
            except (TypeError, ValueError):

                return Response(
                    {
                        "detail": (
                            "school must be a valid school ID."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # -------------------------------------------------
            # SUPER ADMIN
            # -------------------------------------------------

            if user.role == User.Role.SUPER_ADMIN:

                if not School.objects.filter(
                    id=school_id
                ).exists():

                    return Response(
                        {
                            "detail": (
                                "The selected school "
                                "does not exist."
                            )
                        },
                        status=status.HTTP_404_NOT_FOUND,
                    )

                invoices = invoices.filter(
                    student__school_id=school_id
                )

            # -------------------------------------------------
            # SCHOOL ADMIN
            # -------------------------------------------------

            elif user.role == User.Role.SCHOOL_ADMIN:

                admin_school_id = (
                    _school_admin_school_id(user)
                )

                if (
                    admin_school_id
                    and admin_school_id != school_id
                ):

                    raise PermissionDenied(
                        "You can only view financial "
                        "reports for your school."
                    )

                invoices = invoices.filter(
                    student__school_id=school_id
                )

            # -------------------------------------------------
            # OTHER ROLES
            # -------------------------------------------------

            else:

                # Their invoices_visible_to() is already
                # restricted to their authorized school.
                invoices = invoices.filter(
                    student__school_id=school_id
                )

        # -----------------------------------------------------
        # CALCULATIONS
        # -----------------------------------------------------

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

        return Response(
            {
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
            }
        )
        

# ============================================================
# STUDENT FINANCIAL STATEMENT
# ============================================================

class StudentFinancialStatementView(
    APIView
):

    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):

        student = get_object_or_404(
            Student,
            id=student_id,
        )

        # -----------------------------------------------------
        # AUTHORIZATION
        # -----------------------------------------------------

        if not user_can_access_student(
            request.user,
            student,
        ):
            raise PermissionDenied(
                "You do not have permission to view this "
                "student's financial statement."
            )

        # -----------------------------------------------------
        # ONLY THE INVOICES FOR THIS STUDENT
        # -----------------------------------------------------

        # invoices = StudentInvoice.objects.filter(
        #     student_id=student.id
        # ).select_related(
        #     "student",
        #     "academic_session",
        #     "term",
        #     "fee_category",
        # ).order_by(
        #     "-created_at"
        # )

        # -----------------------------------------------------
        # INVOICES FOR THIS STUDENT
        # -----------------------------------------------------

        invoices = StudentInvoice.objects.filter(
            student_id=student.id
        )

        # -----------------------------------------------------
        # OPTIONAL SESSION / TERM FILTERS
        #
        # If supplied by the frontend, only invoices belonging
        # to that academic session / term are included.
        # -----------------------------------------------------

        academic_session_id = request.query_params.get(
            "academic_session"
        )

        term_id = request.query_params.get(
            "term"
        )

        if academic_session_id:
            invoices = invoices.filter(
                academic_session_id=academic_session_id
            )

        if term_id:
            invoices = invoices.filter(
                term_id=term_id
            )

        invoices = invoices.select_related(
            "student",
            "academic_session",
            "term",
            "fee_category",
        ).order_by(
            "-created_at"
        )

        payments = Payment.objects.filter(
            invoice__in=invoices
        ).select_related(
            "invoice",
            "invoice__fee_category",
            "payer_user",
        ).order_by(
            "-created_at"
        )

        total_invoiced = (
            invoices.aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        total_discount = (
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

        total_balance = (
            invoices.aggregate(
                total=Sum("balance")
            )["total"]
            or Decimal("0.00")
        )

        return Response({
            "student": {
                "id": student.id,
                "name": student.full_name,
            },

            "summary": {
                "total_invoiced": total_invoiced,
                "total_discount": total_discount,
                "total_paid": total_paid,
                "total_balance": total_balance,
            },

            # Legacy top-level keys, kept so older frontend code
            # that reads the previous response shape keeps working.
            "student_id": student.id,
            "student_name": student.full_name,
            "total_invoiced": total_invoiced,
            "total_discounts": total_discount,
            "total_paid": total_paid,
            "total_outstanding": total_balance,

            "invoices": StudentInvoiceSerializer(
                invoices,
                many=True,
            ).data,

            "payments": PaymentSerializer(
                payments,
                many=True,
            ).data,
        })


# ============================================================
# GENERATE STUDENT INVOICES
# ============================================================

class GenerateInvoicesView(
    generics.GenericAPIView
):

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):

        academic_session_id = request.data.get(
            "academic_session"
        )

        term_id = request.data.get(
            "term"
        )

        class_level_id = request.data.get(
            "class_level"
        )

        school_id = request.data.get(
            "school"
        )

        # -----------------------------------------------------
        # REQUIRED FIELDS
        # -----------------------------------------------------

        if not academic_session_id:

            return Response(
                {
                    "error": "academic_session is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not term_id:

            return Response(
                {
                    "error": "term is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not class_level_id:

            return Response(
                {
                    "error": "class_level is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # `school` is optional in the request for accountants, so
        # only validate it when it was actually sent.
        if school_id in (None, ""):

            school_id = None

        else:

            try:
                school_id = int(school_id)
            except (TypeError, ValueError):
                return Response(
                    {
                        "error": "school must be a valid ID."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        user = request.user
        school = None

        # -----------------------------------------------------
        # ACCOUNTANT - locked to the school on their profile
        # -----------------------------------------------------

        if user.role == User.Role.ACCOUNTANT:

            accountant_profile = getattr(
                user,
                "accountant_profile",
                None,
            )

            if not accountant_profile:

                return Response(
                    {
                        "error": (
                            "You do not have an Accountant profile."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            if not accountant_profile.is_active:

                return Response(
                    {
                        "error": (
                            "Your Accountant profile is inactive."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            school = accountant_profile.school

            if school_id and school_id != school.id:

                return Response(
                    {
                        "error": (
                            "You can only generate invoices "
                            "for your assigned school."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        # -----------------------------------------------------
        # SUPER ADMIN / SCHOOL ADMIN - any school (a School Admin
        # linked to a school is limited to that school)
        # -----------------------------------------------------

        elif user.role in ADMIN_ROLES:

            admin_school_id = (
                _school_admin_school_id(user)
                if user.role == User.Role.SCHOOL_ADMIN
                else None
            )

            if (
                admin_school_id
                and school_id
                and school_id != admin_school_id
            ):

                return Response(
                    {
                        "error": (
                            "You can only generate invoices "
                            "for your school."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            target_school_id = admin_school_id or school_id

            if not target_school_id:

                return Response(
                    {
                        "error": (
                            "school is required when "
                            "generating invoices as an admin."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:

                school = School.objects.get(
                    pk=target_school_id
                )

            except School.DoesNotExist:

                return Response(
                    {
                        "error": (
                            "The selected school does not exist."
                        )
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

        # -----------------------------------------------------
        # OTHER ROLES
        # -----------------------------------------------------

        else:

            return Response(
                {
                    "error": (
                        "You do not have permission "
                        "to generate invoices."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # -----------------------------------------------------
        # FEE STRUCTURES
        # -----------------------------------------------------

        fee_structures = (
            FeeStructure.objects
            .filter(
                school_id=school.id,
                academic_session_id=academic_session_id,
                term_id=term_id,
                class_level_id=class_level_id,
                is_active=True,
            )
            .select_related(
                "school",
                "fee_category",
            )
        )

        if not fee_structures.exists():

            return Response(
                {
                    "error": (
                        "No active fee structures found "
                        "for this school, class, session "
                        "and term."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # -----------------------------------------------------
        # FEE CATEGORY SCHOOL CHECK
        # -----------------------------------------------------

        for fee_structure in fee_structures:

            if (
                fee_structure.fee_category.school_id
                != fee_structure.school_id
            ):

                return Response(
                    {
                        "error": (
                            "A fee structure contains a "
                            "fee category belonging to a "
                            "different school."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # -----------------------------------------------------
        # STUDENT ENROLLMENTS
        # -----------------------------------------------------

        from students.models import StudentEnrollment

        enrollments = (
            StudentEnrollment.objects
            .filter(
                academic_session_id=academic_session_id,
                term_id=term_id,
                class_level_id=class_level_id,
                student__school_id=school.id,
            )
            .select_related(
                "student",
                "student__school",
            )
        )

        if not enrollments.exists():

            return Response(
                {
                    "error": (
                        "No students are enrolled in "
                        "this class for the selected "
                        "school, session and term."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # -----------------------------------------------------
        # GENERATE
        # -----------------------------------------------------

        created_invoices = []
        skipped_invoices = []

        for enrollment in enrollments:

            student = enrollment.student

            if student.school_id != school.id:
                continue

            for fee_structure in fee_structures:

                if (
                    fee_structure.school_id
                    != student.school_id
                ):
                    continue

                existing_invoice = (
                    StudentInvoice.objects
                    .filter(
                        student=student,
                        academic_session_id=academic_session_id,
                        term_id=term_id,
                        fee_category=fee_structure.fee_category,
                    )
                    .first()
                )

                if existing_invoice:

                    skipped_invoices.append(
                        {
                            "student": student.full_name,
                            "invoice_number": (
                                existing_invoice.invoice_number
                            ),
                            "reason": (
                                "Invoice already exists."
                            ),
                        }
                    )

                    continue

                last_invoice = (
                    StudentInvoice.objects
                    .select_for_update()
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

                scholarship_result = calculate_scholarship_discount(
                    student=student,
                    amount=fee_structure.amount,
                    date=timezone.now().date(),
                )

                invoice = StudentInvoice.objects.create(
                    student=student,
                    academic_session_id=academic_session_id,
                    term_id=term_id,
                    fee_category=fee_structure.fee_category,
                    invoice_number=invoice_number,
                    amount=fee_structure.amount,
                    discount=Decimal("0.00"),
                    due_date=fee_structure.due_date,
                    description=fee_structure.description,
                )

                scholarship_result = calculate_scholarship_discount(
                    student=student,
                    amount=invoice.amount,
                    invoice=invoice,
                    date=timezone.now().date(),
                )

                invoice.discount = scholarship_result["discount"]
                invoice.save()

                if scholarship_result["scholarship"] is not None:
                    scholarship_result["scholarship"].invoices.add(
                        invoice
                    )

                created_invoices.append(
                    {
                        "id": invoice.id,
                        "student": student.full_name,
                        "invoice_number": (
                            invoice.invoice_number
                        ),
                        "fee_category": (
                            fee_structure.fee_category.name
                        ),
                        "amount": invoice.amount,
                        "balance": invoice.balance,
                        "status": invoice.status,
                    }
                )

        return Response(
            {
                "message": (
                    "Invoice generation completed."
                ),
                "created_count": len(
                    created_invoices
                ),
                "skipped_count": len(
                    skipped_invoices
                ),
                "created_invoices": created_invoices,
                "skipped_invoices": skipped_invoices,
            },
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# EXPENSE CATEGORIES
# ============================================================

class ExpenseCategoryListCreateView(
    SchoolDataMixin,
    generics.ListCreateAPIView,
):

    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return self.filter_school_param(
            expense_categories_visible_to(self.request.user)
        )


class ExpenseCategoryDetailView(
    SchoolDataMixin,
    generics.RetrieveUpdateDestroyAPIView,
):

    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return expense_categories_visible_to(
            self.request.user
        )


# ============================================================
# EXPENSES
# ============================================================

class ExpenseListCreateView(
    SchoolDataMixin,
    generics.ListCreateAPIView,
):

    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return self.filter_school_param(
            expenses_visible_to(self.request.user)
        )


class ExpenseDetailView(
    SchoolDataMixin,
    generics.RetrieveUpdateDestroyAPIView,
):

    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return expenses_visible_to(
            self.request.user
        )


# ============================================================
# EXPENSE SUMMARY
# ============================================================

class ExpenseSummaryView(
    generics.GenericAPIView
):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        if user.role not in STAFF_ROLES:
            return Response(
                {
                    "detail": (
                        "You do not have permission "
                        "to access the expense summary."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        expenses = expenses_visible_to(
            user
        )

        total_expenses = (
            expenses.filter(
                status=Expense.Status.PAID
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        pending_expenses = (
            expenses.filter(
                status=Expense.Status.PENDING
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        cancelled_expenses = (
            expenses.filter(
                status=Expense.Status.CANCELLED
            )
            .aggregate(
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


# ============================================================
# FINANCE DASHBOARD
# ============================================================

class FinanceDashboardView(
    generics.GenericAPIView
):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        if user.role not in STAFF_ROLES:
            return Response(
                {
                    "detail": (
                        "You do not have permission "
                        "to access the finance dashboard."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        invoices = invoices_visible_to(
            user
        )

        expenses = expenses_visible_to(
            user
        )

        # -----------------------------------------------------
        # INCOME
        # -----------------------------------------------------

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

        # -----------------------------------------------------
        # EXPENSES
        # -----------------------------------------------------

        total_expenses = (
            expenses.filter(
                status=Expense.Status.PAID
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        pending_expenses = (
            expenses.filter(
                status=Expense.Status.PENDING
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        net_balance = (
            total_collected
            - total_expenses
        )

        # -----------------------------------------------------
        # INVOICE COUNTS
        # -----------------------------------------------------

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


# =========================================================
# FINANCIAL REPORT
# =========================================================

class FinancialSummaryReportView(
    SchoolDataMixin,
    generics.GenericAPIView,
):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role not in FINANCE_VIEW_ROLES:
            return Response(
                {
                    "detail": (
                        "You do not have permission to access "
                        "the financial report."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        invoices = filter_invoices_by_school(
            invoices_visible_to(user),
            request,
        )

        expenses = self.filter_school_param(
            expenses_visible_to(user)
        )

        # -------------------------------------------------
        # DATE FILTERS
        # -------------------------------------------------

        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")

        if date_from:
            try:
                date_from = datetime.strptime(
                    date_from,
                    "%Y-%m-%d",
                ).date()
            except ValueError:
                return Response(
                    {
                        "date_from": (
                            "Use the format YYYY-MM-DD."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            invoices = invoices.filter(
                created_at__date__gte=date_from
            )

            expenses = expenses.filter(
                expense_date__gte=date_from
            )

        if date_to:
            try:
                date_to = datetime.strptime(
                    date_to,
                    "%Y-%m-%d",
                ).date()
            except ValueError:
                return Response(
                    {
                        "date_to": (
                            "Use the format YYYY-MM-DD."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            invoices = invoices.filter(
                created_at__date__lte=date_to
            )

            expenses = expenses.filter(
                expense_date__lte=date_to
            )

        if date_from and date_to and date_from > date_to:
            return Response(
                {
                    "detail": (
                        "date_from cannot be later than date_to."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -------------------------------------------------
        # INCOME
        # -------------------------------------------------

        active_invoices = invoices.exclude(
            status=StudentInvoice.Status.CANCELLED
        )

        total_invoiced = (
            active_invoices.aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        total_discounts = (
            active_invoices.aggregate(
                total=Sum("discount")
            )["total"]
            or Decimal("0.00")
        )

        net_invoiced = (
            total_invoiced - total_discounts
        )

        successful_payments = Payment.objects.filter(
            invoice__in=active_invoices,
            status=Payment.Status.SUCCESSFUL,
        )

        total_collected = (
            successful_payments.aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        total_outstanding = (
            active_invoices.aggregate(
                total=Sum("balance")
            )["total"]
            or Decimal("0.00")
        )

        if net_invoiced > 0:
            collection_rate = (
                (
                    total_collected
                    / net_invoiced
                )
                * Decimal("100")
            ).quantize(
                Decimal("0.01")
            )
        else:
            collection_rate = Decimal("0.00")

        # -------------------------------------------------
        # EXPENSES
        # -------------------------------------------------

        total_expenses = (
            expenses
            .filter(status=Expense.Status.PAID)
            .aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        pending_expenses = (
            expenses
            .filter(status=Expense.Status.PENDING)
            .aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        cancelled_expenses = (
            expenses
            .filter(status=Expense.Status.CANCELLED)
            .aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        net_balance = (
            total_collected - total_expenses
        )

        # -------------------------------------------------
        # COUNTS
        # -------------------------------------------------

        invoice_count = active_invoices.count()

        paid_invoice_count = invoices.filter(
            status=StudentInvoice.Status.PAID
        ).count()

        partial_invoice_count = invoices.filter(
            status=StudentInvoice.Status.PARTIAL
        ).count()

        unpaid_invoice_count = invoices.filter(
            status=StudentInvoice.Status.UNPAID
        ).count()

        overdue_invoice_count = invoices.filter(
            status=StudentInvoice.Status.OVERDUE
        ).count()

        successful_payment_count = (
            successful_payments.count()
        )

        expense_count = expenses.count()

        paid_expense_count = expenses.filter(
            status=Expense.Status.PAID
        ).count()

        pending_expense_count = expenses.filter(
            status=Expense.Status.PENDING
        ).count()

        cancelled_expense_count = expenses.filter(
            status=Expense.Status.CANCELLED
        ).count()

        return Response(
            {
                "filters": {
                    "date_from": (
                        date_from.isoformat()
                        if date_from
                        else None
                    ),
                    "date_to": (
                        date_to.isoformat()
                        if date_to
                        else None
                    ),
                },
                "income": {
                    "total_invoiced": total_invoiced,
                    "total_discounts": total_discounts,
                    "net_invoiced": net_invoiced,
                    "total_collected": total_collected,
                    "total_outstanding": total_outstanding,
                    "collection_rate": collection_rate,
                },
                "expenses": {
                    "total_expenses": total_expenses,
                    "pending_expenses": pending_expenses,
                    "cancelled_expenses": cancelled_expenses,
                },
                "net_balance": net_balance,
                "counts": {
                    "invoice_count": invoice_count,
                    "paid_invoice_count": paid_invoice_count,
                    "partial_invoice_count": partial_invoice_count,
                    "unpaid_invoice_count": unpaid_invoice_count,
                    "overdue_invoice_count": overdue_invoice_count,
                    "successful_payment_count": (
                        successful_payment_count
                    ),
                    "expense_count": expense_count,
                    "paid_expense_count": paid_expense_count,
                    "pending_expense_count": (
                        pending_expense_count
                    ),
                    "cancelled_expense_count": (
                        cancelled_expense_count
                    ),
                },
            }
        )


# =========================================================
# INCOME REPORT
# =========================================================

class IncomeReportView(
    SchoolDataMixin,
    generics.GenericAPIView,
):
    """
    Provides a detailed income report based on student invoices
    and successful payments.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role not in FINANCE_VIEW_ROLES:
            return Response(
                {
                    "detail": (
                        "You do not have permission to "
                        "access the income report."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # -------------------------------------------------
        # BASE QUERYSET
        # -------------------------------------------------

        invoices = filter_invoices_by_school(
            invoices_visible_to(user),
            request,
        ).exclude(
            status=StudentInvoice.Status.CANCELLED
        )

        # -------------------------------------------------
        # INVOICE TOTALS
        # -------------------------------------------------

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

        net_invoiced = (
            total_invoiced - total_discounts
        )

        total_outstanding = (
            invoices.aggregate(
                total=Sum("balance")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # PAYMENT TOTALS
        # -------------------------------------------------

        successful_payments = Payment.objects.filter(
            invoice__in=invoices,
            status=Payment.Status.SUCCESSFUL,
        )

        total_collected = (
            successful_payments.aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # COLLECTION RATE
        # -------------------------------------------------

        if net_invoiced > 0:
            collection_rate = (
                (total_collected / net_invoiced)
                * Decimal("100")
            ).quantize(
                Decimal("0.01")
            )
        else:
            collection_rate = Decimal("0.00")

        # -------------------------------------------------
        # PAYMENT METHOD BREAKDOWN
        # -------------------------------------------------

        payment_method_breakdown = []

        payment_methods = (
            successful_payments
            .values("payment_method")
            .annotate(
                total=Sum("amount"),
                count=Count("id"),
            )
            .order_by("-total")
        )

        for item in payment_methods:
            payment_method_breakdown.append(
                {
                    "payment_method": item["payment_method"],
                    "total": item["total"],
                    "count": item["count"],
                }
            )

        # -------------------------------------------------
        # FEE CATEGORY BREAKDOWN
        # -------------------------------------------------

        fee_category_breakdown = []

        fee_categories = (
            invoices
            .values(
                "fee_category",
                "fee_category__name",
            )
            .annotate(
                total_invoiced=Sum("amount"),
                total_discounts=Sum("discount"),
                total_outstanding=Sum("balance"),
                invoice_count=Count("id"),
            )
            .order_by("-total_invoiced")
        )

        for item in fee_categories:
            category_net = (
                item["total_invoiced"]
                - item["total_discounts"]
            )

            fee_category_breakdown.append(
                {
                    "fee_category_id": item["fee_category"],
                    "fee_category_name": item[
                        "fee_category__name"
                    ],
                    "total_invoiced": item[
                        "total_invoiced"
                    ],
                    "total_discounts": item[
                        "total_discounts"
                    ],
                    "net_invoiced": category_net,
                    "total_outstanding": item[
                        "total_outstanding"
                    ],
                    "invoice_count": item[
                        "invoice_count"
                    ],
                }
            )

        return Response(
            {
                "summary": {
                    "total_invoiced": total_invoiced,
                    "total_discounts": total_discounts,
                    "net_invoiced": net_invoiced,
                    "total_collected": total_collected,
                    "total_outstanding": total_outstanding,
                    "collection_rate": collection_rate,
                },
                "payment_methods": payment_method_breakdown,
                "fee_categories": fee_category_breakdown,
            }
        )


# =========================================================
# EXPENSE REPORT
# =========================================================

class ExpenseReportView(
    SchoolDataMixin,
    generics.GenericAPIView,
):
    """
    Provides a detailed expense report for accountants
    and authorized administrators.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role not in FINANCE_VIEW_ROLES:
            return Response(
                {
                    "detail": (
                        "You do not have permission to "
                        "access the expense report."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # -------------------------------------------------
        # BASE QUERYSET
        # -------------------------------------------------

        expenses = self.filter_school_param(
            expenses_visible_to(user)
        )

        # -------------------------------------------------
        # SUMMARY
        # -------------------------------------------------

        paid_expenses = expenses.filter(
            status=Expense.Status.PAID
        )

        pending_expenses = expenses.filter(
            status=Expense.Status.PENDING
        )

        cancelled_expenses = expenses.filter(
            status=Expense.Status.CANCELLED
        )

        total_expenses = (
            paid_expenses.aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        total_pending = (
            pending_expenses.aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        total_cancelled = (
            cancelled_expenses.aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # -------------------------------------------------
        # EXPENSE CATEGORY BREAKDOWN
        # -------------------------------------------------

        category_breakdown = []

        categories = (
            expenses
            .values(
                "expense_category",
                "expense_category__name",
            )
            .annotate(
                total=Sum("amount"),
                count=Count("id"),
            )
            .order_by("-total")
        )

        for item in categories:
            category_breakdown.append(
                {
                    "expense_category_id": item[
                        "expense_category"
                    ],
                    "expense_category_name": item[
                        "expense_category__name"
                    ],
                    "total": item["total"],
                    "count": item["count"],
                }
            )

        # -------------------------------------------------
        # PAYMENT METHOD BREAKDOWN
        # -------------------------------------------------

        payment_method_breakdown = []

        payment_methods = (
            paid_expenses
            .values("payment_method")
            .annotate(
                total=Sum("amount"),
                count=Count("id"),
            )
            .order_by("-total")
        )

        for item in payment_methods:
            payment_method_breakdown.append(
                {
                    "payment_method": item[
                        "payment_method"
                    ],
                    "total": item["total"],
                    "count": item["count"],
                }
            )

        # -------------------------------------------------
        # EXPENSE STATUS BREAKDOWN
        # -------------------------------------------------

        status_breakdown = [
            {
                "status": Expense.Status.PAID,
                "count": paid_expenses.count(),
                "total": total_expenses,
            },
            {
                "status": Expense.Status.PENDING,
                "count": pending_expenses.count(),
                "total": total_pending,
            },
            {
                "status": Expense.Status.CANCELLED,
                "count": cancelled_expenses.count(),
                "total": total_cancelled,
            },
        ]

        return Response(
            {
                "summary": {
                    "total_expenses": total_expenses,
                    "pending_expenses": total_pending,
                    "cancelled_expenses": total_cancelled,
                    "expense_count": expenses.count(),
                    "paid_expense_count": paid_expenses.count(),
                    "pending_expense_count": pending_expenses.count(),
                    "cancelled_expense_count": cancelled_expenses.count(),
                },
                "categories": category_breakdown,
                "payment_methods": payment_method_breakdown,
                "statuses": status_breakdown,
            }
        )


# =========================================================
# STUDENT FINANCIAL REPORT
# =========================================================

class StudentFinancialReportView(
    SchoolDataMixin,
    generics.GenericAPIView,
):
    """
    Provides a financial report grouped by student.

    Optional query parameters:
        ?school=<id>
        ?academic_session=<id>
        ?term=<id>
        ?student=<id>
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role not in FINANCE_VIEW_ROLES:
            return Response(
                {
                    "detail": (
                        "You do not have permission to "
                        "access the student financial report."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # -------------------------------------------------
        # BASE INVOICES
        # -------------------------------------------------

        invoices = filter_invoices_by_school(
            invoices_visible_to(user),
            request,
        ).exclude(
            status=StudentInvoice.Status.CANCELLED
        )

        # -------------------------------------------------
        # OPTIONAL FILTERS
        # -------------------------------------------------

        academic_session = request.query_params.get(
            "academic_session"
        )

        term = request.query_params.get("term")

        student = request.query_params.get("student")

        if academic_session:
            try:
                academic_session = int(
                    academic_session
                )
            except (TypeError, ValueError):
                return Response(
                    {
                        "academic_session": (
                            "academic_session must be a valid ID."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            invoices = invoices.filter(
                academic_session_id=academic_session
            )

        if term:
            try:
                term = int(term)
            except (TypeError, ValueError):
                return Response(
                    {
                        "term": "term must be a valid ID."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            invoices = invoices.filter(
                term_id=term
            )

        if student:
            try:
                student = int(student)
            except (TypeError, ValueError):
                return Response(
                    {
                        "student": (
                            "student must be a valid ID."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            invoices = invoices.filter(
                student_id=student
            )

        # -------------------------------------------------
        # GROUP INVOICES BY STUDENT
        # -------------------------------------------------

        student_rows = (
            invoices
            .values("student_id")
            .annotate(
                total_invoiced=Sum("amount"),
                total_discounts=Sum("discount"),
                total_outstanding=Sum("balance"),
                invoice_count=Count("id"),
            )
            .order_by("student_id")
        )

        # -------------------------------------------------
        # SUCCESSFUL PAYMENTS
        # -------------------------------------------------

        successful_payments = (
            Payment.objects.filter(
                invoice__in=invoices,
                status=Payment.Status.SUCCESSFUL,
            )
            .values("invoice__student_id")
            .annotate(
                total_collected=Sum("amount"),
                successful_payment_count=Count("id"),
            )
        )

        payment_map = {
            item["invoice__student_id"]: item
            for item in successful_payments
        }

        # -------------------------------------------------
        # STUDENT DETAILS
        # -------------------------------------------------

        student_ids = [
            item["student_id"]
            for item in student_rows
        ]

        students = Student.objects.filter(
            id__in=student_ids
        )

        student_map = {
            student.id: student
            for student in students
        }

        # -------------------------------------------------
        # BUILD RESPONSE
        # -------------------------------------------------

        results = []

        for item in student_rows:
            student_id = item["student_id"]

            total_invoiced = (
                item["total_invoiced"]
                or Decimal("0.00")
            )

            total_discounts = (
                item["total_discounts"]
                or Decimal("0.00")
            )

            total_outstanding = (
                item["total_outstanding"]
                or Decimal("0.00")
            )

            net_invoiced = (
                total_invoiced - total_discounts
            )

            payment_data = payment_map.get(
                student_id,
                {}
            )

            total_collected = (
                payment_data.get("total_collected")
                or Decimal("0.00")
            )

            successful_payment_count = (
                payment_data.get(
                    "successful_payment_count",
                    0
                )
            )

            student_obj = student_map.get(
                student_id
            )

            if student_obj:
                student_name = str(student_obj)
            else:
                student_name = ""

            results.append(
                {
                    "student_id": student_id,
                    "student_name": student_name,
                    "total_invoiced": total_invoiced,
                    "total_discounts": total_discounts,
                    "net_invoiced": net_invoiced,
                    "total_collected": total_collected,
                    "total_outstanding": total_outstanding,
                    "invoice_count": item[
                        "invoice_count"
                    ],
                    "successful_payment_count": (
                        successful_payment_count
                    ),
                }
            )

        # -------------------------------------------------
        # REPORT TOTALS
        # -------------------------------------------------

        total_invoiced = sum(
            item["total_invoiced"]
            for item in results
        )

        total_discounts = sum(
            item["total_discounts"]
            for item in results
        )

        net_invoiced = sum(
            item["net_invoiced"]
            for item in results
        )

        total_collected = sum(
            item["total_collected"]
            for item in results
        )

        total_outstanding = sum(
            item["total_outstanding"]
            for item in results
        )

        return Response(
            {
                "summary": {
                    "total_invoiced": total_invoiced,
                    "total_discounts": total_discounts,
                    "net_invoiced": net_invoiced,
                    "total_collected": total_collected,
                    "total_outstanding": total_outstanding,
                    "student_count": len(results),
                    "invoice_count": invoices.count(),
                },
                "students": results,
            }
        )

# ============================================================
# PAYMENT INITIATION
# ============================================================

class PaymentInitiateView(
    generics.GenericAPIView
):

    serializer_class = PaymentInitiateSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, *args, **kwargs):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        invoice_id = serializer.validated_data[
            "invoice"
        ]

        requested_amount = (
            serializer.validated_data["amount"]
        )

        gateway = serializer.validated_data[
            "gateway"
        ]

        # ------------------------------------------------
        # Lock ONLY the StudentInvoice row.
        #
        # Do NOT combine select_for_update() with
        # select_related("student__user") here: PostgreSQL
        # does not allow FOR UPDATE on the nullable side of an
        # OUTER JOIN.
        # ------------------------------------------------

        invoice = get_object_or_404(
            StudentInvoice.objects.select_for_update(),
            pk=invoice_id,
        )

        # ------------------------------------------------
        # Load related objects AFTER locking.
        # ------------------------------------------------

        invoice = (
            StudentInvoice.objects
            .select_related(
                "student",
                "student__user",
                "fee_category",
                "academic_session",
                "term",
            )
            .get(pk=invoice.pk)
        )

        student = invoice.student
        user = request.user

        # ------------------------------------------------
        # Invoice must not be cancelled.
        # ------------------------------------------------

        if invoice.status == (
            StudentInvoice.Status.CANCELLED
        ):

            return Response(
                {
                    "detail": (
                        "This invoice has been cancelled "
                        "and cannot receive payments."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ------------------------------------------------
        # Determine payer.
        # ------------------------------------------------

        payer_type = None

        if student.user_id == user.id:

            payer_type = Payment.PayerType.STUDENT

        else:

            is_parent = student.parents.filter(
                user_id=user.id
            ).exists()

            if is_parent:
                payer_type = Payment.PayerType.PARENT

        # ------------------------------------------------
        # Reject unrelated users.
        # ------------------------------------------------

        if not payer_type:

            return Response(
                {
                    "detail": (
                        "You are not authorized to make "
                        "a payment for this invoice."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # ------------------------------------------------
        # Invoice total.
        # ------------------------------------------------

        invoice_total = (
            invoice.amount
            - invoice.discount
        )

        # ------------------------------------------------
        # Successful payments.
        # ------------------------------------------------

        successful_paid = (
            Payment.objects.filter(
                invoice=invoice,
                status=Payment.Status.SUCCESSFUL,
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # ------------------------------------------------
        # Pending payments reserve part of the balance so a
        # second payment cannot exceed it.
        # ------------------------------------------------

        pending_amount = (
            Payment.objects.filter(
                invoice=invoice,
                status=Payment.Status.PENDING,
            )
            .aggregate(
                total=Sum("amount")
            )["total"]
            or Decimal("0.00")
        )

        # ------------------------------------------------
        # Available balance.
        # ------------------------------------------------

        remaining_balance = (
            invoice_total
            - successful_paid
            - pending_amount
        )

        if remaining_balance < Decimal("0.00"):

            remaining_balance = Decimal("0.00")

        if remaining_balance <= Decimal("0.00"):

            return Response(
                {
                    "detail": (
                        "This invoice has no available "
                        "balance for a new payment."
                    ),
                    "invoice": invoice.invoice_number,
                    "invoice_total": str(
                        invoice_total
                    ),
                    "amount_paid": str(
                        successful_paid
                    ),
                    "pending_amount": str(
                        pending_amount
                    ),
                    "available_balance": "0.00",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if requested_amount > remaining_balance:

            return Response(
                {
                    "detail": (
                        "Payment amount exceeds the "
                        "available invoice balance."
                    ),
                    "requested_amount": str(
                        requested_amount
                    ),
                    "available_balance": str(
                        remaining_balance
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ------------------------------------------------
        # Internal payment reference.
        # ------------------------------------------------

        reference = (
            f"EDU-{uuid.uuid4().hex[:16].upper()}"
        )

        # ------------------------------------------------
        # Create the PENDING payment.
        # ------------------------------------------------

        payment = Payment.objects.create(
            invoice=invoice,
            payer_user=user,
            payer_type=payer_type,
            reference=reference,
            amount=requested_amount,
            payment_method=(
                Payment.PaymentMethod.ONLINE
            ),
            status=Payment.Status.PENDING,
            gateway=gateway,
        )

        # ------------------------------------------------
        # Paystack initialization.
        # ------------------------------------------------

        paystack_data = None

        if gateway == Payment.Gateway.PAYSTACK:

            try:

                paystack_data = (
                    initialize_paystack_transaction(
                        payment,
                        request,
                    )
                )

            except Exception as exc:

                # Delete the pending payment so it does not keep
                # reserving the invoice balance.
                payment.delete()

                return Response(
                    {
                        "detail": (
                            "Unable to initialize "
                            "Paystack payment."
                        ),
                        "error": str(exc),
                    },
                    status=status.HTTP_502_BAD_GATEWAY,
                )

        payment.refresh_from_db()

        response_data = {
            "message": (
                "Payment initiated successfully."
            ),

            "payment": PaymentSerializer(
                payment
            ).data,

            "invoice": {
                "id": invoice.id,
                "invoice_number": (
                    invoice.invoice_number
                ),
                "amount": str(
                    invoice_total
                ),
                "amount_paid": str(
                    successful_paid
                ),
                "pending_amount": str(
                    pending_amount
                    + requested_amount
                ),
                "balance": str(
                    remaining_balance
                    - requested_amount
                ),
            },

            "payer": {
                "type": payer_type,
                "user_id": user.id,
                "username": user.username,
            },

            "gateway": gateway,

            "reference": reference,
        }

        if paystack_data:

            response_data["paystack"] = {
                "authorization_url": (
                    paystack_data[
                        "authorization_url"
                    ]
                ),

                "access_code": (
                    paystack_data[
                        "access_code"
                    ]
                ),

                "reference": (
                    paystack_data[
                        "reference"
                    ]
                ),

                "amount": str(
                    paystack_data["amount"]
                ),

                "amount_in_kobo": (
                    paystack_data[
                        "amount_in_kobo"
                    ]
                ),

                "callback_url": (
                    paystack_data.get(
                        "callback_url"
                    )
                ),
            }

        return Response(
            response_data,
            status=status.HTTP_201_CREATED,
        )


# ============================================================
# PAYSTACK VERIFY
# ============================================================


class PaystackVerifyView(
    generics.GenericAPIView
):

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def get(self, request, reference):

        payment = get_object_or_404(
            Payment.objects.select_for_update().select_related(
                "invoice",
                "invoice__student",
            ),
            reference=reference,
        )

        student = payment.invoice.student
        user = request.user

        is_student = (
            student.user_id == user.id
        )

        is_parent = student.parents.filter(
            user_id=user.id
        ).exists()

        if not is_student and not is_parent:

            raise PermissionDenied(
                "You are not authorized to verify this payment."
            )

        if payment.gateway != (
            Payment.Gateway.PAYSTACK
        ):

            return Response(
                {
                    "detail": (
                        "This payment was not created "
                        "through Paystack."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if payment.status == (
            Payment.Status.SUCCESSFUL
        ):

            return Response({
                "message": (
                    "Payment has already been verified."
                ),
                "payment": PaymentSerializer(
                    payment
                ).data,
                "invoice": {
                    "id": payment.invoice.id,
                    "invoice_number": (
                        payment.invoice.invoice_number
                    ),
                    "amount_paid": str(
                        payment.invoice.amount_paid
                    ),
                    "balance": str(
                        payment.invoice.balance
                    ),
                    "status": (
                        payment.invoice.status
                    ),
                },
            })

        secret_key = getattr(
            settings,
            "PAYSTACK_SECRET_KEY",
            "",
        )

        if not secret_key:

            return Response(
                {
                    "detail": (
                        "Paystack secret key is not configured."
                    )
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        import requests

        try:

            paystack_response = requests.get(
                (
                    "https://api.paystack.co/"
                    f"transaction/verify/{payment.reference}"
                ),
                headers={
                    "Authorization": (
                        f"Bearer {secret_key}"
                    ),
                    "Content-Type": (
                        "application/json"
                    ),
                },
                timeout=30,
            )

            response_data = (
                paystack_response.json()
            )

        except Exception as exc:

            return Response(
                {
                    "detail": (
                        "Unable to verify payment "
                        "with Paystack."
                    ),
                    "error": str(exc),
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        if (
            paystack_response.status_code >= 400
            or not response_data.get("status")
        ):

            return Response(
                {
                    "detail": (
                        response_data.get(
                            "message"
                        )
                        or "Paystack verification failed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        paystack_data = response_data.get(
            "data"
        ) or {}

        paystack_status = paystack_data.get(
            "status"
        )

        # ==================================================
        # SUCCESSFUL PAYMENT
        # ==================================================

        if paystack_status == "success":

            returned_reference = (
                paystack_data.get("reference")
            )

            if returned_reference != payment.reference:

                return Response(
                    {
                        "detail": (
                            "Paystack reference does not "
                            "match this payment."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            currency = paystack_data.get(
                "currency"
            )

            if currency != "NGN":

                return Response(
                    {
                        "detail": (
                            "Paystack returned an "
                            "unexpected currency."
                        ),
                        "currency": currency,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            returned_amount = (
                paystack_data.get("amount")
            )

            expected_amount = int(
                payment.amount
                * Decimal("100")
            )

            if returned_amount != expected_amount:

                return Response(
                    {
                        "detail": (
                            "The Paystack payment amount "
                            "does not match the invoice payment."
                        ),
                        "expected_amount": expected_amount,
                        "returned_amount": returned_amount,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            payment = (
                mark_paystack_payment_successful(
                    payment,
                    paystack_data,
                )
            )

            return Response({
                "message": (
                    "Payment verified successfully."
                ),

                "payment": PaymentSerializer(
                    payment
                ).data,

                "invoice": {
                    "id": payment.invoice.id,
                    "invoice_number": (
                        payment.invoice.invoice_number
                    ),
                    "amount_paid": str(
                        payment.invoice.amount_paid
                    ),
                    "balance": str(
                        payment.invoice.balance
                    ),
                    "status": (
                        payment.invoice.status
                    ),
                },
            })

        # ==================================================
        # FAILED / ABANDONED PAYMENT
        # ==================================================

        if paystack_status in {
            "failed",
            "abandoned",
            "reversed",
        }:

            payment = (
                mark_paystack_payment_failed(
                    payment,
                    paystack_data,
                )
            )

            return Response(
                {
                    "message": (
                        "Paystack payment is not successful "
                        "and has been released."
                    ),
                    "paystack_status": paystack_status,
                    "payment": PaymentSerializer(
                        payment
                    ).data,
                    "invoice": {
                        "id": payment.invoice.id,
                        "invoice_number": (
                            payment.invoice.invoice_number
                        ),
                        "amount_paid": str(
                            payment.invoice.amount_paid
                        ),
                        "balance": str(
                            payment.invoice.balance
                        ),
                        "status": (
                            payment.invoice.status
                        ),
                    },
                },
                status=status.HTTP_200_OK,
            )

        # ==================================================
        # STILL PROCESSING
        # ==================================================

        return Response(
            {
                "message": (
                    "Paystack has not completed this "
                    "payment yet."
                ),
                "paystack_status": paystack_status,
                "payment": PaymentSerializer(
                    payment
                ).data,
                "invoice": {
                    "id": payment.invoice.id,
                    "invoice_number": (
                        payment.invoice.invoice_number
                    ),
                    "amount_paid": str(
                        payment.invoice.amount_paid
                    ),
                    "balance": str(
                        payment.invoice.balance
                    ),
                    "status": (
                        payment.invoice.status
                    ),
                },
            },
            status=status.HTTP_200_OK,
        )

# ============================================================
# PAYSTACK WEBHOOK
# ============================================================

class PaystackWebhookView(
    generics.GenericAPIView
):

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):

        secret_key = getattr(
            settings,
            "PAYSTACK_SECRET_KEY",
            "",
        )

        if not secret_key:

            return Response(
                {
                    "detail": (
                        "Paystack secret key is not configured."
                    )
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        raw_body = request.body

        received_signature = (
            request.headers.get(
                "X-Paystack-Signature"
            )
        )

        if not received_signature:

            return Response(
                {
                    "detail": (
                        "Missing Paystack signature."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        expected_signature = hmac.new(
            secret_key.encode("utf-8"),
            raw_body,
            hashlib.sha512,
        ).hexdigest()

        if not hmac.compare_digest(
            received_signature,
            expected_signature,
        ):

            return Response(
                {
                    "detail": (
                        "Invalid Paystack signature."
                    )
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:

            payload = json.loads(
                raw_body.decode("utf-8")
            )

        except (
            json.JSONDecodeError,
            UnicodeDecodeError,
        ):

            return Response(
                {
                    "detail": (
                        "Invalid webhook payload."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        event = payload.get(
            "event"
        )

        if event != "charge.success":

            return Response(
                {
                    "message": (
                        "Webhook received."
                    )
                },
                status=status.HTTP_200_OK,
            )

        paystack_data = (
            payload.get("data")
            or {}
        )

        reference = paystack_data.get(
            "reference"
        )

        if not reference:

            return Response(
                {
                    "detail": (
                        "Webhook does not contain "
                        "a payment reference."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:

            payment = Payment.objects.select_related(
                "invoice",
                "invoice__student",
            ).get(
                reference=reference,
                gateway=Payment.Gateway.PAYSTACK,
            )

        except Payment.DoesNotExist:

            # Returning 200 stops Paystack from retrying a
            # webhook for an unknown transaction.
            return Response(
                {
                    "message": (
                        "Payment reference not found."
                    )
                },
                status=status.HTTP_200_OK,
            )

        if payment.status == (
            Payment.Status.SUCCESSFUL
        ):

            return Response(
                {
                    "message": (
                        "Payment already processed."
                    )
                },
                status=status.HTTP_200_OK,
            )

        if paystack_data.get(
            "currency"
        ) != "NGN":

            return Response(
                {
                    "detail": (
                        "Unexpected payment currency."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        expected_amount = int(
            payment.amount
            * Decimal("100")
        )

        returned_amount = paystack_data.get(
            "amount"
        )

        if returned_amount != expected_amount:

            return Response(
                {
                    "detail": (
                        "Payment amount does not "
                        "match our records."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():

            payment = (
                Payment.objects.select_for_update()
                .select_related(
                    "invoice",
                    "invoice__student",
                )
                .get(
                    id=payment.id
                )
            )

            if payment.status != (
                Payment.Status.SUCCESSFUL
            ):

                mark_paystack_payment_successful(
                    payment,
                    paystack_data,
                )

        return Response(
            {
                "message": (
                    "Payment processed successfully."
                )
            },
            status=status.HTTP_200_OK,
        )