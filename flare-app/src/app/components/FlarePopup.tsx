// components/FlarePopup.tsx
import { useState } from "react";
import { Popup } from "react-map-gl/mapbox";
import { Flare } from "@/types/flare";
import Image from "next/image";

type FlarePopupProps = {
  flare: Flare;
  onClose: () => void;
  onAddToFlare: (flare: Flare) => void;
  onDeleteFlare: (id: number) => void;
  isDeleting?: boolean;
};

const FlarePopup = ({
  flare,
  onClose,
  onAddToFlare,
  onDeleteFlare,
  isDeleting = false,
}: FlarePopupProps) => {
  const [showPhoto, setShowPhoto] = useState(false);

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${flare.latitude},${flare.longitude}`;
    window.open(url, "_blank");
  };

  return (
    <Popup
      latitude={flare.latitude}
      longitude={flare.longitude}
      onClose={onClose}
      closeOnClick={false}
      anchor="top"
      offset={[0, -1]}
      className="flare-popup"
    >
      <div className="space-y-2 max-w-64 p-4 rounded-lg shadow-lg">
        <div>
          <p className="text-xl font-semibold">Title: {flare.note}</p>
          <p>At: {flare.place?.name || "No place selected"}</p>
        </div>

        <div className="text-sm font-semibold text-yellow-300">
          Participants: {flare.participantsCount ?? 1} people
        </div>

        {/* Photo toggle button */}
        {flare.photo_url && (
          <button
            onClick={() => setShowPhoto((prev) => !prev)}
            className="w-full py-1 bg-purple-600 rounded text-white font-semibold hover:bg-purple-500 transition"
          >
            {showPhoto ? "Hide Photo" : "View Photo"}
          </button>
        )}

        {/* Photo display */}
        {showPhoto && flare.photo_url && (
          <Image
            src={flare.photo_url}
            alt="Flare Photo"
            className="w-full h-auto rounded shadow"
            width={200}
            height={200}
          />
        )}

        {/* Action buttons */}
        <div className="space-y-1">
          <button
            onClick={handleNavigate}
            className="w-full py-1 bg-blue-600 rounded text-white font-semibold hover:bg-blue-500 transition"
          >
            Navigate to
          </button>

          <button
            onClick={() => onAddToFlare(flare)}
            className="w-full py-1 bg-green-600 rounded text-white font-semibold hover:bg-green-500 transition"
          >
            Add to Flare
          </button>

          <button
            onClick={() => flare.id && onDeleteFlare(flare.id)}
            disabled={isDeleting || !flare.id}
            className="w-full py-1 bg-red-600 rounded text-white font-semibold hover:bg-red-500 transition disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete Flare"}
          </button>
        </div>
      </div>
    </Popup>
  );
};

export default FlarePopup;
