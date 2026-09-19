'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { useAuth } from '@/context/AuthContext';
import { academicYears } from '@/data/mock';
import { User, LogOut, Edit, BookOpen, GraduationCap, Mail, CreditCard, Laptop, ShoppingBag } from 'lucide-react';

export default function ProfileClient() {
  const { student, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login?returnUrl=/profile');
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated || !student) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center font-cairo">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const academicYear = academicYears.find(y => y.id === student.academicYearId);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-cairo pb-16 md:pb-0">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl pt-24">
        {/* Header */}
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center gap-6 mb-8 text-center md:text-start">
          <div className="w-24 h-24 rounded-full bg-brand-500/10 dark:bg-brand-900/30 flex items-center justify-center text-brand-500 text-3xl font-bold">
            {student.fullName.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{student.fullName}</h1>
            <div className="flex flex-col md:flex-row gap-2 md:gap-4 text-gray-600 dark:text-gray-400 text-sm">
              <span className="flex items-center justify-center md:justify-start gap-1"><GraduationCap className="w-4 h-4"/> {academicYear?.title}</span>
              <span className="flex items-center justify-center md:justify-start gap-1"><Mail className="w-4 h-4"/> {student.email}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Personal Info */}
          <section className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="text-brand-500 w-5 h-5"/> البيانات الشخصية
              </h2>
              <button className="text-brand-500 hover:bg-brand-500/10 p-2 rounded-lg transition-colors" title="تعديل">
                <Edit className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">الاسم</p>
                <p className="font-bold text-gray-900 dark:text-white">{student.fullName}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">رقم الهاتف</p>
                <p className="font-bold text-gray-900 dark:text-white" dir="ltr">{student.phone}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">واتساب</p>
                <p className="font-bold text-gray-900 dark:text-white" dir="ltr">{student.whatsapp}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">البريد الإلكتروني</p>
                <p className="font-bold text-gray-900 dark:text-white">{student.email}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">رقم ولي الأمر</p>
                <p className="font-bold text-gray-900 dark:text-white" dir="ltr">{student.parentPhone}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">السنة الدراسية</p>
                <p className="font-bold text-gray-900 dark:text-white">{academicYear?.title}</p>
              </div>
            </div>
          </section>

          {/* Enrolled Courses */}
          <section className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <BookOpen className="text-brand-500 w-5 h-5"/> الكورسات المشتركة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="border border-gray-100 dark:border-gray-800 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">كورس اللغة الإنجليزية - ثالثة ثانوي (الوحدة {i})</h3>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">نسبة الإنجاز</span>
                    <span className="font-bold text-brand-500">{i * 35}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-brand-500 h-2 rounded-full transition-all" style={{ width: `${i * 35}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Orders */}
            <section className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                <ShoppingBag className="text-brand-500 w-5 h-5"/> الطلبات
              </h2>
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                لا توجد طلبات حالياً
              </div>
            </section>

            {/* Wallet */}
            <section className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                <CreditCard className="text-brand-500 w-5 h-5"/> المحفظة
              </h2>
              <div className="bg-brand-500 text-white rounded-xl p-6 text-center">
                <p className="text-white/80 mb-1">الرصيد المتاح</p>
                <p className="text-4xl font-bold mb-4">0 <span className="text-xl font-normal">جنيه</span></p>
                <button className="bg-white text-brand-500 px-6 py-2 rounded-full font-bold w-full hover:bg-gray-50 transition-colors">
                  شحن المحفظة
                </button>
              </div>
            </section>
          </div>

          {/* Devices */}
          <section className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <Laptop className="text-brand-500 w-5 h-5"/> الأجهزة
            </h2>
            <div className="border border-brand-500/20 bg-brand-500/5 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <p className="font-bold text-gray-900 dark:text-white">جهازك الحالي</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Windows - Chrome</p>
              </div>
              <span className="text-brand-500 bg-brand-500/10 px-3 py-1 rounded-full text-sm font-bold">
                جهاز واحد مسجل من 2
              </span>
            </div>
          </section>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-red-500 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors mt-8"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>
      </main>
      
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
