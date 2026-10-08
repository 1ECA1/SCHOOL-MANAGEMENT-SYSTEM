// import { useEffect, useMemo, useState } from "react";

// import {
//   AlertCircle,
//   BarChart3,
//   CalendarDays,
//   CheckCircle,
//   Loader2,
//   RefreshCw,
//   Search,
//   Users,
//   X,
// } from "lucide-react";

// import {
//   getAttendanceSummary,
// } from "../../../services/attendanceService";

// import {
//   getStudents,
//   getEnrollments,
// } from "../../../services/studentsService";

// import {
//   getSessions,
//   getTerms,
//   getClassLevels,
// } from "../../../services/academicsService";

// // ============================================================
// // HELPERS
// // ============================================================

// const unwrapList = (data) => {
//   if (Array.isArray(data)) {
//     return data;
//   }

//   if (Array.isArray(data?.results)) {
//     return data.results;
//   }

//   return [];
// };

// const getStudentName = (student) => {
//   if (!student) return "";

//   return (
//     student.full_name ||
//     student.name ||
//     `${student.first_name || ""} ${
//       student.last_name || ""
//     }`.trim() ||
//     student.admission_number ||
//     `Student #${student.id}`
//   );
// };

// const getSessionName = (item) => {
//   if (!item) return "";

//   return (
//     item.name ||
//     item.session_name ||
//     item.academic_session_name ||
//     `Session ${item.id}`
//   );
// };

// const getTermName = (item) => {
//   if (!item) return "";

//   return (
//     item.name ||
//     item.term_name ||
//     `Term ${item.id}`
//   );
// };

// const getClassName = (item) => {
//   if (!item) return "";

//   return (
//     item.name ||
//     item.class_name ||
//     item.class_level_name ||
//     `Class ${item.id}`
//   );
// };

// const extractErrorMessage = (error) => {
//   const data = error?.response?.data;

//   if (!data) {
//     return error?.message || "Something went wrong.";
//   }

//   if (typeof data === "string") {
//     return data;
//   }

//   if (data.detail) {
//     return data.detail;
//   }

//   if (data.message) {
//     return data.message;
//   }

//   if (typeof data === "object") {
//     return Object.entries(data)
//       .map(([field, messages]) => {
//         const value = Array.isArray(messages)
//           ? messages.join(", ")
//           : String(messages);

//         return `${field}: ${value}`;
//       })
//       .join(" | ");
//   }

//   return "Something went wrong.";
// };

// const formatPercentage = (value) => {
//   const number = Number(value);

//   if (Number.isNaN(number)) {
//     return "0%";
//   }

//   return `${number.toFixed(1)}%`;
// };

// const getPercentageClass = (value) => {
//   const percentage = Number(value);

//   if (percentage >= 75) {
//     return "text-emerald-600";
//   }

//   if (percentage >= 50) {
//     return "text-amber-600";
//   }

//   return "text-red-600";
// };

// // ============================================================
// // COMPONENT
// // ============================================================

// export default function AttendanceReports() {
//   // ==========================================================
//   // DATA
//   // ==========================================================

//   const [students, setStudents] = useState([]);
//   const [sessions, setSessions] = useState([]);
//   const [terms, setTerms] = useState([]);
//   const [classLevels, setClassLevels] = useState([]);
//   const [enrollments, setEnrollments] = useState([]);

//   // ==========================================================
//   // REPORT STATE
//   // ==========================================================

//   const [reports, setReports] = useState([]);

//   // ==========================================================
//   // UI STATE
//   // ==========================================================

//   const [loadingOptions, setLoadingOptions] = useState(true);
//   const [loadingReport, setLoadingReport] = useState(false);

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const [search, setSearch] = useState("");

//   // ==========================================================
//   // FILTERS
//   // ==========================================================

//   const [filters, setFilters] = useState({
//     academic_session: "",
//     term: "",
//     class_level: "",
//     student: "",
//   });

//   // ==========================================================
//   // LOAD OPTIONS
//   // ==========================================================

//   const loadOptions = async () => {
//     setLoadingOptions(true);
//     setError("");

//     try {
//       const [
//         studentsResponse,
//         sessionsResponse,
//         termsResponse,
//         classesResponse,
//       ] = await Promise.all([
//         getStudents(),
//         getSessions(),
//         getTerms(),
//         getClassLevels(),
//       ]);

//       setStudents(unwrapList(studentsResponse));
//       setSessions(unwrapList(sessionsResponse));
//       setTerms(unwrapList(termsResponse));
//       setClassLevels(unwrapList(classesResponse));
//     } catch (err) {
//       setError(extractErrorMessage(err));
//     } finally {
//       setLoadingOptions(false);
//     }
//   };

//   // ==========================================================
//   // LOAD ENROLLMENTS
//   // ==========================================================

//   const loadEnrollments = async () => {
//     try {
//       const params = {};

//       if (filters.class_level) {
//         params.classLevel = filters.class_level;
//       }

//       if (filters.academic_session) {
//         params.academicSession =
//           filters.academic_session;
//       }

//       if (filters.term) {
//         params.term = filters.term;
//       }

//       const response = await getEnrollments(params);

//       setEnrollments(unwrapList(response));
//     } catch (err) {
//       setEnrollments([]);
//     }
//   };

//   // ==========================================================
//   // INITIAL LOAD
//   // ==========================================================

//   useEffect(() => {
//     loadOptions();
//   }, []);

//   // ==========================================================
//   // ENROLLMENTS
//   // ==========================================================

//   useEffect(() => {
//     if (
//       filters.class_level ||
//       filters.academic_session ||
//       filters.term
//     ) {
//       loadEnrollments();
//     } else {
//       setEnrollments([]);
//     }
//   }, [
//     filters.class_level,
//     filters.academic_session,
//     filters.term,
//   ]);

//   // ==========================================================
//   // FILTER UPDATE
//   // ==========================================================

//   const updateFilter = (field, value) => {
//     setFilters((previous) => ({
//       ...previous,
//       [field]: value,
//     }));
//   };

//   // ==========================================================
//   // GENERATE REPORT
//   // ==========================================================

//   const generateReport = async () => {
//     setError("");
//     setSuccess("");

//     if (!filters.academic_session) {
//       setError("Please select an academic session.");
//       return;
//     }

//     if (!filters.term) {
//       setError("Please select a term.");
//       return;
//     }

//     if (!filters.class_level) {
//       setError("Please select a class.");
//       return;
//     }

//     setLoadingReport(true);

//     try {
//       let targetStudents = students;

//       // ------------------------------------------------------
//       // If a specific student was selected
//       // ------------------------------------------------------

//       if (filters.student) {
//         targetStudents = students.filter(
//           (student) =>
//             String(student.id) ===
//             String(filters.student),
//         );
//       }

//       // ------------------------------------------------------
//       // If class was selected, restrict students to the
//       // relevant enrollment.
//       // ------------------------------------------------------

//       if (!filters.student) {
//         const enrollmentStudentIds =
//           new Set(
//             enrollments
//               .filter((enrollment) => {
//                 const matchesSession =
//                   !filters.academic_session ||
//                   String(
//                     enrollment.academic_session,
//                   ) ===
//                     String(
//                       filters.academic_session,
//                     );

//                 const matchesTerm =
//                   !filters.term ||
//                   String(enrollment.term) ===
//                     String(filters.term);

//                 const matchesClass =
//                   !filters.class_level ||
//                   String(
//                     enrollment.class_level,
//                   ) ===
//                     String(filters.class_level);

//                 return (
//                   matchesSession &&
//                   matchesTerm &&
//                   matchesClass
//                 );
//               })
//               .map((enrollment) =>
//                 String(enrollment.student),
//               ),
//           );

//         targetStudents = students.filter((student) =>
//           enrollmentStudentIds.has(
//             String(student.id),
//           ),
//         );
//       }

//       if (targetStudents.length === 0) {
//         setReports([]);
//         setSuccess(
//           "No students were found for the selected class and academic period.",
//         );
//         return;
//       }

//       // ------------------------------------------------------
//       // Request the backend summary for every student.
//       // ------------------------------------------------------

//       const results = await Promise.all(
//         targetStudents.map(async (student) => {
//           try {
//             const summary =
//               await getAttendanceSummary(
//                 student.id,
//                 filters.academic_session,
//                 filters.term,
//                 filters.class_level,
//               );

//             return {
//               ...summary,

//               student_id:
//                 summary.student || student.id,

//               student_name:
//                 summary.student_name ||
//                 getStudentName(student),

//               admission_number:
//                 summary.admission_number ||
//                 student.admission_number ||
//                 "",

//               success: true,
//             };
//           } catch (err) {
//             return {
//               student_id: student.id,

//               student_name:
//                 getStudentName(student),

//               admission_number:
//                 student.admission_number || "",

//               success: false,

//               error:
//                 extractErrorMessage(err),
//             };
//           }
//         }),
//       );

//       setReports(results);

//       setSuccess(
//         `Attendance report generated for ${results.length} student${
//           results.length === 1 ? "" : "s"
//         }.`,
//       );
//     } catch (err) {
//       setError(extractErrorMessage(err));
//       setReports([]);
//     } finally {
//       setLoadingReport(false);
//     }
//   };

//   // ==========================================================
//   // FILTER DISPLAYED REPORTS
//   // ==========================================================

//   const filteredReports = useMemo(() => {
//     const value = search.trim().toLowerCase();

//     if (!value) {
//       return reports;
//     }

//     return reports.filter((report) => {
//       return [
//         report.student_name,
//         report.admission_number,
//       ]
//         .filter(Boolean)
//         .some((item) =>
//           String(item)
//             .toLowerCase()
//             .includes(value),
//         );
//     });
//   }, [reports, search]);

//   // ==========================================================
//   // OVERALL STATISTICS
//   // ==========================================================

//   const statistics = useMemo(() => {
//     const validReports = reports.filter(
//       (report) => report.success,
//     );

//     const totalStudents = validReports.length;

//     const totalDays = validReports.reduce(
//       (total, report) =>
//         total + Number(report.total_days || 0),
//       0,
//     );

//     const presentDays = validReports.reduce(
//       (total, report) =>
//         total + Number(report.present_days || 0),
//       0,
//     );

//     const absentDays = validReports.reduce(
//       (total, report) =>
//         total + Number(report.absent_days || 0),
//       0,
//     );

//     const lateDays = validReports.reduce(
//       (total, report) =>
//         total + Number(report.late_days || 0),
//       0,
//     );

//     const excusedDays = validReports.reduce(
//       (total, report) =>
//         total + Number(report.excused_days || 0),
//       0,
//     );

//     const averagePercentage =
//       totalStudents > 0
//         ? validReports.reduce(
//             (total, report) =>
//               total +
//               Number(
//                 report.attendance_percentage || 0,
//               ),
//             0,
//           ) / totalStudents
//         : 0;

//     return {
//       totalStudents,
//       totalDays,
//       presentDays,
//       absentDays,
//       lateDays,
//       excusedDays,
//       averagePercentage,
//     };
//   }, [reports]);

//   // ==========================================================
//   // CLEAR
//   // ==========================================================

//   const clearReport = () => {
//     setReports([]);
//     setSearch("");
//     setSuccess("");
//     setError("");
//   };

//   // ==========================================================
//   // RENDER
//   // ==========================================================

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       {/* ======================================================
//           HEADER
//       ====================================================== */}

//       <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//         <div className="flex items-center gap-3">
//           <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100">
//             <BarChart3 className="h-6 w-6 text-indigo-600" />
//           </div>

//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">
//               Attendance Reports
//             </h1>

//             <p className="text-sm text-gray-500">
//               View student attendance summaries by academic
//               period.
//             </p>
//           </div>
//         </div>

//         <button
//           type="button"
//           onClick={loadOptions}
//           disabled={loadingOptions}
//           className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60 lg:self-auto"
//         >
//           <RefreshCw
//             className={`h-4 w-4 ${
//               loadingOptions
//                 ? "animate-spin"
//                 : ""
//             }`}
//           />

//           Refresh Options
//         </button>
//       </div>

//       {/* ======================================================
//           ALERTS
//       ====================================================== */}

//       {error && (
//         <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
//           <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

//           <div className="flex-1">
//             {error}
//           </div>

//           <button
//             type="button"
//             onClick={() => setError("")}
//             className="text-red-500 hover:text-red-700"
//           >
//             <X className="h-4 w-4" />
//           </button>
//         </div>
//       )}

//       {success && (
//         <div className="mb-5 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
//           <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />

//           <div className="flex-1">
//             {success}
//           </div>

//           <button
//             type="button"
//             onClick={() => setSuccess("")}
//             className="text-emerald-500 hover:text-emerald-700"
//           >
//             <X className="h-4 w-4" />
//           </button>
//         </div>
//       )}

//       {/* ======================================================
//           REPORT FILTER
//       ====================================================== */}

//       <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
//         <div className="border-b border-gray-100 px-5 py-4">
//           <h2 className="font-semibold text-gray-900">
//             Report Parameters
//           </h2>

//           <p className="mt-1 text-xs text-gray-500">
//             Select the academic period and class for the
//             attendance report.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 lg:grid-cols-4">
//           {/* Session */}

//           <ReportSelect
//             label="Academic Session"
//             required
//             value={filters.academic_session}
//             onChange={(value) =>
//               updateFilter(
//                 "academic_session",
//                 value,
//               )
//             }
//             options={sessions}
//             placeholder="Select session"
//             getLabel={getSessionName}
//             disabled={loadingOptions}
//           />

//           {/* Term */}

//           <ReportSelect
//             label="Term"
//             required
//             value={filters.term}
//             onChange={(value) =>
//               updateFilter("term", value)
//             }
//             options={terms}
//             placeholder="Select term"
//             getLabel={getTermName}
//             disabled={loadingOptions}
//           />

//           {/* Class */}

//           <ReportSelect
//             label="Class"
//             required
//             value={filters.class_level}
//             onChange={(value) =>
//               updateFilter(
//                 "class_level",
//                 value,
//               )
//             }
//             options={classLevels}
//             placeholder="Select class"
//             getLabel={getClassName}
//             disabled={loadingOptions}
//           />

//           {/* Student */}

//           <ReportSelect
//             label="Student"
//             value={filters.student}
//             onChange={(value) =>
//               updateFilter("student", value)
//             }
//             options={students}
//             placeholder="All students"
//             getLabel={(student) =>
//               `${getStudentName(student)}${
//                 student.admission_number
//                   ? ` — ${student.admission_number}`
//                   : ""
//               }`
//             }
//             disabled={loadingOptions}
//           />

//           {/* Buttons */}

//           <div className="flex items-end gap-2 md:col-span-2 lg:col-span-4">
//             <button
//               type="button"
//               onClick={generateReport}
//               disabled={
//                 loadingReport ||
//                 loadingOptions
//               }
//               className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
//             >
//               {loadingReport ? (
//                 <Loader2 className="h-4 w-4 animate-spin" />
//               ) : (
//                 <BarChart3 className="h-4 w-4" />
//               )}

//               {loadingReport
//                 ? "Generating..."
//                 : "Generate Report"}
//             </button>

//             <button
//               type="button"
//               onClick={clearReport}
//               disabled={
//                 loadingReport ||
//                 reports.length === 0
//               }
//               className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
//             >
//               Clear
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* ======================================================
//           STATISTICS
//       ====================================================== */}

//       {reports.length > 0 && (
//         <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
//           <SummaryCard
//             icon={<Users className="h-5 w-5" />}
//             label="Students"
//             value={statistics.totalStudents}
//             className="bg-indigo-100 text-indigo-600"
//           />

//           <SummaryCard
//             icon={<CalendarDays className="h-5 w-5" />}
//             label="Total Days"
//             value={statistics.totalDays}
//             className="bg-gray-100 text-gray-600"
//           />

//           <SummaryCard
//             icon={<CheckCircle className="h-5 w-5" />}
//             label="Present"
//             value={statistics.presentDays}
//             className="bg-emerald-100 text-emerald-600"
//           />

//           <SummaryCard
//             icon={<X className="h-5 w-5" />}
//             label="Absent"
//             value={statistics.absentDays}
//             className="bg-red-100 text-red-600"
//           />

//           <SummaryCard
//             icon={<BarChart3 className="h-5 w-5" />}
//             label="Late"
//             value={statistics.lateDays}
//             className="bg-amber-100 text-amber-600"
//           />

//           <SummaryCard
//             icon={<CheckCircle className="h-5 w-5" />}
//             label="Average"
//             value={formatPercentage(
//               statistics.averagePercentage,
//             )}
//             className="bg-blue-100 text-blue-600"
//           />
//         </div>
//       )}

//       {/* ======================================================
//           REPORT TABLE
//       ====================================================== */}

//       <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
//         <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <h2 className="font-semibold text-gray-900">
//               Student Attendance Summary
//             </h2>

//             <p className="text-xs text-gray-500">
//               {filteredReports.length} student
//               {filteredReports.length === 1
//                 ? ""
//                 : "s"}
//             </p>
//           </div>

//           {reports.length > 0 && (
//             <div className="relative w-full sm:w-72">
//               <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

//               <input
//                 type="text"
//                 value={search}
//                 onChange={(event) =>
//                   setSearch(event.target.value)
//                 }
//                 placeholder="Search student..."
//                 className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//               />
//             </div>
//           )}
//         </div>

//         {loadingReport ? (
//           <div className="flex min-h-[300px] items-center justify-center">
//             <div className="flex flex-col items-center gap-3 text-gray-500">
//               <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />

//               <span className="text-sm">
//                 Generating attendance report...
//               </span>
//             </div>
//           </div>
//         ) : reports.length === 0 ? (
//           <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
//             <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
//               <BarChart3 className="h-7 w-7 text-gray-400" />
//             </div>

//             <h3 className="font-semibold text-gray-900">
//               No report generated
//             </h3>

//             <p className="mt-1 max-w-md text-sm text-gray-500">
//               Select an academic session, term and class,
//               then click Generate Report.
//             </p>
//           </div>
//         ) : filteredReports.length === 0 ? (
//           <div className="flex min-h-[250px] items-center justify-center px-6 text-center">
//             <div>
//               <Search className="mx-auto h-8 w-8 text-gray-400" />

//               <p className="mt-3 font-medium text-gray-800">
//                 No students match your search.
//               </p>
//             </div>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-[1100px] w-full">
//               <thead className="bg-gray-50">
//                 <tr className="border-b border-gray-200 text-left">
//                   <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
//                     Student
//                   </th>

//                   <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
//                     School Opened
//                   </th>

//                   <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
//                     Total Days
//                   </th>

//                   <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
//                     Present
//                   </th>

//                   <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
//                     Absent
//                   </th>

//                   <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
//                     Late
//                   </th>

//                   <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
//                     Excused
//                   </th>

//                   <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
//                     Attendance
//                   </th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-gray-100">
//                 {filteredReports.map((report) => {
//                   if (!report.success) {
//                     return (
//                       <tr
//                         key={report.student_id}
//                         className="bg-red-50/40"
//                       >
//                         <td className="px-4 py-4">
//                           <div className="font-medium text-gray-900">
//                             {report.student_name}
//                           </div>

//                           {report.admission_number && (
//                             <div className="text-xs text-gray-500">
//                               {report.admission_number}
//                             </div>
//                           )}
//                         </td>

//                         <td
//                           colSpan={7}
//                           className="px-4 py-4 text-sm text-red-600"
//                         >
//                           Unable to load attendance summary:
//                           {" "}
//                           {report.error}
//                         </td>
//                       </tr>
//                     );
//                   }

//                   return (
//                     <tr
//                       key={report.student_id}
//                       className="transition hover:bg-gray-50"
//                     >
//                       <td className="px-4 py-4">
//                         <div className="font-medium text-gray-900">
//                           {report.student_name}
//                         </div>

//                         {report.admission_number && (
//                           <div className="mt-0.5 text-xs text-gray-500">
//                             {report.admission_number}
//                           </div>
//                         )}
//                       </td>

//                       <td className="px-4 py-4 text-center text-sm font-medium text-gray-700">
//                         {report.times_school_opened ??
//                           0}
//                       </td>

//                       <td className="px-4 py-4 text-center text-sm text-gray-700">
//                         {report.total_days ?? 0}
//                       </td>

//                       <td className="px-4 py-4 text-center text-sm font-semibold text-emerald-600">
//                         {report.present_days ?? 0}
//                       </td>

//                       <td className="px-4 py-4 text-center text-sm font-semibold text-red-600">
//                         {report.absent_days ?? 0}
//                       </td>

//                       <td className="px-4 py-4 text-center text-sm font-semibold text-amber-600">
//                         {report.late_days ?? 0}
//                       </td>

//                       <td className="px-4 py-4 text-center text-sm font-semibold text-blue-600">
//                         {report.excused_days ?? 0}
//                       </td>

//                       <td className="px-4 py-4 text-right">
//                         <span
//                           className={`text-base font-bold ${getPercentageClass(
//                             report.attendance_percentage,
//                           )}`}
//                         >
//                           {formatPercentage(
//                             report.attendance_percentage,
//                           )}
//                         </span>
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

// // ============================================================
// // REPORT SELECT
// // ============================================================

// function ReportSelect({
//   label,
//   required = false,
//   value,
//   onChange,
//   options,
//   placeholder,
//   getLabel,
//   disabled = false,
// }) {
//   return (
//     <div>
//       <label className="mb-1.5 block text-sm font-medium text-gray-700">
//         {label}

//         {required && (
//           <span className="ml-1 text-red-500">
//             *
//           </span>
//         )}
//       </label>

//       <select
//         value={value}
//         onChange={(event) =>
//           onChange(event.target.value)
//         }
//         disabled={disabled}
//         className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-gray-50"
//       >
//         <option value="">
//           {placeholder}
//         </option>

//         {options.map((item) => (
//           <option
//             key={item.id}
//             value={item.id}
//           >
//             {getLabel(item)}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }

// // ============================================================
// // SUMMARY CARD
// // ============================================================

// function SummaryCard({
//   icon,
//   label,
//   value,
//   className,
// }) {
//   return (
//     <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
//       <div className="flex items-center gap-3">
//         <div
//           className={`flex h-10 w-10 items-center justify-center rounded-lg ${className}`}
//         >
//           {icon}
//         </div>

//         <div>
//           <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
//             {label}
//           </p>

//           <p className="mt-0.5 text-xl font-bold text-gray-900">
//             {value}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle,
  Loader2,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";

import {
  getAttendanceSummary,
} from "../../../services/attendanceService";

import {
  getStudents,
  getEnrollments,
} from "../../../services/studentsService";

import {
  getSessions,
  getTerms,
  getClassLevels,
} from "../../../services/academicsService";

// ============================================================
// HELPERS
// ============================================================

const unwrapList = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

const getStudentName = (student) => {
  if (!student) return "";

  return (
    student.full_name ||
    student.name ||
    `${student.first_name || ""} ${
      student.middle_name || ""
    } ${student.last_name || ""}`.trim() ||
    student.admission_number ||
    `Student #${student.id}`
  );
};

const getStudentAdmissionNumber = (student) => {
  if (!student) return "";

  return (
    student.admission_number ||
    student.admissionNo ||
    student.admission_no ||
    ""
  );
};

const getSessionName = (item) => {
  if (!item) return "";

  return (
    item.name ||
    item.session_name ||
    item.academic_session_name ||
    `Session ${item.id}`
  );
};

const getTermName = (item) => {
  if (!item) return "";

  return (
    item.name ||
    item.term_name ||
    `Term ${item.id}`
  );
};

const getClassName = (item) => {
  if (!item) return "";

  return (
    item.name ||
    item.class_name ||
    item.class_level_name ||
    `Class ${item.id}`
  );
};

const getEnrollmentStudentId = (enrollment) => {
  if (!enrollment) return null;

  if (
    enrollment.student &&
    typeof enrollment.student === "object"
  ) {
    return enrollment.student.id;
  }

  return (
    enrollment.student ||
    enrollment.student_id ||
    null
  );
};

const getEnrollmentClassId = (enrollment) => {
  if (!enrollment) return null;

  if (
    enrollment.class_level &&
    typeof enrollment.class_level === "object"
  ) {
    return enrollment.class_level.id;
  }

  return (
    enrollment.class_level ||
    enrollment.class_level_id ||
    null
  );
};

const getEnrollmentSessionId = (enrollment) => {
  if (!enrollment) return null;

  if (
    enrollment.academic_session &&
    typeof enrollment.academic_session === "object"
  ) {
    return enrollment.academic_session.id;
  }

  return (
    enrollment.academic_session ||
    enrollment.academic_session_id ||
    null
  );
};

const getEnrollmentTermId = (enrollment) => {
  if (!enrollment) return null;

  if (
    enrollment.term &&
    typeof enrollment.term === "object"
  ) {
    return enrollment.term.id;
  }

  return enrollment.term || enrollment.term_id || null;
};

const extractErrorMessage = (error) => {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || "Something went wrong.";
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  if (data.message) {
    return data.message;
  }

  if (typeof data === "object") {
    return Object.entries(data)
      .map(([field, messages]) => {
        const value = Array.isArray(messages)
          ? messages.join(", ")
          : String(messages);

        return `${field}: ${value}`;
      })
      .join(" | ");
  }

  return "Something went wrong.";
};

const formatPercentage = (value) => {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return "0%";
  }

  return `${number.toFixed(1)}%`;
};

const getPercentageClass = (value) => {
  const percentage = Number(value);

  if (percentage >= 75) {
    return "text-emerald-600";
  }

  if (percentage >= 50) {
    return "text-amber-600";
  }

  return "text-red-600";
};

// ============================================================
// COMPONENT
// ============================================================

export default function AttendanceReports() {
  // ==========================================================
  // DATA
  // ==========================================================

  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classLevels, setClassLevels] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  // ==========================================================
  // REPORT STATE
  // ==========================================================

  const [reports, setReports] = useState([]);

  // ==========================================================
  // UI STATE
  // ==========================================================

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] =
    useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  // ==========================================================
  // FILTERS
  // ==========================================================

  const [filters, setFilters] = useState({
    academic_session: "",
    term: "",
    class_level: "",
    student: "",
  });

  // ==========================================================
  // LOAD BASIC OPTIONS
  // ==========================================================

  const loadOptions = async () => {
    setLoadingOptions(true);
    setError("");

    try {
      const [
        studentsResponse,
        sessionsResponse,
        termsResponse,
        classesResponse,
      ] = await Promise.all([
        getStudents(),
        getSessions(),
        getTerms(),
        getClassLevels(),
      ]);

      setStudents(unwrapList(studentsResponse));
      setSessions(unwrapList(sessionsResponse));
      setTerms(unwrapList(termsResponse));
      setClassLevels(unwrapList(classesResponse));
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoadingOptions(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadOptions();
  }, []);

  // ==========================================================
  // LOAD ENROLLMENTS FOR SELECTED ACADEMIC PERIOD / CLASS
  // ==========================================================

  const loadEnrollments = async () => {
    if (
      !filters.class_level ||
      !filters.academic_session ||
      !filters.term
    ) {
      setEnrollments([]);
      return;
    }

    setLoadingEnrollments(true);
    setError("");

    try {
      const response = await getEnrollments({
        classLevel: filters.class_level,
        academicSession:
          filters.academic_session,
        term: filters.term,
      });

      setEnrollments(unwrapList(response));
    } catch (err) {
      setEnrollments([]);
      setError(
        extractErrorMessage(
          err,
        ),
      );
    } finally {
      setLoadingEnrollments(false);
    }
  };

  // ==========================================================
  // LOAD ENROLLMENTS WHEN REPORT PARAMETERS CHANGE
  // ==========================================================

  useEffect(() => {
    if (
      filters.class_level &&
      filters.academic_session &&
      filters.term
    ) {
      loadEnrollments();
    } else {
      setEnrollments([]);
    }

    // Student selection must be reset when the academic
    // context changes.
    setFilters((previous) => ({
      ...previous,
      student: "",
    }));
  }, [
    filters.class_level,
    filters.academic_session,
    filters.term,
  ]);

  // ==========================================================
  // STUDENTS BELONGING TO SELECTED CLASS / SESSION / TERM
  // ==========================================================

  const enrolledStudentIds = useMemo(() => {
    return new Set(
      enrollments
        .map((enrollment) =>
          getEnrollmentStudentId(enrollment),
        )
        .filter(Boolean)
        .map((id) => String(id)),
    );
  }, [enrollments]);

  // ==========================================================
  // FILTER STUDENTS
  //
  // Only students enrolled in the selected:
  //   - academic session
  //   - term
  //   - class
  //
  // are displayed.
  // ==========================================================

  const reportStudents = useMemo(() => {
    if (
      !filters.class_level ||
      !filters.academic_session ||
      !filters.term
    ) {
      return [];
    }

    return students.filter((student) =>
      enrolledStudentIds.has(
        String(student.id),
      ),
    );
  }, [
    students,
    enrolledStudentIds,
    filters.class_level,
    filters.academic_session,
    filters.term,
  ]);

  // ==========================================================
  // SEARCH STUDENTS
  //
  // Search works with:
  //   - first name
  //   - middle name
  //   - last name
  //   - full name
  //   - admission number
  // ==========================================================

  const searchableStudents = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return reportStudents;
    }

    return reportStudents.filter((student) => {
      const name = getStudentName(student);

      const admissionNumber =
        getStudentAdmissionNumber(student);

      return (
        name.toLowerCase().includes(value) ||
        admissionNumber
          .toLowerCase()
          .includes(value)
      );
    });
  }, [reportStudents, search]);

  // ==========================================================
  // FILTER UPDATE
  // ==========================================================

  const updateFilter = (field, value) => {
    setFilters((previous) => {
      const updated = {
        ...previous,
        [field]: value,
      };

      // Changing academic session means the existing
      // term/class/student combination may no longer
      // be valid.
      if (field === "academic_session") {
        updated.student = "";
      }

      // Changing term means the existing student
      // enrollment may no longer be valid.
      if (field === "term") {
        updated.student = "";
      }

      // Changing class means the student must be selected
      // from the new class.
      if (field === "class_level") {
        updated.student = "";
      }

      return updated;
    });
  };

  // ==========================================================
  // GENERATE REPORT
  // ==========================================================

  const generateReport = async () => {
    setError("");
    setSuccess("");

    if (!filters.academic_session) {
      setError("Please select an academic session.");
      return;
    }

    if (!filters.term) {
      setError("Please select a term.");
      return;
    }

    if (!filters.class_level) {
      setError("Please select a class.");
      return;
    }

    if (loadingEnrollments) {
      setError(
        "Please wait for the class students to finish loading.",
      );
      return;
    }

    // --------------------------------------------------------
    // Determine students for report
    // --------------------------------------------------------

    let targetStudents = reportStudents;

    // Specific student selected
    if (filters.student) {
      targetStudents = reportStudents.filter(
        (student) =>
          String(student.id) ===
          String(filters.student),
      );
    }

    if (targetStudents.length === 0) {
      setReports([]);

      setSuccess(
        "No students were found for the selected class and academic period.",
      );

      return;
    }

    setLoadingReport(true);

    try {
      // ------------------------------------------------------
      // Request backend attendance summary for each student
      // ------------------------------------------------------

      const results = await Promise.all(
        targetStudents.map(async (student) => {
          try {
            const summary =
              await getAttendanceSummary(
                student.id,
                filters.academic_session,
                filters.term,
                filters.class_level,
              );

            return {
              ...summary,

              student_id:
                summary.student ||
                student.id,

              student_name:
                summary.student_name ||
                getStudentName(student),

              admission_number:
                summary.admission_number ||
                getStudentAdmissionNumber(
                  student,
                ),

              success: true,
            };
          } catch (err) {
            return {
              student_id: student.id,

              student_name:
                getStudentName(student),

              admission_number:
                getStudentAdmissionNumber(
                  student,
                ),

              success: false,

              error:
                extractErrorMessage(err),
            };
          }
        }),
      );

      setReports(results);

      setSuccess(
        `Attendance report generated for ${
          results.length
        } student${
          results.length === 1
            ? ""
            : "s"
        }.`,
      );
    } catch (err) {
      setError(
        extractErrorMessage(err),
      );

      setReports([]);
    } finally {
      setLoadingReport(false);
    }
  };

  // ==========================================================
  // FILTER DISPLAYED REPORTS
  // ==========================================================

  const filteredReports = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return reports;
    }

    return reports.filter((report) => {
      return [
        report.student_name,
        report.admission_number,
      ]
        .filter(Boolean)
        .some((item) =>
          String(item)
            .toLowerCase()
            .includes(value),
        );
    });
  }, [reports, search]);

  // ==========================================================
  // OVERALL STATISTICS
  // ==========================================================

  const statistics = useMemo(() => {
    const validReports = reports.filter(
      (report) => report.success,
    );

    const totalStudents =
      validReports.length;

    const totalDays =
      validReports.reduce(
        (total, report) =>
          total +
          Number(
            report.total_days || 0,
          ),
        0,
      );

    const presentDays =
      validReports.reduce(
        (total, report) =>
          total +
          Number(
            report.present_days || 0,
          ),
        0,
      );

    const absentDays =
      validReports.reduce(
        (total, report) =>
          total +
          Number(
            report.absent_days || 0,
          ),
        0,
      );

    const lateDays =
      validReports.reduce(
        (total, report) =>
          total +
          Number(
            report.late_days || 0,
          ),
        0,
      );

    const excusedDays =
      validReports.reduce(
        (total, report) =>
          total +
          Number(
            report.excused_days || 0,
          ),
        0,
      );

    const averagePercentage =
      totalStudents > 0
        ? validReports.reduce(
            (total, report) =>
              total +
              Number(
                report.attendance_percentage ||
                  0,
              ),
            0,
          ) / totalStudents
        : 0;

    return {
      totalStudents,
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      excusedDays,
      averagePercentage,
    };
  }, [reports]);

  // ==========================================================
  // CLEAR REPORT
  // ==========================================================

  const clearReport = () => {
    setReports([]);
    setSearch("");
    setSuccess("");
    setError("");
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Attendance Reports
            </h1>

            <p className="text-sm text-gray-500">
              View student attendance summaries by academic
              period.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadOptions}
          disabled={loadingOptions}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60 lg:self-auto"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loadingOptions
                ? "animate-spin"
                : ""
            }`}
          />

          Refresh Options
        </button>
      </div>

      {/* ======================================================
          ALERTS
      ====================================================== */}

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div className="flex-1">
            {error}
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div className="flex-1">
            {success}
          </div>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="text-emerald-500 hover:text-emerald-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ======================================================
          REPORT FILTER
      ====================================================== */}

      <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-semibold text-gray-900">
            Report Parameters
          </h2>

          <p className="mt-1 text-xs text-gray-500">
            Select the academic period and class for the
            attendance report.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 lg:grid-cols-4">
          {/* ==================================================
              ACADEMIC SESSION
          ================================================== */}

          <ReportSelect
            label="Academic Session"
            required
            value={filters.academic_session}
            onChange={(value) =>
              updateFilter(
                "academic_session",
                value,
              )
            }
            options={sessions}
            placeholder="Select session"
            getLabel={getSessionName}
            disabled={loadingOptions}
          />

          {/* ==================================================
              TERM
          ================================================== */}

          <ReportSelect
            label="Term"
            required
            value={filters.term}
            onChange={(value) =>
              updateFilter(
                "term",
                value,
              )
            }
            options={terms}
            placeholder="Select term"
            getLabel={getTermName}
            disabled={loadingOptions}
          />

          {/* ==================================================
              CLASS
          ================================================== */}

          <ReportSelect
            label="Class"
            required
            value={filters.class_level}
            onChange={(value) =>
              updateFilter(
                "class_level",
                value,
              )
            }
            options={classLevels}
            placeholder="Select class"
            getLabel={getClassName}
            disabled={loadingOptions}
          />

          {/* ==================================================
              STUDENT
          ================================================== */}

          <StudentSelect
            label="Student"
            value={filters.student}
            onChange={(value) =>
              updateFilter(
                "student",
                value,
              )
            }
            students={
              searchableStudents
            }
            placeholder={
              !filters.class_level ||
              !filters.academic_session ||
              !filters.term
                ? "Select session, term and class first"
                : loadingEnrollments
                ? "Loading students..."
                : "All students"
            }
            disabled={
              loadingOptions ||
              loadingEnrollments ||
              !filters.class_level ||
              !filters.academic_session ||
              !filters.term
            }
          />

          {/* ==================================================
              BUTTONS
          ================================================== */}

          <div className="flex items-end gap-2 md:col-span-2 lg:col-span-4">
            <button
              type="button"
              onClick={generateReport}
              disabled={
                loadingReport ||
                loadingOptions ||
                loadingEnrollments
              }
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
            >
              {loadingReport ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BarChart3 className="h-4 w-4" />
              )}

              {loadingReport
                ? "Generating..."
                : "Generate Report"}
            </button>

            <button
              type="button"
              onClick={clearReport}
              disabled={
                loadingReport ||
                reports.length === 0
              }
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear
            </button>
          </div>
        </div>

        {/* ====================================================
            STUDENT COUNT
        ==================================================== */}

        {filters.class_level &&
          filters.academic_session &&
          filters.term && (
            <div className="border-t border-gray-100 px-5 py-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {loadingEnrollments ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />

                    Loading students for selected class...
                  </>
                ) : (
                  <>
                    <Users className="h-3.5 w-3.5 text-indigo-600" />

                    {reportStudents.length} student
                    {reportStudents.length === 1
                      ? ""
                      : "s"} enrolled in the selected
                    class and academic period.
                  </>
                )}
              </div>
            </div>
          )}
      </div>

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      {reports.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <SummaryCard
            icon={
              <Users className="h-5 w-5" />
            }
            label="Students"
            value={
              statistics.totalStudents
            }
            className="bg-indigo-100 text-indigo-600"
          />

          <SummaryCard
            icon={
              <CalendarDays className="h-5 w-5" />
            }
            label="Total Days"
            value={statistics.totalDays}
            className="bg-gray-100 text-gray-600"
          />

          <SummaryCard
            icon={
              <CheckCircle className="h-5 w-5" />
            }
            label="Present"
            value={
              statistics.presentDays
            }
            className="bg-emerald-100 text-emerald-600"
          />

          <SummaryCard
            icon={
              <X className="h-5 w-5" />
            }
            label="Absent"
            value={
              statistics.absentDays
            }
            className="bg-red-100 text-red-600"
          />

          <SummaryCard
            icon={
              <BarChart3 className="h-5 w-5" />
            }
            label="Late"
            value={statistics.lateDays}
            className="bg-amber-100 text-amber-600"
          />

          <SummaryCard
            icon={
              <CheckCircle className="h-5 w-5" />
            }
            label="Average"
            value={formatPercentage(
              statistics.averagePercentage,
            )}
            className="bg-blue-100 text-blue-600"
          />
        </div>
      )}

      {/* ======================================================
          REPORT TABLE
      ====================================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">
              Student Attendance Summary
            </h2>

            <p className="text-xs text-gray-500">
              {filteredReports.length} student
              {filteredReports.length === 1
                ? ""
                : "s"}
            </p>
          </div>

          {reports.length > 0 && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search name or admission number..."
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          )}
        </div>

        {loadingReport ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />

              <span className="text-sm">
                Generating attendance report...
              </span>
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
              <BarChart3 className="h-7 w-7 text-gray-400" />
            </div>

            <h3 className="font-semibold text-gray-900">
              No report generated
            </h3>

            <p className="mt-1 max-w-md text-sm text-gray-500">
              Select an academic session, term and class,
              then click Generate Report.
            </p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="flex min-h-[250px] items-center justify-center px-6 text-center">
            <div>
              <Search className="mx-auto h-8 w-8 text-gray-400" />

              <p className="mt-3 font-medium text-gray-800">
                No students match your search.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200 text-left">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Student
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    School Opened
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Total Days
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Present
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Absent
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Late
                  </th>

                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Excused
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Attendance
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredReports.map(
                  (report) => {
                    if (!report.success) {
                      return (
                        <tr
                          key={
                            report.student_id
                          }
                          className="bg-red-50/40"
                        >
                          <td className="px-4 py-4">
                            <div className="font-medium text-gray-900">
                              {
                                report.student_name
                              }
                            </div>

                            {report.admission_number && (
                              <div className="text-xs text-gray-500">
                                {
                                  report.admission_number
                                }
                              </div>
                            )}
                          </td>

                          <td
                            colSpan={7}
                            className="px-4 py-4 text-sm text-red-600"
                          >
                            Unable to load attendance
                            summary:{" "}
                            {
                              report.error
                            }
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr
                        key={
                          report.student_id
                        }
                        className="transition hover:bg-gray-50"
                      >
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900">
                            {
                              report.student_name
                            }
                          </div>

                          {report.admission_number && (
                            <div className="mt-0.5 text-xs text-gray-500">
                              {
                                report.admission_number
                              }
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-700">
                          {report.times_school_opened ??
                            0}
                        </td>

                        <td className="px-4 py-4 text-center text-sm text-gray-700">
                          {report.total_days ??
                            0}
                        </td>

                        <td className="px-4 py-4 text-center text-sm font-semibold text-emerald-600">
                          {report.present_days ??
                            0}
                        </td>

                        <td className="px-4 py-4 text-center text-sm font-semibold text-red-600">
                          {report.absent_days ??
                            0}
                        </td>

                        <td className="px-4 py-4 text-center text-sm font-semibold text-amber-600">
                          {report.late_days ??
                            0}
                        </td>

                        <td className="px-4 py-4 text-center text-sm font-semibold text-blue-600">
                          {report.excused_days ??
                            0}
                        </td>

                        <td className="px-4 py-4 text-right">
                          <span
                            className={`text-base font-bold ${getPercentageClass(
                              report.attendance_percentage,
                            )}`}
                          >
                            {formatPercentage(
                              report.attendance_percentage,
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// REPORT SELECT
// ============================================================

function ReportSelect({
  label,
  required = false,
  value,
  onChange,
  options,
  placeholder,
  getLabel,
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-gray-50"
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((item) => (
          <option
            key={item.id}
            value={item.id}
          >
            {getLabel(item)}
          </option>
        ))}
      </select>
    </div>
  );
}

// ============================================================
// STUDENT SELECT
// ============================================================

function StudentSelect({
  label,
  value,
  onChange,
  students,
  placeholder,
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-gray-50"
      >
        <option value="">
          {placeholder}
        </option>

        {students.map((student) => (
          <option
            key={student.id}
            value={student.id}
          >
            {getStudentName(student)}
            {getStudentAdmissionNumber(
              student,
            )
              ? ` — ${getStudentAdmissionNumber(
                  student,
                )}`
              : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  icon,
  label,
  value,
  className,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${className}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {label}
          </p>

          <p className="mt-0.5 text-xl font-bold text-gray-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}