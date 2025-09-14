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
      yearLevel: "",
      department: "",
      idNumber: "",
      role: "",
    })),
  });

  const [validation, setValidation] = useState(
    Array.from({ length: 4 }, () => ({ status: null, message: "" }))
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
        yearLevel: user.year_level || "",
        department: user.department || "",
        idNumber: user.id_number || "",
        role: user.role || "",
      };

      const v = [...validation];
      v[0] = user.verified 
        ? { status: "valid", message: "Verified ✓" } 
        : { status: "invalid", message: "Not Verified" };

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
        v[idx] = { status: "invalid", message: "Duplicate ID Number" };
        setValidation(v);
        setFormData({ ...formData, participants: updated });
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:5000/reservations/check-participant?idNumber=${val}`
        );

        if (!res.data.exists) {
          v[idx] = { status: "invalid", message: "Not registered." };
          updated[idx] = { name: "", course: "", yearLevel: "", department: "", idNumber: val, role: "" };
        } else if (!res.data.verified) {
          v[idx] = { status: "invalid", message: "Not verified." };
          updated[idx] = { name: "", course: "", yearLevel: "", department: "", idNumber: val, role: "" };
        } else {
          updated[idx] = res.data.role === "Faculty" ? {
            name: res.data.name,
            department: res.data.department,
            idNumber: val,
            course: "",
            yearLevel: "",
            role: res.data.role,
          } : {
            name: res.data.name,
            course: res.data.course,
            yearLevel: res.data.yearLevel,
            department: res.data.department,
            idNumber: val,
            role: res.data.role,
          };
          v[idx] = { status: "valid", message: "Verified ✓" };
        }

        setFormData({ ...formData, participants: updated });
        setValidation(v);
      } catch (err) {
        console.error("Validation error", err);
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
      updated.push({ name: "", course: "", yearLevel: "", department: "", idNumber: "", role: "" });
      v.push({ status: null, message: "" });
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

      if (p.role !== "Faculty" && p.role !== "Staff" && (!p.course || !p.yearLevel)) {
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
    const check = await axios.get(`http://localhost:5000/reservations/user-has-any/${user._id}`, {
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

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] flex flex-col">
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

      <header className=" text-black px-6 h-[60px] flex items-center justify-between shadow-sm">
  <h1 className="text-xl md:text-2xl font-bold tracking-wide">Room Reservation Request</h1>
</header>

      <div className="m-5 flex flex-col items-center">
        <div className="flex flex-wrap gap-6 w-full max-w-6xl">
          {/* Date Selector */}
          <div className="flex-1 min-w-[250px]">
            <p className="font-medium mb-1">Select Date</p>
            <div
              onClick={() => setShowDateModal(true)}
              className="w-full h-[40px] p-2 border rounded-[7px] border-gray-200 shadow-sm outline-none focus:border-[#CC0000] flex items-center cursor-pointer hover:bg-gray-50"
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
          <div className="flex-1 min-w-[250px]">
            <p className="font-medium mb-1">Time</p>
            <div
              onClick={() => setShowTimeModal(true)}
              className="w-full h-[40px] p-2 border rounded-[7px] border-gray-200 shadow-sm outline-none focus:border-[#CC0000] flex items-center cursor-pointer hover:bg-gray-50"
            >
              {formData.time ? formatDisplayTime(formData.time) : <span className="text-gray-400">Select Time</span>}
            </div>
          </div>

          {/* Number of Users Selector */}
          <div className="flex-1 min-w-[250px]">
            <p className="font-medium mb-1">Number of Users</p>
            <div
              onClick={() => setShowUsersModal(true)}
              className="w-full h-[40px] p-2 border rounded-[7px] border-gray-200 shadow-sm outline-none focus:border-[#CC0000] flex items-center cursor-pointer hover:bg-gray-50"
            >
              {formData.numUsers ? `${formData.numUsers} Users` : <span className="text-gray-400">Select Users</span>}
            </div>
          </div>
        </div>

        {/* Date Selection Modal */}
        {showDateModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-[350px]">
              <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={() => handleMonthChange(-1)}
                  className="p-2 rounded-full hover:bg-gray-100 font-bold cursor-pointer"
                >
                  &lt;
                </button>
                <h2 className="text-xl font-semibold">
                  {months[currentMonth]} {currentYear}
                </h2>
                <button 
                  onClick={() => handleMonthChange(1)}
                  className="p-2 rounded-full hover:bg-gray-100 font-bold cursor-pointer"
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
                        className={`w-10 h-10 rounded-full flex items-center justify-center
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
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-[350px] md:w-[600px] max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Select Time</h2>

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
                          className={`p-3 border border-gray-500 rounded-lg text-center cursor-pointer ${
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
                          className={`p-3 border border-gray-500 rounded-lg text-center cursor-pointer ${
                            formData.time === slot.value
                              ? "bg-[#CC0000] text-white"
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
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-[350px]">
              <h2 className="text-xl font-semibold mb-4">Number of Users</h2>
              <div className="grid grid-cols-1 gap-3 mb-4">
                {[4, 5, 6, 7, 8].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      handleNumUsersChange(num.toString());
                      setShowUsersModal(false);
                    }}
                    className={`p-4 border rounded-lg text-center cursor-pointer border-gray-500 ${
                      formData.numUsers === num.toString()
                        ? "bg-[#CC0000] text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {num} Users
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowUsersModal(false)}
                className="mt-4 bg-[#CC0000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition w-full cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Purpose */}
        <div className="my-4 w-full max-w-6xl">
          <p className="font-medium mb-1">Purpose</p>
          <input
            className="w-full h-[40px] p-2 border rounded-[7px] border-gray-200 shadow-sm outline-none focus:border-[#CC0000]"
            type="text"
            value={formData.purpose}
            onChange={(e) =>
              setFormData({ ...formData, purpose: e.target.value })
            }
            placeholder="Enter purpose of reservation"
          />
        </div>

        {/* Room Location */}
        <div className="flex flex-col items-center gap-5 w-full max-w-6xl">
          <p className="font-semibold font-sans text-lg">Room Location</p>
          <div className="flex flex-wrap gap-5 justify-center w-full">
            {roomLocations.map((loc) => {
              let imageSrc = null;
              if (loc === "Ground Floor") imageSrc = GroundFloorImg;
              // if (loc === "5th Floor") imageSrc = FifthFloorImg;

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
                  className={`border border-gray-200 shadow-sm rounded-2xl w-[200px] h-[200px] flex justify-center items-center cursor-pointer transition duration-200 overflow-hidden relative ${
                    formData.location === loc ? "border-red-600 opacity-100" : "opacity-40 hover:opacity-70"
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
                  <p className="absolute bottom-2 left-0 w-full text-center text-white text-lg font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    {loc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Room Selection */}
        <div className="flex flex-col items-center gap-5 mt-8 w-full max-w-6xl">
          <p className="font-semibold font-sans text-lg">Select Room</p>

          {formData.location ? (
            <div className="w-full px-5">
              <div className="flex flex-wrap flex-row gap-5 justify-center">
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
                    let roomImage = null;
                    // if (room.room === "Faculty Room") roomImage = FacultyRoomImg;
                    // if (room.room === "Collaboration Room") roomImage = Collab;

                    return (
                      <div
                        key={room._id}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            roomName: room.room,
                            room_Id: room._id,
                          }))
                        }
                        className={`border border-gray-200 shadow-sm rounded-2xl w-[300px] h-[300px] flex justify-center items-center cursor-pointer relative overflow-hidden ${
                          formData.room_Id === room._id
                            ? "bg-red-100 border-red-600 opacity-100"
                            : "hover:opacity-100 opacity-80"
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
                        <div className="absolute inset-0 bg-black/30 z-0"></div>
                        <p className="text-white text-xl font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] z-10">
                          {room.room}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 italic">Please select a floor location first</div>
          )}
        </div>

        <p className="font-semibold font-sans text-lg mt-6 w-full max-w-6xl">Participants</p>

        {/* Participants Table */}
        <div className="overflow-x-auto mt-6 w-full max-w-6xl">
          <table className="bg-white shadow rounded-xl overflow-hidden w-full">
            <thead className="bg-[#FFCC00]">
              <tr>
                <th className="py-3 px-4 text-left">ID Number</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Course</th>
                <th className="py-3 px-4 text-left">Year Level</th>
                <th className="py-3 px-4 text-left">Department</th>
              </tr>
            </thead>
            <tbody>
              {formData.participants.map((p, idx) => (
                <tr key={idx} className="even:bg-gray-50">
                  <td className="py-2 px-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="ID Number"
                        className={`w-full p-2 pr-10 rounded-lg outline-none border shadow-sm
                          ${
                            validation[idx]?.status === "valid"
                              ? "border-green-600"
                              : validation[idx]?.status === "invalid"
                              ? "border-red-600 focus:border-red-600"
                              : "border-gray-300 focus:border-red-600"
                          }`}
                        value={p.idNumber}
                        disabled={idx === 0}
                        onChange={(e) =>
                          handleParticipantChange(idx, "idNumber", e.target.value)
                        }
                      />
                      {validation[idx]?.status === "valid" && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-sm select-none pointer-events-none">
                          Verified ✓
                        </span>
                      )}
                      {validation[idx]?.status === "invalid" && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 text-sm whitespace-nowrap select-none pointer-events-none">
                          {validation[idx]?.message === "Duplicate ID Number"
                            ? "Duplicate ID Number !"
                            : "Not Verified !"}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      className="w-full p-2 border-gray-300 border focus:border-red-600 rounded-lg outline-none"
                      value={p.name}
                      disabled={idx === 0 || validation[idx].status === "valid"}
                      onChange={(e) =>
                        handleParticipantChange(idx, "name", e.target.value)
                      }
                    />
                  </td>
                  {!p.role || (p.role !== "Faculty" && p.role !== "Staff") ? (
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        placeholder="Course"
                        className="w-full p-2 border-gray-300 border focus:border-red-600 rounded-lg outline-none"
                        value={p.course}
                        disabled={idx === 0 || validation[idx].status === "valid"}
                        onChange={(e) =>
                          handleParticipantChange(idx, "course", e.target.value)
                        }
                      />
                    </td>
                  ) : (
                    <td className="py-2 px-4 text-gray-400 italic">N/A</td>
                  )}
                  {!p.role || (p.role !== "Faculty" && p.role !== "Staff") ? (
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        placeholder="Year Level"
                        className="w-full p-2 border-gray-300 border focus:border-red-600 rounded-lg outline-none"
                        value={p.yearLevel}
                        disabled={idx === 0 || validation[idx].status === "valid"}
                        onChange={(e) =>
                          handleParticipantChange(idx, "yearLevel", e.target.value)
                        }
                      />
                    </td>
                  ) : (
                    <td className="py-2 px-4 text-gray-400 italic">N/A</td>
                  )}
                  <td className="py-2 px-4">
                    <input
                      type="text"
                      placeholder="Department"
                      className="w-full p-2 border-gray-300 border focus:border-red-600 rounded-lg outline-none"
                      value={p.department}
                      disabled={idx === 0 || validation[idx].status === "valid"}
                      onChange={(e) =>
                        handleParticipantChange(idx, "department", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600 italic mt-3 w-full max-w-6xl">
          * Enter ID Number to auto-fill participant details. Verified fields
          will be locked.
        </p>

        <div className="w-full max-w-6xl mt-6">
          <h4 className="font-semibold text-md font-sans text-gray-800"><span className="text-red-700">* </span>Note</h4>
          <ul className="list-disc pl-5">
            <li className="text-sm text-gray-600 mb-1">
              The group will be notified fifteen (15) minutes before the usage is terminated. If there are no standing reservations for the next hour, the group may request a one-hour extension.
            </li>
            <li className="text-sm text-gray-600 mb-1">
              The Learning Resource Center reserves the right to cancel the reservation of any group that does not arrive within fifteen (15) minutes of the scheduled reservation time.
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-5 w-full max-w-6xl">
          <button
            onClick={submitReservation}
            type="button"
            disabled={loading}
            className={`bg-[#CC0000] text-white px-6 py-2 rounded-lg transition cursor-pointer ${
              loading ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700"
            }`}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 mr-2 inline-block text-white"
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
            ) : null}
            {loading ? "Submitting..." : "Submit Reservation"}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl max-w-sm w-full text-center">
            <h2 className="text-lg font-semibold mb-4">
              Reservation Submitted!
            </h2>
            <p className="text-gray-600 text-sm">
              Thank you for your request. A confirmation will be sent once it's reviewed.
            </p>
            <button
              onClick={closeSuccess}
              className="bg-[#CC0000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition cursor-pointer mt-6"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}

      {showNotVerifiedWarning && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full text-center border-t-5 border-[#CC0000]">
            <h2 className="text-xl font-semibold text-red-600 mb-3">
              Not Verified Account
            </h2>
            <p className="text-gray-700 mb-4">
              Your account is not verified. You may fill out the form, but you cannot submit a reservation until verification is completed.
            </p>
            <button
              onClick={() => setShowNotVerifiedWarning(false)}
              className="bg-[#CC0000] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition cursor-pointer"
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