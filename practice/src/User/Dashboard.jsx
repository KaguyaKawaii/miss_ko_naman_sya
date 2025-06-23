import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/* Dashboard Component                                                */
/* ------------------------------------------------------------------ */
function Dashboard({ user, setView, setSelectedReservation }) {
  /* -------------------------- state -------------------------- */
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newsList, setNewsList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [hasActiveRes, setHasActiveRes] = useState(false);
  const [activeRes, setActiveRes] = useState(null);
  const [showBlock, setShowBlock] = useState(false);

  // Availability modal state
  const [showAvailModal, setShowAvailModal] = useState(false);
  const [roomStatuses, setRoomStatuses] = useState([]);
  const [modalDate, setModalDate] = useState(new Date());
  const [availLoading, setAvailLoading] = useState(false);
  const [availError, setAvailError] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);

  /* -------------------------- fetch reservations -------------------------- */
  const fetchReservations = useCallback(() => {
    if (!user?._id) return;
    setIsLoading(true);
    axios
      .get(`http://localhost:5000/reservations/user/${user._id}`)
      .then(({ data }) => {
        // Sort reservations descending by date/time
        const sorted = data.sort(
          (a, b) => new Date(b.datetime) - new Date(a.datetime)
        );
        setReservations(sorted);
      })
      .catch((e) => console.error("reservations fetch error:", e))
      .finally(() => setIsLoading(false));
  }, [user]);

  /* Refresh reservations on custom event */
  useEffect(() => {
    const handleNewReservation = () => fetchReservations();
    window.addEventListener("reservationSubmitted", handleNewReservation);
    return () => {
      window.removeEventListener("reservationSubmitted", handleNewReservation);
    };
  }, [fetchReservations]);

  /* -------------------------- check active reservation -------------------------- */
  useEffect(() => {
    if (!user?._id) return;
    axios
      .get(`http://localhost:5000/reservations/active/${user._id}`)
      .then(({ data }) => {
        if (data) {
          setHasActiveRes(true);
          setActiveRes(data);
        } else {
          setHasActiveRes(false);
          setActiveRes(null);
        }
      })
      .catch((e) => console.error("active reservation check:", e));
  }, [user]);

  /* Initial fetch */
  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  /* Fetch news */
  useEffect(() => {
    axios
      .get("http://localhost:5000/news")
      .then(({ data }) => setNewsList(data))
      .catch((e) => console.error("news fetch error:", e));
  }, []);

  /* -------------------------- handlers -------------------------- */
  const handleReserveClick = async () => {
    if (hasActiveRes) return setShowBlock(true);

    try {
      const { data } = await axios.get(
        `http://localhost:5000/reservations/active/${user._id}`
      );
      if (data) {
        setHasActiveRes(true);
        setActiveRes(data);
        return setShowBlock(true);
      }
      setView("reserve", fetchReservations);
    } catch {
      setView("reserve", fetchReservations);
    }
  };

  /* Fetch availability for selected date & show modal */
  const handleDateClick = async (date) => {
    setSelectedDate(date);
    setModalDate(date);
    setAvailLoading(true);
    setAvailError("");
    setShowAvailModal(true);

    try {
      const yyyyMmDd = date.toISOString().substring(0, 10);
      const { data } = await axios.get(
        "http://localhost:5000/api/availability",
        { params: { date: yyyyMmDd, userId: user._id } }
      );

      setTimeSlots(Array.isArray(data.timeSlots) ? data.timeSlots : []);

      const normalizedAvailability = Array.isArray(data.availability)
        ? data.availability.map((r) => ({
            floor: r.floor ?? "Unknown Floor",
            room: r.room ?? "Unnamed Room",
            occupied: Array.isArray(r.occupied) ? r.occupied : [],
          }))
        : [];

      setRoomStatuses(normalizedAvailability);
    } catch (err) {
      console.error("availability fetch error:", err);
      setAvailError("Failed to load availability.");
    } finally {
      setAvailLoading(false);
    }
  };

  /* -------------------------- UI -------------------------- */
  return (
    <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
      {/* HEADER */}
      <header className="bg-[#CC0000] text-white pl-5 h-[50px] flex items-center">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </header>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-4 flex gap-4">
        {/* LEFT COLUMN */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Welcome banner */}
          <div className="bg-red-800 shadow-sm rounded-2xl w-full h-[10rem] flex flex-col items-center justify-center text-center text-white p-4">
            <h1 className="text-3xl font-semibold">Welcome, {user?.name}</h1>
            <p className="text-gray-300">We're glad you're here</p>
          </div>

          {/* News and Reservations */}
          <div className="flex gap-4 h-[25rem]">
            {/* News */}
            <div className="border border-gray-200 hover:border-gray-300 duration-200 shadow-sm rounded-2xl flex-1 flex flex-col p-4">
              <h1 className="text-xl font-semibold mb-4">Latest News</h1>
              <div className="border-b border-gray-200 mb-2" />
              <div className="space-y-3 overflow-y-auto max-h-[400px]">
                {newsList.length === 0 ? (
                  <p className="text-gray-500">No news available.</p>
                ) : (
                  newsList.map((n) => (
                    <div
                      key={n._id}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h2 className="font-bold text-gray-800">{n.title}</h2>
                        <p className="text-xs text-gray-400 mt-1">
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
                  {reservations.map((r) => {
                    const start = new Date(r.datetime);
                    const end = new Date(r.endDatetime);

                    const badgeClass =
                      r.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : r.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700";

                    return (
                      <div
                        key={r._id}
                        className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow transition flex flex-col justify-between h-full"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-bold">{r.roomName}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}
                          >
                            {r.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 flex-1 space-y-1">
                          <p>
                            <span className="font-medium">Location:</span> {r.location}
                          </p>
                          <p>
                            <span className="font-medium">Schedule:</span>{" "}
                            {start.toLocaleDateString("en-PH", {
                              timeZone: "Asia/Manila",
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                            ,{" "}
                            {start.toLocaleTimeString("en-PH", {
                              timeZone: "Asia/Manila",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                            ‒
                            {end.toLocaleTimeString("en-PH", {
                              timeZone: "Asia/Manila",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </p>
                          <p>
                            <span className="font-medium">Purpose:</span> {r.purpose}
                          </p>
                        </div>
                        <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-3 text-xs">
                          <span className="italic">
                            Submitted: {formatPH(r.createdAt)}
                          </span>
                          <button
                            className="text-[#CC0000] hover:underline"
                            onClick={() => {
                              setSelectedReservation?.(r);
                              setView?.("reservationDetails");
                            }}
                          >
                            View details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Help / Guidelines cards */}
          <div className="flex gap-4">
            <div className="border border-gray-200 hover:border-gray-300 duration-200 shadow-sm rounded-2xl flex-1 h-[10rem] flex items-center justify-center">
              <h1>Help Center</h1>
            </div>
            <div className="border border-gray-200 hover:border-gray-300 duration-200 shadow-sm rounded-2xl flex-1 h-[10rem] flex items-center justify-center">
              <h1>Guidelines</h1>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-[15rem] flex flex-col gap-4">
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

          {/* Schedule Placeholder
          <div className="border border-gray-200 hover:border-gray-300 duration-200 shadow-sm rounded-2xl w-full h-[20rem] flex items-center justify-center bg-white">
            <h1>Schedule of the day</h1>
          </div> */}

          {/* Reserve Room Button */}
          <div
            onClick={handleReserveClick}
            className={`border border-gray-200 shadow-sm rounded-2xl w-full h-[10rem] flex items-center justify-center duration-200 ${
              hasActiveRes
                ? "bg-gray-200 cursor-not-allowed"
                : "bg-red-100 cursor-pointer hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <h1
              className={`font-semibold ${
                hasActiveRes ? "text-gray-500" : "text-[#CC0000]"
              }`}
            >
              Reserve Room
            </h1>
          </div>
        </div>
      </div>

      {/* BLOCK MODAL if user already has active reservation */}
      {showBlock && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl w-full max-w-sm text-center">
            <h2 className="text-xl font-semibold mb-4">
              You already have a reservation
            </h2>
            <p className="text-sm mb-6">
              {activeRes?.roomName} • {activeRes?.location} •{" "}
              {activeRes &&
                new Date(activeRes.datetime).toLocaleString("en-PH", {
                  timeZone: "Asia/Manila",
                })}
              <br />
              <br />
              Please wait until your current session ends before booking again.
            </p>
            <button
              onClick={() => setShowBlock(false)}
              className="bg-[#CC0000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* AVAILABILITY MODAL */}
      {showAvailModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
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
    </main>
  );
}

export default Dashboard;
