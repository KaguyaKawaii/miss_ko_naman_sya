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

function StaffNavigation({ staff, setView, currentView, onLogout, unseenCount = 0 }) {
  const navButtons = [
    { id: "staffDashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "staffReservation", label: "Reservations", icon: <CalendarDays size={18} /> },
    { id: "staffReports", label: "Reports", icon: <FileText size={18} /> },
    { id: "staffUsers", label: "Users", icon: <Users size={18} /> },
    { id: "staffMessages", label: "Messages", icon: <MessageSquare size={18} /> },
    { id: "staffNotification", label: "Notifications", icon: <Bell size={18} />, badge: unseenCount },
    { id: "staffProfile", label: "Profile", icon: <User size={18} /> },
  ];

  return (
    
    <aside>
      
      <div className="fixed top-0 left-0 h-screen w-[250px] bg-[#0F0E0E] p-6 shadow-xl flex flex-col border-r rounded-r-2xl border-gray-700">
        {/* Logo */}
        <div className="flex items-center justify-between">
          <img src={Logo} alt="Logo" className="h-[70px] w-[70px]" />
          <h1 className="text-[19px] font-serif leading-5 text-white">
            University of <br /> San Agustin
          </h1>
        </div>

        {/* Border line */}
        <div className="border-b border-gray-900 w-[calc(100%+3rem)] -mx-6 my-2 mt-5" />

        {/* Staff Info */}
        <div className="flex flex-col items-center mt-5">
          <div className="border-2 border-gray-500 w-[120px] h-[120px] rounded-full bg-gray-700 flex items-center justify-center text-5xl text-gray-300 font-bold shadow-lg">
            {staff?.name?.charAt(0) || "S"}
          </div>
          <h1 className="text-[20px] font-bold text-white mt-3 text-center">
            {staff?.name}
          </h1>
          <p className="text-gray-300 text-sm mt-1 text-center break-words px-2">
            {staff?.email}
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-10 flex flex-col h-full">
          <div className="flex flex-col gap-3 flex-grow">
            {navButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => setView(btn.id)}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-lg font-medium duration-200 justify-start cursor-pointer transition-all ${
                  currentView === btn.id
                    ? "bg-white text-gray-700 shadow-lg transform scale-[1.02]"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-100 hover:text-gray-800"
                }`}
              >
                {btn.icon}
                <span>{btn.label}</span>
                {btn.badge > 0 && (
                  <span className="absolute right-4 inline-flex items-center justify-center text-xs font-bold h-5 min-w-5 px-1 rounded-full bg-red-500 text-white shadow-sm">
                    {btn.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="mt-auto flex items-center gap-3 justify-center px-4 py-3 rounded-lg bg-red-700 font-medium text-white hover:bg-red-800 duration-200 cursor-pointer transition-colors shadow-md"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

export default StaffNavigation;