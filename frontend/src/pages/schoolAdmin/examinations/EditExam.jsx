import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  FileText,
  Loader2,
  Save,
} from "lucide-react";

import {
  getExamination,
  updateExamination,
} from "../../../services/examinationsService";

import {
  getSessions,
  getTerms,
  getClassLevels,
} from "../../../services/academicsService";

// ============================================================
// CONSTANTS
// ============================================================

const EXAMINATION_TYPES = [
  {
    value: "FIRST_CA",
    label: "First Continuous Assessment",
  },
  {
    value: "SECOND_CA",
    label: "Second Continuous Assessment",
  },
  {
    value: "MID_TERM",
    label: "Mid-Term Examination",
  },
  {
    value: "MOCK",
    label: "Mock Examination",
  },
  {
    value: "TERMINAL",
    label: "Terminal Examination",
  },
  {
    value: "PROMOTION",
    label: "Promotion Examination",
  },
  {
    value: "ENTRANCE",
    label: "Entrance Examination",
  },
];

// ============================================================
// HELPERS
// ============================================================

const getId = (value) => {
  if (value === null || value === undefined) return "";

  if (typeof value === "object") {
    return String(value.id ?? value.value ?? "");
  }

  return String(value);
};

const getName = (item) => {
  if (!item) return "";

  return (
    item.name ||
    item.title ||
    item.session_name ||
    item.term_name ||
    item.class_level_name ||
    ""
  );
};

const getResults = (response) => {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  return [];
};

// ============================================================
// COMPONENT
// ============================================================

export default function EditExam() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [exam, setExam] = useState(null);

  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);

  const [form, setForm] = useState({
    academic_session: "",
    term: "",
    class_level: "",
    name: "",
    examination_type: "",
    start_date: "",
    end_date: "",
    description: "",
    is_published: false,
    is_active: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const [
        examData,
        sessionsData,
        termsData,
        classLevelsData,
      ] = await Promise.all([
        getExamination(id),
        getSessions(),
        getTerms(),
        getClassLevels(),
      ]);

      setExam(examData);

      setSessions(getResults(sessionsData));
      setTerms(getResults(termsData));
      setClassLevels(getResults(classLevelsData));

      setForm({
        academic_session: getId(examData.academic_session),
        term: getId(examData.term),
        class_level: getId(examData.class_level),
        name: examData.name || "",
        examination_type: examData.examination_type || "",
        start_date: examData.start_date || "",
        end_date: examData.end_date || "",
        description: examData.description || "",
        is_published: Boolean(examData.is_published),
        is_active:
          examData.is_active === undefined
            ? true
            : Boolean(examData.is_active),
      });
    } catch (err) {
      console.error("Failed to load examination:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to load the examination. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // FORM HANDLERS
  // ==========================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setError("");
    setSuccess("");
  };

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateForm = () => {
    const errors = {};

    if (!form.academic_session) {
      errors.academic_session = "Please select an academic session.";
    }

    if (!form.term) {
      errors.term = "Please select a term.";
    }

    if (!form.class_level) {
      errors.class_level = "Please select a class.";
    }

    if (!form.name.trim()) {
      errors.name = "Please enter the examination name.";
    }

    if (!form.examination_type) {
      errors.examination_type = "Please select an examination type.";
    }

    if (!form.start_date) {
      errors.start_date = "Please select the start date.";
    }

    if (!form.end_date) {
      errors.end_date = "Please select the end date.";
    }

    if (
      form.start_date &&
      form.end_date &&
      form.end_date < form.start_date
    ) {
      errors.end_date = "End date cannot be before the start date.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSuccess("");
    setError("");

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const payload = {
        academic_session: Number(form.academic_session),
        term: Number(form.term),
        class_level: Number(form.class_level),
        name: form.name.trim(),
        examination_type: form.examination_type,
        start_date: form.start_date,
        end_date: form.end_date,
        description: form.description.trim(),
        is_published: form.is_published,
        is_active: form.is_active,
      };

      await updateExamination(id, payload);

      setSuccess("Examination updated successfully.");

      setTimeout(() => {
        navigate(
          `/school-admin/examinations-results/exams/${id}`
        );
      }, 800);
    } catch (err) {
      console.error("Failed to update examination:", err);

      const responseData = err?.response?.data;

      if (responseData && typeof responseData === "object") {
        const backendErrors = {};

        Object.entries(responseData).forEach(
          ([field, value]) => {
            if (Array.isArray(value)) {
              backendErrors[field] = value.join(" ");
            } else if (typeof value === "string") {
              backendErrors[field] = value;
            }
          }
        );

        if (Object.keys(backendErrors).length > 0) {
          setFieldErrors(backendErrors);
        }

        setError(
          responseData.detail ||
            responseData.non_field_errors?.join?.(" ") ||
            "Failed to update the examination."
        );
      } else {
        setError(
          "Failed to update the examination. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // CANCEL
  // ==========================================================

  const handleCancel = () => {
    navigate(
      `/school-admin/examinations-results/exams/${id}`
    );
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-text">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-text">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span>Loading examination...</span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR WHEN EXAM DOES NOT LOAD
  // ==========================================================

  if (!exam) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 text-text sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/school-admin/examinations-results/exams"
              )
            }
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Exams
          </button>

          <div className="rounded-xl border border-red-200 bg-card p-6 shadow-sm dark:border-red-900">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

              <div>
                <h2 className="font-semibold text-text">
                  Unable to load examination
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {error ||
                    "The requested examination could not be found."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-background px-4 py-6 text-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* -------------------------------------------------- */}
        {/* HEADER */}
        {/* -------------------------------------------------- */}

        <div className="mb-6">
          <button
            type="button"
            onClick={handleCancel}
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Examination
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-text">
                    Edit Examination
                  </h1>

                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Update the examination details below.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-card px-4 py-2 text-sm shadow-sm dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">
                Examination ID:
              </span>{" "}
              <span className="font-semibold text-text">
                #{exam.id}
              </span>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* ERROR */}
        {/* -------------------------------------------------- */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

              <div>
                <p className="font-medium text-red-700 dark:text-red-400">
                  Unable to update examination
                </p>

                <p className="mt-1 text-sm text-red-600 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* SUCCESS */}
        {/* -------------------------------------------------- */}

        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />

              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                {success}
              </p>
            </div>
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* FORM */}
        {/* -------------------------------------------------- */}

        <form onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-card shadow-sm dark:border-gray-700">
            {/* ---------------------------------------------- */}
            {/* BASIC INFORMATION */}
            {/* ---------------------------------------------- */}

            <div className="border-b border-gray-200 p-5 dark:border-gray-700 sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-text">
                  Examination Information
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Update the academic information and examination type.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Academic Session */}

                <div>
                  <label
                    htmlFor="academic_session"
                    className="mb-2 block text-sm font-medium text-text"
                  >
                    Academic Session
                  </label>

                  <select
                    id="academic_session"
                    name="academic_session"
                    value={form.academic_session}
                    onChange={handleChange}
                    className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                      fieldErrors.academic_session
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <option value="">
                      Select academic session
                    </option>

                    {sessions.map((session) => (
                      <option
                        key={session.id}
                        value={session.id}
                      >
                        {getName(session)}
                      </option>
                    ))}
                  </select>

                  {fieldErrors.academic_session && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldErrors.academic_session}
                    </p>
                  )}
                </div>

                {/* Term */}

                <div>
                  <label
                    htmlFor="term"
                    className="mb-2 block text-sm font-medium text-text"
                  >
                    Term
                  </label>

                  <select
                    id="term"
                    name="term"
                    value={form.term}
                    onChange={handleChange}
                    className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                      fieldErrors.term
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <option value="">
                      Select term
                    </option>

                    {terms.map((term) => (
                      <option key={term.id} value={term.id}>
                        {getName(term)}
                      </option>
                    ))}
                  </select>

                  {fieldErrors.term && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldErrors.term}
                    </p>
                  )}
                </div>

                {/* Class */}

                <div>
                  <label
                    htmlFor="class_level"
                    className="mb-2 block text-sm font-medium text-text"
                  >
                    Class
                  </label>

                  <select
                    id="class_level"
                    name="class_level"
                    value={form.class_level}
                    onChange={handleChange}
                    className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                      fieldErrors.class_level
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <option value="">
                      Select class
                    </option>

                    {classLevels.map((classLevel) => (
                      <option
                        key={classLevel.id}
                        value={classLevel.id}
                      >
                        {getName(classLevel)}
                      </option>
                    ))}
                  </select>

                  {fieldErrors.class_level && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldErrors.class_level}
                    </p>
                  )}
                </div>

                {/* Examination Type */}

                <div>
                  <label
                    htmlFor="examination_type"
                    className="mb-2 block text-sm font-medium text-text"
                  >
                    Examination Type
                  </label>

                  <select
                    id="examination_type"
                    name="examination_type"
                    value={form.examination_type}
                    onChange={handleChange}
                    className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                      fieldErrors.examination_type
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <option value="">
                      Select examination type
                    </option>

                    {EXAMINATION_TYPES.map((type) => (
                      <option
                        key={type.value}
                        value={type.value}
                      >
                        {type.label}
                      </option>
                    ))}
                  </select>

                  {fieldErrors.examination_type && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldErrors.examination_type}
                    </p>
                  )}
                </div>

                {/* Examination Name */}

                <div className="md:col-span-2">
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-text"
                  >
                    Examination Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. First Term Examination"
                    className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-text placeholder:text-gray-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                      fieldErrors.name
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />

                  {fieldErrors.name && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ---------------------------------------------- */}
            {/* DATES */}
            {/* ---------------------------------------------- */}

            <div className="border-b border-gray-200 p-5 dark:border-gray-700 sm:p-6">
              <div className="mb-5">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />

                  <h2 className="text-lg font-semibold text-text">
                    Examination Period
                  </h2>
                </div>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Set the period during which this examination takes place.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Start Date */}

                <div>
                  <label
                    htmlFor="start_date"
                    className="mb-2 block text-sm font-medium text-text"
                  >
                    Start Date
                  </label>

                  <input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={form.start_date}
                    onChange={handleChange}
                    className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                      fieldErrors.start_date
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />

                  {fieldErrors.start_date && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldErrors.start_date}
                    </p>
                  )}
                </div>

                {/* End Date */}

                <div>
                  <label
                    htmlFor="end_date"
                    className="mb-2 block text-sm font-medium text-text"
                  >
                    End Date
                  </label>

                  <input
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={form.end_date}
                    onChange={handleChange}
                    className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                      fieldErrors.end_date
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />

                  {fieldErrors.end_date && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldErrors.end_date}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ---------------------------------------------- */}
            {/* DESCRIPTION */}
            {/* ---------------------------------------------- */}

            <div className="border-b border-gray-200 p-5 dark:border-gray-700 sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-text">
                  Additional Information
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Add or update any additional information about the examination.
                </p>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Enter examination description..."
                  className="w-full resize-y rounded-lg border border-gray-300 bg-background px-3 py-2.5 text-sm text-text placeholder:text-gray-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-600"
                />
              </div>
            </div>

            {/* ---------------------------------------------- */}
            {/* STATUS */}
            {/* ---------------------------------------------- */}

            <div className="border-b border-gray-200 p-5 dark:border-gray-700 sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-text">
                  Examination Status
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Control whether the examination is visible and active.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Published */}

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-background p-4 dark:border-gray-700">
                  <input
                    type="checkbox"
                    name="is_published"
                    checked={form.is_published}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />

                  <div>
                    <p className="font-medium text-text">
                      Published
                    </p>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Make this examination visible to users who have access
                      to published examinations.
                    </p>
                  </div>
                </label>

                {/* Active */}

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-background p-4 dark:border-gray-700">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />

                  <div>
                    <p className="font-medium text-text">
                      Active
                    </p>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Keep this examination active in the school system.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* ---------------------------------------------- */}
            {/* ACTIONS */}
            {/* ---------------------------------------------- */}

            <div className="flex flex-col-reverse gap-3 bg-background/50 p-5 sm:flex-row sm:items-center sm:justify-end sm:p-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-card px-5 py-2.5 text-sm font-medium text-text transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}