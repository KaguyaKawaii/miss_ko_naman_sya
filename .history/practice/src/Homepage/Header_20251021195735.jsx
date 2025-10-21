// Header.jsx
import { useState, useEffect } from "react";
import { Menu, X, AlertTriangle } from "lucide-react";
import Logo from "../assets/logo.png";
import api from "../utils/api";

function Header({ onLoginClick, onSignUpClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
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

  const openMenu = () => {
    setIsOpen(true);
    setIsAnimating(true);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeMenu = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsOpen(false);
      document.body.style.overflow = 'unset'; // Re-enable scrolling
    }, 300);
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    closeMenu();
  };

  const handleLoginClick = () => {
    closeMenu();
    onLoginClick();
  };

  const handleSignUpClick = () => {
    closeMenu();
    onSignUpClick();
  };

  const navigationItems = [
    { id: "about-section", label: "About" },
    { id: "facilities-section", label: "Facilities" },
    { id: "faq-section", label: "FAQ" }
  ];

  return (
    <>
      {/* Main Header */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-[#171717] shadow-2xl' 
          : 'bg-transparent shadow-lg'
      }`}>
        <nav className="w-full max-w-8xl mx-auto flex items-center justify-between px-4 sm:px-7 py-4">
          {/* Logo + Title - Horizontal Layout */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative flex items-center">
              <div className="absolute -inset-3 bg-white/10 rounded-full transform scale-0 transition-transform duration-300 group-hover:scale-100"></div>
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

          {/* Desktop Navigation & Buttons */}
          <div className="hidden md:flex items-center gap-8">
            {/* Desktop Navigation */}
            <div className="flex items-center gap-6">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-white/80 hover:text-white text-sm font-medium transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Desktop Buttons */}
            <div className="flex gap-3">
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
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={openMenu}
              className="text-white focus:outline-none hover:text-gray-200 p-2 transition-all duration-300"
              title="Toggle menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </nav>

        {/* Full Screen Mobile Menu with Slide Animation */}
        {isOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            {/* Overlay Background */}
            <div 
              className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                isAnimating ? 'opacity-70' : 'opacity-0'
              }`}
              onClick={closeMenu}
            />
            
            {/* Slide Panel */}
            <div 
              className={`absolute top-0 right-0 h-full w-4/5 max-w-sm bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl transition-transform duration-300 ${
                isAnimating ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              {/* Close Button */}
              <div className="absolute top-4 right-4 z-60">
                <button
                  onClick={closeMenu}
                  className="text-white p-3 hover:bg-white/10 rounded-xl transition-all duration-300"
                  title="Close menu"
                >
                  <X size={28} />
                </button>
              </div>

              {/* Menu Content */}
              <div className="flex flex-col h-full px-6 py-8">
                {/* Logo Section */}
                <div className="flex items-center gap-3 mb-12 pt-8">
                  <img
                    className="w-12 h-12"
                    src={Logo}
                    alt="University of San Agustin Logo"
                  />
                  <div>
                    <h2 className="text-white font-semibold text-lg">University of San Agustin</h2>
                    <p className="text-amber-400 text-sm">CircuLink</p>
                  </div>
                </div>

                {/* Navigation Items */}
                <div className="flex flex-col space-y-6 mb-8">
                  {navigationItems.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className="text-left text-xl font-semibold text-white hover:text-amber-400 transition-all duration-300 transform hover:translate-x-2 cursor-pointer py-3 border-b border-white/10"
                      style={{
                        animationDelay: `${index * 100}ms`
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Buttons Section */}
                <div className="mt-auto space-y-4 pb-8">
                  <button
                    onClick={handleLoginClick}
                    className="w-full text-center group relative text-base font-semibold px-6 py-4 rounded-xl border transition-all duration-300
                               shadow-lg overflow-hidden cursor-pointer
                               text-white border-white/40 hover:bg-white/15 hover:border-white/80 hover:shadow-xl"
                  >
                    <span className="relative z-10">Login</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  </button>
                  
                  <button
                    onClick={handleSignUpClick}
                    className="w-full text-center group relative text-base font-semibold px-6 py-4 rounded-xl border transition-all duration-300 transform
                               shadow-lg overflow-hidden cursor-pointer
                               text-[#CC0000] bg-white border-white hover:bg-gray-50 hover:shadow-xl"
                  >
                    <span className="relative z-10">Sign Up</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  </button>
                </div>

                {/* Footer Text */}
                <div className="text-center pt-4 border-t border-white/10">
                  <p className="text-white/60 text-sm">
                    Modern Library Reservation System
                  </p>
                </div>
              </div>

              {/* Background Pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)] -z-10"></div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

export default Header;