import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import Logo from "../assets/logo.png";
import "../index.css";

function Login_User({ onSwitchToSignUp, onLoginSuccess, setView }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [authedUser, setAuthedUser] = useState(null);

  useEffect(() => {
    localStorage.removeItem("userSession");
    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => window.location.replace("/");
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    // REMOVED: Admin portal shortcut - this should be a separate button or link
    // Users should not be able to access admin login through user login form

    if (email.trim().toLowerCase() === "admin" && password === "krulcifer1234567890") {
      setError("Admin accounts must log in through the admin portal.");
      return;
    }

    const start = Date.now();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

<<<<<<< HEAD
    // This is your main branch version
console.log("main branch");
=======
// This is your recovery branch version
console.log("recovery branch");
>>>>>>> recovery
      }

      if (data.user?.role?.toLowerCase() === "admin") {
        throw new Error("Admin accounts must log in through the admin portal.");
      }

      const elapsed = Date.now() - start;
      const delay = elapsed < 1000 ? 1000 - elapsed : 0;
      setTimeout(() => {
        setLoading(false);
        setAuthedUser(data.user);
        setSuccessModal(true);
      }, delay);
    } catch (err) {
      setLoading(false);
      setError(err.message || "An error occurred. Please try again later.");
    }
  };

  const closeSuccess = () => {
    setSuccessModal(false);
    if (authedUser) {
      localStorage.setItem("userSession", JSON.stringify(authedUser));
      onLoginSuccess(authedUser);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-500/50 backdrop-blur-md">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center">
            <Loader2 size={64} className="text-red-600 animate-spin mb-4" />
            <p className="text-gray-700 text-lg font-semibold">Logging in…</p>
          </div>
        </div>
      )}

      <div className="flex justify-center absolute top-6 left-0 right-0 z-40">
        {error && (
          <div
            key={error}
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-lg animate-fade-in-down max-w-md w-[90%] mx-4"
            role="alert"
          >
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
      </div>

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Mobile and Tablet: Full screen layout */}
          <div className="w-full p-6 sm:p-8 md:p-10 flex flex-col justify-center">
            {/* Logo Section - Only show on mobile/tablet */}
            <div className="flex justify-center mb-6 md:hidden">
              <img src={Logo} alt="University Logo" className="h-16 w-auto" />
            </div>

            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Welcome Back</h2>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">Sign in to access your account</p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4 sm:gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <input
                  className="border border-gray-300 p-3 sm:p-4 rounded-xl hover:border-red-500 transition-colors duration-300 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
                  type="text"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setView("resetPassword")}
                    className="text-xs text-red-600 hover:text-red-800 font-medium cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    className="border border-gray-300 p-3 sm:p-4 rounded-xl w-full hover:border-red-500 transition-colors duration-300 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
                    type={showPw ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 transition-colors duration-200"
                  >
                    {showPw ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="p-3 sm:p-4 rounded-xl bg-[#CC0000] hover:bg-[#b80000] font-semibold text-white cursor-pointer transition-colors duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm sm:text-base"
              >
                Login
              </button>
            </form>

            {/* Add Admin Portal Link */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setView("adminLogin")}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium cursor-pointer"
              >
                Admin Portal →
              </button>
            </div>

            <div className="mt-6 sm:mt-8 text-center">
              <p className="text-gray-600 text-sm sm:text-base">
                Don't have an account?{" "}
                <button
                  onClick={onSwitchToSignUp}
                  className="text-red-600 hover:text-red-800 font-semibold cursor-pointer"
                >
                  Create Account
                </button>
              </p>
            </div>

            <div className="mt-8 sm:mt-10 pt-4 sm:pt-6 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500">
                © {new Date().getFullYear()} University of San Agustin. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>

      {successModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/50 backdrop-blur-md"
          onClick={closeSuccess}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 max-w-lg w-[90%] mx-4 text-center animate-fade-in-scale"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <CheckCircle size={32} className="sm:w-12 sm:h-12 text-green-600" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">Login Successful!</h3>
            <p className="mt-3 sm:mt-4 text-gray-600 text-base sm:text-lg">
              Welcome back! You're now being redirected to your dashboard.
            </p>
            <button
              onClick={closeSuccess}
              className="mt-6 sm:mt-8 bg-red-700 text-white w-full py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-red-800 cursor-pointer transition-colors duration-300 shadow-md hover:shadow-lg"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
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
        
        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out;
        }
        
        .animate-fade-in-scale {
          animation: fade-in-scale 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}

export default Login_User;
