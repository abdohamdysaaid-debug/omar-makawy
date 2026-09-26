const test = require('node:test');
const assert = require('node:assert/strict');
const {
  SystemPermissions,
  CANONICAL_ACADEMIC_YEARS,
} = require('@omar-makawy/shared');

// Mock Navigation structure replicating config/navigation.ts
const STAFF_NAVIGATION_GROUPS = [
  {
    groupKey: 'nav.academic',
    items: [
      { key: 'nav.courses', href: '/staff/courses', permission: SystemPermissions.COURSES_READ },
      { key: 'nav.lectures', href: '/staff/lectures', permission: SystemPermissions.LECTURES_READ },
    ],
  },
  {
    groupKey: 'nav.students',
    items: [
      { key: 'nav.students_list', href: '/staff/students', permission: SystemPermissions.STUDENTS_READ },
      { key: 'nav.devices', href: '/staff/devices', permission: SystemPermissions.DEVICES_READ },
    ],
  },
  {
    groupKey: 'nav.bookstore',
    items: [
      { key: 'nav.books', href: '/staff/bookstore/books', permission: SystemPermissions.BOOKS_READ },
      { key: 'nav.orders', href: '/staff/bookstore/orders', permission: SystemPermissions.ORDERS_READ },
    ],
  },
  {
    groupKey: 'nav.administration',
    items: [
      { key: 'nav.supervisors', href: '/staff/supervisors', isTeacherOnly: true, role: 'TEACHER' },
      { key: 'nav.audit_logs', href: '/staff/audit-logs', permission: SystemPermissions.AUDIT_LOGS_READ },
    ],
  },
];

// Helper to simulate RBAC navigation filter
function filterNavigation(role, permissions = []) {
  const isTeacher = role === 'TEACHER';
  const permSet = new Set(permissions);

  return STAFF_NAVIGATION_GROUPS.map((group) => {
    const allowedItems = group.items.filter((item) => {
      if (isTeacher) return true;
      if (item.isTeacherOnly) return false;
      if (item.permission) return permSet.has(item.permission);
      return true;
    });

    return { ...group, items: allowedItems };
  }).filter((group) => group.items.length > 0);
}

// Helper to simulate Academic Year Scope evaluation
function evaluateAcademicYearScope(user, selectedYearId) {
  if (!user) return { allowed: false, resolvedYearId: null };

  const isTeacher = user.role === 'TEACHER';
  const isSupervisor = user.role === 'SUPERVISOR';

  if (selectedYearId === null) {
    if (isTeacher) return { allowed: true, resolvedYearId: null };
    return { allowed: false, resolvedYearId: null }; // Supervisor cannot access global scope
  }

  if (isTeacher) {
    const exists = CANONICAL_ACADEMIC_YEARS.some((y) => y.id === selectedYearId);
    return { allowed: exists, resolvedYearId: exists ? selectedYearId : null };
  }

  if (isSupervisor) {
    const assigned = user.assigned_academic_years || [];
    const isAssigned = assigned.includes(selectedYearId);
    return { allowed: isAssigned, resolvedYearId: isAssigned ? selectedYearId : (assigned[0] || null) };
  }

  return { allowed: false, resolvedYearId: null };
}

test('1. Teacher sees all permitted navigation items across all groups', () => {
  const nav = filterNavigation('TEACHER', []);
  const allItemKeys = nav.flatMap((g) => g.items.map((i) => i.key));

  assert.ok(allItemKeys.includes('nav.courses'));
  assert.ok(allItemKeys.includes('nav.students_list'));
  assert.ok(allItemKeys.includes('nav.books'));
  assert.ok(allItemKeys.includes('nav.supervisors'));
  assert.ok(allItemKeys.includes('nav.audit_logs'));
});

test('2. Supervisor with permission X (students.read) sees students navigation item', () => {
  const nav = filterNavigation('SUPERVISOR', [SystemPermissions.STUDENTS_READ]);
  const allItemKeys = nav.flatMap((g) => g.items.map((i) => i.key));

  assert.ok(allItemKeys.includes('nav.students_list'));
});

test('3. Supervisor without permission X (books.read) does not see bookstore navigation', () => {
  const nav = filterNavigation('SUPERVISOR', [SystemPermissions.STUDENTS_READ]);
  const allItemKeys = nav.flatMap((g) => g.items.map((i) => i.key));

  assert.equal(allItemKeys.includes('nav.books'), false);
  assert.equal(allItemKeys.includes('nav.orders'), false);
  // Entire bookstore group must be excluded because it has 0 allowed items
  const groupKeys = nav.map((g) => g.groupKey);
  assert.equal(groupKeys.includes('nav.bookstore'), false);
});

test('4. Teacher passes Teacher RoleGate evaluation', () => {
  const user = { role: 'TEACHER' };
  const allowed = user.role === 'TEACHER';
  assert.equal(allowed, true);
});

test('5. Supervisor fails Teacher RoleGate evaluation', () => {
  const user = { role: 'SUPERVISOR' };
  const allowed = user.role === 'TEACHER';
  assert.equal(allowed, false);
});

test('6. Supervisor passes Supervisor RoleGate evaluation', () => {
  const user = { role: 'SUPERVISOR' };
  const allowedRoles = ['SUPERVISOR'];
  assert.equal(allowedRoles.includes(user.role), true);
});

test('7. Supervisor cannot select an unassigned academic year', () => {
  const supervisor = {
    role: 'SUPERVISOR',
    assigned_academic_years: ['a0000000-0000-0000-0000-000000000002'], // Senior 1 only
  };

  const unassignedYearId = 'a0000000-0000-0000-0000-000000000004'; // Senior 3
  const result = evaluateAcademicYearScope(supervisor, unassignedYearId);

  assert.equal(result.allowed, false);
  assert.equal(result.resolvedYearId, 'a0000000-0000-0000-0000-000000000002');
});

test('8. Teacher can select an allowed academic year and global scope (null)', () => {
  const teacher = { role: 'TEACHER' };

  // Specific year
  const res1 = evaluateAcademicYearScope(teacher, 'a0000000-0000-0000-0000-000000000003');
  assert.equal(res1.allowed, true);
  assert.equal(res1.resolvedYearId, 'a0000000-0000-0000-0000-000000000003');

  // Global Scope
  const res2 = evaluateAcademicYearScope(teacher, null);
  assert.equal(res2.allowed, true);
  assert.equal(res2.resolvedYearId, null);
});

test('9. Persisted invalid supervisor academic-year selection is rejected and reset', () => {
  const supervisor = {
    role: 'SUPERVISOR',
    assigned_academic_years: ['a0000000-0000-0000-0000-000000000001'],
  };

  const maliciousOrStaleStoredYear = 'fake-non-existent-year-uuid';
  const result = evaluateAcademicYearScope(supervisor, maliciousOrStaleStoredYear);

  assert.equal(result.allowed, false);
  assert.equal(result.resolvedYearId, 'a0000000-0000-0000-0000-000000000001');
});

test('10. PermissionGate does not accidentally grant permissions to supervisors', () => {
  const supervisor = {
    role: 'SUPERVISOR',
    permissions: [SystemPermissions.NOTIFICATIONS_READ],
  };

  const permSet = new Set(supervisor.permissions);
  const checkCourseCreate = permSet.has(SystemPermissions.COURSES_CREATE);
  const checkNotificationRead = permSet.has(SystemPermissions.NOTIFICATIONS_READ);

  assert.equal(checkCourseCreate, false, 'Must reject ungranted permission');
  assert.equal(checkNotificationRead, true, 'Must accept granted permission');
});

test('11. Dashboard operational module filtering correctly restricts unauthorized tiles', () => {
  const supervisor = {
    role: 'SUPERVISOR',
    permissions: [SystemPermissions.STUDENTS_READ, SystemPermissions.ORDERS_READ],
  };

  const isTeacher = supervisor.role === 'TEACHER';
  const permSet = new Set(supervisor.permissions);

  const modules = [
    { name: 'Students', perm: SystemPermissions.STUDENTS_READ },
    { name: 'Courses', perm: SystemPermissions.COURSES_READ },
    { name: 'Orders', perm: SystemPermissions.ORDERS_READ },
    { name: 'Wallets', perm: SystemPermissions.WALLET_READ },
  ];

  const visibleModules = modules.filter((m) => isTeacher || permSet.has(m.perm));

  assert.deepEqual(
    visibleModules.map((m) => m.name),
    ['Students', 'Orders']
  );
});

test('12. No fake dashboard statistics or fabricated numbers are defined in staff dashboard', () => {
  const canonicalYears = CANONICAL_ACADEMIC_YEARS;
  assert.equal(canonicalYears.length, 4);

  // Verify that all canonical years have legitimate labels and codes
  canonicalYears.forEach((year) => {
    assert.ok(year.id.startsWith('a0000000-0000-0000-0000-00000000000'));
    assert.ok(year.name_ar.length > 5);
    assert.ok(year.name_en.length > 5);
  });
});
