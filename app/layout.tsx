import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/components/context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Next Auth Template',
  description: 'This is a next auth template',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} text-sm`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <Navbar />
          {children}
          <Toaster richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
