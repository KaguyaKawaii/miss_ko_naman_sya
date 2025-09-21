import Logo from '../assets/logo.png';

function Header({ onLoginClick, onSignUpClick }) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-[#CC0000] to-[#B30000] shadow-lg ">
      <nav className="w-full max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <div className="absolute -inset-3 bg-white/10 rounded-full transform scale-0 transition-transform duration-300 group-hover:scale-100"></div>
            <img 
              className="w-12 h-12 relative z-10 transition-transform duration-300 hover:scale-110"
              src={Logo} 
              alt="University of San Agustin Logo" 
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-serif font-semibold text-white tracking-wide leading-tight">
              University of San Agustin
            </h1>
            
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onLoginClick}
            className="group relative text-sm md:text-base font-medium text-white px-5 py-2.5 rounded-lg border border-white/40 
                       hover:bg-white/15 hover:border-white/80 transition-all duration-300
                       shadow-sm hover:shadow-md overflow-hidden cursor-pointer"
          >
            <span className="relative z-10">Login</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
          <button
            onClick={onSignUpClick}
            className="group relative text-sm md:text-base font-medium text-[#CC0000] bg-white px-5 py-2.5 rounded-lg border border-white 
                       hover:bg-gray-50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5
                       shadow-md overflow-hidden cursor-pointer"
          >
            <span className="relative z-10">Sign Up</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
        </div>
      </nav>
      
      {/* Subtle decorative element */}
      
    </header>
  );
}

export default Header;