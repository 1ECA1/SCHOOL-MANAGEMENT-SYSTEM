
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { librarianRoutes } from "../../routes/librarianRoutes";

function LibrarianSidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();

  const mainItems = librarianRoutes.filter(
    (r) => r.label && !r.bottom,
  );

  const bottomItems = librarianRoutes.filter(
    (r) => r.label && r.bottom,
  );

  const buildPath = (path) =>
    path === "" ? "/librarian" : `/librarian/${path}`;

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
          HEADER
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
              LIBRARY
            </span>
          </div>
        </div>

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
          MAIN MENU
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

            const isOpen = openMenu === item.path;

            if (!hasChildren) {
              return (
                <NavLink
                  key={item.path}
                  to={buildPath(item.path)}
                  end={item.index}
                  onClick={() => setSidebarOpen(false)}
                  className={linkClasses}
                >
                  <span className="flex w-6 shrink-0 items-center justify-center text-base">
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </NavLink>
              );
            }

            return (
              <div key={item.path}>
                <button
                  type="button"
                  onClick={() => toggleMenu(item.path)}
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

                  <span
                    className={`text-xs transition-transform duration-200 ${
                      isOpen ? "rotate-90" : ""
                    }`}
                  >
                    ›
                  </span>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    isOpen
                      ? "mt-1 max-h-96"
                      : "max-h-0"
                  }`}
                >
                  <div className="space-y-1 py-1 pl-6">
                    {item.children.map((child) => {
                      const childPath = buildChildPath(
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
          BOTTOM MENU
      ================================================= */}
      <div className="shrink-0 space-y-1 border-t border-white/10 p-3">
        {bottomItems.map((item) => (
          <NavLink
            key={item.path}
            to={buildPath(item.path)}
            onClick={() => setSidebarOpen(false)}
            className={linkClasses}
          >
            <span className="flex w-6 items-center justify-center text-base">
              {item.icon}
            </span>

            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}

export default LibrarianSidebar;
