import { ChevronDown, Target, Eye, BookOpen } from 'lucide-react';

function Body2() {
  return (
    <section className="relative bg-gradient-to-br from-white via-[#fefefe] to-[#f5f5f5] min-h-screen text-gray-800 py-20 px-6 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#CC0000]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-400/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
      
      <div className="max-w-6xl mx-auto space-y-24 relative z-10">
        {/* About */}
        <div className="transform transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-center mb-6">
            
            <h2 className="text-4xl md:text-5xl font-bold text-[#CC0000]">About</h2>
          </div>
          <div className="pl-8 border-l-4 border-[#CC0000]/30">
            <p className="text-xl leading-relaxed text-gray-700 max-w-4xl">
              <span className="font-semibold text-gray-900 bg-amber-100 px-1 rounded">CircuLink</span> is a web-based library room reservation system developed exclusively for <span className="font-semibold text-gray-900 bg-amber-100 px-1 rounded">USA-FLD</span>.
              Our platform aims to simplify and modernize the process of reserving library study rooms,
              offering a seamless, organized, and efficient experience for students, faculty, and staff.
            </p>
          </div>
        </div>

        {/* Objective */}
        <div className="transform transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-center mb-6">
            <h2 className="text-4xl md:text-5xl font-bold text-[#CC0000]">Objective</h2>
          </div>
          <div className="pl-8 border-l-4 border-[#CC0000]/30">
            <p className="text-xl leading-relaxed text-gray-700 max-w-4xl">
              The primary goal of <span className="font-semibold text-gray-900">CircuLink</span> is to provide a centralized and accessible platform for managing
              room reservations within the FLD Library. By moving away from manual and paper-based booking
              methods, we strive to enhance convenience, improve room availability management, and ensure
              that everyone can easily secure study and research spaces when needed.
            </p>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-10">
          {/* Vision */}
          <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
            <div className="absolute -top-4 left-6 bg-[#CC0000] p-3 rounded-full shadow-lg">
              <Eye className="text-white" size={24} />
            </div>
            <h2 className="text-3xl font-bold text-[#CC0000] mb-5 mt-2">Vision</h2>
            <div className="h-1 w-16 bg-gradient-to-r from-[#CC0000] to-amber-400 mb-6 rounded-full"></div>
            <p className="text-lg text-gray-700 leading-relaxed">
              An information resource center serving as a gateway of knowledge for the attainment of wisdom
              towards the formation of an Augustinian.
            </p>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#CC0000]/20 to-transparent group-hover:via-[#CC0000]/40 transition-all duration-500"></div>
          </div>

          {/* Mission */}
          <div className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
            <div className="absolute -top-4 left-6 bg-amber-500 p-3 rounded-full shadow-lg">
              <BookOpen className="text-white" size={24} />
            </div>
            <h2 className="text-3xl font-bold text-[#CC0000] mb-5 mt-2">Mission</h2>
            <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-[#CC0000] mb-6 rounded-full"></div>
            <p className="text-lg text-gray-700 leading-relaxed">
              The Learning Resource Center is committed to support the Augustinian education by providing
              instructional materials and facilities for teaching-learning processes, research initiatives,
              and recent innovations to meet client satisfaction in the promotion of life-long learning.
            </p>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent group-hover:via-amber-400/40 transition-all duration-500"></div>
          </div>
        </div>
      </div>

     
    </section>
  );
}

export default Body2;