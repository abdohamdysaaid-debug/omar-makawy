'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentLayout from '@/components/layout/StudentLayout';
import { useAuth } from '@/context/AuthContext';
import { academicYears } from '@/data/mock';
import {
  User,
  LogOut,
  GraduationCap,
  Mail,
  Phone,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  Laptop
} from 'lucide-react';
import Link from 'next/link';

export default function ProfileClient() {
  const { student, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace('/login?returnUrl=/profile');
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated || !student) {
    return (
      <StudentLayout>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
        </div>
      </StudentLayout>
    );
  }

  const academicYear = academicYears.find((y) => y.id === student.academicYearId);
  const academicYearName = student.academicYearName || academicYear?.title || 'طالب';

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in max-w-4xl">
        {/* Header Profile Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs flex flex-col md:flex-row items-center gap-6 text-center md:text-start">
          <div className="w-20 h-20 rounded-full bg-emerald-600 text-white flex items-center justify-center text-3xl font-extrabold shadow-md shadow-emerald-600/20 shrink-0">
            {student.fullName.charAt(0)}
          </div>

          <div className="flex-1 space-y-1">
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {student.fullName}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-gray-500 dark:text-gray-400 pt-1">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {academicYearName}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {student.email}
              </span>
            </div>
          </div>
        </div>

        {/* Personal Details Section */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            البيانات الشخصية
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800/50">
              <span className="text-xs text-gray-400 block mb-0.5">الاسم بالكامل</span>
              <span className="font-bold text-sm text-gray-900 dark:text-white">{student.fullName}</span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800/50">
              <span className="text-xs text-gray-400 block mb-0.5">رقم الهاتف</span>
              <span className="font-bold text-sm text-gray-900 dark:text-white" dir="ltr">
                {student.phone}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800/50">
              <span className="text-xs text-gray-400 block mb-0.5">رقم الواتساب</span>
              <span className="font-bold text-sm text-gray-900 dark:text-white" dir="ltr">
                {student.whatsapp || student.phone}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800/50">
              <span className="text-xs text-gray-400 block mb-0.5">رقم ولي الأمر</span>
              <span className="font-bold text-sm text-gray-900 dark:text-white" dir="ltr">
                {student.parentPhone}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800/50">
              <span className="text-xs text-gray-400 block mb-0.5">البريد الإلكتروني</span>
              <span className="font-bold text-sm text-gray-900 dark:text-white">{student.email}</span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800/50">
              <span className="text-xs text-gray-400 block mb-0.5">السنة الدراسية المسجلة</span>
              <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                {academicYearName}
              </span>
            </div>
          </div>
        </div>

        {/* Account Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/wallet"
            className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs hover:border-emerald-500/40 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-gray-900 dark:text-white block">المحفظة الإلكترونية</span>
                <span className="text-xs text-gray-400">الرصيد: {student.walletBalance ?? 0} ج.م</span>
              </div>
            </div>
          </Link>

          <Link
            href="/progress"
            className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs hover:border-emerald-500/40 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-gray-900 dark:text-white block">تقرير التقدم الدراسي</span>
                <span className="text-xs text-gray-400">عرض الساعات المكتملة</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Logout Action */}
        <button
          onClick={handleLogout}
          className="w-full py-4 rounded-2xl font-bold text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors flex items-center justify-center gap-2 border border-red-200/50 dark:border-red-900/30"
        >
          <LogOut className="w-4 h-4" />
          تسجيل الخروج من الحساب
        </button>
      </div>
    </StudentLayout>
  );
}
