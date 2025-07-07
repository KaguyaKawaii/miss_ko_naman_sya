import Picture from '../assets/picture2.jpg';
import Logo from '../assets/logo2.png';
import Logo2 from '../assets/logo.png';
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 z-0"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        {/* Logo and Title Container */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex flex-wrap justify-center items-center space-x-4 mb-6">
            <img 
            src={Logo2} 
            alt="USA-FLD CircuLink Logo" 
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mb-6 drop-shadow-lg"
          />
          <img 
            src={Logo} 
            alt="USA-FLD CircuLink Logo" 
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mb-6 drop-shadow-lg"
          />
          
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-bold leading-tight mb-2">
              <span className="text-[#FFCC00]">USA-FLD</span>{' '}
              <span className="text-white">CircuLink</span>
            </h1>
            
            <div className="w-full rounded-full h-1 bg-[#FFCC00] mx-auto mb-4"></div>
            
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-light max-w-2xl mx-auto leading-snug">
              Modern Web-Based Library Room Reservation System
            </p>
          </div>
        </div>

        {/* CTA Button */}
        
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