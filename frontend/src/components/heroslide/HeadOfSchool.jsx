const HeadOfSchool = () => {
  return (
    <section className="bg-white">
      <div className="mx-auto w-full px-2 py-20 sm:px-8 lg:px-8 xl:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Head of School Image */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl">
              <img
                src="/images/head-hero.jpg"
                alt="Head of School"
                className="h-[700px] w-full object-cover"
              />
            </div>
          </div>

          {/* Welcome Message */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
              Welcome Message
            </p>

            <h2 className="mt-4 text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
              Welcome to Our School
            </h2>

            <div className="mt-7 space-y-5 text-lg leading-8 text-gray-600">
              <p>
                It is my great pleasure to welcome you to our school community.
                We are committed to providing an environment where every student
                is encouraged to learn, grow, and discover their potential.
              </p>

              <p>
                Our school combines academic excellence with character
                development, creativity, discipline, and leadership. We believe
                that every child deserves the opportunity to receive a quality
                education and build a strong foundation for the future.
              </p>

              <p>
                Together with our dedicated teachers, parents, and students, we
                continue to build a community where excellence is encouraged and
                every achievement is celebrated.
              </p>
            </div>

            {/* Head of School */}
            <div className="mt-8 border-l-4 border-blue-700 pl-5">
              <p className="text-xl font-bold text-gray-900">
                Dr. [Head of School Name]
              </p>

              <p className="mt-1 text-gray-500">Head of School</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeadOfSchool;
