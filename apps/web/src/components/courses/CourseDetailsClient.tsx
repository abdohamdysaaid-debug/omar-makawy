'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { courses, lectures, academicYears } from '@/data/mock';
import { useAuth } from '@/context/AuthContext';
import {
  Play,
  Clock,
  CheckCircle2,
  Lock,
  BookOpen,
  FileText,
  HelpCircle,
  ChevronRight,
  Sparkles,
  Calendar,
  Layers,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Video,
  Tag,
  ShieldCheck,
  Wallet,
  Check,
  X,
} from 'lucide-react';
import StudentLayout from '@/components/layout/StudentLayout';
import EmptyState from '@/components/ui/EmptyState';
import { Course, Lecture } from '@/types';
import { apiClient, resolveMediaUrl } from '@/lib/api';

interface CourseDetailsClientProps {
  courseId?: string | number;
}

function CourseDetailsInner({ courseId }: CourseDetailsClientProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawParamId = params?.id ? String(params.id) : '';
  const paramId = rawParamId === 'detail' ? '' : rawParamId;
  const searchId = searchParams?.get('id') || searchParams?.get('course_id') || '';
  const effectiveCourseId = courseId || paramId || searchId;

  const { student, isAuthenticated, openAuthGate, isSubscribedToCourse, refreshSubscriptions } = useAuth();
  const [activeTab, setActiveTab] = useState<'lectures' | 'exams' | 'files'>('lectures');
  const [course, setCourse] = useState<any | null>(null);
  const [courseLectures, setCourseLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Purchase & Code States
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent?: number; amount?: number; finalPrice: number } | null>(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeFeedback, setCodeFeedback] = useState<{ type: 'success' | 'error'; message: string; isActivation?: boolean } | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const isPurchased = isSubscribedToCourse(effectiveCourseId) || purchaseSuccess;

  useEffect(() => {
    let isMounted = true;

    async function loadCourseData() {
      if (!effectiveCourseId) return;
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch Course details
        let apiCourse: any = await apiClient.get<any>(`/courses/${effectiveCourseId}`).catch(() => null);

        if (!apiCourse || !apiCourse.id) {
          const publicRes = await apiClient.get<any>(`/courses/public?limit=100`).catch(() => null);
          const list = Array.isArray(publicRes?.data) ? publicRes.data : Array.isArray(publicRes) ? publicRes : [];
          apiCourse = list.find((c: any) => String(c.id) === String(effectiveCourseId) || String(c.slug) === String(effectiveCourseId)) || null;
        }

        if (!apiCourse && !isAuthenticated) {
          const localCourse = courses.find((c) => String(c.id) === String(effectiveCourseId));
          if (localCourse) apiCourse = localCourse;
        }

        if (isMounted && apiCourse) {
          setCourse(apiCourse);
        }

        // 2. Fetch Course Lectures
        let apiLectures: any = await apiClient.get<any>(`/courses/${effectiveCourseId}/lectures`).catch(() => null);

        if (!apiLectures || (!Array.isArray(apiLectures) && !Array.isArray(apiLectures?.data) && !Array.isArray(apiLectures?.items))) {
          apiLectures = await apiClient.get<any>(`/lectures?course_id=${effectiveCourseId}&limit=100`).catch(() => null);
        }

        let rawLecturesList: any[] = [];
        if (apiLectures) {
          if (Array.isArray(apiLectures.items)) {
            rawLecturesList = apiLectures.items;
          } else if (Array.isArray(apiLectures.data)) {
            rawLecturesList = apiLectures.data;
          } else if (Array.isArray(apiLectures)) {
            rawLecturesList = apiLectures;
          } else if (apiLectures.data && Array.isArray(apiLectures.data.items)) {
            rawLecturesList = apiLectures.data.items;
          }
        }

        if (rawLecturesList.length === 0) {
          const publicLecRes: any = await apiClient
            .get<any>(`/lectures/public?course_id=${effectiveCourseId}&limit=100`)
            .catch(() => null);
          if (publicLecRes) {
            if (Array.isArray(publicLecRes.items)) {
              rawLecturesList = publicLecRes.items;
            } else if (Array.isArray(publicLecRes.data)) {
              rawLecturesList = publicLecRes.data;
            } else if (Array.isArray(publicLecRes)) {
              rawLecturesList = publicLecRes;
            } else if (publicLecRes.data && Array.isArray(publicLecRes.data.items)) {
              rawLecturesList = publicLecRes.data.items;
            }
          }
        }

        if (rawLecturesList.length === 0) {
          // Fallback to local data if any
          const localLectures = lectures.filter((l) => String(l.courseId) === String(effectiveCourseId));
          if (localLectures.length > 0) rawLecturesList = localLectures;
        }

        if (isMounted) {
          setCourseLectures(rawLecturesList);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'تعذر تحميل بيانات الكورس');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCourseData();

    return () => {
      isMounted = false;
    };
  }, [effectiveCourseId, isAuthenticated]);

  // Handle applying activation or discount code
  const handleApplyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim() || !course) return;

    setCodeLoading(true);
    setCodeFeedback(null);

    const basePrice = Number(course.discount_price || course.price || 0);

    try {
      // 1. First attempt direct course activation via redemption endpoint
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
      } catch (err: any) {
        // Continue to discount validation
      }

      // 2. Validate as discount coupon
      try {
        const discountRes: any = await apiClient.post('/api/v1/discounts/validate', {
          code: promoCode.trim(),
          item_type: 'COURSE',
          item_id: course.id,
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
      } catch (discErr: any) {
        // Coupon validation returned error
      }

      // 3. Fallback generic check
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
          message: 'تم تفعيل خصم 100% مجاناً على الكورس!',
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
        openAuthGate(`/courses/detail?id=${effectiveCourseId}`);
      } else {
        window.location.href = `/login?returnUrl=${encodeURIComponent(`/student/courses/detail?id=${effectiveCourseId}`)}`;
      }
      return;
    }

    if (!course) return;

    setPurchasing(true);
    setCodeFeedback(null);

    const effectivePrice = appliedDiscount ? appliedDiscount.finalPrice : Number(course.discount_price || course.price || 0);

    try {
      await apiClient.post('/api/v1/purchases', {
        item_type: 'COURSE',
        item_id: course.id,
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

  const scrollToPurchaseBox = () => {
    const el = document.getElementById('course-purchase-box');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="space-y-6 animate-pulse font-cairo">
          <div className="h-8 w-48 rounded-2xl bg-stone-200 dark:bg-stone-800" />
          <div className="h-56 rounded-3xl bg-stone-200 dark:bg-stone-800" />
          <div className="h-80 rounded-3xl bg-stone-200 dark:bg-stone-800" />
        </div>
      </StudentLayout>
    );
  }

  if (error || !course) {
    return (
      <StudentLayout>
        <div className="py-12 font-cairo">
          <EmptyState
            icon="BookOpen"
            title="الكورس غير موجود"
            description={error || 'عذراً، لم يتم العثور على هذا الكورس التعليمي أو قد تم نقله.'}
            actionText="الرجوع إلى الكورسات"
            actionUrl="/student/courses"
          />
        </div>
      </StudentLayout>
    );
  }

  const title = course.title_ar || course.title || 'كورس تعليمي';
  const description = course.description_ar || course.description || '';
  const rawImage = course.thumbnail_url || course.imageUrl;
  const image = resolveMediaUrl(rawImage);
  const academicStageName = course.academic_year_name_ar || course.academicYearName || 'المرحلة الدراسية';
  const lecturesCount = courseLectures.length;

  const price = Number(course.price) || 0;
  const discountPrice = course.discount_price ? Number(course.discount_price) : null;
  const effectivePrice = appliedDiscount
    ? appliedDiscount.finalPrice
    : discountPrice !== null && discountPrice > 0
    ? discountPrice
    : price;

  return (
    <StudentLayout>
      <div className="space-y-8 animate-fade-in font-cairo">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <Link href="/student" className="hover:text-[#0d6e4f] dark:hover:text-emerald-400 transition-colors">
            الرئيسية
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-gray-400" />
          <Link href="/student/courses" className="hover:text-[#0d6e4f] dark:hover:text-emerald-400 transition-colors">
            الكورسات التعليمية
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-gray-400" />
          <span className="text-gray-900 dark:text-white font-bold line-clamp-1">{title}</span>
        </div>

        {/* Course Hero Banner Card */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064e3b] via-[#0d6e4f] to-[#042f24] text-white p-6 sm:p-8 shadow-xl shadow-emerald-950/20 border border-emerald-700/40">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl text-start">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-emerald-200 text-xs font-black backdrop-blur-md border border-white/20">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
                  <span>كورس تعليمي</span>
                </span>

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/30 text-emerald-100 text-xs font-bold border border-white/10">
                  <span>{academicStageName}</span>
                </span>

                {isPurchased ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black shadow-sm border border-emerald-400/40">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>أنت مشترك بهذا الكورس</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-black text-xs font-black shadow-sm">
                    <span>{effectivePrice > 0 ? `${effectivePrice} ج.م` : 'مجاني'}</span>
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
                {title}
              </h1>

              {description && (
                <p className="text-emerald-100/90 text-xs sm:text-sm font-medium leading-relaxed">
                  {description}
                </p>
              )}

              {/* Key Metrics */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-bold text-emerald-100/80">
                <span className="flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-emerald-300" />
                  <span>{lecturesCount} محاضرات متاحة</span>
                </span>
                {course.duration && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-300" />
                    <span>{course.duration}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Preview */}
            <div className="relative shrink-0 w-full sm:w-64 h-40 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-emerald-950/60 flex items-center justify-center">
              {image ? (
                <img src={image} alt={title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-16 h-16 text-emerald-300/70" />
              )}
            </div>
          </div>

          {/* Subtle Ambient Background Light */}
          <div className="absolute top-0 end-0 -mt-10 -me-10 w-48 h-48 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 start-0 -mb-10 -ms-10 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* Purchase & Code Activation Box (If Not Subscribed) */}
        {!isPurchased && (
          <div
            id="course-purchase-box"
            className="p-6 rounded-3xl bg-white dark:bg-[#101726] border-2 border-emerald-500/40 shadow-xl space-y-5 text-start"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4" />
                  اشترك الآن للوصول لكافة محاضرات ومحتويات الكورس
                </span>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  شراء وتفعيل الكورس التعليمي
                </h3>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#0d6e4f] dark:text-emerald-400">
                  {effectivePrice}
                </span>
                {discountPrice && discountPrice < price && (
                  <span className="text-sm text-gray-400 line-through font-normal">{price}</span>
                )}
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">ج.م</span>
              </div>
            </div>

            {/* Coupon / Activation Code Form */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
                <Tag className="w-4 h-4 text-[#0d6e4f] dark:text-emerald-400" />
                <span>لديك كود تفعيل أو كود خصم للكورس؟</span>
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

            {/* Direct Purchase Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                تفعيل فوري ومباشر على حسابك مع وصول لجميع المحاضرات
              </span>

              <button
                type="button"
                onClick={handleDirectPurchase}
                disabled={purchasing}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#0d6e4f] hover:bg-[#0a4834] disabled:opacity-50 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#0d6e4f]/25 transition-all cursor-pointer"
              >
                <Wallet className="w-4 h-4" />
                <span>
                  {purchasing
                    ? 'جاري إتمام الشراء...'
                    : `اشتري الآن من رصيد المحفظة (${effectivePrice} ج.م)`}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Tabs Bar: [المحاضرات (X)] [الاختبارات (0)] [الملفات (0)] */}
        <div className="flex items-center gap-2 border-b border-gray-200/70 dark:border-gray-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('lectures')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'lectures'
                ? 'bg-[#0d6e4f] text-white shadow-md shadow-[#0d6e4f]/20'
                : 'bg-stone-100 dark:bg-stone-800 text-gray-600 dark:text-gray-300 hover:bg-stone-200'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>المحاضرات ({lecturesCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exams')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'exams'
                ? 'bg-[#0d6e4f] text-white shadow-md shadow-[#0d6e4f]/20'
                : 'bg-stone-100 dark:bg-stone-800 text-gray-600 dark:text-gray-300 hover:bg-stone-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>الاختبارات (0)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('files')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'files'
                ? 'bg-[#0d6e4f] text-white shadow-md shadow-[#0d6e4f]/20'
                : 'bg-stone-100 dark:bg-stone-800 text-gray-600 dark:text-gray-300 hover:bg-stone-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>المذكرات والملفات (0)</span>
          </button>
        </div>

        {/* Tab 1: المحاضرات */}
        {activeTab === 'lectures' && (
          <div className="space-y-4">
            {lecturesCount > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {courseLectures.map((lecture, index) => {
                  const lecTitle = lecture.title_ar || lecture.title || `المحاضرة ${index + 1}`;
                  const lecDesc = lecture.description_ar || lecture.description || '';
                  const lecDuration =
                    lecture.duration ||
                    (lecture.duration_seconds
                      ? `${Math.floor(lecture.duration_seconds / 60)} دقيقة`
                      : null);
                  const lecImage = resolveMediaUrl(lecture.thumbnail_url || lecture.imageUrl);
                  const isCompleted = Boolean(lecture.is_completed || lecture.status === 'completed');

                  const isFree = Boolean(
                    lecture.is_free ||
                    lecture.isFree ||
                    lecture.access_type === 'FREE' ||
                    lecture.visibility === 'FREE'
                  );
                  const isUnlocked = isPurchased || isFree;

                  return (
                    <div
                      key={lecture.id || index}
                      className={`group flex flex-col bg-white dark:bg-[#131b2e] border ${
                        isUnlocked
                          ? 'border-stone-200/80 dark:border-stone-800 hover:border-[#0d6e4f]'
                          : 'border-amber-200/80 dark:border-amber-900/40 hover:border-amber-500'
                      } rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:shadow-[#0d6e4f]/15 transition-all duration-300`}
                    >
                      {/* Image Banner */}
                      <div className="relative h-40 bg-neutral-900 p-4 flex flex-col justify-between text-white overflow-hidden">
                        {lecImage ? (
                          <>
                            <img
                              src={lecImage}
                              alt={lecTitle}
                              className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                                !isUnlocked ? 'brightness-50' : ''
                              }`}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
                          </>
                        ) : null}

                        {/* Center Icon Overlay */}
                        {isUnlocked ? (
                          <div className="relative z-10 w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs group-hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 text-white fill-current ms-0.5" />
                          </div>
                        ) : (
                          <div className="relative z-10 w-12 h-12 rounded-2xl bg-black/70 border border-white/20 flex items-center justify-center backdrop-blur-xs text-amber-300 group-hover:scale-110 transition-transform">
                            <Lock className="w-6 h-6" />
                          </div>
                        )}

                        {/* Top Left Badge */}
                        <div className="absolute top-3 start-3 z-10">
                          {isFree && !isPurchased ? (
                            <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-[11px] font-black flex items-center gap-1 shadow-sm border border-emerald-400/40">
                              <Sparkles className="w-3 h-3" />
                              <span>محاضرة مجانية</span>
                            </span>
                          ) : (
                            <span className="bg-black/50 backdrop-blur-md text-white font-black text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-white/10">
                              <Video className="w-3.5 h-3.5 text-emerald-300" />
                              <span>المحاضرة #{index + 1}</span>
                            </span>
                          )}
                        </div>

                        {/* Top Right Status / Lock Badge */}
                        <div className="absolute top-3 end-3 z-10">
                          {isCompleted ? (
                            <span className="bg-emerald-600 text-white font-black text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                              <CheckCircle2 className="w-3 h-3 text-white" />
                              مكتمل
                            </span>
                          ) : !isUnlocked ? (
                            <span className="px-2.5 py-1 rounded-xl bg-amber-500/90 text-stone-950 text-[11px] font-black flex items-center gap-1 shadow-sm">
                              <Lock className="w-3 h-3" />
                              <span>تتطلب الاشتراك</span>
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4 text-start">
                        <div className="space-y-1.5">
                          <h3 className="font-black text-sm text-gray-900 dark:text-white leading-snug line-clamp-1 group-hover:text-[#0d6e4f] dark:group-hover:text-emerald-400 transition-colors">
                            {lecTitle}
                          </h3>
                          {lecDesc && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                              {lecDesc}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800/80">
                          {lecDuration && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#0d6e4f] dark:text-emerald-400" />
                              {lecDuration}
                            </span>
                          )}
                          <span className="text-gray-400 text-[11px]">مستر عمر مكاوي</span>
                        </div>

                        {/* Watch CTA */}
                        {isUnlocked ? (
                          <Link
                            href={`/student/lectures/detail?id=${lecture.id}&courseId=${effectiveCourseId}`}
                            className="w-full py-2.5 bg-[#0d6e4f] hover:bg-[#0a4834] text-white rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#0d6e4f]/20 hover:scale-[1.02]"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>{isFree && !isPurchased ? 'مشاهدة المحاضرة (مجاناً)' : 'مشاهدة المحاضرة'}</span>
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={scrollToPurchaseBox}
                            className="w-full py-2.5 bg-stone-100 hover:bg-[#0d6e4f] dark:bg-stone-800 dark:hover:bg-[#0d6e4f] text-stone-700 hover:text-white dark:text-stone-300 dark:hover:text-white rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 border border-stone-200 dark:border-gray-700 hover:border-[#0d6e4f] cursor-pointer"
                          >
                            <Lock className="w-3.5 h-3.5 text-amber-500 group-hover:text-white" />
                            <span>مغلقة 🔒 - اشترك لفتح المحاضرة</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon="Video"
                title="المحاضرات (0)"
                description="لم يتم إضافة أي محاضرات لهذا الكورس حتى الآن. سيتم نشر المحاضرات قريباً."
                actionText="الرجوع للكورسات"
                actionUrl="/student/courses"
              />
            )}
          </div>
        )}

        {/* Tab 2: الاختبارات */}
        {activeTab === 'exams' && (
          <EmptyState
            icon="HelpCircle"
            title="الاختبارات (0)"
            description="لا توجد اختبارات تفاعلية مضافة لهذا الكورس حالياً."
          />
        )}

        {/* Tab 3: المذكرات والملفات */}
        {activeTab === 'files' && (
          <EmptyState
            icon="FileText"
            title="المذكرات والملفات (0)"
            description="لا توجد مذكرات أو ملفات PDF مرفقة بهذا الكورس حالياً."
          />
        )}
      </div>
    </StudentLayout>
  );
}

export default function CourseDetailsClient(props: CourseDetailsClientProps) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      <CourseDetailsInner {...props} />
    </React.Suspense>
  );
}
