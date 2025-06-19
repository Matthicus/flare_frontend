import Image from "next/image";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#f5f5dc] via-[#faf9f6] to-[#f0ead6] z-50">
      {/* Main content container */}
      <div className="relative flex flex-col items-center space-y-6 animate-[fadeInUp_0.8s_ease-out]">
        {/* Logo - simple and clean */}
        <div className="relative w-20 h-20 animate-[fadeIn_1s_ease-out]">
          <Image
            src="/logo.png"
            alt="Logo"
            width={80}
            height={80}
            className="w-full h-full"
          />
        </div>

        {/* Text */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-800">
            Loading Flare
            <span className="animate-pulse">...</span>
          </h1>
          <p className="text-sm text-gray-600 animate-[fadeIn_1s_ease-out_0.5s_both]">
            Preparing your location experience
          </p>
        </div>

        {/* Progress bar - the star of the show */}
        <div className="w-64 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-full animate-[loadingBar_2s_ease-in-out_infinite]"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes loadingBar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
