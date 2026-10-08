import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  Tags,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";

function AccountantFeeCategories() {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    is_mandatory: false,
    is_active: true,
  });

  // =========================
  // Helpers
  // =========================

  const getListData = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    return [];
  };

  // =========================
  // Fetch Fee Categories
  // =========================

  const fetchCategories = async (showRefresh = false) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get("/finance/fee-categories/");

      setCategories(getListData(response.data));
    } catch (err) {
      console.error("Failed to load fee categories:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to load fee categories."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // =========================
  // Create Modal
  // =========================

  const openCreateModal = () => {
    setEditingCategory(null);

    setForm({
      name: "",
      description: "",
      is_mandatory: false,
      is_active: true,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // =========================
  // Edit Modal
  // =========================

  const openEditModal = (category) => {
    setEditingCategory(category);

    setForm({
      name: category.name || "",
      description: category.description || "",
      is_mandatory:
        category.is_mandatory === undefined
          ? false
          : category.is_mandatory,
      is_active:
        category.is_active === undefined
          ? true
          : category.is_active,
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // =========================
  // Close Modal
  // =========================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingCategory(null);
  };

  // =========================
  // Handle Form Change
  // =========================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================
  // Submit
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Fee category name is required.");
      return;
    }

    try {
      setSaving(true);

      /*
       * IMPORTANT:
       * School is intentionally NOT included here.
       *
       * The backend automatically assigns the category
       * to the logged-in Accountant's school using:
       *
       * request.user.accountant_profile.school
       */
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        is_mandatory: form.is_mandatory,
        is_active: form.is_active,
      };

      console.log("Fee category payload:", payload);

      if (editingCategory) {
        await api.put(
          `/finance/fee-categories/${editingCategory.id}/`,
          payload
        );

        setSuccess("Fee category updated successfully.");
      } else {
        await api.post(
          "/finance/fee-categories/",
          payload
        );

        setSuccess("Fee category created successfully.");
      }

      setShowModal(false);
      setEditingCategory(null);

      await fetchCategories();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Failed to save fee category:", err);

      const responseData = err.response?.data;

      if (responseData && typeof responseData === "object") {
        const messages = Object.entries(responseData)
          .map(([field, value]) => {
            if (Array.isArray(value)) {
              return `${field}: ${value.join(", ")}`;
            }

            if (
              value &&
              typeof value === "object"
            ) {
              return `${field}: ${JSON.stringify(value)}`;
            }

            return `${field}: ${value}`;
          })
          .join(" | ");

        setError(
          messages ||
            responseData.detail ||
            responseData.message ||
            "Unable to save fee category."
        );
      } else {
        setError("Unable to save fee category.");
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // Delete
  // =========================

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(
        `/finance/fee-categories/${category.id}/`
      );

      setSuccess("Fee category deleted successfully.");

      await fetchCategories();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Failed to delete fee category:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to delete this fee category. It may already be in use."
      );
    }
  };

  // =========================
  // Search
  // =========================

  const filteredCategories = categories.filter((category) => {
    const searchText = search.toLowerCase().trim();

    if (!searchText) return true;

    return (
      category.name?.toLowerCase().includes(searchText) ||
      category.description?.toLowerCase().includes(searchText) ||
      category.school_name?.toLowerCase().includes(searchText)
    );
  });

  // =========================
  // Summary
  // =========================

  const activeCount = categories.filter(
    (category) => category.is_active === true
  ).length;

  const inactiveCount = categories.filter(
    (category) => category.is_active === false
  ).length;

  const mandatoryCount = categories.filter(
    (category) => category.is_mandatory === true
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white shadow-sm">
              <Tags size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Fee Categories
              </h1>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage the categories used for student fees and charges.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => fetchCategories(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-[var(--color-card)] px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            <Plus size={18} />
            Add Fee Category
          </button>
        </div>
      </div>

      {/* Alerts */}
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

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={<Tags size={22} />}
          title="Total Categories"
          value={categories.length}
        />

        <SummaryCard
          icon={<CheckCircle2 size={22} />}
          title="Active"
          value={activeCount}
        />

        <SummaryCard
          icon={<XCircle size={22} />}
          title="Inactive"
          value={inactiveCount}
        />

        <SummaryCard
          icon={<AlertCircle size={22} />}
          title="Mandatory"
          value={mandatoryCount}
        />
      </div>

      {/* Main Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-700">
        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between dark:border-slate-700">
          <div>
            <h2 className="text-lg font-bold">
              All Fee Categories
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Create and maintain the fee categories used by
              the finance module.
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center p-8">
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <RefreshCw
                size={20}
                className="animate-spin"
              />
              <span>Loading fee categories...</span>
            </div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <Tags size={28} />
            </div>

            <h3 className="text-lg font-bold">
              {search
                ? "No categories found"
                : "No fee categories yet"}
            </h3>

            <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              {search
                ? "Try a different search term."
                : "Create your first fee category to start organizing student charges."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <Plus size={18} />
                Add Fee Category
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
                    <th className="px-6 py-4 font-semibold">
                      Category
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      School
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Description
                    </th>

                    <th className="px-6 py-4 font-semibold">
                      Type
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
                  {filteredCategories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-900/50"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[var(--color-primary)] dark:bg-blue-950/40">
                            <Tags size={18} />
                          </div>

                          <div>
                            <p className="font-semibold">
                              {category.name}
                            </p>

                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              ID #{category.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm font-medium">
                        {category.school_name ||
                          `School #${category.school}`}
                      </td>

                      <td className="max-w-xs px-6 py-5 text-sm text-slate-600 dark:text-slate-300">
                        {category.description ||
                          "No description"}
                      </td>

                      <td className="px-6 py-5">
                        {category.is_mandatory ? (
                          <span className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                            Mandatory
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            Optional
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <StatusBadge
                          active={category.is_active}
                        />
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(category)
                            }
                            className="rounded-xl p-2.5 text-slate-500 transition hover:bg-blue-50 hover:text-[var(--color-primary)] dark:hover:bg-blue-950/40"
                            title="Edit"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(category)
                            }
                            className="rounded-xl p-2.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                            title="Delete"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="space-y-4 p-4 md:hidden">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[var(--color-primary)] dark:bg-blue-950/40">
                        <Tags size={19} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">
                          {category.name}
                        </h3>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {category.school_name ||
                            `School #${category.school}`}
                        </p>
                      </div>
                    </div>

                    <StatusBadge
                      active={category.is_active}
                    />
                  </div>

                  <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                    {category.description ||
                      "No description"}
                  </p>

                  <div className="mt-3">
                    {category.is_mandatory ? (
                      <span className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        Mandatory
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        Optional
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() =>
                        openEditModal(category)
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(category)
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-[var(--color-card)] shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">
              <div>
                <h2 className="text-xl font-bold">
                  {editingCategory
                    ? "Edit Fee Category"
                    : "Add Fee Category"}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {editingCategory
                    ? "Update the fee category information."
                    : "Create a new category for student fees."}
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

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-5 p-6">
                {/* School Information */}
                <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                    School assignment
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700 dark:text-blue-400">
                    This fee category will automatically belong
                    to your assigned school. You do not need to
                    select a school.
                  </p>
                </div>

                {/* Category Name */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Category Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Tuition Fee"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-slate-700 dark:bg-slate-900"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe this fee category..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>

                {/* Mandatory */}
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                  <input
                    type="checkbox"
                    name="is_mandatory"
                    checked={form.is_mandatory}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />

                  <div>
                    <p className="text-sm font-semibold">
                      Mandatory Fee
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Mark this category as required for students.
                    </p>
                  </div>
                </label>

                {/* Active */}
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                  />

                  <div>
                    <p className="text-sm font-semibold">
                      Active Category
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Allow this category to be used for new
                      fee records.
                    </p>
                  </div>
                </label>
              </div>

              {/* Footer */}
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
                  disabled={saving}
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
                    : editingCategory
                    ? "Update Category"
                    : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================
// Summary Card
// =========================

function SummaryCard({ icon, title, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-slate-700">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[var(--color-primary)] dark:bg-blue-950/40">
          {icon}
        </div>

        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-1 text-2xl font-bold">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

// =========================
// Status Badge
// =========================

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

export default AccountantFeeCategories;