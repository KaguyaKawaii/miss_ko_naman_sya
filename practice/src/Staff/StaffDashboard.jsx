import React, { useEffect, useState } from "react";
import api from "../utils/api";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Users,
  Calendar as CalendarIcon,
  MessageSquare,
  Clock,
  ChevronRight,
  BookOpen,
  Bell,
  AlertCircle,
  PlusCircle,
  FileText,
  Activity,
} from "lucide-react";

function StaffDashboard({ staff, setView }) {
  const [summaryData, setSummaryData] = useState({
    reservations: 0,
    users: 0,
    pendingReservations: 0,
    messages: 0,
    notifications: 0
  });
  const [reservations, setReservations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [recentActivity, setRecentActivity] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [newsList, setNewsList] = useState([]);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsContent, setNewsContent] = useState("");

  const normalizeFloorName = (floorName) => {
    if (!floorName) return "";
    const normalized = floorName.toLowerCase().trim();

    if (normalized.includes("2nd") || normalized.includes("second")) return "2nd Floor";
    if (normalized.includes("3rd") || normalized.includes("third")) return "3rd Floor";
    if (normalized.includes("4th") || normalized.includes("fourth")) return "4th Floor";
    if (normalized.includes("5th") || normalized.includes("fifth")) return "5th Floor";
    if (normalized.includes("ground")) return "Ground Floor";

    return floorName;
  };

  // Proper fetchReservations function like in StaffReservations.jsx
  const fetchReservations = async () => {
    if (!staff?._id) {
      setReservations([]);
      return;
    }

    try {
      setLoading(true);
      // FIXED: Use the correct endpoint - remove the duplicate /api
      const response = await api.get("/reservations"); // This should point to /reservations, not /api/reservations

      if (staff?.floor && staff.floor !== "N/A") {
        const normalizedStaffFloor = normalizeFloorName(staff.floor);
        const filteredReservations = response.data.filter(reservation => {
          const normalizedReservationFloor = normalizeFloorName(reservation.location);
          return normalizedReservationFloor === normalizedStaffFloor;
        });
        
        const sorted = filteredReservations.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt) : 0;
          const bTime = b.createdAt ? new Date(b.createdAt) : 0;
          return bTime - aTime;
        });
        
        setReservations(sorted);
      } else {
        const sorted = response.data.sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt) : 0;
          const bTime = b.createdAt ? new Date(b.createdAt) : 0;
          return bTime - aTime;
        });
        setReservations(sorted);
      }
    } catch (err) {
      console.error("Error fetching reservations:", err);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all reservations using the proper function
      await fetchReservations();

      // Normalize staff floor
      const normalizedFloor = normalizeFloorName(staff?.floor);

      // Filter reservations by staff floor (already done in fetchReservations, but we'll use the state)
      const filteredReservations = reservations;

      // Fetch messages (floor-based) - FIXED: Remove duplicate /api
      let floorMessages = [];
      try {
        // FIXED: Correct endpoint path
        const messagesRes = await api.get(`/messages/floor-users/${encodeURIComponent(normalizedFloor)}`);
        floorMessages = messagesRes.data || [];
        setMessages(floorMessages);
      } catch (msgErr) {
        console.error("Error fetching messages:", msgErr);
        setMessages([]);
      }

      // Notifications = pending reservations
      const pendingReservations = filteredReservations.filter((r) => r.status === "Pending");
      setNotifications(pendingReservations);

      // Summary data
      const uniqueUsers = new Set(filteredReservations.map((r) => r.userId?._id)).size;
      const unreadMessagesCount = floorMessages.filter((msg) => !msg.read).length;

      setSummaryData({
        reservations: filteredReservations.length,
        users: uniqueUsers,
        pendingReservations: pendingReservations.length,
        messages: unreadMessagesCount,
        notifications: pendingReservations.length,
      });

      // Recent activity
      const reservationActivities = filteredReservations.slice(0, 3).map((r) => ({
        id: r._id,
        action: `Reservation in ${r.roomName || r.room}`,
        time: r.date ? new Date(r.date).toLocaleDateString() : "Unknown date",
        user: r.userId?.name || "Unknown",
        type: "reservation",
      }));

      const messageActivities = floorMessages.slice(0, 2).map((msg, index) => ({
        id: `msg-${index}`,
        action: `New message from ${msg.name}`,
        time: msg.latestMessageAt ? new Date(msg.latestMessageAt).toLocaleDateString() : "Recently",
        user: msg.name,
        type: "message",
      }));

      setRecentActivity([...reservationActivities, ...messageActivities].slice(0, 4));

      // News (optional) - FIXED: Remove duplicate /api
      try {
        const newsRes = await api.get("/news");
        setNewsList(newsRes.data || []);
      } catch (newsErr) {
        console.error("Error fetching news:", newsErr);
        setNewsList([]);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (staff?.floor) {
      fetchDashboardData();
      // Refresh data every 30 seconds
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    }
  }, [staff]);

  const handlePostNews = () => {
    if (!newsTitle.trim() || !newsContent.trim()) {
      alert("Both Title and Content are required.");
      return;
    }

    // FIXED: Remove duplicate /api
    api.post("/news", {
      title: newsTitle,
      content: newsContent,
    })
    .then(() => {
      alert("News posted successfully!");
      setNewsTitle("");
      setNewsContent("");
      setShowNewsModal(false);
      fetchDashboardData();
    })
    .catch((err) => {
      console.error("Error posting news:", err);
      alert("Failed to post news.");
    });
  };

  const quickActions = [
    { id: "staffReservation", icon: <CalendarIcon size={18} />, label: "Reservations", count: summaryData.reservations },
    { id: "staffNotification", icon: <Bell size={18} />, label: "Notifications", count: summaryData.notifications },
    { id: "staffMessages", icon: <MessageSquare size={18} />, label: "Messages", count: summaryData.messages },
    { id: "staffNews", icon: <FileText size={18} />, label: "News" },
  ];

  const handleQuickAction = (actionId) => {
    if (setView) {
      setView(actionId);
    }
  };

  // Also check your api.js configuration - make sure the baseURL is correct
  // It should be something like:
  // baseURL: 'http://localhost:5000/api' 
  // Then your endpoints would be '/reservations', '/messages', etc.

  if (loading) {
    return (
      <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50">
        <header className="bg-white px-8 py-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#CC0000] mb-1">
                {staff.floor} Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {staff.name || "Staff"}
              </p>
            </div>
          </div>
        </header>
        <div className="p-8">
          <div className="animate-pulse space-y-6">
            {/* Stats loading */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
            {/* Content loading */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64"></div>
              </div>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white px-8 py-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#CC0000] mb-1">
              {staff.floor} Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {staff.name || "Staff"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 bg-gray-100 px-4 py-2 rounded-lg">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Reservations
                </p>
                <p className="text-sm text-gray-600">
                  Total Reservations:{" "}
                  <span className="font-bold text-gray-800">
                    {reservations.length}
                  </span>
                  {staff?.floor && (
                    <span className="ml-3 flex items-center gap-1">
                      <CalendarIcon size={14} className="text-blue-500" />
                      Floor:{" "}
                      <span className="font-bold text-red-600">
                        {normalizeFloorName(staff.floor)}
                      </span>
                    </span>
                  )}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <CalendarIcon size={20} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">
                  {summaryData.pendingReservations}
                </span>{" "}
                pending approval
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Users</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {summaryData.users}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <Users size={20} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Verified users on {staff.floor}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Notifications
                </p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {summaryData.notifications}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                <Bell size={20} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Action required
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Messages
                </p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {summaryData.messages}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
                <MessageSquare size={20} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Unread messages
              </p>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.id)}
                    className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
                  >
                    <div className="mr-3 p-2 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600">
                      {action.icon}
                    </div>
                    <div className="text-left flex-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                          {action.label}
                        </p>
                        {action.count > 0 && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            {action.count}
                          </span>
                        )}
                      </div>
                      <ChevronRight size={16} className="text-gray-400 mt-1 group-hover:text-blue-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Reservations */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Recent Reservations
                </h2>
                <button 
                  onClick={() => setView("staffReservation")}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  View all
                </button>
              </div>
              {error && <p className="text-red-500">{error}</p>}
              {reservations.length === 0 ? (
                <p className="text-gray-500">No reservations found for {staff.floor}.</p>
              ) : (
                <div className="space-y-4">
                  {reservations.slice(0, 5).map((r) => (
                    <div
                      key={r._id}
                      className="p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-gray-800">
                          {r.roomName || r.room}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          r.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          r.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {r.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Reserved by {r.userId?.name || "Unknown"}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">
                          {r.date ? new Date(r.date).toLocaleDateString() : "Unknown date"}
                        </p>
                        <button 
                          onClick={() => setView("staffReservation")}
                          className="text-blue-600 text-xs hover:underline"
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Calendar */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Calendar
              </h2>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                className="border-0 w-full"
                tileClassName={({ date }) => {
                  const today = new Date();
                  if (
                    date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear()
                  ) {
                    return "bg-blue-600 text-white font-medium rounded-lg";
                  }
                  return null;
                }}
              />
            </div>

            {/* Pending Actions */}
            {notifications.length > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200">
                <div className="flex items-center mb-3">
                  <AlertCircle className="text-red-500 mr-2" size={18} />
                  <h2 className="text-lg font-semibold text-gray-800">
                    Pending Actions
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  You have {notifications.length} reservation{notifications.length !== 1 ? 's' : ''} requiring your attention.
                </p>
                <button 
                  onClick={() => setView("staffNotification")}
                  className="w-full py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Review Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* News Modal */}
      {showNewsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Create News Post</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  placeholder="Enter news title"
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  placeholder="Write news content here..."
                  value={newsContent}
                  onChange={(e) => setNewsContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowNewsModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePostNews}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Publish News
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default StaffDashboard;