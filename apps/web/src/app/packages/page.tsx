import type { Metadata } from 'next';
import PackagesClient from '@/components/packages/PackagesClient';

export const metadata: Metadata = {
  title: {
    absolute: 'باقات مستر عمر مكاوي | منصة مستر عمر مكاوي',
  },
  description: 'باقات مستر عمر مكاوي الشهرية لمتابعة ودراسة منهج اللغة الإنجليزية مع الامتحانات التفاعلية والمذكرات.',
  alternates: {
    canonical: '/packages/',
  },
  openGraph: {
    title: 'باقات مستر عمر مكاوي | منصة مستر عمر مكاوي',
    description: 'باقات مستر عمر مكاوي الشهرية لمتابعة ودراسة منهج اللغة الإنجليزية مع الامتحانات التفاعلية والمذكرات.',
    url: 'https://omarmeckawy.com/packages/',
    siteName: 'منصة مستر عمر مكاوي',
  },
};

export default function PackagesPage() {
  return <PackagesClient />;
}
