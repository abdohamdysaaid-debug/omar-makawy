'use client';

import React, { useState } from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import BookCard from '@/components/bookstore/BookCard';
import EmptyState from '@/components/ui/EmptyState';
import { books, academicYears } from '@/data/mock';
import { useAuth } from '@/context/AuthContext';
import { Search } from 'lucide-react';

export default function BookstoreClient() {
  const { student } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const defaultYear = student ? String(student.academicYearId) : 'all';
  const [selectedYear, setSelectedYear] = useState<string>(defaultYear);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['مذكرات', 'تدريبات', 'قواعد', 'مراجعة'];

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = selectedYear === 'all' || book.academicYearId === Number(selectedYear);
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesYear && matchesCategory;
  });

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            معرض الكتب والمذكرات
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            تصفح واطلب المذكرات والكتب الدراسية المعتمدة لمستر عمر مكاوي
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="ابحث عن كتاب أو مذكرة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 ps-11 pe-4 text-sm bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-11 px-4 text-sm bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 font-bold"
          >
            <option value="all">جميع المراحل</option>
            {academicYears.map((year) => (
              <option key={year.id} value={String(year.id)}>
                {year.title}
              </option>
            ))}
          </select>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
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
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white dark:bg-[#131b2e] text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Book Grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="py-8">
            <EmptyState
              icon="BookOpen"
              title="لا توجد كتب أو مذكرات متاحة"
              description="لم يتم العثور على مذكرات تصفح تطابق هذا الفلتر حالياً."
              actionText="عرض كل الكتب"
              actionUrl="/bookstore"
            />
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
