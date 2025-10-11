import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import Logo from "../assets/logo.png";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  MessageSquare,
  Bell,
  User,
  LogOut,
  FileText,
} from "lucide-react";

const socket = io("http://localhost:5000");

function StaffNavigation({ staff, setView, currentView, onLogout }) {
  const [unreadCounts, setUnreadCounts] = useState({
    notifications: 0,
    messages: 0,
    reports: 0,
    reservations: 0
  });
  const [loading, setLoading] = useState(false);

  // 🔊 Improved notification sound handling
  const messageSound = useRef(null);
  
  useEffect(() => {
    // Create audio element only when needed and hide it
    messageSound.current = new Audio("/ringtone_message.wav");
    messageSound.current.volume = 0.75;
    
    // Hide audio element from accessibility and visual display
    if (messageSound.current) {
      messageSound.current.style.display = 'none';
      messageSound.current.setAttribute('aria-hidden', 'true');
      messageSound.current.controls = false;
    }
    
    return () => {
      // Cleanup
      if (messageSound.current) {
        messageSound.current.pause();
        messageSound.current = null;
      }
    };
  }, []);

  // Fetch unread counts for all navigation items
  const fetchUnreadCounts = async () => {
    if (!staff?._id) return;
    
    try {
      setLoading(true);
      
      // Fetch notification unread count
      let notificationsCount = 0;
      try {
        const notificationsResponse = await axios.get(`http://localhost:5000/api/notifications/unread-count/${staff._id}`);
        notificationsCount = notificationsResponse.data.count || 0;
      } catch (error) {
        console.log("Notifications endpoint not available");
      }

      // Fetch messages unread count - USE STAFF TOTAL UNREAD COUNT
      let messagesCount = 0;
      try {
        const messagesResponse = await axios.get(`http://localhost:5000/api/messages/staff-total-unread/${staff._id}`);
        messagesCount = messagesResponse.data.count || 0;
      } catch (error) {
        console.log("Messages endpoint not available");
        // Fallback to regular unread count
        try {
          const fallbackResponse = await axios.get(`http://localhost:5000/api/messages/unread-count/${staff._id}`);
          messagesCount = fallbackResponse.data.count || 0;
        } catch (fallbackError) {
          console.log("Messages fallback endpoint not available");
        }
      }

      // Reports and Reservations - SET TO 0 (remove API calls that don't exist)
      const reportsCount = 0;
      const reservationsCount = 0;

      setUnreadCounts({
        notifications: notificationsCount,
        messages: messagesCount,
        reports: reportsCount,
        reservations: reservationsCount
      });

    } catch (error) {
      console.error("Failed to fetch unread counts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Play sound function with better error handling
  const playNotificationSound = () => {
    try {
      if (messageSound.current) {
        messageSound.current.currentTime = 0;
        messageSound.current.play().catch((error) => {
          // Silent fail - don't show errors to user
          console.log("Audio play failed (user gesture required):", error);
        });
      }
    } catch (error) {
      // Silent fail
      console.log("Audio error:", error);
    }
  };

  useEffect(() => {
    if (!staff?._id) return;

    // Join staff room for real-time updates
    socket.emit("join", { userId: staff._id });
    socket.emit("join", { userId: staff.floor });

    // Fetch initial counts
    fetchUnreadCounts();
    
    // Set up socket listeners for real-time updates
    const handleUnreadCountUpdate = (data) => {
      if (data.userId === staff._id) {
        // Update messages count in real-time
        setUnreadCounts(prev => ({
          ...prev,
          messages: data.count || 0
        }));
      }
    };

    const handleNewMessage = (msg) => {
      // If this message is relevant to staff, refresh counts
      if (msg.receiver === staff._id || msg.receiver === staff.floor || msg.sender === "admin") {
        fetchUnreadCounts();
        
        // 🔊 Play sound when receiving new messages while NOT on messages page
        if (currentView !== "staffMessages") {
          // Only play sound for messages not sent by current staff
          if (msg.sender !== staff._id) {
            playNotificationSound();
          }
        }
      }
    };

    // Listen for unread count updates
    socket.on("unreadCountUpdate", handleUnreadCountUpdate);
    socket.on("newMessage", handleNewMessage);
    
    // Set up interval to refresh counts every 60 seconds
    const interval = setInterval(fetchUnreadCounts, 60000);
    
    return () => {
      clearInterval(interval);
      socket.off("unreadCountUpdate", handleUnreadCountUpdate);
      socket.off("newMessage", handleNewMessage);
    };
  }, [staff?._id, currentView]);

  const navButtons = [
    { 
      id: "staffDashboard", 
      label: "Dashboard", 
      icon: <LayoutDashboard size={18} /> 
    },
    { 
      id: "staffReservation", 
      label: "Reservations", 
      icon: <CalendarDays size={18} />,
      badge: unreadCounts.reservations
    },
    { 
      id: "staffReports", 
      label: "Reports", 
      icon: <FileText size={18} />,
      badge: unreadCounts.reports
    },
    { 
      id: "staffUsers", 
      label: "Users", 
      icon: <Users size={18} /> 
    },
    { 
      id: "staffMessages", 
      label: "Messages", 
      icon: <MessageSquare size={18} />,
      badge: unreadCounts.messages
    },
    { 
      id: "staffNotification", 
      label: "Notifications", 
      icon: <Bell size={18} />, 
      badge: unreadCounts.notifications 
    },
    { 
      id: "staffProfile", 
      label: "Profile", 
      icon: <User size={18} /> 
    },
  ];

  // Handle navigation click
  const handleNavClick = (viewId) => {
    setView(viewId);
    // Refresh counts when navigating
    fetchUnreadCounts();
  };

  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  return (
    <aside>
      <div className="fixed top-0 left-0 h-screen w-[250px] bg-gray-900 p-6 flex flex-col border-r border-gray-700">
        {/* Logo */}
        <div className="flex items-center justify-between">
          <div className="relative">
            <img src={Logo} alt="Logo" className="h-[70px] w-[70px]" />
          </div>
          <h1 className="text-[19px] font-serif leading-5 text-white font-bold">
            University of <br /> San Agustin
          </h1>
        </div>

        {/* Border line */}
        <div className="border-b border-gray-700 w-[calc(100%+3rem)] -mx-6 my-2 mt-5" />

        {/* Staff Info */}
        <div className="flex flex-col items-center mt-5">
          <div className="relative">
            <div className="border-2 border-gray-600 w-[120px] h-[120px] rounded-full bg-gray-800 flex items-center justify-center text-5xl text-white font-bold">
              {staff?.name?.charAt(0) || "S"}
            </div>
            <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></div>
          </div>
          <h1 className="text-[20px] font-bold text-white mt-3 text-center">
            {staff?.name}
          </h1>
          <p className="text-gray-400 text-sm mt-1 text-center break-words px-2">
            {staff?.email}
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex flex-col h-full">
          <div className="flex flex-col gap-1 flex-grow">
            {navButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => handleNavClick(btn.id)}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-lg font-medium justify-start cursor-pointer transition-colors ${
                  currentView === btn.id
                    ? "bg-red-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <div>
                  {btn.icon}
                </div>
                <span className="font-semibold">{btn.label}</span>
                
                {/* Badge for unread counts */}
                {btn.badge > 0 && (
                  <span className={`absolute right-4 inline-flex items-center justify-center text-xs font-bold h-5 min-w-5 px-1 rounded-full ${
                    currentView === btn.id 
                      ? 'bg-white text-red-600' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {btn.badge > 99 ? '99+' : btn.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="mt-4 flex items-center gap-3 justify-center px-4 py-3 rounded-lg bg-red-600 font-semibold text-white hover:bg-red-700 cursor-pointer transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default StaffNavigation;