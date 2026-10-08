
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import assignmentsService from "../../../services/assignmentsService";

// =====================================================
// STATUS STYLES
// =====================================================

const statusStyles = {
  DRAFT:
    "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",

  PUBLISHED:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",

  CLOSED:
    "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

// =====================================================
// COMPONENT
// =====================================================

export default function AssignmentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ===================================================
  // LOAD ASSIGNMENT
  // ===================================================

  useEffect(() => {
    const loadAssignment = async () => {
      setLoading(true);
      setError(null);

      try {
        const data =
          await assignmentsService.getById(id);

        console.log(
          "ASSIGNMENT DETAILS:",
          data
        );

        setAssignment(data);
      } catch (error) {
        console.error(
          "Failed to load assignment:",
          error
        );

        console.error(
          "ASSIGNMENT DETAILS API RESPONSE:",
          error.response?.data
        );

        setError(
          "Could not load assignment details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadAssignment();
    }
  }, [id]);

  // ===================================================
  // DELETE ASSIGNMENT
  // ===================================================

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assignment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await assignmentsService.remove(id);

      navigate("/admin/assignments");
    } catch (error) {
      console.error(
        "Failed to delete assignment:",
        error
      );

      alert(
        "Failed to delete assignment. Please try again."
      );
    }
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="min-h-full bg-[var(--color-background)] p-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-8 shadow-sm dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--color-primary)]" />

              <p className="text-sm text-[var(--color-text)]">
                Loading assignment...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===================================================
  // ERROR
  // ===================================================

  if (error) {
    return (
      <div className="min-h-full bg-[var(--color-background)] p-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
            <p className="text-red-700 dark:text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/assignments")
              }
              className="mt-4 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Back to Assignments
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return null;
  }

  // ===================================================
  // FORMAT VALUES
  // ===================================================

  const status =
    assignment.status?.toUpperCase();

  const dueDate = assignment.due_date
    ? new Date(
        assignment.due_date
      ).toLocaleString()
    : "—";

  const assignedDate =
    assignment.assigned_date
      ? new Date(
          assignment.assigned_date
        ).toLocaleDateString()
      : "—";

  // ===================================================
  // MAIN PAGE
  // ===================================================

  return (
    <div className="min-h-full bg-[var(--color-background)] p-6">
      <div className="mx-auto max-w-6xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)]">
                Assignment Details
              </h1>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                View assignment information and submissions.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={() =>
                  navigate("/admin/assignments")
                }
                className="rounded-lg border border-gray-300 bg-[var(--color-card)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                Back
              </button>

              <Link
                to={`/admin/assignments/${id}/edit`}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                Edit Assignment
              </Link>

            </div>
          </div>
        </div>

        {/* =================================================
            ASSIGNMENT OVERVIEW
        ================================================= */}

        <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-[var(--color-card)] shadow-sm dark:border-gray-700">

          {/* TOP SECTION */}

          <div className="border-b border-gray-200 p-6 dark:border-gray-700">

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">

              <div>
                <div className="flex flex-wrap items-center gap-3">

                  <h2 className="text-2xl font-bold text-[var(--color-text)]">
                    {assignment.title}
                  </h2>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      statusStyles[status] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {assignment.status_display ||
                      assignment.status ||
                      "—"}
                  </span>

                </div>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {assignment.class_level_name ||
                    "—"}{" "}
                  •{" "}
                  {assignment.subject_name ||
                    "—"}
                </p>
              </div>

              <div className="text-left md:text-right">

                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Maximum Score
                </p>

                <p className="mt-1 text-2xl font-bold text-[var(--color-primary)]">
                  {assignment.maximum_score}
                </p>

              </div>

            </div>
          </div>

          {/* INFORMATION GRID */}

          <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 lg:grid-cols-4">

            {/* CLASS */}

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Class
              </p>

              <p className="mt-1 font-semibold text-[var(--color-text)]">
                {assignment.class_level_name ||
                  "—"}
              </p>
            </div>

            {/* SUBJECT */}

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Subject
              </p>

              <p className="mt-1 font-semibold text-[var(--color-text)]">
                {assignment.subject_name ||
                  "—"}
              </p>
            </div>

            {/* TEACHER */}

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Teacher
              </p>

              <p className="mt-1 font-semibold text-[var(--color-text)]">
                {assignment.teacher_name ||
                  "—"}
              </p>
            </div>

            {/* SCHOOL */}

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                School
              </p>

              <p className="mt-1 font-semibold text-[var(--color-text)]">
                {assignment.school_name ||
                  "—"}
              </p>
            </div>

            {/* SESSION */}

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Academic Session
              </p>

              <p className="mt-1 font-semibold text-[var(--color-text)]">
                {assignment.academic_session_name ||
                  "—"}
              </p>
            </div>

            {/* TERM */}

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Term
              </p>

              <p className="mt-1 font-semibold text-[var(--color-text)]">
                {assignment.term_name ||
                  "—"}
              </p>
            </div>

            {/* ASSIGNED DATE */}

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Assigned Date
              </p>

              <p className="mt-1 font-semibold text-[var(--color-text)]">
                {assignedDate}
              </p>
            </div>

            {/* DUE DATE */}

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Due Date
              </p>

              <p className="mt-1 font-semibold text-[var(--color-text)]">
                {dueDate}
              </p>
            </div>

          </div>
        </div>

        {/* =================================================
            INSTRUCTIONS
        ================================================= */}

        <div className="mb-6 rounded-xl border border-gray-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-gray-700">

          <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
            Instructions
          </h2>

          <div className="whitespace-pre-wrap text-sm leading-7 text-gray-600 dark:text-gray-300">
            {assignment.instructions ||
              "No instructions provided."}
          </div>

        </div>

        {/* =================================================
            ATTACHMENT
        ================================================= */}

        {assignment.attachment && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-gray-700">

            <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
              Attachment
            </h2>

            <a
              href={assignment.attachment}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-secondary)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              View / Download Attachment
            </a>

          </div>
        )}

        {/* =================================================
            SUBMISSION STATISTICS
        ================================================= */}

        <div className="mb-6 rounded-xl border border-gray-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-gray-700">

          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                Submission Statistics
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Overview of student submissions.
              </p>
            </div>

            <Link
              to={`/admin/assignments/${id}/submissions`}
              className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
            >
              View Submissions
            </Link>

          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

            {/* TOTAL */}

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800/50">

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Submissions
              </p>

              <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
                {assignment.submission_count ?? 0}
              </p>

            </div>

            {/* GRADED */}

            <div className="rounded-xl border border-green-100 bg-green-50 p-5 dark:border-green-900/50 dark:bg-green-950/20">

              <p className="text-sm text-green-700 dark:text-green-400">
                Graded
              </p>

              <p className="mt-2 text-2xl font-bold text-green-700 dark:text-green-400">
                —
              </p>

            </div>

            {/* PENDING */}

            <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-5 dark:border-yellow-900/50 dark:bg-yellow-950/20">

              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Pending
              </p>

              <p className="mt-2 text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                —
              </p>

            </div>

            {/* LATE */}

            <div className="rounded-xl border border-red-100 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/20">

              <p className="text-sm text-red-700 dark:text-red-400">
                Late
              </p>

              <p className="mt-2 text-2xl font-bold text-red-700 dark:text-red-400">
                —
              </p>

            </div>

          </div>

          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Detailed graded, pending and late counts will be connected when we build the submission management feature.
          </p>

        </div>

        {/* =================================================
            LATE SUBMISSION
        ================================================= */}

        <div className="mb-6 rounded-xl border border-gray-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-gray-700">

          <div className="flex items-center justify-between gap-4">

            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                Late Submission
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Whether students can submit after the due date.
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                assignment.allow_late_submission
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
              }`}
            >
              {assignment.allow_late_submission
                ? "Allowed"
                : "Not Allowed"}
            </span>

          </div>

        </div>

        {/* =================================================
            DANGER ZONE
        ================================================= */}

        <div className="rounded-xl border border-red-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-red-900/50">

          <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
            Danger Zone
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Deleting an assignment cannot be undone.
          </p>

          <button
            type="button"
            onClick={handleDelete}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Delete Assignment
          </button>

        </div>

      </div>
    </div>
  );
}

