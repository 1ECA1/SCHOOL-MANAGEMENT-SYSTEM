import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Printer,
  ReceiptText,
  CalendarDays,
  CreditCard,
  User,
  FileText,
  Hash,
  Wallet,
  Loader2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Globe,
} from "lucide-react";

import api from "../../services/api";

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

  return date.toLocaleString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DetailRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[var(--color-primary)] dark:bg-slate-800">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-900 dark:text-slate-100">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function ReceiptDetail({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0 dark:border-slate-800">
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value || "—"}
      </span>
    </div>
  );
}

export default function StudentPaymentReceipt() {
  const navigate = useNavigate();
  const { paymentId } = useParams();

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadReceipt = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await api.get(
          `/finance/payments/${paymentId}/receipt/`
        );

        if (mounted) {
          setReceipt(response.data);
        }
      } catch (err) {
        if (!mounted) {
          return;
        }

        const message =
          err?.response?.data?.detail ||
          "Unable to load this payment receipt.";

        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (paymentId) {
      loadReceipt();
    } else {
      setLoading(false);
      setError("Payment ID was not provided.");
    }

    return () => {
      mounted = false;
    };
  }, [paymentId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={34}
            className="animate-spin text-[var(--color-primary)]"
          />

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading payment receipt...
          </p>
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <button
          type="button"
          onClick={() =>
            navigate("/student/fees")
          }
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:underline"
        >
          <ArrowLeft size={18} />
          Back to Fees & Payments
        </button>

        <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/40 dark:bg-[var(--color-card)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <AlertCircle size={28} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
            Receipt Unavailable
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            {error ||
              "This payment receipt could not be loaded."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/student/fees")
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <ArrowLeft size={17} />
            Return to Fees
          </button>
        </div>
      </div>
    );
  }

  const receiptInfo = receipt.receipt || {};
  const school = receipt.school || {};
  const student = receipt.student || {};
  const invoice = receipt.invoice || {};
  const payment = receipt.payment || {};
  const payer = receipt.payer || {};
  const invoiceBalance =
    receipt.invoice_balance || {};

  return (
    <>
      <div className="min-h-full bg-[var(--color-background)] px-4 py-6 sm:px-6 lg:px-8 print:bg-white print:p-0">
        {/* ACTION BUTTONS */}
        <div className="mx-auto mb-6 flex max-w-5xl items-center justify-between gap-4 print:hidden">
          <button
            type="button"
            onClick={() =>
              navigate("/student/fees")
            }
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-[var(--color-card)] dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={18} />
            Back to Fees
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            <Printer size={18} />
            Print Receipt
          </button>
        </div>

        {/* RECEIPT */}
        <div
          id="payment-receipt"
          className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-[var(--color-card)] print:max-w-none print:rounded-none print:border-0 print:shadow-none"
        >
          {/* HEADER */}
          <div className="border-b border-slate-200 px-6 py-7 sm:px-10 print:px-8 print:py-5 dark:border-slate-700">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              {/* SCHOOL BRANDING */}
              <div className="flex items-start gap-4">
                {school.logo_url ? (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm print:h-16 print:w-16 dark:border-slate-700">
                    <img
                      src={school.logo_url}
                      alt={`${school.name || "School"} logo`}
                      className="h-full w-full object-contain"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white print:h-16 print:w-16">
                    <ReceiptText size={30} />
                  </div>
                )}

                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white print:text-lg">
                    {school.name ||
                      "EduManageERP"}
                  </h1>

                  {school.address && (
                    <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin
                        size={13}
                        className="mt-0.5 shrink-0"
                      />

                      <span>
                        {school.address}
                      </span>
                    </div>
                  )}

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    {school.phone && (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone size={12} />
                        {school.phone}
                      </span>
                    )}

                    {school.email && (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail size={12} />
                        {school.email}
                      </span>
                    )}

                    {/* {school.website && (
                      <span className="inline-flex items-center gap-1.5">
                        <Globe size={12} />
                        {school.website}
                      </span>
                    )} */}
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Official Payment Receipt
                  </p>
                </div>
              </div>

              {/* RECEIPT NUMBER */}
              <div className="sm:text-right">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <CheckCircle2 size={17} />
                  {receiptInfo.status_display ||
                    "Successful"}
                </div>

                <p className="mt-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                  Receipt Number
                </p>

                <p className="mt-1 break-all text-sm font-bold text-slate-900 dark:text-white">
                  {receiptInfo.receipt_number ||
                    payment.reference}
                </p>
              </div>
            </div>
          </div>

          {/* AMOUNT */}
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-7 sm:px-10 print:px-8 print:py-5 dark:border-slate-700 dark:bg-slate-900/50">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Amount Paid
              </p>

              <p className="mt-2 text-4xl font-extrabold tracking-tight text-[var(--color-primary)] print:text-3xl">
                {formatCurrency(
                  payment.amount
                )}
              </p>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Payment received successfully
              </p>
            </div>
          </div>

          {/* STUDENT + PAYMENT INFORMATION */}
          <div className="grid gap-8 px-6 py-7 sm:px-10 md:grid-cols-2 print:grid-cols-2 print:gap-6 print:px-8 print:py-6">
            <section>
              <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <User
                  size={18}
                  className="text-[var(--color-primary)]"
                />
                Student Information
              </h2>

              <div className="space-y-5">
                <DetailRow
                  icon={User}
                  label="Student Name"
                  value={student.name}
                />

                <DetailRow
                  icon={Hash}
                  label="Student ID"
                  value={student.id}
                />

                <DetailRow
                  icon={FileText}
                  label="Invoice Number"
                  value={
                    invoice.invoice_number
                  }
                />

                <DetailRow
                  icon={Wallet}
                  label="Fee Category"
                  value={
                    invoice.fee_category
                  }
                />
              </div>
            </section>

            <section>
              <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                <CreditCard
                  size={18}
                  className="text-[var(--color-primary)]"
                />
                Payment Information
              </h2>

              <div className="space-y-5">
                <DetailRow
                  icon={CalendarDays}
                  label="Payment Date"
                  value={formatDate(
                    payment.payment_date
                  )}
                />

                <DetailRow
                  icon={CreditCard}
                  label="Payment Method"
                  value={
                    payment.payment_method_display ||
                    payment.payment_method
                  }
                />

                <DetailRow
                  icon={ReceiptText}
                  label="Gateway"
                  value={
                    payment.gateway_display ||
                    payment.gateway
                  }
                />

                <DetailRow
                  icon={Hash}
                  label="Transaction ID"
                  value={
                    payment.transaction_id ||
                    "—"
                  }
                />
              </div>
            </section>
          </div>

          {/* ACADEMIC INFORMATION */}
          <div className="mx-6 rounded-2xl border border-slate-200 px-5 py-4 sm:mx-10 print:mx-8 dark:border-slate-700">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Academic Information
            </h2>

            <div className="grid gap-4 sm:grid-cols-3 print:grid-cols-3">
              <ReceiptDetail
                label="Academic Session"
                value={
                  invoice.academic_session
                }
              />

              <ReceiptDetail
                label="Term"
                value={invoice.term}
              />

              <ReceiptDetail
                label="Description"
                value={invoice.description}
              />
            </div>
          </div>

          {/* PAYMENT + INVOICE SUMMARY */}
          <div className="grid gap-8 px-6 py-7 sm:px-10 md:grid-cols-2 print:grid-cols-2 print:gap-6 print:px-8 print:py-6">
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Payment Details
              </h2>

              <div className="rounded-2xl border border-slate-200 px-5 dark:border-slate-700">
                <ReceiptDetail
                  label="Amount Paid"
                  value={formatCurrency(
                    payment.amount
                  )}
                />

                <ReceiptDetail
                  label="Payment Method"
                  value={
                    payment.payment_method_display ||
                    payment.payment_method
                  }
                />

                <ReceiptDetail
                  label="Gateway"
                  value={
                    payment.gateway_display ||
                    payment.gateway
                  }
                />

                <ReceiptDetail
                  label="Reference"
                  value={payment.reference}
                />

                <ReceiptDetail
                  label="Gateway Reference"
                  value={
                    payment.gateway_reference
                  }
                />
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Invoice Summary
              </h2>

              <div className="rounded-2xl border border-slate-200 px-5 dark:border-slate-700">
                <ReceiptDetail
                  label="Invoice Amount"
                  value={formatCurrency(
                    invoiceBalance.invoice_amount
                  )}
                />

                <ReceiptDetail
                  label="Discount"
                  value={formatCurrency(
                    invoiceBalance.discount
                  )}
                />

                <ReceiptDetail
                  label="Total Paid"
                  value={formatCurrency(
                    invoiceBalance.amount_paid
                  )}
                />

                <ReceiptDetail
                  label="Balance Remaining"
                  value={formatCurrency(
                    invoiceBalance.balance
                  )}
                />
              </div>
            </section>
          </div>

          {/* PAYER */}
          <div className="mx-6 mb-6 rounded-2xl bg-slate-50 px-5 py-4 sm:mx-10 print:mx-8 print:mb-5 dark:bg-slate-900">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Payment Made By
                </p>

                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                  {payer.name || "—"}
                </p>
              </div>

              <div className="sm:text-right">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Payer Type
                </p>

                <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                  {payer.type_display ||
                    payer.type ||
                    "—"}
                </p>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="border-t border-slate-200 px-6 py-5 text-center sm:px-10 print:px-8 print:py-4 dark:border-slate-700">
            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
              This receipt confirms that the payment
              above was successfully received and
              verified.
            </p>

            <p className="mt-2 text-xs font-medium text-slate-400">
              {school.name ||
                "EduManageERP"}{" "}
              • EduManageERP
            </p>
          </div>
        </div>
      </div>

      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 10mm;
            }

            html,
            body {
              background: #ffffff !important;
            }

            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            #payment-receipt {
              width: 100%;
            }

            #payment-receipt img {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        `}
      </style>
    </>
  );
}