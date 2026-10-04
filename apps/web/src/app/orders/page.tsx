'use client';

import React, { useState, useEffect } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import EmptyState from '@/components/ui/EmptyState';
import { ShoppingBag, MapPin, Truck, Calendar, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { apiClient } from '@/lib/api';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'قيد الانتظار', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  CONFIRMED: { label: 'مؤكد', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  PREPARING: { label: 'قيد التجهيز', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  SHIPPED: { label: 'تم الشحن والتسليم لشركة التوصيل', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  DELIVERED: { label: 'تم التوصيل بنجاح', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  CANCELLED: { label: 'ملغى', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  RETURNED: { label: 'مرتجع', color: 'bg-stone-500/10 text-stone-500 border-stone-500/20' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchOrders() {
      setLoading(true);
      try {
        const res: any = await apiClient.get('/orders').catch(() => null);
        const list = res?.data || (Array.isArray(res) ? res : []);
        if (isMounted) {
          setOrders(Array.isArray(list) ? list : []);
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

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in text-gray-900 dark:text-gray-100">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            طلباتي
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            متابعة طلبات شراء المذكرات والكتب الدراسية وحالة التوصيل للشحن
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const orderNum = order.order_number || order.orderNumber || order.id;
              const statusObj = STATUS_MAP[order.status] || { label: order.status || 'قيد المعالجة', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' };
              const isExpanded = expandedOrderId === order.id;
              const items = Array.isArray(order.items) ? order.items : [];

              return (
                <div
                  key={order.id}
                  className="rounded-3xl bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800/80 shadow-xs overflow-hidden transition-all"
                >
                  <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-extrabold text-base font-mono text-gray-900 dark:text-white">
                            #{orderNum}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${statusObj.color}`}>
                            {statusObj.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(order.created_at || order.createdAt || Date.now()).toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                            {order.governorate_name_snapshot || 'المحافظة'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800">
                      <div className="text-start md:text-end">
                        <span className="text-[11px] text-gray-400 block">الإجمالي الشامل</span>
                        <span className="font-black text-lg text-emerald-600 dark:text-emerald-400">
                          {(Number(order.total_amount || order.totalAmount) || 0).toLocaleString()} ج.م
                        </span>
                      </div>

                      <button
                        onClick={() => toggleExpand(order.id)}
                        className="px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <span>{isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* EXPANDED DETAILS */}
                  {isExpanded && (
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/30 space-y-4">
                      {/* Shipping Info Card */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div>
                          <span className="text-gray-400 block">المستلم:</span>
                          <strong className="text-gray-900 dark:text-white font-bold">{order.recipient_name || 'غير محدد'}</strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block">رقم التواصل:</span>
                          <strong className="text-gray-900 dark:text-white font-mono font-bold" dir="ltr">{order.recipient_phone || 'غير محدد'}</strong>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-gray-400 block">عنوان الشحن تفصيلاً:</span>
                          <p className="text-gray-800 dark:text-gray-200 font-medium mt-0.5">
                            {order.governorate_name_snapshot ? `${order.governorate_name_snapshot} - ` : ''}
                            {order.shipping_address || 'لم يحدد عنوان'}
                            {order.landmark ? ` (علامة مميزة: ${order.landmark})` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Items Ordered List */}
                      {items.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-gray-500 block">الكتب والمذكرات المطلوبة:</span>
                          <div className="space-y-2">
                            {items.map((it: any, idx: number) => (
                              <div
                                key={it.id || idx}
                                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800 text-xs"
                              >
                                <div className="flex items-center gap-2.5">
                                  <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />
                                  <span className="font-bold text-gray-900 dark:text-white">
                                    {it.title_ar || it.title_en || `كتاب #${it.book_id}`}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-extrabold text-[11px]">
                                    × {it.quantity}
                                  </span>
                                </div>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                  {(Number(it.total_price) || 0).toLocaleString()} ج.م
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Pricing Breakdown */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-gray-500">
                        <div>
                          <span>مجموع الكتب: <strong>{(Number(order.subtotal) || 0).toLocaleString()} ج.م</strong></span>
                          <span className="mx-2">|</span>
                          <span>تكلفة الشحن: <strong>{(Number(order.shipping_fee) || 0).toLocaleString()} ج.م</strong></span>
                        </div>
                        <div className="text-emerald-600 dark:text-emerald-400 font-black text-sm">
                          الإجمالي الخصم من المحفظة: {(Number(order.total_amount) || 0).toLocaleString()} ج.م
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
