"use client";

import Link from "next/link"; // zorgt ervoor dat alleen content area reload wordt bij verandering van pagina
//next js components zijn server side by default
import ProductCard from "./components/ProductCard";
import { useEffect, useState } from "react";
import { getFlares } from "../lib/api";

type Flare = {
  id: number;
  latitude: string;
  longitude: string;
  note: string;
  category: string;
  created_at: string;
};

export default function Home() {
  const [flares, setFlares] = useState<Flare[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getFlares();
        setFlares(data);
      } catch (err) {
        setError("Failed to load flares");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="p-4">Loading flares...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Nearby Flares</h1>
      <ul className="space-y-4">
        {flares.map((flare) => (
          <li key={flare.id} className="border p-4 rounded-md shadow-md">
            <p>
              <strong>Note:</strong> {flare.note}
            </p>
            <p>
              <strong>Category:</strong> {flare.category}
            </p>
            <p>
              <strong>Location:</strong> {flare.latitude}, {flare.longitude}
            </p>
            <p className="text-sm text-gray-500">
              Posted: {new Date(flare.created_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
