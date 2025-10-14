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
      { label: "New Arrivals Display", description: "Recently added books and materials" },
      { label: "Self-Checkout Stations", description: "Quick and easy book borrowing" },
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
      { label: "Project Room C", description: "Dedicated space for long-term projects" },
      { label: "Team Meeting Space", description: "Equipped with presentation tools" },
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
      { label: "Graduate Study Area", description: "Dedicated space for graduate students" },
      { label: "Individual Study Pods", description: "Sound-proof private study spaces" },
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
      { label: "3D Printing Lab", description: "Advanced manufacturing technology" },
      { label: "VR Experience Zone", description: "Virtual reality learning environment" },
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
      { label: "Rare Books Collection", description: "Special access historical materials" },
      { label: "Faculty Research Area", description: "Private research spaces for faculty" },
    ]
  }
];

function Body3() {
  const [currentFloor, setCurrentFloor] = useState(0);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const floorRefs = useRef([]);

  // Handle wheel scroll for floor navigation
  useEffect(() => {
    const handleWheel = (e) => {
      if (isScrolling) return;
      
      setIsScrolling(true);
      
      if (e.deltaY > 0) {
        // Scroll down - next floor
        setCurrentFloor(prev => Math.min(prev + 1, floors.length - 1));
      } else {
        // Scroll up - previous floor
        setCurrentFloor(prev => Math.max(prev - 1, 0));
      }
      
      setTimeout(() => setIsScrolling(false), 1000);
    };

    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isScrolling]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        setCurrentFloor(prev => Math.min(prev + 1, floors.length - 1));
      } else if (e.key === 'ArrowUp') {
        setCurrentFloor(prev => Math.max(prev - 1, 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectRoom = (room) => setSelectedRoom(room);
  const closeRoom = () => setSelectedRoom(null);

  // Scroll to current floor
  useEffect(() => {
    if (floorRefs.current[currentFloor]) {
      floorRefs.current[currentFloor].scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [currentFloor]);

  return (
    <div className="relative">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Library <span className="text-blue-600">Facilities</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Scroll to explore our 5 floors of learning spaces
            </p>
          </div>
          
          {/* Floor Progress */}
          <div className="flex justify-center items-center space-x-4 mt-4">
            {floors.map((floor, index) => (
              <button
                key={index}
                onClick={() => setCurrentFloor(index)}
                className={`flex flex-col items-center transition-all duration-300 ${
                  currentFloor === index ? 'scale-110' : 'scale-100 opacity-60 hover:opacity-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                  currentFloor === index ? floor.color : 'bg-gray-400'
                }`}>
                  {index + 1}
                </div>
                <span className="text-xs mt-1 font-medium text-gray-700">
                  {floor.level.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floor Sections - Full Screen */}
      <div className="h-screen overflow-hidden">
        {floors.map((floor, index) => (
          <section
            key={index}
            ref={el => floorRefs.current[index] = el}
            className={`h-screen w-full flex items-center justify-center transition-all duration-1000 ${
              floor.color
            } ${currentFloor === index ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Floor Info */}
                <div className="text-white text-center lg:text-left">
                  <div className="text-8xl mb-6 opacity-20 absolute top-1/2 left-10 transform -translate-y-1/2 -translate-x-10">
                    {floor.icon}
                  </div>
                  
                  <div className="relative z-10">
                    <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                      <span className="text-sm font-semibold">{floor.level}</span>
                    </div>
                    
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
                      {floor.title}
                    </h2>
                    
                    <p className="text-xl sm:text-2xl opacity-90 mb-8 max-w-2xl">
                      {floor.description}
                    </p>
                    
                    <div className="flex items-center gap-4 justify-center lg:justify-start">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                        <span className="text-sm">
                          {floor.rooms.length} rooms available
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rooms Grid */}
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-white/20">
                  <h3 className="text-2xl font-bold text-white mb-6 text-center">
                    Available Rooms
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent pr-2">
                    {floor.rooms.map((room, roomIndex) => (
                      <button
                        key={roomIndex}
                        onClick={() => selectRoom(room)}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl p-4 text-left transition-all duration-300 border border-white/10 hover:border-white/30 group"
                      >
                        <div className="text-white">
                          <div className="font-semibold text-lg mb-2 group-hover:text-blue-100 transition-colors">
                            {room.label}
                          </div>
                          <div className="text-sm opacity-80 leading-relaxed">
                            {room.description}
                          </div>
                        </div>
                        
                        <div className="mt-3 flex justify-between items-center">
                          <div className="text-xs text-white/60">
                            Click to view details
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="text-center mt-4">
                    <div className="text-white/60 text-sm animate-pulse">
                      Scroll to see more rooms ↓
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Hints */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center">
              <div className="flex flex-col items-center space-y-2">
                <div className="text-sm opacity-70">
                  {index > 0 && (
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      <span>Scroll up for previous floor</span>
                    </div>
                  )}
                  {index < floors.length - 1 && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      <span>Scroll down for next floor</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Room Detail Modal */}
      {selectedRoom && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={closeRoom}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-sm text-gray-500 mb-2">
                  {floors[currentFloor].level}
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {selectedRoom.label}
                </h3>
              </div>
              <button
                onClick={closeRoom}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className={`${floors[currentFloor].color} h-64 rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden`}>
              <div className="text-white text-8xl opacity-20 absolute">
                {floors[currentFloor].icon}
              </div>
              <div className="text-white text-center relative z-10">
                <div className="text-6xl mb-4">{floors[currentFloor].icon}</div>
                <div className="text-xl font-semibold">{selectedRoom.label}</div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {selectedRoom.description}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-500 mb-1">Floor</div>
                  <div className="font-semibold text-gray-900">{floors[currentFloor].level}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm text-gray-500 mb-1">Area Type</div>
                  <div className="font-semibold text-gray-900">{floors[currentFloor].title}</div>
                </div>
              </div>
            </div>
            
            <button
              onClick={closeRoom}
              className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* Scroll Progress */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
        <div className="flex flex-col items-center space-y-2">
          {floors.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentFloor(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentFloor === index 
                  ? 'bg-white border-2 border-white scale-150' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Body3;