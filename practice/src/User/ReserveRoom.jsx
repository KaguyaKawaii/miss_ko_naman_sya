import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GroundFloorImg from "../assets/GroundFloor.jpg";

function ReserveRoom({ user }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    numUsers: "4",
    purpose: "",
    location: "",
    roomName: "",
    participants: Array.from({ length: 4 }, () => ({
      name: "", courseYear: "", department: "", idNumber: "",
    })),
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleParticipantChange = (idx, field, val) => {
    const updated = [...formData.participants];
    updated[idx][field] = val;
    setFormData({ ...formData, participants: updated });
  };

  const handleNumUsersChange = (val) => {
    const n = parseInt(val, 10);
    const updated = [...formData.participants];
    while (updated.length < n)
      updated.push({ name: "", courseYear: "", department: "", idNumber: "" });
    updated.length = n;
    setFormData({ ...formData, numUsers: val, participants: updated });
  };

  const validateForm = () => {
    if (!formData.date || !formData.time || !formData.location || !formData.roomName || !formData.purpose) {
      alert("Please complete all required fields.");
      return false;
    }
    for (let i = 0; i < formData.participants.length; i++) {
      const p = formData.participants[i];
      if (!p.name || !p.courseYear || !p.department || !p.idNumber) {
        alert(`Please complete all fields for participant ${i + 1}.`);
        return false;
      }
    }
    return true;
  };

const submitReservation = async () => {
  if (!validateForm()) return;

  const datetime = `${formData.date}T${formData.time}`;

  try {
    await axios.post("http://localhost:5000/reservations", {
      userId: user._id,
      ...formData,
      datetime,
    });
    setShowSuccessModal(true);
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.message || "Reservation submission failed.");
  }
};


  

  const closeSuccess = () => { setShowSuccessModal(false); navigate("/dashboard"); };

  const roomLocations = ["Ground Floor", "2nd Floor", "4th Floor", "5th Floor"];
  const roomNames     = ["Discussion Room", "Collaboration Corner", "Graduate Research Hub", "Faculty Corner"];
  const now  = new Date();
  const minDate = now.toISOString().split("T")[0];
  const maxDate = `${now.getFullYear() + 1}-12-31`;
  const times = ["07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
                 "13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00"];

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] flex flex-col">
          <header className="bg-[#CC0000] text-white pl-5 h-[50px] flex items-center">
        <h1 className="text-2xl font-semibold">Room Reservation Request</h1>
      </header>

      {/* Form */}
      <div className="m-5 flex flex-col items-center">
        {/* Date / Time / Users */}
        <div className="flex flex-wrap gap-6">
          <div>
            <p>Select Date</p>
            <input
              type="date"
              className="w-[250px] h-[40px] p-2 border rounded-[7px] border-gray-200 shadow-sm outline-none focus:border-[#CC0000]"
              min={minDate} max={maxDate}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div>
            <p>Time</p>
            <select
              className="w-[250px] h-[40px] p-2 border rounded-[7px] bg-white border-gray-200 shadow-sm outline-none focus:border-[#CC0000]"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            >
              <option value="">Select Time</option>
              {times.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <p>Number of Users</p>
            <select
              className="w-[250px] h-[40px] p-2 border rounded-[7px] bg-white border-gray-200 shadow-sm outline-none focus:border-[#CC0000]"
              value={formData.numUsers}
              onChange={(e) => handleNumUsersChange(e.target.value)}
            >
              {[4,5,6,7,8].map((n) => <option key={n} value={n}>{n} Users</option>)}
            </select>
          </div>
        </div>

        {/* Purpose */}
        <div className="my-4 w-[800px]">
          <p>Purpose</p>
          <input
            className="w-full h-[40px] p-2 border rounded-[7px] border-gray-200 shadow-sm outline-none focus:border-[#CC0000]"
            type="text"
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
          />
        </div>

        {/* Room Location tiles */}
        <div className="flex flex-col items-center gap-5">
          <p>Room Location</p>
          <div className="flex flex-wrap gap-5 justify-center">
            {roomLocations.map((loc) => (
              <div
                key={loc}
                onClick={() => setFormData({ ...formData, location: loc })}
                className={`border border-gray-200 shadow-sm rounded-2xl w-[200px] h-[200px] flex flex-col justify-center items-center cursor-pointer transition duration-200 overflow-hidden relative ${
                  formData.location === loc ? "border-red-600" : "opacity-40"
                }`}
              >
                {loc === "Ground Floor" ? (
                  <>
                    <img src={GroundFloorImg} alt={loc} className="absolute w-full h-full object-cover" />
                    <p className="absolute bottom-2 left-0 w-full text-center text-white text-lg font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      {loc}
                    </p>
                  </>
                ) : (
                  <p className="text-center z-10">{loc}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Room names */}
        <div className="flex flex-col h-[25rem] items-center gap-5 mt-8">
          <p>Room’s Name</p>
          <div className="flex flex-wrap gap-5 justify-center">
            {roomNames.map((name) => (
              <div
                key={name}
                onClick={() => setFormData({ ...formData, roomName: name })}
                className={`border border-gray-200 shadow-sm rounded-2xl w-[300px] h-[300px] flex justify-center items-center cursor-pointer ${
                  formData.roomName === name ? "bg-red-100 border-red-600" : "opacity-40"
                }`}
              >
                {name}
              </div>
            ))}
          </div>
        </div>

        {/* Participants table */}
        <div className="overflow-x-auto mt-6 flex justify-center">
          <table className="bg-white shadow rounded-xl overflow-hidden w-[80rem]">
            <thead className="bg-[#FFCC00]">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Course & Year</th>
                <th className="py-3 px-4 text-left">Department</th>
                <th className="py-3 px-4 text-left">ID Number</th>
              </tr>
            </thead>
            <tbody>
              {formData.participants.map((p, idx) => (
                <tr key={idx} className="even:bg-gray-50">
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      placeholder="Stephen Pogi"
                      className="w-full p-2 border-gray-300 border focus:border-red-600 rounded-lg outline-none"
                      value={p.name}
                      onChange={(e) => handleParticipantChange(idx,"name",e.target.value)}
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      placeholder="BSIT 3"
                      className="w-full p-2 border-gray-300 border focus:border-red-600 rounded-lg outline-none"
                      value={p.courseYear}
                      onChange={(e) => handleParticipantChange(idx,"courseYear",e.target.value)}
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      placeholder="CLASE"
                      className="w-full p-2 border-gray-300 border focus:border-red-600 rounded-lg outline-none"
                      value={p.department}
                      onChange={(e) => handleParticipantChange(idx,"department",e.target.value)}
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      placeholder="ID Number"
                      className="w-full p-2 border-gray-300 border focus:border-red-600 rounded-lg outline-none"
                      value={p.idNumber}
                      onChange={(e) => handleParticipantChange(idx,"idNumber",e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Note */}
        <div className="flex flex-col ml-[180px] mt-5 self-start">
          <h1 className="font-semibold">
            <span className="text-red-600">*</span> Note
          </h1>
          <li className="text-[15px]">Group will be notified 15 minutes before session ends. Extensions allowed if no conflict follows.</li>
          <li className="text-[15px]">LRC may cancel reservations if the group doesn’t arrive within 15 minutes.</li>
        </div>
        </div>

      {/* Submit button */}
      <div className="flex justify-center mt-5">
        <button
          onClick={submitReservation}
          disabled={!formData.date || !formData.time || !formData.location || !formData.roomName || !formData.purpose}
          type="button"
          className="cursor-pointer"
        >
          <div className={`px-4 py-2 rounded-lg transition duration-300 ${
            !formData.date || !formData.time || !formData.location || !formData.roomName || !formData.purpose
              ? "bg-gray-400"
              : "bg-[#CC0000] text-white hover:bg-red-700"
          }`}>
            Submit Reservation
          </div>
        </button>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl max-w-sm w-full text-center animate-scaleIn">
            <h2 className="text-2xl font-semibold mb-4">Reservation Submitted!</h2>
            <p className="mb-6">We’ll notify your group 15 minutes before the session ends.</p>
            <button onClick={closeSuccess} className="bg-[#CC0000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default ReserveRoom;
