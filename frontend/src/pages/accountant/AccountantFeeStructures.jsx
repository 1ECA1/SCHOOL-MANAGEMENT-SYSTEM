import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  ReceiptText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarDays,
  Layers3,
  Building2,
} from "lucide-react";
import api from "../../services/api";

function AccountantFeeStructures() {
  const [structures, setStructures] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingFormData, setLoadingFormData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);

  const [form, setForm] = useState({
    academic_session: "",
    term: "",
    class_level: "",
    fee_category: "",
    amount: "",
    due_date: "",
    description: "",
    is_active: true,
  });

  /* =========================================================
     HELPERS
  ========================================================= */

  const getListData = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    return [];
  };

  const formatCurrency = (amount) => {
    return `₦${Number(amount || 0).toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not set";
    }

    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const extractErrorMessage = (err, fallback) => {
    const data = err.response?.data;

    if (!data) {
      return fallback;
    }

    if (typeof data === "string") {
      return data;
    }

    if (data.detail) {
      return data.detail;
    }

    if (data.message) {
      return data.message;
    }

    if (typeof data === "object") {
      const messages = Object.entries(data)
        .flatMap(([field, value]) => {
          if (Array.isArray(value)) {
            return value.map((message) => {
              if (typeof message === "string") {
                return `${field}: ${message}`;
              }

              return `${field}: ${JSON.stringify(message)}`;
            });
          }

          if (
            value &&
            typeof value === "object"
          ) {
            return Object.values(value).flatMap(
              (nestedValue) => {
                if (Array.isArray(nestedValue)) {
                  return nestedValue.map(
                    (message) =>
                      `${field}: ${message}`
                  );
                }

                return `${field}: ${nestedValue}`;
              }
            );
          }

          return `${field}: ${value}`;
        })
        .filter(Boolean);

      if (messages.length > 0) {
        return messages.join(" ");
      }
    }

    return fallback;
  };

  /* =========================================================
     FETCH FEE STRUCTURES
  ========================================================= */

  const fetchStructures = async (showRefresh = false) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get(
        "/finance/fee-structures/"
      );

      setStructures(
        getListData(response.data)
      );
    } catch (err) {
      console.error(
        "Failed to load fee structures:",
        err
      );

      setError(
        extractErrorMessage(
          err,
          "Unable to load fee structures."
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =========================================================
     FETCH FORM DATA
  ========================================================= */

  const fetchFormData = async () => {
    try {
      setLoadingFormData(true);
      setError("");

      const [
        categoriesResponse,
        sessionsResponse,
        termsResponse,
        classLevelsResponse,
      ] = await Promise.all([
        api.get(
          "/finance/fee-categories/"
        ),
        api.get(
          "/academics/sessions/"
        ),
        api.get(
          "/academics/terms/"
        ),
        api.get(
          "/academics/class-levels/"
        ),
      ]);

      /*
       * The Accountant endpoint already returns only
       * categories belonging to the Accountant's school.
       */
      setCategories(
        getListData(
          categoriesResponse.data
        )
      );

      setSessions(
        getListData(
          sessionsResponse.data
        )
      );

      setTerms(
        getListData(
          termsResponse.data
        )
      );

      setClassLevels(
        getListData(
          classLevelsResponse.data
        )
      );
    } catch (err) {
      console.error(
        "Failed to load fee structure form data:",
        err
      );

      setError(
        extractErrorMessage(
          err,
          "Unable to load the data required for fee structures."
        )
      );
    } finally {
      setLoadingFormData(false);
    }
  };

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    fetchStructures();
    fetchFormData();
  }, []);

  /* =========================================================
     CREATE MODAL
  ========================================================= */

  const openCreateModal = () => {
    setEditingStructure(null);

    setForm({
      academic_session: "",
      term: "",
      class_level: "",
      fee_category: "",
      amount: "",
      due_date: "",
      description: "",
      is_active: true,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  /* =========================================================
     EDIT MODAL
  ========================================================= */

  const openEditModal = (structure) => {
    setEditingStructure(structure);

    setForm({
      academic_session:
        structure.academic_session ?? "",
      term: structure.term ?? "",
      class_level:
        structure.class_level ?? "",
      fee_category:
        structure.fee_category ?? "",
      amount: structure.amount ?? "",
      due_date:
        structure.due_date ?? "",
      description:
        structure.description ?? "",
      is_active:
        structure.is_active === undefined
          ? true
          : structure.is_active,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingStructure(null);
  };

  /* =========================================================
     FORM HANDLING
  ========================================================= */

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /* =========================================================
     CREATE / UPDATE
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.academic_session) {
      setError(
        "Please select an academic session."
      );
      return;
    }

    if (!form.term) {
      setError(
        "Please select a term."
      );
      return;
    }

    if (!form.class_level) {
      setError(
        "Please select a class level."
      );
      return;
    }

    if (!form.fee_category) {
      setError(
        "Please select a fee category."
      );
      return;
    }

    if (
      !form.amount ||
      Number(form.amount) <= 0
    ) {
      setError(
        "Please enter a valid fee amount."
      );
      return;
    }

    try {
      setSaving(true);

      /*
       * IMPORTANT:
       * Do NOT send school here.
       *
       * The backend determines the school from
       * the logged-in Accountant's profile.
       */
      const payload = {
        academic_session: Number(
          form.academic_session
        ),
        term: Number(form.term),
        class_level: Number(
          form.class_level
        ),
        fee_category: Number(
          form.fee_category
        ),
        amount: form.amount,
        due_date:
          form.due_date || null,
        description:
          form.description.trim(),
        is_active:
          form.is_active,
      };

      if (editingStructure) {
        await api.put(
          `/finance/fee-structures/${editingStructure.id}/`,
          payload
        );

        setSuccess(
          "Fee structure updated successfully."
        );
      } else {
        await api.post(
          "/finance/fee-structures/",
          payload
        );

        setSuccess(
          "Fee structure created successfully."
        );
      }

      setShowModal(false);
      setEditingStructure(null);

      await fetchStructures();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Failed to save fee structure:",
        err
      );

      setError(
        extractErrorMessage(
          err,
          "Unable to save fee structure."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async (structure) => {
    const categoryName =
      structure.fee_category_name ||
      structure.fee_category ||
      "this fee structure";

    const confirmed = window.confirm(
      `Are you sure you want to delete "${categoryName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/finance/fee-structures/${structure.id}/`
      );

      setSuccess(
        "Fee structure deleted successfully."
      );

      await fetchStructures();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Failed to delete fee structure:",
        err
      );

      setError(
        extractErrorMessage(
          err,
          "Unable to delete this fee structure."
        )
      );
    }
  };

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredStructures = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return structures;
    }

    return structures.filter(
      (structure) => {
        return (
          structure.school_name
            ?.toLowerCase()
            .includes(query) ||
          structure.academic_session_name
            ?.toLowerCase()
            .includes(query) ||
          structure.term_name
            ?.toLowerCase()
            .includes(query) ||
          structure.class_level_name
            ?.toLowerCase()
            .includes(query) ||
          structure.fee_category_name
            ?.toLowerCase()
            .includes(query) ||
          structure.description
            ?.toLowerCase()
            .includes(query) ||
          String(
            structure.amount || ""
          ).includes(query)
        );
      }
    );
  }, [structures, search]);

  /* =========================================================
     SUMMARY
  ========================================================= */

  const activeCount = structures.filter(
    (structure) =>
      structure.is_active === true
  ).length;

  const inactiveCount = structures.filter(
    (structure) =>
      structure.is_active === false
  ).length;

  const totalAmount = structures.reduce(
    (total, structure) =>
      total +
      Number(
        structure.amount || 0
      ),
    0
  );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white shadow-sm">
              <ReceiptText size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Fee Structures
              </h1>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Configure fee amounts for your
                school by session, term, class,
                and category.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              fetchStructures(true);
              fetchFormData();
            }}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-[var(--color-card)] px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
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
            disabled={loadingFormData}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={18} />
            Add Fee Structure
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0"
          />

          <div className="flex-1 text-sm font-medium">
            {error}
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-lg p-1 hover:bg-red-100 dark:hover:bg-red-900/40"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* SUCCESS */}
      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
          <CheckCircle2
            size={20}
            className="mt-0.5 shrink-0"
          />

          <div className="text-sm font-medium">
            {success}
          </div>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={
            <ReceiptText size={22} />
          }
          title="Total Structures"
          value={structures.length}
        />

        <SummaryCard
          icon={
            <CheckCircle2 size={22} />
          }
          title="Active"
          value={activeCount}
        />

        <SummaryCard
          icon={<XCircle size={22} />}
          title="Inactive"
          value={inactiveCount}
        />

        <SummaryCard
          icon={<Layers3 size={22} />}
          title="Configured Value"
          value={formatCurrency(
            totalAmount
          )}
        />
      </div>

      {/* MAIN CARD */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-700">
        {/* TOOLBAR */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between dark:border-slate-700">
          <div>
            <h2 className="text-lg font-bold">
              All Fee Structures
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage the fee amounts assigned
              to your school's classes and
              terms.
            </p>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search fee structures..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center p-8">
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <RefreshCw
                size={20}
                className="animate-spin"
              />

              <span>
                Loading fee structures...
              </span>
            </div>
          </div>
        ) : filteredStructures.length ===
          0 ? (
          /* EMPTY */
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <ReceiptText size={28} />
            </div>

            <h3 className="text-lg font-bold">
              {search
                ? "No fee structures found"
                : "No fee structures yet"}
            </h3>

            <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              {search
                ? "Try a different search term."
                : "Create your first fee structure to assign fees to a class and term."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={
                  openCreateModal
                }
                disabled={
                  loadingFormData
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                <Plus size={18} />
                Add Fee Structure
              </button>
            )}
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1100px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
                    <th className="px-6 py-4 font-semibold">
                      Fee Category
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Class
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Session / Term
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Amount
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Due Date
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStructures.map(
                    (structure) => (
                      <tr
                        key={
                          structure.id
                        }
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-900/50"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[var(--color-primary)] dark:bg-blue-950/40">
                              <ReceiptText
                                size={18}
                              />
                            </div>

                            <div>
                              <p className="font-semibold">
                                {structure.fee_category_name ||
                                  "Unknown Category"}
                              </p>

                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                ID #
                                {
                                  structure.id
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-medium">
                            {structure.class_level_name ||
                              "Unknown Class"}
                          </p>

                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {structure.school_name ||
                              "Unknown School"}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="font-medium">
                            {structure.academic_session_name ||
                              "Unknown Session"}
                          </p>

                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {structure.term_name ||
                              "Unknown Term"}
                          </p>
                        </td>

                        <td className="px-6 py-5 font-bold text-[var(--color-primary)]">
                          {formatCurrency(
                            structure.amount
                          )}
                        </td>

                        <td className="px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                          {formatDate(
                            structure.due_date
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <StatusBadge
                            active={
                              structure.is_active
                            }
                          />
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  structure
                                )
                              }
                              className="rounded-xl p-2.5 text-slate-500 transition hover:bg-blue-50 hover:text-[var(--color-primary)] dark:hover:bg-blue-950/40"
                              title="Edit"
                            >
                              <Pencil
                                size={17}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  structure
                                )
                              }
                              className="rounded-xl p-2.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                              title="Delete"
                            >
                              <Trash2
                                size={17}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="space-y-4 p-4 md:hidden">
              {filteredStructures.map(
                (structure) => (
                  <div
                    key={
                      structure.id
                    }
                    className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[var(--color-primary)] dark:bg-blue-950/40">
                          <ReceiptText
                            size={19}
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-semibold">
                            {structure.fee_category_name ||
                              "Unknown Category"}
                          </h3>

                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {structure.class_level_name ||
                              "Unknown Class"}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">
                            {structure.school_name ||
                              "Unknown School"}
                          </p>
                        </div>
                      </div>

                      <StatusBadge
                        active={
                          structure.is_active
                        }
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <InfoBox
                        label="Amount"
                        value={formatCurrency(
                          structure.amount
                        )}
                      />

                      <InfoBox
                        label="Term"
                        value={
                          structure.term_name ||
                          "—"
                        }
                      />

                      <InfoBox
                        label="Session"
                        value={
                          structure.academic_session_name ||
                          "—"
                        }
                      />

                      <InfoBox
                        label="Due Date"
                        value={formatDate(
                          structure.due_date
                        )}
                      />
                    </div>

                    <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(
                            structure
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            structure
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="my-8 w-full max-w-2xl overflow-hidden rounded-3xl bg-[var(--color-card)] shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">
              <div>
                <h2 className="text-xl font-bold">
                  {editingStructure
                    ? "Edit Fee Structure"
                    : "Add Fee Structure"}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Configure a fee amount for a
                  specific class, session, and
                  term.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-5 p-6">
                {loadingFormData ? (
                  <div className="flex items-center justify-center py-12 text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-3">
                      <RefreshCw
                        size={20}
                        className="animate-spin"
                      />

                      Loading form data...
                    </div>
                  </div>
                ) : (
                  <>
                    {/* ASSIGNED SCHOOL */}
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[var(--color-primary)] dark:bg-blue-950/60">
                          <Building2 size={19} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold">
                            Assigned School
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                            This fee structure will
                            automatically belong to
                            your assigned school. You
                            do not need to select a
                            school.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* SESSION / TERM / CLASS / CATEGORY */}
                    <div className="grid gap-5 md:grid-cols-2">
                      <SelectField
                        label="Academic Session"
                        name="academic_session"
                        value={
                          form.academic_session
                        }
                        onChange={handleChange}
                        options={sessions}
                        labelKey="name"
                      />

                      <SelectField
                        label="Term"
                        name="term"
                        value={form.term}
                        onChange={handleChange}
                        options={terms}
                        labelKey="name"
                      />

                      <SelectField
                        label="Class Level"
                        name="class_level"
                        value={
                          form.class_level
                        }
                        onChange={handleChange}
                        options={classLevels}
                        labelKey="name"
                      />

                      <SelectField
                        label="Fee Category"
                        name="fee_category"
                        value={
                          form.fee_category
                        }
                        onChange={handleChange}
                        options={categories}
                        labelKey="name"
                      />

                      {/* AMOUNT */}
                      <div>
                        <label className="mb-2 block text-sm font-semibold">
                          Amount
                        </label>

                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-500">
                            ₦
                          </span>

                          <input
                            type="number"
                            name="amount"
                            value={
                              form.amount
                            }
                            onChange={
                              handleChange
                            }
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-slate-700 dark:bg-slate-900"
                            required
                          />
                        </div>
                      </div>

                      {/* DUE DATE */}
                      <div>
                        <label className="mb-2 block text-sm font-semibold">
                          Due Date
                        </label>

                        <div className="relative">
                          <CalendarDays
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <input
                            type="date"
                            name="due_date"
                            value={
                              form.due_date
                            }
                            onChange={
                              handleChange
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-slate-700 dark:bg-slate-900"
                          />
                        </div>
                      </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold">
                        Description
                      </label>

                      <textarea
                        name="description"
                        value={
                          form.description
                        }
                        onChange={
                          handleChange
                        }
                        rows={3}
                        placeholder="Optional description..."
                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-slate-700 dark:bg-slate-900"
                      />
                    </div>

                    {/* ACTIVE */}
                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={
                          form.is_active
                        }
                        onChange={
                          handleChange
                        }
                        className="h-4 w-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                      />

                      <div>
                        <p className="text-sm font-semibold">
                          Active Fee Structure
                        </p>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Allow this fee structure
                          to be used for billing.
                        </p>
                      </div>
                    </label>
                  </>
                )}
              </div>

              {/* MODAL FOOTER */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end dark:border-slate-700 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-[var(--color-card)] px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    loadingFormData
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <RefreshCw
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : editingStructure
                    ? "Update Fee Structure"
                    : "Create Fee Structure"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon,
  title,
  value,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-slate-700">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[var(--color-primary)] dark:bg-blue-950/40">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-1 truncate text-2xl font-bold">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SELECT FIELD
========================================================= */

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  labelKey = "name",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-slate-700 dark:bg-slate-900"
      >
        <option value="">
          Select {label}
        </option>

        {options.map((option) => (
          <option
            key={option.id}
            value={option.id}
          >
            {option[labelKey] ||
              option.name ||
              option.title ||
              option.label ||
              `#${option.id}`}
          </option>
        ))}
      </select>
    </div>
  );
}

/* =========================================================
   MOBILE INFO BOX
========================================================= */

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-semibold">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
      <CheckCircle2 size={14} />
      Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      <XCircle size={14} />
      Inactive
    </span>
  );
}

export default AccountantFeeStructures;