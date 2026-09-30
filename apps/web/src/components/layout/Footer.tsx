'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, Youtube, Facebook, Instagram, Twitter } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-brand-700 dark:bg-black text-white font-cairo mt-auto border-t border-brand-800 dark:border-stone-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">{t('teacher.title', 'Mr. Omar Meckawy')}</h3>
            <p className="text-gray-200 dark:text-gray-400 mb-6 max-w-sm text-sm sm:text-base leading-relaxed">
              {t('footer.description', 'منصة تعليمية متكاملة تهدف إلى تبسيط اللغة الإنجليزية وجعلها في متناول الجميع بطرق حديثة وتفاعلية.')}
            </p>
            <div className="flex space-x-4 space-x-reverse">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 dark:bg-[#181818] border dark:border-stone-800 flex items-center justify-center hover:bg-brand-500 transition-colors">
                <Youtube className="w-5 h-5 text-gray-200 dark:text-gray-300" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 dark:bg-[#181818] border dark:border-stone-800 flex items-center justify-center hover:bg-brand-500 transition-colors">
                <Facebook className="w-5 h-5 text-gray-200 dark:text-gray-300" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 dark:bg-[#181818] border dark:border-stone-800 flex items-center justify-center hover:bg-brand-500 transition-colors">
                <Instagram className="w-5 h-5 text-gray-200 dark:text-gray-300" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 dark:bg-[#181818] border dark:border-stone-800 flex items-center justify-center hover:bg-brand-500 transition-colors">
                <Twitter className="w-5 h-5 text-gray-200 dark:text-gray-300" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4 border-b border-white/20 dark:border-stone-800 pb-2 inline-block">{t('footer.quickLinks', 'روابط سريعة')}</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-gray-200 dark:text-gray-300 hover:text-white dark:hover:text-emerald-400 transition-colors text-sm">{t('nav.home', 'الرئيسية')}</Link></li>
              <li><Link href="/courses" className="text-gray-200 dark:text-gray-300 hover:text-white dark:hover:text-emerald-400 transition-colors text-sm">{t('nav.courses', 'الكورسات')}</Link></li>
              <li><Link href="/bookstore" className="text-gray-200 dark:text-gray-300 hover:text-white dark:hover:text-emerald-400 transition-colors text-sm">{t('nav.store', 'المتجر')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4 border-b border-white/20 dark:border-stone-800 pb-2 inline-block">{t('nav.contact', 'تواصل معنا')}</h4>
            <ul className="space-y-3">
              <li><Link href="/#contact" className="text-gray-200 dark:text-gray-300 hover:text-white dark:hover:text-emerald-400 transition-colors text-sm">{t('nav.contact', 'تواصل معنا')}</Link></li>
            </ul>
            <div className="mt-6 space-y-3">
              <div className="flex items-center space-x-2 space-x-reverse text-gray-200 dark:text-gray-300 text-sm">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span dir="ltr">+20 123 456 7890</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse text-gray-200 dark:text-gray-300 text-sm">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>info@omarmeckawy.com</span>
              </div>
            </div>
          </div>

        </div>
        
        <div className="border-t border-white/10 dark:border-stone-800/80 mt-12 pt-8 text-center text-sm text-gray-300 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Omar Meckawy. {t('footer.rights', 'جميع الحقوق محفوظة.')}</p>
        </div>
      </div>
    </footer>
  );
}
