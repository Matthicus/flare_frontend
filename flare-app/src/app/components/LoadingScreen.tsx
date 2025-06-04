const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#f5f5dc] z-50 transition-opacity duration-500 animate-fade-in">
      <img
        src="/logo.png"
        alt="Logo"
        className="w-10 h-10 opacity-0 animate-fade-in"
      />
      <h1>Loading Flare..</h1>
    </div>
  );
};

export default LoadingScreen;
