import type { Metadata } from 'next';
import BookstoreClient from '@/components/bookstore/BookstoreClient';

export const metadata: Metadata = {
  title: {
    absolute: 'متجر الكتب والمذكرات | منصة مستر عمر مكاوي',
  },
  description: 'متجر الكتب والمذكرات الدراسية لمنهج مستر عمر مكاوي في اللغة الإنجليزية لجميع الصفوف الدراسية.',
  alternates: {
    canonical: '/bookstore/',
  },
  openGraph: {
    title: 'متجر الكتب والمذكرات | منصة مستر عمر مكاوي',
    description: 'متجر الكتب والمذكرات الدراسية لمنهج مستر عمر مكاوي في اللغة الإنجليزية لجميع الصفوف الدراسية.',
    url: 'https://omarmeckawy.com/bookstore/',
    siteName: 'منصة مستر عمر مكاوي',
  },
};

export default function BookstorePage() {
  return <BookstoreClient />;
}
