'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import EmptyState from '@/components/ui/EmptyState';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api';
import {
  Trash2,
  Minus,
  Plus,
  BookOpen,
  MapPin,
  User,
  Phone,
  Truck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Wallet,
  ArrowLeft,
} from 'lucide-react';

const FALLBACK_GOVERNORATES = [
  { id: 'b0000000-0000-0000-0000-000000000001', code: 'CAIRO', name_ar: 'القاهرة', base_cost: 45.0 },
  { id: 'b0000000-0000-0000-0000-000000000002', code: 'GIZA', name_ar: 'الجيزة', base_cost: 45.0 },
  { id: 'b0000000-0000-0000-0000-000000000003', code: 'ALEXANDRIA', name_ar: 'الإسكندرية', base_cost: 50.0 },
  { id: 'b0000000-0000-0000-0000-000000000004', code: 'QUALYUBIA', name_ar: 'القليوبية', base_cost: 50.0 },
  { id: 'b0000000-0000-0000-0000-000000000005', code: 'SHARQIA', name_ar: 'الشرقية', base_cost: 50.0 },
  { id: 'b0000000-0000-0000-0000-000000000006', code: 'DAKAHLIA', name_ar: 'الدقهلية', base_cost: 50.0 },
  { id: 'b0000000-0000-0000-0000-000000000007', code: 'GHARBIA', name_ar: 'الغربية', base_cost: 50.0 },
  { id: 'b0000000-0000-0000-0000-000000000008', code: 'MONUFIA', name_ar: 'المنوفية', base_cost: 50.0 },
  { id: 'b0000000-0000-0000-0000-000000000009', code: 'BEHEIRA', name_ar: 'البحيرة', base_cost: 50.0 },
  { id: 'b0000000-0000-0000-0000-000000000010', code: 'KAFR_EL_SHEIKH', name_ar: 'كفر الشيخ', base_cost: 50.0 },
  { id: 'b0000000-0000-0000-0000-000000000011', code: 'DAMIETTA', name_ar: 'دمياط', base_cost: 55.0 },
  { id: 'b0000000-0000-0000-0000-000000000012', code: 'PORT_SAID', name_ar: 'بورسعيد', base_cost: 55.0 },
  { id: 'b0000000-0000-0000-0000-000000000013', code: 'ISMAILIA', name_ar: 'الإسماعيلية', base_cost: 55.0 },
  { id: 'b0000000-0000-0000-0000-000000000014', code: 'SUEZ', name_ar: 'السويس', base_cost: 55.0 },
  { id: 'b0000000-0000-0000-0000-000000000015', code: 'BENI_SUEF', name_ar: 'بني سويف', base_cost: 60.0 },
  { id: 'b0000000-0000-0000-0000-000000000016', code: 'FAYOUM', name_ar: 'الفيوم', base_cost: 60.0 },
  { id: 'b0000000-0000-0000-0000-000000000017', code: 'MINYA', name_ar: 'المنيا', base_cost: 65.0 },
  { id: 'b0000000-0000-0000-0000-000000000018', code: 'ASYUT', name_ar: 'أسيوط', base_cost: 65.0 },
  { id: 'b0000000-0000-0000-0000-000000000019', code: 'SOHAG', name_ar: 'سوهاج', base_cost: 70.0 },
  { id: 'b0000000-0000-0000-0000-000000000020', code: 'QENA', name_ar: 'قنا', base_cost: 70.0 },
  { id: 'b0000000-0000-0000-0000-000000000021', code: 'LUXOR', name_ar: 'الأقصر', base_cost: 75.0 },
  { id: 'b0000000-0000-0000-0000-000000000022', code: 'ASWAN', name_ar: 'أسوان', base_cost: 75.0 },
  { id: 'b0000000-0000-0000-0000-000000000023', code: 'RED_SEA', name_ar: 'البحر الأحمر', base_cost: 80.0 },
  { id: 'b0000000-0000-0000-0000-000000000024', code: 'NEW_VALLEY', name_ar: 'الوادي الجديد', base_cost: 80.0 },
  { id: 'b0000000-0000-0000-0000-000000000025', code: 'MATROUH', name_ar: 'مطروح', base_cost: 80.0 },
  { id: 'b0000000-0000-0000-0000-000000000026', code: 'NORTH_SINAI', name_ar: 'شمال سيناء', base_cost: 85.0 },
  { id: 'b0000000-0000-0000-0000-000000000027', code: 'SOUTH_SINAI', name_ar: 'جنوب سيناء', base_cost: 85.0 },
];

const isValidUUID = (str?: string) =>
  !!str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export default function CartClient() {
  const { items, totalPrice, removeItem, updateQuantity, clearCart } = useCart();
  const { isAuthenticated, student } = useAuth();

  // Shipping Form State
  const [governorates, setGovernorates] = useState<any[]>(FALLBACK_GOVERNORATES);
  const [loadingGovs, setLoadingGovs] = useState(true);
  const [selectedGovId, setSelectedGovId] = useState<string>(FALLBACK_GOVERNORATES[0].id);
  const [recipientName, setRecipientName] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');
  const [secondaryPhone, setSecondaryPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Execution & Feedback State
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isInsufficientBalance, setIsInsufficientBalance] = useState(false);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);

  // Initialize form default values from student context
  useEffect(() => {
    if (student) {
      setRecipientName((prev) => prev || student.fullName || '');
      setRecipientPhone((prev) => prev || student.phone || '');
      const studentGovId = (student as any).governorateId || (student as any).governorate_id;
      if (isValidUUID(studentGovId)) {
        setSelectedGovId(studentGovId);
      }
    }
  }, [student]);

  // Fetch active governorates & shipping rates
  useEffect(() => {
    let isMounted = true;
    async function fetchGovs() {
      try {
        setLoadingGovs(true);
        const res: any = await apiClient.get('/orders/governorates');
        const list = Array.isArray(res) ? res : res?.data || [];
        if (isMounted) {
          const validList = list.filter((g: any) => isValidUUID(g.id));
          const finalGovs = validList.length > 0 ? validList : FALLBACK_GOVERNORATES;
          setGovernorates(finalGovs);

          const studentGovId = (student as any)?.governorateId || (student as any)?.governorate_id;
          if (isValidUUID(studentGovId) && finalGovs.some((g: any) => g.id === studentGovId)) {
            setSelectedGovId(studentGovId);
          } else if (finalGovs.length > 0) {
            setSelectedGovId(finalGovs[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load governorates', err);
        if (isMounted) {
          setGovernorates(FALLBACK_GOVERNORATES);
          setSelectedGovId(FALLBACK_GOVERNORATES[0].id);
        }
      } finally {
        if (isMounted) setLoadingGovs(false);
      }
    }
    fetchGovs();
    return () => {
      isMounted = false;
    };
  }, [student]);

  const selectedGov = governorates.find((g) => g.id === selectedGovId);
  const shippingFee = Number(selectedGov?.base_cost || 0);
  const finalTotal = totalPrice + shippingFee;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsInsufficientBalance(false);

    if (!isAuthenticated) {
      setErrorMsg('يرجى تسجيل الدخول أولاً لإكمال عملية الطلب والشحن.');
      return;
    }

    if (!selectedGovId) {
      setErrorMsg('يرجى اختيار المحافظة لإعادة حساب تكلفة الشحن.');
      return;
    }

    if (!recipientName.trim()) {
      setErrorMsg('يرجى إدخال الاسم بالكامل للمستلم.');
      return;
    }

    if (!recipientPhone.trim()) {
      setErrorMsg('يرجى إدخال رقم الهاتف للتواصل.');
      return;
    }

    if (!shippingAddress.trim()) {
      setErrorMsg('يرجى إدخال العنوان تفصيلاً لتسليم الطلب.');
      return;
    }

    try {
      setSubmitting(true);
      let finalGovId = selectedGovId;
      if (!isValidUUID(finalGovId)) {
        const fallbackGov = governorates.find((g: any) => isValidUUID(g.id)) || FALLBACK_GOVERNORATES[0];
        finalGovId = fallbackGov.id;
        setSelectedGovId(finalGovId);
      }

      const payload = {
        governorate_id: finalGovId,
        recipient_name: recipientName.trim(),
        recipient_phone: recipientPhone.trim(),
        shipping_address: shippingAddress.trim(),
        landmark: landmark.trim() || undefined,
        secondary_phone: secondaryPhone.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const res: any = await apiClient.post('/orders/checkout', payload);
      const order = res?.order || res;

      // Clear cart upon clean creation
      clearCart();
      setCreatedOrder(order);
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message || 'حدث خطأ أثناء تنفيذ الطلب.';
      if (status === 401 || msg.includes('Unauthorized') || msg.includes('unauthorized')) {
        setIsUnauthorized(true);
        setErrorMsg('جلسة الدخول الخاصة بك انتهت أو غير متاحة. يرجى تسجيل الدخول مجدداً لإتمام الشراء.');
      } else if (
        msg.includes('WALLET_BALANCE') ||
        msg.includes('balance') ||
        err?.response?.data?.error_code === 'INSUFFICIENT_WALLET_BALANCE'
      ) {
        setIsInsufficientBalance(true);
        setErrorMsg('رصيد محفظتك الحالي غير كافٍ لتغطية إجمالي الطلب والشحن. يرجى شحن المحفظة أولاً.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-cairo flex flex-col text-gray-900 dark:text-gray-100">
      <Navbar />

      <main className="container mx-auto px-4 py-8 flex-1 pt-24 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">سلة التسوق وإتمام الشحن</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              مراجعة محتويات السلة وتحديد بيانات التوصيل
            </p>
          </div>
          <Link
            href="/bookstore"
            className="flex items-center gap-1.5 text-xs font-bold text-[#0d6e4f] dark:text-emerald-400 hover:underline"
          >
            <span>متابعة التسوق</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* ORDER SUCCESS MODAL / DIALOG */}
        {createdOrder && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#131b2e] rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center space-y-6 border border-emerald-500/30 shadow-2xl animate-scale-up">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">تم إرسال الطلب بنجاح!</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  تم خصم مبلغ الطلب والشحن بنجاح من محفظتك الإلكترونية، وجاري تجهيز طلبك للشحن.
                </p>
                <div className="py-2 px-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm inline-block">
                  رقم الطلب: {createdOrder.order_number || createdOrder.id}
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/student/orders"
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Truck className="w-4 h-4" />
                  <span>متابعة حالة الطلب</span>
                </Link>
                <Link
                  href="/bookstore"
                  className="px-6 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-sm transition-all"
                >
                  العودة للمتجر
                </Link>
              </div>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <EmptyState
            icon="ShoppingCart"
            title="السلة فارغة"
            description="تصفح معرض الكتب والمذكرات لإضافة احتياجاتك إلى السلة."
            actionText="الذهاب لمعرض الكتب"
            actionUrl="/bookstore"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white dark:bg-surface-dark rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800/80">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>محتويات السلة ({items.length})</span>
                </h2>

                <div className="space-y-4 divide-y divide-gray-100 dark:divide-gray-800">
                  {items.map((item) => (
                    <div key={item.book.id} className="pt-4 first:pt-0 flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20 overflow-hidden">
                        {item.book.cover_image_url ? (
                          <img
                            src={item.book.cover_image_url}
                            alt={item.book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BookOpen className="w-8 h-8 text-emerald-600 opacity-60" />
                        )}
                      </div>

                      <div className="flex-1 text-center sm:text-start">
                        <h3 className="font-extrabold text-base text-gray-900 dark:text-white leading-snug">
                          {item.book.title}
                        </h3>
                        <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm mt-1">
                          {item.book.price} جنيه
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-bold text-xs">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.book.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                          title="إزالة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Checkout Form & Shipping Address */}
            <div className="lg:col-span-5 space-y-6">
              <form
                onSubmit={handleCheckoutSubmit}
                className="bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800/80 space-y-5"
              >
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">بيانات التوصيل والشحن</h2>
                </div>

                {errorMsg && (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                    {isInsufficientBalance && (
                      <div className="pt-2">
                        <Link
                          href="/student/wallet"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition-colors"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          <span>الانتقال لشحن المحفظة</span>
                        </Link>
                      </div>
                    )}
                    {isUnauthorized && (
                      <div className="pt-2">
                        <Link
                          href="/login?redirect=/cart"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs transition-colors"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>تسجيل الدخول الآن</span>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Recipient Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    الاسم بالكامل (اسم المستلم) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="أدخل الاسم الرباعي"
                      className="w-full h-11 ps-10 pe-4 text-xs font-bold bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-2xl focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <User className="w-4 h-4 text-gray-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Recipient Phone */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    رقم المحمول للتواصل والتسليم *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full h-11 ps-10 pe-4 text-xs font-bold bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-2xl focus:outline-none focus:border-emerald-500 transition-colors text-start"
                    />
                    <Phone className="w-4 h-4 text-gray-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Governorate Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    المحافظة (لتحديد قيمة الشحن) *
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={selectedGovId}
                      onChange={(e) => setSelectedGovId(e.target.value)}
                      className="w-full h-11 ps-10 pe-4 text-xs font-bold bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-2xl focus:outline-none focus:border-emerald-500 transition-colors appearance-none"
                    >
                      {loadingGovs ? (
                        <option value="">جاري تحميل المحافظات...</option>
                      ) : governorates.length === 0 ? (
                        <option value="">لا توجد محافظات متاحة حالياً</option>
                      ) : (
                        governorates.map((gov) => (
                          <option key={gov.id} value={gov.id}>
                            {gov.name_ar} - شحن ({(Number(gov.base_cost) || 0).toLocaleString()} ج.م)
                          </option>
                        ))
                      )}
                    </select>
                    <MapPin className="w-4 h-4 text-gray-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Detailed Address */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    العنوان التفصيلي للتوصيل *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="الحي، اسم الشارع، رقم المبنى، رقم الشقة أو الدور"
                    className="w-full p-3.5 text-xs font-bold bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-2xl focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                  />
                </div>

                {/* Optional Landmark & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400">
                      علامة مميزة (اختياري)
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="بجوار مسجد / صيدلية..."
                      className="w-full h-10 px-3 text-xs bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400">
                      ملاحظات للشحن (اختياري)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="الاتصال قبل التوصيل..."
                      className="w-full h-10 px-3 text-xs bg-gray-50 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Price Summary Box */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2.5">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>مجموع المنتجات بالسلة</span>
                    <span className="font-bold text-gray-900 dark:text-white">{totalPrice.toLocaleString()} ج.م</span>
                  </div>

                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>
                      مصاريف الشحن ({selectedGov ? selectedGov.name_ar : 'المحافظة'})
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedGov ? `${shippingFee.toLocaleString()} ج.م` : 'تحدد حسب المحافظة'}
                    </span>
                  </div>

                  <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />

                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                      الإجمالي النهائي المراد خصمه
                    </span>
                    <span className="font-black text-xl text-emerald-600 dark:text-emerald-400">
                      {finalTotal.toLocaleString()} ج.م
                    </span>
                  </div>
                </div>

                {/* Submit Checkout Button */}
                <button
                  type="submit"
                  disabled={submitting || items.length === 0}
                  className="w-full h-12 rounded-2xl font-black text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>جاري خصم المبلغ وتأكيد الشحن...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>تأكيد الطلب والشحن ({finalTotal.toLocaleString()} ج.م)</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
