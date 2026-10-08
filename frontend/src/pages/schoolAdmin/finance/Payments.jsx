import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  getInvoices,
  getPayments,
  createPayment,
  deletePayment,
} from "../../../services/financeService";


const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
};


const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


const getItems = (data) => {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};


const inputClass =
  "w-full rounded-xl border border-black/10 bg-[var(--color-background)] px-3.5 py-2.5 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text)]/40 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 dark:border-white/10";


const emptyForm = {
  invoice: "",
  amount: "",
  payment_method: "CASH",
  reference: "",
  gateway: "MANUAL",
  transaction_id: "",
  payment_date: "",
  notes: "",
};


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
    label: "Online",
  },
  {
    value: "POS",
    label: "POS",
  },
];


const STATUS_OPTIONS = [
  {
    value: "",
    label: "All statuses",
  },
  {
    value: "SUCCESSFUL",
    label: "Successful",
  },
  {
    value: "PENDING",
    label: "Pending",
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


function StatCard({
  icon: Icon,
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-[var(--color-card)] p-5 shadow-sm dark:border-white/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--color-text)]/60">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
            {value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-[var(--color-text)]/50">
              {description}
            </p>
          )}
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}


function Field({
  label,
  children,
  required = false,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
        {label}

        {required && (
          <span className="ml-1 text-[var(--color-primary)]">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}


function Modal({
  title,
  children,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[var(--color-card)] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-[var(--color-card)] px-5 py-4 dark:border-white/10">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--color-text)]/60 transition hover:bg-[var(--color-background)] hover:text-[var(--color-text)]"
          >
            <X size={19} />
          </button>
        </div>

        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}


function Payments() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState(emptyForm);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");

  const loadData = async ({
    showLoader = true,
  } = {}) => {
    try {
      setError("");

      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const [
        paymentsData,
        invoicesData,
      ] = await Promise.all([
        getPayments(),
        getInvoices(),
      ]);

      setPayments(getItems(paymentsData));
      setInvoices(getItems(invoicesData));
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Unable to load payment data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);


  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [success]);


  const successfulPayments = useMemo(
    () =>
      payments.filter(
        (payment) =>
          payment.status === "SUCCESSFUL"
      ),
    [payments]
  );


  const totalCollected = useMemo(
    () =>
      successfulPayments.reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0
      ),
    [successfulPayments]
  );


  const pendingAmount = useMemo(
    () =>
      payments
        .filter(
          (payment) =>
            payment.status === "PENDING"
        )
        .reduce(
          (total, payment) =>
            total + Number(payment.amount || 0),
          0
        ),
    [payments]
  );


  const filteredPayments = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase();

    return payments.filter((payment) => {
      const matchesStatus =
        !statusFilter ||
        payment.status === statusFilter;

      const matchesMethod =
        !methodFilter ||
        payment.payment_method === methodFilter;

      const searchable = [
        payment.reference,
        payment.invoice_number,
        payment.student_name,
        payment.payer_name,
        payment.transaction_id,
        payment.gateway_reference,
        payment.payment_method_display,
        payment.status_display,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchValue ||
        searchable.includes(searchValue);

      return (
        matchesStatus &&
        matchesMethod &&
        matchesSearch
      );
    });
  }, [
    payments,
    search,
    statusFilter,
    methodFilter,
  ]);


  const openPaymentModal = () => {
    setForm({
      ...emptyForm,
      payment_date: new Date()
        .toISOString()
        .slice(0, 16),
    });

    setError("");
    setModalOpen(true);
  };


  const selectedInvoice = useMemo(() => {
    if (!form.invoice) return null;

    return invoices.find(
      (invoice) =>
        String(invoice.id) ===
        String(form.invoice)
    );
  }, [form.invoice, invoices]);


  const invoiceRemainingBalance = useMemo(() => {
    if (!selectedInvoice) return 0;

    return Math.max(
      0,
      Number(selectedInvoice.balance || 0)
    );
  }, [selectedInvoice]);


  const handleInvoiceChange = (value) => {
    const invoice = invoices.find(
      (item) =>
        String(item.id) === String(value)
    );

    setForm((current) => ({
      ...current,
      invoice: value,
      amount:
        invoice?.balance != null
          ? Number(invoice.balance)
          : "",
    }));
  };


  const submitPayment = async (event) => {
    event.preventDefault();

    try {
      setError("");

      if (!form.invoice) {
        setError("Please select an invoice.");
        return;
      }

      const amount = Number(form.amount);

      if (!amount || amount <= 0) {
        setError(
          "Payment amount must be greater than zero."
        );
        return;
      }

      if (
        invoiceRemainingBalance > 0 &&
        amount > invoiceRemainingBalance
      ) {
        setError(
          `Payment cannot exceed the invoice balance of ${formatCurrency(
            invoiceRemainingBalance
          )}.`
        );

        return;
      }

      setSaving(true);

      const payload = {
        invoice: Number(form.invoice),
        amount,
        payment_method:
          form.payment_method,
        gateway:
          form.gateway || "MANUAL",
        reference:
          form.reference.trim(),
        transaction_id:
          form.transaction_id.trim(),
        payment_date:
          form.payment_date || undefined,
        notes:
          form.notes.trim(),
      };

      await createPayment(payload);

      setSuccess(
        "Payment recorded successfully."
      );

      setModalOpen(false);
      setForm(emptyForm);

      await loadData({
        showLoader: false,
      });
    } catch (err) {
      console.error(err);

      const data = err?.response?.data;

      setError(
        data?.detail ||
          data?.message ||
          data?.amount?.[0] ||
          data?.invoice?.[0] ||
          data?.non_field_errors?.[0] ||
          "Unable to record payment."
      );
    } finally {
      setSaving(false);
    }
  };


  const handleDelete = async (payment) => {
    const confirmed = window.confirm(
      `Delete payment ${payment.reference || payment.id}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deletePayment(payment.id);

      setSuccess(
        "Payment deleted successfully."
      );

      await loadData({
        showLoader: false,
      });
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Unable to delete this payment."
      );
    }
  };


  const getStatusClass = (status) => {
    if (status === "SUCCESSFUL") {
      return "bg-[var(--color-primary)]/10 text-[var(--color-primary)]";
    }

    if (status === "PENDING") {
      return "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]";
    }

    return "bg-[var(--color-background)] text-[var(--color-text)]/60";
  };


  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-[var(--color-text)]/60">
          <Loader2
            size={22}
            className="animate-spin text-[var(--color-primary)]"
          />

          <span>Loading payments...</span>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-full bg-[var(--color-background)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--color-primary)]">
              School Admin Finance
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
              Payments
            </h1>

            <p className="mt-1 text-sm text-[var(--color-text)]/60">
              Record and monitor student fee payments.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                loadData({
                  showLoader: false,
                })
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-primary)]/40 disabled:opacity-60 dark:border-white/10"
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
              onClick={openPaymentModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              <Plus size={17} />
              Record Payment
            </button>
          </div>
        </div>


        {/* ALERTS */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-4">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-[var(--color-primary)]"
            />

            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--color-text)]">
                Payment action failed
              </p>

              <p className="mt-1 text-sm text-[var(--color-text)]/65">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 text-[var(--color-text)]/50"
            >
              <X size={17} />
            </button>
          </div>
        )}


        {success && (
          <div className="flex items-center gap-3 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-4">
            <CheckCircle2
              size={19}
              className="shrink-0 text-[var(--color-primary)]"
            />

            <p className="text-sm font-medium text-[var(--color-text)]">
              {success}
            </p>
          </div>
        )}


        {/* STATISTICS */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={CreditCard}
            label="Total Payments"
            value={payments.length}
            description="Payment records"
          />

          <StatCard
            icon={CheckCircle2}
            label="Successful"
            value={successfulPayments.length}
            description="Completed payments"
          />

          <StatCard
            icon={FileText}
            label="Total Collected"
            value={formatCurrency(totalCollected)}
            description="Successful payments"
          />

          <StatCard
            icon={CreditCard}
            label="Pending Amount"
            value={formatCurrency(pendingAmount)}
            description="Pending payment records"
          />
        </div>


        {/* FILTERS */}
        <div className="rounded-2xl border border-black/5 bg-[var(--color-card)] p-4 shadow-sm dark:border-white/10">
          <div className="grid gap-3 lg:grid-cols-[1fr_200px_200px]">

            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text)]/40"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search reference, invoice, student..."
                className={`${inputClass} pl-10`}
              />
            </div>


            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className={inputClass}
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


            <select
              value={methodFilter}
              onChange={(event) =>
                setMethodFilter(
                  event.target.value
                )
              }
              className={inputClass}
            >
              <option value="">
                All payment methods
              </option>

              {PAYMENT_METHODS.map((method) => (
                <option
                  key={method.value}
                  value={method.value}
                >
                  {method.label}
                </option>
              ))}
            </select>

          </div>
        </div>


        {/* PAYMENTS TABLE */}
        <div className="overflow-hidden rounded-2xl border border-black/5 bg-[var(--color-card)] shadow-sm dark:border-white/10">
          <div className="flex items-center justify-between border-b border-black/5 px-5 py-4 dark:border-white/10">
            <div>
              <h2 className="font-semibold text-[var(--color-text)]">
                Payment Records
              </h2>

              <p className="mt-1 text-xs text-[var(--color-text)]/50">
                Showing {filteredPayments.length} of{" "}
                {payments.length} payment records
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1200px] w-full text-left">
              <thead className="bg-[var(--color-background)]">
                <tr className="text-xs uppercase tracking-wide text-[var(--color-text)]/55">
                  <th className="px-5 py-3">
                    Reference
                  </th>

                  <th className="px-5 py-3">
                    Invoice
                  </th>

                  <th className="px-5 py-3">
                    Student
                  </th>

                  <th className="px-5 py-3">
                    Amount
                  </th>

                  <th className="px-5 py-3">
                    Method
                  </th>

                  <th className="px-5 py-3">
                    Payer
                  </th>

                  <th className="px-5 py-3">
                    Date
                  </th>

                  <th className="px-5 py-3">
                    Status
                  </th>

                  <th className="px-5 py-3 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-black/5 dark:divide-white/10">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-5 py-12 text-center"
                    >
                      <CreditCard
                        size={30}
                        className="mx-auto text-[var(--color-text)]/20"
                      />

                      <p className="mt-3 text-sm font-medium text-[var(--color-text)]">
                        No payments found
                      </p>

                      <p className="mt-1 text-xs text-[var(--color-text)]/50">
                        Try changing your filters or record
                        a new payment.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map(
                    (payment) => (
                      <tr
                        key={payment.id}
                        className="transition hover:bg-[var(--color-background)]"
                      >
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-[var(--color-text)]">
                            {payment.reference ||
                              "—"}
                          </p>

                          {payment.transaction_id && (
                            <p className="mt-1 text-xs text-[var(--color-text)]/45">
                              TX:{" "}
                              {payment.transaction_id}
                            </p>
                          )}
                        </td>


                        <td className="px-5 py-4 text-sm text-[var(--color-text)]">
                          {payment.invoice_number ||
                            "—"}
                        </td>


                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-[var(--color-text)]">
                            {payment.student_name ||
                              "—"}
                          </p>
                        </td>


                        <td className="px-5 py-4 text-sm font-semibold text-[var(--color-text)]">
                          {formatCurrency(
                            payment.amount
                          )}
                        </td>


                        <td className="px-5 py-4 text-sm text-[var(--color-text)]/70">
                          {payment.payment_method_display ||
                            payment.payment_method ||
                            "—"}
                        </td>


                        <td className="px-5 py-4">
                          <p className="text-sm text-[var(--color-text)]">
                            {payment.payer_name ||
                              "—"}
                          </p>

                          {payment.payer_type_display && (
                            <p className="mt-1 text-xs text-[var(--color-text)]/45">
                              {payment.payer_type_display}
                            </p>
                          )}
                        </td>


                        <td className="px-5 py-4 text-sm text-[var(--color-text)]/65">
                          {formatDate(
                            payment.payment_date
                          )}
                        </td>


                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                              payment.status
                            )}`}
                          >
                            {payment.status_display ||
                              payment.status ||
                              "—"}
                          </span>
                        </td>


                        <td className="px-5 py-4">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  payment
                                )
                              }
                              className="rounded-lg p-2 text-[var(--color-text)]/45 transition hover:bg-[var(--color-background)] hover:text-[var(--color-primary)]"
                              title="Delete payment"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>


      {/* RECORD PAYMENT MODAL */}
      {modalOpen && (
        <Modal
          title="Record Payment"
          onClose={() => {
            if (!saving) {
              setModalOpen(false);
            }
          }}
        >
          <form
            onSubmit={submitPayment}
            className="space-y-5"
          >

            <Field
              label="Invoice"
              required
            >
              <select
                value={form.invoice}
                onChange={(event) =>
                  handleInvoiceChange(
                    event.target.value
                  )
                }
                className={inputClass}
              >
                <option value="">
                  Select invoice
                </option>

                {invoices
                  .filter(
                    (invoice) =>
                      invoice.status !==
                        "PAID" &&
                      invoice.status !==
                        "CANCELLED" &&
                      Number(
                        invoice.balance || 0
                      ) > 0
                  )
                  .map((invoice) => (
                    <option
                      key={invoice.id}
                      value={invoice.id}
                    >
                      {invoice.invoice_number} —{" "}
                      {invoice.student_name || "Student"}{" "}
                      — Balance:{" "}
                      {formatCurrency(
                        invoice.balance
                      )}
                    </option>
                  ))}
              </select>
            </Field>


            {selectedInvoice && (
              <div className="rounded-xl border border-[var(--color-primary)]/15 bg-[var(--color-primary)]/5 p-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-[var(--color-text)]/50">
                      Student
                    </p>

                    <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
                      {selectedInvoice.student_name ||
                        "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[var(--color-text)]/50">
                      Invoice Amount
                    </p>

                    <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
                      {formatCurrency(
                        selectedInvoice.amount
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-[var(--color-text)]/50">
                      Balance
                    </p>

                    <p className="mt-1 text-sm font-bold text-[var(--color-primary)]">
                      {formatCurrency(
                        invoiceRemainingBalance
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}


            <div className="grid gap-4 sm:grid-cols-2">

              <Field
                label="Payment Amount"
                required
              >
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  max={
                    invoiceRemainingBalance ||
                    undefined
                  }
                  value={form.amount}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      amount:
                        event.target.value,
                    }))
                  }
                  placeholder="0.00"
                  className={inputClass}
                />
              </Field>


              <Field
                label="Payment Method"
                required
              >
                <select
                  value={form.payment_method}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      payment_method:
                        event.target.value,
                    }))
                  }
                  className={inputClass}
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
              </Field>


              <Field label="Reference">
                <input
                  value={form.reference}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      reference:
                        event.target.value,
                    }))
                  }
                  placeholder="e.g. PAY-00001"
                  className={inputClass}
                />
              </Field>


              <Field label="Transaction ID">
                <input
                  value={form.transaction_id}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      transaction_id:
                        event.target.value,
                    }))
                  }
                  placeholder="Bank/POS transaction ID"
                  className={inputClass}
                />
              </Field>


              <Field label="Payment Date">
                <input
                  type="datetime-local"
                  value={form.payment_date}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      payment_date:
                        event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </Field>


              <Field label="Gateway">
                <select
                  value={form.gateway}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      gateway:
                        event.target.value,
                    }))
                  }
                  className={inputClass}
                >
                  <option value="MANUAL">
                    Manual
                  </option>

                  <option value="PAYSTACK">
                    Paystack
                  </option>

                  <option value="FLUTTERWAVE">
                    Flutterwave
                  </option>

                  <option value="REMITA">
                    Remita
                  </option>
                </select>
              </Field>

            </div>


            <Field label="Notes">
              <textarea
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                rows={3}
                placeholder="Optional payment notes..."
                className={inputClass}
              />
            </Field>


            <div className="rounded-xl border border-[var(--color-secondary)]/20 bg-[var(--color-secondary)]/5 p-4">
              <p className="text-xs leading-5 text-[var(--color-text)]/65">
                Recording a successful payment will update
                the invoice's amount paid, balance and status
                automatically.
              </p>
            </div>


            <div className="flex justify-end gap-3 border-t border-black/5 pt-4 dark:border-white/10">
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  setModalOpen(false)
                }
                className="rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium text-[var(--color-text)] dark:border-white/10"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    Recording...
                  </>
                ) : (
                  <>
                    <Plus size={17} />

                    Record Payment
                  </>
                )}
              </button>
            </div>

          </form>
        </Modal>
      )}
    </div>
  );
}


export default Payments;