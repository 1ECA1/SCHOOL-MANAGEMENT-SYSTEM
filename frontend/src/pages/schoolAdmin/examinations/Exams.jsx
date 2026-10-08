// import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import {
//   AlertCircle,
//   CalendarDays,
//   CheckCircle2,
//   ChevronDown,
//   Clock,
//   Edit,
//   Eye,
//   FileText,
//   GraduationCap,
//   Loader2,
//   Plus,
//   RefreshCw,
//   Search,
//   Trash2,
//   XCircle,
// } from "lucide-react";

// import {
//   deleteExamination,
//   getExaminations,
// } from "../../../services/examinationsService";


// // ============================================================
// // HELPERS
// // ============================================================

// const formatDate = (dateString) => {
//   if (!dateString) {
//     return "—";
//   }

//   const date = new Date(dateString);

//   if (Number.isNaN(date.getTime())) {
//     return dateString;
//   }

//   return date.toLocaleDateString("en-GB", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// };


// const getStatus = (exam) => {
//   if (!exam.is_active) {
//     return {
//       label: "Inactive",
//       icon: XCircle,
//     };
//   }

//   if (exam.is_published) {
//     return {
//       label: "Published",
//       icon: CheckCircle2,
//     };
//   }

//   return {
//     label: "Draft",
//     icon: Clock,
//   };
// };


// // ============================================================
// // COMPONENT
// // ============================================================

// export default function Exams() {
//   const navigate = useNavigate();

//   // ----------------------------------------------------------
//   // STATE
//   // ----------------------------------------------------------

//   const [examinations, setExaminations] = useState([]);

//   const [loading, setLoading] = useState(true);

//   const [refreshing, setRefreshing] = useState(false);

//   const [error, setError] = useState("");

//   const [search, setSearch] = useState("");

//   const [sessionFilter, setSessionFilter] =
//     useState("");

//   const [termFilter, setTermFilter] =
//     useState("");

//   const [classFilter, setClassFilter] =
//     useState("");

//   const [statusFilter, setStatusFilter] =
//     useState("");

//   const [typeFilter, setTypeFilter] =
//     useState("");

//   const [deleteTarget, setDeleteTarget] =
//     useState(null);

//   const [deleting, setDeleting] =
//     useState(false);


//   // ----------------------------------------------------------
//   // LOAD EXAMINATIONS
//   // ----------------------------------------------------------

//   const loadExaminations = async (
//     showRefresh = false
//   ) => {
//     try {
//       if (showRefresh) {
//         setRefreshing(true);
//       } else {
//         setLoading(true);
//       }

//       setError("");

//       const data = await getExaminations();

//       setExaminations(
//         Array.isArray(data)
//           ? data
//           : []
//       );
//     } catch (err) {
//       console.error(
//         "Failed to load examinations:",
//         err
//       );

//       setError(
//         err?.response?.data?.detail ||
//         err?.response?.data?.message ||
//         "Unable to load examinations."
//       );
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };


//   useEffect(() => {
//     loadExaminations();
//   }, []);


//   // ----------------------------------------------------------
//   // FILTER OPTIONS
//   // ----------------------------------------------------------

//   const sessions = useMemo(() => {
//     const map = new Map();

//     examinations.forEach((exam) => {
//       if (
//         exam.academic_session &&
//         exam.academic_session_name
//       ) {
//         map.set(
//           String(exam.academic_session),
//           exam.academic_session_name
//         );
//       }
//     });

//     return Array.from(
//       map.entries()
//     ).map(([id, name]) => ({
//       id,
//       name,
//     }));
//   }, [examinations]);


//   const terms = useMemo(() => {
//     const map = new Map();

//     examinations.forEach((exam) => {
//       if (
//         exam.term &&
//         exam.term_name
//       ) {
//         map.set(
//           String(exam.term),
//           exam.term_name
//         );
//       }
//     });

//     return Array.from(
//       map.entries()
//     ).map(([id, name]) => ({
//       id,
//       name,
//     }));
//   }, [examinations]);


//   const classes = useMemo(() => {
//     const map = new Map();

//     examinations.forEach((exam) => {
//       if (
//         exam.class_level &&
//         exam.class_level_name
//       ) {
//         map.set(
//           String(exam.class_level),
//           exam.class_level_name
//         );
//       }
//     });

//     return Array.from(
//       map.entries()
//     ).map(([id, name]) => ({
//       id,
//       name,
//     }));
//   }, [examinations]);


//   const examinationTypes = useMemo(() => {
//     const map = new Map();

//     examinations.forEach((exam) => {
//       if (
//         exam.examination_type &&
//         exam.examination_type_display
//       ) {
//         map.set(
//           exam.examination_type,
//           exam.examination_type_display
//         );
//       }
//     });

//     return Array.from(
//       map.entries()
//     ).map(([value, label]) => ({
//       value,
//       label,
//     }));
//   }, [examinations]);


//   // ----------------------------------------------------------
//   // FILTERED EXAMS
//   // ----------------------------------------------------------

//   const filteredExaminations = useMemo(() => {
//     const query =
//       search.trim().toLowerCase();

//     return examinations.filter(
//       (exam) => {

//         const matchesSearch =
//           !query ||
//           exam.name
//             ?.toLowerCase()
//             .includes(query) ||
//           exam.class_level_name
//             ?.toLowerCase()
//             .includes(query) ||
//           exam.examination_type_display
//             ?.toLowerCase()
//             .includes(query);

//         const matchesSession =
//           !sessionFilter ||
//           String(
//             exam.academic_session
//           ) === sessionFilter;

//         const matchesTerm =
//           !termFilter ||
//           String(exam.term) === termFilter;

//         const matchesClass =
//           !classFilter ||
//           String(
//             exam.class_level
//           ) === classFilter;

//         const matchesType =
//           !typeFilter ||
//           exam.examination_type === typeFilter;

//         const matchesStatus =
//           !statusFilter ||
//           (
//             statusFilter === "PUBLISHED"
//             && exam.is_published
//           ) ||
//           (
//             statusFilter === "DRAFT"
//             && !exam.is_published
//           ) ||
//           (
//             statusFilter === "INACTIVE"
//             && !exam.is_active
//           );

//         return (
//           matchesSearch &&
//           matchesSession &&
//           matchesTerm &&
//           matchesClass &&
//           matchesType &&
//           matchesStatus
//         );
//       }
//     );
//   }, [
//     examinations,
//     search,
//     sessionFilter,
//     termFilter,
//     classFilter,
//     typeFilter,
//     statusFilter,
//   ]);


//   // ----------------------------------------------------------
//   // DELETE
//   // ----------------------------------------------------------

//   const handleDelete = async () => {
//     if (!deleteTarget) {
//       return;
//     }

//     try {
//       setDeleting(true);

//       await deleteExamination(
//         deleteTarget.id
//       );

//       setExaminations((current) =>
//         current.filter(
//           (exam) =>
//             exam.id !== deleteTarget.id
//         )
//       );

//       setDeleteTarget(null);
//     } catch (err) {
//       console.error(
//         "Failed to delete examination:",
//         err
//       );

//       setError(
//         err?.response?.data?.detail ||
//         err?.response?.data?.message ||
//         "Unable to delete examination."
//       );
//     } finally {
//       setDeleting(false);
//     }
//   };


//   // ----------------------------------------------------------
//   // CLEAR FILTERS
//   // ----------------------------------------------------------

//   const clearFilters = () => {
//     setSearch("");
//     setSessionFilter("");
//     setTermFilter("");
//     setClassFilter("");
//     setStatusFilter("");
//     setTypeFilter("");
//   };


//   // ----------------------------------------------------------
//   // STATISTICS
//   // ----------------------------------------------------------

//   const statistics = useMemo(() => {
//     const total = examinations.length;

//     const published =
//       examinations.filter(
//         (exam) => exam.is_published
//       ).length;

//     const active =
//       examinations.filter(
//         (exam) => exam.is_active
//       ).length;

//     const draft =
//       examinations.filter(
//         (exam) => !exam.is_published
//       ).length;

//     return {
//       total,
//       published,
//       active,
//       draft,
//     };
//   }, [examinations]);


//   // ==========================================================
//   // LOADING
//   // ==========================================================

//   if (loading) {
//     return (
//       <div className="min-h-[60vh] flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <Loader2
//             className="animate-spin text-[var(--color-primary)]"
//             size={32}
//           />

//           <p className="text-sm text-[var(--color-secondary)]">
//             Loading examinations...
//           </p>
//         </div>
//       </div>
//     );
//   }


//   // ==========================================================
//   // RENDER
//   // ==========================================================

//   return (
//     <div className="space-y-6">

//       {/* =====================================================
//           HEADER
//       ===================================================== */}

//       <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

//         <div>
//           <div className="flex items-center gap-3">

//             <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
//               <GraduationCap
//                 size={23}
//                 className="text-[var(--color-primary)]"
//               />
//             </div>

//             <div>
//               <h1 className="text-2xl font-bold text-[var(--color-text)]">
//                 Examinations
//               </h1>

//               <p className="mt-1 text-sm text-[var(--color-secondary)]">
//                 Manage examination schedules,
//                 subjects and publication status.
//               </p>
//             </div>

//           </div>
//         </div>


//         <div className="flex items-center gap-2">

//           <button
//             type="button"
//             onClick={() =>
//               loadExaminations(true)
//             }
//             disabled={refreshing}
//             className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-card)] bg-[var(--color-background)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] shadow-sm transition hover:bg-[var(--color-card)] disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             <RefreshCw
//               size={17}
//               className={
//                 refreshing
//                   ? "animate-spin"
//                   : ""
//               }
//             />

//             Refresh
//           </button>


//           <button
//             type="button"
//             onClick={() =>
//               navigate(
//                 "/school-admin/examinations-results/exams/add"
//               )
//             }
//             className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
//           >
//             <Plus size={18} />

//             Create Examination
//           </button>

//         </div>

//       </div>


//       {/* =====================================================
//           ERROR
//       ===================================================== */}

//       {error && (
//         <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">

//           <AlertCircle
//             size={20}
//             className="mt-0.5 shrink-0"
//           />

//           <div className="flex-1">
//             <p className="font-medium">
//               Unable to load examinations
//             </p>

//             <p className="mt-1 text-sm">
//               {error}
//             </p>
//           </div>

//           <button
//             type="button"
//             onClick={() =>
//               setError("")
//             }
//             className="rounded-md p-1 hover:bg-red-100"
//           >
//             <XCircle size={18} />
//           </button>

//         </div>
//       )}


//       {/* =====================================================
//           STATISTICS
//       ===================================================== */}

//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

//         <StatCard
//           icon={FileText}
//           label="Total Exams"
//           value={statistics.total}
//         />

//         <StatCard
//           icon={CheckCircle2}
//           label="Published"
//           value={statistics.published}
//         />

//         <StatCard
//           icon={CalendarDays}
//           label="Active"
//           value={statistics.active}
//         />

//         <StatCard
//           icon={Clock}
//           label="Draft"
//           value={statistics.draft}
//         />

//       </div>


//       {/* =====================================================
//           FILTERS
//       ===================================================== */}

//       <div className="rounded-xl border border-[var(--color-card)] bg-[var(--color-background)] p-4 shadow-sm">

//         <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">

//           {/* SEARCH */}

//           <div className="relative xl:col-span-2">

//             <Search
//               size={18}
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)]"
//             />

//             <input
//               type="text"
//               value={search}
//               onChange={(event) =>
//                 setSearch(
//                   event.target.value
//                 )
//               }
//               placeholder="Search examinations..."
//               className="w-full rounded-lg border border-[var(--color-card)] bg-[var(--color-background)] py-2.5 pl-10 pr-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
//             />

//           </div>


//           <FilterSelect
//             value={sessionFilter}
//             onChange={setSessionFilter}
//             placeholder="All Sessions"
//             options={sessions.map(
//               (item) => ({
//                 value: item.id,
//                 label: item.name,
//               })
//             )}
//           />


//           <FilterSelect
//             value={termFilter}
//             onChange={setTermFilter}
//             placeholder="All Terms"
//             options={terms.map(
//               (item) => ({
//                 value: item.id,
//                 label: item.name,
//               })
//             )}
//           />


//           <FilterSelect
//             value={classFilter}
//             onChange={setClassFilter}
//             placeholder="All Classes"
//             options={classes.map(
//               (item) => ({
//                 value: item.id,
//                 label: item.name,
//               })
//             )}
//           />


//           <FilterSelect
//             value={typeFilter}
//             onChange={setTypeFilter}
//             placeholder="All Types"
//             options={examinationTypes}
//           />

//         </div>


//         <div className="mt-3 flex flex-wrap items-center justify-between gap-3">

//           <div className="flex items-center gap-2">

//             <span className="text-sm text-[var(--color-secondary)]">
//               Status:
//             </span>

//             {[
//               ["", "All"],
//               ["PUBLISHED", "Published"],
//               ["DRAFT", "Draft"],
//               ["INACTIVE", "Inactive"],
//             ].map(
//               ([value, label]) => (
//                 <button
//                   key={value || "all"}
//                   type="button"
//                   onClick={() =>
//                     setStatusFilter(value)
//                   }
//                   className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
//                     statusFilter === value
//                       ? "bg-[var(--color-primary)] text-white"
//                       : "bg-[var(--color-card)] text-[var(--color-secondary)] hover:text-[var(--color-text)]"
//                   }`}
//                 >
//                   {label}
//                 </button>
//               )
//             )}

//           </div>


//           {(search ||
//             sessionFilter ||
//             termFilter ||
//             classFilter ||
//             statusFilter ||
//             typeFilter) && (

//             <button
//               type="button"
//               onClick={clearFilters}
//               className="text-sm font-medium text-[var(--color-primary)] hover:underline"
//             >
//               Clear filters
//             </button>

//           )}

//         </div>

//       </div>


//       {/* =====================================================
//           RESULTS COUNT
//       ===================================================== */}

//       <div className="flex items-center justify-between">

//         <p className="text-sm text-[var(--color-secondary)]">

//           Showing{" "}
//           <span className="font-semibold text-[var(--color-text)]">
//             {filteredExaminations.length}
//           </span>{" "}
//           of{" "}
//           <span className="font-semibold text-[var(--color-text)]">
//             {examinations.length}
//           </span>{" "}
//           examinations

//         </p>

//       </div>


//       {/* =====================================================
//           EMPTY STATE
//       ===================================================== */}

//       {filteredExaminations.length === 0 ? (

//         <div className="rounded-xl border border-dashed border-[var(--color-card)] bg-[var(--color-background)] px-6 py-16 text-center">

//           <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-card)]">
//             <FileText
//               size={25}
//               className="text-[var(--color-secondary)]"
//             />
//           </div>

//           <h3 className="mt-4 text-lg font-semibold text-[var(--color-text)]">
//             No examinations found
//           </h3>

//           <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-secondary)]">
//             {examinations.length === 0
//               ? "No examinations have been created for your school yet."
//               : "Try changing your search or filters."}
//           </p>

//           {examinations.length === 0 ? (
//             <button
//               type="button"
//               onClick={() =>
//                 navigate(
//                   "/school-admin/examinations/add"
//                 )
//               }
//               className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white"
//             >
//               <Plus size={17} />

//               Create Examination
//             </button>
//           ) : (
//             <button
//               type="button"
//               onClick={clearFilters}
//               className="mt-5 text-sm font-semibold text-[var(--color-primary)] hover:underline"
//             >
//               Clear filters
//             </button>
//           )}

//         </div>

//       ) : (

//         /* ===================================================
//            EXAMINATION TABLE
//         =================================================== */

//         <div className="overflow-hidden rounded-xl border border-[var(--color-card)] bg-[var(--color-background)] shadow-sm">

//           <div className="overflow-x-auto">

//             <table className="min-w-[1100px] w-full">

//               <thead>
//                 <tr className="border-b border-[var(--color-card)] bg-[var(--color-card)]/40">

//                   <TableHeader>
//                     Examination
//                   </TableHeader>

//                   <TableHeader>
//                     Session
//                   </TableHeader>

//                   <TableHeader>
//                     Term
//                   </TableHeader>

//                   <TableHeader>
//                     Class
//                   </TableHeader>

//                   <TableHeader>
//                     Type
//                   </TableHeader>

//                   <TableHeader>
//                     Period
//                   </TableHeader>

//                   <TableHeader>
//                     Status
//                   </TableHeader>

//                   <TableHeader align="right">
//                     Actions
//                   </TableHeader>

//                 </tr>
//               </thead>


//               <tbody>

//                 {filteredExaminations.map(
//                   (exam) => {

//                     const status =
//                       getStatus(exam);

//                     const StatusIcon =
//                       status.icon;

//                     return (
//                       <tr
//                         key={exam.id}
//                         className="border-b border-[var(--color-card)] last:border-b-0 hover:bg-[var(--color-card)]/20"
//                       >

//                         {/* EXAMINATION */}

//                         <td className="px-4 py-4">

//                           <div className="min-w-[220px]">

//                             <p className="font-semibold text-[var(--color-text)]">
//                               {exam.name}
//                             </p>

//                             {exam.description && (
//                               <p className="mt-1 max-w-xs truncate text-xs text-[var(--color-secondary)]">
//                                 {exam.description}
//                               </p>
//                             )}

//                           </div>

//                         </td>


//                         {/* SESSION */}

//                         <td className="px-4 py-4 text-sm text-[var(--color-text)]">
//                           {exam.academic_session_name}
//                         </td>


//                         {/* TERM */}

//                         <td className="px-4 py-4">

//                           <span className="rounded-md bg-[var(--color-card)] px-2.5 py-1 text-xs font-medium text-[var(--color-text)]">
//                             {exam.term_name}
//                           </span>

//                         </td>


//                         {/* CLASS */}

//                         <td className="px-4 py-4">

//                           <div className="flex items-center gap-2">

//                             <GraduationCap
//                               size={16}
//                               className="text-[var(--color-secondary)]"
//                             />

//                             <span className="text-sm font-medium text-[var(--color-text)]">
//                               {exam.class_level_name}
//                             </span>

//                           </div>

//                         </td>


//                         {/* TYPE */}

//                         <td className="px-4 py-4">

//                           <span className="text-sm text-[var(--color-text)]">
//                             {exam.examination_type_display}
//                           </span>

//                         </td>


//                         {/* PERIOD */}

//                         <td className="px-4 py-4">

//                           <div className="flex items-center gap-2">

//                             <CalendarDays
//                               size={16}
//                               className="text-[var(--color-secondary)]"
//                             />

//                             <div className="text-xs">

//                               <p className="font-medium text-[var(--color-text)]">
//                                 {formatDate(
//                                   exam.start_date
//                                 )}
//                               </p>

//                               <p className="mt-0.5 text-[var(--color-secondary)]">
//                                 to{" "}
//                                 {formatDate(
//                                   exam.end_date
//                                 )}
//                               </p>

//                             </div>

//                           </div>

//                         </td>


//                         {/* STATUS */}

//                         <td className="px-4 py-4">

//                           <span
//                             className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
//                               status.label ===
//                               "Published"
//                                 ? "bg-green-100 text-green-700"
//                                 : status.label ===
//                                   "Inactive"
//                                 ? "bg-red-100 text-red-700"
//                                 : "bg-yellow-100 text-yellow-700"
//                             }`}
//                           >

//                             <StatusIcon size={13} />

//                             {status.label}

//                           </span>

//                         </td>


//                         {/* ACTIONS */}

//                         <td className="px-4 py-4">

//                           <div className="flex items-center justify-end gap-1">

//                             <ActionButton
//                               title="View examination"
//                               onClick={() =>
//                                 navigate(
//                                   `/school-admin/examinations/${exam.id}`
//                                 )
//                               }
//                             >
//                               <Eye size={17} />
//                             </ActionButton>


//                             <ActionButton
//                               title="Edit examination"
//                               onClick={() =>
//                                 navigate(
//                                   `/school-admin/examinations/${exam.id}/edit`
//                                 )
//                               }
//                             >
//                               <Edit size={17} />
//                             </ActionButton>


//                             <ActionButton
//                               title="Delete examination"
//                               danger
//                               onClick={() =>
//                                 setDeleteTarget(
//                                   exam
//                                 )
//                               }
//                             >
//                               <Trash2 size={17} />
//                             </ActionButton>

//                           </div>

//                         </td>

//                       </tr>
//                     );
//                   }
//                 )}

//               </tbody>

//             </table>

//           </div>

//         </div>

//       )}


//       {/* =====================================================
//           DELETE MODAL
//       ===================================================== */}

//       {deleteTarget && (

//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

//           <div className="w-full max-w-md rounded-2xl bg-[var(--color-background)] p-6 shadow-2xl">

//             <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
//               <Trash2
//                 size={22}
//                 className="text-red-600"
//               />
//             </div>

//             <h2 className="mt-4 text-lg font-bold text-[var(--color-text)]">
//               Delete examination?
//             </h2>

//             <p className="mt-2 text-sm leading-6 text-[var(--color-secondary)]">
//               You are about to delete{" "}
//               <span className="font-semibold text-[var(--color-text)]">
//                 {deleteTarget.name}
//               </span>
//               . This action cannot be undone.
//             </p>

//             <div className="mt-6 flex justify-end gap-3">

//               <button
//                 type="button"
//                 onClick={() =>
//                   setDeleteTarget(null)
//                 }
//                 disabled={deleting}
//                 className="rounded-lg border border-[var(--color-card)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-card)] disabled:opacity-60"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 onClick={handleDelete}
//                 disabled={deleting}
//                 className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
//               >

//                 {deleting && (
//                   <Loader2
//                     size={17}
//                     className="animate-spin"
//                   />
//                 )}

//                 Delete

//               </button>

//             </div>

//           </div>

//         </div>

//       )}

//     </div>
//   );
// }


// // ============================================================
// // STAT CARD
// // ============================================================

// function StatCard({
//   icon: Icon,
//   label,
//   value,
// }) {
//   return (
//     <div className="rounded-xl border border-[var(--color-card)] bg-[var(--color-background)] p-4 shadow-sm">

//       <div className="flex items-center justify-between">

//         <div>
//           <p className="text-sm text-[var(--color-secondary)]">
//             {label}
//           </p>

//           <p className="mt-1 text-2xl font-bold text-[var(--color-text)]">
//             {value}
//           </p>
//         </div>

//         <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
//           <Icon
//             size={20}
//             className="text-[var(--color-primary)]"
//           />
//         </div>

//       </div>

//     </div>
//   );
// }


// // ============================================================
// // FILTER SELECT
// // ============================================================

// function FilterSelect({
//   value,
//   onChange,
//   placeholder,
//   options,
// }) {
//   return (
//     <div className="relative">

//       <select
//         value={value}
//         onChange={(event) =>
//           onChange(event.target.value)
//         }
//         className="w-full appearance-none rounded-lg border border-[var(--color-card)] bg-[var(--color-background)] px-3 py-2.5 pr-9 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
//       >

//         <option value="">
//           {placeholder}
//         </option>

//         {options.map((option) => (
//           <option
//             key={option.value}
//             value={option.value}
//           >
//             {option.label}
//           </option>
//         ))}

//       </select>

//       <ChevronDown
//         size={16}
//         className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)]"
//       />

//     </div>
//   );
// }


// // ============================================================
// // TABLE HEADER
// // ============================================================

// function TableHeader({
//   children,
//   align = "left",
// }) {
//   return (
//     <th
//       className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)] ${
//         align === "right"
//           ? "text-right"
//           : "text-left"
//       }`}
//     >
//       {children}
//     </th>
//   );
// }


// // ============================================================
// // ACTION BUTTON
// // ============================================================

// function ActionButton({
//   children,
//   title,
//   onClick,
//   danger = false,
// }) {
//   return (
//     <button
//       type="button"
//       title={title}
//       onClick={onClick}
//       className={`rounded-lg p-2 transition ${
//         danger
//           ? "text-red-500 hover:bg-red-50 hover:text-red-700"
//           : "text-[var(--color-secondary)] hover:bg-[var(--color-card)] hover:text-[var(--color-text)]"
//       }`}
//     >
//       {children}
//     </button>
//   );
// }



import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Edit,
  Eye,
  FileText,
  Filter,
  GraduationCap,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";

import {
  deleteExamination,
  getExaminations,
} from "../../../services/examinationsService";

// ============================================================
// HELPERS
// ============================================================

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatus = (exam) => {
  if (!exam?.is_active) {
    return {
      label: "Inactive",
      className:
        "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      icon: XCircle,
    };
  }

  if (exam?.is_published) {
    return {
      label: "Published",
      className:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      icon: CheckCircle2,
    };
  }

  return {
    label: "Draft",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    icon: FileText,
  };
};

const getExaminationTypeLabel = (exam) => {
  return (
    exam?.examination_type_display ||
    exam?.examination_type ||
    "—"
  );
};

// ============================================================
// STAT CARD
// ============================================================

function StatCard({ title, value, icon: Icon, description }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-card p-5 shadow-sm dark:border-gray-800">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold text-text">
            {value}
          </h3>

          {description && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>

        <div className="rounded-lg bg-primary/10 p-3">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FILTER SELECT
// ============================================================

function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-gray-300 bg-card px-3 py-2.5 pr-10 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700"
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option
            key={String(option.value)}
            value={String(option.value)}
          >
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Exams() {
  const navigate = useNavigate();

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [examinations, setExaminations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [termFilter, setTermFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  // ----------------------------------------------------------
  // LOAD EXAMINATIONS
  // ----------------------------------------------------------

  const loadExaminations = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getExaminations();

      const results = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];

      setExaminations(results);
    } catch (err) {
      console.error("Failed to load examinations:", err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to load examinations.";

      setError(message);
      setExaminations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadExaminations();
  }, []);

  // ----------------------------------------------------------
  // FILTER OPTIONS
  // ----------------------------------------------------------

  const sessionOptions = useMemo(() => {
    const map = new Map();

    examinations.forEach((exam) => {
      if (exam?.academic_session) {
        map.set(
          String(exam.academic_session),
          exam.academic_session_name ||
            `Session ${exam.academic_session}`
        );
      }
    });

    return Array.from(map.entries())
      .map(([value, label]) => ({
        value,
        label,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [examinations]);

  const termOptions = useMemo(() => {
    const map = new Map();

    examinations.forEach((exam) => {
      if (exam?.term) {
        map.set(
          String(exam.term),
          exam.term_name || `Term ${exam.term}`
        );
      }
    });

    return Array.from(map.entries())
      .map(([value, label]) => ({
        value,
        label,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [examinations]);

  const classOptions = useMemo(() => {
    const map = new Map();

    examinations.forEach((exam) => {
      if (exam?.class_level) {
        map.set(
          String(exam.class_level),
          exam.class_level_name ||
            `Class ${exam.class_level}`
        );
      }
    });

    return Array.from(map.entries())
      .map(([value, label]) => ({
        value,
        label,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [examinations]);

  const typeOptions = useMemo(() => {
    const map = new Map();

    examinations.forEach((exam) => {
      if (exam?.examination_type) {
        map.set(
          exam.examination_type,
          exam.examination_type_display ||
            exam.examination_type
        );
      }
    });

    return Array.from(map.entries())
      .map(([value, label]) => ({
        value,
        label,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [examinations]);

  // ----------------------------------------------------------
  // FILTERED EXAMS
  // ----------------------------------------------------------

  const filteredExaminations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return examinations.filter((exam) => {
      const matchesSearch =
        !query ||
        String(exam?.name || "")
          .toLowerCase()
          .includes(query) ||
        String(exam?.class_level_name || "")
          .toLowerCase()
          .includes(query) ||
        String(exam?.academic_session_name || "")
          .toLowerCase()
          .includes(query) ||
        String(exam?.term_name || "")
          .toLowerCase()
          .includes(query) ||
        String(exam?.examination_type_display || "")
          .toLowerCase()
          .includes(query);

      const matchesSession =
        !sessionFilter ||
        String(exam?.academic_session) ===
          String(sessionFilter);

      const matchesTerm =
        !termFilter ||
        String(exam?.term) === String(termFilter);

      const matchesClass =
        !classFilter ||
        String(exam?.class_level) ===
          String(classFilter);

      const matchesType =
        !typeFilter ||
        String(exam?.examination_type) ===
          String(typeFilter);

      let matchesStatus = true;

      if (statusFilter === "published") {
        matchesStatus =
          Boolean(exam?.is_published) &&
          Boolean(exam?.is_active);
      }

      if (statusFilter === "draft") {
        matchesStatus =
          !exam?.is_published &&
          Boolean(exam?.is_active);
      }

      if (statusFilter === "inactive") {
        matchesStatus = !exam?.is_active;
      }

      return (
        matchesSearch &&
        matchesSession &&
        matchesTerm &&
        matchesClass &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    examinations,
    search,
    sessionFilter,
    termFilter,
    classFilter,
    typeFilter,
    statusFilter,
  ]);

  // ----------------------------------------------------------
  // STATISTICS
  // ----------------------------------------------------------

  const statistics = useMemo(() => {
    const total = examinations.length;

    const published = examinations.filter(
      (exam) =>
        exam?.is_published && exam?.is_active
    ).length;

    const active = examinations.filter(
      (exam) => exam?.is_active
    ).length;

    const drafts = examinations.filter(
      (exam) =>
        !exam?.is_published && exam?.is_active
    ).length;

    return {
      total,
      published,
      active,
      drafts,
    };
  }, [examinations]);

  // ----------------------------------------------------------
  // CLEAR FILTERS
  // ----------------------------------------------------------

  const clearFilters = () => {
    setSearch("");
    setSessionFilter("");
    setTermFilter("");
    setClassFilter("");
    setTypeFilter("");
    setStatusFilter("");
  };

  const hasFilters =
    search ||
    sessionFilter ||
    termFilter ||
    classFilter ||
    typeFilter ||
    statusFilter;

  // ----------------------------------------------------------
  // DELETE
  // ----------------------------------------------------------

  const handleDelete = async (exam) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${exam?.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(exam.id);
      setError("");

      await deleteExamination(exam.id);

      setExaminations((previous) =>
        previous.filter(
          (item) =>
            Number(item.id) !== Number(exam.id)
        )
      );
    } catch (err) {
      console.error(
        "Failed to delete examination:",
        err
      );

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to delete examination.";

      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  // ----------------------------------------------------------
  // NAVIGATION
  // ----------------------------------------------------------

  const handleView = (exam) => {
    navigate(
      `/school-admin/examinations-results/exams/${exam.id}`
    );
  };

  const handleEdit = (exam) => {
    navigate(
      `/school-admin/examinations-results/exams/${exam.id}/edit`
    );
  };

  const handleCreate = () => {
    navigate(
      "/school-admin/examinations-results/exams/add"
    );
  };

  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading examinations...
          </p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-3">
              <GraduationCap className="h-7 w-7 text-primary" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-text">
                Examinations
              </h1>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Create, manage and schedule school examinations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => loadExaminations(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-card px-4 py-2.5 text-sm font-medium text-text transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />

            Create Examination
          </button>
        </div>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div className="flex-1">
            <p className="font-medium">
              Something went wrong
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="rounded p-1 hover:bg-red-100 dark:hover:bg-red-900/30"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Examinations"
          value={statistics.total}
          icon={FileText}
          description="All examinations"
        />

        <StatCard
          title="Published"
          value={statistics.published}
          icon={CheckCircle2}
          description="Visible to permitted users"
        />

        <StatCard
          title="Active"
          value={statistics.active}
          icon={CalendarDays}
          description="Currently active"
        />

        <StatCard
          title="Drafts"
          value={statistics.drafts}
          icon={Clock3}
          description="Not yet published"
        />
      </div>

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="rounded-xl border border-gray-200 bg-card p-4 shadow-sm dark:border-gray-800">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />

            <h2 className="font-semibold text-text">
              Filters
            </h2>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <XCircle className="h-4 w-4" />

              Clear filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
          {/* Search */}

          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search examinations..."
              className="w-full rounded-lg border border-gray-300 bg-card py-2.5 pl-10 pr-3 text-sm text-text outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-gray-700"
            />
          </div>

          <FilterSelect
            value={sessionFilter}
            onChange={setSessionFilter}
            options={sessionOptions}
            placeholder="All Sessions"
          />

          <FilterSelect
            value={termFilter}
            onChange={setTermFilter}
            options={termOptions}
            placeholder="All Terms"
          />

          <FilterSelect
            value={classFilter}
            onChange={setClassFilter}
            options={classOptions}
            placeholder="All Classes"
          />

          <FilterSelect
            value={typeFilter}
            onChange={setTypeFilter}
            options={typeOptions}
            placeholder="All Types"
          />
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
          <div className="xl:col-span-4" />

          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              {
                value: "published",
                label: "Published",
              },
              {
                value: "draft",
                label: "Draft",
              },
              {
                value: "inactive",
                label: "Inactive",
              },
            ]}
            placeholder="All Statuses"
          />

          <div className="flex items-center justify-end text-sm text-gray-500 dark:text-gray-400">
            Showing{" "}
            <span className="mx-1 font-semibold text-text">
              {filteredExaminations.length}
            </span>{" "}
            of{" "}
            <span className="mx-1 font-semibold text-text">
              {examinations.length}
            </span>{" "}
            examinations
          </div>
        </div>
      </div>

      {/* ======================================================
          EMPTY STATE
      ====================================================== */}

      {filteredExaminations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-card px-6 py-16 text-center dark:border-gray-700">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-7 w-7 text-primary" />
          </div>

          <h3 className="mt-4 text-lg font-semibold text-text">
            {examinations.length === 0
              ? "No examinations yet"
              : "No examinations found"}
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
            {examinations.length === 0
              ? "Create your first examination to begin adding subjects and scheduling papers."
              : "Try changing your search or filters to find an examination."}
          </p>

          {examinations.length === 0 ? (
            <button
              type="button"
              onClick={handleCreate}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              <Plus className="h-4 w-4" />

              Create Examination
            </button>
          ) : (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-card px-4 py-2.5 text-sm font-medium text-text hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <XCircle className="h-4 w-4" />

              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ====================================================
              MOBILE EXAMINATION LIST
              Only Examination Name + View Action
          ==================================================== */}

          <div className="space-y-2 md:hidden">
            {filteredExaminations.map((exam) => (
              <div
                key={exam.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-card px-4 py-4 shadow-sm dark:border-gray-800"
              >
                {/* Examination Name */}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text">
                    {exam.name || "Unnamed Examination"}
                  </p>
                </div>

                {/* View Action */}

                <button
                  type="button"
                  onClick={() => handleView(exam)}
                  title="View examination"
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
                >
                  <Eye className="h-4 w-4" />

                  <span>View</span>
                </button>
              </div>
            ))}
          </div>

          {/* ====================================================
              DESKTOP / TABLET TABLE
          ==================================================== */}

          <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-card shadow-sm dark:border-gray-800 md:block">
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Examination
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Session
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Term
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Class
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Type
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Period
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredExaminations.map((exam) => {
                    const status = getStatus(exam);
                    const StatusIcon = status.icon;

                    return (
                      <tr
                        key={exam.id}
                        className="transition hover:bg-gray-50 dark:hover:bg-gray-900/40"
                      >
                        {/* Examination */}

                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold text-text">
                              {exam.name ||
                                "Unnamed Examination"}
                            </p>

                            {exam.description && (
                              <p className="mt-1 max-w-xs truncate text-xs text-gray-500 dark:text-gray-400">
                                {exam.description}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Session */}

                        <td className="px-5 py-4">
                          <span className="text-sm text-text">
                            {exam.academic_session_name ||
                              exam.academic_session ||
                              "—"}
                          </span>
                        </td>

                        {/* Term */}

                        <td className="px-5 py-4">
                          <span className="text-sm text-text">
                            {exam.term_name ||
                              exam.term ||
                              "—"}
                          </span>
                        </td>

                        {/* Class */}

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                            {exam.class_level_name ||
                              `Class ${exam.class_level}`}
                          </span>
                        </td>

                        {/* Type */}

                        <td className="px-5 py-4">
                          <span className="text-sm text-text">
                            {getExaminationTypeLabel(exam)}
                          </span>
                        </td>

                        {/* Period */}

                        <td className="px-5 py-4">
                          <div className="flex items-start gap-2">
                            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                            <div className="text-sm">
                              <p className="text-text">
                                {formatDate(
                                  exam.start_date
                                )}
                              </p>

                              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                to{" "}
                                {formatDate(
                                  exam.end_date
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Status */}

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />

                            {status.label}
                          </span>
                        </td>

                        {/* Actions */}

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            {/* View */}

                            <button
                              type="button"
                              onClick={() =>
                                handleView(exam)
                              }
                              title="View examination"
                              className="rounded-lg p-2 text-gray-500 transition hover:bg-primary/10 hover:text-primary dark:text-gray-400"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {/* Edit */}

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(exam)
                              }
                              title="Edit examination"
                              className="rounded-lg p-2 text-gray-500 transition hover:bg-primary/10 hover:text-primary dark:text-gray-400"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            {/* Delete */}

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(exam)
                              }
                              disabled={
                                deletingId === exam.id
                              }
                              title="Delete examination"
                              className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-red-950/30"
                            >
                              {deletingId === exam.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

