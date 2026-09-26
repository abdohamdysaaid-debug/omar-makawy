import { StudentDetailClient } from './StudentDetailClient';

export function generateStaticParams() {
  return [{ id: 'detail' }];
}

export default function StaffStudentDetailPage() {
  return <StudentDetailClient />;
}
