import { ChevronLeft, ChevronRight, Play, Pause, Expand } from "lucide-react";
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
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timer = useRef(null);
  const carouselRef = useRef(null);

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (isPlaying) {
      timer.current = setInterval(next, 5000);
    } else {
      clearInterval(timer.current);
    }
    return () => clearInterval(timer.current);
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const goToSlide = (i) => setIndex(i);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      carouselRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800 py-24 px-6 overflow-hidden flex flex-col items-center">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-80 h-80 bg-[#CC0000]/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl -z-10"></div>
      
      {/* Heading */}
      <div className="text-center mb-16 max-w-3xl mx-auto transform transition-all duration-500 hover:scale-105">
        <h2 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">
          Our <span className="text-[#CC0000]">Facilities</span>
        </h2>
        <div className="w-32 h-1.5 bg-gradient-to-r from-[#CC0000] via-amber-400 to-[#CC0000] mx-auto rounded-full mb-6"></div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Explore our thoughtfully designed spaces that foster productivity and collaboration
        </p>
      </div>

      {/* Carousel Container */}
      <div className="w-full max-w-7xl mx-auto">
        {/* Carousel */}
        <div
          ref={carouselRef}
          className="relative w-full h-[40rem] rounded-3xl overflow-hidden shadow-2xl group transition-all duration-500 hover:shadow-2xl"
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
        >
          {/* Slides */}
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
                i === index 
                  ? "opacity-100 scale-100" 
                  : "opacity-0 scale-105"
              }`}
            >
              <img
                src={slide.src}
                alt={slide.label}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            </div>
          ))}

          {/* Slide Info */}
          <div className="absolute bottom-0 left-0 right-0 z-20 px-8 pb-12 pt-24">
            <div className="max-w-4xl mx-auto transform transition-all duration-700 delay-300">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-md">
                {slides[index].label}
              </h3>
              <p className="text-xl text-gray-200 mb-6 drop-shadow-md">
                {slides[index].description}
              </p>
              <div className="flex space-x-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === index 
                        ? "w-8 bg-amber-400" 
                        : "w-4 bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Control Bar */}
          <div className="absolute bottom-6 right-6 flex items-center space-x-3 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 z-20 transition-opacity duration-300 group-hover:opacity-100">
            <button
              onClick={togglePlay}
              className="p-2 text-white hover:text-amber-400 transition-colors duration-200"
              aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 text-white hover:text-amber-400 transition-colors duration-200"
              aria-label="Enter fullscreen"
            >
              <Expand size={20} />
            </button>
          </div>

          {/* Navigation Controls */}
          <button
            onClick={prev}
            className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full p-4 shadow-lg z-20 transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft size={32} className="text-white" />
          </button>
          <button
            onClick={next}
            className="absolute right-6 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full p-4 shadow-lg z-20 transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight size={32} className="text-white" />
          </button>
        </div>

        {/* Thumbnail Navigation (Desktop) */}
        <div className="hidden md:grid grid-cols-4 gap-6 mt-10 max-w-7xl mx-auto">
          {slides.map((slide, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`group relative h-32 rounded-2xl overflow-hidden transition-all duration-500 ${
                i === index 
                  ? "ring-4 ring-[#CC0000] ring-offset-2 ring-offset-white scale-105 shadow-lg" 
                  : "opacity-90 hover:opacity-100 hover:scale-105"
              }`}
              aria-label={`View ${slide.label}`}
            >
              <img
                src={slide.src}
                alt=""
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                i === index ? "bg-black/40" : "bg-black/60 group-hover:bg-black/40"
              }`}>
                <span className={`text-white font-medium px-3 py-1 rounded-full transition-all duration-300 ${
                  i === index 
                    ? "bg-amber-500" 
                    : "bg-black/70 group-hover:bg-[#CC0000]"
                }`}>
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