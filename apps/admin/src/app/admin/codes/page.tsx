'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { apiClient } from '@/lib/api/client';
import {
  Ticket,
  KeyRound,
  Layers,
  Wallet,
  Plus,
  Copy,
  Check,
  Download,
  Search,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Package as PackageIcon,
  BookOpen,
  Percent,
  Coins,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Printer,
  FileText,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Calendar,
  Clock,
  User,
  Phone,
  Tag,
  AlertTriangle,
  X,
} from 'lucide-react';

type TabType = 'packages' | 'courses' | 'wallet' | 'discounts';

interface GeneratedBatchResult {
  title: string;
  type: 'PACKAGE' | 'COURSE' | 'WALLET' | 'DISCOUNT';
  targetName?: string;
  amount?: number | string;
  codes: Array<{
    code?: string;
    raw?: string;
    raw_code?: string;
    preview?: string;
    code_preview?: string;
    discount_value?: any;
    expires_at?: string;
  }>;
}

export default function StaffCodesManagementPage() {
  const { t, language } = useLanguage();
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<TabType>('packages');

  // Lookup data for Select Dropdowns
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [packagesList, setPackagesList] = useState<any[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(true);

  // Table Data & Filters & Pagination
  const [items, setItems] = useState<any[]>([]);
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number; pages: number }>({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [discountTypeFilter, setDiscountTypeFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [modalType, setModalType] = useState<'PACKAGE' | 'COURSE' | 'WALLET' | 'SINGLE_DISCOUNT' | 'BULK_DISCOUNT' | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);
  const [confirmSummary, setConfirmSummary] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generated Batch Modal
  const [generatedBatch, setGeneratedBatch] = useState<GeneratedBatchResult | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State - Package Generation
  const [pkgTargetId, setPkgTargetId] = useState('');
  const [pkgCount, setPkgCount] = useState('50');
  const [pkgMaxUses, setPkgMaxUses] = useState('1');
  const [pkgExpiresAt, setPkgExpiresAt] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });

  // Form State - Course Generation
  const [courseTargetId, setCourseTargetId] = useState('');
  const [courseCount, setCourseCount] = useState('50');
  const [courseMaxUses, setCourseMaxUses] = useState('1');
  const [courseExpiresAt, setCourseExpiresAt] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });

  // Form State - Wallet Recharge
  const [rechargeAmount, setRechargeAmount] = useState('100');
  const [rechargeCount, setRechargeCount] = useState('50');
  const [rechargeExpiresAt, setRechargeExpiresAt] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });

  // Form State - Single Discount Coupon
  const [singleDiscCode, setSingleDiscCode] = useState('');
  const [singleDiscType, setSingleDiscType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [singleDiscValue, setSingleDiscValue] = useState('20');
  const [singleDiscMinOrder, setSingleDiscMinOrder] = useState('0');
  const [singleDiscMaxUses, setSingleDiscMaxUses] = useState('1');
  const [singleDiscScope, setSingleDiscScope] = useState<'ALL' | 'PACKAGE' | 'COURSE'>('ALL');
  const [singleDiscTargetId, setSingleDiscTargetId] = useState('');
  const [singleDiscStartsAt, setSingleDiscStartsAt] = useState(() => new Date().toISOString().split('T')[0]);
  const [singleDiscExpiresAt, setSingleDiscExpiresAt] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  });

  // Form State - Bulk Discount Coupons
  const [bulkDiscType, setBulkDiscType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [bulkDiscValue, setBulkDiscValue] = useState('20');
  const [bulkDiscCount, setBulkDiscCount] = useState('50');
  const [bulkDiscMaxUses, setBulkDiscMaxUses] = useState('1');
  const [bulkDiscScope, setBulkDiscScope] = useState<'ALL' | 'PACKAGE' | 'COURSE'>('ALL');
  const [bulkDiscTargetId, setBulkDiscTargetId] = useState('');
  const [bulkDiscStartsAt, setBulkDiscStartsAt] = useState(() => new Date().toISOString().split('T')[0]);
  const [bulkDiscExpiresAt, setBulkDiscExpiresAt] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  });

  // 1. Fetch Lookups (Academic Years, Packages, Courses)
  useEffect(() => {
    async function loadLookups() {
      setLoadingLookups(true);
      try {
        const [yearsRes, pkgsRes, coursesRes]: any = await Promise.all([
          apiClient.get('/academic-years').catch(() => ({ data: [] })),
          apiClient.get('/packages?limit=100').catch(() => ({ data: [] })),
          apiClient.get('/courses?limit=100').catch(() => ({ data: [] })),
        ]);

        const yList = Array.isArray(yearsRes?.data) ? yearsRes.data : Array.isArray(yearsRes) ? yearsRes : [];
        const pList = Array.isArray(pkgsRes?.data) ? pkgsRes.data : Array.isArray(pkgsRes) ? pkgsRes : [];
        const cList = Array.isArray(coursesRes?.data) ? coursesRes.data : Array.isArray(coursesRes) ? coursesRes : [];

        setAcademicYears(yList);
        setPackagesList(pList);
        setCoursesList(cList);

        if (pList.length > 0) setPkgTargetId(pList[0].id);
        if (cList.length > 0) setCourseTargetId(cList[0].id);
      } catch (err) {
        console.error('Failed to load lookups', err);
      } finally {
        setLoadingLookups(false);
      }
    }
    loadLookups();
  }, []);

  // 2. Fetch Active Tab List Data
  const loadData = useCallback(
    async (pageNumber = meta.page) => {
      setIsLoading(true);
      setFeedback(null);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set('page', pageNumber.toString());
        queryParams.set('limit', '20');

        if (searchQuery.trim()) queryParams.set('search', searchQuery.trim());
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
          if (yearFilter !== 'ALL') queryParams.set('academic_year_id', yearFilter);
          endpoint = `/admin/discounts?${queryParams.toString()}`;
        }

        const res: any = await apiClient.get(endpoint);
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setItems(list);

        if (res?.meta) {
          setMeta({
            total: res.meta.total || list.length,
            page: res.meta.page || pageNumber,
            limit: res.meta.limit || 20,
            pages: res.meta.pages || Math.ceil((res.meta.total || list.length) / 20) || 1,
          });
        } else {
          setMeta((prev) => ({ ...prev, total: list.length, page: pageNumber, pages: 1 }));
        }
      } catch (err: any) {
        console.error('Failed to load codes data', err);
        setFeedback({
          type: 'error',
          message: err?.message || 'تعذر تحميل قائمة الأكواد من الخادم. تأكد من اتصال السيرفر.',
        });
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab, searchQuery, statusFilter, yearFilter, discountTypeFilter, meta.page],
  );

  useEffect(() => {
    loadData(1);
  }, [activeTab, statusFilter, yearFilter, discountTypeFilter]);

  // Debounced Search Trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      loadData(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Copy Single Code
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Copy All Generated Codes
  const handleCopyAllGenerated = () => {
    if (!generatedBatch) return;
    const allText = generatedBatch.codes.map((c) => c.code || c.raw || c.raw_code || c.preview || c.code_preview).join('\n');
    navigator.clipboard.writeText(allText);
    setCopiedCode('ALL');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!generatedBatch) return;
    const rows = [['Code', 'Type', 'Target/Amount', 'Expiry Date']];
    generatedBatch.codes.forEach((c) => {
      rows.push([
        c.code || c.raw || c.raw_code || c.preview || c.code_preview || '',
        generatedBatch.type,
        generatedBatch.targetName || (generatedBatch.amount ? `${generatedBatch.amount} EGP` : ''),
        c.expires_at || '',
      ]);
    });
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${generatedBatch.title.replace(/\s+/g, '_')}_codes.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable A4 PDF Generator
  const handlePrintPDF = () => {
    if (!generatedBatch) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('يرجى السماح بالنوافذ المنبثقة لطباعة وتحميل ملف الـ PDF.');
      return;
    }

    const cardsHtml = generatedBatch.codes
      .map((item, idx) => {
        const codeStr = item.code || item.raw || item.raw_code || item.preview || item.code_preview;
        const targetLabel = generatedBatch.targetName || (generatedBatch.amount ? `${generatedBatch.amount} ج.م` : '');
        const typeLabel =
          generatedBatch.type === 'PACKAGE'
            ? 'كارت تفعيل باقة تعليمية'
            : generatedBatch.type === 'COURSE'
            ? 'كارت تفعيل كورس دراسي'
            : generatedBatch.type === 'WALLET'
            ? `كارت شحن محفظة (${generatedBatch.amount} ج.م)`
            : 'كوبون خصم معتمد';

        return `
        <div class="voucher-card">
          <div class="card-header">
            <div class="brand-ar">منصة مستر عمر مكاوي</div>
            <div class="brand-en">Mr. Omar Meckawy Platform</div>
          </div>
          <div class="card-body">
            <div class="voucher-badge">${typeLabel}</div>
            ${targetLabel ? `<div class="target-title">${targetLabel}</div>` : ''}
            <div class="code-container">
              <div class="code-label">كود التفعيل / الشحن:</div>
              <div class="code-value">${codeStr}</div>
            </div>
            <div class="help-text">قم بإدخال هذا الكود في منصة مستر عمر مكاوي للاستفادة فوراً</div>
          </div>
          <div class="card-footer">
            <span>🌐 omarmeckawy.com</span>
            <span>كارت #${idx + 1}</span>
          </div>
        </div>
      `;
      })
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>${generatedBatch.title} - منصة مستر عمر مكاوي</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800;900&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Cairo', sans-serif;
            background: #ffffff;
            color: #111827;
            padding: 8mm;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 6mm;
          }
          .voucher-card {
            border: 2px dashed #059669;
            border-radius: 12px;
            padding: 12px 14px;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            page-break-inside: avoid;
            height: 66mm;
          }
          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1.5px solid #059669;
            padding-bottom: 5px;
          }
          .brand-ar {
            font-weight: 900;
            font-size: 13px;
            color: #065f46;
          }
          .brand-en {
            font-size: 10px;
            font-weight: 700;
            color: #6b7280;
            direction: ltr;
          }
          .card-body {
            text-align: center;
            margin: 4px 0;
          }
          .voucher-badge {
            display: inline-block;
            font-size: 10.5px;
            font-weight: 800;
            color: #047857;
            background: #ecfdf5;
            padding: 2px 8px;
            border-radius: 6px;
            margin-bottom: 2px;
          }
          .target-title {
            font-size: 12px;
            font-weight: 900;
            color: #111827;
            margin: 2px 0 4px 0;
          }
          .code-container {
            background: #f0fdf4;
            border: 1.5px solid #a7f3d0;
            border-radius: 8px;
            padding: 6px;
            margin: 4px 0;
          }
          .code-label {
            font-size: 9px;
            font-weight: 700;
            color: #065f46;
          }
          .code-value {
            font-family: 'Courier New', Courier, monospace;
            font-size: 16px;
            font-weight: 900;
            letter-spacing: 1.5px;
            color: #047857;
          }
          .help-text {
            font-size: 8.5px;
            color: #6b7280;
            font-weight: 600;
          }
          .card-footer {
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            font-weight: 700;
            color: #9ca3af;
            border-top: 1px solid #f3f4f6;
            padding-top: 4px;
          }
          @media print {
            body { padding: 4mm; }
            .grid { gap: 4mm; }
            .voucher-card { height: 65mm; }
          }
        </style>
      </head>
      <body>
        <div class="grid">
          ${cardsHtml}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 300);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // 3. Disable Action
  const handleDisableItem = (item: any) => {
    let endpoint = '';
    let itemLabel = '';

    if (activeTab === 'packages' || activeTab === 'courses') {
      endpoint = `/admin/activation-codes/${item.id}/disable`;
      itemLabel = `كود التفعيل (${item.code_preview})`;
    } else if (activeTab === 'wallet') {
      endpoint = `/admin/recharge-codes/${item.id}/disable`;
      itemLabel = `كارت الشحن (${item.code_preview})`;
    } else if (activeTab === 'discounts') {
      endpoint = `/admin/discounts/${item.id}/disable`;
      itemLabel = `كوبون الخصم (${item.code_preview})`;
    }

    setConfirmSummary(`هل أنت متأكد من رغبتك في تعطيل وإلغاء صلاحية ${itemLabel}؟ لن يتمكن أي طالب من استخدامه بعد الآن.`);
    setPendingAction(() => async () => {
      setIsSubmitting(true);
      try {
        await apiClient.patch(endpoint);
        setFeedback({ type: 'success', message: 'تم تعطيل الكود بنجاح' });
        loadData();
      } catch (err: any) {
        setFeedback({ type: 'error', message: err?.message || 'فشل في تعطيل الكود' });
      } finally {
        setIsSubmitting(false);
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  // 4. Form Submit Triggers
  const triggerGeneratePackages = () => {
    const pkgObj = packagesList.find((p) => p.id === pkgTargetId);
    if (!pkgObj) {
      setFeedback({ type: 'error', message: 'يرجى اختيار الباقة المراد توليد الأكواد لها' });
      return;
    }
    const countNum = parseInt(pkgCount, 10) || 1;
    const usesNum = parseInt(pkgMaxUses, 10) || 1;

    setConfirmSummary(`سيتم إنشاء عدد (${countNum}) كود تفعيل للباقة: "${pkgObj.title_ar || pkgObj.title}"، وكل كود صالح للاستخدام حتى (${usesNum}) مرات.`);
    setPendingAction(() => async () => {
      setIsSubmitting(true);
      try {
        const payload: any = {
          type: 'PACKAGE',
          target_id: pkgTargetId,
          count: countNum,
          max_uses: usesNum,
          expires_at: new Date(pkgExpiresAt).toISOString(),
        };
        if (pkgObj.academic_year_id && pkgObj.academic_year_id.length === 36) {
          payload.academic_year_id = pkgObj.academic_year_id;
        }

        const res: any = await apiClient.post('/admin/activation-codes/generate', payload);
        const codesList = res?.codes || res?.data || [];
        setModalType(null);
        setShowConfirmModal(false);
        setGeneratedBatch({
          title: `أكواد تفعيل (${pkgObj.title_ar || pkgObj.title})`,
          type: 'PACKAGE',
          targetName: pkgObj.title_ar || pkgObj.title,
          codes: codesList,
        });
        loadData(1);
      } catch (err: any) {
        setFeedback({ type: 'error', message: err?.message || 'فشل في توليد الأكواد من السيرفر' });
      } finally {
        setIsSubmitting(false);
      }
    });
    setShowConfirmModal(true);
  };

  const triggerGenerateCourses = () => {
    const courseObj = coursesList.find((c) => c.id === courseTargetId);
    if (!courseObj) {
      setFeedback({ type: 'error', message: 'يرجى اختيار الكورس المراد توليد الأكواد له' });
      return;
    }
    const countNum = parseInt(courseCount, 10) || 1;
    const usesNum = parseInt(courseMaxUses, 10) || 1;

    setConfirmSummary(`سيتم إنشاء عدد (${countNum}) كود تفعيل للكورس: "${courseObj.title_ar || courseObj.title}"، وكل كود صالح للاستخدام حتى (${usesNum}) مرات.`);
    setPendingAction(() => async () => {
      setIsSubmitting(true);
      try {
        const payload: any = {
          type: 'COURSE',
          target_id: courseTargetId,
          count: countNum,
          max_uses: usesNum,
          expires_at: new Date(courseExpiresAt).toISOString(),
        };
        if (courseObj.academic_year_id && courseObj.academic_year_id.length === 36) {
          payload.academic_year_id = courseObj.academic_year_id;
        }

        const res: any = await apiClient.post('/admin/activation-codes/generate', payload);
        const codesList = res?.codes || res?.data || [];
        setModalType(null);
        setShowConfirmModal(false);
        setGeneratedBatch({
          title: `أكواد تفعيل (${courseObj.title_ar || courseObj.title})`,
          type: 'COURSE',
          targetName: courseObj.title_ar || courseObj.title,
          codes: codesList,
        });
        loadData(1);
      } catch (err: any) {
        setFeedback({ type: 'error', message: err?.message || 'فشل في توليد الأكواد من السيرفر' });
      } finally {
        setIsSubmitting(false);
      }
    });
    setShowConfirmModal(true);
  };

  const triggerGenerateWallet = () => {
    const amountNum = parseFloat(rechargeAmount);
    if (!amountNum || amountNum <= 0) {
      setFeedback({ type: 'error', message: 'يرجى إدخال قيمة صحيحة وموجبة للكارت' });
      return;
    }
    const countNum = parseInt(rechargeCount, 10) || 1;

    setConfirmSummary(`سيتم إنشاء عدد (${countNum}) كارت شحن محفظة بقيمة (${amountNum} ج.م) لكل كارت.`);
    setPendingAction(() => async () => {
      setIsSubmitting(true);
      try {
        const payload = {
          amount: amountNum,
          count: countNum,
          expires_at: new Date(rechargeExpiresAt).toISOString(),
        };

        const res: any = await apiClient.post('/admin/recharge-codes/generate', payload);
        const codesList = res?.codes || res?.data || [];
        setModalType(null);
        setShowConfirmModal(false);
        setGeneratedBatch({
          title: `كروت شحن محفظة (فئة ${amountNum} ج.م)`,
          type: 'WALLET',
          amount: amountNum,
          codes: codesList,
        });
        loadData(1);
      } catch (err: any) {
        setFeedback({ type: 'error', message: err?.message || 'فشل في توليد كروت الشحن من السيرفر' });
      } finally {
        setIsSubmitting(false);
      }
    });
    setShowConfirmModal(true);
  };

  const triggerCreateSingleDiscount = () => {
    if (!singleDiscCode.trim()) {
      setFeedback({ type: 'error', message: 'يرجى كتابة رمز الكوبون أو الضغط على توليد تلقائي' });
      return;
    }
    const valNum = parseFloat(singleDiscValue);
    if (!valNum || valNum <= 0) {
      setFeedback({ type: 'error', message: 'يرجى إدخال قيمة خصم صالحة' });
      return;
    }

    setConfirmSummary(`سيتم إنشاء الكوبون (${singleDiscCode.trim().toUpperCase()}) بخصم ${valNum}${singleDiscType === 'PERCENTAGE' ? '%' : ' ج.م'}.`);
    setPendingAction(() => async () => {
      setIsSubmitting(true);
      try {
        const payload: any = {
          code: singleDiscCode.trim().toUpperCase(),
          discount_type: singleDiscType,
          discount_value: valNum,
          min_order_amount: parseFloat(singleDiscMinOrder) || 0,
          max_uses: parseInt(singleDiscMaxUses, 10) || 1,
          starts_at: new Date(singleDiscStartsAt).toISOString(),
          expires_at: new Date(singleDiscExpiresAt).toISOString(),
          target_type: singleDiscScope,
          target_id: singleDiscScope !== 'ALL' && singleDiscTargetId ? singleDiscTargetId : undefined,
        };

        const res: any = await apiClient.post('/admin/discounts', payload);
        setModalType(null);
        setShowConfirmModal(false);
        setFeedback({ type: 'success', message: 'تم إنشاء كوبون الخصم بنجاح' });
        loadData(1);
      } catch (err: any) {
        setFeedback({ type: 'error', message: err?.message || 'فشل في إنشاء الكوبون' });
      } finally {
        setIsSubmitting(false);
      }
    });
    setShowConfirmModal(true);
  };

  const triggerGenerateBulkDiscounts = () => {
    const valNum = parseFloat(bulkDiscValue);
    if (!valNum || valNum <= 0) {
      setFeedback({ type: 'error', message: 'يرجى إدخال قيمة خصم صالحة' });
      return;
    }
    const countNum = parseInt(bulkDiscCount, 10) || 1;

    setConfirmSummary(`سيتم توليد عدد (${countNum}) كوبون خصم فريد بقيمة ${valNum}${bulkDiscType === 'PERCENTAGE' ? '%' : ' ج.م'}.`);
    setPendingAction(() => async () => {
      setIsSubmitting(true);
      try {
        const payload: any = {
          discount_type: bulkDiscType,
          discount_value: valNum,
          count: countNum,
          max_uses: parseInt(bulkDiscMaxUses, 10) || 1,
          starts_at: new Date(bulkDiscStartsAt).toISOString(),
          expires_at: new Date(bulkDiscExpiresAt).toISOString(),
          target_type: bulkDiscScope,
          target_id: bulkDiscScope !== 'ALL' && bulkDiscTargetId ? bulkDiscTargetId : undefined,
        };

        const res: any = await apiClient.post('/admin/discounts/generate', payload);
        const codesList = res?.codes || res?.data || [];
        setModalType(null);
        setShowConfirmModal(false);
        setGeneratedBatch({
          title: `حزمة كوبونات خصم (${valNum}${bulkDiscType === 'PERCENTAGE' ? '%' : ' ج.م'})`,
          type: 'DISCOUNT',
          amount: valNum,
          codes: codesList,
        });
        loadData(1);
      } catch (err: any) {
        setFeedback({ type: 'error', message: err?.message || 'فشل في توليد الكوبونات من السيرفر' });
      } finally {
        setIsSubmitting(false);
      }
    });
    setShowConfirmModal(true);
  };

  const handleAutoGenerateSingleCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let part1 = '';
    let part2 = '';
    for (let i = 0; i < 4; i++) part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    for (let i = 0; i < 4; i++) part2 += chars.charAt(Math.floor(Math.random() * chars.length));
    setSingleDiscCode(`OMR-${part1}-${part2}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 shadow-xs">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                إدارة أكواد التفعيل والشحن
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                توليد وإدارة أكواد الباقات، الكورسات، كروت الشحن، وكوبونات الخصم والطباعة
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadData()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:bg-neutral-850 hover:text-white transition-all shadow-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            <span>تحديث القائمة</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl text-xs font-bold border transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-300'
              : 'bg-red-950/50 border-red-800/80 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-neutral-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTab('packages')}
          className={`flex items-center gap-3 p-3.5 rounded-2xl border text-start transition-all ${
            activeTab === 'packages'
              ? 'bg-emerald-950/70 border-emerald-600 text-white shadow-md shadow-emerald-950/40'
              : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
          }`}
        >
          <div className={`p-2.5 rounded-xl ${activeTab === 'packages' ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
            <PackageIcon className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs font-bold">أكواد الباقات</span>
            <span className="text-[10px] text-neutral-400">تفعيل اشتراكات الباقات</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-3 p-3.5 rounded-2xl border text-start transition-all ${
            activeTab === 'courses'
              ? 'bg-emerald-950/70 border-emerald-600 text-white shadow-md shadow-emerald-950/40'
              : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
          }`}
        >
          <div className={`p-2.5 rounded-xl ${activeTab === 'courses' ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs font-bold">أكواد الكورسات</span>
            <span className="text-[10px] text-neutral-400">تفعيل الكورسات والمحاضرات</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex items-center gap-3 p-3.5 rounded-2xl border text-start transition-all ${
            activeTab === 'wallet'
              ? 'bg-emerald-950/70 border-emerald-600 text-white shadow-md shadow-emerald-950/40'
              : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
          }`}
        >
          <div className={`p-2.5 rounded-xl ${activeTab === 'wallet' ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs font-bold">كروت شحن المحفظة</span>
            <span className="text-[10px] text-neutral-400">شحن الرصيد النقدي</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('discounts')}
          className={`flex items-center gap-3 p-3.5 rounded-2xl border text-start transition-all ${
            activeTab === 'discounts'
              ? 'bg-emerald-950/70 border-emerald-600 text-white shadow-md shadow-emerald-950/40'
              : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
          }`}
        >
          <div className={`p-2.5 rounded-xl ${activeTab === 'discounts' ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
            <Percent className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xs font-bold">كوبونات الخصم</span>
            <span className="text-[10px] text-neutral-400">نسب ومبالغ التخفيض</span>
          </div>
        </button>
      </div>

      {/* Action Toolbar & Search Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-neutral-900/90 p-4 rounded-2xl border border-neutral-800">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث برمز الكود أو اسم المستهدف أو الطالب..."
              className="w-full ps-9 pe-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-medium text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-medium text-neutral-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="ACTIVE">نشط (متاح للاستخدام)</option>
            <option value="USED">مستخدم / مستنفد</option>
            <option value="DISABLED">معطل / ملغي</option>
          </select>

          {/* Academic Year Filter for Academic Tabs */}
          {(activeTab === 'packages' || activeTab === 'courses' || activeTab === 'discounts') && (
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-medium text-neutral-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">جميع المراحل الدراسية</option>
              {academicYears.map((yr) => (
                <option key={yr.id} value={yr.id}>
                  {yr.name_ar || yr.name_en}
                </option>
              ))}
            </select>
          )}

          {/* Discount Type Filter */}
          {activeTab === 'discounts' && (
            <select
              value={discountTypeFilter}
              onChange={(e) => setDiscountTypeFilter(e.target.value)}
              className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-medium text-neutral-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">جميع أنواع الخصم</option>
              <option value="PERCENTAGE">نسبة مئوية (%)</option>
              <option value="FIXED_AMOUNT">مبلغ ثابت (ج.م)</option>
            </select>
          )}
        </div>

        {/* Tab-Specific Top Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {activeTab === 'packages' && (
            <button
              onClick={() => setModalType('PACKAGE')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/40"
            >
              <Plus className="h-4 w-4" />
              <span>توليد أكواد باقة</span>
            </button>
          )}

          {activeTab === 'courses' && (
            <button
              onClick={() => setModalType('COURSE')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/40"
            >
              <Plus className="h-4 w-4" />
              <span>توليد أكواد كورس</span>
            </button>
          )}

          {activeTab === 'wallet' && (
            <button
              onClick={() => setModalType('WALLET')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/40"
            >
              <Plus className="h-4 w-4" />
              <span>توليد كروت شحن</span>
            </button>
          )}

          {activeTab === 'discounts' && (
            <>
              <button
                onClick={() => setModalType('SINGLE_DISCOUNT')}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-750 text-white rounded-xl text-xs font-bold transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>إنشاء كوبون فردي</span>
              </button>
              <button
                onClick={() => setModalType('BULK_DISCOUNT')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/40"
              >
                <Sparkles className="h-4 w-4" />
                <span>توليد حزمة كوبونات</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Table Data */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-neutral-400">جاري استدعاء قائمة الأكواد من قاعدة البيانات...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Ticket className="h-10 w-10 text-neutral-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">لا توجد أكواد مطابقة حالياً</h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              لم يتم العثور على أي نتائج تطابق خيارات البحث والفلترة المحددة. يمكنك توليد أكواد جديدة بالضغط على الأزرار بالأعلى.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 text-start">رمز الكود المعاين</th>
                  {activeTab === 'packages' && <th className="py-3.5 px-4 text-start">الباقة المستهدفة</th>}
                  {activeTab === 'courses' && <th className="py-3.5 px-4 text-start">الكورس المستهدف</th>}
                  {activeTab === 'wallet' && <th className="py-3.5 px-4 text-start">قيمة الشحن</th>}
                  {activeTab === 'wallet' && <th className="py-3.5 px-4 text-start">الطالب المستخدم</th>}
                  {activeTab === 'discounts' && <th className="py-3.5 px-4 text-start">نوع وقيمة الخصم</th>}
                  {activeTab === 'discounts' && <th className="py-3.5 px-4 text-start">نطاق الكوبون</th>}
                  {activeTab !== 'wallet' && <th className="py-3.5 px-4 text-start">مرات الاستخدام</th>}
                  <th className="py-3.5 px-4 text-start">الحالة</th>
                  <th className="py-3.5 px-4 text-start">تاريخ الانتهاء</th>
                  <th className="py-3.5 px-4 text-start">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-medium">
                {items.map((row) => {
                  const isExhausted = row.used_count >= row.max_uses;
                  const isActive = row.status === 'ACTIVE' && !isExhausted;
                  const isUsed = row.status === 'USED' || isExhausted;
                  const isDisabled = row.status === 'DISABLED';

                  return (
                    <tr key={row.id} className="hover:bg-neutral-850/50 transition-colors">
                      {/* Code Preview & Copy */}
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span className="bg-neutral-950 px-2 py-1 rounded-md border border-neutral-800 text-emerald-400">
                            {row.code_preview}
                          </span>
                          <button
                            onClick={() => handleCopy(row.code_preview)}
                            title="نسخ المعاينة"
                            className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800"
                          >
                            {copiedCode === row.code_preview ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Package / Course Target */}
                      {(activeTab === 'packages' || activeTab === 'courses') && (
                        <td className="py-3 px-4">
                          <div className="font-bold text-white truncate max-w-[220px]">
                            {row.target_title || 'محتوى دراسي'}
                          </div>
                          {row.academic_year_name_ar && (
                            <span className="text-[10px] text-neutral-400 block">{row.academic_year_name_ar}</span>
                          )}
                        </td>
                      )}

                      {/* Wallet Amount & User */}
                      {activeTab === 'wallet' && (
                        <td className="py-3 px-4 font-bold text-emerald-400">
                          {parseFloat(row.amount).toLocaleString()} ج.م
                        </td>
                      )}
                      {activeTab === 'wallet' && (
                        <td className="py-3 px-4">
                          {row.used_by_name ? (
                            <div>
                              <span className="font-bold text-white block">{row.used_by_name}</span>
                              <span className="text-[10px] text-neutral-400 font-mono">{row.used_by_phone}</span>
                            </div>
                          ) : (
                            <span className="text-neutral-500 font-medium">غير مستخدم بعد</span>
                          )}
                        </td>
                      )}

                      {/* Discount Type & Scope */}
                      {activeTab === 'discounts' && (
                        <td className="py-3 px-4 font-bold text-white">
                          <span className="bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-800/60 font-mono text-xs">
                            {row.discount_value} {row.discount_type === 'PERCENTAGE' ? '%' : 'ج.م'}
                          </span>
                        </td>
                      )}
                      {activeTab === 'discounts' && (
                        <td className="py-3 px-4 text-neutral-300">
                          <span className="font-semibold">{row.target_title || 'جميع المنصة'}</span>
                        </td>
                      )}

                      {/* Usage Count (For non-wallet) */}
                      {activeTab !== 'wallet' && (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white font-mono">
                              {row.used_count} / {row.max_uses}
                            </span>
                            <div className="w-16 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                              <div
                                style={{ width: `${Math.min(100, Math.round((row.used_count / row.max_uses) * 100))}%` }}
                                className={`h-full ${isExhausted ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              />
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Status Badge */}
                      <td className="py-3 px-4">
                        {isActive && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>متاح للاستخدام</span>
                          </span>
                        )}
                        {isUsed && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800/80">
                            <Clock className="h-3 w-3" />
                            <span>مستنفد</span>
                          </span>
                        )}
                        {isDisabled && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-950/80 text-red-300 border border-red-800/80">
                            <XCircle className="h-3 w-3" />
                            <span>معطل</span>
                          </span>
                        )}
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3 px-4 text-neutral-400 font-mono text-[11px]">
                        {new Date(row.expires_at).toLocaleDateString('ar-EG')}
                      </td>

                      {/* Action Menu */}
                      <td className="py-3 px-4">
                        {isActive && (
                          <button
                            onClick={() => handleDisableItem(row)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/40 text-red-400 border border-red-900/40 hover:bg-red-900/60 transition-colors text-[11px] font-semibold"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>تعطيل</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {meta.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-950/80 border-t border-neutral-800 text-xs">
            <span className="text-neutral-400">
              إجمالي النتائج: <strong className="text-white">{meta.total}</strong> كود (صفحة {meta.page} من {meta.pages})
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={meta.page <= 1}
                onClick={() => loadData(meta.page - 1)}
                className="p-1.5 rounded-lg border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                disabled={meta.page >= meta.pages}
                onClick={() => loadData(meta.page + 1)}
                className="p-1.5 rounded-lg border border-neutral-800 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal 1: Generate Package Codes */}
      {modalType === 'PACKAGE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PackageIcon className="h-4 w-4 text-emerald-400" />
                <span>توليد أكواد تفعيل باقة</span>
              </h3>
              <button onClick={() => setModalType(null)} className="text-neutral-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">اختيار الباقة المستهدفة</label>
                {packagesList.length === 0 ? (
                  <p className="text-xs text-amber-400">لا توجد باقات متاحة حالياً على المنصة</p>
                ) : (
                  <select
                    value={pkgTargetId}
                    onChange={(e) => setPkgTargetId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                  >
                    {packagesList.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.title_ar || pkg.title} ({pkg.price} ج.م)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">عدد الأكواد (حتى 1000)</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={pkgCount}
                    onChange={(e) => setPkgCount(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">مرات استخدام كل كود</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={pkgMaxUses}
                    onChange={(e) => setPkgMaxUses(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">تاريخ انتهاء الصلاحية</label>
                <input
                  type="date"
                  value={pkgExpiresAt}
                  onChange={(e) => setPkgExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={triggerGeneratePackages}
                disabled={packagesList.length === 0}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40"
              >
                تأكيد ومتابعة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Generate Course Codes */}
      {modalType === 'COURSE' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                <span>توليد أكواد تفعيل كورس</span>
              </h3>
              <button onClick={() => setModalType(null)} className="text-neutral-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">اختيار الكورس المستهدف</label>
                {coursesList.length === 0 ? (
                  <p className="text-xs text-amber-400">لا توجد كورسات متاحة حالياً على المنصة</p>
                ) : (
                  <select
                    value={courseTargetId}
                    onChange={(e) => setCourseTargetId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                  >
                    {coursesList.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title_ar || course.title} ({course.price} ج.م)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">عدد الأكواد (حتى 1000)</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={courseCount}
                    onChange={(e) => setCourseCount(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1.5">مرات استخدام كل كود</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={courseMaxUses}
                    onChange={(e) => setCourseMaxUses(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">تاريخ انتهاء الصلاحية</label>
                <input
                  type="date"
                  value={courseExpiresAt}
                  onChange={(e) => setCourseExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={triggerGenerateCourses}
                disabled={coursesList.length === 0}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40"
              >
                تأكيد ومتابعة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Generate Wallet Recharge Cards */}
      {modalType === 'WALLET' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wallet className="h-4 w-4 text-emerald-400" />
                <span>توليد كروت شحن المحفظة</span>
              </h3>
              <button onClick={() => setModalType(null)} className="text-neutral-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">قيمة الكارت (بالجنيه المصري)</label>
                <div className="flex items-center gap-2 mb-2">
                  {['50', '100', '200', '500'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRechargeAmount(preset)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        rechargeAmount === preset
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      {preset} ج.م
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  placeholder="أو أدخل قيمة مخصصة..."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">عدد الكروت (حتى 1000)</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={rechargeCount}
                  onChange={(e) => setRechargeCount(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">تاريخ انتهاء الصلاحية</label>
                <input
                  type="date"
                  value={rechargeExpiresAt}
                  onChange={(e) => setRechargeExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={triggerGenerateWallet}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40"
              >
                تأكيد ومتابعة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Create Single Discount Coupon */}
      {modalType === 'SINGLE_DISCOUNT' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Percent className="h-4 w-4 text-emerald-400" />
                <span>إنشاء كوبون خصم فردي</span>
              </h3>
              <button onClick={() => setModalType(null)} className="text-neutral-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-neutral-300">رمز الكوبون</label>
                  <button
                    type="button"
                    onClick={handleAutoGenerateSingleCode}
                    className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>توليد تلقائي</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={singleDiscCode}
                  onChange={(e) => setSingleDiscCode(e.target.value.toUpperCase())}
                  placeholder="مثال: OMAR20 أو EID50"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500 uppercase tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">نوع الخصم</label>
                  <select
                    value={singleDiscType}
                    onChange={(e: any) => setSingleDiscType(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="PERCENTAGE">نسبة مئوية (%)</option>
                    <option value="FIXED_AMOUNT">مبلغ ثابت (ج.م)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    قيمة الخصم {singleDiscType === 'PERCENTAGE' ? '(%)' : '(ج.م)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={singleDiscType === 'PERCENTAGE' ? '100' : '10000'}
                    value={singleDiscValue}
                    onChange={(e) => setSingleDiscValue(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">نطاق تطبيق الكوبون</label>
                <select
                  value={singleDiscScope}
                  onChange={(e: any) => setSingleDiscScope(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">جميع المنصة (كل الباقات والكورسات)</option>
                  <option value="PACKAGE">باقة محددة</option>
                  <option value="COURSE">كورس محدد</option>
                </select>
              </div>

              {singleDiscScope === 'PACKAGE' && (
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">اختيار الباقة</label>
                  <select
                    value={singleDiscTargetId}
                    onChange={(e) => setSingleDiscTargetId(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- اختر الباقة --</option>
                    {packagesList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title_ar || p.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {singleDiscScope === 'COURSE' && (
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">اختيار الكورس</label>
                  <select
                    value={singleDiscTargetId}
                    onChange={(e) => setSingleDiscTargetId(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- اختر الكورس --</option>
                    {coursesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title_ar || c.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">أقصى مرات استخدام</label>
                  <input
                    type="number"
                    min="1"
                    value={singleDiscMaxUses}
                    onChange={(e) => setSingleDiscMaxUses(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">تاريخ الانتهاء</label>
                  <input
                    type="date"
                    value={singleDiscExpiresAt}
                    onChange={(e) => setSingleDiscExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={triggerCreateSingleDiscount}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40"
              >
                إنشاء الكوبون
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Generate Bulk Discount Coupons */}
      {modalType === 'BULK_DISCOUNT' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span>توليد حزمة كوبونات فريدة</span>
              </h3>
              <button onClick={() => setModalType(null)} className="text-neutral-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">نوع الخصم</label>
                  <select
                    value={bulkDiscType}
                    onChange={(e: any) => setBulkDiscType(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="PERCENTAGE">نسبة مئوية (%)</option>
                    <option value="FIXED_AMOUNT">مبلغ ثابت (ج.م)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    قيمة الخصم {bulkDiscType === 'PERCENTAGE' ? '(%)' : '(ج.م)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={bulkDiscType === 'PERCENTAGE' ? '100' : '10000'}
                    value={bulkDiscValue}
                    onChange={(e) => setBulkDiscValue(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">عدد الكوبونات (حتى 1000)</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={bulkDiscCount}
                    onChange={(e) => setBulkDiscCount(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">مرات استخدام كل كود</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={bulkDiscMaxUses}
                    onChange={(e) => setBulkDiscMaxUses(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">نطاق تطبيق الكوبونات</label>
                <select
                  value={bulkDiscScope}
                  onChange={(e: any) => setBulkDiscScope(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">جميع المنصة (كل الباقات والكورسات)</option>
                  <option value="PACKAGE">باقة محددة</option>
                  <option value="COURSE">كورس محدد</option>
                </select>
              </div>

              {bulkDiscScope === 'PACKAGE' && (
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">اختيار الباقة</label>
                  <select
                    value={bulkDiscTargetId}
                    onChange={(e) => setBulkDiscTargetId(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- اختر الباقة --</option>
                    {packagesList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title_ar || p.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {bulkDiscScope === 'COURSE' && (
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">اختيار الكورس</label>
                  <select
                    value={bulkDiscTargetId}
                    onChange={(e) => setBulkDiscTargetId(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- اختر الكورس --</option>
                    {coursesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title_ar || c.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">تاريخ انتهاء الصلاحية</label>
                <input
                  type="date"
                  value={bulkDiscExpiresAt}
                  onChange={(e) => setBulkDiscExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={triggerGenerateBulkDiscounts}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40"
              >
                توليد الكوبونات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-950/80 text-amber-400 border border-amber-800/80 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">تأكيد تنفيذ العملية</h4>
                <p className="text-xs text-neutral-400 mt-0.5">يرجى مراجعة التفاصيل قبل المتابعة</p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-neutral-300 bg-neutral-950 p-3.5 rounded-xl border border-neutral-800">
              {confirmSummary}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:text-white text-xs font-bold disabled:opacity-50"
              >
                تراجع
              </button>
              <button
                onClick={() => pendingAction && pendingAction()}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>تأكيد الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Batch Results Drawer / Modal */}
      {generatedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col p-6 space-y-5 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-base font-bold text-white">{generatedBatch.title}</h3>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  تم إنشاء عدد <strong className="text-emerald-400">{generatedBatch.codes.length}</strong> كود بنجاح عبر السيرفر.
                </p>
              </div>

              {/* Action Buttons: Copy All, CSV, PDF */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyAllGenerated}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-750 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  {copiedCode === 'ALL' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedCode === 'ALL' ? 'تم النسخ!' : 'نسخ الكل'}</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-750 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  <Download className="h-4 w-4 text-emerald-400" />
                  <span>تصدير CSV</span>
                </button>

                <button
                  onClick={handlePrintPDF}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/40"
                >
                  <Printer className="h-4 w-4" />
                  <span>طباعة كروت PDF</span>
                </button>

                <button onClick={() => setGeneratedBatch(null)} className="p-2 text-neutral-400 hover:text-white rounded-xl">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Codes Grid */}
            <div className="flex-1 overflow-y-auto max-h-[55vh] p-3 bg-neutral-950 rounded-xl border border-neutral-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {generatedBatch.codes.map((item, idx) => {
                  const codeStr = item.code || item.raw || item.raw_code || item.preview || item.code_preview || '';
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-neutral-900 border border-neutral-800/80 hover:border-emerald-600/60 transition-all group"
                    >
                      <div className="truncate">
                        <span className="text-[10px] text-neutral-500 block font-mono">#{idx + 1}</span>
                        <span className="font-mono font-bold text-xs text-emerald-400 tracking-wider truncate block">
                          {codeStr}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(codeStr)}
                        title="نسخ الكود"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 shrink-0"
                      >
                        {copiedCode === codeStr ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs text-neutral-400">
              <span>⚠️ تنبيه: يتم عرض الأكواد الخام مرة واحدة فقط لأسباب أمنية. يرجى نسخها أو تحميل الـ PDF الآن.</span>
              <button
                onClick={() => setGeneratedBatch(null)}
                className="px-4 py-1.5 bg-neutral-800 text-white rounded-lg font-bold hover:bg-neutral-700"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
