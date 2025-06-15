// AdminNavigation.jsx
import { useEffect, useRef, useState } from "react";
import Logo from "../assets/logo.png";
import {
  LayoutDashboard,
  CalendarDays,
  DoorOpen,
  Users,
  MessageSquare,
  BarChart2,
  LogOut,
} from "lucide-react";

function AdminNavigation({ admin, setView, currentView }) {
  const navRefs = useRef({});
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Keep a stable copy of admin, fallback to localStorage
  const [profile, setProfile] = useState(() =>
    admin || JSON.parse(localStorage.getItem("admin") || "{}")
  );

  useEffect(() => {
    if (admin && admin.username) {
      setProfile(admin);
      localStorage.setItem("admin", JSON.stringify(admin));
    }
  }, [admin]);

  // Scroll selected button into view
  useEffect(() => {
    const btn = navRefs.current[currentView];
    btn?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    btn?.focus();
  }, [currentView]);

  const navButtons = [
    { id: "adminDashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "adminReservation", label: "Reservations", icon: <CalendarDays size={18} /> },
    { id: "adminRoom", label: "Rooms", icon: <DoorOpen size={18} /> },
    { id: "adminUsers", label: "Users", icon: <Users size={18} /> },
    { id: "adminMessage", label: "Messages", icon: <MessageSquare size={18} /> },
    { id: "adminReports", label: "Reports", icon: <BarChart2 size={18} /> },
  ];

  return (
    <>
      <aside>
        <div className="fixed top-0 left-0 h-screen w-[250px] bg-[#FAF9F6] p-6 shadow-md flex flex-col">
          {/* Logo + Title */}
          <div className="flex items-center justify-between">
            <img src={Logo} alt="Logo" className="h-[70px] w-[70px]" />
            <h1 className="text-[19px] font-serif leading-5">
              University of <br /> San Agustin
            </h1>
          </div>

          {/* Divider */}
          <div className="border-b border-gray-400 opacity-50 w-[calc(100%+3rem)] -mx-6 my-2 mt-5"></div>

          {/* Admin Profile */}
          <div className="flex flex-col items-center mt-5">
            <div className="border w-[120px] h-[120px] rounded-full bg-white flex items-center justify-center text-5xl text-gray-400">
              {profile?.name?.charAt(0) || "A"}
            </div>
            <h1 className="text-[20px] font-bold text-gray-800 mt-3 text-center">
              {profile?.name || "Admin"}
            </h1>
            <p className="text-gray-700 mt-1 text-center">{profile?.email}</p>
          </div>

          {/* Navigation Buttons */}
          <div className="mt-10 flex flex-col h-full">
            <div className="flex flex-col gap-4 flex-grow">
              {navButtons.map(({ id, label, icon }) => (
                <button
                  key={id}
                  ref={(el) => (navRefs.current[id] = el)}
                  onClick={() => setView(id)}
                  className={`flex items-center gap-3 justify-start px-4 py-2 text-[16px] font-semibold rounded-[10px] transition-all duration-150 focus:outline-none ${
                    currentView === id
                      ? "bg-[#CC0000] text-white shadow-md"
                      : "bg-[#F2F2F2] text-gray-700 hover:bg-[#CC0000] hover:text-white focus:bg-[#CC0000] focus:text-white"
                  }`}
                >
                  {icon}
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Logout */}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="mt-auto flex items-center gap-3 justify-center px-4 py-2 rounded-[10px] bg-[#CC0000] font-semibold text-white hover:bg-[#990000] duration-150 cursor-pointer"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[360px] rounded-xl shadow-2xl px-6 py-8">
            {/* Icon + Title */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="mb-3 flex items-center justify-center w-14 h-14 rounded-full bg-red-100">
                <LogOut size={28} className="text-[#CC0000]" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Log out of your account?
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                You’ll need to sign in again to access the admin panel.
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-6"></div>

            {/* Actions */}
            <div className="flex justify-between">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 mr-3 px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 duration-150"
              >
                No, stay
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("admin");
                  setShowLogoutModal(false);
                  setView("home");
                }}
                className="flex-1 px-5 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-red-600 duration-150"
              >
                Yes, log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminNavigation;
