// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";

// import {
//   ArrowLeft,
//   User,
//   Phone,
//   Mail,
//   MapPin,
//   CalendarDays,
//   GraduationCap,
//   Users,
//   BookOpen,
//   ShieldCheck,
//   Loader2,
//   AlertCircle,
//   RefreshCw,
//   CheckCircle2,
//   UserCircle,
// } from "lucide-react";

// const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

// function StudentDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [student, setStudent] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const getToken = () =>
//     localStorage.getItem("access_token") ||
//     localStorage.getItem("accessToken");

//   const fetchStudent = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const token = getToken();

//       const response = await fetch(
//         `${API_URL}/students/${id}/`,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             ...(token
//               ? {
//                   Authorization: `Bearer ${token}`,
//                 }
//               : {}),
//           },
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data?.detail ||
//             "Failed to load student details."
//         );
//       }

//       setStudent(data);
//     } catch (err) {
//       console.error(
//         "Student details error:",
//         err
//       );

//       setError(
//         err.message ||
//           "Unable to load student details."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStudent();
//   }, [id]);

//   const formatDate = (value) => {
//     if (!value) return "—";

//     const date = new Date(value);

//     if (Number.isNaN(date.getTime())) {
//       return value;
//     }

//     return date.toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   const displayValue = (value) => {
//     if (
//       value === null ||
//       value === undefined ||
//       value === ""
//     ) {
//       return "—";
//     }

//     return value;
//   };

//   const getStudentName = () => {
//     if (!student) return "Student";

//     if (student.full_name) {
//       return student.full_name;
//     }

//     return [
//       student.first_name,
//       student.middle_name,
//       student.last_name,
//     ]
//       .filter(Boolean)
//       .join(" ");
//   };

//   const getClassName = () => {
//     if (!student) return "—";

//     return (
//       student.class_level_name ||
//       student.class_name ||
//       student.current_class_name ||
//       student.current_enrollment
//         ?.class_level_name ||
//       student.current_enrollment?.class_name ||
//       "—"
//     );
//   };

//   const getDepartmentName = () => {
//     if (!student) return "—";

//     return (
//       student.department_name ||
//       student.department?.name ||
//       student.current_enrollment
//         ?.department_name ||
//       "—"
//     );
//   };

//   const getStatusClasses = () => {
//     switch (
//       String(student?.status || "").toUpperCase()
//     ) {
//       case "ACTIVE":
//         return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";

//       case "GRADUATED":
//         return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";

//       case "SUSPENDED":
//         return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";

//       case "TRANSFERRED":
//         return "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400";

//       case "WITHDRAWN":
//         return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";

//       default:
//         return "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";
//     }
//   };

//   const getStatusLabel = () => {
//     if (!student?.status) return "Unknown";

//     return student.status
//       .toLowerCase()
//       .replace(/_/g, " ")
//       .replace(/\b\w/g, (letter) =>
//         letter.toUpperCase()
//       );
//   };

//   const getProfileImage = () => {
//     if (!student) return null;

//     const image =
//       student.profile_image ||
//       student.user?.profile_image;

//     if (!image) return null;

//     return image.startsWith("http")
//       ? image
//       : `${import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"}${image}`;
//   };

//   const getInitials = () => {
//     const name = getStudentName();

//     return (
//       name
//         .split(" ")
//         .filter(Boolean)
//         .slice(0, 2)
//         .map((part) =>
//           part.charAt(0).toUpperCase()
//         )
//         .join("") || "ST"
//     );
//   };

//   if (loading) {
//     return (
//       <div className="flex min-h-[60vh] items-center justify-center">
//         <div className="flex items-center gap-3 text-slate-500">
//           <Loader2
//             size={25}
//             className="animate-spin text-[var(--color-primary)]"
//           />

//           <span className="text-sm font-medium">
//             Loading student details...
//           </span>
//         </div>
//       </div>
//     );
//   }

//   if (error || !student) {
//     return (
//       <div className="mx-auto max-w-4xl">
//         <button
//           type="button"
//           onClick={() =>
//             navigate(
//               "/admission-officer/students"
//             )
//           }
//           className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[var(--color-primary)] dark:text-slate-300"
//         >
//           <ArrowLeft size={18} />
//           Back to Students
//         </button>

//         <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-500/20 dark:bg-red-500/10">
//           <AlertCircle
//             size={42}
//             className="mx-auto text-red-500"
//           />

//           <h2 className="mt-4 text-lg font-bold text-red-700 dark:text-red-400">
//             Unable to Load Student
//           </h2>

//           <p className="mx-auto mt-2 max-w-lg text-sm text-red-600 dark:text-red-300">
//             {error ||
//               "The requested student could not be found."}
//           </p>

//           <button
//             type="button"
//             onClick={fetchStudent}
//             className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
//           >
//             <RefreshCw size={17} />
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const profileImage = getProfileImage();

//   return (
//     <div className="mx-auto max-w-7xl space-y-6">
//       {/* Header */}
//       <div className="flex flex-col gap-5">
//         <div className="flex items-center justify-between">
//           <button
//             type="button"
//             onClick={() =>
//               navigate(
//                 "/admission-officer/students"
//               )
//             }
//             className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[var(--color-primary)] dark:text-slate-300"
//           >
//             <ArrowLeft size={18} />
//             Back to Students
//           </button>

//           <button
//             type="button"
//             onClick={fetchStudent}
//             className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-[var(--color-card)] dark:text-slate-300 dark:hover:bg-slate-800"
//             title="Refresh"
//           >
//             <RefreshCw size={18} />
//           </button>
//         </div>

//         {/* Profile Banner */}
//         <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-[var(--color-card)] dark:ring-slate-800">
//           <div className="h-28 bg-[var(--color-primary)]" />

//           <div className="px-5 pb-6 sm:px-7">
//             <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
//               <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
//                 {profileImage ? (
//                   <img
//                     src={profileImage}
//                     alt={getStudentName()}
//                     className="h-28 w-28 rounded-3xl border-4 border-white object-cover shadow-lg dark:border-[var(--color-card)]"
//                   />
//                 ) : (
//                   <div className="flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-white bg-blue-50 text-3xl font-bold text-[var(--color-primary)] shadow-lg dark:border-[var(--color-card)] dark:bg-blue-500/10 dark:text-blue-400">
//                     {getInitials()}
//                   </div>
//                 )}

//                 <div className="pb-1">
//                   <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
//                     {getStudentName()}
//                   </h1>

//                   <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
//                     <span>
//                       {displayValue(
//                         student.admission_number
//                       )}
//                     </span>

//                     <span>•</span>

//                     <span>
//                       {getClassName()}
//                     </span>

//                     {getDepartmentName() !==
//                       "—" && (
//                       <>
//                         <span>•</span>
//                         <span>
//                           {getDepartmentName()}
//                         </span>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <div
//                 className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${getStatusClasses()}`}
//               >
//                 <CheckCircle2 size={17} />
//                 {getStatusLabel()}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Personal + Academic */}
//       <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
//         <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 dark:bg-[var(--color-card)] dark:ring-slate-800 xl:col-span-2">
//           <SectionHeader
//             icon={User}
//             title="Personal Information"
//           />

//           <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
//             <InfoItem
//               label="First Name"
//               value={student.first_name}
//             />

//             <InfoItem
//               label="Middle Name"
//               value={student.middle_name}
//             />

//             <InfoItem
//               label="Last Name"
//               value={student.last_name}
//             />

//             <InfoItem
//               label="Date of Birth"
//               value={formatDate(
//                 student.date_of_birth
//               )}
//               icon={CalendarDays}
//             />

//             <InfoItem
//               label="Gender"
//               value={
//                 student.gender === "MALE"
//                   ? "Male"
//                   : student.gender === "FEMALE"
//                   ? "Female"
//                   : student.gender
//               }
//             />

//             <InfoItem
//               label="Admission Date"
//               value={formatDate(
//                 student.admission_date
//               )}
//               icon={CalendarDays}
//             />

//             <InfoItem
//               label="Phone Number"
//               value={student.phone_number}
//               icon={Phone}
//             />

//             <InfoItem
//               label="Email Address"
//               value={student.email}
//               icon={Mail}
//             />

//             <InfoItem
//               label="Nationality"
//               value={student.nationality}
//             />

//             <InfoItem
//               label="State of Origin"
//               value={student.state_of_origin}
//             />

//             <InfoItem
//               label="Local Government"
//               value={student.local_government}
//             />

//             <InfoItem
//               label="Blood Group"
//               value={student.blood_group}
//             />

//             <div className="sm:col-span-2 lg:col-span-3">
//               <InfoItem
//                 label="Address"
//                 value={student.address}
//                 icon={MapPin}
//               />
//             </div>
//           </div>
//         </section>

//         {/* Academic */}
//         <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 dark:bg-[var(--color-card)] dark:ring-slate-800">
//           <SectionHeader
//             icon={GraduationCap}
//             title="Academic Information"
//           />

//           <div className="mt-6 space-y-5">
//             <InfoItem
//               label="Admission Number"
//               value={student.admission_number}
//             />

//             <InfoItem
//               label="Class"
//               value={getClassName()}
//             />

//             <InfoItem
//               label="Department"
//               value={getDepartmentName()}
//             />

//             <InfoItem
//               label="Status"
//               value={getStatusLabel()}
//             />

//             <InfoItem
//               label="Academic Session"
//               value={
//                 student.current_enrollment
//                   ?.session_name ||
//                 student.academic_session_name ||
//                 student.current_session_name
//               }
//             />

//             <InfoItem
//               label="Current Term"
//               value={
//                 student.current_enrollment
//                   ?.term_name ||
//                 student.current_term_name
//               }
//             />
//           </div>
//         </section>

//         {/* Account */}
//         <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 dark:bg-[var(--color-card)] dark:ring-slate-800">
//           <SectionHeader
//             icon={ShieldCheck}
//             title="Student Account"
//           />

//           <div className="mt-6 space-y-5">
//             <InfoItem
//               label="Username"
//               value={
//                 student.user?.username ||
//                 student.username
//               }
//               icon={UserCircle}
//             />

//             <InfoItem
//               label="Account Email"
//               value={
//                 student.user?.email ||
//                 student.email
//               }
//               icon={Mail}
//             />

//             <InfoItem
//               label="Account Status"
//               value={
//                 student.user?.is_active ===
//                 false
//                   ? "Inactive"
//                   : "Active"
//               }
//             />

//             <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
//               <div className="flex items-start gap-3">
//                 <ShieldCheck
//                   size={19}
//                   className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
//                 />

//                 <p className="text-sm leading-6 text-emerald-700 dark:text-emerald-300">
//                   Student login credentials are
//                   managed through the student's
//                   account. Passwords are not displayed
//                   here.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Guardian */}
//         <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 dark:bg-[var(--color-card)] dark:ring-slate-800 xl:col-span-2">
//           <SectionHeader
//             icon={Users}
//             title="Guardian / Parent Information"
//           />

//           {Array.isArray(student.parents) &&
//           student.parents.length > 0 ? (
//             <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
//               {student.parents.map(
//                 (parent, index) => (
//                   <div
//                     key={
//                       parent.id ||
//                       parent.user_id ||
//                       index
//                     }
//                     className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-900"
//                   >
//                     <div className="flex items-center gap-3">
//                       <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[var(--color-primary)] dark:bg-blue-500/10 dark:text-blue-400">
//                         <Users size={20} />
//                       </div>

//                       <div>
//                         <p className="text-sm font-bold">
//                           {parent.full_name ||
//                             [
//                               parent.first_name,
//                               parent.last_name,
//                             ]
//                               .filter(Boolean)
//                               .join(" ") ||
//                             "Parent / Guardian"}
//                         </p>

//                         {parent.relationship && (
//                           <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
//                             {parent.relationship}
//                           </p>
//                         )}
//                       </div>
//                     </div>

//                     <div className="mt-5 space-y-3">
//                       {parent.phone_number && (
//                         <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
//                           <Phone size={15} />
//                           {parent.phone_number}
//                         </div>
//                       )}

//                       {parent.email && (
//                         <div className="flex items-center gap-2 break-all text-sm text-slate-600 dark:text-slate-300">
//                           <Mail size={15} />
//                           {parent.email}
//                         </div>
//                       )}

//                       {parent.address && (
//                         <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
//                           <MapPin
//                             size={15}
//                             className="mt-0.5 shrink-0"
//                           />
//                           <span>
//                             {parent.address}
//                           </span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )
//               )}
//             </div>
//           ) : (
//             <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-center dark:bg-slate-900">
//               <Users
//                 size={30}
//                 className="mx-auto text-slate-400"
//               />

//               <p className="mt-3 text-sm font-semibold">
//                 No parent or guardian linked
//               </p>

//               <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
//                 No parent or guardian information is
//                 currently available for this student.
//               </p>
//             </div>
//           )}
//         </section>

//         {/* Enrollment */}
//         <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 dark:bg-[var(--color-card)] dark:ring-slate-800">
//           <SectionHeader
//             icon={BookOpen}
//             title="Current Enrollment"
//           />

//           <div className="mt-6 space-y-5">
//             <InfoItem
//               label="Session"
//               value={
//                 student.current_enrollment
//                   ?.session_name ||
//                 student.academic_session_name ||
//                 student.current_session_name
//               }
//             />

//             <InfoItem
//               label="Term"
//               value={
//                 student.current_enrollment
//                   ?.term_name ||
//                 student.current_term_name
//               }
//             />

//             <InfoItem
//               label="Class"
//               value={
//                 student.current_enrollment
//                   ?.class_level_name ||
//                 student.current_enrollment
//                   ?.class_name ||
//                 getClassName()
//               }
//             />

//             <InfoItem
//               label="Roll Number"
//               value={
//                 student.current_enrollment
//                   ?.roll_number
//               }
//             />

//             <InfoItem
//               label="Enrollment Date"
//               value={formatDate(
//                 student.current_enrollment
//                   ?.enrollment_date
//               )}
//             />
//           </div>
//         </section>

//         {/* Medical Notes */}
//         {student.medical_notes && (
//           <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 dark:bg-[var(--color-card)] dark:ring-slate-800 xl:col-span-3">
//             <SectionHeader
//               icon={User}
//               title="Additional Information"
//             />

//             <div className="mt-5 rounded-2xl bg-slate-50 p-5 dark:bg-slate-900">
//               <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">
//                 {student.medical_notes}
//               </p>
//             </div>
//           </section>
//         )}
//       </div>
//     </div>
//   );
// }

// function SectionHeader({
//   icon: Icon,
//   title,
// }) {
//   return (
//     <div className="flex items-center gap-3">
//       <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[var(--color-primary)] dark:bg-blue-500/10 dark:text-blue-400">
//         <Icon size={21} />
//       </div>

//       <div>
//         <h2 className="text-base font-bold">
//           {title}
//         </h2>

//         <div className="mt-1 h-1 w-8 rounded-full bg-[var(--color-primary)]" />
//       </div>
//     </div>
//   );
// }

// function InfoItem({
//   label,
//   value,
//   icon: Icon,
// }) {
//   return (
//     <div>
//       <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
//         {Icon && <Icon size={13} />}
//         {label}
//       </p>

//       <p className="mt-1.5 break-words text-sm font-semibold text-slate-700 dark:text-slate-200">
//         {value === null ||
//         value === undefined ||
//         value === ""
//           ? "—"
//           : value}
//       </p>
//     </div>
//   );
// }

// export default StudentDetails;

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  GraduationCap,
  Users,
  BookOpen,
  ShieldCheck,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  UserCircle,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => {
  return (
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("accessToken")
  );
};
  const fetchStudent = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const response = await fetch(
        `${API_URL}/students/${id}/`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Failed to load student details."
        );
      }

      setStudent(data);
    } catch (err) {
      console.error(
        "Student details error:",
        err
      );

      setError(
        err.message ||
          "Unable to load student details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const displayValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "—";
    }

    return value;
  };

  const getStudentName = () => {
    if (!student) return "Student";

    if (student.full_name) {
      return student.full_name;
    }

    return [
      student.first_name,
      student.middle_name,
      student.last_name,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const getClassName = () => {
    if (!student) return "—";

    return (
      student.class_level_name ||
      student.class_name ||
      student.current_class_name ||
      student.current_enrollment
        ?.class_level_name ||
      student.current_enrollment?.class_name ||
      "—"
    );
  };

  const getDepartmentName = () => {
    if (!student) return "—";

    return (
      student.department_name ||
      student.department?.name ||
      student.current_enrollment
        ?.department_name ||
      "—"
    );
  };

  /*
   * Student username is created during admission
   * using the admission number.
   *
   * We check several possible API structures,
   * then finally fall back to admission_number.
   */
  const getUsername = () => {
    if (!student) return "—";

    return (
      student.user?.username ||
      student.username ||
      student.user_username ||
      student.admission_number ||
      "—"
    );
  };

  const getAccountEmail = () => {
    if (!student) return "—";

    return (
      student.user?.email ||
      student.email ||
      "—"
    );
  };

  const getAccountStatus = () => {
    if (!student) return "Unknown";

    if (student.user?.is_active === false) {
      return "Inactive";
    }

    return "Active";
  };

  const getStatusClasses = () => {
    switch (
      String(student?.status || "").toUpperCase()
    ) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";

      case "GRADUATED":
        return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";

      case "SUSPENDED":
        return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";

      case "TRANSFERRED":
        return "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400";

      case "WITHDRAWN":
        return "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400";

      default:
        return "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";
    }
  };

  const getStatusLabel = () => {
    if (!student?.status) return "Unknown";

    return student.status
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const getProfileImage = () => {
    if (!student) return null;

    const image =
      student.profile_image ||
      student.user?.profile_image;

    if (!image) return null;

    return image.startsWith("http")
      ? image
      : `${import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"}${image}`;
  };

  const getInitials = () => {
    const name = getStudentName();

    return (
      name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) =>
          part.charAt(0).toUpperCase()
        )
        .join("") || "ST"
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2
            size={25}
            className="animate-spin text-[var(--color-primary)]"
          />

          <span className="text-sm font-medium">
            Loading student details...
          </span>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() =>
            navigate(
              "/admission-officer/students"
            )
          }
          className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[var(--color-primary)] dark:text-slate-300"
        >
          <ArrowLeft size={18} />
          Back to Students
        </button>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-500/20 dark:bg-red-500/10">
          <AlertCircle
            size={42}
            className="mx-auto text-red-500"
          />

          <h2 className="mt-4 text-lg font-bold text-red-700 dark:text-red-400">
            Unable to Load Student
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm text-red-600 dark:text-red-300">
            {error ||
              "The requested student could not be found."}
          </p>

          <button
            type="button"
            onClick={fetchStudent}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <RefreshCw size={17} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const profileImage = getProfileImage();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              navigate(
                "/admission-officer/students"
              )
            }
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[var(--color-primary)] dark:text-slate-300"
          >
            <ArrowLeft size={18} />
            Back to Students
          </button>

          <button
            type="button"
            onClick={fetchStudent}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-[var(--color-card)] dark:text-slate-300 dark:hover:bg-slate-800"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Profile Banner */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-[var(--color-card)] dark:ring-slate-800">
          <div className="h-28 bg-[var(--color-primary)]" />

          <div className="px-5 pb-6 sm:px-7">
            <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={getStudentName()}
                    className="h-28 w-28 rounded-3xl border-4 border-white object-cover shadow-lg dark:border-[var(--color-card)]"
                  />
                ) : (
                  <div className="flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-white bg-blue-50 text-3xl font-bold text-[var(--color-primary)] shadow-lg dark:border-[var(--color-card)] dark:bg-blue-500/10 dark:text-blue-400">
                    {getInitials()}
                  </div>
                )}

                <div className="pb-1">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {getStudentName()}
                  </h1>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <span>
                      {displayValue(
                        student.admission_number
                      )}
                    </span>

                    <span>•</span>

                    <span>
                      {getClassName()}
                    </span>

                    {getDepartmentName() !==
                      "—" && (
                      <>
                        <span>•</span>

                        <span>
                          {getDepartmentName()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div
                className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${getStatusClasses()}`}
              >
                <CheckCircle2 size={17} />
                {getStatusLabel()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal + Academic */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Personal Information */}
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 dark:bg-[var(--color-card)] dark:ring-slate-800 xl:col-span-2">
          <SectionHeader
            icon={User}
            title="Personal Information"
          />

          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              label="First Name"
              value={student.first_name}
            />

            <InfoItem
              label="Middle Name"
              value={student.middle_name}
            />

            <InfoItem
              label="Last Name"
              value={student.last_name}
            />

            <InfoItem
              label="Date of Birth"
              value={formatDate(
                student.date_of_birth
              )}
              icon={CalendarDays}
            />

            <InfoItem
              label="Gender"
              value={
                student.gender === "MALE"
                  ? "Male"
                  : student.gender === "FEMALE"
                  ? "Female"
                  : student.gender
              }
            />

            <InfoItem
              label="Admission Date"
              value={formatDate(
                student.admission_date
              )}
              icon={CalendarDays}
            />

            <InfoItem
              label="Phone Number"
              value={student.phone_number}
              icon={Phone}
            />

            <InfoItem
              label="Email Address"
              value={student.email}
              icon={Mail}
            />

            <InfoItem
              label="Nationality"
              value={student.nationality}
            />

            <InfoItem
              label="State of Origin"
              value={student.state_of_origin}
            />

            <InfoItem
              label="Local Government"
              value={student.local_government}
            />

            <InfoItem
              label="Blood Group"
              value={student.blood_group}
            />

            <div className="sm:col-span-2 lg:col-span-3">
              <InfoItem
                label="Address"
                value={student.address}
                icon={MapPin}
              />
            </div>
          </div>
        </section>

        {/* Academic Information */}
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 dark:bg-[var(--color-card)] dark:ring-slate-800">
          <SectionHeader
            icon={GraduationCap}
            title="Academic Information"
          />

          <div className="mt-6 space-y-5">
            <InfoItem
              label="Admission Number"
              value={student.admission_number}
            />

            <InfoItem
              label="Class"
              value={getClassName()}
            />

            <InfoItem
              label="Department"
              value={getDepartmentName()}
            />

            <InfoItem
              label="Status"
              value={getStatusLabel()}
            />

            <InfoItem
              label="Academic Session"
              value={
                student.current_enrollment
                  ?.session_name ||
                student.academic_session_name ||
                student.current_session_name
              }
            />

            <InfoItem
              label="Current Term"
              value={
                student.current_enrollment
                  ?.term_name ||
                student.current_term_name
              }
            />
          </div>
        </section>

        {/* Student Account */}
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 dark:bg-[var(--color-card)] dark:ring-slate-800">
          <SectionHeader
            icon={ShieldCheck}
            title="Student Account"
          />

          <div className="mt-6 space-y-5">
            <InfoItem
              label="Username"
              value={getUsername()}
              icon={UserCircle}
            />

            <InfoItem
              label="Admission Number"
              value={student.admission_number}
              icon={GraduationCap}
            />

            <InfoItem
              label="Account Email"
              value={getAccountEmail()}
              icon={Mail}
            />

            <InfoItem
              label="Account Status"
              value={getAccountStatus()}
            />

            <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={19}
                  className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                />

                <p className="text-sm leading-6 text-emerald-700 dark:text-emerald-300">
                  The student's username is the
                  same as the admission number.
                  Passwords are not displayed here
                  for security.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Guardian / Parent */}
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 dark:bg-[var(--color-card)] dark:ring-slate-800 xl:col-span-2">
          <SectionHeader
            icon={Users}
            title="Guardian / Parent Information"
          />

          {Array.isArray(student.parents) &&
          student.parents.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {student.parents.map(
                (parent, index) => (
                  <div
                    key={
                      parent.id ||
                      parent.user_id ||
                      index
                    }
                    className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-900"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[var(--color-primary)] dark:bg-blue-500/10 dark:text-blue-400">
                        <Users size={20} />
                      </div>

                      <div>
                        <p className="text-sm font-bold">
                          {parent.full_name ||
                            [
                              parent.first_name,
                              parent.last_name,
                            ]
                              .filter(Boolean)
                              .join(" ") ||
                            "Parent / Guardian"}
                        </p>

                        {parent.relationship && (
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {parent.relationship}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {parent.phone_number && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <Phone size={15} />
                          {parent.phone_number}
                        </div>
                      )}

                      {parent.email && (
                        <div className="flex items-center gap-2 break-all text-sm text-slate-600 dark:text-slate-300">
                          <Mail size={15} />
                          {parent.email}
                        </div>
                      )}

                      {parent.address && (
                        <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <MapPin
                            size={15}
                            className="mt-0.5 shrink-0"
                          />

                          <span>
                            {parent.address}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl bg-slate-50 p-6 text-center dark:bg-slate-900">
              <Users
                size={30}
                className="mx-auto text-slate-400"
              />

              <p className="mt-3 text-sm font-semibold">
                No parent or guardian linked
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                No parent or guardian information
                is currently available for this
                student.
              </p>
            </div>
          )}
        </section>

        {/* Current Enrollment */}
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 dark:bg-[var(--color-card)] dark:ring-slate-800">
          <SectionHeader
            icon={BookOpen}
            title="Current Enrollment"
          />

          <div className="mt-6 space-y-5">
            <InfoItem
              label="Session"
              value={
                student.current_enrollment
                  ?.session_name ||
                student.academic_session_name ||
                student.current_session_name
              }
            />

            <InfoItem
              label="Term"
              value={
                student.current_enrollment
                  ?.term_name ||
                student.current_term_name
              }
            />

            <InfoItem
              label="Class"
              value={
                student.current_enrollment
                  ?.class_level_name ||
                student.current_enrollment
                  ?.class_name ||
                getClassName()
              }
            />

            <InfoItem
              label="Roll Number"
              value={
                student.current_enrollment
                  ?.roll_number
              }
            />

            <InfoItem
              label="Enrollment Date"
              value={formatDate(
                student.current_enrollment
                  ?.enrollment_date
              )}
            />
          </div>
        </section>

        {/* Medical / Additional Information */}
        {student.medical_notes && (
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70 dark:bg-[var(--color-card)] dark:ring-slate-800 xl:col-span-3">
            <SectionHeader
              icon={User}
              title="Additional Information"
            />

            <div className="mt-5 rounded-2xl bg-slate-50 p-5 dark:bg-slate-900">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">
                {student.medical_notes}
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[var(--color-primary)] dark:bg-blue-500/10 dark:text-blue-400">
        <Icon size={21} />
      </div>

      <div>
        <h2 className="text-base font-bold">
          {title}
        </h2>

        <div className="mt-1 h-1 w-8 rounded-full bg-[var(--color-primary)]" />
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
        {Icon && <Icon size={13} />}
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-semibold text-slate-700 dark:text-slate-200">
        {value === null ||
        value === undefined ||
        value === ""
          ? "—"
          : value}
      </p>
    </div>
  );
}

export default StudentDetails;