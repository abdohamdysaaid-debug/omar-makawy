'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingCart, User, Bell, LogOut, ChevronDown } from 'lucide-react';
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

  // Close dropdown when clicking outside
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
    { name: 'مميزات المنصة', href: '/#features' },
    { name: 'آراء الطلاب', href: '/#testimonials' },
    { name: 'تواصل معنا', href: '/#contact' },
  ];

  return (
    <nav className={`fixed top-0 start-0 end-0 z-50 transition-all duration-300 font-cairo ${
      isScrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm py-3' : 'bg-white dark:bg-gray-900 py-4'
    }`}>
      <div className="container mx-auto px-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex flex-col items-start">
          <span className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-none mb-1" style={{ fontStyle: 'italic' }}>
            Omar Makawi
          </span>
          <span className="text-xs md:text-sm text-brand-500 font-medium leading-none">
            English Made Simple
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-8 space-x-reverse">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
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
          <ThemeToggle />
          
          <Link href="/cart" className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-brand-500 transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute top-0 end-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </Link>

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
                <div className="absolute end-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-lg py-2 border border-gray-200 dark:border-gray-700 animate-fade-in">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{student.fullName}</p>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </div>
                  <Link href="/profile" className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <User className="w-4 h-4 me-2" /> الملف الشخصي
                  </Link>
                  <Link href="/notifications" className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <Bell className="w-4 h-4 me-2" /> الإشعارات
                  </Link>
                  <hr className="my-1 border-gray-100 dark:border-gray-700" />
                  <button 
                    onClick={logout}
                    className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-start"
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
            className="lg:hidden p-2 text-gray-700 dark:text-gray-300"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-72 max-w-sm bg-white dark:bg-gray-900 h-full shadow-xl flex flex-col start-0">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 dark:text-white" style={{ fontStyle: 'italic' }}>Omar Makawi</span>
                <span className="text-xs text-brand-500">English Made Simple</span>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto py-4 px-4 flex-grow">
              {isAuthenticated && student && (
                <div className="flex items-center space-x-3 space-x-reverse mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold">
                    {student.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{student.fullName}</p>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </div>
                </div>
              )}

              <ul className="space-y-1">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-gray-800 font-medium"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
                {isAuthenticated && (
                  <>
                    <li>
                      <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-gray-800 font-medium">
                        الملف الشخصي
                      </Link>
                    </li>
                    <li>
                      <Link href="/notifications" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-gray-800 font-medium">
                        الإشعارات
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              {isAuthenticated ? (
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-center py-3 text-red-600 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <LogOut className="w-5 h-5 me-2" /> تسجيل الخروج
                </button>
              ) : (
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center px-4 py-3 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600">
                  ابدأ الآن
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
