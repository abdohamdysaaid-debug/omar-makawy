import type { Metadata } from 'next';
import SupportClient from '@/components/support/SupportClient';

export const metadata: Metadata = {
  title: {
    absolute: 'الدعم والمساعدة | منصة مستر عمر مكاوي',
  },
  description: 'مركز الدعم الفني والمساعدة لمنصة مستر عمر مكاوي التعليمية للإجابة على استفسارات الطلاب وأولياء الأمور.',
  alternates: {
    canonical: '/support/',
  },
  openGraph: {
    title: 'الدعم والمساعدة | منصة مستر عمر مكاوي',
    description: 'مركز الدعم الفني والمساعدة لمنصة مستر عمر مكاوي التعليمية للإجابة على استفسارات الطلاب وأولياء الأمور.',
    url: 'https://omarmeckawy.com/support/',
    siteName: 'منصة مستر عمر مكاوي',
  },
};

export default function SupportPage() {
  return <SupportClient />;
}
