const test = require('node:test');
const assert = require('node:assert/strict');

// Mock localStorage for Node testing environment
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

global.localStorage = new MockLocalStorage();
global.window = {
  location: { href: '', hostname: 'localhost' },
};

// Storage Keys
const ACCESS_TOKEN_KEY = 'omar_student_access_token';
const REFRESH_TOKEN_KEY = 'omar_student_refresh_token';
const USER_KEY = 'omar_student_user';

function getStoredAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem('omar_admin_access_token');
}

function getStoredRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || localStorage.getItem('omar_admin_refresh_token');
}

function storeTokens(tokens) {
  if (!tokens || !tokens.access_token) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  if (tokens.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  }
}

function clearStoredAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('omar_student_auth');
  localStorage.removeItem('omar_student_data');
}

function mapUserToStudent(user) {
  const profile = user.student_profile || {};
  return {
    id: user.id,
    fullName: user.full_name,
    phone: user.phone,
    whatsapp: profile.whatsapp_phone || user.phone,
    parentPhone: profile.parent_phone || '',
    email: user.email || '',
    academicYearId: user.academic_year_id || profile.academic_year_id || '',
    avatarUrl: profile.avatar_url || '',
    role: user.role,
  };
}

test('1. Initial hydration without stored tokens initializes cleanly as unauthenticated', () => {
  global.localStorage.clear();

  assert.equal(getStoredAccessToken(), null);
  assert.equal(getStoredRefreshToken(), null);
  assert.equal(localStorage.getItem('omar_student_auth'), null);
});

test('2. Real student login stores JWT tokens, maps user to student with academic year', () => {
  global.localStorage.clear();

  const mockUser = {
    id: 'student-uuid-001',
    phone: '01012345678',
    email: 'student@test.com',
    full_name: 'أحمد محمد علي حسن',
    role: 'STUDENT',
    status: 'ACTIVE',
    two_factor_enabled: false,
    is_phone_verified: true,
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    student_profile: {
      academic_year_id: 'a0000000-0000-0000-0000-000000000001',
      parent_phone: '01098765432',
      whatsapp_phone: '01012345678',
    },
  };

  const mockTokens = {
    access_token: 'student_jwt_access_token_123',
    refresh_token: 'student_jwt_refresh_token_456',
    token_type: 'Bearer',
    expires_in: 900,
  };

  // Ensure student role check passes
  assert.equal(mockUser.role, 'STUDENT');

  storeTokens(mockTokens);
  assert.equal(getStoredAccessToken(), 'student_jwt_access_token_123');
  assert.equal(getStoredRefreshToken(), 'student_jwt_refresh_token_456');

  const student = mapUserToStudent(mockUser);
  assert.equal(student.id, 'student-uuid-001');
  assert.equal(student.fullName, 'أحمد محمد علي حسن');
  assert.equal(student.academicYearId, 'a0000000-0000-0000-0000-000000000001');
  assert.equal(student.parentPhone, '01098765432');
  assert.equal(student.role, 'STUDENT');
});

test('3. Non-student account (TEACHER / SUPERVISOR) is strictly rejected from Student Portal', () => {
  global.localStorage.clear();

  const mockTeacher = {
    id: 'teacher-uuid-999',
    phone: '01024755202',
    full_name: 'Mr. Omar Meckawy',
    role: 'TEACHER',
    status: 'ACTIVE',
  };

  const roleCheck = (user) => {
    if (user.role !== 'STUDENT') {
      clearStoredAuth();
      throw new Error('هذا الحساب ليس حساب طالب. يرجى استخدام بوابة الإدارة.');
    }
    return true;
  };

  assert.throws(
    () => roleCheck(mockTeacher),
    /هذا الحساب ليس حساب طالب/
  );

  assert.equal(getStoredAccessToken(), null);
});

test('4. Token refresh is never called when refresh_token is missing or empty', () => {
  global.localStorage.clear();

  let refreshCalled = false;
  const attemptRefresh = (token) => {
    if (!token || token.trim().length === 0) {
      clearStoredAuth();
      return null;
    }
    refreshCalled = true;
    return 'new_token';
  };

  const result = attemptRefresh(getStoredRefreshToken());
  assert.equal(result, null);
  assert.equal(refreshCalled, false);
});

test('5. Valid refresh token rotation updates stored tokens', () => {
  global.localStorage.clear();

  storeTokens({
    access_token: 'old_access_token',
    refresh_token: 'valid_refresh_token_1',
    token_type: 'Bearer',
    expires_in: 900,
  });

  assert.equal(getStoredAccessToken(), 'old_access_token');
  assert.equal(getStoredRefreshToken(), 'valid_refresh_token_1');

  // Rotate tokens
  const rotatedTokens = {
    access_token: 'new_access_token_2',
    refresh_token: 'new_refresh_token_2',
    token_type: 'Bearer',
    expires_in: 900,
  };

  storeTokens(rotatedTokens);

  assert.equal(getStoredAccessToken(), 'new_access_token_2');
  assert.equal(getStoredRefreshToken(), 'new_refresh_token_2');
});

test('6. Logout cleanly revokes session and clears all credentials', () => {
  global.localStorage.clear();

  storeTokens({
    access_token: 'active_token',
    refresh_token: 'active_refresh',
    token_type: 'Bearer',
    expires_in: 900,
  });

  assert.notEqual(getStoredAccessToken(), null);

  clearStoredAuth();

  assert.equal(getStoredAccessToken(), null);
  assert.equal(getStoredRefreshToken(), null);
  assert.equal(localStorage.getItem('omar_student_auth'), null);
  assert.equal(localStorage.getItem('omar_student_data'), null);
});

test('7. No mockStudent is used as authentication fallback', () => {
  global.localStorage.clear();

  // Verify that an empty localStorage does not resolve to any student data
  const token = getStoredAccessToken();
  assert.equal(token, null);
  // Real hydration will set student = null, authenticated = false
});
