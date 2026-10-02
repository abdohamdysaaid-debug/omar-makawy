'use client';

import React from 'react';
import { Settings, ShieldAlert } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { usePermissions } from '@/hooks/usePermissions';
import { SystemPermissions } from '@omar-makawy/shared';
import { GoogleDriveCard } from '@/components/settings/GoogleDriveCard';

export default function StaffSettingsPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { hasPermission } = usePermissions();

  const canRead =
    hasPermission(SystemPermissions.SETTINGS_READ) ||
    hasPermission(SystemPermissions.SETTINGS_MANAGE);

  if (!canRead) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Settings className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              {isAr ? 'إعدادات المنصة العامة' : 'Platform Global Settings'}
            </h1>
          </div>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50/50 p-8 dark:border-red-900/50 dark:bg-red-950/30 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-900/60 dark:text-red-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-red-900 dark:text-red-200">
            {isAr ? 'غير مصرح بالوصول' : 'Access Denied'}
          </h3>
          <p className="text-xs text-red-700 dark:text-red-400 max-w-md mx-auto leading-relaxed">
            {isAr
              ? 'ليس لديك الصلاحيات الكافية (SETTINGS_READ أو SETTINGS_MANAGE) لعرض أو تعديل إعدادات المنصة.'
              : 'You do not have required permissions (SETTINGS_READ or SETTINGS_MANAGE) to view or manage platform settings.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            {isAr ? 'إعدادات المنصة العامة' : 'Platform Global Settings'}
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {isAr
              ? 'إدارة ربط خدمات التخزين السحابي وإعدادات تشغيل منصة مستر عمر مكاوي'
              : 'Manage cloud storage integrations and global operational parameters'}
          </p>
        </div>
      </div>

      {/* Main Settings Cards */}
      <div className="space-y-6">
        <GoogleDriveCard />
      </div>
    </div>
  );
}
