"use client";

import { useEffect } from "react";
import testConnection from "../../lib/axios";

const Login = () => {
  useEffect(() => {
    testConnection();
  }, []);
  return <div>checking for backend connection</div>;
};

export default Login;
