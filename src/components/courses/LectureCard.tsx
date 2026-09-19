'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Play, PlayCircle, CheckCircle, Lock, Clock } from 'lucide-react';
import { Lecture } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface LectureCardProps {
  lecture: Lecture;
  index: number;
}

export default function LectureCard({ lecture, index }: LectureCardProps) {
  const router = useRouter();
  const { isAuthenticated, openAuthGate } = useAuth();

  const handleLectureClick = () => {
    if (lecture.isLocked) {
      if (!isAuthenticated && openAuthGate) {
        openAuthGate(`/courses/${lecture.courseId}`);
      } else {
        alert('غير متاح حالياً');
      }
      return;
    }
    
    // Navigate to lecture if available or completed
    router.push(`/courses/${lecture.courseId}/lectures/${lecture.id}`);
  };

  const getStatusIcon = () => {
    if (lecture.isLocked) return <Lock className="w-5 h-5 text-gray-400" />;
    if (lecture.status === 'completed') return <CheckCircle className="w-5 h-5 text-brand-500" />;
    return <PlayCircle className="w-5 h-5 text-brand-500" />;
  };

  return (
    <div 
      onClick={handleLectureClick}
      className={`card flex items-center p-3 sm:p-4 rounded-xl border transition-all cursor-pointer ${
        lecture.isLocked 
          ? 'bg-gray-50/50 dark:bg-surface-dark/50 border-gray-100 dark:border-gray-800 opacity-75' 
          : 'bg-white dark:bg-surface-dark border-gray-100 dark:border-gray-800 hover:border-brand-500/30 hover:shadow-sm'
      }`}
    >
      <div className="relative w-24 h-16 sm:w-32 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-warm-200 dark:bg-gray-800 me-4 flex items-center justify-center">
        {lecture.isLocked ? (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
            <Lock className="w-6 h-6 text-white" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-brand-500/10 flex items-center justify-center group-hover:bg-brand-500/20 transition-colors">
            <Play className="w-6 h-6 text-brand-500 ms-1" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className={`font-cairo font-bold text-sm sm:text-base line-clamp-1 ${lecture.isLocked ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
            <span className="text-brand-500 me-2 text-xs">{index + 1}.</span>
            {lecture.title}
          </h4>
          <div className="shrink-0 ms-2">
            {getStatusIcon()}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{lecture.duration || '0 دقيقة'}</span>
          </div>
          {lecture.hasQuiz && (
            <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full text-[10px]">
              اختبار
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
