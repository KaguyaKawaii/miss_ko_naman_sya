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
  UserX,
  Mail,
  IdCard,
  Calendar,
  Shield
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
      <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50/50">
        {/* Header - Unchanged */}
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
        <div className="p-6 space-y-6">
          {/* User Statistics Cards - Enhanced */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
            <StatCard 
              label="Total Users" 
              value={userStats.total} 
              icon={<Users className="w-4 h-4" />} 
              color="blue" 
              trend="up"
            />
            <StatCard 
              label="Students" 
              value={userStats.students} 
              icon={<GraduationCap className="w-4 h-4" />} 
              color="green" 
            />
            <StatCard 
              label="Faculty" 
              value={userStats.faculty} 
              icon={<UserCog className="w-4 h-4" />} 
              color="purple" 
            />
            <StatCard 
              label="Staff" 
              value={userStats.staff} 
              icon={<Shield className="w-4 h-4" />} 
              color="orange" 
            />
            <StatCard 
              label="Verified" 
              value={userStats.verified} 
              icon={<UserCheck className="w-4 h-4" />} 
              color="emerald" 
            />
            <StatCard 
              label="Unverified" 
              value={userStats.unverified} 
              icon={<UserX className="w-4 h-4" />} 
              color="amber" 
            />
            <StatCard 
              label="Suspended" 
              value={userStats.suspended} 
              icon={<UserX className="w-4 h-4" />} 
              color="red" 
            />
            <StatCard 
              label="Active" 
              value={userStats.active} 
              icon={<UserCheck className="w-4 h-4" />} 
              color="lime" 
            />
          </div>

          {/* Filters Section - Enhanced */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <SearchInput search={search} setSearch={setSearch} />
                
                <div className="flex flex-wrap gap-3">
                  <FilterDropdown 
                    value={filter} 
                    setValue={setFilter} 
                    label="Verification" 
                    options={["All", "Verified", "Not Verified"]} 
                  />
                  <FilterDropdown 
                    value={roleFilter} 
                    setValue={setRoleFilter} 
                    label="Role" 
                    options={["All", "Student", "Faculty", "Staff"]} 
                  />
                  <FilterDropdown 
                    value={suspendFilter} 
                    setValue={setSuspendFilter} 
                    label="Status" 
                    options={["All", "Active", "Suspended"]} 
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSearch("");
                    setFilter("All");
                    setRoleFilter("All");
                    setSuspendFilter("All");
                    fetchUsers();
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <RefreshCw size={18} />
                  <span className="font-medium">Refresh</span>
                </button>

                <button
                  onClick={() => setModal({ type: "add", user: null })}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#CC0000] text-white rounded-xl hover:bg-[#990000] transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                >
                  <UserPlus size={18} />
                  <span>Add User</span>
                </button>
              </div>
            </div>
          </div>

          {/* Users Table - Enhanced */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Users ({filteredUsers.length})
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users size={16} />
                  <span>Total Records</span>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80 text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">Role & Status</th>
                    <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">Registration</th>
                    <th className="px-6 py-4 text-center font-semibold text-sm uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-8 h-8 border-3 border-[#CC0000] border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-gray-500 font-medium">Loading users...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center">
                        <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                          <Users size={48} />
                          <p className="text-lg font-medium">No users found</p>
                          <p className="text-sm">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u, i) => (
                      <tr key={u._id} className="hover:bg-gray-50/50 transition-colors duration-150 group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{i + 1}</div>
                        </td>
                        
                        {/* User Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#CC0000] to-[#990000] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {u.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 group-hover:text-[#CC0000] transition-colors">
                                {u.name}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <IdCard size={12} />
                                <span>{u.id_number || "No ID"}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        {/* Contact Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail size={14} />
                            <span className="truncate max-w-[200px]">{u.email}</span>
                          </div>
                        </td>
                        
                        {/* Role & Status */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                                u.role === "Student" ? "bg-blue-100 text-blue-800" :
                                u.role === "Faculty" ? "bg-purple-100 text-purple-800" :
                                u.role === "Staff" ? "bg-orange-100 text-orange-800" :
                                "bg-gray-100 text-gray-800"
                              }`}>
                                {u.role}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                u.verified
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}>
                                {u.verified ? "Verified" : "Unverified"}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                u.suspended
                                  ? "bg-red-100 text-red-800"
                                  : "bg-lime-100 text-lime-800"
                              }`}>
                                {u.suspended ? "Suspended" : "Active"}
                              </span>
                            </div>
                          </div>
                        </td>
                        
                        {/* Registration Date */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} />
                            <span>{u.created_at ? formatPHDateTime(u.created_at) : "—"}</span>
                          </div>
                        </td>
                        
                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => setModal({ type: "view", user: u })}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-200 group/btn"
                              title="View Details"
                            >
                              <Eye size={18} className="group-hover/btn:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => setModal({ type: "edit", user: u })}
                              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-200 group/btn"
                              title="Edit"
                            >
                              <Pencil size={18} className="group-hover/btn:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => archiveUser(u)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 group/btn"
                              title="Archive"
                            >
                              <Trash2 size={18} className="group-hover/btn:scale-110 transition-transform" />
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
          onToggleVerified={toggleVerified}
          onUserUpdated={handleUserUpdated}
        />
      )}

      {isEditOrAddModal && (
        <UserFormModal
          mode={modal.type}
          user={modal.user}
          onClose={closeModal}
          onSuccess={(updatedUser) => {
            if (updatedUser) {
              if (modal.type === "add") {
                setUsers(prev => [...prev, updatedUser]);
                socket.emit("user-created", updatedUser);
                
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
                handleUserUpdated(updatedUser);
                socket.emit("user-updated", updatedUser);
                
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

// Enhanced StatCard Component
function StatCard({ label, value, icon, color, trend }) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    red: "from-red-500 to-red-600",
    lime: "from-lime-500 to-lime-600"
  };

  const bgColorClasses = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
    orange: "bg-orange-50 text-orange-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    lime: "bg-lime-50 text-lime-700"
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 text-xs font-medium text-green-600">
              <span>↑ 12%</span>
              <span>from last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${bgColorClasses[color]} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Enhanced SearchInput Component
function SearchInput({ search, setSearch }) {
  return (
    <div className="relative flex-1 min-w-[300px]">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, email, ID number..."
        className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000] transition-all duration-200 bg-white shadow-sm"
      />
      {search && (
        <button
          onClick={() => setSearch("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

// Enhanced FilterDropdown Component
function FilterDropdown({ value, setValue, label, options }) {
  return (
    <div className="relative min-w-[140px]">
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full appearance-none pl-4 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000] transition-all duration-200 bg-white shadow-sm cursor-pointer"
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