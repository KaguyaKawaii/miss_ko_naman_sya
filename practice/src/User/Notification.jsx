import { useEffect, useState } from "react";
import axios from "axios";
import { Clock, CheckCircle, Bell, BellOff, Filter, X } from "lucide-react";
import socket from "../utils/socket";

function Notification({ user, setView, setSelectedReservation }) {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchNotifications();

      const handleNewNotification = (newNotif) => {
        if (newNotif.userId === user._id) {
          fetchNotifications();
        }
      };

      socket.on("notification", handleNewNotification);

      return () => {
        socket.off("notification", handleNewNotification);
      };
    }
  }, [user]);

  useEffect(() => {
    let results = [...notifications];
    
    if (statusFilter !== "all") {
      results = results.filter(notif => notif.status === statusFilter);
    }
    
    if (unreadOnly) {
      results = results.filter(notif => !notif.isRead);
    }
    
    setFilteredNotifications(results);
  }, [notifications, statusFilter, unreadOnly]);

  const fetchNotifications = () => {
    setLoading(true);
    axios
      .get(`http://localhost:5000/notifications/user/${user._id}`)
      .then((res) => {
        const sorted = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotifications(sorted);
        setFilteredNotifications(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch notifications:", err);
        setLoading(false);
      });
  };

  const markAsRead = (id) => {
    axios
      .put(`http://localhost:5000/notifications/${id}/read`)
      .then(() => fetchNotifications())
      .catch((err) => console.error("Failed to mark as read:", err));
  };

  const markAllAsRead = () => {
    axios
      .put(`http://localhost:5000/notifications/mark-all-read/${user._id}`)
      .then(() => fetchNotifications())
      .catch((err) => console.error("Failed to mark all as read:", err));
  };

  const formatDateTime = (date) =>
    new Date(date).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDateTime(date);
  };

  const statusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      case "Expired":
        return "bg-gray-200 text-gray-800";
      case "Ongoing":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setUnreadOnly(false);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
        <header className="bg-[#CC0000] text-white px-6 h-[50px] flex items-center shadow-md">
          <h1 className="text-2xl font-bold">Notifications</h1>
        </header>

        <div className="m-5 border border-gray-200 rounded-lg p-6 bg-white shadow-md overflow-y-auto">
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
<main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
 <header className="bg-[#CC0000] text-white px-6 h-[50px] min-h-[50px] max-h-[50px] flex items-center shadow-md">
            <h1 className="text-2xl font-bold">Notifications</h1>
        </header>

      <div className="m-5 border border-gray-200 rounded-lg p-6 bg-white shadow-md overflow-y-auto">
        {/* Header with stats and filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-gray-50 px-4 py-2 rounded-lg">
              <p className="text-sm text-gray-600">
                Total: <span className="font-bold text-gray-800">{notifications.length}</span>
                {unreadCount > 0 && (
                  <span className="ml-3">
                    Unread: <span className="font-bold text-[#CC0000]">{unreadCount}</span>
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setUnreadOnly(!unreadOnly)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${unreadOnly ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
            >
              {unreadOnly ? <BellOff size={16} /> : <Bell size={16} />}
              {unreadOnly ? 'Unread Only' : 'All Notifications'}
            </button>
            
            <button 
              onClick={() => setShowFilterModal(true)}
              className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              <Filter size={16} />
              Filter
            </button>
            
            {(statusFilter !== "all" || unreadOnly) && (
              <button 
                onClick={clearFilters}
                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Active filters display */}
        {(statusFilter !== "all" || unreadOnly) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {statusFilter !== "all" && (
              <div className="bg-gray-100 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                <span className="text-gray-700">Status: {statusFilter}</span>
                <button 
                  onClick={() => setStatusFilter("all")}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {unreadOnly && (
              <div className="bg-gray-100 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                <span className="text-gray-700">Unread Only</span>
                <button 
                  onClick={() => setUnreadOnly(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Mark all as read button */}
        {unreadCount > 0 && !unreadOnly && (
          <button
            onClick={markAllAsRead}
            className="mb-4 text-sm text-[#CC0000] hover:underline flex items-center gap-1"
          >
            <CheckCircle size={14} />
            Mark all as read
          </button>
        )}

        {/* Notifications list */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">
              {notifications.length === 0 
                ? "You don't have any notifications yet." 
                : "No notifications match your filters."}
            </p>
            {(statusFilter !== "all" || unreadOnly) && (
              <button 
                onClick={clearFilters}
                className="text-[#CC0000] font-medium mt-2 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <ul className="space-y-3">
            {filteredNotifications.map((notif) => (
              <li
                key={notif._id}
                className={`border rounded-xl p-4 transition-all ${notif.isRead 
                  ? "bg-white border-gray-200 hover:border-gray-300" 
                  : "bg-blue-50 border-blue-200 hover:border-blue-300"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-800">
                        {notif.message}
                      </h3>
                      <span
                        className={`inline-block text-xs px-2 py-1 rounded-full font-semibold ${statusColor(
                          notif.status
                        )}`}
                      >
                        {notif.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500 gap-1 mb-2">
                      <Clock size={14} />
                      {formatRelativeTime(notif.createdAt)}
                      {formatRelativeTime(notif.createdAt).includes("ago") && (
                        <span className="text-gray-400">• {formatDateTime(notif.createdAt)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    {notif.reservationId && (
                      <button
                        onClick={() => {
                          setSelectedReservation(notif.reservationId);
                          setView("reservationDetails");
                          markAsRead(notif._id);
                        }}
                        className="text-[#CC0000] text-sm font-medium hover:underline whitespace-nowrap"
                      >
                        View Details
                      </button>
                    )}

                    {!notif.isRead && (
                      <button
                        onClick={() => markAsRead(notif._id)}
                        className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
                      >
                        <CheckCircle size={14} /> Mark Read
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Filter Notifications</h3>
                <button 
                  onClick={() => setShowFilterModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setStatusFilter("all")}
                      className={`px-3 py-1.5 rounded-lg text-sm ${statusFilter === "all" ? "bg-[#CC0000] text-white" : "bg-gray-100 text-gray-700"}`}
                    >
                      All Statuses
                    </button>
                    <button
                      onClick={() => setStatusFilter("Approved")}
                      className={`px-3 py-1.5 rounded-lg text-sm ${statusFilter === "Approved" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      Approved
                    </button>
                    <button
                      onClick={() => setStatusFilter("Pending")}
                      className={`px-3 py-1.5 rounded-lg text-sm ${statusFilter === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => setStatusFilter("Rejected")}
                      className={`px-3 py-1.5 rounded-lg text-sm ${statusFilter === "Rejected" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      Rejected
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Show only unread</label>
                  <button
                    onClick={() => setUnreadOnly(!unreadOnly)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${unreadOnly ? 'bg-[#CC0000]' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${unreadOnly ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="px-4 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-red-700 transition"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Notification;