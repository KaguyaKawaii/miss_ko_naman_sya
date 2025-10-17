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

const floors = [
  {
    name: "1st Floor",
    description: "Graduate Research Hubs and Discussion Rooms",
    color: "from-blue-500 to-blue-600",
    icon: "🎓",
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
    description: "Collaboration Spaces and Faculty Rooms",
    color: "from-green-500 to-green-600",
    icon: "👥",
    rooms: [
      { src: Collab, label: "Collaboration Room 1", description: "Interactive space for team projects and group work" },
      { src: Collab2, label: "Collaboration Room 2", description: "High-tech environment for collaborative learning" },
      { src: Faculty1, label: "Faculty Room 1", description: "Spacious work area for faculty members" },
      { src: Faculty2, label: "Faculty Room 2", description: "Modern equipped workspace for educators" },
    ]
  },
  {
    name: "5th Floor",
    description: "Collaboration Spaces and Faculty Rooms",
    color: "from-amber-500 to-amber-600",
    icon: "🏢",
    rooms: [
      { src: Collab, label: "Collaboration Room 3", description: "Interactive space for team projects and group work" },
      { src: Collab2, label: "Collaboration Room 4", description: "High-tech environment for collaborative learning" },
      { src: Faculty1, label: "Faculty Room 3", description: "Spacious work area for faculty members" },
      { src: Faculty2, label: "Faculty Room 4", description: "Modern equipped workspace for educators" },
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
    <section className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800 py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden flex flex-col items-center">
      {/* Decorative elements */}
      <div className="absolute top-10 sm:top-20 right-2 sm:right-4 lg:right-10 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-[#CC0000]/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-4 sm:bottom-10 left-2 sm:left-4 lg:left-10 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-amber-400/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute top-1/2 left-1/4 w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-blue-400/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-1/3 right-1/4 w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 bg-green-400/5 rounded-full blur-3xl -z-10"></div>
      
      {/* Heading */}
      <div className="text-center mb-8 sm:mb-12 lg:mb-16 max-w-4xl mx-auto transform transition-all duration-500">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 text-gray-900">
          Our <span className="text-[#CC0000]">Facilities</span>
        </h2>
        <div className="w-16 sm:w-20 md:w-24 lg:w-32 h-1 sm:h-1.5 bg-gradient-to-r from-[#CC0000] via-amber-400 to-[#CC0000] mx-auto rounded-full mb-3 sm:mb-4 lg:mb-6"></div>
        <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
          Explore our multi-floor library facilities designed for every academic need
        </p>
      </div>

      {/* Floor Navigation */}
      <div className="w-full max-w-6xl mx-auto mb-8 sm:mb-12 lg:mb-16">
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-8">
          {floors.map((floor, floorIndex) => (
            <button
              key={floor.name}
              onClick={() => {
                setActiveFloorIndex(floorIndex);
                // Calculate the starting index for this floor
                let startIndex = 0;
                for (let i = 0; i < floorIndex; i++) {
                  startIndex += floors[i].rooms.length;
                }
                setIndex(startIndex);
              }}
              className={`px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base lg:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-3 ${
                activeFloorIndex === floorIndex
                  ? `bg-gradient-to-r ${floor.color} text-white shadow-xl scale-105`
                  : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 shadow-lg"
              }`}
            >
              <span className="text-lg sm:text-xl">{floor.icon}</span>
              <div className="text-left">
                <div className="font-bold">{floor.name}</div>
                <div className="text-xs sm:text-sm opacity-80 font-normal">
                  {floor.rooms.length} rooms
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Floor Info */}
      <div className="w-full max-w-4xl mx-auto mb-8 sm:mb-12 text-center">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6 inline-block">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
            {floors[activeFloorIndex].name}
          </h3>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl">
            {floors[activeFloorIndex].description}
          </p>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="w-full max-w-6xl xl:max-w-7xl mx-auto">
        {/* Carousel */}
        <div
          ref={carouselRef}
          className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 xl:h-[30rem] 2xl:h-[40rem] rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl lg:shadow-2xl group transition-all duration-500 hover:shadow-2xl"
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              
              {/* Floor Badge */}
              <div className="absolute top-4 left-4 z-20">
                <div className={`bg-gradient-to-r ${floors[currentFloorIndex].color} text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-lg flex items-center space-x-2`}>
                  <span>{floors[currentFloorIndex].icon}</span>
                  <span>{floors[currentFloorIndex].name}</span>
                </div>
              </div>
            </div>
          ))}

          {/* Slide Counter */}
          <div className="absolute top-4 right-4 z-20 bg-black/60 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm">
            {index + 1} / {allSlides.length}
          </div>

          {/* Slide Info */}
          <div className="absolute bottom-0 left-0 right-0 z-20 px-3 sm:px-4 lg:px-8 pb-4 sm:pb-6 lg:pb-8 xl:pb-12 pt-8 sm:pt-12 lg:pt-16 xl:pt-24">
            <div className="max-w-4xl mx-auto transform transition-all duration-700 delay-300">
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-md">
                {allSlides[index]?.label}
              </h3>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-200 mb-2 sm:mb-3 lg:mb-4 xl:mb-6 drop-shadow-md max-w-2xl">
                {allSlides[index]?.description}
              </p>
              <div className="flex space-x-1 sm:space-x-2">
                {allSlides.map((_, i) => (
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
          <div className="absolute bottom-2 sm:bottom-3 lg:bottom-4 xl:bottom-6 right-2 sm:right-3 lg:right-4 xl:right-6 flex items-center space-x-1 sm:space-x-2 lg:space-x-3 bg-black/40 backdrop-blur-sm rounded-full px-2 sm:px-3 lg:px-4 py-1 sm:py-2 z-20 transition-opacity duration-300">
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

        {/* Floor Room Grid */}
        <div className="mt-8 sm:mt-12 lg:mt-16">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-6 sm:mb-8">
            {floors[activeFloorIndex].name} Rooms
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
            {floors[activeFloorIndex].rooms.map((room, roomIndex) => {
              const globalIndex = floors.slice(0, activeFloorIndex).reduce((acc, floor) => acc + floor.rooms.length, 0) + roomIndex;
              return (
                <button
                  key={roomIndex}
                  onClick={() => goToSlide(globalIndex)}
                  className={`group relative h-48 sm:h-56 lg:h-64 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-500 ${
                    globalIndex === index 
                      ? "ring-3 ring-amber-400 ring-offset-2 ring-offset-white scale-105 shadow-xl" 
                      : "hover:scale-105 shadow-lg hover:shadow-xl"
                  }`}
                  aria-label={`View ${room.label}`}
                >
                  <img
                    src={room.src}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-start p-4 sm:p-6 transition-all duration-300 ${
                    globalIndex === index ? "bg-black/40" : "bg-black/50 group-hover:bg-black/40"
                  }`}>
                    <div className="text-left">
                      <h4 className="text-white font-semibold text-sm sm:text-base lg:text-lg mb-1 drop-shadow-md">
                        {room.label}
                      </h4>
                      <p className="text-gray-200 text-xs sm:text-sm drop-shadow-md line-clamp-2">
                        {room.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Total Rooms Summary */}
        <div className="mt-12 sm:mt-16 lg:mt-20 bg-gradient-to-r from-gray-50 to-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 text-center">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            Library Facilities Overview
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto">
            {floors.map((floor, index) => (
              <div key={floor.name} className="bg-white rounded-lg p-4 shadow-md">
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-r ${floor.color} flex items-center justify-center text-white text-lg font-bold`}>
                  {index + 1}
                </div>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{floor.name}</h4>
                <p className="text-gray-600 text-xs sm:text-sm">{floor.rooms.length} rooms</p>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-600 text-sm sm:text-base">
              Total of <span className="font-semibold text-[#CC0000]">{allSlides.length} rooms</span> available across all floors
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Body3;