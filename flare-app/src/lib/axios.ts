import axios from "axios";
import { KnownPlace } from "@/types/knownPlace";
import { Flare } from "@/types/flare";
import { User } from "@/types/user";


function getCookie(name: string) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return match[2];
  return null;
}

// Web routes (no /api prefix)
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // Add these two lines for automatic XSRF handling
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

// Web routes (no /api prefix) - keep this as is
const webApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api$/, "") || "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});






type LoginCredentials = {
  email: string;
  password: string;
};

type RegisterCredentials = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export async function testConnection(): Promise<{ message: string }> {
  try {
    const res = await api.get<{ message: string }>("/ping");
    console.log("[PING] Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("[PING] Failed:", error);
    throw error;
  }
}

export async function login({
  email,
  password,
}: LoginCredentials): Promise<User> {
  await webApi.get("/sanctum/csrf-cookie");

  try {
    const response = await api.post<User>("/login", {
      email,
      password,
    });
    console.log("login successful");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Login failed");
    }
    throw new Error("Network error");
  }
}

export async function register({
  email,
  name,
  password,
  password_confirmation,
}: RegisterCredentials): Promise<User> {
  console.log("🔄 Getting CSRF cookie...");
  await webApi.get("/sanctum/csrf-cookie");
  
  // Debug: Check cookies
  console.log("🍪 All cookies:", document.cookie);
  const xsrfToken = getCookie('XSRF-TOKEN');
  console.log("🔑 XSRF-TOKEN found:", xsrfToken);
  console.log("🔑 XSRF-TOKEN decoded:", xsrfToken ? decodeURIComponent(xsrfToken) : 'none');
  
  await new Promise(resolve => setTimeout(resolve, 200));
  
  try {
    console.log("📤 Attempting registration...");
    const response = await api.post<User>("/register", {
      email,
      name,
      password,
      password_confirmation,
    });
    console.log("✅ Register successful");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("❌ Request headers sent:", error.config?.headers);
      console.error("❌ Response status:", error.response?.status);
      console.error("❌ Response data:", error.response?.data);
    }
    throw error;
  }
}

export async function logout(): Promise<{ message: string }> {
  try {
    const response = await api.post<{ message: string }>("/logout");
    console.log("Logout successful");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Logout failed");
    }
    throw new Error("Network error during logout");
  }
}

export async function getUserFlares(): Promise<Flare[]> {
  try {
    const response = await api.get<Flare[]>("/flares");
    console.log("[FLARES] User flares fetched:", response.data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Failed to fetch user flares");
    }
    throw new Error("Network error while fetching flares");
  }
}

export async function postFlare(data: Omit<Flare, "id">): Promise<Flare> {
  try {
    const response = await api.post<Flare>("/flares", data);
    console.log("[FLARES] Flare posted:", response.data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Failed to post flare");
    }
    throw new Error("Network error while posting flare");
  }
}

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const response = await api.get<User | null>("/me");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Failed to fetch current user:", error.response?.data || error.message);
    } else {
      console.error("Failed to fetch current user:", error);
    }
    throw error;
  }
}

export async function searchNearbyKnownPlaces(
  latitude: number,
  longitude: number,
  radius: number = 200
): Promise<KnownPlace[]> {
  try {
    const response = await api.get<KnownPlace[]>("/known-places/nearby", {
      params: { latitude, longitude, radius },
    });
    console.log("[KNOWN PLACES] Nearby search result:", response.data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("[KNOWN PLACES] Search failed:", error.response?.data || error.message);
    } else {
      console.error("[KNOWN PLACES] Search failed:", error);
    }
    throw error;
  }
}

export async function fetchAllKnownPlaces(): Promise<KnownPlace[]> {
  try {
    const res = await api.get<KnownPlace[]>("/known-places");
    return res.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Failed to fetch known places:", error.response?.data || error.message);
    } else {
      console.error("Failed to fetch known places:", error);
    }
    throw error;
  }
}

export async function postFlareWithPhoto(
  data: Omit<Flare, "id" | "photo"> & { place?: { mapbox_id: string; name: string } },
  photo: File
): Promise<Flare> {
  try {
    const formData = new FormData();

    formData.append("latitude", String(data.latitude));
    formData.append("longitude", String(data.longitude));
    formData.append("note", data.note);
    formData.append("user_id", String(data.user_id));

    if (data.category) {
      formData.append("category", data.category);
    }

    if (data.place) {
      formData.append("place[mapbox_id]", data.place.mapbox_id);
      formData.append("place[name]", data.place.name);
    }

    if (photo) {
      formData.append("photo", photo);
    }

    const response = await api.post<Flare>("/flares", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("[FLARES] Flare with photo posted:", response.data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Failed to post flare with photo");
    }
    throw new Error("Network error while posting flare with photo");
  }
}

export async function deleteFlare(id: number): Promise<{ message: string }> {
  try {
    const response = await api.delete<{ message: string }>(`/flares/${id}`);
    console.log(`[FLARES] Flare ${id} deleted`, response.data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Failed to delete flare");
    }
    throw new Error("Network error while deleting flare");
  }
}

export default api;
