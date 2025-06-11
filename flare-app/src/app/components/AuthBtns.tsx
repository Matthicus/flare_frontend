"use client";

import { useState, useEffect } from "react";
import LogoutBtn from "./LogoutBtn";
import LoginModal from "./LoginModal"; // ✅ Import modal

const AuthBtns = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); // ✅ Modal state

  // useEffect(() => {
  //   api
  //     .get("/me")
  //     .then(() => setIsLoggedIn(true))
  //     .catch(() => setIsLoggedIn(false));
  // }, []);

  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn");
    setIsLoggedIn(loggedIn === "true");
  }, []);

  return (
    <>
      {isLoggedIn ? (
        <LogoutBtn />
      ) : (
        <>
          <button
            onClick={() => setShowLoginModal(true)}
            className="bg-text-orange text-white px-2 py-1 cursor-pointer hover:bg-white hover:text-text-orange rounded-xl"
          >
            Login
          </button>

          {showLoginModal && (
            <LoginModal onClose={() => setShowLoginModal(false)} />
          )}
        </>
      )}
    </>
  );
};

export default AuthBtns;
