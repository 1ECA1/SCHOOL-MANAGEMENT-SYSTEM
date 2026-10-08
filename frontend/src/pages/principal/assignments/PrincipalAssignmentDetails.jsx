import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Edit3,
  FileText,
  GraduationCap,
  Loader2,
  Paperclip,
  RefreshCw,
  User,
  Users,
  XCircle,
} from "lucide-react";

import assignmentsService from "../../../services/assignmentsService";

// ============================================================
// HELPERS
// ============================================================

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function getStatusClass(status) {
  switch (status) {
    case "PUBLISHED":
      return "bg-emerald-100 text-emerald-700";

    case "DRAFT":
      return "bg-amber-100 text-amber-700";

    case "CLOSED":
      return "bg-slate-100 text-slate-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

// ============================================================
// COMPONENT
// ============================================================

export default function PrincipalAssignmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  // ==========================================================
  // LOAD ASSIGNMENT
  // ==========================================================

  const loadAssignment = async ({
    showLoader = true,
  } = {}) => {
    try {
      setError("");

      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const data =
        await assignmentsService.getById(id);

      setAssignment(data);
    } catch (err) {
      console.error(
        "Failed to load assignment:",
        err,
      );

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Unable to load assignment.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadAssignment();
    }
  }, [id]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-slate-50 p-6">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2
            size={32}
            className="animate-spin text-indigo-600"
          />

          <p className="text-sm">
            Loading assignment...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error && !assignment) {
    return (
      <div className="min-h-full bg-slate-50 p-6">

        <button
          type="button"
          onClick={() =>
            navigate("/principal/assignments")
          }
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft size={17} />
          Back to Assignments
        </button>

        <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-red-50 p-6">

          <div className="flex items-start gap-3">

            <AlertCircle
              size={22}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <h2 className="font-semibold text-red-800">
                Unable to load assignment
              </h2>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>

          </div>

        </div>
      </div>
    );
  }

  if (!assignment) {
    return null;
  }

  // ==========================================================
  // DATA
  // ==========================================================

  const status =
    assignment.status || "";

  const statusLabel =
    assignment.status_display ||
    assignment.status ||
    "Unknown";

  const submissionCount =
    Number(
      assignment.submission_count || 0,
    );

  const submittedCount =
    Number(
      assignment.submitted_count || 0,
    );

  const gradedCount =
    Number(
      assignment.graded_count || 0,
    );

  const pendingCount =
    Number(
      assignment.pending_count || 0,
    );

  const lateCount =
    Number(
      assignment.late_count || 0,
    );

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <button
            type="button"
            onClick={() =>
              navigate("/principal/assignments")
            }
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            <ArrowLeft size={17} />
            Back to Assignments
          </button>

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <FileText size={24} />
            </div>

            <div>

              <div className="flex flex-wrap items-center gap-3">

                <h1 className="text-2xl font-bold text-slate-900">
                  {assignment.title ||
                    "Untitled Assignment"}
                </h1>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                    status,
                  )}`}
                >
                  {statusLabel}
                </span>

              </div>

              <p className="mt-1 text-sm text-slate-500">
                Assignment ID: #{assignment.id}
              </p>

            </div>

          </div>

        </div>

        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={() =>
              loadAssignment({
                showLoader: false,
              })
            }
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/principal/assignments/${assignment.id}/edit`,
              )
            }
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Edit3 size={17} />

            Edit Assignment
          </button>

        </div>

      </div>

      {/* ======================================================
          ERROR AFTER REFRESH
      ====================================================== */}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0"
          />

          <p className="flex-1 text-sm">
            {error}
          </p>

          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-md p-1 hover:bg-red-100"
          >
            <XCircle size={18} />
          </button>

        </div>
      )}

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Total Submissions
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {submissionCount}
              </p>
            </div>

            <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
              <Users size={21} />
            </div>

          </div>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Submitted
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {submittedCount}
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
              <FileText size={21} />
            </div>

          </div>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Graded
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {gradedCount}
              </p>
            </div>

            <div className="rounded-lg bg-emerald-50 p-3 text-emerald-600">
              <CheckCircle size={21} />
            </div>

          </div>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Pending
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {pendingCount}
              </p>
            </div>

            <div className="rounded-lg bg-amber-50 p-3 text-amber-600">
              <Clock size={21} />
            </div>

          </div>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-slate-500">
                Late
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {lateCount}
              </p>
            </div>

            <div className="rounded-lg bg-red-50 p-3 text-red-600">
              <Clock size={21} />
            </div>

          </div>

        </div>

      </div>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* ====================================================
            ASSIGNMENT INFORMATION
        ==================================================== */}

        <div className="xl:col-span-2">

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-6 py-5">

              <h2 className="text-lg font-bold text-slate-900">
                Assignment Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Details and instructions for this assignment.
              </p>

            </div>

            <div className="p-6">

              {/* RELATIONSHIPS */}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div className="flex gap-3">

                  <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600">
                    <GraduationCap size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Class
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {assignment.class_level_name ||
                        "—"}
                    </p>
                  </div>

                </div>

                <div className="flex gap-3">

                  <div className="rounded-lg bg-purple-50 p-2.5 text-purple-600">
                    <BookOpen size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Subject
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {assignment.subject_name ||
                        "—"}
                    </p>
                  </div>

                </div>

                <div className="flex gap-3">

                  <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                    <User size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Teacher
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {assignment.teacher_name ||
                        "—"}
                    </p>
                  </div>

                </div>

                <div className="flex gap-3">

                  <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
                    <Calendar size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Academic Session
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {assignment.academic_session_name ||
                        "—"}
                    </p>
                  </div>

                </div>

                <div className="flex gap-3">

                  <div className="rounded-lg bg-amber-50 p-2.5 text-amber-600">
                    <Calendar size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Term
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {assignment.term_name ||
                        "—"}
                    </p>
                  </div>

                </div>

                <div className="flex gap-3">

                  <div className="rounded-lg bg-slate-100 p-2.5 text-slate-600">
                    <FileText size={19} />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Maximum Score
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {assignment.maximum_score ??
                        "—"}
                    </p>
                  </div>

                </div>

              </div>

              {/* DIVIDER */}

              <div className="my-6 border-t border-slate-200" />

              {/* DATES */}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Assigned Date
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formatDate(
                      assignment.assigned_date,
                    )}
                  </p>

                </div>

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Due Date
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formatDateTime(
                      assignment.due_date,
                    )}
                  </p>

                </div>

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Late Submission
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {assignment.allow_late_submission
                      ? "Allowed"
                      : "Not Allowed"}
                  </p>

                </div>

                <div>

                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Created
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-800">
                    {formatDateTime(
                      assignment.created_at,
                    )}
                  </p>

                </div>

              </div>

              {/* DIVIDER */}

              <div className="my-6 border-t border-slate-200" />

              {/* INSTRUCTIONS */}

              <div>

                <div className="mb-3 flex items-center gap-2">

                  <FileText
                    size={18}
                    className="text-indigo-600"
                  />

                  <h3 className="font-semibold text-slate-900">
                    Instructions
                  </h3>

                </div>

                <div className="rounded-lg bg-slate-50 p-4">

                  {assignment.instructions ? (
                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                      {assignment.instructions}
                    </p>
                  ) : (
                    <p className="text-sm italic text-slate-400">
                      No instructions were provided.
                    </p>
                  )}

                </div>

              </div>

              {/* ATTACHMENT */}

              {assignment.attachment && (
                <div className="mt-6">

                  <div className="mb-3 flex items-center gap-2">

                    <Paperclip
                      size={18}
                      className="text-indigo-600"
                    />

                    <h3 className="font-semibold text-slate-900">
                      Attachment
                    </h3>

                  </div>

                  <a
                    href={assignment.attachment}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                  >
                    <Paperclip size={17} />

                    Open Attachment
                  </a>

                </div>
              )}

            </div>

          </div>

        </div>

        {/* ====================================================
            SUBMISSION OVERVIEW
        ==================================================== */}

        <div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-6 py-5">

              <h2 className="text-lg font-bold text-slate-900">
                Submission Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current student submission status.
              </p>

            </div>

            <div className="space-y-4 p-6">

              {/* TOTAL */}

              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">

                <div className="flex items-center gap-3">

                  <Users
                    size={19}
                    className="text-slate-500"
                  />

                  <span className="text-sm font-medium text-slate-700">
                    Total
                  </span>

                </div>

                <span className="font-bold text-slate-900">
                  {submissionCount}
                </span>

              </div>

              {/* SUBMITTED */}

              <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4">

                <div className="flex items-center gap-3">

                  <FileText
                    size={19}
                    className="text-blue-600"
                  />

                  <span className="text-sm font-medium text-blue-800">
                    Submitted
                  </span>

                </div>

                <span className="font-bold text-blue-900">
                  {submittedCount}
                </span>

              </div>

              {/* GRADED */}

              <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-4">

                <div className="flex items-center gap-3">

                  <CheckCircle
                    size={19}
                    className="text-emerald-600"
                  />

                  <span className="text-sm font-medium text-emerald-800">
                    Graded
                  </span>

                </div>

                <span className="font-bold text-emerald-900">
                  {gradedCount}
                </span>

              </div>

              {/* PENDING */}

              <div className="flex items-center justify-between rounded-lg bg-amber-50 p-4">

                <div className="flex items-center gap-3">

                  <Clock
                    size={19}
                    className="text-amber-600"
                  />

                  <span className="text-sm font-medium text-amber-800">
                    Pending
                  </span>

                </div>

                <span className="font-bold text-amber-900">
                  {pendingCount}
                </span>

              </div>

              {/* LATE */}

              <div className="flex items-center justify-between rounded-lg bg-red-50 p-4">

                <div className="flex items-center gap-3">

                  <Clock
                    size={19}
                    className="text-red-600"
                  />

                  <span className="text-sm font-medium text-red-800">
                    Late
                  </span>

                </div>

                <span className="font-bold text-red-900">
                  {lateCount}
                </span>

              </div>

            </div>

          </div>

          {/* STATUS CARD */}

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <h3 className="font-semibold text-slate-900">
              Assignment Status
            </h3>

            <div className="mt-4">

              <span
                className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${getStatusClass(
                  status,
                )}`}
              >
                {statusLabel}
              </span>

            </div>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              {status === "PUBLISHED" &&
                "This assignment is currently visible to eligible students."}

              {status === "DRAFT" &&
                "This assignment is still in draft status."}

              {status === "CLOSED" &&
                "This assignment has been closed."}

              {![
                "PUBLISHED",
                "DRAFT",
                "CLOSED",
              ].includes(status) &&
                "The current assignment status is displayed above."}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}