import Image from "next/image";

const Logo = () => {
  return (
    <div
      className="fixed bottom-4 left-1/2  transform -translate-x-1/2 bg-accent-color p-2 rounded-full"
      style={{ zIndex: 1000 }}
    >
      <Image src="/logo.png" alt="logo" className="h-10 w-auto" />
    </div>
  );
};

export default Logo;
