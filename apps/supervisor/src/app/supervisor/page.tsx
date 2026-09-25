'use client';

import React from 'react';
import { useSupervisorAuth } from '@/context/SupervisorAuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Shield, BookOpen, Key, AlertTriangle, UserCheck } from 'lucide-react';

export default function SupervisorDashboardPage() {
  const { user } = useSupervisorAuth();
  const { t, language } = useLanguage();

  const isAr = language === 'ar';

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          {isAr ? 'لوحة تحكم المشرف' : 'Supervisor Dashboard'}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {isAr
            ? 'مرحباً بك في لوحة تحكم المشرف. الوصول محدد بالصلاحيات والسنوات الدراسية المعينة.'
            : 'Welcome to the Supervisor Dashboard. Access is strictly scoped by assigned permissions and academic years.'}
        </p>
      </div>

      {/* Supervisor Identity Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              {user?.full_name || (isAr ? 'مشرف معتمد' : 'Authorized Supervisor')}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {user?.phone} &bull; <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{user?.role}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          {/* Assigned Academic Years */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {isAr ? 'السنوات الدراسية المعينة (Scoped Scope)' : 'Assigned Academic Years (Scoped Scope)'}
            </h3>
            {user?.assigned_academic_years && user.assigned_academic_years.length > 0 ? (
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
              <p className="text-sm text-neutral-500 dark:text-neutral-400 italic">
                {isAr
                  ? 'لا توجد سنوات دراسية معينة حالياً لهذا الحساب.'
                  : 'No specific academic years assigned yet.'}
              </p>
            )}
          </div>

          {/* Assigned Permissions */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {isAr ? 'الصلاحيات الممنوحة (Granted Permissions)' : 'Granted Permissions'}
            </h3>
            {user?.permissions && user.permissions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.permissions.map((perm, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 italic">
                {isAr
                  ? 'لا توجد صلاحيات مخصصة مسجلة حالياً.'
                  : 'No granular permissions assigned yet.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Security Isolation Notice */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-5 flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
            {isAr ? 'إشعار أمان وعزل الصلاحيات' : 'Security & Scope Isolation Notice'}
          </h4>
          <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-1 leading-relaxed">
            {isAr
              ? 'تخضع جميع عمليات المشرف للتحقق الصارم من جهة الخادم (Backend Enforced Scoping). لا يمكن للمشرف استعراض أو تعديل بيانات خارج نطاق السنوات أو الصلاحيات المصرح له بها. يتم تسجيل كافة الأنشطة في سجل التدقيق الأمني.'
              : 'All supervisor actions are strictly enforced on the server-side with academic year and permission-level isolation. Any unauthorized cross-scope requests are automatically rejected (HTTP 403) and logged to the security audit trail.'}
          </p>
        </div>
      </div>

      {/* Informational Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {isAr ? 'التحكم المبني على الأدوار' : 'Role-Based Access Control (RBAC)'}
            </h3>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            {isAr
              ? 'تفتح الأقسام والوظائف تلقائياً عند منح الصلاحيات ذات الصلة من قبل المعلم/المشرف العام (مثل إدارة الطلاب، حضور المحاضرات، متابعة الطلبات).'
              : 'Dashboard sections and tools unlock dynamically as permissions are granted by the Teacher/Administrator (e.g., student support, lecture attendance, order processing).'}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              {isAr ? 'نطاق المرحلة الدراسية' : 'Academic Scope'}
            </h3>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            {isAr
              ? 'الاستعلامات والتقارير داخل هذا الحساب مقيدة بحكم التصميم بالسنوات الدراسية المحددة في ملف المشرف لضمان حماية خصوصية الطلاب.'
              : 'Queries and data interactions within this account are strictly filtered to the assigned academic years to maintain data isolation and integrity.'}
          </p>
        </div>
      </div>
    </div>
  );
}
