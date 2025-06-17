
// src/components/AppSidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import AppLogo from "./AppLogo";
import { LayoutDashboard, FilePlus2, Sparkles, Settings, LogOut, Users } from 'lucide-react'; // Added Users
import { cn } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';
import { Button } from './ui/button';
import type { UserRole } from '@/lib/types';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { href: '/', label: 'Panel de Monitoreo', icon: LayoutDashboard, roles: ['estudiante', 'docente', 'directivo'] },
  { href: '/incidents/new', label: 'Registrar Incidente', icon: FilePlus2, roles: ['estudiante', 'docente', 'directivo', 'anonimo'] }, // anonimo can access form if direct link
  { href: '/summaries', label: 'Resúmenes IA', icon: Sparkles, roles: ['docente', 'directivo'] },
  // Example for a future admin-only item (user management/invitations)
  // { href: '/admin/users', label: 'Gestionar Usuarios', icon: Users, roles: ['directivo'] },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { currentUser, logout } = useUser(); // Added logout for potential use in sidebar footer

  const userRole = currentUser?.role;

  // Only render sidebar content if a user is logged in
  if (!currentUser) {
    return (
      <>
        <SidebarHeader className="p-4">
          <AppLogo />
        </SidebarHeader>
        <SidebarContent className="p-4">
          <p className="text-sm text-sidebar-foreground/70 text-center">
            Inicia sesión para ver las opciones de navegación.
          </p>
        </SidebarContent>
      </>
    );
  }

  return (
    <>
      <SidebarHeader className="p-4">
        <AppLogo />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => 
            (userRole && item.roles.includes(userRole)) && ( // Ensure userRole is defined
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  className={cn(
                    pathname === item.href && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                  isActive={pathname === item.href}
                  tooltip={{children: item.label, className: "font-body"}}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-body">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      {currentUser && (
        <SidebarFooter className="p-4 mt-auto border-t border-sidebar-border">
          {/* Settings and Logout are now primarily in AppHeader dropdown for better UX */}
          {/* You can add other footer items here if needed */}
           <p className="text-xs text-muted-foreground text-center">
            {currentUser.name} ({currentUser.role})
          </p>
        </SidebarFooter>
      )}
    </>
  );
}
