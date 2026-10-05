'use client';

import React, { useEffect, useState } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import EmptyState from '@/components/ui/EmptyState';
import { useAuth } from '@/context/AuthContext';
import { Bell, BookOpen, FileCheck, Info, CheckCircle2 } from 'lucide-react';
import { Notification } from '@/types';
import { apiClient } from '@/lib/api';

let cachedNotificationsList: Notification[] = [];

export default function NotificationsClient() {
  const { student, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(() => cachedNotificationsList);
  const [loading, setLoading] = useState<boolean>(() => cachedNotificationsList.length === 0);

  useEffect(() => {
    let isMounted = true;

    async function fetchNotifications() {
      if (cachedNotificationsList.length === 0) {
        setLoading(true);
      }
      try {
        const res = await apiClient.get<Notification[]>('/notifications/my-notifications').catch(() => []);
        const list = Array.isArray(res) ? res : [];
        cachedNotificationsList = list;
        if (isMounted) {
          setNotifications(list);
        }
      } catch {
        if (isMounted && cachedNotificationsList.length === 0) setNotifications([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  const markAllAsRead = async () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    await apiClient.post('/notifications/mark-read', {}).catch(() => null);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'exam':
        return <FileCheck className="w-5 h-5 text-amber-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-emerald-500" />;
      default:
        return <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in max-w-3xl">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              الإشعارات والتنبيهات
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              تابع التحديثات والتنبيهات الصادرة من المعلم والإدارة
            </p>
          </div>

          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <CheckCircle2 className="w-4 h-4" />
              تحديد الكل كمقروء
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#131b2e] border transition-all flex items-start gap-4 ${
                  !notification.isRead
                    ? 'border-emerald-500/40 bg-emerald-50/10 dark:bg-emerald-950/20 shadow-xs'
                    : 'border-gray-100 dark:border-gray-800/80'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 shrink-0">
                  {getIcon(notification.type)}
                </div>

                <div className="space-y-1 flex-1">
                  <h3
                    className={`text-sm ${
                      !notification.isRead
                        ? 'font-extrabold text-gray-900 dark:text-white'
                        : 'font-semibold text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {notification.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {notification.message}
                  </p>
                  <span className="text-[10px] text-gray-400 block pt-1">{notification.date}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="Bell"
            title="لا توجد إشعارات حالياً"
            description="ستظهر هنا التنبيهات الخاصة بالمحاضرات والنتائج والرسائل الهامة."
          />
        )}
      </div>
    </StudentLayout>
  );
}
