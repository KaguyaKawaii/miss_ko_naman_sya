import React, { useState, useEffect } from "react";
import axios from "axios";
import { availableRoomImages } from "../data/roomImages"; // Import from your data folder

function ReservationDetails({ reservation, setView, refreshReservations, user }) {
  const [cancelling, setCancelling] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [processingAction, setProcessingAction] = useState("");
  const [conflictInfo, setConflictInfo] = useState(null);
  const [localReservation, setLocalReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Unified modal state management
  const [activeModal, setActiveModal] = useState(null);

  // Modal types
  const MODAL_TYPES = {
    NONE: null,
    CANCEL_CONFIRM: "cancel_confirm",
    END_EARLY_CONFIRM: "end_early_confirm",
    START_CONFIRM: "start_confirm",
    APPROVE_CONFIRM: "approve_confirm",
    REJECT_CONFIRM: "reject_confirm",
    APPROVE_EXTENSION_CONFIRM: "approve_extension_confirm",
    REJECT_EXTENSION_CONFIRM: "reject_extension_confirm",
    RESULT: "result",
    EXTEND: "extend"
  };

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
        setActiveModal(MODAL_TYPES.RESULT);
        
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
          // FIXED: Use the correct endpoint for ending early
          endpoint = `${import.meta.env.VITE_API_URL}/api/reservations/${localReservation._id}/end-early`;
          method = "post"; // Changed from put to post if that's what your backend expects
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

      // Store conflict info if available
      if (action === "request-extension" && response.data.conflictTime) {
        setConflictInfo({
          time: new Date(response.data.conflictTime),
          hasConflict: true
        });
      }

      setModalMessage(response.data.message || "Action completed successfully.");
      setActiveModal(MODAL_TYPES.RESULT);
      
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
      setActiveModal(MODAL_TYPES.RESULT);
      
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
    setActiveModal(MODAL_TYPES.EXTEND);
  };

  const handleExtendSubmit = async () => {
    await handleAction("request-extension", {
      extensionType: "continuous"
    });
    setActiveModal(MODAL_TYPES.NONE);
  };

  const cancelReservation = async () => {
    setCancelling(true);
    await handleAction("cancel");
    setCancelling(false);
    setActiveModal(MODAL_TYPES.NONE);
  };

  const handleResultModalClose = () => {
    setActiveModal(MODAL_TYPES.NONE);
    
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

  // Modal components
  const CancelConfirmationModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200">
        <div className="flex items-center mb-4">
          <div className="bg-red-100 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Cancel Reservation</h3>
        </div>
        <p className="text-gray-600 mb-6">Are you sure you want to cancel this reservation? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setActiveModal(MODAL_TYPES.NONE)}
            className="px-6 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer font-medium"
          >
            No, Keep It
          </button>
          <button
            onClick={cancelReservation}
            disabled={cancelling}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center cursor-pointer font-medium"
          >
            {cancelling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Cancelling...
              </>
            ) : (
              "Yes, Cancel"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const EndEarlyConfirmationModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200">
        <div className="flex items-center mb-4">
          <div className="bg-orange-100 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">End Reservation Early</h3>
        </div>
        <p className="text-gray-600 mb-6">Are you sure you want to end this reservation early? This will mark the reservation as completed.</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setActiveModal(MODAL_TYPES.NONE)}
            className="px-6 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleAction("end-early");
              setActiveModal(MODAL_TYPES.NONE);
            }}
            disabled={processingAction === "end-early"}
            className="px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center cursor-pointer font-medium"
          >
            {processingAction === "end-early" ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Ending...
              </>
            ) : (
              "Yes, End Early"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const StartConfirmationModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Start Reservation</h3>
        </div>
        <p className="text-gray-600 mb-6">Are you sure you want to start this reservation? This will change the status to Ongoing.</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setActiveModal(MODAL_TYPES.NONE)}
            className="px-6 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleAction("start");
              setActiveModal(MODAL_TYPES.NONE);
            }}
            disabled={processingAction === "start"}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center cursor-pointer font-medium"
          >
            {processingAction === "start" ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Starting...
              </>
            ) : (
              "Yes, Start"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const ApproveConfirmationModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200">
        <div className="flex items-center mb-4">
          <div className="bg-green-100 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Approve Reservation</h3>
        </div>
        <p className="text-gray-600 mb-6">Are you sure you want to approve this reservation? The user will be notified.</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setActiveModal(MODAL_TYPES.NONE)}
            className="px-6 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleAction("approve");
              setActiveModal(MODAL_TYPES.NONE);
            }}
            disabled={processingAction === "approve"}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center cursor-pointer font-medium"
          >
            {processingAction === "approve" ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Approving...
              </>
            ) : (
              "Yes, Approve"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const RejectConfirmationModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200">
        <div className="flex items-center mb-4">
          <div className="bg-red-100 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Reject Reservation</h3>
        </div>
        <p className="text-gray-600 mb-6">Are you sure you want to reject this reservation? The user will be notified.</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setActiveModal(MODAL_TYPES.NONE)}
            className="px-6 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleAction("reject");
              setActiveModal(MODAL_TYPES.NONE);
            }}
            disabled={processingAction === "reject"}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center cursor-pointer font-medium"
          >
            {processingAction === "reject" ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Rejecting...
              </>
            ) : (
              "Yes, Reject"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const ApproveExtensionConfirmationModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200">
        <div className="flex items-center mb-4">
          <div className="bg-green-100 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Approve Extension</h3>
        </div>
        <p className="text-gray-600 mb-6">Are you sure you want to approve this extension request? The reservation end time will be extended.</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setActiveModal(MODAL_TYPES.NONE)}
            className="px-6 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleAction("approve-extension");
              setActiveModal(MODAL_TYPES.NONE);
            }}
            disabled={processingAction === "approve-extension"}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center cursor-pointer font-medium"
          >
            {processingAction === "approve-extension" ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Approving...
              </>
            ) : (
              "Yes, Approve"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const RejectExtensionConfirmationModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200">
        <div className="flex items-center mb-4">
          <div className="bg-red-100 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Reject Extension</h3>
        </div>
        <p className="text-gray-600 mb-6">Are you sure you want to reject this extension request? The user will be notified.</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setActiveModal(MODAL_TYPES.NONE)}
            className="px-6 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleAction("reject-extension");
              setActiveModal(MODAL_TYPES.NONE);
            }}
            disabled={processingAction === "reject-extension"}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center cursor-pointer font-medium"
          >
            {processingAction === "reject-extension" ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Rejecting...
              </>
            ) : (
              "Yes, Reject"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const ResultModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Action Result</h3>
        </div>
        <p className="text-gray-600 mb-6">{modalMessage}</p>
        <div className="flex justify-end">
          <button
            onClick={handleResultModalClose}
            className="px-6 py-2.5 bg-[#CC0000] text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer font-medium"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );

  const ExtendModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200">
        <div className="flex items-center mb-4">
          <div className="bg-purple-100 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Request Time Extension</h3>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-medium mb-2">
              Continuous Extension System
            </p>
            <p className="text-sm text-blue-700">
              Your reservation will continue automatically until you end it, staff ends it, or until the next reservation starts.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Schedule
            </label>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Start:</span>
                <span className="text-sm font-medium text-gray-800">{formatTimeOnly(localReservation.datetime)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-gray-600">Current End:</span>
                <span className="text-sm font-medium text-gray-800">{formatTimeOnly(currentEndTime)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setActiveModal(MODAL_TYPES.NONE)}
            className="px-6 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleExtendSubmit}
            disabled={processingAction === "request-extension"}
            className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center cursor-pointer font-medium"
          >
            {processingAction === "request-extension" ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Requesting...
              </>
            ) : (
              "Request Extension"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <main className="ml-0 lg:ml-[250px] w-full lg:w-[calc(100%-250px)] flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="text-black px-4 lg:px-6 h-[60px] flex items-center justify-between shadow-sm bg-white">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              localStorage.removeItem('selectedReservation');
              setView("dashboard");
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:inline">Auto-refresh: 10s</span>
          <button
            onClick={refreshReservationData}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 lg:p-6 space-y-6">
        {/* Reservation Details Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2 lg:mb-0">
              Reservation Details
            </h1>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColorClass}`}>
                {localReservation.status}
              </span>
              {localReservation.extensionRequested && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  localReservation.extensionStatus === "Pending" 
                    ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                    : localReservation.extensionStatus === "Approved"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}>
                  Extension: {localReservation.extensionStatus}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {/* Room/Location */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Room/Location</label>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-gray-800 font-medium">{localReservation.roomName || localReservation.location}</p>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Date</label>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-gray-800 font-medium">{formatDateOnly(localReservation.datetime)}</p>
              </div>
            </div>

            {/* Time Slot */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Time Slot</label>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-gray-800 font-medium">
                  {formatTimeOnly(localReservation.datetime)} - {formatTimeOnly(currentEndTime)}
                  {extendedEndTime && (
                    <span className="text-green-600 text-sm ml-2">(Extended)</span>
                  )}
                </p>
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Purpose</label>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-gray-800 font-medium">{localReservation.purpose}</p>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-gray-800 font-medium capitalize">{localReservation.status}</p>
              </div>
            </div>

            {/* Created At */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Created At</label>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-gray-800 font-medium">{formatDateTime(localReservation.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Room Image */}
          {roomImage && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-600 mb-3">Room Layout</label>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{roomImage.name}</h3>
                    <p className="text-gray-600 text-sm">{roomImage.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <img
                      src={roomImage.image}
                      alt={roomImage.name}
                      className="w-full max-w-xs lg:max-w-sm rounded-lg shadow-sm border border-gray-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-sm p-4 lg:p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions</h2>
          
          <div className="flex flex-wrap gap-3">
            {/* Cancel Button (Main Reserver or Staff/Admin) */}
            {(isMainReserver || isStaffOrAdmin) && 
             ["Pending", "Approved"].includes(localReservation.status) && (
              <button
                onClick={() => setActiveModal(MODAL_TYPES.CANCEL_CONFIRM)}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer font-medium flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Cancel Reservation
              </button>
            )}

            {/* Start Button (Main Reserver) */}
            {isMainReserver && localReservation.status === "Approved" && (
              <button
                onClick={() => setActiveModal(MODAL_TYPES.START_CONFIRM)}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Start Reservation
              </button>
            )}

            {/* End Early Button (Main Reserver or Staff/Admin) */}
            {(isMainReserver || isStaffOrAdmin) && localReservation.status === "Ongoing" && (
              <button
                onClick={() => setActiveModal(MODAL_TYPES.END_EARLY_CONFIRM)}
                className="px-5 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors cursor-pointer font-medium flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                End Early
              </button>
            )}

            {/* Request Extension Button (Main Reserver) */}
            {canRequestExtension && (
              <button
                onClick={handleShowExtendModal}
                className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer font-medium flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Request Extension
              </button>
            )}

            {/* Approve/Reject Buttons (Staff/Admin) */}
            {isStaffOrAdmin && localReservation.status === "Pending" && (
              <>
                <button
                  onClick={() => setActiveModal(MODAL_TYPES.APPROVE_CONFIRM)}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer font-medium flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Approve
                </button>
                <button
                  onClick={() => setActiveModal(MODAL_TYPES.REJECT_CONFIRM)}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer font-medium flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Reject
                </button>
              </>
            )}

            {/* Extension Request Actions (Staff/Admin) */}
            {isStaffOrAdmin && hasPendingExtension && (
              <>
                <button
                  onClick={() => setActiveModal(MODAL_TYPES.APPROVE_EXTENSION_CONFIRM)}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer font-medium flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Approve Extension
                </button>
                <button
                  onClick={() => setActiveModal(MODAL_TYPES.REJECT_EXTENSION_CONFIRM)}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer font-medium flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Reject Extension
                </button>
              </>
            )}

            {/* No Actions Available */}
            {!isMainReserver && !isStaffOrAdmin && (
              <p className="text-gray-500 italic">No actions available for this reservation</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal === MODAL_TYPES.CANCEL_CONFIRM && <CancelConfirmationModal />}
      {activeModal === MODAL_TYPES.END_EARLY_CONFIRM && <EndEarlyConfirmationModal />}
      {activeModal === MODAL_TYPES.START_CONFIRM && <StartConfirmationModal />}
      {activeModal === MODAL_TYPES.APPROVE_CONFIRM && <ApproveConfirmationModal />}
      {activeModal === MODAL_TYPES.REJECT_CONFIRM && <RejectConfirmationModal />}
      {activeModal === MODAL_TYPES.APPROVE_EXTENSION_CONFIRM && <ApproveExtensionConfirmationModal />}
      {activeModal === MODAL_TYPES.REJECT_EXTENSION_CONFIRM && <RejectExtensionConfirmationModal />}
      {activeModal === MODAL_TYPES.RESULT && <ResultModal />}
      {activeModal === MODAL_TYPES.EXTEND && <ExtendModal />}
    </main>
  );
}

export default ReservationDetails;