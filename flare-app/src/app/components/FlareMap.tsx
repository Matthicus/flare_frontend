"use client";
import { Map, Marker, Popup } from "react-map-gl/mapbox";
import type { ViewState, MapMouseEvent } from "react-map-gl/mapbox";
import { useState } from "react";
import { imageConfigDefault } from "next/dist/shared/lib/image-config";

type Flare = {
  id: number;
  latitude: number;
  longitude: number;
  place_name: string;
  type: string;
  note: string;
};

type FlareMapProps = {
  viewport: ViewState;
  setViewport: (v: ViewState) => void;
};

const FlareMap = ({ viewport, setViewport }: FlareMapProps) => {
  const [flares, setFlares] = useState<Flare[]>([
    {
      id: 1,
      latitude: 51.22335005994285,
      longitude: 4.408629844539046,
      place_name: "Dolores Park",
      type: "regular",
      note: "Live music in the park",
    },
  ]);
  const [selectedFlare, setSelectedFlare] = useState<Flare | null>(null);

  const handleMapClick = (e: MapMouseEvent) => {
    const { lng, lat } = e.lngLat;
    const newFlare: Flare = {
      id: Date.now(),
      latitude: lat,
      longitude: lng,
      place_name: "Custom Flare",
      type: "blue",
      note: "You dropped a flare here!",
    };
    setFlares((prev) => [...prev, newFlare]);
    setSelectedFlare(newFlare);
  };

  return (
    <Map
      {...viewport}
      onMove={(evt) => setViewport(evt.viewState)}
      onClick={handleMapClick}
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      mapStyle="mapbox://styles/mastos/cmatncfmk000y01pa59lcd2zx"
      style={{ width: "100%", height: "100%" }}
    >
      {flares.map((flare) => (
        <Marker
          key={flare.id}
          longitude={flare.longitude}
          latitude={flare.latitude}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            setSelectedFlare(flare);
          }}
        >
          <div className="text-2xl cursor-pointer">
            {flare.type === "blue" && (
              <img className="w-8" src="/blue_flare.png" />
            )}
            {flare.type === "Violet" && (
              <img className="w-8" src="/violet_flare.png" />
            )}
            {flare.type === "regular" && (
              <img className="w-8" src="/orange_flare.png" />
            )}
          </div>
        </Marker>
      ))}

      {selectedFlare && (
        <Popup
          latitude={selectedFlare.latitude}
          longitude={selectedFlare.longitude}
          onClose={() => setSelectedFlare(null)}
          closeOnClick={false}
        >
          <div>
            <h3 className="font-bold">{selectedFlare.place_name}</h3>
            <p>{selectedFlare.note}</p>
          </div>
        </Popup>
      )}
    </Map>
  );
};

export default FlareMap;
