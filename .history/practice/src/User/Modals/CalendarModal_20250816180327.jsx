import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function CalendarModal({ selectedDate, onChange, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Select a Date</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
        <Calendar
          onChange={(date) => {
            onChange(date);
            onClose();
          }}
          value={selectedDate}
          className="border-0"
        />
      </div>
    </div>
  );
}

export default CalendarModal;
