'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Student } from '@/types';
import { authApi, RegisterPayload } from '@/lib/api/auth';
import {
  apiClient,
  getStoredAccessToken,
  getStoredUser,
  storeTokens,
  storeUser,
  clearStoredAuth,
} from '@/lib/api/client';
import { AuthSuccessResponse, User } from '@/lib/api/types';

interface AuthContextType {
  isAuthenticated: boolean;
  isInitialized: boolean;
  student: Student | null;
  returnUrl: string | null;
  login: (phoneOrEmail: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  setReturnUrl: (url: string | null) => void;
  showAuthGate: boolean;
  openAuthGate: (returnUrl?: string) => void;
  closeAuthGate: () => void;
  updateStudentAvatar: (avatarUrl: string) => Promise<void>;
  subscriptions: any[];
  refreshSubscriptions: () => Promise<void>;
  isSubscribedToCourse: (courseId: string | number | undefined | null) => boolean;
  isSubscribedToPackage: (packageId: string | number | undefined | null) => boolean;
  walletBalance: number;
  refreshWallet: () => Promise<void>;
}

export interface RegisterData {
  fullName: string;
  phone: string;
  whatsapp?: string;
  parentPhone: string;
  email?: string;
  password: string;
  academicYearId: number | string;
  governorateId?: string;
  gender?: string;
  educationType?: string;
  studyType?: string;
  section?: string;
  address?: string;
}

const ACADEMIC_YEAR_NAMES: Record<string, string> = {
  'a0000000-0000-0000-0000-000000000001': 'الصف الثالث الإعدادي',
  'THIRD_PREPARATORY': 'الصف الثالث الإعدادي',
  '1': 'الصف الثالث الإعدادي',
  'a0000000-0000-0000-0000-000000000002': 'الصف الأول الثانوي',
  'FIRST_SECONDARY': 'الصف الأول الثانوي',
  '2': 'الصف الأول الثانوي',
  'a0000000-0000-0000-0000-000000000003': 'الصف الثاني الثانوي',
  'SECOND_SECONDARY': 'الصف الثاني الثانوي',
  '3': 'الصف الثاني الثانوي',
  'a0000000-0000-0000-0000-000000000004': 'الصف الثالث الثانوي',
  'THIRD_SECONDARY': 'الصف الثالث الثانوي',
  '4': 'الصف الثالث الثانوي',
};

const GOVERNORATE_NAMES: Record<string, string> = {
  'b0000000-0000-0000-0000-000000000001': 'القاهرة',
  'CAIRO': 'القاهرة',
  'b0000000-0000-0000-0000-000000000002': 'الجيزة',
  'GIZA': 'الجيزة',
  'b0000000-0000-0000-0000-000000000003': 'الإسكندرية',
  'ALEXANDRIA': 'الإسكندرية',
  'b0000000-0000-0000-0000-000000000004': 'القليوبية',
  'QALYUBIA': 'القليوبية',
  'QUALYUBIA': 'القليوبية',
  'b0000000-0000-0000-0000-000000000005': 'الشرقية',
  'SHARQIA': 'الشرقية',
  'b0000000-0000-0000-0000-000000000006': 'الدقهلية',
  'DAKAHLIA': 'الدقهلية',
  'b0000000-0000-0000-0000-000000000007': 'الغربية',
  'GHARBIA': 'الغربية',
  'b0000000-0000-0000-0000-000000000008': 'المنوفية',
  'MONUFIA': 'المنوفية',
  'b0000000-0000-0000-0000-000000000009': 'البحيرة',
  'BEHEIRA': 'البحيرة',
  'b0000000-0000-0000-0000-000000000010': 'كفر الشيخ',
  'KAFR_EL_SHEIKH': 'كفر الشيخ',
  'b0000000-0000-0000-0000-000000000011': 'دمياط',
  'DAMIETTA': 'دمياط',
  'b0000000-0000-0000-0000-000000000012': 'بورسعيد',
  'PORT_SAID': 'بورسعيد',
  'b0000000-0000-0000-0000-000000000013': 'الإسماعيلية',
  'ISMAILIA': 'الإسماعيلية',
  'b0000000-0000-0000-0000-000000000014': 'السويس',
  'SUEZ': 'السويس',
  'b0000000-0000-0000-0000-000000000015': 'بني سويف',
  'BENI_SUEF': 'بني سويف',
  'b0000000-0000-0000-0000-000000000016': 'الفيوم',
  'FAYOUM': 'الفيوم',
  'b0000000-0000-0000-0000-000000000017': 'المنيا',
  'MINYA': 'المنيا',
  'b0000000-0000-0000-0000-000000000018': 'أسيوط',
  'ASYUT': 'أسيوط',
  'b0000000-0000-0000-0000-000000000019': 'سوهاج',
  'SOHAG': 'سوهاج',
  'b0000000-0000-0000-0000-000000000020': 'قنا',
  'QENA': 'قنا',
  'b0000000-0000-0000-0000-000000000021': 'الأقصر',
  'LUXOR': 'الأقصر',
  'b0000000-0000-0000-0000-000000000022': 'أسوان',
  'ASWAN': 'أسوان',
  'b0000000-0000-0000-0000-000000000023': 'البحر الأحمر',
  'RED_SEA': 'البحر الأحمر',
  'b0000000-0000-0000-0000-000000000024': 'الوادي الجديد',
  'NEW_VALLEY': 'الوادي الجديد',
  'b0000000-0000-0000-0000-000000000025': 'مطروح',
  'MATROUH': 'مطروح',
  'b0000000-0000-0000-0000-000000000026': 'شمال سيناء',
  'NORTH_SINAI': 'شمال سيناء',
  'b0000000-0000-0000-0000-000000000027': 'جنوب سيناء',
  'SOUTH_SINAI': 'جنوب سيناء',
};

function mapUserToStudent(user: User): Student {
  const profile = user.student_profile || {};
  const yearId = user.academic_year_id || profile.academic_year_id || '';
  const govId = profile.governorate_id || undefined;

  const academicYearName =
    profile.academic_year_name_ar ||
    profile.academic_year_name_en ||
    ACADEMIC_YEAR_NAMES[String(yearId)] ||
    undefined;

  const governorateName =
    profile.governorate_name_ar ||
    profile.governorate_name_en ||
    (govId ? GOVERNORATE_NAMES[String(govId)] : undefined);

  return {
    id: user.id,
    fullName: user.full_name,
    phone: user.phone,
    whatsapp: profile.whatsapp_phone || user.phone,
    parentPhone: profile.parent_phone || '',
    email: user.email || '',
    academicYearId: yearId,
    academicYearName,
    governorateId: govId,
    governorateName,
    schoolName: profile.school_name || undefined,
    educationType: profile.education_type || undefined,
    studyType: profile.study_type || undefined,
    section: profile.section || undefined,
    gender: profile.gender || undefined,
    address: profile.address || undefined,
    avatarUrl: profile.avatar_url || '',
    role: user.role,
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const token = getStoredAccessToken();
    const cachedUser = getStoredUser();
    return !!token && cachedUser?.role === 'STUDENT';
  });

  const [student, setStudent] = useState<Student | null>(() => {
    if (typeof window === 'undefined') return null;
    const token = getStoredAccessToken();
    const cachedUser = getStoredUser();
    if (token && cachedUser && cachedUser.role === 'STUDENT') {
      return mapUserToStudent(cachedUser);
    }
    return null;
  });

  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [returnUrl, setReturnUrl] = useState<string | null>(null);
  const [showAuthGate, setShowAuthGate] = useState(false);

  // Initial session hydration on mount
  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const token = getStoredAccessToken();
      if (!token) {
        if (isMounted) {
          clearStoredAuth();
          setIsAuthenticated(false);
          setStudent(null);
          setIsInitialized(true);
        }
        return;
      }

      // Optimistically restore cached user while validating session with backend
      const cachedUser = getStoredUser();
      if (cachedUser && cachedUser.role === 'STUDENT' && isMounted) {
        setStudent(mapUserToStudent(cachedUser));
        setIsAuthenticated(true);
      }

      try {
        const user = await authApi.getMe();
        if (isMounted) {
          if (user && user.role === 'STUDENT') {
            const studentData = mapUserToStudent(user);
            setStudent(studentData);
            setIsAuthenticated(true);
            storeUser(user);
          } else {
            // Reject non-student roles on the student portal
            clearStoredAuth();
            setIsAuthenticated(false);
            setStudent(null);
          }
        }
      } catch {
        if (isMounted) {
          clearStoredAuth();
          setIsAuthenticated(false);
          setStudent(null);
        }
      } finally {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (phoneOrEmail: string, password: string): Promise<boolean> => {
    const res = await authApi.login({ phone: phoneOrEmail.trim(), password });

    if ('two_factor_required' in res && res.two_factor_required) {
      throw new Error('حسابك يتطلب رمز التحقق بخطوتين.');
    }

    const authRes = res as AuthSuccessResponse;
    if (!authRes || !authRes.user || !authRes.tokens) {
      throw new Error('فشل تسجيل الدخول. استجابة غير صحيحة من السيرفر.');
    }

    if (authRes.user.role !== 'STUDENT') {
      clearStoredAuth();
      throw new Error('هذا الحساب ليس حساب طالب. يرجى استخدام بوابة الإدارة.');
    }

    storeTokens(authRes.tokens);
    storeUser(authRes.user);

    const studentData = mapUserToStudent(authRes.user);
    setStudent(studentData);
    setIsAuthenticated(true);
    setShowAuthGate(false);

    return true;
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    const isPrep3 = String(data.academicYearId) === 'a0000000-0000-0000-0000-000000000001';
    const isSec1 = String(data.academicYearId) === 'a0000000-0000-0000-0000-000000000002';
    const needsNoSection = isPrep3 || isSec1;

    const payload: RegisterPayload = {
      full_name: data.fullName.trim(),
      phone: data.phone.trim(),
      whatsapp_phone: (data.whatsapp || data.phone).trim(),
      parent_phone: data.parentPhone.trim(),
      email: data.email?.trim() || undefined,
      governorate_id: data.governorateId || 'b0000000-0000-0000-0000-000000000001',
      gender: data.gender || 'MALE',
      password: data.password,
      education_type: data.educationType || 'GENERAL',
      study_type: data.studyType || 'ARABIC',
      academic_year_id: String(data.academicYearId),
      section: needsNoSection ? undefined : (data.section || undefined),
      address: data.address?.trim() || undefined,
    };

    const res = await authApi.register(payload);
    if (res && res.tokens && res.user) {
      if (res.user.role !== 'STUDENT') {
        clearStoredAuth();
        throw new Error('نوع الحساب المسجل غير صالح لبوابة الطلاب.');
      }

      storeTokens(res.tokens);
      storeUser(res.user);

      const studentData = mapUserToStudent(res.user);
      setStudent(studentData);
      setIsAuthenticated(true);
      setShowAuthGate(false);

      return true;
    }
    return false;
  }, []);

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  const refreshSubscriptions = useCallback(async () => {
    const token = getStoredAccessToken();
    if (!token) {
      setSubscriptions([]);
      return;
    }
    try {
      let res: any = await apiClient.get<any[]>('/subscriptions').catch(() => null);
      if (!res || (!Array.isArray(res) && !Array.isArray(res?.data))) {
        res = await apiClient.get<any[]>('/api/v1/subscriptions').catch(() => null);
      }
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setSubscriptions(list);
    } catch {
      // Keep existing or empty
    }
  }, []);

  const refreshWallet = useCallback(async () => {
    const token = getStoredAccessToken();
    if (!token) {
      setWalletBalance(0);
      return;
    }
    try {
      let res: any = await apiClient.get<any>('/wallet').catch(() => null);
      if (!res || typeof res.current_balance === 'undefined') {
        res = await apiClient.get<any>('/api/v1/wallet').catch(() => null);
      }
      if (!res || typeof res.current_balance === 'undefined') {
        res = await apiClient.get<any>('/financial/wallet/my-wallet').catch(() => null);
      }
      if (res && (typeof res.current_balance === 'string' || typeof res.current_balance === 'number')) {
        const bal = Number(res.current_balance) || 0;
        setWalletBalance(bal);
        setStudent((prev) => (prev ? { ...prev, walletBalance: bal } : prev));
      } else if (res && typeof res.balance === 'number') {
        setWalletBalance(res.balance);
        setStudent((prev) => (prev ? { ...prev, walletBalance: res.balance } : prev));
      }
    } catch {
      // Keep existing
    }
  }, []);

  // Fetch subscriptions and wallet whenever authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshSubscriptions();
      refreshWallet();
    } else {
      setSubscriptions([]);
      setWalletBalance(0);
    }
  }, [isAuthenticated, refreshSubscriptions, refreshWallet]);

  const isSubscribedToCourse = useCallback(
    (courseId: string | number | undefined | null): boolean => {
      if (!courseId || !subscriptions.length) return false;
      const targetStr = String(courseId).toLowerCase();
      return subscriptions.some((s) => {
        if (s.status !== 'ACTIVE') return false;
        const matchesType = s.item_type === 'COURSE' || !s.item_type;
        const matchesId =
          String(s.course_id || '').toLowerCase() === targetStr ||
          String(s.item_id || '').toLowerCase() === targetStr ||
          String(s.id || '').toLowerCase() === targetStr;
        return matchesType && matchesId;
      });
    },
    [subscriptions]
  );

  const isSubscribedToPackage = useCallback(
    (packageId: string | number | undefined | null): boolean => {
      if (!packageId || !subscriptions.length) return false;
      const targetStr = String(packageId).toLowerCase();
      return subscriptions.some((s) => {
        if (s.status !== 'ACTIVE') return false;
        const matchesType = s.item_type === 'PACKAGE';
        const matchesId =
          String(s.package_id || '').toLowerCase() === targetStr ||
          String(s.item_id || '').toLowerCase() === targetStr ||
          String(s.id || '').toLowerCase() === targetStr;
        return matchesType && matchesId;
      });
    },
    [subscriptions]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout().catch(() => null);
    } finally {
      clearStoredAuth();
      setStudent(null);
      setIsAuthenticated(false);
      setSubscriptions([]);
      setWalletBalance(0);
      setReturnUrl(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  }, []);

  const openAuthGate = useCallback((url?: string) => {
    if (url) setReturnUrl(url);
    setShowAuthGate(true);
  }, []);

  const closeAuthGate = useCallback(() => {
    setShowAuthGate(false);
  }, []);

  const updateStudentAvatar = useCallback(async (avatarUrl: string) => {
    setStudent((prev) => {
      const updated = prev ? { ...prev, avatarUrl } : prev;
      return updated;
    });
    try {
      await apiClient.post('/students/avatar', { avatarUrl }).catch(() => null);
    } catch {
      // Keep state fallback
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isInitialized,
        student,
        returnUrl,
        login,
        register,
        logout,
        setReturnUrl,
        showAuthGate,
        openAuthGate,
        closeAuthGate,
        updateStudentAvatar,
        subscriptions,
        refreshSubscriptions,
        isSubscribedToCourse,
        isSubscribedToPackage,
        walletBalance,
        refreshWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
