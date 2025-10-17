// Body2.jsx
import { useState } from "react";
import { BookOpen, Calendar, Phone, ArrowRight, ExternalLink, Eye, Target } from "lucide-react";

function Body2() {
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    {
      icon: BookOpen,
      title: "Getting Started",
      color: "from-[#CC0000] to-[#990000]",
      questions: [
        {
          question: "How do I create an account?",
          answer: "Simply click the Sign Up button and use your university email to register. Verification takes less than 5 minutes."
        },
        {
          question: "Who can use CircuLink?",
          answer: "All enrolled University of San Agustin students and faculty members with valid university credentials."
        }
      ]
    },
    {
      icon: Calendar,
      title: "Making a Reservation",
      color: "from-[#CC0000] to-[#990000]",
      questions: [
        {
          question: "How far in advance can I book?",
          answer: "Rooms can be reserved up to 7 days in advance. Each booking can be for a maximum of 4 hours."
        },
        {
          question: "Can I modify or cancel my booking?",
          answer: "Yes, you can modify or cancel your reservation up to 2 hours before your scheduled time through your dashboard."
        }
      ]
    },
    {
      icon: Phone,
      title: "Contact",
      color: "from-[#CC0000] to-[#990000]",
      questions: [
        {
          question: "Need immediate assistance?",
          answer: "Visit the Library Help Desk on the 1st floor or call +63 (33) 337-4841 Local 1414 during operating hours."
        },
        {
          question: "Technical support issues?",
          answer: "Email circuLink@usa.edu.ph for system-related problems. Include your student ID and a description of the issue."
        }
      ]
    }
  ];

  const scrollToAuth = () => {
    const authSection = document.getElementById('auth-section');
    if (authSection) {
      authSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-white via-[#fefefe] to-[#f5f5f5] min-h-screen text-gray-800 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-60 lg:h-60 bg-[#CC0000]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 sm:w-64 sm:h-64 lg:w-80 lg:h-80 bg-amber-400/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
      
      <div className="max-w-6xl mx-auto space-y-16 sm:space-y-20 lg:space-y-24 relative z-10">
        {/* Welcome Header Section */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-0.5 bg-[#CC0000] rounded-full"></div>
            <span className="text-xs font-semibold text-[#CC0000] uppercase tracking-wider">Welcome To</span>
            <div className="w-6 h-0.5 bg-[#CC0000] rounded-full"></div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-[#CC0000]">CircuLink</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Modern web-based library room reservation system designed to enhance your academic experience at University of San Agustin.
          </p>
          
          <div className="w-24 h-1 bg-gradient-to-r from-[#CC0000] to-amber-400 mx-auto rounded-full mb-8"></div>
        </div>

        {/* About Section */}
        <div className="transform transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-center mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#CC0000]">About</h2>
          </div>
          <div className="pl-4 sm:pl-6 lg:pl-8 border-l-4 border-[#CC0000]/30">
            <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-gray-700 max-w-4xl">
              <span className="font-semibold text-gray-900 bg-amber-100 px-1 rounded">CircuLink</span> is a web-based library room reservation system developed exclusively for <span className="font-semibold text-gray-900 bg-amber-100 px-1 rounded">USA-FLD</span>.
              Our platform aims to simplify and modernize the process of reserving library study rooms,
              offering a seamless, organized, and efficient experience for students, faculty, and staff.
            </p>
          </div>
        </div>

        {/* Objective Section */}
        <div className="transform transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-center mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#CC0000]">Objective</h2>
          </div>
          <div className="pl-4 sm:pl-6 lg:pl-8 border-l-4 border-[#CC0000]/30">
            <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-gray-700 max-w-4xl">
              The primary goal of <span className="font-semibold text-gray-900">CircuLink</span> is to provide a centralized and accessible platform for managing
              room reservations within the FLD Library. By moving away from manual and paper-based booking
              methods, we strive to enhance convenience, improve room availability management, and ensure
              that everyone can easily secure study and research spaces when needed.
            </p>
          </div>
        </div>

        {/* Vision & Mission Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 pt-8 sm:pt-10">
          {/* Vision */}
          <div className="group relative bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 lg:hover:-translate-y-2 border border-gray-100">
            <div className="absolute -top-3 sm:-top-4 left-4 sm:left-6 bg-[#CC0000] p-2 sm:p-3 rounded-full shadow-lg">
              <Eye className="text-white w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#CC0000] mb-4 sm:mb-5 mt-1 sm:mt-2">Vision</h2>
            <div className="h-1 w-12 sm:w-16 bg-gradient-to-r from-[#CC0000] to-amber-400 mb-4 sm:mb-6 rounded-full"></div>
            <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
              An information resource center serving as a gateway of knowledge for the attainment of wisdom
              towards the formation of an Augustinian.
            </p>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#CC0000]/20 to-transparent group-hover:via-[#CC0000]/40 transition-all duration-500"></div>
          </div>

          {/* Mission */}
          <div className="group relative bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 lg:hover:-translate-y-2 border border-gray-100">
            <div className="absolute -top-3 sm:-top-4 left-4 sm:left-6 bg-amber-500 p-2 sm:p-3 rounded-full shadow-lg">
              <Target className="text-white w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#CC0000] mb-4 sm:mb-5 mt-1 sm:mt-2">Mission</h2>
            <div className="h-1 w-12 sm:w-16 bg-gradient-to-r from-amber-400 to-[#CC0000] mb-4 sm:mb-6 rounded-full"></div>
            <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed">
              The Learning Resource Center is committed to support the Augustinian education by providing
              instructional materials and facilities for teaching-learning processes, research initiatives,
              and recent innovations to meet client satisfaction in the promotion of life-long learning.
            </p>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent group-hover:via-amber-400/40 transition-all duration-500"></div>
          </div>
        </div>

        {/* Quick Help Section */}
        
      </div>
    </section>
  );
}

export default Body2;