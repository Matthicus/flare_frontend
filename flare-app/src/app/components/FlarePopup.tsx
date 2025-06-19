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
  isUserFlare?: boolean; // Add this to determine if user can delete
};

type TabType = "info" | "images";

const FlarePopup = ({
  flare,
  onClose,
  onAddToFlare,
  onDeleteFlare,
  isDeleting = false,
  isUserFlare = false,
}: FlarePopupProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("info");

  // Mock images data - replace with actual images from your flare object
  const images = flare.photo_url ? [flare.photo_url] : [];
  // If you have multiple images, it might look like:
  // const images = flare.images || flare.photo_urls || [];

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
      closeButton={false}
      anchor="top"
      offset={[0, -1]}
      className="flare-popup"
      style={{
        borderRadius: "12px",
        padding: 0,
        border: "none",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      }}
    >
      <div className="bg-[#FAF9F6] dark:bg-accent-color rounded-xl shadow-2xl max-w-64 overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("info")}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors cursor-pointer ${
              activeTab === "info"
                ? "bg-text-orange text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            Flare Info
          </button>
          <button
            onClick={() => setActiveTab("images")}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors cursor-pointer ${
              activeTab === "images"
                ? "bg-text-orange text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            Images ({images.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === "info" && (
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              {/* Flare Information */}
              <div>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {flare.note}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  At: {flare.place?.name || "No place selected"}
                </p>
              </div>

              <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                Participants: {flare.participantsCount ?? 1} people
              </div>

              {flare.category && (
                <div className="text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-white ${
                      flare.category === "blue"
                        ? "bg-blue-500"
                        : flare.category === "violet"
                        ? "bg-purple-500"
                        : "bg-gray-500"
                    }`}
                  >
                    {flare.category}
                  </span>
                </div>
              )}

              {/* Action buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleNavigate}
                  className="w-full py-2 bg-accent-color text-white rounded-lg font-medium hover:bg-text-orange transition-colors cursor-pointer"
                >
                  Navigate to
                </button>

                <button
                  onClick={() => onAddToFlare(flare)}
                  className="w-full py-2 bg-accent-color text-white rounded-lg font-medium hover:bg-text-orange transition-colors cursor-pointer"
                >
                  Add to Flare
                </button>

                {isUserFlare && (
                  <button
                    onClick={() => flare.id && onDeleteFlare(flare.id)}
                    disabled={isDeleting || !flare.id}
                    className="w-full py-2 bg-red-600 rounded-lg text-white font-medium hover:bg-red-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? "Deleting..." : "Delete Flare"}
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === "images" && (
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
              {images.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  <p>No images available</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {images.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={imageUrl}
                        alt={`Flare image ${index + 1}`}
                        className="w-full h-auto rounded-lg shadow-md"
                        width={200}
                        height={200}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Close Button at Bottom */}
        <div className="flex justify-center p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-accent-color text-white rounded-lg hover:bg-text-orange transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Popup>
  );
};

export default FlarePopup;
