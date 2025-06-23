// SignUp_User.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Eye, EyeOff, CheckCircle, Loader2 } from "lucide-react";
import Logo from "../assets/logo.png";

function SignUp_User({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    id_number: "",
    password: "",
    confirmPassword: "",
    role: "",
    department: "",
    course: "",
    year_level: "",
  });

  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [message, setMessage] = useState("");
  const [messageClass, setMessageClass] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendTimerActive, setResendTimerActive] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

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
    ],
  };

  useEffect(() => {
    if (message) {
      setMessageClass("animate-shake");
      const t = setTimeout(() => {
        setMessage("");
        setMessageClass("");
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  useEffect(() => {
    let t;
    if (resendTimerActive && resendCooldown > 0) {
      t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    } else if (resendCooldown === 0) {
      setResendTimerActive(false);
    }
    return () => clearTimeout(t);
  }, [resendCooldown, resendTimerActive]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "role") {
      setFormData((p) => ({
        ...p,
        role: value,
        department: "",
        course: "",
        year_level: "",
      }));
      return;
    }
    if (name === "department") {
      setFormData((p) => ({
        ...p,
        department: value,
        course: "",
        year_level: "",
      }));
      return;
    }
    setFormData((p) => ({ ...p, [name]: value }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("");

  if (!formData.email.endsWith("@usa.edu.ph"))
    return setMessage("Email must end with @usa.edu.ph");
  if (formData.password.length < 8)
    return setMessage("Password must be at least 8 characters");
  if (formData.password !== formData.confirmPassword)
    return setMessage("Passwords do not match");
  if (!formData.role) return setMessage("Please select an account role");
  if (!formData.department) return setMessage("Please select a department");
  if (
    formData.role === "Student" &&
    (!formData.course || !formData.year_level)
  )
    return setMessage("Program and Year Level are required for students");

  try {
    setLoading(true);
    const payload = {
  ...formData,
  course: formData.role === "Student" ? formData.course : "N/A",
  year_level: formData.role === "Student" ? formData.year_level : "N/A",
};


    await axios.post("http://localhost:5000/api/auth/signup", payload);

    setMessage("OTP sent to your email.");
    setOtpSent(true);
    setResendCooldown(60);
    setResendTimerActive(true);
  } catch (err) {
    setMessage(err.response?.data?.message || "Signup failed. Try again.");
  } finally {
    setLoading(false);
  }
};


  const handleOtpVerify = async () => {
    if (!otp) return setMessage("Please enter the OTP");

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/verify-otp", {
        email: formData.email,
        otp,
      });

      setTimeout(() => {
        setLoading(false);
        setSuccessModal(true);
      }, 2000);
    } catch (err) {
      setLoading(false);
      setMessage(err.response?.data?.message || "OTP verification failed.");
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/auth/resend-otp", {
        email: formData.email,
      });
      setMessage("OTP resent successfully.");
      setResendCooldown(60);
      setResendTimerActive(true);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    setSuccessModal(false);
    onSwitchToLogin();
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-8">
      {/* full‑screen spinner when loading */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
          <Loader2 size={64} className="text-white animate-spin" />
          <p className="mt-4 text-white text-lg font-semibold">Verifying…</p>
        </div>
      )}

      <div className="w-full max-w-md flex flex-col items-center gap-4 py-8">
        {/* floating toast */}
        {message && (
          <div
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 ${messageClass}`}
          >
            <p className="bg-[#CC0000] text-white font-semibold px-6 py-3 rounded-xl border border-red-700 shadow-lg">
              {message}
            </p>
          </div>
        )}

        {/* logo & header */}
        <img src={Logo} alt="USA logo" className="h-32 w-32" />
        <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-center">
          University of San Agustin
        </h1>
        <p className="text-lg sm:text-xl font-semibold text-gray-700 text-center">
          Learning Resource Center
        </p>

        {/* ---------- SIGN UP vs OTP ---------- */}
        {!otpSent ? (
          /* ======= SIGN‑UP FORM ======= */
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 w-full mt-4"
          >
            <h2 className="text-xl sm:text-2xl font-semibold text-center">
              Sign Up
            </h2>

            {/* Full name */}
            <label className="text-sm font-semibold block">
              Full Name
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="border p-3 w-[450px] rounded-lg hover:border-[#CC0000] outline-none focus:border-[#CC0000] focus:ring-[#CC0000] focus:ring-1 duration-100"
                required
              />
            </label>

            {/* Email */}
            <label className="text-sm font-semibold block">
              Email (@usa.edu.ph)
              <input
                type="email"
                name="email"
                placeholder="e.g. juandelacruz@usa.edu.ph"
                value={formData.email}
                onChange={handleChange}
                className="border p-3 w-[450px] rounded-lg hover:border-[#CC0000] outline-none focus:border-[#CC0000] focus:ring-[#CC0000] focus:ring-1 duration-100"
                required
              />
            </label>

            {/* ID number */}
            <label className="text-sm font-semibold block">
              ID Number
              <input
                type="text"
                name="id_number"
                placeholder="Enter your ID number"
                maxLength={15}
                value={formData.id_number}
                onChange={(e) => {
                  const input = e.target.value;
                  // Only allow digits and max 15 characters
                  if (/^\d{0,15}$/.test(input)) {
                    handleChange(e);
                  }
                }}
                className="border p-3 w-[450px] rounded-lg hover:border-[#CC0000] outline-none focus:border-[#CC0000] focus:ring-[#CC0000] focus:ring-1 duration-100"
                required
              />
            </label>


            {/* Account role */}
            <label className="text-sm font-semibold block">
              Account Role
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="border p-3 w-[450px] rounded-lg hover:border-[#CC0000] outline-none focus:border-[#CC0000] focus:ring-[#CC0000] focus:ring-1 duration-100"
                required
              >
                <option value="">Select Role</option>
                <option value="Student">Student</option>
                <option value="Faculty">Faculty</option>
              </select>
            </label>

            {/* Department */}
            {formData.role && (
              <label className="text-sm font-semibold block">
                Department
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="border p-3 w-[450px] rounded-lg hover:border-[#CC0000] outline-none focus:border-[#CC0000] focus:ring-[#CC0000] focus:ring-1 duration-100"
                  required
                >
                  <option value="">Select Department</option>
                  {Object.keys(courseOptions).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {/* Student‑specific */}
            {formData.role === "Student" && formData.department && (
              <>
                <label className="text-sm font-semibold block">
                  Program
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    className="border p-3 w-[450px] rounded-lg hover:border-[#CC0000] outline-none focus:border-[#CC0000] focus:ring-[#CC0000] focus:ring-1 duration-100"
                    required
                  >
                    <option value="">Select Program</option>
                    {courseOptions[formData.department]?.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-semibold block">
                  Year Level
                  <select
                    name="year_level"
                    value={formData.year_level}
                    onChange={handleChange}
                    className="border p-3 w-[450px] rounded-lg hover:border-[#CC0000] outline-none focus:border-[#CC0000] focus:ring-[#CC0000] focus:ring-1 duration-100"
                    required
                  >
                    <option value="">Select Year Level</option>
                    {formData.department === "SHS" ? (
                      <>
                        <option value="Grade 11">Grade 11</option>
                        <option value="Grade 12">Grade 12</option>
                      </>
                    ) : (
                      <>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </>
                    )}
                  </select>
                </label>
              </>
            )}

            {/* Password */}
            <label className="text-sm font-semibold block">
              Password
              <div className="relative mt-1">
                <input
                  type={showPw ? "text" : "password"}
                  name="password"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="border p-3 w-[450px] rounded-lg hover:border-[#CC0000] outline-none focus:border-[#CC0000] focus:ring-[#CC0000] focus:ring-1 duration-100"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#CC0000] cursor-pointer duration-100"
                >
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </label>

            {/* Confirm password */}
            <label className="text-sm font-semibold block">
              Confirm Password
              <div className="relative mt-1">
                <input
                  type={showPw2 ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Re‑enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="border p-3 w-[450px] rounded-lg hover:border-[#CC0000] outline-none focus:border-[#CC0000] focus:ring-[#CC0000] focus:ring-1 duration-100"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw2((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#CC0000] cursor-pointer  duration-100"
                >
                  {showPw2 ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#FFCC00] text-white p-3 rounded-lg hover:bg-[#e6b800] font-semibold cursor-pointer duration-150"
            >
              {loading ? "Please wait…" : "Sign Up"}
            </button>
          </form>
        ) : (
          /* ======= OTP VERIFY ======= */
          <div className="flex flex-col gap-4 mt-6 w-full">
            <p className="text-center text-green-700">
              OTP sent to: <strong>{formData.email}</strong>
            </p>

            <input
              type="text"
              placeholder="Enter 6‑digit OTP"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="border p-3 rounded-lg focus:border-[#FFCC00] outline-none"
            />

            <button
              onClick={handleOtpVerify}
              disabled={loading}
              className="bg-[#FFCC00] text-white p-3 rounded-lg hover:bg-[#e6b800] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Verify OTP
            </button>

            <button
              onClick={handleResendOtp}
              disabled={resendTimerActive}
              className={`p-2 text-sm ${
                resendTimerActive
                  ? "text-gray-400"
                  : "text-gray-800 hover:underline"
              }`}
            >
              {resendTimerActive
                ? `Resend OTP in ${resendCooldown}s`
                : "Resend OTP"}
            </button>
          </div>
        )}

        {/* switch to login */}
        {!otpSent && (
          <div className="flex gap-2 mt-4 text-sm">
            <p>Already have an account?</p>
            <button
              onClick={onSwitchToLogin}
              className="text-[#FFCC00] font-semibold hover:underline cursor-pointer"
            >
              Login
            </button>
          </div>
        )}
      </div>

      {/* ======= SUCCESS MODAL ======= */}
      {successModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={goToLogin}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-[90%] text-center relative animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <CheckCircle size={96} className="text-green-600 mx-auto" />
            <h3 className="text-3xl font-bold mt-6">Registration Successful!</h3>
            <p className="mt-4 text-gray-700 text-lg">
              Your account is now active. Click below to log in and start
              reserving rooms.
            </p>
            <button
              onClick={goToLogin}
              className="mt-8 bg-[#FFCC00] text-white w-full py-3 rounded-lg text-lg font-semibold hover:bg-[#e6b800] cursor-pointer"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}

    </main>
  );
}

export default SignUp_User;
