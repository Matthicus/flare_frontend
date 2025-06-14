// hooks/useFlares.ts
import { useState, useEffect } from "react";
import { Flare } from "@/types/flare";
import { postFlare, postFlareWithPhoto, deleteFlare, getAllFlares } from "@/lib/axios";

export const useFlares = () => {
  const [flares, setFlares] = useState<Flare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Category determination logic
  const getCategory = (count: number = 0): Flare["category"] => {
    if (count >= 100) return "blue";
    if (count >= 18) return "violet";
    return "regular";
  };

  // Load flares from localStorage on mount
  useEffect(() => {
    const loadFlares = () => {
      try {
        const saved = localStorage.getItem("flares");
        if (saved) {
          const { flares: savedFlares, timestamp } = JSON.parse(saved);
          const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000; // 24 hours
          
          if (!isExpired) {
            setFlares(savedFlares);
            setLoading(false);
            return;
          } else {
            localStorage.removeItem("flares");
          }
        }
      } catch (error) {
        console.error("Failed to load flares from localStorage:", error);
        localStorage.removeItem("flares");
      }
      
      // If no valid cached data, fetch from API
      fetchFlaresFromAPI();
    };

    loadFlares();
  }, []);

  // Save flares to localStorage whenever flares change
  useEffect(() => {
    if (flares.length > 0) {
      const dataToStore = { flares, timestamp: Date.now() };
      localStorage.setItem("flares", JSON.stringify(dataToStore));
    }
  }, [flares]);

  // Fetch flares from API
  const fetchFlaresFromAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiFlares = await getAllFlares();
      setFlares(apiFlares);
      
      console.log("✅ Flares loaded from API:", apiFlares.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch flares";
      setError(errorMessage);
      console.error("❌ Error loading flares:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add a new flare
  const addFlare = async (
    flareData: Omit<Flare, "id" | "user_id">,
    photo?: File
  ): Promise<Flare> => {
    try {
      // First, create the flare on the server
      let savedFlare: Flare;
      
      if (photo) {
        // Transform the flareData to match postFlareWithPhoto's expected type
        const photoFlareData = {
          latitude: flareData.latitude,
          longitude: flareData.longitude,
          note: flareData.note,
          category: flareData.category,
          place: flareData.place 
            ? { 
                mapbox_id: flareData.place.mapbox_id, 
                name: flareData.place.name 
              }
            : undefined // Convert null to undefined for postFlareWithPhoto
        };
        
        savedFlare = await postFlareWithPhoto(photoFlareData, photo);
      } else {
        savedFlare = await postFlare(flareData);
      }

      // Check if there's an existing flare at the same location
      const existingFlareIndex = flares.findIndex(
        (f) =>
          Math.abs(f.latitude - flareData.latitude) < 0.0001 &&
          Math.abs(f.longitude - flareData.longitude) < 0.0001
      );

      if (existingFlareIndex !== -1) {
        // Update existing flare participant count
        const updatedFlares = [...flares];
        const existingFlare = updatedFlares[existingFlareIndex];

        existingFlare.participantsCount = (existingFlare.participantsCount ?? 1) + 1;
        existingFlare.category = getCategory(existingFlare.participantsCount);

        setFlares(updatedFlares);
        return existingFlare;
      } else {
        // Add new flare
        savedFlare.participantsCount = 1;
        savedFlare.category = getCategory(1);
        setFlares((prev) => [...prev, savedFlare]);
        return savedFlare;
      }
    } catch (error) {
      console.error("Failed to add flare:", error);
      throw error;
    }
  };

  // Add to existing flare (increase participant count)
  const addToFlare = (flare: Flare) => {
    const updatedFlares = flares.map((f) => {
      if (f.id === flare.id) {
        const newCount = (f.participantsCount ?? 1) + 1;
        return {
          ...f,
          participantsCount: newCount,
          category: getCategory(newCount),
        };
      }
      return f;
    });
    
    setFlares(updatedFlares);
  };

  // Remove a flare
  const removeFlare = async (id: number): Promise<void> => {
    try {
      await deleteFlare(id);
      setFlares((prev) => prev.filter((flare) => flare.id !== id));
      console.log("✅ Flare deleted:", id);
    } catch (error) {
      console.error("Failed to delete flare:", error);
      throw error;
    }
  };

  // Refresh flares from API
  const refreshFlares = () => {
    fetchFlaresFromAPI();
  };

  // Clear all flares (useful for logout)
  const clearFlares = () => {
    setFlares([]);
    localStorage.removeItem("flares");
  };

  // Get flares within a certain radius of a location
  const getFlaresNearLocation = (
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Flare[] => {
    return flares.filter((flare) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        flare.latitude,
        flare.longitude
      );
      return distance <= radiusKm;
    });
  };

  // Get hot flares (more than specified participant count)
  const getHotFlares = (minParticipants: number = 2): Flare[] => {
    return flares
      .filter((f) => f.participantsCount && f.participantsCount > minParticipants)
      .sort((a, b) => (b.participantsCount ?? 0) - (a.participantsCount ?? 0));
  };

  return {
    // State
    flares,
    loading,
    error,
    
    // Actions
    addFlare,
    addToFlare,
    removeFlare,
    refreshFlares,
    clearFlares,
    
    // Utilities
    getCategory,
    getFlaresNearLocation,
    getHotFlares,
  };
};

// Utility function to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}