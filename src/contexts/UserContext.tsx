
// src/contexts/UserContext.tsx
"use client";

import type { User, UserRole } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { USER_ROLES } from '@/lib/constants'; // Keep for role definitions if needed elsewhere
import { checkAdminExistsAction } from '@/app/actions';
import { useRouter, usePathname } from 'next/navigation';

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  isAdminSetupComplete: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminSetupComplete, setIsAdminSetupComplete] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const fetchAdminStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const adminExists = await checkAdminExistsAction();
      setIsAdminSetupComplete(adminExists);
      console.log("Admin exists:", adminExists);
    } catch (error) {
      console.error("Error checking admin status:", error);
      // Potentially handle error, e.g., by assuming setup is needed or showing an error
      setIsAdminSetupComplete(false); 
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminStatus();
  }, [fetchAdminStatus]);

  const login = (userData: User) => {
    setCurrentUser(userData);
    setIsAdminSetupComplete(true); // Logging in means setup is done or user is admin
    router.push('/'); // Redirect to dashboard after login
  };

  const logout = () => {
    setCurrentUser(null);
    router.push('/login'); // Redirect to login after logout
  };
  
  // Effect for handling redirection logic centrally might be too complex here.
  // AuthGuard component will handle route protection.

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, isLoading, isAdminSetupComplete, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

