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


export default api;


