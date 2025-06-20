"use client";
import React, { useState, useRef, useContext } from "react";
import { UserContext } from "@/context/UserContext";
import { Flare } from "@/types/flare";

type HotFlaresProps = {
  flares: Flare[];
  onFlyToFlare?: (lat: number, lng: number) => void;
};

type TabType = "hot" | "all";

const HotFlares = ({ flares, onFlyToFlare }: HotFlaresProps) => {
  const { user } = useContext(UserContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("hot");
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startDragY = useRef(0);

  // Helper function to format time ago
  const formatTimeAgo = (date: Date | string | undefined) => {
    if (!date) return "Unknown time";

    const now = new Date();
    const flareDate = new Date(date);
    const diffMs = now.getTime() - flareDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return flareDate.toLocaleDateString();
  };

  // Helper function to display username
  const getDisplayUsername = (flare: Flare) => {
    // Check if this flare was dropped by the current user
    if (user && flare.user && flare.user.id === user.id) {
      return "You";
    }

    // Use the username from the flare's user object
    return flare.user?.username ?? "Anonymous";
  };

  const hotFlares = [...flares]
    .filter((f) => f.participantsCount && f.participantsCount > 2)
    .sort((a, b) => (b.participantsCount ?? 0) - (a.participantsCount ?? 0))
    .slice(0, 10);

  const allFlares = [...flares]
    .sort((a, b) => {
      const participantDiff =
        (b.participantsCount ?? 0) - (a.participantsCount ?? 0);
      if (participantDiff !== 0) return participantDiff;
      return (b.id ?? 0) - (a.id ?? 0);
    })
    .slice(0, 20);

  const displayFlares = activeTab === "hot" ? hotFlares : allFlares;

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    startDragY.current = dragY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY.current;
    const newDragY = startDragY.current + deltaY;

    // Get window height for calculations
    const windowHeight = window.innerHeight;
    const headerHeight = 120; // Approximate height of header + tabs

    // Constrain drag within bounds
    // Min: fully expanded (negative value to show full content)
    // Max: collapsed (positive value, showing only peek)
    const minDragY = -(windowHeight - headerHeight - 100); // Leave some margin at top
    const maxDragY = windowHeight - 100; // Peek height

    const constrainedDragY = Math.max(minDragY, Math.min(maxDragY, newDragY));
    setDragY(constrainedDragY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const windowHeight = window.innerHeight;

    // Define snap points
    const fullyExpanded = -(windowHeight - 200); // Fully expanded
    const collapsed = windowHeight - 100; // Collapsed (peek)

    // Determine which snap point to go to based on current position and velocity
    if (dragY < fullyExpanded / 2) {
      // Snap to fully expanded
      setDragY(fullyExpanded);
      setIsExpanded(true);
    } else if (dragY > collapsed / 2) {
      // Snap to collapsed
      setDragY(collapsed);
      setIsExpanded(false);
    } else {
      // Snap to middle expanded state
      setDragY(0);
      setIsExpanded(true);
    }

    setIsDragging(false);
  };

  // Calculate transform based on dragY when not dragging
  const getTransform = () => {
    if (isDragging) {
      return `translateY(${dragY}px)`;
    }

    if (isExpanded) {
      return `translateY(0px)`;
    } else {
      return `translateY(calc(100% - 80px))`;
    }
  };

  if (flares.length === 0) return null;

  return (
    <>
      {/* Desktop floating button */}
      <div className="hidden md:block">
        {!isExpanded && (
          <button
            className="fixed bottom-6 right-6 bg-[#192736]/90 text-white p-4 rounded-full shadow-xl hover:bg-[#192736] transition-all cursor-pointer z-[1001]"
            onClick={() => setIsExpanded(true)}
          >
            <span className="text-yellow-400 text-xl">🔥</span>
            <span className="sr-only">Show flares</span>
          </button>
        )}

        {isExpanded && (
          <>
            <div
              className="fixed inset-0 bg-black/30 z-[1000]"
              onClick={() => setIsExpanded(false)}
            />
            <div className="fixed bottom-6 right-6 bg-[#192736]/95 text-white rounded-xl shadow-xl z-[1001] max-h-[80vh] w-96">
              <div className="flex justify-between items-center p-4 border-b border-gray-600">
                <h2 className="text-lg font-bold text-yellow-400">🔥 Flares</h2>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-white text-2xl p-1 hover:text-orange-400 cursor-pointer"
                >
                  ×
                </button>
              </div>

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

              <div className="overflow-y-auto p-2 max-h-[calc(80vh-140px)]">
                {displayFlares.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    {activeTab === "hot"
                      ? "No hot flares right now 🥶"
                      : "No flares found"}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {displayFlares.map((flare, i) => (
                      <div
                        key={flare.id ?? i}
                        className="w-full h-24 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition-all hover:scale-[1.02] relative overflow-hidden group"
                        onClick={() => {
                          onFlyToFlare?.(flare.latitude, flare.longitude);
                          setIsExpanded(false);
                        }}
                      >
                        {/* Background gradient */}
                        <div className="absolute inset-0 opacity-5">
                          <div className="w-full h-full bg-gradient-to-r from-yellow-400 to-orange-500" />
                        </div>

                        {/* Top badges */}
                        <div className="absolute top-2 right-2 flex gap-1 z-10">
                          {activeTab === "hot" && (
                            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                              <span className="text-xs">🔥</span>
                            </div>
                          )}
                          {flare.category !== "regular" && (
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                flare.category === "blue"
                                  ? "bg-blue-500"
                                  : "bg-purple-500"
                              }`}
                            >
                              <div className="w-3 h-3 bg-white rounded-full" />
                            </div>
                          )}
                        </div>

                        {/* Main content */}
                        <div className="relative z-10 h-full flex flex-col justify-between">
                          {/* Top section */}
                          <div className="flex-1">
                            <h3 className="font-bold text-white text-sm leading-tight mb-1 line-clamp-2 pr-16">
                              {flare.note}
                            </h3>

                            <div className="flex items-center text-xs text-gray-300">
                              <span className="mr-1">📍</span>
                              <span className="truncate">
                                {flare.place?.name ?? "Unknown"}
                              </span>
                            </div>
                          </div>

                          {/* Bottom metadata */}
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-4">
                              <span className="text-purple-400 flex items-center">
                                <span className="mr-1">👥</span>
                                {flare.participantsCount ?? 0}
                              </span>

                              <span
                                className={`flex items-center ${
                                  getDisplayUsername(flare) === "You"
                                    ? "text-green-400"
                                    : "text-blue-400"
                                }`}
                              >
                                <span className="mr-1">👤</span>
                                {getDisplayUsername(flare)}
                              </span>
                            </div>

                            <span className="text-gray-400 flex items-center">
                              <span className="mr-1">⏱️</span>
                              {formatTimeAgo(flare.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile bottom sheet */}
      <div className="md:hidden">
        <div
          className="fixed bottom-0 left-0 right-0 bg-[#192736]/95 text-white rounded-t-xl shadow-xl z-[1001]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: getTransform(),
            touchAction: "none",
            transition: isDragging ? "none" : "transform 0.3s ease-out",
            height: "100vh",
            minHeight: "100px",
          }}
        >
          <div className="p-4 border-b border-gray-600/50 cursor-grab active:cursor-grabbing">
            <div className="flex justify-center mb-3">
              <div className="w-10 h-1 bg-gray-400 rounded-full" />
            </div>
            <h2 className="text-lg font-bold text-yellow-400 text-center">
              🔥 Flares
            </h2>
          </div>

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

          <div className="overflow-y-auto p-2 flex-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {displayFlares.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                {activeTab === "hot"
                  ? "No hot flares right now 🥶"
                  : "No flares found"}
              </div>
            ) : (
              <div className="space-y-2 pb-safe">
                {displayFlares.map((flare, i) => (
                  <div
                    key={flare.id ?? i}
                    className="w-full h-24 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition-all hover:scale-[1.02] relative overflow-hidden group"
                    onClick={() => {
                      onFlyToFlare?.(flare.latitude, flare.longitude);
                      setIsExpanded(false);
                    }}
                  >
                    {/* Background gradient */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="w-full h-full bg-gradient-to-r from-yellow-400 to-orange-500" />
                    </div>

                    {/* Top badges */}
                    <div className="absolute top-2 right-2 flex gap-1 z-10">
                      {activeTab === "hot" && (
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-xs">🔥</span>
                        </div>
                      )}
                      {flare.category !== "regular" && (
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            flare.category === "blue"
                              ? "bg-blue-500"
                              : "bg-purple-500"
                          }`}
                        >
                          <div className="w-3 h-3 bg-white rounded-full" />
                        </div>
                      )}
                    </div>

                    {/* Main content */}
                    <div className="relative z-10 h-full flex flex-col justify-between">
                      {/* Top section */}
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-sm leading-tight mb-1 line-clamp-2 pr-16">
                          {flare.note}
                        </h3>

                        <div className="flex items-center text-xs text-gray-300">
                          <span className="mr-1">📍</span>
                          <span className="truncate">
                            {flare.place?.name ?? "Unknown"}
                          </span>
                        </div>
                      </div>

                      {/* Bottom metadata */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-4">
                          <span className="text-purple-400 flex items-center">
                            <span className="mr-1">👥</span>
                            {flare.participantsCount ?? 0}
                          </span>

                          <span
                            className={`flex items-center ${
                              getDisplayUsername(flare) === "You"
                                ? "text-green-400"
                                : "text-blue-400"
                            }`}
                          >
                            <span className="mr-1">👤</span>
                            {getDisplayUsername(flare)}
                          </span>
                        </div>

                        <span className="text-gray-400 flex items-center">
                          <span className="mr-1">⏱️</span>
                          {formatTimeAgo(flare.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HotFlares;
