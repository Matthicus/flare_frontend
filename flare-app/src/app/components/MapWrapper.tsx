"use client";
import "mapbox-gl/dist/mapbox-gl.css";
import { useState } from "react";
import { Map, Popup, Marker, ViewState } from "react-map-gl/mapbox";
import SearchBox from "./SearchBox";

const MapWrapper = () => {
  const [viewport, setViewport] = useState<ViewState>({
    latitude: 36.38282,
    longitude: -122.474737,
    zoom: 13,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  const dummyFlares = [
    {
      id: 1,
      latitude: 51.22335005994286,
      longitude: 4.410629844539044,
      place_name: "Dolores Park",
      type: "regular",
      note: "Live music in the park",
    },
    {
      id: 2,
      latitude: 51.22335005994283,
      longitude: 4.409629844539041,

      place_name: "Madison Square",
      type: "blue",
      note: "Dance competition going on in the square!",
    },
    {
      id: 3,
      latitude: 51.22335005994285,
      longitude: 4.408629844539046,
      place_name: "Stads Park",
      type: "violet",
      note: "Party at the park almost over",
    },
  ];

  const [selectedFlare, setSelectedFlare] = useState<
    (typeof dummyFlares)[0] | null
  >(null);

  return (
    <div className="relative w-full h-[500px]">
      <Map
        {...viewport}
        onMove={(evt) => setViewport(evt.viewState)}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mastos/cmatncfmk000y01pa59lcd2zx"
        style={{ width: "100%", height: "100%" }}
      >
        {dummyFlares.map((flare) => (
          <Marker
            key={flare.id}
            longitude={flare.longitude}
            latitude={flare.latitude}
            anchor="bottom"
            onClick={() => setSelectedFlare(flare)}
          >
            <div title={flare.place_name} className="text-2xl cursor-pointer">
              {flare.type === "blue" && "🔵"}
              {flare.type === "violet" && "🟣"}
              {flare.type === "regular" && "🟠"}
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
        <SearchBox
          onSelect={(lng, lat) =>
            setViewport((prev) => ({
              ...prev,
              longitude: lng,
              latitude: lat,
              zoom: 13,
            }))
          }
        />
      </Map>
    </div>
  );
};

export default MapWrapper;
