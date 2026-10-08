const PublicFooter = () => {
  return (
    <footer className="bg-gray-950 text-white">
      {/* Main Footer */}
      <div className="grid gap-12 px-8 py-16 lg:grid-cols-4 lg:px-12 xl:px-16">
        {/* School Information */}
        <div>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-700 text-2xl font-bold">
              E
            </div>

            <div>
              <h2 className="text-2xl font-bold">EduManageERP</h2>

              <p className="text-sm text-gray-400">
                School Management System
              </p>
            </div>
          </div>

          <p className="mt-6 max-w-sm text-base leading-7 text-gray-400">
            A modern school management platform designed to connect students,
            teachers, parents, and administrators while simplifying everyday
            school operations.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold">Quick Links</h3>

          <div className="mt-6 space-y-4">
            <a
              href="/"
              className="block text-gray-400 transition hover:text-white"
            >
              Home
            </a>

            <a
              href="/"
              className="block text-gray-400 transition hover:text-white"
            >
              Academy
            </a>

            <a
              href="/admissions/apply"
              className="block text-gray-400 transition hover:text-white"
            >
              Admission
            </a>

            <a
              href="/"
              className="block text-gray-400 transition hover:text-white"
            >
              News
            </a>
          </div>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-xl font-semibold">Resources</h3>

          <div className="mt-6 space-y-4">
            <a
              href="/"
              className="block text-gray-400 transition hover:text-white"
            >
              Research
            </a>

            <a
              href="/"
              className="block text-gray-400 transition hover:text-white"
            >
              Learning Resources
            </a>

            <a
              href="/"
              className="block text-gray-400 transition hover:text-white"
            >
              Admission Guide
            </a>

            <a
              href="/login"
              className="block text-gray-400 transition hover:text-white"
            >
              Student Portal
            </a>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-xl font-semibold">Contact Us</h3>

          <div className="mt-6 space-y-4 text-gray-400">
            <p>Abuja, Nigeria</p>

            <p>+2348122314775</p>

            <p>edubridgesupportinfo@gmail.com</p>

            <p>
              Monday – Friday
              <br />
              8:00 AM – 4:00 PM
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="flex flex-col gap-3 px-8 py-6 text-sm text-gray-500 md:flex-row md:items-center md:justify-between lg:px-12 xl:px-16">
          <p>© 2026 EduManageERP. All rights reserved.</p>

          <div className="flex gap-6">
            <a href="/" className="transition hover:text-white">
              Privacy Policy
            </a>

            <a href="/" className="transition hover:text-white">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;