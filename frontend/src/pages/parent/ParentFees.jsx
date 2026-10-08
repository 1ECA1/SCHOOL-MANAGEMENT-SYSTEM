import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  CreditCard,
  FileText,
  Loader2,
  Receipt,
  RefreshCw,
  Wallet,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getParentChildren } from "../../services/parentService";

import {
  getStudentFinancialStatement,
  getStudentPaymentReceipt,
  initiateStudentPayment,
  verifyPaystackPayment,
} from "../../services/financeService";

// ============================================================
// HELPERS
// ============================================================

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
};

const getImageUrl = (image) => {
  if (!image) return null;

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return `http://127.0.0.1:8000${image}`;
};

const getInitials = (name) => {
  return (
    name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "S"
  );
};

const getStatusLabel = (status) => {
  if (!status) return "UNKNOWN";

  return String(status)
    .replaceAll("_", " ")
    .toUpperCase();
};

// ============================================================
// COMPONENT
// ============================================================

export default function ParentFees() {
  const { user } = useAuth();

  // ==========================================================
  // CHILDREN
  // ==========================================================

  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState("");

  const [childrenLoading, setChildrenLoading] = useState(true);
  const [childrenError, setChildrenError] = useState("");

  // ==========================================================
  // FINANCIAL DATA
  // ==========================================================

  const [statement, setStatement] = useState(null);
  const [loadingStatement, setLoadingStatement] = useState(false);
  const [statementError, setStatementError] = useState("");

  // ==========================================================
  // PAYMENT
  // ==========================================================

  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // ==========================================================
  // RECEIPT
  // ==========================================================

  const [receipt, setReceipt] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [receiptError, setReceiptError] = useState("");

  // ==========================================================
  // REFRESH
  // ==========================================================

  const [refreshing, setRefreshing] = useState(false);

  // ==========================================================
  // LOAD PARENT CHILDREN
  // ==========================================================

  const loadChildren = async () => {
    if (!user?.parent_id) {
      setChildrenError(
        "No parent profile is linked to this account."
      );

      setChildrenLoading(false);

      return [];
    }

    try {
      setChildrenLoading(true);
      setChildrenError("");

      const data = await getParentChildren(
        user.parent_id
      );

      const childList = Array.isArray(data)
        ? data
        : data?.results || [];

      setChildren(childList);

      // ------------------------------------------------------
      // Automatically select the first child
      // ------------------------------------------------------

      setSelectedChildId((current) => {
        if (
          current &&
          childList.some(
            (child) =>
              String(child.id) === String(current)
          )
        ) {
          return current;
        }

        return childList.length > 0
          ? String(childList[0].id)
          : "";
      });

      /*
       * Return the fresh child list.
       *
       * This is useful when returning from Paystack because
       * the callback may need the newly loaded children
       * immediately.
       */

      return childList;
    } catch (err) {
      console.error(
        "Failed to load parent children:",
        err
      );

      setChildrenError(
        err?.response?.data?.detail ||
          "Unable to load your children."
      );

      setChildren([]);
      setSelectedChildId("");

      return [];
    } finally {
      setChildrenLoading(false);
    }
  };

  // ==========================================================
  // INITIAL CHILD LOAD
  // ==========================================================

  useEffect(() => {
    loadChildren();
  }, [user?.parent_id]);

  // ==========================================================
  // SELECTED CHILD
  // ==========================================================

  const selectedChild = useMemo(() => {
    return (
      children.find(
        (child) =>
          String(child.id) ===
          String(selectedChildId)
      ) || null
    );
  }, [children, selectedChildId]);

  // ==========================================================
  // LOAD FINANCIAL STATEMENT
  // ==========================================================

  const loadStatement = async (studentId) => {
    if (!studentId) {
      setStatement(null);
      return null;
    }

    try {
      setLoadingStatement(true);
      setStatementError("");

      /*
       * IMPORTANT:
       *
       * This student ID comes from the authenticated
       * parent's children endpoint.
       *
       * The backend still performs the final authorization.
       */

      const data =
        await getStudentFinancialStatement(
          studentId
        );

      /*
       * Replace the entire existing statement.
       *
       * This is important after a Paystack payment because
       * we don't want to merge old PENDING frontend data
       * with newly returned backend data.
       */

      setStatement(data);

      return data;
    } catch (err) {
      console.error(
        "Failed to load financial statement:",
        err
      );

      setStatement(null);

      setStatementError(
        err?.response?.data?.detail ||
          "Unable to load this student's financial information."
      );

      return null;
    } finally {
      setLoadingStatement(false);
    }
  };

  // ==========================================================
  // LOAD STATEMENT WHEN CHILD CHANGES
  // ==========================================================

  useEffect(() => {
    if (!selectedChildId) {
      setStatement(null);
      return;
    }

    loadStatement(selectedChildId);
  }, [selectedChildId]);

  // ==========================================================
  // MANUAL REFRESH
  // ==========================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      /*
       * Refresh children first.
       */

      const refreshedChildren =
        await loadChildren();

      /*
       * Keep the currently selected child if it still
       * exists in the refreshed child list.
       */

      const currentChildExists =
        selectedChildId &&
        refreshedChildren.some(
          (child) =>
            String(child.id) ===
            String(selectedChildId)
        );

      if (currentChildExists) {
        await loadStatement(selectedChildId);
      } else if (refreshedChildren.length > 0) {
        await loadStatement(
          refreshedChildren[0].id
        );
      } else {
        setStatement(null);
      }
    } finally {
      setRefreshing(false);
    }
  };

  // ==========================================================
  // INVOICE DATA
  // ==========================================================

  const invoices = useMemo(() => {
    if (!statement) return [];

    if (Array.isArray(statement.invoices)) {
      return statement.invoices;
    }

    return [];
  }, [statement]);

  // ==========================================================
  // PAYMENT DATA
  // ==========================================================

  const payments = useMemo(() => {
    if (!statement) return [];

    if (Array.isArray(statement.payments)) {
      return statement.payments;
    }

    return [];
  }, [statement]);

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary = useMemo(() => {
    return {
      totalInvoiced: Number(
        statement?.total_invoiced ??
          statement?.summary?.total_invoiced ??
          0
      ),

      totalDiscounts: Number(
        statement?.total_discounts ??
          statement?.summary?.total_discount ??
          0
      ),

      totalPaid: Number(
        statement?.total_paid ??
          statement?.summary?.total_paid ??
          0
      ),

      totalOutstanding: Number(
        statement?.total_outstanding ??
          statement?.summary?.total_balance ??
          0
      ),
    };
  }, [statement]);

  // ==========================================================
  // OPEN PAYMENT MODAL
  // ==========================================================

  const openPaymentModal = (invoice) => {
    setPaymentError("");
    setPaymentInvoice(invoice);

    const outstanding = Number(
      invoice?.balance ??
        invoice?.pending_amount ??
        invoice?.amount_due ??
        invoice?.amount ??
        0
    );

    setPaymentAmount(
      outstanding > 0
        ? String(outstanding)
        : ""
    );
  };

  // ==========================================================
  // CLOSE PAYMENT MODAL
  // ==========================================================

  const closePaymentModal = () => {
    if (paymentLoading) return;

    setPaymentInvoice(null);
    setPaymentAmount("");
    setPaymentError("");
  };

  // ==========================================================
  // INITIATE PAYSTACK PAYMENT
  // ==========================================================

  const handlePayment = async (event) => {
    event.preventDefault();

    if (!paymentInvoice) {
      return;
    }

    const amount = Number(paymentAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setPaymentError(
        "Please enter a valid payment amount."
      );

      return;
    }

    const invoiceBalance = Number(
      paymentInvoice.balance ??
        paymentInvoice.pending_amount ??
        paymentInvoice.amount_due ??
        0
    );

    if (
      invoiceBalance > 0 &&
      amount > invoiceBalance
    ) {
      setPaymentError(
        `Payment cannot exceed the outstanding balance of ${formatCurrency(
          invoiceBalance
        )}.`
      );

      return;
    }

    if (!selectedChildId) {
      setPaymentError(
        "Please select a child before making a payment."
      );

      return;
    }

    try {
      setPaymentLoading(true);
      setPaymentError("");

      // ======================================================
      // REMEMBER PAYMENT CONTEXT
      // ======================================================

      /*
       * The browser will leave this page when redirected
       * to Paystack.
       *
       * Save the child and invoice so that when Paystack
       * redirects back, we know exactly what to reload.
       */

      sessionStorage.setItem(
        "parent_payment_child_id",
        String(selectedChildId)
      );

      sessionStorage.setItem(
        "parent_payment_invoice_id",
        String(paymentInvoice.id)
      );

      // ======================================================
      // CREATE PAYMENT
      // ======================================================

      /*
       * The backend determines whether the authenticated
       * user is a STUDENT or PARENT.
       *
       * The backend also verifies that this parent has
       * access to the selected student's invoice.
       */

      const response =
        await initiateStudentPayment({
          invoice: paymentInvoice.id,
          amount,
          gateway: "PAYSTACK",
        });

      const authorizationUrl =
        response?.paystack?.authorization_url;

      if (!authorizationUrl) {
        throw new Error(
          "Paystack authorization URL was not returned."
        );
      }

      // ======================================================
      // REDIRECT TO PAYSTACK
      // ======================================================

      window.location.href =
        authorizationUrl;
    } catch (err) {
      console.error(
        "Failed to initiate payment:",
        err
      );

      /*
       * Payment did not successfully leave this page,
       * therefore remove the temporary callback data.
       */

      sessionStorage.removeItem(
        "parent_payment_child_id"
      );

      sessionStorage.removeItem(
        "parent_payment_invoice_id"
      );

      setPaymentError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "Unable to initiate payment."
      );

      setPaymentLoading(false);
    }
  };

  // ==========================================================
  // PAYMENT CALLBACK
  // ==========================================================

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const reference =
      params.get("reference") ||
      params.get("trxref");

    /*
     * No Paystack reference means this is just a normal
     * visit to the Fees page.
     */

    if (!reference) {
      return;
    }

    /*
     * Recover the child that started the payment.
     */

    const pendingChildId =
      sessionStorage.getItem(
        "parent_payment_child_id"
      );

    const pendingInvoiceId =
      sessionStorage.getItem(
        "parent_payment_invoice_id"
      );

    const verifyPayment = async () => {
      try {
        setLoadingStatement(true);
        setStatementError("");

        // ====================================================
        // VERIFY WITH BACKEND
        // ====================================================

        /*
         * The backend remains the authority.
         *
         * This request checks Paystack and updates the
         * Django payment when necessary.
         */

        const verification =
          await verifyPaystackPayment(
            reference
          );

        console.log(
          "Paystack payment verification:",
          verification
        );

        // ====================================================
        // CLEAN PAYSTACK QUERY PARAMETERS
        // ====================================================

        const cleanUrl =
          `${window.location.origin}` +
          `${window.location.pathname}`;

        window.history.replaceState(
          {},
          document.title,
          cleanUrl
        );

        // ====================================================
        // RELOAD FRESH FINANCIAL DATA
        // ====================================================

        /*
         * This is the important part.
         *
         * Do NOT depend on selectedChildId here because
         * the callback can run before the children request
         * has completed.
         */

        if (pendingChildId) {
          /*
           * Make sure the correct child is selected.
           */

          setSelectedChildId(
            String(pendingChildId)
          );

          /*
           * Fetch a completely fresh statement from Django.
           *
           * This replaces the old PENDING payment state with
           * the actual current backend state.
           */

          await loadStatement(
            pendingChildId
          );
        } else {
          /*
           * Fallback in case the temporary child ID is
           * unavailable.
           */

          const refreshedChildren =
            await loadChildren();

          const fallbackChild =
            refreshedChildren?.[0];

          if (fallbackChild?.id) {
            setSelectedChildId(
              String(fallbackChild.id)
            );

            await loadStatement(
              fallbackChild.id
            );
          }
        }

        // ====================================================
        // CLEAR TEMPORARY PAYMENT CONTEXT
        // ====================================================

        sessionStorage.removeItem(
          "parent_payment_child_id"
        );

        sessionStorage.removeItem(
          "parent_payment_invoice_id"
        );

        /*
         * Close any payment modal that may still be present.
         */

        setPaymentInvoice(null);
        setPaymentAmount("");
        setPaymentError("");
      } catch (err) {
        console.error(
          "Payment verification failed:",
          err
        );

        /*
         * Do NOT remove the temporary payment information
         * here.
         *
         * If verification fails temporarily, the parent can
         * refresh/retry the page and the reference remains
         * available for verification.
         */

        setStatementError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Payment verification failed."
        );
      } finally {
        setLoadingStatement(false);
      }
    };

    verifyPayment();
  }, []);

  // ==========================================================
  // RECEIPT
  // ==========================================================

  const handleViewReceipt = async (paymentId) => {
    if (!paymentId) return;

    try {
      setReceiptLoading(true);
      setReceiptError("");
      setReceipt(null);

      const data =
        await getStudentPaymentReceipt(
          paymentId
        );

      setReceipt(data);
    } catch (err) {
      console.error(
        "Failed to load receipt:",
        err
      );

      setReceiptError(
        err?.response?.data?.detail ||
          "Unable to load payment receipt."
      );
    } finally {
      setReceiptLoading(false);
    }
  };

  // ==========================================================
  // LOADING CHILDREN
  // ==========================================================

  if (childrenLoading) {
    return (
      <div className="min-h-full bg-background p-6">
        <div className="flex items-center gap-3">
          <Loader2
            className="animate-spin text-primary"
            size={22}
          />

          <p className="text-text">
            Loading your children...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // CHILDREN ERROR
  // ==========================================================

  if (childrenError) {
    return (
      <div className="min-h-full bg-background p-6">
        <div className="bg-card border border-primary/20 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle
              className="text-primary mt-0.5"
              size={22}
            />

            <div>
              <h2 className="font-semibold text-text">
                Unable to load children
              </h2>

              <p className="text-sm text-text/60 mt-1">
                {childrenError}
              </p>

              <button
                type="button"
                onClick={loadChildren}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // NO CHILDREN
  // ==========================================================

  if (children.length === 0) {
    return (
      <div className="min-h-full bg-background p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card border border-black/10 dark:border-white/10 rounded-2xl p-10 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet
                size={30}
                className="text-primary"
              />
            </div>

            <h1 className="text-xl font-bold text-text mt-5">
              Fees & Payments
            </h1>

            <p className="text-text/60 mt-2">
              No children are currently linked to your
              parent account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-full bg-background p-4 md:p-6">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

        <div>
          <h1 className="text-2xl font-bold text-text">
            Fees & Payments
          </h1>

          <p className="text-text/60 mt-1">
            View your children's school fees and make
            secure payments.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-primary/20 bg-card text-primary hover:bg-primary/5 transition disabled:opacity-50"
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
      </div>

      {/* ======================================================
          CHILD SELECTOR
      ====================================================== */}

      <div className="bg-card border border-black/10 dark:border-white/10 rounded-2xl p-5 mb-6">

        <div className="flex items-center gap-2 mb-3">
          <Wallet
            size={18}
            className="text-primary"
          />

          <label className="text-sm font-semibold text-text">
            Select Child
          </label>
        </div>

        <div className="relative">
          <select
            value={selectedChildId}
            onChange={(event) =>
              setSelectedChildId(
                event.target.value
              )
            }
            className="w-full appearance-none bg-background border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 pr-10 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {children.map((child) => (
              <option
                key={child.id}
                value={child.id}
              >
                {child.full_name ||
                  "Unnamed Student"}
                {" — "}
                {child.admission_number ||
                  "No admission number"}
              </option>
            ))}
          </select>

          <ChevronDown
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text/50"
          />
        </div>

        {/* Selected child information */}

        {selectedChild && (
          <div className="flex items-center gap-4 mt-5 pt-5 border-t border-black/10 dark:border-white/10">

            {getImageUrl(
              selectedChild.profile_image
            ) ? (
              <img
                src={getImageUrl(
                  selectedChild.profile_image
                )}
                alt={selectedChild.full_name}
                className="w-12 h-12 rounded-full object-cover border border-primary/20"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                {getInitials(
                  selectedChild.full_name
                )}
              </div>
            )}

            <div className="min-w-0">
              <p className="font-semibold text-text">
                {selectedChild.full_name ||
                  "Unnamed Student"}
              </p>

              <p className="text-sm text-text/60">
                {selectedChild.current_class ||
                  "Class unavailable"}

                {" • "}

                {selectedChild.current_session ||
                  "Session unavailable"}

                {" • "}

                {selectedChild.current_term ||
                  "Term unavailable"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================
          STATEMENT ERROR
      ====================================================== */}

      {statementError && (
        <div className="bg-card border border-primary/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={20}
              className="text-primary mt-0.5"
            />

            <div>
              <p className="font-medium text-text">
                Unable to load financial information
              </p>

              <p className="text-sm text-text/60 mt-1">
                {statementError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          STATEMENT LOADING
      ====================================================== */}

      {loadingStatement && (
        <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-3">
            <Loader2
              size={20}
              className="animate-spin text-primary"
            />

            <p className="text-text/70">
              Loading financial information...
            </p>
          </div>
        </div>
      )}

      {/* ======================================================
          FINANCIAL SUMMARY
      ====================================================== */}

      {!loadingStatement && statement && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">

            {/* Total Invoiced */}

            <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-text/60">
                  Total Invoiced
                </p>

                <FileText
                  size={19}
                  className="text-primary"
                />
              </div>

              <p className="text-2xl font-bold text-text mt-3">
                {formatCurrency(
                  summary.totalInvoiced
                )}
              </p>
            </div>

            {/* Discounts */}

            <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-text/60">
                  Discounts
                </p>

                <Wallet
                  size={19}
                  className="text-secondary"
                />
              </div>

              <p className="text-2xl font-bold text-text mt-3">
                {formatCurrency(
                  summary.totalDiscounts
                )}
              </p>
            </div>

            {/* Total Paid */}

            <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-text/60">
                  Total Paid
                </p>

                <CheckCircle
                  size={19}
                  className="text-secondary"
                />
              </div>

              <p className="text-2xl font-bold text-text mt-3">
                {formatCurrency(
                  summary.totalPaid
                )}
              </p>
            </div>

            {/* Outstanding */}

            <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-text/60">
                  Outstanding
                </p>

                <CreditCard
                  size={19}
                  className="text-primary"
                />
              </div>

              <p className="text-2xl font-bold text-primary mt-3">
                {formatCurrency(
                  summary.totalOutstanding
                )}
              </p>
            </div>
          </div>

          {/* ====================================================
              OUTSTANDING INVOICES
          ==================================================== */}

          <section className="mb-8">

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-text">
                  Outstanding Invoices
                </h2>

                <p className="text-sm text-text/60 mt-1">
                  Select an invoice to make a full or
                  partial payment.
                </p>
              </div>
            </div>

            {invoices.filter((invoice) => {
              const balance = Number(
                invoice.balance ??
                  invoice.pending_amount ??
                  invoice.amount_due ??
                  0
              );

              return balance > 0;
            }).length === 0 ? (
              <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl p-8 text-center">
                <CheckCircle
                  size={34}
                  className="mx-auto text-secondary"
                />

                <h3 className="font-semibold text-text mt-3">
                  No Outstanding Fees
                </h3>

                <p className="text-sm text-text/60 mt-1">
                  This student currently has no
                  outstanding invoice balance.
                </p>
              </div>
            ) : (
              <div className="space-y-4">

                {invoices
                  .filter((invoice) => {
                    const balance = Number(
                      invoice.balance ??
                        invoice.pending_amount ??
                        invoice.amount_due ??
                        0
                    );

                    return balance > 0;
                  })
                  .map((invoice) => {
                    const balance = Number(
                      invoice.balance ??
                        invoice.pending_amount ??
                        invoice.amount_due ??
                        0
                    );

                    const amount = Number(
                      invoice.amount ?? 0
                    );

                    const discount = Number(
                      invoice.discount ?? 0
                    );

                    return (
                      <div
                        key={invoice.id}
                        className="bg-card border border-black/10 dark:border-white/10 rounded-xl p-5"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-text">
                                {invoice.invoice_number ||
                                  `Invoice #${invoice.id}`}
                              </h3>

                              <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                                {getStatusLabel(
                                  invoice.status ||
                                    "OUTSTANDING"
                                )}
                              </span>
                            </div>

                            {invoice.description && (
                              <p className="text-sm text-text/60 mt-2">
                                {invoice.description}
                              </p>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">

                              <div>
                                <p className="text-xs text-text/50">
                                  Amount
                                </p>

                                <p className="text-sm font-semibold text-text mt-1">
                                  {formatCurrency(
                                    amount
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-text/50">
                                  Discount
                                </p>

                                <p className="text-sm font-semibold text-text mt-1">
                                  {formatCurrency(
                                    discount
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-text/50">
                                  Paid
                                </p>

                                <p className="text-sm font-semibold text-text mt-1">
                                  {formatCurrency(
                                    invoice.amount_paid
                                  )}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-text/50">
                                  Balance
                                </p>

                                <p className="text-sm font-bold text-primary mt-1">
                                  {formatCurrency(
                                    balance
                                  )}
                                </p>
                              </div>

                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              openPaymentModal(
                                invoice
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition shrink-0"
                          >
                            <CreditCard size={18} />
                            Make Payment
                          </button>

                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </section>

          {/* ====================================================
              INVOICE HISTORY
          ==================================================== */}

          <section className="mb-8">

            <h2 className="text-lg font-bold text-text mb-4">
              Invoice History
            </h2>

            <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl overflow-hidden">

              {invoices.length === 0 ? (
                <div className="p-8 text-center text-text/60">
                  No invoices found.
                </div>
              ) : (
                <div className="overflow-x-auto">

                  <table className="w-full min-w-[700px]">

                    <thead className="bg-background">
                      <tr>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-text/60">
                          Invoice
                        </th>

                        <th className="text-left px-5 py-3 text-xs font-semibold text-text/60">
                          Amount
                        </th>

                        <th className="text-left px-5 py-3 text-xs font-semibold text-text/60">
                          Paid
                        </th>

                        <th className="text-left px-5 py-3 text-xs font-semibold text-text/60">
                          Balance
                        </th>

                        <th className="text-left px-5 py-3 text-xs font-semibold text-text/60">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-black/10 dark:divide-white/10">

                      {invoices.map((invoice) => {
                        const balance = Number(
                          invoice.balance ??
                            invoice.pending_amount ??
                            0
                        );

                        return (
                          <tr key={invoice.id}>

                            <td className="px-5 py-4">
                              <p className="text-sm font-medium text-text">
                                {invoice.invoice_number ||
                                  `Invoice #${invoice.id}`}
                              </p>

                              {invoice.description && (
                                <p className="text-xs text-text/50 mt-1">
                                  {invoice.description}
                                </p>
                              )}
                            </td>

                            <td className="px-5 py-4 text-sm text-text">
                              {formatCurrency(
                                invoice.amount
                              )}
                            </td>

                            <td className="px-5 py-4 text-sm text-text">
                              {formatCurrency(
                                invoice.amount_paid
                              )}
                            </td>

                            <td className="px-5 py-4 text-sm font-semibold text-primary">
                              {formatCurrency(
                                balance
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                                {getStatusLabel(
                                  invoice.status ||
                                    (balance > 0
                                      ? "OUTSTANDING"
                                      : "PAID")
                                )}
                              </span>
                            </td>

                          </tr>
                        );
                      })}

                    </tbody>
                  </table>

                </div>
              )}
            </div>
          </section>

          {/* ====================================================
              PAYMENT HISTORY
          ==================================================== */}

          <section>

            <h2 className="text-lg font-bold text-text mb-4">
              Payment History
            </h2>

            <div className="bg-card border border-black/10 dark:border-white/10 rounded-xl overflow-hidden">

              {payments.length === 0 ? (
                <div className="p-8 text-center">
                  <Receipt
                    size={32}
                    className="mx-auto text-text/30"
                  />

                  <p className="text-text/60 mt-3">
                    No payments have been recorded for
                    this student.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">

                  <table className="w-full min-w-[800px]">

                    <thead className="bg-background">

                      <tr>

                        <th className="text-left px-5 py-3 text-xs font-semibold text-text/60">
                          Reference
                        </th>

                        <th className="text-left px-5 py-3 text-xs font-semibold text-text/60">
                          Invoice
                        </th>

                        <th className="text-left px-5 py-3 text-xs font-semibold text-text/60">
                          Amount
                        </th>

                        <th className="text-left px-5 py-3 text-xs font-semibold text-text/60">
                          Method
                        </th>

                        <th className="text-left px-5 py-3 text-xs font-semibold text-text/60">
                          Status
                        </th>

                        <th className="text-right px-5 py-3 text-xs font-semibold text-text/60">
                          Receipt
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-black/10 dark:divide-white/10">

                      {payments.map((payment) => (

                        <tr key={payment.id}>

                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-text">
                              {payment.reference ||
                                payment.transaction_reference ||
                                `Payment #${payment.id}`}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm text-text">
                            {payment.invoice_number ||
                              payment.invoice?.invoice_number ||
                              payment.invoice ||
                              "—"}
                          </td>

                          <td className="px-5 py-4 text-sm font-semibold text-text">
                            {formatCurrency(
                              payment.amount
                            )}
                          </td>

                          <td className="px-5 py-4 text-sm text-text/70">
                            {getStatusLabel(
                              payment.method ||
                                payment.payment_method ||
                                "ONLINE"
                            )}
                          </td>

                          <td className="px-5 py-4">

                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                String(
                                  payment.status
                                ).toUpperCase() ===
                                "SUCCESSFUL"
                                  ? "bg-secondary/10 text-secondary border border-secondary/20"
                                  : String(
                                      payment.status
                                    ).toUpperCase() ===
                                    "FAILED"
                                  ? "bg-primary/10 text-primary border border-primary/20"
                                  : "bg-background text-text/70 border border-black/10 dark:border-white/10"
                              }`}
                            >
                              {getStatusLabel(
                                payment.status ||
                                  "PENDING"
                              )}
                            </span>

                          </td>

                          <td className="px-5 py-4 text-right">

                            <button
                              type="button"
                              onClick={() =>
                                handleViewReceipt(
                                  payment.id
                                )
                              }
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/20 text-primary hover:bg-primary/5 transition"
                            >
                              <Receipt size={15} />
                              View
                            </button>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>
              )}

            </div>

          </section>
        </>
      )}

      {/* ======================================================
          PAYMENT MODAL
      ====================================================== */}

      {paymentInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">

          <div className="w-full max-w-lg bg-card rounded-2xl shadow-xl border border-black/10 dark:border-white/10 overflow-hidden">

            {/* Modal Header */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-black/10 dark:border-white/10">

              <div>
                <h2 className="text-lg font-bold text-text">
                  Make Payment
                </h2>

                <p className="text-sm text-text/60 mt-1">
                  {selectedChild?.full_name ||
                    "Student"}
                </p>
              </div>

              <button
                type="button"
                onClick={closePaymentModal}
                disabled={paymentLoading}
                className="p-2 rounded-lg hover:bg-background text-text/60 hover:text-text transition"
              >
                <X size={20} />
              </button>

            </div>

            {/* Modal Body */}

            <form
              onSubmit={handlePayment}
              className="p-6"
            >

              <div className="bg-background border border-black/10 dark:border-white/10 rounded-xl p-4 mb-5">

                <div className="flex justify-between gap-4">

                  <span className="text-sm text-text/60">
                    Invoice
                  </span>

                  <span className="text-sm font-semibold text-text">
                    {paymentInvoice.invoice_number ||
                      `#${paymentInvoice.id}`}
                  </span>

                </div>

                <div className="flex justify-between gap-4 mt-3">

                  <span className="text-sm text-text/60">
                    Outstanding Balance
                  </span>

                  <span className="text-sm font-bold text-primary">
                    {formatCurrency(
                      paymentInvoice.balance ??
                        paymentInvoice.pending_amount ??
                        0
                    )}
                  </span>

                </div>

              </div>

              {/* Amount */}

              <label className="block">

                <span className="block text-sm font-semibold text-text mb-2">
                  Amount to Pay
                </span>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text/50">
                    ₦
                  </span>

                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(event) =>
                      setPaymentAmount(
                        event.target.value
                      )
                    }
                    disabled={paymentLoading}
                    className="w-full bg-background border border-black/10 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Enter amount"
                  />

                </div>

              </label>

              {/* Quick Full Payment */}

              <button
                type="button"
                onClick={() =>
                  setPaymentAmount(
                    String(
                      Number(
                        paymentInvoice.balance ??
                          paymentInvoice.pending_amount ??
                          0
                      )
                    )
                  )
                }
                disabled={paymentLoading}
                className="mt-3 text-sm font-medium text-primary hover:underline"
              >
                Pay full outstanding balance
              </button>

              {/* Error */}

              {paymentError && (
                <div className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20">

                  <div className="flex items-start gap-2">

                    <AlertCircle
                      size={18}
                      className="text-primary mt-0.5"
                    />

                    <p className="text-sm text-text">
                      {paymentError}
                    </p>

                  </div>

                </div>
              )}

              {/* Actions */}

              <div className="flex flex-col sm:flex-row gap-3 mt-6">

                <button
                  type="button"
                  onClick={closePaymentModal}
                  disabled={paymentLoading}
                  className="flex-1 px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 text-text hover:bg-background transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    paymentLoading ||
                    !paymentAmount
                  }
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
                >

                  {paymentLoading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Connecting to Paystack...
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} />

                      Continue to Paystack
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* ======================================================
          RECEIPT LOADING
      ====================================================== */}

      {receiptLoading && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">

          <div className="bg-card rounded-xl px-6 py-5 flex items-center gap-3">

            <Loader2
              size={20}
              className="animate-spin text-primary"
            />

            <span className="text-text">
              Loading receipt...
            </span>

          </div>

        </div>
      )}

      {/* ======================================================
          RECEIPT MODAL
      ====================================================== */}

      {receipt && !receiptLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">

          <div className="w-full max-w-lg bg-card rounded-2xl shadow-xl border border-black/10 dark:border-white/10 overflow-hidden">

            <div className="flex items-center justify-between px-6 py-5 border-b border-black/10 dark:border-white/10">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">

                  <Receipt
                    size={20}
                    className="text-secondary"
                  />

                </div>

                <div>

                  <h2 className="font-bold text-text">
                    Payment Receipt
                  </h2>

                  <p className="text-xs text-text/50">
                    Payment confirmation
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() => {
                  setReceipt(null);
                  setReceiptError("");
                }}
                className="p-2 rounded-lg hover:bg-background text-text/60 hover:text-text"
              >
                <X size={20} />
              </button>

            </div>

            {receiptError ? (
              <div className="p-6">

                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">

                  <p className="text-sm text-text">
                    {receiptError}
                  </p>

                </div>

              </div>
            ) : (
              <div className="p-6">

                <div className="space-y-4">

                  <div className="flex justify-between gap-4">

                    <span className="text-sm text-text/60">
                      Student
                    </span>

                    <span className="text-sm font-semibold text-text text-right">
                      {receipt.student_name ||
                        receipt.student?.name ||
                        selectedChild?.full_name ||
                        "—"}
                    </span>

                  </div>

                  <div className="flex justify-between gap-4">

                    <span className="text-sm text-text/60">
                      Invoice
                    </span>

                    <span className="text-sm font-semibold text-text text-right">
                      {receipt.invoice_number ||
                        receipt.invoice?.invoice_number ||
                        "—"}
                    </span>

                  </div>

                  <div className="flex justify-between gap-4">

                    <span className="text-sm text-text/60">
                      Amount
                    </span>

                    <span className="text-lg font-bold text-primary text-right">
                      {formatCurrency(
                        receipt.amount
                      )}
                    </span>

                  </div>

                  <div className="flex justify-between gap-4">

                    <span className="text-sm text-text/60">
                      Reference
                    </span>

                    <span className="text-sm font-medium text-text text-right break-all">
                      {receipt.reference ||
                        receipt.transaction_reference ||
                        "—"}
                    </span>

                  </div>

                  <div className="flex justify-between gap-4">

                    <span className="text-sm text-text/60">
                      Status
                    </span>

                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                      {getStatusLabel(
                        receipt.status ||
                          "SUCCESSFUL"
                      )}
                    </span>

                  </div>

                  {receipt.payment_date && (
                    <div className="flex justify-between gap-4">

                      <span className="text-sm text-text/60">
                        Payment Date
                      </span>

                      <span className="text-sm font-medium text-text text-right">
                        {new Date(
                          receipt.payment_date
                        ).toLocaleString()}
                      </span>

                    </div>
                  )}

                </div>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}