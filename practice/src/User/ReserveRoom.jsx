import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import socket from "../utils/socket";
import moment from "moment-timezone";
import GroundFloorImg from "../assets/GroundFloor.jpg";
import FifthFloorImg from "../assets/picture2.jpg";
import FacultyRoomImg from "../assets/FacultyRoom.jpg";
import Collab from "../assets/CollabRoom.jpg";

function ReserveRoom({ user, setView }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    numUsers: "4",
    purpose: "",
    location: "",
    roomName: "",
    room_Id: "",
    participants: Array.from({ length: 4 }, () => ({
      name: "",
      course: "",
      year_level: "",
      department: "",
      idNumber: "",
      role: "",
    })),
  });

  const [validation, setValidation] = useState(
    Array.from({ length: 4 }, () => ({ status: null, message: "", loading: false }))
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNotVerifiedWarning, setShowNotVerifiedWarning] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [rooms, setRooms] = useState([]);
  const [selectedRoomDetails, setSelectedRoomDetails] = useState(null);

  // Calendar generation functions
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const generateCalendarDays = (month, year) => {
    const days = [];
    const totalDays = daysInMonth(month, year);
    const firstDay = firstDayOfMonth(month, year);
    const now = new Date();
    const today = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    for (let i = 0; i < firstDay; i++) days.push(null);

    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isPastDate = year < currentYear || 
                       (year === currentYear && month < currentMonth) || 
                       (year === currentYear && month === currentMonth && i < today);
      
      days.push({ day: i, date: dateStr, disabled: isPastDate });
    }

    return days;
  };

  const [calendarDays, setCalendarDays] = useState(generateCalendarDays(currentMonth, currentYear));

  const groupedRooms = rooms.reduce((acc, room) => {
    if (!acc[room.floor]) acc[room.floor] = [];
    acc[room.floor].push(room);
    return acc;
  }, {});

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get("http://localhost:5000/rooms");
        setRooms(res.data);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    setCalendarDays(generateCalendarDays(currentMonth, currentYear));
  }, [currentMonth, currentYear]);

  const handleMonthChange = (increment) => {
    let newMonth = currentMonth + increment;
    let newYear = currentYear;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  useEffect(() => {
    if (user) {
      const updated = [...formData.participants];
      updated[0] = {
        name: user.name || "",
        course: user.course || "",
        year_level: user.year_level || "",
        department: user.department || "",
        idNumber: user.id_number || "",
        role: user.role || "",
      };

      const v = [...validation];
      v[0] = user.verified 
        ? { status: "valid", message: "Verified ✓", loading: false } 
        : { status: "invalid", message: "Not Verified", loading: false };

      setFormData(prev => ({ ...prev, participants: updated }));
      setValidation(v);
    }
  }, [user]);

  useEffect(() => {
    if (user && !user.verified) {
      setShowNotVerifiedWarning(true);
    }
  }, [user]);

  useEffect(() => {
    if (!user?._id) return;

    const handleVerification = (data) => {
      if (data?.message?.includes("verified")) {
        window.location.reload();
      }
    };

    socket.on("notification", handleVerification);
    return () => socket.off("notification", handleVerification);
  }, [user]);

  useEffect(() => {
    if (user?._id) {
      socket.emit("join", { userId: user._id });
    }
  }, [user]);

  const handleParticipantChange = async (idx, field, val) => {
    if (idx === 0 && validation[0]?.status === "valid") return;

    const updated = [...formData.participants];
    updated[idx][field] = val;

    if (field === "idNumber" && val.trim()) {
      const isDuplicate = formData.participants.some(
        (p, i) => i !== idx && p.idNumber === val
      );

      const v = [...validation];
      
      if (isDuplicate) {
        v[idx] = { status: "invalid", message: "Duplicate ID Number", loading: false };
        setValidation(v);
        setFormData({ ...formData, participants: updated });
        return;
      }

      // Set loading state
      v[idx] = { ...v[idx], loading: true };
      setValidation(v);
      
      try {
        const res = await axios.get(
           `http://localhost:5000/api/users/check-participant?idNumber=${val}`
        );

        if (!res.data.exists) {
          v[idx] = { status: "invalid", message: "Not registered", loading: false };
          updated[idx] = { name: "", course: "", year_level: "", department: "", idNumber: val, role: "" };
        } else if (!res.data.verified) {
          v[idx] = { status: "invalid", message: "Not verified", loading: false };
          updated[idx] = { name: "", course: "", year_level: "", department: "", idNumber: val, role: "" };
        } else {
          updated[idx] = res.data.role === "Faculty" || res.data.role === "Staff" ? {
            name: res.data.name,
            department: res.data.department,
            idNumber: val,
            course: "",
            year_level: "",
            role: res.data.role,
          } : {
            name: res.data.name,
            course: res.data.course,
            year_level: res.data.year_level, // ✅ FIXED HERE
            department: res.data.department,
            idNumber: val,
            role: res.data.role,
          };
          v[idx] = { status: "valid", message: "Verified ✓", loading: false };
        }

        setFormData({ ...formData, participants: updated });
        setValidation(v);
      } catch (err) {
        console.error("Validation error", err);
        v[idx] = { status: "invalid", message: "Error validating", loading: false };
        setValidation(v);
      }
    } else {
      setFormData({ ...formData, participants: updated });
    }
  };

  const handleNumUsersChange = (val) => {
    const n = parseInt(val, 10);
    const updated = [...formData.participants];
    const v = [...validation];
    
    while (updated.length < n) {
      updated.push({ name: "", course: "", year_level: "", department: "", idNumber: "", role: "" });
      v.push({ status: null, message: "", loading: false });
    }

    updated.length = n;
    v.length = n;
    setFormData({ ...formData, numUsers: val, participants: updated });
    setValidation(v);
    setShowUsersModal(false);
  };

  const validateForm = () => {
    if (!formData.date || !formData.time || !formData.location || !formData.roomName || !formData.purpose) {
      alert("Please complete all required fields.");
      return false;
    }

    // Check if selected room is disabled
    const selectedRoom = rooms.find(room => room._id === formData.room_Id);
    if (selectedRoom && !selectedRoom.isActive) {
      alert("This room is currently unavailable. Please select another room.");
      return false;
    }

    // Check if selected date/time is in the past
    const now = new Date();
    const selectedDate = new Date(`${formData.date}T${formData.time}`);
    if (selectedDate < now) {
      alert("You cannot reserve a room in the past. Please select a future date and time.");
      return false;
    }

    for (let i = 0; i < formData.participants.length; i++) {
      const p = formData.participants[i];
      if (!p.name || !p.department || !p.idNumber) {
        alert(`Please complete all fields for participant ${i + 1}.`);
        return false;
      }

      if (p.role !== "Faculty" && p.role !== "Staff" && (!p.course || !p.year_level)) {
        alert(`Please complete all fields for participant ${i + 1}.`);
        return false;
      }

      if (validation[i].status !== "valid") {
        alert(`Participant ${i + 1} is not verified or registered.`);
        return false;
      }
    }
    return true;
  };

const submitReservation = async () => {
  if (!user.verified) {
    setShowNotVerifiedWarning(true); // Show modal again
    alert("You cannot reserve a room until your account is verified.");
    return; // Stop further execution
  }

  if (!validateForm()) return;

  // ⛔️ Add this to check weekly/day limits before setting loading
  try {
    const check = await axios.get(`http://localhost:5000/reservations/check-limit/${user._id}`, {
  params: {
    date: formData.date,
    time: formData.time,
    asMain: true // ✅ this is the fix
  }
});

    if (check.data.blocked) {
      alert(check.data.reason || "You have reached your reservation limit for this week.");
      return;
    }
  } catch (err) {
  console.error("Limit check failed", err);
  const message = err.response?.data?.message || "Failed to verify reservation limit.";
  alert(message);
  return;
}

  setLoading(true);

    try {
      // Create moment objects in Manila timezone
      const manilaTime = moment.tz(
        `${formData.date}T${formData.time}`,
        "YYYY-MM-DDTHH:mm",
        "Asia/Manila"
      );

      // Calculate end time (1 hour later)
      const endManilaTime = manilaTime.clone().add(1, 'hour');

      const reservationData = {
        userId: user._id,
        room_Id: formData.room_Id,
        roomName: formData.roomName,
        location: formData.location,
        datetime: manilaTime.format(), // ISO string in Manila time
        datetimeUTC: manilaTime.utc().format(), // UTC version
        date: formData.date,
        time: formData.time,
        endDatetime: endManilaTime.format(),
        endDatetimeUTC: endManilaTime.utc().format(),
        numUsers: formData.numUsers,
        purpose: formData.purpose,
        participants: formData.participants,
        timezone: "Asia/Manila",
        status: "Pending" // Initial status
      };

      await axios.post("http://localhost:5000/reservations", reservationData);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Reservation failed:", error);
      alert(`Reservation failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const closeSuccess = () => {
    setShowSuccessModal(false);
    navigate("/dashboard");
  };

  const roomLocations = ["Ground Floor", "2nd Floor", "4th Floor", "5th Floor"];
  
  // Updated times with AM/PM format
  const timeSlots = [
    { value: "07:00", display: "7:00 AM" },
    { value: "07:30", display: "7:30 AM" },
    { value: "08:00", display: "8:00 AM" },
    { value: "08:30", display: "8:30 AM" },
    { value: "09:00", display: "9:00 AM" },
    { value: "09:30", display: "9:30 AM" },
    { value: "10:00", display: "10:00 AM" },
    { value: "10:30", display: "10:30 AM" },
    { value: "11:00", display: "11:00 AM" },
    { value: "11:30", display: "11:30 AM" },
    { value: "13:00", display: "1:00 PM" },
    { value: "13:30", display: "1:30 PM" },
    { value: "14:00", display: "2:00 PM" },
    { value: "14:30", display: "2:30 PM" },
    { value: "15:00", display: "3:00 PM" },
    { value: "15:30", display: "3:30 PM" },
    { value: "16:00", display: "4:00 PM" },
    { value: "16:30", display: "4:30 PM" },
    { value: "17:00", display: "5:00 PM" }
  ];

  const formatDisplayTime = (timeValue) => {
    const slot = timeSlots.find(t => t.value === timeValue);
    return slot ? slot.display : "Select Time";
  };

  const handleRoomSelect = (room) => {
    if (!room.isActive) {
      alert("This room is currently unavailable. Please select another room.");
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      roomName: room.room,
      room_Id: room._id,
    }));
    setSelectedRoomDetails(room);
  };

  const getRoomImage = (room) => {
    // if (room.room === "Faculty Room") return FacultyRoomImg;
    // if (room.room === "Collaboration Room") return Collab;
    // if (room.floor === "5th Floor") return FifthFloorImg;
    return GroundFloorImg;
  };

const RoomFeatureIcon = ({ feature, enabled }) => {
  const icons = {
    wifi: ".",
    aircon: ".",
    projector: ".",
    monitor: "."
  };

    return (
      <span 
        className={`text-xs px-2 py-1 rounded-full ${
          enabled 
            ? "bg-blue-100 text-blue-700 border border-blue-200" 
            : "bg-gray-100 text-gray-400 border border-gray-200"
        }`}
        title={feature}
      >
        {icons[feature] || feature} {feature}
      </span>
    );
  };

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] flex flex-col  bg-gray-50">
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <svg
            className="animate-spin h-16 w-16 text-white mb-4"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 01-8-8z"
            ></path>
          </svg>
          <p className="text-white text-lg">Submitting Reservation...</p>
        </div>
      )}

      <header className="text-black px-6 h-[60px] flex items-center justify-between shadow-sm bg-white">
        <h1 className="text-xl md:text-2xl font-bold tracking-wide">Room Reservation Request</h1>
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
        {/* Form Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Reservation Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Selector */}
            <div className="space-y-1">
              <p className="font-medium text-gray-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Select Date
              </p>
              <div
                onClick={() => setShowDateModal(true)}
                className="w-full p-3 border rounded-lg border-gray-300 shadow-sm outline-none focus:border-[#CC0000] flex items-center cursor-pointer hover:bg-gray-50 transition-colors"
              >
                {formData.date ? (
                  new Date(formData.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                ) : (
                  <span className="text-gray-400">Select Date</span>
                )}
              </div>
            </div>

            {/* Time Selector */}
            <div className="space-y-1">
              <p className="font-medium text-gray-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Time
              </p>
              <div
                onClick={() => setShowTimeModal(true)}
                className="w-full p-3 border rounded-lg border-gray-300 shadow-sm outline-none focus:border-[#CC0000] flex items-center cursor-pointer hover:bg-gray-50 transition-colors"
              >
                {formData.time ? formatDisplayTime(formData.time) : <span className="text-gray-400">Select Time</span>}
              </div>
            </div>

            {/* Number of Users Selector */}
            <div className="space-y-1">
              <p className="font-medium text-gray-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Number of Users
              </p>
              <div
                onClick={() => setShowUsersModal(true)}
                className="w-full p-3 border rounded-lg border-gray-300 shadow-sm outline-none focus:border-[#CC0000] flex items-center cursor-pointer hover:bg-gray-50 transition-colors"
              >
                {formData.numUsers ? `${formData.numUsers} Users` : <span className="text-gray-400">Select Users</span>}
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div className="mt-4">
            <p className="font-medium text-gray-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Purpose
            </p>
            <input
              className="w-full p-3 mt-1 border rounded-lg border-gray-300 shadow-sm outline-none focus:border-[#CC0000]"
              type="text"
              value={formData.purpose}
              onChange={(e) =>
                setFormData({ ...formData, purpose: e.target.value })
              }
              placeholder="Enter purpose of reservation"
            />
          </div>
        </div>

        {/* Date Selection Modal */}
        {showDateModal && (
          <div className="fixed top-0 left-0 w-screen h-screen bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-[350px] shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={() => handleMonthChange(-1)}
                  className="p-2 rounded-full hover:bg-gray-100 font-bold cursor-pointer transition-colors"
                >
                  &lt;
                </button>
                <h2 className="text-xl font-semibold">
                  {months[currentMonth]} {currentYear}
                </h2>
                <button 
                  onClick={() => handleMonthChange(1)}
                  className="p-2 rounded-full hover:bg-gray-100 font-bold cursor-pointer transition-colors"
                >
                  &gt;
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center font-medium text-gray-500 text-sm">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <div key={index} className="text-center">
                    {day ? (
                      <button
                        onClick={() => {
                          if (!day.disabled) {
                            setFormData({ ...formData, date: day.date });
                            setShowDateModal(false);
                          }
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
                          ${day.disabled ? 'text-gray-300 cursor-not-allowed' : 
                            formData.date === day.date ? 
                              'bg-[#CC0000] text-white' : 
                              'hover:bg-gray-100'}
                        `}
                        disabled={day.disabled}
                      >
                        {day.day}
                      </button>
                    ) : (
                      <div className="w-10 h-10"></div>
                    )}
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => setShowDateModal(false)}
                className="mt-4 bg-[#CC0000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition w-full cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Time Selection Modal */}
        {showTimeModal && (
          <div className="fixed top-0 left-0 w-screen h-screen bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-[350px] md:w-[600px] max-h-[90vh] overflow-y-auto shadow-xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Select Time
              </h2>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Morning */}
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">
                    Morning (7:00 AM – 11:30 AM)
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {timeSlots
                      .filter((slot) => {
                        const [hourStr] = slot.value.split(":");
                        const hour = parseInt(hourStr, 10);
                        return hour >= 7 && hour < 12;
                      })
                      .map((slot) => (
                        <button
                          key={slot.value}
                          onClick={() => {
                            setFormData({ ...formData, time: slot.value });
                            setShowTimeModal(false);
                          }}
                          className={`p-3 border border-gray-300 rounded-lg text-center cursor-pointer transition-colors ${
                            formData.time === slot.value
                              ? "bg-[#CC0000] text-white border-[#CC0000]"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {slot.display}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Afternoon */}
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">
                    Afternoon (1:00 PM – 5:00 PM)
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {timeSlots
                      .filter((slot) => {
                        const [hourStr] = slot.value.split(":");
                        const hour = parseInt(hourStr, 10);
                        return hour >= 13 && hour <= 17;
                      })
                      .map((slot) => (
                        <button
                          key={slot.value}
                          onClick={() => {
                            setFormData({ ...formData, time: slot.value });
                            setShowTimeModal(false);
                          }}
                          className={`p-3 border border-gray-300 rounded-lg text-center cursor-pointer transition-colors ${
                            formData.time === slot.value
                              ? "bg-[#CC0000] text-white border-[#CC0000]"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {slot.display}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowTimeModal(false)}
                className="mt-4 bg-[#CC0000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition w-full cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Number of Users Modal */}
        {showUsersModal && (
          <div className="fixed top-0 left-0 w-screen h-screen bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-[350px] shadow-xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Number of Users
              </h2>
              <div className="grid grid-cols-1 gap-3 mb-4">
                {[4, 5, 6, 7, 8].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      handleNumUsersChange(num.toString());
                      setShowUsersModal(false);
                    }}
                    className={`p-4 border border-gray-300 rounded-lg text-center cursor-pointer transition-colors ${
                      formData.numUsers === num.toString()
                        ? "bg-[#CC0000] text-white border-[#CC0000]"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {num} Users
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowUsersModal(false)}
                className="mt-4 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition w-full cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Room Location */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Room Location</h2>
          <div className="flex flex-wrap gap-5 justify-center">
            {roomLocations.map((loc) => {
              let imageSrc = null;
              if (loc === "Ground Floor") imageSrc = GroundFloorImg;

              return (
                <div
                  key={loc}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      location: loc,
                      roomName: "",
                      room_Id: "",
                    })
                  }
                  className={`border-2 rounded-2xl w-[200px] h-[200px] flex justify-center items-center cursor-pointer transition-all duration-200 overflow-hidden relative ${
                    formData.location === loc 
                      ? "border-[#CC0000] ring-2 ring-red-100 opacity-100 scale-105" 
                      : "border-gray-200 opacity-70 hover:opacity-100 hover:border-gray-300"
                  }`}
                >
                  {imageSrc && (
                    <img
                      src={imageSrc}
                      alt={loc}
                      className="absolute w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40"></div>
                  <p className="relative z-10 text-white text-lg font-semibold text-center px-2 drop-shadow-md">
                    {loc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Room Selection */}
        {formData.location && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Select Room</h2>

            <div className="flex flex-wrap gap-5 justify-center">
              {rooms
                .filter((room) => {
                  const floor = formData.location;

                  if (floor === "5th Floor") {
                    return (
                      room.floor === floor &&
                      (room.room === "Faculty Room" ||
                        room.room === "Collaboration Room")
                    );
                  } else {
                    return room.floor === floor;
                  }
                })
                .map((room) => {
                  const roomImage = getRoomImage(room);
                  const isDisabled = !room.isActive;

                  return (
                    <div
                      key={room._id}
                      onClick={() => handleRoomSelect(room)}
                      className={`border-2 rounded-2xl w-[300px] h-[300px] flex justify-center items-center cursor-pointer relative overflow-hidden transition-all duration-200 ${
                        formData.room_Id === room._id
                          ? "border-[#CC0000] ring-2 ring-red-100 bg-red-50"
                          : isDisabled
                          ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-60"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {roomImage && (
                        <img
                          src={roomImage}
                          alt={room.room}
                          className="absolute w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                      <div className={`absolute inset-0 z-0 ${
                        isDisabled ? "bg-gray-800/60" : "bg-black/30"
                      }`}></div>
                      
                      {/* Room Status Badge */}
                      {isDisabled && (
                        <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
                          Unavailable
                        </div>
                      )}
                      
                      <div className="relative z-10 text-center text-white p-4">
                        <p className="text-xl font-semibold drop-shadow-md mb-2">
                          {room.room}
                        </p>
                        
                        {/* Room Features */}
                        {room.features && Object.values(room.features).some(val => val) && (
                          <div className="flex flex-wrap justify-center gap-1 mb-2">
                            {Object.entries(room.features).map(([feature, enabled]) => 
                              enabled && (
                                <RoomFeatureIcon key={feature} feature={feature} enabled={enabled} />
                              )
                            )}
                          </div>
                        )}
                        
                        {/* Capacity */}
                        <div className="flex items-center justify-center text-sm mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Capacity: {room.capacity}
                        </div>
                        
                        {/* Room Type */}
                        <div className="text-sm opacity-90">
                          {room.type}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Selected Room Details */}
        {selectedRoomDetails && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Selected Room Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{selectedRoomDetails.room}</h3>
                    <p className="text-gray-600">{selectedRoomDetails.floor} • {selectedRoomDetails.type}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedRoomDetails.isActive 
                      ? "bg-green-100 text-green-800 border border-green-200" 
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}>
                    {selectedRoomDetails.isActive ? "Available" : "Unavailable"}
                  </span>
                </div>

                {/* Room Features */}
                {selectedRoomDetails.features && Object.values(selectedRoomDetails.features).some(val => val) && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Room Features:</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedRoomDetails.features).map(([feature, enabled]) => (
                        <div
                          key={feature}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                            enabled 
                              ? "bg-blue-50 border-blue-200 text-blue-700" 
                              : "bg-gray-50 border-gray-200 text-gray-400"
                          }`}
                        >
                          <RoomFeatureIcon feature={feature} enabled={enabled} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Room Notes */}
                {selectedRoomDetails.notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Important Notes:
                    </h4>
                    <p className="text-yellow-700 text-sm">{selectedRoomDetails.notes}</p>
                  </div>
                )}

                
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-3">Room Specifications</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-medium">{selectedRoomDetails.capacity} people</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Floor:</span>
                    <span className="font-medium">{selectedRoomDetails.floor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{selectedRoomDetails.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      selectedRoomDetails.isActive ? "text-green-600" : "text-red-600"
                    }`}>
                      {selectedRoomDetails.isActive ? "Available" : "Unavailable"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Participants */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Participants</h2>
          
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#FFCC00]">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">ID Number</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Name</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Course</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Year Level</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Department</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formData.participants.map((p, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}>
                    <td className="py-3 px-4">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="ID Number"
                          className={`w-full p-2 pr-10 rounded-lg outline-none border shadow-sm transition-colors
                            ${
                              validation[idx]?.status === "valid"
                                ? "border-green-500 bg-green-50"
                                : validation[idx]?.status === "invalid"
                                ? "border-red-500 bg-red-50"
                                : "border-gray-300 focus:border-[#CC0000]"
                            }`}
                          value={p.idNumber}
                          disabled={idx === 0}
                          onChange={(e) =>
                            handleParticipantChange(idx, "idNumber", e.target.value)
                          }
                        />
                        {validation[idx]?.loading && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <svg className="animate-spin h-4 w-4 text-gray-500" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 01-8-8z"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#CC0000] transition-colors"
                        value={p.name}
                        disabled={idx === 0 || validation[idx].status === "valid"}
                        onChange={(e) =>
                          handleParticipantChange(idx, "name", e.target.value)
                        }
                      />
                    </td>
                    {!p.role || (p.role !== "Faculty" && p.role !== "Staff") ? (
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="Course"
                          className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#CC0000] transition-colors"
                          value={p.course}
                          disabled={idx === 0 || validation[idx].status === "valid"}
                          onChange={(e) =>
                            handleParticipantChange(idx, "course", e.target.value)
                          }
                        />
                      </td>
                    ) : (
                      <td className="py-3 px-4 text-gray-400 italic">N/A</td>
                    )}
                    {!p.role || (p.role !== "Faculty" && p.role !== "Staff") ? (
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="Year Level"
                          className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#CC0000] transition-colors"
                          value={p.year_level}
                          disabled={idx === 0 || validation[idx].status === "valid"}
                          onChange={(e) =>
                            handleParticipantChange(idx, "year_level", e.target.value)
                          }
                        />
                      </td>
                    ) : (
                      <td className="py-3 px-4 text-gray-400 italic">N/A</td>
                    )}
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        placeholder="Department"
                        className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#CC0000] transition-colors"
                        value={p.department}
                        disabled={idx === 0 || validation[idx].status === "valid"}
                        onChange={(e) =>
                          handleParticipantChange(idx, "department", e.target.value)
                        }
                      />
                    </td>
                    <td className="py-3 px-4">
                      {validation[idx]?.status === "valid" && (
                        <span className="text-green-600 text-sm font-medium flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      )}
                      {validation[idx]?.status === "invalid" && (
                        <span className="text-red-600 text-sm font-medium flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          {validation[idx]?.message}
                        </span>
                      )}
                      {!validation[idx]?.status && p.idNumber && (
                        <span className="text-gray-500 text-sm">Enter ID to verify</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <p className="text-sm text-gray-600 italic mt-3">
            * Enter ID Number to auto-fill participant details. Verified fields will be locked.
          </p>
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Important Notes</h2>
          <ul className="space-y-2">
            <li className="text-sm text-gray-600 flex items-start">
              <span className="text-red-600 font-bold mr-1">•</span>
              The group will be notified fifteen (15) minutes before the usage is terminated. If there are no standing reservations for the next hour, the group may request a one-hour extension.
            </li>
            <li className="text-sm text-gray-600 flex items-start">
              <span className="text-red-600 font-bold mr-1">•</span>
              The Learning Resource Center reserves the right to cancel the reservation of any group that does not arrive within fifteen (15) minutes of the scheduled reservation time.
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            onClick={submitReservation}
            type="button"
            disabled={loading || (selectedRoomDetails && !selectedRoomDetails.isActive)}
            className={`px-8 py-3 rounded-lg transition cursor-pointer flex items-center ${
              loading || (selectedRoomDetails && !selectedRoomDetails.isActive)
                ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
                : "bg-[#CC0000] text-white hover:bg-red-700 hover:shadow-md"
            }`}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 mr-2"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 01-8-8z"
                ></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {selectedRoomDetails && !selectedRoomDetails.isActive ? "Room Unavailable" : "Submit Reservation"}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[350px] text-center shadow-xl">
            <svg
              className="w-16 h-16 text-green-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            <h2 className="text-xl font-semibold mb-2">Success!</h2>
            <p className="text-gray-600 mb-4">
              Your reservation request has been submitted successfully.
            </p>
            <button
              onClick={closeSuccess}
              className="bg-[#CC0000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition w-full cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Not Verified Warning Modal */}
      {showNotVerifiedWarning && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[350px] text-center shadow-xl">
            <svg
              className="w-16 h-16 text-yellow-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
            <h2 className="text-xl font-semibold mb-2">Account Not Verified</h2>
            <p className="text-gray-600 mb-4">
              Your account is not yet verified. You can still fill out the form,
              but you won't be able to submit a reservation until your account
              is verified.
            </p>
            <button
              onClick={() => setShowNotVerifiedWarning(false)}
              className="bg-[#CC0000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition w-full cursor-pointer"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default ReserveRoom;