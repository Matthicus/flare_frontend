"use client";
import "mapbox-gl/dist/mapbox-gl.css";
import { useState, useEffect, useContext } from "react";
import { ViewState } from "react-map-gl/mapbox";
import FlareMap from "./FlareMap";
import SearchBox from "./SearchBox";
import { useGeolocation } from "@/hooks/useGeolocation";
import EnableLocation from "./EnableLocation";
import AuthBtns from "./AuthBtns";
import router from "next/router";
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

        <div className="absolute top-4 left-4 z-40 flex gap-4">
          <EnableLocation
            onEnable={() => setLocationEnabled(true)}
            enabled={locationEnabled}
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

        <div className="absolute top-4 right-4 z-40">
          <div className="flex items-center gap-4">
            {user && (
              <Image
                className="w-5 h-5 cursor-pointer hover:scale-110 transition"
                src="/logo.png"
                alt="logo"
                onClick={() => router.push("/account")}
                width={20}
                height={20}
              />
            )}
            <AuthBtns />
          </div>
        </div>
      </div>
    </>
  );
};

export default MapWrapper;
