import { useEffect, useState } from "react";
import {
  Plus,
  RefreshCw,
  Pencil,
  X,
  CheckCircle2,
  XCircle,
  Tags,
} from "lucide-react";
import api from "../../services/api";

function AccountantExpenseCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getErrorMessage = (err) => {
    const data = err?.response?.data;

    if (!data) {
      return "Something went wrong. Please try again.";
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
        .map(([field, value]) => {
          if (Array.isArray(value)) {
            return `${field}: ${value.join(", ")}`;
          }

          return `${field}: ${value}`;
        })
        .join(" | ");

      if (messages) {
        return messages;
      }
    }

    return "Something went wrong. Please try again.";
  };

  const loadCategories = async (showRefresh = false) => {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get("/finance/expense-categories/");

      const data = response.data;

      if (Array.isArray(data)) {
        setCategories(data);
      } else if (Array.isArray(data?.results)) {
        setCategories(data.results);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("Failed to load expense categories:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      is_active: true,
    });

    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAdd = () => {
    setError("");
    setSuccess("");

    setForm({
      name: "",
      description: "",
      is_active: true,
    });

    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (category) => {
    setError("");
    setSuccess("");

    setForm({
      name: category.name || "",
      description: category.description || "",
      is_active:
        category.is_active === undefined
          ? true
          : category.is_active,
    });

    setEditingId(category.id);
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name = form.name.trim();

    if (!name) {
      setError("Category name is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name,
        description: form.description.trim(),
        is_active: form.is_active,
      };

      if (editingId) {
        await api.patch(
          `/finance/expense-categories/${editingId}/`,
          payload
        );

        setSuccess("Expense category updated successfully.");
      } else {
        await api.post(
          "/finance/expense-categories/",
          payload
        );

        setSuccess("Expense category created successfully.");
      }

      resetForm();
      await loadCategories();
    } catch (err) {
      console.error("Failed to save expense category:", err);
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (category) => {
    const action = category.is_active ? "deactivate" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await api.patch(
        `/finance/expense-categories/${category.id}/`,
        {
          is_active: !category.is_active,
        }
      );

      setSuccess(
        `Expense category ${action}d successfully.`
      );

      await loadCategories();
    } catch (err) {
      console.error(
        "Failed to update expense category status:",
        err
      );

      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <Tags size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Expense Categories
              </h1>

              <p className="text-sm text-slate-500">
                Manage categories used to record school expenses.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadCategories(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            <Plus size={18} />

            Add Category
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <XCircle size={19} className="mt-0.5 shrink-0" />

          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0"
          />

          <p>{success}</p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                {editingId
                  ? "Edit Expense Category"
                  : "Add Expense Category"}
              </h2>

              <p className="text-sm text-slate-500">
                Enter the category information below.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Category Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Utilities"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Optional description..."
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300"
              />

              <span className="text-sm font-medium text-slate-700">
                Active category
              </span>
            </label>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Category"
                    : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-800">
            All Expense Categories
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {categories.length}{" "}
            {categories.length === 1
              ? "category"
              : "categories"}
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[250px] items-center justify-center">
            <RefreshCw
              size={28}
              className="animate-spin text-[var(--color-primary)]"
            />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex min-h-[250px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Tags size={26} />
            </div>

            <h3 className="font-semibold text-slate-700">
              No expense categories
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Create your first expense category to get started.
            </p>

            <button
              type="button"
              onClick={handleAdd}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={17} />
              Add Category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Category
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Description
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">
                        {category.name}
                      </div>
                    </td>

                    <td className="max-w-md px-6 py-4 text-sm text-slate-600">
                      {category.description || "—"}
                    </td>

                    <td className="px-6 py-4">
                      {category.is_active ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                          <CheckCircle2 size={14} />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          <XCircle size={14} />
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(category)
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleToggleStatus(category)
                          }
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                            category.is_active
                              ? "border border-red-200 text-red-600 hover:bg-red-50"
                              : "border border-green-200 text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {category.is_active ? (
                            <>
                              <XCircle size={14} />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={14} />
                              Activate
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AccountantExpenseCategories;