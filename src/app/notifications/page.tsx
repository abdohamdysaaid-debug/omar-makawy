'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { mockNotifications } from '@/data/mock';
import { Bell, BookOpen, FileCheck, Info, CheckCircle, CheckCircle2 } from 'lucide-react';

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login?returnUrl=/notifications');
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center font-cairo">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'course': return <BookOpen className="w-6 h-6 text-brand-500" />;
      case 'exam': return <FileCheck className="w-6 h-6 text-orange-500" />;
      case 'info': return <Info className="w-6 h-6 text-blue-500" />;
      case 'success': return <CheckCircle className="w-6 h-6 text-green-500" />;
      default: return <Bell className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-cairo flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl flex-1 pt-24">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">الإشعارات</h1>
          {notifications.some(n => !n.isRead) && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-sm font-bold text-brand-500 hover:text-brand-400 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              تحديد الكل كمقروء
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            icon="Bell"
            title="لا توجد إشعارات"
            description="أنت على اطلاع بكل جديد"
          />
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`relative bg-white dark:bg-surface-dark p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-start gap-4 transition-colors ${
                  !notification.isRead ? 'border-s-4 border-s-brand-500 bg-brand-50/30 dark:bg-brand-900/10' : ''
                }`}
              >
                <div className="shrink-0 p-3 bg-gray-50 dark:bg-gray-800 rounded-full">
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1">
                  <h3 className={`text-lg mb-1 ${!notification.isRead ? 'font-bold text-gray-900 dark:text-white' : 'font-semibold text-gray-700 dark:text-gray-300'}`}>
                    {notification.title}
                  </h3>
                  <p className={`text-sm mb-2 ${!notification.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                    {notification.message}
                  </p>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(notification.date).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
