import React, { useEffect, useState } from "react";
import socket from "../utils/socket";
import api from "../utils/api";          // ✅ shared Axios instance

function Profile({ user }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  // Fetch one user by ID
  const fetchUser = async () => {
    if (!user?._id) return;              // guard if user prop isn’t ready yet
    try {
      const { data } = await api.get(`/users/${user._id}`);
      setProfile(data.user ?? data);     // works with { user: … } or plain obj
      setError("");
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setError("Failed to load profile.");
    }
  };

  /* ------------------------- lifecycle hooks ------------------------- */
  useEffect(() => {
    fetchUser();                         // on mount or when user._id changes
  }, [user?._id]);

  useEffect(() => {
    // listen for real-time updates
    const handler = (updatedId) => {
      if (updatedId === user?._id) fetchUser();
    };
    socket.on("user-updated", handler);
    return () => socket.off("user-updated", handler);
  }, [user?._id]);

  /* ------------------------------- UI -------------------------------- */
  if (error)
    return (
      <div className="ml-[250px] p-10 text-red-600 font-semibold">
        {error}
      </div>
    );

  if (!profile)
    return <div className="ml-[250px] p-10">Loading…</div>;

  const isVerified = Boolean(profile.verified);

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#CC0000] text-white pl-5 h-[50px] flex items-center">
        <h1 className="text-2xl font-semibold">Profile</h1>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="m-5 border border-gray-200 rounded-lg p-8 bg-white shadow-md min-h-[calc(100vh-50px)]">
          <h2 className="text-3xl font-semibold text-center mb-8">Profile Details</h2>

          <div className="flex flex-col items-center gap-8">
            {/* Avatar */}
            <div className="border w-36 h-36 rounded-full bg-white flex items-center justify-center text-5xl text-gray-400">
              {profile.name?.charAt(0) || "?"}
            </div>

            {/* Info fields */}
            <div className="w-full max-w-md space-y-4">
              <Field label="Full Name"  value={profile.name} />
              <Field label="Email"      value={profile.email} />
              <Field label="ID Number"  value={profile.id_number} />
              <Field label="Department" value={profile.department} />

              {profile.role === "Student" && (
                <>
                  <Field label="Course"      value={profile.course} />
                  <Field label="Year Level"  value={profile.year_level} />
                </>
              )}

              {/* Verified badge */}
              <div>
                <p className="font-medium mb-1">Verified Status</p>
                <div
                  className={`border p-3 rounded-lg shadow-md text-center ${
                    isVerified
                      ? "bg-green-100 border-green-300 text-green-700"
                      : "bg-red-100 border-red-300 text-red-700"
                  }`}
                >
                  {isVerified ? "Verified" : "Not Verified"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* Simple display wrapper */
function Field({ label, value }) {
  return (
    <div>
      <p className="font-medium mb-1">{label}</p>
      <div className="border border-gray-200 p-3 rounded-lg shadow-md bg-gray-50">
        <p>{value || "—"}</p>
      </div>
    </div>
  );
}

export default Profile;
