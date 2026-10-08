import { lazy } from "react";
import ComingSoon from "../components/common/ComingSoon";

const ParentDashboard = lazy(
  () => import("../pages/parent/ParentDashboard")
);

const ParentProfile = lazy(
  () => import("../pages/parent/ParentProfile")
);

const MyChildren = lazy(
  () => import("../pages/parent/MyChildren")
);

const ParentAssignments = lazy(
  () => import("../pages/parent/ParentAssignments")
);

const ParentResults = lazy(
  () => import("../pages/parent/ParentResults")
);

const ParentResultDetails = lazy(
  () => import("../pages/parent/ParentResultDetails")
);

const ParentExaminations = lazy(
  () => import("../pages/parent/ParentExaminations")
);

const ParentExaminationDetails = lazy(
  () => import("../pages/parent/ParentExaminationDetails")
);

const ParentFees = lazy(
  () => import("../pages/parent/ParentFees")
);
const ParentAttendance = lazy(
  () => import("../pages/parent/ParentAttendance")
);
// =====================================================
// NOTIFICATIONS
// =====================================================

const ParentNotifications = lazy(
  () => import("../pages/parent/ParentNotifications")
);

const ParentNotificationDetails = lazy(
  () => import("../pages/parent/ParentNotificationDetails")
);

const ParentPersonalSettings = lazy(
  () => import("../pages/parent/ParentPersonalSettings"),
);

export const parentRoutes = [
  {
    path: "",
    index: true,
    label: "Dashboard",
    icon: "⌂",
    element: <ParentDashboard />,
  },

  {
    path: "profile",
    label: "My Profile",
    icon: "👤",
    element: <ParentProfile />,
  },

  {
    path: "children",
    label: "My Children",
    icon: "👨‍👩‍👧‍👦",
    element: <MyChildren />,
  },

 {
  path: "attendance",
  label: "Attendance",
  icon: "✓",
  element: <ParentAttendance />,
},

  {
    path: "assignments",
    label: "Assignments",
    icon: "📝",
    element: <ParentAssignments />,
  },

  {
    path: "results",
    label: "Results",
    icon: "📊",
    element: <ParentResults />,
  },

  {
    path: "results/:id",
    element: <ParentResultDetails />,
  },

  {
    path: "examinations",
    label: "Examinations",
    icon: "📋",
    element: <ParentExaminations />,
  },

  {
    path: "examinations/:id",
    element: <ParentExaminationDetails />,
  },

 

  {
    path: "fees",
    label: "Fees & Payments",
    icon: "💳",
    element: <ParentFees />,
  },

 

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  {
    path: "notifications",
    label: "Notifications",
    icon: "🔔",
    element: <ParentNotifications />,
  },

  {
    path: "notifications/:id",
    element: <ParentNotificationDetails />,
  },

  
{
  path: "settings",
  label: "Settings",
  icon: "⚙",
  element: <ParentPersonalSettings />,
  bottom: true,
},

];