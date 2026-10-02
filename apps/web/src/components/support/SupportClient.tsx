'use client';

import React from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import { MessageCircle, Phone, Mail, Send } from 'lucide-react';

export default function SupportClient() {
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

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="https://wa.me/201234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs hover:border-emerald-500/50 transition-all flex flex-col items-center text-center space-y-3 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white">تواصل عبر واتساب</h3>
            <p className="text-xs text-gray-500">الدعم الفني السريع عبر الواتساب</p>
          </a>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white">الهاتف المحمول</h3>
            <p className="text-xs text-gray-500">01234567890</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white">البريد الإلكتروني</h3>
            <p className="text-xs text-gray-500">support@omarmeckawy.com</p>
          </div>
        </div>

        {/* Send Ticket Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-5 bg-emerald-600 rounded-full inline-block" />
            إرسال استفسار أو بلاغ
          </h2>

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('تم إرسال الرسالة بنجاح، سيتواصل معك فريق الدعم قريباً.'); }}>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                موضوع الاستفسار
              </label>
              <input
                type="text"
                required
                placeholder="أدخل عنوان موضوع الاستفسار..."
                className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                تفاصيل الرسالة
              </label>
              <textarea
                required
                rows={4}
                placeholder="اكتب استفسارك أو مشكلتك بالتفصيل هنا..."
                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              إرسال الرسالة
            </button>
          </form>
        </div>
      </div>
    </StudentLayout>
  );
}
