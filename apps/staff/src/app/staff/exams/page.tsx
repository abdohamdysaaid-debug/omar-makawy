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
  Layers,
  Search,
  Filter,
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
  academic_year_name_ar?: string;
  course_id?: string;
  course_title_ar?: string;
  package_id?: string;
  package_title_ar?: string;
  lecture_id?: string;
  lecture_title_ar?: string;
  course_ids?: string[];
  package_ids?: string[];
  lecture_ids?: string[];
  pass_percentage: number;
  is_required_for_next: boolean;
  show_in_student_menu?: boolean;
  duration_minutes: number;
  is_published: boolean;
  question_count?: number;
  submission_count?: number;
  questions?: Question[];
  created_at?: string;
}

interface AcademicYear {
  id: string;
  name_ar: string;
  name_en?: string;
  code?: string;
}

interface Course {
  id: string;
  title_ar: string;
  academic_year_id?: string;
}

interface PackageItem {
  id: string;
  title_ar: string;
  academic_year_id?: string;
  courses?: any[];
}

interface Lecture {
  id: string;
  title_ar: string;
  course_id?: string;
  course_title_ar?: string;
  academic_year_id?: string;
}

export default function StaffExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
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
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>('');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);
  const [selectedLectureIds, setSelectedLectureIds] = useState<string[]>([]);
  const [passPercentage, setPassPercentage] = useState<number>(50);
  const [isRequiredForNext, setIsRequiredForNext] = useState<boolean>(false);
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [showInStudentMenu, setShowInStudentMenu] = useState<boolean>(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // AI Generator state
  const [aiTopic, setAiTopic] = useState<string>('');
  const [aiQuestionCount, setAiQuestionCount] = useState<number>(10);
  const [aiAcademicYearId, setAiAcademicYearId] = useState<string>('');
  const [aiCourseId, setAiCourseId] = useState<string>('');
  const [aiLectureId, setAiLectureId] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  useEffect(() => {
    fetchExams();
    fetchAcademicYears();
    fetchCourses();
    fetchPackages();
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

  const fetchAcademicYears = async () => {
    try {
      const res = await apiClient.get<any[]>('/auth/academic-years');
      if (Array.isArray(res)) {
        setAcademicYears(res.map((ay: any) => ({ id: ay.id, name_ar: ay.name_ar, name_en: ay.name_en, code: ay.code })));
      }
    } catch (e) {
      console.warn('Could not fetch academic years');
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await apiClient.get<any>('/courses');
      const items = Array.isArray(res) ? res : res?.items || res?.data || [];
      setCourses(items.map((c: any) => ({ id: c.id, title_ar: c.title_ar, academic_year_id: c.academic_year_id })));
    } catch (e) {
      console.warn('Could not fetch courses list');
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await apiClient.get<any>('/packages?limit=100');
      const items = Array.isArray(res) ? res : res?.items || res?.data || [];
      setPackages(
        items.map((p: any) => ({
          id: p.id,
          title_ar: p.title_ar,
          academic_year_id: p.academic_year_id,
          courses: p.courses || p.package_courses || [],
        }))
      );
    } catch (e) {
      console.warn('Could not fetch packages list');
    }
  };

  const fetchLectures = async () => {
    try {
      const res = await apiClient.get<any>('/lectures');
      const items = Array.isArray(res) ? res : res?.items || res?.data || [];
      setLectures(
        items.map((l: any) => ({
          id: l.id,
          title_ar: l.title_ar,
          course_id: l.course_id,
          course_title_ar: l.course_title_ar,
          academic_year_id: l.academic_year_id,
        }))
      );
    } catch (e) {
      console.warn('Could not fetch lectures list');
    }
  };

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const togglePackageSelection = (packageId: string) => {
    setSelectedPackageIds((prev) =>
      prev.includes(packageId) ? prev.filter((id) => id !== packageId) : [...prev, packageId]
    );
  };

  const toggleLectureSelection = (lectureId: string) => {
    setSelectedLectureIds((prev) =>
      prev.includes(lectureId) ? prev.filter((id) => id !== lectureId) : [...prev, lectureId]
    );
  };

  const handleOpenManualModal = (exam?: Exam) => {
    if (exam) {
      setEditingExamId(exam.id);
      setTitleAr(exam.title_ar || '');
      setDescriptionAr(exam.description_ar || '');
      setSelectedAcademicYearId(exam.academic_year_id || '');

      const cIds =
        exam.course_ids && exam.course_ids.length > 0
          ? exam.course_ids
          : exam.course_id
          ? [exam.course_id]
          : [];
      const pIds =
        exam.package_ids && exam.package_ids.length > 0
          ? exam.package_ids
          : exam.package_id
          ? [exam.package_id]
          : [];
      const lIds =
        exam.lecture_ids && exam.lecture_ids.length > 0
          ? exam.lecture_ids
          : exam.lecture_id
          ? [exam.lecture_id]
          : [];

      setSelectedCourseIds(cIds);
      setSelectedPackageIds(pIds);
      setSelectedLectureIds(lIds);

      setPassPercentage(exam.pass_percentage || 50);
      setIsRequiredForNext(Boolean(exam.is_required_for_next));
      setDurationMinutes(exam.duration_minutes || 30);
      setShowInStudentMenu(exam.show_in_student_menu !== false);
      setQuestions(exam.questions || []);
    } else {
      setEditingExamId(null);
      setTitleAr('');
      setDescriptionAr('');
      setSelectedAcademicYearId('');
      setSelectedCourseIds([]);
      setSelectedPackageIds([]);
      setSelectedLectureIds([]);
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
      alert('يرجى إدخال عنوان الامتحان');
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
        academic_year_id: selectedAcademicYearId || undefined,
        course_id: selectedCourseIds[0] || undefined,
        package_id: selectedPackageIds[0] || undefined,
        lecture_id: selectedLectureIds[0] || undefined,
        course_ids: selectedCourseIds,
        package_ids: selectedPackageIds,
        lecture_ids: selectedLectureIds,
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
      alert('يرجى إدخال الدرس أو الموضوع المطلوب إنشاء الامتحان عنه');
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
        setDescriptionAr(
          `تم توليد هذا الامتحان تلقائياً عن درس "${aiTopic}" بعدد ${res.questions.length} أسئلة اختيار من متعدد.`
        );
        setSelectedAcademicYearId(aiAcademicYearId);
        if (aiCourseId) setSelectedCourseIds([aiCourseId]);
        if (aiLectureId) setSelectedLectureIds([aiLectureId]);
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

  // Modal cascading filtering options
  const filteredCoursesForModal = courses.filter(
    (c) => !selectedAcademicYearId || c.academic_year_id === selectedAcademicYearId
  );

  const filteredPackagesForModal = packages.filter(
    (p) => !selectedAcademicYearId || p.academic_year_id === selectedAcademicYearId
  );

  const packageCourseIds = new Set<string>();
  selectedPackageIds.forEach((pkgId) => {
    const pkg = packages.find((p) => p.id === pkgId);
    if (pkg && Array.isArray(pkg.courses)) {
      pkg.courses.forEach((c: any) => {
        const id = typeof c === 'string' ? c : c.id || c.course_id;
        if (id) packageCourseIds.add(id);
      });
    }
  });

  const activeTargetCourseIds = new Set([
    ...selectedCourseIds,
    ...Array.from(packageCourseIds),
  ]);

  const filteredLecturesForModal = lectures.filter((l) => {
    if (selectedAcademicYearId && l.academic_year_id && l.academic_year_id !== selectedAcademicYearId) {
      return false;
    }
    if (activeTargetCourseIds.size > 0) {
      return l.course_id && activeTargetCourseIds.has(l.course_id);
    }
    return true;
  });

  const filteredExams = exams.filter(
    (e) =>
      e.title_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.lecture_title_ar && e.lecture_title_ar.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.course_title_ar && e.course_title_ar.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.package_title_ar && e.package_title_ar.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.academic_year_name_ar && e.academic_year_name_ar.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-gray-900 dark:text-neutral-100" dir="rtl">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-gray-200/80 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">إدارة الامتحانات والاختبارات</h1>
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              إنشاء امتحانات عامة، أو ربطها بكورسات، باقات، أو محاضرات محددة ✨
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold text-sm shadow-md hover:brightness-105 transition-all cursor-pointer"
          >
            <Sparkles className="h-4.5 w-4.5 animate-pulse" />
            <span>Create AI Exam ✨</span>
          </button>

          <button
            onClick={() => handleOpenManualModal()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow-md hover:bg-emerald-700 transition-all cursor-pointer"
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
            <span className="text-xl font-bold">
              {exams.filter((e) => e.lecture_id || (e.lecture_ids && e.lecture_ids.length > 0)).length}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200/80 dark:border-neutral-800 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-neutral-400 block">امتحانات إجبارية للمحاضرة</span>
            <span className="text-xl font-bold text-amber-600">
              {exams.filter((e) => e.is_required_for_next).length}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200/80 dark:border-neutral-800 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-neutral-400 block">امتحانات عامة (في امتحاناتي)</span>
            <span className="text-xl font-bold text-emerald-600">
              {exams.filter((e) => e.show_in_student_menu !== false).length}
            </span>
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
            placeholder="بحث باسم الامتحان، الصف، الكورس، الباقة، أو المحاضرة..."
            className="w-full pl-4 pr-9 py-2 text-sm rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200/80 dark:border-neutral-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600" />
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
                  <th className="py-3.5 px-4">الصف الدراسي (المرحلة)</th>
                  <th className="py-3.5 px-4">الكورس / الباقة / المحاضرة (مكان النشر)</th>
                  <th className="py-3.5 px-4">نسبة النجاح المطلوبة</th>
                  <th className="py-3.5 px-4">شرط المحاضرة</th>
                  <th className="py-3.5 px-4">الأسئلة والمدة</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800 font-medium">
                {filteredExams.map((exam) => {
                  const hasLectures = (exam.lecture_ids && exam.lecture_ids.length > 0) || exam.lecture_title_ar;
                  const hasCourses = (exam.course_ids && exam.course_ids.length > 0) || exam.course_title_ar;
                  const hasPackages = (exam.package_ids && exam.package_ids.length > 0) || exam.package_title_ar;

                  return (
                    <tr key={exam.id} className="hover:bg-gray-50/70 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900 dark:text-neutral-100 text-sm">{exam.title_ar}</div>
                        {exam.description_ar && (
                          <div className="text-[11px] text-gray-500 dark:text-neutral-400 truncate max-w-xs">
                            {exam.description_ar}
                          </div>
                        )}
                      </td>

                      {/* Academic Year Column */}
                      <td className="py-3.5 px-4">
                        {exam.academic_year_name_ar ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 font-bold text-[11px]">
                            <GraduationCap className="h-3.5 w-3.5 text-purple-600" />
                            {exam.academic_year_name_ar}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-neutral-400 font-medium text-[11px]">
                            عام (كافة الصفوف)
                          </span>
                        )}
                      </td>

                      {/* Course, Package & Lecture Column */}
                      <td className="py-3.5 px-4 space-y-1">
                        {hasLectures ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-semibold text-[11px]">
                            <BookOpen className="h-3.5 w-3.5" />
                            {exam.lecture_ids && exam.lecture_ids.length > 1
                              ? `${exam.lecture_ids.length} محاضرات`
                              : `محاضرة: ${exam.lecture_title_ar || 'محددة'}`}
                          </span>
                        ) : hasCourses ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-semibold text-[11px]">
                            <Layers className="h-3.5 w-3.5" />
                            {exam.course_ids && exam.course_ids.length > 1
                              ? `${exam.course_ids.length} كورسات`
                              : `كورس: ${exam.course_title_ar || 'محدد'}`}
                          </span>
                        ) : hasPackages ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 font-semibold text-[11px]">
                            <Layers className="h-3.5 w-3.5" />
                            {exam.package_ids && exam.package_ids.length > 1
                              ? `${exam.package_ids.length} باقات`
                              : `باقة: ${exam.package_title_ar || 'محددة'}`}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-semibold text-[11px]">
                            <Award className="h-3.5 w-3.5" />
                            امتحان عام
                          </span>
                        )}

                        <div>
                          {exam.show_in_student_menu !== false ? (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                              • يظهر في قائمة (امتحاناتي)
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                              • مخفي من القائمة العامة (داخل المادة فقط)
                            </span>
                          )}
                        </div>
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
                            إجباري للمحاضرة التالية
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300 text-[11px]">
                            اختياري (بدون حظر)
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="font-bold text-sm">
                          {exam.question_count || (exam.questions ? exam.questions.length : 0)} أسئلة
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {exam.duration_minutes} دقيقة
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenManualModal(exam)}
                            title="تعديل الامتحان والأسئلة"
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950 transition-colors cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteExam(exam.id)}
                            title="حذف الامتحان"
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Creation / Edit Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl border border-gray-200 dark:border-neutral-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4 border-gray-100 dark:border-neutral-800">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-emerald-600" />
                {editingExamId ? 'تعديل بيانات الامتحان' : 'إضافة امتحان جديد'}
              </h2>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-5">
              {/* Exam Basic Info */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold">عنوان الامتحان *</label>
                <input
                  type="text"
                  required
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder="مثال: امتحان شامل على زمن المضارع التام والقواعد"
                  className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700"
                />
              </div>

              {/* Target Placement: Selection of Grade, Courses, Packages, Lectures */}
              <div className="bg-gradient-to-br from-emerald-50/60 to-teal-50/40 dark:from-neutral-800/80 dark:to-neutral-900 p-4 rounded-xl border border-emerald-200/60 dark:border-neutral-700 space-y-4">
                <label className="text-xs font-bold block text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-emerald-600" />
                  تحديد التخصيص ومكان النشر (الصف، الكورسات، الباقات، أو المحاضرات)
                </label>

                {/* 1. Academic Year */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700 dark:text-neutral-300">
                    1. الصف الدراسي (المرحلة)
                  </label>
                  <select
                    value={selectedAcademicYearId}
                    onChange={(e) => {
                      setSelectedAcademicYearId(e.target.value);
                      setSelectedCourseIds([]);
                      setSelectedPackageIds([]);
                      setSelectedLectureIds([]);
                    }}
                    className="w-full p-2 text-xs rounded-xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 font-semibold"
                  >
                    <option value="">كل الصفوف (امتحان عام لجميع الصفوف)</option>
                    {academicYears.map((ay) => (
                      <option key={ay.id} value={ay.id}>
                        {ay.name_ar}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Packages Multi-Select */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-gray-700 dark:text-neutral-300 flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-purple-600" />
                      2. تخصيص الامتحان لباقات شهرية (حدد باقة أو أكثر):
                    </label>
                    {selectedPackageIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedPackageIds([])}
                        className="text-[10px] text-red-500 hover:underline cursor-pointer"
                      >
                        إلغاء تحديد الباقات ({selectedPackageIds.length})
                      </button>
                    )}
                  </div>
                  {filteredPackagesForModal.length === 0 ? (
                    <p className="text-[11px] text-gray-400 italic">لا توجد باقات شهرية متاحة للصف المحدد</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-white/70 dark:bg-neutral-900/70 rounded-xl border border-gray-200/60 dark:border-neutral-800">
                      {filteredPackagesForModal.map((pkg) => {
                        const isSelected = selectedPackageIds.includes(pkg.id);
                        return (
                          <button
                            type="button"
                            key={pkg.id}
                            onClick={() => togglePackageSelection(pkg.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-purple-50 hover:text-purple-700'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                            {pkg.title_ar}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. Courses Multi-Select */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-gray-700 dark:text-neutral-300 flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                      3. تخصيص الامتحان لكورسات معينة (حدد كورس أو أكثر):
                    </label>
                    {selectedCourseIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedCourseIds([])}
                        className="text-[10px] text-red-500 hover:underline cursor-pointer"
                      >
                        إلغاء تحديد الكورسات ({selectedCourseIds.length})
                      </button>
                    )}
                  </div>
                  {filteredCoursesForModal.length === 0 ? (
                    <p className="text-[11px] text-gray-400 italic">لا توجد كورسات متاحة للصف المحدد</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-white/70 dark:bg-neutral-900/70 rounded-xl border border-gray-200/60 dark:border-neutral-800">
                      {filteredCoursesForModal.map((c) => {
                        const isSelected = selectedCourseIds.includes(c.id);
                        return (
                          <button
                            type="button"
                            key={c.id}
                            onClick={() => toggleCourseSelection(c.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                            {c.title_ar}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 4. Lectures Multi-Select */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-gray-700 dark:text-neutral-300 flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-blue-600" />
                      4. تخصيص الامتحان لمحاضرات محددة (اختر المحاضرات التابعة للكورسات/الباقات المختارة):
                    </label>
                    {selectedLectureIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedLectureIds([])}
                        className="text-[10px] text-red-500 hover:underline cursor-pointer"
                      >
                        إلغاء تحديد المحاضرات ({selectedLectureIds.length})
                      </button>
                    )}
                  </div>
                  {filteredLecturesForModal.length === 0 ? (
                    <p className="text-[11px] text-gray-400 italic">لا توجد محاضرات مطابقة للتحديد الحالي</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-white/70 dark:bg-neutral-900/70 rounded-xl border border-gray-200/60 dark:border-neutral-800">
                      {filteredLecturesForModal.map((lec) => {
                        const isSelected = selectedLectureIds.includes(lec.id);
                        return (
                          <button
                            type="button"
                            key={lec.id}
                            onClick={() => toggleLectureSelection(lec.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300 hover:bg-blue-50 hover:text-blue-700'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                            {lec.title_ar} {lec.course_title_ar ? `(${lec.course_title_ar})` : ''}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-gray-600 dark:text-neutral-400 bg-white/80 dark:bg-neutral-900/80 p-2.5 rounded-lg border border-gray-200/60 dark:border-neutral-800 font-medium">
                  {selectedLectureIds.length > 0 ? (
                    <span className="text-blue-700 dark:text-blue-300 font-bold flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      مخصص لـ ({selectedLectureIds.length}) محاضرات محددة. سيظهر داخل تلك المحاضرات ويمكن اشتراطه للمحاضرة التالية.
                    </span>
                  ) : selectedCourseIds.length > 0 || selectedPackageIds.length > 0 ? (
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" />
                      مخصص لـ ({selectedCourseIds.length}) كورسات و ({selectedPackageIds.length}) باقات شهرية.
                    </span>
                  ) : selectedAcademicYearId ? (
                    <span className="text-purple-700 dark:text-purple-300 font-bold flex items-center gap-1">
                      <GraduationCap className="h-3.5 w-3.5" />
                      امتحان عام لجميع طلاب {academicYears.find(ay => ay.id === selectedAcademicYearId)?.name_ar || 'الصف المحدد'}.
                    </span>
                  ) : (
                    <span className="text-gray-700 dark:text-neutral-300 font-bold flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" />
                      امتحان عام لكافة المراحل والكورسات.
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-gray-200/60 dark:border-neutral-800">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold block">نسبة النجاح المطلوب تتخطاها (%)</label>
                  <select
                    value={passPercentage}
                    onChange={(e) => setPassPercentage(Number(e.target.value))}
                    className="w-full p-2 text-xs rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 font-bold text-emerald-600"
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
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-amber-600 font-bold">نعم (إجباري)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                      <input
                        type="radio"
                        name="required"
                        checked={isRequiredForNext === false}
                        onChange={() => setIsRequiredForNext(false)}
                        className="text-emerald-600 focus:ring-emerald-500"
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
              <div className="bg-emerald-50/50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/50 space-y-2">
                <label className="text-xs font-bold block text-emerald-900 dark:text-emerald-300">
                  إظهار الامتحان في قائمة (امتحاناتي) للطالب؟
                </label>
                <label className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  showInStudentMenu
                    ? 'bg-white dark:bg-neutral-900 border-emerald-500 shadow-2xs font-bold text-emerald-700 dark:text-emerald-300'
                    : 'bg-white/60 dark:bg-neutral-900/60 border-gray-200 dark:border-neutral-800'
                }`}>
                  <input
                    type="checkbox"
                    checked={showInStudentMenu}
                    onChange={(e) => setShowInStudentMenu(e.target.checked)}
                    className="mt-0.5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <div>
                    <span className="block font-bold">عرض الامتحان في قائمة امتحانات الطالب</span>
                    <span className="text-[10px] text-gray-500 dark:text-neutral-400 font-normal">
                      عند تفعيلها، يظهر الامتحان في القائمة العامة لصفحة (الامتحانات) للطالب. وعند إغلاقها يختفي من القائمة العامة ويقتصر ظهوره داخل المحاضرة أو الكورس/الباقة المحددة فقط.
                    </span>
                  </div>
                </label>
              </div>

              {/* Questions Section */}
              <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-emerald-600" />
                    الأسئلة الاختيارية ({questions.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold hover:bg-emerald-100 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    إضافة سؤال
                  </button>
                </div>

                <div className="space-y-4">
                  {questions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 space-y-3 bg-white dark:bg-neutral-900"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                          سؤال {qIdx + 1}
                        </span>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIdx)}
                            className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 cursor-pointer"
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
                          <div
                            key={opt.id}
                            className="flex items-center gap-2 bg-gray-50/50 dark:bg-neutral-800/40 p-2 rounded-lg border border-gray-200/50 dark:border-neutral-800"
                          >
                            <input
                              type="radio"
                              name={`correct_${qIdx}`}
                              checked={q.correct_option_id === opt.id}
                              onChange={() => handleQuestionChange(qIdx, 'correct_option_id', opt.id)}
                              className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
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
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
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
              <h2 className="text-lg font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Sparkles className="h-5 w-5" />
                توليد امتحان بالذكاء الاصطناعي ✨ (Create AI Exam)
              </h2>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold block">موضوع أو اسم الدرس *</label>
                <input
                  type="text"
                  required
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="مثال: Present Perfect Simple vs Past Simple"
                  className="w-full p-2.5 text-xs rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold block">عدد الأسئلة المطلوبة</label>
                <select
                  value={aiQuestionCount}
                  onChange={(e) => setAiQuestionCount(Number(e.target.value))}
                  className="w-full p-2 text-xs rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 font-semibold"
                >
                  <option value={5}>5 أسئلة</option>
                  <option value={10}>10 أسئلة (الافتراضي)</option>
                  <option value={15}>15 سؤالاً</option>
                  <option value={20}>20 سؤالاً</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold block">الصف الدراسي (المرحلة)</label>
                <select
                  value={aiAcademicYearId}
                  onChange={(e) => setAiAcademicYearId(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 font-semibold"
                >
                  <option value="">كل الصفوف (عام)</option>
                  {academicYears.map((ay) => (
                    <option key={ay.id} value={ay.id}>
                      {ay.name_ar}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-neutral-800 dark:text-neutral-300 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleGenerateAiExam}
                  disabled={isGeneratingAi}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:brightness-105 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-md"
                >
                  {isGeneratingAi ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>توليد الأسئلة فوراً ✨</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
