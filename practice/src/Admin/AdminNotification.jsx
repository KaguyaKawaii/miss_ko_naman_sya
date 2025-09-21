import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavigation from "./AdminNavigation";
import ReportModal from "./Modals/ReportModal"; // ✅ new import

function AdminNotification({ setView }) {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const API_URL = "http://localhost:5000/api/notifications";

  // Fetch notifications
  const fetchNotifications = async (filter = "all") => {
    setLoading(true);
    try {
      const url =
        filter === "all" ? API_URL : `${API_URL}?filter=${encodeURIComponent(filter)}`;
      const res = await axios.get(url);
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to load notifications", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    setMarkingRead(true);
    try {
      await axios.put(`${API_URL}/mark-all-read/admin`);
      fetchNotifications(activeFilter);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    } finally {
      setMarkingRead(false);
    }
  };

  // Open report details modal
  const openReportModal = (notification) => {
    setSelectedReport(notification);
    setShowReportModal(true);
    
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
  };

  // Mark a single notification as read
  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}/read`);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  useEffect(() => {
    fetchNotifications(activeFilter);
  }, [activeFilter]);

 const filteredNotifications = notifications.filter(notification => {
  // Admin should only see admin/global ones
  if (notification.userId && notification.type === "system") {
    return false; // hide user verification/unverification
  }

  if (activeFilter === "all") return true;
  if (activeFilter === "unread") return !notification.isRead;
  return notification.type === activeFilter;
});


  const getNotificationIcon = (type) => {
    switch (type) {
      case "reservation":
        return "📅";
      case "report":
        return "📊";
      case "system":
        return "⚙️";
      case "alert":
        return "⚠️";
      case "expired":
        return "⏰";
      case "dismissed":
        return "❌";
      default:
        return "🔔";
    }
  };

  return (
    <>
      <AdminNavigation setView={setView} currentView="adminNotifications" />
      <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#CC0000]">Notifications</h1>
            <p className="text-gray-600">Recent system and user activities</p>
          </div>
          <button
            onClick={markAllAsRead}
            disabled={markingRead}
            className={`px-4 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-[#AA0000] transition-colors ${markingRead ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {markingRead ? "Marking..." : "Mark all as read"}
          </button>
        </header>

        {/* Notifications List */}
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Filters */}
            <div className="border-b border-gray-200 p-4 bg-gray-50 flex flex-wrap gap-2">
              {["all", "unread", "reservation", "report", "system", "alert", "expired", "dismissed"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                    activeFilter === filter 
                      ? "bg-[#CC0000] text-white" 
                      : "text-gray-700 hover:bg-gray-100 bg-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* List */}
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading notifications...</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No {activeFilter !== "all" ? activeFilter : ""} notifications found.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredNotifications.map((n) => {
                  const userName = n.userId ? n.userId.name : null;
                  return (
                    <li 
                      key={n._id} 
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!n.isRead ? "bg-blue-50" : ""}`}
                      onClick={() => n.type === "report" ? openReportModal(n) : markAsRead(n._id)}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3 mt-1">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                            {getNotificationIcon(n.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                              {n.type}
                            </span>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-[#CC0000] flex-shrink-0 mt-2"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-800 mt-2">
                            {userName && <span className="font-semibold">{userName}: </span>}
                            {n.message || "No message"}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {n.createdAt ? new Date(n.createdAt).toLocaleString() : "Unknown date"}
                          </p>
                          {n.type === "report" && (
                            <button 
                              className="text-xs text-[#CC0000] hover:underline mt-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                openReportModal(n);
                              }}
                            >
                              View Report Details
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* ✅ Report Modal (separated) */}
        {showReportModal && selectedReport?.reportId && (
  <ReportModal 
    reportId={selectedReport.reportId} 
    onClose={() => setShowReportModal(false)} 
  />
)}

      </main>
    </>
  );
}

export default AdminNotification;
