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
  PlayCircle,
  Clock,
  CheckCircle2,
  BookOpen,
  ChevronRight,
  Sparkles,
  Video,
  FileText,
  AlertCircle,
  Calendar,
  Layers,
  ArrowLeft,
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

  const { student, isAuthenticated, isSubscribedToPackage } = useAuth();
  const [activeTab, setActiveTab] = useState<'lectures' | 'courses'>('lectures');
  const [pkg, setPkg] = useState<any | null>(null);
  const [lectures, setLectures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isPurchased = isSubscribedToPackage(effectivePackageId);

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
        const pkgLecturesRes: any = await apiClient
          .get<any>(`/lectures?package_id=${effectivePackageId}&limit=100`)
          .catch(() => null);

        let lecturesList: any[] = [];
        if (pkgLecturesRes && Array.isArray(pkgLecturesRes.data)) {
          lecturesList = pkgLecturesRes.data;
        } else if (Array.isArray(pkgLecturesRes)) {
          lecturesList = pkgLecturesRes;
        }

        // 3. If no direct lectures found but package has member courses, load lectures from courses
        if (lecturesList.length === 0 && apiPkg?.courses && Array.isArray(apiPkg.courses) && apiPkg.courses.length > 0) {
          const courseLecturesPromises = apiPkg.courses.map((c: any) =>
            apiClient.get<any[]>(`/courses/${c.course_id || c.id}/lectures`).catch(() => [])
          );
          const results = await Promise.all(courseLecturesPromises);
          const aggregated: any[] = [];
          const seenIds = new Set<string>();

          results.forEach((cList, idx) => {
            const courseObj = apiPkg.courses[idx];
            if (Array.isArray(cList)) {
              cList.forEach((lec) => {
                if (lec && !seenIds.has(String(lec.id))) {
                  seenIds.add(String(lec.id));
                  aggregated.push({
                    ...lec,
                    course_title: courseObj?.title_ar || courseObj?.title || lec.course_title,
                    course_id: courseObj?.course_id || courseObj?.id || lec.course_id,
                  });
                }
              });
            }
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
  const memberCourses = Array.isArray(pkg.courses) ? pkg.courses : [];
  const lecturesCount = lectures.length;

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in font-cairo">
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link
            href="/student/packages"
            className="hover:text-[#0d6e4f] dark:hover:text-emerald-400 transition-colors flex items-center gap-1 font-semibold"
          >
            <span>الباقات الشهرية</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 dark:text-white font-bold truncate">{title}</span>
        </div>

        {/* Package Hero Overview Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Cover / Icon */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-[#0d6e4f] to-[#073b2a] text-white flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-md relative overflow-hidden">
            {image ? (
              <img src={image} alt={title} className="w-full h-full object-cover" />
            ) : (
              <PackageIcon className="w-12 h-12 text-emerald-300" />
            )}
            <div className="absolute -end-4 -bottom-4 w-16 h-16 rounded-full bg-white/10 pointer-events-none" />
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-[#0d6e4f] dark:text-emerald-300 text-xs font-black border border-emerald-300 dark:border-emerald-800">
                {pkg.academic_year_name_ar || 'باقة معتمدة'}
              </span>

              {isPurchased && (
                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تم الشراء ومفعلة بحسابك</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
              {title}
            </h1>

            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">
                {description}
              </p>
            )}

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-500 dark:text-gray-400 pt-2">
              <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-xl">
                <Video className="w-4 h-4 text-[#0d6e4f] dark:text-emerald-400" />
                <span>عدد المحاضرات: {lecturesCount}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-xl">
                <BookOpen className="w-4 h-4 text-[#0d6e4f] dark:text-emerald-400" />
                <span>الكورسات المضمنة: {memberCourses.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-gray-200/80 dark:border-gray-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('lectures')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'lectures'
                ? 'bg-[#0d6e4f] text-white shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 text-gray-600 dark:text-gray-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>المحاضرات ({lecturesCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('courses')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'courses'
                ? 'bg-[#0d6e4f] text-white shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 text-gray-600 dark:text-gray-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>الكورسات المضمنة ({memberCourses.length})</span>
          </button>
        </div>

        {/* Tab 1: Lectures List */}
        {activeTab === 'lectures' && (
          <div className="space-y-4">
            {lecturesCount > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {lectures.map((lec: any, index: number) => {
                  const lecTitle = lec.title_ar || lec.title || `محاضرة ${index + 1}`;
                  const lecDescription = lec.description_ar || lec.description;
                  const lecImage = resolveMediaUrl(lec.thumbnail_url || lec.imageUrl);
                  const courseId = lec.course_id || (memberCourses[0]?.course_id || memberCourses[0]?.id);
                  const playUrl = `/student/lectures/detail?id=${lec.id}`;

                  const durationMinutes = lec.duration_seconds
                    ? Math.round(lec.duration_seconds / 60)
                    : lec.duration || '45';

                  return (
                    <div
                      key={lec.id || index}
                      className="group rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-xl hover:border-[#0d6e4f] dark:hover:border-emerald-500/50 transition-all duration-300 overflow-hidden flex flex-col justify-between"
                    >
                      {/* Top Thumbnail */}
                      <div className="relative h-44 bg-gradient-to-br from-emerald-900 via-stone-900 to-black flex items-center justify-center p-4 overflow-hidden text-white">
                        {lecImage ? (
                          <img
                            src={lecImage}
                            alt={lecTitle}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-70"
                          />
                        ) : (
                          <Video className="w-12 h-12 text-emerald-400/80 group-hover:scale-110 transition-transform" />
                        )}

                        <div className="absolute top-3 start-3">
                          <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md text-emerald-200 text-xs font-bold rounded-full border border-emerald-400/20 shadow-xs">
                            محاضرة {index + 1}
                          </span>
                        </div>

                        <div className="absolute bottom-3 end-3">
                          <span className="px-2 py-0.5 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold rounded-lg flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-400" />
                            <span>{durationMinutes} دقيقة</span>
                          </span>
                        </div>

                        {/* Play Overlay Icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-[#0d6e4f]/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                            <Play className="w-5 h-5 fill-white ms-0.5" />
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          {lec.course_title && (
                            <span className="text-[11px] font-bold text-[#0d6e4f] dark:text-emerald-400 block truncate">
                              كورس: {lec.course_title}
                            </span>
                          )}
                          <h3 className="font-extrabold text-base text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#0d6e4f] dark:group-hover:text-emerald-400 transition-colors">
                            {lecTitle}
                          </h3>
                          {lecDescription && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                              {lecDescription}
                            </p>
                          )}
                        </div>

                        <Link
                          href={playUrl}
                          className="w-full py-2.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-[#0d6e4f] hover:text-white text-[#0d6e4f] dark:text-emerald-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-emerald-200/60 dark:border-emerald-900/50 shadow-xs"
                        >
                          <PlayCircle className="w-4 h-4" />
                          <span>مشاهدة المحاضرة الآن</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#0d6e4f] dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-100 dark:border-emerald-900/50">
                  <Video className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  المحاضرات (0)
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                  لا توجد محاضرات مضافة في هذه الباقة حالياً (0). سيتم رفع المحاضرات وتحديث المحتوى تباعاً.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Included Courses */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            {memberCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {memberCourses.map((c: any, idx: number) => {
                  const courseId = c.course_id || c.id;
                  const cTitle = c.title_ar || c.title || `كورس ${idx + 1}`;
                  return (
                    <div
                      key={courseId || idx}
                      className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-[#0d6e4f] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <h4 className="font-extrabold text-base text-gray-900 dark:text-white truncate">
                            {cTitle}
                          </h4>
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            مضمن في اشتراك الباقة
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/student/courses/detail?id=${courseId}`}
                        className="w-full py-2.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-[#0d6e4f] hover:text-white text-[#0d6e4f] dark:text-emerald-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 border border-emerald-200/60 dark:border-emerald-900/50"
                      >
                        <span>الدخول إلى الكورس</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#0d6e4f] dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  الكورسات المضمنة (0)
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  هذه الباقة تمنح وصولاً شاملاً لكافة محاضرات الشهر مباشرة.
                </p>
              </div>
            )}
          </div>
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
