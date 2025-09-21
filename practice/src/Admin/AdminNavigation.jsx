import { useEffect, useRef, useState } from "react";
import Logo from "../assets/logo.png";
import {
  LogOut,
  LayoutDashboard,
  CalendarCheck,
  DoorOpen,
  Users,
  MessageSquare,
  FileText,
  Bell,
  Archive,
  Newspaper,
  ListOrdered,
  ChevronDown,
  HardDrive, // ✅ Backup icon
} from "lucide-react";

function AdminNavigation({ admin, setView, currentView, onLogout }) {
  const navRefs = useRef({});
  const [profile, setProfile] = useState(() =>
    admin || JSON.parse(localStorage.getItem("admin") || "{}")
  );
  const [archiveOpen, setArchiveOpen] = useState(false);

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
    { id: "adminDashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "adminReservation", label: "Reservations", icon: CalendarCheck },
    { id: "adminRoom", label: "Manage Rooms", icon: DoorOpen },
    { id: "adminUsers", label: "Manage Users", icon: Users },
    { id: "adminMessage", label: "Messages", icon: MessageSquare },
    { id: "adminReports", label: "Reports", icon: FileText },
    { id: "adminNotifications", label: "Notifications", icon: Bell },
    { id: "adminNews", label: "Manage News", icon: Newspaper },
    { id: "adminLogs", label: "Activity Logs", icon: ListOrdered },
  ];

  const archiveOptions = [
    { id: "archivedUsers", label: "Users" },
    { id: "archivedReservations", label: "Reservations" },
    { id: "archivedReports", label: "Reports" },
    { id: "archivedNews", label: "News" },
  ];

  return (
    <aside>
      <div className="fixed top-0 left-0 h-screen w-[250px] bg-[#030303] p-0 flex flex-col border-r">
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
            {navButtons.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                ref={(el) => (navRefs.current[id] = el)}
                onClick={() => setView(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-150 focus:outline-none border-l-4 ${
                  currentView === id
                    ? "bg-gray-700 text-white font-medium border-red-500"
                    : "text-gray-400 border-transparent hover:bg-gray-600 hover:text-gray-200"
                }`}
              >
                <Icon size={18} />
                <span className="text-sm">{label}</span>
              </button>
            ))}

            {/* Archive Dropdown */}
            <div>
              <button
                onClick={() => setArchiveOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-150 focus:outline-none border-l-4 ${
                  currentView.startsWith("archived")
                    ? "bg-gray-700 text-white font-medium border-red-500"
                    : "text-gray-400 border-transparent hover:bg-gray-600 hover:text-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Archive size={18} />
                  <span className="text-sm">Archived</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    archiveOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {archiveOpen && (
                <div className="flex flex-col pl-10 bg-[#111]">
                  {archiveOptions.map(({ id, label }) => (
                    <button
                      key={id}
                      ref={(el) => (navRefs.current[id] = el)}
                      onClick={() => setView(id)}
                      className={`w-full text-left px-4 py-2 text-sm rounded transition-colors ${
                        currentView === id
                          ? "text-white font-medium bg-gray-700"
                          : "text-gray-400 hover:text-gray-200 hover:bg-gray-600"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Logout */}
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
