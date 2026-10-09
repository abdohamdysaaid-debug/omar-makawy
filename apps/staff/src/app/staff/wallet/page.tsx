'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { staffApiClient as apiClient } from '@/context/StaffAuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { SystemPermissions } from '@omar-makawy/shared';
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Search,
  RefreshCw,
  Eye,
  FileText,
  CreditCard,
  Building2,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart3,
  BookOpen,
  Video,
  Package,
  Book,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/FeedbackStates';

export default function StaffWalletPage() {
  const { t, language } = useLanguage();
  const { hasPermission, isTeacher } = usePermissions();

  const [activeTab, setActiveTab] = useState<'requests' | 'accounts' | 'ledger' | 'revenue'>('requests');

  // Summary state
  const [summary, setSummary] = useState<{
    registered_platform_balance: number;
    total_incoming_credited: number;
    pending_requests_count: number;
  }>({
    registered_platform_balance: 0,
    total_incoming_credited: 0,
    pending_requests_count: 0,
  });

  // Top-Up Requests state
  const [requests, setRequests] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Receiving Accounts state
  const [accounts, setAccounts] = useState<any[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);

  // Financial Ledger state
  const [ledger, setLedger] = useState<any[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  // Revenue Analytics state
  const [revenuePeriod, setRevenuePeriod] = useState<'ALL_TIME' | 'MONTHLY' | 'WEEKLY'>('ALL_TIME');
  const [revenueCategory, setRevenueCategory] = useState<'ALL' | 'COURSES' | 'LECTURES' | 'PACKAGES' | 'BOOKS'>('ALL');
  const [revenueData, setRevenueData] = useState<{
    total_revenue: number;
    courses_revenue: number;
    lectures_revenue: number;
    packages_revenue: number;
    books_revenue: number;
    top_selling_items: any[];
  }>({
    total_revenue: 0,
    courses_revenue: 0,
    lectures_revenue: 0,
    packages_revenue: 0,
    books_revenue: 0,
    top_selling_items: [],
  });
  const [revenueLoading, setRevenueLoading] = useState(false);

  // Modals & Detail state
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [proofBlobUrl, setProofBlobUrl] = useState<string | null>(null);
  const [proofLoading, setProofLoading] = useState(false);

  const [rejectingRequest, setRejectingRequest] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [actionProcessing, setActionProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any | null>(null);
  const [accountForm, setAccountForm] = useState({
    type: 'INSTAPAY',
    provider_name: 'InstaPay',
    display_name: '',
    account_number: '',
    account_holder_name: '',
    instructions: '',
    sort_order: 1,
  });

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    try {
      const res = await apiClient.get<any>('/api/v1/admin/wallet/summary').catch(() => null);
      if (res?.data) {
        setSummary(res.data);
      } else if (res) {
        setSummary(res);
      }
    } catch {
      // ignore non-critical
    }
  }, []);

  // Fetch top-up requests
  const fetchRequests = useCallback(async () => {
    setRequestsLoading(true);
    setRequestsError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      params.append('page', String(page));
      params.append('limit', '20');

      const res: any = await apiClient.get(`/api/v1/admin/wallet/top-up-requests?${params.toString()}`);
      if (res?.data) {
        setRequests(res.data);
        if (res.meta?.total_pages) setTotalPages(res.meta.total_pages);
      } else if (Array.isArray(res)) {
        setRequests(res);
      }
    } catch (err: any) {
      setRequestsError(err?.message || 'فشل في تحميل طلبات الشحن');
    } finally {
      setRequestsLoading(false);
    }
  }, [statusFilter, searchQuery, page]);

  // Fetch receiving accounts
  const fetchAccounts = useCallback(async () => {
    setAccountsLoading(true);
    try {
      const res: any = await apiClient.get('/api/v1/admin/wallet/receiving-accounts');
      const data = res?.data || (Array.isArray(res) ? res : []);
      setAccounts(data);
    } catch {
      setAccounts([]);
    } finally {
      setAccountsLoading(false);
    }
  }, []);

  // Fetch financial ledger
  const fetchLedger = useCallback(async () => {
    setLedgerLoading(true);
    try {
      const res: any = await apiClient.get('/api/v1/admin/wallet/ledger?limit=50');
      const data = res?.data || (Array.isArray(res) ? res : []);
      setLedger(data);
    } catch {
      setLedger([]);
    } finally {
      setLedgerLoading(false);
    }
  }, []);

  // Fetch revenue analytics
  const fetchRevenue = useCallback(async () => {
    setRevenueLoading(true);
    try {
      const res: any = await apiClient.get(
        `/api/v1/admin/wallet/revenue-analytics?period=${revenuePeriod}&category=${revenueCategory}`,
      );
      if (res?.data) {
        setRevenueData(res.data);
      } else if (res) {
        setRevenueData(res);
      }
    } catch {
      // ignore
    } finally {
      setRevenueLoading(false);
    }
  }, [revenuePeriod, revenueCategory]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchRequests();
    } else if (activeTab === 'accounts') {
      fetchAccounts();
    } else if (activeTab === 'ledger') {
      fetchLedger();
    } else if (activeTab === 'revenue') {
      fetchRevenue();
    }
  }, [activeTab, fetchRequests, fetchAccounts, fetchLedger, fetchRevenue]);

  // Inspect Proof Image safely via authorization
  const openRequestDetail = async (req: any) => {
    setSelectedRequest(req);
    setProofBlobUrl(null);
    setProofLoading(true);

    try {
      const token = apiClient.getAccessToken();
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.omarmeckawy.com/api/v1';
      const res = await fetch(`${baseUrl}/admin/wallet/top-up-requests/${req.id}/proof`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setProofBlobUrl(url);
      }
    } catch {
      setProofBlobUrl(null);
    } finally {
      setProofLoading(false);
    }
  };

  const closeRequestDetail = () => {
    if (proofBlobUrl) {
      URL.revokeObjectURL(proofBlobUrl);
    }
    setSelectedRequest(null);
    setProofBlobUrl(null);
  };

  const formatPaymentMethod = (req: any) => {
    if (!req) return 'تحويل إلكتروني';
    const displayName = req.receiving_display_name || req.display_name;
    const providerName = req.receiving_provider_name || req.provider_name;
    const type = (req.receiving_type || req.type || '').toUpperCase();
    const accNum = req.receiving_account_number || req.account_number;

    let typeArabic = '';
    if (type === 'INSTAPAY' || type.includes('INSTA')) {
      typeArabic = 'انستا باي (InstaPay)';
    } else if (type === 'VODAFONE_CASH' || type.includes('VODAFONE')) {
      typeArabic = 'فودافون كاش';
    } else if (type === 'ORANGE_CASH' || type.includes('ORANGE')) {
      typeArabic = 'أورنج كاش';
    } else if (type === 'ETISALAT_CASH' || type.includes('ETISALAT')) {
      typeArabic = 'اتصالات كاش';
    } else if (type === 'WE_PAY' || type.includes('WE')) {
      typeArabic = 'وي باي (WE Pay)';
    } else if (type === 'BANK_ACCOUNT' || type.includes('BANK')) {
      typeArabic = 'تحويل بنكي';
    }

    if (displayName && providerName && displayName.toLowerCase() !== providerName.toLowerCase()) {
      return `${displayName} (${providerName})${accNum ? ` - ${accNum}` : ''}`;
    }
    if (displayName) {
      return `${displayName}${accNum ? ` - ${accNum}` : ''}`;
    }
    if (providerName) {
      return `${providerName}${accNum ? ` - ${accNum}` : ''}`;
    }
    if (typeArabic) {
      return `${typeArabic}${accNum ? ` - ${accNum}` : ''}`;
    }
    return 'انستا باي / فودافون كاش';
  };

  // Approve top-up request
  const handleApprove = async (reqId: string) => {
    setActionProcessing(true);
    setActionError(null);
    try {
      await apiClient.post(`/api/v1/admin/wallet/top-up-requests/${reqId}/approve`, {});
      closeRequestDetail();
      fetchSummary();
      fetchRequests();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || err?.message || 'فشل في اعتماد الطلب');
    } finally {
      setActionProcessing(false);
    }
  };

  // Reject top-up request
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRequest || !rejectionReason.trim()) return;

    setActionProcessing(true);
    setRejectError(null);
    setActionError(null);
    try {
      await apiClient.post(`/api/v1/admin/wallet/top-up-requests/${rejectingRequest.id}/reject`, {
        rejection_reason: rejectionReason.trim(),
        reason: rejectionReason.trim(),
      });
      setRejectingRequest(null);
      setRejectionReason('');
      setRejectError(null);
      closeRequestDetail();
      await fetchSummary();
      await fetchRequests();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'فشل في رفض الطلب';
      setRejectError(errMsg);
      setActionError(errMsg);
    } finally {
      setActionProcessing(false);
    }
  };

  // Create or edit receiving account
  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionProcessing(true);
    try {
      if (editingAccount) {
        await apiClient.patch(`/api/v1/admin/wallet/receiving-accounts/${editingAccount.id}`, accountForm);
      } else {
        await apiClient.post('/api/v1/admin/wallet/receiving-accounts', accountForm);
      }
      setShowAccountModal(false);
      setEditingAccount(null);
      fetchAccounts();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'فشل حفظ الحساب');
    } finally {
      setActionProcessing(false);
    }
  };

  const toggleAccountActive = async (account: any) => {
    try {
      await apiClient.patch(`/api/v1/admin/wallet/receiving-accounts/${account.id}`, {
        is_active: !account.is_active,
      });
      fetchAccounts();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'فشل تعديل حالة الحساب');
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'INSTAPAY':
        return <Smartphone className="w-5 h-5 text-purple-400" />;
      case 'VODAFONE_CASH':
      case 'ORANGE_CASH':
      case 'ETISALAT_CASH':
      case 'WE_PAY':
        return <Smartphone className="w-5 h-5 text-emerald-400" />;
      case 'BANK_ACCOUNT':
        return <Building2 className="w-5 h-5 text-blue-400" />;
      default:
        return <CreditCard className="w-5 h-5 text-neutral-400" />;
    }
  };

  const formatEventType = (type: string) => {
    switch (type) {
      case 'PLATFORM_INCOMING_TOPUP':
        return 'شحن محفظة (موافق عليه)';
      case 'CREDIT':
      case 'ADJUSTMENT_CREDIT':
        return 'إضافة رصيد (إداري)';
      case 'DEBIT':
      case 'ADJUSTMENT_DEBIT':
        return 'خصم رصيد (إداري)';
      case 'RECHARGE':
        return 'شحن كارت كود';
      case 'PURCHASE':
      case 'COURSE_PURCHASE':
        return 'شراء كورس';
      case 'PACKAGE_PURCHASE':
        return 'شراء باقة';
      case 'LECTURE_PURCHASE':
        return 'شراء محاضرة';
      case 'BOOK_ORDER':
        return 'طلب كتب دفتري';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Wallet className="w-6 h-6" />
            </div>
            خزنة المنصة وطلبات الشحن
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            إدارة حسابات الاستلام ومراجعة طلبات شحن المحفظة وسجل المعاملات المالية بالمنصة
          </p>
        </div>

        <button
          onClick={() => {
            fetchSummary();
            if (activeTab === 'requests') fetchRequests();
            if (activeTab === 'accounts') fetchAccounts();
            if (activeTab === 'ledger') fetchLedger();
            if (activeTab === 'revenue') fetchRevenue();
          }}
          className="self-start sm:self-auto h-10 px-4 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          تحديث البيانات
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Registered Balance */}
        <div className="p-5 rounded-2xl bg-[#111813] border border-neutral-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400">إجمالي رصيد محفظة الطلاب</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {(Number(summary?.registered_platform_balance) || 0).toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-400">ج.م</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">إجمالي الأموال المسجلة بمحافظ الطلاب</p>
        </div>

        {/* Card 2: Total Incoming Credited */}
        <div className="p-5 rounded-2xl bg-[#111813] border border-neutral-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400">إجمالي عمليات الشحن المعتمدة</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {(Number(summary?.total_incoming_credited) || 0).toLocaleString()}
            </span>
            <span className="text-xs font-bold text-blue-400">ج.م</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">مجموع مبالغ الشحن المعتمدة تاريخياً</p>
        </div>

        {/* Card 3: Pending Requests Count */}
        <div className="p-5 rounded-2xl bg-[#111813] border border-neutral-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-400">طلبات شحن قيد الانتظار</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400 font-mono">
              {summary.pending_requests_count}
            </span>
            <span className="text-xs font-bold text-neutral-400">طلب</span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">تتطلب مراجعة واعتماد الإدارة</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-neutral-800/80 space-x-2 space-x-reverse overflow-x-auto pb-0.5 scrollbar-none">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'requests'
              ? 'border-emerald-500 text-white bg-neutral-900/60'
              : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-900/30'
          }`}
        >
          <Clock className="w-4 h-4" />
          طلبات الشحن
          {summary.pending_requests_count > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">
              {summary.pending_requests_count}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'accounts'
              ? 'border-emerald-500 text-white bg-neutral-900/60'
              : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-900/30'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          حسابات الاستلام بالمنصة
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ledger'
              ? 'border-emerald-500 text-white bg-neutral-900/60'
              : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-900/30'
          }`}
        >
          <FileText className="w-4 h-4" />
          سجل الحركات المالية للخزنة
        </button>

        <button
          onClick={() => setActiveTab('revenue')}
          className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'revenue'
              ? 'border-emerald-500 text-white bg-neutral-900/60'
              : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-900/30'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          الإيرادات والأكثر مبيعاً
        </button>
      </div>

      {/* TAB 1: TOP-UP REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-[#111813] border border-neutral-800/80 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    statusFilter === st
                      ? st === 'PENDING'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : st === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : st === 'REJECTED'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-neutral-800 text-white border border-neutral-700'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white border border-transparent'
                  }`}
                >
                  {st === 'ALL'
                    ? 'الكل'
                    : st === 'PENDING'
                    ? 'قيد الانتظار'
                    : st === 'APPROVED'
                    ? 'تمت الموافقة'
                    : 'مرفوضة'}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-neutral-500 absolute start-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث باسم الطالب، الهاتف، أو الرقم المرجعي..."
                className="w-full h-10 ps-9 pe-4 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Table */}
          {requestsLoading ? (
            <LoadingState message="جاري تحميل طلبات شحن المحفظة..." />
          ) : requestsError ? (
            <ErrorState message={requestsError} onRetry={fetchRequests} />
          ) : requests.length > 0 ? (
            <div className="rounded-2xl bg-[#111813] border border-neutral-800/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead>
                    <tr className="border-b border-neutral-800/80 bg-neutral-900/40 text-neutral-400 font-bold">
                      <th className="p-4 text-start">الطالب</th>
                      <th className="p-4 text-start">المبلغ (ج.م)</th>
                      <th className="p-4 text-start">طريقة التحويل</th>
                      <th className="p-4 text-start">الرقم المرجعي</th>
                      <th className="p-4 text-start">التاريخ</th>
                      <th className="p-4 text-start">الحالة</th>
                      <th className="p-4 text-center">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-neutral-900/50 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="font-bold text-white">{req.student_name || 'طالب'}</p>
                            <p className="text-[11px] text-neutral-400 dir-ltr text-start">{req.student_phone}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-black text-sm text-emerald-400">
                            {(Number(req?.amount) || 0).toLocaleString()} ج.م
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-neutral-300 font-semibold text-xs">
                            {formatPaymentMethod(req)}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-neutral-400 text-[11px]">
                            {req.transaction_reference || '—'}
                          </span>
                        </td>
                        <td className="p-4 text-neutral-400 text-[11px]">
                          {new Date(req.created_at).toLocaleDateString('ar-EG', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              req.status === 'PENDING'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : req.status === 'APPROVED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                          >
                            {req.status === 'PENDING' ? (
                              <>
                                <Clock className="w-3 h-3" /> قيد المراجعة
                              </>
                            ) : req.status === 'APPROVED' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> تمت الموافقة
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" /> مرفوض
                              </>
                            )}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => openRequestDetail(req)}
                            className="h-8 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-[11px] transition-colors inline-flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            معاينة
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState
              title="لا توجد طلبات شحن"
              description="لم يتم العثور على أي طلبات شحن محفظة تطابق الخيارات المحددة."
            />
          )}
        </div>
      )}

      {/* TAB 2: RECEIVING ACCOUNTS */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-400">
              الحسابات والأرقام المتاحة للطلاب للتحويل إليها أثناء طلب شحن المحفظة
            </p>
            <button
              onClick={() => {
                setEditingAccount(null);
                setAccountForm({
                  type: 'INSTAPAY',
                  provider_name: 'InstaPay',
                  display_name: 'InstaPay - مستر عمر مكاوي',
                  account_number: '',
                  account_holder_name: 'عمر مكاوي',
                  instructions: 'قم بتحويل المبلغ ثم ارفع صورة إيصال التحويل.',
                  sort_order: accounts.length + 1,
                });
                setShowAccountModal(true);
              }}
              className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              إضافة حساب استلام جديد
            </button>
          </div>

          {accountsLoading ? (
            <LoadingState message="جاري تحميل حسابات الاستلام..." />
          ) : accounts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    acc.is_active
                      ? 'bg-[#111813] border-neutral-800/80 shadow-sm'
                      : 'bg-neutral-900/40 border-neutral-800/40 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-neutral-800 border border-neutral-700">
                        {getAccountIcon(acc.type)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{acc.display_name}</h3>
                        <p className="text-xs text-neutral-400">{acc.provider_name}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleAccountActive(acc)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                        acc.is_active
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700'
                      }`}
                    >
                      {acc.is_active ? 'مفعل' : 'معطل'}
                    </button>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">رقم الحساب / المحفظة:</span>
                      <span className="font-mono font-bold text-emerald-300 dir-ltr">{acc.account_number}</span>
                    </div>
                    {acc.account_holder_name && (
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">اسم صاحب الحساب:</span>
                        <span className="font-semibold text-white">{acc.account_holder_name}</span>
                      </div>
                    )}
                  </div>

                  {acc.instructions && (
                    <p className="mt-3 text-[11px] text-neutral-400">{acc.instructions}</p>
                  )}

                  <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-neutral-800/60">
                    <button
                      onClick={() => {
                        setEditingAccount(acc);
                        setAccountForm({
                          type: acc.type || 'INSTAPAY',
                          provider_name: acc.provider_name || '',
                          display_name: acc.display_name || '',
                          account_number: acc.account_number || '',
                          account_holder_name: acc.account_holder_name || '',
                          instructions: acc.instructions || '',
                          sort_order: acc.sort_order || 1,
                        });
                        setShowAccountModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs transition-colors"
                    >
                      تعديل الحساب
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="لا توجد حسابات استلام"
              description="قم بإضافة أرقام فودافون كاش، انستا باي، أو الحسابات البنكية ليتمكن الطلاب من التحويل إليها."
            />
          )}
        </div>
      )}

      {/* TAB 3: FINANCIAL LEDGER */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <p className="text-xs text-neutral-400">
            سجل حركة المعاملات المالية المعتمدة والمحفظة بالمنصة (تلقائي وشامل)
          </p>

          {ledgerLoading ? (
            <LoadingState message="جاري تحميل سجل الحركة المالية..." />
          ) : ledger.length > 0 ? (
            <div className="rounded-2xl bg-[#111813] border border-neutral-800/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead>
                    <tr className="border-b border-neutral-800/80 bg-neutral-900/40 text-neutral-400 font-bold">
                      <th className="p-4 text-start">نوع العملية</th>
                      <th className="p-4 text-start">المبلغ (ج.م)</th>
                      <th className="p-4 text-start">المستخدم المعني</th>
                      <th className="p-4 text-start">البيان / الوصف</th>
                      <th className="p-4 text-start">المنفّذ (الإدارة)</th>
                      <th className="p-4 text-start">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {ledger.map((entry) => {
                      const amountNum = Number(entry?.amount) || 0;
                      const isPositive = amountNum >= 0;

                      return (
                        <tr key={entry.id} className="hover:bg-neutral-900/50 transition-colors">
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                isPositive
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-red-500/10 text-red-400 border-red-500/20'
                              }`}
                            >
                              {formatEventType(entry.event_type)}
                            </span>
                          </td>
                          <td
                            className={`p-4 font-black text-sm ${
                              isPositive ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {isPositive ? `+${amountNum.toLocaleString()}` : amountNum.toLocaleString()} ج.م
                          </td>
                          <td className="p-4 text-white font-semibold">
                            {entry.student_name || entry.user_id || '—'}
                          </td>
                          <td className="p-4 text-neutral-300">{entry.description || '—'}</td>
                          <td className="p-4 text-neutral-400">{entry.actor_name || entry.actor_user_id || 'النظام'}</td>
                          <td className="p-4 text-neutral-400 text-[11px]">
                            {new Date(entry.created_at).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState
              title="سجل الحركة المالية فارغ"
              description="لم يتم تسجيل أو إجراء أي حركة مالية في السجل حتى الآن."
            />
          )}
        </div>
      )}

      {/* TAB 4: REVENUE ANALYTICS & TOP SELLING */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-[#111813] border border-neutral-800/80 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Period Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-400">النطاق الزمني:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {[
                  { value: 'ALL_TIME', label: 'كل الأوقات' },
                  { value: 'MONTHLY', label: 'شهرياً (آخر 30 يوم)' },
                  { value: 'WEEKLY', label: 'أسبوعياً (آخر 7 أيام)' },
                ].map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setRevenuePeriod(p.value as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      revenuePeriod === p.value
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-400">نوع الإيرادات:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {[
                  { value: 'ALL', label: 'الكل' },
                  { value: 'COURSES', label: 'الكورسات' },
                  { value: 'LECTURES', label: 'المحاضرات' },
                  { value: 'PACKAGES', label: 'الباقات' },
                  { value: 'BOOKS', label: 'الكتب' },
                ].map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setRevenueCategory(c.value as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      revenueCategory === c.value
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue Breakdown Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-2xl bg-[#111813] border border-emerald-500/30 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-300">إجمالي الإيرادات</span>
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">
                  {(Number(revenueData?.total_revenue) || 0).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-emerald-400">ج.م</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">المبلغ الإجمالي المحقق</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#111813] border border-neutral-800/80 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400">إيرادات الكورسات</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">
                  {(Number(revenueData?.courses_revenue) || 0).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-blue-400">ج.م</span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">مبيعات اشتراكات الكورسات</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#111813] border border-neutral-800/80 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400">إيرادات المحاضرات</span>
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
                  <Video className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">
                  {(Number(revenueData?.lectures_revenue) || 0).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-teal-400">ج.م</span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">مبيعات المحاضرات الفردية</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#111813] border border-neutral-800/80 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400">إيرادات الباقات</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">
                  {(Number(revenueData?.packages_revenue) || 0).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-purple-400">ج.م</span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">مبيعات الحزم والمجموعات</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#111813] border border-neutral-800/80 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-400">إيرادات الكتب</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Book className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">
                  {(Number(revenueData?.books_revenue) || 0).toLocaleString()}
                </span>
                <span className="text-xs font-bold text-amber-400">ج.م</span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1">مبيعات متجر الكتب والملزمات</p>
            </div>
          </div>

          {/* Top Selling Products Table */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              قائمة المنتجات والكورسات الأكثر مبيعاً
            </h2>

            {revenueLoading ? (
              <LoadingState message="جاري تحميل الإحصائيات والأكثر مبيعاً..." />
            ) : revenueData?.top_selling_items?.length > 0 ? (
              <div className="rounded-2xl bg-[#111813] border border-neutral-800/80 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-start text-xs">
                    <thead>
                      <tr className="border-b border-neutral-800/80 bg-neutral-900/40 text-neutral-400 font-bold">
                        <th className="p-4 text-start">المنتج / الكورس / المحاضرة</th>
                        <th className="p-4 text-start">التصنيف</th>
                        <th className="p-4 text-center">عدد المبيعات</th>
                        <th className="p-4 text-start">إجمالي الإيرادات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60">
                      {revenueData.top_selling_items.map((item, idx) => {
                        const catBadge =
                          item.category === 'COURSES'
                            ? { label: 'كورس', bg: 'bg-blue-950 text-blue-400 border-blue-800' }
                            : item.category === 'LECTURES'
                            ? { label: 'محاضرة', bg: 'bg-teal-950 text-teal-300 border-teal-800' }
                            : item.category === 'PACKAGES'
                            ? { label: 'باقة', bg: 'bg-purple-950 text-purple-300 border-purple-800' }
                            : { label: 'كتاب', bg: 'bg-amber-950 text-amber-400 border-amber-800' };

                        return (
                          <tr key={item.id || idx} className="hover:bg-neutral-900/50 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-white text-sm">{item.title}</div>
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${catBadge.bg}`}>
                                {catBadge.label}
                              </span>
                            </td>
                            <td className="p-4 text-center font-mono font-bold text-sm text-emerald-400">
                              {item.sales_count} عملية
                            </td>
                            <td className="p-4 font-black text-sm text-white">
                              {(Number(item.total_revenue) || 0).toLocaleString()} ج.م
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyState
                title="لا توجد بيانات مبيعات"
                description="لم يتم تسريب أو تسجيل أي عمليات شراء للكورسات أو الباقات أو الكتب خلال النطاق الزمني المحدد."
              />
            )}
          </div>
        </div>
      )}

      {/* INSPECT REQUEST MODAL & PROOF STREAM */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-[#111813] border border-neutral-800 text-white p-6 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={closeRequestDetail}
              className="absolute top-5 left-5 p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">تفاصيل طلب الشحن #{selectedRequest.id.slice(0, 8)}</h2>
                <p className="text-xs text-neutral-400">مراجعة الصورة وإيصال التحويل واعتتماد الرصيد للطالب</p>
              </div>
            </div>

            {actionError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-bold">
                {actionError}
              </div>
            )}

            {/* Request Info Cards */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
                <span className="text-neutral-400">بيانات الطالب:</span>
                <p className="font-bold text-white text-sm">{selectedRequest.student_name}</p>
                <p className="text-neutral-400 dir-ltr text-start">{selectedRequest.student_phone}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
                <span className="text-neutral-400">المبلغ المطلوب شحنه:</span>
                <p className="font-black text-emerald-400 text-lg">
                  {(Number(selectedRequest?.amount) || 0).toLocaleString()} ج.م
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
                <span className="text-neutral-400">الحساب المحول إليه:</span>
                <p className="font-bold text-white text-xs sm:text-sm">
                  {formatPaymentMethod(selectedRequest)}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1">
                <span className="text-neutral-400">الرقم المرجعي للعملية:</span>
                <p className="font-mono text-emerald-300 font-bold">{selectedRequest.transaction_reference || 'غير مدخل'}</p>
              </div>
            </div>

            {/* Proof Image Stream Viewer */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                صورة إيصال التحويل المعزز:
              </span>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-2 min-h-[220px] flex items-center justify-center relative overflow-hidden">
                {proofLoading ? (
                  <LoadingState message="جاري إحضار صورة الإيصال المشفّرة..." />
                ) : proofBlobUrl ? (
                  <img
                    src={proofBlobUrl}
                    alt="صورة إيصال التحويل"
                    className="max-h-[350px] w-auto object-contain rounded-xl"
                  />
                ) : (
                  <div className="text-center p-6 space-y-2 text-neutral-500">
                    <AlertCircle className="w-8 h-8 mx-auto text-amber-500/60" />
                    <p className="text-xs font-semibold">تعذر عرض المعاينة المباشرة للإيصال</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            {selectedRequest.status === 'PENDING' && (
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => {
                    setRejectError(null);
                    setRejectionReason('');
                    setRejectingRequest(selectedRequest);
                  }}
                  disabled={actionProcessing}
                  className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 font-bold text-xs transition-colors border border-red-500/20"
                >
                  رفض الطلب
                </button>

                <button
                  type="button"
                  onClick={() => handleApprove(selectedRequest.id)}
                  disabled={actionProcessing}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-sm"
                >
                  {actionProcessing && <RefreshCw className="w-4 h-4 animate-spin" />}
                  اعتماد الطلب وإضافة الرصيد للطالب
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleRejectSubmit}
            className="w-full max-w-md rounded-3xl bg-[#111813] border border-neutral-800 text-white p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200"
          >
            <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              تأكيد رفض طلب الشحن
            </h3>
            <p className="text-xs text-neutral-400">
              يرجى إدخال سبب الرفض بوضوح ليتم توضيحه للطالب في الإشعارات وفي سجل حسابه.
            </p>

            {rejectError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{rejectError}</span>
              </div>
            )}

            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="مثال: رقم العملية المرجعي غير صحيح أو الصورة غير واضحة..."
              className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-red-500 resize-none"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setRejectingRequest(null);
                  setRejectError(null);
                }}
                className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={actionProcessing || !rejectionReason.trim()}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-sm flex items-center gap-2"
              >
                {actionProcessing && <RefreshCw className="w-4 h-4 animate-spin" />}
                تأكيد الرفض
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RECEIVING ACCOUNT CREATION / EDIT MODAL */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAccountSubmit}
            className="w-full max-w-lg rounded-3xl bg-[#111813] border border-neutral-800 text-white p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <h3 className="text-lg font-bold">
                {editingAccount ? 'تعديل حساب الاستلام' : 'إضافة حساب استلام جديد'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAccountModal(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">نوع الحساب / المحفظة</label>
                <select
                  value={accountForm.type}
                  onChange={(e) =>
                    setAccountForm({ ...accountForm, type: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-bold"
                >
                  <option value="INSTAPAY">InstaPay</option>
                  <option value="VODAFONE_CASH">Vodafone Cash</option>
                  <option value="ORANGE_CASH">Orange Cash</option>
                  <option value="ETISALAT_CASH">Etisalat Cash</option>
                  <option value="WE_PAY">WE Pay</option>
                  <option value="BANK_ACCOUNT">حساب بنكي</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">مزود الخدمة</label>
                <input
                  type="text"
                  required
                  value={accountForm.provider_name}
                  onChange={(e) =>
                    setAccountForm({ ...accountForm, provider_name: e.target.value })
                  }
                  placeholder="مثال: InstaPay / CIB"
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-neutral-400 mb-1">الاسم الظاهر للطالب</label>
              <input
                type="text"
                required
                value={accountForm.display_name}
                onChange={(e) =>
                  setAccountForm({ ...accountForm, display_name: e.target.value })
                }
                placeholder="مثال: محفظة انستا باي الرسمية - مستر عمر مكاوي"
                className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">رقم الحساب / المحفظة</label>
                <input
                  type="text"
                  required
                  value={accountForm.account_number}
                  onChange={(e) =>
                    setAccountForm({ ...accountForm, account_number: e.target.value })
                  }
                  placeholder="01000000000 / username@instapay"
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono dir-ltr"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">اسم صاحب الحساب</label>
                <input
                  type="text"
                  value={accountForm.account_holder_name}
                  onChange={(e) =>
                    setAccountForm({ ...accountForm, account_holder_name: e.target.value })
                  }
                  placeholder="عمر مكاوي"
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block text-neutral-400 mb-1">تعليمات التحويل للطالب</label>
              <textarea
                rows={2}
                value={accountForm.instructions}
                onChange={(e) =>
                  setAccountForm({ ...accountForm, instructions: e.target.value })
                }
                placeholder="تعليمات إضافية تظهر للطالب..."
                className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setShowAccountModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={actionProcessing}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm"
              >
                حفظ الحساب
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
