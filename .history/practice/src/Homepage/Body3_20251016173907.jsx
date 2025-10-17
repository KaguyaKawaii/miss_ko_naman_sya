// Body3.jsx
import { useState, useEffect, useRef } from "react";
import Faculty1 from "../assets/FacultyRoom.jpg";
import Faculty2 from "../assets/FacultyRoom2.jpg";
import Collab from "../assets/CollabRoom.jpg";
import Collab2 from "../assets/CollabRoom2.jpg";

// Import room images from 1st_Floor folder
import Discussion1 from "../assets/1st_Floor/Discussion/Discussion_Room_1.jpg";
import Discussion2 from "../assets/1st_Floor/Discussion/Discussion_Room_2.jpg";
import Discussion3 from "../assets/1st_Floor/Discussion/Discussion_Room_3.jpg";
import Graduate1 from "../assets/1st_Floor/Graduate/Graduate_Research_Hub_1.jpg";
import Graduate2 from "../assets/1st_Floor/Graduate/Graduate_Research_Hub_2.jpg";
import Graduate3 from "../assets/1st_Floor/Graduate/Graduate_Research_Hub_3.jpg";
import GroundFloor from "../assets/1st_Floor/Ground_Floor.jpg";

// Import floor background image
import Picture2 from "../assets/picture2.jpg";

const floors = [
  {
    name: "1st Floor",
    description: "Graduate Research Hubs and Discussion Rooms",
    color: "from-blue-500 to-blue-700",
    accentColor: "blue-500",
    background: GroundFloor,
    rooms: [
      { src: Graduate1, label: "Graduate Research Hub 1", description: "Dedicated space for graduate research and advanced studies" },
      { src: Graduate2, label: "Graduate Research Hub 2", description: "Advanced research environment for graduate students" },
      { src: Graduate3, label: "Graduate Research Hub 3", description: "Premium research facility for academic excellence" },
      { src: Discussion1, label: "Discussion Room 1", description: "Perfect for small group discussions and study sessions" },
      { src: Discussion2, label: "Discussion Room 2", description: "Comfortable space for collaborative learning and academic discussions" },
      { src: Discussion3, label: "Discussion Room 3", description: "Ideal for project meetings and group study sessions" },
    ]
  },
  {
    name: "4th Floor",
    description: "Collaboration Space and Faculty Room",
    color: "from-emerald-500 to-emerald-700",
    accentColor: "emerald-500",
    background: Picture2,
    rooms: [
      { src: Collab, label: "Collaboration Room", description: "Interactive space for team projects and group work" },
      { src: Faculty1, label: "Faculty Room", description: "Spacious work area for faculty members" },
    ]
  },
  {
    name: "5th Floor",
    description: "Collaboration Space and Faculty Room",
    color: "from-amber-500 to-amber-700",
    accentColor: "amber-500",
    background: Picture2,
    rooms: [
      { src: Collab2, label: "Collaboration Room", description: "High-tech environment for collaborative learning and team projects" },
      { src: Faculty2, label: "Faculty Room", description: "Modern equipped workspace for educators and faculty members" },
    ]
  }
];

// Combine all slides for the carousel
const allSlides = floors.flatMap(floor => floor.rooms);

function Body3() {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeFloorIndex, setActiveFloorIndex] = useState(0);
  const timer = useRef(null);
  const carouselRef = useRef(null);

  const next = () => setIndex((i) => (i + 1) % allSlides.length);
  const prev = () => setIndex((i) => (i - 1 + allSlides.length) % allSlides.length);

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
      carouselRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Find which floor the current slide belongs to
  const getCurrentSlideFloor = () => {
    let cumulativeIndex = 0;
    for (let i = 0; i < floors.length; i++) {
      if (index < cumulativeIndex + floors[i].rooms.length) {
        return i;
      }
      cumulativeIndex += floors[i].rooms.length;
    }
    return 0;
  };

  const currentFloorIndex = getCurrentSlideFloor();

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-gray-800 py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden flex flex-col items-center">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-60 h-60 sm:w-80 sm:h-80 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 sm:w-96 sm:h-96 bg-amber-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl -z-10"></div>
      <div className="absolute top-1/3 left-1/4 w-48 h-48 sm:w-64 sm:h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>
      
      {/* Heading */}
      <div className="text-center mb-12 sm:mb-16 lg:mb-20 max-w-5xl mx-auto px-4">

        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
          Our <span className="text-[#CC0000]">Facilities</span>
        </h2>
        <div className="w-20 sm:w-24 lg:w-32 h-1.5 bg-gradient-to-r from-[#CC0000] via-amber-500 to-[#CC0000] mx-auto rounded-full mb-6 sm:mb-8"></div>
        <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
          Discover our thoughtfully designed spaces across multiple floors, crafted to support every aspect of academic excellence
        </p>
      </div>

      {/* Floor Navigation */}
      <div className="w-full max-w-5xl mx-auto mb-12 sm:mb-16 lg:mb-20 px-4">
        <div className="flex flex-col sm:flex-row justify-center items-stretch gap-4 sm:gap-6">
          {floors.map((floor, floorIndex) => (
            <button
              key={floor.name}
              onClick={() => {
                setActiveFloorIndex(floorIndex);
                let startIndex = 0;
                for (let i = 0; i < floorIndex; i++) {
                  startIndex += floors[i].rooms.length;
                }
                setIndex(startIndex);
              }}
              className={`group relative p-4 sm:p-6 lg:p-8 rounded-2xl transition-all duration-500 transform hover:scale-105 flex-1 min-w-0 ${
                activeFloorIndex === floorIndex
                  ? `bg-gradient-to-br ${floor.color} shadow-2xl scale-105 text-white`
                  : "bg-white/80 backdrop-blur-sm border border-gray-200/80 shadow-lg hover:shadow-xl text-gray-700"
              }`}
            >
              <div className="text-center">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  activeFloorIndex === floorIndex 
                    ? "bg-white/20 text-white" 
                    : `bg-${floor.accentColor}/10 text-${floor.accentColor}`
                }`}>
                  <span className="text-base sm:text-lg font-bold">{floorIndex + 1}</span>
                </div>
                <h3 className={`text-lg sm:text-xl font-bold mb-2 transition-colors duration-300 ${
                  activeFloorIndex === floorIndex ? "text-white" : "text-gray-900"
                }`}>
                  {floor.name}
                </h3>
                <p className={`text-xs sm:text-sm mb-3 transition-colors duration-300 ${
                  activeFloorIndex === floorIndex ? "text-white/90" : "text-gray-600"
                }`}>
                  {floor.rooms.length} Room{floor.rooms.length !== 1 ? 's' : ''}
                </p>
                <div className={`w-10 h-0.5 mx-auto rounded-full transition-all duration-300 ${
                  activeFloorIndex === floorIndex ? "bg-white/60" : `bg-${floor.accentColor}/30`
                }`}></div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Carousel Container */}
      <div className="w-full max-w-7xl mx-auto px-4">
        {/* Carousel */}
        <div
          ref={carouselRef}
          className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[28rem] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl group transition-all duration-500"
          onMouseEnter={() => setIsPlaying(false)}
          onMouseLeave={() => setIsPlaying(true)}
        >
          {/* Slides */}
          {allSlides.map((slide, i) => (
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              
              {/* Floor Badge */}
              <div className="absolute top-4 sm:top-6 left-4 sm:left-6 z-20">
                <div className={`bg-gradient-to-r ${floors[currentFloorIndex].color} text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-xl backdrop-blur-sm`}>
                  {floors[currentFloorIndex].name}
                </div>
              </div>
            </div>
          ))}

          {/* Slide Counter */}
          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20 bg-black/60 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm shadow-lg">
            {index + 1} / {allSlides.length}
          </div>

          {/* Slide Info */}
          <div className="absolute bottom-0 left-0 right-0 z-20 px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 lg:pb-12 pt-12 sm:pt-16 lg:pt-20">
            <div className="max-w-4xl mx-auto transform transition-all duration-700 delay-300">
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-3 lg:mb-4 drop-shadow-2xl">
                {allSlides[index]?.label}
              </h3>
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-200 mb-4 sm:mb-6 lg:mb-8 drop-shadow-2xl max-w-3xl leading-relaxed">
                {allSlides[index]?.description}
              </p>
              <div className="flex space-x-1 sm:space-x-2 lg:space-x-3">
                {allSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                      i === index 
                        ? "w-6 sm:w-8 lg:w-12 bg-amber-400 shadow-lg" 
                        : "w-3 sm:w-4 lg:w-6 bg-white/50 hover:bg-white/80 shadow-md"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Control Bar */}
          <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 flex items-center space-x-2 sm:space-x-3 bg-black/40 backdrop-blur-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 z-20 transition-opacity duration-300 shadow-xl">
            <button
              onClick={togglePlay}
              className="p-1 sm:p-2 text-white hover:text-amber-300 transition-colors duration-200"
              aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isPlaying ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-1 sm:p-2 text-white hover:text-amber-300 transition-colors duration-200"
              aria-label="Enter fullscreen"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-black/40 backdrop-blur-sm rounded-full text-white hover:text-amber-300 transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-xl hover:bg-black/60"
            aria-label="Previous slide"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 bg-black/40 backdrop-blur-sm rounded-full text-white hover:text-amber-300 transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-xl hover:bg-black/60"
            aria-label="Next slide"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

export default Body3;