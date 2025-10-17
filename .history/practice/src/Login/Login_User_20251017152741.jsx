import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2, CheckCircle, Home, ArrowLeft, University, Mail, Lock } from "lucide-react";
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
  const [isFocused, setIsFocused] = useState({ email: false, password: false });

  useEffect(() => {
    localStorage.removeItem("userSession");
    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => window.location.replace("/");
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
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

    if (!email.includes('@')) {
      setError("Please enter a valid email address.");
      return;
    }

    console.log("🔐 Login attempt:", { email, passwordLength: password.length });

    const start = Date.now();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      console.log("📊 Login response:", {
        status: res.status,
        ok: res.ok,
        data: data
      });

      if (!res.ok) {
        if (res.status === 403 || data.message?.toLowerCase().includes("suspended")) {
          throw new Error("Your account has been suspended. Please contact the administrator.");
        }
        
        if (res.status === 401) {
          console.error("🔍 401 Error Details:", {
            email: email,
            userExists: data.user ? "Yes" : "No",
            message: data.message
          });
          throw new Error(data.message || "Invalid email or password. Please check your credentials.");
        }
        
        throw new Error(data.message || "Login failed. Please try again.");
      }

      if (data.user?.role?.toLowerCase() === "admin") {
        throw new Error("Admin accounts must log in through the admin portal.");
      }

      if (data.user?.role === "Staff_Office") {
        console.log("Staff_Office user logging in - redirecting to user dashboard");
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
      console.error("❌ Login error:", err);
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

  const handleBackToHome = () => {
    setView("home");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-10 rounded-3xl shadow-2xl flex flex-col items-center">
            <div className="relative">
              <Loader2 size={72} className="text-white animate-spin mb-6" />
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg"></div>
            </div>
            <p className="text-white text-xl font-semibold">Authenticating...</p>
            <p className="text-white/70 text-sm mt-2">Please wait while we verify your credentials</p>
          </div>
        </div>
      )}

      {/* Error Notification */}
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-[95%]">
        {error && (
          <div
            key={error}
            className="bg-red-500/90 backdrop-blur-lg border border-red-400/30 text-white p-5 rounded-2xl shadow-2xl animate-fade-in-down"
            role="alert"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Authentication Error</p>
                <p className="text-sm opacity-90 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError("")}
                className="text-white/70 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-6xl flex bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
          {/* Left Side - Branding */}
          <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600/90 to-purple-700/90 p-12 flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full"></div>
              <div className="absolute bottom-20 right-16 w-24 h-24 border-2 border-white rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-white rounded-full"></div>
            </div>

            <div className="relative z-10">
              <button
                onClick={handleBackToHome}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-all duration-300 group mb-8"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back to Home</span>
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <University size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">University of San Agustin</h1>
                  <p className="text-white/80 text-lg">Room Reservation System</p>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                  Welcome Back to Your <span className="text-yellow-300">Campus Hub</span>
                </h2>
                <p className="text-white/80 text-lg leading-relaxed">
                  Access your personalized dashboard, manage room reservations, and stay connected with campus activities all in one place.
                </p>
              </div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 text-white/70">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <div className="w-6 h-6 bg-green-400 rounded-full"></div>
                </div>
                <div>
                  <p className="font-semibold text-white">Secure & Reliable</p>
                  <p className="text-sm">Enterprise-grade security for your academic needs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex-1 p-8 sm:p-12 lg:p-16 bg-white/5 backdrop-blur-lg">
            <div className="max-w-md mx-auto h-full flex flex-col justify-center">
              {/* Mobile Header */}
              <div className="lg:hidden mb-8">
                <button
                  onClick={handleBackToHome}
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-all duration-300 group mb-6"
                >
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                  <span className="font-medium">Back to Home</span>
                </button>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <University size={24} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Room Reservation</h1>
                    <p className="text-white/70 text-sm">University of San Agustin</p>
                  </div>
                </div>
              </div>

              {/* Form Container */}
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-3">Welcome Back</h2>
                  <p className="text-white/70">Sign in to access your account</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                      <Mail size={16} />
                      Email Address
                    </label>
                    <div className={`relative transition-all duration-300 ${isFocused.email ? 'transform scale-[1.02]' : ''}`}>
                      <input
                        className="w-full bg-white/5 border border-white/20 text-white placeholder-white/40 rounded-xl p-4 pl-12 outline-none transition-all duration-300 focus:bg-white/10 focus:border-white/40 focus:shadow-lg"
                        type="text"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setIsFocused(prev => ({ ...prev, email: true }))}
                        onBlur={() => setIsFocused(prev => ({ ...prev, email: false }))}
                      />
                      <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                        <Lock size={16} />
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setView("resetPassword")}
                        className="text-xs text-white/70 hover:text-white font-medium cursor-pointer transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className={`relative transition-all duration-300 ${isFocused.password ? 'transform scale-[1.02]' : ''}`}>
                      <input
                        className="w-full bg-white/5 border border-white/20 text-white placeholder-white/40 rounded-xl p-4 pl-12 pr-12 outline-none transition-all duration-300 focus:bg-white/10 focus:border-white/40 focus:shadow-lg"
                        type={showPw ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setIsFocused(prev => ({ ...prev, password: true }))}
                        onBlur={() => setIsFocused(prev => ({ ...prev, password: false }))}
                      />
                      <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40" />
                      <button
                        type="button"
                        onClick={() => setShowPw((s) => !s)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white transition-colors duration-200 p-1"
                      >
                        {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Sign In
                  </button>
                </form>

                {/* Admin Portal Link */}
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setView("adminLogin")}
                    className="text-white/70 hover:text-white text-sm font-medium cursor-pointer transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    Admin Portal Access
                    <span className="text-lg">→</span>
                  </button>
                </div>

                {/* Sign Up Link */}
                <div className="mt-8 pt-6 border-t border-white/20 text-center">
                  <p className="text-white/70 text-sm">
                    Don't have an account?{" "}
                    <button
                      onClick={onSwitchToSignUp}
                      className="text-white font-semibold hover:text-yellow-300 cursor-pointer transition-colors duration-300"
                    >
                      Create Account
                    </button>
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-white/50 text-xs">
                  © {new Date().getFullYear()} University of San Agustin. All rights reserved.
                  <br />
                  Secure authentication system
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {successModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          onClick={closeSuccess}
        >
          <div
            className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 sm:p-10 max-w-md w-[90%] mx-4 text-center animate-fade-in-scale border border-gray-200/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <CheckCircle size={36} className="text-white" />
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">Welcome Back!</h3>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              You've successfully signed in. Redirecting to your personalized dashboard...
            </p>
            <button
              onClick={closeSuccess}
              className="mt-8 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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