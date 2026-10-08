import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const STORAGE_KEY = "school-admin-sidebar-expanded";

const routes = [
  {
    path: "/school-admin",
    label: "Dashboard",
    icon: "▦",
  },

  {
    path: "/school-admin/people",
    label: "People",
    icon: "👥",
    children: [
      {
        path: "/school-admin/people/students",
        label: "Students",
      },
      {
        path: "/school-admin/people/teachers",
        label: "Teachers",
      },
      {
        path: "/school-admin/people/parents",
        label: "Parents / Guardians",
      },
      {
        path: "/school-admin/people/principals",
        label: "Principals",
      },
      {
        path: "/school-admin/people/other-staff",
        label: "Other Staff",
      },
    ],
  },

  {
    path: "/school-admin/academics",
    label: "Academics",
    icon: "🎓",
    children: [
      {
        path: "/school-admin/academics/classes",
        label: "Classes",
      },
      {
        path: "/school-admin/academics/subjects",
        label: "Subjects",
      },
      {
        path: "/school-admin/academics/departments",
        label: "Departments",
      },
      {
        path: "/school-admin/academics/sessions",
        label: "Sessions",
      },
      {
        path: "/school-admin/academics/terms",
        label: "Terms",
      },
      {
        path: "/school-admin/academics/class-subjects",
        label: "Class Subjects",
      },
    ],
  },

  {
    path: "/school-admin/student-management",
    label: "Student Management",
    icon: "🎓",
    children: [
      {
        path: "/school-admin/student-management/enrollment",
        label: "Enrollment",
      },
      {
        path: "/school-admin/student-management/promotion",
        label: "Promotion",
      },
      {
        path: "/school-admin/student-management/graduation",
        label: "Graduation",
      },
      {
        path: "/school-admin/student-management/student-accounts",
        label: "Student Accounts",
      },
    ],
  },

  {
    path: "/school-admin/attendance",
    label: "Attendance",
    icon: "📝",
    children: [
      {
        path: "/school-admin/attendance/attendance",
        label: "Attendance",
        end: true,
      },
      {
        path: "/school-admin/attendance/reports",
        label: "Reports",
      },
    ],
  },

  {
    path: "/school-admin/assignments",
    label: "Assignments",
    icon: "📝",
  },

  {
    path: "/school-admin/examinations-results",
    label: "Examinations & Results",
    icon: "📊",
    children: [
      {
        path: "/school-admin/examinations-results/exams",
        label: "Exams",
      },
      {
        path: "/school-admin/examinations-results/results",
        label: "Results",
      },
      {
        path: "/school-admin/examinations-results/result-approval",
        label: "Result Approval",
      },
      {
        path: "/school-admin/examinations-results/report-cards",
        label: "Report Cards",
      },
    ],
  },

  {
    path: "/school-admin/finance",
    label: "Finance",
    icon: "💰",
    children: [
      {
        path: "/school-admin/finance/fees",
        label: "Fees",
      },
      {
        path: "/school-admin/finance/payments",
        label: "Payments",
      },
      {
        path: "/school-admin/finance/outstanding-balances",
        label: "Outstanding Balances",
      },
      {
        path: "/school-admin/finance/reports",
        label: "Financial Reports",
      },
    ],
  },

  {
    path: "/school-admin/notifications",
    label: "Notifications",
    icon: "🔔",
  },

  {
    path: "/school-admin/audit",
    label: "Audit",
    icon: "📈",
  },

  {
    path: "/school-admin/settings",
    label: "Settings",
    icon: "⚙",
    bottom: true,
    children: [
      {
        path: "/school-admin/settings/school-information",
        label: "School Information",
      },
      {
        path: "/school-admin/settings/academic-settings",
        label: "Academic Settings",
      },
      {
        path: "/school-admin/settings/grading-settings",
        label: "Grading Settings",
      },
      {
        path: "/school-admin/settings/user-permissions",
        label: "User Permissions",
      },
    ],
  },
];

const isSectionActive = (route, pathname) => {
  if (route.path === "/school-admin") {
    return pathname === "/school-admin";
  }

  return (
    pathname === route.path ||
    pathname.startsWith(route.path + "/")
  );
};

const loadExpanded = () => {
  try {
    return JSON.parse(
      sessionStorage.getItem(STORAGE_KEY)
    ) || {};
  } catch {
    return {};
  }
};

const SchoolAdminSidebar = ({ open, setOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [expanded, setExpanded] = useState(loadExpanded);

  // =====================================================
  // SAVE EXPANDED SECTIONS
  // =====================================================

  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(expanded)
      );
    } catch {
      /* Ignore storage errors */
    }
  }, [expanded]);

  // =====================================================
  // AUTO-OPEN CURRENT SECTION
  // =====================================================

  useEffect(() => {
    const activeRoute = routes.find(
      (route) =>
        route.children &&
        isSectionActive(route, location.pathname)
    );

    if (activeRoute) {
      setExpanded((prev) =>
        prev[activeRoute.path]
          ? prev
          : {
              ...prev,
              [activeRoute.path]: true,
            }
      );
    }
  }, [location.pathname]);

  // =====================================================
  // TOGGLE SECTION
  // =====================================================

  const toggleSection = (path) => {
    setExpanded((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  // =====================================================
  // MOBILE CLOSE
  // =====================================================

  const closeOnMobile = () => {
    if (window.innerWidth < 1024) {
      setOpen(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setOpen(false);
      navigate("/login", {
        replace: true,
      });
    }
  };

  return (
    <>
      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-[var(--color-sidebar)] shadow-lg transition-transform duration-300 lg:translate-x-0 ${
          open
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex h-16 shrink-0 items-center border-b border-white/10 px-5">
          <div>
            <h1 className="text-lg font-bold text-white">
              EduManageERP
            </h1>

            <p className="text-xs text-gray-400">
              School Admin
            </p>
          </div>

          {/* MOBILE CLOSE BUTTON */}

          <button
            type="button"
            className="ml-auto rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            ✕
          </button>
        </div>

        {/* =====================================================
            NAVIGATION
        ===================================================== */}

        <nav className="flex-1 overflow-y-auto px-3 py-4">

          <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            School Admin
          </div>

          <div className="space-y-1">
            {routes
              .filter((route) => !route.bottom)
              .map((route) => (
                <SidebarItem
                  key={route.path}
                  route={route}
                  expanded={expanded}
                  toggleSection={toggleSection}
                  pathname={location.pathname}
                  onNavigate={closeOnMobile}
                />
              ))}
          </div>
        </nav>

        {/* =====================================================
            SETTINGS + LOGOUT
            FIXED AT BOTTOM
        ===================================================== */}

        <div className="shrink-0 border-t border-white/10 bg-[var(--color-sidebar)] px-3 py-4">

          {/* SETTINGS */}

          {routes
            .filter((route) => route.bottom)
            .map((route) => (
              <SidebarItem
                key={route.path}
                route={route}
                expanded={expanded}
                toggleSection={toggleSection}
                pathname={location.pathname}
                onNavigate={closeOnMobile}
              />
            ))}

          {/* =================================================
              LOGOUT BUTTON
          ================================================= */}

          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-300 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <span className="w-6 text-center">
              ↪
            </span>

            <span>
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

// =========================================================
// SIDEBAR ITEM
// =========================================================

const SidebarItem = ({
  route,
  expanded,
  toggleSection,
  pathname,
  onNavigate,
}) => {
  const hasChildren =
    Array.isArray(route.children) &&
    route.children.length > 0;

  const active = isSectionActive(
    route,
    pathname
  );

  const isExpanded =
    !!expanded[route.path];

  // =====================================================
  // ITEM WITHOUT CHILDREN
  // =====================================================

  if (!hasChildren) {
    return (
      <NavLink
        to={route.path}
        end
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            isActive
              ? "bg-[var(--color-primary)] text-white"
              : "text-gray-300 hover:bg-white/10 hover:text-white"
          }`
        }
      >
        <span className="w-6 text-center">
          {route.icon}
        </span>

        <span>
          {route.label}
        </span>
      </NavLink>
    );
  }

  // =====================================================
  // ITEM WITH DROPDOWN
  // =====================================================

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          toggleSection(route.path)
        }
        aria-expanded={isExpanded}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
          active
            ? "bg-[var(--color-primary)] text-white"
            : "text-gray-300 hover:bg-white/10 hover:text-white"
        }`}
      >
        <span className="w-6 text-center">
          {route.icon}
        </span>

        <span className="flex-1">
          {route.label}
        </span>
      </button>

      {/* =================================================
          CHILDREN
      ================================================= */}

      {isExpanded && (
        <div className="ml-6 mt-1 space-y-1 border-l border-white/10 pl-3">
          {route.children.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              end={child.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-[var(--color-secondary)]/15 font-medium text-[var(--color-secondary)]"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }`
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchoolAdminSidebar;