import React, { useState, useEffect } from "react";
import { X, User, Mail, IdCard, Shield, Building, GraduationCap, Layers } from "lucide-react";
import axios from "axios";

const courseOptions = {
  SHS: ["STEM", "ABM", "HUMSS"],
  CLASE: ["BA Communication", "BA Philosophy", "BS Foreign Service"],
  CITE: ["BSIT", "BSCS"],
};

const floorOptions = ["Ground Floor", "Second Floor", "Third Floor"];

export default function UserFormModal({ mode, user, onClose, onSuccess, onToggleVerified }) {
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

  useEffect(() => {
    if (form.role !== "Student") {
      setForm((f) => ({ ...f, course: "", yearLevel: "" }));
    }
    if (form.role !== "Staff") {
      setForm((f) => ({ ...f, floor: "" }));
    }
  }, [form.role]);

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
        password: form.password || undefined,
        verified: form.verified,
      };

      if (isEdit) {
        await axios.put(`http://localhost:5000/api/users/${user._id}`, payload);
      } else if (isAdd) {
        await axios.post("http://localhost:5000/api/users", payload);
      }

      onSuccess();
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center bg-gray-50 border-b px-6 py-4">
          <h2 className="text-lg font-medium text-gray-800 capitalize">
            {isView ? "User Details" : isEdit ? "Edit User" : "Add User"}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isView ? (
            <div className="space-y-4">
              <DetailItem icon={<User size={16} />} label="Name" value={user.name} />
              <DetailItem icon={<Mail size={16} />} label="Email" value={user.email} />
              <DetailItem icon={<IdCard size={16} />} label="ID Number" value={user.id_number} />
              <DetailItem icon={<Shield size={16} />} label="Role" value={user.role} />

              {user.role === "Staff" ? (
                <DetailItem icon={<Layers size={16} />} label="Assigned Floor" value={user.floor || "—"} />
              ) : (
                <>
                  <DetailItem icon={<Building size={16} />} label="Department" value={user.department} />
                  {user.role === "Student" && (
                    <>
                      <DetailItem icon={<GraduationCap size={16} />} label="Course" value={user.course} />
                      <DetailItem icon={<GraduationCap size={16} />} label="Year Level" value={user.yearLevel} />
                    </>
                  )}
                </>
              )}

              <div className="flex items-center gap-2 pt-2">
                <div className="w-4 h-4 rounded-full border flex items-center justify-center">
                  {user.verified && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                </div>
                <span className="text-sm text-gray-600">Verified</span>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => onToggleVerified(user)}
                  className={`px-4 py-2 text-sm rounded-md ${
                    user.verified 
                      ? "bg-gray-100 text-gray-700 border border-gray-200" 
                      : "bg-blue-50 text-blue-600 border border-blue-100"
                  }`}
                >
                  {user.verified ? "Unverify" : "Verify"}
                </button>
                <button 
                  onClick={onClose} 
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">ID Number</label>
                <input
                  value={form.id_number}
                  onChange={(e) => handleChange("id_number", e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Student">Student</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>

              {/* Department for Student & Faculty */}
              {form.role !== "Staff" && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Department</label>
                  <select
                    value={form.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    {Object.keys(courseOptions).map((dep) => (
                      <option key={dep}>{dep}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Assigned Floor for Staff */}
              {form.role === "Staff" && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Assigned Floor</label>
                  <select
                    value={form.floor}
                    onChange={(e) => handleChange("floor", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Floor</option>
                    {floorOptions.map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Course + Year Level for Student */}
              {form.role === "Student" && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Course</label>
                    <select
                      value={form.course}
                      onChange={(e) => handleChange("course", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select Course</option>
                      {courseOptions[form.department]?.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Year Level</label>
                    <select
                      value={form.yearLevel}
                      onChange={(e) => handleChange("yearLevel", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select Year Level</option>
                      {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((y) => (
                        <option key={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  {isEdit ? "New Password (optional)" : "Password"}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required={isAdd}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="verified"
                  checked={form.verified}
                  onChange={(e) => handleChange("verified", e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="verified" className="text-sm text-gray-700">
                  Verified
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// Reusable detail component
function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-1.5 bg-gray-100 rounded-full text-gray-600">
        {icon}
      </div>
      <div>
        <p className="text-xs font-normal text-gray-500">{label}</p>
        <p className="text-gray-800 font-medium text-sm">{value || "—"}</p>
      </div>
    </div>
  );
}