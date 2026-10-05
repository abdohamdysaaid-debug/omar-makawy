'use client';

import React, { useState, useEffect, useCallback } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import {
  MessageCircle,
  Phone,
  Mail,
  Send,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Paperclip,
  RefreshCw,
  ChevronLeft,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { createSupportApi, SupportTicket, TicketDetailsResponse } from '@omar-makawy/shared';

let cachedContactInfo: { whatsapp_number?: string; phone_number?: string; email?: string } = {};
let cachedStudentTickets: SupportTicket[] = [];

export default function SupportClient() {
  const [contactInfo, setContactInfo] = useState<{
    whatsapp_number?: string;
    phone_number?: string;
    email?: string;
  }>(() => cachedContactInfo);

  const [tickets, setTickets] = useState<SupportTicket[]>(() => cachedStudentTickets);
  const [activeTicket, setActiveTicket] = useState<TicketDetailsResponse | null>(null);
  const [loadingTickets, setLoadingTickets] = useState<boolean>(() => cachedStudentTickets.length === 0);
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [message, setMessage] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch Public Contact Info
  useEffect(() => {
    async function fetchContact() {
      try {
        const data: any = await apiClient.get('/public/contact');
        if (data) {
          cachedContactInfo = data;
          setContactInfo(data);
        }
      } catch (err) {
        // Silent fallback
      }
    }
    fetchContact();
  }, []);

  // Fetch Student Tickets
  const fetchStudentTickets = useCallback(async () => {
    if (cachedStudentTickets.length === 0) {
      setLoadingTickets(true);
    }
    try {
      const supportApi = createSupportApi(apiClient as any);
      const res = await supportApi.getStudentTickets();
      const list = res.data || [];
      cachedStudentTickets = list;
      setTickets(list);
    } catch (err) {
      // User might be unauthenticated guest or error
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  useEffect(() => {
    fetchStudentTickets();
  }, [fetchStudentTickets]);

  const loadTicketDetails = async (id: string) => {
    try {
      const supportApi = createSupportApi(apiClient as any);
      const res = await supportApi.getStudentTicketDetails(id);
      setActiveTicket(res);
      setShowNewTicketForm(false);
    } catch (err: any) {
      alert(err?.message || 'فشل في تحميل التذكرة');
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setCreatingTicket(true);
    setError(null);

    try {
      const supportApi = createSupportApi(apiClient as any);
      const res = await supportApi.createStudentTicket({
        subject: subject.trim(),
        category,
        message: message.trim(),
      });

      setSubject('');
      setMessage('');
      setShowNewTicketForm(false);
      setSuccess('تم إنشاء تذكرة الدعم بنجاح');
      setTimeout(() => setSuccess(null), 3000);
      await fetchStudentTickets();
      await loadTicketDetails(res.id);
    } catch (err: any) {
      setError(err?.message || 'فشل في إنشاء التذكرة');
    } finally {
      setCreatingTicket(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyMessage.trim()) return;

    setSendingReply(true);

    try {
      const supportApi = createSupportApi(apiClient as any);
      await supportApi.sendStudentReply(activeTicket.id, {
        message: replyMessage.trim(),
      });

      setReplyMessage('');
      await loadTicketDetails(activeTicket.id);
    } catch (err: any) {
      alert(err?.message || 'فشل في إرسال الرد');
    } finally {
      setSendingReply(false);
    }
  };

  const formatWhatsappUrl = (num?: string) => {
    if (!num) return '#';
    const clean = num.replace(/[^0-9]/g, '');
    return `https://wa.me/${clean}`;
  };

  const statusBadges: Record<string, { label: string; bg: string; text: string }> = {
    OPEN: { label: 'مفتوحة', bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-400' },
    IN_PROGRESS: { label: 'جاري المتابعة', bg: 'bg-blue-100 dark:bg-blue-950/60', text: 'text-blue-700 dark:text-blue-400' },
    WAITING_FOR_STUDENT: { label: 'في انتظار ردك', bg: 'bg-purple-100 dark:bg-purple-950/60', text: 'text-purple-700 dark:text-purple-300' },
    RESOLVED: { label: 'تم الحل', bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-400' },
    CLOSED: { label: 'مغلقة', bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-400' },
  };

  return (
    <StudentLayout>
      <div className="space-y-8 animate-fade-in max-w-4xl">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            الدعم والمساعدة
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            نحن هنا لمساعدتك في أي استفسار أو مشكلة تواجهك في استخدام منصة مستر عمر مكاوي التعليمية
          </p>
        </div>

        {/* Dynamic Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contactInfo.whatsapp_number && (
            <a
              href={formatWhatsappUrl(contactInfo.whatsapp_number)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs hover:border-emerald-500/50 transition-all flex flex-col items-center text-center space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">تواصل عبر واتساب</h3>
              <p className="text-xs text-gray-500 font-mono" dir="ltr">
                {contactInfo.whatsapp_number}
              </p>
            </a>
          )}

          {contactInfo.phone_number && (
            <a
              href={`tel:${contactInfo.phone_number}`}
              className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs hover:border-emerald-500/50 transition-all flex flex-col items-center text-center space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">الاتصال بالموبايل</h3>
              <p className="text-xs text-gray-500 font-mono" dir="ltr">
                {contactInfo.phone_number}
              </p>
            </a>
          )}

          {contactInfo.email && (
            <a
              href={`mailto:${contactInfo.email}`}
              className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs hover:border-emerald-500/50 transition-all flex flex-col items-center text-center space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">البريد الإلكتروني</h3>
              <p className="text-xs text-gray-500">{contactInfo.email}</p>
            </a>
          )}
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        {/* Support Tickets Dashboard Section */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-5 bg-emerald-600 rounded-full inline-block" />
              تذاكر الدعم الفني الخاصة بك
            </h2>
            <button
              onClick={() => {
                setShowNewTicketForm(!showNewTicketForm);
                setActiveTicket(null);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              تذكرة جديدة
            </button>
          </div>

          {/* New Ticket Form */}
          {showNewTicketForm && (
            <form onSubmit={handleCreateTicket} className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 space-y-4">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">إنشاء طلب دعم جديد</h3>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  موضوع التذكرة
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="أدخل عنوان موضوع الاستفسار..."
                  className="w-full h-11 px-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  التصنيف
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="GENERAL">عامة</option>
                  <option value="TECHNICAL">مشكلة تقنية</option>
                  <option value="BILLING">استفسار مالي أو تفعيل</option>
                  <option value="ACADEMIC">أسئلة واستفسارات تعليمية</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  تفاصيل المشكلة
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب تفاصيل الاستفسار بوضوح..."
                  className="w-full p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTicketForm(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={creatingTicket}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                >
                  {creatingTicket ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  إرسال التذكرة
                </button>
              </div>
            </form>
          )}

          {/* Active Ticket Conversation View */}
          {activeTicket ? (
            <div className="space-y-4">
              <button
                onClick={() => setActiveTicket(null)}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <ChevronLeft className="w-4 h-4 rotate-180" />
                العودة لقائمة التذاكر
              </button>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {activeTicket.ticket_number}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${statusBadges[activeTicket.status]?.bg || ''} ${statusBadges[activeTicket.status]?.text || ''}`}>
                    {statusBadges[activeTicket.status]?.label || activeTicket.status}
                  </span>
                </div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">{activeTicket.subject}</h3>
              </div>

              {/* Messages Feed */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {activeTicket.messages?.map((msg) => {
                  const isStaff = msg.sender_type === 'STAFF';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isStaff ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                          {isStaff ? (msg.sender_name || 'خدمة العملاء') : 'أنت'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {new Date(msg.created_at).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                          isStaff
                            ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-950 dark:text-emerald-100 border border-emerald-200 dark:border-emerald-800/80 rounded-tl-none'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tr-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Student Reply Input */}
              {activeTicket.status !== 'CLOSED' && (
                <form onSubmit={handleSendReply} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="اكتب ردك هنا..."
                    className="flex-1 h-11 px-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || !replyMessage.trim()}
                    className="px-5 h-11 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                  >
                    {sendingReply ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    إرسال الرد
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Tickets List */
            <div>
              {loadingTickets ? (
                <div className="py-8 text-center text-xs text-gray-400">جاري تحميل تذاكرك...</div>
              ) : tickets.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400 space-y-1">
                  <p className="font-semibold text-gray-600 dark:text-gray-300">لا توجد لديك تذاكر دعم سابقة</p>
                  <p>يمكنك إنشاء تذكرة جديدة للحصول على المساعدة من فريق الدعم</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((tkt) => {
                    const badge = statusBadges[tkt.status] || {
                      label: tkt.status,
                      bg: 'bg-gray-100',
                      text: 'text-gray-600',
                    };
                    return (
                      <div
                        key={tkt.id}
                        onClick={() => loadTicketDetails(tkt.id)}
                        className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 hover:border-emerald-500/50 transition-all cursor-pointer flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1 truncate">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              {tkt.ticket_number}
                            </span>
                            <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                              {tkt.subject}
                            </span>
                          </div>
                          {tkt.last_message && (
                            <p className="text-xs text-gray-500 truncate">{tkt.last_message}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                          <ChevronLeft className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
