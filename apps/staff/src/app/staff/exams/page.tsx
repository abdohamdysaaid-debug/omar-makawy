'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  BookOpen,
  Search,
  Loader2,
  Award,
  Lock,
} from 'lucide-react';
import { staffApiClient as apiClient } from '@/context/StaffAuthContext';

interface QuestionOption {
  id: string;
  text: string;
}

interface Question {
  id?: string;
  question_text_ar: string;
  options: QuestionOption[];
  correct_option_id: string;
  explanation_ar?: string;
  points?: number;
  sequence_order?: number;
}

interface Exam {
  id: string;
  title_ar: string;
  title_en?: string;
  description_ar?: string;
  academic_year_id?: string;
  course_id?: string;
  lecture_id?: string;
  pass_percentage: number;
  is_required_for_next: boolean;
  show_in_student_menu?: boolean;
  duration_minutes: number;
  is_published: boolean;
  lecture_title_ar?: string;
  course_title_ar?: string;
  question_count?: number;
  submission_count?: number;
  questions?: Question[];
  created_at?: string;
}

interface Lecture {
  id: string;
  title_ar: string;
  course_title_ar?: string;
}

export default function StaffExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);

  // Form state
  const [titleAr, setTitleAr] = useState<string>('');
  const [descriptionAr, setDescriptionAr] = useState<string>('');
  const [selectedLectureId, setSelectedLectureId] = useState<string>('');
  const [passPercentage, setPassPercentage] = useState<number>(50);
  const [isRequiredForNext, setIsRequiredForNext] = useState<boolean>(false);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [showInStudentMenu, setShowInStudentMenu] = useState<boolean>(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // AI Generator state
  const [aiTopic, setAiTopic] = useState<string>('');
  const [aiQuestionCount, setAiQuestionCount] = useState<number>(10);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  useEffect(() => {
    fetchExams();
    fetchLectures();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<Exam[]>('/exams');
      setExams(res || []);
    } catch (err: any) {
      console.error('Failed to fetch exams:', err);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLectures = async () => {
    try {
      const res = await apiClient.get<any[]>('/lectures');
      if (Array.isArray(res)) {
        setLectures(res.map((l: any) => ({ id: l.id, title_ar: l.title_ar, course_title_ar: l.course_title_ar })));
      }
    } catch (e) {
      console.warn('Could not fetch lectures list');
    }
  };

  const handleOpenManualModal = (exam?: Exam) => {
    if (exam) {
      setEditingExamId(exam.id);
      setTitleAr(exam.title_ar || '');
      setDescriptionAr(exam.description_ar || '');
      setSelectedLectureId(exam.lecture_id || '');
      setPassPercentage(exam.pass_percentage || 50);
      setIsRequiredForNext(Boolean(exam.is_required_for_next));
      setDurationMinutes(exam.duration_minutes || 30);
      setShowInStudentMenu(exam.show_in_student_menu !== false);
      setQuestions(exam.questions || []);
    } else {
      setEditingExamId(null);
      setTitleAr('');
      setDescriptionAr('');
      setSelectedLectureId('');
      setPassPercentage(50);
      setIsRequiredForNext(false);
      setDurationMinutes(30);
      setShowInStudentMenu(true);
      setQuestions([
        {
          question_text_ar: '',
          options: [
            { id: 'A', text: '' },
            { id: 'B', text: '' },
            { id: 'C', text: '' },
            { id: 'D', text: '' },
          ],
          correct_option_id: 'A',
          explanation_ar: '',
          points: 1,
        },
      ]);
    }
    setIsManualModalOpen(true);
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question_text_ar: '',
        options: [
          { id: 'A', text: '' },
          { id: 'B', text: '' },
          { id: 'C', text: '' },
          { id: 'D', text: '' },
        ],
        correct_option_id: 'A',
        explanation_ar: '',
        points: 1,
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx: number, field: string, value: any) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleOptionTextChange = (qIdx: number, optId: string, text: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const q = { ...updated[qIdx] };
      q.options = q.options.map((opt) => (opt.id === optId ? { ...opt, text } : opt));
      updated[qIdx] = q;
      return updated;
    });
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleAr.trim()) {
      alert('يرجى أدخال عنوان الامتحان');
      return;
    }
    if (questions.length === 0) {
      alert('يرجى إضافة سؤال واحد على الأقل للامتحان');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title_ar: titleAr,
        description_ar: descriptionAr,
        lecture_id: selectedLectureId || undefined,
        pass_percentage: passPercentage,
        is_required_for_next: isRequiredForNext,
        duration_minutes: durationMinutes,
        show_in_student_menu: showInStudentMenu,
        is_published: true,
        questions,
      };

      if (editingExamId) {
        await apiClient.put(`/exams/${editingExamId}`, payload);
        setSuccessMsg('تم تحديث الامتحان بنجاح!');
      } else {
        await apiClient.post('/exams', payload);
        setSuccessMsg('تم إنشاء الامتحان وإضافته بنجاح!');
      }

      setIsManualModalOpen(false);
      fetchExams();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء حفظ الامتحان');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateAiExam = async () => {
    if (!aiTopic.trim()) {
      alert('يرجى أدخال الدرس أو الموضوع المطلوب إنشاء الامتحان عنه');
      return;
    }

    setIsGeneratingAi(true);
    try {
      const res = await apiClient.post<any>('/exams/ai-generate', {
        topic_or_lesson: aiTopic,
        question_count: aiQuestionCount,
      });

      if (res && Array.isArray(res.questions)) {
        setTitleAr(`امتحان ذكاء اصطناعي: ${aiTopic}`);
        setDescriptionAr(`تم توليد هذا الامتحان تلقائياً عن درس "${aiTopic}" بعدد ${res.questions.length} أسئلة اختيار من متعدد.`);
        setQuestions(res.questions);
        setIsAiModalOpen(false);
        setIsManualModalOpen(true);
      }
    } catch (err: any) {
      alert(err.message || 'حدث خطأ في توليد الامتحان بالذكاء الاصطناعي');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (!confirm('هل أنت تأكد من حذف هذا الامتحان تماماً؟')) return;
    try {
      await apiClient.delete(`/exams/${id}`);
      setExams((prev) => prev.filter((e) => e.id !== id));
      setSuccessMsg('تم حذف الامتحان بنجاح');
    } catch (err: any) {
      alert(err.message || 'فشل حذف الامتحان');
    }
  };

  const filteredExams = exams.filter((e) =>
    e.title_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.lecture_title_ar && e.lecture_title_ar.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-gray-900 dark:text-neutral-100" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-gray-200/80 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">إدارة الامتحانات والاختبارات</h1>
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              إضافة امتحانات اختيارية للمحاضرات، تحديد نسبة النجاح وشرط المحاضرة التالية، وإنشاء امتحانات بالذكاء الاصطناعي ✨
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold text-sm shadow-md hover:brightness-105 transition-all"
          >
            <Sparkles className="h-4.5 w-4.5 animate-pulse" />
            <span>Create AI Exam ✨</span>
          </button>

          <button
            onClick={() => handleOpenManualModal()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-md hover:bg-brand-700 transition-all"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>إضافة امتحان جديد</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200/80 dark:border-neutral-800 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-neutral-400 block">إجمالي الامتحانات</span>
            <span className="text-xl font-bold">{exams.length}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200/80 dark:border-neutral-800 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-neutral-400 block">مرتبطة بمحاضرات</span>
            <span className="text-xl font-bold">{exams.filter((e) => e.lecture_id).length}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200/80 dark:border-neutral-800 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-neutral-400 block">امتحانات إجبارية للمحاضرة</span>
            <span className="text-xl font-bold text-amber-600">{exams.filter((e) => e.is_required_for_next).length}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200/80 dark:border-neutral-800 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-neutral-400 block">متوسط نسبة النجاح</span>
            <span className="text-xl font-bold text-emerald-600">50%</span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-200/80 dark:border-neutral-800">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث باسم الامتحان أو المحاضرة المرتبطة..."
            className="w-full pl-4 pr-9 py-2 text-sm rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200/80 dark:border-neutral-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-brand-600" />
            <p className="text-sm text-gray-500">جاري تحميل قائمة الامتحانات...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <GraduationCap className="h-12 w-12 mx-auto text-gray-400" />
            <div className="space-y-1">
              <h3 className="font-bold text-base">لا توجد امتحانات حتى الآن</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                قم بإضافة امتحان يدوي أو اضغط على Create AI Exam لتوليد أسئلة اختيار من متعدد في ثوانٍ.
              </p>
            </div>
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white font-semibold text-xs shadow-md hover:bg-amber-600"
            >
              <Sparkles className="h-4 w-4" />
              <span>إنشاء بواسطة AI ✨</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 dark:bg-neutral-800/60 border-b border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-400 font-semibold uppercase">
                <tr>
                  <th className="py-3.5 px-4">عنوان الامتحان</th>
                  <th className="py-3.5 px-4">المحاضرة المرتبطة</th>
                  <th className="py-3.5 px-4">نسبة النجاح المطلوب</th>
                  <th className="py-3.5 px-4">شرط فتح المحاضرة التالية</th>
                  <th className="py-3.5 px-4">عدد الأسئلة</th>
                  <th className="py-3.5 px-4">المدة</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800 font-medium">
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50/70 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900 dark:text-neutral-100 text-sm">{exam.title_ar}</div>
                      {exam.description_ar && (
                        <div className="text-[11px] text-gray-500 dark:text-neutral-400 truncate max-w-xs">{exam.description_ar}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {exam.lecture_title_ar ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-semibold text-[11px]">
                          <BookOpen className="h-3.5 w-3.5" />
                          {exam.lecture_title_ar}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">غير مرتبط بمحاضرة</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs">
                        {exam.pass_percentage}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {exam.is_required_for_next ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[11px]">
                          <Lock className="h-3 w-3" />
                          إجباري (نعم)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300 text-[11px]">
                          اختياري (لا)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-sm">
                      {exam.question_count || (exam.questions ? exam.questions.length : 0)} سؤال
                    </td>

                    <td className="py-3.5 px-4 text-gray-600 dark:text-neutral-400">
                      {exam.duration_minutes} دقيقة
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenManualModal(exam)}
                          title="تعديل الامتحان والأسئلة"
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteExam(exam.id)}
                          title="حذف الامتحان"
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Creation Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl border border-gray-200 dark:border-neutral-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4 border-gray-100 dark:border-neutral-800">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-brand-600" />
                {editingExamId ? 'تعديل بيانات الامتحان' : 'إضافة امتحان جديد'}
              </h2>
              <button onClick={() => setIsManualModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold">عنوان الامتحان *</label>
                  <input
                    type="text"
                    required
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder="مثال: امتحان محاضرة زمن المضارع التام"
                    className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold">اربط بمحاضرة معينة</label>
                  <select
                    value={selectedLectureId}
                    onChange={(e) => setSelectedLectureId(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700"
                  >
                    <option value="">بدون ربط بمحاضرة (امتحان عام)</option>
                    {lectures.map((lec) => (
                      <option key={lec.id} value={lec.id}>
                        {lec.title_ar} {lec.course_title_ar ? `(${lec.course_title_ar})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-gray-200/60 dark:border-neutral-800">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold block">نسبة نجاح تتخطى (%)</label>
                  <select
                    value={passPercentage}
                    onChange={(e) => setPassPercentage(Number(e.target.value))}
                    className="w-full p-2 text-xs rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 font-bold text-brand-600"
                  >
                    <option value={50}>50% (الافتراضي)</option>
                    <option value={60}>60%</option>
                    <option value={70}>70%</option>
                    <option value={80}>80%</option>
                    <option value={90}>90%</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold block">شرط للمحاضرة التالية؟</label>
                  <div className="flex items-center gap-3 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                      <input
                        type="radio"
                        name="required"
                        checked={isRequiredForNext === true}
                        onChange={() => setIsRequiredForNext(true)}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-amber-600 font-bold">نعم (إجباري)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                      <input
                        type="radio"
                        name="required"
                        checked={isRequiredForNext === false}
                        onChange={() => setIsRequiredForNext(false)}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <span>لا (اختياري)</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold block">مدة الامتحان (بالدقائق)</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full p-2 text-xs rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700"
                  />
                </div>
              </div>

              {/* Placement settings */}
              <div className="bg-brand-50/50 dark:bg-brand-950/30 p-4 rounded-xl border border-brand-100 dark:border-brand-900/50 space-y-2">
                <label className="text-xs font-bold block text-brand-900 dark:text-brand-300">
                  أين يظهر هذا الامتحان للطالب؟ (مكـان النشر)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    showInStudentMenu ? 'bg-white dark:bg-neutral-900 border-brand-500 shadow-2xs font-bold text-brand-700 dark:text-brand-300' : 'bg-white/60 dark:bg-neutral-900/60 border-gray-200 dark:border-neutral-800'
                  }`}>
                    <input
                      type="checkbox"
                      checked={showInStudentMenu}
                      onChange={(e) => setShowInStudentMenu(e.target.checked)}
                      className="mt-0.5 text-brand-600 rounded focus:ring-brand-500"
                    />
                    <div>
                      <span className="block font-bold">في قائمة الامتحانات الرئيسية للطالب</span>
                      <span className="text-[10px] text-gray-500 dark:text-neutral-400 font-normal">يظهر في صفحة (الامتحانات) في القائمة الجانبية لحساب الطالب</span>
                    </div>
                  </label>

                  <label className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all ${
                    selectedLectureId ? 'bg-white dark:bg-neutral-900 border-blue-500 shadow-2xs font-bold text-blue-700 dark:text-blue-300' : 'bg-white/60 dark:bg-neutral-900/60 border-gray-200 dark:border-neutral-800 opacity-80'
                  }`}>
                    <div className="mt-0.5">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="block font-bold">داخل المحاضرة المحددة أعلاه</span>
                      <span className="text-[10px] text-gray-500 dark:text-neutral-400 font-normal">
                        {selectedLectureId ? 'مربوط بالمحاضرة المحددة' : 'اختر محاضرة من القائمة أعلاه لإظهاره داخل المحاضرة'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Questions Section */}
              <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-brand-600" />
                    الأسئلة الاختيارية ({questions.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-bold hover:bg-brand-100"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    إضافة سؤال
                  </button>
                </div>

                <div className="space-y-4">
                  {questions.map((q, qIdx) => (
                    <div key={qIdx} className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 space-y-3 bg-white dark:bg-neutral-900">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 px-2 py-0.5 rounded-md">
                          سؤال {qIdx + 1}
                        </span>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIdx)}
                            className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            حذف السؤال
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        required
                        value={q.question_text_ar}
                        onChange={(e) => handleQuestionChange(qIdx, 'question_text_ar', e.target.value)}
                        placeholder="نص السؤال..."
                        className="w-full p-2.5 text-xs rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700"
                      />

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((opt) => (
                          <div key={opt.id} className="flex items-center gap-2 bg-gray-50/50 dark:bg-neutral-800/40 p-2 rounded-lg border border-gray-200/50 dark:border-neutral-800">
                            <input
                              type="radio"
                              name={`correct_${qIdx}`}
                              checked={q.correct_option_id === opt.id}
                              onChange={() => handleQuestionChange(qIdx, 'correct_option_id', opt.id)}
                              className="text-emerald-600 focus:ring-emerald-500"
                              title="حدد هذه الإجابة كإجابة صحيحة"
                            />
                            <span className="font-bold text-xs w-5">{opt.id})</span>
                            <input
                              type="text"
                              required
                              value={opt.text}
                              onChange={(e) => handleOptionTextChange(qIdx, opt.id, e.target.value)}
                              placeholder={`الخيار ${opt.id}...`}
                              className="w-full p-1.5 text-xs rounded-md bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700"
                            />
                          </div>
                        ))}
                      </div>

                      <input
                        type="text"
                        value={q.explanation_ar || ''}
                        onChange={(e) => handleQuestionChange(qIdx, 'explanation_ar', e.target.value)}
                        placeholder="توضيح وشرح سبب الإجابة الصحيحة للطلاب (اختياري)..."
                        className="w-full p-2 text-[11px] rounded-lg bg-gray-50 dark:bg-neutral-800/70 border border-gray-200 dark:border-neutral-700"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>حفظ الامتحان</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Exam Generator Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center justify-between border-b pb-4 border-gray-100 dark:border-neutral-800">
              <h2 className="text-lg font-bold flex items-center gap-2 text-amber-600">
                <Sparkles className="h-5 w-5 animate-pulse" />
                توليد امتحان بالذكاء الاصطناعي (Create AI Exam)
              </h2>
              <button onClick={() => setIsAiModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold">اسم الدرس أو الموضوع العلمي *</label>
                <textarea
                  rows={3}
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="مثال: اكتب امتحان على قاعدة الماضي البسيط ومقارنة الصفات في اللغة الإنجليزية للصف الثالث الثانوي..."
                  className="w-full p-3 text-xs rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold">عدد الأسئلة المطلوبة</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setAiQuestionCount(10)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold ${
                      aiQuestionCount === 10
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                        : 'bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700'
                    }`}
                  >
                    10 أسئلة
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiQuestionCount(20)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold ${
                      aiQuestionCount === 20
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                        : 'bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700'
                    }`}
                  >
                    20 سؤالاً
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-300"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isGeneratingAi}
                onClick={handleGenerateAiExam}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:brightness-105 disabled:opacity-50 flex items-center gap-2 shadow-md"
              >
                {isGeneratingAi ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>جاري توليد الأسئلة بالذكاء الاصطناعي...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>توليد الأسئلة الآن ✨</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
