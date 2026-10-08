import { useEffect, useMemo, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

function ExamOfficerGradeScales() {
  const [gradeScales, setGradeScales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingScale, setEditingScale] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    minimum_score: "",
    maximum_score: "",
    grade: "",
    remark: "",
    grade_point: "",
    is_active: true,
  });

  const token = sessionStorage.getItem("access_token");

  // ============================================================
  // FETCH GRADE SCALES
  // ============================================================

  const fetchGradeScales = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/results/grade-scales/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load grade scales.");
      }

      const data = await response.json();

      setGradeScales(
        Array.isArray(data)
          ? data
          : Array.isArray(data.results)
          ? data.results
          : []
      );
    } catch (error) {
      console.error("Error loading grade scales:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGradeScales();
  }, []);

  // ============================================================
  // FORM HANDLING
  // ============================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openCreateModal = () => {
    setEditingScale(null);

    setFormData({
      name: "",
      minimum_score: "",
      maximum_score: "",
      grade: "",
      remark: "",
      grade_point: "",
      is_active: true,
    });

    setShowModal(true);
  };

  const openEditModal = (scale) => {
    setEditingScale(scale);

    setFormData({
      name: scale.name ?? "",
      minimum_score: scale.minimum_score ?? "",
      maximum_score: scale.maximum_score ?? "",
      grade: scale.grade ?? "",
      remark: scale.remark ?? "",
      grade_point: scale.grade_point ?? "",
      is_active: scale.is_active ?? true,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingScale(null);
  };

  // ============================================================
  // CREATE / UPDATE
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter a grade scale name.");
      return;
    }

    if (formData.minimum_score === "") {
      alert("Please enter the minimum score.");
      return;
    }

    if (formData.maximum_score === "") {
      alert("Please enter the maximum score.");
      return;
    }

    if (!formData.grade.trim()) {
      alert("Please enter the grade.");
      return;
    }

    const minimumScore = Number(formData.minimum_score);
    const maximumScore = Number(formData.maximum_score);

    if (minimumScore < 0) {
      alert("Minimum score cannot be negative.");
      return;
    }

    if (maximumScore < minimumScore) {
      alert("Maximum score cannot be less than minimum score.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: formData.name.trim(),
        minimum_score: minimumScore,
        maximum_score: maximumScore,
        grade: formData.grade.trim(),
        remark: formData.remark.trim(),
        grade_point:
          formData.grade_point === ""
            ? null
            : Number(formData.grade_point),
        is_active: formData.is_active,
      };

      const url = editingScale
        ? `${API_BASE_URL}/api/results/grade-scales/${editingScale.id}/`
        : `${API_BASE_URL}/api/results/grade-scales/`;

      const method = editingScale ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Grade scale error:", data);

        const message =
          data.detail ||
          data.maximum_score?.[0] ||
          data.minimum_score?.[0] ||
          data.name?.[0] ||
          data.grade?.[0] ||
          data.grade_point?.[0] ||
          "Unable to save grade scale.";

        throw new Error(message);
      }

      setShowModal(false);
      setEditingScale(null);

      await fetchGradeScales();
    } catch (error) {
      console.error("Error saving grade scale:", error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this grade scale?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/results/grade-scales/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          data.detail || "Unable to delete grade scale."
        );
      }

      await fetchGradeScales();
    } catch (error) {
      console.error("Error deleting grade scale:", error);
      alert(error.message);
    }
  };

  // ============================================================
  // FILTER
  // ============================================================

  const filteredScales = useMemo(() => {
    return gradeScales.filter((scale) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        scale.name?.toLowerCase().includes(searchText) ||
        scale.grade?.toLowerCase().includes(searchText) ||
        scale.remark?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && scale.is_active) ||
        (statusFilter === "inactive" && !scale.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [gradeScales, search, statusFilter]);

  // ============================================================
  // STATS
  // ============================================================

  const totalScales = gradeScales.length;

  const activeScales = gradeScales.filter(
    (scale) => scale.is_active
  ).length;

  const inactiveScales = gradeScales.filter(
    (scale) => !scale.is_active
  ).length;

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 md:p-6 text-[var(--color-text)]">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            Grade Scales
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage grading ranges, grades, remarks and grade points.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="rounded-2xl bg-[var(--color-primary)] px-5 py-3 font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          + Add Grade Scale
        </button>
      </div>

      {/* ========================================================
          STAT CARDS
      ======================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-[var(--color-card)]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl dark:bg-blue-900/30">
              📊
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Total Scales
              </p>

              <p className="text-2xl font-bold">
                {totalScales}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-[var(--color-card)]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-2xl dark:bg-green-900/30">
              ✓
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Active
              </p>

              <p className="text-2xl font-bold">
                {activeScales}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-[var(--color-card)]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl dark:bg-slate-800">
              ○
            </div>

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Inactive
              </p>

              <p className="text-2xl font-bold">
                {inactiveScales}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================
          SEARCH + FILTER
      ======================================================== */}

      <div className="mb-6 rounded-3xl bg-white p-4 shadow-sm dark:bg-[var(--color-card)]">

        <div className="flex flex-col gap-3 md:flex-row">

          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, grade or remark..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[var(--color-primary)] dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

        </div>
      </div>

      {/* ========================================================
          TABLE
      ======================================================== */}

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm dark:bg-[var(--color-card)]">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px]">

            <thead className="bg-slate-50 dark:bg-slate-800/60">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Name
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Score Range
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Grade
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Remark
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Grade Point
                </th>

                <th className="px-5 py-4 text-left text-sm font-semibold">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    Loading grade scales...
                  </td>
                </tr>
              ) : filteredScales.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No grade scales found.
                  </td>
                </tr>
              ) : (
                filteredScales.map((scale) => (
                  <tr
                    key={scale.id}
                    className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >

                    <td className="px-5 py-4">
                      <p className="font-semibold">
                        {scale.name}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-medium dark:bg-slate-800">
                        {scale.minimum_score} – {scale.maximum_score}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-xl bg-blue-100 px-3 py-1.5 font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {scale.grade}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {scale.remark || "—"}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {scale.grade_point ?? "—"}
                    </td>

                    <td className="px-5 py-4">
                      {scale.is_active ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() => openEditModal(scale)}
                          className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(scale.id)}
                          className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300"
                        >
                          Delete
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

      {/* ========================================================
          MODAL
      ======================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-[var(--color-card)]">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-bold">
                  {editingScale
                    ? "Edit Grade Scale"
                    : "Add Grade Scale"}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Configure the grading range and result information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg transition hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* NAME */}

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Scale Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Excellent"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[var(--color-primary)] dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              {/* SCORE RANGE */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Minimum Score
                  </label>

                  <input
                    type="number"
                    name="minimum_score"
                    value={formData.minimum_score}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[var(--color-primary)] dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Maximum Score
                  </label>

                  <input
                    type="number"
                    name="maximum_score"
                    value={formData.maximum_score}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="100"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[var(--color-primary)] dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

              </div>

              {/* GRADE + POINT */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Grade
                  </label>

                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    placeholder="e.g. A"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[var(--color-primary)] dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Grade Point
                  </label>

                  <input
                    type="number"
                    name="grade_point"
                    value={formData.grade_point}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="e.g. 4.0"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[var(--color-primary)] dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>

              </div>

              {/* REMARK */}

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Remark
                </label>

                <input
                  type="text"
                  name="remark"
                  value={formData.remark}
                  onChange={handleChange}
                  placeholder="e.g. Excellent performance"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[var(--color-primary)] dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              {/* ACTIVE */}

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">

                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-5 w-5 rounded"
                />

                <div>
                  <p className="font-semibold">
                    Active Grade Scale
                  </p>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Allow this grade scale to be used for results.
                  </p>
                </div>

              </label>

              {/* ACTIONS */}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-2xl bg-slate-100 px-5 py-3 font-semibold transition hover:bg-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-[var(--color-primary)] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingScale
                    ? "Update Grade Scale"
                    : "Create Grade Scale"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default ExamOfficerGradeScales;