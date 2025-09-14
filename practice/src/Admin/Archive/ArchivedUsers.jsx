import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavigation from "../AdminNavigation";

function AdminArchivedUsers({ setView }) {
  const [archivedUsers, setArchivedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch archived users
  const fetchArchivedUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/users/archived");
      setArchivedUsers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch archived users:", err);
      alert("Failed to load archived users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchivedUsers();
  }, []);

  // ✅ Restore user
  const handleRestore = async (id) => {
    if (!window.confirm("Restore this user?")) return;
    try {
      await axios.put(`http://localhost:5000/api/users/restore/${id}`);
      alert("User restored successfully.");
      fetchArchivedUsers();
    } catch (err) {
      console.error("Failed to restore user:", err);
      alert("Failed to restore user.");
    }
  };

  // ✅ Permanently delete user
  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this user? This cannot be undone.")) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/archived/${id}`);
      alert("User permanently deleted.");
      fetchArchivedUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete user.");
    }
  };

  return (
    <>
      <AdminNavigation setView={setView} currentView="adminArchivedUsers" />
      <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen bg-gray-50">
        <header className="bg-white px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-[#CC0000]">Archived Users</h1>
          <p className="text-gray-600">View and manage archived user accounts</p>
        </header>
        <div className="p-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[calc(100vh-180px)] overflow-y-auto">
            {loading ? (
              <p className="text-gray-500">Loading archived users...</p>
            ) : archivedUsers.length === 0 ? (
              <p className="text-gray-500">No archived users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="p-3 text-left">ID Number</th>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Role</th>
                      <th className="p-3 text-left">Department</th>
                      <th className="p-3 text-left">Course</th>
                      <th className="p-3 text-left">Year</th>
                      <th className="p-3 text-left">Archived On</th>
                      <th className="p-3 text-left">Actions</th>

                      


                    </tr>
                  </thead>
                  <tbody>
                    {archivedUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="p-3 text-gray-700">{user.id_number}</td>
                        <td className="p-3 font-medium text-gray-800">{user.name}</td>
                        <td className="p-3">{user.email}</td>
                        <td className="p-3">{user.role}</td>
                        <td className="p-3">{user.department || "—"}</td>
                        <td className="p-3">{user.course || "—"}</td>
                        <td className="p-3">{user.year_level || "—"}</td>
                        <td className="p-3">
                          {user.archivedAt
                            ? new Date(user.archivedAt).toLocaleDateString("en-PH", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleRestore(user._id)}
                            className="text-[#CC0000] hover:underline mr-3"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="text-gray-600 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default AdminArchivedUsers;
