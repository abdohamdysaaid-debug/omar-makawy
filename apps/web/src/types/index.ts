// ============================================================
// TYPE DEFINITIONS — Omar Makawy Educational Platform
// ============================================================

export interface AcademicYear {
  id: number;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
}

export interface HeroBanner {
  imageUrl: string;
  teacherImageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
}

export interface PromotionalBanner {
  id: number;
  imageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  link: string;
  order: number;
  isActive: boolean;
}

export interface Course {
  id: number;
  title: string;
  academicYearId: number;
  imageUrl: string;
  description: string;
  price: number;
  lectureCount: number;
  duration: string;
  features: string[];
  isActive: boolean;
  teacher: string;
}

export interface Package {
  id: number;
  title: string;
  academicYearId: number;
  imageUrl: string;
  description: string;
  price: number;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
}

export interface Lecture {
  id: number;
  courseId: number;
  title: string;
  imageUrl: string;
  duration: string;
  status: 'available' | 'locked' | 'completed';
  order: number;
  isLocked: boolean;
  description: string;
  hasQuiz: boolean;
  hasPdf: boolean;
  timestamps: { time: string; label: string }[];
}

export interface Book {
  id: number;
  title: string;
  academicYearId: number;
  imageUrl: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface Student {
  id: number;
  fullName: string;
  phone: string;
  whatsapp: string;
  parentPhone: string;
  email: string;
  academicYearId: number;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'course' | 'exam';
}

export interface Feature {
  id: number;
  icon: string;
  title: string;
  description: string;
}

export interface Testimonial {
  id: number;
  studentName: string;
  academicYear: string;
  text: string;
  rating: number;
}
