// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";

// import { getStudent, getEnrollments } from "../../../services/studentsService";

// function StudentDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [student, setStudent] = useState(null);
//   const [enrollment, setEnrollment] = useState(null);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const loadStudent = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         // Load student and enrollments together
//         const [studentData, enrollmentsData] = await Promise.all([
//           getStudent(id),
//           getEnrollments(),
//         ]);

//         setStudent(studentData);

//         const enrollmentList = Array.isArray(enrollmentsData)
//           ? enrollmentsData
//           : enrollmentsData?.results || [];

//         // Find enrollment belonging to this student
//         const studentEnrollment =
//           enrollmentList.find(
//             (item) =>
//               String(item.student) === String(id) && item.is_current === true,
//           ) ||
//           enrollmentList.find((item) => String(item.student) === String(id));

//         setEnrollment(studentEnrollment || null);
//       } catch (err) {
//         console.error("Failed to load student:", err);

//         setError(
//           err.response?.data?.detail || "Unable to load student details.",
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadStudent();
//   }, [id]);

//   // =====================================================
//   // LOADING
//   // =====================================================

//   if (loading) {
//     return (
//       <div className="w-full">
//         <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-8 text-center shadow-sm dark:border-slate-800">
//           <p className="text-sm text-slate-500 dark:text-slate-400">
//             Loading student...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // =====================================================
//   // ERROR
//   // =====================================================

//   if (error) {
//     return (
//       <div className="w-full">
//         <button
//           type="button"
//           onClick={() => navigate("/admin/students")}
//           className="mb-5 text-sm font-medium text-[var(--color-primary)] hover:underline"
//         >
//           ← Back to Students
//         </button>

//         <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
//           {error}
//         </div>
//       </div>
//     );
//   }

//   // =====================================================
//   // STUDENT NOT FOUND
//   // =====================================================

//   if (!student) {
//     return (
//       <div className="w-full">
//         <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] p-8 text-center shadow-sm dark:border-slate-800">
//           <p className="text-sm text-slate-500 dark:text-slate-400">
//             Student not found.
//           </p>

//           <button
//             type="button"
//             onClick={() => navigate("/admin/students")}
//             className="mt-4 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white"
//           >
//             Back to Students
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // =====================================================
//   // FULL NAME
//   // =====================================================

//   const fullName =
//     student.full_name ||
//     [student.first_name, student.middle_name, student.last_name]
//       .filter(Boolean)
//       .join(" ");

//   // =====================================================
//   // RENDER
//   // =====================================================

//   return (
//     <div className="w-full">
//       {/* =================================================
//           HEADER
//       ================================================= */}

//       <div className="mb-6 flex items-center justify-between">
//         <div>
//           <button
//             type="button"
//             onClick={() => navigate("/admin/students")}
//             className="mb-2 text-sm font-medium text-[var(--color-primary)] hover:underline"
//           >
//             ← Back to Students
//           </button>

//           <h1 className="text-2xl font-bold text-[var(--color-text)]">
//             Student Details
//           </h1>

//           <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//             View complete information about this student.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={() => navigate(`/admin/students/${student.id}/edit`)}
//           className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
//         >
//           Edit Student
//         </button>
//       </div>

//       {/* =================================================
//           STUDENT PROFILE
//       ================================================= */}

//       <div className="mb-6 rounded-xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-800">
//         {/* Profile Header */}

//         <div className="border-b border-slate-200 p-6 dark:border-slate-800">
//           <div className="flex items-center gap-4">
//             <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)] text-xl font-bold text-white">
//               {fullName?.charAt(0)?.toUpperCase() || "S"}
//             </div>

//             <div>
//               <h2 className="text-xl font-bold text-[var(--color-text)]">
//                 {fullName || "Unnamed Student"}
//               </h2>

//               <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//                 Admission No: {student.admission_number || "N/A"}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Student Information */}

//         <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
//           <InfoItem label="First Name" value={student.first_name} />

//           <InfoItem label="Middle Name" value={student.middle_name} />

//           <InfoItem label="Last Name" value={student.last_name} />

//           <InfoItem label="Admission Number" value={student.admission_number} />

//           <InfoItem label="Gender" value={student.gender} />

//           <InfoItem label="Date of Birth" value={student.date_of_birth} />

//           <InfoItem label="Admission Date" value={student.admission_date} />

//           <InfoItem label="Status" value={student.status || "ACTIVE"} />

//           <InfoItem label="Email" value={student.email} />

//           <InfoItem
//             label="Phone"
//             value={student.phone_number || student.phone}
//           />

//           <InfoItem label="Address" value={student.address} />

//           <InfoItem label="Created At" value={student.created_at} />

//           <InfoItem label="Updated At" value={student.updated_at} />
//         </div>
//       </div>

//       {/* =================================================
//           CURRENT ENROLLMENT
//       ================================================= */}

//       <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-800">
//         {/* Enrollment Header */}

//         <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
//           <div>
//             <h2 className="text-lg font-bold text-[var(--color-text)]">
//               Current Enrollment
//             </h2>

//             <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//               Current academic enrollment for this student.
//             </p>
//           </div>

//           {enrollment && (
//             <button
//               type="button"
//               onClick={() =>
//                 navigate(`/admin/students/enrollments/${enrollment.id}/edit`)
//               }
//               className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
//             >
//               Edit Enrollment
//             </button>
//           )}
//         </div>

//         {/* Enrollment Content */}

//         {enrollment ? (
//           <div className="p-6">
//             {/* Current Badge */}

//             <div className="mb-6">
//               <span
//                 className={`rounded-full px-3 py-1 text-xs font-semibold ${
//                   enrollment.is_current
//                     ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
//                     : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
//                 }`}
//               >
//                 {enrollment.is_current ? "CURRENT ENROLLMENT" : "INACTIVE"}
//               </span>
//             </div>

//             {/* Enrollment Information */}

//             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
//               <InfoItem
//                 label="Academic Session"
//                 value={enrollment.session_name}
//               />

//               <InfoItem label="Term" value={enrollment.term_name} />

//               <InfoItem label="Class" value={enrollment.class_name} />

//               <InfoItem label="Roll Number" value={enrollment.roll_number} />

//               <InfoItem
//                 label="Enrollment Date"
//                 value={enrollment.enrollment_date}
//               />

//               <InfoItem label="Enrollment ID" value={enrollment.id} />

//               <InfoItem label="Remarks" value={enrollment.remarks} />

//               <InfoItem label="Created At" value={enrollment.created_at} />
//             </div>
//           </div>
//         ) : (
//           /* No Enrollment */

//           <div className="p-8 text-center">
//             <p className="text-sm font-medium text-[var(--color-text)]">
//               No enrollment found.
//             </p>

//             <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//               This student does not currently have an enrollment record.
//             </p>

//             <button
//               type="button"
//               onClick={() => navigate(`/admin/students/${student.id}/enroll`)}
//               className="mt-4 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white"
//             >
//               Enroll Student
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // =====================================================
// // INFO ITEM
// // =====================================================

// function InfoItem({ label, value }) {
//   return (
//     <div>
//       <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
//         {label}
//       </p>

//       <p className="mt-1 break-words text-sm font-medium text-[var(--color-text)]">
//         {value !== null && value !== undefined && value !== "" ? value : "—"}
//       </p>
//     </div>
//   );
// }

// export default StudentDetails;

// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";

// import {
//   getStudent,
//   getStudentParents,
//   addStudentParent,
//   removeStudentParent,
// } from "../../../services/studentsService";

// function StudentDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [student, setStudent] = useState(null);
//   const [parents, setParents] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [parentsLoading, setParentsLoading] = useState(true);

//   const [error, setError] = useState("");
//   const [parentsError, setParentsError] = useState("");

//   const [showParentModal, setShowParentModal] = useState(false);
//   const [savingParent, setSavingParent] = useState(false);
//   const [removingParentId, setRemovingParentId] = useState(null);

//   const [parentForm, setParentForm] = useState({
//     full_name: "",
//     relationship: "",
//     phone_number: "",
//     email: "",
//     address: "",
//     occupation: "",
//     emergency_contact: false,
//   });

//   // =====================================================
//   // LOAD STUDENT
//   // =====================================================

//   useEffect(() => {
//     const loadStudent = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const data = await getStudent(id);

//         setStudent(data);
//       } catch (err) {
//         console.error("Failed to load student:", err);

//         setError(
//           err.response?.data?.detail || "Unable to load student details.",
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadStudent();
//   }, [id]);

//   // =====================================================
//   // LOAD PARENTS
//   // =====================================================

//   const loadParents = async () => {
//     try {
//       setParentsLoading(true);
//       setParentsError("");

//       const data = await getStudentParents(id);

//       setParents(Array.isArray(data) ? data : data?.results || []);
//     } catch (err) {
//       console.error("Failed to load student parents:", err);

//       setParentsError(
//         err.response?.data?.detail || "Unable to load parents/guardians.",
//       );
//     } finally {
//       setParentsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (id) {
//       loadParents();
//     }
//   }, [id]);

//   // =====================================================
//   // PARENT FORM
//   // =====================================================

//   const handleParentChange = (event) => {
//     const { name, value, type, checked } = event.target;

//     setParentForm((current) => ({
//       ...current,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   };

//   const resetParentForm = () => {
//     setParentForm({
//       full_name: "",
//       relationship: "",
//       phone_number: "",
//       email: "",
//       address: "",
//       occupation: "",
//       emergency_contact: false,
//     });
//   };

//   const openParentModal = () => {
//     resetParentForm();
//     setShowParentModal(true);
//   };

//   const closeParentModal = () => {
//     if (savingParent) return;

//     setShowParentModal(false);
//     resetParentForm();
//   };

//   // =====================================================
//   // ADD PARENT
//   // =====================================================

//   const handleAddParent = async (event) => {
//     event.preventDefault();

//     try {
//       setSavingParent(true);
//       setParentsError("");

//       await addStudentParent(id, parentForm);

//       await loadParents();

//       closeParentModal();
//     } catch (err) {
//       console.error("Failed to add parent:", err);

//       setParentsError(
//         err.response?.data?.detail || "Unable to add parent/guardian.",
//       );
//     } finally {
//       setSavingParent(false);
//     }
//   };

//   // =====================================================
//   // REMOVE PARENT
//   // =====================================================

//   const handleRemoveParent = async (parent) => {
//     const confirmed = window.confirm(
//       `Remove ${parent.full_name} from this student?`,
//     );

//     if (!confirmed) return;

//     try {
//       setRemovingParentId(parent.id);
//       setParentsError("");

//       await removeStudentParent(id, parent.id);

//       setParents((currentParents) =>
//         currentParents.filter((item) => item.id !== parent.id),
//       );
//     } catch (err) {
//       console.error("Failed to remove parent:", err);

//       setParentsError(
//         err.response?.data?.detail || "Unable to remove parent/guardian.",
//       );
//     } finally {
//       setRemovingParentId(null);
//     }
//   };

//   // =====================================================
//   // LOADING
//   // =====================================================

//   if (loading) {
//     return (
//       <div className="p-8 text-center text-sm text-slate-500">
//         Loading student...
//       </div>
//     );
//   }

//   // =====================================================
//   // ERROR
//   // =====================================================

//   if (error) {
//     return (
//       <div className="w-full">
//         <button
//           type="button"
//           onClick={() => navigate("/admin/students")}
//           className="mb-5 text-sm font-medium text-[var(--color-primary)] hover:underline"
//         >
//           ← Back to Students
//         </button>

//         <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
//           {error}
//         </div>
//       </div>
//     );
//   }

//   if (!student) {
//     return (
//       <div className="p-8 text-center text-sm text-slate-500">
//         Student not found.
//       </div>
//     );
//   }

//   // =====================================================
//   // FULL NAME
//   // =====================================================

//   const fullName =
//     student.full_name ||
//     [student.first_name, student.middle_name, student.last_name]
//       .filter(Boolean)
//       .join(" ");

//   return (
//     <div className="w-full">
//       {/* =================================================
//           HEADER
//       ================================================= */}

//       <div className="mb-6 flex items-center justify-between">
//         <div>
//           <button
//             type="button"
//             onClick={() => navigate("/admin/students")}
//             className="mb-2 text-sm font-medium text-[var(--color-primary)] hover:underline"
//           >
//             ← Back to Students
//           </button>

//           <h1 className="text-2xl font-bold text-[var(--color-text)]">
//             Student Details
//           </h1>

//           <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//             View complete information about this student.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={() => navigate(`/admin/students/${student.id}/edit`)}
//           className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
//         >
//           Edit Student
//         </button>
//       </div>

//       {/* =================================================
//           STUDENT PROFILE
//       ================================================= */}

//       <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-800">
//         {/* Profile Header */}

//         <div className="border-b border-slate-200 p-6 dark:border-slate-800">
//           <div className="flex items-center gap-4">
//             <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)] text-xl font-bold text-white">
//               {fullName?.charAt(0)?.toUpperCase() || "S"}
//             </div>

//             <div>
//               <h2 className="text-xl font-bold text-[var(--color-text)]">
//                 {fullName || "Unnamed Student"}
//               </h2>

//               <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//                 Admission No: {student.admission_number || "N/A"}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Information */}

//         <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
//           <InfoItem label="First Name" value={student.first_name} />

//           <InfoItem label="Middle Name" value={student.middle_name} />

//           <InfoItem label="Last Name" value={student.last_name} />

//           <InfoItem label="Admission Number" value={student.admission_number} />

//           <InfoItem label="Gender" value={student.gender} />

//           <InfoItem label="Date of Birth" value={student.date_of_birth} />

//           <InfoItem label="Status" value={student.status || "ACTIVE"} />

//           <InfoItem label="Email" value={student.email} />

//           <InfoItem label="Phone" value={student.phone_number} />

//           <InfoItem label="Address" value={student.address} />

//           <InfoItem label="Department" value={student.department} />

//           <InfoItem label="Admission Date" value={student.admission_date} />

//           <InfoItem label="Blood Group" value={student.blood_group} />

//           <InfoItem label="Nationality" value={student.nationality} />

//           <InfoItem label="State of Origin" value={student.state_of_origin} />

//           <InfoItem label="Local Government" value={student.local_government} />

//           <InfoItem label="Created At" value={student.created_at} />

//           <InfoItem label="Updated At" value={student.updated_at} />
//         </div>
//       </div>

//       {/* =================================================
//           PARENTS / GUARDIANS
//       ================================================= */}

//       <div className="mt-6 rounded-xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-800">
//         {/* Section Header */}

//         <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
//           <div>
//             <h2 className="text-lg font-bold text-[var(--color-text)]">
//               Parents / Guardians
//             </h2>

//             <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//               Manage the parents and guardians associated with this student.
//             </p>
//           </div>

//           <button
//             type="button"
//             onClick={openParentModal}
//             className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
//           >
//             + Add Parent
//           </button>
//         </div>

//         {/* Parent Error */}

//         {parentsError && (
//           <div className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
//             {parentsError}
//           </div>
//         )}

//         {/* Parents */}

//         {parentsLoading ? (
//           <div className="p-8 text-center text-sm text-slate-500">
//             Loading parents/guardians...
//           </div>
//         ) : parents.length === 0 ? (
//           <div className="p-8 text-center">
//             <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl dark:bg-slate-800">
//               👨‍👩‍👧
//             </div>

//             <p className="mt-4 text-sm font-semibold text-[var(--color-text)]">
//               No parents or guardians added
//             </p>

//             <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//               Add a parent or guardian for this student.
//             </p>

//             <button
//               type="button"
//               onClick={openParentModal}
//               className="mt-4 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white"
//             >
//               Add Parent
//             </button>
//           </div>
//         ) : (
//           <div className="divide-y divide-slate-100 dark:divide-slate-800">
//             {parents.map((parent) => (
//               <div key={parent.id} className="p-6">
//                 <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
//                   <div className="flex gap-4">
//                     {/* Avatar */}

//                     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
//                       {parent.full_name?.charAt(0)?.toUpperCase() || "P"}
//                     </div>

//                     {/* Parent Details */}

//                     <div>
//                       <h3 className="font-semibold text-[var(--color-text)]">
//                         {parent.full_name}
//                       </h3>

//                       <p className="mt-1 text-sm font-medium text-[var(--color-primary)]">
//                         {parent.relationship || "Guardian"}
//                       </p>

//                       <div className="mt-3 grid gap-x-8 gap-y-2 text-sm text-slate-600 dark:text-slate-400 md:grid-cols-2">
//                         <p>
//                           <span className="font-medium">Phone:</span>{" "}
//                           {parent.phone_number || "—"}
//                         </p>

//                         <p>
//                           <span className="font-medium">Email:</span>{" "}
//                           {parent.email || "—"}
//                         </p>

//                         <p>
//                           <span className="font-medium">Occupation:</span>{" "}
//                           {parent.occupation || "—"}
//                         </p>

//                         <p>
//                           <span className="font-medium">Emergency:</span>{" "}
//                           {parent.emergency_contact ? "Yes" : "No"}
//                         </p>

//                         <p className="md:col-span-2">
//                           <span className="font-medium">Address:</span>{" "}
//                           {parent.address || "—"}
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Actions */}

//                   <button
//                     type="button"
//                     disabled={removingParentId === parent.id}
//                     onClick={() => handleRemoveParent(parent)}
//                     className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/40 dark:hover:bg-red-950/30"
//                   >
//                     {removingParentId === parent.id ? "Removing..." : "Remove"}
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* =================================================
//           ADD PARENT MODAL
//       ================================================= */}

//       {showParentModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//           <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-[var(--color-card)] shadow-2xl">
//             {/* Modal Header */}

//             <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
//               <div>
//                 <h2 className="text-lg font-bold text-[var(--color-text)]">
//                   Add Parent / Guardian
//                 </h2>

//                 <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//                   Add a parent or guardian for {fullName}.
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 onClick={closeParentModal}
//                 disabled={savingParent}
//                 className="text-xl text-slate-400 hover:text-slate-600 disabled:opacity-50 dark:hover:text-slate-200"
//               >
//                 ×
//               </button>
//             </div>

//             {/* Form */}

//             <form onSubmit={handleAddParent} className="p-6">
//               <div className="grid gap-5 md:grid-cols-2">
//                 {/* Full Name */}

//                 <FormField
//                   label="Full Name"
//                   name="full_name"
//                   value={parentForm.full_name}
//                   onChange={handleParentChange}
//                   placeholder="Enter full name"
//                   required
//                 />

//                 {/* Relationship */}

//                 <div>
//                   <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
//                     Relationship
//                   </label>

//                   <select
//                     name="relationship"
//                     value={parentForm.relationship}
//                     onChange={handleParentChange}
//                     required
//                     className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] dark:border-slate-700"
//                   >
//                     <option value="">Select relationship</option>

//                     <option value="Father">Father</option>

//                     <option value="Mother">Mother</option>

//                     <option value="Guardian">Guardian</option>

//                     <option value="Uncle">Uncle</option>

//                     <option value="Aunt">Aunt</option>

//                     <option value="Grandfather">Grandfather</option>

//                     <option value="Grandmother">Grandmother</option>

//                     <option value="Other">Other</option>
//                   </select>
//                 </div>

//                 {/* Phone */}

//                 <FormField
//                   label="Phone Number"
//                   name="phone_number"
//                   value={parentForm.phone_number}
//                   onChange={handleParentChange}
//                   placeholder="08012345678"
//                   required
//                 />

//                 {/* Email */}

//                 <FormField
//                   label="Email"
//                   name="email"
//                   type="email"
//                   value={parentForm.email}
//                   onChange={handleParentChange}
//                   placeholder="parent@example.com"
//                 />

//                 {/* Occupation */}

//                 <FormField
//                   label="Occupation"
//                   name="occupation"
//                   value={parentForm.occupation}
//                   onChange={handleParentChange}
//                   placeholder="e.g. Teacher, Engineer"
//                 />

//                 {/* Emergency */}

//                 <div className="flex items-center">
//                   <label className="flex cursor-pointer items-center gap-3">
//                     <input
//                       type="checkbox"
//                       name="emergency_contact"
//                       checked={parentForm.emergency_contact}
//                       onChange={handleParentChange}
//                       className="h-4 w-4 rounded border-slate-300"
//                     />

//                     <span className="text-sm font-medium text-[var(--color-text)]">
//                       Emergency Contact
//                     </span>
//                   </label>
//                 </div>

//                 {/* Address */}

//                 <div className="md:col-span-2">
//                   <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
//                     Address
//                   </label>

//                   <textarea
//                     name="address"
//                     value={parentForm.address}
//                     onChange={handleParentChange}
//                     rows={3}
//                     placeholder="Enter home address"
//                     className="w-full resize-none rounded-lg border border-slate-200 bg-transparent px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] dark:border-slate-700"
//                   />
//                 </div>
//               </div>

//               {/* Buttons */}

//               <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
//                 <button
//                   type="button"
//                   onClick={closeParentModal}
//                   disabled={savingParent}
//                   className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="submit"
//                   disabled={savingParent}
//                   className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
//                 >
//                   {savingParent ? "Saving..." : "Add Parent"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// // =====================================================
// // INFO ITEM
// // =====================================================

// function InfoItem({ label, value }) {
//   return (
//     <div>
//       <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
//         {label}
//       </p>

//       <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
//         {value || "—"}
//       </p>
//     </div>
//   );
// }

// // =====================================================
// // FORM FIELD
// // =====================================================

// function FormField({
//   label,
//   name,
//   value,
//   onChange,
//   placeholder,
//   type = "text",
//   required = false,
// }) {
//   return (
//     <div>
//       <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
//         {label}
//       </label>

//       <input
//         type={type}
//         name={name}
//         value={value}
//         onChange={onChange}
//         placeholder={placeholder}
//         required={required}
//         className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] dark:border-slate-700"
//       />
//     </div>
//   );
// }

// export default StudentDetails;

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getStudent,
  getStudentParents,
  addStudentParent,
  updateParentGuardian,
  removeStudentParent,
} from "../../../services/studentsService";

function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [parents, setParents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [parentsLoading, setParentsLoading] = useState(true);

  const [error, setError] = useState("");
  const [parentsError, setParentsError] = useState("");

  const [showParentModal, setShowParentModal] = useState(false);
  const [editingParent, setEditingParent] = useState(null);
  const [savingParent, setSavingParent] = useState(false);
  const [removingParentId, setRemovingParentId] = useState(null);

  const [parentForm, setParentForm] = useState({
    full_name: "",
    relationship: "",
    phone_number: "",
    email: "",
    address: "",
    occupation: "",
    emergency_contact: false,
  });

  // =====================================================
  // LOAD STUDENT
  // =====================================================

  useEffect(() => {
    const loadStudent = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getStudent(id);

        setStudent(data);
      } catch (err) {
        console.error("Failed to load student:", err);

        setError(
          err.response?.data?.detail || "Unable to load student details.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [id]);

  // =====================================================
  // LOAD PARENTS
  // =====================================================

  const loadParents = async () => {
    try {
      setParentsLoading(true);
      setParentsError("");

      const data = await getStudentParents(id);

      setParents(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      console.error("Failed to load student parents:", err);

      setParentsError(
        err.response?.data?.detail || "Unable to load parents/guardians.",
      );
    } finally {
      setParentsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadParents();
    }
  }, [id]);

  // =====================================================
  // PARENT FORM
  // =====================================================

  const handleParentChange = (event) => {
    const { name, value, type, checked } = event.target;

    setParentForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetParentForm = () => {
    setParentForm({
      full_name: "",
      relationship: "",
      phone_number: "",
      email: "",
      address: "",
      occupation: "",
      emergency_contact: false,
    });
  };
  const openParentModal = () => {
    setEditingParent(null);
    resetParentForm();
    setShowParentModal(true);
  };

  const openEditParent = (parent) => {
    setEditingParent(parent);

    setParentForm({
      full_name: parent.full_name || "",
      relationship: parent.relationship || "",
      phone_number: parent.phone_number || "",
      email: parent.email || "",
      address: parent.address || "",
      occupation: parent.occupation || "",
      emergency_contact: parent.emergency_contact || false,
    });

    setShowParentModal(true);
  };
  const closeParentModal = () => {
    if (savingParent) return;

    setShowParentModal(false);
    setEditingParent(null);
    resetParentForm();
  };

  // =====================================================
  // ADD PARENT
  // =====================================================

  const handleSaveParent = async (event) => {
    event.preventDefault();

    try {
      setSavingParent(true);
      setParentsError("");

      if (editingParent) {
        await updateParentGuardian(editingParent.id, parentForm);
      } else {
        await addStudentParent(id, parentForm);
      }

      await loadParents();

      closeParentModal();
    } catch (err) {
      console.error("Failed to save parent:", err);

      setParentsError(
        err.response?.data?.detail || "Unable to save parent/guardian.",
      );
    } finally {
      setSavingParent(false);
    }
  };

  // =====================================================
  // REMOVE PARENT
  // =====================================================

  const handleRemoveParent = async (parent) => {
    const confirmed = window.confirm(
      `Remove ${parent.full_name} from this student?`,
    );

    if (!confirmed) return;

    try {
      setRemovingParentId(parent.id);
      setParentsError("");

      await removeStudentParent(id, parent.id);

      setParents((currentParents) =>
        currentParents.filter((item) => item.id !== parent.id),
      );
    } catch (err) {
      console.error("Failed to remove parent:", err);

      setParentsError(
        err.response?.data?.detail || "Unable to remove parent/guardian.",
      );
    } finally {
      setRemovingParentId(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Loading student...
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={() => navigate("/admin/students")}
          className="mb-5 text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          ← Back to Students
        </button>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Student not found.
      </div>
    );
  }

  // =====================================================
  // FULL NAME
  // =====================================================

  const fullName =
    student.full_name ||
    [student.first_name, student.middle_name, student.last_name]
      .filter(Boolean)
      .join(" ");

  return (
    <div className="w-full">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate("/admin/students")}
            className="mb-2 text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            ← Back to Students
          </button>

          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Student Details
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            View complete information about this student.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/admin/students/${student.id}/edit`)}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
        >
          Edit Student
        </button>
      </div>

      {/* =================================================
          STUDENT PROFILE
      ================================================= */}

      <div className="rounded-xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-800">
        {/* Profile Header */}

        <div className="border-b border-slate-200 p-6 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)] text-xl font-bold text-white">
              {fullName?.charAt(0)?.toUpperCase() || "S"}
            </div>

            <div>
              <h2 className="text-xl font-bold text-[var(--color-text)]">
                {fullName || "Unnamed Student"}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Admission No: {student.admission_number || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Information */}

        <div className="grid gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="First Name" value={student.first_name} />

          <InfoItem label="Middle Name" value={student.middle_name} />

          <InfoItem label="Last Name" value={student.last_name} />

          <InfoItem label="Admission Number" value={student.admission_number} />

          <InfoItem label="Department" value={student.department} />

          <InfoItem label="Gender" value={student.gender} />

          <InfoItem label="Date of Birth" value={student.date_of_birth} />

          <InfoItem label="Status" value={student.status || "ACTIVE"} />

          <InfoItem label="Email" value={student.email} />

          <InfoItem label="Phone" value={student.phone_number} />

          <InfoItem label="Address" value={student.address} />

          <InfoItem label="Admission Date" value={student.admission_date} />

          <InfoItem label="Blood Group" value={student.blood_group} />

          <InfoItem label="Nationality" value={student.nationality} />

          <InfoItem label="State of Origin" value={student.state_of_origin} />

          <InfoItem label="Local Government" value={student.local_government} />

          <InfoItem label="Created At" value={student.created_at} />

          <InfoItem label="Updated At" value={student.updated_at} />
        </div>
      </div>

      {/* =================================================
          PARENTS / GUARDIANS
      ================================================= */}

      <div className="mt-6 rounded-xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-800">
        {/* Section Header */}

        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              Parents / Guardians
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage the parents and guardians associated with this student.
            </p>
          </div>

          <button
            type="button"
            onClick={openParentModal}
            className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
          >
            + Add Parent
          </button>
        </div>

        {/* Parent Error */}

        {parentsError && (
          <div className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
            {parentsError}
          </div>
        )}

        {/* Parents */}

        {parentsLoading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading parents/guardians...
          </div>
        ) : parents.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl dark:bg-slate-800">
              👨‍👩‍👧
            </div>

            <p className="mt-4 text-sm font-semibold text-[var(--color-text)]">
              No parents or guardians added
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Add a parent or guardian for this student.
            </p>

            <button
              type="button"
              onClick={openParentModal}
              className="mt-4 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white"
            >
              Add Parent
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {parents.map((parent) => (
              <div key={parent.id} className="p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex gap-4">
                    {/* Avatar */}

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {parent.full_name?.charAt(0)?.toUpperCase() || "P"}
                    </div>

                    {/* Parent Details */}

                    <div>
                      <h3 className="font-semibold text-[var(--color-text)]">
                        {parent.full_name}
                      </h3>

                      <p className="mt-1 text-sm font-medium text-[var(--color-primary)]">
                        {parent.relationship || "Guardian"}
                      </p>

                      <div className="mt-3 grid gap-x-8 gap-y-2 text-sm text-slate-600 dark:text-slate-400 md:grid-cols-2">
                        <p>
                          <span className="font-medium">Phone:</span>{" "}
                          {parent.phone_number || "—"}
                        </p>

                        <p>
                          <span className="font-medium">Email:</span>{" "}
                          {parent.email || "—"}
                        </p>

                        <p>
                          <span className="font-medium">Occupation:</span>{" "}
                          {parent.occupation || "—"}
                        </p>

                        <p>
                          <span className="font-medium">Emergency:</span>{" "}
                          {parent.emergency_contact ? "Yes" : "No"}
                        </p>

                        <p className="md:col-span-2">
                          <span className="font-medium">Address:</span>{" "}
                          {parent.address || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditParent(parent)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[var(--color-text)] transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={removingParentId === parent.id}
                      onClick={() => handleRemoveParent(parent)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/40 dark:hover:bg-red-950/30"
                    >
                      {removingParentId === parent.id
                        ? "Removing..."
                        : "Remove"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =================================================
          ADD PARENT MODAL
      ================================================= */}

      {showParentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-[var(--color-card)] shadow-2xl">
            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
              <div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditParent(parent)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[var(--color-text)] transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    disabled={removingParentId === parent.id}
                    onClick={() => handleRemoveParent(parent)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/40 dark:hover:bg-red-950/30"
                  >
                    {removingParentId === parent.id ? "Removing..." : "Remove"}
                  </button>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {editingParent
                    ? `Update ${editingParent.full_name}'s information.`
                    : `Add a parent or guardian for ${fullName}.`}
                </p>
              </div>

              <button
                type="button"
                onClick={closeParentModal}
                disabled={savingParent}
                className="text-xl text-slate-400 hover:text-slate-600 disabled:opacity-50 dark:hover:text-slate-200"
              >
                ×
              </button>
            </div>

            {/* Form */}

            <form onSubmit={handleSaveParent} className="p-6">
              <div className="grid gap-5 md:grid-cols-2">
                {/* Full Name */}

                <FormField
                  label="Full Name"
                  name="full_name"
                  value={parentForm.full_name}
                  onChange={handleParentChange}
                  placeholder="Enter full name"
                  required
                />

                {/* Relationship */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    Relationship
                  </label>

                  <select
                    name="relationship"
                    value={parentForm.relationship}
                    onChange={handleParentChange}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] dark:border-slate-700"
                  >
                    <option value="">Select relationship</option>

                    <option value="Father">Father</option>

                    <option value="Mother">Mother</option>

                    <option value="Guardian">Guardian</option>

                    <option value="Uncle">Uncle</option>

                    <option value="Aunt">Aunt</option>

                    <option value="Grandfather">Grandfather</option>

                    <option value="Grandmother">Grandmother</option>

                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Phone */}

                <FormField
                  label="Phone Number"
                  name="phone_number"
                  value={parentForm.phone_number}
                  onChange={handleParentChange}
                  placeholder="08012345678"
                  required
                />

                {/* Email */}

                <FormField
                  label="Email"
                  name="email"
                  type="email"
                  value={parentForm.email}
                  onChange={handleParentChange}
                  placeholder="parent@example.com"
                />

                {/* Occupation */}

                <FormField
                  label="Occupation"
                  name="occupation"
                  value={parentForm.occupation}
                  onChange={handleParentChange}
                  placeholder="e.g. Teacher, Engineer"
                />

                {/* Emergency */}

                <div className="flex items-center">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      name="emergency_contact"
                      checked={parentForm.emergency_contact}
                      onChange={handleParentChange}
                      className="h-4 w-4 rounded border-slate-300"
                    />

                    <span className="text-sm font-medium text-[var(--color-text)]">
                      Emergency Contact
                    </span>
                  </label>
                </div>

                {/* Address */}

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={parentForm.address}
                    onChange={handleParentChange}
                    rows={3}
                    placeholder="Enter home address"
                    className="w-full resize-none rounded-lg border border-slate-200 bg-transparent px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Buttons */}

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeParentModal}
                  disabled={savingParent}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingParent}
                  className="rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {savingParent ? "Saving..." : "Add Parent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// INFO ITEM
// =====================================================

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
        {value || "—"}
      </p>
    </div>
  );
}

// =====================================================
// FORM FIELD
// =====================================================

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[var(--color-text)]">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] dark:border-slate-700"
      />
    </div>
  );
}

export default StudentDetails;
