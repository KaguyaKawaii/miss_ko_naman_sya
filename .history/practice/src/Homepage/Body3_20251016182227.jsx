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
    color: "from-[#CC0000] to-[#990000]",
    accentColor: "[#CC0000]",
    background: GroundFloor,
    floorImage: GroundFloor,
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
    color: "from-[#CC0000] to-[#990000]",
    accentColor: "[#CC0000]",
    background: Picture2,
    floorImage: Picture2,
    rooms: [
      { src: Collab, label: "Collaboration Room", description: "Interactive space for team projects and group work" },
      { src: Faculty1, label: "Faculty Room", description: "Spacious work area for faculty members" },
    ]
  },
  {
    name: "5th Floor",
    description: "Collaboration Space and Faculty Room",
    color: "from-[#CC0000] to-[#990000]",
    accentColor: "[#CC0000]",
    background: Picture2,
    floorImage: Picture2,
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
  const [isFloorImageFullscreen, setIsFloorImageFullscreen] = useState(false);
  const timer = useRef(null);
  const carouselRef = useRef(null);
  const floorImageRef = useRef(null);

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

  const toggleFloorImageFullscreen = () => {
    if (!document.fullscreenElement) {
      floorImageRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFloorImageFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFloorImageFullscreen(false);
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
    <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-gray-800 py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden flex flex-col items-center">
      {/* Enhanced Decorative elements */}
      <div className="absolute top-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-[#CC0000]/3 rounded-full -translate-y-1/3 translate-x-1/3 blur-4xl -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 sm:w-[500px] sm:h-[500px] bg-[#CC0000]/3 rounded-full translate-y-1/3 -translate-x-1/3 blur-4xl -z-10 animate-pulse-slower"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#CC0000]/2 rounded-full blur-4xl -z-10"></div>
      
      {/* Floor Header Section */}
      <div className="w-full max-w-8xl mx-auto mb-16 sm:mb-20 lg:mb-24 px-4">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-0.5 bg-[#CC0000] rounded-full"></div>
            <span className="text-sm font-semibold text-[#CC0000] uppercase tracking-wider">Explore Our Spaces</span>
            <div className="w-8 h-0.5 bg-[#CC0000] rounded-full"></div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            {floors[activeFloorIndex].name}
          </h1>
          <p className="text-xl sm:text-2xl lg:text-3xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
            {floors[activeFloorIndex].description}
          </p>
        </div>

        {/* Enhanced Floor Overview Image */}
        <div 
          ref={floorImageRef}
          className="relative w-full h-80 sm:h-96 lg:h-[500px] xl:h-[600px] rounded-3xl sm:rounded-4xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 group cursor-zoom-in mb-16"
          onClick={toggleFloorImageFullscreen}
        >
          <img
            src={floors[activeFloorIndex].floorImage}
            alt={`${floors[activeFloorIndex].name} Overview`}
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
          
          {/* Enhanced Overlay Content */}
          <div className="absolute bottom-8 left-8 sm:bottom-12 sm:left-12 transform transition-transform duration-500 group-hover:translate-y-[-10px]">
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-2xl">
              Floor Overview
            </h3>
            <div className="w-20 h-1.5 bg-[#CC0000] rounded-full mb-4 shadow-lg"></div>
            <p className="text-white/90 text-lg sm:text-xl drop-shadow-2xl max-w-2xl">
              Click to view fullscreen • Scroll to explore facilities
            </p>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFloorImageFullscreen}
            className="absolute top-6 right-6 z-20 p-3 bg-black/40 backdrop-blur-sm rounded-2xl text-white hover:text-[#CC0000] transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-xl hover:bg-black/60 transform translate-y-[-10px] group-hover:translate-y-0"
            aria-label="View floor overview in fullscreen"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>

          {/* Hover Effect Indicator */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 animate-ping-slow">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Our Facilities Heading */}
      <div className="text-center mb-16 sm:mb-20 lg:mb-24 max-w-6xl mx-auto px-4">
        <div className="inline-flex items-center justify-center space-x-4 mb-8">
          <div className="w-12 h-0.5 bg-gray-300 rounded-full"></div>
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Discover</span>
          <div className="w-12 h-0.5 bg-gray-300 rounded-full"></div>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight">
          Our <span className="text-[#CC0000] relative">
            Facilities
            <div className="absolute bottom-2 left-0 w-full h-3 bg-[#CC0000]/10 -z-10 transform rotate-[-1deg]"></div>
          </span>
        </h2>
        
        <div className="w-24 sm:w-32 lg:w-40 h-2 bg-gradient-to-r from-[#CC0000] via-[#CC0000] to-[#CC0000] mx-auto rounded-full mb-8 sm:mb-10 shadow-lg"></div>
        
        <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
          Immerse yourself in our carefully crafted environments designed to inspire innovation and collaboration
        </p>
      </div>

      {/* Enhanced Floor Navigation */}
      <div className="w-full max-w-6xl mx-auto mb-16 sm:mb-20 lg:mb-24 px-4">
        <div className="flex flex-col sm:flex-row justify-center items-stretch gap-6 sm:gap-8 lg:gap-12">
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
              className={`group relative p-6 sm:p-8 lg:p-10 rounded-3xl transition-all duration-500 transform hover:scale-105 flex-1 min-w-0 border-2 ${
                activeFloorIndex === floorIndex
                  ? `bg-gradient-to-br ${floor.color} shadow-3xl scale-105 text-white border-transparent`
                  : "bg-white/90 backdrop-blur-lg border-gray-200/60 shadow-2xl hover:shadow-3xl text-gray-700 hover:border-[#CC0000]/20"
              }`}
            >
              {/* Background Pattern */}
              <div className={`absolute inset-0 rounded-3xl opacity-5 ${
                activeFloorIndex === floorIndex ? "bg-white" : "bg-[#CC0000]"
              }`}></div>
              
              <div className="text-center relative z-10">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-2xl flex items-center justify-center transition-all duration-500 transform group-hover:scale-110 ${
                  activeFloorIndex === floorIndex 
                    ? "bg-white/20 text-white shadow-lg" 
                    : "bg-[#CC0000]/10 text-[#CC0000] shadow-md group-hover:shadow-lg"
                }`}>
                  <span className="text-xl sm:text-2xl font-bold">{floorIndex + 1}</span>
                </div>
                
                <h3 className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-3 transition-colors duration-300 ${
                  activeFloorIndex === floorIndex ? "text-white" : "text-gray-900"
                }`}>
                  {floor.name}
                </h3>
                
                <p className={`text-sm sm:text-base mb-4 transition-colors duration-300 ${
                  activeFloorIndex === floorIndex ? "text-white/90" : "text-gray-600"
                }`}>
                  {floor.rooms.length} Room{floor.rooms.length !== 1 ? 's' : ''}
                </p>
                
                <div className={`w-16 h-1 mx-auto rounded-full transition-all duration-500 transform group-hover:scale-125 ${
                  activeFloorIndex === floorIndex ? "bg-white/60" : "bg-[#CC0000]/30 group-hover:bg-[#CC0000]/50"
                }`}></div>
              </div>

              {/* Hover Glow Effect */}
              <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                activeFloorIndex === floorIndex ? "bg-white/10" : "bg-[#CC0000]/5"
              }`}></div>
            </button>
          ))}
        </div>
      </div>

      {/* Enhanced Carousel Container */}
      <div className="w-full max-w-8xl mx-auto px-4">
        {/* Enhanced Carousel */}
        <div
          ref={carouselRef}
          className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] xl:h-[600px] 2xl:h-[700px] rounded-3xl sm:rounded-4xl overflow-hidden shadow-3xl hover:shadow-4xl group transition-all duration-500 border-2 border-white/20"
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
                className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
              
              {/* Enhanced Floor Badge */}
              <div className="absolute top-6 sm:top-8 left-6 sm:left-8 z-20 transform transition-transform duration-500 group-hover:translate-y-[-5px]">
                <div className="bg-gradient-to-r from-[#CC0000] to-[#990000] text-white px-4 py-2 sm:px-6 sm:py-3 rounded-2xl text-sm sm:text-base font-semibold shadow-2xl backdrop-blur-sm border border-white/10">
                  {floors[currentFloorIndex].name}
                </div>
              </div>
            </div>
          ))}

          {/* Enhanced Slide Counter */}
          <div className="absolute top-6 sm:top-8 right-6 sm:right-8 z-20 bg-black/60 backdrop-blur-lg text-white px-4 py-2 sm:px-5 sm:py-3 rounded-2xl text-sm sm:text-base font-medium shadow-2xl border border-white/10 transform transition-transform duration-500 group-hover:translate-y-[-5px]">
            {index + 1} / {allSlides.length}
          </div>

          {/* Enhanced Slide Info */}
          <div className="absolute bottom-0 left-0 right-0 z-20 px-6 sm:px-8 lg:px-12 pb-8 sm:pb-12 lg:pb-16 pt-16 sm:pt-20 lg:pt-24">
            <div className="max-w-5xl mx-auto transform transition-all duration-700 delay-300">
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 lg:mb-8 drop-shadow-2xl leading-tight">
                {allSlides[index]?.label}
              </h3>
              <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-200 mb-6 sm:mb-8 lg:mb-10 drop-shadow-2xl max-w-4xl leading-relaxed font-light">
                {allSlides[index]?.description}
              </p>
              <div className="flex space-x-2 sm:space-x-3 lg:space-x-4">
                {allSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={`h-2 sm:h-2.5 rounded-full transition-all duration-500 transform hover:scale-110 ${
                      i === index 
                        ? "w-8 sm:w-12 lg:w-16 bg-[#CC0000] shadow-lg" 
                        : "w-4 sm:w-6 lg:w-8 bg-white/50 hover:bg-white/80 shadow-md"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Control Bar */}
          <div className="absolute bottom-6 sm:bottom-8 right-6 sm:right-8 flex items-center space-x-3 sm:space-x-4 bg-black/50 backdrop-blur-lg rounded-2xl px-4 sm:px-5 py-2 sm:py-3 z-20 transition-all duration-500 shadow-2xl border border-white/10 transform translate-y-[10px] group-hover:translate-y-0">
            <button
              onClick={togglePlay}
              className="p-2 sm:p-3 text-white hover:text-[#CC0000] transition-all duration-300 transform hover:scale-110"
              aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isPlaying ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 sm:p-3 text-white hover:text-[#CC0000] transition-all duration-300 transform hover:scale-110"
              aria-label="Enter fullscreen"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>

          {/* Enhanced Navigation Arrows */}
          <button
            onClick={prev}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-4 bg-black/50 backdrop-blur-lg rounded-2xl text-white hover:text-[#CC0000] transition-all duration-500 opacity-0 group-hover:opacity-100 shadow-2xl hover:bg-black/60 border border-white/10 transform -translate-x-4 group-hover:translate-x-0"
            aria-label="Previous slide"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-4 bg-black/50 backdrop-blur-lg rounded-2xl text-white hover:text-[#CC0000] transition-all duration-500 opacity-0 group-hover:opacity-100 shadow-2xl hover:bg-black/60 border border-white/10 transform translate-x-4 group-hover:translate-x-0"
            aria-label="Next slide"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Add custom animations to tailwind config */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-pulse-slower {
          animation: pulse-slower 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-ping-slow {
          animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </section>
  );
}

export default Body3;