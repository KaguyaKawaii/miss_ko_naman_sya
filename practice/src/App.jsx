import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import api from "./utils/api";
import socket from "./utils/socket";

/* --------------- shared --------------- */
import Header from "./Homepage/Header.jsx";
import Body from "./Homepage/Body.jsx";
import Body2 from "./Homepage/Body2.jsx";
import Body3 from "./Homepage/Body3.jsx";
import Body4 from "./Homepage/Body4.jsx";
import Footer from "./Homepage/Footer.jsx";
import Login_User from "./Login/Login_User.jsx";
import Login_Admin from "./Login/Login_Admin.jsx";
import SignUp_User from "./Login/SignUp_User.jsx";
import ResetPassword from "./Login/ResetPassword.jsx";

/* ---- user ---- */
import Navigation from "./User/Navigation_User.jsx";
import Dashboard from "./User/Dashboard.jsx";
import History from "./User/History.jsx";
import Notification from "./User/Notification.jsx";
import Profile from "./User/Profile.jsx";
import ReserveRoom from "./User/ReserveRoom.jsx";
import ReservationDetails from "./User/ReservationDetails.jsx";
import Messages from "./User/Message.jsx";
import Guidelines from "./User/Guidelines.jsx";
import HelpCenter from "./User/HelpCenter.jsx";
import EditProfile from "./User/EditProfile.jsx";

/* ---- admin ---- */
import AdminNavigation from "./Admin/AdminNavigation.jsx";
import AdminDashboard from "./Admin/AdminDashboard.jsx";
import AdminReservations from "./Admin/AdminReservations.jsx";
import AdminRooms from "./Admin/AdminRooms.jsx";
import AdminUsers from "./Admin/AdminUsers.jsx";
import AdminMessages from "./Admin/AdminMessages.jsx";
import AdminReports from "./Admin/AdminReports.jsx";
import AdminNotification from "./Admin/AdminNotification.jsx";
import AdminArchived from "./Admin/AdminArchived.jsx";       // ✅ added
import AdminNews from "./Admin/AdminNews.jsx";               // ✅ added
import AdminLogs from "./Admin/AdminLogs.jsx";    

/* ---- staff ---- */
import StaffNavigation from "./Staff/StaffNavigation.jsx";
import StaffDashboard from "./Staff/StaffDashboard.jsx";
import StaffReservations from "./Staff/StaffReservations.jsx";
import StaffUsers from "./Staff/StaffUsers.jsx";
import StaffMessages from "./Staff/StaffMessages.jsx";
import StaffNotification from "./Staff/StaffNotifications.jsx";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [view, setView] = useState(() => {
    const saved = localStorage.getItem("view");
    return saved || "home";
  });

  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const viewToPath = {
    home: "/",
    login: "/login",
    signup: "/signup",
    adminLogin: "/admin-login",
    dashboard: "/dashboard",
    history: "/history",
    notification: "/notification",
    messages: "/messages",
    profile: "/profile",
    reserve: "/reserve",
    guidelines: "/guidelines",
    resetPassword: "/reset-password",
    reservationDetails: "/reservation-details",
    adminDashboard: "/admin/dashboard",
    adminReservation: "/admin/reservations",
    adminRoom: "/admin/rooms",
    adminUsers: "/admin/users",
    adminMessage: "/admin/messages",
    adminReports: "/admin/reports",
    adminNotifications: "/admin/notifications",
    staffDashboard: "/staff/dashboard",
    staffReservation: "/staff/reservations",
    staffUsers: "/staff/users",
    staffMessages: "/staff/messages",
    staffNotification: "/staff/notifications",
    editProfile: "/edit-profile",
    help: "/help",
      adminArchived: "/admin/archived",               // ✅ added
  adminNews: "/admin/news",                       // ✅ added
  adminLogs: "/admin/logs",      
  };

  const pathToView = Object.fromEntries(
    Object.entries(viewToPath).map(([v, p]) => [p, v])
  );

  useEffect(() => {
    localStorage.setItem("view", view);
    const path = viewToPath[view];
    if (path && path !== location.pathname) navigate(path);
  }, [view]);

  useEffect(() => {
    const newView = pathToView[location.pathname] || "home";
    if (newView !== view) setView(newView);
  }, [location.pathname]);

  useEffect(() => {
    const handlePopState = () => {
      if (
        view === "dashboard" ||
        view === "adminDashboard" ||
        view === "staffDashboard"
      ) {
        setShowLogoutModal(true);
        window.history.pushState(null, null, window.location.pathname);
      } else if (view === "login") {
        setView("home");
      }
    };

    if (
      view === "dashboard" ||
      view === "adminDashboard" ||
      view === "staffDashboard" ||
      view === "login"
    ) {
      window.history.pushState(null, null, window.location.pathname);
      window.addEventListener("popstate", handlePopState);
    }

    return () => window.removeEventListener("popstate", handlePopState);
  }, [view]);

  const fetchUser = async () => {
    try {
      if (!user?._id) return;
      const { data } = await api.get(`/users/${user._id}`);
      const updatedUser = data.user ?? data;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  };

  useEffect(() => {
    if (user?._id) fetchUser();
  }, [view]);

  useEffect(() => {
    const handler = (updatedId) => {
      if (updatedId === user?._id) fetchUser();
    };
    socket.on("user-updated", handler);
    return () => socket.off("user-updated", handler);
  }, [user?._id]);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    const role = userData.role.toLowerCase();
    if (role === "staff") setView("staffDashboard");
    else if (role === "admin") setView("adminDashboard");
    else setView("dashboard");
  };

  const handleAdminLoginSuccess = (adminData) => {
    localStorage.setItem("user", JSON.stringify(adminData));
    setUser(adminData);
    setView("adminDashboard");
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setShowLogoutModal(false);
    setView("home");
  };

  const renderUserNavigation = (Component) => (
    <>
      <Navigation
        user={user}
        setView={setView}
        currentView={view}
        onLogout={() => setShowLogoutModal(true)}
      />
      {Component}
    </>
  );

  const renderAdminNavigation = (Component) => (
    <>
      <AdminNavigation
        admin={user}
        setView={setView}
        currentView={view}
        onLogout={() => setShowLogoutModal(true)}
      />
      {Component}
    </>
  );

  const renderStaffNavigation = (Component) => (
    <>
      <StaffNavigation
        staff={user}
        setView={setView}
        currentView={view}
        onLogout={() => setShowLogoutModal(true)}
      />
      {Component}
    </>
  );

  return (
    <div>
      {view === "home" && (
        <>
          <Header onLoginClick={() => setView("login")} />
          <Body onReserveClick={() => setView("login")} />
          <Body2 />
          <Body3 />
          <Body4 />
          <Footer />
        </>
      )}

      {view === "login" && (
        <Login_User
          onSwitchToSignUp={() => setView("signup")}
          onLoginSuccess={handleLoginSuccess}
          setView={setView}
        />
      )}

      {view === "resetPassword" && (
        <ResetPassword setView={setView} onBackToLogin={() => setView("login")} />
      )}

      {view === "signup" && (
        <SignUp_User onSwitchToLogin={() => setView("login")} />
      )}

      {view === "adminLogin" && (
        <Login_Admin
          onAdminLoginSuccess={handleAdminLoginSuccess}
          onBackToUserLogin={() => setView("login")}
        />
      )}

      {/* USER */}
      {view === "dashboard" &&
        renderUserNavigation(
          <Dashboard user={user} setView={setView} setSelectedReservation={setSelectedReservation} />
        )}
      {view === "history" &&
        renderUserNavigation(
          <History user={user} setView={setView} setSelectedReservation={setSelectedReservation} />
        )}
      {view === "notification" &&
        renderUserNavigation(<Notification user={user} setView={setView} setSelectedReservation={setSelectedReservation} />)}
      {view === "messages" && renderUserNavigation(<Messages user={user} setView={setView} />)}
      {view === "profile" && renderUserNavigation(<Profile user={user} setView={setView} />)}
      {view === "editProfile" && renderUserNavigation(<EditProfile user={user} setView={setView} />)}
      {view === "guidelines" && renderUserNavigation(<Guidelines user={user} setView={setView} />)}
      {view === "help" && renderUserNavigation(<HelpCenter user={user} setView={setView} />)}
      {view === "reserve" && renderUserNavigation(<ReserveRoom user={user} setView={setView} />)}
      {view === "reservationDetails" &&
        renderUserNavigation(<ReservationDetails reservation={selectedReservation} setView={setView} />)}

      {/* ADMIN */}
      {view === "adminDashboard" && renderAdminNavigation(<AdminDashboard setView={setView} />)}
      {view === "adminReservation" && renderAdminNavigation(<AdminReservations setView={setView} />)}
      {view === "adminRoom" && renderAdminNavigation(<AdminRooms setView={setView} />)}
      {view === "adminUsers" && renderAdminNavigation(<AdminUsers setView={setView} />)}
      {view === "adminMessage" && renderAdminNavigation(<AdminMessages setView={setView} />)}
      {view === "adminReports" && renderAdminNavigation(<AdminReports setView={setView} />)}
      {view === "adminNotifications" && renderAdminNavigation(<AdminNotification setView={setView} />)}
      {view === "adminArchived" && renderAdminNavigation(<AdminArchived setView={setView} />)}      {/* ✅ */}
{view === "adminNews" && renderAdminNavigation(<AdminNews setView={setView} />)}              {/* ✅ */}
{view === "adminLogs" && renderAdminNavigation(<AdminLogs setView={setView} />)}              {/* ✅ */}

      {/* STAFF */}
      {view === "staffDashboard" && renderStaffNavigation(<StaffDashboard setView={setView} staff={user} />)}
      {view === "staffReservation" && renderStaffNavigation(<StaffReservations setView={setView} staff={user} />)}
      {view === "staffUsers" && renderStaffNavigation(<StaffUsers setView={setView} staff={user} />)}
      {view === "staffMessages" && renderStaffNavigation(<StaffMessages setView={setView} staff={user} />)}
      {view === "staffNotification" && renderStaffNavigation(<StaffNotification setView={setView} staff={user} />)}

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-[360px] rounded-xl bg-white shadow-2xl px-6 py-8 relative">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="mb-3 flex items-center justify-center w-14 h-14 rounded-full bg-red-100">
                <LogOut size={28} className="text-[#CC0000]" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Log out of your account?</h2>
              <p className="text-sm text-gray-600 mt-1">You’ll need to sign in again to access your dashboard.</p>
            </div>
            <div className="border-t border-gray-200 mb-6" />
            <div className="flex justify-between">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 mr-3 px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer">No, stay</button>
              <button onClick={handleLogout} className="flex-1 px-5 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-red-600 cursor-pointer">Yes, log out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
