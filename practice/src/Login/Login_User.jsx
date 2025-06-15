import { useState } from "react";
import Logo from "../assets/logo.png";

function Login_User({ onSwitchToSignUp, onLoginSuccess, setView }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    /* ------------------------------------------------------------------
       1. Redirect trigger: enteradminportal + krulcifer1234567890
    ------------------------------------------------------------------ */
    if (
      email.trim().toLowerCase() === "enteradminportal" &&
      password === "krulcifer1234567890"
    ) {
      setView("adminLogin"); // Switch to admin login component
      return;
    }

    /* ------------------------------------------------------------------
       2. Block hard-coded admin credentials (extra safety)
    ------------------------------------------------------------------ */
    if (
      email.trim().toLowerCase() === "admin" &&
      password === "krulcifer1234567890"
    ) {
      setError("Admin accounts must log in through the admin portal.");
      return;
    }

    /* ------------------------------------------------------------------
       3. Proceed with normal user login
    ------------------------------------------------------------------ */
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed. Please try again.");
        return;
      }

      if (data.user?.role?.toLowerCase() === "admin") {
        setError("Admin accounts must log in through the admin portal.");
        return;
      }

      onLoginSuccess(data.user);
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <main>
      <div className="flex flex-col h-screen items-center justify-center gap-2">
        <img className="h-[150px] w-[150px]" src={Logo} alt="Logo" />
        <h1 className="text-3xl font-serif font-semibold text-black">
          University of San Agustin
        </h1>
        <p>
          General Luna St, Iloilo City Proper, Iloilo City, 5000 Iloilo,
          Philippines
        </p>

        <div className="flex flex-col items-center gap-2 mt-10">
          {error && (
            <p className="bg-red-500 text-white font-semibold p-4 rounded-2xl border border-red-400 shadow-lg text-center">
              {error}
            </p>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="ml-2">Email</label>
              <input
                className="border p-3 w-[450px] rounded-lg hover:border-[#FFCC00]"
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="ml-2">Password</label>
              <input
                className="border p-3 w-[450px] rounded-lg hover:border-[#FFCC00]"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="p-3 w-full rounded-lg bg-[#FFCC00] hover:bg-[#bfa900]"
            >
              Login
            </button>
          </form>

          <div className="flex gap-2">
            <p>Don't have an account?</p>
            <button
              onClick={onSwitchToSignUp}
              className="text-[#FFCC00] font-semibold hover:underline"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login_User;
