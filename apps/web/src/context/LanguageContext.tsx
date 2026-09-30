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
    'nav.myLectures': 'المحاضرات',
    'nav.subscriptions': 'الاشتراكات والباقات',
    'nav.orders': 'طلباتي',
    'nav.exams': 'الامتحانات',
    'nav.books': 'الكتب والمذكرات',
    'nav.progress': 'تقدمي الدراسي',
    'nav.support': 'الدعم والمساعدة',
    'nav.expandMenu': 'توسيع القائمة',
    'nav.collapseMenu': 'طي القائمة',
    'nav.closeMenu': 'إغلاق القائمة',
    'nav.openMenu': 'فتح القائمة',

    // Mobile Bottom Navigation
    'bottomNav.home': 'الرئيسية',
    'bottomNav.courses': 'المحاضرات',
    'bottomNav.exams': 'الامتحانات',
    'bottomNav.store': 'الكتب',
    'bottomNav.profile': 'حسابي',

    // Branding / Teacher
    'teacher.title': 'Mr. Omar Meckawy',
    'teacher.subtitle': 'مدرس اللغة الإنجليزية - موثق من وزارة التربية والتعليم',
    'teacher.expertTitle': 'خبير تدريس اللغة الإنجليزية',

    // Hero Section
    'hero.badge': 'منصة مستر عمر مكاوي التعليمية',
    'hero.headline': 'مستقبلك يبدأ من هنا',
    'hero.title': 'تعلم الإنجليزي بأسلوب مختلف مع مستر عمر مكاوي',
    'hero.description': 'تعلم اللغة الإنجليزية بأسلوب مختلف مع مستر عمر مكاوي. شرح بسيط، متابعة مستمرة، وخطوة بخطوة نحو مستواك الأفضل.',
    'hero.exploreCourses': 'استكشف الكورسات',
    'hero.startJourney': 'ابدأ رحلتك الآن',
    'hero.studentLogin': 'تسجيل الدخول للطلاب',
    'hero.registerStudent': 'سجل الآن كطالب',
    'hero.platformSuffix': 'التعليمية',
    'hero.cardSub': 'تبسيط المنهج وشرح القواعد والمهارات بأحدث الطرق التعليمية',

    // Academic Years
    'academicYear.3prep': 'الصف الثالث الإعدادي',
    'academicYear.1sec': 'الصف الأول الثانوي',
    'academicYear.2sec': 'الصف الثاني الثانوي',
    'academicYear.3sec': 'الصف الثالث الثانوي',
    'academicYear.student': 'طالب',
    'academicYear.current': 'مرحلتك الحالية',

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

    // Authentication (Login)
    'auth.loginTitle': 'تسجيل الدخول',
    'auth.loginSubtitle': 'أهلاً بك مجدداً في منصة مستر عمر مكاوي التعليمية',
    'auth.phoneOrEmail': 'رقم الهاتف أو البريد الإلكتروني',
    'auth.phoneOrEmailPlaceholder': 'أدخل رقم الهاتف أو البريد الإلكتروني',
    'auth.password': 'كلمة المرور',
    'auth.passwordPlaceholder': 'أدخل كلمة المرور',
    'auth.rememberMe': 'تذكرني',
    'auth.forgotPassword': 'نسيت كلمة المرور؟',
    'auth.loginBtn': 'تسجيل الدخول',
    'auth.noAccount': 'ليس لديك حساب؟',
    'auth.createAccountNow': 'إنشاء حساب جديد',
    'auth.required': 'هذا الحقل مطلوب',
    'auth.invalidCredentials': 'بيانات الدخول غير صحيحة',

    // Registration Form Steps & Fields
    'reg.title': 'إنشاء حساب جديد',
    'reg.subtitle': 'انضم إلينا الآن وابدأ رحلة التفوق في اللغة الإنجليزية',
    'reg.step1Title': 'البيانات الأساسية',
    'reg.step1Desc': 'أدخل اسمك ورقم هاتفك الشخصي',
    'reg.step2Title': 'الدراسة والموقع',
    'reg.step2Desc': 'اختر مرحلتك ومحافظتك',
    'reg.step3Title': 'تأكيد الحساب',
    'reg.step3Desc': 'كلمة المرور ورقم ولي الأمر',
    'reg.fullName': 'الاسم بالكامل (رباعي بالعربي)',
    'reg.fullNamePlaceholder': 'مثال: أحمد محمد علي حسن',
    'reg.fullNameErr': 'يرجى كتابة الاسم الرباعي باللغة العربية (كل اسم حرفين على الأقل)',
    'reg.phone': 'رقم الهاتف (واتساب)',
    'reg.phonePlaceholder': '01xxxxxxxxx',
    'reg.phoneErr': 'أدخل رقم هاتف مصري صحيح مكون من 11 رقم يبدأ بـ 01',
    'reg.email': 'البريد الإلكتروني',
    'reg.emailOptional': '(اختياري)',
    'reg.emailPlaceholder': 'name@example.com',
    'reg.academicYear': 'الصف الدراسي',
    'reg.academicYearSelect': 'اختر الصف الدراسي',
    'reg.academicYearErr': 'يرجى اختيار الصف الدراسي',
    'reg.educationType': 'نوع التعليم',
    'reg.generalSec': 'ثانوي عام',
    'reg.azharSec': 'ثانوي أزهري',
    'reg.studyTrack': 'مسار الدراسة',
    'reg.studyArabic': 'دراسة عربي',
    'reg.studyLanguages': 'دراسة لغات (Languages)',
    'reg.governorate': 'المحافظة',
    'reg.governorateSelect': 'اختر المحافظة',
    'reg.governorateErr': 'يرجى اختيار المحافظة',
    'reg.parentPhone': 'رقم هاتف ولي الأمر',
    'reg.parentPhonePlaceholder': '01xxxxxxxxx',
    'reg.parentPhoneErr': 'أدخل رقم هاتف ولي أمر صحيح (مختلف عن رقم الطالب)',
    'reg.gender': 'النوع',
    'reg.male': 'ذكر',
    'reg.female': 'أنثى',
    'reg.confirmPassword': 'تأكيد كلمة المرور',
    'reg.confirmPasswordPlaceholder': 'أعد كتابة كلمة المرور',
    'reg.passwordMismatch': 'كلمتا المرور غير متطابقتين',
    'reg.passwordMinErr': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
    'reg.nextStep': 'التالي',
    'reg.prevStep': 'السابق',
    'reg.submitBtn': 'إنشاء الحساب',
    'reg.alreadyHaveAccount': 'لديك حساب بالفعل؟',
    'reg.termsNotice': 'بضغطك على إنشاء الحساب فإنك توافق على شروط وأحكام المنصة',

    // Courses & Catalog
    'courses.title': 'المحاضرات والكورسات المتاحة',
    'courses.subtitle': 'تصفح الكورسات والمراحل الدراسية',
    'courses.showingFor': 'يتم عرض الكورسات المتاحة لـ',
    'courses.allYears': 'جميع المراحل',
    'courses.searchPlaceholder': 'ابحث عن كورس...',
    'courses.viewDetails': 'عرض الكورس',
    'courses.enrollNow': 'اشترك الآن',
    'courses.lecturesCount': 'محاضرة',
    'courses.duration': 'المدة',
    'courses.price': 'السعر',
    'courses.free': 'مجاني',
    'courses.purchased': 'تم الاشتراك',
    'courses.noCoursesFound': 'لا توجد كورسات متاحة حالياً',
    'courses.noCoursesDesc': 'لم يتم العثور على كورسات تطابق هذا الفلتر أو هذه المرحلة الدراسية حالياً.',

    // Store / Bookstore
    'store.title': 'متجر الكتب والمذكرات',
    'store.subtitle': 'احصل على الكتب المنهجية والمذكرات الرسمية بأعلى جودة',
    'store.addToCart': 'أضف إلى السلة',
    'store.buyNow': 'شراء الآن',
    'store.outOfStock': 'نفدت الكمية',
    'store.inStock': 'متوفر',
    'store.pages': 'صفحة',
    'store.noBooks': 'لا توجد كتب متاحة حالياً',

    // Cart
    'cart.title': 'سلة التسوق',
    'cart.empty': 'سلة التسوق فارغة حالياً',
    'cart.total': 'الإجمالي الكلي',
    'cart.checkout': 'إتمام الشراء',
    'cart.remove': 'حذف',

    // Profile & Student Portal Pages
    'profile.title': 'الملف الشخصي',
    'profile.personalInfo': 'البيانات الشخصية',
    'profile.walletBalance': 'رصيد المحفظة',
    'profile.subscriptions': 'كورساتي المشتراة',
    'profile.edit': 'تعديل البيانات',
    'profile.save': 'حفظ التغييرات',

    'progress.title': 'تقدمي الدراسي',
    'progress.subtitle': 'متابعة أداء الاختبارات والمحاضرات',
    'progress.completedLectures': 'المحاضرات المكتملة',
    'progress.completedExams': 'الامتحانات المكتملة',
    'progress.avgScore': 'متوسط الدرجات',

    'support.title': 'الدعم والمساعدة',
    'support.subtitle': 'نحن هنا لمساعدتك في أي استفسار أو مشكلة',

    'wallet.title': 'المحفظة الإلكترونية',
    'wallet.subtitle': 'إدارة الرصيد وكروت الشحن',
    'wallet.balance': 'الرصيد الحالي',
    'wallet.recharge': 'شحن كارت',
    'wallet.enterCode': 'أدخل كود الشحن',
    'wallet.rechargeBtn': 'شحن الآن',

    'orders.title': 'طلباتي',
    'orders.noOrders': 'لا توجد طلبات سابقة',

    'exams.title': 'الامتحانات التفاعلية',
    'exams.noExams': 'لا توجد امتحانات متاحة حالياً',
    'exams.start': 'بدء الامتحان',

    // Footer
    'footer.description': 'منصة تعليمية متكاملة تهدف إلى تبسيط اللغة الإنجليزية وجعلها في متناول الجميع بطرق حديثة وتفاعلية.',
    'footer.quickLinks': 'روابط سريعة',
    'footer.rights': 'جميع الحقوق محفوظة.',

    // UI Controls & Common Statuses
    'ui.themeToggle': 'تغيير المظهر',
    'ui.langToggle': 'English',
    'ui.currency': 'ج.م',
    'ui.loading': 'جاري التحميل...',
    'ui.error': 'حدث خطأ، يرجى المحاولة مرة أخرى',
    'ui.retry': 'إعادة المحاولة',
    'ui.close': 'إغلاق',
    'ui.save': 'حفظ',
    'ui.cancel': 'إلغاء',
    'ui.back': 'رجوع',
    'ui.confirm': 'تأكيد',
    'ui.all': 'الكل',
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
    'nav.myLectures': 'Lectures',
    'nav.subscriptions': 'Subscriptions & Packages',
    'nav.orders': 'My Orders',
    'nav.exams': 'Exams',
    'nav.books': 'Books & Notes',
    'nav.progress': 'Academic Progress',
    'nav.support': 'Support & Help',
    'nav.expandMenu': 'Expand Menu',
    'nav.collapseMenu': 'Collapse Menu',
    'nav.closeMenu': 'Close Menu',
    'nav.openMenu': 'Open Menu',

    // Mobile Bottom Navigation
    'bottomNav.home': 'Home',
    'bottomNav.courses': 'Lectures',
    'bottomNav.exams': 'Exams',
    'bottomNav.store': 'Books',
    'bottomNav.profile': 'Profile',

    // Branding / Teacher
    'teacher.title': 'Mr. Omar Meckawy',
    'teacher.subtitle': 'English Language Teacher - Ministry of Education Certified',
    'teacher.expertTitle': 'English Teaching Expert',

    // Hero Section
    'hero.badge': 'Mr. Omar Meckawy Educational Platform',
    'hero.headline': 'Your Future Starts Here',
    'hero.title': 'Learn English Differently with Mr. Omar Meckawy',
    'hero.description': 'Learn English in a unique way with Mr. Omar Meckawy. Clear explanations, continuous follow-up, and step-by-step guidance toward your best performance.',
    'hero.exploreCourses': 'Explore Courses',
    'hero.startJourney': 'Start Your Journey Now',
    'hero.studentLogin': 'Student Login',
    'hero.registerStudent': 'Register as Student',
    'hero.platformSuffix': 'Educational Platform',
    'hero.cardSub': 'Simplified curriculum explanations, grammar mastery & skills development',

    // Academic Years
    'academicYear.3prep': '3rd Prep Grade',
    'academicYear.1sec': '1st Secondary Grade',
    'academicYear.2sec': '2nd Secondary Grade',
    'academicYear.3sec': '3rd Secondary Grade',
    'academicYear.student': 'Student',
    'academicYear.current': 'Current Grade',

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

    // Authentication (Login)
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
    'auth.required': 'This field is required',
    'auth.invalidCredentials': 'Invalid phone/email or password',

    // Registration Form Steps & Fields
    'reg.title': 'Create New Account',
    'reg.subtitle': 'Join us now and start your English excellence journey',
    'reg.step1Title': 'Basic Information',
    'reg.step1Desc': 'Enter your full name and phone number',
    'reg.step2Title': 'Academic Level & Location',
    'reg.step2Desc': 'Select your grade and governorate',
    'reg.step3Title': 'Account Confirmation',
    'reg.step3Desc': 'Password and parent phone number',
    'reg.fullName': 'Full Name (4 Arabic Words)',
    'reg.fullNamePlaceholder': 'e.g., Ahmed Mohamed Ali Hassan',
    'reg.fullNameErr': 'Please enter a valid 4-word Arabic name (at least 2 letters per word)',
    'reg.phone': 'Phone Number (WhatsApp)',
    'reg.phonePlaceholder': '01xxxxxxxxx',
    'reg.phoneErr': 'Enter a valid 11-digit Egyptian phone number starting with 01',
    'reg.email': 'Email Address',
    'reg.emailOptional': '(Optional)',
    'reg.emailPlaceholder': 'name@example.com',
    'reg.academicYear': 'Academic Year',
    'reg.academicYearSelect': 'Select Academic Year',
    'reg.academicYearErr': 'Please select an academic year',
    'reg.educationType': 'Education Type',
    'reg.generalSec': 'General Secondary',
    'reg.azharSec': 'Al-Azhar Secondary',
    'reg.studyTrack': 'Study Track',
    'reg.studyArabic': 'Arabic Curriculum',
    'reg.studyLanguages': 'Languages Curriculum',
    'reg.governorate': 'Governorate',
    'reg.governorateSelect': 'Select Governorate',
    'reg.governorateErr': 'Please select your governorate',
    'reg.parentPhone': "Parent's Phone Number",
    'reg.parentPhonePlaceholder': '01xxxxxxxxx',
    'reg.parentPhoneErr': "Enter a valid parent's phone (different from student phone)",
    'reg.gender': 'Gender',
    'reg.male': 'Male',
    'reg.female': 'Female',
    'reg.confirmPassword': 'Confirm Password',
    'reg.confirmPasswordPlaceholder': 'Re-enter your password',
    'reg.passwordMismatch': 'Passwords do not match',
    'reg.passwordMinErr': 'Password must be at least 6 characters',
    'reg.nextStep': 'Next',
    'reg.prevStep': 'Previous',
    'reg.submitBtn': 'Create Account',
    'reg.alreadyHaveAccount': 'Already have an account?',
    'reg.termsNotice': 'By creating an account, you agree to platform terms and privacy policy',

    // Courses & Catalog
    'courses.title': 'Available Lectures & Courses',
    'courses.subtitle': 'Browse courses and academic levels',
    'courses.showingFor': 'Showing available courses for',
    'courses.allYears': 'All Grades',
    'courses.searchPlaceholder': 'Search courses...',
    'courses.viewDetails': 'View Course',
    'courses.enrollNow': 'Subscribe Now',
    'courses.lecturesCount': 'Lectures',
    'courses.duration': 'Duration',
    'courses.price': 'Price',
    'courses.free': 'Free',
    'courses.purchased': 'Subscribed',
    'courses.noCoursesFound': 'No courses available at the moment',
    'courses.noCoursesDesc': 'No courses match this filter or academic grade currently.',

    // Store / Bookstore
    'store.title': 'Books & Notes Store',
    'store.subtitle': 'Get official curriculum booklets and textbooks with premium quality',
    'store.addToCart': 'Add to Cart',
    'store.buyNow': 'Buy Now',
    'store.outOfStock': 'Out of Stock',
    'store.inStock': 'In Stock',
    'store.pages': 'Pages',
    'store.noBooks': 'No books available currently',

    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your shopping cart is empty',
    'cart.total': 'Total',
    'cart.checkout': 'Checkout',
    'cart.remove': 'Remove',

    // Profile & Student Portal Pages
    'profile.title': 'Profile',
    'profile.personalInfo': 'Personal Information',
    'profile.walletBalance': 'Wallet Balance',
    'profile.subscriptions': 'My Subscriptions',
    'profile.edit': 'Edit Profile',
    'profile.save': 'Save Changes',

    'progress.title': 'Academic Progress',
    'progress.subtitle': 'Track exams & lecture progress',
    'progress.completedLectures': 'Completed Lectures',
    'progress.completedExams': 'Completed Exams',
    'progress.avgScore': 'Average Score',

    'support.title': 'Support & Help',
    'support.subtitle': 'We are here to assist with any questions or issues',

    'wallet.title': 'E-Wallet',
    'wallet.subtitle': 'Manage your balance and top-up cards',
    'wallet.balance': 'Current Balance',
    'wallet.recharge': 'Recharge Card',
    'wallet.enterCode': 'Enter Top-up Code',
    'wallet.rechargeBtn': 'Recharge Now',

    'orders.title': 'My Orders',
    'orders.noOrders': 'No previous orders',

    'exams.title': 'Interactive Exams',
    'exams.noExams': 'No exams available currently',
    'exams.start': 'Start Exam',

    // Footer
    'footer.description': 'A comprehensive educational platform aiming to simplify the English language for everyone using modern interactive methods.',
    'footer.quickLinks': 'Quick Links',
    'footer.rights': 'All rights reserved.',

    // UI Controls & Common Statuses
    'ui.themeToggle': 'Toggle Theme',
    'ui.langToggle': 'عربي',
    'ui.currency': 'EGP',
    'ui.loading': 'Loading...',
    'ui.error': 'An error occurred, please try again',
    'ui.retry': 'Retry',
    'ui.close': 'Close',
    'ui.save': 'Save',
    'ui.cancel': 'Cancel',
    'ui.back': 'Back',
    'ui.confirm': 'Confirm',
    'ui.all': 'All',
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
