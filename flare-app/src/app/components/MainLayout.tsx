"use client";

import React, { useState, useEffect } from "react";
import HotFlares from "./HotFlares";
import Logo from "./Logo";
import { Flare } from "./HotFlares"; // or import from @/types/flare if you prefer
import MapWrapper from "./MapWrapper";
import { getAllFlares } from "@/lib/axios"; // Adjust the import path

const MainLayout = () => {
  const [flares, setFlares] = useState<Flare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch all flares
  const fetchFlares = async () => {
    try {
      setLoading(true);
      setError(null);

      const allFlares = await getAllFlares();
      setFlares(allFlares);

      console.log("✅ Flares loaded successfully:", allFlares.length);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch flares";
      setError(errorMessage);
      console.error("❌ Error loading flares:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch flares when component mounts
  useEffect(() => {
    fetchFlares();
  }, []);

  // Optional: Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("🔄 Auto-refreshing flares...");
      fetchFlares();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Handle fly to flare (you can integrate this with your MapWrapper)
  const handleFlyToFlare = (lat: number, lng: number) => {
    console.log("🗺️ Flying to flare:", lat, lng);
    // TODO: Integrate with your map component
  };

  return (
    <div className="relative w-screen h-screen">
      <Logo />

      {/* Show HotFlares only when we have data and not loading */}
      {!loading && flares.length > 0 && (
        <HotFlares flares={flares} onFlyToFlare={handleFlyToFlare} />
      )}

      <MapWrapper />

      {/* Optional: Show loading indicator */}
      {loading && (
        <div className="fixed bottom-6 right-6 bg-[#192736]/90 text-white p-3 rounded-full shadow-xl z-40">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
            <span className="text-sm">Loading flares...</span>
          </div>
        </div>
      )}

      {/* Optional: Show error (but don't break the layout) */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-600/90 text-white p-3 rounded-lg shadow-xl z-50 max-w-sm">
          <p className="text-sm">Failed to load flares: {error}</p>
          <button
            onClick={fetchFlares}
            className="mt-2 px-3 py-1 bg-red-700 hover:bg-red-800 rounded text-xs"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
