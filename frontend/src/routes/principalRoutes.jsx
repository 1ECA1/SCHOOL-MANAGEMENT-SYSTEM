import { lazy } from "react";
import ComingSoon from "../components/common/ComingSoon";

// =====================================================
// BUILT PAGES
// =====================================================

const PrincipalDashboard = lazy(
  () => import("../pages/principal/PrincipalDashboard"),
);

const PrincipalStudents = lazy(
  () => import("../pages/principal/PrincipalStudents"),
);

const PrincipalProfile = lazy(
  () => import("../pages/principal/PrincipalProfile"),
);

// =====================================================
// ASSIGNMENTS
// =====================================================

const PrincipalAssignments = lazy(
  () =>
    import(
      "../pages/principal/assignments/PrincipalAssignments"
    ),
);

const PrincipalAssignmentDetails = lazy(
  () =>
    import(
      "../pages/principal/assignments/PrincipalAssignmentDetails"
    ),
);

const CreatePrincipalAssignment = lazy(
  () =>
    import(
      "../pages/principal/assignments/CreatePrincipalAssignment"
    ),
);


const PrincipalExaminations = lazy(
  () => import("../pages/principal/examinations/PrincipalExaminations"),
);

const PrincipalResults = lazy(
  () => import("../pages/principal/results/PrincipalResults"),
);

const PrincipalResultDetails = lazy(
  () => import("../pages/principal/results/PrincipalResultDetails"),

);

const PrincipalAddResult = lazy(
  () => import("../pages/principal/results/AddResult"),
);

const PrincipalEditResult = lazy(
  () => import("../pages/principal/results/EditResult"),
);
const PrincipalFinance = lazy(
  () => import("../pages/principal/finance/PrincipalFinance"),
);

const PrincipalNotifications = lazy(
  () =>
    import(
      "../pages/principal/notifications/PrincipalNotifications"
    ),
);

const ComposePrincipalNotification = lazy(
  () =>
    import(
      "../pages/principal/notifications/ComposePrincipalNotification"
    ),
);

const PrincipalPersonalSettings = lazy(
  () => import("../pages/principal/PrincipalPersonalSettings"),
);

// const EditPrincipalAssignment = lazy(
//   () =>
//     import(
//       "../pages/principal/assignments/EditPrincipalAssignment"
//     ),
// );

// =====================================================
// PRINCIPAL ROUTES
// =====================================================

export const principalRoutes = [

  // ===================================================
  // DASHBOARD
  // ===================================================

  {
    path: "",
    index: true,
    label: "Dashboard",
    icon: "▦",
    element: <PrincipalDashboard />,
  },

  // ===================================================
  // STUDENTS
  // ===================================================

  {
    path: "students",
    label: "Students",
    icon: "👨‍🎓",
    element: <PrincipalStudents />,
  },

  // ===================================================
  // TEACHERS
  // ===================================================

  {
    path: "teachers",
    label: "Teachers",
    icon: "👨‍🏫",
    element: <ComingSoon title="Teachers" />,
  },

  // ===================================================
  // PARENTS
  // ===================================================

  {
    path: "parents",
    label: "Parents",
    icon: "👨‍👩‍👧",
    element: <ComingSoon title="Parents" />,
  },


  

  {
    path: "academic/terms",
    element: <ComingSoon title="Terms" />,
    hideInNav: true,
  },

  {
    path: "academic/sessions",
    element: <ComingSoon title="Sessions" />,
    hideInNav: true,
  },

  // ===================================================
  // ATTENDANCE
  // ===================================================

  {
    path: "attendance",
    label: "Attendance",
    icon: "📝",
    element: <ComingSoon title="Attendance" />,
  },

  // ===================================================
  // ASSIGNMENTS
  // ===================================================

  {
    path: "assignments",
    label: "Assignments",
    icon: "📝",
    element: <PrincipalAssignments />,
  },

  {
    path: "assignments/create",
    element: <CreatePrincipalAssignment />,
    hideInNav: true,
  },

  {
    path: "assignments/:id",
    element: <PrincipalAssignmentDetails />,
    hideInNav: true,
  },

  // {
  //   path: "assignments/:id/edit",
  //   element: <EditPrincipalAssignment />,
  //   hideInNav: true,
  // },

  // ===================================================
  // EXAMINATIONS
  // ===================================================

{
  path: "examinations",
  label: "Examinations",
  icon: "📋",
  element: <PrincipalExaminations />,
},


  // ===================================================
  // RESULTS
  // ===================================================

{
  path: "results",
  label: "Results",
  icon: "📊",
  element: <PrincipalResults />,
},
{
  path: "results/add",
  element: <PrincipalAddResult />,
  hideInNav: true,
},
{
  path: "results/:id/edit",
  element: <PrincipalEditResult />,
  hideInNav: true,
},
{
  path: "results/:id",
  element: <PrincipalResultDetails />,
  hideInNav: true,
},

  // ===================================================
  // LIBRARY
  // ===================================================

  {
    path: "library",
    label: "Library",
    icon: "📚",
    element: <ComingSoon title="Library" />,
  },

  // ===================================================
  // FINANCE
  // ===================================================

{
  path: "finance",
  label: "Finance",
  icon: "💰",
  element: <PrincipalFinance />,
},

 

  // ===================================================
  // NOTIFICATIONS
  // ===================================================
{
  path: "notifications",
  label: "Notifications",
  icon: "🔔",
  element: <PrincipalNotifications />,
},
{
  path: "notifications/compose",
  element: <ComposePrincipalNotification />,
  hideInNav: true,
},



  // ===================================================
  // PROFILE
  // ===================================================

  {
    path: "profile",
    label: "Profile",
    icon: "◯",
    element: <PrincipalProfile />,
  },

  
// ===================================================
// SETTINGS
// ===================================================

{
  path: "settings",
  label: "Settings",
  icon: "⚙",
  element: <PrincipalPersonalSettings />,
  bottom: true,
},
];