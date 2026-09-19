import { books } from '@/data/mock';
import BookDetailsClient from '@/components/bookstore/BookDetailsClient';

export function generateStaticParams() {
  return books.map((book) => ({
    id: String(book.id),
  }));
}

export default function BookDetailsPage({ params }: { params: { id: string } }) {
  return <BookDetailsClient bookId={Number(params.id)} />;
}
