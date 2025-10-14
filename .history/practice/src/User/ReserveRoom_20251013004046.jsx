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
    idNumber: "",
    participants: Array.from({ length: 4 }, () => ({
      name: "",
      course: "",
      year_level: "",
      department: "",
      id_number: "",
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [restrictedFloors, setRestrictedFloors] = useState([]);

  // Check if user is from College of Law
  const isCollegeOfLawUser = () => {
    return user?.department === "COL";
  };

  // Check if user is a graduate student (Master's/Doctoral)
  const isGraduateStudent = () => {
    if (!user?.course) return false;
    
    const graduateKeywords = ["Master", "Doctor", "MBA", "MPA", "MAGC", "MARS", "MAED"];
    return graduateKeywords.some(keyword => user.course.includes(keyword));
  };

  // Determine available floors based on user type
  const getAvailableFloors = () => {
    const allFloors = ["Ground Floor", "2nd Floor", "4th Floor", "5th Floor"];
    
    if (isCollegeOfLawUser()) {
      return ["2nd Floor"]; // COL users can only access 2nd Floor
    } else if (isGraduateStudent()) {
      return ["Ground Floor"]; // Graduate students can only access Ground Floor
    } else {
      // Regular users can access all floors except restricted ones
      return allFloors.filter(floor => floor !== "2nd Floor" && floor !== "Ground Floor");
    }
  };

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
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        id_number: user.id_number || "",
        role: user.role || "",
      };

      const v = [...validation];
      v[0] = user.verified 
        ? { status: "valid", message: "Verified ✓", loading: false } 
        : { status: "invalid", message: "Not Verified", loading: false };

      setFormData(prev => ({ ...prev, participants: updated }));
      setValidation(v);

      // Set restricted floors based on user type
      const availableFloors = getAvailableFloors();
      const allFloors = ["Ground Floor", "2nd Floor", "4th Floor", "5th Floor"];
      const restricted = allFloors.filter(floor => !availableFloors.includes(floor));
      setRestrictedFloors(restricted);
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

    if (field === "id_number" && val.trim()) {
      const isDuplicate = formData.participants.some(
        (p, i) => i !== idx && p.id_number === val
      );

      const v = [...validation];

      if (isDuplicate) {
        v[idx] = { status: "invalid", message: "Duplicate ID Number", loading: false };
        setValidation(v);
        updated[idx].id_number = val;
        setFormData({ ...formData, participants: updated });
        return;
      }

      // Set loading state
      v[idx] = { ...v[idx], loading: true };
      setValidation(v);

      try {
        const res = await axios.get(
          `http://localhost:5000/api/users/check-participant?id_number=${val}`
        );

        if (!res.data.exists) {
          v[idx] = { status: "invalid", message: "Not registered", loading: false };
          updated[idx] = { ...updated[idx], name: "", course: "", year_level: "", department: "", id_number: val, role: "" };
        } else if (!res.data.verified) {
          v[idx] = { status: "invalid", message: "Not verified", loading: false };
          updated[idx] = { ...updated[idx], name: "", course: "", year_level: "", department: "", id_number: val, role: "" };
        } else {
          updated[idx] = {
            ...updated[idx],
            name: res.data.name,
            course: res.data.course || "",
            year_level: res.data.year_level || "",
            department: res.data.department || "",
            id_number: val,
            role: res.data.role || "",
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
      updated[idx][field] = val;
      setFormData({ ...formData, participants: updated });
    }
  };

  const handleNumUsersChange = (val) => {
    const n = parseInt(val, 10);
    const updated = [...formData.participants];
    const v = [...validation];
    
    while (updated.length < n) {
      updated.push({ name: "", course: "", year_level: "", department: "", id_number: "", role: "" });
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

    // Check if user is trying to access restricted floor
    const availableFloors = getAvailableFloors();
    if (!availableFloors.includes(formData.location)) {
      if (isCollegeOfLawUser()) {
        alert("College of Law students can only reserve rooms on the 2nd Floor.");
      } else if (isGraduateStudent()) {
        alert("Graduate students can only reserve rooms on the Ground Floor.");
      } else {
        alert("This floor is restricted for your user type.");
      }
      return false;
    }

    for (let i = 0; i < formData.participants.length; i++) {
      const p = formData.participants[i];
      if (!p.name || !p.department || !p.id_number) {
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
      setShowNotVerifiedWarning(true);
      alert("You cannot reserve a room until your account is verified.");
      return;
    }

    if (!validateForm()) return;

    try {
      const check = await axios.get(`http://localhost:5000/reservations/check-limit/${user._id}`, {
        params: {
          date: formData.date,
          time: formData.time,
          asMain: true
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
      const manilaTime = moment.tz(
        `${formData.date}T${formData.time}`,
        "YYYY-MM-DDTHH:mm",
        "Asia/Manila"
      );

      const endManilaTime = manilaTime.clone().add(1, 'hour');

      const reservationData = {
        userId: user._id,
        room_Id: formData.room_Id,
        roomName: formData.roomName,
        location: formData.location,
        datetime: manilaTime.format(),
        datetimeUTC: manilaTime.utc().format(),
        date: formData.date,
        time: formData.time,
        endDatetime: endManilaTime.format(),
        endDatetimeUTC: endManilaTime.utc().format(),
        numUsers: formData.numUsers,
        purpose: formData.purpose,
        participants: formData.participants,
        timezone: "Asia/Manila",
        status: "Pending"
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

  const roomLocations = getAvailableFloors();
  
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
    return GroundFloorImg;
  };

  const RoomFeatureIcon = ({ feature, enabled }) => {
    const icons = {
      wifi: "📶",
      aircon: "❄️",
      projector: "📽️",
      monitor: "🖥️"
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

  // Mobile Participant Card Component
  const MobileParticipantCard = ({ participant, index, validation }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-800">Participant {index + 1}</h3>
        {index === 0 && (
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
            Main Reserver
          </span>
        )}
      </div>

      <div className="space-y-3">
        {/* ID Number */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">ID Number</label>
          <div className="relative">
            <input
              type="text"
              placeholder="ID Number"
              className={`w-full p-2 rounded-lg outline-none border shadow-sm transition-colors text-sm
                ${
                  validation?.status === "valid"
                    ? "border-green-500 bg-green-50"
                    : validation?.status === "invalid"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 focus:border-[#CC0000]"
                }`}
              value={participant.id_number}
              disabled={index === 0}
              onChange={(e) =>
                handleParticipantChange(index, "id_number", e.target.value)
              }
            />
            {validation?.loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="animate-spin h-4 w-4 text-gray-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 01-8-8z"></path>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#CC0000] transition-colors text-sm"
            value={participant.name}
            disabled={index === 0 || validation.status === "valid"}
            onChange={(e) =>
              handleParticipantChange(index, "name", e.target.value)
            }
          />
        </div>

        {/* Course and Year Level - Conditionally Rendered */}
        {(!participant.role || (participant.role !== "Faculty" && participant.role !== "Staff")) && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Course</label>
                <input
                  type="text"
                  placeholder="Course"
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#CC0000] transition-colors text-sm"
                  value={participant.course}
                  disabled={index === 0 || validation.status === "valid"}
                  onChange={(e) =>
                    handleParticipantChange(index, "course", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Year Level</label>
                <input
                  type="text"
                  placeholder="Year Level"
                  className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#CC0000] transition-colors text-sm"
                  value={participant.year_level}
                  disabled={index === 0 || validation.status === "valid"}
                  onChange={(e) =>
                    handleParticipantChange(index, "year_level", e.target.value)
                  }
                />
              </div>
            </div>
          </>
        )}

        {/* Department */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
          <input
            type="text"
            placeholder="Department"
            className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#CC0000] transition-colors text-sm"
            value={participant.department}
            disabled={index === 0 || validation.status === "valid"}
            onChange={(e) =>
              handleParticipantChange(index, "department", e.target.value)
            }
          />
        </div>

        {/* Status */}
        <div className="pt-2 border-t border-gray-100">
          {validation?.status === "valid" && (
            <span className="text-green-600 text-sm font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified
            </span>
          )}
          {validation?.status === "invalid" && (
            <span className="text-red-600 text-sm font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {validation?.message}
            </span>
          )}
          {!validation?.status && participant.id_number && (
            <span className="text-gray-500 text-sm">Enter ID to verify</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <main className="w-full md:ml-[250px] md:w-[calc(100%-250px)] flex flex-col bg-gray-50 min-h-screen">
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

      <header className="text-black px-4 sm:px-6 h-[60px] flex items-center justify-between shadow-sm bg-white">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-wide">Room Reservation Request</h1>
        <button 
          onClick={() => setView("dashboard")}
          className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 flex items-center cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </button>
      </header>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* User Type Notice */}
        {(isCollegeOfLawUser() || isGraduateStudent()) && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p className="text-blue-800 font-medium text-sm">
                {isCollegeOfLawUser() 
                  ? "College of Law Access: You can only reserve rooms on the 2nd Floor."
                  : "Graduate Student Access: You can only reserve rooms on the Ground Floor."}
              </p>
            </div>
          </div>
        )}

        {/* Form Controls */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-100">Reservation Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* Date Selector */}
            <div className="space-y-1">
              <p className="font-medium text-gray-700 flex items-center text-sm sm:text-base">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Select Date
              </p>
              <div
                onClick={() => setShowDateModal(true)}
                className="w-full p-2 sm:p-3 border rounded-lg border-gray-300 shadow-sm outline-none focus:border-[#CC0000] flex items-center cursor-pointer hover:bg-gray-50 transition-colors text-sm sm:text-base"
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
              <p className="font-medium text-gray-700 flex items-center text-sm sm:text-base">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Time
              </p>
              <div
                onClick={() => setShowTimeModal(true)}
                className="w-full p-2 sm:p-3 border rounded-lg border-gray-300 shadow-sm outline-none focus:border-[#CC0000] flex items-center cursor-pointer hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                {formData.time ? formatDisplayTime(formData.time) : <span className="text-gray-400">Select Time</span>}
              </div>
            </div>

            {/* Number of Users Selector */}
            <div className="space-y-1">
              <p className="font-medium text-gray-700 flex items-center text-sm sm:text-base">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Number of Users
              </p>
              <div
                onClick={() => setShowUsersModal(true)}
                className="w-full p-2 sm:p-3 border rounded-lg border-gray-300 shadow-sm outline-none focus:border-[#CC0000] flex items-center cursor-pointer hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                {formData.numUsers ? `${formData.numUsers} Users` : <span className="text-gray-400">Select Users</span>}
              </div>
            </div>
          </div>

          {/* Purpose */}
          <div className="mt-3 sm:mt-4">
            <p className="font-medium text-gray-700 flex items-center text-sm sm:text-base">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Purpose
            </p>
            <input
              className="w-full p-2 sm:p-3 mt-1 border rounded-lg border-gray-300 shadow-sm outline-none focus:border-[#CC0000] text-sm sm:text-base"
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
          <div className="fixed top-0 left-0 w-screen h-screen bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-4 sm:p-6 rounded-xl w-full max-w-[350px] shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={() => handleMonthChange(-1)}
                  className="p-2 rounded-full hover:bg-gray-100 font-bold cursor-pointer transition-colors"
                >
                  &lt;
                </button>
                <h2 className="text-lg sm:text-xl font-semibold">
                  {months[currentMonth]} {currentYear}
                </h2>
                <button 
                  onClick={() => handleMonthChange(1)}
                  className="p-2 rounded-full hover:bg-gray-100 font-bold cursor-pointer transition-colors"
                >
                  &gt;
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                  <div key={idx} className="text-center text-xs font-medium text-gray-500 py-1">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((dayData, idx) => {
                  if (!dayData) return <div key={idx}></div>;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (!dayData.disabled) {
                          setFormData({ ...formData, date: dayData.date });
                          setShowDateModal(false);
                        }
                      }}
                      disabled={dayData.disabled}
                      className={`h-8 sm:h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors
                        ${dayData.disabled
                          ? "text-gray-300 cursor-not-allowed"
                          : formData.date === dayData.date
                          ? "bg-[#CC0000] text-white"
                          : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      {dayData.day}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowDateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Time Selection Modal */}
        {showTimeModal && (
          <div className="fixed top-0 left-0 w-screen h-screen bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-4 sm:p-6 rounded-xl w-full max-w-[350px] shadow-xl">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Select Time</h2>
              <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.value}
                    onClick={() => {
                      setFormData({ ...formData, time: slot.value });
                      setShowTimeModal(false);
                    }}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors
                      ${formData.time === slot.value
                        ? "bg-[#CC0000] text-white border-[#CC0000]"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    {slot.display}
                  </button>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowTimeModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Number of Users Modal */}
        {showUsersModal && (
          <div className="fixed top-0 left-0 w-screen h-screen bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-4 sm:p-6 rounded-xl w-full max-w-[350px] shadow-xl">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Number of Users</h2>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumUsersChange(num.toString())}
                    className={`p-4 rounded-lg border text-sm font-medium transition-colors
                      ${formData.numUsers === num.toString()
                        ? "bg-[#CC0000] text-white border-[#CC0000]"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                  >
                    {num} {num === 1 ? 'User' : 'Users'}
                  </button>
                ))}
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowUsersModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Location and Room Selection */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-100">Room Selection</h2>
          
          {/* Location Selection */}
          <div className="mb-4 sm:mb-6">
            <p className="font-medium text-gray-700 mb-2 text-sm sm:text-base">Select Location</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {roomLocations.map((location) => (
                <button
                  key={location}
                  onClick={() => setFormData({ ...formData, location })}
                  className={`p-2 sm:p-3 rounded-lg border text-sm font-medium transition-colors
                    ${formData.location === location
                      ? "bg-[#CC0000] text-white border-[#CC0000]"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {location}
                </button>
              ))}
            </div>
          </div>

          {/* Room Selection */}
          {formData.location && (
            <div>
              <p className="font-medium text-gray-700 mb-2 text-sm sm:text-base">Select Room</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {groupedRooms[formData.location]?.map((room) => (
                  <div
                    key={room._id}
                    onClick={() => handleRoomSelect(room)}
                    className={`border rounded-xl p-3 sm:p-4 cursor-pointer transition-all hover:shadow-md ${
                      formData.roomName === room.room
                        ? "border-[#CC0000] bg-red-50 shadow-sm"
                        : room.isActive
                        ? "border-gray-200 hover:border-gray-300 bg-white"
                        : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      <div className="w-full sm:w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        <img
                          src={getRoomImage(room)}
                          alt={room.room}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h3 className={`font-semibold text-sm sm:text-base ${
                            room.isActive ? "text-gray-900" : "text-gray-500"
                          }`}>
                            {room.room}
                          </h3>
                          {!room.isActive && (
                            <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                              Unavailable
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{room.floor}</p>
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{room.description}</p>
                        
                        {/* Room Features */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          <RoomFeatureIcon feature="wifi" enabled={room.wifi} />
                          <RoomFeatureIcon feature="aircon" enabled={room.aircon} />
                          <RoomFeatureIcon feature="projector" enabled={room.projector} />
                          <RoomFeatureIcon feature="monitor" enabled={room.monitor} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Participants Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-100">Participants</h2>
          
          {isMobile ? (
            // Mobile View - Cards
            <div className="space-y-3">
              {formData.participants.map((participant, index) => (
                <MobileParticipantCard
                  key={index}
                  participant={participant}
                  index={index}
                  validation={validation[index]}
                />
              ))}
            </div>
          ) : (
            // Desktop View - Table
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-medium text-gray-700 text-sm">ID Number</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700 text-sm">Full Name</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700 text-sm">Course</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700 text-sm">Year Level</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700 text-sm">Department</th>
                    <th className="text-left py-3 px-2 font-medium text-gray-700 text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.participants.map((participant, index) => (
                    <tr key={index} className="border-b border-gray-100 last:border-b-0">
                      <td className="py-3 px-2">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="ID Number"
                            className={`w-full p-2 rounded-lg outline-none border shadow-sm transition-colors text-sm
                              ${
                                validation[index]?.status === "valid"
                                  ? "border-green-500 bg-green-50"
                                  : validation[index]?.status === "invalid"
                                  ? "border-red-500 bg-red-50"
                                  : "border-gray-300 focus:border-[#CC0000]"
                              }`}
                            value={participant.id_number}
                            disabled={index === 0}
                            onChange={(e) =>
                              handleParticipantChange(index, "id_number", e.target.value)
                            }
                          />
                          {validation[index]?.loading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <svg className="animate-spin h-4 w-4 text-gray-500" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 01-8-8z"></path>
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="text"
                          placeholder="Full Name"
                          className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#CC0000] transition-colors text-sm"
                          value={participant.name}
                          disabled={index === 0 || validation[index].status === "valid"}
                          onChange={(e) =>
                            handleParticipantChange(index, "name", e.target.value)
                          }
                        />
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="text"
                          placeholder="Course"
                          className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#CC0000] transition-colors text-sm"
                          value={participant.course}
                          disabled={index === 0 || validation[index].status === "valid"}
                          onChange={(e) =>
                            handleParticipantChange(index, "course", e.target.value)
                          }
                        />
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="text"
                          placeholder="Year Level"
                          className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#CC0000] transition-colors text-sm"
                          value={participant.year_level}
                          disabled={index === 0 || validation[index].status === "valid"}
                          onChange={(e) =>
                            handleParticipantChange(index, "year_level", e.target.value)
                          }
                        />
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="text"
                          placeholder="Department"
                          className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#CC0000] transition-colors text-sm"
                          value={participant.department}
                          disabled={index === 0 || validation[index].status === "valid"}
                          onChange={(e) =>
                            handleParticipantChange(index, "department", e.target.value)
                          }
                        />
                      </td>
                      <td className="py-3 px-2">
                        {validation[index]?.status === "valid" && (
                          <span className="text-green-600 text-sm font-medium">Verified ✓</span>
                        )}
                        {validation[index]?.status === "invalid" && (
                          <span className="text-red-600 text-sm font-medium">{validation[index]?.message}</span>
                        )}
                        {!validation[index]?.status && participant.id_number && (
                          <span className="text-gray-500 text-sm">Enter ID to verify</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={submitReservation}
            disabled={loading}
            className="bg-[#CC0000] hover:bg-red-800 text-white font-semibold py-3 px-6 sm:px-8 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {loading ? "Submitting..." : "Submit Reservation"}
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-xl w-full max-w-md shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Reservation Submitted!</h3>
              <p className="text-gray-600 mb-6">
                Your room reservation request has been submitted successfully and is pending approval.
              </p>
              <button
                onClick={closeSuccess}
                className="w-full bg-[#CC0000] hover:bg-red-800 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Not Verified Warning Modal */}
      {showNotVerifiedWarning && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-xl w-full max-w-md shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Account Not Verified</h3>
              <p className="text-gray-600 mb-4">
                Your account is currently not verified. You cannot make room reservations until your account has been verified by an administrator.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Please contact the administrator or wait for your verification to be processed.
              </p>
              <button
                onClick={() => setShowNotVerifiedWarning(false)}
                className="w-full bg-[#CC0000] hover:bg-red-800 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ReserveRoom;