import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import Logo from "../assets/logo.png";
import "../index.css";

function ResetPassword({ onBackToLogin }) {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) return setError("Please enter your email.");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStep("otp");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return setError("Enter the OTP.");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("reset");
    }, 800); // mimic verifying
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword)
      return setError("Please fill in all fields.");
    if (newPassword !== confirmPassword)
      return setError("Passwords do not match.");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccessModal(true);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const closeSuccess = () => {
    setSuccessModal(false);
    onBackToLogin();
  };

  return (
    <main>
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
          <Loader2 size={64} className="text-white animate-spin" />
          <p className="mt-4 text-white text-lg font-semibold">Processing…</p>
        </div>
      )}

      <div className="flex m-6 justify-center absolute top-0 left-0 right-0">
        {error && (
          <p className="bg-red-500 text-white font-semibold p-4 rounded-2xl border border-red-400 shadow-lg text-center absolute animate-shake">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-col h-screen items-center justify-center gap-2">
        <img className="h-[150px] w-[150px]" src={Logo} alt="Logo" />
        <h1 className="text-3xl font-serif font-semibold text-black">University of San Agustin</h1>
        <p>General Luna St, Iloilo City Proper, Iloilo City, 5000 Iloilo, Philippines</p>
        <p className="text-lg sm:text-xl font-semibold text-gray-700 text-center">Learning Resource Center</p>

        <div className="flex flex-col items-center gap-4 mt-10">
          {step === "email" && (
            <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
              <p className="text-2xl font-semibold text-gray-800 text-center">Forgot Password</p>
              <div className="flex flex-col gap-1">
                <label className="ml-2">Email</label>
                <input
                  className="border p-3 w-[450px] rounded-lg hover:border-[#CC0000] outline-none focus:border-[#CC0000] focus:ring-[#CC0000] focus:ring-1 duration-100"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="p-3 w-full flex justify-center items-center gap-2 rounded-lg bg-[#FFCC00] hover:bg-[#e6b800] font-semibold text-white cursor-pointer duration-150"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : "Send OTP"}
              </button>
              <button onClick={onBackToLogin} type="button" className="text-[#FFCC00] font-semibold hover:underline cursor-pointer">Back to Login</button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <p className="text-2xl font-semibold text-gray-800 text-center">Enter OTP</p>
              <div className="flex flex-col gap-1">
                
                <input
                  className="border p-3 w-[450px] rounded-lg hover:border-[#CC0000] outline-none focus:border-[#CC0000] focus:ring-[#CC0000] focus:ring-1 duration-100"
                  type="text"
                  placeholder="Enter the OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="p-3 w-full flex justify-center items-center gap-2 rounded-lg bg-[#FFCC00] hover:bg-[#e6b800] font-semibold text-white cursor-pointer duration-150"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : "Verify OTP"}
              </button>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <p className="text-2xl font-semibold text-gray-800 text-center">Reset Password</p>
              <div className="flex flex-col gap-1">
                <label className="ml-2">New Password</label>
                <div className="relative">
                  <input
                    className="border p-3 w-[450px] rounded-lg hover:border-[#CC0000] outline-none focus:border-[#CC0000] focus:ring-[#CC0000] focus:ring-1 duration-100"
                    type={showPw ? "text" : "password"}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer hover:text-[#CC0000] transition-colors duration-200">
                    {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="ml-2">Confirm Password</label>
                <div className="relative">
                  <input
                    className="border p-3 w-[450px] rounded-lg hover:border-[#CC0000] outline-none focus:border-[#CC0000] focus:ring-[#CC0000] focus:ring-1 duration-100"
                    type={showConfirmPw ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer hover:text-[#CC0000] transition-colors duration-200">
                    {showConfirmPw ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="p-3 w-full flex justify-center items-center gap-2 rounded-lg bg-[#FFCC00] hover:bg-[#e6b800] font-semibold text-white cursor-pointer"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </div>

      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-[90%] text-center">
            <CheckCircle size={96} className="text-green-600 mx-auto" />
            <h3 className="text-3xl font-bold mt-6">Password Reset!</h3>
            <p className="mt-4 text-gray-700 text-lg">Your password has been successfully updated.</p>
            <button onClick={closeSuccess} className="mt-8 bg-[#CC0000] text-white w-full py-3 rounded-lg text-lg font-semibold hover:bg-[#990000] cursor-pointer">
              Go to Login
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default ResetPassword;
