"use client";
import "mapbox-gl/dist/mapbox-gl.css";
import { useState } from "react";
import { Map, Popup, Marker, ViewState } from "react-map-gl/mapbox";
import SearchBox from "./SearchBox";
import FlareMap from "./FlareMap";

const MapWrapper = () => {
  const [viewport, setViewport] = useState<ViewState>({
    latitude: 36.38282,
    longitude: -122.474737,
    zoom: 13,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });
  return (
    <div className="relative w-full h-[500px]">
      <FlareMap viewport={viewport} setViewport={setViewport} />
      <SearchBox
        onSelect={(lng: number, lat: number) => {
          setViewport((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            zoom: 13,
          }));
        }}
      />
    </div>
  );
};

export default MapWrapper;
