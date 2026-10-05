'use client';

import React, { useState, useEffect } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import EmptyState from '@/components/ui/EmptyState';
import { apiClient } from '@/lib/api';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck,
  ChevronRight,
  BookOpen,
  Calendar,
  X,
  HelpCircle,
  Lock,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface QuestionBreakdown {
  id: string;
  question_text_ar: string;
  options: { id: string; text: string }[];
  user_answer: string | null;
  correct_option_id: string | null;
  is_correct: boolean | null;
  explanation_ar: string | null;
  points: number;
}

interface ExamSubmission {
  id: string;
  exam_id: string;
  exam_title: string;
  course_title_ar?: string;
  lecture_title_ar?: string;
  academic_year_name_ar?: string;
  pass_percentage: number;
  duration_minutes: number;
  score: number;
  total_points: number;
  percentage: number;
  is_passed: boolean;
  submitted_at: string;
  is_result_released: boolean;
  release_message?: string;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  unattempted_count: number;
  questions: QuestionBreakdown[];
}

export default function StudentExamResultsPage() {
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ExamSubmission | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchMySubmissions() {
      try {
        setLoading(true);
        let res: any = await apiClient.get<ExamSubmission[]>('/exams/my-submissions').catch(() => null);
        if (!res) {
          res = await apiClient.get<ExamSubmission[]>('/api/v1/exams/my-submissions').catch(() => null);
        }
        if (isMounted) {
          setSubmissions(Array.isArray(res) ? res : []);
        }
      } catch {
        if (isMounted) setSubmissions([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchMySubmissions();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2.5">
              <Award className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              نتائج الامتحانات والاختبارات
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              استعرض جميع نتائج امتحاناتك السابقة، الإحصائيات الدقيقة، ومراجعة الحلول النموذجية
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs border border-emerald-200 dark:border-emerald-800">
              إجمالي الامتحانات: {submissions.length}
            </span>
          </div>
        </div>

        {/* List of Exam Submissions */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-56 rounded-3xl bg-gray-100 dark:bg-gray-800/60 animate-pulse" />
            ))}
          </div>
        ) : submissions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {submissions.map((sub) => {
              const isPassed = sub.is_passed;
              const isReleased = sub.is_result_released !== false;

              return (
                <div
                  key={sub.id}
                  className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Status & Date Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          !isReleased
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600'
                            : isPassed
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                        }`}>
                          {!isReleased ? (
                            <Clock className="w-5 h-5" />
                          ) : isPassed ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <XCircle className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                            {sub.exam_title}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {sub.lecture_title_ar
                              ? `محاضرة: ${sub.lecture_title_ar}`
                              : sub.course_title_ar
                              ? `كورس: ${sub.course_title_ar}`
                              : sub.academic_year_name_ar
                              ? `الصف: ${sub.academic_year_name_ar}`
                              : 'امتحان عام'}
                          </p>
                        </div>
                      </div>

                      {!isReleased ? (
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 text-xs font-bold shrink-0">
                          النتيجة قريباً
                        </span>
                      ) : isPassed ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 text-xs font-bold shrink-0">
                          ناجح ({sub.percentage}%)
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 text-xs font-bold shrink-0">
                          راسب ({sub.percentage}%)
                        </span>
                      )}
                    </div>

                    {/* Outer Summary Stats Grid (الإحصائيات من بره) */}
                    {isReleased ? (
                      <div className="grid grid-cols-4 gap-2 pt-2">
                        <div className="p-2.5 rounded-2xl bg-gray-50 dark:bg-[#182238] border border-gray-100 dark:border-gray-800/80 text-center">
                          <span className="text-[10px] text-gray-400 block font-bold">الدرجة</span>
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                            {sub.score} / {sub.total_points}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-bold">صحيحة 🟢</span>
                          <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                            {sub.correct_count}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-center">
                          <span className="text-[10px] text-rose-700 dark:text-rose-400 block font-bold">خاطئة 🔴</span>
                          <span className="text-xs font-black text-rose-700 dark:text-rose-300">
                            {sub.wrong_count}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-2xl bg-gray-50 dark:bg-[#182238] border border-gray-100 dark:border-gray-800/80 text-center">
                          <span className="text-[10px] text-gray-400 block font-bold">النسبة</span>
                          <span className="text-xs font-black text-gray-900 dark:text-white">
                            {sub.percentage}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300 font-semibold space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>النتيجة قريباً على هذا الامتحان</span>
                        </div>
                        <p className="text-[11px] text-blue-700 dark:text-blue-300">
                          {sub.release_message || 'النتيجة قريباً على الامتحان - سيتم إعلان النتائج والإجابات النموذجية فور اعتمادها.'}
                        </p>
                      </div>
                    )}

                    {/* Date submitted */}
                    <div className="text-[11px] text-gray-400 font-medium flex items-center justify-between pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        تاريخ التقديم: {new Date(sub.submitted_at).toLocaleString('ar-EG')}
                      </span>
                      <span>{sub.total_questions || sub.questions?.length || 0} أسئلة</span>
                    </div>
                  </div>

                  {/* Actions Button */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    {isReleased ? (
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/15 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <FileCheck className="w-4 h-4" />
                        <span>عرض تفاصيل الإجابات والحلول</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 px-4 bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold cursor-not-allowed opacity-80 flex items-center justify-center gap-1.5"
                      >
                        <Clock className="w-4 h-4" />
                        <span>النتيجة قريباً على هذا الامتحان</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="Award"
            title="لا توجد نتائج امتحانات حتى الآن"
            description="لم تقم بأداء أي اختبارات أو امتحانات إلكترونية بعد. يمكنك أداء الامتحانات المتاحة من صفحة امتحاناتي."
          />
        )}

        {/* Detailed Breakdown Modal (التفاصيل كاملة) */}
        {selectedSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-cairo">
            <div className="bg-white dark:bg-[#131b2e] w-full max-w-3xl rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="p-6 bg-emerald-600 text-white flex items-center justify-between shrink-0">
                <div className="space-y-1">
                  <h2 className="text-lg font-extrabold flex items-center gap-2">
                    <FileCheck className="w-5 h-5" />
                    تفاصيل إجابات: {selectedSubmission.exam_title}
                  </h2>
                  <p className="text-xs text-emerald-100">
                    الدرجة: {selectedSubmission.score} / {selectedSubmission.total_points} ({selectedSubmission.percentage}%) • {selectedSubmission.is_passed ? 'ناجح ✓' : 'راسب ✗'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content / Questions Review */}
              <div className="p-6 overflow-y-auto space-y-4 divide-y divide-gray-100 dark:divide-gray-800">
                {(selectedSubmission as any).is_failed_gating && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-xs font-bold text-amber-800 dark:text-amber-300 space-y-1 text-center">
                    <div className="flex items-center justify-center gap-1.5 font-extrabold text-amber-900 dark:text-amber-200">
                      <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>امتحان إجباري للمحاضرة التالية</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      نظراً لأن هذا الامتحان إجباري لفتح المحاضرة التالية ولم تتجاوز نسبة النجاح بعد، تم حجب الإجابات النموذجية لحين الإعادة والتفوق فيه.
                    </p>
                  </div>
                )}
                {selectedSubmission.questions?.map((q, idx) => {
                  const isCorrect = q.is_correct === true;
                  const isUnattempted = !q.user_answer;

                  return (
                    <div key={q.id || idx} className="pt-4 first:pt-0 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-extrabold text-xs text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0">
                            {idx + 1}
                          </span>
                          {q.question_text_ar}
                        </span>

                        {isUnattempted ? (
                          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-bold text-[11px] shrink-0">
                            غير مجاب ⚪
                          </span>
                        ) : isCorrect ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[11px] shrink-0">
                            إجابة صحيحة ✓
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold text-[11px] shrink-0">
                            إجابة خاطئة ✗
                          </span>
                        )}
                      </div>

                      {/* Options breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {q.options?.map((opt) => {
                          const isChosen = q.user_answer === opt.id;
                          const isRightOpt = q.correct_option_id === opt.id;

                          let style = 'bg-white dark:bg-[#1a2338] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300';
                          if (isRightOpt) {
                            style = 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
                          } else if (isChosen && !isRightOpt) {
                            style = 'bg-rose-100 dark:bg-rose-950/80 border-rose-500 text-rose-900 dark:text-rose-200 font-bold';
                          }

                          return (
                            <div key={opt.id} className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${style}`}>
                              <span>
                                <strong className="ml-1.5 font-black">{opt.id}.</strong>
                                {opt.text}
                              </span>
                              {isRightOpt && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                              {isChosen && !isRightOpt && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                            </div>
                          );
                        })}
                      </div>

                      {/* Model Answer & Explanation */}
                      {q.explanation_ar && (
                        <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 text-xs text-emerald-900 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
                          <strong className="font-extrabold text-emerald-800 dark:text-emerald-400 block">
                            💡 الشرح والتعليل النموذجي:
                          </strong>
                          <p>{q.explanation_ar}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-gray-50 dark:bg-[#182238] border-t border-gray-100 dark:border-gray-800 flex justify-end shrink-0">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
