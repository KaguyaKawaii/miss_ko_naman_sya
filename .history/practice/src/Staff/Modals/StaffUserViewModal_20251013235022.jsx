import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { 
  X, User, Mail, IdCard, Shield, Building, GraduationCap, 
  Calendar, Clock, Users, MapPin, Clock as ClockIcon
} from "lucide-react";

export default function StaffUserViewModal({ user, onClose, onToggleVerified, onUserUpdated }) {
  const [imgTimestamp, setImgTimestamp] = useState(Date.now());
  const [loading, setLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [userReservations, setUserReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const getProfilePictureUrl = () => {
    if (!user.profilePicture) return null;
    if (user.profilePicture.startsWith("http")) {
      return `${user.profilePicture}?t=${imgTimestamp}`;
    } else {
      return `http://localhost:5000${user.profilePicture}?t=${imgTimestamp}`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Fetch user's reservations and participations
  useEffect(() => {
    const fetchUserReservations = async () => {
      if (!user?._id) return;
      
      try {
        setLoadingReservations(true);
        const response = await axios.get(`http://localhost:5000/api/reservations/user/${user._id}`);
        setUserReservations(response.data.reservations || []);
      } catch (error) {
        console.error("Failed to fetch user reservations:", error);
        setUserReservations([]);
      } finally {
        setLoadingReservations(false);
      }
    };

    if (activeTab === "reservations") {
      fetchUserReservations();
    }
  }, [user?._id, activeTab]);

  const handleToggleVerification = async () => {
    try {
      setVerificationLoading(true);
      console.log("Toggling verification for:", user._id, "Current verified:", user.verified);
      
      if (onToggleVerified) {
        await onToggleVerified(user);
      }
    } catch (error) {
      console.error("Failed to toggle verification:", error);
      alert("Failed to update verification status.");
    } finally {
      setVerificationLoading(false);
      setImgTimestamp(Date.now());
    }
  };

  const handleToggleSuspension = async () => {
    try {
      setLoading(true);
      console.log("Toggling suspension for:", user._id, "=>", !user.suspended);
      const response = await axios.put(
        `http://localhost:5000/api/users/toggle-suspend/${user._id}`,
        { suspend: !user.suspended }
      );
      
      if (response.data.success) {
        const socket = window.socket || io("http://localhost:5000");
        socket.emit("user-updated", response.data.user);
        
        if (onUserUpdated) {
          onUserUpdated(response.data.user);
        }
      } else {
        throw new Error(response.data.message || "Failed to update suspension status");
      }
    } catch (error) {
      console.error("Failed to toggle suspension:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to update suspension status.");
    } finally {
      setLoading(false);
      setImgTimestamp(Date.now());
    }
  };

  // Get all participants from all reservations (excluding the main reserver)
  const getAllParticipants = () => {
    const allParticipants = [];
    userReservations.forEach(reservation => {
      // Add participants from each reservation (excluding the main reserver)
      if (reservation.participants && reservation.participants.length > 0) {
        reservation.participants.forEach(participant => {
          allParticipants.push({
            ...participant,
            reservationRoom: reservation.roomName,
            reservationDate: reservation.datetime,
            reservationStatus: reservation.status
          });
        });
      }
    });
    return allParticipants;
  };

  const allParticipants = getAllParticipants();

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-6xl rounded-xl shadow-lg overflow-hidden max-h-[90vh]">
        {/* Modal Header */}
        <header className="flex justify-between items-center bg-gray-50 border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">User Profile - {user.name}</h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </header>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 border-b border-gray-200">
          {["profile", "reservations", "participants"].map((tab) => (
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

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === "profile" && (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Profile Picture + Actions */}
              <div className="flex flex-col items-center w-full lg:w-1/3">
                <div className="relative w-40 h-40 rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden mb-4">
                  {user.profilePicture ? (
                    <img
                      src={getProfilePictureUrl()}
                      alt={`${user.name}'s profile`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={64} className="text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Status Badges */}
                <div className="flex flex-col gap-2 mb-4 items-center">
                  <span className={`px-3 py-0.5 rounded-full text-xs font-medium ${
                    user.verified 
                      ? "bg-green-50 text-green-700 border border-green-100" 
                      : "bg-gray-50 text-gray-600 border border-gray-200"
                  }`}>
                    {user.verified ? "Verified" : "Unverified"}
                  </span>

                  {user.suspended && (
                    <span className="px-3 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                      Suspended
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 w-full max-w-xs">
                  <button
                    onClick={handleToggleVerification}
                    disabled={verificationLoading}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
                      user.verified
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100"
                    } ${verificationLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {verificationLoading
                      ? "Processing..."
                      : user.verified
                        ? "Revoke Verification"
                        : "Verify Account"}
                  </button>

                  <button
                    onClick={handleToggleSuspension}
                    disabled={loading}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
                      user.suspended
                        ? "bg-green-50 text-green-600 hover:bg-green-100 border-green-100"
                        : "bg-red-50 text-red-600 hover:bg-red-100 border-red-100"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {loading
                      ? "Processing..."
                      : user.suspended
                        ? "Unsuspend Account"
                        : "Suspend Account"}
                  </button>
                </div>
              </div>

              {/* User Details */}
              <div className="w-full lg:w-2/3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-base font-medium text-gray-700 flex items-center gap-2">
                      <User size={18} className="text-gray-500" /> Basic Info
                    </h3>
                    <DetailItem icon={<User size={16} />} label="Full Name" value={user.name || "—"} />
                    <DetailItem icon={<Mail size={16} />} label="Email" value={user.email || "—"} />
                    <DetailItem icon={<IdCard size={16} />} label="ID Number" value={user.id_number || "—"} />
                    <DetailItem 
                      icon={<Shield size={16} />} 
                      label="Role" 
                      value={user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "—"} 
                    />
                  </div>

                  {/* Role-Specific Info */}
                  <div className="space-y-4">
                    <h3 className="text-base font-medium text-gray-700 flex items-center gap-2">
                      <Building size={18} className="text-gray-500" /> Institution
                    </h3>
                    {(user.role === "Student" || user.role === "Faculty") && (
                      <DetailItem icon={<Building size={16} />} label="Department" value={user.department || "—"} />
                    )}
                    {user.role === "Student" && (
                      <>
                        <DetailItem icon={<GraduationCap size={16} />} label="Course" value={user.course || "—"} />
                        <DetailItem icon={<GraduationCap size={16} />} label="Year Level" value={user.year_level || user.yearLevel || "—"} />
                      </>
                    )}
                  </div>

                  {/* System Info */}
                  <div className="md:col-span-2 space-y-4 pt-2">
                    <h3 className="text-base font-medium text-gray-700 flex items-center gap-2">
                      <Clock size={18} className="text-gray-500" /> System Info
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <DetailItem icon={<Calendar size={16} />} label="Account Created" value={formatDate(user.createdAt || user.created_at)} />
                      <DetailItem icon={<Clock size={16} />} label="Last Updated" value={formatDate(user.updatedAt || user.updated_at)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "participants" && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Users size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">All Participants from User's Reservations</h3>
                      <p className="text-sm text-gray-600">{allParticipants.length} total participants across all reservations</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {allParticipants.length > 0 ? (
                    allParticipants.map((participant, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm bg-gradient-to-br from-yellow-400 to-yellow-500">
                            {participant.name?.charAt(0) || "U"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-semibold text-gray-900 truncate">{participant.name || "Unknown"}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <IdCard size={12} />
                                <span className="font-mono truncate">{participant.id_number || "N/A"}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Building size={12} />
                                <span className="truncate">{participant.department || "N/A"}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin size={12} />
                                <span className="truncate">{participant.reservationRoom}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ClockIcon size={12} />
                                <span className="truncate">{formatDate(participant.reservationDate)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users size={48} className="mx-auto mb-3 text-gray-300" />
                      <p>No participants found in user's reservations</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Reusable detail component
function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-1.5 bg-gray-100 rounded-full text-gray-600">
        {icon}
      </div>
      <div>
        <p className="text-xs font-normal text-gray-500">{label}</p>
        <p className="text-gray-700 font-medium text-sm">{value || "—"}</p>
      </div>
    </div>
  );
}