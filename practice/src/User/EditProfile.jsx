import React, { useEffect, useRef, useState, useCallback } from "react";
import api from "../utils/api";
import "react-image-crop/dist/ReactCrop.css";
import "../index.css";
import ReactCrop from "react-image-crop";

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

async function getCroppedBlob(image, crop, fileType = "image/jpeg", quality = 0.92) {
  if (!crop?.width || !crop?.height) {
    throw new Error("Invalid crop");
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const finalSize = 160;
  canvas.width = finalSize;
  canvas.height = finalSize;

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    finalSize,
    finalSize
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        blob.name = "cropped.jpeg";
        resolve(blob);
      },
      fileType,
      quality
    );
  });
}

function EditProfile({ user, setView }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    course: "",
    year_level: "",
    floor: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [image, setImage] = useState(null);
  const [tempImage, setTempImage] = useState(null);
  const [profileUrl, setProfileUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  // Image crop modal states
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [modalImgSrc, setModalImgSrc] = useState("");
  const [crop, setCrop] = useState({ unit: "px", width: 220, height: 220, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  const fetchUserProfile = async () => {
    try {
      const { data } = await api.get(`/users/${user._id}`);
      if (data.success) {
        setForm({
          name: data.user.name,
          email: data.user.email,
          department: data.user.department,
          course: data.user.course,
          year_level: data.user.year_level,
          floor: data.user.floor || ""
        });

        if (data.user.profilePicture) {
          setProfileUrl(data.user.profilePicture);
        }
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError("Failed to load profile.");
    }
  };

  useEffect(() => {
    fetchUserProfile();
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

  const openPhotoModal = () => {
    setError("");
    setSuccessMsg("");
    setCompletedCrop(null);
    setCrop({ unit: "px", width: 220, height: 220, aspect: 1 });
    setModalImgSrc("");
    setIsPhotoModalOpen(true);
  };

  const closePhotoModal = () => {
    setIsPhotoModalOpen(false);
    setModalImgSrc("");
    setCompletedCrop(null);
  };

  const onModalFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Max size is 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setModalImgSrc(reader.result.toString());
      setCompletedCrop(null);
    };
    reader.readAsDataURL(file);
  };

  const onImageLoaded = useCallback((img) => {
    imgRef.current = img;
    const { width, height } = img;
    const size = Math.min(width, height) * 0.8;
    const x = (width - size) / 2;
    const y = (height - size) / 2;
    setCrop({ unit: "px", width: size, height: size, x, y, aspect: 1 });
    return false;
  }, []);

  const onCropComplete = useCallback((crop) => {
    setCompletedCrop(crop);
  }, []);

  const handleSaveCropped = async () => {
    if (!imgRef.current || !completedCrop?.width || !completedCrop?.height) {
      setError("Please select a crop first.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccessMsg("");

      const blob = await getCroppedBlob(imgRef.current, completedCrop, "image/jpeg", 0.92);
      const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("profile", file);

      await api.post(`/users/upload-picture/${user._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMsg("Profile picture updated successfully.");
      await fetchUserProfile(); // Refresh profile data
      closePhotoModal();
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || "Failed to upload image. Max size is 5MB.");
    } finally {
      setUploading(false);
    }
  };

  const resetProfilePicture = async () => {
    try {
      setUploading(true);
      setError("");
      setSuccessMsg("");
      
      await api.delete(`/users/remove-picture/${user._id}`);
      setSuccessMsg("Profile picture reset to default.");
      await fetchUserProfile(); // Refresh profile data
    } catch (err) {
      console.error("Reset error:", err);
      setError(err.response?.data?.message || "Failed to reset profile picture.");
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
      // Use the correct endpoint and send only the user ID in the URL
      await api.put(`/users/${user._id}/update-profile`, form);
      setSuccessMsg("Profile updated successfully.");
      await fetchUserProfile(); // Refresh profile data
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || "Failed to update profile.");
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
      console.error("Password change error:", err);
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ml-[250px] w-[calc(100%-250px)] min-h-screen flex flex-col bg-gray-50">
      <header className=" text-black px-6 h-[60px] flex items-center justify-between shadow-sm">
        <h1 className="text-xl md:text-2xl font-bold tracking-wide">Edit Profile</h1>

        <button
                  type="button"
                  onClick={() => setView("profile")}
                  className="text-sm text-gray-500 hover:text-gray-700 transition flex items-center cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Profile
                </button>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* Left: Profile Picture Section */}
          <div className="w-full lg:w-1/3 flex flex-col items-center">
            <div className="w-full h-[27.5rem] bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Picture</h3>

              <div className="flex flex-col items-center">
                <div className="relative group mb-4">
                  <div className="relative w-[20rem] h-[20rem] rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default-avatar.png";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-400 to-red-600 text-white text-4xl font-semibold">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={openPhotoModal}
                    className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center focus:opacity-100 cursor-pointer"
                    aria-label="Change profile photo"
                  >
                    <div className="bg-white p-3 rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-gray-800"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-2 text-center">JPG or PNG, max 5MB</p>
              </div>
            </div>
          </div>

          {/* Right: Profile and Password Forms */}
          <div className="w-full lg:w-2/3 space-y-6">
            {/* Profile Information Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Account Information</h3>
                
              </div>

              {toastVisible && (error || successMsg) && (
                <div className="fixed bottom-0 left-[250px] w-[calc(100%-250px)] z-50 animate-slide-up">
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
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition"
                      required={user.role === "Student"}
                    >
                      <option value="">Select Department</option>
                      {Object.keys(courseOptions).map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
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
                          className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition"
                          required
                        >
                          <option value="">Select Course</option>
                          {(courseOptions[form.department] || []).map((course) => (
                            <option key={course} value={course}>
                              {course}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Year Level</label>
                        <select
                          name="year_level"
                          value={form.year_level}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition"
                          required
                        >
                          <option value="">Select Year</option>
                          {yearLevels.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {user.role === "Staff" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Floor Assignment</label>
                      <input
                        type="text"
                        name="floor"
                        value={form.floor}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition"
                      />
                    </div>
                  )}

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                    <div className="absolute top-9 right-3 group">
                      <svg
                        className="w-4 h-4 text-gray-400 cursor-pointer"
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
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-600 mb-1">ID Number</label>
                    <input
                      type="text"
                      value={user.id_number}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                    <div className="absolute top-9 right-3 group">
                      <svg
                        className="w-4 h-4 text-gray-400 cursor-pointer"
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
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2.5 px-8 rounded-lg font-medium transition-all disabled:opacity-50 flex items-center shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Password Change Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
              <h4 className="text-lg font-semibold border-b border-gray-100 pb-3 mb-6">Change Password</h4>

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
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-2.5 px-8 rounded-lg font-medium transition-all disabled:opacity-50 flex items-center shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Crop Modal */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 ">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800">Edit Profile Picture</h3>
              <button
                onClick={closePhotoModal}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 cursor-pointer" 
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onModalFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={resetProfilePicture}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove Photo
                </button>
              </div>

              {/* Crop Area */}
              <div className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 transition-all duration-300 hover:border-red-300">
                {modalImgSrc ? (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="relative w-full max-h-[60vh] overflow-hidden rounded-lg">
                      <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        onComplete={onCropComplete}
                        aspect={1}
                        circularCrop
                        className="rounded-lg shadow-inner"
                        ruleOfThirds
                      >
                        <img
                          src={modalImgSrc}
                          alt="Profile picture to crop"
                          onLoad={(e) => onImageLoaded(e.currentTarget)}
                          className="max-h-[60vh] w-auto object-contain rounded-lg"
                        />
                      </ReactCrop>
                    </div>
                    <p className="text-sm text-gray-500 text-center">
                      Drag to adjust crop area • Pinch or scroll to zoom
                    </p>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center space-y-3 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-lg font-medium">No photo selected</p>
                    <p className="text-sm max-w-md text-center">
                      Upload a photo to crop your profile picture. JPG or PNG, max 5MB.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <button 
                onClick={closePhotoModal}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCropped}
                disabled={uploading || !modalImgSrc || !completedCrop?.width}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                  uploading || !modalImgSrc || !completedCrop?.width
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-md hover:shadow-lg"
                }`}
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin  h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
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
        className={`w-full px-3 py-2 border border-gray-200 rounded-md ${
          disabled ? "bg-gray-100" : "bg-gray-50"
        } focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition disabled:cursor-not-allowed`}
      />
      {note && <p className="text-xs text-gray-500 mt-1">{note}</p>}
    </div>
  );
}

export default EditProfile;