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
  Shield,
  Filter,
  Download,
  MoreHorizontal
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
      <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50/30">
        {/* Header - Enhanced with better spacing */}
        <header className="bg-white px-8 py-6 border-b border-gray-200/80 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#CC0000]">
                User Management
              </h1>
              <p className="text-gray-600 mt-1">View and manage all system users</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
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
        <div className="p-8 space-y-8">
          {/* User Statistics Cards - Enhanced Layout */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <StatCard 
              label="Total Users" 
              value={userStats.total} 
              icon={<Users className="w-5 h-5" />} 
              color="blue" 
            />
            <StatCard 
              label="Students" 
              value={userStats.students} 
              icon={<GraduationCap className="w-5 h-5" />} 
              color="green" 
            />
            <StatCard 
              label="Faculty" 
              value={userStats.faculty} 
              icon={<UserCog className="w-5 h-5" />} 
              color="purple" 
            />
            <StatCard 
              label="Staff" 
              value={userStats.staff} 
              icon={<Shield className="w-5 h-5" />} 
              color="orange" 
            />
            <StatCard 
              label="Verified" 
              value={userStats.verified} 
              icon={<UserCheck className="w-5 h-5" />} 
              color="emerald" 
            />
            <StatCard 
              label="Unverified" 
              value={userStats.unverified} 
              icon={<UserX className="w-5 h-5" />} 
              color="amber" 
            />
            <StatCard 
              label="Suspended" 
              value={userStats.suspended} 
              icon={<UserX className="w-5 h-5" />} 
              color="red" 
            />
            <StatCard 
              label="Active" 
              value={userStats.active} 
              icon={<UserCheck className="w-5 h-5" />} 
              color="lime" 
            />
          </div>

          {/* Filters Section - Enhanced */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <SearchInput search={search} setSearch={setSearch} />
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <Filter size={16} />
                    <span>Filter by:</span>
                  </div>
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
                <button className="flex items-center gap-2 px-4 py-2.5 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm">
                  <Download size={18} />
                  <span className="font-medium">Export</span>
                </button>

                <button
                  onClick={fetchUsers}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
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

          {/* Users Table - Enhanced Design */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Users <span className="text-[#CC0000]">({filteredUsers.length})</span>
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users size={16} />
                  <span>Total Records: {users.length}</span>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider text-gray-600">#</th>
                    <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider text-gray-600">User Profile</th>
                    <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider text-gray-600">Contact Info</th>
                    <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider text-gray-600">Role & Status</th>
                    <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider text-gray-600">Registration Date</th>
                    <th className="px-6 py-4 text-center font-semibold text-sm uppercase tracking-wider text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-10 h-10 border-3 border-[#CC0000] border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-gray-500 font-medium">Loading users data...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                          <Users size={48} className="opacity-50" />
                          <p className="text-lg font-medium text-gray-500">No users found</p>
                          <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u, i) => (
                      <tr key={u._id} className="hover:bg-gray-50/80 transition-all duration-200 group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center">
                            {i + 1}
                          </div>
                        </td>
                        
                        {/* User Profile */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#CC0000] to-[#990000] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
                              {u.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 group-hover:text-[#CC0000] transition-colors truncate max-w-[150px]">
                                {u.name}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <IdCard size={12} />
                                <span className="truncate max-w-[120px]">{u.id_number || "No ID provided"}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        {/* Contact Info */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail size={14} className="text-gray-400" />
                              <span className="truncate max-w-[200px] font-medium">{u.email}</span>
                            </div>
                          </div>
                        </td>
                        
                        {/* Role & Status */}
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1">
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border ${
                                u.role === "Student" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                u.role === "Faculty" ? "bg-purple-50 text-purple-700 border-purple-200" :
                                u.role === "Staff" ? "bg-orange-50 text-orange-700 border-orange-200" :
                                "bg-gray-50 text-gray-700 border-gray-200"
                              }`}>
                                {u.role}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                u.verified
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-amber-100 text-amber-800 border border-amber-200"
                              }`}>
                                {u.verified ? "✓ Verified" : "✗ Unverified"}
                              </span>
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                u.suspended
                                  ? "bg-red-100 text-red-800 border border-red-200"
                                  : "bg-lime-100 text-lime-800 border border-lime-200"
                              }`}>
                                {u.suspended ? "⏸ Suspended" : "▶ Active"}
                              </span>
                            </div>
                          </div>
                        </td>
                        
                        {/* Registration Date */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="font-medium">{u.created_at ? formatPHDateTime(u.created_at) : "—"}</span>
                          </div>
                        </td>
                        
                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => setModal({ type: "view", user: u })}
                              className="p-2.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-all duration-200 group/btn border border-transparent hover:border-blue-200"
                              title="View Details"
                            >
                              <Eye size={18} className="group-hover/btn:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => setModal({ type: "edit", user: u })}
                              className="p-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-all duration-200 group/btn border border-transparent hover:border-gray-200"
                              title="Edit User"
                            >
                              <Pencil size={18} className="group-hover/btn:scale-110 transition-transform" />
                            </button>
                            <button
                              onClick={() => archiveUser(u)}
                              className="p-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 group/btn border border-transparent hover:border-red-200"
                              title="Archive User"
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

            {/* Table Footer */}
            {filteredUsers.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30">
                <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-2 mb-2 sm:mb-0">
                    <span className="font-medium">Showing</span>
                    <span className="bg-white px-2 py-1 rounded border border-gray-300 font-semibold">{filteredUsers.length}</span>
                    <span className="font-medium">of</span>
                    <span className="bg-white px-2 py-1 rounded border border-gray-300 font-semibold">{users.length}</span>
                    <span className="font-medium">users</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>Rows per page:</span>
                    <select className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000]">
                      <option>10</option>
                      <option>25</option>
                      <option>50</option>
                      <option>100</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
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
function StatCard({ label, value, icon, color }) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    lime: "bg-lime-50 text-lime-700 border-lime-200"
  };

  return (
    <div className={`bg-white p-5 rounded-2xl shadow-sm border-2 ${colorClasses[color]} transition-all duration-300 hover:shadow-md hover:scale-[1.02] group`}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color].replace('50', '100')} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Enhanced SearchInput Component
function SearchInput({ search, setSearch }) {
  return (
    <div className="relative flex-1 min-w-[320px]">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, email, ID number..."
        className="w-full pl-12 pr-10 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000] transition-all duration-200 bg-white shadow-sm"
      />
      {search && (
        <button
          onClick={() => setSearch("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
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
    <div className="relative min-w-[150px]">
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full appearance-none pl-4 pr-8 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000] transition-all duration-200 bg-white shadow-sm cursor-pointer font-medium"
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