import { useState } from "react";
import { Outlet } from "react-router-dom";
import LibrarianSidebar from "../components/navigation/LibrarianSidebar";
import Topbar from "../components/navigation/Topbar";

function LibrarianLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">

      {/* Sidebar */}
      <LibrarianSidebar
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
        <main className="min-w-0">
          <Outlet />
        </main>

      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

    </div>
  );
}

export default LibrarianLayout;