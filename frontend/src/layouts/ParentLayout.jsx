import { useState } from "react";
import { Outlet } from "react-router-dom";
import ParentSidebar from "../components/navigation/ParentSidebar";
import Topbar from "../components/navigation/Topbar";

export default function ParentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">

      {/* Sidebar */}
      <ParentSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Area */}
      <div className="min-h-screen md:ml-64 min-w-0">

        {/* Topbar */}
        <Topbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          settingsPath="/parent/settings/personal-settings"
        />

        {/* Page Content */}
        <main className="min-w-0">
          <Outlet />
        </main>

      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          aria-label="Close sidebar"
        />
      )}

    </div>
  );
}