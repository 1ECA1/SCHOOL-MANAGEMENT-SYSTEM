import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Edit,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";

import api from "../../../services/api";

const EMPTY_FORM = {
  name: "",
  minimum_score: "",
  maximum_score: "",
  grade: "",
  remark: "",
  grade_point: "",
  is_active: true,
};

const GradingSettings = () => {
  const [gradeScales, setGradeScales] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchGradeScales = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/results/grade-scales/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setGradeScales(data);
    } catch (err) {
      console.error("Failed to load grading scales:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load grading scales. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGradeScales();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
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

  const openAddForm = () => {
    setSuccess("");
    setError("");
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (scale) => {
    setSuccess("");
    setError("");

    setEditingId(scale.id);

    setForm({
      name: scale.name || "",
      minimum_score: scale.minimum_score ?? "",
      maximum_score: scale.maximum_score ?? "",
      grade: scale.grade || "",
      remark: scale.remark || "",
      grade_point: scale.grade_point ?? "",
      is_active: Boolean(scale.is_active),
    });

    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const minimum = Number(form.minimum_score);
    const maximum = Number(form.maximum_score);
    const gradePoint = Number(form.grade_point);

    if (!form.name.trim()) {
      setError("Please enter a grading scale name.");
      return;
    }

    if (form.minimum_score === "" || Number.isNaN(minimum)) {
      setError("Please enter a valid minimum score.");
      return;
    }

    if (form.maximum_score === "" || Number.isNaN(maximum)) {
      setError("Please enter a valid maximum score.");
      return;
    }

    if (minimum < 0) {
      setError("Minimum score cannot be negative.");
      return;
    }

    if (maximum < minimum) {
      setError("Maximum score cannot be less than minimum score.");
      return;
    }

    if (!form.grade.trim()) {
      setError("Please enter a grade.");
      return;
    }

    if (!form.remark.trim()) {
      setError("Please enter a remark.");
      return;
    }

    if (form.grade_point === "" || Number.isNaN(gradePoint)) {
      setError("Please enter a valid grade point.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        minimum_score: minimum,
        maximum_score: maximum,
        grade: form.grade.trim(),
        remark: form.remark.trim(),
        grade_point: gradePoint,
        is_active: Boolean(form.is_active),
      };

      if (editingId) {
        await api.patch(
          `/results/grade-scales/${editingId}/`,
          payload,
        );

        setSuccess("Grading scale updated successfully.");
      } else {
        await api.post("/results/grade-scales/", payload);

        setSuccess("Grading scale added successfully.");
      }

      resetForm();
      await fetchGradeScales();
    } catch (err) {
      console.error("Failed to save grading scale:", err);

      const responseData = err.response?.data;

      if (typeof responseData === "object" && responseData !== null) {
        const messages = Object.entries(responseData)
          .map(([field, value]) => {
            const message = Array.isArray(value)
              ? value.join(" ")
              : String(value);

            return `${field}: ${message}`;
          })
          .join(" ");

        setError(
          messages ||
            "Failed to save grading scale. Please check the form.",
        );
      } else {
        setError(
          "Failed to save grading scale. Please check the form and try again.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (scale) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the "${scale.grade}" grading scale?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(scale.id);
      setError("");
      setSuccess("");

      await api.delete(`/results/grade-scales/${scale.id}/`);

      setSuccess("Grading scale deleted successfully.");

      await fetchGradeScales();
    } catch (err) {
      console.error("Failed to delete grading scale:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to delete grading scale. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (scale) => {
    try {
      setError("");
      setSuccess("");

      await api.patch(`/results/grade-scales/${scale.id}/`, {
        is_active: !scale.is_active,
      });

      setSuccess(
        scale.is_active
          ? `${scale.grade} grading scale has been deactivated.`
          : `${scale.grade} grading scale has been activated.`,
      );

      await fetchGradeScales();
    } catch (err) {
      console.error("Failed to update grading scale:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to update grading scale status.",
      );
    }
  };

  return (
    <div className="min-h-full bg-[var(--color-background)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              Grading Settings
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Configure the grading scales used when student results are
              calculated.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={fetchGradeScales}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <Plus size={18} />
              Add Grade Scale
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />

            <div className="flex-1">
              {error}
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 text-red-500 hover:text-red-700"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />

            <div className="flex-1">
              {success}
            </div>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="shrink-0 text-green-500 hover:text-green-700"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  {editingId
                    ? "Edit Grading Scale"
                    : "Add Grading Scale"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Define the score range, grade, remark, and grade point.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {/* Name */}
                <div className="lg:col-span-3">
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    Scale Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Standard Grade Scale"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>

                {/* Minimum */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    Minimum Score
                  </label>

                  <input
                    type="number"
                    name="minimum_score"
                    min="0"
                    step="0.01"
                    value={form.minimum_score}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>

                {/* Maximum */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    Maximum Score
                  </label>

                  <input
                    type="number"
                    name="maximum_score"
                    min="0"
                    step="0.01"
                    value={form.maximum_score}
                    onChange={handleChange}
                    placeholder="100"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>

                {/* Grade */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    Grade
                  </label>

                  <input
                    type="text"
                    name="grade"
                    value={form.grade}
                    onChange={handleChange}
                    placeholder="A"
                    maxLength={5}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm uppercase outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>

                {/* Remark */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    Remark
                  </label>

                  <input
                    type="text"
                    name="remark"
                    value={form.remark}
                    onChange={handleChange}
                    placeholder="Excellent"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>

                {/* Grade Point */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    Grade Point
                  </label>

                  <input
                    type="number"
                    name="grade_point"
                    min="0"
                    step="0.01"
                    value={form.grade_point}
                    onChange={handleChange}
                    placeholder="5.00"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>

                {/* Active */}
                <div className="flex items-center md:col-span-2 lg:col-span-2">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={form.is_active}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />

                    <span>
                      <span className="block text-sm font-medium text-[var(--color-text)]">
                        Active grading scale
                      </span>

                      <span className="block text-xs text-gray-500">
                        Active scales are used when calculating grades.
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}

                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Grade Scale"
                      : "Save Grade Scale"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Grade Scale Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-[var(--color-card)] shadow-sm">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Grade Scales
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              These ranges determine the grade and remark assigned to
              student results.
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Loader2
                  size={22}
                  className="animate-spin text-[var(--color-primary)]"
                />
                Loading grading scales...
              </div>
            </div>
          ) : gradeScales.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-5 text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-4">
                <AlertCircle size={28} className="text-gray-400" />
              </div>

              <h3 className="text-base font-semibold text-[var(--color-text)]">
                No grading scales found
              </h3>

              <p className="mt-1 max-w-md text-sm text-gray-500">
                Add your first grading scale to start configuring how
                student scores are converted into grades.
              </p>

              <button
                type="button"
                onClick={openAddForm}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                <Plus size={17} />
                Add Grade Scale
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Scale
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Score Range
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Grade
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Remark
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Grade Point
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 bg-white">
                  {gradeScales.map((scale) => (
                    <tr
                      key={scale.id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="font-medium text-[var(--color-text)]">
                          {scale.name}
                        </div>

                        <div className="mt-0.5 text-xs text-gray-400">
                          ID #{scale.id}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                        {scale.minimum_score} - {scale.maximum_score}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="inline-flex min-w-10 items-center justify-center rounded-md bg-[var(--color-primary)]/10 px-2.5 py-1 text-sm font-bold text-[var(--color-primary)]">
                          {scale.grade}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                        {scale.remark}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-gray-700">
                        {scale.grade_point}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleActive(scale)
                          }
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition ${
                            scale.is_active
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {scale.is_active
                            ? "Active"
                            : "Inactive"}
                        </button>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(scale)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                          >
                            <Edit size={15} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(scale)}
                            disabled={deletingId === scale.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === scale.id ? (
                              <Loader2
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={15} />
                            )}

                            Delete
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

        {/* Information */}
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-blue-600"
            />

            <div>
              <h3 className="text-sm font-semibold text-blue-900">
                How grading works
              </h3>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                When a student result is saved, the system calculates
                the total score from CA and examination scores. It then
                checks the active grading scales and assigns the matching
                grade, remark, and grade point automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradingSettings;