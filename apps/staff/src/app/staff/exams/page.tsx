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
  Calendar,
  Eye,
  FileCheck,
  User,
  Phone,
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
  allow_retake?: boolean;
  retake_policy?: string;
  max_retakes?: number;
  available_at?: string;
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
  const [activeTab, setActiveTab] = useState<'exams' | 'results'>('exams');
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

  // Retake & Availability states
  const [allowRetake, setAllowRetake] = useState<boolean>(true);
  const [retakePolicy, setRetakePolicy] = useState<string>('ALWAYS');
  const [maxRetakes, setMaxRetakes] = useState<number | ''>('');
  const [availabilityType, setAvailabilityType] = useState<'NOW' | 'SCHEDULED'>('NOW');
  const [availableAt, setAvailableAt] = useState<string>('');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // AI Generator state
  const [aiTopic, setAiTopic] = useState<string>('');
  const [aiQuestionCount, setAiQuestionCount] = useState<number>(10);
  const [aiAcademicYearId, setAiAcademicYearId] = useState<string>('');
  const [aiCourseId, setAiCourseId] = useState<string>('');
  const [aiLectureId, setAiLectureId] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);

  // Student Results Dashboard State
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [resultsLoading, setResultsLoading] = useState<boolean>(false);
  const [resultsSearch, setResultsSearch] = useState<string>('');
  const [resultsExamFilter, setResultsExamFilter] = useState<string>('');
  const [resultsPassedFilter, setResultsPassedFilter] = useState<string>('ALL');
  const [selectedSubmissionDetails, setSelectedSubmissionDetails] = useState<any | null>(null);

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

  const fetchSubmissions = async () => {
    setResultsLoading(true);
    try {
      const params = new URLSearchParams();
      if (resultsSearch) params.set('search', resultsSearch);
      if (resultsExamFilter) params.set('exam_id', resultsExamFilter);
      if (resultsPassedFilter !== 'ALL') params.set('passed', resultsPassedFilter === 'PASSED' ? 'true' : 'false');

      const res: any = await apiClient.get(`/exams/submissions?${params.toString()}`).catch(() => null);
      setSubmissions(res?.data || (Array.isArray(res) ? res : []));
    } catch (e) {
      console.error('Failed to fetch submissions:', e);
      setSubmissions([]);
    } finally {
      setResultsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'results') {
      fetchSubmissions();
    }
  }, [activeTab, resultsSearch, resultsExamFilter, resultsPassedFilter]);

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
      setTitleAr(exam.title_ar);
      setDescriptionAr(exam.description_ar || '');
      setSelectedAcademicYearId(exam.academic_year_id || '');

      const cIds = Array.isArray(exam.course_ids) && exam.course_ids.length > 0
        ? exam.course_ids
        : exam.course_id
          ? [exam.course_id]
          : [];
      const pIds = Array.isArray(exam.package_ids) && exam.package_ids.length > 0
        ? exam.package_ids
        : exam.package_id
          ? [exam.package_id]
          : [];
      const lIds = Array.isArray(exam.lecture_ids) && exam.lecture_ids.length > 0
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
      setAllowRetake(exam.allow_retake !== false);
      setRetakePolicy(exam.retake_policy || 'ALWAYS');
      setMaxRetakes(exam.max_retakes !== undefined && exam.max_retakes !== null ? exam.max_retakes : '');
      setAvailabilityType(exam.available_at ? 'SCHEDULED' : 'NOW');
      setAvailableAt(exam.available_at ? new Date(exam.available_at).toISOString().slice(0, 16) : '');
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
      setAllowRetake(true);
      setRetakePolicy('ALWAYS');
      setMaxRetakes('');
      setAvailabilityType('NOW');
      setAvailableAt('');
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
        allow_retake: allowRetake,
        retake_policy: retakePolicy,
        max_retakes: maxRetakes !== '' ? Number(maxRetakes) : null,
        available_at: availabilityType === 'SCHEDULED' && availableAt ? availableAt : null,
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
            <h1 className="text-2xl font-bold tracking-tight">إدارة الامتحانات والنتائج</h1>
            <p className="text-sm text-gray-500 dark:text-neutral-400">
              إنشاء امتحانات عامة، تخصيص وقت ومحاولات الإعادة، ومتابعة نتائج الطلاب ✨
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

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-neutral-800">
        <button
          onClick={() => setActiveTab('exams')}
          className={`px-5 py-3 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'exams'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>قائمة الامتحانات والواجبات</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('results');
            fetchSubmissions();
          }}
          className={`px-5 py-3 font-bold text-xs border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'results'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>نتائج وتقارير الطلاب ({submissions.length})</span>
        </button>
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

      {/* Tab 1: Exams List & Creator */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
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
                <span className="text-xs text-gray-500 dark:text-neutral-400 block">إعادة غير مسموحة</span>
                <span className="text-xl font-bold text-amber-600">
                  {exams.filter((e) => e.allow_retake === false || e.retake_policy === 'NEVER').length}
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-gray-200/80 dark:border-neutral-800 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-neutral-400 block">امتحانات متاحة للطالب</span>
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
                      <th className="py-3.5 px-4">مكان النشر</th>
                      <th className="py-3.5 px-4">سياسة الإعادة والإتاحة</th>
                      <th className="py-3.5 px-4">نسبة النجاح والمدة</th>
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
                          </td>

                          {/* Retake & Availability Info */}
                          <td className="py-3.5 px-4 space-y-1">
                            <div>
                              {exam.retake_policy === 'NEVER' || exam.allow_retake === false ? (
                                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold text-[10px]">
                                  محاولة واحدة (لا يعاد)
                                </span>
                              ) : exam.retake_policy === 'UNTIL_PASS' ? (
                                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[10px]">
                                  إعادة عند الرسوب فقط
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                                  إعادة مسموحة دائماً
                                </span>
                              )}
                            </div>

                            {exam.available_at && (
                              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                متاح: {new Date(exam.available_at).toLocaleString('ar-EG')}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 space-y-1">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs">
                              {exam.pass_percentage}%
                            </span>
                            <div className="text-[10px] text-gray-500">
                              {exam.question_count || exam.questions?.length || 0} أسئلة • {exam.duration_minutes} دقيقة
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenManualModal(exam)}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 hover:bg-blue-100 transition-all cursor-pointer"
                                title="تعديل الامتحان"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteExam(exam.id)}
                                className="p-1.5 rounded-lg bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 hover:bg-red-100 transition-all cursor-pointer"
                                title="حذف الامتحان"
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
        </div>
      )}

      {/* Tab 2: Student Exam Results & Reports */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {/* Filter and Search Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-gray-200/80 dark:border-neutral-800">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={resultsSearch}
                onChange={(e) => setResultsSearch(e.target.value)}
                placeholder="بحث باسم الطالب، الهاتف، أو الامتحان..."
                className="w-full pl-4 pr-9 py-2 text-xs rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700"
              />
            </div>

            {/* Exam Filter */}
            <div>
              <select
                value={resultsExamFilter}
                onChange={(e) => setResultsExamFilter(e.target.value)}
                className="w-full p-2 text-xs rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 font-bold"
              >
                <option value="">كل الامتحانات ({exams.length})</option>
                {exams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title_ar}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={resultsPassedFilter}
                onChange={(e) => setResultsPassedFilter(e.target.value)}
                className="w-full p-2 text-xs rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 font-bold text-emerald-600"
              >
                <option value="ALL">جميع نتائج الطلاب (الناجحون والراسبون)</option>
                <option value="PASSED">الناجحون فقط ✓</option>
                <option value="FAILED">الراسبون (بحاجة لإعادة) ✗</option>
              </select>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-gray-200/80 dark:border-neutral-800 overflow-hidden shadow-sm">
            {resultsLoading ? (
              <div className="p-12 text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-600" />
                <p className="text-sm text-gray-500">جاري تحميل نتائج الطلاب...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Award className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="font-bold text-base">لا توجد نتائج مطابقة للتصفية الحالية</h3>
                <p className="text-xs text-gray-500">جرب البحث باسم طالب آخر أو اختر امتحاناً آخر.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-gray-50 dark:bg-neutral-800/60 border-b border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-neutral-400 font-semibold uppercase">
                    <tr>
                      <th className="py-3.5 px-4">بيانات الطالب</th>
                      <th className="py-3.5 px-4">اسم الامتحان</th>
                      <th className="py-3.5 px-4">الدرجة المكتسبة</th>
                      <th className="py-3.5 px-4">النسبة المئوية والحالة</th>
                      <th className="py-3.5 px-4">تاريخ التسليم</th>
                      <th className="py-3.5 px-4 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-neutral-800 font-medium">
                    {submissions.map((sub, idx) => (
                      <tr key={sub.id || idx} className="hover:bg-gray-50/70 dark:hover:bg-neutral-800/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-gray-900 dark:text-neutral-100 flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-emerald-600" />
                            {sub.student_name || 'طالب منصة'}
                          </div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {sub.student_phone || sub.student_email || 'غير مسجل'}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-gray-800 dark:text-neutral-200">
                          {sub.exam_title || 'امتحان تقييمي'}
                          {sub.academic_year_name_ar && (
                            <span className="block text-[10px] text-gray-400 font-normal">
                              ({sub.academic_year_name_ar})
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-black text-sm text-gray-900 dark:text-white">
                          {sub.score} / {sub.total_points}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 rounded-full font-bold text-xs inline-flex items-center gap-1 ${
                            sub.is_passed
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {sub.is_passed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                            {sub.percentage}% ({sub.is_passed ? 'ناجح' : 'راسب / بحاجة لإعادة'})
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                          {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString('ar-EG') : 'تم التسليم'}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => setSelectedSubmissionDetails(sub)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs transition-all flex items-center gap-1 mx-auto cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>معاينة إجابات الطالب</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual Add/Edit Exam Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-4">
              <h2 className="text-lg font-extrabold flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-emerald-600" />
                {editingExamId ? 'تعديل الامتحان' : 'إضافة امتحان واختبار جديد'}
              </h2>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="space-y-5 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold block">عنوان الامتحان *</label>
                <input
                  type="text"
                  required
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder="مثال: امتحان الشهر الأول على الوحدة الأولى - اللغة الإنجليزية"
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold block">وصف الامتحان (اختياري)</label>
                <textarea
                  rows={2}
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  placeholder="ملاحظات أو توجيهات للطالب قبل البدء..."
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700"
                />
              </div>

              {/* Placement settings */}
              <div className="bg-gray-50/70 dark:bg-neutral-800/40 p-4 rounded-xl border border-gray-200/80 dark:border-neutral-800 space-y-4">
                <h3 className="font-extrabold text-sm text-gray-800 dark:text-neutral-200">
                  تحديد مكان نشر الامتحان والصفوف المخصصة لها:
                </h3>

                {/* 1. Academic Year Select */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 dark:text-neutral-300 block">
                    1. اختيار الصف الدراسي (المرحلة):
                  </label>
                  <select
                    value={selectedAcademicYearId}
                    onChange={(e) => {
                      setSelectedAcademicYearId(e.target.value);
                      setSelectedCourseIds([]);
                      setSelectedPackageIds([]);
                      setSelectedLectureIds([]);
                    }}
                    className="w-full p-2 text-xs rounded-lg bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 font-semibold"
                  >
                    <option value="">جميع الصفوف والمراحل (عام)</option>
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
              </div>

              {/* Retake Policy Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-purple-50/50 dark:bg-purple-950/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900/40">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold block text-purple-900 dark:text-purple-300">
                    سياسة إعادة الامتحان للطالب
                  </label>
                  <select
                    value={retakePolicy}
                    onChange={(e) => {
                      setRetakePolicy(e.target.value);
                      if (e.target.value === 'NEVER') {
                        setAllowRetake(false);
                      } else {
                        setAllowRetake(true);
                      }
                    }}
                    className="w-full p-2 text-xs rounded-lg bg-white dark:bg-neutral-900 border border-purple-200 dark:border-purple-800 font-bold"
                  >
                    <option value="ALWAYS">مسموح بالإعادة في أي وقت (بدون شروط)</option>
                    <option value="UNTIL_PASS">مسموح بالإعادة عند الرسوب فقط (حتى الوصول لنسبة النجاح)</option>
                    <option value="NEVER">غير مسموح بالإعادة (محاولة واحدة فقط لكل طالب)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold block text-purple-900 dark:text-purple-300">
                    الحد الأقصى لعدد مرات الإعادة
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    placeholder="اتركه فارغاً لإعادة غير محدودة"
                    value={maxRetakes}
                    onChange={(e) => setMaxRetakes(e.target.value ? Number(e.target.value) : '')}
                    disabled={retakePolicy === 'NEVER'}
                    className="w-full p-2 text-xs rounded-lg bg-white dark:bg-neutral-900 border border-purple-200 dark:border-purple-800 disabled:opacity-50 font-bold"
                  />
                </div>
              </div>

              {/* Exam Availability Time Settings */}
              <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/40 space-y-3">
                <label className="text-xs font-bold block text-blue-900 dark:text-blue-300">
                  توقيت إتاحة الامتحان للطالب
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                    <input
                      type="radio"
                      name="availability"
                      checked={availabilityType === 'NOW'}
                      onChange={() => {
                        setAvailabilityType('NOW');
                        setAvailableAt('');
                      }}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>متاح الآن فوراً</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                    <input
                      type="radio"
                      name="availability"
                      checked={availabilityType === 'SCHEDULED'}
                      onChange={() => setAvailabilityType('SCHEDULED')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>تحديد تاريخ ووقت مستقبلي</span>
                  </label>
                </div>

                {availabilityType === 'SCHEDULED' && (
                  <div className="pt-1">
                    <input
                      type="datetime-local"
                      value={availableAt}
                      onChange={(e) => setAvailableAt(e.target.value)}
                      className="w-full sm:w-auto p-2 text-xs rounded-lg bg-white dark:bg-neutral-900 border border-blue-200 dark:border-blue-800 font-bold"
                    />
                  </div>
                )}
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
                              className="text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="font-bold text-xs">{opt.id}.</span>
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
                        placeholder="شرح وتوضيح الإجابة الصحيحة للطلاب (اختياري)..."
                        className="w-full p-2 text-xs rounded-lg bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-neutral-400"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 font-bold hover:bg-gray-50 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-md cursor-pointer"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  <span>{editingExamId ? 'حفظ التعديلات' : 'إنشاء ونشر الامتحان'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Exam Creator Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3">
              <h2 className="text-base font-extrabold flex items-center gap-2 text-amber-600">
                <Sparkles className="h-5 w-5 animate-pulse" />
                توليد امتحان بالذكاء الاصطناعي (AI Generator)
              </h2>
              <button onClick={() => setIsAiModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold block">الدرس أو الموضوع المطلوب *</label>
                <input
                  type="text"
                  required
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="مثال: Present Perfect, Passive Voice, Grammar Unit 1..."
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold block">عدد الأسئلة المطلوب توليدها</label>
                <select
                  value={aiQuestionCount}
                  onChange={(e) => setAiQuestionCount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 font-bold text-amber-600"
                >
                  <option value={5}>5 أسئلة</option>
                  <option value={10}>10 أسئلة (الافتراضي)</option>
                  <option value={15}>15 سؤالاً</option>
                  <option value={20}>20 سؤالاً</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleGenerateAiExam}
                  disabled={isGeneratingAi}
                  className="px-5 py-2 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 flex items-center gap-2 shadow-md cursor-pointer"
                >
                  {isGeneratingAi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  <span>توليد الامتحان بالذكاء الاصطناعي</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Submission Breakdown Modal */}
      {selectedSubmissionDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                    إجابات الطالب: {selectedSubmissionDetails.student_name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    امتحان: {selectedSubmissionDetails.exam_title} ({selectedSubmissionDetails.percentage}%)
                  </p>
                </div>
              </div>

              <button onClick={() => setSelectedSubmissionDetails(null)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-gray-500 block">الدرجة المكتسبة</span>
                  <span className="text-lg font-black text-gray-900 dark:text-white">
                    {selectedSubmissionDetails.score} من {selectedSubmissionDetails.total_points}
                  </span>
                </div>

                <div>
                  <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                    selectedSubmissionDetails.is_passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {selectedSubmissionDetails.is_passed ? 'ناجح ✓' : 'راسب ✗'}
                  </span>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => setSelectedSubmissionDetails(null)}
                  className="px-6 py-2 rounded-xl bg-gray-100 dark:bg-neutral-800 font-bold hover:bg-gray-200"
                >
                  إغلاق التقرير
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
