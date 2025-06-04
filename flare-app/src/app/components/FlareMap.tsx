"use client";
import { Map, Marker, Popup } from "react-map-gl/mapbox";
import type { ViewState, MapMouseEvent } from "react-map-gl/mapbox";
import { useState, useEffect, useRef, useCallback } from "react";
import { postFlare } from "@/lib/axios";

type Flare = {
  id?: number;
  latitude: number;
  longitude: number;
  note: string;
  category: "regular" | "blue" | "violet"; // will be calculated dynamically
  user_id?: number;
  place_id?: number | null;
  place?: {
    mapbox_id: string;
    name: string;
  } | null;
  participantsCount?: number; // new
};

type FlareMapProps = {
  viewport: ViewState;
  setViewport: (v: ViewState) => void;
  onMapLoad?: () => void;
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
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedFlareId, setSelectedFlareId] = useState<number | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<ViewState>(viewport);
  const getCategory = (count: number = 0): Flare["category"] => {
    if (count >= 100) return "blue";
    if (count >= 18) return "violet";
    return "regular";
  };

  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;

    let didSetInitialCenter = false;
    const watcherId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        if (!didSetInitialCenter) {
          setViewport({
            ...viewportRef.current,
            latitude,
            longitude,
            zoom: 14,
          });
          didSetInitialCenter = true;
        } else {
          setViewport({ ...viewportRef.current, latitude, longitude });
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watcherId);
    };
  }, [setViewport]);

  useEffect(() => {
    const saved = localStorage.getItem("flares");
    if (saved) {
      try {
        const { flares: savedFlares, timestamp } = JSON.parse(saved);
        const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000;
        if (!isExpired) {
          setFlares(savedFlares);
        } else {
          localStorage.removeItem("flares");
        }
      } catch {
        localStorage.removeItem("flares");
      }
    }
  }, []);

  useEffect(() => {
    if (flares.length > 0) {
      const dataToStore = { flares, timestamp: Date.now() };
      localStorage.setItem("flares", JSON.stringify(dataToStore));
    }
  }, [flares]);

  const handleMapClick = (e: MapMouseEvent) => {
    const map = e.target as mapboxgl.Map;
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["poi-label"],
    });
    const placeFeature = features.find(
      (f) => f.layer?.id === "poi-label" && f.properties?.["name_en"]
    );

    if (placeFeature) {
      const mapbox_id = placeFeature.id?.toString() ?? crypto.randomUUID();
      const name = placeFeature.properties?.["name_en"] as string;
      setSelectedPlace({ mapbox_id, name });
    } else {
      setSelectedPlace(null);
    }

    setNewFlareLocation({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    setNote("");
    setCategory("regular");
    setSelectedFlareId(null);
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
        user_id: 3,
        place: selectedPlace
          ? { mapbox_id: selectedPlace.mapbox_id, name: selectedPlace.name }
          : null,
      };

      const saved = await postFlare(newFlarePayload);

      // Check if flare exists nearby
      const existingFlareIndex = flares.findIndex(
        (f) =>
          Math.abs(f.latitude - newFlareLocation.lat) < 0.0001 &&
          Math.abs(f.longitude - newFlareLocation.lng) < 0.0001
      );

      if (existingFlareIndex !== -1) {
        const updatedFlares = [...flares];
        const existingFlare = updatedFlares[existingFlareIndex];

        existingFlare.participantsCount =
          (existingFlare.participantsCount ?? 1) + 1;

        // Recalculate category based on new count
        existingFlare.category = getCategory(existingFlare.participantsCount);

        setFlares(updatedFlares);
      } else {
        saved.participantsCount = 1;
        saved.category = getCategory(1);
        setFlares((prev) => [...prev, saved]);
      }

      setNewFlareLocation(null);
      setSelectedPlace(null);
    } catch (err: any) {
      console.error("Failed to post flare:", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // New function to handle "Add to Flare" button click
  const handleAddToFlare = (flare: Flare) => {
    setSelectedFlareId(null);
    setNewFlareLocation({ lat: flare.latitude, lng: flare.longitude });
    setNote("");
    setCategory("regular");
    if (flare.place) {
      setSelectedPlace(flare.place);
    } else {
      setSelectedPlace(null);
    }
  };

  const handleClickAway = useCallback(
    (e: MouseEvent) => {
      if (!mapContainerRef.current) return;
      if (
        !(
          e.target instanceof HTMLElement &&
          (e.target.closest(".flare-popup") ||
            e.target.closest(".flare-marker"))
        )
      ) {
        setSelectedFlareId(null);
      }
    },
    [setSelectedFlareId]
  );

  useEffect(() => {
    document.addEventListener("click", handleClickAway);
    return () => {
      document.removeEventListener("click", handleClickAway);
    };
  }, [handleClickAway]);

  return (
    <>
      <style>
        {`
          @keyframes pulsate {
            0% { transform: scale(1); }
            50% { transform: scale(1.15); }
            100% { transform: scale(1); }
          }

          .flare-marker img {
            animation: pulsate 2s ease-in-out infinite;
          }

          .flare-popup > div {
            background: rgba(0, 0, 0, 0.75) !important;
            color: white !important;
            max-width: 16rem;
            padding: 1rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            white-space: pre-wrap;
            word-break: break-word;
          }
        `}
      </style>

      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }}>
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
              <div
                className="text-2xl cursor-pointer flare-marker"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFlareId(flare.id ?? null);
                }}
              >
                {flare.category === "blue" && (
                  <img className="w-8" src="/blue_flare.png" alt="Blue Flare" />
                )}
                {flare.category === "violet" && (
                  <img
                    className="w-8"
                    src="/violet_flare.png"
                    alt="Violet Flare"
                  />
                )}
                {flare.category === "regular" && (
                  <img
                    className="w-8"
                    src="/orange_flare.png"
                    alt="Regular Flare"
                  />
                )}
              </div>
            </Marker>
          ))}

          {selectedFlareId !== null &&
            flares
              .filter((flare) => flare.id === selectedFlareId)
              .map((flare) => (
                <Popup
                  key={flare.id}
                  latitude={flare.latitude}
                  longitude={flare.longitude}
                  onClose={() => setSelectedFlareId(null)}
                  closeOnClick={false}
                  anchor="top"
                  offset={[0, -10]}
                  className="flare-popup"
                >
                  <div className="space-y-2">
                    <div>{flare.note}</div>

                    {/* Add the counter display */}
                    <div className="text-sm font-semibold text-yellow-300">
                      Participants: {flare.participantsCount ?? 1} people
                    </div>

                    <button
                      onClick={() => {
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${flare.latitude},${flare.longitude}`;
                        window.open(url, "_blank");
                      }}
                      className="w-full py-1 bg-blue-600 rounded text-white font-semibold hover:bg-blue-500 transition"
                    >
                      Navigate to
                    </button>
                    <button
                      onClick={() => handleAddToFlare(flare)}
                      className="w-full py-1 bg-green-600 rounded text-white font-semibold hover:bg-green-500 transition"
                    >
                      Add to Flare
                    </button>
                  </div>
                </Popup>
              ))}

          {newFlareLocation && (
            <Popup
              latitude={newFlareLocation.lat}
              longitude={newFlareLocation.lng}
              onClose={() => setNewFlareLocation(null)}
              closeOnClick={false}
            >
              <div className="space-y-2">
                <h3 className="font-semibold text-black">Drop a Flare</h3>
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

          {userLocation && (
            <Marker
              longitude={userLocation.lng}
              latitude={userLocation.lat}
              anchor="center"
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  backgroundColor: "orange",
                  border: "2px solid white",
                  boxShadow: "0 0 6px rgba(0, 0, 255, 0.6)",
                }}
              />
            </Marker>
          )}
        </Map>
      </div>
    </>
  );
};

export default FlareMap;
