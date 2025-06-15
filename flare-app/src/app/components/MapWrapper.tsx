"use client";
import "mapbox-gl/dist/mapbox-gl.css";
import { useState, useEffect, useContext } from "react";
import { ViewState } from "react-map-gl/mapbox";
import FlareMap from "./FlareMap";
import SearchBox from "./SearchBox";
import { useGeolocation } from "@/hooks/useGeolocation";
import EnableLocation from "./EnableLocation";
import AuthBtns from "./AuthBtns";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/UserContext";
import Image from "next/image";
import { Flare } from "@/types/flare";

type MapWrapperProps = {
  flyToCoords?: { lat: number; lng: number; zoom: number } | null;
  onFlyComplete?: () => void;
  flares: Flare[];
  addFlare: (
    flareData: Omit<Flare, "id" | "user_id">,
    photo?: File
  ) => Promise<Flare>;
  removeFlare: (id: number) => Promise<void>;
};

const MapWrapper = ({
  flyToCoords,
  onFlyComplete,
  flares,
  addFlare,
  removeFlare,
}: MapWrapperProps) => {
  const router = useRouter();
  const [viewport, setViewport] = useState<ViewState>({
    latitude: 36.38282,
    longitude: -122.474737,
    zoom: 13,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });
  const { user } = useContext(UserContext);

  const [locationEnabled, setLocationEnabled] = useState(false);
  const userLocation = useGeolocation(locationEnabled);

  // Handle user location updates
  useEffect(() => {
    console.log("userLocation:", userLocation);
    if (
      userLocation &&
      userLocation.lat !== undefined &&
      userLocation.lng !== undefined
    ) {
      setViewport((prev) => ({
        ...prev,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        zoom: 14,
      }));
    }
  }, [userLocation]);

  const handleRecenter = (lat: number, lng: number) => {
    setViewport((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      zoom: 16,
    }));
  };

  // Handle fly to coordinates from HotFlares
  useEffect(() => {
    if (flyToCoords) {
      setViewport((prev) => ({
        ...prev,
        latitude: flyToCoords.lat,
        longitude: flyToCoords.lng,
        zoom: flyToCoords.zoom,
      }));

      // Call onFlyComplete after the transition
      if (onFlyComplete) {
        setTimeout(() => {
          onFlyComplete();
        }, 1000); // Estimated transition time
      }
    }
  }, [flyToCoords, onFlyComplete]);

  return (
    <>
      <div className="relative w-screen h-screen">
        <FlareMap
          viewport={viewport}
          setViewport={setViewport}
          userLocation={userLocation}
          flares={flares}
          addFlare={addFlare}
          removeFlare={removeFlare}
        />

        {/* Left side controls - stacked vertically to prevent overlap */}
        <div className="absolute top-4 left-4 z-40">
          <div className="flex gap-4">
            <EnableLocation
              onEnable={() => setLocationEnabled(true)}
              enabled={locationEnabled}
              userLocation={userLocation}
              onRecenter={handleRecenter}
            />
            <SearchBox
              onSelect={(lng, lat) =>
                setViewport((prev) => ({
                  ...prev,
                  latitude: lat,
                  longitude: lng,
                  zoom: 13,
                }))
              }
            />
          </div>
        </div>

        {/* Right side controls */}
        <div className="absolute top-4 right-4 z-40">
          <div className="flex items-center gap-4">
            {user && (
              <div
                className="relative w-10 h-10 cursor-pointer hover:scale-110 transition-transform duration-200 rounded-full overflow-hidden border-2 border-white shadow-lg"
                onClick={() => router.push("/account")}
              >
                {user.profile_photo_url ? (
                  <Image
                    src={user.profile_photo_url}
                    alt="Profile picture"
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {user.name?.charAt(0).toUpperCase() ||
                      user.username?.charAt(0).toUpperCase() ||
                      "U"}
                  </div>
                )}
              </div>
            )}
            <AuthBtns />
          </div>
        </div>
      </div>
    </>
  );
};

export default MapWrapper;
