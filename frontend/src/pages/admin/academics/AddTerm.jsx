import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createTerm,
  getSchools,
  getSessions,
} from "../../../services/academicsService";

const AddTerm = () => {
  const navigate = useNavigate();

  const [schools, setSchools] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [formData, setFormData] = useState({
    school: "",
    academic_session: "",
    name: "",
    start_date: "",
    end_date: "",
    is_current: false,
    is_active: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [schoolData, sessionData] = await Promise.all([
          getSchools(),
          getSessions(),
        ]);

        setSchools(schoolData);
        setSessions(sessionData);
      } catch (err) {
        console.error("Failed to load term data:", err);
        setError("Failed to load schools and academic sessions.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ============================================================
  // HANDLE INPUT CHANGES
  // ============================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      await createTerm({
        school: Number(formData.school),
        academic_session: Number(formData.academic_session),
        name: formData.name,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_current: formData.is_current,
        is_active: formData.is_active,
      });

      navigate("/admin/terms");
    } catch (err) {
      console.error("Failed to create term:", err);

      const backendError = err.response?.data;

      if (backendError) {
        setError(
          typeof backendError === "object"
            ? Object.values(backendError).flat().join(" ")
            : String(backendError),
        );
      } else {
        setError("Failed to create term.");
      }
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center bg-[var(--color-background)] text-[var(--color-text)]">
        <p className="text-sm text-[var(--color-text)]/60">
          Loading...
        </p>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="min-h-full bg-[var(--color-background)] text-[var(--color-text)]">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate("/admin/terms")}
          className="mb-3 text-sm font-medium text-[var(--color-primary)] transition hover:opacity-80"
        >
          ← Back to Terms
        </button>

        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Add Term
        </h1>

        <p className="mt-1 text-sm text-[var(--color-text)]/60">
          Create a new academic term.
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
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
              required
              className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-4 py-2.5 text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            >
              <option value="">Select school</option>

              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          {/* ==================================================
              ACADEMIC SESSION
          ================================================== */}

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
              Academic Session
            </label>

            <select
              name="academic_session"
              value={formData.academic_session}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-4 py-2.5 text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            >
              <option value="">Select academic session</option>

              {sessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name}
                </option>
              ))}
            </select>
          </div>

          {/* ==================================================
              TERM NAME
          ================================================== */}

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
              Term Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. FIRST"
              required
              className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-4 py-2.5 text-[var(--color-text)] placeholder:text-[var(--color-text)]/40 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>

          {/* ==================================================
              START DATE
          ================================================== */}

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
              Start Date
            </label>

            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-4 py-2.5 text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>

          {/* ==================================================
              END DATE
          ================================================== */}

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
              End Date
            </label>

            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-4 py-2.5 text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
            />
          </div>
        </div>

        {/* ======================================================
            CURRENT TERM
        ====================================================== */}

        <div className="mt-6 flex items-center gap-3">
          <input
            type="checkbox"
            id="is_current"
            name="is_current"
            checked={formData.is_current}
            onChange={handleChange}
            className="h-4 w-4 cursor-pointer accent-[var(--color-primary)]"
          />

          <label
            htmlFor="is_current"
            className="cursor-pointer text-sm font-medium text-[var(--color-text)]"
          >
            Set as current term
          </label>
        </div>

        {/* ======================================================
            ACTIVE
        ====================================================== */}

        <div className="mt-4 flex items-center gap-3">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="h-4 w-4 cursor-pointer accent-[var(--color-primary)]"
          />

          <label
            htmlFor="is_active"
            className="cursor-pointer text-sm font-medium text-[var(--color-text)]"
          >
            Active
          </label>
        </div>

        {/* ======================================================
            BUTTONS
        ====================================================== */}

        <div className="mt-8 flex flex-col gap-3 border-t border-[var(--color-text)]/10 pt-5 sm:flex-row">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Term"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/terms")}
            className="rounded-lg border border-[var(--color-text)]/15 bg-[var(--color-card)] px-5 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-background)]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTerm;