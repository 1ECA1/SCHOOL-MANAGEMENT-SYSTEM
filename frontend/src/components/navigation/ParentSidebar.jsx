// import { NavLink } from "react-router-dom";
// import { parentRoutes } from "../../routes/parentRoutes";

// export default function ParentSidebar() {
//   const mainRoutes = parentRoutes.filter(
//     (route) => !route.bottom
//   );

//   const bottomRoutes = parentRoutes.filter(
//     (route) => route.bottom
//   );

//   return (
//     <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
//       {/* Logo / Brand */}
//       <div className="h-16 px-5 flex items-center border-b border-gray-200">
//         <div>
//           <h1 className="text-xl font-bold text-gray-800">
//             EduManageERP
//           </h1>

//           <p className="text-xs text-gray-500">
//             Parent Portal
//           </p>
//         </div>
//       </div>

//       {/* Navigation */}
//       <nav className="flex-1 px-3 py-4 overflow-y-auto">
//         <div className="space-y-1">
//           {mainRoutes.map((route) => (
//             <NavLink
//               key={route.path || "dashboard"}
//               to={
//                 route.index
//                   ? "/parent"
//                   : `/parent/${route.path}`
//               }
//               end={route.index}
//               className={({ isActive }) =>
//                 `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
//                   isActive
//                     ? "bg-gray-900 text-white"
//                     : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
//                 }`
//               }
//             >
//               <span className="w-5 text-center">
//                 {route.icon}
//               </span>

//               <span>{route.label}</span>
//             </NavLink>
//           ))}
//         </div>
//       </nav>

//       {/* Bottom Navigation */}
//       <div className="px-3 py-4 border-t border-gray-200">
//         {bottomRoutes.map((route) => (
//           <NavLink
//             key={route.path}
//             to={`/parent/${route.path}`}
//             className={({ isActive }) =>
//               `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
//                 isActive
//                   ? "bg-gray-900 text-white"
//                   : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
//               }`
//             }
//           >
//             <span className="w-5 text-center">
//               {route.icon}
//             </span>

//             <span>{route.label}</span>
//           </NavLink>
//         ))}
//       </div>
//     </aside>
//   );
// }

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { getParent } from "../../services/parentService";

function ParentSidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [parent, setParent] = useState(null);

  const menuItems = [
    {
      label: "Dashboard",
      path: "/parent",
      icon: "⌂",
      end: true,
    },
    {
      label: "My Profile",
      path: "/parent/profile",
      icon: "👤",
    },
    {
      label: "My Children",
      path: "/parent/children",
      icon: "👨‍👩‍👧‍👦",
    },
    {
      label: "Attendance",
      path: "/parent/attendance",
      icon: "✓",
    },
    {
      label: "Assignments",
      path: "/parent/assignments",
      icon: "📝",
    },
    {
      label: "Results",
      path: "/parent/results",
      icon: "📊",
    },
    {
      label: "Examinations",
      path: "/parent/examinations",
      icon: "📋",
    },
    
    {
      label: "Fees & Payments",
      path: "/parent/fees",
      icon: "💳",
    },
   
    {
      label: "Notifications",
      path: "/parent/notifications",
      icon: "🔔",
    },
   
    {
      label: "Settings",
      path: "/parent/settings",
      icon: "⚙",
    },
  ];

  // =====================================================
  // LOAD PARENT PROFILE
  // =====================================================

  useEffect(() => {
    const loadParent = async () => {
      if (!user?.parent_id) {
        return;
      }

      try {
        const data = await getParent(user.parent_id);
        setParent(data);
      } catch (error) {
        console.error("Failed to load parent profile:", error);
      }
    };

    loadParent();
  }, [user?.parent_id]);

  // =====================================================
  // PROFILE IMAGE
  // =====================================================

  const getImageUrl = (image) => {
    if (!image) {
      return null;
    }

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    return `${import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000"}${image}`;
  };

  const profileImage = getImageUrl(parent?.profile_image);

  // =====================================================
  // MOBILE NAVIGATION
  // =====================================================

  const handleNavigation = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

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
      {/* Branding */}

      <div className="flex h-20 items-center border-b border-white/10 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-bold text-[#111827]">
          E
        </div>

        <div className="ml-3">
          <h1 className="text-base font-bold tracking-wide">EduManageERP</h1>

          <p className="text-xs text-slate-400">Parent Portal</p>
        </div>

        {/* Mobile close button */}

        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white md:hidden"
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>

      {/* Parent Information */}

      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center">
          {/* REAL PARENT PROFILE IMAGE */}

          {profileImage ? (
            <img
              src={profileImage}
              alt={parent?.full_name || "Parent"}
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-700">
              {parent?.full_name?.charAt(0)?.toUpperCase() ||
                user?.first_name?.charAt(0)?.toUpperCase() ||
                user?.username?.charAt(0)?.toUpperCase() ||
                "P"}
            </div>
          )}

          <div className="ml-3 min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {parent?.full_name ||
                (user?.first_name
                  ? `${user.first_name} ${user.last_name || ""}`.trim()
                  : user?.username || "Parent")}
            </p>

            <p className="text-xs text-slate-400">Parent / Guardian</p>
          </div>
        </div>
      </div>

      {/* Navigation */}

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
          Parent Portal
        </p>

        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
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

              <span className="ml-2">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Logout */}

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center rounded-xl px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <span className="flex w-7 items-center justify-center">↪</span>

          <span className="ml-2">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default ParentSidebar;
