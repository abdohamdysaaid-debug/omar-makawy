import type { Metadata } from 'next';
import { courses } from '@/data/mock';
import CourseDetailsClient from '@/components/courses/CourseDetailsClient';

export function generateStaticParams() {
  return courses.map((course) => ({
    id: String(course.id),
  }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const course = courses.find((c) => String(c.id) === params.id);
  const courseTitle = course?.title || 'كورس تعليمي';
  const title = `${courseTitle} | مستر عمر مكاوي`;
  const description = course?.description || 'كورس لغة إنجليزية مع مستر عمر مكاوي على منصة مستر عمر مكاوي التعليمية.';

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: `/courses/${params.id}/`,
    },
    openGraph: {
      title,
      description,
      url: `https://omarmeckawy.com/courses/${params.id}/`,
      siteName: 'منصة مستر عمر مكاوي',
    },
  };
}

export default function CourseDetailsPage({ params }: { params: { id: string } }) {
  return <CourseDetailsClient courseId={params.id} />;
}
