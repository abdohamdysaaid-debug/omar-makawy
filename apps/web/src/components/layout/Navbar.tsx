'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User, Bell, LogOut, GraduationCap, Home, Package, BookOpen, Video, LogIn, UserPlus, ChevronLeft, Wallet, HelpCircle, CheckCircle2, Award, ShoppingBag, TrendingUp, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguageToggle from '@/components/ui/LanguageToggle';

// Scalloped Blue Verified Badge Icon matching Twitter/X style
const VerifiedBadge = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg 
    className={`inline-block shrink-0 ${className}`} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M22.5 12.5c0-1.58-.8-2.97-2-3.79.43-1.52.09-3.2-1.01-4.3-1.1-1.1-2.78-1.44-4.3-1.01C14.37 2.2 12.98 1.4 11.4 1.4c-1.58 0-2.97.8-3.79 2C6.09 2.97 4.41 3.31 3.31 4.41c-1.1 1.1-1.44 2.78-1.01 4.3C1.1 9.53.3 10.92.3 12.5c0 1.58.8 2.97 2 3.79-.43 1.52.09 3.2 1.01 4.3 1.1 1.1 2.78 1.44 4.3 1.01.82 1.2 2.21 2 3.79 2 1.58 0 2.97-.8 3.79-2 1.52.43 3.2.09 4.3-1.01 1.1-1.1 1.44-2.78 1.01-4.3 1.2-.82 2-2.21 2-3.79z" 
      fill="#1D9BF0" 
    />
    <path 
      d="M9.8 15.8l-3.6-3.6 1.41-1.41 2.19 2.19 6.4-6.4 1.41 1.41-7.81 7.81z" 
      fill="#FFFFFF" 
    />
  </svg>
);

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  
  const pathname = usePathname();
  const { isAuthenticated, student, logout } = useAuth();
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll and listen for Escape key when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsMobileMenuOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: t('nav.home', 'الرئيسية'), href: '/', icon: Home },
    { name: t('nav.packages', 'الباقات'), href: '/#packages', icon: Package },
    { name: t('nav.courses', 'الكورسات'), href: '/#courses', icon: Video },
    { name: t('nav.books', 'الكتب'), href: '/#books', icon: BookOpen },
  ];

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      const targetId = href.replace('/#', '');
      const elem = document.getElementById(targetId);
      if (elem) {
        e.preventDefault();
        elem.scrollIntoView({ behavior: 'smooth' });
        window.history.replaceState(null, '', href);
      }
    }
  };

  return (
    <nav className="fixed top-2 sm:top-4 start-2 end-2 sm:start-4 sm:end-4 max-w-7xl mx-auto z-50 transition-all duration-300 font-cairo">
      <div className={`w-full rounded-full transition-all duration-300 px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between border shadow-lg ${
        isScrolled
          ? 'bg-white/95 dark:bg-[#0c1017]/95 backdrop-blur-md border-stone-200/80 dark:border-stone-800 shadow-black/10'
          : 'bg-white/90 dark:bg-[#0c1017]/90 backdrop-blur-md border-stone-200/60 dark:border-stone-800/80 shadow-black/5'
      }`}>
        
        {/* Right Side (RTL): Brand Logo & Verified Teacher Credentials */}
        <Link href="/" className="flex items-center gap-2 text-start group">
          {/* Desktop Logo & Verified Subtitle */}
          <div className="hidden lg:flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0d6e4f] text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col items-start justify-center">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-[#0a4834] dark:text-white tracking-tight leading-tight">
                  Mr. Omar Meckawy
                </span>
                <VerifiedBadge className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-gray-600 dark:text-emerald-400 leading-tight">
                {t('teacher.subtitle', 'مدرس اللغة الإنجليزية - موثق من وزارة التربية والتعليم')}
              </span>
            </div>
          </div>

          {/* Mobile Logo & Verified Subtitle */}
          <div className="flex lg:hidden flex-col items-start justify-center">
            <div className="flex items-center gap-1">
              <span className="text-sm font-extrabold text-[#0a4834] dark:text-white leading-tight">
                Mr. Omar Meckawy
              </span>
              <VerifiedBadge className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9.5px] font-bold text-gray-600 dark:text-emerald-400 leading-tight">
              {t('teacher.subtitle', 'مدرس اللغة الإنجليزية - موثق من وزارة التربية والتعليم')}
            </span>
          </div>
        </Link>

        {/* Center Nav Links (Desktop View) */}
        <div className="hidden lg:flex items-center space-x-6 space-x-reverse">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleAnchorClick(e, link.href)}
                className={`text-sm font-bold transition-all relative py-1 ${
                  isActive 
                    ? 'text-[#0d6e4f] dark:text-emerald-400 font-extrabold border-b-2 border-[#0d6e4f] dark:border-emerald-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:text-[#0d6e4f] dark:hover:text-emerald-400'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Left Side Actions (Mobile & Desktop) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Toggle Badge (EN 🌐) */}
          <LanguageToggle />

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* Login / Profile CTA */}
          {isAuthenticated && student ? (
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsProfileDropdownOpen(!isProfileDropdownOpen); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f4f4ee] dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full font-bold text-xs text-gray-800 dark:text-white shadow-xs hover:bg-stone-100"
              >
                <User className="w-3.5 h-3.5 text-[#0d6e4f] dark:text-emerald-400" />
                <span className="max-w-[80px] truncate">{student.fullName.split(' ')[0]}</span>
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute end-0 mt-2 w-52 bg-white dark:bg-[#121212] rounded-2xl shadow-xl py-2 border border-stone-200 dark:border-stone-800 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-stone-100 dark:border-stone-800">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{student.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{student.email}</p>
                  </div>
                  <Link href="/profile" className="flex items-center px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-stone-50 dark:hover:bg-stone-900">
                    <User className="w-4 h-4 me-2" /> الملف الشخصي
                  </Link>
                  <Link href="/notifications" className="flex items-center px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-stone-50 dark:hover:bg-stone-900">
                    <Bell className="w-4 h-4 me-2" /> الإشعارات
                  </Link>
                  <hr className="my-1 border-stone-100 dark:border-stone-800" />
                  <button 
                    onClick={logout}
                    className="flex w-full items-center px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-start"
                  >
                    <LogOut className="w-4 h-4 me-2" /> تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href="/login" 
              className="hidden lg:inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#f4f4ee] dark:bg-stone-800 hover:bg-stone-200/80 text-gray-800 dark:text-white font-bold rounded-full text-xs border border-stone-300/80 dark:border-stone-700 transition-colors shadow-xs"
            >
              <User className="w-3.5 h-3.5 text-[#0d6e4f] dark:text-emerald-400" />
              <span>{t('auth.loginBtn', 'تسجيل الدخول')}</span>
            </Link>
          )}

          {/* Hamburger Menu Icon (Mobile Only) */}
          <button 
            className="lg:hidden p-1.5 text-gray-700 dark:text-gray-300 focus:outline-none transition-colors rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-[#0d6e4f] dark:text-emerald-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Overlay */}
      <div 
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
        
        {/* Dynamic Side Drawer (Opens from end-0 side matching the Hamburger Button) */}
        <div 
          className={`fixed inset-y-0 end-0 w-80 max-w-[85vw] bg-white dark:bg-[#0c1017] h-full shadow-2xl flex flex-col border-s border-stone-200/80 dark:border-stone-800 transition-transform duration-300 ease-out z-10 ${
            isMobileMenuOpen 
              ? 'translate-x-0' 
              : isRtl 
              ? '-translate-x-full' 
              : 'translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-stone-200/80 dark:border-stone-800 flex justify-between items-center bg-[#f8faf7] dark:bg-[#080b11]">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-start text-start">
              <span className="text-base font-black text-[#0a4834] dark:text-white">
                Mr. Omar Meckawy
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                <VerifiedBadge className="w-3.5 h-3.5 shrink-0" />
                <span>{t('teacher.subtitle', 'مدرس اللغة الإنجليزية - موثق من وزارة التربية والتعليم')}</span>
              </span>
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg transition-colors bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
              aria-label="إغلاق القائمة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Drawer Body Links & Bottom Actions */}
          <div className="overflow-y-auto py-5 px-4 flex-grow flex flex-col justify-between space-y-6">
            
            {isAuthenticated ? (
              <div className="space-y-6">
                {/* Logged in Student Info Header Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-900/10 via-[#0d6e4f]/10 to-transparent dark:from-emerald-950/40 dark:to-stone-900/50 border border-[#0d6e4f]/20 dark:border-emerald-500/20 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-[#0d6e4f] text-white flex items-center justify-center font-black text-base shrink-0 shadow-sm">
                      {student?.fullName?.charAt(0) || 'S'}
                    </div>
                    <div className="flex-1 min-w-0 text-start">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-black text-gray-900 dark:text-white truncate">{student?.fullName}</p>
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-black shrink-0">
                          طالب نشط
                        </span>
                      </div>
                      <p className="text-[10.5px] font-bold text-gray-500 dark:text-gray-400 truncate mt-0.5">{student?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Structured Student Navigation Drawer Cards */}
                <div className="space-y-5">
                  {/* Category 1: التعليم والمحتوى الدراسي */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md inline-block">
                      التعليم والمحتوى الدراسي
                    </span>
                    <ul className="space-y-2">
                      {[
                        { name: 'الرئيسية', href: '/', icon: Home },
                        { name: 'اشتراكاتي', href: '/student/subscriptions', icon: CheckCircle2 },
                        { name: 'الكورسات', href: '/student/courses', icon: Video },
                        { name: 'الباقات الشهرية', href: '/student/packages', icon: Package },
                        { name: 'امتحاناتي', href: '/student/exams', icon: GraduationCap },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              onClick={(e) => {
                                handleAnchorClick(e, item.href);
                                setIsMobileMenuOpen(false);
                              }}
                              className={`group w-full flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 ${
                                isActive
                                  ? 'bg-[#0d6e4f] text-white border-[#0d6e4f] shadow-md shadow-[#0d6e4f]/25 font-black'
                                  : 'bg-white dark:bg-[#111622] hover:bg-emerald-50/60 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-100 border-stone-200/90 dark:border-stone-800/90 hover:border-[#0d6e4f]/50 dark:hover:border-emerald-500/50 shadow-2xs'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                                  isActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-[#0d6e4f]/10 text-[#0d6e4f] dark:bg-emerald-500/20 dark:text-emerald-300 border border-[#0d6e4f]/15 dark:border-emerald-500/30'
                                }`}>
                                  <Icon className="w-4.5 h-4.5" />
                                </div>
                                <span className="font-black text-xs tracking-tight">{item.name}</span>
                              </div>
                              <ChevronLeft className={`w-4 h-4 transition-transform ${isRtl ? '' : 'rotate-180'} ${isActive ? 'text-white' : 'text-gray-400 group-hover:-translate-x-0.5'}`} />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Category 2: المتجر والخدمات المالية */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md inline-block">
                      المتجر والحساب المالي
                    </span>
                    <ul className="space-y-2">
                      {[
                        { name: 'متجر الكتب', href: '/bookstore', icon: BookOpen },
                        { name: 'طلباتي', href: '/student/orders', icon: ShoppingBag },
                        { name: 'المحفظة', href: '/student/wallet', icon: Wallet },
                        { name: 'الإشعارات', href: '/student/notifications', icon: Bell },
                        { name: 'تقدمي في الدراسة', href: '/student/progress', icon: TrendingUp },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              onClick={(e) => {
                                handleAnchorClick(e, item.href);
                                setIsMobileMenuOpen(false);
                              }}
                              className={`group w-full flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 ${
                                isActive
                                  ? 'bg-[#0d6e4f] text-white border-[#0d6e4f] shadow-md shadow-[#0d6e4f]/25 font-black'
                                  : 'bg-white dark:bg-[#111622] hover:bg-emerald-50/60 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-100 border-stone-200/90 dark:border-stone-800/90 hover:border-[#0d6e4f]/50 dark:hover:border-emerald-500/50 shadow-2xs'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                                  isActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-[#0d6e4f]/10 text-[#0d6e4f] dark:bg-emerald-500/20 dark:text-emerald-300 border border-[#0d6e4f]/15 dark:border-emerald-500/30'
                                }`}>
                                  <Icon className="w-4.5 h-4.5" />
                                </div>
                                <span className="font-black text-xs tracking-tight">{item.name}</span>
                              </div>
                              <ChevronLeft className={`w-4 h-4 transition-transform ${isRtl ? '' : 'rotate-180'} ${isActive ? 'text-white' : 'text-gray-400 group-hover:-translate-x-0.5'}`} />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Category 3: المساعدة والتواصل الذكي */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md inline-block">
                      المساعدة والتواصل الذكي
                    </span>
                    <ul className="space-y-2">
                      {[
                        { name: 'الدعم والمساعدة', href: '/student/support', icon: HelpCircle },
                        { name: 'عمر مكاوي Ai', href: '/student/ai', icon: Sparkles, isAi: true },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        const isAi = item.isAi;
                        return (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              onClick={(e) => {
                                handleAnchorClick(e, item.href);
                                setIsMobileMenuOpen(false);
                              }}
                              className={`group w-full flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 ${
                                isActive
                                  ? 'bg-[#0d6e4f] text-white border-[#0d6e4f] shadow-md shadow-[#0d6e4f]/25 font-black'
                                  : isAi
                                  ? 'bg-gradient-to-r from-emerald-950/20 via-emerald-900/10 to-teal-950/20 dark:from-emerald-950/60 dark:to-stone-900 text-[#0d6e4f] dark:text-emerald-300 border-emerald-500/50 hover:border-emerald-500 shadow-sm'
                                  : 'bg-white dark:bg-[#111622] hover:bg-emerald-50/60 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-100 border-stone-200/90 dark:border-stone-800/90 hover:border-[#0d6e4f]/50 dark:hover:border-emerald-500/50 shadow-2xs'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                                  isActive
                                    ? 'bg-white/20 text-white'
                                    : isAi
                                    ? 'bg-[#0d6e4f] text-white shadow-xs'
                                    : 'bg-[#0d6e4f]/10 text-[#0d6e4f] dark:bg-emerald-500/20 dark:text-emerald-300 border border-[#0d6e4f]/15 dark:border-emerald-500/30'
                                }`}>
                                  <Icon className="w-4.5 h-4.5" />
                                </div>
                                <span className="font-black text-xs tracking-tight">{item.name}</span>
                              </div>
                              
                              <div className="flex items-center gap-1.5">
                                {isAi && (
                                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-[9.5px] shadow-xs animate-pulse">
                                    AI ✨
                                  </span>
                                )}
                                <ChevronLeft className={`w-4 h-4 transition-transform ${isRtl ? '' : 'rotate-180'} ${isActive ? 'text-white' : 'text-gray-400 group-hover:-translate-x-0.5'}`} />
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              /* Navigation Cards Section for Guests */
              <div className="space-y-3">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#0d6e4f] dark:text-emerald-400 px-1 block text-start">
                  {t('nav.menuHeading', 'أقسام المنصة')}
                </span>
                <ul className="space-y-2.5">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={(e) => {
                            handleAnchorClick(e, link.href);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`group w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 shadow-xs ${
                            isActive
                              ? 'bg-[#0d6e4f] text-white border-[#0d6e4f] shadow-md shadow-[#0d6e4f]/20'
                              : 'bg-[#f7f8f6] dark:bg-[#121620] hover:bg-[#e2ede5] dark:hover:bg-stone-800 text-gray-800 dark:text-stone-200 border-stone-200/90 dark:border-stone-800/90 hover:border-[#0d6e4f]/40 dark:hover:border-emerald-500/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-white dark:bg-stone-800 text-[#0d6e4f] dark:text-emerald-400 border border-stone-200/60 dark:border-stone-700/60 shadow-xs group-hover:scale-105'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="font-extrabold text-sm tracking-tight">{link.name}</span>
                          </div>
                          <ChevronLeft className={`w-4 h-4 transition-transform ${isRtl ? '' : 'rotate-180'} ${isActive ? 'text-white' : 'text-gray-400 group-hover:-translate-x-0.5'}`} />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Drawer Bottom Actions (Login & Register or Logout Button Card) */}
            <div className="pt-4 border-t border-stone-200/90 dark:border-stone-800/90 space-y-2.5">
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#0d6e4f] hover:bg-[#0a4834] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-[#0d6e4f]/20 transition-all active:scale-[0.98]"
                  >
                    <UserPlus className="w-4.5 h-4.5" />
                    <span>إنشاء حساب جديد</span>
                  </Link>

                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-white dark:bg-[#0f172a] text-[#0d6e4f] dark:text-emerald-400 border-2 border-[#0d6e4f]/80 dark:border-emerald-500/60 font-black text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  >
                    <LogIn className="w-4.5 h-4.5" />
                    <span>{t('auth.loginBtn', 'تسجيل الدخول')}</span>
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full p-3 rounded-2xl bg-red-50 hover:bg-red-100/80 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-extrabold text-xs flex items-center justify-between border border-red-200/80 dark:border-red-900/50 shadow-xs transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/60 flex items-center justify-center text-red-600 dark:text-red-300 shrink-0">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span>تسجيل الخروج من الحساب</span>
                  </div>
                  <ChevronLeft className={`w-4 h-4 ${isRtl ? '' : 'rotate-180'}`} />
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </nav>
  );
}

