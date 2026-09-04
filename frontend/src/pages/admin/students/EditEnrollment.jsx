import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getEnrollments,
  updateEnrollment,
} from "../../../services/studentsService";

import {
  getSessions,
  getTerms,
  getClassLevels,
} from "../../../services/academicsService";

function EditEnrollment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [enrollment, setEnrollment] = useState(null);

  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);

  const [form, setForm] = useState({
    academicSession: "",
    term: "",
    classLevel: "",
    roll: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // LOAD ENROLLMENT + DROPDOWNS
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [enrollmentsData, sessionsData, termsData, classLevelsData] =
          await Promise.all([
            getEnrollments(),
            getSessions(),
            getTerms(),
            getClassLevels(),
          ]);

        const enrollmentList = Array.isArray(enrollmentsData)
          ? enrollmentsData
          : enrollmentsData?.results || [];

        const sessionList = Array.isArray(sessionsData)
          ? sessionsData
          : sessionsData?.results || [];

        const termList = Array.isArray(termsData)
          ? termsData
          : termsData?.results || [];

        const classList = Array.isArray(classLevelsData)
          ? classLevelsData
          : classLevelsData?.results || [];

        const currentEnrollment = enrollmentList.find(
          (item) => String(item.id) === String(id),
        );

        if (!currentEnrollment) {
          setError("Enrollment not found.");
          return;
        }

        setEnrollment(currentEnrollment);

        setSessions(sessionList);
        setTerms(termList);
        setClassLevels(classList);

        setForm({
          academicSession: String(currentEnrollment.academic_session ?? ""),

          term: String(currentEnrollment.term ?? ""),

          classLevel: String(currentEnrollment.class_level ?? ""),

          roll:
            currentEnrollment.roll_number !== null &&
            currentEnrollment.roll_number !== undefined
              ? String(currentEnrollment.roll_number)
              : "",
        });
      } catch (err) {
        console.error("Failed to load enrollment:", err);

        setError(
          err.response?.data?.detail ||
            "Unable to load enrollment information.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  // =====================================================
  // FORMAT API ERROR
  // =====================================================

  const formatApiError = (data) => {
    if (!data) {
      return "Unable to update enrollment.";
    }

    if (typeof data === "string") {
      return data;
    }

    if (data.detail) {
      return data.detail;
    }

    if (typeof data === "object") {
      const messages = Object.entries(data)
        .map(([field, message]) => {
          const text = Array.isArray(message)
            ? message.join(", ")
            : String(message);

          return `${field}: ${text}`;
        })
        .join(" | ");

      if (messages) {
        return messages;
      }
    }

    return "Unable to update enrollment.";
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.academicSession) {
      setError("Please select an academic session.");
      return;
    }

    if (!form.term) {
      setError("Please select a term.");
      return;
    }

    if (!form.classLevel) {
      setError("Please select a class.");
      return;
    }

    if (
      form.roll &&
      (Number(form.roll) < 1 || !Number.isInteger(Number(form.roll)))
    ) {
      setError("Roll number must be a positive whole number.");
      return;
    }

    try {
      setSaving(true);

      const enrollmentData = {
        student: enrollment.student,

        academic_session: Number(form.academicSession),

        term: Number(form.term),

        class_level: Number(form.classLevel),

        roll_number: form.roll ? Number(form.roll) : null,
      };

      console.log("Updating enrollment:", enrollmentData);

      await updateEnrollment(id, enrollmentData);

      setSuccess("Enrollment updated successfully.");

      setTimeout(() => {
        navigate(`/admin/students/${enrollment.student}`);
      }, 1000);
    } catch (err) {
      console.error("Enrollment update failed:", err);

      console.error("API response:", err.response?.data);

      setError(formatApiError(err.response?.data));
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // STYLES
  // =====================================================

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] dark:border-slate-700";

  const labelClass =
    "mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400";

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="w-full">
        <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-8 text-center shadow-sm dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading enrollment information...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR WITHOUT ENROLLMENT
  // =====================================================

  if (!enrollment) {
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={() => navigate("/admin/students")}
          className="mb-5 text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          ← Back to Students
        </button>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          {error || "Enrollment not found."}
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="mx-auto w-full max-w-[900px]">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(`/admin/students/${enrollment.student}`)}
          className="mb-3 text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          ← Back to Student
        </button>

        <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
          Edit Enrollment
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Update the student's current class and academic enrollment.
        </p>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-400">
          {success}
        </div>
      )}

      {/* =================================================
          ENROLLMENT CARD
      ================================================= */}

      <form onSubmit={handleSubmit}>
        <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-slate-800">
          {/* Student */}

          <div className="mb-6 rounded-lg bg-slate-50 p-4 dark:bg-slate-900/50">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Student
            </p>

            <p className="mt-1 text-lg font-bold text-[var(--color-text)]">
              {enrollment.student_name}
            </p>
          </div>

          {/* Fields */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Academic Session */}

            <div>
              <label className={labelClass}>Academic Session *</label>

              <select
                name="academicSession"
                value={form.academicSession}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select Session</option>

                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Term */}

            <div>
              <label className={labelClass}>Term *</label>

              <select
                name="term"
                value={form.term}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select Term</option>

                {terms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Class */}

            <div>
              <label className={labelClass}>Class *</label>

              <select
                name="classLevel"
                value={form.classLevel}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Select Class</option>

                {classLevels.map((classLevel) => (
                  <option key={classLevel.id} value={classLevel.id}>
                    {classLevel.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Roll Number */}

            <div>
              <label className={labelClass}>Roll Number</label>

              <input
                type="number"
                min="1"
                step="1"
                name="roll"
                value={form.roll}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Current Enrollment Information */}

          <div className="mt-6 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <h3 className="mb-3 text-sm font-bold text-[var(--color-text)]">
              Current Enrollment
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Session
                </p>

                <p className="mt-1 font-medium text-[var(--color-text)]">
                  {enrollment.session_name || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Term
                </p>

                <p className="mt-1 font-medium text-[var(--color-text)]">
                  {enrollment.term_name || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Class
                </p>

                <p className="mt-1 font-medium text-[var(--color-text)]">
                  {enrollment.class_name || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Roll Number
                </p>

                <p className="mt-1 font-medium text-[var(--color-text)]">
                  {enrollment.roll_number ?? "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}

          <div className="mt-6 flex gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-500/20 transition hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Updating Enrollment..." : "Update Enrollment"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => navigate(`/admin/students/${enrollment.student}`)}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default EditEnrollment;
