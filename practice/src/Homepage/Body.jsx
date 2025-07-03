import Picture from '../assets/picture2.jpg';
import { ChevronDown } from 'lucide-react';

function Body() {
  return (
    <main className="relative h-screen overflow-hidden">
      {/* Background with Parallax Effect */}
      <div 
        className="absolute inset-0 bg-no-repeat bg-cover bg-center w-full h-full transition-transform duration-700 ease-out"
        style={{ 
          backgroundImage: `url(${Picture})`,
          transform: 'scale(1.05)' // Slight zoom for depth
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-black/30 z-0"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-bold leading-tight">
            <span className="text-[#FFCC00] bg-clip-text bg-gradient-to-r from-[#FFCC00] to-amber-300">USA-FLD</span>{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">CircuLink</span>
          </h1>

          

          <p className="text-xl sm:text-2xl md:text-3xl text-white/90 font-light max-w-2xl mx-auto leading-snug">
            Modern Web-Based Library Room Reservation System
          </p>

          {/* CTA Button */}
          <button 
            className="mt-8 px-8 py-3 bg-gradient-to-r from-[#FFCC00] to-amber-500 text-gray-900 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-50"
            onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
          >
            Explore System
          </button>
        </div>
      </div>

      {/* Down Arrow */}
      <div className="absolute bottom-10 left-0 right-0 z-10 flex justify-center animate-float">
        <button 
          onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
          className="p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 group"
          aria-label="Scroll down"
        >
          <ChevronDown
            size={40}
            className="text-white group-hover:text-amber-300 transition-colors duration-300"
          />
        </button>
      </div>

      
    </main>
  );
}

export default Body;