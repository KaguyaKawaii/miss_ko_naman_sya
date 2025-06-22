// Dashboard.jsx
import React, { useState, useEffect } from "react";
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

function Dashboard({ user, setView, setSelectedReservation }) {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newsList, setNewsList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [hasActiveRes, setHasActiveRes] = useState(false);
  const [activeRes, setActiveRes] = useState(null);
  const [showBlock, setShowBlock] = useState(false);

  const fetchReservations = () => {
    if (!user?._id) return;
    setIsLoading(true);
    axios
      .get(`http://localhost:5000/reservations/user/${user._id}`)
      .then((r) =>
        setReservations(
          r.data.sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
        )
      )
      .catch((e) => console.error("reservations fetch:", e))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (!user?._id) return;
    axios
      .get(`http://localhost:5000/reservations/active/${user._id}`)
      .then(({ data }) => {
        if (data) {
          setHasActiveRes(true);
          setActiveRes(data);
        }
      })
      .catch((e) => console.error("active-res check:", e));
  }, [user]);

  useEffect(() => {
    fetchReservations();
  }, [user]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/news")
      .then((r) => setNewsList(r.data))
      .catch((e) => console.error("news fetch:", e));
  }, []);

  const handleReserveClick = async () => {
    if (hasActiveRes) {
      setShowBlock(true);
      return;
    }
    try {
      const { data } = await axios.get(
        `http://localhost:5000/reservations/active/${user._id}`
      );
      if (data) {
        setHasActiveRes(true);
        setActiveRes(data);
        setShowBlock(true);
      } else {
        setView("reserve", fetchReservations);
      }
    } catch {
      setView("reserve", fetchReservations);
    }
  };

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
      <header className="bg-[#CC0000] text-white pl-5 h-[50px] flex items-center">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 flex gap-4">
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-red-800 shadow-sm rounded-2xl w-full h-[10rem] flex items-center justify-center flex-col text-center text-white p-4">
            <h1 className="text-3xl font-semibold">Welcome, {user?.name}</h1>
            <p className="text-gray-300">We're Glad you here</p>
          </div>

          <div className="flex gap-4 h-[25rem]">
            <div className="border border-gray-200 hover:border-gray-300 duration-200 shadow-sm rounded-2xl flex-1 flex flex-col p-4">
              <h1 className="text-xl font-semibold mb-4">Latest News</h1>
              <div className="border-b border-gray-200 mb-2"></div>
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
                        <p className="text-xs text-end text-gray-400 mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="border-b border-gray-200 mb-2"></div>
                      <p className="text-sm text-gray-600">{n.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border border-gray-200 hover:border-gray-300 duration-200 shadow-sm rounded-2xl flex-1 p-4 overflow-y-auto bg-white">
              <h2 className="text-lg font-semibold mb-4">Your Reservations</h2>
              <div className="border-b border-gray-100 mb-5"></div>

              {isLoading ? (
                <p>Loading reservations…</p>
              ) : reservations.length === 0 ? (
                <p>No reservations yet.</p>
              ) : (
                <div className="flex flex-col h-[18rem] space-y-4">
                  {reservations.map((r) => {
                    const start = new Date(r.datetime);
                    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
                    const day = start.toLocaleDateString("en-PH", { timeZone: "Asia/Manila", year: "numeric", month: "long", day: "numeric" });
                    const st = start.toLocaleTimeString("en-PH", { timeZone: "Asia/Manila", hour: "2-digit", minute: "2-digit", hour12: true });
                    const et = end.toLocaleTimeString("en-PH", { timeZone: "Asia/Manila", hour: "2-digit", minute: "2-digit", hour12: true });
                    const statusBadge = (status) => {
                      const color = status === "Approved" ? "bg-green-100 text-green-700" : status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";
                      return (<span className={`px-3 py-0.5 rounded-full text-xs font-medium ${color}`}>{status}</span>);
                    };
                    return (
                      <div key={r._id} className="border border-gray-200 rounded-xl p-5 bg-white shadow hover:shadow-md transition flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between mb-3">
                          <h2 className="text-xl font-bold text-gray-800">{r.roomName}</h2>
                          {statusBadge(r.status)}
                        </div>
                        <div className="space-y-3 text-sm text-gray-700 flex-1">
                          <p><span className="font-medium">Location:</span> {r.location}</p>
                          <p><span className="font-medium">Schedule:</span> {day}, {st} - {et}</p>
                          <p><span className="font-medium">Purpose:</span> {r.purpose}</p>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500 italic">Submitted: {formatPH(r.createdAt)}</p>
                          <button onClick={() => { setSelectedReservation?.(r); setView?.("reservationDetails"); }} className="text-[#CC0000] font-medium text-sm hover:underline">View Details</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="border border-gray-200 hover:border-gray-300 duration-200 shadow-sm rounded-2xl flex-1 h-[10rem] flex items-center justify-center">
              <h1>Help Center</h1>
            </div>
            <div className="border border-gray-200 hover:border-gray-300 duration-200 shadow-sm rounded-2xl flex-1 h-[10rem] flex items-center justify-center">
              <h1>Guidelines</h1>
            </div>
          </div>
        </div>

        <div className="w-[15rem] flex flex-col gap-4">
          <div className="shadow border border-gray-200 rounded-2xl bg-white hover:border-gray-300 duration-200">
            <Calendar onChange={setSelectedDate} value={selectedDate} className="w-full" tileClassName={({ date }) => { const today = new Date(); return date.toDateString() === today.toDateString() ? "bg-red-100 text-red-800 font-bold rounded-lg" : null; }} />
          </div>
          <div className="border border-gray-200 hover:border-gray-300 duration-200 shadow-sm rounded-2xl w-full h-[20rem] flex items-center justify-center bg-white">
            <h1>Schedule</h1>
          </div>
          <div onClick={handleReserveClick} className={`border border-gray-200 duration-200 shadow-sm rounded-2xl w-full h-[10rem] flex items-center justify-center ${hasActiveRes ? "bg-gray-200" : "bg-red-100 cursor-pointer hover:border-gray-300 hover:bg-gray-50"} transition-colors`}>
            <h1 className={`font-semibold ${hasActiveRes ? "text-gray-500" : "text-[#CC0000]"}`}>Reserve Room</h1>
          </div>
        </div>
      </div>

      {showBlock && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl w-full max-w-sm text-center">
            <h2 className="text-xl font-semibold mb-4">You already have a reservation</h2>
            <p className="text-sm mb-6">{activeRes?.roomName} • {activeRes?.location} • {activeRes && new Date(activeRes.datetime).toLocaleString("en-PH", { timeZone: "Asia/Manila" })}<br/><br/>Please wait until your current session ends before booking again.</p>
            <button onClick={() => setShowBlock(false)} className="bg-[#CC0000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">OK</button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Dashboard;
