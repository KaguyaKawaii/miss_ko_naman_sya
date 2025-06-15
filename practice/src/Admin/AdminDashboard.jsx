// AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminDashboard() {
  const [reservationCount, setReservationCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);
  const [newsList, setNewsList] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/admin/summary").then((res) => {
      setReservationCount(res.data.reservations);
      setUserCount(res.data.users);
      setMessagesCount(res.data.messages);
    });

    axios.get("http://localhost:5000/news").then((res) => {
      setNewsList(res.data);
    });
  }, []);

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#CC0000] text-white pl-5 h-[50px] flex items-center">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 flex gap-4">
        {/* Left column */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white shadow rounded-2xl p-4 text-center">
              <h2 className="text-lg font-bold text-gray-700">Reservations</h2>
              <p className="text-3xl text-[#CC0000] font-bold">{reservationCount}</p>
            </div>
            <div className="bg-white shadow rounded-2xl p-4 text-center">
              <h2 className="text-lg font-bold text-gray-700">Users</h2>
              <p className="text-3xl text-[#CC0000] font-bold">{userCount}</p>
            </div>
            <div className="bg-white shadow rounded-2xl p-4 text-center">
              <h2 className="text-lg font-bold text-gray-700">Messages</h2>
              <p className="text-3xl text-[#CC0000] font-bold">{messagesCount}</p>
            </div>
          </div>

          {/* News */}
          <div className="bg-white shadow rounded-2xl p-4 h-[20rem] overflow-y-auto">
            <h2 className="text-xl font-bold mb-3">Latest News</h2>
            {newsList.length === 0 ? (
              <p>No news posted yet.</p>
            ) : (
              <ul className="space-y-2">
                {newsList.map((news) => (
                  <li key={news._id} className="border-b pb-2">
                    <p className="text-[#CC0000] font-semibold">{news.title}</p>
                    <p className="text-sm text-gray-600">{news.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Manage Section Buttons */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            {[
              { label: "Manage Reservations", view: "reservations" },
              { label: "Manage Users", view: "users" },
              { label: "Manage Rooms", view: "rooms" },
              { label: "View Messages", view: "messages" },
              { label: "Post News", view: "news" },
              { label: "Generate Reports", view: "reports" },
            ].map((item) => (
              <div
                key={item.label}
                onClick={() => console.log("Navigate to", item.view)}
                className="cursor-pointer bg-red-100 hover:bg-gray-50 border border-gray-200 shadow rounded-2xl p-4 text-center transition"
              >
                <h3 className="text-[#CC0000] font-semibold">{item.label}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-[15rem] flex flex-col gap-4">
          <div className="border border-gray-200 shadow rounded-2xl w-full h-[15rem] flex items-center justify-center bg-white">
            <h1>Calendar</h1>
          </div>
          <div className="border border-gray-200 shadow rounded-2xl w-full h-[20rem] flex items-center justify-center bg-white">
            <h1>System Logs</h1>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AdminDashboard;
