// types/user.ts
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  profile_photo_url?: string | null;
  profile_photo_path?: string | null;
  created_at: string;
  updated_at: string;
  email_verified_at?: string | null;
}

export interface UserProfile {
  id: number;
  name: string;
  username: string;
  email: string;
  profile_photo_url?: string | null;
  profile_photo_path?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  total_flares: number;
  total_participants: number;
  flares_this_month: number;
  category_breakdown: {
    regular?: number;
    blue?: number;
    violet?: number;
  };
  member_since: string;
  last_flare?: string | null;
}

export interface UpdateProfileData {
  name?: string;
  username?: string;
}