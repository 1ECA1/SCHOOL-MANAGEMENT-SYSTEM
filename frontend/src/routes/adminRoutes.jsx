import { lazy } from "react";

import ComingSoon from "../components/common/ComingSoon";

// =====================================================
// STUDENTS
// =====================================================
import AddStudent from "../pages/admin/students/AddStudent";
import AllStudents from "../pages/admin/students/AllStudents";
import StudentDetails from "../pages/admin/students/StudentDetails";
import EditStudent from "../pages/admin/students/EditStudent";
import EditEnrollment from "../pages/admin/students/EditEnrollment";
import PromotionEnrollment from "../pages/admin/students/PromotionEnrollment";

// =====================================================
// TEACHERS
// =====================================================
import Teachers from "../pages/admin/teachers/Teachers";
import AddTeacher from "../pages/admin/teachers/AddTeacher";
import TeacherDetail from "../pages/admin/teachers/TeacherDetail";
import EditTeacher from "../pages/admin/teachers/EditTeacher";
import TeacherSubjects from "../pages/admin/teachers/TeacherSubjects";
import ClassTeacher from "../pages/admin/teachers/ClassTeacher";

// =====================================================
// PARENTS
// =====================================================
import AllParents from "../pages/admin/parents/AllParents";

// =====================================================
// ACADEMICS
// =====================================================
import AllClasses from "../pages/admin/academics/AllClasses";
import AddClass from "../pages/admin/academics/AddClass";
import ClassDetails from "../pages/admin/academics/ClassDetails";
import EditClass from "../pages/admin/academics/EditClass";

import AllDepartments from "../pages/admin/academics/AllDepartments";
import AddDepartment from "../pages/admin/academics/AddDepartment";
import DepartmentDetails from "../pages/admin/academics/DepartmentDetails";
import EditDepartment from "../pages/admin/academics/EditDepartment";

import AllAcademicSections from "../pages/admin/academics/AllAcademicSections";
import AddAcademicSection from "../pages/admin/academics/AddAcademicSection";
import AcademicSectionDetails from "../pages/admin/academics/AcademicSectionDetails";
import EditAcademicSection from "../pages/admin/academics/EditAcademicSection";

import AllSubjects from "../pages/admin/academics/AllSubjects";
import AddSubject from "../pages/admin/academics/AddSubject";
import SubjectDetails from "../pages/admin/academics/SubjectDetails";
import EditSubject from "../pages/admin/academics/EditSubject";

import AllTerms from "../pages/admin/academics/AllTerms";
import AddTerm from "../pages/admin/academics/AddTerm";
import TermDetails from "../pages/admin/academics/TermDetails";
import EditTerm from "../pages/admin/academics/EditTerm";

import AllSchools from "../pages/admin/academics/AllSchools";
import AddSchool from "../pages/admin/academics/AddSchool";
import SchoolDetails from "../pages/admin/academics/SchoolDetails";
import EditSchool from "../pages/admin/academics/EditSchool";

import AllAcademicSessions from "../pages/admin/academics/AllAcademicSessions";
import AddAcademicSession from "../pages/admin/academics/AddAcademicSession";
import AcademicSessionDetails from "../pages/admin/academics/AcademicSessionDetails";
import EditAcademicSession from "../pages/admin/academics/EditAcademicSession";

import AllBooks from "../pages/admin/library/AllBooks";
import AddBook from "../pages/admin/library/AddBook";
import BookDetails from "../pages/admin/library/BookDetails";
import LibrarySetup from "../pages/admin/library/LibrarySetup";
import EditBook from "../pages/admin/library/EditBook";

import AllLoans from "../pages/admin/library/AllLoans";
import IssueBook from "../pages/admin/library/IssueBook";

import AllClassSubjects from "../pages/admin/academics/AllClassSubjects";
import AddClassSubject from "../pages/admin/academics/AddClassSubject";
import EditClassSubject from "../pages/admin/academics/EditClassSubject";

import OptionalSubjectSettings from "../pages/admin/optionalSubjects/OptionalSubjectSettings";

import AllExaminations from "../pages/admin/examinations/AllExaminations";
import AddExamination from "../pages/admin/examinations/AddExamination";
import ExaminationDetails from "../pages/admin/examinations/ExaminationDetails";
import AddExaminationSubject from "../pages/admin/examinations/AddExaminationSubject";
import EditExaminationSubject from "../pages/admin/examinations/EditExaminationSubject";
import EditExamination from "../pages/admin/examinations/EditExamination";

import AllResults from "../pages/admin/results/AllResults";
import AddResult from "../pages/admin/results/AddResult";
import EditResult from "../pages/admin/results/EditResult";
import AllGradeScales from "../pages/admin/results/AllGradeScales";
import AddGradeScale from "../pages/admin/results/AddGradeScale";
import EditGradeScale from "../pages/admin/results/EditGradeScale";

import AddReportCard from "../pages/admin/results/AddReportCard";
import AllReportCards from "../pages/admin/results/AllReportCards";
import ReportCardDetails from "../pages/admin/results/ReportCardDetails";
import PrintResults from "../pages/admin/results/PrintResults";
import EditReportCard from "../pages/admin/results/EditReportCard";

import StudentPromotion from "../pages/admin/students/StudentPromotion";

import AttendanceSettings from "../pages/admin/attendance/AttendanceSettings";

import AllAssignments from "../pages/admin/assignments/AllAssignment";
import AddAssignment from "../pages/admin/assignments/AddAssignment";
import EditAssignment from "../pages/admin/assignments/EditAssignment";
import AssignmentDetails from "../pages/admin/assignments/AssignmentDetails";
import Submissions from "../pages/admin/assignments/Submissions";
import SubmissionDetails from "../pages/admin/assignments/SubmissionDetails";

// =====================================================
// LAZY LOADED PAGES
// =====================================================
const ParentDetails = lazy(
  () => import("../pages/admin/parents/ParentDetails"),
);

const TakeAttendance = lazy(
  () => import("../pages/admin/attendance/TakeAttendance"),
);

const AttendanceRecords = lazy(
  () => import("../pages/admin/attendance/AttendanceRecords"),
);

const StudentAttendance = lazy(
  () => import("../pages/admin/attendance/StudentAttendance"),
);

const AttendanceReports = lazy(
  () => import("../pages/admin/attendance/AttendanceReports"),
);

const AdminNotifications = lazy(
  () => import("../pages/admin/notifications/AdminNotifications"),
);

const AdminNotificationDetails = lazy(
  () => import("../pages/admin/notifications/AdminNotificationDetails"),
);

const ComposeAdminNotification = lazy(
  () => import("../pages/admin/notifications/ComposeAdminNotification"),
);

const AdminSentNotificationDetails = lazy(
  () => import("../pages/admin/notifications/AdminSentNotificationDetails"),
);

const Dashboard = lazy(() => import("../pages/admin/Dashboard"));

import Payments from "../pages/admin/finance/Payments";
import Fees from "../pages/admin/finance/Fees";
import FinancialReports from "../pages/admin/finance/FinancialReports";

import AuditLogs from "../pages/admin/settings/AuditLogs";
import UserPermissions from "../pages/admin/settings/UserPermissions";
import GradingSettings from "../pages/schoolAdmin/settings/GradingSettings";
import AcademicSettings from "../pages/admin/settings/AcademicSettings";

import SchoolAdmins from "../pages/admin/schoolAdmins/SchoolAdmins";
import AddSchoolAdmin from "../pages/admin/schoolAdmins/AddSchoolAdmin";
import SchoolAdminDetails from "../pages/admin/schoolAdmins/SchoolAdminDetails";
import EditSchoolAdmin from "../pages/admin/schoolAdmins/EditSchoolAdmin";

import PersonalSettings from "../pages/admin/settings/PersonalSettings";
// =====================================================
// ADMIN ROUTES
// =====================================================

export const adminRoutes = [
  // ===================================================
  // DASHBOARD
  // ===================================================
  {
    path: "",
    index: true,
    label: "Dashboard",
    icon: "▦",
    element: <Dashboard />,
  },

  // ===================================================
  // ACADEMIC NAVIGATION
  // ===================================================
  {
    path: "academic",
    label: "Academic",
    icon: "🎓",
    children: [
      {
        path: "classes",
        label: "Classes",
      },
      {
        path: "departments",
        label: "Departments",
      },
      {
        path: "academic-sections",
        label: "Academic Sections",
      },
      {
        path: "subjects",
        label: "Subjects",
      },
      {
        path: "class-subjects",
        label: "Class Subjects",
      },
      {
        path: "terms",
        label: "Terms",
      },
      {
        path: "schools",
        label: "Schools",
      },
      {
        path: "sessions",
        label: "Sessions",
      },
      {
        path: "academic/optional-subject-settings",
        label: "Optional Subject Selection",
      },
    ],
  },

  // ===================================================
  // ACADEMIC - CLASSES
  // ===================================================
  {
    path: "academic/classes",
    element: <AllClasses />,
    hideInNav: true,
  },
  {
    path: "academic/classes/add",
    element: <AddClass />,
    hideInNav: true,
  },
  {
    path: "academic/classes/:id/edit",
    element: <EditClass />,
    hideInNav: true,
  },
  {
    path: "academic/classes/:id",
    element: <ClassDetails />,
    hideInNav: true,
  },

  // Old URL
  {
    path: "classes",
    element: <AllClasses />,
    hideInNav: true,
  },
  {
    path: "classes/add",
    element: <AddClass />,
    hideInNav: true,
  },
  {
    path: "classes/:id/edit",
    element: <EditClass />,
    hideInNav: true,
  },
  {
    path: "classes/:id",
    element: <ClassDetails />,
    hideInNav: true,
  },

  // ===================================================
  // ACADEMIC - DEPARTMENTS
  // ===================================================
  {
    path: "academic/departments",
    element: <AllDepartments />,
    hideInNav: true,
  },
  {
    path: "academic/departments/add",
    element: <AddDepartment />,
    hideInNav: true,
  },
  {
    path: "academic/departments/:id/edit",
    element: <EditDepartment />,
    hideInNav: true,
  },
  {
    path: "academic/departments/:id",
    element: <DepartmentDetails />,
    hideInNav: true,
  },

  // Old URL
  {
    path: "departments",
    element: <AllDepartments />,
    hideInNav: true,
  },
  {
    path: "departments/add",
    element: <AddDepartment />,
    hideInNav: true,
  },
  {
    path: "departments/:id/edit",
    element: <EditDepartment />,
    hideInNav: true,
  },
  {
    path: "departments/:id",
    element: <DepartmentDetails />,
    hideInNav: true,
  },

  // ===================================================
  // ACADEMIC - ACADEMIC SECTIONS
  // ===================================================
  {
    path: "academic/academic-sections",
    element: <AllAcademicSections />,
    hideInNav: true,
  },
  {
    path: "academic/academic-sections/add",
    element: <AddAcademicSection />,
    hideInNav: true,
  },
  {
    path: "academic/academic-sections/:id/edit",
    element: <EditAcademicSection />,
    hideInNav: true,
  },
  {
    path: "academic/academic-sections/:id",
    element: <AcademicSectionDetails />,
    hideInNav: true,
  },

  // Old URL
  {
    path: "academic-sections",
    element: <AllAcademicSections />,
    hideInNav: true,
  },
  {
    path: "academic-sections/add",
    element: <AddAcademicSection />,
    hideInNav: true,
  },
  {
    path: "academic-sections/:id/edit",
    element: <EditAcademicSection />,
    hideInNav: true,
  },
  {
    path: "academic-sections/:id",
    element: <AcademicSectionDetails />,
    hideInNav: true,
  },

  // ===================================================
  // ACADEMIC - SUBJECTS
  // ===================================================
  {
    path: "academic/subjects",
    element: <AllSubjects />,
    hideInNav: true,
  },
  {
    path: "academic/subjects/add",
    element: <AddSubject />,
    hideInNav: true,
  },
  {
    path: "academic/subjects/:id/edit",
    element: <EditSubject />,
    hideInNav: true,
  },
  {
    path: "academic/subjects/:id",
    element: <SubjectDetails />,
    hideInNav: true,
  },

  // Old URL
  {
    path: "subjects",
    element: <AllSubjects />,
    hideInNav: true,
  },
  {
    path: "subjects/add",
    element: <AddSubject />,
    hideInNav: true,
  },
  {
    path: "subjects/:id/edit",
    element: <EditSubject />,
    hideInNav: true,
  },
  {
    path: "subjects/:id",
    element: <SubjectDetails />,
    hideInNav: true,
  },

  // ===================================================
  // ACADEMIC - CLASS SUBJECTS
  // ===================================================
  {
    path: "academic/class-subjects",
    element: <AllClassSubjects />,
    hideInNav: true,
  },
  {
    path: "academic/class-subjects/add",
    element: <AddClassSubject />,
    hideInNav: true,
  },
  {
    path: "academic/class-subjects/:id/edit",
    element: <EditClassSubject />,
    hideInNav: true,
  },

  // ===================================================
  // ACADEMIC - TERMS
  // ===================================================
  {
    path: "terms",
    element: <AllTerms />,
    hideInNav: true,
  },
  {
    path: "terms/add",
    element: <AddTerm />,
    hideInNav: true,
  },
  {
    path: "terms/:id/edit",
    element: <EditTerm />,
    hideInNav: true,
  },
  {
    path: "terms/:id",
    element: <TermDetails />,
    hideInNav: true,
  },

  // New URL
  {
    path: "academic/terms",
    element: <AllTerms />,
    hideInNav: true,
  },
  {
    path: "academic/terms/add",
    element: <AddTerm />,
    hideInNav: true,
  },
  {
    path: "academic/terms/:id/edit",
    element: <EditTerm />,
    hideInNav: true,
  },
  {
    path: "academic/terms/:id",
    element: <TermDetails />,
    hideInNav: true,
  },

  // ===================================================
  // ACADEMIC - SCHOOLS
  // ===================================================
  {
    path: "schools",
    element: <AllSchools />,
    hideInNav: true,
  },
  {
    path: "schools/add",
    element: <AddSchool />,
    hideInNav: true,
  },
  {
    path: "schools/:id/edit",
    element: <EditSchool />,
    hideInNav: true,
  },
  {
    path: "schools/:id",
    element: <SchoolDetails />,
    hideInNav: true,
  },

  // New URL
  {
    path: "academic/schools",
    element: <AllSchools />,
    hideInNav: true,
  },
  {
    path: "academic/schools/add",
    element: <AddSchool />,
    hideInNav: true,
  },
  {
    path: "academic/schools/:id/edit",
    element: <EditSchool />,
    hideInNav: true,
  },
  {
    path: "academic/schools/:id",
    element: <SchoolDetails />,
    hideInNav: true,
  },

  // ===================================================
  // ACADEMIC - SESSIONS
  // ===================================================
  {
    path: "academic/sessions",
    element: <AllAcademicSessions />,
    hideInNav: true,
  },
  {
    path: "academic/sessions/add",
    element: <AddAcademicSession />,
    hideInNav: true,
  },
  {
    path: "academic/sessions/:id",
    element: <AcademicSessionDetails />,
    hideInNav: true,
  },
  {
    path: "academic/sessions/:id/edit",
    element: <EditAcademicSession />,
    hideInNav: true,
  },

  // Old URL
  {
    path: "sessions",
    element: <AllAcademicSessions />,
    hideInNav: true,
  },

  {
    path: "academic/optional-subject-settings",
    element: <OptionalSubjectSettings />,
  },

  // ===================================================
  // STUDENTS
  // ===================================================
  {
    path: "students",
    label: "Students",
    icon: "👨‍🎓",
    element: <AllStudents />,
  },
  {
    path: "students/add",
    element: <AddStudent />,
    hideInNav: true,
  },
  {
    path: "students/enrollments/:id/edit",
    element: <EditEnrollment />,
    hideInNav: true,
  },
  {
    path: "students/:id/edit",
    element: <EditStudent />,
    hideInNav: true,
  },
  {
    path: "students/:id",
    element: <StudentDetails />,
    hideInNav: true,
  },
  {
    path: "students/:studentId/promotion",
    element: <StudentPromotion />,
    hideInNav: true,
  },

  // ===================================================
  // PROMOTION & ENROLLMENT
  // ===================================================
  {
    path: "promotion-enrollment",
    label: "Promotion & Enrollment",
    icon: "🎓",
    element: <PromotionEnrollment />,
  },

  // ===================================================
  // TEACHERS
  // ===================================================
  {
    path: "teachers",
    label: "Teachers",
    icon: "👨‍🏫",
    element: <Teachers />,
  },
  {
    path: "teachers/add",
    element: <AddTeacher />,
    hideInNav: true,
  },
  {
    path: "teachers/:id",
    element: <TeacherDetail />,
    hideInNav: true,
  },
  {
    path: "teachers/:id/edit",
    element: <EditTeacher />,
    hideInNav: true,
  },
  {
    path: "teachers/:id/subjects",
    element: <TeacherSubjects />,
    hideInNav: true,
  },
  {
    path: "teachers/:id/class",
    element: <ClassTeacher />,
    hideInNav: true,
  },

  // ===================================================
  // PARENTS
  // ===================================================
  {
    path: "parents",
    label: "Parents",
    icon: "👨‍👩‍👧",
    element: <AllParents />,
  },
  {
    path: "parents/:id",
    element: <ParentDetails />,
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
        path: "attendance/records",
        label: "Attendance Records",
        element: <AttendanceRecords />,
      },
      {
        path: "attendance/take",
        label: "Take Attendance",
        element: <TakeAttendance />,
      },
      {
        path: "attendance/student",
        label: "Student Attendance",
        element: <StudentAttendance />,
      },
      {
        path: "attendance/reports",
        label: "Attendance Reports",
        element: <AttendanceReports />,
      },
      {
        path: "attendance/settings",
        label: "Attendance Settings",
        icon: "⚙️",
      },
    ],
  },

  {
    path: "attendance/take",
    element: <TakeAttendance />,
  },
  {
    path: "attendance/records",
    element: <AttendanceRecords />,
  },
  {
    path: "attendance/student",
    element: <StudentAttendance />,
  },
  {
    path: "attendance/reports",
    element: <AttendanceReports />,
  },
  {
    path: "attendance/settings",
    element: <AttendanceSettings />,
  },

  // ===================================================
  // ASSIGNMENTS
  // ===================================================
  {
    path: "assignments",
    label: "Assignments",
    icon: "📝",
    element: <AllAssignments />,
  },
  {
    path: "assignments/:id/submissions/:submissionId",
    element: <SubmissionDetails />,
    hideInNav: true,
  },
  {
    path: "assignments/new",
    element: <AddAssignment />,
    hideInNav: true,
  },
  {
    path: "assignments/:id/edit",
    element: <EditAssignment />,
    hideInNav: true,
  },
  {
    path: "assignments/:id",
    element: <AssignmentDetails />,
    hideInNav: true,
  },
  {
    path: "assignments/:id/submissions",
    element: <Submissions />,
    hideInNav: true,
  },

  // ===================================================
  // EXAMINATIONS
  // ===================================================
  {
    path: "examinations",
    label: "Examinations",
    icon: "📋",
    element: <AllExaminations />,
  },
  {
    path: "examinations/add",
    element: <AddExamination />,
  },
  {
    path: "examinations/:id",
    element: <ExaminationDetails />,
  },
  {
    path: "examinations/add",
    element: <ExaminationDetails />,
  },
  {
    path: "examinations/:id/subjects/add",
    element: <AddExaminationSubject />,
  },
  {
    path: "examinations/:id/subjects/:subjectId/edit",
    element: <EditExaminationSubject />,
  },
  {
    path: "examinations/:id/edit",
    element: <EditExamination />,
  },

  // ===================================================
  // RESULTS
  // ===================================================
  {
    path: "results",
    label: "Results",
    icon: "📊",
    element: <AllResults />,
    children: [
      {
        path: "results",
        label: "Results",
      },
      {
        path: "results/grade-scales",
        label: "Grade Scales",
      },
      {
        path: "results/report-cards",
        label: "Report Cards",
      },
      {
        path: "results/print-results",
        label: "Print Results",
      },
    ],
  },
  {
    path: "results/add",
    element: <AddResult />,
    hideInNav: true,
  },
  {
    path: "results/:id/edit",
    element: <EditResult />,
    hideInNav: true,
  },
  {
    path: "results/grade-scales",
    element: <AllGradeScales />,
  },
  {
    path: "results/grade-scales/add",
    element: <AddGradeScale />,
    hideInNav: true,
  },
  {
    path: "results/grade-scales/:id/edit",
    element: <EditGradeScale />,
    hideInNav: true,
  },
  {
    path: "results/report-cards/add",
    element: <AddReportCard />,
    hideInNav: true,
  },
  {
    path: "results/report-cards",
    element: <AllReportCards />,
    hideInNav: true,
  },
  {
    path: "results/report-cards/:id",
    element: <ReportCardDetails />,
    hideInNav: true,
  },
  {
    path: "results/print-results",
    element: <PrintResults />,
    hideInNav: true,
  },
  {
    path: "results/report-cards/:id/edit",
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
      // {
      //   path: "finance/outstanding-balances",
      //   label: "Outstanding Balances",
      // },
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
    path: "finance/reports",
    element: <FinancialReports />,
  },

  // ===================================================
  // LIBRARY
  // ===================================================
  {
    path: "library",
    label: "Library",
    icon: "📚",
    children: [
      {
        path: "library/books",
        label: "Books",
      },
      {
        path: "library/books/add",
        label: "Add Book",
      },
      {
        path: "library/setup",
        label: "Authors & Categories",
      },
      {
        path: "library/loans",
        label: "Loans",
      },
      {
        path: "library/loans/add",
        label: "Issue Book",
      },
    ],
  },

  // ===================================================
  // LIBRARY PAGES
  // ===================================================
  {
    path: "library/books",
    element: <AllBooks />,
  },
  {
    path: "library/books/add",
    element: <AddBook />,
    hideInNav: true,
  },
  {
    path: "library/books/:id",
    element: <BookDetails />,
    hideInNav: true,
  },
  {
    path: "library/setup",
    element: <LibrarySetup />,
    hideInNav: true,
  },
  {
    path: "library/books/:id/edit",
    element: <EditBook />,
    hideInNav: true,
  },

  // ===================================================
  // LIBRARY LOANS
  // ===================================================
  {
    path: "library/loans",
    element: <AllLoans />,
    hideInNav: true,
  },
  {
    path: "library/loans/add",
    element: <IssueBook />,
    hideInNav: true,
  },

  // ===================================================
  // COMMUNICATION
  // ===================================================
  // {
  //   path: "communication",
  //   label: "Communication",
  //   icon: "💬",
  //   element: <ComingSoon title="Communication" />,
  // },

  // ===================================================
  // NOTIFICATIONS
  // ===================================================
  {
    path: "notifications",
    label: "Notifications",
    icon: "🔔",
    element: <AdminNotifications />,
  },
  {
    path: "notifications/sent/:id",
    element: <AdminSentNotificationDetails />,
    hideInNav: true,
  },
  {
    path: "notifications/:id",
    element: <AdminNotificationDetails />,
    hideInNav: true,
  },
  {
    path: "notifications/compose",
    element: <ComposeAdminNotification />,
    hideInNav: true,
  },

  // ===================================================
  // REPORTS
  // ===================================================

  {
    path: "school-admins",
    label: "School Admins",
    icon: "🛡️",
    element: <SchoolAdmins />,
  },
  {
    path: "school-admins/add",
    element: <AddSchoolAdmin />,
    hideInNav: true,
  },
  {
    path: "school-admins/:id",
    element: <SchoolAdminDetails />,
    hideInNav: true,
  },
  {
    path: "school-admins/:id/edit",
    element: <EditSchoolAdmin />,
    hideInNav: true,
  },
  // ===================================================
  // SETTINGS
  // ===================================================
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
      path: "settings/audit",
      label: "Audit Logs",
    },
    {
      path: "settings/personal-settings",
      label: "Personal Settings",
    },
  ],
},

// ===================================================
// SETTINGS - AUDIT LOGS
// ===================================================
{
  path: "settings/audit",
  element: <AuditLogs />,
  hideInNav: true,
},

// ===================================================
// SETTINGS - USER PERMISSIONS
// ===================================================
{
  path: "settings/user-permissions",
  element: <UserPermissions />,
  hideInNav: true,
},

// ===================================================
// SETTINGS - GRADING
// ===================================================
{
  path: "settings/grading-settings",
  element: <GradingSettings />,
  hideInNav: true,
},

// ===================================================
// SETTINGS - ACADEMIC
// ===================================================
{
  path: "settings/academic-settings",
  element: <AcademicSettings />,
  hideInNav: true,
},

// ===================================================
// SETTINGS - PERSONAL
// ===================================================
{
  path: "settings/personal-settings",
  element: <PersonalSettings />,
  hideInNav: true,
},

  
];
