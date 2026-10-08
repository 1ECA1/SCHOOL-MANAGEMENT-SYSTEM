import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { teacherRoutes } from "../../routes/teacherRoutes";

function TeacherSidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Only routes that should appear in the sidebar.
  const menuItems = teacherRoutes.filter(
    (route) =>
      route.label &&
      !route.hideInNav
  );

  const handleNavigation = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    }

    navigate("/login");
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50
        flex w-64 flex-col
        bg-[#111827] text-white
        shadow-xl
        transition-transform duration-300 ease-in-out
        md:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* =================================================
          LOGO / HEADER
      ================================================= */}
      <div className="flex h-20 items-center border-b border-white/10 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-bold text-[#111827]">
          E
        </div>

        <div className="ml-3">
          <h1 className="text-base font-bold tracking-wide">
            EduManageERP
          </h1>

          <p className="text-xs text-slate-400">
            Teacher Portal
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white md:hidden"
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>

      {/* =================================================
          USER INFORMATION
      ================================================= */}
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-700">
            {user?.first_name?.charAt(0)?.toUpperCase() ||
              user?.username?.charAt(0)?.toUpperCase() ||
              "T"}
          </div>

          <div className="ml-3 min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {user?.first_name
                ? `${user.first_name} ${user.last_name || ""}`.trim()
                : user?.username || "Teacher"}
            </p>

            <p className="text-xs text-slate-400">
              Teacher
            </p>
          </div>
        </div>
      </div>

      {/* =================================================
          NAVIGATION
      ================================================= */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
          Teacher Portal
        </p>

        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={`/teacher${item.path ? `/${item.path}` : ""}`}
              end={item.end ?? item.index}
              onClick={handleNavigation}
              className={({ isActive }) =>
                `
                flex items-center rounded-xl px-3 py-3
                text-sm font-medium
                transition-all duration-200
                ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }
                `
              }
            >
              <span className="flex w-7 items-center justify-center text-base">
                {item.icon}
              </span>

              <span className="ml-2">
                {item.label}
              </span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* =================================================
          LOGOUT
      ================================================= */}
      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center rounded-xl px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <span className="flex w-7 items-center justify-center">
            ↪
          </span>

          <span className="ml-2">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}

export default TeacherSidebar;