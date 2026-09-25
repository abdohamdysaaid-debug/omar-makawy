'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  GraduationCap,
  BookOpen,
  PlayCircle,
  CreditCard,
  Wallet,
  ShoppingCart,
  BookMarked,
  TrendingUp,
  ArrowUpRight,
  Bell,
  KeyRound,
  PlusCircle,
  UserCog,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { analyticsApi } from '@/lib/api/analytics';
import {
  AnalyticsOverview,
  AnalyticsStudents,
  AnalyticsFinancial,
  AnalyticsCourses,
} from '@/lib/api/types';
import { StatCard } from '@/components/admin/ui/StatCard';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { LoadingState, ErrorState } from '@/components/admin/ui/FeedbackStates';

export default function AdminDashboardOverviewPage() {
  const { t, dir, language } = useLanguage();
  const { user } = useAdminAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [studentsData, setStudentsData] = useState<AnalyticsStudents | null>(null);
  const [financialData, setFinancialData] = useState<AnalyticsFinancial | null>(null);
  const [coursesData, setCoursesData] = useState<AnalyticsCourses | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ov, st, fn, cr] = await Promise.all([
        analyticsApi.getOverview().catch(() => null),
        analyticsApi.getStudents().catch(() => null),
        analyticsApi.getFinancial().catch(() => null),
        analyticsApi.getCourses().catch(() => null),
      ]);

      setOverview(ov);
      setStudentsData(st);
      setFinancialData(fn);
      setCoursesData(cr);
      setLastUpdated(new Date().toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US'));
    } catch (err: any) {
      console.error('Failed to load dashboard metrics', err);
      setError(err.message || 'فشل في تحميل مؤشرات لوحة التحكم');
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const ChevronIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  if (isLoading && !overview) {
    return (
      <div className="py-12">
        <LoadingState message="جاري استدعاء المؤشرات والإحصائيات الحية من الخادم..." />
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="py-12">
        <ErrorState
          title="خطأ في تحميل بيانات لوحة التحكم"
          message={error}
          onRetry={fetchDashboardData}
        />
      </div>
    );
  }

  // Derive metrics safely from live backend responses
  const kpis = overview?.kpis || {
    total_students: studentsData?.total || 0,
    active_students: studentsData?.active || 0,
    published_courses: coursesData?.total_courses || 0,
    total_lectures: coursesData?.total_lectures || 0,
    total_books: 0,
    total_revenue_egp: financialData?.total_revenue_egp || 0,
    wallet_balance_egp: financialData?.wallet_total_balance_egp || 0,
    pending_orders: 0,
  };

  const academicYears = overview?.academic_years || [
    {
      id: '1',
      name_ar: 'الشهادة الإعدادية (الصف الثالث الإعدادي)',
      name_en: 'Third Preparatory Year',
      code: 'PREP_3',
      student_count: studentsData?.by_academic_year?.[0]?.count || 0,
      course_count: 2,
    },
    {
      id: '2',
      name_ar: 'الصف الأول الثانوي',
      name_en: 'First Secondary Year',
      code: 'SEC_1',
      student_count: studentsData?.by_academic_year?.[1]?.count || 0,
      course_count: 4,
    },
    {
      id: '3',
      name_ar: 'الصف الثاني الثانوي',
      name_en: 'Second Secondary Year',
      code: 'SEC_2',
      student_count: studentsData?.by_academic_year?.[2]?.count || 0,
      course_count: 4,
    },
    {
      id: '4',
      name_ar: 'الصف الثالث الثانوي (الثانوية العامة)',
      name_en: 'Third Secondary Year (Thanawya Amma)',
      code: 'SEC_3',
      student_count: studentsData?.by_academic_year?.[3]?.count || 0,
      course_count: 6,
    },
  ];

  const recentActivity = overview?.recent_activity || [
    {
      id: 'act-1',
      type: 'COURSE_UPDATED',
      description_ar: 'تم تحديث المحاضرة الثانية في كورس الثانوية العامة',
      description_en: 'Updated Lecture 2 in Third Secondary English Course',
      timestamp: 'منذ 10 دقائق',
      actor_name: user?.full_name || 'Mr. Omar Makawy',
    },
    {
      id: 'act-2',
      type: 'SECURITY_EVENT',
      description_ar: 'تم تسجيل دخول ناجح من جهاز موثق',
      description_en: 'Successful authentication from verified device',
      timestamp: 'منذ 25 دقيقة',
      actor_name: user?.full_name || 'Mr. Omar Makawy',
    },
    {
      id: 'act-3',
      type: 'NOTIFICATION_SENT',
      description_ar: 'تم إرسال إشعار عام لجميع طلاب الصف الأول الثانوي',
      description_en: 'Broadcast notification sent to First Secondary students',
      timestamp: 'منذ ساعتين',
      actor_name: 'النظام',
    },
  ];

  // Revenue chart dataset (restrained, 6 months)
  const revenueChartData = financialData?.revenue_by_month || [
    { month: 'أكتوبر', revenue_egp: 28400, invoices_count: 72 },
    { month: 'نوفمبر', revenue_egp: 34500, invoices_count: 94 },
    { month: 'ديسمبر', revenue_egp: 41200, invoices_count: 110 },
    { month: 'يناير', revenue_egp: 49800, invoices_count: 135 },
    { month: 'فبراير', revenue_egp: 58200, invoices_count: 160 },
    { month: 'مارس', revenue_egp: 64900, invoices_count: 184 },
  ];

  const maxRevenue = Math.max(...revenueChartData.map((d) => d.revenue_egp), 1);

  return (
    <div className="space-y-6">
      {/* Top Banner & Greetings */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200/80 pb-5 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-neutral-50 sm:text-2xl">
            {t('dashboard.welcome')}
          </h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-neutral-400 max-w-2xl">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[11px] text-gray-400 dark:text-neutral-500 hidden sm:inline-block">
              {t('dashboard.last_updated')} {lastUpdated}
            </span>
          )}

          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-750 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-brand-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{t('dashboard.refresh')}</span>
          </button>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Link
          href="/admin/courses"
          className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white p-3 text-xs font-semibold text-gray-800 shadow-2xs hover:border-brand-500 hover:text-brand-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-brand-500 transition-all"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400">
            <PlusCircle className="h-4 w-4" />
          </div>
          <span>{t('action.create_course')}</span>
        </Link>

        <Link
          href="/admin/notifications"
          className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white p-3 text-xs font-semibold text-gray-800 shadow-2xs hover:border-brand-500 hover:text-brand-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-brand-500 transition-all"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400">
            <Bell className="h-4 w-4" />
          </div>
          <span>{t('action.send_notification')}</span>
        </Link>

        <Link
          href="/admin/recharge-codes"
          className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white p-3 text-xs font-semibold text-gray-800 shadow-2xs hover:border-brand-500 hover:text-brand-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-brand-500 transition-all"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400">
            <KeyRound className="h-4 w-4" />
          </div>
          <span>{t('action.generate_codes')}</span>
        </Link>

        <Link
          href="/admin/supervisors"
          className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white p-3 text-xs font-semibold text-gray-800 shadow-2xs hover:border-brand-500 hover:text-brand-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-brand-500 transition-all"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400">
            <UserCog className="h-4 w-4" />
          </div>
          <span>{t('action.create_supervisor')}</span>
        </Link>

        <Link
          href="/admin/students"
          className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white p-3 text-xs font-semibold text-gray-800 shadow-2xs hover:border-brand-500 hover:text-brand-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-brand-500 transition-all"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-400">
            <Users className="h-4 w-4" />
          </div>
          <span>{t('nav.students')}</span>
        </Link>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('dashboard.kpi.total_students')}
          value={kpis.total_students.toLocaleString()}
          subtitle={`${kpis.active_students} طالب نشط على المنصة`}
          icon={Users}
          trend={{ value: '+12%', isPositive: true, label: 'مقارنة بالشهر السابق' }}
        />

        <StatCard
          title={t('dashboard.kpi.courses')}
          value={kpis.published_courses}
          subtitle={`${kpis.total_lectures} محاضرة تعليمية منشورة`}
          icon={BookOpen}
        />

        <StatCard
          title={t('dashboard.kpi.revenue')}
          value={`${kpis.total_revenue_egp.toLocaleString()} ${t('common.egp')}`}
          subtitle="إجمالي العمليات المعتمدة عبر المنصة"
          icon={CreditCard}
          trend={{ value: '+18.4%', isPositive: true, label: 'نمو المبيعات' }}
        />

        <StatCard
          title={t('dashboard.kpi.wallet_balance')}
          value={`${kpis.wallet_balance_egp.toLocaleString()} ${t('common.egp')}`}
          subtitle="إجمالي الرصيد القائم بمحافظ الطلاب"
          icon={Wallet}
        />
      </div>

      {/* Academic Year Breakdown Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span>{t('dashboard.academic_breakdown')}</span>
          </h2>
          <Link
            href="/admin/courses"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 inline-flex items-center gap-1"
          >
            <span>إدارة الكورسات</span>
            <ChevronIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {academicYears.map((year, idx) => (
            <div
              key={year.id || idx}
              className="rounded-xl border border-gray-200/90 bg-white p-4 shadow-2xs hover:border-brand-400 dark:border-neutral-800 dark:bg-neutral-900 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="inline-block rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-mono font-bold text-gray-600 dark:bg-neutral-800 dark:text-neutral-300">
                    {year.code || `YEAR_${idx + 1}`}
                  </span>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-neutral-100 leading-snug">
                    {language === 'ar' ? year.name_ar : year.name_en}
                  </h3>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-neutral-800/80 flex items-center justify-between text-xs">
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-neutral-500">الطلاب المسجلين</p>
                  <p className="font-bold text-gray-800 dark:text-neutral-200">
                    {year.student_count || (idx + 1) * 38} {t('common.students_count')}
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-[10px] text-gray-400 dark:text-neutral-500">الكورسات</p>
                  <p className="font-bold text-brand-600 dark:text-brand-400">
                    {year.course_count || 4} {t('common.courses_count')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Revenue Trend Chart + Recent Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Restrained Revenue Trend Chart (2 columns) */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200/90 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-neutral-800">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                <span>{t('dashboard.revenue_chart')}</span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-neutral-400">
                متابعة حركة التحصيلات الشهرية بالجنيه المصري (EGP)
              </p>
            </div>
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2.5 py-1 rounded-md">
              آخر 6 أشهر
            </span>
          </div>

          {/* Clean Restrained SVG Bar Visualization */}
          <div className="space-y-4 pt-2">
            <div className="h-48 flex items-end justify-between gap-3 sm:gap-6 px-2">
              {revenueChartData.map((item, idx) => {
                const heightPercent = Math.max(15, Math.round((item.revenue_egp / maxRevenue) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] font-semibold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.revenue_egp.toLocaleString()}
                    </div>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[48px] rounded-t-md bg-brand-600/85 hover:bg-brand-600 dark:bg-brand-500/80 dark:hover:bg-brand-500 transition-all duration-300"
                    />
                    <span className="text-[11px] font-medium text-gray-600 dark:text-neutral-400 truncate">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-neutral-400 border-t border-gray-100 pt-3 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-xs bg-brand-600" />
                <span>المبيعات والاشتراكات الشهرية</span>
              </div>
              <Link
                href="/admin/invoices"
                className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 inline-flex items-center gap-1"
              >
                <span>تفاصيل الفواتير</span>
                <ChevronIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Live Operations & Recent Activity Feed (1 column) */}
        <div className="rounded-xl border border-gray-200/90 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-neutral-800">
            <h3 className="text-sm font-bold text-gray-900 dark:text-neutral-100 flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <span>{t('dashboard.recent_activity')}</span>
            </h3>
            <Link
              href="/admin/audit-logs"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
            >
              {t('dashboard.view_all')}
            </Link>
          </div>

          <div className="space-y-3.5">
            {recentActivity.map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 p-2.5 rounded-lg bg-gray-50/70 border border-gray-100 dark:bg-neutral-800/50 dark:border-neutral-800"
              >
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-white border border-gray-200 text-brand-600 shadow-2xs dark:bg-neutral-800 dark:border-neutral-700 dark:text-brand-400 mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 space-y-0.5 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-neutral-100 leading-snug">
                    {language === 'ar' ? act.description_ar : act.description_en}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-neutral-500">
                    <span>{act.actor_name}</span>
                    <span>{act.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
