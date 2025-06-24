
import type { Metadata } from 'next';
import { PT_Sans } from 'next/font/google'; 
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppHeader from "@/components/AppHeader";
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
            <div className="flex flex-col min-h-screen">
              <AppHeader />
              {/* AuthGuard wraps the main content area that needs protection/redirection */}
              <AuthGuard>
                <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">
                  {children}
                </main>
              </AuthGuard>
            </div>
          <Toaster />
        </UserProvider>
      </body>
    </html>
  );
}
