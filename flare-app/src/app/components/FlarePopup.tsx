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
            <div className="space-y-6 text-gray-700 dark:text-gray-300">
              {/* Header Section - Flare Title & Category */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                    {flare.note}
                  </h3>
                  {flare.category && (
                    <span
                      className={`px-3 py-1 rounded-full text-white text-sm font-medium ${
                        flare.category === "blue"
                          ? "bg-blue-500"
                          : flare.category === "violet"
                          ? "bg-purple-500"
                          : "bg-gray-500"
                      }`}
                    >
                      {flare.category}
                    </span>
                  )}
                </div>

                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-sm">
                    {flare.place?.name || "Location not specified"}
                  </span>
                </div>
              </div>

              {/* User Section */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300">
                    {flare.user?.profile_photo_url ? (
                      <Image
                        src={flare.user.profile_photo_url}
                        alt="User profile"
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {flare.user?.name?.charAt(0).toUpperCase() ||
                          flare.user?.username?.charAt(0).toUpperCase() ||
                          "?"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Dropped by{" "}
                      {flare.user?.name ||
                        flare.user?.username ||
                        "Unknown User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {flare.created_at
                        ? new Date(flare.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "Recently"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-orange-600 dark:text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                    {flare.participantsCount ?? 1} participant
                    {(flare.participantsCount ?? 1) !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="flex items-center space-x-1 text-orange-600 dark:text-orange-400">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium">Active</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleNavigate}
                  className="w-full py-3 bg-accent-color text-white rounded-lg font-medium hover:bg-text-orange transition-colors cursor-pointer flex items-center justify-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.553-.894L15 10m0 7V10m0 7l-6-3m6 3V7"
                    />
                  </svg>
                  <span>Navigate to Location</span>
                </button>

                <button
                  onClick={() => onAddToFlare(flare)}
                  className="w-full py-3 bg-accent-color text-white rounded-lg font-medium hover:bg-text-orange transition-colors cursor-pointer flex items-center justify-center space-x-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span>Join this Flare</span>
                </button>

                {isUserFlare && (
                  <button
                    onClick={() => flare.id && onDeleteFlare(flare.id)}
                    disabled={isDeleting || !flare.id}
                    className="w-full py-3 bg-red-600 rounded-lg text-white font-medium hover:bg-red-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span>{isDeleting ? "Deleting..." : "Delete Flare"}</span>
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
