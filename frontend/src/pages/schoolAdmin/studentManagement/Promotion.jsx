// import { useEffect, useMemo, useState } from "react";
// import {
//   AlertCircle,
//   CheckCircle,
//   ChevronDown,
//   GraduationCap,
//   Loader2,
//   RefreshCw,
//   Search,
//   ShieldCheck,
//   UserCheck,
//   X,
// } from "lucide-react";

// import api from "../../../services/api";

// const ENDPOINTS = {
//   sessions: "/academics/sessions/",
//   terms: "/academics/terms/",
//   classes: "/academics/class-levels/",
//   enrollments: "/students/enrollments/",
//   promotionEligibility: (studentId) =>
//     `/students/enrollments/${studentId}/promotion/`,
//   promote: "/students/enrollments/promote/",
// };

// function Promotion() {
//   const [sessions, setSessions] = useState([]);
//   const [terms, setTerms] = useState([]);
//   const [classes, setClasses] = useState([]);
//   const [enrollments, setEnrollments] = useState([]);

//   const [selectedSession, setSelectedSession] = useState("");
//   const [selectedTerm, setSelectedTerm] = useState("");
//   const [selectedClass, setSelectedClass] = useState("");

//   const [search, setSearch] = useState("");

//   const [loadingSessions, setLoadingSessions] = useState(true);
//   const [loadingTerms, setLoadingTerms] = useState(false);
//   const [loadingClasses, setLoadingClasses] = useState(false);
//   const [loadingEnrollments, setLoadingEnrollments] = useState(false);

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const [eligibilityLoading, setEligibilityLoading] = useState(false);
//   const [promotionLoading, setPromotionLoading] = useState(false);

//   const [promotionData, setPromotionData] = useState(null);
//   const [selectedStudent, setSelectedStudent] = useState(null);

//   const [selectedTargetClass, setSelectedTargetClass] = useState("");
//   const [remarks, setRemarks] = useState("");

//   const [showPromotionModal, setShowPromotionModal] = useState(false);

//   // ============================================================
//   // HELPERS
//   // ============================================================

//   const getItems = (response) => {
//     if (Array.isArray(response.data)) {
//       return response.data;
//     }

//     if (Array.isArray(response.data?.results)) {
//       return response.data.results;
//     }

//     return [];
//   };

//   const getSessionId = (session) => session?.id;

//   const getSessionName = (session) =>
//     session?.name ||
//     session?.session_name ||
//     session?.title ||
//     `Session ${session?.id}`;

//   const getTermId = (term) => term?.id;

//   const getTermName = (term) =>
//     term?.term_name ||
//     term?.name_display ||
//     term?.display_name ||
//     term?.name ||
//     `Term ${term?.id}`;

//   const getClassName = (classLevel) =>
//     classLevel?.name ||
//     classLevel?.class_name ||
//     `Class ${classLevel?.id}`;

//   const getStudentName = (student) =>
//     student?.full_name ||
//     student?.student_name ||
//     `${student?.first_name || ""} ${
//       student?.last_name || ""
//     }`.trim() ||
//     "Unknown Student";

//   const getAdmissionNumber = (student) =>
//     student?.admission_number ||
//     student?.admissionNo ||
//     student?.admission_no ||
//     "—";

//   // ============================================================
//   // LOAD SESSIONS
//   // ============================================================

//   const loadSessions = async () => {
//     try {
//       setLoadingSessions(true);
//       setError("");

//       const response = await api.get(ENDPOINTS.sessions);
//       const data = getItems(response);

//       setSessions(data);

//       if (data.length > 0) {
//         const currentSession =
//           data.find(
//             (session) =>
//               session.is_current === true ||
//               session.current === true
//           ) || data[0];

//         setSelectedSession(
//           String(getSessionId(currentSession))
//         );
//       } else {
//         setSelectedSession("");
//       }
//     } catch (err) {
//       console.error("Failed to load academic sessions:", err);

//       setError(
//         err?.response?.data?.detail ||
//           "Failed to load academic sessions."
//       );
//     } finally {
//       setLoadingSessions(false);
//     }
//   };

//   useEffect(() => {
//     loadSessions();
//   }, []);

//   // ============================================================
//   // LOAD TERMS
//   // ============================================================

//   const loadTerms = async () => {
//     if (!selectedSession) {
//       setTerms([]);
//       setSelectedTerm("");
//       return;
//     }

//     try {
//       setLoadingTerms(true);
//       setError("");

//       const response = await api.get(
//         ENDPOINTS.terms,
//         {
//           params: {
//             academic_session: selectedSession,
//           },
//         }
//       );

//       const data = getItems(response);

//       setTerms(data);

//       if (data.length > 0) {
//         const thirdTerm =
//           data.find(
//             (term) =>
//               String(term.name).toUpperCase() === "THIRD" ||
//               String(term.term_name).toUpperCase() ===
//                 "THIRD TERM"
//           ) || null;

//         const activeTerm =
//           thirdTerm ||
//           data.find(
//             (term) =>
//               term.is_active === true ||
//               term.is_current === true ||
//               term.current === true
//           ) ||
//           data[0];

//         setSelectedTerm(String(getTermId(activeTerm)));
//       } else {
//         setSelectedTerm("");
//       }
//     } catch (err) {
//       console.error("Failed to load terms:", err);

//       setTerms([]);
//       setSelectedTerm("");

//       setError(
//         err?.response?.data?.detail ||
//           "Failed to load terms."
//       );
//     } finally {
//       setLoadingTerms(false);
//     }
//   };

//   useEffect(() => {
//     loadTerms();
//   }, [selectedSession]);

//   // ============================================================
//   // LOAD CLASSES
//   // ============================================================

//   const loadClasses = async () => {
//     try {
//       setLoadingClasses(true);

//       const response = await api.get(
//         ENDPOINTS.classes
//       );

//       setClasses(getItems(response));
//     } catch (err) {
//       console.error("Failed to load classes:", err);

//       setClasses([]);

//       setError(
//         err?.response?.data?.detail ||
//           "Failed to load classes."
//       );
//     } finally {
//       setLoadingClasses(false);
//     }
//   };

//   useEffect(() => {
//     loadClasses();
//   }, []);

//   // ============================================================
//   // LOAD THIRD TERM ENROLLMENTS
//   // ============================================================

//   const loadEnrollments = async () => {
//     if (!selectedSession || !selectedTerm) {
//       setEnrollments([]);
//       return;
//     }

//     try {
//       setLoadingEnrollments(true);
//       setError("");
//       setSuccess("");

//       const params = {
//         academic_session: selectedSession,
//         term: selectedTerm,
//         is_current: true,
//       };

//       if (selectedClass) {
//         params.class_level = selectedClass;
//       }

//       const response = await api.get(
//         ENDPOINTS.enrollments,
//         { params }
//       );

//       setEnrollments(getItems(response));
//     } catch (err) {
//       console.error(
//         "Failed to load student enrollments:",
//         err
//       );

//       setEnrollments([]);

//       setError(
//         err?.response?.data?.detail ||
//           "Failed to load student enrollments."
//       );
//     } finally {
//       setLoadingEnrollments(false);
//     }
//   };

//   useEffect(() => {
//     loadEnrollments();
//   }, [
//     selectedSession,
//     selectedTerm,
//     selectedClass,
//   ]);

//   // ============================================================
//   // FILTER STUDENTS
//   // ============================================================

//   const filteredEnrollments = useMemo(() => {
//     const query = search.trim().toLowerCase();

//     if (!query) {
//       return enrollments;
//     }

//     return enrollments.filter((enrollment) => {
//       const student = enrollment.student;

//       const name = String(
//         enrollment.student_name ||
//           getStudentName(student)
//       ).toLowerCase();

//       const admissionNumber = String(
//         enrollment.admission_number ||
//           getAdmissionNumber(student)
//       ).toLowerCase();

//       const className = String(
//         enrollment.class_name ||
//           getClassName(enrollment.class_level)
//       ).toLowerCase();

//       return (
//         name.includes(query) ||
//         admissionNumber.includes(query) ||
//         className.includes(query)
//       );
//     });
//   }, [enrollments, search]);

//   // ============================================================
//   // OPEN PROMOTION CHECK
//   // ============================================================

//   const checkEligibility = async (enrollment) => {
//     const studentId =
//       enrollment.student ||
//       enrollment.student_id;

//     if (!studentId) {
//       setError(
//         "This enrollment does not contain a student ID."
//       );
//       return;
//     }

//     try {
//       setEligibilityLoading(true);
//       setError("");
//       setSuccess("");

//       setSelectedStudent(enrollment);

//       const response = await api.get(
//         ENDPOINTS.promotionEligibility(studentId)
//       );

//       const data = response.data;

//       setPromotionData(data);

//       setSelectedTargetClass("");

//       setRemarks("");

//       setShowPromotionModal(true);
//     } catch (err) {
//       console.error(
//         "Failed to check promotion eligibility:",
//         err
//       );

//       setPromotionData(null);

//       setError(
//         err?.response?.data?.detail ||
//           "Failed to check promotion eligibility."
//       );
//     } finally {
//       setEligibilityLoading(false);
//     }
//   };

//   // ============================================================
//   // CLOSE MODAL
//   // ============================================================

//   const closeModal = () => {
//     if (promotionLoading) {
//       return;
//     }

//     setShowPromotionModal(false);
//     setSelectedStudent(null);
//     setPromotionData(null);
//     setSelectedTargetClass("");
//     setRemarks("");
//   };

//   // ============================================================
//   // PROMOTE / GRADUATE
//   // ============================================================

//   const handlePromotion = async () => {
//     if (!selectedStudent || !promotionData) {
//       return;
//     }

//     const studentId =
//       selectedStudent.student ||
//       selectedStudent.student_id;

//     const isGraduation =
//       promotionData.requires_graduation === true ||
//       promotionData.action === "GRADUATED";

//     const targetClasses =
//       promotionData.target_classes || [];

//     if (
//       !isGraduation &&
//       targetClasses.length > 1 &&
//       !selectedTargetClass
//     ) {
//       setError(
//         "Please select the target class."
//       );
//       return;
//     }

//     try {
//       setPromotionLoading(true);
//       setError("");
//       setSuccess("");

//       const payload = {
//         student_id: studentId,
//       };

//       if (
//         !isGraduation &&
//         selectedTargetClass
//       ) {
//         payload.target_class_id =
//           Number(selectedTargetClass);
//       }

//       if (remarks.trim()) {
//         payload.remarks = remarks.trim();
//       }

//       const response = await api.post(
//         ENDPOINTS.promote,
//         payload
//       );

//       const result = response.data;

//       setShowPromotionModal(false);
//       setSelectedStudent(null);
//       setPromotionData(null);
//       setSelectedTargetClass("");
//       setRemarks("");

//       setSuccess(
//         result.detail ||
//           (result.action === "GRADUATED"
//             ? "Student graduated successfully."
//             : "Student promoted successfully.")
//       );

//       await loadEnrollments();
//     } catch (err) {
//       console.error(
//         "Failed to promote student:",
//         err
//       );

//       const responseData = err?.response?.data;

//       setError(
//         responseData?.detail ||
//           responseData?.message ||
//           "Failed to promote student."
//       );
//     } finally {
//       setPromotionLoading(false);
//     }
//   };

//   // ============================================================
//   // REFRESH
//   // ============================================================

//   const handleRefresh = async () => {
//     setError("");
//     setSuccess("");

//     await Promise.all([
//       loadSessions(),
//       loadClasses(),
//     ]);

//     await loadEnrollments();
//   };

//   // ============================================================
//   // DERIVED DATA
//   // ============================================================

//   const currentClassName =
//     selectedStudent?.class_name ||
//     getClassName(selectedStudent?.class_level);

//   const targetClasses =
//     promotionData?.target_classes || [];

//   const isGraduation =
//     promotionData?.requires_graduation === true;

//   const isAlreadyPromoted =
//     promotionData?.already_promoted === true;

//   const canPromote =
//     promotionData?.eligible === true &&
//     !isAlreadyPromoted;

//   // ============================================================
//   // RENDER
//   // ============================================================

//   return (
//     <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] p-4 md:p-6">
//       {/* ======================================================
//           HEADER
//       ====================================================== */}

//       <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//         <div>
//           <div className="flex items-center gap-3">
//             <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
//               <GraduationCap size={24} />
//             </div>

//             <div>
//               <h1 className="text-2xl font-bold">
//                 Student Promotion
//               </h1>

//               <p className="mt-1 text-sm opacity-70">
//                 Promote students to the next academic
//                 session or graduate completed SS3 students.
//               </p>
//             </div>
//           </div>
//         </div>

//         <button
//           type="button"
//           onClick={handleRefresh}
//           disabled={
//             loadingSessions ||
//             loadingTerms ||
//             loadingClasses ||
//             loadingEnrollments
//           }
//           className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
//         >
//           <RefreshCw
//             size={17}
//             className={
//               loadingEnrollments
//                 ? "animate-spin"
//                 : ""
//             }
//           />

//           Refresh
//         </button>
//       </div>

//       {/* ======================================================
//           ALERTS
//       ====================================================== */}

//       {error && (
//         <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
//           <AlertCircle
//             size={19}
//             className="mt-0.5 shrink-0"
//           />

//           <div className="flex-1">
//             {error}
//           </div>

//           <button
//             type="button"
//             onClick={() => setError("")}
//             className="opacity-70 hover:opacity-100"
//           >
//             <X size={17} />
//           </button>
//         </div>
//       )}

//       {success && (
//         <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-700 dark:text-green-300">
//           <CheckCircle
//             size={19}
//             className="mt-0.5 shrink-0"
//           />

//           <div className="flex-1">
//             {success}
//           </div>

//           <button
//             type="button"
//             onClick={() => setSuccess("")}
//             className="opacity-70 hover:opacity-100"
//           >
//             <X size={17} />
//           </button>
//         </div>
//       )}

//       {/* ======================================================
//           FILTERS
//       ====================================================== */}

//       <div className="mb-6 rounded-2xl border border-black/10 bg-[var(--color-card)] p-4 shadow-sm">
//         <div className="mb-4 flex items-center gap-2">
//           <ShieldCheck
//             size={19}
//             className="text-[var(--color-primary)]"
//           />

//           <h2 className="font-semibold">
//             Promotion Period
//           </h2>
//         </div>

//         <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
//           {/* SESSION */}

//           <div>
//             <label className="mb-1.5 block text-sm font-medium">
//               Academic Session
//             </label>

//             <div className="relative">
//               <select
//                 value={selectedSession}
//                 onChange={(event) => {
//                   setSelectedSession(
//                     event.target.value
//                   );
//                   setSelectedTerm("");
//                 }}
//                 disabled={loadingSessions}
//                 className="w-full appearance-none rounded-lg border border-black/10 bg-[var(--color-background)] px-3 py-2.5 pr-10 text-sm outline-none focus:border-[var(--color-primary)]"
//               >
//                 {loadingSessions ? (
//                   <option value="">
//                     Loading sessions...
//                   </option>
//                 ) : (
//                   <>
//                     <option value="">
//                       Select session
//                     </option>

//                     {sessions.map((session) => (
//                       <option
//                         key={getSessionId(session)}
//                         value={getSessionId(session)}
//                       >
//                         {getSessionName(session)}
//                       </option>
//                     ))}
//                   </>
//                 )}
//               </select>

//               <ChevronDown
//                 size={17}
//                 className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60"
//               />
//             </div>
//           </div>

//           {/* TERM */}

//           <div>
//             <label className="mb-1.5 block text-sm font-medium">
//               Term
//             </label>

//             <div className="relative">
//               <select
//                 value={selectedTerm}
//                 onChange={(event) =>
//                   setSelectedTerm(event.target.value)
//                 }
//                 disabled={
//                   loadingTerms ||
//                   !selectedSession
//                 }
//                 className="w-full appearance-none rounded-lg border border-black/10 bg-[var(--color-background)] px-3 py-2.5 pr-10 text-sm outline-none focus:border-[var(--color-primary)]"
//               >
//                 {loadingTerms ? (
//                   <option value="">
//                     Loading terms...
//                   </option>
//                 ) : (
//                   <>
//                     <option value="">
//                       Select term
//                     </option>

//                     {terms.map((term) => (
//                       <option
//                         key={getTermId(term)}
//                         value={getTermId(term)}
//                       >
//                         {getTermName(term)}
//                       </option>
//                     ))}
//                   </>
//                 )}
//               </select>

//               <ChevronDown
//                 size={17}
//                 className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60"
//               />
//             </div>
//           </div>

//           {/* CLASS */}

//           <div>
//             <label className="mb-1.5 block text-sm font-medium">
//               Current Class
//             </label>

//             <div className="relative">
//               <select
//                 value={selectedClass}
//                 onChange={(event) =>
//                   setSelectedClass(event.target.value)
//                 }
//                 disabled={loadingClasses}
//                 className="w-full appearance-none rounded-lg border border-black/10 bg-[var(--color-background)] px-3 py-2.5 pr-10 text-sm outline-none focus:border-[var(--color-primary)]"
//               >
//                 <option value="">
//                   All classes
//                 </option>

//                 {classes.map((classLevel) => (
//                   <option
//                     key={classLevel.id}
//                     value={classLevel.id}
//                   >
//                     {getClassName(classLevel)}
//                   </option>
//                 ))}
//               </select>

//               <ChevronDown
//                 size={17}
//                 className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60"
//               />
//             </div>
//           </div>
//         </div>

//         {/* SEARCH */}

//         <div className="mt-4">
//           <label className="mb-1.5 block text-sm font-medium">
//             Search Student
//           </label>

//           <div className="relative">
//             <Search
//               size={18}
//               className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
//             />

//             <input
//               type="text"
//               value={search}
//               onChange={(event) =>
//                 setSearch(event.target.value)
//               }
//               placeholder="Search by student name, admission number or class..."
//               className="w-full rounded-lg border border-black/10 bg-[var(--color-background)] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[var(--color-primary)]"
//             />
//           </div>
//         </div>
//       </div>

//       {/* ======================================================
//           STUDENT LIST
//       ====================================================== */}

//       <div className="overflow-hidden rounded-2xl border border-black/10 bg-[var(--color-card)] shadow-sm">
//         <div className="flex flex-col gap-2 border-b border-black/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <h2 className="font-semibold">
//               Students
//             </h2>

//             <p className="text-sm opacity-60">
//               {filteredEnrollments.length} student
//               {filteredEnrollments.length === 1
//                 ? ""
//                 : "s"} found
//             </p>
//           </div>

//           {selectedTerm && (
//             <div className="rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
//               Promotion is processed after Third Term
//             </div>
//           )}
//         </div>

//         {loadingEnrollments ? (
//           <div className="flex min-h-[240px] items-center justify-center">
//             <div className="flex items-center gap-2 text-sm opacity-70">
//               <Loader2
//                 size={20}
//                 className="animate-spin"
//               />

//               Loading students...
//             </div>
//           </div>
//         ) : filteredEnrollments.length === 0 ? (
//           <div className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center">
//             <GraduationCap
//               size={42}
//               className="mb-3 opacity-30"
//             />

//             <h3 className="font-semibold">
//               No students found
//             </h3>

//             <p className="mt-1 max-w-md text-sm opacity-60">
//               No current enrollments match the selected
//               session, term, class and search criteria.
//             </p>
//           </div>
//         ) : (
//           <>
//             {/* DESKTOP TABLE */}

//             <div className="hidden overflow-x-auto md:block">
//               <table className="w-full text-left text-sm">
//                 <thead className="border-b border-black/10 bg-black/[0.02]">
//                   <tr>
//                     <th className="px-4 py-3 font-semibold">
//                       Student
//                     </th>

//                     <th className="px-4 py-3 font-semibold">
//                       Admission No.
//                     </th>

//                     <th className="px-4 py-3 font-semibold">
//                       Current Class
//                     </th>

//                     <th className="px-4 py-3 font-semibold">
//                       Session
//                     </th>

//                     <th className="px-4 py-3 font-semibold">
//                       Term
//                     </th>

//                     <th className="px-4 py-3 text-right font-semibold">
//                       Action
//                     </th>
//                   </tr>
//                 </thead>

//                 <tbody className="divide-y divide-black/10">
//                   {filteredEnrollments.map(
//                     (enrollment) => {
//                       const studentName =
//                         enrollment.student_name ||
//                         getStudentName(
//                           enrollment.student
//                         );

//                       const admissionNumber =
//                         enrollment.admission_number ||
//                         getAdmissionNumber(
//                           enrollment.student
//                         );

//                       const className =
//                         enrollment.class_name ||
//                         getClassName(
//                           enrollment.class_level
//                         );

//                       return (
//                         <tr
//                           key={enrollment.id}
//                           className="transition hover:bg-black/[0.02]"
//                         >
//                           <td className="px-4 py-4">
//                             <div className="flex items-center gap-3">
//                               <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
//                                 <UserCheck
//                                   size={17}
//                                 />
//                               </div>

//                               <span className="font-medium">
//                                 {studentName}
//                               </span>
//                             </div>
//                           </td>

//                           <td className="px-4 py-4 opacity-75">
//                             {admissionNumber}
//                           </td>

//                           <td className="px-4 py-4">
//                             {className}
//                           </td>

//                           <td className="px-4 py-4 opacity-75">
//                             {enrollment.session_name ||
//                               getSessionName(
//                                 enrollment.academic_session
//                               )}
//                           </td>

//                           <td className="px-4 py-4 opacity-75">
//                             {enrollment.term_name ||
//                               getTermName(
//                                 enrollment.term
//                               )}
//                           </td>

//                           <td className="px-4 py-4 text-right">
//                             <button
//                               type="button"
//                               onClick={() =>
//                                 checkEligibility(
//                                   enrollment
//                                 )
//                               }
//                               disabled={
//                                 eligibilityLoading
//                               }
//                               className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
//                             >
//                               {eligibilityLoading ? (
//                                 <Loader2
//                                   size={15}
//                                   className="animate-spin"
//                                 />
//                               ) : (
//                                 <GraduationCap
//                                   size={15}
//                                 />
//                               )}

//                               Promote
//                             </button>
//                           </td>
//                         </tr>
//                       );
//                     }
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* MOBILE CARDS */}

//             <div className="divide-y divide-black/10 md:hidden">
//               {filteredEnrollments.map(
//                 (enrollment) => {
//                   const studentName =
//                     enrollment.student_name ||
//                     getStudentName(
//                       enrollment.student
//                     );

//                   const admissionNumber =
//                     enrollment.admission_number ||
//                     getAdmissionNumber(
//                       enrollment.student
//                     );

//                   const className =
//                     enrollment.class_name ||
//                     getClassName(
//                       enrollment.class_level
//                     );

//                   return (
//                     <div
//                       key={enrollment.id}
//                       className="p-4"
//                     >
//                       <div className="flex items-start gap-3">
//                         <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
//                           <UserCheck
//                             size={18}
//                           />
//                         </div>

//                         <div className="min-w-0 flex-1">
//                           <h3 className="font-semibold">
//                             {studentName}
//                           </h3>

//                           <p className="mt-1 text-xs opacity-60">
//                             {admissionNumber}
//                           </p>

//                           <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
//                             <div>
//                               <p className="opacity-50">
//                                 Class
//                               </p>

//                               <p className="mt-0.5 font-medium">
//                                 {className}
//                               </p>
//                             </div>

//                             <div>
//                               <p className="opacity-50">
//                                 Term
//                               </p>

//                               <p className="mt-0.5 font-medium">
//                                 {enrollment.term_name ||
//                                   getTermName(
//                                     enrollment.term
//                                   )}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       <button
//                         type="button"
//                         onClick={() =>
//                           checkEligibility(
//                             enrollment
//                           )
//                         }
//                         disabled={eligibilityLoading}
//                         className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
//                       >
//                         {eligibilityLoading ? (
//                           <Loader2
//                             size={17}
//                             className="animate-spin"
//                           />
//                         ) : (
//                           <GraduationCap
//                             size={17}
//                           />
//                         )}

//                         Check Promotion
//                       </button>
//                     </div>
//                   );
//                 }
//               )}
//             </div>
//           </>
//         )}
//       </div>

//       {/* ======================================================
//           PROMOTION MODAL
//       ====================================================== */}

//       {showPromotionModal &&
//         promotionData && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//             <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-[var(--color-card)] shadow-2xl">
//               {/* MODAL HEADER */}

//               <div className="flex items-start justify-between border-b border-black/10 p-5">
//                 <div>
//                   <div className="flex items-center gap-2">
//                     {isGraduation ? (
//                       <GraduationCap
//                         size={21}
//                         className="text-[var(--color-primary)]"
//                       />
//                     ) : (
//                       <UserCheck
//                         size={21}
//                         className="text-[var(--color-primary)]"
//                       />
//                     )}

//                     <h2 className="text-lg font-bold">
//                       {isGraduation
//                         ? "Graduate Student"
//                         : "Promote Student"}
//                     </h2>
//                   </div>

//                   <p className="mt-1 text-sm opacity-60">
//                     {selectedStudent
//                       ? selectedStudent.student_name ||
//                         getStudentName(
//                           selectedStudent.student
//                         )
//                       : "Student"}
//                   </p>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={closeModal}
//                   disabled={promotionLoading}
//                   className="rounded-lg p-2 opacity-60 transition hover:bg-black/5 hover:opacity-100 disabled:cursor-not-allowed"
//                 >
//                   <X size={19} />
//                 </button>
//               </div>

//               <div className="space-y-5 p-5">
//                 {/* DETAIL */}

//                 <div className="rounded-xl border border-black/10 bg-black/[0.02] p-4">
//                   <div className="grid grid-cols-2 gap-4 text-sm">
//                     <div>
//                       <p className="text-xs opacity-50">
//                         Current Session
//                       </p>

//                       <p className="mt-1 font-medium">
//                         {
//                           promotionData
//                             .current_enrollment
//                             ?.session
//                         }
//                       </p>
//                     </div>

//                     <div>
//                       <p className="text-xs opacity-50">
//                         Current Term
//                       </p>

//                       <p className="mt-1 font-medium">
//                         {
//                           promotionData
//                             .current_enrollment
//                             ?.term
//                         }
//                       </p>
//                     </div>

//                     <div>
//                       <p className="text-xs opacity-50">
//                         Current Class
//                       </p>

//                       <p className="mt-1 font-medium">
//                         {
//                           promotionData
//                             .current_enrollment
//                             ?.class
//                         }
//                       </p>
//                     </div>

//                     <div>
//                       <p className="text-xs opacity-50">
//                         Department
//                       </p>

//                       <p className="mt-1 font-medium">
//                         {promotionData
//                           .current_enrollment
//                           ?.department || "—"}
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* BACKEND MESSAGE */}

//                 {promotionData.detail && (
//                   <div
//                     className={`rounded-xl border p-4 text-sm ${
//                       promotionData.eligible
//                         ? "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300"
//                         : "border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300"
//                     }`}
//                   >
//                     <div className="flex gap-2">
//                       {promotionData.eligible ? (
//                         <CheckCircle
//                           size={18}
//                           className="mt-0.5 shrink-0"
//                         />
//                       ) : (
//                         <AlertCircle
//                           size={18}
//                           className="mt-0.5 shrink-0"
//                         />
//                       )}

//                       <span>
//                         {promotionData.detail}
//                       </span>
//                     </div>
//                   </div>
//                 )}

//                 {/* ALREADY PROMOTED */}

//                 {isAlreadyPromoted && (
//                   <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-700 dark:text-blue-300">
//                     This student already has an enrollment
//                     in the next academic session. No
//                     further promotion is required.
//                   </div>
//                 )}

//                 {/* GRADUATION */}

//                 {isGraduation && canPromote && (
//                   <div className="rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 p-4">
//                     <div className="flex items-start gap-3">
//                       <GraduationCap
//                         size={22}
//                         className="mt-0.5 text-[var(--color-primary)]"
//                       />

//                       <div>
//                         <h3 className="font-semibold">
//                           SS3 Graduation
//                         </h3>

//                         <p className="mt-1 text-sm opacity-70">
//                           This student has completed SS3
//                           and will be graduated instead of
//                           being promoted to another class.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* TARGET CLASS */}

//                 {!isGraduation &&
//                   canPromote &&
//                   targetClasses.length > 0 && (
//                     <div>
//                       <label className="mb-1.5 block text-sm font-semibold">
//                         Target Class
//                       </label>

//                       {targetClasses.length === 1 ? (
//                         <div className="rounded-lg border border-black/10 bg-black/[0.02] p-3 text-sm">
//                           <div className="font-medium">
//                             {targetClasses[0].name}
//                           </div>

//                           <div className="mt-1 text-xs opacity-60">
//                             {targetClasses[0].department ||
//                               "No department"}
//                           </div>

//                           <input
//                             type="hidden"
//                             value={
//                               targetClasses[0].id
//                             }
//                             onChange={() =>
//                               setSelectedTargetClass(
//                                 String(
//                                   targetClasses[0].id
//                                 )
//                               )
//                             }
//                           />
//                         </div>
//                       ) : (
//                         <div className="space-y-2">
//                           {targetClasses.map(
//                             (targetClass) => (
//                               <label
//                                 key={targetClass.id}
//                                 className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
//                                   String(
//                                     selectedTargetClass
//                                   ) ===
//                                   String(
//                                     targetClass.id
//                                   )
//                                     ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
//                                     : "border-black/10 hover:bg-black/[0.02]"
//                                 }`}
//                               >
//                                 <input
//                                   type="radio"
//                                   name="target-class"
//                                   value={
//                                     targetClass.id
//                                   }
//                                   checked={
//                                     String(
//                                       selectedTargetClass
//                                     ) ===
//                                     String(
//                                       targetClass.id
//                                     )
//                                   }
//                                   onChange={(event) =>
//                                     setSelectedTargetClass(
//                                       event.target.value
//                                     )
//                                   }
//                                   className="accent-[var(--color-primary)]"
//                                 />

//                                 <div className="flex-1">
//                                   <div className="font-medium">
//                                     {targetClass.name}
//                                   </div>

//                                   <div className="mt-0.5 text-xs opacity-60">
//                                     {targetClass.department ||
//                                       "No department"}
//                                   </div>
//                                 </div>
//                               </label>
//                             )
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   )}

//                 {/* REMARKS */}

//                 {canPromote && (
//                   <div>
//                     <label className="mb-1.5 block text-sm font-semibold">
//                       Remarks
//                       <span className="ml-1 font-normal opacity-50">
//                         (Optional)
//                       </span>
//                     </label>

//                     <textarea
//                       value={remarks}
//                       onChange={(event) =>
//                         setRemarks(event.target.value)
//                       }
//                       rows={3}
//                       placeholder={
//                         isGraduation
//                           ? "Optional graduation remarks..."
//                           : "Optional promotion remarks..."
//                       }
//                       className="w-full resize-none rounded-lg border border-black/10 bg-[var(--color-background)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
//                     />
//                   </div>
//                 )}
//               </div>

//               {/* MODAL FOOTER */}

//               <div className="flex flex-col-reverse gap-3 border-t border-black/10 p-5 sm:flex-row sm:justify-end">
//                 <button
//                   type="button"
//                   onClick={closeModal}
//                   disabled={promotionLoading}
//                   className="rounded-lg border border-black/10 px-4 py-2.5 text-sm font-medium transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
//                 >
//                   Cancel
//                 </button>

//                 {canPromote && (
//                   <button
//                     type="button"
//                     onClick={handlePromotion}
//                     disabled={
//                       promotionLoading ||
//                       (!isGraduation &&
//                         targetClasses.length > 1 &&
//                         !selectedTargetClass)
//                     }
//                     className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
//                   >
//                     {promotionLoading ? (
//                       <Loader2
//                         size={17}
//                         className="animate-spin"
//                       />
//                     ) : isGraduation ? (
//                       <GraduationCap size={17} />
//                     ) : (
//                       <UserCheck size={17} />
//                     )}

//                     {isGraduation
//                       ? "Graduate Student"
//                       : "Confirm Promotion"}
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//     </div>
//   );
// }

// export default Promotion;


import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  GraduationCap,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";

import api from "../../../services/api";

const ENDPOINTS = {
  sessions: "/academics/sessions/",
  terms: "/academics/terms/",
  classes: "/academics/class-levels/",
  enrollments: "/students/enrollments/",
  promotionEligibility: (studentId) =>
    `/students/enrollments/${studentId}/promotion/`,
  promote: "/students/enrollments/promote/",
};

function Promotion() {
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  const [selectedSession, setSelectedSession] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  const [search, setSearch] = useState("");

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const [promotionLoading, setPromotionLoading] = useState(false);

  const [promotionData, setPromotionData] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [selectedTargetClass, setSelectedTargetClass] = useState("");
  const [remarks, setRemarks] = useState("");

  const [showPromotionModal, setShowPromotionModal] = useState(false);

  // ---------- BULK PROMOTION STATE ----------
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkChecking, setBulkChecking] = useState(false);
  const [bulkPromoting, setBulkPromoting] = useState(false);
  const [bulkItems, setBulkItems] = useState([]);
  const [bulkRemarks, setBulkRemarks] = useState("");

  // ============================================================
  // HELPERS
  // ============================================================

  const getItems = (response) => {
    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (Array.isArray(response.data?.results)) {
      return response.data.results;
    }

    return [];
  };

  const getSessionId = (session) => session?.id;

  const getSessionName = (session) =>
    session?.name ||
    session?.session_name ||
    session?.title ||
    `Session ${session?.id}`;

  const getTermId = (term) => term?.id;

  const getTermName = (term) =>
    term?.term_name ||
    term?.name_display ||
    term?.display_name ||
    term?.name ||
    `Term ${term?.id}`;

  const getClassName = (classLevel) =>
    classLevel?.name ||
    classLevel?.class_name ||
    `Class ${classLevel?.id}`;

  const getStudentName = (student) =>
    student?.full_name ||
    student?.student_name ||
    `${student?.first_name || ""} ${
      student?.last_name || ""
    }`.trim() ||
    "Unknown Student";

  const getAdmissionNumber = (student) =>
    student?.admission_number ||
    student?.admissionNo ||
    student?.admission_no ||
    "—";

  // ============================================================
  // LOAD SESSIONS
  // ============================================================

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      setError("");

      const response = await api.get(ENDPOINTS.sessions);
      const data = getItems(response);

      setSessions(data);

      if (data.length > 0) {
        const currentSession =
          data.find(
            (session) =>
              session.is_current === true ||
              session.current === true
          ) || data[0];

        setSelectedSession(
          String(getSessionId(currentSession))
        );
      } else {
        setSelectedSession("");
      }
    } catch (err) {
      console.error("Failed to load academic sessions:", err);

      setError(
        err?.response?.data?.detail ||
          "Failed to load academic sessions."
      );
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // ============================================================
  // LOAD TERMS
  // ============================================================

  const loadTerms = async () => {
    if (!selectedSession) {
      setTerms([]);
      setSelectedTerm("");
      return;
    }

    try {
      setLoadingTerms(true);
      setError("");

      const response = await api.get(
        ENDPOINTS.terms,
        {
          params: {
            academic_session: selectedSession,
          },
        }
      );

      const data = getItems(response);

      setTerms(data);

      if (data.length > 0) {
        const thirdTerm =
          data.find(
            (term) =>
              String(term.name).toUpperCase() === "THIRD" ||
              String(term.term_name).toUpperCase() ===
                "THIRD TERM"
          ) || null;

        const activeTerm =
          thirdTerm ||
          data.find(
            (term) =>
              term.is_active === true ||
              term.is_current === true ||
              term.current === true
          ) ||
          data[0];

        setSelectedTerm(String(getTermId(activeTerm)));
      } else {
        setSelectedTerm("");
      }
    } catch (err) {
      console.error("Failed to load terms:", err);

      setTerms([]);
      setSelectedTerm("");

      setError(
        err?.response?.data?.detail ||
          "Failed to load terms."
      );
    } finally {
      setLoadingTerms(false);
    }
  };

  useEffect(() => {
    loadTerms();
  }, [selectedSession]);

  // ============================================================
  // LOAD CLASSES
  // ============================================================

  const loadClasses = async () => {
    try {
      setLoadingClasses(true);

      const response = await api.get(
        ENDPOINTS.classes
      );

      setClasses(getItems(response));
    } catch (err) {
      console.error("Failed to load classes:", err);

      setClasses([]);

      setError(
        err?.response?.data?.detail ||
          "Failed to load classes."
      );
    } finally {
      setLoadingClasses(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  // ============================================================
  // LOAD THIRD TERM ENROLLMENTS
  // ============================================================

  const loadEnrollments = async () => {
    if (!selectedSession || !selectedTerm) {
      setEnrollments([]);
      setSelectedIds([]);
      return;
    }

    try {
      setLoadingEnrollments(true);
      setError("");
      setSuccess("");
      setSelectedIds([]);

      const params = {
        academic_session: selectedSession,
        term: selectedTerm,
        is_current: true,
      };

      if (selectedClass) {
        params.class_level = selectedClass;
      }

      const response = await api.get(
        ENDPOINTS.enrollments,
        { params }
      );

      setEnrollments(getItems(response));
    } catch (err) {
      console.error(
        "Failed to load student enrollments:",
        err
      );

      setEnrollments([]);

      setError(
        err?.response?.data?.detail ||
          "Failed to load student enrollments."
      );
    } finally {
      setLoadingEnrollments(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
  }, [
    selectedSession,
    selectedTerm,
    selectedClass,
  ]);

  // ============================================================
  // FILTER STUDENTS
  // ============================================================

  const filteredEnrollments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return enrollments;
    }

    return enrollments.filter((enrollment) => {
      const student = enrollment.student;

      const name = String(
        enrollment.student_name ||
          getStudentName(student)
      ).toLowerCase();

      const admissionNumber = String(
        enrollment.admission_number ||
          getAdmissionNumber(student)
      ).toLowerCase();

      const className = String(
        enrollment.class_name ||
          getClassName(enrollment.class_level)
      ).toLowerCase();

      return (
        name.includes(query) ||
        admissionNumber.includes(query) ||
        className.includes(query)
      );
    });
  }, [enrollments, search]);

  // ============================================================
  // BULK SELECTION
  // ============================================================

  const filteredIds = filteredEnrollments.map(
    (enrollment) => enrollment.id
  );

  const allSelected =
    filteredIds.length > 0 &&
    filteredIds.every((id) => selectedIds.includes(id));

  const someSelected =
    !allSelected &&
    filteredIds.some((id) => selectedIds.includes(id));

  const toggleOne = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );

  const toggleAll = () =>
    setSelectedIds((prev) =>
      allSelected
        ? prev.filter((id) => !filteredIds.includes(id))
        : Array.from(new Set([...prev, ...filteredIds]))
    );

  // ============================================================
  // BULK: OPEN + CHECK ELIGIBILITY
  // ============================================================

  const openBulkModal = async () => {
    const selected = enrollments.filter((enrollment) =>
      selectedIds.includes(enrollment.id)
    );

    if (selected.length === 0) {
      return;
    }

    setError("");
    setSuccess("");
    setBulkRemarks("");
    setBulkItems([]);
    setShowBulkModal(true);
    setBulkChecking(true);

    const checked = await Promise.all(
      selected.map(async (enrollment) => {
        const studentId =
          enrollment.student || enrollment.student_id;

        const base = {
          enrollmentId: enrollment.id,
          studentId,
          name:
            enrollment.student_name ||
            getStudentName(enrollment.student),
          className:
            enrollment.class_name ||
            getClassName(enrollment.class_level),
        };

        try {
          const { data } = await api.get(
            ENDPOINTS.promotionEligibility(studentId)
          );

          const targets = data.target_classes || [];
          const graduation =
            data.requires_graduation === true;

          let status = "ready";

          if (data.already_promoted === true) {
            status = "already";
          } else if (data.eligible !== true) {
            status = "ineligible";
          }

          return {
            ...base,
            status,
            detail: data.detail || "",
            graduation,
            targets,
            targetClassId:
              !graduation && targets.length === 1
                ? String(targets[0].id)
                : "",
          };
        } catch (err) {
          return {
            ...base,
            status: "error",
            detail:
              err?.response?.data?.detail ||
              "Failed to check eligibility.",
            graduation: false,
            targets: [],
            targetClassId: "",
          };
        }
      })
    );

    setBulkItems(checked);
    setBulkChecking(false);
  };

  const closeBulkModal = () => {
    if (bulkPromoting) {
      return;
    }

    setShowBulkModal(false);
    setBulkItems([]);
    setBulkRemarks("");
  };

  const setBulkTarget = (enrollmentId, value) =>
    setBulkItems((prev) =>
      prev.map((item) =>
        item.enrollmentId === enrollmentId
          ? { ...item, targetClassId: value }
          : item
      )
    );

  const readyItems = bulkItems.filter(
    (item) => item.status === "ready"
  );

  const promotableItems = readyItems.filter(
    (item) => item.graduation || item.targetClassId
  );

  const needsClassCount =
    readyItems.length - promotableItems.length;

  // ============================================================
  // BULK: PROMOTE
  // ============================================================

  const handleBulkPromotion = async () => {
    if (promotableItems.length === 0) {
      return;
    }

    setBulkPromoting(true);
    setError("");
    setSuccess("");

    let promoted = 0;
    let graduated = 0;
    const failed = [];

    // Sequential to avoid race conditions on the backend
    for (const item of promotableItems) {
      try {
        const payload = {
          student_id: item.studentId,
        };

        if (!item.graduation && item.targetClassId) {
          payload.target_class_id = Number(
            item.targetClassId
          );
        }

        if (bulkRemarks.trim()) {
          payload.remarks = bulkRemarks.trim();
        }

        const { data } = await api.post(
          ENDPOINTS.promote,
          payload
        );

        if (data?.action === "GRADUATED" || item.graduation) {
          graduated += 1;
        } else {
          promoted += 1;
        }
      } catch (err) {
        failed.push(
          `${item.name}: ${
            err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "failed"
          }`
        );
      }
    }

    const skipped = bulkItems.length - promotableItems.length;

    const parts = [];
    if (promoted) parts.push(`${promoted} promoted`);
    if (graduated) parts.push(`${graduated} graduated`);
    if (skipped) parts.push(`${skipped} skipped`);
    if (failed.length) parts.push(`${failed.length} failed`);

    setBulkPromoting(false);
    setShowBulkModal(false);
    setBulkItems([]);
    setBulkRemarks("");

    await loadEnrollments();

    if (parts.length) {
      setSuccess(
        `Bulk promotion complete: ${parts.join(", ")}.`
      );
    }

    if (failed.length) {
      setError(failed.join(" | "));
    }
  };

  // ============================================================
  // OPEN PROMOTION CHECK
  // ============================================================

  const checkEligibility = async (enrollment) => {
    const studentId =
      enrollment.student ||
      enrollment.student_id;

    if (!studentId) {
      setError(
        "This enrollment does not contain a student ID."
      );
      return;
    }

    try {
      setEligibilityLoading(true);
      setError("");
      setSuccess("");

      setSelectedStudent(enrollment);

      const response = await api.get(
        ENDPOINTS.promotionEligibility(studentId)
      );

      const data = response.data;

      setPromotionData(data);

      setSelectedTargetClass("");

      setRemarks("");

      setShowPromotionModal(true);
    } catch (err) {
      console.error(
        "Failed to check promotion eligibility:",
        err
      );

      setPromotionData(null);

      setError(
        err?.response?.data?.detail ||
          "Failed to check promotion eligibility."
      );
    } finally {
      setEligibilityLoading(false);
    }
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const closeModal = () => {
    if (promotionLoading) {
      return;
    }

    setShowPromotionModal(false);
    setSelectedStudent(null);
    setPromotionData(null);
    setSelectedTargetClass("");
    setRemarks("");
  };

  // ============================================================
  // PROMOTE / GRADUATE
  // ============================================================

  const handlePromotion = async () => {
    if (!selectedStudent || !promotionData) {
      return;
    }

    const studentId =
      selectedStudent.student ||
      selectedStudent.student_id;

    const isGraduation =
      promotionData.requires_graduation === true ||
      promotionData.action === "GRADUATED";

    const targetClasses =
      promotionData.target_classes || [];

    if (
      !isGraduation &&
      targetClasses.length > 1 &&
      !selectedTargetClass
    ) {
      setError(
        "Please select the target class."
      );
      return;
    }

    try {
      setPromotionLoading(true);
      setError("");
      setSuccess("");

      const payload = {
        student_id: studentId,
      };

      if (
        !isGraduation &&
        selectedTargetClass
      ) {
        payload.target_class_id =
          Number(selectedTargetClass);
      }

      if (remarks.trim()) {
        payload.remarks = remarks.trim();
      }

      const response = await api.post(
        ENDPOINTS.promote,
        payload
      );

      const result = response.data;

      setShowPromotionModal(false);
      setSelectedStudent(null);
      setPromotionData(null);
      setSelectedTargetClass("");
      setRemarks("");

      await loadEnrollments();

      setSuccess(
        result.detail ||
          (result.action === "GRADUATED"
            ? "Student graduated successfully."
            : "Student promoted successfully.")
      );
    } catch (err) {
      console.error(
        "Failed to promote student:",
        err
      );

      const responseData = err?.response?.data;

      setError(
        responseData?.detail ||
          responseData?.message ||
          "Failed to promote student."
      );
    } finally {
      setPromotionLoading(false);
    }
  };

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = async () => {
    setError("");
    setSuccess("");

    await Promise.all([
      loadSessions(),
      loadClasses(),
    ]);

    await loadEnrollments();
  };

  // ============================================================
  // DERIVED DATA
  // ============================================================

  const currentClassName =
    selectedStudent?.class_name ||
    getClassName(selectedStudent?.class_level);

  const targetClasses =
    promotionData?.target_classes || [];

  const isGraduation =
    promotionData?.requires_graduation === true;

  const isAlreadyPromoted =
    promotionData?.already_promoted === true;

  const canPromote =
    promotionData?.eligible === true &&
    !isAlreadyPromoted;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] p-4 md:p-6">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
              <GraduationCap size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Student Promotion
              </h1>

              <p className="mt-1 text-sm opacity-70">
                Promote students to the next academic
                session or graduate completed SS3 students.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={
            loadingSessions ||
            loadingTerms ||
            loadingClasses ||
            loadingEnrollments
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 bg-[var(--color-card)] px-4 py-2.5 text-sm font-medium shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={
              loadingEnrollments
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* ======================================================
          ALERTS
      ====================================================== */}

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <div className="flex-1">
            {error}
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="opacity-70 hover:opacity-100"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-700 dark:text-green-300">
          <CheckCircle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <div className="flex-1">
            {success}
          </div>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="opacity-70 hover:opacity-100"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="mb-6 rounded-2xl border border-black/10 bg-[var(--color-card)] p-4 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck
            size={19}
            className="text-[var(--color-primary)]"
          />

          <h2 className="font-semibold">
            Promotion Period
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* SESSION */}

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Academic Session
            </label>

            <div className="relative">
              <select
                value={selectedSession}
                onChange={(event) => {
                  setSelectedSession(
                    event.target.value
                  );
                  setSelectedTerm("");
                }}
                disabled={loadingSessions}
                className="w-full appearance-none rounded-lg border border-black/10 bg-[var(--color-background)] px-3 py-2.5 pr-10 text-sm outline-none focus:border-[var(--color-primary)]"
              >
                {loadingSessions ? (
                  <option value="">
                    Loading sessions...
                  </option>
                ) : (
                  <>
                    <option value="">
                      Select session
                    </option>

                    {sessions.map((session) => (
                      <option
                        key={getSessionId(session)}
                        value={getSessionId(session)}
                      >
                        {getSessionName(session)}
                      </option>
                    ))}
                  </>
                )}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60"
              />
            </div>
          </div>

          {/* TERM */}

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Term
            </label>

            <div className="relative">
              <select
                value={selectedTerm}
                onChange={(event) =>
                  setSelectedTerm(event.target.value)
                }
                disabled={
                  loadingTerms ||
                  !selectedSession
                }
                className="w-full appearance-none rounded-lg border border-black/10 bg-[var(--color-background)] px-3 py-2.5 pr-10 text-sm outline-none focus:border-[var(--color-primary)]"
              >
                {loadingTerms ? (
                  <option value="">
                    Loading terms...
                  </option>
                ) : (
                  <>
                    <option value="">
                      Select term
                    </option>

                    {terms.map((term) => (
                      <option
                        key={getTermId(term)}
                        value={getTermId(term)}
                      >
                        {getTermName(term)}
                      </option>
                    ))}
                  </>
                )}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60"
              />
            </div>
          </div>

          {/* CLASS */}

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Current Class
            </label>

            <div className="relative">
              <select
                value={selectedClass}
                onChange={(event) =>
                  setSelectedClass(event.target.value)
                }
                disabled={loadingClasses}
                className="w-full appearance-none rounded-lg border border-black/10 bg-[var(--color-background)] px-3 py-2.5 pr-10 text-sm outline-none focus:border-[var(--color-primary)]"
              >
                <option value="">
                  All classes
                </option>

                {classes.map((classLevel) => (
                  <option
                    key={classLevel.id}
                    value={classLevel.id}
                  >
                    {getClassName(classLevel)}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60"
              />
            </div>
          </div>
        </div>

        {/* SEARCH */}

        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium">
            Search Student
          </label>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by student name, admission number or class..."
              className="w-full rounded-lg border border-black/10 bg-[var(--color-background)] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>
      </div>

      {/* ======================================================
          STUDENT LIST
      ====================================================== */}

      <div className="overflow-hidden rounded-2xl border border-black/10 bg-[var(--color-card)] shadow-sm">
        <div className="flex flex-col gap-2 border-b border-black/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">
              Students
            </h2>

            <p className="text-sm opacity-60">
              {filteredEnrollments.length} student
              {filteredEnrollments.length === 1
                ? ""
                : "s"} found
            </p>
          </div>

          {selectedTerm && (
            <div className="rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-medium text-[var(--color-primary)]">
              Promotion is processed after Third Term
            </div>
          )}
        </div>

        {/* BULK ACTION BAR */}

        {selectedIds.length > 0 && (
          <div className="flex flex-col gap-2 border-b border-black/10 bg-[var(--color-primary)]/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium">
              {selectedIds.length} selected

              {!allSelected &&
                filteredIds.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="ml-3 text-[var(--color-primary)] underline"
                  >
                    Select all {filteredIds.length}
                  </button>
                )}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="rounded-lg border border-black/10 px-3 py-2 text-xs font-medium hover:bg-black/5"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={openBulkModal}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
              >
                <GraduationCap size={15} />
                Promote Selected ({selectedIds.length})
              </button>
            </div>
          </div>
        )}

        {loadingEnrollments ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <div className="flex items-center gap-2 text-sm opacity-70">
              <Loader2
                size={20}
                className="animate-spin"
              />

              Loading students...
            </div>
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center">
            <GraduationCap
              size={42}
              className="mb-3 opacity-30"
            />

            <h3 className="font-semibold">
              No students found
            </h3>

            <p className="mt-1 max-w-md text-sm opacity-60">
              No current enrollments match the selected
              session, term, class and search criteria.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-black/10 bg-black/[0.02]">
                  <tr>
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => {
                          if (el) {
                            el.indeterminate = someSelected;
                          }
                        }}
                        onChange={toggleAll}
                        className="accent-[var(--color-primary)]"
                        aria-label="Select all students"
                      />
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Student
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Admission No.
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Current Class
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Session
                    </th>

                    <th className="px-4 py-3 font-semibold">
                      Term
                    </th>

                    <th className="px-4 py-3 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-black/10">
                  {filteredEnrollments.map(
                    (enrollment) => {
                      const studentName =
                        enrollment.student_name ||
                        getStudentName(
                          enrollment.student
                        );

                      const admissionNumber =
                        enrollment.admission_number ||
                        getAdmissionNumber(
                          enrollment.student
                        );

                      const className =
                        enrollment.class_name ||
                        getClassName(
                          enrollment.class_level
                        );

                      return (
                        <tr
                          key={enrollment.id}
                          className={`transition hover:bg-black/[0.02] ${
                            selectedIds.includes(
                              enrollment.id
                            )
                              ? "bg-[var(--color-primary)]/5"
                              : ""
                          }`}
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(
                                enrollment.id
                              )}
                              onChange={() =>
                                toggleOne(enrollment.id)
                              }
                              className="accent-[var(--color-primary)]"
                              aria-label={`Select ${studentName}`}
                            />
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                <UserCheck
                                  size={17}
                                />
                              </div>

                              <span className="font-medium">
                                {studentName}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4 opacity-75">
                            {admissionNumber}
                          </td>

                          <td className="px-4 py-4">
                            {className}
                          </td>

                          <td className="px-4 py-4 opacity-75">
                            {enrollment.session_name ||
                              getSessionName(
                                enrollment.academic_session
                              )}
                          </td>

                          <td className="px-4 py-4 opacity-75">
                            {enrollment.term_name ||
                              getTermName(
                                enrollment.term
                              )}
                          </td>

                          <td className="px-4 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                checkEligibility(
                                  enrollment
                                )
                              }
                              disabled={
                                eligibilityLoading
                              }
                              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {eligibilityLoading ? (
                                <Loader2
                                  size={15}
                                  className="animate-spin"
                                />
                              ) : (
                                <GraduationCap
                                  size={15}
                                />
                              )}

                              Promote
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}

            <div className="divide-y divide-black/10 md:hidden">
              <label className="flex items-center gap-3 bg-black/[0.02] px-4 py-3 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="accent-[var(--color-primary)]"
                />
                Select all
              </label>

              {filteredEnrollments.map(
                (enrollment) => {
                  const studentName =
                    enrollment.student_name ||
                    getStudentName(
                      enrollment.student
                    );

                  const admissionNumber =
                    enrollment.admission_number ||
                    getAdmissionNumber(
                      enrollment.student
                    );

                  const className =
                    enrollment.class_name ||
                    getClassName(
                      enrollment.class_level
                    );

                  return (
                    <div
                      key={enrollment.id}
                      className={`p-4 ${
                        selectedIds.includes(
                          enrollment.id
                        )
                          ? "bg-[var(--color-primary)]/5"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(
                            enrollment.id
                          )}
                          onChange={() =>
                            toggleOne(enrollment.id)
                          }
                          className="mt-3 accent-[var(--color-primary)]"
                          aria-label={`Select ${studentName}`}
                        />

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                          <UserCheck
                            size={18}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold">
                            {studentName}
                          </h3>

                          <p className="mt-1 text-xs opacity-60">
                            {admissionNumber}
                          </p>

                          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <p className="opacity-50">
                                Class
                              </p>

                              <p className="mt-0.5 font-medium">
                                {className}
                              </p>
                            </div>

                            <div>
                              <p className="opacity-50">
                                Term
                              </p>

                              <p className="mt-0.5 font-medium">
                                {enrollment.term_name ||
                                  getTermName(
                                    enrollment.term
                                  )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          checkEligibility(
                            enrollment
                          )
                        }
                        disabled={eligibilityLoading}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {eligibilityLoading ? (
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <GraduationCap
                            size={17}
                          />
                        )}

                        Check Promotion
                      </button>
                    </div>
                  );
                }
              )}
            </div>
          </>
        )}
      </div>

      {/* ======================================================
          PROMOTION MODAL
      ====================================================== */}

      {showPromotionModal &&
        promotionData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-[var(--color-card)] shadow-2xl">
              {/* MODAL HEADER */}

              <div className="flex items-start justify-between border-b border-black/10 p-5">
                <div>
                  <div className="flex items-center gap-2">
                    {isGraduation ? (
                      <GraduationCap
                        size={21}
                        className="text-[var(--color-primary)]"
                      />
                    ) : (
                      <UserCheck
                        size={21}
                        className="text-[var(--color-primary)]"
                      />
                    )}

                    <h2 className="text-lg font-bold">
                      {isGraduation
                        ? "Graduate Student"
                        : "Promote Student"}
                    </h2>
                  </div>

                  <p className="mt-1 text-sm opacity-60">
                    {selectedStudent
                      ? selectedStudent.student_name ||
                        getStudentName(
                          selectedStudent.student
                        )
                      : "Student"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={promotionLoading}
                  className="rounded-lg p-2 opacity-60 transition hover:bg-black/5 hover:opacity-100 disabled:cursor-not-allowed"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="space-y-5 p-5">
                {/* DETAIL */}

                <div className="rounded-xl border border-black/10 bg-black/[0.02] p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs opacity-50">
                        Current Session
                      </p>

                      <p className="mt-1 font-medium">
                        {
                          promotionData
                            .current_enrollment
                            ?.session
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs opacity-50">
                        Current Term
                      </p>

                      <p className="mt-1 font-medium">
                        {
                          promotionData
                            .current_enrollment
                            ?.term
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs opacity-50">
                        Current Class
                      </p>

                      <p className="mt-1 font-medium">
                        {
                          promotionData
                            .current_enrollment
                            ?.class
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs opacity-50">
                        Department
                      </p>

                      <p className="mt-1 font-medium">
                        {promotionData
                          .current_enrollment
                          ?.department || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* BACKEND MESSAGE */}

                {promotionData.detail && (
                  <div
                    className={`rounded-xl border p-4 text-sm ${
                      promotionData.eligible
                        ? "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-300"
                        : "border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300"
                    }`}
                  >
                    <div className="flex gap-2">
                      {promotionData.eligible ? (
                        <CheckCircle
                          size={18}
                          className="mt-0.5 shrink-0"
                        />
                      ) : (
                        <AlertCircle
                          size={18}
                          className="mt-0.5 shrink-0"
                        />
                      )}

                      <span>
                        {promotionData.detail}
                      </span>
                    </div>
                  </div>
                )}

                {/* ALREADY PROMOTED */}

                {isAlreadyPromoted && (
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-700 dark:text-blue-300">
                    This student already has an enrollment
                    in the next academic session. No
                    further promotion is required.
                  </div>
                )}

                {/* GRADUATION */}

                {isGraduation && canPromote && (
                  <div className="rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 p-4">
                    <div className="flex items-start gap-3">
                      <GraduationCap
                        size={22}
                        className="mt-0.5 text-[var(--color-primary)]"
                      />

                      <div>
                        <h3 className="font-semibold">
                          SS3 Graduation
                        </h3>

                        <p className="mt-1 text-sm opacity-70">
                          This student has completed SS3
                          and will be graduated instead of
                          being promoted to another class.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TARGET CLASS */}

                {!isGraduation &&
                  canPromote &&
                  targetClasses.length > 0 && (
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold">
                        Target Class
                      </label>

                      {targetClasses.length === 1 ? (
                        <div className="rounded-lg border border-black/10 bg-black/[0.02] p-3 text-sm">
                          <div className="font-medium">
                            {targetClasses[0].name}
                          </div>

                          <div className="mt-1 text-xs opacity-60">
                            {targetClasses[0].department ||
                              "No department"}
                          </div>

                          <input
                            type="hidden"
                            value={
                              targetClasses[0].id
                            }
                            onChange={() =>
                              setSelectedTargetClass(
                                String(
                                  targetClasses[0].id
                                )
                              )
                            }
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {targetClasses.map(
                            (targetClass) => (
                              <label
                                key={targetClass.id}
                                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                                  String(
                                    selectedTargetClass
                                  ) ===
                                  String(
                                    targetClass.id
                                  )
                                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                                    : "border-black/10 hover:bg-black/[0.02]"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="target-class"
                                  value={
                                    targetClass.id
                                  }
                                  checked={
                                    String(
                                      selectedTargetClass
                                    ) ===
                                    String(
                                      targetClass.id
                                    )
                                  }
                                  onChange={(event) =>
                                    setSelectedTargetClass(
                                      event.target.value
                                    )
                                  }
                                  className="accent-[var(--color-primary)]"
                                />

                                <div className="flex-1">
                                  <div className="font-medium">
                                    {targetClass.name}
                                  </div>

                                  <div className="mt-0.5 text-xs opacity-60">
                                    {targetClass.department ||
                                      "No department"}
                                  </div>
                                </div>
                              </label>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  )}

                {/* REMARKS */}

                {canPromote && (
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">
                      Remarks
                      <span className="ml-1 font-normal opacity-50">
                        (Optional)
                      </span>
                    </label>

                    <textarea
                      value={remarks}
                      onChange={(event) =>
                        setRemarks(event.target.value)
                      }
                      rows={3}
                      placeholder={
                        isGraduation
                          ? "Optional graduation remarks..."
                          : "Optional promotion remarks..."
                      }
                      className="w-full resize-none rounded-lg border border-black/10 bg-[var(--color-background)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                )}
              </div>

              {/* MODAL FOOTER */}

              <div className="flex flex-col-reverse gap-3 border-t border-black/10 p-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={promotionLoading}
                  className="rounded-lg border border-black/10 px-4 py-2.5 text-sm font-medium transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                {canPromote && (
                  <button
                    type="button"
                    onClick={handlePromotion}
                    disabled={
                      promotionLoading ||
                      (!isGraduation &&
                        targetClasses.length > 1 &&
                        !selectedTargetClass)
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {promotionLoading ? (
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                    ) : isGraduation ? (
                      <GraduationCap size={17} />
                    ) : (
                      <UserCheck size={17} />
                    )}

                    {isGraduation
                      ? "Graduate Student"
                      : "Confirm Promotion"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      {/* ======================================================
          BULK PROMOTION MODAL
      ====================================================== */}

      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-[var(--color-card)] shadow-2xl">
            <div className="flex items-start justify-between border-b border-black/10 p-5">
              <div>
                <h2 className="text-lg font-bold">
                  Promote Selected Students
                </h2>

                <p className="mt-1 text-sm opacity-60">
                  {bulkChecking
                    ? "Checking eligibility..."
                    : `${promotableItems.length} of ${bulkItems.length} ready to process`}
                </p>
              </div>

              <button
                type="button"
                onClick={closeBulkModal}
                disabled={bulkPromoting}
                className="rounded-lg p-2 opacity-60 transition hover:bg-black/5 hover:opacity-100 disabled:cursor-not-allowed"
              >
                <X size={19} />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {bulkChecking ? (
                <div className="flex min-h-[160px] items-center justify-center gap-2 text-sm opacity-70">
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />
                  Checking {selectedIds.length} student
                  {selectedIds.length === 1 ? "" : "s"}...
                </div>
              ) : (
                <>
                  {bulkItems.map((item) => (
                    <div
                      key={item.enrollmentId}
                      className="rounded-xl border border-black/10 p-3 text-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium">
                            {item.name}
                          </p>

                          <p className="text-xs opacity-60">
                            {item.className}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                            item.status === "ready"
                              ? "bg-green-500/10 text-green-700 dark:text-green-300"
                              : item.status === "already"
                              ? "bg-blue-500/10 text-blue-700 dark:text-blue-300"
                              : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300"
                          }`}
                        >
                          {item.status === "ready"
                            ? item.graduation
                              ? "Graduate"
                              : "Ready"
                            : item.status === "already"
                            ? "Already promoted"
                            : "Skipped"}
                        </span>
                      </div>

                      {item.status !== "ready" &&
                        item.detail && (
                          <p className="mt-2 text-xs opacity-70">
                            {item.detail}
                          </p>
                        )}

                      {item.status === "ready" &&
                        !item.graduation &&
                        item.targets.length === 1 && (
                          <p className="mt-2 text-xs opacity-70">
                            To: {item.targets[0].name}
                            {item.targets[0].department
                              ? ` (${item.targets[0].department})`
                              : ""}
                          </p>
                        )}

                      {item.status === "ready" &&
                        !item.graduation &&
                        item.targets.length > 1 && (
                          <select
                            value={item.targetClassId}
                            onChange={(event) =>
                              setBulkTarget(
                                item.enrollmentId,
                                event.target.value
                              )
                            }
                            className="mt-2 w-full rounded-lg border border-black/10 bg-[var(--color-background)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
                          >
                            <option value="">
                              Select target class
                            </option>

                            {item.targets.map((target) => (
                              <option
                                key={target.id}
                                value={target.id}
                              >
                                {target.name}
                                {target.department
                                  ? ` (${target.department})`
                                  : ""}
                              </option>
                            ))}
                          </select>
                        )}
                    </div>
                  ))}

                  {needsClassCount > 0 && (
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      {needsClassCount} student
                      {needsClassCount === 1 ? "" : "s"} still
                      need a target class and will be skipped
                      unless you choose one.
                    </p>
                  )}

                  {promotableItems.length > 0 && (
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold">
                        Remarks
                        <span className="ml-1 font-normal opacity-50">
                          (Optional, applied to all)
                        </span>
                      </label>

                      <textarea
                        value={bulkRemarks}
                        onChange={(event) =>
                          setBulkRemarks(event.target.value)
                        }
                        rows={2}
                        className="w-full resize-none rounded-lg border border-black/10 bg-[var(--color-background)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-black/10 p-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeBulkModal}
                disabled={bulkPromoting}
                className="rounded-lg border border-black/10 px-4 py-2.5 text-sm font-medium transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleBulkPromotion}
                disabled={
                  bulkChecking ||
                  bulkPromoting ||
                  promotableItems.length === 0
                }
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bulkPromoting ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <UserCheck size={17} />
                )}

                Confirm ({promotableItems.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Promotion;
