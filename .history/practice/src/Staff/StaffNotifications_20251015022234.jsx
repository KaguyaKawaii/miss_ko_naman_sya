import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import StaffNavigation from "./StaffNavigation";
import { Bell, AlertCircle, Calendar, RefreshCw, Eye, X, Clock, CheckCircle, PlayCircle, Users, MapPin, FileText, User, Building } from "lucide-react";

function StaffNotifications({ setView, staff }) {
  const [reservations, setReservations] = useState([]);
  const [reportNotifications, setReportNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState(null);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Normalize floor names
  const normalizeFloor = (str) => {
    if (!str) return "";
    const lower = str.toLowerCase().trim();
    if (lower.includes("ground")) return "ground floor";
    if (lower.includes("first") || lower.includes("1st")) return "1st floor";
    if (lower.includes("second") || lower.includes("2nd")) return "2nd floor";
    if (lower.includes("third") || lower.includes("3rd")) return "3rd floor";
    if (lower.includes("fourth") || lower.includes("4th")) return "4th floor";
    if (lower.includes("fifth") || lower.includes("5th")) return "5th floor";
    return lower;
  };

  // Fetch unread count separately
  const fetchUnreadCount = async () => {
    if (!staff?._id) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/notifications/unread-count/${staff._id}`);
      setUnreadCount(response.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
      const localUnreadCount = filteredNotifications.filter(n => !n.isRead).length;
      setUnreadCount(localUnreadCount);
    }
  };

  const fetchData = async () => {
    if (!staff?._id) return;
    setRefreshing(true);
    try {
      const resNotifications = await axios.get(`http://localhost:5000/api/notifications/staff/${staff._id}`);
      const staffNotifications = resNotifications.data || [];

      const reservationData = [];
      const reportData = [];

      staffNotifications.forEach(notification => {
        if (notification.reservationId && typeof notification.reservationId === 'object') {
          reservationData.push({
            ...notification.reservationId,
            notificationId: notification._id,
            isRead: notification.isRead || false,
            type: "reservation"
          });
        }
        if (notification.reportId && typeof notification.reportId === 'object') {
          reportData.push({
            ...notification.reportId,
            notificationId: notification._id,
            isRead: notification.isRead || false,
            type: "report"
          });
        }
      });

      const staffFloor = normalizeFloor(staff.floor);
      const filteredReservations = reservationData.filter(
        reservation => normalizeFloor(reservation.location) === staffFloor
      );

      setReservations(filteredReservations);
      setReportNotifications(reportData);
      await fetchUnreadCount();

    } catch (err) {
      console.error("Failed to fetch staff notifications:", err);
      try {
        const resReservations = await axios.get("http://localhost:5000/reservations");
        const staffFloor = normalizeFloor(staff.floor);
        const filtered = resReservations.data.filter(
          (reservation) => normalizeFloor(reservation.location) === staffFloor
        );
        
        const reservationsWithReadStatus = filtered.map(res => ({
          ...res,
          isRead: false,
          type: "reservation"
        }));
        
        setReservations(reservationsWithReadStatus);

        const resReports = await axios.get(`http://localhost:5000/reports/staff/${staff._id}`);
        const reportsWithReadStatus = (resReports.data || []).map(rep => ({
          ...rep,
          isRead: false,
          type: "report"
        }));
        setReportNotifications(reportsWithReadStatus);

        const fallbackUnreadCount = [...reservationsWithReadStatus, ...reportsWithReadStatus]
          .filter(n => !n.isRead).length;
        setUnreadCount(fallbackUnreadCount);

      } catch (fallbackErr) {
        console.error("Fallback fetch also failed:", fallbackErr);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [staff?._id, staff?.floor]);

  // Combine reservations and reports into notifications
  useEffect(() => {
    const reservationNotifications = reservations.map(res => ({
      ...res,
      type: "reservation",
      message: `${res.roomName} Reservation - ${res.status}`,
      createdAt: res.createdAt,
      status: res.status,
      isRead: res.isRead || false,
      notificationId: res.notificationId
    }));

    const reportNotificationsFormatted = reportNotifications.map(rep => ({
      ...rep,
      type: "report",
      message: `${rep.category} Report - ${rep.status}`,
      createdAt: rep.createdAt,
      status: rep.status,
      isRead: rep.isRead || false,
      notificationId: rep.notificationId
    }));

    const allNotifications = [...reservationNotifications, ...reportNotificationsFormatted]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    let results = [...allNotifications];
    
    if (statusFilter !== "all") {
      results = results.filter(notif => notif.status === statusFilter);
    }
    
    if (unreadOnly) {
      results = results.filter(notif => !notif.isRead);
    }
    
    setFilteredNotifications(results);
  }, [reservations, reportNotifications, statusFilter, unreadOnly]);

  // Mark notification as read
  const markAsRead = async (notificationId, itemId, itemType) => {
    try {
      setFilteredNotifications(prev => prev.map(notif => 
        (notif._id === itemId || notif.notificationId === notificationId) ? { ...notif, isRead: true } : notif
      ));
      
      setReservations(prev => prev.map(res => 
        (res._id === itemId || res.notificationId === notificationId) ? { ...res, isRead: true } : res
      ));
      
      setReportNotifications(prev => prev.map(rep => 
        (rep._id === itemId || rep.notificationId === notificationId) ? { ...rep, isRead: true } : rep
      ));

      if (notificationId) {
        await axios.put(`http://localhost:5000/api/notifications/${notificationId}/read`);
      } else {
        await axios.put(`http://localhost:5000/api/notifications/mark-all-read/${staff._id}`);
      }

      await fetchUnreadCount();

    } catch (err) {
      console.error("Failed to mark as read:", err);
      const currentUnread = unreadCount - 1;
      setUnreadCount(currentUnread >= 0 ? currentUnread : 0);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      setFilteredNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setReservations(prev => prev.map(res => ({ ...res, isRead: true })));
      setReportNotifications(prev => prev.map(rep => ({ ...rep, isRead: true })));

      await axios.put(`http://localhost:5000/api/notifications/mark-all-read/${staff._id}`);
      setUnreadCount(0);

    } catch (err) {
      console.error("Failed to mark all as read:", err);
      setUnreadCount(0);
    }
  };

  // Refresh data function
  const refreshData = async () => {
    await fetchData();
    await fetchUnreadCount();
  };

  const formatDateTime = (dt) =>
    new Date(dt).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return formatDateTime(date);
  };

  const statusColor = (status) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800 border-green-200";
      case "Rejected":
      case "Cancelled":
      case "Expired": return "bg-red-100 text-red-800 border-red-200";
      case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "In Progress":
      case "Ongoing": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Resolved": return "bg-green-50 text-green-800 border-green-100";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending": return <Clock className="w-4 h-4" />;
      case "In Progress":
      case "Ongoing": return <PlayCircle className="w-4 h-4" />;
      case "Resolved":
      case "Approved": return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const updateReportStatus = async (newStatus) => {
    if (!selectedReport) return;
    try {
      await axios.put(`http://localhost:5000/reports/${selectedReport._id}`, { status: newStatus });
      setReportNotifications((prev) =>
        prev.map((r) => (r._id === selectedReport._id ? { ...r, status: newStatus } : r))
      );
      
      const updated = { ...selectedReport, status: newStatus };
      setSelectedReport(updated);

      if (newStatus === "Resolved") {
        setTimeout(() => setSelectedReport(null), 1500);
      }
    } catch (err) {
      console.error("Failed to update report status:", err);
      alert("Failed to update report status. Please try again.");
    }
  };

  const handleApproveReservation = async (reservationId) => {
    setIsProcessing(true);
    setProcessingAction('approve');
    try {
      await axios.put(`http://localhost:5000/reservations/${reservationId}/status`, {
        status: "Approved"
      });
      setReservations(prev => prev.map(res => 
        res._id === reservationId ? { ...res, status: "Approved" } : res
      ));
      setSelectedReservation(prev => prev ? { ...prev, status: "Approved" } : null);
      refreshData();
    } catch (err) {
      console.error("Failed to approve reservation:", err);
      alert("Failed to approve reservation. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingAction(null);
    }
  };

  const handleRejectReservation = async (reservationId) => {
    setIsProcessing(true);
    setProcessingAction('reject');
    try {
      await axios.put(`http://localhost:5000/reservations/${reservationId}/status`, {
        status: "Rejected"
      });
      setReservations(prev => prev.map(res => 
        res._id === reservationId ? { ...res, status: "Rejected" } : res
      ));
      setSelectedReservation(prev => prev ? { ...prev, status: "Rejected" } : null);
      refreshData();
    } catch (err) {
      console.error("Failed to reject reservation:", err);
      alert("Failed to reject reservation. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingAction(null);
    }
  };

  const handleViewReservations = () => {
    setView("staffReservation");
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setUnreadOnly(false);
  };

  const currentUnreadCount = filteredNotifications.filter(n => !n.isRead).length;

  // Custom SVG Icons
  const ClockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  const CheckCircleIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const BellIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const BellOffIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.62998 8.62999C8.20998 9.23999 7.99998 9.99999 7.99998 10.83V11C7.99998 15 5.99998 17 5.99998 17H15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17.67 17.67C16.94 17.94 16.02 18 15 18H9C6.5 18 4.5 16 4.5 13.5V10.84C4.5 9.67 4.95 8.55 5.75 7.7L6.07 7.37" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.99998 4.16C9.02998 4.16 9.04998 4.16 9.07998 4.16C9.67998 4.09 10.26 4 10.83 3.85" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14.92 4.16C14.57 3.4 14.02 2.77 13.33 2.33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 8C19.5304 8 20.0391 8.21071 20.4142 8.58579C20.7893 8.96086 21 9.46957 21 10V11C21 12.66 20.44 14.11 19.5 15.31" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 21L3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const FilterIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const CloseIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const EyeIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const RefreshIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23 4V10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M1 20V14H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3.51 9C4.01717 7.56678 4.87913 6.2854 6.01547 5.27542C7.1518 4.26543 8.52547 3.55976 10.0083 3.22426C11.4911 2.88875 13.0348 2.93434 14.4952 3.35677C15.9556 3.77921 17.2853 4.56471 18.36 5.64L23 10M1 14L5.64 18.36C6.71475 19.4353 8.04437 20.2208 9.50481 20.6432C10.9652 21.0657 12.5089 21.1113 13.9917 20.7757C15.4745 20.4402 16.8482 19.7346 17.9845 18.7246C19.1209 17.7146 19.9828 16.4332 20.49 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  // Reservation Modal Component (copied design from AdminReservationModal)
  const ReservationModal = ({ reservation, onClose, onApprove, onReject, isProcessing, processingAction }) => {
    if (!reservation) return null;

    const formatPHDateTime = (iso) => {
      if (!iso) return "N/A";
      return new Date(iso).toLocaleString("en-PH", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    const getStatusConfig = (status) => {
      const configs = {
        Pending: { 
          color: "bg-amber-100 text-amber-800 border-amber-200", 
          icon: <Clock size={14} />,
        },
        Approved: { 
          color: "bg-emerald-100 text-emerald-800 border-emerald-200", 
          icon: <CheckCircle size={14} />,
        },
        Ongoing: { 
          color: "bg-blue-100 text-blue-800 border-blue-200", 
          icon: <PlayCircle size={14} />,
        },
        Rejected: { 
          color: "bg-rose-100 text-rose-800 border-rose-200", 
          icon: <X size={14} />,
        },
        Cancelled: { 
          color: "bg-gray-100 text-gray-800 border-gray-300", 
          icon: <X size={14} />,
        },
        Expired: { 
          color: "bg-orange-100 text-orange-800 border-orange-200", 
          icon: <Clock size={14} />,
        }
      };
      return configs[status] || configs.Pending;
    };

    const statusConfig = getStatusConfig(reservation.status);

    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-white p-6 border-b border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-300">
                  <Building size={24} className="text-gray-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{reservation.roomName}</h1>
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="flex items-center gap-1.5 text-sm">
                      <MapPin size={16} />
                      {reservation.location}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Calendar size={16} />
                      {formatPHDateTime(reservation.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 text-sm font-medium ${statusConfig.color}`}>
                  {statusConfig.icon}
                  {reservation.status}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="space-y-6">
              {/* Quick Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Start Time</p>
                      <p className="text-lg font-semibold text-gray-900">{formatPHDateTime(reservation.datetime)}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                      <Clock size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">End Time</p>
                      <p className="text-lg font-semibold text-gray-900">{formatPHDateTime(reservation.endDatetime)}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
                      <Clock size={20} />
                    </div>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <User size={20} className="text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Reserved By</h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm bg-gradient-to-br from-blue-400 to-blue-500">
                    {reservation.userId?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{reservation.userId?.name || "Unknown User"}</p>
                    <p className="text-sm text-gray-600">{reservation.userId?.email || "No email"}</p>
                  </div>
                </div>
              </div>

              {/* Purpose */}
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FileText size={20} className="text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Reservation Purpose</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{reservation.purpose}</p>
              </div>

              {/* Participants */}
              {reservation.participants && reservation.participants.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Users size={20} className="text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Additional Participants</h3>
                  </div>
                  <div className="space-y-2">
                    {reservation.participants.map((participant, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs bg-gradient-to-br from-green-400 to-green-500">
                          {participant.name?.charAt(0) || "P"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{participant.name}</p>
                          <p className="text-xs text-gray-600">{participant.id_number}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 bg-gray-50 p-6">
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              {reservation.status === "Pending" && (
                <>
                  <button
                    onClick={() => onReject(reservation._id)}
                    disabled={isProcessing}
                    className="px-6 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm flex items-center gap-2"
                  >
                    <X size={16} />
                    {isProcessing && processingAction === 'reject' ? "Processing..." : "Reject"}
                  </button>
                  <button
                    onClick={() => onApprove(reservation._id)}
                    disabled={isProcessing}
                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    {isProcessing && processingAction === 'approve' ? "Processing..." : "Approve"}
                  </button>
                </>
              )}
              {reservation.status !== "Pending" && (
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium text-sm"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <StaffNavigation setView={setView} currentView="staffNotification" staff={staff} unseenCount={unreadCount} />
        <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50 flex flex-col">
          <header className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-[#CC0000]">
                  Staff Notifications
                </h1>
                <p className="text-gray-600">
                  Reservations and Reports assigned to you
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </header>

          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto w-full">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="flex justify-between">
                        <div className="h-5 bg-gray-200 rounded w-1/4 mb-3"></div>
                        <div className="h-5 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <StaffNavigation setView={setView} currentView="staffNotification" staff={staff} unseenCount={unreadCount} />
      <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#CC0000]">
                Staff Notifications
              </h1>
              <p className="text-gray-600">
                Reservations and Reports assigned to you
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
              <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Header with stats and filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${currentUnreadCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                    <span className="text-sm text-gray-600">
                      {currentUnreadCount} unread {currentUnreadCount === 1 ? 'notification' : 'notifications'}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setUnreadOnly(!unreadOnly)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all cursor-pointer flex-1 sm:flex-none justify-center min-w-[140px] ${
                      unreadOnly 
                        ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {unreadOnly ? <BellOffIcon /> : <BellIcon />}
                    {unreadOnly ? 'Unread Only' : 'All Notifications'}
                  </button>
                  
                  <button 
                    onClick={() => setShowFilterModal(true)}
                    className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all text-sm cursor-pointer flex-1 sm:flex-none justify-center min-w-[100px]"
                  >
                    <FilterIcon />
                    Filter
                  </button>
                  
                  {(statusFilter !== "all" || unreadOnly) && (
                    <button 
                      onClick={clearFilters}
                      className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all text-sm cursor-pointer flex-1 sm:flex-none justify-center min-w-[120px]"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Active filters display */}
              {(statusFilter !== "all" || unreadOnly) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {statusFilter !== "all" && (
                    <div className="bg-gray-100 px-3 py-1.5 rounded-full text-sm flex items-center gap-1 border border-gray-300">
                      <span className="text-gray-700">Status: {statusFilter}</span>
                      <button 
                        onClick={() => setStatusFilter("all")}
                        className="text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
                      >
                        <CloseIcon />
                      </button>
                    </div>
                  )}
                  {unreadOnly && (
                    <div className="bg-gray-100 px-3 py-1.5 rounded-full text-sm flex items-center gap-1 border border-gray-300">
                      <span className="text-gray-700">Unread Only</span>
                      <button 
                        onClick={() => setUnreadOnly(false)}
                        className="text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
                      >
                        <CloseIcon />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mark all as read button */}
              {currentUnreadCount > 0 && !unreadOnly && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-red-700 font-medium">
                      {currentUnreadCount} unread {currentUnreadCount === 1 ? 'notification' : 'notifications'}
                    </span>
                  </div>
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-red-200 hover:bg-red-50 transition-all cursor-pointer w-full sm:w-auto justify-center"
                  >
                    <CheckCircleIcon />
                    Mark all as read
                  </button>
                </div>
              )}

              {/* Notifications list */}
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="mx-auto text-gray-300 mb-4" style={{ width: '64px', height: '64px' }}>
                    <BellIcon />
                  </div>
                  <p className="text-gray-500 text-base sm:text-lg mb-2">
                    {reservations.length === 0 && reportNotifications.length === 0
                      ? "You don't have any notifications yet." 
                      : "No notifications match your filters."}
                  </p>
                  <p className="text-gray-400 text-xs sm:text-sm mb-4">
                    {reservations.length === 0 && reportNotifications.length === 0
                      ? "Reservations and reports for your floor will appear here." 
                      : "Try adjusting your filters to see more results."}
                  </p>
                  {(statusFilter !== "all" || unreadOnly) && (
                    <button 
                      onClick={clearFilters}
                      className="text-red-600 font-medium hover:text-red-800 transition-all flex items-center gap-1 mx-auto cursor-pointer hover:underline"
                    >
                      Clear filters
                      <CloseIcon />
                    </button>
                  )}
                </div>
              ) : (
                <ul className="space-y-3">
                  {filteredNotifications.map((notif) => (
                    <li
                      key={notif._id}
                      className={`border rounded-xl p-4 transition-all duration-300 ${
                        notif.isRead 
                          ? "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm" 
                          : "bg-red-50 border-red-200 hover:border-red-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                            <h3 className={`font-medium text-sm leading-relaxed ${notif.isRead ? 'text-gray-800' : 'text-gray-900'}`}>
                              {notif.message}
                            </h3>
                            <div className="flex items-center gap-2 shrink-0 sm:ml-2">
                              <span
                                className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-semibold border ${statusColor(
                                  notif.status
                                )}`}
                              >
                                {notif.status}
                              </span>
                              {!notif.isRead && (
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center text-xs text-gray-500 gap-1 mb-2">
                            <ClockIcon />
                            {formatRelativeTime(notif.createdAt)}
                            {formatRelativeTime(notif.createdAt).includes("ago") && (
                              <span className="text-gray-400 hidden sm:inline">• {formatDateTime(notif.createdAt)}</span>
                            )}
                          </div>

                          {/* Additional info based on type */}
                          <div className="text-xs text-gray-600 mb-2">
                            {notif.type === "reservation" && (
                              <span>Reserved by {notif.userId?.name || "Unknown"} • {notif.location}</span>
                            )}
                            {notif.type === "report" && (
                              <span>Reported by {notif.reportedBy || "Unknown"} • {notif.floor} {notif.room ? `• ${notif.room}` : ""}</span>
                            )}
                          </div>

                          {/* Mark as read button for unread notifications */}
                          {!notif.isRead && (
                            <button
                              onClick={() => markAsRead(notif.notificationId, notif._id, notif.type)}
                              className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1 mt-2 cursor-pointer hover:underline transition-colors"
                            >
                              <CheckCircleIcon />
                              Mark as read
                            </button>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 items-start sm:items-end shrink-0">
                          <button
                            onClick={() => {
                              if (notif.type === "reservation") {
                                setSelectedReservation(notif);
                                if (!notif.isRead) {
                                  markAsRead(notif.notificationId, notif._id, notif.type);
                                }
                              } else {
                                setSelectedReport(notif);
                                if (!notif.isRead) {
                                  markAsRead(notif.notificationId, notif._id, notif.type);
                                }
                              }
                            }}
                            className="text-red-600 text-sm font-medium hover:text-red-800 flex items-center gap-1 whitespace-nowrap px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all cursor-pointer border border-transparent hover:border-red-200 w-full sm:w-auto justify-center"
                          >
                            <EyeIcon />
                            View Details
                          </button>
                          
                          {notif.type === "reservation" && (
                            <button
                              onClick={handleViewReservations}
                              className="text-blue-600 text-sm font-medium hover:text-blue-800 flex items-center gap-1 whitespace-nowrap px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all cursor-pointer border border-transparent hover:border-blue-200 w-full sm:w-auto justify-center"
                            >
                              View All Reservations
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <FilterIcon />
                  <h3 className="text-lg font-bold text-gray-800">Filter Notifications</h3>
                </div>
                <button 
                  onClick={() => setShowFilterModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100 cursor-pointer transition-all"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Filter by Status</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {["all", "Pending", "Approved", "Rejected", "In Progress", "Resolved", "Ongoing", "Cancelled", "Expired"].map(status => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-2 rounded-lg text-sm border transition-all cursor-pointer ${
                          statusFilter === status 
                            ? status === "all" 
                              ? "bg-red-100 text-red-800 border-red-300" 
                              : statusColor(status) + " border-current"
                            : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                        }`}
                      >
                        {status === "all" ? "All Statuses" : status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="text-sm font-medium text-gray-700">Show only unread</label>
                  <button
                    onClick={() => setUnreadOnly(!unreadOnly)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all cursor-pointer ${
                      unreadOnly ? 'bg-red-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all ${
                      unreadOnly ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 pt-5 border-t border-gray-200">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all cursor-pointer order-2 sm:order-1"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium cursor-pointer order-1 sm:order-2"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Details Modal */}
      {selectedReservation && (
        <ReservationModal
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
          onApprove={handleApproveReservation}
          onReject={handleRejectReservation}
          isProcessing={isProcessing}
          processingAction={processingAction}
        />
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {selectedReport.category} Report
              </h2>
              <div className="flex flex-wrap gap-2 mb-4">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusColor(
                    selectedReport.status
                  )}`}
                >
                  {getStatusIcon(selectedReport.status)}
                  {selectedReport.status}
                </span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {selectedReport.floor}
                </span>
                {selectedReport.room && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {selectedReport.room}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Report Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Reported By</label>
                    <p className="font-medium">{selectedReport.reportedBy}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Date Reported</label>
                    <p className="font-medium">{formatDateTime(selectedReport.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Priority</label>
                    <p
                      className={`font-medium ${
                        selectedReport.priority === "High"
                          ? "text-red-600"
                          : selectedReport.priority === "Medium"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {selectedReport.priority}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {selectedReport.description}
                </p>
              </div>
            </div>

            {selectedReport.image && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Attached Image</h3>
                <img
                  src={selectedReport.image}
                  alt="Report"
                  className="max-w-full h-auto rounded-lg border border-gray-200"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
              {selectedReport.status === "Pending" && (
                <>
                  <button
                    onClick={() => updateReportStatus("In Progress")}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <PlayCircle size={16} />
                    Start Progress
                  </button>
                  <button
                    onClick={() => updateReportStatus("Resolved")}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <CheckCircle size={16} />
                    Mark Resolved
                  </button>
                </>
              )}
              {selectedReport.status === "In Progress" && (
                <button
                  onClick={() => updateReportStatus("Resolved")}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <CheckCircle size={16} />
                  Mark Resolved
                </button>
              )}
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default StaffNotifications;