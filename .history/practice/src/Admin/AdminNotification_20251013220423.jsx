// AdminNotification.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavigation from "./AdminNavigation";
import ReportModal from "./Modals/ReportModal";

function AdminNotification({ setView }) {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(false);
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

  // Open report details modal
  const openReportModal = async (notification) => {
    try {
      console.log("Opening report modal with notification:", notification);
      
      // Extract the reportId properly - handle different possible formats
      let reportId = null;
      
      if (notification.reportId) {
        // If reportId is an object, get the _id from it
        if (typeof notification.reportId === 'object' && notification.reportId._id) {
          reportId = notification.reportId._id;
        } 
        // If reportId is a string (the actual ID)
        else if (typeof notification.reportId === 'string') {
          reportId = notification.reportId;
        }
        // If reportId has an $oid field (MongoDB format)
        else if (notification.reportId.$oid) {
          reportId = notification.reportId.$oid;
        }
      }

      console.log("Extracted reportId:", reportId);

      if (reportId) {
        // Fetch the full report details
        const reportRes = await axios.get(`http://localhost:5000/reports/${reportId}`);
        console.log("Fetched report details:", reportRes.data);
        setSelectedReport({
          ...notification,
          reportDetails: reportRes.data
        });
      } else {
        // If no valid reportId, just show the notification
        console.warn("No valid reportId found in notification:", notification);
        setSelectedReport(notification);
      }
      
      setShowReportModal(true);
      
      // Mark as read if unread
      if (!notification.isRead) {
        markAsRead(notification._id);
      }
    } catch (err) {
      console.error("Failed to fetch report details:", err);
      // Even if fetching details fails, show the modal with basic notification info
      setSelectedReport(notification);
      setShowReportModal(true);
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

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read first
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    // Then handle based on type
    if (notification.type === "report") {
      openReportModal(notification);
    }
    // For other notification types, you can add additional logic here
    // For now, just marking as read is sufficient
  };

  // Handle report updates from modal
  const handleReportUpdated = () => {
    // Refresh notifications when a report is updated
    fetchNotifications(activeFilter);
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

  // Format notification message for admin view
  const formatAdminMessage = (notification) => {
    const userName = notification.userId ? notification.userId.name : null;
    const roomName = notification.reservationId?.roomName || "Unknown Room";
    const date = notification.reservationId?.date ? new Date(notification.reservationId.date).toISOString().split('T')[0] : null;

    switch (notification.type) {
      case "reservation":
        if (userName && roomName && date) {
          return `New reservation request by ${userName} for ${roomName} on ${date}.`;
        }
        return notification.message || "New reservation activity.";
      
      case "report":
        return `New maintenance report submitted${userName ? ` by ${userName}` : ''}.`;
      
      case "system":
        return notification.message || "System notification";
      
      case "alert":
        return `Alert: ${notification.message}`;
      
      case "expired":
        return `Expired reservation${userName ? ` from ${userName}` : ''} requires attention.`;
      
      case "dismissed":
        return `Dismissed: ${notification.message}`;
      
      default:
        return notification.message || "Notification";
    }
  };

  // SVG Icons for different notification types
  const NotificationIcons = {
    reservation: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
      </svg>
    ),
    report: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    system: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
      </svg>
    ),
    alert: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    expired: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
    dismissed: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    ),
    default: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
      </svg>
    )
  };

  const getNotificationIcon = (type) => {
    return NotificationIcons[type] || NotificationIcons.default;
  };

  const getTypeColor = (type) => {
    const colors = {
      reservation: "bg-blue-100 text-blue-800",
      report: "bg-orange-100 text-orange-800",
      system: "bg-gray-100 text-gray-800",
      alert: "bg-red-100 text-red-800",
      expired: "bg-yellow-100 text-yellow-800",
      dismissed: "bg-purple-100 text-purple-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <>
      <AdminNavigation setView={setView} currentView="adminNotifications" />
      <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header - Unchanged */}
        <header className="bg-white px-8 py-6 border-b border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[#CC0000]">Admin Notifications</h1>
            <p className="text-gray-600 mt-1">System overview and administrative alerts</p>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{notifications.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {notifications.filter(n => !n.isRead).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reports</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {notifications.filter(n => n.type === "report").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reservations</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {notifications.filter(n => n.type === "reservation").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Filters */}
            <div className="border-b border-gray-200 p-6 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                <div className="flex flex-wrap gap-2">
                  {["all", "unread", "reservation", "report", "system", "alert", "expired", "dismissed"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${
                        activeFilter === filter 
                          ? "bg-[#CC0000] text-white shadow-sm" 
                          : "text-gray-700 hover:bg-white hover:shadow-sm bg-white border border-gray-200"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notifications List */}
            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#CC0000]"></div>
                  <span className="ml-3 text-gray-600">Loading notifications...</span>
                </div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  {activeFilter !== "all" 
                    ? `No ${activeFilter} notifications available.` 
                    : "All caught up! No new notifications."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((n) => {
                  const formattedMessage = formatAdminMessage(n);
                  return (
                    <div 
                      key={n._id} 
                      className={`p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer group ${
                        !n.isRead ? "bg-blue-50 border-l-4 border-blue-500" : "border-l-4 border-transparent"
                      }`}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                          !n.isRead 
                            ? "bg-blue-100 text-blue-600 ring-2 ring-blue-50" 
                            : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                        }`}>
                          {getNotificationIcon(n.type)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                            <div className="flex items-center gap-3">
                              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${getTypeColor(n.type)} capitalize`}>
                                {n.type}
                              </span>
                              {!n.isRead && (
                                <span className="flex items-center gap-1 text-xs font-medium text-[#CC0000]">
                                  <span className="w-2 h-2 rounded-full bg-[#CC0000] flex-shrink-0"></span>
                                  Unread
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 font-medium">
                              {n.createdAt ? new Date(n.createdAt).toLocaleString() : "Unknown date"}
                            </span>
                          </div>
                          
                          <p className="text-gray-800 font-medium leading-relaxed">
                            {formattedMessage}
                          </p>

                          {/* Additional context */}
                          {(n.reservationId || n.userId) && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {n.reservationId && (
                                <span className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium">
                                  📅 Reservation: {n.reservationId._id?.substring(0, 8) || "N/A"}
                                </span>
                              )}
                              {n.userId && (
                                <span className="text-xs bg-white border border-gray-200 text-green-700 px-3 py-1.5 rounded-lg font-medium">
                                  👤 User: {n.userId.name || "Unknown"}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Report action */}
                          {n.type === "report" && (
                            <button 
                              className="text-sm text-[#CC0000] hover:text-[#990000] font-semibold mt-3 inline-flex items-center gap-1 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                openReportModal(n);
                              }}
                            >
                              View Report Details
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Report Modal - Unchanged */}
        {showReportModal && (
          <ReportModal 
            reportId={selectedReport?.reportId} 
            onClose={() => {
              setShowReportModal(false);
              setSelectedReport(null);
            }}
            onReportUpdated={handleReportUpdated}
          />
        )}
      </main>
    </>
  );
}

export default AdminNotification;