"use client";

import { logout } from "@/lib/axios";
import { useState } from "react";

const LogoutBtn = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    setError("");
    setLoading(true);
    try {
      await logout();
      localStorage.removeItem("loggedIn");
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
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
