"use server";

interface User {
  email: string;
  id: string;
}

export const get = async (): Promise<User[]> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`, {
    method: "GET",
    credentials: "include", // 👈 important for cookies
    headers: {
      "Accept": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data; // depends on how Laravel formats the response
};
