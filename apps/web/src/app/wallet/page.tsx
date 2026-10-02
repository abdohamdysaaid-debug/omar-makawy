'use client';

import React, { useState, useEffect } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function WalletPage() {
  const { student } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rechargeCode, setRechargeCode] = useState('');
  const [charging, setCharging] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchWallet() {
      setLoading(true);
      try {
        const res = await apiClient.get<any>('/financial/wallet/my-wallet').catch(() => null);
        if (isMounted) {
          if (res && typeof res.balance === 'number') {
            setBalance(res.balance);
            setTransactions(res.transactions || []);
          } else {
            // Real default balance from student auth context if returned
            setBalance(student?.walletBalance ?? 0);
            setTransactions([]);
          }
        }
      } catch {
        if (isMounted) {
          setBalance(student?.walletBalance ?? 0);
          setTransactions([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchWallet();

    return () => {
      isMounted = false;
    };
  }, [student]);

  const handleChargeWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rechargeCode.trim()) return;

    setCharging(true);
    setMessage(null);

    try {
      let res: any = null;
      try {
        res = await apiClient.post('/api/v1/wallet/recharge/redeem', {
          code: rechargeCode.trim(),
        });
      } catch {
        res = await apiClient.post('/financial/activation/redeem-code', {
          code: rechargeCode.trim(),
        });
      }

      const creditedAmount = res?.credited_amount || res?.amount || '';
      const newBal = typeof res?.new_balance === 'number' ? res.new_balance : typeof res?.newBalance === 'number' ? res.newBalance : balance + (Number(creditedAmount) || 0);

      setMessage({
        type: 'success',
        text: res?.message || `تم شحن المحفظة بنجاح${creditedAmount ? ` بمبلغ ${creditedAmount} ج.م` : ''}!`,
      });

      setBalance(newBal);
      setTransactions((prev) => [
        {
          id: Date.now().toString(),
          type: 'DEPOSIT',
          description: `شحن رصيد بكارت شحن (${rechargeCode.trim().slice(0, 4)}****)`,
          amount: creditedAmount || 'شحن رصيد',
          date: new Date().toLocaleDateString('ar-EG'),
        },
        ...prev,
      ]);
      setRechargeCode('');
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.message || 'كود الشحن غير صحيح أو تم استخدامه من قبل أو منتهي الصلاحية',
      });
    } finally {
      setCharging(false);
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-8 animate-fade-in max-w-4xl">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            المحفظة الإلكترونية
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            متابعة رصيد حسابك وشحن رصيد المحفظة عبر كروت الشحن
          </p>
        </div>

        {/* Balance Display Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 text-white shadow-xl shadow-emerald-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs text-emerald-200 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-4 h-4" />
              رصيدك الحالي
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold">{loading ? '...' : balance}</span>
              <span className="text-lg text-emerald-200 font-bold">جنيه مصري</span>
            </div>
            <p className="text-xs text-emerald-100/80">
              يمكنك استخدام رصيد المحفظة لشراء الكورسات والباقات والمذكرات الدراسية.
            </p>
          </div>

          <div className="w-full md:w-auto">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs text-emerald-100 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                شحن آمن وفوري
              </div>
              <p className="text-[11px] text-emerald-200">ادخل كود الشحن المكون من أرقام لشحن رصيدك فوراً.</p>
            </div>
          </div>
        </div>

        {/* Charge Wallet Form */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-5 bg-emerald-600 rounded-full inline-block" />
            شحن المحفظة
          </h2>

          {message && (
            <div
              className={`p-4 rounded-2xl text-xs font-bold ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                  : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleChargeWallet} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={rechargeCode}
              onChange={(e) => setRechargeCode(e.target.value)}
              placeholder="أدخل كود الشحن..."
              className="flex-1 h-12 px-4 rounded-xl bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 text-sm font-mono text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={charging || !rechargeCode.trim()}
              className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {charging ? 'جاري الشحن...' : 'تأكيد الشحن'}
            </button>
          </form>
        </div>

        {/* Transaction History Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-5 bg-emerald-600 rounded-full inline-block" />
            سجل الحركات المالية
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
