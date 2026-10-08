import { lazy } from "react";
import ComingSoon from "../components/common/ComingSoon";

// =====================================================
// TEACHER PAGES
// =====================================================

const TeacherDashboard = lazy(
  () => import("../pages/teacher/TeacherDashboard"),
);

const TeacherProfile = lazy(
  () => import("../pages/teacher/TeacherProfile"),
);

const TeacherStudents = lazy(
  () => import("../pages/teacher/TeacherStudents"),
);

const TeacherAttendance = lazy(
  () => import("../pages/teacher/TeacherAttendance"),
);

// =====================================================
// ASSIGNMENTS
// =====================================================

import TeacherAssignments from "../pages/teacher/assignments/TeacherAssignments";
import TeacherAssignmentDetails from "../pages/teacher/assignments/TeacherAssignmentDetails";
import CreateAssignment from "../pages/teacher/assignments/CreateAssignment";
import EditAssignment from "../pages/teacher/assignments/EditAssignment";

const TeacherExaminations = lazy(
  () => import("../pages/teacher/TeacherExaminations"),
);

const TeacherSubmissionDetails = lazy(
  () =>
    import(
      "../pages/teacher/assignments/TeacherSubmissionDetails"
    ),
);

const TeacherExaminationDetails = lazy(
  () => import("../pages/teacher/TeacherExaminationDetails"),
);

const TeacherResults = lazy(
  () => import("../pages/teacher/TeacherResults"),
);

const TeacherReportCards = lazy(
  () => import("../pages/teacher/TeacherReportCards"),
);

const TeacherReportCardDetails = lazy(
  () => import("../pages/teacher/TeacherReportCardDetails"),
);

// =====================================================
// NOTIFICATIONS
// =====================================================

const TeacherNotifications = lazy(
  () =>
    import(
      "../pages/teacher/notifications/TeacherNotifications"
    ),
);

const ComposeTeacherNotification = lazy(
  () =>
    import(
      "../pages/teacher/notifications/ComposeTeacherNotification"
    ),
);

// =====================================================
// TEACHER ROUTES
// =====================================================

export const teacherRoutes = [
  // ---------------------------------------------------
  // DASHBOARD
  // ---------------------------------------------------
  {
    path: "",
    index: true,
    label: "Dashboard",
    icon: "⌂",
    element: <TeacherDashboard />,
  },

  // ---------------------------------------------------
  // PROFILE
  // ---------------------------------------------------
  {
    path: "profile",
    label: "My Profile",
    icon: "👤",
    element: <TeacherProfile />,
  },

  // ---------------------------------------------------
  // STUDENTS
  // ---------------------------------------------------
  {
    path: "students",
    label: "My Students",
    icon: "👨‍🎓",
    element: <TeacherStudents />,
  },

  // ---------------------------------------------------
  // CLASSES
  // ---------------------------------------------------
  {
    path: "classes",
    label: "My Classes",
    icon: "🏫",
    element: <ComingSoon title="My Classes" />,
  },

  // ---------------------------------------------------
  // SUBJECTS
  // ---------------------------------------------------
  {
    path: "subjects",
    label: "My Subjects",
    icon: "📚",
    element: <ComingSoon title="My Subjects" />,
  },

  // ---------------------------------------------------
  // ATTENDANCE
  // ---------------------------------------------------
  {
    path: "attendance",
    label: "Attendance",
    icon: "✓",
    element: <TeacherAttendance />,
  },

  // ---------------------------------------------------
  // ASSIGNMENTS
  // ---------------------------------------------------
  {
    path: "assignments",
    label: "Assignments",
    icon: "📝",
    element: <TeacherAssignments />,
  },

  {
    path: "assignments/create",
    element: <CreateAssignment />,
    hideInNav: true,
  },

  {
    path: "assignments/:id",
    element: <TeacherAssignmentDetails />,
    hideInNav: true,
  },

  {
    path: "assignments/:id/edit",
    element: <EditAssignment />,
    hideInNav: true,
  },

  {
    path: "assignments/:id/submissions/:submissionId",
    element: <TeacherSubmissionDetails />,
    hideInNav: true,
  },

  // ---------------------------------------------------
  // EXAMINATIONS
  // ---------------------------------------------------
  {
    path: "examinations",
    label: "Examinations",
    icon: "📋",
    element: <TeacherExaminations />,
  },

  {
    path: "examinations/:id",
    element: <TeacherExaminationDetails />,
    hideInNav: true,
  },

  // ---------------------------------------------------
  // RESULTS
  // ---------------------------------------------------
  {
    path: "results",
    label: "Results",
    icon: "📊",
    element: <TeacherResults />,
  },

  // ---------------------------------------------------
  // REPORT CARDS
  // ---------------------------------------------------
  {
    path: "report-cards",
    label: "Report Cards",
    icon: "📄",
    element: <TeacherReportCards />,
  },

  {
    path: "report-cards/:id",
    element: <TeacherReportCardDetails />,
  },

  // ---------------------------------------------------
  // TIMETABLE
  // ---------------------------------------------------
  {
    path: "timetable",
    label: "Timetable",
    icon: "🗓",
    element: <ComingSoon title="Timetable" />,
  },

  // ---------------------------------------------------
  // COMMUNICATION
  // ---------------------------------------------------
  {
    path: "communication",
    label: "Communication",
    icon: "💬",
    element: <ComingSoon title="Communication" />,
  },

  // ---------------------------------------------------
  // NOTIFICATIONS
  // ---------------------------------------------------
  {
    path: "notifications",
    label: "Notifications",
    icon: "🔔",
    element: <TeacherNotifications />,
  },

  {
    path: "notifications/compose",
    element: <ComposeTeacherNotification />,
    hideInNav: true,
  },

  // ---------------------------------------------------
  // DOCUMENTS
  // ---------------------------------------------------
  {
    path: "documents",
    label: "Documents",
    icon: "📄",
    element: <ComingSoon title="Documents" />,
  },

  // ---------------------------------------------------
  // REPORTS
  // ---------------------------------------------------
  {
    path: "reports",
    label: "Reports",
    icon: "📈",
    element: <ComingSoon title="Reports" />,
  },

  // ---------------------------------------------------
  // SETTINGS
  // ---------------------------------------------------
  {
    path: "settings",
    label: "Settings",
    icon: "⚙",
    element: <ComingSoon title="Settings" />,
    bottom: true,
  },
];