'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  Send,
  Paperclip,
  User,
  Phone,
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileText,
  Tag,
} from 'lucide-react';
import { createSupportApi, TicketDetailsResponse } from '@omar-makawy/shared';
import { useStaffAuth } from '@/context/StaffAuthContext';

export function StaffTicketDetailsClient({ ticketId: propTicketId }: { ticketId?: string }) {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const queryId = searchParams ? searchParams.get('id') : null;
  const paramId = params?.id as string;
  const ticketId = propTicketId || (paramId && paramId !== 'detail' ? paramId : null) || queryId;
  const { apiClient, user } = useStaffAuth();

  const [ticket, setTicket] = useState<TicketDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [replyMessage, setReplyMessage] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTicketDetails = useCallback(async () => {
    if (!apiClient) return;
    if (!ticketId || ticketId === 'detail') {
      setLoading(false);
      setError('لم يتم تحديد التذكرة المطلوب عرض تفاصيلها');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const supportApi = createSupportApi(apiClient);
      const res = await supportApi.getStaffTicketDetails(ticketId);
      setTicket(res);
    } catch (err: any) {
      setError(err?.message || 'فشل في تحميل تفاصيل التذكرة');
    } finally {
      setLoading(false);
    }
  }, [apiClient, ticketId]);

  useEffect(() => {
    fetchTicketDetails();
  }, [fetchTicketDetails]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  const handleStatusChange = async (newStatus: string) => {
    if (!apiClient || !ticket) return;
    setUpdatingStatus(true);
    setStatusSuccess(null);

    try {
      const supportApi = createSupportApi(apiClient);
      await supportApi.updateTicketStatus(ticket.id, { status: newStatus });
      setTicket((prev) => (prev ? { ...prev, status: newStatus as any } : prev));
      setStatusSuccess('تم تحديث حالة التذكرة بنجاح');
      setTimeout(() => setStatusSuccess(null), 3000);
    } catch (err: any) {
      alert(err?.message || 'فشل في تحديث حالة التذكرة');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiClient || !ticket || !replyMessage.trim()) return;

    setSubmittingReply(true);

    try {
      const supportApi = createSupportApi(apiClient);
      let attachments: any[] = [];

      if (selectedFile) {
        setUploadingFile(true);
        const uploadRes = await supportApi.uploadAttachment(selectedFile);
        attachments = [uploadRes];
        setUploadingFile(false);
      }

      await supportApi.sendStaffReply(ticket.id, {
        message: replyMessage.trim(),
        attachments,
      });

      setReplyMessage('');
      setSelectedFile(null);
      await fetchTicketDetails();
    } catch (err: any) {
      alert(err?.message || 'فشل في إرسال الرد');
    } finally {
      setSubmittingReply(false);
      setUploadingFile(false);
    }
  };

  const statusOptions = [
    { value: 'OPEN', label: 'مفتوحة' },
    { value: 'IN_PROGRESS', label: 'جاري المتابعة' },
    { value: 'WAITING_FOR_STUDENT', label: 'في انتظار الطالب' },
    { value: 'RESOLVED', label: 'تم الحل' },
    { value: 'CLOSED', label: 'مغلقة' },
  ];

  if (loading) {
    return (
      <div className="py-20 text-center text-neutral-400 space-y-3">
        <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-500" />
        <p className="text-xs">جاري تحميل تفاصيل التذكرة...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="py-20 text-center text-red-400 space-y-3 max-w-md mx-auto">
        <AlertCircle className="h-8 w-8 mx-auto text-red-500" />
        <p className="text-sm font-semibold">{error || 'التذكرة غير موجودة'}</p>
        <Link
          href="/staff/support"
          className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:underline"
        >
          <ArrowRight className="h-4 w-4" />
          العودة لقائمة التذاكر
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-6xl mx-auto">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/staff/support"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-neutral-300 border border-neutral-800 hover:bg-neutral-800 transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-emerald-400">
                {ticket.ticket_number}
              </span>
              <span className="text-xs text-neutral-400">|</span>
              <h1 className="text-lg font-bold text-white truncate max-w-md">{ticket.subject}</h1>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">تفاصيل تذكرة الدعم ومحادثة الطالب</p>
          </div>
        </div>

        {/* Status Dropdown Selector */}
        <div className="flex items-center gap-3 bg-[#0e1310] border border-neutral-800 rounded-xl p-2">
          <span className="text-xs text-neutral-400 font-semibold px-1">تغيير الحالة:</span>
          <select
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={updatingStatus}
            className="bg-neutral-900 border border-neutral-800 rounded-lg text-xs font-bold text-emerald-400 px-3 py-1.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {statusSuccess && <span className="text-[11px] text-emerald-400 font-semibold">{statusSuccess}</span>}
        </div>
      </div>

      {/* Grid: Left/Right Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Sidebar Card */}
        <div className="space-y-4">
          <div className="bg-[#0e1310] border border-neutral-800/90 rounded-2xl p-5 space-y-4 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-800 pb-3">
              بيانات الطالب والتذكرة
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 text-neutral-400 border border-neutral-800">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-neutral-400 text-[10px]">اسم الطالب</div>
                  <div className="font-bold text-white text-sm">{ticket.student_name || 'طالب'}</div>
                </div>
              </div>

              {ticket.student_phone && (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 text-neutral-400 border border-neutral-800">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-neutral-400 text-[10px]">رقم الهاتف</div>
                    <div className="font-mono text-emerald-400 font-bold">{ticket.student_phone}</div>
                  </div>
                </div>
              )}

              {ticket.academic_year_name && (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900 text-neutral-400 border border-neutral-800">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-neutral-400 text-[10px]">السنة الدراسية</div>
                    <div className="font-semibold text-neutral-200">{ticket.academic_year_name}</div>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-neutral-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">التصنيف:</span>
                  <span className="font-semibold text-neutral-200">{ticket.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">تاريخ الإنشاء:</span>
                  <span className="font-mono text-neutral-400">
                    {new Date(ticket.created_at).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Conversation Feed & Reply Box */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0e1310] border border-neutral-800/90 rounded-2xl p-4 sm:p-5 flex flex-col h-[550px] shadow-sm">
            <div className="border-b border-neutral-800 pb-3 mb-4 flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-300">سجل المحادثة والردود</span>
              <span className="text-[11px] text-neutral-500">{ticket.messages?.length || 0} رسالة</span>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 pl-1">
              {ticket.messages?.map((msg) => {
                const isStaff = msg.sender_type === 'STAFF';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold text-neutral-300">
                        {isStaff ? (msg.sender_name || 'خدمة العملاء') : (ticket.student_name || 'الطالب')}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        isStaff ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        {isStaff ? 'فريق الدعم' : 'الطالب'}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {new Date(msg.created_at).toLocaleTimeString('ar-EG', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        isStaff
                          ? 'bg-emerald-950/80 text-emerald-100 border border-emerald-800/60 rounded-tl-none'
                          : 'bg-neutral-900 text-neutral-200 border border-neutral-800 rounded-tr-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.message}</p>

                      {/* Attachments rendering */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-neutral-800/80 space-y-1.5">
                          {msg.attachments.map((att, attIdx) => (
                            <a
                              key={attIdx}
                              href={att.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2 p-2 rounded-lg bg-black/40 hover:bg-black/70 border border-neutral-700/50 text-emerald-300 text-[11px] transition-colors w-fit"
                            >
                              <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="truncate max-w-[200px]">{att.file_name || 'مرفق'}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input Form */}
            {ticket.status === 'CLOSED' ? (
              <div className="mt-4 p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-center text-xs text-neutral-400 font-semibold">
                هذه التذكرة مغلقة. يمكنك تغيير حالتها لإعادة فتح الردود.
              </div>
            ) : (
              <form onSubmit={handleSendReply} className="mt-4 pt-3 border-t border-neutral-800 space-y-3">
                {selectedFile && (
                  <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-emerald-400">
                    <span className="truncate max-w-xs">مرفق: {selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-neutral-500 hover:text-red-400 text-xs font-bold"
                    >
                      إلغاء
                    </button>
                  </div>
                )}

                <div className="relative">
                  <textarea
                    rows={3}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="اكتب ردك..."
                    className="w-full p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 resize-none transition-colors"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 text-xs cursor-pointer transition-colors">
                    <Paperclip className="h-3.5 w-3.5" />
                    <span>إرفاق ملف</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={submittingReply || !replyMessage.trim()}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    {submittingReply ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    إرسال الرد
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
