// import { NavLink, useNavigate } from "react-router-dom";
// import { useState } from "react";
// import { useAuth } from "../../context/AuthContext";

// function ExamOfficerSidebar({ sidebarOpen, setSidebarOpen }) {
//   const navigate = useNavigate();
//   const { user, logout } = useAuth();

//   const [resultsOpen, setResultsOpen] = useState(false);

//   const menuItems = [
//     {
//       label: "Dashboard",
//       path: "/exam-officer",
//       icon: "▦",
//     },
//     {
//       label: "Examinations",
//       path: "/exam-officer/examinations",
//       icon: "▣",
//     },
//     {
//       label: "Students",
//       path: "/exam-officer/students",
//       icon: "♙",
//     },
//   ];

//   const resultItems = [
//     {
//       label: "Results",
//       path: "/exam-officer/results",
//       icon: "▤",
//     },
//     {
//       label: "Grade Scales",
//       path: "/exam-officer/grade-scales",
//       icon: "◈",
//     },
//     {
//       label: "Report Cards",
//       path: "/exam-officer/report-cards",
//       icon: "▥",
//     },
//     {
//   label: "Print Result",
//   path: "/exam-officer/print-results",
//   icon: "▤",
// },
//   ];

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };

//   return (
//     <aside
//       className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar text-white shadow-xl transition-transform duration-300 md:translate-x-0 ${
//         sidebarOpen ? "translate-x-0" : "-translate-x-full"
//       }`}
//     >
//       {/* Header */}
//       <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
//         <div>
//           <p className="m-0 text-lg font-bold text-white">
//             EduManage
//           </p>

//           <p className="m-0 text-[10px] font-bold tracking-[0.18em] text-secondary">
//             EXAMINATION
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={() => setSidebarOpen(false)}
//           className="flex h-9 w-9 items-center justify-center rounded-lg text-lg text-white/70 hover:bg-white/10 hover:text-white md:hidden"
//         >
//           ×
//         </button>
//       </div>

//       {/* User */}
//       <div className="border-b border-white/10 px-4 py-4">
//         <div className="flex items-center gap-3">
//           {user?.profile_image ? (
//             <img
//               src={
//                 user.profile_image.startsWith("http")
//                   ? user.profile_image
//                   : `${import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"}${user.profile_image}`
//               }
//               alt={`${user?.first_name || ""} ${user?.last_name || ""}`}
//               className="h-10 w-10 rounded-full border-2 border-primary object-cover"
//             />
//           ) : (
//             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
//               {user?.first_name?.charAt(0) || "E"}
//             </div>
//           )}

//           <div className="min-w-0">
//             <p className="truncate text-sm font-bold text-white">
//               {user?.first_name} {user?.last_name}
//             </p>

//             <p className="truncate text-xs text-white/50">
//               {user?.role_display || "Exam Officer"}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Navigation */}
//       <nav className="space-y-1 px-3 py-4">
//         {/* Normal Menu Items */}
//         {menuItems.map((item) => (
//           <NavLink
//             key={item.path}
//             to={item.path}
//             end={item.path === "/exam-officer"}
//             onClick={() => setSidebarOpen(false)}
//             className={({ isActive }) =>
//               `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
//                 isActive
//                   ? "bg-primary text-white shadow-md"
//                   : "text-white/70 hover:bg-white/10 hover:text-white"
//               }`
//             }
//           >
//             <span className="flex w-6 justify-center text-base">
//               {item.icon}
//             </span>

//             <span>{item.label}</span>
//           </NavLink>
//         ))}

//         {/* Results Dropdown */}
//         <div>
//           <button
//             type="button"
//             onClick={() => setResultsOpen((prev) => !prev)}
//             className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold transition ${
//               resultsOpen
//                 ? "bg-white/10 text-white"
//                 : "text-white/70 hover:bg-white/10 hover:text-white"
//             }`}
//           >
//             <span className="flex items-center gap-3">
//               <span className="flex w-6 justify-center text-base">
//                 ▤
//               </span>

//               <span>Results</span>
//             </span>

//             <span
//               className={`text-xs transition-transform duration-200 ${
//                 resultsOpen ? "rotate-180" : ""
//               }`}
//             >
//               ▼
//             </span>
//           </button>

//           {/* Dropdown Items */}
//           {resultsOpen && (
//             <div className="mt-1 space-y-1 pl-4">
//               {resultItems.map((item) => (
//                 <NavLink
//                   key={item.path}
//                   to={item.path}
//                   onClick={() => setSidebarOpen(false)}
//                   className={({ isActive }) =>
//                     `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
//                       isActive
//                         ? "bg-primary text-white shadow-sm"
//                         : "text-white/60 hover:bg-white/10 hover:text-white"
//                     }`
//                   }
//                 >
//                   <span className="flex w-5 justify-center text-sm">
//                     {item.icon}
//                   </span>

//                   <span>{item.label}</span>
//                 </NavLink>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Profile */}
//         <NavLink
//           to="/exam-officer/profile"
//           onClick={() => setSidebarOpen(false)}
//           className={({ isActive }) =>
//             `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
//               isActive
//                 ? "bg-primary text-white shadow-md"
//                 : "text-white/70 hover:bg-white/10 hover:text-white"
//             }`
//           }
//         >
//           <span className="flex w-6 justify-center text-base">
//             ◉
//           </span>

//           <span>Profile</span>
//         </NavLink>
//       </nav>

//       {/* Logout */}
//       <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-3">
//         <button
//           type="button"
//           onClick={handleLogout}
//           className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-white/70 transition hover:bg-red-500/10 hover:text-red-400"
//         >
//           <span className="flex w-6 justify-center">
//             ↪
//           </span>

//           <span>Logout</span>
//         </button>
//       </div>
//     </aside>
//   );
// }

// export default ExamOfficerSidebar;


import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  LayoutDashboard,
  ClipboardList,
  Users,
  FileText,
  GraduationCap,
  BarChart3,
  Settings,
  UserCircle,
  LogOut,
  X,
  Bell,
} from "lucide-react";

function ExamOfficerSidebar({
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
      path: "/exam-officer",
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: "Examinations",
      path: "/exam-officer/examinations",
      icon: ClipboardList,
    },
    {
      label: "Students",
      path: "/exam-officer/students",
      icon: Users,
    },
    {
      label: "Results",
      path: "/exam-officer/results",
      icon: FileText,
    },
    {
      label: "Report Cards",
      path: "/exam-officer/report-cards",
      icon: GraduationCap,
    },
    {
      label: "Grade Scales",
      path: "/exam-officer/grade-scales",
      icon: BarChart3,
    },
    {
      label: "Notifications",
      path: "/exam-officer/notifications",
      icon: Bell,
    },
    {
      label: "Profile",
      path: "/exam-officer/profile",
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

    navigate("/login", { replace: true });
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
                Exam Officer
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
                src={user.profile_image}
                alt={
                  user?.first_name ||
                  user?.username ||
                  "Exam Officer"
                }
                className="h-11 w-11 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-300">
                {(
                  user?.first_name?.[0] ||
                  user?.username?.[0] ||
                  "E"
                ).toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {user?.first_name
                  ? `${user.first_name} ${
                      user?.last_name || ""
                    }`
                  : user?.username || "Exam Officer"}
              </p>

              <p className="truncate text-xs text-slate-400">
                Exam Officer
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
              to="/exam-officer/settings"
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

export default ExamOfficerSidebar;