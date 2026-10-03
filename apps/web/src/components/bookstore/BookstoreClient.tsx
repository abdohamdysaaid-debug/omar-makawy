'use client';

import React, { useState, useEffect } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import BookCard from '@/components/bookstore/BookCard';
import EmptyState from '@/components/ui/EmptyState';
import { books, academicYears } from '@/data/mock';
import { useAuth } from '@/context/AuthContext';
import { Search, ChevronDown, Filter } from 'lucide-react';

const LOCAL_STORAGE_GRADE_KEY = 'omar_selected_academic_grade';

function parseGrade(id?: string | number): number | undefined {
  if (!id) return undefined;
  if (typeof id === 'number') return id;
  const map: Record<string, number> = {
    'a0000000-0000-0000-0000-000000000001': 1,
    'a0000000-0000-0000-0000-000000000002': 2,
    'a0000000-0000-0000-0000-000000000003': 3,
    'a0000000-0000-0000-0000-000000000004': 4,
  };
  return map[id] || parseInt(id, 10) || undefined;
}

function getStoredGrade(studentAcademicYearId?: string | number): number | 'all' {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_GRADE_KEY);
      if (saved) {
        if (saved === 'all') return 'all';
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && [1, 2, 3, 4].includes(parsed)) {
          return parsed;
        }
      }
    } catch {}
  }
  return parseGrade(studentAcademicYearId) || 'all';
}

function saveStoredGrade(grade: number | 'all') {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_GRADE_KEY, String(grade));
    } catch {}
  }
}

export default function BookstoreClient() {
  const { student } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYearId, setSelectedYearId] = useState<number | 'all'>(() => {
    return getStoredGrade(student?.academicYearId);
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Sync if student logs in later and no manual override exists
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_GRADE_KEY);
      const studentGrade = parseGrade(student?.academicYearId);
      if (!saved && studentGrade) {
        setSelectedYearId(studentGrade);
        saveStoredGrade(studentGrade);
      }
    }
  }, [student?.academicYearId]);

  const handleYearChange = (newVal: number | 'all') => {
    setSelectedYearId(newVal);
    saveStoredGrade(newVal);
  };

  const [availableBooks, setAvailableBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadBooks() {
      setLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.omarmeckawy.com/api/v1';
        const res = await fetch(`${baseUrl}/books?is_active=true`).then((r) => r.json()).catch(() => []);
        const list = res?.data || (Array.isArray(res) ? res : []);
        if (isMounted) {
          setAvailableBooks(list);
        }
      } catch {
        if (isMounted) setAvailableBooks([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadBooks();
    return () => { isMounted = false; };
  }, []);

  const categories = ['مذكرات', 'تدريبات', 'قواعد', 'مراجعة'];

  const filteredBooks = availableBooks.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = selectedYearId === 'all' || book.academicYearId === selectedYearId;
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesYear && matchesCategory;
  });

  const selectedYearObj = academicYears.find((y) => y.id === selectedYearId);

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in font-cairo">
        {/* Header & Persistent Grade Dropdown */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/60 dark:border-gray-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-7 bg-emerald-600 rounded-full inline-block" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                معرض الكتب والمذكرات
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedYearId !== 'all' && selectedYearObj
                ? `عرض المذكرات والكتب المتاحة لـ ${selectedYearObj.title}`
                : 'تصفح واطلب المذكرات والكتب الدراسية المعتمدة لمستر عمر مكاوي'}
            </p>
          </div>

          {/* Persistent Dropdown Select Menu with ChevronDown icon */}
          <div className="flex items-center gap-2 bg-white dark:bg-[#131b2e] p-2.5 px-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs shrink-0 self-start md:self-auto">
            <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300 shrink-0">اختر الصف:</span>
            <div className="relative">
              <select
                value={selectedYearId}
                onChange={(e) => {
                  const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                  handleYearChange(val);
                }}
                className="appearance-none bg-stone-50 dark:bg-[#0c1017] border border-gray-200 dark:border-gray-700/80 text-gray-900 dark:text-white rounded-xl py-2 ps-3 pe-8 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
              >
                <option value="all">جميع المراحل الدراسية</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute end-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Search Input & Category Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="ابحث عن كتاب أو مذكرة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 ps-11 pe-4 text-xs font-semibold bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-xs"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white dark:bg-[#131b2e] text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800'
              }`}
            >
              الكل
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-white dark:bg-[#131b2e] text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Book Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-gray-100 dark:bg-gray-800 animate-pulse border border-gray-100 dark:border-gray-800" />
            ))}
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="py-8">
            <EmptyState
              icon="BookOpen"
              title="لا يوجد كتب حالياً"
              description="لم يتم إضافة أي كتب أو مذكرات دراسية لـهذا الصف أو البحث المحدد حالياً."
              actionText="جميع المراحل"
              actionUrl="/bookstore"
            />
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
