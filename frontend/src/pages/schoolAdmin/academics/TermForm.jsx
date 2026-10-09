
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  createTerm,
  getSessions,
  getTerm,
  updateTerm,
} from "../../../services/academicsService";

const INITIAL_FORM = {
  academic_session: "",
  name: "",
  start_date: "",
  end_date: "",
  is_current: false,
  is_active: true,
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20";

const labelClass =
  "mb-1.5 block text-sm font-medium text-[var(--color-text)]";

function getSessionId(value) {
  if (value && typeof value === "object") {
    return value.id ?? "";
  }

  return value ?? "";
}

export default function TermForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [form, setForm] = useState(INITIAL_FORM);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadForm() {
      setLoading(true);
      setError("");

      try {
        const sessionResponse = await getSessions();
        const sessionList = Array.isArray(sessionResponse)
          ? sessionResponse
          : sessionResponse?.results ?? [];

        if (cancelled) return;

        setSessions(sessionList);

        if (isEditing) {
          const term = await getTerm(id);

          if (cancelled) return;

          setForm({
            academic_session: String(
              getSessionId(term.academic_session)
            ),
            name: term.name ?? "",
            start_date: term.start_date ?? "",
            end_date: term.end_date ?? "",
            is_current: Boolean(term.is_current),
            is_active: term.is_active !== false,
          });
        } else {
          const currentSession = sessionList.find(
            (session) => session.is_current
          );

          setForm((previous) => ({
            ...previous,
            academic_session: currentSession
              ? String(currentSession.id)
              : "",
          }));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
              err.response?.data?.message ||
              "Unable to load the term form. Please refresh and try again."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadForm();

    return () => {
      cancelled = true;
    };
  }, [id, isEditing]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.academic_session) {
      setError("Please select an academic session.");
      return;
    }

    if (!form.name) {
      setError("Please select a term name.");
      return;
    }

    if (!form.start_date || !form.end_date) {
      setError("Please provide both the start date and end date.");
      return;
    }

    if (form.end_date < form.start_date) {
      setError("The end date cannot be earlier than the start date.");
      return;
    }

    const payload = {
      academic_session: Number(form.academic_session),
      name: form.name,
      start_date: form.start_date,
      end_date: form.end_date,
      is_current: form.is_current,
      is_active: form.is_active,
    };

    setSaving(true);

    try {
      if (isEditing) {
        await updateTerm(id, payload);
      } else {
        await createTerm(payload);
      }

      navigate("/school-admin/academics/terms");
    } catch (err) {
      const data = err.response?.data;

      if (data && typeof data === "object") {
        const messages = Object.entries(data).flatMap(([field, value]) => {
          const values = Array.isArray(value) ? value : [value];

          return values.map((message) =>
            typeof message === "string"
              ? `${field === "non_field_errors" ? "" : `${field.replaceAll("_", " ")}: `}${message}`
              : ""
          );
        }).filter(Boolean);

        setError(
          messages.join(" ") ||
            "Unable to save the term. Please check your details and try again."
        );
      } else {
        setError("Unable to save the term. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    navigate("/school-admin/academics/terms");
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2
          className="animate-spin text-[var(--color-primary)]"
          size={30}
        />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[var(--color-background)] px-4 py-1 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={handleCancel}
          className="mb-5 inline-flex items-center gap-2 rounded-md text-sm font-medium text-[var(--color-text)] opacity-75 transition hover:opacity-100"
        >
          <ArrowLeft size={18} />
          Back to Terms
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
            {isEditing ? "Edit Term" : "Add New Term"}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text)] opacity-70">
            {isEditing
              ? "Update the academic term details below."
              : "Create an academic term for your school's academic session."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-5 shadow-sm sm:p-7"
        >
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="academic_session" className={labelClass}>
                Academic Session <span className="text-red-500">*</span>
              </label>
              <select
                id="academic_session"
                name="academic_session"
                value={form.academic_session}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select academic session</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="name" className={labelClass}>
                Term Name <span className="text-red-500">*</span>
              </label>
              <select
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Select term</option>
                <option value="FIRST">First Term</option>
                <option value="SECOND">Second Term</option>
                <option value="THIRD">Third Term</option>
              </select>
            </div>

            <div>
              <label htmlFor="start_date" className={labelClass}>
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                id="start_date"
                name="start_date"
                type="date"
                value={form.start_date}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="end_date" className={labelClass}>
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                id="end_date"
                name="end_date"
                type="date"
                value={form.end_date}
                onChange={handleChange}
                min={form.start_date || undefined}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-7 space-y-4 border-t border-gray-200 pt-6">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="is_current"
                checked={form.is_current}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded accent-[var(--color-primary)]"
              />
              <span>
                <span className="block text-sm font-medium text-[var(--color-text)]">
                  Set as current term
                </span>
                <span className="mt-1 block text-sm text-[var(--color-text)] opacity-65">
                  Mark this as the term currently in progress.
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded accent-[var(--color-primary)]"
              />
              <span>
                <span className="block text-sm font-medium text-[var(--color-text)]">
                  Active
                </span>
                <span className="mt-1 block text-sm text-[var(--color-text)] opacity-65">
                  Keep this term available for normal school operations.
                </span>
              </span>
            </label>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || sessions.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}
              {saving
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Save Term"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}