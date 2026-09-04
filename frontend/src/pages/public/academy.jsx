const Academy = () => {
  return (
    <div>
      {/* Page Header */}
      <section className="bg-blue-700 text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <h1 className="text-4xl font-bold md:text-5xl">Academy</h1>

          <p className="mx-auto mt-4 max-w-2xl text-blue-100">
            Discover our academic structure, learning programs, departments, and
            educational opportunities.
          </p>
        </div>
      </section>

      {/* Academic Programs */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Academic Programs
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Our academic programs are designed to provide students with
              quality education and practical knowledge.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border bg-gray-50 p-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Junior Secondary
              </h3>

              <p className="mt-3 text-gray-600">
                A strong foundation covering essential academic subjects and
                developing critical thinking skills.
              </p>
            </div>

            <div className="rounded-xl border bg-gray-50 p-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Senior Secondary
              </h3>

              <p className="mt-3 text-gray-600">
                Advanced academic programs preparing students for higher
                education and future careers.
              </p>
            </div>

            <div className="rounded-xl border bg-gray-50 p-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Special Programs
              </h3>

              <p className="mt-3 text-gray-600">
                Additional learning opportunities designed to develop talents,
                skills, creativity, and leadership.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="bg-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Our Academic Areas
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Students can explore different academic disciplines and areas of
              interest.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900">Sciences</h3>
              <p className="mt-2 text-sm text-gray-600">
                Mathematics, Biology, Chemistry, Physics and related subjects.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900">Arts</h3>
              <p className="mt-2 text-sm text-gray-600">
                Languages, Literature, History and creative disciplines.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900">Social Sciences</h3>
              <p className="mt-2 text-sm text-gray-600">
                Economics, Government, Geography and related disciplines.
              </p>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900">Technology</h3>
              <p className="mt-2 text-sm text-gray-600">
                Computing, technology, innovation and practical skills.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Academy;
