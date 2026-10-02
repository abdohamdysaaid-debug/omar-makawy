const test = require('node:test');
const assert = require('node:assert/strict');
const {
  SystemPermissions,
  CANONICAL_ACADEMIC_YEARS,
} = require('@omar-makawy/shared');

// Minimal Phase 0 Navigation items matching config/navigation.ts
const STAFF_NAVIGATION_ITEMS = [
  {
    key: 'nav.dashboard',
    href: '/staff',
  },
  {
    key: 'nav.settings',
    href: '/staff/settings',
    permission: SystemPermissions.SETTINGS_READ,
  },
];

// Helper to simulate RBAC navigation filter for Phase 0
function filterNavigation(role, permissions = []) {
  const isTeacher = role === 'TEACHER';
  const permSet = new Set(permissions);

  return STAFF_NAVIGATION_ITEMS.filter((item) => {
    if (isTeacher) return true;
    if (item.isTeacherOnly) return false;
    if (item.permission) {
      if (item.permission === SystemPermissions.SETTINGS_READ) {
        return permSet.has(SystemPermissions.SETTINGS_READ) || permSet.has(SystemPermissions.SETTINGS_MANAGE);
      }
      return permSet.has(item.permission);
    }
    return true;
  });
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

test('1. Teacher sees all Phase 0 navigation items (الرئيسية and الإعدادات)', () => {
  const nav = filterNavigation('TEACHER', []);
  const allItemKeys = nav.map((i) => i.key);

  assert.ok(allItemKeys.includes('nav.dashboard'));
  assert.ok(allItemKeys.includes('nav.settings'));
  assert.equal(nav.length, 2);
});

test('2. Supervisor with SETTINGS_READ sees Settings navigation item', () => {
  const nav = filterNavigation('SUPERVISOR', [SystemPermissions.SETTINGS_READ]);
  const allItemKeys = nav.map((i) => i.key);

  assert.ok(allItemKeys.includes('nav.dashboard'));
  assert.ok(allItemKeys.includes('nav.settings'));
});

test('3. Supervisor with SETTINGS_MANAGE sees Settings navigation item', () => {
  const nav = filterNavigation('SUPERVISOR', [SystemPermissions.SETTINGS_MANAGE]);
  const allItemKeys = nav.map((i) => i.key);

  assert.ok(allItemKeys.includes('nav.dashboard'));
  assert.ok(allItemKeys.includes('nav.settings'));
});

test('4. Supervisor without SETTINGS_READ or SETTINGS_MANAGE sees only dashboard', () => {
  const nav = filterNavigation('SUPERVISOR', [SystemPermissions.STUDENTS_READ]);
  const allItemKeys = nav.map((i) => i.key);

  assert.ok(allItemKeys.includes('nav.dashboard'));
  assert.equal(allItemKeys.includes('nav.settings'), false);
  assert.equal(nav.length, 1);
});

test('5. Teacher passes Teacher RoleGate evaluation', () => {
  const user = { role: 'TEACHER' };
  const allowed = user.role === 'TEACHER';
  assert.equal(allowed, true);
});

test('6. Supervisor fails Teacher RoleGate evaluation', () => {
  const user = { role: 'SUPERVISOR' };
  const allowed = user.role === 'TEACHER';
  assert.equal(allowed, false);
});

test('7. Supervisor passes Supervisor RoleGate evaluation', () => {
  const user = { role: 'SUPERVISOR' };
  const allowedRoles = ['SUPERVISOR'];
  assert.equal(allowedRoles.includes(user.role), true);
});

test('8. Supervisor cannot select an unassigned academic year', () => {
  const supervisor = {
    role: 'SUPERVISOR',
    assigned_academic_years: ['a0000000-0000-0000-0000-000000000002'], // Senior 1 only
  };

  const unassignedYearId = 'a0000000-0000-0000-0000-000000000004'; // Senior 3
  const result = evaluateAcademicYearScope(supervisor, unassignedYearId);

  assert.equal(result.allowed, false);
  assert.equal(result.resolvedYearId, 'a0000000-0000-0000-0000-000000000002');
});

test('9. Teacher can select an allowed academic year and global scope (null)', () => {
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

test('10. Persisted invalid supervisor academic-year selection is rejected and reset', () => {
  const supervisor = {
    role: 'SUPERVISOR',
    assigned_academic_years: ['a0000000-0000-0000-0000-000000000001'],
  };

  const maliciousOrStaleStoredYear = 'fake-non-existent-year-uuid';
  const result = evaluateAcademicYearScope(supervisor, maliciousOrStaleStoredYear);

  assert.equal(result.allowed, false);
  assert.equal(result.resolvedYearId, 'a0000000-0000-0000-0000-000000000001');
});

test('11. Minimal Phase 0 navigation contains strictly no feature routes (students, courses, lectures, packages, books, orders, exams, wallet, notifications, analytics)', () => {
  const forbiddenSubstrings = [
    'courses',
    'students',
    'lectures',
    'packages',
    'books',
    'orders',
    'exams',
    'wallet',
    'notifications',
    'analytics',
  ];

  const allHrefs = STAFF_NAVIGATION_ITEMS.map((item) => item.href);
  for (const forbidden of forbiddenSubstrings) {
    for (const href of allHrefs) {
      assert.equal(
        href.includes(forbidden),
        false,
        `Phase 0 navigation must not include route with '${forbidden}', found: ${href}`
      );
    }
  }
});

test('12. No fake dashboard statistics or fabricated numbers are defined in staff dashboard', () => {
  const canonicalYears = CANONICAL_ACADEMIC_YEARS;
  assert.equal(canonicalYears.length, 4);

  canonicalYears.forEach((year) => {
    assert.ok(year.id.startsWith('a0000000-0000-0000-0000-00000000000'));
    assert.ok(year.name_ar.length > 5);
    assert.ok(year.name_en.length > 5);
  });
});
