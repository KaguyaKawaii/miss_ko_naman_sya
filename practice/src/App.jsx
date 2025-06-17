import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";

/* --------------- shared --------------- */
import Header from "./Homepage/Header.jsx";
import Body from "./Homepage/Body.jsx";
import Body2 from "./Homepage/Body2.jsx";
import Login_User from "./Login/Login_User.jsx";
import Login_Admin from "./Login/Login_Admin.jsx";
import SignUp_User from "./Login/SignUp_User.jsx";

/* ---- user ---- */
import Navigation from "./User/Navigation_User.jsx";
import Dashboard from "./User/Dashboard.jsx";
import History from "./User/History.jsx";
import Notification from "./User/Notification.jsx";
import Profile from "./User/Profile.jsx";
import ReserveRoom from "./User/ReserveRoom.jsx";
import ReservationDetails from "./User/ReservationDetails.jsx";

/* ---- admin ---- */
import AdminNavigation from "./Admin/AdminNavigation.jsx";
import AdminDashboard from "./Admin/AdminDashboard.jsx";
import AdminReservations from "./Admin/AdminReservations.jsx";
import AdminRooms from "./Admin/AdminRooms.jsx";
import AdminUsers from "./Admin/AdminUsers.jsx";
import AdminMessages from "./Admin/AdminMessages.jsx";
import AdminReports from "./Admin/AdminReports.jsx";

function App() {
  const [view, setView] = useState("home");
  const [user, setUser] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const viewToPath = {
    home: "/",
    login: "/login",
    signup: "/signup",
    adminLogin: "/admin-login",

    // user views
    dashboard: "/dashboard",
    history: "/history",
    notification: "/notification",
    profile: "/profile",
    reserve: "/reserve",
    reservationDetails: "/reservation-details",

    // admin views
    adminDashboard: "/admin/dashboard",
    adminReservation: "/admin/reservations",
    adminRoom: "/admin/rooms",
    adminUsers: "/admin/users",
    adminMessage: "/admin/messages",
    adminReports: "/admin/reports",
  };

  const pathToView = Object.fromEntries(
    Object.entries(viewToPath).map(([v, p]) => [p, v])
  );

  // Sync URL when `view` changes
  useEffect(() => {
    const path = viewToPath[view];
    if (path && path !== location.pathname) {
      navigate(path);
    }
  }, [view]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync `view` when URL changes
  useEffect(() => {
    const newView = pathToView[location.pathname] || "home";
    if (newView !== view) setView(newView);
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Back button behavior — trap only on user/admin dashboard
  useEffect(() => {
    const handlePopState = () => {
      setShowLogoutModal(true);
      window.history.pushState(null, null, window.location.pathname);
    };

    if (view === "dashboard" || view === "adminDashboard") {
      window.history.pushState(null, null, window.location.pathname);
      window.addEventListener("popstate", handlePopState);
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [view]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setView("dashboard");
  };

  const handleAdminLoginSuccess = (adminData) => {
    setUser(adminData);
    setView("adminDashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setShowLogoutModal(false);
    setView("login");
  };

  const renderUserNavigation = (component) => (
    <>
      <Navigation
        user={user}
        setView={setView}
        currentView={view}
        onLogout={() => setShowLogoutModal(true)}
      />
      {component}
    </>
  );

  const renderAdminNavigation = (component) => (
    <>
      <AdminNavigation
        admin={user}
        setView={setView}
        currentView={view}
        onLogout={() => setShowLogoutModal(true)}
      />
      {component}
    </>
  );

  return (
    <div>
      {/* Home */}
      {view === "home" && (
        <>
          <Header onLoginClick={() => setView("login")} />
          <Body onReserveClick={() => setView("login")}/>
          <Body2 />
        </>
      )}

      {/* Auth Screens */}
      {view === "login" && (
        <Login_User
          onSwitchToSignUp={() => setView("signup")}
          onLoginSuccess={handleLoginSuccess}
          setView={setView}
        />
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

      {/* User Screens */}
      {view === "dashboard" &&
        renderUserNavigation(<Dashboard user={user} setView={setView} />)}
      {view === "history" &&
        renderUserNavigation(<History user={user} setView={setView} />)}
      {view === "notification" &&
        renderUserNavigation(
          <Notification
            user={user}
            setView={setView}
            setSelectedReservation={setSelectedReservation}
          />
        )}
      {view === "profile" &&
        renderUserNavigation(<Profile user={user} setView={setView} />)}
      {view === "reserve" &&
        renderUserNavigation(<ReserveRoom user={user} setView={setView} />)}
      {view === "reservationDetails" &&
        renderUserNavigation(
          <ReservationDetails
            reservation={selectedReservation}
            setView={setView}
          />
        )}

      {/* Admin Screens */}
      {view === "adminDashboard" &&
        renderAdminNavigation(<AdminDashboard setView={setView} />)}
      {view === "adminReservation" &&
        renderAdminNavigation(<AdminReservations setView={setView} />)}
      {view === "adminRoom" &&
        renderAdminNavigation(<AdminRooms setView={setView} />)}
      {view === "adminUsers" &&
        renderAdminNavigation(<AdminUsers setView={setView} />)}
      {view === "adminMessage" &&
        renderAdminNavigation(<AdminMessages setView={setView} />)}
      {view === "adminReports" &&
        renderAdminNavigation(<AdminReports setView={setView} />)}

      {/* LOGOUT */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-[360px] rounded-xl bg-white shadow-2xl px-6 py-8 relative">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="mb-3 flex items-center justify-center w-14 h-14 rounded-full bg-red-100">
                <LogOut size={28} className="text-[#CC0000]" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Log out of your account?
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                You’ll need to sign in again to access your dashboard.
              </p>
            </div>
            <div className="border-t border-gray-200 mb-6"></div>
            <div className="flex justify-between">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 mr-3 px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 duration-150 cursor-pointer"
              >
                No, stay
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-5 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-red-600 duration-150 cursor-pointer"
              >
                Yes, log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
