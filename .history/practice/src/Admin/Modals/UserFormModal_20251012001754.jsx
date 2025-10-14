import React, { useState, useEffect } from "react";
import { X, User, Mail, IdCard, Shield, Building, GraduationCap, Layers } from "lucide-react";
import axios from "axios";

const courseOptions = {
  SHS: ["STEM", "ABM", "HUMSS"],
  CLASE: [
    // Undergraduate Programs
    "Bachelor of Arts in Communication",
    "Bachelor of Arts in Philosophy",
    "Bachelor of Arts in Political Science",
    "Bachelor of Science in Foreign Service",
    "Bachelor of Science in Psychology",
    "Bachelor of Science in Biology (Medical)",
    "Bachelor of Science in Biology (Biological)",
    "Bachelor of Science in Chemistry",
    "Bachelor of Science in Computer Science",
    "Bachelor of Science in Information Technology",
    "Bachelor of Library and Information Science",
    "Bachelor of Music in Music Education",
    "Bachelor of Music in Music Performance (Piano)",
    "Bachelor of Music in Music Performance (Voice)",
    "Bachelor of Elementary Education",
    "Bachelor of Science in Secondary Education (English)",
    "Bachelor of Science in Secondary Education (Filipino)",
    "Bachelor of Science in Secondary Education (Mathematics)",
    "Bachelor of Science in Secondary Education (Social Studies)",
    "Bachelor of Culture And Arts Education",
    "Bachelor of Special Need Education (Early Childhood Education)",
    // Graduate Programs - Master's
    "Master of Arts in Guidance and Counseling (MAGC)",
    "Master of Arts in Religious Studies (MARS)",
    "Master of Arts in Education - English",
    "Master of Arts in Education - Filipino",
    "Master of Arts in Education - Mathematics",
    "Master of Arts in Education - Natural Science",
    "Master of Arts in Education - Physics",
    "Master of Arts in Education - Religious Education",
    "Master of Arts in Education - Social Science",
    "Master of Arts in Education - Special Education",
    // Graduate Programs - PhD
    "Doctor of Philosophy in Education - Educational Management",
    "Doctor of Philosophy in Education - Psychology and Guidance",
    "Doctor of Philosophy in Education - Curriculum Development",
  ],
  CNND: [
    "Bachelor of Science in Nursing",
    "Bachelor of Science in Nutrition and Dietetics",
  ],
  CPMT: [
    "Bachelor of Science in Medical Laboratory Science",
    "Bachelor of Science in Pharmacy",
  ],
  COT: [
    "Bachelor of Science in Architecture",
    "Bachelor of Science in Landscape Architecture",
    "Bachelor of Science in Interior Design",
    "Bachelor of Science in Chemical Engineering",
    "Bachelor of Science in Civil Engineering",
    "Bachelor of Science in Computer Engineering",
    "Bachelor of Science in Electronics Engineering",
    "Bachelor of Science in Mechanical Engineering",
    "Bachelor of Fine Arts",
  ],
  COC: [
    "Bachelor of Science in Accountancy",
    "Bachelor of Science in Management Accounting",
    "Bachelor of Science in Business Administration (Financial Management)",
    "Bachelor of Science in Business Administration (Marketing Management)",
    "Bachelor of Science in Hospitality Management",
    "Bachelor of Science in Tourism Management (Certificate of Culinary Arts)",
    // Graduate Programs
    "Master of Business Administration (MBA) - General",
    "Master of Business Administration (MBA) - Marketing Management",
    "Master of Business Administration (MBA) - Financial Management",
    "Master of Business Administration (MBA) - Human Resource Management",
    "Master in Public Administration (MPA)",
  ],
  COL: [
    "Juris Doctor"
  ]
};

const floorOptions = ["Ground Floor", "Second Floor", "Third Floor"];

// Check if a course is a graduate program
const isGraduateProgram = (course) => {
  const graduateKeywords = ["Master", "Doctor", "MBA", "MPA", "MAGC", "MARS", "MAED"];
  return graduateKeywords.some(keyword => course.includes(keyword));
};

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
  const [otherDepartment, setOtherDepartment] = useState("");

  // Check if department is "Other" (for Faculty)
  const isOtherDepartment = form.department === "Other";

  useEffect(() => {
    if (user && user.department && !Object.keys(courseOptions).includes(user.department)) {
      setOtherDepartment(user.department);
      setForm(prev => ({ ...prev, department: "Other" }));
    }
  }, [user]);

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
      // Determine the final department value
      let finalDepartment = form.department;
      if (form.role === "Faculty" && form.department === "Other") {
        finalDepartment = otherDepartment;
      }

      const payload = {
        name: form.name,
        email: form.email,
        id_number: form.id_number,
        role: form.role,
        department: form.role === "Staff" ? "N/A" : finalDepartment || "N/A",
        course: form.role === "Student" ? form.course || "N/A" : "N/A",
        yearLevel: form.role === "Student" ? form.yearLevel || "N/A" : "N/A",
        floor: form.role === "Staff" ? form.floor || "N/A" : "N/A",
        password: form.password || undefined,
        verified: form.verified,
      };

      if (isEdit) {
        const formData = new FormData();
        for (let key in payload) {
          if (payload[key] !== undefined) formData.append(key, payload[key]);
        }
        if (form.profile) formData.append("profile", form.profile);
        await axios.put(
          `http://localhost:5000/api/users/edit/${user._id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else if (isAdd) {
        const formData = new FormData();
        for (let key in payload) {
          if (payload[key] !== undefined) formData.append(key, payload[key]);
        }
        if (form.profile) formData.append("profile", form.profile);
        await axios.post(
          "http://localhost:5000/api/users",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
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
                      <DetailItem icon={<GraduationCap size={16} />} label="Program" value={user.course} />
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
                  <option value="Staff_Office">Staff Office</option>
                </select>
              </div>

              {/* Department for Student, Faculty & Staff_Office */}
              {(form.role === "Student" || form.role === "Faculty" || form.role === "Staff_Office") && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    {form.role === "Staff_Office" ? "Office/Department" : "Department"}
                  </label>
                  {form.role === "Faculty" ? (
                    <>
                      <select
                        value={form.department}
                        onChange={(e) => handleChange("department", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select Department</option>
                        {Object.keys(courseOptions).map((dep) => (
                          <option key={dep} value={dep}>{dep}</option>
                        ))}
                        <option value="Other">Other</option>
                      </select>
                      {isOtherDepartment && (
                        <input
                          type="text"
                          value={otherDepartment}
                          onChange={(e) => setOtherDepartment(e.target.value)}
                          placeholder="Please specify your department"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 mt-2"
                          required
                        />
                      )}
                    </>
                  ) : form.role === "Student" ? (
                    <select
                      value={form.department}
                      onChange={(e) => handleChange("department", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select Department</option>
                      {Object.keys(courseOptions).map((dep) => (
                        <option key={dep} value={dep}>{dep}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={form.department}
                      onChange={(e) => handleChange("department", e.target.value)}
                      placeholder="Enter office/department (e.g., Registrar's Office)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  )}
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

              {/* Program for Student only */}
              {form.role === "Student" && form.department && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Program</label>
                  <select
                    value={form.course}
                    onChange={(e) => handleChange("course", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Program</option>
                    {courseOptions[form.department]?.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Year Level for Student only */}
              {form.role === "Student" && form.course && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Year Level</label>
                  <select
                    value={form.yearLevel}
                    onChange={(e) => handleChange("yearLevel", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Year Level</option>
                    {form.department === "SHS" ? (
                      <>
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12</option>
                      </>
                    ) : form.department === "COL" ? (
                      // COL year levels - 1st to 4th Year
                      <>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </>
                    ) : isGraduateProgram(form.course) ? (
                      // Graduate program year levels
                      <>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        {form.course.includes("Doctor") && (
                          <>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                          </>
                        )}
                      </>
                    ) : (
                      // Undergraduate program year levels
                      <>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </>
                    )}
                  </select>
                </div>
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