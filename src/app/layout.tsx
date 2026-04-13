import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/shared/sidebar';
import { DM_Sans, JetBrains_Mono } from 'next/font/google';

const fontSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
});
const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'FreelanceFlow',
  description: 'Gérez votre activité freelance sereinement',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </body>
    </html>
  );
}
