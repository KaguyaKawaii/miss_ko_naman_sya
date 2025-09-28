import { useEffect, useState } from "react";
import socket from "../utils/socket";
import api from "../utils/api";
import Logo from "../assets/logo3.png";
import {
  LayoutDashboard,
  History,
  Bell,
  MessageSquare,
  UserCircle,
  LogOut,
  Calendar as CalendarIcon,
  HelpCircle,
} from "lucide-react";

function Navigation_User({ user: initialUser, setView, currentView, onLogout }) {
  const [user, setUser] = useState(initialUser);
  const [imgTimestamp, setImgTimestamp] = useState(Date.now());
  const [unreadCounts, setUnreadCounts] = useState({
    notifications: 0,
    messages: 0,
  });
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const fetchData = async () => {
    try {
      const { data: userData } = await api.get(`/users/${initialUser._id}`);
      setUser(userData.user ?? userData);
      setImgTimestamp(Date.now());

      const { data: counts } = await api.get(
        `/users/${initialUser._id}/unread-counts`
      );
      setUnreadCounts({
        notifications: counts.notifications || 0,
        messages: counts.messages || 0,
      });
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  useEffect(() => {
    fetchData();

    const handleUserUpdate = (updatedId) => {
      if (updatedId === initialUser?._id) fetchData();
    };
    const handleNewNotification = () =>
      setUnreadCounts((prev) => ({
        ...prev,
        notifications: prev.notifications + 1,
      }));
    const handleNewMessage = () =>
      setUnreadCounts((prev) => ({ ...prev, messages: prev.messages + 1 }));
    const handleReadNotifications = () =>
      setUnreadCounts((prev) => ({ ...prev, notifications: 0 }));
    const handleReadMessages = () =>
      setUnreadCounts((prev) => ({ ...prev, messages: 0 }));

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
    // { id: "calendar", label: "Calendar", icon: <CalendarIcon size={18} /> },
    { id: "history", label: "History", icon: <History size={18} /> },
    {
      id: "notification",
      label: "Notification",
      icon: <Bell size={18} />,
      badge: unreadCounts.notifications > 0 ? unreadCounts.notifications : null,
    },
    {
      id: "messages",
      label: "Messages",
      icon: <MessageSquare size={18} />,
      badge: unreadCounts.messages > 0 ? unreadCounts.messages : null,
    },
    { id: "profile", label: "Profile", icon: <UserCircle size={18} /> },
  ];

  const handleNavClick = (viewId) => {
    setView(viewId);
    if (viewId === "notification") {
      socket.emit("mark-notifications-read", user._id);
    } else if (viewId === "messages") {
      socket.emit("mark-messages-read", user._id);
    }
    setShowHelp(false); // Close Help menu if switching views
  };

  const isActive = (btnId) => {
    if (btnId === "profile") {
      return (
        currentView === "profile" ||
        currentView === "editProfile" ||
        currentView === "edit-profile"
      );
    }
    return currentView === btnId;
  };

  return (
    <aside>
      <div className="fixed top-0 left-0 h-screen w-[250px] bg-[#171717] p-6 shadow-md flex flex-col rounded-r-2xl">
        {/* Logo */}
        <div className="flex items-center justify-around ">
          <img src={Logo} alt="Logo" className="h-[100px] w-[100px]" />

          <div className="flex flex-col items-start ">
            <h1 className="text-[15px] font-serif  text-white">
              University of <br /> San Agustin
            </h1>

            <div className="border w-full border-b-white/50"></div>

            <p className="text-[20px] font-serif font-semibold text-white">CircuLink</p>

          </div>
        </div>
        <div className="border-b border-gray-700 opacity-50 w-[calc(100%+3rem)] -mx-6 my-4"></div>

        {/* User Info */}
        <div className="flex flex-col items-center mt-5">
          <div className="border-2 border-gray-600 w-[120px] h-[120px] rounded-full bg-gray-800 overflow-hidden flex items-center justify-center text-5xl text-gray-300">
            {user?.profilePicture ? (
  <img
    src={
      user.profilePicture.startsWith("http")
        ? `${user.profilePicture}?t=${imgTimestamp}` // Cloudinary or external URL
        : `http://localhost:5000${user.profilePicture}?t=${imgTimestamp}` // Local upload
    }
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
          <h1 className="text-[20px] font-bold text-white mt-3 text-center">
            {user?.name}
          </h1>
          <p className="text-gray-300 mt-1 text-center">{user?.email}</p>
          {user?.id_number && (
            <p className="text-gray-400 mt-1 text-center">ID: {user.id_number}</p>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-10 flex flex-col h-full">
          <div className="flex flex-col gap-2 flex-grow">
            {navButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => handleNavClick(btn.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 justify-start cursor-pointer relative group ${
                  isActive(btn.id)
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-[#2a2a2a] text-gray-300 hover:bg-[#333333] hover:text-white"
                }`}
              >
                <span
                  className={`transition-transform duration-200 ${
                    isActive(btn.id) ? "scale-110" : "group-hover:scale-110"
                  }`}
                >
                  {btn.icon}
                </span>
                <span className="flex-1 text-left">{btn.label}</span>
                {btn.badge && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {btn.badge > 9 ? "9+" : btn.badge}
                  </span>
                )}
              </button>
            ))}

            {/* Help Button */}
            <div className="relative">
              <button
                onClick={() => setShowHelp((prev) => !prev)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 justify-start cursor-pointer w-full ${
                  showHelp ||
                  currentView === "help" ||
                  currentView === "guidelines"
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-[#2a2a2a] text-gray-300 hover:bg-[#333333] hover:text-white"
                }`}
              >
                <HelpCircle size={18} />
                <span>Help</span>
              </button>

              {showHelp && (
                <div className="absolute top-0 left-[226px] flex flex-col w-[260px] bg-white rounded-r-xl shadow-lg border border-gray-200 p-4 z-50">
                  <button
                    onClick={() => setView("help")}
                    className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm rounded-xl w-full flex flex-col items-center justify-center text-center p-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    aria-label="Go to help center"
                  >
                    <h2 className="text-sm font-semibold text-gray-800">
                      Help Center
                    </h2>
                    <p className="text-xs text-gray-600 mt-1">
                      Get answers to your questions
                    </p>
                  </button>

                  <button
                    onClick={() => setView("guidelines")}
                    className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm rounded-xl w-full flex flex-col items-center justify-center text-center p-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 mt-3"
                    aria-label="View guidelines"
                  >
                    <h2 className="text-sm font-semibold text-gray-800">
                      Room Guidelines
                    </h2>
                    <p className="text-xs text-gray-600 mt-1">
                      Learn how to use rooms properly
                    </p>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="mt-6 flex items-center gap-3 justify-center px-4 py-3 rounded-lg bg-[#2a2a2a] font-medium text-white hover:bg-red-600 transition-all duration-200 cursor-pointer group"
          >
            <LogOut
              size={18}
              className="group-hover:scale-110 transition-transform duration-200"
            />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Navigation_User;
