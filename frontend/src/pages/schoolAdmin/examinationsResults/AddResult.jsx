// import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import {
//   AlertCircle,
//   ArrowLeft,
//   CheckCircle,
//   Loader2,
//   Save,
// } from "lucide-react";

// import {
//   createStudentResult,
// } from "../../../services/resultsService";

// import {
//   getExaminations,
//   getExaminationSubjects,
// } from "../../../services/examinationsService";

// import {
//   getSessions,
//   getTerms,
//   getClassLevels,
// } from "../../../services/academicsService";

// import api from "../../../services/api";

// // ============================================================
// // HELPERS
// // ============================================================

// const getArray = (data) => {
//   if (Array.isArray(data)) return data;
//   if (Array.isArray(data?.results)) return data.results;
//   return [];
// };

// const formatScore = (value) => {
//   if (value === null || value === undefined || value === "") {
//     return "";
//   }

//   return String(value);
// };

// // ============================================================
// // COMPONENT
// // ============================================================

// export default function AddResult() {
//   const navigate = useNavigate();

//   // ----------------------------------------------------------
//   // DATA
//   // ----------------------------------------------------------

//   const [students, setStudents] = useState([]);
//   const [examinations, setExaminations] = useState([]);
//   const [examinationSubjects, setExaminationSubjects] = useState([]);
//   const [sessions, setSessions] = useState([]);
//   const [terms, setTerms] = useState([]);
//   const [classLevels, setClassLevels] = useState([]);

//   // ----------------------------------------------------------
//   // FORM
//   // ----------------------------------------------------------

//   const [form, setForm] = useState({
//     student: "",
//     examination_subject: "",
//     ca_score: "",
//     exam_score: "",
//   });

//   // ----------------------------------------------------------
//   // UI
//   // ----------------------------------------------------------

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   // ----------------------------------------------------------
//   // FILTERS
//   // ----------------------------------------------------------

//   const [sessionFilter, setSessionFilter] = useState("");
//   const [termFilter, setTermFilter] = useState("");
//   const [classFilter, setClassFilter] = useState("");
//   const [examinationFilter, setExaminationFilter] = useState("");

//   // ==========================================================
//   // LOAD DATA
//   // ==========================================================

//   useEffect(() => {
//     let mounted = true;

//     const loadData = async () => {
//       setLoading(true);
//       setError("");

//       try {
//         const [
//           studentsResponse,
//           examinationsResponse,
//           subjectsResponse,
//           sessionsResponse,
//           termsResponse,
//           classesResponse,
//         ] = await Promise.all([
//           api.get("/students/"),
//           getExaminations(),
//           getExaminationSubjects(),
//           getSessions(),
//           getTerms(),
//           getClassLevels(),
//         ]);

//         if (!mounted) return;

//         setStudents(getArray(studentsResponse.data));
//         setExaminations(getArray(examinationsResponse));
//         setExaminationSubjects(getArray(subjectsResponse));
//         setSessions(getArray(sessionsResponse));
//         setTerms(getArray(termsResponse));
//         setClassLevels(getArray(classesResponse));
//       } catch (err) {
//         console.error("Failed to load Add Result data:", err);

//         if (!mounted) return;

//         setError(
//           err?.response?.data?.detail ||
//             "Failed to load the information required to enter a result."
//         );
//       } finally {
//         if (mounted) {
//           setLoading(false);
//         }
//       }
//     };

//     loadData();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   // ==========================================================
//   // NORMALIZED VALUES
//   // ==========================================================

//   const selectedExamination = useMemo(() => {
//     return examinations.find(
//       (exam) => String(exam.id) === String(examinationFilter)
//     );
//   }, [examinations, examinationFilter]);

//   const selectedSubject = useMemo(() => {
//     return examinationSubjects.find(
//       (item) => String(item.id) === String(form.examination_subject)
//     );
//   }, [examinationSubjects, form.examination_subject]);

//   // ==========================================================
//   // FILTER EXAMINATIONS
//   // ==========================================================

//   const filteredExaminations = useMemo(() => {
//     return examinations.filter((exam) => {
//       const sessionMatches =
//         !sessionFilter ||
//         String(exam.academic_session) === String(sessionFilter);

//       const termMatches =
//         !termFilter ||
//         String(exam.term) === String(termFilter);

//       const classMatches =
//         !classFilter ||
//         String(exam.class_level) === String(classFilter);

//       return sessionMatches && termMatches && classMatches;
//     });
//   }, [
//     examinations,
//     sessionFilter,
//     termFilter,
//     classFilter,
//   ]);

//   // ==========================================================
//   // FILTER SUBJECTS
//   // ==========================================================

//   const filteredSubjects = useMemo(() => {
//     if (!examinationFilter) {
//       return [];
//     }

//     return examinationSubjects.filter(
//       (item) =>
//         String(item.examination) === String(examinationFilter)
//     );
//   }, [examinationSubjects, examinationFilter]);

//   // ==========================================================
//   // FILTER STUDENTS
//   // ==========================================================

//   const filteredStudents = useMemo(() => {
//     let result = [...students];

//     // If an examination has been selected, restrict students
//     // to the examination class where the available student
//     // information contains class_level/class.
//     if (selectedExamination?.class_level) {
//       const classId = String(selectedExamination.class_level);

//       const studentsWithClass = result.filter((student) => {
//         const studentClass =
//           student.class_level ??
//           student.current_class_level ??
//           student.class ??
//           student.current_class;

//         return studentClass !== undefined && studentClass !== null;
//       });

//       if (studentsWithClass.length > 0) {
//         result = studentsWithClass.filter((student) => {
//           const studentClass =
//             student.class_level ??
//             student.current_class_level ??
//             student.class ??
//             student.current_class;

//           return String(studentClass) === classId;
//         });
//       }
//     }

//     return result;
//   }, [students, selectedExamination]);

//   // ==========================================================
//   // SCORE LIMIT
//   // ==========================================================

//   const maximumScore = useMemo(() => {
//     if (!selectedSubject) return null;

//     const value = Number(selectedSubject.maximum_score);

//     return Number.isFinite(value) ? value : null;
//   }, [selectedSubject]);

//   // ==========================================================
//   // HANDLE FORM
//   // ==========================================================

//   const handleChange = (event) => {
//     const { name, value } = event.target;

//     setForm((previous) => ({
//       ...previous,
//       [name]: value,
//     }));

//     setError("");
//     setSuccess("");
//   };

//   // ==========================================================
//   // HANDLE SESSION FILTER
//   // ==========================================================

//   const handleSessionChange = (event) => {
//     const value = event.target.value;

//     setSessionFilter(value);

//     setExaminationFilter("");
//     setForm((previous) => ({
//       ...previous,
//       examination_subject: "",
//       student: "",
//     }));

//     setError("");
//   };

//   // ==========================================================
//   // HANDLE TERM FILTER
//   // ==========================================================

//   const handleTermChange = (event) => {
//     const value = event.target.value;

//     setTermFilter(value);

//     setExaminationFilter("");
//     setForm((previous) => ({
//       ...previous,
//       examination_subject: "",
//       student: "",
//     }));

//     setError("");
//   };

//   // ==========================================================
//   // HANDLE CLASS FILTER
//   // ==========================================================

//   const handleClassChange = (event) => {
//     const value = event.target.value;

//     setClassFilter(value);

//     setExaminationFilter("");
//     setForm((previous) => ({
//       ...previous,
//       examination_subject: "",
//       student: "",
//     }));

//     setError("");
//   };

//   // ==========================================================
//   // HANDLE EXAMINATION
//   // ==========================================================

//   const handleExaminationChange = (event) => {
//     const value = event.target.value;

//     setExaminationFilter(value);

//     setForm((previous) => ({
//       ...previous,
//       examination_subject: "",
//       student: "",
//     }));

//     setError("");
//   };

//   // ==========================================================
//   // VALIDATION
//   // ==========================================================

//   const validateForm = () => {
//     if (!form.student) {
//       return "Please select a student.";
//     }

//     if (!form.examination_subject) {
//       return "Please select an examination subject.";
//     }

//     const ca = Number(form.ca_score || 0);
//     const exam = Number(form.exam_score || 0);

//     if (!Number.isFinite(ca) || ca < 0) {
//       return "CA score must be a valid non-negative number.";
//     }

//     if (!Number.isFinite(exam) || exam < 0) {
//       return "Exam score must be a valid non-negative number.";
//     }

//     if (maximumScore !== null && ca + exam > maximumScore) {
//       return `The combined CA and examination score cannot exceed ${maximumScore}.`;
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

//     const validationError = validateForm();

//     if (validationError) {
//       setError(validationError);
//       return;
//     }

//     setSaving(true);

//     try {
//       const payload = {
//         student: Number(form.student),
//         examination_subject: Number(form.examination_subject),
//         ca_score: Number(form.ca_score || 0),
//         exam_score: Number(form.exam_score || 0),
//       };

//       await createStudentResult(payload);

//       setSuccess("Student result was created successfully.");

//       setTimeout(() => {
//         navigate("/school-admin/examinations-results/results");
//       }, 700);
//     } catch (err) {
//       console.error("Failed to create student result:", err);

//       const responseData = err?.response?.data;

//       let message =
//         responseData?.detail ||
//         responseData?.error ||
//         "Failed to create the student result.";

//       if (typeof responseData === "object" && !responseData?.detail) {
//         const fieldErrors = Object.entries(responseData)
//           .map(([field, messages]) => {
//             const text = Array.isArray(messages)
//               ? messages.join(" ")
//               : String(messages);

//             return `${field}: ${text}`;
//           })
//           .join(" ");

//         if (fieldErrors) {
//           message = fieldErrors;
//         }
//       }

//       setError(message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ==========================================================
//   // LOADING
//   // ==========================================================

//   if (loading) {
//     return (
//       <div className="min-h-[60vh] flex items-center justify-center bg-background text-text">
//         <div className="flex flex-col items-center gap-3">
//           <Loader2 className="w-8 h-8 animate-spin text-primary" />
//           <p className="text-sm opacity-70">
//             Loading result entry form...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // ==========================================================
//   // RENDER
//   // ==========================================================

//   return (
//     <div className="min-h-screen bg-background text-text p-4 sm:p-6">
//       <div className="max-w-5xl mx-auto space-y-6">

//         {/* ==================================================
//             HEADER
//         ================================================== */}

//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//           <div>
//             <button
//               type="button"
//               onClick={() =>
//                 navigate(
//                   "/school-admin/examinations-results/results"
//                 )
//               }
//               className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-3"
//             >
//               <ArrowLeft className="w-4 h-4" />
//               Back to Results
//             </button>

//             <h1 className="text-2xl sm:text-3xl font-bold">
//               Add Student Result
//             </h1>

//             <p className="text-sm opacity-70 mt-1">
//               Enter CA and examination scores for a student.
//             </p>
//           </div>
//         </div>

//         {/* ==================================================
//             ALERTS
//         ================================================== */}

//         {error && (
//           <div className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4 text-red-700 dark:text-red-300">
//             <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />

//             <div>
//               <p className="font-semibold">
//                 Unable to save result
//               </p>

//               <p className="text-sm mt-1">
//                 {error}
//               </p>
//             </div>
//           </div>
//         )}

//         {success && (
//           <div className="flex items-start gap-3 rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/30 p-4 text-green-700 dark:text-green-300">
//             <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />

//             <p className="text-sm font-medium">
//               {success}
//             </p>
//           </div>
//         )}

//         {/* ==================================================
//             FORM
//         ================================================== */}

//         <form
//           onSubmit={handleSubmit}
//           className="bg-card rounded-2xl border border-black/5 dark:border-white/10 shadow-sm overflow-hidden"
//         >
//           {/* -----------------------------------------------
//               EXAMINATION CONTEXT
//           ------------------------------------------------ */}

//           <div className="p-5 sm:p-6 border-b border-black/5 dark:border-white/10">
//             <h2 className="text-lg font-semibold">
//               Examination
//             </h2>

//             <p className="text-sm opacity-60 mt-1">
//               Select the academic context and examination.
//             </p>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">

//               {/* SESSION */}

//               <div>
//                 <label className="block text-sm font-medium mb-2">
//                   Academic Session
//                 </label>

//                 <select
//                   value={sessionFilter}
//                   onChange={handleSessionChange}
//                   className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary"
//                 >
//                   <option value="">
//                     All Sessions
//                   </option>

//                   {sessions.map((session) => (
//                     <option
//                       key={session.id}
//                       value={session.id}
//                     >
//                       {session.name ||
//                         session.session_name ||
//                         `Session ${session.id}`}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* TERM */}

//               <div>
//                 <label className="block text-sm font-medium mb-2">
//                   Term
//                 </label>

//                 <select
//                   value={termFilter}
//                   onChange={handleTermChange}
//                   className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary"
//                 >
//                   <option value="">
//                     All Terms
//                   </option>

//                   {terms.map((term) => (
//                     <option
//                       key={term.id}
//                       value={term.id}
//                     >
//                       {term.name ||
//                         term.term_name ||
//                         term.term_display ||
//                         `Term ${term.id}`}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* CLASS */}

//               <div>
//                 <label className="block text-sm font-medium mb-2">
//                   Class
//                 </label>

//                 <select
//                   value={classFilter}
//                   onChange={handleClassChange}
//                   className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary"
//                 >
//                   <option value="">
//                     All Classes
//                   </option>

//                   {classLevels.map((classLevel) => (
//                     <option
//                       key={classLevel.id}
//                       value={classLevel.id}
//                     >
//                       {classLevel.name ||
//                         classLevel.class_name ||
//                         classLevel.code ||
//                         `Class ${classLevel.id}`}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* EXAMINATION */}

//               <div>
//                 <label className="block text-sm font-medium mb-2">
//                   Examination
//                 </label>

//                 <select
//                   value={examinationFilter}
//                   onChange={handleExaminationChange}
//                   className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary"
//                 >
//                   <option value="">
//                     Select Examination
//                   </option>

//                   {filteredExaminations.map((exam) => (
//                     <option
//                       key={exam.id}
//                       value={exam.id}
//                     >
//                       {exam.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* -----------------------------------------------
//               STUDENT & SUBJECT
//           ------------------------------------------------ */}

//           <div className="p-5 sm:p-6 border-b border-black/5 dark:border-white/10">
//             <h2 className="text-lg font-semibold">
//               Student & Subject
//             </h2>

//             <p className="text-sm opacity-60 mt-1">
//               Select the student and examination subject.
//             </p>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">

//               {/* STUDENT */}

//               <div>
//                 <label className="block text-sm font-medium mb-2">
//                   Student
//                 </label>

//                 <select
//                   name="student"
//                   value={form.student}
//                   onChange={handleChange}
//                   disabled={!examinationFilter}
//                   className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
//                 >
//                   <option value="">
//                     {!examinationFilter
//                       ? "Select examination first"
//                       : "Select Student"}
//                   </option>

//                   {filteredStudents.map((student) => (
//                     <option
//                       key={student.id}
//                       value={student.id}
//                     >
//                       {student.full_name ||
//                         student.student_name ||
//                         student.name ||
//                         `${student.first_name || ""} ${
//                           student.last_name || ""
//                         }`.trim() ||
//                         student.admission_number ||
//                         `Student ${student.id}`}
//                       {student.admission_number
//                         ? ` — ${student.admission_number}`
//                         : ""}
//                     </option>
//                   ))}
//                 </select>

//                 {examinationFilter &&
//                   filteredStudents.length === 0 && (
//                     <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
//                       No students were returned for this
//                       examination class.
//                     </p>
//                   )}
//               </div>

//               {/* SUBJECT */}

//               <div>
//                 <label className="block text-sm font-medium mb-2">
//                   Examination Subject
//                 </label>

//                 <select
//                   name="examination_subject"
//                   value={form.examination_subject}
//                   onChange={handleChange}
//                   disabled={!examinationFilter}
//                   className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
//                 >
//                   <option value="">
//                     {!examinationFilter
//                       ? "Select examination first"
//                       : "Select Subject"}
//                   </option>

//                   {filteredSubjects.map((item) => (
//                     <option
//                       key={item.id}
//                       value={item.id}
//                     >
//                       {item.subject_name ||
//                         item.subject?.name ||
//                         item.subject ||
//                         `Subject ${item.id}`}
//                     </option>
//                   ))}
//                 </select>

//                 {examinationFilter &&
//                   filteredSubjects.length === 0 && (
//                     <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
//                       No subjects have been added to this
//                       examination.
//                     </p>
//                   )}
//               </div>
//             </div>
//           </div>

//           {/* -----------------------------------------------
//               SCORES
//           ------------------------------------------------ */}

//           <div className="p-5 sm:p-6">
//             <h2 className="text-lg font-semibold">
//               Scores
//             </h2>

//             <p className="text-sm opacity-60 mt-1">
//               Enter the CA and examination scores.
//             </p>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">

//               {/* CA */}

//               <div>
//                 <label className="block text-sm font-medium mb-2">
//                   CA Score
//                 </label>

//                 <input
//                   type="number"
//                   name="ca_score"
//                   min="0"
//                   step="0.01"
//                   value={formatScore(form.ca_score)}
//                   onChange={handleChange}
//                   placeholder="0"
//                   className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary"
//                 />

//                 <p className="text-xs opacity-50 mt-2">
//                   Enter 0 if there is no CA score.
//                 </p>
//               </div>

//               {/* EXAM */}

//               <div>
//                 <label className="block text-sm font-medium mb-2">
//                   Examination Score
//                 </label>

//                 <input
//                   type="number"
//                   name="exam_score"
//                   min="0"
//                   step="0.01"
//                   value={formatScore(form.exam_score)}
//                   onChange={handleChange}
//                   placeholder="0"
//                   className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-background px-3 py-2.5 outline-none focus:ring-2 focus:ring-primary"
//                 />

//                 <p className="text-xs opacity-50 mt-2">
//                   Enter 0 if there is no examination score.
//                 </p>
//               </div>
//             </div>

//             {/* SCORE PREVIEW */}

//             {selectedSubject && (
//               <div className="mt-5 rounded-xl bg-background border border-black/5 dark:border-white/10 p-4">
//                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//                   <div>
//                     <p className="text-sm font-medium">
//                       Score Preview
//                     </p>

//                     <p className="text-xs opacity-60 mt-1">
//                       Maximum score:{" "}
//                       {maximumScore ?? "—"}
//                     </p>
//                   </div>

//                   <div className="text-left sm:text-right">
//                     <p className="text-2xl font-bold text-primary">
//                       {(
//                         Number(form.ca_score || 0) +
//                         Number(form.exam_score || 0)
//                       ).toFixed(2)}
//                     </p>

//                     <p className="text-xs opacity-60">
//                       Combined Score
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* ---------------------------------------------
//                 ACTIONS
//             ---------------------------------------------- */}

//             <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
//               <button
//                 type="button"
//                 onClick={() =>
//                   navigate(
//                     "/school-admin/examinations-results/results"
//                   )
//                 }
//                 disabled={saving}
//                 className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-background transition disabled:opacity-50"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="submit"
//                 disabled={saving}
//                 className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white hover:opacity-90 transition disabled:opacity-50"
//               >
//                 {saving ? (
//                   <>
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                     <Save className="w-4 h-4" />
//                     Save Result
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
  getExaminations,
  getExaminationSubjects,
} from "../../../services/examinationsService";

import {
  createStudentResult,
  getStudentResults,
} from "../../../services/resultsService";

import {
  getStudents,
  getEnrollments,
} from "../../../services/studentsService";

// ============================================================
// HELPERS
// ============================================================

const getArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const getErrorMessage = (err) => {
  const responseData = err?.response?.data;

  if (!responseData) {
    return "An unexpected error occurred. Please try again.";
  }

  if (typeof responseData === "string") {
    return responseData;
  }

  if (responseData.detail) {
    return responseData.detail;
  }

  if (responseData.error) {
    return responseData.error;
  }

  if (responseData.non_field_errors) {
    return getArray(responseData.non_field_errors).join(" ");
  }

  return Object.entries(responseData)
    .map(([field, messages]) => {
      const message = Array.isArray(messages)
        ? messages.join(", ")
        : String(messages);

      return `${field}: ${message}`;
    })
    .join(" | ") || "Failed to process the request.";
};

// ============================================================
// COMPONENT
// ============================================================

export default function AddResult() {
  const navigate = useNavigate();

  // ==========================================================
  // DATA
  // ==========================================================

  const [examinations, setExaminations] = useState([]);
  const [examinationSubjects, setExaminationSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [existingResults, setExistingResults] = useState([]);

  // ==========================================================
  // UI STATE
  // ==========================================================

  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================================
  // FORM
  // ==========================================================

  const [formData, setFormData] = useState({
    examination: "",
    examination_subject: "",
    student: "",
    ca_score: "",
    exam_score: "",
    is_published: false,
  });

  // ==========================================================
  // LOAD INITIAL DATA
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          examinationsData,
          subjectsData,
          studentsData,
          resultsData,
        ] = await Promise.all([
          getExaminations(),
          getExaminationSubjects(),
          getStudents(),
          getStudentResults(),
        ]);

        if (!mounted) return;

        setExaminations(getArray(examinationsData));
        setExaminationSubjects(getArray(subjectsData));
        setStudents(getArray(studentsData));
        setExistingResults(getArray(resultsData));
      } catch (err) {
        console.error("Failed to load result data:", err);

        if (!mounted) return;

        setError(
          getErrorMessage(err) ||
            "Failed to load examinations, subjects or students."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  // ==========================================================
  // SELECTED EXAMINATION
  // ==========================================================

  const selectedExamination = useMemo(() => {
    return examinations.find(
      (exam) => String(exam.id) === String(formData.examination)
    );
  }, [examinations, formData.examination]);

  // ==========================================================
  // SELECTED SUBJECT
  // ==========================================================

  const selectedExaminationSubject = useMemo(() => {
    return examinationSubjects.find(
      (item) =>
        String(item.id) === String(formData.examination_subject)
    );
  }, [examinationSubjects, formData.examination_subject]);

  // ==========================================================
  // FILTER SUBJECTS BY SELECTED EXAMINATION
  // ==========================================================

  const filteredExaminationSubjects = useMemo(() => {
    if (!formData.examination) {
      return [];
    }

    return examinationSubjects.filter(
      (item) =>
        String(item.examination) === String(formData.examination)
    );
  }, [examinationSubjects, formData.examination]);

  // ==========================================================
  // LOAD ENROLLMENTS FOR SELECTED EXAMINATION
  //
  // The examination determines:
  // - Academic session
  // - Term
  // - Class
  //
  // No separate term or class selection is required.
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadEligibleStudents = async () => {
      setEnrollments([]);

      if (!selectedExamination) {
        setLoadingStudents(false);
        return;
      }

      const academicSession = selectedExamination.academic_session;
      const term = selectedExamination.term;
      const classLevel = selectedExamination.class_level;

      if (
        academicSession === null ||
        academicSession === undefined ||
        academicSession === "" ||
        term === null ||
        term === undefined ||
        term === "" ||
        classLevel === null ||
        classLevel === undefined ||
        classLevel === ""
      ) {
        setLoadingStudents(false);
        setError(
          "This examination does not have a complete academic session, term and class assigned."
        );
        return;
      }

      try {
        setLoadingStudents(true);
        setError("");

        const enrollmentData = await getEnrollments({
          academicSession,
          term,
          classLevel,
        });

        if (!mounted) return;

        setEnrollments(getArray(enrollmentData));
      } catch (err) {
        console.error(
          "Failed to load examination students:",
          err
        );

        if (!mounted) return;

        setEnrollments([]);

        setError(
          getErrorMessage(err) ||
            "Failed to load students for this examination."
        );
      } finally {
        if (mounted) {
          setLoadingStudents(false);
        }
      }
    };

    loadEligibleStudents();

    return () => {
      mounted = false;
    };
  }, [selectedExamination]);

  // ==========================================================
  // ELIGIBLE STUDENTS
  // ==========================================================

  const eligibleStudents = useMemo(() => {
    if (!enrollments.length) {
      return [];
    }

    const studentIds = new Set(
      enrollments
        .map((enrollment) =>
          enrollment.student ?? enrollment.student_id
        )
        .filter((id) => id !== null && id !== undefined)
        .map(String)
    );

    return students.filter((student) =>
      studentIds.has(String(student.id))
    );
  }, [enrollments, students]);

  // ==========================================================
  // SCORES
  // ==========================================================

  const caScore =
    formData.ca_score === "" ? 0 : Number(formData.ca_score);

  const examScore =
    formData.exam_score === "" ? 0 : Number(formData.exam_score);

  const totalScore = caScore + examScore;

  const maximumScore = selectedExaminationSubject
    ? Number(selectedExaminationSubject.maximum_score || 0)
    : 0;

  // ==========================================================
  // EXISTING RESULT / DUPLICATE CHECK
  // ==========================================================

  const existingResult = useMemo(() => {
    if (
      !formData.student ||
      !formData.examination_subject
    ) {
      return null;
    }

    return (
      existingResults.find(
        (result) =>
          String(result.student) === String(formData.student) &&
          String(result.examination_subject) ===
            String(formData.examination_subject)
      ) || null
    );
  }, [
    existingResults,
    formData.student,
    formData.examination_subject,
  ]);

  // ==========================================================
  // HANDLE EXAMINATION CHANGE
  // ==========================================================

  const handleExaminationChange = (event) => {
    const examinationId = event.target.value;

    setFormData({
      examination: examinationId,
      examination_subject: "",
      student: "",
      ca_score: "",
      exam_score: "",
      is_published: false,
    });

    setEnrollments([]);
    setError("");
    setSuccess("");
  };

  // ==========================================================
  // HANDLE SUBJECT CHANGE
  // ==========================================================

  const handleSubjectChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      examination_subject: event.target.value,
      student: "",
      ca_score: "",
      exam_score: "",
    }));

    setError("");
    setSuccess("");
  };

  // ==========================================================
  // HANDLE GENERAL INPUT
  // ==========================================================

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
    setSuccess("");
  };

  // ==========================================================
  // SUBMIT RESULT
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.examination) {
      setError("Please select an examination.");
      return;
    }

    if (!formData.examination_subject) {
      setError("Please select an examination subject.");
      return;
    }

    if (!formData.student) {
      setError("Please select a student.");
      return;
    }

    if (formData.ca_score === "") {
      setError("Please enter the CA score.");
      return;
    }

    if (formData.exam_score === "") {
      setError("Please enter the examination score.");
      return;
    }

    if (
      !Number.isFinite(caScore) ||
      !Number.isFinite(examScore)
    ) {
      setError("Scores must be valid numbers.");
      return;
    }

    if (caScore < 0) {
      setError("CA score cannot be negative.");
      return;
    }

    if (examScore < 0) {
      setError("Examination score cannot be negative.");
      return;
    }

    if (
      selectedExaminationSubject &&
      totalScore > maximumScore
    ) {
      setError(
        `The total score (${totalScore}) cannot be greater than the maximum score (${maximumScore}).`
      );
      return;
    }

    if (existingResult) {
      setError(
        `This student already has a result for ${
          selectedExaminationSubject?.subject_name || "this subject"
        }. Please edit the existing result instead.`
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        student: Number(formData.student),
        examination_subject: Number(formData.examination_subject),
        ca_score: caScore,
        exam_score: examScore,
        is_published: formData.is_published,
      };

      await createStudentResult(payload);

      setSuccess("Student result was added successfully.");

      // Update the local duplicate-check list.
      setExistingResults((previous) => [
        ...previous,
        {
          student: Number(formData.student),
          examination_subject: Number(
            formData.examination_subject
          ),
        },
      ]);

      // Keep the examination and subject selected
      // to make entering the next student's result easier.
      setFormData((previous) => ({
        ...previous,
        student: "",
        ca_score: "",
        exam_score: "",
      }));
    } catch (err) {
      console.error("Failed to create student result:", err);

      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background text-text p-6">
        <div className="bg-card border border-black/5 dark:border-white/10 rounded-xl p-8 text-center">
          <p className="text-sm opacity-70">
            Loading result form...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-background text-text p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              Add Student Result
            </h1>

            <p className="text-sm opacity-70 mt-1">
              Enter CA and examination scores for a student.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/school-admin/examinations-results/results")
            }
            className="border border-gray-300 dark:border-gray-700 px-5 py-2.5 rounded-lg hover:bg-background"
          >
            Back to Results
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div
            role="alert"
            className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-5"
          >
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div
            role="status"
            className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg mb-5"
          >
            {success}
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-black/5 dark:border-white/10 rounded-xl shadow-sm overflow-hidden"
        >

          {/* EXAMINATION */}

          <div className="p-5 sm:p-6 border-b border-black/5 dark:border-white/10">
            <h2 className="text-lg font-semibold mb-4">
              Examination
            </h2>

            <label
              htmlFor="examination"
              className="block text-sm font-medium mb-2"
            >
              Select Examination
            </label>

            <select
              id="examination"
              name="examination"
              value={formData.examination}
              onChange={handleExaminationChange}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select examination</option>

              {examinations.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.name ||
                    exam.examination_name ||
                    `Examination ${exam.id}`}
                </option>
              ))}
            </select>

            {/* EXAMINATION DETAILS ARE DISPLAY-ONLY */}

            {selectedExamination && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                <div className="bg-background border border-black/5 dark:border-white/10 rounded-lg p-4">
                  <p className="text-xs opacity-60">
                    Academic Session
                  </p>

                  <p className="font-medium mt-1">
                    {selectedExamination.session_name ||
                      selectedExamination.academic_session_name ||
                      selectedExamination.academic_session ||
                      "—"}
                  </p>
                </div>

                <div className="bg-background border border-black/5 dark:border-white/10 rounded-lg p-4">
                  <p className="text-xs opacity-60">
                    Term
                  </p>

                  <p className="font-medium mt-1">
                    {selectedExamination.term_name ||
                      selectedExamination.term ||
                      "—"}
                  </p>
                </div>

                <div className="bg-background border border-black/5 dark:border-white/10 rounded-lg p-4">
                  <p className="text-xs opacity-60">
                    Class
                  </p>

                  <p className="font-medium mt-1">
                    {selectedExamination.class_name ||
                      selectedExamination.class_level_name ||
                      selectedExamination.class_level ||
                      "—"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* SUBJECT */}

          <div className="p-5 sm:p-6 border-b border-black/5 dark:border-white/10">
            <h2 className="text-lg font-semibold mb-4">
              Subject
            </h2>

            <label
              htmlFor="examination_subject"
              className="block text-sm font-medium mb-2"
            >
              Examination Subject
            </label>

            <select
              id="examination_subject"
              name="examination_subject"
              value={formData.examination_subject}
              onChange={handleSubjectChange}
              disabled={!formData.examination}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              <option value="">
                {formData.examination
                  ? "Select subject"
                  : "Select examination first"}
              </option>

              {filteredExaminationSubjects.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.subject_name ||
                    item.subject?.name ||
                    item.subject ||
                    `Subject ${item.id}`}
                </option>
              ))}
            </select>

            {formData.examination &&
              filteredExaminationSubjects.length === 0 && (
                <p className="text-sm text-amber-600 mt-2">
                  No subjects have been added to this examination.
                </p>
              )}

            {selectedExaminationSubject && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                <div className="bg-background border border-black/5 dark:border-white/10 rounded-lg p-4">
                  <p className="text-xs opacity-60">
                    Subject
                  </p>

                  <p className="font-medium mt-1">
                    {selectedExaminationSubject.subject_name ||
                      selectedExaminationSubject.subject?.name ||
                      "—"}
                  </p>
                </div>

                <div className="bg-background border border-black/5 dark:border-white/10 rounded-lg p-4">
                  <p className="text-xs opacity-60">
                    Maximum Score
                  </p>

                  <p className="font-medium mt-1">
                    {maximumScore}
                  </p>
                </div>

                <div className="bg-background border border-black/5 dark:border-white/10 rounded-lg p-4">
                  <p className="text-xs opacity-60">
                    Pass Mark
                  </p>

                  <p className="font-medium mt-1">
                    {selectedExaminationSubject.pass_mark ?? "—"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* STUDENT */}

          <div className="p-5 sm:p-6 border-b border-black/5 dark:border-white/10">
            <h2 className="text-lg font-semibold mb-4">
              Student
            </h2>

            <label
              htmlFor="student"
              className="block text-sm font-medium mb-2"
            >
              Select Student
            </label>

            <select
              id="student"
              name="student"
              value={formData.student}
              onChange={handleChange}
              disabled={
                !formData.examination ||
                !formData.examination_subject ||
                loadingStudents
              }
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              <option value="">
                {loadingStudents
                  ? "Loading students..."
                  : !formData.examination
                    ? "Select examination first"
                    : !formData.examination_subject
                      ? "Select subject first"
                      : eligibleStudents.length === 0
                        ? "No students enrolled for this examination"
                        : "Select student"}
              </option>

              {eligibleStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name ||
                    `${student.first_name || ""} ${
                      student.last_name || ""
                    }`.trim() ||
                    `Student ${student.id}`}
                  {student.admission_number
                    ? ` — ${student.admission_number}`
                    : ""}
                </option>
              ))}
            </select>

            {formData.examination &&
              formData.examination_subject &&
              !loadingStudents &&
              eligibleStudents.length === 0 && (
                <p className="text-sm text-amber-600 mt-2">
                  No student enrollment was found for this
                  examination's session, term and class.
                </p>
              )}

            {existingResult && (
              <div className="mt-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 px-4 py-3 rounded-lg">
                This student already has a result for this subject.
                Please edit the existing result instead.
              </div>
            )}
          </div>

          {/* SCORES */}

          <div className="p-5 sm:p-6 border-b border-black/5 dark:border-white/10">
            <h2 className="text-lg font-semibold mb-4">
              Scores
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <div>
                <label
                  htmlFor="ca_score"
                  className="block text-sm font-medium mb-2"
                >
                  CA Score
                </label>

                <input
                  id="ca_score"
                  type="number"
                  name="ca_score"
                  value={formData.ca_score}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Enter CA score"
                  disabled={!formData.student}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
              </div>

              <div>
                <label
                  htmlFor="exam_score"
                  className="block text-sm font-medium mb-2"
                >
                  Examination Score
                </label>

                <input
                  id="exam_score"
                  type="number"
                  name="exam_score"
                  value={formData.exam_score}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Enter examination score"
                  disabled={!formData.student}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-lg bg-background px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Total Score
                </label>

                <div className="w-full bg-background border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 font-semibold">
                  {Number.isFinite(totalScore)
                    ? totalScore.toFixed(2)
                    : "0.00"}

                  {selectedExaminationSubject && (
                    <span className="opacity-50 font-normal">
                      {" "}/ {maximumScore.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {selectedExaminationSubject &&
              totalScore > maximumScore && (
                <div className="mt-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                  Total score cannot exceed {maximumScore}.
                </div>
              )}
          </div>

          {/* PUBLISH */}

          <div className="p-5 sm:p-6 border-b border-black/5 dark:border-white/10">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleChange}
                className="w-4 h-4"
              />

              <span className="text-sm font-medium">
                Publish this result
              </span>
            </label>

            <p className="text-xs opacity-60 mt-2">
              Leave unchecked if the result should remain a draft.
            </p>
          </div>

          {/* ACTIONS */}

          <div className="p-5 sm:p-6 flex flex-col-reverse sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={() =>
                navigate("/school-admin/examinations-results/results")
              }
              disabled={saving}
              className="px-5 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-background disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                loadingStudents ||
                !!existingResult ||
                !formData.student ||
                !formData.examination_subject
              }
              className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Result"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}