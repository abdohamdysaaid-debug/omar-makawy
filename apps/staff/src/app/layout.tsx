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
  title: 'بوابة الكادر التعليمي | منصة مستر عمر مكاوي',
  description: 'البوابة الإدارية الموحدة للمعلمين والمشرفين الأكاديميين - منصة مستر عمر مكاوي التعليمية',
  robots: 'noindex, nofollow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background-light dark:bg-background-dark text-neutral-900 dark:text-neutral-50 font-cairo antialiased selection:bg-brand-500 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
