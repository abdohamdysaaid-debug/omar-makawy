'use client';

import React, { useState, useEffect } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { TrendingUp, BookOpen, Clock, Award, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function ProgressPage() {
  const { student } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchProgress() {
      setLoading(true);
      try {
        const res = await apiClient.get<any>('/students/my-progress').catch(() => null);
        if (isMounted) {
          if (res) {
            setAnalytics(res);
          } else {
            setAnalytics(null);
          }
        }
      } catch {
        if (isMounted) setAnalytics(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProgress();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            تقدمي الدراسي
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            متابعة إحصائيات ونسبة إنجازك في المحاضرات والامتحانات التقييمية
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : analytics ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-gray-400">المحاضرات المكتملة</span>
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    {analytics.completedLectures || 0}
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-gray-400">ساعات المشاهدة</span>
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    {analytics.watchTimeHours || 0} ساعة
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-gray-400">متوسط درجات الاختبارات</span>
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    {analytics.averageExamScore ? `${analytics.averageExamScore}%` : '0%'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            icon="TrendingUp"
            title="لا توجد بيانات تقدم دراسي بعد"
            description="ستظهر إحصائياتك ونسب إنجازك الدراسية فور البدء في مشاهدة المحاضرات وحل الاختبارات."
            actionText="البدء في الدراسة"
            actionUrl="/courses"
          />
        )}
      </div>
    </StudentLayout>
  );
}
