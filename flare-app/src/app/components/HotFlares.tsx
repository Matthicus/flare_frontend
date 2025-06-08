"use client";
import React from "react";

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
  const hottest = [...flares]
    .filter((f) => f.participantsCount && f.participantsCount > 1)
    .sort((a, b) => (b.participantsCount ?? 0) - (a.participantsCount ?? 0))
    .slice(0, 5);

  if (hottest.length === 0) return null;

  return (
    <div className="absolute bottom-6 right-6 bg-[#192736]/70 text-white p-4 rounded-xl shadow-xl w-72 z-50">
      <h2 className="text-lg font-bold mb-3 text-yellow-400">
        🔥 Hottest Flares
      </h2>
      <ul className="space-y-2">
        {hottest.map((flare, i) => (
          <li
            key={flare.id ?? i}
            className="p-2 bg-gray-800 rounded hover:bg-gray-700 cursor-pointer"
            onClick={() => {
              if (onFlyToFlare) {
                onFlyToFlare(flare.latitude, flare.longitude);
              }
            }}
          >
            <p className="font-semibold">{flare.note}</p>
            <p className="text-sm text-gray-300">
              {flare.place?.name ?? "Unknown location"}
            </p>
            <p className="text-sm text-purple-400">
              Participants: {flare.participantsCount}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HotFlares;
