'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  PlayCircle,
  Video,
  FileText,
  Package,
  Users,
  Smartphone,
  CreditCard,
  Wallet,
  KeyRound,
  Ticket,
  FileSpreadsheet,
  BookMarked,
  Layers,
  ShoppingCart,
  Truck,
  Bell,
  BarChart3,
  UserCog,
  ClipboardList,
  Shield,
  Settings,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface NavItem {
  key: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  groupKey: string;
  items: NavItem[];
}

interface AdminSidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function AdminSidebar({
  isMobileOpen,
  setIsMobileOpen,
  isCollapsed,
  setIsCollapsed,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { t, dir } = useLanguage();
  const { user, logout } = useAdminAuth();

  // Collapsible accordion state for groups
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'nav.academic': true,
    'nav.students': true,
    'nav.financial': true,
    'nav.bookstore': true,
    'nav.analytics': true,
    'nav.administration': true,
  });

  const toggleGroup = (groupKey: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const navGroups: NavGroup[] = [
    {
      groupKey: 'nav.academic',
      items: [
        { key: 'nav.courses', href: '/admin/courses', icon: BookOpen },
        { key: 'nav.lectures', href: '/admin/lectures', icon: PlayCircle },
        { key: 'nav.videos', href: '/admin/videos', icon: Video },
        { key: 'nav.attachments', href: '/admin/attachments', icon: FileText },
        { key: 'nav.packages', href: '/admin/packages', icon: Package },
      ],
    },
    {
      groupKey: 'nav.students',
      items: [
        { key: 'nav.students_list', href: '/admin/students', icon: Users },
        { key: 'nav.devices', href: '/admin/devices', icon: Smartphone },
        { key: 'nav.subscriptions', href: '/admin/subscriptions', icon: CreditCard },
      ],
    },
    {
      groupKey: 'nav.financial',
      items: [
        { key: 'nav.wallets', href: '/admin/wallets', icon: Wallet },
        { key: 'nav.recharge_codes', href: '/admin/recharge-codes', icon: KeyRound },
        { key: 'nav.activation_codes', href: '/admin/activation-codes', icon: Ticket },
        { key: 'nav.discounts', href: '/admin/discounts', icon: Layers },
        { key: 'nav.invoices', href: '/admin/invoices', icon: FileSpreadsheet },
      ],
    },
    {
      groupKey: 'nav.bookstore',
      items: [
        { key: 'nav.books', href: '/admin/books', icon: BookMarked },
        { key: 'nav.inventory', href: '/admin/inventory', icon: Layers },
        { key: 'nav.orders', href: '/admin/orders', icon: ShoppingCart },
        { key: 'nav.shipping', href: '/admin/shipping', icon: Truck },
      ],
    },
    {
      groupKey: 'nav.notifications',
      items: [
        { key: 'nav.notifications', href: '/admin/notifications', icon: Bell },
      ],
    },
    {
      groupKey: 'nav.analytics',
      items: [
        { key: 'nav.analytics', href: '/admin/analytics', icon: BarChart3 },
      ],
    },
    {
      groupKey: 'nav.administration',
      items: [
        { key: 'nav.supervisors', href: '/admin/supervisors', icon: UserCog },
        { key: 'nav.audit_logs', href: '/admin/audit-logs', icon: ClipboardList },
        { key: 'nav.security_events', href: '/admin/security-events', icon: Shield },
        { key: 'nav.settings', href: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const CollapseIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white border-e border-gray-200/80 text-gray-800 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-200">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-100 dark:border-neutral-800">
        <Link href="/admin" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-base shadow-sm">
            OM
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm tracking-tight text-gray-900 dark:text-neutral-50 truncate">
                مستر عمر مكاوي
              </span>
              <span className="text-[10px] font-medium text-brand-600 dark:text-brand-400">
                لوحة الإدارة والمعلمين
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
          title={isCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
        >
          <CollapseIcon className="h-4 w-4" />
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Links List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {/* Main Dashboard Overview */}
        <div>
          <Link
            href="/admin"
            onClick={() => setIsMobileOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              pathname === '/admin'
                ? 'bg-brand-50 text-brand-700 font-semibold border-s-3 border-brand-600 dark:bg-brand-950/50 dark:text-brand-300 dark:border-brand-500'
                : 'text-gray-700 hover:bg-gray-100/70 hover:text-gray-900 dark:text-neutral-300 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-100'
            }`}
          >
            <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>{t('nav.dashboard')}</span>}
          </Link>
        </div>

        {/* Grouped Accordions */}
        {navGroups.map((group) => {
          const isGroupOpen = openGroups[group.groupKey] !== false;
          return (
            <div key={group.groupKey} className="space-y-1">
              {!isCollapsed && (
                <button
                  onClick={() => toggleGroup(group.groupKey)}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400 hover:text-gray-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors"
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
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        title={isCollapsed ? t(item.key) : undefined}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-all ${
                          isActive
                            ? 'bg-brand-50 text-brand-700 font-semibold border-s-3 border-brand-600 dark:bg-brand-950/50 dark:text-brand-300 dark:border-brand-500'
                            : 'text-gray-700 hover:bg-gray-100/70 hover:text-gray-900 dark:text-neutral-300 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-100 font-normal'
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

      {/* User Footer & Logout */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/50 dark:border-neutral-800 dark:bg-neutral-900/80">
        {!isCollapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-xs dark:bg-brand-950 dark:text-brand-300">
                {user?.full_name?.charAt(0) || 'M'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-gray-900 dark:text-neutral-100 truncate">
                  {user?.full_name || 'Mr. Omar Makawy'}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-neutral-400 truncate">
                  {user?.phone || '01000000001'}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              title={t('nav.logout')}
              className="flex h-7 w-7 items-center justify-center rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            title={t('nav.logout')}
            className="flex w-full h-8 items-center justify-center rounded-md text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 z-30 h-screen sticky top-0 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative flex w-72 max-w-xs flex-1 flex-col shadow-2xl animate-slide-up">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
