import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../CalendarModal.css"; // We'll create this CSS file

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

  return (
    <div 
      className="calendar-modal-overlay" 
      onClick={handleOverlayClick}
    >
      <div className="calendar-modal-container">
        <div className="calendar-modal-header">
          <h2 className="calendar-modal-title">Select Date</h2>
          <button
            onClick={onClose}
            className="calendar-modal-close-btn"
            aria-label="Close calendar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="calendar-wrapper">
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            className="custom-calendar"
            minDetail="month"
            nextLabel={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            prevLabel={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            navigationLabel={({ date, label, locale, view }) => (
              <span className="calendar-navigation-label">
                {date.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}
              </span>
            )}
          />
        </div>
        
        <div className="calendar-modal-footer">
          <button 
            onClick={() => handleDateChange(new Date())}
            className="today-btn"
          >
            Today
          </button>
          <div className="selected-date-display">
            Selected: {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarModal;