'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Wallet,
  BookOpen,
  Headset,
  Info,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { staffApiClient } from '@/context/StaffAuthContext';
import { useLanguage } from '@/context/LanguageContext';

export interface ActivityFeedItem {
  id: string;
  raw_id: string;
  category: 'WALLET_TOPUP' | 'BOOK_ORDER' | 'SUPPORT_TICKET' | 'SYSTEM';
  title_ar: string;
  title_en: string;
  body_ar: string;
  body_en: string;
  status: string;
  created_at: string;
  deep_link: string;
  metadata?: any;
  is_actionable?: boolean;
}

export function StaffNotificationBell() {
  const router = useRouter();
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [items, setItems] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!staffApiClient.getAccessToken()) return;
    try {
      const res: any = await staffApiClient.get('/admin/notifications/unread-count').catch(() => null);
      if (res && typeof res.total === 'number') {
        setUnreadCount(res.total);
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch recent activity feed
  const fetchRecentFeed = useCallback(async () => {
    if (!staffApiClient.getAccessToken()) return;
    setLoading(true);
    try {
      const res: any = await staffApiClient.get('/admin/notifications/activity-feed?limit=8').catch(() => null);
      if (res && Array.isArray(res.data)) {
        setItems(res.data);
      } else if (Array.isArray(res)) {
        setItems(res);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Polling every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // When opening dropdown, fetch feed
  useEffect(() => {
    if (isOpen) {
      fetchRecentFeed();
      fetchUnreadCount();
    }
  }, [isOpen, fetchRecentFeed, fetchUnreadCount]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getItemIcon = (category: string) => {
    switch (category) {
      case 'WALLET_TOPUP':
        return <Wallet className="h-4 w-4 text-amber-400" />;
      case 'BOOK_ORDER':
        return <BookOpen className="h-4 w-4 text-emerald-400" />;
      case 'SUPPORT_TICKET':
        return <Headset className="h-4 w-4 text-cyan-400" />;
      default:
        return <Info className="h-4 w-4 text-indigo-400" />;
    }
  };

  const getItemBadge = (item: ActivityFeedItem) => {
    if (item.category === 'WALLET_TOPUP') {
      return (
        <span
          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
            item.status === 'PENDING'
              ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
              : item.status === 'APPROVED'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
              : 'bg-neutral-800 text-neutral-400'
          }`}
        >
          {item.status === 'PENDING' ? (isAr ? 'قيد المراجعة' : 'Pending') : item.status}
        </span>
      );
    }
    if (item.category === 'BOOK_ORDER') {
      return (
        <span
          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
            item.status === 'PENDING'
              ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
              : item.status === 'SHIPPED'
              ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
              : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
          }`}
        >
          {item.status}
        </span>
      );
    }
    if (item.category === 'SUPPORT_TICKET') {
      return (
        <span
          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
            item.status === 'OPEN'
              ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
              : 'bg-neutral-800 text-neutral-400'
          }`}
        >
          {item.status === 'OPEN' ? (isAr ? 'مفتوحة' : 'Open') : item.status}
        </span>
      );
    }
    return null;
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return isAr ? 'الآن' : 'Just now';
      if (mins < 60) return isAr ? `منذ ${mins} دقيقة` : `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return isAr ? `منذ ${hours} ساعة` : `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return isAr ? `منذ ${days} يوم` : `${days}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={isAr ? 'الإشعارات والتنبيهات' : 'Notifications & Alerts'}
        className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-neutral-800 bg-[#141815] text-neutral-300 hover:bg-neutral-800 hover:border-emerald-700 transition-colors"
      >
        <Bell className="h-4 w-4 text-emerald-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -end-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black text-white shadow-sm ring-2 ring-[#0c100d] animate-pulse">
            {unreadCount > 99 ? '+99' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div className="absolute end-0 mt-2 w-80 sm:w-96 rounded-2xl border border-neutral-800 bg-[#0e120f] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800/80 px-4 py-3 bg-[#121713]">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white">
                {isAr ? 'مركز الإشعارات والطلبات' : 'Notifications Center'}
              </h4>
              {unreadCount > 0 && (
                <span className="rounded-full bg-rose-500/20 text-rose-400 px-2 py-0.5 text-[10px] font-black border border-rose-500/30">
                  {unreadCount} {isAr ? 'معلق' : 'pending'}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={fetchRecentFeed}
              disabled={loading}
              title={isAr ? 'تحديث' : 'Refresh'}
              className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* List of Items */}
          <div className="max-h-80 overflow-y-auto divide-y divide-neutral-850">
            {loading && items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-neutral-400 gap-2">
                <RefreshCw className="h-5 w-5 animate-spin text-emerald-400" />
                <span className="text-xs">{isAr ? 'جاري تحميل التنبيهات...' : 'Loading alerts...'}</span>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-neutral-500 gap-1.5">
                <CheckCircle2 className="h-7 w-7 text-emerald-500/60" />
                <p className="text-xs font-semibold text-neutral-300">
                  {isAr ? 'لا توجد تنبيهات جديدة' : 'No new alerts'}
                </p>
                <p className="text-[10px] text-neutral-500">
                  {isAr ? 'كافة طلبات الشحن والكتب والتذاكر محدثة' : 'All requests are up to date'}
                </p>
              </div>
            ) : (
              items.map((item) => {
                const title = isAr ? item.title_ar : item.title_en || item.title_ar;
                const body = isAr ? item.body_ar : item.body_en || item.body_ar;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setIsOpen(false);
                      if (item.deep_link) {
                        router.push(item.deep_link);
                      }
                    }}
                    className={`p-3.5 hover:bg-[#151b16] transition-colors cursor-pointer flex gap-3 items-start ${
                      item.is_actionable ? 'bg-emerald-950/20' : ''
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-neutral-850 border border-neutral-800 shadow-xs mt-0.5">
                      {getItemIcon(item.category)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-white truncate">{title}</span>
                        {getItemBadge(item)}
                      </div>

                      <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                        {body}
                      </p>

                      <div className="flex items-center justify-between mt-1.5 text-[10px] text-neutral-500">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(item.created_at)}
                        </span>

                        <span className="text-emerald-400 font-semibold hover:underline flex items-center gap-0.5">
                          {isAr ? 'متابعة' : 'View'}
                          <ChevronLeft className="h-3 w-3 rtl:inline ltr:hidden" />
                          <ChevronRight className="h-3 w-3 rtl:hidden ltr:inline" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Link */}
          <div className="border-t border-neutral-800 bg-[#121713] p-2.5 text-center">
            <Link
              href="/staff/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors w-full py-1 rounded-lg hover:bg-neutral-850"
            >
              <span>{isAr ? 'عرض كافة الإشعارات والعمليات' : 'View All Notifications & Alerts'}</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
