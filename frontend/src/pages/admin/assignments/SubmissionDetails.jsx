
import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import assignmentsService from "../../../services/assignmentsService";


// ============================================================
// STATUS STYLES
// ============================================================

const statusStyles = {
  SUBMITTED:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",

  LATE:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",

  GRADED:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",

  RETURNED:
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
};


// ============================================================
// COMPONENT
// ============================================================

export default function SubmissionDetails() {
  const navigate = useNavigate();

  const {
    id: assignmentId,
    submissionId,
  } = useParams();

  const [submission, setSubmission] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [form, setForm] = useState({
    score: "",
    teacher_feedback: "",
  });

  const [formErrors, setFormErrors] =
    useState({});

  // ==========================================================
  // LOAD SUBMISSION
  // ==========================================================

  useEffect(() => {
    const loadSubmission = async () => {
      setLoading(true);
      setError("");

      try {
        const data =
          await assignmentsService.getSubmissionById(
            submissionId
          );

        console.log(
          "SUBMISSION DETAILS:",
          data
        );

        setSubmission(data);

        setForm({
          score:
            data.score !== null &&
            data.score !== undefined
              ? data.score
              : "",

          teacher_feedback:
            data.teacher_feedback || "",
        });
      } catch (error) {
        console.error(
          "Failed to load submission:",
          error
        );

        console.error(
          "SUBMISSION API RESPONSE:",
          error.response?.data
        );

        setError(
          "Failed to load submission."
        );
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) {
      loadSubmission();
    }
  }, [submissionId]);


  // ==========================================================
  // HANDLE INPUT
  // ==========================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormErrors((previous) => ({
      ...previous,
      [name]: "",
      general: "",
    }));
  };


  // ==========================================================
  // SAVE GRADE
  // ==========================================================

  const handleGrade = async () => {
    const errors = {};

    if (
      form.score === "" ||
      form.score === null
    ) {
      errors.score =
        "Please enter a score.";
    }

    const scoreNumber = Number(
      form.score
    );

    const maximumScore = Number(
      submission.maximum_score
    );

    if (
      form.score !== "" &&
      Number.isNaN(scoreNumber)
    ) {
      errors.score =
        "Score must be a valid number.";
    }

    if (
      !Number.isNaN(scoreNumber) &&
      scoreNumber < 0
    ) {
      errors.score =
        "Score cannot be less than 0.";
    }

    if (
      !Number.isNaN(scoreNumber) &&
      scoreNumber > maximumScore
    ) {
      errors.score =
        `Score cannot be greater than ${maximumScore}.`;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    setFormErrors({});

    try {
      const updated =
        await assignmentsService.updateSubmission(
          submissionId,
          {
            score: scoreNumber,
            teacher_feedback:
              form.teacher_feedback,
            status: "GRADED",
          }
        );

      setSubmission(updated);

      setForm({
        score:
          updated.score !== null &&
          updated.score !== undefined
            ? updated.score
            : scoreNumber,

        teacher_feedback:
          updated.teacher_feedback ||
          "",
      });

      alert(
        "Submission graded successfully."
      );
    } catch (error) {
      console.error(
        "Failed to grade submission:",
        error
      );

      console.error(
        "GRADE API RESPONSE:",
        error.response?.data
      );

      const responseData =
        error.response?.data;

      if (responseData) {
        setFormErrors(responseData);
      } else {
        setFormErrors({
          general:
            "Failed to grade submission. Please try again.",
        });
      }
    } finally {
      setSaving(false);
    }
  };


  // ==========================================================
  // RETURN SUBMISSION
  // ==========================================================

  const handleReturn = async () => {
    const confirmed =
      window.confirm(
        "Return this submission to the student?"
      );

    if (!confirmed) {
      return;
    }

    setSaving(true);
    setFormErrors({});

    try {
      const updated =
        await assignmentsService.updateSubmission(
          submissionId,
          {
            status: "RETURNED",
            teacher_feedback:
              form.teacher_feedback,
          }
        );

      setSubmission(updated);

      setForm({
        score:
          updated.score !== null &&
          updated.score !== undefined
            ? updated.score
            : form.score,

        teacher_feedback:
          updated.teacher_feedback ||
          "",
      });

      alert(
        "Submission returned successfully."
      );
    } catch (error) {
      console.error(
        "Failed to return submission:",
        error
      );

      console.error(
        "RETURN API RESPONSE:",
        error.response?.data
      );

      const responseData =
        error.response?.data;

      if (responseData) {
        setFormErrors(responseData);
      } else {
        setFormErrors({
          general:
            "Failed to return submission.",
        });
      }
    } finally {
      setSaving(false);
    }
  };


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(
      date
    ).toLocaleString();
  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-full bg-[var(--color-background)] p-6">

        <div className="mx-auto max-w-6xl">

          <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-8 shadow-sm dark:border-gray-700">

            <div className="flex items-center gap-3">

              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--color-primary)]" />

              <p className="text-sm text-[var(--color-text)]">
                Loading submission...
              </p>

            </div>

          </div>

        </div>

      </div>
    );
  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !submission) {
    return (
      <div className="min-h-full bg-[var(--color-background)] p-6">

        <div className="mx-auto max-w-6xl">

          <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">

            <p className="text-red-700 dark:text-red-400">
              {error ||
                "Submission not found."}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/admin/assignments/${assignmentId}/submissions`
                )
              }
              className="mt-4 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Back to Submissions
            </button>

          </div>

        </div>

      </div>
    );
  }


  // ==========================================================
  // VALUES
  // ==========================================================

  const status =
    submission.status?.toUpperCase();

  const maximumScore =
    Number(
      submission.maximum_score || 0
    );

  const currentScore =
    submission.score !== null &&
    submission.score !== undefined
      ? Number(submission.score)
      : null;

  const percentage =
    currentScore !== null &&
    maximumScore > 0
      ? (
          (currentScore /
            maximumScore) *
          100
        ).toFixed(1)
      : null;


  // ==========================================================
  // MAIN PAGE
  // ==========================================================

  return (
    <div className="min-h-full bg-[var(--color-background)] p-6">

      <div className="mx-auto max-w-6xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6">

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">

            <div>

              <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">

                <Link
                  to="/admin/assignments"
                  className="text-[var(--color-primary)] hover:underline"
                >
                  Assignments
                </Link>

                <span className="text-gray-400">
                  /
                </span>

                <Link
                  to={`/admin/assignments/${assignmentId}/submissions`}
                  className="text-[var(--color-primary)] hover:underline"
                >
                  Submissions
                </Link>

                <span className="text-gray-400">
                  /
                </span>

                <span className="text-gray-500 dark:text-gray-400">
                  Submission
                </span>

              </div>

              <h1 className="text-2xl font-bold text-[var(--color-text)]">
                Submission Details
              </h1>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {submission.assignment_title}
              </p>

            </div>


            <span
              className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-medium ${
                statusStyles[status] ||
                "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
              }`}
            >
              {submission.status_display ||
                submission.status}
            </span>

          </div>

        </div>


        {/* ==================================================
            STUDENT + ASSIGNMENT INFO
        ================================================== */}

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* STUDENT */}

          <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-gray-700">

            <h2 className="mb-5 text-lg font-semibold text-[var(--color-text)]">
              Student Information
            </h2>

            <div className="space-y-4">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Student Name
                </p>

                <p className="mt-1 font-semibold text-[var(--color-text)]">
                  {submission.student_name ||
                    "Unknown Student"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Admission Number
                </p>

                <p className="mt-1 font-semibold text-[var(--color-text)]">
                  {submission.student_admission_number ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Submitted At
                </p>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {formatDate(
                    submission.submitted_at
                  )}
                </p>
              </div>

            </div>

          </div>


          {/* ASSIGNMENT */}

          <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-gray-700">

            <h2 className="mb-5 text-lg font-semibold text-[var(--color-text)]">
              Assignment Information
            </h2>

            <div className="space-y-4">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Assignment
                </p>

                <p className="mt-1 font-semibold text-[var(--color-text)]">
                  {submission.assignment_title ||
                    "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Maximum Score
                </p>

                <p className="mt-1 font-semibold text-[var(--color-text)]">
                  {maximumScore}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Current Score
                </p>

                <p className="mt-1 text-xl font-bold text-[var(--color-primary)]">
                  {currentScore !== null
                    ? `${currentScore}/${maximumScore}`
                    : "Not graded"}
                </p>

                {percentage !== null && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {percentage}%
                  </p>
                )}

              </div>

            </div>

          </div>

        </div>


        {/* ==================================================
            STUDENT ANSWER
        ================================================== */}

        <div className="mb-6 rounded-xl border border-gray-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-gray-700">

          <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
            Student Answer
          </h2>

          {submission.answer_text ? (

            <div className="whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-5 text-sm leading-7 text-gray-700 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-300">
              {submission.answer_text}
            </div>

          ) : (

            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
              No written answer was submitted.
            </div>

          )}

        </div>


        {/* ==================================================
            SUBMITTED FILE
        ================================================== */}

        {submission.submission_file && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-gray-700">

            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
              Submitted File
            </h2>

            <a
              href={
                submission.submission_file
              }
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-secondary)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              Open Submitted File
            </a>

          </div>
        )}


        {/* ==================================================
            GRADING
        ================================================== */}

        <div className="mb-6 rounded-xl border border-gray-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-gray-700">

          <div className="mb-6">

            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Grade Submission
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Enter the student's score and provide feedback.
            </p>

          </div>


          {/* GENERAL ERROR */}

          {formErrors.general && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              {formErrors.general}
            </div>
          )}


          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

            {/* SCORE */}

            <div>

              <label
                htmlFor="score"
                className="mb-2 block text-sm font-medium text-[var(--color-text)]"
              >
                Score
              </label>

              <div className="relative">

                <input
                  id="score"
                  name="score"
                  type="number"
                  min="0"
                  max={maximumScore}
                  step="0.01"
                  value={form.score}
                  onChange={handleChange}
                  placeholder="Enter score"
                  className={`w-full rounded-lg border bg-white px-4 py-3 pr-20 text-sm text-gray-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:bg-gray-800 dark:text-white ${
                    formErrors.score
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  / {maximumScore}
                </span>

              </div>

              {formErrors.score && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {Array.isArray(
                    formErrors.score
                  )
                    ? formErrors.score[0]
                    : formErrors.score}
                </p>
              )}

            </div>


            {/* FEEDBACK */}

            <div className="md:col-span-2">

              <label
                htmlFor="teacher_feedback"
                className="mb-2 block text-sm font-medium text-[var(--color-text)]"
              >
                Teacher Feedback
              </label>

              <textarea
                id="teacher_feedback"
                name="teacher_feedback"
                rows="4"
                value={
                  form.teacher_feedback
                }
                onChange={handleChange}
                placeholder="Enter feedback for the student..."
                className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />

            </div>

          </div>


          {/* ACTIONS */}

          <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">

            <button
              type="button"
              onClick={handleGrade}
              disabled={saving}
              className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : "Save Grade"}
            </button>


            <button
              type="button"
              onClick={handleReturn}
              disabled={saving}
              className="rounded-lg bg-[var(--color-secondary)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Processing..."
                : "Return to Student"}
            </button>


            <button
              type="button"
              onClick={() =>
                navigate(
                  `/admin/assignments/${assignmentId}/submissions`
                )
              }
              disabled={saving}
              className="rounded-lg border border-gray-300 bg-[var(--color-card)] px-5 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-gray-50 disabled:opacity-60 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              Cancel
            </button>

          </div>

        </div>


        {/* ==================================================
            GRADING HISTORY
        ================================================== */}

        {submission.graded_at && (
          <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-gray-700">

            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
              Grading Information
            </h2>

            <div>

              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Graded At
              </p>

              <p className="mt-1 text-sm text-[var(--color-text)]">
                {formatDate(
                  submission.graded_at
                )}
              </p>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
