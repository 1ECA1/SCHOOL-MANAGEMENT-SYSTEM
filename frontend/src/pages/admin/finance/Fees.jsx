
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Edit,
  Eye,
  FileText,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  getSessions,
  getSchools,
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

const emptyCategoryForm = {
  name: "",
  description: "",
  is_mandatory: true,
  is_active: true,
};

const emptyStructureForm = {
  academic_session: "",
  term: "",
  class_level: "",
  fee_category: "",
  amount: "",
  due_date: "",
  description: "",
  is_active: true,
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getList = (data) => {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

const getSchoolName = (school) =>
  school?.name ||
  school?.school_name ||
  school?.schoolName ||
  `School ${school?.id ?? ""}`;

const getSessionName = (session) =>
  session?.name ||
  session?.session_name ||
  session?.academic_session_name ||
  `Session ${session?.id ?? ""}`;

const getTermName = (term) =>
  term?.name ||
  term?.term_name ||
  term?.title ||
  `Term ${term?.id ?? ""}`;

const getClassName = (classLevel) =>
  classLevel?.name ||
  classLevel?.class_name ||
  classLevel?.class_level_name ||
  classLevel?.title ||
  `Class ${classLevel?.id ?? ""}`;

const Fees = () => {
  const [schools, setSchools] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);

  const [categories, setCategories] = useState([]);
  const [structures, setStructures] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState(null);

  const [selectedSchool, setSelectedSchool] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [categoryModal, setCategoryModal] = useState(false);
  const [structureModal, setStructureModal] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editingStructure, setEditingStructure] = useState(null);

  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [structureForm, setStructureForm] = useState(emptyStructureForm);

  const [categorySearch, setCategorySearch] = useState("");
  const [structureSearch, setStructureSearch] = useState("");
  const [invoiceSearch, setInvoiceSearch] = useState("");

  const [invoiceSession, setInvoiceSession] = useState("");
  const [invoiceTerm, setInvoiceTerm] = useState("");
  const [invoiceClass, setInvoiceClass] = useState("");

  const [generatingInvoices, setGeneratingInvoices] = useState(false);

  const [viewModal, setViewModal] = useState({
    type: "",
    item: null,
  });

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const showError = (message) => {
    setSuccess("");
    setError(message || "Something went wrong.");
  };

  const showSuccess = (message) => {
    setError("");
    setSuccess(message);
  };

  const loadBaseData = async () => {
    const [
      schoolsResponse,
      sessionsResponse,
      termsResponse,
      classLevelsResponse,
    ] = await Promise.all([
      getSchools(),
      getSessions(),
      getTerms(),
      getClassLevels(),
    ]);

    const schoolList = getList(schoolsResponse);
    const sessionList = getList(sessionsResponse);
    const termList = getList(termsResponse);
    const classList = getList(classLevelsResponse);

    setSchools(schoolList);
    setSessions(sessionList);
    setTerms(termList);
    setClassLevels(classList);

    const currentSession =
      sessionList.find(
        (session) =>
          session?.is_current === true ||
          session?.current === true,
      ) || sessionList[sessionList.length - 1];

    const currentTerm =
      termList.find(
        (term) =>
          term?.is_current === true ||
          term?.current === true,
      ) || termList[termList.length - 1];

    if (!invoiceSession && currentSession?.id) {
      setInvoiceSession(String(currentSession.id));
    }

    if (!invoiceTerm && currentTerm?.id) {
      setInvoiceTerm(String(currentTerm.id));
    }

    return {
      schoolList,
      sessionList,
      termList,
      classList,
    };
  };

  const loadFinanceData = async (schoolId = "") => {
    const schoolQuery = schoolId
      ? { params: { school: schoolId } }
      : undefined;

    const [
      categoriesResponse,
      structuresResponse,
      invoicesResponse,
      summaryResponse,
    ] = await Promise.all([
      getFeeCategories(schoolQuery),
      getFeeStructures(schoolQuery),
      getInvoices(),
      getFinanceSummary(),
    ]);

    setCategories(getList(categoriesResponse));
    setStructures(getList(structuresResponse));
    setInvoices(getList(invoicesResponse));
    setSummary(summaryResponse || null);
  };

  const loadAll = async (schoolId = "") => {
    try {
      setError("");

      await loadBaseData();
      await loadFinanceData(schoolId);
    } catch (err) {
      console.error("Failed to load finance data:", err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to load finance data.";

      showError(message);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        setLoading(true);

        if (mounted) {
          await loadAll("");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      clearMessages();

      await loadAll(selectedSchool);
      showSuccess("Finance data refreshed successfully.");
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSchoolChange = async (event) => {
    const schoolId = event.target.value;

    setSelectedSchool(schoolId);
    clearMessages();

    try {
      setRefreshing(true);

      await loadFinanceData(schoolId);

      if (schoolId) {
        const school = schools.find(
          (item) => String(item.id) === String(schoolId),
        );

        showSuccess(
          `${getSchoolName(school)} finance data loaded.`,
        );
      }
    } catch (err) {
      console.error(err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to load the selected school's finance data.";

      showError(message);
    } finally {
      setRefreshing(false);
    }
  };

  const openCreateCategory = () => {
    clearMessages();
    setEditingCategory(null);
    setCategoryForm(emptyCategoryForm);
    setCategoryModal(true);
  };

  const openEditCategory = (category) => {
    clearMessages();

    setEditingCategory(category);

    setCategoryForm({
      name: category?.name || "",
      description: category?.description || "",
      is_mandatory:
        category?.is_mandatory === undefined
          ? true
          : Boolean(category.is_mandatory),
      is_active:
        category?.is_active === undefined
          ? true
          : Boolean(category.is_active),
    });

    setCategoryModal(true);
  };

  const closeCategoryModal = () => {
    if (saving) return;

    setCategoryModal(false);
    setEditingCategory(null);
    setCategoryForm(emptyCategoryForm);
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();

    if (!categoryForm.name.trim()) {
      showError("Fee category name is required.");
      return;
    }

    if (!selectedSchool) {
      showError("Please select a school before creating a fee category.");
      return;
    }

    try {
      setSaving(true);
      clearMessages();

      const payload = {
        school: Number(selectedSchool),
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        is_mandatory: Boolean(categoryForm.is_mandatory),
        is_active: Boolean(categoryForm.is_active),
      };

      if (editingCategory) {
        await updateFeeCategory(editingCategory.id, payload);
        showSuccess("Fee category updated successfully.");
      } else {
        await createFeeCategory(payload);
        showSuccess("Fee category created successfully.");
      }

      closeCategoryModal();
      await loadFinanceData(selectedSchool);
    } catch (err) {
      console.error("Fee category save error:", err);

      const data = err?.response?.data;

      const message =
        data?.detail ||
        data?.message ||
        data?.name?.[0] ||
        "Failed to save fee category.";

      showError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    const confirmed = window.confirm(
      `Delete "${category?.name}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      clearMessages();
      setSaving(true);

      await deleteFeeCategory(category.id);

      showSuccess("Fee category deleted successfully.");

      await loadFinanceData(selectedSchool);
    } catch (err) {
      console.error("Fee category delete error:", err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to delete fee category.";

      showError(message);
    } finally {
      setSaving(false);
    }
  };

  const openCreateStructure = () => {
    clearMessages();

    setEditingStructure(null);

    setStructureForm({
      ...emptyStructureForm,
      academic_session: invoiceSession || "",
      term: invoiceTerm || "",
    });

    setStructureModal(true);
  };

  const openEditStructure = (structure) => {
    clearMessages();

    setEditingStructure(structure);

    setStructureForm({
      academic_session:
        structure?.academic_session ||
        structure?.academic_session_id ||
        "",
      term:
        structure?.term ||
        structure?.term_id ||
        "",
      class_level:
        structure?.class_level ||
        structure?.class_level_id ||
        "",
      fee_category:
        structure?.fee_category ||
        structure?.fee_category_id ||
        "",
      amount: structure?.amount ?? "",
      due_date: structure?.due_date || "",
      description: structure?.description || "",
      is_active:
        structure?.is_active === undefined
          ? true
          : Boolean(structure.is_active),
    });

    setStructureModal(true);
  };

  const closeStructureModal = () => {
    if (saving) return;

    setStructureModal(false);
    setEditingStructure(null);
    setStructureForm(emptyStructureForm);
  };

  const handleStructureSubmit = async (event) => {
    event.preventDefault();

    if (!selectedSchool) {
      showError("Please select a school before creating a fee structure.");
      return;
    }

    if (!structureForm.academic_session) {
      showError("Please select an academic session.");
      return;
    }

    if (!structureForm.term) {
      showError("Please select a term.");
      return;
    }

    if (!structureForm.class_level) {
      showError("Please select a class.");
      return;
    }

    if (!structureForm.fee_category) {
      showError("Please select a fee category.");
      return;
    }

    if (
      structureForm.amount === "" ||
      Number(structureForm.amount) <= 0
    ) {
      showError("Fee amount must be greater than zero.");
      return;
    }

    try {
      setSaving(true);
      clearMessages();

      const payload = {
        school: Number(selectedSchool),
        academic_session: Number(structureForm.academic_session),
        term: Number(structureForm.term),
        class_level: Number(structureForm.class_level),
        fee_category: Number(structureForm.fee_category),
        amount: Number(structureForm.amount),
        due_date: structureForm.due_date || null,
        description: structureForm.description.trim(),
        is_active: Boolean(structureForm.is_active),
      };

      if (editingStructure) {
        await updateFeeStructure(
          editingStructure.id,
          payload,
        );

        showSuccess("Fee structure updated successfully.");
      } else {
        await createFeeStructure(payload);

        showSuccess("Fee structure created successfully.");
      }

      closeStructureModal();
      await loadFinanceData(selectedSchool);
    } catch (err) {
      console.error("Fee structure save error:", err);

      const data = err?.response?.data;

      const message =
        data?.detail ||
        data?.message ||
        data?.academic_session?.[0] ||
        data?.term?.[0] ||
        data?.class_level?.[0] ||
        data?.fee_category?.[0] ||
        data?.amount?.[0] ||
        "Failed to save fee structure.";

      showError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStructure = async (structure) => {
    const confirmed = window.confirm(
      "Delete this fee structure?\n\nThis action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      clearMessages();
      setSaving(true);

      await deleteFeeStructure(structure.id);

      showSuccess("Fee structure deleted successfully.");

      await loadFinanceData(selectedSchool);
    } catch (err) {
      console.error("Fee structure delete error:", err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to delete fee structure.";

      showError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateInvoices = async (event) => {
    event.preventDefault();

    if (!selectedSchool) {
      showError("Please select a school before generating invoices.");
      return;
    }

    if (!invoiceSession) {
      showError("Please select an academic session.");
      return;
    }

    if (!invoiceTerm) {
      showError("Please select a term.");
      return;
    }

    if (!invoiceClass) {
      showError("Please select a class.");
      return;
    }

    try {
      setGeneratingInvoices(true);
      clearMessages();

      const response = await generateInvoices({
        school: Number(selectedSchool),
        academic_session: Number(invoiceSession),
        term: Number(invoiceTerm),
        class_level: Number(invoiceClass),
      });

      const created =
        response?.created ??
        response?.created_count ??
        response?.invoices_created ??
        0;

      const skipped =
        response?.skipped ??
        response?.skipped_count ??
        0;

      showSuccess(
        `Invoice generation completed. ${created} created${
          skipped ? `, ${skipped} skipped` : ""
        }.`,
      );

      await loadFinanceData(selectedSchool);
    } catch (err) {
      console.error("Invoice generation error:", err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to generate invoices.";

      showError(message);
    } finally {
      setGeneratingInvoices(false);
    }
  };

  const filteredCategories = useMemo(() => {
    const search = categorySearch.trim().toLowerCase();

    if (!search) return categories;

    return categories.filter((category) =>
      [
        category?.name,
        category?.description,
        category?.school_name,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(search),
        ),
    );
  }, [categories, categorySearch]);

  const filteredStructures = useMemo(() => {
    const search = structureSearch.trim().toLowerCase();

    if (!search) return structures;

    return structures.filter((structure) =>
      [
        structure?.fee_category_name,
        structure?.class_level_name,
        structure?.academic_session_name,
        structure?.term_name,
        structure?.description,
        structure?.school_name,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(search),
        ),
    );
  }, [structures, structureSearch]);

  const filteredInvoices = useMemo(() => {
    const search = invoiceSearch.trim().toLowerCase();

    if (!search) return invoices;

    return invoices.filter((invoice) =>
      [
        invoice?.invoice_number,
        invoice?.student_name,
        invoice?.fee_category_name,
        invoice?.session_name,
        invoice?.term_name,
        invoice?.status,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(search),
        ),
    );
  }, [invoices, invoiceSearch]);

  const selectedSchoolName = useMemo(() => {
    if (!selectedSchool) return "All Schools";

    const school = schools.find(
      (item) => String(item.id) === String(selectedSchool),
    );

    return school ? getSchoolName(school) : "Selected School";
  }, [schools, selectedSchool]);

  const openViewModal = (type, item) => {
    setViewModal({ type, item });
  };

  const closeViewModal = () => {
    setViewModal({ type: "", item: null });
  };

  const getStructureName = (structure) =>
    structure?.fee_category_name ||
    categories.find(
      (category) =>
        String(category.id) === String(structure?.fee_category),
    )?.name ||
    "Fee Structure";

  const getInvoiceName = (invoice) =>
    invoice?.student_name || invoice?.invoice_number || "Invoice";

  const statCards = [
    {
      label: "Total Invoiced",
      value: formatCurrency(summary?.total_invoiced),
      icon: FileText,
    },
    {
      label: "Total Collected",
      value: formatCurrency(summary?.total_collected),
      icon: CheckCircle2,
    },
    {
      label: "Outstanding",
      value: formatCurrency(summary?.total_outstanding),
      icon: AlertCircle,
    },
    {
      label: "Discounts",
      value: formatCurrency(summary?.total_discounts),
      icon: FileText,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] p-6">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-[var(--color-text)]">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading finance...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              Finance
            </h1>

            <p className="mt-1 text-sm text-[var(--color-text)] opacity-70">
              Super Admin finance management across all schools.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-[230px]">
              <select
                value={selectedSchool}
                onChange={handleSchoolChange}
                className="w-full appearance-none rounded-lg border border-[var(--color-secondary)] bg-[var(--color-card)] px-4 py-2.5 pr-10 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">All Schools</option>

                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {getSchoolName(school)}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text)] opacity-60" />
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] shadow-sm ring-1 ring-black/5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* =====================================================
            SCHOOL CONTEXT
        ===================================================== */}
        <div className="rounded-xl border border-[var(--color-secondary)] bg-[var(--color-card)] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text)] opacity-60">
            Current finance view
          </p>

          <p className="mt-1 text-lg font-semibold text-[var(--color-text)]">
            {selectedSchoolName}
          </p>

          {!selectedSchool && (
            <p className="mt-1 text-sm text-[var(--color-text)] opacity-60">
              Fee categories and fee structures are currently showing data
              across all schools. The finance overview is also global.
            </p>
          )}
        </div>

        {/* =====================================================
            ALERTS
        ===================================================== */}
        {error && (
          <div className="flex items-start justify-between gap-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-start justify-between gap-4 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* =====================================================
            SUMMARY
        ===================================================== */}
        <section>
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Finance Overview
            </h2>

            <p className="text-sm text-[var(--color-text)] opacity-60">
              Global finance summary available to Super Admin.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.label}
                  className="rounded-xl border border-[var(--color-secondary)] bg-[var(--color-card)] p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[var(--color-text)] opacity-65">
                      {card.label}
                    </p>

                    <div className="rounded-lg bg-[var(--color-primary)]/10 p-2">
                      <Icon className="h-5 w-5 text-[var(--color-primary)]" />
                    </div>
                  </div>

                  <p className="mt-3 text-xl font-bold text-[var(--color-text)]">
                    {card.value}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* =====================================================
            INVOICE STATUS
        ===================================================== */}
        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            ["Paid", summary?.paid_invoices],
            ["Partial", summary?.partial_invoices],
            ["Unpaid", summary?.unpaid_invoices],
            ["Overdue", summary?.overdue_invoices],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-[var(--color-secondary)] bg-[var(--color-card)] p-4"
            >
              <p className="text-xs uppercase tracking-wide text-[var(--color-text)] opacity-55">
                {label}
              </p>

              <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">
                {value ?? 0}
              </p>
            </div>
          ))}
        </section>

        {/* =====================================================
            FEE CATEGORIES
        ===================================================== */}
        <section className="rounded-xl border border-[var(--color-secondary)] bg-[var(--color-card)] shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[var(--color-secondary)] p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                Fee Categories
              </h2>

              <p className="text-sm text-[var(--color-text)] opacity-60">
                Manage fee categories for the selected school.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text)] opacity-50" />

                <input
                  type="text"
                  value={categorySearch}
                  onChange={(event) =>
                    setCategorySearch(event.target.value)
                  }
                  placeholder="Search categories..."
                  className="w-full rounded-lg border border-[var(--color-secondary)] bg-[var(--color-background)] py-2.5 pl-9 pr-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] sm:w-56"
                />
              </div>

              <button
                type="button"
                onClick={openCreateCategory}
                disabled={!selectedSchool}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </button>
            </div>
          </div>

          {!selectedSchool && (
            <div className="border-b border-[var(--color-secondary)] bg-yellow-50 px-5 py-3 text-sm text-yellow-800">
              Select a school above to create or edit fee categories.
            </div>
          )}

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--color-secondary)]">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] opacity-60">Name</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] opacity-60">School</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] opacity-60">Mandatory</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] opacity-60">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] opacity-60">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-10 text-center text-sm text-[var(--color-text)] opacity-60">
                      No fee categories found.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr key={category.id} className="border-b border-[var(--color-secondary)] last:border-b-0">
                      <td className="px-5 py-4">
                        <p className="font-medium text-[var(--color-text)]">{category.name}</p>
                        {category.description && (
                          <p className="mt-1 text-xs text-[var(--color-text)] opacity-60">{category.description}</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-[var(--color-text)]">
                        {category.school_name || schools.find((school) => String(school.id) === String(category.school))?.name || "-"}
                      </td>
                      <td className="px-5 py-4">
                        {category.is_mandatory ? (
                          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">Yes</span>
                        ) : (
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">No</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {category.is_active ? (
                          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">Active</span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">Inactive</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => openEditCategory(category)} disabled={!selectedSchool} className="rounded-lg p-2 text-[var(--color-primary)] hover:bg-[var(--color-background)] disabled:cursor-not-allowed disabled:opacity-40" title="Edit">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => handleDeleteCategory(category)} disabled={!selectedSchool || saving} className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile list: Name + View only */}
          <div className="md:hidden">
            {filteredCategories.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-[var(--color-text)] opacity-60">No fee categories found.</div>
            ) : (
              <div className="divide-y divide-[var(--color-secondary)]">
                {filteredCategories.map((category) => (
                  <div key={category.id} className="flex min-w-0 items-center justify-between gap-3 px-4 py-4">
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--color-text)]">{category.name || "-"}</p>
                    <button type="button" onClick={() => openViewModal("category", category)} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-white hover:opacity-90" aria-label={`View ${category.name || "fee category"}`}>
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            FEE STRUCTURES
        ===================================================== */}
        <section className="rounded-xl border border-[var(--color-secondary)] bg-[var(--color-card)] shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[var(--color-secondary)] p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                Fee Structures
              </h2>

              <p className="text-sm text-[var(--color-text)] opacity-60">
                Set fees by session, term, class and category.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text)] opacity-50" />

                <input
                  type="text"
                  value={structureSearch}
                  onChange={(event) =>
                    setStructureSearch(event.target.value)
                  }
                  placeholder="Search structures..."
                  className="w-full rounded-lg border border-[var(--color-secondary)] bg-[var(--color-background)] py-2.5 pl-9 pr-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] sm:w-56"
                />
              </div>

              <button
                type="button"
                onClick={openCreateStructure}
                disabled={!selectedSchool}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add Structure
              </button>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--color-secondary)]">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] opacity-60">Category</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] opacity-60">Session</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] opacity-60">Term</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] opacity-60">Class</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] opacity-60">Amount</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] opacity-60">Due Date</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] opacity-60">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] opacity-60">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStructures.length === 0 ? (
                  <tr><td colSpan="8" className="px-5 py-10 text-center text-sm text-[var(--color-text)] opacity-60">No fee structures found.</td></tr>
                ) : (
                  filteredStructures.map((structure) => (
                    <tr key={structure.id} className="border-b border-[var(--color-secondary)] last:border-b-0">
                      <td className="px-5 py-4 text-sm font-medium text-[var(--color-text)]">{getStructureName(structure)}</td>
                      <td className="px-5 py-4 text-sm text-[var(--color-text)]">{structure.academic_session_name || sessions.find((session) => String(session.id) === String(structure.academic_session))?.name || "-"}</td>
                      <td className="px-5 py-4 text-sm text-[var(--color-text)]">{structure.term_name || terms.find((term) => String(term.id) === String(structure.term))?.name || "-"}</td>
                      <td className="px-5 py-4 text-sm text-[var(--color-text)]">{structure.class_level_name || classLevels.find((item) => String(item.id) === String(structure.class_level))?.name || "-"}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-[var(--color-text)]">{formatCurrency(structure.amount)}</td>
                      <td className="px-5 py-4 text-sm text-[var(--color-text)]">{formatDate(structure.due_date)}</td>
                      <td className="px-5 py-4">
                        {structure.is_active ? <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">Active</span> : <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">Inactive</span>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => openEditStructure(structure)} disabled={!selectedSchool} className="rounded-lg p-2 text-[var(--color-primary)] hover:bg-[var(--color-background)] disabled:cursor-not-allowed disabled:opacity-40" title="Edit"><Edit className="h-4 w-4" /></button>
                          <button type="button" onClick={() => handleDeleteStructure(structure)} disabled={!selectedSchool || saving} className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40" title="Delete"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile list: Name + View only */}
          <div className="md:hidden">
            {filteredStructures.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-[var(--color-text)] opacity-60">No fee structures found.</div>
            ) : (
              <div className="divide-y divide-[var(--color-secondary)]">
                {filteredStructures.map((structure) => (
                  <div key={structure.id} className="flex min-w-0 items-center justify-between gap-3 px-4 py-4">
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--color-text)]">{getStructureName(structure)}</p>
                    <button type="button" onClick={() => openViewModal("structure", structure)} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-white hover:opacity-90" aria-label={`View ${getStructureName(structure)}`}><Eye className="h-4 w-4" /> View</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* =====================================================
            GENERATE INVOICES
        ===================================================== */}
        <section className="rounded-xl border border-[var(--color-secondary)] bg-[var(--color-card)] p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Generate Student Invoices
            </h2>

            <p className="mt-1 text-sm text-[var(--color-text)] opacity-60">
              Generate invoices for enrolled students using active fee
              structures.
            </p>
          </div>

          <form
            onSubmit={handleGenerateInvoices}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                School
              </label>

              <select
                value={selectedSchool}
                onChange={handleSchoolChange}
                className="w-full rounded-lg border border-[var(--color-secondary)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">Select School</option>

                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {getSchoolName(school)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                Academic Session
              </label>

              <select
                value={invoiceSession}
                onChange={(event) =>
                  setInvoiceSession(event.target.value)
                }
                className="w-full rounded-lg border border-[var(--color-secondary)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">Select Session</option>

                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {getSessionName(session)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                Term
              </label>

              <select
                value={invoiceTerm}
                onChange={(event) =>
                  setInvoiceTerm(event.target.value)
                }
                className="w-full rounded-lg border border-[var(--color-secondary)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">Select Term</option>

                {terms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {getTermName(term)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                Class
              </label>

              <select
                value={invoiceClass}
                onChange={(event) =>
                  setInvoiceClass(event.target.value)
                }
                className="w-full rounded-lg border border-[var(--color-secondary)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">Select Class</option>

                {classLevels.map((classLevel) => (
                  <option key={classLevel.id} value={classLevel.id}>
                    {getClassName(classLevel)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={
                  generatingInvoices ||
                  !selectedSchool ||
                  !invoiceSession ||
                  !invoiceTerm ||
                  !invoiceClass
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {generatingInvoices ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* =====================================================
            INVOICES
        ===================================================== */}
        <section className="rounded-xl border border-[var(--color-secondary)] bg-[var(--color-card)] shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[var(--color-secondary)] p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                Student Invoices
              </h2>

              <p className="text-sm text-[var(--color-text)] opacity-60">
                Super Admin can view invoices across all schools.
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text)] opacity-50" />

              <input
                type="text"
                value={invoiceSearch}
                onChange={(event) =>
                  setInvoiceSearch(event.target.value)
                }
                placeholder="Search invoices..."
                className="w-full rounded-lg border border-[var(--color-secondary)] bg-[var(--color-background)] py-2.5 pl-9 pr-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] sm:w-64"
              />
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--color-secondary)]">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] opacity-60">Invoice</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] opacity-60">Student</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] opacity-60">Category</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] opacity-60">Amount</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] opacity-60">Paid</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] opacity-60">Balance</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] opacity-60">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] opacity-60">Due</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-text)] opacity-60">View</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr><td colSpan="9" className="px-5 py-10 text-center text-sm text-[var(--color-text)] opacity-60">No invoices found.</td></tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-[var(--color-secondary)] last:border-b-0">
                      <td className="px-5 py-4 text-sm font-medium text-[var(--color-text)]">{invoice.invoice_number || "-"}</td>
                      <td className="px-5 py-4 text-sm text-[var(--color-text)]">{invoice.student_name || "-"}</td>
                      <td className="px-5 py-4 text-sm text-[var(--color-text)]">{invoice.fee_category_name || "-"}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-[var(--color-text)]">{formatCurrency(invoice.amount)}</td>
                      <td className="px-5 py-4 text-sm text-[var(--color-text)]">{formatCurrency(invoice.amount_paid)}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-[var(--color-text)]">{formatCurrency(invoice.balance)}</td>
                      <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${invoice.status === "PAID" ? "bg-green-100 text-green-700" : invoice.status === "PARTIAL" ? "bg-yellow-100 text-yellow-700" : invoice.status === "OVERDUE" ? "bg-red-100 text-red-700" : invoice.status === "CANCELLED" ? "bg-gray-100 text-gray-700" : "bg-blue-100 text-blue-700"}`}>{invoice.status || "UNPAID"}</span></td>
                      <td className="px-5 py-4 text-sm text-[var(--color-text)]">{formatDate(invoice.due_date)}</td>
                      <td className="px-5 py-4"><div className="flex justify-end"><button type="button" onClick={() => openViewModal("invoice", invoice)} className="inline-flex items-center justify-center rounded-lg p-2 text-[var(--color-primary)] hover:bg-[var(--color-background)]" title="View invoice" aria-label="View invoice"><Eye className="h-4 w-4" /></button></div></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile list: Name + View only */}
          <div className="md:hidden">
            {filteredInvoices.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-[var(--color-text)] opacity-60">No invoices found.</div>
            ) : (
              <div className="divide-y divide-[var(--color-secondary)]">
                {filteredInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex min-w-0 items-center justify-between gap-3 px-4 py-4">
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--color-text)]">{getInvoiceName(invoice)}</p>
                    <button type="button" onClick={() => openViewModal("invoice", invoice)} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-white hover:opacity-90" aria-label={`View ${getInvoiceName(invoice)}`}><Eye className="h-4 w-4" /> View</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* =====================================================
          CATEGORY MODAL
      ===================================================== */}
      {categoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-[var(--color-card)] shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--color-secondary)] px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  {editingCategory
                    ? "Edit Fee Category"
                    : "Add Fee Category"}
                </h3>

                <p className="text-xs text-[var(--color-text)] opacity-60">
                  {selectedSchoolName}
                </p>
              </div>

              <button
                type="button"
                onClick={closeCategoryModal}
                className="rounded-lg p-2 text-[var(--color-text)] hover:bg-[var(--color-background)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleCategorySubmit}
              className="space-y-4 p-5"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                  Category Name
                </label>

                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(event) =>
                    setCategoryForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Tuition Fee"
                  className="w-full rounded-lg border border-[var(--color-secondary)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                  Description
                </label>

                <textarea
                  rows="3"
                  value={categoryForm.description}
                  onChange={(event) =>
                    setCategoryForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Optional description"
                  className="w-full resize-none rounded-lg border border-[var(--color-secondary)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <label className="flex items-center gap-3 text-sm text-[var(--color-text)]">
                <input
                  type="checkbox"
                  checked={categoryForm.is_mandatory}
                  onChange={(event) =>
                    setCategoryForm((current) => ({
                      ...current,
                      is_mandatory: event.target.checked,
                    }))
                  }
                  className="h-4 w-4"
                />
                Mandatory fee
              </label>

              <label className="flex items-center gap-3 text-sm text-[var(--color-text)]">
                <input
                  type="checkbox"
                  checked={categoryForm.is_active}
                  onChange={(event) =>
                    setCategoryForm((current) => ({
                      ...current,
                      is_active: event.target.checked,
                    }))
                  }
                  className="h-4 w-4"
                />
                Active
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCategoryModal}
                  disabled={saving}
                  className="rounded-lg border border-[var(--color-secondary)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-background)]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {saving && (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  )}

                  {editingCategory
                    ? "Update Category"
                    : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          STRUCTURE MODAL
      ===================================================== */}
      {structureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-2xl rounded-xl bg-[var(--color-card)] shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--color-secondary)] px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-text)]">
                  {editingStructure
                    ? "Edit Fee Structure"
                    : "Add Fee Structure"}
                </h3>

                <p className="text-xs text-[var(--color-text)] opacity-60">
                  {selectedSchoolName}
                </p>
              </div>

              <button
                type="button"
                onClick={closeStructureModal}
                className="rounded-lg p-2 text-[var(--color-text)] hover:bg-[var(--color-background)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleStructureSubmit}
              className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                  Academic Session
                </label>

                <select
                  value={structureForm.academic_session}
                  onChange={(event) =>
                    setStructureForm((current) => ({
                      ...current,
                      academic_session: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-[var(--color-secondary)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="">Select Session</option>

                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {getSessionName(session)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                  Term
                </label>

                <select
                  value={structureForm.term}
                  onChange={(event) =>
                    setStructureForm((current) => ({
                      ...current,
                      term: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-[var(--color-secondary)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="">Select Term</option>

                  {terms.map((term) => (
                    <option key={term.id} value={term.id}>
                      {getTermName(term)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                  Class
                </label>

                <select
                  value={structureForm.class_level}
                  onChange={(event) =>
                    setStructureForm((current) => ({
                      ...current,
                      class_level: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-[var(--color-secondary)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="">Select Class</option>

                  {classLevels.map((classLevel) => (
                    <option
                      key={classLevel.id}
                      value={classLevel.id}
                    >
                      {getClassName(classLevel)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                  Fee Category
                </label>

                <select
                  value={structureForm.fee_category}
                  onChange={(event) =>
                    setStructureForm((current) => ({
                      ...current,
                      fee_category: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-[var(--color-secondary)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="">Select Category</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                  Amount
                </label>

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
                  className="w-full rounded-lg border border-[var(--color-secondary)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                  Due Date
                </label>

                <input
                  type="date"
                  value={structureForm.due_date}
                  onChange={(event) =>
                    setStructureForm((current) => ({
                      ...current,
                      due_date: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-[var(--color-secondary)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                  Description
                </label>

                <textarea
                  rows="3"
                  value={structureForm.description}
                  onChange={(event) =>
                    setStructureForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Optional description"
                  className="w-full resize-none rounded-lg border border-[var(--color-secondary)] bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                />
              </div>

              <label className="flex items-center gap-3 text-sm text-[var(--color-text)] md:col-span-2">
                <input
                  type="checkbox"
                  checked={structureForm.is_active}
                  onChange={(event) =>
                    setStructureForm((current) => ({
                      ...current,
                      is_active: event.target.checked,
                    }))
                  }
                  className="h-4 w-4"
                />
                Active
              </label>

              <div className="flex justify-end gap-3 pt-2 md:col-span-2">
                <button
                  type="button"
                  onClick={closeStructureModal}
                  disabled={saving}
                  className="rounded-lg border border-[var(--color-secondary)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-background)]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {saving && (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  )}

                  {editingStructure
                    ? "Update Structure"
                    : "Create Structure"}
                </button>
              </div>
            </form>
        </div>
      </div>
      )}
      
      {/* =====================================================
          VIEW DETAILS MODAL
      ===================================================== */}
      {viewModal.item && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-4 w-full max-w-lg overflow-hidden rounded-xl bg-[var(--color-card)] shadow-xl">
            <div className="flex items-center justify-between border-b border-[var(--color-secondary)] px-4 py-4 sm:px-5">
              <div className="min-w-0 pr-3">
                <h3 className="truncate text-lg font-semibold text-[var(--color-text)]">
                  {viewModal.type === "category"
                    ? "Fee Category"
                    : viewModal.type === "structure"
                      ? "Fee Structure"
                      : "Student Invoice"}
                </h3>
                <p className="mt-0.5 truncate text-xs text-[var(--color-text)] opacity-60">
                  {viewModal.type === "category"
                    ? viewModal.item?.name || "-"
                    : viewModal.type === "structure"
                      ? getStructureName(viewModal.item)
                      : getInvoiceName(viewModal.item)}
                </p>
              </div>
              <button type="button" onClick={closeViewModal} className="shrink-0 rounded-lg p-2 text-[var(--color-text)] hover:bg-[var(--color-background)]" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-4 sm:p-5">
              {viewModal.type === "category" && (
                <div className="space-y-3">
                  <div><p className="text-xs text-[var(--color-text)] opacity-60">Name</p><p className="mt-1 text-sm font-medium text-[var(--color-text)]">{viewModal.item?.name || "-"}</p></div>
                  <div><p className="text-xs text-[var(--color-text)] opacity-60">School</p><p className="mt-1 text-sm text-[var(--color-text)]">{viewModal.item?.school_name || schools.find((school) => String(school.id) === String(viewModal.item?.school))?.name || "-"}</p></div>
                  <div><p className="text-xs text-[var(--color-text)] opacity-60">Description</p><p className="mt-1 whitespace-pre-wrap text-sm text-[var(--color-text)]">{viewModal.item?.description || "-"}</p></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-xs text-[var(--color-text)] opacity-60">Mandatory</p><p className="mt-1 text-sm font-medium text-[var(--color-text)]">{viewModal.item?.is_mandatory ? "Yes" : "No"}</p></div>
                    <div><p className="text-xs text-[var(--color-text)] opacity-60">Status</p><p className="mt-1 text-sm font-medium text-[var(--color-text)]">{viewModal.item?.is_active ? "Active" : "Inactive"}</p></div>
                  </div>
                </div>
              )}

              {viewModal.type === "structure" && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div><p className="text-xs text-[var(--color-text)] opacity-60">Category</p><p className="mt-1 text-sm font-medium text-[var(--color-text)]">{getStructureName(viewModal.item)}</p></div>
                  <div><p className="text-xs text-[var(--color-text)] opacity-60">School</p><p className="mt-1 text-sm text-[var(--color-text)]">{viewModal.item?.school_name || schools.find((school) => String(school.id) === String(viewModal.item?.school))?.name || "-"}</p></div>
                  <div><p className="text-xs text-[var(--color-text)] opacity-60">Session</p><p className="mt-1 text-sm text-[var(--color-text)]">{viewModal.item?.academic_session_name || sessions.find((session) => String(session.id) === String(viewModal.item?.academic_session))?.name || "-"}</p></div>
                  <div><p className="text-xs text-[var(--color-text)] opacity-60">Term</p><p className="mt-1 text-sm text-[var(--color-text)]">{viewModal.item?.term_name || terms.find((term) => String(term.id) === String(viewModal.item?.term))?.name || "-"}</p></div>
                  <div><p className="text-xs text-[var(--color-text)] opacity-60">Class</p><p className="mt-1 text-sm text-[var(--color-text)]">{viewModal.item?.class_level_name || classLevels.find((item) => String(item.id) === String(viewModal.item?.class_level))?.name || "-"}</p></div>
                  <div><p className="text-xs text-[var(--color-text)] opacity-60">Amount</p><p className="mt-1 text-sm font-semibold text-[var(--color-text)]">{formatCurrency(viewModal.item?.amount)}</p></div>
                  <div><p className="text-xs text-[var(--color-text)] opacity-60">Due Date</p><p className="mt-1 text-sm text-[var(--color-text)]">{formatDate(viewModal.item?.due_date)}</p></div>
                  <div><p className="text-xs text-[var(--color-text)] opacity-60">Status</p><p className="mt-1 text-sm font-medium text-[var(--color-text)]">{viewModal.item?.is_active ? "Active" : "Inactive"}</p></div>
                  <div className="sm:col-span-2"><p className="text-xs text-[var(--color-text)] opacity-60">Description</p><p className="mt-1 whitespace-pre-wrap text-sm text-[var(--color-text)]">{viewModal.item?.description || "-"}</p></div>
                </div>
              )}

              {viewModal.type === "invoice" && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div><p className="text-xs text-[var(--color-text)] opacity-60">Student</p><p className="mt-1 text-sm font-medium text-[var(--color-text)]">{viewModal.item?.student_name || "-"}</p></div>
                  <div><p className="text-xs text-[var(--color-text)] opacity-60">Invoice</p><p className="mt-1 text-sm text-[var(--color-text)]">{viewModal.item?.invoice_number || "-"}</p></div>
                  <div><p className="text-xs text-[var(--color-text)] opacity-60">Category</p><p className="mt-1 text-sm text-[var(--color-text)]">{viewModal.item?.fee_category_name || "-"}</p></div>
                  <div><p className="text-xs text-[var(--color-text)] opacity-60">Status</p><p className="mt-1 text-sm font-medium text-[var(--color-text)]">{viewModal.item?.status || "UNPAID"}</p></div>
                  <div><p className="text-xs text-[var(--color-text)] opacity-60">Amount</p><p className="mt-1 text-sm font-semibold text-[var(--color-text)]">{formatCurrency(viewModal.item?.amount)}</p></div>
                  <div><p className="text-xs text-[var(--color-text)] opacity-60">Paid</p><p className="mt-1 text-sm text-[var(--color-text)]">{formatCurrency(viewModal.item?.amount_paid)}</p></div>
                  <div><p className="text-xs text-[var(--color-text)] opacity-60">Balance</p><p className="mt-1 text-sm font-semibold text-[var(--color-text)]">{formatCurrency(viewModal.item?.balance)}</p></div>
                  <div><p className="text-xs text-[var(--color-text)] opacity-60">Due Date</p><p className="mt-1 text-sm text-[var(--color-text)]">{formatDate(viewModal.item?.due_date)}</p></div>
                </div>
              )}
            </div>

            <div className="border-t border-[var(--color-secondary)] px-4 py-3 sm:px-5">
              <button type="button" onClick={closeViewModal} className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">Close</button>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default Fees;

