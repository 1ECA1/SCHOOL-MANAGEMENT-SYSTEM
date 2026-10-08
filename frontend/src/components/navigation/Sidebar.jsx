


// import { useState } from "react";
// import { NavLink, useLocation } from "react-router-dom";
// import { adminRoutes } from "../../routes/adminRoutes";

// function Sidebar({ sidebarOpen, setSidebarOpen }) {
//   const location = useLocation();

//   const mainItems = adminRoutes.filter((r) => r.label && !r.bottom);
//   const bottomItems = adminRoutes.filter((r) => r.label && r.bottom);

//   // =====================================================
//   // BUILD MAIN ROUTE
//   // =====================================================
//   const buildPath = (path) =>
//     path === "" ? "/admin" : `/admin/${path}`;

//   // =====================================================
//   // BUILD SUBMENU ROUTE
//   //
//   // Supports both:
//   //
//   // Academic:
//   //   child.path = "class-subjects"
//   //   result = /admin/academic/class-subjects
//   //
//   // Attendance:
//   //   child.path = "attendance/records"
//   //   result = /admin/attendance/records
//   //
//   // Library:
//   //   child.path = "library/books"
//   //   result = /admin/library/books
//   // =====================================================
//   const buildChildPath = (parentPath, childPath) => {
//     if (!childPath) {
//       return buildPath(parentPath);
//     }

//     // If the child already contains the parent path,
//     // don't add the parent again.
//     if (
//       childPath === parentPath ||
//       childPath.startsWith(`${parentPath}/`)
//     ) {
//       return buildPath(childPath);
//     }

//     // Otherwise treat it as a relative child path.
//     return buildPath(`${parentPath}/${childPath}`);
//   };

//   // =====================================================
//   // FIND ACTIVE SUBMENU
//   // =====================================================
//   const findActiveMenu = () => {
//     const active = mainItems.find((item) =>
//       item.children?.some(
//         (child) =>
//           location.pathname ===
//           buildChildPath(item.path, child.path),
//       ),
//     );

//     return active?.path ?? null;
//   };

//   // =====================================================
//   // OPEN MENU
//   // =====================================================
//   const [openMenu, setOpenMenu] = useState(() =>
//     findActiveMenu(),
//   );

//   const toggleMenu = (path) => {
//     setOpenMenu((prev) =>
//       prev === path ? null : path,
//     );
//   };

//   // =====================================================
//   // MAIN / NORMAL LINK STYLING
//   // =====================================================
//   const linkClasses = ({ isActive }) =>
//     `group flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium no-underline transition-all duration-200 ${
//       isActive
//         ? "bg-[var(--color-primary)] text-white shadow-lg shadow-purple-900/20"
//         : "text-slate-300 hover:bg-white/10 hover:text-white"
//     }`;

//   return (
//     <aside
//       className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-y-auto bg-[var(--color-sidebar)] text-white transition-transform duration-300 ease-in-out
//         ${
//           sidebarOpen
//             ? "translate-x-0"
//             : "-translate-x-full"
//         } md:translate-x-0`}
//     >
//       {/* =================================================
//           LOGO
//       ================================================= */}
//       <div className="flex h-[76px] shrink-0 items-center justify-between gap-3 border-b border-white/10 px-5">
//         <div className="flex items-center gap-3">
//           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-xl font-extrabold text-white shadow-lg shadow-purple-900/20">
//             E
//           </div>

//           <div>
//             <h2 className="m-0 text-lg font-bold tracking-tight">
//               EduManage
//             </h2>

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

//       {/* =================================================
//           NAVIGATION
//       ================================================= */}
//       <nav className="flex-1 px-3 py-5">
//         <p className="mb-3 px-2 text-[10px] font-bold tracking-[0.15em] text-slate-500">
//           MAIN MENU
//         </p>

//         <div className="space-y-1">
//           {mainItems.map((item) => {
//             const hasChildren =
//               item.children &&
//               item.children.length > 0;

//             const isOpen = openMenu === item.path;

//             {/* ===========================================
//                 NORMAL MENU ITEM
//             =========================================== */}
//             if (!hasChildren) {
//               return (
//                 <NavLink
//                   key={item.path}
//                   to={buildPath(item.path)}
//                   end={item.index}
//                   onClick={() => setSidebarOpen(false)}
//                   className={linkClasses}
//                 >
//                   <span className="flex w-6 shrink-0 items-center justify-center text-base">
//                     {item.icon}
//                   </span>

//                   <span>{item.label}</span>
//                 </NavLink>
//               );
//             }

//             {/* ===========================================
//                 MENU WITH SUBMENU
//             =========================================== */}
//             return (
//               <div key={item.path}>
//                 {/* Parent button */}
//                 <button
//                   type="button"
//                   onClick={() => toggleMenu(item.path)}
//                   className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-200 ${
//                     isOpen
//                       ? "bg-white/10 text-white"
//                       : "text-slate-300 hover:bg-white/10 hover:text-white"
//                   }`}
//                 >
//                   <span className="flex w-6 shrink-0 items-center justify-center text-base">
//                     {item.icon}
//                   </span>

//                   <span className="flex-1 text-left">
//                     {item.label}
//                   </span>
//                 </button>

//                 {/* =======================================
//                     SUBMENU
//                 ======================================= */}
//                 <div
//                   className={`overflow-hidden transition-all duration-200 ${
//                     isOpen
//                       ? "mt-1 max-h-96"
//                       : "max-h-0"
//                   }`}
//                 >
//                   <div className="space-y-1 py-1 pl-6">
//                     {item.children.map((child) => {
//                       const childPath = buildChildPath(
//                         item.path,
//                         child.path,
//                       );

//                       return (
//                         <NavLink
//                           key={child.path}
//                           to={childPath}
//                           end
//                           onClick={() =>
//                             setSidebarOpen(false)
//                           }
//                           className={({ isActive }) =>
//                             `flex min-h-9 w-full items-center rounded-lg px-3 text-xs font-medium no-underline transition-all duration-200 ${
//                               isActive
//                                 ? "bg-[var(--color-primary)] text-white"
//                                 : "text-slate-400 hover:bg-white/10 hover:text-white"
//                             }`
//                           }
//                         >
//                           {child.label}
//                         </NavLink>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </nav>

//       {/* =================================================
//           SETTINGS / BOTTOM ITEMS
//       ================================================= */}
//       <div className="shrink-0 space-y-1 border-t border-white/10 p-3">
//         {bottomItems.map((item) => (
//           <NavLink
//             key={item.path}
//             to={buildPath(item.path)}
//             onClick={() => setSidebarOpen(false)}
//             className={linkClasses}
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

function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  routes = [],
  basePath = "/admin",
}) {
  const location = useLocation();

  // ---------------------------------------------------
  // ONLY SHOW ROUTES THAT HAVE A LABEL AND ARE NOT HIDDEN
  // ---------------------------------------------------

  const mainItems = routes.filter(
    (route) =>
      route.label &&
      !route.hideInNav &&
      !route.bottom
  );

  const bottomItems = routes.filter(
    (route) =>
      route.label &&
      !route.hideInNav &&
      route.bottom
  );

  // ---------------------------------------------------
  // BUILD MAIN ROUTE
  // ---------------------------------------------------

  const buildPath = (path) => {
    if (path === "") {
      return basePath;
    }

    return `${basePath}/${path}`;
  };

  // ---------------------------------------------------
  // BUILD CHILD ROUTE
  // ---------------------------------------------------

  const buildChildPath = (parentPath, childPath) => {
    if (!childPath) {
      return buildPath(parentPath);
    }

    // Child path already contains parent path
    if (
      childPath === parentPath ||
      childPath.startsWith(`${parentPath}/`)
    ) {
      return buildPath(childPath);
    }

    // Child path is relative
    return buildPath(`${parentPath}/${childPath}`);
  };

  // ---------------------------------------------------
  // CHECK WHETHER A MENU OR ITS CHILD IS ACTIVE
  // ---------------------------------------------------

  const isMenuActive = (item) => {
    const itemPath = buildPath(item.path);

    // Direct route
    if (
      location.pathname === itemPath ||
      location.pathname.startsWith(`${itemPath}/`)
    ) {
      return true;
    }

    // Child route
    if (item.children?.length) {
      return item.children
        .filter((child) => !child.hideInNav)
        .some((child) => {
          const childPath = buildChildPath(
            item.path,
            child.path
          );

          return (
            location.pathname === childPath ||
            location.pathname.startsWith(`${childPath}/`)
          );
        });
    }

    return false;
  };

  // ---------------------------------------------------
  // FIND ACTIVE MENU
  // ---------------------------------------------------

  const findActiveMenu = () => {
    const allItems = [...mainItems, ...bottomItems];

    const active = allItems.find((item) =>
      isMenuActive(item)
    );

    return active?.path ?? null;
  };

  // ---------------------------------------------------
  // OPEN MENU
  // ---------------------------------------------------

  const [openMenu, setOpenMenu] = useState(() =>
    findActiveMenu()
  );

  const toggleMenu = (path) => {
    setOpenMenu((previous) =>
      previous === path ? null : path
    );
  };

  // ---------------------------------------------------
  // LINK STYLES
  // ---------------------------------------------------

  const linkClasses = ({ isActive }) =>
    `group flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium no-underline transition-all duration-200 ${
      isActive
        ? "bg-[var(--color-primary)] text-white shadow-lg shadow-purple-900/20"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    }`;

  // ---------------------------------------------------
  // RENDER CHILDREN
  // ---------------------------------------------------

  const renderChildren = (item, direction = "down") => {
    const visibleChildren =
      item.children?.filter(
        (child) => !child.hideInNav
      ) ?? [];

    if (visibleChildren.length === 0) {
      return null;
    }

    const isOpen = openMenu === item.path;

    // -------------------------------------------------
    // DROP-UP MENU
    // -------------------------------------------------

    if (direction === "up") {
      return (
        <div
          className={`absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[var(--color-sidebar)] shadow-2xl transition-all duration-200 ${
            isOpen
              ? "visible translate-y-0 opacity-100"
              : "invisible translate-y-2 opacity-0"
          }`}
        >
          <div className="max-h-[60vh] overflow-y-auto p-2">
            <div className="space-y-1">
              {visibleChildren.map((child) => {
                const childPath = buildChildPath(
                  item.path,
                  child.path
                );

                const isActive =
                  location.pathname === childPath ||
                  location.pathname.startsWith(
                    `${childPath}/`
                  );

                return (
                  <NavLink
                    key={child.path}
                    to={childPath}
                    end
                    onClick={() =>
                      setSidebarOpen(false)
                    }
                    className={() =>
                      `flex min-h-10 w-full items-center rounded-lg px-3 text-sm font-medium no-underline transition-all duration-200 ${
                        isActive
                          ? "bg-[var(--color-primary)] text-white"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
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
    }

    // -------------------------------------------------
    // NORMAL DROP-DOWN MENU
    // -------------------------------------------------

    return (
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen
            ? "mt-1 max-h-[600px]"
            : "max-h-0"
        }`}
      >
        <div className="space-y-1 py-1 pl-6">
          {visibleChildren.map((child) => {
            const childPath = buildChildPath(
              item.path,
              child.path
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
    );
  };

  // ---------------------------------------------------
  // RENDER NORMAL MENU ITEMS
  // ---------------------------------------------------

  const renderMainItem = (item) => {
    const visibleChildren =
      item.children?.filter(
        (child) => !child.hideInNav
      ) ?? [];

    const hasChildren =
      visibleChildren.length > 0;

    const isOpen =
      openMenu === item.path;

    // ------------------------------------------------
    // NORMAL SINGLE LINK
    // ------------------------------------------------

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

    // ------------------------------------------------
    // PARENT WITH CHILDREN
    // ------------------------------------------------

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

          <span className="text-xs">
            {isOpen ? "▲" : "▼"}
          </span>
        </button>

        {renderChildren(item, "down")}
      </div>
    );
  };

  // ---------------------------------------------------
  // RENDER BOTTOM MENU ITEMS
  // ---------------------------------------------------

  const renderBottomItem = (item) => {
    const visibleChildren =
      item.children?.filter(
        (child) => !child.hideInNav
      ) ?? [];

    const hasChildren =
      visibleChildren.length > 0;

    const isOpen =
      openMenu === item.path;

    // ------------------------------------------------
    // BOTTOM ITEM WITHOUT CHILDREN
    // ------------------------------------------------

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

    // ------------------------------------------------
    // BOTTOM ITEM WITH CHILDREN
    // DROP-UP
    // ------------------------------------------------

    return (
      <div
        key={item.path}
        className="relative"
      >
        {renderChildren(item, "up")}

        <button
          type="button"
          onClick={() =>
            toggleMenu(item.path)
          }
          className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-200 ${
            isOpen || isMenuActive(item)
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

          <span className="text-xs transition-transform duration-200">
            {isOpen ? "▲" : "▼"}
          </span>
        </button>
      </div>
    );
  };

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
          NAVIGATION
      ================================================= */}

      <nav className="flex-1 px-3 py-5">
        <p className="mb-3 px-2 text-[10px] font-bold tracking-[0.15em] text-slate-500">
          MAIN MENU
        </p>

        <div className="space-y-1">
          {mainItems.map(renderMainItem)}
        </div>
      </nav>

      {/* =================================================
          BOTTOM ITEMS
      ================================================= */}

      {bottomItems.length > 0 && (
        <div className="shrink-0 space-y-1 border-t border-white/10 p-3">
          {bottomItems.map(renderBottomItem)}
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
