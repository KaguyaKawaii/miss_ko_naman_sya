import { ChevronDown } from 'lucide-react';

function Body2() {
  return (
    <section className="relative bg-gradient-to-b from-white via-[#fefefe] to-[#f8f8f8] min-h-screen text-gray-800 py-20 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-20">

        {/* About */}
        <div>
          <h2 className="text-4xl font-bold text-[#CC0000] mb-3">About</h2>
          <div className="h-[3px] w-20 bg-[#CC0000] mb-6"></div>
          <p className="text-lg leading-relaxed text-gray-700">
            <span className="font-semibold text-gray-900">CircuLink</span> is a web-based library room reservation system developed exclusively for <span className="font-semibold text-gray-900">USA-FLD</span>.
            Our platform aims to simplify and modernize the process of reserving library study rooms,
            offering a seamless, organized, and efficient experience for students, faculty, and staff.
          </p>
        </div>

        {/* Objective */}
        <div>
          <h2 className="text-4xl font-bold text-[#CC0000] mb-3">Objective</h2>
          <div className="h-[3px] w-20 bg-[#CC0000] mb-6"></div>
          <p className="text-lg leading-relaxed text-gray-700">
            The primary goal of <span className="font-semibold text-gray-900">CircuLink</span> is to provide a centralized and accessible platform for managing
            room reservations within the FLD Library. By moving away from manual and paper-based booking
            methods, we strive to enhance convenience, improve room availability management, and ensure
            that everyone can easily secure study and research spaces when needed.
          </p>
        </div>

        {/* Vision & Mission */}
        <div className="flex flex-col lg:flex-row justify-between items-stretch gap-8 pt-6">
          {/* Vision */}
          <div className="flex-1 bg-white border border-gray-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300">
            <h2 className="text-3xl font-bold text-[#CC0000] mb-3 text-center">Vision</h2>
            <div className="h-[3px] w-16 bg-[#CC0000] mx-auto mb-5"></div>
            <p className="text-base text-gray-700 leading-relaxed text-center">
              An information resource center serving as a gateway of knowledge for the attainment of wisdom
              towards the formation of an Augustinian.
            </p>
          </div>

          {/* Mission */}
          <div className="flex-1 bg-white border border-gray-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition duration-300">
            <h2 className="text-3xl font-bold text-[#CC0000] mb-3 text-center">Mission</h2>
            <div className="h-[3px] w-16 bg-[#CC0000] mx-auto mb-5"></div>
            <p className="text-base text-gray-700 leading-relaxed text-center">
              The Learning Resource Center is committed to support the Augustinian education by providing
              instructional materials and facilities for teaching-learning processes, research initiatives,
              and recent innovations to meet client satisfaction in the promotion of life-long learning.
            </p>
          </div>
        </div>
      </div>

      {/* Down Arrow with Bounce */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center">
        <ChevronDown
          size={48}
          className="text-[#CC0000] animate-bounce cursor-pointer hover:scale-110 transition"
          onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
        />
      </div>
    </section>
  );
}

export default Body2;
