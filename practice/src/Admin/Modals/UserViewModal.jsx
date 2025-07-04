import React, { useState } from "react";
import { X, User, Mail, IdCard, Shield, Building, GraduationCap, Layers, Calendar, Clock } from "lucide-react";

export default function UserViewModal({ user, onClose, onToggleVerified }) {
  const [imgTimestamp, setImgTimestamp] = useState(Date.now());

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-lg overflow-hidden">
        {/* Modal Header */}
        <header className="flex justify-between items-center bg-gray-50 border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">User Profile</h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} />
          </button>
        </header>

        {/* Modal Content */}
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center w-full lg:w-1/3">
              <div className="relative w-40 h-40 rounded-full bg-gray-100 border-2 border-gray-200 overflow-hidden mb-4">
                {user.profilePicture ? (
                  <img
                    src={`http://localhost:5000${user.profilePicture}?t=${imgTimestamp}`}
                    alt="Profile"
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
              <div className="mb-4">
                <span className={`px-3 py-0.5 rounded-full text-xs font-medium ${
                  user.verified 
                    ? "bg-green-50 text-green-700 border border-green-100" 
                    : "bg-gray-50 text-gray-600 border border-gray-200"
                }`}>
                  {user.verified ? "Verified" : "Unverified"}
                </span>
              </div>
              
              <button
                onClick={() => {
                  onToggleVerified(user);
                  setImgTimestamp(Date.now()); // Refresh the image if verification changes
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  user.verified 
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                } transition-colors w-full max-w-xs border ${
                  user.verified ? "border-gray-200" : "border-blue-100"
                }`}
              >
                {user.verified ? "Revoke Verification" : "Verify Account"}
              </button>
            </div>

            {/* User Details Section */}
            <div className="w-full lg:w-2/3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-base font-medium text-gray-700 flex items-center gap-2">
                    <User size={18} className="text-gray-500" /> Basic Info
                  </h3>
                  <DetailItem icon={<User size={16} />} label="Full Name" value={user.name} />
                  <DetailItem icon={<Mail size={16} />} label="Email" value={user.email} />
                  <DetailItem icon={<IdCard size={16} />} label="ID Number" value={user.id_number} />
                  <DetailItem icon={<Shield size={16} />} label="Role" value={user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "—"} />
                </div>

                {/* Role-Specific Information */}
                <div className="space-y-4">
                  <h3 className="text-base font-medium text-gray-700 flex items-center gap-2">
                    <Building size={18} className="text-gray-500" /> Institution
                  </h3>
                  {(user.role === "Student" || user.role === "Faculty") && (
                    <DetailItem icon={<Building size={16} />} label="Department" value={user.department} />
                  )}
                  {user.role === "Staff" && (
                    <DetailItem icon={<Layers size={16} />} label="Assigned Floor" value={user.floor} />
                  )}
                  {user.role === "Student" && (
                    <>
                      <DetailItem icon={<GraduationCap size={16} />} label="Course" value={user.course} />
                      <DetailItem icon={<GraduationCap size={16} />} label="Year Level" value={user.yearLevel} />
                    </>
                  )}
                </div>

                {/* System Information */}
                <div className="md:col-span-2 space-y-4 pt-2">
                  <h3 className="text-base font-medium text-gray-700 flex items-center gap-2">
                    <Clock size={18} className="text-gray-500" /> System Info
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <DetailItem icon={<Calendar size={16} />} label="Account Created" 
                      value={user.created_at ? new Date(user.created_at).toLocaleString() : "—"} />
                  </div>
                </div>
              </div>
            </div>
          </div>
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