
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
      { path: "/school-admin/people/students", label: "Students" },
      { path: "/school-admin/people/teachers", label: "Teachers" },
      { path: "/school-admin/people/parents", label: "Parents / Guardians" },
      { path: "/school-admin/people/principals", label: "Principals" },
      { path: "/school-admin/people/other-staff", label: "Other Staff" },
    ],
  },
  {
    path: "/school-admin/academics",
    label: "Academics",
    icon: "🎓",
    children: [
      { path: "/school-admin/academics/classes", label: "Classes" },
      { path: "/school-admin/academics/subjects", label: "Subjects" },
      { path: "/school-admin/academics/departments", label: "Departments" },
      { path: "/school-admin/academics/sessions", label: "Sessions" },
      { path: "/school-admin/academics/terms", label: "Terms" },
      { path: "/school-admin/academics/class-subjects", label: "Class Subjects" },
    ],
  },
  {
    path: "/school-admin/student-management",
    label: "Student Management",
    icon: "🎓",
    children: [
      { path: "/school-admin/student-management/enrollment", label: "Enrollment" },
      { path: "/school-admin/student-management/promotion", label: "Promotion" },
      { path: "/school-admin/student-management/graduation", label: "Graduation" },
      { path: "/school-admin/student-management/student-accounts", label: "Student Accounts" },
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
      { path: "/school-admin/attendance/reports", label: "Reports" },
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
      { path: "/school-admin/examinations-results/exams", label: "Exams" },
      { path: "/school-admin/examinations-results/results", label: "Results" },
      { path: "/school-admin/examinations-results/result-approval", label: "Result Approval" },
      { path: "/school-admin/examinations-results/report-cards", label: "Report Cards" },
    ],
  },
  {
    path: "/school-admin/finance",
    label: "Finance",
    icon: "💰",
    children: [
      { path: "/school-admin/finance/fees", label: "Fees" },
      { path: "/school-admin/finance/payments", label: "Payments" },
      { path: "/school-admin/finance/outstanding-balances", label: "Outstanding Balances" },
      { path: "/school-admin/finance/reports", label: "Financial Reports" },
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
    children: [
      { path: "/school-admin/settings/school-information", label: "School Information" },
      { path: "/school-admin/settings/academic-settings", label: "Academic Settings" },
      { path: "/school-admin/settings/grading-settings", label: "Grading Settings" },
      { path: "/school-admin/settings/user-permissions", label: "User Permissions" },
    ],
  },
];

const isSectionActive = (route, pathname) => {
  if (route.path === "/school-admin") {
    return pathname === "/school-admin";
  }

  return (
    pathname === route.path ||
    pathname.startsWith(`${route.path}/`)
  );
};

const loadExpanded = () => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const SchoolAdminSidebar = ({ open, setOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [expanded, setExpanded] = useState(loadExpanded);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(expanded));
    } catch {
      // Ignore storage errors.
    }
  }, [expanded]);

  // Automatically expand the section containing the current page.
  useEffect(() => {
    const activeRoute = routes.find(
      (route) =>
        route.children &&
        isSectionActive(route, location.pathname)
    );

    if (activeRoute) {
      setExpanded((previous) =>
        previous[activeRoute.path]
          ? previous
          : { ...previous, [activeRoute.path]: true }
      );
    }
  }, [location.pathname]);

  const toggleSection = (path) => {
    setExpanded((previous) => ({
      ...previous,
      [path]: !previous[path],
    }));
  };

  const closeOnMobile = () => {
    if (window.innerWidth < 1024) {
      setOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setOpen(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-dvh min-h-0 w-64 flex-col overflow-hidden bg-[var(--color-sidebar)] shadow-lg transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
        aria-label="School Admin navigation"
      >
        {/* Fixed header */}
        <header className="flex h-16 min-h-16 shrink-0 items-center border-b border-white/10 px-5">
          <div>
            <h1 className="text-lg font-bold text-white">
              EduManageERP
            </h1>
            <p className="text-xs text-gray-400">
              School Admin
            </p>
          </div>

          <button
            type="button"
            className="ml-auto rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            ✕
          </button>
        </header>

        {/* The ONLY scrollable area.
            All navigation sections, including Settings, live here. */}
        <nav
          className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-3 py-4"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "thin",
          }}
          aria-label="School Admin menu"
        >
          <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            School Admin
          </div>

          <div className="space-y-1">
            {routes.map((route) => (
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

        {/* Fixed footer.
            It is outside the scrollable navigation. */}
        <footer className="relative z-10 shrink-0 border-t border-white/10 bg-[var(--color-sidebar)] px-3 py-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-12 w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-gray-300 transition hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <span
              className="w-6 shrink-0 text-center"
              aria-hidden="true"
            >
              ↪
            </span>
            <span>Logout</span>
          </button>
        </footer>
      </aside>
    </>
  );
};

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

  const active = isSectionActive(route, pathname);
  const isExpanded = !!expanded[route.path];

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
        <span className="w-6 shrink-0 text-center" aria-hidden="true">
          {route.icon}
        </span>
        <span className="min-w-0">{route.label}</span>
      </NavLink>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => toggleSection(route.path)}
        aria-expanded={isExpanded}
        aria-controls={`sidebar-section-${route.path.replace(/[^a-zA-Z0-9]/g, "-")}`}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
          active
            ? "bg-[var(--color-primary)] text-white"
            : "text-gray-300 hover:bg-white/10 hover:text-white"
        }`}
      >
        <span className="w-6 shrink-0 text-center" aria-hidden="true">
          {route.icon}
        </span>

        <span className="min-w-0 flex-1">{route.label}</span>

        <span
          className={`shrink-0 text-xs transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {isExpanded && (
        <div
          id={`sidebar-section-${route.path.replace(/[^a-zA-Z0-9]/g, "-")}`}
          className="ml-6 mt-1 space-y-1 border-l border-white/10 pl-3"
        >
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