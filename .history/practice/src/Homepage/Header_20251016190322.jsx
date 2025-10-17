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

  // If maintenance mode is active, don't render the header at all
  if (maintenanceMode) {
    return null;
  }

  return (
    <>
      {/* Main Header - Only shown when NOT in maintenance mode */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-gray-900/95 shadow-2xl' 
          : 'bg-transparent shadow-lg'
      }`}>
        <nav className="w-full max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          {/* Logo + Title - Horizontal Layout */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative flex items-center">
              <div className="absolute -inset-3 bg-[#171717] rounded-full transform scale-0 transition-transform duration-300 group-hover:scale-100"></div>
              <img
                className="w-10 h-10 sm:w-12 sm:h-12 relative z-10 transition-transform duration-300 hover:scale-110"
                src={Logo}
                alt="University of San Agustin Logo"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <h1 className="text-lg sm:text-xl md:text-2xl font-serif font-semibold text-white tracking-wide leading-tight">
                University of San Agustin
              </h1>
              <span className="hidden sm:block text-white/80 text-sm">|</span>
              <span className="text-amber-300 text-sm sm:text-base font-medium">CircuLink</span>
            </div>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex gap-3">
            <button
              onClick={onLoginClick}
              className="group relative text-sm md:text-base font-medium px-5 py-2.5 rounded-lg border transition-all duration-300
                         shadow-sm overflow-hidden cursor-pointer
                         text-white border-white/40 hover:bg-white/15 hover:border-white/80 hover:shadow-md"
              title="Login to your account"
            >
              <span className="relative z-10">Login</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
            <button
              onClick={onSignUpClick}
              className="group relative text-sm md:text-base font-medium px-5 py-2.5 rounded-lg border transition-all duration-300 transform
                         shadow-md overflow-hidden cursor-pointer
                         text-[#CC0000] bg-white border-white hover:bg-gray-50 hover:shadow-lg hover:-translate-y-0.5"
              title="Create new account"
            >
              <span className="relative z-10">Sign Up</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none hover:text-gray-200 p-2"
              title="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="md:hidden bg-gray-900/95 border-t border-white/20 shadow-lg px-6 py-4 flex flex-col gap-3">
            <button
              onClick={() => {
                onLoginClick();
                setIsOpen(false);
              }}
              className="w-full text-center group relative text-base font-medium px-5 py-2.5 rounded-lg border transition-all duration-300 text-white border-white/40 hover:bg-white/15 hover:border-white/80"
            >
              Login
            </button>
            <button
              onClick={() => {
                onSignUpClick();
                setIsOpen(false);
              }}
              className="w-full text-center group relative text-base font-medium px-5 py-2.5 rounded-lg border transition-all duration-300 text-[#CC0000] bg-white border-white hover:bg-gray-50 hover:shadow-lg"
            >
              Sign Up
            </button>
          </div>
        )}
      </header>
    </>
  );
}

export default Header;