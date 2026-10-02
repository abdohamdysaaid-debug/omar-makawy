'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  HardDrive,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  Loader2,
  FolderCheck,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { usePermissions } from '@/hooks/usePermissions';
import { staffApiClient } from '@/context/StaffAuthContext';
import { SystemPermissions } from '@omar-makawy/shared';

export interface GoogleDriveStatus {
  connected: boolean;
  provider: string;
  authMode: 'OAUTH2' | 'SERVICE_ACCOUNT' | 'NONE' | string;
  folderConfigured: boolean;
  accountEmail: string | null;
}

export function GoogleDriveCard() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { hasPermission } = usePermissions();

  const canManage = hasPermission(SystemPermissions.SETTINGS_MANAGE);
  const canRead = hasPermission(SystemPermissions.SETTINGS_READ) || canManage;

  const [status, setStatus] = useState<GoogleDriveStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authorizing, setAuthorizing] = useState<boolean>(false);
  const [error, setError] = useState<{ title: string; message: string; statusCode?: number } | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!canRead) {
      setLoading(false);
      setError({
        title: isAr ? 'غير مصرح' : 'Access Denied',
        message: isAr
          ? 'ليس لديك صلاحيات كافية لعرض إعدادات Google Drive (SETTINGS_READ).'
          : 'You do not have permission to view Google Drive settings (SETTINGS_READ).',
        statusCode: 403,
      });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await staffApiClient.get<GoogleDriveStatus>('/storage/google/status');
      setStatus(res);
    } catch (err: any) {
      const statusCode = err?.statusCode || 0;
      let message = err?.message || (isAr ? 'حدث خطأ في الاتصال بالخادم' : 'Failed to connect to server');

      if (statusCode === 401) {
        message = isAr ? 'جلسة العمل منتهية. يرجى تسجيل الدخول مجدداً.' : 'Session expired. Please sign in again.';
      } else if (statusCode === 403) {
        message = isAr ? 'غير مصرح لك بعرض حالة Google Drive.' : 'Insufficient permissions to view Google Drive status.';
      } else if (statusCode === 500) {
        message = isAr ? 'خطأ داخلي في الخادم عند استرجاع حالة التخزين.' : 'Internal server error while fetching storage status.';
      }

      setError({
        title: isAr ? 'فشل جلب حالة الربط' : 'Failed to fetch status',
        message,
        statusCode,
      });
    } finally {
      setLoading(false);
    }
  }, [canRead, isAr]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleConnect = async () => {
    if (!canManage) {
      setError({
        title: isAr ? 'غير مصرح' : 'Action Forbidden',
        message: isAr
          ? 'يتطلب ربط Google Drive الحصول على صلاحية إدارة الإعدادات (SETTINGS_MANAGE).'
          : 'Connecting Google Drive requires SETTINGS_MANAGE permission.',
        statusCode: 403,
      });
      return;
    }

    setAuthorizing(true);
    setError(null);

    try {
      const res = await staffApiClient.get<{ url: string }>('/storage/google/authorize');
      if (res && res.url) {
        window.location.href = res.url;
      } else {
        throw new Error(isAr ? 'لم يتم استلام رابط التوجيه من الخادم.' : 'No authorization URL received from server.');
      }
    } catch (err: any) {
      setAuthorizing(false);
      const statusCode = err?.statusCode || 0;
      let message = err?.message || (isAr ? 'فشل بدء عملية ربط Google Drive' : 'Failed to initiate Google Drive authorization');

      if (statusCode === 401) {
        message = isAr ? 'جلسة العمل منتهية. يرجى تسجيل الدخول مجدداً.' : 'Session expired. Please sign in again.';
      } else if (statusCode === 403) {
        message = isAr ? 'غير مصرح لك ببدء عملية الربط (SETTINGS_MANAGE).' : 'Forbidden: SETTINGS_MANAGE permission required.';
      } else if (statusCode === 500) {
        message = isAr ? 'خطأ في تهيئة مزود Google Drive بالخادم.' : 'Server error initializing Google Drive provider.';
      }

      setError({
        title: isAr ? 'فشل الاتصال بـ Google' : 'Google Authorization Failed',
        message,
        statusCode,
      });
    }
  };

  const getAuthModeLabel = (authMode?: string) => {
    switch (authMode) {
      case 'OAUTH2':
        return isAr ? 'Google OAuth 2.0 (الحساب الشخصي)' : 'Google OAuth 2.0 (My Drive)';
      case 'SERVICE_ACCOUNT':
        return isAr ? 'حساب الخدمة (Service Account)' : 'Service Account';
      default:
        return isAr ? 'غير متصل' : 'Not Connected';
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/70 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
            <HardDrive className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              Google Drive
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {isAr
                ? 'ربط Google Drive لتخزين صور وملفات المنصة بشكل مركزي'
                : 'Connect Google Drive for central storage of platform files and images'}
            </p>
          </div>
        </div>

        {/* Refresh Status Button */}
        <button
          type="button"
          onClick={fetchStatus}
          disabled={loading || authorizing}
          title={isAr ? 'تحديث الحالة' : 'Refresh Status'}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{isAr ? 'تحديث الحالة' : 'Refresh Status'}</span>
        </button>
      </div>

      {/* Body Content */}
      <div className="pt-5 space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block mb-0.5">{error.title}</span>
              <p className="leading-relaxed">{error.message}</p>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading ? (
          <div className="flex items-center justify-center py-8 text-neutral-400 dark:text-neutral-500 gap-2 text-xs font-semibold">
            <Loader2 className="h-5 w-5 animate-spin text-brand-600 dark:text-brand-400" />
            <span>{isAr ? 'جاري التحقق من حالة الربط...' : 'Checking connection status...'}</span>
          </div>
        ) : status ? (
          <div className="space-y-4">
            {/* Status Summary Pill */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-150 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                {status.connected ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-neutral-400 dark:text-neutral-500 shrink-0" />
                )}
                <div>
                  <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 block">
                    {isAr ? 'حالة الربط:' : 'Connection Status:'}
                  </span>
                  <span className={`text-sm font-bold ${status.connected ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-700 dark:text-neutral-300'}`}>
                    {status.connected ? (isAr ? 'متصل' : 'Connected') : (isAr ? 'غير متصل' : 'Disconnected')}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {canManage ? (
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={authorizing}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600 text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  {authorizing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{isAr ? 'جاري التوجيه إلى Google...' : 'Redirecting to Google...'}</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4" />
                      <span>{isAr ? 'ربط Google Drive' : 'Connect Google Drive'}</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                  <ShieldAlert className="h-4 w-4" />
                  <span>{isAr ? 'العرض فقط (SETTINGS_MANAGE مطلوب)' : 'Read-only (SETTINGS_MANAGE required)'}</span>
                </div>
              )}
            </div>

            {/* Connection Details Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Account Email */}
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50">
                <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-1">
                  <Mail className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  <span className="text-xs font-semibold">{isAr ? 'حساب Google' : 'Google Account'}</span>
                </div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                  {status.accountEmail || (isAr ? 'غير محدد' : 'Not Set')}
                </p>
              </div>

              {/* Auth Mode */}
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50">
                <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-1">
                  <HardDrive className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  <span className="text-xs font-semibold">{isAr ? 'نمط المصادقة' : 'Auth Mode'}</span>
                </div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                  {getAuthModeLabel(status.authMode)}
                </p>
              </div>

              {/* Configured Folder */}
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50">
                <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 mb-1">
                  <FolderCheck className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  <span className="text-xs font-semibold">{isAr ? 'المجلد المصدر' : 'Root Folder'}</span>
                </div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">
                  {status.folderConfigured
                    ? isAr
                      ? 'تم التعيين'
                      : 'Configured'
                    : isAr
                    ? 'غير محدد'
                    : 'Not Configured'}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
