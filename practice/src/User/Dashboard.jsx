import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import RoomAvailabilityModal from "./RoomAvailabilityModal";
import PropTypes from 'prop-types';

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

  // API endpoints
  const API_BASE_URL = "http://localhost:5000";
  const RESERVATIONS_ENDPOINT = `${API_BASE_URL}/reservations`;
  const NEWS_ENDPOINT = `${API_BASE_URL}/news`;

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
          isToday ? "bg-yellow-400" : ""
        } ${hasRes ? "bg-green-100" : ""}`}
        aria-label={`${date.getDate()} ${isToday ? "Today" : ""} ${hasRes ? "Has reservation" : ""}`}
      >
        {date.getDate()}
      </div>
    );
  };

  return (
    <main className="w-full md:ml-[250px] md:w-[calc(100%-250px)] min-h-screen flex flex-col">
      {/* HEADER */}
      <header className="bg-[#CC0000] text-white px-4 h-[50px] flex items-center">
        <h1 className="text-xl md:text-2xl font-semibold">Dashboard</h1>
      </header>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col lg:flex-row gap-4">
        {/* LEFT COLUMN */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Welcome banner */}
          <div className="bg-red-800 shadow-sm rounded-2xl w-full h-auto min-h-[8rem] md:h-[10rem] flex flex-col items-center justify-center text-center text-white p-4">
            <h1 className="text-2xl md:text-3xl font-semibold">Welcome, {user?.name || "User"}</h1>
            <p className="text-gray-300">We're glad you're here</p>
          </div>

          {/* News and Reservations */}
          <div className="flex flex-col md:flex-row gap-4 h-auto md:h-[25rem]">
            {/* News */}
            <div className="border border-gray-200 hover:border-gray-300 duration-200 shadow-sm rounded-2xl flex-1 flex flex-col p-4">
              <h1 className="text-lg md:text-xl font-semibold mb-4">Latest News</h1>
              <div className="border-b border-gray-200 mb-2" />
              <div className="space-y-3 overflow-y-auto max-h-[300px] md:max-h-[400px]">
                {newsList.length === 0 ? (
                  <p className="text-gray-500">No news available.</p>
                ) : (
                  newsList.map((n) => (
                    <article key={n._id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                        <h2 className="font-bold text-gray-700">{n.title}</h2>
                        <time className="text-xs text-gray-400 mt-1 md:mt-0">
                          {formatPH(n.createdAt)}
                        </time>
                      </div>
                      <div className="border-b border-gray-200 mb-2" />
                      <p className="text-sm text-gray-600">{n.content}</p>
                    </article>
                  ))
                )}
              </div>
            </div>

            {/* User Reservations */}
            <div className="border border-gray-200 hover:border-gray-300 duration-200 shadow-sm rounded-2xl flex-1 p-4 overflow-y-auto bg-white">
              <h2 className="text-lg font-semibold mb-4">Your Reservations</h2>
              <div className="border-b border-gray-100 mb-5" />
              {isLoading ? (
                <p>Loading...</p>
              ) : reservations.length === 0 ? (
                <p className="text-gray-500 text-sm text-center">
                  You haven't made any reservations yet.<br />
                  Click <span className="font-medium text-gray-600">"Reserve Room"</span> to book a room and get started.
                </p>
              ) : (
                <div className="flex flex-col space-y-4 h-[18rem]">
                  <section
                    key={reservations[0]._id}
                    className="border border-gray-200 rounded-xl p-4 md:p-5 bg-white shadow-sm hover:shadow transition flex flex-col justify-between h-full"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                      <h3 className="text-base md:text-lg font-bold">{reservations[0].roomName}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-sm text-sm font-medium mt-1 md:mt-0 ${
                          reservations[0].status === "Approved"
                            ? "bg-green-100 text-green-700"
                            : reservations[0].status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {reservations[0].status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 flex-1 space-y-1">
                      <p><span className="font-medium">Location:</span> {reservations[0].location}</p>
                      <p>
                        <span className="font-medium">Schedule:</span>{" "}
                        {formatPH(reservations[0].datetime)}
                        {" - "}
                        {new Date(reservations[0].endDatetime).toLocaleTimeString("en-PH", {
                          timeZone: "Asia/Manila",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                      <p><span className="font-medium">Purpose:</span> {reservations[0].purpose}</p>
                    </div>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center border-t border-gray-100 pt-3 mt-3 text-xs">
                      <span className="italic mb-1 md:mb-0">Submitted: {formatPH(reservations[0].createdAt)}</span>
                      <button
                        className="text-[#CC0000] hover:underline cursor-pointer"
                        onClick={() => {
                          setSelectedReservation?.(reservations[0]);
                          setView?.("reservationDetails");
                        }}
                        aria-label="View reservation details"
                      >
                        View details
                      </button>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>

          {/* Help / Guidelines cards */}
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={() => setView("help")}
              className="border border-gray-200 hover:border-gray-300 duration-200 shadow-sm rounded-2xl flex-1 h-[8rem] md:h-[10rem] flex flex-col items-center justify-center text-center px-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Go to help center"
            >
              <h2 className="text-lg font-semibold">Help Center</h2>
              <p className="text-xs text-gray-600 mt-1 leading-tight">
                Need help? Find answers to common questions and how to use the reservation system easily.
              </p>
            </button>

            <button
              onClick={() => setView("guidelines")}
              className="border border-gray-200 hover:border-gray-300 duration-200 shadow-sm rounded-2xl flex-1 h-[8rem] md:h-[10rem] flex flex-col items-center justify-center text-center px-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="View guidelines"
            >
              <h2 className="text-lg font-semibold">Guidelines</h2>
              <p className="text-xs text-gray-600 mt-1 leading-tight">
                Quick tips and rules to help you use the rooms properly and keep things easy for everyone.
              </p>
            </button>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="w-full md:w-[15rem] lg:w-[20rem] flex flex-col gap-4">
          <div className="border-1 rounded-2xl border-gray-200 shadow-sm">
            <Calendar
              onClickDay={handleDateClick}
              value={selectedDate}
              className="calendar-custom"
              tileContent={renderCalendarTile}
              tileClassName={({ date, view }) => {
                if (view !== "month") return "";
                return "relative h-12";
              }}
              aria-label="Reservation calendar"
            />
          </div>

          {/* Reserve Room Button */}
          <button
            className={`border border-gray-200 shadow-sm rounded-2xl w-full h-[10rem] flex items-center justify-center duration-800 ${
              hasActiveRes
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-red-200 hover:border-gray-300 hover:bg-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
            }`}
            onClick={handleReserveClick}
            disabled={hasActiveRes}
            aria-label={hasActiveRes ? "You have an active reservation" : "Reserve a room"}
          >
            <div className="flex flex-col justify-center items-center">
              <h2
                className={`font-semibold font-sans text-lg ${
                  hasActiveRes ? "text-gray-100" : "text-[#CC0000]"
                }`}
              >
                {hasActiveRes ? "Reservation Active" : "Reserve Room"}
              </h2>
            </div>
          </button>
        </aside>
      </div>

      {/* MODALS */}
      {showAvailModal && (
        <RoomAvailabilityModal
          selectedDate={modalDate}
          roomStatuses={roomStatuses}
          availLoading={availLoading}
          availError={availError}
          onClose={() => setShowAvailModal(false)}
          user={user}
          setView={setView}
        />
      )}

      {showBlock && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowBlock(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="block-modal-title"
        >
          <div
            className="bg-white p-8 rounded-xl text-center max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="block-modal-title" className="text-xl font-semibold mb-4">
              You already have a reservation
            </h2>
            <p className="text-sm mb-6">
              {activeRes?.roomName} • {activeRes?.location} •{" "}
              {activeRes && formatPH(activeRes.datetime)}
              <br /><br />
              Please wait until your current session ends before booking again.
            </p>
            <button
              onClick={() => setShowBlock(false)}
              className="bg-[#CC0000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Close modal"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {participantConflict && (
        <div 
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="conflict-modal-title"
        >
          <div className="bg-white p-6 rounded-xl w-full max-w-sm text-center">
            <h2 id="conflict-modal-title" className="text-lg md:text-xl font-semibold mb-4">
              Reservation Conflict
            </h2>
            <p className="text-sm mb-6">{participantConflict}</p>
            <button
              onClick={() => setParticipantConflict("")}
              className="bg-[#CC0000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition w-full focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Close conflict modal"
            >
              OK
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