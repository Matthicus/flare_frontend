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
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);

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
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentY = e.touches[0].clientY;
    const deltaY = startY.current - currentY;

    if (isExpanded) {
      // When expanded, allow dragging down to collapse
      setDragOffset(Math.min(0, -deltaY));
    } else {
      // When collapsed, allow dragging up to expand
      setDragOffset(Math.max(0, deltaY));
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const threshold = 100;

    if (!isExpanded && dragOffset > threshold) {
      setIsExpanded(true);
    } else if (isExpanded && dragOffset < -threshold) {
      setIsExpanded(false);
    }

    setDragOffset(0);
    setIsDragging(false);
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
      </div>

      {/* Mobile bottom sheet - always present */}
      <div className="md:hidden">
        <div
          className="fixed bottom-0 left-0 right-0 bg-[#192736]/95 text-white rounded-t-xl shadow-xl z-[1001] transition-transform duration-300 ease-out"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: isExpanded
              ? `translateY(${Math.max(0, dragOffset)}px)`
              : `translateY(calc(100% - 60px + ${Math.min(0, -dragOffset)}px))`,
            touchAction: "none",
            transition: isDragging ? "none" : "transform 0.3s ease-out",
          }}
        >
          {/* Drag handle and peek header */}
          <div className="p-4 border-b border-gray-600/50">
            <div className="flex justify-center mb-3">
              <div className="w-10 h-1 bg-gray-400 rounded-full" />
            </div>
            <h2 className="text-lg font-bold text-yellow-400 text-center">
              🔥 Flares
            </h2>
          </div>

          {/* Tabs */}
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
          <div className="overflow-y-auto p-2 h-[60vh] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
      </div>
    </>
  );
};

export default HotFlares;
