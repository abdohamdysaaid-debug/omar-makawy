'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, Clock, Users, PlayCircle, CheckCircle } from 'lucide-react';
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
    if (!isAuthenticated) {
      if (openAuthGate) {
        openAuthGate(`/courses/${course.id}`);
      }
    } else {
      router.push(`/courses/${course.id}`);
    }
  };

  return (
    <div className="card overflow-hidden rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="placeholder-img h-48 bg-gradient-to-br from-brand-500/20 to-brand-500/5 dark:from-brand-500/10 dark:to-transparent flex items-center justify-center relative">
        <BookOpen className="w-12 h-12 text-brand-500 opacity-50" />
        <span className="absolute top-4 start-4 bg-white/90 dark:bg-surface-dark/90 text-brand-500 px-3 py-1 text-xs font-bold rounded-full shadow-sm">
          {yearTitle}
        </span>
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-cairo font-bold text-lg mb-1 text-gray-900 dark:text-white line-clamp-1">
          {course.title}
        </h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          الاستاذ / عمر مكاوي
        </p>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4 flex-1">
          {course.description}
        </p>
        
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5">
            <PlayCircle className="w-4 h-4" />
            <span>{course.lectureCount || 0} محاضرة</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{course.duration || '0 ساعة'}</span>
          </div>
        </div>

        {course.features && course.features.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {course.features.slice(0, 3).map((feature, idx) => (
              <span key={idx} className="bg-warm-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-[10px] font-medium">
                {feature}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div className="font-bold text-lg text-brand-500">
            {course.price} <span className="text-sm font-normal">جنيه</span>
          </div>
          <button
            onClick={handleCTA}
            className="bg-brand-500 hover:bg-brand-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            ابدأ الآن
          </button>
        </div>
      </div>
    </div>
  );
}
