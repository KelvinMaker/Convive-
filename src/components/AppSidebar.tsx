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
import { LayoutDashboard, FilePlus2, Sparkles, Users, UserCircle, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';
import { Button } from './ui/button';

const navItems = [
  { href: '/', label: 'Panel de Monitoreo', icon: LayoutDashboard, roles: ['estudiante', 'docente', 'directivo'] },
  { href: '/incidents/new', label: 'Registrar Incidente', icon: FilePlus2, roles: ['estudiante', 'docente', 'directivo'] },
  { href: '/summaries', label: 'Resúmenes IA', icon: Sparkles, roles: ['docente', 'directivo'] },
  // Future items
  // { href: '/incidents', label: 'Ver Incidentes', icon: ListChecks, roles: ['docente', 'directivo'] },
  // { href: '/groups', label: 'Grupos', icon: Users, roles: ['docente', 'directivo'] },
  // { href: '/profile', label: 'Perfil', icon: UserCircle, roles: ['estudiante', 'docente', 'directivo'] },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { currentUser } = useUser();

  const userRole = currentUser?.role || 'anonimo';

  return (
    <>
      <SidebarHeader className="p-4">
        <AppLogo />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => 
            item.roles.includes(userRole) && (
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
      <SidebarFooter className="p-4 mt-auto border-t border-sidebar-border">
        <Button variant="ghost" className="w-full justify-start">
          <Settings className="mr-2 h-4 w-4" />
          Configuración
        </Button>
        <Button variant="ghost" className="w-full justify-start">
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </SidebarFooter>
    </>
  );
}
