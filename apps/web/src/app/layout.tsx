import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://omarmakawy.com';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'مستر عمر مكاوي | Mr. Omar Meckawy - منصة اللغة الإنجليزية التعليمية',
    template: '%s | مستر عمر مكاوي - Mr. Omar Meckawy',
  },
  description:
    'منصة مستر عمر مكاوي (Mr. Omar Meckawy) التعليمية - الأستاذ عمر مكاوي مدرس اللغة الإنجليزية للثانوية العامة والشهادة الإعدادية والتعليم الأزهري والعام. الشرح المبسط، الباقات الشهرية، والمناهج التفاعلية.',
  keywords: [
    'منصة عمر مكاوي',
    'عمر مكاوي',
    'مستر عمر مكاوي',
    'mr.omar meckawy',
    'mr omar meckawy',
    'omar meckawy',
    'omar makawy',
    'عمر مكاوى',
    'مستر عمر مكاوى',
    'مدرس انجليزي',
    'مدرس لغة إنجليزية',
    'أفضل مدرس إنجليزي ثانوية عامة',
    'إنجليزي ثالثة ثانوي',
    'إنجليزي أولى ثانوي',
    'إنجليزي ثانية ثانوي',
    'إنجليزي الصف الثالث الإعدادي',
    'كورسات إنجليزي أونلاين',
    'باقات إنجليزي شهرية',
    'منصة تعليمية إنجليزي',
    'تعليم عام وأزهر إنجليزي',
    'شرح مناهج إنجليزي',
    'مكاوى اونلاين',
    'omarmakawy.com',
    'English teacher Egypt',
  ],
  authors: [{ name: 'Mr. Omar Meckawy', url: baseUrl }],
  creator: 'Mr. Omar Meckawy',
  publisher: 'Mr. Omar Meckawy Platform',
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
    title: 'مستر عمر مكاوي | Mr. Omar Meckawy - منصة اللغة الإنجليزية',
    description:
      'منصة مستر عمر مكاوي لتدريس اللغة الإنجليزية للثانوية العامة والشهادة الإعدادية أونلاين بأسلوب تفاعلي ومبسط.',
    url: baseUrl,
    siteName: 'منصة مستر عمر مكاوي التعليمية',
    images: [
      {
        url: '/assets/omar-avatar.jpg',
        width: 800,
        height: 800,
        alt: 'Mr. Omar Meckawy - مستر عمر مكاوي',
      },
    ],
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'مستر عمر مكاوي | Mr. Omar Meckawy',
    description:
      'منصة مستر عمر مكاوي لتدريس اللغة الإنجليزية أونلاين للثانوية العامة والإعدادية.',
    images: ['/assets/omar-avatar.jpg'],
    creator: '@omarmeckawy',
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
    '@type': 'EducationalOrganization',
    name: 'منصة مستر عمر مكاوي التعليمية',
    alternateName: ['Mr. Omar Meckawy Platform', 'عمر مكاوي', 'مستر عمر مكاوي'],
    url: baseUrl,
    logo: `${baseUrl}/icon.png`,
    sameAs: [
      'https://facebook.com',
      'https://youtube.com',
      'https://instagram.com',
    ],
    description:
      'منصة تعليمية متكاملة للغة الإنجليزية يدمج فيها مستر عمر مكاوي التفاعل والتبسيط للثانوية العامة والإعدادية.',
    founder: {
      '@type': 'Person',
      name: 'Omar Meckawy',
      alternateName: 'مستر عمر مكاوي',
      jobTitle: 'English Language Expert Teacher',
    },
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
