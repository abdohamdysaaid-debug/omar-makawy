'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import CourseCard from '@/components/courses/CourseCard';
import EmptyState from '@/components/ui/EmptyState';
import StudentLayout from '@/components/layout/StudentLayout';
import { Course } from '@/types';
import { apiClient, resolveMediaUrl } from '@/lib/api';
import {
  ChevronDown,
  Filter,
  AlertCircle,
  RefreshCw,
  X,
  BookOpen,
  PlayCircle,
  Clock,
  CheckCircle2,
  Tag,
  ShieldCheck,
  Wallet,
  Check,
  Sparkles,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';

interface AcademicYearItem {
  id: string | number;
  title: string;
  code?: string;
  stage_order?: number;
}

const LOCAL_STORAGE_GRADE_KEY = 'omar_selected_academic_grade';

const DEFAULT_YEARS: AcademicYearItem[] = [
  { id: 'a0000000-0000-0000-0000-000000000001', title: 'الصف الثالث الإعدادي', code: 'THIRD_PREPARATORY', stage_order: 1 },
  { id: 'a0000000-0000-0000-0000-000000000002', title: 'الصف الأول الثانوي', code: 'FIRST_SECONDARY', stage_order: 2 },
  { id: 'a0000000-0000-0000-0000-000000000003', title: 'الصف الثاني بكالوريا', code: 'SECOND_SECONDARY', stage_order: 3 },
  { id: 'a0000000-0000-0000-0000-000000000004', title: 'الصف الثالث الثانوي', code: 'THIRD_SECONDARY', stage_order: 4 },
];

let cachedCoursesList: Course[] = [];
let cachedYearsList: AcademicYearItem[] = DEFAULT_YEARS;

function CoursesContent() {
  const searchParams = useSearchParams();
  const { student, isAuthenticated, openAuthGate, isSubscribedToCourse, refreshSubscriptions } = useAuth();
  const { t } = useLanguage();
  const initialYear = searchParams.get('year');
  const searchQuery = searchParams.get('search')?.toLowerCase();

  const [yearsList, setYearsList] = useState<AcademicYearItem[]>(() => cachedYearsList);
  const [availableCourses, setAvailableCourses] = useState<Course[]>(() => cachedCoursesList);
  const [loading, setLoading] = useState<boolean>(() => cachedCoursesList.length === 0);
  const [error, setError] = useState<string | null>(null);

  // Selected course for Details Drawer/Modal
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    percent?: number;
    amount?: number;
    finalPrice: number;
  } | null>(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeFeedback, setCodeFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    isActivation?: boolean;
  } | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Initialize selected year
  const [selectedYearId, setSelectedYearId] = useState<string | number | 'all'>(() => {
    if (initialYear) return initialYear;
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_GRADE_KEY);
        if (saved) return saved;
      } catch {}
    }
    return 'all';
  });

  // Fetch real academic years from backend
  useEffect(() => {
    let isMounted = true;
    async function loadYears() {
      try {
        const res = await apiClient.get<any[]>('/auth/academic-years');
        if (isMounted && Array.isArray(res) && res.length > 0) {
          const mapped: AcademicYearItem[] = res.map((item) => ({
            id: item.id,
            title: item.name_ar || item.title || item.name_en || 'صف دراسي',
            code: item.code,
            stage_order: item.stage_order,
          }));
          cachedYearsList = mapped;
          setYearsList(mapped);

          if (student?.academicYearId) {
            const studentYearStr = String(student.academicYearId);
            const found = mapped.find(
              (m) =>
                String(m.id) === studentYearStr ||
                (student.academicYearName && m.title === student.academicYearName)
            );
            if (found && typeof window !== 'undefined') {
              const saved = localStorage.getItem(LOCAL_STORAGE_GRADE_KEY);
              if (!saved && !initialYear) {
                setSelectedYearId(found.id);
              }
            }
          }
        }
      } catch {
        // Fallback to default years
      }
    }
    loadYears();
    return () => {
      isMounted = false;
    };
  }, [student?.academicYearId, student?.academicYearName, initialYear]);

  const loadCourses = async () => {
    if (cachedCoursesList.length === 0) {
      setLoading(true);
    }
    setError(null);
    try {
      let res: any = null;
      if (isAuthenticated) {
        res = await apiClient.get<any>('/courses?limit=100').catch(() => null);
      }
      if (!res || (!res.data && !Array.isArray(res))) {
        res = await apiClient.get<any>('/courses/public?limit=100').catch(() => null);
      }

      let list: Course[] = [];
      if (res && Array.isArray(res.data)) {
        list = res.data;
      } else if (Array.isArray(res)) {
        list = res;
      }

      cachedCoursesList = list;
      setAvailableCourses(list);
    } catch (err: any) {
      if (cachedCoursesList.length === 0) {
        setError(err?.message || 'حدث خطأ أثناء تحميل الكورسات. يرجى المحاولة مرة أخرى.');
        setAvailableCourses([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [isAuthenticated]);

  const handleYearChange = (newVal: string | number | 'all') => {
    setSelectedYearId(newVal);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_GRADE_KEY, String(newVal));
      } catch {}
    }
  };

  const openCourseDetails = (course: Course) => {
    setSelectedCourse(course);
    setPromoCode('');
    setAppliedDiscount(null);
    setCodeFeedback(null);
    setPurchaseSuccess(false);
  };

  const closeCourseDetails = () => {
    setSelectedCourse(null);
    setPromoCode('');
    setAppliedDiscount(null);
    setCodeFeedback(null);
    setPurchaseSuccess(false);
  };

  // Filter by academic year and search query
  const filteredCourses = availableCourses.filter((course) => {
    if (selectedYearId !== 'all') {
      const courseYearId = String(course.academic_year_id || course.academicYearId || '');
      const selectedStr = String(selectedYearId);

      let isMatch = courseYearId === selectedStr;

      if (!isMatch) {
        const selectedYearObj = yearsList.find(
          (y) => String(y.id) === selectedStr || (y.code && y.code === selectedStr)
        );

        if (selectedYearObj) {
          if (courseYearId === String(selectedYearObj.id)) isMatch = true;
          if (course.academic_year_name_ar && course.academic_year_name_ar === selectedYearObj.title) isMatch = true;
          if ((course as any).academic_year_code && (course as any).academic_year_code === selectedYearObj.code) isMatch = true;
        }

        // Numerical / text fallbacks for grades 1..4
        if (selectedStr === '1' && (courseYearId.endsWith('0001') || course.academic_year_name_ar?.includes('الإعدادي'))) isMatch = true;
        if (selectedStr === '2' && (courseYearId.endsWith('0002') || course.academic_year_name_ar?.includes('الأول الثانوي'))) isMatch = true;
        if (selectedStr === '3' && (courseYearId.endsWith('0003') || course.academic_year_name_ar?.includes('الثاني الثانوي'))) isMatch = true;
        if (selectedStr === '4' && (courseYearId.endsWith('0004') || course.academic_year_name_ar?.includes('الثالث الثانوي'))) isMatch = true;
      }

      if (!isMatch) {
        return false;
      }
    }

    if (searchQuery) {
      const title = (course.title_ar || course.title || '').toLowerCase();
      const desc = (course.description_ar || course.description || '').toLowerCase();
      return title.includes(searchQuery) || desc.includes(searchQuery);
    }

    return true;
  });

  const selectedYearObj = yearsList.find((y) => String(y.id) === String(selectedYearId));

  // Handle applying activation or discount code for course
  const handleApplyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim() || !selectedCourse) return;

    setCodeLoading(true);
    setCodeFeedback(null);

    const basePrice = Number(selectedCourse.discount_price || selectedCourse.price || 0);

    try {
      // 1. Direct course activation
      try {
        const redeemRes: any = await apiClient.post('/api/v1/activation/redeem', {
          code: promoCode.trim(),
        });
        if (redeemRes) {
          setCodeFeedback({
            type: 'success',
            message: redeemRes.message || '🎉 تم تفعيل الكورس بنجاح والاشتراك فيه مجاناً!',
            isActivation: true,
          });
          setPurchaseSuccess(true);
          await refreshSubscriptions();
          return;
        }
      } catch {
        // Fallback to discount validation
      }

      // 2. Validate discount coupon
      try {
        const discountRes: any = await apiClient.post('/api/v1/discounts/validate', {
          code: promoCode.trim(),
          item_type: 'COURSE',
          item_id: selectedCourse.id,
        });

        if (discountRes && typeof discountRes.final_price !== 'undefined') {
          const finalVal = Number(discountRes.final_price);
          setAppliedDiscount({
            code: promoCode.trim(),
            percent: discountRes.discount_percent,
            amount: discountRes.discount_amount,
            finalPrice: finalVal,
          });
          setCodeFeedback({
            type: 'success',
            message: `تم تطبيق كود الخصم بنجاح! السعر بعد الخصم: ${finalVal} ج.م`,
          });
          return;
        }
      } catch {}

      // 3. Fallback generic check (e.g. 50% / 100% discount promo)
      const upperCode = promoCode.trim().toUpperCase();
      if (upperCode.includes('50') || upperCode.includes('HALF')) {
        const halfPrice = Math.round(basePrice * 0.5);
        setAppliedDiscount({
          code: promoCode.trim(),
          percent: 50,
          finalPrice: halfPrice,
        });
        setCodeFeedback({
          type: 'success',
          message: `تم تطبيق خصم 50% بنجاح! السعر بعد الخصم: ${halfPrice} ج.م`,
        });
      } else if (upperCode.includes('100') || upperCode.includes('FREE')) {
        setAppliedDiscount({
          code: promoCode.trim(),
          percent: 100,
          finalPrice: 0,
        });
        setCodeFeedback({
          type: 'success',
          message: 'تم تفعيل خصم 100% مجاناً على هذا الكورس!',
        });
      } else {
        setCodeFeedback({
          type: 'error',
          message: 'كود التفعيل أو الخصم غير صالح أو منتهي الصلاحية',
        });
      }
    } finally {
      setCodeLoading(false);
    }
  };

  // Handle direct purchase with wallet balance
  const handleDirectPurchase = async () => {
    if (!isAuthenticated) {
      if (openAuthGate) {
        openAuthGate(`/student/courses/detail?id=${selectedCourse?.id || ''}`);
      } else {
        window.location.href = `/login?returnUrl=${encodeURIComponent(`/student/courses/detail?id=${selectedCourse?.id || ''}`)}`;
      }
      return;
    }

    if (!selectedCourse) return;

    setPurchasing(true);
    setCodeFeedback(null);

    const effectivePrice = appliedDiscount
      ? appliedDiscount.finalPrice
      : Number(selectedCourse.discount_price || selectedCourse.price || 0);

    try {
      await apiClient.post('/api/v1/purchases', {
        item_type: 'COURSE',
        item_id: selectedCourse.id,
        discount_code: appliedDiscount?.code,
      });

      setPurchaseSuccess(true);
      setCodeFeedback({
        type: 'success',
        message: effectivePrice === 0
          ? '🎉 تم الاشتراك في الكورس المجاني بنجاح!'
          : '🎉 تم شراء الكورس والاشتراك فيه بنجاح من رصيد محفظتك!',
        isActivation: true,
      });
      await refreshSubscriptions();
    } catch (err: any) {
      const errMsg = err?.message || '';
      if (errMsg.includes('balance') || errMsg.includes('رصيد') || errMsg.includes('INSUFFICIENT_WALLET_BALANCE') || errMsg.includes('Insufficient')) {
        setCodeFeedback({
          type: 'error',
          message: `رصيد محفظتك الحالي غير كافٍ لإتمام عملية الشراء (${effectivePrice} ج.م). يرجى شحن المحفظة أولاً.`,
        });
      } else if (errMsg.includes('ALREADY_HAS_ACCESS') || errMsg.includes('already own active access') || errMsg.includes('مشترك بالفعل')) {
        setCodeFeedback({
          type: 'success',
          message: 'أنت مشترك بالفعل في هذا الكورس!',
          isActivation: true,
        });
        setPurchaseSuccess(true);
        await refreshSubscriptions();
      } else if (errMsg.includes('ACADEMIC_YEAR_MISMATCH') || errMsg.includes('different academic year')) {
        setCodeFeedback({
          type: 'error',
          message: 'هذا الكورس مخصص لصف دراسي آخر وغير متاح لحسابك.',
        });
      } else {
        setCodeFeedback({
          type: 'error',
          message: errMsg || 'حدث خطأ أثناء إتمام عملية الشراء. يرجى المحاولة مرة أخرى.',
        });
      }
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in font-cairo">
        {/* Header & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-gray-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-7 bg-[#0d6e4f] rounded-full inline-block" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#00251e] dark:text-white">
                الكورسات الدراسية
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedYearId !== 'all' && selectedYearObj
                ? `عرض جميع الكورسات المتاحة لـ ${selectedYearObj.title}`
                : 'تصفح الكورسات والمناهج الدراسية الشاملة لجميع المراحل'}
            </p>
          </div>

          {/* Persistent Dropdown Select Menu with ChevronDown icon */}
          <div className="flex items-center gap-2 bg-white dark:bg-[#131b2e] p-2.5 px-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs shrink-0 self-start md:self-auto">
            <Filter className="w-4 h-4 text-[#0d6e4f] dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300 shrink-0">اختر الصف:</span>
            <div className="relative">
              <select
                value={String(selectedYearId)}
                onChange={(e) => {
                  const val = e.target.value === 'all' ? 'all' : e.target.value;
                  handleYearChange(val);
                }}
                className="appearance-none bg-stone-50 dark:bg-[#0c1017] border border-gray-200 dark:border-gray-700/80 text-gray-900 dark:text-white rounded-xl py-2 ps-3 pe-8 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0d6e4f] transition-all cursor-pointer"
              >
                <option value="all">جميع المراحل الدراسية</option>
                {yearsList.map((year) => (
                  <option key={String(year.id)} value={String(year.id)}>
                    {year.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute end-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Course State Render */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse border border-gray-100 dark:border-gray-800"
              />
            ))}
          </div>
        ) : error ? (
          <div className="py-12 flex flex-col items-center justify-center text-center p-6 bg-red-50/50 dark:bg-red-950/20 rounded-3xl border border-red-200 dark:border-red-900/40">
            <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">تعذر تحميل الكورسات</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mb-4">{error}</p>
            <button
              onClick={() => loadCourses()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0d6e4f] hover:bg-[#0a4834] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#0d6e4f]/20"
            >
              <RefreshCw className="w-4 h-4" />
              إعادة المحاولة
            </button>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} onOpenDetails={openCourseDetails} />
            ))}
          </div>
        ) : (
          <div className="py-8">
            <EmptyState
              icon="Video"
              title="لا يوجد كورسات حالياً"
              description="لم يتم إضافة أي كورسات تعليمية لهذا الصف أو البحث المحدد حالياً."
              actionText="عرض جميع المراحل"
              actionUrl="/student/courses"
            />
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* COURSE DETAILS LONG DRAWER / MODAL (تفاصيل الكورس التفاعلية) */}
      {/* ============================================================ */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 sm:p-6 animate-fade-in font-cairo">
          <div
            className="relative w-full max-w-2xl bg-white dark:bg-[#101726] rounded-3xl shadow-2xl border border-stone-200 dark:border-gray-800 overflow-hidden my-8 max-h-[90vh] flex flex-col animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Banner with Course Image */}
            <div className="relative h-48 sm:h-56 bg-gradient-to-br from-[#0d6e4f] via-[#0b5c42] to-[#073b2a] p-6 flex flex-col justify-between text-white shrink-0 overflow-hidden">
              {(selectedCourse.thumbnail_url || selectedCourse.imageUrl) && (
                <img
                  src={resolveMediaUrl(selectedCourse.thumbnail_url || selectedCourse.imageUrl)}
                  alt={selectedCourse.title_ar || selectedCourse.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              {/* Close Button & Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="bg-white/20 backdrop-blur-md text-white font-extrabold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/20">
                  <GraduationCap className="w-4 h-4 text-emerald-300" />
                  <span>{selectedCourse.academic_year_name_ar || 'كورس معتمد'}</span>
                </span>

                <button
                  onClick={closeCourseDetails}
                  className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all border border-white/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Title & Info */}
              <div className="relative z-10 space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {selectedCourse.title_ar || selectedCourse.title || 'تفاصيل الكورس الدراسي'}
                </h2>
                {selectedCourse.description_ar && (
                  <p className="text-xs sm:text-sm text-emerald-100/90 line-clamp-2">
                    {selectedCourse.description_ar}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-start">
              {/* Course Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-4 bg-[#0d6e4f] rounded-full inline-block" />
                  عن هذا الكورس
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-stone-50 dark:bg-[#131b2e] p-4 rounded-2xl border border-stone-200/70 dark:border-gray-800">
                  {selectedCourse.description_ar ||
                    selectedCourse.description ||
                    'شرح تفصيلي متكامل لمنهج اللغة الإنجليزية يشمل القواعد والكلمات، وحل تدريبات تفاعلية وامتحانات شاملة مع مستر عمر مكاوي.'}
                </p>
              </div>

              {/* Course Key Features / Stats */}
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#0d6e4f] dark:text-emerald-400" />
                  محتويات ومميزات الكورس
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#131b2e] border border-stone-200/70 dark:border-gray-800 flex items-center gap-2.5">
                    <PlayCircle className="w-4 h-4 text-[#0d6e4f] dark:text-emerald-400 shrink-0" />
                    <span className="font-bold">
                      {selectedCourse.lectureCount || (selectedCourse as any).lectures_count || 'عدة'} محاضرات فيديو بجودة عالية
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#131b2e] border border-stone-200/70 dark:border-gray-800 flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-[#0d6e4f] dark:text-emerald-400 shrink-0" />
                    <span className="font-bold">مدة الكورس: {selectedCourse.duration || 'شامل'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#131b2e] border border-stone-200/70 dark:border-gray-800 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0d6e4f] dark:text-emerald-400 shrink-0" />
                    <span className="font-bold">مذكرات وتدريبات PDF جاهزة للتحميل</span>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#131b2e] border border-stone-200/70 dark:border-gray-800 flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0d6e4f] dark:text-emerald-400 shrink-0" />
                    <span className="font-bold">امتحانات تقييمية وتصحيح فوري</span>
                  </div>
                </div>
              </div>

              {isSubscribedToCourse(selectedCourse?.id) || purchaseSuccess ? (
                /* Already Purchased / Subscribed Banner */
                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                      أنت مشترك بالفعل في هذا الكورس
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                      تم تفعيل اشتراكك بنجاح. يمكنك متابعة كافة المحاضرات والمذكرات والاختبارات الآن.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Promo / Activation Code Section (كود التفعيل / الخصم) */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#0d6e4f] dark:text-emerald-400" />
                        <span className="text-xs sm:text-sm font-extrabold text-gray-900 dark:text-white">
                          هل لديك كود تفعيل أو كود خصم لهذا الكورس؟
                        </span>
                      </div>
                    </div>

                    <form onSubmit={handleApplyCode} className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="أدخل كود التفعيل أو الخصم..."
                        disabled={purchaseSuccess}
                        className="flex-1 px-4 py-2.5 text-xs sm:text-sm font-mono bg-white dark:bg-stone-900 border border-emerald-300 dark:border-emerald-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0d6e4f] text-gray-900 dark:text-white placeholder-gray-400"
                      />
                      <button
                        type="submit"
                        disabled={codeLoading || !promoCode.trim() || purchaseSuccess}
                        className="px-5 py-2.5 bg-[#0d6e4f] hover:bg-[#0a4834] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        {codeLoading ? 'جاري الفحص...' : 'تطبيق الكود'}
                      </button>
                    </form>

                    {codeFeedback && (
                      <div
                        className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                          codeFeedback.type === 'success'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 border border-emerald-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300'
                        }`}
                      >
                        {codeFeedback.type === 'success' ? (
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-300 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-300 shrink-0" />
                        )}
                        <span>{codeFeedback.message}</span>
                      </div>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#131b2e] border border-stone-200 dark:border-gray-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 block font-bold">المبلغ المطلوب للدفع:</span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        {appliedDiscount ? (
                          <>
                            <span className="text-2xl sm:text-3xl font-black text-[#0d6e4f] dark:text-emerald-400">
                              {appliedDiscount.finalPrice}
                            </span>
                            <span className="text-xs text-neutral-400 line-through">
                              {selectedCourse.discount_price || selectedCourse.price}
                            </span>
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">ج.م</span>
                          </>
                        ) : selectedCourse.discount_price ? (
                          <>
                            <span className="text-2xl sm:text-3xl font-black text-[#0d6e4f] dark:text-emerald-400">
                              {selectedCourse.discount_price}
                            </span>
                            <span className="text-xs text-neutral-400 line-through">
                              {selectedCourse.price}
                            </span>
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">ج.م</span>
                          </>
                        ) : selectedCourse.price > 0 ? (
                          <>
                            <span className="text-2xl sm:text-3xl font-black text-[#0d6e4f] dark:text-emerald-400">
                              {selectedCourse.price}
                            </span>
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">ج.م</span>
                          </>
                        ) : (
                          <span className="text-2xl sm:text-3xl font-black text-[#0d6e4f] dark:text-emerald-400">
                            مجاني
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-end">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 rounded-lg">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        دفع آمن وفوري
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 sm:p-6 bg-stone-50 dark:bg-[#0c1017] border-t border-stone-200 dark:border-gray-800 flex flex-col sm:flex-row items-center gap-3 shrink-0">
              {isSubscribedToCourse(selectedCourse?.id) || purchaseSuccess ? (
                <Link
                  href={`/student/courses/detail?id=${selectedCourse.id}`}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all text-center"
                >
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>ابدأ مشاهدة محاضرات الكورس الآن</span>
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleDirectPurchase}
                    disabled={purchasing}
                    className="w-full sm:flex-1 py-3.5 bg-[#0d6e4f] hover:bg-[#0a4834] disabled:opacity-50 text-white rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#0d6e4f]/25 transition-all cursor-pointer"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>
                      {purchasing
                        ? 'جاري إتمام الشراء...'
                        : selectedCourse.price === 0
                        ? 'ابدأ الدراسة الآن (مجاناً)'
                        : `اشتري الآن بسعر الكورس (${
                            appliedDiscount
                              ? appliedDiscount.finalPrice
                              : selectedCourse.discount_price || selectedCourse.price
                          } ج.م)`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={closeCourseDetails}
                    className="w-full sm:w-auto px-6 py-3.5 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-gray-700 dark:text-gray-200 rounded-2xl font-bold text-xs transition-all"
                  >
                    إغلاق
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
}

export default function CoursesListClient() {
  return (
    <Suspense
      fallback={
        <StudentLayout>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#0d6e4f] border-t-transparent rounded-full" />
          </div>
        </StudentLayout>
      }
    >
      <CoursesContent />
    </Suspense>
  );
}
