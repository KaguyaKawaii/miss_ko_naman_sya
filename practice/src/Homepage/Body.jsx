import Picture from '../assets/picture2.jpg';
import Logo2 from '../assets/logo.png';
import lrc from '../assets/logo2.png';
import { ChevronDown, ArrowRight } from 'lucide-react';

function Body() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background with Enhanced Parallax Effect */}
      <div 
        className="absolute inset-0 bg-no-repeat bg-cover bg-center w-full h-full transition-all duration-1000 ease-out"
        style={{ 
          backgroundImage: `url(${Picture})`,
          transform: 'scale(1.1)'
        }}
      >
        {/* Multi-layered Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-0"></div>

        
        {/* Subtle animated particles */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white animate-pulse"
              style={{
                width: `${Math.random() * 10 + 2}px`,
                height: `${Math.random() * 10 + 2}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${Math.random() * 3 + 2}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-screen flex flex-col items-center justify-center text-center px-4">
        {/* Logo and Title Container */}
        <div className="flex flex-col items-center mb-8 transform transition-all duration-700">
          <div className="flex flex-wrap justify-center items-center space-x-6 mb-8">
            <div className="relative group">
              <div className="absolute -inset-3 bg-amber-400/20 rounded-full blur-md group-hover:bg-amber-400/30 transition-all duration-500"></div>
              <img 
                src={Logo2} 
                alt="University of San Agustin Logo" 
                className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 drop-shadow-lg transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            
            <div className="hidden md:block">
              <div className="h-32 w-px bg-gradient-to-b from-transparent via-white/50 to-transparent mx-2"></div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-3 bg-amber-400/20 rounded-full blur-md group-hover:bg-amber-400/30 transition-all duration-500"></div>
              <img 
                src={lrc} 
                alt="Learning Resource Center Logo" 
                className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 drop-shadow-lg transform group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-bold leading-tight mb-2 animate-fade-in">
              <span className="text-amber-400 drop-shadow-md">USA-FLD</span>{' '}
              <span className="text-white drop-shadow-md">CircuLink</span>
            </h1>
            
            <div className="w-64 h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-4 rounded-full"></div>
            
            <p className="text-xl sm:text-2xl md:text-3xl text-white/90 font-normal max-w-3xl mx-auto leading-snug  py-2 px-6 rounded-full">
              Modern Web-Based Library Room Reservation System
            </p>
          </div>
        </div>

      
      </div>

      {/* Down Arrow */}
      <div className="absolute bottom-10 left-0 right-0 z-10 flex justify-center">
        <button 
          onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
          className="p-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-amber-400/20 hover:border-amber-400/40 transition-all duration-300 group animate-bounce"
          aria-label="Scroll down"
        >
          <ChevronDown
            size={40}
            className="text-white group-hover:text-amber-300 transition-colors duration-300 cursor-pointer"
          />
        </button>
      </div>
    </main>
  );
}

export default Body;