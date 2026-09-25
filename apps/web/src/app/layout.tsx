import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Omar Makawi - English Made Simple',
  description: 'منصة مستر عمر مكاوي التعليمية - تعلم اللغة الإنجليزية بأسلوب بسيط وممتع',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>

      <body className="font-cairo min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
