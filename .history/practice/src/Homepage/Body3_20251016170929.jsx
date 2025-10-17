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
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl -z-10"></div>
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>
      
      {/* Heading */}
      <div className="text-center mb-12 sm:mb-16 lg:mb-20 max-w-5xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#CC0000] to-[#B30000] rounded-2xl shadow-lg mb-6 sm:mb-8">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
          Our <span className="text-[#CC0000]">Facilities</span>
        </h2>
        <div className="w-24 sm:w-32 h-1.5 bg-gradient-to-r from-[#CC0000] via-amber-500 to-[#CC0000] mx-auto rounded-full mb-6 sm:mb-8"></div>
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
          Discover our thoughtfully designed spaces across multiple floors, crafted to support every aspect of academic excellence
        </p>
      </div>

      {/* Floor Navigation */}
      <div className="w-full max-w-5xl mx-auto mb-12 sm:mb-16 lg:mb-20">
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
              className={`group relative p-6 sm:p-8 rounded-2xl transition-all duration-500 transform hover:scale-105 flex-1 min-w-0 ${
                activeFloorIndex === floorIndex
                  ? `bg-gradient-to-br ${floor.color} shadow-2xl scale-105 text-white`
                  : "bg-white/80 backdrop-blur-sm border border-gray-200/80 shadow-lg hover:shadow-xl text-gray-700"
              }`}
            >
              <div className="text-center">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  activeFloorIndex === floorIndex 
                    ? "bg-white/20 text-white" 
                    : `bg-${floor.accentColor}/10 text-${floor.accentColor}`
                }`}>
                  <span className="text-lg font-bold">{floorIndex + 1}</span>
                </div>
                <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                  activeFloorIndex === floorIndex ? "text-white" : "text-gray-900"
                }`}>
                  {floor.name}
                </h3>
                <p className={`text-sm mb-3 transition-colors duration-300 ${
                  activeFloorIndex === floorIndex ? "text-white/90" : "text-gray-600"
                }`}>
                  {floor.rooms.length} Room{floor.rooms.length !== 1 ? 's' : ''}
                </p>
                <div className={`w-12 h-0.5 mx-auto rounded-full transition-all duration-300 ${
                  activeFloorIndex === floorIndex ? "bg-white/60" : `bg-${floor.accentColor}/30`
                }`}></div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Carousel Container */}
      <div className="w-full max-w-7xl mx-auto">
        {/* Carousel */}
        <div
          ref={carouselRef}
          className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[28rem] xl:h-[32rem] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl group transition-all duration-500"
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
              <div className="absolute top-6 left-6 z-20">
                <div className={`bg-gradient-to-r ${floors[currentFloorIndex].color} text-white px-4 py-2 rounded-full text-sm font-semibold shadow-xl backdrop-blur-sm`}>
                  {floors[currentFloorIndex].name}
                </div>
              </div>
            </div>
          ))}

          {/* Slide Counter */}
          <div className="absolute top-6 right-6 z-20 bg-black/60 text-white px-3 py-2 rounded-full text-sm font-medium backdrop-blur-sm shadow-lg">
            {index + 1} / {allSlides.length}
          </div>

          {/* Slide Info */}
          <div className="absolute bottom-0 left-0 right-0 z-20 px-6 sm:px-8 lg:px-12 pb-8 sm:pb-12 lg:pb-16 pt-16 sm:pt-20 lg:pt-24">
            <div className="max-w-4xl mx-auto transform transition-all duration-700 delay-300">
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 drop-shadow-2xl">
                {allSlides[index]?.label}
              </h3>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 mb-6 sm:mb-8 drop-shadow-2xl max-w-3xl leading-relaxed">
                {allSlides[index]?.description}
              </p>
              <div className="flex space-x-2 sm:space-x-3">
                {allSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToSlide(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === index 
                        ? "w-8 sm:w-12 bg-amber-400 shadow-lg" 
                        : "w-4 sm:w-6 bg-white/50 hover:bg-white/80 shadow-md"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Control Bar */}
          <div className="absolute bottom-6 right-6 flex items-center space-x-3 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2 z-20 transition-opacity duration-300 shadow-xl">
            <button
              onClick={togglePlay}
              className="p-2 text-white hover:text-amber-300 transition-colors duration-200"
              aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 text-white hover:text-amber-300 transition-colors duration-200"
              aria-label="Enter fullscreen"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>

          {/* Navigation Controls */}
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full p-3 shadow-2xl z-20 transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Previous slide"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full p-3 shadow-2xl z-20 transition-all duration-300 opacity-0 group-hover:opacity-100"
            aria-label="Next slide"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Floor Section with Background */}
        <div className="mt-12 sm:mt-16 lg:mt-20 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
          {/* Floor Background */}
          <div 
            className="relative h-48 sm:h-64 md:h-80 lg:h-96 bg-cover bg-center"
            style={{ backgroundImage: `url(${floors[activeFloorIndex].background})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 drop-shadow-2xl">
                  {floors[activeFloorIndex].name}
                </h3>
                <p className="text-xl sm:text-2xl lg:text-3xl drop-shadow-2xl max-w-2xl mx-auto leading-relaxed">
                  {floors[activeFloorIndex].description}
                </p>
              </div>
            </div>
          </div>

          {/* Room Grid */}
          <div className="bg-white/95 backdrop-blur-sm p-6 sm:p-8 lg:p-12">
            <div className={`grid gap-6 sm:gap-8 max-w-6xl mx-auto ${
              floors[activeFloorIndex].rooms.length === 2 
                ? 'grid-cols-1 lg:grid-cols-2' 
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {floors[activeFloorIndex].rooms.map((room, roomIndex) => {
                const globalIndex = floors.slice(0, activeFloorIndex).reduce((acc, floor) => acc + floor.rooms.length, 0) + roomIndex;
                return (
                  <button
                    key={roomIndex}
                    onClick={() => goToSlide(globalIndex)}
                    className={`group relative h-80 sm:h-96 rounded-2xl overflow-hidden transition-all duration-500 ${
                      globalIndex === index 
                        ? "ring-4 ring-amber-400 ring-offset-4 ring-offset-white scale-105 shadow-2xl" 
                        : "hover:scale-105 shadow-xl hover:shadow-2xl"
                    }`}
                    aria-label={`View ${room.label}`}
                  >
                    <img
                      src={room.src}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end justify-start p-6 sm:p-8 transition-all duration-300 ${
                      globalIndex === index ? "bg-black/30" : "bg-black/50 group-hover:bg-black/40"
                    }`}>
                      <div className="text-left">
                        <h4 className="text-white font-bold text-xl sm:text-2xl lg:text-3xl mb-3 drop-shadow-2xl">
                          {room.label}
                        </h4>
                        <p className="text-gray-200 text-base sm:text-lg drop-shadow-2xl leading-relaxed">
                          {room.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Total Rooms Summary */}
        <div className="mt-16 sm:mt-20 lg:mt-24 bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 sm:p-12 text-center">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
            Library Facilities Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {floors.map((floor, index) => (
              <div key={floor.name} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${floor.color} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                  {index + 1}
                </div>
                <h4 className="font-bold text-gray-900 text-xl mb-3">{floor.name}</h4>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{floor.description}</p>
                <div className="text-3xl font-bold text-[#CC0000]">{floor.rooms.length}</div>
                <div className="text-gray-500 text-sm">Rooms</div>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200/60">
            <p className="text-xl text-gray-700">
              Total of <span className="font-bold text-[#CC0000] text-2xl">{allSlides.length} rooms</span> available across all floors
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Body3;