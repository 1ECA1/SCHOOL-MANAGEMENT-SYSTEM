// // // src/pages/student/Dashboard.jsx
// // import { useEffect, useState } from "react";
// // import { useAuth } from "../../context/AuthContext";
// // import { getProfile } from "../../services/authService";
// // import attendanceService from "../../services/attendanceService";
// // import resultsService from "../../services/resultsService";
// // import assignmentsService from "../../services/assignmentsService";

// // export default function StudentDashboard() {
// //   const { user } = useAuth();
// //   const [profile, setProfile] = useState(null);
// //   const [stats, setStats] = useState({
// //     attendancePercent: null,
// //     latestResult: null,
// //     pendingAssignments: null,
// //   });
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);

// //   useEffect(() => {
// //     let isMounted = true;

// //     async function loadDashboard() {
// //       try {
// //         setLoading(true);

// //         // Full profile (class, section, studentId, etc.) — /login/ payload is lean
// //         const fullProfile = await getProfile();
// //         if (!isMounted) return;
// //         setProfile(fullProfile);

// //         // Adjust this field name once we confirm the exact key from /profile/
// //         const studentId = fullProfile.student_id ?? fullProfile.id ?? fullProfile.studentId;

// //         const [attendance, results, assignments] = await Promise.all([
// //           attendanceService.getStudentAttendanceSummary(studentId),
// //           resultsService.getLatestResult(studentId),
// //           assignmentsService.getPendingForStudent(studentId),
// //         ]);

// //         if (isMounted) {
// //           setStats({
// //             attendancePercent: attendance?.percentage ?? null,
// //             latestResult: results ?? null,
// //             pendingAssignments: assignments?.length ?? 0,
// //           });
// //         }
// //       } catch (err) {
// //         if (isMounted) setError("Couldn't load your dashboard. Please try again.");
// //         console.error(err);
// //       } finally {
// //         if (isMounted) setLoading(false);
// //       }
// //     }

// //     loadDashboard();
// //     return () => { isMounted = false; };
// //   }, []);

// //   if (loading) return <div className="p-6">Loading dashboard…</div>;
// //   if (error) return <div className="p-6 text-red-600">{error}</div>;

// //   return (
// //     <div className="p-6 space-y-6">
// //       <h1 className="text-2xl font-semibold">
// //         Welcome back, {profile?.first_name ?? user?.username}
// //       </h1>

// //       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
// //         <StatCard label="Attendance" value={`${stats.attendancePercent ?? "--"}%`} />
// //         <StatCard
// //           label="Latest Result"
// //           value={stats.latestResult ? stats.latestResult.grade : "No results yet"}
// //         />
// //         <StatCard label="Pending Assignments" value={stats.pendingAssignments ?? 0} />
// //       </div>
// //     </div>
// //   );
// // }

// // function StatCard({ label, value }) {
// //   return (
// //     <div className="rounded-lg border p-4 shadow-sm">
// //       <p className="text-sm text-gray-500">{label}</p>
// //       <p className="text-xl font-bold">{value}</p>
// //     </div>
// //   );
// // }

// import { useEffect, useState } from "react";
// import { useAuth } from "../../context/AuthContext";
// import {
//   getStudent,
//   getCurrentStudentEnrollment,
// } from "../../services/studentsService";

// function StudentDashboard() {
//   const { user } = useAuth();

//   const [student, setStudent] = useState(null);
//   const [enrollment, setEnrollment] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const loadDashboardData = async () => {
//       if (!user?.student_id) {
//         setError("No student profile is linked to this account.");
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         setError("");

//         const [studentData, enrollmentData] = await Promise.all([
//           getStudent(user.student_id),
//           getCurrentStudentEnrollment(user.student_id),
//         ]);

//         console.log("STUDENT DASHBOARD DATA:", studentData);
//         console.log(
//           "STUDENT DASHBOARD ENROLLMENT:",
//           JSON.stringify(enrollmentData, null, 2)
//         );

//         setStudent(studentData);
//         setEnrollment(enrollmentData);
//       } catch (err) {
//         console.error("Failed to load student dashboard:", err);

//         setError(
//           err?.response?.data?.detail ||
//             "Unable to load your student dashboard."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadDashboardData();
//   }, [user?.student_id]);

//   /* =========================
//      LOADING
//   ========================== */

//   if (loading) {
//     return (
//       <div className="flex min-h-[500px] items-center justify-center">
//         <div className="text-center">
//           <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />

//           <p className="mt-4 text-sm text-slate-500">
//             Loading your dashboard...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   /* =========================
//      ERROR
//   ========================== */

//   if (error) {
//     return (
//       <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
//         <h2 className="text-lg font-bold text-red-800">
//           Unable to load dashboard
//         </h2>

//         <p className="mt-2 text-sm text-red-600">
//           {error}
//         </p>
//       </div>
//     );
//   }

//   /* =========================
//      STUDENT INFORMATION
//   ========================== */

//   const studentName =
//     student?.full_name ||
//     `${student?.first_name || ""} ${student?.middle_name || ""} ${
//       student?.last_name || ""
//     }`
//       .replace(/\s+/g, " ")
//       .trim() ||
//     (user?.first_name
//       ? `${user.first_name} ${user.last_name || ""}`.trim()
//       : user?.username || "Student");

//   const firstName =
//     student?.first_name ||
//     user?.first_name ||
//     studentName.split(" ")[0] ||
//     "Student";

//   const initial = studentName.charAt(0).toUpperCase();

//   const profileImage = student?.profile_image
//     ? student.profile_image.startsWith("http")
//       ? student.profile_image
//       : `${import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"}${student.profile_image}`
//     : null;

//   /* =========================
//      ENROLLMENT INFORMATION
//   ========================== */

//   const className =
//     enrollment?.class_level_name ||
//     enrollment?.class_level?.name ||
//     enrollment?.class_name ||
//     "—";

//   const sessionName =
//     enrollment?.academic_session_name ||
//     enrollment?.academic_session?.name ||
//     enrollment?.session_name ||
//     "—";

//   const termName =
//     enrollment?.term_name ||
//     enrollment?.term?.name ||
//     "—";

//   const departmentName =
//     student?.department_name ||
//     student?.department?.name ||
//     "—";

//   const rollNumber =
//     enrollment?.roll_number ??
//     enrollment?.roll_no ??
//     enrollment?.rollNumber ??
//     "—";

//   return (
//     <div className="space-y-6">
//       {/* =========================
//           WELCOME SECTION
//       ========================== */}

//       <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shadow-sm sm:p-8">
//         <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <p className="text-sm font-medium text-slate-300">
//               Student Portal
//             </p>

//             <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
//               Welcome back, {firstName}! 👋
//             </h1>

//             <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
//               Stay updated with your classes, assignments, attendance,
//               results, and school activities.
//             </p>
//           </div>

//           {profileImage ? (
//             <img
//               src={profileImage}
//               alt={studentName}
//               className="h-16 w-16 shrink-0 rounded-2xl object-cover"
//             />
//           ) : (
//             <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl backdrop-blur-sm">
//               {initial}
//             </div>
//           )}
//         </div>
//       </section>

//       {/* =========================
//           QUICK STATS
//       ========================== */}

//       <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//         {/* Current Class */}

//         <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
//           <div className="flex items-start justify-between">
//             <div>
//               <p className="text-sm font-medium text-slate-500">
//                 Current Class
//               </p>

//               <h2 className="mt-2 text-2xl font-bold text-slate-900">
//                 {className}
//               </h2>

//               <p className="mt-1 text-xs text-slate-400">
//                 {sessionName}
//               </p>
//             </div>

//             <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
//               🏫
//             </div>
//           </div>
//         </div>

//         {/* Attendance */}

//         <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
//           <div className="flex items-start justify-between">
//             <div>
//               <p className="text-sm font-medium text-slate-500">
//                 Attendance
//               </p>

//               <h2 className="mt-2 text-2xl font-bold text-slate-900">
//                 —
//               </h2>

//               <p className="mt-1 text-xs text-slate-400">
//                 Attendance records
//               </p>
//             </div>

//             <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
//               ✓
//             </div>
//           </div>
//         </div>

//         {/* Assignments */}

//         <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
//           <div className="flex items-start justify-between">
//             <div>
//               <p className="text-sm font-medium text-slate-500">
//                 Assignments
//               </p>

//               <h2 className="mt-2 text-2xl font-bold text-slate-900">
//                 —
//               </h2>

//               <p className="mt-1 text-xs text-slate-400">
//                 Pending assignments
//               </p>
//             </div>

//             <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-xl">
//               📝
//             </div>
//           </div>
//         </div>

//         {/* Average */}

//         <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
//           <div className="flex items-start justify-between">
//             <div>
//               <p className="text-sm font-medium text-slate-500">
//                 Term Average
//               </p>

//               <h2 className="mt-2 text-2xl font-bold text-slate-900">
//                 —
//               </h2>

//               <p className="mt-1 text-xs text-slate-400">
//                 {termName}
//               </p>
//             </div>

//             <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl">
//               📊
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* =========================
//           MAIN CONTENT
//       ========================== */}

//       <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
//         {/* Student Details */}

//         <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm xl:col-span-2">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-lg font-bold text-slate-900">
//                 My Details
//               </h2>

//               <p className="mt-1 text-sm text-slate-500">
//                 Your current student information
//               </p>
//             </div>

//             {profileImage ? (
//               <img
//                 src={profileImage}
//                 alt={studentName}
//                 className="h-12 w-12 rounded-full object-cover"
//               />
//             ) : (
//               <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
//                 {initial}
//               </div>
//             )}
//           </div>

//           <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
//             <DetailItem
//               label="Full Name"
//               value={studentName}
//             />

//             <DetailItem
//               label="Username"
//               value={user?.username || "—"}
//             />

//             <DetailItem
//               label="Admission Number"
//               value={student?.admission_number}
//             />

//             <DetailItem
//               label="Gender"
//               value={formatValue(student?.gender)}
//             />

//             <DetailItem
//               label="Class"
//               value={className}
//             />

//             <DetailItem
//               label="Academic Session"
//               value={sessionName}
//             />

//             <DetailItem
//               label="Current Term"
//               value={termName}
//             />

//             <DetailItem
//               label="Department"
//               value={departmentName}
//             />

//             <DetailItem
//               label="Roll Number"
//               value={rollNumber}
//             />

//             <DetailItem
//               label="Student Status"
//               value={formatValue(student?.status)}
//             />
//           </div>
//         </div>

//         {/* Current Term */}

//         <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
//           <h2 className="text-lg font-bold text-slate-900">
//             Current Term
//           </h2>

//           <p className="mt-1 text-sm text-slate-500">
//             Academic progress
//           </p>

//           <div className="mt-6 flex items-center justify-center">
//             <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full border-[12px] border-blue-100">
//               <span className="text-3xl font-bold text-slate-900">
//                 —
//               </span>

//               <span className="mt-1 text-xs text-slate-500">
//                 Average
//               </span>
//             </div>
//           </div>

//           <div className="mt-6 space-y-3">
//             <ProgressItem
//               label="Class Performance"
//               value="—"
//               width="0%"
//             />

//             <ProgressItem
//               label="Assignments"
//               value="—"
//               width="0%"
//             />

//             <ProgressItem
//               label="Attendance"
//               value="—"
//               width="0%"
//             />
//           </div>
//         </div>
//       </section>

//       {/* =========================
//           UPCOMING + ANNOUNCEMENTS
//       ========================== */}

//       <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
//         {/* Upcoming Classes */}

//         <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-lg font-bold text-slate-900">
//                 Upcoming Classes
//               </h2>

//               <p className="mt-1 text-sm text-slate-500">
//                 Your next lessons
//               </p>
//             </div>

//             <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
//               Today
//             </span>
//           </div>

//           <div className="mt-5 rounded-xl bg-slate-50 p-5 text-center">
//             <p className="text-sm font-medium text-slate-600">
//               No timetable data available yet.
//             </p>

//             <p className="mt-1 text-xs text-slate-400">
//               Your upcoming classes will appear here.
//             </p>
//           </div>
//         </div>

//         {/* Announcements */}

//         <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
//           <div>
//             <h2 className="text-lg font-bold text-slate-900">
//               Announcements
//             </h2>

//             <p className="mt-1 text-sm text-slate-500">
//               Latest school updates
//             </p>
//           </div>

//           <div className="mt-5 rounded-xl bg-slate-50 p-5 text-center">
//             <p className="text-sm font-medium text-slate-600">
//               No announcements available yet.
//             </p>

//             <p className="mt-1 text-xs text-slate-400">
//               New school announcements will appear here.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* =========================
//           PAYMENT
//       ========================== */}

//       <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
//         <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <h2 className="text-lg font-bold text-slate-900">
//               School Payment
//             </h2>

//             <p className="mt-1 text-sm text-slate-500">
//               Current payment status
//             </p>
//           </div>

//           <span className="w-fit rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500">
//             Payment information unavailable
//           </span>
//         </div>

//         <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
//           <PaymentItem
//             label="School Fees"
//             value="—"
//           />

//           <PaymentItem
//             label="Paid"
//             value="—"
//           />

//           <PaymentItem
//             label="Outstanding"
//             value="—"
//           />
//         </div>
//       </section>

//       {/* =========================
//           CLASSMATES
//           AT THE BOTTOM
//       ========================== */}

//       <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
//         <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <h2 className="text-lg font-bold text-slate-900">
//               Classmates
//             </h2>

//             <p className="text-sm text-slate-500">
//               Students in your current class
//             </p>
//           </div>

//           <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
//             {className}
//           </span>
//         </div>

//         <div className="mt-6 rounded-xl bg-slate-50 p-5 text-center">
//           <p className="text-sm font-medium text-slate-600">
//             Classmates will appear here.
//           </p>

//           <p className="mt-1 text-xs text-slate-400">
//             Your current class is {className}.
//           </p>
//         </div>
//       </section>
//     </div>
//   );
// }

// /* =========================
//    DETAIL ITEM
// ========================= */

// function DetailItem({ label, value }) {
//   const displayValue =
//     value === null ||
//     value === undefined ||
//     value === ""
//       ? "—"
//       : value;

//   return (
//     <div className="rounded-xl bg-slate-50 p-4">
//       <p className="text-xs font-medium text-slate-400">
//         {label}
//       </p>

//       <p className="mt-1 break-words text-sm font-semibold text-slate-800">
//         {displayValue}
//       </p>
//     </div>
//   );
// }

// /* =========================
//    PROGRESS ITEM
// ========================= */

// function ProgressItem({ label, value, width }) {
//   return (
//     <div>
//       <div className="mb-1 flex items-center justify-between">
//         <span className="text-xs font-medium text-slate-500">
//           {label}
//         </span>

//         <span className="text-xs font-semibold text-slate-700">
//           {value}
//         </span>
//       </div>

//       <div className="h-2 overflow-hidden rounded-full bg-slate-100">
//         <div
//           className="h-full rounded-full bg-slate-800"
//           style={{ width }}
//         />
//       </div>
//     </div>
//   );
// }

// /* =========================
//    PAYMENT ITEM
// ========================= */

// function PaymentItem({ label, value }) {
//   return (
//     <div className="rounded-xl bg-slate-50 p-4">
//       <p className="text-xs text-slate-400">
//         {label}
//       </p>

//       <p className="mt-2 text-lg font-bold text-slate-800">
//         {value}
//       </p>
//     </div>
//   );
// }

// /* =========================
//    FORMAT VALUE
// ========================= */

// function formatValue(value) {
//   if (!value) return "—";

//   return String(value)
//     .toLowerCase()
//     .replace(/_/g, " ")
//     .replace(/\b\w/g, (letter) => letter.toUpperCase());
// }

// export default StudentDashboard;






import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getStudent,
  getCurrentStudentEnrollment,
  getStudentClassmates,
} from "../../services/studentsService";
import { getMyReportCards } from "../../services/resultsService";

/* =========================================================
   HELPERS
========================================================= */

const getInitials = (student) => {
  if (!student) return "?";

  if (student.full_name) {
    return student.full_name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((name) => name[0])
      .join("")
      .toUpperCase();
  }

  const first = student.first_name?.[0] || "";
  const last = student.last_name?.[0] || "";

  return `${first}${last}`.toUpperCase() || "?";
};

const getImageUrl = (image) => {
  if (!image) return null;

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  return `${import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"}${image}`;
};

const formatDate = (date) => {
  if (!date) return "—";

  try {
    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return date;
  }
};

/* =========================================================
   CARD HEADER
========================================================= */

function CardHeader({
  icon,
  title,
  subtitle,
  action,
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-blue-50
            text-xl
          "
        >
          {icon}
        </div>

        <div className="min-w-0">
          <h2
            className="
              truncate
              text-base
              font-extrabold
              tracking-tight
              text-slate-800
              sm:text-lg
            "
          >
            {title}
          </h2>

          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {action && (
        <button
          type="button"
          className="
            flex
            shrink-0
            items-center
            gap-1
            text-xs
            font-semibold
            text-blue-700
            transition-all
            duration-300
            hover:gap-2
            hover:underline
            sm:text-sm
          "
        >
          {action}
          <span className="text-lg leading-none">
            ›
          </span>
        </button>
      )}
    </div>
  );
}

/* =========================================================
   DETAIL ROW
========================================================= */

function DetailRow({
  label,
  value,
  status = false,
}) {
  return (
    <div
      className="
        flex
        items-start
        justify-between
        gap-3
        border-b
        border-slate-100
        pb-3
      "
    >
      <span className="shrink-0 text-xs text-slate-400">
        {label}
      </span>

      {status ? (
        <span
          className="
            rounded-full
            bg-emerald-50
            px-2.5
            py-1
            text-[10px]
            font-bold
            uppercase
            text-emerald-600
          "
        >
          {value || "ACTIVE"}
        </span>
      ) : (
        <span
          className="
            max-w-[62%]
            text-right
            text-xs
            font-bold
            leading-5
            text-slate-700
          "
          title={value || "—"}
        >
          {value || "—"}
        </span>
      )}
    </div>
  );
}

/* =========================================================
   STUDENT DETAILS
========================================================= */

function StudentDetails({
  student,
  enrollment,
}) {
  const [imageError, setImageError] = useState(false);

  const fullName =
    student?.full_name ||
    `${student?.first_name || ""} ${
      student?.last_name || ""
    }`.trim() ||
    "Student";

  const profileImage = getImageUrl(
    student?.profile_image
  );

  const className =
    enrollment?.class_name ||
    enrollment?.class_level_name ||
    enrollment?.class_level?.name ||
    "—";

  const sessionName =
    enrollment?.academic_session_name ||
    enrollment?.academic_session?.name ||
    enrollment?.session_name ||
    "—";

  const termName =
    enrollment?.term_name ||
    enrollment?.term?.name ||
    "—";

  const departmentName =
    student?.department_name ||
    enrollment?.department_name ||
    enrollment?.department?.name ||
    "—";

  return (
    <div
      className="
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        shadow-sm
      "
    >
      {/* Header */}
      <div
        className="
          border-b
          border-slate-100
          px-5
          py-5
          sm:px-6
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              bg-blue-50
              text-xl
            "
          >
            👤
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-slate-800">
              Student Details
            </h2>

            <p className="text-xs text-slate-400">
              Your profile information
            </p>
          </div>
        </div>
      </div>

      {/* Student profile */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col items-center text-center">
          {/* Image */}
          <div
            className="
              h-24
              w-24
              overflow-hidden
              rounded-full
              border-4
              border-blue-50
              bg-blue-100
              shadow-md
            "
          >
            {profileImage && !imageError ? (
              <img
                src={profileImage}
                alt={fullName}
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div
                className="
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  text-2xl
                  font-extrabold
                  text-blue-700
                "
              >
                {getInitials(student)}
              </div>
            )}
          </div>

          {/* Name */}
          <h3 className="mt-4 text-lg font-extrabold text-slate-800">
            {fullName}
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Admission Number
          </p>

          <p className="mt-0.5 text-sm font-bold text-slate-600">
            {student?.admission_number || "—"}
          </p>
        </div>

        {/* =================================================
            DETAILS
        ================================================= */}

        <div className="mt-6 space-y-3">

          <DetailRow
            label="Class"
            value={className}
          />

          <DetailRow
            label="Academic Session"
            value={sessionName}
          />

          <DetailRow
            label="Current Term"
            value={termName}
          />

          <DetailRow
            label="Date of Birth"
            value={formatDate(
              student?.date_of_birth
            )}
          />

          <DetailRow
            label="Gender"
            value={student?.gender}
          />

          <DetailRow
            label="Blood Group"
            value={
              student?.blood_group ||
              student?.bloodGroup
            }
          />

          <DetailRow
            label="Nationality"
            value={student?.nationality}
          />

          <DetailRow
            label="State of Origin"
            value={
              student?.state_of_origin ||
              student?.stateOfOrigin
            }
          />

          <DetailRow
            label="Local Government"
            value={
              student?.local_government ||
              student?.localGovernment
            }
          />

          <DetailRow
            label="Department"
            value={departmentName}
          />

          <DetailRow
            label="Status"
            value={student?.status || "ACTIVE"}
            status
          />

        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CURRENT TERM RESULTS
========================================================= */

function CurrentTermResults({
  reportCard,
  loading,
}) {
  const navigate = useNavigate();

  const results = reportCard?.results || [];

  const getSubjectIcon = (subjectName = "") => {
    const name = subjectName.toLowerCase();

    if (name.includes("math")) return "📐";
    if (name.includes("english") || name.includes("language")) return "📚";
    if (name.includes("science") || name.includes("biology")) return "🧬";
    if (name.includes("computer") || name.includes("ict")) return "💻";
    if (name.includes("social") || name.includes("civic")) return "🌍";
    if (name.includes("physics")) return "⚛️";
    if (name.includes("chemistry")) return "🧪";
    if (name.includes("economics") || name.includes("commerce")) return "💼";
    if (name.includes("agric")) return "🌱";
    if (name.includes("literature")) return "📖";

    return "📘";
  };

  const getSubjectBackground = (index) => {
    const backgrounds = [
      "bg-blue-50",
      "bg-emerald-50",
      "bg-purple-50",
      "bg-orange-50",
      "bg-cyan-50",
    ];

    return backgrounds[index % backgrounds.length];
  };

  const formatScore = (score) => {
    if (
      score === null ||
      score === undefined ||
      score === ""
    ) {
      return "0.00";
    }

    return Number(score).toFixed(2);
  };

  const average = Number(reportCard?.average_score || 0);
  const position = reportCard?.position;
  const totalStudents = reportCard?.total_students;

  return (
    <div
      className="
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        sm:p-6
      "
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold text-slate-800">
            Current Term Results
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Your recent subject performance
          </p>
        </div>

        <div className="text-3xl">
          🏆
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="
                flex
                animate-pulse
                items-center
                gap-3
                rounded-2xl
                bg-slate-50
                p-3
              "
            >
              <div className="h-12 w-12 shrink-0 rounded-xl bg-slate-200" />
              <div className="min-w-0 flex-1">
                <div className="h-4 w-32 rounded bg-slate-200" />
                <div className="mt-2 h-3 w-24 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : !reportCard ? (
        <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center">
          <div className="text-3xl">
            📊
          </div>

          <p className="mt-3 text-sm font-bold text-slate-600">
            No current term result yet
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Your published result will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Result summary */}
          <div className="mb-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-blue-50 p-3 text-center">
              <p className="text-[10px] font-semibold uppercase text-slate-400">
                Average
              </p>
              <p className="mt-1 text-lg font-extrabold text-blue-700">
                {formatScore(average)}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-3 text-center">
              <p className="text-[10px] font-semibold uppercase text-slate-400">
                Grade
              </p>
              <p className="mt-1 text-lg font-extrabold text-emerald-700">
                {reportCard.overall_grade || "—"}
              </p>
            </div>

            <div className="rounded-2xl bg-purple-50 p-3 text-center">
              <p className="text-[10px] font-semibold uppercase text-slate-400">
                Position
              </p>
              <p className="mt-1 text-lg font-extrabold text-purple-700">
                {position
                  ? `${position}${totalStudents ? `/${totalStudents}` : ""}`
                  : "—"}
              </p>
            </div>
          </div>

          {/* Subject results */}
          <div className="space-y-3">
            {results.length > 0 ? (
              results.slice(0, 2).map((result, index) => (
                <div
                  key={result.id || `${result.subject_name}-${index}`}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-2xl
                    bg-slate-50
                    p-3
                  "
                >
                  <div
                    className={`
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      text-xl
                      ${getSubjectBackground(index)}
                    `}
                  >
                    {getSubjectIcon(result.subject_name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-700">
                      {result.subject_name || "Subject"}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {formatScore(result.total_score)}
                      {" • "}
                      Grade: {result.grade || "—"}
                    </p>
                  </div>

                  <span className="text-xs font-extrabold text-slate-600">
                    {formatScore(result.total_score)}
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-slate-50 px-4 py-6 text-center">
                <p className="text-sm font-semibold text-slate-500">
                  No subject results available.
                </p>
              </div>
            )}
          </div>

          {/* View full result */}
          <button
            type="button"
            onClick={() =>
              navigate(`/student/results/${reportCard.id}`)
            }
            className="
              mt-5
              w-full
              rounded-xl
              bg-[#1e3a8a]
              px-4
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-[#1d4ed8]
            "
          >
            View Full Result →
          </button>
        </>
      )}
    </div>
  );
}

/* =========================================================
   CLASS PERFORMANCE
========================================================= */

function ClassPerformance() {
  const subjects = [
    {
      name: "Mathematics",
      percentage: 92,
      bar: "bg-blue-500",
    },
    {
      name: "English Language",
      percentage: 88,
      bar: "bg-emerald-400",
    },
    {
      name: "Basic Science",
      percentage: 85,
      bar: "bg-orange-400",
    },
    {
      name: "Social Studies",
      percentage: 80,
      bar: "bg-purple-500",
    },
  ];

  return (
    <div
      className="
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        sm:p-6
      "
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-800">
            Class Performance
          </h2>

          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Your performance in class
          </p>
        </div>

        <div
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            bg-blue-50
            text-xl
          "
        >
          📈
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {subjects.map((subject) => (
          <div key={subject.name}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                {subject.name}
              </span>

              <span className="text-xs font-semibold text-slate-500">
                {subject.percentage}%
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${subject.bar}`}
                style={{
                  width: `${subject.percentage}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   SCHOOL EVENTS
========================================================= */

function SchoolEvents() {
  const events = [
    {
      day: "05",
      month: "MAR",
      title: "Science Quiz Competition",
      location: "School Hall",
      time: "9:00 AM",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      day: "12",
      month: "MAR",
      title: "Inter-House Sports",
      location: "School Field",
      time: "8:00 AM",
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
  ];

  return (
    <div
      className="
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        sm:p-6
      "
    >
      <CardHeader
        icon="📅"
        title="School Event"
        subtitle="Important school activities"
        action="View All"
      />

      <div className="mt-5">
        {events.map((event, index) => (
          <div
            key={event.title}
            className={`
              flex
              items-center
              gap-3
              py-3
              ${
                index !== events.length - 1
                  ? "border-b border-slate-100"
                  : ""
              }
            `}
          >
            <div
              className={`
                flex
                h-14
                w-14
                shrink-0
                flex-col
                items-center
                justify-center
                rounded-xl
                ${event.bg}
              `}
            >
              <span
                className={`text-lg font-extrabold ${event.text}`}
              >
                {event.day}
              </span>

              <span
                className={`text-[9px] font-bold ${event.text}`}
              >
                {event.month}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-700">
                {event.title}
              </p>

              <p className="mt-1 truncate text-xs text-slate-400">
                {event.location} • {event.time}
              </p>
            </div>

            <span className="text-xl text-slate-400">
              ›
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   PAYMENT
========================================================= */

function Payment() {
  return (
    <div
      className="
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        sm:p-6
      "
    >
      <CardHeader
        icon="💳"
        title="Payment"
        subtitle="Fees and payment status"
      />

      <div
        className="
          mt-5
          flex
          items-center
          gap-3
          rounded-2xl
          bg-emerald-50
          p-4
        "
      >
        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-emerald-500
            text-white
          "
        >
          ✓
        </div>

        <div>
          <p className="text-sm font-bold text-emerald-700">
            All fees up to date
          </p>

          <p className="mt-0.5 text-xs text-emerald-600">
            No outstanding payment
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-slate-500">
            Term Fees
          </span>

          <span className="text-sm font-bold text-slate-700">
            ₦45,000
          </span>

          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
            Paid
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-slate-500">
            Other Fees
          </span>

          <span className="text-sm font-bold text-slate-700">
            ₦10,000
          </span>

          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
            Paid
          </span>
        </div>
      </div>

      <button
        type="button"
        className="
          mt-5
          w-full
          rounded-xl
          bg-[#1e3a8a]
          px-4
          py-3
          text-sm
          font-semibold
          text-white
          transition
          hover:bg-[#1d4ed8]
        "
      >
        View Payment History →
      </button>
    </div>
  );
}

/* =========================================================
   CLASSMATE CARD
   Each card has its OWN blue animated background.
========================================================= */

function ClassmateCard({
  student,
  className,
}) {
  const cardRef = useRef(null);

  const [imageError, setImageError] = useState(false);

  const imageUrl = getImageUrl(
    student?.profile_image
  );

  const name =
    student?.full_name ||
    `${student?.first_name || ""} ${
      student?.last_name || ""
    }`.trim() ||
    "Student";

  /* -------------------------------------------------------
     INDIVIDUAL CARD MOUSE SPOTLIGHT
  ------------------------------------------------------- */

  const handleMouseMove = (event) => {
    const card = cardRef.current;

    if (!card) return;

    const rect = card.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    card.style.setProperty(
      "--spot-x",
      `${x}px`
    );

    card.style.setProperty(
      "--spot-y",
      `${y}px`
    );
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="
        classmate-card
        group
        relative
        min-h-[220px]
        overflow-hidden
        rounded-2xl
        border
        border-blue-300/20
        p-4
        text-center
        shadow-lg
        shadow-blue-950/20
        transition-all
        duration-500
        hover:-translate-y-1
        hover:shadow-2xl
        sm:min-h-[230px]
      "
      style={{
        "--spot-x": "50%",
        "--spot-y": "50%",
      }}
    >
      {/* =================================================
          BLUE GRADIENT BACKGROUND
      ================================================= */}

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-br
          from-blue-600
          via-blue-800
          to-slate-950
        "
      />

      {/* =================================================
          MOUSE SPOTLIGHT
      ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-100
        "
        style={{
          background:
            "radial-gradient(280px circle at var(--spot-x) var(--spot-y), rgba(96,165,250,0.45), transparent 65%)",
        }}
      />

      {/* =================================================
          ANIMATED GLOW
      ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          -left-16
          -top-16
          h-40
          w-40
          rounded-full
          bg-blue-400/20
          blur-2xl
          animate-[cardGlow1_7s_ease-in-out_infinite]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-16
          -right-16
          h-40
          w-40
          rounded-full
          bg-cyan-400/10
          blur-2xl
          animate-[cardGlow2_9s_ease-in-out_infinite]
        "
      />

      {/* =================================================
          FLOATING CIRCLES
      ================================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <span
          className="
            absolute
            left-[7%]
            top-[12%]
            h-12
            w-12
            rounded-full
            border
            border-white/10
            animate-[float1_8s_ease-in-out_infinite]
          "
        />

        <span
          className="
            absolute
            left-[75%]
            top-[8%]
            h-3
            w-3
            rounded-full
            bg-blue-200/30
            animate-[float2_6s_ease-in-out_infinite]
          "
        />

        <span
          className="
            absolute
            left-[15%]
            bottom-[15%]
            h-3
            w-3
            rounded-full
            bg-cyan-200/30
            animate-[float3_10s_ease-in-out_infinite]
          "
        />

        <span
          className="
            absolute
            right-[-12%]
            bottom-[-15%]
            h-28
            w-28
            rounded-full
            border
            border-white/10
            animate-[float2_12s_ease-in-out_infinite]
          "
        />

        <span
          className="
            absolute
            left-[50%]
            top-[75%]
            h-2
            w-2
            rounded-full
            bg-white/20
            animate-[float1_5s_ease-in-out_infinite]
          "
        />
      </div>

      {/* =================================================
          CARD CONTENT
      ================================================= */}

      <div className="relative z-10 flex h-full min-h-[190px] flex-col items-center justify-center">
        {/* Profile image */}
        <div
          className="
            h-20
            w-20
            overflow-hidden
            rounded-full
            border-4
            border-white/30
            bg-blue-100
            shadow-2xl
            transition-transform
            duration-500
            group-hover:scale-105
            sm:h-24
            sm:w-24
          "
        >
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className="
                flex
                h-full
                w-full
                items-center
                justify-center
                bg-blue-100
                text-2xl
                font-extrabold
                text-blue-700
              "
            >
              {getInitials(student)}
            </div>
          )}
        </div>

        {/* Name */}
        <p
          className="
            mt-4
            max-w-[90%]
            truncate
            text-sm
            font-bold
            text-white
            sm:text-base
          "
          title={name}
        >
          {name}
        </p>

        {/* Class */}
        <span
          className="
            mt-2
            rounded-full
            bg-white/95
            px-3
            py-1
            text-[10px]
            font-bold
            text-blue-800
            shadow-md
          "
        >
          {className || "Current Class"}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   CLASSMATES
========================================================= */

function Classmates({
  classmates,
  className,
  loading,
}) {
  const [startIndex, setStartIndex] = useState(0);
  const [transitioning, setTransitioning] =
    useState(false);

  /* Reset carousel when data changes */
  useEffect(() => {
    setStartIndex(0);
  }, [classmates]);

  /* Auto change every 3 seconds */
  useEffect(() => {
    if (!classmates || classmates.length <= 3) {
      return;
    }

    const interval = setInterval(() => {
      setTransitioning(true);

      setTimeout(() => {
        setStartIndex(
          (current) =>
            (current + 1) % classmates.length
        );

        setTransitioning(false);
      }, 300);
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [classmates]);

  /* Get maximum 3 students */
  const visibleClassmates = [];

  if (classmates?.length) {
    const amount = Math.min(
      3,
      classmates.length
    );

    for (let i = 0; i < amount; i++) {
      const index =
        (startIndex + i) % classmates.length;

      visibleClassmates.push(
        classmates[index]
      );
    }
  }

  return (
    <div
      className="
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        sm:p-6
      "
    >
      <CardHeader
        icon="👥"
        title="Classmates"
        subtitle={`Students in ${
          className || "your class"
        }`}
        action="View All"
      />

      {/* Loading */}
      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="
                flex
                min-h-[220px]
                animate-pulse
                flex-col
                items-center
                justify-center
                rounded-2xl
                bg-slate-100
              "
            >
              <div className="h-20 w-20 rounded-full bg-slate-200" />

              <div className="mt-4 h-4 w-28 rounded bg-slate-200" />

              <div className="mt-3 h-5 w-16 rounded-full bg-slate-200" />
            </div>
          ))}
        </div>
      ) : visibleClassmates.length === 0 ? (
        <div className="py-12 text-center">
          <div className="text-4xl">
            👥
          </div>

          <p className="mt-3 text-sm font-semibold text-slate-500">
            No classmates found
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Students in your current class will
            appear here.
          </p>
        </div>
      ) : (
        <div
          key={startIndex}
          className={`
            mt-6
            grid
            grid-cols-1
            gap-3
            sm:grid-cols-3
            sm:gap-5
            ${
              transitioning
                ? "animate-[classmatesOut_300ms_ease-in]"
                : "animate-[classmatesIn_500ms_ease-out]"
            }
          `}
        >
          {visibleClassmates.map((student) => (
            <ClassmateCard
              key={student.id}
              student={student}
              className={className}
            />
          ))}
        </div>
      )}

      {/* Carousel indicators */}
      {classmates?.length > 3 && (
        <div className="mt-5 flex justify-center gap-1.5">
          {classmates.map((student, index) => (
            <span
              key={student.id}
              className={`
                h-1.5
                rounded-full
                transition-all
                duration-500
                ${
                  index === startIndex
                    ? "w-6 bg-blue-700"
                    : "w-1.5 bg-slate-300"
                }
              `}
            />
          ))}
        </div>
      )}

      {/* Animations */}
      <style>
        {`
          @keyframes float1 {
            0%, 100% {
              transform: translate(0, 0);
            }

            50% {
              transform: translate(14px, -20px);
            }
          }

          @keyframes float2 {
            0%, 100% {
              transform: translate(0, 0);
            }

            50% {
              transform: translate(-18px, 16px);
            }
          }

          @keyframes float3 {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }

            50% {
              transform: translate(10px, 14px) scale(1.08);
            }
          }

          @keyframes cardGlow1 {
            0%, 100% {
              transform: translate(0, 0) scale(1);
              opacity: 0.45;
            }

            50% {
              transform: translate(35px, 25px) scale(1.25);
              opacity: 0.8;
            }
          }

          @keyframes cardGlow2 {
            0%, 100% {
              transform: translate(0, 0) scale(1);
              opacity: 0.35;
            }

            50% {
              transform: translate(-30px, -20px) scale(1.2);
              opacity: 0.7;
            }
          }

          @keyframes classmatesIn {
            0% {
              opacity: 0;
              transform: translateX(35px);
            }

            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes classmatesOut {
            0% {
              opacity: 1;
              transform: translateX(0);
            }

            100% {
              opacity: 0;
              transform: translateX(-35px);
            }
          }
        `}
      </style>
    </div>
  );
}

/* =========================================================
   ANNOUNCEMENTS
========================================================= */

function Announcements() {
  const announcements = [
    // {
    //   title: "School Resumption Notice",
    //   date: "12 Sep 2026",
    //   dot: "bg-orange-500",
    // },
    // {
    //   title: "Mathematics Quiz Next Week",
    //   date: "10 Sep 2026",
    //   dot: "bg-purple-500",
    // },
    {
      title: "New School Rules",
      date: "08 Sep 2026",
      dot: "bg-blue-500",
    },
    {
      title: "Clean School Campaign",
      date: "05 Sep 2026",
      dot: "bg-emerald-500",
    },
  ];

  return (
    <div
      className="
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        sm:p-6
      "
    >
      <CardHeader
        icon="🔔"
        title="Announcements"
        action="View All"
      />

      <div className="mt-4">
        {announcements.map(
          (announcement, index) => (
            <div
              key={announcement.title}
              className={`
                flex
                items-center
                gap-3
                py-3
                ${
                  index !== announcements.length - 1
                    ? "border-b border-slate-100"
                    : ""
                }
              `}
            >
              <span
                className={`
                  h-3
                  w-3
                  shrink-0
                  rounded-full
                  ${announcement.dot}
                `}
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-700 sm:text-sm">
                  {announcement.title}
                </p>

                <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">
                  {announcement.date}
                </p>
              </div>

              <span className="text-lg text-slate-400">
                ›
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* =========================================================
   STUDENT DASHBOARD
========================================================= */

function StudentDashboard() {
  const { user } = useAuth();

  const [student, setStudent] = useState(null);
  const [enrollment, setEnrollment] =
    useState(null);

  const [classmates, setClassmates] =
    useState([]);

  const [currentTermReport, setCurrentTermReport] =
    useState(null);

  const [reportLoading, setReportLoading] =
    useState(true);

  const [loading, setLoading] =
    useState(true);

  const [classmatesLoading, setClassmatesLoading] =
    useState(true);

  const [error, setError] = useState("");

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?.student_id) {
        setError(
          "No student profile is linked to this account."
        );

        setLoading(false);
        setClassmatesLoading(false);

        return;
      }

      try {
        setLoading(true);
        setClassmatesLoading(true);
        setError("");

        const [
          studentData,
          enrollmentData,
          classmatesData,
          reportCardsData,
        ] = await Promise.all([
          getStudent(user.student_id),

          getCurrentStudentEnrollment(
            user.student_id
          ),

          getStudentClassmates(
            user.student_id
          ),

          getMyReportCards(),
        ]);

        setStudent(studentData);
        setEnrollment(enrollmentData);

        // Only published report cards belonging to this student
        // are returned by getMyReportCards().
        const reportCards = Array.isArray(reportCardsData)
          ? reportCardsData
          : reportCardsData?.results || [];

        const currentSessionId =
          enrollmentData?.academic_session ||
          enrollmentData?.academic_session_id ||
          enrollmentData?.session_id;

        const currentTermId =
          enrollmentData?.term ||
          enrollmentData?.term_id;

        const currentClassId =
          enrollmentData?.class_level ||
          enrollmentData?.class_level_id;

        // Prefer the report card matching the student's current
        // enrollment. Fall back to the newest returned report card
        // when the backend does not expose the IDs.
        const matchingReportCard = reportCards.find((card) => {
          const cardSessionId =
            card?.academic_session ||
            card?.academic_session_id;

          const cardTermId =
            card?.term ||
            card?.term_id;

          const cardClassId =
            card?.class_level ||
            card?.class_level_id;

          const sessionMatches =
            currentSessionId == null ||
            cardSessionId == null ||
            String(cardSessionId) === String(currentSessionId);

          const termMatches =
            currentTermId == null ||
            cardTermId == null ||
            String(cardTermId) === String(currentTermId);

          const classMatches =
            currentClassId == null ||
            cardClassId == null ||
            String(cardClassId) === String(currentClassId);

          return (
            sessionMatches &&
            termMatches &&
            classMatches
          );
        });

        const fallbackReportCard =
          matchingReportCard ||
          reportCards[0] ||
          null;

        setCurrentTermReport(fallbackReportCard);
        setReportLoading(false);

        if (Array.isArray(classmatesData)) {
          setClassmates(classmatesData);
        } else {
          setClassmates(
            classmatesData?.classmates || []
          );
        }
      } catch (err) {
        console.error(
          "Student dashboard error:",
          err
        );

        setReportLoading(false);

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Unable to load student dashboard."
        );
      } finally {
        setLoading(false);
        setClassmatesLoading(false);
        setReportLoading(false);
      }
    };

    loadDashboard();
  }, [user?.student_id]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-[60vh]
          items-center
          justify-center
          bg-[#f4f7fb]
        "
      >
        <div className="text-sm font-medium text-slate-500">
          Loading student dashboard...
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="min-h-full bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
        <div
          className="
            rounded-2xl
            border
            border-red-100
            bg-red-50
            px-4
            py-4
            text-sm
            font-medium
            text-red-600
          "
        >
          {error}
        </div>
      </div>
    );
  }

  /* =======================================================
     CLASS
  ======================================================= */

  const className =
    enrollment?.class_name ||
    enrollment?.class_level_name ||
    enrollment?.class_level?.name ||
    "Current Class";

  /* =======================================================
     DASHBOARD
  ======================================================= */

  return (
    <div
      className="
        min-h-full
        bg-[#f4f7fb]
        p-4
        sm:p-6
        lg:p-8
      "
    >
      {/* =================================================
          WELCOME
      ================================================= */}

      <div className="mb-6">
        <h1
          className="
            text-2xl
            font-extrabold
            tracking-tight
            text-slate-800
            sm:text-3xl
          "
        >
          Welcome back,{" "}
          {student?.first_name ||
            student?.full_name ||
            "Student"}{" "}
          👋
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Here is what's happening with your
          academic activities.
        </p>
      </div>

      {/* =================================================
          MAIN 2/3 + RIGHT SIDEBAR 1/3
      ================================================= */}

      <div
        className="
          grid
          grid-cols-1
          gap-5
          xl:grid-cols-3
          xl:items-start
        "
      >
        {/* =================================================
            MAIN CONTENT — 2/3
        ================================================= */}

        <main
          className="
            min-w-0
            space-y-5
            xl:col-span-2
          "
        >
          {/* Row 1 */}
          <div
            className="
              grid
              grid-cols-1
              gap-5
              lg:grid-cols-2
            "
          >
            <CurrentTermResults
              reportCard={currentTermReport}
              loading={reportLoading}
            />

            <ClassPerformance />
          </div>

          {/* Row 2 */}
          <div
            className="
              grid
              grid-cols-1
              gap-5
              lg:grid-cols-2
            "
          >
            <SchoolEvents />

            <Payment />
          </div>

          {/* Row 3 */}
          <Classmates
            classmates={classmates}
            className={className}
            loading={classmatesLoading}
          />
        </main>

        {/* =================================================
            RIGHT SIDEBAR — 1/3
        ================================================= */}

        <aside
          className="
            min-w-0
            space-y-5
            xl:col-span-1
          "
        >
          {/* Student Details */}
          <StudentDetails
            student={student}
            enrollment={enrollment}
          />

          {/* Announcements BELOW Student Details */}
          <Announcements />
        </aside>
      </div>
    </div>
  );
}

export default StudentDashboard;

