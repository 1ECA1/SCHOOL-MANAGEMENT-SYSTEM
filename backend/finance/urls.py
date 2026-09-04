from django.urls import path

from .views import (
    FeeCategoryListCreateView,
    FeeCategoryDetailView,

    FeeStructureListCreateView,
    FeeStructureDetailView,

    StudentInvoiceListCreateView,
    StudentInvoiceDetailView,

    PaymentListCreateView,
    PaymentDetailView,

    ScholarshipListCreateView,
    ScholarshipDetailView,

    FinanceSummaryView,
    StudentFinancialStatementView,
    GenerateInvoicesView,

    ExpenseCategoryListCreateView,
    ExpenseCategoryDetailView,
    ExpenseListCreateView,
    ExpenseDetailView,
    ExpenseSummaryView,
    FinanceDashboardView,
)


urlpatterns = [

    # =========================
    # Fee Categories
    # =========================

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


    # =========================
    # Fee Structures
    # =========================

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


    # =========================
    # Student Invoices
    # =========================

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


    # =========================
    # Payments
    # =========================

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


    # =========================
    # Scholarships
    # =========================

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


    # =========================
    # Finance Summary
    # =========================

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

# =========================
# Finance Dashboard
# =========================

path(
    "dashboard/",
    FinanceDashboardView.as_view(),
    name="finance-dashboard",
),



    # =========================
    # Expense Categories
    # =========================

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


    # =========================
    # Expenses
    # =========================

    path(
        "expenses/",
        ExpenseListCreateView.as_view(),
        name="expense-list-create",
    ),

    # IMPORTANT: summary must come BEFORE <int:pk>
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