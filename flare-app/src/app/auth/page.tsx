"use client";
import { useState } from "react";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
// import testConnection from "../../lib/axios";

const Login = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  // useEffect(() => {
  //   testConnection();
  // }, []);
  return (
    <div>
      {mode === "login" ? <LoginForm /> : <RegisterForm />}
      <button
        className="mt-4 text-white bg-blue-600 px-4 py-2 rounded cursor-pointer"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
      >
        {mode === "login"
          ? "No account? Register"
          : "Already registered? Login"}
      </button>
    </div>
  );
};

export default Login;
