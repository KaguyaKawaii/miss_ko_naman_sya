// Body4.jsx
function Body4() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-gray-50 to-white text-gray-800 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-4 sm:left-10 w-60 h-60 sm:w-80 sm:h-80 bg-[#CC0000]/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-10 right-4 sm:right-10 w-72 h-72 sm:w-96 sm:h-96 bg-amber-400/5 rounded-full blur-3xl -z-10"></div>
      
      {/* Heading */}
      <div className="text-center mb-16 sm:mb-20 relative">
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-gray-900">
          Service <span className="text-[#CC0000]">Hours</span>
        </h2>
        <div className="w-24 sm:w-32 h-1.5 bg-gradient-to-r from-[#CC0000] via-amber-400 to-[#CC0000] mx-auto rounded-full mb-4 sm:mb-6"></div>
        <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Our service hours vary depending on the academic calendar period
        </p>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Regular Semester */}
        <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-500 hover:-translate-y-2 sm:hover:-translate-y-3 hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-[#CC0000] to-[#B30000] opacity-0 group-hover:opacity-5 transition-opacity duration-500 -z-10"></div>
          <div className="bg-gradient-to-r from-[#CC0000] to-[#B30000] py-4 sm:py-5 px-4 sm:px-6 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r to-transparent opacity-70"></div>
            <h3 className="text-xl sm:text-2xl font-bold text-center text-white">
              Regular Semester
            </h3>
          </div>
          <div className="p-6 sm:p-8">
            <div className="space-y-4 sm:space-y-6 text-gray-700">
              <div className="flex justify-between items-center pb-3 sm:pb-4 border-b border-gray-100 group-hover:border-gray-200 transition-colors duration-300">
                <span className="font-medium text-gray-900 flex items-center text-sm sm:text-base">
                  <span className="w-2 h-2 bg-[#CC0000] rounded-full mr-2 sm:mr-3"></span>
                  Weekdays
                </span>
                <span className="font-semibold text-[#CC0000] bg-red-50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">7:30 AM – 7:00 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900 flex items-center text-sm sm:text-base">
                  <span className="w-2 h-2 bg-amber-400 rounded-full mr-2 sm:mr-3"></span>
                  Saturday
                </span>
                <span className="font-semibold text-amber-600 bg-amber-50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">7:30 AM – 5:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Semestral Break */}
        <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-500 hover:-translate-y-2 sm:hover:-translate-y-3 hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-[#CC0000] to-[#B30000] opacity-0 group-hover:opacity-5 transition-opacity duration-500 -z-10"></div>
          <div className="bg-gradient-to-r from-[#CC0000] to-[#B30000] py-4 sm:py-5 px-4 sm:px-6 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r to-transparent opacity-70"></div>
            <h3 className="text-xl sm:text-2xl font-bold text-center text-white">
              Semestral Break
            </h3>
          </div>
          <div className="p-6 sm:p-8">
            <div className="space-y-4 sm:space-y-6 text-gray-700">
              <div className="flex justify-between items-center pb-3 sm:pb-4 border-b border-gray-100 group-hover:border-gray-200 transition-colors duration-300">
                <span className="font-medium text-gray-900 flex items-center text-sm sm:text-base">
                  <span className="w-2 h-2 bg-[#CC0000] rounded-full mr-2 sm:mr-3"></span>
                  Weekday Mornings
                </span>
                <span className="font-semibold text-[#CC0000] bg-red-50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">7:30 AM – 11:30 AM</span>
              </div>
              <div className="flex justify-between items-center pb-3 sm:pb-4 border-b border-gray-100 group-hover:border-gray-200 transition-colors duration-300">
                <span className="font-medium text-gray-900 flex items-center text-sm sm:text-base">
                  <span className="w-2 h-2 bg-amber-400 rounded-full mr-2 sm:mr-3"></span>
                  Weekday Afternoons
                </span>
                <span className="font-semibold text-amber-600 bg-amber-50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">1:00 PM – 5:00 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900 flex items-center text-sm sm:text-base">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 sm:mr-3"></span>
                  Saturday
                </span>
                <span className="font-semibold text-blue-600 bg-blue-50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">7:30 AM – 12:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summer Term */}
        <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-500 hover:-translate-y-2 sm:hover:-translate-y-3 hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-[#CC0000] to-[#B30000] opacity-0 group-hover:opacity-5 transition-opacity duration-500 -z-10"></div>
          <div className="bg-gradient-to-r from-[#CC0000] to-[#B30000] py-4 sm:py-5 px-4 sm:px-6 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r to-transparent opacity-70"></div>
            <h3 className="text-xl sm:text-2xl font-bold text-center text-white">
              Summer Term
            </h3>
          </div>
          <div className="p-6 sm:p-8">
            <div className="space-y-4 sm:space-y-6 text-gray-700">
              <div className="flex justify-between items-center pb-3 sm:pb-4 border-b border-gray-100 group-hover:border-gray-200 transition-colors duration-300">
                <span className="font-medium text-gray-900 flex items-center text-sm sm:text-base">
                  <span className="w-2 h-2 bg-[#CC0000] rounded-full mr-2 sm:mr-3"></span>
                  Weekdays
                </span>
                <span className="font-semibold text-[#CC0000] bg-red-50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">7:30 AM – 6:30 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900 flex items-center text-sm sm:text-base">
                  <span className="w-2 h-2 bg-amber-400 rounded-full mr-2 sm:mr-3"></span>
                  Saturday
                </span>
                <span className="font-semibold text-amber-600 bg-amber-50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">7:30 AM – 5:30 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Note */}
      <div className="max-w-3xl mx-auto mt-12 sm:mt-16 text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm shadow-lg relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-16 h-16 sm:w-20 sm:h-20 bg-[#CC0000]/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-8 -left-8 w-16 h-16 sm:w-20 sm:h-20 bg-amber-400/10 rounded-full blur-xl"></div>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed relative z-10">
          <span className="font-semibold text-[#CC0000]">Note:</span> Service hours may be adjusted during holidays and special university events. 
          Please check our announcements for any schedule changes.
        </p>
      </div>
    </section>
  );
}

export default Body4;