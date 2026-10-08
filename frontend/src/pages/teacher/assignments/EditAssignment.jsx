// import { useEffect, useMemo, useState } from "react";
// import {
//   useNavigate,
//   useParams,
// } from "react-router-dom";

// import {
//   AlertCircle,
//   ArrowLeft,
//   Calendar,
//   CheckCircle,
//   FileText,
//   Loader2,
//   Paperclip,
//   Save,
//   Trash2,
// } from "lucide-react";

// import api from "../../../services/api";
// import assignmentsService from "../../../services/assignmentsService";

// // ============================================================
// // HELPERS
// // ============================================================

// const getApiError = (error, fallback = "Something went wrong.") => {
//   const data = error?.response?.data;

//   if (!data) {
//     return fallback;
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
//     for (const value of Object.values(data)) {
//       if (Array.isArray(value) && value.length > 0) {
//         return String(value[0]);
//       }

//       if (typeof value === "string") {
//         return value;
//       }

//       if (
//         value &&
//         typeof value === "object"
//       ) {
//         for (const nestedValue of Object.values(value)) {
//           if (
//             Array.isArray(nestedValue) &&
//             nestedValue.length > 0
//           ) {
//             return String(nestedValue[0]);
//           }

//           if (
//             typeof nestedValue === "string"
//           ) {
//             return nestedValue;
//           }
//         }
//       }
//     }
//   }

//   return fallback;
// };

// const extractResults = (data) => {
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
//   "";

// const getName = (item) =>
//   item?.name ??
//   item?.title ??
//   item?.label ??
//   item?.session_name ??
//   item?.term_name ??
//   item?.class_name ??
//   item?.subject_name ??
//   "";

// const getNestedId = (
//   value,
// ) => {
//   if (
//     value &&
//     typeof value === "object"
//   ) {
//     return (
//       value.id ??
//       value.pk ??
//       value.value ??
//       ""
//     );
//   }

//   return value ?? "";
// };

// const formatDateTimeForInput = (value) => {
//   if (!value) {
//     return "";
//   }

//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) {
//     return "";
//   }

//   const pad = (number) =>
//     String(number).padStart(2, "0");

//   return `${date.getFullYear()}-${pad(
//     date.getMonth() + 1,
//   )}-${pad(date.getDate())}T${pad(
//     date.getHours(),
//   )}:${pad(date.getMinutes())}`;
// };

// // ============================================================
// // ACADEMIC ENDPOINTS
// // ============================================================

// const ACADEMIC_ENDPOINTS = {
//   sessions: "/academic-sessions/",
//   terms: "/terms/",
//   classes: "/class-levels/",
//   subjects: "/subjects/",
// };

// // ============================================================
// // FORM COMPONENTS
// // ============================================================

// function FieldLabel({
//   children,
//   required = false,
// }) {
//   return (
//     <label className="mb-2 block text-sm font-semibold text-slate-700">
//       {children}

//       {required && (
//         <span className="ml-1 text-red-500">
//           *
//         </span>
//       )}
//     </label>
//   );
// }

// function Input({
//   className = "",
//   ...props
// }) {
//   return (
//     <input
//       {...props}
//       className={`w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-purple-100 ${className}`}
//     />
//   );
// }

// function Select({
//   className = "",
//   children,
//   ...props
// }) {
//   return (
//     <select
//       {...props}
//       className={`w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-purple-100 ${className}`}
//     >
//       {children}
//     </select>
//   );
// }

// function Textarea({
//   className = "",
//   ...props
// }) {
//   return (
//     <textarea
//       {...props}
//       className={`min-h-32 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-purple-100 ${className}`}
//     />
//   );
// }

// // ============================================================
// // COMPONENT
// // ============================================================

// export default function EditAssignment() {
//   const navigate = useNavigate();
//   const { id } = useParams();

//   // ----------------------------------------------------------
//   // DATA
//   // ----------------------------------------------------------

//   const [assignment, setAssignment] =
//     useState(null);

//   const [sessions, setSessions] =
//     useState([]);

//   const [terms, setTerms] =
//     useState([]);

//   const [classes, setClasses] =
//     useState([]);

//   const [subjects, setSubjects] =
//     useState([]);

//   // ----------------------------------------------------------
//   // LOADING
//   // ----------------------------------------------------------

//   const [loadingPage, setLoadingPage] =
//     useState(true);

//   const [saving, setSaving] =
//     useState(false);

//   const [deleting, setDeleting] =
//     useState(false);

//   // ----------------------------------------------------------
//   // UI
//   // ----------------------------------------------------------

//   const [error, setError] =
//     useState("");

//   const [success, setSuccess] =
//     useState("");

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
//     assigned_date: "",
//     due_date: "",
//     maximum_score: "100",
//     allow_late_submission: false,
//     status: "DRAFT",
//     attachment: null,
//   });

//   const [existingAttachment, setExistingAttachment] =
//     useState("");

//   // ----------------------------------------------------------
//   // LOAD ASSIGNMENT + ACADEMIC DATA
//   // ----------------------------------------------------------

//   useEffect(() => {
//     let mounted = true;

//     const loadData = async () => {
//       if (!id) {
//         setError(
//           "Assignment ID is missing.",
//         );

//         setLoadingPage(false);
//         return;
//       }

//       setLoadingPage(true);
//       setError("");

//       try {
//         const [
//           assignmentResponse,
//           sessionsResponse,
//           termsResponse,
//           classesResponse,
//           subjectsResponse,
//         ] = await Promise.all([
//           assignmentsService.getById(id),
//           api.get(ACADEMIC_ENDPOINTS.sessions),
//           api.get(ACADEMIC_ENDPOINTS.terms),
//           api.get(ACADEMIC_ENDPOINTS.classes),
//           api.get(ACADEMIC_ENDPOINTS.subjects),
//         ]);

//         if (!mounted) {
//           return;
//         }

//         const assignmentData =
//           assignmentResponse;

//         setAssignment(
//           assignmentData,
//         );

//         setSessions(
//           extractResults(
//             sessionsResponse.data,
//           ),
//         );

//         setTerms(
//           extractResults(
//             termsResponse.data,
//           ),
//         );

//         setClasses(
//           extractResults(
//             classesResponse.data,
//           ),
//         );

//         setSubjects(
//           extractResults(
//             subjectsResponse.data,
//           ),
//         );

//         setForm({
//           academic_session:
//             getNestedId(
//               assignmentData?.academic_session,
//             ),

//           term:
//             getNestedId(
//               assignmentData?.term,
//             ),

//           class_level:
//             getNestedId(
//               assignmentData?.class_level,
//             ),

//           subject:
//             getNestedId(
//               assignmentData?.subject,
//             ),

//           title:
//             assignmentData?.title ??
//             "",

//           instructions:
//             assignmentData?.instructions ??
//             "",

//           assigned_date:
//             formatDateTimeForInput(
//               assignmentData?.assigned_date,
//             ),

//           due_date:
//             formatDateTimeForInput(
//               assignmentData?.due_date,
//             ),

//           maximum_score:
//             assignmentData?.maximum_score ??
//             "100",

//           allow_late_submission:
//             Boolean(
//               assignmentData?.allow_late_submission,
//             ),

//           status:
//             assignmentData?.status ??
//             "DRAFT",

//           attachment: null,
//         });

//         setExistingAttachment(
//           assignmentData?.attachment ??
//             "",
//         );
//       } catch (requestError) {
//         if (!mounted) {
//           return;
//         }

//         setError(
//           getApiError(
//             requestError,
//             "Unable to load assignment.",
//           ),
//         );
//       } finally {
//         if (mounted) {
//           setLoadingPage(false);
//         }
//       }
//     };

//     loadData();

//     return () => {
//       mounted = false;
//     };
//   }, [id]);

//   // ----------------------------------------------------------
//   // NORMALIZED OPTIONS
//   // ----------------------------------------------------------

//   const normalizedSessions = useMemo(
//     () =>
//       sessions.map((item) => ({
//         ...item,
//         optionId: getId(item),
//         optionName: getName(item),
//       })),
//     [sessions],
//   );

//   const normalizedTerms = useMemo(
//     () =>
//       terms.map((item) => ({
//         ...item,
//         optionId: getId(item),
//         optionName: getName(item),
//       })),
//     [terms],
//   );

//   const normalizedClasses = useMemo(
//     () =>
//       classes.map((item) => ({
//         ...item,
//         optionId: getId(item),
//         optionName: getName(item),
//       })),
//     [classes],
//   );

//   const normalizedSubjects = useMemo(
//     () =>
//       subjects.map((item) => ({
//         ...item,
//         optionId: getId(item),
//         optionName: getName(item),
//       })),
//     [subjects],
//   );

//   // ----------------------------------------------------------
//   // INPUT
//   // ----------------------------------------------------------

//   const handleChange = (event) => {
//     const {
//       name,
//       value,
//       type,
//       checked,
//       files,
//     } = event.target;

//     if (type === "file") {
//       setForm((previous) => ({
//         ...previous,
//         attachment:
//           files?.[0] || null,
//       }));

//       setError("");
//       setSuccess("");

//       return;
//     }

//     setForm((previous) => ({
//       ...previous,
//       [name]:
//         type === "checkbox"
//           ? checked
//           : value,
//     }));

//     setError("");
//     setSuccess("");
//   };

//   // ----------------------------------------------------------
//   // VALIDATION
//   // ----------------------------------------------------------

//   const validateForm = () => {
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

//     if (!form.instructions.trim()) {
//       return "Please enter assignment instructions.";
//     }

//     if (!form.assigned_date) {
//       return "Please select the assigned date.";
//     }

//     if (!form.due_date) {
//       return "Please select the due date.";
//     }

//     const assignedDate = new Date(
//       form.assigned_date,
//     );

//     const dueDate = new Date(
//       form.due_date,
//     );

//     if (
//       Number.isNaN(
//         assignedDate.getTime(),
//       ) ||
//       Number.isNaN(
//         dueDate.getTime(),
//       )
//     ) {
//       return "Please enter valid assignment dates.";
//     }

//     if (dueDate < assignedDate) {
//       return "The due date cannot be earlier than the assigned date.";
//     }

//     const maximumScore = Number(
//       form.maximum_score,
//     );

//     if (
//       !Number.isFinite(maximumScore) ||
//       maximumScore <= 0
//     ) {
//       return "Maximum score must be greater than 0.";
//     }

//     return "";
//   };

//   // ----------------------------------------------------------
//   // SAVE
//   // ----------------------------------------------------------

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

//     setSaving(true);

//     try {
//       const payload = new FormData();

//       payload.append(
//         "academic_session",
//         form.academic_session,
//       );

//       payload.append(
//         "term",
//         form.term,
//       );

//       payload.append(
//         "class_level",
//         form.class_level,
//       );

//       payload.append(
//         "subject",
//         form.subject,
//       );

//       payload.append(
//         "title",
//         form.title.trim(),
//       );

//       payload.append(
//         "instructions",
//         form.instructions.trim(),
//       );

//       payload.append(
//         "assigned_date",
//         form.assigned_date,
//       );

//       payload.append(
//         "due_date",
//         form.due_date,
//       );

//       payload.append(
//         "maximum_score",
//         form.maximum_score,
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

//       const updated =
//         await assignmentsService.update(
//           id,
//           payload,
//         );

//       setAssignment(
//         updated || assignment,
//       );

//       if (
//         updated?.attachment
//       ) {
//         setExistingAttachment(
//           updated.attachment,
//         );
//       }

//       setForm((previous) => ({
//         ...previous,
//         attachment: null,
//       }));

//       setSuccess(
//         "Assignment updated successfully.",
//       );

//       window.scrollTo({
//         top: 0,
//         behavior: "smooth",
//       });
//     } catch (requestError) {
//       setError(
//         getApiError(
//           requestError,
//           "Unable to update assignment.",
//         ),
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ----------------------------------------------------------
//   // DELETE
//   // ----------------------------------------------------------

//   const handleDelete = async () => {
//     const confirmed =
//       window.confirm(
//         "Are you sure you want to delete this assignment? This action cannot be undone.",
//       );

//     if (!confirmed) {
//       return;
//     }

//     setDeleting(true);
//     setError("");

//     try {
//       await assignmentsService.remove(
//         id,
//       );

//       navigate("../");
//     } catch (requestError) {
//       setError(
//         getApiError(
//           requestError,
//           "Unable to delete assignment.",
//         ),
//       );

//       setDeleting(false);
//     }
//   };

//   // ----------------------------------------------------------
//   // LOADING SCREEN
//   // ----------------------------------------------------------

//   if (loadingPage) {
//     return (
//       <div className="min-h-full bg-slate-50 p-4 md:p-6">
//         <div className="mx-auto flex min-h-96 max-w-5xl items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
//           <div className="flex flex-col items-center gap-3 text-slate-500">
//             <Loader2
//               size={34}
//               className="animate-spin"
//             />

//             <span className="text-sm">
//               Loading assignment...
//             </span>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ----------------------------------------------------------
//   // RENDER
//   // ----------------------------------------------------------

//   return (
//     <div className="min-h-full bg-slate-50 p-4 md:p-6">
//       <div className="mx-auto max-w-5xl">
//         {/* HEADER */}

//         <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
//           <div>
//             <button
//               type="button"
//               onClick={() =>
//                 navigate(
//                   `/teacher/assignments/${id}`,
//                 )
//               }
//               className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
//             >
//               <ArrowLeft size={17} />
//               Back to Assignment
//             </button>

//             <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
//               Edit Assignment
//             </h1>

//             <p className="mt-1 text-sm text-slate-500">
//               Update the assignment details below.
//             </p>
//           </div>

//           <button
//             type="button"
//             onClick={handleDelete}
//             disabled={
//               deleting || saving
//             }
//             className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             {deleting ? (
//               <Loader2
//                 size={17}
//                 className="animate-spin"
//               />
//             ) : (
//               <Trash2 size={17} />
//             )}

//             Delete Assignment
//           </button>
//         </div>

//         {/* ALERTS */}

//         {error && (
//           <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
//             <AlertCircle
//               size={20}
//               className="mt-0.5 shrink-0"
//             />

//             <div>{error}</div>
//           </div>
//         )}

//         {success && (
//           <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
//             <CheckCircle
//               size={20}
//               className="mt-0.5 shrink-0"
//             />

//             <div>{success}</div>
//           </div>
//         )}

//         {/* CURRENT ASSIGNMENT */}

//         {assignment && (
//           <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//             <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//               <div>
//                 <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
//                   Assignment
//                 </p>

//                 <h2 className="mt-1 text-lg font-bold text-slate-900">
//                   {assignment.title}
//                 </h2>
//               </div>

//               {assignment.status && (
//                 <span
//                   className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${
//                     assignment.status ===
//                     "PUBLISHED"
//                       ? "bg-emerald-100 text-emerald-700"
//                       : assignment.status ===
//                         "CLOSED"
//                       ? "bg-slate-200 text-slate-700"
//                       : "bg-amber-100 text-amber-700"
//                   }`}
//                 >
//                   {assignment.status}
//                 </span>
//               )}
//             </div>
//           </div>
//         )}

//         <form
//           onSubmit={handleSubmit}
//           className="space-y-6"
//         >
//           {/* ACADEMIC INFORMATION */}

//           <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
//             <div className="mb-5">
//               <h2 className="text-lg font-bold text-slate-900">
//                 Academic Information
//               </h2>

//               <p className="mt-1 text-sm text-slate-500">
//                 Select the academic session, term, class and subject.
//               </p>
//             </div>

//             <div className="grid gap-5 md:grid-cols-2">
//               <div>
//                 <FieldLabel required>
//                   Academic Session
//                 </FieldLabel>

//                 <Select
//                   name="academic_session"
//                   value={
//                     form.academic_session
//                   }
//                   onChange={handleChange}
//                   required
//                 >
//                   <option value="">
//                     Select academic session
//                   </option>

//                   {normalizedSessions.map(
//                     (item) => (
//                       <option
//                         key={item.optionId}
//                         value={item.optionId}
//                       >
//                         {item.optionName}
//                       </option>
//                     ),
//                   )}
//                 </Select>
//               </div>

//               <div>
//                 <FieldLabel required>
//                   Term
//                 </FieldLabel>

//                 <Select
//                   name="term"
//                   value={form.term}
//                   onChange={handleChange}
//                   required
//                 >
//                   <option value="">
//                     Select term
//                   </option>

//                   {normalizedTerms.map(
//                     (item) => (
//                       <option
//                         key={item.optionId}
//                         value={item.optionId}
//                       >
//                         {item.optionName}
//                       </option>
//                     ),
//                   )}
//                 </Select>
//               </div>

//               <div>
//                 <FieldLabel required>
//                   Class
//                 </FieldLabel>

//                 <Select
//                   name="class_level"
//                   value={
//                     form.class_level
//                   }
//                   onChange={handleChange}
//                   required
//                 >
//                   <option value="">
//                     Select class
//                   </option>

//                   {normalizedClasses.map(
//                     (item) => (
//                       <option
//                         key={item.optionId}
//                         value={item.optionId}
//                       >
//                         {item.optionName}
//                       </option>
//                     ),
//                   )}
//                 </Select>
//               </div>

//               <div>
//                 <FieldLabel required>
//                   Subject
//                 </FieldLabel>

//                 <Select
//                   name="subject"
//                   value={form.subject}
//                   onChange={handleChange}
//                   required
//                 >
//                   <option value="">
//                     Select subject
//                   </option>

//                   {normalizedSubjects.map(
//                     (item) => (
//                       <option
//                         key={item.optionId}
//                         value={item.optionId}
//                       >
//                         {item.optionName}
//                       </option>
//                     ),
//                   )}
//                 </Select>
//               </div>
//             </div>
//           </section>

//           {/* ASSIGNMENT INFORMATION */}

//           <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
//             <div className="mb-5">
//               <h2 className="text-lg font-bold text-slate-900">
//                 Assignment Information
//               </h2>

//               <p className="mt-1 text-sm text-slate-500">
//                 Update the assignment title and instructions.
//               </p>
//             </div>

//             <div className="space-y-5">
//               <div>
//                 <FieldLabel required>
//                   Assignment Title
//                 </FieldLabel>

//                 <Input
//                   type="text"
//                   name="title"
//                   value={form.title}
//                   onChange={handleChange}
//                   placeholder="Assignment title"
//                   maxLength={255}
//                   required
//                 />
//               </div>

//               <div>
//                 <FieldLabel required>
//                   Instructions
//                 </FieldLabel>

//                 <Textarea
//                   name="instructions"
//                   value={
//                     form.instructions
//                   }
//                   onChange={handleChange}
//                   placeholder="Enter assignment instructions..."
//                   required
//                 />
//               </div>
//             </div>
//           </section>

//           {/* SCHEDULE */}

//           <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
//             <div className="mb-5">
//               <h2 className="text-lg font-bold text-slate-900">
//                 Schedule & Scoring
//               </h2>

//               <p className="mt-1 text-sm text-slate-500">
//                 Update dates, score and submission settings.
//               </p>
//             </div>

//             <div className="grid gap-5 md:grid-cols-2">
//               <div>
//                 <FieldLabel required>
//                   Assigned Date
//                 </FieldLabel>

//                 <div className="relative">
//                   <Calendar
//                     size={18}
//                     className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                   />

//                   <Input
//                     type="datetime-local"
//                     name="assigned_date"
//                     value={
//                       form.assigned_date
//                     }
//                     onChange={handleChange}
//                     className="pl-10"
//                     required
//                   />
//                 </div>
//               </div>

//               <div>
//                 <FieldLabel required>
//                   Due Date
//                 </FieldLabel>

//                 <div className="relative">
//                   <Calendar
//                     size={18}
//                     className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                   />

//                   <Input
//                     type="datetime-local"
//                     name="due_date"
//                     value={form.due_date}
//                     onChange={handleChange}
//                     className="pl-10"
//                     required
//                   />
//                 </div>
//               </div>

//               <div>
//                 <FieldLabel required>
//                   Maximum Score
//                 </FieldLabel>

//                 <Input
//                   type="number"
//                   name="maximum_score"
//                   value={
//                     form.maximum_score
//                   }
//                   onChange={handleChange}
//                   min="0.01"
//                   step="0.01"
//                   required
//                 />
//               </div>

//               <div>
//                 <FieldLabel>
//                   Status
//                 </FieldLabel>

//                 <Select
//                   name="status"
//                   value={form.status}
//                   onChange={handleChange}
//                 >
//                   <option value="DRAFT">
//                     Draft
//                   </option>

//                   <option value="PUBLISHED">
//                     Published
//                   </option>

//                   <option value="CLOSED">
//                     Closed
//                   </option>
//                 </Select>
//               </div>
//             </div>

//             <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
//               <label className="flex cursor-pointer items-start gap-3">
//                 <input
//                   type="checkbox"
//                   name="allow_late_submission"
//                   checked={
//                     form.allow_late_submission
//                   }
//                   onChange={handleChange}
//                   className="mt-1 h-4 w-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-purple-200"
//                 />

//                 <span>
//                   <span className="block text-sm font-semibold text-slate-800">
//                     Allow late submissions
//                   </span>

//                   <span className="mt-1 block text-xs text-slate-500">
//                     Students can submit after the due date when enabled.
//                   </span>
//                 </span>
//               </label>
//             </div>
//           </section>

//           {/* ATTACHMENT */}

//           <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
//             <div className="mb-5">
//               <h2 className="text-lg font-bold text-slate-900">
//                 Attachment
//               </h2>

//               <p className="mt-1 text-sm text-slate-500">
//                 Replace the existing attachment or keep it unchanged.
//               </p>
//             </div>

//             {existingAttachment && (
//               <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
//                 <div className="flex min-w-0 items-center gap-3">
//                   <div className="rounded-lg bg-white p-2 shadow-sm">
//                     <FileText
//                       size={20}
//                       className="text-slate-500"
//                     />
//                   </div>

//                   <div className="min-w-0">
//                     <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
//                       Current attachment
//                     </p>

//                     <p className="truncate text-sm font-medium text-slate-700">
//                       Existing assignment file
//                     </p>
//                   </div>
//                 </div>

//                 <a
//                   href={
//                     existingAttachment
//                   }
//                   target="_blank"
//                   rel="noreferrer"
//                   className="sm:ml-auto inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
//                 >
//                   Open File
//                 </a>
//               </div>
//             )}

//             <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-purple-400 hover:bg-purple-50">
//               <Paperclip
//                 size={28}
//                 className="mb-3 text-slate-400"
//               />

//               <span className="text-sm font-semibold text-slate-700">
//                 {form.attachment
//                   ? form.attachment.name
//                   : "Choose a new attachment"}
//               </span>

//               <span className="mt-1 text-xs text-slate-500">
//                 Selecting a file will replace the existing attachment.
//               </span>

//               <input
//                 type="file"
//                 name="attachment"
//                 onChange={handleChange}
//                 className="hidden"
//               />
//             </label>

//             {form.attachment && (
//               <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
//                 <FileText size={16} />

//                 <span className="truncate">
//                   {form.attachment.name}
//                 </span>

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setForm((previous) => ({
//                       ...previous,
//                       attachment: null,
//                     }))
//                   }
//                   className="ml-auto text-xs font-semibold text-red-600 hover:text-red-700"
//                 >
//                   Remove
//                 </button>
//               </div>
//             )}
//           </section>

//           {/* ACTIONS */}

//           <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
//             <button
//               type="button"
//               onClick={() =>
//                 navigate(
//                   `/teacher/assignments/${id}`,
//                 )
//               }
//               disabled={
//                 saving || deleting
//               }
//               className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={
//                 saving || deleting
//               }
//               className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 text-sm font-semibold text-white shadow-lg shadow-purple-900/10 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
//             >
//               {saving ? (
//                 <>
//                   <Loader2
//                     size={18}
//                     className="animate-spin"
//                   />

//                   Saving...
//                 </>
//               ) : (
//                 <>
//                   <Save size={18} />

//                   Save Changes
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  FileText,
  Loader2,
  Paperclip,
  Save,
} from "lucide-react";

import api from "../../../services/api";
import assignmentsService from "../../../services/assignmentsService";

// ============================================================
// ENDPOINTS
// ============================================================

const ACADEMIC_ENDPOINTS = {
  sessions: "/academics/sessions/",
  terms: "/academics/terms/",
  classes: "/academics/class-levels/",
  subjects: "/academics/subjects/",
};

// ============================================================
// HELPERS
// ============================================================

const getErrorMessage = (
  error,
  fallback = "Something went wrong.",
) => {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || fallback;
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

  if (Array.isArray(data)) {
    return data.join(", ");
  }

  const messages = [];

  Object.entries(data).forEach(([field, value]) => {
    if (Array.isArray(value)) {
      messages.push(
        `${field}: ${value.join(", ")}`,
      );
    } else if (
      typeof value === "object" &&
      value !== null
    ) {
      messages.push(
        `${field}: ${JSON.stringify(value)}`,
      );
    } else {
      messages.push(`${field}: ${value}`);
    }
  });

  return messages.length
    ? messages.join(" | ")
    : fallback;
};

const extractResults = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

const getId = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  if (typeof value === "object") {
    return String(value.id ?? "");
  }

  return String(value);
};

const getNestedId = (...values) => {
  for (const value of values) {
    const id = getId(value);

    if (id) {
      return id;
    }
  }

  return "";
};

// ============================================================
// DATE HELPERS
// ============================================================
//
// IMPORTANT:
//
// assigned_date = Django DateField
// Format required by backend:
// YYYY-MM-DD
//
// due_date = Django DateTimeField
// Format required by frontend datetime-local:
// YYYY-MM-DDTHH:mm
// ============================================================

const toDateInput = (value) => {
  if (!value) {
    return "";
  }

  const stringValue = String(value);

  // If backend already returns YYYY-MM-DD,
  // use it directly.
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      stringValue,
    )
  ) {
    return stringValue;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return stringValue.slice(0, 10);
  }

  // Use local date instead of UTC date.
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const toDateTimeLocal = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 16);
  }

  const local = new Date(
    date.getTime() -
      date.getTimezoneOffset() * 60000,
  );

  return local.toISOString().slice(0, 16);
};

// ============================================================
// COMPONENT
// ============================================================

export default function EditAssignment() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ----------------------------------------------------------
  // ACADEMIC DATA
  // ----------------------------------------------------------

  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // ----------------------------------------------------------
  // ASSIGNMENT
  // ----------------------------------------------------------

  const [assignment, setAssignment] =
    useState(null);

  // ----------------------------------------------------------
  // FORM
  // ----------------------------------------------------------

  const [form, setForm] = useState({
    academic_session: "",
    term: "",
    class_level: "",
    subject: "",

    title: "",
    instructions: "",

    // Date only
    assigned_date: "",

    // Date + time
    due_date: "",

    maximum_score: "100",
    allow_late_submission: false,

    status: "DRAFT",

    attachment: null,
  });

  // ----------------------------------------------------------
  // UI
  // ----------------------------------------------------------

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const [
          assignmentResponse,
          sessionsResponse,
          termsResponse,
          classesResponse,
          subjectsResponse,
        ] = await Promise.all([
          assignmentsService.getById(id),

          api.get(
            ACADEMIC_ENDPOINTS.sessions,
          ),

          api.get(
            ACADEMIC_ENDPOINTS.terms,
          ),

          api.get(
            ACADEMIC_ENDPOINTS.classes,
          ),

          api.get(
            ACADEMIC_ENDPOINTS.subjects,
          ),
        ]);

        if (!mounted) {
          return;
        }

        const assignmentData =
          assignmentResponse;

        const sessionData =
          extractResults(
            sessionsResponse.data,
          );

        const termData =
          extractResults(
            termsResponse.data,
          );

        const classData =
          extractResults(
            classesResponse.data,
          );

        const subjectData =
          extractResults(
            subjectsResponse.data,
          );

        setAssignment(
          assignmentData,
        );

        setSessions(sessionData);
        setTerms(termData);
        setClasses(classData);
        setSubjects(subjectData);

        // ----------------------------------------------------
        // IMPORTANT DATE HANDLING
        // ----------------------------------------------------
        //
        // assigned_date:
        //     DateField
        //     -> YYYY-MM-DD
        //
        // due_date:
        //     DateTimeField
        //     -> YYYY-MM-DDTHH:mm
        //

        setForm({
          academic_session:
            getNestedId(
              assignmentData.academic_session,
              assignmentData.academic_session_id,
              assignmentData.session,
            ),

          term:
            getNestedId(
              assignmentData.term,
              assignmentData.term_id,
            ),

          class_level:
            getNestedId(
              assignmentData.class_level,
              assignmentData.class_level_id,
              assignmentData.class,
            ),

          subject:
            getNestedId(
              assignmentData.subject,
              assignmentData.subject_id,
            ),

          title:
            assignmentData.title || "",

          instructions:
            assignmentData.instructions || "",

          // FIXED:
          // DateField -> YYYY-MM-DD
          assigned_date:
            toDateInput(
              assignmentData.assigned_date,
            ),

          // DateTimeField -> datetime-local
          due_date:
            toDateTimeLocal(
              assignmentData.due_date,
            ),

          maximum_score:
            assignmentData.maximum_score !==
              undefined &&
            assignmentData.maximum_score !==
              null
              ? String(
                  assignmentData.maximum_score,
                )
              : "100",

          allow_late_submission:
            Boolean(
              assignmentData.allow_late_submission,
            ),

          status:
            assignmentData.status ||
            "DRAFT",

          attachment: null,
        });
      } catch (err) {
        if (!mounted) {
          return;
        }

        setError(
          getErrorMessage(
            err,
            "Unable to load assignment.",
          ),
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadData();
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  // ==========================================================
  // FORM HANDLER
  // ==========================================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
      files,
    } = event.target;

    if (type === "file") {
      setForm((current) => ({
        ...current,
        [name]: files?.[0] || null,
      }));

      return;
    }

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ==========================================================
  // FILTERED TERMS
  // ==========================================================

  const filteredTerms = useMemo(() => {
    if (!form.academic_session) {
      return terms;
    }

    return terms.filter((term) => {
      const sessionId =
        term.academic_session ??
        term.session ??
        term.academic_session_id;

      return (
        !sessionId ||
        String(sessionId) ===
          String(form.academic_session)
      );
    });
  }, [
    terms,
    form.academic_session,
  ]);

  // ==========================================================
  // SUBJECTS
  // ==========================================================

  const filteredSubjects = useMemo(() => {
    return subjects;
  }, [subjects]);

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // --------------------------------------------------------
    // REQUIRED FIELDS
    // --------------------------------------------------------

    if (!form.academic_session) {
      setError(
        "Please select an academic session.",
      );
      return;
    }

    if (!form.term) {
      setError(
        "Please select a term.",
      );
      return;
    }

    if (!form.class_level) {
      setError(
        "Please select a class.",
      );
      return;
    }

    if (!form.subject) {
      setError(
        "Please select a subject.",
      );
      return;
    }

    if (!form.title.trim()) {
      setError(
        "Please enter an assignment title.",
      );
      return;
    }

    if (
      !form.maximum_score ||
      Number(form.maximum_score) <= 0
    ) {
      setError(
        "Maximum score must be greater than zero.",
      );
      return;
    }

    // --------------------------------------------------------
    // DATE VALIDATION
    // --------------------------------------------------------
    //
    // assigned_date is a date-only value:
    //
    // YYYY-MM-DD
    //
    // due_date is a datetime:
    //
    // YYYY-MM-DDTHH:mm
    //
    // We compare them by converting the assigned date
    // to the beginning of that local day.
    //

    if (
      form.assigned_date &&
      form.due_date
    ) {
      const assignedDateTime =
        new Date(
          `${form.assigned_date}T00:00`,
        );

      const dueDateTime =
        new Date(form.due_date);

      if (
        !Number.isNaN(
          assignedDateTime.getTime(),
        ) &&
        !Number.isNaN(
          dueDateTime.getTime(),
        ) &&
        dueDateTime < assignedDateTime
      ) {
        setError(
          "Due date cannot be earlier than the assigned date.",
        );
        return;
      }
    }

    // --------------------------------------------------------
    // SAVE
    // --------------------------------------------------------

    setSaving(true);

    try {
      const formData =
        new FormData();

      // ------------------------------------------------------
      // ACADEMIC RELATIONSHIPS
      // ------------------------------------------------------

      formData.append(
        "academic_session",
        form.academic_session,
      );

      formData.append(
        "term",
        form.term,
      );

      formData.append(
        "class_level",
        form.class_level,
      );

      formData.append(
        "subject",
        form.subject,
      );

      // ------------------------------------------------------
      // ASSIGNMENT DETAILS
      // ------------------------------------------------------

      formData.append(
        "title",
        form.title.trim(),
      );

      formData.append(
        "instructions",
        form.instructions || "",
      );

      // ------------------------------------------------------
      // ASSIGNED DATE
      // ------------------------------------------------------
      //
      // IMPORTANT:
      //
      // DO NOT convert this to datetime-local.
      //
      // Backend expects:
      //
      // YYYY-MM-DD
      //

      if (form.assigned_date) {
        formData.append(
          "assigned_date",
          form.assigned_date,
        );
      }

      // ------------------------------------------------------
      // DUE DATE
      // ------------------------------------------------------
      //
      // Backend expects a DateTimeField.
      //
      // datetime-local gives:
      //
      // YYYY-MM-DDTHH:mm
      //

      if (form.due_date) {
        formData.append(
          "due_date",
          form.due_date,
        );
      }

      // ------------------------------------------------------
      // SCORING
      // ------------------------------------------------------

      formData.append(
        "maximum_score",
        form.maximum_score,
      );

      formData.append(
        "allow_late_submission",
        String(
          form.allow_late_submission,
        ),
      );

      formData.append(
        "status",
        form.status,
      );

      // ------------------------------------------------------
      // ATTACHMENT
      // ------------------------------------------------------

      if (form.attachment) {
        formData.append(
          "attachment",
          form.attachment,
        );
      }

      // ------------------------------------------------------
      // UPDATE
      // ------------------------------------------------------

      await assignmentsService.update(
        id,
        formData,
      );

      setSuccess(
        "Assignment updated successfully.",
      );

      setTimeout(() => {
        navigate(
          `/teacher/assignments/${id}`,
        );
      }, 700);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to update assignment.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin" />

          <span>
            Loading assignment...
          </span>
        </div>
      </div>
    );
  }

  // ==========================================================
  // NOT FOUND
  // ==========================================================

  if (!assignment && error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 shrink-0 text-red-600" />

              <div>
                <h2 className="font-semibold text-red-900">
                  Unable to load assignment
                </h2>

                <p className="mt-2 text-sm text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/teacher/assignments",
                    )
                  }
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Assignments
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              navigate(
                `/teacher/assignments/${id}`,
              )
            }
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Assignment
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Assignment
              </h1>

              <p className="text-sm text-gray-500">
                Update the assignment details.
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="text-sm">
              {error}
            </div>
          </div>
        )}

        {/* ==================================================
            SUCCESS
        ================================================== */}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div className="text-sm">
              {success}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">

            {/* =================================================
                ACADEMIC INFORMATION
            ================================================= */}

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Academic Information
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Select the academic context for this assignment.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">

                {/* SESSION */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Academic Session
                    <span className="text-red-500">
                      {" "}*
                    </span>
                  </label>

                  <select
                    name="academic_session"
                    value={
                      form.academic_session
                    }
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  >
                    <option value="">
                      Select academic session
                    </option>

                    {sessions.map(
                      (session) => (
                        <option
                          key={session.id}
                          value={session.id}
                        >
                          {session.name ||
                            session.session_name ||
                            session.title ||
                            session.year ||
                            `Session ${session.id}`}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                {/* TERM */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Term
                    <span className="text-red-500">
                      {" "}*
                    </span>
                  </label>

                  <select
                    name="term"
                    value={form.term}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  >
                    <option value="">
                      Select term
                    </option>

                    {filteredTerms.map(
                      (term) => (
                        <option
                          key={term.id}
                          value={term.id}
                        >
                          {term.name ||
                            term.term_name ||
                            term.title ||
                            term.code ||
                            `Term ${term.id}`}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                {/* CLASS */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Class
                    <span className="text-red-500">
                      {" "}*
                    </span>
                  </label>

                  <select
                    name="class_level"
                    value={
                      form.class_level
                    }
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  >
                    <option value="">
                      Select class
                    </option>

                    {classes.map(
                      (classLevel) => (
                        <option
                          key={classLevel.id}
                          value={classLevel.id}
                        >
                          {classLevel.name ||
                            classLevel.class_name ||
                            classLevel.title ||
                            `Class ${classLevel.id}`}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                {/* SUBJECT */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Subject
                    <span className="text-red-500">
                      {" "}*
                    </span>
                  </label>

                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  >
                    <option value="">
                      Select subject
                    </option>

                    {filteredSubjects.map(
                      (subject) => (
                        <option
                          key={subject.id}
                          value={subject.id}
                        >
                          {subject.name ||
                            subject.subject_name ||
                            subject.title ||
                            `Subject ${subject.id}`}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>
            </section>

            {/* =================================================
                ASSIGNMENT DETAILS
            ================================================= */}

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Assignment Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update the assignment title and instructions.
                </p>
              </div>

              <div className="space-y-5">

                {/* TITLE */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Assignment Title
                    <span className="text-red-500">
                      {" "}*
                    </span>
                  </label>

                  <div className="relative">
                    <FileText className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="Assignment title"
                      className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>
                </div>

                {/* INSTRUCTIONS */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Instructions
                  </label>

                  <textarea
                    name="instructions"
                    value={
                      form.instructions
                    }
                    onChange={handleChange}
                    rows={6}
                    placeholder="Write the instructions for students..."
                    className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </section>

            {/* =================================================
                DATES & SCORING
            ================================================= */}

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Dates & Scoring
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Configure timing, scoring and submission rules.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">

                {/* ASSIGNED DATE */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Assigned Date
                  </label>

                  <div className="relative">
                    <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

                    <input
                      type="date"
                      name="assigned_date"
                      value={
                        form.assigned_date
                      }
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <p className="mt-1.5 text-xs text-gray-500">
                    Date only.
                  </p>
                </div>

                {/* DUE DATE */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Due Date
                  </label>

                  <div className="relative">
                    <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

                    <input
                      type="datetime-local"
                      name="due_date"
                      value={form.due_date}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <p className="mt-1.5 text-xs text-gray-500">
                    Date and time.
                  </p>
                </div>

                {/* MAXIMUM SCORE */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Maximum Score
                    <span className="text-red-500">
                      {" "}*
                    </span>
                  </label>

                  <input
                    type="number"
                    name="maximum_score"
                    value={
                      form.maximum_score
                    }
                    onChange={handleChange}
                    min="1"
                    step="0.01"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                {/* STATUS */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="DRAFT">
                      Draft
                    </option>

                    <option value="PUBLISHED">
                      Published
                    </option>

                    <option value="CLOSED">
                      Closed
                    </option>
                  </select>
                </div>
              </div>

              {/* LATE SUBMISSION */}

              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <input
                  type="checkbox"
                  name="allow_late_submission"
                  checked={
                    form.allow_late_submission
                  }
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />

                <span>
                  <span className="block text-sm font-medium text-gray-800">
                    Allow late submissions
                  </span>

                  <span className="mt-1 block text-xs text-gray-500">
                    Students can submit after the due date and their submission will be marked late.
                  </span>
                </span>
              </label>
            </section>

            {/* =================================================
                ATTACHMENT
            ================================================= */}

            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Attachment
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Replace the existing attachment if needed.
                </p>
              </div>

              {assignment?.attachment && (
                <div className="mb-4 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <Paperclip className="h-5 w-5 text-blue-600" />

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      Current attachment
                    </p>

                    <a
                      href={
                        assignment.attachment
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block truncate text-sm text-blue-600 hover:underline"
                    >
                      View current attachment
                    </a>
                  </div>
                </div>
              )}

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50">
                <Paperclip className="mb-3 h-8 w-8 text-gray-400" />

                <span className="text-sm font-medium text-gray-700">
                  {form.attachment
                    ? form.attachment.name
                    : "Choose a new file"}
                </span>

                <span className="mt-1 text-xs text-gray-500">
                  Leave empty to keep the current attachment.
                </span>

                <input
                  type="file"
                  name="attachment"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
            </section>

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="flex flex-col-reverse gap-3 pb-8 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/teacher/assignments/${id}`,
                  )
                }
                disabled={saving}
                className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}