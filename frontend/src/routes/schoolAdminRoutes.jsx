import ComingSoon from "../components/common/ComingSoon";

import SchoolAdminDashboard from "../pages/schoolAdmin/SchoolAdminDashboard";
import Students from "../pages/schoolAdmin/people/Students";
import AddStudent from "../pages/schoolAdmin/people/AddStudent";
import StudentDetails from "../pages/schoolAdmin/people/StudentDetails";
import EditStudent from "../pages/schoolAdmin/people/EditStudent";
import Teachers from "../pages/schoolAdmin/people/Teachers";
import AddTeacher from "../pages/schoolAdmin/people/AddTeacher";
import TeacherDetails from "../pages/schoolAdmin/people/TeacherDetails";
import EditTeacher from "../pages/schoolAdmin/people/EditTeacher";
import TeacherSubjects from "../pages/schoolAdmin/people/TeacherSubjects";
import TeacherClass from "../pages/schoolAdmin/people/TeacherClass";
import Parents from "../pages/schoolAdmin/people/Parents";
import ParentDetails from "../pages/schoolAdmin/people/ParentDetails";
import Principals from "../pages/schoolAdmin/people/Principals";
import AddPrincipal from "../pages/schoolAdmin/people/AddPrincipal";
import PrincipalDetails from "../pages/schoolAdmin/people/PrincipalDetails";
import EditPrincipal from "../pages/schoolAdmin/people/EditPrincipal";

import OtherStaff from "../pages/schoolAdmin/people/OtherStaff";
import AddOtherStaff from "../pages/schoolAdmin/people/AddOtherStaff";
import OtherStaffDetails from "../pages/schoolAdmin/people/OtherStaffDetails";
import EditOtherStaff from "../pages/schoolAdmin/people/EditOtherStaff";

import Classes from "../pages/schoolAdmin/academics/Classes";
import ClassDetails from "../pages/schoolAdmin/academics/ClassDetails";
import EditClass from "../pages/schoolAdmin/academics/EditClass";
import AddClass from "../pages/schoolAdmin/academics/AddClass";
import Subjects from "../pages/schoolAdmin/academics/Subjects";
import SubjectDetails from "../pages/schoolAdmin/academics/SubjectDetails";
import Department from "../pages/schoolAdmin/academics/Department";
import Session from "../pages/schoolAdmin/academics/Session";

import Terms from "../pages/schoolAdmin/academics/Terms";
import ClassSubjects from "../pages/schoolAdmin/academics/ClassSubjects";
import AddClassSubject from "../pages/schoolAdmin/academics/AddClassSubject";
import EditClassSubject from "../pages/schoolAdmin/academics/EditClassSubject";
import EditResult from "../pages/schoolAdmin/examinationsResults/EditResult";
// =====================================================
// STUDENT MANAGEMENT
// =====================================================

import Enrollment from "../pages/schoolAdmin/studentManagement/Enrollment";
import Promotion from "../pages/schoolAdmin/studentManagement/Promotion";
import Graduation from "../pages/schoolAdmin/studentManagement/Graduation";
import StudentAccounts from "../pages/schoolAdmin/studentManagement/StudentAccounts";
import StudentAccountDetails from "../pages/schoolAdmin/studentManagement/StudentAccountDetails";

import Attendance from "../pages/schoolAdmin/attendance/Attendance";
import AttendanceReports from "../pages/schoolAdmin/attendance/AttendanceReports";

import Assignments from "../pages/schoolAdmin/assignments/Assignments";
import AssignmentDetails from "../pages/schoolAdmin/assignments/AssignmentDetails";

import Exams from "../pages/schoolAdmin/examinations/Exams";
import AddExam from "../pages/schoolAdmin/examinations/AddExam";
import ExamDetails from "../pages/schoolAdmin/examinations/ExamDetails";
import AddExamSubject from "../pages/schoolAdmin/examinations/AddExamSubject";
import EditExam from "../pages/schoolAdmin/examinations/EditExam";
import EditExamSubject from "../pages/schoolAdmin/examinations/EditExamSubject";
import Results from "../pages/schoolAdmin/examinationsResults/Results";
import AddResult from "../pages/schoolAdmin/examinationsResults/AddResult";
import ResultDetails from "../pages/schoolAdmin/examinationsResults/ResultDetails";
import ResultApproval from "../pages/schoolAdmin/examinationsResults/ResultApproval";
import ReportCards from "../pages/schoolAdmin/examinationsResults/ReportCards";
import AddReportCard from "../pages/schoolAdmin/examinationsResults/AddReportCard";
import ReportCardDetails from "../pages/schoolAdmin/examinationsResults/ReportCardDetails";
import EditReportCard from "../pages/schoolAdmin/examinationsResults/EditReportCard";

import Fees from "../pages/schoolAdmin/finance/Fees";
import Payments from "../pages/schoolAdmin/finance/Payments";
import OutstandingBalances from "../pages/schoolAdmin/finance/OutstandingBalances";
import FinancialReports from "../pages/schoolAdmin/finance/FinancialReports";
import Notifications from "../pages/schoolAdmin/notifications/Notifications";
import ComposeNotification from "../pages/schoolAdmin/notifications/ComposeNotification";

import AuditLogs from "../pages/schoolAdmin/audit/AuditLogs";
import SchoolInformation from "../pages/schoolAdmin/settings/SchoolInformation";
import AcademicSettings from "../pages/schoolAdmin/settings/AcademicSettings";
import GradingSettings from "../pages/schoolAdmin/settings/GradingSettings";
import UserPermissions from "../pages/schoolAdmin/settings/UserPermissions";
// =====================================================
// SCHOOL ADMIN ROUTES
// =====================================================

export const schoolAdminRoutes = [
  // ===================================================
  // DASHBOARD
  // ===================================================
  {
    path: "",
    index: true,
    label: "Dashboard",
    icon: "▦",
    element: <SchoolAdminDashboard />,
  },

  // ===================================================
  // PEOPLE
  // ===================================================
  {
    path: "people",
    label: "People",
    icon: "👥",

    children: [
      {
        path: "people/students",
        label: "Students",
      },
      {
        path: "people/teachers",
        label: "Teachers",
      },
      {
        path: "people/parents",
        label: "Parents / Guardians",
      },
      {
        path: "people/principals",
        label: "Principals",
      },
      {
        path: "people/other-staff",
        label: "Other Staff",
      },
    ],
  },

  // ---------------------------------------------------
  // PEOPLE PAGES
  // ---------------------------------------------------

  {
    path: "people/students",
    element: <Students />,
  },

  {
    path: "people/students/add",
    element: <AddStudent />,
    hideInNav: true,
  },

  {
    path: "people/students/:id",
    element: <StudentDetails />,
    hideInNav: true,
  },

  {
    path: "people/students/:id/edit",
    element: <EditStudent />,
    hideInNav: true,
  },

  {
    path: "people/teachers",
    element: <Teachers />,
  },
  {
    path: "people/teachers/add",
    element: <AddTeacher />,
    hideInNav: true,
  },

  {
    path: "people/teachers/:id",
    element: <TeacherDetails />,
    hideInNav: true,
  },

  {
    path: "people/teachers/:id/edit",
    element: <EditTeacher />,
    hideInNav: true,
  },

  {
    path: "people/teachers/:id/subjects",
    element: <TeacherSubjects />,
    hideInNav: true,
  },
  {
    path: "people/teachers/:id/class",
    element: <TeacherClass />,
    hideInNav: true,
  },
  {
    path: "people/parents",
    element: <Parents />,
  },
  {
    path: "people/parents/:id",
    element: <ParentDetails />,
    hideInNav: true,
  },

  {
    path: "people/principals",
    element: <Principals />,
  },
  {
    path: "people/principals/add",
    element: <AddPrincipal />,
    hideInNav: true,
  },

  {
    path: "people/principals/:id",
    element: <PrincipalDetails />,
    hideInNav: true,
  },

  {
    path: "people/principals/:id/edit",
    element: <EditPrincipal />,
    hideInNav: true,
  },

  {
    path: "people/other-staff",
    element: <OtherStaff />,
  },
  {
    path: "people/other-staff/add",
    element: <AddOtherStaff />,
    hideInNav: true,
  },
  {
    path: "people/other-staff/:id",
    element: <OtherStaffDetails />,
    hideInNav: true,
  },
  {
    path: "people/other-staff/:id/edit",
    element: <EditOtherStaff />,
    hideInNav: true,
  },

  // ===================================================
  // ACADEMICS
  // ===================================================
  {
    path: "academics",
    label: "Academics",
    icon: "🎓",

    children: [
      {
        path: "academics/classes",
        label: "Classes",
      },
      {
        path: "academics/subjects",
        label: "Subjects",
      },
      {
        path: "academics/departments",
        label: "Departments",
      },
      {
        path: "academics/sessions",
        label: "Sessions",
      },
      {
        path: "academics/terms",
        label: "Terms",
      },
      {
        path: "academics/class-subjects",
        label: "Class Subjects",
      },
    ],
  },

  // ---------------------------------------------------
  // ACADEMIC PAGES
  // ---------------------------------------------------

  {
    path: "academics/classes",
    element: <Classes />,
  },

  {
    path: "academics/classes/add",
    element: <AddClass />,
  },

  {
    path: "academics/classes/:id/edit",
    element: <EditClass />,
  },

  {
    path: "academics/classes/:id",
    element: <ClassDetails />,
  },

  {
    path: "academics/subjects",
    element: <Subjects />,
  },
  {
    path: "academics/subjects/:id",
    element: <SubjectDetails />,
  },

  {
    path: "academics/departments",
    element: <Department />,
  },
  {
    path: "academics/departments/:id",
    element: <Department />,
  },

  {
    path: "academics/sessions",
    element: <Session />,
  },
  {
    path: "academics/sessions/add",
    element: <Session />,
  },
  {
    path: "academics/sessions/:id",
    element: <Session />,
  },
  {
    path: "academics/sessions/:id/edit",
    element: <Session />,
  },

  {
    path: "academics/terms",
    element: <Terms />,
  },
  {
    path: "academics/terms/add",
    element: <Terms />,
  },
  {
    path: "academics/terms/:id",
    element: <Terms />,
  },
  {
    path: "academics/terms/:id/edit",
    element: <Terms />,
  },

  {
    path: "academics/class-subjects",
    element: <ClassSubjects />,
  },
  {
    path: "academics/class-subjects/add",
    element: <AddClassSubject />,
  },
  {
    path: "academics/class-subjects/:id/edit",
    element: <EditClassSubject />,
  },
  // ===================================================
  // STUDENT MANAGEMENT
  // ===================================================
  {
    path: "student-management",
    label: "Student Management",
    icon: "🎓",

    children: [
      {
        path: "student-management/enrollment",
        label: "Enrollment",
      },
      {
        path: "student-management/promotion",
        label: "Promotion",
      },
      {
        path: "student-management/graduation",
        label: "Graduation",
      },
      {
        path: "student-management/student-accounts",
        label: "Student Accounts",
      },
    ],
  },

  {
    path: "student-management/enrollment",
    element: <Enrollment />,
  },

  {
    path: "student-management/promotion",
    element: <Promotion />,
  },
  {
    path: "student-management/graduation",
    element: <Graduation />,
  },

  {
    path: "student-management/student-accounts",
    element: <StudentAccounts />,
  },

  {
    path: "student-management/student-accounts/:studentId",
    element: <StudentAccountDetails />,
    hideInNav: true,
  },
  // ===================================================
  // ATTENDANCE
  // ===================================================
  {
    path: "attendance",
    label: "Attendance",
    icon: "📝",

    children: [
      {
        path: "/attendance/attendance",
        label: "Attendance",
      },
      {
        path: "attendance/reports",
        label: "Reports",
      },
    ],
  },

  {
    path: "attendance/attendance",
    element: <Attendance />,
  },
  {
    path: "attendance/reports",
    element: <AttendanceReports />,
  },

  {
    path: "attendance/reports",
    element: <ComingSoon title="Attendance Reports" />,
  },

  // ===================================================
  // ASSIGNMENTS
  // ===================================================

  {
    path: "assignments",
    label: "Assignments",
    icon: "📝",
    element: <Assignments />,
  },

  {
    path: "assignments/:id",
    element: <AssignmentDetails />,
    hideInNav: true,
  },

  // ===================================================
  // EXAMINATIONS & RESULTS
  // ===================================================
  {
    path: "examinations-results",
    label: "Examinations & Results",
    icon: "📊",

    children: [
      {
        path: "examinations-results/exams",
        label: "Exams",
      },
      {
        path: "examinations-results/results",
        label: "Results",
      },

      {
        path: "examinations-results/result-approval",
        label: "Result Approval",
      },
      {
        path: "examinations-results/report-cards",
        label: "Report Cards",
      },
    ],
  },

  {
    path: "examinations-results/exams",
    element: <Exams />,
  },

  {
    path: "examinations-results/exams/add",
    element: <AddExam />,
    hideInNav: true,
  },
  {
    path: "examinations-results/exams/:id",
    element: <ExamDetails />,
    hideInNav: true,
  },

  {
    path: "examinations-results/exams/:id/subjects/add",
    element: <AddExamSubject />,
    hideInNav: true,
  },

  {
    path: "examinations-results/exams/:id/edit",
    element: <EditExam />,
    hideInNav: true,
  },
  {
    path: "examinations-results/exams/:id/subjects/:subjectId/edit",
    element: <EditExamSubject />,
    hideInNav: true,
  },
  {
    path: "examinations-results/results",
    element: <Results />,
  },
  {
    path: "examinations-results/results/add",
    element: <AddResult />,
    hideInNav: true,
  },

  {
    path: "examinations-results/results/:id/edit",
    element: <EditResult />,
    hideInNav: true,
  },

  {
    path: "examinations-results/results/:id",
    element: <ResultDetails />,
    hideInNav: true,
  },

  {
    path: "examinations-results/result-approval",
    element: <ResultApproval />,
  },

  {
    path: "examinations-results/report-cards/add",
    element: <AddReportCard />,
    hideInNav: true,
  },

  {
    path: "examinations-results/report-cards",
    element: <ReportCards />,
  },
  {
    path: "examinations-results/report-cards",
    element: <ReportCards />,
  },
  {
    path: "examinations-results/report-cards/add",
    element: <AddReportCard />,
    hideInNav: true,
  },
  {
    path: "examinations-results/report-cards/:id",
    element: <ReportCardDetails />,
    hideInNav: true,
  },
  {
    path: "examinations-results/report-cards/:id/edit",
    element: <EditReportCard />,
    hideInNav: true,
  },

  // ===================================================
  // FINANCE
  // ===================================================
  {
    path: "finance",
    label: "Finance",
    icon: "💰",

    children: [
      {
        path: "finance/fees",
        label: "Fees",
      },
      {
        path: "finance/payments",
        label: "Payments",
      },
      {
        path: "finance/outstanding-balances",
        label: "Outstanding Balances",
      },
      {
        path: "finance/reports",
        label: "Financial Reports",
      },
    ],
  },

  {
    path: "finance/fees",
    element: <Fees />,
  },
  {
    path: "finance/payments",
    element: <Payments />,
  },
  {
    path: "finance/outstanding-balances",
    element: <OutstandingBalances />,
  },

  {
    path: "finance/reports",
    element: <FinancialReports />,
  },

  // ===================================================
  // NOTIFICATIONS
  // ===================================================
  {
    path: "notifications",
    label: "Notifications",
    icon: "🔔",
    element: <Notifications />,
  },
  {
    path: "notifications/compose",
    element: <ComposeNotification />,
  },
  {
    path: "notifications",
    label: "Notifications",
    icon: "🔔",
    element: <Notifications />,
  },
  {
    path: "notifications/compose",
    label: "Compose Notification",
    icon: "✉️",
    element: <ComposeNotification />,
  },

  // ===================================================
  // REPORTS & AUDIT
  // ===================================================

  {
    path: "audit",
    label: "Audit",
    icon: "📈",
    element: <AuditLogs />,
  },

  // ===================================================
  // SETTINGS
  // ===================================================
  {
    path: "settings",
    label: "Settings",
    icon: "⚙",

    bottom: true,

    children: [
      {
        path: "settings/school-information",
        label: "School Information",
      },

      {
        path: "settings/academic-settings",
        label: "Academic Settings",
      },
      {
        path: "settings/grading-settings",
        label: "Grading Settings",
      },
      {
        path: "settings/user-permissions",
        label: "User Permissions",
      },
      {
        path: "settings/logo",
        label: "Logo",
      },
    ],
  },

  {
    path: "settings/school-information",
    element: <SchoolInformation />,
  },

  {
    path: "settings/academic-settings",
    element: <AcademicSettings />,
  },
  {
    path: "settings/grading-settings",
    element: <GradingSettings />,
  },

  {
    path: "settings/user-permissions",
    element: <UserPermissions />,
  },
  {
  path: "settings/logo",
  label: "Logo",
},
];
