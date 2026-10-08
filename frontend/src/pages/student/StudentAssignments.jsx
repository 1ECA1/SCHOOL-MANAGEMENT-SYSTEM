import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import assignmentsService from "../../services/assignmentsService";

// ============================================================
// HELPERS
// ============================================================

const getFileName = (url) => {
  if (!url) return "";

  try {
    const cleanUrl = url.split("?")[0];
    const parts = cleanUrl.split("/");
    return decodeURIComponent(parts[parts.length - 1] || "Attachment");
  } catch {
    return "Attachment";
  }
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

// ============================================================
// STATUS
// ============================================================

const getDueStatus = (assignment) => {
  if (!assignment?.due_date) {
    return {
      label: "No deadline",
      className:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    };
  }

  const now = new Date();
  const due = new Date(assignment.due_date);

  if (Number.isNaN(due.getTime())) {
    return {
      label: "No deadline",
      className:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    };
  }

  if (due < now) {
    return {
      label: "Overdue",
      className: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300",
    };
  }

  const difference = due.getTime() - now.getTime();

  const hours = difference / (1000 * 60 * 60);

  if (hours <= 24) {
    return {
      label: "Due soon",
      className:
        "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    };
  }

  return {
    label: "Upcoming",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  };
};

// ============================================================
// ICONS
// ============================================================

const AssignmentIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5h6" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 3h6a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h1V5a2 2 0 0 1 2-2Z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 11h8M8 15h5" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 3v3M17 3v3M4 9h16"
    />
    <rect x="4" y="5" width="16" height="16" rx="2" />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <circle cx="12" cy="12" r="8.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
  </svg>
);

const BookIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20"
    />
  </svg>
);

const DownloadIcon = () => (
  <svg
    className="h-4 w-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m8 11 4 4 4-4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 20h14" />
  </svg>
);

// ============================================================
// COMPONENT
// ============================================================

function StudentAssignments() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("ALL");

  // ==========================================================
  // LOAD ASSIGNMENTS
  // ==========================================================

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await assignmentsService.getStudentAssignments();

      console.log("=================================");
      console.log("STUDENT ASSIGNMENTS RESPONSE:", data);
      console.log("IS ARRAY:", Array.isArray(data));
      console.log("RESULTS:", data?.results);
      console.log("=================================");

      setAssignments(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      console.error("Failed to load student assignments:", err);

      setError(err?.response?.data?.detail || "Unable to load assignments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  // ==========================================================
  // FILTER ASSIGNMENTS
  // ==========================================================

  const filteredAssignments = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return assignments.filter((assignment) => {
      const title = assignment.title?.toLowerCase() || "";

      const subject = assignment.subject_name?.toLowerCase() || "";

      const teacher = assignment.teacher_name?.toLowerCase() || "";

      const matchesSearch =
        !searchValue ||
        title.includes(searchValue) ||
        subject.includes(searchValue) ||
        teacher.includes(searchValue);

      if (!matchesSearch) {
        return false;
      }

      if (filter === "ALL") {
        return true;
      }

      const dueStatus = getDueStatus(assignment);

      if (filter === "UPCOMING" && dueStatus.label !== "Upcoming") {
        return false;
      }

      if (filter === "DUE_SOON" && dueStatus.label !== "Due soon") {
        return false;
      }

      if (filter === "OVERDUE" && dueStatus.label !== "Overdue") {
        return false;
      }

      return true;
    });
  }, [assignments, search, filter]);

  // ==========================================================
  // COUNTS
  // ==========================================================

  const counts = useMemo(() => {
    let upcoming = 0;
    let dueSoon = 0;
    let overdue = 0;

    assignments.forEach((assignment) => {
      const status = getDueStatus(assignment).label;

      if (status === "Upcoming") {
        upcoming += 1;
      }

      if (status === "Due soon") {
        dueSoon += 1;
      }

      if (status === "Overdue") {
        overdue += 1;
      }
    });

    return {
      total: assignments.length,
      upcoming,
      dueSoon,
      overdue,
    };
  }, [assignments]);

  // ==========================================================
  // OPEN ASSIGNMENT
  // ==========================================================

  const openAssignment = (id) => {
    navigate(`/student/assignments/${id}`);
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-full bg-[var(--color-background)] p-6 dark:bg-[var(--color-background)]">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 h-8 w-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl bg-white shadow-sm dark:bg-slate-900"
              />
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-40 animate-pulse rounded-2xl bg-white shadow-sm dark:bg-slate-900"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="min-h-full bg-[var(--color-background)] p-6 dark:bg-[var(--color-background)]">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20">
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-300">
              Unable to load assignments
            </h2>

            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={loadAssignments}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-full bg-[var(--color-background)] p-4 sm:p-6 dark:bg-[var(--color-background)]">
      <div className="mx-auto max-w-7xl">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
                <AssignmentIcon />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-[var(--color-text)]">
                  Assignments
                </h1>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  View and manage your current assignments.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={loadAssignments}
            className="self-start rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Refresh
          </button>
        </div>

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total Assignments
            </p>

            <p className="mt-2 text-3xl font-bold text-[var(--color-text)]">
              {counts.total}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Upcoming
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {counts.upcoming}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Due Soon
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-600 dark:text-amber-400">
              {counts.dueSoon}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Overdue
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
              {counts.overdue}
            </p>
          </div>
        </div>

        {/* ==================================================
            FILTER BAR
        ================================================== */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* SEARCH */}

            <div className="relative w-full lg:max-w-md">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="m20 20-4-4" />
              </svg>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search assignments..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            {/* FILTERS */}

            <div className="flex flex-wrap gap-2">
              {[
                ["ALL", "All"],
                ["UPCOMING", "Upcoming"],
                ["DUE_SOON", "Due Soon"],
                ["OVERDUE", "Overdue"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    filter === value
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ==================================================
            EMPTY STATE
        ================================================== */}

        {filteredAssignments.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <AssignmentIcon />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[var(--color-text)]">
              No assignments found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              {assignments.length === 0
                ? "There are currently no published assignments for your class."
                : "No assignments match your current search or filter."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("ALL");
                }}
                className="mt-5 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* ==================================================
            ASSIGNMENT LIST
        ================================================== */}

        <div className="space-y-4">
          {filteredAssignments.map((assignment) => {
            const dueStatus = getDueStatus(assignment);

            return (
              <div
                key={assignment.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                {/* TOP */}

                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                        {assignment.subject_name || "Subject"}
                      </span>

                      <span
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${dueStatus.className}`}
                      >
                        {dueStatus.label}
                      </span>
                    </div>

                    <h2 className="mt-3 text-lg font-bold text-[var(--color-text)]">
                      {assignment.title}
                    </h2>

                    {assignment.instructions && (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                        {assignment.instructions}
                      </p>
                    )}
                  </div>

                  {/* VIEW BUTTON */}

                  <button
                    type="button"
                    onClick={() => openAssignment(assignment.id)}
                    className="shrink-0 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    View Assignment
                  </button>
                </div>

                {/* DETAILS */}

                <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      <BookIcon />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs text-slate-400">Subject</p>

                      <p className="truncate text-sm font-medium text-[var(--color-text)]">
                        {assignment.subject_name || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      <CalendarIcon />
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Assigned</p>

                      <p className="text-sm font-medium text-[var(--color-text)]">
                        {formatDate(assignment.assigned_date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      <ClockIcon />
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">Due</p>

                      <p className="text-sm font-medium text-[var(--color-text)]">
                        {formatDateTime(assignment.due_date)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Teacher</p>

                    <p className="mt-1 truncate text-sm font-medium text-[var(--color-text)]">
                      {assignment.teacher_name || "—"}
                    </p>
                  </div>
                </div>

                {/* BOTTOM */}

                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="text-slate-500 dark:text-slate-400">
                      Maximum score:
                      <span className="ml-1 font-semibold text-[var(--color-text)]">
                        {assignment.maximum_score ?? "—"}
                      </span>
                    </span>

                    {assignment.attachment && (
                      <a
                        href={assignment.attachment}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium text-[var(--color-primary)] hover:underline"
                      >
                        <DownloadIcon />
                        {getFileName(assignment.attachment)}
                      </a>
                    )}
                  </div>

                  <span className="text-xs text-slate-400">
                    {assignment.status_display ||
                      assignment.status ||
                      "Published"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StudentAssignments;
