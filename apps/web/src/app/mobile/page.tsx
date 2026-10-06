'use client';

import React from 'react';
import Link from 'next/link';
import { Smartphone, Download, ArrowRight, ExternalLink } from 'lucide-react';

export default function MobileAppLivePage() {
  return (
    <div className="min-h-screen bg-[#090A0F] text-white flex flex-col items-center justify-between p-4 md:p-8">
      {/* Top Header Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between py-3 px-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400">
            OM
          </div>
          <div>
            <h1 className="font-bold text-sm md:text-base text-white">تطبيق مستر عمر مكاوي للطلاب</h1>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              متصل مباشرة بـ API المنصة (api.omarmeckawy.com)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/app/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            فتح بملء الشاشة
          </a>
          <Link
            href="/"
            className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-neutral-300 text-xs rounded-lg transition"
          >
            الرئيسية
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Interactive Mobile Preview Container */}
      <main className="w-full flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-[420px] h-[780px] bg-[#000] rounded-[42px] p-3 shadow-2xl border-4 border-neutral-800 relative flex flex-col overflow-hidden">
          {/* Mobile Speaker / Camera Notch */}
          <div className="w-32 h-5 bg-neutral-900 rounded-full mx-auto mb-2 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-neutral-800"></div>
          </div>

          {/* Live Mobile Web App Frame */}
          <div className="flex-1 w-full rounded-[30px] overflow-hidden bg-[#090A0F]">
            <iframe
              src="/app/index.html"
              title="Omar Makawy Student Mobile App"
              className="w-full h-full border-0"
              allow="camera; microphone; geolocation"
            />
          </div>
        </div>
      </main>

      {/* Footer Info & APK Build instructions */}
      <footer className="w-full max-w-4xl text-center mt-6 text-xs text-neutral-400 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
        <span>نسخة التطبيق الرسمية v1.0.0 — جاهزة للرفع على Google Play Console</span>
        <div className="flex items-center gap-3 text-emerald-400">
          <span>📦 Package: com.omarmakawy.student</span>
        </div>
      </footer>
    </div>
  );
}
