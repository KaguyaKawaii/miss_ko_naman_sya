import React, { useEffect, useState } from "react";
import api from "../utils/api";
import '../index.css';

const courseOptions = {
  SHS: ["STEM", "ABM", "HUMSS"],
  CLASE: [
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
  ],
  CNND: ["Bachelor of Science in Nursing", "Bachelor of Science in Nutrition and Dietetics"],
  CPMT: ["Bachelor of Science in Medical Laboratory Science", "Bachelor of Science in Pharmacy"],
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
  ],
};

const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

function EditProfile({ user, setView }) {
  const [form, setForm] = useState({
    name: "",
    department: "",
    course: "",
    year_level: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [image, setImage] = useState(null);
  const [tempImage, setTempImage] = useState(null); // For preview before upload
  const [profileUrl, setProfileUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get(`/users/${user._id}`);
        setForm({
          name: data.name,
          department: data.department,
          course: data.course,
          year_level: data.year_level,
        });
        if (data.profilePicture) {
          setProfileUrl(data.profilePicture);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      }
    };
    fetchUser();
  }, [user]);

  useEffect(() => {
  if (error || successMsg) {
    setToastVisible(true);
    const timer = setTimeout(() => setToastVisible(false), 2000);
    return () => clearTimeout(timer);
  }
}, [error, successMsg]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create temporary URL for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setTempImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetProfilePicture = async () => {
    try {
      setUploading(true);
      setError("");
      setSuccessMsg("");
      
      await api.delete(`/users/remove-picture/${user._id}`);
      setProfileUrl("");
      setTempImage(null);
      setImage(null);
      setSuccessMsg("Profile picture reset to default.");
    } catch (err) {
      console.error(err);
      setError("Failed to reset profile picture.");
    } finally {
      setUploading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      await api.put("/users/update-profile", {
        userId: user._id,
        ...form,
      });
      setSuccessMsg("Profile updated successfully.");
      // Refresh user data after update
      const { data } = await api.get(`/users/${user._id}`);
      setForm({
        name: data.name,
        department: data.department,
        course: data.course,
        year_level: data.year_level,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    try {
      await api.put(`/users/change-password/${user._id}`, {
        oldPassword,
        newPassword,
      });
      setSuccessMsg("Password changed successfully.");
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  const uploadProfilePicture = async () => {
    if (!image) return setError("No file selected.");

    const formData = new FormData();
    formData.append("profile", image);

    setUploading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await api.post(`/users/upload-picture/${user._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccessMsg("Profile picture updated successfully.");
      setProfileUrl(res.data.profilePicture);
      setTempImage(null); // Clear temp image after successful upload
      setImage(null);
    } catch (err) {
      console.error(err);
      setError("Failed to upload image. Max size is 5MB.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen flex flex-col bg-gray-50">
      <header className="bg-[#CC0000] text-white px-6 h-[50px] flex items-center shadow-md">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* Left: Profile Picture Section */}
          <div className="w-full lg:w-1/3 flex flex-col items-center">
            <div className="w-full bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Picture</h3>
              
              <div className="flex flex-col items-center">
                <div className="relative group mb-4">
  <div className="relative group mb-4">
  {/* Profile Image with Fallback */}
  <div className="relative w-40 h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
    {tempImage || profileUrl ? (
  <img
    src={tempImage || `http://localhost:5000${profileUrl}`}
    alt=""
    className="w-full h-full object-cover"
    onError={(e) => {
      e.target.onerror = null;
      e.target.src = "/default-avatar.png";
    }}
  />
) : (
  <div className="w-full h-full flex items-center justify-center bg-red-400 text-white text-4xl font-semibold">
    {user?.name?.charAt(0).toUpperCase()}
  </div>
)}
   
  </div>

  

  {/* Hover Overlay with Camera Icon */}
  <div className="absolute inset-0 bg-red-300/25 bg-opacity-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
    <div className="bg-white bg-opacity-90 p-3 rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-300">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </div>
  </div>
</div>
</div>

                <div className="w-full space-y-2">
                  <label className="block">
                    <div className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-center cursor-pointer hover:from-red-700 hover:to-red-800 transition shadow-sm">
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                  </label>

                  <button
                    onClick={uploadProfilePicture}
                    disabled={uploading || !image}
                    className={`w-full py-2 px-4 rounded-md text-white font-medium transition shadow-sm ${
                      uploading || !image 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                    }`}
                  >
                    {uploading ? "Uploading..." : "Upload Picture"}
                  </button>

                  <button
                    onClick={resetProfilePicture}
                    disabled={uploading || (!profileUrl && !tempImage)}
                    className={`w-full py-2 px-4 rounded-md font-medium transition shadow-sm ${
                      uploading || (!profileUrl && !tempImage)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Reset to Default
                  </button>
                </div>

                {uploading && (
                  <div className="w-full mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full animate-pulse w-3/4"></div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-4 text-center">
                  Max size of 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Right: Profile and Password Forms */}
          <div className="w-full lg:w-2/3 space-y-6">
            {/* Profile Information Form */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Account Information</h3>
                <button
                  type="button"
                  onClick={() => setView("profile")}
                  className="text-sm text-gray-500 hover:text-gray-700 transition flex items-center cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Profile
                </button>
              </div>

{toastVisible && (error || successMsg) && (
  <div className="fixed bottom-0  left-[250px] w-[calc(100%-250px)] z-50 animate-slide-up">
    <div
      className={`w-full text-center py-4 font-medium text-white ${
        error ? "bg-red-600" : "bg-green-600"
      }`}
    >
      {error || successMsg}
    </div>
  </div>
)}




              <form onSubmit={handleProfileSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Full Name" name="name" value={form.name} onChange={handleChange} required />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Department</label>
                    <select
                      name="department"
                      value={form.department}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-red-500 transition"
                      required={user.role === "Student"}
                    >
                      <option value="">Select Department</option>
                      {Object.keys(courseOptions).map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  {user.role === "Student" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Course</label>
                        <select
                          name="course"
                          value={form.course}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-red-500 transition"
                          required
                        >
                          <option value="">Select Course</option>
                          {(courseOptions[form.department] || []).map((course) => (
                            <option key={course} value={course}>{course}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Year Level</label>
                        <select
                          name="year_level"
                          value={form.year_level}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-red-500 transition"
                          required
                        >
                          <option value="">Select Year</option>
                          {yearLevels.map((y) => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="relative">
  <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
  <input
    type="email"
    value={user.email}
    disabled
    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
  />

  {/* Question Mark Icon with Tooltip */}
  <div className="absolute top-9 right-3 group">
    <svg
      className="w-4 h-4 text-gray-400 bg-gray-200 rounded-full cursor-pointer"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.228 9a3.75 3.75 0 117.521.75c-.269.954-1.085 1.455-1.749 2.007-.73.607-.96.999-.96 1.743M12 17h.01"
      />
    </svg>
    <div className="absolute z-10 left-1/2 transform -translate-x-1/2 mt-1 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      Contact admin to change your email
    </div>
  </div>

  <p className="text-xs text-gray-500 mt-1 italic">Cannot edit email</p>
</div>

                  <div className="relative">
  <label className="block text-sm font-medium text-gray-600 mb-1">ID Number</label>
  <input
    type="text"
    value={user.id_number}
    disabled
    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
  />

  {/* Question Mark Icon with Tooltip */}
  <div className="absolute top-9 right-3 group">
    <svg
      className="w-4 h-4 text-gray-400 bg-gray-200 rounded-full cursor-pointer"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.228 9a3.75 3.75 0 117.521.75c-.269.954-1.085 1.455-1.749 2.007-.73.607-.96.999-.96 1.743M12 17h.01"
      />
    </svg>
    <div className="absolute z-10 left-1/2 transform -translate-x-1/2 mt-1 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      Contact admin to change your ID number
    </div>
  </div>

  <p className="text-xs text-gray-500 mt-1 italic">Cannot edit ID Number</p>
</div>

                </div>

                <div className="flex justify-end mt-8">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2 px-8 rounded-md font-medium transition disabled:opacity-50 flex items-center shadow-sm cursor-pointer"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>

            {/* Password Change Form */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h4 className="text-lg font-semibold border-b border-gray-200 pb-3 mb-6">Change Password</h4>
              
              <form onSubmit={handlePasswordSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Old Password" 
                    name="oldPassword" 
                    type="password" 
                    value={passwordForm.oldPassword} 
                    onChange={handlePasswordChange} 
                    required
                  />
                  <Input 
                    label="New Password" 
                    name="newPassword" 
                    type="password" 
                    value={passwordForm.newPassword} 
                    onChange={handlePasswordChange} 
                    required
                  />
                  <Input 
                    label="Confirm New Password" 
                    name="confirmPassword" 
                    type="password" 
                    value={passwordForm.confirmPassword} 
                    onChange={handlePasswordChange} 
                    required
                  />
                </div>

                <div className="flex justify-end mt-8">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2 px-8 rounded-md font-medium transition disabled:opacity-50 flex items-center shadow-sm cursor-pointer"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : "Change Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Input({ label, name, value, onChange, disabled, type = "text", note, required = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full px-3 py-2 border ${disabled ? 'bg-gray-100' : 'bg-gray-50'} border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 transition disabled:cursor-not-allowed`}
      />
      {note && <p className="text-xs text-gray-500 mt-1">{note}</p>}
    </div>
  );
}

export default EditProfile;