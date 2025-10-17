import { useState, useEffect, useRef } from "react";
import Faculty1 from "../assets/FacultyRoom.jpg";
import Faculty2 from "../assets/FacultyRoom2.jpg";
import Collab from "../assets/CollabRoom.jpg";
import Collab2 from "../assets/CollabRoom2.jpg";

// Import room images - you'll need to update these paths based on your actual file structure
import Discussion1 from "../assets/1st_Floor//Discussion/Discussion_Room_1.jpg";
import Discussion2 from "../assets/1st_Floor/Discussion/Discussion_Room_2.jpg";
import Discussion3 from "../assets/1st_Floor/Discussion/Discussion_Room_3.jpg";
import Graduate1 from "../assets/1st_Floor/Graduate/Graduate_Research_Hub_1.jpg";
import Graduate2 from "../assets/1st_Floor/Graduate/Graduate_Research_Hub_2.jpg";
import Graduate3 from "../assets/1st_Floor/Graduate/Graduate_Research_Hub_3.jpg";

const slides = [
  // Existing slides
  { src: Faculty1, label: "Faculty Room", description: "Spacious work area for faculty members", category: "faculty" },
  { src: Faculty2, label: "Faculty Room", description: "Modern equipped workspace for educators", category: "faculty" },
  { src: Collab, label: "Collaboration Room", description: "Interactive space for team projects", category: "collaboration" },
  { src: Collab2, label: "Collaboration Room", description: "High-tech environment for group work", category: "collaboration" },
  // New discussion rooms
  { src: Discussion1, label: "Discussion Room 1", description: "Perfect for small group discussions and study sessions", category: "discussion" },
  { src: Discussion2, label: "Discussion Room 2", description: "Comfortable space for collaborative learning", category: "discussion" },
  { src: Discussion3, label: "Discussion Room 3", description: "Ideal for academic discussions and project meetings", category: "discussion" },
  // New graduate research hubs
  { src: Graduate1, label: "Graduate Research Hub 1", description: "Dedicated space for graduate research and studies", category: "graduate" },
  { src: Graduate2, label: "Graduate Research Hub 2", description: "Advanced research environment for graduate students", category: "graduate" },
  { src: Graduate3, label: "Graduate Research Hub 3", description: "Premium research facility for academic excellence", category: "graduate" },
];

const categories = [
  { id: "all", name: "All Rooms", color: "from-gray-500 to-gray-700" },
  { id: "faculty", name: "Faculty Rooms", color: "from-[#CC0000] to-[#B30000]" },
  { id: "collaboration", name: "Collaboration", color: "from-amber-500 to-amber-600" },
  { id: "discussion", name: "Discussion Rooms", color: "from-blue-500 to-blue-600" },
  { id: "graduate", name: "Graduate Research", color: "from-green-500 to-green-600" },
];

function Body3() {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const timer = useRef(null);
  const carouselRef = useRef(null);

  const filteredSlides = activeCategory === "all" 
    ? slides 
    : slides.filter(slide => slide.category === activeCategory);

  const next = () => setIndex((i) => (i + 1) % filteredSlides.length);
  const prev = () => setIndex((i) => (i - 1 + filteredSlides.length) % filteredSlides.length);

  useEffect(() => {
    if (isPlaying) {
      timer.current = setInterval(next, 5000);
    } else {
      clearInterval(timer.current);
    }
    return () => clearInterval(timer.current);
  }, [isPlaying, filteredSlides.length]);

  useEffect(() => {
    setIndex(0); // Reset to first slide when category changes
  }, [activeCategory]);

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

  const getCategoryColor = (category) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.color : "from-gray-500 to-gray-700";
  };

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
          Explore our thoughtfully designed spaces that foster productivity, collaboration, and academic excellence
        </p>
      </div>

      {/* Category Filter */}
      <div className="w-full max-w-6xl mx-auto mb-8 sm:mb-12 lg:mb-16">
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4 px-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-xs sm:text-sm lg:text-base transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                activeCategory === category.id
                  ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105`
                  : "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 shadow-md"
              }`}
            >
              {category.name}
            </button>
          ))}
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
          {filteredSlides.map((slide, i) => (
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
              
              {/* Category Badge */}
              <div className={`absolute top-4 left-4 z-20 bg-gradient-to-r ${getCategoryColor(slide.category)} text-white px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow-lg`}>
                {categories.find(cat => cat.id === slide.category)?.name}
              </div>
            </div>
          ))}

          {/* Slide Counter */}
          <div className="absolute top-4 right-4 z-20 bg-black/60 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm">
            {index + 1} / {filteredSlides.length}
          </div>

          {/* Slide Info */}
          <div className="absolute bottom-0 left-0 right-0 z-20 px-3 sm:px-4 lg:px-8 pb-4 sm:pb-6 lg:pb-8 xl:pb-12 pt-8 sm:pt-12 lg:pt-16 xl:pt-24">
            <div className="max-w-4xl mx-auto transform transition-all duration-700 delay-300">
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-white mb-1 sm:mb-2 drop-shadow-md">
                {filteredSlides[index]?.label}
              </h3>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-gray-200 mb-2 sm:mb-3 lg:mb-4 xl:mb-6 drop-shadow-md max-w-2xl">
                {filteredSlides[index]?.description}
              </p>
              <div className="flex space-x-1 sm:space-x-2">
                {filteredSlides.map((_, i) => (
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

        {/* Room Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mt-6 sm:mt-8 lg:mt-10 max-w-4xl mx-auto">
          {categories.filter(cat => cat.id !== 'all').map((category) => (
            <div 
              key={category.id}
              className={`bg-gradient-to-r ${category.color} text-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg text-center transition-all duration-300 hover:scale-105 cursor-default`}
            >
              <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                {slides.filter(slide => slide.category === category.id).length}
              </div>
              <div className="text-xs sm:text-sm opacity-90">
                {category.name}
              </div>
            </div>
          ))}
        </div>

        {/* Thumbnail Navigation */}
        <div className="mt-6 sm:mt-8 lg:mt-10">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 text-center mb-4 sm:mb-6">
            Browse All Rooms
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 max-w-7xl mx-auto">
            {filteredSlides.map((slide, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`group relative h-16 sm:h-20 md:h-24 lg:h-28 rounded-lg sm:rounded-xl overflow-hidden transition-all duration-500 ${
                  i === index 
                    ? "ring-2 sm:ring-3 ring-amber-400 ring-offset-1 sm:ring-offset-2 ring-offset-white scale-105 shadow-lg" 
                    : "opacity-90 hover:opacity-100 hover:scale-105 shadow-md"
                }`}
                aria-label={`View ${slide.label}`}
              >
                <img
                  src={slide.src}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className={`absolute inset-0 flex items-end justify-start transition-all duration-300 ${
                  i === index ? "bg-black/30" : "bg-black/50 group-hover:bg-black/30"
                }`}>
                  <span className={`text-white text-xs font-medium px-2 py-1 m-1 rounded transition-all duration-300 ${
                    i === index 
                      ? "bg-amber-500" 
                      : "bg-black/70 group-hover:bg-[#CC0000]"
                  }`}>
                    {slide.label.split(' ').pop()}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Room Features */}
        <div className="mt-10 sm:mt-12 lg:mt-16 bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center mb-6 sm:mb-8">
            Room Features & Amenities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-[#CC0000]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-[#CC0000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">High-Speed WiFi</h4>
              <p className="text-sm text-gray-600">Reliable internet connectivity for all your research needs</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-amber-400/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Audio-Visual Equipment</h4>
              <p className="text-sm text-gray-600">Modern presentation tools and display systems</p>
            </div>
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Secure Access</h4>
              <p className="text-sm text-gray-600">Reserved access for authorized users only</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Body3;