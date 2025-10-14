import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import StaffNavigation from "./StaffNavigation";
import { Bell, AlertCircle, Calendar, RefreshCw, Eye, X, Clock, CheckCircle, PlayCircle } from "lucide-react";
import ReservationModal from "./Modals/ReservationModal";

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
  const [showReportModal, setShowReportModal] = useState(false);

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
      // Fallback: calculate from local state
      const localUnreadCount = filteredNotifications.filter(n => !n.isRead).length;
      setUnreadCount(localUnreadCount);
    }
  };

  const fetchData = async () => {
    if (!staff?._id) return;
    setRefreshing(true);
    try {
      // Get staff notifications from the API
      const resNotifications = await axios.get(`http://localhost:5000/api/notifications/staff/${staff._id}`);
      const staffNotifications = resNotifications.data || [];

      // Process notifications to extract reservations and reports
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

      // Filter reservations by staff floor
      const staffFloor = normalizeFloor(staff.floor);
      const filteredReservations = reservationData.filter(
        reservation => normalizeFloor(reservation.location) === staffFloor
      );

      setReservations(filteredReservations);
      setReportNotifications(reportData);

      // Fetch unread count after loading data
      await fetchUnreadCount();

    } catch (err) {
      console.error("Failed to fetch staff notifications:", err);
      // Fallback: fetch reservations and reports separately if notifications fail
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

        // Calculate unread count from fallback data
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

  // Mark notification as read - UPDATED to refresh unread count
  const markAsRead = async (notificationId, itemId, itemType) => {
    try {
      // Update local state immediately for better UX
      setFilteredNotifications(prev => prev.map(notif => 
        (notif._id === itemId || notif.notificationId === notificationId) ? { ...notif, isRead: true } : notif
      ));
      
      setReservations(prev => prev.map(res => 
        (res._id === itemId || res.notificationId === notificationId) ? { ...res, isRead: true } : res
      ));
      
      setReportNotifications(prev => prev.map(rep => 
        (rep._id === itemId || rep.notificationId === notificationId) ? { ...rep, isRead: true } : rep
      ));

      // Call backend to mark as read if we have a notification ID
      if (notificationId) {
        await axios.put(`http://localhost:5000/api/notifications/${notificationId}/read`);
      } else {
        // If no notification ID, try to mark all as read for staff
        await axios.put(`http://localhost:5000/api/notifications/mark-all-read/${staff._id}`);
      }

      // Refresh unread count after marking as read
      await fetchUnreadCount();

    } catch (err) {
      console.error("Failed to mark as read:", err);
      // Keep local state changes even if API fails
      // Update unread count locally
      const currentUnread = unreadCount - 1;
      setUnreadCount(currentUnread >= 0 ? currentUnread : 0);
    }
  };

  // Mark all as read - UPDATED to refresh unread count
  const markAllAsRead = async () => {
    try {
      // Update all local state first
      setFilteredNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      setReservations(prev => prev.map(res => ({ ...res, isRead: true })));
      setReportNotifications(prev => prev.map(rep => ({ ...rep, isRead: true })));

      // Call API to mark all as read
      await axios.put(`http://localhost:5000/api/notifications/mark-all-read/${staff._id}`);

      // Update unread count to 0
      setUnreadCount(0);

    } catch (err) {
      console.error("Failed to mark all as read:", err);
      // Local state already updated for better UX
      setUnreadCount(0);
    }
  };

  // Refresh data function - UPDATED to include unread count
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

  // Open report details modal (from AdminNotification)
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
        markAsRead(notification._id, notification._id, "report");
      }
    } catch (err) {
      console.error("Failed to fetch report details:", err);
      // Even if fetching details fails, show the modal with basic notification info
      setSelectedReport(notification);
      setShowReportModal(true);
    }
  };

  // Handle report updates from modal
  const handleReportUpdated = () => {
    // Refresh notifications when a report is updated
    fetchData();
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
        {/* Header - Keeping the same size */}
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
                      ? "You don't have any notifications yet"
                      : "No notifications match your current filters"}
                  </p>
                  <p className="text-gray-400 text-sm mb-4">
                    {reservations.length === 0 && reportNotifications.length === 0
                      ? "New reservations and reports will appear here"
                      : "Try adjusting your filters to see more notifications"}
                  </p>
                  {(statusFilter !== "all" || unreadOnly) && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification._id || notification.notificationId}
                      className={`border rounded-xl p-4 transition-all cursor-pointer group hover:shadow-sm ${
                        notification.isRead
                          ? "bg-white border-gray-200"
                          : "bg-blue-50 border-blue-200"
                      }`}
                      onClick={() => {
                        if (notification.type === "reservation") {
                          setSelectedReservation(notification);
                          if (!notification.isRead) {
                            markAsRead(notification.notificationId, notification._id, "reservation");
                          }
                        } else if (notification.type === "report") {
                          openReportModal(notification);
                        }
                      }}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${
                              notification.type === "reservation"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-orange-100 text-orange-600"
                            }`}
                          >
                            {notification.type === "reservation" ? (
                              <Calendar size={16} />
                            ) : (
                              <AlertCircle size={16} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusColor(
                                  notification.status
                                )}`}
                              >
                                {getStatusIcon(notification.status)}
                                {notification.status}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatRelativeTime(notification.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-900 font-medium truncate">
                              {notification.message}
                            </p>
                            {notification.type === "reservation" && (
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.roomName} • {notification.purpose}
                              </p>
                            )}
                            {notification.type === "report" && (
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.category} • {notification.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          )}
                          <Eye className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter Modal */}
        {showFilterModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Filter Notifications</h3>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="unreadOnly"
                    checked={unreadOnly}
                    onChange={(e) => setUnreadOnly(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="unreadOnly" className="text-sm text-gray-700 cursor-pointer">
                    Show unread notifications only
                  </label>
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reservation Modal */}
        {selectedReservation && (
          <ReservationModal
            reservation={selectedReservation}
            onClose={() => setSelectedReservation(null)}
            onApprove={handleApproveReservation}
            onReject={handleRejectReservation}
            isProcessing={isProcessing}
            processingAction={processingAction}
            userRole="staff"
          />
        )}

        {/* Report Details Modal - Copied from AdminNotification */}
        {showReportModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Report Details</h3>
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setSelectedReport(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Report Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Report ID</h4>
                    <p className="text-sm text-gray-900">{selectedReport._id}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColor(selectedReport.status)}`}>
                      {getStatusIcon(selectedReport.status)}
                      {selectedReport.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Category</h4>
                    <p className="text-sm text-gray-900">{selectedReport.category}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Priority</h4>
                    <p className="text-sm text-gray-900">{selectedReport.priority || 'Normal'}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedReport.description}
                  </p>
                </div>

                {/* Location Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Location</h4>
                    <p className="text-sm text-gray-900">{selectedReport.location}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Specific Area</h4>
                    <p className="text-sm text-gray-900">{selectedReport.specificArea || 'Not specified'}</p>
                  </div>
                </div>

                {/* Reporter Information */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Reporter Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs font-medium text-gray-400">Name</h5>
                      <p className="text-sm text-gray-900">{selectedReport.reporterName}</p>
                    </div>
                    <div>
                      <h5 className="text-xs font-medium text-gray-400">Contact</h5>
                      <p className="text-sm text-gray-900">{selectedReport.reporterContact}</p>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Timestamps</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-xs font-medium text-gray-400">Reported At</h5>
                      <p className="text-sm text-gray-900">{formatDateTime(selectedReport.createdAt)}</p>
                    </div>
                    {selectedReport.updatedAt && (
                      <div>
                        <h5 className="text-xs font-medium text-gray-400">Last Updated</h5>
                        <p className="text-sm text-gray-900">{formatDateTime(selectedReport.updatedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Details from fetched report */}
                {selectedReport.reportDetails && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Additional Details</h4>
                    <div className="space-y-3">
                      {selectedReport.reportDetails.equipmentInvolved && (
                        <div>
                          <h5 className="text-xs font-medium text-gray-400">Equipment Involved</h5>
                          <p className="text-sm text-gray-900">{selectedReport.reportDetails.equipmentInvolved}</p>
                        </div>
                      )}
                      {selectedReport.reportDetails.urgencyLevel && (
                        <div>
                          <h5 className="text-xs font-medium text-gray-400">Urgency Level</h5>
                          <p className="text-sm text-gray-900">{selectedReport.reportDetails.urgencyLevel}</p>
                        </div>
                      )}
                      {selectedReport.reportDetails.additionalNotes && (
                        <div>
                          <h5 className="text-xs font-medium text-gray-400">Additional Notes</h5>
                          <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                            {selectedReport.reportDetails.additionalNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Status Update Actions */}
                {selectedReport.status !== 'Resolved' && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Update Status</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedReport.status === 'Pending' && (
                        <button
                          onClick={() => updateReportStatus('In Progress')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm cursor-pointer"
                        >
                          Mark as In Progress
                        </button>
                      )}
                      {selectedReport.status === 'In Progress' && (
                        <button
                          onClick={() => updateReportStatus('Resolved')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm cursor-pointer"
                        >
                          Mark as Resolved
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowReportModal(false);
                          setSelectedReport(null);
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}

                {selectedReport.status === 'Resolved' && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle size={16} />
                      <span className="text-sm font-medium">This report has been resolved</span>
                    </div>
                    <button
                      onClick={() => {
                        setShowReportModal(false);
                        setSelectedReport(null);
                      }}
                      className="mt-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default StaffNotifications;