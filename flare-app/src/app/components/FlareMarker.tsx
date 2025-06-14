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
          e.stopPropagation();
          onMarkerClick(flare.id);
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
