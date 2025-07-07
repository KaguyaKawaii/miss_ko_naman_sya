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

    // Secret override: Admin portal shortcut
    if (
      email.trim().toLowerCase() === "enteradminportal" &&
      password === "1"
    ) {
      setView("adminLogin");
      return;
    }

    if (
      email.trim().toLowerCase() === "admin" &&
      password === "krulcifer1234567890"
    ) {
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

      if (!res.ok)
        throw new Error(data.message || "Login failed. Please try again.");

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
    <main>
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
          <Loader2 size={64} className="text-white animate-spin" />
          <p className="mt-4 text-white text-lg font-semibold">Logging in…</p>
        </div>
      )}

      <div className="flex m-6 justify-center absolute top-0 left-0 right-0">
        {error && (
          <p
            key={error}
            className="bg-red-500 text-white font-semibold p-4 rounded-2xl border border-red-400 shadow-lg text-center absolute animate-shake"
          >
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-col h-screen items-center justify-center gap-2">
        <img className="h-[150px] w-[150px]" src={Logo} alt="Logo" />
        <h1 className="text-3xl font-serif font-semibold text-black">
          University of San Agustin
        </h1>
        <p>
          General Luna St, Iloilo City Proper, Iloilo City, 5000 Iloilo,
          Philippines
        </p>
        <p className="text-lg sm:text-xl font-semibold text-gray-700 text-center">
          Learning Resource Center
        </p>

        <div className="flex flex-col items-center gap-2 mt-10">
          <p className="text-lg sm:text-3xl font-semibold text-gray-700 text-center">
            Login
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="ml-2">Email</label>
              <input
                className="border p-3 w-[450px] rounded-lg hover:border-[#CC0000] outline-none focus:border-[#CC0000] focus:ring-[#CC0000] focus:ring-1 duration-100"
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="ml-2">Password</label>
              <div className="relative">
                <input
                  className="border p-3 w-[450px] rounded-lg hover:border-[#CC0000] outline-none focus:border-[#CC0000] focus:ring-[#CC0000] focus:ring-1 duration-100"
                  type={showPw ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer hover:text-[#CC0000]  transition-colors duration-200"
                >
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="p-3 w-full rounded-lg bg-[#FFCC00] hover:bg-[#e6b800] font-semibold text-white cursor-pointer transition-colors duration-200"
            >
              Login
            </button>
          </form>

          <div className="mt-4">
  <button
    onClick={() => setView("resetPassword")}
    className="text-[#FFCC00] font-semibold hover:underline cursor-pointer"
  >
    Forgot password?
  </button>
</div>

          <div className="flex gap-2 mt-2">
            <p>Don't have an account?</p>
            <button
              onClick={onSwitchToSignUp}
              className="text-[#FFCC00] font-semibold hover:underline cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>

      {successModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={closeSuccess}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-[90%] text-center animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <CheckCircle size={96} className="text-green-600 mx-auto" />
            <h3 className="text-3xl font-bold mt-6">Login Successful!</h3>
            <p className="mt-4 text-gray-700 text-lg">
              Welcome back! Click the button below to continue to your
              dashboard.
            </p>
            <button
              onClick={closeSuccess}
              className="mt-8 bg-[#CC0000] text-white w-full py-3 rounded-lg text-lg font-semibold hover:bg-[#990000] cursor-pointer duration-200"
            >
              Enter
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Login_User;
