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
import {
  getStudentInvoices,
  getStudentPayments,
} from "../../services/financeService";
import api from "../../services/api";

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

  return (
    `${student.first_name?.[0] || ""}${student.last_name?.[0] || ""}`.toUpperCase() ||
    "?"
  );
};

const getImageUrl = (image) => {
  if (!image) return null;

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  const baseUrl = (
    import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  return `${baseUrl}${image.startsWith("/") ? "" : "/"}${image}`;
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return String(date);

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const unwrapList = (data, keys = []) => {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.results)) return data.results;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
};

const getId = (value) => {
  if (value && typeof value === "object") {
    return value.id ?? value.pk ?? null;
  }

  return value ?? null;
};

/* =========================================================
   SHARED CARD HEADER
========================================================= */

function CardHeader({ icon, title, subtitle, action, onAction }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl">
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-base font-extrabold tracking-tight text-slate-800 sm:text-lg">
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
          onClick={onAction}
          disabled={!onAction}
          className="flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-700 transition-all hover:gap-2 hover:underline disabled:cursor-default disabled:no-underline sm:text-sm"
        >
          {action}
          <span className="text-lg leading-none">›</span>
        </button>
      )}
    </div>
  );
}

/* =========================================================
   DETAIL ROW
========================================================= */

function DetailRow({ label, value, status = false }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
      <span className="shrink-0 text-xs text-slate-400">{label}</span>

      {status ? (
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-600">
          {value || "ACTIVE"}
        </span>
      ) : (
        <span
          className="max-w-[62%] text-right text-xs font-bold leading-5 text-slate-700"
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

function StudentDetails({ student, enrollment }) {
  const [imageError, setImageError] = useState(false);

  const fullName =
    student?.full_name ||
    `${student?.first_name || ""} ${student?.last_name || ""}`.trim() ||
    "Student";

  const profileImage = getImageUrl(student?.profile_image);

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
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-xl">
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

      <div className="p-5 sm:p-6">
        <div className="flex flex-col items-center text-center">
          <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-blue-50 bg-blue-100 shadow-md">
            {profileImage && !imageError ? (
              <img
                src={profileImage}
                alt={fullName}
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-extrabold text-blue-700">
                {getInitials(student)}
              </div>
            )}
          </div>

          <h3 className="mt-4 text-lg font-extrabold text-slate-800">
            {fullName}
          </h3>
          <p className="mt-1 text-xs text-slate-400">Admission Number</p>
          <p className="mt-0.5 text-sm font-bold text-slate-600">
            {student?.admission_number || "—"}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <DetailRow label="Class" value={className} />
          <DetailRow label="Academic Session" value={sessionName} />
          <DetailRow label="Current Term" value={termName} />
          <DetailRow
            label="Date of Birth"
            value={formatDate(student?.date_of_birth)}
          />
          <DetailRow label="Gender" value={student?.gender} />
          <DetailRow
            label="Blood Group"
            value={student?.blood_group || student?.bloodGroup}
          />
          <DetailRow label="Nationality" value={student?.nationality} />
          <DetailRow
            label="State of Origin"
            value={student?.state_of_origin || student?.stateOfOrigin}
          />
          <DetailRow
            label="Local Government"
            value={student?.local_government || student?.localGovernment}
          />
          <DetailRow label="Department" value={departmentName} />
          <DetailRow label="Status" value={student?.status || "ACTIVE"} status />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CURRENT TERM RESULTS
========================================================= */

function CurrentTermResults({ reportCard, loading }) {
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

  const backgrounds = [
    "bg-blue-50",
    "bg-emerald-50",
    "bg-purple-50",
    "bg-orange-50",
    "bg-cyan-50",
  ];

  const formatScore = (score) =>
    score === null || score === undefined || score === ""
      ? "—"
      : Number.isFinite(Number(score))
        ? Number(score).toFixed(2)
        : "—";

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-800">
            Current Term Results
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Your recent subject performance
          </p>
        </div>
        <div className="text-3xl">🏆</div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="flex animate-pulse items-center gap-3 rounded-2xl bg-slate-50 p-3"
            >
              <div className="h-12 w-12 rounded-xl bg-slate-200" />
              <div className="flex-1">
                <div className="h-4 w-32 rounded bg-slate-200" />
                <div className="mt-2 h-3 w-24 rounded bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : !reportCard ? (
        <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center">
          <div className="text-3xl">📊</div>
          <p className="mt-3 text-sm font-bold text-slate-600">
            No current term result yet
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Your published result will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-blue-50 p-3 text-center">
              <p className="text-[10px] font-semibold uppercase text-slate-400">
                Average
              </p>
              <p className="mt-1 text-lg font-extrabold text-blue-700">
                {formatScore(reportCard.average_score)}
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
                {reportCard.position
                  ? `${reportCard.position}${
                      reportCard.total_students
                        ? `/${reportCard.total_students}`
                        : ""
                    }`
                  : "—"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {results.length ? (
              results.slice(0, 2).map((result, index) => (
                <div
                  key={result.id || `${result.subject_name}-${index}`}
                  className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${
                      backgrounds[index % backgrounds.length]
                    }`}
                  >
                    {getSubjectIcon(result.subject_name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-700">
                      {result.subject_name || "Subject"}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Score: {formatScore(result.total_score)} · Grade:{" "}
                      {result.grade || "—"}
                    </p>
                  </div>

                  <span className="text-xs font-extrabold text-slate-600">
                    {formatScore(result.total_score)}
                  </span>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                No subject results available.
              </p>
            )}
          </div>

          {reportCard.id && (
            <button
              type="button"
              onClick={() => navigate(`/student/results/${reportCard.id}`)}
              className="mt-5 w-full rounded-xl bg-[#1e3a8a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]"
            >
              View Full Result →
            </button>
          )}
        </>
      )}
    </div>
  );
}

/* =========================================================
   CLASS PERFORMANCE — REAL REPORT-CARD DATA
========================================================= */

function ClassPerformance({ reportCard, loading }) {
  const results = reportCard?.results || [];

  const subjects = results
    .map((result) => {
      const rawScore = Number(result.total_score);

      if (
        result.total_score === null ||
        result.total_score === undefined ||
        result.total_score === "" ||
        !Number.isFinite(rawScore)
      ) {
        return null;
      }

      // Result scores are displayed as actual marks.
      // The bar is capped at 100% to keep the visual valid.
      return {
        name: result.subject_name || "Subject",
        score: rawScore,
        barWidth: Math.max(0, Math.min(rawScore, 100)),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  const barColors = [
    "bg-blue-500",
    "bg-emerald-400",
    "bg-orange-400",
    "bg-purple-500",
    "bg-cyan-500",
  ];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-800">
            Class Performance
          </h2>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Your scores by subject
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-xl">
          📈
        </div>
      </div>

      {loading ? (
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="animate-pulse">
              <div className="mb-2 h-3 w-32 rounded bg-slate-200" />
              <div className="h-2.5 rounded-full bg-slate-100" />
            </div>
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-8 text-center">
          <div className="text-3xl">📊</div>
          <p className="mt-3 text-sm font-semibold text-slate-600">
            No performance data available
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Your published subject scores will appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 rounded-2xl bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Overall average
            </p>
            <p className="mt-1 text-2xl font-extrabold text-blue-800">
              {reportCard?.average_score !== null &&
              reportCard?.average_score !== undefined &&
              reportCard?.average_score !== ""
                ? Number(reportCard.average_score).toFixed(2)
                : (
                    subjects.reduce((sum, item) => sum + item.score, 0) /
                    subjects.length
                  ).toFixed(2)}
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {subjects.slice(0, 4).map((subject, index) => (
              <div key={`${subject.name}-${index}`}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-sm font-semibold text-slate-700">
                    {subject.name}
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-slate-500">
                    {subject.score.toFixed(2)}
                  </span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      barColors[index % barColors.length]
                    }`}
                    style={{ width: `${subject.barWidth}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================
   NOTIFICATIONS — REPLACES SCHOOL EVENTS
========================================================= */

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      try {
        setLoading(true);
        setUnavailable(false);

        // IMPORTANT:
        // Confirm this route against your backend notification urls.py.
        const response = await api.get("/notifications/");

        if (!active) return;

        setNotifications(
          unwrapList(response.data, [
            "notifications",
            "data",
          ])
        );
      } catch (error) {
        if (!active) return;

        console.error("Unable to load notifications:", error);
        setNotifications([]);
        setUnavailable(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadNotifications();

    return () => {
      active = false;
    };
  }, []);

  const getNotificationTitle = (item) =>
    item.title ||
    item.subject ||
    item.message ||
    item.description ||
    "Notification";

  const getNotificationDate = (item) =>
    item.created_at ||
    item.created ||
    item.date ||
    item.timestamp;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <CardHeader
        icon="🔔"
        title="Notifications"
        subtitle="Updates and important messages"
      />

      {loading ? (
        <div className="mt-5 space-y-4">
          {[1, 2].map((item) => (
            <div key={item} className="flex animate-pulse gap-3">
              <div className="h-3 w-3 rounded-full bg-slate-200" />
              <div className="flex-1">
                <div className="h-3 w-3/4 rounded bg-slate-200" />
                <div className="mt-2 h-3 w-1/3 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : unavailable ? (
        <div className="mt-5 rounded-2xl bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">
            Notifications are temporarily unavailable.
          </p>
          <p className="mt-1 text-xs leading-5 text-amber-700">
            Check that the notification endpoint in this component matches
            your backend URL configuration.
          </p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-8 text-center">
          <div className="text-3xl">🔔</div>
          <p className="mt-3 text-sm font-semibold text-slate-600">
            You're all caught up
          </p>
          <p className="mt-1 text-xs text-slate-400">
            New notifications will appear here.
          </p>
        </div>
      ) : (
        <div className="mt-4">
          {notifications.slice(0, 2).map((item, index) => {
            const isRead =
              item.is_read === true ||
              item.read === true ||
              item.read_at;

            return (
              <div
                key={item.id || item.pk || `${getNotificationTitle(item)}-${index}`}
                className={`flex items-start gap-3 py-3 ${
                  index !== Math.min(notifications.length, 2) - 1
                    ? "border-b border-slate-100"
                    : ""
                }`}
              >
                <span
                  className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                    isRead ? "bg-slate-300" : "bg-blue-500"
                  }`}
                />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-700">
                    {getNotificationTitle(item)}
                  </p>

                  {item.message &&
                    item.message !== getNotificationTitle(item) && (
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                        {item.message}
                      </p>
                    )}

                  <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">
                    {formatDate(getNotificationDate(item))}
                  </p>
                </div>

                {!isRead && (
                  <span className="shrink-0 rounded-full bg-blue-50 px-2 py-1 text-[9px] font-bold text-blue-700">
                    NEW
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PAYMENT — REAL INVOICES AND PAYMENTS
========================================================= */

function Payment() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    let active = true;

    const loadFinance = async () => {
      try {
        setLoading(true);
        setError("");

        const [invoiceResponse, paymentResponse] = await Promise.all([
          getStudentInvoices(),
          getStudentPayments(),
        ]);

        if (!active) return;

        setInvoices(
          unwrapList(invoiceResponse, ["invoices", "data"])
        );

        setPayments(
          unwrapList(paymentResponse, ["payments", "data"])
        );
      } catch (err) {
        if (!active) return;

        console.error("Unable to load student finance:", err);

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Unable to load payment information."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadFinance();

    return () => {
      active = false;
    };
  }, []);

  const totalInvoiced = invoices.reduce(
    (sum, invoice) =>
      sum +
      Math.max(
        0,
        Number(invoice.amount || 0) -
          Number(invoice.discount || 0)
      ),
    0
  );

  const totalOutstanding = invoices.reduce(
    (sum, invoice) => sum + Math.max(0, Number(invoice.balance || 0)),
    0
  );

  const totalPaid = invoices.reduce(
    (sum, invoice) => sum + Math.max(0, Number(invoice.amount_paid || 0)),
    0
  );

  const recentPayments = payments
    .filter((payment) =>
      ["SUCCESSFUL", "SUCCESS", "COMPLETED"].includes(
        String(payment.status || "").toUpperCase()
      )
    )
    .slice(0, 3);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <CardHeader
        icon="💳"
        title="Payment"
        subtitle="Fees and payment status"
      />

      {loading ? (
        <div className="mt-5 space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-12 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        </div>
      ) : error ? (
        <div className="mt-5 rounded-2xl bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">
            Payment information unavailable
          </p>
          <p className="mt-1 text-xs leading-5 text-amber-700">
            {error}
          </p>
        </div>
      ) : (
        <>
          <div
            className={`mt-5 flex items-center gap-3 rounded-2xl p-4 ${
              totalOutstanding > 0
                ? "bg-amber-50"
                : "bg-emerald-50"
            }`}
          >
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${
                totalOutstanding > 0
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
            >
              {totalOutstanding > 0 ? "!" : "✓"}
            </div>

            <div className="min-w-0">
              <p
                className={`text-sm font-bold ${
                  totalOutstanding > 0
                    ? "text-amber-800"
                    : "text-emerald-700"
                }`}
              >
                {totalOutstanding > 0
                  ? "Outstanding fees"
                  : invoices.length
                    ? "No outstanding balance"
                    : "No invoices available"}
              </p>

              <p
                className={`mt-0.5 text-xs ${
                  totalOutstanding > 0
                    ? "text-amber-700"
                    : "text-emerald-600"
                }`}
              >
                {totalOutstanding > 0
                  ? `${formatMoney(totalOutstanding)} remaining`
                  : invoices.length
                    ? "Your recorded invoices are settled."
                    : "Your invoices will appear here when issued."}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Total billed</p>
              <p className="mt-1 break-words text-sm font-extrabold text-slate-800">
                {formatMoney(totalInvoiced)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Total paid</p>
              <p className="mt-1 break-words text-sm font-extrabold text-emerald-700">
                {formatMoney(totalPaid)}
              </p>
            </div>
          </div>

          {invoices.length > 0 && (
            <div className="mt-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-700">
                Recent invoices
              </h3>

              {invoices.slice(0, 3).map((invoice, index) => {
                const balance = Math.max(
                  0,
                  Number(invoice.balance || 0)
                );

                const status = String(
                  invoice.status || "UNKNOWN"
                ).toUpperCase();

                const paid = balance <= 0 || status === "PAID";

                return (
                  <div
                    key={invoice.id || invoice.invoice_number || index}
                    className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-700">
                        {invoice.fee_category_name ||
                          invoice.description ||
                          invoice.invoice_number ||
                          "School fees"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Due: {formatDate(invoice.due_date)}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-slate-700">
                        {formatMoney(invoice.amount)}
                      </p>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-1 text-[9px] font-bold ${
                          paid
                            ? "bg-emerald-50 text-emerald-700"
                            : status === "OVERDUE"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {paid ? "PAID" : status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowHistory((current) => !current)}
            className="mt-5 w-full rounded-xl bg-[#1e3a8a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]"
          >
            {showHistory ? "Hide Payment History ↑" : "View Payment History →"}
          </button>

          {showHistory && (
            <div className="mt-4">
              <h3 className="mb-3 text-sm font-bold text-slate-700">
                Successful payments
              </h3>

              {recentPayments.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-center text-xs text-slate-500">
                  No successful payments have been recorded.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentPayments.map((payment, index) => (
                    <div
                      key={payment.id || payment.reference || index}
                      className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-700">
                          {payment.invoice_number ||
                            payment.reference ||
                            "Payment"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(payment.payment_date)}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-emerald-700">
                        {formatMoney(payment.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* =========================================================
   CLASSMATE CARD
========================================================= */

function ClassmateCard({ student, className }) {
  const cardRef = useRef(null);
  const [imageError, setImageError] = useState(false);

  const imageUrl = getImageUrl(student?.profile_image);

  const name =
    student?.full_name ||
    `${student?.first_name || ""} ${student?.last_name || ""}`.trim() ||
    "Student";

  const handleMouseMove = (event) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();

    cardRef.current.style.setProperty(
      "--spot-x",
      `${event.clientX - rect.left}px`
    );

    cardRef.current.style.setProperty(
      "--spot-y",
      `${event.clientY - rect.top}px`
    );
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="group relative min-h-[220px] overflow-hidden rounded-2xl border border-blue-300/20 p-4 text-center shadow-lg shadow-blue-950/20 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl sm:min-h-[230px]"
      style={{ "--spot-x": "50%", "--spot-y": "50%" }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-800 to-slate-950" />

      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(280px circle at var(--spot-x) var(--spot-y), rgba(96,165,250,0.45), transparent 65%)",
        }}
      />

      <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 animate-[cardGlow1_7s_ease-in-out_infinite] rounded-full bg-blue-400/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 animate-[cardGlow2_9s_ease-in-out_infinite] rounded-full bg-cyan-400/10 blur-2xl" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <span className="absolute left-[7%] top-[12%] h-12 w-12 animate-[float1_8s_ease-in-out_infinite] rounded-full border border-white/10" />
        <span className="absolute left-[75%] top-[8%] h-3 w-3 animate-[float2_6s_ease-in-out_infinite] rounded-full bg-blue-200/30" />
        <span className="absolute bottom-[15%] left-[15%] h-3 w-3 animate-[float3_10s_ease-in-out_infinite] rounded-full bg-cyan-200/30" />
        <span className="absolute -bottom-[15%] -right-[12%] h-28 w-28 animate-[float2_12s_ease-in-out_infinite] rounded-full border border-white/10" />
      </div>

      <div className="relative z-10 flex h-full min-h-[190px] flex-col items-center justify-center">
        <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white/30 bg-blue-100 shadow-2xl transition-transform duration-500 group-hover:scale-105 sm:h-24 sm:w-24">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-blue-100 text-2xl font-extrabold text-blue-700">
              {getInitials(student)}
            </div>
          )}
        </div>

        <p
          className="mt-4 max-w-[90%] truncate text-sm font-bold text-white sm:text-base"
          title={name}
        >
          {name}
        </p>

        <span className="mt-2 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold text-blue-800 shadow-md">
          {className || "Current Class"}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   CLASSMATES
========================================================= */

function Classmates({ classmates, className, loading }) {
  const [startIndex, setStartIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    setStartIndex(0);
  }, [classmates]);

  useEffect(() => {
    if (!classmates || classmates.length <= 3) return;

    const interval = setInterval(() => {
      setTransitioning(true);

      setTimeout(() => {
        setStartIndex((current) => (current + 1) % classmates.length);
        setTransitioning(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [classmates]);

  const visibleClassmates = [];

  if (classmates?.length) {
    const amount = Math.min(3, classmates.length);

    for (let i = 0; i < amount; i++) {
      visibleClassmates.push(
        classmates[(startIndex + i) % classmates.length]
      );
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <CardHeader
        icon="👥"
        title="Classmates"
        subtitle={`Students in ${className || "your class"}`}
      />

      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex min-h-[220px] animate-pulse flex-col items-center justify-center rounded-2xl bg-slate-100"
            >
              <div className="h-20 w-20 rounded-full bg-slate-200" />
              <div className="mt-4 h-4 w-28 rounded bg-slate-200" />
              <div className="mt-3 h-5 w-16 rounded-full bg-slate-200" />
            </div>
          ))}
        </div>
      ) : visibleClassmates.length === 0 ? (
        <div className="py-12 text-center">
          <div className="text-4xl">👥</div>
          <p className="mt-3 text-sm font-semibold text-slate-500">
            No classmates found
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Students in your current class will appear here.
          </p>
        </div>
      ) : (
        <div
          key={startIndex}
          className={`mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5 ${
            transitioning
              ? "animate-[classmatesOut_300ms_ease-in]"
              : "animate-[classmatesIn_500ms_ease-out]"
          }`}
        >
          {visibleClassmates.map((student, index) => (
            <ClassmateCard
              key={student.id || index}
              student={student}
              className={className}
            />
          ))}
        </div>
      )}

      {classmates?.length > 3 && (
        <div className="mt-5 flex justify-center gap-1.5">
          {classmates.map((student, index) => (
            <span
              key={student.id || index}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === startIndex ? "w-6 bg-blue-700" : "w-1.5 bg-slate-300"
              }`}
            />
          ))}
        </div>
      )}

      <style>
        {`
          @keyframes float1 {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(14px, -20px); }
          }
          @keyframes float2 {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(-18px, 16px); }
          }
          @keyframes float3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(10px, 14px) scale(1.08); }
          }
          @keyframes cardGlow1 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: .45; }
            50% { transform: translate(35px, 25px) scale(1.25); opacity: .8; }
          }
          @keyframes cardGlow2 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: .35; }
            50% { transform: translate(-30px, -20px) scale(1.2); opacity: .7; }
          }
          @keyframes classmatesIn {
            0% { opacity: 0; transform: translateX(35px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          @keyframes classmatesOut {
            0% { opacity: 1; transform: translateX(0); }
            100% { opacity: 0; transform: translateX(-35px); }
          }
        `}
      </style>
    </div>
  );
}

/* =========================================================
   STUDENT DASHBOARD
========================================================= */

function StudentDashboard() {
  const { user } = useAuth();

  const [student, setStudent] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [classmates, setClassmates] = useState([]);
  const [currentTermReport, setCurrentTermReport] = useState(null);

  const [reportLoading, setReportLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [classmatesLoading, setClassmatesLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      if (!user?.student_id) {
        setError("No student profile is linked to this account.");
        setLoading(false);
        setReportLoading(false);
        setClassmatesLoading(false);
        return;
      }

      try {
        setLoading(true);
        setReportLoading(true);
        setClassmatesLoading(true);
        setError("");

        // Each section can fail independently so a failed report-card
        // or classmates request does not hide the entire dashboard.
        const [studentResult, enrollmentResult, classmatesResult, reportsResult] =
          await Promise.allSettled([
            getStudent(user.student_id),
            getCurrentStudentEnrollment(user.student_id),
            getStudentClassmates(user.student_id),
            getMyReportCards(),
          ]);

        if (!active) return;

        if (studentResult.status === "rejected") {
          throw studentResult.reason;
        }

        setStudent(studentResult.value);

        if (enrollmentResult.status === "fulfilled") {
          setEnrollment(enrollmentResult.value);
        } else {
          console.error("Unable to load current enrollment:", enrollmentResult.reason);
          setEnrollment(null);
        }

        if (classmatesResult.status === "fulfilled") {
          const data = classmatesResult.value;

          setClassmates(
            Array.isArray(data)
              ? data
              : data?.classmates || data?.results || []
          );
        } else {
          console.error("Unable to load classmates:", classmatesResult.reason);
          setClassmates([]);
        }

        if (reportsResult.status === "fulfilled") {
          const data = reportsResult.value;
          const reportCards = unwrapList(data, ["report_cards", "data"]);

          const enrollmentData =
            enrollmentResult.status === "fulfilled"
              ? enrollmentResult.value
              : null;

          const currentSessionId = getId(
            enrollmentData?.academic_session ??
              enrollmentData?.academic_session_id ??
              enrollmentData?.session_id
          );

          const currentTermId = getId(
            enrollmentData?.term ?? enrollmentData?.term_id
          );

          const currentClassId = getId(
            enrollmentData?.class_level ?? enrollmentData?.class_level_id
          );

          const matchingReport = reportCards.find((card) => {
            const sessionId = getId(
              card?.academic_session ?? card?.academic_session_id
            );
            const termId = getId(card?.term ?? card?.term_id);
            const classId = getId(
              card?.class_level ?? card?.class_level_id
            );

            const sessionMatches =
              currentSessionId == null ||
              sessionId == null ||
              String(sessionId) === String(currentSessionId);

            const termMatches =
              currentTermId == null ||
              termId == null ||
              String(termId) === String(currentTermId);

            const classMatches =
              currentClassId == null ||
              classId == null ||
              String(classId) === String(currentClassId);

            return sessionMatches && termMatches && classMatches;
          });

          setCurrentTermReport(matchingReport || reportCards[0] || null);
        } else {
          console.error("Unable to load report cards:", reportsResult.reason);
          setCurrentTermReport(null);
        }
      } catch (err) {
        if (!active) return;

        console.error("Student dashboard error:", err);

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            "Unable to load student dashboard."
        );
      } finally {
        if (active) {
          setLoading(false);
          setReportLoading(false);
          setClassmatesLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, [user?.student_id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f4f7fb]">
        <div className="text-sm font-medium text-slate-500">
          Loading student dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-4 text-sm font-medium text-red-600">
          {error}
        </div>
      </div>
    );
  }

  const className =
    enrollment?.class_name ||
    enrollment?.class_level_name ||
    enrollment?.class_level?.name ||
    "Current Class";

  return (
    <div className="min-h-full bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl">
          Welcome back,{" "}
          {student?.first_name || student?.full_name || "Student"} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here is what's happening with your academic activities.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3 xl:items-start">
        <main className="min-w-0 space-y-5 xl:col-span-2">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <CurrentTermResults
              reportCard={currentTermReport}
              loading={reportLoading}
            />

            <ClassPerformance
              reportCard={currentTermReport}
              loading={reportLoading}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Notifications />
            <Payment />
          </div>

          <Classmates
            classmates={classmates}
            className={className}
            loading={classmatesLoading}
          />
        </main>

        <aside className="min-w-0 space-y-5 xl:col-span-1">
          <StudentDetails
            student={student}
            enrollment={enrollment}
          />
        </aside>
      </div>
    </div>
  );
}

export default StudentDashboard;
