import {
  AcademicYear,
  HeroBanner,
  PromotionalBanner,
  Course,
  Package,
  Lecture,
  Book,
  Feature,
  Notification,
  Testimonial,
  Student,
} from '@/types';

// ============================================================
// ACADEMIC YEARS
// ============================================================
export const academicYears: AcademicYear[] = [
  {
    id: 1,
    title: 'الصف الثالث الإعدادي',
    slug: '3-prep',
    description: 'محتوى شامل للصف الثالث الإعدادي - مادة اللغة الإنجليزية',
    imageUrl: '/images/academic-3prep.jpg',
  },
  {
    id: 2,
    title: 'الصف الأول الثانوي',
    slug: '1-sec',
    description: 'محتوى شامل للصف الأول الثانوي - مادة اللغة الإنجليزية',
    imageUrl: '/images/academic-1sec.jpg',
  },
  {
    id: 3,
    title: 'الصف الثاني الثانوي',
    slug: '2-sec',
    description: 'محتوى شامل للصف الثاني الثانوي - مادة اللغة الإنجليزية',
    imageUrl: '/images/academic-2sec.jpg',
  },
  {
    id: 4,
    title: 'الصف الثالث الثانوي',
    slug: '3-sec',
    description: 'محتوى شامل للصف الثالث الثانوي - مادة اللغة الإنجليزية',
    imageUrl: '/images/academic-3sec.jpg',
  },
];

// ============================================================
// HERO BANNER
// ============================================================
export const heroBanner: HeroBanner = {
  imageUrl: '/images/hero-bg.jpg',
  teacherImageUrl: '/images/teacher.png',
  title: 'مستقبلك يبدأ من هنا',
  subtitle:
    'تعلم اللغة الإنجليزية بأسلوب بسيط وممتع .. خطوة بخطوة نحو مستواك الأفضل.',
  buttonText: 'ابدأ رحلتك الآن',
  buttonUrl: '/courses',
  secondaryButtonText: 'شاهد الفيديو',
  secondaryButtonUrl: '#',
};

// ============================================================
// PROMOTIONAL BANNERS
// ============================================================
export const promotionalBanners: PromotionalBanner[] = [
  {
    id: 1,
    imageUrl: '/images/banner-1.jpg',
    title: 'مش مجرد كورس.. دي رحلة للنجاح',
    subtitle: 'مع مستر عمر مكاوي',
    buttonText: 'ابدأ الآن',
    link: '/courses',
    order: 1,
    isActive: true,
  },
  {
    id: 2,
    imageUrl: '/images/banner-2.jpg',
    title: 'عروض خاصة على الباقات',
    subtitle: 'خصومات تصل إلى 30% على باقات الشهر',
    buttonText: 'اعرف أكتر',
    link: '/courses',
    order: 2,
    isActive: true,
  },
  {
    id: 3,
    imageUrl: '/images/banner-3.jpg',
    title: 'كتب جديدة متوفرة الآن',
    subtitle: 'احصل على المذكرات والملخصات',
    buttonText: 'تصفح الكتب',
    link: '/bookstore',
    order: 3,
    isActive: true,
  },
];

// ============================================================
// COURSES
// ============================================================
export const courses: Course[] = [
  // 3rd Prep
  {
    id: 1,
    title: 'كورس اللغة الإنجليزية - الترم الأول',
    academicYearId: 1,
    imageUrl: '/images/course-1.jpg',
    description: 'شرح منهج الصف الثالث الإعدادي كاملاً - الترم الأول',
    price: 200,
    lectureCount: 24,
    duration: '36 ساعة',
    features: ['شرح تفصيلي', 'مذكرات PDF', 'حل أسئلة وتدريبات', 'امتحانات تجريبية'],
    isActive: true,
    teacher: 'مستر عمر مكاوي',
  },
  {
    id: 2,
    title: 'كورس المراجعة النهائية - إعدادي',
    academicYearId: 1,
    imageUrl: '/images/course-2.jpg',
    description: 'مراجعة نهائية شاملة قبل الامتحانات',
    price: 100,
    lectureCount: 12,
    duration: '18 ساعة',
    features: ['مراجعة شاملة', 'أسئلة متوقعة', 'نماذج امتحانات', 'حل نموذجي'],
    isActive: true,
    teacher: 'مستر عمر مكاوي',
  },
  // 1st Sec
  {
    id: 3,
    title: 'كورس اللغة الإنجليزية - أولى ثانوي',
    academicYearId: 2,
    imageUrl: '/images/course-3.jpg',
    description: 'شرح منهج الصف الأول الثانوي كاملاً',
    price: 250,
    lectureCount: 30,
    duration: '45 ساعة',
    features: ['شرح تفصيلي', 'مذكرات PDF', 'حل أسئلة وتدريبات', 'متابعة مستمرة'],
    isActive: true,
    teacher: 'مستر عمر مكاوي',
  },
  // 2nd Sec
  {
    id: 4,
    title: 'كورس اللغة الإنجليزية - تانية ثانوي',
    academicYearId: 3,
    imageUrl: '/images/course-4.jpg',
    description: 'شرح منهج الصف الثاني الثانوي كاملاً',
    price: 300,
    lectureCount: 32,
    duration: '48 ساعة',
    features: ['شرح تفصيلي', 'مذكرات PDF', 'حل أسئلة وتدريبات', 'دعم مباشر'],
    isActive: true,
    teacher: 'مستر عمر مكاوي',
  },
  // 3rd Sec
  {
    id: 5,
    title: 'كورس اللغة الإنجليزية - ثالثة ثانوي',
    academicYearId: 4,
    imageUrl: '/images/course-5.jpg',
    description: 'شرح منهج الصف الثالث الثانوي كاملاً - الثانوية العامة',
    price: 400,
    lectureCount: 40,
    duration: '60 ساعة',
    features: ['شرح تفصيلي', 'مذكرات PDF', 'حل أسئلة وتدريبات', 'امتحانات تجريبية', 'متابعة مستمرة'],
    isActive: true,
    teacher: 'مستر عمر مكاوي',
  },
  {
    id: 6,
    title: 'كورس المراجعة النهائية - ثانوية عامة',
    academicYearId: 4,
    imageUrl: '/images/course-6.jpg',
    description: 'مراجعة نهائية شاملة للثانوية العامة',
    price: 200,
    lectureCount: 15,
    duration: '22 ساعة',
    features: ['مراجعة شاملة', 'أسئلة متوقعة', 'نماذج وزارة', 'حل نموذجي'],
    isActive: true,
    teacher: 'مستر عمر مكاوي',
  },
];

// ============================================================
// PACKAGES
// ============================================================
export const packages: Package[] = [
  {
    id: 1,
    title: 'باقة الشهر الأول',
    academicYearId: 4,
    imageUrl: '/images/package-1.jpg',
    description: 'ابدأ رحلتك بثقة',
    price: 150,
    features: [
      'جميع محاضرات الشهر الأول',
      'مذكرات وملفات PDF',
      'حل أسئلة وتدريبات',
      'دعم مباشر',
    ],
    isPopular: false,
    isActive: true,
  },
  {
    id: 2,
    title: 'باقة الشهر الثاني',
    academicYearId: 4,
    imageUrl: '/images/package-2.jpg',
    description: 'استمر في التطور',
    price: 150,
    features: [
      'جميع محاضرات الشهر الثاني',
      'مذكرات وملفات PDF',
      'حل أسئلة وتدريبات',
      'دعم مباشر',
    ],
    isPopular: false,
    isActive: true,
  },
  {
    id: 3,
    title: 'باقة 3 شهور',
    academicYearId: 4,
    imageUrl: '/images/package-3.jpg',
    description: 'أفضل قيمة .. نتائج أقوى',
    price: 350,
    features: [
      'جميع محاضرات 3 شهور',
      'مذكرات وملفات PDF',
      'حل أسئلة وتدريبات',
      'متابعة مستمرة',
    ],
    isPopular: true,
    isActive: true,
  },
];

// ============================================================
// LECTURES (for course id=5)
// ============================================================
export const lectures: Lecture[] = [
  {
    id: 1,
    courseId: 5,
    title: 'المحاضرة الأولى - Unit 1 Introduction',
    imageUrl: '/images/lecture-1.jpg',
    duration: '1:30:00',
    status: 'completed',
    order: 1,
    isLocked: false,
    description: 'مقدمة في الوحدة الأولى وشرح القواعد الأساسية',
    hasQuiz: true,
    hasPdf: true,
    timestamps: [
      { time: '00:00', label: 'مقدمة' },
      { time: '15:00', label: 'شرح القواعد' },
      { time: '45:00', label: 'تدريبات' },
      { time: '1:10:00', label: 'ملخص' },
    ],
  },
  {
    id: 2,
    courseId: 5,
    title: 'المحاضرة الثانية - Unit 1 Vocabulary',
    imageUrl: '/images/lecture-2.jpg',
    duration: '1:15:00',
    status: 'completed',
    order: 2,
    isLocked: false,
    description: 'شرح كلمات الوحدة الأولى وتطبيقات عليها',
    hasQuiz: true,
    hasPdf: true,
    timestamps: [
      { time: '00:00', label: 'مقدمة' },
      { time: '10:00', label: 'الكلمات الجديدة' },
      { time: '40:00', label: 'تطبيقات' },
    ],
  },
  {
    id: 3,
    courseId: 5,
    title: 'المحاضرة الثالثة - Unit 1 Grammar',
    imageUrl: '/images/lecture-3.jpg',
    duration: '1:45:00',
    status: 'available',
    order: 3,
    isLocked: false,
    description: 'شرح تفصيلي لقواعد الوحدة الأولى',
    hasQuiz: false,
    hasPdf: true,
    timestamps: [
      { time: '00:00', label: 'مقدمة' },
      { time: '20:00', label: 'Present Tenses' },
      { time: '50:00', label: 'Past Tenses' },
      { time: '1:20:00', label: 'تدريبات شاملة' },
    ],
  },
  {
    id: 4,
    courseId: 5,
    title: 'المحاضرة الرابعة - Unit 2 Introduction',
    imageUrl: '/images/lecture-4.jpg',
    duration: '1:20:00',
    status: 'locked',
    order: 4,
    isLocked: true,
    description: 'مقدمة في الوحدة الثانية',
    hasQuiz: false,
    hasPdf: false,
    timestamps: [],
  },
  {
    id: 5,
    courseId: 5,
    title: 'المحاضرة الخامسة - Unit 2 Vocabulary',
    imageUrl: '/images/lecture-5.jpg',
    duration: '1:10:00',
    status: 'locked',
    order: 5,
    isLocked: true,
    description: 'كلمات الوحدة الثانية',
    hasQuiz: false,
    hasPdf: false,
    timestamps: [],
  },
  {
    id: 6,
    courseId: 5,
    title: 'المحاضرة السادسة - Unit 2 Grammar',
    imageUrl: '/images/lecture-6.jpg',
    duration: '1:35:00',
    status: 'locked',
    order: 6,
    isLocked: true,
    description: 'قواعد الوحدة الثانية',
    hasQuiz: false,
    hasPdf: false,
    timestamps: [],
  },
];

// ============================================================
// BOOKS
// ============================================================
export const books: Book[] = [
  {
    id: 1,
    title: 'مذكرة الشرح - الصف الثالث الثانوي',
    academicYearId: 4,
    imageUrl: '/images/book-1.jpg',
    description: 'مذكرة شرح شاملة لمنهج اللغة الإنجليزية للصف الثالث الثانوي',
    price: 150,
    stock: 50,
    category: 'مذكرات',
  },
  {
    id: 2,
    title: 'كتاب التدريبات - الصف الثالث الثانوي',
    academicYearId: 4,
    imageUrl: '/images/book-2.jpg',
    description: 'تدريبات شاملة وأسئلة متنوعة على كل وحدة',
    price: 100,
    stock: 35,
    category: 'تدريبات',
  },
  {
    id: 3,
    title: 'مذكرة الشرح - الصف الثاني الثانوي',
    academicYearId: 3,
    imageUrl: '/images/book-3.jpg',
    description: 'مذكرة شرح شاملة لمنهج الصف الثاني الثانوي',
    price: 120,
    stock: 40,
    category: 'مذكرات',
  },
  {
    id: 4,
    title: 'مذكرة المراجعة النهائية - ثانوية عامة',
    academicYearId: 4,
    imageUrl: '/images/book-4.jpg',
    description: 'مراجعة نهائية شاملة مع نماذج امتحانات',
    price: 80,
    stock: 0,
    category: 'مراجعة',
  },
  {
    id: 5,
    title: 'كتاب القواعد - الصف الأول الثانوي',
    academicYearId: 2,
    imageUrl: '/images/book-5.jpg',
    description: 'شرح مبسط لجميع قواعد اللغة الإنجليزية',
    price: 90,
    stock: 60,
    category: 'قواعد',
  },
  {
    id: 6,
    title: 'مذكرة الشرح - الصف الثالث الإعدادي',
    academicYearId: 1,
    imageUrl: '/images/book-6.jpg',
    description: 'مذكرة شرح شاملة لمنهج الصف الثالث الإعدادي',
    price: 80,
    stock: 45,
    category: 'مذكرات',
  },
];

// ============================================================
// FEATURES
// ============================================================
export const features: Feature[] = [
  {
    id: 1,
    icon: 'presentation',
    title: 'شرح بسيط وسهل',
    description: 'أسلوب شرح مبسط يضمن فهم المادة بسهولة',
  },
  {
    id: 2,
    icon: 'file-text',
    title: 'مذكرات واختبارات',
    description: 'مذكرات PDF وامتحانات تجريبية لكل وحدة',
  },
  {
    id: 3,
    icon: 'video',
    title: 'محاضرات منظمة وواضحة',
    description: 'فيديوهات عالية الجودة مرتبة ومنظمة',
  },
  {
    id: 4,
    icon: 'headphones',
    title: 'متابعة ودعم مستمر',
    description: 'دعم مستمر والرد على استفسارات الطلاب',
  },
];

// ============================================================
// NOTIFICATIONS
// ============================================================
export const mockNotifications: Notification[] = [
  {
    id: 1,
    title: 'محاضرة جديدة متاحة',
    message: 'تم إضافة المحاضرة الثالثة في كورس اللغة الإنجليزية - ثالثة ثانوي',
    date: '2026-09-19',
    isRead: false,
    type: 'course',
  },
  {
    id: 2,
    title: 'نتيجة الامتحان',
    message: 'تم تصحيح امتحان الوحدة الأولى - درجتك 85/100',
    date: '2026-09-18',
    isRead: false,
    type: 'exam',
  },
  {
    id: 3,
    title: 'تحديث المنصة',
    message: 'تم إضافة ميزات جديدة للمنصة. اكتشفها الآن!',
    date: '2026-09-17',
    isRead: true,
    type: 'info',
  },
  {
    id: 4,
    title: 'تم تأكيد طلبك',
    message: 'تم تأكيد طلب شراء مذكرة الشرح - الصف الثالث الثانوي',
    date: '2026-09-16',
    isRead: true,
    type: 'success',
  },
];

// ============================================================
// TESTIMONIALS
// ============================================================
export const testimonials: Testimonial[] = [
  {
    id: 1,
    studentName: 'أحمد محمد',
    academicYear: 'الصف الثالث الثانوي',
    text: 'أسلوب الشرح ممتاز والمحاضرات منظمة جداً. استفدت كتير من الكورس.',
    rating: 5,
  },
  {
    id: 2,
    studentName: 'سارة أحمد',
    academicYear: 'الصف الثاني الثانوي',
    text: 'المذكرات والتدريبات ساعدتني كتير في فهم المنهج.',
    rating: 5,
  },
  {
    id: 3,
    studentName: 'محمد علي',
    academicYear: 'الصف الأول الثانوي',
    text: 'الدعم المستمر والمتابعة من أهم مميزات المنصة.',
    rating: 4,
  },
];

// ============================================================
// MOCK STUDENT (for demo login)
// ============================================================
export const mockStudent: Student & { academicYearId: number } = {
  id: 1,
  fullName: 'محمد أحمد علي حسن',
  phone: '01234567890',
  whatsapp: '01234567890',
  parentPhone: '01098765432',
  email: 'mohamed@example.com',
  academicYearId: 4,
};
