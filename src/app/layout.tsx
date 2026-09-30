
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppHeader from "@/components/AppHeader";
import { UserProvider } from '@/contexts/UserContext';
import AuthGuard from '@/components/AuthGuard';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Convive+',
  description: 'Aplicación de Registro y seguimiento de incidentes de convivencia',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased bg-[#f4f8fc] text-[#10233f] md:bg-[#e7eef6]`}>
        <UserProvider>
          <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-[#f4f8fc] md:my-6 md:min-h-[calc(100vh-3rem)] md:overflow-hidden md:rounded-[28px] md:border md:border-[#dce7f2] md:shadow-[0_12px_40px_rgba(6,27,61,0.12)]">
            <AppHeader />
            <AuthGuard>
              <main className="flex-1">{children}</main>
            </AuthGuard>
          </div>
          <Toaster />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').then(
                      function(registration) {
                        console.log('ServiceWorker registration successful');
                      },
                      function(err) {
                        console.log('ServiceWorker registration failed: ', err);
                      }
                    );
                  });
                }
              `,
            }}
          />
        </UserProvider>
      </body>
    </html>
  );
}
