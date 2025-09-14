import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import RoomAvailabilityModal from "./RoomAvailabilityModal";
import PropTypes from 'prop-types';
import ReportProblemModal from "./Modals/ReportProblemModal";

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
  const [currentReservationPage, setCurrentReservationPage] = useState(1);
  const [reservationsPerPage] = useState(1);
  

  
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
        const today = new Date();
        const todayReservations = Array.isArray(data) 
          ? data.filter(r => isSameManilaDate(r.datetime, today))
          : [data].filter(r => isSameManilaDate(r.datetime, today));
        
        setHasActiveRes(todayReservations.length > 0);
        setActiveRes({
          ...(todayReservations[0] || {}),
          dayReservationCount: todayReservations.length
        });
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
    if (activeRes?.dayReservationCount >= 2) {
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

  // Get current reservations for pagination
  const indexOfLastReservation = currentReservationPage * reservationsPerPage;
  const indexOfFirstReservation = indexOfLastReservation - reservationsPerPage;
  const currentReservations = reservations.slice(indexOfFirstReservation, indexOfLastReservation);
  const totalPages = Math.ceil(reservations.length / reservationsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentReservationPage(pageNumber);

  return (
    <main className="w-full md:ml-[250px] md:w-[calc(100%-250px)] min-h-screen flex flex-col bg-[#FFFCFB]">
      {/* HEADER */}
      <header className=" text-black px-6 h-[60px] flex items-center justify-between shadow-sm">
  <h1 className="text-xl md:text-2xl font-bold tracking-wide">Dashboard</h1>
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

<div className="flex w-[200px] justify-between bg-white shadow-md p-1 rounded-3xl mb-1">
  <button
    onClick={() => setView("dashboard")}
    className={`px-4 py-2 rounded-3xl font-semibold transition-all duration-300 shadow-lg ${
      "dashboard" === "dashboard" 
        ? "bg-red-600 text-white" 
        : "text-gray-700 hover:bg-gray-200"
    }`}
  >
    Dashboard
  </button>

  <button
    onClick={() => setView("news")}
    className={`px-4 py-2 rounded-3xl font-semibold transition-all duration-300 cursor-pointer ${
      "dashboard" === "news" 
        ? "bg-red-600 text-white" 
        : "text-gray-700 hover:bg-gray-200"
    }`}
  >
    News
  </button>
</div>


          {/* News and Reservations */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* News */}
            

            {/* User Reservations */}
           <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200/75 hover:border-gray-300/75 transition-all duration-300 shadow-lg hover:shadow-xl rounded-2xl flex-1 p-6 flex flex-col h-full">

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Your Reservations</h2>
                

                {/* Pagination controls */}
                  {reservations.length > reservationsPerPage && (
                    <div className="flex justify-center items-center">
                      <button
  onClick={() => paginate(currentReservationPage - 1)}
  disabled={currentReservationPage === 1}
  className={`font-bold px-2 py-2 mx-1 rounded-full ${
    currentReservationPage === 1
      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
      : "bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer duration-300"
  }`}
  aria-label="Previous page"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
</button>

                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`font-semibold px-3 py-1 mx-1 rounded-full ${
                            currentReservationPage === number
                              ? "bg-[#E62727] text-white cursor-pointer"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer duration-300"
                          }`}
                          aria-label={`Go to page ${number}`}
                        >
                          {number}
                        </button>
                      ))}
                      
                      <button
  onClick={() => paginate(currentReservationPage + 1)}
  disabled={currentReservationPage === totalPages}
  className={`font-bold px-2 py-2 mx-1 rounded-full ${
    currentReservationPage === totalPages
      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
      : "bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer duration-300"
  }`}
  aria-label="Next page"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
</button>

                    </div>
                  )}
              </div>
              <div className="border-b border-gray-200 mb-5" />
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                </div>
              ) : reservations.length > 0 ? (
                <div className=" flex-1">
                  {currentReservations.map((reservation) => (
                    <section
                      key={reservation._id}
                      className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow transition flex flex-col h-full mb-4"
                    >
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-3">
                        <h3 className="text-lg font-bold text-gray-800">{reservation.roomName}</h3>
                        <span
                          className={`px-2 py-2 w-[150px] text-center rounded-full text-sm font-semibold mt-2 md:mt-0 ${
                            reservation.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : reservation.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {reservation.status}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-700 space-y-2 flex-grow">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium">Location:</p>
                            <p className="text-gray-600">{reservation.location}</p>
                          </div>
                          <div>
                            <p className="font-medium">Time:</p>
                            <p className="text-gray-600">
                              {formatPH(reservation.datetime)} to {' '}
                              {new Date(reservation.endDatetime).toLocaleTimeString("en-PH", {
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
                          <p className="text-gray-600">{reservation.purpose}</p>
                        </div>
                        
                        {reservation.participants && reservation.participants.length > 0 && (
                          <div className="mt-4">
                            <p className="font-medium mb-2">Participants:</p>
                            <div className="grid grid-cols-2 gap-2">
                              {reservation.participants.map((participant, index) => (
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
                          Submitted: {formatPH(reservation.createdAt)}
                        </span>
                        <button
                          className="text-red-600 hover:text-red-800 font-medium flex items-center focus:outline-none cursor-pointer"
                          onClick={() => {
                            setSelectedReservation?.(reservation);
                            setView?.("reservationDetails");
                          }}
                          aria-label={`View details for ${reservation.roomName} reservation`}
                        >
                          View details
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </section>
                  ))}

                  
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

          
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="w-full lg:w-80 flex flex-col gap-6">
          {/* Calendar */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">

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
  className={`relative overflow-hidden rounded-2xl w-full h-36 flex items-center justify-center transition-all duration-300 shadow-lg ${
    activeRes?.dayReservationCount >= 2
      ? "bg-gray-300 cursor-not-allowed"
      : "bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 cursor-pointer focus:outline-none focus:ring-4 focus:ring-red-300 focus:ring-opacity-50"
  }`}
  onClick={handleReserveClick}
  disabled={activeRes?.dayReservationCount >= 2}
  aria-label={
    activeRes?.dayReservationCount >= 2
      ? "Reservation limit reached"
      : "Reserve a room"
  }
>
  {/* Subtle animated glow */}
  {!activeRes?.dayReservationCount >= 2 && (
    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-30 animate-pulse transition-all duration-300" />
  )}

  <div className="flex flex-col justify-center items-center text-white relative z-10 transition-all duration-300">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-10 w-10 mb-2 drop-shadow-md transition-all duration-300"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
      />
    </svg>
    <h2 className="text-2xl font-bold tracking-wide transition-all duration-300">
      {hasActiveRes ? "Reservation Active" : "Reserve Room"}
    </h2>
    {activeRes?.dayReservationCount >= 2 ? (
      <p className="text-sm font-medium mt-1 text-white/90 transition-all duration-300">
        Limit reached (2/day)
      </p>
    ) : hasActiveRes ? (
      <p className="text-sm font-medium mt-1 text-white/90 transition-all duration-300">
        Check your current reservation
      </p>
    ) : (
      <p className="text-sm font-medium mt-1 text-white/90 transition-all duration-300">
        Tap to create a reservation
      </p>
    )}
  </div>
</button>

        </aside>
      </div>
      
      <footer className="fixed bottom-0 left-0 md:left-[250px] right-0 ">
  <div className="  px-5 py-2 flex justify-between items-center">
    {/* Copyright */}
    <div className="text-sm text-gray-500">
      © {new Date().getFullYear()} <span className="font-semibold">USA-FLD CircuLink</span>
    </div>

    {/* Report Button */}
    <button
      onClick={() => setShowReportModal(true)}
      className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-red-800 transition-all duration-300 cursor-pointer"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
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