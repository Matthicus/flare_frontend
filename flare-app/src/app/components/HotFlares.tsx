"use client";
import React, { useState } from "react";

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

const HotFlares = ({ flares, onFlyToFlare }: HotFlaresProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hottest = [...flares]
    .filter((f) => f.participantsCount && f.participantsCount > 1)
    .sort((a, b) => (b.participantsCount ?? 0) - (a.participantsCount ?? 0))
    .slice(0, 5);

  if (hottest.length === 0) return null;

  return (
    <>
      {!isExpanded && (
        <button
          className="fixed bottom-6 right-6 bg-[#192736]/90 text-white p-4 rounded-full shadow-xl z-50 hover:bg-[#192736] transition-all cursor-pointer"
          onClick={() => setIsExpanded(true)}
        >
          <span className="text-yellow-400 text-xl">🔥</span>
          <span className="sr-only">Show hottest flares</span>
        </button>
      )}

      {isExpanded && (
        <div className="fixed bottom-0 right-0 left-0 md:left-auto md:bottom-6 md:right-6 bg-[#192736]/90 text-white rounded-t-xl md:rounded-xl shadow-xl z-50 max-h-[70vh] w-full md:w-96 transition-all">
          <div className="flex justify-between items-center p-4 border-b border-gray-600">
            <h2 className="text-lg font-bold text-yellow-400">
              🔥 Hottest Flares
            </h2>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-white text-2xl p-1 hover:text-text-orange cursor-pointer"
            >
              ×
            </button>
          </div>
          <ul className="overflow-y-auto p-2 max-h-[calc(70vh-60px)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {hottest.map((flare, i) => (
              <li
                key={flare.id ?? i}
                className="p-3 my-1 bg-gray-800 rounded hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => {
                  onFlyToFlare?.(flare.latitude, flare.longitude);
                  setIsExpanded(false);
                }}
              >
                <p className="font-semibold truncate">{flare.note}</p>
                <p className="text-sm text-gray-300 truncate">
                  {flare.place?.name ?? "Unknown location"}
                </p>
                <p className="text-sm text-purple-400">
                  {flare.participantsCount} participants
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default HotFlares;
