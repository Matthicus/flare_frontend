// types/flare.ts
export interface User {
  id: number;
  name: string;
  username?: string;
  profile_photo_url?: string | null;
}

export interface Place {
  id?: number;
  mapbox_id: string;
  name: string;
}

export interface Flare {
  id?: number;
  user_id?: number;
  latitude: number;
  longitude: number;
  note: string;
  category: "regular" | "blue" | "violet";
  participantsCount?: number;
  place?: Place | null;
  photo_url?: string | null;
  photo_path?: string | null;
  user?: User; // User information included from backend
  user_display_name?: string; // Computed display name
  user_profile_photo_url?: string | null; // Computed profile photo URL
  created_at?: string;
  updated_at?: string;
}