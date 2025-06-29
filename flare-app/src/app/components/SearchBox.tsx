"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

type Props = {
  onSelect: (lng: number, lat: number) => void;
};

type MapboxFeature = {
  id: string;
  place_name: string;
  center: [number, number]; // [lng, lat]
};

const SearchBox = ({ onSelect }: Props) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MapboxFeature[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setResults([]);
        return;
      }

      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            query
          )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
        );
        const data = await res.json();
        setResults(data.features as MapboxFeature[]);
      } catch (error) {
        console.error("Error fetching geocoding data:", error);
      }
    };

    // Debounce the API call by 300ms
    const timeoutId = setTimeout(fetchResults, 300);

    return () => clearTimeout(timeoutId); // Cleanup on unmount or query change
  }, [query]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  return (
    <div className="relative z-50 flex items-center">
      {/* Search button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`p-2 rounded bg-accent-color hover:bg-text-orange transition-colors flex items-center justify-center cursor-pointer ${
          open ? "bg-[#001c55]" : ""
        }`}
        aria-label="Toggle search"
      >
        <Image
          src="/search.png"
          alt="search"
          className="w-5 h-5 object-contain"
          draggable={false}
          width={20}
          height={20}
        />
      </button>

      {/* Sliding input */}
      <form
        onSubmit={(e) => e.preventDefault()}
        className={`ml-2 overflow-hidden transition-[width,opacity] duration-300 ease-in-out ${
          open
            ? "w-32 sm:w-72 opacity-100 pointer-events-auto"
            : "w-0 opacity-0 pointer-events-none"
        }`}
        style={{ flexShrink: 0 }}
      >
        <input
          ref={inputRef}
          type="text"
          className="w-full bg-[#FAF9F6] px-3 py-1 rounded-xl text-black outline-none"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search location"
        />
      </form>

      {/* Results dropdown */}
      {open && results.length > 0 && (
        <ul className="absolute top-full mt-3 left-11 w-48 sm:w-72 bg-[#FAF9F6] rounded-xl shadow-lg p-3 max-h-40 overflow-y-auto text-black text-sm">
          {results.map((result) => (
            <li
              key={result.id}
              className="cursor-pointer hover:bg-white/10 p-2 rounded"
              onClick={() => {
                const [lng, lat] = result.center;
                onSelect(lng, lat);
                setQuery(result.place_name);
                setResults([]);
                setOpen(false);
              }}
            >
              {result.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBox;
