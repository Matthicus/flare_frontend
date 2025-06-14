"use client";

import { logout } from "@/lib/axios";
import { useState, useContext } from "react";
import { UserContext } from "@/context/UserContext";

const LogoutBtn = () => {
  const { setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    setError("");
    setLoading(true);
    try {
      await logout();
      localStorage.removeItem("loggedIn");
      setUser(null); // Clear user in context instead of reloading
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Logout failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleLogout}
        disabled={loading}
        className="px-2 py-1 bg-red-500 text-white rounded-xl hover:bg-red-600 cursor-pointer"
      >
        {loading ? "Logging out..." : "Logout"}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default LogoutBtn;
