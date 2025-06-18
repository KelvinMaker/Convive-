
import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google'; 
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import { UserProvider } from '@/contexts/UserContext';
import AuthGuard from '@/components/AuthGuard'; // Import AuthGuard

export const metadata: Metadata = {
  title: 'Convive+',
  description: 'Aplicación de Registro y seguimiento de incidentes de convivencia',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <UserProvider>
          <SidebarProvider defaultOpen={true}>
            <Sidebar side="left" collapsible="offcanvas"> {/* Changed from "icon" to "offcanvas" */}
              <AppSidebar />
            </Sidebar>
            <div className="flex flex-col flex-1 min-h-screen">
              <AppHeader />
              <SidebarInset>
                {/* AuthGuard wraps the main content area that needs protection/redirection */}
                <AuthGuard>
                  <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">
                    {children}
                  </main>
                </AuthGuard>
              </SidebarInset>
            </div>
          </SidebarProvider>
          <Toaster />
        </UserProvider>
      </body>
    </html>
  );
}
