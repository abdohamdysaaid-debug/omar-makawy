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
  // Navigation & Sections
  'nav.dashboard': { ar: 'لوحة التحكم', en: 'Dashboard' },
  'nav.overview': { ar: 'نظرة عامة', en: 'Overview' },
  'nav.academic': { ar: 'الشؤون الأكاديمية', en: 'Academic Management' },
  'nav.academic_years': { ar: 'السنوات الدراسية', en: 'Academic Years' },
  'nav.courses': { ar: 'الكورسات', en: 'Courses' },
  'nav.lectures': { ar: 'المحاضرات', en: 'Lectures' },
  'nav.videos': { ar: 'الفيديوهات', en: 'Videos' },
  'nav.attachments': { ar: 'الملحقات والملازم', en: 'Attachments' },
  'nav.packages': { ar: 'الباقات التعليمية', en: 'Packages' },
  'nav.students': { ar: 'شؤون الطلاب', en: 'Students' },
  'nav.students_list': { ar: 'قائمة الطلاب', en: 'Students Directory' },
  'nav.devices': { ar: 'أجهزة الطلاب', en: 'Student Devices' },
  'nav.subscriptions': { ar: 'الاشتراكات', en: 'Subscriptions' },
  'nav.financial': { ar: 'الشؤون المالية', en: 'Financial' },
  'nav.wallets': { ar: 'المحافظ الإلكترونية', en: 'Wallets' },
  'nav.recharge_codes': { ar: 'كروت الشحن', en: 'Recharge Codes' },
  'nav.activation_codes': { ar: 'أكواد التفعيل', en: 'Activation Codes' },
  'nav.discounts': { ar: 'كوبونات الخصم', en: 'Discount Coupons' },
  'nav.invoices': { ar: 'الفواتير والمعاملات', en: 'Invoices & Transactions' },
  'nav.bookstore': { ar: 'المكتبة والكتب', en: 'Bookstore' },
  'nav.books': { ar: 'الكتب والمذكرات', en: 'Books Catalog' },
  'nav.inventory': { ar: 'حركة المخزن', en: 'Inventory Ledger' },
  'nav.orders': { ar: 'طلبات الشراء', en: 'Book Orders' },
  'nav.shipping': { ar: 'الشحن والمحافظات', en: 'Shipping & Governorates' },
  'nav.notifications': { ar: 'الإشعارات والتنبيهات', en: 'Broadcast Notifications' },
  'nav.analytics': { ar: 'التقارير والإحصائيات', en: 'Platform Analytics' },
  'nav.administration': { ar: 'إدارة النظام', en: 'Administration' },
  'nav.supervisors': { ar: 'المساعدين والمشرفين', en: 'Supervisors' },
  'nav.audit_logs': { ar: 'سجل العمليات (Audit)', en: 'Audit Logs' },
  'nav.security_events': { ar: 'أحداث الأمان والحماية', en: 'Security Events' },
  'nav.settings': { ar: 'إعدادات المنصة', en: 'Platform Settings' },
  'nav.profile': { ar: 'الملف الشخصي', en: 'My Profile' },
  'nav.logout': { ar: 'تسجيل الخروج', en: 'Sign Out' },

  // Dashboard Overview
  'dashboard.title': { ar: 'لوحة التحكم الإدارية', en: 'Administrative Dashboard' },
  'dashboard.welcome': { ar: 'مرحباً بك، مستر عمر مكاوي', en: 'Welcome back, Mr. Omar Makawy' },
  'dashboard.subtitle': { ar: 'متابعة حية وشاملة لأداء المنصة التعليمية والعمليات الإدارية والمالية', en: 'Real-time comprehensive overview of academic, financial, and administrative operations' },
  'dashboard.kpi.total_students': { ar: 'إجمالي الطلاب المسجلين', en: 'Total Students' },
  'dashboard.kpi.active_students': { ar: 'الطلاب النشطون', en: 'Active Students' },
  'dashboard.kpi.courses': { ar: 'الكورسات المفعلة', en: 'Active Courses' },
  'dashboard.kpi.lectures': { ar: 'إجمالي المحاضرات', en: 'Total Lectures' },
  'dashboard.kpi.revenue': { ar: 'إجمالي الإيرادات', en: 'Total Revenue' },
  'dashboard.kpi.wallet_balance': { ar: 'أرصدة المحافظ', en: 'Total Wallet Balance' },
  'dashboard.kpi.orders': { ar: 'طلبات الكتب المعلقة', en: 'Pending Book Orders' },
  'dashboard.kpi.books_stock': { ar: 'الكتب المتاحة بالمخزن', en: 'Books in Stock' },
  'dashboard.academic_breakdown': { ar: 'توزيع الطلاب حسب المراحل الدراسية', en: 'Enrollment by Academic Year' },
  'dashboard.recent_activity': { ar: 'آخر العمليات والنشاطات الحية', en: 'Live Operations & Recent Activity' },
  'dashboard.quick_actions': { ar: 'إجراءات سريعة', en: 'Quick Actions' },
  'dashboard.revenue_chart': { ar: 'نمو الإيرادات والتسجيلات', en: 'Revenue & Enrollment Trends' },
  'dashboard.view_all': { ar: 'عرض الكل', en: 'View All' },
  'dashboard.refresh': { ar: 'تحديث البيانات', en: 'Refresh Data' },
  'dashboard.last_updated': { ar: 'آخر تحديث:', en: 'Last updated:' },

  // Quick Action Labels
  'action.create_course': { ar: 'إضافة كورس جديد', en: 'Add Course' },
  'action.create_lecture': { ar: 'إضافة محاضرة', en: 'Add Lecture' },
  'action.send_notification': { ar: 'إرسال إشعار عام', en: 'Send Notification' },
  'action.generate_codes': { ar: 'توليد كروت شحن', en: 'Generate Codes' },
  'action.create_supervisor': { ar: 'إضافة مشرف', en: 'Add Supervisor' },

  // Auth & Login
  'auth.login_title': { ar: 'تسجيل دخول الإدارة والمعلمين', en: 'Staff & Teacher Portal' },
  'auth.login_subtitle': { ar: 'منصة مستر عمر مكاوي التعليمية للغة الإنجليزية', en: 'Mr. Omar Makawy Educational Platform' },
  'auth.phone_label': { ar: 'رقم الهاتف المسجل', en: 'Registered Mobile Number' },
  'auth.phone_placeholder': { ar: '01xxxxxxxxx', en: '01xxxxxxxxx' },
  'auth.password_label': { ar: 'كلمة المرور', en: 'Password' },
  'auth.password_placeholder': { ar: '••••••••', en: '••••••••' },
  'auth.device_id': { ar: 'معرف الجهاز المشفر:', en: 'Device UUID:' },
  'auth.login_button': { ar: 'تسجيل الدخول إلى لوحة التحكم', en: 'Sign In to Dashboard' },
  'auth.logging_in': { ar: 'جاري التحقق والاعتماد...', en: 'Authenticating...' },
  'auth.2fa_title': { ar: 'التحقق بخطوتين (2FA)', en: 'Two-Factor Authentication' },
  'auth.2fa_desc': { ar: 'أدخل الرمز المكون من 6 أرقام من تطبيق Authenticator الخاص بك', en: 'Enter the 6-digit code from your Authenticator app' },
  'auth.2fa_code': { ar: 'رمز التحقق', en: 'Verification Code' },
  'auth.2fa_verify': { ar: 'تأكيد الرمز والمتابعة', en: 'Verify & Proceed' },
  'auth.dev_credentials_hint': { ar: 'حساب المعلم التجريبي: 01000000001 / Teacher123456!', en: 'Dev Teacher account: 01000000001 / Teacher123456!' },

  // Common UI
  'common.search': { ar: 'بحث سريع...', en: 'Search...' },
  'common.filter': { ar: 'تصفية', en: 'Filter' },
  'common.status': { ar: 'الحالة', en: 'Status' },
  'common.date': { ar: 'التاريخ', en: 'Date' },
  'common.actions': { ar: 'الإجراءات', en: 'Actions' },
  'common.save': { ar: 'حفظ', en: 'Save' },
  'common.cancel': { ar: 'إلغاء', en: 'Cancel' },
  'common.confirm': { ar: 'تأكيد', en: 'Confirm' },
  'common.delete': { ar: 'حذف', en: 'Delete' },
  'common.edit': { ar: 'تعديل', en: 'Edit' },
  'common.loading': { ar: 'جاري التحميل...', en: 'Loading...' },
  'common.error': { ar: 'حدث خطأ في جلب البيانات', en: 'Failed to load data' },
  'common.retry': { ar: 'إعادة المحاولة', en: 'Retry' },
  'common.empty': { ar: 'لا توجد بيانات متوفرة حالياً', en: 'No data available' },
  'common.egp': { ar: 'ج.م', en: 'EGP' },
  'common.students_count': { ar: 'طالب', en: 'Students' },
  'common.courses_count': { ar: 'كورس', en: 'Courses' },
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
    const saved = localStorage.getItem('admin_lang') as Language;
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
    localStorage.setItem('admin_lang', lang);
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
