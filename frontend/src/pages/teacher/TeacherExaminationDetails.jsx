import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Loader2,
  MapPin,
  BookOpen,
  GraduationCap,
  FileText,
  AlertCircle,
} from "lucide-react";

import {
  getExamination,
  getExaminationSubjects,
} from "../../services/examinationsService";

// ============================================================
// HELPERS
// ============================================================

const formatDate = (dateString) => {
  if (!dateString) return "—";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (timeString) => {
  if (!timeString) return "—";

  const [hours, minutes] = timeString
    .split(":")
    .map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return timeString;
  }

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const getExaminationTypeLabel = (exam) => {
  if (exam?.examination_type_display) {
    return exam.examination_type_display;
  }

  const labels = {
    FIRST_CA: "First Continuous Assessment",
    SECOND_CA: "Second Continuous Assessment",
    MID_TERM: "Mid-Term Examination",
    MOCK: "Mock",
    TERMINAL: "Terminal",
    PROMOTION: "Promotion",
    ENTRANCE: "Entrance",
  };

  return (
    labels[exam?.examination_type] ||
    exam?.examination_type ||
    "—"
  );
};

// ============================================================
// INFO CARD
// ============================================================

function InfoCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-[var(--color-primary)]/10 bg-[var(--color-card)] p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-[var(--color-primary)]/10 p-2">
          <Icon className="h-5 w-5 text-[var(--color-primary)]" />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-text)]/50">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold text-[var(--color-text)]">
            {value || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

export default function TeacherExaminationDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [examination, setExamination] =
    useState(null);

  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingSubjects, setLoadingSubjects] =
    useState(true);

  const [error, setError] = useState("");
  const [subjectError, setSubjectError] =
    useState("");

  // ==========================================================
  // LOAD EXAMINATION
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadExamination = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getExamination(id);

        if (mounted) {
          setExamination(data);
        }
      } catch (err) {
        console.error(
          "Failed to load examination:",
          err
        );

        if (mounted) {
          setError(
            err?.response?.data?.detail ||
              "Unable to load examination."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadExamination();

    return () => {
      mounted = false;
    };
  }, [id]);

  // ==========================================================
  // LOAD SUBJECT SCHEDULE
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadSubjects = async () => {
      try {
        setLoadingSubjects(true);
        setSubjectError("");

        const response =
          await getExaminationSubjects();

        const data = Array.isArray(response)
          ? response
          : response?.results || [];

        const filtered = data.filter(
          (item) =>
            String(item.examination) === String(id)
        );

        if (mounted) {
          setSubjects(filtered);
        }
      } catch (err) {
        console.error(
          "Failed to load examination subjects:",
          err
        );

        if (mounted) {
          setSubjectError(
            err?.response?.data?.detail ||
              "Unable to load subject examination schedule."
          );
        }
      } finally {
        if (mounted) {
          setLoadingSubjects(false);
        }
      }
    };

    loadSubjects();

    return () => {
      mounted = false;
    };
  }, [id]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-[var(--color-background)]">
        <div className="flex items-center gap-3 text-[var(--color-secondary)]">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading examination...</span>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !examination) {
    return (
      <div className="min-h-full bg-[var(--color-background)]">
        <div className="rounded-xl border border-[var(--color-primary)]/10 bg-[var(--color-card)] p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-10 w-10 text-[var(--color-secondary)]" />

          <h2 className="mt-4 text-lg font-semibold text-[var(--color-text)]">
            Unable to load examination
          </h2>

          <p className="mt-2 text-sm text-[var(--color-text)]/60">
            {error || "Examination not found."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/teacher/examinations")
            }
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Examinations
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-full space-y-6 bg-[var(--color-background)]">
      {/* ======================================================
          BACK
      ====================================================== */}

      <button
        type="button"
        onClick={() =>
          navigate("/teacher/examinations")
        }
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] transition hover:opacity-80"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Examinations
      </button>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="rounded-xl border border-[var(--color-primary)]/10 bg-[var(--color-card)] p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--color-secondary)]">
              Examination Details
            </p>

            <h1 className="mt-1 text-2xl font-bold text-[var(--color-text)]">
              {examination.name}
            </h1>

            <p className="mt-2 text-sm text-[var(--color-text)]/60">
              View examination information and subject schedule.
            </p>
          </div>

          <span
            className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
              examination.is_published
                ? "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
                : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
            }`}
          >
            {examination.is_published
              ? "Published"
              : "Not Published"}
          </span>
        </div>
      </div>

      {/* ======================================================
          EXAMINATION INFORMATION
      ====================================================== */}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">
          Examination Information
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <InfoCard
            icon={FileText}
            label="Examination Type"
            value={getExaminationTypeLabel(
              examination
            )}
          />

          <InfoCard
            icon={GraduationCap}
            label="Class"
            value={
              examination.class_level_name || "—"
            }
          />

          <InfoCard
            icon={BookOpen}
            label="Academic Session"
            value={
              examination.academic_session_name ||
              "—"
            }
          />

          <InfoCard
            icon={CalendarDays}
            label="Term"
            value={examination.term_name || "—"}
          />

          <InfoCard
            icon={CalendarDays}
            label="Start Date"
            value={formatDate(
              examination.start_date
            )}
          />

          <InfoCard
            icon={CalendarDays}
            label="End Date"
            value={formatDate(
              examination.end_date
            )}
          />
        </div>
      </div>

      {/* ======================================================
          DESCRIPTION
      ====================================================== */}

      {examination.description && (
        <div className="rounded-xl border border-[var(--color-primary)]/10 bg-[var(--color-card)] p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Description
          </h2>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--color-text)]/70">
            {examination.description}
          </p>
        </div>
      )}

      {/* ======================================================
          SUBJECT SCHEDULE
      ====================================================== */}

      <div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Subject Examination Schedule
          </h2>

          <p className="mt-1 text-sm text-[var(--color-text)]/60">
            View the scheduled subjects, dates, times and venues.
          </p>
        </div>

        {loadingSubjects ? (
          <div className="flex items-center justify-center rounded-xl border border-[var(--color-primary)]/10 bg-[var(--color-card)] p-10 shadow-sm">
            <div className="flex items-center gap-3 text-[var(--color-secondary)]">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>
                Loading subject schedule...
              </span>
            </div>
          </div>
        ) : subjectError ? (
          <div className="rounded-xl border border-[var(--color-primary)]/10 bg-[var(--color-card)] p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-[var(--color-secondary)]" />

              <p className="text-sm text-[var(--color-text)]">
                {subjectError}
              </p>
            </div>
          </div>
        ) : subjects.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-primary)]/10 bg-[var(--color-card)] p-10 text-center shadow-sm">
            <BookOpen className="mx-auto h-10 w-10 text-[var(--color-secondary)]" />

            <p className="mt-3 font-medium text-[var(--color-text)]">
              No subject schedule available
            </p>

            <p className="mt-1 text-sm text-[var(--color-text)]/60">
              Subjects have not yet been scheduled for this examination.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[var(--color-primary)]/10 bg-[var(--color-card)] shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[850px] w-full">
                <thead>
                  <tr className="border-b border-[var(--color-primary)]/10 bg-[var(--color-primary)]/5">
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text)]">
                      Subject
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text)]">
                      Date
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text)]">
                      Start Time
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text)]">
                      End Time
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text)]">
                      Venue
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text)]">
                      Maximum Score
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-text)]">
                      Pass Mark
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {subjects.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[var(--color-primary)]/10 last:border-b-0 hover:bg-[var(--color-primary)]/5"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-[var(--color-text)]">
                          {item.subject_name || "—"}
                        </div>

                        {item.subject_code && (
                          <div className="mt-1 text-xs text-[var(--color-secondary)]">
                            {item.subject_code}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-[var(--color-text)]">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-[var(--color-secondary)]" />
                          {formatDate(
                            item.examination_date
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-[var(--color-text)]">
                        <div className="flex items-center gap-2">
                          <Clock3 className="h-4 w-4 text-[var(--color-secondary)]" />
                          {formatTime(
                            item.start_time
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-[var(--color-text)]">
                        {formatTime(item.end_time)}
                      </td>

                      <td className="px-5 py-4 text-sm text-[var(--color-text)]">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[var(--color-secondary)]" />
                          {item.venue || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-[var(--color-text)]">
                        {item.maximum_score ?? "—"}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-[var(--color-text)]">
                        {item.pass_mark ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}