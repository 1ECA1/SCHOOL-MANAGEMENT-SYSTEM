// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import {
//   createStudent,
//   createEnrollment,
// } from "../../../services/studentsService";

// import {
//   getSessions,
//   getTerms,
//   getClassLevels,
//   getDepartments,
// } from "../../../services/academicsService";

// function AddStudent() {
//   const navigate = useNavigate();

//   // =====================================================
//   // FORM
//   // =====================================================

//   const initialForm = {
//     firstName: "",
//     middleName: "",
//     lastName: "",

//     classLevel: "",
//     academicSession: "",
//     term: "",
//     department: "",

//     gender: "",
//     dob: "",
//     admissionDate: "",
//     admissionNo: "",
//     roll: "",

//     email: "",
//     phone: "",
//     address: "",

//     nationality: "",
//     stateOfOrigin: "",
//     localGovernment: "",

//     bloodGroup: "",
//     medicalNotes: "",
//   };

//   const [form, setForm] = useState(initialForm);

//   // =====================================================
//   // PROFILE IMAGE
//   // =====================================================

//   const [profileImage, setProfileImage] = useState(null);
//   const [profilePreview, setProfilePreview] = useState("");

//   // =====================================================
//   // DROPDOWN DATA
//   // =====================================================

//   const [classLevels, setClassLevels] = useState([]);
//   const [sessions, setSessions] = useState([]);
//   const [terms, setTerms] = useState([]);
//   const [departments, setDepartments] = useState([]);

//   // =====================================================
//   // UI STATE
//   // =====================================================

//   const [loadingData, setLoadingData] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   // =====================================================
//   // LOGIN CREDENTIALS
//   // =====================================================

//   const [loginCredentials, setLoginCredentials] = useState(null);

//   // =====================================================
//   // LOAD DROPDOWN DATA
//   // =====================================================

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         setLoadingData(true);
//         setError("");

//         const [
//           classLevelsData,
//           sessionsData,
//           termsData,
//           departmentsData,
//         ] = await Promise.all([
//           getClassLevels(),
//           getSessions(),
//           getTerms(),
//           getDepartments(),
//         ]);

//         setClassLevels(
//           Array.isArray(classLevelsData)
//             ? classLevelsData
//             : classLevelsData?.results || [],
//         );

//         setSessions(
//           Array.isArray(sessionsData)
//             ? sessionsData
//             : sessionsData?.results || [],
//         );

//         setTerms(
//           Array.isArray(termsData)
//             ? termsData
//             : termsData?.results || [],
//         );

//         setDepartments(
//           Array.isArray(departmentsData)
//             ? departmentsData
//             : departmentsData?.results || [],
//         );
//       } catch (err) {
//         console.error(
//           "Failed to load student registration data:",
//           err,
//         );

//         setError(
//           err.response?.data?.detail ||
//             "Unable to load student registration information. Please check that the backend is running and you are logged in.",
//         );
//       } finally {
//         setLoadingData(false);
//       }
//     };

//     loadData();
//   }, []);

//   // =====================================================
//   // HANDLE INPUT
//   // =====================================================

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setForm((previous) => {
//       const updatedForm = {
//         ...previous,
//         [name]: value,
//       };

//       // -------------------------------------------------
//       // When class changes
//       // -------------------------------------------------

//       if (name === "classLevel") {
//         const changedClass = classLevels.find(
//           (classLevel) =>
//             String(classLevel.id) === String(value),
//         );

//         const changedClassIsSeniorSecondary =
//           changedClass?.name
//             ?.toUpperCase()
//             .startsWith("SS");

//         // Department is only used for Senior Secondary.
//         if (!changedClassIsSeniorSecondary) {
//           updatedForm.department = "";
//         }
//       }

//       return updatedForm;
//     });

//     if (error) {
//       setError("");
//     }

//     if (success) {
//       setSuccess("");
//     }
//   };

//   // =====================================================
//   // PROFILE IMAGE
//   // =====================================================

//   const handleProfileImageChange = (e) => {
//     const file = e.target.files?.[0];

//     if (!file) {
//       setProfileImage(null);
//       setProfilePreview("");
//       return;
//     }

//     if (!file.type.startsWith("image/")) {
//       setError("Please select a valid image file.");
//       e.target.value = "";
//       return;
//     }

//     // 5 MB limit
//     if (file.size > 5 * 1024 * 1024) {
//       setError(
//         "Profile picture must not be larger than 5MB.",
//       );
//       e.target.value = "";
//       return;
//     }

//     setError("");
//     setProfileImage(file);

//     const previewUrl = URL.createObjectURL(file);
//     setProfilePreview(previewUrl);
//   };

//   // =====================================================
//   // SELECTED CLASS
//   // =====================================================

//   const selectedClass = classLevels.find(
//     (classLevel) =>
//       String(classLevel.id) ===
//       String(form.classLevel),
//   );

//   // =====================================================
//   // SENIOR SECONDARY CHECK
//   // =====================================================

//   const isSeniorSecondary =
//     selectedClass?.name
//       ?.toUpperCase()
//       .startsWith("SS");

//   const isDepartmentRequired = isSeniorSecondary;

//   // =====================================================
//   // AVAILABLE DEPARTMENTS
//   // =====================================================
//   //
//   // The School Admin does not select a school.
//   // The backend automatically assigns the logged-in
//   // School Admin's school.
//   //
//   // We therefore use the departments returned by the
//   // departments endpoint and only display active ones.
//   //
//   // =====================================================

//   const availableDepartments = departments.filter(
//     (department) =>
//       department.is_active !== false,
//   );

//   // =====================================================
//   // RESET
//   // =====================================================

//   const resetForm = () => {
//     setForm(initialForm);
//     setProfileImage(null);
//     setProfilePreview("");
//     setError("");
//     setSuccess("");
//     setLoginCredentials(null);
//   };

//   // =====================================================
//   // FORMAT DJANGO ERROR
//   // =====================================================

//   const formatApiError = (data) => {
//     if (!data) {
//       return "Unable to save student. Please try again.";
//     }

//     if (typeof data === "string") {
//       return data;
//     }

//     if (data.detail) {
//       return data.detail;
//     }

//     if (typeof data === "object") {
//       const messages = Object.entries(data)
//         .map(([field, message]) => {
//           const text = Array.isArray(message)
//             ? message.join(", ")
//             : String(message);

//           return `${field}: ${text}`;
//         })
//         .join(" | ");

//       if (messages) {
//         return messages;
//       }
//     }

//     return "Unable to save student. Please check the information and try again.";
//   };

//   // =====================================================
//   // SUBMIT
//   // =====================================================

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setError("");
//     setSuccess("");
//     setLoginCredentials(null);

//     // ===================================================
//     // FRONTEND VALIDATION
//     // ===================================================

//     if (!form.firstName.trim()) {
//       setError("First name is required.");
//       return;
//     }

//     if (!form.lastName.trim()) {
//       setError("Last name is required.");
//       return;
//     }

//     if (!form.admissionNo.trim()) {
//       setError("Admission number is required.");
//       return;
//     }

//     if (!form.dob) {
//       setError("Date of birth is required.");
//       return;
//     }

//     if (!form.admissionDate) {
//       setError("Admission date is required.");
//       return;
//     }

//     if (!form.gender) {
//       setError("Please select a gender.");
//       return;
//     }

//     if (!form.classLevel) {
//       setError("Please select a class.");
//       return;
//     }

//     // ===================================================
//     // DEPARTMENT VALIDATION
//     // ===================================================

//     if (
//       isDepartmentRequired &&
//       !form.department
//     ) {
//       setError(
//         "Please select a department for Senior Secondary.",
//       );
//       return;
//     }

//     if (
//       !isDepartmentRequired &&
//       form.department
//     ) {
//       setError(
//         "Department is only allowed for Senior Secondary students.",
//       );
//       return;
//     }

//     if (isDepartmentRequired) {
//       const selectedDepartment =
//         availableDepartments.find(
//           (department) =>
//             String(department.id) ===
//             String(form.department),
//         );

//       if (!selectedDepartment) {
//         setError(
//           "The selected department is not available.",
//         );
//         return;
//       }
//     }

//     // ===================================================
//     // ACADEMIC SESSION
//     // ===================================================

//     if (!form.academicSession) {
//       setError(
//         "Please select an academic session.",
//       );
//       return;
//     }

//     // ===================================================
//     // TERM
//     // ===================================================

//     if (!form.term) {
//       setError("Please select a term.");
//       return;
//     }

//     try {
//       setSaving(true);

//       // =================================================
//       // STEP 1 — CREATE STUDENT
//       // =================================================

//       const studentData = new FormData();

//       // -------------------------------------------------
//       // Required student information
//       // -------------------------------------------------

//       studentData.append(
//         "admission_number",
//         form.admissionNo.trim(),
//       );

//       studentData.append(
//         "first_name",
//         form.firstName.trim(),
//       );

//       studentData.append(
//         "middle_name",
//         form.middleName.trim(),
//       );

//       studentData.append(
//         "last_name",
//         form.lastName.trim(),
//       );

//       studentData.append(
//         "date_of_birth",
//         form.dob,
//       );

//       studentData.append(
//         "gender",
//         form.gender,
//       );

//       studentData.append(
//         "admission_date",
//         form.admissionDate,
//       );

//       // -------------------------------------------------
//       // Optional student information
//       // -------------------------------------------------

//       if (form.email.trim()) {
//         studentData.append(
//           "email",
//           form.email.trim(),
//         );
//       }

//       if (form.phone.trim()) {
//         studentData.append(
//           "phone_number",
//           form.phone.trim(),
//         );
//       }

//       if (form.address.trim()) {
//         studentData.append(
//           "address",
//           form.address.trim(),
//         );
//       }

//       if (form.nationality.trim()) {
//         studentData.append(
//           "nationality",
//           form.nationality.trim(),
//         );
//       }

//       if (form.stateOfOrigin.trim()) {
//         studentData.append(
//           "state_of_origin",
//           form.stateOfOrigin.trim(),
//         );
//       }

//       if (form.localGovernment.trim()) {
//         studentData.append(
//           "local_government",
//           form.localGovernment.trim(),
//         );
//       }

//       if (form.bloodGroup) {
//         studentData.append(
//           "blood_group",
//           form.bloodGroup,
//         );
//       }

//       if (form.medicalNotes.trim()) {
//         studentData.append(
//           "medical_notes",
//           form.medicalNotes.trim(),
//         );
//       }

//       // -------------------------------------------------
//       // Department — Senior Secondary only
//       // -------------------------------------------------

//       if (
//         isDepartmentRequired &&
//         form.department
//       ) {
//         studentData.append(
//           "department",
//           Number(form.department),
//         );
//       }

//       // -------------------------------------------------
//       // Profile Picture
//       // -------------------------------------------------

//       if (profileImage) {
//         studentData.append(
//           "profile_image",
//           profileImage,
//         );
//       }

//       console.log("Creating School Admin student...");

//       const student =
//         await createStudent(studentData);

//       console.log(
//         "Student created:",
//         student,
//       );

//       // =================================================
//       // STEP 2 — CREATE ENROLLMENT
//       // =================================================

//       const enrollmentData = {
//         student: student.id,
//         academic_session: Number(
//           form.academicSession,
//         ),
//         term: Number(form.term),
//         class_level: Number(form.classLevel),
//         roll_number: form.roll
//           ? Number(form.roll)
//           : null,
//       };

//       console.log(
//         "Creating enrollment:",
//         enrollmentData,
//       );

//       await createEnrollment(
//         enrollmentData,
//       );

//       // =================================================
//       // SUCCESS
//       // =================================================

//       setSuccess(
//         `${
//           student.full_name ||
//           `${form.firstName} ${form.lastName}`
//         } has been registered successfully.`,
//       );

//       // -------------------------------------------------
//       // SAVE GENERATED LOGIN CREDENTIALS
//       // -------------------------------------------------

//       if (student.login_credentials) {
//         setLoginCredentials(
//           student.login_credentials,
//         );
//       }

//       // -------------------------------------------------
//       // Clear form
//       // -------------------------------------------------

//       setForm(initialForm);
//       setProfileImage(null);
//       setProfilePreview("");
//     } catch (err) {
//       console.error(
//         "Student registration failed:",
//         err,
//       );

//       console.error(
//         "API response:",
//         err.response?.data,
//       );

//       setError(
//         formatApiError(
//           err.response?.data,
//         ),
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   // =====================================================
//   // STYLES
//   // =====================================================

//   const inputClass =
//     "w-full rounded-lg border border-slate-200 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] dark:border-slate-700";

//   const labelClass =
//     "mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400";

//   // =====================================================
//   // RENDER
//   // =====================================================

//   return (
//     <div className="mx-auto w-full max-w-[1100px]">
//       {/* =================================================
//           HEADER
//       ================================================= */}

//       <div className="mb-6">
//         <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
//           Add Student
//         </h2>

//         <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//           Register a new student and enrollment
//           information.
//         </p>
//       </div>

//       {/* =================================================
//           LOADING
//       ================================================= */}

//       {loadingData && (
//         <div className="mb-5 rounded-lg border border-slate-200 bg-[var(--color-card)] p-4 text-sm text-slate-500 dark:border-slate-800">
//           Loading student registration information...
//         </div>
//       )}

//       {/* =================================================
//           ERROR
//       ================================================= */}

//       {error && (
//         <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
//           {error}
//         </div>
//       )}

//       {/* =================================================
//           SUCCESS
//       ================================================= */}

//       {success && (
//         <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-400">
//           {success}
//         </div>
//       )}

//       {/* =================================================
//           LOGIN CREDENTIALS
//       ================================================= */}

//       {loginCredentials && (
//         <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900/50 dark:bg-blue-950/30">
//           <div className="mb-3">
//             <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300">
//               Student Login Credentials
//             </h3>

//             <p className="mt-1 text-xs text-blue-700 dark:text-blue-400">
//               Save these credentials and provide them
//               to the student. The password is temporary.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//             <div className="rounded-lg border border-blue-200 bg-white p-3 dark:border-blue-900/50 dark:bg-slate-900">
//               <p className="text-xs text-slate-500 dark:text-slate-400">
//                 Username
//               </p>

//               <p className="mt-1 font-semibold text-[var(--color-text)]">
//                 {loginCredentials.username}
//               </p>
//             </div>

//             <div className="rounded-lg border border-blue-200 bg-white p-3 dark:border-blue-900/50 dark:bg-slate-900">
//               <p className="text-xs text-slate-500 dark:text-slate-400">
//                 Temporary Password
//               </p>

//               <p className="mt-1 font-semibold text-[var(--color-text)]">
//                 {loginCredentials.password}
//               </p>
//             </div>
//           </div>

//           <button
//             type="button"
//             onClick={() =>
//               navigate(
//                 "/school-admin/people/students",
//               )
//             }
//             className="mt-4 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
//           >
//             Continue to Students
//           </button>
//         </div>
//       )}

//       {/* =================================================
//           FORM
//       ================================================= */}

//       <form onSubmit={handleSubmit}>
//         <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-slate-800">
//           {/* =================================================
//               STUDENT INFORMATION
//           ================================================= */}

//           <h3 className="mb-4 border-b border-slate-200 pb-2 text-sm font-bold text-[var(--color-text)] dark:border-slate-800">
//             Student Information
//           </h3>

//           {/* =================================================
//               PROFILE PICTURE
//           ================================================= */}

//           <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
//             <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
//               {profilePreview ? (
//                 <img
//                   src={profilePreview}
//                   alt="Student preview"
//                   className="h-full w-full object-cover"
//                 />
//               ) : (
//                 <div className="text-center text-xs text-slate-400">
//                   <div className="mb-1 text-2xl">
//                     👤
//                   </div>
//                   No Photo
//                 </div>
//               )}
//             </div>

//             <div>
//               <label className={labelClass}>
//                 Profile Picture
//               </label>

//               <input
//                 type="file"
//                 accept="image/*"
//                 onChange={handleProfileImageChange}
//                 className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--color-primary)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
//               />

//               <p className="mt-1 text-xs text-slate-400">
//                 JPG, PNG or other image format.
//                 Maximum 5MB.
//               </p>
//             </div>
//           </div>

//           {/* =================================================
//               BASIC INFORMATION
//           ================================================= */}

//           <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//             {/* First Name */}

//             <div>
//               <label className={labelClass}>
//                 First Name *
//               </label>

//               <input
//                 name="firstName"
//                 value={form.firstName}
//                 onChange={handleChange}
//                 className={inputClass}
//                 required
//               />
//             </div>

//             {/* Middle Name */}

//             <div>
//               <label className={labelClass}>
//                 Middle Name
//               </label>

//               <input
//                 name="middleName"
//                 value={form.middleName}
//                 onChange={handleChange}
//                 className={inputClass}
//               />
//             </div>

//             {/* Last Name */}

//             <div>
//               <label className={labelClass}>
//                 Last Name *
//               </label>

//               <input
//                 name="lastName"
//                 value={form.lastName}
//                 onChange={handleChange}
//                 className={inputClass}
//                 required
//               />
//             </div>

//             {/* Admission Number */}

//             <div>
//               <label className={labelClass}>
//                 Admission Number *
//               </label>

//               <input
//                 name="admissionNo"
//                 value={form.admissionNo}
//                 onChange={handleChange}
//                 className={inputClass}
//                 required
//               />
//             </div>

//             {/* Gender */}

//             <div>
//               <label className={labelClass}>
//                 Gender *
//               </label>

//               <select
//                 name="gender"
//                 value={form.gender}
//                 onChange={handleChange}
//                 className={inputClass}
//                 required
//               >
//                 <option value="">
//                   Select Gender
//                 </option>

//                 <option value="MALE">
//                   Male
//                 </option>

//                 <option value="FEMALE">
//                   Female
//                 </option>

//                 <option value="OTHER">
//                   Other
//                 </option>
//               </select>
//             </div>

//             {/* Date of Birth */}

//             <div>
//               <label className={labelClass}>
//                 Date of Birth *
//               </label>

//               <input
//                 type="date"
//                 name="dob"
//                 value={form.dob}
//                 onChange={handleChange}
//                 className={inputClass}
//                 required
//               />
//             </div>

//             {/* Admission Date */}

//             <div>
//               <label className={labelClass}>
//                 Admission Date *
//               </label>

//               <input
//                 type="date"
//                 name="admissionDate"
//                 value={form.admissionDate}
//                 onChange={handleChange}
//                 className={inputClass}
//                 required
//               />
//             </div>

//             {/* Blood Group */}

//             <div>
//               <label className={labelClass}>
//                 Blood Group
//               </label>

//               <select
//                 name="bloodGroup"
//                 value={form.bloodGroup}
//                 onChange={handleChange}
//                 className={inputClass}
//               >
//                 <option value="">
//                   Select Blood Group
//                 </option>

//                 <option value="A+">A+</option>
//                 <option value="A-">A-</option>
//                 <option value="B+">B+</option>
//                 <option value="B-">B-</option>
//                 <option value="AB+">AB+</option>
//                 <option value="AB-">AB-</option>
//                 <option value="O+">O+</option>
//                 <option value="O-">O-</option>
//               </select>
//             </div>
//           </div>

//           {/* =================================================
//               ENROLLMENT INFORMATION
//           ================================================= */}

//           <h3 className="mb-4 border-b border-slate-200 pb-2 text-sm font-bold text-[var(--color-text)] dark:border-slate-800">
//             Enrollment Information
//           </h3>

//           <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//             {/* Academic Session */}

//             <div>
//               <label className={labelClass}>
//                 Academic Session *
//               </label>

//               <select
//                 name="academicSession"
//                 value={form.academicSession}
//                 onChange={handleChange}
//                 className={inputClass}
//                 required
//               >
//                 <option value="">
//                   Select Session
//                 </option>

//                 {sessions.map((session) => (
//                   <option
//                     key={session.id}
//                     value={session.id}
//                   >
//                     {session.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Term */}

//             <div>
//               <label className={labelClass}>
//                 Term *
//               </label>

//               <select
//                 name="term"
//                 value={form.term}
//                 onChange={handleChange}
//                 className={inputClass}
//                 required
//               >
//                 <option value="">
//                   Select Term
//                 </option>

//                 {terms.map((term) => (
//                   <option
//                     key={term.id}
//                     value={term.id}
//                   >
//                     {term.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Class */}

//             <div>
//               <label className={labelClass}>
//                 Class *
//               </label>

//               <select
//                 name="classLevel"
//                 value={form.classLevel}
//                 onChange={handleChange}
//                 className={inputClass}
//                 required
//               >
//                 <option value="">
//                   Select Class
//                 </option>

//                 {classLevels.map((classLevel) => (
//                   <option
//                     key={classLevel.id}
//                     value={classLevel.id}
//                   >
//                     {classLevel.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Department */}

//             {isDepartmentRequired && (
//               <div>
//                 <label className={labelClass}>
//                   Department *
//                 </label>

//                 <select
//                   name="department"
//                   value={form.department}
//                   onChange={handleChange}
//                   className={inputClass}
//                   required
//                 >
//                   <option value="">
//                     Select Department
//                   </option>

//                   {availableDepartments.map(
//                     (department) => (
//                       <option
//                         key={department.id}
//                         value={department.id}
//                       >
//                         {department.name}
//                       </option>
//                     ),
//                   )}
//                 </select>
//               </div>
//             )}

//             {/* Roll Number */}

//             <div>
//               <label className={labelClass}>
//                 Roll Number
//               </label>

//               <input
//                 type="number"
//                 min="1"
//                 name="roll"
//                 value={form.roll}
//                 onChange={handleChange}
//                 className={inputClass}
//               />
//             </div>
//           </div>

//           {/* =================================================
//               CONTACT INFORMATION
//           ================================================= */}

//           <h3 className="mb-4 border-b border-slate-200 pb-2 text-sm font-bold text-[var(--color-text)] dark:border-slate-800">
//             Contact Information
//           </h3>

//           <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
//             {/* Email */}

//             <div>
//               <label className={labelClass}>
//                 Email
//               </label>

//               <input
//                 type="email"
//                 name="email"
//                 value={form.email}
//                 onChange={handleChange}
//                 className={inputClass}
//               />
//             </div>

//             {/* Phone */}

//             <div>
//               <label className={labelClass}>
//                 Phone Number
//               </label>

//               <input
//                 name="phone"
//                 value={form.phone}
//                 onChange={handleChange}
//                 className={inputClass}
//               />
//             </div>

//             {/* Address */}

//             <div className="sm:col-span-2">
//               <label className={labelClass}>
//                 Address
//               </label>

//               <textarea
//                 name="address"
//                 value={form.address}
//                 onChange={handleChange}
//                 rows={3}
//                 className={inputClass}
//               />
//             </div>
//           </div>

//           {/* =================================================
//               NATIONALITY / ORIGIN
//           ================================================= */}

//           <h3 className="mb-4 border-b border-slate-200 pb-2 text-sm font-bold text-[var(--color-text)] dark:border-slate-800">
//             Nationality & Origin
//           </h3>

//           <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//             {/* Nationality */}

//             <div>
//               <label className={labelClass}>
//                 Nationality
//               </label>

//               <input
//                 name="nationality"
//                 value={form.nationality}
//                 onChange={handleChange}
//                 className={inputClass}
//                 placeholder="e.g. Nigerian"
//               />
//             </div>

//             {/* State */}

//             <div>
//               <label className={labelClass}>
//                 State of Origin
//               </label>

//               <input
//                 name="stateOfOrigin"
//                 value={form.stateOfOrigin}
//                 onChange={handleChange}
//                 className={inputClass}
//                 placeholder="e.g. Anambra"
//               />
//             </div>

//             {/* LGA */}

//             <div>
//               <label className={labelClass}>
//                 Local Government
//               </label>

//               <input
//                 name="localGovernment"
//                 value={form.localGovernment}
//                 onChange={handleChange}
//                 className={inputClass}
//                 placeholder="e.g. Awka South"
//               />
//             </div>
//           </div>

//           {/* =================================================
//               MEDICAL INFORMATION
//           ================================================= */}

//           <h3 className="mb-4 border-b border-slate-200 pb-2 text-sm font-bold text-[var(--color-text)] dark:border-slate-800">
//             Medical Information
//           </h3>

//           <div className="mb-6">
//             <label className={labelClass}>
//               Medical Notes
//             </label>

//             <textarea
//               name="medicalNotes"
//               value={form.medicalNotes}
//               onChange={handleChange}
//               rows={4}
//               className={inputClass}
//               placeholder="Enter any relevant medical information..."
//             />
//           </div>

//           {/* =================================================
//               ACTIONS
//           ================================================= */}

//           {!loginCredentials && (
//             <div className="flex gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
//               <button
//                 type="submit"
//                 disabled={
//                   saving || loadingData
//                 }
//                 className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 {saving
//                   ? "Saving Student..."
//                   : "Save Student"}
//               </button>

//               <button
//                 type="button"
//                 onClick={resetForm}
//                 disabled={saving}
//                 className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
//               >
//                 Reset
//               </button>
//             </div>
//           )}
//         </div>
//       </form>
//     </div>
//   );
// }

// export default AddStudent;


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createStudent,
  createEnrollment,
} from "../../../services/studentsService";

import {
  getSessions,
  getTerms,
  getClassLevels,
  getDepartments,
} from "../../../services/academicsService";

function AddStudent() {
  const navigate = useNavigate();

  // =====================================================
  // FORM
  // =====================================================

  const initialForm = {
    firstName: "",
    middleName: "",
    lastName: "",

    classLevel: "",
    academicSession: "",
    term: "",
    department: "",

    gender: "",
    dob: "",
    admissionDate: "",
    admissionNo: "",
    roll: "",

    email: "",
    phone: "",
    address: "",

    nationality: "",
    stateOfOrigin: "",
    localGovernment: "",

    bloodGroup: "",
    medicalNotes: "",
  };

  const [form, setForm] = useState(initialForm);

  // =====================================================
  // PROFILE IMAGE
  // =====================================================

  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");

  // =====================================================
  // DROPDOWN DATA
  // =====================================================

  const [classLevels, setClassLevels] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [terms, setTerms] = useState([]);
  const [departments, setDepartments] = useState([]);

  // =====================================================
  // UI STATE
  // =====================================================

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // LOGIN CREDENTIALS
  // =====================================================

  const [loginCredentials, setLoginCredentials] = useState(null);

  // =====================================================
  // LOAD DROPDOWN DATA
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        setError("");

        const [
          classLevelsData,
          sessionsData,
          termsData,
          departmentsData,
        ] = await Promise.all([
          getClassLevels(),
          getSessions(),
          getTerms(),
          getDepartments(),
        ]);

        setClassLevels(
          Array.isArray(classLevelsData)
            ? classLevelsData
            : classLevelsData?.results || [],
        );

        setSessions(
          Array.isArray(sessionsData)
            ? sessionsData
            : sessionsData?.results || [],
        );

        setTerms(
          Array.isArray(termsData)
            ? termsData
            : termsData?.results || [],
        );

        setDepartments(
          Array.isArray(departmentsData)
            ? departmentsData
            : departmentsData?.results || [],
        );
      } catch (err) {
        console.error(
          "Failed to load student registration data:",
          err,
        );

        setError(
          err.response?.data?.detail ||
            "Unable to load student registration information. Please check that the backend is running and you are logged in.",
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => {
      const updatedForm = {
        ...previous,
        [name]: value,
      };

      // -------------------------------------------------
      // When class changes
      // -------------------------------------------------

      if (name === "classLevel") {
        const changedClass = classLevels.find(
          (classLevel) =>
            String(classLevel.id) === String(value),
        );

        const changedClassIsSeniorSecondary =
          changedClass?.name
            ?.toUpperCase()
            .startsWith("SS");

        // Department is only used for Senior Secondary.
        if (!changedClassIsSeniorSecondary) {
          updatedForm.department = "";
        }
      }

      return updatedForm;
    });

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  // =====================================================
  // PROFILE IMAGE
  // =====================================================

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setProfileImage(null);
      setProfilePreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    // 5 MB limit
    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Profile picture must not be larger than 5MB.",
      );
      e.target.value = "";
      return;
    }

    setError("");
    setProfileImage(file);

    const previewUrl = URL.createObjectURL(file);
    setProfilePreview(previewUrl);
  };

  // =====================================================
  // SELECTED CLASS
  // =====================================================

  const selectedClass = classLevels.find(
    (classLevel) =>
      String(classLevel.id) ===
      String(form.classLevel),
  );

  // =====================================================
  // SENIOR SECONDARY CHECK
  // =====================================================

  const isSeniorSecondary =
    selectedClass?.name
      ?.toUpperCase()
      .startsWith("SS");

  const isDepartmentRequired = isSeniorSecondary;

  // =====================================================
  // AVAILABLE DEPARTMENTS
  // =====================================================

  const availableDepartments = departments.filter(
    (department) =>
      department.is_active !== false,
  );

  // =====================================================
  // RESET
  // =====================================================

  const resetForm = () => {
    setForm(initialForm);
    setProfileImage(null);
    setProfilePreview("");
    setError("");
    setSuccess("");
    setLoginCredentials(null);
  };

  // =====================================================
  // FORMAT DJANGO ERROR
  // =====================================================

  const formatApiError = (data) => {
    if (!data) {
      return "Unable to save student. Please try again.";
    }

    if (typeof data === "string") {
      return data;
    }

    if (data.detail) {
      return data.detail;
    }

    if (typeof data === "object") {
      const messages = Object.entries(data)
        .map(([field, message]) => {
          const text = Array.isArray(message)
            ? message.join(", ")
            : String(message);

          return `${field}: ${text}`;
        })
        .join(" | ");

      if (messages) {
        return messages;
      }
    }

    return "Unable to save student. Please check the information and try again.";
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoginCredentials(null);

    // ===================================================
    // FRONTEND VALIDATION
    // ===================================================

    if (!form.firstName.trim()) {
      setError("First name is required.");
      return;
    }

    if (!form.lastName.trim()) {
      setError("Last name is required.");
      return;
    }

    if (!form.admissionNo.trim()) {
      setError("Admission number is required.");
      return;
    }

    if (!form.dob) {
      setError("Date of birth is required.");
      return;
    }

    if (!form.admissionDate) {
      setError("Admission date is required.");
      return;
    }

    if (!form.gender) {
      setError("Please select a gender.");
      return;
    }

    if (!form.classLevel) {
      setError("Please select a class.");
      return;
    }

    // ===================================================
    // DEPARTMENT VALIDATION
    // ===================================================

    if (
      isDepartmentRequired &&
      !form.department
    ) {
      setError(
        "Please select a department for Senior Secondary.",
      );
      return;
    }

    if (
      !isDepartmentRequired &&
      form.department
    ) {
      setError(
        "Department is only allowed for Senior Secondary students.",
      );
      return;
    }

    if (isDepartmentRequired) {
      const selectedDepartment =
        availableDepartments.find(
          (department) =>
            String(department.id) ===
            String(form.department),
        );

      if (!selectedDepartment) {
        setError(
          "The selected department is not available.",
        );
        return;
      }
    }

    // ===================================================
    // ACADEMIC SESSION
    // ===================================================

    if (!form.academicSession) {
      setError(
        "Please select an academic session.",
      );
      return;
    }

    // ===================================================
    // TERM
    // ===================================================

    if (!form.term) {
      setError("Please select a term.");
      return;
    }

    try {
      setSaving(true);

      // =================================================
      // STEP 1 — CREATE STUDENT
      // =================================================

      const studentData = new FormData();

      // -------------------------------------------------
      // Required student information
      // -------------------------------------------------

      studentData.append(
        "admission_number",
        form.admissionNo.trim(),
      );

      studentData.append(
        "first_name",
        form.firstName.trim(),
      );

      studentData.append(
        "middle_name",
        form.middleName.trim(),
      );

      studentData.append(
        "last_name",
        form.lastName.trim(),
      );

      studentData.append(
        "date_of_birth",
        form.dob,
      );

      studentData.append(
        "gender",
        form.gender,
      );

      studentData.append(
        "admission_date",
        form.admissionDate,
      );

      // -------------------------------------------------
      // Optional student information
      // -------------------------------------------------

      if (form.email.trim()) {
        studentData.append(
          "email",
          form.email.trim(),
        );
      }

      if (form.phone.trim()) {
        studentData.append(
          "phone_number",
          form.phone.trim(),
        );
      }

      if (form.address.trim()) {
        studentData.append(
          "address",
          form.address.trim(),
        );
      }

      if (form.nationality.trim()) {
        studentData.append(
          "nationality",
          form.nationality.trim(),
        );
      }

      if (form.stateOfOrigin.trim()) {
        studentData.append(
          "state_of_origin",
          form.stateOfOrigin.trim(),
        );
      }

      if (form.localGovernment.trim()) {
        studentData.append(
          "local_government",
          form.localGovernment.trim(),
        );
      }

      // -------------------------------------------------
      // BLOOD GROUP
      // -------------------------------------------------

      if (form.bloodGroup) {
        studentData.append(
          "blood_group",
          form.bloodGroup,
        );
      }

      // -------------------------------------------------
      // MEDICAL NOTES
      // -------------------------------------------------

      if (form.medicalNotes.trim()) {
        studentData.append(
          "medical_notes",
          form.medicalNotes.trim(),
        );
      }

      // -------------------------------------------------
      // Department — Senior Secondary only
      // -------------------------------------------------

      if (
        isDepartmentRequired &&
        form.department
      ) {
        studentData.append(
          "department",
          Number(form.department),
        );
      }

      // -------------------------------------------------
      // Profile Picture
      // -------------------------------------------------

      if (profileImage) {
        studentData.append(
          "profile_image",
          profileImage,
        );
      }

      console.log(
        "Creating School Admin student...",
      );

      const student =
        await createStudent(studentData);

      console.log(
        "Student created:",
        student,
      );

      // =================================================
      // STEP 2 — CREATE ENROLLMENT
      // =================================================

      const enrollmentData = {
        student: student.id,
        academic_session: Number(
          form.academicSession,
        ),
        term: Number(form.term),
        class_level: Number(form.classLevel),
        roll_number: form.roll
          ? Number(form.roll)
          : null,
      };

      console.log(
        "Creating enrollment:",
        enrollmentData,
      );

      await createEnrollment(
        enrollmentData,
      );

      // =================================================
      // SUCCESS
      // =================================================

      setSuccess(
        `${
          student.full_name ||
          `${form.firstName} ${form.lastName}`
        } has been registered successfully.`,
      );

      // -------------------------------------------------
      // SAVE GENERATED LOGIN CREDENTIALS
      // -------------------------------------------------

      if (student.login_credentials) {
        setLoginCredentials(
          student.login_credentials,
        );
      }

      // -------------------------------------------------
      // Clear form
      // -------------------------------------------------

      setForm(initialForm);
      setProfileImage(null);
      setProfilePreview("");
    } catch (err) {
      console.error(
        "Student registration failed:",
        err,
      );

      console.error(
        "API response:",
        err.response?.data,
      );

      setError(
        formatApiError(
          err.response?.data,
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // STYLES
  // =====================================================

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-[var(--color-background)] px-3 py-2.5 text-sm text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] dark:border-slate-700";

  const labelClass =
    "mb-1.5 block text-xs font-medium text-slate-500 dark:text-slate-400";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
          Add Student
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Register a new student and enrollment
          information.
        </p>
      </div>

      {/* =================================================
          LOADING
      ================================================= */}

      {loadingData && (
        <div className="mb-5 rounded-lg border border-slate-200 bg-[var(--color-card)] p-4 text-sm text-slate-500 dark:border-slate-800">
          Loading student registration information...
        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-400">
          {success}
        </div>
      )}

      {/* =================================================
          LOGIN CREDENTIALS
      ================================================= */}

      {loginCredentials && (
        <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900/50 dark:bg-blue-950/30">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300">
              Student Login Credentials
            </h3>

            <p className="mt-1 text-xs text-blue-700 dark:text-blue-400">
              Save these credentials and provide them
              to the student. The password is temporary.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-blue-200 bg-white p-3 dark:border-blue-900/50 dark:bg-slate-900">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Username
              </p>

              <p className="mt-1 font-semibold text-[var(--color-text)]">
                {loginCredentials.username}
              </p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-white p-3 dark:border-blue-900/50 dark:bg-slate-900">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Temporary Password
              </p>

              <p className="mt-1 font-semibold text-[var(--color-text)]">
                {loginCredentials.password}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/school-admin/people/students",
              )
            }
            className="mt-4 rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Continue to Students
          </button>
        </div>
      )}

      {/* =================================================
          FORM
      ================================================= */}

      <form onSubmit={handleSubmit}>
        <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-6 shadow-sm dark:border-slate-800">
          {/* =================================================
              STUDENT INFORMATION
          ================================================= */}

          <h3 className="mb-4 border-b border-slate-200 pb-2 text-sm font-bold text-[var(--color-text)] dark:border-slate-800">
            Student Information
          </h3>

          {/* =================================================
              PROFILE PICTURE
          ================================================= */}

          <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="Student preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-center text-xs text-slate-400">
                  <div className="mb-1 text-2xl">
                    👤
                  </div>
                  No Photo
                </div>
              )}
            </div>

            <div>
              <label className={labelClass}>
                Profile Picture
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-[var(--color-primary)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90"
              />

              <p className="mt-1 text-xs text-slate-400">
                JPG, PNG or other image format.
                Maximum 5MB.
              </p>
            </div>
          </div>

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* First Name */}

            <div>
              <label className={labelClass}>
                First Name *
              </label>

              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            {/* Middle Name */}

            <div>
              <label className={labelClass}>
                Middle Name
              </label>

              <input
                name="middleName"
                value={form.middleName}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Last Name */}

            <div>
              <label className={labelClass}>
                Last Name *
              </label>

              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            {/* Admission Number */}

            <div>
              <label className={labelClass}>
                Admission Number *
              </label>

              <input
                name="admissionNo"
                value={form.admissionNo}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            {/* Gender */}

            <div>
              <label className={labelClass}>
                Gender *
              </label>

              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">
                  Select Gender
                </option>

                <option value="MALE">
                  Male
                </option>

                <option value="FEMALE">
                  Female
                </option>

                <option value="OTHER">
                  Other
                </option>
              </select>
            </div>

            {/* Date of Birth */}

            <div>
              <label className={labelClass}>
                Date of Birth *
              </label>

              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            {/* Admission Date */}

            <div>
              <label className={labelClass}>
                Admission Date *
              </label>

              <input
                type="date"
                name="admissionDate"
                value={form.admissionDate}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            {/* =================================================
                BLOOD GROUP
            ================================================= */}

            <div>
              <label className={labelClass}>
                Blood Group
              </label>

              <select
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">
                  Select Blood Group
                </option>

                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          {/* =================================================
              ENROLLMENT INFORMATION
          ================================================= */}

          <h3 className="mb-4 border-b border-slate-200 pb-2 text-sm font-bold text-[var(--color-text)] dark:border-slate-800">
            Enrollment Information
          </h3>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Academic Session */}

            <div>
              <label className={labelClass}>
                Academic Session *
              </label>

              <select
                name="academicSession"
                value={form.academicSession}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">
                  Select Session
                </option>

                {sessions.map((session) => (
                  <option
                    key={session.id}
                    value={session.id}
                  >
                    {session.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Term */}

            <div>
              <label className={labelClass}>
                Term *
              </label>

              <select
                name="term"
                value={form.term}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">
                  Select Term
                </option>

                {terms.map((term) => (
                  <option
                    key={term.id}
                    value={term.id}
                  >
                    {term.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Class */}

            <div>
              <label className={labelClass}>
                Class *
              </label>

              <select
                name="classLevel"
                value={form.classLevel}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">
                  Select Class
                </option>

                {classLevels.map((classLevel) => (
                  <option
                    key={classLevel.id}
                    value={classLevel.id}
                  >
                    {classLevel.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}

            {isDepartmentRequired && (
              <div>
                <label className={labelClass}>
                  Department *
                </label>

                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">
                    Select Department
                  </option>

                  {availableDepartments.map(
                    (department) => (
                      <option
                        key={department.id}
                        value={department.id}
                      >
                        {department.name}
                      </option>
                    ),
                  )}
                </select>
              </div>
            )}

            {/* Roll Number */}

            <div>
              <label className={labelClass}>
                Roll Number
              </label>

              <input
                type="number"
                min="1"
                name="roll"
                value={form.roll}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* =================================================
              CONTACT INFORMATION
          ================================================= */}

          <h3 className="mb-4 border-b border-slate-200 pb-2 text-sm font-bold text-[var(--color-text)] dark:border-slate-800">
            Contact Information
          </h3>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Email */}

            <div>
              <label className={labelClass}>
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Phone */}

            <div>
              <label className={labelClass}>
                Phone Number
              </label>

              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            {/* Address */}

            <div className="sm:col-span-2">
              <label className={labelClass}>
                Address
              </label>

              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                className={inputClass}
              />
            </div>
          </div>

          {/* =================================================
              NATIONALITY / ORIGIN
          ================================================= */}

          <h3 className="mb-4 border-b border-slate-200 pb-2 text-sm font-bold text-[var(--color-text)] dark:border-slate-800">
            Nationality & Origin
          </h3>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Nationality */}

            <div>
              <label className={labelClass}>
                Nationality
              </label>

              <input
                name="nationality"
                value={form.nationality}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Nigerian"
              />
            </div>

            {/* State */}

            <div>
              <label className={labelClass}>
                State of Origin
              </label>

              <input
                name="stateOfOrigin"
                value={form.stateOfOrigin}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Anambra"
              />
            </div>

            {/* LGA */}

            <div>
              <label className={labelClass}>
                Local Government
              </label>

              <input
                name="localGovernment"
                value={form.localGovernment}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Awka South"
              />
            </div>
          </div>

          {/* =================================================
              MEDICAL INFORMATION
          ================================================= */}

          <h3 className="mb-4 border-b border-slate-200 pb-2 text-sm font-bold text-[var(--color-text)] dark:border-slate-800">
            Medical Information
          </h3>

          <div className="mb-6">
            <label className={labelClass}>
              Medical Notes
            </label>

            <textarea
              name="medicalNotes"
              value={form.medicalNotes}
              onChange={handleChange}
              rows={4}
              className={inputClass}
              placeholder="Enter any relevant medical information..."
            />
          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          {!loginCredentials && (
            <div className="flex gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
              <button
                type="submit"
                disabled={
                  saving || loadingData
                }
                className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving Student..."
                  : "Save Student"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default AddStudent;