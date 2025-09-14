import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Logo from "../assets/logo.png";

function Login_Admin({ onAdminLoginSuccess, onBackToUserLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ------------------------------------------------------------
     Handle submit
  ------------------------------------------------------------ */
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username || !password) {
      setError("Please enter both username and password.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      // Ensure backend actually returned an admin object
      if (!data.admin) {
        setError("Unexpected response from server.");
        setLoading(false);
        return;
      }

      // Success: bubble admin object up to parent
      onAdminLoginSuccess(data.admin);
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Server error. Please try again later.");
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------
     UI
  ------------------------------------------------------------ */
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-red-500/80 backdrop-blur-md">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center">
            <Loader2 size={64} className="text-red-600 animate-spin mb-4" />
            <p className="text-gray-700 text-lg font-semibold">Logging in…</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Left side - University Info */}
        <div className="md:w-2/5 bg-gradient-to-b from-gray-800 to-gray-900 p-8 text-white flex flex-col justify-center items-center text-center">
          <img 
            className="h-28 w-28 mb-6 " 
            src={Logo} 
            alt="University of San Agustin Logo" 
          />
          <h1 className="text-2xl font-serif font-bold mb-4">
            University of San Agustin
          </h1>
          <p className="mb-4 text-blue-200 text-sm">
            General Luna St, Iloilo City Proper, Iloilo City, 5000 Iloilo,
            Philippines
          </p>
          <div className="w-16 h-1 bg-yellow-400 mb-4"></div>
          <p className="text-xl font-semibold text-yellow-400">
            Learning Resource Center
          </p>
          <p className="mt-6 text-xs text-blue-200">
            Administrative access to manage library resources and user accounts.
          </p>
        </div>

        {/* Right side - Login Form */}
        <div className="md:w-3/5 p-8 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Admin Portal</h2>
            <p className="text-gray-600 mt-2">Restricted access for authorized personnel only</p>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 animate-fade-in-down">
              <p className="font-bold">Authentication Error</p>
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Admin Username</label>
              <input
                className="border border-gray-300 p-4 rounded-xl hover:border-red-500 transition-colors duration-300 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                type="text"
                placeholder="Enter admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  className="border border-gray-300 p-4 rounded-xl w-full hover:border-red-500 transition-colors duration-300 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 transition-colors duration-200"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="p-4 rounded-xl bg-[#CC0000] hover:bg-[#b80000] font-semibold text-white cursor-pointer transition-colors duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Authenticating..." : "Login to Admin Portal"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <button
              onClick={onBackToUserLogin}
              disabled={loading}
              className="text-[#b80000] hover:text-[#b80000] font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Back to User Login
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              © {new Date().getFullYear()} University of San Agustin. All rights reserved.
            </p>
          </div>
        </div>
      </div>

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
        
        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out;
        }
      `}</style>
    </main>
  );
}

export default Login_Admin;