import { courses } from '@/data/mock';
import CourseDetailsClient from '@/components/courses/CourseDetailsClient';

export function generateStaticParams() {
  return courses.map((course) => ({
    id: String(course.id),
  }));
}

export default function CourseDetailsPage({ params }: { params: { id: string } }) {
  return <CourseDetailsClient courseId={Number(params.id)} />;
}
