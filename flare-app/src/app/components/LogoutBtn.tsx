"use client";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/axios";
import { useState } from "react";

const LogoutBtn = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    setError("");
    setLoading(true);
    try {
      await logout();
      router.push("/auth");
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
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        {loading ? "Logging out..." : "Logout"}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default LogoutBtn;
