'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ar' | 'en';

interface Translations {
  [key: string]: {
    ar: string;
    en: string;
  };
}

export const translations: Translations = {
  // Navigation
  'nav.dashboard': { ar: 'لوحة التحكم', en: 'Dashboard' },
  'nav.logout': { ar: 'تسجيل الخروج', en: 'Sign Out' },
  'nav.academic': { ar: 'الشؤون الأكاديمية والمناهج', en: 'Academic & Courses' },
  'nav.courses': { ar: 'الكورسات والمناهج', en: 'Courses' },
  'nav.lectures': { ar: 'المحاضرات والدروس', en: 'Lectures' },
  'nav.videos': { ar: 'الفيديوهات', en: 'Videos' },
  'nav.attachments': { ar: 'المذكرات والمرفقات', en: 'Attachments' },
  'nav.packages': { ar: 'الباقات والعروض', en: 'Packages' },
  'nav.students': { ar: 'الطلاب والمستخدمين', en: 'Students & Users' },
  'nav.students_list': { ar: 'دليل الطلاب', en: 'Students' },
  'nav.devices': { ar: 'أجهزة الطلاب والجلسات', en: 'Devices' },
  'nav.subscriptions': { ar: 'الاشتراكات والتسجيل', en: 'Subscriptions' },
  'nav.financial': { ar: 'المالية والمحافظ', en: 'Finance & Wallets' },
  'nav.wallets': { ar: 'محافظ الطلاب', en: 'Wallets' },
  'nav.recharge_codes': { ar: 'أكواد الشحن', en: 'Recharge Codes' },
  'nav.discounts': { ar: 'كوبونات الخصم', en: 'Discounts' },
  'nav.invoices': { ar: 'الفواتير والمعاملات', en: 'Invoices' },
  'nav.bookstore': { ar: 'متجر الكتب والمخزون', en: 'Bookstore & Inventory' },
  'nav.books': { ar: 'دليل الكتب والمذكرات', en: 'Books Catalog' },
  'nav.inventory': { ar: 'إدارة المخزون', en: 'Inventory' },
  'nav.orders': { ar: 'طلبات الكتب', en: 'Orders' },
  'nav.shipping': { ar: 'المحافظات والشحن', en: 'Shipping' },
  'nav.notifications': { ar: 'الإشعارات والتنبيهات', en: 'Notifications' },
  'nav.analytics': { ar: 'التقارير والإحصائيات', en: 'Analytics' },
  'nav.administration': { ar: 'الإدارة والنظام', en: 'Administration' },
  'nav.supervisors': { ar: 'المشرفين الأكاديميين', en: 'Supervisors' },
  'nav.audit_logs': { ar: 'سجل العمليات والتدقيق', en: 'Audit Logs' },
  'nav.security_events': { ar: 'أحداث الأمان والتحذيرات', en: 'Security Events' },
  'nav.settings': { ar: 'إعدادات المنصة', en: 'Settings' },

  // Brand & Header
  'brand.title': { ar: 'بوابة الكادر التعليمي', en: 'Staff Portal' },
  'brand.subtitle': { ar: 'منصة مستر عمر مكاوي للغة الإنجليزية', en: 'Mr. Omar Meckawy English Platform' },
  'brand.teacher_name': { ar: 'مستر عمر مكاوي', en: 'Mr. Omar Meckawy' },

  // Roles
  'role.teacher': { ar: 'المعلم / الإدارة العامة', en: 'Teacher / Super Admin' },
  'role.supervisor': { ar: 'مشرف أكاديمي', en: 'Academic Supervisor' },

  // Auth & Login
  'auth.login_title': { ar: 'تسجيل دخول الإدارة والمعلمين', en: 'Administration & Staff Login' },
  'auth.login_subtitle': { ar: 'منصة عمر مكاوي التعليمية للغة الإنجليزية', en: 'Omar Makawy English Educational Platform' },
  'auth.phone_label': { ar: 'رقم الهاتف المسجل', en: 'Registered Phone Number' },
  'auth.phone_placeholder': { ar: 'أدخل رقم الهاتف المسجل', en: 'Enter registered phone number' },
  'auth.password_label': { ar: 'كلمة المرور', en: 'Password' },
  'auth.password_placeholder': { ar: 'أدخل كلمة المرور', en: 'Enter password' },
  'auth.device_id': { ar: 'معرف الجهاز:', en: 'Device ID:' },
  'auth.login_button': { ar: 'تسجيل الدخول إلى لوحة التحكم', en: 'Sign In to Dashboard' },
  'auth.logging_in': { ar: 'جاري تسجيل الدخول...', en: 'Signing in...' },
  'auth.2fa_title': { ar: 'التحقق بخطوتين (2FA)', en: 'Two-Factor Authentication' },
  'auth.2fa_desc': { ar: 'أدخل الرمز المكون من 6 أرقام من تطبيق Authenticator الخاص بك', en: 'Enter the 6-digit verification code from your Authenticator app' },
  'auth.2fa_code': { ar: 'رمز التحقق (TOTP)', en: 'Verification Code (TOTP)' },
  'auth.2fa_verify': { ar: 'تأكيد الرمز والمتابعة', en: 'Verify & Continue' },

  // Dashboard Landing
  'dashboard.title': { ar: 'لوحة القيادة الرئيسية', en: 'Staff Workspace' },
  'dashboard.welcome': { ar: 'مرحباً بك في بوابة الكادر التعليمي', en: 'Welcome to the Staff Portal' },
  'dashboard.role_banner': { ar: 'نوع الحساب والصلاحيات:', en: 'Account Role & Scope:' },
  'dashboard.assigned_years': { ar: 'المراحل الدراسية المصرح بها:', en: 'Assigned Academic Years:' },
  'dashboard.granted_permissions': { ar: 'الصلاحيات الإدارية الممنوحة:', en: 'Granted Permissions:' },
  'dashboard.global_access': { ar: 'وصول إداري شامل لجميع المراحل (Global Scope)', en: 'Global access across all grades & modules' },
  'dashboard.security_notice': { ar: 'تخضع جميع العمليات للتحقق الصارم وتسجيل الأحداث الأمنية في سجل التدقيق المباشر.', en: 'All operations are strictly authorized and logged to the central security audit trail.' },

  // Common UI
  'common.loading': { ar: 'جاري التحميل...', en: 'Loading...' },
  'common.verifying_auth': { ar: 'جاري التحقق من هوية الكادر التعليمي...', en: 'Verifying staff credentials...' },
  'common.redirecting': { ar: 'جاري التحويل إلى صفحة الدخول...', en: 'Redirecting to login...' },
  'common.cancel': { ar: 'إلغاء', en: 'Cancel' },
  'common.back': { ar: 'رجوع', en: 'Back' },
  'common.dark_mode': { ar: 'الوضع الليلي', en: 'Dark Mode' },
  'common.light_mode': { ar: 'الوضع النهاري', en: 'Light Mode' },
};

interface LanguageContextType {
  language: Language;
  dir: 'rtl' | 'ltr';
  isArabic: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');

  useEffect(() => {
    const saved = localStorage.getItem('staff_lang') as Language;
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
    localStorage.setItem('staff_lang', lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] || entry.en || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const isArabic = language === 'ar';

  return (
    <LanguageContext.Provider
      value={{
        language,
        dir,
        isArabic,
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
