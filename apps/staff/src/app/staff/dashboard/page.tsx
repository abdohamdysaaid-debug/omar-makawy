'use client';

import React from 'react';
import Link from 'next/link';
import { useStaffAuth } from '@/context/StaffAuthContext';
import { useAcademicYearScope } from '@/context/AcademicYearContext';
import { useLanguage } from '@/context/LanguageContext';
import { usePermissions } from '@/hooks/usePermissions';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { PermissionGate, RoleGate } from '@/components/rbac';
import {
  ShieldCheck,
  BookOpen,
  Key,
  AlertTriangle,
  UserCheck,
  GraduationCap,
  Sparkles,
  Layers,
  Users,
  ShoppingCart,
  Wallet,
  Bell,
  Settings,
  Shield,
  ArrowUpRight,
} from 'lucide-react';
import { SystemPermissions } from '@omar-makawy/shared';

export default function StaffDashboardPage() {
  const { user, role, isTeacher, isSupervisor } = useStaffAuth();
  const { activeYear, isGlobalScope } = useAcademicYearScope();
  const { t, language } = useLanguage();
  const { hasPermission } = usePermissions();

  const isAr = language === 'ar';

  const operationalModules = [
    {
      title: isAr ? 'إدارة الطلاب والأجهزة' : 'Students & Devices',
      desc: isAr ? 'سجل الطلاب والتحقق من الأجهزة المسجلة' : 'Student roster & device verification',
      icon: Users,
      href: '/staff/students',
      permission: SystemPermissions.STUDENTS_READ,
    },
    {
      title: isAr ? 'الكورسات والمحاضرات' : 'Courses & Lectures',
      desc: isAr ? 'المحتوى التعليمي والفيديوهات والمذكرات' : 'Curriculum, videos & attachments',
      icon: BookOpen,
      href: '/staff/courses',
      permission: SystemPermissions.COURSES_READ,
    },
    {
      title: isAr ? 'المكتبة وطلبات الكتب' : 'Bookstore & Orders',
      desc: isAr ? 'متابعة شحن وتوصيل الكتب والمذكرات' : 'Book shipping & fulfillment ledger',
      icon: ShoppingCart,
      href: '/staff/bookstore/orders',
      permission: SystemPermissions.ORDERS_READ,
    },
    {
      title: isAr ? 'المحافظ والعمليات المالية' : 'Wallets & Finance',
      desc: isAr ? 'أرصدة الطلاب، كروت الشحن والفواتير' : 'Student balances, vouchers & invoices',
      icon: Wallet,
      href: '/staff/financial/wallets',
      permission: SystemPermissions.WALLET_READ,
    },
    {
      title: isAr ? 'الإشعارات العامة' : 'Broadcast Center',
      desc: isAr ? 'إرسال التنبيهات والرسائل المباشرة' : 'Send push alerts & targeted notifications',
      icon: Bell,
      href: '/staff/notifications',
      permission: SystemPermissions.NOTIFICATIONS_READ,
    },
    {
      title: isAr ? 'الأمان وسجل التدقيق' : 'Security & Audit Logs',
      desc: isAr ? 'سجل العمليات الإدارية وأحداث الحماية' : 'Administrative audit trail & security events',
      icon: Shield,
      href: '/staff/audit-logs',
      permission: SystemPermissions.AUDIT_LOGS_READ,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            {t('dashboard.title')}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {t('dashboard.welcome')} &bull;{' '}
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {user?.full_name}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {role && <RoleBadge role={role} size="lg" />}
        </div>
      </div>

      {/* Staff Identity & Active Tenancy Scope Banner */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800 font-bold text-xl shadow-xs">
              {user?.full_name?.charAt(0) || 'S'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {user?.full_name || (isAr ? 'عضو الكادر التعليمي' : 'Staff Member')}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-mono">
                {user?.phone} &bull; {user?.email || (isAr ? 'بدون بريد مسجل' : 'No email registered')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50/60 px-3 py-1 text-xs font-semibold text-brand-800 dark:border-brand-800/60 dark:bg-brand-950/40 dark:text-brand-300">
              <GraduationCap className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
              <span>
                {isGlobalScope
                  ? isAr
                    ? 'النطاق: جميع المراحل (Global Scope)'
                    : 'Scope: All Academic Stages (Global)'
                  : activeYear
                  ? `${isAr ? 'النطاق النشط:' : 'Active Scope:'} ${isAr ? activeYear.name_ar : activeYear.name_en}`
                  : isAr
                  ? 'النطاق: غير محدد'
                  : 'Scope: Unassigned'}
              </span>
            </div>

            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {user?.status === 'ACTIVE' ? (isAr ? 'حساب نشط ومعتمد' : 'Active Account') : user?.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-neutral-100 dark:border-neutral-800">
          {/* Academic Scope Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <span>{t('dashboard.assigned_years')}</span>
            </h3>

            {isTeacher ? (
              <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-3.5 text-xs text-brand-900 dark:border-brand-900/60 dark:bg-brand-950/30 dark:text-brand-200 font-medium leading-relaxed">
                {t('dashboard.global_access')}
              </div>
            ) : user?.assigned_academic_years && user.assigned_academic_years.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.assigned_academic_years.map((yearId, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-mono font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700"
                  >
                    {yearId}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400 italic">
                {isAr ? 'لا توجد سنوات دراسية معينة حالياً لهذا الحساب.' : 'No academic years assigned yet.'}
              </p>
            )}
          </div>

          {/* Granted Permissions Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3 flex items-center gap-2">
              <Key className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <span>{t('dashboard.granted_permissions')}</span>
            </h3>

            {isTeacher ? (
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-300 font-medium leading-relaxed">
                {isAr
                  ? 'صلاحيات الإدارة العامة الكاملة لجميع الوحدات (Super Administrator)'
                  : 'Full administrative permissions across all system modules'}
              </div>
            ) : user?.permissions && user.permissions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                {user.permissions.map((perm, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-brand-50 text-brand-800 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400 italic">
                {isAr ? 'لا توجد صلاحيات مخصصة مسجلة حالياً.' : 'No granular permissions assigned.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Operational Modules Quick Access Grid (RBAC Filtered) */}
      <div>
        <div className="mb-3">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
            {isAr ? 'الوحدات الإدارية المصرح بها' : 'Authorized Operational Modules'}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {isAr
              ? 'الوصول المباشر إلى الأقسام وفق الصلاحيات الممنوحة من قبل المعلم'
              : 'Direct access to platform workspaces according to granted backend permissions'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {operationalModules.map((module) => {
            const isPermitted = isTeacher || hasPermission(module.permission);
            if (!isPermitted) return null;

            const Icon = module.icon;
            return (
              <Link
                key={module.href}
                href={module.href}
                className="group rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs hover:border-brand-500 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-brand-500/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800 group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-neutral-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" />
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-50 mb-1">
                    {module.title}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {module.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px] text-brand-600 dark:text-brand-400 font-semibold">
                  <span>{isAr ? 'فتح القسم' : 'Open Module'}</span>
                  <span className="font-mono text-[10px] text-neutral-400">
                    {module.permission}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Security Notice */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/60 dark:bg-amber-950/30 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">{t('dashboard.security_notice')}</p>
      </div>
    </div>
  );
}
