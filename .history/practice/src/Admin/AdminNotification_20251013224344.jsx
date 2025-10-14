// AdminNotification.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavigation from "./AdminNavigation";
import ReportModal from "./Modals/ReportModal";
import moment from "moment-timezone";
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
  ChevronRight,
  BarChart3,
  Shield,
  IdCard,
  BookOpen,
  GraduationCap
} from "lucide-react";

// Embedded AdminReservationModal Component
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
  const [activeTab, setActiveTab] = useState("overview");

  if (!reservation) return null;

  const isStaffOrAdmin = currentUser?.role === "Staff" || currentUser?.role === "Admin";
  const isMainReserver = currentUser?._id === reservation.userId?._id;

  const formatPHDateTime = (iso) => {
    if (!iso) return "N/A";
    return moment(iso).tz("Asia/Manila").format("MMM DD, YYYY · hh:mm A");
  };

  const formatTime = (iso) => {
    if (!iso) return "N/A";
    return moment(iso).tz("Asia/Manila").format("hh:mm A");
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
        icon: <Play size={14} />,
      },
      Rejected: { 
        color: "bg-rose-100 text-rose-800 border-rose-200", 
        icon: <XCircle size={14} />,
      },
      Cancelled: { 
        color: "bg-gray-100 text-gray-800 border-gray-300", 
        icon: <XCircle size={14} />,
      },
      Expired: { 
        color: "bg-orange-100 text-orange-800 border-orange-200", 
        icon: <Clock size={14} />,
      },
      Completed: { 
        color: "bg-violet-100 text-violet-800 border-violet-200", 
        icon: <CheckCircle size={14} />,
      }
    };
    return configs[status] || configs.Pending;
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

  const getExtendedEndTime = () => {
    if (!reservation.extendedEndDatetime) return null;
    return new Date(reservation.extendedEndDatetime);
  };

  const extendedEndTime = getExtendedEndTime();
  const originalEndTime = new Date(reservation.endDatetime);
  const currentEndTime = extendedEndTime || originalEndTime;

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
  const totalParticipants = allParticipants.length;

  const statusConfig = getStatusConfig(reservation.status);

  const renderActionButtons = () => {
    if (!isStaffOrAdmin && !isMainReserver) {
      return (
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium text-sm"
        >
          Close Details
        </button>
      );
    }

    switch (reservation.status) {
      case "Pending":
        if (isStaffOrAdmin) {
          return (
            <div className="flex gap-2">
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm flex items-center gap-2"
              >
                <XCircle size={16} />
                {isProcessing && processingAction === 'reject' ? "Processing..." : "Decline"}
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm flex items-center gap-2"
              >
                <CheckCircle size={16} />
                {isProcessing && processingAction === 'approve' ? "Processing..." : "Approve"}
              </button>
            </div>
          );
        }
        if (isMainReserver) {
          return (
            <button
              onClick={handleCancel}
              disabled={isProcessing}
              className="px-4 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm flex items-center gap-2"
            >
              <XCircle size={16} />
              {isProcessing && processingAction === 'cancel' ? "Cancelling..." : "Cancel"}
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
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm flex items-center gap-2"
            >
              <Play size={16} />
              {isProcessing && processingAction === 'start' ? "Starting..." : "Start Session"}
            </button>
          );
        }
        
        if (isMainReserver) {
          actions.push(
            <button
              key="cancel"
              onClick={handleCancel}
              disabled={isProcessing}
              className="px-4 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm flex items-center gap-2"
            >
              <XCircle size={16} />
              {isProcessing && processingAction === 'cancel' ? "Cancelling..." : "Cancel"}
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
              className="px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm flex items-center gap-2"
            >
              <Square size={16} />
              {isProcessing && processingAction === 'end-early' ? "Ending..." : "End Early"}
            </button>
          );
        }

        if (reservation.extensionRequested && reservation.extensionStatus === "Pending" && isStaffOrAdmin) {
          ongoingActions.push(
            <div key="extension-actions" className="flex gap-2">
              <button
                onClick={handleRejectExtension}
                disabled={isProcessing}
                className="px-3 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-xs flex items-center gap-1"
              >
                <XCircle size={14} />
                Reject
              </button>
              <button
                onClick={handleApproveExtension}
                disabled={isProcessing}
                className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-xs flex items-center gap-1"
              >
                <CheckCircle size={14} />
                Approve
              </button>
            </div>
          );
        } else if (isMainReserver && !reservation.extensionRequested) {
          ongoingActions.push(
            <button
              key="request-extension"
              onClick={() => setShowExtensionModal(true)}
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 font-medium text-sm flex items-center gap-2"
            >
              <Plus size={16} />
              Extend Time
            </button>
          );
        }

        return ongoingActions;

      default:
        return (
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 font-medium text-sm"
          >
            Close
          </button>
        );
    }
  };

  const InfoCard = ({ title, value, icon, subtitle }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{title}</p>
          <p className="text-lg font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );

  const ParticipantCard = ({ participant, isMainReserver = false }) => (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
          isMainReserver 
            ? "bg-gradient-to-br from-red-500 to-red-600" 
            : "bg-gradient-to-br from-yellow-400 to-yellow-500"
        }`}>
          {participant.name?.charAt(0) || "U"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <p className="font-semibold text-gray-900 truncate">{participant.name}</p>
            {isMainReserver && (
              <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full font-medium flex-shrink-0">
                Main
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <IdCard size={12} />
              <span className="font-mono truncate">{participant.id_number}</span>
            </div>
            <div className="flex items-center gap-1">
              <Building size={12} />
              <span className="truncate">{participant.department}</span>
            </div>
            {(participant.course && participant.course !== "N/A") && (
              <div className="flex items-center gap-1">
                <BookOpen size={12} />
                <span className="truncate">{participant.course}</span>
              </div>
            )}
            {(participant.year_level && participant.year_level !== "N/A") && (
              <div className="flex items-center gap-1">
                <GraduationCap size={12} />
                <span className="truncate">{participant.year_level}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden border border-gray-200">
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
                disabled={isProcessing}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {["overview", "participants", "details"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex-1 ${
                  activeTab === tab
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <InfoCard
                  title="Total Participants"
                  value={totalParticipants}
                  icon={<Users size={20} />}
                  subtitle="4 people maximum"
                />
                <InfoCard
                  title="Start Time"
                  value={formatTime(reservation.datetime)}
                  icon={<Clock size={20} />}
                  subtitle={moment(reservation.datetime).tz("Asia/Manila").format("MMM DD")}
                />
                <InfoCard
                  title="End Time"
                  value={formatTime(currentEndTime)}
                  icon={<Clock size={20} />}
                  subtitle={extendedEndTime ? "Extended" : "Original"}
                />
                <InfoCard
                  title="Duration"
                  value={`${Math.round((currentEndTime - new Date(reservation.datetime)) / (1000 * 60 * 60))} hours`}
                  icon={<BarChart3 size={20} />}
                  subtitle="Total time"
                />
              </div>

              {/* Purpose & User Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Purpose Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <FileText size={20} className="text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Reservation Purpose</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{reservation.purpose}</p>
                </div>

                {/* Timeline Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Clock size={20} className="text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Reservation Timeline</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Scheduled Start</span>
                      <span className="font-semibold text-gray-900">{formatPHDateTime(reservation.datetime)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Original End</span>
                      <span className="font-semibold text-gray-900">{formatPHDateTime(originalEndTime)}</span>
                    </div>
                    {extendedEndTime && (
                      <div className="flex items-center justify-between py-2 bg-emerald-50 rounded-lg px-4 border border-emerald-200">
                        <span className="text-emerald-700 font-semibold">Extended End</span>
                        <span className="text-emerald-700 font-semibold">{formatPHDateTime(extendedEndTime)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "participants" && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Users size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">All Participants</h3>
                      <p className="text-sm text-gray-600">{totalParticipants} of 4 members</p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                    {totalParticipants} people
                  </div>
                </div>

                <div className="space-y-3">
                  {allParticipants.map((participant, index) => (
                    <ParticipantCard
                      key={index}
                      participant={participant}
                      isMainReserver={participant.isMainReserver}
                    />
                  ))}
                  
                  {allParticipants.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users size={48} className="mx-auto mb-3 text-gray-300" />
                      <p>No participants found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "details" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Information */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Reservation ID</span>
                      <span className="font-mono text-sm text-gray-900">{reservation._id?.slice(-8)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Created</span>
                      <span className="text-gray-900">{formatPHDateTime(reservation.createdAt)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Last Updated</span>
                      <span className="text-gray-900">{formatPHDateTime(reservation.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Extension Information */}
                {reservation.extensionRequested && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-amber-900 mb-4">Extension Request</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-amber-700">Status</span>
                        <span className="font-semibold text-amber-900">{reservation.extensionStatus || "Pending"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-amber-700">Type</span>
                        <span className="font-semibold text-amber-900">Continuous</span>
                      </div>
                      {reservation.extendedEndDatetime && (
                        <div className="flex justify-between items-center">
                          <span className="text-amber-700">Extended Until</span>
                          <span className="font-semibold text-amber-900">{formatPHDateTime(reservation.extendedEndDatetime)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Logged in as</span>{" "}
              <span className="font-semibold text-gray-800 capitalize">{currentUser?.role}</span>
              {isMainReserver && (
                <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">
                  Main Reserver
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
              {renderActionButtons()}
            </div>
          </div>
        </div>
      </div>

      {/* Extension Request Modal */}
      {showExtensionModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
            <div className="bg-white p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Plus size={24} className="text-gray-600" />
                <h3 className="text-xl font-bold text-gray-900">Request Time Extension</h3>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for extension
                </label>
                <textarea
                  value={extensionReason}
                  onChange={(e) => setExtensionReason(e.target.value)}
                  placeholder="Please explain why you need additional time for your reservation..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors duration-200"
                  rows={4}
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-700">
                    Your extension request will be reviewed by staff. You'll receive a notification once it's processed.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowExtensionModal(false);
                  setExtensionReason("");
                }}
                className="px-4 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 hover:bg-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestExtension}
                disabled={!extensionReason.trim() || isProcessing}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors duration-200 flex items-center gap-2"
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

// Main AdminNotification Component
function AdminNotification({ setView }) {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const API_URL = "http://localhost:5000/api/notifications";

  // Fetch current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/me");
        setCurrentUser(response.data);
      } catch (err) {
        console.error("Failed to fetch current user", err);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch notifications
  const fetchNotifications = async (filter = "all") => {
    setLoading(true);
    try {
      const url =
        filter === "all" ? API_URL : `${API_URL}?filter=${encodeURIComponent(filter)}`;
      const res = await axios.get(url);
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to load notifications", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Open report details modal
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
        markAsRead(notification._id);
      }
    } catch (err) {
      console.error("Failed to fetch report details:", err);
      // Even if fetching details fails, show the modal with basic notification info
      setSelectedReport(notification);
      setShowReportModal(true);
    }
  };

  // Open reservation details modal
  const openReservationModal = async (notification) => {
    try {
      console.log("Opening reservation modal with notification:", notification);
      
      let reservationId = null;
      
      // Extract reservationId from notification
      if (notification.reservationId) {
        if (typeof notification.reservationId === 'object' && notification.reservationId._id) {
          reservationId = notification.reservationId._id;
        } else if (typeof notification.reservationId === 'string') {
          reservationId = notification.reservationId;
        } else if (notification.reservationId.$oid) {
          reservationId = notification.reservationId.$oid;
        }
      }

      console.log("Extracted reservationId:", reservationId);

      if (reservationId) {
        // Fetch the full reservation details with populated data
        const reservationRes = await axios.get(`http://localhost:5000/reservations/${reservationId}`);
        console.log("Fetched reservation details:", reservationRes.data);
        
        // Transform the data to match AdminReservationModal expectations
        const reservationData = transformReservationData(reservationRes.data);
        setSelectedReservation(reservationData);
      } else {
        // If no valid reservationId, use the notification data
        console.warn("No valid reservationId found in notification:", notification);
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
      // Even if fetching details fails, show the modal with basic notification info
      const transformedData = transformReservationData(notification.reservationId || notification);
      setSelectedReservation(transformedData);
      setShowReservationModal(true);
    }
  };

  // Transform reservation data to match AdminReservationModal expectations
  const transformReservationData = (reservation) => {
    if (!reservation) return null;

    // Calculate total participants (main reserver + additional participants)
    const mainReserver = reservation.userId ? {
      name: reservation.userId.name || "Unknown User",
      id_number: reservation.userId.id_number || "N/A",
      course: reservation.userId.course || "N/A",
      year_level: reservation.userId.year_level || "N/A",
      department: reservation.userId.department || "N/A",
      isMainReserver: true
    } : null;

    const additionalParticipants = reservation.participants || [];
    
    // Ensure we only show maximum 4 participants total (main reserver + 3 additional)
    const limitedParticipants = additionalParticipants.slice(0, 3);
    
    const allParticipants = mainReserver ? [mainReserver, ...limitedParticipants] : limitedParticipants;
    const totalParticipants = allParticipants.length;

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
      numUsers: totalParticipants, // Use actual count instead of reservation.numUsers
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

  // Mark a single notification as read
  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}/read`);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read first
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    // Then handle based on type
    if (notification.type === "report") {
      openReportModal(notification);
    } else if (notification.type === "reservation") {
      openReservationModal(notification);
    }
    // For other notification types, you can add additional logic here
    // For now, just marking as read is sufficient
  };

  // Handle report updates from modal
  const handleReportUpdated = () => {
    // Refresh notifications when a report is updated
    fetchNotifications(activeFilter);
  };

  // Handle reservation updates from modal
  const handleReservationUpdated = () => {
    // Refresh notifications when a reservation is updated
    fetchNotifications(activeFilter);
  };

  useEffect(() => {
    fetchNotifications(activeFilter);
  }, [activeFilter]);

  const filteredNotifications = notifications.filter(notification => {
    // Admin should only see admin/global ones
    if (notification.userId && notification.type === "system") {
      return false; // hide user verification/unverification
    }

    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !notification.isRead;
    return notification.type === activeFilter;
  });

  // Format notification message for admin view
  const formatAdminMessage = (notification) => {
    const userName = notification.userId ? 
      (notification.userId.name || "Unknown User") : 
      (notification.reservationId?.userId?.name || "Unknown User");
    
    const roomName = notification.reservationId?.roomName || "Unknown Room";
    const date = notification.reservationId?.date ? new Date(notification.reservationId.date).toISOString().split('T')[0] : null;

    switch (notification.type) {
      case "reservation":
        if (userName && roomName && date) {
          return `New reservation request by ${userName} for ${roomName} on ${date}.`;
        }
        return notification.message || "New reservation activity.";
      
      case "report":
        return `New maintenance report submitted${userName ? ` by ${userName}` : ''}.`;
      
      case "system":
        return notification.message || "System notification";
      
      case "alert":
        return `Alert: ${notification.message}`;
      
      case "expired":
        return `Expired reservation${userName ? ` from ${userName}` : ''} requires attention.`;
      
      case "dismissed":
        return `Dismissed: ${notification.message}`;
      
      default:
        return notification.message || "Notification";
    }
  };

  // Get reservation status info for display
  const getReservationStatusInfo = (notification) => {
    if (notification.type !== "reservation" || !notification.reservationId) return null;
    
    const reservation = notification.reservationId;
    const status = reservation.status || "Pending";
    
    const statusConfigs = {
      Pending: { color: "text-amber-600", label: "Pending Approval" },
      Approved: { color: "text-emerald-600", label: "Approved" },
      Ongoing: { color: "text-blue-600", label: "In Progress" },
      Rejected: { color: "text-rose-600", label: "Rejected" },
      Cancelled: { color: "text-gray-600", label: "Cancelled" },
      Expired: { color: "text-orange-600", label: "Expired" },
      Completed: { color: "text-violet-600", label: "Completed" }
    };
    
    return statusConfigs[status] || statusConfigs.Pending;
  };

  // Calculate total participants for a reservation notification
  const getTotalParticipants = (notification) => {
    if (notification.type !== "reservation" || !notification.reservationId) return 0;
    
    const reservation = notification.reservationId;
    const hasMainReserver = reservation.userId ? 1 : 0;
    const additionalParticipants = reservation.participants ? reservation.participants.length : 0;
    
    return hasMainReserver + additionalParticipants;
  };

  // SVG Icons for different notification types
  const NotificationIcons = {
    reservation: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
      </svg>
    ),
    report: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
    system: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
      </svg>
    ),
    alert: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    expired: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
    dismissed: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    ),
    default: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
      </svg>
    )
  };

  const getNotificationIcon = (type) => {
    return NotificationIcons[type] || NotificationIcons.default;
  };

  const getTypeColor = (type) => {
    const colors = {
      reservation: "bg-blue-100 text-blue-800",
      report: "bg-orange-100 text-orange-800",
      system: "bg-gray-100 text-gray-800",
      alert: "bg-red-100 text-red-800",
      expired: "bg-yellow-100 text-yellow-800",
      dismissed: "bg-purple-100 text-purple-800"
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
          {/* Stats Overview - Compact */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-lg shadow-xs border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500">Total</p>
                  <p className="text-lg font-bold text-gray-900">{notifications.length}</p>
                </div>
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
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
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
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
                  <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
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
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Panel - Compact */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Filters - Compact */}
            <div className="border-b border-gray-200 p-4 bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
                <div className="flex flex-wrap gap-1">
                  {["all", "unread", "reservation", "report", "system", "alert", "expired", "dismissed"].map((filter) => (
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
                </div>
              </div>
            </div>

            {/* Notifications List - Compact */}
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
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
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
                {filteredNotifications.map((n) => {
                  const formattedMessage = formatAdminMessage(n);
                  const reservationStatus = getReservationStatusInfo(n);
                  const totalParticipants = getTotalParticipants(n);

                  return (
                    <div 
                      key={n._id} 
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer group ${
                        !n.isRead ? "bg-blue-50 border-l-2 border-blue-500" : "border-l-2 border-transparent"
                      }`}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon - Smaller */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          !n.isRead 
                            ? "bg-blue-100 text-blue-600" 
                            : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                        }`}>
                          {getNotificationIcon(n.type)}
                        </div>
                        
                        {/* Content - Compact */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-medium px-2 py-1 rounded-md ${getTypeColor(n.type)} capitalize`}>
                                {n.type}
                              </span>
                              {reservationStatus && (
                                <span className={`text-xs font-medium ${reservationStatus.color}`}>
                                  {reservationStatus.label}
                                </span>
                              )}
                              {!n.isRead && (
                                <span className="flex items-center gap-1 text-xs font-medium text-[#CC0000]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#CC0000] flex-shrink-0"></span>
                                  Unread
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {n.createdAt ? new Date(n.createdAt).toLocaleString() : "Unknown date"}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-800 leading-relaxed">
                            {formattedMessage}
                          </p>

                          {/* Additional context - Smaller */}
                          {(n.reservationId || n.userId) && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {n.reservationId && (
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                  Room: {n.reservationId.roomName || "Unknown"}
                                </span>
                              )}
                              {n.userId && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                  User: {n.userId.name || "Unknown User"}
                                </span>
                              )}
                              {n.type === "reservation" && totalParticipants > 0 && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                  {totalParticipants} of 4 participants
                                </span>
                              )}
                            </div>
                          )}

                          {/* Action buttons for different notification types */}
                          <div className="mt-2 flex gap-2">
                            {n.type === "report" && (
                              <button 
                                className="text-xs text-[#CC0000] hover:text-[#990000] font-medium inline-flex items-center gap-1 transition-colors px-2 py-1 bg-red-50 rounded hover:bg-red-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openReportModal(n);
                                }}
                              >
                                View Report
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            )}
                            {n.type === "reservation" && (
                              <button 
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 transition-colors px-2 py-1 bg-blue-50 rounded hover:bg-blue-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openReservationModal(n);
                                }}
                              >
                                View Reservation
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
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

        {/* Embedded Reservation Modal */}
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