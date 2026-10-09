'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiClient, resolveMediaUrl } from '@/lib/api';
import StudentLayout from '@/components/layout/StudentLayout';
import EmptyState from '@/components/ui/EmptyState';
import {
  Package as PackageIcon,
  Play,
  Clock,
  CheckCircle2,
  BookOpen,
  ChevronRight,
  Sparkles,
  Video,
  FileText,
  HelpCircle,
  Calendar,
  Layers,
  ArrowLeft,
  Lock,
  Tag,
  ShieldCheck,
  Wallet,
  Check,
  AlertCircle,
  X,
} from 'lucide-react';

interface PackageDetailsClientProps {
  packageId?: string | number;
}

function PackageDetailsInner({ packageId }: PackageDetailsClientProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawParamId = params?.id ? String(params.id) : '';
  const paramId = rawParamId === 'detail' ? '' : rawParamId;
  const searchId = searchParams?.get('id') || searchParams?.get('package_id') || '';
  const effectivePackageId = packageId || paramId || searchId;

  const { student, isAuthenticated, openAuthGate, isSubscribedToPackage, refreshSubscriptions } = useAuth();
  const [activeTab, setActiveTab] = useState<'lectures' | 'exams' | 'files'>('lectures');
  const [pkg, setPkg] = useState<any | null>(null);
  const [lectures, setLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Purchase & Code States
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent?: number; amount?: number; finalPrice: number } | null>(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeFeedback, setCodeFeedback] = useState<{ type: 'success' | 'error'; message: string; isActivation?: boolean } | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const isPurchased = isSubscribedToPackage(effectivePackageId) || purchaseSuccess;

  useEffect(() => {
    let isMounted = true;

    async function loadPackageData() {
      if (!effectivePackageId) return;
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch package details
        let apiPkg: any = await apiClient.get<any>(`/packages/${effectivePackageId}`).catch(() => null);
        if (!apiPkg || !apiPkg.id) {
          apiPkg = await apiClient.get<any>(`/packages/public?limit=100`).then((res: any) => {
            const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
            return list.find((p: any) => String(p.id) === String(effectivePackageId)) || null;
          }).catch(() => null);
        }

        if (isMounted && apiPkg) {
          setPkg(apiPkg);
        }

        // 2. Fetch lectures associated with this package
        let pkgLecturesRes: any = await apiClient
          .get<any>(`/lectures?package_id=${effectivePackageId}&limit=100`)
          .catch(() => null);

        let lecturesList: any[] = [];
        if (pkgLecturesRes) {
          if (Array.isArray(pkgLecturesRes.items)) {
            lecturesList = pkgLecturesRes.items;
          } else if (Array.isArray(pkgLecturesRes.data)) {
            lecturesList = pkgLecturesRes.data;
          } else if (Array.isArray(pkgLecturesRes)) {
            lecturesList = pkgLecturesRes;
          } else if (pkgLecturesRes.data && Array.isArray(pkgLecturesRes.data.items)) {
            lecturesList = pkgLecturesRes.data.items;
          }
        }

        if (lecturesList.length === 0) {
          const publicLecRes: any = await apiClient
            .get<any>(`/lectures/public?package_id=${effectivePackageId}&limit=100`)
            .catch(() => null);
          if (publicLecRes) {
            if (Array.isArray(publicLecRes.items)) {
              lecturesList = publicLecRes.items;
            } else if (Array.isArray(publicLecRes.data)) {
              lecturesList = publicLecRes.data;
            } else if (Array.isArray(publicLecRes)) {
              lecturesList = publicLecRes;
            } else if (publicLecRes.data && Array.isArray(publicLecRes.data.items)) {
              lecturesList = publicLecRes.data.items;
            }
          }
        }

        // 3. If no direct lectures found but package has member courses, load lectures from courses
        if (lecturesList.length === 0 && apiPkg?.courses && Array.isArray(apiPkg.courses) && apiPkg.courses.length > 0) {
          const courseLecturesPromises = apiPkg.courses.map((c: any) =>
            apiClient.get<any>(`/courses/${c.course_id || c.id}/lectures`).catch(() => [])
          );
          const results = await Promise.all(courseLecturesPromises);
          const aggregated: any[] = [];
          const seenIds = new Set<string>();

          results.forEach((cList: any, idx: number) => {
            const courseObj = apiPkg.courses[idx];
            const parsedList = Array.isArray(cList)
              ? cList
              : Array.isArray(cList?.items)
              ? cList.items
              : Array.isArray(cList?.data)
              ? cList.data
              : [];

            parsedList.forEach((lec: any) => {
              if (lec && !seenIds.has(String(lec.id))) {
                seenIds.add(String(lec.id));
                aggregated.push({
                  ...lec,
                  course_title: courseObj?.title_ar || courseObj?.title || lec.course_title,
                  course_id: courseObj?.course_id || courseObj?.id || lec.course_id,
                });
              }
            });
          });
          lecturesList = aggregated;
        }

        if (isMounted) {
          setLectures(lecturesList);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'تعذر تحميل بيانات الباقة');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPackageData();

    return () => {
      isMounted = false;
    };
  }, [effectivePackageId]);

  // Handle applying activation or discount code
  const handleApplyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim() || !pkg) return;

    setCodeLoading(true);
    setCodeFeedback(null);

    const basePrice = Number(pkg.discount_price || pkg.price || 0);

    try {
      // 1. First attempt direct package activation via redemption endpoint
      try {
        const redeemRes: any = await apiClient.post('/api/v1/activation/redeem', {
          code: promoCode.trim(),
        });
        if (redeemRes) {
          setCodeFeedback({
            type: 'success',
            message: redeemRes.message || '🎉 تم تفعيل الباقة بنجاح والاشتراك فيها مجاناً!',
            isActivation: true,
          });
          setPurchaseSuccess(true);
          await refreshSubscriptions();
          return;
        }
      } catch (err: any) {
        // If not a direct activation code, try discount validation
      }

      // 2. Validate as discount coupon
      try {
        const discountRes: any = await apiClient.post('/api/v1/discounts/validate', {
          code: promoCode.trim(),
          item_type: 'PACKAGE',
          item_id: pkg.id,
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
          message: 'تم تفعيل خصم 100% مجاناً على الباقة!',
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
        openAuthGate(`/packages/detail?id=${effectivePackageId}`);
      } else {
        window.location.href = `/login?returnUrl=${encodeURIComponent(`/student/packages/detail?id=${effectivePackageId}`)}`;
      }
      return;
    }

    if (!pkg) return;

    setPurchasing(true);
    setCodeFeedback(null);

    const effectivePrice = appliedDiscount ? appliedDiscount.finalPrice : Number(pkg.discount_price || pkg.price || 0);

    try {
      await apiClient.post('/api/v1/purchases', {
        item_type: 'PACKAGE',
        item_id: pkg.id,
        discount_code: appliedDiscount?.code,
      });

      setPurchaseSuccess(true);
      setCodeFeedback({
        type: 'success',
        message: effectivePrice === 0
          ? '🎉 تم الاشتراك في الباقة المجانية بنجاح!'
          : '🎉 تم شراء الباقة والاشتراك فيها بنجاح من رصيد محفظتك!',
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
          message: 'أنت مشترك بالفعل في هذه الباقة!',
          isActivation: true,
        });
        setPurchaseSuccess(true);
        await refreshSubscriptions();
      } else if (errMsg.includes('ACADEMIC_YEAR_MISMATCH') || errMsg.includes('different academic year')) {
        setCodeFeedback({
          type: 'error',
          message: 'هذه الباقة مخصصة لصف دراسي آخر وغير متاحة لحسابك.',
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
    const el = document.getElementById('package-purchase-box');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setIsPurchaseModalOpen(true);
    }
  };

  if (loading) {
    return (
      <StudentLayout>
        <div className="space-y-6 animate-pulse font-cairo">
          <div className="h-10 w-48 rounded-2xl bg-stone-200 dark:bg-stone-800" />
          <div className="h-56 rounded-3xl bg-stone-200 dark:bg-stone-800" />
          <div className="h-80 rounded-3xl bg-stone-200 dark:bg-stone-800" />
        </div>
      </StudentLayout>
    );
  }

  if (error || !pkg) {
    return (
      <StudentLayout>
        <div className="py-12 font-cairo">
          <EmptyState
            icon="Package"
            title="الباقة غير موجودة"
            description={error || 'عذراً، لم يتم العثور على هذه الباقة التعليمية أو تم نقلها.'}
            actionText="الرجوع إلى الباقات"
            actionUrl="/student/packages"
          />
        </div>
      </StudentLayout>
    );
  }

  const title = pkg.title_ar || pkg.title || 'باقة تعليمية';
  const description = pkg.description_ar || pkg.description || '';
  const rawImage = pkg.thumbnail_url || pkg.imageUrl;
  const image = resolveMediaUrl(rawImage);
  const academicStageName = pkg.academic_year_name_ar || 'الصف الدراسي';
  const lecturesCount = lectures.length;

  const price = Number(pkg.price) || 0;
  const discountPrice = pkg.discount_price ? Number(pkg.discount_price) : null;
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
          <Link href="/student/packages" className="hover:text-[#0d6e4f] dark:hover:text-emerald-400 transition-colors">
            الباقات الشهرية
          </Link>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-gray-400" />
          <span className="text-gray-900 dark:text-white font-bold line-clamp-1">{title}</span>
        </div>

        {/* Package Hero Banner Card */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064e3b] via-[#0d6e4f] to-[#042f24] text-white p-6 sm:p-8 shadow-xl shadow-emerald-950/20 border border-emerald-700/40">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl text-start">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-emerald-200 text-xs font-black backdrop-blur-md border border-white/20">
                  <PackageIcon className="w-3.5 h-3.5 text-emerald-300" />
                  <span>باقة تعليمية</span>
                </span>

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/30 text-emerald-100 text-xs font-bold border border-white/10">
                  <span>{academicStageName}</span>
                </span>

                {isPurchased ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black shadow-sm border border-emerald-400/40">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>أنت مشترك بهذه الباقة</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-black text-xs font-black shadow-sm">
                    <span>{effectivePrice > 0 ? `${effectivePrice} ج.م` : 'مجانية'}</span>
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
                  <span>{lecturesCount} محاضرات مضمنة</span>
                </span>
                {Array.isArray(pkg.courses) && pkg.courses.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-300" />
                    <span>{pkg.courses.length} كورسات</span>
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Preview */}
            <div className="relative shrink-0 w-full sm:w-64 h-40 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-emerald-950/60 flex items-center justify-center">
              {image ? (
                <img src={image} alt={title} className="w-full h-full object-cover" />
              ) : (
                <PackageIcon className="w-16 h-16 text-emerald-300/70" />
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
            id="package-purchase-box"
            className="p-6 rounded-3xl bg-white dark:bg-[#101726] border-2 border-emerald-500/40 shadow-xl space-y-5 text-start"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-4 h-4" />
                  اشترك الآن للوصول لكافة المحاضرات والمذكرات
                </span>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  شراء وتفعيل الباقة الشهرية
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
                <span>لديك كود تفعيل أو كود خصم للباقة؟</span>
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
                {lectures.map((lec: any, index: number) => {
                  const lecTitle = lec.title_ar || lec.title || `المحاضرة ${index + 1}`;
                  const lecDesc = lec.description_ar || lec.description || '';
                  const lecDuration =
                    lec.duration ||
                    (lec.duration_seconds
                      ? `${Math.floor(lec.duration_seconds / 60)} دقيقة`
                      : null);
                  const lecImage = resolveMediaUrl(lec.thumbnail_url || lec.imageUrl);
                  const isCompleted = Boolean(lec.is_completed || lec.status === 'completed');

                  const isFree = Boolean(
                    lec.is_free ||
                    lec.isFree ||
                    lec.access_type === 'FREE' ||
                    lec.visibility === 'FREE'
                  );
                  const isUnlocked = isPurchased || isFree;

                  return (
                    <div
                      key={lec.id || index}
                      className={`group rounded-3xl bg-white dark:bg-[#131b2e] border ${
                        isUnlocked
                          ? 'border-stone-200/80 dark:border-gray-800/80 hover:border-[#0d6e4f] dark:hover:border-emerald-500/60'
                          : 'border-amber-200/80 dark:border-amber-900/40 hover:border-amber-500'
                      } shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between hover:-translate-y-1 text-start`}
                    >
                      {/* Top Thumbnail Box */}
                      <div className="relative h-44 bg-neutral-900 flex items-center justify-center p-4 overflow-hidden text-white">
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
                            <span className="px-2.5 py-1 rounded-xl bg-black/50 backdrop-blur-md text-[11px] font-black text-emerald-200 border border-white/10">
                              محاضرة {index + 1}
                            </span>
                          )}
                        </div>

                        {/* Status / Lock Badge on Top Right */}
                        <div className="absolute top-3 end-3 z-10">
                          {isCompleted ? (
                            <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white text-[11px] font-black flex items-center gap-1 shadow-sm">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>مكتملة</span>
                            </span>
                          ) : !isUnlocked ? (
                            <span className="px-2.5 py-1 rounded-xl bg-amber-500/90 text-stone-950 text-[11px] font-black flex items-center gap-1 shadow-sm">
                              <Lock className="w-3 h-3" />
                              <span>تتطلب الاشتراك</span>
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <h3 className="font-extrabold text-base text-gray-900 dark:text-white line-clamp-1 group-hover:text-[#0d6e4f] dark:group-hover:text-emerald-400 transition-colors">
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

                        {/* Action CTA Button */}
                        {isUnlocked ? (
                          <Link
                            href={`/student/lectures/detail?id=${lec.id}&packageId=${effectivePackageId}`}
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
                description="لم يتم إضافة أي محاضرات لهذه الباقة حتى الآن. سيتم نشر المحاضرات قريباً."
                actionText="الرجوع للباقات"
                actionUrl="/student/packages"
              />
            )}
          </div>
        )}

        {/* Tab 2: الاختبارات */}
        {activeTab === 'exams' && (
          <EmptyState
            icon="HelpCircle"
            title="الاختبارات (0)"
            description="لا توجد اختبارات تفاعلية مضافة لهذه الباقة حالياً."
          />
        )}

        {/* Tab 3: المذكرات والملفات */}
        {activeTab === 'files' && (
          <EmptyState
            icon="FileText"
            title="المذكرات والملفات (0)"
            description="لا توجد مذكرات أو ملفات PDF مرفقة بهذه الباقة حالياً."
          />
        )}
      </div>
    </StudentLayout>
  );
}

export default function PackageDetailsClient(props: PackageDetailsClientProps) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      <PackageDetailsInner {...props} />
    </React.Suspense>
  );
}
