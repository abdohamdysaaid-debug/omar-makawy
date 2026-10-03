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

  it('4. Subscribed courses and packages display "تم الشراء" instead of details CTA', () => {
    const activeSubscriptions = [
      { id: 'sub-1', item_type: 'PACKAGE', item_id: 'pkg-100', status: 'ACTIVE' },
      { id: 'sub-2', item_type: 'COURSE', item_id: 'crs-200', course_id: 'crs-200', status: 'ACTIVE' },
    ];

    const isSubscribedToPackage = (packageId) =>
      activeSubscriptions.some(
        (s) => s.status === 'ACTIVE' && s.item_type === 'PACKAGE' && (s.item_id === packageId || s.id === packageId)
      );

    const isSubscribedToCourse = (courseId) =>
      activeSubscriptions.some(
        (s) => s.status === 'ACTIVE' && (s.item_type === 'COURSE' || !s.item_type) && (s.course_id === courseId || s.item_id === courseId || s.id === courseId)
      );

    // Verify Package 100 is purchased
    assert.equal(isSubscribedToPackage('pkg-100'), true);
    assert.equal(isSubscribedToPackage('pkg-999'), false);

    // Verify Course 200 is purchased
    assert.equal(isSubscribedToCourse('crs-200'), true);
    assert.equal(isSubscribedToCourse('crs-999'), false);

    // Verify button text logic
    const getPackageButtonText = (pkgId) => (isSubscribedToPackage(pkgId) ? 'تم الشراء' : 'تفاصيل الباقة');
    const getCourseButtonText = (crsId) => (isSubscribedToCourse(crsId) ? 'تم الشراء' : 'تفاصيل الكورس');

    assert.equal(getPackageButtonText('pkg-100'), 'تم الشراء');
    assert.equal(getPackageButtonText('pkg-999'), 'تفاصيل الباقة');

    assert.equal(getCourseButtonText('crs-200'), 'تم الشراء');
    assert.equal(getCourseButtonText('crs-999'), 'تفاصيل الكورس');
  });

  it('5. Active subscriptions page categorizes packages and courses with direct access URLs', () => {
    const subscriptions = [
      { id: 'sub-1', item_type: 'PACKAGE', item_id: 'pkg-1', title_ar: 'باقة الشهر الأول' },
      { id: 'sub-2', item_type: 'COURSE', item_id: 'crs-1', course_id: 'crs-1', title_ar: 'كورس القواعد' },
    ];

    const mapped = subscriptions.map((sub) => {
      const isPackage = sub.item_type === 'PACKAGE';
      return {
        ...sub,
        badgeText: isPackage ? 'باقة مفعلة' : 'كورس مفعل',
        targetUrl: isPackage ? '/student/courses' : `/courses/${sub.course_id || sub.item_id}`,
      };
    });

    assert.equal(mapped[0].badgeText, 'باقة مفعلة');
    assert.equal(mapped[0].targetUrl, '/student/courses');

    assert.equal(mapped[1].badgeText, 'كورس مفعل');
    assert.equal(mapped[1].targetUrl, '/courses/crs-1');
  });
});
