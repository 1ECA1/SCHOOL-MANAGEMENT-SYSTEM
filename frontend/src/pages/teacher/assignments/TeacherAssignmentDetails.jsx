import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle,
  Clock,
  Download,
  Edit3,
  FileText,
  GraduationCap,
  Loader2,
  RefreshCw,
  RotateCcw,
  User,
  Users,
  XCircle,
} from "lucide-react";

import assignmentsService from "../../../services/assignmentsService";

// ============================================================
// HELPERS
// ============================================================

const formatDate = (value, includeTime = false) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  });
};

const formatScore = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return number.toLocaleString("en-NG", {
    maximumFractionDigits: 2,
  });
};

const getAssignmentStatusLabel = (status) => {
  switch (status) {
    case "PUBLISHED":
      return "Published";

    case "DRAFT":
      return "Draft";

    case "CLOSED":
      return "Closed";

    default:
      return status || "Unknown";
  }
};

const getAssignmentStatusClasses = (status) => {
  switch (status) {
    case "PUBLISHED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "DRAFT":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "CLOSED":
      return "border-gray-200 bg-gray-100 text-gray-700";

    default:
      return "border-blue-200 bg-blue-50 text-blue-700";
  }
};

const getSubmissionStatusLabel = (status) => {
  switch (status) {
    case "SUBMITTED":
      return "Submitted";

    case "LATE":
      return "Late";

    case "GRADED":
      return "Graded";

    case "RETURNED":
      return "Returned";

    default:
      return status || "Unknown";
  }
};

const getSubmissionStatusClasses = (status) => {
  switch (status) {
    case "SUBMITTED":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "LATE":
      return "border-orange-200 bg-orange-50 text-orange-700";

    case "GRADED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "RETURNED":
      return "border-purple-200 bg-purple-50 text-purple-700";

    default:
      return "border-gray-200 bg-gray-100 text-gray-700";
  }
};

const getAssignmentClass = (assignment) =>
  assignment?.class_level_name ||
  assignment?.class_name ||
  assignment?.class_level?.name ||
  "—";

const getAssignmentSubject = (assignment) =>
  assignment?.subject_name ||
  assignment?.subject?.name ||
  "—";

const getAssignmentSession = (assignment) =>
  assignment?.academic_session_name ||
  assignment?.session_name ||
  assignment?.academic_session?.name ||
  "—";

const getAssignmentTerm = (assignment) =>
  assignment?.term_name ||
  assignment?.term?.name ||
  assignment?.term?.title ||
  "—";

const getTeacherName = (assignment) =>
  assignment?.teacher_name ||
  assignment?.teacher?.full_name ||
  assignment?.teacher?.name ||
  "—";

const getStudentName = (submission) =>
  submission?.student_name ||
  submission?.student?.full_name ||
  submission?.student?.name ||
  "Unknown Student";

const getStudentAdmissionNumber = (submission) =>
  submission?.admission_number ||
  submission?.student_admission_number ||
  submission?.student?.admission_number ||
  "—";

const getSubmissionArray = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  if (Array.isArray(data?.submissions)) {
    return data.submissions;
  }

  return [];
};

const getCount = (data, fallback = 0) => {
  if (typeof data?.count === "number") {
    return data.count;
  }

  if (Array.isArray(data)) {
    return data.length;
  }

  if (Array.isArray(data?.results)) {
    return data.results.length;
  }

  return fallback;
};

// ============================================================
// COMPONENT
// ============================================================

export default function TeacherAssignmentDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [assignment, setAssignment] =
    useState(null);

  const [submissions, setSubmissions] =
    useState([]);

  const [submissionCount, setSubmissionCount] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [submissionsLoading, setSubmissionsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [submissionError, setSubmissionError] =
    useState("");

  // ----------------------------------------------------------
  // LOAD ASSIGNMENT
  // ----------------------------------------------------------

  const loadAssignment = useCallback(
    async ({ showLoader = true } = {}) => {
      if (!id) {
        setError("Assignment ID is missing.");
        setLoading(false);
        return;
      }

      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const data =
          await assignmentsService.getById(id);

        setAssignment(data);
      } catch (err) {
        console.error(
          "Failed to load assignment:",
          err,
        );

        const message =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Unable to load assignment.";

        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id],
  );

  // ----------------------------------------------------------
  // LOAD SUBMISSIONS
  // ----------------------------------------------------------

  const loadSubmissions =
    useCallback(async () => {
      if (!id) {
        setSubmissionError(
          "Assignment ID is missing.",
        );
        setSubmissionsLoading(false);
        return;
      }

      try {
        setSubmissionsLoading(true);
        setSubmissionError("");

        const data =
          await assignmentsService.getSubmissions({
            assignment: id,
          });

        const rows =
          getSubmissionArray(data);

        setSubmissions(rows);

        setSubmissionCount(
          getCount(data, rows.length),
        );
      } catch (err) {
        console.error(
          "Failed to load assignment submissions:",
          err,
        );

        const message =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Unable to load student submissions.";

        setSubmissionError(message);
      } finally {
        setSubmissionsLoading(false);
      }
    }, [id]);

  // ----------------------------------------------------------
  // INITIAL LOAD
  // ----------------------------------------------------------

  useEffect(() => {
    loadAssignment();
    loadSubmissions();
  }, [
    loadAssignment,
    loadSubmissions,
  ]);

  // ----------------------------------------------------------
  // SUBMISSION SUMMARY
  // ----------------------------------------------------------

  const submissionSummary = useMemo(() => {
    const submitted =
      submissions.filter(
        (item) =>
          item.status === "SUBMITTED",
      ).length;

    const late =
      submissions.filter(
        (item) =>
          item.status === "LATE",
      ).length;

    const graded =
      submissions.filter(
        (item) =>
          item.status === "GRADED",
      ).length;

    const returned =
      submissions.filter(
        (item) =>
          item.status === "RETURNED",
      ).length;

    return {
      total:
        submissionCount ||
        submissions.length,
      submitted,
      late,
      graded,
      returned,
    };
  }, [
    submissions,
    submissionCount,
  ]);

  // ----------------------------------------------------------
  // OPEN / GRADE SUBMISSION
  // ----------------------------------------------------------

  const handleOpenSubmission = (submissionId) => {
    if (!submissionId) {
      return;
    }

    navigate(
      `submissions/${submissionId}`,
    );
  };

  // ----------------------------------------------------------
  // REFRESH EVERYTHING
  // ----------------------------------------------------------

  const handleRefresh = async () => {
    await Promise.all([
      loadAssignment({
        showLoader: false,
      }),
      loadSubmissions(),
    ]);
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-full bg-gray-50 p-4 md:p-6">
        <div className="mx-auto flex min-h-[500px] max-w-7xl items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <Loader2
              size={32}
              className="animate-spin text-indigo-600"
            />

            <p className="text-sm">
              Loading assignment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR / NOT FOUND
  // ==========================================================

  if (error || !assignment) {
    return (
      <div className="min-h-full bg-gray-50 p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <button
            type="button"
            onClick={() => navigate("..")}
            className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-gray-600 hover:bg-white hover:text-gray-900"
          >
            <ArrowLeft size={17} />

            Back to Assignments
          </button>

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
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
                  {error ||
                    "The requested assignment could not be found."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                loadAssignment()
              }
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
            >
              <RefreshCw size={17} />

              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN
  // ==========================================================

  return (
    <div className="min-h-full bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ================================================== */}
        {/* TOP NAVIGATION */}
        {/* ================================================== */}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <button
            type="button"
            onClick={() => navigate("..")}
            className="inline-flex w-fit items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-white hover:text-gray-900"
          >
            <ArrowLeft size={18} />

            Back to Assignments
          </button>

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                navigate("edit")
              }
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Edit3 size={17} />

              Edit Assignment
            </button>
          </div>
        </div>

        {/* ================================================== */}
        {/* ASSIGNMENT HEADER */}
        {/* ================================================== */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 p-5 md:p-6">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

              <div className="flex min-w-0 gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                  <FileText size={27} />
                </div>

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2">

                    <h1 className="text-2xl font-bold text-gray-900">
                      {assignment.title ||
                        "Untitled Assignment"}
                    </h1>

                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getAssignmentStatusClasses(
                        assignment.status,
                      )}`}
                    >
                      {getAssignmentStatusLabel(
                        assignment.status,
                      )}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-gray-500">
                    Assignment #{assignment.id}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 px-4 py-3 lg:min-w-[180px]">

                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                  Maximum Score
                </p>

                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {formatScore(
                    assignment.maximum_score,
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* ASSIGNMENT INFORMATION */}
          {/* ================================================= */}

          <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4 md:p-6">

            <InfoItem
              icon={<BookOpen size={18} />}
              label="Class"
              value={getAssignmentClass(
                assignment,
              )}
            />

            <InfoItem
              icon={<BookOpen size={18} />}
              label="Subject"
              value={getAssignmentSubject(
                assignment,
              )}
            />

            <InfoItem
              icon={<CalendarDays size={18} />}
              label="Academic Session"
              value={getAssignmentSession(
                assignment,
              )}
            />

            <InfoItem
              icon={<CalendarDays size={18} />}
              label="Term"
              value={getAssignmentTerm(
                assignment,
              )}
            />

            <InfoItem
              icon={<User size={18} />}
              label="Teacher"
              value={getTeacherName(
                assignment,
              )}
            />

            <InfoItem
              icon={<CalendarDays size={18} />}
              label="Assigned Date"
              value={formatDate(
                assignment.assigned_date,
                true,
              )}
            />

            <InfoItem
              icon={<Clock size={18} />}
              label="Due Date"
              value={formatDate(
                assignment.due_date,
                true,
              )}
            />

            <InfoItem
              icon={
                assignment.allow_late_submission ? (
                  <CheckCircle size={18} />
                ) : (
                  <XCircle size={18} />
                )
              }
              label="Late Submission"
              value={
                assignment.allow_late_submission
                  ? "Allowed"
                  : "Not Allowed"
              }
            />
          </div>
        </div>

        {/* ================================================== */}
        {/* INSTRUCTIONS */}
        {/* ================================================== */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FileText size={19} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Instructions
              </h2>

              <p className="text-xs text-gray-500">
                Instructions given to students
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-gray-50 p-4">

            {assignment.instructions ? (
              <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                {assignment.instructions}
              </p>
            ) : (
              <p className="text-sm italic text-gray-400">
                No instructions were provided.
              </p>
            )}
          </div>

          {/* ATTACHMENT */}

          {assignment.attachment && (
            <div className="mt-4">

              <a
                href={assignment.attachment}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
              >
                <Download size={17} />

                Open Assignment Attachment
              </a>
            </div>
          )}
        </div>

        {/* ================================================== */}
        {/* SUBMISSION SUMMARY */}
        {/* ================================================== */}

        <div>
          <div className="mb-4">

            <h2 className="text-xl font-bold text-gray-900">
              Student Submissions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              View and grade submissions received for this
              assignment.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

            {/* TOTAL */}

            <SubmissionStat
              icon={<Users size={20} />}
              label="Total"
              value={
                submissionSummary.total
              }
            />

            {/* SUBMITTED */}

            <SubmissionStat
              icon={
                <FileText size={20} />
              }
              label="Submitted"
              value={
                submissionSummary.submitted
              }
            />

            {/* LATE */}

            <SubmissionStat
              icon={<Clock size={20} />}
              label="Late"
              value={
                submissionSummary.late
              }
            />

            {/* GRADED */}

            <SubmissionStat
              icon={
                <CheckCircle size={20} />
              }
              label="Graded"
              value={
                submissionSummary.graded
              }
            />
          </div>
        </div>

        {/* ================================================== */}
        {/* SUBMISSION ERROR */}
        {/* ================================================== */}

        {submissionError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">

            <div className="flex items-start gap-3">

              <AlertCircle
                size={20}
                className="mt-0.5 text-red-600"
              />

              <div>
                <p className="font-semibold text-red-800">
                  Unable to load submissions
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {submissionError}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadSubmissions}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              <RotateCcw size={15} />

              Try Again
            </button>
          </div>
        )}

        {/* ================================================== */}
        {/* SUBMISSIONS TABLE */}
        {/* ================================================== */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {submissionsLoading ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-gray-500">

                <Loader2
                  size={30}
                  className="animate-spin text-indigo-600"
                />

                <p className="text-sm">
                  Loading student submissions...
                </p>
              </div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <GraduationCap
                  size={26}
                />
              </div>

              <h3 className="mt-4 font-semibold text-gray-900">
                No submissions yet
              </h3>

              <p className="mt-2 max-w-md text-sm text-gray-500">
                Students who submit this assignment
                will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* ================================================= */}
              {/* DESKTOP */}
              {/* ================================================= */}

              <div className="hidden overflow-x-auto md:block">

                <table className="min-w-full">

                  <thead className="border-b border-gray-200 bg-gray-50">

                    <tr>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Student
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Submitted
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Score
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {submissions.map(
                      (submission) => (
                        <tr
                          key={
                            submission.id
                          }
                          className="transition hover:bg-gray-50"
                        >
                          {/* STUDENT */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                                <User
                                  size={18}
                                />
                              </div>

                              <div>
                                <p className="font-semibold text-gray-900">
                                  {getStudentName(
                                    submission,
                                  )}
                                </p>

                                <p className="mt-0.5 text-xs text-gray-500">
                                  {getStudentAdmissionNumber(
                                    submission,
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* SUBMITTED */}

                          <td className="px-5 py-4 text-sm text-gray-600">
                            {formatDate(
                              submission.submitted_at ||
                                submission.created_at,
                              true,
                            )}
                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-4">

                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getSubmissionStatusClasses(
                                submission.status,
                              )}`}
                            >
                              {getSubmissionStatusLabel(
                                submission.status,
                              )}
                            </span>
                          </td>

                          {/* SCORE */}

                          <td className="px-5 py-4">

                            {submission.score !==
                              null &&
                            submission.score !==
                              undefined ? (
                              <span className="font-semibold text-gray-900">
                                {formatScore(
                                  submission.score,
                                )}

                                {assignment.maximum_score !==
                                  null &&
                                  assignment.maximum_score !==
                                    undefined &&
                                  assignment.maximum_score !==
                                    "" && (
                                    <span className="ml-1 text-xs font-normal text-gray-400">
                                      /
                                      {formatScore(
                                        assignment.maximum_score,
                                      )}
                                    </span>
                                  )}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">
                                Not graded
                              </span>
                            )}
                          </td>

                          {/* ACTION */}

                          <td className="px-5 py-4 text-right">

                            <button
                              type="button"
                              onClick={() =>
                                handleOpenSubmission(
                                  submission.id,
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                            >
                              <CheckCircle
                                size={15}
                              />

                              Open / Grade
                            </button>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              {/* ================================================= */}
              {/* MOBILE */}
              {/* ================================================= */}

              <div className="divide-y divide-gray-100 md:hidden">

                {submissions.map(
                  (submission) => (
                    <div
                      key={
                        submission.id
                      }
                      className="p-4"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="flex min-w-0 gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                            <User
                              size={18}
                            />
                          </div>

                          <div className="min-w-0">

                            <p className="truncate font-semibold text-gray-900">
                              {getStudentName(
                                submission,
                              )}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {getStudentAdmissionNumber(
                                submission,
                              )}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${getSubmissionStatusClasses(
                            submission.status,
                          )}`}
                        >
                          {getSubmissionStatusLabel(
                            submission.status,
                          )}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">

                        <div>
                          <p className="text-xs text-gray-400">
                            Submitted
                          </p>

                          <p className="mt-1 text-sm font-medium text-gray-700">
                            {formatDate(
                              submission.submitted_at ||
                                submission.created_at,
                              true,
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">
                            Score
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-700">
                            {submission.score !==
                              null &&
                            submission.score !==
                              undefined
                              ? `${formatScore(
                                  submission.score,
                                )} / ${formatScore(
                                  assignment.maximum_score,
                                )}`
                              : "Not graded"}
                          </p>
                        </div>
                      </div>

                      {/* MOBILE ACTION */}

                      <div className="mt-4">

                        <button
                          type="button"
                          onClick={() =>
                            handleOpenSubmission(
                              submission.id,
                            )
                          }
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                        >
                          <CheckCircle
                            size={16}
                          />

                          Open / Grade Submission
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// INFO ITEM
// ============================================================

function InfoItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-gray-800">
          {value}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// SUBMISSION STAT
// ============================================================

function SubmissionStat({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

      <div className="flex items-center justify-between gap-3">

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>
      </div>
    </div>
  );
}