// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Search,
//   Eye,
//   Users,
//   UserCheck,
//   UserX,
//   RefreshCw,
// } from "lucide-react";

// import { getStudents } from "../../services/studentsService";

// function Student() {
//   const navigate = useNavigate();

//   const [students, setStudents] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [error, setError] = useState("");

//   // =====================================================
//   // LOAD STUDENTS
//   // =====================================================

//   const loadStudents = async (searchValue = "") => {
//     try {
//       setError("");

//       const data = await getStudents(searchValue);

//       // Support both normal arrays and DRF pagination
//       if (Array.isArray(data)) {
//         setStudents(data);
//       } else if (Array.isArray(data?.results)) {
//         setStudents(data.results);
//       } else {
//         setStudents([]);
//       }
//     } catch (err) {
//       console.error("Failed to load students:", err);

//       setError(
//         err?.response?.data?.detail ||
//           "Unable to load students. Please try again."
//       );
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   // =====================================================
//   // INITIAL LOAD
//   // =====================================================

//   useEffect(() => {
//     loadStudents();
//   }, []);

//   // =====================================================
//   // SEARCH
//   // =====================================================

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (!loading) {
//         loadStudents(search);
//       }
//     }, 400);

//     return () => clearTimeout(timer);
//   }, [search]);

//   // =====================================================
//   // REFRESH
//   // =====================================================

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await loadStudents(search);
//   };

//   // =====================================================
//   // HELPERS
//   // =====================================================

//   const getFullName = (student) => {
//     const firstName =
//       student?.first_name ||
//       student?.user?.first_name ||
//       "";

//     const middleName =
//       student?.middle_name ||
//       student?.user?.middle_name ||
//       "";

//     const lastName =
//       student?.last_name ||
//       student?.user?.last_name ||
//       "";

//     return [firstName, middleName, lastName]
//       .filter(Boolean)
//       .join(" ")
//       .trim() || "Unnamed Student";
//   };

//   const getStudentId = (student) => {
//     return (
//       student?.student_id ||
//       student?.admission_number ||
//       student?.admission_no ||
//       student?.registration_number ||
//       student?.user?.student_id ||
//       "—"
//     );
//   };

//   const getGender = (student) => {
//     return (
//       student?.gender ||
//       student?.sex ||
//       "—"
//     );
//   };

//   const getStatus = (student) => {
//     return (
//       student?.status ||
//       (student?.is_active === false ? "INACTIVE" : "ACTIVE")
//     );
//   };

//   const getClassName = (student) => {
//     const enrollment =
//       student?.current_enrollment ||
//       student?.currentEnrollment ||
//       student?.enrollment;

//     if (enrollment) {
//       if (enrollment.class_level_name) {
//         return enrollment.class_level_name;
//       }

//       if (enrollment.class_level?.name) {
//         return enrollment.class_level.name;
//       }

//       if (enrollment.class_name) {
//         return enrollment.class_name;
//       }
//     }

//     return (
//       student?.class_level_name ||
//       student?.class_name ||
//       student?.class_level?.name ||
//       "—"
//     );
//   };

//   // =====================================================
//   // STATISTICS
//   // =====================================================

//   const totalStudents = students.length;

//   const activeStudents = students.filter(
//     (student) => {
//       const status = String(getStatus(student)).toUpperCase();
//       return status === "ACTIVE";
//     }
//   ).length;

//   const inactiveStudents = students.filter(
//     (student) => {
//       const status = String(getStatus(student)).toUpperCase();
//       return status !== "ACTIVE";
//     }
//   ).length;

//   // =====================================================
//   // LOADING STATE
//   // =====================================================

//   if (loading) {
//     return (
//       <div className="min-h-full bg-[var(--color-background)] p-4 sm:p-6 lg:p-8">
//         <div className="mx-auto max-w-7xl space-y-6">
//           <div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />

//           <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
//             {[1, 2, 3].map((item) => (
//               <div
//                 key={item}
//                 className="h-28 animate-pulse rounded-3xl bg-white dark:bg-[var(--color-card)]"
//               />
//             ))}
//           </div>

//           <div className="h-96 animate-pulse rounded-3xl bg-white dark:bg-[var(--color-card)]" />
//         </div>
//       </div>
//     );
//   }

//   // =====================================================
//   // PAGE
//   // =====================================================

//   return (
//     <div className="min-h-full bg-[var(--color-background)] p-4 sm:p-6 lg:p-8">
//       <div className="mx-auto max-w-7xl space-y-6">

//         {/* =================================================
//             HEADER
//         ================================================= */}
//         <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//           <div>
//             <h1 className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
//               Students
//             </h1>

//             <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//               View and manage student academic information.
//             </p>
//           </div>

//           <button
//             type="button"
//             onClick={handleRefresh}
//             disabled={refreshing}
//             className="inline-flex w-fit items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             <RefreshCw
//               size={17}
//               className={refreshing ? "animate-spin" : ""}
//             />

//             {refreshing ? "Refreshing..." : "Refresh"}
//           </button>
//         </div>

//         {/* =================================================
//             STAT CARDS
//         ================================================= */}
//         <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

//           {/* Total */}
//           <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-[var(--color-card)]">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
//                   Total Students
//                 </p>

//                 <h2 className="mt-2 text-3xl font-bold text-[var(--color-text)]">
//                   {totalStudents}
//                 </h2>
//               </div>

//               <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
//                 <Users size={24} />
//               </div>
//             </div>
//           </div>

//           {/* Active */}
//           <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-[var(--color-card)]">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
//                   Active Students
//                 </p>

//                 <h2 className="mt-2 text-3xl font-bold text-[var(--color-text)]">
//                   {activeStudents}
//                 </h2>
//               </div>

//               <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
//                 <UserCheck size={24} />
//               </div>
//             </div>
//           </div>

//           {/* Other */}
//           <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-[var(--color-card)]">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
//                   Other Status
//                 </p>

//                 <h2 className="mt-2 text-3xl font-bold text-[var(--color-text)]">
//                   {inactiveStudents}
//                 </h2>
//               </div>

//               <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
//                 <UserX size={24} />
//               </div>
//             </div>
//           </div>

//         </div>

//         {/* =================================================
//             STUDENT TABLE
//         ================================================= */}
//         <div className="overflow-hidden rounded-3xl bg-white shadow-sm dark:bg-[var(--color-card)]">

//           {/* Table Header */}
//           <div className="border-b border-slate-200 p-5 dark:border-slate-700">
//             <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

//               <div>
//                 <h2 className="text-lg font-bold text-[var(--color-text)]">
//                   All Students
//                 </h2>

//                 <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//                   Search and view students registered in the school.
//                 </p>
//               </div>

//               {/* Search */}
//               <div className="relative w-full lg:w-80">
//                 <Search
//                   size={18}
//                   className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                 />

//                 <input
//                   type="text"
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   placeholder="Search students..."
//                   className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:focus:ring-blue-950"
//                 />
//               </div>

//             </div>
//           </div>

//           {/* Error */}
//           {error && (
//             <div className="m-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
//               {error}
//             </div>
//           )}

//           {/* Empty */}
//           {!error && students.length === 0 ? (
//             <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
//               <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
//                 <Users size={30} />
//               </div>

//               <h3 className="mt-4 text-lg font-semibold text-[var(--color-text)]">
//                 No students found
//               </h3>

//               <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
//                 {search
//                   ? "No students match your search."
//                   : "There are currently no students to display."}
//               </p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[850px]">
//                 <thead>
//                   <tr className="bg-slate-50 text-left dark:bg-slate-800/60">
//                     <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
//                       Student
//                     </th>

//                     <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
//                       Student ID
//                     </th>

//                     <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
//                       Gender
//                     </th>

//                     <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
//                       Class
//                     </th>

//                     <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
//                       Status
//                     </th>

//                     <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
//                       Action
//                     </th>
//                   </tr>
//                 </thead>

//                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

//                   {students.map((student) => {
//                     const status = String(
//                       getStatus(student)
//                     ).toUpperCase();

//                     const active = status === "ACTIVE";

//                     return (
//                       <tr
//                         key={student.id}
//                         className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
//                       >
//                         {/* Student */}
//                         <td className="px-5 py-4">
//                           <div className="flex items-center gap-3">

//                             <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
//                               {getFullName(student)
//                                 .charAt(0)
//                                 .toUpperCase()}
//                             </div>

//                             <div>
//                               <p className="font-semibold text-[var(--color-text)]">
//                                 {getFullName(student)}
//                               </p>

//                               {student?.email && (
//                                 <p className="text-xs text-slate-500 dark:text-slate-400">
//                                   {student.email}
//                                 </p>
//                               )}
//                             </div>

//                           </div>
//                         </td>

//                         {/* Student ID */}
//                         <td className="px-5 py-4 text-sm font-medium text-[var(--color-text)]">
//                           {getStudentId(student)}
//                         </td>

//                         {/* Gender */}
//                         <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
//                           {getGender(student)}
//                         </td>

//                         {/* Class */}
//                         <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
//                           {getClassName(student)}
//                         </td>

//                         {/* Status */}
//                         <td className="px-5 py-4">
//                           <span
//                             className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
//                               active
//                                 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
//                                 : "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
//                             }`}
//                           >
//                             {status}
//                           </span>
//                         </td>

//                         {/* Action */}
//                         <td className="px-5 py-4 text-right">
//                           <button
//                             type="button"
//                             onClick={() =>
//                               navigate(
//                                 `/exam-officer/students/${student.id}`
//                               )
//                             }
//                             className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
//                           >
//                             <Eye size={16} />
//                             View
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })}

//                 </tbody>
//               </table>
//             </div>
//           )}

//           {/* Footer */}
//           {students.length > 0 && (
//             <div className="border-t border-slate-200 px-5 py-4 dark:border-slate-700">
//               <p className="text-sm text-slate-500 dark:text-slate-400">
//                 Showing{" "}
//                 <span className="font-semibold text-[var(--color-text)]">
//                   {students.length}
//                 </span>{" "}
//                 student{students.length !== 1 ? "s" : ""}
//               </p>
//             </div>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// }

// export default Student;
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  UserCheck,
  GraduationCap,
  UserX,
  Eye,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import { getStudents } from "../../services/studentsService";

// ============================================================
// STATUS ORDER
// ============================================================

const STATUS_ORDER = {
  ACTIVE: 1,
  GRADUATED: 2,
  TRANSFERRED: 3,
  SUSPENDED: 4,
  WITHDRAWN: 5,
};

// ============================================================
// HELPERS
// ============================================================

const getStatus = (student) =>
  String(student?.status || "ACTIVE").trim().toUpperCase();

const getStudentName = (student) => {
  if (student?.full_name) {
    return student.full_name;
  }

  return [
    student?.first_name,
    student?.middle_name,
    student?.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() || "Unnamed Student";
};

const getInitials = (student) => {
  const name = getStudentName(student);

  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase() || "?"
  );
};

// ============================================================
// CLASS RESOLUTION
// ============================================================

const getStudentClass = (student) => {
  // 1. Current class
  if (student?.current_class) {
    return student.current_class;
  }

  // 2. Current enrollment
  if (student?.current_enrollment?.class_name) {
    return student.current_enrollment.class_name;
  }

  // 3. Explicit last-class fields
  if (student?.last_class) {
    return student.last_class;
  }

  if (student?.last_class_name) {
    return student.last_class_name;
  }

  if (student?.graduation_class) {
    return student.graduation_class;
  }

  if (student?.graduation_class_name) {
    return student.graduation_class_name;
  }

  // 4. Last enrollment
  if (
    Array.isArray(student?.enrollments) &&
    student.enrollments.length > 0
  ) {
    const lastEnrollment =
      student.enrollments[student.enrollments.length - 1];

    if (lastEnrollment?.class_name) {
      return lastEnrollment.class_name;
    }

    if (lastEnrollment?.class) {
      return lastEnrollment.class;
    }
  }

  return "Not assigned";
};

// ============================================================
// COMPONENT
// ============================================================

function Student() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ==========================================================
  // LOAD
  // ==========================================================

  const loadStudents = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await getStudents();

      const data = Array.isArray(response)
        ? response
        : response?.results || [];

      setStudents(data);
    } catch (err) {
      console.error("Failed to load students:", err);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load students."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // ==========================================================
  // FILTER + SORT
  // ==========================================================

  const filteredStudents = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    let data = [...students];

    if (searchText) {
      data = data.filter((student) => {
        const name = getStudentName(student).toLowerCase();

        const admissionNumber = String(
          student?.admission_number || ""
        ).toLowerCase();

        const studentClass =
          getStudentClass(student).toLowerCase();

        const email = String(
          student?.email || ""
        ).toLowerCase();

        return (
          name.includes(searchText) ||
          admissionNumber.includes(searchText) ||
          studentClass.includes(searchText) ||
          email.includes(searchText)
        );
      });
    }

    // ACTIVE students always come first.
    data.sort((a, b) => {
      const statusA = getStatus(a);
      const statusB = getStatus(b);

      const orderA = STATUS_ORDER[statusA] || 99;
      const orderB = STATUS_ORDER[statusB] || 99;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return getStudentName(a).localeCompare(
        getStudentName(b)
      );
    });

    return data;
  }, [students, search]);

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const totalStudents = students.length;

  const activeStudents = students.filter(
    (student) => getStatus(student) === "ACTIVE"
  ).length;

  const graduatedStudents = students.filter(
    (student) => getStatus(student) === "GRADUATED"
  ).length;

  const otherStudents = students.filter((student) => {
    const status = getStatus(student);

    return [
      "TRANSFERRED",
      "SUSPENDED",
      "WITHDRAWN",
    ].includes(status);
  }).length;

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-full bg-[var(--color-background)] p-6">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="h-8 w-8 animate-spin text-[var(--color-primary)]" />

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading students...
            </p>
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
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm dark:bg-[var(--color-card)]">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-red-500" />

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Unable to load students
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadStudents(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="min-h-full bg-[var(--color-background)] p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              Students
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              View and manage all students in your school.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadStudents(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60 dark:bg-[var(--color-card)] dark:text-slate-200"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            label="Total Students"
            value={totalStudents}
            icon={<Users className="h-6 w-6 text-blue-600" />}
            iconClass="bg-blue-50 dark:bg-blue-950/40"
          />

          <StatCard
            label="Active Students"
            value={activeStudents}
            icon={
              <UserCheck className="h-6 w-6 text-emerald-600" />
            }
            iconClass="bg-emerald-50 dark:bg-emerald-950/40"
          />

          <StatCard
            label="Graduated"
            value={graduatedStudents}
            icon={
              <GraduationCap className="h-6 w-6 text-violet-600" />
            }
            iconClass="bg-violet-50 dark:bg-violet-950/40"
          />

          <StatCard
            label="Other Status"
            value={otherStudents}
            icon={
              <UserX className="h-6 w-6 text-amber-600" />
            }
            iconClass="bg-amber-50 dark:bg-amber-950/40"
          />

        </div>

        {/* SEARCH */}

        <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-[var(--color-card)]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, admission number, class or email..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-hidden rounded-3xl bg-white shadow-sm dark:bg-[var(--color-card)]">

          <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              All Students
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {filteredStudents.length} student
              {filteredStudents.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
              <Users className="mb-4 h-10 w-10 text-slate-400" />

              <h3 className="font-semibold text-slate-900 dark:text-white">
                No students found
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Try another search.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">

                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60">

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Student
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Admission No.
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Class
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Gender
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredStudents.map((student) => {
                    const status = getStatus(student);
                    const studentClass =
                      getStudentClass(student);

                    return (
                      <tr
                        key={student.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-800/40"
                      >

                        {/* STUDENT */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">

                            {student?.profile_image ? (
                              <img
                                src={student.profile_image}
                                alt={getStudentName(student)}
                                className="h-11 w-11 rounded-2xl object-cover"
                              />
                            ) : (
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-sm font-bold text-[var(--color-primary)] dark:bg-blue-950/40">
                                {getInitials(student)}
                              </div>
                            )}

                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {getStudentName(student)}
                              </p>

                              {student?.email && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {student.email}
                                </p>
                              )}
                            </div>

                          </div>
                        </td>

                        {/* ADMISSION */}

                        <td className="px-5 py-4 text-sm text-slate-700 dark:text-slate-300">
                          {student?.admission_number || "—"}
                        </td>

                        {/* CLASS */}

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-xl bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {studentClass}
                          </span>
                        </td>

                        {/* GENDER */}

                        <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {student?.gender || "—"}
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">
                          <StatusBadge status={status} />
                        </td>

                        {/* VIEW */}

                        <td className="px-5 py-4 text-right">

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/exam-officer/students/${student.id}`
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  label,
  value,
  icon,
  iconClass,
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm dark:bg-[var(--color-card)]">
      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}
        >
          {icon}
        </div>

      </div>
    </div>
  );
}

// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({ status }) {
  const styles = {
    ACTIVE:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",

    GRADUATED:
      "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400",

    TRANSFERRED:
      "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",

    SUSPENDED:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",

    WITHDRAWN:
      "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
        styles[status] ||
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
      }`}
    >
      {status}
    </span>
  );
}

export default Student;