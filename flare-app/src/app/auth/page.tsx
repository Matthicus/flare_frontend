"use client";
import { useState, useEffect } from "react";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import { testConnection } from "@/lib/axios"; // Import testConnection from "@/lib/axios";

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white space-y-6">
      {isRegistering ? <RegisterForm /> : <LoginForm />}

      <button
        onClick={() => setIsRegistering((prev) => !prev)}
        className="text-lime-400 hover:underline"
      >
        {isRegistering
          ? "Already have an account? Log in"
          : "Don't have an account? Register"}
      </button>
    </div>
  );
};

export default Login;
