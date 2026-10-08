import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getStudents,
  getEnrollments,
  updateStudent,
  deleteStudent,
} from "../../../services/studentsService";

const STUDENTS_PER_PAGE = 10;

const STATUS_ORDER = {
  ACTIVE: 1,
  GRADUATED: 2,
  TRANSFERRED: 3,
  SUSPENDED: 4,
  WITHDRAWN: 5,
};

const Students = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);

  const [statusModal, setStatusModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  const [savingStatus, setSavingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // =====================================================
  // LOAD STUDENTS
  // =====================================================

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const [studentsData, enrollmentsData] = await Promise.all([
        getStudents(),
        getEnrollments(),
      ]);

      const studentsList = Array.isArray(studentsData)
        ? studentsData
        : studentsData?.results || [];

      const enrollmentsList = Array.isArray(enrollmentsData)
        ? enrollmentsData
        : enrollmentsData?.results || [];

      setStudents(studentsList);
      setEnrollments(enrollmentsList);
    } catch (err) {
      console.error("Failed to load students:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to load students. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // =====================================================
  // CURRENT ENROLLMENT
  // =====================================================

  const studentsWithEnrollment = useMemo(() => {
    return students.map((student) => {
      const studentEnrollments = enrollments
        .filter((enrollment) => {
          const enrollmentStudentId =
            enrollment.student?.id ?? enrollment.student;

          return Number(enrollmentStudentId) === Number(student.id);
        })
        .sort((a, b) => Number(b.id) - Number(a.id));

      const currentEnrollment =
        studentEnrollments.find(
          (enrollment) => enrollment.is_current === true
        ) || studentEnrollments[0] || null;

      return {
        ...student,
        current_enrollment: currentEnrollment,
      };
    });
  }, [students, enrollments]);

  // =====================================================
  // FILTER + SORT
  // =====================================================

  const filteredStudents = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return [...studentsWithEnrollment]
      .filter((student) => {
        if (!searchValue) return true;

        const fullName = [
          student.first_name,
          student.middle_name,
          student.last_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const admissionNumber =
          student.admission_number?.toLowerCase() || "";

        return (
          fullName.includes(searchValue) ||
          admissionNumber.includes(searchValue)
        );
      })
      .filter((student) => {
        if (genderFilter === "ALL") return true;

        return (
          student.gender?.toUpperCase() ===
          genderFilter
        );
      })
      .filter((student) => {
        if (statusFilter === "ALL") return true;

        return (
          student.status?.toUpperCase() ===
          statusFilter
        );
      })
      .sort((a, b) => {
        const statusA =
          STATUS_ORDER[a.status?.toUpperCase()] || 99;

        const statusB =
          STATUS_ORDER[b.status?.toUpperCase()] || 99;

        if (statusA !== statusB) {
          return statusA - statusB;
        }

        const nameA = [
          a.first_name,
          a.middle_name,
          a.last_name,
        ]
          .filter(Boolean)
          .join(" ");

        const nameB = [
          b.first_name,
          b.middle_name,
          b.last_name,
        ]
          .filter(Boolean)
          .join(" ");

        return nameA.localeCompare(nameB);
      });
  }, [
    studentsWithEnrollment,
    search,
    genderFilter,
    statusFilter,
  ]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.ceil(
    filteredStudents.length / STUDENTS_PER_PAGE
  );

  const paginatedStudents = useMemo(() => {
    const start =
      (currentPage - 1) * STUDENTS_PER_PAGE;

    return filteredStudents.slice(
      start,
      start + STUDENTS_PER_PAGE
    );
  }, [filteredStudents, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, genderFilter, statusFilter]);

  useEffect(() => {
    if (
      totalPages > 0 &&
      currentPage > totalPages
    ) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // =====================================================
  // STUDENT NAME
  // =====================================================

  const getStudentName = (student) => {
    return [
      student.first_name,
      student.middle_name,
      student.last_name,
    ]
      .filter(Boolean)
      .join(" ");
  };

  // =====================================================
  // CLASS NAME
  // =====================================================

  const getClassName = (student) => {
    const enrollment = student.current_enrollment;

    if (!enrollment) {
      return "Not enrolled";
    }

    return (
      enrollment.class_level_name ||
      enrollment.class_level?.name ||
      enrollment.class_name ||
      enrollment.class_level ||
      "Not assigned"
    );
  };

  // =====================================================
  // STATUS BADGE
  // =====================================================

  const getStatusBadge = (status) => {
    const normalized = status?.toUpperCase();

    switch (normalized) {
      case "ACTIVE":
        return (
          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
            Active
          </span>
        );

      case "GRADUATED":
        return (
          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
            Graduated
          </span>
        );

      case "TRANSFERRED":
        return (
          <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700 dark:bg-purple-950/40 dark:text-purple-400">
            Transferred
          </span>
        );

      case "SUSPENDED":
        return (
          <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400">
            Suspended
          </span>
        );

      case "WITHDRAWN":
        return (
          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400">
            Withdrawn
          </span>
        );

      default:
        return (
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {status || "Unknown"}
          </span>
        );
    }
  };

  // =====================================================
  // CHANGE STATUS
  // =====================================================

  const handleStatusChange = async () => {
    if (!statusModal) return;

    try {
      setSavingStatus(true);

      await updateStudent(statusModal.id, {
        status: statusModal.status,
      });

      setStatusModal(null);

      await loadStudents();
    } catch (err) {
      console.error("Failed to update student status:", err);

      alert(
        err?.response?.data?.detail ||
          "Failed to update student status."
      );
    } finally {
      setSavingStatus(false);
    }
  };

  // =====================================================
  // DELETE STUDENT
  // =====================================================

  const handleDelete = async () => {
    if (!deleteModal) return;

    try {
      setDeleting(true);

      await deleteStudent(deleteModal.id);

      setDeleteModal(null);

      await loadStudents();
    } catch (err) {
      console.error("Failed to delete student:", err);

      alert(
        err?.response?.data?.detail ||
          "Failed to delete student."
      );
    } finally {
      setDeleting(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Loading students...
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/40 dark:bg-red-950/20">
        <p className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>

        <button
          type="button"
          onClick={loadStudents}
          className="mt-4 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Students
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage students in your school.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/school-admin/people/students/add")
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
        >
          <span className="text-lg leading-none">+</span>
          Add Student
        </button>
      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-4 shadow-sm dark:border-gray-800">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* SEARCH */}

          <div className="md:col-span-1">
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              Search
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Name or admission number..."
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          {/* GENDER */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              Gender
            </label>

            <select
              value={genderFilter}
              onChange={(e) =>
                setGenderFilter(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="ALL">All Genders</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          {/* STATUS */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="GRADUATED">Graduated</option>
              <option value="TRANSFERRED">
                Transferred
              </option>
              <option value="SUSPENDED">Suspended</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>
          </div>
        </div>
      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing{" "}
          <span className="font-medium text-[var(--color-text)]">
            {filteredStudents.length}
          </span>{" "}
          student
          {filteredStudents.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* =====================================================
          TABLE
      ===================================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-[var(--color-card)] shadow-sm dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Student
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Admission No.
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Gender
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Class
                </th>

                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Status
                </th>

                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {paginatedStudents.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-12 text-center"
                  >
                    <p className="text-sm font-medium text-[var(--color-text)]">
                      No students found
                    </p>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Try changing your search or filters.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="transition hover:bg-gray-50 dark:hover:bg-gray-900/50"
                  >
                    {/* STUDENT */}

                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-sm font-semibold text-[var(--color-primary)]">
                          {(
                            student.first_name?.[0] ||
                            ""
                          ).toUpperCase()}
                          {(
                            student.last_name?.[0] ||
                            ""
                          ).toUpperCase()}
                        </div>

                        <div>
                          <p className="font-medium text-[var(--color-text)]">
                            {getStudentName(student)}
                          </p>

                          {student.email && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {student.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* ADMISSION NUMBER */}

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {student.admission_number || "—"}
                    </td>

                    {/* GENDER */}

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {student.gender || "—"}
                    </td>

                    {/* CLASS */}

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {getClassName(student)}
                    </td>

                    {/* STATUS */}

                    <td className="whitespace-nowrap px-4 py-4">
                      {getStatusBadge(student.status)}
                    </td>

                    {/* ACTIONS */}

                    <td className="whitespace-nowrap px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/school-admin/people/students/${student.id}`
                            )
                          }
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/school-admin/people/students/${student.id}/edit`
                            )
                          }
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setStatusModal({
                              ...student,
                              status:
                                student.status || "ACTIVE",
                            })
                          }
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10"
                        >
                          Status
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDeleteModal(student)
                          }
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* =====================================================
            PAGINATION
        ===================================================== */}

        {totalPages > 1 && (
          <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.max(1, page - 1)
                  )
                }
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
              >
                Previous
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() =>
                    setCurrentPage(page)
                  }
                  className={`h-8 min-w-8 rounded-lg px-2 text-sm font-medium ${
                    page === currentPage
                      ? "bg-[var(--color-primary)] text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={
                  currentPage === totalPages
                }
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1)
                  )
                }
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          STATUS MODAL
      ===================================================== */}

      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-[var(--color-card)] p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Change Student Status
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {getStudentName(statusModal)}
            </p>

            <div className="mt-5">
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
                Status
              </label>

              <select
                value={statusModal.status}
                onChange={(e) =>
                  setStatusModal((current) => ({
                    ...current,
                    status: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="ACTIVE">Active</option>
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

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setStatusModal(null)
                }
                disabled={savingStatus}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 dark:border-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStatusChange}
                disabled={savingStatus}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {savingStatus
                  ? "Saving..."
                  : "Save Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-[var(--color-card)] p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">
              Delete Student
            </h2>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete{" "}
              <span className="font-medium text-[var(--color-text)]">
                {getStudentName(deleteModal)}
              </span>
              ?
            </p>

            <p className="mt-2 text-xs text-red-500">
              This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setDeleteModal(null)
                }
                disabled={deleting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 dark:border-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Student"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;