"use client";

import React, { useState } from "react";
import HotFlares from "./HotFlares";
import MapWrapper from "./MapWrapper";
import Logo from "./Logo";
import { useFlares } from "@/hooks/useFlares";

const MainLayout = () => {
  const { flares, loading, error, addFlare, removeFlare } = useFlares();
  const [flyToCoords, setFlyToCoords] = useState<{
    lat: number;
    lng: number;
    zoom: number;
  } | null>(null);

  // Handle fly to flare from HotFlares component
  const handleFlyToFlare = (lat: number, lng: number) => {
    console.log("🗺️ Flying to flare:", lat, lng);
    setFlyToCoords({ lat, lng, zoom: 14 }); // This was missing!
  };

  // Add debug logging
  console.log("🔍 MainLayout Debug:");
  console.log("- Loading:", loading);
  console.log("- Error:", error);
  console.log("- Flares count:", flares.length);

  return (
    <div className="relative w-screen h-screen">
      <Logo />
      {/* Show HotFlares when we have data and not loading */}
      {!loading && flares.length > 0 && (
        <HotFlares flares={flares} onFlyToFlare={handleFlyToFlare} />
      )}

      {/* Pass flares and actions to MapWrapper */}
      <MapWrapper
        flyToCoords={flyToCoords}
        onFlyComplete={() => setFlyToCoords(null)}
        flares={flares}
        addFlare={addFlare}
        removeFlare={removeFlare}
      />

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
        </div>
      )}
    </div>
  );
};

export default MainLayout;
