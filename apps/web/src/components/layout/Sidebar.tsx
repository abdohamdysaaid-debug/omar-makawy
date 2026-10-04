'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import {
  Home,
  PlaySquare,
  Package,
  BookOpen,
  ShoppingBag,
  FileText,
  Wallet,
  Bell,
  TrendingUp,
  User,
  HelpCircle,
  X,
  GraduationCap,
  CheckCircle2,
  Award,
  Video,
  Sparkles,
  ShoppingCart
} from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const navSections = [
  {
    category: 'التعليم والمحتوى الدراسي',
    items: [
      { labelKey: 'nav.home', label: 'الرئيسية', href: '/student', aliases: ['/', '/student'], icon: Home },
      { labelKey: 'nav.subscriptions', label: 'اشتراكاتي', href: '/student/subscriptions', aliases: ['/subscriptions', '/student/subscriptions'], icon: CheckCircle2 },
      { labelKey: 'nav.courses', label: 'الكورسات', href: '/student/courses', aliases: ['/courses', '/student/courses'], icon: Video },
      { labelKey: 'nav.monthlyPackages', label: 'الباقات الشهرية', href: '/student/packages', aliases: ['/packages', '/student/packages', '/#packages'], icon: Package },
      { labelKey: 'nav.exams', label: 'الامتحانات', href: '/student/exams', aliases: ['/exams', '/student/exams'], icon: GraduationCap },
    ],
  },
  {
    category: 'المتجر والخدمات المالية',
    items: [
      { labelKey: 'nav.books', label: 'متجر الكتب', href: '/bookstore', aliases: ['/bookstore', '/student/books'], icon: BookOpen },
      { labelKey: 'nav.cart', label: 'سلة التسوق', href: '/cart', aliases: ['/cart'], icon: ShoppingCart },
      { labelKey: 'nav.orders', label: 'طلباتي', href: '/student/orders', aliases: ['/orders', '/student/orders'], icon: ShoppingBag },
      { labelKey: 'nav.wallet', label: 'المحفظة', href: '/student/wallet', aliases: ['/wallet', '/student/wallet'], icon: Wallet },
      { labelKey: 'nav.notifications', label: 'الإشعارات', href: '/student/notifications', aliases: ['/notifications', '/student/notifications'], icon: Bell },
      { labelKey: 'nav.progress', label: 'تقدمي في الدراسة', href: '/student/progress', aliases: ['/progress', '/student/progress'], icon: TrendingUp },
    ],
  },
  {
    category: 'المساعدة والتواصل الذكي',
    items: [
      { labelKey: 'nav.support', label: 'الدعم والمساعدة', href: '/student/support', aliases: ['/support', '/student/support'], icon: HelpCircle },
      { labelKey: 'nav.ai', label: 'عمر مكاوي Ai', href: '/student/ai', aliases: ['/student/ai', '/ai'], icon: Sparkles, isAi: true },
    ],
  },
];

export const navItems = navSections.flatMap((section) => section.items);

export default function Sidebar({
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const { t, language } = useLanguage();

  // Lock body scroll and handle Escape key on mobile drawer open
  React.useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && onCloseMobile) onCloseMobile();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileOpen, onCloseMobile]);

  const isRtl = language === 'ar';

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity duration-300 ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onCloseMobile}
        role="presentation"
      />

      {/* Persistent Collapsible Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 start-0 z-50 flex flex-col bg-[#064e3b] dark:bg-stone-950 border-e border-emerald-800/60 dark:border-stone-800/80 shadow-2xl transition-transform duration-300 ease-out ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${
          isMobileOpen
            ? 'w-64 translate-x-0'
            : isRtl
            ? 'w-64 translate-x-full lg:translate-x-0'
            : 'w-64 -translate-x-full lg:translate-x-0'
        }`}
        role="dialog"
        aria-modal={isMobileOpen}
        aria-label="Sidebar Menu"
      >
        {/* Brand Header */}
        <div className={`flex items-center h-20 border-b border-emerald-800/60 dark:border-stone-800/80 ${
          isCollapsed ? 'px-3 justify-center' : 'px-6 justify-between'
        }`}>
          <Link href="/student" className="flex items-center gap-3 group" onClick={onCloseMobile}>
            <div className="w-10 h-10 rounded-xl bg-white text-emerald-950 font-black flex items-center justify-center text-lg shadow-md shadow-emerald-950/30 group-hover:scale-105 transition-transform shrink-0">
              OM
            </div>
            <div className={`flex flex-col transition-opacity duration-200 ${isCollapsed ? 'hidden' : 'block'}`}>
              <span className="text-base font-bold text-white dark:text-white leading-tight">
                Mr. Omar Meckawy
              </span>
              <span className="text-[11px] font-semibold text-emerald-200 dark:text-emerald-400">
                English Teacher
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white dark:text-stone-300 dark:hover:text-white lg:hidden"
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items (Grouped by Category) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 scrollbar-thin">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-2">
              {!isCollapsed && (
                <span className="text-[9.5px] font-black uppercase tracking-wider text-emerald-300/80 dark:text-emerald-400 px-2 block text-start">
                  {section.category}
                </span>
              )}
              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.aliases.some((alias) =>
                    alias === '/' || alias === '/student'
                      ? pathname === '/' || pathname === '/student'
                      : pathname === alias || pathname.startsWith(alias)
                  );

                  const isAi = (item as any).isAi;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={`relative group flex items-center gap-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        isCollapsed ? 'px-3 py-3 justify-center' : 'px-3.5 py-2.5'
                      } ${
                        isActive
                          ? 'bg-emerald-700/90 dark:bg-[#0d6e4f] text-white font-extrabold shadow-md shadow-emerald-950/40 border-s-4 border-emerald-300 dark:border-emerald-400'
                          : isAi
                          ? 'bg-emerald-950/60 dark:bg-emerald-950/90 text-emerald-200 border border-emerald-500/50 hover:bg-emerald-800/80 hover:text-white'
                          : 'bg-emerald-900/40 dark:bg-stone-900/90 text-emerald-100/90 dark:text-stone-200 hover:bg-emerald-800/70 dark:hover:bg-stone-800 hover:text-white border border-emerald-800/40 dark:border-stone-800'
                      }`}
                    >
                      <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : isAi ? 'text-emerald-300' : 'text-emerald-200/80 dark:text-gray-400 group-hover:text-white dark:group-hover:text-emerald-400'}`} />

                      <span className={`truncate flex-1 transition-opacity duration-200 ${isCollapsed ? 'hidden' : 'block'}`}>
                        {t(item.labelKey, item.label)}
                      </span>

                      {isAi && !isCollapsed && (
                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-black text-[9.5px] shadow-xs animate-pulse ms-auto">
                          AI ✨
                        </span>
                      )}

                      {/* Floating Tooltip on Desktop when Collapsed */}
                      {isCollapsed && (
                        <div className="hidden lg:block pointer-events-none absolute start-full ms-2 px-3 py-1.5 bg-emerald-950 dark:bg-gray-800 text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-50 border border-emerald-800/60 dark:border-gray-700">
                          {t(item.labelKey, item.label)}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer Teacher Card */}
        <div className="p-3 border-t border-emerald-800/60 dark:border-gray-800/60">
          <div className={`flex items-center rounded-xl bg-emerald-950/60 dark:bg-gray-900/60 border border-emerald-800/50 dark:border-gray-800 ${
            isCollapsed ? 'p-2 justify-center' : 'p-3 gap-3'
          }`}>
            <div className="w-9 h-9 rounded-full overflow-hidden border border-emerald-400/40 shrink-0 shadow-xs bg-white dark:bg-stone-900">
              <img src="/assets/omar-avatar.jpg" alt="Mr. Omar Meckawy" className="w-full h-full object-cover" />
            </div>
            <div className={`flex flex-col min-w-0 ${isCollapsed ? 'hidden' : 'block'}`}>
              <span className="text-xs font-bold text-white dark:text-white truncate">
                {t('teacher.title', 'Mr. Omar Meckawy')}
              </span>
              <span className="text-[10px] text-emerald-200/80 dark:text-gray-400 truncate">
                {t('teacher.expertTitle', 'خبير تدريس اللغة الإنجليزية')}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
