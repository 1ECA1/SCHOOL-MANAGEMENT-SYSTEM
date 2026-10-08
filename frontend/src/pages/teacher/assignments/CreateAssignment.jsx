// import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   AlertCircle,
//   ArrowLeft,
//   Calendar,
//   CheckCircle,
//   FileText,
//   Loader2,
//   Paperclip,
//   Save,
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
//           if (Array.isArray(nestedValue) && nestedValue.length > 0) {
//             return String(nestedValue[0]);
//           }

//           if (typeof nestedValue === "string") {
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

// const getTodayDateTimeLocal = () => {
//   const date = new Date();

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
// //
// // These use api directly so this page does not depend on guessed
// // academicsService exports.
// // ============================================================

// const ACADEMIC_ENDPOINTS = {
//   sessions: "/academic-sessions/",
//   terms: "/terms/",
//   classes: "/class-levels/",
//   subjects: "/subjects/",
// };

// // ============================================================
// // FIELD COMPONENTS
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

// export default function CreateAssignment() {
//   const navigate = useNavigate();

//   // ----------------------------------------------------------
//   // ACADEMIC DATA
//   // ----------------------------------------------------------

//   const [sessions, setSessions] = useState([]);
//   const [terms, setTerms] = useState([]);
//   const [classes, setClasses] = useState([]);
//   const [subjects, setSubjects] = useState([]);

//   const [loadingAcademicData, setLoadingAcademicData] =
//     useState(true);

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
//     assigned_date: getTodayDateTimeLocal(),
//     due_date: "",
//     maximum_score: "100",
//     allow_late_submission: false,
//     status: "DRAFT",
//     attachment: null,
//   });

//   // ----------------------------------------------------------
//   // UI STATE
//   // ----------------------------------------------------------

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   // ----------------------------------------------------------
//   // LOAD ACADEMIC DATA
//   // ----------------------------------------------------------

//   useEffect(() => {
//     let mounted = true;

//     const loadAcademicData = async () => {
//       setLoadingAcademicData(true);
//       setError("");

//       try {
//         const [
//           sessionsResponse,
//           termsResponse,
//           classesResponse,
//           subjectsResponse,
//         ] = await Promise.all([
//           api.get(ACADEMIC_ENDPOINTS.sessions),
//           api.get(ACADEMIC_ENDPOINTS.terms),
//           api.get(ACADEMIC_ENDPOINTS.classes),
//           api.get(ACADEMIC_ENDPOINTS.subjects),
//         ]);

//         if (!mounted) {
//           return;
//         }

//         setSessions(
//           extractResults(sessionsResponse.data),
//         );

//         setTerms(
//           extractResults(termsResponse.data),
//         );

//         setClasses(
//           extractResults(classesResponse.data),
//         );

//         setSubjects(
//           extractResults(subjectsResponse.data),
//         );
//       } catch (requestError) {
//         if (!mounted) {
//           return;
//         }

//         setError(
//           getApiError(
//             requestError,
//             "Unable to load academic information.",
//           ),
//         );
//       } finally {
//         if (mounted) {
//           setLoadingAcademicData(false);
//         }
//       }
//     };

//     loadAcademicData();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   // ----------------------------------------------------------
//   // NORMALIZED DATA
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
//   // INPUT HANDLER
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
//         [name]: files?.[0] || null,
//       }));

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
//       Number.isNaN(assignedDate.getTime()) ||
//       Number.isNaN(dueDate.getTime())
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
//   // SUBMIT
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

//     setLoading(true);

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

//       await assignmentsService.create(
//         payload,
//       );

//       setSuccess(
//         "Assignment created successfully.",
//       );

//       setTimeout(() => {
//         navigate("../");
//       }, 700);
//     } catch (requestError) {
//       setError(
//         getApiError(
//           requestError,
//           "Unable to create assignment.",
//         ),
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ----------------------------------------------------------
//   // RENDER
//   // ----------------------------------------------------------

//   return (
//     <div className="min-h-full bg-slate-50 p-4 md:p-6">
//       <div className="mx-auto max-w-5xl">
//         {/* HEADER */}
//         <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <button
//               type="button"
//               onClick={() => navigate("../")}
//               className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
//             >
//               <ArrowLeft size={17} />
//               Back to Assignments
//             </button>

//             <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
//               Create Assignment
//             </h1>

//             <p className="mt-1 text-sm text-slate-500">
//               Create an assignment for a class and subject you teach.
//             </p>
//           </div>
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

//         {loadingAcademicData ? (
//           <div className="flex min-h-80 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
//             <div className="flex flex-col items-center gap-3 text-slate-500">
//               <Loader2
//                 size={32}
//                 className="animate-spin"
//               />

//               <span className="text-sm">
//                 Loading academic information...
//               </span>
//             </div>
//           </div>
//         ) : (
//           <form
//             onSubmit={handleSubmit}
//             className="space-y-6"
//           >
//             {/* ACADEMIC INFORMATION */}

//             <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
//               <div className="mb-5">
//                 <h2 className="text-lg font-bold text-slate-900">
//                   Academic Information
//                 </h2>

//                 <p className="mt-1 text-sm text-slate-500">
//                   Select the academic session, term, class and subject.
//                 </p>
//               </div>

//               <div className="grid gap-5 md:grid-cols-2">
//                 <div>
//                   <FieldLabel required>
//                     Academic Session
//                   </FieldLabel>

//                   <Select
//                     name="academic_session"
//                     value={
//                       form.academic_session
//                     }
//                     onChange={handleChange}
//                     required
//                   >
//                     <option value="">
//                       Select academic session
//                     </option>

//                     {normalizedSessions.map(
//                       (item) => (
//                         <option
//                           key={item.optionId}
//                           value={item.optionId}
//                         >
//                           {item.optionName}
//                         </option>
//                       ),
//                     )}
//                   </Select>
//                 </div>

//                 <div>
//                   <FieldLabel required>
//                     Term
//                   </FieldLabel>

//                   <Select
//                     name="term"
//                     value={form.term}
//                     onChange={handleChange}
//                     required
//                   >
//                     <option value="">
//                       Select term
//                     </option>

//                     {normalizedTerms.map(
//                       (item) => (
//                         <option
//                           key={item.optionId}
//                           value={item.optionId}
//                         >
//                           {item.optionName}
//                         </option>
//                       ),
//                     )}
//                   </Select>
//                 </div>

//                 <div>
//                   <FieldLabel required>
//                     Class
//                   </FieldLabel>

//                   <Select
//                     name="class_level"
//                     value={
//                       form.class_level
//                     }
//                     onChange={handleChange}
//                     required
//                   >
//                     <option value="">
//                       Select class
//                     </option>

//                     {normalizedClasses.map(
//                       (item) => (
//                         <option
//                           key={item.optionId}
//                           value={item.optionId}
//                         >
//                           {item.optionName}
//                         </option>
//                       ),
//                     )}
//                   </Select>
//                 </div>

//                 <div>
//                   <FieldLabel required>
//                     Subject
//                   </FieldLabel>

//                   <Select
//                     name="subject"
//                     value={form.subject}
//                     onChange={handleChange}
//                     required
//                   >
//                     <option value="">
//                       Select subject
//                     </option>

//                     {normalizedSubjects.map(
//                       (item) => (
//                         <option
//                           key={item.optionId}
//                           value={item.optionId}
//                         >
//                           {item.optionName}
//                         </option>
//                       ),
//                     )}
//                   </Select>
//                 </div>
//               </div>
//             </section>

//             {/* ASSIGNMENT INFORMATION */}

//             <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
//               <div className="mb-5">
//                 <h2 className="text-lg font-bold text-slate-900">
//                   Assignment Information
//                 </h2>

//                 <p className="mt-1 text-sm text-slate-500">
//                   Provide the assignment title and instructions.
//                 </p>
//               </div>

//               <div className="space-y-5">
//                 <div>
//                   <FieldLabel required>
//                     Assignment Title
//                   </FieldLabel>

//                   <Input
//                     type="text"
//                     name="title"
//                     value={form.title}
//                     onChange={handleChange}
//                     placeholder="e.g. Mathematics Assignment 1"
//                     maxLength={255}
//                     required
//                   />
//                 </div>

//                 <div>
//                   <FieldLabel required>
//                     Instructions
//                   </FieldLabel>

//                   <Textarea
//                     name="instructions"
//                     value={form.instructions}
//                     onChange={handleChange}
//                     placeholder="Enter the instructions students should follow..."
//                     required
//                   />
//                 </div>
//               </div>
//             </section>

//             {/* DATES AND SCORING */}

//             <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
//               <div className="mb-5">
//                 <h2 className="text-lg font-bold text-slate-900">
//                   Schedule & Scoring
//                 </h2>

//                 <p className="mt-1 text-sm text-slate-500">
//                   Configure the assignment dates and maximum score.
//                 </p>
//               </div>

//               <div className="grid gap-5 md:grid-cols-2">
//                 <div>
//                   <FieldLabel required>
//                     Assigned Date
//                   </FieldLabel>

//                   <div className="relative">
//                     <Calendar
//                       size={18}
//                       className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                     />

//                     <Input
//                       type="datetime-local"
//                       name="assigned_date"
//                       value={
//                         form.assigned_date
//                       }
//                       onChange={handleChange}
//                       className="pl-10"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <FieldLabel required>
//                     Due Date
//                   </FieldLabel>

//                   <div className="relative">
//                     <Calendar
//                       size={18}
//                       className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//                     />

//                     <Input
//                       type="datetime-local"
//                       name="due_date"
//                       value={form.due_date}
//                       onChange={handleChange}
//                       className="pl-10"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <FieldLabel required>
//                     Maximum Score
//                   </FieldLabel>

//                   <Input
//                     type="number"
//                     name="maximum_score"
//                     value={
//                       form.maximum_score
//                     }
//                     onChange={handleChange}
//                     min="0.01"
//                     step="0.01"
//                     placeholder="100"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <FieldLabel>
//                     Status
//                   </FieldLabel>

//                   <Select
//                     name="status"
//                     value={form.status}
//                     onChange={handleChange}
//                   >
//                     <option value="DRAFT">
//                       Draft
//                     </option>

//                     <option value="PUBLISHED">
//                       Published
//                     </option>
//                   </Select>
//                 </div>
//               </div>

//               <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
//                 <label className="flex cursor-pointer items-start gap-3">
//                   <input
//                     type="checkbox"
//                     name="allow_late_submission"
//                     checked={
//                       form.allow_late_submission
//                     }
//                     onChange={handleChange}
//                     className="mt-1 h-4 w-4 rounded border-slate-300 text-[var(--color-primary)] focus:ring-purple-200"
//                   />

//                   <span>
//                     <span className="block text-sm font-semibold text-slate-800">
//                       Allow late submissions
//                     </span>

//                     <span className="mt-1 block text-xs text-slate-500">
//                       Students can submit after the due date when this is enabled.
//                     </span>
//                   </span>
//                 </label>
//               </div>
//             </section>

//             {/* ATTACHMENT */}

//             <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
//               <div className="mb-5">
//                 <h2 className="text-lg font-bold text-slate-900">
//                   Attachment
//                 </h2>

//                 <p className="mt-1 text-sm text-slate-500">
//                   Optionally attach a file for students.
//                 </p>
//               </div>

//               <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-purple-400 hover:bg-purple-50">
//                 <Paperclip
//                   size={28}
//                   className="mb-3 text-slate-400"
//                 />

//                 <span className="text-sm font-semibold text-slate-700">
//                   {form.attachment
//                     ? form.attachment.name
//                     : "Choose an attachment"}
//                 </span>

//                 <span className="mt-1 text-xs text-slate-500">
//                   Click to select a file
//                 </span>

//                 <input
//                   type="file"
//                   name="attachment"
//                   onChange={handleChange}
//                   className="hidden"
//                 />
//               </label>

//               {form.attachment && (
//                 <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
//                   <FileText size={16} />

//                   <span className="truncate">
//                     {form.attachment.name}
//                   </span>

//                   <button
//                     type="button"
//                     onClick={() =>
//                       setForm((previous) => ({
//                         ...previous,
//                         attachment: null,
//                       }))
//                     }
//                     className="ml-auto text-xs font-semibold text-red-600 hover:text-red-700"
//                   >
//                     Remove
//                   </button>
//                 </div>
//               )}
//             </section>

//             {/* ACTIONS */}

//             <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
//               <button
//                 type="button"
//                 onClick={() => navigate("../")}
//                 disabled={loading}
//                 className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="submit"
//                 disabled={
//                   loading ||
//                   loadingAcademicData
//                 }
//                 className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 text-sm font-semibold text-white shadow-lg shadow-purple-900/10 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
//               >
//                 {loading ? (
//                   <>
//                     <Loader2
//                       size={18}
//                       className="animate-spin"
//                     />

//                     Creating...
//                   </>
//                 ) : (
//                   <>
//                     <Save size={18} />

//                     Create Assignment
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }





// import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import {
//   AlertCircle,
//   ArrowLeft,
//   Calendar,
//   CheckCircle,
//   FileText,
//   Loader2,
//   Paperclip,
//   Plus,
//   Save,
// } from "lucide-react";

// import api from "../../../services/api";
// import assignmentsService from "../../../services/assignmentsService";

// // ============================================================
// // ENDPOINTS
// // ============================================================

// const ACADEMIC_ENDPOINTS = {
//   sessions: "/academics/sessions/",
//   terms: "/academics/terms/",
//   classes: "/academics/class-levels/",
//   subjects: "/academics/subjects/",
// };

// // ============================================================
// // HELPERS
// // ============================================================

// const getErrorMessage = (error, fallback = "Something went wrong.") => {
//   const data = error?.response?.data;

//   if (!data) {
//     return error?.message || fallback;
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

//   if (Array.isArray(data)) {
//     return data.join(", ");
//   }

//   const messages = [];

//   Object.entries(data).forEach(([field, value]) => {
//     if (Array.isArray(value)) {
//       messages.push(
//         `${field}: ${value.join(", ")}`
//       );
//     } else if (typeof value === "object" && value !== null) {
//       messages.push(
//         `${field}: ${JSON.stringify(value)}`
//       );
//     } else {
//       messages.push(`${field}: ${value}`);
//     }
//   });

//   return messages.length
//     ? messages.join(" | ")
//     : fallback;
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

// const getId = (value) => {
//   if (value === null || value === undefined) {
//     return "";
//   }

//   if (typeof value === "object") {
//     return String(value.id ?? "");
//   }

//   return String(value);
// };

// const toDateTimeLocal = (value) => {
//   if (!value) {
//     return "";
//   }

//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) {
//     return String(value).slice(0, 16);
//   }

//   const local = new Date(
//     date.getTime() - date.getTimezoneOffset() * 60000
//   );

//   return local.toISOString().slice(0, 16);
// };

// // ============================================================
// // COMPONENT
// // ============================================================

// export default function CreateAssignment() {
//   const navigate = useNavigate();

//   // ----------------------------------------------------------
//   // ACADEMIC DATA
//   // ----------------------------------------------------------

//   const [sessions, setSessions] = useState([]);
//   const [terms, setTerms] = useState([]);
//   const [classes, setClasses] = useState([]);
//   const [subjects, setSubjects] = useState([]);

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

//   // ----------------------------------------------------------
//   // UI
//   // ----------------------------------------------------------

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

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
//         ] = await Promise.all([
//           api.get(ACADEMIC_ENDPOINTS.sessions),
//           api.get(ACADEMIC_ENDPOINTS.terms),
//           api.get(ACADEMIC_ENDPOINTS.classes),
//           api.get(ACADEMIC_ENDPOINTS.subjects),
//         ]);

//         if (!mounted) {
//           return;
//         }

//         setSessions(
//           extractResults(sessionsResponse.data)
//         );

//         setTerms(
//           extractResults(termsResponse.data)
//         );

//         setClasses(
//           extractResults(classesResponse.data)
//         );

//         setSubjects(
//           extractResults(subjectsResponse.data)
//         );
//       } catch (err) {
//         if (!mounted) {
//           return;
//         }

//         setError(
//           getErrorMessage(
//             err,
//             "Unable to load academic information."
//           )
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
//   // FORM HANDLERS
//   // ==========================================================

//   const handleChange = (event) => {
//     const { name, value, type, checked, files } =
//       event.target;

//     if (type === "file") {
//       setForm((current) => ({
//         ...current,
//         [name]: files?.[0] || null,
//       }));

//       return;
//     }

//     setForm((current) => ({
//       ...current,
//       [name]:
//         type === "checkbox"
//           ? checked
//           : value,
//     }));
//   };

//   // ==========================================================
//   // FILTERED TERMS
//   // ==========================================================

//   const filteredTerms = useMemo(() => {
//     if (!form.academic_session) {
//       return terms;
//     }

//     return terms.filter((term) => {
//       const sessionId =
//         term.academic_session ??
//         term.session ??
//         term.academic_session_id;

//       return (
//         !sessionId ||
//         String(sessionId) ===
//           String(form.academic_session)
//       );
//     });
//   }, [terms, form.academic_session]);

//   // ==========================================================
//   // FILTERED SUBJECTS
//   // ==========================================================

//   const filteredSubjects = useMemo(() => {
//     if (!form.class_level) {
//       return subjects;
//     }

//     return subjects;
//   }, [subjects, form.class_level]);

//   // ==========================================================
//   // SUBMIT
//   // ==========================================================

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     setError("");
//     setSuccess("");

//     if (!form.academic_session) {
//       setError("Please select an academic session.");
//       return;
//     }

//     if (!form.term) {
//       setError("Please select a term.");
//       return;
//     }

//     if (!form.class_level) {
//       setError("Please select a class.");
//       return;
//     }

//     if (!form.subject) {
//       setError("Please select a subject.");
//       return;
//     }

//     if (!form.title.trim()) {
//       setError("Please enter an assignment title.");
//       return;
//     }

//     if (
//       !form.maximum_score ||
//       Number(form.maximum_score) <= 0
//     ) {
//       setError(
//         "Maximum score must be greater than zero."
//       );
//       return;
//     }

//     if (
//       form.assigned_date &&
//       form.due_date &&
//       new Date(form.due_date) <
//         new Date(form.assigned_date)
//     ) {
//       setError(
//         "Due date cannot be earlier than the assigned date."
//       );
//       return;
//     }

//     setSaving(true);

//     try {
//       const formData = new FormData();

//       formData.append(
//         "academic_session",
//         form.academic_session
//       );

//       formData.append(
//         "term",
//         form.term
//       );

//       formData.append(
//         "class_level",
//         form.class_level
//       );

//       formData.append(
//         "subject",
//         form.subject
//       );

//       formData.append(
//         "title",
//         form.title.trim()
//       );

//       formData.append(
//         "instructions",
//         form.instructions
//       );

//       if (form.assigned_date) {
//         formData.append(
//           "assigned_date",
//           form.assigned_date
//         );
//       }

//       if (form.due_date) {
//         formData.append(
//           "due_date",
//           form.due_date
//         );
//       }

//       formData.append(
//         "maximum_score",
//         form.maximum_score
//       );

//       formData.append(
//         "allow_late_submission",
//         String(form.allow_late_submission)
//       );

//       formData.append(
//         "status",
//         form.status
//       );

//       if (form.attachment) {
//         formData.append(
//           "attachment",
//           form.attachment
//         );
//       }

//       await assignmentsService.create(formData);

//       setSuccess(
//         "Assignment created successfully."
//       );

//       setTimeout(() => {
//         navigate("/teacher/assignments");
//       }, 700);
//     } catch (err) {
//       setError(
//         getErrorMessage(
//           err,
//           "Unable to create assignment."
//         )
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ==========================================================
//   // LOADING
//   // ==========================================================

//   if (loading) {
//     return (
//       <div className="flex min-h-[500px] items-center justify-center">
//         <div className="flex items-center gap-3 text-gray-600">
//           <Loader2 className="h-6 w-6 animate-spin" />
//           <span>Loading academic information...</span>
//         </div>
//       </div>
//     );
//   }

//   // ==========================================================
//   // RENDER
//   // ==========================================================

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       <div className="mx-auto max-w-5xl">

//         {/* HEADER */}
//         <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <button
//               type="button"
//               onClick={() =>
//                 navigate("/teacher/assignments")
//               }
//               className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
//             >
//               <ArrowLeft className="h-4 w-4" />
//               Back to Assignments
//             </button>

//             <div className="flex items-center gap-3">
//               <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
//                 <Plus className="h-6 w-6 text-blue-600" />
//               </div>

//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">
//                   Create Assignment
//                 </h1>

//                 <p className="text-sm text-gray-500">
//                   Create an assignment for your authorized class and subject.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ERROR */}
//         {error && (
//           <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
//             <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

//             <div className="text-sm">
//               {error}
//             </div>
//           </div>
//         )}

//         {/* SUCCESS */}
//         {success && (
//           <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
//             <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />

//             <div className="text-sm">
//               {success}
//             </div>
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           <div className="space-y-6">

//             {/* ACADEMIC INFORMATION */}
//             <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
//               <div className="mb-5">
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Academic Information
//                 </h2>

//                 <p className="mt-1 text-sm text-gray-500">
//                   Select the academic context for this assignment.
//                 </p>
//               </div>

//               <div className="grid gap-5 md:grid-cols-2">

//                 {/* SESSION */}
//                 <div>
//                   <label className="mb-2 block text-sm font-medium text-gray-700">
//                     Academic Session
//                     <span className="text-red-500">
//                       {" "}*
//                     </span>
//                   </label>

//                   <select
//                     name="academic_session"
//                     value={form.academic_session}
//                     onChange={handleChange}
//                     className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                     required
//                   >
//                     <option value="">
//                       Select academic session
//                     </option>

//                     {sessions.map((session) => (
//                       <option
//                         key={session.id}
//                         value={session.id}
//                       >
//                         {session.name ||
//                           session.session_name ||
//                           session.title ||
//                           session.year ||
//                           `Session ${session.id}`}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* TERM */}
//                 <div>
//                   <label className="mb-2 block text-sm font-medium text-gray-700">
//                     Term
//                     <span className="text-red-500">
//                       {" "}*
//                     </span>
//                   </label>

//                   <select
//                     name="term"
//                     value={form.term}
//                     onChange={handleChange}
//                     className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                     required
//                   >
//                     <option value="">
//                       Select term
//                     </option>

//                     {filteredTerms.map((term) => (
//                       <option
//                         key={term.id}
//                         value={term.id}
//                       >
//                         {term.name ||
//                           term.term_name ||
//                           term.title ||
//                           term.code ||
//                           `Term ${term.id}`}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* CLASS */}
//                 <div>
//                   <label className="mb-2 block text-sm font-medium text-gray-700">
//                     Class
//                     <span className="text-red-500">
//                       {" "}*
//                     </span>
//                   </label>

//                   <select
//                     name="class_level"
//                     value={form.class_level}
//                     onChange={handleChange}
//                     className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                     required
//                   >
//                     <option value="">
//                       Select class
//                     </option>

//                     {classes.map((classLevel) => (
//                       <option
//                         key={classLevel.id}
//                         value={classLevel.id}
//                       >
//                         {classLevel.name ||
//                           classLevel.class_name ||
//                           classLevel.title ||
//                           `Class ${classLevel.id}`}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* SUBJECT */}
//                 <div>
//                   <label className="mb-2 block text-sm font-medium text-gray-700">
//                     Subject
//                     <span className="text-red-500">
//                       {" "}*
//                     </span>
//                   </label>

//                   <select
//                     name="subject"
//                     value={form.subject}
//                     onChange={handleChange}
//                     className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                     required
//                   >
//                     <option value="">
//                       Select subject
//                     </option>

//                     {filteredSubjects.map((subject) => (
//                       <option
//                         key={subject.id}
//                         value={subject.id}
//                       >
//                         {subject.name ||
//                           subject.subject_name ||
//                           subject.title ||
//                           `Subject ${subject.id}`}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </section>

//             {/* ASSIGNMENT DETAILS */}
//             <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
//               <div className="mb-5">
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Assignment Details
//                 </h2>

//                 <p className="mt-1 text-sm text-gray-500">
//                   Enter the assignment title and instructions.
//                 </p>
//               </div>

//               <div className="space-y-5">

//                 {/* TITLE */}
//                 <div>
//                   <label className="mb-2 block text-sm font-medium text-gray-700">
//                     Assignment Title
//                     <span className="text-red-500">
//                       {" "}*
//                     </span>
//                   </label>

//                   <div className="relative">
//                     <FileText className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

//                     <input
//                       type="text"
//                       name="title"
//                       value={form.title}
//                       onChange={handleChange}
//                       placeholder="e.g. Civic Education Essay"
//                       className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                       required
//                     />
//                   </div>
//                 </div>

//                 {/* INSTRUCTIONS */}
//                 <div>
//                   <label className="mb-2 block text-sm font-medium text-gray-700">
//                     Instructions
//                   </label>

//                   <textarea
//                     name="instructions"
//                     value={form.instructions}
//                     onChange={handleChange}
//                     rows={6}
//                     placeholder="Write the instructions for students..."
//                     className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                   />
//                 </div>
//               </div>
//             </section>

//             {/* DATES & SCORING */}
//             <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
//               <div className="mb-5">
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Dates & Scoring
//                 </h2>

//                 <p className="mt-1 text-sm text-gray-500">
//                   Configure timing, scoring and submission rules.
//                 </p>
//               </div>

//               <div className="grid gap-5 md:grid-cols-2">

//                 {/* ASSIGNED DATE */}
//                 <div>
//                   <label className="mb-2 block text-sm font-medium text-gray-700">
//                     Assigned Date
//                   </label>

//                   <div className="relative">
//                     <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

//                     <input
//                       type="datetime-local"
//                       name="assigned_date"
//                       value={form.assigned_date}
//                       onChange={handleChange}
//                       className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                     />
//                   </div>
//                 </div>

//                 {/* DUE DATE */}
//                 <div>
//                   <label className="mb-2 block text-sm font-medium text-gray-700">
//                     Due Date
//                   </label>

//                   <div className="relative">
//                     <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />

//                     <input
//                       type="datetime-local"
//                       name="due_date"
//                       value={form.due_date}
//                       onChange={handleChange}
//                       className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                     />
//                   </div>
//                 </div>

//                 {/* MAXIMUM SCORE */}
//                 <div>
//                   <label className="mb-2 block text-sm font-medium text-gray-700">
//                     Maximum Score
//                     <span className="text-red-500">
//                       {" "}*
//                     </span>
//                   </label>

//                   <input
//                     type="number"
//                     name="maximum_score"
//                     value={form.maximum_score}
//                     onChange={handleChange}
//                     min="1"
//                     step="0.01"
//                     className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//                     required
//                   />
//                 </div>

//                 {/* STATUS */}
//                 <div>
//                   <label className="mb-2 block text-sm font-medium text-gray-700">
//                     Status
//                   </label>

//                   <select
//                     name="status"
//                     value={form.status}
//                     onChange={handleChange}
//                     className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
//               <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
//                 <input
//                   type="checkbox"
//                   name="allow_late_submission"
//                   checked={
//                     form.allow_late_submission
//                   }
//                   onChange={handleChange}
//                   className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                 />

//                 <span>
//                   <span className="block text-sm font-medium text-gray-800">
//                     Allow late submissions
//                   </span>

//                   <span className="mt-1 block text-xs text-gray-500">
//                     Students can submit after the due date and their submission will be marked late.
//                   </span>
//                 </span>
//               </label>
//             </section>

//             {/* ATTACHMENT */}
//             <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
//               <div className="mb-5">
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   Attachment
//                 </h2>

//                 <p className="mt-1 text-sm text-gray-500">
//                   Optionally attach a document or other assignment material.
//                 </p>
//               </div>

//               <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50">
//                 <Paperclip className="mb-3 h-8 w-8 text-gray-400" />

//                 <span className="text-sm font-medium text-gray-700">
//                   {form.attachment
//                     ? form.attachment.name
//                     : "Choose a file"}
//                 </span>

//                 <span className="mt-1 text-xs text-gray-500">
//                   Click to browse for an attachment
//                 </span>

//                 <input
//                   type="file"
//                   name="attachment"
//                   onChange={handleChange}
//                   className="hidden"
//                 />
//               </label>
//             </section>

//             {/* ACTIONS */}
//             <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
//               <button
//                 type="button"
//                 onClick={() =>
//                   navigate("/teacher/assignments")
//                 }
//                 disabled={saving}
//                 className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="submit"
//                 disabled={saving}
//                 className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
//               >
//                 {saving ? (
//                   <>
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                     Creating...
//                   </>
//                 ) : (
//                   <>
//                     <Save className="h-4 w-4" />
//                     Create Assignment
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }


import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  FileText,
  GraduationCap,
  Loader2,
  Paperclip,
  Save,
} from "lucide-react";

import api from "../../../services/api";
import assignmentsService from "../../../services/assignmentsService";
import { useAuth } from "../../../context/AuthContext";

// ============================================================
// ENDPOINTS
// ============================================================

const ACADEMIC_ENDPOINTS = {
  sessions: "/academics/sessions/",
  terms: "/academics/terms/",
  classes: "/academics/class-levels/",
  subjects: "/academics/subjects/",
  classSubjects: "/academics/class-subjects/",
};

// ============================================================
// HELPERS
// ============================================================

function getTeacherIdFromUser(user) {
  if (!user) {
    return null;
  }

  return (
    user.teacher_id ??
    user.teacherId ??
    user.teacher_profile_id ??
    user.teacherProfileId ??
    user.teacher_profile?.id ??
    user.teacherProfile?.id ??
    user.teacher?.id ??
    null
  );
}

function getTeacherIdsFromClassSubject(item) {
  const ids = [];

  if (item?.teacher_id != null) {
    ids.push(Number(item.teacher_id));
  }

  if (item?.teacherId != null) {
    ids.push(Number(item.teacherId));
  }

  if (item?.teacher?.id != null) {
    ids.push(Number(item.teacher.id));
  }

  if (Array.isArray(item?.teacher_ids)) {
    item.teacher_ids.forEach((id) => {
      if (id != null) {
        ids.push(Number(id));
      }
    });
  }

  if (Array.isArray(item?.teachers)) {
    item.teachers.forEach((teacher) => {
      if (teacher?.id != null) {
        ids.push(Number(teacher.id));
      }
    });
  }

  return [...new Set(ids.filter((id) => !Number.isNaN(id)))];
}

function classSubjectHasTeacher(item, teacherId) {
  if (!teacherId) {
    return false;
  }

  const normalizedTeacherId = Number(teacherId);

  return getTeacherIdsFromClassSubject(item).includes(
    normalizedTeacherId,
  );
}

function normalizeListResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
}

// ============================================================
// COMPONENT
// ============================================================

export default function CreateAssignment() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    academic_session: "",
    term: "",
    class_level: "",
    subject: "",

    title: "",
    instructions: "",

    assigned_date: "",
    due_date: "",

    maximum_score: "100",
    allow_late_submission: false,

    status: "DRAFT",

    attachment: null,
  });

  // ----------------------------------------------------------
  // TEACHER ID
  // ----------------------------------------------------------

  const teacherId = useMemo(
    () => getTeacherIdFromUser(user),
    [user],
  );

  // ----------------------------------------------------------
  // LOAD ACADEMIC DATA
  // ----------------------------------------------------------

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
          api.get(ACADEMIC_ENDPOINTS.sessions),
          api.get(ACADEMIC_ENDPOINTS.terms),
          api.get(ACADEMIC_ENDPOINTS.classes),
          api.get(ACADEMIC_ENDPOINTS.subjects),
          api.get(ACADEMIC_ENDPOINTS.classSubjects),
        ]);

        if (!mounted) {
          return;
        }

        setSessions(
          normalizeListResponse(
            sessionsResponse.data,
          ),
        );

        setTerms(
          normalizeListResponse(
            termsResponse.data,
          ),
        );

        setClasses(
          normalizeListResponse(
            classesResponse.data,
          ),
        );

        setSubjects(
          normalizeListResponse(
            subjectsResponse.data,
          ),
        );

        setClassSubjects(
          normalizeListResponse(
            classSubjectsResponse.data,
          ),
        );
      } catch (err) {
        if (!mounted) {
          return;
        }

        console.error(
          "Failed to load assignment academic data:",
          err,
        );

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Failed to load academic data. Please try again.",
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
  }, []);

  // ----------------------------------------------------------
  // TEACHER'S AUTHORIZED CLASS-SUBJECT MAPPINGS
  // ----------------------------------------------------------

  const teacherClassSubjects = useMemo(() => {
    if (!teacherId) {
      return [];
    }

    return classSubjects.filter((item) =>
      classSubjectHasTeacher(
        item,
        teacherId,
      ),
    );
  }, [classSubjects, teacherId]);

  // ----------------------------------------------------------
  // AUTHORIZED CLASS IDS
  // ----------------------------------------------------------

  const authorizedClassIds = useMemo(() => {
    return new Set(
      teacherClassSubjects
        .map(
          (item) =>
            item.class_level ??
            item.class_level_id ??
            item.classLevel?.id,
        )
        .filter(
          (id) =>
            id !== undefined &&
            id !== null,
        )
        .map(Number),
    );
  }, [teacherClassSubjects]);

  // ----------------------------------------------------------
  // FILTER CLASSES
  // ----------------------------------------------------------

  const authorizedClasses = useMemo(() => {
    return classes.filter((classLevel) =>
      authorizedClassIds.has(
        Number(classLevel.id),
      ),
    );
  }, [classes, authorizedClassIds]);

  // ----------------------------------------------------------
  // SELECTED CLASS MAPPINGS
  // ----------------------------------------------------------

  const selectedClassSubjects = useMemo(() => {
    if (!form.class_level) {
      return [];
    }

    const selectedClassId =
      Number(form.class_level);

    return teacherClassSubjects.filter(
      (item) => {
        const classId =
          item.class_level ??
          item.class_level_id ??
          item.classLevel?.id;

        return Number(classId) === selectedClassId;
      },
    );
  }, [
    form.class_level,
    teacherClassSubjects,
  ]);

  // ----------------------------------------------------------
  // AUTHORIZED SUBJECT IDS FOR SELECTED CLASS
  // ----------------------------------------------------------

  const authorizedSubjectIds = useMemo(() => {
    return new Set(
      selectedClassSubjects
        .map(
          (item) =>
            item.subject ??
            item.subject_id ??
            item.subject?.id,
        )
        .filter(
          (id) =>
            id !== undefined &&
            id !== null,
        )
        .map(Number),
    );
  }, [selectedClassSubjects]);

  // ----------------------------------------------------------
  // FILTER SUBJECTS
  // ----------------------------------------------------------

  const authorizedSubjects = useMemo(() => {
    return subjects.filter((subject) =>
      authorizedSubjectIds.has(
        Number(subject.id),
      ),
    );
  }, [subjects, authorizedSubjectIds]);

  // ----------------------------------------------------------
  // FILTER TERMS BY SESSION
  // ----------------------------------------------------------

  const filteredTerms = useMemo(() => {
    if (!form.academic_session) {
      return [];
    }

    const selectedSessionId =
      Number(form.academic_session);

    return terms.filter((term) => {
      const sessionId =
        term.academic_session ??
        term.academic_session_id ??
        term.academicSession?.id;

      return (
        Number(sessionId) ===
        selectedSessionId
      );
    });
  }, [
    terms,
    form.academic_session,
  ]);

  // ----------------------------------------------------------
  // KEEP TERM VALID
  // ----------------------------------------------------------

  useEffect(() => {
    if (!form.term) {
      return;
    }

    const stillValid = filteredTerms.some(
      (term) =>
        Number(term.id) ===
        Number(form.term),
    );

    if (!stillValid) {
      setForm((previous) => ({
        ...previous,
        term: "",
      }));
    }
  }, [
    filteredTerms,
    form.term,
  ]);

  // ----------------------------------------------------------
  // KEEP CLASS VALID
  // ----------------------------------------------------------

  useEffect(() => {
    if (!form.class_level) {
      return;
    }

    const stillValid =
      authorizedClasses.some(
        (classLevel) =>
          Number(classLevel.id) ===
          Number(form.class_level),
      );

    if (!stillValid) {
      setForm((previous) => ({
        ...previous,
        class_level: "",
        subject: "",
      }));
    }
  }, [
    authorizedClasses,
    form.class_level,
  ]);

  // ----------------------------------------------------------
  // KEEP SUBJECT VALID
  // ----------------------------------------------------------

  useEffect(() => {
    if (!form.subject) {
      return;
    }

    const stillValid =
      authorizedSubjects.some(
        (subject) =>
          Number(subject.id) ===
          Number(form.subject),
      );

    if (!stillValid) {
      setForm((previous) => ({
        ...previous,
        subject: "",
      }));
    }
  }, [
    authorizedSubjects,
    form.subject,
  ]);

  // ----------------------------------------------------------
  // CHANGE HANDLER
  // ----------------------------------------------------------

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
      files,
    } = event.target;

    if (type === "file") {
      setForm((previous) => ({
        ...previous,
        [name]: files?.[0] || null,
      }));

      return;
    }

    if (name === "academic_session") {
      setForm((previous) => ({
        ...previous,
        academic_session: value,
        term: "",
      }));

      return;
    }

    if (name === "class_level") {
      setForm((previous) => ({
        ...previous,
        class_level: value,
        subject: "",
      }));

      return;
    }

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ----------------------------------------------------------
  // FINAL AUTHORIZATION CHECK
  // ----------------------------------------------------------

  const selectedClassSubject = useMemo(() => {
    if (
      !form.class_level ||
      !form.subject
    ) {
      return null;
    }

    return selectedClassSubjects.find(
      (item) => {
        const subjectId =
          item.subject ??
          item.subject_id ??
          item.subject?.id;

        return (
          Number(subjectId) ===
          Number(form.subject)
        );
      },
    );
  }, [
    form.class_level,
    form.subject,
    selectedClassSubjects,
  ]);

  // ----------------------------------------------------------
  // SUBMIT
  // ----------------------------------------------------------

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
    // FINAL TEACHER AUTHORIZATION CHECK
    // --------------------------------------------------------

    if (!teacherId) {
      setError(
        "Your teacher profile could not be identified. Please sign in again.",
      );
      return;
    }

    if (!selectedClassSubject) {
      setError(
        "You are not authorized to create an assignment for this class and subject.",
      );
      return;
    }

    if (
      !classSubjectHasTeacher(
        selectedClassSubject,
        teacherId,
      )
    ) {
      setError(
        "You are not assigned to this subject for the selected class.",
      );
      return;
    }

    // --------------------------------------------------------
    // BUILD FORM DATA
    // --------------------------------------------------------

    const formData = new FormData();

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

    formData.append(
      "title",
      form.title.trim(),
    );

    formData.append(
      "instructions",
      form.instructions || "",
    );

    // IMPORTANT:
    //
    // Assignment.assigned_date is a Django DateField.
    //
    // Therefore we send:
    //
    // YYYY-MM-DD
    //
    // NOT:
    //
    // YYYY-MM-DDTHH:mm
    //
    if (form.assigned_date) {
      formData.append(
        "assigned_date",
        form.assigned_date,
      );
    }

    // due_date remains datetime-local because the
    // Assignment model/API accepts a datetime.
    if (form.due_date) {
      formData.append(
        "due_date",
        form.due_date,
      );
    }

    formData.append(
      "maximum_score",
      form.maximum_score,
    );

    formData.append(
      "allow_late_submission",
      form.allow_late_submission
        ? "true"
        : "false",
    );

    formData.append(
      "status",
      form.status,
    );

    if (form.attachment) {
      formData.append(
        "attachment",
        form.attachment,
      );
    }

    // DO NOT append:
    //
    // school
    // teacher
    //
    // The backend derives both from the authenticated
    // teacher profile.

    // --------------------------------------------------------
    // SAVE
    // --------------------------------------------------------

    setSaving(true);

    try {
      await assignmentsService.create(
        formData,
      );

      setSuccess(
        "Assignment created successfully.",
      );

      setTimeout(() => {
        navigate(
          "/teacher/assignments",
        );
      }, 700);
    } catch (err) {
      console.error(
        "Failed to create assignment:",
        err,
      );

      const responseData =
        err?.response?.data;

      // ------------------------------------------------------
      // FORMAT DJANGO/DRF VALIDATION ERRORS
      // ------------------------------------------------------

      if (
        responseData &&
        typeof responseData === "object"
      ) {
        const messages = [];

        Object.entries(
          responseData,
        ).forEach(
          ([field, value]) => {
            if (Array.isArray(value)) {
              value.forEach((message) => {
                messages.push(
                  `${field}: ${message}`,
                );
              });
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
          setError(
            messages.join(" "),
          );
        } else {
          setError(
            "Failed to create assignment.",
          );
        }
      } else {
        setError(
          err?.message ||
            "Failed to create assignment.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2
            size={22}
            className="animate-spin"
          />
          <span>
            Loading academic data...
          </span>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------
  // RENDER
  // ----------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/teacher/assignments",
              )
            }
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={17} />
            Back to Assignments
          </button>

          <div className="flex items-start gap-3">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-700">
              <FileText size={24} />
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Create Assignment
              </h1>

              <p className="text-gray-600 mt-1">
                Create an assignment for a class
                and subject you are authorized
                to teach.
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
            ALERTS
        ================================================== */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-3">
            <AlertCircle
              size={20}
              className="text-red-600 mt-0.5 shrink-0"
            />

            <div className="text-sm text-red-700">
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 flex items-start gap-3">
            <CheckCircle
              size={20}
              className="text-green-600 mt-0.5 shrink-0"
            />

            <div className="text-sm text-green-700">
              {success}
            </div>
          </div>
        )}

        {/* ==================================================
            NO TEACHER MAPPINGS
        ================================================== */}

        {!teacherId && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 flex items-start gap-3">
            <AlertCircle
              size={20}
              className="text-amber-600 mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold text-amber-900">
                Teacher profile not detected
              </p>

              <p className="text-sm text-amber-800 mt-1">
                Your logged-in account does not
                currently expose the teacher profile
                ID needed to display your assigned
                classes and subjects.
              </p>
            </div>
          </div>
        )}

        {teacherId &&
          teacherClassSubjects.length === 0 && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 flex items-start gap-3">
              <AlertCircle
                size={20}
                className="text-amber-600 mt-0.5 shrink-0"
              />

              <div>
                <p className="font-semibold text-amber-900">
                  No assigned subjects found
                </p>

                <p className="text-sm text-amber-800 mt-1">
                  You currently do not have any
                  ClassSubject assignment that
                  identifies you as a teacher.
                </p>
              </div>
            </div>
          )}

        {/* ==================================================
            FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* =================================================
              ACADEMIC INFORMATION
          ================================================= */}

          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-6">

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                <GraduationCap size={20} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Academic Information
                </h2>

                <p className="text-sm text-gray-500">
                  Select the academic session,
                  term, class and authorized subject.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* SESSION */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        {session.name}
                        {session.is_current
                          ? " (Current)"
                          : ""}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {/* TERM */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Term
                  <span className="text-red-500">
                    {" "}*
                  </span>
                </label>

                <select
                  name="term"
                  value={form.term}
                  onChange={handleChange}
                  disabled={
                    !form.academic_session
                  }
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 bg-white disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">
                    {!form.academic_session
                      ? "Select session first"
                      : "Select term"}
                  </option>

                  {filteredTerms.map(
                    (term) => (
                      <option
                        key={term.id}
                        value={term.id}
                      >
                        {term.name}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {/* CLASS */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class
                  <span className="text-red-500">
                    {" "}*
                  </span>
                </label>

                <select
                  name="class_level"
                  value={form.class_level}
                  onChange={handleChange}
                  disabled={
                    !teacherId ||
                    authorizedClasses.length === 0
                  }
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 bg-white disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">
                    {!teacherId
                      ? "Teacher profile unavailable"
                      : authorizedClasses.length === 0
                        ? "No authorized classes"
                        : "Select class"}
                  </option>

                  {authorizedClasses.map(
                    (classLevel) => (
                      <option
                        key={classLevel.id}
                        value={classLevel.id}
                      >
                        {classLevel.name}
                      </option>
                    ),
                  )}
                </select>

                {teacherId &&
                  authorizedClasses.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1.5">
                      Only classes where you have
                      an assigned subject are shown.
                    </p>
                  )}
              </div>

              {/* SUBJECT */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                  <span className="text-red-500">
                    {" "}*
                  </span>
                </label>

                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  disabled={
                    !form.class_level ||
                    authorizedSubjects.length === 0
                  }
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 bg-white disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">
                    {!form.class_level
                      ? "Select class first"
                      : authorizedSubjects.length === 0
                        ? "No authorized subjects"
                        : "Select subject"}
                  </option>

                  {authorizedSubjects.map(
                    (subject) => (
                      <option
                        key={subject.id}
                        value={subject.id}
                      >
                        {subject.name}
                      </option>
                    ),
                  )}
                </select>

                {form.class_level &&
                  authorizedSubjects.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1.5">
                      Only subjects assigned to you
                      for this class are shown.
                    </p>
                  )}
              </div>
            </div>
          </section>

          {/* =================================================
              ASSIGNMENT DETAILS
          ================================================= */}

          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-6">

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                <FileText size={20} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Assignment Details
                </h2>

                <p className="text-sm text-gray-500">
                  Enter the assignment title and
                  instructions.
                </p>
              </div>
            </div>

            <div className="space-y-5">

              {/* TITLE */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Title
                  <span className="text-red-500">
                    {" "}*
                  </span>
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Algebra Exercise"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* INSTRUCTIONS */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions
                </label>

                <textarea
                  name="instructions"
                  value={form.instructions}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Enter the instructions students should follow..."
                  className="w-full rounded-xl border border-gray-300 px-3 py-3 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          {/* =================================================
              DATES & SCORING
          ================================================= */}

          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-6">

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                <Calendar size={20} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Dates & Scoring
                </h2>

                <p className="text-sm text-gray-500">
                  Set the assignment date, deadline
                  and maximum score.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              {/* ASSIGNED DATE */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Date
                </label>

                <input
                  type="date"
                  name="assigned_date"
                  value={form.assigned_date}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <p className="text-xs text-gray-500 mt-1.5">
                  This is a date only.
                </p>
              </div>

              {/* DUE DATE */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>

                <input
                  type="datetime-local"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <p className="text-xs text-gray-500 mt-1.5">
                  Deadline includes date and time.
                </p>
              </div>

              {/* MAX SCORE */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Score
                  <span className="text-red-500">
                    {" "}*
                  </span>
                </label>

                <input
                  type="number"
                  name="maximum_score"
                  value={form.maximum_score}
                  onChange={handleChange}
                  min="1"
                  step="0.01"
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* LATE SUBMISSION */}

            <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
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
                  <span className="block text-sm font-medium text-gray-900">
                    Allow late submissions
                  </span>

                  <span className="block text-xs text-gray-500 mt-1">
                    Students will still be able to
                    submit after the deadline when
                    this option is enabled.
                  </span>
                </span>
              </label>
            </div>
          </section>

          {/* =================================================
              ATTACHMENT
          ================================================= */}

          <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-6">

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                <Paperclip size={20} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Attachment
                </h2>

                <p className="text-sm text-gray-500">
                  Optionally attach a file for students.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment File
              </label>

              <input
                type="file"
                name="attachment"
                onChange={handleChange}
                className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200"
              />

              {form.attachment && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected:{" "}
                  <span className="font-medium">
                    {form.attachment.name}
                  </span>
                </p>
              )}
            </div>
          </section>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pb-8">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/teacher/assignments",
                )
              }
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                !teacherId ||
                !selectedClassSubject
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Create Assignment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}