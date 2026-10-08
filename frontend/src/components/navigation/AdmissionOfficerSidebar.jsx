import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  LayoutDashboard,
  ClipboardList,
  Users,
  UserPlus,
  GraduationCap,
  UserCircle,
  Settings,
  LogOut,
  X,
  Bell,
} from "lucide-react";

function AdmissionOfficerSidebar({
  sidebarOpen,
  setSidebarOpen,
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // ============================================================
  // MAIN NAVIGATION
  // ============================================================

  const menuItems = [
    {
      label: "Dashboard",
      path: "/admission-officer",
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: "Applicants",
      path: "/admission-officer/applicants",
      icon: ClipboardList,
    },
    {
      label: "Students",
      path: "/admission-officer/students",
      icon: Users,
    },
    {
      label: "Enrollment",
      path: "/admission-officer/enrollment",
      icon: UserPlus,
    },
    {
      label: "Promotion",
      path: "/admission-officer/promotion",
      icon: GraduationCap,
    },
    {
      label: "Notifications",
      path: "/admission-officer/notifications",
      icon: Bell,
    },
    {
      label: "Profile",
      path: "/admission-officer/profile",
      icon: UserCircle,
    },
  ];

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }

    navigate("/login", {
      replace: true,
    });
  };

  // ============================================================
  // CLOSE MOBILE SIDEBAR
  // ============================================================

  const handleNavigation = () => {
    if (setSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      {/* ================================================== */}
      {/* MOBILE OVERLAY */}
      {/* ================================================== */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================================================== */}
      {/* SIDEBAR */}
      {/* ================================================== */}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-[var(--color-sidebar)] text-white transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary)]">
              <GraduationCap size={23} />
            </div>

            <div>
              <h1 className="text-base font-bold">
                EduManageERP
              </h1>

              <p className="text-xs text-slate-400">
                Admission Officer
              </p>
            </div>
          </div>

          {/* MOBILE CLOSE */}

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={21} />
          </button>
        </div>

        {/* ================================================== */}
        {/* USER */}
        {/* ================================================== */}

        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            {user?.profile_image ? (
              <img
                src={
                  user.profile_image.startsWith("http")
                    ? user.profile_image
                    : `http://127.0.0.1:8000${user.profile_image}`
                }
                alt={
                  user?.first_name ||
                  user?.username ||
                  "Admission Officer"
                }
                className="h-11 w-11 rounded-full border-2 border-primary object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-300">
                {(
                  user?.first_name?.[0] ||
                  user?.username?.[0] ||
                  "A"
                ).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {user?.first_name
                  ? `${user.first_name} ${
                      user?.last_name || ""
                    }`
                  : user?.username || "Admission Officer"}
              </p>

              <p className="truncate text-xs text-slate-400">
                Admission Officer
              </p>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* MAIN NAVIGATION */}
        {/* ================================================== */}

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={handleNavigation}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-[var(--color-primary)] text-white shadow-lg shadow-blue-900/20"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <Icon
                    size={20}
                    className="shrink-0"
                  />

                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* ================================================== */}
        {/* BOTTOM ACTIONS */}
        {/* ================================================== */}

        <div className="border-t border-white/10 p-3">
          <div className="space-y-1.5">
            {/* SETTINGS */}

            <NavLink
              to="/admission-officer/settings"
              onClick={handleNavigation}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-[var(--color-primary)] text-white shadow-lg shadow-blue-900/20"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Settings size={20} />

              <span>Settings</span>
            </NavLink>

            {/* LOGOUT */}

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut size={20} />

              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default AdmissionOfficerSidebar;