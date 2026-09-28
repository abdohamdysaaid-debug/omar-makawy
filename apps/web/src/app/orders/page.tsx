'use client';

import React, { useState, useEffect } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import EmptyState from '@/components/ui/EmptyState';
import { ShoppingBag, Clock, PackageCheck } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchOrders() {
      setLoading(true);
      try {
        const res = await apiClient.get<any[]>('/bookstore/my-orders').catch(() => []);
        if (isMounted) {
          if (Array.isArray(res)) {
            setOrders(res);
          } else {
            setOrders([]);
          }
        }
      } catch {
        if (isMounted) setOrders([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            طلباتي
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            متابعة طلبات شراء المذكرات والكتب الدراسية وحالة التوصيل
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-6 rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-gray-900 dark:text-white">
                        طلب #{order.orderNumber || order.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                        {order.status || 'قيد المعالجة'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">تاريخ الطلب: {order.createdAt || 'اليوم'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-end">
                    <span className="text-xs text-gray-400 block">الإجمالي</span>
                    <span className="font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                      {order.totalAmount || 0} جنيه
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="ShoppingBag"
            title="لا توجد طلبات سابقة"
            description="لم تقم بإجراء أي طلبات شراء كتب أو مذكرات حتى الآن."
            actionText="تصفح معرض الكتب"
            actionUrl="/bookstore"
          />
        )}
      </div>
    </StudentLayout>
  );
}
