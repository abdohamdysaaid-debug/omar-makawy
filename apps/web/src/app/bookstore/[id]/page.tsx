import type { Metadata } from 'next';
import { books } from '@/data/mock';
import BookDetailsClient from '@/components/bookstore/BookDetailsClient';

export function generateStaticParams() {
  return books.map((book) => ({
    id: String(book.id),
  }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const book = books.find((b) => String(b.id) === params.id);
  const bookTitle = book?.title || 'كتاب ومذكرة تعليمية';
  const title = `${bookTitle} | مستر عمر مكاوي`;
  const description = book?.description || 'مذكرات وكتب تعليمية لمنهج اللغة الإنجليزية على منصة مستر عمر مكاوي التعليمية.';

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: `/bookstore/detail?id=${params.id}`,
    },
    openGraph: {
      title,
      description,
      url: `https://omarmeckawy.com/bookstore/detail?id=${params.id}`,
      siteName: 'منصة مستر عمر مكاوي',
    },
  };
}

export default function BookDetailsPage({ params }: { params: { id: string } }) {
  return <BookDetailsClient bookId={params.id} />;
}
