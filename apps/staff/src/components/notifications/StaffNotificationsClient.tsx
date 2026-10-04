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
  RefreshCw,
  X,
} from 'lucide-react';
import { staffApiClient } from '@/context/StaffAuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface AcademicYear {
  id: string;
  code: string;
  name_ar: string;
  name_en: string;
}

interface StudentSearchResult {
  id: string;
  full_name: string;
  phone: string;
  academic_year_name_ar?: string;
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
}

const DEEP_LINK_OPTIONS = [
  { value: '', label_ar: 'بدون رابط سريع', label_en: 'No Deep Link' },
  { value: 'app://announcements', label_ar: 'الرئيسية والإعلانات (app://announcements)', label_en: 'Home Announcements (app://announcements)' },
  { value: 'app://courses', label_ar: 'الكورسات التعليمية (app://courses)', label_en: 'Courses (app://courses)' },
  { value: 'app://packages', label_ar: 'الباقات الشهرية (app://packages)', label_en: 'Packages (app://packages)' },
  { value: 'app://books', label_ar: 'متجر الكتب (app://books)', label_en: 'Bookstore (app://books)' },
  { value: 'app://wallet', label_ar: 'المحفظة الإلكترونية (app://wallet)', label_en: 'Wallet (app://wallet)' },
];

export default function StaffNotificationsClient() {
  const { language } = useLanguage();
  const isAr = language === 'ar';

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
    try {
      let res: any = await staffApiClient.get('/auth/academic-years').catch(() => null);
      if (!res || !Array.isArray(res)) {
        res = await staffApiClient.get('/academic-years').catch(() => null);
      }

      if (Array.isArray(res) && res.length > 0) {
        setAcademicYears(res);
        if (!selectedAcademicYearId) {
          setSelectedAcademicYearId(res[0].id);
        }
      } else {
        const canonical = [
          { id: 'a0000000-0000-0000-0000-000000000001', code: 'THIRD_PREPARATORY', name_ar: 'الصف الثالث الإعدادي', name_en: 'Third Preparatory' },
          { id: 'a0000000-0000-0000-0000-000000000002', code: 'FIRST_SECONDARY', name_ar: 'الصف الأول الثانوي', name_en: 'First Secondary' },
          { id: 'a0000000-0000-0000-0000-000000000003', code: 'SECOND_SECONDARY', name_ar: 'الصف الثاني الثانوي', name_en: 'Second Secondary' },
          { id: 'a0000000-0000-0000-0000-000000000004', code: 'THIRD_SECONDARY', name_ar: 'الصف الثالث الثانوي', name_en: 'Third Secondary' },
        ];
        setAcademicYears(canonical);
        setSelectedAcademicYearId(canonical[0].id);
      }
    } catch {
      // ignore
    }
  }, [selectedAcademicYearId]);

  // Fetch Sent Notifications History
  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const queryParams = historyFilter !== 'ALL' ? `?target_type=${historyFilter}` : '';
      const res: any = await staffApiClient.get(`/admin/notifications${queryParams}`).catch(() => null);
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
        const res: any = await staffApiClient
          .get(`/students?search=${encodeURIComponent(studentSearchQuery.trim())}&limit=8`)
          .catch(() => null);

        const items = Array.isArray(res?.items) ? res.items : Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const mapped: StudentSearchResult[] = items.map((st: any) => ({
          id: st.id,
          full_name: st.full_name || st.fullName || 'طالب',
          phone: st.phone || '',
          academic_year_name_ar: st.academic_year_name_ar || st.academicYearNameAr || 'الصف الدراسي',
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

  const handleInitiateSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage(isAr ? 'من فضلك أدخل عنوان الإشعار' : 'Please enter notification title');
      return;
    }

    if (!body.trim()) {
      setErrorMessage(isAr ? 'من فضلك أدخل نص الإشعار' : 'Please enter notification message');
      return;
    }

    if (targetType === 'ACADEMIC_YEAR' && !selectedAcademicYearId) {
      setErrorMessage(isAr ? 'من فضلك اختر الصف الدراسي' : 'Please select academic year');
      return;
    }

    if (targetType === 'STUDENT' && !selectedStudent) {
      setErrorMessage(isAr ? 'من فضلك اختر الطالب المستهدف' : 'Please select target student');
      return;
    }

    if (targetType === 'ALL_STUDENTS' || targetType === 'ACADEMIC_YEAR') {
      setIsConfirmModalOpen(true);
    } else {
      executeSendNotification();
    }
  };

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
      await staffApiClient.post('/admin/notifications', payload);
      setSuccessMessage(isAr ? 'تم إرسال الإشعار بنجاح.' : 'Notification sent successfully.');

      setTitle('');
      setBody('');
      setDeepLink('');
      setSelectedStudent(null);
      setStudentSearchQuery('');

      fetchHistory();
    } catch (err: any) {
      const msg = err?.message || err?.details?.message || (isAr ? 'حدث خطأ أثناء إرسال الإشعار.' : 'Failed to send notification.');
      setErrorMessage(msg);
    } finally {
      setIsSending(false);
    }
  };

  const getSelectedYearName = () => {
    const y = academicYears.find((item) => item.id === selectedAcademicYearId);
    return y ? (isAr ? y.name_ar : y.name_en) : (isAr ? 'الصف الدراسي المحدد' : 'Selected Academic Year');
  };

  const getTargetBadge = (item: AdminNotification) => {
    switch (item.target_type) {
      case 'ALL_STUDENTS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold text-xs">
            <Users className="w-3.5 h-3.5" /> {isAr ? 'جميع الطلاب' : 'All Students'}
          </span>
        );
      case 'ACADEMIC_YEAR':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-600/40 text-emerald-400 font-bold text-xs">
            <GraduationCap className="w-3.5 h-3.5" /> {isAr ? 'صف دراسي' : 'Academic Year'}
          </span>
        );
      case 'STUDENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300 font-bold text-xs">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> {isAr ? 'طالب معين' : 'Single Student'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 font-bold text-xs">
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
            <CheckCircle2 className="w-3 h-3" /> {isAr ? 'مُرسل' : 'Sent'}
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold text-xs border border-amber-500/30">
            <Clock className="w-3 h-3 animate-spin" /> {isAr ? 'قيد الإرسال' : 'Processing'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-400 font-bold text-xs">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 font-cairo text-neutral-100 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-[#09090b] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 end-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs font-bold">
              <Bell className="w-3.5 h-3.5" /> {isAr ? 'لوحة التحكم والعمليات' : 'Admin Operations Panel'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {isAr ? 'الإشعارات' : 'Notifications'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
              {isAr ? 'إرسال الإشعارات المباشرة لجميع الطلاب أو لصف دراسي معين أو لطالب محدد.' : 'Send direct notifications to all students, a specific academic year, or an individual student.'}
            </p>
          </div>

          <button
            onClick={() => {
              fetchAcademicYears();
              fetchHistory();
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-300 transition-colors shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
            {isAr ? 'تحديث البيانات' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#09090b] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-500" />
                {isAr ? 'إنشاء إشعار جديد' : 'Create New Notification'}
              </h2>
            </div>

            {successMessage && (
              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-600/60 text-emerald-200 text-xs font-bold flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-950/80 border border-red-800 text-red-200 text-xs font-bold flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleInitiateSend} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-300">
                  {isAr ? 'عنوان الإشعار' : 'Notification Title'} <span className="text-emerald-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isAr ? 'عنوان الإشعار...' : 'Notification title...'}
                  maxLength={255}
                  required
                  className="w-full h-12 px-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-300">
                  {isAr ? 'نص الإشعار' : 'Notification Message'} <span className="text-emerald-500">*</span>
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={isAr ? 'محتوى الإشعار...' : 'Notification content...'}
                  rows={4}
                  required
                  className="w-full p-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-300">
                  {isAr ? 'رابط سريع داخل التطبيق (اختياري)' : 'Deep Link (Optional)'}
                </label>
                <select
                  value={deepLink}
                  onChange={(e) => setDeepLink(e.target.value)}
                  className="w-full h-12 px-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-sm text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {DEEP_LINK_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-neutral-900 text-white">
                      {isAr ? opt.label_ar : opt.label_en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3 pt-2 border-t border-neutral-800/80">
                <label className="block text-xs font-bold text-neutral-300">
                  {isAr ? 'إرسال إلى' : 'Target Audience'} <span className="text-emerald-500">*</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label
                    onClick={() => setTargetType('ALL_STUDENTS')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                      targetType === 'ALL_STUDENTS'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
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
                        <Users className="w-3.5 h-3.5 text-emerald-400" /> {isAr ? 'جميع الطلاب' : 'All Students'}
                      </span>
                    </div>
                  </label>

                  <label
                    onClick={() => setTargetType('ACADEMIC_YEAR')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                      targetType === 'ACADEMIC_YEAR'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
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
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-400" /> {isAr ? 'صف دراسي معين' : 'Academic Year'}
                      </span>
                    </div>
                  </label>

                  <label
                    onClick={() => setTargetType('STUDENT')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                      targetType === 'STUDENT'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700'
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
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> {isAr ? 'طالب معين' : 'Specific Student'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {targetType === 'ACADEMIC_YEAR' && (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-neutral-300">
                    {isAr ? 'اختر الصف الدراسي' : 'Select Academic Year'} <span className="text-emerald-500">*</span>
                  </label>
                  <select
                    value={selectedAcademicYearId}
                    onChange={(e) => setSelectedAcademicYearId(e.target.value)}
                    className="w-full h-12 px-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    {academicYears.map((ay) => (
                      <option key={ay.id} value={ay.id} className="bg-neutral-900 text-white">
                        {isAr ? ay.name_ar : ay.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targetType === 'STUDENT' && (
                <div className="space-y-2 pt-2 relative">
                  <label className="block text-xs font-bold text-neutral-300">
                    {isAr ? 'ابحث عن الطالب' : 'Search Student'} <span className="text-emerald-500">*</span>
                  </label>

                  {selectedStudent ? (
                    <div className="p-4 rounded-2xl bg-neutral-900 border border-emerald-500/50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700 text-emerald-400 font-bold text-sm flex items-center justify-center">
                          {selectedStudent.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-white">{selectedStudent.full_name}</p>
                          <p className="text-xs text-neutral-400">
                            {selectedStudent.academic_year_name_ar} • {selectedStudent.phone}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudent(null);
                          setStudentSearchQuery('');
                        }}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
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
                        placeholder={isAr ? 'ابحث باسم الطالب أو رقم الهاتف...' : 'Search by student name or phone...'}
                        className="w-full h-12 ps-11 pe-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                      <Search className="w-4 h-4 text-neutral-500 absolute start-4 top-1/2 -translate-y-1/2" />

                      {showStudentDropdown && (
                        <div className="absolute top-full start-0 end-0 mt-2 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-30 max-h-60 overflow-y-auto">
                          {isSearchingStudents ? (
                            <div className="p-4 text-xs text-neutral-400 text-center flex items-center justify-center gap-2">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" /> {isAr ? 'جاري البحث...' : 'Searching...'}
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
                                className="w-full p-3 text-start hover:bg-neutral-800 border-b border-neutral-800/50 last:border-0 flex items-center justify-between transition-colors"
                              >
                                <div>
                                  <p className="text-xs font-extrabold text-white">{st.full_name}</p>
                                  <p className="text-[11px] text-neutral-400">{st.phone}</p>
                                </div>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-emerald-400 font-semibold">
                                  {st.academic_year_name_ar}
                                </span>
                              </button>
                            ))
                          ) : (
                            <div className="p-4 text-xs text-neutral-400 text-center">{isAr ? 'لم يتم العثور على نتائج' : 'No results found'}</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full h-13 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl transition-all shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> {isAr ? 'جاري الإرسال...' : 'Sending...'}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> {isAr ? 'إرسال الإشعار' : 'Send Notification'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* History Table */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#09090b] border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                {isAr ? 'سجل الإشعارات' : 'Notification History'}
              </h2>

              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1 text-xs text-neutral-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="ALL">{isAr ? 'الكل' : 'All'}</option>
                <option value="ALL_STUDENTS">{isAr ? 'جميع الطلاب' : 'All Students'}</option>
                <option value="ACADEMIC_YEAR">{isAr ? 'صف دراسي' : 'Academic Year'}</option>
                <option value="STUDENT">{isAr ? 'طالب معين' : 'Single Student'}</option>
              </select>
            </div>

            {loadingHistory ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 bg-neutral-900 rounded-2xl animate-pulse border border-neutral-800/60" />
                ))}
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-3.5 max-h-[580px] overflow-y-auto pe-1 scrollbar-thin">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-neutral-900/90 border border-neutral-800/80 space-y-2 hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      {getTargetBadge(item)}
                      {getStatusBadge(item.status)}
                    </div>

                    <div>
                      <h3 className="text-xs font-extrabold text-white">{item.title_ar || item.title_en}</h3>
                      <p className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5 leading-relaxed">
                        {item.body_ar || item.body_en}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-neutral-800/50 flex items-center justify-between text-[10px] text-neutral-500">
                      <span>{new Date(item.created_at).toLocaleString(isAr ? 'ar-EG' : 'en-US')}</span>
                      <span>{item.creator_name || (isAr ? 'السيرفر/النظام' : 'System')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-neutral-500 space-y-2 border border-dashed border-neutral-800 rounded-2xl">
                <Bell className="w-8 h-8 text-neutral-600 mx-auto" />
                <p className="text-xs font-bold">{isAr ? 'لا يوجد سجل إشعارات حالياً' : 'No notifications history'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#09090b] border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-white">{isAr ? 'تأكيد إرسال الإشعار' : 'Confirm Notification'}</h3>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {targetType === 'ALL_STUDENTS'
                  ? (isAr ? 'سيتم إرسال هذا الإشعار إلى جميع الطلاب في المنصة. هل تريد المتابعة؟' : 'This notification will be sent to all students. Proceed?')
                  : (isAr ? `سيتم إرسال هذا الإشعار إلى جميع طلاب (${getSelectedYearName()}). هل تريد المتابعة؟` : `This notification will be sent to all students in ${getSelectedYearName()}. Proceed?`)}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 space-y-1">
              <p className="font-bold text-white">{title}</p>
              <p className="line-clamp-2">{body}</p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={executeSendNotification}
                className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-md"
              >
                {isAr ? 'تأكيد الإرسال' : 'Confirm Send'}
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 h-11 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-bold text-xs rounded-xl transition-colors"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
