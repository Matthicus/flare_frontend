"use client";
import { Map, Marker, Popup } from "react-map-gl/mapbox";
import type { ViewState, MapMouseEvent } from "react-map-gl/mapbox";
import { useState } from "react";
import { postFlare } from "@/lib/axios"; // ✅ make sure this is correct

type Flare = {
  id?: number;
  latitude: number;
  longitude: number;
  note: string;
  category: "regular" | "blue" | "violet";
  user_id?: number; // add user_id here for typing
};

type FlareMapProps = {
  viewport: ViewState;
  setViewport: (v: ViewState) => void;
};

const FlareMap = ({ viewport, setViewport }: FlareMapProps) => {
  const [flares, setFlares] = useState<Flare[]>([]);
  const [newFlareLocation, setNewFlareLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [note, setNote] = useState("");
  const [category, setCategory] = useState<"regular" | "blue" | "violet">(
    "regular"
  );
  const [submitting, setSubmitting] = useState(false);

  const handleMapClick = (e: MapMouseEvent) => {
    const { lat, lng } = e.lngLat;
    setNewFlareLocation({ lat, lng });
    setNote("");
    setCategory("regular");
  };

  const handleSubmit = async () => {
    if (!newFlareLocation) return;

    setSubmitting(true);
    try {
      const newFlare: Flare = {
        latitude: newFlareLocation.lat,
        longitude: newFlareLocation.lng,
        note,
        category,
        user_id: 3, // <-- FIXED user_id for testing (replace with existing user id in your DB)
      };

      const saved = await postFlare(newFlare); // assumed to return the new Flare with ID
      setFlares((prev) => [...prev, saved]);
      setNewFlareLocation(null);
    } catch (err: any) {
      console.error("Failed to post flare:", err.message);
    } finally {
      setSubmitting(false);
    }
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
        >
          <div className="text-2xl cursor-pointer">
            {flare.category === "blue" && (
              <img className="w-8" src="/blue_flare.png" />
            )}
            {flare.category === "violet" && (
              <img className="w-8" src="/violet_flare.png" />
            )}
            {flare.category === "regular" && (
              <img className="w-8" src="/orange_flare.png" />
            )}
          </div>
        </Marker>
      ))}

      {newFlareLocation && (
        <Popup
          latitude={newFlareLocation.lat}
          longitude={newFlareLocation.lng}
          onClose={() => setNewFlareLocation(null)}
          closeOnClick={false}
        >
          <div className="space-y-2">
            <h3 className="font-semibold">Drop a Flare</h3>
            <textarea
              placeholder="Write a note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-1 rounded bg-gray-100 text-black"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Flare["category"])}
              className="w-full p-1 rounded bg-gray-100 text-black"
            >
              <option value="regular">Regular</option>
              <option value="blue">Blue</option>
              <option value="violet">Violet</option>
            </select>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-1 bg-lime-400 rounded text-black font-semibold hover:bg-lime-300 transition"
            >
              {submitting ? "Posting..." : "Post Flare"}
            </button>
          </div>
        </Popup>
      )}
    </Map>
  );
};

export default FlareMap;
