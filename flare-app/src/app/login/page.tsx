"use client";

// import { useEffect } from "react";
// import testConnection from "../../lib/axios";

const Login = () => {
  // useEffect(() => {
  //   testConnection();
  // }, []);
  return (
    <div className="flex justify-center items-center min-h-screen">
      <form
        className="bg-accent-color border border-white rounded-xl w-[300px]  p-5 flex flex-col gap-8 "
        action=""
      >
        <h1 className="text-white text-2xl text-center">Register</h1>
        <input
          className="bg-background text-white p-2 outline-text-orange focus:outline-[2px] focus:ring-0 focus:ring-offset-0 rounded-md"
          type="email"
          placeholder="email"
        />
        <input
          className="bg-background text-white p-2 outline-text-orange focus:outline-[2px] focus:ring-0 focus:ring-offset-0 rounded-md"
          type="email"
          placeholder="email confirmation"
        />
        <input
          className="bg-background text-white p-2 outline-text-orange focus:outline-[2px] focus:ring-0 focus:ring-offset-0 rounded-md"
          type="password"
          placeholder="password"
        />
        <button
          className="bg-text-orange text-white p-2 cursor-pointer hover:bg-white hover:text-text-orange rounded-md"
          type="submit"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Login;
