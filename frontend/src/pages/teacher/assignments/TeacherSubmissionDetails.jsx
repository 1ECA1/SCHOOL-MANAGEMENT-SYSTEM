
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  MessageSquare,
  RefreshCw,
  Save,
  Send,
  UserRound,
} from "lucide-react";

import assignmentsService from "../../../services/assignmentsService";

// ============================================================
// HELPERS
// ============================================================

function getErrorMessage(error) {
  const data = error?.response?.data;

  if (typeof data === "string") {
    return data;
  }

  if (data && typeof data === "object") {
    return Object.entries(data)
      .map(([field, value]) => {
        const message = Array.isArray(value)
          ? value.join(", ")
          : typeof value === "string"
            ? value
            : JSON.stringify(value);

        return `${field}: ${message}`;
      })
      .join(" | ");
  }

  return error?.message || "Something went wrong. Please try again.";
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function getStatusLabel(status) {
  const labels = {
    SUBMITTED: "Submitted",
    LATE: "Submitted late",
    GRADED: "Graded",
    RETURNED: "Returned",
  };

  return labels[status] || status || "Unknown";
}

function getStatusClasses(status) {
  const classes = {
    SUBMITTED: "bg-blue-50 text-blue-700 ring-blue-200",
    LATE: "bg-amber-50 text-amber-700 ring-amber-200",
    GRADED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    RETURNED: "bg-purple-50 text-purple-700 ring-purple-200",
  };

  return classes[status] || "bg-gray-100 text-gray-700 ring-gray-200";
}

function getStudentName(submission) {
  return (
    submission?.student_name ||
    submission?.student_full_name ||
    submission?.student?.full_name ||
    submission?.student?.name ||
    null
  );
}

function getFileUrl(file) {
  if (!file) return "";

  if (typeof file === "string") {
    return file;
  }

  return file.url || file.file || "";
}

// ============================================================
// REUSABLE COMPONENTS
// ============================================================

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${getStatusClasses(
        status,
      )}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold text-gray-900">
            {value || "Not available"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function TeacherSubmissionDetails() {
  const { id: assignmentId, submissionId } = useParams();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [assignment, setAssignment] = useState(null);

  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState("SUBMITTED");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ----------------------------------------------------------
  // LOAD SUBMISSION AND ASSIGNMENT
  // ----------------------------------------------------------

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const submissionData =
        await assignmentsService.getSubmissionById(submissionId);

      if (!submissionData) {
        throw new Error("Submission was not found.");
      }

      // Guard against opening a submission through the wrong
      // assignment URL.
      if (
        submissionData.assignment != null &&
        String(submissionData.assignment) !== String(assignmentId)
      ) {
        throw new Error(
          "This submission does not belong to the selected assignment.",
        );
      }

      const assignmentData =
        await assignmentsService.getById(assignmentId);

      setSubmission(submissionData);
      setAssignment(assignmentData);

      setScore(
        submissionData.score === null ||
          submissionData.score === undefined
          ? ""
          : String(submissionData.score),
      );

      setFeedback(submissionData.teacher_feedback || "");
      setStatus(submissionData.status || "SUBMITTED");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [assignmentId, submissionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ----------------------------------------------------------
  // DERIVED VALUES
  // ----------------------------------------------------------

  const maximumScore = useMemo(() => {
    const value =
      submission?.maximum_score ??
      assignment?.maximum_score;

    if (value === null || value === undefined || value === "") {
      return null;
    }

    const number = Number(value);

    return Number.isFinite(number) ? number : null;
  }, [submission, assignment]);

  const studentName = getStudentName(submission);

  const submissionFile = getFileUrl(
    submission?.submission_file,
  );

  const answerText = submission?.answer_text || "";

  const scoreNumber =
    score.trim() === "" ? null : Number(score);

  const scoreError = useMemo(() => {
    if (score.trim() === "") {
      return "";
    }

    if (!Number.isFinite(scoreNumber)) {
      return "Enter a valid numeric score.";
    }

    if (scoreNumber < 0) {
      return "The score cannot be negative.";
    }

    if (
      maximumScore !== null &&
      scoreNumber > maximumScore
    ) {
      return `The score cannot exceed ${maximumScore}.`;
    }

    return "";
  }, [score, scoreNumber, maximumScore]);

  // ----------------------------------------------------------
  // SAVE CHANGES
  // ----------------------------------------------------------

  const saveChanges = async (action) => {
    setError("");
    setSuccess("");

    if (!submission) {
      setError("Submission details have not loaded.");
      return;
    }

    if (saving) return;

    if (action === "grade") {
      if (score.trim() === "") {
        setError("Enter a score before grading this submission.");
        return;
      }

      if (scoreError) {
        setError(scoreError);
        return;
      }
    }

    if (action === "return" && !feedback.trim()) {
      setError(
        "Please enter feedback explaining what the student should review.",
      );
      return;
    }

    const payload = {
      teacher_feedback: feedback,
    };

    if (action === "grade") {
      payload.score = scoreNumber;
      payload.status = "GRADED";
    } else if (action === "return") {
      payload.status = "RETURNED";
    } else {
      // Send the current status explicitly so the backend does
      // not unintentionally change it during a feedback-only save.
      payload.status = status;
    }

    setSaving(true);

    try {
      await assignmentsService.updateSubmission(
        submissionId,
        payload,
      );

      await loadData();

      if (action === "grade") {
        setSuccess("Submission graded successfully.");
      } else if (action === "return") {
        setSuccess("Submission marked as returned.");
      } else {
        setSuccess("Feedback saved successfully.");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[350px] items-center justify-center">
        <div className="text-center">
          <Loader2
            className="mx-auto animate-spin text-indigo-600"
            size={36}
          />

          <p className="mt-3 text-sm text-gray-500">
            Loading submission...
          </p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------
  // ERROR WITHOUT LOADED SUBMISSION
  // ----------------------------------------------------------

  if (!submission) {
    return (
      <div className="mx-auto max-w-3xl p-4 sm:p-6">
        <button
          type="button"
          onClick={() =>
            navigate(`/teacher/assignments/${assignmentId}`)
          }
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft size={17} />
          Back to assignment
        </button>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle
              className="mt-0.5 shrink-0 text-red-600"
              size={22}
            />

            <div>
              <h2 className="font-semibold text-red-800">
                Unable to load submission
              </h2>

              <p className="mt-1 break-words text-sm text-red-700">
                {error || "The requested submission could not be loaded."}
              </p>

              <button
                type="button"
                onClick={loadData}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                <RefreshCw size={16} />
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------
  // PAGE
  // ----------------------------------------------------------

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(`/teacher/assignments/${assignmentId}`)
            }
            title="Back to assignment"
            className="mt-1 rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <p className="text-sm text-gray-500">
              Teacher Portal / Assignments / Submission
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Grade Submission
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {assignment?.title || "Assignment"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={submission.status} />

          <button
            type="button"
            onClick={loadData}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* ALERTS */}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 shrink-0" size={19} />

          <p className="break-words">{error}</p>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          <CheckCircle className="mt-0.5 shrink-0" size={19} />

          <p>{success}</p>
        </div>
      )}

      {/* SUMMARY */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          icon={UserRound}
          label="Student"
          value={
            studentName ||
            (submission.student != null
              ? `Student ID: ${
                  typeof submission.student === "object"
                    ? submission.student.id
                    : submission.student
                }`
              : "Student information unavailable")
          }
        />

        <InfoCard
          icon={FileText}
          label="Assignment"
          value={assignment?.title}
        />

        <InfoCard
          icon={Clock}
          label="Submitted"
          value={formatDate(submission.submitted_at)}
        />

        <InfoCard
          icon={CheckCircle}
          label="Maximum score"
          value={
            maximumScore === null
              ? "Not available"
              : maximumScore
          }
        />
      </div>

      {/* SUBMISSION CONTENT */}

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-5">
        <section className="space-y-6 xl:col-span-3">
          {/* STUDENT ANSWER */}

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="font-semibold text-gray-900">
                Student's Answer
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Review the submitted text and attached file.
              </p>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  Answer text
                </h3>

                {answerText.trim() ? (
                  <div className="whitespace-pre-wrap break-words rounded-lg bg-gray-50 p-4 text-sm leading-7 text-gray-800">
                    {answerText}
                  </div>
                ) : (
                  <p className="rounded-lg bg-gray-50 p-4 text-sm italic text-gray-500">
                    No written answer was provided.
                  </p>
                )}
              </div>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">
                  Attached file
                </h3>

                {submissionFile ? (
                  <a
                    href={submissionFile}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 rounded-lg border border-gray-200 p-4 text-sm text-indigo-700 hover:bg-indigo-50"
                  >
                    <FileText size={22} />

                    <span className="break-all font-medium">
                      Open student submission
                    </span>
                  </a>
                ) : (
                  <p className="rounded-lg bg-gray-50 p-4 text-sm italic text-gray-500">
                    No file was attached.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ASSIGNMENT INFORMATION */}

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="font-semibold text-gray-900">
              Assignment Information
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500">Class</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {assignment?.class_level_name ||
                    assignment?.class_name ||
                    assignment?.class_level?.name ||
                    "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Subject</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {assignment?.subject_name ||
                    assignment?.subject?.name ||
                    "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Academic session</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {assignment?.academic_session_name ||
                    assignment?.session_name ||
                    assignment?.academic_session?.name ||
                    "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Term</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {assignment?.term_name ||
                    assignment?.term?.name ||
                    assignment?.term?.title ||
                    "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Due date</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {formatDate(assignment?.due_date)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Current score</p>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  {submission.score == null
                    ? "Not graded"
                    : `${submission.score}${
                        maximumScore === null
                          ? ""
                          : ` / ${maximumScore}`
                      }`}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* GRADING PANEL */}

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white xl:col-span-2">
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Grade and Feedback
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Record the score and provide feedback to the student.
            </p>
          </div>

          <div className="space-y-5 p-5">
            {/* SCORE */}

            <div>
              <label
                htmlFor="submission-score"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Score
                {maximumScore !== null &&
                  ` (maximum ${maximumScore})`}
              </label>

              <input
                id="submission-score"
                type="number"
                min="0"
                max={maximumScore ?? undefined}
                step="0.01"
                inputMode="decimal"
                value={score}
                onChange={(event) => {
                  setScore(event.target.value);
                  setError("");
                  setSuccess("");
                }}
                placeholder="Enter student's score"
                aria-invalid={Boolean(scoreError)}
                className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                  scoreError
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-100"
                }`}
              />

              {scoreError && (
                <p className="mt-2 text-xs text-red-600">
                  {scoreError}
                </p>
              )}

              <p className="mt-2 text-xs text-gray-500">
                Enter a score between zero and the assignment's maximum.
                Submitting a grade marks the submission as graded.
              </p>
            </div>

            {/* FEEDBACK */}

            <div>
              <label
                htmlFor="teacher-feedback"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700"
              >
                <MessageSquare size={17} />
                Teacher Feedback
              </label>

              <textarea
                id="teacher-feedback"
                rows={7}
                value={feedback}
                onChange={(event) => {
                  setFeedback(event.target.value);
                  setError("");
                  setSuccess("");
                }}
                placeholder="Write comments, corrections, or suggestions for the student..."
                className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-sm leading-6 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <p className="mt-2 text-xs text-gray-500">
                Feedback is optional when grading, but required when
                returning a submission for revision.
              </p>
            </div>

            {/* CURRENT STATUS */}

            <div>
              <label
                htmlFor="submission-status"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Submission status
              </label>

              <select
                id="submission-status"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value);
                  setError("");
                  setSuccess("");
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="SUBMITTED">Submitted</option>
                <option value="LATE">Submitted late</option>
                <option value="GRADED">Graded</option>
                <option value="RETURNED">Returned</option>
              </select>

              <p className="mt-2 text-xs text-gray-500">
                Use the grading button to grade with a score, or the
                return button to request revisions.
              </p>
            </div>

            {/* ACTIONS */}

            <div className="space-y-3 border-t border-gray-100 pt-5">
              <button
                type="button"
                onClick={() => saveChanges("grade")}
                disabled={
                  saving ||
                  score.trim() === "" ||
                  Boolean(scoreError)
                }
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <CheckCircle size={18} />
                )}

                {saving ? "Saving..." : "Save Grade"}
              </button>

              <button
                type="button"
                onClick={() => saveChanges("feedback")}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}

                Save Feedback / Status
              </button>

              <button
                type="button"
                onClick={() => saveChanges("return")}
                disabled={saving || !feedback.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Send size={18} />
                )}

                Return for Revision
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}