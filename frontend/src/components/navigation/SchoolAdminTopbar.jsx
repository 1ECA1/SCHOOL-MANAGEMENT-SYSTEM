
import React from "react";
import { useLocation } from "react-router-dom";

const SchoolAdminTopbar = ({ setOpen }) => {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;

    if (path === "/school-admin") {
      return "Dashboard";
    }

    if (path.startsWith("/school-admin/people")) {
      return "People";
    }

    if (path.startsWith("/school-admin/academics")) {
      return "Academics";
    }

    if (path.startsWith("/school-admin/student-management")) {
      return "Student Management";
    }

    if (path.startsWith("/school-admin/attendance")) {
      return "Attendance";
    }

    if (path.startsWith("/school-admin/assignments")) {
      return "Assignments";
    }

    if (path.startsWith("/school-admin/examinations-results")) {
      return "Examinations & Results";
    }

    if (path.startsWith("/school-admin/finance")) {
      return "Finance";
    }

    if (path.startsWith("/school-admin/notifications")) {
      return "Notifications";
    }

    if (path.startsWith("/school-admin/reports-audit")) {
      return "Reports & Audit";
    }

    if (path.startsWith("/school-admin/settings")) {
      return "Settings";
    }

    return "School Admin";
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center border-b bg-white px-4 shadow-sm sm:px-6">
      {/* MOBILE MENU BUTTON */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mr-4 rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
        aria-label="Open navigation"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* PAGE TITLE */}
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-gray-800">
          {getPageTitle()}
        </h2>

        <p className="hidden text-xs text-gray-500 sm:block">
          School Administration
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* NOTIFICATIONS */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Notifications"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>

          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* DIVIDER */}
        <div className="hidden h-8 w-px bg-gray-200 sm:block" />

        {/* USER */}
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
            SA
          </div>

          <div className="hidden text-left md:block">
            <p className="text-sm font-medium text-gray-800">
              School Admin
            </p>

            <p className="text-xs text-gray-500">
              Administrator
            </p>
          </div>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="hidden h-4 w-4 text-gray-500 md:block"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default SchoolAdminTopbar;


