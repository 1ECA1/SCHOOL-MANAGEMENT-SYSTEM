import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  FileText,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import assignmentsService from "../../../services/assignmentsService";

// =====================================================
// HELPERS
// =====================================================

function getItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function getTotal(data, items) {
  return Number(data?.count ?? items.length);
}

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status) {
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
}

function getStatusClass(status) {
  switch (status) {
    case "PUBLISHED":
      return "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]";

    case "DRAFT":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400";

    case "CLOSED":
      return "bg-black/5 text-[var(--color-text)] opacity-70 dark:bg-white/10";

    default:
      return "bg-black/5 text-[var(--color-text)] opacity-70 dark:bg-white/10";
  }
}

// =====================================================
// COMPONENT
// =====================================================

export default function PrincipalAssignments() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // =====================================================
  // LOAD ASSIGNMENTS
  // =====================================================

  const loadAssignments = async ({ showLoader = true } = {}) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      const params = {
        page,
        page_size: pageSize,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (status) {
        params.status = status;
      }

      const response = await assignmentsService.getAll(params);

      const items = getItems(response);

      setAssignments(items);
      setTotalCount(getTotal(response, items));
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to load assignments.";

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // INITIAL / FILTER LOAD
  // =====================================================

  useEffect(() => {
    loadAssignments();
  }, [page, status]);

  // =====================================================
  // SEARCH DEBOUNCE
  // =====================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadAssignments({ showLoader: false });
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAssignments({ showLoader: false });
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;

    try {
      setDeletingId(deleteTarget.id);
      setError("");

      await assignmentsService.remove(deleteTarget.id);

      setDeleteTarget(null);

      await loadAssignments({ showLoader: false });
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to delete assignment.";

      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // SUMMARY COUNTS
  // =====================================================

  const summary = useMemo(() => {
    const total = totalCount;

    const published = assignments.filter(
      (assignment) => assignment.status === "PUBLISHED"
    ).length;

    const drafts = assignments.filter(
      (assignment) => assignment.status === "DRAFT"
    ).length;

    const closed = assignments.filter(
      (assignment) => assignment.status === "CLOSED"
    ).length;

    const submissions = assignments.reduce(
      (sum, assignment) =>
        sum + Number(assignment.submission_count || 0),
      0
    );

    return {
      total,
      published,
      drafts,
      closed,
      submissions,
    };
  }, [assignments, totalCount]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const canPrevious = page > 1;
  const canNext = page < totalPages;

  const pageNumbers = [];

  const startPage = Math.max(1, page - 2);
  const endPage = Math.min(totalPages, page + 2);

  for (let i = startPage; i <= endPage; i += 1) {
    pageNumbers.push(i);
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-full bg-[var(--color-background)] p-4 text-[var(--color-text)] sm:p-6 lg:p-8">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
            <ClipboardList size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              Assignments
            </h1>

            <p className="mt-1 text-sm opacity-60">
              Manage and monitor assignments in your school.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-primary)]/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => navigate("/principal/assignments/create")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            <Plus size={17} />
            Create Assignment
          </button>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-600 dark:text-red-400">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />

          <div className="flex-1">
            <p className="text-sm font-medium">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-md p-1 transition hover:bg-red-500/10"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total */}
        <div className="rounded-xl border border-black/5 bg-[var(--color-card)] p-4 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-60">
                Total
              </p>

              <p className="mt-1 text-2xl font-bold">
                {summary.total}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <ClipboardList size={20} />
            </div>
          </div>
        </div>

        {/* Published */}
        <div className="rounded-xl border border-black/5 bg-[var(--color-card)] p-4 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-60">
                Published
              </p>

              <p className="mt-1 text-2xl font-bold">
                {summary.published}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]">
              <CheckCircle size={20} />
            </div>
          </div>
        </div>

        {/* Drafts */}
        <div className="rounded-xl border border-black/5 bg-[var(--color-card)] p-4 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-60">
                Drafts
              </p>

              <p className="mt-1 text-2xl font-bold">
                {summary.drafts}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <FileText size={20} />
            </div>
          </div>
        </div>

        {/* Closed */}
        <div className="rounded-xl border border-black/5 bg-[var(--color-card)] p-4 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-60">
                Closed
              </p>

              <p className="mt-1 text-2xl font-bold">
                {summary.closed}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-background)] text-[var(--color-text)] opacity-70">
              <BookOpen size={20} />
            </div>
          </div>
        </div>

        {/* Submissions */}
        <div className="rounded-xl border border-black/5 bg-[var(--color-card)] p-4 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-60">
                Submissions
              </p>

              <p className="mt-1 text-2xl font-bold">
                {summary.submissions}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <Users size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="mb-6 rounded-xl border border-black/5 bg-[var(--color-card)] p-4 dark:border-white/10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px]">
          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search assignments..."
              className="w-full rounded-lg border border-black/10 bg-[var(--color-background)] py-2.5 pl-10 pr-4 text-sm text-[var(--color-text)] outline-none transition placeholder:opacity-50 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-white/10"
            />
          </div>

          {/* Status */}
          <select
            value={status}
            onChange={(event) => {
              setPage(1);
              setStatus(event.target.value);
            }}
            className="w-full rounded-lg border border-black/10 bg-[var(--color-background)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-white/10"
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
        </div>
      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="overflow-hidden rounded-xl border border-black/5 bg-[var(--color-card)] dark:border-white/10">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 opacity-60">
              <Loader2
                size={22}
                className="animate-spin text-[var(--color-primary)]"
              />

              <span className="text-sm">
                Loading assignments...
              </span>
            </div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] opacity-70">
              <ClipboardList size={26} />
            </div>

            <h3 className="text-lg font-semibold">
              No assignments found
            </h3>

            <p className="mt-1 max-w-md text-sm opacity-60">
              There are no assignments matching your current search or
              filter.
            </p>

            <button
              type="button"
              onClick={() => navigate("/principal/assignments/create")}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              <Plus size={17} />
              Create Assignment
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-black/5 bg-[var(--color-background)] dark:border-white/10">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60">
                      Assignment
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60">
                      Class
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60">
                      Subject
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60">
                      Teacher
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60">
                      Due Date
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60">
                      Status
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide opacity-60">
                      Submissions
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide opacity-60">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-black/5 dark:divide-white/10">
                  {assignments.map((assignment) => (
                    <tr
                      key={assignment.id}
                      className="transition hover:bg-[var(--color-primary)]/5"
                    >
                      {/* Assignment */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium">
                            {assignment.title || "Untitled Assignment"}
                          </p>

                          <p className="mt-1 text-xs opacity-60">
                            Created{" "}
                            {formatDateTime(
                              assignment.created_at ||
                                assignment.created
                            )}
                          </p>
                        </div>
                      </td>

                      {/* Class */}
                      <td className="px-5 py-4 text-sm">
                        {assignment.class_level_name ||
                          assignment.class_level?.name ||
                          assignment.class_level ||
                          "—"}
                      </td>

                      {/* Subject */}
                      <td className="px-5 py-4 text-sm opacity-70">
                        {assignment.subject_name ||
                          assignment.subject?.name ||
                          assignment.subject ||
                          "—"}
                      </td>

                      {/* Teacher */}
                      <td className="px-5 py-4 text-sm opacity-70">
                        {assignment.teacher_name ||
                          assignment.teacher?.full_name ||
                          assignment.teacher?.name ||
                          "—"}
                      </td>

                      {/* Due Date */}
                      <td className="px-5 py-4 text-sm opacity-70">
                        {formatDate(
                          assignment.due_date ||
                            assignment.end_date
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                            assignment.status
                          )}`}
                        >
                          {getStatusLabel(assignment.status)}
                        </span>
                      </td>

                      {/* Submissions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Users
                            size={16}
                            className="opacity-50"
                          />

                          <span className="text-sm font-medium">
                            {assignment.submission_count ?? 0}
                          </span>

                          {assignment.graded_count !== undefined && (
                            <span className="text-xs opacity-60">
                              ({assignment.graded_count} graded)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/principal/assignments/${assignment.id}`
                              )
                            }
                            title="View"
                            className="rounded-lg p-2 text-[var(--color-text)] opacity-60 transition hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] hover:opacity-100"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/principal/assignments/${assignment.id}/edit`
                              )
                            }
                            title="Edit"
                            className="rounded-lg p-2 text-[var(--color-text)] opacity-60 transition hover:bg-amber-500/10 hover:text-amber-600 hover:opacity-100 dark:hover:text-amber-400"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget(assignment)
                            }
                            title="Delete"
                            className="rounded-lg p-2 text-[var(--color-text)] opacity-60 transition hover:bg-red-500/10 hover:text-red-600 hover:opacity-100"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* =================================================
                PAGINATION
            ================================================= */}

            <div className="flex flex-col items-center justify-between gap-3 border-t border-black/5 px-5 py-4 dark:border-white/10 sm:flex-row">
              <p className="text-sm opacity-60">
                Page{" "}
                <span className="font-medium opacity-100">
                  {page}
                </span>{" "}
                of{" "}
                <span className="font-medium opacity-100">
                  {totalPages}
                </span>
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={!canPrevious}
                  onClick={() =>
                    canPrevious && setPage((current) => current - 1)
                  }
                  className="rounded-lg border border-black/10 p-2 text-[var(--color-text)] opacity-70 transition hover:bg-[var(--color-primary)]/5 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-white/10"
                >
                  <ChevronLeft size={17} />
                </button>

                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    className={`min-w-9 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      pageNumber === page
                        ? "bg-[var(--color-primary)] text-white"
                        : "text-[var(--color-text)] opacity-70 hover:bg-[var(--color-primary)]/5 hover:opacity-100"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={!canNext}
                  onClick={() =>
                    canNext && setPage((current) => current + 1)
                  }
                  className="rounded-lg border border-black/10 p-2 text-[var(--color-text)] opacity-70 transition hover:bg-[var(--color-primary)]/5 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-white/10"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-[var(--color-card)] p-6 text-[var(--color-text)] shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                <Trash2 size={21} />
              </div>

              <div className="flex-1">
                <h2 className="text-lg font-semibold">
                  Delete Assignment
                </h2>

                <p className="mt-2 text-sm opacity-60">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold opacity-100">
                    {deleteTarget.title || "this assignment"}
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deletingId !== null}
                className="rounded-md p-1 opacity-60 transition hover:bg-[var(--color-primary)]/5 hover:opacity-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deletingId !== null}
                className="rounded-lg border border-black/10 bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-primary)]/5 disabled:opacity-50 dark:border-white/10"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deletingId !== null}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingId !== null ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}