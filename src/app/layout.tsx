'use client';

import './globals.css';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/shared/sidebar';
import { DM_Sans, JetBrains_Mono } from 'next/font/google';
import { useEffect, useState } from 'react';

const fontSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
});
const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <html
        lang="en"
        className={cn('h-full', fontSans.variable, fontMono.variable)}
      >
        <body className="bg-background text-foreground min-h-screen antialiased">
          <div className="flex min-h-screen items-center justify-center">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html
      lang="en"
      className={cn('h-full', fontSans.variable, fontMono.variable)}
    >
      <body
        className={cn(
          'bg-background text-foreground flex min-h-screen antialiased'
        )}
      >
        {isAuthenticated && <Sidebar />}
        <main
          className={cn(
            'flex-1 overflow-y-auto',
            !isAuthenticated && 'w-full',
            isAuthenticated && 'p-10'
          )}
        >
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </body>
    </html>
  );
}
