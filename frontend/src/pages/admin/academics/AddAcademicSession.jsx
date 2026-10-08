import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createSession,
  getSchools,
} from "../../../services/academicsService";

const AddAcademicSession = () => {
  const navigate = useNavigate();

  const [schools, setSchools] = useState([]);

  const [formData, setFormData] = useState({
    school: "",
    name: "",
    start_date: "",
    end_date: "",
    is_current: false,
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD SCHOOLS
  // ============================================================

  useEffect(() => {
    const loadSchools = async () => {
      try {
        setLoadingSchools(true);

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
  // HANDLE INPUT CHANGE
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

    if (!formData.name.trim()) {
      setError("Please enter the academic session name.");
      return;
    }

    if (!formData.start_date) {
      setError("Please select the start date.");
      return;
    }

    if (!formData.end_date) {
      setError("Please select the end date.");
      return;
    }

    if (formData.end_date <= formData.start_date) {
      setError("End date must be after the start date.");
      return;
    }

    try {
      setLoading(true);

      await createSession({
        school: Number(formData.school),
        name: formData.name.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_current: formData.is_current,
        is_active: formData.is_active,
      });

      navigate("/admin/academic/sessions");
    } catch (err) {
      console.error("Failed to create academic session:", err);

      const message =
        err?.response?.data?.name?.[0] ||
        err?.response?.data?.detail ||
        "Failed to create academic session.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-full bg-[var(--color-background)] text-[var(--color-text)] p-6">
      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate("/admin/academic/sessions")}
          className="mb-4 text-sm font-medium text-[var(--color-primary)] transition hover:opacity-80"
        >
          ← Back to Academic Sessions
        </button>

        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Add Academic Session
        </h1>

        <p className="mt-1 text-sm text-[var(--color-text)]/60">
          Create a new academic session for a school.
        </p>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mb-6 max-w-3xl rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* ======================================================
          FORM
      ====================================================== */}

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl rounded-xl border border-[var(--color-text)]/10 bg-[var(--color-card)] p-6 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* ==================================================
              SCHOOL
          ================================================== */}

          <div className="md:col-span-2">
            <label
              htmlFor="school"
              className="mb-2 block text-sm font-medium text-[var(--color-text)]"
            >
              School
            </label>

            <select
              id="school"
              name="school"
              value={formData.school}
              onChange={handleChange}
              disabled={loadingSchools}
              className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {loadingSchools
                  ? "Loading schools..."
                  : "Select school"}
              </option>

              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          {/* ==================================================
              SESSION NAME
          ================================================== */}

          <div className="md:col-span-2">
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-[var(--color-text)]"
            >
              Academic Session Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Example: 2026/2027"
              maxLength={50}
              className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text)]/40 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />

            <p className="mt-1 text-xs text-[var(--color-text)]/50">
              Example: 2026/2027
            </p>
          </div>

          {/* ==================================================
              START DATE
          ================================================== */}

          <div>
            <label
              htmlFor="start_date"
              className="mb-2 block text-sm font-medium text-[var(--color-text)]"
            >
              Start Date
            </label>

            <input
              id="start_date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>

          {/* ==================================================
              END DATE
          ================================================== */}

          <div>
            <label
              htmlFor="end_date"
              className="mb-2 block text-sm font-medium text-[var(--color-text)]"
            >
              End Date
            </label>

            <input
              id="end_date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleChange}
              className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>

          {/* ==================================================
              CURRENT SESSION
          ================================================== */}

          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="is_current"
                checked={formData.is_current}
                onChange={handleChange}
                className="h-4 w-4 cursor-pointer rounded accent-[var(--color-primary)]"
              />

              <span>
                <span className="block text-sm font-medium text-[var(--color-text)]">
                  Current Academic Session
                </span>

                <span className="block text-xs text-[var(--color-text)]/50">
                  Mark this session as the current session.
                </span>
              </span>
            </label>
          </div>

          {/* ==================================================
              ACTIVE
          ================================================== */}

          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 cursor-pointer rounded accent-[var(--color-primary)]"
              />

              <span>
                <span className="block text-sm font-medium text-[var(--color-text)]">
                  Active
                </span>

                <span className="block text-xs text-[var(--color-text)]/50">
                  Keep this academic session active.
                </span>
              </span>
            </label>
          </div>
        </div>

        {/* ======================================================
            BUTTONS
        ====================================================== */}

        <div className="mt-8 flex flex-col justify-end gap-3 border-t border-[var(--color-text)]/10 pt-6 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/admin/academic/sessions")}
            className="rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-5 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-background)]"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || loadingSchools}
            className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Session"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAcademicSession;