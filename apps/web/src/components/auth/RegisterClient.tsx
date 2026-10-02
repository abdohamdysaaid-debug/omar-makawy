'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Phone,
  MessageSquare,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  MapPin,
  AlertCircle,
  Loader2,
  Edit3,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';
import { authApi, Governorate, RegisterPayload } from '@/lib/api/auth';

// Canonical Egyptian Governorates Fallback
const FALLBACK_GOVERNORATES: Governorate[] = [
  { id: 'b0000000-0000-0000-0000-000000000001', code: 'CAIRO', name_ar: 'القاهرة', name_en: 'Cairo' },
  { id: 'b0000000-0000-0000-0000-000000000002', code: 'GIZA', name_ar: 'الجيزة', name_en: 'Giza' },
  { id: 'b0000000-0000-0000-0000-000000000003', code: 'ALEXANDRIA', name_ar: 'الإسكندرية', name_en: 'Alexandria' },
  { id: 'b0000000-0000-0000-0000-000000000004', code: 'QUALYUBIA', name_ar: 'القليوبية', name_en: 'Qualyubia' },
  { id: 'b0000000-0000-0000-0000-000000000005', code: 'SHARQIA', name_ar: 'الشرقية', name_en: 'Sharqia' },
  { id: 'b0000000-0000-0000-0000-000000000006', code: 'DAKAHLIA', name_ar: 'الدقهلية', name_en: 'Dakahlia' },
  { id: 'b0000000-0000-0000-0000-000000000007', code: 'GHARBIA', name_ar: 'الغربية', name_en: 'Gharbia' },
  { id: 'b0000000-0000-0000-0000-000000000008', code: 'MONUFIA', name_ar: 'المنوفية', name_en: 'Monufia' },
  { id: 'b0000000-0000-0000-0000-000000000009', code: 'BEHEIRA', name_ar: 'البحيرة', name_en: 'Beheira' },
  { id: 'b0000000-0000-0000-0000-000000000010', code: 'KAFR_EL_SHEIKH', name_ar: 'كفر الشيخ', name_en: 'Kafr El Sheikh' },
  { id: 'b0000000-0000-0000-0000-000000000011', code: 'DAMIETTA', name_ar: 'دمياط', name_en: 'Damietta' },
  { id: 'b0000000-0000-0000-0000-000000000012', code: 'PORT_SAID', name_ar: 'بورسعيد', name_en: 'Port Said' },
  { id: 'b0000000-0000-0000-0000-000000000013', code: 'ISMAILIA', name_ar: 'الإسماعيلية', name_en: 'Ismailia' },
  { id: 'b0000000-0000-0000-0000-000000000014', code: 'SUEZ', name_ar: 'السويس', name_en: 'Suez' },
  { id: 'b0000000-0000-0000-0000-000000000015', code: 'BENI_SUEF', name_ar: 'بني سويف', name_en: 'Beni Suef' },
  { id: 'b0000000-0000-0000-0000-000000000016', code: 'FAYOUM', name_ar: 'الفيوم', name_en: 'Fayoum' },
  { id: 'b0000000-0000-0000-0000-000000000017', code: 'MINYA', name_ar: 'المنيا', name_en: 'Minya' },
  { id: 'b0000000-0000-0000-0000-000000000018', code: 'ASYUT', name_ar: 'أسيوط', name_en: 'Asyut' },
  { id: 'b0000000-0000-0000-0000-000000000019', code: 'SOHAG', name_ar: 'سوهاج', name_en: 'Sohag' },
  { id: 'b0000000-0000-0000-0000-000000000020', code: 'QENA', name_ar: 'قنا', name_en: 'Qena' },
  { id: 'b0000000-0000-0000-0000-000000000021', code: 'LUXOR', name_ar: 'الأقصر', name_en: 'Luxor' },
  { id: 'b0000000-0000-0000-0000-000000000022', code: 'ASWAN', name_ar: 'أسوان', name_en: 'Aswan' },
  { id: 'b0000000-0000-0000-0000-000000000023', code: 'RED_SEA', name_ar: 'البحر الأحمر', name_en: 'Red Sea' },
  { id: 'b0000000-0000-0000-0000-000000000024', code: 'NEW_VALLEY', name_ar: 'الوادي الجديد', name_en: 'New Valley' },
  { id: 'b0000000-0000-0000-0000-000000000025', code: 'MATROUH', name_ar: 'مطروح', name_en: 'Matrouh' },
  { id: 'b0000000-0000-0000-0000-000000000026', code: 'NORTH_SINAI', name_ar: 'شمال سيناء', name_en: 'North Sinai' },
  { id: 'b0000000-0000-0000-0000-000000000027', code: 'SOUTH_SINAI', name_ar: 'جنوب سيناء', name_en: 'South Sinai' },
];

// Academic Year UUID Mappings (Active fallback with all 4 stages)
const ACADEMIC_YEAR_OPTIONS = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    code: 'THIRD_PREPARATORY',
    title: 'الصف الثالث الإعدادي',
    hasSections: false,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    code: 'FIRST_SECONDARY',
    title: 'الصف الأول الثانوي',
    hasSections: false,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    code: 'SECOND_SECONDARY',
    title: 'الصف الثاني الثانوي',
    hasSections: true,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    code: 'THIRD_SECONDARY',
    title: 'الصف الثالث الثانوي',
    hasSections: true,
  },
];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register: setAuthContextState } = useAuth();
  const { t, language } = useLanguage();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [governorates, setGovernorates] = useState<Governorate[]>(FALLBACK_GOVERNORATES);
  const [academicYears, setAcademicYears] = useState(ACADEMIC_YEAR_OPTIONS);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    fullName: '',
    studentPhone: '',
    sameAsPhone: false,
    whatsappPhone: '',
    parentPhone: '',
    email: '',
    governorateId: 'b0000000-0000-0000-0000-000000000001',
    address: '',
    gender: 'MALE',
    password: '',
    confirmPassword: '',

    // Step 2: Academic
    educationType: 'GENERAL',
    studyType: 'ARABIC',
    academicYearId: 'a0000000-0000-0000-0000-000000000001',
    section: 'SCIENCE_GENERAL',

    // Step 3: Terms
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch Governorates and Academic Years on mount
  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      try {
        const [govs, years] = await Promise.all([
          authApi.getGovernorates(),
          authApi.getAcademicYears(),
        ]);
        if (isMounted) {
          if (Array.isArray(govs) && govs.length > 0) {
            setGovernorates(govs);
            setFormData((prev) => {
              const hasGov = govs.some((g) => g.id === prev.governorateId);
              return hasGov ? prev : { ...prev, governorateId: govs[0].id };
            });
          }
          if (Array.isArray(years) && years.length > 0) {
            const mapped = years.map((y) => ({
              id: y.id,
              code: y.code,
              title: y.name_ar,
              hasSections: y.code === 'THIRD_SECONDARY' || y.code === 'SECOND_SECONDARY',
            }));
            setAcademicYears(mapped);
            setFormData((prev) => {
              const currentValid = mapped.some((m) => m.id === prev.academicYearId);
              return {
                ...prev,
                academicYearId: currentValid ? prev.academicYearId : mapped[0].id,
              };
            });
          }
        }
      } catch {
        // Fallbacks already active
      }
    }
    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle WhatsApp Copy Toggle
  const handleSameAsPhoneToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      sameAsPhone: checked,
      whatsappPhone: checked ? prev.studentPhone : prev.whatsappPhone,
    }));
    if (errors.whatsappPhone) {
      setErrors((prev) => ({ ...prev, whatsappPhone: '' }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'studentPhone' && prev.sameAsPhone) {
        next.whatsappPhone = value;
      }
      return next;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Step 2 Hierarchical Handlers for Dropdowns
  const handleEducationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const eduType = e.target.value;
    setFormData((prev) => {
      let nextSection = prev.section;
      if (eduType === 'AZHAR' && prev.section === 'SCIENCE_MATH') {
        nextSection = 'SCIENCE_GENERAL';
      }
      return {
        ...prev,
        educationType: eduType,
        section: nextSection,
      };
    });
    if (errors.educationType) {
      setErrors((prev) => ({ ...prev, educationType: '' }));
    }
  };

  const handleAcademicYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const yearId = e.target.value;
    const isPrep3 = yearId === 'a0000000-0000-0000-0000-000000000001';
    setFormData((prev) => ({
      ...prev,
      academicYearId: yearId,
      section: isPrep3 ? '' : (prev.section || 'SCIENCE_GENERAL'),
    }));
    if (errors.academicYearId) {
      setErrors((prev) => ({ ...prev, academicYearId: '' }));
    }
  };

  // --- Step 1 Validation ---
  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 1. Full name validation (Min 4 words, Arabic/English, each word >= 2 chars, no numbers-only)
    const nameTrimmed = formData.fullName.trim();
    const words = nameTrimmed.split(/\s+/).filter(Boolean);
    if (!nameTrimmed) {
      newErrors.fullName = 'اسم الطالب الرباعي مطلوب';
    } else if (words.length < 4) {
      newErrors.fullName = 'من فضلك اكتب اسم الطالب رباعي (4 كلمات على الأقل)';
    } else if (words.some((w) => w.length < 2)) {
      newErrors.fullName = 'كل جزء من الاسم يجب أن يتكون من حرفين على الأقل';
    } else if (/^\d+$/.test(nameTrimmed)) {
      newErrors.fullName = 'لا يمكن أن يحتوي الاسم على أرقام فقط';
    } else if (!/^[\u0600-\u06FFa-zA-Z\s]+$/.test(nameTrimmed)) {
      newErrors.fullName = 'الاسم يحتوي على أرقام أو رموز غير مسموح بها';
    }

    // 2. Student Phone
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!formData.studentPhone) {
      newErrors.studentPhone = 'رقم هاتف الطالب مطلوب';
    } else if (!phoneRegex.test(formData.studentPhone)) {
      newErrors.studentPhone = 'يرجى إدخال رقم هاتف مصري صحيح من 11 رقم (010, 011, 012, 015)';
    }

    // 3. WhatsApp Phone
    if (!formData.whatsappPhone) {
      newErrors.whatsappPhone = 'رقم واتساب الطالب مطلوب';
    } else if (!phoneRegex.test(formData.whatsappPhone)) {
      newErrors.whatsappPhone = 'يرجى إدخال رقم واتساب مصري صحيح من 11 رقم';
    }

    // 4. Parent Phone
    if (!formData.parentPhone) {
      newErrors.parentPhone = 'رقم هاتف ولي الأمر مطلوب';
    } else if (!phoneRegex.test(formData.parentPhone)) {
      newErrors.parentPhone = 'يرجى إدخال رقم هاتف ولي الأمر مصري صحيح من 11 رقم';
    }

    // 5. Optional Email Validation
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'يرجى إدخال بريد إلكتروني صحيح';
      }
    }

    // 6. Governorate
    if (!formData.governorateId) {
      newErrors.governorateId = 'يرجى اختيار المحافظة';
    }

    // 7. Password
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تتكون من 8 أحرف على الأقل';
    }

    // 8. Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Step 2 Validation ---
  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.educationType) {
      newErrors.educationType = 'نوع التعليم مطلوب';
    }
    if (!formData.studyType) {
      newErrors.studyType = 'نوع الدراسة مطلوب';
    }
    if (!formData.academicYearId) {
      newErrors.academicYearId = 'الصف الدراسي مطلوب';
    }

    const isPrep3 = formData.academicYearId === 'a0000000-0000-0000-0000-000000000001';
    if (!isPrep3 && !formData.section) {
      newErrors.section = 'الشعبة مطلوبة لهذا الصف الدراسي';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation Buttons Handlers
  const handleGoToStep2 = () => {
    if (validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGoToStep3 = () => {
    if (validateStep2()) {
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Submit Registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptTerms) {
      setErrors((prev) => ({ ...prev, acceptTerms: 'يرجى الموافقة على الشروط والأحكام للاستمرار' }));
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const isPrep3 = formData.academicYearId === 'a0000000-0000-0000-0000-000000000001';

    const payload: RegisterPayload = {
      full_name: formData.fullName.trim(),
      phone: formData.studentPhone.trim(),
      whatsapp_phone: formData.whatsappPhone.trim(),
      parent_phone: formData.parentPhone.trim(),
      email: formData.email.trim() || undefined,
      governorate_id: formData.governorateId,
      address: formData.address.trim() || undefined,
      gender: formData.gender,
      password: formData.password,
      education_type: formData.educationType,
      study_type: formData.studyType,
      academic_year_id: formData.academicYearId,
      section: isPrep3 ? undefined : (formData.section || undefined),
    };

    try {
      await setAuthContextState({
        fullName: formData.fullName,
        phone: formData.studentPhone,
        whatsapp: formData.whatsappPhone,
        parentPhone: formData.parentPhone,
        email: formData.email,
        password: formData.password,
        academicYearId: formData.academicYearId,
        governorateId: formData.governorateId,
        address: formData.address.trim() || undefined,
        gender: formData.gender,
        educationType: formData.educationType,
        studyType: formData.studyType,
        section: isPrep3 ? undefined : (formData.section || undefined),
      });

      setStep(4); // Success screen
      
      const returnUrl = searchParams.get('returnUrl') || '/student';
      setTimeout(() => {
        router.push(returnUrl);
      }, 2000);
    } catch (err: any) {
      let msg = err?.message || err?.details?.message;
      if (err?.details?.errors?.general && Array.isArray(err.details.errors.general)) {
        msg = err.details.errors.general.join(' - ');
      }
      if (!msg || msg === 'Validation failed') {
        msg = 'بيانات التسجيل غير مكتملة أو غير صحيحة. يرجى مراجعة كافة الحقول.';
      }
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Live Password Requirements Checks
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasLowercase = /[a-z]/.test(formData.password);
  const hasDigit = /[0-9]/.test(formData.password);
  const hasMinLength = formData.password.length >= 8;

  const currentYearObj = academicYears.find((y) => y.id === formData.academicYearId);
  const selectedGovObj = governorates.find((g) => g.id === formData.governorateId);
  const isPrep3 = currentYearObj?.code === 'THIRD_PREPARATORY' || formData.academicYearId === 'a0000000-0000-0000-0000-000000000001';
  const isSec1 = currentYearObj?.code === 'FIRST_SECONDARY' || formData.academicYearId === 'a0000000-0000-0000-0000-000000000002';
  const isSec2 = currentYearObj?.code === 'SECOND_SECONDARY' || formData.academicYearId === 'a0000000-0000-0000-0000-000000000003';
  const isSec3 = currentYearObj?.code === 'THIRD_SECONDARY' || formData.academicYearId === 'a0000000-0000-0000-0000-000000000004';
  const showSectionSelector = isSec2 || isSec3;

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      {/* Dedicated Horizontal Stepper Section with Distinct Surface Background */}
      {step < 4 && (
        <div className="mb-6 pt-7 sm:pt-9 pb-5 px-4 sm:px-8 rounded-2xl bg-[#dce6db] dark:bg-[#121212] border-2 border-emerald-950/15 dark:border-stone-800 shadow-sm transition-colors duration-300">
          <div className="flex flex-col gap-3 max-w-lg mx-auto px-1 sm:px-4 pt-1 sm:pt-2">
            {/* Row 1: Step Numbers & Connecting Lines */}
            <div className="flex items-center justify-between">
              {/* Step 1 Number Badge */}
              <button
                type="button"
                onClick={() => step > 1 && setStep(1)}
                disabled={step <= 1}
                aria-label="الخطوة 1: بياناتك"
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-black transition-all ${
                  step === 1
                    ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-600/20'
                    : step > 1
                    ? 'bg-emerald-600 text-white cursor-pointer hover:opacity-90'
                    : 'bg-stone-300 dark:bg-[#222222] text-gray-700 dark:text-gray-300 font-extrabold'
                }`}
              >
                {step > 1 ? <Check className="w-5 h-5 stroke-[3]" /> : '1'}
              </button>

              {/* Connecting Line 1-2 */}
              <div
                className={`flex-1 h-1 mx-3 sm:mx-6 rounded-full transition-colors duration-300 ${
                  step > 1 ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-stone-300/90 dark:bg-[#282828]'
                }`}
              />

              {/* Step 2 Number Badge */}
              <button
                type="button"
                onClick={() => step > 2 && setStep(2)}
                disabled={step <= 2}
                aria-label="الخطوة 2: دراستك"
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-black transition-all ${
                  step === 2
                    ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-600/20'
                    : step > 2
                    ? 'bg-emerald-600 text-white cursor-pointer hover:opacity-90'
                    : 'bg-stone-300 dark:bg-[#222222] text-gray-700 dark:text-gray-300 font-extrabold'
                }`}
              >
                {step > 2 ? <Check className="w-5 h-5 stroke-[3]" /> : '2'}
              </button>

              {/* Connecting Line 2-3 */}
              <div
                className={`flex-1 h-1 mx-3 sm:mx-6 rounded-full transition-colors duration-300 ${
                  step > 2 ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-stone-300/90 dark:bg-[#282828]'
                }`}
              />

              {/* Step 3 Number Badge */}
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-black transition-all ${
                  step === 3
                    ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-600/20'
                    : 'bg-stone-300 dark:bg-[#222222] text-gray-700 dark:text-gray-300 font-extrabold'
                }`}
              >
                3
              </div>
            </div>

            {/* Row 2: Labels aligned under step numbers */}
            <div className="flex items-center justify-between text-center">
              <button
                type="button"
                onClick={() => step > 1 && setStep(1)}
                disabled={step <= 1}
                className={`w-20 sm:w-24 text-center focus:outline-none ${step > 1 ? 'cursor-pointer' : ''}`}
              >
                <span
                  className={`block text-xs sm:text-sm transition-colors ${
                    step === 1
                      ? 'text-emerald-900 dark:text-emerald-300 font-extrabold'
                      : step > 1
                      ? 'text-emerald-800 dark:text-emerald-400 font-bold'
                      : 'text-gray-700 dark:text-gray-300 font-medium'
                  }`}
                >
                  بياناتك
                </span>
                <span className="hidden sm:block text-[11px] text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                  البيانات الشخصية
                </span>
              </button>

              <button
                type="button"
                onClick={() => step > 2 && setStep(2)}
                disabled={step <= 2}
                className={`w-20 sm:w-24 text-center focus:outline-none ${step > 2 ? 'cursor-pointer' : ''}`}
              >
                <span
                  className={`block text-xs sm:text-sm transition-colors ${
                    step === 2
                      ? 'text-emerald-900 dark:text-emerald-300 font-extrabold'
                      : step > 2
                      ? 'text-emerald-800 dark:text-emerald-400 font-bold'
                      : 'text-gray-700 dark:text-gray-300 font-medium'
                  }`}
                >
                  دراستك
                </span>
                <span className="hidden sm:block text-[11px] text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                  البيانات الدراسية
                </span>
              </button>

              <div className="w-20 sm:w-24 text-center">
                <span
                  className={`block text-xs sm:text-sm transition-colors ${
                    step === 3
                      ? 'text-emerald-900 dark:text-emerald-300 font-extrabold'
                      : 'text-gray-700 dark:text-gray-300 font-medium'
                  }`}
                >
                  مراجعة وتأكيد
                </span>
                <span className="hidden sm:block text-[11px] text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                  مراجعة البيانات
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Card Container with Visible Crisp Border & Surface Separation */}
      <div className="rounded-3xl bg-white dark:bg-[#0d0d0d] border-2 border-stone-300/90 dark:border-stone-800 shadow-md p-6 sm:p-10 transition-colors duration-300">
        {/* ============================================================ */}
        {/* STEP 1: PERSONAL INFORMATION                                  */}
        {/* ============================================================ */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1 text-start border-b border-stone-200 dark:border-gray-800 pb-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-6 bg-emerald-600 rounded-full inline-block" />
                البيانات الشخصية
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                أدخل بياناتك الأساسية بدقة لتأهيل حسابك التعليمي
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Full Name (4 words min, each >= 2 chars) */}
              <div className="sm:col-span-2 space-y-1.5 text-start">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  الاسم الرباعي <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="مثال: أحمد محمد علي حسن"
                  className={`w-full px-4 py-3 rounded-xl bg-[#f4f7f4] dark:bg-[#1a1a1a] border-2 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#222222] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all ${
                    errors.fullName ? 'border-red-500 ring-1 ring-red-500' : 'border-stone-300/90 dark:border-stone-800'
                  }`}
                />
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">اكتب اسمك رباعي كما هو في السجلات الرسمية (4 كلمات على الأقل، ويكون كل جزء من حرفين على الأقل)</p>
                {errors.fullName && (
                  <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* 2. Student Phone */}
              <div className="space-y-1.5 text-start">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  رقم الهاتف <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="studentPhone"
                  dir="ltr"
                  maxLength={11}
                  value={formData.studentPhone}
                  onChange={handleInputChange}
                  placeholder="010XXXXXXXX"
                  className={`w-full px-4 py-3 rounded-xl bg-[#f4f7f4] dark:bg-[#1a1a1a] border-2 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#222222] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all ${
                    errors.studentPhone ? 'border-red-500 ring-1 ring-red-500' : 'border-stone-300/90 dark:border-stone-800'
                  }`}
                />
                {errors.studentPhone && (
                  <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.studentPhone}
                  </p>
                )}
              </div>

              {/* 3. Student WhatsApp */}
              <div className="space-y-1.5 text-start">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    رقم واتساب الطالب <span className="text-red-500">*</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sameAsPhone}
                      onChange={handleSameAsPhoneToggle}
                      className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    نفس رقم الهاتف
                  </label>
                </div>
                <input
                  type="tel"
                  name="whatsappPhone"
                  dir="ltr"
                  maxLength={11}
                  disabled={formData.sameAsPhone}
                  value={formData.whatsappPhone}
                  onChange={handleInputChange}
                  placeholder="010XXXXXXXX"
                  className={`w-full px-4 py-3 rounded-xl bg-[#f4f7f4] dark:bg-[#1a1a1a] border-2 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#222222] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all ${
                    formData.sameAsPhone ? 'opacity-60 cursor-not-allowed bg-stone-200/80 dark:bg-[#161616]' : ''
                  } ${errors.whatsappPhone ? 'border-red-500 ring-1 ring-red-500' : 'border-stone-300/90 dark:border-stone-800'}`}
                />
                {errors.whatsappPhone && (
                  <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.whatsappPhone}
                  </p>
                )}
              </div>

              {/* 4. Parent Phone */}
              <div className="space-y-1.5 text-start">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  رقم هاتف ولي الأمر <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="parentPhone"
                  dir="ltr"
                  maxLength={11}
                  value={formData.parentPhone}
                  onChange={handleInputChange}
                  placeholder="011XXXXXXXX"
                  className={`w-full px-4 py-3 rounded-xl bg-[#f4f7f4] dark:bg-[#1a1a1a] border-2 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#222222] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all ${
                    errors.parentPhone ? 'border-red-500 ring-1 ring-red-500' : 'border-stone-300/90 dark:border-stone-800'
                  }`}
                />
                {errors.parentPhone && (
                  <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.parentPhone}
                  </p>
                )}
              </div>

              {/* 5. Optional Email */}
              <div className="space-y-1.5 text-start">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  البريد الإلكتروني <span className="text-gray-500 dark:text-gray-400 font-normal">(اختياري)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  dir="ltr"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="student@example.com"
                  className={`w-full px-4 py-3 rounded-xl bg-[#f4f7f4] dark:bg-[#1a1a1a] border-2 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#222222] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all ${
                    errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-stone-300/90 dark:border-stone-800'
                  }`}
                />
                {errors.email && (
                  <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* 6. Governorate Dropdown with Fully Styled Options in Dark Mode */}
              <div className="space-y-1.5 text-start">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  المحافظة <span className="text-red-500">*</span>
                </label>
                <select
                  name="governorateId"
                  value={formData.governorateId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl bg-[#f4f7f4] dark:bg-[#1a1a1a] border-2 text-sm font-semibold text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:bg-white dark:focus:bg-[#222222] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all ${
                    errors.governorateId ? 'border-red-500 ring-1 ring-red-500' : 'border-stone-300/90 dark:border-stone-800'
                  }`}
                >
                  <option value="" className="bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 font-medium">-- اختر المحافظة --</option>
                  {governorates.map((gov) => (
                    <option key={gov.id} value={gov.id} className="bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 font-medium">
                      {gov.name_ar} ({gov.name_en})
                    </option>
                  ))}
                </select>
                {errors.governorateId && (
                  <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.governorateId}
                  </p>
                )}
              </div>

              {/* 7. Detailed Address (العنوان بالتفصيل) */}
              <div className="space-y-1.5 text-start">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  العنوان بالتفصيل <span className="text-gray-500 dark:text-gray-400 font-normal">(اختياري)</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="مثال: شارع التحرير، الدقي، الجيزة"
                  className="w-full px-4 py-3 rounded-xl bg-[#f4f7f4] dark:bg-[#1a1a1a] border-2 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#222222] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all border-stone-300/90 dark:border-stone-800"
                />
              </div>

              {/* 8. Gender */}
              <div className="space-y-1.5 text-start sm:col-span-2">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  النوع <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, gender: 'MALE' }))}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                      formData.gender === 'MALE'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-[#f4f7f4] dark:bg-[#1a1a1a] border-stone-300/90 dark:border-stone-800 text-gray-800 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-[#222222]'
                    }`}
                  >
                    ذكر (Male)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, gender: 'FEMALE' }))}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                      formData.gender === 'FEMALE'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-[#f4f7f4] dark:bg-[#1a1a1a] border-stone-300/90 dark:border-stone-800 text-gray-800 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-[#222222]'
                    }`}
                  >
                    أنثى (Female)
                  </button>
                </div>
              </div>

              {/* 8. Password with Focus Requirement Box */}
              <div className="space-y-1.5 text-start">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  كلمة المرور <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    dir="ltr"
                    value={formData.password}
                    onFocus={() => setIsPasswordFocused(true)}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 pe-12 rounded-xl bg-[#f4f7f4] dark:bg-[#1a1a1a] border-2 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#222222] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all ${
                      errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border-stone-300/90 dark:border-stone-800'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    className="absolute start-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Live Password Requirements Panel */}
                {(isPasswordFocused || formData.password.length > 0) && (
                  <div className="p-3 rounded-xl bg-[#eef3ee] dark:bg-[#141414] border-2 border-stone-300/70 dark:border-stone-800 space-y-1.5 mt-2 animate-fade-in">
                    <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">متطلبات كلمة المرور:</p>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <div className={`flex items-center gap-1 font-semibold ${hasUppercase ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-500'}`}>
                        {hasUppercase ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="w-3.5 inline-block text-center">•</span>}
                        حرف كبير (A-Z)
                      </div>
                      <div className={`flex items-center gap-1 font-semibold ${hasLowercase ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-500'}`}>
                        {hasLowercase ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="w-3.5 inline-block text-center">•</span>}
                        حرف صغير (a-z)
                      </div>
                      <div className={`flex items-center gap-1 font-semibold ${hasDigit ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-500'}`}>
                        {hasDigit ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="w-3.5 inline-block text-center">•</span>}
                        رقم (0-9)
                      </div>
                      <div className={`flex items-center gap-1 font-semibold ${hasMinLength ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-500'}`}>
                        {hasMinLength ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="w-3.5 inline-block text-center">•</span>}
                        8 أحرف على الأقل
                      </div>
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p className="text-xs font-bold text-red-500 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* 9. Confirm Password */}
              <div className="space-y-1.5 text-start">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  تأكيد كلمة المرور <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    dir="ltr"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 pe-12 rounded-xl bg-[#f4f7f4] dark:bg-[#1a1a1a] border-2 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-[#222222] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all ${
                      errors.confirmPassword ? 'border-red-500 ring-1 ring-red-500' : 'border-stone-300/90 dark:border-stone-800'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'إخفاء تأكيد كلمة المرور' : 'إظهار تأكيد كلمة المرور'}
                    title={showConfirmPassword ? 'إخفاء تأكيد كلمة المرور' : 'إظهار تأكيد كلمة المرور'}
                    className="absolute start-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <div className="mt-1">
                    {formData.password === formData.confirmPassword ? (
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        كلمتا المرور متطابقتان
                      </p>
                    ) : (
                      <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        كلمتا المرور غير متطابقتين
                      </p>
                    )}
                  </div>
                )}
                {errors.confirmPassword && !formData.confirmPassword && (
                  <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Step 1 Action Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleGoToStep2}
                className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                التالي: البيانات الدراسية
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 2: ACADEMIC INFORMATION (SELECT DROPDOWNS WITH DARK THEME) */}
        {/* ============================================================ */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1 text-start border-b border-stone-200 dark:border-stone-800 pb-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-6 bg-emerald-600 rounded-full inline-block" />
                بياناتك الدراسية
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                اختر مرحلتك الدراسية ونوع التعليم للتأكد من تخصيص المحتوى المناسب لك
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-start">
              {/* 1. Education Type (نوع التعليم) Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  نوع التعليم <span className="text-red-500">*</span>
                </label>
                <select
                  name="educationType"
                  value={formData.educationType}
                  onChange={handleEducationTypeChange}
                  className={`w-full px-4 py-3 rounded-xl bg-[#f4f7f4] dark:bg-[#1a1a1a] border-2 text-sm font-semibold text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:bg-white dark:focus:bg-[#222222] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all ${
                    errors.educationType ? 'border-red-500 ring-1 ring-red-500' : 'border-stone-300/90 dark:border-stone-800'
                  }`}
                >
                  <option value="GENERAL" className="bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 font-medium">تعليم عام</option>
                  <option value="AZHAR" className="bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 font-medium">تعليم أزهري</option>
                </select>
                {errors.educationType && (
                  <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.educationType}
                  </p>
                )}
              </div>

              {/* 2. Study Type (مسار الدراسة) Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  مسار الدراسة <span className="text-red-500">*</span>
                </label>
                <select
                  name="studyType"
                  value={formData.studyType}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-xl bg-[#f4f7f4] dark:bg-[#1a1a1a] border-2 text-sm font-semibold text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:bg-white dark:focus:bg-[#222222] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all ${
                    errors.studyType ? 'border-red-500 ring-1 ring-red-500' : 'border-stone-300/90 dark:border-stone-800'
                  }`}
                >
                  <option value="ARABIC" className="bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 font-medium">دراسة عربي</option>
                  <option value="LANGUAGES" className="bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 font-medium">دراسة لغات (Languages)</option>
                </select>
                {errors.studyType && (
                  <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.studyType}
                  </p>
                )}
              </div>

              {/* 3. Academic Year / Grade (الصف الدراسي) Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  الصف الدراسي <span className="text-red-500">*</span>
                </label>
                <select
                  name="academicYearId"
                  value={formData.academicYearId}
                  onChange={handleAcademicYearChange}
                  className={`w-full px-4 py-3 rounded-xl bg-[#f4f7f4] dark:bg-[#1a1a1a] border-2 text-sm font-semibold text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:bg-white dark:focus:bg-[#222222] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all ${
                    errors.academicYearId ? 'border-red-500 ring-1 ring-red-500' : 'border-stone-300/90 dark:border-stone-800'
                  }`}
                >
                  {academicYears.map((item) => (
                    <option key={item.id} value={item.id} className="bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 font-medium">
                      {item.title}
                    </option>
                  ))}
                </select>
                {errors.academicYearId && (
                  <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.academicYearId}
                  </p>
                )}
              </div>

              {/* 4. Section / Track (Conditional Dropdown for 2nd and 3rd Secondary) */}
              {showSectionSelector && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    الشعبة / التخصص <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl bg-[#f4f7f4] dark:bg-[#1a1a1a] border-2 text-sm font-semibold text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark] focus:outline-none focus:bg-white dark:focus:bg-[#222222] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all ${
                      errors.section ? 'border-red-500 ring-1 ring-red-500' : 'border-stone-300/90 dark:border-stone-800'
                    }`}
                  >
                    {isSec2 || formData.educationType === 'AZHAR' ? (
                      <>
                        <option value="SCIENCE_GENERAL" className="bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 font-medium">علمي</option>
                        <option value="LITERATURE" className="bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 font-medium">أدبي</option>
                      </>
                    ) : (
                      <>
                        <option value="SCIENCE_GENERAL" className="bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 font-medium">علمي علوم</option>
                        <option value="SCIENCE_MATH" className="bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 font-medium">علمي رياضة</option>
                        <option value="LITERATURE" className="bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 font-medium">أدبي</option>
                      </>
                    )}
                  </select>
                  {errors.section && (
                    <p className="text-xs font-bold text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.section}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Step 2 Action Buttons */}
            <div className="pt-6 flex items-center justify-between gap-4 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-xl bg-stone-100 dark:bg-[#1a1a1a] hover:bg-stone-200 dark:hover:bg-[#222222] text-gray-800 dark:text-gray-300 font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <ChevronRight className="w-4 h-4" />
                الرجوع للبيانات الشخصية
              </button>

              <button
                type="button"
                onClick={handleGoToStep3}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
              >
                التالي: مراجعة البيانات
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 3: REVIEW & CONFIRMATION                                 */}
        {/* ============================================================ */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            <div className="space-y-1 text-start border-b border-stone-200 dark:border-stone-800 pb-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-6 bg-emerald-600 rounded-full inline-block" />
                راجع بياناتك قبل تأكيد الحساب
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                تأكد من صحة جميع البيانات المدخلة قبل الضغط على إنشاء الحساب
              </p>
            </div>

            {/* Error Notification Alert if API returned error */}
            {submitError && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-2 text-start">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
                <span className="flex-1">{submitError}</span>
              </div>
            )}

            {/* Summary Box 1: Personal Information */}
            <div className="p-5 rounded-2xl bg-[#f4f7f4] dark:bg-[#141414] border-2 border-stone-300/80 dark:border-stone-800 space-y-3 text-start">
              <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-stone-800 pb-2.5">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  البيانات الشخصية
                </h3>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3 py-1 bg-white dark:bg-[#1a1a1a] hover:bg-emerald-50 text-emerald-700 dark:text-emerald-400 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  تعديل
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block font-medium">الاسم الرباعي:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formData.fullName}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block font-medium">رقم الهاتف:</span>
                  <span className="font-bold text-gray-900 dark:text-white dir-ltr inline-block">{formData.studentPhone}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block font-medium">رقم واتساب:</span>
                  <span className="font-bold text-gray-900 dark:text-white dir-ltr inline-block">{formData.whatsappPhone}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block font-medium">رقم ولي الأمر:</span>
                  <span className="font-bold text-gray-900 dark:text-white dir-ltr inline-block">{formData.parentPhone}</span>
                </div>
                {formData.email.trim() && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block font-medium">البريد الإلكتروني:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{formData.email}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block font-medium">المحافظة:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedGovObj?.name_ar || 'غير محدد'}</span>
                </div>
                {formData.address.trim() && (
                  <div className="sm:col-span-2">
                    <span className="text-gray-500 dark:text-gray-400 block font-medium">العنوان بالتفصيل:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{formData.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Summary Box 2: Academic Information */}
            <div className="p-5 rounded-2xl bg-[#f4f7f4] dark:bg-[#141414] border-2 border-stone-300/80 dark:border-stone-800 space-y-3 text-start">
              <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-stone-800 pb-2.5">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  البيانات الدراسية
                </h3>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-3 py-1 bg-white dark:bg-[#1a1a1a] hover:bg-emerald-50 text-emerald-700 dark:text-emerald-400 border border-stone-200 dark:border-stone-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  تعديل
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block font-medium">نوع التعليم:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formData.educationType === 'GENERAL' ? 'تعليم عام' : 'تعليم أزهري'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block font-medium">مسار الدراسة:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {formData.studyType === 'ARABIC' ? 'دراسة عربي' : 'دراسة لغات (Languages)'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block font-medium">الصف الدراسي:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{currentYearObj?.title}</span>
                </div>
                {showSectionSelector && formData.section && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block font-medium">الشعبة / التخصص:</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {isSec2 || formData.educationType === 'AZHAR'
                        ? (formData.section === 'LITERATURE' ? 'أدبي' : 'علمي')
                        : formData.section === 'SCIENCE_MATH'
                        ? 'علمي رياضة'
                        : formData.section === 'LITERATURE'
                        ? 'أدبي'
                        : 'علمي علوم'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Terms Agreement Checkbox */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border-2 border-emerald-200/80 dark:border-emerald-900/40 text-start">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, acceptTerms: e.target.checked }));
                    if (errors.acceptTerms) setErrors((prev) => ({ ...prev, acceptTerms: '' }));
                  }}
                  className="mt-0.5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-300 leading-relaxed">
                  أقر بأن البيانات التي أدخلتها صحيحة ودقيقة، وأوافق على شروط وسياسة استخدام منصة مستر عمر مكاوي التعليمية.
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-xs font-bold text-red-500 mt-2 flex items-center gap-1 ms-7">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.acceptTerms}
                </p>
              )}
            </div>

            {/* Step 3 Action Buttons */}
            <div className="pt-4 flex items-center justify-between gap-4 border-t border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl bg-stone-100 dark:bg-[#1a1a1a] hover:bg-stone-200 dark:hover:bg-[#222222] text-gray-800 dark:text-gray-300 font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <ChevronRight className="w-4 h-4" />
                الرجوع للدراسة
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-10 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري إنشاء الحساب...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    إنشاء الحساب الآن
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* STEP 4: SUCCESS STATE SCREEN                                  */}
        {/* ============================================================ */}
        {step === 4 && (
          <div className="py-12 px-4 text-center space-y-4 animate-scale-up">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                تم إنشاء حسابك بنجاح!
              </h2>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري تحويلك إلى لوحة التحكم الخاصة بك...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Login Navigation Link at Footer */}
      {step < 4 && (
        <div className="mt-8 text-center text-sm font-medium text-gray-700 dark:text-gray-400">
          لديك حساب بالفعل على المنصة؟{' '}
          <Link href="/login" className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
            تسجيل الدخول
          </Link>
        </div>
      )}
    </div>
  );
}

export default function RegisterClient() {
  return (
    <div className="flex min-h-screen flex-col bg-[#eef2ed] dark:bg-[#000000] text-gray-900 dark:text-gray-100 font-cairo transition-colors duration-300">
      <Navbar />
      <main className="flex-1 flex items-start justify-center p-4 pt-20 sm:pt-24 pb-12 sm:pb-16">
        <Suspense fallback={<div className="h-96 w-full max-w-2xl animate-pulse rounded-3xl bg-gray-200 dark:bg-gray-800" />}>
          <RegisterForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
