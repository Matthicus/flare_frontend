"use client";
import "mapbox-gl/dist/mapbox-gl.css";
import { useState, useEffect } from "react";
import { ViewState } from "react-map-gl/mapbox";
import FlareMap from "./FlareMap";
import SearchBox from "./SearchBox";
import { useGeolocation } from "@/hooks/useGeolocation";
import EnableLocation from "./EnableLocation";
import AuthBtns from "./AuthBtns";
import router from "next/router";
import { UserContext } from "@/context/UserContext";
import { useContext } from "react";

const MapWrapper = () => {
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

  return (
    <>
      <div className="relative w-screen h-screen">
        <FlareMap
          viewport={viewport}
          setViewport={setViewport}
          userLocation={userLocation}
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
              <img
                className="w-5 h-5 cursor-pointer hover:scale-110 transition"
                src="/logo.png"
                alt="logo"
                onClick={() => router.push("/account")}
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
