import { useState } from "react";
import Logo from "../assets/logo.png";
import {
  LayoutDashboard,
  History,
  Bell,
  UserCircle,
  LogOut,
} from "lucide-react";

function Navigation_User({ user, setView, currentView }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navButtons = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: "history",
      label: "History",
      icon: <History size={18} />,
    },
    {
      id: "notification",
      label: "Notification",
      icon: <Bell size={18} />,
    },
    {
      id: "profile",
      label: "Profile",
      icon: <UserCircle size={18} />,
    },
  ];

  return (
    <>
      {/* Sidebar */}
      <aside>
        <div className="fixed top-0 left-0 h-screen w-[250px] bg-[#FAF9F6] p-6 shadow-md flex flex-col">
          {/* Logo + title */}
          <div className="flex items-center justify-between">
            <img src={Logo} alt="Logo" className="h-[70px] w-[70px]" />
            <h1 className="text-[19px] font-serif leading-5">
              University of <br /> San Agustin
            </h1>
          </div>

          {/* Divider */}
          <div className="border-b border-gray-400 opacity-50 w-[calc(100%+3rem)] -mx-6 my-2 mt-5"></div>

          {/* User */}
          <div className="flex flex-col items-center mt-5">
            <div className="border w-[120px] h-[120px] rounded-full bg-white flex items-center justify-center text-5xl text-gray-400">
              {user?.name?.charAt(0) || "?"}
            </div>
            <h1 className="text-[20px] font-bold text-gray-800 mt-3 text-center">
              {user?.name}
            </h1>
            <p className="text-gray-700 mt-1 text-center">{user?.email}</p>
            {user?.id_number && (
              <p className="text-gray-700 mt-1 text-center">
                ID: {user.id_number}
              </p>
            )}
          </div>

          {/* Nav buttons */}
          <div className="mt-10 flex flex-col h-full">
            <div className="flex flex-col gap-4 flex-grow">
              {navButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setView(btn.id)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-[10px] font-semibold duration-150 cursor-pointer justify-start ${
                    currentView === btn.id
                      ? "bg-[#CC0000] text-white shadow-md"
                      : "bg-[#F2F2F2] text-gray-700 hover:bg-[#CC0000] hover:text-white focus:bg-[#CC0000] focus:text-white"
                  }`}
                >
                  {btn.icon}
                  <span>{btn.label}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          {/* Card */}
          <div className="w-[360px] rounded-xl bg-white shadow-2xl px-6 py-8 relative">
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-6">
              {/* Icon */}
              <div className="mb-3 flex items-center justify-center w-14 h-14 rounded-full bg-red-100">
                <LogOut size={28} className="text-[#CC0000]" />
              </div>
              {/* Title */}
              <h2 className="text-xl font-semibold text-gray-800">
                Log out of your account?
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                You’ll need to sign in again to access your dashboard.
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-6"></div>

            {/* Actions */}
            <div className="flex justify-between">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 mr-3 px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 duration-150 cursor-pointer"
              >
                No, stay
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  setView("home");
                }}
                className="flex-1 px-5 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-red-600 duration-150 cursor-pointer"
              >
                Yes, log out
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

export default Navigation_User;
