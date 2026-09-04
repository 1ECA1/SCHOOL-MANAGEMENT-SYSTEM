// import { Outlet } from "react-router-dom";
// import Sidebar from "../components/Sidebar";
// import Topbar from "../components/Topbar";

// function AdminLayout() {
//   return (
//     <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
//       {/* Sidebar */}
//       <Sidebar />

//       {/* Main Area */}
//       <div className="min-h-screen md:ml-64">
//         {/* Topbar */}
//         <Topbar />

//         {/* Page Content */}
//         <main className="p-4 sm:p-5 lg:p-7">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }

// export default AdminLayout;

import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/navigation/Sidebar";
import Topbar from "../components/navigation/Topbar";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Area */}
      <div className="min-h-screen md:ml-64">
        <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-4 sm:p-5 lg:p-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;

// // src/layouts/AdminLayout.jsx
// import React from "react";
// import { Outlet } from "react-router-dom";
// import Sidebar from "../components/Sidebar";
// import Topbar from "../components/Topbar";

// function AdminLayout() {
//   return (
//     <div className="flex min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
//       <Sidebar />

//       <div className="flex-1 flex flex-col min-w-0">
//         <Topbar />

//         <main className="flex-1 p-6 overflow-y-auto">
//           {/* Dashboard Content */}
//           <div className="space-y-6">
//             {/* Stats Cards */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//               <div className="bg-[var(--color-card)] p-4 rounded-md shadow-sm border border-slate-100 dark:border-slate-800 flex items-center space-x-4">
//                 <div className="p-3 bg-emerald-100 text-emerald-500 rounded-full text-lg">
//                   👨‍🎓
//                 </div>
//                 <div>
//                   <p className="text-slate-400 text-xs">Students</p>
//                   <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
//                     50,000
//                   </h3>
//                 </div>
//               </div>

//               <div className="bg-[var(--color-card)] p-4 rounded-md shadow-sm border border-slate-100 dark:border-slate-800 flex items-center space-x-4">
//                 <div className="p-3 bg-sky-100 text-sky-500 rounded-full text-lg">
//                   👨‍🏫
//                 </div>
//                 <div>
//                   <p className="text-slate-400 text-xs">Teachers</p>
//                   <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
//                     10,000
//                   </h3>
//                 </div>
//               </div>

//               <div className="bg-[var(--color-card)] p-4 rounded-md shadow-sm border border-slate-100 dark:border-slate-800 flex items-center space-x-4">
//                 <div className="p-3 bg-amber-100 text-amber-500 rounded-full text-lg">
//                   👨‍👩‍👧
//                 </div>
//                 <div>
//                   <p className="text-slate-400 text-xs">Parents</p>
//                   <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
//                     15,000
//                   </h3>
//                 </div>
//               </div>

//               <div className="bg-[var(--color-card)] p-4 rounded-md shadow-sm border border-slate-100 dark:border-slate-800 flex items-center space-x-4">
//                 <div className="p-3 bg-rose-100 text-rose-500 rounded-full text-lg">
//                   💰
//                 </div>
//                 <div>
//                   <p className="text-slate-400 text-xs">Total Earnings</p>
//                   <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
//                     $30,000
//                   </h3>
//                 </div>
//               </div>
//             </div>

//             {/* Content Views from React Router */}
//             <Outlet />
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }

// export default AdminLayout;
