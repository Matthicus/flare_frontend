import Image from "next/image";

const Logo = () => {
  return (
    <div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-accent-color p-2 rounded-full"
      style={{ zIndex: 1000 }}
    >
      <Image
        src="/logo.png"
        alt="logo"
        width={40}
        height={40}
        className="h-10 w-10"
      />
    </div>
  );
};

export default Logo;
