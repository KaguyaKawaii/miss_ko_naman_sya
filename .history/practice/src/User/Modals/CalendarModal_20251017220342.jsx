import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function CalendarModal({ selectedDate, onChange, onClose }) {
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDateChange = (date) => {
    onChange(date);
    onClose();
  };

  // Custom navigation label to format month and year
  const navigationLabel = ({ date }) => {
    return (
      <span className="text-lg font-semibold text-gray-900">
        {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      </span>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Select Date</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
            aria-label="Close calendar"
          >
            <svg 
              className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Calendar */}
        <div className="p-6">
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            className="border-0 w-full"
            minDetail="month"
            nextLabel={
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            }
            prevLabel={
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
            navigationLabel={navigationLabel}
            tileClassName={({ date, view }) =>
              view === 'month' &&
              date.toDateString() === new Date().toDateString()
                ? 'bg-blue-50 text-blue-600 font-semibold rounded-lg'
                : ''
            }
            tileDisabled={({ date, view }) =>
              view === 'month' && date > new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            }
          />
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button 
            onClick={() => handleDateChange(new Date())}
            className="w-full sm:w-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            Select Today
          </button>
          <div className="text-sm text-gray-600 font-medium text-center sm:text-right">
            Selected:{" "}
            <span className="text-gray-900">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarModal;