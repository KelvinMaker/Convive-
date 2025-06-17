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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuGroup, // Added missing import
} from "@/components/ui/dropdown-menu";
import { UserCircle, LogOut, Settings, Users, ShieldAlert } from 'lucide-react';
import { useUser } from "@/contexts/UserContext";
import type { UserRole } from "@/lib/types";

export default function AppHeader() {
  const { currentUser, availableRoles, switchRole } = useUser();
  const { toggleSidebar } = useSidebar();


  const getInitials = (name?: string) => {
    if (!name) return '??';
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" onClick={toggleSidebar}/>
          <div className="hidden md:block">
            <AppLogo size="sm" />
          </div>
        </div>
        
        <div className="md:hidden">
            <AppLogo size="sm" />
        </div>

        {currentUser && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(currentUser.name)}`} alt={currentUser.name || 'Usuario'}  data-ai-hint="avatar person" />
                  <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser.email || currentUser.role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
               <DropdownMenuLabel>Cambiar Rol (Demo)</DropdownMenuLabel>
                 <DropdownMenuRadioGroup value={currentUser.role} onValueChange={(value) => switchRole(value as UserRole)}>
                {availableRoles.filter(r => r.value !== 'anonimo').map(role => (
                  <DropdownMenuRadioItem key={role.value} value={role.value}>
                    {role.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
