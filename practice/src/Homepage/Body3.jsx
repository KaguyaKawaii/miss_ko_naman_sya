import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";

import Faculty1 from "../assets/FacultyRoom.jpg";
import Faculty2 from "../assets/FacultyRoom2.jpg";
import Collab from "../assets/CollabRoom.jpg";
import Collab2 from "../assets/CollabRoom2.jpg";

const slides = [
  { src: Faculty1, label: "Faculty Room", description: "Spacious work area for faculty members" },
  { src: Faculty2, label: "Faculty Room", description: "Modern equipped workspace for educators" },
  { src: Collab, label: "Collaboration Room", description: "Interactive space for team projects" },
  { src: Collab2, label: "Collaboration Room", description: "High-tech environment for group work" },
];

function Body3() {
  const [index, setIndex] = useState(0);
  const timer = useRef(null);

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  useEffect(() => {
    timer.current = setInterval(next, 5000);
    return () => clearInterval(timer.current);
  }, []);

  const pause = () => clearInterval(timer.current);
  const resume = () => {
    clearInterval(timer.current);
    timer.current = setInterval(next, 5000);
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800 py-24 px-6 overflow-hidden flex flex-col items-center">
      {/* Heading */}
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h2 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">Our Facilities</h2>
        <div className="w-24 h-1.5 bg-gradient-to-r from-[#CC0000] to-red-600 mx-auto rounded-full mb-6"></div>
        <p className="text-lg text-gray-600">
          Explore our thoughtfully designed spaces that foster productivity and collaboration
        </p>
      </div>

      {/* Carousel Container */}
      <div className="w-full max-w-7xl mx-auto">
        {/* Carousel */}
        <div
          className="relative w-full h-[40rem] rounded-3xl overflow-hidden shadow-2xl group"
          onMouseEnter={pause}
          onMouseLeave={resume}
        >
          {/* Slides */}
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={slide.src}
                alt={slide.label}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
            </div>
          ))}

          {/* Slide Info */}
          <div className="absolute bottom-0 left-0 right-0 z-20 px-8 pb-12 pt-24 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {slides[index].label}
              </h3>
              <p className="text-xl text-gray-200 mb-6">
                {slides[index].description}
              </p>
              <div className="flex space-x-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIndex(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === index ? "w-8 bg-white" : "w-4 bg-white/50"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <button
            onClick={prev}
            className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg z-20 transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft size={32} className="text-gray-800" />
          </button>
          <button
            onClick={next}
            className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg z-20 transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight size={32} className="text-gray-800" />
          </button>
        </div>

        {/* Thumbnail Navigation (Desktop) */}
        <div className="hidden md:grid grid-cols-4 gap-4 mt-8 max-w-7xl mx-auto">
          {slides.map((slide, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`relative h-32 rounded-xl overflow-hidden transition-all duration-300 ${
                i === index ? "ring-4 ring-[#CC0000] scale-105" : "opacity-80 hover:opacity-100"
              }`}
              aria-label={`View ${slide.label}`}
            >
              <img
                src={slide.src}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <span className="text-white font-medium text-sm bg-black/50 px-3 py-1 rounded-full">
                  {slide.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Body3;