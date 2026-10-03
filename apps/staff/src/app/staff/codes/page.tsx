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
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/FeedbackStates';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

type TabType = 'wallet' | 'discounts';

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
  type: 'WALLET' | 'DISCOUNT';
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

  // Active Tab: Wallet Cards or Discount Coupons
  const [activeTab, setActiveTab] = useState<TabType>('wallet');

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
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState<boolean>(false);
  const [isSingleDiscModalOpen, setIsSingleDiscModalOpen] = useState<boolean>(false);
  const [isBulkDiscModalOpen, setIsBulkDiscModalOpen] = useState<boolean>(false);

  // Post-Generation Result & Print Modals
  const [batchResult, setBatchResult] = useState<GeneratedBatchResult | null>(null);
  const [isPrintModeOpen, setIsPrintModeOpen] = useState<boolean>(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

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

  // Load Lookups (Academic Years, Packages, Courses)
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
          limit: 20,
        };

        if (statusFilter !== 'ALL') {
          params.status = statusFilter;
        }
        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }

        if (activeTab === 'wallet') {
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
          Math.max(1, Math.ceil(resTotal / 20));

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

  // Actions
  // 1. Generate Recharge Codes
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
          ? `تم توليد ${generatedList.length} كارت شحن بنجاح بإجمالي ${(rechargeAmount * generatedList.length).toLocaleString()} ج.م`
          : `Successfully generated ${generatedList.length} recharge cards`,
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
  const handleCreateSingleDiscount = async () => {
    if (!singleDiscCode.trim() || singleDiscValue <= 0) return;
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
        academic_year_id: singleDiscAcademicYear || undefined,
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

  // 3. Generate Bulk Discount Coupons
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
  const confirmDisableItem = (id: string, codePreview: string, type: 'RECHARGE' | 'DISCOUNT') => {
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

  // Copy Code to Clipboard
  const handleCopyCode = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  // Export CSV of generated codes
  const exportGeneratedCodesCSV = () => {
    if (!batchResult || !batchResult.codes.length) return;
    const headers = ['Index', 'Type', 'Code', 'Target/Value', 'Max Uses', 'Created At', 'Expires At'];
    const rows = batchResult.codes.map((c, i) => [
      i + 1,
      batchResult.type,
      c.raw || c.code || c.preview,
      batchResult.amount ? `${batchResult.amount} EGP` : batchResult.discountValue ? `${batchResult.discountValue} (${batchResult.discountType})` : '',
      c.max_uses || 1,
      new Date().toISOString(),
      c.expires_at ? new Date(c.expires_at).toISOString() : '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `codes-${batchResult.type.toLowerCase()}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isAr ? 'كروت الشحن وكوبونات الخصم' : 'Recharge Cards & Discount Coupons'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? 'إدارة وتوليد كروت شحن رصيد المحفظة التعليمية وكوبونات الخصم'
              : 'Manage and generate wallet top-up cards and discount coupons'}
          </p>
        </div>

        {/* Primary Action Buttons */}
        {canManage && (
          <div className="flex flex-wrap items-center gap-2.5">
            {activeTab === 'wallet' && (
              <button
                onClick={() => {
                  setRechargeConfirmStep(false);
                  setIsRechargeModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'توليد كروت شحن محفظة' : 'Generate Top-Up Cards'}</span>
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
                  <span>{isAr ? 'توليد كوبونات مجمعة' : 'Generate Bulk Coupons'}</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
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
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'discounts'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>{isAr ? 'كوبونات الخصم' : 'Discount Coupons'}</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={isAr ? 'بحث في الأكواد...' : 'Search codes...'}
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

      {/* Main Table Content */}
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

                  {activeTab === 'wallet' && (
                    <th className="py-3.5 px-4 text-start">{isAr ? 'القيمة' : 'Value'}</th>
                  )}

                  {activeTab === 'discounts' && (
                    <>
                      <th className="py-3.5 px-4 text-start">{isAr ? 'نوع الخصم' : 'Type'}</th>
                      <th className="py-3.5 px-4 text-start">{isAr ? 'قيمة الخصم' : 'Discount'}</th>
                      <th className="py-3.5 px-4 text-start">{isAr ? 'النطاق / العنصر' : 'Scope'}</th>
                    </>
                  )}

                  {/* Usage Quota */}
                  {activeTab === 'discounts' && (
                    <th className="py-3.5 px-4 text-start">{isAr ? 'مرات الاستخدام' : 'Usage'}</th>
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
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-xs tracking-wider">
                          {row.code_preview || row.code || 'CODE'}
                        </span>
                      </div>
                    </td>

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

                    {/* Usage Limits */}
                    {activeTab === 'discounts' && (
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
                                activeTab === 'wallet' ? 'RECHARGE' : 'DISCOUNT',
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
      {/* 1. RECHARGE CARDS GENERATION MODAL                                        */}
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
      {/* 2. CREATE SINGLE DISCOUNT MODAL                                           */}
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
              {/* Code String */}
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

              {/* Type & Value */}
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

              {/* Scope */}
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

              {/* Target Selector if not ALL */}
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

              {/* Min Order & Max Uses */}
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

              {/* Dates */}
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
      {/* 3. BULK DISCOUNT COUPONS GENERATION MODAL                                 */}
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

                  {/* Scope */}
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

                  {/* Target Selector if not ALL */}
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

                  {/* Expiration */}
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
                /* Confirmation Step */
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
      {/* 4. POST-GENERATION RESULT SCREEN (SECURE IN-MEMORY DISPLAY)                */}
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
                      ? `تم توليد عدد (${batchResult.codes.length}) كود بنجاح`
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
      {/* 5. PRINT VIEW MODAL (A4 READY)                                            */}
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
                  : isAr ? 'كوبونات خصم' : 'Discount Vouchers'}
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
