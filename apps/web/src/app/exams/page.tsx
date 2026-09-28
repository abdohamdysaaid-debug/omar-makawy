'use client';

import React, { useState, useEffect } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { FileText, Clock, Award, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function ExamsPage() {
  const { student } = useAuth();
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const academicYearId = student?.academicYearId;

  useEffect(() => {
    let isMounted = true;

    async function fetchExams() {
      setLoading(true);
      try {
        const queryParams = academicYearId ? `?academicYearId=${academicYearId}` : '';
        const res = await apiClient.get<any[]>(`/exams${queryParams}`).catch(() => []);
        if (isMounted) {
          if (Array.isArray(res) && res.length > 0) {
            setExams(res);
          } else {
            setExams([]);
          }
        }
      } catch {
        if (isMounted) setExams([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchExams();

    return () => {
      isMounted = false;
    };
  }, [academicYearId]);

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            الامتحانات والاختبارات
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            الاختبارات الدورية والامتحانات التجريبية الخاصة بمرحلتك الدراسية
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : exams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                        {exam.title}
                      </h3>
                      <p className="text-xs text-gray-500">{exam.courseTitle || 'اختبار شامل'}</p>
                    </div>
                  </div>

                  {exam.isCompleted ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      تم التقديم ({exam.score}/{exam.totalScore})
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-bold">
                      متاح الآن
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    {exam.duration || '30 دقيقة'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    {exam.questionCount || 10} سؤال
                  </span>
                </div>

                {!exam.isCompleted && (
                  <button className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20">
                    ابدأ الاختبار
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="FileText"
            title="لا توجد امتحانات متاحة حالياً"
            description="لم يتم إتاحة امتحانات تجريبية أو اختبارات جديدة لمرحلتك الدراسية حتى الآن."
          />
        )}
      </div>
    </StudentLayout>
  );
}
