import React, { useState } from "react";
import { ChevronDown, ChevronUp, Clock, Users, MapPin, Calendar, BookOpen, ArrowLeft } from "lucide-react";

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

export default function HelpCenter({ setView }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="ml-0 lg:ml-[250px] w-full lg:w-[calc(100%-250px)] min-h-screen flex flex-col bg-gray-50">
      {/* HEADER */}
      <header className="bg-white text-gray-800 px-4 sm:px-6 h-[70px] flex items-center justify-between shadow-sm border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </button>
          <h1 className="text-xl md:text-2xl font-bold tracking-wide">
            Help Center
          </h1>
        </div>
      </header>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 sm:p-8 mb-8 text-white shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">Frequently Asked Questions</h2>
            </div>
            <p className="text-blue-100 text-lg sm:text-xl leading-relaxed max-w-2xl">
              Find quick answers to common questions about CircuLink and our room reservation system
            </p>
          </div>

          {/* FAQ Section */}
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const IconComponent = faq.icon;
              const isOpen = openIndex === index;
              
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 transition-all duration-300 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-lg transition-all duration-300 ${
                          isOpen 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 flex-1 min-w-0 leading-relaxed">
                        {faq.question}
                      </h3>
                    </div>
                    <div className={`flex-shrink-0 p-2 rounded-lg transition-all duration-300 ${
                      isOpen 
                        ? 'bg-blue-100 text-blue-600 rotate-180' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </button>
                  
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="px-6 pb-6">
                      <div className="pl-12 border-l-2 border-blue-200">
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Help Section */}
          <div className="mt-12 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Still need help?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Can't find the answer you're looking for? Our support team is here to help you with any questions about room reservations, account issues, or technical problems.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => setView('messages')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Contact Support
                </button>
                <button className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  View Full Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}