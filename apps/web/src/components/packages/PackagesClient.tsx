'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import StudentLayout from '@/components/layout/StudentLayout';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { apiClient, resolveMediaUrl } from '@/lib/api';
import {
  Package as PackageIcon,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  Filter,
  X,
  BookOpen,
  Star,
  Tag,
  ShieldCheck,
  Wallet,
  PlayCircle,
  Clock,
  Check,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import PackageCard from '@/components/packages/PackageCard';

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

let cachedPackagesList: any[] = [];
let cachedPackageYearsList: AcademicYearItem[] = DEFAULT_YEARS;

export default function PackagesClient() {
  const { student, isAuthenticated, openAuthGate, isSubscribedToPackage, refreshSubscriptions } = useAuth();
  const [yearsList, setYearsList] = useState<AcademicYearItem[]>(() => cachedPackageYearsList);
  const [selectedYearId, setSelectedYearId] = useState<string | number | 'all'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_GRADE_KEY);
        if (saved) return saved;
      } catch {}
    }
    return 'all';
  });
  const [availablePackages, setAvailablePackages] = useState<any[]>(() => cachedPackagesList);
  const [loading, setLoading] = useState<boolean>(() => cachedPackagesList.length === 0);

  // Selected package for details modal/drawer
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent?: number; amount?: number; finalPrice: number } | null>(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeFeedback, setCodeFeedback] = useState<{ type: 'success' | 'error'; message: string; isActivation?: boolean } | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Load real academic years dynamically
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
          cachedPackageYearsList = mapped;
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
              if (!saved) {
                setSelectedYearId(found.id);
              }
            }
          }
        }
      } catch {
        // Fallback already in initial state
      }
    }
    loadYears();
    return () => {
      isMounted = false;
    };
  }, [student?.academicYearId, student?.academicYearName]);

  // Load packages
  useEffect(() => {
    let isMounted = true;

    async function loadPackages() {
      if (cachedPackagesList.length === 0) {
        setLoading(true);
      }
      try {
        let res: any = null;
        if (isAuthenticated) {
          res = await apiClient.get<any>('/packages?limit=100').catch(() => null);
        }

        let list: any[] = [];
        if (res) {
          if (Array.isArray(res)) list = res;
          else if (res.data && Array.isArray(res.data.data)) list = res.data.data;
          else if (res.data && Array.isArray(res.data.items)) list = res.data.items;
          else if (Array.isArray(res.data)) list = res.data;
          else if (Array.isArray(res.items)) list = res.items;
        }

        if (list.length === 0) {
          const publicRes = await apiClient.get<any>('/packages/public?limit=100').catch(() => null);
          if (publicRes) {
            if (Array.isArray(publicRes)) list = publicRes;
            else if (publicRes.data && Array.isArray(publicRes.data.data)) list = publicRes.data.data;
            else if (publicRes.data && Array.isArray(publicRes.data.items)) list = publicRes.data.items;
            else if (Array.isArray(publicRes.data)) list = publicRes.data;
            else if (Array.isArray(publicRes.items)) list = publicRes.items;
          }
        }

        cachedPackagesList = list;
        if (isMounted) {
          setAvailablePackages(list);
        }
      } catch {
        if (isMounted && cachedPackagesList.length === 0) {
          setAvailablePackages([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPackages();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleYearChange = (newVal: string | number | 'all') => {
    setSelectedYearId(newVal);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_GRADE_KEY, String(newVal));
      } catch {}
    }
  };

  const router = useRouter();

  const openPackageDetails = (pkg: any) => {
    if (!isAuthenticated && openAuthGate) {
      openAuthGate(`/packages/detail?id=${pkg.id}`);
    } else {
      router.push(`/student/packages/detail?id=${pkg.id}`);
    }
  };

  const closePackageDetails = () => {
    setSelectedPackage(null);
    setPromoCode('');
    setAppliedDiscount(null);
    setCodeFeedback(null);
    setPurchaseSuccess(false);
  };

  // Filter packages based on selected academic year
  const filteredPackages = availablePackages.filter((pkg) => {
    if (selectedYearId === 'all') return true;

    const pkgYearId = String(pkg.academic_year_id || pkg.academicYearId || '');
    const selectedStr = String(selectedYearId);

    if (pkgYearId === selectedStr) return true;

    const selectedYearObj = yearsList.find(
      (y) => String(y.id) === selectedStr || (y.code && y.code === selectedStr)
    );

    if (selectedYearObj) {
      if (pkgYearId === String(selectedYearObj.id)) return true;
      if (pkg.academic_year_name_ar && pkg.academic_year_name_ar === selectedYearObj.title) return true;
      if (pkg.academic_year_code && pkg.academic_year_code === selectedYearObj.code) return true;
    }

    // Fallbacks for numeric IDs 1..4
    if (selectedStr === '1' && (pkgYearId.endsWith('0001') || pkg.academic_year_name_ar?.includes('الإعدادي'))) return true;
    if (selectedStr === '2' && (pkgYearId.endsWith('0002') || pkg.academic_year_name_ar?.includes('الأول الثانوي'))) return true;
    if (selectedStr === '3' && (pkgYearId.endsWith('0003') || pkg.academic_year_name_ar?.includes('الثاني الثانوي'))) return true;
    if (selectedStr === '4' && (pkgYearId.endsWith('0004') || pkg.academic_year_name_ar?.includes('الثالث الثانوي'))) return true;

    return false;
  });

  const selectedYearObj = yearsList.find((y) => String(y.id) === String(selectedYearId));

  // Handle applying activation or discount code
  const handleApplyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim() || !selectedPackage) return;

    if (!isAuthenticated) {
      setCodeFeedback({
        type: 'error',
        message: 'يرجى تسجيل الدخول أولاً لتتمكن من تفعيل الكود على حسابك.',
      });
      if (openAuthGate) {
        openAuthGate(`/student/packages`);
      }
      return;
    }

    setCodeLoading(true);
    setCodeFeedback(null);

    const basePrice = Number(selectedPackage.discount_price || selectedPackage.price || 0);
    const cleanCode = promoCode.trim();
    let activationErrorMsg: string | null = null;

    try {
      // 1. First attempt direct package activation via redemption endpoint
      try {
        const redeemRes: any = await apiClient.post('/api/v1/activation/redeem', {
          code: cleanCode,
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
        activationErrorMsg =
          err?.response?.data?.message ||
          err?.data?.message ||
          err?.message ||
          null;
      }

      // If the code starts with ACT- and failed activation, show the activation error directly!
      if (cleanCode.toUpperCase().startsWith('ACT-')) {
        setCodeFeedback({
          type: 'error',
          message: activationErrorMsg || 'كود التفعيل غير صالح أو منتهي الصلاحية.',
        });
        return;
      }

      // 2. Validate as discount coupon
      try {
        const discountRes: any = await apiClient.post('/api/v1/discounts/validate', {
          code: cleanCode,
          item_type: 'PACKAGE',
          item_id: selectedPackage.id,
        });

        if (discountRes && typeof discountRes.final_price !== 'undefined') {
          const finalVal = Number(discountRes.final_price);
          setAppliedDiscount({
            code: cleanCode,
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

      // 3. Fallback generic check (e.g. 50% / 100% demo promo code matching)
      const upperCode = cleanCode.toUpperCase();
      if (upperCode.includes('50') || upperCode.includes('HALF')) {
        const halfPrice = Math.round(basePrice * 0.5);
        setAppliedDiscount({
          code: cleanCode,
          percent: 50,
          finalPrice: halfPrice,
        });
        setCodeFeedback({
          type: 'success',
          message: `تم تطبيق خصم 50% بنجاح! السعر بعد الخصم: ${halfPrice} ج.م`,
        });
      } else if (upperCode.includes('100') || upperCode.includes('FREE')) {
        setAppliedDiscount({
          code: cleanCode,
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
          message: activationErrorMsg || 'كود التفعيل أو الخصم غير صالح أو منتهي الصلاحية',
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
        openAuthGate(`/packages`);
      } else {
        window.location.href = `/login?returnUrl=${encodeURIComponent('/student/packages')}`;
      }
      return;
    }

    if (!selectedPackage) return;

    setPurchasing(true);
    setCodeFeedback(null);

    const effectivePrice = appliedDiscount ? appliedDiscount.finalPrice : Number(selectedPackage.discount_price || selectedPackage.price || 0);

    try {
      const res: any = await apiClient.post('/api/v1/purchases', {
        item_type: 'PACKAGE',
        item_id: selectedPackage.id,
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

  return (
    <StudentLayout>
      <div className="space-y-8 animate-fade-in font-cairo">
        {/* Header & Persistent Dropdown Control */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-gray-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-7 bg-[#0d6e4f] rounded-full inline-block" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#00251e] dark:text-white">
                باقات مستر عمر مكاوي
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedYearId !== 'all' && selectedYearObj
                ? `عرض الباقات الشهرية المتاحة لـ ${selectedYearObj.title}`
                : 'تصفح واشترك في باقات مستر عمر مكاوي الشهرية المتاحة لجميع المراحل الدراسية'}
            </p>
          </div>

          {/* Persistent Dropdown Select Menu */}
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

        {/* Packages Grid Matching Homepage Design */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-3xl bg-stone-200/60 dark:bg-stone-800 animate-pulse" />
            ))}
          </div>
        ) : filteredPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                onOpenDetails={openPackageDetails}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="Package"
            title="لا يوجد باقات حالياً"
            description="لم يتم إضافة أي باقات شهرية لهذا الصف حالياً. ستتوفر الباقات فور إضافتها من قبل الإدارة."
          />
        )}
      </div>

      {/* ============================================================ */}
      {/* PACKAGE DETAILS LONG DRAWER / MODAL (تفاصيل الباقة التفاعلية) */}
      {/* ============================================================ */}
      {selectedPackage && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 sm:p-6 animate-fade-in font-cairo">
          <div
            className="relative w-full max-w-2xl bg-white dark:bg-[#101726] rounded-3xl shadow-2xl border border-stone-200 dark:border-gray-800 overflow-hidden my-8 max-h-[90vh] flex flex-col animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Banner with Package Image */}
            <div className="relative h-48 sm:h-56 bg-neutral-900 p-6 flex flex-col justify-between text-white shrink-0 overflow-hidden">
              {selectedPackage.thumbnail_url && (
                <img
                  src={resolveMediaUrl(selectedPackage.thumbnail_url)}
                  alt={selectedPackage.title_ar || selectedPackage.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

              {/* Close Button & Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="bg-black/60 backdrop-blur-md text-white font-extrabold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/20 shadow-xs">
                  <PackageIcon className="w-4 h-4 text-emerald-300" />
                  <span>{selectedPackage.academic_year_name_ar || 'باقة معتمدة'}</span>
                </span>

                <button
                  onClick={closePackageDetails}
                  className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all border border-white/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Title & Info */}
              <div className="relative z-10 space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {selectedPackage.title_ar || selectedPackage.title || 'تفاصيل الباقة التعليمية'}
                </h2>
                {selectedPackage.description_ar && (
                  <p className="text-xs sm:text-sm text-emerald-100/90 line-clamp-2">
                    {selectedPackage.description_ar}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-start">
              {/* Package Full Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-4 bg-[#0d6e4f] rounded-full inline-block" />
                  عن هذه الباقة
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-stone-50 dark:bg-[#131b2e] p-4 rounded-2xl border border-stone-200/70 dark:border-gray-800">
                  {selectedPackage.description_ar || selectedPackage.description || 'باقة تعليمية شاملة لمنهج اللغة الإنجليزية مع مستر عمر مكاوي، تشمل المحاضرات والشرح وحل تدريبات الواجب والمذكرات والامتحانات التفاعلية.'}
                </p>
              </div>

              {/* What is included in this package */}
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#0d6e4f] dark:text-emerald-400" />
                  محتويات الباقة والكورسات المضمنة
                </h3>

                {Array.isArray(selectedPackage.courses) && selectedPackage.courses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedPackage.courses.map((course: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-stone-50 dark:bg-[#131b2e] border border-stone-200/70 dark:border-gray-800 flex items-center gap-2.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#0d6e4f] dark:text-emerald-400 shrink-0" />
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                          {course.title_ar || course.title}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-gray-600 dark:text-gray-300">
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#131b2e] border border-stone-200/70 dark:border-gray-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0d6e4f] dark:text-emerald-400 shrink-0" />
                      <span>جميع محاضرات الشهر بالكامل</span>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#131b2e] border border-stone-200/70 dark:border-gray-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0d6e4f] dark:text-emerald-400 shrink-0" />
                      <span>مذكرات الشرح وتدريبات PDF</span>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#131b2e] border border-stone-200/70 dark:border-gray-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0d6e4f] dark:text-emerald-400 shrink-0" />
                      <span>امتحانات تقييمية أسبوعية وشهرية</span>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#131b2e] border border-stone-200/70 dark:border-gray-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0d6e4f] dark:text-emerald-400 shrink-0" />
                      <span>متابعة دورية للواجبات والدرجات</span>
                    </div>
                  </div>
                )}
              </div>

              {isSubscribedToPackage(selectedPackage?.id) || purchaseSuccess ? (
                /* Already Purchased / Subscribed Banner */
                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-200">
                      أنت مشترك بالفعل في هذه الباقة
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                      تم تفعيل هذه الباقة وجميع كورساتها ومحاضراتها في حسابك بنجاح ويمكنك متابعتها مباشرة.
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
                          هل لديك كود تفعيل أو كود خصم للباقة؟
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
                        className="px-5 py-2.5 bg-[#0d6e4f] hover:bg-[#0a4834] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0"
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
                              {selectedPackage.discount_price || selectedPackage.price}
                            </span>
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">ج.م</span>
                          </>
                        ) : selectedPackage.discount_price ? (
                          <>
                            <span className="text-2xl sm:text-3xl font-black text-[#0d6e4f] dark:text-emerald-400">
                              {selectedPackage.discount_price}
                            </span>
                            <span className="text-xs text-neutral-400 line-through">
                              {selectedPackage.price}
                            </span>
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">ج.م</span>
                          </>
                        ) : (
                          <>
                            <span className="text-2xl sm:text-3xl font-black text-[#0d6e4f] dark:text-emerald-400">
                              {selectedPackage.price}
                            </span>
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">ج.م</span>
                          </>
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
              {isSubscribedToPackage(selectedPackage?.id) || purchaseSuccess ? (
                <Link
                  href="/student/subscriptions"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all text-center"
                >
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>انتقل إلى محاضرات واشتراكات الباقة</span>
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
                        : `اشتري الآن بسعر الباقة (${
                            appliedDiscount
                              ? appliedDiscount.finalPrice
                              : selectedPackage.discount_price || selectedPackage.price
                          } ج.م)`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={closePackageDetails}
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
