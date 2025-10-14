// SignUp_User.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Eye, EyeOff, CheckCircle, Loader2 } from "lucide-react";
import Logo from "../assets/logo.png";
import lrc from '../assets/logo2.png';


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

  // Check if a course is a graduate program
  const isGraduateProgram = (course) => {
    const graduateKeywords = ["Master", "Doctor", "MBA", "MPA", "MAGC", "MARS", "MAED"];
    return graduateKeywords.some(keyword => course.includes(keyword));
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

  if (name === "course") {
    setFormData((p) => ({
      ...p,
      course: value,
      year_level: "", // Reset year level when course changes
    }));
    return;
  }

  setFormData((p) => ({
    ...p,
    [name]: name === "email" ? value.toLowerCase() : value,
  }));
};


const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("");

  if (!formData.email.toLowerCase().endsWith("@usa.edu.ph"))
    return setMessage("Email must end with @usa.edu.ph");
  if (formData.password.length < 8)
    return setMessage("Password must be at least 8 characters");
  if (formData.password !== formData.confirmPassword)
    return setMessage("Passwords do not match");
  if (!formData.role) return setMessage("Please select an account role");
  
  // For students, check if department, course and year level are required
  if (formData.role === "Student") {
    if (!formData.department) return setMessage("Please select a department");
    if (!formData.course) return setMessage("Program is required for students");
    if (!formData.year_level) return setMessage("Year Level is required for students");
  }
  
  // For staff, check if department and course are required
  if (formData.role === "Staff_Office") {
    if (!formData.department.trim()) return setMessage("Please enter your office/department");
    if (!formData.course.trim()) return setMessage("Position is required for staff");
  }
  
  // For faculty, check if department is required
  if (formData.role === "Faculty") {
    if (!formData.department.trim()) return setMessage("Please enter your department");
  }

  try {
    setLoading(true);

    const payload = {
      ...formData,
      email: formData.email.toLowerCase(),  // normalize email
      course: formData.role === "Student" || formData.role === "Staff_Office" ? formData.course : "N/A",
      year_level: formData.role === "Student" ? formData.year_level : "N/A",
      department: formData.role === "Student" || formData.role === "Staff_Office" || formData.role === "Faculty" ? formData.department : "N/A",
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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center p-4">
      {/* full‑screen spinner when loading */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-blue-500/50 backdrop-blur-md">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center">
            <Loader2 size={64} className="text-red-600 animate-spin mb-4" />
            <p className="text-gray-700 text-lg font-semibold">Verifying…</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="flex flex-col md:flex-row">
          {/* Left side - University Info */}
          <div className="md:w-2/5 bg-yellow-500 p-10 text-white flex flex-col justify-center items-center text-center">
          <div className="flex justify-around w-full mb-4">
            <img 
              className="relative w-[130px] h-[130px] " 
              src={Logo} 
              alt="University of San Agustin Logo" 
            />
            <img 
                            src={lrc} 
                            alt="Learning Resource Center Logo" 
                            className="relative w-[130px] h-[130px] "
                          />

                          </div>
            <h1 className="text-2xl font-serif font-bold mb-4">
              University of San Agustin
            </h1>
       
            <div className="w-16 h-1 bg-yellow-400 mb-4"></div>
            <p className="text-xl font-semibold text-white">
              Learning Resource Center
            </p>
          
          </div>

          {/* Right side - Form Content */}
          <div className="md:w-3/5 p-8">
            {/* floating toast */}
            {message && (
              <div
                className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 ${messageClass}`}
              >
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-lg max-w-md">
                  <p className="font-bold">Notice</p>
                  <p>{message}</p>
                </div>
              </div>
            )}

            {/* logo & header */}
            <div className="flex flex-col items-center mb-6 md:hidden">
              <img src={Logo} alt="USA logo" className="h-20 w-20 mb-2" />
              <h1 className="text-xl font-serif font-semibold text-center">
                University of San Agustin
              </h1>
              <p className="text-md font-semibold text-gray-700 text-center">
                Learning Resource Center
              </p>
            </div>

            {/* ---------- SIGN UP vs OTP ---------- */}
            {!otpSent ? (
              /* ======= SIGN‑UP FORM ======= */
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
                  Create Account
                </h2>

                {/* Full name */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 rounded-xl hover:border-red-500 transition-colors duration-300 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Email (@usa.edu.ph)</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="e.g. juandelacruz@usa.edu.ph"
                    value={formData.email}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 rounded-xl hover:border-red-500 transition-colors duration-300 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* ID number */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">ID Number</label>
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
                    className="border border-gray-300 p-3 rounded-xl hover:border-red-500 transition-colors duration-300 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Account role */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Account Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 rounded-xl hover:border-red-500 transition-colors duration-300 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="Student">Student</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Staff_Office">Staff</option>
                  </select>
                </div>

                {/* Department - Different input types based on role */}
                {(formData.role === "Student" || formData.role === "Staff_Office" || formData.role === "Faculty") && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      {formData.role === "Student" ? "Department" : 
                       formData.role === "Faculty" ? "Department" : 
                       "Office/Department"}
                    </label>
                    {formData.role === "Student" ? (
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="border border-gray-300 p-3 rounded-xl hover:border-red-500 transition-colors duration-300 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Department</option>
                        {Object.keys(courseOptions).map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="department"
                        placeholder={
                          formData.role === "Faculty" 
                            ? "Enter your department (e.g., College of Engineering, Mathematics Department)" 
                            : "Enter your office/department (e.g., Registrar's Office, HR Department)"
                        }
                        value={formData.department}
                        onChange={handleChange}
                        className="border border-gray-300 p-3 rounded-xl hover:border-red-500 transition-colors duration-300 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      />
                    )}
                  </div>
                )}

                {/* Program/Position - Show for Students and Staff (not for Faculty) */}
                {(formData.role === "Student" || formData.role === "Staff_Office") && formData.department && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      {formData.role === "Staff_Office" ? "Position" : "Program"}
                    </label>
                    {formData.role === "Student" ? (
                      <select
                        name="course"
                        value={formData.course}
                        onChange={handleChange}
                        className="border border-gray-300 p-3 rounded-xl hover:border-red-500 transition-colors duration-300 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Program</option>
                        {courseOptions[formData.department]?.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="course"
                        placeholder="Enter your position (e.g., Administrative Assistant, Clerk)"
                        value={formData.course}
                        onChange={handleChange}
                        className="border border-gray-300 p-3 rounded-xl hover:border-red-500 transition-colors duration-300 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        required
                      />
                    )}
                  </div>
                )}

                {/* Year Level - Show only for Students (not for Staff or Faculty) */}
                {formData.role === "Student" && formData.course && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Year Level</label>
                    <select
                      name="year_level"
                      value={formData.year_level}
                      onChange={handleChange}
                      className="border border-gray-300 p-3 rounded-xl hover:border-red-500 transition-colors duration-300 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Year Level</option>
                      {formData.department === "SHS" ? (
                        <>
                          <option value="Grade 11">Grade 11</option>
                          <option value="Grade 12">Grade 12</option>
                        </>
                      ) : formData.department === "COL" ? (
                        // COL year levels - 1st to 4th Year
                        <>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                        </>
                      ) : isGraduateProgram(formData.course) ? (
                        // Graduate program year levels
                        <>
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          {formData.course.includes("Doctor") && (
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

                {/* Password */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      name="password"
                      placeholder="Minimum 8 characters"
                      value={formData.password}
                      onChange={handleChange}
                      className="border border-gray-300 p-3 rounded-xl w-full hover:border-red-500 transition-colors duration-300 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 transition-colors duration-200"
                    >
                      {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showPw2 ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Re‑enter your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="border border-gray-300 p-3 rounded-xl w-full hover:border-red-500 transition-colors duration-300 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw2((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 transition-colors duration-200"
                    >
                      {showPw2 ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="p-3 rounded-xl bg-[#CC0000] hover:bg-[#b80000] font-semibold text-white cursor-pointer transition-colors duration-300 shadow-md hover:shadow-lg mt-2"
                >
                  {loading ? "Please wait…" : "Sign Up"}
                </button>
              </form>
            ) : (
              /* ======= OTP VERIFY ======= */
              <div className="flex flex-col gap-4 mt-2">
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
                  Verify Email
                </h2>
                
                <p className="text-center text-green-700 bg-green-50 p-3 rounded-xl">
                  OTP sent to: <strong>{formData.email}</strong>
                </p>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Verification Code</label>
                  <input
                    type="text"
                    placeholder="Enter 6‑digit OTP"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="border border-gray-300 p-3 rounded-xl hover:border-red-500 transition-colors duration-300 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-center text-xl tracking-widest"
                  />
                </div>

                <button
                  onClick={handleOtpVerify}
                  disabled={loading}
                  className="p-3 rounded-xl bg-red-600 hover:bg-red-700 font-semibold text-white cursor-pointer transition-colors duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verify OTP
                </button>

                <button
                  onClick={handleResendOtp}
                  disabled={resendTimerActive}
                  className={`p-2 text-sm text-center ${
                    resendTimerActive
                      ? "text-gray-400"
                      : "text-blue-600 hover:text-red-800 hover:underline"
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
              <div className="flex justify-center gap-2 mt-6 text-sm pt-4 border-t border-gray-200">
                <p className="text-gray-600">Already have an account?</p>
                <button
                  onClick={onSwitchToLogin}
                  className="text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======= SUCCESS MODAL ======= */}
      {successModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-blue-500/50 backdrop-blur-md"
          onClick={goToLogin}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-[90%] text-center relative animate-fade-in-scale"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Registration Successful!</h3>
            <p className="mt-4 text-gray-600">
              Your account is now active. Click below to log in and start
              reserving rooms.
            </p>
            <button
              onClick={goToLogin}
              className="mt-6 bg-red-700 text-white w-full py-3 rounded-xl font-semibold hover:bg-red-800 cursor-pointer transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in-scale {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in-scale {
          animation: fade-in-scale 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}

export default SignUp_User;