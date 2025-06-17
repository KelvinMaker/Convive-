
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
      console.log("AuthGuard: User context loading...");
      return; 
    }
    console.log("AuthGuard: isLoading false. isAdminSetupComplete:", isAdminSetupComplete, "currentUser:", !!currentUser, "pathname:", pathname);


    if (!isAdminSetupComplete) {
      if (pathname !== '/setup-admin') {
        console.log("AuthGuard: Admin not set up, redirecting to /setup-admin from", pathname);
        router.push('/setup-admin');
      }
      return;
    }

    // Admin setup IS complete from this point onwards
    if (!currentUser) {
      if (pathname !== '/login') { // Only allow /login if not authenticated and setup is complete
        console.log("AuthGuard: Not logged in, redirecting to /login from", pathname);
        router.push('/login');
      }
      return;
    }

    // User is logged in, check roles if specified for the route
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
      console.log(`AuthGuard: Role mismatch. User role: ${currentUser.role}, Allowed: ${allowedRoles}. Redirecting to / from`, pathname);
      router.push('/'); // Redirect to a default page (dashboard) if role not allowed
      return;
    }
    console.log("AuthGuard: Access granted for", pathname);

  }, [currentUser, isLoading, isAdminSetupComplete, router, pathname, allowedRoles]);

  if (isLoading) {
    return <div className="flex flex-col justify-center items-center min-h-screen text-center p-4"><Loader2 className="h-10 w-10 animate-spin text-primary mb-4" /> <p>Cargando aplicación...</p></div>;
  }

  // Render children if all checks pass or if the current path is one of the public/setup paths
  // This ensures that /setup-admin and /login can render their own content while AuthGuard handles redirection for other paths.
  if (!isAdminSetupComplete && pathname === '/setup-admin') {
    return <>{children}</>;
  }
  if (isAdminSetupComplete && !currentUser && pathname === '/login') {
    return <>{children}</>;
  }
  
  // If we are still loading, or if redirection is about to happen, show a generic loading/redirecting message.
  // This helps prevent flashing of content before redirection.
  if (!isAdminSetupComplete && pathname !== '/setup-admin') {
    return <div className="flex flex-col justify-center items-center min-h-screen text-center p-4"><Loader2 className="h-10 w-10 animate-spin text-primary mb-4" /> <p>Redirigiendo a la configuración inicial...</p></div>;
  }
  if (isAdminSetupComplete && !currentUser && pathname !== '/login') {
    return <div className="flex flex-col justify-center items-center min-h-screen text-center p-4"><Loader2 className="h-10 w-10 animate-spin text-primary mb-4" /> <p>Redirigiendo al inicio de sesión...</p></div>;
  }
  if (currentUser && allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
     return <div className="flex flex-col justify-center items-center min-h-screen text-center p-4"><Loader2 className="h-10 w-10 animate-spin text-primary mb-4" /> <p>Acceso denegado. Redirigiendo...</p></div>;
  }

  // If user is logged in and admin setup is complete, and current path doesn't require specific roles or matches allowed roles
  if (currentUser && isAdminSetupComplete) {
    return <>{children}</>;
  }
  
  // Fallback for any unhandled intermediate states, though useEffect should cover.
  return <div className="flex flex-col justify-center items-center min-h-screen text-center p-4"><Loader2 className="h-10 w-10 animate-spin text-primary mb-4" /> <p>Verificando acceso...</p></div>;
}
