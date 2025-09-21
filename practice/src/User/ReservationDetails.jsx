import React, { useState } from "react";
import axios from "axios";
import GroundFloorImg from "../assets/GroundFloor.jpg";

function ReservationDetails({ reservation, setView, refreshReservations, user }) {
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showResultModal, setShowResultModal] = useState(false);
  const [extendTime, setExtendTime] = useState("");
  const [showExtendModal, setShowExtendModal] = useState(false);

  const isMainReserver = user && reservation.userId === user._id;

  const handleShowExtendModal = () => {
    setShowExtendModal(true);
  };

  const handleEndEarly = async () => {
    try {
      const res = await axios.post(`http://localhost:5000/reservations/end-early/${reservation._id}`);
      setModalMessage(res.data.message || "Reservation ended early.");
    } catch (err) {
      setModalMessage("Failed to end reservation early.");
    } finally {
      setShowResultModal(true);
    }
  };

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

  const statusColorClass = {
    Pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    Approved: "bg-green-100 text-green-800 border border-green-200",
    Rejected: "bg-red-100 text-red-800 border border-red-200",
    Cancelled: "bg-gray-100 text-gray-600 border border-gray-200",
    Expired: "bg-gray-200 text-gray-500 border border-gray-300",
  }[reservation.status] || "bg-gray-100 text-gray-600 border border-gray-200";

  const handleExtendSubmit = async () => {
    if (!extendTime) return;

    const hoursToAdd = parseInt(extendTime);
    const originalEnd = new Date(reservation.endDatetime);
    const newEnd = new Date(originalEnd.getTime() + hoursToAdd * 60 * 60 * 1000);

    try {
      const res = await axios.post(`http://localhost:5000/reservations/extend-request/${reservation._id}`, {
        requestedEndDatetime: newEnd,
        requestedHours: hoursToAdd
      });
      setModalMessage(res.data.message || "Extension request submitted.");
    } catch (err) {
      setModalMessage("Failed to submit extension request.");
    } finally {
      setShowExtendModal(false);
      setShowResultModal(true);
    }
  };

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
    setView("dashboard");
  };

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] flex flex-col min-h-screen bg-gray-50">
      <header className="text-black px-6 h-[60px] flex items-center justify-between shadow-sm bg-white">
        <h1 className="text-xl md:text-2xl font-bold tracking-wide">Reservation Details</h1>
        <button 
          onClick={() => setView("dashboard")}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </button>
      </header>

      <div className="p-6 space-y-6">
        {/* Reservation Information Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Reservation Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Date & Time
              </p>
              <div className="p-3 rounded-lg flex items-center  bg-gray-50 border border-gray-200">
                
                <p className="font-medium text-gray-800">{formatDateTime(reservation.datetime)}</p> 
                
                <p className="font-medium text-gray-800">-{formatDateTime2(reservation.endDatetime)}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Room
              </p>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <p className="font-medium text-gray-800">{reservation.roomName}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Location
              </p>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <p className="font-medium text-gray-800">{reservation.location}</p>
              </div>
            </div>
            
            <div className="md:col-span-2 space-y-1">
              <p className="text-sm font-medium text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Purpose
              </p>
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <p className="font-medium text-gray-800">{reservation.purpose}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Status
              </p>
              <div className={`p-3 w-full text-center rounded-lg font-semibold ${statusColorClass}`}>
                {reservation.status}
              </div>
            </div>
          </div>
        </div>

        {/* Room Image */}
        {reservation.location === "Ground Floor" && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Floor Location</h2>
            <div className="flex flex-col justify-center items-center">
              <img
                src={GroundFloorImg}
                alt="Ground Floor"
                className="rounded-lg shadow-md w-full max-w-2xl border border-gray-200"
              />
              <p className="font-semibold text-lg mt-4 bg-gray-100 px-4 py-2 rounded-lg border border-gray-200">
                Ground Floor
              </p>
            </div>
          </div>
        )}

        {/* Participants Table */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Participants</h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
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
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}>
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
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          {["Pending", "Approved"].includes(reservation.status) && isMainReserver && (
            <>
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={cancelling}
                className={`px-5 py-2.5 rounded-lg transition-colors flex items-center ${
                  cancelling
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-gray-600 text-white hover:bg-gray-800"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {cancelling ? "Cancelling..." : "Cancel Reservation"}
              </button>

              <button
                onClick={handleEndEarly}
                className="px-5 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                End Early
              </button>

              <button
                onClick={handleShowExtendModal}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Extend Time
              </button>
            </>
          )}
        </div>

        {/* Extend Time Modal */}
        {showExtendModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-96 max-w-[95vw] shadow-xl">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Request Extension
              </h2>
              <label className="block mb-2 text-sm font-medium text-gray-700">Select Additional Time</label>
              <select
                value={extendTime}
                onChange={(e) => setExtendTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select Duration --</option>
                <option value="1">1 Hour</option>
                <option value="2">2 Hours</option>
              </select>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowExtendModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExtendSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-w-[95vw] shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Confirm Cancellation
            </h2>
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
          <div className="bg-white rounded-xl p-6 w-96 max-w-[95vw] text-center shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Reservation Update</h2>
            <div className="my-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
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