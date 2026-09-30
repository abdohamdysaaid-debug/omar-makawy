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

    // Mobile Bottom Navigation
    'bottomNav.home': 'الرئيسية',
    'bottomNav.courses': 'الكورسات',
    'bottomNav.exams': 'الامتحانات',
    'bottomNav.store': 'المتجر',
    'bottomNav.profile': 'حسابي',

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

    // Authentication (Login / Register)
    'auth.loginTitle': 'تسجيل الدخول',
    'auth.loginSubtitle': 'أهلاً بك مجدداً في منصة مستر عمر مكاوي التعليمية',
    'auth.phoneOrEmail': 'رقم الهاتف أو البريد الإلكتروني',
    'auth.phoneOrEmailPlaceholder': 'أدخل رقم الهاتف أو الإيميل',
    'auth.password': 'كلمة المرور',
    'auth.passwordPlaceholder': 'أدخل كلمة المرور',
    'auth.rememberMe': 'تذكرني',
    'auth.forgotPassword': 'نسيت كلمة المرور؟',
    'auth.loginBtn': 'تسجيل الدخول',
    'auth.noAccount': 'ليس لديك حساب؟',
    'auth.createAccountNow': 'إنشاء حساب جديد',
    'auth.registerTitle': 'إنشاء حساب جديد',
    'auth.registerSubtitle': 'انضم إلينا الآن وابدأ رحلة التفوق في اللغة الإنجليزية',
    'auth.fullName': 'الاسم بالكامل',
    'auth.fullNamePlaceholder': 'أدخل اسمك الرباعي باللغة العربية',
    'auth.phone': 'رقم الهاتف (واتساب)',
    'auth.phonePlaceholder': '01xxxxxxxxx',
    'auth.email': 'البريد الإلكتروني (اختياري)',
    'auth.academicYear': 'الصف الدراسي',
    'auth.academicYearSelect': 'اختر الصف الدراسي',
    'auth.studyType': 'نوع الدراسة',
    'auth.governorate': 'المحافظة',
    'auth.governorateSelect': 'اختر المحافظة',
    'auth.parentPhone': 'رقم ولي الأمر',
    'auth.parentPhonePlaceholder': '01xxxxxxxxx',
    'auth.registerBtn': 'إنشاء الحساب',
    'auth.alreadyHaveAccount': 'لديك حساب بالفعل؟',

    // Courses
    'courses.title': 'الكورسات التعليمية',
    'courses.subtitle': 'تصفح جميع الكورسات والمحاضرات المتاحة للمراحل المختلفة',
    'courses.allYears': 'جميع المراحل الدراسية',
    'courses.searchPlaceholder': 'ابحث عن كورس...',
    'courses.viewDetails': 'عرض التفاصيل',
    'courses.enrollNow': 'اشترك الآن',
    'courses.lecturesCount': 'محاضرة',
    'courses.price': 'السعر',
    'courses.currency': 'ج.م',
    'courses.free': 'مجاني',
    'courses.purchased': 'تم الاشتراك',
    'courses.noCoursesFound': 'لا توجد كورسات متاحة حالياً',

    // Store / Bookstore
    'store.title': 'متجر الكتب والمذكرات',
    'store.subtitle': 'احصل على الكتب المنهجية والمذكرات الرسمية بأعلى جودة',
    'store.addToCart': 'أضف إلى السلة',
    'store.buyNow': 'شراء الآن',
    'store.outOfStock': 'نفدت الكمية',
    'store.inStock': 'متوفر',
    'store.pages': 'صفحة',

    // Cart
    'cart.title': 'سلة التسوق',
    'cart.empty': 'سلة التسوق فارغة حالياً',
    'cart.total': 'الإجمالي الكلي',
    'cart.checkout': 'إتمام الشراء',
    'cart.remove': 'حذف',

    // Profile
    'profile.title': 'الملف الشخصي',
    'profile.personalInfo': 'البيانات الشخصية',
    'profile.walletBalance': 'رصيد المحفظة',
    'profile.subscriptions': 'كورساتي المشتراة',
    'profile.edit': 'تعديل',
    'profile.save': 'حفظ التغييرات',

    // Footer
    'footer.description': 'منصة تعليمية متكاملة تهدف إلى تبسيط اللغة الإنجليزية وجعلها في متناول الجميع بطرق حديثة وتفاعلية.',
    'footer.quickLinks': 'روابط سريعة',
    'footer.rights': 'جميع الحقوق محفوظة.',

    // UI Controls
    'ui.themeToggle': 'تغيير المظهر',
    'ui.langToggle': 'English',
    'ui.currency': 'ج.م',
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

    // Mobile Bottom Navigation
    'bottomNav.home': 'Home',
    'bottomNav.courses': 'Courses',
    'bottomNav.exams': 'Exams',
    'bottomNav.store': 'Store',
    'bottomNav.profile': 'Profile',

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

    // Authentication (Login / Register)
    'auth.loginTitle': 'Login',
    'auth.loginSubtitle': 'Welcome back to Mr. Omar Meckawy Educational Platform',
    'auth.phoneOrEmail': 'Phone Number or Email',
    'auth.phoneOrEmailPlaceholder': 'Enter your phone number or email',
    'auth.password': 'Password',
    'auth.passwordPlaceholder': 'Enter your password',
    'auth.rememberMe': 'Remember Me',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.loginBtn': 'Login',
    'auth.noAccount': "Don't have an account?",
    'auth.createAccountNow': 'Register Now',
    'auth.registerTitle': 'Create New Account',
    'auth.registerSubtitle': 'Join us now and start your English excellence journey',
    'auth.fullName': 'Full Name',
    'auth.fullNamePlaceholder': 'Enter your 4-word full name',
    'auth.phone': 'Phone Number (WhatsApp)',
    'auth.phonePlaceholder': '01xxxxxxxxx',
    'auth.email': 'Email (Optional)',
    'auth.academicYear': 'Academic Year',
    'auth.academicYearSelect': 'Select Academic Year',
    'auth.studyType': 'Study Type',
    'auth.governorate': 'Governorate',
    'auth.governorateSelect': 'Select Governorate',
    'auth.parentPhone': "Parent's Phone Number",
    'auth.parentPhonePlaceholder': '01xxxxxxxxx',
    'auth.registerBtn': 'Create Account',
    'auth.alreadyHaveAccount': 'Already have an account?',

    // Courses
    'courses.title': 'Educational Courses',
    'courses.subtitle': 'Browse all available courses and lectures for all academic levels',
    'courses.allYears': 'All Academic Years',
    'courses.searchPlaceholder': 'Search courses...',
    'courses.viewDetails': 'View Details',
    'courses.enrollNow': 'Subscribe Now',
    'courses.lecturesCount': 'Lectures',
    'courses.price': 'Price',
    'courses.currency': 'EGP',
    'courses.free': 'Free',
    'courses.purchased': 'Subscribed',
    'courses.noCoursesFound': 'No courses available at the moment',

    // Store / Bookstore
    'store.title': 'Books & Booklets Store',
    'store.subtitle': 'Get official curriculum booklets and textbooks with premium print quality',
    'store.addToCart': 'Add to Cart',
    'store.buyNow': 'Buy Now',
    'store.outOfStock': 'Out of Stock',
    'store.inStock': 'In Stock',
    'store.pages': 'Pages',

    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your shopping cart is empty',
    'cart.total': 'Total',
    'cart.checkout': 'Checkout',
    'cart.remove': 'Remove',

    // Profile
    'profile.title': 'Profile',
    'profile.personalInfo': 'Personal Information',
    'profile.walletBalance': 'Wallet Balance',
    'profile.subscriptions': 'My Subscriptions',
    'profile.edit': 'Edit',
    'profile.save': 'Save Changes',

    // Footer
    'footer.description': 'A comprehensive educational platform aiming to simplify the English language for everyone using modern interactive methods.',
    'footer.quickLinks': 'Quick Links',
    'footer.rights': 'All rights reserved.',

    // UI Controls
    'ui.themeToggle': 'Toggle Theme',
    'ui.langToggle': 'عربي',
    'ui.currency': 'EGP',
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
