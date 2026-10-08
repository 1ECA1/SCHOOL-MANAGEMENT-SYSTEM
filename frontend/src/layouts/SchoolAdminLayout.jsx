import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import SchoolAdminSidebar from "../components/navigation/SchoolAdminSidebar";
import SchoolAdminTopbar from "../components/navigation/SchoolAdminTopbar";

const SchoolAdminLayout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <SchoolAdminSidebar
        open={open}
        setOpen={setOpen}
      />

      {/* MAIN AREA */}
      <div className="lg:ml-64">
        {/* TOPBAR */}
        <SchoolAdminTopbar
          setOpen={setOpen}
        />

        {/* PAGE CONTENT */}
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SchoolAdminLayout;