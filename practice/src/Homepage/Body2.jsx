import { ChevronDown } from 'lucide-react';

function Body2() {
  return (
    <section className="relative bg-white h-screen text-gray-800 py-16 px-8 overflow-hidden">
      <div className="max-w-6xl mx-auto space-y-14">

        {/* About */}
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold border-[#CC0000] inline-block mb-4">About</h2>
          <div className="border-b border-[#CC0000] mb-5"></div>
          <p className="text-lg">
            CircuLink is a web-based library room reservation system developed exclusively for USA-FLD.
            Our platform aims to simplify and modernize the process of reserving library study rooms,
            offering a seamless, organized, and efficient experience for students, faculty, and staff.
          </p>
        </div>

        {/* Objective */}
        <div>
          <h2 className="text-3xl font-bold border-[#CC0000] inline-block mb-4">Objective</h2>
          <div className="border-b border-[#CC0000] mb-5"></div>
          <p className="text-lg">
            The primary goal of CircuLink is to provide a centralized and accessible platform for managing
            room reservations within the FLD Library. By moving away from manual and paper-based booking
            methods, we strive to enhance convenience, improve room availability management, and ensure
            that everyone can easily secure study and research spaces when needed.
          </p>
        </div>

        {/* Vision & Mission */}
        <div className="flex flex-wrap justify-between items-center gap-5">
          <div className="w-[550px] h-[250px] text-center border p-5 rounded-2xl shadow-lg border-gray-100">
            <h2 className="text-3xl font-bold border-[#CC0000] inline-block mb-4">Vision</h2>
            <div className="border-b border-[#CC0000] mb-5"></div>
            <p>
              An information resource center serving as a gateway of knowledge for the attainment of wisdom
              towards the formation of an Augustinian.
            </p>
          </div>

          <div className="w-[550px] h-[250px] text-center border p-5 rounded-2xl shadow-lg border-gray-100">
            <h2 className="text-3xl font-bold border-[#CC0000] inline-block mb-4">Mission</h2>
            <div className="border-b border-[#CC0000] mb-5"></div>
            <p>
              The Learning Resource Center is committed to support the Augustinian education by providing
              instructional materials and facilities for teaching-learning processes, research initiatives,
              and recent innovations to meet client satisfaction in the promotion of life-long learning.
            </p>
          </div>
        </div>
      </div>

      {/* Down Arrow with Bounce */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <ChevronDown
          size={48}
          className="text-gray-800 animate-bounce cursor-pointer"
          onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
        />
      </div>
    </section>
  );
}

export default Body2;
