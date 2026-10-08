import { lazy } from "react";

// =====================================================
// LAZY LOADED PAGES
// =====================================================

const AccountantDashboard = lazy(
  () => import("../pages/accountant/AccountantDashboard"),
);

const AccountantProfile = lazy(
  () => import("../pages/accountant/AccountantProfile"),
);

const AccountantFeeCategories = lazy(
  () => import("../pages/accountant/AccountantFeeCategories"),
);

const AccountantFeeStructures = lazy(
  () => import("../pages/accountant/AccountantFeeStructures"),
);

const AccountantInvoices = lazy(
  () => import("../pages/accountant/AccountantInvoices"),
);

const AccountantPayments = lazy(
  () => import("../pages/accountant/AccountantPayments"),
);

const AccountantScholarships = lazy(
  () => import("../pages/accountant/AccountantScholarships"),
);

const AccountantExpenseCategories = lazy(
  () => import("../pages/accountant/AccountantExpenseCategories"),
);

const AccountantExpenses = lazy(
  () => import("../pages/accountant/AccountantExpenses"),
);

const AccountantFinancialReports = lazy(
  () => import("../pages/accountant/AccountantFinancialReports"),
);

// =====================================================
// NOTIFICATIONS
// =====================================================

const AccountantNotifications = lazy(
  () => import("../pages/accountant/AccountantNotifications"),
);

const AccountantNotificationDetails = lazy(
  () => import("../pages/accountant/AccountantNotificationDetails"),
);

// =====================================================
// ACCOUNTANT ROUTES
// =====================================================

export const accountantRoutes = [
  {
    index: true,
    element: <AccountantDashboard />,
  },

  {
    path: "profile",
    element: <AccountantProfile />,
  },

  {
    path: "fee-categories",
    element: <AccountantFeeCategories />,
  },

  {
    path: "fee-structures",
    element: <AccountantFeeStructures />,
  },

  {
    path: "invoices",
    element: <AccountantInvoices />,
  },

  {
    path: "payments",
    element: <AccountantPayments />,
  },

  {
    path: "scholarships",
    element: <AccountantScholarships />,
  },

  {
    path: "expense-categories",
    element: <AccountantExpenseCategories />,
  },

  {
    path: "expenses",
    element: <AccountantExpenses />,
  },

  {
    path: "reports",
    element: <AccountantFinancialReports />,
  },

  // ===================================================
  // NOTIFICATIONS
  // ===================================================

  {
    path: "notifications",
    element: <AccountantNotifications />,
  },

  {
    path: "notifications/:id",
    element: <AccountantNotificationDetails />,
  },
];