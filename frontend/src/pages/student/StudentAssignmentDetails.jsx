import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import assignmentsService from "../../services/assignmentsService";

const StudentAssignmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [submissionFile, setSubmissionFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================================
  // LOAD ASSIGNMENT
  // ==========================================================

  const loadAssignment = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await assignmentsService.getStudentAssignmentById(id);

      setAssignment(data);

      // Load existing answer into the form.
      if (data?.my_submission) {
        setAnswerText(
          data.my_submission.answer_text || ""
        );
      } else {
        setAnswerText("");
      }
    } catch (err) {
      console.error(
        "Failed to load assignment:",
        err
      );

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to load assignment.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignment();
  }, [id]);

  // ==========================================================
  // DATE FORMAT
  // ==========================================================

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // ==========================================================
  // SUBMISSION STATUS
  // ==========================================================

  const getSubmissionStatus = () => {
    if (!assignment?.my_submission) {
      return null;
    }

    return (
      assignment.my_submission.status_display ||
      assignment.my_submission.status ||
      "Submitted"
    );
  };

  const getStatusClasses = () => {
    const status =
      assignment?.my_submission?.status;

    if (status === "GRADED") {
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    }

    if (status === "RETURNED") {
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    }

    if (status === "LATE") {
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    }

    return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  };

  // ==========================================================
  // SUBMIT / RESUBMIT
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!assignment) {
      return;
    }

    setError("");
    setSuccess("");

    // --------------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------------

    const existingFile =
      assignment?.my_submission?.submission_file;

    if (
      !answerText.trim() &&
      !submissionFile &&
      !existingFile
    ) {
      setError(
        "Please enter an answer or attach a file before submitting."
      );
      return;
    }

    // --------------------------------------------------------
    // BACKEND CAN_SUBMIT CHECK
    // --------------------------------------------------------

    if (!assignment.can_submit) {
      if (
        assignment.is_overdue &&
        !assignment.allow_late_submission
      ) {
        setError(
          "The submission deadline has passed and late submissions are not allowed."
        );
      } else {
        setError(
          "This assignment cannot currently be submitted."
        );
      }

      return;
    }

    // --------------------------------------------------------
    // GRADED / RETURNED CHECK
    // --------------------------------------------------------

    if (
      assignment.my_submission &&
      ["GRADED", "RETURNED"].includes(
        assignment.my_submission.status
      )
    ) {
      setError(
        "This assignment has already been graded or returned and cannot be edited."
      );
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append(
        "assignment",
        assignment.id
      );

      formData.append(
        "answer_text",
        answerText
      );

      if (submissionFile) {
        formData.append(
          "submission_file",
          submissionFile
        );
      }

      // ------------------------------------------------------
      // NEW SUBMISSION
      // ------------------------------------------------------

      if (!assignment.my_submission) {
        await assignmentsService.createSubmission(
          formData
        );

        setSuccess(
          "Assignment submitted successfully."
        );
      }

      // ------------------------------------------------------
      // RESUBMISSION
      // ------------------------------------------------------

      else {
        await assignmentsService.updateMySubmission(
          assignment.my_submission.id,
          formData
        );

        setSuccess(
          "Assignment resubmitted successfully."
        );
      }

      setSubmissionFile(null);

      // Reload assignment so the latest backend state
      // is displayed immediately.
      await loadAssignment();
    } catch (err) {
      console.error(
        "Failed to submit assignment:",
        err
      );

      const responseData =
        err?.response?.data;

      let message =
        responseData?.detail ||
        responseData?.message ||
        "Failed to submit assignment.";

      // ------------------------------------------------------
      // DRF FIELD ERRORS
      // ------------------------------------------------------

      if (
        typeof responseData === "object" &&
        responseData !== null &&
        !responseData?.detail &&
        !responseData?.message
      ) {
        const firstError =
          Object.values(responseData)[0];

        if (Array.isArray(firstError)) {
          message = firstError[0];
        } else if (
          typeof firstError === "string"
        ) {
          message = firstError;
        }
      }

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 text-text">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 h-8 w-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />

          <div className="h-48 animate-pulse rounded-2xl bg-card shadow-sm ring-1 ring-black/5 dark:ring-white/10" />

          <div className="mt-6 h-72 animate-pulse rounded-2xl bg-card shadow-sm ring-1 ring-black/5 dark:ring-white/10" />
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR / NOT FOUND
  // ==========================================================

  if (error && !assignment) {
    return (
      <div className="min-h-screen bg-background p-6 text-text">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() =>
              navigate("/student/assignments")
            }
            className="mb-6 flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            ← Back to Assignments
          </button>

          <div className="rounded-2xl bg-card p-8 text-center shadow-sm ring-1 ring-red-200 dark:ring-red-900/40">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl dark:bg-red-900/30">
              ⚠️
            </div>

            <h2 className="text-xl font-bold">
              Unable to Load Assignment
            </h2>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return null;
  }

  // ==========================================================
  // VARIABLES
  // ==========================================================

  const hasSubmission =
    Boolean(assignment.my_submission);

  const submission =
    assignment.my_submission;

  const submissionStatus =
    submission?.status;

  const isGraded =
    submissionStatus === "GRADED";

  const isReturned =
    submissionStatus === "RETURNED";

  const isPending =
    submissionStatus === "SUBMITTED" ||
    submissionStatus === "LATE";

  const cannotEdit =
    isGraded || isReturned;

  const canSubmit =
    assignment.can_submit === true &&
    !cannotEdit;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-background p-4 text-text sm:p-6">
      <div className="mx-auto max-w-5xl">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              navigate("/student/assignments")
            }
            className="mb-4 flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            ← Back to Assignments
          </button>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="mb-1 text-sm font-medium text-primary">
                {assignment.subject_name}
              </p>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {assignment.title}
              </h1>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {assignment.class_level_name} •{" "}
                {assignment.term_name} •{" "}
                {assignment.academic_session_name}
              </p>
            </div>

            {/* Submission status */}
            {hasSubmission && (
              <span
                className={`inline-flex w-fit items-center rounded-full px-3 py-1.5 text-sm font-semibold ${getStatusClasses()}`}
              >
                {getSubmissionStatus()}
              </span>
            )}
          </div>
        </div>

        {/* ================================================== */}
        {/* ALERTS */}
        {/* ================================================== */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-400">
            <span>✓</span>
            <p>{success}</p>
          </div>
        )}

        {/* ================================================== */}
        {/* ASSIGNMENT INFORMATION */}
        {/* ================================================== */}

        <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-black/5 dark:ring-white/10">

          <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800 sm:px-6">
            <h2 className="text-lg font-semibold">
              Assignment Information
            </h2>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4 sm:p-6">

            {/* Teacher */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Teacher
              </p>

              <p className="mt-1 font-medium">
                {assignment.teacher_name || "—"}
              </p>
            </div>

            {/* Class */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Class
              </p>

              <p className="mt-1 font-medium">
                {assignment.class_level_name || "—"}
              </p>
            </div>

            {/* Assigned */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Assigned
              </p>

              <p className="mt-1 font-medium">
                {formatDate(
                  assignment.assigned_date
                )}
              </p>
            </div>

            {/* Maximum Score */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Maximum Score
              </p>

              <p className="mt-1 font-medium">
                {assignment.maximum_score} marks
              </p>
            </div>
          </div>

          {/* Due date */}
          <div className="border-t border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-800 dark:bg-gray-900/40 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Due Date
                </p>

                <p
                  className={`mt-1 font-semibold ${
                    assignment.is_overdue
                      ? "text-red-600 dark:text-red-400"
                      : "text-text"
                  }`}
                >
                  {formatDateTime(
                    assignment.due_date
                  )}
                </p>
              </div>

              {assignment.is_overdue && (
                <span className="w-fit rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  Overdue
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* INSTRUCTIONS */}
        {/* ================================================== */}

        <div className="mt-6 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-black/5 dark:ring-white/10 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold">
            Instructions
          </h2>

          <div className="whitespace-pre-wrap text-sm leading-7 text-gray-700 dark:text-gray-300">
            {assignment.instructions ||
              "No instructions provided."}
          </div>
        </div>

        {/* ================================================== */}
        {/* ASSIGNMENT ATTACHMENT */}
        {/* ================================================== */}

        {assignment.attachment && (
          <div className="mt-6 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-black/5 dark:ring-white/10 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold">
              Assignment Attachment
            </h2>

            <a
              href={assignment.attachment}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-xl border border-gray-200 p-4 transition hover:border-primary hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xl">
                📎
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  Assignment File
                </p>

                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  Click to open or download the attachment
                </p>
              </div>

              <span className="text-sm font-semibold text-primary">
                Open →
              </span>
            </a>
          </div>
        )}

        {/* ================================================== */}
        {/* MY SUBMISSION */}
        {/* ================================================== */}

        {hasSubmission && (
          <div className="mt-6 rounded-2xl bg-card shadow-sm ring-1 ring-black/5 dark:ring-white/10">

            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800 sm:px-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                <h2 className="text-lg font-semibold">
                  My Submission
                </h2>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses()}`}
                >
                  {getSubmissionStatus()}
                </span>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">

              {/* Submitted */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Submitted
                </p>

                <p className="mt-1 text-sm font-medium">
                  {formatDateTime(
                    submission.submitted_at
                  )}
                </p>
              </div>

              {/* Answer */}
              {submission.answer_text && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Your Answer
                  </p>

                  <div className="whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm leading-6 dark:bg-gray-900">
                    {submission.answer_text}
                  </div>
                </div>
              )}

              {/* Submitted file */}
              {submission.submission_file && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Submitted File
                  </p>

                  <a
                    href={submission.submission_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-primary hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
                  >
                    📄 View Submitted File
                  </a>
                </div>
              )}

              {/* ================================================== */}
              {/* GRADED RESULT */}
              {/* ================================================== */}

              {isGraded &&
                submission.score !== null &&
                submission.score !== undefined && (
                  <div className="rounded-xl bg-primary/5 p-5 dark:bg-primary/10">

                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Your Score
                    </p>

                    <p className="mt-1 text-3xl font-bold text-primary">
                      {submission.score}

                      <span className="ml-1 text-base font-medium text-gray-500 dark:text-gray-400">
                        / {assignment.maximum_score}
                      </span>
                    </p>
                  </div>
                )}

              {/* Teacher feedback */}
              {submission.teacher_feedback && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Teacher Feedback
                  </p>

                  <div className="rounded-xl border border-gray-200 p-4 text-sm leading-6 dark:border-gray-800">
                    {submission.teacher_feedback}
                  </div>
                </div>
              )}

              {/* Graded date */}
              {submission.graded_at && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Graded
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {formatDateTime(
                      submission.graded_at
                    )}
                  </p>
                </div>
              )}

              {/* Pending message */}
              {isPending && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Your submission is awaiting grading.
                  </p>

                  <p className="mt-1 text-xs text-blue-700 dark:text-blue-400">
                    You can resubmit your assignment while
                    the submission is still awaiting grading.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* SUBMISSION FORM */}
        {/* ================================================== */}

        {canSubmit && (
          <form
            onSubmit={handleSubmit}
            className="mt-6 overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-black/5 dark:ring-white/10"
          >

            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800 sm:px-6">

              <h2 className="text-lg font-semibold">
                {hasSubmission
                  ? "Resubmit Assignment"
                  : "Submit Assignment"}
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {hasSubmission
                  ? "You can update your answer or replace your submitted file."
                  : "Submit your answer and/or upload your assignment file."}
              </p>
            </div>

            <div className="space-y-5 p-5 sm:p-6">

              {/* Answer */}
              <div>
                <label
                  htmlFor="answer_text"
                  className="mb-2 block text-sm font-semibold"
                >
                  Your Answer
                </label>

                <textarea
                  id="answer_text"
                  value={answerText}
                  onChange={(event) =>
                    setAnswerText(
                      event.target.value
                    )
                  }
                  disabled={submitting}
                  rows={8}
                  placeholder="Type your answer here..."
                  className="w-full rounded-xl border border-gray-300 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700"
                />
              </div>

              {/* File */}
              <div>
                <label
                  htmlFor="submission_file"
                  className="mb-2 block text-sm font-semibold"
                >
                  Upload File
                </label>

                <input
                  id="submission_file"
                  type="file"
                  onChange={(event) =>
                    setSubmissionFile(
                      event.target.files?.[0] ||
                        null
                    )
                  }
                  disabled={submitting}
                  className="block w-full cursor-pointer rounded-xl border border-gray-300 bg-background text-sm text-gray-600 file:mr-4 file:border-0 file:bg-primary file:px-4 file:py-2.5 file:font-medium file:text-white hover:file:bg-primary/90 dark:border-gray-700 dark:text-gray-400"
                />

                {submissionFile && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Selected:{" "}
                    <span className="font-medium">
                      {submissionFile.name}
                    </span>
                  </p>
                )}
              </div>

              {/* Late notice */}
              {assignment.is_overdue &&
                assignment.allow_late_submission && (
                  <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700 dark:border-orange-900/40 dark:bg-orange-950/30 dark:text-orange-400">
                    This assignment is overdue, but late
                    submissions are allowed.
                  </div>
                )}

              {/* Submit */}
              <div className="flex justify-end border-t border-gray-200 pt-5 dark:border-gray-800">

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Submitting..."
                    : hasSubmission
                      ? "Resubmit Assignment"
                      : "Submit Assignment"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ================================================== */}
        {/* GRADED / RETURNED */}
        {/* ================================================== */}

        {cannotEdit && (
          <div
            className={`mt-6 rounded-2xl border p-5 ${
              isGraded
                ? "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-950/20"
                : "border-purple-200 bg-purple-50 dark:border-purple-900/40 dark:bg-purple-950/20"
            }`}
          >
            <div className="flex items-start gap-3">

              <div className="text-xl">
                {isGraded ? "✓" : "↩"}
              </div>

              <div>
                <h3
                  className={`font-semibold ${
                    isGraded
                      ? "text-green-800 dark:text-green-300"
                      : "text-purple-800 dark:text-purple-300"
                  }`}
                >
                  {isGraded
                    ? "Submission Graded"
                    : "Submission Returned"}
                </h3>

                <p
                  className={`mt-1 text-sm ${
                    isGraded
                      ? "text-green-700 dark:text-green-400"
                      : "text-purple-700 dark:text-purple-400"
                  }`}
                >
                  {isGraded
                    ? "Your assignment has been graded. Your score and teacher feedback are shown above."
                    : "Your assignment has been returned and can no longer be edited."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* DEADLINE PASSED — NO SUBMISSION */}
        {/* ================================================== */}

        {!hasSubmission &&
          !assignment.can_submit &&
          assignment.is_overdue &&
          !assignment.allow_late_submission && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/40 dark:bg-red-950/20">
              <div className="flex items-start gap-3">

                <div className="text-xl">
                  ⏰
                </div>

                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-300">
                    Submission Closed
                  </h3>

                  <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                    The deadline for this assignment has
                    passed and late submissions are not
                    allowed.
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* ================================================== */}
        {/* ASSIGNMENT NOT CURRENTLY SUBMITTABLE */}
        {/* ================================================== */}

        {!hasSubmission &&
          !assignment.can_submit &&
          !assignment.is_overdue && (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900/40">
              <div className="flex items-start gap-3">

                <div className="text-xl">
                  ℹ️
                </div>

                <div>
                  <h3 className="font-semibold">
                    Submission Unavailable
                  </h3>

                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    This assignment is not currently
                    available for submission.
                  </p>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default StudentAssignmentDetails;