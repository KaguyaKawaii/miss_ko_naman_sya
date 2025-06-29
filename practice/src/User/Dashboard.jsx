import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const formatPH = (d) =>
  new Date(d).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const groupByFloor = (data = []) => {
  const grouped = {};
  data.forEach(({ floor, room, occupied }) => {
    if (!grouped[floor]) grouped[floor] = [];
    grouped[floor].push({ room, occupied });
  });
  return grouped;
};

function Dashboard({ user, setView, setSelectedReservation }) {

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
  const [timeSlots, setTimeSlots] = useState([]);
  const [participantConflict, setParticipantConflict] = useState("");

const fetchReservations = useCallback(() => {
  if (!user?._id) {
    console.warn("User ID is missing. Cannot fetch reservations.");
    return;
  }

  console.log("Fetching reservations for user:", user._id);
  setIsLoading(true); // <-- make sure it starts loading

  axios
    .get(`http://localhost:5000/reservations/user-participating/${user._id}`)
    .then(({ data }) => {
      console.log("Fetched reservations:", data);
      const sorted = data.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
      setReservations(sorted);
      if (sorted.length > 0) setSelectedReservation(sorted[0]);

      const active = sorted.find(
        (r) =>
          ["Approved", "Pending"].includes(r.status) &&
          new Date(r.endDatetime) >= new Date()
      );
      setHasActiveRes(!!active);
      setActiveRes(active || null);
    })
    .catch((err) => {
      console.error("Reservations fetch error:", err);
    })
    .finally(() => {
      setIsLoading(false);  // <-- finally stop loading here
    });
}, [user, setSelectedReservation]);


const checkActiveReservation = useCallback(async () => {
  if (!user?._id) return null;
  try {
    const { data } = await axios.get(`http://localhost:5000/reservations/user-has-any/${user._id}`);
    if (data) {
      const now = new Date();
      const resDate = new Date(data.datetime);
      const isSameDay =
        resDate.getFullYear() === now.getFullYear() &&
        resDate.getMonth() === now.getMonth() &&
        resDate.getDate() === now.getDate();

      if (isSameDay) {
        setHasActiveRes(true);
        setActiveRes(data);
        return data;
      } else {
        setHasActiveRes(false);
        setActiveRes(null);
        return null;
      }
    } else {
      setHasActiveRes(false);
      setActiveRes(null);
      return null;
    }
  } catch (e) {
    console.error("check reservation today error:", e);
    setHasActiveRes(false);
    setActiveRes(null);
    return null;
  }
}, [user]);




  useEffect(() => {
    fetchReservations();
    checkActiveReservation();
    axios.get("http://localhost:5000/news").then(({ data }) => setNewsList(data)).catch(console.error);
  }, [fetchReservations, checkActiveReservation]);

  useEffect(() => {
    const handleNewReservation = () => {
      fetchReservations();
      checkActiveReservation();
    };
    window.addEventListener("reservationSubmitted", handleNewReservation);
    return () => window.removeEventListener("reservationSubmitted", handleNewReservation);
  }, [fetchReservations, checkActiveReservation]);

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
      const yyyyMmDd = date.toISOString().substring(0, 10);
      const { data } = await axios.get("http://localhost:5000/api/availability", {
        params: { date: yyyyMmDd, userId: user._id },
      });
      setTimeSlots(Array.isArray(data.timeSlots) ? data.timeSlots : []);
      setRoomStatuses(
        Array.isArray(data.availability)
          ? data.availability.map((r) => ({
              floor: r.floor ?? "Unknown Floor",
              room: r.room ?? "Unnamed Room",
              occupied: Array.isArray(r.occupied) ? r.occupied : [],
            }))
          : []
      );
    } catch (err) {
      console.error("availability fetch error:", err);
      setAvailError("Failed to load availability.");
    } finally {
      setAvailLoading(false);
    }
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
            <h1 className="text-2xl md:text-3xl font-semibold">Welcome, {user?.name}</h1>
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
                    <div
                      key={n._id}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                        <h2 className="font-bold text-gray-800">{n.title}</h2>
                        <p className="text-xs text-gray-400 mt-1 md:mt-0">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="border-b border-gray-200 mb-2" />
                      <p className="text-sm text-gray-600">{n.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* User Reservations */}
            <div className="border border-gray-200 hover:border-gray-300 duration-200 shadow-sm rounded-2xl flex-1 p-4 overflow-y-auto bg-white">
              <h2 className="text-lg font-semibold mb-4">Your Reservations</h2>
              <div className="border-b border-gray-100 mb-5" />
             {isLoading ? (
  <p>Loading…</p>
) : reservations.length === 0 ? (
  <p>No reservations yet.</p>
) : (
  <div className="flex flex-col space-y-4 h-[18rem]">
    <div
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
          {new Date(reservations[0].datetime).toLocaleDateString("en-PH", {
            timeZone: "Asia/Manila",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
          ,{" "}
          {new Date(reservations[0].datetime).toLocaleTimeString("en-PH", {
            timeZone: "Asia/Manila",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
          ‒
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
        >
          View details
        </button>
      </div>
    </div>
  </div>
)}

            </div>
          </div>

          {/* Help / Guidelines cards */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="border border-gray-200 hover:border-gray-300 duration-200 shadow-sm rounded-2xl flex-1 h-[8rem] md:h-[10rem] flex items-center justify-center">
              <h1>Help Center</h1>
            </div>
            <div className="border border-gray-200 hover:border-gray-300 duration-200 shadow-sm rounded-2xl flex-1 h-[8rem] md:h-[10rem] flex items-center justify-center">
              <h1>Guidelines</h1>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-full md:w-[15rem] lg:w-[20rem] flex flex-col gap-4">
          {/* Calendar */}
          <div className="shadow border border-gray-200 rounded-2xl bg-white hover:border-gray-300 duration-200">
            <Calendar
              onClickDay={handleDateClick}
              value={selectedDate}
              tileClassName={({ date }) => {
                const today = new Date();
                const isToday = date.toDateString() === today.toDateString();

                const hasRes = reservations.some(
                  (r) => new Date(r.datetime).toDateString() === date.toDateString()
                );

                return [
                  isToday && "bg-red-100 text-red-800 font-bold rounded-lg",
                  hasRes && "bg-green-100 font-semibold",
                ]
                  .filter(Boolean)
                  .join(" ");
              }}
            />
          </div>

          {/* Reserve Room Button */}
          <div
  className={`border border-gray-200 shadow-sm rounded-2xl w-full h-[10rem] flex items-center justify-center duration-800 ${
    hasActiveRes
      ? "bg-gray-500 cursor-not-allowed"
      : "bg-red-200 hover:border-gray-300 hover:bg-gray-100 cursor-pointer"
  }`}
  onClick={handleReserveClick}
>
  <div className="flex flex-col justify-center items-center">
  
  <h1
    className={`font-semibold font-sans text-lg ${
      hasActiveRes ? "text-gray-100" : "text-[#CC0000]"
    }`}
  >
    {hasActiveRes ? "Reservation Active" : "Reserve Room"}
  </h1>
  </div>
</div>

        </div>
      </div>

      {/* BLOCK MODAL */}
      {showBlock && (
  <div
    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    onClick={() => setShowBlock(false)}
  >
    <div
      className="bg-white p-8 rounded-xl  text-center"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-xl font-semibold mb-4">
        You already have a reservation
      </h2>
      <p className="text-sm mb-6">
        {activeRes?.roomName} • {activeRes?.location} •{" "}
        {activeRes &&
          new Date(activeRes.datetime).toLocaleString("en-PH", {
            timeZone: "Asia/Manila",
            month: "long",
      day: "numeric",
      hour: "2-digit",
            minute: "2-digit",
      hour12: true,
          })}
        <br />
        <br />
        Please wait until your current session ends before booking again.
      </p>
      <button
        onClick={() => setShowBlock(false)}
        className="bg-[#CC0000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition w-[15rem] cursor-pointer"
      >
        OK
      </button>
    </div>
  </div>
)}


      {/* AVAILABILITY MODAL */}
      {showAvailModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg md:text-xl font-semibold mb-4">
              Availability •{" "}
              {modalDate.toLocaleDateString("en-PH", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h2>

            {availLoading ? (
              <p>Loading…</p>
            ) : availError ? (
              <p className="text-red-600">{availError}</p>
            ) : roomStatuses.length === 0 ? (
              <p>No room information found.</p>
            ) : (
              Object.entries(groupByFloor(roomStatuses)).map(([floor, rooms]) => (
                <div key={floor} className="mb-6">
                  <h3 className="font-semibold mb-2">{floor}</h3>
                  <div className="space-y-2">
                    {rooms.map(({ room, occupied }) => (
                      <div
                        key={room}
                        className="border border-gray-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span className="font-medium">{room}</span>
                        {occupied.length === 0 ? (
                          <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs mt-2 sm:mt-0">
                            Vacant all day
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1 mt-2 sm:mt-0">
                            {occupied.map((o) => (
                              <span
                                key={o.slot}
                                className={`px-2 py-0.5 rounded-full text-xs ${
                                  o.mine
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {o.slot} {o.mine ? "You" : o.who} ({o.status})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}

            <button
              onClick={() => setShowAvailModal(false)}
              className="mt-4 w-full bg-[#CC0000] text-white py-2 rounded-lg hover:bg-red-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {participantConflict && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm text-center">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Reservation Conflict</h2>
            <p className="text-sm mb-6">{participantConflict}</p>
            <button onClick={() => setParticipantConflict("")} className="bg-[#CC0000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
              OK
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Dashboard;