import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark font-cairo p-4 text-center">
      <h1 className="text-4xl font-bold text-brand-500 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">الصفحة غير موجودة</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">عذراً، لم نتمكن من العثور على الصفحة المطلوبة.</p>
      <Link
        href="/"
        className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg transition-colors"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
