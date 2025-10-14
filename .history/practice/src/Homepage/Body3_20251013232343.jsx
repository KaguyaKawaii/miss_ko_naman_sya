// Body3.jsx
import { useState, useEffect, useRef } from "react";

const floors = [
  {
    level: "Ground Floor",
    title: "Reception & Main Area",
    description: "Welcome area, information desk, and quick access collections",
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
    icon: "🏢",
    rooms: [
      { label: "Main Reception", description: "Welcome and information desk with friendly staff" },
      { label: "Quick Access Zone", description: "Popular collections and new arrivals" },
      { label: "Library Cafe", description: "Coffee and refreshments area" },
    ]
  },
  {
    level: "First Floor",
    title: "Collaboration Spaces",
    description: "Interactive areas for group work and team projects",
    color: "bg-gradient-to-br from-green-500 to-green-600",
    icon: "👥",
    rooms: [
      { label: "Collaboration Room A", description: "Interactive space for team projects with whiteboards" },
      { label: "Collaboration Room B", description: "High-tech environment for group work" },
      { label: "Brainstorming Area", description: "Creative space with flexible seating" },
    ]
  },
  {
    level: "Second Floor",
    title: "Study Areas",
    description: "Quiet zones for individual study and research",
    color: "bg-gradient-to-br from-purple-500 to-purple-600",
    icon: "📚",
    rooms: [
      { label: "Silent Study Room", description: "Peaceful environment for focused individual work" },
      { label: "Research Carrels", description: "Private study stations with charging ports" },
      { label: "Reading Lounge", description: "Comfortable seating for extended reading sessions" },
    ]
  },
  {
    level: "Third Floor",
    title: "Technology Hub",
    description: "Digital resources and computer workstations",
    color: "bg-gradient-to-br from-orange-500 to-orange-600",
    icon: "💻",
    rooms: [
      { label: "Computer Lab", description: "High-speed computers with specialized software" },
      { label: "Digital Media Studio", description: "Equipment for multimedia projects" },
      { label: "Tech Support Desk", description: "Assistance with digital resources and devices" },
    ]
  },
  {
    level: "Fourth Floor",
    title: "Special Collections",
    description: "Rare books and specialized research materials",
    color: "bg-gradient-to-br from-red-500 to-red-600",
    icon: "🔍",
    rooms: [
      { label: "Archives Room", description: "Preserved historical documents and rare collections" },
      { label: "Research Suite", description: "Dedicated space for academic research" },
      { label: "Conference Room", description: "Meeting space for scholarly discussions" },
    ]
  }
];

function Body3() {
  const [currentFloor, setCurrentFloor] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const timer = useRef(null);

  const nextFloor = () => setCurrentFloor((i) => (i + 1) % floors.length);
  const prevFloor = () => setCurrentFloor((i) => (i - 1 + floors.length) % floors.length);

  useEffect(() => {
    if (isPlaying) {
      timer.current = setInterval(nextFloor, 6000);
    } else {
      clearInterval(timer.current);
    }
    return () => clearInterval(timer.current);
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const selectRoom = (room) => setSelectedRoom(room);
  const closeRoom = () => setSelectedRoom(null);

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-800 py-16 sm:py-24 px-4 sm:px-6 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-4 sm:right-10 w-60 h-60 sm:w-80 sm:h-80 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-10 left-4 sm:left-10 w-72 h-72 sm:w-96 sm:h-96 bg-orange-400/5 rounded-full blur-3xl -z-10"></div>
      
      {/* Heading */}
      <div className="text-center mb-12 sm:mb-16 max-w-3xl mx-auto">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-gray-900">
          Library <span className="text-blue-600">Facilities</span>
        </h2>
        <div className="w-24 sm:w-32 h-1.5 bg-gradient-to-r from-blue-600 via-green-500 to-purple-600 mx-auto rounded-full mb-4 sm:mb-6"></div>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Explore our 5 floors of thoughtfully designed spaces for learning, collaboration, and research
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Floor Navigation */}
        <div className="flex justify-center mb-8 sm:mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 sm:p-4 shadow-lg border border-gray-200">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
              {floors.map((floor, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFloor(index)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 ${
                    currentFloor === index
                      ? `${floor.color} text-white shadow-lg transform scale-105`
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{floor.icon}</span>
                    <span className="text-sm sm:text-base">{floor.level}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {/* Floor Overview */}
          <div className="lg:col-span-2">
            <div 
              className={`${floors[currentFloor].color} rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 h-64 sm:h-80 lg:h-96 relative group`}
            >
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="text-center text-white p-6 sm:p-8">
                  <div className="text-6xl sm:text-8xl mb-4 opacity-90">
                    {floors[currentFloor].icon}
                  </div>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                    {floors[currentFloor].level}
                  </h3>
                  <p className="text-lg sm:text-xl opacity-90">
                    {floors[currentFloor].title}
                  </p>
                </div>
              </div>
              
              {/* Navigation Controls */}
              <button
                onClick={prevFloor}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 sm:p-4 text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextFloor}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 sm:p-4 text-white transition-all duration-300 opacity-0 group-hover:opacity-100"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Floor Details */}
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                Floor Details
              </h3>
              <button
                onClick={togglePlay}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                {isPlaying ? "⏸️" : "▶️"}
              </button>
            </div>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              {floors[currentFloor].description}
            </p>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 text-lg">Available Rooms:</h4>
              {floors[currentFloor].rooms.map((room, index) => (
                <button
                  key={index}
                  onClick={() => selectRoom(room)}
                  className="w-full text-left p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 border border-gray-200 hover:border-gray-300"
                >
                  <div className="font-medium text-gray-900 mb-1">{room.label}</div>
                  <div className="text-sm text-gray-600">{room.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Floor Indicator */}
        <div className="flex justify-center items-center space-x-4 mb-8">
          {floors.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentFloor(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentFloor === index 
                  ? "bg-blue-600 w-8" 
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Room Detail Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">{selectedRoom.label}</h3>
              <button
                onClick={closeRoom}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {selectedRoom.description}
            </p>
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-48 rounded-2xl mb-6 flex items-center justify-center">
              <span className="text-white text-4xl">📸</span>
            </div>
            <button
              onClick={closeRoom}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default Body3;