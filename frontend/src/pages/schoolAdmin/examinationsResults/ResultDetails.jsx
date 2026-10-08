// import { useEffect, useMemo, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";

// import {
//   AlertCircle,
//   ArrowLeft,
//   BookOpen,
//   CalendarDays,
//   CheckCircle,
//   ClipboardList,
//   Edit,
//   GraduationCap,
//   Loader2,
//   Trash2,
//   User,
//   XCircle,
// } from "lucide-react";

// import {
//   getStudentResult,
//   deleteStudentResult,
// } from "../../../services/resultsService";

// // ============================================================
// // HELPERS
// // ============================================================

// const formatNumber = (value) => {
//   if (value === null || value === undefined || value === "") {
//     return "0";
//   }

//   const number = Number(value);

//   if (!Number.isFinite(number)) {
//     return value;
//   }

//   return Number.isInteger(number)
//     ? String(number)
//     : number.toFixed(2);
// };

// const formatDate = (value) => {
//   if (!value) return "—";

//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) {
//     return value;
//   }

//   return date.toLocaleDateString("en-NG", {
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   });
// };

// const getStudentName = (result) => {
//   return (
//     result?.student_name ||
//     result?.student_full_name ||
//     result?.student?.name ||
//     "Student"
//   );
// };

// // ============================================================
// // COMPONENT
// // ============================================================

// export default function ResultDetails() {
//   const navigate = useNavigate();
//   const { id } = useParams();

//   // ----------------------------------------------------------
//   // STATE
//   // ----------------------------------------------------------

//   const [result, setResult] = useState(null);

//   const [loading, setLoading] = useState(true);
//   const [deleting, setDeleting] = useState(false);

//   const [error, setError] = useState("");
//   const [deleteError, setDeleteError] = useState("");

//   // ==========================================================
//   // LOAD RESULT
//   // ==========================================================

//   useEffect(() => {
//     let mounted = true;

//     const loadResult = async () => {
//       setLoading(true);
//       setError("");

//       try {
//         const data = await getStudentResult(id);

//         if (!mounted) return;

//         setResult(data);
//       } catch (err) {
//         console.error("Failed to load student result:", err);

//         if (!mounted) return;

//         setError(
//           err?.response?.data?.detail ||
//             err?.response?.data?.error ||
//             "Failed to load this student result."
//         );
//       } finally {
//         if (mounted) {
//           setLoading(false);
//         }
//       }
//     };

//     if (id) {
//       loadResult();
//     } else {
//       setError("No result ID was provided.");
//       setLoading(false);
//     }

//     return () => {
//       mounted = false;
//     };
//   }, [id]);

//   // ==========================================================
//   // DERIVED DATA
//   // ==========================================================

//   const totalScore = useMemo(() => {
//     if (!result) return 0;

//     if (
//       result.total_score !== null &&
//       result.total_score !== undefined
//     ) {
//       return Number(result.total_score);
//     }

//     return (
//       Number(result.ca_score || 0) +
//       Number(result.exam_score || 0)
//     );
//   }, [result]);

//   const studentName = useMemo(
//     () => getStudentName(result),
//     [result]
//   );

//   // ==========================================================
//   // DELETE
//   // ==========================================================

//   const handleDelete = async () => {
//     if (!result) return;

//     const confirmed = window.confirm(
//       `Are you sure you want to delete the result for ${studentName}? This action cannot be undone.`
//     );

//     if (!confirmed) {
//       return;
//     }

//     setDeleting(true);
//     setDeleteError("");

//     try {
//       await deleteStudentResult(result.id);

//       navigate(
//         "/school-admin/examinations-results/results",
//         {
//           replace: true,
//           state: {
//             message: "Student result deleted successfully.",
//           },
//         }
//       );
//     } catch (err) {
//       console.error("Failed to delete student result:", err);

//       setDeleteError(
//         err?.response?.data?.detail ||
//           err?.response?.data?.error ||
//           "Failed to delete this result."
//       );
//     } finally {
//       setDeleting(false);
//     }
//   };

//   // ==========================================================
//   // LOADING
//   // ==========================================================

//   if (loading) {
//     return (
//       <div className="min-h-[60vh] bg-background text-text flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <Loader2 className="w-8 h-8 animate-spin text-primary" />

//           <p className="text-sm opacity-70">
//             Loading result...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // ==========================================================
//   // ERROR
//   // ==========================================================

//   if (error || !result) {
//     return (
//       <div className="min-h-screen bg-background text-text p-4 sm:p-6">
//         <div className="max-w-4xl mx-auto">
//           <button
//             type="button"
//             onClick={() =>
//               navigate(
//                 "/school-admin/examinations-results/results"
//               )
//             }
//             className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-5"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             Back to Results
//           </button>

//           <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-6">
//             <div className="flex items-start gap-3">
//               <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0" />

//               <div>
//                 <h2 className="font-semibold text-red-700 dark:text-red-300">
//                   Unable to load result
//                 </h2>

//                 <p className="text-sm text-red-600 dark:text-red-400 mt-1">
//                   {error || "The requested result could not be found."}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ==========================================================
//   // MAIN
//   // ==========================================================

//   return (
//     <div className="min-h-screen bg-background text-text p-4 sm:p-6">
//       <div className="max-w-5xl mx-auto space-y-6">

//         {/* ==================================================
//             HEADER
//         ================================================== */}

//         <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
//               Result Details
//             </h1>

//             <p className="text-sm opacity-70 mt-1">
//               View the complete examination result.
//             </p>
//           </div>

//           <div className="flex flex-wrap gap-2">
//             <button
//               type="button"
//               onClick={() =>
//                 navigate(
//                   `/school-admin/examinations-results/results/${result.id}/edit`
//                 )
//               }
//               className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white hover:opacity-90 transition"
//             >
//               <Edit className="w-4 h-4" />
//               Edit Result
//             </button>

//             <button
//               type="button"
//               onClick={handleDelete}
//               disabled={deleting}
//               className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition disabled:opacity-50"
//             >
//               {deleting ? (
//                 <Loader2 className="w-4 h-4 animate-spin" />
//               ) : (
//                 <Trash2 className="w-4 h-4" />
//               )}

//               {deleting ? "Deleting..." : "Delete"}
//             </button>
//           </div>
//         </div>

//         {/* ==================================================
//             DELETE ERROR
//         ================================================== */}

//         {deleteError && (
//           <div className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4 text-red-700 dark:text-red-300">
//             <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />

//             <div>
//               <p className="font-semibold">
//                 Delete failed
//               </p>

//               <p className="text-sm mt-1">
//                 {deleteError}
//               </p>
//             </div>
//           </div>
//         )}

//         {/* ==================================================
//             PUBLICATION STATUS
//         ================================================== */}

//         <div
//           className={`rounded-2xl border p-5 ${
//             result.is_published
//               ? "border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/20"
//               : "border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20"
//           }`}
//         >
//           <div className="flex items-center gap-3">
//             {result.is_published ? (
//               <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
//             ) : (
//               <XCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
//             )}

//             <div>
//               <p
//                 className={`font-semibold ${
//                   result.is_published
//                     ? "text-green-700 dark:text-green-300"
//                     : "text-amber-700 dark:text-amber-300"
//                 }`}
//               >
//                 {result.is_published
//                   ? "Result Published"
//                   : "Result Not Published"}
//               </p>

//               <p className="text-sm opacity-70 mt-0.5">
//                 {result.is_published
//                   ? "This result is available to authorized student and parent views."
//                   : "This result is still private and has not been published."}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* ==================================================
//             STUDENT INFORMATION
//         ================================================== */}

//         <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 shadow-sm overflow-hidden">
//           <div className="p-5 border-b border-black/5 dark:border-white/10">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
//                 <User className="w-5 h-5 text-primary" />
//               </div>

//               <div>
//                 <h2 className="text-lg font-semibold">
//                   Student Information
//                 </h2>

//                 <p className="text-sm opacity-60">
//                   Student associated with this result.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

//             <InfoItem
//               label="Student"
//               value={studentName}
//             />

//             <InfoItem
//               label="Admission Number"
//               value={
//                 result.admission_number ||
//                 result.student_admission_number ||
//                 "—"
//               }
//             />

//             <InfoItem
//               label="Student ID"
//               value={result.student ?? "—"}
//             />
//           </div>
//         </div>

//         {/* ==================================================
//             EXAMINATION INFORMATION
//         ================================================== */}

//         <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 shadow-sm overflow-hidden">
//           <div className="p-5 border-b border-black/5 dark:border-white/10">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
//                 <ClipboardList className="w-5 h-5 text-secondary" />
//               </div>

//               <div>
//                 <h2 className="text-lg font-semibold">
//                   Examination Information
//                 </h2>

//                 <p className="text-sm opacity-60">
//                   Academic and examination details.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

//             <InfoItem
//               icon={BookOpen}
//               label="Examination"
//               value={
//                 result.examination_name ||
//                 "—"
//               }
//             />

//             <InfoItem
//               icon={GraduationCap}
//               label="Subject"
//               value={
//                 result.subject_name ||
//                 "—"
//               }
//             />

//             <InfoItem
//               icon={CalendarDays}
//               label="Academic Session"
//               value={
//                 result.academic_session_name ||
//                 result.session_name ||
//                 result.academic_session ||
//                 "—"
//               }
//             />

//             <InfoItem
//               label="Term"
//               value={
//                 result.term_name ||
//                 result.term ||
//                 "—"
//               }
//             />

//             <InfoItem
//               label="Class"
//               value={
//                 result.class_level_name ||
//                 result.class_name ||
//                 result.class_level ||
//                 "—"
//               }
//             />

//             <InfoItem
//               label="Examination Subject ID"
//               value={
//                 result.examination_subject ?? "—"
//               }
//             />
//           </div>
//         </div>

//         {/* ==================================================
//             SCORE SUMMARY
//         ================================================== */}

//         <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 shadow-sm overflow-hidden">
//           <div className="p-5 border-b border-black/5 dark:border-white/10">
//             <h2 className="text-lg font-semibold">
//               Score Summary
//             </h2>

//             <p className="text-sm opacity-60 mt-1">
//               Scores and grading information calculated by the
//               results system.
//             </p>
//           </div>

//           <div className="p-5">
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

//               {/* CA */}

//               <ScoreCard
//                 label="CA Score"
//                 value={formatNumber(result.ca_score)}
//               />

//               {/* EXAM */}

//               <ScoreCard
//                 label="Examination Score"
//                 value={formatNumber(result.exam_score)}
//               />

//               {/* TOTAL */}

//               <ScoreCard
//                 label="Total Score"
//                 value={formatNumber(totalScore)}
//                 highlighted
//               />
//             </div>

//             {/* GRADE */}

//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">

//               <div className="rounded-xl bg-background border border-black/5 dark:border-white/10 p-5">
//                 <p className="text-sm opacity-60">
//                   Grade
//                 </p>

//                 <p className="text-3xl font-bold mt-2">
//                   {result.grade || "—"}
//                 </p>
//               </div>

//               <div className="rounded-xl bg-background border border-black/5 dark:border-white/10 p-5">
//                 <p className="text-sm opacity-60">
//                   Remark
//                 </p>

//                 <p className="text-lg font-semibold mt-2">
//                   {result.remark || "—"}
//                 </p>
//               </div>

//               <div className="rounded-xl bg-background border border-black/5 dark:border-white/10 p-5">
//                 <p className="text-sm opacity-60">
//                   Grade Point
//                 </p>

//                 <p className="text-3xl font-bold mt-2">
//                   {formatNumber(result.grade_point)}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ==================================================
//             POSITION & DATES
//         ================================================== */}

//         <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 shadow-sm overflow-hidden">
//           <div className="p-5 border-b border-black/5 dark:border-white/10">
//             <h2 className="text-lg font-semibold">
//               Additional Information
//             </h2>
//           </div>

//           <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

//             <InfoItem
//               label="Position"
//               value={
//                 result.position !== null &&
//                 result.position !== undefined
//                   ? result.position
//                   : "Not assigned"
//               }
//             />

//             <InfoItem
//               label="Published"
//               value={
//                 result.is_published
//                   ? "Yes"
//                   : "No"
//               }
//             />

//             <InfoItem
//               label="Created"
//               value={formatDate(result.created_at)}
//             />

//             <InfoItem
//               label="Last Updated"
//               value={formatDate(result.updated_at)}
//             />
//           </div>
//         </div>

//         {/* ==================================================
//             BOTTOM ACTIONS
//         ================================================== */}

//         <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pb-6">
//           <button
//             type="button"
//             onClick={() =>
//               navigate(
//                 "/school-admin/examinations-results/results"
//               )
//             }
//             className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-card transition"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             Back to Results
//           </button>

//           <button
//             type="button"
//             onClick={() =>
//               navigate(
//                 `/school-admin/examinations-results/results/${result.id}/edit`
//               )
//             }
//             className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white hover:opacity-90 transition"
//           >
//             <Edit className="w-4 h-4" />
//             Edit Result
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ============================================================
// // INFO ITEM
// // ============================================================

// function InfoItem({
//   label,
//   value,
//   icon: Icon,
// }) {
//   return (
//     <div>
//       <div className="flex items-center gap-2">
//         {Icon && (
//           <Icon className="w-4 h-4 opacity-50" />
//         )}

//         <p className="text-xs uppercase tracking-wide opacity-50">
//           {label}
//         </p>
//       </div>

//       <p className="font-medium mt-1 break-words">
//         {value}
//       </p>
//     </div>
//   );
// }

// // ============================================================
// // SCORE CARD
// // ============================================================

// function ScoreCard({
//   label,
//   value,
//   highlighted = false,
// }) {
//   return (
//     <div
//       className={`rounded-xl border p-5 ${
//         highlighted
//           ? "border-primary/30 bg-primary/5"
//           : "border-black/5 dark:border-white/10 bg-background"
//       }`}
//     >
//       <p className="text-sm opacity-60">
//         {label}
//       </p>

//       <p
//         className={`text-3xl font-bold mt-2 ${
//           highlighted ? "text-primary" : ""
//         }`}
//       >
//         {value}
//       </p>
//     </div>
//   );
// }


import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  Edit,
  GraduationCap,
  Loader2,
  Trash2,
  User,
  XCircle,
} from "lucide-react";

import {
  getStudentResult,
  deleteStudentResult,
} from "../../../services/resultsService";

import api from "../../../services/api";

// ============================================================
// HELPERS
// ============================================================

const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return "0";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return value;
  }

  return Number.isInteger(number)
    ? String(number)
    : number.toFixed(2);
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getStudentName = (result) => {
  return (
    result?.student_name ||
    result?.student_full_name ||
    result?.student?.name ||
    "Student"
  );
};

const getAdmissionNumber = (result, student) => {
  return (
    result?.student_admission_number ||
    result?.admission_number ||
    student?.admission_number ||
    student?.student_admission_number ||
    "—"
  );
};

const getSessionName = (result, examination) => {
  return (
    examination?.academic_session_name ||
    examination?.session_name ||
    result?.academic_session_name ||
    result?.session_name ||
    result?.academic_session_display ||
    "—"
  );
};

const getTermName = (result, examination) => {
  return (
    examination?.term_name ||
    examination?.term_display ||
    result?.term_name ||
    result?.term_display ||
    "—"
  );
};

const getClassName = (result, examination) => {
  return (
    examination?.class_level_name ||
    examination?.class_name ||
    examination?.class_level_display ||
    result?.class_level_name ||
    result?.class_name ||
    result?.class_level_display ||
    "—"
  );
};

const getSubjectName = (result, examinationSubject) => {
  return (
    result?.subject_name ||
    examinationSubject?.subject_name ||
    examinationSubject?.subject?.name ||
    examinationSubject?.subject_title ||
    "—"
  );
};

const getExaminationName = (result, examination) => {
  return (
    result?.examination_name ||
    examination?.name ||
    "—"
  );
};

// ============================================================
// COMPONENT
// ============================================================

export default function ResultDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [result, setResult] = useState(null);
  const [student, setStudent] = useState(null);
  const [examination, setExamination] = useState(null);
  const [examinationSubject, setExaminationSubject] = useState(null);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // ==========================================================
  // LOAD RESULT AND RELATED DISPLAY INFORMATION
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadResult = async () => {
      setLoading(true);
      setError("");

      try {
        // ----------------------------------------------------
        // Load the result
        // ----------------------------------------------------

        const data = await getStudentResult(id);

        if (!mounted) return;

        setResult(data);

        // ----------------------------------------------------
        // Load student information
        //
        // The result serializer gives us the student ID,
        // but the frontend should never display that ID.
        // We use it only internally to retrieve the student.
        // ----------------------------------------------------

        if (data?.student) {
          try {
            const studentResponse = await api.get(
              `/students/${data.student}/`
            );

            if (mounted) {
              setStudent(studentResponse.data);
            }
          } catch (studentError) {
            console.warn(
              "Could not load student details:",
              studentError
            );
          }
        }

        // ----------------------------------------------------
        // Load examination subject
        //
        // This is used internally to identify the examination.
        // The ID is NEVER displayed to the user.
        // ----------------------------------------------------

        if (data?.examination_subject) {
          try {
            const subjectResponse = await api.get(
              `/examinations/subjects/${data.examination_subject}/`
            );

            if (!mounted) return;

            const subjectData = subjectResponse.data;

            setExaminationSubject(subjectData);

            // ------------------------------------------------
            // Load the actual examination
            // ------------------------------------------------

            if (subjectData?.examination) {
              try {
                const examinationResponse = await api.get(
                  `/examinations/${subjectData.examination}/`
                );

                if (mounted) {
                  setExamination(examinationResponse.data);
                }
              } catch (examinationError) {
                console.warn(
                  "Could not load examination details:",
                  examinationError
                );
              }
            }
          } catch (subjectError) {
            console.warn(
              "Could not load examination subject details:",
              subjectError
            );
          }
        }
      } catch (err) {
        console.error(
          "Failed to load student result:",
          err
        );

        if (!mounted) return;

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.error ||
            "Failed to load this student result."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadResult();
    } else {
      setError("No result was provided.");
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  // ==========================================================
  // DERIVED DATA
  // ==========================================================

  const totalScore = useMemo(() => {
    if (!result) return 0;

    if (
      result.total_score !== null &&
      result.total_score !== undefined
    ) {
      return Number(result.total_score);
    }

    return (
      Number(result.ca_score || 0) +
      Number(result.exam_score || 0)
    );
  }, [result]);

  const studentName = useMemo(
    () => getStudentName(result),
    [result]
  );

  const admissionNumber = useMemo(
    () => getAdmissionNumber(result, student),
    [result, student]
  );

  const examinationName = useMemo(
    () => getExaminationName(result, examination),
    [result, examination]
  );

  const subjectName = useMemo(
    () => getSubjectName(result, examinationSubject),
    [result, examinationSubject]
  );

  const academicSessionName = useMemo(
    () => getSessionName(result, examination),
    [result, examination]
  );

  const termName = useMemo(
    () => getTermName(result, examination),
    [result, examination]
  );

  const className = useMemo(
    () => getClassName(result, examination),
    [result, examination]
  );

  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = async () => {
    if (!result) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete the result for ${studentName}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setDeleteError("");

    try {
      await deleteStudentResult(result.id);

      navigate(
        "/school-admin/examinations-results/results",
        {
          replace: true,
          state: {
            message:
              "Student result deleted successfully.",
          },
        }
      );
    } catch (err) {
      console.error(
        "Failed to delete student result:",
        err
      );

      setDeleteError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          "Failed to delete this result."
      );
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-background text-text flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />

          <p className="text-sm opacity-70">
            Loading result...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !result) {
    return (
      <div className="min-h-screen bg-background text-text p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/school-admin/examinations-results/results"
              )
            }
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Results
          </button>

          <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0" />

              <div>
                <h2 className="font-semibold text-red-700 dark:text-red-300">
                  Unable to load result
                </h2>

                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {error ||
                    "The requested result could not be found."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN
  // ==========================================================

  return (
    <div className="min-h-screen bg-background text-text p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/school-admin/examinations-results/results"
                )
              }
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Results
            </button>

            <h1 className="text-2xl sm:text-3xl font-bold">
              Result Details
            </h1>

            <p className="text-sm opacity-70 mt-1">
              View the complete examination result.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/school-admin/examinations-results/results/${result.id}/edit`
                )
              }
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white hover:opacity-90 transition"
            >
              <Edit className="w-4 h-4" />
              Edit Result
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}

              {deleting
                ? "Deleting..."
                : "Delete"}
            </button>
          </div>
        </div>

        {/* ==================================================
            DELETE ERROR
        ================================================== */}

        {deleteError && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4 text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />

            <div>
              <p className="font-semibold">
                Delete failed
              </p>

              <p className="text-sm mt-1">
                {deleteError}
              </p>
            </div>
          </div>
        )}

        {/* ==================================================
            PUBLICATION STATUS
        ================================================== */}

        <div
          className={`rounded-2xl border p-5 ${
            result.is_published
              ? "border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-950/20"
              : "border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20"
          }`}
        >
          <div className="flex items-center gap-3">
            {result.is_published ? (
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            )}

            <div>
              <p
                className={`font-semibold ${
                  result.is_published
                    ? "text-green-700 dark:text-green-300"
                    : "text-amber-700 dark:text-amber-300"
                }`}
              >
                {result.is_published
                  ? "Result Published"
                  : "Result Not Published"}
              </p>

              <p className="text-sm opacity-70 mt-0.5">
                {result.is_published
                  ? "This result is available to authorized student and parent views."
                  : "This result is still private and has not been published."}
              </p>
            </div>
          </div>
        </div>

        {/* ==================================================
            STUDENT INFORMATION
        ================================================== */}

        <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-black/5 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Student Information
                </h2>

                <p className="text-sm opacity-60">
                  Student associated with this result.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            <InfoItem
              label="Student"
              value={studentName}
            />

            <InfoItem
              label="Admission Number"
              value={admissionNumber}
            />

          </div>
        </div>

        {/* ==================================================
            EXAMINATION INFORMATION
        ================================================== */}

        <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-black/5 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-secondary" />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Examination Information
                </h2>

                <p className="text-sm opacity-60">
                  Academic and examination details.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            <InfoItem
              icon={BookOpen}
              label="Examination"
              value={examinationName}
            />

            <InfoItem
              icon={GraduationCap}
              label="Subject"
              value={subjectName}
            />

            <InfoItem
              icon={CalendarDays}
              label="Academic Session"
              value={academicSessionName}
            />

            <InfoItem
              label="Term"
              value={termName}
            />

            <InfoItem
              label="Class"
              value={className}
            />

          </div>
        </div>

        {/* ==================================================
            SCORE SUMMARY
        ================================================== */}

        <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-black/5 dark:border-white/10">
            <h2 className="text-lg font-semibold">
              Score Summary
            </h2>

            <p className="text-sm opacity-60 mt-1">
              Scores and grading information calculated by the
              results system.
            </p>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              <ScoreCard
                label="CA Score"
                value={formatNumber(result.ca_score)}
              />

              <ScoreCard
                label="Examination Score"
                value={formatNumber(result.exam_score)}
              />

              <ScoreCard
                label="Total Score"
                value={formatNumber(totalScore)}
                highlighted
              />

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">

              <div className="rounded-xl bg-background border border-black/5 dark:border-white/10 p-5">
                <p className="text-sm opacity-60">
                  Grade
                </p>

                <p className="text-3xl font-bold mt-2">
                  {result.grade || "—"}
                </p>
              </div>

              <div className="rounded-xl bg-background border border-black/5 dark:border-white/10 p-5">
                <p className="text-sm opacity-60">
                  Remark
                </p>

                <p className="text-lg font-semibold mt-2">
                  {result.remark || "—"}
                </p>
              </div>

              <div className="rounded-xl bg-background border border-black/5 dark:border-white/10 p-5">
                <p className="text-sm opacity-60">
                  Grade Point
                </p>

                <p className="text-3xl font-bold mt-2">
                  {formatNumber(result.grade_point)}
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* ==================================================
            POSITION & DATES
        ================================================== */}

        <div className="bg-card rounded-2xl border border-black/5 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-black/5 dark:border-white/10">
            <h2 className="text-lg font-semibold">
              Additional Information
            </h2>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            <InfoItem
              label="Position"
              value={
                result.position !== null &&
                result.position !== undefined
                  ? result.position
                  : "Not assigned"
              }
            />

            <InfoItem
              label="Published"
              value={
                result.is_published
                  ? "Yes"
                  : "No"
              }
            />

            <InfoItem
              label="Created"
              value={formatDate(result.created_at)}
            />

            <InfoItem
              label="Last Updated"
              value={formatDate(result.updated_at)}
            />

          </div>
        </div>

        {/* ==================================================
            BOTTOM ACTIONS
        ================================================== */}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pb-6">

          <button
            type="button"
            onClick={() =>
              navigate(
                "/school-admin/examinations-results/results"
              )
            }
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-card transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Results
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/school-admin/examinations-results/results/${result.id}/edit`
              )
            }
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white hover:opacity-90 transition"
          >
            <Edit className="w-4 h-4" />
            Edit Result
          </button>

        </div>
      </div>
    </div>
  );
}

// ============================================================
// INFO ITEM
// ============================================================

function InfoItem({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon className="w-4 h-4 opacity-50" />
        )}

        <p className="text-xs uppercase tracking-wide opacity-50">
          {label}
        </p>
      </div>

      <p className="font-medium mt-1 break-words">
        {value}
      </p>
    </div>
  );
}

// ============================================================
// SCORE CARD
// ============================================================

function ScoreCard({
  label,
  value,
  highlighted = false,
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        highlighted
          ? "border-primary/30 bg-primary/5"
          : "border-black/5 dark:border-white/10 bg-background"
      }`}
    >
      <p className="text-sm opacity-60">
        {label}
      </p>

      <p
        className={`text-3xl font-bold mt-2 ${
          highlighted ? "text-primary" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}