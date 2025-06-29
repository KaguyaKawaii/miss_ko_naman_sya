import React, { useState } from "react";
import axios from "axios";
import GroundFloorImg from "../assets/GroundFloor.jpg";

function ReservationDetails({ reservation, setView, refreshReservations }) {
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showResultModal, setShowResultModal] = useState(false);

  

  if (!reservation) {
    return (
      <div className="ml-[250px] p-8 flex items-center justify-center h-[calc(100vh-50px)]">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">No reservation selected</h1>
          <p className="text-gray-600 mb-4">Please select a reservation from the list</p>
          <button
            onClick={() => setView("list")}
            className="bg-[#CC0000] text-white px-5 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  const formatDateTime = (datetime) =>
    new Date(datetime).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const formatDateTime2 = (datetime) =>
    new Date(datetime).toLocaleString("en-PH", {
      timeZone: "Asia/Manila",
    
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

const statusBadge = (status) => {
  return status;
};

const statusColorClass = {
  Pending: "bg-yellow-100 text-yellow-700",
  Approved: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
  Cancelled: "bg-gray-200 text-gray-600",
  Expired: "bg-gray-300 text-gray-500",
}[reservation.status] || "bg-gray-100 text-gray-600"; // fallback


  const cancelReservation = async () => {
    if (!reservation._id) return;
    setCancelling(true);
    try {
      const response = await axios.patch(
        `http://localhost:5000/reservations/cancel/${reservation._id}`
      );
      setModalMessage(response.data.message);
      setShowResultModal(true);
    } catch {
      setModalMessage("Failed to cancel reservation.");
      setShowResultModal(true);
    } finally {
      setCancelling(false);
    }
  };

  const handleResultModalClose = () => {
    setShowResultModal(false);
    if (refreshReservations) refreshReservations();
    setView("list");
  };

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] flex flex-col min-h-screen bg-gray-50">
      <header className="bg-[#CC0000] text-white pl-5 h-[50px] flex items-center sticky top-0 z-10 shadow-sm">
        <h1 className="text-2xl font-semibold">Reservation Details</h1>
      </header>

      <div className="p-6 space-y-6">
        {/* Reservation Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Date & Time</p>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <p className="font-medium">{formatDateTime(reservation.datetime)} to {formatDateTime2(reservation.endDatetime)} </p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Room</p>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <p className="font-medium">{reservation.roomName}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Location</p>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <p className="font-medium">{reservation.location}</p>
              </div>
            </div>
            <div className="md:col-span-2 space-y-1">
              <p className="text-sm font-medium text-gray-500">Purpose</p>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <p className="font-medium">{reservation.purpose}</p>
              </div>
            </div>
            <div className="space-y-1">
  <p className="text-sm font-medium text-gray-500">Status</p>
  <div className={`p-3 w-full text-center rounded-2xl font-semibold ${statusColorClass}`}>
    {reservation.status}
  </div>
</div>
          </div>
        </div>

        {/* Room Image */}
        {reservation.location === "Ground Floor" && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Floor Location</h2>
            <div className="flex flex-col justify-center items-center">
              <img
                src={GroundFloorImg}
                alt="Ground Floor"
                className="rounded-lg shadow-md w-full max-w-2xl"
              />
              <p className="font-semibold text-lg font-sans mt-4">Ground Floor</p>
            </div>
          </div>
        )}

        {/* Participants Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Participants</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#FFCC00]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">ID Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Year Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Department</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservation.participants.map((p, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{p.idNumber}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{p.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{p.course || "N/A"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{p.year_level || "N/A"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{p.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-center">
         
          {["Pending", "Approved"].includes(reservation.status) && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              disabled={cancelling}
              className={`px-5 py-2 rounded-lg transition-colors cursor-pointer ${
                cancelling
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-gray-600 text-white hover:bg-gray-800"
              }`}
            >
              {cancelling ? "Cancelling..." : "Cancel Reservation"}
            </button>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-w-[95vw]">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Cancellation</h2>
            <p className="mb-6 text-gray-600">Are you sure you want to cancel this reservation?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
              >
                No
              </button>
              <button
                onClick={() => {
                  setShowCancelConfirm(false);
                  cancelReservation();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-w-[95vw] text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Reservation Update</h2>
            <p className="mb-6 text-gray-600">{modalMessage}</p>
            <button
              onClick={handleResultModalClose}
              className="px-4 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default ReservationDetails;