'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useStaffAuth } from '@/context/StaffAuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { STAFF_NAVIGATION_GROUPS, NavGroupConfig, NavItemConfig } from '@/config/navigation';
import { RoleBadge } from '../ui/RoleBadge';

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
  const { t, dir } = useLanguage();
  const { user, role } = useStaffAuth();
  const { hasPermission, isTeacher } = usePermissions();

  // Accordion state for navigation groups
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'nav.academic': true,
    'nav.students': true,
    'nav.financial': true,
    'nav.bookstore': true,
    'nav.administration': true,
  });

  const toggleGroup = (groupKey: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  // Filter navigation groups based on user permissions
  const authorizedNavGroups = useMemo<NavGroupConfig[]>(() => {
    return STAFF_NAVIGATION_GROUPS.map((group) => {
      const allowedItems = group.items.filter((item: NavItemConfig) => {
        if (isTeacher) return true;
        if (item.isTeacherOnly) return false;
        if (item.permission) {
          return hasPermission(item.permission);
        }
        return true;
      });

      return {
        ...group,
        items: allowedItems,
      };
    }).filter((group) => group.items.length > 0); // Hide groups with 0 authorized items
  }, [isTeacher, hasPermission]);

  const CollapseIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white border-e border-neutral-200 text-neutral-800 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-200">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-neutral-100 dark:border-neutral-800">
        <Link href="/staff/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-base shadow-sm">
            OM
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-neutral-50 truncate">
                {t('brand.teacher_name')}
              </span>
              <span className="text-[10px] font-medium text-brand-600 dark:text-brand-400">
                {t('brand.title')}
              </span>
            </div>
          )}
        </Link>

        {setIsCollapsed && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <CollapseIcon className="h-4 w-4" />
          </button>
        )}

        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Groups List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {/* Main Dashboard Link */}
        <div>
          <Link
            href="/staff/dashboard"
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              pathname === '/staff/dashboard' || pathname === '/staff'
                ? 'bg-brand-50 text-brand-700 font-semibold border-s-3 border-brand-600 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-500'
                : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
            }`}
          >
            <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>{t('nav.dashboard')}</span>}
          </Link>
        </div>

        {/* Dynamic RBAC Group Accordions */}
        {authorizedNavGroups.map((group) => {
          const isGroupOpen = openGroups[group.groupKey] !== false;
          return (
            <div key={group.groupKey} className="space-y-1">
              {!isCollapsed && (
                <button
                  type="button"
                  onClick={() => toggleGroup(group.groupKey)}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors"
                >
                  <span>{t(group.groupKey)}</span>
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ${
                      isGroupOpen ? '' : '-rotate-90'
                    }`}
                  />
                </button>
              )}

              {(isGroupOpen || isCollapsed) && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        title={isCollapsed ? t(item.key) : undefined}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-all ${
                          isActive
                            ? 'bg-brand-50 text-brand-700 font-semibold border-s-3 border-brand-600 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-500'
                            : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && <span className="truncate">{t(item.key)}</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Identity Card */}
      <div className="p-3 border-t border-neutral-100 bg-neutral-50/70 dark:border-neutral-800 dark:bg-neutral-900/80">
        {!isCollapsed ? (
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-800 font-bold text-xs dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                {user?.full_name?.charAt(0) || 'S'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {user?.full_name || 'Staff Member'}
                </p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
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
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-800 font-bold text-xs dark:bg-brand-950 dark:text-brand-300">
              {user?.full_name?.charAt(0) || 'S'}
            </div>
          </div>
        )}
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
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
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
