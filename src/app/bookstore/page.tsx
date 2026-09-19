'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import BookCard from '@/components/bookstore/BookCard';
import EmptyState from '@/components/ui/EmptyState';
import { books, academicYears } from '@/data/mock';
import { useAuth } from '@/context/AuthContext';
import { Search } from 'lucide-react';

export default function BookstorePage() {
  const { student } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const defaultYear = student ? String(student.academicYearId) : 'all';
  const [selectedYear, setSelectedYear] = useState<string>(defaultYear);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = ['مذكرات', 'تدريبات', 'قواعد', 'مراجعة'];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.includes(searchQuery) || book.description.includes(searchQuery);
    const matchesYear = selectedYear === 'all' || book.academicYearId === Number(selectedYear);
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesYear && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-cairo pb-16 md:pb-0">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">المتجر</h1>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث عن كتاب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full input-field ps-10 pe-4 py-2 rounded-lg"
            />
          </div>
          
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="input-field rounded-lg px-4 py-2"
          >
            <option value="all">كل الصفوف</option>
            {academicYears.map(year => (
              <option key={year.id} value={String(year.id)}>{year.title}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${selectedCategory === 'all' ? 'bg-brand-500 text-white' : 'bg-warm-200 dark:bg-surface-dark text-gray-700 dark:text-gray-300 hover:bg-brand-500/10'}`}
          >
            الكل
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${selectedCategory === cat ? 'bg-brand-500 text-white' : 'bg-warm-200 dark:bg-surface-dark text-gray-700 dark:text-gray-300 hover:bg-brand-500/10'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="BookOpen"
            title="لا توجد كتب مطابقة"
            description="حاول تغيير خيارات البحث أو التصفية"
          />
        )}
      </main>
      
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
