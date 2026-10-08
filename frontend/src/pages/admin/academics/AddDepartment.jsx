import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createDepartment,
  getSchools,
} from "../../../services/academicsService";

const AddDepartment = () => {
  const navigate = useNavigate();

  const [schools, setSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    school: "",
    name: "",
    code: "",
    description: "",
    head_name: "",
    is_active: true,
  });

  // ============================================================
  // LOAD SCHOOLS
  // ============================================================

  useEffect(() => {
    const loadSchools = async () => {
      try {
        const data = await getSchools();
        setSchools(data);
      } catch (err) {
        console.error("Failed to load schools:", err);
        setError("Failed to load schools.");
      } finally {
        setLoadingSchools(false);
      }
    };

    loadSchools();
  }, []);

  // ============================================================
  // HANDLE INPUT CHANGES
  // ============================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.school) {
      setError("Please select a school.");
      return;
    }

    try {
      setSaving(true);

      await createDepartment({
        school: Number(formData.school),
        name: formData.name,
        code: formData.code,
        description: formData.description,
        head_name: formData.head_name,
        is_active: formData.is_active,
      });

      navigate("/admin/departments");
    } catch (err) {
      console.error("Failed to create department:", err);

      const responseData = err?.response?.data;

      if (responseData) {
        setError(
          Object.values(responseData).flat().join(" ") ||
            "Failed to create department.",
        );
      } else {
        setError("Failed to create department.");
      }
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-full bg-[var(--color-background)] text-[var(--color-text)]">
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate("/admin/departments")}
          className="mb-3 text-sm font-medium text-[var(--color-primary)] transition hover:opacity-80"
        >
          ← Back to Departments
        </button>

        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Add Department
        </h1>

        <p className="mt-1 text-sm text-[var(--color-text)]/60">
          Create a new school department.
        </p>
      </div>

      {/* ======================================================
          FORM CARD
      ====================================================== */}

      <div className="rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-card)] p-6 shadow-sm">
        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ==================================================
              SCHOOL
          ================================================== */}

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
              School
            </label>

            <select
              name="school"
              value={formData.school}
              onChange={handleChange}
              disabled={loadingSchools}
              required
              className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-3 py-2.5 text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {loadingSchools ? "Loading schools..." : "Select school"}
              </option>

              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          {/* ==================================================
              NAME + CODE
          ================================================== */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Department Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Department Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Example: Science Department"
                className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-3 py-2.5 text-[var(--color-text)] placeholder:text-[var(--color-text)]/40 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
              />
            </div>

            {/* Department Code */}
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Department Code
              </label>

              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                placeholder="Example: SCI"
                className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-3 py-2.5 uppercase text-[var(--color-text)] placeholder:normal-case placeholder:text-[var(--color-text)]/40 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
              />
            </div>
          </div>

          {/* ==================================================
              HEAD OF DEPARTMENT
          ================================================== */}

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
              Head of Department
            </label>

            <input
              type="text"
              name="head_name"
              value={formData.head_name}
              onChange={handleChange}
              placeholder="Enter head of department"
              className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-3 py-2.5 text-[var(--color-text)] placeholder:text-[var(--color-text)]/40 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>

          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Enter department description"
              className="w-full resize-y rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-3 py-2.5 text-[var(--color-text)] placeholder:text-[var(--color-text)]/40 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>

          {/* ==================================================
              ACTIVE
          ================================================== */}

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 cursor-pointer accent-[var(--color-primary)]"
            />

            <label className="cursor-pointer text-sm font-medium text-[var(--color-text)]">
              Active Department
            </label>
          </div>

          {/* ==================================================
              BUTTONS
          ================================================== */}

          <div className="flex flex-col gap-3 border-t border-[var(--color-text)]/10 pt-5 sm:flex-row">
            {/* Cancel */}
            <button
              type="button"
              onClick={() => navigate("/admin/departments")}
              className="rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-5 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-background)]"
            >
              Cancel
            </button>

            {/* Create */}
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDepartment;