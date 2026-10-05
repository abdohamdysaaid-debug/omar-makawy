'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Loader2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import {
  SupervisorItem,
  PermissionDefinition,
  defaultSupervisorsApi,
} from '@omar-makawy/shared';

interface SupervisorPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  supervisor: SupervisorItem | null;
  permissionsCatalog: PermissionDefinition[];
}

export function SupervisorPermissionsModal({
  isOpen,
  onClose,
  onSuccess,
  supervisor,
  permissionsCatalog,
}: SupervisorPermissionsModalProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (supervisor) {
      const current = (supervisor.permissions || []).map((p) => p.code);
      setSelectedPermissions(current);
    } else {
      setSelectedPermissions([]);
    }
    setError(null);
  }, [supervisor, isOpen]);

  if (!isOpen || !supervisor) return null;

  // Group permissions by module
  const groupedPermissions: Record<string, PermissionDefinition[]> = {};
  permissionsCatalog.forEach((p) => {
    if (p.code === 'tenancy.global_override') return;
    const mod = p.module || 'GENERAL';
    if (!groupedPermissions[mod]) {
      groupedPermissions[mod] = [];
    }
    groupedPermissions[mod].push(p);
  });

  const getModuleLabel = (mod: string) => {
    const map: Record<string, { ar: string; en: string }> = {
      STUDENTS: { ar: 'شؤون الطلاب والبيانات', en: 'Students Management' },
      COURSES: { ar: 'الكورسات التعليمية', en: 'Courses' },
      LECTURES: { ar: 'المحاضرات والدروس', en: 'Lectures' },
      VIDEOS: { ar: 'الفيديوهات والبث', en: 'Videos & Streaming' },
      ATTACHMENTS: { ar: 'المذكرات والمرفقات', en: 'Attachments' },
      PACKAGES: { ar: 'الباقات والعروض', en: 'Packages & Bundles' },
      SUBSCRIPTIONS: { ar: 'الاشتراكات والتسجيل', en: 'Subscriptions' },
      WALLET: { ar: 'المحافظ والمالية', en: 'Wallet & Finance' },
      BOOKSTORE: { ar: 'الكتب والمطبوعات', en: 'Books & Bookstore' },
      INVENTORY: { ar: 'إدارة المخزون', en: 'Inventory' },
      ORDERS: { ar: 'طلبات الشحن والتوصيل', en: 'Orders & Deliveries' },
      NOTIFICATIONS: { ar: 'الإشعارات والتنبيهات', en: 'Notifications' },
      DEVICES: { ar: 'الأجهزة والجلسات', en: 'Devices & Sessions' },
      SUPPORT: { ar: 'خدمة العملاء والدعم', en: 'Customer Support' },
      ANALYTICS: { ar: 'الإحصائيات والتقارير', en: 'Analytics' },
      AUDIT: { ar: 'سجل العمليات والتدقيق', en: 'Audit Logs' },
      SECURITY: { ar: 'أحداث الأمان والتحذيرات', en: 'Security Events' },
      SETTINGS: { ar: 'إعدادات المنصة العامة', en: 'Platform Settings' },
    };
    return map[mod] ? (isAr ? map[mod].ar : map[mod].en) : mod;
  };

  const isSensitivePermission = (code: string) => {
    return (
      code.includes('delete') ||
      code.includes('wallet.manage') ||
      code.includes('settings.manage') ||
      code.includes('security_events.manage')
    );
  };

  const togglePermission = (code: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const toggleModulePermissions = (mod: string) => {
    const modPerms = groupedPermissions[mod] || [];
    const modCodes = modPerms.map((p) => p.code);
    const allSelected = modCodes.every((c) => selectedPermissions.includes(c));

    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((c) => !modCodes.includes(c)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...modCodes])));
    }
  };

  const selectSafeDefaults = () => {
    const safeCodes = permissionsCatalog
      .filter((p) => !isSensitivePermission(p.code) && p.code !== 'tenancy.global_override')
      .map((p) => p.code);
    setSelectedPermissions(safeCodes);
  };

  const clearAllPermissions = () => {
    setSelectedPermissions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await defaultSupervisorsApi.assignPermissions(supervisor.id, selectedPermissions);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Assign permissions error:', err);
      setError(err?.response?.data?.message || err?.message || (isAr ? 'حدث خطأ أثناء حفظ الصلاحيات' : 'Failed to update permissions'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#111612] border border-neutral-200 dark:border-neutral-800 shadow-2xl transition-all my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                {isAr ? `صلاحيات المشرف: ${supervisor.full_name}` : `Permissions: ${supervisor.full_name}`}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isAr
                  ? 'اختر الصلاحيات المحددة الممنوحة لهذا المشرف بدقة'
                  : 'Select exact granular permissions granted to this supervisor'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between flex-wrap gap-2 pb-2">
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              {isAr ? 'عدد الصلاحيات المحددة:' : 'Selected permissions:'}{' '}
              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                {selectedPermissions.length}
              </span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectSafeDefaults}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[11px] font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <Sparkles className="h-3 w-3 text-emerald-500" />
                <span>{isAr ? 'الصلاحيات الآمنة المقترحة' : 'Safe Defaults'}</span>
              </button>
              <button
                type="button"
                onClick={clearAllPermissions}
                className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[11px] font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                {isAr ? 'مسح الكل' : 'Clear All'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(groupedPermissions).map(([mod, perms]) => {
              const modCodes = perms.map((p) => p.code);
              const selectedCount = modCodes.filter((c) => selectedPermissions.includes(c)).length;
              const isAllSelected = selectedCount === modCodes.length && modCodes.length > 0;

              return (
                <div
                  key={mod}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/30 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-100/50 dark:bg-neutral-850/50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">
                        {getModuleLabel(mod)}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        ({selectedCount}/{modCodes.length})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleModulePermissions(mod)}
                      className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      {isAllSelected ? (isAr ? 'إلغاء' : 'Deselect') : (isAr ? 'تحديد الكل' : 'Select All')}
                    </button>
                  </div>

                  <div className="p-3 space-y-2">
                    {perms.map((p) => {
                      const isChecked = selectedPermissions.includes(p.code);
                      const isSensitive = isSensitivePermission(p.code);

                      return (
                        <label
                          key={p.code}
                          className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-emerald-500/10 dark:bg-emerald-500/15 text-neutral-900 dark:text-white'
                              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(p.code)}
                            className="mt-0.5 rounded-sm border-neutral-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold">
                                {isAr ? p.name_ar : p.name_en}
                              </span>
                              {isSensitive && (
                                <span className="px-1.5 py-0.2 rounded-sm bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[9px] font-bold">
                                  {isAr ? 'صلاحية حساسة' : 'Sensitive'}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5 leading-tight">
                              {p.description || p.code}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-transparent px-4 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-950/20 transition-all disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isAr ? 'حفظ الصلاحيات' : 'Save Permissions'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
