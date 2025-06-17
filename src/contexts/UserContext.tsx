// src/contexts/UserContext.tsx
"use client";

import type { User, UserRole } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { USER_ROLES } from '@/lib/constants';

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: Dispatch<SetStateAction<User | null>>;
  // Helper to quickly switch roles for demo
  availableRoles: typeof USER_ROLES;
  switchRole: (role: UserRole) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Sample users for demo
const sampleUsers: Record<UserRole, User> = {
  estudiante: { id: 'user-estudiante-01', name: 'Juan Pérez', email: 'juan.perez@example.com', role: 'estudiante' },
  docente: { id: 'user-docente-01', name: 'Ana Gómez', email: 'ana.gomez@example.com', role: 'docente' },
  directivo: { id: 'user-directivo-01', name: 'Carlos López', email: 'carlos.lopez@example.com', role: 'directivo' },
  anonimo: { id: 'user-anonimo-01', name: 'Usuario Anónimo', email: '', role: 'anonimo' },
};


export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(sampleUsers.docente); // Default to docente

  const switchRole = (role: UserRole) => {
    setCurrentUser(sampleUsers[role] || null);
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, availableRoles: USER_ROLES, switchRole }}>
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
