// AdminNotification.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavigation from "./AdminNavigation";
import ReportModal from "./Modals/ReportModal";
import AdminReservationModal from "./AdminReservationModal";
import moment from "moment-timezone";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  Play,
  Square,
  Plus,
  ChevronRight,
  Shield,
  Calendar,
  Users,
  Clock,
  Building
} from "lucide-react";

// Main AdminNotification Component
function AdminNotification({ setView }) {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");

  const API_URL = "http://localhost:5000/api/notifications";

  // Fetch current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          withCredentials: true
        });
        setCurrentUser(response.data);
      } catch (err) {
        console.error("Failed to fetch current user", err);
        setError("Failed to load user data");
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch notifications
  const fetchNotifications = async (filter = "all") => {
    setLoading(true);
    setError("");
    try {
      const url = filter === "all" ? API_URL : `${API_URL}?filter=${filter}`;
      const res = await axios.get(url, { withCredentials: true });
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to load notifications", err);
      setError("Failed to load notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Open report details modal
  const openReportModal = async (notification) => {
    try {
      let reportId = null;
      
      if (notification.reportId) {
        if (typeof notification.reportId === 'object' && notification.reportId._id) {
          reportId = notification.reportId._id;
        } else if (typeof notification.reportId === 'string') {
          reportId = notification.reportId;
        }
      }

      if (reportId) {
        const reportRes = await axios.get(`http://localhost:5000/reports/${reportId}`, {
          withCredentials: true
        });
        setSelectedReport({
          ...notification,
          reportDetails: reportRes.data
        });
      } else {
        setSelectedReport(notification);
      }
      
      setShowReportModal(true);
      
      // Mark as read if unread
      if (!notification.isRead) {
        markAsRead(notification._id);
      }
    } catch (err) {
      console.error("Failed to fetch report details:", err);
      setSelectedReport(notification);
      setShowReportModal(true);
    }
  };

  // Open reservation details modal
  const openReservationModal = async (notification) => {
    try {
      let reservationId = null;
      
      if (notification.reservationId) {
        if (typeof notification.reservationId === 'object' && notification.reservationId._id) {
          reservationId = notification.reservationId._id;
        } else if (typeof notification.reservationId === 'string') {
          reservationId = notification.reservationId;
        }
      }

      if (reservationId) {
        const reservationRes = await axios.get(`http://localhost:5000/reservations/${reservationId}`, {
          withCredentials: true
        });
        
        // Transform the data to ensure proper participant structure
        const reservationData = transformReservationData(reservationRes.data);
        setSelectedReservation(reservationData);
      } else {
        const transformedData = transformReservationData(notification.reservationId || notification);
        setSelectedReservation(transformedData);
      }
      
      setShowReservationModal(true);
      
      // Mark as read if unread
      if (!notification.isRead) {
        markAsRead(notification._id);
      }
    } catch (err) {
      console.error("Failed to fetch reservation details:", err);
      const transformedData = transformReservationData(notification.reservationId || notification);
      setSelectedReservation(transformedData);
      setShowReservationModal(true);
    }
  };

  // Transform reservation data to ensure proper participant structure
  const transformReservationData = (reservation) => {
    if (!reservation) return null;

    // Create participants array including main reserver + exactly 3 additional participants
    const mainReserver = {
      name: reservation.userId?.name || "Unknown User",
      id_number: reservation.userId?.id_number || "N/A",
      course: reservation.userId?.course || "N/A",
      year_level: reservation.userId?.year_level || "N/A",
      department: reservation.userId?.department || "N/A",
      isMainReserver: true
    };

    // Get only the first 3 additional participants to make total 4 (main + 3)
    const additionalParticipants = (reservation.participants || []).slice(0, 3);
    
    const allParticipants = [mainReserver, ...additionalParticipants];

    return {
      _id: reservation._id,
      userId: reservation.userId || {},
      room_Id: reservation.room_Id,
      roomName: reservation.roomName || "Unknown Room",
      location: reservation.location || "Unknown Location",
      purpose: reservation.purpose || "No purpose specified",
      datetime: reservation.datetime,
      endDatetime: reservation.endDatetime,
      date: reservation.date,
      numUsers: allParticipants.length,
      participants: allParticipants,
      status: reservation.status || "Pending",
      extensionRequested: reservation.extensionRequested || false,
      extensionStatus: reservation.extensionStatus || "Pending",
      extensionType: reservation.extensionType || "continuous",
      extensionMinutes: reservation.extensionMinutes,
      extensionHours: reservation.extensionHours,
      extendedEndDatetime: reservation.extendedEndDatetime,
      extensionReason: reservation.extensionReason,
      maxExtendedEndDatetime: reservation.maxExtendedEndDatetime,
      actualStartTime: reservation.actualStartTime,
      actualEndTime: reservation.actualEndTime,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt
    };
  };

  // Mark a notification as read
  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}/read`, {}, { withCredentials: true });
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_URL}/read-all`, {}, { withCredentials: true });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    if (notification.type === "report") {
      openReportModal(notification);
    } else if (notification.type === "reservation") {
      openReservationModal(notification);
    }
  };

  // Handle report updates from modal
  const handleReportUpdated = () => {
    fetchNotifications(activeFilter);
  };

  // Handle reservation updates from modal
  const handleReservationUpdated = () => {
    fetchNotifications(activeFilter);
  };

  useEffect(() => {
    fetchNotifications(activeFilter);
  }, [activeFilter]);

  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !notification.isRead;
    return notification.type === activeFilter;
  });

  // Format notification message
  const formatNotificationMessage = (notification) => {
    const userName = notification.userId?.name || "Unknown User";
    const roomName = notification.reservationId?.roomName || "Unknown Room";

    switch (notification.type) {
      case "reservation":
        return `New reservation request by ${userName} for ${roomName}`;
      case "report":
        return `New maintenance report submitted by ${userName}`;
      case "system":
        return notification.message || "System notification";
      case "alert":
        return `Alert: ${notification.message}`;
      default:
        return notification.message || "Notification";
    }
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    const icons = {
      reservation: <Calendar size={20} className="text-blue-600" />,
      report: <Shield size={20} className="text-orange-600" />,
      system: <AlertCircle size={20} className="text-gray-600" />,
      alert: <AlertCircle size={20} className="text-red-600" />,
      default: <AlertCircle size={20} className="text-gray-600" />
    };
    return icons[type] || icons.default;
  };

  // Get notification type color
  const getTypeColor = (type) => {
    const colors = {
      reservation: "bg-blue-100 text-blue-800",
      report: "bg-orange-100 text-orange-800",
      system: "bg-gray-100 text-gray-800",
      alert: "bg-red-100 text-red-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <>
      <AdminNavigation setView={setView} currentView="adminNotifications" />
      <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white px-6 py-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-[#CC0000]">Admin Notifications</h1>
            <p className="text-gray-600">System overview and administrative alerts</p>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-lg shadow-xs border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">Total</p>
                  <p className="text-lg font-bold text-gray-900">{notifications.length}</p>
                </div>
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <AlertCircle size={16} className="text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-xs border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">Unread</p>
                  <p className="text-lg font-bold text-gray-900">
                    {notifications.filter(n => !n.isRead).length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                  <AlertCircle size={16} className="text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-xs border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">Reports</p>
                  <p className="text-lg font-bold text-gray-900">
                    {notifications.filter(n => n.type === "report").length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Shield size={16} className="text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-xs border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">Reservations</p>
                  <p className="text-lg font-bold text-gray-900">
                    {notifications.filter(n => n.type === "reservation").length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <Calendar size={16} className="text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Notifications Panel */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Filters */}
            <div className="border-b border-gray-200 p-4 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
                <div className="flex flex-wrap gap-1">
                  {["all", "unread", "reservation", "report", "system", "alert"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                        activeFilter === filter 
                          ? "bg-[#CC0000] text-white" 
                          : "text-gray-700 hover:bg-gray-200 bg-white border border-gray-300"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                  <button
                    onClick={markAllAsRead}
                    disabled={!notifications.some(n => !n.isRead)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Mark All Read
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#CC0000]"></div>
                  <span className="ml-2 text-sm text-gray-600">Loading notifications...</span>
                </div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                  <AlertCircle size={24} className="text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">No notifications found</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  {activeFilter !== "all" 
                    ? `No ${activeFilter} notifications available.` 
                    : "All caught up! No new notifications."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => {
                  const formattedMessage = formatNotificationMessage(notification);
                  
                  return (
                    <div 
                      key={notification._id} 
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer group ${
                        !notification.isRead ? "bg-blue-50 border-l-2 border-blue-500" : "border-l-2 border-transparent"
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          !notification.isRead 
                            ? "bg-blue-100 text-blue-600" 
                            : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-medium px-2 py-1 rounded-md ${getTypeColor(notification.type)} capitalize`}>
                                {notification.type}
                              </span>
                              {!notification.isRead && (
                                <span className="flex items-center gap-1 text-xs font-medium text-[#CC0000]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#CC0000] flex-shrink-0"></span>
                                  Unread
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : "Unknown date"}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-800 leading-relaxed">
                            {formattedMessage}
                          </p>

                          {/* Action buttons */}
                          <div className="mt-2 flex gap-2">
                            {notification.type === "report" && (
                              <button 
                                className="text-xs text-[#CC0000] hover:text-[#990000] font-medium inline-flex items-center gap-1 transition-colors px-2 py-1 bg-red-50 rounded hover:bg-red-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openReportModal(notification);
                                }}
                              >
                                View Report
                                <ChevronRight size={12} />
                              </button>
                            )}
                            {notification.type === "reservation" && (
                              <button 
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 transition-colors px-2 py-1 bg-blue-50 rounded hover:bg-blue-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openReservationModal(notification);
                                }}
                              >
                                View Reservation
                                <ChevronRight size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Report Modal */}
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

        {/* Reservation Modal */}
        {showReservationModal && selectedReservation && (
          <AdminReservationModal 
            reservation={selectedReservation}
            onClose={() => {
              setShowReservationModal(false);
              setSelectedReservation(null);
            }}
            onActionSuccess={handleReservationUpdated}
            currentUser={currentUser}
          />
        )}
      </main>
    </>
  );
}

export default AdminNotification;