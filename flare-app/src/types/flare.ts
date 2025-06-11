export type Flare = {
  id?: number;
  latitude: number;
  longitude: number;
  note: string;
  category: "regular" | "blue" | "violet";
  user_id?: number;
  place_id?: number | null;
  place?: {
    mapbox_id: string;
    name: string;
  } | null;
  participantsCount?: number;
  photo_url?: string | null;
};
