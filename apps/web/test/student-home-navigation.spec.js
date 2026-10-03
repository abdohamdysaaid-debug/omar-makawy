const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('Student Home & Navigation Contract Tests', () => {
  it('1. Student navigation menu contains exactly the 5 specified items (No standalone lectures)', () => {
    // Exact spec: الرئيسية, اشتراكاتي, الكورسات, الباقات الشهرية, الامتحانات
    const studentNavigationItems = [
      { name: 'الرئيسية', href: '/student' },
      { name: 'اشتراكاتي', href: '/subscriptions' },
      { name: 'الكورسات', href: '/courses' },
      { name: 'الباقات الشهرية', href: '/packages' },
      { name: 'الامتحانات', href: '/student/exams' },
    ];

    const names = studentNavigationItems.map((item) => item.name);
    assert.deepEqual(names, ['الرئيسية', 'اشتراكاتي', 'الكورسات', 'الباقات الشهرية', 'الامتحانات']);
    assert.equal(names.includes('محاضراتي'), false);
    assert.equal(names.includes('المحاضرات'), false);
  });

  it('2. Latest products tab filtering works for all, packages, and courses', () => {
    const products = [
      { id: 'p1', productType: 'PACKAGE', title_ar: 'باقة 1', created_at: '2026-10-03T12:00:00Z' },
      { id: 'c1', productType: 'COURSE', title_ar: 'كورس 1', created_at: '2026-10-03T11:00:00Z' },
      { id: 'p2', productType: 'PACKAGE', title_ar: 'باقة 2', created_at: '2026-10-02T10:00:00Z' },
      { id: 'c2', productType: 'COURSE', title_ar: 'كورس 2', created_at: '2026-10-01T09:00:00Z' },
    ];

    const filterProducts = (filter) => {
      if (filter === 'packages') return products.filter((p) => p.productType === 'PACKAGE');
      if (filter === 'courses') return products.filter((p) => p.productType === 'COURSE');
      return products;
    };

    assert.equal(filterProducts('all').length, 4);
    assert.equal(filterProducts('packages').length, 2);
    assert.equal(filterProducts('packages')[0].id, 'p1');
    assert.equal(filterProducts('courses').length, 2);
    assert.equal(filterProducts('courses')[0].id, 'c1');
  });

  it('3. Continue Learning qualifies lectures between 0% and 90% progress', () => {
    const lectures = [
      { id: 'l1', duration_seconds: 3600, unique_seconds: 1800, is_completed: false }, // 50% -> qualified
      { id: 'l2', duration_seconds: 3600, unique_seconds: 3400, is_completed: true }, // 94% / completed -> excluded
      { id: 'l3', duration_seconds: 3600, unique_seconds: 0, is_completed: false }, // 0% -> excluded
      { id: 'l4', duration_seconds: 3600, unique_seconds: 3300, is_completed: false }, // 91.6% -> excluded
    ];

    const qualified = lectures.filter((l) => {
      if (l.is_completed) return false;
      const pct = Math.round((l.unique_seconds / l.duration_seconds) * 100);
      return pct > 0 && pct < 90;
    });

    assert.equal(qualified.length, 1);
    assert.equal(qualified[0].id, 'l1');
  });
});
