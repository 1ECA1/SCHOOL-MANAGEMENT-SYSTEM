from django.contrib import admin

from .models import (
    FeeCategory,
    FeeStructure,
    StudentInvoice,
    Payment,
    Scholarship,
)


@admin.register(FeeCategory)
class FeeCategoryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "school",
        "is_mandatory",
        "is_active",
        "created_at",
    )

    search_fields = (
        "name",
        "description",
    )

    list_filter = (
        "school",
        "is_mandatory",
        "is_active",
    )


@admin.register(FeeStructure)
class FeeStructureAdmin(admin.ModelAdmin):
    list_display = (
        "class_level",
        "fee_category",
        "academic_session",
        "term",
        "amount",
        "due_date",
        "is_active",
    )

    search_fields = (
        "class_level__name",
        "fee_category__name",
    )

    list_filter = (
        "school",
        "academic_session",
        "term",
        "class_level",
        "fee_category",
        "is_active",
    )

    date_hierarchy = "due_date"


@admin.register(StudentInvoice)
class StudentInvoiceAdmin(admin.ModelAdmin):
    list_display = (
        "invoice_number",
        "student",
        "fee_category",
        "academic_session",
        "term",
        "amount",
        "discount",
        "amount_paid",
        "balance",
        "status",
        "due_date",
    )

    search_fields = (
        "invoice_number",
        "student__first_name",
        "student__last_name",
        "student__admission_number",
    )

    list_filter = (
        "academic_session",
        "term",
        "fee_category",
        "status",
        "due_date",
    )

    date_hierarchy = "due_date"

    ordering = (
        "-created_at",
    )


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "reference",
        "invoice",
        "amount",
        "payment_method",
        "status",
        "payment_date",
        "transaction_id",
    )

    search_fields = (
        "reference",
        "transaction_id",
        "invoice__invoice_number",
        "invoice__student__first_name",
        "invoice__student__last_name",
        "invoice__student__admission_number",
    )

    list_filter = (
        "payment_method",
        "status",
        "payment_date",
    )

    date_hierarchy = "payment_date"

    ordering = (
        "-payment_date",
    )


@admin.register(Scholarship)
class ScholarshipAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "name",
        "percentage",
        "fixed_amount",
        "start_date",
        "end_date",
        "is_active",
    )

    search_fields = (
        "student__first_name",
        "student__last_name",
        "student__admission_number",
        "name",
        "reason",
    )

    list_filter = (
        "is_active",
        "start_date",
        "end_date",
    )

    date_hierarchy = "start_date"