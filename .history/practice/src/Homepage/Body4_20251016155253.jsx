function Body4() {
  return (
    <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white text-gray-800 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 sm:top-20 left-2 sm:left-4 lg:left-10 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 bg-[#CC0000]/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-4 sm:bottom-10 right-2 sm:right-4 lg:right-10 w-48 h-48 sm:w-72 sm:h-72 lg:w-96 lg:h-96 bg-amber-400/5 rounded-full blur-3xl -z-10"></div>
      
      {/* Heading */}
      <div className="text-center mb-12 sm:mb-16 lg:mb-20 relative">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 sm:mb-4 text-gray-900">
          Service <span className="text-[#CC0000]">Hours</span>
        </h2>
        <div className="w-16 sm:w-20 md:w-24 lg:w-32 h-1 sm:h-1.5 bg-gradient-to-r from-[#CC0000] via-amber-400 to-[#CC0000] mx-auto rounded-full mb-3 sm:mb-4 lg:mb-6"></div>
        <p className="mt-3 sm:mt-4 lg:mt-6 text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
          Our service hours vary depending on the academic calendar period
        </p>
      </div>

      {/* Cards Grid */}
      <div className="max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Regular Semester */}
        <div className="group relative bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md lg:shadow-lg border border-gray-100 overflow-hidden transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2 lg:hover:-translate-y-3 hover:shadow-xl lg:hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-[#CC0000] to-[#B30000] opacity-0 group-hover:opacity-5 transition-opacity duration-500 -z-10"></div>
          <div className="bg-gradient-to-r from-[#CC0000] to-[#B30000] py-3 sm:py-4 lg:py-5 px-3 sm:px-4 lg:px-6 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r to-transparent opacity-70"></div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-center text-white">
              Regular Semester
            </h3>
          </div>
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="space-y-3 sm:space-y-4 lg:space-y-6 text-gray-700">
              <div className="flex justify-between items-center pb-2 sm:pb-3 lg:pb-4 border-b border-gray-100 group-hover:border-gray-200 transition-colors duration-300">
                <span className="font-medium text-gray-900 flex items-center text-xs sm:text-sm lg:text-base">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#CC0000] rounded-full mr-1 sm:mr-2 lg:mr-3"></span>
                  Weekdays
                </span>
                <span className="font-semibold text-[#CC0000] bg-red-50 px-1 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-full text-xs">7:30 AM – 7:00 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900 flex items-center text-xs sm:text-sm lg:text-base">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-400 rounded-full mr-1 sm:mr-2 lg:mr-3"></span>
                  Saturday
                </span>
                <span className="font-semibold text-amber-600 bg-amber-50 px-1 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-full text-xs">7:30 AM – 5:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Semestral Break */}
        <div className="group relative bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md lg:shadow-lg border border-gray-100 overflow-hidden transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2 lg:hover:-translate-y-3 hover:shadow-xl lg:hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-[#CC0000] to-[#B30000] opacity-0 group-hover:opacity-5 transition-opacity duration-500 -z-10"></div>
          <div className="bg-gradient-to-r from-[#CC0000] to-[#B30000] py-3 sm:py-4 lg:py-5 px-3 sm:px-4 lg:px-6 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r to-transparent opacity-70"></div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-center text-white">
              Semestral Break
            </h3>
          </div>
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="space-y-3 sm:space-y-4 lg:space-y-6 text-gray-700">
              <div className="flex justify-between items-center pb-2 sm:pb-3 lg:pb-4 border-b border-gray-100 group-hover:border-gray-200 transition-colors duration-300">
                <span className="font-medium text-gray-900 flex items-center text-xs sm:text-sm lg:text-base">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#CC0000] rounded-full mr-1 sm:mr-2 lg:mr-3"></span>
                  Weekday Mornings
                </span>
                <span className="font-semibold text-[#CC0000] bg-red-50 px-1 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-full text-xs">7:30 AM – 11:30 AM</span>
              </div>
              <div className="flex justify-between items-center pb-2 sm:pb-3 lg:pb-4 border-b border-gray-100 group-hover:border-gray-200 transition-colors duration-300">
                <span className="font-medium text-gray-900 flex items-center text-xs sm:text-sm lg:text-base">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-400 rounded-full mr-1 sm:mr-2 lg:mr-3"></span>
                  Weekday Afternoons
                </span>
                <span className="font-semibold text-amber-600 bg-amber-50 px-1 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-full text-xs">1:00 PM – 5:00 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900 flex items-center text-xs sm:text-sm lg:text-base">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mr-1 sm:mr-2 lg:mr-3"></span>
                  Saturday
                </span>
                <span className="font-semibold text-blue-600 bg-blue-50 px-1 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-full text-xs">7:30 AM – 12:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summer Term */}
        <div className="group relative bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md lg:shadow-lg border border-gray-100 overflow-hidden transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2 lg:hover:-translate-y-3 hover:shadow-xl lg:hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-[#CC0000] to-[#B30000] opacity-0 group-hover:opacity-5 transition-opacity duration-500 -z-10"></div>
          <div className="bg-gradient-to-r from-[#CC0000] to-[#B30000] py-3 sm:py-4 lg:py-5 px-3 sm:px-4 lg:px-6 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r to-transparent opacity-70"></div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-center text-white">
              Summer Term
            </h3>
          </div>
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="space-y-3 sm:space-y-4 lg:space-y-6 text-gray-700">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900 flex items-center text-xs sm:text-sm lg:text-base">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#CC0000] rounded-full mr-1 sm:mr-2 lg:mr-3"></span>
                  Weekdays
                </span>
                <span className="font-semibold text-[#CC0000] bg-red-50 px-1 sm:px-2 lg:px-3 py-0.5 sm:py-1 rounded-full text-xs">7:30 AM – 5:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 sm:mt-12 lg:mt-16 text-center max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm">
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 leading-relaxed">
            <span className="font-semibold text-[#CC0000]">Note:</span> Service hours may vary during holidays and special university events. 
            Please check our announcements for any schedule changes.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Body4;