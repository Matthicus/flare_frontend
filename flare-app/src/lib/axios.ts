import axios from "axios";
import { KnownPlace } from "@/types/knownPlace";
import { Flare } from "@/types/flare";
import { User, UserProfile, UserStats, UpdateProfileData } from "@/types/user";

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
  username: string;
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

export async function getAllFlares(): Promise<Flare[]> {
  try {
    // Add cache-busting timestamp and no-cache headers
    const response = await api.get<Flare[]>("/flares", {
      params: {
        t: Date.now() // Cache-busting timestamp
      },
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    console.log("[FLARES] All public flares fetched:", response.data.length, "flares");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("[FLARES] Failed to fetch all flares:", error.response.data);
      throw new Error(error.response.data.message || "Failed to fetch all flares");
    }
    console.error("[FLARES] Network error while fetching all flares:", error);
    throw new Error("Network error while fetching flares");
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

// Updated registration function with username
export const registerUser = async (userData: RegisterCredentials): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/auth/register", userData);
    console.log("✅ Registration successful");
    
    // Store the token
    setToken(response.data.token);
    
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("❌ Registration failed:", error.response.data);
      throw error; // Re-throw to preserve error structure for form validation
    }
    throw new Error("Network error during registration");
  }
};

// Legacy register function for backward compatibility
export async function register(userData: Omit<RegisterCredentials, 'username'>): Promise<User> {
  console.warn("Warning: Using legacy register function. Please update to use registerUser with username.");
  const response = await api.post<AuthResponse>("/auth/register", userData);
  setToken(response.data.token);
  return response.data.user;
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

// ==== USER PROFILE FUNCTIONS ====

export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await api.get<UserProfile>("/user");
    console.log("✅ User profile fetched");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("❌ Failed to fetch user profile:", error.response.data);
      throw new Error(error.response.data.message || "Failed to fetch user profile");
    }
    throw new Error("Network error while fetching user profile");
  }
};

export const updateUserProfile = async (data: UpdateProfileData): Promise<UserProfile> => {
  try {
    const response = await api.put<{ user: UserProfile; message: string }>("/user/profile", data);
    console.log("✅ User profile updated");
    return response.data.user;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("❌ Failed to update user profile:", error.response.data);
      throw error; // Re-throw to preserve error structure for form validation
    }
    throw new Error("Network error while updating user profile");
  }
};

export const updateProfilePhoto = async (photo: File): Promise<UserProfile> => {
  try {
    const formData = new FormData();
    formData.append("photo", photo);
        
    const response = await api.post<{ user: UserProfile; message: string }>("/user/profile-photo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    console.log("✅ Profile photo updated");
    
    // Add debugging logs here
console.log("✅ Profile photo updated");
console.log("📸 Full API response:", response.data);
console.log("📸 New profile_photo_url:", response.data.user.profile_photo_url);
console.log("📸 User object:", response.data.user);
    
    return response.data.user;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("❌ Failed to update profile photo:", error.response.data);
      throw new Error(error.response.data.message || "Failed to update profile photo");
    }
    throw new Error("Network error while updating profile photo");
  }
};

export const deleteProfilePhoto = async (): Promise<UserProfile> => {
  try {
    const response = await api.delete<{ user: UserProfile; message: string }>("/user/profile-photo");
    console.log("✅ Profile photo deleted");
    return response.data.user;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("❌ Failed to delete profile photo:", error.response.data);
      throw new Error(error.response.data.message || "Failed to delete profile photo");
    }
    throw new Error("Network error while deleting profile photo");
  }
};

export const getUserFlares = async (): Promise<{ flares: Flare[]; total_flares: number }> => {
  try {
    const response = await api.get("/user/flares");
    console.log("✅ User flares fetched:", response.data.total, "flares");
    
    // Transform the API response to match the expected format
    return {
      flares: response.data.data || [],
      total_flares: response.data.total || 0
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("❌ Failed to fetch user flares:", error.response.data);
      throw new Error(error.response.data.message || "Failed to fetch user flares");
    }
    throw new Error("Network error while fetching user flares");
  }
};

export const getUserStats = async (): Promise<UserStats> => {
  try {
    const response = await api.get<UserStats>("/user/stats");
    console.log("✅ User stats fetched");
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("❌ Failed to fetch user stats:", error.response.data);
      throw new Error(error.response.data.message || "Failed to fetch user stats");
    }
    throw new Error("Network error while fetching user stats");
  }
};

// ==== FLARE FUNCTIONS ====

export async function postFlare(data: Omit<Flare, "id" | "user_id">): Promise<Flare> {
  try {
    // Remove user_id from data since backend gets it from token
    const flareData = { ...data };
    delete (flareData as Partial<Flare>).user_id;
         
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

// ==== PLACES FUNCTIONS ====

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

// ==== UTILITY FUNCTIONS ====

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