const news = [
  {
    id: 1,
    category: "School News",
    date: "August 20, 2026",
    author: "EduManageERP",
    title: "Our Students Celebrate Academic Excellence",
    description:
      "Our school community celebrates another successful academic year filled with outstanding achievements and memorable moments.",
    image: "/images/first-image.jpg",
  },
  {
    id: 2,
    category: "Events",
    date: "August 15, 2026",
    author: "EduManageERP",
    title: "Annual School Cultural Day",
    description:
      "Students, teachers, and parents came together to celebrate culture, creativity, and the diversity of our school community.",
    image: "/images/head-hero.jpg",
  },
  {
    id: 3,
    category: "Announcement",
    date: "August 10, 2026",
    author: "EduManageERP",
    title: "Admissions Now Open",
    description:
      "Applications are now open for the new academic session. Parents and guardians are invited to begin the admission process.",
    image: "/images/hero.png",
  },
];

const SchoolNews = () => {
  return (
    <section className="bg-gray-50">
      <div className="w-full px-2 py-20">
        {/* Section Heading */}
        {/* <div className="text-left px-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Latest Updates
          </p>

          <h2 className="mt-3 text-left text-3xl font-bold text-gray-900 md:text-4xl">
            School News
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Stay informed about the latest news, events, announcements, and
            activities happening in our school.
          </p>
        </div> */}

        {/* Section Heading */}
        <div className="flex flex-col gap-8 px-2 lg:flex-row lg:items-end lg:justify-between">
          {/* Heading */}
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Latest Articles
            </p>

            <h2 className="mt-5 text-4xl font-bold leading-tight text-blue-900 sm:text-5xl lg:text-6xl">
              The latest news and articles
              <br className="hidden sm:block" />
              from our school
            </h2>
          </div>

          {/* View More Button */}
          <div className="shrink-0">
            <button className="rounded-lg bg-blue-700 px-8 py-5 text-base font-bold uppercase tracking-wide text-white shadow-md transition duration-300 hover:bg-blue-800 hover:shadow-lg">
              View More →
            </button>
          </div>
        </div>

        {/* News Cards */}
        <div className="mt-12 grid w-full grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <article
              key={item.id}
              className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Image */}
              <div className="p-5 pb-0">
                <div className="h-74 overflow-hidden rounded-xl">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />
                </div>
              </div>

              {/* Card Content */}
              <div className="flex flex-1 flex-col">
                <div className="px-5 pt-6">
                  {/* Category */}
                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                    {item.category}
                  </p>

                  {/* Title */}
                  <h3 className="mt-3 text-2xl font-semibold leading-tight text-gray-900">
                    {item.title}
                  </h3>

                  {/* Metadata */}
                  <div className="mt-5 flex items-center gap-5 text-sm text-gray-500">
                    <span className="flex items-center gap-2">
                      <span className="text-lg">◷</span>
                      {item.date}
                    </span>

                    <span className="flex items-center gap-2">
                      <span className="text-lg">◉</span>
                      {item.author}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="mt-6 border-t border-gray-200" />

                {/* Description */}
                <div className="flex flex-1 flex-col px-5 py-6">
                  <p className="line-clamp-4 text-base leading-9 text-gray-600">
                    {item.description}
                  </p>

                  {/* Read More */}
                  <button className="mt-auto pt-6 text-left font-semibold text-blue-700 transition hover:text-blue-900">
                    Read More →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All */}
        <div className="mt-12 text-center">
          <button className="rounded-xl bg-blue-700 px-9 py-4 text-base font-semibold text-white shadow-md transition duration-300 hover:bg-blue-800 hover:shadow-lg">
            View All News
          </button>
        </div>
      </div>
    </section>
  );
};

export default SchoolNews;
