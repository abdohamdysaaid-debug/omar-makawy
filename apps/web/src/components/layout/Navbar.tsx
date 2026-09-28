'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, User, Bell, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const pathname = usePathname();
  const { isAuthenticated, student, logout } = useAuth();
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = () => setIsProfileDropdownOpen(false);
    if (isProfileDropdownOpen) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [isProfileDropdownOpen]);

  const navLinks = [
    { name: 'الرئيسية', href: '/' },
    { name: 'الكورسات', href: '/courses' },
    { name: 'الباقات', href: '/#packages' },
    { name: 'المتجر والكتب', href: '/bookstore' },
    { name: 'عن المدرس', href: '/#features' },
    { name: 'تواصل معنا', href: '/support' },
  ];

  return (
    <nav
      className={`fixed top-0 start-0 end-0 z-50 transition-all duration-300 font-cairo ${
        isScrolled
          ? 'bg-white/95 dark:bg-[#0b0f19]/95 backdrop-blur-md shadow-sm py-3'
          : 'bg-white dark:bg-[#0b0f19] py-4 border-b border-gray-100 dark:border-gray-800/80'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white font-black flex items-center justify-center text-lg shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            OM
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold text-gray-900 dark:text-white leading-none mb-1">
              Omar Makawy
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold leading-none">
              English Teacher
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-bold transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 pb-1'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link
            href="/cart"
            className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 transition-colors"
            title="السلة"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute top-0 end-0 w-4 h-4 bg-emerald-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </Link>

          {isAuthenticated && student ? (
            <div className="relative hidden lg:block">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsProfileDropdownOpen(!isProfileDropdownOpen);
                }}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  {student.avatarUrl ? (
                    <img
                      src={student.avatarUrl}
                      alt={student.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    student.fullName.charAt(0)
                  )}
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white max-w-[120px] truncate">
                  {student.fullName.split(' ')[0]}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isProfileDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute end-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl py-2 border border-gray-100 dark:border-gray-800 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{student.fullName}</p>
                    <p className="text-xs text-gray-400 truncate">{student.email}</p>
                  </div>
                  <Link
                    href="/"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800"
                  >
                    <LayoutDashboard className="w-4 h-4 text-emerald-600" /> لوحة الطالب
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800"
                  >
                    <User className="w-4 h-4 text-gray-400" /> الملف الشخصي
                  </Link>
                  <Link
                    href="/notifications"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800"
                  >
                    <Bell className="w-4 h-4 text-gray-400" /> الإشعارات
                  </Link>
                  <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                  <button
                    onClick={logout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-start"
                  >
                    <LogOut className="w-4 h-4" /> تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden lg:inline-flex px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20"
            >
              تسجيل الدخول
            </Link>
          )}

          {/* Mobile Drawer Trigger */}
          <button
            className="lg:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="القائمة"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-72 max-w-sm bg-white dark:bg-[#0b0f19] h-full shadow-2xl flex flex-col start-0">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                  OM
                </div>
                <span className="font-extrabold text-base text-gray-900 dark:text-white">Omar Makawy</span>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 px-4 flex-grow space-y-4">
              {isAuthenticated && student && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-gray-900 rounded-2xl border border-emerald-100 dark:border-gray-800">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                    {student.avatarUrl ? (
                      <img src={student.avatarUrl} alt={student.fullName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      student.fullName.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{student.fullName}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">طالب مسجل</p>
                  </div>
                </div>
              )}

              <ul className="space-y-1">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 font-bold text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 text-red-600 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" /> تسجيل الخروج
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md"
                >
                  تسجيل الدخول
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
