import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  FileText,
  FolderOpen,
  Loader2,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Settings2,
  Trash2,
  X,
  Zap,
} from "lucide-react";

import {
  getSessions,
  getTerms,
  getClassLevels,
} from "../../../services/academicsService";

import {
  getFeeCategories,
  createFeeCategory,
  updateFeeCategory,
  deleteFeeCategory,

  getFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,

  getInvoices,
  getFinanceSummary,
  generateInvoices,
} from "../../../services/financeService";


const formatCurrency = (value) => {
  const number = Number(value || 0);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(number);
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


const getId = (item) => {
  if (!item) return "";

  return String(item.id);
};


const getSessionName = (session) =>
  session?.name ||
  session?.session_name ||
  session?.academic_session_name ||
  "";


const getTermName = (term) =>
  term?.name ||
  term?.term_name ||
  term?.title ||
  "";


const getClassName = (classLevel) =>
  classLevel?.name ||
  classLevel?.class_name ||
  classLevel?.class_level_name ||
  "";


const emptyCategory = {
  name: "",
  description: "",
  is_mandatory: true,
  is_active: true,
};


const emptyStructure = {
  academic_session: "",
  term: "",
  class_level: "",
  fee_category: "",
  amount: "",
  due_date: "",
  description: "",
  is_active: true,
};


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


const inputClass =
  "w-full rounded-xl border border-black/10 bg-[var(--color-background)] px-3.5 py-2.5 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text)]/40 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 dark:border-white/10";


function Fees() {
  const [activeSection, setActiveSection] = useState("overview");

  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);

  const [categories, setCategories] = useState([]);
  const [structures, setStructures] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [categoryModal, setCategoryModal] = useState(false);
  const [structureModal, setStructureModal] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editingStructure, setEditingStructure] = useState(null);

  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [structureForm, setStructureForm] = useState(emptyStructure);

  const [categorySearch, setCategorySearch] = useState("");
  const [structureSearch, setStructureSearch] = useState("");
  const [invoiceSearch, setInvoiceSearch] = useState("");

  const [invoiceSession, setInvoiceSession] = useState("");
  const [invoiceTerm, setInvoiceTerm] = useState("");
  const [invoiceClass, setInvoiceClass] = useState("");

  const [generating, setGenerating] = useState(false);

  const [generateResult, setGenerateResult] = useState(null);

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
        sessionsData,
        termsData,
        classesData,
        categoriesData,
        structuresData,
        invoicesData,
        summaryData,
      ] = await Promise.all([
        getSessions(),
        getTerms(),
        getClassLevels(),
        getFeeCategories(),
        getFeeStructures(),
        getInvoices(),
        getFinanceSummary(),
      ]);

      const sessionItems = getItems(sessionsData);
      const termItems = getItems(termsData);
      const classItems = getItems(classesData);

      setSessions(sessionItems);
      setTerms(termItems);
      setClassLevels(classItems);

      setCategories(getItems(categoriesData));
      setStructures(getItems(structuresData));
      setInvoices(getItems(invoicesData));
      setSummary(summaryData);

      const currentSession =
        sessionItems.find(
          (item) =>
            item.is_current === true ||
            item.current === true
        );

      const currentTerm =
        termItems.find(
          (item) =>
            item.is_current === true ||
            item.current === true
        );

      if (!invoiceSession && currentSession) {
        setInvoiceSession(getId(currentSession));
      }

      if (!invoiceTerm && currentTerm) {
        setInvoiceTerm(getId(currentTerm));
      }
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Unable to load finance data."
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
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [success]);


  const filteredCategories = useMemo(() => {
    const search = categorySearch
      .trim()
      .toLowerCase();

    if (!search) return categories;

    return categories.filter((item) =>
      [
        item.name,
        item.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [categories, categorySearch]);


  const filteredStructures = useMemo(() => {
    const search = structureSearch
      .trim()
      .toLowerCase();

    if (!search) return structures;

    return structures.filter((item) =>
      [
        item.class_level_name,
        item.fee_category_name,
        item.academic_session_name,
        item.term_name,
        item.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [structures, structureSearch]);


  const filteredInvoices = useMemo(() => {
    const search = invoiceSearch
      .trim()
      .toLowerCase();

    if (!search) return invoices;

    return invoices.filter((item) =>
      [
        item.invoice_number,
        item.student_name,
        item.fee_category_name,
        item.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [invoices, invoiceSearch]);


  const openCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm(emptyCategory);
    setCategoryModal(true);
  };


  const openEditCategory = (category) => {
    setEditingCategory(category);

    setCategoryForm({
      name: category.name || "",
      description: category.description || "",
      is_mandatory:
        category.is_mandatory !== false,
      is_active:
        category.is_active !== false,
    });

    setCategoryModal(true);
  };


  const submitCategory = async (event) => {
    event.preventDefault();

    try {
      setError("");

      if (!categoryForm.name.trim()) {
        setError("Fee category name is required.");
        return;
      }

      if (editingCategory) {
        await updateFeeCategory(
          editingCategory.id,
          categoryForm
        );

        setSuccess(
          "Fee category updated successfully."
        );
      } else {
        await createFeeCategory(categoryForm);

        setSuccess(
          "Fee category created successfully."
        );
      }

      setCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm(emptyCategory);

      await loadData({
        showLoader: false,
      });
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.name?.[0] ||
          "Unable to save fee category."
      );
    }
  };


  const handleDeleteCategory = async (category) => {
    const confirmed = window.confirm(
      `Delete "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteFeeCategory(category.id);

      setSuccess(
        "Fee category deleted successfully."
      );

      await loadData({
        showLoader: false,
      });
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Unable to delete this fee category. It may already be in use."
      );
    }
  };


  const openCreateStructure = () => {
    setEditingStructure(null);

    setStructureForm({
      ...emptyStructure,
      academic_session: invoiceSession || "",
      term: invoiceTerm || "",
    });

    setStructureModal(true);
  };


  const openEditStructure = (structure) => {
    setEditingStructure(structure);

    setStructureForm({
      academic_session:
        structure.academic_session
          ? String(structure.academic_session)
          : "",
      term:
        structure.term
          ? String(structure.term)
          : "",
      class_level:
        structure.class_level
          ? String(structure.class_level)
          : "",
      fee_category:
        structure.fee_category
          ? String(structure.fee_category)
          : "",
      amount:
        structure.amount ?? "",
      due_date:
        structure.due_date || "",
      description:
        structure.description || "",
      is_active:
        structure.is_active !== false,
    });

    setStructureModal(true);
  };


  const submitStructure = async (event) => {
    event.preventDefault();

    try {
      setError("");

      if (
        !structureForm.academic_session ||
        !structureForm.term ||
        !structureForm.class_level ||
        !structureForm.fee_category
      ) {
        setError(
          "Session, term, class and fee category are required."
        );

        return;
      }

      if (
        !structureForm.amount ||
        Number(structureForm.amount) <= 0
      ) {
        setError(
          "Fee amount must be greater than zero."
        );

        return;
      }

      const payload = {
        academic_session:
          Number(structureForm.academic_session),
        term:
          Number(structureForm.term),
        class_level:
          Number(structureForm.class_level),
        fee_category:
          Number(structureForm.fee_category),
        amount:
          Number(structureForm.amount),
        due_date:
          structureForm.due_date || null,
        description:
          structureForm.description,
        is_active:
          structureForm.is_active,
      };

      if (editingStructure) {
        await updateFeeStructure(
          editingStructure.id,
          payload
        );

        setSuccess(
          "Fee structure updated successfully."
        );
      } else {
        await createFeeStructure(payload);

        setSuccess(
          "Fee structure created successfully."
        );
      }

      setStructureModal(false);
      setEditingStructure(null);
      setStructureForm(emptyStructure);

      await loadData({
        showLoader: false,
      });
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.amount?.[0] ||
          err?.response?.data?.non_field_errors?.[0] ||
          "Unable to save fee structure."
      );
    }
  };


  const handleDeleteStructure = async (structure) => {
    const confirmed = window.confirm(
      `Delete the ${structure.fee_category_name || "fee"} structure for ${structure.class_level_name || "this class"}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteFeeStructure(structure.id);

      setSuccess(
        "Fee structure deleted successfully."
      );

      await loadData({
        showLoader: false,
      });
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          "Unable to delete this fee structure."
      );
    }
  };


  const handleGenerateInvoices = async (event) => {
    event.preventDefault();

    if (
      !invoiceSession ||
      !invoiceTerm ||
      !invoiceClass
    ) {
      setError(
        "Select academic session, term and class before generating invoices."
      );

      return;
    }

    try {
      setError("");
      setGenerateResult(null);
      setGenerating(true);

      const result = await generateInvoices({
        academic_session:
          Number(invoiceSession),
        term:
          Number(invoiceTerm),
        class_level:
          Number(invoiceClass),
      });

      setGenerateResult(result);

      setSuccess(
        result?.message ||
          "Invoice generation completed successfully."
      );

      await loadData({
        showLoader: false,
      });
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Unable to generate invoices."
      );
    } finally {
      setGenerating(false);
    }
  };


  const renderOverview = () => {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={FileText}
            label="Total Invoiced"
            value={formatCurrency(
              summary?.total_invoiced
            )}
            description="All generated invoices"
          />

          <StatCard
            icon={CheckCircle2}
            label="Total Collected"
            value={formatCurrency(
              summary?.total_collected
            )}
            description="Successful payments"
          />

          <StatCard
            icon={Receipt}
            label="Outstanding"
            value={formatCurrency(
              summary?.total_outstanding
            )}
            description="Remaining student balances"
          />

          <StatCard
            icon={FolderOpen}
            label="Discounts"
            value={formatCurrency(
              summary?.total_discounts
            )}
            description="Applied invoice discounts"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={CheckCircle2}
            label="Paid Invoices"
            value={summary?.paid_invoices ?? 0}
          />

          <StatCard
            icon={Receipt}
            label="Partial"
            value={summary?.partial_invoices ?? 0}
          />

          <StatCard
            icon={FileText}
            label="Unpaid"
            value={summary?.unpaid_invoices ?? 0}
          />

          <StatCard
            icon={AlertCircle}
            label="Overdue"
            value={summary?.overdue_invoices ?? 0}
          />
        </div>

        <div className="rounded-2xl border border-black/5 bg-[var(--color-card)] p-5 shadow-sm dark:border-white/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-[var(--color-text)]">
                Finance Setup
              </h3>

              <p className="mt-1 text-sm text-[var(--color-text)]/60">
                Configure fee categories and structures before
                generating student invoices.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setActiveSection("generate")
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              <Zap size={17} />
              Generate Invoices
            </button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <button
              type="button"
              onClick={() =>
                setActiveSection("categories")
              }
              className="rounded-xl border border-black/10 p-4 text-left transition hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5 dark:border-white/10"
            >
              <FolderOpen
                size={20}
                className="text-[var(--color-primary)]"
              />

              <p className="mt-3 font-medium text-[var(--color-text)]">
                Fee Categories
              </p>

              <p className="mt-1 text-xs text-[var(--color-text)]/55">
                {categories.length} categories configured
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveSection("structures")
              }
              className="rounded-xl border border-black/10 p-4 text-left transition hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5 dark:border-white/10"
            >
              <Settings2
                size={20}
                className="text-[var(--color-primary)]"
              />

              <p className="mt-3 font-medium text-[var(--color-text)]">
                Fee Structures
              </p>

              <p className="mt-1 text-xs text-[var(--color-text)]/55">
                {structures.length} structures configured
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveSection("invoices")
              }
              className="rounded-xl border border-black/10 p-4 text-left transition hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5 dark:border-white/10"
            >
              <Receipt
                size={20}
                className="text-[var(--color-primary)]"
              />

              <p className="mt-3 font-medium text-[var(--color-text)]">
                Student Invoices
              </p>

              <p className="mt-1 text-xs text-[var(--color-text)]/55">
                {invoices.length} invoices generated
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  };


  const renderCategories = () => {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Fee Categories
            </h2>

            <p className="text-sm text-[var(--color-text)]/60">
              Define the types of fees charged by the school.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateCategory}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus size={17} />
            Add Category
          </button>
        </div>

        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text)]/40"
          />

          <input
            value={categorySearch}
            onChange={(event) =>
              setCategorySearch(event.target.value)
            }
            placeholder="Search fee categories..."
            className={`${inputClass} pl-10`}
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-black/5 bg-[var(--color-card)] shadow-sm dark:border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full text-left">
              <thead className="bg-[var(--color-background)]">
                <tr className="text-xs uppercase tracking-wide text-[var(--color-text)]/55">
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Mandatory</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-black/5 dark:divide-white/10">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-5 py-10 text-center text-sm text-[var(--color-text)]/50"
                    >
                      No fee categories found.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-5 py-4 font-medium text-[var(--color-text)]">
                        {category.name}
                      </td>

                      <td className="px-5 py-4 text-sm text-[var(--color-text)]/65">
                        {category.description || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-[var(--color-text)]">
                        {category.is_mandatory
                          ? "Yes"
                          : "No"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-[var(--color-primary)]/10 px-2.5 py-1 text-xs font-medium text-[var(--color-primary)]">
                          {category.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditCategory(category)
                            }
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteCategory(
                                category
                              )
                            }
                            className="rounded-lg p-2 text-[var(--color-text)]/50 hover:bg-[var(--color-background)] hover:text-[var(--color-primary)]"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };


  const renderStructures = () => {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Fee Structures
            </h2>

            <p className="text-sm text-[var(--color-text)]/60">
              Configure fees for a specific session, term and class.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateStructure}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus size={17} />
            Add Structure
          </button>
        </div>

        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text)]/40"
          />

          <input
            value={structureSearch}
            onChange={(event) =>
              setStructureSearch(event.target.value)
            }
            placeholder="Search structures..."
            className={`${inputClass} pl-10`}
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-black/5 bg-[var(--color-card)] shadow-sm dark:border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-[1000px] w-full text-left">
              <thead className="bg-[var(--color-background)]">
                <tr className="text-xs uppercase tracking-wide text-[var(--color-text)]/55">
                  <th className="px-5 py-3">Session</th>
                  <th className="px-5 py-3">Term</th>
                  <th className="px-5 py-3">Class</th>
                  <th className="px-5 py-3">Fee</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Due Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-black/5 dark:divide-white/10">
                {filteredStructures.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-5 py-10 text-center text-sm text-[var(--color-text)]/50"
                    >
                      No fee structures found.
                    </td>
                  </tr>
                ) : (
                  filteredStructures.map((structure) => (
                    <tr key={structure.id}>
                      <td className="px-5 py-4 text-sm text-[var(--color-text)]">
                        {structure.academic_session_name ||
                          "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-[var(--color-text)]">
                        {structure.term_name || "—"}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-[var(--color-text)]">
                        {structure.class_level_name ||
                          "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-[var(--color-text)]">
                        {structure.fee_category_name ||
                          "—"}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-[var(--color-text)]">
                        {formatCurrency(
                          structure.amount
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-[var(--color-text)]/65">
                        {formatDate(
                          structure.due_date
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-[var(--color-primary)]/10 px-2.5 py-1 text-xs font-medium text-[var(--color-primary)]">
                          {structure.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditStructure(
                                structure
                              )
                            }
                            className="rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteStructure(
                                structure
                              )
                            }
                            className="rounded-lg p-2 text-[var(--color-text)]/50 hover:bg-[var(--color-background)] hover:text-[var(--color-primary)]"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };


  const renderInvoices = () => {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Student Invoices
          </h2>

          <p className="text-sm text-[var(--color-text)]/60">
            View invoices generated for students in your school.
          </p>
        </div>

        <div className="relative">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text)]/40"
          />

          <input
            value={invoiceSearch}
            onChange={(event) =>
              setInvoiceSearch(event.target.value)
            }
            placeholder="Search invoice number, student or fee..."
            className={`${inputClass} pl-10`}
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-black/5 bg-[var(--color-card)] shadow-sm dark:border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-[1050px] w-full text-left">
              <thead className="bg-[var(--color-background)]">
                <tr className="text-xs uppercase tracking-wide text-[var(--color-text)]/55">
                  <th className="px-5 py-3">Invoice</th>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Fee</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Discount</th>
                  <th className="px-5 py-3">Paid</th>
                  <th className="px-5 py-3">Balance</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-black/5 dark:divide-white/10">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-5 py-10 text-center text-sm text-[var(--color-text)]/50"
                    >
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-5 py-4 text-sm font-medium text-[var(--color-text)]">
                        {invoice.invoice_number}
                      </td>

                      <td className="px-5 py-4 text-sm text-[var(--color-text)]">
                        {invoice.student_name ||
                          "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-[var(--color-text)]/70">
                        {invoice.fee_category_name ||
                          "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-[var(--color-text)]">
                        {formatCurrency(
                          invoice.amount
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-[var(--color-text)]/70">
                        {formatCurrency(
                          invoice.discount
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-[var(--color-text)]/70">
                        {formatCurrency(
                          invoice.amount_paid
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-[var(--color-text)]">
                        {formatCurrency(
                          invoice.balance
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-[var(--color-primary)]/10 px-2.5 py-1 text-xs font-medium text-[var(--color-primary)]">
                          {invoice.status || "—"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };


  const renderGenerate = () => {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Generate Student Invoices
          </h2>

          <p className="text-sm text-[var(--color-text)]/60">
            Generate invoices from the fee structures configured
            for a class, session and term.
          </p>
        </div>

        <div className="rounded-2xl border border-black/5 bg-[var(--color-card)] p-5 shadow-sm dark:border-white/10">
          <form
            onSubmit={handleGenerateInvoices}
            className="space-y-5"
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Field
                label="Academic Session"
                required
              >
                <select
                  value={invoiceSession}
                  onChange={(event) =>
                    setInvoiceSession(
                      event.target.value
                    )
                  }
                  className={inputClass}
                >
                  <option value="">
                    Select session
                  </option>

                  {sessions.map((session) => (
                    <option
                      key={session.id}
                      value={session.id}
                    >
                      {getSessionName(session)}
                      {session.is_current
                        ? " — Current"
                        : ""}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Term" required>
                <select
                  value={invoiceTerm}
                  onChange={(event) =>
                    setInvoiceTerm(
                      event.target.value
                    )
                  }
                  className={inputClass}
                >
                  <option value="">
                    Select term
                  </option>

                  {terms.map((term) => (
                    <option
                      key={term.id}
                      value={term.id}
                    >
                      {getTermName(term)}
                      {term.is_current
                        ? " — Current"
                        : ""}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Class" required>
                <select
                  value={invoiceClass}
                  onChange={(event) =>
                    setInvoiceClass(
                      event.target.value
                    )
                  }
                  className={inputClass}
                >
                  <option value="">
                    Select class
                  </option>

                  {classLevels.map((classLevel) => (
                    <option
                      key={classLevel.id}
                      value={classLevel.id}
                    >
                      {getClassName(classLevel)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="rounded-xl border border-[var(--color-primary)]/15 bg-[var(--color-primary)]/5 p-4">
              <div className="flex gap-3">
                <Zap
                  size={19}
                  className="mt-0.5 shrink-0 text-[var(--color-primary)]"
                />

                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">
                    How invoice generation works
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[var(--color-text)]/65">
                    The system uses the active fee structures
                    for the selected session, term and class.
                    Existing invoices are skipped automatically.
                    Applicable scholarships are calculated after
                    each invoice is created.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Generating...
                </>
              ) : (
                <>
                  <Zap size={17} />
                  Generate Invoices
                </>
              )}
            </button>
          </form>
        </div>

        {generateResult && (
          <div className="rounded-2xl border border-black/5 bg-[var(--color-card)] p-5 shadow-sm dark:border-white/10">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={21}
                className="mt-0.5 text-[var(--color-primary)]"
              />

              <div>
                <h3 className="font-semibold text-[var(--color-text)]">
                  Invoice generation completed
                </h3>

                <p className="mt-1 text-sm text-[var(--color-text)]/60">
                  {generateResult.message ||
                    "Invoice generation completed."}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-[var(--color-background)] p-4">
                <p className="text-xs text-[var(--color-text)]/55">
                  Created
                </p>

                <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">
                  {generateResult.created_count ??
                    0}
                </p>
              </div>

              <div className="rounded-xl bg-[var(--color-background)] p-4">
                <p className="text-xs text-[var(--color-text)]/55">
                  Skipped
                </p>

                <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">
                  {generateResult.skipped_count ??
                    0}
                </p>
              </div>
            </div>

            {Array.isArray(
              generateResult.skipped_invoices
            ) &&
              generateResult.skipped_invoices.length >
                0 && (
                <div className="mt-5">
                  <h4 className="mb-3 text-sm font-semibold text-[var(--color-text)]">
                    Skipped invoices
                  </h4>

                  <div className="space-y-2">
                    {generateResult.skipped_invoices.map(
                      (item, index) => (
                        <div
                          key={`${item.student}-${index}`}
                          className="rounded-xl bg-[var(--color-background)] p-3 text-sm"
                        >
                          <span className="font-medium text-[var(--color-text)]">
                            {item.invoice_number ||
                              "Invoice"}
                          </span>

                          <span className="ml-2 text-[var(--color-text)]/60">
                            {item.reason ||
                              "Already exists."}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    );
  };


  const renderCategoryModal = () => {
    if (!categoryModal) return null;

    return (
      <Modal
        title={
          editingCategory
            ? "Edit Fee Category"
            : "Add Fee Category"
        }
        onClose={() => {
          setCategoryModal(false);
          setEditingCategory(null);
        }}
      >
        <form
          onSubmit={submitCategory}
          className="space-y-5"
        >
          <Field label="Category Name" required>
            <input
              value={categoryForm.name}
              onChange={(event) =>
                setCategoryForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              placeholder="e.g. Tuition Fee"
              className={inputClass}
            />
          </Field>

          <Field label="Description">
            <textarea
              value={categoryForm.description}
              onChange={(event) =>
                setCategoryForm((current) => ({
                  ...current,
                  description:
                    event.target.value,
                }))
              }
              rows={4}
              placeholder="Describe this fee category..."
              className={inputClass}
            />
          </Field>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
              <input
                type="checkbox"
                checked={categoryForm.is_mandatory}
                onChange={(event) =>
                  setCategoryForm((current) => ({
                    ...current,
                    is_mandatory:
                      event.target.checked,
                  }))
                }
              />

              Mandatory fee
            </label>

            <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
              <input
                type="checkbox"
                checked={categoryForm.is_active}
                onChange={(event) =>
                  setCategoryForm((current) => ({
                    ...current,
                    is_active:
                      event.target.checked,
                  }))
                }
              />

              Active
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-black/5 pt-4 dark:border-white/10">
            <button
              type="button"
              onClick={() =>
                setCategoryModal(false)
              }
              className="rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium text-[var(--color-text)] dark:border-white/10"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              {editingCategory
                ? "Save Changes"
                : "Create Category"}
            </button>
          </div>
        </form>
      </Modal>
    );
  };


  const renderStructureModal = () => {
    if (!structureModal) return null;

    return (
      <Modal
        title={
          editingStructure
            ? "Edit Fee Structure"
            : "Add Fee Structure"
        }
        onClose={() => {
          setStructureModal(false);
          setEditingStructure(null);
        }}
      >
        <form
          onSubmit={submitStructure}
          className="space-y-5"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Academic Session"
              required
            >
              <select
                value={structureForm.academic_session}
                onChange={(event) =>
                  setStructureForm((current) => ({
                    ...current,
                    academic_session:
                      event.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="">
                  Select session
                </option>

                {sessions.map((session) => (
                  <option
                    key={session.id}
                    value={session.id}
                  >
                    {getSessionName(session)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Term" required>
              <select
                value={structureForm.term}
                onChange={(event) =>
                  setStructureForm((current) => ({
                    ...current,
                    term: event.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="">
                  Select term
                </option>

                {terms.map((term) => (
                  <option
                    key={term.id}
                    value={term.id}
                  >
                    {getTermName(term)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Class" required>
              <select
                value={structureForm.class_level}
                onChange={(event) =>
                  setStructureForm((current) => ({
                    ...current,
                    class_level:
                      event.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="">
                  Select class
                </option>

                {classLevels.map((classLevel) => (
                  <option
                    key={classLevel.id}
                    value={classLevel.id}
                  >
                    {getClassName(classLevel)}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Fee Category"
              required
            >
              <select
                value={structureForm.fee_category}
                onChange={(event) =>
                  setStructureForm((current) => ({
                    ...current,
                    fee_category:
                      event.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="">
                  Select fee category
                </option>

                {categories
                  .filter(
                    (category) =>
                      category.is_active !== false
                  )
                  .map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
              </select>
            </Field>

            <Field label="Amount" required>
              <input
                type="number"
                min="0"
                step="0.01"
                value={structureForm.amount}
                onChange={(event) =>
                  setStructureForm((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
                placeholder="0.00"
                className={inputClass}
              />
            </Field>

            <Field label="Due Date">
              <input
                type="date"
                value={structureForm.due_date}
                onChange={(event) =>
                  setStructureForm((current) => ({
                    ...current,
                    due_date:
                      event.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={structureForm.description}
              onChange={(event) =>
                setStructureForm((current) => ({
                  ...current,
                  description:
                    event.target.value,
                }))
              }
              rows={3}
              placeholder="Optional description..."
              className={inputClass}
            />
          </Field>

          <label className="flex items-center gap-2 text-sm text-[var(--color-text)]">
            <input
              type="checkbox"
              checked={structureForm.is_active}
              onChange={(event) =>
                setStructureForm((current) => ({
                  ...current,
                  is_active:
                    event.target.checked,
                }))
              }
            />

            Active fee structure
          </label>

          <div className="flex justify-end gap-3 border-t border-black/5 pt-4 dark:border-white/10">
            <button
              type="button"
              onClick={() =>
                setStructureModal(false)
              }
              className="rounded-xl border border-black/10 px-4 py-2.5 text-sm font-medium text-[var(--color-text)] dark:border-white/10"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              {editingStructure
                ? "Save Changes"
                : "Create Structure"}
            </button>
          </div>
        </form>
      </Modal>
    );
  };


  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-[var(--color-text)]/60">
          <Loader2
            size={22}
            className="animate-spin text-[var(--color-primary)]"
          />

          <span>Loading finance...</span>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-full bg-[var(--color-background)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--color-primary)]">
              School Admin Finance
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
              Fees
            </h1>

            <p className="mt-1 text-sm text-[var(--color-text)]/60">
              Manage fee categories, structures and student invoices.
            </p>
          </div>

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
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-4">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-[var(--color-primary)]"
            />

            <div className="flex-1">
              <p className="text-sm font-medium text-[var(--color-text)]">
                Finance action failed
              </p>

              <p className="mt-1 text-sm text-[var(--color-text)]/65">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 text-[var(--color-text)]/50 hover:text-[var(--color-text)]"
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

        <div className="flex gap-2 overflow-x-auto rounded-2xl border border-black/5 bg-[var(--color-card)] p-2 shadow-sm dark:border-white/10">
          {[
            {
              id: "overview",
              label: "Overview",
              icon: FileText,
            },
            {
              id: "categories",
              label: "Fee Categories",
              icon: FolderOpen,
            },
            {
              id: "structures",
              label: "Fee Structures",
              icon: Settings2,
            },
            {
              id: "invoices",
              label: "Student Invoices",
              icon: Receipt,
            },
            {
              id: "generate",
              label: "Generate Invoices",
              icon: Zap,
            },
          ].map((item) => {
            const Icon = item.icon;

            const active =
              activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setActiveSection(item.id)
                }
                className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-[var(--color-primary)] text-white"
                    : "text-[var(--color-text)]/65 hover:bg-[var(--color-background)] hover:text-[var(--color-text)]"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>

        {activeSection === "overview" &&
          renderOverview()}

        {activeSection === "categories" &&
          renderCategories()}

        {activeSection === "structures" &&
          renderStructures()}

        {activeSection === "invoices" &&
          renderInvoices()}

        {activeSection === "generate" &&
          renderGenerate()}
      </div>

      {renderCategoryModal()}
      {renderStructureModal()}
    </div>
  );
}


export default Fees;