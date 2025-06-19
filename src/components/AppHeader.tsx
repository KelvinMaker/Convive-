
// src/components/AppHeader.tsx
"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import AppLogo from "./AppLogo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle, LogOut, Settings, LogIn, UserPlus } from 'lucide-react';
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";
import { useRouter } from "next/navigation";


export default function AppHeader() {
  const { currentUser, logout, isAdminSetupComplete, isLoading } = useUser();
  const { toggleSidebar } = useSidebar();
  const router = useRouter();

  const getInitials = (name?: string) => {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }

  const handleLogout = () => {
    logout();
    // router.push('/login'); // logout function in context handles redirection
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          {currentUser && <SidebarTrigger className="md:hidden" onClick={toggleSidebar}/>}
          <div className="hidden md:block">
            <AppLogo size="sm" />
          </div>
        </div>
        
        <div className="md:hidden">
            <AppLogo size="sm" />
        </div>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-8 w-20 animate-pulse bg-muted rounded-md" />
          ) : currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(currentUser.name)}`} alt={currentUser.name || 'Usuario'} data-ai-hint="avatar person" />
                    <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser.email} ({currentUser.role})
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}> {/* Placeholder for profile page */}
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')}> {/* Placeholder for settings page */}
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              {!isAdminSetupComplete && (
                <Button asChild variant="default" size="sm">
                  <Link href="/setup-admin">
                    <UserPlus className="mr-2 h-4 w-4" /> Configurar Admin
                  </Link>
                </Button>
              )}
              {isAdminSetupComplete && (
                <>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/login">
                      <LogIn className="mr-2 h-4 w-4" /> Iniciar Sesión
                    </Link>
                  </Button>
                  <Button asChild variant="default" size="sm">
                    <Link href="/register">
                      <UserPlus className="mr-2 h-4 w-4" /> Registrar Usuario
                    </Link>
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

