// import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import {
//   AlertCircle,
//   ArrowLeft,
//   CheckCircle,
//   FileText,
//   GraduationCap,
//   Loader2,
//   Save,
// } from "lucide-react";

// import api from "../../../services/api";
// import assignmentsService from "../../../services/assignmentsService";
// import { useAuth } from "../../../context/AuthContext";

// // ============================================================
// // ENDPOINTS
// // ============================================================

// const ENDPOINTS = {
//   sessions: "/academics/sessions/",
//   terms: "/academics/terms/",
//   classes: "/academics/class-levels/",
//   subjects: "/academics/subjects/",
//   classSubjects: "/academics/class-subjects/",
// };

// // ============================================================
// // HELPERS
// // ============================================================

// const getResults = (data) => {
//   if (Array.isArray(data)) {
//     return data;
//   }

//   if (Array.isArray(data?.results)) {
//     return data.results;
//   }

//   return [];
// };

// const getId = (item) =>
//   item?.id ??
//   item?.pk ??
//   item?.value ??
//   null;

// const getName = (item) =>
//   item?.name ??
//   item?.title ??
//   item?.label ??
//   item?.class_name ??
//   item?.subject_name ??
//   "";

// const getClassId = (item) =>
//   item?.class_level ??
//   item?.class_level_id ??
//   item?.class ??
//   item?.class_id ??
//   null;

// const getSubjectId = (item) =>
//   item?.subject ??
//   item?.subject_id ??
//   null;

// const getAssignmentType = (item) =>
//   item?.assignment_type ??
//   item?.assignment_type_display ??
//   "";

// const toDateInput = (value) => {
//   if (!value) {
//     return "";
//   }

//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) {
//     return String(value).slice(0, 10);
//   }

//   const year = date.getFullYear();
//   const month = String(
//     date.getMonth() + 1,
//   ).padStart(2, "0");
//   const day = String(
//     date.getDate(),
//   ).padStart(2, "0");

//   return `${year}-${month}-${day}`;
// };

// const toDateTimeLocal = (value) => {
//   if (!value) {
//     return "";
//   }

//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) {
//     return String(value)
//       .replace("Z", "")
//       .slice(0, 16);
//   }

//   const year = date.getFullYear();
//   const month = String(
//     date.getMonth() + 1,
//   ).padStart(2, "0");
//   const day = String(
//     date.getDate(),
//   ).padStart(2, "0");

//   const hours = String(
//     date.getHours(),
//   ).padStart(2, "0");

//   const minutes = String(
//     date.getMinutes(),
//   ).padStart(2, "0");

//   return `${year}-${month}-${day}T${hours}:${minutes}`;
// };

// const formatApiError = (error) => {
//   const data = error?.response?.data;

//   if (!data) {
//     return (
//       error?.message ||
//       "Something went wrong. Please try again."
//     );
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
//     const messages = [];

//     Object.entries(data).forEach(
//       ([field, value]) => {
//         if (Array.isArray(value)) {
//           messages.push(
//             `${field}: ${value.join(", ")}`,
//           );
//         } else if (
//           typeof value === "string"
//         ) {
//           messages.push(
//             `${field}: ${value}`,
//           );
//         } else {
//           messages.push(
//             `${field}: ${JSON.stringify(value)}`,
//           );
//         }
//       },
//     );

//     if (messages.length) {
//       return messages.join("\n");
//     }
//   }

//   return "Unable to create the assignment.";
// };

// // ============================================================
// // COMPONENT
// // ============================================================

// export default function CreatePrincipalAssignment() {
//   const navigate = useNavigate();
//   const { user } = useAuth();

//   // ----------------------------------------------------------
//   // DATA
//   // ----------------------------------------------------------

//   const [sessions, setSessions] = useState([]);
//   const [terms, setTerms] = useState([]);
//   const [classes, setClasses] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [classSubjects, setClassSubjects] =
//     useState([]);

//   // ----------------------------------------------------------
//   // FORM
//   // ----------------------------------------------------------

//   const [form, setForm] = useState({
//     academic_session: "",
//     term: "",
//     class_level: "",
//     subject: "",
//     title: "",
//     instructions: "",
//     assigned_date: toDateInput(
//       new Date(),
//     ),
//     due_date: "",
//     maximum_score: "100",
//     allow_late_submission: false,
//     status: "PUBLISHED",
//     attachment: null,
//   });

//   // ----------------------------------------------------------
//   // UI STATE
//   // ----------------------------------------------------------

//   const [loading, setLoading] =
//     useState(true);

//   const [loadingSubjects, setLoadingSubjects] =
//     useState(false);

//   const [submitting, setSubmitting] =
//     useState(false);

//   const [error, setError] =
//     useState("");

//   const [success, setSuccess] =
//     useState("");

//   const [fileName, setFileName] =
//     useState("");

//   // ==========================================================
//   // LOAD ACADEMIC DATA
//   // ==========================================================

//   useEffect(() => {
//     let mounted = true;

//     const loadAcademicData = async () => {
//       setLoading(true);
//       setError("");

//       try {
//         const [
//           sessionsResponse,
//           termsResponse,
//           classesResponse,
//           subjectsResponse,
//           classSubjectsResponse,
//         ] = await Promise.all([
//           api.get(ENDPOINTS.sessions),
//           api.get(ENDPOINTS.terms),
//           api.get(ENDPOINTS.classes),
//           api.get(ENDPOINTS.subjects),
//           api.get(
//             ENDPOINTS.classSubjects,
//           ),
//         ]);

//         if (!mounted) {
//           return;
//         }

//         setSessions(
//           getResults(
//             sessionsResponse.data,
//           ),
//         );

//         setTerms(
//           getResults(
//             termsResponse.data,
//           ),
//         );

//         setClasses(
//           getResults(
//             classesResponse.data,
//           ),
//         );

//         setSubjects(
//           getResults(
//             subjectsResponse.data,
//           ),
//         );

//         setClassSubjects(
//           getResults(
//             classSubjectsResponse.data,
//           ),
//         );
//       } catch (err) {
//         if (!mounted) {
//           return;
//         }

//         setError(
//           formatApiError(err),
//         );
//       } finally {
//         if (mounted) {
//           setLoading(false);
//         }
//       }
//     };

//     loadAcademicData();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   // ==========================================================
//   // SELECTED CLASS SUBJECTS
//   // ==========================================================

//   const selectedClassSubjects =
//     useMemo(() => {
//       if (!form.class_level) {
//         return [];
//       }

//       return classSubjects.filter(
//         (item) =>
//           String(
//             getClassId(item),
//           ) ===
//           String(form.class_level),
//       );
//     }, [
//       classSubjects,
//       form.class_level,
//     ]);

//   // ==========================================================
//   // SUBJECTS AVAILABLE FOR SELECTED CLASS
//   // ==========================================================

//   const availableSubjects =
//     useMemo(() => {
//       if (!form.class_level) {
//         return [];
//       }

//       const subjectIds =
//         selectedClassSubjects
//           .map((item) =>
//             getSubjectId(item),
//           )
//           .filter(
//             (id) =>
//               id !== null &&
//               id !== undefined,
//           );

//       return subjects.filter((subject) =>
//         subjectIds.some(
//           (id) =>
//             String(id) ===
//             String(getId(subject)),
//         ),
//       );
//     }, [
//       subjects,
//       selectedClassSubjects,
//       form.class_level,
//     ]);

//   // ==========================================================
//   // SESSION FILTERING
//   // ==========================================================

//   const availableSessions =
//     useMemo(() => {
//       if (!user?.school_id) {
//         return sessions;
//       }

//       return sessions.filter(
//         (session) => {
//           const schoolId =
//             session?.school ??
//             session?.school_id;

//           if (
//             schoolId === null ||
//             schoolId === undefined
//           ) {
//             return true;
//           }

//           return (
//             String(schoolId) ===
//             String(user.school_id)
//           );
//         },
//       );
//     }, [
//       sessions,
//       user,
//     ]);

//   // ==========================================================
//   // CLASS FILTERING
//   // ==========================================================

//   const availableClasses =
//     useMemo(() => {
//       if (!user?.school_id) {
//         return classes;
//       }

//       return classes.filter(
//         (classItem) => {
//           const schoolId =
//             classItem?.school ??
//             classItem?.school_id;

//           if (
//             schoolId === null ||
//             schoolId === undefined
//           ) {
//             return true;
//           }

//           return (
//             String(schoolId) ===
//             String(user.school_id)
//           );
//         },
//       );
//     }, [
//       classes,
//       user,
//     ]);

//   // ==========================================================
//   // TERM FILTERING
//   // ==========================================================

//   const availableTerms =
//     useMemo(() => {
//       if (!form.academic_session) {
//         return terms;
//       }

//       return terms.filter((term) => {
//         const sessionId =
//           term?.academic_session ??
//           term?.academic_session_id ??
//           term?.session ??
//           term?.session_id;

//         if (
//           sessionId === null ||
//           sessionId === undefined
//         ) {
//           return true;
//         }

//         return (
//           String(sessionId) ===
//           String(
//             form.academic_session,
//           )
//         );
//       });
//     }, [
//       terms,
//       form.academic_session,
//     ]);

//   // ==========================================================
//   // HANDLE INPUT
//   // ==========================================================

//   const handleChange = (event) => {
//     const {
//       name,
//       value,
//       type,
//       checked,
//       files,
//     } = event.target;

//     if (name === "attachment") {
//       const file = files?.[0] || null;

//       setForm((previous) => ({
//         ...previous,
//         attachment: file,
//       }));

//       setFileName(
//         file?.name || "",
//       );

//       return;
//     }

//     setForm((previous) => ({
//       ...previous,
//       [name]:
//         type === "checkbox"
//           ? checked
//           : value,
//     }));

//     if (
//       name === "class_level"
//     ) {
//       setForm((previous) => ({
//         ...previous,
//         class_level: value,
//         subject: "",
//       }));
//     }

//     if (
//       name === "academic_session"
//     ) {
//       setForm((previous) => ({
//         ...previous,
//         academic_session: value,
//         term: "",
//       }));
//     }
//   };

//   // ==========================================================
//   // VALIDATION
//   // ==========================================================

//   const validateForm = () => {
//     if (!user?.school_id) {
//       return "Your Principal account is not linked to a school.";
//     }

//     if (!form.academic_session) {
//       return "Please select an academic session.";
//     }

//     if (!form.term) {
//       return "Please select a term.";
//     }

//     if (!form.class_level) {
//       return "Please select a class.";
//     }

//     if (!form.subject) {
//       return "Please select a subject.";
//     }

//     if (!form.title.trim()) {
//       return "Please enter an assignment title.";
//     }

//     if (!form.assigned_date) {
//       return "Please select the assigned date.";
//     }

//     if (!form.due_date) {
//       return "Please select the due date.";
//     }

//     const assignedDate = new Date(
//       `${form.assigned_date}T00:00:00`,
//     );

//     const dueDate = new Date(
//       form.due_date,
//     );

//     if (
//       Number.isNaN(
//         assignedDate.getTime(),
//       )
//     ) {
//       return "The assigned date is invalid.";
//     }

//     if (
//       Number.isNaN(
//         dueDate.getTime(),
//       )
//     ) {
//       return "The due date is invalid.";
//     }

//     if (dueDate <= assignedDate) {
//       return "The due date must be after the assigned date.";
//     }

//     const maximumScore = Number(
//       form.maximum_score,
//     );

//     if (
//       !Number.isFinite(
//         maximumScore,
//       ) ||
//       maximumScore <= 0
//     ) {
//       return "Maximum score must be greater than zero.";
//     }

//     return "";
//   };

//   // ==========================================================
//   // SUBMIT
//   // ==========================================================

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     setError("");
//     setSuccess("");

//     const validationError =
//       validateForm();

//     if (validationError) {
//       setError(validationError);
//       return;
//     }

//     setSubmitting(true);

//     try {
//       /*
//        * Principal assignments are whole-class assignments.
//        *
//        * IMPORTANT:
//        * There is deliberately NO teacher field here.
//        *
//        * The backend should allow teacher to be NULL for
//        * Principal-created assignments.
//        */

//       const payload = new FormData();

//       payload.append(
//         "school",
//         String(user.school_id),
//       );

//       payload.append(
//         "academic_session",
//         String(
//           form.academic_session,
//         ),
//       );

//       payload.append(
//         "term",
//         String(form.term),
//       );

//       payload.append(
//         "class_level",
//         String(form.class_level),
//       );

//       payload.append(
//         "subject",
//         String(form.subject),
//       );

//       payload.append(
//         "title",
//         form.title.trim(),
//       );

//       payload.append(
//         "instructions",
//         form.instructions.trim(),
//       );

//       /*
//        * Django DateField expects:
//        * YYYY-MM-DD
//        */
//       payload.append(
//         "assigned_date",
//         form.assigned_date,
//       );

//       /*
//        * Django DateTimeField accepts the datetime
//        * generated by datetime-local.
//        *
//        * Convert it to an ISO datetime without
//        * changing the selected local clock time.
//        */
//       const dueDate = new Date(
//         form.due_date,
//       );

//       payload.append(
//         "due_date",
//         dueDate.toISOString(),
//       );

//       payload.append(
//         "maximum_score",
//         String(
//           Number(form.maximum_score),
//         ),
//       );

//       payload.append(
//         "allow_late_submission",
//         form.allow_late_submission
//           ? "true"
//           : "false",
//       );

//       payload.append(
//         "status",
//         form.status,
//       );

//       if (form.attachment) {
//         payload.append(
//           "attachment",
//           form.attachment,
//         );
//       }

//       const created =
//         await assignmentsService.create(
//           payload,
//         );

//       setSuccess(
//         "Assignment created successfully.",
//       );

//       const createdId =
//         created?.id;

//       if (createdId) {
//         setTimeout(() => {
//           navigate(
//             `/principal/assignments/${createdId}`,
//           );
//         }, 700);
//       } else {
//         setTimeout(() => {
//           navigate(
//             "/principal/assignments",
//           );
//         }, 700);
//       }
//     } catch (err) {
//       setError(
//         formatApiError(err),
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ==========================================================
//   // LOADING
//   // ==========================================================

//   if (loading) {
//     return (
//       <div className="min-h-[60vh] flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3 text-slate-600">
//           <Loader2
//             size={32}
//             className="animate-spin"
//           />
//           <p>
//             Loading academic information...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // ==========================================================
//   // RENDER
//   // ==========================================================

//   return (
//     <div className="min-h-screen bg-slate-50 p-4 md:p-6">
//       <div className="mx-auto max-w-5xl">
//         {/* ================================================== */}
//         {/* HEADER */}
//         {/* ================================================== */}

//         <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <button
//               type="button"
//               onClick={() =>
//                 navigate(
//                   "/principal/assignments",
//                 )
//               }
//               className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
//             >
//               <ArrowLeft size={17} />
//               Back to Assignments
//             </button>

//             <div className="flex items-center gap-3">
//               <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
//                 <GraduationCap
//                   size={25}
//                 />
//               </div>

//               <div>
//                 <h1 className="text-2xl font-bold text-slate-900">
//                   Create Class Assignment
//                 </h1>

//                 <p className="mt-1 text-sm text-slate-500">
//                   Create an assignment for all eligible students in a class.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ================================================== */}
//         {/* ALERTS */}
//         {/* ================================================== */}

//         {error && (
//           <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
//             <AlertCircle
//               size={20}
//               className="mt-0.5 shrink-0"
//             />

//             <div className="whitespace-pre-line text-sm">
//               {error}
//             </div>
//           </div>
//         )}

//         {success && (
//           <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
//             <CheckCircle
//               size={20}
//               className="mt-0.5 shrink-0"
//             />

//             <div className="text-sm font-medium">
//               {success}
//             </div>
//           </div>
//         )}

//         {/* ================================================== */}
//         {/* FORM */}
//         {/* ================================================== */}

//         <form
//           onSubmit={handleSubmit}
//           className="space-y-6"
//         >
//           {/* ================================================= */}
//           {/* ACADEMIC INFORMATION */}
//           {/* ================================================= */}

//           <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
//             <div className="border-b border-slate-200 px-5 py-4 md:px-6">
//               <h2 className="text-base font-semibold text-slate-900">
//                 Academic Information
//               </h2>

//               <p className="mt-1 text-sm text-slate-500">
//                 Select where this class assignment belongs.
//               </p>
//             </div>

//             <div className="grid gap-5 p-5 md:grid-cols-2 md:p-6">
//               {/* SESSION */}

//               <div>
//                 <label
//                   htmlFor="academic_session"
//                   className="mb-2 block text-sm font-medium text-slate-700"
//                 >
//                   Academic Session
//                   <span className="ml-1 text-red-500">
//                     *
//                   </span>
//                 </label>

//                 <select
//                   id="academic_session"
//                   name="academic_session"
//                   value={
//                     form.academic_session
//                   }
//                   onChange={handleChange}
//                   className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//                   required
//                 >
//                   <option value="">
//                     Select academic session
//                   </option>

//                   {availableSessions.map(
//                     (session) => (
//                       <option
//                         key={getId(
//                           session,
//                         )}
//                         value={getId(
//                           session,
//                         )}
//                       >
//                         {getName(
//                           session,
//                         )}
//                       </option>
//                     ),
//                   )}
//                 </select>
//               </div>

//               {/* TERM */}

//               <div>
//                 <label
//                   htmlFor="term"
//                   className="mb-2 block text-sm font-medium text-slate-700"
//                 >
//                   Term
//                   <span className="ml-1 text-red-500">
//                     *
//                   </span>
//                 </label>

//                 <select
//                   id="term"
//                   name="term"
//                   value={form.term}
//                   onChange={handleChange}
//                   disabled={
//                     !form.academic_session
//                   }
//                   className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//                   required
//                 >
//                   <option value="">
//                     {form.academic_session
//                       ? "Select term"
//                       : "Select session first"}
//                   </option>

//                   {availableTerms.map(
//                     (term) => (
//                       <option
//                         key={getId(term)}
//                         value={getId(term)}
//                       >
//                         {getName(term)}
//                       </option>
//                     ),
//                   )}
//                 </select>
//               </div>

//               {/* CLASS */}

//               <div>
//                 <label
//                   htmlFor="class_level"
//                   className="mb-2 block text-sm font-medium text-slate-700"
//                 >
//                   Class
//                   <span className="ml-1 text-red-500">
//                     *
//                   </span>
//                 </label>

//                 <select
//                   id="class_level"
//                   name="class_level"
//                   value={
//                     form.class_level
//                   }
//                   onChange={handleChange}
//                   className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//                   required
//                 >
//                   <option value="">
//                     Select class
//                   </option>

//                   {availableClasses.map(
//                     (classItem) => (
//                       <option
//                         key={getId(
//                           classItem,
//                         )}
//                         value={getId(
//                           classItem,
//                         )}
//                       >
//                         {getName(
//                           classItem,
//                         )}
//                       </option>
//                     ),
//                   )}
//                 </select>
//               </div>

//               {/* SUBJECT */}

//               <div>
//                 <label
//                   htmlFor="subject"
//                   className="mb-2 block text-sm font-medium text-slate-700"
//                 >
//                   Subject
//                   <span className="ml-1 text-red-500">
//                     *
//                   </span>
//                 </label>

//                 <select
//                   id="subject"
//                   name="subject"
//                   value={form.subject}
//                   onChange={handleChange}
//                   disabled={
//                     !form.class_level ||
//                     loadingSubjects
//                   }
//                   className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
//                   required
//                 >
//                   <option value="">
//                     {!form.class_level
//                       ? "Select class first"
//                       : "Select subject"}
//                   </option>

//                   {availableSubjects.map(
//                     (subject) => {
//                       const mapping =
//                         selectedClassSubjects.find(
//                           (item) =>
//                             String(
//                               getSubjectId(
//                                 item,
//                               ),
//                             ) ===
//                             String(
//                               getId(
//                                 subject,
//                               ),
//                             ),
//                         );

//                       return (
//                         <option
//                           key={getId(
//                             subject,
//                           )}
//                           value={getId(
//                             subject,
//                           )}
//                         >
//                           {getName(
//                             subject,
//                           )}
//                           {mapping &&
//                           getAssignmentType(
//                             mapping,
//                           )
//                             ? ` — ${getAssignmentType(
//                                 mapping,
//                               )}`
//                             : ""}
//                         </option>
//                       );
//                     },
//                   )}
//                 </select>

//                 {form.class_level &&
//                   availableSubjects.length ===
//                     0 && (
//                     <p className="mt-2 text-xs text-amber-600">
//                       No subjects are assigned to
//                       this class.
//                     </p>
//                   )}
//               </div>
//             </div>
//           </section>

//           {/* ================================================= */}
//           {/* ASSIGNMENT DETAILS */}
//           {/* ================================================= */}

//           <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
//             <div className="border-b border-slate-200 px-5 py-4 md:px-6">
//               <h2 className="text-base font-semibold text-slate-900">
//                 Assignment Details
//               </h2>

//               <p className="mt-1 text-sm text-slate-500">
//                 Enter the assignment information that students will receive.
//               </p>
//             </div>

//             <div className="space-y-5 p-5 md:p-6">
//               {/* TITLE */}

//               <div>
//                 <label
//                   htmlFor="title"
//                   className="mb-2 block text-sm font-medium text-slate-700"
//                 >
//                   Assignment Title
//                   <span className="ml-1 text-red-500">
//                     *
//                   </span>
//                 </label>

//                 <input
//                   id="title"
//                   name="title"
//                   type="text"
//                   value={form.title}
//                   onChange={handleChange}
//                   placeholder="e.g. Civic Education Test"
//                   className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//                   required
//                 />
//               </div>

//               {/* INSTRUCTIONS */}

//               <div>
//                 <label
//                   htmlFor="instructions"
//                   className="mb-2 block text-sm font-medium text-slate-700"
//                 >
//                   Instructions
//                 </label>

//                 <textarea
//                   id="instructions"
//                   name="instructions"
//                   value={
//                     form.instructions
//                   }
//                   onChange={handleChange}
//                   rows={6}
//                   placeholder="Enter the assignment instructions..."
//                   className="w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//                 />
//               </div>

//               {/* DATES */}

//               <div className="grid gap-5 md:grid-cols-2">
//                 <div>
//                   <label
//                     htmlFor="assigned_date"
//                     className="mb-2 block text-sm font-medium text-slate-700"
//                   >
//                     Assigned Date
//                     <span className="ml-1 text-red-500">
//                       *
//                     </span>
//                   </label>

//                   <input
//                     id="assigned_date"
//                     name="assigned_date"
//                     type="date"
//                     value={
//                       form.assigned_date
//                     }
//                     onChange={handleChange}
//                     className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//                     required
//                   />

//                   <p className="mt-1 text-xs text-slate-400">
//                     Date only.
//                   </p>
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="due_date"
//                     className="mb-2 block text-sm font-medium text-slate-700"
//                   >
//                     Due Date & Time
//                     <span className="ml-1 text-red-500">
//                       *
//                     </span>
//                   </label>

//                   <input
//                     id="due_date"
//                     name="due_date"
//                     type="datetime-local"
//                     value={form.due_date}
//                     onChange={handleChange}
//                     className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//                     required
//                   />
//                 </div>
//               </div>

//               {/* SCORE + STATUS */}

//               <div className="grid gap-5 md:grid-cols-2">
//                 <div>
//                   <label
//                     htmlFor="maximum_score"
//                     className="mb-2 block text-sm font-medium text-slate-700"
//                   >
//                     Maximum Score
//                     <span className="ml-1 text-red-500">
//                       *
//                     </span>
//                   </label>

//                   <input
//                     id="maximum_score"
//                     name="maximum_score"
//                     type="number"
//                     min="1"
//                     step="0.01"
//                     value={
//                       form.maximum_score
//                     }
//                     onChange={handleChange}
//                     className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label
//                     htmlFor="status"
//                     className="mb-2 block text-sm font-medium text-slate-700"
//                   >
//                     Status
//                     <span className="ml-1 text-red-500">
//                       *
//                     </span>
//                   </label>

//                   <select
//                     id="status"
//                     name="status"
//                     value={form.status}
//                     onChange={handleChange}
//                     className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
//                   >
//                     <option value="DRAFT">
//                       Draft
//                     </option>

//                     <option value="PUBLISHED">
//                       Published
//                     </option>

//                     <option value="CLOSED">
//                       Closed
//                     </option>
//                   </select>
//                 </div>
//               </div>

//               {/* LATE SUBMISSION */}

//               <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
//                 <input
//                   type="checkbox"
//                   name="allow_late_submission"
//                   checked={
//                     form.allow_late_submission
//                   }
//                   onChange={handleChange}
//                   className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
//                 />

//                 <span>
//                   <span className="block text-sm font-medium text-slate-800">
//                     Allow late submission
//                   </span>

//                   <span className="mt-1 block text-xs text-slate-500">
//                     Students will be allowed to submit after
//                     the due date.
//                   </span>
//                 </span>
//               </label>

//               {/* ATTACHMENT */}

//               <div>
//                 <label
//                   htmlFor="attachment"
//                   className="mb-2 block text-sm font-medium text-slate-700"
//                 >
//                   Attachment
//                 </label>

//                 <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
//                   <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
//                     <label
//                       htmlFor="attachment"
//                       className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
//                     >
//                       <FileText
//                         size={17}
//                       />
//                       Choose File

//                       <input
//                         id="attachment"
//                         name="attachment"
//                         type="file"
//                         onChange={
//                           handleChange
//                         }
//                         className="hidden"
//                       />
//                     </label>

//                     {fileName ? (
//                       <span className="text-sm text-slate-600">
//                         {fileName}
//                       </span>
//                     ) : (
//                       <span className="text-sm text-slate-400">
//                         No file selected
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* ================================================= */}
//           {/* WHOLE CLASS NOTICE */}
//           {/* ================================================= */}

//           <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
//             <div className="flex items-start gap-3">
//               <GraduationCap
//                 size={21}
//                 className="mt-0.5 shrink-0 text-indigo-600"
//               />

//               <div>
//                 <h3 className="text-sm font-semibold text-indigo-900">
//                   Whole-Class Assignment
//                 </h3>

//                 <p className="mt-1 text-sm leading-6 text-indigo-700">
//                   This assignment will be associated with
//                   the selected class. Eligible students in
//                   that class will be able to access the
//                   assignment according to the existing
//                   student eligibility rules.
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* ================================================= */}
//           {/* ACTIONS */}
//           {/* ================================================= */}

//           <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
//             <button
//               type="button"
//               onClick={() =>
//                 navigate(
//                   "/principal/assignments",
//                 )
//               }
//               disabled={submitting}
//               className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={submitting}
//               className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               {submitting ? (
//                 <>
//                   <Loader2
//                     size={18}
//                     className="animate-spin"
//                   />
//                   Creating...
//                 </>
//               ) : (
//                 <>
//                   <Save size={18} />
//                   Create Assignment
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// src/pages/principal/assignments/CreatePrincipalAssignment.jsx



import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle,
  FileText,
  GraduationCap,
  Loader2,
  Search,
  Save,
  Users,
  UserCheck,
  X,
} from "lucide-react";

import api from "../../../services/api";
import assignmentsService from "../../../services/assignmentsService";
import { getStudents } from "../../../services/studentsService";
import { useAuth } from "../../../context/AuthContext";

// ============================================================
// ENDPOINTS
// ============================================================

const ENDPOINTS = {
  sessions: "/academics/sessions/",
  terms: "/academics/terms/",
  classes: "/academics/class-levels/",
  subjects: "/academics/subjects/",
  classSubjects: "/academics/class-subjects/",
  enrollments: "/students/enrollments/",
};

// ============================================================
// HELPERS
// ============================================================

const getResults = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

// ============================================================
// GENERIC ID
// ============================================================

const getId = (item) =>
  item?.id ??
  item?.pk ??
  item?.value ??
  item?.student_id ??
  null;

// ============================================================
// NAME
// ============================================================

const getName = (item) =>
  item?.name ??
  item?.title ??
  item?.label ??
  item?.class_name ??
  item?.subject_name ??
  item?.session_name ??
  item?.term_name ??
  "";

// ============================================================
// CLASS ID
// ============================================================

const getClassId = (item) =>
  item?.class_level_id ??
  item?.class_level ??
  item?.class_id ??
  item?.class ??
  item?.current_class_level_id ??
  item?.current_class_id ??
  null;

// ============================================================
// SUBJECT ID
// ============================================================

const getSubjectId = (item) =>
  item?.subject_id ??
  item?.subject ??
  null;

// ============================================================
// ASSIGNMENT TYPE
// ============================================================

const getAssignmentType = (item) =>
  item?.assignment_type ??
  item?.assignment_type_display ??
  "";

// ============================================================
// STUDENT NAME
// ============================================================

const getStudentName = (student) => {
  if (student?.full_name) {
    return student.full_name;
  }

  if (student?.student_name) {
    return student.student_name;
  }

  if (student?.name) {
    return student.name;
  }

  const studentParts = [
    student?.first_name,
    student?.middle_name,
    student?.last_name,
  ].filter(Boolean);

  if (studentParts.length) {
    return studentParts.join(" ");
  }

  const userParts = [
    student?.user?.first_name,
    student?.user?.middle_name,
    student?.user?.last_name,
  ].filter(Boolean);

  if (userParts.length) {
    return userParts.join(" ");
  }

  if (student?.user?.full_name) {
    return student.user.full_name;
  }

  return "Unnamed Student";
};

// ============================================================
// ADMISSION NUMBER
// ============================================================

const getStudentAdmissionNumber = (student) =>
  student?.admission_number ??
  student?.admissionNo ??
  student?.admissionNumber ??
  student?.admission ??
  "";

// ============================================================
// NORMALIZE ID
// ============================================================

const normalizeId = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  if (typeof value === "object") {
    return (
      value?.id ??
      value?.pk ??
      value?.school_id ??
      value?.value ??
      null
    );
  }

  return value;
};

// ============================================================
// SCHOOL ID FROM ANY OBJECT
// ============================================================

const getSchoolIdFromObject = (item) => {
  if (!item) {
    return null;
  }

  const possibleValues = [
    item?.school_id,
    item?.schoolId,
    item?.schoolID,

    item?.school?.id,
    item?.school?.pk,
    item?.school?.school_id,
    item?.school?.value,

    item?.school,

    item?.profile?.school_id,
    item?.profile?.school?.id,
    item?.profile?.school?.pk,

    item?.principal_profile?.school_id,
    item?.principal_profile?.school?.id,
    item?.principal_profile?.school?.pk,

    item?.principal?.school_id,
    item?.principal?.school?.id,
    item?.principal?.school?.pk,

    item?.user?.school_id,
    item?.user?.school?.id,
    item?.user?.school?.pk,
    item?.user?.school,
  ];

  for (const value of possibleValues) {
    const normalized = normalizeId(value);

    if (
      normalized !== null &&
      normalized !== undefined &&
      normalized !== ""
    ) {
      return normalized;
    }
  }

  return null;
};

// ============================================================
// USER SCHOOL ID
// ============================================================

const getUserSchoolId = (user) => {
  return getSchoolIdFromObject(user);
};

// ============================================================
// STUDENT ID
// ============================================================

const getStudentId = (student) => {
  return (
    student?.id ??
    student?.pk ??
    student?.student_id ??
    student?.student?.id ??
    student?.student?.pk ??
    null
  );
};

// ============================================================
// ENROLLMENT STUDENT ID
// ============================================================

const getEnrollmentStudentId = (enrollment) => {
  return (
    enrollment?.student_id ??
    enrollment?.student?.id ??
    enrollment?.student?.pk ??
    enrollment?.student ??
    null
  );
};

// ============================================================
// ENROLLMENT CLASS ID
// ============================================================

const getEnrollmentClassId = (enrollment) => {
  return (
    enrollment?.class_level_id ??
    enrollment?.class_level?.id ??
    enrollment?.class_level?.pk ??
    enrollment?.class_level ??
    enrollment?.class_id ??
    enrollment?.class?.id ??
    enrollment?.class?.pk ??
    enrollment?.class ??
    null
  );
};

// ============================================================
// STUDENT CLASS ID
// ============================================================
//
// This is used as a secondary safety filter.
//
// The primary filter comes from StudentEnrollment.
// ============================================================

const getStudentClassId = (student) => {
  const directClass =
    student?.class_level_id ??
    student?.class_level ??
    student?.class_id ??
    student?.class ??
    student?.current_class_level_id ??
    student?.current_class_id;

  if (
    directClass !== undefined &&
    directClass !== null &&
    directClass !== ""
  ) {
    return normalizeId(directClass);
  }

  const currentEnrollment =
    student?.current_enrollment ??
    student?.currentEnrollment ??
    student?.enrollment;

  if (currentEnrollment) {
    return getEnrollmentClassId(
      currentEnrollment,
    );
  }

  if (Array.isArray(student?.enrollments)) {
    const current =
      student.enrollments.find(
        (item) =>
          item?.is_current === true,
      );

    if (current) {
      return getEnrollmentClassId(
        current,
      );
    }
  }

  return null;
};

// ============================================================
// DATE HELPER
// ============================================================

const toDateInput = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// ============================================================
// ERROR HELPER
// ============================================================

const formatApiError = (error) => {
  const data = error?.response?.data;

  if (!data) {
    return (
      error?.message ||
      "Something went wrong. Please try again."
    );
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
    const messages = [];

    Object.entries(data).forEach(
      ([field, value]) => {
        if (Array.isArray(value)) {
          messages.push(
            `${field}: ${value.join(", ")}`,
          );
        } else if (
          typeof value === "string"
        ) {
          messages.push(
            `${field}: ${value}`,
          );
        } else {
          messages.push(
            `${field}: ${JSON.stringify(value)}`,
          );
        }
      },
    );

    if (messages.length) {
      return messages.join("\n");
    }
  }

  return "Unable to create the assignment.";
};

// ============================================================
// COMPONENT
// ============================================================

export default function CreatePrincipalAssignment() {
  const navigate = useNavigate();

  const { user } = useAuth();

  // ==========================================================
  // SCHOOL
  // ==========================================================

  const userSchoolId = useMemo(
    () => getUserSchoolId(user),
    [user],
  );

  const [academicSchoolId, setAcademicSchoolId] =
    useState(null);

  const resolvedSchoolId = useMemo(() => {
    return (
      userSchoolId ??
      academicSchoolId ??
      null
    );
  }, [
    userSchoolId,
    academicSchoolId,
  ]);

  // ==========================================================
  // ACADEMIC DATA
  // ==========================================================

  const [sessions, setSessions] = useState([]);

  const [terms, setTerms] = useState([]);

  const [classes, setClasses] = useState([]);

  const [subjects, setSubjects] = useState([]);

  const [classSubjects, setClassSubjects] =
    useState([]);

  // ==========================================================
  // STUDENTS
  // ==========================================================

  const [students, setStudents] = useState([]);

  const [
    loadingStudents,
    setLoadingStudents,
  ] = useState(false);

  const [
    studentSearch,
    setStudentSearch,
  ] = useState("");

  const [
    selectedStudents,
    setSelectedStudents,
  ] = useState([]);

  // ==========================================================
  // ENROLLMENTS
  // ==========================================================

  const [
    enrollments,
    setEnrollments,
  ] = useState([]);

  // ==========================================================
  // FORM
  // ==========================================================

  const [form, setForm] = useState({
    academic_session: "",
    term: "",
    class_level: "",
    subject: "",

    target_type: "WHOLE_CLASS",

    title: "",
    instructions: "",

    assigned_date: toDateInput(
      new Date(),
    ),

    due_date: "",

    maximum_score: "100",

    allow_late_submission: false,

    status: "PUBLISHED",

    attachment: null,
  });

  // ==========================================================
  // UI STATE
  // ==========================================================

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [fileName, setFileName] =
    useState("");

  // ==========================================================
  // LOAD ACADEMIC DATA
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadAcademicData = async () => {
      setLoading(true);
      setError("");

      try {
        const [
          sessionsResponse,
          termsResponse,
          classesResponse,
          subjectsResponse,
          classSubjectsResponse,
        ] = await Promise.all([
          api.get(
            ENDPOINTS.sessions,
          ),

          api.get(
            ENDPOINTS.terms,
          ),

          api.get(
            ENDPOINTS.classes,
          ),

          api.get(
            ENDPOINTS.subjects,
          ),

          api.get(
            ENDPOINTS.classSubjects,
          ),
        ]);

        if (!mounted) {
          return;
        }

        const loadedSessions =
          getResults(
            sessionsResponse.data,
          );

        const loadedTerms =
          getResults(
            termsResponse.data,
          );

        const loadedClasses =
          getResults(
            classesResponse.data,
          );

        const loadedSubjects =
          getResults(
            subjectsResponse.data,
          );

        const loadedClassSubjects =
          getResults(
            classSubjectsResponse.data,
          );

        setSessions(
          loadedSessions,
        );

        setTerms(
          loadedTerms,
        );

        setClasses(
          loadedClasses,
        );

        setSubjects(
          loadedSubjects,
        );

        setClassSubjects(
          loadedClassSubjects,
        );

        // ====================================================
        // RESOLVE SCHOOL FROM ACADEMIC DATA
        // ====================================================

        if (!userSchoolId) {
          const academicSources = [
            ...loadedSessions,
            ...loadedTerms,
            ...loadedClasses,
            ...loadedSubjects,
            ...loadedClassSubjects,
          ];

          let foundSchoolId = null;

          for (const item of academicSources) {
            const schoolId =
              getSchoolIdFromObject(
                item,
              );

            if (schoolId) {
              foundSchoolId =
                schoolId;

              break;
            }
          }

          if (foundSchoolId) {
            setAcademicSchoolId(
              foundSchoolId,
            );
          }
        }
      } catch (err) {
        if (!mounted) {
          return;
        }

        setError(
          formatApiError(err),
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAcademicData();

    return () => {
      mounted = false;
    };
  }, [userSchoolId]);

  // ==========================================================
  // SELECTED CLASS SUBJECTS
  // ==========================================================

  const selectedClassSubjects =
    useMemo(() => {
      if (!form.class_level) {
        return [];
      }

      return classSubjects.filter(
        (item) =>
          String(
            getClassId(item),
          ) ===
          String(
            form.class_level,
          ),
      );
    }, [
      classSubjects,
      form.class_level,
    ]);

  // ==========================================================
  // AVAILABLE SUBJECTS
  // ==========================================================

  const availableSubjects =
    useMemo(() => {
      if (!form.class_level) {
        return [];
      }

      const subjectIds =
        new Set(
          selectedClassSubjects
            .map((item) =>
              getSubjectId(item),
            )
            .filter(
              (id) =>
                id !== null &&
                id !== undefined,
            )
            .map(String),
        );

      return subjects.filter(
        (subject) =>
          subjectIds.has(
            String(
              getId(subject),
            ),
          ),
      );
    }, [
      subjects,
      selectedClassSubjects,
      form.class_level,
    ]);

  // ==========================================================
  // AVAILABLE SESSIONS
  // ==========================================================

  const availableSessions =
    useMemo(() => {
      if (!userSchoolId) {
        return sessions;
      }

      return sessions.filter(
        (session) => {
          const schoolId =
            getSchoolIdFromObject(
              session,
            );

          if (!schoolId) {
            return true;
          }

          return (
            String(schoolId) ===
            String(userSchoolId)
          );
        },
      );
    }, [
      sessions,
      userSchoolId,
    ]);

  // ==========================================================
  // AVAILABLE CLASSES
  // ==========================================================

  const availableClasses =
    useMemo(() => {
      if (!userSchoolId) {
        return classes;
      }

      return classes.filter(
        (classItem) => {
          const schoolId =
            getSchoolIdFromObject(
              classItem,
            );

          if (!schoolId) {
            return true;
          }

          return (
            String(schoolId) ===
            String(userSchoolId)
          );
        },
      );
    }, [
      classes,
      userSchoolId,
    ]);

  // ==========================================================
  // AVAILABLE TERMS
  // ==========================================================

  const availableTerms =
    useMemo(() => {
      if (!form.academic_session) {
        return terms;
      }

      return terms.filter(
        (term) => {
          const sessionId =
            term?.academic_session_id ??
            term?.academic_session ??
            term?.session_id ??
            term?.session;

          if (
            sessionId ===
              undefined ||
            sessionId === null ||
            sessionId === ""
          ) {
            return true;
          }

          return (
            String(sessionId) ===
            String(
              form.academic_session,
            )
          );
        },
      );
    }, [
      terms,
      form.academic_session,
    ]);

  // ==========================================================
  // LOAD CLASS ENROLLMENTS + STUDENTS
  // ==========================================================
  //
  // IMPORTANT:
  //
  // The students endpoint may return all students in the
  // Principal's school.
  //
  // Therefore we DO NOT use that response by itself.
  //
  // We first get StudentEnrollment records for:
  //
  //   selected session
  //   selected term
  //   selected class
  //
  // Then we use those enrollment student IDs to filter the
  // student list.
  //
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadStudentsForSelectedClass =
      async () => {
        if (
          !form.class_level ||
          !form.academic_session ||
          !form.term
        ) {
          setStudents([]);
          setEnrollments([]);
          setSelectedStudents([]);
          return;
        }

        setLoadingStudents(true);
        setError("");

        try {
          // ==================================================
          // ENROLLMENT QUERY
          // ==================================================

          const enrollmentParams = {
            class_level:
              form.class_level,

            academic_session:
              form.academic_session,

            term:
              form.term,
          };

          const studentsParams = {
            classLevel:
              form.class_level,

            academicSession:
              form.academic_session,

            term:
              form.term,
          };

          if (resolvedSchoolId) {
            studentsParams.school =
              resolvedSchoolId;
          }

          // ==================================================
          // LOAD BOTH
          // ==================================================

          const [
            enrollmentResponse,
            studentsResponse,
          ] = await Promise.all([
            api.get(
              ENDPOINTS.enrollments,
              {
                params:
                  enrollmentParams,
              },
            ),

            getStudents(
              studentsParams,
            ),
          ]);

          if (!mounted) {
            return;
          }

          const loadedEnrollments =
            getResults(
              enrollmentResponse.data,
            );

          const loadedStudents =
            getResults(
              studentsResponse,
            );

          setEnrollments(
            loadedEnrollments,
          );

          // ==================================================
          // RESOLVE SCHOOL FROM ENROLLMENTS
          // ==================================================

          if (!resolvedSchoolId) {
            let enrollmentSchoolId =
              null;

            for (const enrollment of loadedEnrollments) {
              const schoolId =
                getSchoolIdFromObject(
                  enrollment,
                );

              if (schoolId) {
                enrollmentSchoolId =
                  schoolId;

                break;
              }
            }

            if (enrollmentSchoolId) {
              setAcademicSchoolId(
                enrollmentSchoolId,
              );
            }
          }

          // ==================================================
          // BUILD EXACT CLASS STUDENT ID SET
          // ==================================================

          const enrollmentStudentIds =
            loadedEnrollments
              .map(
                getEnrollmentStudentId,
              )
              .filter(
                (id) =>
                  id !== null &&
                  id !== undefined &&
                  id !== "",
              )
              .map(String);

          const enrollmentStudentIdSet =
            new Set(
              enrollmentStudentIds,
            );

          // ==================================================
          // IMPORTANT SAFETY CHECK
          // ==================================================
          //
          // Never display the complete school student list
          // when enrollment IDs are unavailable.
          //
          // This prevents the exact problem you reported.
          //
          // ==================================================

          if (
            enrollmentStudentIdSet
              .size === 0
          ) {
            setStudents([]);
            setSelectedStudents([]);

            return;
          }

          // ==================================================
          // FILTER STUDENTS BY ENROLLMENT
          // ==================================================

          let classStudents =
            loadedStudents.filter(
              (student) => {
                const studentId =
                  getStudentId(
                    student,
                  );

                if (
                  studentId ===
                    null ||
                  studentId ===
                    undefined
                ) {
                  return false;
                }

                return enrollmentStudentIdSet.has(
                  String(
                    studentId,
                  ),
                );
              },
            );

          // ==================================================
          // SECOND SAFETY FILTER
          // ==================================================
          //
          // If the student response contains class information,
          // verify it also matches the selected class.
          //
          // We only apply this when class metadata is actually
          // available.
          //
          // ==================================================

          classStudents =
            classStudents.filter(
              (student) => {
                const studentClassId =
                  getStudentClassId(
                    student,
                  );

                if (
                  studentClassId ===
                    null ||
                  studentClassId ===
                    undefined ||
                  studentClassId ===
                    ""
                ) {
                  return true;
                }

                return (
                  String(
                    studentClassId,
                  ) ===
                  String(
                    form.class_level,
                  )
                );
              },
            );

          setStudents(
            classStudents,
          );

          // ==================================================
          // RESET SELECTION
          // ==================================================

          setSelectedStudents([]);
        } catch (err) {
          if (!mounted) {
            return;
          }

          setStudents([]);
          setEnrollments([]);
          setSelectedStudents([]);

          setError(
            formatApiError(err),
          );
        } finally {
          if (mounted) {
            setLoadingStudents(false);
          }
        }
      };

    loadStudentsForSelectedClass();

    return () => {
      mounted = false;
    };
  }, [
    form.class_level,
    form.academic_session,
    form.term,
    resolvedSchoolId,
  ]);

  // ==========================================================
  // FILTER STUDENTS BY SEARCH
  // ==========================================================

  const filteredStudents =
    useMemo(() => {
      const search =
        studentSearch
          .trim()
          .toLowerCase();

      if (!search) {
        return students;
      }

      return students.filter(
        (student) => {
          const name =
            getStudentName(
              student,
            ).toLowerCase();

          const admissionNumber =
            String(
              getStudentAdmissionNumber(
                student,
              ),
            ).toLowerCase();

          return (
            name.includes(search) ||
            admissionNumber.includes(
              search,
            )
          );
        },
      );
    }, [
      students,
      studentSearch,
    ]);

  // ==========================================================
  // SELECTED STUDENT SET
  // ==========================================================

  const selectedStudentIdSet =
    useMemo(
      () =>
        new Set(
          selectedStudents.map(
            String,
          ),
        ),
      [selectedStudents],
    );

  // ==========================================================
  // ALL FILTERED STUDENTS SELECTED
  // ==========================================================

  const allFilteredStudentsSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every(
      (student) =>
        selectedStudentIdSet.has(
          String(
            getStudentId(
              student,
            ),
          ),
        ),
    );

  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
      files,
    } = event.target;

    // ========================================================
    // FILE
    // ========================================================

    if (type === "file") {
      const file =
        files?.[0] || null;

      setForm(
        (previous) => ({
          ...previous,
          attachment: file,
        }),
      );

      setFileName(
        file?.name || "",
      );

      return;
    }

    // ========================================================
    // SESSION
    // ========================================================

    if (
      name ===
      "academic_session"
    ) {
      setForm(
        (previous) => ({
          ...previous,
          academic_session:
            value,
          term: "",
          class_level: "",
          subject: "",
        }),
      );

      setStudents([]);
      setEnrollments([]);
      setSelectedStudents([]);
      setStudentSearch("");

      return;
    }

    // ========================================================
    // TERM
    // ========================================================

    if (name === "term") {
      setForm(
        (previous) => ({
          ...previous,
          term: value,
          class_level: "",
          subject: "",
        }),
      );

      setStudents([]);
      setEnrollments([]);
      setSelectedStudents([]);
      setStudentSearch("");

      return;
    }

    // ========================================================
    // CLASS
    // ========================================================

    if (
      name ===
      "class_level"
    ) {
      setForm(
        (previous) => ({
          ...previous,
          class_level: value,
          subject: "",
        }),
      );

      // IMPORTANT:
      // Changing class completely resets the student list.
      setStudents([]);
      setEnrollments([]);
      setSelectedStudents([]);
      setStudentSearch("");

      return;
    }

    // ========================================================
    // TARGET TYPE
    // ========================================================

    if (
      name ===
      "target_type"
    ) {
      setForm(
        (previous) => ({
          ...previous,
          target_type: value,
        }),
      );

      if (
        value ===
        "WHOLE_CLASS"
      ) {
        setSelectedStudents([]);
        setStudentSearch("");
      }

      return;
    }

    // ========================================================
    // NORMAL FIELDS
    // ========================================================

    setForm(
      (previous) => ({
        ...previous,
        [name]:
          type ===
          "checkbox"
            ? checked
            : value,
      }),
    );
  };

  // ==========================================================
  // TOGGLE STUDENT
  // ==========================================================

  const toggleStudent = (
    studentId,
  ) => {
    if (
      studentId === null ||
      studentId === undefined
    ) {
      return;
    }

    const normalizedId =
      String(studentId);

    setSelectedStudents(
      (previous) => {
        const exists =
          previous.some(
            (id) =>
              String(id) ===
              normalizedId,
          );

        if (exists) {
          return previous.filter(
            (id) =>
              String(id) !==
              normalizedId,
          );
        }

        return [
          ...previous,
          studentId,
        ];
      },
    );
  };

  // ==========================================================
  // SELECT / DESELECT ALL
  // ==========================================================

  const toggleSelectAll = () => {
    const filteredIds =
      filteredStudents
        .map((student) =>
          getStudentId(
            student,
          ),
        )
        .filter(
          (id) =>
            id !== null &&
            id !== undefined,
        );

    if (!filteredIds.length) {
      return;
    }

    if (
      allFilteredStudentsSelected
    ) {
      const filteredIdSet =
        new Set(
          filteredIds.map(
            String,
          ),
        );

      setSelectedStudents(
        (previous) =>
          previous.filter(
            (id) =>
              !filteredIdSet.has(
                String(id),
              ),
          ),
      );

      return;
    }

    setSelectedStudents(
      (previous) => {
        const existing =
          new Set(
            previous.map(
              String,
            ),
          );

        const next = [
          ...previous,
        ];

        filteredIds.forEach(
          (id) => {
            if (
              !existing.has(
                String(id),
              )
            ) {
              next.push(id);
            }
          },
        );

        return next;
      },
    );
  };

  // ==========================================================
  // CLEAR SELECTED STUDENTS
  // ==========================================================

  const clearSelectedStudents =
    () => {
      setSelectedStudents([]);
    };

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateForm = () => {
    if (
      !resolvedSchoolId
    ) {
      return (
        "School is required. The system could not determine your school ID. " +
        "Please sign out and sign in again."
      );
    }

    if (
      !form.academic_session
    ) {
      return "Please select an academic session.";
    }

    if (!form.term) {
      return "Please select a term.";
    }

    if (!form.class_level) {
      return "Please select a class.";
    }

    if (!form.subject) {
      return "Please select a subject.";
    }

    if (!form.target_type) {
      return "Please select an assignment target.";
    }

    if (
      form.target_type ===
        "SELECTED_STUDENTS" &&
      selectedStudents.length ===
        0
    ) {
      return "Please select at least one student for a selected-students assignment.";
    }

    // Make sure every selected student is actually
    // in the currently displayed class list.
    if (
      form.target_type ===
      "SELECTED_STUDENTS"
    ) {
      const availableStudentIds =
        new Set(
          students
            .map(
              getStudentId,
            )
            .filter(
              (id) =>
                id !== null &&
                id !== undefined,
            )
            .map(String),
        );

      const invalidSelectedStudent =
        selectedStudents.some(
          (studentId) =>
            !availableStudentIds.has(
              String(
                studentId,
              ),
            ),
        );

      if (
        invalidSelectedStudent
      ) {
        return (
          "One or more selected students do not belong to the selected class."
        );
      }
    }

    if (!form.title.trim()) {
      return "Please enter the assignment title.";
    }

    if (!form.assigned_date) {
      return "Please select the assigned date.";
    }

    if (!form.due_date) {
      return "Please select the due date.";
    }

    const assignedDate =
      new Date(
        `${form.assigned_date}T00:00:00`,
      );

    const dueDate =
      new Date(
        form.due_date,
      );

    if (
      Number.isNaN(
        assignedDate.getTime(),
      )
    ) {
      return "Please enter a valid assigned date.";
    }

    if (
      Number.isNaN(
        dueDate.getTime(),
      )
    ) {
      return "Please enter a valid due date.";
    }

    if (
      dueDate <= assignedDate
    ) {
      return "The due date must be after the assigned date.";
    }

    const maximumScore =
      Number(
        form.maximum_score,
      );

    if (
      Number.isNaN(
        maximumScore,
      ) ||
      maximumScore <= 0
    ) {
      return "Maximum score must be greater than 0.";
    }

    return null;
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (
    event,
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(
        validationError,
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload =
        new FormData();

      // ======================================================
      // SCHOOL
      // ======================================================
      //
      // SCHOOL IS REQUIRED BY THE BACKEND.
      //
      // Unlike the previous version, we DO NOT omit it.
      //
      // ======================================================

      payload.append(
        "school",
        String(
          resolvedSchoolId,
        ),
      );

      // ======================================================
      // ACADEMIC CONTEXT
      // ======================================================

      payload.append(
        "academic_session",
        String(
          form.academic_session,
        ),
      );

      payload.append(
        "term",
        String(form.term),
      );

      payload.append(
        "class_level",
        String(
          form.class_level,
        ),
      );

      payload.append(
        "subject",
        String(form.subject),
      );

      // ======================================================
      // TARGET
      // ======================================================

      payload.append(
        "target_type",
        form.target_type,
      );

      if (
        form.target_type ===
        "SELECTED_STUDENTS"
      ) {
        selectedStudents.forEach(
          (studentId) => {
            payload.append(
              "target_students",
              String(
                studentId,
              ),
            );
          },
        );
      }

      // ======================================================
      // ASSIGNMENT DETAILS
      // ======================================================

      payload.append(
        "title",
        form.title.trim(),
      );

      payload.append(
        "instructions",
        form.instructions.trim(),
      );

      payload.append(
        "assigned_date",
        form.assigned_date,
      );

      payload.append(
        "due_date",
        new Date(
          form.due_date,
        ).toISOString(),
      );

      payload.append(
        "maximum_score",
        String(
          form.maximum_score,
        ),
      );

      payload.append(
        "allow_late_submission",
        form.allow_late_submission
          ? "true"
          : "false",
      );

      payload.append(
        "status",
        form.status,
      );

      if (form.attachment) {
        payload.append(
          "attachment",
          form.attachment,
        );
      }

      // ======================================================
      // PRINCIPAL ASSIGNMENT
      // ======================================================
      //
      // Teacher is intentionally NOT included.
      //
      // Principal assignments do not require a teacher.
      //
      // ======================================================

      const created =
        await assignmentsService.create(
          payload,
        );

      setSuccess(
        "Assignment created successfully.",
      );

      const createdId =
        created?.id ??
        created?.pk;

      setTimeout(() => {
        if (createdId) {
          navigate(
            `/principal/assignments/${createdId}`,
          );
        } else {
          navigate(
            "/principal/assignments",
          );
        }
      }, 700);
    } catch (err) {
      setError(
        formatApiError(err),
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[var(--color-background)]">
        <div className="flex items-center gap-3 text-[var(--color-secondary)]">
          <Loader2
            size={22}
            className="animate-spin"
          />

          <span>
            Loading assignment data...
          </span>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <button
            type="button"
            onClick={() =>
              navigate(
                "/principal/assignments",
              )
            }
            className="inline-flex items-center gap-2 text-sm text-[var(--color-secondary)] hover:text-[var(--color-text)] mb-3 transition"
          >
            <ArrowLeft
              size={17}
            />

            Back to Assignments
          </button>

          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Create Assignment
          </h1>

          <p className="mt-1 text-sm text-[var(--color-secondary)]">
            Create an assignment for a whole class
            or selected students.
          </p>
        </div>
      </div>

      {/* =====================================================
          SCHOOL STATUS
      ====================================================== */}

      {!resolvedSchoolId && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-medium">
                School information is unavailable.
              </p>

              <p className="mt-1 text-xs">
                Your account does not currently expose
                a school ID. Assignment creation will
                require a school ID.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ALERTS
      ====================================================== */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 whitespace-pre-line">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              {error}
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="ml-auto hover:opacity-70"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <div className="flex items-center gap-3">
            <CheckCircle
              size={19}
            />

            <span>
              {success}
            </span>
          </div>
        </div>
      )}

      {/* =====================================================
          FORM
      ====================================================== */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* ===================================================
            ACADEMIC INFORMATION
        ==================================================== */}

        <section className="rounded-2xl border border-[var(--color-secondary)]/20 bg-[var(--color-card)] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-secondary)]/15">
            <div className="flex items-center gap-3">
              <GraduationCap
                size={20}
                className="text-[var(--color-primary)]"
              />

              <div>
                <h2 className="font-semibold text-[var(--color-text)]">
                  Academic Information
                </h2>

                <p className="text-xs text-[var(--color-secondary)] mt-0.5">
                  Select the academic context for
                  this assignment.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* SESSION */}

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Academic Session
                <span className="text-red-500">
                  {" "}
                  *
                </span>
              </label>

              <select
                name="academic_session"
                value={
                  form.academic_session
                }
                onChange={
                  handleChange
                }
                className="w-full rounded-xl border border-[var(--color-secondary)]/30 bg-[var(--color-background)] text-[var(--color-text)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">
                  Select academic session
                </option>

                {availableSessions.map(
                  (session) => (
                    <option
                      key={getId(
                        session,
                      )}
                      value={getId(
                        session,
                      )}
                    >
                      {getName(
                        session,
                      ) ||
                        session?.session_name ||
                        session?.code ||
                        `Session ${getId(
                          session,
                        )}`}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* TERM */}

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Term
                <span className="text-red-500">
                  {" "}
                  *
                </span>
              </label>

              <select
                name="term"
                value={form.term}
                onChange={
                  handleChange
                }
                disabled={
                  !form.academic_session
                }
                className="w-full rounded-xl border border-[var(--color-secondary)]/30 bg-[var(--color-background)] text-[var(--color-text)] px-3 py-2.5 text-sm outline-none disabled:opacity-60 focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">
                  {!form.academic_session
                    ? "Select session first"
                    : "Select term"}
                </option>

                {availableTerms.map(
                  (term) => (
                    <option
                      key={getId(term)}
                      value={getId(term)}
                    >
                      {getName(term) ||
                        term?.term_name ||
                        term?.code ||
                        `Term ${getId(
                          term,
                        )}`}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* CLASS */}

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Class
                <span className="text-red-500">
                  {" "}
                  *
                </span>
              </label>

              <select
                name="class_level"
                value={
                  form.class_level
                }
                onChange={
                  handleChange
                }
                disabled={
                  !form.academic_session ||
                  !form.term
                }
                className="w-full rounded-xl border border-[var(--color-secondary)]/30 bg-[var(--color-background)] text-[var(--color-text)] px-3 py-2.5 text-sm outline-none disabled:opacity-60 focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">
                  {!form.academic_session ||
                  !form.term
                    ? "Select session and term first"
                    : "Select class"}
                </option>

                {availableClasses.map(
                  (classItem) => (
                    <option
                      key={getId(
                        classItem,
                      )}
                      value={getId(
                        classItem,
                      )}
                    >
                      {getName(
                        classItem,
                      ) ||
                        classItem?.code ||
                        `Class ${getId(
                          classItem,
                        )}`}
                    </option>
                  ),
                )}
              </select>
            </div>

            {/* SUBJECT */}

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Subject
                <span className="text-red-500">
                  {" "}
                  *
                </span>
              </label>

              <select
                name="subject"
                value={form.subject}
                onChange={
                  handleChange
                }
                disabled={
                  !form.class_level
                }
                className="w-full rounded-xl border border-[var(--color-secondary)]/30 bg-[var(--color-background)] text-[var(--color-text)] px-3 py-2.5 text-sm outline-none disabled:opacity-60 focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">
                  {!form.class_level
                    ? "Select class first"
                    : "Select subject"}
                </option>

                {availableSubjects.map(
                  (subject) => {
                    const classSubject =
                      selectedClassSubjects.find(
                        (item) =>
                          String(
                            getSubjectId(
                              item,
                            ),
                          ) ===
                          String(
                            getId(
                              subject,
                            ),
                          ),
                      );

                    const assignmentType =
                      getAssignmentType(
                        classSubject,
                      );

                    return (
                      <option
                        key={getId(
                          subject,
                        )}
                        value={getId(
                          subject,
                        )}
                      >
                        {getName(
                          subject,
                        )}

                        {assignmentType
                          ? ` — ${assignmentType}`
                          : ""}
                      </option>
                    );
                  },
                )}
              </select>
            </div>
          </div>
        </section>

        {/* ===================================================
            ASSIGNMENT TARGET
        ==================================================== */}

        <section className="rounded-2xl border border-[var(--color-secondary)]/20 bg-[var(--color-card)] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-secondary)]/15">
            <div className="flex items-center gap-3">
              <Users
                size={20}
                className="text-[var(--color-primary)]"
              />

              <div>
                <h2 className="font-semibold text-[var(--color-text)]">
                  Assignment Target
                </h2>

                <p className="text-xs text-[var(--color-secondary)] mt-0.5">
                  Choose who should receive this
                  assignment.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            {/* TARGET OPTIONS */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* WHOLE CLASS */}

              <label
                className={`relative cursor-pointer rounded-xl border p-4 transition ${
                  form.target_type ===
                  "WHOLE_CLASS"
                    ? "border-[var(--color-primary)] bg-[var(--color-background)] ring-2 ring-[var(--color-primary)]/20"
                    : "border-[var(--color-secondary)]/20 hover:border-[var(--color-primary)]/40"
                }`}
              >
                <input
                  type="radio"
                  name="target_type"
                  value="WHOLE_CLASS"
                  checked={
                    form.target_type ===
                    "WHOLE_CLASS"
                  }
                  onChange={
                    handleChange
                  }
                  className="sr-only"
                />

                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 h-9 w-9 rounded-lg flex items-center justify-center ${
                      form.target_type ===
                      "WHOLE_CLASS"
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[var(--color-background)] text-[var(--color-secondary)]"
                    }`}
                  >
                    <Users
                      size={18}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-sm text-[var(--color-text)]">
                        Whole Class
                      </h3>

                      {form.target_type ===
                        "WHOLE_CLASS" && (
                        <CheckCircle
                          size={18}
                          className="text-[var(--color-primary)]"
                        />
                      )}
                    </div>

                    <p className="mt-1 text-xs text-[var(--color-secondary)] leading-5">
                      Every eligible student in the
                      selected class will receive the
                      assignment.
                    </p>
                  </div>
                </div>
              </label>

              {/* SELECTED STUDENTS */}

              <label
                className={`relative cursor-pointer rounded-xl border p-4 transition ${
                  form.target_type ===
                  "SELECTED_STUDENTS"
                    ? "border-[var(--color-primary)] bg-[var(--color-background)] ring-2 ring-[var(--color-primary)]/20"
                    : "border-[var(--color-secondary)]/20 hover:border-[var(--color-primary)]/40"
                }`}
              >
                <input
                  type="radio"
                  name="target_type"
                  value="SELECTED_STUDENTS"
                  checked={
                    form.target_type ===
                    "SELECTED_STUDENTS"
                  }
                  onChange={
                    handleChange
                  }
                  className="sr-only"
                />

                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 h-9 w-9 rounded-lg flex items-center justify-center ${
                      form.target_type ===
                      "SELECTED_STUDENTS"
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[var(--color-background)] text-[var(--color-secondary)]"
                    }`}
                  >
                    <UserCheck
                      size={18}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-sm text-[var(--color-text)]">
                        Selected Students
                      </h3>

                      {form.target_type ===
                        "SELECTED_STUDENTS" && (
                        <CheckCircle
                          size={18}
                          className="text-[var(--color-primary)]"
                        />
                      )}
                    </div>

                    <p className="mt-1 text-xs text-[var(--color-secondary)] leading-5">
                      Choose specific students from
                      the selected class.
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {/* WHOLE CLASS */}

            {form.target_type ===
              "WHOLE_CLASS" && (
              <div className="mt-5 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-background)] px-4 py-3">
                <div className="flex items-start gap-3">
                  <Users
                    size={18}
                    className="mt-0.5 text-[var(--color-primary)]"
                  />

                  <div>
                    <p className="font-medium text-sm text-[var(--color-text)]">
                      Whole-class assignment
                    </p>

                    <p className="mt-1 text-xs text-[var(--color-secondary)]">
                      All eligible students enrolled
                      in the selected class, session,
                      term, and subject will be able to
                      access this assignment when it is
                      published.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SELECTED STUDENTS */}

            {form.target_type ===
              "SELECTED_STUDENTS" && (
              <div className="mt-5 rounded-xl border border-[var(--color-secondary)]/20 overflow-hidden">
                {/* STUDENT HEADER */}

                <div className="p-4 bg-[var(--color-background)] border-b border-[var(--color-secondary)]/15">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-sm text-[var(--color-text)]">
                        Select Students
                      </h3>

                      <p className="text-xs text-[var(--color-secondary)] mt-1">
                        {selectedStudents.length}{" "}
                        selected{" "}
                        {students.length
                          ? `of ${students.length}`
                          : ""}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      {/* SEARCH */}

                      <div className="relative">
                        <Search
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)]"
                        />

                        <input
                          type="text"
                          value={
                            studentSearch
                          }
                          onChange={(
                            event,
                          ) =>
                            setStudentSearch(
                              event
                                .target
                                .value,
                            )
                          }
                          placeholder="Search students..."
                          className="w-full sm:w-64 rounded-lg border border-[var(--color-secondary)]/30 bg-[var(--color-card)] text-[var(--color-text)] pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        />
                      </div>

                      {/* SELECT VISIBLE */}

                      <button
                        type="button"
                        onClick={
                          toggleSelectAll
                        }
                        disabled={
                          loadingStudents ||
                          filteredStudents.length ===
                            0
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-secondary)]/30 bg-[var(--color-card)] px-3 py-2 text-sm font-medium text-[var(--color-text)] hover:opacity-80 disabled:opacity-50"
                      >
                        {allFilteredStudentsSelected ? (
                          <>
                            <X
                              size={15}
                            />

                            Clear Visible
                          </>
                        ) : (
                          <>
                            <Check
                              size={15}
                            />

                            Select Visible
                          </>
                        )}
                      </button>

                      {/* CLEAR ALL */}

                      {selectedStudents.length >
                        0 && (
                        <button
                          type="button"
                          onClick={
                            clearSelectedStudents
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-[var(--color-card)] px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          <X
                            size={15}
                          />

                          Clear All
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* STUDENT LIST */}

                <div className="max-h-[420px] overflow-y-auto">
                  {loadingStudents ? (
                    <div className="flex items-center justify-center py-12 text-sm text-[var(--color-secondary)]">
                      <Loader2
                        size={20}
                        className="animate-spin mr-2"
                      />

                      Loading students in the
                      selected class...
                    </div>
                  ) : !form.class_level ||
                    !form.academic_session ||
                    !form.term ? (
                    <div className="py-12 px-5 text-center">
                      <Users
                        size={28}
                        className="mx-auto text-[var(--color-secondary)] mb-2"
                      />

                      <p className="text-sm font-medium text-[var(--color-text)]">
                        Select the academic session,
                        term, and class first.
                      </p>

                      <p className="text-xs text-[var(--color-secondary)] mt-1">
                        Only students enrolled in that
                        class will appear here.
                      </p>
                    </div>
                  ) : filteredStudents.length ===
                    0 ? (
                    <div className="py-12 px-5 text-center">
                      <Users
                        size={28}
                        className="mx-auto text-[var(--color-secondary)] mb-2"
                      />

                      <p className="text-sm font-medium text-[var(--color-text)]">
                        {studentSearch
                          ? "No students match your search."
                          : "No students are enrolled in this class for the selected academic period."}
                      </p>

                      <p className="text-xs text-[var(--color-secondary)] mt-1">
                        The list is filtered by the
                        selected session, term, and class.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--color-secondary)]/10">
                      {filteredStudents.map(
                        (student) => {
                          const studentId =
                            getStudentId(
                              student,
                            );

                          const isSelected =
                            selectedStudentIdSet.has(
                              String(
                                studentId,
                              ),
                            );

                          return (
                            <button
                              type="button"
                              key={
                                studentId
                              }
                              onClick={() =>
                                toggleStudent(
                                  studentId,
                                )
                              }
                              className={`w-full text-left px-4 py-3 flex items-center gap-3 transition ${
                                isSelected
                                  ? "bg-[var(--color-background)]"
                                  : "bg-[var(--color-card)] hover:bg-[var(--color-background)]"
                              }`}
                            >
                              {/* CHECKBOX */}

                              <div
                                className={`h-5 w-5 shrink-0 rounded border flex items-center justify-center ${
                                  isSelected
                                    ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                                    : "border-[var(--color-secondary)]/40 bg-[var(--color-card)]"
                                }`}
                              >
                                {isSelected && (
                                  <Check
                                    size={
                                      14
                                    }
                                  />
                                )}
                              </div>

                              {/* AVATAR */}

                              <div className="h-9 w-9 shrink-0 rounded-full bg-[var(--color-background)] flex items-center justify-center">
                                <Users
                                  size={16}
                                  className="text-[var(--color-secondary)]"
                                />
                              </div>

                              {/* DETAILS */}

                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-[var(--color-text)] truncate">
                                  {getStudentName(
                                    student,
                                  )}
                                </p>

                                <p className="text-xs text-[var(--color-secondary)] truncate">
                                  {getStudentAdmissionNumber(
                                    student,
                                  ) ||
                                    "No admission number"}
                                </p>
                              </div>

                              {isSelected && (
                                <span className="text-xs font-medium text-[var(--color-primary)]">
                                  Selected
                                </span>
                              )}
                            </button>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ===================================================
            ASSIGNMENT DETAILS
        ==================================================== */}

        <section className="rounded-2xl border border-[var(--color-secondary)]/20 bg-[var(--color-card)] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-secondary)]/15">
            <div className="flex items-center gap-3">
              <FileText
                size={20}
                className="text-[var(--color-primary)]"
              />

              <div>
                <h2 className="font-semibold text-[var(--color-text)]">
                  Assignment Details
                </h2>

                <p className="text-xs text-[var(--color-secondary)] mt-0.5">
                  Enter the assignment instructions,
                  dates, and grading settings.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* TITLE */}

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Assignment Title
                <span className="text-red-500">
                  {" "}
                  *
                </span>
              </label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={
                  handleChange
                }
                placeholder="e.g. First Term Mathematics Assignment"
                className="w-full rounded-xl border border-[var(--color-secondary)]/30 bg-[var(--color-background)] text-[var(--color-text)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            {/* INSTRUCTIONS */}

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Instructions
              </label>

              <textarea
                name="instructions"
                value={
                  form.instructions
                }
                onChange={
                  handleChange
                }
                rows={6}
                placeholder="Enter the assignment instructions..."
                className="w-full rounded-xl border border-[var(--color-secondary)]/30 bg-[var(--color-background)] text-[var(--color-text)] px-3 py-3 text-sm outline-none resize-y focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            {/* DATES */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* ASSIGNED DATE */}

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Assigned Date
                  <span className="text-red-500">
                    {" "}
                    *
                  </span>
                </label>

                <input
                  type="date"
                  name="assigned_date"
                  value={
                    form.assigned_date
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-[var(--color-secondary)]/30 bg-[var(--color-background)] text-[var(--color-text)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              {/* DUE DATE */}

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Due Date
                  <span className="text-red-500">
                    {" "}
                    *
                  </span>
                </label>

                <input
                  type="datetime-local"
                  name="due_date"
                  value={
                    form.due_date
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-[var(--color-secondary)]/30 bg-[var(--color-background)] text-[var(--color-text)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>

            {/* SCORE + STATUS */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* MAXIMUM SCORE */}

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Maximum Score
                  <span className="text-red-500">
                    {" "}
                    *
                  </span>
                </label>

                <input
                  type="number"
                  name="maximum_score"
                  value={
                    form.maximum_score
                  }
                  onChange={
                    handleChange
                  }
                  min="1"
                  step="0.01"
                  className="w-full rounded-xl border border-[var(--color-secondary)]/30 bg-[var(--color-background)] text-[var(--color-text)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              {/* STATUS */}

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Status
                </label>

                <select
                  name="status"
                  value={
                    form.status
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-[var(--color-secondary)]/30 bg-[var(--color-background)] text-[var(--color-text)] px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="PUBLISHED">
                    Published
                  </option>

                  <option value="DRAFT">
                    Draft
                  </option>
                </select>
              </div>
            </div>

            {/* LATE SUBMISSION */}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="allow_late_submission"
                checked={
                  form.allow_late_submission
                }
                onChange={
                  handleChange
                }
                className="mt-1 h-4 w-4 rounded border-[var(--color-secondary)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />

              <span>
                <span className="block text-sm font-medium text-[var(--color-text)]">
                  Allow late submissions
                </span>

                <span className="block text-xs text-[var(--color-secondary)] mt-1">
                  Students will be allowed to submit
                  after the due date.
                </span>
              </span>
            </label>

            {/* ATTACHMENT */}

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Attachment
              </label>

              <input
                type="file"
                name="attachment"
                onChange={
                  handleChange
                }
                className="block w-full text-sm text-[var(--color-secondary)] file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--color-background)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[var(--color-text)]"
              />

              {fileName && (
                <p className="mt-2 text-xs text-[var(--color-secondary)]">
                  Selected file:{" "}
                  <span className="font-medium text-[var(--color-text)]">
                    {fileName}
                  </span>
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ===================================================
            SUMMARY
        ==================================================== */}

        <section className="rounded-2xl border border-[var(--color-primary)]/20 bg-[var(--color-background)] px-5 py-4">
          <div className="flex items-start gap-3">
            <CheckCircle
              size={20}
              className="mt-0.5 text-[var(--color-primary)]"
            />

            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[var(--color-text)]">
                Assignment Summary
              </h3>

              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-[var(--color-secondary)]">
                <div>
                  <span className="font-medium text-[var(--color-text)]">
                    Target:
                  </span>{" "}
                  {form.target_type ===
                  "SELECTED_STUDENTS"
                    ? `${selectedStudents.length} selected student${
                        selectedStudents.length ===
                        1
                          ? ""
                          : "s"
                      }`
                    : "Whole class"}
                </div>

                <div>
                  <span className="font-medium text-[var(--color-text)]">
                    Class Students:
                  </span>{" "}
                  {students.length}
                </div>

                <div>
                  <span className="font-medium text-[var(--color-text)]">
                    Status:
                  </span>{" "}
                  {form.status ===
                  "PUBLISHED"
                    ? "Published"
                    : "Draft"}
                </div>

                <div>
                  <span className="font-medium text-[var(--color-text)]">
                    Maximum Score:
                  </span>{" "}
                  {form.maximum_score ||
                    "0"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            ACTIONS
        ==================================================== */}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          {/* CANCEL */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/principal/assignments",
              )
            }
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-secondary)]/30 bg-[var(--color-card)] px-5 py-2.5 text-sm font-medium text-[var(--color-text)] hover:opacity-80 disabled:opacity-50"
          >
            Cancel
          </button>

          {/* CREATE */}

          <button
            type="submit"
            disabled={
              submitting ||
              !resolvedSchoolId
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Creating...
              </>
            ) : (
              <>
                <Save
                  size={18}
                />

                Create Assignment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}