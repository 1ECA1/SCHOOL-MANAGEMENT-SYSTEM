import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getStudent,
  getCurrentStudentEnrollment,
} from "../../services/studentsService";

function StudentProfile() {
  const { user } = useAuth();

  const [student, setStudent] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStudentProfile = async () => {
      if (!user?.student_id) {
        setError("No student profile is linked to this account.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [studentData, enrollmentData] = await Promise.all([
          getStudent(user.student_id),
          getCurrentStudentEnrollment(user.student_id),
        ]);

        console.log("STUDENT DATA:", studentData);
        console.log(
          "CURRENT ENROLLMENT DATA FULL:",
          JSON.stringify(enrollmentData, null, 2),
        );

        setStudent(studentData);
        setEnrollment(enrollmentData);
      } catch (err) {
        console.error("Failed to load student profile:", err);

        setError(
          err?.response?.data?.detail || "Unable to load your student profile.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadStudentProfile();
  }, [user?.student_id]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
          <p className="mt-4 text-sm text-slate-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
        <h2 className="text-lg font-bold text-red-800">
          Unable to load profile
        </h2>

        <p className="mt-2 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Student information could not be found.
        </p>
      </div>
    );
  }

  const studentName =
    student.full_name ||
    `${student.first_name || ""} ${student.middle_name || ""} ${
      student.last_name || ""
    }`
      .replace(/\s+/g, " ")
      .trim() ||
    "Student";

  const initial = studentName.charAt(0).toUpperCase();

  const profileImage = student.profile_image
    ? student.profile_image.startsWith("http")
      ? student.profile_image
      : `${import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"}${student.profile_image}`
    : null;

  const className =
    enrollment?.class_level_name ||
    enrollment?.class_level?.name ||
    enrollment?.class_name ||
    "—";

  const sessionName =
    enrollment?.academic_session_name ||
    enrollment?.academic_session?.name ||
    enrollment?.session_name ||
    "—";

  const termName = enrollment?.term_name || enrollment?.term?.name || "—";

  const departmentName =
    student.department_name || student.department?.name || "—";

  const rollNumber =
    enrollment?.roll_number ??
    enrollment?.roll_no ??
    enrollment?.rollNumber ??
    "—";

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>

        <p className="mt-1 text-sm text-slate-500">
          View your student information and academic details.
        </p>
      </div>

      {/* PROFILE HEADER */}
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {profileImage ? (
            <img
              src={profileImage}
              alt={studentName}
              className="h-24 w-24 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-slate-100 text-3xl font-bold text-slate-600">
              {initial}
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold text-slate-900">{studentName}</h2>

            <p className="mt-1 text-sm text-slate-500">Student</p>

            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Admission No: {student.admission_number || "—"}
              </span>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                {formatValue(student.status)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* PERSONAL INFORMATION */}
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Personal Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">Your personal details.</p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="Full Name" value={studentName} />

          <InfoItem label="Admission Number" value={student.admission_number} />

          <InfoItem label="Gender" value={formatValue(student.gender)} />

          <InfoItem
            label="Date of Birth"
            value={formatDate(student.date_of_birth)}
          />

          <InfoItem label="Phone Number" value={student.phone_number} />

          <InfoItem
            label="Email Address"
            value={student.email || user?.email}
          />

          <InfoItem label="Nationality" value={student.nationality} />

          <InfoItem label="State of Origin" value={student.state_of_origin} />

          <InfoItem label="Local Government" value={student.local_government} />

          <InfoItem label="Blood Group" value={student.blood_group} />

          <InfoItem label="Address" value={student.address} />

          <InfoItem
            label="Student Status"
            value={formatValue(student.status)}
          />
        </div>
      </section>

      {/* ACADEMIC INFORMATION */}
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Academic Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Your current academic placement.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="Current Class" value={className} />

          <InfoItem label="Academic Session" value={sessionName} />

          <InfoItem label="Current Term" value={termName} />

          <InfoItem label="Department" value={departmentName} />

          <InfoItem label="Roll Number" value={rollNumber} />

          <InfoItem
            label="Student Status"
            value={formatValue(student.status)}
          />
        </div>
      </section>
    </div>
  );
}

function InfoItem({ label, value }) {
  const displayValue =
    value === null || value === undefined || value === "" ? "—" : value;

  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-400">{label}</p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {displayValue}
      </p>
    </div>
  );
}

function formatValue(value) {
  if (!value) return "—";

  return String(value)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default StudentProfile;





// import { useEffect, useState } from "react";
// import { useAuth } from "../../context/AuthContext";
// import {
//   getStudent,
//   getCurrentStudentEnrollment,
//   getStudentParents,
// } from "../../services/studentsService";

// const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

// const StudentProfile = () => {
//   const { user } = useAuth();

//   const [student, setStudent] = useState(null);
//   const [enrollment, setEnrollment] = useState(null);
//   const [parents, setParents] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const loadProfile = async () => {
//       if (!user?.student_id) {
//         setError("No student profile is linked to this account.");
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         setError("");

//         const [studentData, enrollmentData, parentsData] =
//           await Promise.all([
//             getStudent(user.student_id),
//             getCurrentStudentEnrollment(user.student_id),
//             getStudentParents(user.student_id),
//           ]);

//         console.log("Student:", studentData);
//         console.log("Enrollment:", enrollmentData);
//         console.log("Parents:", parentsData);

//         setStudent(studentData);
//         setEnrollment(enrollmentData);

//         const parentList = Array.isArray(parentsData)
//           ? parentsData
//           : parentsData?.results || [];

//         setParents(parentList);
//       } catch (err) {
//         console.error("Failed to load student profile:", err);

//         setError(
//           err?.response?.data?.detail ||
//             "Failed to load your profile. Please try again."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadProfile();
//   }, [user]);

//   // ============================================================
//   // HELPERS
//   // ============================================================

//   const formatValue = (value) => {
//     if (
//       value === null ||
//       value === undefined ||
//       value === ""
//     ) {
//       return "-";
//     }

//     return value;
//   };

//   const formatDate = (date) => {
//     if (!date) return "-";

//     const parsedDate = new Date(`${date}T00:00:00`);

//     if (Number.isNaN(parsedDate.getTime())) {
//       return date;
//     }

//     return parsedDate.toLocaleDateString("en-NG", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const getImageUrl = (image) => {
//     if (!image) return null;

//     if (
//       image.startsWith("http://") ||
//       image.startsWith("https://")
//     ) {
//       return image;
//     }

//     return `${API_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
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

//   const getInitials = (name) => {
//     if (!name) return "S";

//     return name
//       .split(" ")
//       .filter(Boolean)
//       .slice(0, 2)
//       .map((part) => part[0]?.toUpperCase())
//       .join("");
//   };

//   const studentName = getStudentName();

//   const profileImage = getImageUrl(student?.profile_image);

//   const className =
//     enrollment?.class_level_name ||
//     enrollment?.class_level?.name ||
//     student?.class_level_name ||
//     "-";

//   const sessionName =
//     enrollment?.academic_session_name ||
//     enrollment?.academic_session?.name ||
//     "-";

//   const termName =
//     enrollment?.term_name ||
//     enrollment?.term?.name ||
//     "-";

//   const departmentName =
//     enrollment?.department_name ||
//     enrollment?.department?.name ||
//     student?.department_name ||
//     "-";

//   const rollNumber =
//     enrollment?.roll_number ||
//     student?.roll_number ||
//     "-";

//   // ============================================================
//   // LOADING
//   // ============================================================

//   if (loading) {
//     return (
//       <div className="min-h-full bg-[var(--color-background)] p-6 dark:bg-[var(--color-background)]">
//         <div className="mx-auto max-w-7xl">
//           <div className="flex min-h-[400px] items-center justify-center">
//             <div className="text-center">
//               <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[var(--color-primary)] dark:border-gray-700 dark:border-t-[var(--color-primary)]" />

//               <p className="text-sm text-gray-500 dark:text-gray-400">
//                 Loading your profile...
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ============================================================
//   // ERROR
//   // ============================================================

//   if (error) {
//     return (
//       <div className="min-h-full bg-[var(--color-background)] p-6 dark:bg-[var(--color-background)]">
//         <div className="mx-auto max-w-7xl">
//           <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/30">
//             <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
//               Unable to Load Profile
//             </h2>

//             <p className="mt-2 text-sm text-red-600 dark:text-red-300">
//               {error}
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ============================================================
//   // NO STUDENT
//   // ============================================================

//   if (!student) {
//     return (
//       <div className="min-h-full bg-[var(--color-background)] p-6 dark:bg-[var(--color-background)]">
//         <div className="mx-auto max-w-7xl">
//           <div className="rounded-xl border border-gray-200 bg-[var(--color-card)] p-8 text-center dark:border-gray-700">
//             <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
//               <svg
//                 className="h-8 w-8 text-gray-400"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//                 />
//               </svg>
//             </div>

//             <h2 className="mt-4 text-lg font-semibold text-[var(--color-text)]">
//               Student Profile Not Found
//             </h2>

//             <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
//               Your account is not currently linked to a student profile.
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-full bg-[var(--color-background)] p-4 sm:p-6 dark:bg-[var(--color-background)]">
//       <div className="mx-auto max-w-7xl space-y-6">

//         {/* ======================================================
//             PAGE HEADER
//         ====================================================== */}

//         <div>
//           <h1 className="text-2xl font-bold text-[var(--color-text)]">
//             My Profile
//           </h1>

//           <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
//             View your personal, academic, and parent or guardian information.
//           </p>
//         </div>

//         {/* ======================================================
//             PROFILE HEADER
//         ====================================================== */}

//         <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[var(--color-card)] shadow-sm dark:border-gray-700">
//           <div className="h-24 bg-[var(--color-primary)]" />

//           <div className="px-6 pb-6">
//             <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

//               <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">

//                 {/* Profile Image */}

//                 <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-[var(--color-card)] bg-gray-100 text-2xl font-bold text-[var(--color-primary)] shadow-md dark:bg-gray-800">
//                   {profileImage ? (
//                     <img
//                       src={profileImage}
//                       alt={studentName}
//                       className="h-full w-full object-cover"
//                     />
//                   ) : (
//                     getInitials(studentName)
//                   )}
//                 </div>

//                 <div className="pb-1">
//                   <h2 className="text-xl font-bold text-[var(--color-text)]">
//                     {studentName}
//                   </h2>

//                   <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
//                     Admission No:{" "}
//                     <span className="font-medium text-[var(--color-text)]">
//                       {formatValue(student.admission_number)}
//                     </span>
//                   </p>
//                 </div>
//               </div>

//               {/* Status */}

//               <div className="pb-1">
//                 <span
//                   className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
//                     student.status === "ACTIVE"
//                       ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
//                       : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
//                   }`}
//                 >
//                   {formatValue(student.status)}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ======================================================
//             PERSONAL + ACADEMIC INFORMATION
//         ====================================================== */}

//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

//           {/* Personal Information */}

//           <section className="rounded-2xl border border-gray-200 bg-[var(--color-card)] shadow-sm dark:border-gray-700">
//             <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
//               <h3 className="font-semibold text-[var(--color-text)]">
//                 Personal Information
//               </h3>

//               <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
//                 Your registered personal details
//               </p>
//             </div>

//             <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
//               <InfoItem
//                 label="Full Name"
//                 value={studentName}
//               />

//               <InfoItem
//                 label="Admission Number"
//                 value={student.admission_number}
//               />

//               <InfoItem
//                 label="Gender"
//                 value={student.gender}
//               />

//               <InfoItem
//                 label="Date of Birth"
//                 value={formatDate(student.date_of_birth)}
//               />

//               <InfoItem
//                 label="Phone"
//                 value={student.phone_number || student.phone}
//               />

//               <InfoItem
//                 label="Email"
//                 value={student.email}
//               />

//               <InfoItem
//                 label="Nationality"
//                 value={student.nationality}
//               />

//               <InfoItem
//                 label="State of Origin"
//                 value={student.state_of_origin}
//               />

//               <InfoItem
//                 label="Local Government"
//                 value={student.local_government}
//               />

//               <InfoItem
//                 label="Blood Group"
//                 value={student.blood_group}
//               />

//               <InfoItem
//                 label="Status"
//                 value={student.status}
//               />

//               <InfoItem
//                 label="Address"
//                 value={student.address}
//                 fullWidth
//               />
//             </div>
//           </section>

//           {/* Academic Information */}

//           <section className="rounded-2xl border border-gray-200 bg-[var(--color-card)] shadow-sm dark:border-gray-700">
//             <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
//               <h3 className="font-semibold text-[var(--color-text)]">
//                 Academic Information
//               </h3>

//               <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
//                 Your current academic enrollment
//               </p>
//             </div>

//             <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
//               <InfoItem
//                 label="Current Class"
//                 value={className}
//               />

//               <InfoItem
//                 label="Academic Session"
//                 value={sessionName}
//               />

//               <InfoItem
//                 label="Current Term"
//                 value={termName}
//               />

//               <InfoItem
//                 label="Department"
//                 value={departmentName}
//               />

//               <InfoItem
//                 label="Roll Number"
//                 value={rollNumber}
//               />

//               <InfoItem
//                 label="Enrollment Status"
//                 value={
//                   enrollment?.is_current
//                     ? "Current"
//                     : enrollment?.status || "-"
//                 }
//               />
//             </div>
//           </section>
//         </div>

//         {/* ======================================================
//             PARENTS / GUARDIANS
//         ====================================================== */}

//         <section className="rounded-2xl border border-gray-200 bg-[var(--color-card)] shadow-sm dark:border-gray-700">

//           <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
//             <div className="flex items-center justify-between gap-4">
//               <div>
//                 <h3 className="font-semibold text-[var(--color-text)]">
//                   Parents / Guardians
//                 </h3>

//                 <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
//                   Parent and guardian information linked to your student profile
//                 </p>
//               </div>

//               <div className="rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-primary)]">
//                 {parents.length}{" "}
//                 {parents.length === 1 ? "Contact" : "Contacts"}
//               </div>
//             </div>
//           </div>

//           <div className="p-6">

//             {parents.length === 0 ? (
//               <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center dark:border-gray-700 dark:bg-gray-900/40">
//                 <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
//                   <svg
//                     className="h-7 w-7 text-gray-400"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
//                     />
//                   </svg>
//                 </div>

//                 <p className="mt-4 text-sm font-medium text-[var(--color-text)]">
//                   No parent or guardian information
//                 </p>

//                 <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
//                   No parent or guardian has been linked to your profile yet.
//                 </p>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
//                 {parents.map((parent) => {
//                   const parentImage = getImageUrl(
//                     parent.profile_image
//                   );

//                   return (
//                     <div
//                       key={parent.id}
//                       className="rounded-xl border border-gray-200 p-5 transition hover:shadow-sm dark:border-gray-700"
//                     >
//                       <div className="flex items-start gap-4">

//                         {/* Parent Image */}

//                         <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 text-lg font-bold text-[var(--color-primary)] dark:bg-gray-800">
//                           {parentImage ? (
//                             <img
//                               src={parentImage}
//                               alt={parent.full_name}
//                               className="h-full w-full object-cover"
//                             />
//                           ) : (
//                             getInitials(parent.full_name)
//                           )}
//                         </div>

//                         {/* Parent Name */}

//                         <div className="min-w-0 flex-1">
//                           <h4 className="truncate font-semibold text-[var(--color-text)]">
//                             {formatValue(parent.full_name)}
//                           </h4>

//                           <span className="mt-1 inline-flex rounded-full bg-[var(--color-primary)]/10 px-2.5 py-1 text-xs font-medium text-[var(--color-primary)]">
//                             {formatValue(parent.relationship)}
//                           </span>
//                         </div>
//                       </div>

//                       {/* Parent Details */}

//                       <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">

//                         <InfoItem
//                           label="Phone"
//                           value={parent.phone_number}
//                         />

//                         <InfoItem
//                           label="Email"
//                           value={parent.email}
//                         />

//                         <InfoItem
//                           label="Occupation"
//                           value={parent.occupation}
//                         />

//                         <InfoItem
//                           label="Emergency Contact"
//                           value={parent.emergency_contact}
//                         />

//                         <InfoItem
//                           label="Address"
//                           value={parent.address}
//                           fullWidth
//                         />

//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </section>

//       </div>
//     </div>
//   );
// };

// // ============================================================
// // INFO ITEM
// // ============================================================

// const InfoItem = ({
//   label,
//   value,
//   fullWidth = false,
// }) => {
//   return (
//     <div className={fullWidth ? "sm:col-span-2" : ""}>
//       <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
//         {label}
//       </p>

//       <p className="mt-1 break-words text-sm font-medium text-[var(--color-text)]">
//         {value === null ||
//         value === undefined ||
//         value === ""
//           ? "-"
//           : value}
//       </p>
//     </div>
//   );
// };

// export default StudentProfile;