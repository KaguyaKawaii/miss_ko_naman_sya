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
        <div className="pt-8 sm:pt-12">
          {/* Header Section */}
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-0.5 bg-[#CC0000] rounded-full"></div>
              <span className="text-xs font-semibold text-[#CC0000] uppercase tracking-wider">Quick Help</span>
              <div className="w-6 h-0.5 bg-[#CC0000] rounded-full"></div>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Need <span className="text-[#CC0000]">Help?</span>
            </h2>
            
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Get answers to the most common questions about using CircuLink
            </p>
            
            <div className="w-20 h-1 bg-gradient-to-r from-[#CC0000] to-amber-400 mx-auto rounded-full mb-8"></div>
          </div>

          {/* Section Navigation - Mobile */}
          <div className="lg:hidden mb-8">
            <div className="flex overflow-x-auto pb-4 space-x-2 scrollbar-hide">
              {sections.map((section, index) => (
                <button
                  key={section.title}
                  onClick={() => setActiveSection(index)}
                  className={`flex-shrink-0 px-6 py-3 rounded-xl font-semibold transition-all duration-300 border ${
                    activeSection === index
                      ? `bg-gradient-to-r ${section.color} text-white shadow-lg border-transparent`
                      : "bg-white text-gray-700 shadow-md hover:shadow-lg border-gray-200"
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {sections.map((section, sectionIndex) => (
              <div
                key={section.title}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 ${
                  activeSection !== sectionIndex ? 'lg:block hidden' : 'block'
                }`}
              >
                {/* Section Header */}
                <div className={`bg-gradient-to-r ${section.color} rounded-t-2xl p-6 text-white`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <section.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{section.title}</h3>
                      <p className="text-white/80 text-sm mt-1">
                        {section.questions.length} key points
                      </p>
                    </div>
                  </div>
                </div>

                {/* Questions & Answers */}
                <div className="p-6 space-y-6">
                  {section.questions.map((item, questionIndex) => (
                    <div
                      key={questionIndex}
                      className="group"
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${section.color} mt-2 flex-shrink-0`}></div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-[#CC0000] transition-colors duration-300">
                            {item.question}
                          </h4>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                      {questionIndex < section.questions.length - 1 && (
                        <div className="w-full h-px bg-gray-200 mt-6"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Section Navigation - Desktop */}
          <div className="hidden lg:flex justify-center space-x-6 mb-12">
            {sections.map((section, index) => (
              <button
                key={section.title}
                onClick={() => setActiveSection(index)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 border ${
                  activeSection === index
                    ? `bg-gradient-to-r ${section.color} text-white shadow-lg transform scale-105 border-transparent`
                    : "bg-white text-gray-700 shadow-md hover:shadow-lg hover:scale-105 border-gray-200"
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span>{section.title}</span>
              </button>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Reserve Your Space?
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Join thousands of students and faculty members already using CircuLink for their study and research needs.
              </p>
              <button
                onClick={scrollToAuth}
                className="group bg-gradient-to-r from-[#CC0000] to-amber-500 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              
              <div className="mt-6 flex justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Instant Booking</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Real-time Availability</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>24/7 Access</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Help Link */}
          <div className="text-center mt-8">
            <a
              href="/help"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-[#CC0000] transition-colors duration-300 group"
            >
              <span>Need more detailed help?</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Body2;