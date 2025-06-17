// Dashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

// Simple month‑view calendar
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

/* Helper: format created_at → “June 13 2025, 02:15 PM” */
const formatPH = (date) =>
  new Date(date).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

function Dashboard({ user, setView, setSelectedReservation }) {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newsList, setNewsList] = useState([]); // <-- news list state

  const [selectedDate, setSelectedDate] = useState(new Date());

  /* Fetch user reservations */
  useEffect(() => {
    if (!user?._id) {
      setReservations([]);
      return;
    }

    setIsLoading(true);
    axios
      .get(`http://localhost:5000/reservations/user/${user._id}`)
      .then((res) => {
        const sorted = res.data.sort(
          (a, b) => new Date(b.datetime) - new Date(a.datetime)
        );
        setReservations(sorted);
      })
      .catch((err) => console.error("Failed to fetch reservations:", err))
      .finally(() => setIsLoading(false));
  }, [user]);

  /* Fetch news list */
  useEffect(() => {
    axios
      .get("http://localhost:5000/news")
      .then((res) => setNewsList(res.data))
      .catch((err) => console.error("Failed to fetch news:", err));
  }, []);

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#CC0000] text-white pl-5 h-[50px] flex items-center">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 flex gap-4">
        {/* Left column */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Welcome card */}
          <div className="bg-red-800 shadow-sm rounded-2xl w-full h-[10rem] flex items-center justify-center flex-col text-center text-white p-4">
            <h1 className="text-3xl font-semibold text-white">
              Welcome, {user?.name}
            </h1>
            <p className="text-gray-300">We're Glad you here</p>
          </div>

          {/* News + Reservations */}
          <div className="flex gap-4 h-[25rem]">
            {/* News */}
            <div className="border border-gray-200 hover:border-gray-300 duration-200 shadow-sm rounded-2xl flex-1 flex flex-col p-4">
              <h1 className="text-xl font-semibold mb-4">Latest News</h1>
                <div className="border-b border-gray-200 mb-2"></div>

              <div className="space-y-3 overflow-y-auto max-h-[400px]">
                {newsList.length === 0 ? (
                  <p className="text-gray-500">No news available.</p>
                ) : (
                  newsList.map((news) => (
                    <div
                      key={news._id}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                      
                      <h2 className="font-bold text-gray-800">{news.title}</h2>
                      <p className="text-xs text-end text-gray-400 mt-1">
                        {new Date(news.createdAt).toLocaleString()}
                      </p>
                      </div>

                      <div className="border-b border-gray-200 mb-2"></div>
                      <p className="text-sm text-gray-600">{news.content}</p>
                      
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Reservations */}
            <div className="border border-gray-200 hover:border-gray-300 duration-200 shadow-sm rounded-2xl flex-1 p-4 overflow-y-auto bg-white">
              <h2 className="text-lg font-semibold mb-4">
                Your Reservations
              </h2>
              <div className="border-b border-gray-100 mb-5"></div>

              {isLoading ? (
                <p>Loading reservations…</p>
              ) : reservations.length === 0 ? (
                <p>No reservations yet.</p>
              ) : (
                <div className="space-y-3">
                  {reservations.map((res) => {
                    const start = new Date(res.datetime);
                    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

                    const dateOnly = start.toLocaleDateString("en-PH", {
                      timeZone: "Asia/Manila",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });

                    const startTime = start.toLocaleTimeString("en-PH", {
                      timeZone: "Asia/Manila",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    });

                    const endTime = end.toLocaleTimeString("en-PH", {
                      timeZone: "Asia/Manila",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    });

                    return (
                      <div
                        key={res._id}
                        className="border border-gray-200 rounded-lg p-3  hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm mb-1">
                              <span className="font-medium">Reserved&nbsp;for:</span>{" "}
                              {dateOnly} - {startTime} to {endTime}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Room:</span>{" "}
                              {res.roomName} at {res.location}
                            </p>
                            <p className="text-sm mt-1">
                              Status:{" "}
                              <span
                                className={`font-medium ${
                                  res.status === "Approved"
                                    ? "text-green-600"
                                    : res.status === "Pending"
                                    ? "text-yellow-600"
                                    : res.status === "Rejected"
                                    ? "text-red-600"
                                    : "text-blue-600"
                                }`}
                              >
                                {res.status}
                              </span>
                            </p>
                          </div>
                          <div className="flex flex-col justify-between items-end h-full">
                            <button
                              onClick={() => {
                                setSelectedReservation?.(res);
                                setView?.("reservationDetails");
                              }}
                              className="text-[#CC0000] font-semibold hover:underline text-sm whitespace-nowrap"
                            >
                              View&nbsp;Details
                            </button>
                            <p className="text-xs italic text-gray-500">
                              Submitted: {formatPH(res.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Help & Guidelines */}
          <div className="flex gap-4">
            <div className="border border-gray-200 hover:border-gray-300 duration-200 shadow-sm rounded-2xl flex-1 h-[10rem] flex items-center justify-center">
              <h1>Help&nbsp;Center</h1>
            </div>
            <div className="border border-gray-200 hover:border-gray-300 duration-200 shadow-sm rounded-2xl flex-1 h-[10rem] flex items-center justify-center">
              <h1>Guidelines</h1>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-[15rem] flex flex-col gap-4">
          {/* Calendar card */}
          <div className="shadow border border-gray-200 rounded-2xl bg-white hover:border-gray-300 duration-200">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              className={"w-full"}
              tileClassName={({ date }) => {
                const today = new Date();
                if (
                  date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear()
                ) {
                  return "bg-red-100 text-red-800 font-bold rounded-lg";
                }
              }}
            />
          </div>

          {/* Schedule placeholder */}
          <div className="border border-gray-200 hover:border-gray-300 duration-200 shadow-sm rounded-2xl w-full h-[20rem] flex items-center justify-center bg-white">
            <h1>Schedule</h1>
          </div>

          {/* Reserve Room CTA */}
          <div
            onClick={() => setView("reserve")}
            className="border border-gray-200 hover:border-gray-300 duration-200 shadow-sm rounded-2xl w-full h-[10rem] flex items-center justify-center bg-red-100 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <h1 className="text-[#CC0000] font-semibold">Reserve&nbsp;Room</h1>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
