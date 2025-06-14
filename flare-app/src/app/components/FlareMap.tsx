"use client";
import { Map } from "react-map-gl/mapbox";
import type { ViewState, MapMouseEvent } from "react-map-gl/mapbox";
import { useState, useEffect, useRef, useCallback } from "react";
import { Flare } from "@/types/flare";
import FlareMarker from "./FlareMarker";
import FlarePopup from "./FlarePopup";
import UserLocationMarker from "./UserLocationMarker";
import CreateFlareModal from "./CreateFlareModal";
import type { CreateFlareData } from "./CreateFlareModal";

type FlareMapProps = {
  viewport: ViewState;
  setViewport: (v: ViewState) => void;
  userLocation: { lat: number; lng: number } | null;
  flares: Flare[];
  addFlare: (
    flareData: Omit<Flare, "id" | "user_id">,
    photo?: File
  ) => Promise<Flare>;
  removeFlare: (id: number) => Promise<void>;
  onMapLoad?: () => void;
};

const FlareMap = ({
  viewport,
  setViewport,
  userLocation,
  flares,
  addFlare,
  removeFlare,
}: FlareMapProps) => {
  // Modal and form state (keep these local to FlareMap)
  const [newFlareLocation, setNewFlareLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<{
    mapbox_id: string;
    name: string;
  } | null>(null);
  const [selectedFlareId, setSelectedFlareId] = useState<number | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Debug logging for flares
  useEffect(() => {
    console.log("🔍 FlareMap Debug:");
    console.log("- Flares count:", flares.length);
    console.log("- Flares data:", flares);
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
    setSelectedFlareId(null);
  };

  const handleCreateFlare = async (
    flareData: CreateFlareData,
    photo?: File
  ) => {
    setSubmitting(true);
    try {
      // Add the default category since new flares always start as "regular"
      const flareWithCategory = {
        ...flareData,
        category: "regular" as const,
      };

      await addFlare(flareWithCategory, photo);

      // Close modal and reset state
      setNewFlareLocation(null);
      setSelectedPlace(null);

      console.log("✅ Flare added successfully");
    } catch (err) {
      if (err instanceof Error) {
        console.error("Failed to post flare:", err.message);
      } else {
        console.error("Failed to post flare:", String(err));
      }
      throw err; // Re-throw so the modal can handle the error
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setNewFlareLocation(null);
    setSelectedPlace(null);
  };

  const handleMarkerClick = (flareId: number | undefined) => {
    console.log("🖱️ Marker clicked!");
    console.log("🆔 Flare ID:", flareId);
    console.log("🔍 Current zoom:", viewport.zoom);
    console.log("📍 Current position:", viewport.latitude, viewport.longitude);

    // Find the flare and zoom to it first
    if (flareId) {
      const flare = flares.find((f) => f.id === flareId);
      console.log("🔍 Found flare:", flare);

      if (flare) {
        console.log("📍 Flare position:", flare.latitude, flare.longitude);

        // If we're already zoomed in enough (zoom > 15), just show popup
        // Changed from 12 to 15 so it zooms more often
        if (viewport.zoom > 15) {
          console.log(
            "✅ Already zoomed in (zoom > 15), showing popup immediately"
          );
          setSelectedFlareId(flareId);
        } else {
          console.log("🔍 Zooming to flare location...");
          console.log(
            "📍 From:",
            viewport.latitude,
            viewport.longitude,
            "zoom:",
            viewport.zoom
          );
          console.log("📍 To:", flare.latitude, flare.longitude, "zoom: 16");

          // If zoomed out, fly to the flare location first, then show popup
          setViewport({
            ...viewport,
            latitude: flare.latitude,
            longitude: flare.longitude,
            zoom: 16, // Changed from 14 to 16 for closer zoom
          });

          console.log("⏰ Setting timeout to show popup in 1 second...");
          // Show popup after zoom transition completes
          setTimeout(() => {
            console.log("⏰ Timeout completed, showing popup now");
            setSelectedFlareId(flareId);
          }, 1000); // Estimated transition time
        }
      } else {
        console.log("❌ Flare not found with ID:", flareId);
      }
    } else {
      console.log("❌ No flare ID provided");
    }
  };

  const handlePopupClose = () => {
    setSelectedFlareId(null);
  };

  const handleAddToFlare = (flare: Flare) => {
    setSelectedFlareId(null);
    setNewFlareLocation({ lat: flare.latitude, lng: flare.longitude });

    if (flare.place) {
      setSelectedPlace({
        mapbox_id: flare.place.mapbox_id,
        name: flare.place.name,
      });
    } else {
      setSelectedPlace(null);
    }
  };

  const handleDeleteFlare = async (id: number) => {
    try {
      setSubmitting(true);
      await removeFlare(id);
      setSelectedFlareId(null);
      console.log("✅ Flare deleted successfully");
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

  // Handle clicking away from popups
  const handleClickAway = useCallback((e: MouseEvent) => {
    if (!mapContainerRef.current) return;
    if (
      !(
        e.target instanceof HTMLElement &&
        (e.target.closest(".flare-popup") || e.target.closest(".flare-marker"))
      )
    ) {
      setSelectedFlareId(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleClickAway);
    return () => {
      document.removeEventListener("click", handleClickAway);
    };
  }, [handleClickAway]);

  // Get the selected flare for the popup
  const selectedFlare = selectedFlareId
    ? flares.find((flare) => flare.id === selectedFlareId)
    : null;

  return (
    <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }}>
      <Map
        {...viewport}
        onMove={(evt) => setViewport(evt.viewState)}
        onClick={handleMapClick}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: "100%", height: "100%" }}
      >
        {/* Render all flare markers */}
        {flares.map((flare) => (
          <FlareMarker
            key={flare.id}
            flare={flare}
            onMarkerClick={handleMarkerClick}
          />
        ))}

        {/* Render popup for selected flare */}
        {selectedFlare && (
          <FlarePopup
            flare={selectedFlare}
            onClose={handlePopupClose}
            onAddToFlare={handleAddToFlare}
            onDeleteFlare={handleDeleteFlare}
            isDeleting={submitting}
          />
        )}

        {/* Render user location marker */}
        {userLocation && <UserLocationMarker location={userLocation} />}
      </Map>

      {/* Create flare modal */}
      {newFlareLocation && (
        <CreateFlareModal
          isOpen={!!newFlareLocation}
          onClose={handleCloseModal}
          onSubmit={(data, photo) =>
            handleCreateFlare(
              {
                ...data,
                latitude: newFlareLocation.lat,
                longitude: newFlareLocation.lng,
              },
              photo
            )
          }
          selectedPlace={selectedPlace}
          isSubmitting={submitting}
        />
      )}
    </div>
  );
};

export default FlareMap;
