import Logo from "../assets/logo.png";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  MessageSquare,
  Bell,
  LogOut,
} from "lucide-react";

function StaffNavigation({ staff, setView, currentView, onLogout, unseenCount = 0 }) {
  const navButtons = [
    { id: "staffDashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { id: "staffReservation", label: "Reservations", icon: <CalendarDays size={18} /> },
    { id: "staffUsers", label: "Users", icon: <Users size={18} /> },
    { id: "staffMessages", label: "Messages", icon: <MessageSquare size={18} /> },
    { id: "staffNotification", label: "Notifications", icon: <Bell size={18} />, badge: unseenCount },
  ];

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

        {/* Border line */}
        <div className="border-b border-gray-400 opacity-50 w-[calc(100%+3rem)] -mx-6 my-2 mt-5" />

        {/* Staff Info */}
        <div className="flex flex-col items-center mt-5">
          <div className="border w-[120px] h-[120px] rounded-full bg-white flex items-center justify-center text-5xl text-gray-400">
            {staff?.name?.charAt(0) || "S"}
          </div>
          <h1 className="text-[20px] font-bold text-gray-800 mt-3 text-center">
            {staff?.name}
          </h1>
          <p className="text-gray-700 text-sm mt-1 text-center break-words px-2">
            {staff?.email}
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-10 flex flex-col h-full">
          <div className="flex flex-col gap-4 flex-grow">
            {navButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => setView(btn.id)}
                className={`relative flex items-center gap-3 px-4 py-2 rounded-[10px] font-semibold duration-150 justify-start cursor-pointer ${
                  currentView === btn.id
                    ? "bg-[#CC0000] text-white shadow-md"
                    : "bg-[#F2F2F2] text-gray-700 hover:bg-[#CC0000] hover:text-white"
                }`}
              >
                {btn.icon}
                <span>{btn.label}</span>
                {btn.badge > 0 && (
                  <span className="absolute right-4 inline-flex items-center justify-center text-[11px] font-bold h-[18px] min-w-[18px] px-[4px] rounded-full bg-[#FF3B30] text-white">
                    {btn.badge}
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

export default StaffNavigation;
