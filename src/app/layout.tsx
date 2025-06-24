import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header/Header';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "G-Day Pulse",
  description: 'Executive dashboard for engineering and product metrics.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
