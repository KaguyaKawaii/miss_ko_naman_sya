function Body4() {
  return (
    <section className="py-20 px-8 bg-white">
      {/* Heading */}
      <h2 className="text-5xl font-bold text-center">Service Hour</h2>
      <div className="border-b border-[#CC0000] w-[80rem] mx-auto pt-5 mb-12"></div>


      {/* Boxes */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-6">
        {/* 1 — Regular Semester */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-semibold text-center mb-4">Regular Semester</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>7:30 AM – 7:00 PM (Monday to Friday)</li>
            <li>7:30 AM – 5:00 PM (Saturday)</li>
          </ul>
        </div>

        {/* 2 — Semestral Break */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-semibold text-center mb-4">Semestral Break</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>7:30 AM – 11:30 AM (Monday to Friday)</li>
            <li>1:00 PM – 5:00 PM (Monday to Friday)</li>
            <li>7:30 AM – 12:00 PM (Saturday)</li>
          </ul>
        </div>

        {/* 3 — Summer Term */}
        <div className="flex-1 bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-semibold text-center mb-4">Summer Term</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>7:30 AM – 6:30 PM (Monday to Saturday)</li>
            <li>7:30 AM – 5:30 PM (Saturday)</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Body4;
