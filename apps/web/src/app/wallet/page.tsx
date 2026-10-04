'use client';

import React, { useState, useEffect, useCallback } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  CreditCard,
  Ticket,
  Copy,
  Check,
  Upload,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  Smartphone,
  Building2,
  X,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function WalletPage() {
  const { student, refreshWallet } = useAuth();
  const [balance, setBalance] = useState<number>(student?.walletBalance ?? 0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTopupModal, setShowTopupModal] = useState(false);

  // Recharge method tab: 'code' | 'topup'
  const [rechargeMethod, setRechargeMethod] = useState<'code' | 'topup'>('topup');

  // Recharge Code State
  const [rechargeCode, setRechargeCode] = useState('');
  const [codeCharging, setCodeCharging] = useState(false);
  const [codeMessage, setCodeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Top-Up Request State
  const [receivingAccounts, setReceivingAccounts] = useState<any[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [submittingTopup, setSubmittingTopup] = useState(false);
  const [topupMessage, setTopupMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Student's Top-Up Requests History
  const [topupRequests, setTopupRequests] = useState<any[]>([]);
  const [topupRequestsLoading, setTopupRequestsLoading] = useState(false);

  // Copy state helper
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch real current balance from backend
      let walletRes: any = await apiClient.get<any>('/wallet').catch(() => null);
      if (!walletRes || (typeof walletRes.current_balance === 'undefined' && typeof walletRes.balance === 'undefined')) {
        walletRes = await apiClient.get<any>('/api/v1/wallet').catch(() => null);
      }
      if (!walletRes || (typeof walletRes.current_balance === 'undefined' && typeof walletRes.balance === 'undefined')) {
        walletRes = await apiClient.get<any>('/financial/wallet/my-wallet').catch(() => null);
      }

      if (walletRes && (typeof walletRes.current_balance === 'string' || typeof walletRes.current_balance === 'number')) {
        setBalance(Number(walletRes.current_balance) || 0);
      } else if (walletRes && typeof walletRes.balance === 'number') {
        setBalance(walletRes.balance);
      } else if (typeof student?.walletBalance === 'number') {
        setBalance(student.walletBalance);
      }

      // 2. Fetch real transaction history
      let txRes: any = await apiClient.get<any>('/wallet/transactions?limit=50').catch(() => null);
      if (!txRes) {
        txRes = await apiClient.get<any>('/api/v1/wallet/transactions?limit=50').catch(() => null);
      }

      let rawTxList: any[] = [];
      if (Array.isArray(txRes)) {
        rawTxList = txRes;
      } else if (txRes && Array.isArray(txRes.data)) {
        rawTxList = txRes.data;
      } else if (txRes && Array.isArray(txRes.items)) {
        rawTxList = txRes.items;
      }

      if (rawTxList.length > 0) {
        const mapped = rawTxList.map((tx: any) => {
          const isDeposit =
            tx.type === 'RECHARGE' ||
            tx.type === 'CREDIT' ||
            tx.type === 'TOPUP_CREDIT' ||
            tx.type === 'ADJUSTMENT_CREDIT' ||
            tx.type === 'ORDER_REFUND' ||
            tx.type === 'REFUND' ||
            Number(tx.amount) > 0;

          let defaultArabicDesc = 'حركة مالية';
          switch (tx.type) {
            case 'RECHARGE':
              defaultArabicDesc = 'شحن رصيد (كارت شحن)';
              break;
            case 'CREDIT':
            case 'TOPUP_CREDIT':
              defaultArabicDesc = 'شحن رصيد (تحويل خارجي)';
              break;
            case 'BOOK_PURCHASE':
              defaultArabicDesc = 'شراء كتاب / مذكرة دراسية';
              break;
            case 'PURCHASE':
              defaultArabicDesc = 'شراء كورس / باقة تعليمية';
              break;
            case 'ORDER_PAYMENT':
              defaultArabicDesc = 'خصم مقابل طلب شراء';
              break;
            case 'ORDER_REFUND':
            case 'REFUND':
              defaultArabicDesc = 'استرداد مبلغ إلى المحفظة';
              break;
            case 'ADJUSTMENT_CREDIT':
              defaultArabicDesc = 'إضافة رصيد من الإدارة';
              break;
            case 'ADJUSTMENT_DEBIT':
              defaultArabicDesc = 'خصم رصيد من الإدارة';
              break;
          }

          let displayDescription = defaultArabicDesc;
          if (tx.description && typeof tx.description === 'string') {
            if (tx.description.startsWith('Recharge voucher redemption')) {
              displayDescription = 'شحن رصيد عبر كارت شحن';
            } else if (tx.description.startsWith('Purchase:')) {
              const itemTitle = tx.description.replace(/^Purchase:\s*/, '');
              displayDescription = `شراء محتوى: ${itemTitle}`;
            } else if (tx.description.startsWith('Top-up request approved')) {
              displayDescription = 'تم اعتماد طلب الشحن';
            } else if (tx.description.startsWith('Admin adjustment:')) {
              const reason = tx.description.replace(/^Admin adjustment:\s*/, '');
              displayDescription = `تعديل رصيد من الإدارة: ${reason}`;
            } else {
              displayDescription = tx.description;
            }
          }

          return {
            id: tx.id || String(Math.random()),
            type: isDeposit ? 'DEPOSIT' : 'WITHDRAWAL',
            description: displayDescription,
            amount: `${Math.abs(Number(tx.amount) || 0)}`,
            date: tx.created_at
              ? new Date(tx.created_at).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : new Date().toLocaleDateString('ar-EG'),
          };
        });
        setTransactions(mapped);
      } else {
        setTransactions([]);
      }
    } catch {
      setBalance(student?.walletBalance ?? 0);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [student?.walletBalance]);

  // Fetch receiving accounts
  const fetchReceivingAccounts = useCallback(async () => {
    setAccountsLoading(true);
    try {
      const res: any = await apiClient.get('/api/v1/student/wallet/receiving-accounts');
      const list = res?.data || (Array.isArray(res) ? res : []);
      setReceivingAccounts(list);
      if (list.length > 0 && !selectedAccountId) {
        setSelectedAccountId(list[0].id);
      }
    } catch {
      setReceivingAccounts([]);
    } finally {
      setAccountsLoading(false);
    }
  }, [selectedAccountId]);

  // Fetch student topup requests
  const fetchTopupRequests = useCallback(async () => {
    setTopupRequestsLoading(true);
    try {
      const res: any = await apiClient.get('/api/v1/student/wallet/top-up-requests');
      const list = res?.data || (Array.isArray(res) ? res : []);
      setTopupRequests(list);
    } catch {
      setTopupRequests([]);
    } finally {
      setTopupRequestsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
    fetchReceivingAccounts();
    fetchTopupRequests();
  }, [fetchWallet, fetchReceivingAccounts, fetchTopupRequests]);

  // Handle Recharge Code Submission
  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rechargeCode.trim()) return;

    setCodeCharging(true);
    setCodeMessage(null);

    try {
      let res: any = null;
      try {
        res = await apiClient.post('/wallet/recharge/redeem', {
          code: rechargeCode.trim(),
        });
      } catch {
        res = await apiClient.post('/api/v1/wallet/recharge/redeem', {
          code: rechargeCode.trim(),
        });
      }

      const creditedAmount = res?.credited_amount || res?.amount || '';
      const balanceAfter = res?.balance_after ?? res?.new_balance ?? res?.newBalance;
      const newBal =
        typeof balanceAfter === 'string' || typeof balanceAfter === 'number'
          ? Number(balanceAfter)
          : balance + (Number(creditedAmount) || 0);

      setCodeMessage({
        type: 'success',
        text: res?.message || `تم شحن المحفظة بنجاح${creditedAmount ? ` بمبلغ ${creditedAmount} ج.م` : ''}!`,
      });

      setBalance(newBal);
      setRechargeCode('');

      await refreshWallet();
      await fetchWallet();
    } catch (err: any) {
      setCodeMessage({
        type: 'error',
        text:
          err?.response?.data?.message ||
          err?.message ||
          'كود الشحن غير صحيح أو تم استخدامه من قبل أو منتهي الصلاحية',
      });
    } finally {
      setCodeCharging(false);
    }
  };

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setTopupMessage({ type: 'error', text: 'حجم صورة إيصال التحويل يجب ألا يتجاوز 10 ميجابايت' });
      return;
    }

    setProofFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProofPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle Top-Up Request Submission
  const handleSubmitTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setTopupMessage({ type: 'error', text: 'يرجى إدخال مبلغ شحن صحيح' });
      return;
    }
    if (!proofFile) {
      setTopupMessage({ type: 'error', text: 'يرجى رفع صورة إيصال أو تحويل المبلغ' });
      return;
    }

    setSubmittingTopup(true);
    setTopupMessage(null);

    try {
      const formData = new FormData();
      formData.append('amount', amount);
      if (selectedAccountId) formData.append('receiving_account_id', selectedAccountId);
      if (reference.trim()) formData.append('transaction_reference', reference.trim());
      formData.append('proof_file', proofFile);

      await apiClient.post('/api/v1/student/wallet/top-up-requests', formData);

      setTopupMessage({
        type: 'success',
        text: 'تم إرسال طلب الشحن بنجاح! سيتم مراجعته واعتماد الرصيد بمحفظتك فوراً.',
      });

      setAmount('');
      setReference('');
      setProofFile(null);
      setProofPreviewUrl(null);

      await fetchTopupRequests();
    } catch (err: any) {
      setTopupMessage({
        type: 'error',
        text: err?.response?.data?.message || err?.message || 'فشل إرسال طلب الشحن، يرجى المحاولة مرة أخرى',
      });
    } finally {
      setSubmittingTopup(false);
    }
  };

  // Copy helper
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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

  return (
    <StudentLayout>
      <div className="space-y-8 animate-fade-in max-w-4xl pb-12">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Wallet className="w-7 h-7" />
            </div>
            المحفظة الإلكترونية
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            متابعة رصيد حسابك وشحن المحفظة عبر كروت الشحن أو تحويلات فودافون كاش وانستا باي
          </p>
        </div>

        {/* Balance Display Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-black via-[#0d1612] to-emerald-950 text-white shadow-xl shadow-emerald-950/20 border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-3 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>شحن آمن وفوري</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-neutral-400 font-bold uppercase tracking-wider block">
                رصيدك الحالي بالمحفظة
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-white">{loading ? '...' : balance}</span>
                <span className="text-lg text-emerald-400 font-bold">جنيه مصري</span>
              </div>
            </div>

            <p className="text-xs text-emerald-200/80 max-w-md">
              يمكنك استخدام رصيد المحفظة لشراء الكورسات والباقات والمحاضرات والمذكرات الدراسية.
            </p>
          </div>

          <div className="w-full md:w-auto relative z-10">
            <button
              type="button"
              onClick={() => setShowTopupModal(true)}
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              <span>إضافة رصيد</span>
            </button>
          </div>
        </div>

        {/* TOP-UP MODAL DIALOG */}
        {showTopupModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
            <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
              <button
                onClick={() => setShowTopupModal(false)}
                className="absolute top-5 left-5 p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                    إضافة رصيد للمحفظة الإلكترونية
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    اختر طريقة الشحن، أدخل المبلغ المحوّل، وارفق صورة الإيصال لتأكيد الشحن
                  </p>
                </div>
              </div>

              {/* Tabs inside Modal */}
              <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setRechargeMethod('topup')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    rechargeMethod === 'topup'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>تحويل خارجي (كاش / انستا باي)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRechargeMethod('code')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    rechargeMethod === 'code'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Ticket className="w-4 h-4" />
                  <span>كروت الشحن والأكواد</span>
                </button>
              </div>

              {/* METHOD 1: TOP-UP REQUEST (INSTAPAY / VODAFONE CASH) */}
              {rechargeMethod === 'topup' && (
                <div className="space-y-5">
                  {/* Receiving Accounts Cards */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                      1. اختر رقم / حساب التحويل المناسب لك:
                    </label>

                    {accountsLoading ? (
                      <div className="h-20 rounded-2xl bg-gray-100 dark:bg-gray-900 animate-pulse" />
                    ) : receivingAccounts.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {receivingAccounts.map((acc) => {
                          const isSelected = selectedAccountId === acc.id;
                          return (
                            <div
                              key={acc.id}
                              onClick={() => setSelectedAccountId(acc.id)}
                              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                                isSelected
                                  ? 'bg-emerald-500/10 border-emerald-500 text-gray-900 dark:text-white shadow-md'
                                  : 'bg-gray-50 dark:bg-gray-900/60 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-emerald-500/50'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-xl bg-gray-200 dark:bg-gray-800">
                                    {getAccountIcon(acc.type)}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-xs text-gray-900 dark:text-white">
                                      {acc.display_name}
                                    </h4>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{acc.provider_name}</p>
                                  </div>
                                </div>

                                {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
                              </div>

                              <div className="p-2 rounded-xl bg-gray-200/50 dark:bg-gray-800/80 flex items-center justify-between text-xs">
                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 dir-ltr">{acc.account_number}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(acc.account_number, acc.id);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] hover:bg-emerald-600/30 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  {copiedId === acc.id ? (
                                    <>
                                      <Check className="w-3 h-3" /> تم النسخ
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" /> نسخ الرقم
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">لا تتوفر حسابات تحويل حالياً.</p>
                    )}
                  </div>

                  {/* Form Submission */}
                  <form onSubmit={handleSubmitTopup} className="space-y-4 pt-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                      2. أدخل بيانات التحويل وارفع صورة الإيصال:
                    </label>

                    {topupMessage && (
                      <div
                        className={`p-3.5 rounded-2xl text-xs font-bold border ${
                          topupMessage.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-500/30'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/80 dark:text-red-300 border-red-500/30'
                        }`}
                      >
                        {topupMessage.text}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                          المبلغ المحوّل (جنيه مصري): *
                        </span>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="مثال: 150"
                          min="1"
                          required
                          className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <span className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                          الرقم المرجعي / رقم العملية (اختياري):
                        </span>
                        <input
                          type="text"
                          value={reference}
                          onChange={(e) => setReference(e.target.value)}
                          placeholder="رقم عملية تحويل الكاش أو انستا باي"
                          className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm font-mono text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {/* Proof File Input */}
                    <div>
                      <span className="block text-[11px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                        صورة إيصال التحويل / سكرين شوت الشاشة: *
                      </span>
                      <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl cursor-pointer transition-colors bg-gray-50/50 dark:bg-gray-900/40">
                        {proofPreviewUrl ? (
                          <div className="flex flex-col items-center gap-2">
                            <img
                              src={proofPreviewUrl}
                              alt="Preview"
                              className="max-h-36 rounded-xl object-contain border border-gray-200 dark:border-gray-800"
                            />
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">تغيير الصورة</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-gray-400">
                            <Upload className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                              اضغط هنا لاختيار صورة إيصال التحويل
                            </span>
                            <span className="text-[10px] text-gray-500">
                              يدعم صور JPG, PNG, WEBP حتى 10 ميجابايت
                            </span>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowTopupModal(false)}
                        className="h-11 px-5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-200 transition-colors"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        disabled={submittingTopup || !amount || !proofFile}
                        className="h-11 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{submittingTopup ? 'جاري إرسال طلب الشحن...' : 'تأكيد وإرسال طلب الشحن'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* METHOD 2: RECHARGE CODE */}
              {rechargeMethod === 'code' && (
                <div className="space-y-4">
                  {codeMessage && (
                    <div
                      className={`p-3.5 rounded-2xl text-xs font-bold border ${
                        codeMessage.type === 'success'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-500/30'
                          : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border-red-500/30'
                      }`}
                    >
                      {codeMessage.text}
                    </div>
                  )}

                  <form onSubmit={handleRedeemCode} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={rechargeCode}
                      onChange={(e) => setRechargeCode(e.target.value)}
                      placeholder="أدخل كود الشحن..."
                      className="flex-1 h-12 px-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm font-mono text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={codeCharging || !rechargeCode.trim()}
                      className="h-12 px-6 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{codeCharging ? 'جاري الشحن...' : 'تأكيد الشحن'}</span>
                    </button>
                  </form>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowTopupModal(false)}
                      className="h-10 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Student's Top-Up Requests History */}
        {topupRequests.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-5 bg-emerald-500 rounded-full inline-block" />
              سجل طلبات الشحن السابقة
            </h2>

            <div className="space-y-3">
              {topupRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                        طلب شحن بمبلغ {(Number(req?.amount) || 0).toLocaleString()} ج.م
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          req.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            : req.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}
                      >
                        {req.status === 'PENDING'
                          ? 'قيد المراجعة'
                          : req.status === 'APPROVED'
                          ? 'تمت الموافقة'
                          : 'مرفوض'}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      الحساب: {req.receiving_display_name || req.receiving_type || 'تحويل خارجي'} | التاريخ:{' '}
                      {new Date(req.created_at).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>

                    {req.status === 'REJECTED' && req.rejection_reason && (
                      <p className="text-[11px] text-red-500 font-bold">
                        سبب الرفض: {req.rejection_reason}
                      </p>
                    )}
                  </div>

                  <span className="font-mono text-xs text-gray-400 dir-ltr">
                    Ref: {req.transaction_reference || req.id.slice(0, 8)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transaction History Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-5 bg-emerald-500 rounded-full inline-block" />
            سجل الحركات المالية المعتمدة
          </h2>

          {loading ? (
            <div className="h-32 rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ) : transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 rounded-2xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        tx.type === 'DEPOSIT'
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'
                      }`}
                    >
                      {tx.type === 'DEPOSIT' ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{tx.description}</p>
                      <p className="text-[11px] text-gray-400">{tx.date}</p>
                    </div>
                  </div>
                  <span
                    className={`font-extrabold text-sm ${
                      tx.type === 'DEPOSIT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {tx.type === 'DEPOSIT' ? '+' : '-'}{tx.amount} ج.م
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="Wallet"
              title="لا توجد حركات مالية سابقة"
              description="لم يتم إجراء أي عمليات شحن أو خصم على محفظتك حتى الآن."
            />
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
