import { Routes, Route } from "react-router-dom";

import { Suspense, Fragment } from "react";

import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";
import StudentLayout from "../layouts/StudentLayout";
import PrincipalLayout from "../layouts/PrincipalLayout";
import TeacherLayout from "../layouts/TeacherLayout";
import ParentLayout from "../layouts/ParentLayout";
import LibrarianLayout from "../layouts/LibrarianLayout";
import ExamOfficerLayout from "../layouts/ExamOfficerLayout";
import AdmissionOfficerLayout from "../layouts/AdmissionOfficerLayout";
import AccountantLayout from "../layouts/AccountantLayout";
import SchoolAdminLayout from "../layouts/SchoolAdminLayout";

import Home from "../pages/public/Home";
import Admission from "../pages/public/Admission";
import Login from "../pages/auth/Login";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

import { adminRoutes } from "./adminRoutes";
import { studentRoutes } from "./studentRoutes";
import { principalRoutes } from "./principalRoutes.jsx";
import { teacherRoutes } from "./teacherRoutes";
import { parentRoutes } from "./parentRoutes";
import { librarianRoutes } from "./librarianRoutes";
import { examOfficerRoutes } from "./examOfficerRoutes";
import { admissionOfficerRoutes } from "./admissionOfficerRoutes";
import { accountantRoutes } from "./accountantRoutes";
import { schoolAdminRoutes } from "./schoolAdminRoutes";

function AppRoutes() {
  return (
    <Routes>
      {/* =====================================================
          PUBLIC ROUTES
      ====================================================== */}

      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/admissions/apply" element={<Admission />} />
      </Route>

      {/* =====================================================
          LOGIN
      ====================================================== */}

      <Route path="/login" element={<Login />} />

      {/* =====================================================
          ADMIN ROUTES
      ====================================================== */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute allowed={["school_admin", "super_admin"]}>
              <AdminLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        {adminRoutes.map((route) => (
          <Route
            key={route.path || "admin-index"}
            path={route.path}
            index={route.index}
            element={
              <Suspense fallback={<div className="p-6">Loading…</div>}>
                {route.element}
              </Suspense>
            }
          />
        ))}
      </Route>

      {/* =====================================================
          STUDENT ROUTES
      ====================================================== */}

      <Route
        path="/student"
        element={
          <ProtectedRoute>
            <RoleRoute allowed={["student"]}>
              <StudentLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        {studentRoutes.map((route) => (
          <Route
            key={route.path || "student-index"}
            path={route.path}
            index={route.index}
            element={
              <Suspense fallback={<div className="p-6">Loading…</div>}>
                {route.element}
              </Suspense>
            }
          />
        ))}
      </Route>

      {/* =====================================================
          PRINCIPAL ROUTES
      ====================================================== */}

      <Route
        path="/principal"
        element={
          <ProtectedRoute>
            <RoleRoute allowed={["principal"]}>
              <PrincipalLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        {principalRoutes.map((route) => (
          <Route
            key={route.path || "principal-index"}
            path={route.path}
            index={route.index}
            element={
              <Suspense fallback={<div className="p-6">Loading…</div>}>
                {route.element}
              </Suspense>
            }
          />
        ))}
      </Route>

      {/* =====================================================
          TEACHER ROUTES
      ====================================================== */}

      <Route
        path="/teacher"
        element={
          <ProtectedRoute>
            <RoleRoute allowed={["teacher"]}>
              <TeacherLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        {teacherRoutes.map((route) => (
          <Route
            key={route.path || "teacher-index"}
            path={route.path}
            index={route.index}
            element={
              <Suspense fallback={<div className="p-6">Loading…</div>}>
                {route.element}
              </Suspense>
            }
          />
        ))}
      </Route>

      {/* =====================================================
          PARENT ROUTES
      ====================================================== */}

      <Route
        path="/parent"
        element={
          <ProtectedRoute>
            <RoleRoute allowed={["parent"]}>
              <ParentLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        {parentRoutes.map((route) => (
          <Route
            key={route.path || "parent-index"}
            path={route.path}
            index={route.index}
            element={
              <Suspense fallback={<div className="p-6">Loading…</div>}>
                {route.element}
              </Suspense>
            }
          />
        ))}
      </Route>

      {/* =====================================================
          LIBRARIAN ROUTES
      ====================================================== */}

      <Route
        path="/librarian"
        element={
          <ProtectedRoute>
            <RoleRoute allowed={["librarian"]}>
              <LibrarianLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        {librarianRoutes.map((route) => (
          <Route
            key={route.path || "librarian-index"}
            path={route.path}
            index={route.index}
            element={
              <Suspense fallback={<div className="p-6">Loading…</div>}>
                {route.element}
              </Suspense>
            }
          />
        ))}
      </Route>

      {/* =====================================================
          EXAM OFFICER ROUTES
      ====================================================== */}

      <Route
        path="/exam-officer"
        element={
          <ProtectedRoute>
            <RoleRoute allowed={["exam_officer"]}>
              <ExamOfficerLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        {examOfficerRoutes.map((route) => (
          <Route
            key={route.path || "exam-officer-index"}
            path={route.path}
            index={route.index}
            element={
              <Suspense fallback={<div className="p-6">Loading…</div>}>
                {route.element}
              </Suspense>
            }
          />
        ))}
      </Route>

      {/* =====================================================
          ADMISSION OFFICER ROUTES
      ====================================================== */}

      <Route
        path="/admission-officer"
        element={
          <ProtectedRoute>
            <RoleRoute allowed={["admission_officer"]}>
              <AdmissionOfficerLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        {admissionOfficerRoutes.map((route) => (
          <Route
            key={route.path || "admission-officer-index"}
            path={route.path}
            index={route.index}
            element={
              <Suspense fallback={<div className="p-6">Loading…</div>}>
                {route.element}
              </Suspense>
            }
          />
        ))}
      </Route>

      {/* =====================================================
          ACCOUNTANT ROUTES
      ====================================================== */}

      <Route
        path="/accountant"
        element={
          <ProtectedRoute>
            <RoleRoute allowed={["accountant"]}>
              <AccountantLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        {accountantRoutes.map((route) => (
          <Route
            key={route.path || "accountant-index"}
            path={route.path}
            index={route.index}
            element={
              <Suspense fallback={<div className="p-6">Loading…</div>}>
                {route.element}
              </Suspense>
            }
          />
        ))}
      </Route>

      {/* =====================================================
          SCHOOL ADMIN ROUTES
      ====================================================== */}

      <Route
        path="/school-admin"
        element={
          <ProtectedRoute>
            <RoleRoute allowed={["school_admin"]}>
              <SchoolAdminLayout />
            </RoleRoute>
          </ProtectedRoute>
        }
      >
        {schoolAdminRoutes.map((route) => (
          <Route
            key={route.path || "school-admin-index"}
            path={route.path}
            index={route.index}
            element={
              <Suspense fallback={<div className="p-6">Loading…</div>}>
                {route.element}
              </Suspense>
            }
          />
        ))}
      </Route>
    </Routes>
  );
}

export default AppRoutes;
