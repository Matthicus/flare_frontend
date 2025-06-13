import axios from "axios";
import { KnownPlace } from "@/types/knownPlace";
import { Flare } from "@/types/flare";
import { User } from "@/types/user";

// Token management
const TOKEN_KEY = 'flare_auth_token';

const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

// Main API instance - much simpler now!
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      removeToken();
      // Don't redirect automatically - let the UserContext handle it
      console.log("🔓 Token expired/invalid - removed from storage");
    }
    return Promise.reject(error);
  }
);

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

type AuthResponse = {
  user: User;
  token: string;
  message: string;
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

export async function getCurrentUser(): Promise<User> {
  try {
    const response = await api.get<User>("/auth/user");
    console.log("✅ Current user fetched");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("❌ Failed to fetch current user:", error.response.data);
      throw new Error(error.response.data.message || "Failed to fetch user");
    }
    throw new Error("Network error");
  }
}

export async function login({
  email,
  password,
}: LoginCredentials): Promise<User> {
  try {
    const response = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    
    console.log("✅ Login successful");
    
    // Store the token
    setToken(response.data.token);
    
    return response.data.user;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("❌ Login failed:", error.response.data);
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
  console.log("🔄 Preparing registration...");
  
  try {
    console.log("📤 Attempting registration...");
    const response = await api.post<AuthResponse>("/auth/register", {
      email,
      name,
      password,
      password_confirmation,
    });
    
    console.log("✅ Register successful");
    
    // Store the token
    setToken(response.data.token);
    
    return response.data.user;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("❌ Registration failed:", error.response?.data);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        throw new Error(errorMessages.join(', '));
      }
      throw new Error(error.response?.data?.message || "Registration failed");
    }
    throw new Error("Network error during registration");
  }
}

export async function logout(): Promise<{ message: string }> {
  try {
    const response = await api.post<{ message: string }>("/auth/logout");
    console.log("✅ Logout successful");
    
    // Remove the token
    removeToken();
    
    return response.data;
  } catch (error: unknown) {
    // Even if the API call fails, remove the token locally
    removeToken();
    
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

export async function postFlare(data: Omit<Flare, "id" | "user_id">): Promise<Flare> {
  try {
    // Remove user_id from data since backend gets it from token
    const flareData = { ...data };
    delete (flareData as any).user_id;
    
    const response = await api.post<Flare>("/flares", flareData);
    console.log("[FLARES] Flare posted:", response.data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Failed to post flare");
    }
    throw new Error("Network error while posting flare");
  }
}

export async function searchNearbyKnownPlaces(
  latitude: number,
  longitude: number,
  radius: number = 200
): Promise<KnownPlace[]> {
  try {
    const response = await api.get<KnownPlace[]>("/flares/nearby/known-places", {
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
  data: Omit<Flare, "id" | "photo" | "user_id"> & { place?: { mapbox_id: string; name: string } },
  photo: File
): Promise<Flare> {
  try {
    const formData = new FormData();

    formData.append("latitude", String(data.latitude));
    formData.append("longitude", String(data.longitude));
    formData.append("note", data.note);
    // Remove user_id - backend gets it from token

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

// Utility functions for token management
export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

export const clearAuth = (): void => {
  removeToken();
};

// Add alias for backward compatibility
export const fetchCurrentUser = getCurrentUser;

export default api;