import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { principalRoutes } from "../../routes/principalRoutes";

function PrincipalSidebar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const mainItems = principalRoutes.filter(
    (r) => r.label && !r.bottom,
  );

  const bottomItems = principalRoutes.filter(
    (r) => r.label && r.bottom,
  );

  // =====================================================
  // BUILD PRINCIPAL ROUTE
  // =====================================================

  const buildPath = (path) =>
    path === "" ? "/principal" : `/principal/${path}`;

  // =====================================================
  // BUILD SUBMENU ROUTE
  // =====================================================

  const buildChildPath = (parentPath, childPath) => {
    if (!childPath) {
      return buildPath(parentPath);
    }

    if (
      childPath === parentPath ||
      childPath.startsWith(`${parentPath}/`)
    ) {
      return buildPath(childPath);
    }

    return buildPath(`${parentPath}/${childPath}`);
  };

  // =====================================================
  // FIND ACTIVE SUBMENU
  // =====================================================

  const findActiveMenu = () => {
    const active = mainItems.find((item) =>
      item.children?.some(
        (child) =>
          location.pathname ===
          buildChildPath(item.path, child.path),
      ),
    );

    return active?.path ?? null;
  };

  const [openMenu, setOpenMenu] = useState(() =>
    findActiveMenu(),
  );

  const toggleMenu = (path) => {
    setOpenMenu((prev) =>
      prev === path ? null : path,
    );
  };

  // =====================================================
  // LINK STYLING
  // =====================================================

  const linkClasses = ({ isActive }) =>
    `group flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium no-underline transition-all duration-200 ${
      isActive
        ? "bg-[var(--color-primary)] text-white shadow-lg shadow-purple-900/20"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-y-auto bg-[var(--color-sidebar)] text-white transition-transform duration-300 ease-in-out ${
        sidebarOpen
          ? "translate-x-0"
          : "-translate-x-full"
      } md:translate-x-0`}
    >

      {/* =================================================
          LOGO
      ================================================= */}

      <div className="flex h-[76px] shrink-0 items-center justify-between gap-3 border-b border-white/10 px-5">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-xl font-extrabold text-white shadow-lg shadow-purple-900/20">
            E
          </div>

          <div>
            <h2 className="m-0 text-lg font-bold tracking-tight">
              EduManage
            </h2>

            <span className="text-[10px] font-semibold tracking-[0.2em] text-slate-400">
              ERP
            </span>
          </div>

        </div>

        {/* Mobile close */}

        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white md:hidden"
        >
          ✕
        </button>

      </div>

      {/* =================================================
          USER
      ================================================= */}

      <div className="border-b border-white/10 px-5 py-4">

        <p className="truncate text-sm font-semibold text-white">
          {user?.first_name || "Principal"}{" "}
          {user?.last_name || ""}
        </p>

        <p className="text-xs text-slate-400">
          Principal
        </p>

      </div>

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <nav className="flex-1 px-3 py-5">

        <p className="mb-3 px-2 text-[10px] font-bold tracking-[0.15em] text-slate-500">
          MAIN MENU
        </p>

        <div className="space-y-1">

          {mainItems.map((item) => {

            const hasChildren =
              item.children &&
              item.children.length > 0;

            const isOpen =
              openMenu === item.path;

            // =================================================
            // NORMAL MENU ITEM
            // =================================================

            if (!hasChildren) {
              return (
                <NavLink
                  key={item.path}
                  to={buildPath(item.path)}
                  end={item.index}
                  onClick={() =>
                    setSidebarOpen(false)
                  }
                  className={linkClasses}
                >
                  <span className="flex w-6 shrink-0 items-center justify-center text-base">
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </NavLink>
              );
            }

            // =================================================
            // MENU WITH SUBMENU
            // =================================================

            return (
              <div key={item.path}>

                <button
                  type="button"
                  onClick={() =>
                    toggleMenu(item.path)
                  }
                  className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-200 ${
                    isOpen
                      ? "bg-white/10 text-white"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >

                  <span className="flex w-6 shrink-0 items-center justify-center text-base">
                    {item.icon}
                  </span>

                  <span className="flex-1 text-left">
                    {item.label}
                  </span>

                </button>

                {/* =================================================
                    SUBMENU
                ================================================= */}

                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    isOpen
                      ? "mt-1 max-h-96"
                      : "max-h-0"
                  }`}
                >

                  <div className="space-y-1 py-1 pl-6">

                    {item.children.map((child) => {

                      const childPath =
                        buildChildPath(
                          item.path,
                          child.path,
                        );

                      return (
                        <NavLink
                          key={child.path}
                          to={childPath}
                          end
                          onClick={() =>
                            setSidebarOpen(false)
                          }
                          className={({ isActive }) =>
                            `flex min-h-9 w-full items-center rounded-lg px-3 text-xs font-medium no-underline transition-all duration-200 ${
                              isActive
                                ? "bg-[var(--color-primary)] text-white"
                                : "text-slate-400 hover:bg-white/10 hover:text-white"
                            }`
                          }
                        >
                          {child.label}
                        </NavLink>
                      );

                    })}

                  </div>

                </div>

              </div>
            );
          })}

        </div>
      </nav>

      {/* =================================================
          SETTINGS / BOTTOM
      ================================================= */}

      <div className="shrink-0 space-y-1 border-t border-white/10 p-3">

        {bottomItems.map((item) => (

          <NavLink
            key={item.path}
            to={buildPath(item.path)}
            onClick={() =>
              setSidebarOpen(false)
            }
            className={linkClasses}
          >

            <span className="flex w-6 items-center justify-center text-base">
              {item.icon}
            </span>

            <span>{item.label}</span>

          </NavLink>

        ))}

        {/* Logout */}

        <button
          type="button"
          onClick={logout}
          className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white"
        >

          <span className="flex w-6 items-center justify-center text-base">
            ↪
          </span>

          <span>Logout</span>

        </button>

      </div>

    </aside>
  );
}

export default PrincipalSidebar;