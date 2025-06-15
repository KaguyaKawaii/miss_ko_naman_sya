import React, { useState } from "react";
import axios from "axios";
import GroundFloorImg from "../assets/GroundFloor.jpg"; // ✅ Only Ground Floor image as JPG

function ReserveRoom({ user }) {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    numUsers: "4",
    purpose: "",
    location: "",
    roomName: "",
    participants: Array.from({ length: 4 }, () => ({
      name: "",
      courseYear: "",
      department: "",
      idNumber: "",
    })),
  });

  const handleParticipantChange = (index, field, value) => {
    const updatedParticipants = [...formData.participants];
    updatedParticipants[index][field] = value;
    setFormData({ ...formData, participants: updatedParticipants });
  };

  const handleNumUsersChange = (value) => {
    const num = parseInt(value);
    const updatedParticipants = [...formData.participants];
    while (updatedParticipants.length < num) {
      updatedParticipants.push({
        name: "",
        courseYear: "",
        department: "",
        idNumber: "",
      });
    }
    updatedParticipants.length = num;
    setFormData({ ...formData, numUsers: value, participants: updatedParticipants });
  };

  const validateForm = () => {
    if (!formData.date || !formData.time || !formData.location || !formData.roomName || !formData.purpose) {
      alert("Please complete all required fields.");
      return false;
    }
    for (let i = 0; i < formData.participants.length; i++) {
      const participant = formData.participants[i];
      if (!participant.name || !participant.courseYear || !participant.department || !participant.idNumber) {
        alert(`Please complete all fields for participant ${i + 1}.`);
        return false;
      }
    }
    return true;
  };

  const submitReservation = async () => {
    if (!validateForm()) return;
    const fullDateTime = `${formData.date}T${formData.time}`;
    try {
      await axios.post("http://localhost:5000/reservations", {
        userId: user._id,
        ...formData,
        datetime: fullDateTime,
      });
      alert("Reservation submitted successfully!");
      setFormData({
        date: "",
        time: "",
        numUsers: "4",
        purpose: "",
        location: "",
        roomName: "",
        participants: Array.from({ length: 4 }, () => ({
          name: "",
          courseYear: "",
          department: "",
          idNumber: "",
        })),
      });
    } catch (err) {
      console.error(err);
      alert("Reservation submission failed.");
    }
  };

  const roomLocations = ["Ground Floor", "2nd Floor", "4th Floor", "5th Floor"];
  const roomNames = ["Discussion Room", "Collaboration Corner", "Graduate Research Hub", "Faculty Corner"];
  const now = new Date();
  const minDate = now.toISOString().split("T")[0];
  const maxDate = `${now.getFullYear() + 1}-12-31`;
  const availableTimes = [
    "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00",
  ];

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] flex flex-col">
      <header className="bg-[#CC0000] text-white pl-5 h-[50px] flex items-center">
        <h1 className="text-2xl font-semibold">Room Reservation Request</h1>
      </header>

      <div className="m-5 flex flex-col items-center">
        {/* Date, Time, Users */}
        <div className="flex flex-wrap gap-6">
          <div>
            <p>Select Date</p>
            <input
              type="date"
              className="w-[250px] h-[40px] p-2 border rounded-[7px] border-gray-200 shadow-sm outline-none focus:border-[#CC0000]"
              min={minDate}
              max={maxDate}
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
              {availableTimes.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <div>
            <p>Number of Users</p>
            <select
              className="w-[250px] h-[40px] p-2 border rounded-[7px] bg-white border-gray-200 shadow-sm outline-none focus:border-[#CC0000]"
              value={formData.numUsers}
              onChange={(e) => handleNumUsersChange(e.target.value)}
            >
              {[4, 5, 6, 7, 8].map((num) => (
                <option key={num} value={num}>{num} Users</option>
              ))}
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

{/* Room Locations */}
<div className="flex flex-col items-center gap-5">
  <p>Room Location</p>
  <div className="flex flex-wrap gap-5 justify-center">
    {roomLocations.map((loc, i) => (
      <div
        key={i}
        onClick={() => setFormData({ ...formData, location: loc })}
        className={`border border-gray-200 shadow-sm rounded-2xl w-[200px] h-[200px] flex flex-col justify-center items-center cursor-pointer transition duration-200 overflow-hidden relative ${
          formData.location === loc ? "border-red-600" : "opacity-40"
        }`}
      >
        {loc === "Ground Floor" ? (
          <>
            <img
              src={GroundFloorImg}
              alt={loc}
              className="absolute w-full h-full object-cover"
            />
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




        <div className="flex flex-col h-[25rem] items-center gap-5 mt-8">
          <p>Room’s Name</p>
          <div className="flex flex-wrap gap-5 justify-center">
            {roomNames.map((name, i) => (
              <div
                key={i}
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
              {formData.participants.map((participant, index) => (
                <tr key={index} className="even:bg-gray-50">
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      placeholder="Stephen Pogi"
                      className="w-full p-2 border-gray-300 border focus:border-red-600 rounded-lg outline-none"
                      value={participant.name}
                      onChange={(e) => handleParticipantChange(index, "name", e.target.value)}
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      placeholder="eg., BSIT 3"
                      className="w-full p-2 border-gray-300 border focus:border-red-600 rounded-lg outline-none"
                      value={participant.courseYear}
                      onChange={(e) => handleParticipantChange(index, "courseYear", e.target.value)}
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      placeholder="eg., CLASE"
                      className="w-full p-2 border-gray-300 border focus:border-red-600 rounded-lg outline-none"
                      value={participant.department}
                      onChange={(e) => handleParticipantChange(index, "department", e.target.value)}
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      placeholder="ID Number"
                      className="w-full p-2 border-gray-300 border focus:border-red-600 rounded-lg outline-none"
                      value={participant.idNumber}
                      onChange={(e) => handleParticipantChange(index, "idNumber", e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col ml-[180px] mt-5 self-start">
          <h1 className="font-semibold">
            <span className="text-red-600">*</span> Note
          </h1>
          <li className="text-[15px]">Group will be notified 15 minutes before session ends. Extensions allowed if no conflict follows.</li>
          <li className="text-[15px]">LRC may cancel reservations if the group doesn’t arrive within 15 minutes.</li>
        </div>

        <div className="flex justify-center mt-5">
          <button onClick={submitReservation} className="cursor-pointer">
            <div className="bg-[#CC0000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300">
              Submit Reservation
            </div>
          </button>
        </div>
      </div>
    </main>
  );
}

export default ReserveRoom;
