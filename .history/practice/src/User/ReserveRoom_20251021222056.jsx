import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import socket from "../utils/socket";
import moment from "moment-timezone";

// Import shared room images configuration
import { availableRoomImages, getRoomImageById } from "../data/roomImages";

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
  
  // Alert modal state
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

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

  // Check if user can reserve a specific floor
  const canReserveFloor = (floor) => {
    // Ground Floor - Only for Graduate students
    if (floor === "Ground Floor") {
      return isGraduateStudent();
    }
    
    // 2nd Floor - Only for COL students
    if (floor === "2nd Floor") {
      return isCollegeOfLawUser();
    }
    
    // 4th and 5th Floors - Available for all students
    if (floor === "4th Floor" || floor === "5th Floor") {
      return true;
    }
    
    return false;
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
      const dateObj = new Date(year, month, i);
      const isSunday = dateObj.getDay() === 0; // 0 is Sunday
      const isPastDate = year < currentYear || 
                       (year === currentYear && month < currentMonth) || 
                       (year === currentYear && month === currentMonth && i < today);
      
      days.push({ 
        day: i, 
        date: dateStr, 
        disabled: isPastDate || isSunday,
        isSunday: isSunday
      });
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
    const res = await axios.get("http://localhost:5000/api/rooms");
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

  // Show alert modal function
  const showAlert = (message) => {
    setAlertMessage(message);
    setShowAlertModal(true);
  };

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

  // ✅ FIXED: Enhanced floor access validation function
  const validateParticipantFloorAccess = async () => {
    try {
      console.log('🔍 Starting floor access validation...');
      
      // Filter out empty participant IDs and get only the IDs
      const participantIds = formData.participants
        .map(p => p.id_number)
        .filter(id => id && id.toString().trim() !== "" && id !== user.id_number); // Exclude main user

      console.log('📋 Validation data:', {
        location: formData.location,
        participantIds: participantIds,
        totalParticipants: formData.participants.length
      });

      // If no additional participants besides main user, validation passes
      if (participantIds.length === 0) {
        console.log('✅ No additional participants to validate');
        return true;
      }

      console.log('🔄 Sending validation request to server...');
const response = await axios.post(
  "http://localhost:5000/api/reservations/validate-floor-access", 
        {
          location: formData.location,
          participantIds: participantIds
        },
        {
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Floor access validation response:', response.data);

      if (!response.data.valid) {
        const invalidNames = response.data.invalidParticipants.map(p => p.name || p.identifier).join(', ');
        const errorMessage = `The following participants don't have access to ${formData.location}: ${invalidNames}\n\n${response.data.restrictionMessage}`;
        
        showAlert(errorMessage);
        return false;
      }
      
      console.log('✅ All participants have floor access');
      return true;
    } catch (error) {
      console.error("❌ Floor access validation error:", error);
      
      let errorMsg = "Error validating participant access. Please try again.";
      
      if (error.response) {
        // Server responded with error status
        console.error("Server response error:", error.response.data);
        errorMsg = error.response.data.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response received
        console.error("No response received:", error.request);
        errorMsg = "No response from server. Please check your connection.";
      } else {
        // Something else happened
        console.error("Error message:", error.message);
        errorMsg = error.message;
      }
      
      showAlert(`Floor access validation failed: ${errorMsg}`);
      return false;
    }
  };

  const validateForm = () => {
    if (!formData.date || !formData.time || !formData.location || !formData.roomName || !formData.purpose) {
      showAlert("Please complete all required fields.");
      return false;
    }

    // Check if selected room is disabled
    const selectedRoom = rooms.find(room => room._id === formData.room_Id);
    if (selectedRoom && !selectedRoom.isActive) {
      showAlert("This room is currently unavailable. Please select another room.");
      return false;
    }

    // Check if selected date/time is in the past
    const now = new Date();
    const selectedDate = new Date(`${formData.date}T${formData.time}`);
    if (selectedDate < now) {
      showAlert("You cannot reserve a room in the past. Please select a future date and time.");
      return false;
    }

    // Check if user can reserve the selected floor
    if (!canReserveFloor(formData.location)) {
      if (formData.location === "Ground Floor") {
        showAlert("Ground Floor is reserved for Graduate students only.");
      } else if (formData.location === "2nd Floor") {
        showAlert("2nd Floor is reserved for College of Law students only.");
      } else {
        showAlert("You don't have access to this floor.");
      }
      return false;
    }

    for (let i = 0; i < formData.participants.length; i++) {
      const p = formData.participants[i];
      if (!p.name || !p.department || !p.id_number) {
        showAlert(`Please complete all fields for participant ${i + 1}.`);
        return false;
      }

      if (p.role !== "Faculty" && p.role !== "Staff" && (!p.course || !p.year_level)) {
        showAlert(`Please complete all fields for participant ${i + 1}.`);
        return false;
      }

      if (validation[i].status !== "valid") {
        showAlert(`Participant ${i + 1} is not verified or registered.`);
        return false;
      }
    }
    return true;
  };

  const submitReservation = async () => {
    if (!user.verified) {
      setShowNotVerifiedWarning(true);
      showAlert("You cannot reserve a room until your account is verified.");
      return;
    }

    if (!validateForm()) return;

    // ✅ FIXED: Enhanced floor access validation with better error handling
    console.log('🔄 Starting floor access validation before submission...');
    const allParticipantsHaveAccess = await validateParticipantFloorAccess();
    if (!allParticipantsHaveAccess) {
      console.log('❌ Floor access validation failed - stopping submission');
      return; // Stop submission if participants don't have access
    }
    console.log('✅ All participants have floor access - proceeding with submission');

    try {
const check = await axios.get(`http://localhost:5000/api/reservations/check-limit/${user._id}`, {
        params: {
          date: formData.date,
          time: formData.time,
          asMain: true
        }
      });

      if (check.data.blocked) {
        showAlert(check.data.reason || "You have reached your reservation limit for this week.");
        return;
      }
    } catch (err) {
      console.error("Limit check failed", err);
      const message = err.response?.data?.message || "Failed to verify reservation limit.";
      showAlert(message);
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

await axios.post("http://localhost:5000/api/reservations", reservationData);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Reservation failed:", error);
      showAlert(`Reservation failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const closeSuccess = () => {
    setShowSuccessModal(false);
    navigate("/dashboard");
  };

  const roomLocations = ["Ground Floor", "2nd Floor", "4th Floor", "5th Floor"];
  
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
      showAlert("This room is currently unavailable. Please select another room.");
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      roomName: room.room,
      room_Id: room._id,
    }));
    setSelectedRoomDetails(room);
  };

  // CORRECTED: Updated getRoomImage function to use exact image from room data
  const getRoomImage = (room) => {
    // If room has an image object (from AdminRooms), use it directly
    if (room.image && room.image.url) {
      return room.image.url;
    }
    
    // Fallback to default images based on floor for rooms without specific images
    const floorImages = {
      "Ground Floor": getRoomImageById("ground_floor")?.url,
      "5th Floor": getRoomImageById("fifth_floor")?.url,
    };
    
    return floorImages[room.floor] || getRoomImageById("ground_floor")?.url;
  };

  const RoomFeatureIcon = ({ feature, enabled }) => {
    const icons = {
      wifi: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      ),
      aircon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      projector: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      monitor: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    };

    return (
      <span 
        className={`text-xs px-2 py-1 rounded-full flex items-center justify-center gap-1 ${
          enabled 
            ? "bg-blue-100 text-blue-700 border border-blue-200" 
            : "bg-gray-100 text-gray-400 border border-gray-200"
        }`}
        title={feature}
      >
        {icons[feature] || feature}
        <span className="capitalize">{feature}</span>
      </span>
    );
  };

  // Get floor images from shared configuration
  const getFloorImage = (floor) => {
    const floorImageMap = {
      "Ground Floor": getRoomImageById("ground_floor")?.url,
      "2nd Floor": getRoomImageById("fifth_floor")?.url,
      "4th Floor": getRoomImageById("fifth_floor")?.url,
      "5th Floor": getRoomImageById("fifth_floor")?.url,
    };
    
    return floorImageMap[floor] || getRoomImageById("ground_floor")?.url;
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
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-blue-800 font-medium text-sm">
              {isCollegeOfLawUser() 
                ? "College of Law Access: You can reserve 2nd Floor rooms and all general floors."
                : isGraduateStudent()
                ? "Graduate Student Access: You can reserve Ground Floor rooms and all general floors."
                : "Regular Student Access: You can reserve rooms on the 4th and 5th floors only."}
            </p>
          </div>
        </div>

        {/* Form Controls */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-100">Reservation Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
              <button
                onClick={() => setShowDateModal(true)}
                className="w-full p-3 border border-gray-300 rounded-lg text-left bg-white hover:bg-gray-50 transition-colors shadow-sm"
              >
                {formData.date ? (
                  <span className="text-gray-900 font-medium">
                    {new Date(formData.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                ) : (
                  <span className="text-gray-500">Select a date</span>
                )}
              </button>
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
              <button
                onClick={() => setShowTimeModal(true)}
                className="w-full p-3 border border-gray-300 rounded-lg text-left bg-white hover:bg-gray-50 transition-colors shadow-sm"
              >
                {formData.time ? (
                  <span className="text-gray-900 font-medium">{formatDisplayTime(formData.time)}</span>
                ) : (
                  <span className="text-gray-500">Select a time</span>
                )}
              </button>
            </div>

            {/* Number of Users */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Number of Users</label>
              <button
                onClick={() => setShowUsersModal(true)}
                className="w-full p-3 border border-gray-300 rounded-lg text-left bg-white hover:bg-gray-50 transition-colors shadow-sm"
              >
                <span className="text-gray-900 font-medium">{formData.numUsers} users</span>
              </button>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Purpose</label>
              <input
                type="text"
                placeholder="Enter purpose of reservation"
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-[#CC0000] transition-colors shadow-sm"
                value={formData.purpose}
                onChange={(e) =>
                  setFormData({ ...formData, purpose: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Location and Room Selection */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-100">Select Location & Room</h2>
          
          {/* Location Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Floor</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {roomLocations.map((location) => (
                <button
                  key={location}
                  onClick={() => {
                    if (!canReserveFloor(location)) {
                      if (location === "Ground Floor") {
                        showAlert("Ground Floor is reserved for Graduate students only.");
                      } else if (location === "2nd Floor") {
                        showAlert("2nd Floor is reserved for College of Law students only.");
                      } else {
                        showAlert("You don't have access to this floor.");
                      }
                      return;
                    }
                    setFormData({ ...formData, location, roomName: "", room_Id: "" });
                    setSelectedRoomDetails(null);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 shadow-sm ${
                    formData.location === location
                      ? "border-[#CC0000] bg-red-50"
                      : canReserveFloor(location)
                      ? "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                      : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                  }`}
                  disabled={!canReserveFloor(location)}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${
                      formData.location === location ? "text-[#CC0000]" : "text-gray-700"
                    }`}>
                      {location}
                    </span>
                    {!canReserveFloor(location) && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  {location === "Ground Floor" && (
                    <p className="text-xs text-gray-500 mt-1 text-left">Graduate Students Only</p>
                  )}
                  {location === "2nd Floor" && (
                    <p className="text-xs text-gray-500 mt-1 text-left">College of Law Only</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Room Selection */}
          {formData.location && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Available Rooms on {formData.location}
                {selectedRoomDetails && (
                  <span className="text-green-600 ml-2 font-normal">
                    ✓ {selectedRoomDetails.room} selected
                  </span>
                )}
              </label>
              
              {groupedRooms[formData.location]?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedRooms[formData.location].map((room) => (
                    <div
                      key={room._id}
                      onClick={() => handleRoomSelect(room)}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 shadow-sm ${
                        formData.room_Id === room._id
                          ? "border-[#CC0000] bg-red-50"
                          : room.isActive
                          ? "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                          : "border-gray-100 bg-gray-100 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className={`font-semibold ${
                            formData.room_Id === room._id ? "text-[#CC0000]" : "text-gray-800"
                          }`}>
                            {room.room}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">Capacity: {room.capacity} people</p>
                        </div>
                        {!room.isActive && (
                          <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                            Unavailable
                          </span>
                        )}
                      </div>

                      {/* Room Features */}
                      {room.features && Object.keys(room.features).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {Object.entries(room.features).map(([feature, enabled]) => (
                            <RoomFeatureIcon 
                              key={feature} 
                              feature={feature} 
                              enabled={enabled} 
                            />
                          ))}
                        </div>
                      )}

                      {/* Room Image */}
                      {room.image?.url && (
                        <div className="mt-3">
                          <img
                            src={room.image.url}
                            alt={room.room}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500">No rooms available on this floor.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Participants Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">Participants</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {formData.participants.filter(p => p.id_number).length} of {formData.numUsers} verified
            </span>
          </div>

          {isMobile ? (
            // Mobile View - Stacked Cards
            <div className="space-y-4">
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
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Number</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year Level</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.participants.map((participant, index) => (
                    <tr key={index} className={index === 0 ? "bg-blue-50" : ""}>
                      <td className="px-4 py-3 whitespace-nowrap">
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
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="text"
                          placeholder="Full Name"
                          className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#CC0000] transition-colors text-sm"
                          value={participant.name}
                          disabled={index === 0 || validation[index]?.status === "valid"}
                          onChange={(e) =>
                            handleParticipantChange(index, "name", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="text"
                          placeholder="Course"
                          className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#CC0000] transition-colors text-sm"
                          value={participant.course}
                          disabled={index === 0 || validation[index]?.status === "valid"}
                          onChange={(e) =>
                            handleParticipantChange(index, "course", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="text"
                          placeholder="Year Level"
                          className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#CC0000] transition-colors text-sm"
                          value={participant.year_level}
                          disabled={index === 0 || validation[index]?.status === "valid"}
                          onChange={(e) =>
                            handleParticipantChange(index, "year_level", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="text"
                          placeholder="Department"
                          className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-[#CC0000] transition-colors text-sm"
                          value={participant.department}
                          disabled={index === 0 || validation[index]?.status === "valid"}
                          onChange={(e) =>
                            handleParticipantChange(index, "department", e.target.value)
                          }
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {validation[index]?.status === "valid" && (
                          <span className="text-green-600 text-sm font-medium flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Verified
                          </span>
                        )}
                        {validation[index]?.status === "invalid" && (
                          <span className="text-red-600 text-sm font-medium flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {validation[index]?.message}
                          </span>
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
        <div className="flex justify-end pt-4">
          <button
            onClick={submitReservation}
            disabled={loading}
            className="bg-[#CC0000] hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 01-8-8z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              "Submit Reservation"
            )}
          </button>
        </div>
      </div>

      {/* Date Selection Modal */}
      {showDateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Select Date</h3>
                <button
                  onClick={() => setShowDateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => handleMonthChange(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <h4 className="text-lg font-semibold text-gray-800">
                  {months[currentMonth]} {currentYear}
                </h4>
                
                <button
                  onClick={() => handleMonthChange(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="mb-4">
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className={`text-center text-sm font-medium py-2 ${
                      day === 'Sun' ? 'text-red-500' : 'text-gray-600'
                    }`}>
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((dayData, index) => (
                    <div key={index} className="text-center">
                      {dayData ? (
                        <button
                          onClick={() => {
                            if (!dayData.disabled) {
                              setFormData({ ...formData, date: dayData.date });
                              setShowDateModal(false);
                            }
                          }}
                          disabled={dayData.disabled}
                          className={`w-12 h-12 rounded-xl text-base font-medium transition-all duration-200 flex items-center justify-center mx-auto ${
                            dayData.disabled
                              ? dayData.isSunday
                                ? 'text-red-300 bg-red-50 cursor-not-allowed'
                                : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                              : formData.date === dayData.date
                              ? 'bg-[#CC0000] text-white shadow-md'
                              : dayData.isSunday
                              ? 'text-red-500 hover:bg-red-50'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {dayData.day}
                        </button>
                      ) : (
                        <div className="w-12 h-12"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-[#CC0000] rounded"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
                  <span className="text-red-400">Sunday</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-100 rounded"></div>
                  <span>Unavailable</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Selection Modal */}
      {showTimeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Select Time</h3>
                <button
                  onClick={() => setShowTimeModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.value}
                    onClick={() => {
                      setFormData({ ...formData, time: slot.value });
                      setShowTimeModal(false);
                    }}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      formData.time === slot.value
                        ? "border-[#CC0000] bg-red-50 text-[#CC0000] font-semibold"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md text-gray-700"
                    }`}
                  >
                    <span className="text-sm font-medium">{slot.display}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Number of Users Modal */}
      {showUsersModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Number of Users</h3>
                <button
                  onClick={() => setShowUsersModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleNumUsersChange(num.toString())}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      formData.numUsers === num.toString()
                        ? "border-[#CC0000] bg-red-50 text-[#CC0000] font-semibold"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md text-gray-700"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{num} user{num !== 1 ? 's' : ''}</span>
                      {formData.numUsers === num.toString() && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Reservation Submitted!</h3>
              <p className="text-gray-600 mb-6">
                Your room reservation request has been submitted successfully and is pending approval.
              </p>
              <button
                onClick={closeSuccess}
                className="w-full bg-[#CC0000] hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-200"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Attention Required</h3>
              <p className="text-gray-600 mb-6 whitespace-pre-line">{alertMessage}</p>
              <button
                onClick={() => setShowAlertModal(false)}
                className="w-full bg-[#CC0000] hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-200"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Not Verified Warning Modal */}
      {showNotVerifiedWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Account Not Verified</h3>
              <p className="text-gray-600 mb-6">
                Your account is not yet verified. You cannot reserve a room until your account has been verified by an administrator.
              </p>
              <button
                onClick={() => setShowNotVerifiedWarning(false)}
                className="w-full bg-[#CC0000] hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-200"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default ReserveRoom;