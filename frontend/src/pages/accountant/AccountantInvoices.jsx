import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Save,
  User,
  CalendarDays,
  ReceiptText,
} from "lucide-react";
import api from "../../services/api";

function getListData(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  return [];
}

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

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusClasses(status) {
  switch (status) {
    case "PAID":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";

    case "PARTIAL":
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";

    case "OVERDUE":
      return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";

    case "CANCELLED":
      return "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300";

    default:
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";
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

    case "UNPAID":
      return "Unpaid";

    default:
      return status || "Unknown";
  }
}

function getErrorMessage(
  error,
  fallback = "Something went wrong."
) {
  const data = error?.response?.data;

  if (!data) {
    if (error?.message) {
      return error.message;
    }

    return fallback;
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.error) {
    return String(data.error);
  }

  if (data.detail) {
    return String(data.detail);
  }

  if (data.message) {
    return String(data.message);
  }

  if (typeof data === "object") {
    const messages = Object.entries(data)
      .map(([field, value]) => {
        let formattedValue;

        if (Array.isArray(value)) {
          formattedValue = value.join(", ");
        } else if (
          typeof value === "object" &&
          value !== null
        ) {
          formattedValue = JSON.stringify(value);
        } else {
          formattedValue = String(value);
        }

        return `${field}: ${formattedValue}`;
      })
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join(" | ");
    }
  }

  return fallback;
}

function AccountantInvoices() {
  const [invoices, setInvoices] = useState([]);

  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showGenerateModal, setShowGenerateModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [editingInvoice, setEditingInvoice] =
    useState(null);

  const [generateForm, setGenerateForm] = useState({
    academic_session: "",
    term: "",
    class_level: "",
  });

  const [editForm, setEditForm] = useState({
    invoice_number: "",
    amount: "",
    discount: "",
    due_date: "",
    description: "",
  });

  const [generationResult, setGenerationResult] =
    useState(null);

  const [page, setPage] = useState(1);

  const pageSize = 10;

  // =========================================================
  // FETCH INVOICES
  // =========================================================

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/finance/invoices/"
      );

      setInvoices(getListData(response.data));
    } catch (err) {
      console.error(
        "Error loading invoices:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to load invoices."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH GENERATION OPTIONS
  // =========================================================

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true);

      const [
        sessionsResponse,
        termsResponse,
        classLevelsResponse,
      ] = await Promise.all([
        api.get("/academics/sessions/"),
        api.get("/academics/terms/"),
        api.get("/academics/class-levels/"),
      ]);

      setSessions(
        getListData(sessionsResponse.data)
      );

      setTerms(
        getListData(termsResponse.data)
      );

      setClassLevels(
        getListData(classLevelsResponse.data)
      );
    } catch (err) {
      console.error(
        "Error loading invoice generation options:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to load session, term, or class information."
        )
      );
    } finally {
      setLoadingOptions(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchInvoices();
    fetchOptions();
  }, []);

  // =========================================================
  // FILTER INVOICES
  // =========================================================

  const filteredInvoices = useMemo(() => {
    const searchValue = search
      .trim()
      .toLowerCase();

    return invoices.filter((invoice) => {
      const invoiceNumber =
        invoice.invoice_number?.toLowerCase() || "";

      const studentName =
        invoice.student_name?.toLowerCase() || "";

      const feeCategory =
        invoice.fee_category_name?.toLowerCase() || "";

      const matchesSearch =
        !searchValue ||
        invoiceNumber.includes(searchValue) ||
        studentName.includes(searchValue) ||
        feeCategory.includes(searchValue);

      const matchesStatus =
        statusFilter === "ALL" ||
        invoice.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredInvoices.length / pageSize
    )
  );

  const currentPage = Math.min(
    page,
    totalPages
  );

  const paginatedInvoices =
    filteredInvoices.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );

  // =========================================================
  // STATISTICS
  // =========================================================

  const statistics = useMemo(() => {
    const total = invoices.length;

    const paid = invoices.filter(
      (invoice) => invoice.status === "PAID"
    ).length;

    const partial = invoices.filter(
      (invoice) => invoice.status === "PARTIAL"
    ).length;

    const unpaid = invoices.filter(
      (invoice) => invoice.status === "UNPAID"
    ).length;

    const overdue = invoices.filter(
      (invoice) => invoice.status === "OVERDUE"
    ).length;

    const totalAmount = invoices.reduce(
      (sum, invoice) =>
        sum + Number(invoice.amount || 0),
      0
    );

    const totalOutstanding = invoices.reduce(
      (sum, invoice) =>
        sum + Number(invoice.balance || 0),
      0
    );

    return {
      total,
      paid,
      partial,
      unpaid,
      overdue,
      totalAmount,
      totalOutstanding,
    };
  }, [invoices]);

  // =========================================================
  // GENERATE FORM CHANGE
  // =========================================================

  const handleGenerateChange = (event) => {
    const { name, value } = event.target;

    setGenerateForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // =========================================================
  // GENERATE INVOICES
  // =========================================================

  const handleGenerateInvoices = async (event) => {
    event.preventDefault();

    if (
      !generateForm.academic_session ||
      !generateForm.term ||
      !generateForm.class_level
    ) {
      setError(
        "Please select an academic session, term, and class level."
      );
      return;
    }

    try {
      setGenerating(true);
      setError("");
      setSuccess("");
      setGenerationResult(null);

      const payload = {
        academic_session: Number(
          generateForm.academic_session
        ),
        term: Number(generateForm.term),
        class_level: Number(
          generateForm.class_level
        ),
      };

      const response = await api.post(
        "/finance/generate-invoices/",
        payload
      );

      setGenerationResult(response.data);

      setSuccess(
        response.data?.message ||
          "Invoice generation completed successfully."
      );

      await fetchInvoices();

      setGenerateForm({
        academic_session: "",
        term: "",
        class_level: "",
      });
    } catch (err) {
      console.error(
        "Generate invoices error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to generate invoices."
        )
      );
    } finally {
      setGenerating(false);
    }
  };

  // =========================================================
  // CLOSE GENERATE MODAL
  // =========================================================

  const closeGenerateModal = () => {
    if (generating) {
      return;
    }

    setShowGenerateModal(false);
    setGenerationResult(null);
  };

  // =========================================================
  // OPEN GENERATE MODAL
  // =========================================================

  const openGenerateModal = () => {
    setError("");
    setSuccess("");
    setGenerationResult(null);

    setGenerateForm({
      academic_session: "",
      term: "",
      class_level: "",
    });

    setShowGenerateModal(true);
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const openEditModal = (invoice) => {
    setEditingInvoice(invoice);

    setEditForm({
      invoice_number:
        invoice.invoice_number || "",
      amount:
        invoice.amount !== undefined &&
        invoice.amount !== null
          ? String(invoice.amount)
          : "",
      discount:
        invoice.discount !== undefined &&
        invoice.discount !== null
          ? String(invoice.discount)
          : "0",
      due_date:
        invoice.due_date || "",
      description:
        invoice.description || "",
    });

    setError("");
    setSuccess("");
    setShowEditModal(true);
  };

  // =========================================================
  // CLOSE EDIT MODAL
  // =========================================================

  const closeEditModal = () => {
    if (saving) {
      return;
    }

    setShowEditModal(false);
    setEditingInvoice(null);

    setEditForm({
      invoice_number: "",
      amount: "",
      discount: "",
      due_date: "",
      description: "",
    });
  };

  // =========================================================
  // EDIT FORM CHANGE
  // =========================================================

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  // =========================================================
  // SAVE EDITED INVOICE
  // =========================================================

 const handleSaveInvoice = async (event) => {
  event.preventDefault();

  if (!editingInvoice) {
    return;
  }

  const amount = Number(editForm.amount || 0);
  const discount = Number(editForm.discount || 0);

  if (!editForm.invoice_number.trim()) {
    setError("Invoice number is required.");
    return;
  }

  if (amount <= 0) {
    setError("Invoice amount must be greater than zero.");
    return;
  }

  if (discount < 0) {
    setError("Discount cannot be negative.");
    return;
  }

  if (discount > amount) {
    setError(
      "Discount cannot be greater than the invoice amount."
    );
    return;
  }

  const amountPaid = Number(
    editingInvoice.amount_paid || 0
  );

  const newTotal = amount - discount;

  if (newTotal < amountPaid) {
    setError(
      `The invoice total cannot be less than the amount already paid (${formatCurrency(
        amountPaid
      )}).`
    );
    return;
  }

  // These fields are required by the backend serializer.
  if (
    !editingInvoice.student ||
    !editingInvoice.academic_session ||
    !editingInvoice.term ||
    !editingInvoice.fee_category
  ) {
    setError(
      "This invoice is missing one or more required academic details. Please refresh the page and try again."
    );
    return;
  }

  try {
    setSaving(true);
    setError("");
    setSuccess("");

    const payload = {
      student: Number(editingInvoice.student),
      academic_session: Number(
        editingInvoice.academic_session
      ),
      term: Number(editingInvoice.term),
      fee_category: Number(
        editingInvoice.fee_category
      ),

      invoice_number:
        editForm.invoice_number.trim(),

      amount: editForm.amount,

      discount: editForm.discount || "0",

      due_date:
        editForm.due_date || null,

      description:
        editForm.description.trim(),
    };

    await api.put(
      `/finance/invoices/${editingInvoice.id}/`,
      payload
    );

    setSuccess(
      "Invoice updated successfully."
    );

    closeEditModal();

    await fetchInvoices();

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  } catch (err) {
    console.error(
      "Failed to update invoice:",
      err
    );

    setError(
      getErrorMessage(
        err,
        "Unable to update invoice."
      )
    );
  } finally {
    setSaving(false);
  }
};

  // =========================================================
  // DELETE INVOICE
  // =========================================================

  const handleDeleteInvoice = async (invoice) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete invoice "${invoice.invoice_number}" for ${
        invoice.student_name || "this student"
      }?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(invoice.id);
      setError("");
      setSuccess("");

      await api.delete(
        `/finance/invoices/${invoice.id}/`
      );

      setSuccess(
        "Invoice deleted successfully."
      );

      await fetchInvoices();

      setPage(1);

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Failed to delete invoice:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to delete this invoice."
        )
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================================================
  // REFRESH
  // =========================================================

  const handleRefresh = async () => {
    setSuccess("");
    setError("");
    setPage(1);

    await fetchInvoices();
  };

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  // =========================================================
  // STATUS FILTER
  // =========================================================

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white shadow-sm">
              <FileText size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Student Invoices
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage and generate student fee
                invoices.
              </p>
            </div>

          </div>
        </div>

        <div className="flex flex-wrap gap-3">

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-[var(--color-card)] px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RefreshCw
              size={18}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={openGenerateModal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            <Plus size={18} />

            Generate Invoices
          </button>

        </div>
      </div>

      {/* =====================================================
          ERROR ALERT
      ====================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">

          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0"
          />

          <div className="flex-1">

            <p className="font-semibold">
              Something went wrong
            </p>

            <p className="mt-1 break-words text-sm">
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

      {/* =====================================================
          SUCCESS ALERT
      ====================================================== */}

      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">

          <CheckCircle2
            size={20}
            className="mt-0.5 shrink-0"
          />

          <div className="flex-1">

            <p className="font-semibold">
              Success
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

      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-3xl bg-[var(--color-card)] p-5 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">

          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Total Invoices
          </p>

          <p className="mt-2 text-3xl font-bold">
            {statistics.total}
          </p>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {statistics.paid} paid
          </p>

        </div>

        <div className="rounded-3xl bg-[var(--color-card)] p-5 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">

          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Total Invoiced
          </p>

          <p className="mt-2 text-2xl font-bold">
            {formatCurrency(
              statistics.totalAmount
            )}
          </p>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Across all invoices
          </p>

        </div>

        <div className="rounded-3xl bg-[var(--color-card)] p-5 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">

          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Outstanding
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {formatCurrency(
              statistics.totalOutstanding
            )}
          </p>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {statistics.unpaid +
              statistics.partial +
              statistics.overdue}{" "}
            requiring attention
          </p>

        </div>

        <div className="rounded-3xl bg-[var(--color-card)] p-5 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">

          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Invoice Status
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-xs">

            <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              Paid {statistics.paid}
            </span>

            <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
              Partial {statistics.partial}
            </span>

            <span className="rounded-full bg-red-100 px-3 py-1 font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-400">
              Overdue {statistics.overdue}
            </span>

          </div>

        </div>

      </div>

      {/* =====================================================
          FILTERS
      ====================================================== */}

      <div className="rounded-3xl bg-[var(--color-card)] p-5 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

          <div className="relative flex-1">

            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search invoice number, student, or fee category..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-blue-900/30"
            />

          </div>

          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-blue-900/30"
          >
            <option value="ALL">
              All Statuses
            </option>

            <option value="UNPAID">
              Unpaid
            </option>

            <option value="PARTIAL">
              Partially Paid
            </option>

            <option value="PAID">
              Paid
            </option>

            <option value="OVERDUE">
              Overdue
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>
          </select>

        </div>
      </div>

      {/* =====================================================
          INVOICE TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-3xl bg-[var(--color-card)] shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">

        <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800">

          <h2 className="text-lg font-bold">
            Invoice Records
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {filteredInvoices.length} invoice
            {filteredInvoices.length !== 1
              ? "s"
              : ""}{" "}
            found
          </p>

        </div>

        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center">

            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">

              <Loader2
                size={24}
                className="animate-spin"
              />

              Loading invoices...

            </div>

          </div>
        ) : paginatedInvoices.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <FileText
                size={28}
                className="text-slate-400"
              />
            </div>

            <h3 className="mt-4 text-lg font-semibold">
              No invoices found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
              Generate invoices for a class,
              academic session, and term to
              create student fee invoices.
            </p>

          </div>
        ) : (
          <>
            <div className="overflow-x-auto">

              <table className="min-w-full text-left">

                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">

                    <th className="px-5 py-4 font-semibold">
                      Invoice
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Student
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Session
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Term
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Fee Category
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Amount
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Balance
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Due Date
                    </th>

                    <th className="px-5 py-4 font-semibold">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                  {paginatedInvoices.map(
                    (invoice) => (
                      <tr
                        key={invoice.id}
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-900/50"
                      >

                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="font-semibold text-[var(--color-primary)]">
                            {invoice.invoice_number}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                              <User size={17} />
                            </div>

                            <p className="font-medium">
                              {invoice.student_name ||
                                "Unknown Student"}
                            </p>

                          </div>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                          {invoice.session_name ||
                            "—"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                          {invoice.term_name ||
                            "—"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                          {invoice.fee_category_name ||
                            "—"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-semibold">
                          {formatCurrency(
                            invoice.amount
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-semibold">
                          {formatCurrency(
                            invoice.balance
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                          {formatDate(
                            invoice.due_date
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                              invoice.status
                            )}`}
                          >
                            {getStatusLabel(
                              invoice.status
                            )}
                          </span>

                        </td>

                        <td className="whitespace-nowrap px-5 py-4">

                          <div className="flex items-center justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  invoice
                                )
                              }
                              disabled={
                                deletingId ===
                                invoice.id
                              }
                              title="Edit invoice"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-900 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteInvoice(
                                  invoice
                                )
                              }
                              disabled={
                                deletingId ===
                                invoice.id
                              }
                              title="Delete invoice"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-900 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                            >
                              {deletingId ===
                              invoice.id ? (
                                <Loader2
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>

                          </div>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* =================================================
                PAGINATION
            ================================================== */}

            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">

              <p className="text-sm text-slate-500 dark:text-slate-400">

                Showing{" "}

                <span className="font-semibold">
                  {filteredInvoices.length === 0
                    ? 0
                    : (currentPage - 1) *
                        pageSize +
                      1}
                </span>{" "}

                to{" "}

                <span className="font-semibold">
                  {Math.min(
                    currentPage * pageSize,
                    filteredInvoices.length
                  )}
                </span>{" "}

                of{" "}

                <span className="font-semibold">
                  {filteredInvoices.length}
                </span>

              </p>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setPage((previous) =>
                      Math.max(
                        1,
                        previous - 1
                      )
                    )
                  }
                  className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <ChevronLeft size={18} />
                </button>

                <span className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold dark:bg-slate-800">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  disabled={
                    currentPage === totalPages
                  }
                  onClick={() =>
                    setPage((previous) =>
                      Math.min(
                        totalPages,
                        previous + 1
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

      {/* =====================================================
          EDIT INVOICE MODAL
      ====================================================== */}

      {showEditModal && editingInvoice && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

    <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-[var(--color-card)] shadow-2xl">

      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-[var(--color-card)] px-5 py-4 dark:border-slate-800">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <Pencil size={18} />
          </div>

          <div>
            <h2 className="text-lg font-bold">
              Edit Invoice
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {editingInvoice.invoice_number}
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={closeEditModal}
          disabled={saving}
          className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <X size={19} />
        </button>

      </div>

      <form
        onSubmit={handleSaveInvoice}
        className="space-y-4 p-5"
      >

        {/* Invoice information */}
        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Student
            </p>

            <p className="mt-1 truncate text-sm font-semibold">
              {editingInvoice.student_name ||
                "Unknown Student"}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Fee Category
            </p>

            <p className="mt-1 truncate text-sm font-semibold">
              {editingInvoice.fee_category_name ||
                "—"}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Academic Session
            </p>

            <p className="mt-1 truncate text-sm font-semibold">
              {editingInvoice.session_name ||
                "—"}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Term
            </p>

            <p className="mt-1 truncate text-sm font-semibold">
              {editingInvoice.term_name ||
                "—"}
            </p>
          </div>

        </div>

        {/* Invoice Number */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold">
            Invoice Number
          </label>

          <input
            type="text"
            name="invoice_number"
            value={editForm.invoice_number}
            onChange={handleEditChange}
            disabled={saving}
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-blue-900/30"
          />
        </div>

        {/* Amount + Discount */}
        <div className="grid grid-cols-2 gap-3">

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Amount
            </label>

            <input
              type="number"
              name="amount"
              value={editForm.amount}
              onChange={handleEditChange}
              disabled={saving}
              min="0.01"
              step="0.01"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-blue-900/30"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Discount
            </label>

            <input
              type="number"
              name="discount"
              value={editForm.discount}
              onChange={handleEditChange}
              disabled={saving}
              min="0"
              step="0.01"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-blue-900/30"
            />
          </div>

        </div>

        {/* Paid + Balance */}
        <div className="grid grid-cols-2 gap-3">

          <div className="rounded-xl bg-emerald-50 px-3 py-2.5 dark:bg-emerald-500/10">

            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              Amount Paid
            </p>

            <p className="mt-0.5 text-sm font-bold text-emerald-700 dark:text-emerald-400">
              {formatCurrency(
                editingInvoice.amount_paid
              )}
            </p>

          </div>

          <div className="rounded-xl bg-amber-50 px-3 py-2.5 dark:bg-amber-500/10">

            <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
              Current Balance
            </p>

            <p className="mt-0.5 text-sm font-bold text-amber-700 dark:text-amber-400">
              {formatCurrency(
                editingInvoice.balance
              )}
            </p>

          </div>

        </div>

        {/* Due Date */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold">
            Due Date
          </label>

          <input
            type="date"
            name="due_date"
            value={editForm.due_date}
            onChange={handleEditChange}
            disabled={saving}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-blue-900/30"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold">
            Description
          </label>

          <textarea
            name="description"
            value={editForm.description}
            onChange={handleEditChange}
            disabled={saving}
            rows={2}
            placeholder="Optional description..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-blue-900/30"
          />
        </div>

        {/* Information */}
        <div className="rounded-xl bg-blue-50 px-3 py-2.5 text-xs leading-5 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
          Student, academic session, term, and fee
          category remain unchanged. Only the invoice
          details above can be edited.
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-1">

          <button
            type="button"
            onClick={closeEditModal}
            disabled={saving}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <Save size={17} />
                Save Changes
              </>
            )}
          </button>

        </div>

      </form>

    </div>

  </div>
)}

      {/* =====================================================
          GENERATE INVOICE MODAL
      ====================================================== */}

      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-[var(--color-card)] shadow-2xl">

            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">

              <div>
                <h2 className="text-xl font-bold">
                  Generate Student Invoices
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Generate invoices for all
                  students enrolled in a selected
                  class.
                </p>
              </div>

              <button
                type="button"
                onClick={closeGenerateModal}
                disabled={generating}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={handleGenerateInvoices}
              className="space-y-5 p-6"
            >

              {/* Academic Session */}

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Academic Session
                </label>

                <select
                  name="academic_session"
                  value={
                    generateForm.academic_session
                  }
                  onChange={handleGenerateChange}
                  disabled={
                    loadingOptions ||
                    generating
                  }
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-blue-900/30"
                >

                  <option value="">
                    {loadingOptions
                      ? "Loading sessions..."
                      : "Select academic session"}
                  </option>

                  {sessions.map((session) => (
                    <option
                      key={session.id}
                      value={session.id}
                    >
                      {session.name}
                    </option>
                  ))}

                </select>

              </div>

              {/* Term */}

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Term
                </label>

                <select
                  name="term"
                  value={generateForm.term}
                  onChange={handleGenerateChange}
                  disabled={
                    loadingOptions ||
                    generating
                  }
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-blue-900/30"
                >

                  <option value="">
                    {loadingOptions
                      ? "Loading terms..."
                      : "Select term"}
                  </option>

                  {terms.map((term) => (
                    <option
                      key={term.id}
                      value={term.id}
                    >
                      {term.name ||
                        term.term_name ||
                        term.label ||
                        `Term ${term.id}`}
                    </option>
                  ))}

                </select>

              </div>

              {/* Class Level */}

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Class Level
                </label>

                <select
                  name="class_level"
                  value={
                    generateForm.class_level
                  }
                  onChange={handleGenerateChange}
                  disabled={
                    loadingOptions ||
                    generating
                  }
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-blue-900/30"
                >

                  <option value="">
                    {loadingOptions
                      ? "Loading classes..."
                      : "Select class level"}
                  </option>

                  {classLevels.map(
                    (classLevel) => (
                      <option
                        key={classLevel.id}
                        value={classLevel.id}
                      >
                        {classLevel.name}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* Information */}

              <div className="rounded-2xl bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">

                <div className="flex gap-3">

                  <FileText
                    size={19}
                    className="mt-0.5 shrink-0"
                  />

                  <div>

                    <p className="font-semibold">
                      How invoice generation works
                    </p>

                    <p className="mt-1 leading-6">
                      The system will find active fee
                      structures for the selected
                      class, session, and term,
                      then create invoices for
                      enrolled students. Existing
                      invoices will be skipped
                      automatically.
                    </p>

                  </div>

                </div>

              </div>

              {/* Generation Result */}

              {generationResult && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">

                  <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                    Generation completed
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-3">

                    <div className="rounded-xl bg-white p-3 dark:bg-slate-900">

                      <p className="text-xs text-slate-500">
                        Created
                      </p>

                      <p className="mt-1 text-xl font-bold text-emerald-600">
                        {generationResult.created_count ??
                          0}
                      </p>

                    </div>

                    <div className="rounded-xl bg-white p-3 dark:bg-slate-900">

                      <p className="text-xs text-slate-500">
                        Skipped
                      </p>

                      <p className="mt-1 text-xl font-bold text-amber-600">
                        {generationResult.skipped_count ??
                          0}
                      </p>

                    </div>

                  </div>

                  {Array.isArray(
                    generationResult.created_invoices
                  ) &&
                    generationResult.created_invoices
                      .length > 0 && (
                      <div className="mt-4">

                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Generated invoices
                        </p>

                        <div className="mt-2 max-h-32 space-y-1 overflow-y-auto">

                          {generationResult.created_invoices.map(
                            (invoice) => (
                              <div
                                key={
                                  invoice.id ||
                                  invoice.invoice_number
                                }
                                className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs dark:bg-slate-900"
                              >

                                <span className="font-semibold">
                                  {
                                    invoice.invoice_number
                                  }
                                </span>

                                <span className="text-slate-500 dark:text-slate-400">
                                  {formatCurrency(
                                    invoice.amount
                                  )}
                                </span>

                              </div>
                            )
                          )}

                        </div>

                      </div>
                    )}

                </div>
              )}

              {/* Buttons */}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeGenerateModal}
                  disabled={generating}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {generationResult
                    ? "Close"
                    : "Cancel"}
                </button>

                {!generationResult && (
                  <button
                    type="submit"
                    disabled={
                      generating ||
                      loadingOptions
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {generating ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />

                        Generating...
                      </>
                    ) : (
                      <>
                        <Plus size={18} />

                        Generate Invoices
                      </>
                    )}

                  </button>
                )}

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default AccountantInvoices;