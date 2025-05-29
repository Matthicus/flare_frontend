"use client";
import React, { useState, useEffect, useContext } from "react";
import { login, fetchCurrentUser, getUserFlares } from "../../lib/axios";
import { UserContext } from "@/context/UserContext"; // adjust path accordingly

const LoginForm = () => {
  const { user, setUser } = useContext(UserContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [flares, setFlares] = useState<any[]>([]);
  const [flaresLoading, setFlaresLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password });
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      console.log("Logged in user:", currentUser);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Login failed");
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
      } catch (err: any) {
        console.error(
          "Failed to fetch flares:",
          err.response?.data || err.message
        );
      } finally {
        setFlaresLoading(false);
      }
    };

    fetchFlares();
  }, [user]);

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="w-full max-w-sm">
          <div className="bg-green-700 p-6 rounded shadow-md text-center space-y-4">
            <h2 className="text-xl font-bold">Welcome, {user.name}!</h2>

            <div className="bg-gray-800 p-4 rounded text-left max-h-60 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-2">Your Flares:</h3>
              {flaresLoading ? (
                <p className="text-gray-400">Loading flares...</p>
              ) : flares.length > 0 ? (
                <ul className="list-disc list-inside space-y-1">
                  {flares.map((flare, index) => (
                    <li key={flare.id || index} className="break-words">
                      📍 <strong>Category:</strong> {flare.category || "N/A"}{" "}
                      <br />
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-sm">
        <form
          onSubmit={handleLogin}
          className="bg-gray-800 p-8 rounded shadow-md space-y-4"
        >
          <h1 className="text-2xl font-bold">Login</h1>

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
            className="w-full bg-lime-400 text-black py-2 rounded font-semibold hover:bg-lime-300 transition"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
