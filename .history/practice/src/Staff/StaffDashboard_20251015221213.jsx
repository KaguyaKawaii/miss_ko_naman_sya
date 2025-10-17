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

  // Fetch reservations count for the staff's floor
  const fetchReservationsCount = async () => {
    try {
      const response = await api.get(`/reservations/floor?floor=${encodeURIComponent(staff.floor)}`);
      const reservationsData = response.data || [];
      
      // Calculate counts
      const totalReservations = reservationsData.length;
      const pendingReservations = reservationsData.filter(r => r.status === "Pending").length;
      
      return { totalReservations, pendingReservations, reservationsData };
    } catch (err) {
      console.error("Error fetching reservations:", err);
      // Fallback: fetch all and filter by floor
      try {
        const allReservationsResponse = await api.get("/reservations");
        const allReservations = allReservationsResponse.data || [];
        
        const normalizedStaffFloor = normalizeFloorName(staff.floor);
        const filteredReservations = allReservations.filter(reservation => {
          const normalizedReservationFloor = normalizeFloorName(reservation.location);
          return normalizedReservationFloor === normalizedStaffFloor;
        });
        
        const totalReservations = filteredReservations.length;
        const pendingReservations = filteredReservations.filter(r => r.status === "Pending").length;
        
        return { totalReservations, pendingReservations, reservationsData: filteredReservations };
      } catch (fallbackErr) {
        console.error("Fallback reservation fetch failed:", fallbackErr);
        return { totalReservations: 0, pendingReservations: 0, reservationsData: [] };
      }
    }
  };

  // Fetch unique users count for the staff's floor
  const fetchUsersCount = async (reservationsData) => {
    try {
      // Get unique users from reservations
      const uniqueUserIds = new Set();
      reservationsData.forEach(reservation => {
        if (reservation.userId?._id) {
          uniqueUserIds.add(reservation.userId._id.toString());
        }
        // Also include participants
        if (reservation.participants && Array.isArray(reservation.participants)) {
          reservation.participants.forEach(participant => {
            if (participant.id_number) {
              uniqueUserIds.add(participant.id_number);
            }
          });
        }
      });
      
      return uniqueUserIds.size;
    } catch (err) {
      console.error("Error calculating unique users:", err);
      return 0;
    }
  };

  // Fetch unread messages count for staff
  const fetchMessagesCount = async () => {
    try {
      const response = await api.get(`/messages/staff-total-unread/${staff._id}`);
      return response.data.count || 0;
    } catch (err) {
      console.error("Error fetching messages count:", err);
      try {
        // Fallback: get staff recipients and sum unread counts
        const response = await api.get(`/messages/staff-recipients/${staff._id}`);
        const recipients = response.data || [];
        const unreadCount = recipients.reduce((total, recipient) => {
          return total + (recipient.unreadCount || 0);
        }, 0);
        return unreadCount;
      } catch (fallbackErr) {
        console.error("Fallback messages count failed:", fallbackErr);
        return 0;
      }
    }
  };

  // Fetch unread notifications count for staff
  const fetchNotificationsCount = async () => {
    try {
      const response = await api.get(`/notifications/staff/${staff._id}?filter=unread`);
      return response.data.length || 0;
    } catch (err) {
      console.error("Error fetching notifications count:", err);
      return 0;
    }
  };

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch all counts in parallel
      const [reservationsResult, messagesCount, notificationsCount] = await Promise.all([
        fetchReservationsCount(),
        fetchMessagesCount(),
        fetchNotificationsCount()
      ]);

      // Calculate users count from reservations data
      const usersCount = await fetchUsersCount(reservationsResult.reservationsData);

      // Update summary data with actual counts
      setSummaryData({
        reservations: reservationsResult.totalReservations,
        users: usersCount,
        pendingReservations: reservationsResult.pendingReservations,
        messages: messagesCount,
        notifications: notificationsCount
      });

      // Set reservations for recent activity
      const sortedReservations = reservationsResult.reservationsData.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt) : 0;
        const bTime = b.createdAt ? new Date(b.createdAt) : 0;
        return bTime - aTime;
      });
      setReservations(sortedReservations);

      // Prepare recent activity
      const reservationActivities = sortedReservations.slice(0, 3).map((r) => ({
        id: r._id,
        action: `Reservation in ${r.roomName || r.room}`,
        time: r.datetime ? new Date(r.datetime).toLocaleDateString() : "Unknown date",
        user: r.userId?.name || "Unknown",
        type: "reservation",
        status: r.status
      }));

      // Fetch messages for recent activity
      try {
        const messagesResponse = await api.get(`/messages/staff-recipients/${staff._id}`);
        const messagesData = messagesResponse.data || [];
        
        const messageActivities = messagesData.slice(0, 2).map((msg, index) => ({
          id: msg._id || `msg-${index}`,
          action: `New message from ${msg.name || 'User'}`,
          time: msg.latestMessageTimestamp ? new Date(msg.latestMessageTimestamp).toLocaleDateString() : "Recently",
          user: msg.name || 'User',
          type: "message",
        }));

        setRecentActivity([...reservationActivities, ...messageActivities].slice(0, 4));
      } catch (msgErr) {
        console.error("Error fetching messages for activity:", msgErr);
        setRecentActivity(reservationActivities.slice(0, 4));
      }

      // Fetch news (optional)
      try {
        const newsRes = await api.get("/news");
        setNewsList(newsRes.data || []);
      } catch (newsErr) {
        console.error("Error fetching news:", newsErr);
        setNewsList([]);
      }

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (staff?._id && staff?.floor) {
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

  if (loading) {
    return (
      <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50">
        <header className="bg-white px-8 py-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#CC0000] mb-1">
                {staff?.floor || "Staff"} Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {staff?.name || "Staff"}
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
              {staff?.floor || "Staff"} Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {staff?.name || "Staff"}
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
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Enhanced Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Reservations Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-500 text-sm font-medium mb-2">
                  Total Reservations
                </p>
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-3xl font-bold text-gray-800">
                    {summaryData.reservations}
                  </p>
                  {summaryData.pendingReservations > 0 && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                      +{summaryData.pendingReservations} pending
                    </span>
                  )}
                </div>
                {staff?.floor && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <CalendarIcon size={14} className="text-blue-500" />
                    <span className="font-medium">Floor:</span>
                    <span className="text-red-600 font-semibold">
                      {normalizeFloorName(staff.floor)}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                <CalendarIcon size={24} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  {summaryData.pendingReservations === 0 ? (
                    "All reservations processed"
                  ) : (
                    <>
                      <span className="font-semibold text-yellow-600">
                        {summaryData.pendingReservations}
                      </span>{" "}
                      need approval
                    </>
                  )}
                </p>
                {summaryData.pendingReservations > 0 && (
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </div>
          </div>

          {/* Users Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-2">Active Users</p>
                <p className="text-3xl font-bold text-gray-800 mb-2">
                  {summaryData.users}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Users size={12} />
                  <span>Verified users on floor</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
                <Users size={24} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Unique users with reservations
                </p>
                <div className={`w-2 h-2 rounded-full ${
                  summaryData.users > 0 ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
              </div>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-2">
                  Notifications
                </p>
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-3xl font-bold text-gray-800">
                    {summaryData.notifications}
                  </p>
                  {summaryData.notifications > 0 && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                      Action needed
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  Unread notifications
                </p>
              </div>
              <div className={`p-3 rounded-xl shadow-lg ${
                summaryData.notifications > 0 
                  ? 'bg-gradient-to-br from-red-500 to-red-600 animate-pulse' 
                  : 'bg-gradient-to-br from-purple-500 to-purple-600'
              } text-white`}>
                <Bell size={24} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  {summaryData.notifications === 0 ? (
                    "All clear!"
                  ) : (
                    "Requires your attention"
                  )}
                </p>
                {summaryData.notifications > 0 && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                )}
              </div>
            </div>
          </div>

          {/* Messages Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-2">
                  Messages
                </p>
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-3xl font-bold text-gray-800">
                    {summaryData.messages}
                  </p>
                  {summaryData.messages > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                      Unread
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600">
                  From floor users
                </p>
              </div>
              <div className={`p-3 rounded-xl shadow-lg ${
                summaryData.messages > 0 
                  ? 'bg-gradient-to-br from-amber-500 to-amber-600' 
                  : 'bg-gradient-to-br from-gray-500 to-gray-600'
              } text-white`}>
                <MessageSquare size={24} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  {summaryData.messages === 0 ? (
                    "No new messages"
                  ) : (
                    "Unread messages waiting"
                  )}
                </p>
                {summaryData.messages > 0 && (
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                )}
              </div>
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
              {reservations.length === 0 ? (
                <p className="text-gray-500">No reservations found for {staff?.floor}.</p>
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
                          r.status === 'Ongoing' ? 'bg-blue-100 text-blue-800' :
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
                          {r.datetime ? new Date(r.datetime).toLocaleDateString() : "Unknown date"}
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

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Recent Activity
              </h2>
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'reservation' ? 'bg-blue-100 text-blue-600' :
                        activity.type === 'message' ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {activity.type === 'reservation' ? <CalendarIcon size={14} /> :
                         activity.type === 'message' ? <MessageSquare size={14} /> :
                         <Activity size={14} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                        <p className="text-xs text-gray-500">by {activity.user}</p>
                        <p className="text-xs text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Actions */}
            {summaryData.pendingReservations > 0 && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200">
                <div className="flex items-center mb-3">
                  <AlertCircle className="text-red-500 mr-2" size={18} />
                  <h2 className="text-lg font-semibold text-gray-800">
                    Pending Actions
                  </h2>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  You have {summaryData.pendingReservations} reservation{summaryData.pendingReservations !== 1 ? 's' : ''} requiring your attention.
                </p>
                <button 
                  onClick={() => setView("staffReservation")}
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