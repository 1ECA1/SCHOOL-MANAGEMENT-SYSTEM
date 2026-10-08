
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getClassSubjects,
  deleteClassSubject,
} from "../../../services/academicsService";

const ASSIGNMENT_TYPE_LABELS = {
  GENERAL_COMPULSORY: "General Compulsory",
  DEPARTMENT_COMPULSORY: "Department Compulsory",
  OPTIONAL: "Optional",
};

function ClassSubjects() {
  const navigate = useNavigate();

  const [classSubjects, setClassSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadClassSubjects = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getClassSubjects();

      setClassSubjects(
        Array.isArray(data) ? data : data.results || [],
      );
    } catch (err) {
      console.error("Failed to load class-subject assignments:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load class-subject assignments.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClassSubjects();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this subject from the class?",
    );

    if (!confirmed) return;

    try {
      await deleteClassSubject(id);

      setClassSubjects((current) =>
        current.filter((item) => item.id !== id),
      );
    } catch (err) {
      console.error(
        "Failed to delete class-subject assignment:",
        err,
      );

      alert(
        err.response?.data?.detail ||
          "Failed to delete class-subject assignment.",
      );
    }
  };

  const statistics = useMemo(() => {
    const total = classSubjects.length;

    const active = classSubjects.filter(
      (item) => item.is_active,
    ).length;

    const compulsory = classSubjects.filter(
      (item) => item.assignment_type !== "OPTIONAL",
    ).length;

    const optional = classSubjects.filter(
      (item) => item.assignment_type === "OPTIONAL",
    ).length;

    return {
      total,
      active,
      compulsory,
      optional,
    };
  }, [classSubjects]);

  if (loading) {
    return (
      <div className="min-h-full bg-[var(--color-background)] p-4 sm:p-6 lg:p-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div
              className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--color-primary)] dark:border-slate-700"
              role="status"
              aria-label="Loading"
            />

            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading class subjects...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[var(--color-background)] p-3 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              <span>Academic</span>
              <span>/</span>
              <span className="text-[var(--color-primary)]">
                Class Subjects
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
              Class Subjects
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
              Assign and manage subjects for each class.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/school-admin/academics/class-subjects/add",
              )
            }
            className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 dark:focus:ring-offset-slate-900 sm:w-auto"
          >
            <span className="text-lg leading-none">+</span>{" "}
            Assign Subject
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
        >
          <p className="font-semibold">
            Unable to load class subjects
          </p>

          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {/* Total */}
        <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-4 shadow-sm dark:border-slate-700/70 sm:p-5">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
              Total Assignments
            </p>

            <p className="mt-2 text-xl font-bold text-[var(--color-text)] sm:text-2xl">
              {statistics.total}
            </p>
          </div>
        </div>

        {/* Active */}
        <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-4 shadow-sm dark:border-slate-700/70 sm:p-5">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
              Active
            </p>

            <p className="mt-2 text-xl font-bold text-[var(--color-text)] sm:text-2xl">
              {statistics.active}
            </p>
          </div>
        </div>

        {/* Compulsory */}
        <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-4 shadow-sm dark:border-slate-700/70 sm:p-5">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
              Compulsory
            </p>

            <p className="mt-2 text-xl font-bold text-[var(--color-text)] sm:text-2xl">
              {statistics.compulsory}
            </p>
          </div>
        </div>

        {/* Optional */}
        <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-4 shadow-sm dark:border-slate-700/70 sm:p-5">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
              Optional
            </p>

            <p className="mt-2 text-xl font-bold text-[var(--color-text)] sm:text-2xl">
              {statistics.optional}
            </p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-700/70">
        {/* Card Header */}
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 dark:border-slate-700/70 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Subject Assignments
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              View all subjects assigned to classes.
            </p>
          </div>

          <div className="w-fit rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {classSubjects.length}{" "}
            {classSubjects.length === 1
              ? "assignment"
              : "assignments"}
          </div>
        </div>

        {/* Empty State */}
        {classSubjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-12 text-center sm:px-6 sm:py-16">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl dark:bg-slate-800">
              📚
            </div>

            <h3 className="text-lg font-semibold text-[var(--color-text)]">
              No Class Subjects Found
            </h3>

            <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              No subjects have been assigned to any class yet.
              Start by assigning a subject to a class.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/school-admin/academics/class-subjects/add",
                )
              }
              className="mt-6 w-full rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 dark:focus:ring-offset-slate-900 sm:w-auto"
            >
              <span className="text-lg leading-none">+</span>{" "}
              Assign First Subject
            </button>
          </div>
        ) : (
          <>
            {/* Mobile List */}
            <div className="divide-y divide-slate-200 dark:divide-slate-700/70 sm:hidden">
              {classSubjects.map((item, index) => {
                const className =
                  item.class_level_name ||
                  item.class_level?.name ||
                  "—";

                const subjectName =
                  item.subject_name ||
                  item.subject?.name ||
                  "—";

                const assignmentTypeLabel =
                  ASSIGNMENT_TYPE_LABELS[
                    item.assignment_type
                  ] ||
                  item.assignment_type ||
                  "—";

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 px-4 py-4"
                  >
                    {/* LEFT SIDE */}
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
                          #{index + 1}
                        </span>

                        <p className="truncate font-semibold text-[var(--color-text)]">
                          {subjectName}
                        </p>
                      </div>

                      <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                        {className}
                      </p>

                      <span
                        className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.assignment_type ===
                          "OPTIONAL"
                            ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                        }`}
                      >
                        {assignmentTypeLabel}
                      </span>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {/* Status */}
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.is_active
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                            : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                        }`}
                      >
                        {item.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/school-admin/academics/class-subjects/${item.id}/edit`,
                          )
                        }
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="min-w-[1000px] w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60">
                  <tr className="border-b border-slate-200 dark:border-slate-700/70">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      #
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Class
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Education Level
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Subject
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Department
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Assignment Type
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 dark:divide-slate-700/70">
                  {classSubjects.map((item, index) => {
                    const className =
                      item.class_level_name ||
                      item.class_level?.name ||
                      "—";

                    const educationLevel =
                      item.class_level_education_level ||
                      item.subject_education_level ||
                      "—";

                    const subjectName =
                      item.subject_name ||
                      item.subject?.name ||
                      "—";

                    const departmentName =
                      item.department_name ||
                      item.subject_department_name ||
                      item.subject?.department_name ||
                      "—";

                    const assignmentTypeLabel =
                      ASSIGNMENT_TYPE_LABELS[
                        item.assignment_type
                      ] ||
                      item.assignment_type ||
                      "—";

                    const isOptional =
                      item.assignment_type ===
                      "OPTIONAL";

                    return (
                      <tr
                        key={item.id}
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      >
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                          {index + 1}
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-semibold text-[var(--color-text)]">
                            {className}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {educationLevel}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-medium text-[var(--color-text)]">
                            {subjectName}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                          {departmentName}
                        </td>

                        <td className="px-5 py-4">
                          {isOptional ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                              {assignmentTypeLabel}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                              {assignmentTypeLabel}
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {item.is_active ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              Inactive
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/school-admin/academics/class-subjects/${item.id}/edit`,
                                )
                              }
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(item.id)
                              }
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/30"
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
          </>
        )}
      </div>
    </div>
  );
}

export default ClassSubjects;
