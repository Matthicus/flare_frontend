import Image from "next/image";

type Props = {
  onEnable: () => void;
  enabled: boolean;
};

const EnableLocation = ({ onEnable, enabled }: Props) => {
  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={onEnable}
        className={`transition rounded px-4 py-2 flex items-center ${
          enabled
            ? "bg-accent-color hover:bg-text-orange text-white cursor-pointer"
            : "bg-text-orange hover:bg-accent-color text-black cursor-pointer"
        }`}
      >
        <Image
          src="/location.png"
          alt="location"
          className="w-5 h-5 object-contain"
          draggable={false}
        />
      </button>
    </div>
  );
};

export default EnableLocation;
