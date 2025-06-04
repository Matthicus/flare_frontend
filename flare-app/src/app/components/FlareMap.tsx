"use client";
import { Map, Marker, Popup } from "react-map-gl/mapbox";
import type { ViewState, MapMouseEvent } from "react-map-gl/mapbox";
import { useState, useEffect } from "react";
import { postFlare } from "@/lib/axios";

type Flare = {
  id?: number;
  latitude: number;
  longitude: number;
  note: string;
  category: "regular" | "blue" | "violet";
  user_id?: number;
  place_id?: number | null;
  place?: {
    mapbox_id: string;
    name: string;
  } | null;
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
  const [selectedPlace, setSelectedPlace] = useState<{
    mapbox_id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setViewport({
            ...viewport,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            zoom: 14, // zoom closer on user location
          });
        },
        (error) => {
          console.warn("Geolocation error:", error);
          // fallback if needed, e.g. keep existing viewport or set to a default city
        }
      );
    }
  }, []);

  const handleMapClick = (e: MapMouseEvent) => {
    const map = e.target as mapboxgl.Map;
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["poi-label"],
    });

    console.log("clicked features", features);

    // Prefer features with a valid 'name_en' property
    const placeFeature = features.find(
      (f) => f.layer?.id === "poi-label" && f.properties?.["name_en"]
    );

    if (placeFeature) {
      // Convert feature id to string or fallback
      const mapbox_id = placeFeature.id?.toString() ?? crypto.randomUUID();
      const name = placeFeature.properties?.["name_en"] as string;

      setSelectedPlace({ mapbox_id, name });
    } else {
      setSelectedPlace(null);
    }

    setNewFlareLocation({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    setNote("");
    setCategory("regular");
  };

  const handleSubmit = async () => {
    if (!newFlareLocation) return;

    setSubmitting(true);
    try {
      const newFlarePayload = {
        latitude: newFlareLocation.lat,
        longitude: newFlareLocation.lng,
        note,
        category,
        user_id: 3, // replace with real auth later
        // Send place as an object matching backend expected format
        place: selectedPlace
          ? {
              mapbox_id: selectedPlace.mapbox_id,
              name: selectedPlace.name,
            }
          : null,
      };

      console.log("Posting flare with payload:", newFlarePayload);

      const saved = await postFlare(newFlarePayload);
      setFlares((prev) => [...prev, saved]);
      setNewFlareLocation(null);
      setSelectedPlace(null);
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
      mapStyle="mapbox://styles/mapbox/streets-v12"
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

            {selectedPlace && (
              <div className="text-sm font-semibold text-blue-600">
                {selectedPlace.name}
              </div>
            )}

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
