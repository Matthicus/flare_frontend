import axios from "axios";
import { KnownPlace } from "@/types/knownPlace";
import { Flare } from "@/types/flare";
import { User } from "@/types/user";

// Helper function to get cookie value
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

const csrfBaseURL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api$/, '') || '';

const initializeCsrf = async () => {
  try {
    await axios.get(`${csrfBaseURL}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
    console.log("🔄 CSRF cookie initialized");
  } catch (error) {
    console.error('Failed to initialize CSRF:', error);
    throw error; // Re-throw to handle in calling functions
  }
};

// Main API instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // Remove automatic XSRF handling - we'll do it manually
  // xsrfCookieName: 'XSRF-TOKEN',
  // xsrfHeaderName: 'X-XSRF-TOKEN',
});

// Add request interceptor to manually handle CSRF token
api.interceptors.request.use(
  async (config) => {
    // For state-changing operations, ensure we have a CSRF token
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      const token = getCookie('XSRF-TOKEN');
      
      if (!token) {
        console.log("🔄 No CSRF token found, initializing...");
        try {
          await initializeCsrf();
          // Get the token again after initialization
          const newToken = getCookie('XSRF-TOKEN');
          if (newToken) {
            config.headers['X-XSRF-TOKEN'] = decodeURIComponent(newToken);
          }
        } catch (error) {
          console.error("Failed to get CSRF token:", error);
        }
      } else {
        // Set the CSRF token header manually
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with retry for CSRF token mismatch
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 419 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.log("🔄 CSRF token expired, refreshing...");
      
      try {
        await initializeCsrf();
        
        // Update the CSRF token in the original request
        const newToken = getCookie('XSRF-TOKEN');
        if (newToken) {
          originalRequest.headers['X-XSRF-TOKEN'] = decodeURIComponent(newToken);
        }
        
        return api.request(originalRequest);
      } catch (csrfError) {
        console.error("Failed to refresh CSRF token:", csrfError);
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Initialize CSRF token when module loads (but don't block)
initializeCsrf().catch(console.error);

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

export async function getCurrentUser(): Promise<User> {
  try {
    const response = await api.get<User>("/me");
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
  // Ensure CSRF token before login
  try {
    await initializeCsrf();
  } catch (error) {
    console.error("Failed to initialize CSRF for login:", error);
    // Continue anyway, the request interceptor will handle it
  }
  
  try {
    await api.post("/login", {
      email,
      password,
    });
    console.log("✅ Login successful");
    
    // After successful login, fetch the current user
    return await getCurrentUser();
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
    // Ensure fresh CSRF token
    await initializeCsrf();
    
    console.log("📤 Attempting registration...");
    await api.post("/register", {
      email,
      name,
      password,
      password_confirmation,
    });
    console.log("✅ Register successful");
    
    // After successful registration, fetch the current user
    return await getCurrentUser();
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
    const response = await api.post<{ message: string }>("/logout");
    console.log("✅ Logout successful");
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

// Add alias for backward compatibility
export const fetchCurrentUser = getCurrentUser;

export default api;