import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import AdmissionOfficerSidebar from "../components/navigation/AdmissionOfficerSidebar";
import Topbar from "../components/navigation/Topbar";

function AdmissionOfficerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">

      {/* SIDEBAR */}
      <AdmissionOfficerSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* MAIN AREA */}
      <div className="min-h-screen lg:pl-72 min-w-0">

        {/* TOPBAR */}
        <Topbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* PAGE CONTENT */}
        <main
          key={location.pathname}
          className="min-w-0 p-4 sm:p-6 lg:p-8"
        >
          <Outlet />
        </main>

      </div>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

    </div>
  );
}

export default AdmissionOfficerLayout;