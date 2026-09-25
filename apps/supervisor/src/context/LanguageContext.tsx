'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ar' | 'en';

interface Translations {
  [key: string]: {
    ar: string;
    en: string;
  };
}

export const supervisorTranslations: Translations = {
  'nav.supervisor_portal': { ar: 'بوابة المشرفين والمساعدين', en: 'Supervisor Portal' },
  'nav.dashboard': { ar: 'لوحة التحكم', en: 'Dashboard' },
  'nav.students': { ar: 'الطلاب المكلف بهم', en: 'Assigned Students' },
  'nav.courses': { ar: 'الكورسات المصرح بها', en: 'Permitted Courses' },
  'nav.lectures': { ar: 'المحاضرات', en: 'Lectures' },
  'nav.orders': { ar: 'طلبات الكتب', en: 'Book Orders' },
  'nav.analytics': { ar: 'الإحصائيات المحدودة', en: 'Scoped Analytics' },
  'nav.logout': { ar: 'تسجيل الخروج', en: 'Sign Out' },

  'supervisor.welcome': { ar: 'مرحباً بك في بوابة المشرفين الأكاديميين', en: 'Welcome to Academic Supervisor Portal' },
  'supervisor.subtitle': { ar: 'النطاق الأكاديمي والصلاحيات الممنوحة من قبل المعلم الرئيسي', en: 'Academic scope and permissions granted by the Principal Teacher' },
  'supervisor.assigned_years': { ar: 'السنوات الدراسية المكلف بمتابعتها:', en: 'Assigned Academic Year(s):' },
  'supervisor.permissions': { ar: 'الصلاحيات المعتمدة:', en: 'Granted Permissions:' },
  'supervisor.no_years': { ar: 'لم يتم تعيين مرحلة دراسية بعد. يرجى مراجعة المعلم الرئيسي.', en: 'No academic year assigned yet. Please contact the Principal Teacher.' },
  'supervisor.security_notice': { ar: 'ملاحظة: هذا النظام يخضع لسياسات عزل الصلاحيات الصارمة (Multi-tenancy RBAC). أي محاولة لتجاوز النطاق المحدد يتم تسجيلها في سجل الأمان.', en: 'Notice: This system strictly enforces Multi-tenancy RBAC. Any cross-tenant attempt is permanently logged.' },

  'auth.supervisor_login': { ar: 'تسجيل دخول المشرفين والمساعدين', en: 'Supervisor Portal Login' },
  'auth.phone': { ar: 'رقم الهاتف المسجل', en: 'Registered Mobile Number' },
  'auth.password': { ar: 'كلمة المرور', en: 'Password' },
  'auth.login_btn': { ar: 'تسجيل الدخول إلى البوابة', en: 'Sign In to Supervisor Portal' },

  'common.loading': { ar: 'جاري التحميل...', en: 'Loading...' },
  'common.empty': { ar: 'لا توجد بيانات متاحة', en: 'No data available' },
};

interface LanguageContextType {
  language: Language;
  dir: 'rtl' | 'ltr';
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');

  useEffect(() => {
    const saved = localStorage.getItem('supervisor_lang') as Language;
    if (saved === 'ar' || saved === 'en') {
      setLanguageState(saved);
      document.documentElement.setAttribute('lang', saved);
      document.documentElement.setAttribute('dir', saved === 'ar' ? 'rtl' : 'ltr');
    } else {
      document.documentElement.setAttribute('lang', 'ar');
      document.documentElement.setAttribute('dir', 'rtl');
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('supervisor_lang', lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const t = (key: string): string => {
    const entry = supervisorTranslations[key];
    if (!entry) return key;
    return entry[language] || entry.en || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider
      value={{
        language,
        dir,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
