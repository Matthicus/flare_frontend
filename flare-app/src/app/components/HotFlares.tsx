"use client";
import React, { useState, useRef } from "react";

export type Flare = {
  id?: number;
  latitude: number;
  longitude: number;
  note: string;
  category: "regular" | "blue" | "violet";
  participantsCount?: number;
  place?: {
    name: string;
  } | null;
};

type HotFlaresProps = {
  flares: Flare[];
  onFlyToFlare?: (lat: number, lng: number) => void;
};

type TabType = "hot" | "all";

const HotFlares = ({ flares, onFlyToFlare }: HotFlaresProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("hot");
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);

  // Hot flares: more than 2 participants
  const hotFlares = [...flares]
    .filter((f) => f.participantsCount && f.participantsCount > 2)
    .sort((a, b) => (b.participantsCount ?? 0) - (a.participantsCount ?? 0))
    .slice(0, 10); // Show top 10 hot flares

  // All flares: sorted by participants count (descending), then by most recent
  const allFlares = [...flares]
    .sort((a, b) => {
      // First sort by participant count (descending)
      const participantDiff =
        (b.participantsCount ?? 0) - (a.participantsCount ?? 0);
      if (participantDiff !== 0) return participantDiff;

      // If same participant count, sort by ID (assuming higher ID = more recent)
      return (b.id ?? 0) - (a.id ?? 0);
    })
    .slice(0, 20); // Show top 20 flares

  // Determine which flares to show based on active tab
  const displayFlares = activeTab === "hot" ? hotFlares : allFlares;

  // Touch handlers for swipe-up gesture
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isExpanded) return;
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isExpanded) return;
    const currentY = e.touches[0].clientY;
    const deltaY = startY.current - currentY;

    // Only allow upward movement
    if (deltaY > 0) {
      setDragY(Math.min(deltaY, 100)); // Max drag distance
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    // If dragged more than 50px up, expand the component
    if (dragY > 50) {
      setIsExpanded(true);
    }

    setDragY(0);
    setIsDragging(false);
  };

  // Show button if we have any flares at all
  if (flares.length === 0) return null;

  return (
    <>
      {!isExpanded && (
        <>
          {/* Swipe indicator for mobile - positioned above button */}
          <div className="md:hidden fixed bottom-20 right-4 left-4 flex justify-center z-[999]">
            <div
              className={`h-1 rounded-full transition-all duration-200 ${
                dragY > 20
                  ? "bg-yellow-400 w-12"
                  : isDragging
                  ? "bg-yellow-400/70 w-10"
                  : "bg-white/40 w-8"
              }`}
            />
          </div>

          {/* Mobile hint text */}
          <div className="md:hidden fixed bottom-16 right-4 left-4 text-center z-[999]">
            <p className="text-xs text-white/70">
              {isDragging ? "Keep pulling..." : "Swipe up for flares"}
            </p>
          </div>

          <button
            className="fixed bottom-6 right-6 bg-[#192736]/90 text-white p-4 rounded-full shadow-xl z-[1001] hover:bg-[#192736] transition-all cursor-pointer"
            onClick={() => setIsExpanded(true)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              transform: `translateY(-${dragY}px) scale(${1 + dragY * 0.002})`,
              transition: isDragging ? "none" : "transform 0.3s ease",
            }}
          >
            <span className="text-yellow-400 text-xl">🔥</span>
            <span className="sr-only">Show flares</span>
          </button>
        </>
      )}

      {isExpanded && (
        <>
          {/* Backdrop for mobile */}
          <div
            className="md:hidden fixed inset-0 bg-black/30 z-[1000]"
            onClick={() => setIsExpanded(false)}
          />

          <div className="fixed bottom-0 right-0 left-0 md:left-auto md:bottom-6 md:right-6 bg-[#192736]/90 text-white rounded-t-xl md:rounded-xl shadow-xl z-[1001] max-h-[70vh] w-full md:w-96 transition-all">
            {/* Mobile drag handle */}
            <div className="md:hidden flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 bg-gray-400 rounded-full" />
            </div>

            {/* Header with close button */}
            <div className="flex justify-between items-center p-4 border-b border-gray-600">
              <h2 className="text-lg font-bold text-yellow-400">🔥 Flares</h2>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-white text-2xl p-1 hover:text-orange-400 cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-600">
              <button
                onClick={() => setActiveTab("hot")}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === "hot"
                    ? "text-yellow-400 border-b-2 border-yellow-400 bg-gray-800/50"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/30"
                }`}
              >
                Hot Flares
                {hotFlares.length > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                    {hotFlares.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("all")}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === "all"
                    ? "text-yellow-400 border-b-2 border-yellow-400 bg-gray-800/50"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/30"
                }`}
              >
                All Flares
                <span className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                  {allFlares.length}
                </span>
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-2 max-h-[calc(70vh-120px)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {displayFlares.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  {activeTab === "hot"
                    ? "No hot flares right now 🥶"
                    : "No flares found"}
                </div>
              ) : (
                <ul>
                  {displayFlares.map((flare, i) => (
                    <li
                      key={flare.id ?? i}
                      className="p-3 my-1 bg-gray-800 rounded hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => {
                        onFlyToFlare?.(flare.latitude, flare.longitude);
                        setIsExpanded(false);
                      }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold truncate flex-1">
                          {flare.note}
                        </p>
                        {activeTab === "hot" && (
                          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full ml-2">
                            🔥 HOT
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 truncate">
                        {flare.place?.name ?? "Unknown location"}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-sm text-purple-400">
                          {flare.participantsCount ?? 0} participants
                        </p>
                        {flare.category && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              flare.category === "blue"
                                ? "bg-blue-500/20 text-blue-300"
                                : flare.category === "violet"
                                ? "bg-purple-500/20 text-purple-300"
                                : "bg-gray-500/20 text-gray-300"
                            }`}
                          >
                            {flare.category}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default HotFlares;
