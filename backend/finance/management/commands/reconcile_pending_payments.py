
from datetime import timedelta
from decimal import Decimal

import requests

from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from finance.models import Payment
from finance.services import (
    mark_paystack_payment_failed,
    mark_paystack_payment_successful,
)


class Command(BaseCommand):
    help = (
        "Reconcile Paystack payments that have remained pending "
        "for 30 minutes or longer."
    )

    PENDING_MINUTES = 30

    def handle(self, *args, **options):
        secret_key = getattr(settings, "PAYSTACK_SECRET_KEY", "")

        if not secret_key:
            self.stdout.write(
                self.style.ERROR(
                    "PAYSTACK_SECRET_KEY is not configured."
                )
            )
            return

        cutoff_time = timezone.now() - timedelta(
            minutes=self.PENDING_MINUTES
        )

        payments = (
            Payment.objects
            .filter(
                gateway=Payment.Gateway.PAYSTACK,
                status=Payment.Status.PENDING,
                created_at__lte=cutoff_time,
            )
            .exclude(gateway_reference="")
            .order_by("created_at")
        )

        total = payments.count()

        if total == 0:
            self.stdout.write(
                self.style.SUCCESS(
                    "No Paystack payments require reconciliation."
                )
            )
            return

        self.stdout.write(
            f"Found {total} Paystack payment(s) "
            f"pending for at least {self.PENDING_MINUTES} minutes."
        )

        for payment in payments:
            self.reconcile_payment(
                payment=payment,
                secret_key=secret_key,
            )

    def reconcile_payment(self, payment, secret_key):
        reference = payment.gateway_reference

        try:
            response = requests.get(
                f"https://api.paystack.co/transaction/verify/{reference}",
                headers={
                    "Authorization": f"Bearer {secret_key}",
                    "Content-Type": "application/json",
                },
                timeout=30,
            )

            try:
                response_data = response.json()
            except ValueError:
                response_data = {}

        except requests.RequestException as exc:
            self.stdout.write(
                self.style.WARNING(
                    f"Payment {payment.reference}: "
                    f"Paystack request failed: {exc}"
                )
            )
            return

        if response.status_code >= 400:
            self.stdout.write(
                self.style.WARNING(
                    f"Payment {payment.reference}: "
                    f"Paystack returned HTTP {response.status_code}: "
                    f"{response_data.get('message', 'Unknown error')}"
                )
            )
            return

        if not response_data.get("status"):
            self.stdout.write(
                self.style.WARNING(
                    f"Payment {payment.reference}: "
                    f"Paystack verification failed: "
                    f"{response_data.get('message', 'Unknown error')}"
                )
            )
            return

        paystack_data = response_data.get("data") or {}

        paystack_status = (
            paystack_data.get("status") or ""
        ).lower()

        returned_reference = paystack_data.get("reference")

        if returned_reference != reference:
            self.stdout.write(
                self.style.WARNING(
                    f"Payment {payment.reference}: "
                    "Paystack reference mismatch."
                )
            )
            return

        currency = paystack_data.get("currency")

        if currency != "NGN":
            self.stdout.write(
                self.style.WARNING(
                    f"Payment {payment.reference}: "
                    f"Unexpected currency: {currency}"
                )
            )
            return

        returned_amount = paystack_data.get("amount")

        expected_amount = int(
            Decimal(str(payment.amount)) * Decimal("100")
        )

        if returned_amount != expected_amount:
            self.stdout.write(
                self.style.WARNING(
                    f"Payment {payment.reference}: "
                    f"Amount mismatch. "
                    f"Expected {expected_amount}, "
                    f"Paystack returned {returned_amount}."
                )
            )
            return

        if paystack_status == "success":
            self.mark_successful(
                payment_id=payment.id,
                paystack_data=paystack_data,
            )
            return

        if paystack_status in {
            "failed",
            "abandoned",
            "reversed",
        }:
            self.mark_failed(
                payment_id=payment.id,
                paystack_data=paystack_data,
            )
            return

        if paystack_status in {
            "pending",
            "ongoing",
            "processing",
            "queued",
        }:
            self.stdout.write(
                self.style.WARNING(
                    f"Payment {payment.reference}: "
                    f"still active on Paystack "
                    f"({paystack_status}). "
                    "Keeping PENDING."
                )
            )
            return

        self.stdout.write(
            self.style.WARNING(
                f"Payment {payment.reference}: "
                f"unknown Paystack status "
                f"'{paystack_status}'. "
                "Keeping PENDING."
            )
        )

    def mark_successful(self, payment_id, paystack_data):
        with transaction.atomic():
            payment = (
                Payment.objects
                .select_for_update()
                .select_related("invoice")
                .get(pk=payment_id)
            )

            if payment.status != Payment.Status.PENDING:
                return

            mark_paystack_payment_successful(
                payment,
                paystack_data,
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Payment {payment.reference} marked SUCCESSFUL."
            )
        )

    def mark_failed(self, payment_id, paystack_data):
        with transaction.atomic():
            payment = (
                Payment.objects
                .select_for_update()
                .select_related("invoice")
                .get(pk=payment_id)
            )

            if payment.status != Payment.Status.PENDING:
                return

            mark_paystack_payment_failed(
                payment,
                paystack_data,
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Payment {payment.reference} marked FAILED."
            )
        )

