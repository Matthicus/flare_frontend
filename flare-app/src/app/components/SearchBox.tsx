"use client";
import { useState } from "react";

type Props = {
  onSelect: (lng: number, lat: number) => void;
};

const SearchBox = ({ onSelect }: Props) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        query
      )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
    );

    const data = await res.json();
    setResults(data.features);
  };

  return (
    <div className="w-[300px] ">
      <form onSubmit={handleSearch}>
        <div className="relative w-full">
          <img
            src="/search.png"
            alt="search"
            className="absolute top-2 left-3 w-4"
          />
          <input
            type="text"
            className="w-full bg-accent-color border px-2 py-1 rounded-xl text-white pl-10 outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search location"
          />
        </div>
      </form>
      <ul className="mt-2 bg-none text-white max h-40 overflow-y-auto text-sm">
        {results.map((result: any) => (
          <li
            key={result.id}
            className="cursor-pointer hover:bg-gray-100 p-1"
            onClick={() => {
              const [lng, lat] = result.center;
              onSelect(lng, lat);
              setQuery(result.place_name);
              setResults([]);
            }}
          >
            {result.place_name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchBox;
