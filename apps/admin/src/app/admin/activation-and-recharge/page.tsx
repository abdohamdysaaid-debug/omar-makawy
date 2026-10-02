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
  Package,
  BookOpen,
  Percent,
  Coins,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Printer,
  FileText,
  QrCode,
  ArrowDownToLine,
  Eye,
} from 'lucide-react';

type TabType = 'packages' | 'courses' | 'wallet' | 'discounts';

export default function ActivationAndRechargePage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('packages');

  // Academic Years, Courses, Packages for Select dropdowns
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [packagesList, setPackagesList] = useState<any[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(true);

  // Table Data & Loading
  const [activationCodes, setActivationCodes] = useState<any[]>([]);
  const [discountCodes, setDiscountCodes] = useState<any[]>([]);
  const [rechargeCodes, setRechargeCodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Copy state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Generation Modal States
  const [showGenModal, setShowGenModal] = useState(false);
  const [genLoading, setGenLoading] = useState(false);

  // Form State: Package Activation
  const [pkgTargetId, setPkgTargetId] = useState('');
  const [pkgAcademicYearId, setPkgAcademicYearId] = useState('');
  const [pkgCount, setPkgCount] = useState(50);
  const [pkgMaxUses, setPkgMaxUses] = useState(1);
  const [pkgExpiresAt, setPkgExpiresAt] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });

  // Form State: Course Activation
  const [courseTargetId, setCourseTargetId] = useState('');
  const [courseAcademicYearId, setCourseAcademicYearId] = useState('');
  const [courseCount, setCourseCount] = useState(50);
  const [courseMaxUses, setCourseMaxUses] = useState(1);
  const [courseExpiresAt, setCourseExpiresAt] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });

  // Form State: Discount Coupon
  const [discCode, setDiscCode] = useState('');
  const [discType, setDiscType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [discValue, setDiscValue] = useState(50); // 50% or 50 EGP
  const [discScope, setDiscScope] = useState<'ALL' | 'PACKAGE' | 'COURSE'>('ALL');
  const [discTargetId, setDiscTargetId] = useState('');
  const [discMaxUses, setDiscMaxUses] = useState(500);
  const [discExpiresAt, setDiscExpiresAt] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });

  // Form State: Wallet Recharge
  const [rechargeAmount, setRechargeAmount] = useState(100);
  const [rechargeCount, setRechargeCount] = useState(50);
  const [rechargeExpiresAt, setRechargeExpiresAt] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });

  // Generated Batch Result Modal & Printable Cards View
  const [generatedBatch, setGeneratedBatch] = useState<{
    title: string;
    type: 'PACKAGE' | 'COURSE' | 'WALLET' | 'DISCOUNT';
    amount?: number;
    targetName?: string;
    codes: Array<{ code: string; [key: string]: any }>;
  } | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch lookups (academic years, courses, packages)
  useEffect(() => {
    async function loadLookups() {
      setLoadingLookups(true);
      try {
        const [yearsRes, coursesRes, pkgsRes] = await Promise.all([
          apiClient.get<any[]>('/auth/academic-years').catch(() => []),
          apiClient.get<any>('/courses/public?limit=100').catch(() => null),
          apiClient.get<any>('/packages/public?limit=100').catch(() => null),
        ]);

        const yList = Array.isArray(yearsRes) ? yearsRes : [];
        setAcademicYears(yList);

        const cList = Array.isArray(coursesRes?.data) ? coursesRes.data : Array.isArray(coursesRes) ? coursesRes : [];
        setCoursesList(cList);

        const pList = Array.isArray(pkgsRes?.data) ? pkgsRes.data : Array.isArray(pkgsRes) ? pkgsRes : [];
        setPackagesList(pList);

        if (yList.length > 0) {
          setPkgAcademicYearId(yList[0].id);
          setCourseAcademicYearId(yList[0].id);
        }
        if (pList.length > 0) setPkgTargetId(pList[0].id);
        if (cList.length > 0) setCourseTargetId(cList[0].id);
      } catch (e) {
        console.error('Error loading lookups', e);
      } finally {
        setLoadingLookups(false);
      }
    }
    loadLookups();
  }, []);

  // 2. Fetch Codes Data
  const loadCodes = useCallback(async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      if (activeTab === 'packages' || activeTab === 'courses') {
        const res: any = await apiClient.get<any>('/admin/activation-codes').catch(() => []);
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setActivationCodes(list);
      } else if (activeTab === 'wallet') {
        const res: any = await apiClient.get<any>('/admin/recharge-codes').catch(() => []);
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setRechargeCodes(list);
      } else if (activeTab === 'discounts') {
        const res: any = await apiClient.get<any>('/admin/discounts').catch(() => []);
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setDiscountCodes(list);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'تعذر تحميل قائمة الأكواد من الخادم' });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadCodes();
  }, [loadCodes]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCopyAllGenerated = () => {
    if (!generatedBatch) return;
    const allText = generatedBatch.codes.map((c) => c.code || c.raw_code || c).join('\n');
    navigator.clipboard.writeText(allText);
    setCopiedCode('ALL');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleExportCSV = () => {
    if (!generatedBatch) return;
    const rows = [['Code', 'Type', 'Target/Amount', 'Expiry']];
    generatedBatch.codes.forEach((c) => {
      rows.push([
        c.code || c.raw_code,
        generatedBatch.type,
        generatedBatch.targetName || generatedBatch.amount || '',
        c.expires_at || '',
      ]);
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${generatedBatch.title.replace(/\s+/g, '_')}_codes.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable PDF generator trigger
  const handlePrintPDF = () => {
    if (!generatedBatch) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('يرجى السماح بالنوافذ المنبثقة لطباعة وتحميل الـ PDF.');
      return;
    }

    const cardsHtml = generatedBatch.codes
      .map((item, idx) => {
        const codeStr = item.code || item.raw_code || item;
        const targetLabel = generatedBatch.targetName || (generatedBatch.amount ? `${generatedBatch.amount} ج.م` : '');
        const typeLabel =
          generatedBatch.type === 'PACKAGE'
            ? 'كارت تفعيل باقة شهرية'
            : generatedBatch.type === 'COURSE'
            ? 'كارت تفعيل كورس دراسي'
            : generatedBatch.type === 'WALLET'
            ? `كارت شحن رصيد محفظة (${generatedBatch.amount} ج.م)`
            : 'كوبون خصم معتمد';

        return `
        <div class="voucher-card">
          <div class="card-header">
            <div class="platform-title">منصة مستر عمر مكاوي</div>
            <div class="teacher-title">Mr. Omar Meckawy Platform</div>
          </div>
          <div class="card-body">
            <div class="voucher-type">${typeLabel}</div>
            ${targetLabel ? `<div class="target-name">${targetLabel}</div>` : ''}
            <div class="code-box">
              <div class="code-label">كود التفعيل / الشحن:</div>
              <div class="code-value">${codeStr}</div>
            </div>
            <div class="instructions">قم بإدخال الكود في خانة التفعيل بالموقع للاشتراك فوراً</div>
          </div>
          <div class="card-footer">
            <span>🌐 omarmeckawy.com</span>
            <span>رقم الكارت: #${idx + 1}</span>
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
        <title>${generatedBatch.title} - كروت التفعيل</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@600;800;900&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Cairo', sans-serif;
            background: #fff;
            color: #111;
            padding: 10mm;
          }
          .grid-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 6mm;
          }
          .voucher-card {
            border: 2px dashed #0d6e4f;
            border-radius: 12px;
            padding: 14px 16px;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
            page-break-inside: avoid;
            height: 68mm;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          .card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1.5px solid #0d6e4f;
            padding-bottom: 6px;
          }
          .platform-title {
            font-weight: 900;
            font-size: 13px;
            color: #0d6e4f;
          }
          .teacher-title {
            font-size: 10px;
            font-weight: 700;
            color: #666;
            direction: ltr;
          }
          .card-body {
            text-align: center;
            margin: 6px 0;
          }
          .voucher-type {
            font-size: 11px;
            font-weight: 800;
            color: #333;
          }
          .target-name {
            font-size: 12px;
            font-weight: 900;
            color: #0d6e4f;
            margin: 2px 0 6px 0;
          }
          .code-box {
            background: #f0fdf4;
            border: 1.5px solid #86efac;
            border-radius: 8px;
            padding: 6px;
            margin: 4px 0;
          }
          .code-label {
            font-size: 9px;
            font-weight: 700;
            color: #166534;
          }
          .code-value {
            font-family: monospace;
            font-size: 17px;
            font-weight: 900;
            letter-spacing: 1.5px;
            color: #0d6e4f;
          }
          .instructions {
            font-size: 9px;
            color: #555;
            font-weight: 600;
            margin-top: 4px;
          }
          .card-footer {
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            font-weight: 700;
            color: #777;
            border-top: 1px solid #e5e7eb;
            padding-top: 4px;
          }
          @media print {
            body { padding: 4mm; }
            .grid-container { gap: 4mm; }
            .voucher-card { height: 66mm; }
          }
        </style>
      </head>
      <body>
        <div class="grid-container">
          ${cardsHtml}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // 3. Handle Code Generation
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenLoading(true);
    setFeedback(null);

    try {
      if (activeTab === 'packages') {
        const pkgObj = packagesList.find((p) => p.id === pkgTargetId);
        const payload = {
          type: 'PACKAGE',
          target_id: pkgTargetId,
          academic_year_id: pkgAcademicYearId || pkgObj?.academic_year_id || academicYears[0]?.id,
          count: Number(pkgCount),
          max_uses: Number(pkgMaxUses),
          expires_at: new Date(pkgExpiresAt).toISOString(),
        };
        const res: any = await apiClient.post('/admin/activation-codes/generate', payload);
        const codesList = res?.codes || res?.data || [];
        setGeneratedBatch({
          title: `أكواد تفعيل الباقة (${pkgObj?.title_ar || 'باقة'})`,
          type: 'PACKAGE',
          targetName: pkgObj?.title_ar || pkgObj?.title,
          codes: codesList,
        });
      } else if (activeTab === 'courses') {
        const courseObj = coursesList.find((c) => c.id === courseTargetId);
        const payload = {
          type: 'COURSE',
          target_id: courseTargetId,
          academic_year_id: courseAcademicYearId || courseObj?.academic_year_id || academicYears[0]?.id,
          count: Number(courseCount),
          max_uses: Number(courseMaxUses),
          expires_at: new Date(courseExpiresAt).toISOString(),
        };
        const res: any = await apiClient.post('/admin/activation-codes/generate', payload);
        const codesList = res?.codes || res?.data || [];
        setGeneratedBatch({
          title: `أكواد تفعيل الكورس (${courseObj?.title_ar || 'كورس'})`,
          type: 'COURSE',
          targetName: courseObj?.title_ar || courseObj?.title,
          codes: codesList,
        });
      } else if (activeTab === 'wallet') {
        const payload = {
          amount: Number(rechargeAmount),
          count: Number(rechargeCount),
          expires_at: new Date(rechargeExpiresAt).toISOString(),
        };
        const res: any = await apiClient.post('/admin/recharge-codes/generate', payload);
        const codesList = res?.codes || res?.data || [];
        setGeneratedBatch({
          title: `كروت شحن المحفظة (فئة ${rechargeAmount} ج.م)`,
          type: 'WALLET',
          amount: rechargeAmount,
          codes: codesList,
        });
      } else if (activeTab === 'discounts') {
        const payload = {
          code: discCode.trim().toUpperCase(),
          discount_type: discType,
          discount_value: Number(discValue),
          target_type: discScope,
          target_id: discScope !== 'ALL' && discTargetId ? discTargetId : undefined,
          max_uses: Number(discMaxUses),
          expires_at: new Date(discExpiresAt).toISOString(),
        };
        await apiClient.post('/admin/discounts', payload);
        setGeneratedBatch({
          title: `كود الخصم الجديد (${discCode.trim().toUpperCase()})`,
          type: 'DISCOUNT',
          amount: discValue,
          codes: [{ code: discCode.trim().toUpperCase(), discount_value: discValue, expires_at: discExpiresAt }],
        });
      }

      setShowGenModal(false);
      loadCodes();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'حدث خطأ أثناء توليد الأكواد' });
    } finally {
      setGenLoading(false);
    }
  };

  // 4. Handle Disabling a Code
  const handleDisableCode = async (id: string, type: 'activation' | 'recharge') => {
    if (!confirm('هل أنت متأكد من رغبتك في تعطيل هذا الكود ومنع استخدامه؟')) return;
    try {
      const endpoint =
        type === 'activation' ? `/admin/activation-codes/${id}/disable` : `/admin/recharge-codes/${id}/disable`;
      await apiClient.patch(endpoint, {});
      setFeedback({ type: 'success', message: 'تم تعطيل الكود بنجاح' });
      loadCodes();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'تعذر تعطيل الكود' });
    }
  };

  // Filter list by search query
  const filteredActivation = activationCodes.filter((c) => {
    if (activeTab === 'packages' && c.type && c.type !== 'PACKAGE') return false;
    if (activeTab === 'courses' && c.type && c.type !== 'COURSE') return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.code_preview || c.code || '').toLowerCase().includes(q) ||
      (c.target_title || '').toLowerCase().includes(q)
    );
  });

  const filteredRecharge = rechargeCodes.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (c.code_preview || c.code || '').toLowerCase().includes(q);
  });

  const filteredDiscounts = discountCodes.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (c.code_preview || c.code || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 font-cairo animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-7 bg-[#0d6e4f] rounded-full inline-block" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#00251e] dark:text-white">
              أكواد التفعيل والشحن
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            توليد وتصدير كروت وأكواد تفعيل الباقات، تفعيل الكورسات، وكروت شحن رصيد المحفظة مع إمكانية طباعتها PDF
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadCodes()}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-all cursor-pointer"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowGenModal(true)}
            className="px-4 py-2.5 bg-[#0d6e4f] hover:bg-[#0a4834] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md shadow-[#0d6e4f]/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>
              {activeTab === 'packages' && 'توليد أكواد باقة'}
              {activeTab === 'courses' && 'توليد أكواد كورس'}
              {activeTab === 'wallet' && 'توليد كروت شحن محفظة'}
              {activeTab === 'discounts' && 'إنشاء كود خصم'}
            </span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-gray-200 dark:border-gray-800 pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('packages')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all shrink-0 cursor-pointer ${
            activeTab === 'packages'
              ? 'bg-[#0d6e4f] text-white shadow-sm'
              : 'bg-stone-100 dark:bg-stone-900 text-gray-600 dark:text-gray-400 hover:bg-stone-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>أكواد تفعيل الباقات</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all shrink-0 cursor-pointer ${
            activeTab === 'courses'
              ? 'bg-[#0d6e4f] text-white shadow-sm'
              : 'bg-stone-100 dark:bg-stone-900 text-gray-600 dark:text-gray-400 hover:bg-stone-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>أكواد تفعيل الكورسات</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all shrink-0 cursor-pointer ${
            activeTab === 'wallet'
              ? 'bg-[#0d6e4f] text-white shadow-sm'
              : 'bg-stone-100 dark:bg-stone-900 text-gray-600 dark:text-gray-400 hover:bg-stone-200'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>كروت شحن المحفظة</span>
        </button>

        <button
          onClick={() => setActiveTab('discounts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all shrink-0 cursor-pointer ${
            activeTab === 'discounts'
              ? 'bg-[#0d6e4f] text-white shadow-sm'
              : 'bg-stone-100 dark:bg-stone-900 text-gray-600 dark:text-gray-400 hover:bg-stone-200'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>كوبونات الخصم</span>
        </button>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 border border-emerald-300'
              : 'bg-red-50 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold underline cursor-pointer">
            إغلاق
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="بحث في الأكواد..."
          className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0d6e4f]"
        />
      </div>

      {/* ============================================================ */}
      {/* CODES TABLE RENDER */}
      {/* ============================================================ */}
      <div className="bg-white dark:bg-[#131b2e] rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#0d6e4f]" />
            <p className="text-xs font-bold">جاري تحميل الأكواد...</p>
          </div>
        ) : activeTab === 'packages' || activeTab === 'courses' ? (
          filteredActivation.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs sm:text-sm">
                <thead className="bg-stone-50 dark:bg-stone-900/60 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 font-bold">
                  <tr>
                    <th className="p-4 text-start">الكود (Voucher Code)</th>
                    <th className="p-4 text-start">الهدف والمحتوى</th>
                    <th className="p-4 text-center">مرات الاستخدام</th>
                    <th className="p-4 text-start">تاريخ الانتهاء</th>
                    <th className="p-4 text-center">الحالة</th>
                    <th className="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredActivation.map((item) => {
                    const isExhausted = item.used_count >= item.max_uses;
                    const isExpired = item.expires_at && new Date(item.expires_at) < new Date();
                    const isInactive = !item.is_active || isExhausted || isExpired;
                    const displayCode = item.raw_code || item.code || item.code_preview;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors"
                      >
                        <td className="p-4 font-mono font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                          <span>{displayCode}</span>
                          <button
                            onClick={() => handleCopy(displayCode)}
                            className="p-1 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-950 text-gray-500 hover:text-emerald-700 transition-all cursor-pointer"
                            title="نسخ الكود"
                          >
                            {copiedCode === displayCode ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                        <td className="p-4 font-bold text-gray-900 dark:text-white">
                          {item.target_title || (item.type === 'PACKAGE' ? 'باقة تعليمية' : 'كورس دراسي')}
                        </td>
                        <td className="p-4 text-center font-extrabold text-gray-700 dark:text-gray-300">
                          {item.used_count || 0} / {item.max_uses || 1}
                        </td>
                        <td className="p-4 text-gray-500">
                          {item.expires_at ? new Date(item.expires_at).toLocaleDateString('ar-EG') : 'بدون انتهاء'}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                              !isInactive
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                          >
                            {!isInactive
                              ? 'نشط ومتاح'
                              : isExhausted
                              ? 'تم استخدامه'
                              : isExpired
                              ? 'منتهي الصلاحية'
                              : 'معطل'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {!isInactive && (
                            <button
                              onClick={() => handleDisableCode(item.id, 'activation')}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                            >
                              تعطيل
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500 space-y-2">
              <Ticket className="w-10 h-10 mx-auto text-gray-400" />
              <p className="font-bold text-sm">لا توجد أكواد تفعيل حالياً</p>
              <p className="text-xs">اضغط على زر &quot;توليد الأكواد&quot; لإنشاء دفعة جديدة حتى 500 كود وتحميلها بصيغة PDF.</p>
            </div>
          )
        ) : activeTab === 'wallet' ? (
          filteredRecharge.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs sm:text-sm">
                <thead className="bg-stone-50 dark:bg-stone-900/60 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 font-bold">
                  <tr>
                    <th className="p-4 text-start">كود كارت الشحن (Voucher)</th>
                    <th className="p-4 text-center">القيمة المالية</th>
                    <th className="p-4 text-start">تاريخ الإنشاء</th>
                    <th className="p-4 text-start">تاريخ الانتهاء</th>
                    <th className="p-4 text-center">الحالة</th>
                    <th className="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredRecharge.map((item) => {
                    const displayCode = item.code || item.code_preview;
                    const isUsed = item.is_used || item.used_at;
                    const isExpired = item.expires_at && new Date(item.expires_at) < new Date();
                    const isInactive = isUsed || isExpired || !item.is_active;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors"
                      >
                        <td className="p-4 font-mono font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                          <span>{displayCode}</span>
                          <button
                            onClick={() => handleCopy(displayCode)}
                            className="p-1 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-950 text-gray-500 hover:text-emerald-700 transition-all cursor-pointer"
                          >
                            {copiedCode === displayCode ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                        <td className="p-4 text-center font-black text-base text-[#0d6e4f] dark:text-emerald-400">
                          {item.amount || rechargeAmount} ج.م
                        </td>
                        <td className="p-4 text-gray-500">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString('ar-EG') : 'اليوم'}
                        </td>
                        <td className="p-4 text-gray-500">
                          {item.expires_at ? new Date(item.expires_at).toLocaleDateString('ar-EG') : 'بدون انتهاء'}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              !isInactive
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : isUsed
                                ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            }`}
                          >
                            {!isInactive ? 'متاح للشحن' : isUsed ? 'مشحون بالفعل' : 'معطل / منتهي'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {!isInactive && (
                            <button
                              onClick={() => handleDisableCode(item.id, 'recharge')}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                            >
                              تعطيل
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500 space-y-2">
              <Coins className="w-10 h-10 mx-auto text-gray-400" />
              <p className="font-bold text-sm">لا توجد كروت شحن محفظة حالياً</p>
              <p className="text-xs">اضغط على زر &quot;توليد كروت شحن&quot; لإنشاء كروت شحن نقدية للمحفظة.</p>
            </div>
          )
        ) : filteredDiscounts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs sm:text-sm">
              <thead className="bg-stone-50 dark:bg-stone-900/60 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 font-bold">
                <tr>
                  <th className="p-4 text-start">كود الخصم (Coupon)</th>
                  <th className="p-4 text-center">قيمة الخصم</th>
                  <th className="p-4 text-start">النطاق والهدف</th>
                  <th className="p-4 text-center">مرات الاستخدام</th>
                  <th className="p-4 text-start">تاريخ الانتهاء</th>
                  <th className="p-4 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredDiscounts.map((item) => {
                  const displayCode = item.code || item.code_preview;
                  const isExpired = item.expires_at && new Date(item.expires_at) < new Date();
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors"
                    >
                      <td className="p-4 font-mono font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                        <span>{displayCode}</span>
                        <button
                          onClick={() => handleCopy(displayCode)}
                          className="p-1 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-950 text-gray-500 hover:text-emerald-700 transition-all cursor-pointer"
                        >
                          {copiedCode === displayCode ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-center font-extrabold text-[#0d6e4f] dark:text-emerald-400">
                        {item.discount_type === 'PERCENTAGE'
                          ? `${item.discount_value}% خصم`
                          : `${item.discount_value} ج.م خصم ثابت`}
                      </td>
                      <td className="p-4 font-bold text-gray-700 dark:text-gray-300">
                        {item.target_type === 'ALL'
                          ? 'جميع المنصة (كورسات وباقات)'
                          : item.target_title || item.target_type}
                      </td>
                      <td className="p-4 text-center font-bold">
                        {item.used_count || 0} / {item.max_uses || 'غير محدود'}
                      </td>
                      <td className="p-4 text-gray-500">
                        {item.expires_at ? new Date(item.expires_at).toLocaleDateString('ar-EG') : 'دائم'}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            !isExpired
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          }`}
                        >
                          {!isExpired ? 'نشط' : 'منتهي الصلاحية'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <Percent className="w-10 h-10 mx-auto text-gray-400" />
            <p className="font-bold text-sm">لا توجد كوبونات خصم حالياً</p>
            <p className="text-xs">اضغط على زر &quot;إنشاء كود خصم&quot; لإتاحة خصم (مثلاً 50% أو 60%) للطلاب.</p>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* GENERATION MODAL (نافذة توليد الأكواد حتى 500+) */}
      {/* ============================================================ */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="w-full max-w-lg bg-white dark:bg-[#101726] rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 dark:border-gray-800 space-y-5 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#0d6e4f]" />
                <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                  {activeTab === 'packages' && 'توليد كروت تفعيل باقة شهرية'}
                  {activeTab === 'courses' && 'توليد كروت تفعيل كورس دراسي'}
                  {activeTab === 'wallet' && 'توليد كروت شحن رصيد المحفظة'}
                  {activeTab === 'discounts' && 'إنشاء كود خصم جديد'}
                </h2>
              </div>
              <button
                onClick={() => setShowGenModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 text-start">
              {/* PACKAGE ACTIVATION FORM */}
              {activeTab === 'packages' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      اختر الباقة المراد تفعيلها:
                    </label>
                    <select
                      value={pkgTargetId}
                      onChange={(e) => setPkgTargetId(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                    >
                      {packagesList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title_ar || p.title} ({p.academic_year_name_ar || 'باقة'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        عدد الأكواد (حتى 500+):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={pkgCount}
                        onChange={(e) => setPkgCount(Number(e.target.value))}
                        required
                        className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        مرات الاستخدام للكود:
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={pkgMaxUses}
                        onChange={(e) => setPkgMaxUses(Number(e.target.value))}
                        required
                        className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">تاريخ الصلاحية:</label>
                    <input
                      type="date"
                      value={pkgExpiresAt}
                      onChange={(e) => setPkgExpiresAt(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              {/* COURSE ACTIVATION FORM */}
              {activeTab === 'courses' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      اختر الكورس المراد تفعيله:
                    </label>
                    <select
                      value={courseTargetId}
                      onChange={(e) => setCourseTargetId(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                    >
                      {coursesList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title_ar || c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        عدد الأكواد (حتى 500+):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={courseCount}
                        onChange={(e) => setCourseCount(Number(e.target.value))}
                        required
                        className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        مرات الاستخدام للكود:
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={courseMaxUses}
                        onChange={(e) => setCourseMaxUses(Number(e.target.value))}
                        required
                        className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">تاريخ الصلاحية:</label>
                    <input
                      type="date"
                      value={courseExpiresAt}
                      onChange={(e) => setCourseExpiresAt(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              {/* WALLET RECHARGE VOUCHER FORM */}
              {activeTab === 'wallet' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        قيمة كارت الشحن (ج.م):
                      </label>
                      <input
                        type="number"
                        min="5"
                        step="5"
                        value={rechargeAmount}
                        onChange={(e) => setRechargeAmount(Number(e.target.value))}
                        required
                        className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        عدد الكروت (حتى 500+):
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={rechargeCount}
                        onChange={(e) => setRechargeCount(Number(e.target.value))}
                        required
                        className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      تاريخ انتهاء الصلاحية:
                    </label>
                    <input
                      type="date"
                      value={rechargeExpiresAt}
                      onChange={(e) => setRechargeExpiresAt(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              {/* DISCOUNT COUPON FORM */}
              {activeTab === 'discounts' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      كود الخصم (مثلاً: MEKAWY50):
                    </label>
                    <input
                      type="text"
                      value={discCode}
                      onChange={(e) => setDiscCode(e.target.value.toUpperCase())}
                      placeholder="MEKAWY50"
                      required
                      className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-gray-200 dark:border-gray-700 font-mono text-xs font-bold text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">نوع الخصم:</label>
                      <select
                        value={discType}
                        onChange={(e) => setDiscType(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                      >
                        <option value="PERCENTAGE">نسبة مئوية (%)</option>
                        <option value="FIXED_AMOUNT">مبلغ ثابت (ج.م)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {discType === 'PERCENTAGE'
                          ? 'نسبة الخصم (مثال: 50% أو 60%):'
                          : 'المبلغ المخصوم (ج.م):'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={discType === 'PERCENTAGE' ? 100 : 5000}
                        value={discValue}
                        onChange={(e) => setDiscValue(Number(e.target.value))}
                        required
                        className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">النطاق:</label>
                      <select
                        value={discScope}
                        onChange={(e) => setDiscScope(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                      >
                        <option value="ALL">جميع المنصة (كورسات وباقات)</option>
                        <option value="PACKAGE">باقة معينة</option>
                        <option value="COURSE">كورس معين</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        الحد الأقصى للاستخدام:
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={discMaxUses}
                        onChange={(e) => setDiscMaxUses(Number(e.target.value))}
                        required
                        className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">تاريخ الصلاحية:</label>
                    <input
                      type="date"
                      value={discExpiresAt}
                      onChange={(e) => setDiscExpiresAt(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              <div className="pt-3 flex gap-3">
                <button
                  type="submit"
                  disabled={genLoading}
                  className="flex-1 py-3 bg-[#0d6e4f] hover:bg-[#0a4834] disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-[#0d6e4f]/20 cursor-pointer"
                >
                  {genLoading ? 'جاري التوليد...' : 'تأكيد التوليد والحفظ'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="px-5 py-3 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STYLISH RECTANGLE VOUCHER CARDS & PDF EXPORT MODAL */}
      {/* ============================================================ */}
      {generatedBatch && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className="w-full max-w-4xl bg-white dark:bg-[#101726] rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-500/30 space-y-6 max-h-[92vh] flex flex-col animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 shrink-0">
              <div className="space-y-1 text-start">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-[#0d6e4f] dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    تم توليد عدد ({generatedBatch.codes.length}) كود بنجاح!
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                  {generatedBatch.title}
                </h2>
              </div>

              <button
                onClick={() => setGeneratedBatch(null)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Stylish Rectangle Voucher Cards Grid (المستطيل الشيك) */}
            <div className="overflow-y-auto flex-1 p-3 bg-stone-50/80 dark:bg-[#0c1017] rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedBatch.codes.map((item, idx) => {
                  const codeStr = item.code || item.raw_code || item;
                  const targetTitle =
                    generatedBatch.targetName ||
                    (generatedBatch.amount ? `${generatedBatch.amount} ج.م` : '');

                  return (
                    <div
                      key={idx}
                      className="relative p-4 rounded-2xl bg-white dark:bg-[#131b2e] border-2 border-dashed border-[#0d6e4f]/40 dark:border-emerald-500/40 shadow-xs flex flex-col justify-between space-y-3 hover:border-[#0d6e4f] transition-all text-start"
                    >
                      {/* Card Top Branding */}
                      <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#0d6e4f]" />
                          <span className="text-xs font-black text-[#0d6e4f] dark:text-emerald-400">
                            منصة مستر عمر مكاوي
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400">كارت #{idx + 1}</span>
                      </div>

                      {/* Card Content & Badge */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
                          {generatedBatch.type === 'PACKAGE'
                            ? 'كارت تفعيل باقة شهرية'
                            : generatedBatch.type === 'COURSE'
                            ? 'كارت تفعيل كورس دراسي'
                            : generatedBatch.type === 'WALLET'
                            ? 'كارت شحن رصيد محفظة'
                            : 'كوبون خصم'}
                        </span>
                        {targetTitle && (
                          <h4 className="text-xs font-black text-gray-900 dark:text-white line-clamp-1">
                            {targetTitle}
                          </h4>
                        )}
                      </div>

                      {/* Stylized Code Rectangle Box */}
                      <div className="p-2.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-emerald-800 dark:text-emerald-300 block">
                            كود التفعيل / الشحن:
                          </span>
                          <span className="font-mono font-black text-sm text-[#0d6e4f] dark:text-emerald-400 tracking-wider">
                            {codeStr}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopy(codeStr)}
                          className="p-1.5 rounded-lg bg-white dark:bg-stone-900 text-[#0d6e4f] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-xs hover:scale-105 transition-all cursor-pointer"
                          title="نسخ الكود"
                        >
                          {copiedCode === codeStr ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Card Footer Instructions */}
                      <div className="flex items-center justify-between text-[9px] font-medium text-gray-500 dark:text-gray-400 pt-1">
                        <span>أدخل الكود في خانة التفعيل بالموقع</span>
                        <span>omarmeckawy.com</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions Toolbar */}
            <div className="flex flex-wrap items-center gap-3 pt-2 shrink-0">
              <button
                type="button"
                onClick={handlePrintPDF}
                className="flex-1 py-3 bg-[#0d6e4f] hover:bg-[#0a4834] text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#0d6e4f]/20 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>تحميل / طباعة كروت الأكواد PDF</span>
              </button>

              <button
                type="button"
                onClick={handleCopyAllGenerated}
                className="px-5 py-3 bg-emerald-50 dark:bg-emerald-950 text-[#0d6e4f] dark:text-emerald-300 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer"
              >
                {copiedCode === 'ALL' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode === 'ALL' ? 'تم نسخ الكل!' : 'نسخ جميع الأكواد'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="px-5 py-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-gray-800 dark:text-gray-200 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>تصدير Excel/CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setGeneratedBatch(null)}
                className="px-6 py-3 bg-stone-200 dark:bg-stone-800 text-gray-700 dark:text-gray-300 font-bold text-xs sm:text-sm rounded-xl cursor-pointer"
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
