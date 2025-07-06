import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import RoomAvailabilityModal from "./RoomAvailabilityModal";
import PropTypes from 'prop-types';
import ReportProblemModal from "./Modals/ReportProblemModal"; // adjust if in different path




// Helper functions
const formatPH = (date) => {
  if (!date) return "N/A";
  try {
    return new Date(date).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
};

const getManilaDateString = (dateObj) => {
  try {
    return new Date(dateObj).toLocaleDateString("en-CA", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
  } catch (error) {
    console.error("Date conversion error:", error);
    return "";
  }
};

const isSameManilaDate = (date1, date2) => {
  return getManilaDateString(date1) === getManilaDateString(date2);
};

function Dashboard({ user, setView, setSelectedReservation }) {
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hasActiveRes, setHasActiveRes] = useState(false);
  const [activeRes, setActiveRes] = useState(null);
  const [showBlock, setShowBlock] = useState(false);
  const [showAvailModal, setShowAvailModal] = useState(false);
  const [roomStatuses, setRoomStatuses] = useState([]);
  const [modalDate, setModalDate] = useState(new Date());
  const [availLoading, setAvailLoading] = useState(false);
  const [availError, setAvailError] = useState("");
  const [participantConflict, setParticipantConflict] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newReservation, setNewReservation] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  

  // API endpoints
  const API_BASE_URL = "http://localhost:5000";
  const RESERVATIONS_ENDPOINT = `${API_BASE_URL}/reservations`;
  const NEWS_ENDPOINT = `${API_BASE_URL}/news`;

  // Event listener for new reservations
  useEffect(() => {
    const handleReservationSuccess = (e) => {
      setNewReservation(e.detail);
      setShowSuccessModal(true);
      fetchReservations();
      checkActiveReservation();
    };

    window.addEventListener('reservationSuccess', handleReservationSuccess);
    return () => window.removeEventListener('reservationSuccess', handleReservationSuccess);
  }, []);

  // Fetch user reservations
  const fetchReservations = useCallback(async () => {
    if (!user?._id) return;

    setIsLoading(true);
    try {
      const { data } = await axios.get(`${RESERVATIONS_ENDPOINT}/user-participating/${user._id}`);
      const sorted = data.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
      setReservations(sorted);
      if (sorted.length > 0) setSelectedReservation(sorted[0]);

      const active = sorted.find(
        (r) => ["Approved", "Pending"].includes(r.status) && new Date(r.endDatetime) >= new Date()
      );
      setHasActiveRes(!!active);
      setActiveRes(active || null);
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, setSelectedReservation, RESERVATIONS_ENDPOINT]);

  // Check active reservations
  const checkActiveReservation = useCallback(async () => {
    if (!user?._id) return;
    try {
      const { data } = await axios.get(`${RESERVATIONS_ENDPOINT}/user-has-any/${user._id}`);
      if (data) {
        setHasActiveRes(isSameManilaDate(data.datetime, new Date()));
        setActiveRes(isSameManilaDate(data.datetime, new Date()) ? data : null);
      } else {
        setHasActiveRes(false);
        setActiveRes(null);
      }
    } catch (error) {
      console.error("Failed to check active reservation:", error);
      setHasActiveRes(false);
      setActiveRes(null);
    }
  }, [user, RESERVATIONS_ENDPOINT]);

  // Fetch news
  const fetchNews = useCallback(async () => {
    try {
      const { data } = await axios.get(NEWS_ENDPOINT);
      setNewsList(data);
    } catch (error) {
      console.error("Failed to fetch news:", error);
      setNewsList([]);
    }
  }, [NEWS_ENDPOINT]);

  // Initial data loading
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchReservations(),
        checkActiveReservation(),
        fetchNews()
      ]);
    };
    loadData();
  }, [fetchReservations, checkActiveReservation, fetchNews]);

  // Handle reservation updates
  useEffect(() => {
    const handleNewReservation = () => {
      fetchReservations();
      checkActiveReservation();
    };
    window.addEventListener("reservationSubmitted", handleNewReservation);
    return () => window.removeEventListener("reservationSubmitted", handleNewReservation);
  }, [fetchReservations, checkActiveReservation]);

  // Room availability modal effect
  useEffect(() => {
    if (!showAvailModal || !modalDate) return;

    const fetchAvailability = async () => {
      const manilaDateStr = getManilaDateString(modalDate);
      try {
        const { data } = await axios.get(`${RESERVATIONS_ENDPOINT}/availability`, {
          params: { date: manilaDateStr },
        });

        setRoomStatuses(
          Array.isArray(data)
            ? data.map((r) => ({
                floor: r.floor || "Unknown Floor",
                room: r.room || "Unnamed Room",
                occupied: Array.isArray(r.occupied) ? r.occupied : [],
              }))
            : []
        );
      } catch (error) {
        console.error("Availability fetch error:", error);
        setAvailError("Failed to load availability. Please try again later.");
      }
    };

    const interval = setInterval(fetchAvailability, 10000);
    fetchAvailability();

    return () => clearInterval(interval);
  }, [showAvailModal, modalDate, RESERVATIONS_ENDPOINT]);

  // Event handlers
  const handleReserveClick = () => {
    if (hasActiveRes) {
      setShowBlock(true);
    } else {
      setView("reserve");
    }
  };

  const handleDateClick = async (date) => {
    setSelectedDate(date);
    setModalDate(date);
    setAvailLoading(true);
    setAvailError("");
    setShowAvailModal(true);

    try {
      const manilaDateStr = getManilaDateString(date);
      const { data } = await axios.get(`${RESERVATIONS_ENDPOINT}/availability`, {
        params: { date: manilaDateStr },
      });

      setRoomStatuses(
        Array.isArray(data)
          ? data.map((r) => ({
              floor: r.floor || "Unknown Floor",
              room: r.room || "Unnamed Room",
              occupied: Array.isArray(r.occupied) ? r.occupied : [],
            }))
          : []
      );
    } catch (error) {
      console.error("Availability fetch error:", error);
      setAvailError("Failed to load availability. Please try again later.");
    } finally {
      setAvailLoading(false);
    }
  };

  // Calendar tile rendering
  const renderCalendarTile = ({ date, view }) => {
    if (view !== "month") return null;

    const isToday = isSameManilaDate(date, new Date());
    const hasRes = reservations.some(reservation => 
      isSameManilaDate(new Date(reservation.datetime), date)
    );

    return (
      <div
        className={`absolute inset-0 flex items-center justify-center ${
          isToday ? "bg-yellow-400/20 rounded-full" : ""
        } ${hasRes ? "bg-green-500/10" : ""}`}
        aria-label={`${date.getDate()} ${isToday ? "Today" : ""} ${hasRes ? "Has reservation" : ""}`}
      >
        {date.getDate()}
      </div>
    );
  };

  return (
    <main className="w-full md:ml-[250px] md:w-[calc(100%-250px)] min-h-screen flex flex-col bg-gray-50">
      {/* HEADER */}
      <header className="bg-[#CC0000] text-white px-6 h-[50px] flex items-center shadow-md">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </header>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
        {/* LEFT COLUMN */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Welcome banner */}
          <div className="bg-gradient-to-r from-red-700 to-red-800 shadow-lg rounded-xl w-full h-40 flex flex-col items-center justify-center text-center text-white p-6">
            <h1 className="text-3xl font-bold">Welcome back, {user?.name || "User"}!</h1>
            <p className="text-red-100 mt-2">Manage your room reservations and stay updated</p>
          </div>

          {/* News and Reservations */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* News */}
            <div className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm rounded-xl flex-1 flex flex-col p-5">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-gray-800">Latest Announcements</h1>
                
              </div>
              <div className="border-b border-gray-100 mb-4" />
              <div className="space-y-4 overflow-y-auto max-h-[300px] md:max-h-[400px] pr-2">
                {newsList.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No announcements available at this time.</p>
                  </div>
                ) : (
                  newsList.map((n) => (
                    <article key={n._id} className="p-4 border border-gray-100 rounded-lg hover:shadow transition-shadow">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                        <h2 className="font-bold text-gray-800">{n.title}</h2>
                        <time className="text-xs text-gray-500 mt-1 md:mt-0">
                          {formatPH(n.createdAt)}
                        </time>
                      </div>
                      <div className="border-b border-gray-100 mb-3" />
                      <p className="text-sm text-gray-600">{n.content}</p>
                    </article>
                  ))
                )}
              </div>
            </div>

            {/* User Reservations */}
<div className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm rounded-xl flex-1 p-5 flex flex-col h-full">
  <h2 className="text-xl font-bold text-gray-800 mb-4">Your Current Reservation</h2>
  <div className="border-b border-gray-100 mb-5" />
  {isLoading ? (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
    </div>
  ) : activeRes ? (
    <div className="overflow-y-auto flex-1">
      <section
        key={activeRes._id}
        className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow transition flex flex-col h-full"
      >
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3">
          <h3 className="text-lg font-bold text-gray-800">{activeRes.roomName}</h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold mt-2 md:mt-0 ${
              activeRes.status === "Approved"
                ? "bg-green-100 text-green-800"
                : activeRes.status === "Pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {activeRes.status}
          </span>
        </div>
        
        <div className="text-sm text-gray-700 space-y-2 flex-grow">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Location:</p>
              <p className="text-gray-600">{activeRes.location}</p>
            </div>
            <div>
              <p className="font-medium">Time:</p>
              <p className="text-gray-600">
                {formatPH(activeRes.datetime)} - {' '}
                {new Date(activeRes.endDatetime).toLocaleTimeString("en-PH", {
                  timeZone: "Asia/Manila",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>
          </div>
          
          <div>
            <p className="font-medium">Purpose:</p>
            <p className="text-gray-600">{activeRes.purpose}</p>
          </div>
          
          {activeRes.participants && activeRes.participants.length > 0 && (
            <div className="mt-4">
              <p className="font-medium mb-2">Participants:</p>
              <div className="grid grid-cols-2 gap-2">
                {activeRes.participants.map((participant, index) => (
                  <div 
                    key={index} 
                    className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg text-sm"
                  >
                    <span className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs mr-2">
                      {participant.name?.charAt(0) || participant.email?.charAt(0)}
                    </span>
                    <span className="truncate">
                      {participant.name || participant.email}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-t border-gray-100 pt-4 mt-4 text-sm">
          <span className="text-gray-500 text-xs sm:text-sm mb-2 sm:mb-0">
            Submitted: {formatPH(activeRes.createdAt)}
          </span>
          <button
            className="text-red-600 hover:text-red-800 font-medium flex items-center focus:outline-none cursor-pointer"
            onClick={() => {
              setSelectedReservation?.(activeRes);
              setView?.("reservationDetails");
            }}
            aria-label={`View details for ${activeRes.roomName} reservation`}
          >
            View details
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  ) : (
    <div className="text-center py-8 flex flex-col justify-center items-center h-full">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p className="text-gray-600">
        No active reservations.<br />
        <button 
          onClick={handleReserveClick}
          className="text-red-600 font-medium hover:underline focus:outline-none"
        >
          Reserve a room
        </button> to get started.
      </p>
    </div>
  )}
</div>
          </div>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setView("help")}
              className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm rounded-xl h-32 flex flex-col items-center justify-center text-center p-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              aria-label="Go to help center"
            >
              
              <h2 className="text-lg font-semibold text-gray-800">Help Center</h2>
              <p className="text-xs text-gray-600 mt-1">
                Get answers to your questions about the reservation system
              </p>
            </button>

            <button
              onClick={() => setView("guidelines")}
              className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm rounded-xl h-32 flex flex-col items-center justify-center text-center p-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              aria-label="View guidelines"
            >
              
              <h2 className="text-lg font-semibold text-gray-800">Room Guidelines</h2>
              <p className="text-xs text-gray-600 mt-1">
                Learn how to properly use the rooms and facilities
              </p>
            </button>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="w-full lg:w-80 flex flex-col gap-6">
          {/* Calendar */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <Calendar
              onClickDay={handleDateClick}
              value={selectedDate}
              className="border-0"
              tileContent={renderCalendarTile}
              tileClassName={({ date, view }) => {
                if (view !== "month") return "";
                return "relative h-12 hover:bg-gray-50";
              }}
              prevLabel={<span className="text-gray-600">◀</span>}
              nextLabel={<span className="text-gray-600">▶</span>}
              prev2Label={null}
              next2Label={null}
              aria-label="Reservation calendar"
            />
            <div className="mt-4 flex items-center justify-center space-x-3">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-yellow-400/20 mr-1"></div>
                <span className="text-xs text-gray-600">Today</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500/10 mr-1"></div>
                <span className="text-xs text-gray-600">Reserved</span>
              </div>
            </div>
          </div>

          {/* Reserve Room Button */}
          <button
            className={`rounded-xl w-full h-32 flex items-center justify-center transition-all duration-300 shadow-md ${
              hasActiveRes
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            }`}
            onClick={handleReserveClick}
            disabled={hasActiveRes}
            aria-label={hasActiveRes ? "You have an active reservation" : "Reserve a room"}
          >
            <div className="flex flex-col justify-center items-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h2 className="text-xl font-bold">
                {hasActiveRes ? "Reservation Active" : "Reserve Room"}
              </h2>
              {hasActiveRes && (
                <p className="text-xs font-medium mt-1 text-white/80">Check your current reservation</p>
              )}
            </div>
          </button>
        </aside>
      </div>
      
     
     <footer className="fixed bottom-0 left-0 md:left-[250px] right-0 bg-white border-t border-gray-200 shadow-sm">
  <div className="container mx-auto  flex justify-between items-center">
    <div className="text-sm text-gray-500">
      © {new Date().getFullYear()} USA-FLD CircuLink
    </div>

    <button
      onClick={() => setShowReportModal(true)}
      className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors flex items-center cursor-pointer"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      Report Problem
    </button>
  </div>
</footer>

      

      {/* Modal Component */}
      {showReportModal && (
        <ReportProblemModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          user={user}
        />
      )}
    


      {/* MODALS */}
      {showAvailModal && (
        <RoomAvailabilityModal
          selectedDate={modalDate}
          roomStatuses={roomStatuses}
          availLoading={availLoading}
          availError={availError}
          onClose={() => setShowAvailModal(false)}
        />
      )}

      {/* Active Reservation Block Modal */}
      {showBlock && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={() => setShowBlock(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="block-modal-title"
        >
          <div
            className="bg-white p-8 rounded-xl max-w-md w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 id="block-modal-title" className="text-xl font-bold text-gray-800 mt-3">
                Active Reservation Found
              </h2>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-800">{activeRes?.roomName}</h3>
              <p className="text-sm text-gray-600 mt-1">{activeRes?.location}</p>
              <p className="text-sm text-gray-600 mt-1">
                {activeRes && formatPH(activeRes.datetime)}
              </p>
            </div>
            <p className="text-gray-600 text-center mb-6">
              You can only have one active reservation at a time. Please wait until your current reservation is completed before booking another room.
            </p>
            <button
              onClick={() => setShowBlock(false)}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition w-full font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              aria-label="Close modal"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Reservation Success Modal */}
      {showSuccessModal && newReservation && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={() => setShowSuccessModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-modal-title"
        >
          <div
            className="bg-white p-8 rounded-xl max-w-md w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 id="success-modal-title" className="text-xl font-bold text-gray-800 mt-3">
                Reservation Submitted Successfully!
              </h2>
            </div>
            <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-100">
              <h3 className="font-semibold text-gray-800">{newReservation.roomName}</h3>
              <p className="text-sm text-gray-600 mt-1">{newReservation.location}</p>
              <p className="text-sm text-gray-600 mt-1">
                {formatPH(newReservation.datetime)}
              </p>
              <div className="mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  newReservation.status === "Approved"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {newReservation.status}
                </span>
              </div>
            </div>
            <p className="text-gray-600 text-center mb-6">
              {newReservation.status === "Pending" 
                ? "Your reservation is pending approval. You'll receive a notification once it's processed."
                : "Your reservation has been approved. Please arrive on time."}
            </p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => {
                  setSelectedReservation(newReservation);
                  setView("reservationDetails");
                  setShowSuccessModal(false);
                }}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition w-full font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                aria-label="View reservation details"
              >
                View Details
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition w-full font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                aria-label="Close modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Participant Conflict Modal */}
      {participantConflict && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="conflict-modal-title"
        >
          <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-xl text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-yellow-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 id="conflict-modal-title" className="text-lg font-bold text-gray-800 mb-2">
              Scheduling Conflict
            </h2>
            <p className="text-gray-600 mb-6">{participantConflict}</p>
            <button
              onClick={() => setParticipantConflict("")}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition w-full font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              aria-label="Close conflict modal"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

Dashboard.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
  }),
  setView: PropTypes.func.isRequired,
  setSelectedReservation: PropTypes.func.isRequired,
};

export default Dashboard;