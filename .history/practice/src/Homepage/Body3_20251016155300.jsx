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
    <section className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800 py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden flex flex-col items-center">
      {/* Decorative elements */}
      <div className="absolute top-10 sm:top-20 right-2 sm:right-4 lg:right-10 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-[#CC0000]/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-4 sm:bottom-10 left-2 sm:left-4 lg:left-10 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-amber-400/5 rounded-full blur-3xl -z-10"></div>
      
      {/* Heading */}
      <div className="text-center mb-8 sm:mb-12 lg:mb-16 max-w-3xl mx-auto transform transition-all duration-500 hover:scale-105">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 text-gray-900">
          Our <span className="text-[#CC0000]">Facilities</span>
        </h2>
        <div className="w-16 sm:w-20 md:w-24 lg:w-32 h-1 sm:h-1.5 bg-gradient-to-r from-[#CC0000] via-amber-400 to-[#CC0000] mx-auto rounded-full mb-3 sm:mb-4 lg:mb-6"></div>
        <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
          Explore our thoughtfully designed spaces that foster productivity and collaboration
        </p>
      </div>

      {/* Carousel Container */}
      <div className="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
        {/* Carousel */}
        <div
          ref={carouselRef}
          className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[30rem] 2xl:h-[40rem] rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl lg:shadow-2xl group transition-all duration-500 hover:shadow-2xl"
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
          <div className="absolute bottom-0 left-0 right-0 z-20 px-3 sm:px-4 lg:px-8 pb-4 sm:pb-6 lg:pb-8 xl:pb-12 pt-8 sm:pt-12 lg:pt-16 xl:pt-24">
            <div className="max-w-4xl mx-auto transform transition-all duration-700 delay-300">
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-md">
                {slides[index].label}
              </h3>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-200 mb-2 sm:mb-3 lg:mb-4 xl:mb-6 drop-shadow-md">
                {slides[index].description}
              </p>
              <div className="flex space-x-1 sm:space-x-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={`h-1 sm:h-2 rounded-full transition-all duration-300 ${
                      i === index 
                        ? "w-4 sm:w-6 lg:w-8 bg-amber-400" 
                        : "w-2 sm:w-3 lg:w-4 bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Control Bar */}
          <div className="absolute bottom-2 sm:bottom-3 lg:bottom-4 xl:bottom-6 right-2 sm:right-3 lg:right-4 xl:right-6 flex items-center space-x-1 sm:space-x-2 lg:space-x-3 bg-black/40 backdrop-blur-sm rounded-full px-2 sm:px-3 lg:px-4 py-1 sm:py-2 z-20 transition-opacity duration-300 group-hover:opacity-100">
            <button
              onClick={togglePlay}
              className="p-1 sm:p-2 text-white hover:text-amber-400 transition-colors duration-200"
              aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isPlaying ? (
                <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-1 sm:p-2 text-white hover:text-amber-400 transition-colors duration-200"
              aria-label="Enter fullscreen"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>

          {/* Navigation Controls */}
          <button
            onClick={prev}
            className="absolute left-1 sm:left-2 lg:left-6 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full p-1 sm:p-2 lg:p-3 xl:p-4 shadow-lg z-20 transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 2xl:w-8 2xl:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-1 sm:right-2 lg:right-6 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full p-1 sm:p-2 lg:p-3 xl:p-4 shadow-lg z-20 transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 2xl:w-8 2xl:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Thumbnail Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 xl:gap-6 mt-4 sm:mt-6 lg:mt-8 xl:mt-10 max-w-7xl mx-auto">
          {slides.map((slide, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`group relative h-12 sm:h-16 md:h-20 lg:h-24 xl:h-32 rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden transition-all duration-500 ${
                i === index 
                  ? "ring-1 sm:ring-2 lg:ring-4 ring-[#CC0000] ring-offset-1 sm:ring-offset-2 ring-offset-white scale-105 shadow-md lg:shadow-lg" 
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
                <span className={`text-white text-xs sm:text-sm font-medium px-1 sm:px-2 py-0.5 sm:py-1 rounded-full transition-all duration-300 ${
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