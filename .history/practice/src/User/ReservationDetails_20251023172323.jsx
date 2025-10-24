import React, { useState, useEffect } from "react";
import axios from "axios";
import { availableRoomImages } from "../data/roomImages";

function ReservationDetails({ reservation, setView, refreshReservations, user }) {
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showResultModal, setShowResultModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [processingAction, setProcessingAction] = useState("");
  const [conflictInfo, setConflictInfo] = useState(null);
  const [localReservation, setLocalReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEndEarlyConfirm, setShowEndEarlyConfirm] = useState(false);
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showApproveExtensionConfirm, setShowApproveExtensionConfirm] = useState(false);
  const [showRejectExtensionConfirm, setShowRejectExtensionConfirm] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Load reservation from localStorage on component mount and when reservation prop changes
  useEffect(() => {
    const loadReservation = () => {
      if (reservation) {
        setLocalReservation(reservation);
        localStorage.setItem('selectedReservation', JSON.stringify(reservation));
        setLoading(false);
        return;
      }

      const savedReservation = localStorage.getItem('selectedReservation');
      if (savedReservation) {
        try {
          setLocalReservation(JSON.parse(savedReservation));
        } catch (error) {
          console.error('Error parsing saved reservation:', error);
          localStorage.removeItem('selectedReservation');
        }
      }
      setLoading(false);
    };

    loadReservation();
  }, [reservation]);

  // Auto-refresh functionality for real-time updates
  useEffect(() => {
    if (!localReservation) return;

    const interval = setInterval(() => {
      refreshReservationData();
    }, 10000);

    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [localReservation]);

  const refreshReservationData = async () => {
    if (!localReservation?._id) return;

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/reservations/${localReservation._id}`);
      const updatedReservation = response.data;
      
      setLocalReservation(updatedReservation);
      localStorage.setItem('selectedReservation', JSON.stringify(updatedReservation));
      
      if (refreshReservations) {
        refreshReservations();
      }
    } catch (error) {
      console.error('Error refreshing reservation data:', error);
      
      if (error.response?.status === 404) {
        setModalMessage("This reservation is no longer available. It may have been deleted.");
        setShowResultModal(true);
        
        if (refreshInterval) {
          clearInterval(refreshInterval);
          setRefreshInterval(null);
        }
        localStorage.removeItem('selectedReservation');
        setLocalReservation(null);
      }
    }
  };

  // Cleanup when reservation becomes invalid
  useEffect(() => {
    if (!localReservation && refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [localReservation, refreshInterval]);

  // Clear localStorage when component unmounts or when view changes
  useEffect(() => {
    return () => {
      if (!window.location.pathname.includes('reservation-details')) {
        localStorage.removeItem('selectedReservation');
      }
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  // Function to get the appropriate room/floor image based on reservation
  const getRoomImage = () => {
    if (!localReservation) return null;
    
    const { roomName, location } = localReservation;
    
    if (roomName) {
      const roomImage = availableRoomImages.find(img => 
        img.name.toLowerCase() === roomName.toLowerCase() ||
        roomName.toLowerCase().includes(img.name.toLowerCase()) ||
        img.name.toLowerCase().includes(roomName.toLowerCase())
      );
      
      if (roomImage) return roomImage;
    }
    
    if (location) {
      const locationImage = availableRoomImages.find(img => 
        img.name.toLowerCase() === location.toLowerCase() ||
        location.toLowerCase().includes(img.name.toLowerCase()) ||
        img.name.toLowerCase().includes(location.toLowerCase())
      );
      
      if (locationImage) return locationImage;
    }
    
    return availableRoomImages.find(img => img.id === "ground_floor") || availableRoomImages[0];
  };

  const roomImage = getRoomImage();

  const getReservationUserId = () => {
    if (!localReservation || !localReservation.userId) return null;
    return typeof localReservation.userId === 'string' 
      ? localReservation.userId 
      : localReservation.userId._id;
  };

  const reservationUserId = getReservationUserId();
  const isMainReserver = user && reservationUserId === user._id;
  const isStaffOrAdmin = user && (user.role === "Staff" || user.role === "Admin");

  const handleAction = async (action, data = {}) => {
    if (!localReservation) return;
    
    setProcessingAction(action);
    setModalMessage("");

    try {
      let endpoint = "";
      let method = "post";
      let requestData = {};

      switch (action) {
        case "approve":
          endpoint = `${import.meta.env.VITE_API_URL}/api/reservations/${localReservation._id}/status`;
          method = "patch";
          requestData = { status: "Approved" };
          break;

        case "reject":
          endpoint = `${import.meta.env.VITE_API_URL}/api/reservations/${localReservation._id}/status`;
          method = "patch";
          requestData = { status: "Rejected" };
          break;

        case "start":
          endpoint = `${import.meta.env.VITE_API_URL}/api/reservations/start/${localReservation._id}`;
          method = "post";
          break;

        case "end-early":
          endpoint = `${import.meta.env.VITE_API_URL}/api/reservations/${localReservation._id}/end-early`;
          method = "post";
          break;

        case "cancel":
          endpoint = `${import.meta.env.VITE_API_URL}/api/reservations/${localReservation._id}`;
          method = "delete";
          break;

        case "request-extension":
          endpoint = `${import.meta.env.VITE_API_URL}/api/reservations/${localReservation._id}/request-extension`;
          method = "put";
          requestData = { 
            reason: data.reason || "Need more time"
          };
          break;

        case "approve-extension":
          endpoint = `${import.meta.env.VITE_API_URL}/api/reservations/${localReservation._id}/handle-extension`;
          method = "put";
          requestData = { action: "approve" };
          break;

        case "reject-extension":
          endpoint = `${import.meta.env.VITE_API_URL}/api/reservations/${localReservation._id}/handle-extension`;
          method = "put";
          requestData = { action: "reject" };
          break;

        default:
          throw new Error("Unknown action");
      }

      const response = await axios({
        method,
        url: endpoint,
        data: Object.keys(requestData).length > 0 ? requestData : undefined,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (action === "request-extension" && response.data.conflictTime) {
        setConflictInfo({
          time: new Date(response.data.conflictTime),
          hasConflict: true
        });
      }

      setModalMessage(response.data.message || "Action completed successfully.");
      setShowResultModal(true);
      
      setTimeout(() => {
        refreshReservationData();
      }, 1000);
      
      if (refreshReservations) refreshReservations();
      
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          `Failed to ${action} reservation`;
      setModalMessage(errorMessage);
      setShowResultModal(true);
      
      if (err.response?.status === 404) {
        if (refreshInterval) {
          clearInterval(refreshInterval);
          setRefreshInterval(null);
        }
        localStorage.removeItem('selectedReservation');
        setLocalReservation(null);
      }
    } finally {
      setProcessingAction("");
    }
  };

  const handleShowExtendModal = () => {
    setShowExtendModal(true);
  };

  const handleExtendSubmit = async () => {
    await handleAction("request-extension", {
      extensionType: "continuous"
    });
    setShowExtendModal(false);
  };

  const cancelReservation = async () => {
    setCancelling(true);
    await handleAction("cancel");
    setCancelling(false);
    setShowCancelConfirm(false);
  };

  const handleResultModalClose = () => {
    setShowResultModal(false);
    
    if (modalMessage.includes("no longer available") || modalMessage.includes("deleted")) {
      localStorage.removeItem('selectedReservation');
      setLocalReservation(null);
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
    
    if (refreshReservations) refreshReservations();
    setView("dashboard");
  };

  const formatTimeOnly = (datetime) =>
    new Date(datetime).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const formatDateOnly = (datetime) =>
    new Date(datetime).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatDateTime = (datetime) =>
    new Date(datetime).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  // Skeleton loader component
  const SkeletonLoader = () => (
    <main className="ml-0 lg:ml-[250px] w-full lg:w-[calc(100%-250px)] flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white/80 backdrop-blur-sm px-4 lg:px-6 h-[70px] flex items-center justify-between shadow-sm border-b border-gray-200">
        <div className="h-8 bg-gray-300 rounded-lg w-48 lg:w-64 animate-pulse"></div>
        <div className="h-6 bg-gray-300 rounded-lg w-24 lg:w-32 animate-pulse"></div>
      </header>
      
      <div className="p-4 lg:p-6 space-y-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50 animate-pulse">
          <div className="h-7 bg-gray-300 rounded-lg w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-28"></div>
                <div className="h-14 bg-gray-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );

  if (loading) {
    return <SkeletonLoader />;
  }

  if (!localReservation) {
    return (
      <div className="ml-0 lg:ml-[250px] p-4 lg:p-8 flex items-center justify-center min-h-[calc(100vh-50px)] bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-gray-200/50">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">No reservation selected</h1>
          <p className="text-gray-600 mb-6">Please select a reservation from the list to view details</p>
          <button
            onClick={() => setView("dashboard")}
            className="bg-gradient-to-r from-[#CC0000] to-red-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 cursor-pointer font-medium shadow-md"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getExtendedEndTime = () => {
    if (!localReservation.extendedEndDatetime) return null;
    return new Date(localReservation.extendedEndDatetime);
  };

  const extendedEndTime = getExtendedEndTime();
  const originalEndTime = new Date(localReservation.endDatetime);
  const currentEndTime = extendedEndTime || originalEndTime;

  const statusColorClass = {
    Pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    Approved: "bg-green-100 text-green-800 border border-green-300",
    Rejected: "bg-red-100 text-red-800 border border-red-300",
    Cancelled: "bg-gray-100 text-gray-700 border border-gray-300",
    Expired: "bg-gray-200 text-gray-600 border border-gray-400",
    Ongoing: "bg-blue-100 text-blue-800 border border-blue-300",
    Completed: "bg-purple-100 text-purple-800 border border-purple-300",
  }[localReservation.status] || "bg-gray-100 text-gray-700 border border-gray-300";

  const canRequestExtension = localReservation.status === "Ongoing" && 
                             !localReservation.extensionRequested && 
                             isMainReserver;

  const hasPendingExtension = localReservation.extensionRequested && 
                             localReservation.extensionStatus === "Pending";

  const hasRejectedExtension = localReservation.extensionRequested && 
                              localReservation.extensionStatus === "Rejected";

  return (
    <main className="ml-0 lg:ml-[250px] w-full lg:w-[calc(100%-250px)] flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm px-4 lg:px-6 h-[70px] flex items-center justify-between shadow-sm border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setView("dashboard")}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 group-hover:text-gray-800" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Reservation Details</h1>
            <p className="text-sm text-gray-500 hidden sm:block">Manage and view reservation information</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-lg font-semibold text-sm ${statusColorClass}`}>
          {localReservation.status}
        </div>
      </header>

      <div className="p-4 lg:p-6 space-y-6">
        {/* Reservation Information Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Reservation Information</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Auto-refreshing every 10 seconds</span>
            </div>
          </div>
          
          {/* Extension Status Banner */}
          {hasPendingExtension && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <span className="text-yellow-800 font-semibold">Extension Request Pending Approval</span>
                  <p className="text-yellow-700 text-sm mt-1">Waiting for staff approval to extend your reservation time</p>
                </div>
              </div>
            </div>
          )}

          {localReservation.extensionStatus === "Approved" && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <span className="text-green-800 font-semibold">Extension Approved</span>
                  <p className="text-green-700 text-sm mt-1">Your reservation end time has been extended</p>
                </div>
              </div>
            </div>
          )}

          {hasRejectedExtension && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center">
                <div className="bg-red-100 p-2 rounded-lg mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <span className="text-red-800 font-semibold">Extension Request Declined</span>
                  <p className="text-red-700 text-sm mt-1">Your extension request was not approved</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Date
              </label>
              <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-sm">
                <p className="font-semibold text-gray-800">{formatDateOnly(localReservation.datetime)}</p>
              </div>
            </div>

            {/* Original Time */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Original Time
              </label>
              <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-sm">
                <p className="font-semibold text-gray-800">
                  {formatTimeOnly(localReservation.datetime)} - {formatTimeOnly(localReservation.endDatetime)}
                </p>
              </div>
            </div>
            
            {/* Room */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Room
              </label>
              <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-sm">
                <p className="font-semibold text-gray-800">{localReservation.roomName}</p>
              </div>
            </div>
            
            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Location
              </label>
              <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-sm">
                <p className="font-semibold text-gray-800">{localReservation.location}</p>
              </div>
            </div>
            
            {/* Purpose */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Purpose
              </label>
              <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-sm">
                <p className="font-semibold text-gray-800">{localReservation.purpose}</p>
              </div>
            </div>
            
            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Status
              </label>
              <div className={`p-4 w-full text-center rounded-xl font-bold ${statusColorClass} shadow-sm`}>
                {localReservation.status}
              </div>
            </div>
          </div>

          {/* Current Schedule */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Current Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-sm">
                <p className="text-sm font-medium text-blue-700">Start Time</p>
                <p className="font-bold text-blue-900 text-lg">{formatTimeOnly(localReservation.datetime)}</p>
              </div>
              <div className={`p-4 rounded-xl border shadow-sm ${
                extendedEndTime ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-200' : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200'
              }`}>
                <p className="text-sm font-medium text-gray-700">Current End Time</p>
                <p className={`font-bold text-lg ${extendedEndTime ? 'text-green-900' : 'text-gray-900'}`}>
                  {formatTimeOnly(currentEndTime)}
                  {extendedEndTime && (
                    <span className="text-xs ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">Extended</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Conflict Information */}
          {conflictInfo && conflictInfo.hasConflict && (
            <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl shadow-sm">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-orange-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-orange-800 font-medium">Extension Limit Notice</p>
                  <p className="text-orange-700 text-sm mt-1">
                    Extension can only be granted until <strong>{formatTimeOnly(conflictInfo.time)}</strong> due to a conflicting reservation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Room/Floor Image */}
        {roomImage && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              {roomImage.category === "Floor" ? "Floor Location" : "Room Location"}
            </h2>
            <div className="flex flex-col justify-center items-center">
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-200 max-w-2xl w-full">
                <img
                  src={roomImage.url}
                  alt={roomImage.name}
                  className="w-full h-auto"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                  <p className="text-white font-bold text-lg text-center">
                    {localReservation.roomName} - {localReservation.location}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Participants Table */}
        {localReservation.participants && localReservation.participants.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Participants</h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {localReservation.participants.length} participants
              </span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-[#FFCC00] to-yellow-400">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">ID Number</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Course</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Year Level</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">Department</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {localReservation.participants.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{p.idNumber}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{p.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{p.course}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{p.yearLevel}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{p.department}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200/50">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Actions</h2>
          <div className="flex flex-wrap gap-4">
            {/* Staff/Admin Actions */}
            {isStaffOrAdmin && (
              <>
                {localReservation.status === "Pending" && (
                  <>
                    <button
                      onClick={() => setShowApproveConfirm(true)}
                      disabled={processingAction === "approve"}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium shadow-md flex items-center"
                    >
                      {processingAction === "approve" ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Approving...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowRejectConfirm(true)}
                      disabled={processingAction === "reject"}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium shadow-md flex items-center"
                    >
                      {processingAction === "reject" ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Reject
                        </>
                      )}
                    </button>
                  </>
                )}

                {localReservation.status === "Approved" && (
                  <button
                    onClick={() => setShowStartConfirm(true)}
                    disabled={processingAction === "start"}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium shadow-md flex items-center"
                  >
                    {processingAction === "start" ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Starting...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Start Reservation
                      </>
                    )}
                  </button>
                )}

                {localReservation.status === "Ongoing" && (
                  <button
                    onClick={() => setShowEndEarlyConfirm(true)}
                    disabled={processingAction === "end-early"}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium shadow-md flex items-center"
                  >
                    {processingAction === "end-early" ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Ending...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                        </svg>
                        End Early
                      </>
                    )}
                  </button>
                )}

                {hasPendingExtension && (
                  <>
                    <button
                      onClick={() => setShowApproveExtensionConfirm(true)}
                      disabled={processingAction === "approve-extension"}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium shadow-md flex items-center"
                    >
                      {processingAction === "approve-extension" ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Approving...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Approve Extension
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowRejectExtensionConfirm(true)}
                      disabled={processingAction === "reject-extension"}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium shadow-md flex items-center"
                    >
                      {processingAction === "reject-extension" ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Reject Extension
                        </>
                      )}
                    </button>
                  </>
                )}
              </>
            )}

            {/* User Actions */}
            {isMainReserver && (
              <>
                {["Pending", "Approved"].includes(localReservation.status) && (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={cancelling || processingAction}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium shadow-md flex items-center"
                  >
                    {cancelling ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Cancel Reservation
                      </>
                    )}
                  </button>
                )}

                {canRequestExtension && (
                  <button
                    onClick={handleShowExtendModal}
                    disabled={processingAction}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium shadow-md flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Request Extension
                  </button>
                )}
              </>
            )}

            {/* Back Button */}
            <button
              onClick={() => setView("dashboard")}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 cursor-pointer font-medium shadow-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Extension Request Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Request Extension</h3>
              <button
                onClick={() => setShowExtendModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Request to extend your reservation time. The system will automatically calculate the maximum possible extension based on room availability.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowExtendModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleExtendSubmit}
                disabled={processingAction === "request-extension"}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium shadow-md flex items-center justify-center"
              >
                {processingAction === "request-extension" ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Requesting...
                  </>
                ) : (
                  "Request Extension"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-red-600">Cancel Reservation</h3>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this reservation? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer font-medium"
              >
                Keep Reservation
              </button>
              <button
                onClick={cancelReservation}
                disabled={cancelling}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium shadow-md flex items-center justify-center"
              >
                {cancelling ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cancelling...
                  </>
                ) : (
                  "Yes, Cancel"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Other confirmation modals follow similar pattern */}
      {showStartConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200/50">
            <h3 className="text-xl font-bold text-blue-600 mb-4">Start Reservation</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to start this reservation now?</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowStartConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleAction("start");
                  setShowStartConfirm(false);
                }}
                disabled={processingAction === "start"}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-medium shadow-md flex items-center justify-center"
              >
                {processingAction === "start" ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Starting...
                  </>
                ) : (
                  "Start Now"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Similar modals for other actions... */}

      {/* Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200/50">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Action Completed</h3>
              <p className="text-gray-600 mb-6">{modalMessage}</p>
              <button
                onClick={handleResultModalClose}
                className="bg-gradient-to-r from-[#CC0000] to-red-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-200 cursor-pointer font-medium shadow-md w-full"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ReservationDetails;