'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ar' | 'en';

export const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Navbar / Navigation
    'nav.home': 'الرئيسية',
    'nav.courses': 'الكورسات',
    'nav.features': 'مميزات المنصة',
    'nav.testimonials': 'آراء الطلاب',
    'nav.contact': 'تواصل معنا',
    'nav.profile': 'الملف الشخصي',
    'nav.notifications': 'الإشعارات',
    'nav.logout': 'تسجيل الخروج',
    'nav.startNow': 'ابدأ الآن',
    'nav.cart': 'سلة التسوق',
    'nav.store': 'المتجر',
    'nav.login': 'تسجيل الدخول',
    'nav.register': 'إنشاء حساب',
    'nav.wallet': 'المحفظة',
    'nav.searchPlaceholder': 'ابحث عن محاضرة أو كورس...',
    'nav.myLectures': 'محاضراتي',
    'nav.exams': 'الامتحانات',
    'nav.books': 'الكتب والمذكرات',

    // Branding / Teacher
    'teacher.title': 'Mr. Omar Meckawy',
    'teacher.subtitle': 'مدرس اللغة الإنجليزية - موثق من وزارة التربية والتعليم',

    // Hero Section
    'hero.badge': 'المرحلة الثانوية العامة والأزهرية',
    'hero.title': 'تعلم الإنجليزي بأسلوب مختلف مع مستر عمر مكاوي',
    'hero.description': 'شرح تفصيلي للمنهج، متابعة مستمرة، وامتحانات تفاعلية للوصول إلى الدرجة النهائية بثقة وسهولة.',
    'hero.exploreCourses': 'استكشف الكورسات',
    'hero.registerStudent': 'سجل الآن كطالب',

    // Features Section
    'features.heading': 'لماذا تشترك في منصتنا؟',
    'features.subheading': 'تجربة تعليمية متكاملة مصممة خصيصاً لمساعدتك على التفوق بأبسط الطرق وأحدث الأساليب.',
    'features.lecturesTitle': 'محاضرات فيديو عالية الجودة',
    'features.lecturesDesc': 'شرح تفصيلي للمنهج مع سيناريوهات توضيحية وأمثلة واقعية لبناء فهم عميق.',
    'features.examsTitle': 'امتحانات تفاعلية وتقييم فوري',
    'features.examsDesc': 'اختبر مستواك بعد كل درس مع إظهار الإجابات النموذجية والتحليل الفوري لأدائك.',
    'features.storeTitle': 'متجر الكتب والمذكرات',
    'features.storeDesc': 'اطلب مذكرات وكتب المنهج الرسمية لتصلك حتى باب المنزل أو حملها بصيغة PDF.',
    'features.walletTitle': 'محفظة شحن كروت المنصة',
    'features.walletDesc': 'سهولة الاشتراك وشحن الحساب عبر كروت الشحن المباشرة أو المحافظ الإلكترونية.',

    // Footer
    'footer.description': 'منصة تعليمية متكاملة تهدف إلى تبسيط اللغة الإنجليزية وجعلها في متناول الجميع بطرق حديثة وتفاعلية.',
    'footer.quickLinks': 'روابط سريعة',
    'footer.rights': 'جميع الحقوق محفوظة.',

    // UI Controls
    'ui.themeToggle': 'تغيير المظهر',
    'ui.langToggle': 'English',
  },
  en: {
    // Navbar / Navigation
    'nav.home': 'Home',
    'nav.courses': 'Courses',
    'nav.features': 'Features',
    'nav.testimonials': 'Testimonials',
    'nav.contact': 'Contact Us',
    'nav.profile': 'Profile',
    'nav.notifications': 'Notifications',
    'nav.logout': 'Logout',
    'nav.startNow': 'Start Now',
    'nav.cart': 'Shopping Cart',
    'nav.store': 'Store',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.wallet': 'Wallet',
    'nav.searchPlaceholder': 'Search lectures or courses...',
    'nav.myLectures': 'My Lectures',
    'nav.exams': 'Exams',
    'nav.books': 'Books & Notes',

    // Branding / Teacher
    'teacher.title': 'Mr. Omar Meckawy',
    'teacher.subtitle': 'English Language Teacher - Ministry of Education Certified',

    // Hero Section
    'hero.badge': 'General & Al-Azhar Secondary Stages',
    'hero.title': 'Learn English Differently with Mr. Omar Meckawy',
    'hero.description': 'Comprehensive curriculum explanations, continuous follow-up, and interactive exams to achieve top grades with confidence.',
    'hero.exploreCourses': 'Explore Courses',
    'hero.registerStudent': 'Register as Student',

    // Features Section
    'features.heading': 'Why Join Our Platform?',
    'features.subheading': 'A complete educational experience tailored to help you excel with modern and engaging learning methods.',
    'features.lecturesTitle': 'High-Quality Video Lectures',
    'features.lecturesDesc': 'Detailed curriculum walkthroughs with illustrative scenarios and practical examples.',
    'features.examsTitle': 'Interactive Exams & Instant Results',
    'features.examsDesc': 'Test your progress after every lesson with model answers and instant performance analytics.',
    'features.storeTitle': 'Books & Notes Store',
    'features.storeDesc': 'Order official curriculum notes delivered directly to your doorstep or download in PDF format.',
    'features.walletTitle': 'Platform Card Wallet System',
    'features.walletDesc': 'Seamless course subscription using platform top-up cards or e-wallets.',

    // Footer
    'footer.description': 'A comprehensive educational platform aiming to simplify the English language for everyone using modern interactive methods.',
    'footer.quickLinks': 'Quick Links',
    'footer.rights': 'All rights reserved.',

    // UI Controls
    'ui.themeToggle': 'Toggle Theme',
    'ui.langToggle': 'عربي',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ar');

  useEffect(() => {
    const storedLang = localStorage.getItem('app_language') as Language;
    if (storedLang === 'ar' || storedLang === 'en') {
      setLanguageState(storedLang);
      document.documentElement.lang = storedLang;
      document.documentElement.dir = storedLang === 'ar' ? 'rtl' : 'ltr';
    } else {
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const t = (key: string, fallback?: string): string => {
    return translations[language]?.[key] || fallback || translations['ar']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
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
