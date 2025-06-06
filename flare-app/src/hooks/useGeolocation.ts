// hooks/useGeolocation.ts
import { useEffect, useState } from "react";

export function useGeolocation(enabled: boolean) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!enabled || !("geolocation" in navigator)) return;

    let didSetInitialCenter = false;

    const watcherId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
      },
      (err) => {
        console.error("Location error:", err);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watcherId);
    };
  }, [enabled]);

  return location;
}
