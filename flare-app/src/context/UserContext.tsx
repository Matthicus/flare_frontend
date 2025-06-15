"use client";
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { fetchCurrentUser, isAuthenticated } from "@/lib/axios";

type User = {
  id: number;
  name: string;
  email: string;
  username: string;
  profile_photo_url?: string | null;
  profile_photo_path?: string | null;
  created_at?: string;
  updated_at?: string;
  email_verified_at?: string | null;
  avatar?: string; // Keep for backward compatibility
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
      console.log("🔄 REFRESHING USER - called from:", new Error().stack); // This will show us WHO is calling refreshUser
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
