// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import { getStudents } from "../../../services/studentsService";

// function AllStudents() {
//   const navigate = useNavigate();

//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const loadStudents = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const data = await getStudents();

//         setStudents(Array.isArray(data) ? data : data?.results || []);
//       } catch (err) {
//         console.error("Failed to load students:", err);

//         setError(err.response?.data?.detail || "Unable to load students.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadStudents();
//   }, []);

//   return (
//     <div className="w-full">
//       {/* Header */}
//       <div className="mb-6 flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold text-[var(--color-text)]">
//             All Students
//           </h1>

//           <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//             View and manage all registered students.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={() => navigate("/admin/students/add")}
//           className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
//         >
//           + Add Student
//         </button>
//       </div>

//       {/* Error */}
//       {error && (
//         <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
//           {error}
//         </div>
//       )}

//       {/* Students Table */}
//       <div className="overflow-hidden rounded-xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-800">
//         {loading ? (
//           /* Loading */
//           <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
//             Loading students...
//           </div>
//         ) : students.length === 0 ? (
//           /* Empty State */
//           <div className="p-8 text-center">
//             <p className="text-sm font-medium text-[var(--color-text)]">
//               No students found.
//             </p>

//             <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//               Add your first student to get started.
//             </p>

//             <button
//               type="button"
//               onClick={() => navigate("/admin/students/add")}
//               className="mt-4 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
//             >
//               Add Student
//             </button>
//           </div>
//         ) : (
//           /* Table */
//           <div className="overflow-x-auto">
//             <table className="w-full text-left text-sm">
//               <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
//                 <tr>
//                   <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
//                     Admission No.
//                   </th>

//                   <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
//                     Student Name
//                   </th>

//                   <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
//                     Gender
//                   </th>

//                   <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
//                     Date of Birth
//                   </th>

//                   <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
//                     Status
//                   </th>

//                   <th className="px-5 py-4 text-right font-semibold text-slate-600 dark:text-slate-300">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
//                 {students.map((student) => {
//                   const fullName =
//                     student.full_name ||
//                     [student.first_name, student.middle_name, student.last_name]
//                       .filter(Boolean)
//                       .join(" ");

//                   return (
//                     <tr
//                       key={student.id}
//                       className="transition hover:bg-slate-50 dark:hover:bg-slate-900/40"
//                     >
//                       {/* Admission Number */}
//                       <td className="px-5 py-4 font-medium text-[var(--color-text)]">
//                         {student.admission_number || "—"}
//                       </td>

//                       {/* Student Name */}
//                       <td className="px-5 py-4 text-[var(--color-text)]">
//                         {fullName || "Unnamed Student"}
//                       </td>

//                       {/* Gender */}
//                       <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
//                         {student.gender || "—"}
//                       </td>

//                       {/* Date of Birth */}
//                       <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
//                         {student.date_of_birth || "—"}
//                       </td>

//                       {/* Status */}
//                       <td className="px-5 py-4">
//                         <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
//                           {student.status || "ACTIVE"}
//                         </span>
//                       </td>

//                       {/* Actions */}
//                       <td className="px-5 py-4 text-right">
//                         <button
//                           type="button"
//                           onClick={() =>
//                             navigate(`/admin/students/${student.id}`)
//                           }
//                           className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
//                         >
//                           View
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default AllStudents;

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// import { getStudents } from "../../../services/studentsService";

import { getStudents, updateStudent } from "../../../services/studentsService";

const STUDENTS_PER_PAGE = 10;

function AllStudents() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search and filters
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const [showStatusModal, setShowStatusModal] = useState(false);

  const [studentToUpdate, setStudentToUpdate] = useState(null);

  const [newStatus, setNewStatus] = useState("");

  const [updatingStatus, setUpdatingStatus] = useState(false);
  // =====================================================
  // LOAD STUDENTS
  // =====================================================

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getStudents();

      const studentList = Array.isArray(data) ? data : data?.results || [];

      setStudents(studentList);
    } catch (err) {
      console.error("Failed to load students:", err);

      setError(err.response?.data?.detail || "Unable to load students.");
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
    const searchValue = search.trim().toLowerCase();

    return students.filter((student) => {
      const fullName =
        student.full_name ||
        [student.first_name, student.middle_name, student.last_name]
          .filter(Boolean)
          .join(" ");

      const admissionNumber = student.admission_number || "";

      const matchesSearch =
        !searchValue ||
        fullName.toLowerCase().includes(searchValue) ||
        admissionNumber.toLowerCase().includes(searchValue);

      const matchesGender =
        !genderFilter ||
        String(student.gender || "").toUpperCase() === genderFilter;

      const studentStatus = String(student.status || "ACTIVE").toUpperCase();

      const matchesStatus = !statusFilter || studentStatus === statusFilter;

      return matchesSearch && matchesGender && matchesStatus;
    });
  }, [students, search, genderFilter, statusFilter]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE),
  );

  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE;

    return filteredStudents.slice(startIndex, startIndex + STUDENTS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  //   STSTUS

  const openStatusModal = (student) => {
    setStudentToUpdate(student);

    setNewStatus(String(student.status || "ACTIVE").toUpperCase());

    setShowStatusModal(true);
  };

  const closeStatusModal = () => {
    if (updatingStatus) return;

    setShowStatusModal(false);
    setStudentToUpdate(null);
    setNewStatus("");
  };

  const handleStatusUpdate = async () => {
    if (!studentToUpdate || !newStatus) return;

    try {
      setUpdatingStatus(true);
      setError("");

      const updatedStudent = await updateStudent(studentToUpdate.id, {
        status: newStatus,
      });

      setStudents((currentStudents) =>
        currentStudents.map((student) =>
          student.id === studentToUpdate.id
            ? {
                ...student,
                ...updatedStudent,
              }
            : student,
        ),
      );

      closeStatusModal();
    } catch (err) {
      console.error("Failed to update student status:", err);

      console.error("Server response:", err.response?.data);

      setError(
        err.response?.data?.detail || "Unable to update student status.",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };
  //   DELETE

  const openDeleteModal = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deletingId) return;

    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      setDeletingId(studentToDelete.id);
      setError("");

      await deleteStudent(studentToDelete.id);

      // Remove from the current list
      setStudents((currentStudents) =>
        currentStudents.filter((student) => student.id !== studentToDelete.id),
      );

      closeDeleteModal();
    } catch (err) {
      console.error("Failed to delete student:", err);

      setError(err.response?.data?.detail || "Unable to delete student.");
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // RESET PAGE WHEN FILTER CHANGES
  // =====================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [search, genderFilter, statusFilter]);

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearch("");
    setGenderFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  const hasFilters = search || genderFilter || statusFilter;

  // =====================================================
  // PAGE NUMBERS
  // =====================================================

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1,
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="w-full">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            All Students
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            View and manage all registered students.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/students/add")}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
        >
          + Add Student
        </button>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

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

      {/* =================================================
          SEARCH + FILTERS
      ================================================= */}

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
                onChange={(e) => setSearch(e.target.value)}
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
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] dark:border-slate-700"
            >
              <option value="">All Genders</option>

              <option value="MALE">Male</option>

              <option value="FEMALE">Female</option>

              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Status */}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Status
            </label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] dark:border-slate-700"
            >
              <option value="">All Statuses</option>

              <option value="ACTIVE">Active</option>

              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Filter Footer */}

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing{" "}
            <span className="font-semibold text-[var(--color-text)]">
              {filteredStudents.length}
            </span>{" "}
            student
            {filteredStudents.length === 1 ? "" : "s"}
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

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-800">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Loading students...
          </div>
        ) : filteredStudents.length === 0 ? (
          /* Empty */

          <div className="p-8 text-center">
            <p className="text-sm font-medium text-[var(--color-text)]">
              No students found.
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {hasFilters
                ? "Try changing your search or filters."
                : "Add your first student to get started."}
            </p>

            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Clear Filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/admin/students/add")}
                className="mt-4 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Add Student
              </button>
            )}
          </div>
        ) : (
          <>
            {showStatusModal && studentToUpdate && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="w-full max-w-md rounded-xl bg-[var(--color-card)] p-6 shadow-2xl">
                  <h2 className="text-lg font-bold text-[var(--color-text)]">
                    Change Student Status
                  </h2>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Update the status of{" "}
                    <span className="font-semibold text-[var(--color-text)]">
                      {studentToUpdate.full_name ||
                        [
                          studentToUpdate.first_name,
                          studentToUpdate.middle_name,
                          studentToUpdate.last_name,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                    </span>
                    .
                  </p>

                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                      Student Status
                    </label>

                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] dark:border-slate-700"
                    >
                      <option value="ACTIVE">Active</option>

                      <option value="GRADUATED">Graduated</option>

                      <option value="TRANSFERRED">Transferred</option>

                      <option value="SUSPENDED">Suspended</option>

                      <option value="WITHDRAWN">Withdrawn</option>
                    </select>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      disabled={updatingStatus}
                      onClick={closeStatusModal}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-[var(--color-text)] hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={updatingStatus}
                      onClick={handleStatusUpdate}
                      className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingStatus ? "Updating..." : "Update Status"}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Table */}

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
                      Gender
                    </th>

                    <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      Date of Birth
                    </th>

                    <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right font-semibold text-slate-600 dark:text-slate-300">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedStudents.map((student) => {
                    const fullName =
                      student.full_name ||
                      [
                        student.first_name,
                        student.middle_name,
                        student.last_name,
                      ]
                        .filter(Boolean)
                        .join(" ");

                    const status = String(
                      student.status || "ACTIVE",
                    ).toUpperCase();

                    return (
                      <tr
                        key={student.id}
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-900/40"
                      >
                        {/* Admission */}

                        <td className="px-5 py-4 font-medium text-[var(--color-text)]">
                          {student.admission_number || "—"}
                        </td>

                        {/* Name */}

                        <td className="px-5 py-4 text-[var(--color-text)]">
                          {fullName || "Unnamed Student"}
                        </td>

                        {/* Gender */}

                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                          {student.gender || "—"}
                        </td>

                        {/* DOB */}

                        <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                          {student.date_of_birth || "—"}
                        </td>

                        {/* Status */}

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              status === "ACTIVE"
                                ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {status}
                          </span>
                        </td>

                        {/* Actions */}

                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/admin/students/${student.id}`)
                              }
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                            >
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/admin/students/${student.id}/edit`)
                              }
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => openStatusModal(student)}
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                            >
                              Status
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {showDeleteModal && studentToDelete && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="w-full max-w-md rounded-xl bg-[var(--color-card)] p-6 shadow-2xl">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl dark:bg-red-950/40">
                    ⚠️
                  </div>

                  <h2 className="text-lg font-bold text-[var(--color-text)]">
                    Delete Student?
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-[var(--color-text)]">
                      {studentToDelete.full_name ||
                        [
                          studentToDelete.first_name,
                          studentToDelete.middle_name,
                          studentToDelete.last_name,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                    </span>
                    ?
                  </p>

                  <p className="mt-2 text-xs text-red-500">
                    This action may affect the student's historical records.
                  </p>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      disabled={!!deletingId}
                      onClick={closeDeleteModal}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      disabled={!!deletingId}
                      onClick={handleDeleteStudent}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId ? "Deleting..." : "Yes, Delete"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                PAGINATION
            ================================================= */}

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

              <div className="flex items-center gap-1">
                {/* Previous */}

                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => page - 1)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Previous
                </button>

                {/* Page Numbers */}

                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition ${
                      currentPage === page
                        ? "bg-[var(--color-primary)] text-white"
                        : "border border-slate-200 text-[var(--color-text)] hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next */}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => page + 1)}
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

export default AllStudents;
