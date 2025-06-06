"use client";

import { useState, useEffect } from "react";
import LoadingScreen from "./LoadingScreen";
import MapWrapper from "./MapWrapper";
import AuthBtns from "./AuthBtns";
import Logo from "./Logo";
import NearbySearchForm from "./NearbySearchForm";

const MainLayout = () => {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setLoading(false), 300); // wait for fade-out
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div
        className={`fixed inset-0 flex flex-col gap-3 items-center justify-center bg-accent-color z-50 transition-opacity duration-500 ${
          fadeOut ? "opacity-0" : "opacity-100"
        }`}
      >
        <img src="/logo.png" alt="Logo" className="w-20 h-20 animate-fade-in" />
        <h1 className="animate-fade-in text-white">Loading Flare..</h1>
      </div>
    );
  }

  return (
    <div className=" relative w-screen h-screen">
      <MapWrapper />
      <div className="absolute top-4 left-0 w-full z-10 flex justify-end px-4">
        <AuthBtns />
      </div>{" "}
      <Logo />
    </div>
  );
};

export default MainLayout;
