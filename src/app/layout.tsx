import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google'; // Corrected import for Next/font
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import AppHeader from "@/components/AppHeader";
import AppSidebar from "@/components/AppSidebar";
import { UserProvider } from '@/contexts/UserContext';

// If you are NOT using next/font, and are using <link> tags in <head> as per instructions,
// remove the PT_Sans import and const declaration below.
// Ensure your <link> tag for PT Sans is correctly placed.

// const ptSans = PT_Sans({
//   subsets: ['latin'],
//   weight: ['400', '700'],
//   variable: '--font-pt-sans',
// });

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
      {/* If using next/font, add ptSans.variable to className below */}
      <body className="font-body antialiased">
        <UserProvider>
          <SidebarProvider defaultOpen={true}>
            <Sidebar side="left" collapsible="icon">
              <AppSidebar />
            </Sidebar>
            <div className="flex flex-col flex-1 min-h-screen">
              <AppHeader />
              <SidebarInset>
                <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">
                  {children}
                </main>
              </SidebarInset>
            </div>
          </SidebarProvider>
          <Toaster />
        </UserProvider>
      </body>
    </html>
  );
}
