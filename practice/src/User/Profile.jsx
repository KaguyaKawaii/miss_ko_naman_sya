import React, { useEffect, useState } from "react";
import socket from "../utils/socket";
import api from "../utils/api";

function Profile({ user }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  const fetchUser = async () => {
    if (!user?._id) return;
    try {
      const { data } = await api.get(`/users/${user._id}`);
      setProfile(data.user ?? data);
      setError("");
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setError("Failed to load profile. Please refresh the page.");
    }
  };

  useEffect(() => {
    fetchUser();
  }, [user?._id]);

  useEffect(() => {
    const handler = (updatedId) => {
      if (updatedId === user?._id) fetchUser();
    };
    socket.on("user-updated", handler);
    return () => socket.off("user-updated", handler);
  }, [user?._id]);

  if (error) {
    return (
      <div className="ml-[250px] w-[calc(100%-250px)] h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-300 max-w-md w-full text-center">
          <h3 className="text-xl font-semibold text-red-600 mb-2">Something went wrong</h3>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={fetchUser}
            className="mt-5 w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    // ✨ Clean animated skeleton loader while fetching
    return (
      <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
        <header className="bg-[#CC0000] text-white px-6 h-[50px] flex items-center shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">My Profile</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
            <div className="bg-white rounded-xl shadow border border-gray-200 p-6 flex items-center space-x-6">
              <div className="w-20 h-20 rounded-full bg-gray-200"></div>
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="flex space-x-2">
                  <div className="h-4 bg-gray-100 rounded w-24"></div>
                  <div className="h-4 bg-gray-100 rounded w-20"></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow border border-gray-200 p-6 space-y-4">
              <div className="h-5 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-100 rounded w-24 mb-2"></div>
                    <div className="h-10 bg-gray-50 rounded border border-gray-200"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const isVerified = Boolean(profile.verified);

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-[#CC0000] text-white px-6 h-[50px] flex items-center shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">My Profile</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Overview Card */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6 flex items-center space-x-6">
            <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 text-3xl font-bold flex items-center justify-center border-2 border-white shadow-inner">
              {profile.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
              <div className="flex items-center mt-1 space-x-4">
                <span className="text-gray-500 capitalize">{profile.role}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  isVerified 
                    ? "bg-green-100 text-green-700 border-green-300"
                    : "bg-red-100 text-red-700 border-red-300"
                }`}>
                  {isVerified ? "Verified" : "Not Verified"}
                </span>
              </div>
            </div>
          </div>

          {/* Combined Info Card */}
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Full Name" value={profile.name} />
              <Field label="Email" value={profile.email} />
              <Field label="ID Number" value={profile.id_number} />
              <Field label="Department" value={profile.department} />
              {profile.role === "Student" && (
                <>
                  <Field label="Course" value={profile.course} />
                  <Field label="Year Level" value={profile.year_level} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      <div className="p-3 bg-gray-50 rounded border border-gray-300">
        <p className={value ? "text-gray-800" : "text-gray-400 italic"}>
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

export default Profile;
