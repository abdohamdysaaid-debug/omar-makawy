'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { staffApiClient as apiClient } from '@/context/StaffAuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useAcademicYearScope } from '@/context/AcademicYearContext';
import { SystemPermissions } from '@omar-makawy/shared';
import {
  Ticket,
  Package as PackageIcon,
  BookOpen,
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
  CheckCircle2,
  XCircle,
  Eye,
  Percent,
  Coins,
  Calendar,
  X,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  FileSpreadsheet,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/FeedbackStates';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

type TabType = 'packages' | 'courses' | 'wallet' | 'discounts';

interface GeneratedCodeItem {
  raw?: string;
  code?: string;
  preview?: string;
  code_preview?: string;
  type?: string;
  target_id?: string;
  academic_year_id?: string;
  amount?: string | number;
  discount_value?: any;
  discount_type?: string;
  max_uses?: number;
  expires_at?: string | Date;
}

interface GeneratedBatchResult {
  title: string;
  type: 'PACKAGE' | 'COURSE' | 'WALLET' | 'DISCOUNT';
  targetName?: string;
  amount?: number | string;
  discountType?: string;
  discountValue?: number | string;
  codes: GeneratedCodeItem[];
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

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('packages');

  // Lookups Data
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [packagesList, setPackagesList] = useState<any[]>([]);
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [loadingLookups, setLoadingLookups] = useState<boolean>(true);

  // Active Tab Table Data
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>(activeAcademicYearId || 'ALL');
  const [discountTypeFilter, setDiscountTypeFilter] = useState<string>('ALL');
  const [discountTargetFilter, setDiscountTargetFilter] = useState<string>('ALL');

  // Feedback Notification
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
  const [isPrintModeOpen, setIsPrintModeOpen] = useState<boolean>(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  // Generation Forms State
  // 1. Package Form
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

  // 2. Course Form
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

  // 3. Recharge Form
  const [rechargeAmount, setRechargeAmount] = useState<number>(100);
  const [rechargeCount, setRechargeCount] = useState<number>(50);
  const [rechargeExpiresAt, setRechargeExpiresAt] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [rechargeConfirmStep, setRechargeConfirmStep] = useState<boolean>(false);
  const [isGeneratingRecharge, setIsGeneratingRecharge] = useState<boolean>(false);

  // 4. Single Discount Form
  const [singleDiscCode, setSingleDiscCode] = useState<string>('');
  const [singleDiscType, setSingleDiscType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [singleDiscValue, setSingleDiscValue] = useState<number>(20);
  const [singleDiscMinOrder, setSingleDiscMinOrder] = useState<number>(0);
  const [singleDiscMaxUses, setSingleDiscMaxUses] = useState<number>(1);
  const [singleDiscScope, setSingleDiscScope] = useState<'ALL' | 'PACKAGE' | 'COURSE'>('ALL');
  const [singleDiscTargetId, setSingleDiscTargetId] = useState<string>('');
  const [singleDiscStartsAt, setSingleDiscStartsAt] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [singleDiscExpiresAt, setSingleDiscExpiresAt] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  });
  const [isSavingSingleDisc, setIsSavingSingleDisc] = useState<boolean>(false);

  // 5. Bulk Discount Form
  const [bulkDiscType, setBulkDiscType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [bulkDiscValue, setBulkDiscValue] = useState<number>(20);
  const [bulkDiscCount, setBulkDiscCount] = useState<number>(50);
  const [bulkDiscMinOrder, setBulkDiscMinOrder] = useState<number>(0);
  const [bulkDiscMaxUses, setBulkDiscMaxUses] = useState<number>(1);
  const [bulkDiscScope, setBulkDiscScope] = useState<'ALL' | 'PACKAGE' | 'COURSE'>('ALL');
  const [bulkDiscTargetId, setBulkDiscTargetId] = useState<string>('');
  const [bulkDiscStartsAt, setBulkDiscStartsAt] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [bulkDiscExpiresAt, setBulkDiscExpiresAt] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  });
  const [bulkDiscConfirmStep, setBulkDiscConfirmStep] = useState<boolean>(false);
  const [isGeneratingBulkDisc, setIsGeneratingBulkDisc] = useState<boolean>(false);

  // Sync yearFilter with activeAcademicYearId
  useEffect(() => {
    if (activeAcademicYearId) {
      setYearFilter(activeAcademicYearId);
    } else {
      setYearFilter('ALL');
    }
  }, [activeAcademicYearId]);

  // Debounced search handler
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Clear feedback after 5 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Load Lookups on Mount
  useEffect(() => {
    async function loadLookups() {
      setLoadingLookups(true);
      try {
        const [yearsRes, pkgsRes, coursesRes]: any = await Promise.all([
          apiClient.get('/auth/academic-years'),
          apiClient.get('/packages?limit=100'),
          apiClient.get('/courses?limit=100'),
        ]);

        const yList = Array.isArray(yearsRes?.data) ? yearsRes.data : Array.isArray(yearsRes) ? yearsRes : [];
        const pList = Array.isArray(pkgsRes?.data) ? pkgsRes.data : Array.isArray(pkgsRes) ? pkgsRes : [];
        const cList = Array.isArray(coursesRes?.data) ? coursesRes.data : Array.isArray(coursesRes) ? coursesRes : [];

        setAcademicYears(yList);
        setPackagesList(pList);
        setCoursesList(cList);

        if (pList.length > 0) {
          setPkgTargetId(pList[0].id);
          setSingleDiscTargetId(pList[0].id);
          setBulkDiscTargetId(pList[0].id);
        }
        if (cList.length > 0) {
          setCourseTargetId(cList[0].id);
        }
      } catch (err: any) {
        console.error('Failed to load lookups', err);
        setFeedback({
          type: 'error',
          message: err?.message || (isAr ? 'فشل تحميل بيانات الباقات والكورسات من الخادم' : 'Failed to load lookups from server'),
        });
      } finally {
        setLoadingLookups(false);
      }
    }
    loadLookups();
  }, [isAr]);

  // Load Table Data
  const loadData = useCallback(
    async (targetPage = page) => {
      setIsLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('page', targetPage.toString());
        queryParams.set('limit', '20');

        if (debouncedSearch.trim()) queryParams.set('search', debouncedSearch.trim());
        if (statusFilter !== 'ALL') queryParams.set('status', statusFilter);

        let endpoint = '';
        if (activeTab === 'packages') {
          queryParams.set('type', 'PACKAGE');
          if (yearFilter !== 'ALL') queryParams.set('academic_year_id', yearFilter);
          endpoint = `/admin/activation-codes?${queryParams.toString()}`;
        } else if (activeTab === 'courses') {
          queryParams.set('type', 'COURSE');
          if (yearFilter !== 'ALL') queryParams.set('academic_year_id', yearFilter);
          endpoint = `/admin/activation-codes?${queryParams.toString()}`;
        } else if (activeTab === 'wallet') {
          endpoint = `/admin/recharge-codes?${queryParams.toString()}`;
        } else if (activeTab === 'discounts') {
          if (discountTypeFilter !== 'ALL') queryParams.set('discount_type', discountTypeFilter);
          if (discountTargetFilter !== 'ALL') queryParams.set('target_type', discountTargetFilter);
          if (yearFilter !== 'ALL') queryParams.set('academic_year_id', yearFilter);
          endpoint = `/admin/discounts?${queryParams.toString()}`;
        }

        const res: any = await apiClient.get(endpoint);
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setItems(list);

        const resTotal = res?.total ?? res?.meta?.total ?? list.length;
        const resPage = res?.page ?? res?.meta?.page ?? targetPage;
        const resLimit = res?.limit ?? res?.meta?.limit ?? 20;
        const resTotalPages = res?.totalPages ?? res?.meta?.totalPages ?? res?.meta?.pages ?? (Math.ceil(resTotal / resLimit) || 1);

        setTotal(resTotal);
        setPage(resPage);
        setTotalPages(resTotalPages);
      } catch (err: any) {
        console.error('Failed to load table data', err);
        const errorMsg = err?.message || (isAr ? 'تعذر جلب البيانات من الخادم. تأكد من اتصال السيرفر.' : 'Failed to fetch data from server.');
        setError(errorMsg);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab, debouncedSearch, statusFilter, yearFilter, discountTypeFilter, discountTargetFilter, page, isAr],
  );

  // Trigger loadData on filter/tab changes
  useEffect(() => {
    loadData(1);
  }, [activeTab, debouncedSearch, statusFilter, yearFilter, discountTypeFilter, discountTargetFilter]);

  // Selected Target Previews
  const selectedPackage = useMemo(
    () => packagesList.find((p) => p.id === pkgTargetId) || packagesList[0],
    [packagesList, pkgTargetId],
  );

  const selectedCourse = useMemo(
    () => coursesList.find((c) => c.id === courseTargetId) || coursesList[0],
    [coursesList, courseTargetId],
  );

  // Handlers for Code Generation
  // 1. Generate Package Codes
  const handleGeneratePackageCodes = async () => {
    if (!pkgTargetId) return;
    setIsGeneratingPkg(true);
    setFeedback(null);
    try {
      const payload = {
        type: 'PACKAGE',
        target_id: pkgTargetId,
        count: Number(pkgCount),
        max_uses: Number(pkgMaxUses),
        expires_at: new Date(pkgExpiresAt).toISOString(),
        batch_id: `PKG-${Date.now().toString().slice(-6)}`,
      };

      const res: any = await apiClient.post('/admin/activation-codes/generate', payload);
      const generatedList = res?.codes || [];

      setBatchResult({
        title: isAr ? 'أكواد باقة تم توليدها بنجاح' : 'Generated Package Codes',
        type: 'PACKAGE',
        targetName: selectedPackage ? (selectedPackage.title_ar || selectedPackage.title_en) : '',
        codes: generatedList,
      });

      setIsPkgModalOpen(false);
      setPkgConfirmStep(false);
      setFeedback({
        type: 'success',
        message: isAr
          ? `تم توليد ${generatedList.length} كود تفعيل للباقة بنجاح`
          : `Successfully generated ${generatedList.length} package codes`,
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

  // 2. Generate Course Codes
  const handleGenerateCourseCodes = async () => {
    if (!courseTargetId) return;
    setIsGeneratingCourse(true);
    setFeedback(null);
    try {
      const payload = {
        type: 'COURSE',
        target_id: courseTargetId,
        count: Number(courseCount),
        max_uses: Number(courseMaxUses),
        expires_at: new Date(courseExpiresAt).toISOString(),
        batch_id: `CRS-${Date.now().toString().slice(-6)}`,
      };

      const res: any = await apiClient.post('/admin/activation-codes/generate', payload);
      const generatedList = res?.codes || [];

      setBatchResult({
        title: isAr ? 'أكواد كورس تم توليدها بنجاح' : 'Generated Course Codes',
        type: 'COURSE',
        targetName: selectedCourse ? (selectedCourse.title_ar || selectedCourse.title_en) : '',
        codes: generatedList,
      });

      setIsCourseModalOpen(false);
      setCourseConfirmStep(false);
      setFeedback({
        type: 'success',
        message: isAr
          ? `تم توليد ${generatedList.length} كود تفعيل للكورس بنجاح`
          : `Successfully generated ${generatedList.length} course codes`,
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

  // 3. Generate Recharge Codes
  const handleGenerateRechargeCodes = async () => {
    if (rechargeAmount <= 0 || rechargeCount <= 0) return;
    setIsGeneratingRecharge(true);
    setFeedback(null);
    try {
      const payload = {
        amount: Number(rechargeAmount),
        count: Number(rechargeCount),
        expires_at: new Date(rechargeExpiresAt).toISOString(),
        batch_id: `RCH-${Date.now().toString().slice(-6)}`,
      };

      const res: any = await apiClient.post('/admin/recharge-codes/generate', payload);
      const generatedList = res?.codes || [];

      setBatchResult({
        title: isAr ? 'كروت شحن رصيد تم توليدها بنجاح' : 'Generated Wallet Recharge Cards',
        type: 'WALLET',
        amount: rechargeAmount,
        codes: generatedList,
      });

      setIsRechargeModalOpen(false);
      setRechargeConfirmStep(false);
      setFeedback({
        type: 'success',
        message: isAr
          ? `تم توليد ${generatedList.length} كرت شحن بقيمة ${rechargeAmount} ج.م بنجاح`
          : `Successfully generated ${generatedList.length} recharge cards of ${rechargeAmount} EGP`,
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

  // 4. Create Single Discount Coupon
  const handleCreateSingleDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleDiscCode.trim()) return;
    setIsSavingSingleDisc(true);
    setFeedback(null);
    try {
      const payload: any = {
        code: singleDiscCode.trim().toUpperCase(),
        discount_type: singleDiscType,
        discount_value: Number(singleDiscValue),
        min_order_amount: Number(singleDiscMinOrder),
        max_uses: Number(singleDiscMaxUses),
        starts_at: new Date(singleDiscStartsAt).toISOString(),
        expires_at: new Date(singleDiscExpiresAt).toISOString(),
        target_type: singleDiscScope,
        target_id: singleDiscScope !== 'ALL' ? singleDiscTargetId : undefined,
      };

      await apiClient.post('/admin/discounts', payload);

      setIsSingleDiscModalOpen(false);
      setSingleDiscCode('');
      setFeedback({
        type: 'success',
        message: isAr
          ? `تم إنشاء كوبون الخصم (${singleDiscCode.toUpperCase()}) بنجاح`
          : `Discount coupon (${singleDiscCode.toUpperCase()}) created successfully`,
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

  // 5. Generate Bulk Discount Coupons
  const handleGenerateBulkDiscount = async () => {
    if (bulkDiscCount <= 0 || bulkDiscValue <= 0) return;
    setIsGeneratingBulkDisc(true);
    setFeedback(null);
    try {
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
        batch_id: `DISC-${Date.now().toString().slice(-6)}`,
      };

      const res: any = await apiClient.post('/admin/discounts/generate', payload);
      const generatedList = res?.codes || [];

      setBatchResult({
        title: isAr ? 'كوبونات خصم تم توليدها بنجاح' : 'Generated Discount Coupons',
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
          ? `تم توليد ${generatedList.length} كوبون خصم بنجاح`
          : `Successfully generated ${generatedList.length} discount coupons`,
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
  const confirmDisableItem = (id: string, codePreview: string, type: 'ACTIVATION' | 'RECHARGE' | 'DISCOUNT') => {
    let title = isAr ? 'تعطيل الكود' : 'Disable Code';
    let message = isAr
      ? `هل أنت متأكد من تعطيل الكود (${codePreview})؟ لن يتمكن أي طالب من استخدامه بعد الآن.`
      : `Are you sure you want to disable code (${codePreview})? Students will not be able to redeem it.`;

    const action = async () => {
      try {
        if (type === 'ACTIVATION') {
          await apiClient.patch(`/admin/activation-codes/${id}/disable`, {});
        } else if (type === 'RECHARGE') {
          await apiClient.patch(`/admin/recharge-codes/${id}/disable`, {});
        } else if (type === 'DISCOUNT') {
          await apiClient.patch(`/admin/discounts/${id}/disable`, {});
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

  // Copy Single Code from Post-Gen Screen
  const handleCopyCode = (codeStr: string, idx: number) => {
    navigator.clipboard.writeText(codeStr);
    setCopiedCodeIndex(idx);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  // CSV Export for Newly Generated Result Batch
  const exportGeneratedCodesCSV = () => {
    if (!batchResult || !batchResult.codes.length) return;

    const headers = ['Code', 'Type', 'Target/Amount', 'Max Uses', 'Expiration Date'];
    const rows = batchResult.codes.map((c) => {
      const codeValue = c.raw || c.code || c.preview || '';
      const typeStr = batchResult.type;
      const targetStr = batchResult.targetName || (batchResult.amount ? `${batchResult.amount} EGP` : batchResult.discountValue || '');
      const maxUses = c.max_uses ?? (batchResult.type === 'WALLET' ? '1' : '1');
      const expDate = c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-GB') : '';

      return [
        `"${codeValue}"`,
        `"${typeStr}"`,
        `"${targetStr}"`,
        `"${maxUses}"`,
        `"${expDate}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `generated-codes-${batchResult.type.toLowerCase()}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/50">
              <Ticket className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isAr ? 'أكواد التفعيل والشحن' : 'Activation & Recharge Codes'}
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isAr
              ? 'إدارة أكواد تفعيل الباقات والكورسات وكروت شحن المحفظة وكوبونات الخصم'
              : 'Central management for package & course activation codes, wallet top-up cards and discount coupons'}
          </p>
        </div>

        {/* Primary Actions based on Active Tab */}
        <div className="flex flex-wrap items-center gap-3">
          {canManage && activeTab === 'packages' && (
            <button
              onClick={() => {
                setPkgConfirmStep(false);
                setIsPkgModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition-all focus:ring-2 focus:ring-primary-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'توليد أكواد باقة' : 'Generate Package Codes'}</span>
            </button>
          )}

          {canManage && activeTab === 'courses' && (
            <button
              onClick={() => {
                setCourseConfirmStep(false);
                setIsCourseModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition-all focus:ring-2 focus:ring-primary-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'توليد أكواد كورس' : 'Generate Course Codes'}</span>
            </button>
          )}

          {canManage && activeTab === 'wallet' && (
            <button
              onClick={() => {
                setRechargeConfirmStep(false);
                setIsRechargeModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-all focus:ring-2 focus:ring-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'توليد كروت شحن' : 'Generate Top-Up Cards'}</span>
            </button>
          )}

          {canManage && activeTab === 'discounts' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSingleDiscModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'إنشاء كوبون' : 'Create Single Coupon'}</span>
              </button>
              <button
                onClick={() => {
                  setBulkDiscConfirmStep(false);
                  setIsBulkDiscModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'توليد كوبونات' : 'Bulk Generate Coupons'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl text-sm font-medium border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        <button
          onClick={() => {
            setActiveTab('packages');
            setStatusFilter('ALL');
            setSearch('');
          }}
          className={`inline-flex items-center gap-2.5 px-5 py-3 border-b-2 text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'packages'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <PackageIcon className="w-4 h-4" />
          <span>{isAr ? 'أكواد الباقات' : 'Package Codes'}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('courses');
            setStatusFilter('ALL');
            setSearch('');
          }}
          className={`inline-flex items-center gap-2.5 px-5 py-3 border-b-2 text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'courses'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{isAr ? 'أكواد الكورسات' : 'Course Codes'}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('wallet');
            setStatusFilter('ALL');
            setSearch('');
          }}
          className={`inline-flex items-center gap-2.5 px-5 py-3 border-b-2 text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'wallet'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>{isAr ? 'كروت شحن المحفظة' : 'Wallet Top-Up Cards'}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('discounts');
            setStatusFilter('ALL');
            setDiscountTypeFilter('ALL');
            setDiscountTargetFilter('ALL');
            setSearch('');
          }}
          className={`inline-flex items-center gap-2.5 px-5 py-3 border-b-2 text-sm font-semibold transition-all whitespace-nowrap ${
            activeTab === 'discounts'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>{isAr ? 'كوبونات الخصم' : 'Discount Coupons'}</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 text-slate-400 start-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isAr
                ? activeTab === 'wallet'
                  ? 'بحث بمعرف الكارت أو الدفعة...'
                  : 'بحث برمز الكود أو العنوان...'
                : 'Search codes...'
            }
            className="w-full ps-9 pe-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Academic Year Filter (Activation & Discounts) */}
          {(activeTab === 'packages' || activeTab === 'courses' || activeTab === 'discounts') && (
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="ALL">{isAr ? 'جميع السنوات الدراسية' : 'All Academic Years'}</option>
              {academicYears.map((y) => (
                <option key={y.id} value={y.id}>
                  {isAr ? y.name_ar : y.name_en}
                </option>
              ))}
            </select>
          )}

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="ACTIVE">{isAr ? 'نشط / متاح' : 'Active'}</option>
            <option value="USED">{isAr ? 'مستخدم / مكتمل' : 'Used'}</option>
            {activeTab === 'discounts' && <option value="EXHAUSTED">{isAr ? 'منتهي الاستخدام' : 'Exhausted'}</option>}
            <option value="DISABLED">{isAr ? 'معطل' : 'Disabled'}</option>
          </select>

          {/* Discount Specific Filters */}
          {activeTab === 'discounts' && (
            <>
              <select
                value={discountTypeFilter}
                onChange={(e) => setDiscountTypeFilter(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">{isAr ? 'جميع أنواع الخصم' : 'All Types'}</option>
                <option value="PERCENTAGE">{isAr ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
                <option value="FIXED_AMOUNT">{isAr ? 'مبلغ ثابت (ج.م)' : 'Fixed Amount (EGP)'}</option>
              </select>

              <select
                value={discountTargetFilter}
                onChange={(e) => setDiscountTargetFilter(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">{isAr ? 'جميع النطاقات' : 'All Scopes'}</option>
                <option value="ALL">{isAr ? 'المنصة كاملة' : 'Platform Wide'}</option>
                <option value="PACKAGE">{isAr ? 'باقة محددة' : 'Package'}</option>
                <option value="COURSE">{isAr ? 'كورس محدد' : 'Course'}</option>
              </select>
            </>
          )}

          {/* Refresh Button */}
          <button
            onClick={() => loadData(page)}
            disabled={isLoading}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title={isAr ? 'إعادة التحميل' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20">
            <LoadingState message={isAr ? 'جاري تحميل قائمة الأكواد...' : 'Loading codes list...'} />
          </div>
        ) : error ? (
          <div className="py-20">
            <ErrorState message={error} onRetry={() => loadData(page)} />
          </div>
        ) : items.length === 0 ? (
          <div className="py-20">
            <EmptyState
              title={isAr ? 'لا توجد أكواد مسجلة' : 'No codes found'}
              description={
                isAr
                  ? 'لم يتم العثور على أي أكواد تطابق شروط البحث أو الفلاتر المحددة.'
                  : 'No records found matching current search or filters.'
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="py-3.5 px-4 text-start">{isAr ? 'الكود' : 'Code'}</th>

                  {/* Target Column */}
                  {activeTab === 'packages' && <th className="py-3.5 px-4 text-start">{isAr ? 'الباقة المستهدفة' : 'Target Package'}</th>}
                  {activeTab === 'courses' && <th className="py-3.5 px-4 text-start">{isAr ? 'الكورس المستهدف' : 'Target Course'}</th>}
                  {activeTab === 'wallet' && <th className="py-3.5 px-4 text-start">{isAr ? 'قيمة الكارت' : 'Card Value'}</th>}
                  {activeTab === 'discounts' && (
                    <>
                      <th className="py-3.5 px-4 text-start">{isAr ? 'نوع الخصم' : 'Discount Type'}</th>
                      <th className="py-3.5 px-4 text-start">{isAr ? 'قيمة الخصم' : 'Value'}</th>
                      <th className="py-3.5 px-4 text-start">{isAr ? 'النطاق / الهدف' : 'Scope / Target'}</th>
                    </>
                  )}

                  {/* Academic Year Column */}
                  {(activeTab === 'packages' || activeTab === 'courses') && (
                    <th className="py-3.5 px-4 text-start">{isAr ? 'السنة الدراسية' : 'Academic Year'}</th>
                  )}

                  {/* Usage Info */}
                  {activeTab !== 'wallet' && (
                    <th className="py-3.5 px-4 text-start">{isAr ? 'مرات الاستخدام' : 'Usage Limit'}</th>
                  )}

                  {/* Wallet Specific Used By */}
                  {activeTab === 'wallet' && (
                    <>
                      <th className="py-3.5 px-4 text-start">{isAr ? 'المستخدم' : 'Used By'}</th>
                      <th className="py-3.5 px-4 text-start">{isAr ? 'تاريخ الاستخدام' : 'Used At'}</th>
                    </>
                  )}

                  <th className="py-3.5 px-4 text-start">{isAr ? 'تاريخ الإنشاء' : 'Created At'}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? 'تاريخ الانتهاء' : 'Expires At'}</th>
                  <th className="py-3.5 px-4 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                  {canManage && <th className="py-3.5 px-4 text-center">{isAr ? 'الإجراءات' : 'Actions'}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/75 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Code Preview */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-xs border border-slate-200 dark:border-slate-700">
                          {row.code_preview || row.code || 'CODE-****-XXXX'}
                        </span>
                      </div>
                    </td>

                    {/* Tab Specific Content */}
                    {activeTab === 'packages' && (
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {row.target_title || (isAr ? 'باقة تعليمية' : 'Package')}
                        </span>
                      </td>
                    )}

                    {activeTab === 'courses' && (
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {row.target_title || (isAr ? 'كورس تعليمي' : 'Course')}
                        </span>
                      </td>
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
                      </>
                    )}

                    {/* Academic Year */}
                    {(activeTab === 'packages' || activeTab === 'courses') && (
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {isAr ? row.academic_year_name_ar || '—' : row.academic_year_name_en || '—'}
                      </td>
                    )}

                    {/* Usage Limits */}
                    {activeTab !== 'wallet' && (
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                          <span className="text-slate-900 dark:text-white font-bold">{row.used_count ?? 0}</span>
                          <span>/</span>
                          <span>{row.max_uses ?? 1}</span>
                          <span>{isAr ? 'استخدام' : 'uses'}</span>
                        </div>
                      </td>
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
                        {row.status === 'ACTIVE' ? (
                          <button
                            onClick={() =>
                              confirmDisableItem(
                                row.id,
                                row.code_preview || row.code || 'CODE',
                                activeTab === 'wallet'
                                  ? 'RECHARGE'
                                  : activeTab === 'discounts'
                                  ? 'DISCOUNT'
                                  : 'ACTIVATION',
                              )
                            }
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors"
                          >
                            {isAr ? 'تعطيل' : 'Disable'}
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
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

      {/* ========================================================================= */}
      {/* 1. PACKAGE GENERATION MODAL                                               */}
      {/* ========================================================================= */}
      {isPkgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
                  <PackageIcon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isAr ? 'توليد أكواد باقة تعليمية' : 'Generate Package Activation Codes'}
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
                  {/* Package Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {isAr ? 'اختار الباقة' : 'Select Package'} *
                    </label>
                    <select
                      value={pkgTargetId}
                      onChange={(e) => setPkgTargetId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                      {packagesList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title_ar || p.title_en} — ({p.price} ج.م)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Live Package Card Preview */}
                  {selectedPackage && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                      {selectedPackage.thumbnail_url ? (
                        <img
                          src={selectedPackage.thumbnail_url}
                          alt=""
                          className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600">
                          <PackageIcon className="w-8 h-8" />
                        </div>
                      )}
                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-sm text-slate-900 dark:text-white">
                          {selectedPackage.title_ar || selectedPackage.title_en}
                        </p>
                        <p className="text-slate-500">
                          {isAr ? 'السعر الأساسي:' : 'Price:'}{' '}
                          <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPackage.price} ج.م</span>
                          {selectedPackage.discount_price && (
                            <span className="text-emerald-600 ms-2">
                              ({isAr ? 'الخصم:' : 'Discount:'} {selectedPackage.discount_price} ج.م)
                            </span>
                          )}
                        </p>
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                          {selectedPackage.academic_year_id ? (isAr ? 'تتبع مرحلة دراسية محددة' : 'Year Bound') : ''}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Count & Max Uses */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {isAr ? 'عدد الأكواد' : 'Number of Codes'} *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={pkgCount}
                        onChange={(e) => setPkgCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {isAr ? 'مرات استخدام الكود' : 'Max Uses Per Code'} *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={pkgMaxUses}
                        onChange={(e) => setPkgMaxUses(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Expiration Date */}
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

                  {/* Generation Summary Box */}
                  <div className="p-4 rounded-xl bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/40 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                    <p className="font-bold text-primary-900 dark:text-primary-300">{isAr ? 'ملخص التوليد:' : 'Summary:'}</p>
                    <div className="flex justify-between">
                      <span>{isAr ? 'الباقة:' : 'Package:'}</span>
                      <span className="font-bold">{selectedPackage?.title_ar || selectedPackage?.title_en || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isAr ? 'عدد الأكواد:' : 'Codes Count:'}</span>
                      <span className="font-bold">{pkgCount} كود</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isAr ? 'مرات الاستخدام لكل كود:' : 'Max Uses:'}</span>
                      <span className="font-bold">{pkgMaxUses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isAr ? 'تاريخ الانتهاء:' : 'Expires:'}</span>
                      <span className="font-bold">{pkgExpiresAt}</span>
                    </div>
                  </div>
                </>
              ) : (
                /* Confirmation Step */
                <div className="text-center py-4 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 mx-auto flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {isAr ? 'تأكيد أمر التوليد' : 'Confirm Generation'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isAr
                        ? `أنت على وشك توليد ${pkgCount} كود تفعيل للباقة (${selectedPackage?.title_ar || selectedPackage?.title_en}). هل تريد المتابعة؟`
                        : `You are about to generate ${pkgCount} activation codes. Continue?`}
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
                    onClick={() => setPkgConfirmStep(true)}
                    className="px-5 py-2 text-sm font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
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
      {/* 2. COURSE GENERATION MODAL                                                */}
      {/* ========================================================================= */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isAr ? 'توليد أكواد كورس تعليمي' : 'Generate Course Activation Codes'}
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
                  {/* Course Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {isAr ? 'اختار الكورس' : 'Select Course'} *
                    </label>
                    <select
                      value={courseTargetId}
                      onChange={(e) => setCourseTargetId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                      {coursesList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title_ar || c.title_en} — ({c.price} ج.م)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Live Course Card Preview */}
                  {selectedCourse && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                      {selectedCourse.thumbnail_url ? (
                        <img
                          src={selectedCourse.thumbnail_url}
                          alt=""
                          className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600">
                          <BookOpen className="w-8 h-8" />
                        </div>
                      )}
                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-sm text-slate-900 dark:text-white">
                          {selectedCourse.title_ar || selectedCourse.title_en}
                        </p>
                        <p className="text-slate-500">
                          {isAr ? 'السعر الأساسي:' : 'Price:'}{' '}
                          <span className="font-bold text-slate-800 dark:text-slate-200">{selectedCourse.price} ج.م</span>
                          {selectedCourse.discount_price && (
                            <span className="text-emerald-600 ms-2">
                              ({isAr ? 'الخصم:' : 'Discount:'} {selectedCourse.discount_price} ج.م)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Count & Max Uses */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {isAr ? 'عدد الأكواد' : 'Number of Codes'} *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={courseCount}
                        onChange={(e) => setCourseCount(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {isAr ? 'مرات استخدام الكود' : 'Max Uses Per Code'} *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={courseMaxUses}
                        onChange={(e) => setCourseMaxUses(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Expiration Date */}
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

                  {/* Generation Summary Box */}
                  <div className="p-4 rounded-xl bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/40 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                    <p className="font-bold text-primary-900 dark:text-primary-300">{isAr ? 'ملخص التوليد:' : 'Summary:'}</p>
                    <div className="flex justify-between">
                      <span>{isAr ? 'الكورس:' : 'Course:'}</span>
                      <span className="font-bold">{selectedCourse?.title_ar || selectedCourse?.title_en || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isAr ? 'عدد الأكواد:' : 'Codes Count:'}</span>
                      <span className="font-bold">{courseCount} كود</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isAr ? 'مرات الاستخدام لكل كود:' : 'Max Uses:'}</span>
                      <span className="font-bold">{courseMaxUses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isAr ? 'تاريخ الانتهاء:' : 'Expires:'}</span>
                      <span className="font-bold">{courseExpiresAt}</span>
                    </div>
                  </div>
                </>
              ) : (
                /* Confirmation Step */
                <div className="text-center py-4 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 mx-auto flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {isAr ? 'تأكيد أمر التوليد' : 'Confirm Generation'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isAr
                        ? `أنت على وشك توليد ${courseCount} كود تفعيل للكورس (${selectedCourse?.title_ar || selectedCourse?.title_en}). هل تريد المتابعة؟`
                        : `You are about to generate ${courseCount} course activation codes. Continue?`}
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
                    onClick={() => setCourseConfirmStep(true)}
                    className="px-5 py-2 text-sm font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
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
                    className="inline-flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
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
      {/* 3. RECHARGE CARDS GENERATION MODAL                                        */}
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
                  {/* Amount & Count */}
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

                  {/* Expiration Date */}
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

                  {/* Financial Summary Box */}
                  <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 text-xs space-y-2 text-slate-700 dark:text-slate-300">
                    <p className="font-bold text-emerald-900 dark:text-emerald-300">{isAr ? 'المطابقة المالية:' : 'Financial Summary:'}</p>
                    <div className="flex justify-between">
                      <span>{isAr ? 'قيمة كل كارت:' : 'Value Per Card:'}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{rechargeAmount} ج.م</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isAr ? 'عدد الكروت:' : 'Cards Count:'}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{rechargeCount} كارت</span>
                    </div>
                    <div className="flex justify-between border-t border-emerald-200 dark:border-emerald-800 pt-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                      <span>{isAr ? 'إجمالي القيمة الاسمية:' : 'Total Face Value:'}</span>
                      <span>{(rechargeAmount * rechargeCount).toLocaleString()} ج.م</span>
                    </div>
                  </div>
                </>
              ) : (
                /* Confirmation Step */
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
      {/* 4. SINGLE DISCOUNT COUPON MODAL                                           */}
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
                  {isAr ? 'إنشاء كوبون خصم فردي' : 'Create Single Discount Coupon'}
                </h3>
              </div>
              <button
                onClick={() => setIsSingleDiscModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSingleDiscount} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Code */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {isAr ? 'رمز الكوبون' : 'Coupon Code'} *
                </label>
                <input
                  type="text"
                  required
                  value={singleDiscCode}
                  onChange={(e) => setSingleDiscCode(e.target.value.toUpperCase())}
                  placeholder="e.g. DISCOUNT20"
                  className="w-full px-3.5 py-2.5 text-sm font-mono font-bold uppercase rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Discount Type & Value */}
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
                    {isAr ? 'قيمة الخصم' : 'Discount Value'} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={singleDiscType === 'PERCENTAGE' ? '100' : '10000'}
                    value={singleDiscValue}
                    onChange={(e) => setSingleDiscValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none"
                  />
                </div>
              </div>

              {/* Scope */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {isAr ? 'نطاق التطبيق' : 'Application Scope'} *
                </label>
                <select
                  value={singleDiscScope}
                  onChange={(e) => setSingleDiscScope(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="ALL">{isAr ? 'جميع محتويات المنصة' : 'Platform Wide (All)'}</option>
                  <option value="PACKAGE">{isAr ? 'باقة محددة' : 'Specific Package'}</option>
                  <option value="COURSE">{isAr ? 'كورس محدد' : 'Specific Course'}</option>
                </select>
              </div>

              {/* Target Dropdown based on Scope */}
              {singleDiscScope === 'PACKAGE' && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {isAr ? 'اختار الباقة' : 'Select Target Package'} *
                  </label>
                  <select
                    value={singleDiscTargetId}
                    onChange={(e) => setSingleDiscTargetId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    {packagesList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title_ar || p.title_en}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {singleDiscScope === 'COURSE' && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {isAr ? 'اختار الكورس' : 'Select Target Course'} *
                  </label>
                  <select
                    value={singleDiscTargetId}
                    onChange={(e) => setSingleDiscTargetId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  >
                    {coursesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title_ar || c.title_en}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Max Uses & Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {isAr ? 'مرات الاستخدام الإجمالية' : 'Total Max Uses'} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={singleDiscMaxUses}
                    onChange={(e) => setSingleDiscMaxUses(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {isAr ? 'الحد الأدنى للطلب (ج.م)' : 'Min Order (EGP)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={singleDiscMinOrder}
                    onChange={(e) => setSingleDiscMinOrder(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {isAr ? 'تاريخ البداية' : 'Start Date'}
                  </label>
                  <input
                    type="date"
                    value={singleDiscStartsAt}
                    onChange={(e) => setSingleDiscStartsAt(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {isAr ? 'تاريخ الانتهاء' : 'End Date'} *
                  </label>
                  <input
                    type="date"
                    value={singleDiscExpiresAt}
                    onChange={(e) => setSingleDiscExpiresAt(e.target.value)}
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
                    <span>{isAr ? 'إنشاء الكوبون' : 'Create Coupon'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. BULK DISCOUNT COUPONS MODAL                                            */}
      {/* ========================================================================= */}
      {isBulkDiscModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
                  <Percent className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isAr ? 'توليد دفعة كوبونات خصم' : 'Bulk Generate Discount Coupons'}
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
                  {/* Count */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {isAr ? 'عدد الكوبونات المراد توليدها' : 'Number of Coupons to Generate'} *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={bulkDiscCount}
                      onChange={(e) => setBulkDiscCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  {/* Discount Type & Value */}
                  <div className="grid grid-cols-2 gap-4">
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

                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {isAr ? 'قيمة الخصم' : 'Discount Value'} *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={bulkDiscType === 'PERCENTAGE' ? '100' : '10000'}
                        value={bulkDiscValue}
                        onChange={(e) => setBulkDiscValue(parseFloat(e.target.value) || 0)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Scope */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {isAr ? 'نطاق التطبيق' : 'Application Scope'} *
                    </label>
                    <select
                      value={bulkDiscScope}
                      onChange={(e) => setBulkDiscScope(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="ALL">{isAr ? 'جميع محتويات المنصة' : 'Platform Wide (All)'}</option>
                      <option value="PACKAGE">{isAr ? 'باقة محددة' : 'Specific Package'}</option>
                      <option value="COURSE">{isAr ? 'كورس محدد' : 'Specific Course'}</option>
                    </select>
                  </div>

                  {/* Target Selectors */}
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
                        {packagesList.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title_ar || p.title_en}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

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
                        {coursesList.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title_ar || c.title_en}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Uses & Expiration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {isAr ? 'مرات الاستخدام لكل كود' : 'Max Uses Per Code'} *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={bulkDiscMaxUses}
                        onChange={(e) => setBulkDiscMaxUses(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {isAr ? 'تاريخ الانتهاء' : 'Expiration Date'} *
                      </label>
                      <input
                        type="date"
                        value={bulkDiscExpiresAt}
                        onChange={(e) => setBulkDiscExpiresAt(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="p-4 rounded-xl bg-primary-50/50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/40 text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                    <p className="font-bold text-primary-900 dark:text-primary-300">{isAr ? 'ملخص التوليد:' : 'Summary:'}</p>
                    <div className="flex justify-between">
                      <span>{isAr ? 'عدد الكوبونات:' : 'Coupons Count:'}</span>
                      <span className="font-bold">{bulkDiscCount} كوبون</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isAr ? 'قيمة الخصم:' : 'Discount Value:'}</span>
                      <span className="font-bold">
                        {bulkDiscValue} {bulkDiscType === 'PERCENTAGE' ? '%' : 'ج.م'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{isAr ? 'النطاق:' : 'Scope:'}</span>
                      <span className="font-bold">{bulkDiscScope === 'ALL' ? (isAr ? 'المنصة كاملة' : 'All') : bulkDiscScope}</span>
                    </div>
                  </div>
                </>
              ) : (
                /* Confirmation Step */
                <div className="text-center py-4 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 mx-auto flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {isAr ? 'تأكيد أمر توليد الكوبونات' : 'Confirm Bulk Coupons'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isAr
                        ? `سيتم إنشاء ${bulkDiscCount} كوبون خصم بقيمة ${bulkDiscValue} (${bulkDiscType === 'PERCENTAGE' ? '%' : 'ج.م'}). هل تريد المتابعة؟`
                        : `Generating ${bulkDiscCount} coupons with value ${bulkDiscValue}. Continue?`}
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
      {/* 6. POST-GENERATION RESULTS MODAL                                          */}
      {/* ========================================================================= */}
      {batchResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{batchResult.title}</h3>
                  <p className="text-xs text-slate-500">
                    {isAr
                      ? `تم إنشاء ${batchResult.codes.length} كود صالح للاستخدام فوراً.`
                      : `Successfully created ${batchResult.codes.length} active codes.`}
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportGeneratedCodesCSV}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-semibold hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تحميل الأكواد (CSV)' : 'Export CSV'}</span>
                  </button>
                  <button
                    onClick={() => setIsPrintModeOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{isAr ? 'معاينة وطباعة الكروت' : 'Print Cards'}</span>
                  </button>
                </div>
              </div>

              {/* Codes Grid */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {batchResult.codes.map((c, idx) => {
                  const codeStr = c.raw || c.code || c.preview || '';
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
                            <span>{isAr ? 'نسخ' : 'Copy'}</span>
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
                className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-semibold transition-colors"
              >
                {isAr ? 'تم وإغلاق' : 'Done & Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. PRINT VIEW MODAL (A4 READY)                                            */}
      {/* ========================================================================= */}
      {isPrintModeOpen && batchResult && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/90 backdrop-blur-md p-4 sm:p-8 flex flex-col items-center">
          {/* Print Toolbar (Hidden on actual print) */}
          <div className="w-full max-w-4xl flex items-center justify-between mb-6 p-4 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 print:hidden">
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-primary-600" />
              <span className="font-bold text-slate-900 dark:text-white">
                {isAr ? 'معاينة الطباعة (A4 Cards Layout)' : 'A4 Cards Print Layout'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPrintModeOpen(false)}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-primary-600 hover:bg-primary-700 text-white shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>{isAr ? 'طباعة الآن' : 'Print Now'}</span>
              </button>
            </div>
          </div>

          {/* Printable Cards Sheet */}
          <div className="w-full max-w-4xl bg-white text-slate-900 p-8 rounded-2xl shadow-2xl print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full print:rounded-none">
            <div className="text-center pb-6 border-b border-slate-200 mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Mr. Omar Makawy</h2>
              <p className="text-xs text-slate-500 mt-1">
                {batchResult.type === 'WALLET'
                  ? isAr ? 'كروت شحن رصيد المحفظة التعليمية' : 'Educational Wallet Recharge Vouchers'
                  : isAr ? `أكواد تفعيل (${batchResult.targetName || batchResult.title})` : `Activation Codes - ${batchResult.targetName || ''}`}
              </p>
            </div>

            {/* Grid of Printable Cards (2 Columns for A4 balance) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2 print:gap-4">
              {batchResult.codes.map((c, idx) => {
                const codeStr = c.raw || c.code || c.preview || '';
                return (
                  <div
                    key={idx}
                    className="border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-bold text-xs text-primary-700 tracking-wide">MR. OMAR MAKAWY</span>
                      <span className="text-[10px] text-slate-400 font-mono">#{idx + 1}</span>
                    </div>

                    <div className="text-center py-2 space-y-1">
                      {batchResult.type === 'WALLET' && (
                        <div className="text-emerald-700 font-bold text-base">
                          {isAr ? 'قيمة الكارت:' : 'Value:'} {batchResult.amount} {isAr ? 'جنيه' : 'EGP'}
                        </div>
                      )}
                      {batchResult.type === 'PACKAGE' && (
                        <div className="text-slate-800 font-bold text-xs">
                          {isAr ? 'تفعيل باقة:' : 'Package:'} {batchResult.targetName}
                        </div>
                      )}
                      {batchResult.type === 'COURSE' && (
                        <div className="text-slate-800 font-bold text-xs">
                          {isAr ? 'تفعيل كورس:' : 'Course:'} {batchResult.targetName}
                        </div>
                      )}
                      {batchResult.type === 'DISCOUNT' && (
                        <div className="text-primary-700 font-bold text-xs">
                          {isAr ? 'كوبون خصم:' : 'Discount Coupon:'} {batchResult.discountValue} {batchResult.discountType === 'PERCENTAGE' ? '%' : 'ج.م'}
                        </div>
                      )}

                      {/* Code Box */}
                      <div className="bg-white border-2 border-slate-900 rounded-lg py-2 px-3 mt-2 shadow-sm">
                        <span className="font-mono font-bold text-base text-slate-900 tracking-widest select-all">
                          {codeStr}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200 pt-2">
                      <span>{isAr ? 'منصة مستر عمر مكاوي' : 'Omar Makawy Platform'}</span>
                      {c.expires_at && (
                        <span>
                          {isAr ? 'صالح حتى:' : 'Valid until:'} {new Date(c.expires_at).toLocaleDateString('en-GB')}
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
