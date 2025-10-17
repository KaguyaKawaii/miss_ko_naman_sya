// Body4.jsx
import { useState } from "react";
import { ChevronDown, ChevronUp, Clock, Users, MapPin, Calendar, BookOpen } from "lucide-react";

const faqs = [
  {
    question: "How do I reserve a room?",
    answer: "To reserve a room, simply log into your CircuLink account, navigate to the 'Reservations' section, select your preferred room, date, and time slot, then confirm your booking. You'll receive an email confirmation once your reservation is approved.",
    icon: BookOpen
  },
  {
    question: "What are the operating hours for room reservations?",
    answer: "Room reservations can be made during library operating hours: Monday to Friday from 8:00 AM to 8:00 PM, and Saturday from 9:00 AM to 5:00 PM. Reservations must be made at least 24 hours in advance.",
    icon: Clock
  },
  {
    question: "How many people can use each room?",
    answer: "Room capacities vary by size and type. Discussion rooms accommodate 4-6 people, Graduate Research Hubs seat 2-4 researchers, Collaboration Spaces handle 6-8 people, and Faculty Rooms are designed for individual faculty use. Specific capacities are listed when you select a room.",
    icon: Users
  },
  {
    question: "Where are the rooms located?",
    answer: "Our facilities are spread across multiple floors: 1st Floor houses Graduate Research Hubs and Discussion Rooms, 4th and 5th Floors contain Collaboration Spaces and Faculty Rooms. Detailed floor maps are available in the room selection interface.",
    icon: MapPin
  },
  {
    question: "How far in advance can I book a room?",
    answer: "Rooms can be reserved up to 14 days in advance. This ensures fair access for all students and faculty members. We recommend booking early, especially during peak academic periods.",
    icon: Calendar
  },
  {
    question: "What if I need to cancel my reservation?",
    answer: "You can cancel your reservation up to 2 hours before your scheduled time through your CircuLink account. Frequent no-shows may affect your future booking privileges, so please cancel in advance if you cannot use the room.",
    icon: Clock
  }
];

function Body4() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/5 via-transparent to-transparent"></div>
      <div className="absolute top-0 left-0 w-72 h-72 sm:w-96 sm:h-96 bg-[#CC0000]/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 sm:w-[30rem] sm:h-[30rem] bg-amber-400/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>

      <div className="max-w-4xl lg:max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 sm:mb-20 lg:mb-24">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl shadow-2xl mb-6 sm:mb-8 lg:mb-10">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            Frequently Asked <span className="text-amber-400">Questions</span>
          </h2>
          <div className="w-24 sm:w-32 lg:w-40 h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto rounded-full mb-6 sm:mb-8"></div>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
            Find quick answers to common questions about CircuLink and our room reservation system
          </p>
        </div>

        {/* FAQ Section */}
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {faqs.map((faq, index) => {
            const IconComponent = faq.icon;
            const isOpen = openIndex === index;
            
            return (
              <div
                key={index}
                className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl transition-all duration-500 hover:bg-white/10 hover:border-white/20 overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 sm:px-8 lg:px-10 py-6 sm:py-8 text-left flex items-center justify-between gap-4 sm:gap-6 transition-all duration-300 hover:bg-white/5"
                >
                  <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-300 ${
                        isOpen 
                          ? 'bg-amber-400/20 text-amber-400' 
                          : 'bg-white/5 text-gray-400 group-hover:bg-amber-400/10 group-hover:text-amber-300'
                      }`}>
                        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                      </div>
                    </div>
                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-white flex-1 min-w-0 leading-relaxed">
                      {faq.question}
                    </h3>
                  </div>
                  <div className={`flex-shrink-0 p-1 sm:p-2 rounded-lg transition-all duration-300 ${
                    isOpen 
                      ? 'bg-amber-400/20 text-amber-400 rotate-180' 
                      : 'bg-white/5 text-gray-400 group-hover:bg-amber-400/10 group-hover:text-amber-300'
                  }`}>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    ) : (
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    )}
                  </div>
                </button>
                
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-6 sm:px-8 lg:px-10 pb-6 sm:pb-8 lg:pb-10">
                    <div className="pl-10 sm:pl-14 lg:pl-16 border-l-2 border-amber-400/30">
                      <p className="text-sm sm:text-base lg:text-lg text-gray-300 leading-relaxed font-light">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

       
      </div>
    </section>
  );
}

export default Body4;