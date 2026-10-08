import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  Receipt,
  ReceiptText,
  Wallet,
  X,
  XCircle,
  Clock3,
} from "lucide-react";

import {
  getStudentInvoices,
  getStudentPayments,
  initiateStudentPayment,
  verifyPaystackPayment,
} from "../../services/financeService";

function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusClasses(status) {
  switch (status) {
    case "PAID":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "PARTIAL":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "OVERDUE":
      return "bg-red-50 text-red-700 border-red-200";

    case "CANCELLED":
      return "bg-slate-100 text-slate-600 border-slate-200";

    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
}

function getStatusLabel(status) {
  switch (status) {
    case "PAID":
      return "Paid";

    case "PARTIAL":
      return "Partially Paid";

    case "OVERDUE":
      return "Overdue";

    case "CANCELLED":
      return "Cancelled";

    default:
      return "Unpaid";
  }
}

function getPaymentStatusClasses(status) {
  switch (status) {
    case "SUCCESSFUL":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "PENDING":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "FAILED":
      return "border-red-200 bg-red-50 text-red-700";

    case "REFUNDED":
      return "border-purple-200 bg-purple-50 text-purple-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function getPaymentStatusLabel(status) {
  switch (status) {
    case "SUCCESSFUL":
      return "Successful";

    case "PENDING":
      return "Pending";

    case "FAILED":
      return "Failed";

    case "REFUNDED":
      return "Refunded";

    default:
      return status || "Unknown";
  }
}

function getPaymentStatusIcon(status) {
  switch (status) {
    case "SUCCESSFUL":
      return <CheckCircle2 className="h-4 w-4" />;

    case "PENDING":
      return <Clock3 className="h-4 w-4" />;

    case "FAILED":
      return <XCircle className="h-4 w-4" />;

    case "REFUNDED":
      return <Receipt className="h-4 w-4" />;

    default:
      return <AlertCircle className="h-4 w-4" />;
  }
}

function StatCard({ icon, label, value, description }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>

          <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {value}
          </h3>

          {description && (
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {description}
            </p>
          )}
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xl dark:bg-blue-950/40">
          {icon}
        </div>
      </div>
    </div>
  );
}

function StudentFees() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  const [error, setError] = useState("");
  const [paymentsError, setPaymentsError] = useState("");

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentMessageType, setPaymentMessageType] =
    useState("");

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getStudentInvoices();

      setInvoices(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : []
      );
    } catch (err) {
      console.error(
        "Failed to load student invoices:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to load your fees at the moment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      setPaymentsLoading(true);
      setPaymentsError("");

      const data = await getStudentPayments();

      setPayments(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : []
      );
    } catch (err) {
      console.error(
        "Failed to load student payments:",
        err
      );

      setPaymentsError(
        err?.response?.data?.detail ||
          "Unable to load your payment history at the moment."
      );
    } finally {
      setPaymentsLoading(false);
    }
  };

  const loadFinanceData = async () => {
    await Promise.all([
      loadInvoices(),
      loadPayments(),
    ]);
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const reference =
      params.get("reference") ||
      params.get("trxref");

    if (!reference) {
      return;
    }

    const verifyPayment = async () => {
      try {
        setPaymentMessage("");
        setPaymentMessageType("");

        const result =
          await verifyPaystackPayment(reference);

        if (
          result?.payment?.status === "SUCCESSFUL"
        ) {
          setPaymentMessage(
            "Payment verified successfully. Your fee balance has been updated."
          );
          setPaymentMessageType("success");
        } else {
          setPaymentMessage(
            result?.detail ||
              "Payment verification was not confirmed as successful. Please check your payment history."
          );
          setPaymentMessageType("info");
        }

        await loadFinanceData();

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } catch (err) {
        console.error(
          "Payment verification failed:",
          err
        );

        setPaymentMessage(
          err?.response?.data?.detail ||
            "We could not verify this payment yet. If you completed the payment, please refresh and check your payment history."
        );

        setPaymentMessageType("error");

        await loadFinanceData();
      }
    };

    verifyPayment();
  }, []);

  const summary = useMemo(() => {
    let total = 0;
    let paid = 0;
    let balance = 0;

    invoices.forEach((invoice) => {
      total += Number(invoice.amount || 0);
      paid += Number(invoice.amount_paid || 0);
      balance += Number(invoice.balance || 0);
    });

    return {
      total,
      paid,
      balance,
    };
  }, [invoices]);

  const successfulPayments = useMemo(() => {
    return payments.filter(
      (payment) =>
        payment.status === "SUCCESSFUL"
    );
  }, [payments]);

  const paymentTotal = useMemo(() => {
    return successfulPayments.reduce(
      (total, payment) =>
        total + Number(payment.amount || 0),
      0
    );
  }, [successfulPayments]);

  const openPaymentModal = (invoice) => {
    const balance = Number(invoice.balance || 0);

    if (
      balance <= 0 ||
      invoice.status === "CANCELLED"
    ) {
      return;
    }

    setSelectedInvoice(invoice);
    setPaymentAmount(balance.toFixed(2));
    setPaymentError("");
  };

  const closePaymentModal = () => {
    if (paymentLoading) {
      return;
    }

    setSelectedInvoice(null);
    setPaymentAmount("");
    setPaymentError("");
  };

  const handlePayment = async () => {
    if (!selectedInvoice) {
      return;
    }

    const amount = Number(paymentAmount);
    const balance = Number(
      selectedInvoice.balance || 0
    );

    if (
      !paymentAmount ||
      Number.isNaN(amount) ||
      amount <= 0
    ) {
      setPaymentError(
        "Enter a valid payment amount."
      );
      return;
    }

    if (amount > balance) {
      setPaymentError(
        `The payment amount cannot exceed the outstanding balance of ${formatCurrency(
          balance
        )}.`
      );
      return;
    }

    try {
      setPaymentLoading(true);
      setPaymentError("");

      const response =
        await initiateStudentPayment({
          invoice: selectedInvoice.id,
          amount: amount.toFixed(2),
          gateway: "PAYSTACK",
        });

      const authorizationUrl =
        response?.paystack?.authorization_url;

      if (!authorizationUrl) {
        throw new Error(
          "Paystack authorization URL was not returned."
        );
      }

      window.location.href =
        authorizationUrl;
    } catch (err) {
      console.error(
        "Payment initiation failed:",
        err
      );

      setPaymentError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to start the payment. Please try again."
      );

      setPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto w-full max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-[var(--color-primary)]">
              Student Portal
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Fees & Payments
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              View your school fees, outstanding balances,
              and make secure payments.
            </p>
          </div>

          <button
            type="button"
            onClick={loadFinanceData}
            disabled={
              loading || paymentsLoading
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading || paymentsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Receipt className="h-4 w-4" />
            )}

            Refresh
          </button>
        </div>

        {/* Payment message */}
        {paymentMessage && (
          <div
            className={`flex items-start gap-3 rounded-2xl border p-4 ${
              paymentMessageType === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : paymentMessageType === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-blue-200 bg-blue-50 text-blue-800"
            }`}
          >
            {paymentMessageType === "success" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            ) : paymentMessageType === "error" ? (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            )}

            <p className="text-sm font-medium">
              {paymentMessage}
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />

              <p className="text-sm">
                Loading your fees...
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

              <div>
                <p className="font-semibold">
                  Unable to load fees
                </p>

                <p className="mt-1 text-sm">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadFinanceData}
                  className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard
                icon="💰"
                label="Total Fees"
                value={formatCurrency(
                  summary.total
                )}
                description={`${invoices.length} invoice${
                  invoices.length === 1
                    ? ""
                    : "s"
                }`}
              />

              <StatCard
                icon="✅"
                label="Amount Paid"
                value={formatCurrency(
                  summary.paid
                )}
                description="Successful payments"
              />

              <StatCard
                icon="⏳"
                label="Outstanding"
                value={formatCurrency(
                  summary.balance
                )}
                description="Remaining balance"
              />
            </div>

            {/* Invoice section */}
            <div className="rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 p-5 dark:border-slate-800 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      My Fee Invoices
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Your current school fee invoices and
                      payment status.
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl dark:bg-blue-950/40">
                    🧾
                  </div>
                </div>
              </div>

              {invoices.length === 0 ? (
                <div className="flex min-h-[250px] flex-col items-center justify-center p-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl dark:bg-slate-800">
                    📄
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                    No invoices found
                  </h3>

                  <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
                    You currently have no fee invoices
                    available.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoices.map((invoice) => {
                    const amount = Number(
                      invoice.amount || 0
                    );

                    const discount = Number(
                      invoice.discount || 0
                    );

                    const paid = Number(
                      invoice.amount_paid || 0
                    );

                    const balance = Number(
                      invoice.balance || 0
                    );

                    const payable =
                      invoice.status !== "PAID" &&
                      invoice.status !== "CANCELLED" &&
                      balance > 0;

                    const paymentProgress =
                      amount - discount > 0
                        ? Math.min(
                            100,
                            Math.max(
                              0,
                              (paid /
                                (amount -
                                  discount)) *
                                100
                            )
                          )
                        : 0;

                    return (
                      <div
                        key={invoice.id}
                        className="p-5 sm:p-6"
                      >
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {invoice.fee_category_name ||
                                  "School Fee"}
                              </h3>

                              <span
                                className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                                  invoice.status
                                )}`}
                              >
                                {getStatusLabel(
                                  invoice.status
                                )}
                              </span>
                            </div>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                              {invoice.invoice_number}
                            </p>

                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Session
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                                  {invoice.session_name ||
                                    "—"}
                                </p>
                              </div>

                              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Term
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                                  {invoice.term_name ||
                                    "—"}
                                </p>
                              </div>

                              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Due Date
                                </p>

                                <div className="mt-1 flex items-center gap-1.5">
                                  <CalendarDays className="h-4 w-4 text-slate-400" />

                                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    {formatDate(
                                      invoice.due_date
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Invoice Amount
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                                  {formatCurrency(
                                    amount
                                  )}
                                </p>
                              </div>
                            </div>

                            {invoice.description && (
                              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                                {invoice.description}
                              </p>
                            )}

                            {/* Progress */}
                            <div className="mt-5">
                              <div className="mb-2 flex items-center justify-between text-xs">
                                <span className="font-medium text-slate-500 dark:text-slate-400">
                                  Payment progress
                                </span>

                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  {Math.round(
                                    paymentProgress
                                  )}
                                  %
                                </span>
                              </div>

                              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <div
                                  className="h-full rounded-full bg-[var(--color-primary)] transition-all"
                                  style={{
                                    width: `${paymentProgress}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Amount summary */}
                          <div className="w-full shrink-0 xl:w-72">
                            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-500 dark:text-slate-400">
                                    Amount
                                  </span>

                                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {formatCurrency(
                                      amount
                                    )}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-500 dark:text-slate-400">
                                    Discount
                                  </span>

                                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    {formatCurrency(
                                      discount
                                    )}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-500 dark:text-slate-400">
                                    Paid
                                  </span>

                                  <span className="font-semibold text-emerald-600">
                                    {formatCurrency(
                                      paid
                                    )}
                                  </span>
                                </div>

                                <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                      Balance
                                    </span>

                                    <span className="text-lg font-bold text-[var(--color-primary)]">
                                      {formatCurrency(
                                        balance
                                      )}
                                    </span>
                                  </div>
                                </div>

                                {payable && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openPaymentModal(
                                        invoice
                                      )
                                    }
                                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
                                  >
                                    <CreditCard className="h-4 w-4" />
                                    Pay Now
                                  </button>
                                )}

                                {invoice.status ===
                                  "PAID" && (
                                  <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Fully Paid
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Payment History */}
            <div className="rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 p-5 dark:border-slate-800 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      Payment History
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      View your previous online and manual
                      payment transactions.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 px-4 py-2 text-right dark:bg-blue-950/40">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Successful Payments
                      </p>

                      <p className="text-sm font-bold text-[var(--color-primary)]">
                        {formatCurrency(
                          paymentTotal
                        )}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl dark:bg-blue-950/40">
                      💳
                    </div>
                  </div>
                </div>
              </div>

              {paymentsLoading ? (
                <div className="flex min-h-[180px] items-center justify-center p-6">
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin text-[var(--color-primary)]" />

                    <span className="text-sm">
                      Loading payment history...
                    </span>
                  </div>
                </div>
              ) : paymentsError ? (
                <div className="p-5 sm:p-6">
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                      <div>
                        <p className="font-semibold">
                          Unable to load payment history
                        </p>

                        <p className="mt-1 text-sm">
                          {paymentsError}
                        </p>

                        <button
                          type="button"
                          onClick={loadPayments}
                          className="mt-3 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : payments.length === 0 ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center p-6 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl dark:bg-slate-800">
                    💳
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                    No payment history
                  </h3>

                  <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
                    Your payment transactions will appear
                    here after you make a payment.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {payments.map((payment) => {
                    const paymentStatus =
                      payment.status;

                    const invoiceNumber =
                      payment.invoice_number ||
                      payment.invoice?.invoice_number ||
                      `Invoice #${payment.invoice || "—"}`;

                    return (
                      <div
                        key={payment.id}
                        className="p-5 transition hover:bg-slate-50/70 dark:hover:bg-slate-800/30 sm:p-6"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="flex min-w-0 items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[var(--color-primary)] dark:bg-blue-950/40">
                              <CreditCard className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                  {payment.gateway ||
                                    payment.payment_method ||
                                    "Payment"}
                                </h3>

                                <span
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getPaymentStatusClasses(
                                    paymentStatus
                                  )}`}
                                >
                                  {getPaymentStatusIcon(
                                    paymentStatus
                                  )}

                                  {getPaymentStatusLabel(
                                    paymentStatus
                                  )}
                                </span>
                              </div>

                              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {invoiceNumber}
                              </p>

                              <div className="mt-3 flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-1">
                                <span>
                                  Reference:{" "}
                                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                                    {payment.reference ||
                                      "—"}
                                  </span>
                                </span>

                                <span>
                                  Date:{" "}
                                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                                    {formatDateTime(
                                      payment.payment_date ||
                                        payment.created_at
                                    )}
                                  </span>
                                </span>

                                <span>
                                  Method:{" "}
                                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                                    {payment.payment_method_display ||
                                      payment.payment_method ||
                                      "—"}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Amount + Receipt */}
                          <div className="flex shrink-0 flex-col items-stretch gap-3 border-t border-slate-100 pt-4 lg:min-w-[190px] lg:items-end lg:border-t-0 lg:pt-0 dark:border-slate-800">
                            <div className="flex items-center justify-between gap-4 lg:flex-col lg:items-end lg:gap-1">
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                Amount
                              </span>

                              <span className="text-lg font-bold text-slate-900 dark:text-white">
                                {formatCurrency(
                                  payment.amount
                                )}
                              </span>
                            </div>

                            {payment.status ===
                              "SUCCESSFUL" && (
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `/student/fees/payment/${payment.id}/receipt`
                                  )
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
                              >
                                <ReceiptText className="h-4 w-4" />
                                View Receipt
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Payment Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Make Payment
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {selectedInvoice.invoice_number}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closePaymentModal}
                  disabled={paymentLoading}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5 p-5">
                <div className="rounded-2xl bg-blue-50 p-4 dark:bg-blue-950/30">
                  <div className="flex items-start gap-3">
                    <Wallet className="mt-0.5 h-5 w-5 text-[var(--color-primary)]" />

                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Outstanding Balance
                      </p>

                      <p className="mt-1 text-2xl font-bold text-[var(--color-primary)]">
                        {formatCurrency(
                          selectedInvoice.balance
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="payment-amount"
                    className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Payment Amount
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                      ₦
                    </span>

                    <input
                      id="payment-amount"
                      type="number"
                      min="1"
                      max={Number(
                        selectedInvoice.balance || 0
                      )}
                      step="0.01"
                      value={paymentAmount}
                      onChange={(event) =>
                        setPaymentAmount(
                          event.target.value
                        )
                      }
                      disabled={paymentLoading}
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-blue-950"
                      placeholder="Enter amount"
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      Maximum payment
                    </span>

                    <button
                      type="button"
                      disabled={paymentLoading}
                      onClick={() =>
                        setPaymentAmount(
                          Number(
                            selectedInvoice.balance ||
                              0
                          ).toFixed(2)
                        )
                      }
                      className="font-semibold text-[var(--color-primary)] hover:underline"
                    >
                      Pay full balance
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-lg shadow-sm dark:bg-slate-700">
                      💳
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Paystack
                      </p>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Secure online payment
                      </p>
                    </div>
                  </div>
                </div>

                {paymentError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                    <span>
                      {paymentError}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={paymentLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {paymentLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Starting Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Continue to Paystack
                    </>
                  )}
                </button>

                <p className="text-center text-xs leading-5 text-slate-400">
                  You will be redirected to Paystack to
                  complete your payment securely.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentFees;