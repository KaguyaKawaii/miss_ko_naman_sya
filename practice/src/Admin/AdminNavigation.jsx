import { useEffect, useRef, useState } from "react";
import Logo from "../assets/logo.png";
import { LogOut } from "lucide-react";

function AdminNavigation({ admin, setView, currentView, onLogout }) {
  const navRefs = useRef({});
  const [profile, setProfile] = useState(() =>
    admin || JSON.parse(localStorage.getItem("admin") || "{}")
  );

  useEffect(() => {
    if (admin && admin.username) {
      setProfile(admin);
      localStorage.setItem("admin", JSON.stringify(admin));
    }
  }, [admin]);

  useEffect(() => {
    const btn = navRefs.current[currentView];
    btn?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    btn?.focus();
  }, [currentView]);

  const navButtons = [
    { id: "adminDashboard", label: "Dashboard" },
    { id: "adminReservation", label: "Reservations" },
    { id: "adminRoom", label: "Manage Rooms" },
    { id: "adminUsers", label: "Manage Users" },
    { id: "adminMessage", label: "Messages" },
    { id: "adminReports", label: "Reports" },
    { id: "adminNotifications", label: "Notifications" },
    { id: "adminArchived", label: "Archived" },
    { id: "adminNews", label: "Manage News" },
    { id: "adminLogs", label: "Activity Logs" },
  ];

  return (
    <aside>
      <div className="fixed top-0 left-0 h-screen w-[250px] bg-gray-900 p-0 flex flex-col border-r border-gray-800">
        {/* Logo + Title */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-800">
          <img src={Logo} alt="Logo" className="h-[40px] w-[40px]" />
          <h1 className="text-[15px] font-medium text-gray-200 leading-tight">
            University of San Agustin
          </h1>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col h-full overflow-y-auto">
          <div className="flex flex-col flex-grow">
            {navButtons.map(({ id, label }) => (
              <button
                key={id}
                ref={(el) => (navRefs.current[id] = el)}
                onClick={() => setView(id)}
                className={`w-full px-4 py-3 text-left transition-all duration-150 focus:outline-none border-l-4 ${currentView === id
                    ? "bg-gray-800 text-white font-medium border-blue-500"
                    : "text-gray-400 border-transparent hover:bg-gray-800 hover:text-gray-200"
                  }`}
              >
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>

          {/* Logout - Centered */}
          <div className="mt-auto border-t border-gray-800">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default AdminNavigation;