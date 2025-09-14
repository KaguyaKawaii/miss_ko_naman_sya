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

const socket = io("http://localhost:5000");

function AdminUsers({ setView }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState({ type: null, user: null });

  const formatPHDateTime = (date) =>
    date
      ? new Date(date).toLocaleString("en-PH", {
          timeZone: "Asia/Manila",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "—";

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    socket.on("user-updated", () => {
      fetchUsers();
    });
    return () => socket.off("user-updated");
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/users?archived=false");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      alert("Failed to fetch users.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVerified = async (user) => {
    try {
      await axios.patch(`http://localhost:5000/api/users/${user._id}`, {
        verified: !user.verified,
      });
      fetchUsers();
      setModal((m) =>
        m.user && m.user._id === user._id
          ? { ...m, user: { ...m.user, verified: !m.user.verified } }
          : m
      );
    } catch (err) {
      console.error("Failed to toggle verification:", err);
      alert("Failed to change verification status.");
    }
  };

const archiveUser = async (user) => {
  if (!window.confirm(`Are you sure you want to archive ${user.name}?`)) return;

  try {
    await axios.delete(`http://localhost:5000/api/users/archive/${user._id}`);
    fetchUsers();
    closeModal();
  } catch (err) {
    console.error("Failed to archive user:", err.response?.data || err.message);
    alert("Failed to archive user.");
  }
};



  const userStats = {
    total: users.length,
    students: users.filter(u => u.role === "Student").length,
    faculty: users.filter(u => u.role === "Faculty").length,
    staff: users.filter(u => u.role === "Staff").length,
    verified: users.filter(u => u.verified).length,
    unverified: users.filter(u => !u.verified).length
  };

  const filteredUsers = users.filter((user) => {
    const matchesStatus = filter === "All" || 
      (filter === "Verified" && user.verified) || 
      (filter === "Not Verified" && !user.verified);
    const matchesRole = roleFilter === "All" || user.role === roleFilter;
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.id_number || "").toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesRole && matchesSearch;
  });

  const closeModal = () => setModal({ type: null, user: null });

  return (
    <>
      <AdminNavigation setView={setView} currentView="adminUsers" />
      <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#CC0000]">User Management</h1>
              <p className="text-gray-600">View and manage all system users</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="p-6">
          {/* User Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            {/* Total Users */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold">{userStats.total}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                  <Users size={20} />
                </div>
              </div>
            </div>

            {/* Students */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Students</p>
                  <p className="text-2xl font-bold">{userStats.students}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-full text-green-600">
                  <GraduationCap size={20} />
                </div>
              </div>
            </div>

            {/* Faculty */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Faculty</p>
                  <p className="text-2xl font-bold">{userStats.faculty}</p>
                </div>
                <div className="p-2 bg-purple-100 rounded-full text-purple-600">
                  <UserCog size={20} />
                </div>
              </div>
            </div>

            {/* Staff */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Staff</p>
                  <p className="text-2xl font-bold">{userStats.staff}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-full text-yellow-600">
                  <UserCog size={20} />
                </div>
              </div>
            </div>

            {/* Verified */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Verified</p>
                  <p className="text-2xl font-bold">{userStats.verified}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-full text-green-600">
                  <UserCheck size={20} />
                </div>
              </div>
            </div>

            {/* Unverified */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Unverified</p>
                  <p className="text-2xl font-bold">{userStats.unverified}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-full text-red-600">
                  <UserX size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email, ID number..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {search && (
                  <button 
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex gap-4">
                <div className="relative">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="appearance-none pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="All">All Status</option>
                    <option value="Verified">Verified</option>
                    <option value="Not Verified">Not Verified</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>

                <div className="relative">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="appearance-none pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="All">All Roles</option>
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Staff">Staff</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              <button
                onClick={() => {
                  setSearch("");
                  setFilter("All");
                  setRoleFilter("All");
                  fetchUsers();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw size={16} />
                <span>Refresh</span>
              </button>

              <button
                onClick={() => setModal({ type: "add", user: null })}
                className="flex items-center gap-2 px-4 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-[#990000] transition-colors"
              >
                <UserPlus size={16} />
                <span>Add User</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">#</th>
                    <th className="px-6 py-3 text-left font-medium">Name</th>
                    <th className="px-6 py-3 text-left font-medium">Email</th>
                    <th className="px-6 py-3 text-left font-medium">ID Number</th>
                    <th className="px-6 py-3 text-left font-medium">Role</th>
                    <th className="px-6 py-3 text-left font-medium">Status</th>
                    <th className="px-6 py-3 text-left font-medium">Registered At</th>
                    <th className="px-6 py-3 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u, i) => (
                      <tr key={u._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{i + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{u.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{u.id_number || "—"}</td>
                        <td className="px-6 py-4 whitespace-nowrap capitalize">{u.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              u.verified
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {u.verified ? "Verified" : "Not Verified"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {u.created_at ? formatPHDateTime(u.created_at) : "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => setModal({ type: "view", user: u })}
                              className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => setModal({ type: "edit", user: u })}
                              className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                              title="Edit"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => archiveUser(u)}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
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
      {modal.type === "view" && (
        <UserViewModal
          user={modal.user}
          onClose={closeModal}
          onToggleVerified={toggleVerified}
        />
      )}

      {["edit", "add"].includes(modal.type) && (
        <UserFormModal
          mode={modal.type}
          user={modal.user}
          onClose={closeModal}
          onSuccess={() => {
            fetchUsers();
            closeModal();
          }}
        />
      )}
    </>
  );
}

export default AdminUsers;
