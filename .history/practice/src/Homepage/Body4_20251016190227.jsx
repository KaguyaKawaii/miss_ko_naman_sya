// Body4.jsx
import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle, Calendar, Clock, Users, MapPin, BookOpen, MessageCircle, Mail, Shield, AlertCircle } from "lucide-react";

const faqSections = [
  {
    title: "Getting Started",
    icon: HelpCircle,
    questions: [
      {
        question: "How to sign up and log in",
        answer: "To begin using the reservation system, visit the homepage and click the 'Login' button. If this is your first time using the system, click on 'Sign Up' found just below the login form. You will need to provide your full name, ID number, email address, and password. Select your role carefully either Student or Faculty."
      },
      {
        question: "Student vs Faculty account roles",
        answer: "When creating an account, select your correct role based on your university affiliation. Both students and faculty share the same core features such as making reservations, joining as participants, and checking room availability. Choosing the correct role helps the library staff verify your identity and ensures that your account is approved without unnecessary delay."
      },
      {
        question: "Verifying your ID number",
        answer: "After you have signed up, bring your official university ID or RFID card to the library staff for verification. You may also email a clear picture of your ID to circulation@usa.edu.ph. Once your ID is verified, your account will be fully activated. You will see a 'Verified' label on your account when you log in."
      },
      {
        question: "What to do if your account is blocked",
        answer: "A blocked account may happen if you have violated the reservation policies, exceeded your allowed number of reservations, or are still pending verification. If you believe this is a mistake, message the admin using the Messages tab on your dashboard or approach the library staff for manual assistance."
      }
    ]
  },
  {
    title: "Making a Reservation",
    icon: Calendar,
    questions: [
      {
        question: "Choosing a date, location, and room",
        answer: "From your dashboard, click the 'Reserve Room' button. Select the date you want to reserve using the calendar view. Next, choose a location (such as Ground Floor or Second Floor) from the displayed image tiles. Once a floor is chosen, the available rooms will appear, allowing you to pick one that best suits your group size and preferences."
      },
      {
        question: "Date and time selection",
        answer: "Reservations are limited to one hour per day per group. After selecting the date, pick an available time slot. The system automatically blocks slots that are already reserved or overlap with existing bookings, ensuring that there are no conflicts."
      },
      {
        question: "Adding participants",
        answer: "You must add at least three participants by entering their verified student or faculty ID numbers. The system will cross-check these IDs and notify you if they are invalid, duplicated, or already reserved for that day."
      },
      {
        question: "Reservation limit and restrictions",
        answer: "Each user including participants is allowed only one active reservation per day. This means that even if your previous reservation was cancelled or rejected, you cannot make another one until the next day."
      },
      {
        question: "Why you may be blocked from reserving",
        answer: "If the system prevents you from submitting a reservation, it could be due to: Having another reservation on the same day, being unverified, or already being a participant in another reservation for that day. Always check your reservation history for confirmation."
      }
    ]
  },
  {
    title: "Understanding Room Availability",
    icon: MapPin,
    questions: [
      {
        question: "How to check if a room is occupied",
        answer: "On your dashboard, click a date on the calendar to open the Room Availability Checker. A modal will appear showing each room grouped by floor. If a room has existing reservations during that date and time, it will be marked as 'Occupied' along with the time ranges it is taken."
      },
      {
        question: "What 'Occupied' means",
        answer: "A room is marked 'Occupied' if there is any reservation already submitted for that time, regardless of whether it's still pending or already approved. You will not be allowed to reserve overlapping time slots for rooms that are occupied."
      },
      {
        question: "Why a room is unavailable",
        answer: "A room may be unavailable due to: An existing reservation that has been approved, the library is closed on the selected date, or the selected time is outside the operating hours. Always check availability before submitting a reservation request."
      },
      {
        question: "Only approved reservations block the room",
        answer: "A room is considered unavailable only if it already has an Approved reservation during the selected time slot. Pending, Rejected, or Cancelled reservations do not block the room and will not affect availability."
      }
    ]
  },
  {
    title: "Reservation Status & Actions",
    icon: Clock,
    questions: [
      {
        question: "What Pending, Approved, Rejected mean",
        answer: "Pending: Your reservation has been submitted and is awaiting admin approval. You cannot make another reservation until this is resolved. Approved: Your reservation was accepted and is officially scheduled. You may proceed to use the room at the specified time. Rejected: Your reservation was declined. You will need to submit a new request if needed. You are now allowed to reserve again for the same day."
      },
      {
        question: "How to cancel your reservation",
        answer: "Go to the Dashboard or History tab, find your active reservation, and click the 'Cancel' button. A confirmation dialog will appear. Once cancelled, the slot becomes available again for others to reserve."
      },
      {
        question: "Viewing past reservations",
        answer: "All your current and previous reservations can be viewed in the History tab. Here you can see the reservation date, time, room, and status. This is useful for checking your past activity or following up on a pending request."
      },
      {
        question: "Why your reservation was rejected",
        answer: "Common reasons for rejection include: Duplicate reservation for the same day, invalid or unverified participants, attempting to reserve a time slot already occupied, violation of library or room guidelines. Check your email or notification tab for rejection details."
      }
    ]
  },
  {
    title: "Notifications & Updates",
    icon: MessageCircle,
    questions: [
      {
        question: "How you get notified",
        answer: "Every time your reservation status changes (e.g., Approved, Rejected, or Cancelled), the system will send you two types of notifications: A real-time update inside the Notifications tab on your dashboard, and an email alert to the address you used when signing up."
      },
      {
        question: "Where to view updates",
        answer: "Go to the Notifications tab from the sidebar menu. Here, you'll see a list of updates sorted by most recent. Each notification includes the reservation ID, room name, time, and the status update (e.g., 'Your reservation has been approved')."
      },
      {
        question: "Didn't receive an email? Check your spam",
        answer: "If you haven't received an email update, check your spam or junk folder. Some university email systems may automatically filter unknown senders. Also, ensure that your registered email is correct in your Profile tab. If the issue persists, contact the admin via Messages."
      }
    ]
  },
  {
    title: "Troubleshooting",
    icon: AlertCircle,
    questions: [
      {
        question: "Reservation form not submitting",
        answer: "Double-check that all required fields are filled out especially the date, time, and participants. Make sure: You selected a room, the time slot is available, and you added at least 3 valid participant ID numbers. If the form doesn't respond, try refreshing the page."
      },
      {
        question: "Calendar not showing",
        answer: "If the calendar doesn't appear, try these steps: Refresh the page and wait a few seconds, try using a different browser like Chrome or Firefox, turn off incognito/private mode, disable any browser extensions that block pop-ups or scripts."
      },
      {
        question: "Participants not verifying",
        answer: "If a participant's ID doesn't verify: Make sure the ID is typed correctly, ensure the participant has already signed up and is verified, do not reuse the same ID twice. If problems persist, contact the admin through the Messages tab."
      },
      {
        question: "Can't log in or forgot password",
        answer: "If you're having trouble logging in, double-check your email and password. If you forgot your password, you can now reset it by clicking the Forgot Password link on the login page and following the instructions."
      }
    ]
  },
  {
    title: "Frequently Asked Questions",
    icon: HelpCircle,
    questions: [
      {
        question: "Why can't I reserve more than once today?",
        answer: "To maintain fairness and allow equal access to rooms, each user is limited to one reservation per day whether you are the main reserver or added as a participant. This rule applies even if the reservation was rejected or canceled."
      },
      {
        question: "Can participants reserve too?",
        answer: "Yes, participants can also reserve but only if they haven't already joined another reservation that day. Once you're involved in any reservation (even as a participant), the system will block you from creating or joining another on the same day."
      },
      {
        question: "Why do I need to be verified?",
        answer: "Verification ensures that only legitimate University of San Agustin students and faculty use the system. Your ID must be verified before you can create a reservation or be added as a participant. Unverified accounts will not be allowed to reserve."
      },
      {
        question: "What time ranges are allowed?",
        answer: "Reservation times follow the library's open hours. You can choose hourly blocks within the allowed time range, but you cannot overlap existing reservations. The system will only accept valid time slots that do not conflict with others."
      }
    ]
  },
  {
    title: "Contact",
    icon: Mail,
    questions: [
      {
        question: "Contact admin through the Messages tab",
        answer: "If you need help with account issues, reservation concerns, or system errors, go to the Messages tab in your dashboard. You can send a direct message to the system administrator or library staff. Replies will also appear there."
      },
      {
        question: "Email support",
        answer: "For urgent matters, email us at support@yourdomain.com. Include your full name, ID number, and a clear description of your issue for faster assistance."
      },
      {
        question: "Submit a request via contact form",
        answer: "If the website includes a contact form (check the homepage or footer), you may also submit support requests there. Make sure to include your contact information and a detailed explanation of the problem."
      }
    ]
  }
];

function Body4() {
  const [openSections, setOpenSections] = useState({});
  const [openQuestions, setOpenQuestions] = useState({});

  const toggleSection = (sectionIndex) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionIndex]: !prev[sectionIndex]
    }));
  };

  const toggleQuestion = (sectionIndex, questionIndex) => {
    const key = `${sectionIndex}-${questionIndex}`;
    setOpenQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-400/5 via-transparent to-transparent"></div>
      <div className="absolute top-0 left-0 w-72 h-72 sm:w-96 sm:h-96 bg-[#CC0000]/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 sm:w-[30rem] sm:h-[30rem] bg-amber-400/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>

      <div className="max-w-6xl lg:max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 sm:mb-20 lg:mb-24">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl shadow-2xl mb-6 sm:mb-8 lg:mb-10">
            <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            Help <span className="text-amber-400">Center</span>
          </h2>
          <div className="w-24 sm:w-32 lg:w-40 h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto rounded-full mb-6 sm:mb-8"></div>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-light">
            Comprehensive guide to using CircuLink room reservation system
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-6 sm:space-y-8">
          {faqSections.map((section, sectionIndex) => {
            const SectionIcon = section.icon;
            const isSectionOpen = openSections[sectionIndex];
            
            return (
              <div
                key={sectionIndex}
                className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl transition-all duration-500 hover:bg-white/10 hover:border-white/20 overflow-hidden"
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(sectionIndex)}
                  className="w-full px-6 sm:px-8 lg:px-10 py-6 sm:py-8 text-left flex items-center justify-between gap-4 sm:gap-6 transition-all duration-300 hover:bg-white/5"
                >
                  <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 ${
                        isSectionOpen 
                          ? 'bg-amber-400/20 text-amber-400' 
                          : 'bg-white/5 text-gray-400 group-hover:bg-amber-400/10 group-hover:text-amber-300'
                      }`}>
                        <SectionIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                      </div>
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
                        {section.title}
                      </h3>
                      <p className="text-gray-400 text-sm sm:text-base">
                        {section.questions.length} questions
                      </p>
                    </div>
                  </div>
                  <div className={`flex-shrink-0 p-2 sm:p-3 rounded-lg transition-all duration-300 ${
                    isSectionOpen 
                      ? 'bg-amber-400/20 text-amber-400 rotate-180' 
                      : 'bg-white/5 text-gray-400 group-hover:bg-amber-400/10 group-hover:text-amber-300'
                  }`}>
                    {isSectionOpen ? (
                      <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                  </div>
                </button>
                
                {/* Section Content */}
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  isSectionOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-6 sm:px-8 lg:px-10 pb-6 sm:pb-8 lg:pb-10">
                    <div className="space-y-4">
                      {section.questions.map((faq, questionIndex) => {
                        const key = `${sectionIndex}-${questionIndex}`;
                        const isQuestionOpen = openQuestions[key];
                        
                        return (
                          <div
                            key={questionIndex}
                            className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:bg-white/10 transition-colors duration-300"
                          >
                            <button
                              onClick={() => toggleQuestion(sectionIndex, questionIndex)}
                              className="w-full px-5 sm:px-6 py-4 text-left flex items-center justify-between gap-4 transition-all duration-300"
                            >
                              <h4 className="text-base sm:text-lg font-semibold text-white flex-1 min-w-0 leading-relaxed text-left">
                                {faq.question}
                              </h4>
                              <div className={`flex-shrink-0 p-1 sm:p-2 rounded-lg transition-all duration-300 ${
                                isQuestionOpen 
                                  ? 'bg-amber-400/20 text-amber-400 rotate-180' 
                                  : 'bg-white/5 text-gray-400 group-hover:bg-amber-400/10 group-hover:text-amber-300'
                              }`}>
                                {isQuestionOpen ? (
                                  <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                                )}
                              </div>
                            </button>
                            
                            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                              isQuestionOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                            }`}>
                              <div className="px-5 sm:px-6 pb-4 sm:pb-5">
                                <div className="border-l-2 border-amber-400/30 pl-4">
                                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
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
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 sm:mt-20 text-center">
          <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-white shadow-2xl">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              Still need help?
            </h3>
            <p className="text-amber-100 text-lg sm:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              Our support team is ready to assist you with any questions about room reservations, account issues, or technical problems.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-amber-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl">
                Contact Support Team
              </button>
              <button className="border border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300">
                Send us an Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Body4;