"use client";
import Image from "next/image";
import { useState } from "react";

const Logo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "usage">("about");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {/* Logo Button */}
      <div
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-accent-color p-2 rounded-full cursor-pointer hover:scale-110 transition-transform duration-200"
        style={{ zIndex: 1000 }}
        onClick={openModal}
      >
        <Image
          src="/logo.png"
          alt="logo"
          width={40}
          height={40}
          className="h-10 w-10"
        />
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
          onClick={closeModal}
        >
          {/* Modal Content */}
          <div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-11/12 max-w-2xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="logo"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Flare
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab("about")}
                className={`flex-1 py-3 px-6 text-center font-medium transition-colors ${
                  activeTab === "about"
                    ? "bg-accent-color text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                About
              </button>
              <button
                onClick={() => setActiveTab("usage")}
                className={`flex-1 py-3 px-6 text-center font-medium transition-colors ${
                  activeTab === "usage"
                    ? "bg-accent-color text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                Usage
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 overflow-y-auto max-h-96">
              {activeTab === "about" && (
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    About Flare
                  </h3>
                  <p>
                    Flare is a location-based social platform that allows users
                    to share moments, events, and experiences tied to specific
                    geographic locations. Create flares to mark interesting
                    spots, share photos, and connect with others in your area.
                  </p>
                  <p>
                    {`Whether you're discovering`}, sharing local insights, or
                    connecting with your community, Flare helps you explore the
                    world around you in a whole new way.
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                      Key Features:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Create location-based posts (flares)</li>
                      <li>Share photos and experiences</li>
                      <li>Discover nearby content</li>
                      <li>Connect with local community</li>
                      <li>Real-time map exploration</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "usage" && (
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    How to Use Flare
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                        🗺️ Navigate the Map
                      </h4>
                      <p className="text-sm">
                        Use the location button to center on your position.
                        Search for places using the search box. Drag and zoom to
                        explore different areas.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                        🔥 Create a Flare
                      </h4>
                      <p className="text-sm">
                        Click anywhere on the map to create a new flare. Add a
                        title, description, category, and optional photo to
                        share your experience.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                        👤 Manage Your Profile
                      </h4>
                      <p className="text-sm">
                        Click your profile picture in the top-right to access
                        your account, view your flares, and update your profile
                        information.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                        🔍 Discover Content
                      </h4>
                      <p className="text-sm">
                        Click on flare markers to view details, photos, and
                        interact with content shared by other users in your
                        area.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-accent-color text-white rounded-lg hover:bg-text-orange transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Logo;
