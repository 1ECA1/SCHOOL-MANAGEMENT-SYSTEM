// import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import {
//   getStudents,
//   getEnrollments,
//   updateStudent,
//   deleteStudent,
// } from "../../../services/studentsService";

// const STUDENTS_PER_PAGE = 10;

// // =====================================================
// // STATUS ORDER
// // =====================================================

// const STATUS_ORDER = {
//   ACTIVE: 1,
//   GRADUATED: 2,
//   TRANSFERRED: 3,
//   SUSPENDED: 4,
//   WITHDRAWN: 5,
// };

// // =====================================================
// // STATUS LABEL
// // =====================================================

// const getStatusLabel = (status) => {
//   const labels = {
//     ACTIVE: "Active",
//     GRADUATED: "Graduated",
//     TRANSFERRED: "Transferred",
//     SUSPENDED: "Suspended",
//     WITHDRAWN: "Withdrawn",
//   };

//   return labels[status] || "Active";
// };

// // =====================================================
// // STATUS STYLE
// // =====================================================

// const getStatusClasses = (status) => {
//   switch (status) {
//     case "ACTIVE":
//       return "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400";

//     case "GRADUATED":
//       return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400";

//     case "TRANSFERRED":
//       return "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400";

//     case "SUSPENDED":
//       return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400";

//     case "WITHDRAWN":
//       return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400";

//     default:
//       return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
//   }
// };

// // =====================================================
// // COMPONENT
// // =====================================================

// function AllStudents() {
//   const navigate = useNavigate();

//   const [students, setStudents] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // =====================================================
//   // SEARCH / FILTERS
//   // =====================================================

//   const [search, setSearch] = useState("");
//   const [genderFilter, setGenderFilter] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");

//   // =====================================================
//   // PAGINATION
//   // =====================================================

//   const [currentPage, setCurrentPage] = useState(1);

//   // =====================================================
//   // DELETE
//   // =====================================================

//   const [deletingId, setDeletingId] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [studentToDelete, setStudentToDelete] = useState(null);

//   // =====================================================
//   // STATUS UPDATE
//   // =====================================================

//   const [showStatusModal, setShowStatusModal] = useState(false);
//   const [studentToUpdate, setStudentToUpdate] = useState(null);
//   const [newStatus, setNewStatus] = useState("");
//   const [updatingStatus, setUpdatingStatus] = useState(false);

//   // =====================================================
//   // LOAD STUDENTS
//   // =====================================================

//   const loadStudents = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const [studentsData, enrollmentsData] = await Promise.all([
//         getStudents(),
//         getEnrollments(),
//       ]);

//       const studentList = Array.isArray(studentsData)
//         ? studentsData
//         : studentsData?.results || [];

//       const enrollmentList = Array.isArray(enrollmentsData)
//         ? enrollmentsData
//         : enrollmentsData?.results || [];

//      const studentsWithEnrollment = studentList.map((student) => {
//   const studentEnrollments = enrollmentList.filter(
//     (enrollment) => String(enrollment.student) === String(student.id),
//   );

//   // Prefer the current enrollment; fall back to the most recent
//   // one (e.g. graduated students, whose final enrollment is
//   // flipped to is_current=false with no replacement created).
//   const currentEnrollment =
//     studentEnrollments.find((enrollment) => enrollment.is_current === true) ||
//     [...studentEnrollments].sort((a, b) => b.id - a.id)[0] ||
//     null;

//   return {
//     ...student,
//     current_enrollment: currentEnrollment,
//   };
// });

//       setStudents(studentsWithEnrollment);
//     } catch (err) {
//       console.error("Failed to load students:", err);
//       console.error("Server response:", err.response?.data);

//       setError(
//         err.response?.data?.detail || "Unable to load students.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadStudents();
//   }, []);

//   // =====================================================
//   // FILTER + SORT STUDENTS
//   // =====================================================

//   const filteredStudents = useMemo(() => {
//     const searchValue = search.trim().toLowerCase();

//     const filtered = students.filter((student) => {
//       const fullName =
//         student.full_name ||
//         [
//           student.first_name,
//           student.middle_name,
//           student.last_name,
//         ]
//           .filter(Boolean)
//           .join(" ");

//       const admissionNumber = student.admission_number || "";

//       const matchesSearch =
//         !searchValue ||
//         fullName.toLowerCase().includes(searchValue) ||
//         admissionNumber.toLowerCase().includes(searchValue);

//       const matchesGender =
//         !genderFilter ||
//         String(student.gender || "").toUpperCase() === genderFilter;

//       const studentStatus = String(
//         student.status || "ACTIVE",
//       ).toUpperCase();

//       const matchesStatus =
//         !statusFilter || studentStatus === statusFilter;

//       return matchesSearch && matchesGender && matchesStatus;
//     });

//     // ===================================================
//     // SORT BY STATUS
//     //
//     // ACTIVE
//     // GRADUATED
//     // TRANSFERRED
//     // SUSPENDED
//     // WITHDRAWN
//     // ===================================================

//     return [...filtered].sort((a, b) => {
//       const statusA = String(
//         a.status || "ACTIVE",
//       ).toUpperCase();

//       const statusB = String(
//         b.status || "ACTIVE",
//       ).toUpperCase();

//       const statusDifference =
//         (STATUS_ORDER[statusA] || 99) -
//         (STATUS_ORDER[statusB] || 99);

//       // First sort by status
//       if (statusDifference !== 0) {
//         return statusDifference;
//       }

//       // Then sort alphabetically by student name
//       const nameA = (
//         a.full_name ||
//         [
//           a.first_name,
//           a.middle_name,
//           a.last_name,
//         ]
//           .filter(Boolean)
//           .join(" ")
//       ).toLowerCase();

//       const nameB = (
//         b.full_name ||
//         [
//           b.first_name,
//           b.middle_name,
//           b.last_name,
//         ]
//           .filter(Boolean)
//           .join(" ")
//       ).toLowerCase();

//       return nameA.localeCompare(nameB);
//     });
//   }, [students, search, genderFilter, statusFilter]);

//   // =====================================================
//   // PAGINATION
//   // =====================================================

//   const totalPages = Math.max(
//     1,
//     Math.ceil(
//       filteredStudents.length / STUDENTS_PER_PAGE,
//     ),
//   );

//   const paginatedStudents = useMemo(() => {
//     const startIndex =
//       (currentPage - 1) * STUDENTS_PER_PAGE;

//     return filteredStudents.slice(
//       startIndex,
//       startIndex + STUDENTS_PER_PAGE,
//     );
//   }, [filteredStudents, currentPage]);

//   // =====================================================
//   // STATUS MODAL
//   // =====================================================

//   const openStatusModal = (student) => {
//     setStudentToUpdate(student);

//     setNewStatus(
//       String(
//         student.status || "ACTIVE",
//       ).toUpperCase(),
//     );

//     setShowStatusModal(true);
//   };

//   const closeStatusModal = () => {
//     if (updatingStatus) {
//       return;
//     }

//     setShowStatusModal(false);
//     setStudentToUpdate(null);
//     setNewStatus("");
//   };

//   // =====================================================
//   // UPDATE STATUS
//   // =====================================================

//   const handleStatusUpdate = async () => {
//     if (!studentToUpdate || !newStatus) {
//       return;
//     }

//     try {
//       setUpdatingStatus(true);
//       setError("");

//       const updatedStudent = await updateStudent(
//         studentToUpdate.id,
//         {
//           status: newStatus,
//         },
//       );

//       setStudents((currentStudents) =>
//         currentStudents.map((student) =>
//           student.id === studentToUpdate.id
//             ? {
//                 ...student,
//                 ...updatedStudent,
//                 status:
//                   updatedStudent.status || newStatus,
//               }
//             : student,
//         ),
//       );

//       closeStatusModal();

//       // Return to first page after status changes
//       setCurrentPage(1);
//     } catch (err) {
//       console.error(
//         "Failed to update student status:",
//         err,
//       );

//       console.error(
//         "Server response:",
//         err.response?.data,
//       );

//       setError(
//         err.response?.data?.detail ||
//           "Unable to update student status.",
//       );
//     } finally {
//       setUpdatingStatus(false);
//     }
//   };

//   // =====================================================
//   // DELETE MODAL
//   // =====================================================

//   const openDeleteModal = (student) => {
//     setStudentToDelete(student);
//     setShowDeleteModal(true);
//   };

//   const closeDeleteModal = () => {
//     if (deletingId) {
//       return;
//     }

//     setShowDeleteModal(false);
//     setStudentToDelete(null);
//   };

//   // =====================================================
//   // DELETE STUDENT
//   // =====================================================

//   const handleDeleteStudent = async () => {
//     if (!studentToDelete) {
//       return;
//     }

//     try {
//       setDeletingId(studentToDelete.id);
//       setError("");

//       await deleteStudent(studentToDelete.id);

//       setStudents((currentStudents) =>
//         currentStudents.filter(
//           (student) =>
//             student.id !== studentToDelete.id,
//         ),
//       );

//       closeDeleteModal();
//     } catch (err) {
//       console.error(
//         "Failed to delete student:",
//         err,
//       );

//       console.error(
//         "Server response:",
//         err.response?.data,
//       );

//       setError(
//         err.response?.data?.detail ||
//           "Unable to delete student.",
//       );
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   // =====================================================
//   // RESET PAGE WHEN FILTER CHANGES
//   // =====================================================

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [
//     search,
//     genderFilter,
//     statusFilter,
//   ]);

//   // =====================================================
//   // CLEAR FILTERS
//   // =====================================================

//   const clearFilters = () => {
//     setSearch("");
//     setGenderFilter("");
//     setStatusFilter("");
//     setCurrentPage(1);
//   };

//   const hasFilters =
//     search ||
//     genderFilter ||
//     statusFilter;

//   // =====================================================
//   // PAGE NUMBERS
//   // =====================================================

//   const pageNumbers = Array.from(
//     { length: totalPages },
//     (_, index) => index + 1,
//   );

//   // =====================================================
//   // RENDER
//   // =====================================================

//   return (
//     <div className="w-full">

//       {/* =================================================
//           HEADER
//       ================================================= */}

//       <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
//           onClick={() =>
//             navigate("/admin/students/add")
//           }
//           className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
//         >
//           + Add Student
//         </button>
//       </div>

//       {/* =================================================
//           STATUS ORDER INFORMATION
//       ================================================= */}

//       <div className="mb-5 rounded-xl border border-slate-200 bg-[var(--color-card)] p-4 shadow-sm dark:border-slate-800">
//         <div className="flex flex-wrap items-center gap-2">

//           <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
//             Student order:
//           </span>

//           <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
//             Active
//           </span>

//           <span className="text-slate-400">
//             →
//           </span>

//           <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
//             Graduated
//           </span>

//           <span className="text-slate-400">
//             →
//           </span>

//           <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700 dark:bg-purple-950/40 dark:text-purple-400">
//             Transferred
//           </span>

//           <span className="text-slate-400">
//             →
//           </span>

//           <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400">
//             Suspended
//           </span>

//           <span className="text-slate-400">
//             →
//           </span>

//           <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400">
//             Withdrawn
//           </span>

//         </div>
//       </div>

//       {/* =================================================
//           ERROR
//       ================================================= */}

//       {error && (
//         <div className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
//           <span>{error}</span>

//           <button
//             type="button"
//             onClick={loadStudents}
//             className="font-semibold underline"
//           >
//             Retry
//           </button>
//         </div>
//       )}

//       {/* =================================================
//           SEARCH + FILTERS
//       ================================================= */}

//       <div className="mb-5 rounded-xl border border-slate-200 bg-[var(--color-card)] p-4 shadow-sm dark:border-slate-800">

//         <div className="grid grid-cols-1 gap-3 md:grid-cols-4">

//           {/* Search */}

//           <div className="md:col-span-2">
//             <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
//               Search
//             </label>

//             <div className="relative">
//               <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
//                 🔍
//               </span>

//               <input
//                 type="text"
//                 value={search}
//                 onChange={(e) =>
//                   setSearch(e.target.value)
//                 }
//                 placeholder="Search name or admission number..."
//                 className="w-full rounded-lg border border-slate-200 bg-[var(--color-background)] py-2.5 pl-9 pr-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] dark:border-slate-700"
//               />
//             </div>
//           </div>

//           {/* Gender */}

//           <div>
//             <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
//               Gender
//             </label>

//             <select
//               value={genderFilter}
//               onChange={(e) =>
//                 setGenderFilter(e.target.value)
//               }
//               className="w-full rounded-lg border border-slate-200 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] dark:border-slate-700"
//             >
//               <option value="">
//                 All Genders
//               </option>

//               <option value="MALE">
//                 Male
//               </option>

//               <option value="FEMALE">
//                 Female
//               </option>

//               <option value="OTHER">
//                 Other
//               </option>
//             </select>
//           </div>

//           {/* Status */}

//           <div>
//             <label className="mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400">
//               Status
//             </label>

//             <select
//               value={statusFilter}
//               onChange={(e) =>
//                 setStatusFilter(e.target.value)
//               }
//               className="w-full rounded-lg border border-slate-200 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] dark:border-slate-700"
//             >
//               <option value="">
//                 All Statuses
//               </option>

//               <option value="ACTIVE">
//                 Active
//               </option>

//               <option value="GRADUATED">
//                 Graduated
//               </option>

//               <option value="TRANSFERRED">
//                 Transferred
//               </option>

//               <option value="SUSPENDED">
//                 Suspended
//               </option>

//               <option value="WITHDRAWN">
//                 Withdrawn
//               </option>
//             </select>
//           </div>

//         </div>

//         {/* Filter Footer */}

//         <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">

//           <p className="text-xs text-slate-500 dark:text-slate-400">
//             Showing{" "}
//             <span className="font-semibold text-[var(--color-text)]">
//               {filteredStudents.length}
//             </span>{" "}
//             student
//             {filteredStudents.length === 1
//               ? ""
//               : "s"}
//           </p>

//           {hasFilters && (
//             <button
//               type="button"
//               onClick={clearFilters}
//               className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
//             >
//               Clear Filters
//             </button>
//           )}

//         </div>
//       </div>

//       {/* =================================================
//           STUDENTS TABLE
//       ================================================= */}

//       <div className="overflow-hidden rounded-xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-800">

//         {loading ? (
//           <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
//             Loading students...
//           </div>
//         ) : filteredStudents.length === 0 ? (
//           <div className="p-8 text-center">

//             <p className="text-sm font-medium text-[var(--color-text)]">
//               No students found.
//             </p>

//             <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//               {hasFilters
//                 ? "Try changing your search or filters."
//                 : "Add your first student to get started."}
//             </p>

//             {hasFilters ? (
//               <button
//                 type="button"
//                 onClick={clearFilters}
//                 className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
//               >
//                 Clear Filters
//               </button>
//             ) : (
//               <button
//                 type="button"
//                 onClick={() =>
//                   navigate("/admin/students/add")
//                 }
//                 className="mt-4 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
//               >
//                 Add Student
//               </button>
//             )}
//           </div>
//         ) : (
//           <>

//             {/* =================================================
//                 TABLE
//             ================================================= */}

//             <div className="overflow-x-auto">
//               <table className="w-full text-left text-sm">

//                 <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
//                   <tr>

//                     <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
//                       Admission No.
//                     </th>

//                     <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
//                       Student Name
//                     </th>

//                     <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
//                       Class
//                     </th>

//                     <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
//                       Session
//                     </th>

//                     <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
//                       Term
//                     </th>

//                     <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
//                       Gender
//                     </th>

//                     <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
//                       Date of Birth
//                     </th>

//                     <th className="px-5 py-4 font-semibold text-slate-600 dark:text-slate-300">
//                       Status
//                     </th>

//                     <th className="px-5 py-4 text-right font-semibold text-slate-600 dark:text-slate-300">
//                       Actions
//                     </th>

//                   </tr>
//                 </thead>

//                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

//                   {paginatedStudents.map((student) => {

//                     const fullName =
//                       student.full_name ||
//                       [
//                         student.first_name,
//                         student.middle_name,
//                         student.last_name,
//                       ]
//                         .filter(Boolean)
//                         .join(" ");

//                     const status = String(
//                       student.status || "ACTIVE",
//                     ).toUpperCase();

//                     const enrollment =
//                       student.current_enrollment;

//                     const className =
//                       enrollment?.class_name || "—";

//                     const sessionName =
//                       enrollment?.session_name || "—";

//                     const termName =
//                       enrollment?.term_name || "—";

//                     return (
//                       <tr
//                         key={student.id}
//                         className="transition hover:bg-slate-50 dark:hover:bg-slate-900/40"
//                       >

//                         {/* Admission */}

//                         <td className="px-5 py-4 font-medium text-[var(--color-text)]">
//                           {student.admission_number || "—"}
//                         </td>

//                         {/* Name */}

//                         <td className="px-5 py-4 text-[var(--color-text)]">
//                           {fullName || "Unnamed Student"}
//                         </td>

//                         {/* Class */}

//                         <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
//                           {className}
//                         </td>

//                         {/* Session */}

//                         <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
//                           {sessionName}
//                         </td>

//                         {/* Term */}

//                         <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
//                           {termName}
//                         </td>

//                         {/* Gender */}

//                         <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
//                           {student.gender || "—"}
//                         </td>

//                         {/* Date of Birth */}

//                         <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
//                           {student.date_of_birth || "—"}
//                         </td>

//                         {/* Status */}

//                         <td className="px-5 py-4">
//                           <span
//                             className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
//                               status,
//                             )}`}
//                           >
//                             {getStatusLabel(status)}
//                           </span>
//                         </td>

//                         {/* Actions */}

//                         <td className="px-5 py-4 text-right">
//                           <div className="flex flex-wrap justify-end gap-2">

//                             {/* View */}

//                             <button
//                               type="button"
//                               onClick={() =>
//                                 navigate(
//                                   `/admin/students/${student.id}`,
//                                 )
//                               }
//                               className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
//                             >
//                               View
//                             </button>

//                             {/* Edit */}

//                             <button
//                               type="button"
//                               onClick={() =>
//                                 navigate(
//                                   `/admin/students/${student.id}/edit`,
//                                 )
//                               }
//                               className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
//                             >
//                               Edit
//                             </button>

//                             {/* Status */}

//                             <button
//                               type="button"
//                               onClick={() =>
//                                 openStatusModal(student)
//                               }
//                               className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
//                             >
//                               Status
//                             </button>

//                             {/* Delete */}

//                             <button
//                               type="button"
//                               onClick={() =>
//                                 openDeleteModal(student)
//                               }
//                               className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/30"
//                             >
//                               Delete
//                             </button>

//                           </div>
//                         </td>

//                       </tr>
//                     );
//                   })}

//                 </tbody>
//               </table>
//             </div>

//             {/* =================================================
//                 PAGINATION
//             ================================================= */}

//             <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">

//               <p className="text-xs text-slate-500 dark:text-slate-400">
//                 Page{" "}
//                 <span className="font-semibold text-[var(--color-text)]">
//                   {currentPage}
//                 </span>{" "}
//                 of{" "}
//                 <span className="font-semibold text-[var(--color-text)]">
//                   {totalPages}
//                 </span>
//               </p>

//               <div className="flex flex-wrap items-center gap-1">

//                 {/* Previous */}

//                 <button
//                   type="button"
//                   disabled={currentPage === 1}
//                   onClick={() =>
//                     setCurrentPage(
//                       (page) => page - 1,
//                     )
//                   }
//                   className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
//                 >
//                   Previous
//                 </button>

//                 {/* Page Numbers */}

//                 {pageNumbers.map((page) => (
//                   <button
//                     key={page}
//                     type="button"
//                     onClick={() =>
//                       setCurrentPage(page)
//                     }
//                     className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition ${
//                       currentPage === page
//                         ? "bg-[var(--color-primary)] text-white"
//                         : "border border-slate-200 text-[var(--color-text)] hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
//                     }`}
//                   >
//                     {page}
//                   </button>
//                 ))}

//                 {/* Next */}

//                 <button
//                   type="button"
//                   disabled={
//                     currentPage === totalPages
//                   }
//                   onClick={() =>
//                     setCurrentPage(
//                       (page) => page + 1,
//                     )
//                   }
//                   className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
//                 >
//                   Next
//                 </button>

//               </div>
//             </div>

//           </>
//         )}
//       </div>

//       {/* =================================================
//           STATUS MODAL
//       ================================================= */}

//       {showStatusModal && studentToUpdate && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

//           <div className="w-full max-w-md rounded-xl bg-[var(--color-card)] p-6 shadow-2xl">

//             <h2 className="text-lg font-bold text-[var(--color-text)]">
//               Change Student Status
//             </h2>

//             <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
//               Update the status of{" "}
//               <span className="font-semibold text-[var(--color-text)]">
//                 {studentToUpdate.full_name ||
//                   [
//                     studentToUpdate.first_name,
//                     studentToUpdate.middle_name,
//                     studentToUpdate.last_name,
//                   ]
//                     .filter(Boolean)
//                     .join(" ")}
//               </span>
//               .
//             </p>

//             <div className="mt-5">

//               <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
//                 Student Status
//               </label>

//               <select
//                 value={newStatus}
//                 onChange={(e) =>
//                   setNewStatus(e.target.value)
//                 }
//                 className="w-full rounded-lg border border-slate-200 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] dark:border-slate-700"
//               >
//                 <option value="ACTIVE">
//                   Active
//                 </option>

//                 <option value="GRADUATED">
//                   Graduated
//                 </option>

//                 <option value="TRANSFERRED">
//                   Transferred
//                 </option>

//                 <option value="SUSPENDED">
//                   Suspended
//                 </option>

//                 <option value="WITHDRAWN">
//                   Withdrawn
//                 </option>
//               </select>

//             </div>

//             <div className="mt-6 flex justify-end gap-3">

//               <button
//                 type="button"
//                 disabled={updatingStatus}
//                 onClick={closeStatusModal}
//                 className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-[var(--color-text)] hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 disabled={updatingStatus}
//                 onClick={handleStatusUpdate}
//                 className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 {updatingStatus
//                   ? "Updating..."
//                   : "Update Status"}
//               </button>

//             </div>
//           </div>
//         </div>
//       )}

//       {/* =================================================
//           DELETE MODAL
//       ================================================= */}

//       {showDeleteModal && studentToDelete && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

//           <div className="w-full max-w-md rounded-xl bg-[var(--color-card)] p-6 shadow-2xl">

//             <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl dark:bg-red-950/40">
//               ⚠️
//             </div>

//             <h2 className="text-lg font-bold text-[var(--color-text)]">
//               Delete Student?
//             </h2>

//             <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
//               Are you sure you want to delete{" "}
//               <span className="font-semibold text-[var(--color-text)]">
//                 {studentToDelete.full_name ||
//                   [
//                     studentToDelete.first_name,
//                     studentToDelete.middle_name,
//                     studentToDelete.last_name,
//                   ]
//                     .filter(Boolean)
//                     .join(" ")}
//               </span>
//               ?
//             </p>

//             <p className="mt-2 text-xs text-red-500">
//               This action cannot be undone.
//             </p>

//             <div className="mt-6 flex justify-end gap-3">

//               <button
//                 type="button"
//                 disabled={!!deletingId}
//                 onClick={closeDeleteModal}
//                 className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 disabled={!!deletingId}
//                 onClick={handleDeleteStudent}
//                 className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 {deletingId
//                   ? "Deleting..."
//                   : "Yes, Delete"}
//               </button>

//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default AllStudents;





import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getStudents,
  getEnrollments,
  updateStudent,
  deleteStudent,
} from "../../../services/studentsService";

const STUDENTS_PER_PAGE = 10;

// =====================================================
// STATUS ORDER
// =====================================================

const STATUS_ORDER = {
  ACTIVE: 1,
  GRADUATED: 2,
  TRANSFERRED: 3,
  SUSPENDED: 4,
  WITHDRAWN: 5,
};

// =====================================================
// STATUS LABEL
// =====================================================

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

// =====================================================
// STATUS STYLE
// =====================================================

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

// =====================================================
// COMPONENT
// =====================================================

function AllStudents({
  basePath = "/admin/students",
}) {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // SEARCH / FILTERS
  // =====================================================

  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // =====================================================
  // PAGINATION
  // =====================================================

  const [currentPage, setCurrentPage] = useState(1);

  // =====================================================
  // DELETE
  // =====================================================

  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // =====================================================
  // STATUS UPDATE
  // =====================================================

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

      const [studentsData, enrollmentsData] = await Promise.all([
        getStudents(),
        getEnrollments(),
      ]);

      const studentList = Array.isArray(studentsData)
        ? studentsData
        : studentsData?.results || [];

      const enrollmentList = Array.isArray(enrollmentsData)
        ? enrollmentsData
        : enrollmentsData?.results || [];

      const studentsWithEnrollment = studentList.map((student) => {
        const studentEnrollments = enrollmentList.filter(
          (enrollment) =>
            String(enrollment.student) === String(student.id),
        );

        // Prefer the current enrollment.
        // Fall back to the most recent enrollment.
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
      });

      setStudents(studentsWithEnrollment);
    } catch (err) {
      console.error("Failed to load students:", err);
      console.error("Server response:", err.response?.data);

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
  // FILTER + SORT STUDENTS
  // =====================================================

  const filteredStudents = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    const filtered = students.filter((student) => {
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
        String(student.gender || "").toUpperCase() ===
          genderFilter;

      const studentStatus = String(
        student.status || "ACTIVE",
      ).toUpperCase();

      const matchesStatus =
        !statusFilter ||
        studentStatus === statusFilter;

      return (
        matchesSearch &&
        matchesGender &&
        matchesStatus
      );
    });

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

  // =====================================================
  // STATUS MODAL
  // =====================================================

  const openStatusModal = (student) => {
    setStudentToUpdate(student);

    setNewStatus(
      String(
        student.status || "ACTIVE",
      ).toUpperCase(),
    );

    setShowStatusModal(true);
  };

  const closeStatusModal = () => {
    if (updatingStatus) {
      return;
    }

    setShowStatusModal(false);
    setStudentToUpdate(null);
    setNewStatus("");
  };

  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const handleStatusUpdate = async () => {
    if (!studentToUpdate || !newStatus) {
      return;
    }

    try {
      setUpdatingStatus(true);
      setError("");

      const updatedStudent =
        await updateStudent(
          studentToUpdate.id,
          {
            status: newStatus,
          },
        );

      setStudents((currentStudents) =>
        currentStudents.map((student) =>
          student.id ===
          studentToUpdate.id
            ? {
                ...student,
                ...updatedStudent,
                status:
                  updatedStudent.status ||
                  newStatus,
              }
            : student,
        ),
      );

      closeStatusModal();
      setCurrentPage(1);
    } catch (err) {
      console.error(
        "Failed to update student status:",
        err,
      );

      console.error(
        "Server response:",
        err.response?.data,
      );

      setError(
        err.response?.data?.detail ||
          "Unable to update student status.",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // =====================================================
  // DELETE MODAL
  // =====================================================

  const openDeleteModal = (student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deletingId) {
      return;
    }

    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  // =====================================================
  // DELETE STUDENT
  // =====================================================

  const handleDeleteStudent = async () => {
    if (!studentToDelete) {
      return;
    }

    try {
      setDeletingId(studentToDelete.id);
      setError("");

      await deleteStudent(
        studentToDelete.id,
      );

      setStudents((currentStudents) =>
        currentStudents.filter(
          (student) =>
            student.id !==
            studentToDelete.id,
        ),
      );

      closeDeleteModal();
    } catch (err) {
      console.error(
        "Failed to delete student:",
        err,
      );

      console.error(
        "Server response:",
        err.response?.data,
      );

      setError(
        err.response?.data?.detail ||
          "Unable to delete student.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =====================================================
  // RESET PAGE WHEN FILTER CHANGES
  // =====================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    genderFilter,
    statusFilter,
  ]);

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

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

      {/* HEADER */}

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
          onClick={() =>
            navigate(`${basePath}/add`)
          }
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
        >
          + Add Student
        </button>
      </div>

      {/* STATUS ORDER */}

      <div className="mb-5 rounded-xl border border-slate-200 bg-[var(--color-card)] p-4 shadow-sm dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Student order:
          </span>

          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
            Active
          </span>

          <span className="text-slate-400">→</span>

          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-400">
            Graduated
          </span>

          <span className="text-slate-400">→</span>

          <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700 dark:text-purple-400">
            Transferred
          </span>

          <span className="text-slate-400">→</span>

          <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400">
            Suspended
          </span>

          <span className="text-slate-400">→</span>

          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-400">
            Withdrawn
          </span>
        </div>
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

      {/* SEARCH + FILTERS */}

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

        {/* Filter Footer */}

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
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

      {/* STUDENTS TABLE */}

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
                onClick={() =>
                  navigate(
                    `${basePath}/add`,
                  )
                }
                className="mt-4 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Add Student
              </button>
            )}
          </div>
        ) : (
          <>
            {/* TABLE */}

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

                      const className =
                        enrollment?.class_name ||
                        "—";

                      const sessionName =
                        enrollment?.session_name ||
                        "—";

                      const termName =
                        enrollment?.term_name ||
                        "—";

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
                            {className}
                          </td>

                          <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                            {sessionName}
                          </td>

                          <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                            {termName}
                          </td>

                          <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                            {student.gender || "—"}
                          </td>

                          <td className="px-5 py-4 text-slate-600 dark:text-slate-400">
                            {student.date_of_birth || "—"}
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
                            <div className="flex flex-wrap justify-end gap-2">

                              {/* View */}

                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `${basePath}/${student.id}`,
                                  )
                                }
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                              >
                                View
                              </button>

                              {/* Edit */}

                              <button
                                type="button"
                                onClick={() =>
                                  navigate(
                                    `${basePath}/${student.id}/edit`,
                                  )
                                }
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                              >
                                Edit
                              </button>

                              {/* Status */}

                              <button
                                type="button"
                                onClick={() =>
                                  openStatusModal(
                                    student,
                                  )
                                }
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                              >
                                Status
                              </button>

                              {/* Delete */}

                              <button
                                type="button"
                                onClick={() =>
                                  openDeleteModal(
                                    student,
                                  )
                                }
                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/30"
                              >
                                Delete
                              </button>
                            </div>
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
                        setCurrentPage(page)
                      }
                      className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition ${
                        currentPage === page
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

      {/* STATUS MODAL */}

      {showStatusModal &&
        studentToUpdate && (
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
                  onChange={(e) =>
                    setNewStatus(
                      e.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] dark:border-slate-700"
                >
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

              <div className="mt-6 flex justify-end gap-3">

                <button
                  type="button"
                  disabled={
                    updatingStatus
                  }
                  onClick={
                    closeStatusModal
                  }
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-[var(--color-text)] hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    updatingStatus
                  }
                  onClick={
                    handleStatusUpdate
                  }
                  className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updatingStatus
                    ? "Updating..."
                    : "Update Status"}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* DELETE MODAL */}

      {showDeleteModal &&
        studentToDelete && (
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
                This action cannot be undone.
              </p>

              <div className="mt-6 flex justify-end gap-3">

                <button
                  type="button"
                  disabled={!!deletingId}
                  onClick={
                    closeDeleteModal
                  }
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={!!deletingId}
                  onClick={
                    handleDeleteStudent
                  }
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingId
                    ? "Deleting..."
                    : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default AllStudents;