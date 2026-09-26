import { CourseDetailClient } from './CourseDetailClient';

export function generateStaticParams() {
  return [{ id: 'detail' }];
}

export default function StaffCourseDetailPage() {
  return <CourseDetailClient />;
}
