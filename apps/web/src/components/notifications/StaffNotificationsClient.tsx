'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Send,
  Users,
  GraduationCap,
  UserCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  RefreshCw,
  X,
  Filter,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface AcademicYear {
  id: string;
  code: string;
  name_ar: string;
  name_en: string;
  stage_order?: number;
}

interface StudentSearchResult {
  id: string;
  full_name: string;
  phone: string;
  academic_year_name_ar?: string;
  academic_year_name_en?: string;
  academic_year_code?: string;
}

interface AdminNotification {
  id: string;
  title_ar: string;
  title_en?: string;
  body_ar: string;
  body_en?: string;
  target_type: 'ALL_STUDENTS' | 'ACADEMIC_YEAR' | 'COURSE' | 'PACKAGE' | 'STUDENT';
  target_id?: string;
  academic_year_id?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PROCESSING' | 'SENT' | 'FAILED' | 'CANCELLED';
  deep_link?: string;
  creator_name?: string;
  created_at: string;
  sent_at?: string;
}

const DEEP_LINK_OPTIONS = [
  { value: '', label: 'بدون رابط سريع' },
  { value: 'app://announcements', label: 'الرئيسية والإعلانات (app://announcements)' },
  { value: 'app://courses', label: 'الكورسات التعليمية (app://courses)' },
  { value: 'app://packages', label: 'الباقات الشهرية (app://packages)' },
  { value: 'app://books', label: 'متجر الكتب (app://books)' },
  { value: 'app://wallet', label: 'المحفظة الإلكترونية (app://wallet)' },
];

export default function StaffNotificationsClient() {
  const { student, isAuthenticated } = useAuth();

  // Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [deepLink, setDeepLink] = useState('');
  const [targetType, setTargetType] = useState<'ALL_STUDENTS' | 'ACADEMIC_YEAR' | 'STUDENT'>('ALL_STUDENTS');
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<StudentSearchResult | null>(null);

  // Student Autocomplete Search State
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentSearchResults, setStudentSearchResults] = useState<StudentSearchResult[]>([]);
  const [isSearchingStudents, setIsSearchingStudents] = useState(false);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  // Academic Years List
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loadingYears, setLoadingYears] = useState(false);

  // Notifications History State
  const [history, setHistory] = useState<AdminNotification[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<string>('ALL');

  // Confirmation & UI Feedback State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch Academic Years from Canonical Backend Source
  const fetchAcademicYears = useCallback(async () => {
    setLoadingYears(true);
    try {
      let res: any = await apiClient.get('/auth/academic-years').catch(() => null);
      if (!res || !Array.isArray(res)) {
        res = await apiClient.get('/academic-years').catch(() => null);
      }

      if (Array.isArray(res) && res.length > 0) {
        setAcademicYears(res);
        if (!selectedAcademicYearId) {
          setSelectedAcademicYearId(res[0].id);
        }
      } else {
        // Fallback canonical years matching DB defaults
        const canonical = [
          { id: 'a0000000-0000-0000-0000-000000000001', code: 'THIRD_PREPARATORY', name_ar: 'الصف الثالث الإعدادي', name_en: 'Third Preparatory' },
          { id: 'a0000000-0000-0000-0000-000000000002', code: 'FIRST_SECONDARY', name_ar: 'الصف الأول الثانوي', name_en: 'First Secondary' },
          { id: 'a0000000-0000-0000-0000-000000000003', code: 'SECOND_SECONDARY', name_ar: 'الصف الثاني بكالوريا', name_en: 'Second Secondary' },
          { id: 'a0000000-0000-0000-0000-000000000004', code: 'THIRD_SECONDARY', name_ar: 'الصف الثالث الثانوي', name_en: 'Third Secondary' },
        ];
        setAcademicYears(canonical);
        setSelectedAcademicYearId(canonical[0].id);
      }
    } catch {
      // ignore
    } finally {
      setLoadingYears(false);
    }
  }, [selectedAcademicYearId]);

  // Fetch Sent Notifications History
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const queryParams = historyFilter !== 'ALL' ? `?target_type=${historyFilter}` : '';
      const res: any = await apiClient.get(`/admin/notifications${queryParams}`).catch(() => null);
      if (res && Array.isArray(res.data)) {
        setHistory(res.data);
      } else if (Array.isArray(res)) {
        setHistory(res);
      } else {
        setHistory([]);
      }
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, [historyFilter]);

  useEffect(() => {
    fetchAcademicYears();
    fetchHistory();
  }, [fetchAcademicYears, fetchHistory]);

  // Student Autocomplete Search with Debounce
  useEffect(() => {
    if (targetType !== 'STUDENT') return;
    if (!studentSearchQuery.trim()) {
      setStudentSearchResults([]);
      setShowStudentDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingStudents(true);
      try {
        const res: any = await apiClient
          .get(`/students?search=${encodeURIComponent(studentSearchQuery.trim())}&limit=8`)
          .catch(() => null);

        const items = Array.isArray(res?.items) ? res.items : Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const mapped: StudentSearchResult[] = items.map((st: any) => ({
          id: st.id,
          full_name: st.full_name || st.fullName || 'طالب',
          phone: st.phone || '',
          academic_year_name_ar: st.academic_year_name_ar || st.academicYearNameAr || 'الصف الدراسي',
          academic_year_code: st.academic_year_code || st.academicYearCode,
        }));

        setStudentSearchResults(mapped);
        setShowStudentDropdown(true);
      } catch {
        setStudentSearchResults([]);
      } finally {
        setIsSearchingStudents(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [studentSearchQuery, targetType]);

  // Handle Form Submit Trigger
  const handleInitiateSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('من فضلك أدخل عنوان الإشعار');
      return;
    }

    if (!body.trim()) {
      setErrorMessage('من فضلك أدخل نص الإشعار');
      return;
    }

    if (targetType === 'ACADEMIC_YEAR' && !selectedAcademicYearId) {
      setErrorMessage('من فضلك اختر الصف الدراسي');
      return;
    }

    if (targetType === 'STUDENT' && !selectedStudent) {
      setErrorMessage('من فضلك اختر الطالب المستهدف');
      return;
    }

    // Bulk targets require explicit modal confirmation
    if (targetType === 'ALL_STUDENTS' || targetType === 'ACADEMIC_YEAR') {
      setIsConfirmModalOpen(true);
    } else {
      executeSendNotification();
    }
  };

  // Execute Actual Send API Call
  const executeSendNotification = async () => {
    setIsConfirmModalOpen(false);
    setIsSending(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const payload: any = {
      title_ar: title.trim(),
      title_en: title.trim(),
      body_ar: body.trim(),
      body_en: body.trim(),
      target_type: targetType,
      type: 'ANNOUNCEMENT',
    };

    if (deepLink) {
      payload.deep_link = deepLink;
    }

    if (targetType === 'ACADEMIC_YEAR') {
      payload.academic_year_id = selectedAcademicYearId;
      payload.target_id = selectedAcademicYearId;
    } else if (targetType === 'STUDENT' && selectedStudent) {
      payload.student_id = selectedStudent.id;
      payload.target_id = selectedStudent.id;
    }

    try {
      const res: any = await apiClient.post('/admin/notifications', payload);
      setSuccessMessage('تم إرسال الإشعار بنجاح إلى المستهدفين.');

      // Reset form
      setTitle('');
      setBody('');
      setDeepLink('');
      setSelectedStudent(null);
      setStudentSearchQuery('');

      // Refresh history list
      fetchHistory();
    } catch (err: any) {
      const msg = err?.message || err?.details?.message || 'حدث خطأ أثناء إرسال الإشعار.';
      setErrorMessage(msg);
    } finally {
      setIsSending(false);
    }
  };

  // Helper label for target name
  const getSelectedYearName = () => {
    const y = academicYears.find((item) => item.id === selectedAcademicYearId);
    return y ? y.name_ar : 'الصف الدراسي المحدد';
  };

  const getTargetBadge = (item: AdminNotification) => {
    switch (item.target_type) {
      case 'ALL_STUDENTS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold text-xs">
            <Users className="w-3.5 h-3.5" /> جميع الطلاب
          </span>
        );
      case 'ACADEMIC_YEAR':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-600/40 text-emerald-400 font-bold text-xs">
            <GraduationCap className="w-3.5 h-3.5" /> صف دراسي
          </span>
        );
      case 'STUDENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-900 border border-stone-700 text-stone-300 font-bold text-xs">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> طالب معين
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-900 border border-stone-800 text-stone-400 font-bold text-xs">
            {item.target_type}
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> مُرسل
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold text-xs border border-amber-500/30">
            <Clock className="w-3 h-3 animate-spin" /> قيد الإرسال
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-bold text-xs border border-blue-500/30">
            <Clock className="w-3 h-3" /> مجدول
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-800 text-stone-400 font-bold text-xs">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 font-cairo text-stone-100 max-w-6xl mx-auto pb-12">
      {/* Page Header Banner */}
      <div className="bg-[#09090b] dark:bg-[#09090b] border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 end-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-bold">
              <Bell className="w-3.5 h-3.5" /> لوحة التحكم والعمليات — منصة مستر عمر مكاوي
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              إدارة الإشعارات والتنبيهات
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl leading-relaxed">
              قم بإنشاء وإرسال الإشعارات المباشرة لجميع الطلاب أو لصف دراسي معين أو لطالب محدد بكل سهولة.
            </p>
          </div>

          <button
            onClick={() => {
              fetchAcademicYears();
              fetchHistory();
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-xs font-bold text-stone-300 transition-colors shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
            تحديث البيانات
          </button>
        </div>
      </div>

      {/* Main Content Grid: Send Form & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left/Main Column: Create New Notification Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#09090b] border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-stone-800/80 pb-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-500" />
                إنشاء إشعار جديد
              </h2>
              <span className="text-xs text-stone-400 font-medium">إرسال موجه</span>
            </div>

            {/* Success Alert Banner */}
            {successMessage && (
              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-600/60 text-emerald-200 text-xs font-bold flex items-center gap-3 animate-fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Error Alert Banner */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-950/80 border border-red-800 text-red-200 text-xs font-bold flex items-center gap-3 animate-fade-in">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleInitiateSend} className="space-y-5">
              {/* Notification Title */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-300">
                  عنوان الإشعار <span className="text-emerald-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: التذكير بموعد المحاضرة القادمة..."
                  maxLength={255}
                  required
                  className="w-full h-12 px-4 bg-stone-900 border border-stone-800 rounded-2xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
              </div>

              {/* Notification Body */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-300">
                  نص الإشعار <span className="text-emerald-500">*</span>
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="اكتب تفاصيل الإشعار بوضوح للطلاب..."
                  rows={4}
                  required
                  className="w-full p-4 bg-stone-900 border border-stone-800 rounded-2xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
                />
              </div>

              {/* Optional Internal Deep Link */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-300">
                  رابط سريع داخل التطبيق (اختياري)
                </label>
                <select
                  value={deepLink}
                  onChange={(e) => setDeepLink(e.target.value)}
                  className="w-full h-12 px-4 bg-stone-900 border border-stone-800 rounded-2xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                >
                  {DEEP_LINK_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-stone-900 text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Audience Selector */}
              <div className="space-y-3 pt-2 border-t border-stone-800/80">
                <label className="block text-xs font-bold text-stone-300">
                  إرسال إلى <span className="text-emerald-500">*</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* All Students Option */}
                  <label
                    onClick={() => setTargetType('ALL_STUDENTS')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                      targetType === 'ALL_STUDENTS'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md shadow-emerald-950/50'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetType"
                      checked={targetType === 'ALL_STUDENTS'}
                      onChange={() => setTargetType('ALL_STUDENTS')}
                      className="accent-emerald-500 w-4 h-4"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-400" /> جميع الطلاب
                      </span>
                      <span className="text-[10px] text-stone-400">إرسال عام لكافة حسابات الطلاب</span>
                    </div>
                  </label>

                  {/* Academic Year Option */}
                  <label
                    onClick={() => setTargetType('ACADEMIC_YEAR')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                      targetType === 'ACADEMIC_YEAR'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md shadow-emerald-950/50'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetType"
                      checked={targetType === 'ACADEMIC_YEAR'}
                      onChange={() => setTargetType('ACADEMIC_YEAR')}
                      className="accent-emerald-500 w-4 h-4"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-400" /> صف دراسي معين
                      </span>
                      <span className="text-[10px] text-stone-400">طلاب مرحلة دراسية واحدة</span>
                    </div>
                  </label>

                  {/* Specific Student Option */}
                  <label
                    onClick={() => setTargetType('STUDENT')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                      targetType === 'STUDENT'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md shadow-emerald-950/50'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="targetType"
                      checked={targetType === 'STUDENT'}
                      onChange={() => setTargetType('STUDENT')}
                      className="accent-emerald-500 w-4 h-4"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> طالب معين
                      </span>
                      <span className="text-[10px] text-stone-400">إحاطة طالب فردي شخصياً</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Dynamic Target Selector: Academic Year */}
              {targetType === 'ACADEMIC_YEAR' && (
                <div className="space-y-2 pt-2 animate-fade-in">
                  <label className="block text-xs font-bold text-stone-300">
                    اختر الصف الدراسي <span className="text-emerald-500">*</span>
                  </label>
                  <select
                    value={selectedAcademicYearId}
                    onChange={(e) => setSelectedAcademicYearId(e.target.value)}
                    className="w-full h-12 px-4 bg-stone-900 border border-stone-800 rounded-2xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    {academicYears.map((ay) => (
                      <option key={ay.id} value={ay.id} className="bg-stone-900 text-white">
                        {ay.name_ar}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Dynamic Target Selector: Specific Student Search Autocomplete */}
              {targetType === 'STUDENT' && (
                <div className="space-y-2 pt-2 animate-fade-in relative">
                  <label className="block text-xs font-bold text-stone-300">
                    ابحث عن الطالب (بالاسم أو رقم الهاتف) <span className="text-emerald-500">*</span>
                  </label>

                  {selectedStudent ? (
                    <div className="p-4 rounded-2xl bg-stone-900 border border-emerald-500/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-400 font-bold text-sm flex items-center justify-center">
                          {selectedStudent.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-white">{selectedStudent.full_name}</p>
                          <p className="text-xs text-stone-400">
                            {selectedStudent.academic_year_name_ar || 'الصف الدراسي'} • {selectedStudent.phone}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudent(null);
                          setStudentSearchQuery('');
                        }}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
                        title="إلغاء التحديد"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                        placeholder="ابحث باسم الطالب أو رقم الهاتف..."
                        className="w-full h-12 ps-11 pe-4 bg-stone-900 border border-stone-800 rounded-2xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                      <Search className="w-4 h-4 text-stone-500 absolute start-4 top-1/2 -translate-y-1/2" />

                      {/* Dropdown Results */}
                      {showStudentDropdown && (
                        <div className="absolute top-full start-0 end-0 mt-2 bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden z-30 max-h-60 overflow-y-auto">
                          {isSearchingStudents ? (
                            <div className="p-4 text-xs text-stone-400 text-center flex items-center justify-center gap-2">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" /> جاري البحث...
                            </div>
                          ) : studentSearchResults.length > 0 ? (
                            studentSearchResults.map((st) => (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => {
                                  setSelectedStudent(st);
                                  setShowStudentDropdown(false);
                                }}
                                className="w-full p-3 text-start hover:bg-stone-800 border-b border-stone-800/50 last:border-0 flex items-center justify-between transition-colors"
                              >
                                <div>
                                  <p className="text-xs font-extrabold text-white">{st.full_name}</p>
                                  <p className="text-[11px] text-stone-400">{st.phone}</p>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-emerald-400 font-semibold">
                                  {st.academic_year_name_ar}
                                </span>
                              </button>
                            ))
                          ) : (
                            <div className="p-4 text-xs text-stone-400 text-center">لم يتم العثور على نتائج للبحث</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full h-13 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl transition-all shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> جاري إرسال الإشعار...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> إرسال الإشعار الآن
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Notifications Sent History */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#09090b] border border-stone-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-stone-800/80 pb-4">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                سجل الإشعارات المرسلة
              </h2>

              {/* Minimal Target Filter */}
              <div className="relative">
                <select
                  value={historyFilter}
                  onChange={(e) => setHistoryFilter(e.target.value)}
                  className="bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-1 text-xs text-stone-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="ALL">الكل</option>
                  <option value="ALL_STUDENTS">جميع الطلاب</option>
                  <option value="ACADEMIC_YEAR">صف دراسي</option>
                  <option value="STUDENT">طالب معين</option>
                </select>
              </div>
            </div>

            {loadingHistory ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-stone-900 rounded-2xl animate-pulse border border-stone-800/60" />
                ))}
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-3.5 max-h-[580px] overflow-y-auto pe-1 scrollbar-thin">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-stone-900/90 border border-stone-800/80 space-y-2 hover:border-stone-700 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      {getTargetBadge(item)}
                      {getStatusBadge(item.status)}
                    </div>

                    <div>
                      <h3 className="text-xs font-extrabold text-white">{item.title_ar || item.title_en}</h3>
                      <p className="text-[11px] text-stone-400 line-clamp-2 mt-0.5 leading-relaxed">
                        {item.body_ar || item.body_en}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-800/50 flex items-center justify-between text-[10px] text-stone-500">
                      <span>{new Date(item.created_at).toLocaleString('ar-EG')}</span>
                      <span>الناشر: {item.creator_name || 'السيرفر/النظام'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-stone-500 space-y-2 border border-dashed border-stone-800 rounded-2xl">
                <Bell className="w-8 h-8 text-stone-600 mx-auto" />
                <p className="text-xs font-bold">لا يوجد سجل إشعارات حالياً</p>
                <p className="text-[11px]">الإشعارات المرسلة ستظهر هنا مباشرة مع حالتها.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Bulk Sends */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#09090b] border border-stone-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-white">تأكيد إرسال الإشعار</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                {targetType === 'ALL_STUDENTS'
                  ? 'سيتم إرسال هذا الإشعار بشكل عام إلى جميع الطلاب المسجلين بالمنصة. هل تريد المتابعة؟'
                  : `سيتم إرسال هذا الإشعار إلى جميع طلاب (${getSelectedYearName()}). هل تريد المتابعة؟`}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-stone-900 border border-stone-800 text-xs text-stone-400 space-y-1">
              <p className="font-bold text-white">العنوان: {title}</p>
              <p className="line-clamp-2">الرسالة: {body}</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={executeSendNotification}
                className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-md"
              >
                تأكيد الإرسال
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 h-11 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 font-bold text-xs rounded-xl transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
