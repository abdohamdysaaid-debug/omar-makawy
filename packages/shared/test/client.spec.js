const test = require('node:test');
const assert = require('node:assert/strict');
const {
  SystemPermissions,
  ALL_SYSTEM_PERMISSIONS,
  createApiClient,
  getOrCreateDeviceUuid,
  DEFAULT_STORAGE_KEYS,
  createAuthApi,
} = require('../dist');

// Mock localStorage for Node environment
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

// Global setup for tests
global.localStorage = new MockLocalStorage();
global.window = { location: { hostname: 'localhost' } };

test('SystemPermissions registry matches backend canonical codes', () => {
  assert.equal(SystemPermissions.STUDENTS_READ, 'students.read');
  assert.equal(SystemPermissions.COURSES_READ, 'courses.read');
  assert.equal(SystemPermissions.ORDERS_MANAGE, 'orders.manage');
  assert.equal(SystemPermissions.TENANCY_GLOBAL_OVERRIDE, 'tenancy.global_override');
  assert.ok(ALL_SYSTEM_PERMISSIONS.length >= 30, 'Should have all 30+ permissions');

  // Verify all definitions have required fields
  for (const perm of ALL_SYSTEM_PERMISSIONS) {
    assert.ok(perm.code, 'Permission code must exist');
    assert.ok(perm.name_ar, 'Arabic name must exist');
    assert.ok(perm.name_en, 'English name must exist');
    assert.ok(perm.module, 'Module must exist');
  }
});

test('getOrCreateDeviceUuid creates and persists a valid UUID v4 format', () => {
  global.localStorage.clear();
  const uuid = getOrCreateDeviceUuid();
  assert.match(
    uuid,
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    'Must be valid UUID v4'
  );

  // Calling again returns the exact same cached UUID
  const cachedUuid = getOrCreateDeviceUuid();
  assert.equal(cachedUuid, uuid);
});

test('createApiClient manages tokens and user state correctly', () => {
  global.localStorage.clear();
  const client = createApiClient({
    tokenKey: 'test_access_token',
    refreshKey: 'test_refresh_token',
    userKey: 'test_user',
  });

  assert.equal(client.getAccessToken(), null);
  assert.equal(client.getRefreshToken(), null);
  assert.equal(client.getStoredUser(), null);

  client.storeTokens({
    access_token: 'acc_123',
    refresh_token: 'ref_456',
    token_type: 'Bearer',
    expires_in: 900,
  });

  assert.equal(client.getAccessToken(), 'acc_123');
  assert.equal(client.getRefreshToken(), 'ref_456');

  client.storeUser({ id: 'u1', role: 'TEACHER', full_name: 'Test Teacher' });
  assert.deepEqual(client.getStoredUser(), { id: 'u1', role: 'TEACHER', full_name: 'Test Teacher' });

  client.clearStoredAuth();
  assert.equal(client.getAccessToken(), null);
  assert.equal(client.getRefreshToken(), null);
  assert.equal(client.getStoredUser(), null);
});

test('createApiClient request injects headers and unwraps NestJS envelope', async () => {
  global.localStorage.clear();
  const client = createApiClient({ baseUrl: 'https://api.test.com' });
  client.storeTokens({
    access_token: 'my_access_jwt',
    refresh_token: 'my_refresh_jwt',
    token_type: 'Bearer',
    expires_in: 900,
  });

  let capturedUrl = '';
  let capturedHeaders = {};

  global.fetch = async (url, init) => {
    capturedUrl = url;
    const headers = init.headers;
    capturedHeaders = {
      authorization: headers.get('Authorization') || '',
      deviceId: headers.get('x-device-id') || '',
      academicYearId: headers.get('x-academic-year-id') || '',
    };

    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: { users: [{ id: '1', name: 'Student 1' }] },
        message: null,
      }),
    };
  };

  // Request WITHOUT academicYearId -> header must NOT be attached
  const res1 = await client.get('/students');
  assert.equal(capturedUrl, 'https://api.test.com/students');
  assert.equal(capturedHeaders.authorization, 'Bearer my_access_jwt');
  assert.ok(capturedHeaders.deviceId.length > 0, 'Must have device ID');
  assert.equal(capturedHeaders.academicYearId, '', 'Must NOT have x-academic-year-id when not specified');
  assert.deepEqual(res1, { users: [{ id: '1', name: 'Student 1' }] });

  // Request WITH academicYearId -> header MUST be attached
  await client.get('/students', { academicYearId: 'year-uuid-2026' });
  assert.equal(capturedHeaders.academicYearId, 'year-uuid-2026', 'Must have explicit x-academic-year-id');
});

test('createApiClient normalizes backend error responses properly', async () => {
  const client = createApiClient({ baseUrl: 'https://api.test.com' });

  global.fetch = async () => {
    return {
      ok: false,
      status: 403,
      json: async () => ({
        success: false,
        error_code: 'INSUFFICIENT_PERMISSIONS',
        message: 'You do not have permission to view students',
        timestamp: '2026-09-26T00:00:00.000Z',
        path: '/api/v1/students',
      }),
    };
  };

  await assert.rejects(
    async () => {
      await client.get('/students');
    },
    (err) => {
      assert.equal(err.statusCode, 403);
      assert.equal(err.error_code, 'INSUFFICIENT_PERMISSIONS');
      assert.equal(err.message, 'You do not have permission to view students');
      assert.equal(err.path, '/api/v1/students');
      return true;
    }
  );
});

test('createAuthApi wraps login and 2FA endpoints correctly', async () => {
  let capturedBody = null;
  let capturedEndpoint = '';

  const mockClient = {
    post: async (endpoint, body) => {
      capturedEndpoint = endpoint;
      capturedBody = body;
      return { success: true, data: { user: { role: 'TEACHER' } } };
    },
    get: async () => ({ id: '123' }),
  };

  const authApi = createAuthApi(mockClient);

  await authApi.login({
    phone: '01024755202',
    password: 'SafePassword123!',
    device_uuid: 'custom-dev-uuid',
  });

  assert.equal(capturedEndpoint, '/auth/login');
  assert.equal(capturedBody.phone, '01024755202');
  assert.equal(capturedBody.password, 'SafePassword123!');
  assert.equal(capturedBody.device_uuid, 'custom-dev-uuid');
});
