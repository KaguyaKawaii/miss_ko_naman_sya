import React, { useState, useEffect } from "react";
import axios from "axios";
import { availableRoomImages } from "../data/roomImages"; // Import from your data folder

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
  const [showRemoveParticipantModal, setShowRemoveParticipantModal] = useState(false);
  const [participantToRemove, setParticipantToRemove] = useState(null);

  // Load reservation from localStorage on component mount and when reservation prop changes
  useEffect(() => {
    const loadReservation = () => {
      // First try to use the prop if available
      if (reservation) {
        setLocalReservation(reservation);
        // Also save to localStorage for refresh persistence
        localStorage.setItem('selectedReservation', JSON.stringify(reservation));
        setLoading(false);
        return;
      }

      // If no prop, try to load from localStorage
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

    // Set up auto-refresh every 10 seconds for real-time status updates
    const interval = setInterval(() => {
      refreshReservationData();
    }, 10000); // 10 seconds

    setRefreshInterval(interval);

    // Cleanup interval on component unmount
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [localReservation]);

  const refreshReservationData = async () => {
    if (!localReservation?._id) return;

    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/reservations/${localReservation._id}`);
      const updatedReservation = response.data;
      
      // Update local state
      setLocalReservation(updatedReservation);
      
      // Update localStorage
      localStorage.setItem('selectedReservation', JSON.stringify(updatedReservation));
      
      // Refresh parent reservations list if available
      if (refreshReservations) {
        refreshReservations();
      }
    } catch (error) {
      console.error('Error refreshing reservation data:', error);
      
      // If we get a 404, the reservation might have been deleted
      if (error.response?.status === 404) {
        setModalMessage("This reservation is no longer available. It may have been deleted.");
        setShowResultModal(true);
        
        // Clear the interval and localStorage
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
      // Only clear if we're navigating away from reservation details
      if (!window.location.pathname.includes('reservation-details')) {
        localStorage.removeItem('selectedReservation');
      }
      // Clear refresh interval
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  // Function to get the appropriate room/floor image based on reservation
  const getRoomImage = () => {
    if (!localReservation) return null;
    
    const { roomName, location } = localReservation;
    
    // If we have a specific room name, try to find exact match first
    if (roomName) {
      const roomImage = availableRoomImages.find(img => 
        img.name.toLowerCase() === roomName.toLowerCase() ||
        roomName.toLowerCase().includes(img.name.toLowerCase()) ||
        img.name.toLowerCase().includes(roomName.toLowerCase())
      );
      
      if (roomImage) return roomImage;
    }
    
    // If no room match found, try to find by location/floor
    if (location) {
      const locationImage = availableRoomImages.find(img => 
        img.name.toLowerCase() === location.toLowerCase() ||
        location.toLowerCase().includes(img.name.toLowerCase()) ||
        img.name.toLowerCase().includes(location.toLowerCase())
      );
      
      if (locationImage) return locationImage;
    }
    
    // Default fallback if no match found
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
          endpoint = `http://localhost:5000/api/reservations/${localReservation._id}/status`;
          method = "patch";
          requestData = { status: "Approved" };
          break;

        case "reject":
          endpoint = `http://localhost:5000/api/reservations/${localReservation._id}/status`;
          method = "patch";
          requestData = { status: "Rejected" };
          break;

        case "start":
          endpoint = `http://localhost:5000/api/reservations/start/${localReservation._id}`;
          method = "post";
          break;

        case "end-early":
          // FIXED: Use the correct endpoint for ending early
          endpoint = `http://localhost:5000/api/reservations/${localReservation._id}/end-early`;
          method = "post"; // Changed from put to post if that's what your backend expects
          break;

        case "cancel":
          endpoint = `http://localhost:5000/api/reservations/${localReservation._id}`;
          method = "delete";
          break;

        case "request-extension":
          endpoint = `http://localhost:5000/api/reservations/${localReservation._id}/request-extension`;
          method = "put";
          requestData = { 
            reason: data.reason || "Need more time"
          };
          break;

        case "approve-extension":
          endpoint = `http://localhost:5000/api/reservations/${localReservation._id}/handle-extension`;
          method = "put";
          requestData = { action: "approve" };
          break;

        case "reject-extension":
          endpoint = `http://localhost:5000/api/reservations/${localReservation._id}/handle-extension`;
          method = "put";
          requestData = { action: "reject" };
          break;

        case "remove-participant":
          endpoint = `http://localhost:5000/api/reservations/${localReservation._id}/remove-participant`;
          method = "put";
          requestData = { participantId: data.participantId };
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

      // Store conflict info if available
      if (action === "request-extension" && response.data.conflictTime) {
        setConflictInfo({
          time: new Date(response.data.conflictTime),
          hasConflict: true
        });
      }

      setModalMessage(response.data.message || "Action completed successfully.");
      setShowResultModal(true);
      
      // Refresh data after action
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
      
      // If it's a 404, stop auto-refresh and clean up
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

  const handleRemoveParticipant = (participant) => {
    setParticipantToRemove(participant);
    setShowRemoveParticipantModal(true);
  };

  const confirmRemoveParticipant = async () => {
    if (!participantToRemove) return;
    
    await handleAction("remove-participant", {
      participantId: participantToRemove._id || participantToRemove.id
    });
    setShowRemoveParticipantModal(false);
    setParticipantToRemove(null);
  };

  const handleResultModalClose = () => {
    setShowResultModal(false);
    
    // If the reservation was deleted, go back to dashboard
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
    <main className="ml-0 lg:ml-[250px] w-full lg:w-[calc(100%-250px)] flex flex-col min-h-screen bg-gray-50">
      <header className="text-black px-4 lg:px-6 h-[60px] flex items-center justify-between shadow-sm bg-white">
        <div className="h-8 bg-gray-300 rounded w-48 lg:w-64 animate-pulse"></div>
        <div className="h-6 bg-gray-300 rounded w-24 lg:w-32 animate-pulse"></div>
      </header>
      
      <div className="p-4 lg:p-6 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100 animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
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
      <div className="ml-0 lg:ml-[250px] p-4 lg:p-8 flex items-center justify-center min-h-[calc(100vh-50px)]">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center">
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-800 mb-2">No reservation selected</h1>
          <p className="text-gray-600 mb-4">Please select a reservation from the list</p>
          <button
            onClick={() => setView("dashboard")}
            className="bg-[#CC0000] text-white px-5 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
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
    Pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    Approved: "bg-green-100 text-green-800 border border-green-200",
    Rejected: "bg-red-100 text-red-800 border border-red-200",
    Cancelled: "bg-gray-100 text-gray-600 border border-gray-200",
    Expired: "bg-gray-200 text-gray-500 border border-gray-300",
    Ongoing: "bg-blue-100 text-blue-800 border border-blue-200",
    Completed: "bg-purple-100 text-purple-800 border border-purple-200",
  }[localReservation.status] || "bg-gray-100 text-gray-600 border border-gray-200";

  const canRequestExtension = localReservation.status === "Ongoing" && 
                             !localReservation.extensionRequested && 
                             isMainReserver;

  const hasPendingExtension = localReservation.extensionRequested && 
                             localReservation.extensionStatus === "Pending";

  const hasRejectedExtension = localReservation.extensionRequested && 
                              localReservation.extensionStatus === "Rejected";

  return (
    <main className="ml-0 lg:ml-[250px] w-full lg:w-[calc(100%-250px)] flex flex-col min-h-screen bg-gray-50">
      <header className="text-black px-4 lg:px-6 h-[60px] flex items-center justify-between shadow-sm bg-white">
        <h1 className="text-lg md:text-xl lg:text-2xl font-bold tracking-wide">Reservation Details</h1>
        <button 
          onClick={() => setView("dashboard")}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <span className="hidden sm:inline">Back to Dashboard</span>
        </button>
      </header>

      <div className="p-4 lg:p-6 space-y-6">
        {/* Reservation Information Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Reservation Information</h2>
          
          {/* Extension Status Banner */}
          {hasPendingExtension && (
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-yellow-800 font-medium">Extension Request Pending Approval</span>
              </div>
            </div>
          )}

          {localReservation.extensionStatus === "Approved" && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-800 font-medium">Extension Approved</span>
              </div>
            </div>
          )}

          {hasRejectedExtension && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-800 font-medium">Extension Request Declined</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {/* Date - Separate from Time */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Date
              </p>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <p className="font-medium text-gray-800 text-sm lg:text-base">{formatDateOnly(localReservation.datetime)}</p>
              </div>
            </div>

            {/* Original Time - Separate from Date */}
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Original Time
              </p>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <p className="font-medium text-gray-800 text-sm lg:text-base">
                  {formatTimeOnly(localReservation.datetime)} - {formatTimeOnly(localReservation.endDatetime)}
                </p>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Room
              </p>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <p className="font-medium text-gray-800 text-sm lg:text-base">{localReservation.roomName}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Location
              </p>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <p className="font-medium text-gray-800 text-sm lg:text-base">{localReservation.location}</p>
              </div>
            </div>
            
            <div className="md:col-span-2 lg:col-span-1 space-y-1">
              <p className="text-sm font-medium text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Purpose
              </p>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <p className="font-medium text-gray-800 text-sm lg:text-base">{localReservation.purpose}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Status
              </p>
              <div className={`p-3 w-full text-center rounded-lg font-semibold text-sm lg:text-base ${statusColorClass}`}>
                {localReservation.status}
              </div>
            </div>
          </div>

          {/* Current Schedule */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Current Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm text-gray-600">Start Time:</p>
                <p className="font-medium text-gray-800 text-sm lg:text-base">{formatTimeOnly(localReservation.datetime)}</p>
              </div>
              <div className={`p-3 rounded-lg border ${extendedEndTime ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <p className="text-sm text-gray-600">Current End Time:</p>
                <p className={`font-medium text-sm lg:text-base ${extendedEndTime ? 'text-green-600' : 'text-gray-800'}`}>
                  {formatTimeOnly(currentEndTime)}
                  {extendedEndTime && <span className="text-xs ml-2 text-green-600">(Extended)</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Conflict Information */}
          {conflictInfo && conflictInfo.hasConflict && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <strong>Note:</strong> Extension can only be granted until {formatTimeOnly(conflictInfo.time)} due to a conflicting reservation.
              </p>
            </div>
          )}
        </div>

        {/* Room/Floor Image - Dynamically show based on reservation */}
        {roomImage && (
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
              {roomImage.category === "Floor" ? "Floor Location" : "Room Location"}
            </h2>
            <div className="flex flex-col justify-center items-center">
              <img
                src={roomImage.url}
                alt={roomImage.name}
                className="rounded-lg shadow-md w-full max-w-2xl border border-gray-200"
              />
              <p className="font-semibold text-base lg:text-lg mt-4 bg-gray-100 px-4 py-2 rounded-lg border border-gray-200">
                {localReservation.roomName} - {localReservation.location}
              </p>
            </div>
          </div>
        )}

        {/* Participants Table */}
        {localReservation.participants && localReservation.participants.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Participants</h2>
              <div className="text-sm text-gray-500">
                {localReservation.participants.length} / 4 participants
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#FFCC00]">
                  <tr>
                    <th className="px-3 py-2 lg:px-4 lg:py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">ID Number</th>
                    <th className="px-3 py-2 lg:px-4 lg:py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Name</th>
                    <th className="px-3 py-2 lg:px-4 lg:py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Course</th>
                    <th className="px-3 py-2 lg:px-4 lg:py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Year Level</th>
                    <th className="px-3 py-2 lg:px-4 lg:py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Department</th>
                    {isMainReserver && (
                      <th className="px-3 py-2 lg:px-4 lg:py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {localReservation.participants.map((p, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}>
                      <td className="px-3 py-2 lg:px-4 lg:py-3 whitespace-nowrap text-xs lg:text-sm font-medium text-gray-900">
                        {p.id_number || p.idNumber || "N/A"}
                      </td>
                      <td className="px-3 py-2 lg:px-4 lg:py-3 whitespace-nowrap text-xs lg:text-sm text-gray-900">
                        {p.name || "N/A"}
                      </td>
                      <td className="px-3 py-2 lg:px-4 lg:py-3 whitespace-nowrap text-xs lg:text-sm text-gray-500">
                        {p.course || "N/A"}
                      </td>
                      <td className="px-3 py-2 lg:px-4 lg:py-3 whitespace-nowrap text-xs lg:text-sm text-gray-500">
                        {p.year_level || p.yearLevel || "N/A"}
                      </td>
                      <td className="px-3 py-2 lg:px-4 lg:py-3 whitespace-nowrap text-xs lg:text-sm text-gray-500">
                        {p.department || "N/A"}
                      </td>
                      {isMainReserver && (
                        <td className="px-3 py-2 lg:px-4 lg:py-3 whitespace-nowrap text-xs lg:text-sm text-gray-500">
                          <button
                            onClick={() => handleRemoveParticipant(p)}
                            className="text-red-600 hover:text-red-800 font-medium text-xs lg:text-sm cursor-pointer"
                          >
                            Remove
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Actions</h2>
          
          <div className="flex flex-wrap gap-3">
            {/* Staff/Admin Actions */}
            {isStaffOrAdmin && (
              <>
                {localReservation.status === "Pending" && (
                  <>
                    <button
                      onClick={() => setShowApproveConfirm(true)}
                      disabled={processingAction}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {processingAction === "approve" ? "Approving..." : "Approve"}
                    </button>
                    <button
                      onClick={() => setShowRejectConfirm(true)}
                      disabled={processingAction}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {processingAction === "reject" ? "Rejecting..." : "Reject"}
                    </button>
                  </>
                )}

                {localReservation.status === "Approved" && (
                  <button
                    onClick={() => setShowStartConfirm(true)}
                    disabled={processingAction}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {processingAction === "start" ? "Starting..." : "Start Reservation"}
                  </button>
                )}

                {localReservation.status === "Ongoing" && (
                  <button
                    onClick={() => setShowEndEarlyConfirm(true)}
                    disabled={processingAction}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {processingAction === "end-early" ? "Ending..." : "End Early"}
                  </button>
                )}

                {hasPendingExtension && (
                  <>
                    <button
                      onClick={() => setShowApproveExtensionConfirm(true)}
                      disabled={processingAction}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {processingAction === "approve-extension" ? "Approving..." : "Approve Extension"}
                    </button>
                    <button
                      onClick={() => setShowRejectExtensionConfirm(true)}
                      disabled={processingAction}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {processingAction === "reject-extension" ? "Rejecting..." : "Reject Extension"}
                    </button>
                  </>
                )}
              </>
            )}

            {/* Main Reserver Actions */}
            {isMainReserver && (
              <>
                {(localReservation.status === "Pending" || localReservation.status === "Approved") && (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={processingAction}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {processingAction === "cancel" ? "Cancelling..." : "Cancel Reservation"}
                  </button>
                )}

                {canRequestExtension && (
                  <button
                    onClick={handleShowExtendModal}
                    disabled={processingAction}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Request Extension
                  </button>
                )}
              </>
            )}

            {/* Back Button */}
            <button
              onClick={() => setView("dashboard")}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Cancel Reservation</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to cancel this reservation? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 cursor-pointer"
              >
                No, Keep It
              </button>
              <button
                onClick={cancelReservation}
                disabled={cancelling}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEndEarlyConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">End Reservation Early</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to end this reservation early?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowEndEarlyConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction("end-early")}
                disabled={processingAction}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {processingAction === "end-early" ? "Ending..." : "Yes, End Early"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showStartConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Start Reservation</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to start this reservation now?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowStartConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction("start")}
                disabled={processingAction}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {processingAction === "start" ? "Starting..." : "Yes, Start"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showApproveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Approve Reservation</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to approve this reservation?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowApproveConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction("approve")}
                disabled={processingAction}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {processingAction === "approve" ? "Approving..." : "Yes, Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Reject Reservation</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to reject this reservation?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction("reject")}
                disabled={processingAction}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {processingAction === "reject" ? "Rejecting..." : "Yes, Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showApproveExtensionConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Approve Extension</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to approve this extension request?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowApproveExtensionConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction("approve-extension")}
                disabled={processingAction}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {processingAction === "approve-extension" ? "Approving..." : "Yes, Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectExtensionConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Reject Extension</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to reject this extension request?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRejectExtensionConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction("reject-extension")}
                disabled={processingAction}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {processingAction === "reject-extension" ? "Rejecting..." : "Yes, Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showRemoveParticipantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Remove Participant</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove {participantToRemove?.name || 'this participant'} from the reservation?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRemoveParticipantModal(false);
                  setParticipantToRemove(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveParticipant}
                disabled={processingAction}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {processingAction === "remove-participant" ? "Removing..." : "Yes, Remove"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Action Result</h3>
            <p className="text-gray-600 mb-4">{modalMessage}</p>
            <div className="flex justify-end">
              <button
                onClick={handleResultModalClose}
                className="bg-[#CC0000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extension Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Request Extension</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to request an extension for this reservation? The system will automatically extend your reservation until the next available time slot.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowExtendModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExtendSubmit}
                disabled={processingAction}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {processingAction === "request-extension" ? "Requesting..." : "Yes, Request Extension"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ReservationDetails;