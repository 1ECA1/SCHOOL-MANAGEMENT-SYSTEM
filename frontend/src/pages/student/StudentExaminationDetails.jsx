import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  FileText,
  Loader2,
  MapPin,
  Trophy,
} from "lucide-react";

import api from "../../services/api";

const StudentExaminationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [examination, setExamination] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const [examResponse, subjectsResponse] = await Promise.all([
        api.get(`/examinations/${id}/`),
        api.get("/examinations/subjects/"),
      ]);

      const examData = examResponse.data;

      const subjectData = Array.isArray(subjectsResponse.data)
        ? subjectsResponse.data
        : subjectsResponse.data?.results || [];

      setExamination(examData);

      setSubjects(
        subjectData.filter(
          (item) => String(item.examination) === String(id),
        ),
      );
    } catch (err) {
      console.error(
        "Failed to load examination details:",
        err,
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to load examination details. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      undefined,
      {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      },
    );
  };

  const formatTime = (time) => {
    if (!time) return "—";

    const [hours, minutes] = String(time).split(":");

    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatTimeRange = (subject) => {
    if (!subject.start_time && !subject.end_time) {
      return "—";
    }

    if (subject.start_time && subject.end_time) {
      return `${formatTime(subject.start_time)} – ${formatTime(
        subject.end_time,
      )}`;
    }

    return formatTime(subject.start_time || subject.end_time);
  };

  const sortedSubjects = useMemo(() => {
    return [...subjects].sort((a, b) => {
      const dateA = a.examination_date || "";
      const dateB = b.examination_date || "";

      if (dateA !== dateB) {
        return dateA.localeCompare(dateB);
      }

      return String(a.start_time || "").localeCompare(
        String(b.start_time || ""),
      );
    });
  }, [subjects]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="flex items-center gap-3 text-sm opacity-70">
            <Loader2
              size={20}
              className="animate-spin text-[var(--color-primary)]"
            />
            Loading examination...
          </div>
        </div>
      </div>
    );
  }

  if (error || !examination) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] p-4 text-[var(--color-text)] sm:p-6">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() => navigate("/student/examinations")}
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]"
          >
            <ArrowLeft size={17} />
            Back to Examinations
          </button>

          <div className="rounded-xl border border-black/5 bg-[var(--color-card)] p-8 text-center shadow-sm dark:border-white/10">
            <FileText
              size={42}
              className="mx-auto mb-4 opacity-30"
            />

            <h1 className="text-lg font-semibold">
              Unable to load examination
            </h1>

            <p className="mt-2 text-sm opacity-60">
              {error || "The examination could not be found."}
            </p>

            <button
              type="button"
              onClick={fetchDetails}
              className="mt-5 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/student/examinations")}
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-primary)] transition hover:opacity-80"
        >
          <ArrowLeft size={18} />
          Back to Examinations
        </button>

        {/* Header */}
        <div className="rounded-2xl border border-black/5 bg-[var(--color-card)] p-5 shadow-sm dark:border-white/10 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
                <FileText size={23} />
              </div>

              <div>
                <h1 className="text-xl font-bold sm:text-2xl">
                  {examination.name || "Examination"}
                </h1>

                <p className="mt-1 text-sm opacity-65">
                  {examination.examination_type_display ||
                    examination.examination_type ||
                    "Examination"}
                </p>
              </div>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-[var(--color-primary)]/20 px-3 py-2 text-sm font-medium text-[var(--color-primary)]">
              <CalendarDays size={17} />
              {examination.is_published
                ? "Published"
                : "Not Published"}
            </div>
          </div>
        </div>

        {/* Examination Information */}
        <div className="rounded-xl border border-black/5 bg-[var(--color-card)] p-5 shadow-sm dark:border-white/10 sm:p-6">
          <h2 className="mb-5 text-lg font-semibold">
            Examination Information
          </h2>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wide opacity-50">
                Class
              </p>
              <p className="mt-1 font-medium">
                {examination.class_level_name || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide opacity-50">
                Academic Session
              </p>
              <p className="mt-1 font-medium">
                {examination.academic_session_name || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide opacity-50">
                Term
              </p>
              <p className="mt-1 font-medium">
                {examination.term_name || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide opacity-50">
                Examination Type
              </p>
              <p className="mt-1 font-medium">
                {examination.examination_type_display ||
                  examination.examination_type ||
                  "—"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide opacity-50">
                Start Date
              </p>
              <p className="mt-1 font-medium">
                {formatDate(examination.start_date)}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide opacity-50">
                End Date
              </p>
              <p className="mt-1 font-medium">
                {formatDate(examination.end_date)}
              </p>
            </div>
          </div>

          {examination.description && (
            <div className="mt-6 border-t border-black/5 pt-5 dark:border-white/10">
              <p className="text-xs uppercase tracking-wide opacity-50">
                Description
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 opacity-80">
                {examination.description}
              </p>
            </div>
          )}
        </div>

        {/* Subject Schedule */}
        <div className="rounded-xl border border-black/5 bg-[var(--color-card)] shadow-sm dark:border-white/10">
          <div className="border-b border-black/5 p-5 dark:border-white/10 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]">
                <CalendarDays size={20} />
              </div>

              <div>
                <h2 className="font-semibold">
                  Examination Schedule
                </h2>

                <p className="text-sm opacity-60">
                  Subjects, dates, times and venues.
                </p>
              </div>
            </div>
          </div>

          {sortedSubjects.length === 0 ? (
            <div className="p-10 text-center">
              <CalendarDays
                size={40}
                className="mx-auto mb-3 opacity-25"
              />

              <p className="font-medium">
                No subject schedule available
              </p>

              <p className="mt-1 text-sm opacity-60">
                Subject schedules have not been added yet.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="border-b border-black/5 bg-[var(--color-background)] dark:border-white/10">
                    <tr>
                      <th className="px-5 py-4 font-semibold">
                        Subject
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Date
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Time
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Maximum Score
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Pass Mark
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Venue
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {sortedSubjects.map((subject) => (
                      <tr
                        key={subject.id}
                        className="border-b border-black/5 last:border-b-0 dark:border-white/10"
                      >
                        <td className="px-5 py-4">
                          <div className="font-medium">
                            {subject.subject_name ||
                              subject.subject ||
                              "—"}
                          </div>

                          {subject.subject_code && (
                            <div className="mt-0.5 text-xs opacity-50">
                              {subject.subject_code}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          {formatDate(subject.examination_date)}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Clock3 size={15} className="opacity-50" />
                            {formatTimeRange(subject)}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          {subject.maximum_score ?? "—"}
                        </td>

                        <td className="px-5 py-4">
                          {subject.pass_mark ?? "—"}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <MapPin size={15} className="opacity-50" />
                            {subject.venue || "—"}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="space-y-3 p-4 md:hidden">
                {sortedSubjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="rounded-xl border border-black/5 p-4 dark:border-white/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">
                          {subject.subject_name ||
                            subject.subject ||
                            "—"}
                        </h3>

                        {subject.subject_code && (
                          <p className="mt-0.5 text-xs opacity-50">
                            {subject.subject_code}
                          </p>
                        )}
                      </div>

                      <Trophy
                        size={18}
                        className="shrink-0 text-[var(--color-primary)]"
                      />
                    </div>

                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <CalendarDays
                          size={16}
                          className="opacity-50"
                        />
                        <span>
                          {formatDate(subject.examination_date)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock3
                          size={16}
                          className="opacity-50"
                        />
                        <span>
                          {formatTimeRange(subject)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin
                          size={16}
                          className="opacity-50"
                        />
                        <span>{subject.venue || "—"}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <div>
                          <p className="text-xs opacity-50">
                            Maximum Score
                          </p>
                          <p className="mt-0.5 font-medium">
                            {subject.maximum_score ?? "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs opacity-50">
                            Pass Mark
                          </p>
                          <p className="mt-0.5 font-medium">
                            {subject.pass_mark ?? "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentExaminationDetails;