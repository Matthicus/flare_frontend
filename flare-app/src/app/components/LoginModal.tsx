"use client";
import { useState, useEffect } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { testConnection } from "@/lib/axios";

type Props = {
  onClose: () => void;
};

const LoginModal = ({ onClose }: Props) => {
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-md">
        <div className=" p-6 rounded-xl space-y-4">
          {isRegistering ? (
            <RegisterForm
              onClose={onClose}
              onToggleForm={() => setIsRegistering(false)}
            />
          ) : (
            <LoginForm
              onClose={onClose}
              onToggleForm={() => setIsRegistering(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
