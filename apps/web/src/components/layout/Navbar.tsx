'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, User, Bell, LogOut, GraduationCap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
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
      d="M22.5 12.5c0-1.58-.8-2.97-2-3.79.43-1.52.09-3.2-1.01-4.3-1.1-1.1-2.78-1.44-4.3-1.01C14.37 2.2 12.98 1.4 11.4 1.4c-1.58 0-2.97.8-3.79 2C6.09 2.97 4.41 3.31 3.31 4.41c-1.1 1.1-1.44 2.78-1.01 4.3C1.1 9.53.3 10.92.3 12.5c0 1.58.8 2.97 2 3.79-.43 1.52-.09 3.2 1.01 4.3 1.1 1.1 2.78 1.44 4.3 1.01.82 1.2 2.21 2 3.79 2 1.58 0 2.97-.8 3.79-2 1.52.43 3.2.09 4.3-1.01 1.1-1.1 1.44-2.78 1.01-4.3 1.2-.82 2-2.21 2-3.79z" 
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
  const { totalItems } = useCart();
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
    { name: t('nav.home', 'الرئيسية'), href: '/' },
    { name: t('nav.packages', 'الباقات'), href: '/packages' },
    { name: t('nav.courses', 'الكورسات'), href: '/courses' },
    { name: t('nav.books', 'الكتب'), href: '/bookstore' },
    { name: t('nav.account', 'حسابي'), href: '/profile' },
  ];

  return (
    <nav className="fixed top-2 sm:top-4 start-2 end-2 sm:start-4 sm:end-4 max-w-7xl mx-auto z-50 transition-all duration-300 font-cairo">
      <div className={`w-full rounded-full transition-all duration-300 px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between border shadow-lg ${
        isScrolled
          ? 'bg-white/95 dark:bg-[#0c1017]/95 backdrop-blur-md border-stone-200/80 dark:border-stone-800 shadow-black/10'
          : 'bg-white/90 dark:bg-[#0c1017]/90 backdrop-blur-md border-stone-200/60 dark:border-stone-800/80 shadow-black/5'
      }`}>
        
        {/* Right Side (RTL): Brand Logo & Verified Teacher Credentials */}
        <Link href="/" className="flex items-center gap-2 text-start group">
          {/* Desktop Logo */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#0d6e4f] text-white flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-[#0a4834] dark:text-white tracking-tight">
              Omar Meckawy
            </span>
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

          {/* Shopping Cart Button */}
          <Link href="/cart" className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-[#0d6e4f] transition-colors rounded-full hover:bg-stone-100 dark:hover:bg-stone-800" title="سلة التسوق">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -end-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </Link>

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
        
        {/* Dynamic Side Drawer (Right in RTL / Left in LTR) */}
        <div 
          className={`fixed inset-y-0 start-0 w-72 max-w-[80vw] bg-white dark:bg-[#080808] h-full shadow-2xl flex flex-col border-e border-stone-200/80 dark:border-stone-800 transition-transform duration-300 ease-out z-10 ${
            isMobileMenuOpen 
              ? 'translate-x-0' 
              : isRtl 
              ? 'translate-x-full' 
              : '-translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="p-4 border-b border-stone-200/80 dark:border-stone-800 flex justify-between items-center">
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
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg transition-colors"
              aria-label="إغلاق القائمة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Drawer Body Links */}
          <div className="overflow-y-auto py-4 px-4 flex-grow space-y-4">
            {!isAuthenticated && (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#0d6e4f] text-white rounded-full font-bold text-sm shadow-md"
              >
                <User className="w-4 h-4" />
                <span>{t('auth.loginBtn', 'تسجيل الدخول للطالب')}</span>
              </Link>
            )}

            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-[#e2ede5] dark:hover:bg-stone-900 font-bold transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
