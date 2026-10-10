'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { staffApiClient as apiClient } from '@/context/StaffAuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useAcademicYearScope } from '@/context/AcademicYearContext';
import { SystemPermissions } from '@omar-makawy/shared';
import {
  Wallet,
  Tag,
  Plus,
  Search,
  RefreshCw,
  Copy,
  Check,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Coins,
  Calendar,
  X,
  ShieldAlert,
  AlertTriangle,
  Percent,
  Layers,
  List,
  Eye,
  Package,
  GraduationCap,
  BookOpen,
  FileText,
  Sparkles,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/FeedbackStates';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { generateBatchPDF } from '@/lib/pdf-generator';

type TabType = 'packages' | 'courses' | 'wallet' | 'discounts';
type ViewMode = 'batches' | 'table';

interface CodeItem {
  id: string;
  code_preview?: string;
  code?: string;
  type?: string;
  amount?: string | number;
  discount_type?: string;
  discount_value?: any;
  target_type?: string;
  target_title?: string;
  package_title?: string;
  course_title?: string;
  target_id?: string;
  academic_year_id?: string;
  academic_year_name?: string;
  academic_year_name_ar?: string;
  academic_year_name_en?: string;
  batch_id?: string;
  status: string;
  max_uses?: number;
  used_count?: number;
  used_by_name?: string;
  used_by_phone?: string;
  used_at?: string;
  created_at: string;
  expires_at?: string;
  raw?: string;
}

interface BatchGroup {
  batchId: string;
  type: 'PACKAGE' | 'COURSE' | 'WALLET' | 'DISCOUNT';
  title: string;
  amount?: number | string;
  targetName?: string;
  discountType?: string;
  discountValue?: number | string;
  targetTitle?: string;
  totalCodes: number;
  activeCount: number;
  usedCount: number;
  disabledCount: number;
  createdAt: string;
  expiresAt?: string;
  codes: CodeItem[];
}

interface GeneratedBatchResult {
  title: string;
  type: 'PACKAGE' | 'COURSE' | 'WALLET' | 'DISCOUNT';
  targetName?: string;
  amount?: number | string;
  discountType?: string;
  discountValue?: number | string;
  codes: Array<{
    raw?: string;
    code?: string;
    preview?: string;
    code_preview?: string;
    amount?: string | number;
    discount_value?: any;
    discount_type?: string;
    expires_at?: string | Date;
  }>;
}

export default function StaffCodesManagementPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { isTeacher, hasPermission } = usePermissions();
  const { availableYears, activeAcademicYearId } = useAcademicYearScope();

  const canManage =
    isTeacher ||
    hasPermission(SystemPermissions.WALLET_MANAGE) ||
    hasPermission(SystemPermissions.PACKAGES_MANAGE) ||
    hasPermission(SystemPermissions.COURSES_MANAGE);

  // Active Tab & View Mode
  const [activeTab, setActiveTab] = useState<TabType>('wallet');
  const [viewMode, setViewMode] = useState<ViewMode>('batches');

  // Lookups Data
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [packagesList, setPackagesList] = useState<any[]>([]);
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [loadingLookups, setLoadingLookups] = useState<boolean>(true);

  // Active Tab Table Data
  const [items, setItems] = useState<CodeItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [discountTypeFilter, setDiscountTypeFilter] = useState<string>('ALL');
  const [discountTargetFilter, setDiscountTargetFilter] = useState<string>('ALL');

  // Feedback Notification
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Active Selected Batch Modal (For inspecting a batch card)
  const [selectedBatch, setSelectedBatch] = useState<BatchGroup | null>(null);
  const [batchSearchQuery, setBatchSearchQuery] = useState<string>('');

  // Action / Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: async () => {},
  });

  // Generation Modals Open State
  const [isPkgModalOpen, setIsPkgModalOpen] = useState<boolean>(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState<boolean>(false);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState<boolean>(false);
  const [isSingleDiscModalOpen, setIsSingleDiscModalOpen] = useState<boolean>(false);
  const [isBulkDiscModalOpen, setIsBulkDiscModalOpen] = useState<boolean>(false);

  // Post-Generation Result & Print Modals
  const [batchResult, setBatchResult] = useState<GeneratedBatchResult | null>(null);
  const [isAllCopied, setIsAllCopied] = useState<boolean>(false);
  const [rawBatchesMap, setRawBatchesMap] = useState<Record<string, Array<{ raw?: string; code?: string; preview?: string; code_preview?: string; expires_at?: any }>>>({});
  const [isPrintModeOpen, setIsPrintModeOpen] = useState<boolean>(false);
  const [printTargetBatch, setPrintTargetBatch] = useState<{
    title: string;
    type: 'PACKAGE' | 'COURSE' | 'WALLET' | 'DISCOUNT';
    amount?: number | string;
    targetName?: string;
    discountType?: string;
    discountValue?: number | string;
    codes: Array<{ raw?: string; code?: string; preview?: string; code_preview?: string; expires_at?: any }>;
  } | null>(null);

  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  // Forms State
  // 0. Package Activation Codes Form
  const [pkgTargetId, setPkgTargetId] = useState<string>('');
  const [pkgCount, setPkgCount] = useState<number>(50);
  const [pkgMaxUses, setPkgMaxUses] = useState<number>(1);
  const [pkgExpiresAt, setPkgExpiresAt] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });
  const [pkgConfirmStep, setPkgConfirmStep] = useState<boolean>(false);
  const [isGeneratingPkg, setIsGeneratingPkg] = useState<boolean>(false);

  // 0.1 Course Activation Codes Form
  const [courseTargetId, setCourseTargetId] = useState<string>('');
  const [courseCount, setCourseCount] = useState<number>(50);
  const [courseMaxUses, setCourseMaxUses] = useState<number>(1);
  const [courseExpiresAt, setCourseExpiresAt] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });
  const [courseConfirmStep, setCourseConfirmStep] = useState<boolean>(false);
  const [isGeneratingCourse, setIsGeneratingCourse] = useState<boolean>(false);

  // Forms State
  // 1. Recharge Cards Form
  const [rechargeAmount, setRechargeAmount] = useState<number>(100);
  const [rechargeCount, setRechargeCount] = useState<number>(50);
  const [rechargeExpiresAt, setRechargeExpiresAt] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });
  const [rechargeConfirmStep, setRechargeConfirmStep] = useState<boolean>(false);
  const [isGeneratingRecharge, setIsGeneratingRecharge] = useState<boolean>(false);

  // 2. Single Discount Form
  const [singleDiscCode, setSingleDiscCode] = useState<string>('');
  const [singleDiscType, setSingleDiscType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [singleDiscValue, setSingleDiscValue] = useState<number>(10);
  const [singleDiscMinOrder, setSingleDiscMinOrder] = useState<number>(0);
  const [singleDiscMaxUses, setSingleDiscMaxUses] = useState<number>(100);
  const [singleDiscScope, setSingleDiscScope] = useState<'ALL' | 'COURSE' | 'PACKAGE'>('ALL');
  const [singleDiscTargetId, setSingleDiscTargetId] = useState<string>('');
  const [singleDiscAcademicYear, setSingleDiscAcademicYear] = useState<string>('');
  const [singleDiscStartsAt, setSingleDiscStartsAt] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [singleDiscExpiresAt, setSingleDiscExpiresAt] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  });
  const [isSavingSingleDisc, setIsSavingSingleDisc] = useState<boolean>(false);

  // 3. Bulk Discount Form
  const [bulkDiscCount, setBulkDiscCount] = useState<number>(20);
  const [bulkDiscType, setBulkDiscType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [bulkDiscValue, setBulkDiscValue] = useState<number>(15);
  const [bulkDiscMinOrder, setBulkDiscMinOrder] = useState<number>(0);
  const [bulkDiscMaxUses, setBulkDiscMaxUses] = useState<number>(1);
  const [bulkDiscScope, setBulkDiscScope] = useState<'ALL' | 'COURSE' | 'PACKAGE'>('ALL');
  const [bulkDiscTargetId, setBulkDiscTargetId] = useState<string>('');
  const [bulkDiscStartsAt, setBulkDiscStartsAt] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [bulkDiscExpiresAt, setBulkDiscExpiresAt] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  });
  const [bulkDiscConfirmStep, setBulkDiscConfirmStep] = useState<boolean>(false);
  const [isGeneratingBulkDisc, setIsGeneratingBulkDisc] = useState<boolean>(false);

  // Debounce Search Input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Load Lookups
  useEffect(() => {
    let isMounted = true;
    async function loadLookups() {
      setLoadingLookups(true);
      try {
        const [yearsRes, pkgsRes, coursesRes] = await Promise.all([
          apiClient.get('/auth/academic-years').catch(() => []),
          apiClient.get('/packages?limit=100').catch(() => ({ data: [] })),
          apiClient.get('/courses?limit=100').catch(() => ({ data: [] })),
        ]);

        if (isMounted) {
          setAcademicYears(Array.isArray(yearsRes) ? yearsRes : (yearsRes as any)?.data || []);
          setPackagesList(Array.isArray(pkgsRes) ? pkgsRes : (pkgsRes as any)?.data || []);
          setCoursesList(Array.isArray(coursesRes) ? coursesRes : (coursesRes as any)?.data || []);
        }
      } catch (e) {
        console.error('Failed to load lookups', e);
      } finally {
        if (isMounted) setLoadingLookups(false);
      }
    }
    loadLookups();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Table Data Based on Active Tab
  const loadData = useCallback(
    async (pageNumber = 1) => {
      setIsLoading(true);
      setError(null);
      try {
        let endpoint = '';
        const params: Record<string, any> = {
          page: pageNumber,
          limit: 100, // Load comprehensive batch pool
        };

        if (statusFilter !== 'ALL') {
          params.status = statusFilter;
        }
        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }

        if (activeTab === 'packages') {
          endpoint = '/admin/activation-codes';
          params.type = 'PACKAGE';
        } else if (activeTab === 'courses') {
          endpoint = '/admin/activation-codes';
          params.type = 'COURSE';
        } else if (activeTab === 'wallet') {
          endpoint = '/admin/recharge-codes';
        } else {
          endpoint = '/admin/discounts';
          if (discountTypeFilter !== 'ALL') {
            params.discount_type = discountTypeFilter;
          }
          if (discountTargetFilter !== 'ALL') {
            params.target_type = discountTargetFilter;
          }
        }

        const queryStr = new URLSearchParams(
          Object.entries(params).map(([k, v]) => [k, String(v)]),
        ).toString();

        const response: any = await apiClient.get(`${endpoint}?${queryStr}`);

        const resData = response?.data || (Array.isArray(response) ? response : []);
        const resTotal = response?.total ?? response?.meta?.total ?? resData.length;
        const resPage = response?.page ?? response?.meta?.page ?? pageNumber;
        const resTotalPages =
          response?.totalPages ??
          response?.meta?.totalPages ??
          response?.meta?.pages ??
          Math.max(1, Math.ceil(resTotal / 100));

        setItems(resData);
        setTotal(resTotal);
        setPage(resPage);
        setTotalPages(resTotalPages);
      } catch (err: any) {
        console.error('Error fetching codes data', err);
        setError(err?.message || (isAr ? 'تعذر تحميل البيانات' : 'Failed to load data'));
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab, statusFilter, debouncedSearch, discountTypeFilter, discountTargetFilter, isAr],
  );

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  // Compute Batches (Group items into sleek rectangular cards)
  const batches = useMemo<BatchGroup[]>(() => {
    const map = new Map<string, BatchGroup>();

    items.forEach((item) => {
      const bKey =
        item.batch_id ||
        `BATCH-${item.created_at ? new Date(item.created_at).toISOString().slice(0, 10) : 'GENERAL'}-${
          activeTab === 'packages'
            ? `PKG-${item.target_id || ''}`
            : activeTab === 'courses'
            ? `CRS-${item.target_id || ''}`
            : activeTab === 'wallet'
            ? item.amount
            : item.discount_value
        }`;

      if (!map.has(bKey)) {
        let title = '';
        let bType: 'PACKAGE' | 'COURSE' | 'WALLET' | 'DISCOUNT' = 'DISCOUNT';
        if (activeTab === 'packages') {
          bType = 'PACKAGE';
          title = `${isAr ? 'دفعة أكواد باقة' : 'Package Codes'} (${item.target_title || (isAr ? 'باقة تعليمية' : 'Package')})`;
        } else if (activeTab === 'courses') {
          bType = 'COURSE';
          title = `${isAr ? 'دفعة أكواد كورس' : 'Course Codes'} (${item.target_title || (isAr ? 'كورس تعليمي' : 'Course')})`;
        } else if (activeTab === 'wallet') {
          bType = 'WALLET';
          title = `${isAr ? 'دفعة كروت شحن' : 'Recharge Batch'} (${item.amount} ${isAr ? 'ج.م' : 'EGP'})`;
        } else {
          bType = 'DISCOUNT';
          title = `${isAr ? 'دفعة كوبونات' : 'Coupon Batch'} (${
            item.discount_type === 'PERCENTAGE' ? `${item.discount_value}%` : `${item.discount_value} ج.م`
          })`;
        }

        map.set(bKey, {
          batchId: item.batch_id || bKey,
          type: bType,
          title,
          amount: item.amount,
          targetName: item.target_title,
          discountType: item.discount_type,
          discountValue: item.discount_value,
          targetTitle: item.target_title,
          totalCodes: 0,
          activeCount: 0,
          usedCount: 0,
          disabledCount: 0,
          createdAt: item.created_at,
          expiresAt: item.expires_at,
          codes: [],
        });
      }

      const grp = map.get(bKey)!;
      grp.totalCodes += 1;
      if (item.status === 'ACTIVE') grp.activeCount += 1;
      else if (item.status === 'USED') grp.usedCount += 1;
      else if (item.status === 'DISABLED') grp.disabledCount += 1;

      // Check if we have cached raw plaintext codes for this batch
      const cachedList = rawBatchesMap[item.batch_id || ''] || rawBatchesMap[bKey];
      if (cachedList && cachedList[grp.codes.length]) {
        const cachedItem = cachedList[grp.codes.length];
        grp.codes.push({
          ...item,
          raw: cachedItem.raw || cachedItem.code,
        });
      } else {
        grp.codes.push(item);
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [items, activeTab, isAr, rawBatchesMap]);

  // Actions
  // 0.1 Generate Package Activation Codes
  const handleGeneratePackageCodes = async () => {
    if (!pkgTargetId || pkgCount <= 0) return;
    const pkgObj = packagesList.find((p) => p.id === pkgTargetId) || packagesList[0];
    if (!pkgObj) return;

    setIsGeneratingPkg(true);
    setFeedback(null);
    try {
      const generatedBatchId = `PKG-${pkgObj.id.slice(0, 4)}-${Date.now().toString().slice(-5)}`;
      const payload: any = {
        type: 'PACKAGE',
        target_id: pkgTargetId,
        count: Number(pkgCount),
        max_uses: Number(pkgMaxUses || 1),
        expires_at: new Date(pkgExpiresAt).toISOString(),
        batch_id: generatedBatchId,
      };
      if (pkgObj.academic_year_id && pkgObj.academic_year_id.length === 36) {
        payload.academic_year_id = pkgObj.academic_year_id;
      }

      const res: any = await apiClient.post('/admin/activation-codes/generate', payload);
      const generatedList = res?.codes || [];

      setRawBatchesMap((prev) => ({
        ...prev,
        [generatedBatchId]: generatedList,
      }));

      setBatchResult({
        title: isAr
          ? `تم توليد دفعة أكواد باقة (${pkgCount} كود - ${pkgObj.title_ar || pkgObj.title})`
          : `Generated ${pkgCount} Package Codes (${pkgObj.title_ar || pkgObj.title})`,
        type: 'PACKAGE',
        targetName: pkgObj.title_ar || pkgObj.title,
        codes: generatedList,
      });

      setIsPkgModalOpen(false);
      setPkgConfirmStep(false);
      setFeedback({
        type: 'success',
        message: isAr
          ? `تم توليد دفعة الأكواد للباقة بنجاح (${generatedList.length} كود)`
          : `Successfully generated ${generatedList.length} package activation codes`,
      });
      loadData(1);
    } catch (err: any) {
      console.error('Package generation error', err);
      setFeedback({
        type: 'error',
        message: err?.message || (isAr ? 'فشل توليد أكواد الباقة' : 'Failed to generate package codes'),
      });
    } finally {
      setIsGeneratingPkg(false);
    }
  };

  // 0.2 Generate Course Activation Codes
  const handleGenerateCourseCodes = async () => {
    if (!courseTargetId || courseCount <= 0) return;
    const crsObj = coursesList.find((c) => c.id === courseTargetId) || coursesList[0];
    if (!crsObj) return;

    setIsGeneratingCourse(true);
    setFeedback(null);
    try {
      const generatedBatchId = `CRS-${crsObj.id.slice(0, 4)}-${Date.now().toString().slice(-5)}`;
      const payload: any = {
        type: 'COURSE',
        target_id: courseTargetId,
        count: Number(courseCount),
        max_uses: Number(courseMaxUses || 1),
        expires_at: new Date(courseExpiresAt).toISOString(),
        batch_id: generatedBatchId,
      };
      if (crsObj.academic_year_id && crsObj.academic_year_id.length === 36) {
        payload.academic_year_id = crsObj.academic_year_id;
      }

      const res: any = await apiClient.post('/admin/activation-codes/generate', payload);
      const generatedList = res?.codes || [];

      setRawBatchesMap((prev) => ({
        ...prev,
        [generatedBatchId]: generatedList,
      }));

      setBatchResult({
        title: isAr
          ? `تم توليد دفعة أكواد كورس (${courseCount} كود - ${crsObj.title_ar || crsObj.title})`
          : `Generated ${courseCount} Course Codes (${crsObj.title_ar || crsObj.title})`,
        type: 'COURSE',
        targetName: crsObj.title_ar || crsObj.title,
        codes: generatedList,
      });

      setIsCourseModalOpen(false);
      setCourseConfirmStep(false);
      setFeedback({
        type: 'success',
        message: isAr
          ? `تم توليد دفعة الأكواد للكورس بنجاح (${generatedList.length} كود)`
          : `Successfully generated ${generatedList.length} course activation codes`,
      });
      loadData(1);
    } catch (err: any) {
      console.error('Course generation error', err);
      setFeedback({
        type: 'error',
        message: err?.message || (isAr ? 'فشل توليد أكواد الكورس' : 'Failed to generate course codes'),
      });
    } finally {
      setIsGeneratingCourse(false);
    }
  };

  // 1. Generate Recharge Codes
  const handleGenerateRechargeCodes = async () => {
    if (rechargeAmount <= 0 || rechargeCount <= 0) return;
    setIsGeneratingRecharge(true);
    setFeedback(null);
    try {
      const generatedBatchId = `RCH-${rechargeAmount}EGP-${Date.now().toString().slice(-5)}`;
      const payload = {
        amount: Number(rechargeAmount),
        count: Number(rechargeCount),
        expires_at: new Date(rechargeExpiresAt).toISOString(),
        batch_id: generatedBatchId,
      };

      const res: any = await apiClient.post('/admin/recharge-codes/generate', payload);
      const generatedList = res?.codes || [];

      setRawBatchesMap((prev) => ({
        ...prev,
        [generatedBatchId]: generatedList,
      }));

      setBatchResult({
        title: isAr
          ? `تم توليد دفعة كروت شحن (${rechargeCount} كارت بقيمة ${rechargeAmount} ج.م)`
          : `Generated ${rechargeCount} Recharge Cards (${rechargeAmount} EGP)`,
        type: 'WALLET',
        amount: rechargeAmount,
        codes: generatedList,
      });

      setIsRechargeModalOpen(false);
      setRechargeConfirmStep(false);
      setFeedback({
        type: 'success',
        message: isAr
          ? `تم توليد مستطيل الدفعة بنجاح (${generatedList.length} كارت شحن)`
          : `Successfully generated ${generatedList.length} recharge cards batch`,
      });
      loadData(1);
    } catch (err: any) {
      console.error('Recharge generation error', err);
      setFeedback({
        type: 'error',
        message: err?.message || (isAr ? 'فشل توليد كروت الشحن' : 'Failed to generate recharge cards'),
      });
    } finally {
      setIsGeneratingRecharge(false);
    }
  };

  // 2. Create Single Discount Coupon
  // 2. Create Single Discount Coupon
  const handleCreateSingleDiscount = async () => {
    if (!singleDiscCode.trim() || singleDiscValue <= 0) return;
    setIsSavingSingleDisc(true);
    setFeedback(null);
    try {
      const cleanCode = singleDiscCode.trim().toUpperCase();
      const payload: any = {
        code: cleanCode,
        discount_type: singleDiscType,
        discount_value: Number(singleDiscValue),
        min_order_amount: Number(singleDiscMinOrder),
        max_uses: Number(singleDiscMaxUses),
        starts_at: new Date(singleDiscStartsAt).toISOString(),
        expires_at: new Date(singleDiscExpiresAt).toISOString(),
        target_type: singleDiscScope,
        target_id: singleDiscScope !== 'ALL' ? singleDiscTargetId : undefined,
        academic_year_id: singleDiscAcademicYear || undefined,
      };

      const res: any = await apiClient.post('/admin/discounts', payload);
      const actualCode = res?.code || res?.raw || res?.discount?.code || cleanCode;

      setRawBatchesMap((prev) => ({
        ...prev,
        [cleanCode]: [{ code: actualCode, raw: actualCode, expires_at: singleDiscExpiresAt }],
      }));

      setBatchResult({
        title: isAr
          ? `تم إنشاء كوبون الخصم (${actualCode}) بنجاح`
          : `Generated Discount Coupon (${actualCode})`,
        type: 'DISCOUNT',
        discountType: singleDiscType,
        discountValue: singleDiscValue,
        codes: [{ code: actualCode, raw: actualCode, expires_at: singleDiscExpiresAt }],
      });

      setIsSingleDiscModalOpen(false);
      setSingleDiscCode('');
      setFeedback({
        type: 'success',
        message: isAr
          ? `تم إنشاء كوبون الخصم (${actualCode}) بنجاح`
          : `Discount coupon (${actualCode}) created successfully`,
      });
      loadData(1);
    } catch (err: any) {
      console.error('Single discount error', err);
      setFeedback({
        type: 'error',
        message: err?.message || (isAr ? 'فشل إنشاء كوبون الخصم' : 'Failed to create discount coupon'),
      });
    } finally {
      setIsSavingSingleDisc(false);
    }
  };

  // 3. Generate Bulk Discount Coupons
  const handleGenerateBulkDiscount = async () => {
    if (bulkDiscCount <= 0 || bulkDiscValue <= 0) return;
    setIsGeneratingBulkDisc(true);
    setFeedback(null);
    try {
      const generatedBatchId = `DISC-${bulkDiscValue}${bulkDiscType === 'PERCENTAGE' ? 'PCT' : 'EGP'}-${Date.now().toString().slice(-5)}`;
      const payload: any = {
        count: Number(bulkDiscCount),
        discount_type: bulkDiscType,
        discount_value: Number(bulkDiscValue),
        min_order_amount: Number(bulkDiscMinOrder),
        max_uses: Number(bulkDiscMaxUses),
        starts_at: new Date(bulkDiscStartsAt).toISOString(),
        expires_at: new Date(bulkDiscExpiresAt).toISOString(),
        target_type: bulkDiscScope,
        target_id: bulkDiscScope !== 'ALL' ? bulkDiscTargetId : undefined,
        batch_id: generatedBatchId,
      };

      const res: any = await apiClient.post('/admin/discounts/generate', payload);
      const generatedList = res?.codes || [];

      setRawBatchesMap((prev) => ({
        ...prev,
        [generatedBatchId]: generatedList,
      }));

      setBatchResult({
        title: isAr
          ? `تم إنشاء (${generatedList.length}) كوبونات بنجاح`
          : `Successfully generated (${generatedList.length}) discount coupons`,
        type: 'DISCOUNT',
        discountType: bulkDiscType,
        discountValue: bulkDiscValue,
        codes: generatedList,
      });

      setIsBulkDiscModalOpen(false);
      setBulkDiscConfirmStep(false);
      setFeedback({
        type: 'success',
        message: isAr
          ? `تم توليد مستطيل الدفعة بنجاح (${generatedList.length} كوبون)`
          : `Successfully generated ${generatedList.length} discount coupons batch`,
      });
      loadData(1);
    } catch (err: any) {
      console.error('Bulk discount error', err);
      setFeedback({
        type: 'error',
        message: err?.message || (isAr ? 'فشل توليد كوبونات الخصم' : 'Failed to generate discount coupons'),
      });
    } finally {
      setIsGeneratingBulkDisc(false);
    }
  };

  // Disable Code Actions with Confirmation
  const confirmDisableItem = (id: string, codePreview: string, type: 'PACKAGE' | 'COURSE' | 'RECHARGE' | 'DISCOUNT') => {
    let title = isAr ? 'تعطيل الكود' : 'Disable Code';
    let message = isAr
      ? `هل أنت متأكد من تعطيل الكود (${codePreview})؟ لن يتمكن أي طالب من استخدامه بعد الآن.`
      : `Are you sure you want to disable code (${codePreview})? Students will not be able to redeem it.`;

    const action = async () => {
      try {
        if (type === 'RECHARGE') {
          await apiClient.patch(`/admin/recharge-codes/${id}/disable`, {});
        } else if (type === 'DISCOUNT') {
          await apiClient.patch(`/admin/discounts/${id}/disable`, {});
        } else {
          await apiClient.patch(`/admin/activation-codes/${id}/disable`, {});
        }

        setFeedback({
          type: 'success',
          message: isAr ? 'تم تعطيل الكود بنجاح' : 'Code disabled successfully',
        });
        loadData(page);
      } catch (err: any) {
        setFeedback({
          type: 'error',
          message: err?.message || (isAr ? 'فشل تعطيل الكود' : 'Failed to disable code'),
        });
      }
    };

    setConfirmModal({
      isOpen: true,
      title,
      message,
      action,
    });
  };

  // Delete Batch Action with Confirmation
  const confirmDeleteBatch = (batch: BatchGroup) => {
    let title = isAr ? 'حذف دفعة الكوبونات' : 'Delete Coupon Batch';
    if (batch.type === 'PACKAGE') {
      title = isAr ? 'حذف دفعة أكواد الباقة' : 'Delete Package Batch';
    } else if (batch.type === 'COURSE') {
      title = isAr ? 'حذف دفعة أكواد الكورس' : 'Delete Course Batch';
    } else if (batch.type === 'WALLET') {
      title = isAr ? 'حذف دفعة كروت الشحن' : 'Delete Recharge Batch';
    }

    const message = isAr
      ? `هل أنت متأكد من حذف (${batch.title}) بالكامل؟ سيتم إزالة جميع الأكواد المرتبطة بهذه الدفعة نهائياً.`
      : `Are you sure you want to delete (${batch.title})? All associated codes will be permanently removed.`;

    const action = async () => {
      try {
        const codeIds = batch.codes.map((c) => c.id).filter(Boolean);
        if (batch.type === 'DISCOUNT') {
          if (batch.batchId && !batch.batchId.startsWith('BATCH-')) {
            await apiClient.delete(`/admin/discounts/batch/${encodeURIComponent(batch.batchId)}`);
          } else {
            await apiClient.delete('/admin/discounts/batch', { ids: codeIds, batch_id: batch.batchId });
          }
        } else if (batch.type === 'WALLET') {
          if (batch.batchId && !batch.batchId.startsWith('BATCH-')) {
            await apiClient.delete(`/admin/recharge-codes/batch/${encodeURIComponent(batch.batchId)}`);
          } else {
            await apiClient.delete('/admin/recharge-codes/batch', { ids: codeIds, batch_id: batch.batchId });
          }
        } else {
          // PACKAGE or COURSE
          if (batch.batchId && !batch.batchId.startsWith('BATCH-')) {
            await apiClient.delete(`/admin/activation-codes/batch/${encodeURIComponent(batch.batchId)}`);
          } else {
            await apiClient.post('/admin/activation-codes/batch/delete', { code_ids: codeIds, batch_id: batch.batchId });
          }
        }

        // Remove from local memory cache
        setRawBatchesMap((prev) => {
          const next = { ...prev };
          delete next[batch.batchId];
          return next;
        });

        if (selectedBatch?.batchId === batch.batchId) {
          setSelectedBatch(null);
        }

        setFeedback({
          type: 'success',
          message: isAr ? 'تم حذف الدفعة بنجاح' : 'Batch deleted successfully',
        });
        loadData(1);
      } catch (err: any) {
        console.error('Delete batch error', err);
        setFeedback({
          type: 'error',
          message: err?.message || (isAr ? 'فشل حذف الدفعة' : 'Failed to delete batch'),
        });
      }
    };

    setConfirmModal({
      isOpen: true,
      title,
      message,
      action,
    });
  };

  // Delete Single Code Action with Confirmation
  const confirmDeleteItem = (id: string, codePreview: string, type: 'PACKAGE' | 'COURSE' | 'RECHARGE' | 'DISCOUNT') => {
    let title = isAr ? 'حذف الكود' : 'Delete Code';
    let message = isAr
      ? `هل أنت متأكد من حذف الكود (${codePreview}) نهائياً؟`
      : `Are you sure you want to permanently delete code (${codePreview})?`;

    const action = async () => {
      try {
        if (type === 'RECHARGE') {
          await apiClient.delete(`/admin/recharge-codes/${id}`);
        } else if (type === 'DISCOUNT') {
          await apiClient.delete(`/admin/discounts/${id}`);
        } else {
          await apiClient.delete(`/admin/activation-codes/${id}`);
        }

        setFeedback({
          type: 'success',
          message: isAr ? 'تم حذف الكود بنجاح' : 'Code deleted successfully',
        });
        loadData(page);
      } catch (err: any) {
        console.error('Delete code error', err);
        setFeedback({
          type: 'error',
          message: err?.message || (isAr ? 'فشل حذف الكود' : 'Failed to delete code'),
        });
      }
    };

    setConfirmModal({
      isOpen: true,
      title,
      message,
      action,
    });
  };

  // Copy Code
  const handleCopyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  // Export Batch or Results to CSV
  const exportCodesCSV = (
    codes: Array<any>,
    type: 'WALLET' | 'DISCOUNT' | 'PACKAGE' | 'COURSE',
    amount?: number | string,
    discVal?: number | string,
    discType?: string,
  ) => {
    if (!codes.length) return;
    const headers = ['Index', 'Type', 'Code', 'Value', 'Status', 'Created At', 'Expires At'];
    const rows = codes.map((c, i) => [
      i + 1,
      type,
      c.code || c.raw || c.code_preview || c.preview || '',
      amount ? `${amount} EGP` : discVal ? `${discVal} (${discType})` : '',
      c.status || 'ACTIVE',
      c.created_at || new Date().toISOString(),
      c.expires_at ? new Date(c.expires_at).toISOString() : '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `batch-${type.toLowerCase()}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Launch Print View for Batch
  const openBatchPrint = (batch: BatchGroup) => {
    setPrintTargetBatch({
      title: batch.title,
      type: batch.type,
      amount: batch.amount,
      discountType: batch.discountType,
      discountValue: batch.discountValue,
      codes: batch.codes.map((c) => ({
        code: c.code || c.raw || c.code_preview || 'CODE',
        raw: c.code || c.raw || c.code_preview || 'CODE',
        expires_at: c.expires_at,
      })),
    });
    setIsPrintModeOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 font-cairo">
      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-semibold transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isAr ? 'كروت الشحن وكوبونات الخصم' : 'Recharge Cards & Discount Coupons'}
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? 'توليد وإدارة دُفعات كروت شحن المحفظة وكوبونات الخصم في مستطيلات منظمة مع إمكانية التحميل والطباعة PDF'
              : 'Manage and generate wallet top-up cards & coupons in structured batches with instant PDF cards export'}
          </p>
        </div>

        {/* Primary Action Buttons */}
        {canManage && (
          <div className="flex flex-wrap items-center gap-2.5">
            {activeTab === 'packages' && (
              <button
                onClick={() => {
                  setPkgConfirmStep(false);
                  setIsPkgModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'توليد أكواد باقة' : 'Generate Package Codes'}</span>
              </button>
            )}

            {activeTab === 'courses' && (
              <button
                onClick={() => {
                  setCourseConfirmStep(false);
                  setIsCourseModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'توليد أكواد كورس' : 'Generate Course Codes'}</span>
              </button>
            )}

            {activeTab === 'wallet' && (
              <button
                onClick={() => {
                  setRechargeConfirmStep(false);
                  setIsRechargeModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'توليد دفعة كروت شحن' : 'Generate Top-Up Batch'}</span>
              </button>
            )}

            {activeTab === 'discounts' && (
              <>
                <button
                  onClick={() => setIsSingleDiscModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? 'إنشاء كوبون مخصص' : 'Create Single Coupon'}</span>
                </button>
                <button
                  onClick={() => {
                    setBulkDiscConfirmStep(false);
                    setIsBulkDiscModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? 'توليد دفعة كوبونات مجمعة' : 'Generate Bulk Coupons'}</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Tabs & View Mode Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('packages')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'packages'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{isAr ? 'أكواد الباقات' : 'Package Codes'}</span>
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'courses'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{isAr ? 'أكواد الكورسات' : 'Course Codes'}</span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'wallet'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>{isAr ? 'كروت شحن المحفظة' : 'Wallet Top-Up Cards'}</span>
          </button>

          <button
            onClick={() => setActiveTab('discounts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'discounts'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>{isAr ? 'كوبونات الخصم' : 'Discount Coupons'}</span>
          </button>
        </div>

        {/* View Mode Switcher (Batches vs Detailed Table) */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
          <button
            onClick={() => setViewMode('batches')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'batches'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
            <span>{isAr ? 'دُفعات التوليد (مستطيلات)' : 'Batches (Cards)'}</span>
          </button>

          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'table'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5 text-slate-500" />
            <span>{isAr ? 'جدول الأكواد التفصيلي' : 'All Codes Table'}</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={isAr ? 'بحث في الأكواد أو الدُفعات...' : 'Search codes or batches...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full ps-9 pe-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="ALL">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="ACTIVE">{isAr ? 'نشط (متاح للاستخدام)' : 'Active'}</option>
            <option value="USED">{isAr ? 'مستخدم بالكامل' : 'Used / Exhausted'}</option>
            <option value="DISABLED">{isAr ? 'معطل' : 'Disabled'}</option>
          </select>
        </div>

        {/* Discount Specific Filters */}
        {activeTab === 'discounts' && (
          <>
            <div>
              <select
                value={discountTypeFilter}
                onChange={(e) => setDiscountTypeFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="ALL">{isAr ? 'جميع أنواع الخصم' : 'All Discount Types'}</option>
                <option value="PERCENTAGE">{isAr ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
                <option value="FIXED_AMOUNT">{isAr ? 'مبلغ ثابت (ج.م)' : 'Fixed Amount (EGP)'}</option>
              </select>
            </div>

            <div>
              <select
                value={discountTargetFilter}
                onChange={(e) => setDiscountTargetFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="ALL">{isAr ? 'جميع النطاقات' : 'All Scopes'}</option>
                <option value="COURSE">{isAr ? 'كورس محدد' : 'Specific Course'}</option>
                <option value="PACKAGE">{isAr ? 'باقة محددة' : 'Specific Package'}</option>
              </select>
            </div>
          </>
        )}

        {/* Reset / Refresh */}
        <div className="flex items-center justify-end">
          <button
            onClick={() => loadData(page)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isAr ? 'تحديث' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. BATCHES VIEW (RECTANGULAR CARDS / مستطيلات أنيقة لكل دفعة)             */}
      {/* ========================================================================= */}
      {viewMode === 'batches' && (
        <>
          {isLoading ? (
            <div className="p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <LoadingState message={isAr ? 'جاري تحميل دُفعات الأكواد...' : 'Loading batches...'} />
            </div>
          ) : error ? (
            <div className="p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <ErrorState message={error} onRetry={() => loadData(1)} />
            </div>
          ) : batches.length === 0 ? (
            <div className="p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <EmptyState
                title={isAr ? 'لا توجد دُفعات مسجلة حالياً' : 'No batches found'}
                description={
                  isAr
                    ? 'قم بتوليد دفعة جديدة لتظهر هنا كمستطيل منظم يمكنك الدخول إليه وتحميله PDF.'
                    : 'Generate a new batch to see it formatted as a rectangular card with PDF export.'
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {batches.map((batch, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedBatch(batch)}
                  className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:shadow-xl hover:border-primary-500/50 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4"
                >
                  {/* Card Top / Header */}
                  <div>
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div
                          className={`p-2 rounded-xl ${
                            batch.type === 'WALLET'
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                              : 'bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400'
                          }`}
                        >
                          {batch.type === 'WALLET' ? <Wallet className="w-5 h-5" /> : <Tag className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                            {batch.title}
                          </h3>
                          <span className="text-[11px] font-mono text-slate-400">
                            ID: {batch.batchId.slice(0, 20)}
                          </span>
                        </div>
                      </div>

                      {/* Value Badge */}
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          batch.type === 'WALLET'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-primary-100 text-primary-800 dark:bg-primary-950 dark:text-primary-300'
                        }`}
                      >
                        {batch.type === 'WALLET'
                          ? `${batch.amount} ج.م`
                          : batch.discountType === 'PERCENTAGE'
                          ? `${batch.discountValue}%`
                          : `${batch.discountValue} ج.م`}
                      </span>
                    </div>

                    {/* Target Scope if Discount */}
                    {batch.targetTitle && (
                      <p className="text-xs text-slate-500 mt-2 font-medium">
                        {isAr ? 'النطاق:' : 'Scope:'} {batch.targetTitle}
                      </p>
                    )}

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] text-slate-400 block">{isAr ? 'إجمالي الأكواد' : 'Total'}</span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{batch.totalCodes}</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30">
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block">
                          {isAr ? 'المتاح' : 'Active'}
                        </span>
                        <span className="font-bold text-sm text-emerald-700 dark:text-emerald-300">
                          {batch.activeCount}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] text-slate-400 block">{isAr ? 'المستخدم' : 'Used'}</span>
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{batch.usedCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom / Footer Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{batch.createdAt ? new Date(batch.createdAt).toLocaleDateString('en-GB') : '—'}</span>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() =>
                          generateBatchPDF({
                            title: batch.title,
                            type: batch.type,
                            amount: batch.amount,
                            discountType: batch.discountType,
                            discountValue: batch.discountValue,
                            codes: batch.codes,
                          })
                        }
                        title={isAr ? 'تحميل مباشر كملف PDF' : 'Download PDF File'}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-semibold text-xs transition-colors border border-emerald-200 dark:border-emerald-800"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تحميل PDF' : 'PDF'}</span>
                      </button>
                      <button
                        onClick={() => openBatchPrint(batch)}
                        title={isAr ? 'معاينة وطباعة A4' : 'Print A4 Sheet'}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/60 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedBatch(batch)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs transition-colors shadow-xs"
                      >
                        <Eye className="w-3 h-3" />
                        <span>{isAr ? 'فتح الدفعة' : 'Open'}</span>
                      </button>
                      {canManage && (
                        <button
                          onClick={() => confirmDeleteBatch(batch)}
                          title={isAr ? 'حذف الدفعة بالكامل' : 'Delete Batch'}
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition-colors border border-rose-200/60 dark:border-rose-800/60"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. DETAILED TABLE VIEW (جدول الأكواد التفصيلي)                             */}
      {/* ========================================================================= */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-12">
              <LoadingState message={isAr ? 'جاري تحميل الأكواد...' : 'Loading codes...'} />
            </div>
          ) : error ? (
            <div className="p-12">
              <ErrorState message={error} onRetry={() => loadData(1)} />
            </div>
          ) : items.length === 0 ? (
            <div className="p-12">
              <EmptyState
                title={isAr ? 'لا توجد أكواد حالياً' : 'No codes found'}
                description={
                  isAr
                    ? 'لم يتم العثور على أي أكواد تطابق معايير البحث الحالية.'
                    : 'No codes found matching your current filter criteria.'
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    <th className="py-3.5 px-4 text-start">{isAr ? 'الكود (المعاينة)' : 'Code Preview'}</th>

                    {activeTab === 'packages' && (
                      <>
                        <th className="py-3.5 px-4 text-start">{isAr ? 'الباقة المستهدفة' : 'Target Package'}</th>
                        <th className="py-3.5 px-4 text-start">{isAr ? 'المرحلة الدراسية' : 'Academic Year'}</th>
                        <th className="py-3.5 px-4 text-start">{isAr ? 'مرات الاستخدام' : 'Usage'}</th>
                      </>
                    )}

                    {activeTab === 'courses' && (
                      <>
                        <th className="py-3.5 px-4 text-start">{isAr ? 'الكورس المستهدف' : 'Target Course'}</th>
                        <th className="py-3.5 px-4 text-start">{isAr ? 'المرحلة الدراسية' : 'Academic Year'}</th>
                        <th className="py-3.5 px-4 text-start">{isAr ? 'مرات الاستخدام' : 'Usage'}</th>
                      </>
                    )}

                    {activeTab === 'wallet' && (
                      <th className="py-3.5 px-4 text-start">{isAr ? 'القيمة' : 'Value'}</th>
                    )}

                    {activeTab === 'discounts' && (
                      <>
                        <th className="py-3.5 px-4 text-start">{isAr ? 'نوع الخصم' : 'Type'}</th>
                        <th className="py-3.5 px-4 text-start">{isAr ? 'قيمة الخصم' : 'Discount'}</th>
                        <th className="py-3.5 px-4 text-start">{isAr ? 'النطاق / العنصر' : 'Scope'}</th>
                        <th className="py-3.5 px-4 text-start">{isAr ? 'مرات الاستخدام' : 'Usage'}</th>
                      </>
                    )}

                    {/* Wallet Used Info */}
                    {activeTab === 'wallet' && (
                      <>
                        <th className="py-3.5 px-4 text-start">{isAr ? 'المستخدم بواسطة' : 'Used By'}</th>
                        <th className="py-3.5 px-4 text-start">{isAr ? 'تاريخ الاستخدام' : 'Used At'}</th>
                      </>
                    )}

                    <th className="py-3.5 px-4 text-start">{isAr ? 'تاريخ الإنشاء' : 'Created At'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'تاريخ الانتهاء' : 'Expires At'}</th>
                    <th className="py-3.5 px-4 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                    {canManage && <th className="py-3.5 px-4 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-normal">
                  {items.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Code Preview */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-xs tracking-wider">
                          {row.code_preview || row.code || 'CODE'}
                        </span>
                      </td>

                      {activeTab === 'packages' && (
                        <>
                          <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                            {row.target_title || row.package_title || (isAr ? 'باقة تعليمية' : 'Package')}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
                            {row.academic_year_name_ar || row.academic_year_name || '—'}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                              <span className="text-slate-900 dark:text-white font-bold">{row.used_count ?? 0}</span>
                              <span>/</span>
                              <span>{row.max_uses ?? 1}</span>
                              <span>{isAr ? 'استخدام' : 'uses'}</span>
                            </div>
                          </td>
                        </>
                      )}

                      {activeTab === 'courses' && (
                        <>
                          <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                            {row.target_title || row.course_title || (isAr ? 'كورس تعليمي' : 'Course')}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
                            {row.academic_year_name_ar || row.academic_year_name || '—'}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                              <span className="text-slate-900 dark:text-white font-bold">{row.used_count ?? 0}</span>
                              <span>/</span>
                              <span>{row.max_uses ?? 1}</span>
                              <span>{isAr ? 'استخدام' : 'uses'}</span>
                            </div>
                          </td>
                        </>
                      )}

                      {activeTab === 'wallet' && (
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {row.amount} {isAr ? 'ج.م' : 'EGP'}
                          </span>
                        </td>
                      )}

                      {activeTab === 'discounts' && (
                        <>
                          <td className="py-3.5 px-4">
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                              {row.discount_type === 'PERCENTAGE'
                                ? isAr ? 'نسبة مئوية' : 'Percentage'
                                : isAr ? 'مبلغ ثابت' : 'Fixed'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-primary-600 dark:text-primary-400">
                            {row.discount_type === 'PERCENTAGE' ? `${row.discount_value}%` : `${row.discount_value} ${isAr ? 'ج.م' : 'EGP'}`}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            {row.target_title || (row.target_type === 'ALL' ? (isAr ? 'المنصة كاملة' : 'All') : row.target_type)}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                              <span className="text-slate-900 dark:text-white font-bold">{row.used_count ?? 0}</span>
                              <span>/</span>
                              <span>{row.max_uses ?? 1}</span>
                              <span>{isAr ? 'استخدام' : 'uses'}</span>
                            </div>
                          </td>
                        </>
                      )}

                      {/* Wallet Used By */}
                      {activeTab === 'wallet' && (
                        <>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            {row.used_by_name ? (
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">{row.used_by_name}</p>
                                {row.used_by_phone && <p className="text-xs text-slate-400">{row.used_by_phone}</p>}
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-500">
                            {row.used_at ? new Date(row.used_at).toLocaleDateString('en-GB') : '—'}
                          </td>
                        </>
                      )}

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {row.created_at ? new Date(row.created_at).toLocaleDateString('en-GB') : '—'}
                      </td>

                      {/* Expires Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {row.expires_at ? new Date(row.expires_at).toLocaleDateString('en-GB') : '—'}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={row.status} />
                      </td>

                      {/* Actions */}
                      {canManage && (
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {row.status === 'ACTIVE' && (
                              <button
                                onClick={() =>
                                  confirmDisableItem(
                                    row.id,
                                    row.code_preview || row.code || 'CODE',
                                    activeTab === 'wallet'
                                      ? 'RECHARGE'
                                      : activeTab === 'discounts'
                                      ? 'DISCOUNT'
                                      : activeTab === 'packages'
                                      ? 'PACKAGE'
                                      : 'COURSE',
                                  )
                                }
                                title={isAr ? 'تعطيل الكود' : 'Disable Code'}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
                              >
                                {isAr ? 'تعطيل' : 'Disable'}
                              </button>
                            )}

                            <button
                              onClick={() =>
                                confirmDeleteItem(
                                  row.id,
                                  row.code_preview || row.code || 'CODE',
                                  activeTab === 'wallet'
                                    ? 'RECHARGE'
                                    : activeTab === 'discounts'
                                    ? 'DISCOUNT'
                                    : activeTab === 'packages'
                                    ? 'PACKAGE'
                                    : 'COURSE',
                                )
                              }
                              title={isAr ? 'حذف الكود' : 'Delete Code'}
                              className="p-1.5 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Bar */}
          {!isLoading && total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-sm text-slate-600 dark:text-slate-400">
              <div>
                {isAr ? (
                  <span>
                    عرض <span className="font-bold text-slate-900 dark:text-white">{items.length}</span> من أصل{' '}
                    <span className="font-bold text-slate-900 dark:text-white">{total}</span> كود
                  </span>
                ) : (
                  <span>
                    Showing <span className="font-bold text-slate-900 dark:text-white">{items.length}</span> of{' '}
                    <span className="font-bold text-slate-900 dark:text-white">{total}</span> codes
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadData(page - 1)}
                  disabled={page <= 1}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <ChevronRight className={`w-4 h-4 ${isAr ? '' : 'rotate-180'}`} />
                </button>

                <span className="px-3 py-1 text-xs font-bold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {page} / {totalPages}
                </span>

                <button
                  onClick={() => loadData(page + 1)}
                  disabled={page >= totalPages}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <ChevronLeft className={`w-4 h-4 ${isAr ? '' : 'rotate-180'}`} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SELECTED BATCH MODAL (عرض تفاصيل مستطيل الدفعة)                         */}
      {/* ========================================================================= */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl ${
                    selectedBatch.type === 'WALLET'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-400'
                  }`}
                >
                  {selectedBatch.type === 'WALLET' ? <Wallet className="w-6 h-6" /> : <Tag className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedBatch.title}</h3>
                  <p className="text-xs text-slate-500">
                    {isAr
                      ? `إجمالي الدفعة: ${selectedBatch.totalCodes} كود • تاريخ التوليد: ${
                          selectedBatch.createdAt ? new Date(selectedBatch.createdAt).toLocaleDateString('en-GB') : '—'
                        }`
                      : `Batch size: ${selectedBatch.totalCodes} codes`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBatch(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Bar inside Batch Modal */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/30 dark:bg-slate-800/20">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={isAr ? 'بحث داخل هذه الدفعة...' : 'Search within this batch...'}
                  value={batchSearchQuery}
                  onChange={(e) => setBatchSearchQuery(e.target.value)}
                  className="w-full ps-9 pe-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    generateBatchPDF({
                      title: selectedBatch.title,
                      type: selectedBatch.type,
                      amount: selectedBatch.amount,
                      discountType: selectedBatch.discountType,
                      discountValue: selectedBatch.discountValue,
                      codes: selectedBatch.codes,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تحميل ملف PDF' : 'Download PDF'}</span>
                </button>

                <button
                  onClick={() =>
                    exportCodesCSV(
                      selectedBatch.codes,
                      selectedBatch.type,
                      selectedBatch.amount,
                      selectedBatch.discountValue,
                      selectedBatch.discountType,
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تصدير CSV' : 'CSV'}</span>
                </button>

                <button
                  onClick={() => openBatchPrint(selectedBatch)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isAr ? 'معاينة الطباعة' : 'Print'}</span>
                </button>

                {canManage && (
                  <button
                    onClick={() => confirmDeleteBatch(selectedBatch)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-semibold text-xs transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'حذف الدفعة' : 'Delete Batch'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Batch Codes Table */}
            <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800">
              {selectedBatch.codes
                .filter((c) =>
                  batchSearchQuery.trim()
                    ? (c.code || c.raw || c.code_preview || '').toLowerCase().includes(batchSearchQuery.toLowerCase()) ||
                      (c.used_by_name || '').toLowerCase().includes(batchSearchQuery.toLowerCase())
                    : true,
                )
                .map((codeItem, cIdx) => {
                  const codeStr = codeItem.code || codeItem.raw || codeItem.code_preview || 'CODE';
                  return (
                    <div
                      key={cIdx}
                      className="py-3 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/40 px-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-mono w-7">#{cIdx + 1}</span>
                        <div>
                          <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                            {codeStr}
                          </span>
                          {codeItem.used_by_name && (
                            <p className="text-[11px] text-slate-400">
                              {isAr ? 'مستخدم بواسطة:' : 'Used by:'} {codeItem.used_by_name} ({codeItem.used_by_phone})
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusBadge status={codeItem.status} />

                        <button
                          onClick={() => handleCopyCode(codeStr, cIdx)}
                          className="p-1.5 text-xs rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          {copiedCodeIndex === cIdx ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {canManage && codeItem.status === 'ACTIVE' && (
                          <button
                            onClick={() =>
                              confirmDisableItem(
                                codeItem.id,
                                codeStr,
                                selectedBatch.type === 'WALLET' ? 'RECHARGE' : 'DISCOUNT',
                              )
                            }
                            className="px-2 py-0.5 text-xs font-semibold rounded bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100"
                          >
                            {isAr ? 'تعطيل' : 'Disable'}
                          </button>
                        )}

                        {canManage && (
                          <button
                            onClick={() =>
                              confirmDeleteItem(
                                codeItem.id,
                                codeStr,
                                selectedBatch.type === 'WALLET' ? 'RECHARGE' : 'DISCOUNT',
                              )
                            }
                            title={isAr ? 'حذف الكود' : 'Delete Code'}
                            className="p-1 text-xs rounded bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
              {canManage ? (
                <button
                  onClick={() => confirmDeleteBatch(selectedBatch)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isAr ? 'حذف هذه الدفعة بالكامل' : 'Delete Entire Batch'}</span>
                </button>
              ) : <div />}

              <button
                onClick={() => setSelectedBatch(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white text-sm font-semibold transition-colors"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PACKAGE ACTIVATION CODES GENERATION MODAL                              */}
      {/* ========================================================================= */}
      {isPkgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isAr ? 'توليد أكواد تفعيل باقة تعليمية' : 'Generate Package Activation Codes'}
                </h3>
              </div>
              <button
                onClick={() => setIsPkgModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {!pkgConfirmStep ? (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {isAr ? 'اختر الباقة التعليمية' : 'Select Package'} *
                    </label>
                    <select
                      value={pkgTargetId}
                      onChange={(e) => setPkgTargetId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="">{isAr ? '-- اضغط لاختيار الباقة --' : '-- Select Package --'}</option>
                      {packagesList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title_ar || p.title_en} {p.price ? `(${p.price} ج.م)` : ''} {p.academic_year_name_ar ? ` - [${p.academic_year_name_ar}]` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {isAr ? 'عدد الأكواد' : 'Codes Count'} *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={pkgCount}
                        onChange={(e) => setPkgCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {isAr ? 'أقصى عدد استخدام لكل كود' : 'Max Uses'} *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={pkgMaxUses}
                        onChange={(e) => setPkgMaxUses(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {isAr ? 'تاريخ انتهاء الصلاحية' : 'Expiration Date'} *
                    </label>
                    <input
                      type="date"
                      value={pkgExpiresAt}
                      onChange={(e) => setPkgExpiresAt(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  {pkgTargetId && (
                    <div className="p-4 rounded-xl bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/40 text-xs space-y-2 text-slate-700 dark:text-slate-300">
                      <p className="font-bold text-primary-900 dark:text-primary-300">{isAr ? 'بيانات الباقة المختارة:' : 'Selected Package:'}</p>
                      {(() => {
                        const sel = packagesList.find((p) => p.id === pkgTargetId);
                        return (
                          <>
                            <div className="flex justify-between">
                              <span>{isAr ? 'اسم الباقة:' : 'Package Title:'}</span>
                              <span className="font-bold text-slate-900 dark:text-white">{sel?.title_ar || sel?.title_en || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{isAr ? 'عدد الأكواد المطلوبة:' : 'Requested Codes:'}</span>
                              <span className="font-bold text-slate-900 dark:text-white">{pkgCount} كود</span>
                            </div>
                            <div className="flex justify-between border-t border-primary-200 dark:border-primary-800 pt-1.5 text-primary-700 dark:text-primary-400 font-bold text-sm">
                              <span>{isAr ? 'سعر الباقة الأصلي:' : 'Package Price:'}</span>
                              <span>{sel?.price ? `${sel.price} ج.م` : (isAr ? 'مجاني' : 'Free')}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 mx-auto flex items-center justify-center">
                    <Package className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {isAr ? 'تأكيد توليد أكواد تفعيل الباقة' : 'Confirm Package Activation Codes'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isAr
                        ? `سيتم توليد ${pkgCount} كود تفعيل للباقة المحددة بصلاحية حتى ${new Date(pkgExpiresAt).toLocaleDateString('en-GB')}.`
                        : `Generating ${pkgCount} activation codes for the package, valid until ${new Date(pkgExpiresAt).toLocaleDateString('en-GB')}.`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              {!pkgConfirmStep ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsPkgModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    disabled={!pkgTargetId || pkgCount <= 0}
                    onClick={() => setPkgConfirmStep(true)}
                    className="px-5 py-2 text-sm font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white shadow-sm"
                  >
                    {isAr ? 'متابعة وتأكيد' : 'Continue'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setPkgConfirmStep(false)}
                    disabled={isGeneratingPkg}
                    className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {isAr ? 'تعديل البيانات' : 'Back'}
                  </button>
                  <button
                    type="button"
                    onClick={handleGeneratePackageCodes}
                    disabled={isGeneratingPkg}
                    className="inline-flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
                  >
                    {isGeneratingPkg ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{isAr ? 'جاري التوليد...' : 'Generating...'}</span>
                      </>
                    ) : (
                      <span>{isAr ? 'تأكيد وتوليد الآن' : 'Confirm & Generate'}</span>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. COURSE ACTIVATION CODES GENERATION MODAL                               */}
      {/* ========================================================================= */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isAr ? 'توليد أكواد تفعيل لكورس تعليمي' : 'Generate Course Activation Codes'}
                </h3>
              </div>
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {!courseConfirmStep ? (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {isAr ? 'اختر الكورس التعليمي' : 'Select Course'} *
                    </label>
                    <select
                      value={courseTargetId}
                      onChange={(e) => setCourseTargetId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="">{isAr ? '-- اضغط لاختيار الكورس --' : '-- Select Course --'}</option>
                      {coursesList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title_ar || c.title_en || c.title} {c.price ? `(${c.price} ج.م)` : ''} {c.academic_year_name_ar ? ` - [${c.academic_year_name_ar}]` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {isAr ? 'عدد الأكواد' : 'Codes Count'} *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={courseCount}
                        onChange={(e) => setCourseCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {isAr ? 'أقصى عدد استخدام لكل كود' : 'Max Uses'} *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={courseMaxUses}
                        onChange={(e) => setCourseMaxUses(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {isAr ? 'تاريخ انتهاء الصلاحية' : 'Expiration Date'} *
                    </label>
                    <input
                      type="date"
                      value={courseExpiresAt}
                      onChange={(e) => setCourseExpiresAt(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  {courseTargetId && (
                    <div className="p-4 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/40 text-xs space-y-2 text-slate-700 dark:text-slate-300">
                      <p className="font-bold text-sky-900 dark:text-sky-300">{isAr ? 'بيانات الكورس المختار:' : 'Selected Course:'}</p>
                      {(() => {
                        const sel = coursesList.find((c) => c.id === courseTargetId);
                        return (
                          <>
                            <div className="flex justify-between">
                              <span>{isAr ? 'اسم الكورس:' : 'Course Title:'}</span>
                              <span className="font-bold text-slate-900 dark:text-white">{sel?.title_ar || sel?.title_en || sel?.title || '—'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{isAr ? 'عدد الأكواد المطلوبة:' : 'Requested Codes:'}</span>
                              <span className="font-bold text-slate-900 dark:text-white">{courseCount} كود</span>
                            </div>
                            <div className="flex justify-between border-t border-sky-200 dark:border-sky-800 pt-1.5 text-sky-700 dark:text-sky-400 font-bold text-sm">
                              <span>{isAr ? 'سعر الكورس الأصلي:' : 'Course Price:'}</span>
                              <span>{sel?.price ? `${sel.price} ج.م` : (isAr ? 'مجاني' : 'Free')}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 mx-auto flex items-center justify-center">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {isAr ? 'تأكيد توليد أكواد تفعيل الكورس' : 'Confirm Course Activation Codes'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isAr
                        ? `سيتم توليد ${courseCount} كود تفعيل للكورس المختار بصلاحية حتى ${new Date(courseExpiresAt).toLocaleDateString('en-GB')}.`
                        : `Generating ${courseCount} activation codes for the course, valid until ${new Date(courseExpiresAt).toLocaleDateString('en-GB')}.`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              {!courseConfirmStep ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsCourseModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    disabled={!courseTargetId || courseCount <= 0}
                    onClick={() => setCourseConfirmStep(true)}
                    className="px-5 py-2 text-sm font-semibold rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white shadow-sm"
                  >
                    {isAr ? 'متابعة وتأكيد' : 'Continue'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setCourseConfirmStep(false)}
                    disabled={isGeneratingCourse}
                    className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {isAr ? 'تعديل البيانات' : 'Back'}
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateCourseCodes}
                    disabled={isGeneratingCourse}
                    className="inline-flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
                  >
                    {isGeneratingCourse ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{isAr ? 'جاري التوليد...' : 'Generating...'}</span>
                      </>
                    ) : (
                      <span>{isAr ? 'تأكيد وتوليد الآن' : 'Confirm & Generate'}</span>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. RECHARGE CARDS GENERATION MODAL                                        */}
      {/* ========================================================================= */}
      {isRechargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isAr ? 'توليد كروت شحن رصيد للمحفظة' : 'Generate Wallet Top-Up Cards'}
                </h3>
              </div>
              <button
                onClick={() => setIsRechargeModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {!rechargeConfirmStep ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {isAr ? 'قيمة الكارت (ج.م)' : 'Card Value (EGP)'} *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={rechargeAmount}
                        onChange={(e) => setRechargeAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {isAr ? 'عدد الكروت' : 'Cards Count'} *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={rechargeCount}
                        onChange={(e) => setRechargeCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {isAr ? 'تاريخ انتهاء الصلاحية' : 'Expiration Date'} *
                    </label>
                    <input
                      type="date"
                      value={rechargeExpiresAt}
                      onChange={(e) => setRechargeExpiresAt(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs space-y-2 text-slate-700 dark:text-slate-300">
                    <p className="font-bold text-emerald-900 dark:text-emerald-300">{isAr ? 'المطابقة المالية للدفعة:' : 'Financial Summary:'}</p>
                    <div className="flex justify-between">
                      <span>{isAr ? 'قيمة كل كارت:' : 'Value Per Card:'}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{rechargeAmount} ج.م</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isAr ? 'عدد الكروت في المستطيل:' : 'Cards Count:'}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{rechargeCount} كارت</span>
                    </div>
                    <div className="flex justify-between border-t border-emerald-200 dark:border-emerald-800 pt-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                      <span>{isAr ? 'إجمالي القيمة الاسمية:' : 'Total Face Value:'}</span>
                      <span>{(rechargeAmount * rechargeCount).toLocaleString()} ج.م</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {isAr ? 'تأكيد توليد كروت الشحن' : 'Confirm Recharge Cards'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isAr
                        ? `سيتم توليد ${rechargeCount} كرت شحن بقيمة ${rechargeAmount} ج.م لكل كارت بإجمالي ${(rechargeAmount * rechargeCount).toLocaleString()} ج.م.`
                        : `Generating ${rechargeCount} cards with total value of ${(rechargeAmount * rechargeCount).toLocaleString()} EGP.`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              {!rechargeConfirmStep ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsRechargeModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRechargeConfirmStep(true)}
                    className="px-5 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  >
                    {isAr ? 'متابعة وتأكيد' : 'Continue'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setRechargeConfirmStep(false)}
                    disabled={isGeneratingRecharge}
                    className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {isAr ? 'تعديل البيانات' : 'Back'}
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateRechargeCodes}
                    disabled={isGeneratingRecharge}
                    className="inline-flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  >
                    {isGeneratingRecharge ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{isAr ? 'جاري التوليد...' : 'Generating...'}</span>
                      </>
                    ) : (
                      <span>{isAr ? 'تأكيد وتوليد الآن' : 'Confirm & Generate'}</span>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CREATE SINGLE DISCOUNT MODAL                                           */}
      {/* ========================================================================= */}
      {isSingleDiscModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
                  <Tag className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isAr ? 'إنشاء كوبون خصم مخصص' : 'Create Custom Discount Coupon'}
                </h3>
              </div>
              <button
                onClick={() => setIsSingleDiscModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateSingleDiscount();
              }}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {isAr ? 'كود الكوبون (نص الكود)' : 'Coupon Code'} *
                </label>
                <input
                  type="text"
                  placeholder="e.g. EXAM2026, VIP50"
                  value={singleDiscCode}
                  onChange={(e) => setSingleDiscCode(e.target.value.toUpperCase())}
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold tracking-wider focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {isAr ? 'نوع الخصم' : 'Discount Type'} *
                  </label>
                  <select
                    value={singleDiscType}
                    onChange={(e) => setSingleDiscType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="PERCENTAGE">{isAr ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
                    <option value="FIXED_AMOUNT">{isAr ? 'مبلغ ثابت (ج.م)' : 'Fixed Amount (EGP)'}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {singleDiscType === 'PERCENTAGE'
                      ? isAr ? 'النسبة المئوية (%)' : 'Percentage (%)'
                      : isAr ? 'المبلغ (ج.م)' : 'Amount (EGP)'}{' '}
                    *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={singleDiscType === 'PERCENTAGE' ? 100 : 10000}
                    value={singleDiscValue}
                    onChange={(e) => setSingleDiscValue(Math.max(1, parseFloat(e.target.value) || 0))}
                    required
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {isAr ? 'نطاق الخصم' : 'Discount Scope'} *
                </label>
                <select
                  value={singleDiscScope}
                  onChange={(e) => {
                    setSingleDiscScope(e.target.value as any);
                    setSingleDiscTargetId('');
                  }}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="ALL">{isAr ? 'المنصة كاملة (جميع الكورسات والباقات)' : 'Entire Platform'}</option>
                  <option value="COURSE">{isAr ? 'كورس محدد فقط' : 'Specific Course Only'}</option>
                  <option value="PACKAGE">{isAr ? 'باقة محددة فقط' : 'Specific Package Only'}</option>
                </select>
              </div>

              {singleDiscScope === 'COURSE' && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {isAr ? 'اختار الكورس' : 'Select Course'} *
                  </label>
                  <select
                    value={singleDiscTargetId}
                    onChange={(e) => setSingleDiscTargetId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="">{isAr ? '-- اختار الكورس --' : '-- Select Course --'}</option>
                    {coursesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title_ar || c.title_en} ({c.price} ج.م)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {singleDiscScope === 'PACKAGE' && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {isAr ? 'اختار الباقة' : 'Select Package'} *
                  </label>
                  <select
                    value={singleDiscTargetId}
                    onChange={(e) => setSingleDiscTargetId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="">{isAr ? '-- اختار الباقة --' : '-- Select Package --'}</option>
                    {packagesList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title_ar || p.title_en} ({p.price} ج.م)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {isAr ? 'أدنى قيمة للطلب (ج.م)' : 'Min Order (EGP)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={singleDiscMinOrder}
                    onChange={(e) => setSingleDiscMinOrder(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {isAr ? 'أقصى عدد استخدام' : 'Max Redemptions'} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={singleDiscMaxUses}
                    onChange={(e) => setSingleDiscMaxUses(Math.max(1, parseInt(e.target.value) || 1))}
                    required
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {isAr ? 'يبدأ في' : 'Starts At'} *
                  </label>
                  <input
                    type="date"
                    value={singleDiscStartsAt}
                    onChange={(e) => setSingleDiscStartsAt(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {isAr ? 'ينتهي في' : 'Expires At'} *
                  </label>
                  <input
                    type="date"
                    value={singleDiscExpiresAt}
                    onChange={(e) => setSingleDiscExpiresAt(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSingleDiscModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSavingSingleDisc}
                  className="inline-flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
                >
                  {isSavingSingleDisc ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{isAr ? 'جاري الحفظ...' : 'Saving...'}</span>
                    </>
                  ) : (
                    <span>{isAr ? 'حفظ الكوبون' : 'Save Coupon'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. BULK DISCOUNT COUPONS GENERATION MODAL                                 */}
      {/* ========================================================================= */}
      {isBulkDiscModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
                  <Tag className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isAr ? 'توليد كوبونات خصم مجمعة' : 'Generate Bulk Discount Coupons'}
                </h3>
              </div>
              <button
                onClick={() => setIsBulkDiscModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {!bulkDiscConfirmStep ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {isAr ? 'عدد الكوبونات' : 'Coupons Count'} *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={bulkDiscCount}
                        onChange={(e) => setBulkDiscCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {isAr ? 'نوع الخصم' : 'Discount Type'} *
                      </label>
                      <select
                        value={bulkDiscType}
                        onChange={(e) => setBulkDiscType(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="PERCENTAGE">{isAr ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
                        <option value="FIXED_AMOUNT">{isAr ? 'مبلغ ثابت (ج.م)' : 'Fixed Amount (EGP)'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {bulkDiscType === 'PERCENTAGE'
                        ? isAr ? 'النسبة المئوية (%)' : 'Percentage (%)'
                        : isAr ? 'المبلغ (ج.م)' : 'Amount (EGP)'}{' '}
                      *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={bulkDiscValue}
                      onChange={(e) => setBulkDiscValue(Math.max(1, parseFloat(e.target.value) || 0))}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {isAr ? 'نطاق الكوبونات' : 'Discount Scope'} *
                    </label>
                    <select
                      value={bulkDiscScope}
                      onChange={(e) => {
                        setBulkDiscScope(e.target.value as any);
                        setBulkDiscTargetId('');
                      }}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="ALL">{isAr ? 'المنصة كاملة (جميع الكورسات والباقات)' : 'Entire Platform'}</option>
                      <option value="COURSE">{isAr ? 'كورس محدد فقط' : 'Specific Course Only'}</option>
                      <option value="PACKAGE">{isAr ? 'باقة محددة فقط' : 'Specific Package Only'}</option>
                    </select>
                  </div>

                  {bulkDiscScope === 'COURSE' && (
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {isAr ? 'اختار الكورس' : 'Select Course'} *
                      </label>
                      <select
                        value={bulkDiscTargetId}
                        onChange={(e) => setBulkDiscTargetId(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="">{isAr ? '-- اختار الكورس --' : '-- Select Course --'}</option>
                        {coursesList.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title_ar || c.title_en}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {bulkDiscScope === 'PACKAGE' && (
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {isAr ? 'اختار الباقة' : 'Select Package'} *
                      </label>
                      <select
                        value={bulkDiscTargetId}
                        onChange={(e) => setBulkDiscTargetId(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="">{isAr ? '-- اختار الباقة --' : '-- Select Package --'}</option>
                        {packagesList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title_ar || p.title_en}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {isAr ? 'تاريخ الانتهاء' : 'Expires At'} *
                    </label>
                    <input
                      type="date"
                      value={bulkDiscExpiresAt}
                      onChange={(e) => setBulkDiscExpiresAt(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-4 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-600 mx-auto flex items-center justify-center">
                    <Tag className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {isAr ? 'تأكيد توليد كوبونات الخصم' : 'Confirm Bulk Coupons'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isAr
                        ? `سيتم توليد ${bulkDiscCount} كوبون خصم بقيمة ${bulkDiscValue}${bulkDiscType === 'PERCENTAGE' ? '%' : ' ج.م'}.`
                        : `Generating ${bulkDiscCount} coupons with value of ${bulkDiscValue}${bulkDiscType === 'PERCENTAGE' ? '%' : ' EGP'}.`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              {!bulkDiscConfirmStep ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsBulkDiscModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkDiscConfirmStep(true)}
                    className="px-5 py-2 text-sm font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
                  >
                    {isAr ? 'متابعة وتأكيد' : 'Continue'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setBulkDiscConfirmStep(false)}
                    disabled={isGeneratingBulkDisc}
                    className="px-4 py-2 text-sm font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {isAr ? 'تعديل البيانات' : 'Back'}
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateBulkDiscount}
                    disabled={isGeneratingBulkDisc}
                    className="inline-flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
                  >
                    {isGeneratingBulkDisc ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{isAr ? 'جاري التوليد...' : 'Generating...'}</span>
                      </>
                    ) : (
                      <span>{isAr ? 'تأكيد وتوليد الآن' : 'Confirm & Generate'}</span>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. POST-GENERATION RESULT SCREEN (SECURE IN-MEMORY DISPLAY)                */}
      {/* ========================================================================= */}
      {batchResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{batchResult.title}</h3>
                  <p className="text-xs text-slate-500">
                    {isAr
                      ? `تم إنشاء (${batchResult.codes.length}) كود بنجاح داخل هذا المستطيل`
                      : `Successfully generated ${batchResult.codes.length} codes`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setBatchResult(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span>
                    {isAr
                      ? 'ملاحظة: تظهر الأكواد الأصلية في هذه الشاشة فقط لمرة واحدة ولا تُخزن نصياً على السيرفر.'
                      : 'Security notice: Raw plaintext codes are shown once upon generation and never stored unhashed on the server.'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Copy All Button */}
                  <button
                    onClick={() => {
                      const all = batchResult.codes
                        .map((c) => c.code || c.raw || c.preview || c.code_preview || '')
                        .join('\n');
                      navigator.clipboard.writeText(all);
                      setIsAllCopied(true);
                      setTimeout(() => setIsAllCopied(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white font-semibold text-xs transition-colors shadow-xs"
                  >
                    {isAllCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{isAr ? 'تم نسخ الكل' : 'All Copied'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{isAr ? 'نسخ الكل' : 'Copy All'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() =>
                      generateBatchPDF({
                        title: batchResult.title,
                        type: batchResult.type,
                        amount: batchResult.amount,
                        discountType: batchResult.discountType,
                        discountValue: batchResult.discountValue,
                        codes: batchResult.codes,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تحميل ملف PDF' : 'Download PDF'}</span>
                  </button>

                  <button
                    onClick={() =>
                      exportCodesCSV(
                        batchResult.codes,
                        batchResult.type,
                        batchResult.amount,
                        batchResult.discountValue,
                        batchResult.discountType,
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-semibold hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تصدير CSV' : 'CSV'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setPrintTargetBatch({
                        title: batchResult.title,
                        type: batchResult.type,
                        amount: batchResult.amount,
                        discountType: batchResult.discountType,
                        discountValue: batchResult.discountValue,
                        codes: batchResult.codes,
                      });
                      setIsPrintModeOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold text-xs transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{isAr ? 'معاينة الطباعة' : 'Print'}</span>
                  </button>
                </div>
              </div>

              {/* Codes Grid */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {batchResult.codes.map((c, idx) => {
                  const codeStr = c.code || c.raw || c.preview || c.code_preview || '';
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400 font-mono w-6">#{idx + 1}</span>
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-white tracking-wide">
                          {codeStr}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(codeStr, idx)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        {copiedCodeIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600 font-bold">{isAr ? 'تم النسخ' : 'Copied'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{isAr ? 'نسخ الكود' : 'Copy'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
              <button
                onClick={() => setBatchResult(null)}
                className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white text-sm font-semibold transition-colors"
              >
                {isAr ? 'تم وإغلاق' : 'Done & Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. PRINT VIEW MODAL (A4 READY VOUCHERS / كروت مستطيلة شيك للطباعة والـ PDF)  */}
      {/* ========================================================================= */}
      {isPrintModeOpen && printTargetBatch && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/90 backdrop-blur-md p-4 sm:p-8 flex flex-col items-center font-cairo">
          {/* Print Toolbar */}
          <div className="w-full max-w-4xl flex items-center justify-between mb-6 p-4 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 print:hidden">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-primary-600" />
              <span className="font-bold text-slate-900 dark:text-white">
                {isAr ? 'معاينة كروت الطباعة والـ PDF (A4 Sheet Layout)' : 'A4 Cards Sheet Layout'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsPrintModeOpen(false);
                  setPrintTargetBatch(null);
                }}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>{isAr ? 'طباعة / حفظ كـ PDF' : 'Print / Save as PDF'}</span>
              </button>
            </div>
          </div>

          {/* Printable Cards Sheet */}
          <div className="w-full max-w-4xl bg-white text-slate-900 p-8 rounded-2xl shadow-2xl print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full print:rounded-none">
            <div className="text-center pb-6 border-b border-slate-200 mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Mr. Omar Makawy</h2>
              <p className="text-xs text-slate-500 mt-1">
                {printTargetBatch.type === 'WALLET'
                  ? isAr ? 'كروت شحن رصيد المحفظة التعليمية' : 'Educational Wallet Recharge Vouchers'
                  : printTargetBatch.type === 'PACKAGE'
                  ? isAr ? `كروت تفعيل باقة تعليمية ${printTargetBatch.targetName ? `(${printTargetBatch.targetName})` : ''}` : 'Package Activation Vouchers'
                  : printTargetBatch.type === 'COURSE'
                  ? isAr ? `كروت تفعيل كورس تعليمي ${printTargetBatch.targetName ? `(${printTargetBatch.targetName})` : ''}` : 'Course Activation Vouchers'
                  : isAr ? 'كوبونات خصم' : 'Discount Vouchers'}
              </p>
            </div>

            {/* Grid of Printable Rectangular Cards (2 Columns for A4 balance) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2 print:gap-4">
              {printTargetBatch.codes.map((c, idx) => {
                const codeStr = c.code || c.raw || c.preview || c.code_preview || '';
                return (
                  <div
                    key={idx}
                    className="border-2 border-black rounded-xl p-4 bg-emerald-100 flex flex-col justify-between space-y-3 relative overflow-hidden shadow-xs print:shadow-none"
                  >
                    {/* Top Green Accent Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-600"></div>

                    <div className="flex items-center justify-between border-b border-black/40 pb-2 pt-1">
                      <span className="font-bold text-xs text-black tracking-wide">MR. OMAR MAKAWY</span>
                      <span className="text-[11px] text-black font-bold font-mono">#{idx + 1}</span>
                    </div>

                    <div className="text-center py-2 space-y-1.5">
                      {printTargetBatch.type === 'WALLET' && (
                        <div className="text-black font-bold text-sm sm:text-base">
                          {isAr ? 'قيمة الكارت:' : 'Card Value:'} {printTargetBatch.amount} {isAr ? 'جنيه' : 'EGP'}
                        </div>
                      )}
                      {printTargetBatch.type === 'DISCOUNT' && (
                        <div className="text-black font-bold text-sm sm:text-base">
                          {isAr ? 'كوبون خصم:' : 'Coupon Discount:'} {printTargetBatch.discountValue}{' '}
                          {printTargetBatch.discountType === 'PERCENTAGE' ? '%' : 'ج.م'} {isAr ? 'خصم' : 'OFF'}
                        </div>
                      )}
                      {printTargetBatch.type === 'PACKAGE' && (
                        <div className="text-black font-bold text-sm sm:text-base">
                          {isAr ? 'كود تفعيل باقة:' : 'Package:'}{' '}
                          {(printTargetBatch.targetName || '')
                            .replace(/الصف الثاني الثانوي/g, 'الصف الثاني بكالوريا')
                            .replace(/الصف الثاني ثانوي/g, 'الصف الثاني بكالوريا') ||
                            (isAr ? 'باقة تعليمية' : 'Package')}
                        </div>
                      )}
                      {printTargetBatch.type === 'COURSE' && (
                        <div className="text-black font-bold text-sm sm:text-base">
                          {isAr ? 'كود تفعيل كورس:' : 'Course:'}{' '}
                          {(printTargetBatch.targetName || '')
                            .replace(/الصف الثاني الثانوي/g, 'الصف الثاني بكالوريا')
                            .replace(/الصف الثاني ثانوي/g, 'الصف الثاني بكالوريا') ||
                            (isAr ? 'كورس تعليمي' : 'Course')}
                        </div>
                      )}

                      {/* Code Box */}
                      <div className="bg-white border-2 border-black rounded-lg py-2 px-3 mt-1.5 shadow-xs">
                        <span className="font-mono font-bold text-sm sm:text-base text-black tracking-widest select-all">
                          {codeStr}
                        </span>
                      </div>

                      <p className="text-[10px] font-bold text-black pt-0.5">
                        {printTargetBatch.type === 'DISCOUNT'
                          ? isAr ? 'استخدم الكوبون عند إتمام الشراء' : 'ENTER COUPON CODE AT CHECKOUT'
                          : printTargetBatch.type === 'WALLET'
                          ? isAr ? 'اشحن الكود للاستفادة بالرصيد' : 'SCRATCH OR ENTER CODE TO REDEEM'
                          : isAr ? 'أدخل الكود لتفعيل الاشتراك فوراً' : 'ENTER CODE TO ACTIVATE SUBSCRIPTION'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-black font-bold border-t border-black/40 pt-2">
                      <span>omarmeckawy.com</span>
                      {c.expires_at && (
                        <span>
                          {isAr ? 'صالح حتى:' : 'Exp:'} {new Date(c.expires_at).toLocaleDateString('en-GB')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={async () => {
          await confirmModal.action();
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
