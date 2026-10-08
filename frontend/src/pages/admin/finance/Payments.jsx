import { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  Eye,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import {
  getPayments,
  getPayment,
} from "../../../services/financeService";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "SUCCESSFUL", label: "Successful" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
];

const PAYMENT_METHOD_OPTIONS = [
  { value: "", label: "All Payment Methods" },
  { value: "CASH", label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CARD", label: "Card" },
  { value: "ONLINE", label: "Online" },
  { value: "POS", label: "POS" },
];

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getStatusClasses = (status) => {
  switch (status) {
    case "SUCCESSFUL":
      return "bg-green-500/10 text-green-600 border-green-500/20";

    case "PENDING":
      return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";

    case "FAILED":
      return "bg-red-500/10 text-red-600 border-red-500/20";

    case "REFUNDED":
      return "bg-purple-500/10 text-purple-600 border-purple-500/20";

    default:
      return "bg-gray-500/10 text-gray-600 border-gray-500/20";
  }
};

const getPaymentMethodLabel = (payment) =>
  payment?.payment_method_display ||
  payment?.payment_method ||
  "—";

const getStatusLabel = (payment) =>
  payment?.status_display ||
  payment?.status ||
  "—";

const normalizeListResponse = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  return [];
};

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailsError, setDetailsError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const [showFilters, setShowFilters] = useState(false);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (status) {
        params.status = status;
      }

      if (paymentMethod) {
        params.payment_method = paymentMethod;
      }

      const response = await getPayments(params);

      setPayments(normalizeListResponse(response));
    } catch (err) {
      console.error("Failed to load payments:", err);

      setPayments([]);

      setError(
        err?.response?.data?.detail ||
          "Unable to load payments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [status, paymentMethod]);

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return payments;
    }

    return payments.filter((payment) => {
      const values = [
        payment?.reference,
        payment?.invoice_number,
        payment?.student_name,
        payment?.payer_name,
        payment?.transaction_id,
        payment?.gateway_reference,
        payment?.payment_method_display,
        payment?.payment_method,
        payment?.status_display,
        payment?.status,
        payment?.gateway_display,
        payment?.gateway,
      ];

      return values.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [payments, search]);

  const statistics = useMemo(() => {
    const successful = payments.filter(
      (payment) => payment?.status === "SUCCESSFUL"
    );

    const pending = payments.filter(
      (payment) => payment?.status === "PENDING"
    );

    const failed = payments.filter(
      (payment) => payment?.status === "FAILED"
    );

    const refunded = payments.filter(
      (payment) => payment?.status === "REFUNDED"
    );

    const successfulAmount = successful.reduce(
      (total, payment) =>
        total + Number(payment?.amount || 0),
      0
    );

    const pendingAmount = pending.reduce(
      (total, payment) =>
        total + Number(payment?.amount || 0),
      0
    );

    return {
      total: payments.length,
      successful: successful.length,
      pending: pending.length,
      failed: failed.length,
      refunded: refunded.length,
      successfulAmount,
      pendingAmount,
    };
  }, [payments]);

  const openPaymentDetails = async (payment) => {
    if (!payment?.id) {
      return;
    }

    try {
      setDetailsLoading(true);
      setDetailsError("");
      setSelectedPayment(null);

      const response = await getPayment(payment.id);

      setSelectedPayment(response);
    } catch (err) {
      console.error("Failed to load payment details:", err);

      setDetailsError(
        err?.response?.data?.detail ||
          "Unable to load payment details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const closePaymentDetails = () => {
    setSelectedPayment(null);
    setDetailsError("");
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setPaymentMethod("");
  };

  return (
    <div className="min-h-full bg-[var(--color-background)] p-3 text-[var(--color-text)] sm:p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">

        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <CreditCard
                  size={24}
                  className="shrink-0 text-[var(--color-primary)]"
                />

                <h1 className="truncate text-xl font-bold text-[var(--color-text)] sm:text-2xl">
                  Payments
                </h1>
              </div>

              <p className="mt-1 text-sm text-[var(--color-secondary)]">
                View and monitor all payment transactions
                across the schools.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadPayments}
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-5">
          <div className="rounded-2xl border border-[var(--color-secondary)] bg-[var(--color-card)] p-4 sm:p-5">
            <p className="text-xs text-[var(--color-secondary)] sm:text-sm">
              Total Payments
            </p>

            <p className="mt-2 text-xl font-bold text-[var(--color-text)] sm:text-2xl">
              {statistics.total.toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-green-500/20 bg-[var(--color-card)] p-4 sm:p-5">
            <p className="text-xs text-green-600 sm:text-sm">
              Successful
            </p>

            <p className="mt-2 text-xl font-bold text-[var(--color-text)] sm:text-2xl">
              {statistics.successful.toLocaleString()}
            </p>

            <p className="mt-1 text-xs text-[var(--color-secondary)]">
              {formatCurrency(statistics.successfulAmount)}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-500/20 bg-[var(--color-card)] p-4 sm:p-5">
            <p className="text-xs text-yellow-600 sm:text-sm">
              Pending
            </p>

            <p className="mt-2 text-xl font-bold text-[var(--color-text)] sm:text-2xl">
              {statistics.pending.toLocaleString()}
            </p>

            <p className="mt-1 text-xs text-[var(--color-secondary)]">
              {formatCurrency(statistics.pendingAmount)}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-[var(--color-card)] p-4 sm:p-5">
            <p className="text-xs text-red-600 sm:text-sm">
              Failed
            </p>

            <p className="mt-2 text-xl font-bold text-[var(--color-text)] sm:text-2xl">
              {statistics.failed.toLocaleString()}
            </p>
          </div>

          <div className="col-span-2 rounded-2xl border border-purple-500/20 bg-[var(--color-card)] p-4 sm:col-span-1 sm:p-5">
            <p className="text-xs text-purple-600 sm:text-sm">
              Refunded
            </p>

            <p className="mt-2 text-xl font-bold text-[var(--color-text)] sm:text-2xl">
              {statistics.refunded.toLocaleString()}
            </p>
          </div>
        </div>

        {/* SEARCH + FILTERS */}
        <div className="rounded-2xl border border-[var(--color-secondary)] bg-[var(--color-card)] p-3 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)]"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search reference, invoice, student, payer..."
                className="w-full rounded-xl border border-[var(--color-secondary)] bg-[var(--color-background)] py-2.5 pl-10 pr-4 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-secondary)] focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowFilters((current) => !current)
                }
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition sm:px-4 ${
                  showFilters ||
                  status ||
                  paymentMethod
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                    : "border-[var(--color-secondary)] text-[var(--color-text)] hover:bg-[var(--color-background)]"
                }`}
              >
                <Filter size={17} />
                Filters
              </button>

              {(search || status || paymentMethod) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-secondary)] px-3 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-background)] sm:px-4"
                >
                  <X size={17} />
                  Clear
                </button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 gap-4 border-t border-[var(--color-secondary)] pt-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                  Payment Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value)
                  }
                  className="w-full rounded-xl border border-[var(--color-secondary)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                  Payment Method
                </label>

                <select
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value)
                  }
                  className="w-full rounded-xl border border-[var(--color-secondary)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                >
                  {PAYMENT_METHOD_OPTIONS.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ERROR */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* PAYMENTS */}
        <div className="overflow-hidden rounded-2xl border border-[var(--color-secondary)] bg-[var(--color-card)]">
          <div className="flex items-center justify-between border-b border-[var(--color-secondary)] px-4 py-4 sm:px-5">
            <div className="min-w-0">
              <h2 className="font-semibold text-[var(--color-text)]">
                Payment Transactions
              </h2>

              <p className="mt-1 text-xs text-[var(--color-secondary)]">
                Showing {filteredPayments.length} of{" "}
                {payments.length} payments
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-[var(--color-secondary)]">
                <Loader2
                  size={20}
                  className="animate-spin"
                />
                Loading payments...
              </div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <CreditCard
                size={40}
                className="text-[var(--color-secondary)]"
              />

              <h3 className="mt-3 font-semibold text-[var(--color-text)]">
                No payments found
              </h3>

              <p className="mt-1 max-w-md text-sm text-[var(--color-secondary)]">
                There are no payments matching your
                current search or filters.
              </p>
            </div>
          ) : (
            <>
              {/* MOBILE VIEW — ONLY STUDENT + VIEW */}
              <div className="divide-y divide-[var(--color-secondary)] md:hidden">
                {filteredPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex min-w-0 items-center justify-between gap-3 px-4 py-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--color-text)]">
                        {payment.student_name || "—"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        openPaymentDetails(payment)
                      }
                      className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-[var(--color-secondary)] px-3 py-2 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-background)]"
                    >
                      <Eye size={16} />
                      <span>View</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* DESKTOP / TABLET VIEW */}
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-[1050px] w-full">
                  <thead>
                    <tr className="border-b border-[var(--color-secondary)] bg-[var(--color-background)]">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
                        Payment
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
                        Student
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
                        Invoice
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
                        Amount
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
                        Method
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
                        Status
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
                        Date
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-b border-[var(--color-secondary)] last:border-b-0 hover:bg-[var(--color-background)]/50"
                      >
                        <td className="px-5 py-4">
                          <div className="font-medium text-[var(--color-text)]">
                            {payment.reference || "—"}
                          </div>

                          {payment.gateway_display && (
                            <div className="mt-1 text-xs text-[var(--color-secondary)]">
                              {payment.gateway_display}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-medium text-[var(--color-text)]">
                            {payment.student_name || "—"}
                          </div>

                          {payment.payer_name && (
                            <div className="mt-1 text-xs text-[var(--color-secondary)]">
                              Payer: {payment.payer_name}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-[var(--color-text)]">
                          {payment.invoice_number || "—"}
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-semibold text-[var(--color-text)]">
                            {formatCurrency(payment.amount)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-[var(--color-text)]">
                          {getPaymentMethodLabel(payment)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                              payment.status
                            )}`}
                          >
                            {getStatusLabel(payment)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-[var(--color-secondary)]">
                          {formatDate(payment.payment_date)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              openPaymentDetails(payment)
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-secondary)] px-3 py-2 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-background)]"
                          >
                            <Eye size={16} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* PAYMENT DETAILS MODAL */}
      {(selectedPayment ||
        detailsLoading ||
        detailsError) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--color-secondary)] bg-[var(--color-card)] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[var(--color-secondary)] bg-[var(--color-card)] px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <h2 className="font-semibold text-[var(--color-text)]">
                  Payment Details
                </h2>

                {selectedPayment?.reference && (
                  <p className="mt-1 truncate text-xs text-[var(--color-secondary)]">
                    {selectedPayment.reference}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={closePaymentDetails}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--color-secondary)] transition hover:bg-[var(--color-background)] hover:text-[var(--color-text)]"
              >
                <X size={19} />
              </button>
            </div>

            {detailsLoading ? (
              <div className="flex min-h-64 items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-[var(--color-secondary)]">
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />
                  Loading payment details...
                </div>
              </div>
            ) : detailsError ? (
              <div className="p-4 sm:p-5">
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600">
                  {detailsError}
                </div>
              </div>
            ) : selectedPayment ? (
              <div className="space-y-6 p-4 sm:p-5">

                {/* STATUS */}
                <div className="flex flex-col gap-3 rounded-xl border border-[var(--color-secondary)] bg-[var(--color-background)] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-[var(--color-secondary)]">
                      Payment Status
                    </p>

                    <span
                      className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                        selectedPayment.status
                      )}`}
                    >
                      {getStatusLabel(selectedPayment)}
                    </span>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs text-[var(--color-secondary)]">
                      Amount
                    </p>

                    <p className="mt-1 text-xl font-bold text-[var(--color-text)]">
                      {formatCurrency(
                        selectedPayment.amount
                      )}
                    </p>
                  </div>
                </div>

                {/* PAYMENT INFORMATION */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-[var(--color-text)]">
                    Payment Information
                  </h3>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <DetailItem
                      label="Reference"
                      value={selectedPayment.reference}
                    />

                    <DetailItem
                      label="Payment Method"
                      value={
                        selectedPayment.payment_method_display ||
                        selectedPayment.payment_method
                      }
                    />

                    <DetailItem
                      label="Gateway"
                      value={
                        selectedPayment.gateway_display ||
                        selectedPayment.gateway
                      }
                    />

                    <DetailItem
                      label="Payment Date"
                      value={formatDate(
                        selectedPayment.payment_date
                      )}
                    />

                    <DetailItem
                      label="Transaction Reference"
                      value={
                        selectedPayment.transaction_id
                      }
                    />

                    <DetailItem
                      label="Gateway Reference"
                      value={
                        selectedPayment.gateway_reference
                      }
                    />
                  </div>
                </div>

                {/* INVOICE / STUDENT */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-[var(--color-text)]">
                    Invoice & Student
                  </h3>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <DetailItem
                      label="Invoice"
                      value={
                        selectedPayment.invoice_number
                      }
                    />

                    <DetailItem
                      label="Student"
                      value={
                        selectedPayment.student_name
                      }
                    />

                    <DetailItem
                      label="Payer"
                      value={
                        selectedPayment.payer_name
                      }
                    />

                    <DetailItem
                      label="Payer Type"
                      value={
                        selectedPayment.payer_type_display ||
                        selectedPayment.payer_type
                      }
                    />
                  </div>
                </div>

                {/* NOTES */}
                {selectedPayment.notes && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-[var(--color-text)]">
                      Notes
                    </h3>

                    <div className="rounded-xl border border-[var(--color-secondary)] bg-[var(--color-background)] p-4 text-sm text-[var(--color-secondary)]">
                      {selectedPayment.notes}
                    </div>
                  </div>
                )}

                {/* RECORD DATES */}
                <div className="border-t border-[var(--color-secondary)] pt-4 text-xs text-[var(--color-secondary)]">
                  <div>
                    Created:{" "}
                    {formatDate(
                      selectedPayment.created_at
                    )}
                  </div>

                  <div className="mt-1">
                    Updated:{" "}
                    {formatDate(
                      selectedPayment.updated_at
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="rounded-xl border border-[var(--color-secondary)] bg-[var(--color-background)] p-3">
    <p className="text-xs text-[var(--color-secondary)]">
      {label}
    </p>

    <p className="mt-1 break-words text-sm font-medium text-[var(--color-text)]">
      {value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
        ? String(value)
        : "—"}
    </p>
  </div>
);

export default Payments;