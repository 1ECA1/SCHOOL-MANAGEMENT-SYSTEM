// import { useEffect, useMemo, useState } from "react";

// import {
//   getSessions,
//   getTerms,
//   getClassLevels,
// } from "../../../services/academicsService";

// import {
//   getStudents,
// } from "../../../services/studentsService";

// import {
//   getAttendance,
//   getAttendanceSummary,
// } from "../../../services/attendanceService";


// // =====================================================
// // HELPERS
// // =====================================================

// const getInitialFilters = () => ({
//   student: "",
//   academic_session: "",
//   term: "",
//   class_level: "",
// });


// const formatDate = (dateString) => {
//   if (!dateString) return "-";

//   const date = new Date(`${dateString}T00:00:00`);

//   if (Number.isNaN(date.getTime())) {
//     return dateString;
//   }

//   return date.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// };


// const statusConfig = {
//   PRESENT: {
//     label: "Present",
//     className:
//       "bg-green-100 text-green-700 border border-green-200",
//   },

//   ABSENT: {
//     label: "Absent",
//     className:
//       "bg-red-100 text-red-700 border border-red-200",
//   },

//   LATE: {
//     label: "Late",
//     className:
//       "bg-yellow-100 text-yellow-700 border border-yellow-200",
//   },

//   EXCUSED: {
//     label: "Excused",
//     className:
//       "bg-blue-100 text-blue-700 border border-blue-200",
//   },
// };


// // =====================================================
// // COMPONENT
// // =====================================================

// function StudentAttendance() {
//   // ===================================================
//   // ACADEMIC DATA
//   // ===================================================

//   const [sessions, setSessions] = useState([]);
//   const [terms, setTerms] = useState([]);
//   const [classLevels, setClassLevels] = useState([]);
//   const [students, setStudents] = useState([]);


//   // ===================================================
//   // FILTERS
//   // ===================================================

//   const [filters, setFilters] = useState(
//     getInitialFilters()
//   );


//   // ===================================================
//   // DATA
//   // ===================================================

//   const [summary, setSummary] = useState(null);
//   const [records, setRecords] = useState([]);


//   // ===================================================
//   // LOADING
//   // ===================================================

//   const [loading, setLoading] = useState(true);
//   const [loadingReport, setLoadingReport] = useState(false);


//   // ===================================================
//   // ERROR
//   // ===================================================

//   const [error, setError] = useState("");


//   // ===================================================
//   // LOAD FILTER DATA
//   // ===================================================

//   useEffect(() => {
//     loadFilterData();
//   }, []);


//   const loadFilterData = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const [
//         sessionsData,
//         termsData,
//         classLevelsData,
//         studentsData,
//       ] = await Promise.all([
//         getSessions(),
//         getTerms(),
//         getClassLevels(),
//         getStudents(),
//       ]);

//       setSessions(
//         Array.isArray(sessionsData)
//           ? sessionsData
//           : sessionsData?.results || []
//       );

//       setTerms(
//         Array.isArray(termsData)
//           ? termsData
//           : termsData?.results || []
//       );

//       setClassLevels(
//         Array.isArray(classLevelsData)
//           ? classLevelsData
//           : classLevelsData?.results || []
//       );

//       setStudents(
//         Array.isArray(studentsData)
//           ? studentsData
//           : studentsData?.results || []
//       );
//     } catch (err) {
//       console.error(
//         "Failed to load attendance report filters:",
//         err
//       );

//       setError(
//         err?.response?.data?.detail ||
//           "Failed to load attendance report information."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };


//   // ===================================================
//   // FILTER HANDLER
//   // ===================================================

//   const handleFilterChange = (event) => {
//     const { name, value } = event.target;

//     setFilters((previous) => ({
//       ...previous,
//       [name]: value,
//     }));

//     // Clear old report when changing selection.
//     if (name !== "student") {
//       setSummary(null);
//       setRecords([]);
//     }
//   };


//   // ===================================================
//   // GENERATE REPORT
//   // ===================================================

//   const handleGenerateReport = async () => {
//     if (
//       !filters.student ||
//       !filters.academic_session ||
//       !filters.term ||
//       !filters.class_level
//     ) {
//       setError(
//         "Please select a student, academic session, term and class."
//       );

//       return;
//     }

//     try {
//       setLoadingReport(true);
//       setError("");

//       // -----------------------------------------------
//       // LOAD SUMMARY
//       // -----------------------------------------------

//       const summaryData =
//         await getAttendanceSummary(
//           filters.student,
//           filters.academic_session,
//           filters.term,
//           filters.class_level
//         );

//       setSummary(summaryData);


//       // -----------------------------------------------
//       // LOAD DETAILED RECORDS
//       // -----------------------------------------------

//       const recordsData = await getAttendance({
//         student: filters.student,
//         academic_session:
//           filters.academic_session,
//         term: filters.term,
//         class_level:
//           filters.class_level,
//       });

//       const attendanceRecords = Array.isArray(
//         recordsData
//       )
//         ? recordsData
//         : recordsData?.results || [];

//       setRecords(attendanceRecords);
//     } catch (err) {
//       console.error(
//         "Failed to generate attendance report:",
//         err
//       );

//       setSummary(null);
//       setRecords([]);

//       setError(
//         err?.response?.data?.detail ||
//           "Failed to generate attendance report."
//       );
//     } finally {
//       setLoadingReport(false);
//     }
//   };


//   // ===================================================
//   // RESET
//   // ===================================================

//   const handleReset = () => {
//     setFilters(getInitialFilters());
//     setSummary(null);
//     setRecords([]);
//     setError("");
//   };


//   // ===================================================
//   // SELECTED STUDENT
//   // ===================================================

//   const selectedStudent = useMemo(() => {
//     return students.find(
//       (student) =>
//         String(student.id) ===
//         String(filters.student)
//     );
//   }, [students, filters.student]);


//   // ===================================================
//   // SELECTED SESSION
//   // ===================================================

//   const selectedSession = useMemo(() => {
//     return sessions.find(
//       (session) =>
//         String(session.id) ===
//         String(filters.academic_session)
//     );
//   }, [sessions, filters.academic_session]);


//   // ===================================================
//   // SELECTED TERM
//   // ===================================================

//   const selectedTerm = useMemo(() => {
//     return terms.find(
//       (term) =>
//         String(term.id) ===
//         String(filters.term)
//     );
//   }, [terms, filters.term]);


//   // ===================================================
//   // SELECTED CLASS
//   // ===================================================

//   const selectedClass = useMemo(() => {
//     return classLevels.find(
//       (classLevel) =>
//         String(classLevel.id) ===
//         String(filters.class_level)
//     );
//   }, [classLevels, filters.class_level]);


//   // ===================================================
//   // SORT RECORDS
//   // ===================================================

//   const sortedRecords = useMemo(() => {
//     return [...records].sort((a, b) => {
//       return String(b.date || "").localeCompare(
//         String(a.date || "")
//       );
//     });
//   }, [records]);


//   // ===================================================
//   // LOADING
//   // ===================================================

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-center">

//           <div className="w-10 h-10 mx-auto mb-4 border-4 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin" />

//           <p className="text-sm opacity-70">
//             Loading attendance report...
//           </p>

//         </div>
//       </div>
//     );
//   }


//   // ===================================================
//   // RENDER
//   // ===================================================

//   return (
//     <div className="space-y-6">

//       {/* =================================================
//           HEADER
//       ================================================= */}

//       <div>
//         <h1 className="text-2xl font-bold text-[var(--color-text)]">
//           Student Attendance
//         </h1>

//         <p className="mt-1 text-sm opacity-70">
//           View a student's attendance summary and detailed history.
//         </p>
//       </div>


//       {/* =================================================
//           ERROR
//       ================================================= */}

//       {error && (
//         <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700">

//           <div>
//             <p className="font-medium">
//               Attendance Report Error
//             </p>

//             <p className="mt-1 text-sm">
//               {error}
//             </p>
//           </div>

//           <button
//             type="button"
//             onClick={() => setError("")}
//             className="text-xl leading-none"
//           >
//             ×
//           </button>

//         </div>
//       )}


//       {/* =================================================
//           FILTER CARD
//       ================================================= */}

//       <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">

//         <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5">

//           <div>
//             <h2 className="font-semibold">
//               Attendance Report
//             </h2>

//             <p className="text-xs opacity-60 mt-1">
//               Select the student and academic period.
//             </p>
//           </div>

//           <button
//             type="button"
//             onClick={handleReset}
//             className="text-sm text-[var(--color-primary)] hover:underline"
//           >
//             Reset
//           </button>

//         </div>


//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

//           {/* STUDENT */}

//           <div>
//             <label className="block mb-1.5 text-sm font-medium">
//               Student
//             </label>

//             <select
//               name="student"
//               value={filters.student}
//               onChange={handleFilterChange}
//               className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-transparent text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
//             >
//               <option value="">
//                 Select Student
//               </option>

//               {students.map((student) => (
//                 <option
//                   key={student.id}
//                   value={student.id}
//                 >
//                   {student.full_name ||
//                     `${student.first_name || ""} ${
//                       student.last_name || ""
//                     }`.trim() ||
//                     `Student #${student.id}`}
//                 </option>
//               ))}
//             </select>
//           </div>


//           {/* SESSION */}

//           <div>
//             <label className="block mb-1.5 text-sm font-medium">
//               Academic Session
//             </label>

//             <select
//               name="academic_session"
//               value={filters.academic_session}
//               onChange={handleFilterChange}
//               className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-transparent text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
//             >
//               <option value="">
//                 Select Session
//               </option>

//               {sessions.map((session) => (
//                 <option
//                   key={session.id}
//                   value={session.id}
//                 >
//                   {session.name}
//                 </option>
//               ))}
//             </select>
//           </div>


//           {/* TERM */}

//           <div>
//             <label className="block mb-1.5 text-sm font-medium">
//               Term
//             </label>

//             <select
//               name="term"
//               value={filters.term}
//               onChange={handleFilterChange}
//               className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-transparent text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
//             >
//               <option value="">
//                 Select Term
//               </option>

//               {terms.map((term) => (
//                 <option
//                   key={term.id}
//                   value={term.id}
//                 >
//                   {term.name}
//                 </option>
//               ))}
//             </select>
//           </div>


//           {/* CLASS */}

//           <div>
//             <label className="block mb-1.5 text-sm font-medium">
//               Class
//             </label>

//             <select
//               name="class_level"
//               value={filters.class_level}
//               onChange={handleFilterChange}
//               className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-transparent text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
//             >
//               <option value="">
//                 Select Class
//               </option>

//               {classLevels.map((classLevel) => (
//                 <option
//                   key={classLevel.id}
//                   value={classLevel.id}
//                 >
//                   {classLevel.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//         </div>


//         <div className="flex justify-end mt-5">

//           <button
//             type="button"
//             onClick={handleGenerateReport}
//             disabled={loadingReport}
//             className="px-5 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
//           >
//             {loadingReport
//               ? "Generating..."
//               : "Generate Report"}
//           </button>

//         </div>

//       </div>


//       {/* =================================================
//           STUDENT HEADER
//       ================================================= */}

//       {summary && (
//         <>
//           <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">

//             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

//               <div>

//                 <h2 className="text-xl font-bold">
//                   {selectedStudent?.full_name ||
//                     summary.student_name ||
//                     "Student"}
//                 </h2>

//                 <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm opacity-70">

//                   <span>
//                     Class:{" "}
//                     {selectedClass?.name ||
//                       summary.class_name ||
//                       "-"}
//                   </span>

//                   <span>
//                     Session:{" "}
//                     {selectedSession?.name ||
//                       "-"}
//                   </span>

//                   <span>
//                     Term:{" "}
//                     {selectedTerm?.name ||
//                       "-"}
//                   </span>

//                 </div>

//               </div>


//               <div className="text-left md:text-right">

//                 <p className="text-sm opacity-60">
//                   Attendance Rate
//                 </p>

//                 <p className="text-3xl font-bold text-[var(--color-primary)]">
//                   {summary.attendance_percentage ?? 0}%
//                 </p>

//               </div>

//             </div>

//           </div>


//           {/* =================================================
//               SUMMARY CARDS
//           ================================================= */}

//           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

//             {/* TOTAL */}

//             <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">

//               <p className="text-sm opacity-60">
//                 Total Days
//               </p>

//               <p className="mt-2 text-2xl font-bold">
//                 {summary.total_days ?? 0}
//               </p>

//             </div>


//             {/* PRESENT */}

//             <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">

//               <p className="text-sm text-green-600">
//                 Present
//               </p>

//               <p className="mt-2 text-2xl font-bold text-green-600">
//                 {summary.present_days ?? 0}
//               </p>

//             </div>


//             {/* ABSENT */}

//             <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">

//               <p className="text-sm text-red-600">
//                 Absent
//               </p>

//               <p className="mt-2 text-2xl font-bold text-red-600">
//                 {summary.absent_days ?? 0}
//               </p>

//             </div>


//             {/* LATE */}

//             <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">

//               <p className="text-sm text-yellow-600">
//                 Late
//               </p>

//               <p className="mt-2 text-2xl font-bold text-yellow-600">
//                 {summary.late_days ?? 0}
//               </p>

//             </div>


//             {/* EXCUSED */}

//             <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">

//               <p className="text-sm text-blue-600">
//                 Excused
//               </p>

//               <p className="mt-2 text-2xl font-bold text-blue-600">
//                 {summary.excused_days ?? 0}
//               </p>

//             </div>

//           </div>


//           {/* =================================================
//               DETAILED HISTORY
//           ================================================= */}

//           <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">

//             <div className="px-5 py-4 border-b border-[var(--color-border)]">

//               <h2 className="font-semibold">
//                 Attendance History
//               </h2>

//               <p className="text-xs opacity-60 mt-1">
//                 {sortedRecords.length} attendance record
//                 {sortedRecords.length === 1 ? "" : "s"}
//               </p>

//             </div>


//             {sortedRecords.length === 0 ? (
//               <div className="py-14 text-center">

//                 <div className="text-4xl mb-3">
//                   📋
//                 </div>

//                 <h3 className="font-semibold">
//                   No attendance records
//                 </h3>

//                 <p className="mt-1 text-sm opacity-60">
//                   No attendance has been recorded for this selection.
//                 </p>

//               </div>
//             ) : (
//               <div className="overflow-x-auto">

//                 <table className="w-full text-sm">

//                   <thead>
//                     <tr className="border-b border-[var(--color-border)] text-left">

//                       <th className="px-5 py-3 font-medium opacity-70">
//                         Date
//                       </th>

//                       <th className="px-5 py-3 font-medium opacity-70">
//                         Class
//                       </th>

//                       <th className="px-5 py-3 font-medium opacity-70">
//                         Subject
//                       </th>

//                       <th className="px-5 py-3 font-medium opacity-70">
//                         Status
//                       </th>

//                       <th className="px-5 py-3 font-medium opacity-70">
//                         Remarks
//                       </th>

//                     </tr>
//                   </thead>


//                   <tbody>

//                     {sortedRecords.map((record) => {

//                       const status =
//                         statusConfig[
//                           record.status
//                         ] || {
//                           label:
//                             record.status ||
//                             "Unknown",
//                           className:
//                             "bg-gray-100 text-gray-700 border border-gray-200",
//                         };


//                       return (
//                         <tr
//                           key={record.id}
//                           className="border-b border-[var(--color-border)] last:border-b-0"
//                         >

//                           <td className="px-5 py-4 whitespace-nowrap">
//                             {formatDate(record.date)}
//                           </td>

//                           <td className="px-5 py-4">
//                             {record.class_name || "-"}
//                           </td>

//                           <td className="px-5 py-4">
//                             {record.subject_name ||
//                               "General"}
//                           </td>

//                           <td className="px-5 py-4">

//                             <span
//                               className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}
//                             >
//                               {status.label}
//                             </span>

//                           </td>

//                           <td className="px-5 py-4 opacity-70">
//                             {record.remarks || "-"}
//                           </td>

//                         </tr>
//                       );
//                     })}

//                   </tbody>

//                 </table>

//               </div>
//             )}

//           </div>
//         </>
//       )}

//     </div>
//   );
// }

// export default StudentAttendance;


import { useEffect, useMemo, useState } from "react";

import {
  getSessions,
  getTerms,
  getClassLevels,
} from "../../../services/academicsService";

import {
  getStudents,
  getCurrentStudentEnrollment,
} from "../../../services/studentsService";

import {
  getAttendance,
  getAttendanceSummary,
} from "../../../services/attendanceService";

// =====================================================
// HELPERS
// =====================================================

const getInitialFilters = () => ({
  student: "",
  academic_session: "",
  term: "",
  class_level: "",
});

const formatDate = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusConfig = {
  PRESENT: {
    label: "Present",
    className:
      "bg-green-100 text-green-700 border border-green-200",
  },

  ABSENT: {
    label: "Absent",
    className:
      "bg-red-100 text-red-700 border border-red-200",
  },

  LATE: {
    label: "Late",
    className:
      "bg-yellow-100 text-yellow-700 border border-yellow-200",
  },

  EXCUSED: {
    label: "Excused",
    className:
      "bg-blue-100 text-blue-700 border border-blue-200",
  },
};

// =====================================================
// COMPONENT
// =====================================================

function StudentAttendance() {
  // ===================================================
  // ACADEMIC DATA
  // ===================================================

  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [students, setStudents] = useState([]);

  // ===================================================
  // CURRENT ENROLLMENT
  // ===================================================

  const [currentEnrollment, setCurrentEnrollment] = useState(null);
  const [loadingEnrollment, setLoadingEnrollment] = useState(false);

  // ===================================================
  // FILTERS
  // ===================================================

  const [filters, setFilters] = useState(
    getInitialFilters()
  );

  // ===================================================
  // DATA
  // ===================================================

  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);

  // ===================================================
  // LOADING
  // ===================================================

  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);

  // ===================================================
  // ERROR
  // ===================================================

  const [error, setError] = useState("");

  // ===================================================
  // LOAD FILTER DATA
  // ===================================================

  useEffect(() => {
    loadFilterData();
  }, []);

  const loadFilterData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        sessionsData,
        termsData,
        classLevelsData,
        studentsData,
      ] = await Promise.all([
        getSessions(),
        getTerms(),
        getClassLevels(),
        getStudents(),
      ]);

      setSessions(
        Array.isArray(sessionsData)
          ? sessionsData
          : sessionsData?.results || []
      );

      setTerms(
        Array.isArray(termsData)
          ? termsData
          : termsData?.results || []
      );

      setClassLevels(
        Array.isArray(classLevelsData)
          ? classLevelsData
          : classLevelsData?.results || []
      );

      setStudents(
        Array.isArray(studentsData)
          ? studentsData
          : studentsData?.results || []
      );
    } catch (err) {
      console.error(
        "Failed to load attendance information:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to load attendance information."
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // LOAD CURRENT ENROLLMENT
  // ===================================================

  const loadCurrentEnrollment = async (studentId) => {
    if (!studentId) {
      setCurrentEnrollment(null);

      setFilters((previous) => ({
        ...previous,
        academic_session: "",
        term: "",
        class_level: "",
      }));

      return;
    }

    try {
      setLoadingEnrollment(true);
      setError("");

      const enrollment =
        await getCurrentStudentEnrollment(studentId);

      if (!enrollment) {
        setCurrentEnrollment(null);

        setFilters((previous) => ({
          ...previous,
          academic_session: "",
          term: "",
          class_level: "",
        }));

        setSummary(null);
        setRecords([]);

        setError(
          "This student does not have a current enrollment."
        );

        return;
      }

      setCurrentEnrollment(enrollment);

      /*
       * The enrollment is now the source of truth.
       *
       * We intentionally do not allow the admin to manually
       * choose session, term or class for this page.
       */

      setFilters((previous) => ({
        ...previous,
        academic_session:
          enrollment.academic_session ||
          enrollment.academic_session_id ||
          "",

        term:
          enrollment.term ||
          enrollment.term_id ||
          "",

        class_level:
          enrollment.class_level ||
          enrollment.class_level_id ||
          "",
      }));
    } catch (err) {
      console.error(
        "Failed to load current student enrollment:",
        err
      );

      setCurrentEnrollment(null);

      setFilters((previous) => ({
        ...previous,
        academic_session: "",
        term: "",
        class_level: "",
      }));

      setSummary(null);
      setRecords([]);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to load the student's current enrollment."
      );
    } finally {
      setLoadingEnrollment(false);
    }
  };

  // ===================================================
  // FILTER HANDLER
  // ===================================================

  const handleFilterChange = async (event) => {
    const { name, value } = event.target;

    /*
     * Only the student can be changed manually.
     * Session, term and class come from enrollment.
     */

    if (name !== "student") {
      return;
    }

    setFilters((previous) => ({
      ...previous,
      student: value,
      academic_session: "",
      term: "",
      class_level: "",
    }));

    setSummary(null);
    setRecords([]);
    setCurrentEnrollment(null);
    setError("");

    await loadCurrentEnrollment(value);
  };

  // ===================================================
  // GENERATE REPORT
  // ===================================================

  const handleGenerateReport = async () => {
    if (!filters.student) {
      setError("Please select a student.");
      return;
    }

    if (loadingEnrollment) {
      setError(
        "Please wait while the student's enrollment is loading."
      );
      return;
    }

    if (!currentEnrollment) {
      setError(
        "This student does not have a current enrollment."
      );
      return;
    }

    /*
     * Always take these values directly from the current
     * enrollment.
     */

    const academicSessionId =
      currentEnrollment.academic_session ||
      currentEnrollment.academic_session_id;

    const termId =
      currentEnrollment.term ||
      currentEnrollment.term_id;

    const classLevelId =
      currentEnrollment.class_level ||
      currentEnrollment.class_level_id;

    if (
      !academicSessionId ||
      !termId ||
      !classLevelId
    ) {
      setError(
        "The student's current enrollment is incomplete. Session, term and class are required."
      );
      return;
    }

    try {
      setLoadingReport(true);
      setError("");

      // -----------------------------------------------
      // LOAD SUMMARY
      // -----------------------------------------------

      const summaryData =
        await getAttendanceSummary(
          filters.student,
          academicSessionId,
          termId,
          classLevelId
        );

      setSummary(summaryData);

      // -----------------------------------------------
      // LOAD DETAILED RECORDS
      // -----------------------------------------------

      const recordsData = await getAttendance({
        student: filters.student,

        academic_session:
          academicSessionId,

        term: termId,

        class_level:
          classLevelId,
      });

      const attendanceRecords = Array.isArray(
        recordsData
      )
        ? recordsData
        : recordsData?.results || [];

      setRecords(attendanceRecords);
    } catch (err) {
      console.error(
        "Failed to generate attendance report:",
        err
      );

      setSummary(null);
      setRecords([]);

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to generate attendance report."
      );
    } finally {
      setLoadingReport(false);
    }
  };

  // ===================================================
  // RESET
  // ===================================================

  const handleReset = () => {
    setFilters(getInitialFilters());
    setCurrentEnrollment(null);
    setSummary(null);
    setRecords([]);
    setError("");
  };

  // ===================================================
  // SELECTED STUDENT
  // ===================================================

  const selectedStudent = useMemo(() => {
    return students.find(
      (student) =>
        String(student.id) ===
        String(filters.student)
    );
  }, [students, filters.student]);

  // ===================================================
  // SELECTED SESSION
  // ===================================================

  const selectedSession = useMemo(() => {
    return sessions.find(
      (session) =>
        String(session.id) ===
        String(filters.academic_session)
    );
  }, [sessions, filters.academic_session]);

  // ===================================================
  // SELECTED TERM
  // ===================================================

  const selectedTerm = useMemo(() => {
    return terms.find(
      (term) =>
        String(term.id) ===
        String(filters.term)
    );
  }, [terms, filters.term]);

  // ===================================================
  // SELECTED CLASS
  // ===================================================

  const selectedClass = useMemo(() => {
    return classLevels.find(
      (classLevel) =>
        String(classLevel.id) ===
        String(filters.class_level)
    );
  }, [classLevels, filters.class_level]);

  // ===================================================
  // SORT RECORDS
  // ===================================================

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      return String(b.date || "").localeCompare(
        String(a.date || "")
      );
    });
  }, [records]);

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 border-4 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin" />

          <p className="text-sm opacity-70">
            Loading attendance report...
          </p>
        </div>
      </div>
    );
  }

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Student Attendance
        </h1>

        <p className="mt-1 text-sm opacity-70">
          View a student's attendance summary and detailed
          history.
        </p>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700">
          <div>
            <p className="font-medium">
              Attendance Report Error
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-xl leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* =================================================
          FILTER CARD
      ================================================= */}

      <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-5">

          <div>
            <h2 className="font-semibold">
              Attendance Report
            </h2>

            <p className="text-xs opacity-60 mt-1">
              Select a student. Academic information is
              taken automatically from the student's
              current enrollment.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-[var(--color-primary)] hover:underline"
          >
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* =================================================
              STUDENT
          ================================================= */}

          <div>
            <label className="block mb-1.5 text-sm font-medium">
              Student
            </label>

            <select
              name="student"
              value={filters.student}
              onChange={handleFilterChange}
              disabled={loadingEnrollment}
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-transparent text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-60"
            >
              <option value="">
                Select Student
              </option>

              {students.map((student) => (
                <option
                  key={student.id}
                  value={student.id}
                >
                  {student.full_name ||
                    `${student.first_name || ""} ${
                      student.last_name || ""
                    }`.trim() ||
                    `Student #${student.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* =================================================
              SESSION
          ================================================= */}

          <div>
            <label className="block mb-1.5 text-sm font-medium">
              Academic Session
            </label>

            <select
              name="academic_session"
              value={filters.academic_session}
              disabled
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-gray-50 text-sm outline-none opacity-70 cursor-not-allowed"
            >
              <option value="">
                {loadingEnrollment
                  ? "Loading..."
                  : "Select Session"}
              </option>

              {sessions.map((session) => (
                <option
                  key={session.id}
                  value={session.id}
                >
                  {session.name}
                </option>
              ))}
            </select>
          </div>

          {/* =================================================
              TERM
          ================================================= */}

          <div>
            <label className="block mb-1.5 text-sm font-medium">
              Term
            </label>

            <select
              name="term"
              value={filters.term}
              disabled
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-gray-50 text-sm outline-none opacity-70 cursor-not-allowed"
            >
              <option value="">
                {loadingEnrollment
                  ? "Loading..."
                  : "Select Term"}
              </option>

              {terms.map((term) => (
                <option
                  key={term.id}
                  value={term.id}
                >
                  {term.name}
                </option>
              ))}
            </select>
          </div>

          {/* =================================================
              CLASS
          ================================================= */}

          <div>
            <label className="block mb-1.5 text-sm font-medium">
              Class
            </label>

            <select
              name="class_level"
              value={filters.class_level}
              disabled
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-gray-50 text-sm outline-none opacity-70 cursor-not-allowed"
            >
              <option value="">
                {loadingEnrollment
                  ? "Loading..."
                  : "Select Class"}
              </option>

              {classLevels.map((classLevel) => (
                <option
                  key={classLevel.id}
                  value={classLevel.id}
                >
                  {classLevel.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* =================================================
            ENROLLMENT INFORMATION
        ================================================= */}

        {currentEnrollment && (
          <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-[var(--color-border)]">

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">

              <span>
                <span className="font-medium">
                  Enrollment:
                </span>{" "}
                Current
              </span>

              {currentEnrollment.roll_number && (
                <span>
                  <span className="font-medium">
                    Roll Number:
                  </span>{" "}
                  {currentEnrollment.roll_number}
                </span>
              )}

              {currentEnrollment.enrollment_date && (
                <span>
                  <span className="font-medium">
                    Enrolled:
                  </span>{" "}
                  {formatDate(
                    currentEnrollment.enrollment_date
                  )}
                </span>
              )}
            </div>
          </div>
        )}

        {/* =================================================
            GENERATE BUTTON
        ================================================= */}

        <div className="flex justify-end mt-5">

          <button
            type="button"
            onClick={handleGenerateReport}
            disabled={
              loadingReport ||
              loadingEnrollment ||
              !filters.student ||
              !currentEnrollment
            }
            className="px-5 py-2.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loadingEnrollment
              ? "Loading Enrollment..."
              : loadingReport
              ? "Generating..."
              : "Generate Report"}
          </button>

        </div>
      </div>

      {/* =================================================
          STUDENT HEADER
      ================================================= */}

      {summary && (
        <>
          <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>
                <h2 className="text-xl font-bold">
                  {selectedStudent?.full_name ||
                    summary.student_name ||
                    "Student"}
                </h2>

                <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm opacity-70">

                  <span>
                    Class:{" "}
                    {selectedClass?.name ||
                      summary.class_name ||
                      "-"}
                  </span>

                  <span>
                    Session:{" "}
                    {selectedSession?.name ||
                      currentEnrollment?.session_name ||
                      "-"}
                  </span>

                  <span>
                    Term:{" "}
                    {selectedTerm?.name ||
                      currentEnrollment?.term_name ||
                      "-"}
                  </span>

                </div>
              </div>

              <div className="text-left md:text-right">

                <p className="text-sm opacity-60">
                  Attendance Rate
                </p>

                <p className="text-3xl font-bold text-[var(--color-primary)]">
                  {summary.attendance_percentage ?? 0}%
                </p>

              </div>

            </div>
          </div>

          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

            {/* TOTAL */}

            <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">

              <p className="text-sm opacity-60">
                Total Days
              </p>

              <p className="mt-2 text-2xl font-bold">
                {summary.total_days ?? 0}
              </p>

            </div>

            {/* PRESENT */}

            <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">

              <p className="text-sm text-green-600">
                Present
              </p>

              <p className="mt-2 text-2xl font-bold text-green-600">
                {summary.present_days ?? 0}
              </p>

            </div>

            {/* ABSENT */}

            <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">

              <p className="text-sm text-red-600">
                Absent
              </p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {summary.absent_days ?? 0}
              </p>

            </div>

            {/* LATE */}

            <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">

              <p className="text-sm text-yellow-600">
                Late
              </p>

              <p className="mt-2 text-2xl font-bold text-yellow-600">
                {summary.late_days ?? 0}
              </p>

            </div>

            {/* EXCUSED */}

            <div className="p-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">

              <p className="text-sm text-blue-600">
                Excused
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-600">
                {summary.excused_days ?? 0}
              </p>

            </div>

          </div>

          {/* =================================================
              DETAILED HISTORY
          ================================================= */}

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">

            <div className="px-5 py-4 border-b border-[var(--color-border)]">

              <h2 className="font-semibold">
                Attendance History
              </h2>

              <p className="text-xs opacity-60 mt-1">
                {sortedRecords.length} attendance record
                {sortedRecords.length === 1
                  ? ""
                  : "s"}
              </p>

            </div>

            {sortedRecords.length === 0 ? (
              <div className="py-14 text-center">

                <div className="text-4xl mb-3">
                  📋
                </div>

                <h3 className="font-semibold">
                  No attendance records
                </h3>

                <p className="mt-1 text-sm opacity-60">
                  No attendance has been recorded for this
                  selection.
                </p>

              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead>
                    <tr className="border-b border-[var(--color-border)] text-left">

                      <th className="px-5 py-3 font-medium opacity-70">
                        Date
                      </th>

                      <th className="px-5 py-3 font-medium opacity-70">
                        Class
                      </th>

                      <th className="px-5 py-3 font-medium opacity-70">
                        Subject
                      </th>

                      <th className="px-5 py-3 font-medium opacity-70">
                        Status
                      </th>

                      <th className="px-5 py-3 font-medium opacity-70">
                        Remarks
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {sortedRecords.map((record) => {

                      const status =
                        statusConfig[
                          record.status
                        ] || {
                          label:
                            record.status ||
                            "Unknown",

                          className:
                            "bg-gray-100 text-gray-700 border border-gray-200",
                        };

                      return (
                        <tr
                          key={record.id}
                          className="border-b border-[var(--color-border)] last:border-b-0"
                        >

                          <td className="px-5 py-4 whitespace-nowrap">
                            {formatDate(record.date)}
                          </td>

                          <td className="px-5 py-4">
                            {record.class_name || "-"}
                          </td>

                          <td className="px-5 py-4">
                            {record.subject_name ||
                              "General"}
                          </td>

                          <td className="px-5 py-4">

                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}
                            >
                              {status.label}
                            </span>

                          </td>

                          <td className="px-5 py-4 opacity-70">
                            {record.remarks || "-"}
                          </td>

                        </tr>
                      );
                    })}

                  </tbody>
                </table>

              </div>
            )}

          </div>
        </>
      )}

    </div>
  );
}

export default StudentAttendance;