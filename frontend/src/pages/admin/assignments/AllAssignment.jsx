
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import assignmentsService from "../../../services/assignmentsService";

const statusStyles = {
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
  PUBLISHED:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  CLOSED:
    "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export default function AllAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const data = await assignmentsService.getAll();

        setAssignments(data.results ?? data);
      } catch (error) {
        console.error("Failed to load assignments:", error);
        console.error(
          "ASSIGNMENT LIST API RESPONSE:",
          error.response?.data
        );

        setError("Could not load assignments.");
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;

    try {
      await assignmentsService.remove(id);

      setAssignments((prev) =>
        prev.filter((assignment) => assignment.id !== id)
      );
    } catch (error) {
      console.error("Failed to delete assignment:", error);
      alert("Failed to delete assignment.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-[var(--color-background)] p-6">
        <div className="rounded-xl bg-[var(--color-card)] p-6 shadow-sm">
          <p className="text-[var(--color-text)]">
            Loading assignments...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-[var(--color-background)] p-6">
        <div className="rounded-xl bg-[var(--color-card)] p-6 shadow-sm">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[var(--color-background)] p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Assignments
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create, manage and monitor student assignments.
          </p>
        </div>

        <Link
          to="/admin/assignments/new"
          className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
        >
          + New Assignment
        </Link>
      </div>

      {/* Empty State */}
      {assignments.length === 0 ? (
        <div className="rounded-xl bg-[var(--color-card)] p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-secondary)]/10">
            <span className="text-2xl text-[var(--color-secondary)]">
              📝
            </span>
          </div>

          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            No assignments yet
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create your first assignment to get started.
          </p>

          <Link
            to="/admin/assignments/new"
            className="mt-5 inline-flex rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Create Assignment
          </Link>
        </div>
      ) : (
        /* Assignment Table */
        <div className="overflow-hidden rounded-xl bg-[var(--color-card)] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Title
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Class
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Subject
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Teacher
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Due
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {assignments.map((assignment) => {
                  const status = assignment.status?.toUpperCase();

                  return (
                    <tr
                      key={assignment.id}
                      className="border-b border-gray-100 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/40"
                    >
                      {/* Title */}
                      <td className="px-6 py-4">
                        <Link
                          to={`/admin/assignments/${assignment.id}`}
                          className="font-medium text-[var(--color-primary)] hover:underline"
                        >
                          {assignment.title}
                        </Link>

                        {assignment.instructions && (
                          <p className="mt-1 max-w-xs truncate text-xs text-gray-500 dark:text-gray-400">
                            {assignment.instructions}
                          </p>
                        )}
                      </td>

                      {/* CLASS */}
                      <td className="px-6 py-4">
                        <span className="font-medium text-[var(--color-text)]">
                          {assignment.class_level_name || "—"}
                        </span>
                      </td>

                      {/* Subject */}
                      <td className="px-6 py-4 text-sm text-[var(--color-text)]">
                        {assignment.subject_name || "—"}
                      </td>

                      {/* Teacher */}
                      <td className="px-6 py-4 text-sm text-[var(--color-text)]">
                        {assignment.teacher_name || "—"}
                      </td>

                      {/* Due Date */}
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {assignment.due_date
                          ? new Date(
                              assignment.due_date
                            ).toLocaleString()
                          : "—"}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            statusStyles[status] ||
                            "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {assignment.status_display ||
                            assignment.status ||
                            "—"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            to={`/admin/assignments/${assignment.id}`}
                            className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                          >
                            View
                          </Link>

                          <Link
                            to={`/admin/assignments/${assignment.id}/edit`}
                            className="text-sm font-medium text-[var(--color-secondary)] hover:underline"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(assignment.id)
                            }
                            className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total assignments:{" "}
              <span className="font-semibold text-[var(--color-text)]">
                {assignments.length}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

