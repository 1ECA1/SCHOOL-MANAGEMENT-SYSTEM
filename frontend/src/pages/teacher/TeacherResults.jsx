// import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import {
//   AlertCircle,
//   CheckCircle2,
//   ChevronDown,
//   ClipboardList,
//   Loader2,
//   RefreshCw,
//   Save,
//   Search,
//   X,
// } from "lucide-react";

// import api from "../../services/api";

// import {
//   getStudentResults,
//   createStudentResult,
//   updateStudentResult,
// } from "../../services/resultsService";

// // ============================================================
// // HELPERS
// // ============================================================

// const getArrayData = (data) => {
//   if (Array.isArray(data)) {
//     return data;
//   }

//   if (Array.isArray(data?.results)) {
//     return data.results;
//   }

//   return [];
// };

// const getErrorMessage = (error) => {
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

//   if (typeof data === "object") {
//     const messages = [];

//     Object.entries(data).forEach(([field, value]) => {
//       if (Array.isArray(value)) {
//         messages.push(`${field}: ${value.join(", ")}`);
//       } else if (typeof value === "string") {
//         messages.push(`${field}: ${value}`);
//       } else {
//         messages.push(`${field}: ${JSON.stringify(value)}`);
//       }
//     });

//     if (messages.length) {
//       return messages.join(" | ");
//     }
//   }

//   return "Unable to complete the request.";
// };

// // ============================================================
// // COMPONENT
// // ============================================================

// export default function TeacherResults() {
//   const navigate = useNavigate();

//   // ==========================================================
//   // DATA
//   // ==========================================================

//   const [sessions, setSessions] = useState([]);
//   const [terms, setTerms] = useState([]);
//   const [classes, setClasses] = useState([]);
//   const [examinations, setExaminations] = useState([]);
//   const [examinationSubjects, setExaminationSubjects] = useState([]);
//   const [enrollments, setEnrollments] = useState([]);
//   const [results, setResults] = useState([]);

//   // ==========================================================
//   // FILTERS
//   // ==========================================================

//   const [selectedSession, setSelectedSession] = useState("");
//   const [selectedTerm, setSelectedTerm] = useState("");
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedExamination, setSelectedExamination] =
//     useState("");
//   const [selectedExaminationSubject, setSelectedExaminationSubject] =
//     useState("");

//   const [search, setSearch] = useState("");

//   // ==========================================================
//   // UI
//   // ==========================================================

//   const [loadingInitial, setLoadingInitial] = useState(true);
//   const [loadingRoster, setLoadingRoster] = useState(false);
//   const [loadingResults, setLoadingResults] = useState(false);
//   const [savingStudent, setSavingStudent] = useState(null);

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   // ==========================================================
//   // SCORE INPUTS
//   // ==========================================================

//   /*
//    * scores:
//    *
//    * {
//    *   studentId: {
//    *      ca: "",
//    *      exam: ""
//    *   }
//    * }
//    */

//   const [scores, setScores] = useState({});

//   // ==========================================================
//   // LOAD INITIAL DATA
//   // ==========================================================

//   useEffect(() => {
//     loadInitialData();
//   }, []);

//   const loadInitialData = async () => {
//     setLoadingInitial(true);
//     setError("");

//     try {
//       const [
//         sessionsResponse,
//         termsResponse,
//         classesResponse,
//         examinationsResponse,
//         subjectsResponse,
//       ] = await Promise.all([
//         api.get("/academics/sessions/"),
//         api.get("/academics/terms/"),
//         api.get("/academics/class-levels/"),
//         api.get("/examinations/"),
//         api.get("/examinations/subjects/"),
//       ]);

//       const sessionData = getArrayData(sessionsResponse.data);
//       const termData = getArrayData(termsResponse.data);
//       const classData = getArrayData(classesResponse.data);
//       const examinationData = getArrayData(
//         examinationsResponse.data
//       );
//       const subjectData = getArrayData(subjectsResponse.data);

//       setSessions(sessionData);
//       setTerms(termData);
//       setClasses(classData);
//       setExaminations(examinationData);
//       setExaminationSubjects(subjectData);

//       // ------------------------------------------------------
//       // DEFAULT CURRENT SESSION
//       // ------------------------------------------------------

//       const currentSession =
//         sessionData.find(
//           (session) => session.is_current === true
//         ) || sessionData[0];

//       if (currentSession) {
//         setSelectedSession(String(currentSession.id));
//       }

//       // ------------------------------------------------------
//       // DEFAULT CURRENT TERM
//       // ------------------------------------------------------

//       const currentTerm =
//         termData.find(
//           (term) => term.is_current === true
//         ) || termData[0];

//       if (currentTerm) {
//         setSelectedTerm(String(currentTerm.id));
//       }
//     } catch (err) {
//       setError(getErrorMessage(err));
//     } finally {
//       setLoadingInitial(false);
//     }
//   };

//   // ==========================================================
//   // FILTER TERMS BY SESSION
//   // ==========================================================

//   const filteredTerms = useMemo(() => {
//     if (!selectedSession) {
//       return terms;
//     }

//     return terms.filter(
//       (term) =>
//         String(term.academic_session) ===
//         String(selectedSession)
//     );
//   }, [terms, selectedSession]);

//   // ==========================================================
//   // FILTER EXAMINATIONS
//   // ==========================================================

//   const filteredExaminations = useMemo(() => {
//     return examinations.filter((exam) => {
//       const sessionMatches =
//         !selectedSession ||
//         String(exam.academic_session) ===
//           String(selectedSession);

//       const termMatches =
//         !selectedTerm ||
//         String(exam.term) === String(selectedTerm);

//       const classMatches =
//         !selectedClass ||
//         String(exam.class_level) ===
//           String(selectedClass);

//       return (
//         sessionMatches &&
//         termMatches &&
//         classMatches
//       );
//     });
//   }, [
//     examinations,
//     selectedSession,
//     selectedTerm,
//     selectedClass,
//   ]);

//   // ==========================================================
//   // FILTER EXAMINATION SUBJECTS
//   // ==========================================================

//   const filteredExaminationSubjects = useMemo(() => {
//     if (!selectedExamination) {
//       return [];
//     }

//     return examinationSubjects.filter(
//       (item) =>
//         String(item.examination) ===
//         String(selectedExamination)
//     );
//   }, [
//     examinationSubjects,
//     selectedExamination,
//   ]);

//   // ==========================================================
//   // SELECT EXAMINATION
//   // ==========================================================

//   useEffect(() => {
//     if (!selectedExamination) {
//       setSelectedExaminationSubject("");
//       return;
//     }

//     const subjects = examinationSubjects.filter(
//       (item) =>
//         String(item.examination) ===
//         String(selectedExamination)
//     );

//     if (subjects.length === 1) {
//       setSelectedExaminationSubject(
//         String(subjects[0].id)
//       );
//     } else {
//       setSelectedExaminationSubject("");
//     }
//   }, [
//     selectedExamination,
//     examinationSubjects,
//   ]);

//   // ==========================================================
//   // LOAD ENROLLED STUDENTS
//   // ==========================================================

//   useEffect(() => {
//     if (
//       !selectedSession ||
//       !selectedTerm ||
//       !selectedClass
//     ) {
//       setEnrollments([]);
//       return;
//     }

//     loadEnrollments();
//   }, [
//     selectedSession,
//     selectedTerm,
//     selectedClass,
//   ]);

//   const loadEnrollments = async () => {
//     setLoadingRoster(true);
//     setError("");

//     try {
//       const response = await api.get(
//         "/students/enrollments/",
//         {
//           params: {
//             academic_session: selectedSession,
//             term: selectedTerm,
//             class_level: selectedClass,
//             is_current: true,
//           },
//         }
//       );

//       setEnrollments(getArrayData(response.data));
//     } catch (err) {
//       setEnrollments([]);
//       setError(getErrorMessage(err));
//     } finally {
//       setLoadingRoster(false);
//     }
//   };

//   // ==========================================================
//   // LOAD EXISTING RESULTS
//   // ==========================================================

//   useEffect(() => {
//     if (!selectedExaminationSubject) {
//       setResults([]);
//       return;
//     }

//     loadResults();
//   }, [selectedExaminationSubject]);

//   const loadResults = async () => {
//     setLoadingResults(true);
//     setError("");

//     try {
//       const data = await getStudentResults();

//       setResults(getArrayData(data));
//     } catch (err) {
//       setResults([]);
//       setError(getErrorMessage(err));
//     } finally {
//       setLoadingResults(false);
//     }
//   };

//   // ==========================================================
//   // EXISTING RESULT MAP
//   // ==========================================================

//   const resultMap = useMemo(() => {
//     const map = {};

//     results.forEach((result) => {
//       if (
//         String(result.examination_subject) ===
//         String(selectedExaminationSubject)
//       ) {
//         map[String(result.student)] = result;
//       }
//     });

//     return map;
//   }, [
//     results,
//     selectedExaminationSubject,
//   ]);

//   // ==========================================================
//   // DISPLAY ROSTER
//   // ==========================================================

//   const roster = useMemo(() => {
//     let data = [...enrollments];

//     if (search.trim()) {
//       const term = search.toLowerCase().trim();

//       data = data.filter((enrollment) => {
//         const studentName =
//           enrollment.student_name || "";

//         const admissionNumber =
//           enrollment.admission_number || "";

//         return (
//           studentName
//             .toLowerCase()
//             .includes(term) ||
//           admissionNumber
//             .toLowerCase()
//             .includes(term)
//         );
//       });
//     }

//     return data;
//   }, [enrollments, search]);

//   // ==========================================================
//   // SCORE VALUE
//   // ==========================================================

//   const getScoreValue = (studentId, field) => {
//     const existing = resultMap[String(studentId)];

//     const local = scores[String(studentId)];

//     if (local && local[field] !== undefined) {
//       return local[field];
//     }

//     if (existing) {
//       if (field === "ca") {
//         return existing.ca_score ?? "";
//       }

//       if (field === "exam") {
//         return existing.exam_score ?? "";
//       }
//     }

//     return "";
//   };

//   // ==========================================================
//   // SCORE CHANGE
//   // ==========================================================

//   const handleScoreChange = (
//     studentId,
//     field,
//     value
//   ) => {
//     setScores((previous) => ({
//       ...previous,
//       [String(studentId)]: {
//         ...(previous[String(studentId)] || {}),
//         [field]: value,
//       },
//     }));
//   };

//   // ==========================================================
//   // SELECT CHANGE
//   // ==========================================================

//   const handleSessionChange = (value) => {
//     setSelectedSession(value);

//     const matchingTerms = terms.filter(
//       (term) =>
//         String(term.academic_session) ===
//         String(value)
//     );

//     const currentTerm =
//       matchingTerms.find(
//         (term) => term.is_current === true
//       ) || matchingTerms[0];

//     setSelectedTerm(
//       currentTerm ? String(currentTerm.id) : ""
//     );

//     setSelectedExamination("");
//     setSelectedExaminationSubject("");
//     setResults([]);
//   };

//   const handleTermChange = (value) => {
//     setSelectedTerm(value);

//     setSelectedExamination("");
//     setSelectedExaminationSubject("");
//     setResults([]);
//   };

//   const handleClassChange = (value) => {
//     setSelectedClass(value);

//     setSelectedExamination("");
//     setSelectedExaminationSubject("");
//     setResults([]);
//   };

//   const handleExaminationChange = (value) => {
//     setSelectedExamination(value);
//     setResults([]);
//   };

//   // ==========================================================
//   // SAVE ONE RESULT
//   // ==========================================================

//   const saveResult = async (enrollment) => {
//     if (!selectedExaminationSubject) {
//       setError(
//         "Please select an examination subject first."
//       );
//       return;
//     }

//     const studentId = enrollment.student;

//     const caValue = getScoreValue(
//       studentId,
//       "ca"
//     );

//     const examValue = getScoreValue(
//       studentId,
//       "exam"
//     );

//     const ca =
//       caValue === "" ? 0 : Number(caValue);

//     const exam =
//       examValue === "" ? 0 : Number(examValue);

//     if (Number.isNaN(ca) || Number.isNaN(exam)) {
//       setError(
//         `Invalid score for ${enrollment.student_name}.`
//       );
//       return;
//     }

//     if (ca < 0 || exam < 0) {
//       setError(
//         "Scores cannot be negative."
//       );
//       return;
//     }

//     const subject = examinationSubjects.find(
//       (item) =>
//         String(item.id) ===
//         String(selectedExaminationSubject)
//     );

//     if (!subject) {
//       setError(
//         "The selected examination subject could not be found."
//       );
//       return;
//     }

//     const maximumScore = Number(
//       subject.maximum_score || 0
//     );

//     if (ca + exam > maximumScore) {
//       setError(
//         `The total score cannot exceed ${maximumScore} for ${subject.subject_name || "this subject"}.`
//       );
//       return;
//     }

//     setSavingStudent(studentId);
//     setError("");
//     setSuccess("");

//     try {
//       const existingResult =
//         resultMap[String(studentId)];

//       if (existingResult) {
//         await updateStudentResult(
//           existingResult.id,
//           {
//             ca_score: ca,
//             exam_score: exam,
//           }
//         );

//         setSuccess(
//           `${enrollment.student_name}'s result was updated.`
//         );
//       } else {
//         await createStudentResult({
//           student: studentId,
//           examination_subject:
//             selectedExaminationSubject,
//           ca_score: ca,
//           exam_score: exam,
//         });

//         setSuccess(
//           `${enrollment.student_name}'s result was saved.`
//         );
//       }

//       await loadResults();
//     } catch (err) {
//       setError(getErrorMessage(err));
//     } finally {
//       setSavingStudent(null);
//     }
//   };

//   // ==========================================================
//   // REFRESH
//   // ==========================================================

//   const refreshPage = async () => {
//     setError("");
//     setSuccess("");

//     await Promise.all([
//       loadEnrollments(),
//       selectedExaminationSubject
//         ? loadResults()
//         : Promise.resolve(),
//     ]);
//   };

//   // ==========================================================
//   // SELECTED SUBJECT
//   // ==========================================================

//   const selectedSubject = useMemo(() => {
//     return examinationSubjects.find(
//       (item) =>
//         String(item.id) ===
//         String(selectedExaminationSubject)
//     );
//   }, [
//     examinationSubjects,
//     selectedExaminationSubject,
//   ]);

//   // ==========================================================
//   // LOADING
//   // ==========================================================

//   if (loadingInitial) {
//     return (
//       <div className="flex min-h-[400px] items-center justify-center bg-[var(--color-background)]">
//         <div className="flex items-center gap-3 text-[var(--color-secondary)]">
//           <Loader2
//             size={22}
//             className="animate-spin"
//           />
//           <span>Loading results...</span>
//         </div>
//       </div>
//     );
//   }

//   // ==========================================================
//   // RENDER
//   // ==========================================================

//   return (
//     <div className="min-h-full bg-[var(--color-background)] p-4 sm:p-6">
//       <div className="mx-auto max-w-7xl space-y-6">

//         {/* ====================================================
//             HEADER
//         ==================================================== */}

//         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <div className="flex items-center gap-3">
//               <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
//                 <ClipboardList size={22} />
//               </div>

//               <div>
//                 <h1 className="text-xl font-semibold text-[var(--color-text)] sm:text-2xl">
//                   Results
//                 </h1>

//                 <p className="text-sm text-[var(--color-secondary)]">
//                   Enter and manage student examination results.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <button
//             type="button"
//             onClick={refreshPage}
//             disabled={
//               loadingRoster ||
//               loadingResults
//             }
//             className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--color-secondary)]/20 bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium text-[var(--color-text)] transition hover:bg-[var(--color-secondary)]/10 disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             <RefreshCw
//               size={17}
//               className={
//                 loadingRoster ||
//                 loadingResults
//                   ? "animate-spin"
//                   : ""
//               }
//             />

//             Refresh
//           </button>
//         </div>

//         {/* ====================================================
//             ALERTS
//         ==================================================== */}

//         {error && (
//           <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
//             <AlertCircle
//               size={19}
//               className="mt-0.5 shrink-0"
//             />

//             <div className="flex-1">
//               {error}
//             </div>

//             <button
//               type="button"
//               onClick={() => setError("")}
//               className="shrink-0"
//             >
//               <X size={17} />
//             </button>
//           </div>
//         )}

//         {success && (
//           <div className="flex items-start gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-600">
//             <CheckCircle2
//               size={19}
//               className="mt-0.5 shrink-0"
//             />

//             <div className="flex-1">
//               {success}
//             </div>

//             <button
//               type="button"
//               onClick={() => setSuccess("")}
//               className="shrink-0"
//             >
//               <X size={17} />
//             </button>
//           </div>
//         )}

//         {/* ====================================================
//             FILTERS
//         ==================================================== */}

//         <div className="rounded-2xl border border-[var(--color-secondary)]/10 bg-[var(--color-card)] p-4 shadow-sm sm:p-5">
//           <div className="mb-4">
//             <h2 className="text-base font-semibold text-[var(--color-text)]">
//               Select Examination
//             </h2>

//             <p className="mt-1 text-sm text-[var(--color-secondary)]">
//               Select the session, term, class and examination
//               subject whose results you want to enter.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">

//             {/* SESSION */}
//             <SelectField
//               label="Academic Session"
//               value={selectedSession}
//               onChange={handleSessionChange}
//               options={sessions}
//               valueKey="id"
//               labelKey="name"
//               placeholder="Select session"
//             />

//             {/* TERM */}
//             <SelectField
//               label="Term"
//               value={selectedTerm}
//               onChange={handleTermChange}
//               options={filteredTerms}
//               valueKey="id"
//               labelKey="name"
//               placeholder="Select term"
//               customLabel={(term) =>
//                 term.name ||
//                 term.term_name ||
//                 term.get_name_display ||
//                 ""
//               }
//             />

//             {/* CLASS */}
//             <SelectField
//               label="Class"
//               value={selectedClass}
//               onChange={handleClassChange}
//               options={classes}
//               valueKey="id"
//               labelKey="name"
//               placeholder="Select class"
//             />

//             {/* EXAMINATION */}
//             <SelectField
//               label="Examination"
//               value={selectedExamination}
//               onChange={handleExaminationChange}
//               options={filteredExaminations}
//               valueKey="id"
//               labelKey="name"
//               placeholder="Select examination"
//             />

//             {/* SUBJECT */}
//             <SelectField
//               label="Subject"
//               value={selectedExaminationSubject}
//               onChange={(value) =>
//                 setSelectedExaminationSubject(
//                   value
//                 )
//               }
//               options={filteredExaminationSubjects}
//               valueKey="id"
//               labelKey="subject_name"
//               placeholder="Select subject"
//               customLabel={(subject) =>
//                 subject.subject_name ||
//                 subject.subject?.name ||
//                 subject.subject_code ||
//                 `Subject ${subject.id}`
//               }
//             />
//           </div>
//         </div>

//         {/* ====================================================
//             SUBJECT INFORMATION
//         ==================================================== */}

//         {selectedSubject && (
//           <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
//             <InfoCard
//               label="Subject"
//               value={
//                 selectedSubject.subject_name ||
//                 selectedSubject.subject?.name ||
//                 "—"
//               }
//             />

//             <InfoCard
//               label="Maximum Score"
//               value={
//                 selectedSubject.maximum_score ??
//                 "—"
//               }
//             />

//             <InfoCard
//               label="Pass Mark"
//               value={
//                 selectedSubject.pass_mark ??
//                 "—"
//               }
//             />

//             <InfoCard
//               label="Students"
//               value={enrollments.length}
//             />
//           </div>
//         )}

//         {/* ====================================================
//             RESULT ENTRY
//         ==================================================== */}

//         <div className="rounded-2xl border border-[var(--color-secondary)]/10 bg-[var(--color-card)] shadow-sm">

//           <div className="flex flex-col gap-4 border-b border-[var(--color-secondary)]/10 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">

//             <div>
//               <h2 className="text-base font-semibold text-[var(--color-text)]">
//                 Student Results
//               </h2>

//               <p className="mt-1 text-sm text-[var(--color-secondary)]">
//                 {selectedExaminationSubject
//                   ? "Enter CA and examination scores for each student."
//                   : "Select an examination subject to begin."}
//               </p>
//             </div>

//             {selectedExaminationSubject && (
//               <div className="relative w-full sm:w-72">
//                 <Search
//                   size={17}
//                   className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)]"
//                 />

//                 <input
//                   type="text"
//                   value={search}
//                   onChange={(event) =>
//                     setSearch(event.target.value)
//                   }
//                   placeholder="Search student..."
//                   className="w-full rounded-lg border border-[var(--color-secondary)]/20 bg-[var(--color-background)] py-2.5 pl-10 pr-3 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
//                 />
//               </div>
//             )}
//           </div>

//           {!selectedExaminationSubject ? (
//             <EmptyState
//               title="Select an examination subject"
//               message="Choose an examination and subject above to load the student roster."
//             />
//           ) : loadingRoster || loadingResults ? (
//             <div className="flex min-h-[260px] items-center justify-center">
//               <div className="flex items-center gap-3 text-sm text-[var(--color-secondary)]">
//                 <Loader2
//                   size={20}
//                   className="animate-spin"
//                 />

//                 Loading students and results...
//               </div>
//             </div>
//           ) : roster.length === 0 ? (
//             <EmptyState
//               title="No students found"
//               message="There are no current students matching the selected class, session and term."
//             />
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full min-w-[900px] border-collapse">
//                 <thead>
//                   <tr className="border-b border-[var(--color-secondary)]/10 bg-[var(--color-background)]">
//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
//                       Student
//                     </th>

//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
//                       Admission No.
//                     </th>

//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
//                       CA
//                     </th>

//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
//                       Exam
//                     </th>

//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
//                       Total
//                     </th>

//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
//                       Grade
//                     </th>

//                     <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
//                       Status
//                     </th>

//                     <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
//                       Action
//                     </th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {roster.map((enrollment) => {
//                     const studentId =
//                       enrollment.student;

//                     const existing =
//                       resultMap[String(studentId)];

//                     const ca = getScoreValue(
//                       studentId,
//                       "ca"
//                     );

//                     const exam = getScoreValue(
//                       studentId,
//                       "exam"
//                     );

//                     const total =
//                       existing?.total_score ??
//                       (
//                         Number(ca || 0) +
//                         Number(exam || 0)
//                       );

//                     const saving =
//                       String(savingStudent) ===
//                       String(studentId);

//                     return (
//                       <tr
//                         key={enrollment.id}
//                         className="border-b border-[var(--color-secondary)]/10 last:border-b-0 hover:bg-[var(--color-background)]/60"
//                       >
//                         {/* STUDENT */}
//                         <td className="px-4 py-4">
//                           <div className="font-medium text-[var(--color-text)]">
//                             {enrollment.student_name}
//                           </div>

//                           <div className="mt-1 text-xs text-[var(--color-secondary)]">
//                             Roll No.{" "}
//                             {enrollment.roll_number ??
//                               "—"}
//                           </div>
//                         </td>

//                         {/* ADMISSION */}
//                         <td className="px-4 py-4 text-sm text-[var(--color-text)]">
//                           {enrollment.admission_number ||
//                             "—"}
//                         </td>

//                         {/* CA */}
//                         <td className="px-4 py-4">
//                           <ScoreInput
//                             value={ca}
//                             onChange={(value) =>
//                               handleScoreChange(
//                                 studentId,
//                                 "ca",
//                                 value
//                               )
//                             }
//                             disabled={saving}
//                             max={
//                               selectedSubject
//                                 ? selectedSubject.maximum_score
//                                 : undefined
//                             }
//                           />
//                         </td>

//                         {/* EXAM */}
//                         <td className="px-4 py-4">
//                           <ScoreInput
//                             value={exam}
//                             onChange={(value) =>
//                               handleScoreChange(
//                                 studentId,
//                                 "exam",
//                                 value
//                               )
//                             }
//                             disabled={saving}
//                             max={
//                               selectedSubject
//                                 ? selectedSubject.maximum_score
//                                 : undefined
//                             }
//                           />
//                         </td>

//                         {/* TOTAL */}
//                         <td className="px-4 py-4">
//                           <span className="font-semibold text-[var(--color-text)]">
//                             {Number(total || 0).toFixed(
//                               2
//                             )}
//                           </span>
//                         </td>

//                         {/* GRADE */}
//                         <td className="px-4 py-4">
//                           {existing?.grade ? (
//                             <span className="inline-flex rounded-full bg-[var(--color-primary)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)]">
//                               {existing.grade}
//                             </span>
//                           ) : (
//                             <span className="text-sm text-[var(--color-secondary)]">
//                               —
//                             </span>
//                           )}
//                         </td>

//                         {/* STATUS */}
//                         <td className="px-4 py-4">
//                           {existing ? (
//                             existing.is_published ? (
//                               <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-600">
//                                 <CheckCircle2
//                                   size={13}
//                                 />
//                                 Published
//                               </span>
//                             ) : (
//                               <span className="inline-flex rounded-full bg-yellow-500/10 px-2.5 py-1 text-xs font-medium text-yellow-600">
//                                 Saved
//                               </span>
//                             )
//                           ) : (
//                             <span className="inline-flex rounded-full bg-[var(--color-secondary)]/10 px-2.5 py-1 text-xs font-medium text-[var(--color-secondary)]">
//                               Not entered
//                             </span>
//                           )}
//                         </td>

//                         {/* ACTION */}
//                         <td className="px-4 py-4 text-right">
//                           <button
//                             type="button"
//                             onClick={() =>
//                               saveResult(
//                                 enrollment
//                               )
//                             }
//                             disabled={saving}
//                             className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
//                           >
//                             {saving ? (
//                               <Loader2
//                                 size={16}
//                                 className="animate-spin"
//                               />
//                             ) : (
//                               <Save size={16} />
//                             )}

//                             {existing
//                               ? "Update"
//                               : "Save"}
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ============================================================
// // SELECT FIELD
// // ============================================================

// function SelectField({
//   label,
//   value,
//   onChange,
//   options,
//   valueKey = "id",
//   labelKey = "name",
//   placeholder,
//   customLabel,
// }) {
//   return (
//     <div>
//       <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">
//         {label}
//       </label>

//       <div className="relative">
//         <select
//           value={value}
//           onChange={(event) =>
//             onChange(event.target.value)
//           }
//           className="w-full appearance-none rounded-lg border border-[var(--color-secondary)]/20 bg-[var(--color-background)] px-3 py-2.5 pr-9 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)]"
//         >
//           <option value="">
//             {placeholder}
//           </option>

//           {options.map((option) => (
//             <option
//               key={option[valueKey]}
//               value={option[valueKey]}
//             >
//               {customLabel
//                 ? customLabel(option)
//                 : option[labelKey]}
//             </option>
//           ))}
//         </select>

//         <ChevronDown
//           size={17}
//           className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)]"
//         />
//       </div>
//     </div>
//   );
// }

// // ============================================================
// // SCORE INPUT
// // ============================================================

// function ScoreInput({
//   value,
//   onChange,
//   disabled,
// }) {
//   return (
//     <input
//       type="number"
//       min="0"
//       step="0.01"
//       value={value}
//       onChange={(event) =>
//         onChange(event.target.value)
//       }
//       disabled={disabled}
//       className="w-24 rounded-lg border border-[var(--color-secondary)]/20 bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
//       placeholder="0"
//     />
//   );
// }

// // ============================================================
// // INFO CARD
// // ============================================================

// function InfoCard({ label, value }) {
//   return (
//     <div className="rounded-xl border border-[var(--color-secondary)]/10 bg-[var(--color-card)] p-4">
//       <div className="text-xs font-medium text-[var(--color-secondary)]">
//         {label}
//       </div>

//       <div className="mt-1 truncate text-sm font-semibold text-[var(--color-text)]">
//         {value}
//       </div>
//     </div>
//   );
// }

// // ============================================================
// // EMPTY STATE
// // ============================================================

// function EmptyState({
//   title,
//   message,
// }) {
//   return (
//     <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
//       <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]">
//         <ClipboardList size={22} />
//       </div>

//       <h3 className="text-sm font-semibold text-[var(--color-text)]">
//         {title}
//       </h3>

//       <p className="mt-1 max-w-md text-sm text-[var(--color-secondary)]">
//         {message}
//       </p>
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Save,
  Search,
  RefreshCw,
  FileText,
} from "lucide-react";

import api from "../../services/api";

import {
  createStudentResult,
  updateStudentResult,
} from "../../services/resultsService";

// ============================================================
// HELPERS
// ============================================================

const getId = (item) =>
  item?.id ?? item?.value ?? "";

const getName = (item) =>
  item?.name ||
  item?.session_name ||
  item?.class_name ||
  item?.subject_name ||
  item?.term_name ||
  item?.title ||
  "";

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
};

// ============================================================
// SCORE INPUT
// ============================================================

function ScoreInput({
  value,
  onChange,
  disabled = false,
  placeholder = "0",
}) {
  return (
    <input
      type="number"
      min="0"
      step="0.01"
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="
        w-full
        min-w-[80px]
        rounded-lg
        border
        border-[var(--color-secondary)]/40
        bg-[var(--color-background)]
        px-3
        py-2
        text-sm
        text-[var(--color-text)]
        outline-none
        transition
        placeholder:text-[var(--color-secondary)]/60
        focus:border-[var(--color-primary)]
        focus:ring-2
        focus:ring-[var(--color-primary)]/20
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    />
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function TeacherResults() {
  // ==========================================================
  // DATA
  // ==========================================================

  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [examinations, setExaminations] = useState([]);
  const [examinationSubjects, setExaminationSubjects] =
    useState([]);

  const [enrollments, setEnrollments] = useState([]);
  const [results, setResults] = useState([]);

  // ==========================================================
  // FILTERS
  // ==========================================================

  const [selectedSession, setSelectedSession] =
    useState("");

  const [selectedTerm, setSelectedTerm] =
    useState("");

  const [selectedClass, setSelectedClass] =
    useState("");

  const [selectedExamination, setSelectedExamination] =
    useState("");

  const [
    selectedExaminationSubject,
    setSelectedExaminationSubject,
  ] = useState("");

  // ==========================================================
  // SEARCH
  // ==========================================================

  const [search, setSearch] = useState("");

  // ==========================================================
  // SCORES
  // ==========================================================

  const [scores, setScores] = useState({});

  const [savingStudent, setSavingStudent] =
    useState(null);

  // ==========================================================
  // LOADING
  // ==========================================================

  const [loadingInitial, setLoadingInitial] =
    useState(true);

  const [loadingRoster, setLoadingRoster] =
    useState(false);

  const [loadingResults, setLoadingResults] =
    useState(false);

  // ==========================================================
  // MESSAGES
  // ==========================================================

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================================
  // LOAD INITIAL DATA
  // ==========================================================

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoadingInitial(true);
    setError("");

    try {
      const [
        sessionsResponse,
        termsResponse,
        classesResponse,
        examinationsResponse,
        subjectsResponse,
      ] = await Promise.all([
        api.get("/academics/sessions/"),
        api.get("/academics/terms/"),
        api.get("/academics/class-levels/"),
        api.get("/examinations/"),
        api.get("/examinations/subjects/"),
      ]);

      const sessionData = normalizeArray(
        sessionsResponse.data
      );

      const termData = normalizeArray(
        termsResponse.data
      );

      const classData = normalizeArray(
        classesResponse.data
      );

      const examinationData = normalizeArray(
        examinationsResponse.data
      );

      const subjectData = normalizeArray(
        subjectsResponse.data
      );

      setSessions(sessionData);
      setTerms(termData);
      setClasses(classData);
      setExaminations(examinationData);
      setExaminationSubjects(subjectData);

      // ------------------------------------------------------
      // CURRENT SESSION
      // ------------------------------------------------------

      const currentSession =
        sessionData.find(
          (session) =>
            session.is_current === true ||
            session.current === true
        ) || sessionData[0];

      if (currentSession) {
        setSelectedSession(
          String(getId(currentSession))
        );
      }

      // ------------------------------------------------------
      // CURRENT TERM
      // ------------------------------------------------------

      const currentTerm =
        termData.find(
          (term) =>
            term.is_current === true ||
            term.current === true
        ) || termData[0];

      if (currentTerm) {
        setSelectedTerm(
          String(getId(currentTerm))
        );
      }
    } catch (err) {
      console.error(
        "Failed to load teacher results data:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to load the results information."
      );
    } finally {
      setLoadingInitial(false);
    }
  };

  // ==========================================================
  // FILTER TERMS BY SESSION
  // ==========================================================

  const filteredTerms = useMemo(() => {
    if (!selectedSession) {
      return terms;
    }

    return terms.filter((term) => {
      const sessionId =
        term.academic_session ??
        term.session ??
        term.academic_session_id;

      return (
        String(sessionId) ===
        String(selectedSession)
      );
    });
  }, [terms, selectedSession]);

  // ==========================================================
  // FILTER EXAMINATIONS
  // ==========================================================

  const filteredExaminations = useMemo(() => {
    return examinations.filter((exam) => {
      const sessionId =
        exam.academic_session ??
        exam.academic_session_id;

      const termId =
        exam.term ??
        exam.term_id;

      const classId =
        exam.class_level ??
        exam.class_level_id;

      if (
        selectedSession &&
        String(sessionId) !==
          String(selectedSession)
      ) {
        return false;
      }

      if (
        selectedTerm &&
        String(termId) !==
          String(selectedTerm)
      ) {
        return false;
      }

      if (
        selectedClass &&
        String(classId) !==
          String(selectedClass)
      ) {
        return false;
      }

      return true;
    });
  }, [
    examinations,
    selectedSession,
    selectedTerm,
    selectedClass,
  ]);

  // ==========================================================
  // FILTER EXAMINATION SUBJECTS
  // ==========================================================

  const filteredExaminationSubjects = useMemo(() => {
    if (!selectedExamination) {
      return [];
    }

    return examinationSubjects.filter((item) => {
      const examinationId =
        item.examination ??
        item.examination_id;

      return (
        String(examinationId) ===
        String(selectedExamination)
      );
    });
  }, [
    examinationSubjects,
    selectedExamination,
  ]);

  // ==========================================================
  // SELECTED SUBJECT
  // ==========================================================

  const selectedSubject = useMemo(() => {
    return filteredExaminationSubjects.find(
      (item) =>
        String(getId(item)) ===
        String(selectedExaminationSubject)
    );
  }, [
    filteredExaminationSubjects,
    selectedExaminationSubject,
  ]);

  // ==========================================================
  // SELECTED EXAMINATION
  // ==========================================================

  const selectedExam = useMemo(() => {
    return examinations.find(
      (exam) =>
        String(getId(exam)) ===
        String(selectedExamination)
    );
  }, [
    examinations,
    selectedExamination,
  ]);

  // ==========================================================
  // LOAD ROSTER + RESULTS
  // ==========================================================

  useEffect(() => {
    if (
      !selectedSession ||
      !selectedTerm ||
      !selectedClass ||
      !selectedExaminationSubject
    ) {
      setEnrollments([]);
      setResults([]);
      setScores({});
      return;
    }

    loadRosterAndResults();
  }, [
    selectedSession,
    selectedTerm,
    selectedClass,
    selectedExaminationSubject,
  ]);

  const loadRosterAndResults = async () => {
    setLoadingRoster(true);
    setLoadingResults(true);
    setError("");

    try {
      const [
        enrollmentResponse,
        resultResponse,
      ] = await Promise.all([
        api.get("/students/enrollments/", {
          params: {
            academic_session:
              selectedSession,
            term: selectedTerm,
            class_level:
              selectedClass,
            is_current: true,
          },
        }),

        api.get("/results/student-results/"),
      ]);

      const enrollmentData =
        normalizeArray(
          enrollmentResponse.data
        );

      const resultData =
        normalizeArray(
          resultResponse.data
        );

      setEnrollments(enrollmentData);
      setResults(resultData);

      // ------------------------------------------------------
      // BUILD SCORE STATE
      // ------------------------------------------------------

      const nextScores = {};

      enrollmentData.forEach((enrollment) => {
        const studentId =
          enrollment.student;

        const existingResult =
          resultData.find(
            (result) =>
              String(result.student) ===
                String(studentId) &&
              String(
                result.examination_subject
              ) ===
                String(
                  selectedExaminationSubject
                )
          );

        nextScores[studentId] = {
          resultId:
            existingResult?.id || null,

          caScore:
            existingResult?.ca_score !==
            undefined
              ? String(
                  existingResult.ca_score
                )
              : "",

          examScore:
            existingResult?.exam_score !==
            undefined
              ? String(
                  existingResult.exam_score
                )
              : "",

          totalScore:
            existingResult?.total_score !==
            undefined
              ? existingResult.total_score
              : "",

          grade:
            existingResult?.grade || "",

          remark:
            existingResult?.remark || "",

          isPublished:
            existingResult?.is_published ||
            false,
        };
      });

      setScores(nextScores);
    } catch (err) {
      console.error(
        "Failed to load results:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Failed to load students or results."
      );
    } finally {
      setLoadingRoster(false);
      setLoadingResults(false);
    }
  };

  // ==========================================================
  // HANDLE SCORE CHANGE
  // ==========================================================

  const handleScoreChange = (
    studentId,
    field,
    value
  ) => {
    setScores((previous) => ({
      ...previous,

      [studentId]: {
        ...previous[studentId],
        [field]: value,
      },
    }));
  };

  // ==========================================================
  // SAVE RESULT
  // ==========================================================

  const saveResult = async (studentId) => {
    const studentScore =
      scores[studentId];

    if (!studentScore) {
      return;
    }

    const caScore = Number(
      studentScore.caScore || 0
    );

    const examScore = Number(
      studentScore.examScore || 0
    );

    // --------------------------------------------------------
    // VALIDATE NEGATIVE SCORES
    // --------------------------------------------------------

    if (
      caScore < 0 ||
      examScore < 0
    ) {
      setError(
        "Scores cannot be negative."
      );
      return;
    }

    // --------------------------------------------------------
    // VALIDATE MAXIMUM SCORE
    // --------------------------------------------------------

    if (
      selectedSubject?.maximum_score !=
      null
    ) {
      const maximumScore = Number(
        selectedSubject.maximum_score
      );

      if (
        caScore + examScore >
        maximumScore
      ) {
        setError(
          `The total score cannot exceed ${maximumScore}.`
        );
        return;
      }
    }

    setSavingStudent(studentId);
    setError("");
    setSuccess("");

    try {
      const payload = {
        student: studentId,

        examination_subject:
          selectedExaminationSubject,

        ca_score: caScore,

        exam_score: examScore,
      };

      let savedResult;

      // ------------------------------------------------------
      // UPDATE EXISTING RESULT
      // ------------------------------------------------------

      if (studentScore.resultId) {
        savedResult =
          await updateStudentResult(
            studentScore.resultId,
            payload
          );
      }

      // ------------------------------------------------------
      // CREATE NEW RESULT
      // ------------------------------------------------------

      else {
        savedResult =
          await createStudentResult(
            payload
          );
      }

      // ------------------------------------------------------
      // UPDATE LOCAL STATE
      // ------------------------------------------------------

      setScores((previous) => ({
        ...previous,

        [studentId]: {
          ...previous[studentId],

          resultId:
            savedResult.id,

          caScore:
            savedResult.ca_score ??
            caScore,

          examScore:
            savedResult.exam_score ??
            examScore,

          totalScore:
            savedResult.total_score ??
            "",

          grade:
            savedResult.grade ??
            "",

          remark:
            savedResult.remark ??
            "",

          isPublished:
            savedResult.is_published ??
            false,
        },
      }));

      setSuccess(
        "Result saved successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "Failed to save result:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.student ||
          "Failed to save this result."
      );
    } finally {
      setSavingStudent(null);
    }
  };

  // ==========================================================
  // SEARCH
  // ==========================================================

  const filteredEnrollments = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return enrollments;
    }

    return enrollments.filter(
      (enrollment) => {
        const name =
          enrollment.student_name ||
          "";

        const admission =
          enrollment.admission_number ||
          "";

        return (
          name
            .toLowerCase()
            .includes(query) ||
          admission
            .toLowerCase()
            .includes(query)
        );
      }
    );
  }, [enrollments, search]);

  // ==========================================================
  // FILTER HANDLERS
  // ==========================================================

  const handleSessionChange = (
    value
  ) => {
    setSelectedSession(value);

    setSelectedTerm("");
    setSelectedClass("");
    setSelectedExamination("");
    setSelectedExaminationSubject("");

    setEnrollments([]);
    setResults([]);
    setScores({});
  };

  const handleTermChange = (
    value
  ) => {
    setSelectedTerm(value);

    setSelectedClass("");
    setSelectedExamination("");
    setSelectedExaminationSubject("");

    setEnrollments([]);
    setResults([]);
    setScores({});
  };

  const handleClassChange = (
    value
  ) => {
    setSelectedClass(value);

    setSelectedExamination("");
    setSelectedExaminationSubject("");

    setEnrollments([]);
    setResults([]);
    setScores({});
  };

  const handleExaminationChange = (
    value
  ) => {
    setSelectedExamination(value);

    setSelectedExaminationSubject("");

    setEnrollments([]);
    setResults([]);
    setScores({});
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loadingInitial) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-[var(--color-secondary)]">
          <Loader2 className="h-6 w-6 animate-spin" />

          <span className="text-sm">
            Loading results...
          </span>
        </div>
      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-[var(--color-primary)]/10
                text-[var(--color-primary)]
              "
            >
              <FileText className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)]">
                Results
              </h1>

              <p className="mt-1 text-sm text-[var(--color-secondary)]">
                Enter and manage results for your
                assigned classes and subjects.
              </p>
            </div>
          </div>
        </div>

        {/* REFRESH */}

        <button
          type="button"
          onClick={loadRosterAndResults}
          disabled={
            loadingRoster ||
            loadingResults ||
            !selectedExaminationSubject
          }
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-lg
            border
            border-[var(--color-secondary)]/40
            bg-[var(--color-card)]
            px-4
            py-2.5
            text-sm
            font-medium
            text-[var(--color-text)]
            transition
            hover:border-[var(--color-primary)]
            hover:text-[var(--color-primary)]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loadingRoster ||
              loadingResults
                ? "animate-spin"
                : ""
            }`}
          />

          Refresh
        </button>
      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div
          className="
            flex
            items-start
            gap-3
            rounded-xl
            border
            border-[var(--color-primary)]/30
            bg-[var(--color-primary)]/5
            p-4
            text-sm
            text-[var(--color-text)]
          "
        >
          <AlertCircle
            className="
              mt-0.5
              h-5
              w-5
              shrink-0
              text-[var(--color-primary)]
            "
          />

          <span>{error}</span>
        </div>
      )}

      {/* ======================================================
          SUCCESS
      ====================================================== */}

      {success && (
        <div
          className="
            flex
            items-center
            gap-3
            rounded-xl
            border
            border-[var(--color-secondary)]/30
            bg-[var(--color-secondary)]/5
            p-4
            text-sm
            text-[var(--color-text)]
          "
        >
          <CheckCircle
            className="
              h-5
              w-5
              shrink-0
              text-[var(--color-secondary)]
            "
          />

          <span>{success}</span>
        </div>
      )}

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div
        className="
          rounded-2xl
          border
          border-[var(--color-secondary)]/20
          bg-[var(--color-card)]
          p-4
          shadow-sm
          md:p-5
        "
      >
        <div
          className="
            mb-5
            flex
            items-center
            gap-2
          "
        >
          <div
            className="
              h-2
              w-2
              rounded-full
              bg-[var(--color-secondary)]
            "
          />

          <h2 className="text-sm font-semibold text-[var(--color-text)]">
            Result Selection
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {/* SESSION */}

          <div>
            <label
              className="
                mb-2
                block
                text-sm
                font-medium
                text-[var(--color-text)]
              "
            >
              Academic Session
            </label>

            <select
              value={selectedSession}
              onChange={(e) =>
                handleSessionChange(
                  e.target.value
                )
              }
              className="
                w-full
                rounded-lg
                border
                border-[var(--color-secondary)]/40
                bg-[var(--color-background)]
                px-3
                py-2.5
                text-sm
                text-[var(--color-text)]
                outline-none
                transition
                focus:border-[var(--color-primary)]
                focus:ring-2
                focus:ring-[var(--color-primary)]/20
              "
            >
              <option value="">
                Select session
              </option>

              {sessions.map(
                (session) => (
                  <option
                    key={getId(session)}
                    value={getId(session)}
                  >
                    {getName(session)}
                  </option>
                )
              )}
            </select>
          </div>

          {/* TERM */}

          <div>
            <label
              className="
                mb-2
                block
                text-sm
                font-medium
                text-[var(--color-text)]
              "
            >
              Term
            </label>

            <select
              value={selectedTerm}
              onChange={(e) =>
                handleTermChange(
                  e.target.value
                )
              }
              className="
                w-full
                rounded-lg
                border
                border-[var(--color-secondary)]/40
                bg-[var(--color-background)]
                px-3
                py-2.5
                text-sm
                text-[var(--color-text)]
                outline-none
                transition
                focus:border-[var(--color-primary)]
                focus:ring-2
                focus:ring-[var(--color-primary)]/20
              "
            >
              <option value="">
                Select term
              </option>

              {filteredTerms.map(
                (term) => (
                  <option
                    key={getId(term)}
                    value={getId(term)}
                  >
                    {getName(term)}
                  </option>
                )
              )}
            </select>
          </div>

          {/* CLASS */}

          <div>
            <label
              className="
                mb-2
                block
                text-sm
                font-medium
                text-[var(--color-text)]
              "
            >
              Class
            </label>

            <select
              value={selectedClass}
              onChange={(e) =>
                handleClassChange(
                  e.target.value
                )
              }
              className="
                w-full
                rounded-lg
                border
                border-[var(--color-secondary)]/40
                bg-[var(--color-background)]
                px-3
                py-2.5
                text-sm
                text-[var(--color-text)]
                outline-none
                transition
                focus:border-[var(--color-primary)]
                focus:ring-2
                focus:ring-[var(--color-primary)]/20
              "
            >
              <option value="">
                Select class
              </option>

              {classes.map(
                (classLevel) => (
                  <option
                    key={getId(classLevel)}
                    value={getId(classLevel)}
                  >
                    {getName(classLevel)}
                  </option>
                )
              )}
            </select>
          </div>

          {/* EXAM */}

          <div>
            <label
              className="
                mb-2
                block
                text-sm
                font-medium
                text-[var(--color-text)]
              "
            >
              Examination
            </label>

            <select
              value={selectedExamination}
              onChange={(e) =>
                handleExaminationChange(
                  e.target.value
                )
              }
              className="
                w-full
                rounded-lg
                border
                border-[var(--color-secondary)]/40
                bg-[var(--color-background)]
                px-3
                py-2.5
                text-sm
                text-[var(--color-text)]
                outline-none
                transition
                focus:border-[var(--color-primary)]
                focus:ring-2
                focus:ring-[var(--color-primary)]/20
              "
            >
              <option value="">
                Select examination
              </option>

              {filteredExaminations.map(
                (exam) => (
                  <option
                    key={getId(exam)}
                    value={getId(exam)}
                  >
                    {exam.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* SUBJECT */}

          <div>
            <label
              className="
                mb-2
                block
                text-sm
                font-medium
                text-[var(--color-text)]
              "
            >
              Subject
            </label>

            <select
              value={
                selectedExaminationSubject
              }
              onChange={(e) =>
                setSelectedExaminationSubject(
                  e.target.value
                )
              }
              disabled={
                !selectedExamination
              }
              className="
                w-full
                rounded-lg
                border
                border-[var(--color-secondary)]/40
                bg-[var(--color-background)]
                px-3
                py-2.5
                text-sm
                text-[var(--color-text)]
                outline-none
                transition
                focus:border-[var(--color-primary)]
                focus:ring-2
                focus:ring-[var(--color-primary)]/20
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <option value="">
                Select subject
              </option>

              {filteredExaminationSubjects.map(
                (item) => (
                  <option
                    key={getId(item)}
                    value={getId(item)}
                  >
                    {item.subject_name}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </div>

      {/* ======================================================
          SELECTED EXAMINATION INFORMATION
      ====================================================== */}

      {selectedSubject && (
        <div
          className="
            rounded-2xl
            border
            border-[var(--color-primary)]/20
            bg-[var(--color-card)]
            p-4
            shadow-sm
          "
        >
          <div
            className="
              flex
              flex-col
              gap-4
              md:flex-row
              md:items-center
              md:justify-between
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-lg
                  bg-[var(--color-primary)]/10
                  text-[var(--color-primary)]
                "
              >
                <FileText className="h-5 w-5" />
              </div>

              <div>
                <p className="text-base font-semibold text-[var(--color-text)]">
                  {
                    selectedSubject.subject_name
                  }
                </p>

                <p className="text-sm text-[var(--color-secondary)]">
                  {selectedExam?.name ||
                    "Examination"}
                </p>
              </div>
            </div>

            <div
              className="
                rounded-lg
                border
                border-[var(--color-secondary)]/20
                bg-[var(--color-background)]
                px-4
                py-2
                text-sm
              "
            >
              <span className="text-[var(--color-secondary)]">
                Maximum Score:
              </span>{" "}
              <span className="font-semibold text-[var(--color-text)]">
                {
                  selectedSubject.maximum_score
                }
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          SEARCH
      ====================================================== */}

      {selectedExaminationSubject && (
        <div
          className="
            flex
            flex-col
            gap-3
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div className="relative w-full sm:max-w-md">
            <Search
              className="
                absolute
                left-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-[var(--color-secondary)]
              "
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search student or admission number..."
              className="
                w-full
                rounded-lg
                border
                border-[var(--color-secondary)]/40
                bg-[var(--color-card)]
                py-2.5
                pl-10
                pr-3
                text-sm
                text-[var(--color-text)]
                outline-none
                transition
                placeholder:text-[var(--color-secondary)]/60
                focus:border-[var(--color-primary)]
                focus:ring-2
                focus:ring-[var(--color-primary)]/20
              "
            />
          </div>

          <div
            className="
              text-sm
              text-[var(--color-secondary)]
            "
          >
            {filteredEnrollments.length}{" "}
            student
            {filteredEnrollments.length ===
            1
              ? ""
              : "s"}
          </div>
        </div>
      )}

      {/* ======================================================
          NO SELECTION
      ====================================================== */}

      {!selectedExaminationSubject && (
        <div
          className="
            rounded-2xl
            border
            border-dashed
            border-[var(--color-secondary)]/30
            bg-[var(--color-card)]
            p-10
            text-center
          "
        >
          <div
            className="
              mx-auto
              mb-4
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              bg-[var(--color-primary)]/10
              text-[var(--color-primary)]
            "
          >
            <FileText className="h-6 w-6" />
          </div>

          <p className="text-base font-semibold text-[var(--color-text)]">
            Select an examination subject
          </p>

          <p className="mx-auto mt-1 max-w-md text-sm text-[var(--color-secondary)]">
            Choose the session, term, class,
            examination and subject to enter
            student results.
          </p>
        </div>
      )}

      {/* ======================================================
          LOADING
      ====================================================== */}

      {selectedExaminationSubject &&
        (loadingRoster ||
          loadingResults) && (
          <div
            className="
              flex
              min-h-[250px]
              items-center
              justify-center
              rounded-2xl
              border
              border-[var(--color-secondary)]/20
              bg-[var(--color-card)]
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
                text-[var(--color-secondary)]
              "
            >
              <Loader2 className="h-6 w-6 animate-spin" />

              <span className="text-sm">
                Loading students and results...
              </span>
            </div>
          </div>
        )}

      {/* ======================================================
          RESULTS
      ====================================================== */}

      {selectedExaminationSubject &&
        !loadingRoster &&
        !loadingResults && (
          <div
            className="
              overflow-hidden
              rounded-2xl
              border
              border-[var(--color-secondary)]/20
              bg-[var(--color-card)]
              shadow-sm
            "
          >
            {filteredEnrollments.length ===
            0 ? (
              <div className="p-10 text-center">
                <div
                  className="
                    mx-auto
                    mb-4
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    bg-[var(--color-secondary)]/10
                    text-[var(--color-secondary)]
                  "
                >
                  <Search className="h-5 w-5" />
                </div>

                <p className="font-semibold text-[var(--color-text)]">
                  No students found
                </p>

                <p className="mx-auto mt-1 max-w-md text-sm text-[var(--color-secondary)]">
                  There are no current students
                  for the selected class, session
                  and term.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[950px] w-full">
                  {/* ==================================================
                      TABLE HEADER
                  ================================================== */}

                  <thead>
                    <tr
                      className="
                        border-b
                        border-[var(--color-secondary)]/20
                        bg-[var(--color-background)]
                      "
                    >
                      <th
                        className="
                          px-4
                          py-3
                          text-left
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wide
                          text-[var(--color-secondary)]
                        "
                      >
                        Student
                      </th>

                      <th
                        className="
                          px-4
                          py-3
                          text-left
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wide
                          text-[var(--color-secondary)]
                        "
                      >
                        Admission No.
                      </th>

                      <th
                        className="
                          w-[120px]
                          px-4
                          py-3
                          text-left
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wide
                          text-[var(--color-secondary)]
                        "
                      >
                        CA
                      </th>

                      <th
                        className="
                          w-[120px]
                          px-4
                          py-3
                          text-left
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wide
                          text-[var(--color-secondary)]
                        "
                      >
                        Exam
                      </th>

                      <th
                        className="
                          px-4
                          py-3
                          text-center
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wide
                          text-[var(--color-secondary)]
                        "
                      >
                        Total
                      </th>

                      <th
                        className="
                          px-4
                          py-3
                          text-center
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wide
                          text-[var(--color-secondary)]
                        "
                      >
                        Grade
                      </th>

                      <th
                        className="
                          px-4
                          py-3
                          text-center
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wide
                          text-[var(--color-secondary)]
                        "
                      >
                        Status
                      </th>

                      <th
                        className="
                          px-4
                          py-3
                          text-right
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wide
                          text-[var(--color-secondary)]
                        "
                      >
                        Action
                      </th>
                    </tr>
                  </thead>

                  {/* ==================================================
                      TABLE BODY
                  ================================================== */}

                  <tbody>
                    {filteredEnrollments.map(
                      (enrollment) => {
                        const studentId =
                          enrollment.student;

                        const studentScore =
                          scores[studentId] || {
                            caScore: "",
                            examScore: "",
                            totalScore: "",
                            grade: "",
                            remark: "",
                            resultId: null,
                            isPublished: false,
                          };

                        const isSaving =
                          savingStudent ===
                          studentId;

                        return (
                          <tr
                            key={
                              enrollment.id
                            }
                            className="
                              border-b
                              border-[var(--color-secondary)]/10
                              transition
                              last:border-0
                              hover:bg-[var(--color-background)]/70
                            "
                          >
                            {/* STUDENT */}

                            <td className="px-4 py-4">
                              <div className="font-medium text-[var(--color-text)]">
                                {
                                  enrollment.student_name
                                }
                              </div>

                              <div className="mt-1 text-xs text-[var(--color-secondary)]">
                                {
                                  enrollment.class_name
                                }
                              </div>
                            </td>

                            {/* ADMISSION */}

                            <td
                              className="
                                px-4
                                py-4
                                text-sm
                                text-[var(--color-secondary)]
                              "
                            >
                              {
                                enrollment.admission_number
                              }
                            </td>

                            {/* CA */}

                            <td className="px-4 py-4">
                              <ScoreInput
                                value={
                                  studentScore.caScore
                                }
                                onChange={(
                                  value
                                ) =>
                                  handleScoreChange(
                                    studentId,
                                    "caScore",
                                    value
                                  )
                                }
                                disabled={
                                  studentScore.isPublished
                                }
                              />
                            </td>

                            {/* EXAM */}

                            <td className="px-4 py-4">
                              <ScoreInput
                                value={
                                  studentScore.examScore
                                }
                                onChange={(
                                  value
                                ) =>
                                  handleScoreChange(
                                    studentId,
                                    "examScore",
                                    value
                                  )
                                }
                                disabled={
                                  studentScore.isPublished
                                }
                              />
                            </td>

                            {/* TOTAL */}

                            <td className="px-4 py-4 text-center">
                              <span
                                className="
                                  font-semibold
                                  text-[var(--color-primary)]
                                "
                              >
                                {
                                  studentScore.totalScore ||
                                  "—"
                                }
                              </span>
                            </td>

                            {/* GRADE */}

                            <td className="px-4 py-4 text-center">
                              <span
                                className="
                                  font-semibold
                                  text-[var(--color-text)]
                                "
                              >
                                {
                                  studentScore.grade ||
                                  "—"
                                }
                              </span>
                            </td>

                            {/* STATUS */}

                            <td className="px-4 py-4 text-center">
                              {studentScore.isPublished ? (
                                <span
                                  className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    rounded-full
                                    border
                                    border-[var(--color-secondary)]/30
                                    bg-[var(--color-secondary)]/10
                                    px-2.5
                                    py-1
                                    text-xs
                                    font-medium
                                    text-[var(--color-secondary)]
                                  "
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />

                                  Published
                                </span>
                              ) : studentScore.resultId ? (
                                <span
                                  className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    rounded-full
                                    border
                                    border-[var(--color-primary)]/30
                                    bg-[var(--color-primary)]/10
                                    px-2.5
                                    py-1
                                    text-xs
                                    font-medium
                                    text-[var(--color-primary)]
                                  "
                                >
                                  <CheckCircle className="h-3.5 w-3.5" />

                                  Saved
                                </span>
                              ) : (
                                <span
                                  className="
                                    inline-flex
                                    items-center
                                    rounded-full
                                    border
                                    border-[var(--color-secondary)]/30
                                    bg-[var(--color-secondary)]/5
                                    px-2.5
                                    py-1
                                    text-xs
                                    font-medium
                                    text-[var(--color-secondary)]
                                  "
                                >
                                  Not entered
                                </span>
                              )}
                            </td>

                            {/* ACTION */}

                            <td className="px-4 py-4 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  saveResult(
                                    studentId
                                  )
                                }
                                disabled={
                                  isSaving ||
                                  studentScore.isPublished
                                }
                                className="
                                  inline-flex
                                  items-center
                                  justify-center
                                  gap-2
                                  rounded-lg
                                  bg-[var(--color-primary)]
                                  px-3
                                  py-2
                                  text-sm
                                  font-medium
                                  text-white
                                  shadow-sm
                                  transition
                                  hover:bg-[var(--color-primary)]/90
                                  focus:outline-none
                                  focus:ring-2
                                  focus:ring-[var(--color-primary)]/30
                                  disabled:cursor-not-allowed
                                  disabled:opacity-50
                                "
                              >
                                {isSaving ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin" />

                                    Saving
                                  </>
                                ) : studentScore.resultId ? (
                                  <>
                                    <Save className="h-4 w-4" />

                                    Update
                                  </>
                                ) : (
                                  <>
                                    <Save className="h-4 w-4" />

                                    Save
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
    </div>
  );
}