"use client";

import Link from "next/link";
import LogoutBtn from "./LogoutBtn";
import { useState, useEffect } from "react";
import api from "../../lib/axios";

const MainNavigation = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    api
      .get("/me")
      .then(() => setIsLoggedIn(true))
      .catch(() => setIsLoggedIn(false));
  }, []);

  return (
    <nav className="flex justify-between items-center pb-10">
      <img className="w-16" src="./logo.png" alt="logo" />
      <ul className="flex gap-15 text-2xl text-white ">
        <li>
          <Link className="hover:text-text-orange" href="/about">
            About
          </Link>
        </li>
        <li>
          <Link className="hover:text-text-orange" href="/usage">
            Usage
          </Link>
        </li>
        <li>
          {isLoggedIn ? (
            <LogoutBtn />
          ) : (
            <Link href="/auth">
              <button className="bg-text-orange text-white px-2 py-1 cursor-pointer hover:bg-white hover:text-text-orange rounded-xl">
                Login
              </button>
            </Link>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default MainNavigation;
