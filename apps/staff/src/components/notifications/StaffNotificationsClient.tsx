'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
  Wallet,
  BookOpen,
  Headset,
  Info,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpRight,
  Sparkles,
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

export interface ActivityFeedItem {
  id: string;
  raw_id: string;
  category: 'WALLET_TOPUP' | 'BOOK_ORDER' | 'SUPPORT_TICKET' | 'SYSTEM';
  title_ar: string;
  title_en: string;
  body_ar: string;
  body_en: string;
  status: string;
  created_at: string;
  deep_link: string;
  metadata?: any;
  is_actionable?: boolean;
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

  // Active Top-level Tab
  const [activeTab, setActiveTab] = useState<'alerts' | 'send' | 'history'>('alerts');

  // ==========================================
  // Operational Alerts Tab State
  // ==========================================
  const [activityItems, setActivityItems] = useState<ActivityFeedItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityCategory, setActivityCategory] = useState<string>('ALL');
  const [activitySearch, setActivitySearch] = useState<string>('');
  const [counts, setCounts] = useState<{
    total: number;
    pending_topups: number;
    pending_orders: number;
    open_tickets: number;
  }>({
    total: 0,
    pending_topups: 0,
    pending_orders: 0,
    open_tickets: 0,
  });

  // ==========================================
  // Broadcast Form State
  // ==========================================
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

  // History State
  const [history, setHistory] = useState<AdminNotification[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<string>('ALL');

  // Confirmation & UI Feedback State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch Activity Feed & Counters
  const fetchActivityFeed = useCallback(async () => {
    setActivityLoading(true);
    try {
      const categoryParam = activityCategory !== 'ALL' ? `?category=${activityCategory}` : '';
      const [feedRes, countRes]: [any, any] = await Promise.all([
        staffApiClient.get(`/admin/notifications/activity-feed${categoryParam}`).catch(() => null),
        staffApiClient.get('/admin/notifications/unread-count').catch(() => null),
      ]);

      if (feedRes && Array.isArray(feedRes.data)) {
        setActivityItems(feedRes.data);
      } else if (Array.isArray(feedRes)) {
        setActivityItems(feedRes);
      } else {
        setActivityItems([]);
      }

      if (countRes && typeof countRes.total === 'number') {
        setCounts(countRes);
      }
    } catch {
      setActivityItems([]);
    } finally {
      setActivityLoading(false);
    }
  }, [activityCategory]);

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
    fetchActivityFeed();
    fetchHistory();
  }, [fetchAcademicYears, fetchActivityFeed, fetchHistory]);

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
        const res: any = await staffApiClient.get(`/students?search=${encodeURIComponent(studentSearchQuery.trim())}&limit=5`).catch(() => null);
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setStudentSearchResults(list);
        setShowStudentDropdown(list.length > 0);
      } catch {
        setStudentSearchResults([]);
        setShowStudentDropdown(false);
      } finally {
        setIsSearchingStudents(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [studentSearchQuery, targetType]);

  // Handle Send Notification Submit
  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage(isAr ? 'يرجى إدخال عنوان الإشعار' : 'Notification title is required');
      return;
    }
    if (!body.trim()) {
      setErrorMessage(isAr ? 'يرجى إدخال نص رسالة الإشعار' : 'Notification body message is required');
      return;
    }
    if (targetType === 'ACADEMIC_YEAR' && !selectedAcademicYearId) {
      setErrorMessage(isAr ? 'يرجى اختيار المرحلة الدراسية المستهدفة' : 'Please select a target academic year');
      return;
    }
    if (targetType === 'STUDENT' && !selectedStudent) {
      setErrorMessage(isAr ? 'يرجى اختيار الطالب المستهدف من القائمة' : 'Please select a target student');
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleExecuteSend = async () => {
    setIsSending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload: any = {
        title_ar: title.trim(),
        title_en: title.trim(),
        body_ar: body.trim(),
        body_en: body.trim(),
        target_type: targetType,
        deep_link: deepLink.trim() || undefined,
      };

      if (targetType === 'ACADEMIC_YEAR') {
        payload.academic_year_id = selectedAcademicYearId;
        payload.target_id = selectedAcademicYearId;
      } else if (targetType === 'STUDENT') {
        payload.student_id = selectedStudent?.id;
        payload.target_id = selectedStudent?.id;
      }

      await staffApiClient.post('/admin/notifications', payload);

      setSuccessMessage(
        isAr ? 'تم إرسال وجدولة الإشعار الفوري بنجاح لكافة الأجهزة المستهدفة!' : 'Notification dispatched successfully!'
      );
      setIsConfirmModalOpen(false);

      // Reset form
      setTitle('');
      setBody('');
      setDeepLink('');
      setSelectedStudent(null);
      setStudentSearchQuery('');

      // Refresh list
      fetchHistory();
      fetchActivityFeed();
    } catch (err: any) {
      setErrorMessage(
        err?.message || (isAr ? 'فشل إرسال الإشعار. يرجى المحاولة مجدداً.' : 'Failed to send notification.')
      );
      setIsConfirmModalOpen(false);
    } finally {
      setIsSending(false);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return isAr ? 'الآن' : 'Just now';
      if (mins < 60) return isAr ? `منذ ${mins} دقيقة` : `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return isAr ? `منذ ${hours} ساعة` : `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return isAr ? `منذ ${days} يوم` : `${days}d ago`;
    } catch {
      return '';
    }
  };

  const filteredActivity = activityItems.filter((item) => {
    if (!activitySearch.trim()) return true;
    const query = activitySearch.trim().toLowerCase();
    return (
      item.title_ar?.toLowerCase().includes(query) ||
      item.body_ar?.toLowerCase().includes(query) ||
      item.metadata?.student_name?.toLowerCase().includes(query) ||
      item.metadata?.student_phone?.includes(query) ||
      item.metadata?.order_number?.toLowerCase().includes(query) ||
      item.metadata?.ticket_number?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Messages */}
      {successMessage && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-950/90 border border-emerald-800 p-4 text-emerald-200 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="ms-auto text-emerald-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-rose-950/90 border border-rose-800 p-4 text-rose-200 text-xs font-bold animate-in fade-in">
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="ms-auto text-rose-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-950/90 border border-emerald-800/80 text-emerald-400 shadow-sm">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-white">
              {isAr ? 'مركز الإشعارات والطلبات' : 'Notifications & Alerts Center'}
            </h1>
            <p className="text-xs text-neutral-400">
              {isAr
                ? 'متابعة طلبات شحن المحفظة، طلبات الكتب، الدعم الفني، وإرسال تنبيهات فورية'
                : 'Monitor top-ups, book orders, support requests, and send push notifications'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchActivityFeed();
            fetchHistory();
          }}
          disabled={activityLoading || loadingHistory}
          className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-[#121713] px-3.5 py-2 text-xs font-bold text-neutral-200 hover:bg-neutral-800 hover:border-emerald-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${activityLoading || loadingHistory ? 'animate-spin' : ''}`} />
          <span>{isAr ? 'تحديث البيانات' : 'Refresh'}</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div
          onClick={() => {
            setActiveTab('alerts');
            setActivityCategory('WALLET_TOPUP');
          }}
          className="cursor-pointer rounded-2xl border border-neutral-800 bg-[#101511] p-4 hover:border-amber-700/60 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400">{isAr ? 'طلبات شحن المحفظة' : 'Topup Requests'}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-950/70 border border-amber-800/60 text-amber-400">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">{counts.pending_topups}</span>
            <span className="text-[11px] font-bold text-neutral-500">{isAr ? 'طلب معلق' : 'pending'}</span>
          </div>
        </div>

        <div
          onClick={() => {
            setActiveTab('alerts');
            setActivityCategory('BOOK_ORDER');
          }}
          className="cursor-pointer rounded-2xl border border-neutral-800 bg-[#101511] p-4 hover:border-emerald-700/60 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400">{isAr ? 'طلبات الكتب والمتجر' : 'Book Orders'}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-950/70 border border-emerald-800/60 text-emerald-400">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{counts.pending_orders}</span>
            <span className="text-[11px] font-bold text-neutral-500">{isAr ? 'طلب جديد' : 'new orders'}</span>
          </div>
        </div>

        <div
          onClick={() => {
            setActiveTab('alerts');
            setActivityCategory('SUPPORT_TICKET');
          }}
          className="cursor-pointer rounded-2xl border border-neutral-800 bg-[#101511] p-4 hover:border-cyan-700/60 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400">{isAr ? 'تذاكر الدعم الفني' : 'Support Tickets'}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-950/70 border border-cyan-800/60 text-cyan-400">
              <Headset className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-400">{counts.open_tickets}</span>
            <span className="text-[11px] font-bold text-neutral-500">{isAr ? 'تذكرة مفتوحة' : 'open tickets'}</span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('alerts')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'alerts'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
          }`}
        >
          <Bell className="h-4 w-4 text-emerald-400" />
          <span>{isAr ? 'تنبيهات العمليات والطلبات' : 'Operational Activity'}</span>
          {counts.total > 0 && (
            <span className="rounded-full bg-rose-600 px-1.5 py-0.2 text-[10px] font-black text-white">
              {counts.total}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('send')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'send'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
          }`}
        >
          <Send className="h-4 w-4 text-emerald-400" />
          <span>{isAr ? 'إرسال إشعار فوري للطلاب' : 'Send Push Notification'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 shadow-sm'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
          }`}
        >
          <Clock className="h-4 w-4 text-emerald-400" />
          <span>{isAr ? 'سجل الإشعارات المرسلة' : 'Sent History'}</span>
          <span className="rounded-full bg-neutral-800 px-1.5 py-0.2 text-[10px] text-neutral-400">
            {history.length}
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: OPERATIONAL ACTIVITY & REQUESTS                   */}
      {/* ======================================================== */}
      {activeTab === 'alerts' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl border border-neutral-800 bg-[#101511]">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'ALL', label_ar: 'الكل', label_en: 'All' },
                { key: 'WALLET_TOPUP', label_ar: 'شحن المحفظة', label_en: 'Top-ups' },
                { key: 'BOOK_ORDER', label_ar: 'طلبات الكتب', label_en: 'Book Orders' },
                { key: 'SUPPORT_TICKET', label_ar: 'الدعم الفني', label_en: 'Support' },
                { key: 'SYSTEM', label_ar: 'تنبيهات النظام', label_en: 'System' },
              ].map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActivityCategory(cat.key)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                    activityCategory === cat.key
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  {isAr ? cat.label_ar : cat.label_en}
                </button>
              ))}
            </div>

            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                placeholder={isAr ? 'بحث في التنبيهات...' : 'Search alerts...'}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 ps-9 pe-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Activity Cards List */}
          {activityLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400 gap-2">
              <RefreshCw className="h-6 w-6 animate-spin text-emerald-400" />
              <span className="text-xs font-bold">{isAr ? 'جاري جلب آخر التنبيهات والطلبات...' : 'Loading activity feed...'}</span>
            </div>
          ) : filteredActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-3xl border border-neutral-800 bg-[#0e120f] text-neutral-400 gap-2 text-center p-6">
              <CheckCircle2 className="h-10 w-10 text-emerald-500/50" />
              <p className="text-sm font-bold text-white">{isAr ? 'لا توجد تنبيهات تطابق البحث' : 'No alerts found'}</p>
              <p className="text-xs text-neutral-500 max-w-sm">
                {isAr
                  ? 'كافة طلبات شحن الرصيد والكتب والرسائل تم التعامل معها ولا توجد طلبات معلقة حالياً.'
                  : 'All operational requests have been processed.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredActivity.map((item) => {
                const title = isAr ? item.title_ar : item.title_en || item.title_ar;
                const body = isAr ? item.body_ar : item.body_en || item.body_ar;

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      item.is_actionable
                        ? 'border-amber-800/60 bg-amber-950/10 hover:border-amber-700'
                        : 'border-neutral-800 bg-[#0e120f] hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-xs mt-0.5 ${
                          item.category === 'WALLET_TOPUP'
                            ? 'bg-amber-950/80 border-amber-800/80 text-amber-400'
                            : item.category === 'BOOK_ORDER'
                            ? 'bg-emerald-950/80 border-emerald-800/80 text-emerald-400'
                            : item.category === 'SUPPORT_TICKET'
                            ? 'bg-cyan-950/80 border-cyan-800/80 text-cyan-400'
                            : 'bg-indigo-950/80 border-indigo-800/80 text-indigo-400'
                        }`}
                      >
                        {item.category === 'WALLET_TOPUP' && <Wallet className="h-5 w-5" />}
                        {item.category === 'BOOK_ORDER' && <BookOpen className="h-5 w-5" />}
                        {item.category === 'SUPPORT_TICKET' && <Headset className="h-5 w-5" />}
                        {item.category === 'SYSTEM' && <Info className="h-5 w-5" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xs sm:text-sm font-bold text-white">{title}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                              item.status === 'PENDING' || item.status === 'OPEN'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800/80'
                                : item.status === 'APPROVED' || item.status === 'SHIPPED'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <p className="text-xs text-neutral-300 leading-relaxed max-w-2xl">{body}</p>

                        <div className="flex items-center gap-3 text-[10px] text-neutral-500 pt-0.5">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(item.created_at)}
                          </span>

                          {item.metadata?.student_phone && (
                            <span className="font-mono text-neutral-400">{item.metadata.student_phone}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Direct Action Link Button */}
                    <div className="w-full sm:w-auto shrink-0 flex items-center justify-end">
                      <Link
                        href={item.deep_link || '/staff'}
                        className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all w-full sm:w-auto ${
                          item.is_actionable
                            ? 'bg-amber-600 hover:bg-amber-500 text-black shadow-sm font-black'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200'
                        }`}
                      >
                        <span>
                          {item.category === 'WALLET_TOPUP'
                            ? isAr ? 'مراجعة طلب الشحن' : 'Review Top-up'
                            : item.category === 'BOOK_ORDER'
                            ? isAr ? 'متابعة طلب الكتب' : 'View Order'
                            : item.category === 'SUPPORT_TICKET'
                            ? isAr ? 'الرد على التذكرة' : 'Reply Ticket'
                            : isAr ? 'فتح القسم' : 'View Section'}
                        </span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: BROADCAST & SEND PUSH NOTIFICATIONS               */}
      {/* ======================================================== */}
      {activeTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Left: Broadcast Form */}
          <div className="lg:col-span-7 space-y-5">
            <div className="rounded-3xl border border-neutral-800 bg-[#0e120f] p-6 shadow-sm">
              <form onSubmit={handleOpenConfirm} className="space-y-4">
                {/* Target Audience Selector */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-2">
                    {isAr ? 'الجمهور المستهدف بالإشعار:' : 'Target Audience:'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTargetType('ALL_STUDENTS')}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-all ${
                        targetType === 'ALL_STUDENTS'
                          ? 'border-emerald-600 bg-emerald-950/70 text-emerald-300 shadow-xs'
                          : 'border-neutral-800 bg-[#121713] text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      <span>{isAr ? 'كافة الطلاب' : 'All Students'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetType('ACADEMIC_YEAR')}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-all ${
                        targetType === 'ACADEMIC_YEAR'
                          ? 'border-emerald-600 bg-emerald-950/70 text-emerald-300 shadow-xs'
                          : 'border-neutral-800 bg-[#121713] text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <GraduationCap className="h-4 w-4" />
                      <span>{isAr ? 'مرحلة دراسية' : 'Academic Stage'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetType('STUDENT')}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-bold transition-all ${
                        targetType === 'STUDENT'
                          ? 'border-emerald-600 bg-emerald-950/70 text-emerald-300 shadow-xs'
                          : 'border-neutral-800 bg-[#121713] text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <UserCheck className="h-4 w-4" />
                      <span>{isAr ? 'طالب محدد' : 'Single Student'}</span>
                    </button>
                  </div>
                </div>

                {/* Sub-selectors */}
                {targetType === 'ACADEMIC_YEAR' && (
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      {isAr ? 'اختر المرحلة الدراسية المستهدفة:' : 'Select Academic Stage:'}
                    </label>
                    <select
                      value={selectedAcademicYearId}
                      onChange={(e) => setSelectedAcademicYearId(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      {academicYears.map((y) => (
                        <option key={y.id} value={y.id}>
                          {isAr ? y.name_ar : y.name_en}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {targetType === 'STUDENT' && (
                  <div className="relative">
                    <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                      {isAr ? 'البحث عن الطالب (بالاسم أو الهاتف):' : 'Search Student (Name/Phone):'}
                    </label>

                    {selectedStudent ? (
                      <div className="flex items-center justify-between rounded-xl border border-emerald-800/80 bg-emerald-950/40 p-3 text-xs font-bold text-emerald-200">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-emerald-400" />
                          <span>{selectedStudent.full_name}</span>
                          <span className="text-neutral-400 font-mono">({selectedStudent.phone})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudent(null);
                            setStudentSearchQuery('');
                          }}
                          className="text-neutral-400 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="relative">
                          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                          <input
                            type="text"
                            value={studentSearchQuery}
                            onChange={(e) => setStudentSearchQuery(e.target.value)}
                            placeholder={isAr ? 'اكتب اسم الطالب أو رقم الهاتف...' : 'Type name or phone...'}
                            className="w-full rounded-xl border border-neutral-800 bg-neutral-900 ps-9 pe-3 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        {showStudentDropdown && (
                          <div className="absolute top-full z-20 mt-1 w-full rounded-2xl border border-neutral-800 bg-[#121713] shadow-2xl overflow-hidden divide-y divide-neutral-800">
                            {studentSearchResults.map((st) => (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => {
                                  setSelectedStudent(st);
                                  setShowStudentDropdown(false);
                                }}
                                className="w-full text-start p-3 hover:bg-neutral-800 transition-colors flex items-center justify-between text-xs"
                              >
                                <span className="font-bold text-white">{st.full_name}</span>
                                <span className="font-mono text-neutral-400 text-[11px]">{st.phone}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    {isAr ? 'عنوان الإشعار:' : 'Notification Title:'}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={isAr ? 'مثال: تم رفع محاضرة المراجعة النهائية' : 'e.g. New Revision Lecture Available'}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs font-medium text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    {isAr ? 'نص رسالة الإشعار والتفاصيل:' : 'Notification Message Body:'}
                  </label>
                  <textarea
                    rows={4}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={isAr ? 'اكتب الرسالة التي ستظهر للطالب في الهاتف ولوحة التحكم...' : 'Write notification message...'}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs font-medium text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                  />
                </div>

                {/* Deep Link */}
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                    {isAr ? 'الرابط السريع المرفق (Deep Link):' : 'Action Deep Link (Optional):'}
                  </label>
                  <select
                    value={deepLink}
                    onChange={(e) => setDeepLink(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2.5 text-xs font-medium text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {DEEP_LINK_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {isAr ? opt.label_ar : opt.label_en}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit CTA */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-black text-white shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
                  >
                    <Send className="h-4 w-4" />
                    <span>{isAr ? 'إرسال الإشعار الفوري الآن' : 'Dispatch Notification'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right: Live Push Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-20 rounded-3xl border border-neutral-800 bg-[#0e120f] p-6 shadow-sm">
              <h3 className="text-xs font-bold text-neutral-400 mb-4 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>{isAr ? 'معاينة ظهور الإشعار في هاتف الطالب' : 'Mobile Notification Preview'}</span>
              </h3>

              {/* Mockup Mobile Push Notification Banner */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-600 text-[10px] font-black text-white">
                      OM
                    </div>
                    <span className="text-[11px] font-bold text-white">Mr. Omar Meckawy</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">Just now</span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold text-white">
                    {title.trim() || (isAr ? 'عنوان الإشعار التجريبي' : 'Notification Title')}
                  </h4>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    {body.trim() || (isAr ? 'هنا يظهر نص الإشعار الكامل وتفاصيل التنبيه الموجه للطلاب...' : 'Notification body message will appear here...')}
                  </p>
                </div>

                {deepLink && (
                  <div className="pt-2 border-t border-neutral-900/80 flex items-center justify-between text-[10px] text-emerald-400 font-bold">
                    <span>{isAr ? 'الرابط السريع:' : 'Action Link:'}</span>
                    <span className="font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-900">
                      {deepLink}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: BROADCAST HISTORY                                 */}
      {/* ======================================================== */}
      {activeTab === 'history' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between p-3 rounded-2xl border border-neutral-800 bg-[#101511]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-400">{isAr ? 'فلترة حسب الجمهور:' : 'Filter Audience:'}</span>
              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
                className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white focus:outline-none"
              >
                <option value="ALL">{isAr ? 'الكل' : 'All'}</option>
                <option value="ALL_STUDENTS">{isAr ? 'كافة الطلاب' : 'All Students'}</option>
                <option value="ACADEMIC_YEAR">{isAr ? 'مرحلة دراسية' : 'Academic Stage'}</option>
                <option value="STUDENT">{isAr ? 'طالب محدد' : 'Single Student'}</option>
              </select>
            </div>
          </div>

          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400 gap-2">
              <RefreshCw className="h-6 w-6 animate-spin text-emerald-400" />
              <span className="text-xs font-bold">{isAr ? 'جاري تحميل سجل الإشعارات...' : 'Loading history...'}</span>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 rounded-3xl border border-neutral-800 bg-[#0e120f] text-neutral-400 gap-2 text-center p-6">
              <Clock className="h-10 w-10 text-neutral-600" />
              <p className="text-sm font-bold text-white">{isAr ? 'لا يوجد سجل إشعارات مرسلة' : 'No sent notifications'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {history.map((n) => (
                <div key={n.id} className="rounded-2xl border border-neutral-800 bg-[#0e120f] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-white">{n.title_ar}</h3>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {n.status}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-neutral-800 text-neutral-400">
                        {n.target_type}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-300 max-w-2xl">{n.body_ar}</p>

                    <div className="flex items-center gap-3 text-[10px] text-neutral-500 pt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3" />
                        {new Date(n.created_at).toLocaleString('ar-EG')}
                      </span>
                      {n.creator_name && <span>بواسطة: {n.creator_name}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-[#121713] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{isAr ? 'تأكيد إرسال الإشعار الفوري' : 'Confirm Dispatch'}</h3>
                <p className="text-xs text-neutral-400">{isAr ? 'سيصل التنبيه لكافة الطلاب المستهدفين فوراً' : 'Will be pushed to all targets'}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-3.5 space-y-2 text-xs">
              <p className="font-bold text-white">{title}</p>
              <p className="text-neutral-300 text-[11px] leading-relaxed">{body}</p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isSending}
                className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-bold text-neutral-300 hover:bg-neutral-800"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleExecuteSend}
                disabled={isSending}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-md disabled:opacity-50"
              >
                {isSending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>{isSending ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (isAr ? 'تأكيد وإرسال' : 'Confirm & Send')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
