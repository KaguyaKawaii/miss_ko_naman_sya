import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";

import Faculty1 from "../assets/FacultyRoom.jpg";
import Faculty2 from "../assets/FacultyRoom2.jpg";
import Collab from "../assets/CollabRoom.jpg";
import Collab2 from "../assets/CollabRoom2.jpg";

const slides = [
  { src: Faculty1, label: "Faculty Room " },
  { src: Faculty2, label: "Faculty Room " },
  { src: Collab,   label: "Collaboration Room " },
  { src: Collab2,  label: "Collaboration Room " },
];

function Body3() {
  const [index, setIndex] = useState(0);
  const timer = useRef(null);

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  useEffect(() => {
    timer.current = setInterval(next, 2000);
    return () => clearInterval(timer.current);
  }, []);

  const pause = () => clearInterval(timer.current);
  const resume = () => {
    clearInterval(timer.current);
    timer.current = setInterval(next, 5000);
  };

  return (
    <section className="relative h-screen bg-gray-50 text-gray-800 py-10 px-8 overflow-hidden flex flex-col items-center">
      {/* Heading */}
      <h2 className="text-6xl font-bold mb-12">Rooms</h2>

      {/* Optional red underline */}
          <div className="border-b border-[#CC0000] w-[80rem] mb-12"></div>


      {/* Carousel */}
      <div
        className="relative w-full max-w-7xl h-[40rem]"
        onMouseEnter={pause}
        onMouseLeave={resume}
      >
        

        {/* Slides (cross‑fade) */}
        {slides.map((slide, i) => (
          <img
            key={i}
            src={slide.src}
            alt={slide.label}
            className={`absolute inset-0 w-full h-full object-cover rounded-2xl shadow-lg transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Label */}
        <span className="absolute bottom-6 left-6 bg-black/60 text-white text-2xl px-4 py-2 rounded-md z-20">
          {slides[index].label}
        </span>

        {/* Controls */}
        <button
          onClick={prev}
          className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-4 shadow z-20"
        >
          <ChevronLeft size={36} />
        </button>
        <button
          onClick={next}
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-4 shadow z-20"
        >
          <ChevronRight size={36} />
        </button>
      </div>

      
      
    </section>
  );
}

export default Body3;
