"use client";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/context/UserContext";
import { getUserFlares } from "@/lib/axios";

const AccountPage = () => {
  const { user } = useContext(UserContext);
  const [flares, setFlares] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlares = async () => {
      try {
        const data = await getUserFlares();
        setFlares(data);
      } catch (err) {
        console.error("Failed to load flares", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchFlares();
  }, [user]);

  if (!user) return <div className="p-8 text-white">Please log in.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 space-y-8">
      <div className="flex items-center gap-4">
        <img
          src={user.avatar || "/default-avatar.png"}
          alt="avatar"
          className="w-20 h-20 rounded-full border-2 border-lime-400"
        />
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-400">{user.email}</p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Your Flares</h2>
        {loading ? (
          <p>Loading...</p>
        ) : flares.length > 0 ? (
          <ul className="space-y-2">
            {flares.map((flare) => (
              <li
                key={flare.id}
                className="bg-gray-800 p-4 rounded-md shadow-sm border border-lime-400"
              >
                <p>
                  📍 <strong>{flare.category}</strong> —{" "}
                  {flare.note || "No note"}
                </p>
                <small>
                  Lat: {flare.latitude}, Lon: {flare.longitude}
                </small>
              </li>
            ))}
          </ul>
        ) : (
          <p>No flares found.</p>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
