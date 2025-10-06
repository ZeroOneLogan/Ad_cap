import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Idle Tycoon Web',
  description: 'Invest, automate, and prestige your way to exponential riches.',
  manifest: '/manifest.json',
  themeColor: '#4b67ff'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
