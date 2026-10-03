'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useStaffAuth } from '@/context/StaffAuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { STAFF_NAVIGATION_SECTIONS, NavSectionConfig, NavItemConfig } from '@/config/navigation';
import { RoleBadge } from '../ui/RoleBadge';
import { SystemPermissions } from '@omar-makawy/shared';

interface StaffSidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

export function StaffSidebar({
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed = false,
  setIsCollapsed,
}: StaffSidebarProps) {
  const pathname = usePathname();
  const { t, dir, language } = useLanguage();
  const { user, role } = useStaffAuth();
  const { hasPermission, isTeacher } = usePermissions();
  const isAr = language === 'ar';

  const filterItem = React.useCallback((item: NavItemConfig): boolean => {
    if (isTeacher) return true;
    if (item.isTeacherOnly) return false;
    if (item.permission) {
      if (item.permission === SystemPermissions.SETTINGS_READ) {
        return (
          hasPermission(SystemPermissions.SETTINGS_READ) ||
          hasPermission(SystemPermissions.SETTINGS_MANAGE)
        );
      }
      return hasPermission(item.permission);
    }
    return true;
  }, [isTeacher, hasPermission]);

  // Filter sections: keep only sections that have at least one visible item
  const authorizedSections = useMemo<{ sectionKey?: string; items: NavItemConfig[] }[]>(() => {
    return STAFF_NAVIGATION_SECTIONS
      .map((section) => ({
        sectionKey: section.sectionKey,
        items: section.items.filter(filterItem),
      }))
      .filter((section) => section.items.length > 0);
  }, [filterItem]);

  const CollapseIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#0c100d] border-e border-neutral-800/80 text-neutral-200">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-neutral-800/80">
        <Link href="/staff" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-black text-base shadow-sm shadow-emerald-950/40">
            OM
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm tracking-tight text-white truncate">
                {t('brand.teacher_name')}
              </span>
              <span className="text-[10px] font-semibold text-emerald-400">
                {t('brand.title')}
              </span>
            </div>
          )}
        </Link>

        {setIsCollapsed && (
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800 transition-colors"
          >
            <CollapseIcon className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-800"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation List — Grouped Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {authorizedSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {section.sectionKey && (
              <div className={`px-3.5 pt-2 pb-1 ${isCollapsed ? 'sr-only' : ''}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  {t(section.sectionKey)}
                </span>
              </div>
            )}
            {section.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/staff' && pathname.startsWith(`${item.href}`));
              const Icon = item.icon;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  prefetch={false}
                  onClick={() => setIsMobileOpen(false)}
                  title={isCollapsed ? t(item.key) : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-950/70 text-emerald-300 border-s-4 border-emerald-500 shadow-xs'
                      : 'text-neutral-400 hover:bg-neutral-850 hover:text-neutral-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-neutral-400'}`} />
                  {!isCollapsed && <span className="truncate">{t(item.key)}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Identity Card */}
      <div className="p-3 border-t border-neutral-800/80 bg-[#080b09]">
        <div className="rounded-xl p-1.5">
          {!isCollapsed ? (
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-950 text-emerald-300 font-bold text-xs border border-emerald-800/60 shadow-xs">
                  {user?.full_name?.charAt(0) || 'OM'}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">
                    {user?.full_name || (isAr ? 'مستر عمر مكاوي' : 'Mr. Omar Meckawy')}
                  </p>
                  <p className="text-[10px] text-neutral-400 font-mono truncate">
                    {user?.phone}
                  </p>
                </div>
              </div>
              {role && (
                <div className="pt-0.5">
                  <RoleBadge role={role} size="sm" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-950 text-emerald-300 font-bold text-xs border border-emerald-800/60 shadow-xs">
                {user?.full_name?.charAt(0) || 'OM'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 z-30 h-screen sticky top-0 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative flex w-72 max-w-xs flex-1 flex-col shadow-2xl animate-in slide-in-from-start duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
