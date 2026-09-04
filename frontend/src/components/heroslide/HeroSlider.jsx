import { useEffect, useState } from "react";

const slides = [
  {
    id: 1,
    image: "/images/first-image.jpg",
    eyebrow: "Welcome to EduManageERP",
    title: "Building Bright Futures Through Quality Education",
    description:
      "A learning community committed to academic excellence, character development, innovation, and leadership.",
    button: "Learn More",
  },
  {
    id: 2,
    image: "/images/hero.png",
    eyebrow: "Academic Excellence",
    title: "Inspiring Students to Reach Their Full Potential",
    description:
      "Our academic environment encourages curiosity, creativity, critical thinking, and lifelong learning.",
    button: "Explore Academy",
  },
  {
    id: 3,
    image: "/images/images-building.jpg",
    eyebrow: "A Community of Excellence",
    title: "Where Every Student Matters",
    description:
      "We provide a supportive environment where students can discover their strengths and develop their talents.",
    button: "Discover Our School",
  },
  {
    id: 4,
    image: "/images/laboratory-image.jpg",
    eyebrow: "Admissions Open",
    title: "Give Your Child the Foundation for a Successful Future",
    description: "Join a community where education goes beyond the classroom.",
    button: "Apply for Admission",
  },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((previousSlide) =>
        previousSlide === slides.length - 1 ? 0 : previousSlide + 1,
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((previousSlide) =>
      previousSlide === slides.length - 1 ? 0 : previousSlide + 1,
    );
  };

  const previousSlide = () => {
    setCurrentSlide((previousSlide) =>
      previousSlide === 0 ? slides.length - 1 : previousSlide - 1,
    );
  };

  return (
    <section className="relative h-[650px] w-full overflow-hidden md:h-[700px]">
      {/* ================= SLIDES ================= */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-[1500ms] ease-in-out ${
            index === currentSlide ? "z-10 opacity-100" : "z-0 opacity-0"
          }`}
          style={{
            backgroundImage: `url("${slide.image}")`,
          }}
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50" />

          {/* ================= CONTENT ================= */}
          <div className="relative z-20 flex h-full items-center">
            <div className="w-full px-2 sm:px-8 lg:px-30 xl:px-32">
              <div className="w-full lg:w-[70%]">
                {/* Eyebrow */}
                <div
                  className={
                    index === currentSlide
                      ? "animate-[heroText_1.4s_ease-out_forwards]"
                      : "opacity-0"
                  }
                  style={{
                    animationDelay: "0.2s",
                  }}
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300 md:text-base">
                    {slide.eyebrow}
                  </p>
                </div>

                {/* Heading */}
                <div
                  className={
                    index === currentSlide
                      ? "animate-[heroText_1.5s_ease-out_forwards]"
                      : "opacity-0"
                  }
                  style={{
                    animationDelay: "0.5s",
                  }}
                >
                  <h1 className="mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                    {slide.title}
                  </h1>
                </div>

                {/* Description */}
                <div
                  className={
                    index === currentSlide
                      ? "animate-[heroText_1.5s_ease-out_forwards]"
                      : "opacity-0"
                  }
                  style={{
                    animationDelay: "0.9s",
                  }}
                >
                  <p className="mt-6 max-w-3xl text-base leading-7 text-gray-200 md:text-lg lg:text-xl lg:leading-8">
                    {slide.description}
                  </p>
                </div>

                {/* Button */}
                <div
                  className={
                    index === currentSlide
                      ? "animate-[heroText_1.5s_ease-out_forwards]"
                      : "opacity-0"
                  }
                  style={{
                    animationDelay: "1.3s",
                  }}
                >
                  <button className="mt-9 rounded-xl bg-blue-700 px-12 py-5 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-blue-800">
                    {slide.button}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* ================= PREVIOUS ================= */}
      <button
        type="button"
        onClick={previousSlide}
        className="absolute left-5 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-2xl text-white backdrop-blur-sm transition hover:bg-black/60"
        aria-label="Previous slide"
      >
        ‹
      </button>

      {/* ================= NEXT ================= */}
      <button
        type="button"
        onClick={nextSlide}
        className="absolute right-5 top-1/2 z-30 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-2xl text-white backdrop-blur-sm transition hover:bg-black/60"
        aria-label="Next slide"
      >
        ›
      </button>

      {/* ================= INDICATORS ================= */}
      <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 gap-3">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`h-2.5 rounded-full transition-all duration-500 ${
              index === currentSlide
                ? "w-10 bg-white"
                : "w-2.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
