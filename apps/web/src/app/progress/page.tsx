'use client';

import React, { useState, useEffect } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { TrendingUp, BookOpen, Clock, Award, CheckCircle2, XCircle, FileText } from 'lucide-react';
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
        let res = await apiClient.get<any>('/exams/my-progress').catch(() => null);
        if (!res) {
          res = await apiClient.get<any>('/students/my-progress').catch(() => null);
        }
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
          <div className="space-y-4">
            <div className="h-28 rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
              ))}
            </div>
          </div>
        ) : analytics ? (
          <div className="space-y-6">
            {/* Overall Progress Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0d6e4f] to-emerald-700 text-white shadow-xl shadow-emerald-700/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black">نسبة التقدم الإجمالية</h2>
                    <p className="text-xs text-emerald-100">
                      مستوى الإنجاز الدراسي الشامل بناءً على المحاضرات والاختبارات
                    </p>
                  </div>
                </div>
                <span className="text-3xl font-black">
                  {analytics.overallProgress ?? 0}%
                </span>
              </div>
              
              <div className="w-full bg-black/20 rounded-full h-3.5 overflow-hidden p-0.5">
                <div
                  className="bg-white h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.min(100, Math.max(0, analytics.overallProgress || 0))}%` }}
                />
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-gray-400 font-bold">المحاضرات المكتملة</span>
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
                  <span className="text-xs text-gray-400 font-bold">ساعات المشاهدة</span>
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
                  <span className="text-xs text-gray-400 font-bold">متوسط الاختبارات</span>
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    {analytics.averageExamScore !== undefined ? `${analytics.averageExamScore}%` : '0%'}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Exam Submissions */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  سجل الاختبارات الأخير
                </h3>
                <span className="text-xs font-bold text-gray-400">
                  إجمالي الامتحانات: {analytics.completedExams || 0}
                </span>
              </div>

              {analytics.recentExams && analytics.recentExams.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {analytics.recentExams.map((exam: any, idx: number) => {
                    const isPassed = exam.passed ?? (exam.percentage >= 50);
                    return (
                      <div key={exam.submission_id || idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                            isPassed
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                          }`}>
                            {isPassed ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                              {exam.title_ar || exam.exam_title || 'امتحان تقييمي'}
                            </h4>
                            <p className="text-xs text-gray-400">
                              {exam.created_at ? new Date(exam.created_at).toLocaleDateString('ar-EG') : 'تم التقديم'}
                            </p>
                          </div>
                        </div>

                        <div className="text-left">
                          <span className="font-black text-base text-gray-900 dark:text-white">
                            {exam.score} / {exam.total_score}
                          </span>
                          <p className={`text-xs font-bold ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {exam.percentage}% ({isPassed ? 'ناجح' : 'بحاجة لتحسين'})
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-gray-400">
                  لم تقم بتأدية أي امتحانات بعد. High quality assessments pending!
                </div>
              )}
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
