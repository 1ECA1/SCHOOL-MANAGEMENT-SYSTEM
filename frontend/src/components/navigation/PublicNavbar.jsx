import { useState } from "react";

const PublicNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState(null);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const toggleMobileDropdown = (menu) => {
    setMobileDropdown((current) => (current === menu ? null : menu));
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileDropdown(null);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* =========================================================
          TOP INFORMATION BAR
      ========================================================= */}
      <div className="bg-blue-900 text-white">
        <div className="flex w-full flex-col gap-1 px-4 py-2.5 sm:px-6 sm:py-3 lg:flex-row lg:items-center lg:justify-between lg:px-12 xl:px-16">
          {/* CONTACT INFORMATION */}
          <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:gap-6 lg:gap-8">
            <a
              href="mailto:info@edumanageerp.com"
              className="flex min-w-0 items-center gap-2 text-sm font-medium transition hover:text-blue-200 sm:text-base"
            >
              <span className="shrink-0 text-base sm:text-lg">✉</span>

              <span className="truncate">
                info@edumanageerp.com
              </span>
            </a>

            <a
              href="tel:+2348000000000"
              className="flex items-center gap-2 whitespace-nowrap text-sm font-medium transition hover:text-blue-200 sm:text-base"
            >
              <span className="shrink-0 text-base sm:text-lg">☎</span>

              <span>+234 800 000 0000</span>
            </a>
          </div>

          {/* SEARCH BAR */}
          <div className="hidden items-center md:flex">
            <div className="flex items-center overflow-hidden rounded-lg bg-white">
              <input
                type="text"
                placeholder="Search..."
                className="w-56 px-4 py-2 text-base text-gray-700 outline-none placeholder:text-gray-400"
              />

              <button
                type="button"
                className="flex h-10 w-11 items-center justify-center bg-blue-700 text-white transition hover:bg-blue-600"
              >
                🔍
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN NAVBAR
      ========================================================= */}
      <div className="flex w-full items-center justify-between px-4 py-4 sm:px-6 sm:py-5 lg:px-12 lg:py-6 xl:px-16">
        {/* LOGO + SCHOOL INFORMATION */}
        <div className="flex min-w-0 items-center gap-3 sm:gap-4 lg:gap-5">
          {/* LOGO */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-2xl font-bold text-white shadow-md sm:h-16 sm:w-16 sm:text-3xl">
            E
          </div>

          {/* SCHOOL INFORMATION */}
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              EduManageERP
            </h1>

            <p className="truncate text-sm font-medium text-gray-500 sm:text-base">
              Excellence • Innovation • Leadership
            </p>
          </div>
        </div>

        {/* =========================================================
            DESKTOP NAVIGATION
            DESKTOP BEHAVIOR/STYLING LEFT UNCHANGED
        ========================================================= */}
        <div className="hidden items-center gap-12 lg:flex">
          <nav className="flex items-center gap-9">
            {/* HOME */}
            <a
              href="/"
              className="text-xl font-semibold text-gray-700 transition hover:text-blue-700"
            >
              Home
            </a>

            {/* ABOUT */}
            <a
              href="/"
              className="text-xl font-semibold text-gray-700 transition hover:text-blue-700"
            >
              About
            </a>

            {/* =====================================================
                ACADEMICS
            ===================================================== */}
            <div className="group relative">
              <button
                type="button"
                className="flex items-center gap-2 text-xl font-semibold text-gray-700 transition hover:text-blue-700"
              >
                Academics

                <svg
                  className="h-5 w-5 transition-transform duration-200 group-hover:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div className="invisible absolute left-0 top-full z-50 mt-4 w-64 translate-y-2 rounded-xl bg-white py-3 opacity-0 shadow-2xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <a
                  href="/"
                  className="block px-6 py-4 text-lg font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  Nursery
                </a>

                <a
                  href="/"
                  className="block px-6 py-4 text-lg font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  Primary
                </a>

                <a
                  href="/"
                  className="block px-6 py-4 text-lg font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  Secondary
                </a>

                <a
                  href="/"
                  className="block px-6 py-4 text-lg font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  Departments
                </a>
              </div>
            </div>

            {/* =====================================================
                ADMISSIONS
            ===================================================== */}
            <div className="group relative">
              <button
                type="button"
                className="flex items-center gap-2 text-xl font-semibold text-gray-700 transition hover:text-blue-700"
              >
                Admissions

                <svg
                  className="h-5 w-5 transition-transform duration-200 group-hover:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div className="invisible absolute left-0 top-full z-50 mt-4 w-72 translate-y-2 rounded-xl bg-white py-3 opacity-0 shadow-2xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <a
                  href="/"
                  className="block px-6 py-4 text-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  Admission Process
                </a>

                <a
                  href="/"
                  className="block px-6 py-4 text-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  Requirements
                </a>

                <a
                  href="/admissions/apply"
                  className="block px-6 py-4 text-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  Apply Now
                </a>
              </div>
            </div>

            {/* =====================================================
                SCHOOL LIFE
            ===================================================== */}
            <div className="group relative">
              <button
                type="button"
                className="flex items-center gap-2 text-xl font-semibold text-gray-700 transition hover:text-blue-700"
              >
                School Life

                <svg
                  className="h-5 w-5 transition-transform duration-200 group-hover:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div className="invisible absolute left-0 top-full z-50 mt-4 w-64 translate-y-2 rounded-xl bg-white py-3 opacity-0 shadow-2xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <a
                  href="/"
                  className="block px-6 py-4 text-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  Day Student
                </a>

                <a
                  href="/"
                  className="block px-6 py-4 text-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  Boarding
                </a>

                <a
                  href="/"
                  className="block px-6 py-4 text-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  Transportation
                </a>
              </div>
            </div>

            {/* NEWS */}
            <a
              href="/"
              className="text-xl font-semibold text-gray-700 transition hover:text-blue-700"
            >
              News
            </a>

            {/* CONTACT */}
            <a
              href="/"
              className="text-xl font-semibold text-gray-700 transition hover:text-blue-700"
            >
              Contact
            </a>
          </nav>

          {/* LOGIN */}
          <a
            href="/login"
            className="rounded-lg bg-blue-700 px-8 py-4 text-xl font-bold text-white shadow-md transition hover:bg-blue-800 hover:shadow-lg"
          >
            Login
          </a>
        </div>

        {/* =========================================================
            MOBILE BUTTON
        ========================================================= */}
        <button
          type="button"
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          className="ml-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-2xl text-gray-700 shadow-sm transition hover:border-blue-600 hover:text-blue-700 lg:hidden"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* =========================================================
          MOBILE MENU
      ========================================================= */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white shadow-lg lg:hidden">
          <nav className="max-h-[calc(100vh-130px)] overflow-y-auto px-4 py-2 sm:px-6">
            {/* HOME */}
            <a
              href="/"
              onClick={closeMobileMenu}
              className="flex min-h-14 items-center border-b border-gray-200 text-lg font-semibold text-gray-700 transition hover:text-blue-700"
            >
              Home
            </a>

            {/* ABOUT */}
            <a
              href="/"
              onClick={closeMobileMenu}
              className="flex min-h-14 items-center border-b border-gray-200 text-lg font-semibold text-gray-700 transition hover:text-blue-700"
            >
              About
            </a>

            {/* =====================================================
                MOBILE ACADEMICS
            ===================================================== */}
            <div className="border-b border-gray-200">
              <button
                type="button"
                onClick={() => toggleMobileDropdown("academics")}
                aria-expanded={mobileDropdown === "academics"}
                className="flex min-h-14 w-full items-center justify-between text-left text-lg font-semibold text-gray-700 transition hover:text-blue-700"
              >
                <span>Academics</span>

                <svg
                  className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                    mobileDropdown === "academics" ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {mobileDropdown === "academics" && (
                <div className="mb-3 ml-2 overflow-hidden rounded-lg border-l-2 border-blue-700 bg-gray-50">
                  <a
                    href="/"
                    onClick={closeMobileMenu}
                    className="block px-5 py-3.5 text-base font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    Nursery
                  </a>

                  <a
                    href="/"
                    onClick={closeMobileMenu}
                    className="block px-5 py-3.5 text-base font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    Primary
                  </a>

                  <a
                    href="/"
                    onClick={closeMobileMenu}
                    className="block px-5 py-3.5 text-base font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    Secondary
                  </a>

                  <a
                    href="/"
                    onClick={closeMobileMenu}
                    className="block px-5 py-3.5 text-base font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    Departments
                  </a>
                </div>
              )}
            </div>

            {/* =====================================================
                MOBILE ADMISSIONS
            ===================================================== */}
            <div className="border-b border-gray-200">
              <button
                type="button"
                onClick={() => toggleMobileDropdown("admissions")}
                aria-expanded={mobileDropdown === "admissions"}
                className="flex min-h-14 w-full items-center justify-between text-left text-lg font-semibold text-gray-700 transition hover:text-blue-700"
              >
                <span>Admissions</span>

                <svg
                  className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                    mobileDropdown === "admissions" ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {mobileDropdown === "admissions" && (
                <div className="mb-3 ml-2 overflow-hidden rounded-lg border-l-2 border-blue-700 bg-gray-50">
                  <a
                    href="/"
                    onClick={closeMobileMenu}
                    className="block px-5 py-3.5 text-base font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    Admission Process
                  </a>

                  <a
                    href="/"
                    onClick={closeMobileMenu}
                    className="block px-5 py-3.5 text-base font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    Requirements
                  </a>

                  <a
                    href="/admissions/apply"
                    onClick={closeMobileMenu}
                    className="block px-5 py-3.5 text-base font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    Apply Now
                  </a>
                </div>
              )}
            </div>

            {/* =====================================================
                MOBILE SCHOOL LIFE
            ===================================================== */}
            <div className="border-b border-gray-200">
              <button
                type="button"
                onClick={() => toggleMobileDropdown("schoolLife")}
                aria-expanded={mobileDropdown === "schoolLife"}
                className="flex min-h-14 w-full items-center justify-between text-left text-lg font-semibold text-gray-700 transition hover:text-blue-700"
              >
                <span>School Life</span>

                <svg
                  className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                    mobileDropdown === "schoolLife" ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {mobileDropdown === "schoolLife" && (
                <div className="mb-3 ml-2 overflow-hidden rounded-lg border-l-2 border-blue-700 bg-gray-50">
                  <a
                    href="/"
                    onClick={closeMobileMenu}
                    className="block px-5 py-3.5 text-base font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    Day Student
                  </a>

                  <a
                    href="/"
                    onClick={closeMobileMenu}
                    className="block px-5 py-3.5 text-base font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    Boarding
                  </a>

                  <a
                    href="/"
                    onClick={closeMobileMenu}
                    className="block px-5 py-3.5 text-base font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    Transportation
                  </a>
                </div>
              )}
            </div>

            {/* NEWS */}
            <a
              href="/"
              onClick={closeMobileMenu}
              className="flex min-h-14 items-center border-b border-gray-200 text-lg font-semibold text-gray-700 transition hover:text-blue-700"
            >
              News
            </a>

            {/* CONTACT */}
            <a
              href="/"
              onClick={closeMobileMenu}
              className="flex min-h-14 items-center border-b border-gray-200 text-lg font-semibold text-gray-700 transition hover:text-blue-700"
            >
              Contact
            </a>

            {/* LOGIN */}
            <a
              href="/login"
              onClick={closeMobileMenu}
              className="my-5 flex min-h-12 items-center justify-center rounded-lg bg-blue-700 px-6 text-base font-bold text-white shadow-md transition hover:bg-blue-800"
            >
              Login
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;