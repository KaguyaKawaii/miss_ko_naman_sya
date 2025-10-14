import React, { useState } from "react";
import moment from "moment-timezone";
import axios from "axios";
import {
  X,
  Clock,
  Users,
  MapPin,
  Calendar,
  FileText,
  User,
  Building,
  AlertCircle,
  CheckCircle,
  XCircle,
  Play,
  Square,
  Plus,
  Minus
} from "lucide-react";

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

  const formatTime = (iso) => {
    if (!iso) return "N/A";
    return moment(iso).tz("Asia/Manila").format("hh:mm A");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-amber-100 text-amber-800 border-amber-200";
      case "Approved": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Ongoing": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Rejected": return "bg-rose-100 text-rose-800 border-rose-200";
      case "Cancelled": return "bg-gray-100 text-gray-800 border-gray-300";
      case "Expired": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Completed": return "bg-violet-100 text-violet-800 border-violet-200";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending": return <Clock size={16} />;
      case "Approved": return <CheckCircle size={16} />;
      case "Ongoing": return <Play size={16} />;
      case "Rejected": return <XCircle size={16} />;
      case "Completed": return <CheckCircle size={16} />;
      default: return <Clock size={16} />;
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
          className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-medium shadow-sm"
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
                className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2"
              >
                {isProcessing && processingAction === 'reject' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle size={16} />
                    Decline
                  </>
                )}
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2"
              >
                {isProcessing && processingAction === 'approve' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Approve
                  </>
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
              className="px-6 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2"
            >
              {isProcessing && processingAction === 'cancel' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle size={16} />
                  Cancel Reservation
                </>
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
              disabled={isProcessing || !canStartReservation()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2"
            >
              {isProcessing && processingAction === 'start' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Starting...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Start Reservation
                </>
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
              className="px-6 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2"
            >
              {isProcessing && processingAction === 'cancel' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle size={16} />
                  Cancel
                </>
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
              className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center gap-2"
            >
              {isProcessing && processingAction === 'end-early' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Ending...
                </>
              ) : (
                <>
                  <Square size={16} />
                  End Early
                </>
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
                className="px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2"
              >
                {isProcessing && processingAction === 'reject-extension' ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle size={14} />
                    Reject
                  </>
                )}
              </button>
              <button
                onClick={handleApproveExtension}
                disabled={isProcessing}
                className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2"
              >
                {isProcessing && processingAction === 'approve-extension' ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} />
                    Approve
                  </>
                )}
              </button>
            </div>
          );
        } else if (isMainReserver && !reservation.extensionRequested) {
          ongoingActions.push(
            <button
              key="request-extension"
              onClick={() => setShowExtensionModal(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 font-medium flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Request Extension
            </button>
          );
        }

        return ongoingActions;

      default:
        return (
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-medium"
          >
            Close
          </button>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                <Calendar size={24} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-white">{reservation.roomName}</h2>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getStatusColor(reservation.status)}`}>
                    {getStatusIcon(reservation.status)}
                    {reservation.status}
                    {reservation.extensionRequested && (
                      <span className="ml-1 text-xs opacity-90">
                        ({reservation.extensionStatus || "Pending"} Extension)
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} />
                    {reservation.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    Created {formatPHDateTime(reservation.createdAt)}
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Reservation Details */}
            <div className="space-y-6">
              {/* Purpose Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={18} className="text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Purpose</h3>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">{reservation.purpose}</p>
              </div>

              {/* Schedule Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={18} className="text-green-600" />
                  <h3 className="font-semibold text-gray-900">Schedule</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Start Time</span>
                    <span className="text-sm font-semibold text-gray-900 bg-blue-50 px-3 py-1 rounded-lg">
                      {formatTime(reservation.datetime)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Original End</span>
                    <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                      {formatTime(originalEndTime)}
                    </span>
                  </div>
                  {extendedEndTime && (
                    <div className="flex justify-between items-center py-2 bg-emerald-50 rounded-lg px-3 border border-emerald-200">
                      <span className="text-sm font-semibold text-emerald-700">Extended End</span>
                      <span className="text-sm font-semibold text-emerald-700 bg-white px-3 py-1 rounded-lg">
                        {formatTime(extendedEndTime)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Middle Column - User Information */}
            <div className="space-y-6">
              {/* Main Reserver Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <User size={18} className="text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Main Reserver</h3>
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="font-semibold text-gray-900 text-lg">{reservation.userId?.name || "N/A"}</p>
                    <p className="text-sm text-gray-600 mt-1">{reservation.userId?.id_number || "N/A"}</p>
                    <p className="text-sm text-gray-700 mt-2 bg-white px-3 py-2 rounded border border-gray-300">
                      {reservation.userId?.department || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Extension Info */}
              {reservation.extensionRequested && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock size={18} className="text-amber-600" />
                    <h3 className="font-semibold text-amber-900">Extension Request</h3>
                  </div>
                  <div className="text-sm text-amber-800 space-y-2">
                    <div className="flex justify-between items-center bg-white/50 px-3 py-2 rounded-lg border border-amber-200">
                      <span className="font-semibold">Status:</span>
                      <span className="font-bold">{reservation.extensionStatus || "Pending"}</span>
                    </div>
                    {reservation.extensionType === "continuous" && (
                      <div className="flex justify-between items-center bg-white/50 px-3 py-2 rounded-lg border border-amber-200">
                        <span className="font-semibold">Type:</span>
                        <span className="font-bold">Continuous</span>
                      </div>
                    )}
                    {reservation.extendedEndDatetime && (
                      <div className="flex justify-between items-center bg-white/50 px-3 py-2 rounded-lg border border-amber-200">
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
              {/* Participants Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Users size={18} className="text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">Participants ({participantCount})</h3>
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                  {reservation.participants && reservation.participants.length > 0 ? (
                    reservation.participants.map((participant, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-150">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{participant.name}</p>
                          <p className="text-xs text-gray-600 truncate mt-1">
                            {participant.idNumber} • {participant.department}
                          </p>
                        </div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full ml-2"></div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-lg border border-gray-200">
                      <Users size={32} className="mx-auto text-gray-400 mb-2" />
                      No additional participants
                    </div>
                  )}
                </div>
              </div>

              {/* Group Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Building size={18} className="text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Group Summary</h3>
                </div>
                <div className="text-sm text-blue-800 space-y-2">
                  <div className="flex justify-between items-center bg-white/50 px-3 py-2 rounded-lg border border-blue-200">
                    <span className="font-medium">Main Reserver:</span>
                    <span className="font-semibold">1</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/50 px-3 py-2 rounded-lg border border-blue-200">
                    <span className="font-medium">Additional Participants:</span>
                    <span className="font-semibold">{participantCount}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-blue-300 font-semibold">
                    <span>Total Users:</span>
                    <span>{displayUserCount}</span>
                  </div>
                </div>
              </div>

              {/* Conflict Information */}
              {conflictInfo && conflictInfo.hasConflict && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
                    <p className="text-sm text-amber-800">
                      <span className="font-semibold">Note:</span> Extension limited to {formatPHDateTime(conflictInfo.time)} due to scheduling conflict.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Logged in as:</span>{" "}
              <span className="font-semibold capitalize text-gray-800">{currentUser?.role}</span>
              {isMainReserver && (
                <span className="ml-2 text-gray-700 bg-gray-200 px-2 py-1 rounded text-xs font-medium">
                  (Main Reserver)
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3 justify-center sm:justify-end">
              {renderActionButtons()}
            </div>
          </div>
        </div>
      </div>

      {/* Extension Request Modal */}
      {showExtensionModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-t-2xl text-white">
              <div className="flex items-center gap-3">
                <Plus size={20} className="text-white" />
                <h3 className="text-lg font-bold">Request Time Extension</h3>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Extension
                </label>
                <textarea
                  value={extensionReason}
                  onChange={(e) => setExtensionReason(e.target.value)}
                  placeholder="Please explain why you need more time..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors duration-200"
                  rows={4}
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">Note:</span> This will request a continuous extension of your reservation time.
                  The request will be reviewed by staff/admin.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowExtensionModal(false);
                  setExtensionReason("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 hover:bg-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestExtension}
                disabled={!extensionReason.trim() || isProcessing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors duration-200 flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Request Extension
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReservationModal;