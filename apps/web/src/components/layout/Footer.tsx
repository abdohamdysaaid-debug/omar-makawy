'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, Mail, Youtube, Facebook, Instagram, Twitter } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { apiClient } from '@/lib/api/client';

export default function Footer() {
  const { t } = useLanguage();

  const [contactInfo, setContactInfo] = useState<{
    facebook_url?: string;
    youtube_url?: string;
    instagram_url?: string;
    x_url?: string;
    whatsapp_number?: string;
    phone_number?: string;
    email?: string;
  }>({});

  useEffect(() => {
    let isMounted = true;
    async function fetchContact() {
      try {
        const data: any = await apiClient.get('/public/contact');
        if (isMounted && data) {
          setContactInfo(data);
        }
      } catch (err) {
        // Fallback silently if offline or endpoint unseeded
      }
    }
    fetchContact();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('/#')) {
      const targetId = href.replace('/#', '');
      const elem = document.getElementById(targetId);
      if (elem) {
        e.preventDefault();
        elem.scrollIntoView({ behavior: 'smooth' });
        window.history.replaceState(null, '', href);
      }
    }
  };

  const hasSocial =
    contactInfo.youtube_url ||
    contactInfo.facebook_url ||
    contactInfo.instagram_url ||
    contactInfo.x_url;

  return (
    <footer className="bg-brand-700 dark:bg-black text-white font-cairo mt-auto border-t border-brand-800 dark:border-stone-800">
      <div className="container mx-auto px-4 pt-12 pb-24 sm:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-400/40 shadow-sm shrink-0 bg-white dark:bg-stone-900">
                <img src="/assets/omar-avatar.jpg" alt="Mr. Omar Meckawy" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl font-bold">{t('teacher.title', 'Mr. Omar Meckawy')}</h3>
            </div>
            <p className="text-gray-200 dark:text-gray-400 mb-6 max-w-sm text-sm sm:text-base leading-relaxed">
              {t(
                'footer.description',
                'منصة تعليمية متكاملة تهدف إلى تبسيط اللغة الإنجليزية وجعلها في متناول الجميع بطرق حديثة وتفاعلية.'
              )}
            </p>
            {hasSocial && (
              <div className="flex space-x-4 space-x-reverse">
                {contactInfo.youtube_url && (
                  <a
                    href={contactInfo.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 dark:bg-[#181818] border dark:border-stone-800 flex items-center justify-center hover:bg-brand-500 transition-colors"
                  >
                    <Youtube className="w-5 h-5 text-gray-200 dark:text-gray-300" />
                  </a>
                )}
                {contactInfo.facebook_url && (
                  <a
                    href={contactInfo.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 dark:bg-[#181818] border dark:border-stone-800 flex items-center justify-center hover:bg-brand-500 transition-colors"
                  >
                    <Facebook className="w-5 h-5 text-gray-200 dark:text-gray-300" />
                  </a>
                )}
                {contactInfo.instagram_url && (
                  <a
                    href={contactInfo.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 dark:bg-[#181818] border dark:border-stone-800 flex items-center justify-center hover:bg-brand-500 transition-colors"
                  >
                    <Instagram className="w-5 h-5 text-gray-200 dark:text-gray-300" />
                  </a>
                )}
                {contactInfo.x_url && (
                  <a
                    href={contactInfo.x_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/10 dark:bg-[#181818] border dark:border-stone-800 flex items-center justify-center hover:bg-brand-500 transition-colors"
                  >
                    <Twitter className="w-5 h-5 text-gray-200 dark:text-gray-300" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4 border-b border-white/20 dark:border-stone-800 pb-2 inline-block">
              {t('footer.quickLinks', 'روابط سريعة')}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-gray-200 dark:text-gray-300 hover:text-white dark:hover:text-emerald-400 transition-colors text-sm"
                >
                  {t('nav.home', 'الرئيسية')}
                </Link>
              </li>
              <li>
                <Link
                  href="/#packages"
                  onClick={(e) => handleAnchorClick(e, '/#packages')}
                  className="text-gray-200 dark:text-gray-300 hover:text-white dark:hover:text-emerald-400 transition-colors text-sm"
                >
                  {t('nav.packages', 'الباقات')}
                </Link>
              </li>
              <li>
                <Link
                  href="/#courses"
                  onClick={(e) => handleAnchorClick(e, '/#courses')}
                  className="text-gray-200 dark:text-gray-300 hover:text-white dark:hover:text-emerald-400 transition-colors text-sm"
                >
                  {t('nav.courses', 'الكورسات')}
                </Link>
              </li>
              <li>
                <Link
                  href="/#books"
                  onClick={(e) => handleAnchorClick(e, '/#books')}
                  className="text-gray-200 dark:text-gray-300 hover:text-white dark:hover:text-emerald-400 transition-colors text-sm"
                >
                  {t('nav.books', 'الكتب')}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy/"
                  className="text-gray-200 dark:text-gray-300 hover:text-white dark:hover:text-emerald-400 transition-colors text-sm"
                >
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link
                  href="/delete-account/"
                  className="text-gray-200 dark:text-gray-300 hover:text-white dark:hover:text-emerald-400 transition-colors text-sm"
                >
                  طلب حذف الحساب
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-gray-200 dark:text-gray-300 hover:text-white dark:hover:text-emerald-400 transition-colors text-sm"
                >
                  {t('bottomNav.profile', 'حسابي')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4 border-b border-white/20 dark:border-stone-800 pb-2 inline-block">
              {t('nav.contact', 'تواصل معنا')}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/student/support"
                  className="text-gray-200 dark:text-gray-300 hover:text-white dark:hover:text-emerald-400 transition-colors text-sm"
                >
                  الدعم والمساعدة
                </Link>
              </li>
            </ul>
            <div className="mt-6 space-y-3">
              {contactInfo.phone_number && (
                <a
                  href={`tel:${contactInfo.phone_number}`}
                  className="flex items-center space-x-2 space-x-reverse text-gray-200 dark:text-gray-300 text-sm hover:text-emerald-400 transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span dir="ltr">{contactInfo.phone_number}</span>
                </a>
              )}
              {contactInfo.email && (
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-center space-x-2 space-x-reverse text-gray-200 dark:text-gray-300 text-sm hover:text-emerald-400 transition-colors"
                >
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <span>{contactInfo.email}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer Developer & Copyright Section */}
        <div className="border-t border-white/10 dark:border-stone-800/80 mt-12 pt-8 text-center text-sm text-gray-300 dark:text-gray-400 flex flex-col items-center justify-center space-y-1.5">
          <div className="text-xs sm:text-sm text-emerald-400 dark:text-emerald-400 font-mono font-bold" dir="ltr">
            &lt;Developed by=&quot;
            <a
              href="https://www.facebook.com/share/1BwtYMEFcW/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-emerald-300 underline underline-offset-4 decoration-emerald-400 font-extrabold transition-colors mx-0.5"
            >
              Abdelrhman
            </a>
            &quot;&gt;
          </div>
          <div className="text-xs sm:text-sm text-gray-300 dark:text-gray-400 font-medium">
            حقوق الطبع والنشر © 2026 ELHDAD TECH
          </div>
        </div>
      </div>
    </footer>
  );
}
