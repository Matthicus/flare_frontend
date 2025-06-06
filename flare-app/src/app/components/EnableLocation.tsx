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
            ? "bg-blue-900 hover:bg-blue-800 text-white cursor-pointer"
            : "bg-orange-500 hover:bg-orange-400 text-black cursor-pointer"
        }`}
      >
        <img
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
