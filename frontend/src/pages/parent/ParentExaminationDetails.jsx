import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  FileText,
  Loader2,
  MapPin,
  RefreshCw,
} from "lucide-react";

import api from "../../services/api";

// ============================================================
// HELPERS
// ============================================================

const getArray = (data) => {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "—";

  const [hours, minutes] =
    String(value).split(":");

  if (hours === undefined || minutes === undefined) {
    return value;
  }

  const date = new Date();

  date.setHours(
    Number(hours),
    Number(minutes),
    0,
    0
  );

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

// ============================================================
// COMPONENT
// ============================================================

export default function ParentExaminationDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [examination, setExamination] =
    useState(null);

  const [subjects, setSubjects] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================================
  // LOAD
  // ==========================================================

  const loadExamination = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        examinationResponse,
        subjectsResponse,
      ] = await Promise.all([
        api.get(
          `/examinations/${id}/`
        ),
        api.get(
          `/examinations/subjects/`
        ),
      ]);

      setExamination(
        examinationResponse.data
      );

      const allSubjects =
        getArray(
          subjectsResponse.data
        );

      setSubjects(
        allSubjects.filter(
          (item) =>
            Number(
              item.examination
            ) === Number(id)
        )
      );
    } catch (err) {
      console.error(
        "Failed to load parent examination:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to load examination details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExamination();
  }, [id]);

  // ==========================================================
  // SORT SUBJECTS
  // ==========================================================

  const sortedSubjects = useMemo(() => {
    return [...subjects].sort(
      (a, b) => {
        const dateA =
          a.examination_date || "";

        const dateB =
          b.examination_date || "";

        if (dateA !== dateB) {
          return dateA.localeCompare(
            dateB
          );
        }

        return String(
          a.start_time || ""
        ).localeCompare(
          String(b.start_time || "")
        );
      }
    );
  }, [subjects]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-text/70">
          <Loader2
            size={22}
            className="animate-spin text-primary"
          />
          <span>
            Loading examination...
          </span>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !examination) {
    return (
      <div className="min-h-screen bg-background text-text p-4 sm:p-6 lg:p-8">

        <button
          type="button"
          onClick={() =>
            navigate(
              "/parent/examinations"
            )
          }
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-6"
        >
          <ArrowLeft size={17} />
          Back to Examinations
        </button>

        <div className="rounded-xl border border-text/10 bg-card p-8 text-center">
          <FileText
            size={32}
            className="mx-auto text-primary mb-3"
          />

          <h2 className="text-lg font-semibold">
            Unable to load examination
          </h2>

          <p className="mt-2 text-sm text-text/60">
            {error ||
              "The examination could not be found."}
          </p>

          <button
            type="button"
            onClick={loadExamination}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-background text-text p-4 sm:p-6 lg:p-8">

      {/* ======================================================
          TOP BAR
      ====================================================== */}

      <div className="flex items-center justify-between gap-4 mb-6">

        <button
          type="button"
          onClick={() =>
            navigate(
              "/parent/examinations"
            )
          }
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft size={18} />
          Back to Examinations
        </button>
      </div>

      {/* ======================================================
          EXAM HEADER
      ====================================================== */}

      <div className="rounded-2xl border border-text/10 bg-card shadow-sm overflow-hidden">

        <div className="bg-primary/5 border-b border-text/10 p-5 sm:p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

            <div className="flex items-start gap-4">

              <div className="h-12 w-12 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText
                  size={24}
                  className="text-primary"
                />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-bold">
                  {examination.name ||
                    "Examination"}
                </h1>

                <p className="mt-1 text-sm text-text/60">
                  {examination.examination_type_display ||
                    examination.examination_type ||
                    "Examination Schedule"}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">
              {examination.class_name ||
                "Class"}
            </div>
          </div>
        </div>

        {/* ==================================================
            EXAM INFORMATION
        ================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 sm:p-6">

          <div className="rounded-xl border border-text/10 bg-background p-4">
            <CalendarDays
              size={19}
              className="text-primary mb-2"
            />

            <p className="text-xs text-text/50">
              Start Date
            </p>

            <p className="mt-1 font-semibold">
              {formatDate(
                examination.start_date
              )}
            </p>
          </div>

          <div className="rounded-xl border border-text/10 bg-background p-4">
            <CalendarDays
              size={19}
              className="text-primary mb-2"
            />

            <p className="text-xs text-text/50">
              End Date
            </p>

            <p className="mt-1 font-semibold">
              {formatDate(
                examination.end_date
              )}
            </p>
          </div>

          <div className="rounded-xl border border-text/10 bg-background p-4">
            <FileText
              size={19}
              className="text-primary mb-2"
            />

            <p className="text-xs text-text/50">
              Academic Session
            </p>

            <p className="mt-1 font-semibold">
              {examination.academic_session_name ||
                "—"}
            </p>
          </div>

          <div className="rounded-xl border border-text/10 bg-background p-4">
            <FileText
              size={19}
              className="text-primary mb-2"
            />

            <p className="text-xs text-text/50">
              Term
            </p>

            <p className="mt-1 font-semibold">
              {examination.term_name ||
                "—"}
            </p>
          </div>
        </div>

        {examination.description && (
          <div className="border-t border-text/10 p-5 sm:p-6">
            <h2 className="font-semibold mb-2">
              Description
            </h2>

            <p className="text-sm leading-6 text-text/70 whitespace-pre-line">
              {examination.description}
            </p>
          </div>
        )}
      </div>

      {/* ======================================================
          SUBJECT SCHEDULE
      ====================================================== */}

      <div className="mt-6">

        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-bold">
            Examination Schedule
          </h2>

          <p className="text-sm text-text/60 mt-1">
            Subjects, dates, times and venues
          </p>
        </div>

        {sortedSubjects.length === 0 ? (
          <div className="rounded-xl border border-text/10 bg-card p-8 text-center">
            <CalendarDays
              size={30}
              className="mx-auto text-primary mb-3"
            />

            <p className="font-medium">
              No subject schedule available
            </p>

            <p className="text-sm text-text/60 mt-1">
              Subject schedules have not been added
              to this examination yet.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-text/10 bg-card shadow-sm overflow-hidden">

            {/* Desktop */}

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">

                <thead className="border-b border-text/10 bg-background">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      Subject
                    </th>

                    <th className="px-4 py-3 text-left">
                      Date
                    </th>

                    <th className="px-4 py-3 text-left">
                      Time
                    </th>

                    <th className="px-4 py-3 text-left">
                      Maximum Score
                    </th>

                    <th className="px-4 py-3 text-left">
                      Pass Mark
                    </th>

                    <th className="px-4 py-3 text-left">
                      Venue
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sortedSubjects.map(
                    (item) => (
                      <tr
                        key={item.id}
                        className="border-b border-text/5 last:border-b-0"
                      >
                        <td className="px-4 py-4 font-medium">
                          {item.subject_name ||
                            item.subject_display ||
                            "—"}
                        </td>

                        <td className="px-4 py-4">
                          {formatDate(
                            item.examination_date
                          )}
                        </td>

                        <td className="px-4 py-4 whitespace-nowrap">
                          {formatTime(
                            item.start_time
                          )}
                          {" — "}
                          {formatTime(
                            item.end_time
                          )}
                        </td>

                        <td className="px-4 py-4">
                          {item.maximum_score ??
                            "—"}
                        </td>

                        <td className="px-4 py-4">
                          {item.pass_mark ??
                            "—"}
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin
                              size={15}
                              className="text-primary"
                            />
                            {item.venue ||
                              "—"}
                          </span>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile */}

            <div className="md:hidden divide-y divide-text/10">
              {sortedSubjects.map(
                (item) => (
                  <div
                    key={item.id}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold">
                        {item.subject_name ||
                          item.subject_display ||
                          "—"}
                      </h3>

                      <span className="text-xs text-text/50">
                        {item.maximum_score ??
                          "—"}{" "}
                        marks
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">

                      <div className="flex items-center gap-2">
                        <CalendarDays
                          size={16}
                          className="text-primary"
                        />
                        <span>
                          {formatDate(
                            item.examination_date
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock3
                          size={16}
                          className="text-primary"
                        />
                        <span>
                          {formatTime(
                            item.start_time
                          )}
                          {" — "}
                          {formatTime(
                            item.end_time
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin
                          size={16}
                          className="text-primary"
                        />
                        <span>
                          {item.venue ||
                            "Venue not specified"}
                        </span>
                      </div>

                      <div className="pt-2 text-xs text-text/50">
                        Pass mark:{" "}
                        {item.pass_mark ??
                          "—"}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}