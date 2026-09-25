import React from 'react';
import Link from 'next/link';
import { Phone, Mail, Youtube, Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-700 dark:bg-gray-900 text-white font-cairo mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-2">Omar Meckawy</h3>
            <p className="text-brand-200 text-sm mb-6">English Made Simple</p>
            <p className="text-gray-300 dark:text-gray-400 mb-6 max-w-sm">
              منصة تعليمية متكاملة تهدف إلى تبسيط اللغة الإنجليزية وجعلها في متناول الجميع بطرق حديثة وتفاعلية.
            </p>
            <div className="flex space-x-4 space-x-reverse">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-500 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-500 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-500 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-500 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4 border-b border-white/20 pb-2 inline-block">روابط سريعة</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-gray-300 hover:text-white transition-colors">الرئيسية</Link></li>
              <li><Link href="/courses" className="text-gray-300 hover:text-white transition-colors">الكورسات</Link></li>
              <li><Link href="/bookstore" className="text-gray-300 hover:text-white transition-colors">المتجر</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-4 border-b border-white/20 pb-2 inline-block">الدعم</h4>
            <ul className="space-y-3">
              <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors">تواصل معنا</Link></li>
              <li><Link href="/faq" className="text-gray-300 hover:text-white transition-colors">الأسئلة الشائعة</Link></li>
            </ul>
            <div className="mt-6 space-y-3">
              <div className="flex items-center space-x-2 space-x-reverse text-gray-300">
                <Phone className="w-4 h-4" />
                <span dir="ltr">+20 123 456 7890</span>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse text-gray-300">
                <Mail className="w-4 h-4" />
                <span>info@omarmeckawy.com</span>
              </div>
            </div>
          </div>

        </div>
        
        <div className="border-t border-white/10 mt-12 pt-8 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Omar Meckawy. جميع الحقوق محفوظة</p>
        </div>
      </div>
    </footer>
  );
}
