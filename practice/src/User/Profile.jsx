import React from "react";

function Profile({ user }) {
  // Boolean value that controls the colour and label
  const isVerified = Boolean(user?.verified);

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#CC0000] text-white pl-5 h-[50px] flex items-center">
        <h1 className="text-2xl font-semibold">Profile</h1>
      </header>

      {/* Main Content (scrollable) */}
      <div className="flex-1 overflow-y-auto">
        <div className="m-5 border border-gray-200 rounded-lg p-8 bg-white shadow-md min-h-[calc(100vh-50px)]">
          <h2 className="text-3xl font-semibold text-center mb-8">
            Profile Details
          </h2>

          <div className="flex flex-col items-center gap-8">
            {/* Avatar */}
            <div className="border w-36 h-36 rounded-full bg-white flex items-center justify-center text-5xl text-gray-400">
              {user?.name?.charAt(0) || "?"}
            </div>

            {/* Info Fields */}
            <div className="w-full max-w-md space-y-4">
              {/* Full Name */}
              <Field label="Full Name" value={user?.name} />

              {/* Email */}
              <Field label="Email" value={user?.email} />

              {/* Course */}
              <Field label="Course" value={user?.course} />

              {/* Department */}
              <Field label="Department" value={user?.department} />

              {/* ID Number */}
              <Field label="ID Number" value={user?.id_number} />

              {/* Verified Status */}
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

/* Helper component for a single profile field */
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
