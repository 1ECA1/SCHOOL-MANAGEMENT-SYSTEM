import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  Save,
} from "lucide-react";

import {
  getExamination,
  getExaminationSubject,
  getExaminationSubjects,
  updateExaminationSubject,
} from "../../../services/examinationsService";

import { getClassSubjects } from "../../../services/academicsService";

// ============================================================
// HELPERS
// ============================================================

const getResults = (response) => {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  return [];
};

const getId = (value) => {
  if (value === null || value === undefined) return "";

  if (typeof value === "object") {
    return String(value.id ?? value.value ?? "");
  }

  return String(value);
};

const getClassSubjectClassId = (item) => {
  if (!item) return "";

  if (item.class_level !== undefined) {
    return getId(item.class_level);
  }

  if (item.class_level_id !== undefined) {
    return getId(item.class_level_id);
  }

  if (item.classLevel !== undefined) {
    return getId(item.classLevel);
  }

  if (item.class_level_detail !== undefined) {
    return getId(item.class_level_detail);
  }

  return "";
};

const getClassSubjectSubjectId = (item) => {
  if (!item) return "";

  if (item.subject !== undefined) {
    return getId(item.subject);
  }

  if (item.subject_id !== undefined) {
    return getId(item.subject_id);
  }

  if (item.subject_detail !== undefined) {
    return getId(item.subject_detail);
  }

  return "";
};

const getSubjectName = (item) => {
  if (!item) return "";

  if (item.subject_name) {
    return item.subject_name;
  }

  if (item.subject_title) {
    return item.subject_title;
  }

  if (item.subject && typeof item.subject === "object") {
    return (
      item.subject.name ||
      item.subject.title ||
      item.subject.subject_name ||
      ""
    );
  }

  if (item.name) {
    return item.name;
  }

  if (item.title) {
    return item.title;
  }

  return "";
};

const getSubjectCode = (item) => {
  if (!item) return "";

  if (item.subject_code) {
    return item.subject_code;
  }

  if (item.subject && typeof item.subject === "object") {
    return item.subject.code || item.subject.subject_code || "";
  }

  return item.code || "";
};

// ============================================================
// COMPONENT
// ============================================================

export default function EditExamSubject() {
  const { id, subjectId } = useParams();
  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [exam, setExam] = useState(null);
  const [examSubject, setExamSubject] = useState(null);

  const [classSubjects, setClassSubjects] = useState([]);
  const [existingExamSubjects, setExistingExamSubjects] = useState([]);

  const [form, setForm] = useState({
    subject: "",
    examination_date: "",
    start_time: "",
    end_time: "",
    maximum_score: "100",
    pass_mark: "40",
    venue: "",
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
  }, [id, subjectId]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const [
        examData,
        examSubjectData,
        classSubjectsData,
        existingSubjectsData,
      ] = await Promise.all([
        getExamination(id),
        getExaminationSubject(subjectId),
        getClassSubjects(),
        getExaminationSubjects(),
      ]);

      setExam(examData);
      setExamSubject(examSubjectData);

      setClassSubjects(getResults(classSubjectsData));
      setExistingExamSubjects(getResults(existingSubjectsData));

      setForm({
        subject: getId(examSubjectData.subject),
        examination_date:
          examSubjectData.examination_date || "",
        start_time: examSubjectData.start_time
          ? examSubjectData.start_time.substring(0, 5)
          : "",
        end_time: examSubjectData.end_time
          ? examSubjectData.end_time.substring(0, 5)
          : "",
        maximum_score:
          examSubjectData.maximum_score !== null &&
          examSubjectData.maximum_score !== undefined
            ? String(examSubjectData.maximum_score)
            : "100",
        pass_mark:
          examSubjectData.pass_mark !== null &&
          examSubjectData.pass_mark !== undefined
            ? String(examSubjectData.pass_mark)
            : "40",
        venue: examSubjectData.venue || "",
      });
    } catch (err) {
      console.error("Failed to load examination subject:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to load the examination subject. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // AVAILABLE SUBJECTS
  // ==========================================================

  const availableSubjects = useMemo(() => {
    if (!exam) return [];

    const examClassId = getId(exam.class_level);

    if (!examClassId) return [];

    const currentSubjectId = getId(examSubject?.subject);

    const scheduledSubjectIds = new Set(
      existingExamSubjects
        .filter(
          (item) =>
            getId(item.examination) === String(id)
        )
        .map((item) => getId(item.subject))
        .filter(Boolean)
    );

    const filtered = classSubjects.filter((item) => {
      const classId = getClassSubjectClassId(item);
      const subjectIdValue = getClassSubjectSubjectId(item);

      if (!classId || !subjectIdValue) {
        return false;
      }

      if (classId !== String(examClassId)) {
        return false;
      }

      // Keep the subject currently being edited available.
      if (subjectIdValue === String(currentSubjectId)) {
        return true;
      }

      // Don't allow another subject already scheduled
      // for this examination.
      if (scheduledSubjectIds.has(subjectIdValue)) {
        return false;
      }

      return true;
    });

    const uniqueSubjects = new Map();

    filtered.forEach((item) => {
      const subjectIdValue =
        getClassSubjectSubjectId(item);

      if (!uniqueSubjects.has(subjectIdValue)) {
        uniqueSubjects.set(subjectIdValue, {
          id: subjectIdValue,
          name: getSubjectName(item),
          code: getSubjectCode(item),
        });
      }
    });

    return Array.from(uniqueSubjects.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [
    exam,
    examSubject,
    classSubjects,
    existingExamSubjects,
    id,
  ]);

  // ==========================================================
  // FORM HANDLER
  // ==========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
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

    if (!form.subject) {
      errors.subject = "Please select a subject.";
    }

    if (!form.examination_date) {
      errors.examination_date =
        "Please select the examination date.";
    }

    if (
      exam &&
      form.examination_date &&
      exam.start_date &&
      form.examination_date < exam.start_date
    ) {
      errors.examination_date =
        "Subject examination date cannot be before the examination start date.";
    }

    if (
      exam &&
      form.examination_date &&
      exam.end_date &&
      form.examination_date > exam.end_date
    ) {
      errors.examination_date =
        "Subject examination date cannot be after the examination end date.";
    }

    if (!form.start_time) {
      errors.start_time = "Please select the start time.";
    }

    if (!form.end_time) {
      errors.end_time = "Please select the end time.";
    }

    if (
      form.start_time &&
      form.end_time &&
      form.end_time <= form.start_time
    ) {
      errors.end_time =
        "End time must be later than start time.";
    }

    const maximumScore = Number(form.maximum_score);
    const passMark = Number(form.pass_mark);

    if (
      !form.maximum_score ||
      Number.isNaN(maximumScore) ||
      maximumScore <= 0
    ) {
      errors.maximum_score =
        "Maximum score must be greater than 0.";
    }

    if (
      !form.pass_mark ||
      Number.isNaN(passMark) ||
      passMark < 0
    ) {
      errors.pass_mark =
        "Pass mark must be 0 or greater.";
    }

    if (
      !Number.isNaN(maximumScore) &&
      !Number.isNaN(passMark) &&
      passMark > maximumScore
    ) {
      errors.pass_mark =
        "Pass mark cannot be greater than maximum score.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const payload = {
        examination: Number(id),
        subject: Number(form.subject),
        examination_date: form.examination_date,
        start_time: form.start_time,
        end_time: form.end_time,
        maximum_score: Number(form.maximum_score),
        pass_mark: Number(form.pass_mark),
        venue: form.venue.trim(),
      };

      await updateExaminationSubject(subjectId, payload);

      setSuccess(
        "Examination subject updated successfully."
      );

      setTimeout(() => {
        navigate(
          `/school-admin/examinations-results/exams/${id}`
        );
      }, 800);
    } catch (err) {
      console.error(
        "Failed to update examination subject:",
        err
      );

      const responseData = err?.response?.data;

      if (
        responseData &&
        typeof responseData === "object"
      ) {
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
            "Failed to update the examination subject."
        );
      } else {
        setError(
          "Failed to update the examination subject. Please try again."
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
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />

            <span>
              Loading examination subject...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // NOT FOUND
  // ==========================================================

  if (!examSubject || !exam) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 text-text sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={handleCancel}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Examination
          </button>

          <div className="rounded-xl border border-red-200 bg-card p-6 shadow-sm dark:border-red-900">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

              <div>
                <h2 className="font-semibold">
                  Unable to load examination subject
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {error ||
                    "The requested examination subject could not be found."}
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
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

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
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  Edit Exam Subject
                </h1>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Update the subject examination schedule.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-card px-4 py-2 text-sm shadow-sm dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">
                Subject Schedule ID:
              </span>{" "}
              <span className="font-semibold">
                #{examSubject.id}
              </span>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* EXAM SUMMARY */}
        {/* ================================================== */}

        <div className="mb-6 rounded-xl border border-gray-200 bg-card p-5 shadow-sm dark:border-gray-700">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Examination
              </p>

              <p className="mt-1 font-semibold">
                {exam.name}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Class
              </p>

              <p className="mt-1 font-semibold">
                {exam.class_level_name ||
                  exam.class_level?.name ||
                  "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Examination Period
              </p>

              <p className="mt-1 font-semibold">
                {exam.start_date} — {exam.end_date}
              </p>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

              <div>
                <p className="font-medium text-red-700 dark:text-red-400">
                  Unable to update subject
                </p>

                <p className="mt-1 text-sm text-red-600 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* SUCCESS */}
        {/* ================================================== */}

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

        {/* ================================================== */}
        {/* FORM */}
        {/* ================================================== */}

        <form onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-card shadow-sm dark:border-gray-700">
            {/* ================================================== */}
            {/* SUBJECT */}
            {/* ================================================== */}

            <div className="border-b border-gray-200 p-5 dark:border-gray-700 sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold">
                  Subject
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Only subjects assigned to this examination's
                  class are available.
                </p>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-medium"
                >
                  Subject
                </label>

                <select
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                    fieldErrors.subject
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <option value="">
                    Select subject
                  </option>

                  {availableSubjects.map((subject) => (
                    <option
                      key={subject.id}
                      value={subject.id}
                    >
                      {subject.name}
                      {subject.code
                        ? ` (${subject.code})`
                        : ""}
                    </option>
                  ))}
                </select>

                {fieldErrors.subject && (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.subject}
                  </p>
                )}

                {availableSubjects.length === 0 && (
                  <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                    No other subjects assigned to this class
                    are available for this examination.
                  </p>
                )}
              </div>
            </div>

            {/* ================================================== */}
            {/* DATE & TIME */}
            {/* ================================================== */}

            <div className="border-b border-gray-200 p-5 dark:border-gray-700 sm:p-6">
              <div className="mb-5">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" />

                  <h2 className="text-lg font-semibold">
                    Schedule
                  </h2>
                </div>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Set the date and time for this subject.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                {/* Date */}

                <div>
                  <label
                    htmlFor="examination_date"
                    className="mb-2 block text-sm font-medium"
                  >
                    Examination Date
                  </label>

                  <input
                    id="examination_date"
                    name="examination_date"
                    type="date"
                    value={form.examination_date}
                    min={exam.start_date || undefined}
                    max={exam.end_date || undefined}
                    onChange={handleChange}
                    className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                      fieldErrors.examination_date
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />

                  {fieldErrors.examination_date && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldErrors.examination_date}
                    </p>
                  )}
                </div>

                {/* Start Time */}

                <div>
                  <label
                    htmlFor="start_time"
                    className="mb-2 flex items-center gap-2 text-sm font-medium"
                  >
                    <Clock className="h-4 w-4 text-primary" />
                    Start Time
                  </label>

                  <input
                    id="start_time"
                    name="start_time"
                    type="time"
                    value={form.start_time}
                    onChange={handleChange}
                    className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                      fieldErrors.start_time
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />

                  {fieldErrors.start_time && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldErrors.start_time}
                    </p>
                  )}
                </div>

                {/* End Time */}

                <div>
                  <label
                    htmlFor="end_time"
                    className="mb-2 flex items-center gap-2 text-sm font-medium"
                  >
                    <Clock className="h-4 w-4 text-primary" />
                    End Time
                  </label>

                  <input
                    id="end_time"
                    name="end_time"
                    type="time"
                    value={form.end_time}
                    onChange={handleChange}
                    className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                      fieldErrors.end_time
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />

                  {fieldErrors.end_time && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldErrors.end_time}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ================================================== */}
            {/* SCORES */}
            {/* ================================================== */}

            <div className="border-b border-gray-200 p-5 dark:border-gray-700 sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold">
                  Scoring
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Configure the maximum score and pass mark.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Maximum Score */}

                <div>
                  <label
                    htmlFor="maximum_score"
                    className="mb-2 block text-sm font-medium"
                  >
                    Maximum Score
                  </label>

                  <input
                    id="maximum_score"
                    name="maximum_score"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.maximum_score}
                    onChange={handleChange}
                    className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                      fieldErrors.maximum_score
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />

                  {fieldErrors.maximum_score && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldErrors.maximum_score}
                    </p>
                  )}
                </div>

                {/* Pass Mark */}

                <div>
                  <label
                    htmlFor="pass_mark"
                    className="mb-2 block text-sm font-medium"
                  >
                    Pass Mark
                  </label>

                  <input
                    id="pass_mark"
                    name="pass_mark"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.pass_mark}
                    onChange={handleChange}
                    className={`w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                      fieldErrors.pass_mark
                        ? "border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  />

                  {fieldErrors.pass_mark && (
                    <p className="mt-1 text-xs text-red-500">
                      {fieldErrors.pass_mark}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ================================================== */}
            {/* VENUE */}
            {/* ================================================== */}

            <div className="border-b border-gray-200 p-5 dark:border-gray-700 sm:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold">
                  Venue
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Specify where students should take this subject.
                </p>
              </div>

              <div>
                <label
                  htmlFor="venue"
                  className="mb-2 block text-sm font-medium"
                >
                  Venue
                </label>

                <input
                  id="venue"
                  name="venue"
                  type="text"
                  value={form.venue}
                  onChange={handleChange}
                  placeholder="e.g. Hall A, Room 12"
                  className="w-full rounded-lg border border-gray-300 bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-600"
                />
              </div>
            </div>

            {/* ================================================== */}
            {/* ACTIONS */}
            {/* ================================================== */}

            <div className="flex flex-col-reverse gap-3 bg-background/50 p-5 sm:flex-row sm:justify-end sm:p-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-card px-5 py-2.5 text-sm font-medium transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-600 dark:hover:bg-gray-800"
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