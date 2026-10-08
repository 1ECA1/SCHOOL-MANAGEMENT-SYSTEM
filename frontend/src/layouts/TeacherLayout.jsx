import { useState } from "react";
import { Outlet } from "react-router-dom";
import TeacherSidebar from "../components/navigation/TeacherSidebar";
import Topbar from "../components/navigation/Topbar";

function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">

      {/* =================================================
          MOBILE SIDEBAR OVERLAY
      ================================================= */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}
      <TeacherSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* =================================================
          MAIN AREA
      ================================================= */}
      <div className="min-h-screen md:ml-64 min-w-0">

        {/* Topbar */}
        <Topbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Page Content */}
        <main className="min-w-0 p-4 sm:p-5 lg:p-7">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

export default TeacherLayout;