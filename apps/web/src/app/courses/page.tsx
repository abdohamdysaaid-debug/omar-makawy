import type { Metadata } from 'next';
import CoursesListClient from '@/components/courses/CoursesListClient';

export const metadata: Metadata = {
  title: {
    absolute: 'كورسات مستر عمر مكاوي | منصة مستر عمر مكاوي',
  },
  description: 'تصفح كورسات ومحاضرات اللغة الإنجليزية مع مستر عمر مكاوي لجميع المراحل الدراسية والشهادة الإعدادية والثانوية العامة.',
  alternates: {
    canonical: '/courses/',
  },
  openGraph: {
    title: 'كورسات مستر عمر مكاوي | منصة مستر عمر مكاوي',
    description: 'تصفح كورسات ومحاضرات اللغة الإنجليزية مع مستر عمر مكاوي لجميع المراحل الدراسية والشهادة الإعدادية والثانوية العامة.',
    url: 'https://omarmeckawy.com/courses/',
    siteName: 'منصة مستر عمر مكاوي',
  },
};

export default function CoursesPage() {
  return <CoursesListClient />;
}
