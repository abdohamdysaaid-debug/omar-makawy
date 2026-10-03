'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  Play,
  BookOpen,
  ArrowLeft,
  Clock,
  GraduationCap,
  Camera,
  User,
  Package as PackageIcon,
  Video,
  Star,
  Sparkles,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import StudentLayout from '@/components/layout/StudentLayout';
import EmptyState from '@/components/ui/EmptyState';
import { apiClient, resolveMediaUrl } from '@/lib/api';

export interface LatestProductItem {
  id: string;
  type: 'PACKAGE' | 'COURSE';
  title: string;
  description?: string;
  imageUrl?: string;
  price: number;
  discountPrice?: number | null;
  isFeatured?: boolean;
  academicYearName?: string;
  academicYearId?: string;
  createdAt: string;
  courseCount?: number;
  lectureCount?: number;
  url: string;
}

export interface ContinueLearningItem {
  id: string;
  courseId: string;
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
  thumbnailUrl?: string | null;
  durationSeconds?: number;
  courseTitleAr?: string;
  courseTitleEn?: string;
  percentage: number;
  resumePosition: number;
  lastActivityAt?: string;
}

export default function StudentHomeClient() {
  const { student, updateStudentAvatar, isAuthenticated, isSubscribedToCourse, isSubscribedToPackage } = useAuth();
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Content Type Filter: 'all' | 'packages' | 'courses'
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'packages' | 'courses'>('all');

  // Latest Content State
  const [latestItems, setLatestItems] = useState<LatestProductItem[]>([]);
  const [latestLoading, setLatestLoading] = useState(true);
  const [latestError, setLatestError] = useState<string | null>(null);

  // Continue Learning State
  const [continueLearningList, setContinueLearningList] = useState<ContinueLearningItem[]>([]);
  const [continueLoading, setContinueLoading] = useState(true);
  const [continueError, setContinueError] = useState<string | null>(null);

  const academicYearId = student?.academicYearId;
  const academicYearName = student?.academicYearName || 'المرحلة الدراسية';
  const studentFullName = student?.fullName || 'طالبنا العزيز';

  // 1. Fetch Latest Content (Packages + Courses)
  const fetchLatestContent = async () => {
    setLatestLoading(true);
    setLatestError(null);

    try {
      const yearParam = academicYearId ? `academic_year_id=${academicYearId}&` : '';

      // Fetch packages (student-scoped or public)
      let pkgRes: any = null;
      if (isAuthenticated) {
        pkgRes = await apiClient.get<any>(`/packages?${yearParam}limit=6`).catch(() => null);
      }
      if (!pkgRes || (!pkgRes.data && !Array.isArray(pkgRes))) {
        pkgRes = await apiClient.get<any>(`/packages/public?${yearParam}limit=6`).catch(() => null);
      }

      // Fetch courses (student-scoped or public)
      let courseRes: any = null;
      if (isAuthenticated) {
        courseRes = await apiClient.get<any>(`/courses?${yearParam}limit=6`).catch(() => null);
      }
      if (!courseRes || (!courseRes.data && !Array.isArray(courseRes))) {
        courseRes = await apiClient.get<any>(`/courses/public?${yearParam}limit=6`).catch(() => null);
      }

      const rawPackages = Array.isArray(pkgRes?.data) ? pkgRes.data : Array.isArray(pkgRes) ? pkgRes : [];
      const rawCourses = Array.isArray(courseRes?.data) ? courseRes.data : Array.isArray(courseRes) ? courseRes : [];

      const mappedPackages: LatestProductItem[] = rawPackages.map((pkg: any) => ({
        id: pkg.id,
        type: 'PACKAGE' as const,
        title: pkg.title_ar || pkg.title || 'باقة تعليمية',
        description: pkg.description_ar || pkg.description || '',
        imageUrl: pkg.thumbnail_url || pkg.imageUrl,
        price: Number(pkg.price) || 0,
        discountPrice: pkg.discount_price ? Number(pkg.discount_price) : null,
        isFeatured: Boolean(pkg.is_featured || pkg.isPopular),
        academicYearName: pkg.academic_year_name_ar || academicYearName,
        academicYearId: pkg.academic_year_id,
        createdAt: pkg.created_at || pkg.createdAt || new Date().toISOString(),
        courseCount: Array.isArray(pkg.courses) ? pkg.courses.length : 0,
        url: `/student/packages`,
      }));

      const mappedCourses: LatestProductItem[] = rawCourses.map((course: any) => ({
        id: course.id,
        type: 'COURSE' as const,
        title: course.title_ar || course.title || 'كورس تعليمي',
        description: course.description_ar || course.description || '',
        imageUrl: course.thumbnail_url || course.imageUrl,
        price: Number(course.price) || 0,
        discountPrice: course.discount_price ? Number(course.discount_price) : null,
        isFeatured: Boolean(course.is_featured || course.isPopular),
        academicYearName: course.academic_year_name_ar || academicYearName,
        academicYearId: course.academic_year_id,
        createdAt: course.created_at || course.createdAt || new Date().toISOString(),
        lectureCount: course.lecture_count || course.lectureCount || course.lectures_count || 0,
        url: `/courses/${course.id}`,
      }));

      // Combine and sort by publication / creation date descending
      const combined = [...mappedPackages, ...mappedCourses].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setLatestItems(combined);
    } catch (err: any) {
      setLatestError(err?.message || 'تعذر تحميل أحدث المحتويات التعليمية');
      setLatestItems([]);
    } finally {
      setLatestLoading(false);
    }
  };

  // 2. Fetch Continue Learning (Real Watch Progress: 0% < Progress < 90%)
  const fetchContinueLearning = async () => {
    setContinueLoading(true);
    setContinueError(null);

    try {
      let res: any = await apiClient.get<any>('/lectures/continue-learning?limit=6').catch(() => null);

      if (!res || !Array.isArray(res)) {
        // Fallback check on students alias endpoint
        res = await apiClient.get<any>('/students/continue-learning?limit=6').catch(() => null);
      }

      if (Array.isArray(res)) {
        setContinueLearningList(res);
      } else if (res && Array.isArray(res.data)) {
        setContinueLearningList(res.data);
      } else {
        setContinueLearningList([]);
      }
    } catch (err: any) {
      setContinueError(err?.message || 'تعذر تحميل محاضرات استكمال الدراسة');
      setContinueLearningList([]);
    } finally {
      setContinueLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestContent();
    fetchContinueLearning();
  }, [academicYearId, isAuthenticated]);

  // Handle student profile photo upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        updateStudentAvatar(base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter latest items by selected tab
  const filteredLatestItems = latestItems.filter((item) => {
    if (contentTypeFilter === 'all') return true;
    if (contentTypeFilter === 'packages') return item.type === 'PACKAGE';
    if (contentTypeFilter === 'courses') return item.type === 'COURSE';
    return true;
  });

  return (
    <StudentLayout>
      <div className="space-y-8 animate-fade-in font-cairo">
        {/* ============================================================ */}
        {/* 1. STUDENT HOME HERO BANNER */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#064e3b] via-[#0d6e4f] to-[#042f24] text-white py-6 px-6 sm:px-8 shadow-xl shadow-emerald-950/20 border border-emerald-700/40">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left Info Column */}
            <div className="space-y-2 max-w-xl text-start">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-emerald-200 text-xs font-extrabold backdrop-blur-md border border-white/20">
                  <GraduationCap className="w-4 h-4 text-emerald-300" />
                  {academicYearName}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
                مرحباً بك، {studentFullName}
              </h1>

              <p className="text-emerald-100/90 text-xs sm:text-sm font-medium leading-relaxed">
                استكشف الكورسات والباقات التعليمية الجديدة لمستر عمر مكاوي، وطوّر مستواك في اللغة الإنجليزية خطوة بخطوة.
              </p>

              <div className="pt-2 flex items-center gap-3">
                <Link
                  href="/student/courses"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-emerald-50 text-[#064e3b] rounded-2xl font-black text-xs sm:text-sm transition-all shadow-md hover:scale-105 active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-[#064e3b]" />
                  <span>تصفح الكورسات</span>
                </Link>

                <Link
                  href="/student/packages"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-2xl font-bold text-xs sm:text-sm transition-all backdrop-blur-xs border border-white/20"
                >
                  <PackageIcon className="w-4 h-4 text-emerald-300" />
                  <span>الباقات الشهرية</span>
                </Link>
              </div>
            </div>

            {/* Right Student Avatar Photo Upload */}
            <div className="relative shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-3 border-white/40 shadow-2xl overflow-hidden group cursor-pointer bg-emerald-950/70 flex items-center justify-center transition-all hover:scale-105"
                title="اضغط لتغيير الصورة الشخصية"
              >
                {student?.avatarUrl ? (
                  <img
                    src={student.avatarUrl}
                    alt={studentFullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white/80" />
                )}

                {/* Camera Icon Overlay on Hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-bold">
                  <Camera className="w-6 h-6 mb-1 text-emerald-300" />
                  <span>تغيير الصورة</span>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Subtle Accent Lights */}
          <div className="absolute top-0 end-0 -mt-10 -me-10 w-48 h-48 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 start-0 -mb-10 -ms-10 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* ============================================================ */}
        {/* 2. SECTION: أحدث الباقات والكورسات (LATEST CONTENT) */}
        {/* ============================================================ */}
        <section className="space-y-5">
          {/* Section Header with Multi-Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/70 dark:border-gray-800 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-6 bg-[#0d6e4f] rounded-full inline-block" />
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
                  أحدث الباقات والكورسات
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  أحدث المحتويات التعليمية المضافة لمنهجك الدراسي
                </p>
              </div>
            </div>

            {/* Filter Toggle Buttons: [الكل] [الباقات] [الكورسات] */}
            <div className="flex items-center bg-stone-100 dark:bg-stone-900 p-1 rounded-2xl border border-stone-200/80 dark:border-stone-800 shrink-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setContentTypeFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  contentTypeFilter === 'all'
                    ? 'bg-[#0d6e4f] text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                الكل
              </button>

              <button
                type="button"
                onClick={() => setContentTypeFilter('packages')}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  contentTypeFilter === 'packages'
                    ? 'bg-[#0d6e4f] text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                الباقات
              </button>

              <button
                type="button"
                onClick={() => setContentTypeFilter('courses')}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  contentTypeFilter === 'courses'
                    ? 'bg-[#0d6e4f] text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                الكورسات
              </button>
            </div>
          </div>

          {/* Content Body: Loading / Error / Grid / Empty */}
          {latestLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-72 rounded-3xl bg-stone-200/60 dark:bg-stone-800 animate-pulse"
                />
              ))}
            </div>
          ) : latestError ? (
            <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">حدث خطأ أثناء تحميل البيانات</h4>
                  <p className="text-xs text-rose-700 dark:text-rose-300">{latestError}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={fetchLatestContent}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة المحاولة</span>
              </button>
            </div>
          ) : filteredLatestItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredLatestItems.map((item) => {
                const isPackage = item.type === 'PACKAGE';
                const hasDiscount = item.discountPrice !== null && item.discountPrice !== undefined && item.discountPrice > 0 && item.discountPrice < item.price;
                const image = resolveMediaUrl(item.imageUrl);

                const isPurchased = isPackage ? isSubscribedToPackage(item.id) : isSubscribedToCourse(item.id);

                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    className={`group flex flex-col bg-white dark:bg-stone-900 border ${
                      isPurchased
                        ? 'border-emerald-500/80 dark:border-emerald-500 shadow-md'
                        : item.isFeatured
                        ? 'border-[#0d6e4f] dark:border-emerald-500 shadow-lg shadow-[#0d6e4f]/10'
                        : 'border-stone-200/80 dark:border-stone-800 shadow-xs'
                    } rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[#0d6e4f]/15 hover:border-[#0d6e4f] hover:-translate-y-1`}
                  >
                    {/* Top Image Banner */}
                    <div className="relative h-36 bg-gradient-to-br from-[#0d6e4f] via-[#0b5c42] to-[#073b2a] p-4 flex flex-col justify-between text-white overflow-hidden">
                      {image && (
                        <img
                          src={image}
                          alt={item.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      <div className="absolute -end-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />

                      {/* Top Badges */}
                      <div className="flex items-center justify-between relative z-10">
                        <span className="bg-white/20 backdrop-blur-md text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-white/10">
                          {isPackage ? (
                            <PackageIcon className="w-3.5 h-3.5 text-emerald-300" />
                          ) : (
                            <Video className="w-3.5 h-3.5 text-emerald-300" />
                          )}
                          <span>{isPackage ? 'باقة شهرية' : 'كورس تعليمي'}</span>
                        </span>

                        {isPurchased ? (
                          <span className="bg-emerald-600 text-white font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1 border border-emerald-400/30">
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                            تم الشراء
                          </span>
                        ) : item.isFeatured ? (
                          <span className="bg-amber-400 text-stone-950 font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                            <Star className="w-3 h-3 fill-stone-950" />
                            الأكثر طلباً
                          </span>
                        ) : null}
                      </div>

                      {/* Title & Info */}
                      <div className="relative z-10">
                        <h3 className="text-base font-black leading-snug line-clamp-1">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-emerald-100 text-[11px] font-medium line-clamp-1 opacity-90">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4 text-start">
                      {/* Price Pill */}
                      <div className="text-center bg-emerald-50 dark:bg-emerald-950/40 py-2.5 px-3 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                        {isPurchased ? (
                          <div className="flex items-center justify-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-black text-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <span>أنت مشترك بالفعل</span>
                          </div>
                        ) : hasDiscount ? (
                          <div className="flex items-baseline justify-center gap-2">
                            <span className="text-2xl font-black text-[#0d6e4f] dark:text-emerald-400">
                              {item.discountPrice}
                            </span>
                            <span className="text-xs text-neutral-400 line-through">
                              {item.price}
                            </span>
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                              ج.م
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="text-2xl font-black text-[#0d6e4f] dark:text-emerald-400">
                              {item.price}
                            </span>
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 ms-1">
                              ج.م
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Item Details Info */}
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 font-semibold px-1">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-[#0d6e4f] dark:text-emerald-400" />
                          {isPackage
                            ? `${item.courseCount || 'عدة'} كورسات مضمنة`
                            : `${item.lectureCount || 'عدة'} محاضرات متوفرة`}
                        </span>
                        <span className="text-gray-400 text-[11px]">
                          {item.academicYearName}
                        </span>
                      </div>

                      {/* Action Button */}
                      <Link
                        href={item.url}
                        className={`w-full py-2.5 rounded-full font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-sm ${
                          isPurchased
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                            : item.isFeatured
                            ? 'bg-[#0d6e4f] hover:bg-[#0a4834] text-white shadow-[#0d6e4f]/20'
                            : 'bg-[#e2ede5] dark:bg-stone-800 text-[#0d6e4f] dark:text-emerald-400 group-hover:bg-[#0d6e4f] group-hover:text-white hover:bg-[#0d6e4f] hover:text-white'
                        }`}
                      >
                        {isPurchased ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>تم الشراء</span>
                          </>
                        ) : (
                          <>
                            <span>{isPackage ? 'تفاصيل الباقة' : 'تفاصيل الكورس'}</span>
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </>
                        )}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon="Package"
              title="لا توجد باقات أو كورسات حالياً"
              description="لم يتم إضافة محتويات تعليمية جديدة لهذا القسم حالياً. تابعنا باستمرار للاطلاع على كل جديد."
              actionText="تصفح جميع الكورسات"
              actionUrl="/student/courses"
            />
          )}
        </section>

        {/* ============================================================ */}
        {/* 3. SECTION: استكمل دراستك (CONTINUE LEARNING) */}
        {/* ============================================================ */}
        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-gray-200/70 dark:border-gray-800 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-6 bg-[#0d6e4f] rounded-full inline-block" />
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
                  استكمل دراستك
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  المحاضرات التي بدأت مشاهدتها لمتابعة دراستك من حيث توقفت
                </p>
              </div>
            </div>

            {continueLearningList.length > 0 && (
              <Link
                href="/student/subscriptions"
                className="text-xs font-bold text-[#0d6e4f] dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>جميع اشتراكاتي</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {continueLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-44 rounded-3xl bg-stone-200/60 dark:bg-stone-800 animate-pulse"
                />
              ))}
            </div>
          ) : continueError ? (
            <div className="p-6 rounded-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">حدث خطأ أثناء تحميل التقدم</h4>
                  <p className="text-xs text-rose-700 dark:text-rose-300">{continueError}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={fetchContinueLearning}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة المحاولة</span>
              </button>
            </div>
          ) : continueLearningList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {continueLearningList.map((item) => {
                const lectureUrl = item.courseId
                  ? `/courses/${item.courseId}/lectures/${item.id}`
                  : `/student/lectures/${item.id}`;

                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group text-start"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-[#0d6e4f] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50 shadow-xs">
                        <Play className="w-5 h-5 fill-current ms-0.5" />
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <span className="text-[10px] font-extrabold text-[#0d6e4f] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md inline-block truncate max-w-full">
                          {item.courseTitleAr || 'كورس تعليمي'}
                        </span>
                        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                          {item.titleAr}
                        </h3>
                        {item.descriptionAr && (
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                            {item.descriptionAr}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar & Percentage */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-gray-500 dark:text-gray-400">نسبة المشاهدة</span>
                        <span className="text-[#0d6e4f] dark:text-emerald-400">{item.percentage}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-[#0d6e4f] dark:bg-emerald-500 rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Resume Watching Button */}
                    <Link
                      href={lectureUrl}
                      className="w-full py-2.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-[#0d6e4f] hover:text-white dark:hover:bg-[#0d6e4f] text-[#0d6e4f] dark:text-emerald-300 rounded-2xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 border border-emerald-200/60 dark:border-emerald-900/50 shadow-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>متابعة المشاهدة</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon="BookOpen"
              title="ابدأ أول محاضرة لك"
              description="لم تقم ببدء مشاهدة أي محاضرة بعد. استكشف كورساتك المتاحة واشتراكاتك للبدء في المذاكرة وتحقيق التفوق."
              actionText="تصفح الكورسات"
              actionUrl="/student/courses"
            />
          )}
        </section>
      </div>
    </StudentLayout>
  );
}
