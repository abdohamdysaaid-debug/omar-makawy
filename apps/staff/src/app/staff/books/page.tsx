'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { staffApiClient as apiClient } from '@/context/StaffAuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useAcademicYearScope } from '@/context/AcademicYearContext';
import { SystemPermissions } from '@omar-makawy/shared';
import {
  BookOpen,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Package,
  Truck,
  MapPin,
  DollarSign,
  AlertTriangle,
  Upload,
  Crop as CropIcon,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  FileText,
  Boxes,
  ShieldCheck,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/FeedbackStates';

export default function StaffBooksPage() {
  const { t, language } = useLanguage();
  const { hasPermission, isTeacher } = usePermissions();
  const { availableYears, activeAcademicYearId } = useAcademicYearScope();

  // Active Tab: 'books' | 'inventory' | 'shipping' | 'orders'
  const [activeTab, setActiveTab] = useState<'books' | 'inventory' | 'shipping' | 'orders'>('books');

  // --- TAB 1: BOOKS CATALOG STATE ---
  const [books, setBooks] = useState<any[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [booksError, setBooksError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'BOOK' | 'NOTE'>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State for Add/Edit Book
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState<any | null>(null);
  const [bookForm, setBookForm] = useState({
    academic_year_id: activeAcademicYearId || '',
    type: 'NOTE',
    title_ar: '',
    title_en: '',
    description_ar: '',
    description_en: '',
    sku: '',
    price: 150,
    discount_price: 0,
    stock_quantity: 50,
    weight_kg: 0.5,
    cover_image_url: '',
    is_active: true,
    is_featured: false,
    is_public: true,
  });

  // Image Crop & Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // --- TAB 2: INVENTORY STATE ---
  const [inventoryBook, setInventoryBook] = useState<any | null>(null);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [inventoryForm, setInventoryForm] = useState({
    type: 'RESTOCK',
    quantity: 10,
    reason: 'إضافة شحنة جديدة',
  });
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  // --- TAB 3: SHIPPING RATES STATE ---
  const [governorates, setGovernorates] = useState<any[]>([]);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [editingGov, setEditingGov] = useState<any | null>(null);
  const [govForm, setGovForm] = useState({
    base_cost: 50,
    estimated_delivery_days: 3,
    is_active: true,
    is_shipping_available: true,
  });

  // --- TAB 4: ORDERS STATE ---
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Global Action Processing
  const [actionProcessing, setActionProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Fetch Books List
  const fetchBooks = useCallback(async () => {
    setBooksLoading(true);
    setBooksError(null);
    try {
      const params = new URLSearchParams();
      if (activeAcademicYearId) params.append('academic_year_id', activeAcademicYearId);
      if (statusFilter !== 'ALL') params.append('is_active', statusFilter === 'ACTIVE' ? 'true' : 'false');
      if (typeFilter !== 'ALL') params.append('type', typeFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      params.append('page', String(page));
      params.append('limit', '20');

      const res: any = await apiClient.get(`/api/v1/books?${params.toString()}`);
      if (res?.data) {
        let filtered = res.data;
        if (stockFilter === 'IN_STOCK') filtered = filtered.filter((b: any) => Number(b.stock_quantity) > 5);
        if (stockFilter === 'LOW_STOCK') filtered = filtered.filter((b: any) => Number(b.stock_quantity) > 0 && Number(b.stock_quantity) <= 5);
        if (stockFilter === 'OUT_OF_STOCK') filtered = filtered.filter((b: any) => Number(b.stock_quantity) === 0);

        setBooks(filtered);
        setTotalPages(res.totalPages || 1);
      } else if (Array.isArray(res)) {
        setBooks(res);
      }
    } catch (err: any) {
      setBooksError(err?.message || 'فشل في تحميل المذكرات والكتب');
    } finally {
      setBooksLoading(false);
    }
  }, [activeAcademicYearId, statusFilter, typeFilter, stockFilter, searchQuery, page]);

  // Fetch Shipping Rates
  const fetchShippingRates = useCallback(async () => {
    setShippingLoading(true);
    try {
      const res: any = await apiClient.get('/api/v1/orders/shipping-rates');
      const list = res?.data || (Array.isArray(res) ? res : []);
      setGovernorates(list);
    } catch {
      setGovernorates([]);
    } finally {
      setShippingLoading(false);
    }
  }, []);

  // Fetch Orders
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const params = new URLSearchParams();
      if (orderStatusFilter !== 'ALL') params.append('status', orderStatusFilter);
      params.append('limit', '50');

      const res: any = await apiClient.get(`/api/v1/orders?${params.toString()}`);
      const list = res?.data || (Array.isArray(res) ? res : []);
      setOrders(list);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, [orderStatusFilter]);

  useEffect(() => {
    if (activeTab === 'books') fetchBooks();
    if (activeTab === 'shipping') fetchShippingRates();
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab, fetchBooks, fetchShippingRates, fetchOrders]);

  // Handle File Upload to StorageService
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'book-covers');

      const uploadRes: any = await apiClient.post('/api/v1/storage/upload', formData);
      const url = uploadRes?.url || uploadRes?.data?.url || uploadRes?.storagePath;
      if (url) {
        setBookForm((prev) => ({ ...prev, cover_image_url: url }));
        setImagePreviewUrl(url);
      }
    } catch {
      // Fallback preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  // Submit Book Add/Edit Form
  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionProcessing(true);
    setActionError(null);

    try {
      const payload: any = {
        academic_year_id: bookForm.academic_year_id,
        type: bookForm.type || 'NOTE',
        title_ar: bookForm.title_ar,
        title_en: bookForm.title_en || undefined,
        description_ar: bookForm.description_ar || undefined,
        description_en: bookForm.description_en || undefined,
        sku: bookForm.sku ? bookForm.sku.trim() : `BK-${Date.now().toString().slice(-6)}`,
        price: Number(bookForm.price),
        discount_price: bookForm.discount_price ? Number(bookForm.discount_price) : 0,
        stock_quantity: Number(bookForm.stock_quantity),
        weight_kg: Number(bookForm.weight_kg || 0.5),
        cover_image_url: bookForm.cover_image_url || undefined,
        is_active: Boolean(bookForm.is_active),
        is_featured: Boolean(bookForm.is_featured),
        is_public: Boolean(bookForm.is_public),
      };

      if (editingBook) {
        await apiClient.put(`/api/v1/books/${editingBook.id}`, payload);
      } else {
        await apiClient.post('/api/v1/books', payload);
      }

      setShowBookModal(false);
      setEditingBook(null);
      fetchBooks();
    } catch (err: any) {
      setActionError(err?.response?.data?.message || err?.message || 'فشل حفظ المذكرة');
    } finally {
      setActionProcessing(false);
    }
  };

  // Toggle Publish/Unpublish or Deactivate
  const handleToggleBookStatus = async (book: any) => {
    try {
      if (book.is_active) {
        await apiClient.post(`/api/v1/books/${book.id}/unpublish`, {});
      } else {
        await apiClient.post(`/api/v1/books/${book.id}/publish`, {});
      }
      fetchBooks();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'فشل تعديل حالة المذكرة');
    }
  };

  // Safe Delete Book
  const handleDeleteBook = async (book: any) => {
    if (!confirm(`هل أنت تأكد من إلغاء/حذف "${book.title_ar}"؟`)) return;
    try {
      await apiClient.delete(`/api/v1/books/${book.id}`);
      fetchBooks();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'فشل حذف المذكرة');
    }
  };

  // Submit Inventory Adjustment
  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventoryBook) return;

    setActionProcessing(true);
    try {
      await apiClient.post(`/api/v1/books/${inventoryBook.id}/inventory/adjust`, inventoryForm);
      setShowInventoryModal(false);
      setInventoryBook(null);
      fetchBooks();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'فشل تعديل المخزون');
    } finally {
      setActionProcessing(false);
    }
  };

  // Submit Shipping Rate Edit
  const handleGovSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGov) return;

    setActionProcessing(true);
    try {
      await apiClient.put(`/api/v1/orders/shipping-rates/${editingGov.id}`, govForm);
      setEditingGov(null);
      fetchShippingRates();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'فشل تعديل سعر الشحن');
    } finally {
      setActionProcessing(false);
    }
  };

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setActionProcessing(true);
    try {
      await apiClient.put(`/api/v1/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'فشل تحديث حالة الطلب');
    } finally {
      setActionProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <BookOpen className="w-6 h-6" />
            </div>
            الكتب والمذكرات والدليل الأكاديمي
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            إدارة الكتب والمذكرات الدراسية، أسعار الشحن للمحافظات، وإدارة طلبات الكتب ومتابعة المخزون
          </p>
        </div>

        <button
          onClick={() => {
            if (activeTab === 'books') fetchBooks();
            if (activeTab === 'shipping') fetchShippingRates();
            if (activeTab === 'orders') fetchOrders();
          }}
          className="self-start sm:self-auto h-10 px-4 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-bold text-neutral-300 hover:text-white transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          تحديث البيانات
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-neutral-800/80 space-x-2 space-x-reverse overflow-x-auto">
        <button
          onClick={() => setActiveTab('books')}
          className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'books'
              ? 'border-emerald-500 text-white bg-neutral-900/60'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          دليل الكتب والمذكرات
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'border-emerald-500 text-white bg-neutral-900/60'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Boxes className="w-4 h-4" />
          إدارة المخزون والكميات
        </button>

        <button
          onClick={() => setActiveTab('shipping')}
          className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'shipping'
              ? 'border-emerald-500 text-white bg-neutral-900/60'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4" />
          أسعار الشحن للمحافظات (27 محافظة)
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-emerald-500 text-white bg-neutral-900/60'
              : 'border-transparent text-neutral-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          طلبات الكتب والمذكرات
        </button>
      </div>

      {/* TAB 1: BOOKS CATALOG */}
      {activeTab === 'books' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="p-4 rounded-2xl bg-[#111813] border border-neutral-800/80 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="h-10 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
              >
                <option value="ALL">جميع الأنواع (كتب ومذكرات)</option>
                <option value="NOTE">مذكرات فقط</option>
                <option value="BOOK">كتب فقط</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="h-10 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white"
              >
                <option value="ALL">جميع الحالات</option>
                <option value="ACTIVE">مفعّل فقط</option>
                <option value="INACTIVE">معطّل فقط</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 text-neutral-500 absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث باسم المذكرة أو الكود..."
                  className="w-full h-10 ps-9 pe-4 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Add Book Button */}
              <button
                onClick={() => {
                  setEditingBook(null);
                  setBookForm({
                    academic_year_id: activeAcademicYearId || availableYears[0]?.id || '',
                    type: 'NOTE',
                    title_ar: '',
                    title_en: '',
                    description_ar: '',
                    description_en: '',
                    sku: `BK-${Date.now().toString().slice(-6)}`,
                    price: 150,
                    discount_price: 0,
                    stock_quantity: 50,
                    weight_kg: 0.5,
                    cover_image_url: '',
                    is_active: true,
                    is_featured: false,
                    is_public: true,
                  });
                  setImagePreviewUrl(null);
                  setShowBookModal(true);
                }}
                className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                إضافة مذكرة / كتاب
              </button>
            </div>
          </div>

          {/* Books Grid */}
          {booksLoading ? (
            <LoadingState message="جاري تحميل الكتب والمذكرات..." />
          ) : booksError ? (
            <ErrorState message={booksError} onRetry={fetchBooks} />
          ) : books.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {books.map((b) => (
                <div
                  key={b.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                    b.is_active
                      ? 'bg-[#111813] border-neutral-800/80 shadow-sm'
                      : 'bg-neutral-900/40 border-neutral-800/40 opacity-60'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Cover Preview Aspect 2:3 */}
                    <div className="aspect-[2/3] w-full max-h-48 rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden relative group flex items-center justify-center">
                      {b.cover_image_url ? (
                        <img
                          src={b.cover_image_url}
                          alt={b.title_ar}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="w-12 h-12 text-neutral-800" />
                      )}

                      <div className="absolute top-2 start-2 flex flex-col gap-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
                          {b.type === 'NOTE' ? 'مذكرة' : 'كتاب'}
                        </span>
                        {b.is_featured && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                            مميز
                          </span>
                        )}
                      </div>

                      <div className="absolute top-2 end-2">
                        <button
                          onClick={() => handleToggleBookStatus(b)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                            b.is_active
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                          }`}
                        >
                          {b.is_active ? 'مفعّل' : 'معطّل'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-white text-sm line-clamp-1">{b.title_ar}</h3>
                      <p className="text-[11px] text-neutral-400 line-clamp-1">{b.academic_year_name_ar || 'الصف الدراسي'}</p>
                    </div>

                    <div className="flex items-baseline justify-between pt-2 border-t border-neutral-800/60">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-black text-emerald-400 text-base">
                          {Number(b.discount_price || b.price).toLocaleString()} ج.م
                        </span>
                        {b.discount_price && Number(b.discount_price) < Number(b.price) && (
                          <span className="text-xs text-neutral-500 line-through">
                            {Number(b.price).toLocaleString()} ج.م
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[11px] font-bold ${
                          Number(b.stock_quantity) > 5
                            ? 'text-neutral-400'
                            : Number(b.stock_quantity) > 0
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }`}
                      >
                        المخزون: {b.stock_quantity}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-800/60">
                    <button
                      onClick={() => {
                        setEditingBook(b);
                        setBookForm({
                          academic_year_id: b.academic_year_id,
                          type: b.type || 'NOTE',
                          title_ar: b.title_ar || '',
                          title_en: b.title_en || '',
                          description_ar: b.description_ar || '',
                          description_en: b.description_en || '',
                          sku: b.sku || '',
                          price: Number(b.price),
                          discount_price: b.discount_price ? Number(b.discount_price) : 0,
                          stock_quantity: Number(b.stock_quantity || 0),
                          weight_kg: Number(b.weight_kg || 0.5),
                          cover_image_url: b.cover_image_url || '',
                          is_active: b.is_active,
                          is_featured: b.is_featured || false,
                          is_public: b.is_public || false,
                        });
                        setImagePreviewUrl(b.cover_image_url || null);
                        setShowBookModal(true);
                      }}
                      className="flex-1 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      تعديل
                    </button>

                    <button
                      onClick={() => handleDeleteBook(b)}
                      className="h-8 px-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs transition-colors"
                      title="إلغاء تفعيل / حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="لا توجد كتب أو مذكرات"
              description="قم بإضافة المذكرات والكتب الدراسية ليتمكن الطلاب من تصفحها وطلبها."
            />
          )}
        </div>
      )}

      {/* TAB 2: INVENTORY MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <p className="text-xs text-neutral-400">
            متابعة الرصيد المتاح من المذكرات وإجراء التسويات الإضافية وتتبع السجل المحاسبي للمخزون
          </p>

          <div className="rounded-2xl bg-[#111813] border border-neutral-800/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead>
                  <tr className="border-b border-neutral-800/80 bg-neutral-900/40 text-neutral-400 font-bold">
                    <th className="p-4 text-start">اسم المذكرة / الكتاب</th>
                    <th className="p-4 text-start">النوع</th>
                    <th className="p-4 text-start">كود المذكرة SKU</th>
                    <th className="p-4 text-start">المخزون الحالي</th>
                    <th className="p-4 text-start">حد التنبيه</th>
                    <th className="p-4 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {books.map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-900/50 transition-colors">
                      <td className="p-4 font-bold text-white">{b.title_ar}</td>
                      <td className="p-4 text-neutral-400">{b.type === 'NOTE' ? 'مذكرة' : 'كتاب'}</td>
                      <td className="p-4 font-mono text-neutral-400">{b.sku}</td>
                      <td className="p-4">
                        <span
                          className={`font-black text-sm ${
                            Number(b.stock_quantity) > 5
                              ? 'text-emerald-400'
                              : Number(b.stock_quantity) > 0
                              ? 'text-amber-400'
                              : 'text-red-400'
                          }`}
                        >
                          {b.stock_quantity} قطعة
                        </span>
                      </td>
                      <td className="p-4 text-neutral-400">{b.low_stock_threshold || 5} قطعة</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            setInventoryBook(b);
                            setInventoryForm({
                              type: 'RESTOCK',
                              quantity: 10,
                              reason: 'إضافة شحنة جديدة للمخزون',
                            });
                            setShowInventoryModal(true);
                          }}
                          className="h-8 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-[11px] transition-colors inline-flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          تعديل المخزون
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SHIPPING RATES (27 GOVERNORATES) */}
      {activeTab === 'shipping' && (
        <div className="space-y-4">
          <p className="text-xs text-neutral-400">
            تحديد تكلفة الشحن وحالة الشحن لجميع المحافظات الـ 27 لضمان حساب الشحن دقيقاً
          </p>

          {shippingLoading ? (
            <LoadingState message="جاري تحميل أسعار الشحن..." />
          ) : governorates.length > 0 ? (
            <div className="rounded-2xl bg-[#111813] border border-neutral-800/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead>
                    <tr className="border-b border-neutral-800/80 bg-neutral-900/40 text-neutral-400 font-bold">
                      <th className="p-4 text-start">المحافظة</th>
                      <th className="p-4 text-start">الكود</th>
                      <th className="p-4 text-start">سعر الشحن الرئيسي (ج.م)</th>
                      <th className="p-4 text-start">الأيام المتوقعة والتوصيل</th>
                      <th className="p-4 text-start">الحالة</th>
                      <th className="p-4 text-center">تعديل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {governorates.map((g) => (
                      <tr key={g.id} className="hover:bg-neutral-900/50 transition-colors">
                        <td className="p-4 font-bold text-white">{g.name_ar}</td>
                        <td className="p-4 font-mono text-neutral-400">{g.code}</td>
                        <td className="p-4 font-black text-sm text-emerald-400">
                          {Number(g.base_cost).toLocaleString()} ج.م
                        </td>
                        <td className="p-4 text-neutral-400">{g.estimated_days || 3} أيام عمل</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              g.is_active && g.is_shipping_available
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                            }`}
                          >
                            {g.is_active && g.is_shipping_available ? 'مفتوح للشحن' : 'مغلق'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => {
                              setEditingGov(g);
                              setGovForm({
                                base_cost: Number(g.base_cost || 50),
                                estimated_delivery_days: g.estimated_days || 3,
                                is_active: g.is_active ?? true,
                                is_shipping_available: g.is_shipping_available ?? true,
                              });
                            }}
                            className="h-8 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-[11px] transition-colors"
                          >
                            تعديل السعر
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState title="لا توجد بيانات شحن" description="تعذر استرجاع محافظات الجمهورية." />
          )}
        </div>
      )}

      {/* TAB 4: BOOK ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#111813] border border-neutral-800/80 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    orderStatusFilter === st
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                >
                  {st === 'ALL'
                    ? 'الكل'
                    : st === 'PENDING'
                    ? 'قيد الانتظار'
                    : st === 'CONFIRMED'
                    ? 'مؤكد'
                    : st === 'PREPARING'
                    ? 'قيد التجهيز'
                    : st === 'SHIPPED'
                    ? 'تم الشحن'
                    : st === 'DELIVERED'
                    ? 'تم التوصيل'
                    : 'ملغى'}
                </button>
              ))}
            </div>
          </div>

          {ordersLoading ? (
            <LoadingState message="جاري تحميل طلبات الكتب..." />
          ) : orders.length > 0 ? (
            <div className="rounded-2xl bg-[#111813] border border-neutral-800/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead>
                    <tr className="border-b border-neutral-800/80 bg-neutral-900/40 text-neutral-400 font-bold">
                      <th className="p-4 text-start">رقم الطلب</th>
                      <th className="p-4 text-start">الطالب / المستلم</th>
                      <th className="p-4 text-start">المحافظة الشحن</th>
                      <th className="p-4 text-start">الإجمالي (ج.م)</th>
                      <th className="p-4 text-start">التاريخ</th>
                      <th className="p-4 text-start">الحالة</th>
                      <th className="p-4 text-center">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-neutral-900/50 transition-colors">
                        <td className="p-4 font-mono font-bold text-emerald-300">{ord.order_number}</td>
                        <td className="p-4">
                          <p className="font-bold text-white">{ord.recipient_name}</p>
                          <p className="text-[11px] text-neutral-400 dir-ltr text-start">{ord.recipient_phone}</p>
                        </td>
                        <td className="p-4 text-neutral-300">
                          {ord.governorate_name_snapshot || ord.governorate_id || 'المحافظة'}
                        </td>
                        <td className="p-4 font-black text-sm text-emerald-400">
                          {(Number(ord.total_amount) || 0).toLocaleString()} ج.م
                        </td>
                        <td className="p-4 text-neutral-400 text-[11px]">
                          {new Date(ord.created_at).toLocaleDateString('ar-EG', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="h-8 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-[11px] transition-colors inline-flex items-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            تفاصيل
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState title="لا توجد طلبات كتب" description="لم يتم تسجيل أي طلبات شراء كتب حتى الآن." />
          )}
        </div>
      )}

      {/* ADD / EDIT BOOK MODAL */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-3xl bg-[#111813] border border-neutral-800 text-white p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowBookModal(false)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold">
              {editingBook ? 'تعديل كتاب / مذكرة' : 'إضافة كتاب أو مذكرة دراسية جديدة'}
            </h2>

            {actionError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-bold">
                {actionError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Side */}
              <form onSubmit={handleBookSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1">نوع المنتج: *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setBookForm({ ...bookForm, type: 'NOTE' })}
                      className={`h-10 rounded-xl font-bold transition-all border ${
                        bookForm.type === 'NOTE'
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                      }`}
                    >
                      مذكرة دراسية
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookForm({ ...bookForm, type: 'BOOK' })}
                      className={`h-10 rounded-xl font-bold transition-all border ${
                        bookForm.type === 'BOOK'
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                      }`}
                    >
                      كتاب شروحات
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">الاسم بالعربي: *</label>
                  <input
                    type="text"
                    value={bookForm.title_ar}
                    onChange={(e) => setBookForm({ ...bookForm, title_ar: e.target.value })}
                    required
                    placeholder="مذكرة الشرح والأسئلة الشاملة..."
                    className="w-full h-10 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">السنة الدراسية: *</label>
                  <select
                    value={bookForm.academic_year_id}
                    onChange={(e) => setBookForm({ ...bookForm, academic_year_id: e.target.value })}
                    required
                    className="w-full h-10 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white"
                  >
                    {availableYears.map((ay) => (
                      <option key={ay.id} value={ay.id}>
                        {ay.name_ar}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1">السعر الأصل (ج.م): *</label>
                    <input
                      type="number"
                      value={bookForm.price}
                      onChange={(e) => setBookForm({ ...bookForm, price: Number(e.target.value) })}
                      required
                      min="0"
                      className="w-full h-10 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">سعر الخصم (اختر 0 إن لم يوجد):</label>
                    <input
                      type="number"
                      value={bookForm.discount_price}
                      onChange={(e) => setBookForm({ ...bookForm, discount_price: Number(e.target.value) })}
                      min="0"
                      className="w-full h-10 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-400 mb-1 font-bold">كمية المخزون (الاستوك): *</label>
                    <input
                      type="number"
                      value={bookForm.stock_quantity}
                      onChange={(e) => setBookForm({ ...bookForm, stock_quantity: Number(e.target.value) })}
                      required
                      min="0"
                      placeholder="مثال: 50"
                      className="w-full h-10 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-bold text-sm focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-400 mb-1">كود المذكرة (SKU):</label>
                    <input
                      type="text"
                      value={bookForm.sku}
                      onChange={(e) => setBookForm({ ...bookForm, sku: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-mono"
                    />
                  </div>
                </div>

                {/* Cover Upload */}
                <div>
                  <label className="block text-neutral-400 mb-1">صورة الغلاف (النسبة المقترحة 2:3):</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={bookForm.cover_image_url}
                      onChange={(e) => {
                        setBookForm({ ...bookForm, cover_image_url: e.target.value });
                        setImagePreviewUrl(e.target.value);
                      }}
                      placeholder="رابط الصورة أو ارفع ملف من جهازك"
                      className="flex-1 h-10 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-[11px]"
                    />
                    <label className="h-10 px-3 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1 cursor-pointer hover:bg-emerald-600/30">
                      <Upload className="w-4 h-4" />
                      {uploadingImage ? 'جاري...' : 'رفع'}
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1">الوصف بالعربي:</label>
                  <textarea
                    value={bookForm.description_ar}
                    onChange={(e) => setBookForm({ ...bookForm, description_ar: e.target.value })}
                    rows={2}
                    className="w-full p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-emerald-500/40 transition-all">
                    <input
                      type="checkbox"
                      checked={bookForm.is_active}
                      onChange={(e) => setBookForm({ ...bookForm, is_active: e.target.checked })}
                      className="w-4 h-4 rounded accent-emerald-600"
                    />
                    <div>
                      <span className="font-bold text-white block text-xs">مفعّل ومتاح للطلب</span>
                      <span className="text-[10px] text-neutral-400 block">يظهر للطالب في معرض الكتب والمذكرات</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-emerald-500/40 transition-all">
                    <input
                      type="checkbox"
                      checked={bookForm.is_featured}
                      onChange={(e) => setBookForm({ ...bookForm, is_featured: e.target.checked })}
                      className="w-4 h-4 rounded accent-emerald-600"
                    />
                    <div>
                      <span className="font-bold text-emerald-400 block text-xs">عرض في الصفحة الرئيسية ⭐</span>
                      <span className="text-[10px] text-neutral-400 block">يظهر في قسم المذكرات بالصفحة الرئيسية</span>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setShowBookModal(false)}
                    className="h-10 px-4 rounded-xl bg-neutral-800 text-neutral-300 font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={actionProcessing}
                    className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  >
                    حفظ المنتج
                  </button>
                </div>
              </form>

              {/* Live Student Card Preview */}
              <div className="space-y-3 border-s border-neutral-800 ps-0 md:ps-6">
                <span className="text-xs font-bold text-neutral-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  معاينة كارت الطالب الحي (Student Card Preview):
                </span>

                <div className="p-4 rounded-2xl bg-[#0d1310] border border-emerald-500/20 shadow-lg space-y-3">
                  <div className="aspect-[2/3] w-full max-h-56 rounded-xl bg-neutral-950 border border-neutral-800 overflow-hidden relative flex items-center justify-center">
                    {imagePreviewUrl || bookForm.cover_image_url ? (
                      <img
                        src={imagePreviewUrl || bookForm.cover_image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="w-12 h-12 text-neutral-800" />
                    )}
                    <span className="absolute top-2 start-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/80 text-emerald-400">
                      {bookForm.type === 'NOTE' ? 'مذكرة' : 'كتاب'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-sm">{bookForm.title_ar || 'عنوان المذكرة'}</h4>
                    <p className="text-xs text-neutral-400">الصف الدراسي المحدد</p>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-emerald-400">
                      {(bookForm.discount_price && bookForm.discount_price > 0
                        ? bookForm.discount_price
                        : bookForm.price
                      ).toLocaleString()}{' '}
                      ج.م
                    </span>
                    {bookForm.discount_price && bookForm.discount_price < bookForm.price ? (
                      <span className="text-xs text-neutral-500 line-through">
                        {bookForm.price.toLocaleString()} ج.م
                      </span>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    disabled
                    className="w-full h-9 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 opacity-90"
                  >
                    عرض التفاصيل / شراء
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT INVENTORY MODAL */}
      {showInventoryModal && inventoryBook && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#111813] border border-neutral-800 text-white p-6 space-y-4">
            <h3 className="text-base font-bold">تعديل مخزون: {inventoryBook.title_ar}</h3>

            <form onSubmit={handleInventorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">نوع الحركة:</label>
                <select
                  value={inventoryForm.type}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, type: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white"
                >
                  <option value="RESTOCK">إضافة شحنة (Restock +)</option>
                  <option value="ADJUSTMENT_IN">تعديل بالزيادة (+)</option>
                  <option value="ADJUSTMENT_OUT">تعديل بالسحب (-)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">الكمية:</label>
                <input
                  type="number"
                  value={inventoryForm.quantity}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: Number(e.target.value) })}
                  min="1"
                  required
                  className="w-full h-10 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">سبب التعديل: *</label>
                <input
                  type="text"
                  value={inventoryForm.reason}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, reason: e.target.value })}
                  required
                  placeholder="إضافة كمية مطبوعة جديدة..."
                  className="w-full h-10 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInventoryModal(false)}
                  className="h-10 px-4 rounded-xl bg-neutral-800 text-neutral-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionProcessing}
                  className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  تأكيد التعديل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SHIPPING RATE MODAL */}
      {editingGov && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#111813] border border-neutral-800 text-white p-6 space-y-4">
            <h3 className="text-base font-bold">تعديل سعر الشحن: محافظة {editingGov.name_ar}</h3>

            <form onSubmit={handleGovSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">سعر الشحن الأساسي (ج.م):</label>
                <input
                  type="number"
                  value={govForm.base_cost}
                  onChange={(e) => setGovForm({ ...govForm, base_cost: Number(e.target.value) })}
                  min="0"
                  required
                  className="w-full h-10 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">الأيام المتوقعة للتوصيل:</label>
                <input
                  type="number"
                  value={govForm.estimated_delivery_days}
                  onChange={(e) => setGovForm({ ...govForm, estimated_delivery_days: Number(e.target.value) })}
                  min="1"
                  required
                  className="w-full h-10 px-3 rounded-xl bg-neutral-900 border border-neutral-800 text-white"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={govForm.is_shipping_available}
                    onChange={(e) => setGovForm({ ...govForm, is_shipping_available: e.target.checked })}
                    className="rounded accent-emerald-600"
                  />
                  <span>متاح للشحن لهذة المحافظة</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingGov(null)}
                  className="h-10 px-4 rounded-xl bg-neutral-800 text-neutral-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionProcessing}
                  className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  حفظ التعديل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT ORDER MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-[#111813] border border-neutral-800 text-white p-6 space-y-6 relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 left-5 p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">تفاصيل طلب الكتاب #{selectedOrder.order_number}</h2>
                <p className="text-xs text-neutral-400">مراجعة بيانات الشحن والمستلم وتغيير حالة الطلب</p>
              </div>
            </div>

            {/* Address Snapshot */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2 text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                بيانات التوصيل والشحن المسجلة (Order Address Snapshot):
              </span>
              <div className="grid grid-cols-2 gap-2 text-neutral-300">
                <p>
                  <strong className="text-white">المستلم:</strong> {selectedOrder.recipient_name}
                </p>
                <p>
                  <strong className="text-white">الهاتف:</strong> {selectedOrder.recipient_phone}
                </p>
                <p>
                  <strong className="text-white">المحافظة:</strong> {selectedOrder.governorate_name_snapshot || 'المحافظة'}
                </p>
                <p>
                  <strong className="text-white">العنوان:</strong> {selectedOrder.shipping_address}
                </p>
                {selectedOrder.landmark && (
                  <p className="col-span-2">
                    <strong className="text-white">العلامة المميزة:</strong> {selectedOrder.landmark}
                  </p>
                )}
              </div>
            </div>

            {/* Order Totals */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">سعر المشتريات:</span>
                <span className="text-white">{(Number(selectedOrder.subtotal) || 0).toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">رسوم الشحن:</span>
                <span className="text-white">{(Number(selectedOrder.shipping_fee) || 0).toLocaleString()} ج.م</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-800 font-bold text-sm">
                <span className="text-emerald-400">الإجمالي:</span>
                <span className="text-emerald-400">{(Number(selectedOrder.total_amount) || 0).toLocaleString()} ج.م</span>
              </div>
            </div>

            {/* State Machine Action Transitions */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-neutral-400">تحديث حالة الطلب:</span>
              <div className="flex flex-wrap gap-2">
                {['CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, st)}
                    disabled={actionProcessing || selectedOrder.status === st}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedOrder.status === st
                        ? 'bg-emerald-600 text-white'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    {st === 'CONFIRMED'
                      ? 'تأكيد'
                      : st === 'PREPARING'
                      ? 'تجهيز'
                      : st === 'SHIPPED'
                      ? 'شحن'
                      : st === 'DELIVERED'
                      ? 'تسليم'
                      : 'إلغاء'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
