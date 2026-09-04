// const PublicNavbar = () => {
//   return (
//     <nav className="border-b bg-white">
//       <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
//         {/* School Logo / Name */}
//         <div>
//           <h1 className="text-xl font-bold">EduManageERP</h1>
//           <p className="text-sm text-gray-500">School Management System</p>
//         </div>

//         {/* Navigation Links */}
//         <div className="hidden items-center gap-6 md:flex">
//           <a href="/" className="text-sm font-medium hover:text-blue-600">
//             Home
//           </a>

//           <a
//             href="/academy"
//             className="text-sm font-medium hover:text-blue-600"
//           >
//             Academy
//           </a>

//           <a
//             href="/admission"
//             className="text-sm font-medium hover:text-blue-600"
//           >
//             Admission
//           </a>

//           <a
//             href="/research"
//             className="text-sm font-medium hover:text-blue-600"
//           >
//             Research
//           </a>

//           <a
//             href="/resources"
//             className="text-sm font-medium hover:text-blue-600"
//           >
//             Resources
//           </a>

//           <a href="/news" className="text-sm font-medium hover:text-blue-600">
//             News
//           </a>
//         </div>

//         {/* Login Button */}
//         <div>
//           <a
//             href="/login"
//             className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
//           >
//             Login
//           </a>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default PublicNavbar;

import { useState } from "react";

const PublicNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState(null);

  const toggleMobileDropdown = (menu) => {
    setMobileDropdown(mobileDropdown === menu ? null : menu);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* =========================================================
          TOP INFORMATION BAR
      ========================================================= */}
      <div className="bg-blue-900 text-white">
        <div className="flex w-full items-center justify-between px-8 py-3 lg:px-12 xl:px-16">
          {/* CONTACT INFORMATION */}
          <div className="flex items-center gap-8">
            <a
              href="mailto:info@edumanageerp.com"
              className="flex items-center gap-2 text-base font-medium transition hover:text-blue-200"
            >
              <span className="text-lg">✉</span>
              info@edumanageerp.com
            </a>

            <a
              href="tel:+2348000000000"
              className="flex items-center gap-2 text-base font-medium transition hover:text-blue-200"
            >
              <span className="text-lg">☎</span>
              +234 800 000 0000
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
      <div className="flex w-full items-center justify-between px-8 py-6 lg:px-12 xl:px-16">
        {/* LOGO + SCHOOL INFORMATION */}
        <div className="flex items-center gap-5">
          {/* LOGO */}
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-700 text-3xl font-bold text-white shadow-md">
            E
          </div>

          {/* SCHOOL INFORMATION */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              EduManageERP
            </h1>

            <p className="text-base font-medium text-gray-500">
              Excellence • Innovation • Leadership
            </p>
          </div>
        </div>

        {/* =========================================================
            DESKTOP NAVIGATION
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
              href="/about"
              className="text-xl font-semibold text-gray-700 transition hover:text-blue-700"
            >
              About
            </a>

            {/* ACADEMICS */}
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

              {/* DROPDOWN */}
              <div className="invisible absolute left-0 top-full z-50 mt-4 w-64 translate-y-2 rounded-xl bg-white py-3 opacity-0 shadow-2xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                <a
                  href="/academics/nursery"
                  className="block px-6 py-4 text-lg font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  Nursery
                </a>

                <a
                  href="/academics/primary"
                  className="block px-6 py-4 text-lg font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  Primary
                </a>

                <a
                  href="/academics/secondary"
                  className="block px-6 py-4 text-lg font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  Secondary
                </a>

                <a
                  href="/academics/departments"
                  className="block px-6 py-4 text-lg font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  Departments
                </a>
              </div>
            </div>

            {/* ADMISSIONS */}
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
                  href="/admissions/process"
                  className="block px-6 py-4 text-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  Admission Process
                </a>

                <a
                  href="/admissions/requirements"
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

            {/* SCHOOL LIFE */}
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
                  href="/school-life/day-student"
                  className="block px-6 py-4 text-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  Day Student
                </a>

                <a
                  href="/school-life/boarding"
                  className="block px-6 py-4 text-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  Boarding
                </a>

                <a
                  href="/school-life/transportation"
                  className="block px-6 py-4 text-lg font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  Transportation
                </a>
              </div>
            </div>

            {/* NEWS */}
            <a
              href="/news"
              className="text-xl font-semibold text-gray-700 transition hover:text-blue-700"
            >
              News
            </a>

            {/* CONTACT */}
            <a
              href="/contact"
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

        {/* MOBILE BUTTON */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg border border-gray-300 px-4 py-3 text-2xl text-gray-700 lg:hidden"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* =========================================================
          MOBILE MENU
      ========================================================= */}
      {mobileMenuOpen && (
        <div className="border-t bg-white lg:hidden">
          <nav className="flex flex-col px-8 py-5">
            <a
              href="/"
              className="border-b py-5 text-xl font-semibold text-gray-700"
            >
              Home
            </a>

            <a
              href="/about"
              className="border-b py-5 text-xl font-semibold text-gray-700"
            >
              About
            </a>

            {/* MOBILE ACADEMICS */}
            <div className="border-b">
              <button
                type="button"
                onClick={() => toggleMobileDropdown("academics")}
                className="flex w-full items-center justify-between py-5 text-xl font-semibold text-gray-700"
              >
                Academics
                <span className="text-2xl">
                  {mobileDropdown === "academics" ? "−" : "+"}
                </span>
              </button>

              {mobileDropdown === "academics" && (
                <div className="mb-4 ml-4 rounded-xl bg-gray-50">
                  <a
                    href="/academics/nursery"
                    className="block px-6 py-4 text-lg text-gray-600 hover:text-blue-700"
                  >
                    Nursery
                  </a>

                  <a
                    href="/academics/primary"
                    className="block px-6 py-4 text-lg text-gray-600 hover:text-blue-700"
                  >
                    Primary
                  </a>

                  <a
                    href="/academics/secondary"
                    className="block px-6 py-4 text-lg text-gray-600 hover:text-blue-700"
                  >
                    Secondary
                  </a>

                  <a
                    href="/academics/departments"
                    className="block px-6 py-4 text-lg text-gray-600 hover:text-blue-700"
                  >
                    Departments
                  </a>
                </div>
              )}
            </div>

            {/* MOBILE ADMISSIONS */}
            <div className="border-b">
              <button
                type="button"
                onClick={() => toggleMobileDropdown("admissions")}
                className="flex w-full items-center justify-between py-5 text-xl font-semibold text-gray-700"
              >
                Admissions
                <span className="text-2xl">
                  {mobileDropdown === "admissions" ? "−" : "+"}
                </span>
              </button>

              {mobileDropdown === "admissions" && (
                <div className="mb-4 ml-4 rounded-xl bg-gray-50">
                  <a
                    href="/admissions/process"
                    className="block px-6 py-4 text-lg text-gray-600 hover:text-blue-700"
                  >
                    Admission Process
                  </a>

                  <a
                    href="/admissions/requirements"
                    className="block px-6 py-4 text-lg text-gray-600 hover:text-blue-700"
                  >
                    Requirements
                  </a>

                  <a
                    href="/admissions/apply"
                    className="block px-6 py-4 text-lg text-gray-600 hover:text-blue-700"
                  >
                    Apply Now
                  </a>
                </div>
              )}
            </div>

            {/* MOBILE SCHOOL LIFE */}
            <div className="border-b">
              <button
                type="button"
                onClick={() => toggleMobileDropdown("schoolLife")}
                className="flex w-full items-center justify-between py-5 text-xl font-semibold text-gray-700"
              >
                School Life
                <span className="text-2xl">
                  {mobileDropdown === "schoolLife" ? "−" : "+"}
                </span>
              </button>

              {mobileDropdown === "schoolLife" && (
                <div className="mb-4 ml-4 rounded-xl bg-gray-50">
                  <a
                    href="/school-life/day-student"
                    className="block px-6 py-4 text-lg text-gray-600 hover:text-blue-700"
                  >
                    Day Student
                  </a>

                  <a
                    href="/school-life/boarding"
                    className="block px-6 py-4 text-lg text-gray-600 hover:text-blue-700"
                  >
                    Boarding
                  </a>

                  <a
                    href="/school-life/transportation"
                    className="block px-6 py-4 text-lg text-gray-600 hover:text-blue-700"
                  >
                    Transportation
                  </a>
                </div>
              )}
            </div>

            {/* NEWS */}
            <a
              href="/news"
              className="border-b py-5 text-xl font-semibold text-gray-700"
            >
              News
            </a>

            {/* CONTACT */}
            <a
              href="/contact"
              className="border-b py-5 text-xl font-semibold text-gray-700"
            >
              Contact
            </a>

            {/* LOGIN */}
            <a
              href="/login"
              className="mt-7 rounded-lg bg-blue-700 px-8 py-4 text-center text-xl font-bold text-white"
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
