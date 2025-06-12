"use client";

import { useState, useContext } from "react";
import LogoutBtn from "./LogoutBtn";
import LoginModal from "./LoginModal";
import { UserContext } from "@/context/UserContext";

const AuthBtns = () => {
  const { user } = useContext(UserContext);
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      {user ? (
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
