"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_PLAYER_NAME } from "@/lib/constants";

const STORAGE_KEY = "convive-player-name";

export function resolvePlayerName(name?: string | null): string {
  const trimmed = name?.trim() ?? "";
  return trimmed.length > 0 ? trimmed.slice(0, 40) : DEFAULT_PLAYER_NAME;
}

interface UserContextType {
  playerName: string | null;
  isLoading: boolean;
  setPlayerName: (name?: string) => void;
  clearPlayerName: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [playerName, setPlayerNameState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    setPlayerNameState(saved ? resolvePlayerName(saved) : null);
    setIsLoading(false);
  }, []);

  const setPlayerName = (name?: string) => {
    const resolved = resolvePlayerName(name);
    sessionStorage.setItem(STORAGE_KEY, resolved);
    setPlayerNameState(resolved);
  };

  const clearPlayerName = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setPlayerNameState(null);
    router.push("/");
  };

  return (
    <UserContext.Provider value={{ playerName, isLoading, setPlayerName, clearPlayerName }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
