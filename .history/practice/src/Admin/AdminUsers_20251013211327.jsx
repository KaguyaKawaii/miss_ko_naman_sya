import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  Eye,
  Trash2,
  RefreshCw,
  Search,
  ChevronDown,
  X,
  UserPlus,
  Pencil,
  Users,
  GraduationCap,
  UserCog,
  UserCheck,
  UserX
} from "lucide-react";
import AdminNavigation from "./AdminNavigation";
import UserFormModal from "./Modals/UserFormModal";
import UserViewModal from "./Modals/UserViewModal";

// ✅ FIXED: Store socket globally to avoid multiple connections
const socket = io("http://localhost:5000");
window.socket = socket; // Make it globally accessible

function AdminUsers({ setView }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [suspendFilter, setSuspendFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState({ type: null, user: null });

  const formatPHDateTime = (date) => {
    if (!date) return "—";
    try {
      return new Date(date).toLocaleString("en-PH", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  useEffect(() => {
    fetchUsers();
    
    // ✅ FIXED: Enhanced socket event listeners
    socket.on("user-updated", (updatedUser) => {
      console.log("User updated via socket:", updatedUser);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === updatedUser._id ? updatedUser : user
        )
      );
      
      // Update modal if it's open for this user
      setModal(prevModal => 
        prevModal.user && prevModal.user._id === updatedUser._id 
          ? { ...prevModal, user: updatedUser }
          : prevModal
      );
    });

    socket.on("user-created", (newUser) => {
      console.log("New user created via socket:", newUser);
      setUsers(prevUsers => [...prevUsers, newUser]);
    });

    socket.on("user-archived", (archivedUserId) => {
      console.log("User archived via socket:", archivedUserId);
      setUsers(prevUsers => prevUsers.filter(user => user._id !== archivedUserId));
    });

    return () => {
      socket.off("user-updated");
      socket.off("user-created");
      socket.off("user-archived");
    };
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/users/all/users");
      if (res.data.success) {
        setUsers(res.data.users);
      } else {
        console.error("Failed to fetch users:", res.data.message);
        alert(`Failed to fetch users: ${res.data.message}`);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      alert("Failed to fetch users. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FIXED: Improved toggleVerified function with notification creation
  const toggleVerified = async (user) => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/users/verify/${user._id}`,
        { verified: !user.verified }
      );

      if (res.data.success) {
        const updatedUser = res.data.user;
        
        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u._id === user._id ? { ...u, verified: updatedUser.verified } : u
          )
        );

        // Update modal state if open
        setModal((m) =>
          m.user && m.user._id === user._id
            ? { ...m, user: updatedUser }
            : m
        );

        // ✅ FIXED: Emit socket event for real-time updates
        socket.emit("user-updated", updatedUser);
        
        // ✅ FIXED: Create notification for the user
        try {
          const notificationData = {
            userId: user._id,
            message: `Your account has been ${updatedUser.verified ? 'verified' : 'unverified'} by an administrator`,
            type: 'user_verification',
            status: updatedUser.verified ? 'Verified' : 'Unverified',
            targetRole: 'user'
          };

          // Create notification in database
          const notificationRes = await axios.post('http://localhost:5000/api/notifications', notificationData);
          
          // Emit socket event for real-time notification
          if (notificationRes.data.success) {
            socket.emit('new-notification', notificationRes.data.notification);
            console.log("Notification created successfully");
          }
        } catch (notifError) {
          console.error('Failed to create notification:', notifError);
          // Continue even if notification creation fails
        }
        
        console.log("Verification toggled successfully:", updatedUser.verified);
      } else {
        console.error("Failed to toggle verification:", res.data.message);
        alert(`Failed to change verification status: ${res.data.message}`);
      }
    } catch (err) {
      console.error("Failed to toggle verification:", err);
      alert("Failed to change verification status. Please try again.");
    }
  };

  const archiveUser = async (user) => {
    if (!window.confirm(`Are you sure you want to archive ${user.name}?`)) return;

    try {
      const response = await axios.put(`http://localhost:5000/api/users/archive/${user._id}`);
      
      if (response.data.success) {
        // ✅ FIXED: Emit socket event for real-time updates
        socket.emit("user-archived", user._id);
        
        // Update local state
        setUsers(prevUsers => prevUsers.filter(u => u._id !== user._id));
        
        closeModal();
      } else {
        throw new Error(response.data.message || "Failed to archive user");
      }
    } catch (err) {
      console.error("Failed to archive user:", err.response?.data || err.message);
      alert("Failed to archive user. Please try again.");
    }
  };

  // ✅ FIXED: Added function to handle user updates from modals
  const handleUserUpdated = (updatedUser) => {
    // Update users state
    setUsers((prev) =>
      prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
    );
    
    // Update modal state if open
    setModal((m) =>
      m.user && m.user._id === updatedUser._id
        ? { ...m, user: updatedUser }
        : m
    );
  };

  const userStats = {
    total: users.length,
    students: users.filter((u) => u.role === "Student").length,
    faculty: users.filter((u) => u.role === "Faculty").length,
    staff: users.filter((u) => u.role === "Staff").length,
    verified: users.filter((u) => u.verified).length,
    unverified: users.filter((u) => !u.verified).length,
    suspended: users.filter((u) => u.suspended).length,
    active: users.filter((u) => !u.suspended).length,
  };

  const filteredUsers = users.filter((user) => {
    const matchesStatus =
      filter === "All" ||
      (filter === "Verified" && user.verified) ||
      (filter === "Not Verified" && !user.verified);
    
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    
    const matchesSuspendStatus =
      suspendFilter === "All" ||
      (suspendFilter === "Suspended" && user.suspended) ||
      (suspendFilter === "Active" && !user.suspended);
    
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.id_number || "").toLowerCase().includes(search.toLowerCase());
    
    return matchesStatus && matchesRole && matchesSuspendStatus && matchesSearch;
  });

  const closeModal = () => setModal({ type: null, user: null });

  // For cleaner conditional rendering
  const isViewModal = modal.type === "view";
  const isEditOrAddModal = ["edit", "add"].includes(modal.type);

  return (
    <>
      <AdminNavigation setView={setView} currentView="adminUsers" />
      <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        {/* Header - Keeping original size */}
        <header className="bg-white px-6 py-4 border-b border-gray-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#CC0000]">
                User Management
              </h1>
              <p className="text-gray-600">View and manage all system users</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6">
          {/* User Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {/* Total Users */}
            <StatCard label="Total Users" value={userStats.total} icon={<Users size={20} />} color="blue" />
            <StatCard label="Students" value={userStats.students} icon={<GraduationCap size={20} />} color="green" />
            <StatCard label="Faculty" value={userStats.faculty} icon={<UserCog size={20} />} color="purple" />
            <StatCard label="Staff" value={userStats.staff} icon={<UserCheck size={20} />} color="yellow" />
            <StatCard label="Verified" value={userStats.verified} icon={<UserCheck size={20} />} color="green" />
            <StatCard label="Unverified" value={userStats.unverified} icon={<UserX size={20} />} color="red" />
            <StatCard label="Suspended" value={userStats.suspended} icon={<UserX size={20} />} color="red" />
            <StatCard label="Active" value={userStats.active} icon={<UserCheck size={20} />} color="green" />
          </div>

          {/* Filters Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 transition-all duration-300 hover:shadow-md">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <SearchInput search={search} setSearch={setSearch} />
              <FilterDropdown value={filter} setValue={setFilter} label="Status" options={["All", "Verified", "Not Verified"]} />
              <FilterDropdown value={roleFilter} setValue={setRoleFilter} label="Role" options={["All", "Student", "Faculty", "Staff"]} />
              <FilterDropdown value={suspendFilter} setValue={setSuspendFilter} label="Suspension" options={["All", "Active", "Suspended"]} />

              <button
                onClick={() => {
                  setSearch("");
                  setFilter("All");
                  setRoleFilter("All");
                  setSuspendFilter("All");
                  fetchUsers();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <RefreshCw size={16} />
                <span>Refresh</span>
              </button>

              <button
                onClick={() => setModal({ type: "add", user: null })}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#CC0000] to-[#990000] text-white rounded-lg hover:from-[#990000] hover:to-[#660000] transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <UserPlus size={16} />
                <span>Add User</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">#</th>
                    <th className="px-6 py-4 text-left font-semibold">Name</th>
                    <th className="px-6 py-4 text-left font-semibold">Email</th>
                    <th className="px-6 py-4 text-left font-semibold">ID Number</th>
                    <th className="px-6 py-4 text-left font-semibold">Role</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-left font-semibold">Registered At</th>
                    <th className="px-6 py-4 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        <div className="flex justify-center items-center">
                          <RefreshCw className="animate-spin mr-2" size={18} />
                          Loading users...
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center justify-center">
                          <Users className="text-gray-300 mb-2" size={32} />
                          <p className="text-lg font-medium">No users found</p>
                          <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u, i) => (
                      <tr key={u._id} className="hover:bg-blue-50/30 transition-colors duration-200 group">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{i + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{u.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{u.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{u.id_number || "—"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            u.role === "Student" ? "bg-blue-100 text-blue-800" :
                            u.role === "Faculty" ? "bg-purple-100 text-purple-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {/* Show Verified + Suspension Badge */}
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                u.verified
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : "bg-red-100 text-red-800 border border-red-200"
                              }`}
                            >
                              {u.verified ? "Verified" : "Not Verified"}
                            </span>
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                u.suspended
                                  ? "bg-red-100 text-red-800 border border-red-200"
                                  : "bg-gray-100 text-gray-600 border border-gray-200"
                              }`}
                            >
                              {u.suspended ? "Suspended" : "Active"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {u.created_at ? formatPHDateTime(u.created_at) : "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center space-x-1">
                            <button
                              onClick={() => setModal({ type: "view", user: u })}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200 group-hover:scale-105"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => setModal({ type: "edit", user: u })}
                              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 group-hover:scale-105"
                              title="Edit"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => archiveUser(u)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200 group-hover:scale-105"
                              title="Archive"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {isViewModal && (
        <UserViewModal
          user={modal.user}
          onClose={closeModal}
          onToggleVerified={toggleVerified} // ✅ FIXED: Pass the function directly
          onUserUpdated={handleUserUpdated} // ✅ FIXED: Use the new handler
        />
      )}

      {isEditOrAddModal && (
        <UserFormModal
          mode={modal.type}
          user={modal.user}
          onClose={closeModal}
          onSuccess={(updatedUser) => {
            if (updatedUser) {
              // ✅ FIXED: Handle both add and edit scenarios properly
              if (modal.type === "add") {
                // Add new user to the list
                setUsers(prev => [...prev, updatedUser]);
                socket.emit("user-created", updatedUser);
                
                // Create welcome notification
                try {
                  const notificationData = {
                    userId: updatedUser._id,
                    message: `Welcome to the system! Your account has been created.`,
                    type: 'user_welcome',
                    status: 'Info',
                    targetRole: 'user'
                  };
                  axios.post('http://localhost:5000/api/notifications', notificationData)
                    .then(res => {
                      if (res.data.success) {
                        socket.emit('new-notification', res.data.notification);
                      }
                    });
                } catch (notifError) {
                  console.error('Failed to create welcome notification:', notifError);
                }
              } else {
                // Update existing user
                handleUserUpdated(updatedUser);
                socket.emit("user-updated", updatedUser);
                
                // Create update notification
                try {
                  const notificationData = {
                    userId: updatedUser._id,
                    message: `Your profile information has been updated by an administrator.`,
                    type: 'profile_update',
                    status: 'Updated',
                    targetRole: 'user'
                  };
                  axios.post('http://localhost:5000/api/notifications', notificationData)
                    .then(res => {
                      if (res.data.success) {
                        socket.emit('new-notification', res.data.notification);
                      }
                    });
                } catch (notifError) {
                  console.error('Failed to create update notification:', notifError);
                }
              }
            }
            closeModal();
          }}
        />
      )}
    </>
  );
}

// Small helper components for cleaner JSX
function StatCard({ label, value, icon, color }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
    red: "bg-red-50 text-red-600 border-red-200"
  };

  return (
    <div className={`bg-white p-5 rounded-2xl shadow-sm border-2 transition-all duration-300 hover:shadow-md hover:scale-105 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color].replace('50', '100').replace('600', '600')}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function SearchInput({ search, setSearch }) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, email, ID number..."
        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
      />
      {search && (
        <button
          onClick={() => setSearch("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

function FilterDropdown({ value, setValue, label, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="appearance-none pl-4 pr-8 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-300"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt === "All" ? `All ${label}` : opt}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
    </div>
  );
}

export default AdminUsers;