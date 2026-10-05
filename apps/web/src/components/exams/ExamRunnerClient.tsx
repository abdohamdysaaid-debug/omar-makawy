'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import StudentLayout from '@/components/layout/StudentLayout';
import {
  GraduationCap,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Loader2,
  HelpCircle,
  FileCheck,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface ExamQuestionOption {
  id: string;
  text: string;
}

interface ExamQuestion {
  id: string;
  question_text_ar: string;
  options: ExamQuestionOption[];
  correct_option_id: string;
  explanation_ar?: string;
  points?: number;
  sequence_order?: number;
}

interface ExamData {
  id: string;
  title_ar: string;
  description_ar?: string;
  duration_minutes: number;
  pass_percentage: number;
  questions: ExamQuestion[];
  lecture_id?: string;
  lecture_title_ar?: string;
  course_id?: string;
  course_title_ar?: string;
}

interface ExamRunnerClientProps {
  examId: string;
}

export default function ExamRunnerClient({ examId }: ExamRunnerClientProps) {
  const router = useRouter();
  const [exam, setExam] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Exam runner state
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);
  const [isExamStarted, setIsExamStarted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionResult, setSubmissionResult] = useState<any | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch exam data
  useEffect(() => {
    let isMounted = true;
    async function loadExam() {
      try {
        setLoading(true);
        let res: any = await apiClient.get<ExamData>(`/exams/${examId}`).catch(() => null);
        if (!res) {
          res = await apiClient.get<ExamData>(`/api/v1/exams/${examId}`).catch(() => null);
        }
        if (isMounted) {
          if (res && res.id) {
            setExam(res);
            setTimeLeftSeconds((res.duration_minutes || 30) * 60);
          } else {
            setError('الامتحان غير موجود أو غير متاح حالياً.');
          }
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'فشل تحميل بيانات الامتحان');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (examId) loadExam();

    return () => {
      isMounted = false;
    };
  }, [examId]);

  // Submit exam function
  const handleSubmitExam = useCallback(async () => {
    if (isSubmitting || submissionResult) return;
    setIsSubmitting(true);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      let res: any = await apiClient
        .post(`/exams/${examId}/submit`, { answers })
        .catch(() => null);
      if (!res) {
        res = await apiClient
          .post(`/api/v1/exams/${examId}/submit`, { answers })
          .catch(() => null);
      }

      if (res) {
        setSubmissionResult(res);
      } else {
        alert('حدث خطأ أثناء تقديم الامتحان. يرجى المحاولة مرة أخرى.');
      }
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء حفظ نتيجة الامتحان.');
    } finally {
      setIsSubmitting(false);
    }
  }, [examId, answers, isSubmitting, submissionResult]);

  // Timer Countdown Effect
  useEffect(() => {
    if (!isExamStarted || submissionResult || isSubmitting) return;

    timerRef.current = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isExamStarted, submissionResult, isSubmitting, handleSubmitExam]);

  const handleStartExam = () => {
    setIsExamStarted(true);
  };

  const handleOptionSelect = (questionId: string, optionId: string) => {
    if (submissionResult) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Timer format (MM:SS)
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="h-96 flex flex-col items-center justify-center space-y-4 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
          <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
            جاري تحضير وتهيئة أسئلة الامتحان...
          </p>
        </div>
      </StudentLayout>
    );
  }

  if (error || !exam) {
    return (
      <StudentLayout>
        <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 flex items-center justify-center">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">عفواً، متعذر الوصول للامتحان</h2>
          <p className="text-xs text-gray-500">{error || 'الامتحان غير موجود'}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md"
          >
            الرجوع للصفحة السابقة
          </button>
        </div>
      </StudentLayout>
    );
  }

  const questions = exam.questions || [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIdx];
  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.round((answeredCount / Math.max(1, totalQuestions)) * 100);

  // 1. Result Screen View after exam completion
  if (submissionResult) {
    const isPassed = submissionResult.is_passed;
    const score = submissionResult.score ?? 0;
    const totalPoints = submissionResult.total_points ?? totalQuestions;
    const percentage = submissionResult.percentage ?? Math.round((score / Math.max(1, totalPoints)) * 100);

    return (
      <StudentLayout>
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in py-4">
          {/* Result Card */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-md text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-lg transition-transform scale-105"
                 style={{
                   backgroundColor: isPassed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                   color: isPassed ? '#10b981' : '#ef4444',
                 }}>
              {isPassed ? <CheckCircle2 className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
            </div>

            <div className="space-y-2">
              <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black tracking-wide ${
                isPassed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
              }`}>
                {isPassed ? 'ناجح - تم اجتياز الاختبار بنجاح 🎉' : 'لم تتجاوز نسبة النجاح المطلوبة'}
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                {exam.title_ar}
              </h1>

              <div className="text-4xl font-extrabold pt-2 text-emerald-600 dark:text-emerald-400">
                {percentage}%
              </div>
              <p className="text-xs text-gray-500 font-bold">
                الدرجة الحاصل عليها: {score} من إجمالي {totalPoints} درجة (نسبة النجاح: {exam.pass_percentage}%)
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {exam.lecture_id && (
                <button
                  onClick={() => router.push(`/student/lectures/detail?id=${exam.lecture_id}`)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>العودة للمحاضرة</span>
                </button>
              )}

              <button
                onClick={() => router.push('/student/progress')}
                className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold text-xs transition-all flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>عرض تقدمي في الدراسة</span>
              </button>

              <button
                onClick={() => {
                  setSubmissionResult(null);
                  setAnswers({});
                  setCurrentQuestionIdx(0);
                  setTimeLeftSeconds((exam.duration_minutes || 30) * 60);
                  setIsExamStarted(true);
                }}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة المحاولة</span>
              </button>
            </div>
          </div>

          {/* Model Answer & Review Section */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs space-y-4">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              مراجعة الأسئلة والإجابة النموذجية
            </h2>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const studentOptId = answers[q.id];
                const isCorrect = studentOptId && studentOptId.trim().toUpperCase() === q.correct_option_id.trim().toUpperCase();

                return (
                  <div
                    key={q.id || idx}
                    className={`p-4 rounded-2xl border space-y-3 ${
                      isCorrect
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                        : 'bg-red-50/30 dark:bg-red-950/20 border-red-200 dark:border-red-900/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-extrabold text-xs text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0">
                          {idx + 1}
                        </span>
                        {q.question_text_ar}
                      </span>

                      {isCorrect ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[11px] shrink-0">
                          إجابة صحيحة ✓
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold text-[11px] shrink-0">
                          إجابة خاطئة ✗
                        </span>
                      )}
                    </div>

                    {/* Options List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt) => {
                        const isStudentChoice = studentOptId === opt.id;
                        const isRightAnswer = q.correct_option_id === opt.id;

                        let style = 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300';
                        if (isRightAnswer) {
                          style = 'bg-emerald-600 text-white border-emerald-600 font-bold';
                        } else if (isStudentChoice && !isRightAnswer) {
                          style = 'bg-red-600 text-white border-red-600 font-bold';
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${style}`}
                          >
                            <span className="font-bold w-5">{opt.id})</span>
                            <span className="flex-1">{opt.text}</span>
                            {isRightAnswer && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                            {isStudentChoice && !isRightAnswer && <XCircle className="w-4 h-4 text-white shrink-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Model Answer Explanation */}
                    {q.explanation_ar && (
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300 space-y-0.5">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 block">💡 الشرح والإجابة النموذجية:</span>
                        <p className="leading-relaxed">{q.explanation_ar}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // 2. Start Screen View (Before clicking "Start Exam")
  if (!isExamStarted) {
    return (
      <StudentLayout>
        <div className="max-w-xl mx-auto my-8 p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-md text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center">
            <GraduationCap className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
              {exam.title_ar}
            </h1>
            {exam.description_ar && (
              <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto">
                {exam.description_ar}
              </p>
            )}
          </div>

          {/* Exam Details Badges */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800">
            <div className="space-y-0.5">
              <span className="text-[10px] text-gray-400 block font-bold">عدد الأسئلة</span>
              <span className="text-sm font-black text-gray-900 dark:text-white">{totalQuestions} أسئلة</span>
            </div>

            <div className="space-y-0.5 border-x border-gray-200 dark:border-gray-800">
              <span className="text-[10px] text-gray-400 block font-bold">مدة الاختبار</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                {exam.duration_minutes} دقيقة
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-gray-400 block font-bold">نسبة النجاح</span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                {exam.pass_percentage}%
              </span>
            </div>
          </div>

          <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200/50 dark:border-amber-900/40 text-right font-semibold space-y-1">
            <span className="font-bold flex items-center gap-1">
              <Clock className="w-4 h-4 text-amber-600" />
              تنبيهات هامة قبل بدء الامتحان:
            </span>
            <ul className="list-disc list-inside text-[10.5px] space-y-0.5 opacity-90">
              <li>التايمر التنازلي سيبدأ فوراً بمجرد الضغط على زر ابدأ الاختبار.</li>
              <li>عند انتهاء الوقت المحدد، سيتم حفظ وإرسال إجاباتك تلقائياً دون إغلاق الصفحة.</li>
              <li>يمكنك مراجعة جميع الأسئلة والإجابة النموذجية فور الانتهاء.</li>
            </ul>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-1/3 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs transition-all"
            >
              إلغاء
            </button>
            <button
              onClick={handleStartExam}
              className="w-2/3 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              <span>ابدأ الاختبار الآن ✨</span>
            </button>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // 3. Exam Active Execution Screen
  const isTimeWarning = timeLeftSeconds <= 120; // 2 minutes or less

  return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto space-y-4 animate-fade-in py-2">
        {/* Sticky Timer & Control Header */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-sm flex items-center justify-between gap-4 sticky top-4 z-40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-gray-900 dark:text-white truncate max-w-xs sm:max-w-md">
                {exam.title_ar}
              </h2>
              <span className="text-[10px] text-gray-400 font-bold">
                السؤال {currentQuestionIdx + 1} من {totalQuestions}
              </span>
            </div>
          </div>

          {/* Countdown Timer Badge */}
          <div className={`px-4 py-2 rounded-2xl border font-black text-sm flex items-center gap-2 ${
            isTimeWarning
              ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-950/60 dark:border-red-900 dark:text-red-400 animate-pulse'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-900 dark:text-emerald-300'
          }`}>
            <Clock className="w-4 h-4" />
            <span dir="ltr">{formatTimer(timeLeftSeconds)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Active Question Box */}
        {currentQuestion && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs space-y-6">
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-black">
                سؤال رقم {currentQuestionIdx + 1}
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white leading-relaxed">
                {currentQuestion.question_text_ar}
              </h3>
            </div>

            {/* Options Choices */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt) => {
                const isSelected = answers[currentQuestion.id] === opt.id;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleOptionSelect(currentQuestion.id, opt.id)}
                    className={`w-full p-4 rounded-2xl border text-right transition-all flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
                        : 'bg-gray-50/70 dark:bg-gray-900/60 border-gray-200/80 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:border-emerald-500/50'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        isSelected
                          ? 'bg-white text-emerald-600'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {opt.id}
                    </span>
                    <span className="text-xs sm:text-sm flex-1">{opt.text}</span>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-white shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Bottom Stepper & Submit Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-1.5"
              >
                <ArrowRight className="w-4 h-4" />
                <span>السؤال السابق</span>
              </button>

              {currentQuestionIdx < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIdx((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
                >
                  <span>السؤال التالي</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitExam}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>إنهاء الامتحان وتسليم الإجابات</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
