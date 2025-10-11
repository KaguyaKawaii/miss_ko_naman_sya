
import React, { useState } from "react";
import moment from "moment-timezone";
import axios from "axios";

const AdminReservationModal = ({ 
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
      case "Pending": return "bg-amber-50 text-amber-700 border border-amber-200";
      case "Approved": return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "Ongoing": return "bg-blue-50 text-blue-700 border border-blue-200";
      case "Rejected": return "bg-rose-50 text-rose-700 border border-rose-200";
      case "Cancelled": return "bg-gray-100 text-gray-700 border border-gray-300";
      case "Expired": return "bg-orange-50 text-orange-700 border border-orange-200";
      case "Completed": return "bg-violet-50 text-violet-700 border border-violet-200";
      default: return "bg-gray-100 text-gray-700 border border-gray-300";
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
    
    return now >= fifteenMinutesBefore;
  };

  const getExtendedEndTime = () => {
    if (!reservation.extendedEndDatetime) return null;
    return new Date(reservation.extendedEndDatetime);
  };

  const extendedEndTime = getExtendedEndTime();
  const originalEndTime = new Date(reservation.endDatetime);
  const currentEndTime = extendedEndTime || originalEndTime;

  // Calculate accurate user counts
  const totalUsers = reservation.numUsers || 1;
  const participantCount = reservation.participants?.length || 0;
  const displayUserCount = Math.max(totalUsers, participantCount + 1);

  const renderActionButtons = () => {
    if (!isStaffOrAdmin && !isMainReserver) {
      return (
        <button
          onClick={onClose}
          className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Close
        </button>
      );
    }

    switch (reservation.status) {
      case "Pending":
        if (isStaffOrAdmin) {
          return (
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                {isProcessing && processingAction === 'reject' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    Processing...
                  </>
                ) : (
                  "Decline"
                )}
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="px-6 py-3 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl hover:from-black hover:to-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
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
            </div>
          );
        }
        if (isMainReserver) {
          return (
            <button
              onClick={handleCancel}
              disabled={isProcessing}
              className="px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl hover:from-rose-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
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
              
        if (isStaffOrAdmin) {
          actions.push(
            <button
              key="start"
              onClick={handleStart}
              disabled={isProcessing}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {isProcessing && processingAction === 'start' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Starting...
                </>
              ) : (
                "Start Reservation"
              )}
            </button>
          );
        }
        
        if (isMainReserver) {
          actions.push(
            <button
              key="cancel"
              onClick={handleCancel}
              disabled={isProcessing}
              className="px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl hover:from-rose-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
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
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {isProcessing && processingAction === 'end-early' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Ending...
                </>
              ) : (
                "End Early"
              )}
            </button>
          );
        }

        if (reservation.extensionRequested && reservation.extensionStatus === "Pending" && isStaffOrAdmin) {
          ongoingActions.push(
            <div key="extension-actions" className="flex gap-2">
              <button
                onClick={handleRejectExtension}
                disabled={isProcessing}
                className="px-4 py-2.5 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                {isProcessing && processingAction === 'reject-extension' ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                    Rejecting...
                  </>
                ) : (
                  "Reject"
                )}
              </button>
              <button
                onClick={handleApproveExtension}
                disabled={isProcessing}
                className="px-4 py-2.5 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg hover:from-black hover:to-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                {isProcessing && processingAction === 'approve-extension' ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    Approving...
                  </>
                ) : (
                  "Approve"
                )}
              </button>
            </div>
          );
        } else if (isMainReserver && !reservation.extensionRequested) {
          ongoingActions.push(
            <button
              key="request-extension"
              onClick={() => setShowExtensionModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Request Extension
            </button>
          );
        }

        return ongoingActions;

      default:
        return (
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Close
          </button>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-200/50">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-black p-8 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-2xl font-bold text-white">{reservation.roomName}</h3>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border ${getStatusColor(reservation.status).replace('bg-', 'bg-white/20 ').replace('border-', 'border-white/30 ')}`}>
                    {reservation.status}
                    {reservation.extensionRequested && (
                      <span className="ml-1 text-xs opacity-90">
                        ({reservation.extensionStatus || "Pending"} Extension)
                      </span>
                    )}
                  </span>
                </div>
                <p className="text-gray-300 text-sm">
                  Created {formatPHDateTime(reservation.createdAt)} • {reservation.location}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="text-white/70 hover:text-white transition-colors text-3xl disabled:opacity-50 ml-4 transform hover:scale-110 duration-200"
            >
              ×
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-8 mt-6">
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white p-4 rounded-xl shadow-lg border border-rose-300/50">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-white mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Enhanced Layout */}
        <div className="p-8 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-3 gap-8">
            {/* Left Column - Reservation Details */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-gray-900 to-black rounded-full"></div>
                  RESERVATION INFO
                </h4>
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-200/70 shadow-sm">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Purpose</label>
                    <p className="text-gray-900 font-semibold text-lg">{reservation.purpose}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-200/70 shadow-sm">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Date</label>
                      <p className="text-gray-900 font-medium">{reservation.date}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200/70 shadow-sm">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Group Size</label>
                      <p className="text-gray-900 font-medium">{displayUserCount} users</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Timeline */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                  SCHEDULE TIMELINE
                </h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200/50">
                    <span className="text-sm text-gray-600 font-medium">Start Time</span>
                    <span className="text-sm font-bold text-gray-900 bg-blue-50 px-3 py-1 rounded-lg">
                      {moment(reservation.datetime).tz("Asia/Manila").format("hh:mm A")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-200/50">
                    <span className="text-sm text-gray-600 font-medium">Original End</span>
                    <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                      {moment(originalEndTime).tz("Asia/Manila").format("hh:mm A")}
                    </span>
                  </div>
                  {extendedEndTime && (
                    <div className="flex justify-between items-center py-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl px-4 border border-emerald-200/50">
                      <span className="text-sm font-bold text-emerald-700">Extended End</span>
                      <span className="text-sm font-bold text-emerald-700 bg-white/50 px-3 py-1 rounded-lg">
                        {moment(extendedEndTime).tz("Asia/Manila").format("hh:mm A")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Middle Column - User Information */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"></div>
                  USER DETAILS
                </h4>
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-gray-200/70 p-4 shadow-sm">
                    <p className="font-bold text-gray-900 text-lg">{reservation.userId?.name || "N/A"}</p>
                    <p className="text-sm text-gray-600 mt-1">{reservation.userId?.id_number || "N/A"}</p>
                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200/50">
                      {reservation.userId?.department || "N/A"}
                    </p>
                  </div>
                  <div className="text-center py-3 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl border border-gray-700 shadow-lg">
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      Main Reserver
                    </span>
                  </div>
                </div>
              </div>

              {/* Extension Info */}
              {reservation.extensionRequested && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl p-6 shadow-lg">
                  <h4 className="font-bold text-amber-900 mb-3 text-sm flex items-center gap-3">
                    <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></div>
                    EXTENSION REQUEST
                  </h4>
                  <div className="text-sm text-amber-800 space-y-3">
                    <div className="flex justify-between items-center bg-white/50 px-3 py-2 rounded-lg border border-amber-200/50">
                      <span className="font-semibold">Status:</span>
                      <span className="font-bold">{reservation.extensionStatus || "Pending"}</span>
                    </div>
                    {reservation.extensionType === "continuous" && (
                      <div className="flex justify-between items-center bg-white/50 px-3 py-2 rounded-lg border border-amber-200/50">
                        <span className="font-semibold">Type:</span>
                        <span className="font-bold">Continuous</span>
                      </div>
                    )}
                    {reservation.extendedEndDatetime && (
                      <div className="flex justify-between items-center bg-white/50 px-3 py-2 rounded-lg border border-amber-200/50">
                        <span className="font-semibold">Extended Until:</span>
                        <span className="font-bold">{formatPHDateTime(reservation.extendedEndDatetime)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Participants */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200/50 shadow-lg h-full">
                <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"></div>
                  PARTICIPANTS ({participantCount})
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {reservation.participants && reservation.participants.length > 0 ? (
                    reservation.participants.map((participant, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200/70 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{participant.name}</p>
                          <p className="text-xs text-gray-600 truncate mt-1">
                            {participant.idNumber} • {participant.department}
                          </p>
                        </div>
                        <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-full ml-2"></div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-sm bg-white rounded-xl border border-gray-200/70">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      No additional participants
                    </div>
                  )}
                </div>
              </div>

              {/* Total Users Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl p-6 shadow-lg">
                <h4 className="font-bold text-blue-900 mb-3 text-sm flex items-center gap-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                  GROUP SUMMARY
                </h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <div className="flex justify-between items-center bg-white/50 px-3 py-2 rounded-lg border border-blue-200/50">
                    <span className="font-semibold">Main Reserver:</span>
                    <span className="font-bold">1</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/50 px-3 py-2 rounded-lg border border-blue-200/50">
                    <span className="font-semibold">Additional Participants:</span>
                    <span className="font-bold">{participantCount}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/70 px-3 py-2 rounded-lg border border-blue-300/50 font-bold">
                    <span>Total Users:</span>
                    <span>{displayUserCount}</span>
                  </div>
                </div>
              </div>

              {/* Conflict Information */}
              {conflictInfo && conflictInfo.hasConflict && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl p-6 shadow-lg">
                  <p className="text-sm text-amber-800 font-medium">
                    <span className="font-bold">Note:</span> Extension limited to {formatPHDateTime(conflictInfo.time)} due to scheduling conflict.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="border-t border-gray-200/50 bg-gradient-to-r from-gray-50 to-white p-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 font-medium">
              Logged in as: <span className="font-bold capitalize text-gray-900">{currentUser?.role}</span>
              {isMainReserver && <span className="ml-2 text-gray-700 bg-gray-100 px-3 py-1 rounded-lg font-medium">(Main Reserver)</span>}
            </div>
            <div className="flex gap-4">
              {renderActionButtons()}
            </div>
          </div>
        </div>
      </div>

      {/* Extension Request Modal */}
      {showExtensionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200/50">
            <div className="bg-gradient-to-r from-gray-900 to-black p-6 rounded-t-2xl text-white">
              <h3 className="text-xl font-bold">Request Time Extension</h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Reason for Extension
                </label>
                <textarea
                  value={extensionReason}
                  onChange={(e) => setExtensionReason(e.target.value)}
                  placeholder="Please explain why you need more time..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 resize-none transition-all duration-300 hover:border-gray-400"
                  rows={4}
                />
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200/50 rounded-xl p-4">
                <p className="text-sm text-gray-700">
                  <span className="font-bold">Note:</span> This will request a continuous extension of your reservation time.
                  The request will be reviewed by staff/admin.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 justify-end p-6 border-t border-gray-200/50 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowExtensionModal(false);
                  setExtensionReason("");
                }}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold transition-colors duration-300 hover:bg-white rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestExtension}
                disabled={!extensionReason.trim() || isProcessing}
                className="px-8 py-3 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl hover:from-black hover:to-gray-900 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isProcessing ? "Submitting..." : "Request Extension"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReservationModal;
