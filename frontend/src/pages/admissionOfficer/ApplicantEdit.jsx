// import { useEffect, useMemo, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";

// import {
//   ArrowLeft,
//   Save,
//   Loader2,
//   AlertCircle,
//   CheckCircle2,
//   User,
//   Phone,
//   GraduationCap,
//   Users,
//   FileText,
//   ImagePlus,
// } from "lucide-react";

// const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

// /*
//  * ============================================================
//  * DATE HELPERS
//  * ============================================================
//  *
//  * Django DateField expects:
//  *
//  * YYYY-MM-DD
//  *
//  * These helpers make sure dates sent from this page
//  * always use that format.
//  */

// /**
//  * Converts a Django/API date into the format required
//  * by HTML <input type="date">.
//  */
// function formatDateForInput(value) {
//   if (!value) {
//     return "";
//   }

//   return String(value).split("T")[0];
// }

// /**
//  * Converts a date into the exact format expected by
//  * Django DateField: YYYY-MM-DD.
//  */
// function formatDateForApi(value) {
//   if (!value) {
//     return "";
//   }

//   const normalized = String(value).split("T")[0];

//   /*
//    * Make sure the result really looks like:
//    * YYYY-MM-DD
//    */
//   if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
//     return "";
//   }

//   return normalized;
// }

// function ApplicantEdit() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [applicant, setApplicant] = useState(null);

//   const [sessions, setSessions] = useState([]);
//   const [terms, setTerms] = useState([]);
//   const [classes, setClasses] = useState([]);
//   const [departments, setDepartments] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [loadingOptions, setLoadingOptions] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const [form, setForm] = useState({
//     first_name: "",
//     middle_name: "",
//     last_name: "",
//     date_of_birth: "",
//     gender: "",

//     email: "",
//     phone_number: "",
//     address: "",
//     previous_school: "",

//     academic_session: "",
//     term: "",
//     class_level: "",
//     department: "",
//     admission_date: "",
//     roll_number: "",

//     blood_group: "",
//     nationality: "",
//     state_of_origin: "",
//     local_government: "",

//     guardian_name: "",
//     guardian_phone: "",
//     guardian_email: "",
//     guardian_address: "",

//     profile_image: null,
//   });

//   /*
//    * ==========================================================
//    * AUTHENTICATION
//    * ==========================================================
//    */

//   const getToken = () => {
//     return (
//       sessionStorage.getItem("access_token") ||
//       sessionStorage.getItem("accessToken")
//     );
//   };

//   const authHeaders = () => {
//     const token = getToken();

//     return {
//       ...(token
//         ? {
//             Authorization: `Bearer ${token}`,
//           }
//         : {}),
//     };
//   };

//   /*
//    * ==========================================================
//    * ERROR MESSAGE HELPER
//    * ==========================================================
//    */

//   const getErrorMessage = (data, fallback) => {
//     if (!data) {
//       return fallback;
//     }

//     if (typeof data === "string") {
//       return data;
//     }

//     if (data.detail) {
//       return data.detail;
//     }

//     if (data.message) {
//       return data.message;
//     }

//     const messages = [];

//     Object.entries(data).forEach(([key, value]) => {
//       if (Array.isArray(value)) {
//         value.forEach((item) => {
//           if (typeof item === "string") {
//             messages.push(`${key}: ${item}`);
//           }
//         });
//       } else if (typeof value === "string") {
//         messages.push(`${key}: ${value}`);
//       }
//     });

//     return messages.length
//       ? messages.join(" ")
//       : fallback;
//   };

//   /*
//    * ==========================================================
//    * FETCH APPLICANT
//    * ==========================================================
//    */

//   const fetchApplicant = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const token = getToken();

//       if (!token) {
//         throw new Error(
//           "Authentication token is missing. Please log in again."
//         );
//       }

//       const response = await fetch(
//         `${API_URL}/admissions/applicants/${id}/`,
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           getErrorMessage(
//             data,
//             "Failed to load applicant."
//           )
//         );
//       }

//       setApplicant(data);

//       setForm({
//         first_name: data.first_name || "",
//         middle_name: data.middle_name || "",
//         last_name: data.last_name || "",

//         /*
//          * Normalize date for HTML date input.
//          */
//         date_of_birth: formatDateForInput(
//           data.date_of_birth
//         ),

//         gender: data.gender || "",

//         email: data.email || "",
//         phone_number: data.phone_number || "",
//         address: data.address || "",
//         previous_school:
//           data.previous_school || "",

//         academic_session:
//           data.academic_session || "",

//         term: data.term || "",

//         class_level:
//           data.class_level || "",

//         department:
//           data.department || "",

//         /*
//          * Normalize admission date for HTML date input.
//          */
//         admission_date: formatDateForInput(
//           data.admission_date
//         ),

//         roll_number:
//           data.roll_number !== null &&
//           data.roll_number !== undefined
//             ? data.roll_number
//             : "",

//         blood_group:
//           data.blood_group || "",

//         nationality:
//           data.nationality || "",

//         state_of_origin:
//           data.state_of_origin || "",

//         local_government:
//           data.local_government || "",

//         guardian_name:
//           data.guardian_name || "",

//         guardian_phone:
//           data.guardian_phone || "",

//         guardian_email:
//           data.guardian_email || "",

//         guardian_address:
//           data.guardian_address || "",

//         profile_image: null,
//       });
//     } catch (err) {
//       console.error(
//         "Fetch applicant error:",
//         err
//       );

//       setError(
//         err.message ||
//           "Unable to load applicant."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   /*
//    * ==========================================================
//    * GENERIC OPTION FETCH
//    * ==========================================================
//    */

//   const fetchJson = async (url) => {
//     const token = getToken();

//     if (!token) {
//       throw new Error(
//         "Authentication token is missing. Please log in again."
//       );
//     }

//     const response = await fetch(url, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(
//         getErrorMessage(
//           data,
//           "Failed to load required data."
//         )
//       );
//     }

//     return data;
//   };

//   /*
//    * ==========================================================
//    * NORMALIZE PAGINATED / NON-PAGINATED RESPONSE
//    * ==========================================================
//    */

//   const normalizeResults = (data) => {
//     if (Array.isArray(data)) {
//       return data;
//     }

//     if (Array.isArray(data?.results)) {
//       return data.results;
//     }

//     return [];
//   };

//   /*
//    * ==========================================================
//    * LOAD ACADEMIC DATA
//    * ==========================================================
//    */

//   const fetchAcademicOptions = async () => {
//     try {
//       setLoadingOptions(true);
//       setError("");

//       const [
//         sessionsData,
//         classesData,
//         departmentsData,
//       ] = await Promise.all([
//         fetchJson(
//           `${API_URL}/academics/sessions/`
//         ),

//         fetchJson(
//           `${API_URL}/academics/class-levels/`
//         ),

//         fetchJson(
//           `${API_URL}/academics/departments/`
//         ),
//       ]);

//       setSessions(
//         normalizeResults(sessionsData)
//       );

//       setClasses(
//         normalizeResults(classesData)
//       );

//       setDepartments(
//         normalizeResults(departmentsData)
//       );
//     } catch (err) {
//       console.error(
//         "Academic options error:",
//         err
//       );

//       setError(
//         err.message ||
//           "Unable to load academic options."
//       );
//     } finally {
//       setLoadingOptions(false);
//     }
//   };

//   /*
//    * ==========================================================
//    * LOAD TERMS FOR SESSION
//    * ==========================================================
//    */

//   const fetchTerms = async (sessionId) => {
//     if (!sessionId) {
//       setTerms([]);
//       return;
//     }

//     try {
//       const data = await fetchJson(
//         `${API_URL}/academics/terms/?academic_session=${sessionId}`
//       );

//       setTerms(
//         normalizeResults(data)
//       );
//     } catch (err) {
//       console.error(
//         "Terms error:",
//         err
//       );

//       setTerms([]);

//       setError(
//         err.message ||
//           "Unable to load terms."
//       );
//     }
//   };

//   /*
//    * ==========================================================
//    * INITIAL LOAD
//    * ==========================================================
//    */

//   useEffect(() => {
//     fetchApplicant();
//     fetchAcademicOptions();
//   }, [id]);

//   /*
//    * ==========================================================
//    * LOAD TERMS AFTER SESSION IS KNOWN
//    * ==========================================================
//    */

//   useEffect(() => {
//     if (form.academic_session) {
//       fetchTerms(
//         form.academic_session
//       );
//     } else {
//       setTerms([]);
//     }
//   }, [form.academic_session]);

//   /*
//    * ==========================================================
//    * SELECTED SESSION
//    * ==========================================================
//    */

//   const selectedSession = useMemo(() => {
//     return sessions.find(
//       (session) =>
//         String(session.id) ===
//         String(form.academic_session)
//     );
//   }, [
//     sessions,
//     form.academic_session,
//   ]);

//   /*
//    * ==========================================================
//    * SELECTED CLASS
//    * ==========================================================
//    */

//   const selectedClass = useMemo(() => {
//     return classes.find(
//       (item) =>
//         String(item.id) ===
//         String(form.class_level)
//     );
//   }, [
//     classes,
//     form.class_level,
//   ]);

//   /*
//    * ==========================================================
//    * DETERMINE CLASS TYPE
//    * ==========================================================
//    */

//   const className = String(
//     selectedClass?.name ||
//       selectedClass?.class_name ||
//       selectedClass?.code ||
//       ""
//   )
//     .toUpperCase()
//     .trim();

//   const isSeniorSecondary =
//     /^SS\d/i.test(className) ||
//     className.includes("SS1") ||
//     className.includes("SS2") ||
//     className.includes("SS3");

//   /*
//    * ==========================================================
//    * FILTER DEPARTMENTS
//    * ==========================================================
//    */

//   const filteredDepartments = useMemo(() => {
//     if (!departments.length) {
//       return [];
//     }

//     if (!selectedClass) {
//       return departments;
//     }

//     const classDepartmentId =
//       selectedClass.department ||
//       selectedClass.department_id;

//     if (classDepartmentId) {
//       return departments.filter(
//         (department) =>
//           String(department.id) ===
//           String(classDepartmentId)
//       );
//     }

//     return departments;
//   }, [
//     departments,
//     selectedClass,
//   ]);

//   /*
//    * ==========================================================
//    * HANDLE FIELD CHANGE
//    * ==========================================================
//    */

//   const handleChange = (event) => {
//     const { name, value } =
//       event.target;

//     setError("");
//     setSuccess("");

//     /*
//      * --------------------------------------------------------
//      * ACADEMIC SESSION
//      * --------------------------------------------------------
//      */

//     if (name === "academic_session") {
//       setForm((previous) => ({
//         ...previous,
//         academic_session: value,
//         term: "",
//       }));

//       return;
//     }

//     /*
//      * --------------------------------------------------------
//      * CLASS
//      * --------------------------------------------------------
//      */

//     if (name === "class_level") {
//       const newClass = classes.find(
//         (item) =>
//           String(item.id) ===
//           String(value)
//       );

//       const newClassName = String(
//         newClass?.name ||
//           newClass?.class_name ||
//           newClass?.code ||
//           ""
//       )
//         .toUpperCase()
//         .trim();

//       const seniorSecondary =
//         /^SS\d/i.test(newClassName) ||
//         newClassName.includes("SS1") ||
//         newClassName.includes("SS2") ||
//         newClassName.includes("SS3");

//       const classDepartmentId =
//         newClass?.department ||
//         newClass?.department_id;

//       setForm((previous) => ({
//         ...previous,

//         class_level: value,

//         department: seniorSecondary
//           ? classDepartmentId
//             ? String(
//                 classDepartmentId
//               )
//             : ""
//           : "",
//       }));

//       return;
//     }

//     /*
//      * --------------------------------------------------------
//      * NORMAL FIELD
//      * --------------------------------------------------------
//      */

//     setForm((previous) => ({
//       ...previous,
//       [name]: value,
//     }));
//   };

//   /*
//    * ==========================================================
//    * PROFILE IMAGE
//    * ==========================================================
//    */

//   const handleImageChange = (event) => {
//     const file =
//       event.target.files?.[0];

//     setForm((previous) => ({
//       ...previous,
//       profile_image:
//         file || null,
//     }));

//     setError("");
//     setSuccess("");
//   };

//   /*
//    * ==========================================================
//    * VALIDATION
//    * ==========================================================
//    */

//   const validateForm = () => {
//     if (!form.first_name.trim()) {
//       return "First name is required.";
//     }

//     if (!form.last_name.trim()) {
//       return "Last name is required.";
//     }

//     if (!form.academic_session) {
//       return "Academic session is required.";
//     }

//     if (!form.class_level) {
//       return "Class is required.";
//     }

//     if (!form.term) {
//       return "Term is required.";
//     }

//     if (
//       isSeniorSecondary &&
//       !form.department
//     ) {
//       return (
//         "Department is required for Senior Secondary classes."
//       );
//     }

//     if (
//       !isSeniorSecondary &&
//       form.department
//     ) {
//       return (
//         "Department must be empty for Primary/JSS classes."
//       );
//     }

//     /*
//      * Validate admission date if supplied.
//      */
//     if (
//       form.admission_date &&
//       !formatDateForApi(
//         form.admission_date
//       )
//     ) {
//       return (
//         "Admission date must be in YYYY-MM-DD format."
//       );
//     }

//     /*
//      * Validate date of birth if supplied.
//      */
//     if (
//       form.date_of_birth &&
//       !formatDateForApi(
//         form.date_of_birth
//       )
//     ) {
//       return (
//         "Date of birth must be in YYYY-MM-DD format."
//       );
//     }

//     return null;
//   };

//   /*
//    * ==========================================================
//    * SAVE
//    * ==========================================================
//    */

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     const validationError =
//       validateForm();

//     if (validationError) {
//       setError(
//         validationError
//       );

//       window.scrollTo({
//         top: 0,
//         behavior: "smooth",
//       });

//       return;
//     }

//     try {
//       setSaving(true);
//       setError("");
//       setSuccess("");

//       const token = getToken();

//       if (!token) {
//         throw new Error(
//           "Authentication token is missing. Please log in again."
//         );
//       }

//       const formData =
//         new FormData();

//       /*
//        * ======================================================
//        * IMPORTANT
//        * ======================================================
//        *
//        * Do NOT send school.
//        *
//        * The backend keeps the applicant's existing school.
//        */

//       formData.append(
//         "first_name",
//         form.first_name.trim()
//       );

//       formData.append(
//         "middle_name",
//         form.middle_name.trim()
//       );

//       formData.append(
//         "last_name",
//         form.last_name.trim()
//       );

//       /*
//        * Always send date_of_birth as YYYY-MM-DD.
//        */
//       formData.append(
//         "date_of_birth",
//         formatDateForApi(
//           form.date_of_birth
//         )
//       );

//       formData.append(
//         "gender",
//         form.gender || ""
//       );

//       formData.append(
//         "email",
//         form.email.trim()
//       );

//       formData.append(
//         "phone_number",
//         form.phone_number.trim()
//       );

//       formData.append(
//         "address",
//         form.address.trim()
//       );

//       formData.append(
//         "previous_school",
//         form.previous_school.trim()
//       );

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

//       /*
//        * Senior Secondary:
//        * send selected department.
//        *
//        * JSS/Primary:
//        * send empty department.
//        */
//       formData.append(
//         "department",
//         isSeniorSecondary
//           ? form.department || ""
//           : ""
//       );

//       /*
//        * ======================================================
//        * IMPORTANT DATE FIX
//        * ======================================================
//        *
//        * This guarantees Django receives:
//        *
//        * 2026-10-07
//        *
//        * and NOT:
//        *
//        * 10/07/2026
//        * 2026-10-07T00:00:00.000Z
//        * Wed Oct 07 2026 ...
//        */
//       formData.append(
//         "admission_date",
//         formatDateForApi(
//           form.admission_date
//         )
//       );

//       if (
//         form.roll_number !== "" &&
//         form.roll_number !== null &&
//         form.roll_number !== undefined
//       ) {
//         formData.append(
//           "roll_number",
//           form.roll_number
//         );
//       }

//       formData.append(
//         "blood_group",
//         form.blood_group.trim()
//       );

//       formData.append(
//         "nationality",
//         form.nationality.trim()
//       );

//       formData.append(
//         "state_of_origin",
//         form.state_of_origin.trim()
//       );

//       formData.append(
//         "local_government",
//         form.local_government.trim()
//       );

//       formData.append(
//         "guardian_name",
//         form.guardian_name.trim()
//       );

//       formData.append(
//         "guardian_phone",
//         form.guardian_phone.trim()
//       );

//       formData.append(
//         "guardian_email",
//         form.guardian_email.trim()
//       );

//       formData.append(
//         "guardian_address",
//         form.guardian_address.trim()
//       );

//       /*
//        * Only replace profile image if
//        * the user selected a new one.
//        */
//       if (form.profile_image) {
//         formData.append(
//           "profile_image",
//           form.profile_image
//         );
//       }

//       const response =
//         await fetch(
//           `${API_URL}/admissions/applicants/${id}/`,
//           {
//             method: "PATCH",

//             headers: {
//               Authorization: `Bearer ${token}`,
//             },

//             /*
//              * Do NOT manually set Content-Type
//              * when using FormData.
//              */
//             body: formData,
//           }
//         );

//       const data =
//         await response.json();

//       if (!response.ok) {
//         throw new Error(
//           getErrorMessage(
//             data,
//             "Failed to update applicant."
//           )
//         );
//       }

//       /*
//        * Update applicant state.
//        *
//        * Some APIs return:
//        *
//        * { applicant: {...} }
//        *
//        * while others return:
//        *
//        * {...applicant fields...}
//        *
//        * Support both.
//        */
//       const updatedApplicant =
//         data?.applicant ||
//         data ||
//         applicant;

//       setApplicant(
//         updatedApplicant
//       );

//       /*
//        * Keep the date field normalized
//        * after the successful save.
//        */
//       setForm((previous) => ({
//         ...previous,

//         date_of_birth:
//           formatDateForInput(
//             updatedApplicant?.date_of_birth ??
//               previous.date_of_birth
//           ),

//         admission_date:
//           formatDateForInput(
//             updatedApplicant?.admission_date ??
//               previous.admission_date
//           ),

//         profile_image: null,
//       }));

//       setSuccess(
//         "Applicant application updated successfully."
//       );

//       window.scrollTo({
//         top: 0,
//         behavior: "smooth",
//       });
//     } catch (err) {
//       console.error(
//         "Update applicant error:",
//         err
//       );

//       setError(
//         err.message ||
//           "Failed to update applicant."
//       );

//       window.scrollTo({
//         top: 0,
//         behavior: "smooth",
//       });
//     } finally {
//       setSaving(false);
//     }
//   };

//   /*
//    * ==========================================================
//    * CANCEL / BACK
//    * ==========================================================
//    */

//   const handleCancel = () => {
//     navigate(
//       `/admission-officer/applicants/${id}`
//     );
//   };

//   /*
//    * ==========================================================
//    * LOADING
//    * ==========================================================
//    */

//   if (
//     loading ||
//     loadingOptions
//   ) {
//     return (
//       <div className="min-h-screen bg-[var(--color-background)] p-6">
//         <div className="mx-auto flex max-w-6xl items-center justify-center py-32">
//           <div className="flex flex-col items-center gap-4">
//             <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />

//             <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
//               Loading applicant information...
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   /*
//    * ==========================================================
//    * LOAD ERROR
//    * ==========================================================
//    */

//   if (!applicant && error) {
//     return (
//       <div className="min-h-screen bg-[var(--color-background)] p-6">
//         <div className="mx-auto max-w-4xl">
//           <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
//             <div className="flex items-start gap-3">
//               <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

//               <div>
//                 <p className="font-semibold">
//                   Unable to load applicant
//                 </p>

//                 <p className="mt-1 text-sm">
//                   {error}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <button
//             type="button"
//             onClick={handleCancel}
//             className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
//           >
//             <ArrowLeft className="h-4 w-4" />

//             Back to Applicant
//           </button>
//         </div>
//       </div>
//     );
//   }

//   /*
//    * ==========================================================
//    * MAIN PAGE
//    * ==========================================================
//    */

//   return (
//     <div className="min-h-screen bg-[var(--color-background)] px-4 py-6 sm:px-6 lg:px-8">
//       <div className="mx-auto max-w-6xl">

//         {/* ====================================================
//             HEADER
//         ===================================================== */}

//         <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <button
//               type="button"
//               onClick={handleCancel}
//               className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[var(--color-primary)] dark:text-slate-400"
//             >
//               <ArrowLeft className="h-4 w-4" />

//               Back to Applicant Details
//             </button>

//             <h1 className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
//               Edit Application
//             </h1>

//             <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//               Update the application details for{" "}
//               <span className="font-semibold text-slate-700 dark:text-slate-200">
//                 {applicant?.full_name ||
//                   `${applicant?.first_name || ""} ${
//                     applicant?.last_name || ""
//                   }`.trim()}
//               </span>
//             </p>
//           </div>

//           <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200 dark:bg-[var(--color-card)] dark:ring-slate-700">
//             <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
//               Application Number
//             </p>

//             <p className="mt-1 font-bold text-[var(--color-primary)]">
//               {applicant?.application_number ||
//                 "—"}
//             </p>
//           </div>
//         </div>

//         {/* ====================================================
//             ALERTS
//         ===================================================== */}

//         {error && (
//           <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
//             <div className="flex items-start gap-3">
//               <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

//               <div className="text-sm font-medium">
//                 {error}
//               </div>
//             </div>
//           </div>
//         )}

//         {success && (
//           <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
//             <div className="flex items-start gap-3">
//               <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

//               <div className="text-sm font-medium">
//                 {success}
//               </div>
//             </div>
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           <div className="space-y-6">

//             {/* =================================================
//                 PERSONAL INFORMATION
//             ================================================== */}

//             <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7 dark:bg-[var(--color-card)] dark:ring-slate-700">

//               <div className="mb-6 flex items-center gap-3">
//                 <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[var(--color-primary)] dark:bg-blue-500/10">
//                   <User className="h-5 w-5" />
//                 </div>

//                 <div>
//                   <h2 className="font-bold text-[var(--color-text)]">
//                     Personal Information
//                   </h2>

//                   <p className="text-sm text-slate-500 dark:text-slate-400">
//                     Student's basic personal details
//                   </p>
//                 </div>
//               </div>

//               <div className="grid gap-5 md:grid-cols-3">

//                 <Field
//                   label="First Name"
//                   name="first_name"
//                   value={form.first_name}
//                   onChange={handleChange}
//                   required
//                 />

//                 <Field
//                   label="Middle Name"
//                   name="middle_name"
//                   value={form.middle_name}
//                   onChange={handleChange}
//                 />

//                 <Field
//                   label="Last Name"
//                   name="last_name"
//                   value={form.last_name}
//                   onChange={handleChange}
//                   required
//                 />

//                 <Field
//                   label="Date of Birth"
//                   name="date_of_birth"
//                   type="date"
//                   value={form.date_of_birth}
//                   onChange={handleChange}
//                 />

//                 <SelectField
//                   label="Gender"
//                   name="gender"
//                   value={form.gender}
//                   onChange={handleChange}
//                   options={[
//                     {
//                       value: "MALE",
//                       label: "Male",
//                     },
//                     {
//                       value: "FEMALE",
//                       label: "Female",
//                     },
//                   ]}
//                 />

//               </div>
//             </section>

//             {/* =================================================
//                 CONTACT
//             ================================================== */}

//             <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7 dark:bg-[var(--color-card)] dark:ring-slate-700">

//               <div className="mb-6 flex items-center gap-3">
//                 <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400">
//                   <Phone className="h-5 w-5" />
//                 </div>

//                 <div>
//                   <h2 className="font-bold text-[var(--color-text)]">
//                     Contact Information
//                   </h2>

//                   <p className="text-sm text-slate-500 dark:text-slate-400">
//                     Contact and previous school information
//                   </p>
//                 </div>
//               </div>

//               <div className="grid gap-5 md:grid-cols-2">

//                 <Field
//                   label="Email Address"
//                   name="email"
//                   type="email"
//                   value={form.email}
//                   onChange={handleChange}
//                 />

//                 <Field
//                   label="Phone Number"
//                   name="phone_number"
//                   value={form.phone_number}
//                   onChange={handleChange}
//                 />

//                 <TextAreaField
//                   label="Address"
//                   name="address"
//                   value={form.address}
//                   onChange={handleChange}
//                   rows={3}
//                 />

//                 <TextAreaField
//                   label="Previous School"
//                   name="previous_school"
//                   value={form.previous_school}
//                   onChange={handleChange}
//                   rows={3}
//                 />

//               </div>
//             </section>

//             {/* =================================================
//                 ACADEMIC INFORMATION
//             ================================================== */}

//             <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7 dark:bg-[var(--color-card)] dark:ring-slate-700">

//               <div className="mb-6 flex items-center gap-3">
//                 <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
//                   <GraduationCap className="h-5 w-5" />
//                 </div>

//                 <div>
//                   <h2 className="font-bold text-[var(--color-text)]">
//                     Academic Information
//                   </h2>

//                   <p className="text-sm text-slate-500 dark:text-slate-400">
//                     Session, term, class and department
//                   </p>
//                 </div>
//               </div>

//               <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

//                 <SelectField
//                   label="Academic Session"
//                   name="academic_session"
//                   value={
//                     form.academic_session
//                   }
//                   onChange={handleChange}
//                   required
//                   options={sessions.map(
//                     (session) => ({
//                       value: session.id,
//                       label:
//                         session.name ||
//                         session.session_name ||
//                         session.title ||
//                         session.year ||
//                         `Session ${session.id}`,
//                     })
//                   )}
//                 />

//                 <SelectField
//                   label="Term"
//                   name="term"
//                   value={form.term}
//                   onChange={handleChange}
//                   required
//                   disabled={
//                     !form.academic_session
//                   }
//                   options={terms.map(
//                     (term) => ({
//                       value: term.id,
//                       label:
//                         term.name ||
//                         term.term_name ||
//                         term.title ||
//                         `Term ${term.id}`,
//                     })
//                   )}
//                 />

//                 <SelectField
//                   label="Class"
//                   name="class_level"
//                   value={form.class_level}
//                   onChange={handleChange}
//                   required
//                   options={classes.map(
//                     (item) => ({
//                       value: item.id,
//                       label:
//                         item.name ||
//                         item.class_name ||
//                         item.code ||
//                         `Class ${item.id}`,
//                     })
//                   )}
//                 />

//                 <SelectField
//                   label="Department"
//                   name="department"
//                   value={
//                     isSeniorSecondary
//                       ? form.department
//                       : ""
//                   }
//                   onChange={handleChange}
//                   disabled={
//                     !isSeniorSecondary
//                   }
//                   required={
//                     isSeniorSecondary
//                   }
//                   options={filteredDepartments.map(
//                     (department) => ({
//                       value: department.id,
//                       label:
//                         department.name ||
//                         department.department_name ||
//                         department.title ||
//                         `Department ${department.id}`,
//                     })
//                   )}
//                   placeholder={
//                     isSeniorSecondary
//                       ? "Select department"
//                       : "Not applicable"
//                   }
//                 />

//                 <Field
//                   label="Admission Date"
//                   name="admission_date"
//                   type="date"
//                   value={
//                     form.admission_date
//                   }
//                   onChange={handleChange}
//                 />

//                 <Field
//                   label="Roll Number"
//                   name="roll_number"
//                   type="number"
//                   min="1"
//                   value={
//                     form.roll_number
//                   }
//                   onChange={handleChange}
//                 />

//               </div>

//               <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
//                 <p className="text-sm text-slate-600 dark:text-slate-300">

//                   {isSeniorSecondary ? (
//                     <>
//                       <span className="font-semibold">
//                         Senior Secondary:
//                       </span>{" "}
//                       Department selection is
//                       required.
//                     </>
//                   ) : (
//                     <>
//                       <span className="font-semibold">
//                         Primary/JSS:
//                       </span>{" "}
//                       Department is not
//                       applicable.
//                     </>
//                   )}

//                 </p>
//               </div>
//             </section>

//             {/* =================================================
//                 STUDENT INFORMATION
//             ================================================== */}

//             <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7 dark:bg-[var(--color-card)] dark:ring-slate-700">

//               <div className="mb-6 flex items-center gap-3">
//                 <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
//                   <FileText className="h-5 w-5" />
//                 </div>

//                 <div>
//                   <h2 className="font-bold text-[var(--color-text)]">
//                     Student Information
//                   </h2>

//                   <p className="text-sm text-slate-500 dark:text-slate-400">
//                     Additional student information
//                   </p>
//                 </div>
//               </div>

//               <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

//                 <Field
//                   label="Blood Group"
//                   name="blood_group"
//                   value={
//                     form.blood_group
//                   }
//                   onChange={handleChange}
//                   placeholder="e.g. O+"
//                 />

//                 <Field
//                   label="Nationality"
//                   name="nationality"
//                   value={
//                     form.nationality
//                   }
//                   onChange={handleChange}
//                   placeholder="e.g. Nigeria"
//                 />

//                 <Field
//                   label="State of Origin"
//                   name="state_of_origin"
//                   value={
//                     form.state_of_origin
//                   }
//                   onChange={handleChange}
//                 />

//                 <Field
//                   label="Local Government"
//                   name="local_government"
//                   value={
//                     form.local_government
//                   }
//                   onChange={handleChange}
//                 />

//               </div>

//               <div className="mt-6">

//                 <label className="block">

//                   <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
//                     <ImagePlus className="h-4 w-4" />
//                     Profile Image
//                   </span>

//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={
//                       handleImageChange
//                     }
//                     className="block w-full rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 file:mr-4 file:border-0 file:bg-[var(--color-primary)] file:px-4 file:py-3 file:font-semibold file:text-white hover:file:opacity-90 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
//                   />

//                 </label>

//                 {form.profile_image && (
//                   <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
//                     Selected:{" "}
//                     {
//                       form.profile_image
//                         .name
//                     }
//                   </p>
//                 )}

//                 {applicant?.profile_image &&
//                   !form.profile_image && (
//                     <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
//                       A profile image is
//                       already saved. Choose
//                       a new image above to
//                       replace it.
//                     </p>
//                   )}

//               </div>
//             </section>

//             {/* =================================================
//                 GUARDIAN
//             ================================================== */}

//             <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7 dark:bg-[var(--color-card)] dark:ring-slate-700">

//               <div className="mb-6 flex items-center gap-3">
//                 <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
//                   <Users className="h-5 w-5" />
//                 </div>

//                 <div>
//                   <h2 className="font-bold text-[var(--color-text)]">
//                     Guardian Information
//                   </h2>

//                   <p className="text-sm text-slate-500 dark:text-slate-400">
//                     Parent or guardian contact
//                     information
//                   </p>
//                 </div>
//               </div>

//               <div className="grid gap-5 md:grid-cols-2">

//                 <Field
//                   label="Guardian Name"
//                   name="guardian_name"
//                   value={
//                     form.guardian_name
//                   }
//                   onChange={handleChange}
//                 />

//                 <Field
//                   label="Guardian Phone"
//                   name="guardian_phone"
//                   value={
//                     form.guardian_phone
//                   }
//                   onChange={handleChange}
//                 />

//                 <Field
//                   label="Guardian Email"
//                   name="guardian_email"
//                   type="email"
//                   value={
//                     form.guardian_email
//                   }
//                   onChange={handleChange}
//                 />

//                 <TextAreaField
//                   label="Guardian Address"
//                   name="guardian_address"
//                   value={
//                     form.guardian_address
//                   }
//                   onChange={handleChange}
//                   rows={3}
//                 />

//               </div>
//             </section>

//             {/* =================================================
//                 ACTIONS
//             ================================================== */}

//             <div className="sticky bottom-4 z-20 rounded-3xl bg-white/95 p-4 shadow-xl ring-1 ring-slate-200 backdrop-blur sm:p-5 dark:bg-slate-900/95 dark:ring-slate-700">

//               <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

//                 <button
//                   type="button"
//                   onClick={handleCancel}
//                   disabled={saving}
//                   className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
//                 >
//                   <ArrowLeft className="h-4 w-4" />

//                   Cancel
//                 </button>

//                 <button
//                   type="submit"
//                   disabled={saving}
//                   className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
//                 >
//                   {saving ? (
//                     <>
//                       <Loader2 className="h-4 w-4 animate-spin" />
//                       Saving...
//                     </>
//                   ) : (
//                     <>
//                       <Save className="h-4 w-4" />
//                       Save Application
//                     </>
//                   )}
//                 </button>

//               </div>
//             </div>

//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// /*
//  * ============================================================
//  * REUSABLE FORM COMPONENTS
//  * ============================================================
//  */

// function Field({
//   label,
//   name,
//   value,
//   onChange,
//   type = "text",
//   required = false,
//   disabled = false,
//   min,
//   placeholder,
// }) {
//   return (
//     <label className="block">

//       <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
//         {label}

//         {required && (
//           <span className="ml-1 text-red-500">
//             *
//           </span>
//         )}
//       </span>

//       <input
//         type={type}
//         name={name}
//         value={value ?? ""}
//         onChange={onChange}
//         required={required}
//         disabled={disabled}
//         min={min}
//         placeholder={placeholder}
//         className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800"
//       />

//     </label>
//   );
// }

// function SelectField({
//   label,
//   name,
//   value,
//   onChange,
//   options = [],
//   required = false,
//   disabled = false,
//   placeholder = "Select",
// }) {
//   return (
//     <label className="block">

//       <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
//         {label}

//         {required && (
//           <span className="ml-1 text-red-500">
//             *
//           </span>
//         )}
//       </span>

//       <select
//         name={name}
//         value={value ?? ""}
//         onChange={onChange}
//         required={required}
//         disabled={disabled}
//         className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800"
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

//     </label>
//   );
// }

// function TextAreaField({
//   label,
//   name,
//   value,
//   onChange,
//   rows = 3,
//   required = false,
// }) {
//   return (
//     <label className="block">

//       <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
//         {label}

//         {required && (
//           <span className="ml-1 text-red-500">
//             *
//           </span>
//         )}
//       </span>

//       <textarea
//         name={name}
//         value={value ?? ""}
//         onChange={onChange}
//         rows={rows}
//         required={required}
//         className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
//       />

//     </label>
//   );
// }

// export default ApplicantEdit;

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  Phone,
  GraduationCap,
  Users,
  FileText,
  ImagePlus,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

/*
 * ============================================================
 * DATE HELPERS
 * ============================================================
 *
 * Django DateField expects:
 *
 * YYYY-MM-DD
 *
 * These helpers make sure dates sent from this page
 * always use that format.
 */

/**
 * Converts a Django/API date into the format required
 * by HTML <input type="date">.
 */
function formatDateForInput(value) {
  if (!value) {
    return "";
  }

  const stringValue = String(value).trim();

  /*
   * ISO date/datetime:
   *
   * 2026-10-07
   * 2026-10-07T00:00:00
   * 2026-10-07T00:00:00.000Z
   */
  if (/^\d{4}-\d{2}-\d{2}/.test(stringValue)) {
    return stringValue.substring(0, 10);
  }

  /*
   * DD/MM/YYYY
   */
  const slashMatch = stringValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (slashMatch) {
    const [, day, month, year] = slashMatch;

    return `${year}-${month}-${day}`;
  }

  /*
   * DD-MM-YYYY
   */
  const dashMatch = stringValue.match(/^(\d{2})-(\d{2})-(\d{4})$/);

  if (dashMatch) {
    const [, day, month, year] = dashMatch;

    return `${year}-${month}-${day}`;
  }

  return "";
}

/**
 * Converts a date into the exact format expected by
 * Django DateField:
 *
 * YYYY-MM-DD
 */
function formatDateForApi(value) {
  if (!value) {
    return "";
  }

  const stringValue = String(value).trim();

  /*
   * Already correct:
   *
   * 2026-10-07
   */
  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    return stringValue;
  }

  /*
   * ISO datetime:
   *
   * 2026-10-07T00:00:00
   * 2026-10-07T00:00:00.000Z
   */
  const isoMatch = stringValue.match(/^(\d{4}-\d{2}-\d{2})T/);

  if (isoMatch) {
    return isoMatch[1];
  }

  /*
   * DD/MM/YYYY
   */
  const slashMatch = stringValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (slashMatch) {
    const [, day, month, year] = slashMatch;

    return `${year}-${month}-${day}`;
  }

  /*
   * DD-MM-YYYY
   */
  const dashMatch = stringValue.match(/^(\d{2})-(\d{2})-(\d{4})$/);

  if (dashMatch) {
    const [, day, month, year] = dashMatch;

    return `${year}-${month}-${day}`;
  }

  return "";
}

/**
 * Makes sure a generated date is a real calendar date.
 *
 * Example:
 * 2026-02-31 -> false
 * 2026-10-07 -> true
 */
function isValidApiDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function ApplicantEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [applicant, setApplicant] = useState(null);

  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classes, setClasses] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",

    email: "",
    phone_number: "",
    address: "",
    previous_school: "",

    academic_session: "",
    term: "",
    class_level: "",
    department: "",
    admission_date: "",
    roll_number: "",

    blood_group: "",
    nationality: "",
    state_of_origin: "",
    local_government: "",

    guardian_name: "",
    guardian_phone: "",
    guardian_email: "",
    guardian_address: "",

    profile_image: null,
  });

  /*
   * ==========================================================
   * AUTHENTICATION
   * ==========================================================
   */

  const getToken = () => {
    return (
      sessionStorage.getItem("access_token") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const authHeaders = () => {
    const token = getToken();

    return {
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

  /*
   * ==========================================================
   * ERROR MESSAGE HELPER
   * ==========================================================
   */

  const getErrorMessage = (data, fallback) => {
    if (!data) {
      return fallback;
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

    const messages = [];

    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (typeof item === "string") {
            messages.push(`${key}: ${item}`);
          }
        });
      } else if (typeof value === "string") {
        messages.push(`${key}: ${value}`);
      }
    });

    return messages.length ? messages.join(" ") : fallback;
  };

  /*
   * ==========================================================
   * FETCH APPLICANT
   * ==========================================================
   */

  const fetchApplicant = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token is missing. Please log in again.",
        );
      }

      const response = await fetch(`${API_URL}/admissions/applicants/${id}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Failed to load applicant."));
      }

      setApplicant(data);

      setForm({
        first_name: data.first_name || "",
        middle_name: data.middle_name || "",
        last_name: data.last_name || "",

        date_of_birth: formatDateForInput(data.date_of_birth),

        gender: data.gender || "",

        email: data.email || "",
        phone_number: data.phone_number || "",
        address: data.address || "",
        previous_school: data.previous_school || "",

        academic_session: data.academic_session || "",

        term: data.term || "",

        class_level: data.class_level || "",

        department: data.department || "",

        admission_date: formatDateForInput(data.admission_date),

        roll_number:
          data.roll_number !== null && data.roll_number !== undefined
            ? data.roll_number
            : "",

        blood_group: data.blood_group || "",

        nationality: data.nationality || "",

        state_of_origin: data.state_of_origin || "",

        local_government: data.local_government || "",

        guardian_name: data.guardian_name || "",

        guardian_phone: data.guardian_phone || "",

        guardian_email: data.guardian_email || "",

        guardian_address: data.guardian_address || "",

        profile_image: null,
      });
    } catch (err) {
      console.error("Fetch applicant error:", err);

      setError(err.message || "Unable to load applicant.");
    } finally {
      setLoading(false);
    }
  };

  /*
   * ==========================================================
   * GENERIC OPTION FETCH
   * ==========================================================
   */

  const fetchJson = async (url) => {
    const token = getToken();

    if (!token) {
      throw new Error("Authentication token is missing. Please log in again.");
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(getErrorMessage(data, "Failed to load required data."));
    }

    return data;
  };

  /*
   * ==========================================================
   * NORMALIZE PAGINATED / NON-PAGINATED RESPONSE
   * ==========================================================
   */

  const normalizeResults = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    return [];
  };

  /*
   * ==========================================================
   * LOAD ACADEMIC DATA
   * ==========================================================
   */

  const fetchAcademicOptions = async () => {
    try {
      setLoadingOptions(true);
      setError("");

      const [sessionsData, classesData, departmentsData] = await Promise.all([
        fetchJson(`${API_URL}/academics/sessions/`),

        fetchJson(`${API_URL}/academics/class-levels/`),

        fetchJson(`${API_URL}/academics/departments/`),
      ]);

      setSessions(normalizeResults(sessionsData));

      setClasses(normalizeResults(classesData));

      setDepartments(normalizeResults(departmentsData));
    } catch (err) {
      console.error("Academic options error:", err);

      setError(err.message || "Unable to load academic options.");
    } finally {
      setLoadingOptions(false);
    }
  };

  /*
   * ==========================================================
   * LOAD TERMS FOR SESSION
   * ==========================================================
   */

  const fetchTerms = async (sessionId) => {
    if (!sessionId) {
      setTerms([]);
      return;
    }

    try {
      const data = await fetchJson(
        `${API_URL}/academics/terms/?academic_session=${sessionId}`,
      );

      setTerms(normalizeResults(data));
    } catch (err) {
      console.error("Terms error:", err);

      setTerms([]);

      setError(err.message || "Unable to load terms.");
    }
  };

  /*
   * ==========================================================
   * INITIAL LOAD
   * ==========================================================
   */

  useEffect(() => {
    fetchApplicant();
    fetchAcademicOptions();
  }, [id]);

  /*
   * ==========================================================
   * LOAD TERMS AFTER SESSION IS KNOWN
   * ==========================================================
   */

  useEffect(() => {
    if (form.academic_session) {
      fetchTerms(form.academic_session);
    } else {
      setTerms([]);
    }
  }, [form.academic_session]);

  /*
   * ==========================================================
   * SELECTED SESSION
   * ==========================================================
   */

  const selectedSession = useMemo(() => {
    return sessions.find(
      (session) => String(session.id) === String(form.academic_session),
    );
  }, [sessions, form.academic_session]);

  /*
   * ==========================================================
   * SELECTED CLASS
   * ==========================================================
   */

  const selectedClass = useMemo(() => {
    return classes.find((item) => String(item.id) === String(form.class_level));
  }, [classes, form.class_level]);

  /*
   * ==========================================================
   * DETERMINE CLASS TYPE
   * ==========================================================
   */

  const className = String(
    selectedClass?.name ||
      selectedClass?.class_name ||
      selectedClass?.code ||
      "",
  )
    .toUpperCase()
    .trim();

  const isSeniorSecondary =
    /^SS\d/i.test(className) ||
    className.includes("SS1") ||
    className.includes("SS2") ||
    className.includes("SS3");

  /*
   * ==========================================================
   * FILTER DEPARTMENTS
   * ==========================================================
   */

  const filteredDepartments = useMemo(() => {
    if (!departments.length) {
      return [];
    }

    if (!selectedClass) {
      return departments;
    }

    const classDepartmentId =
      selectedClass.department || selectedClass.department_id;

    if (classDepartmentId) {
      return departments.filter(
        (department) => String(department.id) === String(classDepartmentId),
      );
    }

    return departments;
  }, [departments, selectedClass]);

  /*
   * ==========================================================
   * HANDLE FIELD CHANGE
   * ==========================================================
   */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setError("");
    setSuccess("");

    /*
     * ACADEMIC SESSION
     */

    if (name === "academic_session") {
      setForm((previous) => ({
        ...previous,
        academic_session: value,
        term: "",
      }));

      return;
    }

    /*
     * CLASS
     */

    if (name === "class_level") {
      const newClass = classes.find(
        (item) => String(item.id) === String(value),
      );

      const newClassName = String(
        newClass?.name || newClass?.class_name || newClass?.code || "",
      )
        .toUpperCase()
        .trim();

      const seniorSecondary =
        /^SS\d/i.test(newClassName) ||
        newClassName.includes("SS1") ||
        newClassName.includes("SS2") ||
        newClassName.includes("SS3");

      const classDepartmentId = newClass?.department || newClass?.department_id;

      setForm((previous) => ({
        ...previous,

        class_level: value,

        department: seniorSecondary
          ? classDepartmentId
            ? String(classDepartmentId)
            : ""
          : "",
      }));

      return;
    }

    /*
     * NORMAL FIELD
     */

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
   * ==========================================================
   * PROFILE IMAGE
   * ==========================================================
   */

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    setForm((previous) => ({
      ...previous,
      profile_image: file || null,
    }));

    setError("");
    setSuccess("");
  };

  /*
   * ==========================================================
   * VALIDATION
   * ==========================================================
   */

  const validateForm = () => {
    if (!form.first_name.trim()) {
      return "First name is required.";
    }

    if (!form.last_name.trim()) {
      return "Last name is required.";
    }

    if (!form.academic_session) {
      return "Academic session is required.";
    }

    if (!form.class_level) {
      return "Class is required.";
    }

    if (!form.term) {
      return "Term is required.";
    }

    if (isSeniorSecondary && !form.department) {
      return "Department is required for Senior Secondary classes.";
    }

    if (!isSeniorSecondary && form.department) {
      return "Department must be empty for Primary/JSS classes.";
    }

    /*
     * Validate admission date.
     */
    if (form.admission_date) {
      const admissionDate = formatDateForApi(form.admission_date);

      if (!admissionDate || !isValidApiDate(admissionDate)) {
        return "Admission date must be a valid date in YYYY-MM-DD format.";
      }
    }

    /*
     * Validate date of birth.
     */
    if (form.date_of_birth) {
      const dateOfBirth = formatDateForApi(form.date_of_birth);

      if (!dateOfBirth || !isValidApiDate(dateOfBirth)) {
        return "Date of birth must be a valid date in YYYY-MM-DD format.";
      }
    }

    return null;
  };

  /*
   * ==========================================================
   * SAVE
   * ==========================================================
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Authentication token is missing. Please log in again.",
        );
      }

      /*
       * ======================================================
       * CONVERT DATES BEFORE CREATING FORMDATA
       * ======================================================
       */

      const admissionDate = formatDateForApi(form.admission_date);

      const dateOfBirth = formatDateForApi(form.date_of_birth);

      /*
       * Extra safety check.
       */
      if (
        form.admission_date &&
        (!admissionDate || !isValidApiDate(admissionDate))
      ) {
        throw new Error(
          "Admission date is invalid. Please select the date again.",
        );
      }

      if (
        form.date_of_birth &&
        (!dateOfBirth || !isValidApiDate(dateOfBirth))
      ) {
        throw new Error(
          "Date of birth is invalid. Please select the date again.",
        );
      }

      /*
       * Console confirmation.
       *
       * This should show something like:
       *
       * Admission date being sent: 2026-10-07
       * Date of birth being sent: 2002-06-11
       */
      console.log("Admission date being sent:", admissionDate);

      console.log("Date of birth being sent:", dateOfBirth);

      const formData = new FormData();

      /*
       * ======================================================
       * IMPORTANT
       * ======================================================
       *
       * Do NOT send school.
       *
       * The backend keeps the applicant's
       * existing school.
       */

      formData.append("first_name", form.first_name.trim());

      formData.append("middle_name", form.middle_name.trim());

      formData.append("last_name", form.last_name.trim());

      /*
       * DATE OF BIRTH
       */
      if (dateOfBirth) {
        formData.append("date_of_birth", dateOfBirth);
      }
      formData.append("gender", form.gender || "");

      formData.append("email", form.email.trim());

      formData.append("phone_number", form.phone_number.trim());

      formData.append("address", form.address.trim());

      formData.append("previous_school", form.previous_school.trim());

      formData.append("academic_session", form.academic_session);

      formData.append("term", form.term);

      formData.append("class_level", form.class_level);

      /*
       * Senior Secondary:
       * send selected department.
       *
       * JSS/Primary:
       * send empty department.
       */
      formData.append(
        "department",
        isSeniorSecondary ? form.department || "" : "",
      );

      /*
       * ======================================================
       * ADMISSION DATE
       * ======================================================
       *
       * This is the important fix.
       *
       * Django receives exactly:
       *
       * admission_date = 2026-10-07
       *
       * Not:
       *
       * 10/07/2026
       * 2026-10-07T00:00:00.000Z
       * Wed Oct 07 2026
       */
      if (admissionDate) {
        formData.append("admission_date", admissionDate);
      }

      if (
        form.roll_number !== "" &&
        form.roll_number !== null &&
        form.roll_number !== undefined
      ) {
        formData.append("roll_number", form.roll_number);
      }

      formData.append("blood_group", form.blood_group.trim());

      formData.append("nationality", form.nationality.trim());

      formData.append("state_of_origin", form.state_of_origin.trim());

      formData.append("local_government", form.local_government.trim());

      formData.append("guardian_name", form.guardian_name.trim());

      formData.append("guardian_phone", form.guardian_phone.trim());

      formData.append("guardian_email", form.guardian_email.trim());

      formData.append("guardian_address", form.guardian_address.trim());

      /*
       * Only replace profile image if
       * the user selected a new one.
       */
      if (form.profile_image) {
        formData.append("profile_image", form.profile_image);
      }

      /*
       * ======================================================
       * DEBUG THE ACTUAL FORMDATA
       * ======================================================
       *
       * This is important because it confirms exactly
       * what the browser is sending to Django.
       */
      console.log("===== APPLICANT UPDATE FORMDATA =====");

      for (const [key, value] of formData.entries()) {
        console.log(key, value instanceof File ? value.name : value);
      }

      console.log("======================================");

      /*
       * ======================================================
       * SEND PATCH REQUEST
       * ======================================================
       */

      const response = await fetch(`${API_URL}/admissions/applicants/${id}/`, {
        method: "PATCH",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        /*
         * Do NOT manually set Content-Type
         * when using FormData.
         *
         * Browser automatically sets:
         *
         * multipart/form-data; boundary=...
         */
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Failed to update applicant."));
      }

      /*
       * Update applicant state.
       *
       * Some APIs return:
       *
       * { applicant: {...} }
       *
       * while others return:
       *
       * {...applicant fields...}
       *
       * Support both.
       */
      const updatedApplicant = data?.applicant || data || applicant;

      setApplicant(updatedApplicant);

      /*
       * Keep date fields normalized after
       * successful save.
       */
      setForm((previous) => ({
        ...previous,

        date_of_birth: formatDateForInput(
          updatedApplicant?.date_of_birth ?? previous.date_of_birth,
        ),

        admission_date: formatDateForInput(
          updatedApplicant?.admission_date ?? previous.admission_date,
        ),

        profile_image: null,
      }));

      setSuccess("Applicant application updated successfully.");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error("Update applicant error:", err);

      setError(err.message || "Failed to update applicant.");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSaving(false);
    }
  };

  /*
   * ==========================================================
   * CANCEL / BACK
   * ==========================================================
   */

  const handleCancel = () => {
    navigate(`/admission-officer/applicants/${id}`);
  };

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (loading || loadingOptions) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] p-6">
        <div className="mx-auto flex max-w-6xl items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[var(--color-primary)]" />

            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading applicant information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ==========================================================
   * LOAD ERROR
   * ==========================================================
   */

  if (!applicant && error) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

              <div>
                <p className="font-semibold">Unable to load applicant</p>

                <p className="mt-1 text-sm">{error}</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Applicant
          </button>
        </div>
      </div>
    );
  }

  /*
   * ==========================================================
   * MAIN PAGE
   * ==========================================================
   */

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={handleCancel}
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[var(--color-primary)] dark:text-slate-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Applicant Details
            </button>

            <h1 className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
              Edit Application
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Update the application details for{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {applicant?.full_name ||
                  `${applicant?.first_name || ""} ${
                    applicant?.last_name || ""
                  }`.trim()}
              </span>
            </p>
          </div>

          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200 dark:bg-[var(--color-card)] dark:ring-slate-700">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Application Number
            </p>

            <p className="mt-1 font-bold text-[var(--color-primary)]">
              {applicant?.application_number || "—"}
            </p>
          </div>
        </div>

        {/* ALERTS */}

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

              <div className="text-sm font-medium">{error}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

              <div className="text-sm font-medium">{success}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* PERSONAL INFORMATION */}

            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7 dark:bg-[var(--color-card)] dark:ring-slate-700">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[var(--color-primary)] dark:bg-blue-500/10">
                  <User className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-[var(--color-text)]">
                    Personal Information
                  </h2>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Student's basic personal details
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <Field
                  label="First Name"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  required
                />

                <Field
                  label="Middle Name"
                  name="middle_name"
                  value={form.middle_name}
                  onChange={handleChange}
                />

                <Field
                  label="Last Name"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                />

                <Field
                  label="Date of Birth"
                  name="date_of_birth"
                  type="date"
                  value={form.date_of_birth}
                  onChange={handleChange}
                />

                <SelectField
                  label="Gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  options={[
                    {
                      value: "MALE",
                      label: "Male",
                    },
                    {
                      value: "FEMALE",
                      label: "Female",
                    },
                  ]}
                />
              </div>
            </section>

            {/* CONTACT */}

            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7 dark:bg-[var(--color-card)] dark:ring-slate-700">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400">
                  <Phone className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-[var(--color-text)]">
                    Contact Information
                  </h2>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Contact and previous school information
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Email Address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                />

                <Field
                  label="Phone Number"
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handleChange}
                />

                <TextAreaField
                  label="Address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                />

                <TextAreaField
                  label="Previous School"
                  name="previous_school"
                  value={form.previous_school}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </section>

            {/* ACADEMIC INFORMATION */}

            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7 dark:bg-[var(--color-card)] dark:ring-slate-700">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <GraduationCap className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-[var(--color-text)]">
                    Academic Information
                  </h2>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Session, term, class and department
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <SelectField
                  label="Academic Session"
                  name="academic_session"
                  value={form.academic_session}
                  onChange={handleChange}
                  required
                  options={sessions.map((session) => ({
                    value: session.id,
                    label:
                      session.name ||
                      session.session_name ||
                      session.title ||
                      session.year ||
                      `Session ${session.id}`,
                  }))}
                />

                <SelectField
                  label="Term"
                  name="term"
                  value={form.term}
                  onChange={handleChange}
                  required
                  disabled={!form.academic_session}
                  options={terms.map((term) => ({
                    value: term.id,
                    label:
                      term.name ||
                      term.term_name ||
                      term.title ||
                      `Term ${term.id}`,
                  }))}
                />

                <SelectField
                  label="Class"
                  name="class_level"
                  value={form.class_level}
                  onChange={handleChange}
                  required
                  options={classes.map((item) => ({
                    value: item.id,
                    label:
                      item.name ||
                      item.class_name ||
                      item.code ||
                      `Class ${item.id}`,
                  }))}
                />

                <SelectField
                  label="Department"
                  name="department"
                  value={isSeniorSecondary ? form.department : ""}
                  onChange={handleChange}
                  disabled={!isSeniorSecondary}
                  required={isSeniorSecondary}
                  options={filteredDepartments.map((department) => ({
                    value: department.id,
                    label:
                      department.name ||
                      department.department_name ||
                      department.title ||
                      `Department ${department.id}`,
                  }))}
                  placeholder={
                    isSeniorSecondary ? "Select department" : "Not applicable"
                  }
                />

                <Field
                  label="Admission Date"
                  name="admission_date"
                  type="date"
                  value={form.admission_date}
                  onChange={handleChange}
                />

                <Field
                  label="Roll Number"
                  name="roll_number"
                  type="number"
                  min="1"
                  value={form.roll_number}
                  onChange={handleChange}
                />
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {isSeniorSecondary ? (
                    <>
                      <span className="font-semibold">Senior Secondary:</span>{" "}
                      Department selection is required.
                    </>
                  ) : (
                    <>
                      <span className="font-semibold">Primary/JSS:</span>{" "}
                      Department is not applicable.
                    </>
                  )}
                </p>
              </div>
            </section>

            {/* STUDENT INFORMATION */}

            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7 dark:bg-[var(--color-card)] dark:ring-slate-700">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <FileText className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-[var(--color-text)]">
                    Student Information
                  </h2>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Additional student information
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <Field
                  label="Blood Group"
                  name="blood_group"
                  value={form.blood_group}
                  onChange={handleChange}
                  placeholder="e.g. O+"
                />

                <Field
                  label="Nationality"
                  name="nationality"
                  value={form.nationality}
                  onChange={handleChange}
                  placeholder="e.g. Nigeria"
                />

                <Field
                  label="State of Origin"
                  name="state_of_origin"
                  value={form.state_of_origin}
                  onChange={handleChange}
                />

                <Field
                  label="Local Government"
                  name="local_government"
                  value={form.local_government}
                  onChange={handleChange}
                />
              </div>

              <div className="mt-6">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <ImagePlus className="h-4 w-4" />
                    Profile Image
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 file:mr-4 file:border-0 file:bg-[var(--color-primary)] file:px-4 file:py-3 file:font-semibold file:text-white hover:file:opacity-90 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  />
                </label>

                {form.profile_image && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Selected: {form.profile_image.name}
                  </p>
                )}

                {applicant?.profile_image && !form.profile_image && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    A profile image is already saved. Choose a new image above
                    to replace it.
                  </p>
                )}
              </div>
            </section>

            {/* GUARDIAN */}

            <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7 dark:bg-[var(--color-card)] dark:ring-slate-700">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                  <Users className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-[var(--color-text)]">
                    Guardian Information
                  </h2>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Parent or guardian contact information
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Guardian Name"
                  name="guardian_name"
                  value={form.guardian_name}
                  onChange={handleChange}
                />

                <Field
                  label="Guardian Phone"
                  name="guardian_phone"
                  value={form.guardian_phone}
                  onChange={handleChange}
                />

                <Field
                  label="Guardian Email"
                  name="guardian_email"
                  type="email"
                  value={form.guardian_email}
                  onChange={handleChange}
                />

                <TextAreaField
                  label="Guardian Address"
                  name="guardian_address"
                  value={form.guardian_address}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </section>

            {/* ACTIONS */}

            <div className="sticky bottom-4 z-20 rounded-3xl bg-white/95 p-4 shadow-xl ring-1 ring-slate-200 backdrop-blur sm:p-5 dark:bg-slate-900/95 dark:ring-slate-700">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Application
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/*
 * ============================================================
 * REUSABLE FORM COMPONENTS
 * ============================================================
 */

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  min,
  placeholder,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </span>

      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        disabled={disabled}
        min={min}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  placeholder = "Select",
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </span>

      <select
        name={name}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800"
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  rows = 3,
  required = false,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </span>

      <textarea
        name={name}
        value={value ?? ""}
        onChange={onChange}
        rows={rows}
        required={required}
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      />
    </label>
  );
}

export default ApplicantEdit;
