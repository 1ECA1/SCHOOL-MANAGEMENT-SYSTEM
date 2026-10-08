// import { lazy } from "react";

// const StudentDashboard = lazy(
//   () => import("../pages/student/StudentDashboard"),
// );

// const StudentProfile = lazy(() => import("../pages/student/StudentProfile"));

// const StudentSubjects = lazy(() => import("../pages/student/StudentSubjects"));

// const StudentResults = lazy(() => import("../pages/student/StudentResults"));

// const StudentResultDetails = lazy(
//   () => import("../pages/student/StudentResultDetails"),
// );

// const StudentParents = lazy(
//   () => import("../pages/student/StudentParents"),
// );

// import StudentAssignmentDetails from "../pages/student/StudentAssignmentDetails";
// import StudentAttendance from "../pages/student/StudentAttendance";
// import StudentAssignments from "../pages/student/StudentAssignments";

// export const studentRoutes = [
//   {
//     index: true,
//     element: <StudentDashboard />,
//   },

//   {
//     path: "profile",
//     element: <StudentProfile />,
//   },

//   {
//     path: "subjects",
//     element: <StudentSubjects />,
//   },

//   {
//     path: "results",
//     element: <StudentResults />,
//   },

//   {
//     path: "results/:id",
//     element: <StudentResultDetails />,
//   },

//   {
//     path: "attendance",
//     element: <StudentAttendance/>,
//   },

//   {
//   path: "parents",
//   element: <StudentParents />,
// },
// {
//     path: "assignments",
//   element: <StudentAssignments />

// },

// {

//   path: "/student/:id",
//   element: <StudentAssignmentDetails />

// }

// ];

// import { lazy } from "react";

// const StudentDashboard = lazy(
//   () => import("../pages/student/StudentDashboard"),
// );

// const StudentProfile = lazy(
//   () => import("../pages/student/StudentProfile"),
// );

// const StudentSubjects = lazy(
//   () => import("../pages/student/StudentSubjects"),
// );

// const StudentResults = lazy(
//   () => import("../pages/student/StudentResults"),
// );

// const StudentResultDetails = lazy(
//   () => import("../pages/student/StudentResultDetails"),
// );

// const StudentParents = lazy(
//   () => import("../pages/student/StudentParents"),
// );

// import StudentAttendance from "../pages/student/StudentAttendance";
// import StudentAssignments from "../pages/student/StudentAssignments";
// import StudentAssignmentDetails from "../pages/student/StudentAssignmentDetails";
// import StudentFees from "../pages/student/StudentFees";

// export const studentRoutes = [
//   {
//     index: true,
//     element: <StudentDashboard />,
//   },

//   {
//     path: "profile",
//     element: <StudentProfile />,
//   },

//   {
//     path: "subjects",
//     element: <StudentSubjects />,
//   },

//   {
//     path: "results",
//     element: <StudentResults />,
//   },

//   {
//     path: "results/:id",
//     element: <StudentResultDetails />,
//   },

//   {
//     path: "attendance",
//     element: <StudentAttendance />,
//   },

//   {
//     path: "parents",
//     element: <StudentParents />,
//   },

//   {
//     path: "assignments",
//     element: <StudentAssignments />,
//   },

//   {
//     path: "assignments/:id",
//     element: <StudentAssignmentDetails />,
//   },

//   {
//   path: "/fees",
//   element: <StudentFees />,
// },
// ];

import StudentDashboard from "../pages/student/StudentDashboard";
import StudentProfile from "../pages/student/StudentProfile";
import StudentSubjects from "../pages/student/StudentSubjects";
import StudentAttendance from "../pages/student/StudentAttendance";
import StudentAssignments from "../pages/student/StudentAssignments";
import StudentAssignmentDetails from "../pages/student/StudentAssignmentDetails";
import StudentResults from "../pages/student/StudentResults";
import StudentResultDetails from "../pages/student/StudentResultDetails";
import StudentParents from "../pages/student/StudentParents";
import StudentFees from "../pages/student/StudentFees";
import StudentPaymentReceipt from "../pages/student/StudentPaymentReceipt";

import StudentExaminations from "../pages/student/StudentExaminations";
import StudentExaminationDetails from "../pages/student/StudentExaminationDetails";
import StudentNotifications from "../pages/student/StudentNotifications";
import StudentNotificationDetails from "../pages/student/StudentNotificationDetails";

export const studentRoutes = [
  {
    index: true,
    element: <StudentDashboard />,
  },
  {
    path: "profile",
    element: <StudentProfile />,
  },
  {
    path: "subjects",
    element: <StudentSubjects />,
  },
  {
    path: "attendance",
    element: <StudentAttendance />,
  },
  {
    path: "assignments",
    element: <StudentAssignments />,
  },
  {
    path: "assignments/:id",
    element: <StudentAssignmentDetails />,
  },
  {
    path: "results",
    element: <StudentResults />,
  },
  {
    path: "results/:id",
    element: <StudentResultDetails />,
  },
  {
    path: "parents",
    element: <StudentParents />,
  },
  {
    path: "fees",
    element: <StudentFees />,
  },
  {
    path: "fees/payment/:paymentId/receipt",
    element: <StudentPaymentReceipt />,
  },
  {
    path: "examinations",
    element: <StudentExaminations />,
  },
  {
    path: "examinations/:id",
    element: <StudentExaminationDetails />,
  },
 {
  path: "notifications",
  element: <StudentNotifications />,
},
{
  path: "notifications/:id",
  element: <StudentNotificationDetails />,
},
];
