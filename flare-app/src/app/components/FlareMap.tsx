"use client";
import { Map, Marker, Popup } from "react-map-gl/mapbox";
import type { ViewState, MapMouseEvent } from "react-map-gl/mapbox";
import { useState, useEffect, useRef, useCallback } from "react";
import { postFlare } from "@/lib/axios";
import { postFlareWithPhoto } from "@/lib/axios";
import Modal from "./Modal";
import { deleteFlare } from "@/lib/axios";
import { Flare } from "@/types/flare";
import Image from "next/image";

type FlareMapProps = {
  viewport: ViewState;
  setViewport: (v: ViewState) => void;
  userLocation: { lat: number; lng: number } | null;
  onMapLoad?: () => void;
};

const FlareMap = ({ viewport, setViewport, userLocation }: FlareMapProps) => {
  const [flares, setFlares] = useState<Flare[]>([]);
  const [newFlareLocation, setNewFlareLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [showPhoto, setShowPhoto] = useState(false);
  const [note, setNote] = useState("");
  const [category, setCategory] = useState<"regular" | "blue" | "violet">(
    "regular"
  );
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<{
    mapbox_id: string;
    name: string;
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
      const flareData = {
        latitude: newFlareLocation.lat,
        longitude: newFlareLocation.lng,
        note,
        category,
        user_id: 3,
        place: selectedPlace
          ? { mapbox_id: selectedPlace.mapbox_id, name: selectedPlace.name }
          : undefined,
      };

      const saved = photo
        ? await postFlareWithPhoto(flareData, photo)
        : await postFlare(flareData);

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
        existingFlare.category = getCategory(existingFlare.participantsCount);

        setFlares(updatedFlares);
      } else {
        saved.participantsCount = 1;
        saved.category = getCategory(1);
        setFlares((prev) => [...prev, saved]);
      }

      setNewFlareLocation(null);
      setSelectedPlace(null);
      setPhoto(null); // clear after upload
    } catch (err) {
      if (err instanceof Error) {
        console.error("Failed to post flare:", err.message);
      } else {
        console.error("Failed to post flare:", String(err));
      }
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

  const handleDeleteFlare = async (id: number) => {
    try {
      setSubmitting(true);
      await deleteFlare(id);

      setFlares((prev) => prev.filter((flare) => flare.id !== id));
      setSelectedFlareId(null);
      setShowPhoto(false);
    } catch (err) {
      if (err instanceof Error) {
        console.error("Failed to delete flare:", err.message);
      } else {
        console.error("Failed to delete flare:", String(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

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
            background: #192736;
            color: white !important;
            max-width: 16rem;
            padding: 1rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            white-space: pre-wrap;
            word-break: break-word;
          }
             .mapboxgl-popup-close-button {
              font-size: 24px;
              top: 8px;
              right: 10px;
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
                  <Image
                    className="w-8"
                    src="/blue_flare.png"
                    alt="Blue Flare"
                  />
                )}
                {flare.category === "violet" && (
                  <Image
                    className="w-8"
                    src="/violet_flare.png"
                    alt="Violet Flare"
                  />
                )}
                {flare.category === "regular" && (
                  <Image
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
                  onClose={() => {
                    setSelectedFlareId(null);
                    setShowPhoto(false);
                  }}
                  closeOnClick={false}
                  anchor="top"
                  offset={[0, -1]}
                  className="flare-popup"
                >
                  <div className="space-y-2">
                    <div>
                      <p className="text-xl font-semibold">
                        Title: {flare.note}
                      </p>
                      <p>At: {flare.place?.name || "No place selected"}</p>
                    </div>

                    <div className="text-sm font-semibold text-yellow-300">
                      Participants: {flare.participantsCount ?? 1} people
                    </div>

                    {/* Toggle photo menu */}
                    {flare.photo_url && (
                      <button
                        onClick={() => setShowPhoto((prev) => !prev)}
                        className="w-full py-1 bg-purple-600 rounded text-white font-semibold hover:bg-purple-500 transition"
                      >
                        {showPhoto ? "Hide Photo" : "View Photo"}
                      </button>
                    )}

                    {/* Show photo */}
                    {showPhoto && flare.photo_url && (
                      <Image
                        src={flare.photo_url}
                        alt="Flare Photo"
                        className="w-full h-auto rounded shadow"
                      />
                    )}

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
                    <button
                      onClick={() => handleDeleteFlare(flare.id!)}
                      disabled={submitting}
                      className="w-full py-1 bg-red-600 rounded text-white font-semibold hover:bg-red-500 transition"
                    >
                      {submitting ? "Deleting..." : "Delete Flare"}
                    </button>
                  </div>
                </Popup>
              ))}

          {newFlareLocation && (
            <Modal
              onClose={() => {
                setNewFlareLocation(null);
                setPhoto(null);
              }}
            >
              <div className="space-y-5 p-2">
                <h1 className="font-semibold text-white text-2xl text-center">
                  Drop a Flare
                </h1>
                {selectedPlace && (
                  <div className="text-sm font-semibold text-blue-600">
                    {selectedPlace.name}
                  </div>
                )}
                <div className="space-y-2">
                  <h3 className="text-white">Describe your flare</h3>
                  <p className="text-sm text-gray-400">
                    Briefly describe your flare so others know what to expect.
                  </p>
                  <textarea
                    placeholder="Write a note..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full p-2 rounded bg-gray-700 text-white resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-white">Upload a photo</h3>
                  <p className="text-sm text-gray-400">
                    Upload a photo to visualize your flare!
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                    className="w-full text-sm bg-gray-700 p-2 text-white rounded-md"
                  />
                </div>
                {photo && (
                  <Image
                    src={URL.createObjectURL(photo)}
                    alt="Preview"
                    className="w-full h-auto rounded"
                  />
                )}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-1 bg-text-orange rounded text-white font-semibold hover:bg-orange-100 transition cursor-pointer"
                >
                  {submitting ? "Posting..." : "Post Flare"}
                </button>
              </div>
            </Modal>
          )}

          {userLocation && (
            <Marker
              longitude={userLocation.lng}
              latitude={userLocation.lat}
              anchor="center"
            >
              <div
                className="pulse-marker"
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
