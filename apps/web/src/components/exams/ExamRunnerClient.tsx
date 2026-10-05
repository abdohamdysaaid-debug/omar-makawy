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
  Lock,
  Calendar,
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
  allow_retake?: boolean;
  retake_policy?: string;
  max_retakes?: number;
  available_at?: string;
  isAvailable?: boolean;
  canRetake?: boolean;
  retakeReason?: string;
  attemptsCount?: number;
  hasPassed?: boolean;
  latestSubmission?: any;
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

            // If student cannot retake and has a previous submission, load it automatically
            if (res.canRetake === false && res.latestSubmission) {
              setSubmissionResult({
                submission: res.latestSubmission,
                exam_title: res.title_ar,
                pass_percentage: res.pass_percentage,
                is_passed: res.latestSubmission.is_passed,
                score: res.latestSubmission.score,
                total_points: res.latestSubmission.total_points,
                percentage: res.latestSubmission.percentage,
              });
              if (res.latestSubmission.answers) {
                setAnswers(res.latestSubmission.answers);
              }
            }
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
        alert('حدث خطأ أو غير متاح إعادة تقديم الامتحان.');
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

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
          <p className="text-sm font-bold text-gray-500">جاري تحميل بيانات الاختبار...</p>
        </div>
      </StudentLayout>
    );
  }

  if (error || !exam) {
    return (
      <StudentLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center max-w-md mx-auto p-6 bg-white dark:bg-[#131b2e] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white">عذراً، يتعذر الوصول للامتحان</h2>
          <p className="text-sm text-gray-500 leading-relaxed">{error || 'الامتحان غير موجود أو قد تم حذفه'}</p>
          <button
            onClick={() => router.push('/student/exams')}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
          >
            العودة لقائمة الامتحانات
          </button>
        </div>
      </StudentLayout>
    );
  }

  const questions = exam.questions || [];
  const currentQuestion = questions[currentQuestionIdx];
  const isLastQuestion = currentQuestionIdx === questions.length - 1;
  const answeredCount = Object.keys(answers).length;

  const isFutureAvailable = exam.isAvailable === false || (exam.available_at && new Date(exam.available_at).getTime() > Date.now());
  const canStartNewExam = exam.canRetake !== false && !isFutureAvailable;

  // View Results Screen after submission or locked previous attempt
  if (submissionResult) {
    const score = submissionResult.score ?? submissionResult.submission?.score ?? 0;
    const totalPoints = submissionResult.total_points ?? submissionResult.submission?.total_points ?? questions.length;
    const percentage = submissionResult.percentage ?? submissionResult.submission?.percentage ?? 0;
    const isPassed = submissionResult.is_passed ?? submissionResult.submission?.is_passed ?? (percentage >= exam.pass_percentage);

    return (
      <StudentLayout>
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
          {/* Header Banner */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800 shadow-sm text-center space-y-4">
            <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center shadow-lg ${
              isPassed
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shadow-emerald-600/10'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 shadow-rose-600/10'
            }`}>
              {isPassed ? <Award className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
            </div>

            <div className="space-y-1">
              <span className={`px-4 py-1.5 rounded-full text-xs font-black inline-block ${
                isPassed ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
              }`}>
                {isPassed ? 'تهانينا! لقد اجتزت الاختبار بنجاح' : 'لم تتجاوز نسبة النجاح المطلوبة'}
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                {exam.title_ar}
              </h1>

              <div className="text-4xl font-extrabold pt-2 text-emerald-600 dark:text-emerald-400">
                {percentage}%
              </div>
              <p className="text-xs text-gray-500 font-bold">
                الدرجة الحاصل عليها: {score} من إجمالي {totalPoints} درجة (نسبة النجاح المطلوب: {exam.pass_percentage}%)
              </p>
            </div>

            {exam.canRetake === false && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-xs font-bold text-amber-800 dark:text-amber-300 max-w-lg mx-auto flex items-center justify-center gap-2">
                <Lock className="w-4 h-4 shrink-0" />
                <span>{exam.retakeReason || 'غير مسموح بإعادة هذا الامتحان. يمكنك مراجعة النتيجة النموذجية أدناه.'}</span>
              </div>
            )}

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

              {canStartNewExam && (
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
              )}
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
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold text-[11px] shrink-0">
                          إجابة خاطئة ✗
                        </span>
                      )}
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options?.map((opt) => {
                        const isChosen = studentOptId === opt.id;
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

                    {/* Explanation */}
                    {q.explanation_ar && (
                      <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/40 text-xs text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/40">
                        <strong className="font-extrabold ml-1">التوضيح والشرح:</strong>
                        {q.explanation_ar}
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

  // Initial Start Screen
  if (!isExamStarted) {
    return (
      <StudentLayout>
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in py-8">
          <div className="p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <GraduationCap className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {exam.title_ar}
              </h1>
              {exam.description_ar && (
                <p className="text-xs text-gray-500 leading-relaxed max-w-lg mx-auto">
                  {exam.description_ar}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#182238] border border-gray-100 dark:border-gray-800">
                <Clock className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="text-[10px] text-gray-400 block font-bold">المدة الزمنية</span>
                <span className="text-xs font-black text-gray-900 dark:text-white">
                  {exam.duration_minutes} دقيقة
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#182238] border border-gray-100 dark:border-gray-800">
                <HelpCircle className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="text-[10px] text-gray-400 block font-bold">عدد الأسئلة</span>
                <span className="text-xs font-black text-gray-900 dark:text-white">
                  {questions.length} سؤال
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#182238] border border-gray-100 dark:border-gray-800 col-span-2 sm:col-span-1">
                <Award className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="text-[10px] text-gray-400 block font-bold">درجة النجاح</span>
                <span className="text-xs font-black text-gray-900 dark:text-white">
                  {exam.pass_percentage}%
                </span>
              </div>
            </div>

            {/* Retake & Availability Alert Banners */}
            {isFutureAvailable && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 rounded-2xl text-xs font-bold text-amber-800 dark:text-amber-300 max-w-md mx-auto flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>
                  هذا الامتحان غير متاح حالياً. متاح اعتباراً من:{' '}
                  {new Date(exam.available_at!).toLocaleString('ar-EG')}
                </span>
              </div>
            )}

            {!isFutureAvailable && exam.canRetake === false && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 rounded-2xl text-xs font-bold text-rose-800 dark:text-rose-300 max-w-md mx-auto flex items-center justify-center gap-2">
                <Lock className="w-4 h-4 shrink-0" />
                <span>{exam.retakeReason || 'لقد قمت بإجراء هذا الامتحان مسبقاً، وغير مسموح بالإعادة.'}</span>
              </div>
            )}

            <div className="pt-2">
              {canStartNewExam ? (
                <button
                  onClick={() => setIsExamStarted(true)}
                  className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-black transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 mx-auto"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>ابدأ الاختبار الآن</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <button
                  disabled
                  className="w-full sm:w-auto px-8 py-3.5 bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-2xl text-sm font-black cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
                >
                  <Lock className="w-4 h-4" />
                  <span>الامتحان غير متاح للإعادة</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Live Exam Runner Interface
  return (
    <StudentLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-16">
        {/* Top Header Timer & Question Tracker */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800 shadow-xs flex items-center justify-between gap-4 sticky top-4 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm">
              {currentQuestionIdx + 1}
            </span>
            <div>
              <h3 className="font-black text-xs text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                {exam.title_ar}
              </h3>
              <span className="text-[10px] text-gray-400 font-bold">
                السؤال {currentQuestionIdx + 1} من إجمالي {questions.length} (المجاب: {answeredCount})
              </span>
            </div>
          </div>

          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl font-black text-sm ${
            timeLeftSeconds < 180 ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 animate-pulse' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTimer(timeLeftSeconds)}</span>
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                سؤال رقم {currentQuestionIdx + 1} ({currentQuestion.points || 1} درجة)
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white leading-relaxed">
                {currentQuestion.question_text_ar}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options?.map((opt) => {
                const isSelected = answers[currentQuestion.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setAnswers((prev) => ({
                        ...prev,
                        [currentQuestion.id]: opt.id,
                      }));
                    }}
                    className={`w-full p-4 rounded-2xl border text-right transition-all flex items-center justify-between gap-3 text-xs sm:text-sm font-bold ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-900 dark:text-emerald-200 shadow-sm'
                        : 'bg-gray-50/50 dark:bg-[#182238] border-gray-200/80 dark:border-gray-800 text-gray-800 dark:text-gray-200 hover:bg-emerald-50/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}>
                        {opt.id}
                      </span>
                      <span>{opt.text}</span>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Question Navigation Bar */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestionIdx === 0}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-1.5"
          >
            <ArrowRight className="w-4 h-4" />
            <span>السؤال السابق</span>
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmitExam}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>إنهاء وتسليم الاختبار</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIdx((prev) => Math.min(questions.length - 1, prev + 1))}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
            >
              <span>السؤال التالي</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
