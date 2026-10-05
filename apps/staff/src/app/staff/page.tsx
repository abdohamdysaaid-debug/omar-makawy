'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  GraduationCap,
  BookOpen,
  Video,
  Package,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Send,
  Headset,
  BookMarked,
  Clock,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useStaffAuth, staffApiClient } from '@/context/StaffAuthContext';
import { useAcademicYearScope } from '@/context/AcademicYearContext';
import { RoleBadge } from '@/components/ui/RoleBadge';

interface DashboardStatsData {
  students: {
    total: number;
    active: number;
    inactive: number;
    distribution: Array<{
      academic_year_id: string;
      academic_year_name_ar: string;
      academic_year_name_en: string;
      student_count: number;
    }>;
  };
  content: {
    courses_count: number;
    lectures_count: number;
    packages_count: number;
    exams_count: number;
  };
  activity: {
    active_sessions_today: number;
    total_orders: number;
    pending_orders: number;
    total_tickets: number;
    open_tickets: number;
  };
}

export default function StaffDashboardPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { user, role } = useStaffAuth();
  const { availableYears, activeAcademicYearId } = useAcademicYearScope();

  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const yearQuery = activeAcademicYearId ? `?academic_year_id=${activeAcademicYearId}` : '';
      const res: any = await staffApiClient.get(`/admin/analytics/dashboard-stats${yearQuery}`).catch(() => null);

      if (res && res.students && res.content) {
        setStats(res);
      } else {
        // Graceful fallback from individual endpoints if needed
        const [studentsRes, overviewRes]: [any, any] = await Promise.all([
          staffApiClient.get(`/admin/analytics/students${yearQuery}`).catch(() => null),
          staffApiClient.get(`/admin/analytics/overview${yearQuery}`).catch(() => null),
        ]);

        const totalSt = studentsRes?.total_students || overviewRes?.total_students || 0;
        const activeSt = studentsRes?.active_students || totalSt;
        const dist = Array.isArray(studentsRes?.distribution_by_academic_year)
          ? studentsRes.distribution_by_academic_year
          : [];

        setStats({
          students: {
            total: totalSt,
            active: activeSt,
            inactive: Math.max(0, totalSt - activeSt),
            distribution: dist,
          },
          content: {
            courses_count: overviewRes?.active_courses || 0,
            lectures_count: 0,
            packages_count: 0,
            exams_count: 0,
          },
          activity: {
            active_sessions_today: overviewRes?.active_sessions_today || 0,
            total_orders: overviewRes?.total_orders || 0,
            pending_orders: overviewRes?.pending_orders || 0,
            total_tickets: 0,
            open_tickets: 0,
          },
        });
      }
    } catch (err: any) {
      setError(err?.message || (isAr ? 'تعذر تحميل الإحصائيات' : 'Failed to load statistics'));
    } finally {
      setLoading(false);
    }
  }, [activeAcademicYearId, isAr]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const activeYearObj = availableYears.find((y) => y.id === activeAcademicYearId);
  const activeYearName = isAr ? activeYearObj?.name_ar : activeYearObj?.name_en;

  const totalStudents = stats?.students.total || 0;
  const activeStudents = stats?.students.active || 0;
  const activePercentage = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. HERO WELCOME & STATUS BANNER                          */}
      {/* ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl border border-neutral-800/80 bg-gradient-to-br from-[#0c100d] via-[#101712] to-[#080d09] p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/20">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl text-start">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 text-xs font-bold border border-emerald-800/60 shadow-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{isAr ? 'المنصة تعمل بكفاءة عالية' : 'Platform Active & Stable'}</span>
              </span>

              {activeYearName && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/50 text-neutral-300 text-xs font-medium border border-neutral-800">
                  <span>{activeYearName}</span>
                </span>
              )}

              {role && <RoleBadge role={role} size="sm" />}
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{isAr ? `أهلاً بك، ${user?.full_name || 'مستر عمر مكاوي'}` : `Welcome, ${user?.full_name || 'Mr. Omar Meckawy'}`}</span>
              <Sparkles className="h-5 w-5 text-amber-400 inline shrink-0" />
            </h1>

            <p className="text-xs sm:text-sm text-neutral-400 font-medium leading-relaxed">
              {isAr
                ? 'لوحة التحكم المركزية لمتابعة نشاط الطلاب، أداء المحاضرات، وتوزيع المراحل الدراسية.'
                : 'Central management workspace for monitoring student activity, lecture analytics, and academic distribution.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={fetchStats}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-neutral-800 bg-[#141a15] px-4 py-2.5 text-xs font-bold text-neutral-200 hover:bg-neutral-800 hover:border-emerald-700 transition-colors disabled:opacity-50 w-full sm:w-auto"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
              <span>{isAr ? 'تحديث الإحصائيات' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Ambient Glows */}
        <div className="absolute top-0 end-0 -mt-10 -me-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 start-0 -mb-10 -ms-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ======================================================== */}
      {/* 2. CORE STUDENT ANALYTICS CARDS                          */}
      {/* ======================================================== */}
      <div>
        <div className="flex items-center justify-between mb-3.5 px-1">
          <h2 className="text-sm font-bold text-neutral-200 flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-400" />
            <span>{isAr ? 'إحصائيات الطلاب والنشاط' : 'Student & Audience Analytics'}</span>
          </h2>
          <Link
            href="/staff/students"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
          >
            <span>{isAr ? 'إدارة الطلاب' : 'Manage Students'}</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Total Enrolled Students */}
          <div className="rounded-3xl border border-neutral-800/90 bg-[#0e120f] p-5 shadow-sm hover:border-emerald-700/60 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400">{isAr ? 'إجمالي الطلاب المسجلين' : 'Total Enrolled Students'}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-white">{loading ? '...' : totalStudents.toLocaleString()}</span>
              <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span>{isAr ? 'مسجلين في المنصة' : 'Enrolled on platform'}</span>
              </p>
            </div>
          </div>

          {/* Active Students */}
          <div className="rounded-3xl border border-neutral-800/90 bg-[#0e120f] p-5 shadow-sm hover:border-emerald-700/60 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400">{isAr ? 'الطلاب النشطين' : 'Active Students'}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
                <UserCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-emerald-400">{loading ? '...' : activeStudents.toLocaleString()}</span>
              <p className="text-[11px] text-neutral-500 mt-1">
                {isAr ? `نسبة النشاط: ${activePercentage}% من الإجمالي` : `${activePercentage}% active rate`}
              </p>
            </div>
          </div>

          {/* Active Sessions Today */}
          <div className="rounded-3xl border border-neutral-800/90 bg-[#0e120f] p-5 shadow-sm hover:border-cyan-700/60 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400">{isAr ? 'النشاط اليومي (آخر 24 ساعة)' : 'Active Sessions Today'}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
                <Activity className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-cyan-400">{loading ? '...' : (stats?.activity.active_sessions_today || 0).toLocaleString()}</span>
              <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1 font-mono">
                <Clock className="h-3 w-3" />
                <span>{isAr ? 'جلسة مذاكرة نشطة' : 'active sessions'}</span>
              </p>
            </div>
          </div>

          {/* Inactive / Blocked Students */}
          <div className="rounded-3xl border border-neutral-800/90 bg-[#0e120f] p-5 shadow-sm hover:border-neutral-700 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400">{isAr ? 'حسابات غير نشطة' : 'Inactive Accounts'}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-neutral-300">{loading ? '...' : (stats?.students.inactive || 0).toLocaleString()}</span>
              <p className="text-[11px] text-neutral-500 mt-1">
                {isAr ? 'تحتاج تفعيل أو مراجعة' : 'Need review or reactivation'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. DISTRIBUTION BY ACADEMIC YEAR (توزيع المراحل الدراسية)  */}
      {/* ======================================================== */}
      <div className="rounded-3xl border border-neutral-800/90 bg-[#0e120f] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {isAr ? 'توزيع الطلاب حسب المراحل الدراسية' : 'Students Distribution by Academic Stage'}
              </h3>
              <p className="text-[11px] text-neutral-400">
                {isAr ? 'أعداد الطلاب ونسب التسجيل في كل صف دراسي' : 'Enrolled students count and percentage per grade'}
              </p>
            </div>
          </div>

          <Link
            href="/staff/students"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>{isAr ? 'عرض قائمة الطلاب' : 'View Students List'}</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-neutral-400 text-xs font-bold">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto text-emerald-400 mb-2" />
            <span>{isAr ? 'جاري تحميل التوزيع...' : 'Loading distribution...'}</span>
          </div>
        ) : stats?.students.distribution && stats.students.distribution.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.students.distribution.map((stage) => {
              const count = Number(stage.student_count) || 0;
              const percent = totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0;
              const stageName = isAr ? stage.academic_year_name_ar : stage.academic_year_name_en || stage.academic_year_name_ar;

              return (
                <div
                  key={stage.academic_year_id}
                  className="rounded-2xl border border-neutral-800 bg-[#121713] p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-200 line-clamp-1">{stageName}</span>
                    <span className="rounded-full bg-emerald-950 border border-emerald-800 px-2 py-0.5 text-[10px] font-black text-emerald-300">
                      {percent}%
                    </span>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-white">{count.toLocaleString()}</span>
                      <span className="text-[11px] font-bold text-neutral-400">{isAr ? 'طالب' : 'students'}</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden mt-2">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, percent)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-neutral-500 text-xs">
            {isAr ? 'لا توجد بيانات توزيع متاحة حالياً.' : 'No distribution data available.'}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 4. EDUCATIONAL CONTENT & LMS STATS (المحتوى التعليمي)     */}
      {/* ======================================================== */}
      <div>
        <div className="flex items-center justify-between mb-3.5 px-1">
          <h2 className="text-sm font-bold text-neutral-200 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-emerald-400" />
            <span>{isAr ? 'إحصائيات المحتوى والعملية التعليمية' : 'Educational Content & LMS Metrics'}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Courses */}
          <Link
            href="/staff/courses"
            className="rounded-3xl border border-neutral-800/90 bg-[#0e120f] p-5 shadow-sm hover:border-emerald-600 hover:bg-[#121813] transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400">{isAr ? 'الكورسات التعليمية' : 'Active Courses'}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 group-hover:scale-110 transition-transform">
                <BookOpen className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">{loading ? '...' : (stats?.content.courses_count || 0)}</span>
              <span className="text-xs font-bold text-emerald-400 group-hover:underline flex items-center gap-0.5">
                {isAr ? 'إدارة الكورسات' : 'Manage'}
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </Link>

          {/* Packages */}
          <Link
            href="/staff/packages"
            className="rounded-3xl border border-neutral-800/90 bg-[#0e120f] p-5 shadow-sm hover:border-emerald-600 hover:bg-[#121813] transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400">{isAr ? 'الباقات الشهرية' : 'Available Packages'}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 group-hover:scale-110 transition-transform">
                <Package className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">{loading ? '...' : (stats?.content.packages_count || 0)}</span>
              <span className="text-xs font-bold text-emerald-400 group-hover:underline flex items-center gap-0.5">
                {isAr ? 'إدارة الباقات' : 'Manage'}
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </Link>

          {/* Lectures */}
          <Link
            href="/staff/lectures"
            className="rounded-3xl border border-neutral-800/90 bg-[#0e120f] p-5 shadow-sm hover:border-emerald-600 hover:bg-[#121813] transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400">{isAr ? 'المحاضرات والشروحات' : 'Published Lectures'}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 group-hover:scale-110 transition-transform">
                <Video className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">{loading ? '...' : (stats?.content.lectures_count || 0)}</span>
              <span className="text-xs font-bold text-emerald-400 group-hover:underline flex items-center gap-0.5">
                {isAr ? 'إدارة المحاضرات' : 'Manage'}
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </Link>

          {/* Exams */}
          <Link
            href="/staff/exams"
            className="rounded-3xl border border-neutral-800/90 bg-[#0e120f] p-5 shadow-sm hover:border-emerald-600 hover:bg-[#121813] transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400">{isAr ? 'الامتحانات التفاعلية' : 'Active Exams'}</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">{loading ? '...' : (stats?.content.exams_count || 0)}</span>
              <span className="text-xs font-bold text-emerald-400 group-hover:underline flex items-center gap-0.5">
                {isAr ? 'بنك الامتحانات' : 'Manage'}
                <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. QUICK ACTIONS & OPERATIONAL LINKS (روابط الإنجاز السريع) */}
      {/* ======================================================== */}
      <div className="rounded-3xl border border-neutral-800/90 bg-[#0e120f] p-6 shadow-sm">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>{isAr ? 'الإجراءات السريعة' : 'Quick Actions'}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/staff/courses"
            className="rounded-2xl border border-neutral-800 bg-[#121713] p-3.5 text-center hover:border-emerald-600 hover:bg-emerald-950/30 transition-all flex flex-col items-center gap-2 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 group-hover:scale-110 transition-transform">
              <Plus className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-neutral-200">{isAr ? 'إضافة كورس' : 'Add Course'}</span>
          </Link>

          <Link
            href="/staff/packages"
            className="rounded-2xl border border-neutral-800 bg-[#121713] p-3.5 text-center hover:border-emerald-600 hover:bg-emerald-950/30 transition-all flex flex-col items-center gap-2 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 group-hover:scale-110 transition-transform">
              <Package className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-neutral-200">{isAr ? 'إضافة باقة' : 'Add Package'}</span>
          </Link>

          <Link
            href="/staff/lectures"
            className="rounded-2xl border border-neutral-800 bg-[#121713] p-3.5 text-center hover:border-emerald-600 hover:bg-emerald-950/30 transition-all flex flex-col items-center gap-2 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 group-hover:scale-110 transition-transform">
              <Video className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-neutral-200">{isAr ? 'رفع محاضرة' : 'Upload Lecture'}</span>
          </Link>

          <Link
            href="/staff/exams"
            className="rounded-2xl border border-neutral-800 bg-[#121713] p-3.5 text-center hover:border-emerald-600 hover:bg-emerald-950/30 transition-all flex flex-col items-center gap-2 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 group-hover:scale-110 transition-transform">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-neutral-200">{isAr ? 'إنشاء امتحان' : 'Create Exam'}</span>
          </Link>

          <Link
            href="/staff/notifications"
            className="rounded-2xl border border-neutral-800 bg-[#121713] p-3.5 text-center hover:border-emerald-600 hover:bg-emerald-950/30 transition-all flex flex-col items-center gap-2 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 group-hover:scale-110 transition-transform">
              <Send className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-neutral-200">{isAr ? 'إرسال إشعار' : 'Push Notification'}</span>
          </Link>

          <Link
            href="/staff/students"
            className="rounded-2xl border border-neutral-800 bg-[#121713] p-3.5 text-center hover:border-emerald-600 hover:bg-emerald-950/30 transition-all flex flex-col items-center gap-2 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 group-hover:scale-110 transition-transform">
              <Users className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-neutral-200">{isAr ? 'دليل الطلاب' : 'Students Directory'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
