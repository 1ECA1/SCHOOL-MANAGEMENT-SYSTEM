const SchoolStats = () => {
  const stats = [
    {
      number: "+1,200",
      title: "Graduates",
      color: "bg-blue-700",
    },
    {
      number: "+530",
      title: "Senior Secondary",
      color: "bg-blue-700",
    },

    {
      number: "+420",
      title: "Junior Secondary",
      color: "bg-blue-700",
    },
    {
      number: "+350",
      title: "Primary",
      color: "bg-blue-700",
    },
    {
      number: "+180",
      title: "Pre-Primary",
      color: "bg-blue-700",
    },
  ];

  return (
    <section className="bg-gray-50">
      <div className="w-full px-8 py-10">
        {/* Heading */}
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Our School
          </p>

          <h2 className="mt-3 text-4xl font-bold text-gray-900 md:text-4xl">
            Growing Together
          </h2>

          <p className="mx-auto mt-2 max-w-5xl text-4-lg text-gray-600">
            A growing community committed to providing quality education and
            building a strong foundation for the future.
          </p>
        </div>

        {/* Statistics */}
        <div className="mt-10 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className={`${stat.color} flex min-h-[230px] flex-col items-center justify-center rounded-2xl px-4 py-8 text-center text-white shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-xl`}
            >
              <p className="text-8xl font-bold md:text-6xl">{stat.number}</p>

              <p className="mt-4 text-5-lg font-semibold">{stat.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SchoolStats;
