"use client";
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { fetchCurrentUser, isAuthenticated } from "@/lib/axios"; // Add isAuthenticated import

type User = {
  id: number;
  name: string;
  email: string;
  avatar?: string;
} | null;

type UserContextType = {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  refreshUser: () => Promise<void>;
};

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  refreshUser: async () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);

  const refreshUser = async () => {
    // Only try to fetch user if we have a token
    if (!isAuthenticated()) {
      setUser(null);
      return;
    }

    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      console.log("✅ User refreshed:", currentUser);
    } catch (error) {
      console.log("❌ Failed to refresh user:", error);
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};
