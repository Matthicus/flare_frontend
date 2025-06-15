import Image from "next/image";

type Props = {
  onEnable: () => void;
  enabled: boolean;
  userLocation?: { lat: number; lng: number } | null;
  onRecenter: (lat: number, lng: number) => void;
};

const EnableLocation = ({
  onEnable,
  enabled,
  userLocation,
  onRecenter,
}: Props) => {
  const handleClick = () => {
    if (enabled && userLocation) {
      // If location is already enabled and we have user location, recenter
      onRecenter(userLocation.lat, userLocation.lng);
    } else {
      // If location is not enabled, enable it
      onEnable();
    }
  };
  return (
    <button
      onClick={handleClick}
      className={`transition rounded px-4 py-2 flex items-center ${
        enabled
          ? "bg-accent-color hover:bg-text-orange text-white cursor-pointer"
          : "bg-text-orange hover:bg-accent-color text-black cursor-pointer"
      }`}
      title={enabled ? "Recenter on my location" : "Enable location"}
    >
      <Image
        src="/location.png"
        alt="location"
        className="w-5 h-5 object-contain"
        draggable={false}
        width={20}
        height={20}
      />
    </button>
  );
};

export default EnableLocation;
