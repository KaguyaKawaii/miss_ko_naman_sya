import { useEffect, useState } from "react";
import socket from "../utils/socket";
import api from "../utils/api";
import Logo from "../assets/logo.png";
import {
  LayoutDashboard,
  History,
  Bell,
  MessageSquare,
  UserCircle,
  LogOut,
} from "lucide-react";

function Navigation_User({ user: initialUser, setView, currentView, onLogout }) {
  const [user, setUser] = useState(initialUser);
  const [imgTimestamp, setImgTimestamp] = useState(Date.now());
  const [unreadCounts, setUnreadCounts] = useState({
    notifications: 0,
    messages: 0
  });

  // Sync local user state with prop
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  // Fetch user data and unread counts
  const fetchData = async () => {
    try {
      // Fetch user data
      const { data: userData } = await api.get(`/users/${initialUser._id}`);
      setUser(userData.user ?? userData);
      setImgTimestamp(Date.now());

      // Fetch unread counts
      const { data: counts } = await api.get(`/users/${initialUser._id}/unread-counts`);
      setUnreadCounts({
        notifications: counts.notifications || 0,
        messages: counts.messages || 0
      });
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  // Initial data fetch and socket setup
  useEffect(() => {
    fetchData();

    // Socket event handlers
    const handleUserUpdate = (updatedId) => {
      if (updatedId === initialUser?._id) fetchData();
    };

    const handleNewNotification = () => {
      setUnreadCounts(prev => ({
        ...prev,
        notifications: prev.notifications + 1
      }));
    };

    const handleNewMessage = () => {
      setUnreadCounts(prev => ({
        ...prev,
        messages: prev.messages + 1
      }));
    };

    const handleReadNotifications = () => {
      setUnreadCounts(prev => ({
        ...prev,
        notifications: 0
      }));
    };

    const handleReadMessages = () => {
      setUnreadCounts(prev => ({
        ...prev,
        messages: 0
      }));
    };

    // Setup socket listeners
    socket.on("user-updated", handleUserUpdate);
    socket.on("new-notification", handleNewNotification);
    socket.on("new-message", handleNewMessage);
    socket.on("notifications-read", handleReadNotifications);
    socket.on("messages-read", handleReadMessages);

    return () => {
      socket.off("user-updated", handleUserUpdate);
      socket.off("new-notification", handleNewNotification);
      socket.off("new-message", handleNewMessage);
      socket.off("notifications-read", handleReadNotifications);
      socket.off("messages-read", handleReadMessages);
    };
  }, [initialUser?._id]);

  const navButtons = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "history", label: "History", icon: <History size={18} /> },
    { 
      id: "notification", 
      label: "Notification", 
      icon: <Bell size={18} />,
      badge: unreadCounts.notifications > 0 ? unreadCounts.notifications : null
    },
    { 
      id: "messages", 
      label: "Messages", 
      icon: <MessageSquare size={18} />,
      badge: unreadCounts.messages > 0 ? unreadCounts.messages : null 
    },
    { id: "profile", label: "Profile", icon: <UserCircle size={18} /> },
  ];

  const handleNavClick = (viewId) => {
    setView(viewId);
    
    // Mark as read when navigating to these views
    if (viewId === "notification") {
      socket.emit("mark-notifications-read", user._id);
    } else if (viewId === "messages") {
      socket.emit("mark-messages-read", user._id);
    }
  };

  return (
    <aside>
      <div className="fixed top-0 left-0 h-screen w-[250px] bg-[#FAF9F6] p-6 shadow-md flex flex-col">
        {/* Logo */}
        <div className="flex items-center justify-between">
          <img src={Logo} alt="Logo" className="h-[70px] w-[70px]" />
          <h1 className="text-[19px] font-serif leading-5">
            University of <br /> San Agustin
          </h1>
        </div>

        <div className="border-b border-gray-400 opacity-50 w-[calc(100%+3rem)] -mx-6 my-2 mt-5"></div>

        {/* User Info - No more blinking since we only update on actual changes */}
        <div className="flex flex-col items-center mt-5">
          <div className="border w-[120px] h-[120px] rounded-full bg-white overflow-hidden flex items-center justify-center text-5xl text-gray-400">
            {user?.profilePicture ? (
              <img
                src={`http://localhost:5000${user.profilePicture}?t=${imgTimestamp}`}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-avatar.png";
                }}
              />
            ) : (
              user?.name?.charAt(0)?.toUpperCase() || "?"
            )}
          </div>
          <h1 className="text-[20px] font-bold text-gray-800 mt-3 text-center">
            {user?.name}
          </h1>
          <p className="text-gray-700 mt-1 text-center">{user?.email}</p>
          {user?.id_number && (
            <p className="text-gray-700 mt-1 text-center">ID: {user.id_number}</p>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-10 flex flex-col h-full">
          <div className="flex flex-col gap-4 flex-grow">
            {navButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => handleNavClick(btn.id)}
                className={`flex items-center gap-3 px-4 py-2 rounded-[10px] font-semibold duration-150 justify-start cursor-pointer relative ${
                  currentView === btn.id
                    ? "bg-[#CC0000] text-white shadow-md"
                    : "bg-[#F2F2F2] text-gray-700 hover:bg-[#CC0000] hover:text-white"
                }`}
              >
                {btn.icon}
                <span className="flex-1 text-left">{btn.label}</span>
                {btn.badge && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {btn.badge > 9 ? "9+" : btn.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="mt-auto flex items-center gap-3 justify-center px-4 py-2 rounded-[10px] bg-[#CC0000] font-semibold text-white hover:bg-[#990000] duration-150 cursor-pointer"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Navigation_User;