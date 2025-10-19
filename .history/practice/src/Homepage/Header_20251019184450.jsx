// Header.jsx
import { useState, useEffect } from "react";
import { Menu, X, AlertTriangle } from "lucide-react";
import Logo from "../assets/logo.png";
import api from "../utils/api";

function Header({ onLoginClick, onSignUpClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    checkMaintenanceMode();
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > window.innerHeight * 0.8);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const checkMaintenanceMode = async () => {
    try {
      const response = await api.get('/system/maintenance-status');
      if (response.data.success) {
        setMaintenanceMode(response.data.maintenanceMode);
        setMaintenanceMessage(response.data.maintenanceMessage || "");
      }
    } catch (error) {
      console.error('Error checking maintenance mode:', error);
    }
  };

  return (
    <>
      {/* Maintenance Mode Banner */}
      {maintenanceMode && (
        <div className="fixed top-0 left-0 w-full bg-amber-500 text-gray-900 py-2 px-4 z-50 flex items-center justify-center gap-2 text-sm font-medium">
          <AlertTriangle size={16} />
          <span>{maintenanceMessage || "System under maintenance"}</span>
        </div>
      )}

      {/* Main Header */}
      <header className={`fixed top-0 left-0 w-full z-40 transition-all duration-500 ${
        isScrolled 
          ? 'bg-[#171717] shadow-2xl' 
          : 'bg-transparent shadow-lg'
      } ${maintenanceMode ? 'mt-8' : ''}`}>
        <nav className="w-full max-w-7xl mx-auto flex items-center justify-between px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3">
          {/* Logo + Title */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
            {/* Logo Container */}
            <div className="relative flex items-center flex-shrink-0">
              <div className="absolute -inset-2 sm:-inset-3 bg-white/10 rounded-full transform scale-0 transition-transform duration-300 group-hover:scale-100"></div>
              <img
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 relative z-10 transition-transform duration-300 hover:scale-110 flex-shrink-0"
                src={Logo}
                alt="University of San Agustin Logo"
              />
            </div>
            
            {/* Title Container */}
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <h1 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-serif font-semibold text-white tracking-wide leading-tight truncate">
                  University of San Agustin
                </h1>
                <span className="hidden xs:inline-block text-white/80 text-xs sm:text-sm mx-1">|</span>
                <span className="text-amber-300 text-xs xs:text-sm sm:text-base font-medium whitespace-nowrap">
                  CircuLink
                </span>
              </div>
              
              {/* Optional subtitle for extra small screens */}
              <span className="xs:hidden text-amber-300 text-xs font-medium mt-0.5">
                CircuLink
              </span>
            </div>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex gap-2 lg:gap-3 flex-shrink-0">
            <button
              onClick={onLoginClick}
              className="group relative text-sm lg:text-base font-medium px-4 lg:px-5 py-2 lg:py-2.5 rounded-lg border transition-all duration-300
                         shadow-sm overflow-hidden cursor-pointer
                         text-white border-white/40 hover:bg-white/15 hover:border-white/80 hover:shadow-md whitespace-nowrap"
              title="Login to your account"
            >
              <span className="relative z-10">Login</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
            <button
              onClick={onSignUpClick}
              className="group relative text-sm lg:text-base font-medium px-4 lg:px-5 py-2 lg:py-2.5 rounded-lg border transition-all duration-300 transform
                         shadow-md overflow-hidden cursor-pointer
                         text-[#CC0000] bg-white border-white hover:bg-gray-50 hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap"
              title="Create new account"
            >
              <span className="relative z-10">Sign Up</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          </div>

          {/* Tablet Buttons (smaller version) */}
          <div className="hidden sm:flex md:hidden gap-2 flex-shrink-0">
            <button
              onClick={onLoginClick}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-300
                         text-white border-white/40 hover:bg-white/15 hover:border-white/80 whitespace-nowrap"
              title="Login to your account"
            >
              Login
            </button>
            <button
              onClick={onSignUpClick}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-all duration-300
                         text-[#CC0000] bg-white border-white hover:bg-gray-50 whitespace-nowrap"
              title="Create new account"
            >
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex-shrink-0">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none hover:text-gray-200 p-1.5"
              title="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="sm:hidden bg-gray-900/95 border-t border-white/20 shadow-lg px-4 py-3 flex flex-col gap-2">
            <button
              onClick={() => {
                onLoginClick();
                setIsOpen(false);
              }}
              className="w-full text-center group relative text-sm font-medium px-4 py-2.5 rounded-lg border transition-all duration-300 text-white border-white/40 hover:bg-white/15 hover:border-white/80"
            >
              Login
            </button>
            <button
              onClick={() => {
                onSignUpClick();
                setIsOpen(false);
              }}
              className="w-full text-center group relative text-sm font-medium px-4 py-2.5 rounded-lg border transition-all duration-300 text-[#CC0000] bg-white border-white hover:bg-gray-50 hover:shadow-lg"
            >
              Sign Up
            </button>
          </div>
        )}
      </header>

      {/* Add padding to prevent content from being hidden behind fixed header */}
      <div className={`h-16 sm:h-20 ${maintenanceMode ? 'mt-8' : ''}`}></div>
    </>
  );
}

export default Header;