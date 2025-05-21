"use client";

import { useEffect } from "react";
import testConnection from "../../lib/axios";

const Login = () => {
  useEffect(() => {
    testConnection();
  }, []);
  return (
    <div>
      checking for backend connection
      <h1>Login page</h1>
    </div>
  );
};

export default Login;
