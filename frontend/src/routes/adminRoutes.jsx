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

// =====================================================
// TEACHERS
// =====================================================
import Teachers from "../pages/admin/teachers/Teachers";
import AddTeacher from "../pages/admin/teachers/AddTeacher";
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

// =====================================================
// LAZY LOADED PAGES
// =====================================================
const ParentDetails = lazy(
  () => import("../pages/admin/parents/ParentDetails"),
);

const MarkAttendance = lazy(
  () => import("../pages/admin/attendance/MarkAttendance"),
);

const Dashboard = lazy(
  () => import("../pages/admin/Dashboard"),
);

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

    // NOTE:
    // AppRoutes.jsx currently does not render children.
    // These children are therefore navigation metadata.
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
    ],
  },

  // ===================================================
  // ACADEMIC - CLASSES
  // ===================================================

  // New URL
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

  // New URL
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

  // New URL
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

  // New URL
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
  // ACADEMIC - TERMS
  // ===================================================

  // Old URL
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

  // Old URL
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
    icon: "✓",
    element: <MarkAttendance />,
  },

  // ===================================================
  // COMING SOON
  // ===================================================

  {
    path: "assignments",
    label: "Assignments",
    icon: "📝",
    element: <ComingSoon title="Assignments" />,
  },
  {
    path: "examinations",
    label: "Examinations",
    icon: "📋",
    element: <ComingSoon title="Examinations" />,
  },
  {
    path: "results",
    label: "Results",
    icon: "📊",
    element: <ComingSoon title="Results" />,
  },
  {
    path: "finance",
    label: "Finance",
    icon: "💰",
    element: <ComingSoon title="Finance" />,
  },
  {
    path: "library",
    label: "Library",
    icon: "📚",
    element: <ComingSoon title="Library" />,
  },
  {
    path: "communication",
    label: "Communication",
    icon: "💬",
    element: <ComingSoon title="Communication" />,
  },
  {
    path: "notifications",
    label: "Notifications",
    icon: "🔔",
    element: <ComingSoon title="Notifications" />,
  },
  {
    path: "reports",
    label: "Reports",
    icon: "📈",
    element: <ComingSoon title="Reports" />,
  },
  {
    path: "settings",
    label: "Settings",
    icon: "⚙",
    element: <ComingSoon title="Settings" />,
    bottom: true,
  },
];