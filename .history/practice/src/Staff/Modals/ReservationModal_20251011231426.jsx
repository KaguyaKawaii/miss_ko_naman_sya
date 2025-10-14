// ReservationModal.jsx
import React, { useState } from "react";
import moment from "moment-timezone";
import axios from "axios";

const ReservationModal = ({ 
  reservation, 
  onClose, 
  onActionSuccess,
  currentUser
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState("");
  const [error, setError] = useState("");
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [extensionReason, setExtensionReason] = useState("");
  const [conflictInfo, setConflictInfo] = useState(null);

  if (!reservation) return null;

  const isStaffOrAdmin = currentUser?.role === "Staff" || currentUser?.role === "Admin";
  const isMainReserver = currentUser?._id === reservation.userId?._id;

  const formatPHDateTime = (iso) => {
    if (!iso) return "N/A";
    return moment(iso).tz("Asia/Manila").format("MMM DD, YYYY hh:mm A");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Approved": return "bg-green-100 text-green-800";
      case "Ongoing": return "bg-blue-100 text-blue-800";
      case "Rejected": return "bg-red-100 text-red-800";
      case "Cancelled": return "bg-gray-100 text-gray-800";
      case "Expired": return "bg-orange-100 text-orange-800";
      case "Completed": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleAction = async (action, data = {}) => {
    setIsProcessing(true);
    setProcessingAction(action);
    setError("");

    try {
      let endpoint = "";
      let method = "post";
      let requestData = {};

      switch (action) {
        case "approve":
          endpoint = `http://localhost:5000/reservations/${reservation._id}/status`;
          method = "patch";
          requestData = { status: "Approved" };
          break;

        case "reject":
          endpoint = `http://localhost:5000/reservations/${reservation._id}/status`;
          method = "patch";
          requestData = { status: "Rejected" };
          break;

        case "start":
          endpoint = `http://localhost:5000/reservations/start/${reservation._id}`;
          method = "post";
          break;

        case "end-early":
          endpoint = `http://localhost:5000/reservations/end-early/${reservation._id}`;
          method = "post";
          break;

        case "cancel":
          endpoint = `http://localhost:5000/reservations/${reservation._id}`;
          method = "delete";
          break;

        case "request-extension":
          endpoint = `http://localhost:5000/reservations/${reservation._id}/request-extension`;
          method = "put";
          requestData = { 
            reason: data.reason || "Need more time"
          };
          break;

        case "approve-extension":
          endpoint = `http://localhost:5000/reservations/${reservation._id}/handle-extension`;
          method = "put";
          requestData = { action: "approve" };
          break;

        case "reject-extension":
          endpoint = `http://localhost:5000/reservations/${reservation._id}/handle-extension`;
          method = "put";
          requestData = { action: "reject" };
          break;

        default:
          throw new Error("Unknown action");
      }

      console.log(`🔄 Making ${method} request to: ${endpoint}`, requestData);

      const response = await axios({
        method,
        url: endpoint,
        data: Object.keys(requestData).length > 0 ? requestData : undefined
      });

      // Store conflict info if available
      if (action === "request-extension" && response.data.conflictTime) {
        setConflictInfo({
          time: new Date(response.data.conflictTime),
          hasConflict: true
        });
      }

      if (response.data) {
        onActionSuccess?.();
        onClose();
      }
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
      setError(err.response?.data?.message || `Failed to ${action} reservation`);
    } finally {
      setIsProcessing(false);
      setProcessingAction("");
    }
  };

  const handleApprove = () => handleAction("approve");
  const handleReject = () => handleAction("reject");
  const handleStart = () => handleAction("start");
  const handleEndEarly = () => handleAction("end-early");
  const handleCancel = () => handleAction("cancel");
  const handleApproveExtension = () => handleAction("approve-extension");
  const handleRejectExtension = () => handleAction("reject-extension");

const handleRequestExtension = async () => {
  await handleAction("request-extension", {
    extensionType: "continuous",
    extensionReason: extensionReason
  });
  setShowExtensionModal(false);
  setExtensionReason("");
};

  const canStartReservation = () => {
    if (reservation.status !== "Approved") return false;
    
    const now = new Date();
    const reservationStart = new Date(reservation.datetime);
    const fifteenMinutesBefore = new Date(reservationStart.getTime() - 15 * 60 * 1000);
    
    // Allow starting 15 minutes before scheduled time
    return now >= fifteenMinutesBefore;
  };

  const getExtendedEndTime = () => {
    if (!reservation.extendedEndDatetime) return null;
    return new Date(reservation.extendedEndDatetime);
  };

  const extendedEndTime = getExtendedEndTime();
  const originalEndTime = new Date(reservation.endDatetime);
  const currentEndTime = extendedEndTime || originalEndTime;

  const renderActionButtons = () => {
    // Only show actions for staff/admin or main reserver
    if (!isStaffOrAdmin && !isMainReserver) {
      return (
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
        >
          Close
        </button>
      );
    }

    switch (reservation.status) {
      case "Pending":
        if (isStaffOrAdmin) {
          return (
            <>
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                {isProcessing && processingAction === 'reject' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  "Decline"
                )}
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                {isProcessing && processingAction === 'approve' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  "Approve"
                )}
              </button>
            </>
          );
        }
        // Main reserver can cancel pending reservations
        if (isMainReserver) {
          return (
            <button
              onClick={handleCancel}
              disabled={isProcessing}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isProcessing && processingAction === 'cancel' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Cancelling...
                </>
              ) : (
                "Cancel Reservation"
              )}
            </button>
          );
        }
        break;

      case "Approved":
        const actions = [];
              
        // Staff/Admin can start the reservation ANYTIME
        if (isStaffOrAdmin) {
          actions.push(
            <button
              key="start"
              onClick={handleStart}
              disabled={isProcessing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isProcessing && processingAction === 'start' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Starting...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Start Reservation
                </>
              )}
            </button>
          );
        }
        
        // Main reserver can cancel approved reservations
        if (isMainReserver) {
          actions.push(
            <button
              key="cancel"
              onClick={handleCancel}
              disabled={isProcessing}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isProcessing && processingAction === 'cancel' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Cancelling...
                </>
              ) : (
                "Cancel Reservation"
              )}
            </button>
          );
        }

        return actions;

      case "Ongoing":
        const ongoingActions = [];
        
        if (isStaffOrAdmin) {
          ongoingActions.push(
            <button
              key="end-early"
              onClick={handleEndEarly}
              disabled={isProcessing}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isProcessing && processingAction === 'end-early' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Ending...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-2 0v6a1 1 0 002 0V7zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V7a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  End Early
                </>
              )}
            </button>
          );
        }

        // Extension request handling
        if (reservation.extensionRequested && reservation.extensionStatus === "Pending" && isStaffOrAdmin) {
          ongoingActions.push(
            <button
              key="approve-extension"
              onClick={handleApproveExtension}
              disabled={isProcessing}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isProcessing && processingAction === 'approve-extension' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Approving...
                </>
              ) : (
                "Approve Extension"
              )}
            </button>
          );
          ongoingActions.push(
            <button
              key="reject-extension"
              onClick={handleRejectExtension}
              disabled={isProcessing}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {isProcessing && processingAction === 'reject-extension' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Rejecting...
                </>
              ) : (
                "Reject Extension"
              )}
            </button>
          );
        } else if (isMainReserver && !reservation.extensionRequested) {
          // Main reserver can request continuous extension
          ongoingActions.push(
            <button
              key="request-extension"
              onClick={() => setShowExtensionModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
              </svg>
              Request Extension
            </button>
          );
        }

        return ongoingActions;

      default:
        // For Completed, Cancelled, Rejected, Expired - show close button only
        return (
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Close
          </button>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Reservation Details</h3>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="text-white hover:text-gray-200 transition-colors text-2xl disabled:opacity-50"
            >
              ×
            </button>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
              {reservation.status}
              {reservation.extensionRequested && (
                <span className="ml-1 text-xs">
                  ({reservation.extensionStatus || "Pending"} Extension)
                </span>
              )}
            </span>
            <span className="text-blue-100">•</span>
            <span className="text-blue-100 text-sm">
              Created {formatPHDateTime(reservation.createdAt)}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Room</label>
                <p className="text-lg font-semibold text-gray-900">{reservation.roomName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Purpose</label>
                <p className="text-gray-900">{reservation.purpose}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Scheduled Time</label>
                <p className="text-gray-900">
                  {reservation.date}<br />
                  {moment(reservation.datetime).tz("Asia/Manila").format("hh:mm A")} -{" "}
                  {moment(reservation.endDatetime).tz("Asia/Manila").format("hh:mm A")}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
                <p className="text-gray-900">{reservation.location}</p>
              </div>

              {/* Extension Info - FIXED SECTION */}
              {reservation.extensionRequested && (
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Extension Request</label>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="text-sm text-yellow-800">
                      <p><strong>Status:</strong> {reservation.extensionStatus || "Pending"}</p>
                      {reservation.extensionType === "continuous" && (
                        <p><strong>Type:</strong> Continuous Extension</p>
                      )}
                      {reservation.extendedEndDatetime && (
                        <p><strong>Extended Until:</strong> {formatPHDateTime(reservation.extendedEndDatetime)}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Additional Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Group Size</label>
                <p className="text-gray-900">{reservation.numUsers} users</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Reserved By</label>
                <p className="text-gray-900">
                  {reservation.userId?.name || "N/A"}<br />
                  <span className="text-sm text-gray-600">
                    {reservation.userId?.id_number || "N/A"}
                  </span>
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Department</label>
                <p className="text-gray-900">{reservation.userId?.department || "N/A"}</p>
              </div>

              {/* Current Schedule Section */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">Current Schedule</label>
                
                <div className="mb-2">
                  <span className="text-sm text-gray-500">Start: </span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatPHDateTime(reservation.datetime)}
                  </span>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Current End: </span>
                  <span className={`text-sm font-medium ${extendedEndTime ? 'text-green-600' : 'text-gray-900'}`}>
                    {formatPHDateTime(currentEndTime)}
                    {extendedEndTime && <span className="text-xs ml-1">(Extended)</span>}
                  </span>
                </div>
              </div>

              {/* Conflict Information */}
              {conflictInfo && conflictInfo.hasConflict && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-2">
                  <p className="text-sm text-orange-700">
                    <strong>Note:</strong> Extension can only be granted until {formatPHDateTime(conflictInfo.time)} due to a conflicting reservation.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Participants Section */}
          {reservation.participants && reservation.participants.length > 0 && (
            <div className="mt-6 border-t pt-6">
              <label className="block text-sm font-medium text-gray-600 mb-3">
                Participants ({reservation.participants.length})
              </label>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-3">
                  {reservation.participants.map((participant, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <p className="font-medium text-gray-900">{participant.name}</p>
                        <p className="text-sm text-gray-600">
                          {participant.idNumber} • {participant.department}
                        </p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Participant
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        <div className="border-t bg-gray-50 p-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="text-sm text-gray-600">
              Logged in as: <span className="font-medium capitalize">{currentUser?.role}</span>
              {isMainReserver && " • Main Reserver"}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              {renderActionButtons()}
            </div>
          </div>
        </div>
      </div>

      {/* Extension Request Modal - Updated for Continuous Extension */}
{showExtensionModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">Request Continuous Extension</h3>
      </div>
      
      <div className="p-6 space-y-4">
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
            Current End Time
          </label>
          <p className="text-gray-900 font-medium">
            {formatPHDateTime(currentEndTime)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How it works:
          </label>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Reservation continues automatically</li>
            <li>• Stops at next reservation (if any)</li>
            <li>• You can end anytime with "End Early"</li>
            <li>• Staff can also end the reservation</li>
          </ul>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Extension (Optional)
          </label>
          <textarea
            value={extensionReason}
            onChange={(e) => setExtensionReason(e.target.value)}
            placeholder="Why do you need continuous extension?"
            rows="3"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
        <button
          onClick={() => {
            setShowExtensionModal(false);
            setExtensionReason("");
          }}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleRequestExtension}
          disabled={isProcessing}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isProcessing ? "Submitting..." : "Start Continuous Extension"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ReservationModal;