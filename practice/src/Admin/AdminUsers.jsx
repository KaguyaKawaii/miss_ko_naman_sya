import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {
  Search,
  RefreshCcw,
  Eye,
  Pencil,
  Trash2,
  X,
  UserPlus,
  CheckCircle,
  XCircle,
} from "lucide-react";
import AdminNavigation from "./AdminNavigation";

const socket = io("http://localhost:5000");

const courseOptions = {
  SHS: ["STEM", "ABM", "GAS"],
  CLASE: ["BS Psych", "BA Communication"],
  CNND: ["BS Nursing"],
  CPMT: ["BS MedTech"],
  COT: ["BS Tourism"],
  COC: ["BS Crim"],
};

const floorOptions = ["Ground Floor", "2nd Floor", "4th Floor", "5th Floor"];

function AdminUsers({ setView }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState({ type: null, user: null });

  const closeModal = () => setModal({ type: null, user: null });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    socket.on("user-updated", (updatedUserId) => {
      fetchUsers();
    });
    return () => {
      socket.off("user-updated");
    };
  }, []);

  const fetchUsers = async (term = "") => {
    setIsLoading(true);
    try {
      const params = term ? { q: term } : {};
      const usersRes = await axios.get(
        "http://localhost:5000/api/users",
        { params }
      );
      setUsers(usersRes.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      alert("Failed to fetch users.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVerified = async (user) => {
    try {
      const endpoint = `http://localhost:5000/api/users/${user._id}`;


      await axios.patch(endpoint, {
        verified: !user.verified,
      });

      fetchUsers(search);

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


  return (
    <>
      <AdminNavigation setView={setView} currentView="adminUsers" />

      {/* ---------- Page ---------- */}
      <main className="ml-[250px] w-[calc(100%-250px)] h-screen flex flex-col">
        {/* Header */}
        <header className="bg-[#CC0000] text-white pl-5 h-[50px] flex items-center">
          <h1 className="text-2xl font-semibold">User Management</h1>
        </header>

        {/* Toolbar */}
        <div className="px-6 pt-6 flex flex-wrap items-center gap-4">
          <button
            onClick={() => setModal({ type: "add", user: null })}
            className="bg-[#CC0000] text-white px-4 py-2 rounded-lg hover:bg-[#990000] flex items-center gap-2 cursor-pointer duration-100"
          >
            <UserPlus size={18} /> Add User
          </button>

          <div className="flex-grow" />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchUsers(search);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search name / email / ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border p-2 pr-10 w-[25rem] rounded-lg shadow-sm focus:outline-[#CC0000]"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#CC0000] cursor-pointer"
              >
                <Search size={18} />
              </button>
            </div>

            {/* Reset */}
            <button
              type="button"
              onClick={() => {
                setSearch("");
                fetchUsers();
              }}
              className="p-2 rounded-lg border hover:bg-gray-200 duration-100 cursor-pointer"
            >
              <RefreshCcw size={18} />
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          <div className="border border-gray-300 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#CC0000] text-white">
                <tr>
                  {[
                    "#",
                    "Name",
                    "Email",
                    "ID Number",
                    "Role",
                    "Verified",
                    "Registered At",
                    "Actions",
                  ].map((h) => (
                    <th key={h} className="p-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center p-4">
                      Loading…
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-4">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u, i) => (
                    <tr
                      key={u._id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="p-3 text-center">{i + 1}</td>
                      <td className="p-3 text-center">{u.name}</td>
                      <td className="p-3 text-center">{u.email}</td>
                      <td className="p-3 text-center">{u.id_number}</td>
                      <td className="p-3 text-center capitalize">{u.role}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.verified
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {u.verified ? "Verified" : "Not Verified"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>

                      {/* ---------- Row actions ---------- */}
                      <td className="p-3 flex items-center justify-center gap-3">
                        {/* View / Edit / Delete */}
                        <Eye
                          size={18}
                          className="cursor-pointer hover:text-[#CC0000]"
                          onClick={() =>
                            setModal({ type: "view", user: u })
                          }
                        />
                        <Pencil
                          size={18}
                          className="cursor-pointer hover:text-[#CC0000]"
                          onClick={() =>
                            setModal({ type: "edit", user: u })
                          }
                        />
                        <Trash2
                          size={18}
                          className="cursor-pointer text-red-600 hover:text-red-800"
                          onClick={() =>
                            setModal({ type: "confirmDelete", user: u })
                          }
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

      {/* ---------- Modals ---------- */}
      {modal.type === "confirmDelete" && (
        <ConfirmDeleteModal
          user={modal.user}
          onClose={closeModal}
          onSuccess={() => {
            fetchUsers(search);
            closeModal();
          }}
        />
      )}

      {["view", "edit", "add"].includes(modal.type) && (
        <UserFormModal
          mode={modal.type}
          user={modal.user}
          onClose={closeModal}
          onSuccess={() => {
            fetchUsers(search);
            closeModal();
          }}
          onToggleVerified={toggleVerified}
        />
      )}
    </>
  );
}

function ConfirmDeleteModal({ user, onClose, onSuccess }) {
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  const confirmAndDelete = async () => {
  if (confirmation !== "DELETE") {
    setError('You must type "DELETE" to confirm.');
    return;
  }
  setWorking(true);
  try {
    const endpoint = `http://localhost:5000/api/users/${user._id}`;

    await axios.delete(endpoint);
    onSuccess();
  } catch (err) {
    setError("Server error while deleting.");
  } finally {
    setWorking(false);
  }
};


  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl w-[400px]">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 text-center">
          Delete User
        </h3>

        <p className="text-sm text-gray-700 mb-5 leading-relaxed">
          Are you sure you want to delete <strong>{user.name}</strong>?<br />
          Please type <strong>DELETE</strong> below to confirm.
        </p>

        <input
          type="text"
          placeholder='Type "DELETE"'
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          className="border border-gray-300 w-full p-3 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <div className="flex justify-end gap-3 pt-1">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-150 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={confirmAndDelete}
            disabled={working}
            className="px-5 py-2 bg-[#CC0000] text-white rounded-lg hover:bg-red-600 transition duration-150 disabled:opacity-60 cursor-pointer"
          >
            {working ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function UserFormModal({
  mode,
  user,
  onClose,
  onSuccess,
  onToggleVerified,
}) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const [form, setForm] = useState(
    user || {
      name: "",
      email: "",
      id_number: "",
      role: "Student",
      department: "",
      course: "",
      yearLevel: "",
      floor: "",
      password: "",
      verified: false,
    }
  );
  const [saving, setSaving] = useState(false);

  /* Sync dropdowns */
  useEffect(() => {
    if (form.role !== "Student") {
      setForm((f) => ({ ...f, course: "", yearLevel: "" }));
    }
    if (form.role !== "Staff") {
      setForm((f) => ({ ...f, floor: "" }));
    }
  }, [form.role]);

  useEffect(() => {
    if (
      form.role === "Student" &&
      form.department &&
      !courseOptions[form.department]?.includes(form.course)
    ) {
      setForm((f) => ({ ...f, course: "" }));
    }
  }, [form.department]);

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);
  try {
    const payload = {
      name: form.name,
      email: form.email,
      id_number: form.id_number,
      role: form.role,
      department: form.role === "Staff" ? "N/A" : form.department || "N/A",
      course: form.role === "Student" ? form.course || "N/A" : "N/A",
      yearLevel: form.role === "Student" ? form.yearLevel || "N/A" : "N/A",
      floor: form.role === "Staff" ? form.floor || "N/A" : "N/A",
      password: form.password || undefined, // omit empty on edit
      verified: form.verified,
    };

    if (isEdit) {
  await axios.put(`http://localhost:5000/api/users/${user._id}`, payload);
} else if (isAdd) {
  await axios.post("http://localhost:5000/api/users", payload);
}


    onSuccess();
  } catch (err) {
    console.error("Save failed:", err);
    alert("Save failed: " + (err.response?.data?.message || err.message));
  } finally {
    setSaving(false);
  }
};

  /* ---------------------------- Render ---------------------------- */
  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-[600px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center bg-red-700 p-4 rounded-t-xl">
          <h2 className="text-xl font-semibold text-white capitalize">
            {isView
              ? "User Details"
              : isEdit
              ? "Edit User"
              : "Add User"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-red-300 duration-150 cursor-pointer"
          >
            <X />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* ---------- VIEW ---------- */}
          {isView ? (
            <>
              <div className="space-y-3 text-sm mb-6">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {user.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {user.email}
                </p>
                <p>
                  <span className="font-medium">ID Number:</span>{" "}
                  {user.id_number}
                </p>
                <p>
                  <span className="font-medium">Role:</span>{" "}
                  {user.role}
                </p>
                {user.role === "Staff" ? (
  <p>
    <span className="font-medium">Assigned Floor:</span>{" "}
    {user.floor || "—"}
  </p>
) : (
  <>
    <p>
      <span className="font-medium">Department:</span>{" "}
      {user.department || "—"}
    </p>
    {user.role === "Student" && (
      <>
        <p>
          <span className="font-medium">Course:</span>{" "}
          {user.course || "—"}
        </p>
        <p>
          <span className="font-medium">Year Level:</span>{" "}
          {user.yearLevel || "—"}
        </p>
      </>
    )}
  </>
)}

                <p>
                  <span className="font-medium">Created At:</span>{" "}
                  {user.created_at ? new Date(user.created_at).toLocaleString() : "—"}
                </p>
                <p>
                  <span className="font-medium">Verified:</span>{" "}
                  {user.verified ? (
                    <span className="text-green-600">Verified</span>
                  ) : (
                    <span className="text-red-600">
                      Not Verified
                    </span>
                  )}
                </p>
              </div>

              {/* Verify / Unverify button */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => onToggleVerified(user)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-white cursor-pointer duration-100 ${
                    user.verified
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
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
                  className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-100 duration-150 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </>
          ) : (
            /* ---------- ADD / EDIT ---------- */
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 text-sm"
            >
              {/* Basic info */}
              <input
                value={form.name}
                onChange={(e) =>
                  handleChange("name", e.target.value)
                }
                placeholder="Name"
                required
                className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                value={form.email}
                onChange={(e) =>
                  handleChange("email", e.target.value)
                }
                placeholder="Email (@usa.edu.ph)"
                required
                className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                value={form.id_number}
                onChange={(e) =>
                  handleChange("id_number", e.target.value)
                }
                placeholder="ID Number"
                required
                className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              {/* Role */}
              <select
                value={form.role}
                onChange={(e) =>
                  handleChange("role", e.target.value)
                }
                className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option>Student</option>
                <option>Faculty</option>
                <option>Staff</option>
              </select>

              {/* Department or Floor assignment based on role */}
              {form.role === "Staff" ? (
                <select
                  value={form.floor}
                  onChange={(e) =>
                    handleChange("floor", e.target.value)
                  }
                  className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Assign Floor</option>
                  {floorOptions.map((floor) => (
                    <option key={floor}>{floor}</option>
                  ))}
                </select>
              ) : (
                <>
                  <select
                    value={form.department}
                    onChange={(e) =>
                      handleChange("department", e.target.value)
                    }
                    className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select Department</option>
                    {Object.keys(courseOptions).map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>

                  {/* Course & year (Students only) */}
                  {form.role === "Student" && (
                    <>
                      <select
                        value={form.course}
                        onChange={(e) =>
                          handleChange("course", e.target.value)
                        }
                        className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Select Course</option>
                        {courseOptions[form.department]?.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>

                      <select
                        value={form.yearLevel}
                        onChange={(e) =>
                          handleChange("yearLevel", e.target.value)
                        }
                        className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Select Year</option>
                        {(form.department === "SHS"
                          ? ["Grade 11", "Grade 12"]
                          : [
                              "1st Year",
                              "2nd Year",
                              "3rd Year",
                              "4th Year",
                            ]
                        ).map((y) => (
                          <option key={y}>{y}</option>
                        ))}
                      </select>
                    </>
                  )}
                </>
              )}

              {/* Password (optional on edit) */}
              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  handleChange("password", e.target.value)
                }
                placeholder={
                  isEdit
                    ? "New password (optional)"
                    : "Password (min 8 char)"
                }
                className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required={isAdd}
              />

              {/* Verified checkbox */}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.verified}
                  onChange={(e) =>
                    handleChange("verified", e.target.checked)
                  }
                />
                <span>Verified</span>
              </label>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-100 duration-150 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#CC0000] text-white px-5 py-2 rounded-lg hover:bg-red-600 duration-150 cursor-pointer"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;