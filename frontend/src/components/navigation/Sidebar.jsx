// import { NavLink } from "react-router-dom";
// import { adminRoutes } from "../../routes/adminRoutes";

// function Sidebar({ sidebarOpen, setSidebarOpen }) {
//   const mainItems = adminRoutes.filter((r) => r.label && !r.bottom);
//   const bottomItems = adminRoutes.filter((r) => r.label && r.bottom);

//   const buildPath = (path) => (path === "" ? "/admin" : `/admin/${path}`);

//   return (
//     <aside
//       className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-y-auto bg-[var(--color-sidebar)] text-white transition-transform duration-300 ease-in-out
//         ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
//     >
//       {/* Logo */}
//       <div className="flex h-[76px] shrink-0 items-center justify-between gap-3 border-b border-white/10 px-5">
//         <div className="flex items-center gap-3">
//           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-xl font-extrabold text-white shadow-lg shadow-purple-900/20">
//             E
//           </div>
//           <div>
//             <h2 className="m-0 text-lg font-bold tracking-tight">EduManage</h2>
//             <span className="text-[10px] font-semibold tracking-[0.2em] text-slate-400">
//               ERP
//             </span>
//           </div>
//         </div>

//         <button
//           type="button"
//           aria-label="Close sidebar"
//           onClick={() => setSidebarOpen(false)}
//           className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white md:hidden"
//         >
//           ✕
//         </button>
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 px-3 py-5">
//         <p className="mb-3 px-2 text-[10px] font-bold tracking-[0.15em] text-slate-500">
//           MAIN MENU
//         </p>
//         <div className="space-y-1">
//           {mainItems.map((item) => (
//             <NavLink
//               key={item.path}
//               to={buildPath(item.path)}
//               end={item.index}
//               onClick={() => setSidebarOpen(false)}
//               className={({ isActive }) =>
//                 `group flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium no-underline transition-all duration-200 ${
//                   isActive
//                     ? "bg-[var(--color-primary)] text-white shadow-lg shadow-purple-900/20"
//                     : "text-slate-300 hover:bg-white/10 hover:text-white"
//                 }`
//               }
//             >
//               <span className="flex w-6 shrink-0 items-center justify-center text-base">
//                 {item.icon}
//               </span>
//               <span>{item.label}</span>
//             </NavLink>
//           ))}
//         </div>
//       </nav>

//       {/* Settings */}
//       <div className="shrink-0 border-t border-white/10 p-3 space-y-1">
//         {bottomItems.map((item) => (
//           <NavLink
//             key={item.path}
//             to={buildPath(item.path)}
//             onClick={() => setSidebarOpen(false)}
//             className={({ isActive }) =>
//               `flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium no-underline transition-all duration-200 ${
//                 isActive
//                   ? "bg-[var(--color-primary)] text-white"
//                   : "text-slate-300 hover:bg-white/10 hover:text-white"
//               }`
//             }
//           >
//             <span className="flex w-6 items-center justify-center text-base">
//               {item.icon}
//             </span>
//             <span>{item.label}</span>
//           </NavLink>
//         ))}
//       </div>
//     </aside>
//   );
// }

// export default Sidebar;

import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { adminRoutes } from "../../routes/adminRoutes";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const mainItems = adminRoutes.filter((r) => r.label && !r.bottom);
  const bottomItems = adminRoutes.filter((r) => r.label && r.bottom);

  const buildPath = (path) => (path === "" ? "/admin" : `/admin/${path}`);

  // Auto-expand a submenu if the current URL is inside it
  const [openMenu, setOpenMenu] = useState(() => {
    const active = mainItems.find((item) =>
      item.children?.some((c) => location.pathname === buildPath(c.path)),
    );
    return active?.path ?? null;
  });

  const toggleMenu = (path) => {
    setOpenMenu((prev) => (prev === path ? null : path));
  };

  const linkClasses = ({ isActive }) =>
    `group flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium no-underline transition-all duration-200 ${
      isActive
        ? "bg-[var(--color-primary)] text-white shadow-lg shadow-purple-900/20"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-y-auto bg-[var(--color-sidebar)] text-white transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
    >
      {/* Logo */}
      <div className="flex h-[76px] shrink-0 items-center justify-between gap-3 border-b border-white/10 px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-xl font-extrabold text-white shadow-lg shadow-purple-900/20">
            E
          </div>
          <div>
            <h2 className="m-0 text-lg font-bold tracking-tight">EduManage</h2>
            <span className="text-[10px] font-semibold tracking-[0.2em] text-slate-400">
              ERP
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

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5">
        <p className="mb-3 px-2 text-[10px] font-bold tracking-[0.15em] text-slate-500">
          MAIN MENU
        </p>
        <div className="space-y-1">
          {mainItems.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
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
                  <span className="flex-1 text-left">{item.label}</span>
                  {/* <span className="flex-1 text-left">{item.label}</span>
                  <span
                    className={`text-xs transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </span> */}
                </button>

                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    isOpen ? "mt-1 max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="space-y-1 py-1 pl-6">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={buildPath(child.path)}
                        end
                        onClick={() => setSidebarOpen(false)}
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
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Settings */}
      <div className="shrink-0 border-t border-white/10 p-3 space-y-1">
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

export default Sidebar;

// import { NavLink } from "react-router-dom";
// import { adminRoutes } from "../routes/adminRoutes";

// function Sidebar({ sidebarOpen, setSidebarOpen }) {
//   const mainItems = adminRoutes.filter(
//     (r) => r.label && !r.hideInNav && !r.bottom,
//   );
//   const bottomItems = adminRoutes.filter(
//     (r) => r.label && !r.hideInNav && r.bottom,
//   );

//   const renderLink = (item) => (
//     <NavLink
//       key={item.path}
//       to={item.path === "" ? "/admin" : `/admin/${item.path}`}
//       end={item.index}
//       onClick={() => setSidebarOpen(false)}
//       className={({ isActive }) =>
//         `group flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium no-underline transition-all duration-200 ${
//           isActive
//             ? "bg-[var(--color-primary)] text-white shadow-lg shadow-purple-900/20"
//             : "text-slate-300 hover:bg-white/10 hover:text-white"
//         }`
//       }
//     >
//       <span className="flex w-6 shrink-0 items-center justify-center text-base">
//         {item.icon}
//       </span>
//       <span>{item.label}</span>
//     </NavLink>
//   );

//   return (
//     <aside
//       className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-y-auto bg-[var(--color-sidebar)] text-white transition-transform duration-300 ease-in-out
//         ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
//     >
//       {/* Logo */}
//       <div className="flex h-[76px] shrink-0 items-center justify-between gap-3 border-b border-white/10 px-5">
//         <div className="flex items-center gap-3">
//           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-xl font-extrabold text-white shadow-lg shadow-purple-900/20">
//             E
//           </div>
//           <div>
//             <h2 className="m-0 text-lg font-bold tracking-tight">EduManage</h2>
//             <span className="text-[10px] font-semibold tracking-[0.2em] text-slate-400">
//               ERP
//             </span>
//           </div>
//         </div>

//         {/* Mobile close button */}
//         <button
//           type="button"
//           aria-label="Close sidebar"
//           onClick={() => setSidebarOpen(false)}
//           className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white md:hidden"
//         >
//           ✕
//         </button>
//       </div>

//       <nav className="flex-1 px-3 py-5">
//         <p className="mb-3 px-2 text-[10px] font-bold tracking-[0.15em] text-slate-500">
//           MAIN MENU
//         </p>
//         <div className="space-y-1">{mainItems.map(renderLink)}</div>
//       </nav>

//       <div className="shrink-0 border-t border-white/10 p-3 space-y-1">
//         {bottomItems.map(renderLink)}
//       </div>
//     </aside>
//   );
// }

// export default Sidebar;
