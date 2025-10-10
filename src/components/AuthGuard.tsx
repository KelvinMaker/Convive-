
// src/components/AuthGuard.tsx
"use client";

import { useUser } from '@/contexts/UserContext';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import type { UserRole } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[]; 
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { currentUser, isLoading, isAdminSetupComplete } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) {
      // Still loading user/admin state, wait before running logic
      return; 
    }

    // --- Redirection Logic ---

    // 1. If admin is not set up, force redirect to the setup page
    if (!isAdminSetupComplete) {
      if (pathname !== '/setup-admin') {
        router.push('/setup-admin');
      }
      return;
    }

    const isPublicPath = ['/login', '/register', '/'].includes(pathname);

    // 2. If admin IS set up, but user is NOT logged in...
    if (!currentUser) {
      // ...allow access only to public pages, otherwise redirect to login.
      if (!isPublicPath) {
        router.push('/login');
      }
      return;
    }

    // 3. If user IS logged in, check role-based access
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
      // User does not have the required role, redirect to home page
      router.push('/');
      return;
    }

  }, [currentUser, isLoading, isAdminSetupComplete, router, pathname, allowedRoles]);

  // --- Render Logic ---

  // While loading, show a global loading indicator
  if (isLoading) {
    return <div className="flex flex-col justify-center items-center min-h-screen text-center p-4"><Loader2 className="h-10 w-10 animate-spin text-primary mb-4" /> <p>Cargando aplicación...</p></div>;
  }
  
  // Define public/setup paths
  const publicPathsWhenNotLoggedIn = ['/login', '/register', '/'];
  const setupPath = '/setup-admin';

  // Case 1: App not set up. Render only the setup page, show redirect message for others.
  if (!isAdminSetupComplete) {
    if (pathname === setupPath) {
      return <>{children}</>;
    }
    return <div className="flex flex-col justify-center items-center min-h-screen text-center p-4"><Loader2 className="h-10 w-10 animate-spin text-primary mb-4" /> <p>Redirigiendo a la configuración inicial...</p></div>;
  }
  
  // Case 2: App is set up, but user is not logged in. Render public pages, show redirect for others.
  if (!currentUser) {
      if (publicPathsWhenNotLoggedIn.includes(pathname)) {
          return <>{children}</>;
      }
      return <div className="flex flex-col justify-center items-center min-h-screen text-center p-4"><Loader2 className="h-10 w-10 animate-spin text-primary mb-4" /> <p>Redirigiendo al inicio de sesión...</p></div>;
  }

  // Case 3: User is logged in. Check for role mismatch before rendering.
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    return <div className="flex flex-col justify-center items-center min-h-screen text-center p-4"><Loader2 className="h-10 w-10 animate-spin text-primary mb-4" /> <p>Acceso denegado. Redirigiendo...</p></div>;
  }

  // If all checks pass, render the children for the authenticated user.
  return <>{children}</>;
}
