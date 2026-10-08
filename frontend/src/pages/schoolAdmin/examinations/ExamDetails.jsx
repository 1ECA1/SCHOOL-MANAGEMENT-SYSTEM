import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  Clock,
  Edit,
  FileText,
  GraduationCap,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  BookOpen,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";

import {
  getExamination,
  getExaminationSubjects,
  deleteExaminationSubject,
} from "../../../services/examinationsService";

// ============================================================
// HELPERS
// ============================================================

const formatDate = (dateString) => {
  if (!dateString) return "—";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (timeString) => {
  if (!timeString) return "—";

  const parts = String(timeString).split(":");

  if (parts.length < 2) {
    return timeString;
  }

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return timeString;
  }

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
};

const getTypeLabel = (exam) => {
  if (exam?.examination_type_display) {
    return exam.examination_type_display;
  }

  const labels = {
    FIRST_CA: "First Continuous Assessment",
    SECOND_CA: "Second Continuous Assessment",
    MID_TERM: "Mid-Term Examination",
    MOCK: "Mock Examination",
    TERMINAL: "Terminal Examination",
    PROMOTION: "Promotion Examination",
    ENTRANCE: "Entrance Examination",
  };

  return (
    labels[exam?.examination_type] ||
    exam?.examination_type ||
    "—"
  );
};

const getSubjectsArray = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

// ============================================================
// COMPONENT
// ============================================================

export default function ExamDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [exam, setExam] = useState(null);
  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [deletingSubjectId, setDeletingSubjectId] = useState(null);

  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const loadExam = useCallback(
    async ({ silent = false } = {}) => {
      if (!id) {
        setError("No examination ID was provided.");
        setLoading(false);
        return;
      }

      try {
        if (!silent) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const [examData, subjectData] = await Promise.all([
          getExamination(id),
          getExaminationSubjects(),
        ]);

        setExam(examData);
        setSubjects(getSubjectsArray(subjectData));
      } catch (err) {
        console.error(
          "Failed to load examination details:",
          err
        );

        const status = err?.response?.status;

        if (status === 401) {
          setError(
            "Your session has expired. Please log in again and return to this page."
          );
        } else if (status === 403) {
          setError(
            "You do not have permission to view this examination."
          );
        } else if (status === 404) {
          setError("The examination could not be found.");
        } else {
          setError(
            err?.response?.data?.detail ||
              err?.response?.data?.message ||
              "Failed to load examination details."
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    loadExam();
  }, [loadExam]);

  // ==========================================================
  // EXAM SUBJECTS
  // ==========================================================

  const examSubjects = useMemo(() => {
    if (!exam?.id) return [];

    return subjects
      .filter((item) => {
        return Number(item.examination) === Number(exam.id);
      })
      .sort((a, b) => {
        const dateA = a.examination_date || "";
        const dateB = b.examination_date || "";

        if (dateA !== dateB) {
          return dateA.localeCompare(dateB);
        }

        return String(a.start_time || "").localeCompare(
          String(b.start_time || "")
        );
      });
  }, [exam, subjects]);

  // ==========================================================
  // SUBJECT NAME
  // ==========================================================

  const getSubjectName = (subject) => {
    return (
      subject.subject_name ||
      subject.subject?.name ||
      subject.subject_title ||
      `Subject #${subject.subject ?? "—"}`
    );
  };

  // ==========================================================
  // DELETE SUBJECT
  // ==========================================================

  const handleDeleteSubject = async (subject) => {
    if (!subject?.id) {
      return;
    }

    const subjectName = getSubjectName(subject);

    const confirmed = window.confirm(
      `Are you sure you want to remove "${subjectName}" from this examination?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleteError("");
      setDeletingSubjectId(subject.id);

      await deleteExaminationSubject(subject.id);

      setSubjects((previous) =>
        previous.filter(
          (item) => Number(item.id) !== Number(subject.id)
        )
      );
    } catch (err) {
      console.error(
        "Failed to delete examination subject:",
        err
      );

      setDeleteError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to delete the examination subject. Please try again."
      );
    } finally {
      setDeletingSubjectId(null);
    }
  };

  // ==========================================================
  // STATS
  // ==========================================================

  const subjectCount = examSubjects.length;

  const totalMaximumScore = useMemo(() => {
    return examSubjects.reduce((total, subject) => {
      const score = Number(subject.maximum_score);

      return total + (Number.isNaN(score) ? 0 : score);
    }, 0);
  }, [examSubjects]);

  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-text">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />

            <p className="text-sm text-text/60">
              Loading examination details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR STATE
  // ==========================================================

  if (error && !exam) {
    return (
      <div className="min-h-screen bg-background px-4 py-6 text-text sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/school-admin/examinations-results/exams"
              )
            }
            className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text/70 transition hover:bg-card hover:text-text"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Exams
          </button>

          <div className="rounded-2xl border border-red-200 bg-card p-8 shadow-sm dark:border-red-900/40">
            <div className="mx-auto flex max-w-lg flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
              </div>

              <h1 className="text-xl font-semibold">
                Unable to Load Examination
              </h1>

              <p className="mt-2 text-sm text-text/60">
                {error}
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => loadExam()}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/school-admin/examinations-results/exams"
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-text/10 bg-card px-4 py-2.5 text-sm font-semibold transition hover:bg-background"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Exams
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-screen bg-background px-4 py-6 text-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/school-admin/examinations-results/exams"
                )
              }
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-text/10 bg-card transition hover:bg-background"
              title="Back to Exams"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {exam?.name || "Examination Details"}
                </h1>
              </div>

              <p className="mt-1 text-sm text-text/60">
                View examination information and scheduled subjects.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => loadExam({ silent: true })}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-lg border border-text/10 bg-card px-4 py-2.5 text-sm font-medium transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/school-admin/examinations-results/exams/${exam.id}/edit`
                )
              }
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <Edit className="h-4 w-4" />
              Edit Exam
            </button>
          </div>
        </div>

        {/* ================================================== */}
        {/* ERROR BANNER */}
        {/* ================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              <p className="font-medium">
                Some information could not be loaded.
              </p>

              <p className="mt-1 opacity-80">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* DELETE ERROR */}
        {/* ================================================== */}

        {deleteError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              <p className="font-medium">
                Unable to delete subject
              </p>

              <p className="mt-1 opacity-80">
                {deleteError}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDeleteError("")}
              className="rounded-md p-1 transition hover:bg-red-100 dark:hover:bg-red-900/30"
              title="Dismiss"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* ================================================== */}
        {/* STATUS BAR */}
        {/* ================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Published */}
          <div className="rounded-xl border border-text/10 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  exam?.is_published
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-amber-100 dark:bg-amber-900/30"
                }`}
              >
                {exam?.is_published ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                )}
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text/50">
                  Publication
                </p>

                <p className="mt-0.5 text-sm font-semibold">
                  {exam?.is_published
                    ? "Published"
                    : "Draft"}
                </p>
              </div>
            </div>
          </div>

          {/* Active */}
          <div className="rounded-xl border border-text/10 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  exam?.is_active
                    ? "bg-blue-100 dark:bg-blue-900/30"
                    : "bg-gray-100 dark:bg-gray-900/30"
                }`}
              >
                {exam?.is_active ? (
                  <ShieldCheck className="h-5 w-5 text-primary" />
                ) : (
                  <XCircle className="h-5 w-5 text-text/40" />
                )}
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text/50">
                  Status
                </p>

                <p className="mt-0.5 text-sm font-semibold">
                  {exam?.is_active
                    ? "Active"
                    : "Inactive"}
                </p>
              </div>
            </div>
          </div>

          {/* Subjects */}
          <div className="rounded-xl border border-text/10 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text/50">
                  Subjects
                </p>

                <p className="mt-0.5 text-sm font-semibold">
                  {subjectCount}
                </p>
              </div>
            </div>
          </div>

          {/* Total Score */}
          <div className="rounded-xl border border-text/10 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                <FileText className="h-5 w-5 text-secondary" />
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-text/50">
                  Scheduled Marks
                </p>

                <p className="mt-0.5 text-sm font-semibold">
                  {totalMaximumScore > 0
                    ? totalMaximumScore.toLocaleString()
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* EXAMINATION INFORMATION */}
        {/* ================================================== */}

        <section className="rounded-2xl border border-text/10 bg-card shadow-sm">
          <div className="border-b border-text/10 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>

              <div>
                <h2 className="font-semibold">
                  Examination Information
                </h2>

                <p className="text-sm text-text/50">
                  Basic information about this examination.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              label="Examination Name"
              value={exam?.name}
              icon={FileText}
            />

            <InfoItem
              label="Examination Type"
              value={getTypeLabel(exam)}
              icon={BookOpen}
            />

            <InfoItem
              label="Class"
              value={
                exam?.class_level_name ||
                exam?.class_name ||
                (exam?.class_level
                  ? `Class #${exam.class_level}`
                  : "—")
              }
              icon={GraduationCap}
            />

            <InfoItem
              label="Academic Session"
              value={
                exam?.academic_session_name ||
                (exam?.academic_session
                  ? `Session #${exam.academic_session}`
                  : "—")
              }
              icon={CalendarDays}
            />

            <InfoItem
              label="Term"
              value={
                exam?.term_name ||
                (exam?.term
                  ? `Term #${exam.term}`
                  : "—")
              }
              icon={CalendarDays}
            />

            <InfoItem
              label="Examination Period"
              value={
                exam?.start_date && exam?.end_date
                  ? `${formatDate(
                      exam.start_date
                    )} – ${formatDate(
                      exam.end_date
                    )}`
                  : "—"
              }
              icon={CalendarDays}
            />
          </div>

          {exam?.description && (
            <div className="border-t border-text/10 px-5 py-5 sm:px-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text/50">
                Description
              </p>

              <p className="whitespace-pre-wrap text-sm leading-6 text-text/75">
                {exam.description}
              </p>
            </div>
          )}
        </section>

        {/* ================================================== */}
        {/* SCHEDULED SUBJECTS */}
        {/* ================================================== */}

        <section className="rounded-2xl border border-text/10 bg-card shadow-sm">
          <div className="flex flex-col gap-4 border-b border-text/10 px-5 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                <BookOpen className="h-5 w-5 text-secondary" />
              </div>

              <div>
                <h2 className="font-semibold">
                  Scheduled Subjects
                </h2>

                <p className="text-sm text-text/50">
                  Subjects included in this examination schedule.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/school-admin/examinations-results/exams/${exam.id}/subjects/add`
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Add Subject
            </button>
          </div>

          {/* ================================================= */}
          {/* EMPTY STATE */}
          {/* ================================================= */}

          {examSubjects.length === 0 ? (
            <div className="px-6 py-14">
              <div className="mx-auto flex max-w-md flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <BookOpen className="h-7 w-7 text-primary" />
                </div>

                <h3 className="text-base font-semibold">
                  No Subjects Scheduled
                </h3>

                <p className="mt-2 text-sm leading-6 text-text/60">
                  This examination does not have any subjects scheduled
                  yet. Add the subjects that students will take.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/school-admin/examinations-results/exams/${exam.id}/subjects/add`
                    )
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Add First Subject
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ================================================= */}
              {/* DESKTOP TABLE */}
              {/* ================================================= */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[1000px] text-left">
                  <thead>
                    <tr className="border-b border-text/10 bg-background/60">
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text/50">
                        Subject
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text/50">
                        Date
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text/50">
                        Time
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text/50">
                        Venue
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text/50">
                        Max Score
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text/50">
                        Pass Mark
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-text/50">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-text/10">
                    {examSubjects.map((subject) => {
                      const isDeleting =
                        deletingSubjectId === subject.id;

                      return (
                        <tr
                          key={subject.id}
                          className="transition hover:bg-background/60"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <BookOpen className="h-4 w-4 text-primary" />
                              </div>

                              <div>
                                <p className="font-medium">
                                  {getSubjectName(subject)}
                                </p>

                                {subject.subject_code && (
                                  <p className="mt-0.5 text-xs text-text/50">
                                    {subject.subject_code}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm">
                            {formatDate(
                              subject.examination_date
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-text/40" />

                              <span>
                                {formatTime(
                                  subject.start_time
                                )}
                                {" – "}
                                {formatTime(
                                  subject.end_time
                                )}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-text/40" />

                              <span>
                                {subject.venue ||
                                  "Not specified"}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm font-medium">
                            {subject.maximum_score ?? "—"}
                          </td>

                          <td className="px-5 py-4 text-sm font-medium">
                            {subject.pass_mark ?? "—"}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `/school-admin/examinations-results/exams/${exam.id}/subjects/${subject.id}/edit`
                                  )
                                }
                                disabled={isDeleting}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-text/10 px-3 py-2 text-xs font-semibold transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Edit className="h-3.5 w-3.5" />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteSubject(
                                    subject
                                  )
                                }
                                disabled={isDeleting}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                              >
                                {isDeleting ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ================================================= */}
              {/* MOBILE CARDS */}
              {/* ================================================= */}

              <div className="divide-y divide-text/10 md:hidden">
                {examSubjects.map((subject) => {
                  const isDeleting =
                    deletingSubjectId === subject.id;

                  return (
                    <div
                      key={subject.id}
                      className="p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate font-semibold">
                              {getSubjectName(subject)}
                            </h3>

                            {subject.subject_code && (
                              <p className="mt-0.5 text-xs text-text/50">
                                {subject.subject_code}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/school-admin/examinations-results/exams/${exam.id}/subjects/${subject.id}/edit`
                            )
                          }
                          disabled={isDeleting}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-text/10 transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
                          title="Edit subject"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <DetailCard
                          icon={CalendarDays}
                          label="Date"
                          value={formatDate(
                            subject.examination_date
                          )}
                        />

                        <DetailCard
                          icon={Clock}
                          label="Time"
                          value={`${formatTime(
                            subject.start_time
                          )} – ${formatTime(
                            subject.end_time
                          )}`}
                        />

                        <DetailCard
                          icon={MapPin}
                          label="Venue"
                          value={
                            subject.venue ||
                            "Not specified"
                          }
                        />

                        <DetailCard
                          icon={FileText}
                          label="Maximum"
                          value={
                            subject.maximum_score ?? "—"
                          }
                        />

                        <DetailCard
                          icon={ShieldCheck}
                          label="Pass Mark"
                          value={
                            subject.pass_mark ?? "—"
                          }
                        />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/school-admin/examinations-results/exams/${exam.id}/subjects/${subject.id}/edit`
                            )
                          }
                          disabled={isDeleting}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-text/10 px-3 py-2.5 text-sm font-semibold transition hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteSubject(
                              subject
                            )
                          }
                          disabled={isDeleting}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

// ============================================================
// INFO ITEM
// ============================================================

function InfoItem({ label, value, icon: Icon }) {
  return (
    <div className="border-b border-text/10 px-5 py-4 last:border-b-0 sm:px-6 lg:nth-[3n]:border-b-0">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background">
            <Icon className="h-4 w-4 text-text/50" />
          </div>
        )}

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text/50">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold">
            {value || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MOBILE DETAIL CARD
// ============================================================

function DetailCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-text/10 bg-background/50 p-3">
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon className="h-4 w-4 shrink-0 text-text/45" />
        )}

        <span className="text-xs font-medium text-text/50">
          {label}
        </span>
      </div>

      <p className="mt-1 text-sm font-semibold">
        {value || "—"}
      </p>
    </div>
  );
}