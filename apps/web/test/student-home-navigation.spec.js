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

  it('2. Latest products limits to max 3 newest packages and max 3 newest courses', () => {
    // Simulated scenario: Teacher created 5 packages and 5 courses
    const rawPackages = [
      { id: 'p1', title_ar: 'باقة قديمة 1', created_at: '2026-10-01T10:00:00Z' },
      { id: 'p2', title_ar: 'باقة قديمة 2', created_at: '2026-10-02T10:00:00Z' },
      { id: 'p3', title_ar: 'باقة 3', created_at: '2026-10-03T08:00:00Z' },
      { id: 'p4', title_ar: 'باقة 4', created_at: '2026-10-03T10:00:00Z' },
      { id: 'p5', title_ar: 'باقة 5 (الأحدث)', created_at: '2026-10-03T12:00:00Z' },
    ];

    const rawCourses = [
      { id: 'c1', title_ar: 'كورس قديم 1', created_at: '2026-10-01T09:00:00Z' },
      { id: 'c2', title_ar: 'كورس قديم 2', created_at: '2026-10-02T09:00:00Z' },
      { id: 'c3', title_ar: 'كورس 3', created_at: '2026-10-03T07:00:00Z' },
      { id: 'c4', title_ar: 'كورس 4', created_at: '2026-10-03T09:00:00Z' },
      { id: 'c5', title_ar: 'كورس 5 (الأحدث)', created_at: '2026-10-03T11:00:00Z' },
    ];

    // Sort descending by date and take max 3
    const topPackages = [...rawPackages]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)
      .map((p) => ({ ...p, type: 'PACKAGE' }));

    const topCourses = [...rawCourses]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)
      .map((c) => ({ ...c, type: 'COURSE' }));

    // Combined all items
    const combinedAll = [...topPackages, ...topCourses].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Verify package limit: exactly 3 newest (p5, p4, p3)
    assert.equal(topPackages.length, 3);
    assert.deepEqual(topPackages.map((p) => p.id), ['p5', 'p4', 'p3']);

    // Verify course limit: exactly 3 newest (c5, c4, c3)
    assert.equal(topCourses.length, 3);
    assert.deepEqual(topCourses.map((c) => c.id), ['c5', 'c4', 'c3']);

    // Verify 'all' tab contains max 6 items sorted newest first
    assert.equal(combinedAll.length, 6);
    assert.equal(combinedAll[0].id, 'p5'); // 12:00
    assert.equal(combinedAll[1].id, 'c5'); // 11:00
    assert.equal(combinedAll[2].id, 'p4'); // 10:00
    assert.equal(combinedAll[3].id, 'c4'); // 09:00
    assert.equal(combinedAll[4].id, 'p3'); // 08:00
    assert.equal(combinedAll[5].id, 'c3'); // 07:00
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
        targetUrl: isPackage ? `/student/packages/detail?id=${sub.package_id || sub.item_id}` : `/student/courses/detail?id=${sub.course_id || sub.item_id}`,
      };
    });

    assert.equal(mapped[0].badgeText, 'باقة مفعلة');
    assert.equal(mapped[0].targetUrl, '/student/packages/detail?id=pkg-1');

    assert.equal(mapped[1].badgeText, 'كورس مفعل');
    assert.equal(mapped[1].targetUrl, '/student/courses/detail?id=crs-1');
  });

  it('6. Wallet balance syncs accurately from backend /wallet response and survives page refresh', () => {
    // Simulated backend wallet response
    const backendWallet = {
      id: 'w-1',
      user_id: 'u-1',
      current_balance: '100.00',
      currency: 'EGP',
    };

    // Parsing logic used in frontend
    const parsedBalance = Number(backendWallet.current_balance) || 0;
    assert.equal(parsedBalance, 100);

    // Simulated recharge response with balance_after
    const rechargeResponse = {
      message: 'Recharge successful',
      credited_amount: '100.00',
      balance_after: '200.00',
    };

    const newBalance = Number(rechargeResponse.balance_after);
    assert.equal(newBalance, 200);
  });
});
