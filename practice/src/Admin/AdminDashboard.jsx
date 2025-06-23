import React, { useEffect, useState } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function AdminDashboard({ setView }) {
  const [reservationCount, setReservationCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [newsList, setNewsList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");

  const refreshData = () => {
    axios
      .get("http://localhost:5000/admin/summary")
      .then((res) => {
        setReservationCount(res.data.reservations);
        setUserCount(res.data.users);
      })
      .catch((err) => console.error("Error fetching summary:", err));

    axios
      .get("http://localhost:5000/news")
      .then((res) => setNewsList(res.data))
      .catch((err) => console.error("Error fetching news:", err));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handlePostNews = () => {
    if (!newsTitle.trim() || !newsContent.trim()) {
      alert("Both Title and Content are required.");
      return;
    }

    axios
      .post("http://localhost:5000/news", {
        title: newsTitle,
        content: newsContent,
      })
      .then(() => {
        alert("News posted successfully!");
        setNewsTitle("");
        setNewsContent("");
        setShowNewsModal(false);
        refreshData();
      })
      .catch((err) => {
        console.error("Error posting news:", err);
        alert("Failed to post news.");
      });
  };

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
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white shadow rounded-2xl p-4 text-center">
              <h2 className="text-lg font-bold text-gray-700">Reservations</h2>
              <p className="text-3xl text-[#CC0000] font-bold">{reservationCount}</p>
            </div>
            <div className="bg-white shadow rounded-2xl p-4 text-center">
              <h2 className="text-lg font-bold text-gray-700">Users</h2>
              <p className="text-3xl text-[#CC0000] font-bold">{userCount}</p>
            </div>
          </div>

          {/* News */}
          <div className="bg-white shadow rounded-2xl p-4 h-[36rem] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold">Latest News</h2>
              <button
                onClick={() => setShowNewsModal(true)}
                className="px-5 py-2 rounded-lg text-sm bg-[#CC0000] hover:bg-red-700 text-white cursor-pointer transition duration-150 shadow-lg hover:shadow-xl"
              >
                + Add News
              </button>
            </div>
            {newsList.length === 0 ? (
              <p>No news posted yet.</p>
            ) : (
              <ul className="space-y-2">
                {newsList.map((news) => (
                  <li key={news._id} className="border border-gray-200 p-5 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[#CC0000] font-semibold">{news.title}</p>
                      <p className="text-xs text-end text-gray-400 mt-1">
                        {new Date(news.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="border-b border-gray-200 mb-2"></div>
                    <p className="text-sm text-gray-600">{news.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Manage Section Buttons */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div
              onClick={() => setView("adminReservation")}
              className="cursor-pointer bg-red-100 hover:bg-gray-50 border border-gray-200 shadow rounded-2xl p-4 text-center transition"
            >
              <h3 className="text-[#CC0000] font-semibold">Manage Reservations</h3>
            </div>
            <div
              onClick={() => setView("adminUsers")}
              className="cursor-pointer bg-red-100 hover:bg-gray-50 border border-gray-200 shadow rounded-2xl p-4 text-center transition"
            >
              <h3 className="text-[#CC0000] font-semibold">Manage Users</h3>
            </div>
            <div
              onClick={() => setView("adminRoom")}
              className="cursor-pointer bg-red-100 hover:bg-gray-50 border border-gray-200 shadow rounded-2xl p-4 text-center transition"
            >
              <h3 className="text-[#CC0000] font-semibold">Manage Rooms</h3>
            </div>
            <div
              onClick={() => setView("adminMessage")}
              className="cursor-pointer bg-red-100 hover:bg-gray-50 border border-gray-200 shadow rounded-2xl p-4 text-center transition"
            >
              <h3 className="text-[#CC0000] font-semibold">View Messages</h3>
            </div>
            <div
              onClick={() => setShowNewsModal(true)}
              className="cursor-pointer bg-red-100 hover:bg-gray-50 border border-gray-200 shadow rounded-2xl p-4 text-center transition"
            >
              <h3 className="text-[#CC0000] font-semibold">Post News</h3>
            </div>
            <div
              onClick={() => setView("adminReports")}
              className="cursor-pointer bg-red-100 hover:bg-gray-50 border border-gray-200 shadow rounded-2xl p-4 text-center transition"
            >
              <h3 className="text-[#CC0000] font-semibold">Generate Reports</h3>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-[15rem] flex flex-col gap-4">
          <div className="border border-gray-200 shadow rounded-2xl bg-white">
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
                return null;
              }}
            />
          </div>
          <div className="border border-gray-200 shadow rounded-2xl bg-white h-[20rem] flex items-center justify-center">
            <h1 className="text-gray-700 font-semibold">System Logs</h1>
          </div>
        </div>
      </div>

      {showNewsModal && (
        <div className="fixed inset-0 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[600px] shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Post News</h2>
            <input
              type="text"
              placeholder="News Title"
              value={newsTitle}
              onChange={(e) => setNewsTitle(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg mb-4 text-lg"
            />
            <textarea
              placeholder="News Content"
              value={newsContent}
              onChange={(e) => setNewsContent(e.target.value)}
              rows="6"
              className="w-full border border-gray-300 p-3 rounded-lg mb-6 text-base"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNewsModal(false)}
                className="px-5 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 text-base"
              >
                Cancel
              </button>
              <button
                onClick={handlePostNews}
                className="px-5 py-2 rounded-lg bg-[#CC0000] hover:bg-red-700 text-white text-base"
              >
                Post News
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminDashboard;
