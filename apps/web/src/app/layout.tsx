import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://omarmeckawy.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'منصة مستر عمر مكاوي | مدرس اللغة الإنجليزية',
    template: '%s | منصة مستر عمر مكاوي',
  },
  description:
    'منصة مستر عمر مكاوي التعليمية لتقديم كورسات ومحاضرات وباقات اللغة الإنجليزية للطلاب بمحتوى تعليمي منظم حسب الصف الدراسي.',
  keywords: [
    'منصة مستر عمر مكاوي',
    'مستر عمر مكاوي',
    'عمر مكاوي',
    'منصة عمر مكاوي',
    'مدرس اللغة الإنجليزية',
    'مستر عمر مكاوي مدرس انجليزي',
    'عمر مكاوي مدرس انجليزي',
    'كورسات عمر مكاوي',
    'محاضرات عمر مكاوي',
    'منصة مستر عمر مكاوي التعليمية',
    'Mr. Omar Meckawy',
    'Omar Meckawy',
    'Mr Omar Meckawy Platform',
    'Omar Meckawy English Teacher',
  ],
  authors: [{ name: 'Mr. Omar Meckawy', url: baseUrl }],
  creator: 'Mr. Omar Meckawy',
  publisher: 'منصة مستر عمر مكاوي',
  applicationName: 'منصة مستر عمر مكاوي',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'منصة مستر عمر مكاوي | مدرس اللغة الإنجليزية',
    description:
      'منصة مستر عمر مكاوي التعليمية لتقديم كورسات ومحاضرات وباقات اللغة الإنجليزية للطلاب بمحتوى تعليمي منظم حسب الصف الدراسي.',
    url: baseUrl,
    siteName: 'منصة مستر عمر مكاوي',
    images: [
      {
        url: '/assets/omar-avatar.jpg',
        width: 800,
        height: 800,
        alt: 'مستر عمر مكاوي — مدرس اللغة الإنجليزية',
      },
    ],
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'منصة مستر عمر مكاوي | مدرس اللغة الإنجليزية',
    description:
      'منصة مستر عمر مكاوي التعليمية لتقديم كورسات ومحاضرات وباقات اللغة الإنجليزية للطلاب بمحتوى تعليمي منظم حسب الصف الدراسي.',
    images: ['/assets/omar-avatar.jpg'],
  },
  icons: {
    icon: [
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/icon.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'EducationalOrganization',
        '@id': `${baseUrl}/#organization`,
        name: 'منصة مستر عمر مكاوي',
        alternateName: ['Mr. Omar Meckawy Platform', 'منصة مستر عمر مكاوي التعليمية'],
        url: baseUrl,
        logo: `${baseUrl}/icon.png`,
        description:
          'منصة مستر عمر مكاوي التعليمية لتقديم كورسات ومحاضرات وباقات اللغة الإنجليزية للطلاب بمحتوى تعليمي منظم حسب الصف الدراسي.',
      },
      {
        '@type': 'Person',
        '@id': `${baseUrl}/#teacher`,
        name: 'مستر عمر مكاوي',
        alternateName: ['Mr. Omar Meckawy', 'عمر مكاوي', 'Omar Meckawy'],
        jobTitle: 'مدرس اللغة الإنجليزية',
        description: 'مستر عمر مكاوي مدرس اللغة الإنجليزية للمراحل الإعدادية والثانوية.',
        worksFor: {
          '@id': `${baseUrl}/#organization`,
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: 'منصة مستر عمر مكاوي',
        alternateName: 'Mr. Omar Meckawy Platform',
        publisher: {
          '@id': `${baseUrl}/#organization`,
        },
        inLanguage: ['ar', 'en'],
      },
    ],
  };

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.png" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var lang = localStorage.getItem('app_language');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.backgroundColor = '#020d08';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.backgroundColor = '#f7f6ed';
                  }
                  if (lang === 'en') {
                    document.documentElement.lang = 'en';
                    document.documentElement.dir = 'ltr';
                  } else {
                    document.documentElement.lang = 'ar';
                    document.documentElement.dir = 'rtl';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-cairo min-h-screen bg-background-light dark:bg-[#020d08] text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
