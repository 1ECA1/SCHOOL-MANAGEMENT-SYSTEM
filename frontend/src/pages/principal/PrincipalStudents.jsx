import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getStudents,
  getEnrollments,
} from "../../services/studentsService";

const STUDENTS_PER_PAGE = 10;

const STATUS_ORDER = {
  ACTIVE: 1,
  GRADUATED: 2,
  TRANSFERRED: 3,
  SUSPENDED: 4,
  WITHDRAWN: 5,
};

const getStatusLabel = (status) => {
  const labels = {
    ACTIVE: "Active",
    GRADUATED: "Graduated",
    TRANSFERRED: "Transferred",
    SUSPENDED: "Suspended",
    WITHDRAWN: "Withdrawn",
  };

  return labels[status] || "Active";
};

const getStatusClasses = (status) => {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400";

    case "GRADUATED":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400";

    case "TRANSFERRED":
      return "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400";

    case "SUSPENDED":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400";

    case "WITHDRAWN":
      return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400";

    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
  }
};

function PrincipalStudents() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  // =====================================================
  // LOAD STUDENTS
  // =====================================================

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const [studentsData, enrollmentsData] =
        await Promise.all([
          getStudents(),
          getEnrollments(),
        ]);

      const studentList = Array.isArray(studentsData)
        ? studentsData
        : studentsData?.results || [];

      const enrollmentList = Array.isArray(enrollmentsData)
        ? enrollmentsData
        : enrollmentsData?.results || [];

      const studentsWithEnrollment = studentList.map(
        (student) => {
          const studentEnrollments =
            enrollmentList.filter(
              (enrollment) =>
                String(enrollment.student) ===
                String(student.id),
            );

          const currentEnrollment =
            studentEnrollments.find(
              (enrollment) =>
                enrollment.is_current === true,
            ) ||
            [...studentEnrollments].sort(
              (a, b) => b.id - a.id,
            )[0] ||
            null;

          return {
            ...student,
            current_enrollment: currentEnrollment,
          };
        },
      );

      setStudents(studentsWithEnrollment);
    } catch (err) {
      console.error(
        "Failed to load principal students:",
        err,
      );

      console.error(
        "Server response:",
        err.response?.data,
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load students.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // =====================================================
  // FILTER STUDENTS
  // =====================================================

  const filteredStudents = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    const filtered = students.filter(
      (student) => {
        const fullName =
          student.full_name ||
          [
            student.first_name,
            student.middle_name,
            student.last_name,
          ]
            .filter(Boolean)
            .join(" ");

        const admissionNumber =
          student.admission_number || "";

        const matchesSearch =
          !searchValue ||
          fullName
            .toLowerCase()
            .includes(searchValue) ||
          admissionNumber
            .toLowerCase()
            .includes(searchValue);

        const matchesGender =
          !genderFilter ||
          String(student.gender || "")
            .toUpperCase() === genderFilter;

        const status = String(
          student.status || "ACTIVE",
        ).toUpperCase();

        const matchesStatus =
          !statusFilter ||
          status === statusFilter;

        return (
          matchesSearch &&
          matchesGender &&
          matchesStatus
        );
      },
    );

    return [...filtered].sort((a, b) => {
      const statusA = String(
        a.status || "ACTIVE",
      ).toUpperCase();

      const statusB = String(
        b.status || "ACTIVE",
      ).toUpperCase();

      const statusDifference =
        (STATUS_ORDER[statusA] || 99) -
        (STATUS_ORDER[statusB] || 99);

      if (statusDifference !== 0) {
        return statusDifference;
      }

      const nameA = (
        a.full_name ||
        [
          a.first_name,
          a.middle_name,
          a.last_name,
        ]
          .filter(Boolean)
          .join(" ")
      ).toLowerCase();

      const nameB = (
        b.full_name ||
        [
          b.first_name,
          b.middle_name,
          b.last_name,
        ]
          .filter(Boolean)
          .join(" ")
      ).toLowerCase();

      return nameA.localeCompare(nameB);
    });
  }, [
    students,
    search,
    genderFilter,
    statusFilter,
  ]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredStudents.length /
        STUDENTS_PER_PAGE,
    ),
  );

  const paginatedStudents = useMemo(() => {
    const startIndex =
      (currentPage - 1) *
      STUDENTS_PER_PAGE;

    return filteredStudents.slice(
      startIndex,
      startIndex + STUDENTS_PER_PAGE,
    );
  }, [
    filteredStudents,
    currentPage,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    genderFilter,
    statusFilter,
  ]);

  const clearFilters = () => {
    setSearch("");
    setGenderFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  const hasFilters =
    search ||
    genderFilter ||
    statusFilter;

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="w-full">

      {/* HEADER */}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Students
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          View students in your school.
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          <span>{error}</span>

          <button
            type="button"
            onClick={loadStudents}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* FILTERS */}

      <div className="mb-5 rounded-xl border border-slate-200 bg-[var(--color-card)] p-4 shadow-sm dark:border-slate-800">

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">

          {/* Search */}

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Search
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search name or admission number..."
                className="w-full rounded-lg border border-slate-200 bg-[var(--color-background)] py-2.5 pl-9 pr-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] dark:border-slate-700"
              />
            </div>
          </div>

          {/* Gender */}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Gender
            </label>

            <select
              value={genderFilter}
              onChange={(e) =>
                setGenderFilter(
                  e.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-200 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] dark:border-slate-700"
            >
              <option value="">
                All Genders
              </option>

              <option value="MALE">
                Male
              </option>

              <option value="FEMALE">
                Female
              </option>

              <option value="OTHER">
                Other
              </option>
            </select>
          </div>

          {/* Status */}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-200 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] dark:border-slate-700"
            >
              <option value="">
                All Statuses
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="GRADUATED">
                Graduated
              </option>

              <option value="TRANSFERRED">
                Transferred
              </option>

              <option value="SUSPENDED">
                Suspended
              </option>

              <option value="WITHDRAWN">
                Withdrawn
              </option>
            </select>
          </div>

        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing{" "}
            <span className="font-semibold text-[var(--color-text)]">
              {filteredStudents.length}
            </span>{" "}
            student
            {filteredStudents.length === 1
              ? ""
              : "s"}
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
            >
              Clear Filters
            </button>
          )}

        </div>
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-800">

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Loading students...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-[var(--color-text)]">
              No students found.
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {hasFilters
                ? "Try changing your search or filters."
                : "There are no students to display."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">

                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      Admission No.
                    </th>

                    <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      Student Name
                    </th>

                    <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      Class
                    </th>

                    <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      Session
                    </th>

                    <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      Term
                    </th>

                    <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      Gender
                    </th>

                    <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right font-semibold text-slate-600 dark:text-slate-300">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                  {paginatedStudents.map(
                    (student) => {
                      const fullName =
                        student.full_name ||
                        [
                          student.first_name,
                          student.middle_name,
                          student.last_name,
                        ]
                          .filter(Boolean)
                          .join(" ");

                      const status =
                        String(
                          student.status ||
                            "ACTIVE",
                        ).toUpperCase();

                      const enrollment =
                        student.current_enrollment;

                      return (
                        <tr
                          key={student.id}
                          className="transition hover:bg-slate-50 dark:hover:bg-slate-900/40"
                        >

                          <td className="px-5 py-4 font-medium text-[var(--color-text)]">
                            {student.admission_number ||
                              "—"}
                          </td>

                          <td className="px-5 py-4 text-[var(--color-text)]">
                            {fullName ||
                              "Unnamed Student"}
                          </td>

                          <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                            {enrollment?.class_name ||
                              "—"}
                          </td>

                          <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                            {enrollment?.session_name ||
                              "—"}
                          </td>

                          <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                            {enrollment?.term_name ||
                              "—"}
                          </td>

                          <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                            {student.gender ||
                              "—"}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                                status,
                              )}`}
                            >
                              {getStatusLabel(
                                status,
                              )}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/admin/students/${student.id}`,
                                )
                              }
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                            >
                              View
                            </button>
                          </td>

                        </tr>
                      );
                    },
                  )}

                </tbody>
              </table>
            </div>

            {/* PAGINATION */}

            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Page{" "}
                <span className="font-semibold text-[var(--color-text)]">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[var(--color-text)]">
                  {totalPages}
                </span>
              </p>

              <div className="flex flex-wrap items-center gap-1">

                <button
                  type="button"
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) => page - 1,
                    )
                  }
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Previous
                </button>

                {pageNumbers.map(
                  (page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() =>
                        setCurrentPage(
                          page,
                        )
                      }
                      className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition ${
                        currentPage ===
                        page
                          ? "bg-[var(--color-primary)] text-white"
                          : "border border-slate-200 text-[var(--color-text)] hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) => page + 1,
                    )
                  }
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Next
                </button>

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PrincipalStudents;