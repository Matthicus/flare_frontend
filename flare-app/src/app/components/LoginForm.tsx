"use client";
import React, { useState, useEffect, useContext } from "react";
import { login, fetchCurrentUser, getUserFlares } from "../../lib/axios";
import { UserContext } from "@/context/UserContext";

type Props = {
  onClose?: () => void;
  onToggleForm?: () => void;
};

interface Flare {
  id?: number | string;
  category?: string;
  note?: string;
  latitude?: number;
  longitude?: number;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const LoginForm = ({ onClose, onToggleForm }: Props) => {
  const { user, setUser } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [flares, setFlares] = useState<Flare[]>([]);
  const [flaresLoading, setFlaresLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userData = await login({ email, password });
      setUser(userData); // Set user immediately from login response
      console.log("Logged in user:", userData);

      // Close the modal after successful login
      if (onClose) {
        onClose();
      }

      // Don't reload the page - React state will handle the update
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "object" && err !== null && "response" in err) {
        const apiErr = err as ApiError;
        setError(apiErr.response?.data?.message || "Login failed");
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchFlares = async () => {
      setFlaresLoading(true);
      try {
        const data = await getUserFlares();
        setFlares(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("Failed to fetch flares:", err.message);
        } else if (
          typeof err === "object" &&
          err !== null &&
          "response" in err
        ) {
          const apiErr = err as ApiError;
          console.error("Failed to fetch flares:", apiErr.response?.data);
        } else {
          console.error("Failed to fetch flares: Unknown error");
        }
      } finally {
        setFlaresLoading(false);
      }
    };

    fetchFlares();
  }, [user]);

  if (user) {
    return (
      <div className="text-white space-y-4">
        <h2 className="text-xl font-bold">Welcome, {user.name}!</h2>
        <div className="bg-gray-800 p-4 rounded text-left max-h-60 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-2">Your Flares:</h3>
          {flaresLoading ? (
            <p className="text-gray-400">Loading flares...</p>
          ) : flares.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {flares.map((flare, index) => (
                <li key={flare.id ?? index} className="break-words">
                  📍 <strong>Category:</strong> {flare.category || "N/A"} <br />
                  <strong>Note:</strong> {flare.note || "No note"} <br />
                  <small>
                    Lat: {flare.latitude}, Lon: {flare.longitude}
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No flares found.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleLogin}
      className="relative bg-gray-800 text-white p-6 rounded-xl shadow-lg space-y-4 w-full"
    >
      {/* Close Button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-white text-3xl hover:text-text-orange cursor-pointer"
        >
          &times;
        </button>
      )}

      <h1 className="text-2xl font-bold text-center">Login</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none"
        required
      />

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        className="w-full bg-text-orange text-black py-2 rounded font-semibold hover:bg-orange-200 transition cursor-pointer"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      {/* Toggle to Register */}
      {onToggleForm && (
        <button
          type="button"
          onClick={onToggleForm}
          className="block mx-auto mt-4 text-text-orange hover:underline text-sm cursor-pointer"
        >
          Don’t have an account? Register
        </button>
      )}
    </form>
  );
};

export default LoginForm;
