
import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import assignmentsService from "../../../services/assignmentsService";


// ============================================================
// STATUS STYLES
// ============================================================

const statusStyles = {
  SUBMITTED:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",

  LATE:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",

  GRADED:
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",

  RETURNED:
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
};


// ============================================================
// NORMALIZE LIST
// ============================================================

const normalizeList = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};


// ============================================================
// COMPONENT
// ============================================================

export default function Submissions() {
  const navigate = useNavigate();

  const { id } = useParams();

  const [assignment, setAssignment] =
    useState(null);

  const [submissions, setSubmissions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");


  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const [
          assignmentData,
          submissionData,
        ] = await Promise.all([
          assignmentsService.getById(id),

          assignmentsService.getSubmissions({
            assignment: id,
          }),
        ]);

        console.log(
          "ASSIGNMENT:",
          assignmentData
        );

        console.log(
          "SUBMISSIONS:",
          submissionData
        );

        setAssignment(
          assignmentData
        );

        setSubmissions(
          normalizeList(submissionData)
        );
      } catch (error) {
        console.error(
          "Failed to load submissions:",
          error
        );

        console.error(
          "SUBMISSIONS API RESPONSE:",
          error.response?.data
        );

        setError(
          "Failed to load assignment submissions."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);


  // ==========================================================
  // FILTER SUBMISSIONS
  // ==========================================================

  const filteredSubmissions =
    useMemo(() => {
      return submissions.filter(
        (submission) => {
          const studentName =
            submission.student_name ||
            "";

          const admissionNumber =
            submission.student_admission_number ||
            "";

          const matchesSearch =
            studentName
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            admissionNumber
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesStatus =
            statusFilter === "ALL" ||
            submission.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      submissions,
      search,
      statusFilter,
    ]);


  // ==========================================================
  // STATISTICS
  // ==========================================================

  const statistics = useMemo(() => {
    return {
      total: submissions.length,

      submitted:
        submissions.filter(
          (item) =>
            item.status ===
              "SUBMITTED"
        ).length,

      late:
        submissions.filter(
          (item) =>
            item.status === "LATE"
        ).length,

      graded:
        submissions.filter(
          (item) =>
            item.status === "GRADED"
        ).length,

      returned:
        submissions.filter(
          (item) =>
            item.status === "RETURNED"
        ).length,
    };
  }, [submissions]);


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(
      date
    ).toLocaleString();
  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-full bg-[var(--color-background)] p-6">
        <div className="mx-auto max-w-7xl">

          <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-8 shadow-sm dark:border-gray-700">

            <div className="flex items-center gap-3">

              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--color-primary)]" />

              <p className="text-sm text-[var(--color-text)]">
                Loading submissions...
              </p>

            </div>

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
      <div className="min-h-full bg-[var(--color-background)] p-6">

        <div className="mx-auto max-w-7xl">

          <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">

            <p className="text-red-700 dark:text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/admin/assignments/${id}`
                )
              }
              className="mt-4 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Back to Assignment
            </button>

          </div>

        </div>

      </div>
    );
  }


  // ==========================================================
  // MAIN
  // ==========================================================

  return (
    <div className="min-h-full bg-[var(--color-background)] p-6">

      <div className="mx-auto max-w-7xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6">

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

            <div>

              <div className="mb-2 flex items-center gap-2">

                <Link
                  to="/admin/assignments"
                  className="text-sm text-[var(--color-primary)] hover:underline"
                >
                  Assignments
                </Link>

                <span className="text-gray-400">
                  /
                </span>

                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Submissions
                </span>

              </div>

              <h1 className="text-2xl font-bold text-[var(--color-text)]">
                Assignment Submissions
              </h1>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {assignment?.title ||
                  "Assignment"}
              </p>

            </div>

            <div className="flex gap-2">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/admin/assignments/${id}`
                  )
                }
                className="rounded-lg border border-gray-300 bg-[var(--color-card)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                Back to Assignment
              </button>

            </div>

          </div>

        </div>


        {/* ==================================================
            STATISTICS
        ================================================== */}

        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">

          {/* TOTAL */}

          <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-5 shadow-sm dark:border-gray-700">

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total
            </p>

            <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">
              {statistics.total}
            </p>

          </div>


          {/* SUBMITTED */}

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900/50 dark:bg-blue-950/20">

            <p className="text-sm text-blue-700 dark:text-blue-400">
              Submitted
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-400">
              {statistics.submitted}
            </p>

          </div>


          {/* LATE */}

          <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-5 dark:border-yellow-900/50 dark:bg-yellow-950/20">

            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              Late
            </p>

            <p className="mt-2 text-2xl font-bold text-yellow-700 dark:text-yellow-400">
              {statistics.late}
            </p>

          </div>


          {/* GRADED */}

          <div className="rounded-xl border border-green-100 bg-green-50 p-5 dark:border-green-900/50 dark:bg-green-950/20">

            <p className="text-sm text-green-700 dark:text-green-400">
              Graded
            </p>

            <p className="mt-2 text-2xl font-bold text-green-700 dark:text-green-400">
              {statistics.graded}
            </p>

          </div>


          {/* RETURNED */}

          <div className="rounded-xl border border-cyan-100 bg-cyan-50 p-5 dark:border-cyan-900/50 dark:bg-cyan-950/20">

            <p className="text-sm text-cyan-700 dark:text-cyan-400">
              Returned
            </p>

            <p className="mt-2 text-2xl font-bold text-cyan-700 dark:text-cyan-400">
              {statistics.returned}
            </p>

          </div>

        </div>


        {/* ==================================================
            FILTERS
        ================================================== */}

        <div className="mb-6 rounded-xl border border-gray-200 bg-[var(--color-card)] p-4 shadow-sm dark:border-gray-700">

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* SEARCH */}

            <div className="md:col-span-2">

              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Search Student
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search by student name or admission number..."
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />

            </div>


            {/* STATUS */}

            <div>

              <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              >

                <option value="ALL">
                  All Statuses
                </option>

                <option value="SUBMITTED">
                  Submitted
                </option>

                <option value="LATE">
                  Late
                </option>

                <option value="GRADED">
                  Graded
                </option>

                <option value="RETURNED">
                  Returned
                </option>

              </select>

            </div>

          </div>

        </div>


        {/* ==================================================
            SUBMISSIONS TABLE
        ================================================== */}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-[var(--color-card)] shadow-sm dark:border-gray-700">

          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="font-semibold text-[var(--color-text)]">
                  Student Submissions
                </h2>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {filteredSubmissions.length} submission
                  {filteredSubmissions.length !== 1
                    ? "s"
                    : ""}{" "}
                  found
                </p>

              </div>

            </div>

          </div>


          {filteredSubmissions.length === 0 ? (

            <div className="px-6 py-12 text-center">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                📄
              </div>

              <h3 className="font-semibold text-[var(--color-text)]">
                No submissions found
              </h3>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                There are no submissions matching your current filters.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead className="bg-gray-50 dark:bg-gray-800/70">

                  <tr>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Student
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Submitted
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Status
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Score
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">

                  {filteredSubmissions.map(
                    (submission) => {

                      const status =
                        submission.status?.toUpperCase();

                      return (
                        <tr
                          key={
                            submission.id
                          }
                          className="transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        >

                          {/* STUDENT */}

                          <td className="px-6 py-4">

                            <p className="font-medium text-[var(--color-text)]">
                              {submission.student_name ||
                                "Unknown Student"}
                            </p>

                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {submission.student_admission_number ||
                                "No admission number"}
                            </p>

                          </td>


                          {/* SUBMITTED */}

                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                            {formatDate(
                              submission.submitted_at
                            )}
                          </td>


                          {/* STATUS */}

                          <td className="px-6 py-4">

                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                statusStyles[
                                  status
                                ] ||
                                "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                              }`}
                            >
                              {submission.status_display ||
                                submission.status ||
                                "Unknown"}
                            </span>

                          </td>


                          {/* SCORE */}

                          <td className="px-6 py-4">

                            {submission.score !==
                              null &&
                            submission.score !==
                              undefined ? (
                              <span className="font-semibold text-[var(--color-text)]">
                                {
                                  submission.score
                                }
                                /
                                {
                                  submission.maximum_score
                                }
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">
                                Not graded
                              </span>
                            )}

                          </td>


                          {/* ACTION */}

                          <td className="px-6 py-4 text-right">

                            <Link
                              to={`/admin/assignments/${id}/submissions/${submission.id}`}
                              className="inline-flex rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-medium text-white transition hover:opacity-90"
                            >
                              View
                            </Link>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}
