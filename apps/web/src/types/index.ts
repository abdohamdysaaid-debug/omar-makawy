// ============================================================
// TYPE DEFINITIONS — Omar Meckawy Educational Platform
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
  id: string | number;
  title?: string;
  title_ar?: string;
  title_en?: string;
  slug?: string;
  academicYearId?: number | string;
  academic_year_id?: string;
  academic_year_name_ar?: string;
  academic_year_name_en?: string;
  imageUrl?: string;
  thumbnail_url?: string | null;
  description?: string;
  description_ar?: string;
  description_en?: string;
  price: number;
  discount_price?: number | null;
  lectureCount?: number;
  duration?: string;
  features?: string[];
  isActive?: boolean;
  is_published?: boolean;
  is_public?: boolean;
  is_featured?: boolean;
  status?: string;
  sort_order?: number;
  teacher?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
  imageUrl?: string;
  cover_image_url?: string;
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
  id: string | number;
  fullName: string;
  phone: string;
  whatsapp: string;
  parentPhone: string;
  email: string;
  academicYearId: string | number;
  academicYearName?: string;
  governorateId?: string;
  governorateName?: string;
  schoolName?: string;
  educationType?: string;
  studyType?: string;
  section?: string;
  gender?: string;
  address?: string;
  walletBalance?: number;
  avatarUrl?: string;
  role?: string;
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
