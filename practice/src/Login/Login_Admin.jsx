import { useState } from "react";
import Logo from "../assets/logo.png";

function Login_Admin({ onAdminLoginSuccess, onBackToUserLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  /* ------------------------------------------------------------
     Handle submit
  ------------------------------------------------------------ */
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed. Please try again.");
        return;
      }

      // Ensure backend actually returned an admin object
      if (!data.admin) {
        setError("Unexpected response from server.");
        return;
      }

      // Success: bubble admin object up to parent
      onAdminLoginSuccess(data.admin);
    } catch (err) {
      console.error("Admin login error:", err);
      setError("Server error. Please try again later.");
    }
  };

  /* ------------------------------------------------------------
     UI
  ------------------------------------------------------------ */
  return (
    <main className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-[500px] flex flex-col items-center gap-5">
        <img className="h-[150px] w-[150px]" src={Logo} alt="Logo" />
        <h1 className="text-3xl font-serif font-semibold text-black text-center">
          University of San Agustin
        </h1>
        <p className="text-2xl font-serif font-semibold text-center">
          Admin Portal
        </p>
        <p className="font-sans font-semibold text-center">
          LEARNING RESOURCE CENTER
        </p>

        {error && (
          <p className="bg-red-500 text-white font-semibold p-4 rounded-2xl border border-red-400 shadow-lg text-center w-full">
            {error}
          </p>
        )}

        <form onSubmit={handleAdminLogin} className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-1">
            <label className="ml-2">Admin Username</label>
            <input
              className="border p-3 rounded-lg hover:border-[#FFCC00]"
              type="text"
              placeholder="Admin Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="ml-2">Password</label>
            <input
              className="border p-3 rounded-lg hover:border-[#FFCC00]"
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

        <button
          onClick={onBackToUserLogin}
          className="text-[#FFCC00] font-semibold hover:underline"
        >
          Back to User Login
        </button>
      </div>
    </main>
  );
}

export default Login_Admin;
