
import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  User,
  X,
} from "lucide-react";

import api from "../../services/api";

// ============================================================
// HELPERS
// ============================================================

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getDueStatus(assignment) {
  if (assignment.is_overdue) {
    return {
      label: "Overdue",
      className:
        "bg-primary/10 text-primary",
    };
  }

  return {
    label: "Open",
    className:
      "bg-secondary/10 text-secondary",
  };
}

// ============================================================
// COMPONENT
// ============================================================

export default function ParentAssignments() {
  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedChild, setSelectedChild] = useState("ALL");

  const [selectedAssignment, setSelectedAssignment] =
    useState(null);

  // ==========================================================
  // LOAD ASSIGNMENTS
  // ==========================================================

  const loadAssignments = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get(
        "/assignments/parent/"
      );

      const data = response?.data;

      if (Array.isArray(data)) {
        setAssignments(data);
      } else if (Array.isArray(data?.results)) {
        setAssignments(data.results);
      } else {
        setAssignments([]);
      }
    } catch (err) {
      console.error(
        "Failed to load parent assignments:",
        err
      );

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to load assignments.";

      setError(message);
      setAssignments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  // ==========================================================
  // CHILDREN
  // ==========================================================

  const children = useMemo(() => {
    const map = new Map();

    assignments.forEach((assignment) => {
      if (!assignment.child_id) return;

      if (!map.has(assignment.child_id)) {
        map.set(assignment.child_id, {
          id: assignment.child_id,
          name:
            assignment.child_name ||
            "Unnamed Student",
          admission_number:
            assignment.child_admission_number || "",
        });
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [assignments]);

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return assignments.filter((assignment) => {
      if (
        selectedChild !== "ALL" &&
        String(assignment.child_id) !==
          String(selectedChild)
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        assignment.title,
        assignment.instructions,
        assignment.subject_name,
        assignment.class_name,
        assignment.teacher_name,
        assignment.child_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [
    assignments,
    search,
    selectedChild,
  ]);

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const statistics = useMemo(() => {
    const total = assignments.length;

    const submitted = assignments.filter(
      (assignment) => assignment.has_submitted
    ).length;

    const pending = assignments.filter(
      (assignment) => !assignment.has_submitted
    ).length;

    const overdue = assignments.filter(
      (assignment) => assignment.is_overdue
    ).length;

    return {
      total,
      submitted,
      pending,
      overdue,
    };
  }, [assignments]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-text">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span>Loading assignments...</span>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-full bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-text">
                  Assignments
                </h1>

                <p className="text-sm text-text/60 mt-1">
                  View assignments for your children.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadAssignments(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-text/10 bg-card text-text hover:bg-background transition disabled:opacity-60"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {error && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5" />

              <div className="flex-1">
                <p className="font-medium text-primary">
                  Unable to load assignments
                </p>

                <p className="text-sm text-primary/80 mt-1">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setError("")}
                className="text-primary/70 hover:text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================================================== */}
        {/* STATISTICS */}
        {/* ================================================== */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          <div className="bg-card border border-text/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text/60">
                  Total
                </p>

                <p className="text-2xl font-bold text-text mt-1">
                  {statistics.total}
                </p>
              </div>

              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-text/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text/60">
                  Submitted
                </p>

                <p className="text-2xl font-bold text-text mt-1">
                  {statistics.submitted}
                </p>
              </div>

              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-secondary" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-text/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text/60">
                  Pending
                </p>

                <p className="text-2xl font-bold text-text mt-1">
                  {statistics.pending}
                </p>
              </div>

              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-secondary" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-text/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text/60">
                  Overdue
                </p>

                <p className="text-2xl font-bold text-text mt-1">
                  {statistics.overdue}
                </p>
              </div>

              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>

        </div>

        {/* ================================================== */}
        {/* FILTERS */}
        {/* ================================================== */}

        <div className="bg-card border border-text/10 rounded-xl p-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">

            {/* SEARCH */}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text/40" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search assignments, subjects, teachers..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-text/10 bg-background text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* CHILD */}

            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text/40 pointer-events-none" />

              <select
                value={selectedChild}
                onChange={(event) =>
                  setSelectedChild(event.target.value)
                }
                className="w-full appearance-none pl-10 pr-10 py-2.5 rounded-lg border border-text/10 bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="ALL">
                  All Children
                </option>

                {children.map((child) => (
                  <option
                    key={child.id}
                    value={child.id}
                  >
                    {child.name}
                  </option>
                ))}
              </select>

              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text/40 pointer-events-none" />
            </div>

          </div>
        </div>

        {/* ================================================== */}
        {/* EMPTY STATE */}
        {/* ================================================== */}

        {filteredAssignments.length === 0 ? (
          <div className="bg-card border border-text/10 rounded-xl p-10 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-background flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-text/40" />
            </div>

            <h2 className="text-lg font-semibold text-text mt-4">
              No assignments found
            </h2>

            <p className="text-sm text-text/60 mt-2">
              {assignments.length === 0
                ? "There are currently no published assignments for your children."
                : "No assignments match your current search or filter."}
            </p>
          </div>
        ) : (
          /* ================================================= */
          /* ASSIGNMENTS */
          /* ================================================= */

          <div className="space-y-4">

            {filteredAssignments.map((assignment) => {
              const dueStatus =
                getDueStatus(assignment);

              return (
                <div
                  key={`${assignment.id}-${assignment.child_id}`}
                  className="bg-card border border-text/10 rounded-xl overflow-hidden hover:shadow-sm transition"
                >
                  <div className="p-5">

                    {/* TOP */}

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                      <div className="flex gap-4 min-w-0">

                        <div className="w-11 h-11 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>

                        <div className="min-w-0">

                          <h2 className="text-lg font-semibold text-text truncate">
                            {assignment.title}
                          </h2>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-text/60">

                            <span>
                              {assignment.subject_name ||
                                "Unknown Subject"}
                            </span>

                            <span>•</span>

                            <span>
                              {assignment.class_name ||
                                "Unknown Class"}
                            </span>

                          </div>

                        </div>

                      </div>

                      <span
                        className={`inline-flex w-fit items-center px-2.5 py-1 rounded-full text-xs font-medium ${dueStatus.className}`}
                      >
                        {dueStatus.label}
                      </span>

                    </div>

                    {/* CHILD */}

                    <div className="mt-4 flex flex-wrap items-center gap-3">

                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background text-sm text-text">
                        <User className="w-4 h-4 text-text/60" />

                        <span>
                          {assignment.child_name ||
                            "Child"}
                        </span>
                      </div>

                      {assignment.child_admission_number && (
                        <span className="text-xs text-text/60">
                          {assignment.child_admission_number}
                        </span>
                      )}

                    </div>

                    {/* INSTRUCTIONS */}

                    {assignment.instructions && (
                      <p className="mt-4 text-sm leading-6 text-text/70 line-clamp-3">
                        {assignment.instructions}
                      </p>
                    )}

                    {/* META */}

                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

                      <div className="flex items-center gap-2 text-sm text-text/60">
                        <Calendar className="w-4 h-4" />

                        <span>
                          Assigned:{" "}
                          <span className="text-text">
                            {formatDate(
                              assignment.assigned_date
                            )}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-text/60">
                        <Clock className="w-4 h-4" />

                        <span>
                          Due:{" "}
                          <span className="text-text">
                            {formatDateTime(
                              assignment.due_date
                            )}
                          </span>
                        </span>
                      </div>

                      <div className="text-sm text-text/60">
                        Teacher:{" "}
                        <span className="text-text">
                          {assignment.teacher_name ||
                            "—"}
                        </span>
                      </div>

                      <div className="text-sm text-text/60">
                        Score:{" "}
                        <span className="text-text">
                          {assignment.maximum_score ??
                            "—"}
                        </span>
                      </div>

                    </div>

                    {/* BOTTOM */}

                    <div className="mt-5 pt-4 border-t border-text/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                      <div>
                        {assignment.has_submitted ? (
                          <div className="inline-flex items-center gap-2 text-sm text-secondary">
                            <CheckCircle className="w-4 h-4" />
                            Submitted
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 text-sm text-primary">
                            <Clock className="w-4 h-4" />
                            Not submitted
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedAssignment(
                            assignment
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition"
                      >
                        <FileText className="w-4 h-4" />
                        View Assignment
                      </button>

                    </div>

                  </div>
                </div>
              );
            })}

          </div>
        )}

      </div>

      {/* ==================================================== */}
      {/* ASSIGNMENT DETAILS MODAL */}
      {/* ==================================================== */}

      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl shadow-xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 p-5 border-b border-text/10 bg-card">

              <div>
                <h2 className="text-xl font-bold text-text">
                  {selectedAssignment.title}
                </h2>

                <p className="text-sm text-text/60 mt-1">
                  {selectedAssignment.subject_name}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedAssignment(null)
                }
                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-background text-text/60"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="p-5 space-y-6">

              {/* CHILD */}

              <div className="rounded-xl bg-background p-4">

                <div className="flex items-center gap-2 text-sm font-medium text-text">
                  <User className="w-4 h-4 text-primary" />
                  Child
                </div>

                <p className="mt-2 text-sm text-text/70">
                  {selectedAssignment.child_name}
                </p>

                {selectedAssignment.child_admission_number && (
                  <p className="text-xs text-text/60 mt-1">
                    {selectedAssignment.child_admission_number}
                  </p>
                )}

              </div>

              {/* INFORMATION */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <p className="text-xs text-text/60">
                    Class
                  </p>

                  <p className="text-sm font-medium text-text mt-1">
                    {selectedAssignment.class_name ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-text/60">
                    Teacher
                  </p>

                  <p className="text-sm font-medium text-text mt-1">
                    {selectedAssignment.teacher_name ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-text/60">
                    Assigned Date
                  </p>

                  <p className="text-sm font-medium text-text mt-1">
                    {formatDate(
                      selectedAssignment.assigned_date
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-text/60">
                    Due Date
                  </p>

                  <p className="text-sm font-medium text-text mt-1">
                    {formatDateTime(
                      selectedAssignment.due_date
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-text/60">
                    Maximum Score
                  </p>

                  <p className="text-sm font-medium text-text mt-1">
                    {selectedAssignment.maximum_score ??
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-text/60">
                    Submission
                  </p>

                  <p className="text-sm font-medium text-text mt-1">
                    {selectedAssignment.has_submitted
                      ? "Submitted"
                      : "Not submitted"}
                  </p>
                </div>

              </div>

              {/* INSTRUCTIONS */}

              <div>

                <h3 className="text-sm font-semibold text-text">
                  Instructions
                </h3>

                <div className="mt-2 rounded-xl bg-background p-4">
                  <p className="text-sm leading-6 whitespace-pre-wrap text-text/80">
                    {selectedAssignment.instructions ||
                      "No instructions provided."}
                  </p>
                </div>

              </div>

              {/* ATTACHMENT */}

              {selectedAssignment.attachment_url && (
                <div>

                  <h3 className="text-sm font-semibold text-text">
                    Attachment
                  </h3>

                  <a
                    href={
                      selectedAssignment.attachment_url
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-text/10 text-sm text-primary hover:bg-background"
                  >
                    <FileText className="w-4 h-4" />
                    Open Attachment
                  </a>

                </div>
              )}

              {/* SUBMISSION */}

              {selectedAssignment.submission && (
                <div>

                  <h3 className="text-sm font-semibold text-text">
                    Submission
                  </h3>

                  <div className="mt-2 rounded-xl bg-background p-4 space-y-3">

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-text/60">
                        Status
                      </span>

                      <span className="text-sm font-medium text-text">
                        {selectedAssignment.submission.status}
                      </span>
                    </div>

                    {selectedAssignment.submission.score !==
                      null &&
                      selectedAssignment.submission.score !==
                        undefined && (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm text-text/60">
                            Score
                          </span>

                          <span className="text-sm font-medium text-text">
                            {
                              selectedAssignment
                                .submission.score
                            }
                          </span>
                        </div>
                      )}

                    {selectedAssignment.submission.submitted_at && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-text/60">
                          Submitted
                        </span>

                        <span className="text-sm font-medium text-text">
                          {formatDateTime(
                            selectedAssignment
                              .submission.submitted_at
                          )}
                        </span>
                      </div>
                    )}

                    {selectedAssignment.submission.teacher_feedback && (
                      <div>
                        <p className="text-sm text-text/60">
                          Teacher Feedback
                        </p>

                        <p className="text-sm leading-6 text-text mt-1 whitespace-pre-wrap">
                          {
                            selectedAssignment
                              .submission
                              .teacher_feedback
                          }
                        </p>
                      </div>
                    )}

                  </div>

                </div>
              )}

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
