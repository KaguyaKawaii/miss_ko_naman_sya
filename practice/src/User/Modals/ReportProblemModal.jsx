import React, { useState } from "react";
import axios from "axios";

const roomOptions = {
  "Ground Floor": [
    "Discussion Room",
    "Faculty Room",
    "Graduate Hub Research",
    "Collaboration Room",
  ],
  "2nd Floor": [
    "Discussion Room",
    "Faculty Room",
    "Graduate Hub Research",
    "Collaboration Room",
  ],
  "4th Floor": [
    "Discussion Room",
    "Faculty Room",
    "Graduate Hub Research",
    "Collaboration Room",
  ],
  "5th Floor": [
    "Faculty Room",
    "Collaboration Room",
  ],
};

const ReportProblemModal = ({ isOpen, onClose, user }) => {
  const [category, setCategory] = useState("Maintenance");
  const [details, setDetails] = useState("");
  const [floor, setFloor] = useState("");
  const [room, setRoom] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const showLocationFields = ["Maintenance", "Equipment"].includes(category);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!details.trim()) return;

    try {
      setIsSubmitting(true);
      await axios.post("http://localhost:5000/reports", {
  reportedBy: user.name,
  userId: user._id,
  category,
  details,
  floor: showLocationFields ? floor : "",  // use empty string instead of null
  room: showLocationFields ? room : "",
});
      setSuccess(true);
      setDetails("");
      setFloor("");
      setRoom("");
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Failed to send report:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableRooms = roomOptions[floor] || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Report a Problem</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="Maintenance">Maintenance</option>
                <option value="Security">Security</option>
                <option value="Equipment">Equipment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Floor & Room Select */}
            {showLocationFields && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                  <select
                    value={floor}
                    onChange={(e) => {
                      setFloor(e.target.value);
                      setRoom(""); // Reset room when floor changes
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Select Floor</option>
                    {Object.keys(roomOptions).map((flr) => (
                      <option key={flr} value={flr}>{flr}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                  <select
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                    disabled={!floor}
                  >
                    <option value="">Select Room</option>
                    {availableRooms.map((rm) => (
                      <option key={rm} value={rm}>{rm}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Details */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="Describe the issue..."
                required
              />
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
                Report submitted successfully!
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportProblemModal;
