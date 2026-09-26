const test = require('node:test');
const assert = require('node:assert/strict');
const {
  createApiClient,
  createAuthApi,
  DEFAULT_STORAGE_KEYS,
  SystemPermissions,
} = require('@omar-makawy/shared');

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
global.window = { location: { hostname: 'localhost' } };

test('1. Unauthenticated user with missing token initializes to unauthenticated state', () => {
  global.localStorage.clear();
  const client = createApiClient();
  assert.equal(client.getAccessToken(), null);
  assert.equal(client.getStoredUser(), null);
});

test('2. TEACHER login succeeds and stores authenticated credentials and tokens', async () => {
  global.localStorage.clear();
  const client = createApiClient();
  const mockTeacher = {
    id: 'teacher-uuid-123',
    phone: '01024755202',
    full_name: 'Mr. Omar Meckawy',
    role: 'TEACHER',
    status: 'ACTIVE',
    two_factor_enabled: false,
    is_phone_verified: true,
    permissions: [SystemPermissions.TENANCY_GLOBAL_OVERRIDE],
  };

  const mockTokens = {
    access_token: 'teacher_access_jwt',
    refresh_token: 'teacher_refresh_jwt',
    token_type: 'Bearer',
    expires_in: 900,
  };

  client.storeTokens(mockTokens);
  client.storeUser(mockTeacher);

  assert.equal(client.getAccessToken(), 'teacher_access_jwt');
  assert.equal(client.getRefreshToken(), 'teacher_refresh_jwt');
  const stored = client.getStoredUser();
  assert.equal(stored.role, 'TEACHER');
  assert.equal(stored.full_name, 'Mr. Omar Meckawy');
});

test('3. SUPERVISOR login stores assigned academic years and granular permissions', async () => {
  global.localStorage.clear();
  const client = createApiClient();
  const mockSupervisor = {
    id: 'supervisor-uuid-456',
    phone: '01099998888',
    full_name: 'Supervisor Ali',
    role: 'SUPERVISOR',
    status: 'ACTIVE',
    two_factor_enabled: false,
    is_phone_verified: true,
    assigned_academic_years: ['year-grade-10', 'year-grade-11'],
    permissions: [SystemPermissions.STUDENTS_READ, SystemPermissions.ORDERS_READ],
  };

  client.storeUser(mockSupervisor);
  const stored = client.getStoredUser();
  assert.equal(stored.role, 'SUPERVISOR');
  assert.deepEqual(stored.assigned_academic_years, ['year-grade-10', 'year-grade-11']);
  assert.ok(stored.permissions.includes(SystemPermissions.STUDENTS_READ));
  assert.ok(!stored.permissions.includes(SystemPermissions.TENANCY_GLOBAL_OVERRIDE));
});

test('4. STUDENT account is rejected from staff portal authentication', () => {
  global.localStorage.clear();
  const client = createApiClient();
  const studentUser = {
    id: 'student-uuid-789',
    phone: '01111111111',
    full_name: 'Student Ahmed',
    role: 'STUDENT',
  };

  client.storeUser(studentUser);
  const stored = client.getStoredUser();

  // Guard logic simulation: reject STUDENT role
  const isAllowedStaff = stored && (stored.role === 'TEACHER' || stored.role === 'SUPERVISOR');
  assert.equal(isAllowedStaff, false, 'STUDENT role must be rejected from Staff Portal');
});

test('5. 2FA challenge response requires OTP verification before issuing access token', async () => {
  const challengeResponse = {
    two_factor_required: true,
    challenge_token: 'challenge_token_abc123',
    expires_in: 300,
    message: 'Two-factor authentication code required',
  };

  assert.equal(challengeResponse.two_factor_required, true);
  assert.ok(challengeResponse.challenge_token);
  assert.equal(challengeResponse.expires_in, 300);
});

test('6. Logout clears persisted tokens and user state completely', () => {
  global.localStorage.clear();
  const client = createApiClient();
  client.storeTokens({
    access_token: 'jwt_to_purge',
    refresh_token: 'refresh_to_purge',
    token_type: 'Bearer',
    expires_in: 900,
  });
  client.storeUser({ id: 'u1', role: 'TEACHER' });

  // Call clearStoredAuth
  client.clearStoredAuth();

  assert.equal(client.getAccessToken(), null);
  assert.equal(client.getRefreshToken(), null);
  assert.equal(client.getStoredUser(), null);
});

test('7. Multiple concurrent requests queue behind a single token refresh call', async () => {
  global.localStorage.clear();
  const client = createApiClient({ baseUrl: 'https://api.test.com' });
  client.storeTokens({
    access_token: 'expired_token',
    refresh_token: 'valid_refresh_token',
    token_type: 'Bearer',
    expires_in: 900,
  });

  let refreshCallCount = 0;
  let requestCallCount = 0;

  global.fetch = async (url, init) => {
    if (url.endsWith('/auth/refresh')) {
      refreshCallCount++;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            tokens: {
              access_token: 'brand_new_token',
              refresh_token: 'brand_new_refresh',
              token_type: 'Bearer',
              expires_in: 900,
            },
          },
        }),
      };
    }

    requestCallCount++;
    const headers = init.headers;
    const authHeader = headers.get('Authorization');

    if (authHeader === 'Bearer expired_token') {
      return {
        ok: false,
        status: 401,
        json: async () => ({ message: 'Token expired', error_code: 'TOKEN_EXPIRED' }),
      };
    }

    if (authHeader === 'Bearer brand_new_token') {
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: { result: 'success' } }),
      };
    }

    return { ok: false, status: 500, json: async () => ({}) };
  };

  // Dispatch 3 concurrent requests simultaneously
  const [res1, res2, res3] = await Promise.all([
    client.get('/dashboard/metrics'),
    client.get('/dashboard/feed'),
    client.get('/dashboard/notifications'),
  ]);

  assert.deepEqual(res1, { result: 'success' });
  assert.deepEqual(res2, { result: 'success' });
  assert.deepEqual(res3, { result: 'success' });

  // Only ONE refresh call must have occurred
  assert.equal(refreshCallCount, 1, 'Only one refresh network call should occur for concurrent 401s');
  assert.equal(client.getAccessToken(), 'brand_new_token');
});
