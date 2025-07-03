function Body4() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white text-gray-800">
      {/* Heading */}
      <div className="text-center mb-20">
        <h2 className="text-5xl font-bold tracking-tight mb-4 text-gray-900">Service Hours</h2>
        <div className="w-24 h-1.5 bg-gradient-to-r from-[#CC0000] to-red-600 mx-auto rounded-full"></div>
        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          Our service hours vary depending on the academic calendar period
        </p>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Regular Semester */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
          <div className="bg-[#CC0000] py-4 px-6">
            <h3 className="text-2xl font-bold text-center text-white">
              Regular Semester
            </h3>
          </div>
          <div className="p-8">
            <div className="space-y-6 text-gray-700">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="font-medium text-gray-900">Weekdays</span>
                <span className="font-semibold">7:30 AM – 7:00 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Saturday</span>
                <span className="font-semibold">7:30 AM – 5:00 PM</span>
              </div>
            </div>
           
          </div>
        </div>

        {/* Semestral Break */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
          <div className="bg-[#CC0000] py-4 px-6">
            <h3 className="text-2xl font-bold text-center text-white">
              Semestral Break
            </h3>
          </div>
          <div className="p-8">
            <div className="space-y-6 text-gray-700">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="font-medium text-gray-900">Weekday Mornings</span>
                <span className="font-semibold">7:30 AM – 11:30 AM</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="font-medium text-gray-900">Weekday Afternoons</span>
                <span className="font-semibold">1:00 PM – 5:00 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Saturday</span>
                <span className="font-semibold">7:30 AM – 12:00 PM</span>
              </div>
            </div>
            
          </div>
        </div>

        {/* Summer Term */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
          <div className="bg-[#CC0000] py-4 px-6">
            <h3 className="text-2xl font-bold text-center text-white">
              Summer Term
            </h3>
          </div>
          <div className="p-8">
            <div className="space-y-6 text-gray-700">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="font-medium text-gray-900">Weekdays</span>
                <span className="font-semibold">7:30 AM – 6:30 PM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Saturday</span>
                <span className="font-semibold">7:30 AM – 5:30 PM</span>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Additional Note */}
      <div className="max-w-3xl mx-auto mt-16 text-center text-gray-600 bg-white/50 backdrop-blur-sm p-6 rounded-xl border border-gray-200">
        <p className="text-lg">
          <span className="font-semibold text-[#CC0000]">Note:</span> Hours may vary during holidays and special events. Please check our announcements for updates.
        </p>
      </div>
    </section>
  );
}

export default Body4;