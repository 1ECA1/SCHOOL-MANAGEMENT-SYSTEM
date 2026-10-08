import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  GraduationCap,
  Loader2,
  RefreshCw,
  Search,
  Users,
  XCircle,
} from "lucide-react";

import assignmentsService from "../../../services/assignmentsService";

// ============================================================
// HELPERS
// ============================================================

const getAssignmentArray = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

const getPaginationInfo = (data, items) => {
  if (Array.isArray(data)) {
    return {
      count: items.length,
      next: null,
      previous: null,
    };
  }

  return {
    count:
      typeof data?.count === "number"
        ? data.count
        : items.length,
    next: data?.next || null,
    previous: data?.previous || null,
  };
};

const getDisplayName = (value, fallback = "—") => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (typeof value === "object") {
    return (
      value.name ||
      value.full_name ||
      value.title ||
      value.label ||
      value.username ||
      fallback
    );
  }

  return String(value);
};

const getClassName = (assignment) =>
  assignment?.class_level_name ||
  assignment?.class_name ||
  getDisplayName(assignment?.class_level);

const getSubjectName = (assignment) =>
  assignment?.subject_name ||
  getDisplayName(assignment?.subject);

const getTeacherName = (assignment) =>
  assignment?.teacher_name ||
  getDisplayName(assignment?.teacher);

const getSessionName = (assignment) =>
  assignment?.academic_session_name ||
  assignment?.session_name ||
  getDisplayName(assignment?.academic_session);

const getTermName = (assignment) =>
  assignment?.term_name ||
  getDisplayName(assignment?.term);

const getStatusLabel = (status) => {
  const labels = {
    DRAFT: "Draft",
    PUBLISHED: "Published",
    CLOSED: "Closed",
  };

  return labels[status] || status || "Unknown";
};

const getStatusClasses = (status) => {
  switch (status) {
    case "PUBLISHED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "DRAFT":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "CLOSED":
      return "bg-slate-100 text-slate-600 border-slate-200";

    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const normalizeSearchValue = (value) =>
  String(value || "").toLowerCase().trim();

// ============================================================
// COMPONENT
// ============================================================

export default function Assignments() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  // ----------------------------------------------------------
  // FILTERS
  // ----------------------------------------------------------

  const [search, setSearch] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [termFilter, setTermFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // ----------------------------------------------------------
  // FETCH
  // ----------------------------------------------------------

  const loadAssignments = async (showRefresh = false, params = {}) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await assignmentsService.getAll(params);

      const items = getAssignmentArray(data);

      setAssignments(items);
      setPagination(getPaginationInfo(data, items));
    } catch (err) {
      console.error("Failed to load assignments:", err);

      const responseData = err?.response?.data;

      let message =
        "Unable to load assignments. Please try again.";

      if (typeof responseData === "string") {
        message = responseData;
      } else if (responseData?.detail) {
        message = responseData.detail;
      } else if (responseData?.message) {
        message = responseData.message;
      }

      setError(message);
      setAssignments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ----------------------------------------------------------
  // INITIAL LOAD
  // ----------------------------------------------------------

  useEffect(() => {
    loadAssignments();
  }, []);

  // ----------------------------------------------------------
  // SERVER FILTERS
  // ----------------------------------------------------------

  const activeServerFilters = useMemo(() => {
    const params = {};

    if (search.trim()) {
      params.search = search.trim();
    }

    if (sessionFilter) {
      params.academic_session = sessionFilter;
    }

    if (termFilter) {
      params.term = termFilter;
    }

    if (classFilter) {
      params.class_level = classFilter;
    }

    if (subjectFilter) {
      params.subject = subjectFilter;
    }

    if (teacherFilter) {
      params.teacher = teacherFilter;
    }

    if (statusFilter) {
      params.status = statusFilter;
    }

    return params;
  }, [
    search,
    sessionFilter,
    termFilter,
    classFilter,
    subjectFilter,
    teacherFilter,
    statusFilter,
  ]);

  // ----------------------------------------------------------
  // APPLY FILTERS
  // ----------------------------------------------------------

  const applyFilters = () => {
    loadAssignments(false, activeServerFilters);
  };

  // ----------------------------------------------------------
  // CLEAR FILTERS
  // ----------------------------------------------------------

  const clearFilters = () => {
    setSearch("");
    setSessionFilter("");
    setTermFilter("");
    setClassFilter("");
    setSubjectFilter("");
    setTeacherFilter("");
    setStatusFilter("");

    loadAssignments(false);
  };

  // ----------------------------------------------------------
  // LOCAL UNIQUE FILTER OPTIONS
  //
  // These are derived from the currently returned assignment
  // records, so we do not have to invent separate API
  // endpoints for sessions/classes/subjects/teachers.
  // ----------------------------------------------------------

  const filterOptions = useMemo(() => {
    const sessions = new Map();
    const terms = new Map();
    const classes = new Map();
    const subjects = new Map();
    const teachers = new Map();

    assignments.forEach((assignment) => {
      const sessionId =
        assignment?.academic_session ??
        assignment?.academic_session_id;

      const sessionName = getSessionName(assignment);

      if (
        sessionId !== undefined &&
        sessionId !== null &&
        sessionId !== "" &&
        sessionName !== "—"
      ) {
        sessions.set(String(sessionId), sessionName);
      }

      const termId =
        assignment?.term ?? assignment?.term_id;

      const termName = getTermName(assignment);

      if (
        termId !== undefined &&
        termId !== null &&
        termId !== "" &&
        termName !== "—"
      ) {
        terms.set(String(termId), termName);
      }

      const classId =
        assignment?.class_level ??
        assignment?.class_level_id;

      const className = getClassName(assignment);

      if (
        classId !== undefined &&
        classId !== null &&
        classId !== "" &&
        className !== "—"
      ) {
        classes.set(String(classId), className);
      }

      const subjectId =
        assignment?.subject ?? assignment?.subject_id;

      const subjectName = getSubjectName(assignment);

      if (
        subjectId !== undefined &&
        subjectId !== null &&
        subjectId !== "" &&
        subjectName !== "—"
      ) {
        subjects.set(String(subjectId), subjectName);
      }

      const teacherId =
        assignment?.teacher ?? assignment?.teacher_id;

      const teacherName = getTeacherName(assignment);

      if (
        teacherId !== undefined &&
        teacherId !== null &&
        teacherId !== "" &&
        teacherName !== "—"
      ) {
        teachers.set(String(teacherId), teacherName);
      }
    });

    return {
      sessions: Array.from(sessions.entries()).sort((a, b) =>
        a[1].localeCompare(b[1])
      ),

      terms: Array.from(terms.entries()).sort((a, b) =>
        a[1].localeCompare(b[1])
      ),

      classes: Array.from(classes.entries()).sort((a, b) =>
        a[1].localeCompare(b[1])
      ),

      subjects: Array.from(subjects.entries()).sort((a, b) =>
        a[1].localeCompare(b[1])
      ),

      teachers: Array.from(teachers.entries()).sort((a, b) =>
        a[1].localeCompare(b[1])
      ),
    };
  }, [assignments]);

  // ----------------------------------------------------------
  // LOCAL SUMMARY
  // ----------------------------------------------------------

  const summary = useMemo(() => {
    const total = assignments.length;

    const published = assignments.filter(
      (item) => item.status === "PUBLISHED"
    ).length;

    const draft = assignments.filter(
      (item) => item.status === "DRAFT"
    ).length;

    const closed = assignments.filter(
      (item) => item.status === "CLOSED"
    ).length;

    return {
      total,
      published,
      draft,
      closed,
    };
  }, [assignments]);

  // ----------------------------------------------------------
  // CLIENT-SIDE FALLBACK SEARCH
  //
  // Useful if the backend returns all records but does not
  // support one of the search fields.
  // ----------------------------------------------------------

  const displayedAssignments = useMemo(() => {
    if (!search.trim()) {
      return assignments;
    }

    const query = normalizeSearchValue(search);

    return assignments.filter((assignment) => {
      const values = [
        assignment?.title,
        assignment?.instructions,
        getClassName(assignment),
        getSubjectName(assignment),
        getTeacherName(assignment),
        getSessionName(assignment),
        getTermName(assignment),
        assignment?.status,
      ];

      return values.some((value) =>
        normalizeSearchValue(value).includes(query)
      );
    });
  }, [assignments, search]);

  // ----------------------------------------------------------
  // PAGINATION
  // ----------------------------------------------------------

  const goToNextPage = async () => {
    if (!pagination.next) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await assignmentsService.getAll({
        ...activeServerFilters,
        page: getPageFromUrl(pagination.next),
      });

      const items = getAssignmentArray(data);

      setAssignments(items);
      setPagination(getPaginationInfo(data, items));
    } catch (err) {
      console.error("Failed to load next assignment page:", err);
      setError(
        err?.response?.data?.detail ||
          "Unable to load the next page."
      );
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousPage = async () => {
    if (!pagination.previous) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await assignmentsService.getAll({
        ...activeServerFilters,
        page: getPageFromUrl(pagination.previous),
      });

      const items = getAssignmentArray(data);

      setAssignments(items);
      setPagination(getPaginationInfo(data, items));
    } catch (err) {
      console.error(
        "Failed to load previous assignment page:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Unable to load the previous page."
      );
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-sm text-slate-500">
              <FileText className="h-4 w-4" />
              School Administration
              <span>/</span>
              Assignments
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Assignments
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View and monitor assignments created across the
              school.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadAssignments(
                true,
                activeServerFilters
              )
            }
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />

            Refresh
          </button>
        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="flex-1">
              <p className="font-medium">
                Unable to load assignments
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                loadAssignments(
                  true,
                  activeServerFilters
                )
              }
              className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-red-100"
            >
              Retry
            </button>
          </div>
        )}

        {/* ====================================================
            SUMMARY CARDS
        ==================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <SummaryCard
            title="Total Assignments"
            value={summary.total}
            icon={FileText}
            description="Assignments in current result"
          />

          <SummaryCard
            title="Published"
            value={summary.published}
            icon={CheckCircle2}
            description="Currently published"
            iconClass="text-emerald-600"
            iconBackground="bg-emerald-50"
          />

          <SummaryCard
            title="Draft"
            value={summary.draft}
            icon={Clock3}
            description="Not yet published"
            iconClass="text-amber-600"
            iconBackground="bg-amber-50"
          />

          <SummaryCard
            title="Closed"
            value={summary.closed}
            icon={XCircle}
            description="Closed assignments"
            iconClass="text-slate-600"
            iconBackground="bg-slate-100"
          />

        </div>

        {/* ====================================================
            FILTER PANEL
        ==================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">

          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Find Assignments
              </h2>

              <p className="text-xs text-slate-500">
                Filter assignments by academic information,
                teacher, or status.
              </p>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 self-start rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 sm:self-auto"
            >
              <XCircle className="h-4 w-4" />
              Clear filters
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">

            {/* Search */}

            <div className="relative md:col-span-2 xl:col-span-2">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    applyFilters();
                  }
                }}
                placeholder="Search title, instructions, subject, teacher..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Session */}

            <FilterSelect
              value={sessionFilter}
              onChange={setSessionFilter}
              placeholder="All sessions"
              options={filterOptions.sessions}
            />

            {/* Term */}

            <FilterSelect
              value={termFilter}
              onChange={setTermFilter}
              placeholder="All terms"
              options={filterOptions.terms}
            />

            {/* Class */}

            <FilterSelect
              value={classFilter}
              onChange={setClassFilter}
              placeholder="All classes"
              options={filterOptions.classes}
            />

            {/* Subject */}

            <FilterSelect
              value={subjectFilter}
              onChange={setSubjectFilter}
              placeholder="All subjects"
              options={filterOptions.subjects}
            />

            {/* Teacher */}

            <FilterSelect
              value={teacherFilter}
              onChange={setTeacherFilter}
              placeholder="All teachers"
              options={filterOptions.teachers}
            />

            {/* Status */}

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="">
                All statuses
              </option>

              <option value="PUBLISHED">
                Published
              </option>

              <option value="DRAFT">
                Draft
              </option>

              <option value="CLOSED">
                Closed
              </option>
            </select>

          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={applyFilters}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Search className="h-4 w-4" />
              Apply Filters
            </button>
          </div>
        </div>

        {/* ====================================================
            TABLE
        ==================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
            <div>
              <h2 className="font-semibold text-slate-900">
                Assignment List
              </h2>

              <p className="text-xs text-slate-500">
                {pagination.count} assignment
                {pagination.count === 1 ? "" : "s"} found.
              </p>
            </div>
          </div>

          {loading ? (
            <LoadingState />
          ) : displayedAssignments.length === 0 ? (
            <EmptyState
              hasFilters={
                Boolean(search) ||
                Boolean(sessionFilter) ||
                Boolean(termFilter) ||
                Boolean(classFilter) ||
                Boolean(subjectFilter) ||
                Boolean(teacherFilter) ||
                Boolean(statusFilter)
              }
              onClear={clearFilters}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-[1000px] w-full">

                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-3">
                        Assignment
                      </th>

                      <th className="px-5 py-3">
                        Class
                      </th>

                      <th className="px-5 py-3">
                        Subject
                      </th>

                      <th className="px-5 py-3">
                        Teacher
                      </th>

                      <th className="px-5 py-3">
                        Due Date
                      </th>

                      <th className="px-5 py-3">
                        Status
                      </th>

                      <th className="px-5 py-3 text-right">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {displayedAssignments.map(
                      (assignment) => (
                        <tr
                          key={assignment.id}
                          className="transition hover:bg-slate-50"
                        >

                          {/* Assignment */}

                          <td className="px-5 py-4">
                            <div className="flex items-start gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                <FileText className="h-5 w-5" />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-900">
                                  {assignment.title ||
                                    "Untitled Assignment"}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-500">
                                  Assigned{" "}
                                  {formatDate(
                                    assignment.assigned_date
                                  )}
                                </p>
                              </div>

                            </div>
                          </td>

                          {/* Class */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                              <GraduationCap className="h-4 w-4 text-slate-400" />
                              {getClassName(
                                assignment
                              )}
                            </div>
                          </td>

                          {/* Subject */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                              <BookOpen className="h-4 w-4 text-slate-400" />
                              {getSubjectName(
                                assignment
                              )}
                            </div>
                          </td>

                          {/* Teacher */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                              <Users className="h-4 w-4 text-slate-400" />
                              {getTeacherName(
                                assignment
                              )}
                            </div>
                          </td>

                          {/* Due */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <CalendarDays className="h-4 w-4 text-slate-400" />
                              {formatDate(
                                assignment.due_date
                              )}
                            </div>
                          </td>

                          {/* Status */}

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                                assignment.status
                              )}`}
                            >
                              {getStatusLabel(
                                assignment.status
                              )}
                            </span>
                          </td>

                          {/* Action */}

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/school-admin/assignments/${assignment.id}`
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </button>
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>
                </table>
              </div>

              {/* ==================================================
                  PAGINATION
              ================================================== */}

              {(pagination.previous ||
                pagination.next) && (
                <div className="flex items-center justify-between border-t border-slate-200 px-4 py-4 md:px-5">

                  <p className="text-sm text-slate-500">
                    {pagination.count} total assignment
                    {pagination.count === 1
                      ? ""
                      : "s"}
                  </p>

                  <div className="flex items-center gap-2">

                    <button
                      type="button"
                      onClick={goToPreviousPage}
                      disabled={!pagination.previous}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>

                    <button
                      type="button"
                      onClick={goToNextPage}
                      disabled={!pagination.next}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>

                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  title,
  value,
  icon: Icon,
  description,
  iconClass = "text-slate-600",
  iconBackground = "bg-slate-100",
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBackground}`}
        >
          <Icon
            className={`h-5 w-5 ${iconClass}`}
          />
        </div>

      </div>
    </div>
  );
}

// ============================================================
// FILTER SELECT
// ============================================================

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
    >
      <option value="">
        {placeholder}
      </option>

      {options.map(([id, label]) => (
        <option key={id} value={id}>
          {label}
        </option>
      ))}
    </select>
  );
}

// ============================================================
// LOADING
// ============================================================

function LoadingState() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin" />

        <p className="text-sm">
          Loading assignments...
        </p>
      </div>
    </div>
  );
}

// ============================================================
// EMPTY
// ============================================================

function EmptyState({
  hasFilters,
  onClear,
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        <FileText className="h-7 w-7 text-slate-400" />
      </div>

      <h3 className="mt-4 font-semibold text-slate-900">
        No assignments found
      </h3>

      <p className="mt-1 max-w-md text-sm text-slate-500">
        {hasFilters
          ? "No assignments match the selected filters. Try changing or clearing your filters."
          : "There are currently no assignments available for this school."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

// ============================================================
// PAGINATION URL HELPER
// ============================================================

function getPageFromUrl(url) {
  if (!url) {
    return undefined;
  }

  try {
    const parsed = new URL(url);

    return (
      parsed.searchParams.get("page") ||
      undefined
    );
  } catch {
    return undefined;
  }
}