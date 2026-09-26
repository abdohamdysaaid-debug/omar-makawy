import { BookDetailClient } from './BookDetailClient';

export function generateStaticParams() {
  return [{ id: 'detail' }];
}

export default function StaffBookDetailPage() {
  return <BookDetailClient />;
}
