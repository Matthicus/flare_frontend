const API_URL = "http://127.0.0.1:8000/api";

export const getFlares = async () => {
  const res = await fetch(`${API_URL}/flares`);
  if (!res.ok) throw new Error("Failed to fetch flares");
  return res.json();
};

export const postFlare = async (flareData: {
  latitude: string;
  longitude: string;
  note: string;
  category: string;
}) => {
  const res = await fetch(`${API_URL}/flares`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(flareData),
  });
  if (!res.ok) throw new Error("Failed to post flare");
  return res.json();
};
