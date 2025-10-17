// Body4.jsx
import { useState } from "react";
import { BookOpen, Calendar, Phone, ArrowRight, ExternalLink } from "lucide-react";

function Body4() {
  const [activeSection, setActiveSection] = useState(0);

  const sections = [
    {
      icon: BookOpen,
      title: "Getting Started",
      color: "from-blue-500 to-cyan-500",
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
      color: "from-green-500 to-emerald-500",
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
      color: "from-amber-500 to-orange-500",
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
    <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-12 lg:py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Simplified background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl -z-10"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-0.5 bg-[#CC0000] rounded-full"></div>
            <span className="text-xs font-semibold text-[#CC0000] uppercase tracking-wider">Quick Help</span>
            <div className="w-6 h-0.5 bg-[#CC0000] rounded-full"></div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-[#CC0000]">CircuLink</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Your modern library room reservation system for seamless study space booking at University of San Agustin.
          </p>
          
          <div className="w-20 h-1 bg-gradient-to-r from-[#CC0000] to-[#990000] mx-auto rounded-full mb-8"></div>
        </div>

        {/* Section Navigation - Mobile */}
        <div className="lg:hidden mb-8">
          <div className="flex overflow-x-auto pb-4 space-x-2 scrollbar-hide">
            {sections.map((section, index) => (
              <button
                key={section.title}
                onClick={() => setActiveSection(index)}
                className={`flex-shrink-0 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeSection === index
                    ? `bg-gradient-to-r ${section.color} text-white shadow-lg`
                    : "bg-white text-gray-700 shadow-md hover:shadow-lg"
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
              className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 ${
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
                        <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors duration-300">
                          {item.question}
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                    {questionIndex < section.questions.length - 1 && (
                      <div className="w-full h-px bg-gray-100 mt-6"></div>
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
              className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                activeSection === index
                  ? `bg-gradient-to-r ${section.color} text-white shadow-lg transform scale-105`
                  : "bg-white text-gray-700 shadow-md hover:shadow-lg hover:scale-105"
              }`}
            >
              <section.icon className="w-5 h-5" />
              <span>{section.title}</span>
            </button>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Reserve Your Space?
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Join thousands of students and faculty members already using CircuLink for their study and research needs.
            </p>
            <button
              onClick={scrollToAuth}
              className="group bg-gradient-to-r from-[#CC0000] to-[#990000] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center space-x-2"
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
    </section>
  );
}

export default Body4;