// components/UserLocationMarker.tsx
import { Marker } from "react-map-gl/mapbox";

type UserLocationMarkerProps = {
  location: { lat: number; lng: number };
};

const UserLocationMarker = ({ location }: UserLocationMarkerProps) => {
  return (
    <Marker longitude={location.lng} latitude={location.lat} anchor="center">
      <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-lg animate-pulse" />
    </Marker>
  );
};

export default UserLocationMarker;
