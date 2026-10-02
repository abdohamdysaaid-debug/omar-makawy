'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, CheckCircle, Video, ArrowLeft } from 'lucide-react';

export default function TeacherIntroSection() {
  return (
    <section
      id="teacher"
      className="py-16 sm:py-24 bg-white dark:bg-[#020d08] transition-colors font-cairo border-t border-stone-200/60 dark:border-emerald-950/60 scroll-mt-20"
      aria-label="عن مستر عمر مكاوي والمنصة التعليمية"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Right Column (Arabic RTL): Image and Badges */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-5 flex flex-col items-center"
          >
            <div className="relative w-full max-w-[340px] sm:max-w-[380px]">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0d6e4f]/20 via-[#0d6e4f]/10 to-amber-500/10 rounded-3xl blur-2xl transform -rotate-3" />
              
              {/* Image Frame */}
              <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/30 bg-gradient-to-b from-stone-100 to-white dark:from-stone-900 dark:to-[#041a12] p-2 shadow-2xl shadow-[#0d6e4f]/15">
                <div className="rounded-2xl overflow-hidden bg-[#0d6e4f]/10">
                  <img
                    src="/assets/omar-avatar.jpg"
                    alt="مستر عمر مكاوي مدرس اللغة الإنجليزية"
                    className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-500"
                    width={400}
                    height={400}
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Floating Identity Card */}
              <div className="absolute -bottom-6 inset-x-4 bg-white/95 dark:bg-[#07241a]/95 backdrop-blur-md rounded-2xl p-3.5 border border-emerald-500/30 shadow-xl text-center">
                <p className="text-base font-black text-[#0d6e4f] dark:text-emerald-300">
                  مستر عمر مكاوي
                </p>
                <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mt-0.5">
                  Mr. Omar Meckawy — English Teacher
                </p>
              </div>
            </div>
          </motion.div>

          {/* Left Column (Arabic RTL): Crawlable Text & Bio */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
            className="lg:col-span-7 flex flex-col justify-center space-y-6 pt-6 lg:pt-0 text-start"
          >
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/30 self-start text-xs font-extrabold text-[#0d6e4f] dark:text-emerald-300">
              <GraduationCap className="w-4 h-4" />
              <span>منصة مستر عمر مكاوي التعليمية</span>
            </div>

            {/* Crawlable Main Heading */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-snug">
                مستر عمر مكاوي — <span className="text-[#0d6e4f] dark:text-emerald-400">مدرس اللغة الإنجليزية</span>
              </h2>
              <p className="text-xs sm:text-sm font-bold text-gray-500 dark:text-emerald-500/90 font-serif italic" dir="ltr">
                Mr. Omar Meckawy Platform | English Language Specialist
              </p>
            </div>

            {/* Real Platform Description */}
            <div className="space-y-3.5 text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
              <p>
                <strong>منصة مستر عمر مكاوي</strong> هي المنصة التعليمية الرسمية لتقديم كورسات ومحاضرات وباقات اللغة الإنجليزية لطلاب المرحلة الإعدادية والمرحلة الثانوية (التعليم العام والأزهري) بمحتوى تعليمي منظم وشامل حسب الصف الدراسي.
              </p>
              <p>
                يقدم <strong>مستر عمر مكاوي</strong> تجربة تعليمية متميزة ترتكز على تبسيط قواعد اللغة الإنجليزية، وتنمية مهارات المفردات والفهم والقراءة، مع متابعة دورية مستمرة، وامتحانات تفاعلية بعد كل درس، ومذكرات شرح وتدريبات معدّة بعناية.
              </p>
            </div>

            {/* Key Offerings List */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#071d15] border border-stone-200/80 dark:border-emerald-900/40 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-black text-[#0d6e4f] dark:text-emerald-300">
                  <Video className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>محاضرات وكورسات</span>
                </div>
                <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">
                  شرح تفصيلي للمنهج مع أمثلة وسلايدات توضيحية.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#071d15] border border-stone-200/80 dark:border-emerald-900/40 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-black text-[#0d6e4f] dark:text-emerald-300">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>امتحانات تفاعلية</span>
                </div>
                <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">
                  تقييم فوري ونماذج إجابات لتحسين مستوى الطالب.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#071d15] border border-stone-200/80 dark:border-emerald-900/40 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-black text-[#0d6e4f] dark:text-emerald-300">
                  <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>باقات ومذكرات</span>
                </div>
                <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">
                  باقات شهرية ومذكرات المنهج الرسمية مطبوعة وPDF.
                </p>
              </div>
            </div>

            {/* Internal Links Navigation */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Link
                href="/courses"
                className="px-6 py-2.5 rounded-xl bg-[#0d6e4f] hover:bg-[#0a4834] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-[#0d6e4f]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>تصفح كورسات اللغة الإنجليزية</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link
                href="/packages"
                className="px-6 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-gray-900 dark:text-white font-extrabold text-xs sm:text-sm border border-stone-300/80 dark:border-stone-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>عرض الباقات الشهرية</span>
              </Link>
              <Link
                href="/bookstore"
                className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-[#0d6e4f] dark:text-emerald-400 hover:underline"
              >
                <span>متجر الكتب والمذكرات</span>
              </Link>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
