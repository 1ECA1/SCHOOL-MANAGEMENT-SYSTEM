import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  Eye,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
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

const formatDate = (value) => {
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
  });
};

const getStatusLabel = (status) => {
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

const getStatusClasses = (status) => {
  switch (status) {
    case "PUBLISHED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "DRAFT":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "CLOSED":
      return "bg-gray-100 text-gray-700 border-gray-200";

    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
};

const getClassName = (assignment) => {
  return (
    assignment?.class_level_name ||
    assignment?.class_name ||
    assignment?.class_level?.name ||
    "—"
  );
};

const getSubjectName = (assignment) => {
  return (
    assignment?.subject_name ||
    assignment?.subject?.name ||
    "—"
  );
};

const getSessionName = (assignment) => {
  return (
    assignment?.academic_session_name ||
    assignment?.session_name ||
    assignment?.academic_session?.name ||
    "—"
  );
};

const getTermName = (assignment) => {
  return (
    assignment?.term_name ||
    assignment?.term?.name ||
    assignment?.term?.title ||
    "—"
  );
};

const getTeacherName = (assignment) => {
  return (
    assignment?.teacher_name ||
    assignment?.teacher?.full_name ||
    assignment?.teacher?.name ||
    "—"
  );
};

// ============================================================
// COMPONENT
// ============================================================

export default function TeacherAssignments() {
  const navigate = useNavigate();

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [page, setPage] = useState(1);

  const [pageSize] = useState(10);

  const [totalCount, setTotalCount] = useState(0);

  const [deleteId, setDeleteId] = useState(null);

  const [deleting, setDeleting] = useState(false);

  // ----------------------------------------------------------
  // LOAD ASSIGNMENTS
  // ----------------------------------------------------------

  const loadAssignments = useCallback(
    async ({ showLoader = true } = {}) => {
      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const params = {
          page,
          page_size: pageSize,
        };

        if (search.trim()) {
          params.search = search.trim();
        }

        if (statusFilter) {
          params.status = statusFilter;
        }

        const data =
          await assignmentsService.getAll(params);

        const rows = getAssignmentArray(data);

        setAssignments(rows);

        setTotalCount(
          getCount(
            data,
            rows.length
          )
        );
      } catch (err) {
        console.error(
          "Failed to load teacher assignments:",
          err
        );

        const message =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Unable to load assignments.";

        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      page,
      pageSize,
      search,
      statusFilter,
    ]
  );

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  // ----------------------------------------------------------
  // RESET PAGE WHEN FILTERS CHANGE
  // ----------------------------------------------------------

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  // ----------------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------------

  const summary = useMemo(() => {
    const published = assignments.filter(
      (item) =>
        item.status === "PUBLISHED"
    ).length;

    const draft = assignments.filter(
      (item) =>
        item.status === "DRAFT"
    ).length;

    const closed = assignments.filter(
      (item) =>
        item.status === "CLOSED"
    ).length;

    return {
      total: totalCount,
      published,
      draft,
      closed,
    };
  }, [assignments, totalCount]);

  // ----------------------------------------------------------
  // PAGINATION
  // ----------------------------------------------------------

  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / pageSize)
  );

  const canGoPrevious = page > 1;

  const canGoNext = page < totalPages;

  const goPrevious = () => {
    if (canGoPrevious) {
      setPage((current) => current - 1);
    }
  };

  const goNext = () => {
    if (canGoNext) {
      setPage((current) => current + 1);
    }
  };

  // ----------------------------------------------------------
  // DELETE
  // ----------------------------------------------------------

  const handleDelete = async () => {
    if (!deleteId) {
      return;
    }

    try {
      setDeleting(true);

      await assignmentsService.remove(
        deleteId
      );

      setDeleteId(null);

      await loadAssignments({
        showLoader: false,
      });
    } catch (err) {
      console.error(
        "Failed to delete assignment:",
        err
      );

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to delete assignment.";

      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  return (
    <div className="min-h-full bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <FileText
                  size={22}
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Assignments
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Manage assignments you are
                  authorized to create and teach.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("create")
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus size={18} />

            Create Assignment
          </button>
        </div>

        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="font-semibold">
                Unable to load assignments
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="rounded-lg p-1 hover:bg-red-100"
            >
              <XCircle size={18} />
            </button>
          </div>
        )}

        {/* ================================================== */}
        {/* SUMMARY CARDS */}
        {/* ================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* TOTAL */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {summary.total}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <FileText size={21} />
              </div>
            </div>
          </div>

          {/* PUBLISHED */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Published
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {summary.published}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle size={21} />
              </div>
            </div>
          </div>

          {/* DRAFT */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Draft
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {summary.draft}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock size={21} />
              </div>
            </div>
          </div>

          {/* CLOSED */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Closed
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {summary.closed}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                <XCircle size={21} />
              </div>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* FILTERS */}
        {/* ================================================== */}

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-3 lg:flex-row">

            {/* SEARCH */}

            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value
                  );
                  setPage(1);
                }}
                placeholder="Search assignments..."
                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(
                  event.target.value
                );
                setPage(1);
              }}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">
                All Statuses
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

            {/* REFRESH */}

            <button
              type="button"
              onClick={() =>
                loadAssignments({
                  showLoader: false,
                })
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
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
          </div>
        </div>

        {/* ================================================== */}
        {/* TABLE */}
        {/* ================================================== */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          {loading ? (
            <div className="flex min-h-[350px] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <Loader2
                  size={30}
                  className="animate-spin text-indigo-600"
                />

                <p className="text-sm">
                  Loading assignments...
                </p>
              </div>
            </div>
          ) : assignments.length === 0 ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <FileText size={28} />
              </div>

              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                No assignments found
              </h3>

              <p className="mt-2 max-w-md text-sm text-gray-500">
                You currently have no assignments
                matching the selected filters.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("create")
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Plus size={17} />

                Create Assignment
              </button>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}

              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full">

                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Assignment
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Class
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Subject
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Due Date
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {assignments.map(
                      (assignment) => (
                        <tr
                          key={
                            assignment.id
                          }
                          className="transition hover:bg-gray-50"
                        >
                          {/* ASSIGNMENT */}

                          <td className="px-5 py-4">
                            <div className="flex items-start gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                <FileText
                                  size={18}
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-semibold text-gray-900">
                                  {assignment.title ||
                                    "Untitled Assignment"}
                                </p>

                                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                                  <CalendarDays
                                    size={13}
                                  />

                                  {getSessionName(
                                    assignment
                                  )}

                                  <span>
                                    •
                                  </span>

                                  {getTermName(
                                    assignment
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* CLASS */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <BookOpen
                                size={16}
                                className="text-gray-400"
                              />

                              {getClassName(
                                assignment
                              )}
                            </div>
                          </td>

                          {/* SUBJECT */}

                          <td className="px-5 py-4 text-sm text-gray-700">
                            {getSubjectName(
                              assignment
                            )}
                          </td>

                          {/* DUE DATE */}

                          <td className="px-5 py-4 text-sm text-gray-600">
                            {formatDate(
                              assignment.due_date
                            )}
                          </td>

                          {/* STATUS */}

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

                          {/* ACTIONS */}

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-1">

                              <button
                                type="button"
                                title="View assignment"
                                onClick={() =>
                                  navigate(
                                    `${assignment.id}`
                                  )
                                }
                                className="rounded-lg p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                              >
                                <Eye
                                  size={17}
                                />
                              </button>

                              <button
                                type="button"
                                title="Edit assignment"
                                onClick={() =>
                                  navigate(
                                    `${assignment.id}/edit`
                                  )
                                }
                                className="rounded-lg p-2 text-gray-500 hover:bg-amber-50 hover:text-amber-600"
                              >
                                <Edit3
                                  size={17}
                                />
                              </button>

                              <button
                                type="button"
                                title="Delete assignment"
                                onClick={() =>
                                  setDeleteId(
                                    assignment.id
                                  )
                                }
                                className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2
                                  size={17}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}

              <div className="divide-y divide-gray-100 md:hidden">

                {assignments.map(
                  (assignment) => (
                    <div
                      key={
                        assignment.id
                      }
                      className="p-4"
                    >
                      <div className="flex items-start justify-between gap-3">

                        <div className="flex min-w-0 gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                            <FileText
                              size={18}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900">
                              {assignment.title ||
                                "Untitled Assignment"}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              {getSubjectName(
                                assignment
                              )}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                            assignment.status
                          )}`}
                        >
                          {getStatusLabel(
                            assignment.status
                          )}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">

                        <div>
                          <p className="text-xs text-gray-400">
                            Class
                          </p>

                          <p className="mt-1 font-medium text-gray-700">
                            {getClassName(
                              assignment
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-400">
                            Due Date
                          </p>

                          <p className="mt-1 font-medium text-gray-700">
                            {formatDate(
                              assignment.due_date
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `${assignment.id}`
                            )
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Eye size={16} />
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `${assignment.id}/edit`
                            )
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Edit3 size={16} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDeleteId(
                              assignment.id
                            )
                          }
                          className="flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* ================================================= */}
              {/* PAGINATION */}
              {/* ================================================= */}

              <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-sm text-gray-500">
                  Page{" "}
                  <span className="font-medium text-gray-700">
                    {page}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-gray-700">
                    {totalPages}
                  </span>
                </p>

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    onClick={
                      goPrevious
                    }
                    disabled={
                      !canGoPrevious
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft
                      size={16}
                    />

                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={
                      goNext
                    }
                    disabled={
                      !canGoNext
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next

                    <ChevronRight
                      size={16}
                    />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ====================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ====================================================== */}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 size={22} />
            </div>

            <h2 className="mt-4 text-lg font-bold text-gray-900">
              Delete Assignment?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              This action will permanently delete
              the assignment. Any backend rules
              protecting the assignment will still
              be enforced.
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                disabled={deleting}
                onClick={() =>
                  setDeleteId(null)
                }
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={
                  handleDelete
                }
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting && (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                )}

                {deleting
                  ? "Deleting..."
                  : "Delete Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}