// components/FlareMarker.tsx
import { Marker } from "react-map-gl/mapbox";
import { Flare } from "@/types/flare";
import Image from "next/image";

type FlareMarkerProps = {
  flare: Flare;
  onMarkerClick: (flareId: number | undefined) => void;
};

const FlareMarker = ({ flare, onMarkerClick }: FlareMarkerProps) => {
  const getFlareIcon = (category: Flare["category"]) => {
    switch (category) {
      case "blue":
        return {
          src: "/blue_flare.png",
          alt: "Blue Flare",
        };
      case "violet":
        return {
          src: "/violet_flare.png",
          alt: "Violet Flare",
        };
      case "regular":
      default:
        return {
          src: "/orange_flare.png",
          alt: "Regular Flare",
        };
    }
  };

  const icon = getFlareIcon(flare.category);

  return (
    <Marker
      longitude={flare.longitude}
      latitude={flare.latitude}
      anchor="bottom"
    >
      <div
        className="flare-marker cursor-pointer"
        onClick={(e) => {
          console.log("🖱️ FlareMarker clicked! Flare ID:", flare.id);
          console.log("🖱️ Event:", e);
          e.stopPropagation();
          e.preventDefault(); // Add this line too
          console.log("🖱️ About to call onMarkerClick with:", flare.id);
          onMarkerClick(flare.id);
          console.log("🖱️ onMarkerClick called");
        }}
      >
        <Image
          className="w-8 hover:w-9 transition-all duration-200"
          src={icon.src}
          alt={icon.alt}
          width={40}
          height={40}
        />
      </div>
    </Marker>
  );
};

export default FlareMarker;
