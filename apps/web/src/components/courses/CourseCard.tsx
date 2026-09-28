'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Clock, PlayCircle } from 'lucide-react';
import { Course } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { academicYears } from '@/data/mock';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const router = useRouter();
  const { isAuthenticated, openAuthGate } = useAuth();

  const academicYear = academicYears.find((y) => y.id === course.academicYearId);
  const yearTitle = academicYear?.title || 'عام';

  const handleCTA = () => {
    if (!isAuthenticated && openAuthGate) {
      openAuthGate(`/courses/${course.id}`);
    } else {
      router.push(`/courses/${course.id}`);
    }
  };

  return (
    <div className="group rounded-3xl bg-white dark:bg-[#131b2e] border border-stone-200/80 dark:border-gray-800/80 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Banner Box */}
      <div className="relative h-44 bg-gradient-to-br from-emerald-800 to-gray-900 flex items-center justify-center p-4">
        {course.imageUrl ? (
          <img
            src={course.imageUrl}
            alt={course.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-70"
          />
        ) : (
          <BookOpen className="w-12 h-12 text-emerald-400 opacity-60 group-hover:scale-110 transition-transform" />
        )}

        <span className="absolute top-3 start-3 px-3 py-1 bg-black/70 backdrop-blur-md text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/20">
          {yearTitle}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1 space-y-3">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {course.title}
        </h3>

        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          مستر عمر مكاوي
        </p>

        {course.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed flex-1">
            {course.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1">
            <PlayCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{course.lectureCount || 0} محاضرة</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{course.duration || '0 ساعة'}</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-2">
          <div className="font-extrabold text-base text-gray-900 dark:text-white">
            {course.price > 0 ? (
              <>
                <span className="text-emerald-600 dark:text-emerald-400">{course.price}</span>{' '}
                <span className="text-xs text-gray-500 font-normal">جنيه</span>
              </>
            ) : (
              <span className="text-emerald-600 font-bold">مجاني</span>
            )}
          </div>

          <button
            onClick={handleCTA}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
          >
            تصفح الكورس
          </button>
        </div>
      </div>
    </div>
  );
}
