import { useState } from 'react';
import Header from './Homepage/Header.jsx';
import Body from './Homepage/Body.jsx';
import Login_User from './Login/Login_User.jsx';
import Login_Admin from './Login/Login_Admin.jsx';
import SignUp_User from './Login/SignUp_User.jsx';

import Navigation from './User/Navigation_User.jsx';
import Dashboard from './User/Dashboard.jsx';
import History from './User/History.jsx';
import Notification from './User/Notification.jsx';
import Profile from './User/Profile.jsx';
import ReserveRoom from './User/ReserveRoom.jsx';
import ReservationDetails from './User/ReservationDetails.jsx';

import AdminNavigation from './Admin/AdminNavigation.jsx';
import AdminDashboard from './Admin/AdminDashboard.jsx';
import AdminReservations from './Admin/AdminReservations.jsx';
import AdminRooms from './Admin/AdminRooms.jsx';
import AdminUsers from './Admin/AdminUsers.jsx';
import AdminMessages from './Admin/AdminMessages.jsx';
import AdminReports from './Admin/AdminReports.jsx';
// import AdminSystemLogs from './Admin/AdminSystemLogs.jsx';

function App() {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setView('dashboard');
  };

  const handleAdminLoginSuccess = (adminData) => {
    setUser(adminData);
    setView('adminDashboard');
  };

  const renderUserNavigation = (component) => (
    <>
      <Navigation user={user} setView={setView} currentView={view} />
      {component}
    </>
  );

  const renderAdminNavigation = (component) => (
    <>
      <AdminNavigation admin={user} setView={setView} currentView={view} />
      {component}
    </>
  );

  return (
    <div>
      {/* Home */}
      {view === 'home' && (
        <>
          <Header onLoginClick={() => setView('login')} />
          <Body />
        </>
      )}

      {/* User Login & Signup */}
      {view === 'login' && (
        <Login_User
          onSwitchToSignUp={() => setView('signup')}
          onLoginSuccess={handleLoginSuccess}
          setView={setView}
        />
      )}

      {view === 'signup' && (
        <SignUp_User onSwitchToLogin={() => setView('login')} />
      )}

      {/* Admin Login */}
      {view === 'adminLogin' && (
        <Login_Admin
          onAdminLoginSuccess={handleAdminLoginSuccess}
          onBackToUserLogin={() => setView('login')}
        />
      )}

      {/* User Views */}
      {view === 'dashboard' && renderUserNavigation(<Dashboard user={user} setView={setView} />)}
      {view === 'history' && renderUserNavigation(<History user={user} setView={setView} />)}
      {view === 'notification' && renderUserNavigation(
        <Notification
          user={user}
          setView={setView}
          setSelectedReservation={setSelectedReservation}
        />
      )}
      {view === 'profile' && renderUserNavigation(<Profile user={user} setView={setView} />)}
      {view === 'reserve' && renderUserNavigation(<ReserveRoom user={user} setView={setView} />)}
      {view === 'reservationDetails' &&
        renderUserNavigation(<ReservationDetails reservation={selectedReservation} setView={setView} />)
      }

      {/* Admin Views */}
      {view === 'adminDashboard' && renderAdminNavigation(<AdminDashboard setView={setView} />)}
      {view === 'adminReservation' && renderAdminNavigation(<AdminReservations setView={setView} />)}
      {view === 'adminRoom' && renderAdminNavigation(<AdminRooms setView={setView} />)}
      {view === 'adminUsers' && renderAdminNavigation(<AdminUsers setView={setView} />)}
      {view === 'adminMessage' && renderAdminNavigation(<AdminMessages setView={setView} />)}
      {view === 'adminReports' && renderAdminNavigation(<AdminReports setView={setView} />)}
      {/* {view === 'adminSystemLogs' && renderAdminNavigation(<AdminSystemLogs setView={setView} />)} */}
    </div>
  );
}

export default App;
