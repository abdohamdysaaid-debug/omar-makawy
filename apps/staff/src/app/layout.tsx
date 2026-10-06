import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'لوحة الإدارة والتحكم | منصة مستر عمر مكاوي',
  description: 'لوحة التحكم الإدارية والأكاديمية - منصة مستر عمر مكاوي التعليمية',
  robots: 'noindex, nofollow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="dark" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#090c0a] text-neutral-100 font-cairo antialiased selection:bg-emerald-600 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
