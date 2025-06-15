// SignUp_User.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import Logo from "../assets/logo.png";

function SignUp_User({ onSwitchToLogin }) {
  /* ---------------------------------------------------------------------- */
  /* Local state                                                            */
  /* ---------------------------------------------------------------------- */
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    id_number: "",
    password: "",
    confirmPassword: "",
    role: "Student",   // NEW  ➜ Student | Faculty | Staff
    department: "",
    course: "",
    yearLevel: "",
  });

  const [message, setMessage] = useState("");
  const [messageClass, setMessageClass] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendTimerActive, setResendTimerActive] = useState(false);

  /* Available programs per department (for Students only) */
  const courseOptions = {
    SHS: ["STEM", "ABM", "HUMSS", "TVL"],
    CLASE: [
      "Bachelor of Science in Information Technology",
      "Bachelor of Science in Computer Science",
    ],
    CNND: ["Bachelor of Science in Nursing"],
    CPMT: ["Bachelor of Science in Pharmacy"],
    COT: ["Bachelor of Science in Medical Technology"],
    COC: ["Bachelor of Science in Criminology"],
  };

  /* ---------------------------------------------------------------------- */
  /* Side‑effects: transient message animation + resend timer               */
  /* ---------------------------------------------------------------------- */
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
    let timer;
    if (resendTimerActive && resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    } else if (resendCooldown === 0) {
      setResendTimerActive(false);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown, resendTimerActive]);

  /* ---------------------------------------------------------------------- */
  /* Handlers                                                               */
  /* ---------------------------------------------------------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    /* If role changes from Student → Faculty/Staff, clear program & year  */
    if (name === "role" && value !== "Student") {
      setFormData((prev) => ({
        ...prev,
        role: value,
        course: "",
        yearLevel: "",
      }));
      return;
    }

    /* If department changes, reset course/yearLevel (for Students)        */
    if (name === "department") {
      setFormData((prev) => ({
        ...prev,
        department: value,
        course: "",
        yearLevel: "",
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ===========================  SUBMIT (send OTP)  ====================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    /* Basic validation */
    if (!formData.email.endsWith("@usa.edu.ph")) {
      setMessage("Email must end with @usa.edu.ph");
      return;
    }
    if (formData.password.length < 8) {
      setMessage("Password must be at least 8 characters");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    if (!formData.department) {
      setMessage("Please select a department");
      return;
    }

    /* Extra validation for Students only */
    if (
      formData.role === "Student" &&
      (!formData.course || !formData.yearLevel)
    ) {
      setMessage("Program and Year Level are required for students");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/signup", formData);
      setMessage(res.data.message || "OTP sent to your email. Please verify.");
      setOtpSent(true);
      setResendCooldown(60);
      setResendTimerActive(true);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ===========================  OTP VERIFY  ============================= */
  const handleOtpVerify = async () => {
    setMessage("");
    if (!otp) {
      setMessage("Please enter the OTP");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/verify-otp", {
        email: formData.email,
        otp,
      });
      alert(res.data.message || "Email verified successfully!");
      onSwitchToLogin();
    } catch (err) {
      setMessage(err.response?.data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/resend-otp", {
        email: formData.email,
      });
      setMessage(res.data.message || "OTP resent successfully.");
      setResendCooldown(60);
      setResendTimerActive(true);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */
  return (
    <main>
      <div className="flex flex-col h-screen items-center justify-center gap-2">
        {/* Floating message */}
        {message && (
          <div
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 ${messageClass}`}
          >
            <p className="bg-red-600 text-white font-semibold p-4 rounded-2xl border border-red-500 shadow-lg">
              {message}
            </p>
          </div>
        )}

        {/* Header / Logo */}
        <img className="h-[150px] w-[150px]" src={Logo} alt="Logo" />
        <h1 className="text-3xl font-serif font-semibold">University of San Agustin</h1>
        <p className="font-semibold text-2xl text-gray-800">
          Learning Resource Center
        </p>

        {/* ====================  SIGN‑UP FORM  ==================== */}
        {!otpSent ? (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 mt-5 w-[450px]"
          >
            <h2 className="text-2xl font-semibold text-center mb-2">Sign Up</h2>

            {/* Name */}
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="border p-3 rounded-lg hover:border-[#FFCC00]"
              required
            />

            {/* Email */}
            <input
              type="email"
              name="email"
              placeholder="Email (@usa.edu.ph)"
              value={formData.email}
              onChange={handleChange}
              className="border p-3 rounded-lg hover:border-[#FFCC00]"
              required
            />

            {/* ID Number */}
            <input
              type="number"
              name="id_number"
              placeholder="ID Number"
              value={formData.id_number}
              onChange={handleChange}
              className="border p-3 rounded-lg hover:border-[#FFCC00]"
              required
            />

            {/* User Type / Role */}
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="border p-3 rounded-lg hover:border-[#FFCC00]"
              required
            >
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
              <option value="Staff">Staff</option>
            </select>

            {/* Department */}
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="border p-3 rounded-lg hover:border-[#FFCC00]"
              required
            >
              <option value="">Select Department</option>
              <option value="SHS">SHS</option>
              <option value="CLASE">CLASE</option>
              <option value="CNND">CNND</option>
              <option value="CPMT">CPMT</option>
              <option value="COT">COT</option>
              <option value="COC">COC</option>
            </select>

            {/* Program & Year Level (Students only) */}
            {formData.role === "Student" && (
              <>
                {/* Program */}
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className="border p-3 rounded-lg hover:border-[#FFCC00]"
                  required
                >
                  <option value="">Select Program</option>
                  {courseOptions[formData.department]?.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {/* Year Level */}
                <select
                  name="yearLevel"
                  value={formData.yearLevel}
                  onChange={handleChange}
                  className="border p-3 rounded-lg hover:border-[#FFCC00]"
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
              </>
            )}

            {/* Password */}
            <input
              type="password"
              name="password"
              placeholder="Password (min 8 characters)"
              value={formData.password}
              onChange={handleChange}
              className="border p-3 rounded-lg hover:border-[#FFCC00]"
              required
            />

            {/* Confirm Password */}
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="border p-3 rounded-lg hover:border-[#FFCC00]"
              required
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="bg-[#FFCC00] text-white p-3 rounded-lg hover:bg-[#ffcc00d5] font-semibold text-lg"
            >
              {loading ? "Sending OTP..." : "Sign Up"}
            </button>
          </form>
        ) : (
          /* ====================  OTP FORM  ==================== */
          <div className="flex flex-col gap-4 mt-10 w-[450px]">
            <p className="text-center text-green-700">
              OTP sent to your email: {formData.email}
            </p>

            <input
              type="text"
              placeholder="Enter OTP"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="border p-3 rounded-lg hover:border-[#FFCC00] focus:border-amber-300"
            />

            <button
              onClick={handleOtpVerify}
              disabled={loading}
              className="bg-[#FFCC00] text-white p-3 rounded-lg hover:bg-[#ffcc00d5] font-semibold text-lg"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              onClick={handleResendOtp}
              disabled={resendTimerActive}
              className={`p-2 text-sm ${
                resendTimerActive ? "text-gray-400" : "text-gray-800"
              }`}
            >
              {resendTimerActive
                ? `Resend OTP in ${resendCooldown}s`
                : "Resend OTP"}
            </button>
          </div>
        )}

        {/* Switch to Login */}
        {!otpSent && (
          <div className="flex gap-2 mt-4">
            <p>Already have an account?</p>
            <button
              onClick={onSwitchToLogin}
              className="text-[#FFCC00] font-semibold hover:underline"
            >
              Login
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default SignUp_User;
