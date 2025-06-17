import Picture from '../assets/picture2.jpg';
import { ChevronDown } from 'lucide-react'; // install lucide-react if you haven’t: npm install lucide-react

function Body() {
  return (
    <main
      className="relative h-screen bg-no-repeat bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${Picture})` }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black opacity-50 z-0"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-5 text-center px-4">
        <h1 className="text-7xl text-white font-semibold font-serif">
          <span className="text-[#FFCC00]">USA-FLD</span> <span>CircuLink</span>
        </h1>

        <p className="text-4xl text-white font-normal">
          A Web-based Library Room Reservation System
        </p>
      </div>

      {/* Down Arrow with Bounce */}
      <div className="absolute bottom-10 z-10 flex justify-center w-full">
        <ChevronDown
          size={48}
          className="text-white animate-bounce cursor-pointer"
          onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
        />
      </div>
    </main>
  );
}

export default Body;
