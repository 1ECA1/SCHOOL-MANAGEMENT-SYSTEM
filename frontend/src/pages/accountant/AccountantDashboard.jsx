import { useEffect, useState } from "react";
import {
  WalletCards,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  AlertCircle,
  Clock3,
  CheckCircle2,
  FileWarning,
  RefreshCw,
} from "lucide-react";
import api from "../../services/api";

function AccountantDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/finance/dashboard/");

      setDashboard(response.data);
    } catch (err) {
      console.error("Failed to load finance dashboard:", err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Unable to load the finance dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatCurrency = (value) => {
    const amount = Number(value || 0);

    return `₦${amount.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--color-primary)] dark:border-slate-700 dark:border-t-blue-500" />

          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Loading finance dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Accountant Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Overview of school finances and financial activities.
          </p>
        </div>

        <div className="rounded-3xl bg-[var(--color-card)] p-8 shadow-sm">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <AlertCircle size={32} />
            </div>

            <h2 className="mt-5 text-lg font-bold">
              Unable to load dashboard
            </h2>

            <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() => fetchDashboard()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <RefreshCw size={17} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const income = dashboard?.income || {};
  const expenses = dashboard?.expenses || {};
  const invoices = dashboard?.invoices || {};

  return (
    <div className="space-y-8">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Accountant Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Overview of school finances, payments, invoices, and expenses.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-[var(--color-card)] px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 sm:self-auto"
        >
          <RefreshCw
            size={17}
            className={refreshing ? "animate-spin" : ""}
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* =====================================================
          MAIN FINANCIAL STATS
      ====================================================== */}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Invoiced"
          value={formatCurrency(income.total_invoiced)}
          description="Total fees billed"
          icon={Receipt}
          iconBg="bg-blue-100 dark:bg-blue-950/40"
          iconColor="text-[var(--color-primary)]"
        />

        <StatCard
          title="Total Collected"
          value={formatCurrency(income.total_collected)}
          description="Payments received"
          icon={TrendingUp}
          iconBg="bg-emerald-100 dark:bg-emerald-950/40"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />

        <StatCard
          title="Outstanding"
          value={formatCurrency(income.total_outstanding)}
          description="Unpaid balances"
          icon={Clock3}
          iconBg="bg-amber-100 dark:bg-amber-950/40"
          iconColor="text-amber-600 dark:text-amber-400"
        />

        <StatCard
          title="Net Balance"
          value={formatCurrency(dashboard?.net_balance)}
          description="Collected minus expenses"
          icon={WalletCards}
          iconBg="bg-cyan-100 dark:bg-cyan-950/40"
          iconColor="text-cyan-600 dark:text-cyan-400"
        />
      </div>

      {/* =====================================================
          INCOME + EXPENSES
      ====================================================== */}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Income */}
        <div className="rounded-3xl bg-[var(--color-card)] p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <TrendingUp size={23} />
            </div>

            <div>
              <h2 className="font-bold">Income Overview</h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                School fee collections
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <FinancialRow
              label="Total Invoiced"
              value={formatCurrency(income.total_invoiced)}
            />

            <FinancialRow
              label="Total Collected"
              value={formatCurrency(income.total_collected)}
              valueClass="text-emerald-600 dark:text-emerald-400"
            />

            <FinancialRow
              label="Outstanding"
              value={formatCurrency(income.total_outstanding)}
              valueClass="text-amber-600 dark:text-amber-400"
            />

            <FinancialRow
              label="Discounts"
              value={formatCurrency(income.total_discounts)}
            />
          </div>
        </div>

        {/* Expenses */}
        <div className="rounded-3xl bg-[var(--color-card)] p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <TrendingDown size={23} />
            </div>

            <div>
              <h2 className="font-bold">Expense Overview</h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                School expenditure
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <FinancialRow
              label="Total Paid Expenses"
              value={formatCurrency(expenses.total_expenses)}
              valueClass="text-red-600 dark:text-red-400"
            />

            <FinancialRow
              label="Pending Expenses"
              value={formatCurrency(expenses.pending_expenses)}
              valueClass="text-amber-600 dark:text-amber-400"
            />

            <FinancialRow
              label="Net Balance"
              value={formatCurrency(dashboard?.net_balance)}
              valueClass="text-[var(--color-primary)]"
            />

            <FinancialRow
              label="Expense Records"
              value={dashboard?.expense_records || 0}
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          INVOICE STATUS
      ====================================================== */}

      <div className="rounded-3xl bg-[var(--color-card)] p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold">
            Invoice Status
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Current status of student invoices.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <InvoiceStatusCard
            label="Total"
            value={invoices.total}
            icon={Receipt}
            iconBg="bg-slate-100 dark:bg-slate-800"
            iconColor="text-slate-600 dark:text-slate-300"
          />

          <InvoiceStatusCard
            label="Paid"
            value={invoices.paid}
            icon={CheckCircle2}
            iconBg="bg-emerald-100 dark:bg-emerald-950/40"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />

          <InvoiceStatusCard
            label="Partial"
            value={invoices.partial}
            icon={CreditCard}
            iconBg="bg-blue-100 dark:bg-blue-950/40"
            iconColor="text-blue-600 dark:text-blue-400"
          />

          <InvoiceStatusCard
            label="Unpaid"
            value={invoices.unpaid}
            icon={Clock3}
            iconBg="bg-amber-100 dark:bg-amber-950/40"
            iconColor="text-amber-600 dark:text-amber-400"
          />

          <InvoiceStatusCard
            label="Overdue"
            value={invoices.overdue}
            icon={FileWarning}
            iconBg="bg-red-100 dark:bg-red-950/40"
            iconColor="text-red-600 dark:text-red-400"
          />
        </div>
      </div>

      {/* =====================================================
          FINANCIAL SUMMARY
      ====================================================== */}

      <div className="rounded-3xl bg-[var(--color-primary)] p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-100">
              Current Financial Position
            </p>

            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              {formatCurrency(dashboard?.net_balance)}
            </h2>

            <p className="mt-2 max-w-xl text-sm text-blue-100">
              Net balance based on successful fee collections minus paid
              school expenses.
            </p>
          </div>

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <WalletCards size={32} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconBg,
  iconColor,
}) {
  return (
    <div className="rounded-3xl bg-[var(--color-card)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <h2 className="mt-2 text-xl font-bold sm:text-2xl">
            {value}
          </h2>

          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            {description}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconBg} ${iconColor}`}
        >
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FINANCIAL ROW
========================================================= */

function FinancialRow({
  label,
  value,
  valueClass = "text-[var(--color-text)]",
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0 dark:border-slate-700">
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {label}
      </span>

      <span className={`font-semibold ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   INVOICE STATUS CARD
========================================================= */

function InvoiceStatusCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
        >
          <Icon size={19} />
        </div>

        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-xl font-bold">
            {value ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AccountantDashboard;