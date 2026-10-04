'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  RefreshCw,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Tag,
  Headset,
} from 'lucide-react';
import { createSupportApi, SupportTicket } from '@omar-makawy/shared';
import { useStaffAuth } from '@/context/StaffAuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function StaffSupportPage() {
  const { apiClient } = useStaffAuth();
  const { t } = useLanguage();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchTickets = useCallback(async () => {
    if (!apiClient) return;
    setLoading(true);
    setError(null);

    try {
      const supportApi = createSupportApi(apiClient);
      const res = await supportApi.getStaffTickets({
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        search: debouncedSearch || undefined,
        page,
        limit: 15,
      });

      setTickets(res.data || []);
      setTotal(res.meta?.total || 0);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err: any) {
      setError(err?.message || 'فشل في تحميل تذاكر الدعم');
    } finally {
      setLoading(false);
    }
  }, [apiClient, selectedStatus, debouncedSearch, page]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const statusBadges: Record<string, { label: string; bg: string; text: string }> = {
    OPEN: { label: 'مفتوحة', bg: 'bg-amber-950/60 border-amber-800/60', text: 'text-amber-400' },
    IN_PROGRESS: { label: 'جاري المتابعة', bg: 'bg-blue-950/60 border-blue-800/60', text: 'text-blue-400' },
    WAITING_FOR_STUDENT: { label: 'في انتظار الطالب', bg: 'bg-purple-950/60 border-purple-800/60', text: 'text-purple-300' },
    RESOLVED: { label: 'تم الحل', bg: 'bg-emerald-950/60 border-emerald-800/60', text: 'text-emerald-400' },
    CLOSED: { label: 'مغلقة', bg: 'bg-neutral-900 border-neutral-800', text: 'text-neutral-400' },
  };

  const categoryLabels: Record<string, string> = {
    GENERAL: 'عامة',
    TECHNICAL: 'تقنية',
    BILLING: 'مالية',
    ACADEMIC: 'أكاديمية',
  };

  const filterOptions = [
    { value: 'ALL', label: 'الكل' },
    { value: 'OPEN', label: 'مفتوحة' },
    { value: 'IN_PROGRESS', label: 'جاري المتابعة' },
    { value: 'WAITING_FOR_STUDENT', label: 'في انتظار الطالب' },
    { value: 'RESOLVED', label: 'تم الحل' },
    { value: 'CLOSED', label: 'مغلقة' },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              <Headset className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">خدمة العملاء</h1>
              <p className="text-xs text-neutral-400 mt-0.5">إدارة طلبات واستفسارات الطلاب</p>
            </div>
          </div>
        </div>
        <button
          onClick={fetchTickets}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-850 hover:text-white transition-all w-fit"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-[#0e1310] border border-neutral-800/90 rounded-2xl p-4 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث عن اسم الطالب، رقم التذكرة، أو الموضوع..."
              className="w-full pr-10 pl-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <Filter className="h-4 w-4 text-neutral-500 ml-1 flex-shrink-0" />
            {filterOptions.map((opt) => {
              const active = selectedStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSelectedStatus(opt.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-neutral-200'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tickets List / Table */}
      <div className="bg-[#0e1310] border border-neutral-800/90 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-neutral-400 space-y-3">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-500" />
            <p className="text-xs">جاري تحميل التذاكر...</p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-400 space-y-2">
            <p className="text-xs font-semibold">{error}</p>
            <button
              onClick={fetchTickets}
              className="text-xs text-emerald-400 underline hover:text-emerald-300"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center text-neutral-500 space-y-2">
            <MessageSquare className="h-8 w-8 mx-auto text-neutral-600" />
            <p className="text-sm font-semibold text-neutral-300">لا توجد تذاكر دعم</p>
            <p className="text-xs text-neutral-500">
              لم يتم العثور على أي تذاكر مطابقة لخيارات البحث أو الفلترة المحجوزة
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#080b09] text-neutral-400 border-b border-neutral-800 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">رقم التذكرة</th>
                  <th className="px-4 py-3.5">الطالب</th>
                  <th className="px-4 py-3.5">الموضوع</th>
                  <th className="px-4 py-3.5">التصنيف</th>
                  <th className="px-4 py-3.5">الحالة</th>
                  <th className="px-4 py-3.5">آخر تحديث</th>
                  <th className="px-4 py-3.5 text-left">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/70 text-neutral-300">
                {tickets.map((ticket) => {
                  const badge = statusBadges[ticket.status] || {
                    label: ticket.status,
                    bg: 'bg-neutral-900 border-neutral-800',
                    text: 'text-neutral-400',
                  };

                  return (
                    <tr
                      key={ticket.id}
                      className="hover:bg-neutral-850/50 transition-colors group cursor-pointer"
                    >
                      <td className="px-4 py-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                        {ticket.ticket_number}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="font-semibold text-white">{ticket.student_name || 'طالب'}</div>
                        <div className="text-[10px] text-neutral-500 font-mono">
                          {ticket.student_phone || ''}
                        </div>
                      </td>
                      <td className="px-4 py-4 max-w-xs">
                        <div className="font-medium text-neutral-200 truncate">{ticket.subject}</div>
                        {ticket.last_message && (
                          <div className="text-[11px] text-neutral-500 truncate mt-0.5">
                            {ticket.last_message}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 font-medium">
                          <Tag className="h-3 w-3 text-neutral-500" />
                          {categoryLabels[ticket.category] || ticket.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[11px] font-bold ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-neutral-400 text-[11px]">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-neutral-500" />
                          {new Date(ticket.updated_at).toLocaleDateString('ar-EG', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-left">
                        <Link
                          href={`/staff/support/${ticket.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900 transition-colors font-semibold text-xs"
                        >
                          عرض التفاصيل
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-800 bg-[#080b09] text-xs">
            <span className="text-neutral-400">
              عرض إجمالي <strong className="text-white">{total}</strong> تذكرة
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 disabled:opacity-40 hover:bg-neutral-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <span className="text-neutral-300 font-bold px-2">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
                className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 disabled:opacity-40 hover:bg-neutral-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
