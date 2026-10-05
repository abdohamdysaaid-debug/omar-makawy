'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, LogOut, ArrowLeft, Smartphone, Laptop, Sparkles } from 'lucide-react';
import { clearStoredAuth } from '@/lib/api/client';

export default function SessionEvictedModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [evictionMessage, setEvictionMessage] = useState<string>(
    'تم تسجيل الدخول إلى حسابك من جهاز أو متصفح آخر.'
  );
  const [countdown, setCountdown] = useState(10);
  const router = useRouter();

  const handleEviction = useCallback((customMsg?: string) => {
    clearStoredAuth();
    if (customMsg && typeof customMsg === 'string') {
      setEvictionMessage(customMsg);
    }
    setIsOpen(true);
    setCountdown(10);
  }, []);

  const handleRedirect = useCallback(() => {
    setIsOpen(false);
    clearStoredAuth();
    router.push('/login?reason=session_evicted');
  }, [router]);

  useEffect(() => {
    // 1. Listen for custom window event from apiClient
    const handleEvent = (event: any) => {
      const msg = event?.detail?.message;
      handleEviction(msg);
    };
    window.addEventListener('session-evicted', handleEvent);

    // 2. Listen for multi-tab BroadcastChannel
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('omar_auth_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'SESSION_EVICTED') {
          handleEviction();
        }
      };
    } catch {}

    // 3. Storage event fallback across browser windows
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'omar_student_access_token' && !e.newValue && e.oldValue) {
        // Token was cleared elsewhere
        handleEviction();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('session-evicted', handleEvent);
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
    };
  }, [handleEviction]);

  // Countdown timer for automatic redirection
  useEffect(() => {
    if (!isOpen) return;

    if (countdown <= 0) {
      handleRedirect();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, countdown, handleRedirect]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#0d1410] border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.25)] text-white p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        
        {/* Background glow effects */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          
          {/* Animated Device / Security Icon */}
          <div className="relative flex items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-red-950/80 to-red-900/40 border border-red-500/40 flex items-center justify-center shadow-lg shadow-red-950/50">
              <div className="flex items-center gap-1.5 text-red-400">
                <Laptop className="w-7 h-7" />
                <span className="text-xs font-black text-red-500/60">⇄</span>
                <Smartphone className="w-6 h-6" />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 p-1.5 rounded-xl bg-red-600 text-white shadow-md shadow-red-600/50 animate-bounce">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>

          {/* Titles */}
          <div className="space-y-1.5 pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>تنبيه أمان الجلسة المتزامنة</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              تم تسجيل الدخول من جهاز آخر
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-sm pt-1">
              تم تسجيل خروجك من هذا الجهاز تلقائياً نظراً لفتح حسابك وتسجيل الدخول من جهاز أو متصفح جديد.
            </p>
          </div>

          {/* Security Notice Card */}
          <div className="w-full p-4 rounded-2xl bg-[#141d17] border border-neutral-800/80 text-start space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-neutral-400">حالة الجلسة:</span>
              <span className="text-red-400 font-mono">جلسة ملغاة (Session Revoked)</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-neutral-400">السياسة الأمنية:</span>
              <span className="text-emerald-400">جلسة نشطة واحدة فقط لكل طالب</span>
            </div>
            <div className="pt-1 text-[11px] text-neutral-400 leading-normal border-t border-neutral-800/60">
              💡 إذا لم تكن أنت من قام بتسجيل الدخول، يُرجى تسجيل الدخول وتغيير كلمة المرور فوراً لحماية حسابك.
            </div>
          </div>

          {/* Countdown timer badge */}
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-400">
            <span>سيتم التحويل لصفحة الدخول خلال</span>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-red-950 text-red-400 font-mono font-black border border-red-800/50">
              {countdown}
            </span>
            <span>ثوانٍ</span>
          </div>

          {/* Action Button */}
          <div className="w-full pt-1">
            <button
              type="button"
              onClick={handleRedirect}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-sm transition-all shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الدخول من هذا الجهاز</span>
              <ArrowLeft className="w-4 h-4 mr-1" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
