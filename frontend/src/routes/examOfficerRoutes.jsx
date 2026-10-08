// import { lazy } from "react";

// // ============================================================
// // DASHBOARD
// // ============================================================

// const ExamOfficerDashboard = lazy(
//   () => import("../pages/examOfficer/ExamOfficerDashboard"),
// );

// // ============================================================
// // EXAMINATIONS
// // ============================================================

// const ExamOfficerExaminations = lazy(
//   () => import("../pages/examOfficer/ExamOfficerExaminations"),
// );

// // ============================================================
// // STUDENTS
// // ============================================================

// const ExamOfficerStudents = lazy(
//   () => import("../pages/examOfficer/ExamOfficerStudents"),
// );

// // ============================================================
// // RESULTS
// // ============================================================

// const AddResult = lazy(() => import("../pages/examOfficer/AddResult"));

// const AllResults = lazy(() => import("../pages/examOfficer/AllResults"));

// // ============================================================
// // REPORT CARDS
// // ============================================================

// const ExamOfficerReportCards = lazy(
//   () => import("../pages/examOfficer/ExamOfficerReportCards"),
// );

// const AddReportCard = lazy(() => import("../pages/examOfficer/AddReportCard"));

// // ============================================================
// // GRADE SCALES
// // ============================================================

// const ExamOfficerGradeScales = lazy(
//   () => import("../pages/examOfficer/ExamOfficerGradeScales"),
// );

// // ============================================================
// // PROFILE
// // ============================================================

// const ExamOfficerProfile = lazy(
//   () => import("../pages/examOfficer/ExamOfficerProfile"),
// );

// const EditResult = lazy(() => import("../pages/examOfficer/EditResult"));

// const PrintResults = lazy(() => import("../pages/examOfficer/PrintResults"));
// const ReportCardDetails = lazy(
//   () => import("../pages/examOfficer/ReportCardDetails"),
// );

// // ============================================================
// // ROUTES
// // ============================================================

// export const examOfficerRoutes = [
//   // ==========================================================
//   // DASHBOARD
//   // ==========================================================

//   {
//     index: true,
//     element: <ExamOfficerDashboard />,
//   },

//   // ==========================================================
//   // EXAMINATIONS
//   // ==========================================================

//   {
//     path: "examinations",
//     element: <ExamOfficerExaminations />,
//   },

//   // ==========================================================
//   // STUDENTS
//   // ==========================================================

//   {
//     path: "students",
//     element: <ExamOfficerStudents />,
//   },

//   {
//     path: "report-cards/:id",
//     element: <ReportCardDetails />,
//   },

//   // ==========================================================
//   // RESULTS
//   // ==========================================================

//   {
//     path: "results/add",
//     element: <AddResult />,
//   },

//   {
//     path: "results",
//     element: <AllResults />,
//   },

//   {
//     path: "results/:id/edit",
//     element: <EditResult />,
//   },

//   {
//     path: "print-result/:id",
//     element: <ReportCardDetails />,
//   },

//   {
//     path: "print-results",
//     element: <PrintResults />,
//   },

//   // ==========================================================
//   // REPORT CARDS
//   // ==========================================================

//   {
//     path: "report-cards",
//     element: <ExamOfficerReportCards />,
//   },

//   {
//     path: "report-cards/add",
//     element: <AddReportCard />,
//   },

//   // ==========================================================
//   // GRADE SCALES
//   // ==========================================================

//   {
//     path: "grade-scales",
//     element: <ExamOfficerGradeScales />,
//   },

//   // ==========================================================
//   // PROFILE
//   // ==========================================================

//   {
//     path: "profile",
//     element: <ExamOfficerProfile />,
//   },
// ];


import { lazy } from "react";

// ============================================================
// DASHBOARD
// ============================================================

const ExamOfficerDashboard = lazy(
  () => import("../pages/examOfficer/ExamOfficerDashboard"),
);

// ============================================================
// EXAMINATIONS
// ============================================================

const ExamOfficerExaminations = lazy(
  () => import("../pages/examOfficer/ExamOfficerExaminations"),
);

// ============================================================
// STUDENTS
// ============================================================

const Student = lazy(
  () => import("../pages/examOfficer/Student"),
);

const StudentDetails = lazy(
  () => import("../pages/examOfficer/StudentDetails"),
);

// ============================================================
// RESULTS
// ============================================================

const AddResult = lazy(
  () => import("../pages/examOfficer/AddResult"),
);

const AllResults = lazy(
  () => import("../pages/examOfficer/AllResults"),
);

const EditResult = lazy(
  () => import("../pages/examOfficer/EditResult"),
);

const PrintResults = lazy(
  () => import("../pages/examOfficer/PrintResults"),
);

// ============================================================
// REPORT CARDS
// ============================================================

const ExamOfficerReportCards = lazy(
  () => import("../pages/examOfficer/ExamOfficerReportCards"),
);

const AddReportCard = lazy(
  () => import("../pages/examOfficer/AddReportCard"),
);

const ReportCardDetails = lazy(
  () => import("../pages/examOfficer/ReportCardDetails"),
);

// ============================================================
// GRADE SCALES
// ============================================================

const ExamOfficerGradeScales = lazy(
  () => import("../pages/examOfficer/ExamOfficerGradeScales"),
);

// ============================================================
// NOTIFICATIONS
// ============================================================

const ExamOfficerNotifications = lazy(
  () => import("../pages/examOfficer/ExamOfficerNotifications"),
);

const ExamOfficerNotificationDetails = lazy(
  () =>
    import("../pages/examOfficer/ExamOfficerNotificationDetails"),
);

// ============================================================
// PROFILE
// ============================================================

const ExamOfficerProfile = lazy(
  () => import("../pages/examOfficer/ExamOfficerProfile"),
);

// ============================================================
// SETTINGS
// ============================================================

const Settings = lazy(
  () => import("../pages/examOfficer/Settings"),
);

// ============================================================
// ROUTES
// ============================================================

export const examOfficerRoutes = [
  // ==========================================================
  // DASHBOARD
  // ==========================================================

  {
    index: true,
    element: <ExamOfficerDashboard />,
  },

  // ==========================================================
  // EXAMINATIONS
  // ==========================================================

  {
    path: "examinations",
    element: <ExamOfficerExaminations />,
  },

  // ==========================================================
  // STUDENTS
  // ==========================================================

  {
    path: "students",
    element: <Student />,
  },

  {
    path: "students/:id",
    element: <StudentDetails />,
  },

  // ==========================================================
  // RESULTS
  // ==========================================================

  {
    path: "results",
    element: <AllResults />,
  },

  {
    path: "results/add",
    element: <AddResult />,
  },

  {
    path: "results/:id/edit",
    element: <EditResult />,
  },

  {
    path: "print-result/:id",
    element: <ReportCardDetails />,
  },

  {
    path: "print-results",
    element: <PrintResults />,
  },

  // ==========================================================
  // REPORT CARDS
  // ==========================================================

  {
    path: "report-cards",
    element: <ExamOfficerReportCards />,
  },

  {
    path: "report-cards/add",
    element: <AddReportCard />,
  },

  {
    path: "report-cards/:id",
    element: <ReportCardDetails />,
  },

  // ==========================================================
  // GRADE SCALES
  // ==========================================================

  {
    path: "grade-scales",
    element: <ExamOfficerGradeScales />,
  },

  // ==========================================================
  // NOTIFICATIONS
  // ==========================================================

  {
    path: "notifications",
    element: <ExamOfficerNotifications />,
  },

  {
    path: "notifications/:id",
    element: <ExamOfficerNotificationDetails />,
  },

  // ==========================================================
  // PROFILE
  // ==========================================================

  {
    path: "profile",
    element: <ExamOfficerProfile />,
  },

  // ==========================================================
  // SETTINGS
  // ==========================================================

  {
    path: "settings",
    element: <Settings />,
  },
];