'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PasswordInput from '@/components/auth/PasswordInput';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    studentPhone: '',
    whatsappPhone: '',
    email: '',
    parentPhone: '',
    gradeId: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let isValid = true;
    const newErrors: Record<string, string> = {};

    // Validate empty fields
    Object.keys(formData).forEach((key) => {
      if (!formData[key as keyof typeof formData]) {
        newErrors[key] = 'هذا الحقل مطلوب';
        isValid = false;
      }
    });

    // Validate full name (exactly 4 words)
    if (formData.fullName) {
      const words = formData.fullName.trim().split(/\s+/).filter(Boolean);
      if (words.length !== 4) {
        newErrors.fullName = 'من فضلك اكتب اسم الطالب رباعي كما هو في بياناته الرسمية.';
        isValid = false;
      }
    }

    // Validate password requirements
    if (formData.password) {
      const hasUppercase = /[A-Z]/.test(formData.password);
      const hasLowercase = /[a-z]/.test(formData.password);
      const hasDigit = /[0-9]/.test(formData.password);
      const hasMinLength = formData.password.length >= 8;
      
      if (!hasUppercase || !hasLowercase || !hasDigit || !hasMinLength) {
        newErrors.password = 'كلمة المرور لا تلبي المتطلبات';
        isValid = false;
      }
    }

    // Validate confirm password
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      setIsSubmitting(true);
      try {
        await register(formData as any);
        const returnUrl = searchParams.get('returnUrl') || '/';
        router.push(returnUrl);
      } catch (error) {
        console.error('Registration failed', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="mb-4 mt-8 flex items-center gap-3">
      <div className="h-6 w-1 rounded bg-brand-500"></div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white font-cairo">{title}</h3>
      <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
    </div>
  );

  const InputField = ({ label, name, type = 'text', placeholder, dir = 'auto' }: any) => (
    <div className="mb-4">
      <label className="mb-2 block font-cairo text-sm font-bold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name as keyof typeof formData]}
        onChange={handleChange}
        placeholder={placeholder}
        dir={dir}
        className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-surface-dark dark:text-white font-cairo ${
          errors[name] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        }`}
      />
      {errors[name] && <p className="mt-1 text-sm text-red-500 font-cairo">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <SectionHeader title="بيانات الطالب" />
      <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <InputField label="اسم الطالب الرباعي" name="fullName" placeholder="الاسم رباعي" />
        </div>
        <InputField label="رقم هاتف الطالب" name="studentPhone" type="tel" placeholder="رقم الهاتف" dir="ltr" />
        <InputField label="رقم واتساب الطالب" name="whatsappPhone" type="tel" placeholder="رقم الواتساب" dir="ltr" />
        <div className="md:col-span-2">
          <InputField label="البريد الإلكتروني للطالب" name="email" type="email" placeholder="البريد الإلكتروني" dir="ltr" />
        </div>
      </div>

      <SectionHeader title="بيانات ولي الأمر" />
      <div className="grid grid-cols-1 md:grid-cols-2">
        <InputField label="رقم هاتف ولي الأمر" name="parentPhone" type="tel" placeholder="رقم هاتف ولي الأمر" dir="ltr" />
      </div>

      <SectionHeader title="البيانات الدراسية" />
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-cairo text-sm font-bold text-gray-700 dark:text-gray-300">
            السنة الدراسية
          </label>
          <select
            name="gradeId"
            value={formData.gradeId}
            onChange={handleChange}
            className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-surface-dark dark:text-white font-cairo ${
              errors.gradeId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <option value="">اختر السنة الدراسية</option>
            <option value="1">الصف الثالث الإعدادي</option>
            <option value="2">الصف الأول الثانوي</option>
            <option value="3">الصف الثاني الثانوي</option>
            <option value="4">الصف الثالث الثانوي</option>
          </select>
          {errors.gradeId && <p className="mt-1 text-sm text-red-500 font-cairo">{errors.gradeId}</p>}
        </div>
      </div>

      <SectionHeader title="الأمان" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-cairo text-sm font-bold text-gray-700 dark:text-gray-300">
            كلمة المرور
          </label>
          <PasswordInput
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            showRequirements={true}
          />
        </div>
        <div>
          <label className="mb-2 block font-cairo text-sm font-bold text-gray-700 dark:text-gray-300">
            تأكيد كلمة المرور
          </label>
          <PasswordInput
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-8 w-full rounded-lg bg-brand-500 px-4 py-3 text-lg font-bold text-white transition-colors hover:bg-brand-500/90 disabled:opacity-70 font-cairo"
      >
        {isSubmitting ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب'}
      </button>

      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 font-cairo">
        لديك حساب بالفعل؟{' '}
        <Link href="/login" className="font-bold text-brand-500 hover:underline">
          تسجيل الدخول
        </Link>
      </div>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col bg-warm-200 dark:bg-black">
      <Navbar />
      <main className="flex flex-1 items-center justify-center p-4 py-12">
        <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl dark:bg-surface-dark">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-brand-500 font-cairo">Omar Makawi</h1>
            <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white font-cairo">إنشاء حساب جديد</h2>
            <p className="text-gray-600 dark:text-gray-400 font-cairo">
              أنشئ حسابك للوصول إلى جميع الكورسات والمحتوى التعليمي
            </p>
          </div>
          <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800"></div>}>
            <RegisterForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
