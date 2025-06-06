"use client";

import Link from "next/link";
import LogoutBtn from "./LogoutBtn";
import { useState, useEffect } from "react";
import api from "../../lib/axios";

const AuthBtns = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    api
      .get("/me")
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false));
  }, []);

  return (
    <>
      {isLoggedIn ? (
        <LogoutBtn />
      ) : (
        <Link href="/auth">
          <button className="bg-text-orange text-white px-2 py-1 cursor-pointer hover:bg-white hover:text-text-orange rounded-xl">
            Login
          </button>
        </Link>
      )}
    </>
  );
};

export default AuthBtns;
