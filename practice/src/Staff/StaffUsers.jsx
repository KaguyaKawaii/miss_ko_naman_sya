import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, RefreshCcw, Eye, X, CheckCircle, XCircle } from "lucide-react";
import StaffNavigation from "./StaffNavigation";

function StaffUsers({ setView, staff }) {   // ← accept staff prop here
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modalUser, setModalUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers(search);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const fetchUsers = async (term = "") => {
    setIsLoading(true);
    try {
      const params = term ? { q: term } : {};
      const { data } = await axios.get("http://localhost:5000/users", { params });

      // Filter only students and faculty
      const filteredUsers = data.filter(
        (u) =>
          u.role.toLowerCase() === "student" ||
          u.role.toLowerCase() === "faculty"
      );

      setUsers(filteredUsers);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVerified = async (user) => {
    try {
      const { data: updatedUser } = await axios.patch(
        `http://localhost:5000/users/${user._id}`,
        { verified: !user.verified }
      );
      fetchUsers(search);
      setModalUser(updatedUser);
    } catch (err) {
      console.error("Failed to toggle verification:", err);
      alert("Failed to change verification status.");
    }
  };

  return (
    <>
      {/* fixed: passed staff prop here */}
      <StaffNavigation setView={setView} currentView="staffUsers" staff={staff} />

      <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
        <header className="bg-[#CC0000] text-white pl-5 h-[50px] flex items-center">
          <h1 className="text-2xl font-semibold">Users (View‑only)</h1>
        </header>

        <div className="px-6 pt-6 flex flex-wrap items-center gap-4 justify-end">
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search name / email / ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border p-2 pr-10 w-[22rem] rounded-lg shadow-sm focus:outline-[#CC0000]"
              />
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#CC0000]"
              >
                <Search size={18} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => fetchUsers()}
              className="p-2 rounded-lg border hover:bg-gray-200 duration-100"
            >
              <RefreshCcw size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          <div className="border border-gray-300 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#CC0000] text-white">
                <tr>
                  {["#", "Name", "Email", "ID Number", "Role", "Verified", "Registered At", "View"].map(
                    (h) => (
                      <th key={h} className="p-3 whitespace-nowrap">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center p-4">Loading…</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-4">No users found.</td>
                  </tr>
                ) : (
                  users.map((u, i) => (
                    <tr key={u._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-3 text-center">{i + 1}</td>
                      <td className="p-3 text-center">{u.name}</td>
                      <td className="p-3 text-center">{u.email}</td>
                      <td className="p-3 text-center">{u.id_number}</td>
                      <td className="p-3 text-center capitalize">{u.role}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.verified ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {u.verified ? "Verified" : "Not Verified"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-center">
                        <Eye
                          size={18}
                          className="cursor-pointer hover:text-[#CC0000]"
                          onClick={() => setModalUser(u)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {modalUser && (
        <UserDetailsModal
          user={modalUser}
          onClose={() => setModalUser(null)}
          onToggleVerified={toggleVerified}
        />
      )}
    </>
  );
}

function UserDetailsModal({ user, onClose, onToggleVerified }) {
  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-[500px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center bg-[#CC0000] p-4 rounded-t-xl">
          <h2 className="text-lg font-semibold text-white">User Details</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X />
          </button>
        </div>
        <div className="p-6 space-y-3 text-sm">
          <p><span className="font-medium">Name:</span> {user.name}</p>
          <p><span className="font-medium">Email:</span> {user.email}</p>
          <p><span className="font-medium">ID Number:</span> {user.id_number}</p>
          <p><span className="font-medium">Role:</span> {user.role}</p>
          <p><span className="font-medium">Department:</span> {user.department || "—"}</p>
          {user.role !== "faculty" && (
            <>
              <p><span className="font-medium">Course:</span> {user.course || "—"}</p>
              <p><span className="font-medium">Year Level:</span> {user.yearLevel || "—"}</p>
            </>
          )}
          <p><span className="font-medium">Registered:</span> {user.created_at ? new Date(user.created_at).toLocaleString() : "—"}</p>
          <p>
            <span className="font-medium">Verified:</span>{" "}
            {user.verified ? (
              <span className="text-green-600">Verified</span>
            ) : (
              <span className="text-red-600">Not Verified</span>
            )}
          </p>
        </div>
        <div className="p-5 flex justify-between items-center">
          <button
            onClick={() => onToggleVerified(user)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${
              user.verified ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {user.verified ? (
              <>
                <XCircle size={16} /> Unverify
              </>
            ) : (
              <>
                <CheckCircle size={16} /> Verify
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default StaffUsers;
