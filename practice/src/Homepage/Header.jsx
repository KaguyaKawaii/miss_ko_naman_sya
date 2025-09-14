import Logo from '../assets/logo.png';

function Header({ onLoginClick, onSignUpClick }) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-[#CC0000] to-[#B30000] shadow-lg">
      <nav className="w-full max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              className="w-12 h-12"
              src={Logo} 
              alt="University of San Agustin Logo" 
            />
            
          </div>
          <h1 className="text-xl md:text-2xl font-serif font-semibold text-white tracking-wide">
  University of San Agustin
</h1>

        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onLoginClick}
            className="text-sm md:text-base font-medium text-white px-4 py-2 rounded-lg border border-white/60 
                       hover:bg-white/10 hover:border-white backdrop-blur-sm transition-all duration-300
                       shadow-sm hover:shadow-md cursor-pointer"
          >
            Login
          </button>
          <button
            onClick={onSignUpClick}
            className="text-sm md:text-base font-medium text-[#CC0000] bg-white px-4 py-2 rounded-lg border border-white 
                       hover:bg-gray-50 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5
                       shadow-md cursor-pointer"
          >
            Sign Up
          </button>
        </div>
      </nav>
      
      {/* Subtle decorative element */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF3333] to-[#B30000]"></div>
    </header>
  );
}

export default Header;