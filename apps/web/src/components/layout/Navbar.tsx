'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, User, Bell, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguageToggle from '@/components/ui/LanguageToggle';

// Verified Badge Icon (Vibrant Blue scalloped badge with white checkmark)
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
    { name: t('nav.courses', 'الكورسات'), href: '/courses' },
    { name: t('nav.features', 'مميزات المنصة'), href: '/#features' },
    { name: t('nav.testimonials', 'آراء الطلاب'), href: '/#testimonials' },
    { name: t('nav.contact', 'تواصل معنا'), href: '/#contact' },
  ];

  return (
    <nav className="fixed top-2 sm:top-3 start-3 end-3 max-w-7xl mx-auto z-50 transition-all duration-300 font-cairo">
      <div className={`w-full rounded-2xl transition-all duration-300 px-4 py-2 flex items-center justify-between border shadow-lg ${
        isScrolled
          ? 'bg-white/85 dark:bg-[#000000]/85 backdrop-blur-md border-gray-200/60 dark:border-stone-800/80 shadow-black/15'
          : 'bg-white/75 dark:bg-[#000000]/65 backdrop-blur-md border-gray-200/40 dark:border-stone-800/50 shadow-black/10'
      }`}>
        
        {/* Logo & Subtitle */}
        <Link href="/" className="flex items-center gap-2 text-start">
          <div className="flex flex-col items-start justify-center">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg md:text-xl font-black bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 dark:from-emerald-400 dark:via-emerald-300 dark:to-teal-300 bg-clip-text text-transparent leading-none tracking-tight">
                Mr. Omar Meckawy
              </span>
              {isAuthenticated && student && (
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] border border-emerald-400/30 shrink-0 shadow-xs">
                  {student.fullName ? student.fullName.charAt(0).toUpperCase() : 'OM'}
                </div>
              )}
            </div>
            <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10.5px] font-extrabold text-emerald-700 dark:text-emerald-400 leading-none mt-1">
              <VerifiedBadge className="w-3.5 h-3.5 shrink-0" />
              <span>{t('teacher.subtitle', 'مدرس اللغة الإنجليزية - موثق من وزارة التربية والتعليم')}</span>
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-8 space-x-reverse">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium transition-colors hover:text-brand-500 ${
                  isActive ? 'text-brand-500 border-b-2 border-brand-500 pb-1' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3 space-x-reverse">
          <LanguageToggle />
          <ThemeToggle />
          
          {isAuthenticated && (
            <Link href="/cart" className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-brand-500 transition-colors" title="سلة التسوق">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-0 end-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated && student ? (
            <div className="relative hidden lg:block">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsProfileDropdownOpen(!isProfileDropdownOpen); }}
                className="flex items-center space-x-2 space-x-reverse focus:outline-none"
              >
                <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-sm">
                  {student.fullName.charAt(0)}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute end-0 mt-2 w-52 bg-white dark:bg-[#121212] rounded-xl shadow-lg py-2 border border-gray-200 dark:border-stone-800 animate-fade-in">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-stone-800">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{student.fullName}</p>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </div>
                  <Link href="/profile" className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">
                    <User className="w-4 h-4 me-2" /> الملف الشخصي
                  </Link>
                  <Link href="/notifications" className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">
                    <Bell className="w-4 h-4 me-2" /> الإشعارات
                  </Link>
                  <hr className="my-1 border-gray-100 dark:border-stone-800" />
                  <button 
                    onClick={logout}
                    className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-start"
                  >
                    <LogOut className="w-4 h-4 me-2" /> تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="hidden lg:inline-flex px-5 py-2 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 transition-colors text-sm">
              ابدأ الآن
            </Link>
          )}

          <button 
            className="lg:hidden p-2 text-gray-700 dark:text-gray-300 focus:outline-none transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
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
          <div className="p-4 border-b border-gray-200/80 dark:border-stone-800 flex justify-between items-center">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col items-start text-start">
              <span className="text-base font-black bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                Mr. Omar Meckawy
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
                <VerifiedBadge className="w-3.5 h-3.5 shrink-0" />
                <span>{t('teacher.subtitle', 'مدرس اللغة الإنجليزية - موثق من وزارة التربية والتعليم')}</span>
              </span>
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg transition-colors"
              aria-label="إغلاق القائمة"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Drawer Body Links */}
          <div className="overflow-y-auto py-4 px-4 flex-grow space-y-4">
            {isAuthenticated && student && (
              <div className="flex items-center space-x-3 space-x-reverse p-3 bg-gray-50 dark:bg-[#121212] border border-gray-100 dark:border-stone-800 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-sm border border-emerald-500/30 shrink-0">
                  {student.fullName ? student.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col text-start overflow-hidden">
                  <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{student.fullName}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 truncate">{student.academicYearName || 'طالب'}</p>
                </div>
              </div>
            )}

            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-stone-900 font-bold transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              {isAuthenticated && (
                <>
                  <li>
                    <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-stone-900 font-bold transition-colors text-sm">
                      {t('nav.profile', 'الملف الشخصي')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/notifications" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-stone-900 font-bold transition-colors text-sm">
                      {t('nav.notifications', 'الإشعارات')}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
          
          {/* Drawer Footer */}
          <div className="p-4 border-t border-gray-200/80 dark:border-stone-800">
            {isAuthenticated ? (
              <button 
                onClick={() => { logout(); setIsMobileMenuOpen(false); }} 
                className="w-full flex items-center justify-center py-3 text-red-600 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors text-sm"
              >
                <LogOut className="w-5 h-5 me-2" /> {t('nav.logout', 'تسجيل الخروج')}
              </button>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="block w-full text-center px-4 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-md text-sm"
              >
                {t('nav.startNow', 'ابدأ الآن')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
