import { useState } from "react";
import { Outlet } from "react-router-dom";
import PrincipalSidebar from "../components/navigation/PrincipalSidebar";
import Topbar from "../components/navigation/Topbar";

function PrincipalLayout() {
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

      {/* Principal Sidebar */}
      <PrincipalSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Area */}
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

export default PrincipalLayout;