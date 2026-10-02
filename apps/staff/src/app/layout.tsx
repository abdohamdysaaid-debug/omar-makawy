import React from 'react';
import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

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
    <html lang="ar" dir="rtl" className={`dark ${cairo.variable}`} style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <body className="min-h-screen bg-[#090c0a] text-neutral-100 font-cairo antialiased selection:bg-emerald-600 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
