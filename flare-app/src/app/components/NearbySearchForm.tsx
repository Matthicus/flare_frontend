import { useEffect, useState } from "react";
import { fetchAllKnownPlaces, searchNearbyKnownPlaces } from "@/lib/axios";

export default function NearbySearchForm() {
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllKnownPlaces().then(setPlaces).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const match = places.find((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );

    if (!match) {
      setError("No place found matching that name.");
      setLoading(false);
      return;
    }

    try {
      const data = await searchNearbyKnownPlaces(match.lat, match.lon);
      setResults(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white border rounded-xl shadow max-w-lg mx-auto">
      <h2 className="text-lg font-semibold mb-2">Around me</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          placeholder="Enter place name (e.g. Zuidpark)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border px-2 py-1 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {loading && <p className="mt-3 text-sm text-gray-500">Loading...</p>}
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      {results.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium mb-1">Nearby Flares:</h3>
          <ul className="text-sm space-y-1">
            {results.map((place) => (
              <li key={place.id} className="border p-2 rounded bg-gray-50">
                <strong>{place.name}</strong> ({place.distance}m) —{" "}
                <span className="text-blue-600 font-semibold">
                  {place.flare_count} flares
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
