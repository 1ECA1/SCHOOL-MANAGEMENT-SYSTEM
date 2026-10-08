import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Wallet,
  X,
  XCircle,
} from "lucide-react";

import api from "../../services/api";

const PAYMENT_METHODS = [
  {
    value: "CASH",
    label: "Cash",
  },
  {
    value: "BANK_TRANSFER",
    label: "Bank Transfer",
  },
  {
    value: "CARD",
    label: "Card",
  },
  {
    value: "ONLINE",
    label: "Online Payment",
  },
  {
    value: "POS",
    label: "POS",
  },
];

const PAYMENT_STATUSES = [
  {
    value: "PENDING",
    label: "Pending",
  },
  {
    value: "SUCCESSFUL",
    label: "Successful",
  },
  {
    value: "FAILED",
    label: "Failed",
  },
  {
    value: "REFUNDED",
    label: "Refunded",
  },
];

const PAGE_SIZE = 10;

function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPaymentMethodLabel(value) {
  const method = PAYMENT_METHODS.find(
    (item) => item.value === value
  );

  return method?.label || value || "—";
}

function getStatusClasses(status) {
  switch (status) {
    case "SUCCESSFUL":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";

    case "PENDING":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";

    case "FAILED":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

    case "REFUNDED":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";

    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
}

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;

  if (!data) {
    return fallback;
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  if (data.error) {
    return data.error;
  }

  if (typeof data === "object") {
    const messages = [];

    Object.entries(data).forEach(([field, value]) => {
      if (Array.isArray(value)) {
        messages.push(`${field}: ${value.join(", ")}`);
      } else if (typeof value === "string") {
        messages.push(`${field}: ${value}`);
      }
    });

    if (messages.length > 0) {
      return messages.join(" | ");
    }
  }

  return fallback;
}

function AccountantPayments() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [invoicesLoading, setInvoicesLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");

  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState(null);

  const [form, setForm] = useState({
    invoice: "",
    reference: "",
    amount: "",
    payment_method: "CASH",
    status: "SUCCESSFUL",
    transaction_id: "",
    notes: "",
  });

  const resetForm = () => {
    setForm({
      invoice: "",
      reference: "",
      amount: "",
      payment_method: "CASH",
      status: "SUCCESSFUL",
      transaction_id: "",
      notes: "",
    });
  };

  const fetchPayments = async () => {
    try {
      setError("");

      const response = await api.get("/finance/payments/");

      const data = response.data;

      if (Array.isArray(data)) {
        setPayments(data);
      } else if (Array.isArray(data?.results)) {
        setPayments(data.results);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.error("Failed to fetch payments:", err);

      setError(
        getErrorMessage(
          err,
          "Unable to load payment records."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      setInvoicesLoading(true);

      const response = await api.get("/finance/invoices/");

      const data = response.data;

      let invoiceList = [];

      if (Array.isArray(data)) {
        invoiceList = data;
      } else if (Array.isArray(data?.results)) {
        invoiceList = data.results;
      }

      setInvoices(invoiceList);
    } catch (err) {
      console.error("Failed to fetch invoices:", err);

      setError(
        getErrorMessage(
          err,
          "Unable to load invoices for payment recording."
        )
      );
    } finally {
      setInvoicesLoading(false);
    }
  };

  const loadData = async () => {
    setRefreshing(true);

    await Promise.all([
      fetchPayments(),
      fetchInvoices(),
    ]);

    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPayments = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesSearch =
        !searchValue ||
        String(payment.reference || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(payment.invoice_number || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(payment.student_name || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(payment.transaction_id || "")
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        !statusFilter ||
        payment.status === statusFilter;

      const matchesMethod =
        !methodFilter ||
        payment.payment_method === methodFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesMethod
      );
    });
  }, [
    payments,
    search,
    statusFilter,
    methodFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPayments.length / PAGE_SIZE)
  );

  const paginatedPayments = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;

    return filteredPayments.slice(
      start,
      start + PAGE_SIZE
    );
  }, [filteredPayments, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const statistics = useMemo(() => {
    const successful = payments.filter(
      (payment) => payment.status === "SUCCESSFUL"
    );

    const pending = payments.filter(
      (payment) => payment.status === "PENDING"
    );

    const failed = payments.filter(
      (payment) => payment.status === "FAILED"
    );

    const refunded = payments.filter(
      (payment) => payment.status === "REFUNDED"
    );

    const totalCollected = successful.reduce(
      (sum, payment) =>
        sum + Number(payment.amount || 0),
      0
    );

    const totalPending = pending.reduce(
      (sum, payment) =>
        sum + Number(payment.amount || 0),
      0
    );

    const totalRefunded = refunded.reduce(
      (sum, payment) =>
        sum + Number(payment.amount || 0),
      0
    );

    return {
      total: payments.length,
      successful: successful.length,
      pending: pending.length,
      failed: failed.length,
      refunded: refunded.length,
      totalCollected,
      totalPending,
      totalRefunded,
    };
  }, [payments]);

  const selectedInvoice = useMemo(() => {
    if (!form.invoice) {
      return null;
    }

    return invoices.find(
      (invoice) =>
        String(invoice.id) === String(form.invoice)
    );
  }, [form.invoice, invoices]);

  const handleInvoiceChange = (value) => {
    const invoice = invoices.find(
      (item) => String(item.id) === String(value)
    );

    setForm((previous) => ({
      ...previous,
      invoice: value,
      amount:
        invoice && Number(invoice.balance) > 0
          ? String(invoice.balance)
          : "",
    }));
  };

  const openCreateModal = () => {
    setSelectedPayment(null);
    resetForm();
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setSelectedPayment(null);
    resetForm();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      invoice: Number(form.invoice),
      reference: form.reference.trim(),
      amount: form.amount,
      payment_method: form.payment_method,
      status: form.status,
      transaction_id: form.transaction_id.trim(),
      notes: form.notes.trim(),
    };

    try {
      if (!payload.invoice) {
        throw new Error("Please select an invoice.");
      }

      if (!payload.reference) {
        throw new Error("Please enter a payment reference.");
      }

      if (!payload.amount || Number(payload.amount) <= 0) {
        throw new Error(
          "Payment amount must be greater than zero."
        );
      }

      await api.post(
        "/finance/payments/",
        payload
      );

      setSuccess(
        "Payment recorded successfully. The invoice balance has been updated."
      );

      setShowModal(false);
      resetForm();

      await Promise.all([
        fetchPayments(),
        fetchInvoices(),
      ]);
    } catch (err) {
      console.error("Failed to record payment:", err);

      const message =
        err?.message &&
        !err?.response?.data
          ? err.message
          : getErrorMessage(
              err,
              "Unable to record payment."
            );

      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const openPaymentDetails = (payment) => {
    setSelectedPayment(payment);
  };

  const closePaymentDetails = () => {
    setSelectedPayment(null);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setMethodFilter("");
    setPage(1);
  };

  const hasFilters =
    search ||
    statusFilter ||
    methodFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white shadow-sm">
              <Wallet size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Payments
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Record and manage student fee payments.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadData}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-[var(--color-card)] px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            <Plus size={18} />
            Record Payment
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0"
          />

          <div className="flex-1">
            <p className="font-semibold">
              Payment Error
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-lg p-1 transition hover:bg-red-100 dark:hover:bg-red-900/30"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400">
          <CheckCircle2
            size={20}
            className="mt-0.5 shrink-0"
          />

          <div className="flex-1">
            <p className="font-semibold">
              Payment Successful
            </p>

            <p className="mt-1 text-sm">
              {success}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="rounded-lg p-1 transition hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Collected"
          value={formatCurrency(
            statistics.totalCollected
          )}
          icon={Banknote}
          iconClass="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
        />

        <StatCard
          title="Successful Payments"
          value={statistics.successful}
          icon={CheckCircle2}
          iconClass="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
        />

        <StatCard
          title="Pending Payments"
          value={statistics.pending}
          icon={Wallet}
          iconClass="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        />

        <StatCard
          title="Refunded Amount"
          value={formatCurrency(
            statistics.totalRefunded
          )}
          icon={CreditCard}
          iconClass="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
        />
      </div>

      {/* Filters */}
      <div className="rounded-3xl bg-[var(--color-card)] p-5 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Search Payments
            </label>

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Reference, invoice, student or transaction..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-blue-900/30"
              />
            </div>
          </div>

          <div className="w-full lg:w-48">
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="">
                All Statuses
              </option>

              {PAYMENT_STATUSES.map(
                (status) => (
                  <option
                    key={status.value}
                    value={status.value}
                  >
                    {status.label}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="w-full lg:w-52">
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Payment Method
            </label>

            <select
              value={methodFilter}
              onChange={(event) => {
                setMethodFilter(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="">
                All Methods
              </option>

              {PAYMENT_METHODS.map(
                (method) => (
                  <option
                    key={method.value}
                    value={method.value}
                  >
                    {method.label}
                  </option>
                )
              )}
            </select>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-hidden rounded-3xl bg-[var(--color-card)] shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold">
              Payment Records
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {filteredPayments.length} payment
              {filteredPayments.length === 1
                ? ""
                : "s"} found
            </p>
          </div>

          <div className="text-sm text-slate-500 dark:text-slate-400">
            Total:{" "}
            <span className="font-semibold text-slate-800 dark:text-slate-100">
              {formatCurrency(
                statistics.totalCollected
              )}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <Loader2
                size={22}
                className="animate-spin"
              />
              Loading payments...
            </div>
          </div>
        ) : paginatedPayments.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <Wallet
                size={28}
                className="text-slate-400"
              />
            </div>

            <h3 className="text-lg font-bold">
              No Payments Found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
              No payment records match your current
              search or filters.
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-slate-50 dark:bg-slate-900/60">
                  <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <th className="px-5 py-4">
                      Student
                    </th>

                    <th className="px-5 py-4">
                      Invoice
                    </th>

                    <th className="px-5 py-4">
                      Reference
                    </th>

                    <th className="px-5 py-4">
                      Amount
                    </th>

                    <th className="px-5 py-4">
                      Method
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4">
                      Date
                    </th>

                    <th className="px-5 py-4 text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedPayments.map(
                    (payment) => (
                      <tr
                        key={payment.id}
                        className="transition hover:bg-slate-50/80 dark:hover:bg-slate-900/40"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-800 dark:text-slate-100">
                            {payment.student_name ||
                              "Unknown Student"}
                          </p>

                          {payment.transaction_id && (
                            <p className="mt-1 text-xs text-slate-400">
                              TX:{" "}
                              {payment.transaction_id}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-medium text-[var(--color-primary)]">
                            {payment.invoice_number ||
                              `#${payment.invoice}`}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-medium">
                            {payment.reference}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-bold">
                            {formatCurrency(
                              payment.amount
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                          {getPaymentMethodLabel(
                            payment.payment_method
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusClasses(
                              payment.status
                            )}`}
                          >
                            {payment.status ||
                              "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                          {formatDate(
                            payment.payment_date
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              openPaymentDetails(
                                payment
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <Eye size={16} />
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing{" "}
                <span className="font-semibold">
                  {Math.min(
                    (page - 1) * PAGE_SIZE + 1,
                    filteredPayments.length
                  )}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                  {Math.min(
                    page * PAGE_SIZE,
                    filteredPayments.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold">
                  {filteredPayments.length}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() =>
                    setPage((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                  className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <ChevronLeft size={18} />
                </button>

                <span className="min-w-24 text-center text-sm font-semibold">
                  Page {page} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() =>
                    setPage((current) =>
                      Math.min(
                        totalPages,
                        current + 1
                      )
                    )
                  }
                  className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Record Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[var(--color-card)] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-[var(--color-card)] px-6 py-5 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold">
                  Record Payment
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Record a payment against a student invoice.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Invoice
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </label>

                <select
                  value={form.invoice}
                  onChange={(event) =>
                    handleInvoiceChange(
                      event.target.value
                    )
                  }
                  required
                  disabled={invoicesLoading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-blue-900/30"
                >
                  <option value="">
                    {invoicesLoading
                      ? "Loading invoices..."
                      : "Select an invoice"}
                  </option>

                  {invoices
                    .filter(
                      (invoice) =>
                        Number(invoice.balance || 0) >
                          0 &&
                        invoice.status !==
                          "CANCELLED"
                    )
                    .map((invoice) => (
                      <option
                        key={invoice.id}
                        value={invoice.id}
                      >
                        {invoice.invoice_number} —{" "}
                        {invoice.student_name} —{" "}
                        Balance:{" "}
                        {formatCurrency(
                          invoice.balance
                        )}
                      </option>
                    ))}
                </select>

                {!invoicesLoading &&
                  invoices.filter(
                    (invoice) =>
                      Number(invoice.balance || 0) >
                        0 &&
                      invoice.status !== "CANCELLED"
                  ).length === 0 && (
                    <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                      There are currently no outstanding
                      invoices available for payment.
                    </p>
                  )}
              </div>

              {selectedInvoice && (
                <div className="grid grid-cols-1 gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-3 dark:bg-slate-900">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Student
                    </p>

                    <p className="mt-1 font-semibold">
                      {selectedInvoice.student_name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Invoice Amount
                    </p>

                    <p className="mt-1 font-semibold">
                      {formatCurrency(
                        selectedInvoice.amount
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Outstanding Balance
                    </p>

                    <p className="mt-1 font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(
                        selectedInvoice.balance
                      )}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Payment Reference
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    value={form.reference}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        reference:
                          event.target.value,
                      }))
                    }
                    placeholder="e.g. PAY-0001"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-blue-900/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Amount
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        amount:
                          event.target.value,
                      }))
                    }
                    placeholder="0.00"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-blue-900/30"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Payment Method
                  </label>

                  <select
                    value={form.payment_method}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        payment_method:
                          event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] dark:border-slate-700 dark:bg-slate-900"
                  >
                    {PAYMENT_METHODS.map(
                      (method) => (
                        <option
                          key={method.value}
                          value={method.value}
                        >
                          {method.label}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Payment Status
                  </label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        status:
                          event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] dark:border-slate-700 dark:bg-slate-900"
                  >
                    {PAYMENT_STATUSES.map(
                      (status) => (
                        <option
                          key={status.value}
                          value={status.value}
                        >
                          {status.label}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Transaction ID
                </label>

                <input
                  type="text"
                  value={form.transaction_id}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      transaction_id:
                        event.target.value,
                    }))
                  }
                  placeholder="Optional transaction ID"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Notes
                </label>

                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      notes: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Optional payment notes..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              {form.status === "SUCCESSFUL" && (
                <div className="flex items-start gap-3 rounded-2xl bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0"
                  />

                  <p>
                    A successful payment will be added to
                    the invoice's paid amount and the
                    outstanding balance will be recalculated
                    automatically.
                  </p>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    invoicesLoading
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Recording...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Record Payment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--color-card)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold">
                  Payment Details
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Payment #{selectedPayment.id}
                </p>
              </div>

              <button
                type="button"
                onClick={closePaymentDetails}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="rounded-2xl bg-slate-50 p-5 text-center dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Payment Amount
                </p>

                <p className="mt-1 text-3xl font-bold text-[var(--color-primary)]">
                  {formatCurrency(
                    selectedPayment.amount
                  )}
                </p>

                <span
                  className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusClasses(
                    selectedPayment.status
                  )}`}
                >
                  {selectedPayment.status}
                </span>
              </div>

              <DetailRow
                label="Student"
                value={
                  selectedPayment.student_name ||
                  "—"
                }
              />

              <DetailRow
                label="Invoice"
                value={
                  selectedPayment.invoice_number ||
                  `#${selectedPayment.invoice}`
                }
              />

              <DetailRow
                label="Reference"
                value={
                  selectedPayment.reference || "—"
                }
              />

              <DetailRow
                label="Payment Method"
                value={getPaymentMethodLabel(
                  selectedPayment.payment_method
                )}
              />

              <DetailRow
                label="Transaction ID"
                value={
                  selectedPayment.transaction_id ||
                  "—"
                }
              />

              <DetailRow
                label="Payment Date"
                value={formatDateTime(
                  selectedPayment.payment_date
                )}
              />

              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Notes
                </p>

                <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                  {selectedPayment.notes ||
                    "No notes were added."}
                </p>
              </div>

              <button
                type="button"
                onClick={closePaymentDetails}
                className="w-full rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="rounded-3xl bg-[var(--color-card)] p-5 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}
        >
          <Icon size={23} />
        </div>
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500 dark:text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold tracking-tight">
        {value}
      </p>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 dark:border-slate-800">
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {label}
      </span>

      <span className="text-right text-sm font-semibold">
        {value}
      </span>
    </div>
  );
}

export default AccountantPayments;