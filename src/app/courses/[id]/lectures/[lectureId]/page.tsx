import { lectures } from '@/data/mock';
import LectureDetailsClient from '@/components/courses/LectureDetailsClient';

export function generateStaticParams() {
  return lectures.map((lecture) => ({
    id: String(lecture.courseId),
    lectureId: String(lecture.id),
  }));
}

export default function LectureDetailsPage({
  params,
}: {
  params: { id: string; lectureId: string };
}) {
  return (
    <LectureDetailsClient
      courseId={Number(params.id)}
      lectureId={Number(params.lectureId)}
    />
  );
}
