import axios from "axios";

const api = axios.create({
  baseURL: "https://flare.ddev.site/api/",
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
}


export async function testConnection(): Promise<any> {
  try {
    const res = await api.get('/ping');
    console.log('[PING] Response:', res.data);
    return res.data;
  } catch (error) {
    console.error('[PING] Failed:', error);
    throw error;
  }
}


export async function login({ email, password }: LoginCredentials) {

await axios.get('https://flare.ddev.site/sanctum/csrf-cookie');
  
try {
    const response = await api.post("/login", {
      email,
      password,
    });
    console.log("login in succesful")
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Login failed");
    }
    throw new Error("Network error");
  }
}

export async function register ({email, name, password, password_confirmation}: RegisterCredentials) {
  await axios.get('https://flare.ddev.site/sanctum/csrf-cookie');
  try {
    const response = await api.post("/register", {
      email,
      name,
      password,
      password_confirmation,
    });
    console.log("register is succesful")
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Registration failed");
    }
    throw new Error("Network error");
  }
}

export async function logout() {
  try {
    const response = await api.post("/logout");
    console.log("Logout successful");
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Logout failed");
    }
    throw new Error("Network error during logout");
  }
}

export async function getUserFlares(): Promise<any> {
  try {
    const response = await api.get("/flares");
    console.log("[FLARES] User flares fetched:", response.data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Failed to fetch user flares");
    }
    throw new Error("Network error while fetching flares");
  }
}

export async function postFlare(data: any): Promise<any> {
  try {
    const response = await api.post("/flares", data);
    console.log("[FLARES] Flare posted:", response.data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Failed to post flare");
    }
    throw new Error("Network error while posting flare");
  }
}


  export async function fetchCurrentUser() {
    try {
      const response = await api.get('/me', {
        withCredentials: true, // include cookies if using session auth
      });
      return response.data; // this should be the authenticated user info or null
    } catch (error: any) {
      console.error("Failed to fetch current user:", error.response?.data || error.message);
      throw error;
    }
  }

  export async function searchNearbyKnownPlaces(
  latitude: number,
  longitude: number,
  radius: number = 200
): Promise<any> {
  try {
    const response = await api.get('/known-places/nearby', {
      params: { latitude, longitude, radius },
    });
    console.log('[KNOWN PLACES] Nearby search result:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[KNOWN PLACES] Search failed:', error.response?.data || error.message);
    throw error;
  }
}

export async function fetchAllKnownPlaces(): Promise<any[]> {
  try {
    const res = await api.get("/known-places"); // you'll need to add this backend route
    return res.data;
  } catch (error: any) {
    console.error("Failed to fetch known places:", error.response?.data || error.message);
    throw error;
  }
}

export async function postFlareWithPhoto(data: any, photo: File) {
  try {
    const formData = new FormData();

    // Required fields
    formData.append("latitude", data.latitude);
    formData.append("longitude", data.longitude);
    formData.append("note", data.note);
    formData.append("user_id", data.user_id); // Replace with auth logic if needed

    // Optional category
    if (data.category) {
      formData.append("category", data.category);
    }

    // Optional place fields (as array-style inputs Laravel understands)
    if (data.place) {
      formData.append("place[mapbox_id]", data.place.mapbox_id);
      formData.append("place[name]", data.place.name);
    }

    // Add photo
    if (photo) {
      formData.append("photo", photo);
    }

    const response = await api.post("/flares", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });

    console.log("[FLARES] Flare with photo posted:", response.data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Failed to post flare with photo");
    }
    throw new Error("Network error while posting flare with photo");
  }
}

export async function deleteFlare(id: number): Promise<any> {
  try {
    const response = await api.delete(`/flares/${id}`, {
      withCredentials: true, // make sure cookies/auth are sent if needed
    });
    console.log(`[FLARES] Flare ${id} deleted`, response.data);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || "Failed to delete flare");
    }
    throw new Error("Network error while deleting flare");
  }
}





export default api;


