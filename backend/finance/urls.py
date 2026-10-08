from django.urls import path

from .views import (
    AccountantProfileView,
    AccountantCreateView,

    FeeCategoryListCreateView,
    FeeCategoryDetailView,

    FeeStructureListCreateView,
    FeeStructureDetailView,

    StudentInvoiceListCreateView,
    StudentInvoiceDetailView,

    PaymentListCreateView,
    PaymentDetailView,
    PaymentInitiateView,
    PaymentReceiptView,

    PaystackVerifyView,
    PaystackWebhookView,

    ScholarshipListCreateView,
    ScholarshipDetailView,
    ScholarshipApplyView,

    FinanceSummaryView,
    StudentFinancialStatementView,
    GenerateInvoicesView,

    ExpenseCategoryListCreateView,
    ExpenseCategoryDetailView,
    ExpenseListCreateView,
    ExpenseDetailView,
    ExpenseSummaryView,
    FinanceDashboardView,

    FinancialSummaryReportView,
    IncomeReportView,
    ExpenseReportView,
    StudentFinancialReportView,
)


urlpatterns = [

    # =====================================================
    # ACCOUNTANT
    # =====================================================

    path(
        "accountants/",
        AccountantCreateView.as_view(),
        name="accountant-create",
    ),

    path(
        "profile/",
        AccountantProfileView.as_view(),
        name="accountant-profile",
    ),

    # =====================================================
    # FEE CATEGORIES
    # =====================================================

    path(
        "fee-categories/",
        FeeCategoryListCreateView.as_view(),
        name="fee-category-list-create",
    ),

    path(
        "fee-categories/<int:pk>/",
        FeeCategoryDetailView.as_view(),
        name="fee-category-detail",
    ),

    # =====================================================
    # FEE STRUCTURES
    # =====================================================

    path(
        "fee-structures/",
        FeeStructureListCreateView.as_view(),
        name="fee-structure-list-create",
    ),

    path(
        "fee-structures/<int:pk>/",
        FeeStructureDetailView.as_view(),
        name="fee-structure-detail",
    ),

    # =====================================================
    # STUDENT INVOICES
    # =====================================================

    path(
        "invoices/",
        StudentInvoiceListCreateView.as_view(),
        name="invoice-list-create",
    ),

    path(
        "invoices/<int:pk>/",
        StudentInvoiceDetailView.as_view(),
        name="invoice-detail",
    ),

    # =====================================================
    # PAYMENTS
    # =====================================================

    path(
        "payments/initiate/",
        PaymentInitiateView.as_view(),
        name="payment-initiate",
    ),

    path(
        "payments/",
        PaymentListCreateView.as_view(),
        name="payment-list-create",
    ),

    path(
        "payments/<int:pk>/",
        PaymentDetailView.as_view(),
        name="payment-detail",
    ),

    path(
    "payments/<int:pk>/receipt/",
    PaymentReceiptView.as_view(),
    name="payment-receipt",
),

    # =====================================================
    # PAYSTACK
    # =====================================================

    path(
        "payments/paystack/verify/<str:reference>/",
        PaystackVerifyView.as_view(),
        name="paystack-verify",
    ),

    path(
        "payments/paystack/webhook/",
        PaystackWebhookView.as_view(),
        name="paystack-webhook",
    ),

    # =====================================================
    # SCHOLARSHIPS
    # =====================================================

    path(
        "scholarships/",
        ScholarshipListCreateView.as_view(),
        name="scholarship-list-create",
    ),

    path(
        "scholarships/<int:pk>/",
        ScholarshipDetailView.as_view(),
        name="scholarship-detail",
    ),

    path(
        "scholarships/<int:pk>/apply/",
        ScholarshipApplyView.as_view(),
        name="scholarship-apply",
    ),

    # =====================================================
    # FINANCE SUMMARY
    # =====================================================

    path(
        "summary/",
        FinanceSummaryView.as_view(),
        name="finance-summary",
    ),

    path(
        "students/<int:student_id>/statement/",
        StudentFinancialStatementView.as_view(),
        name="student-financial-statement",
    ),

    path(
        "generate-invoices/",
        GenerateInvoicesView.as_view(),
        name="generate-invoices",
    ),

    # =====================================================
    # FINANCE DASHBOARD
    # =====================================================

    path(
        "dashboard/",
        FinanceDashboardView.as_view(),
        name="finance-dashboard",
    ),


    path(
        "reports/financial-summary/",
        FinancialSummaryReportView.as_view(),
        name="financial-summary-report",
    ),

    path(
        "reports/income/",
        IncomeReportView.as_view(),
        name="income-report",
    ),
    path(
        "reports/expenses/",
        ExpenseReportView.as_view(),
        name="expense-report",
    ),

    path(
        "reports/students/",
        StudentFinancialReportView.as_view(),
        name="student-financial-report",
    ),
    # =====================================================
    # EXPENSE CATEGORIES
    # =====================================================

    path(
        "expense-categories/",
        ExpenseCategoryListCreateView.as_view(),
        name="expense-category-list-create",
    ),

    path(
        "expense-categories/<int:pk>/",
        ExpenseCategoryDetailView.as_view(),
        name="expense-category-detail",
    ),

    # =====================================================
    # EXPENSES
    # =====================================================

    path(
        "expenses/",
        ExpenseListCreateView.as_view(),
        name="expense-list-create",
    ),

    # IMPORTANT:
    # Keep summary before <int:pk>
    path(
        "expenses/summary/",
        ExpenseSummaryView.as_view(),
        name="expense-summary",
    ),

    path(
        "expenses/<int:pk>/",
        ExpenseDetailView.as_view(),
        name="expense-detail",
    ),
]