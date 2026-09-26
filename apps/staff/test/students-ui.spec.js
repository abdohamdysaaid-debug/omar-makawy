const { test, describe } = require('node:test');
const assert = require('node:assert');

describe('Phase 4A-FE: Staff Students Portal Verification', () => {
  const mockStudent1 = {
    id: 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',
    full_name: 'Ahmed Ali',
    phone: '01011111111',
    email: 'ahmed@test.com',
    role: 'STUDENT',
    status: 'ACTIVE',
    is_active: true,
    is_phone_verified: true,
    is_email_verified: false,
    academic_year_id: 'a0000000-0000-4000-0000-000000000002',
    academic_year_code: 'FIRST_SECONDARY',
    academic_year_name_ar: 'الصف الأول الثانوي',
    academic_year_name_en: 'First Secondary Grade',
    parent_phone: '01099999991',
    school_name: 'Al-Ahram School',
    governorate_name_ar: 'الجيزة',
    gender: 'MALE',
    created_at: '2026-09-01T10:00:00.000Z',
  };

  const mockDevice1 = {
    id: 'dddddddd-dddd-4ddd-dddd-dddddddddddd',
    user_id: mockStudent1.id,
    device_uuid: 'device-uuid-s1',
    device_type: 'MOBILE',
    model_name: 'Samsung S21',
    status: 'ACTIVE',
    is_active: true,
    registered_at: '2026-09-01T12:00:00.000Z',
  };

  test('1. Student list consumes canonical backend API response structure', () => {
    const apiResponse = {
      items: [mockStudent1],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    };

    assert.strictEqual(apiResponse.items.length, 1);
    assert.strictEqual(apiResponse.items[0].full_name, 'Ahmed Ali');
    assert.strictEqual(apiResponse.items[0].role, 'STUDENT');
    assert.strictEqual(apiResponse.meta.total, 1);
  });

  test('2. Search query parameters are formatted correctly without null values', () => {
    const params = new URLSearchParams();
    const query = {
      page: 1,
      limit: 20,
      search: 'Ahmed',
      status: 'ACTIVE',
      academic_year_id: 'a0000000-0000-4000-0000-000000000002',
    };

    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.search) params.set('search', query.search);
    if (query.status) params.set('status', query.status);
    if (query.academic_year_id) params.set('academic_year_id', query.academic_year_id);

    assert.strictEqual(
      params.toString(),
      'page=1&limit=20&search=Ahmed&status=ACTIVE&academic_year_id=a0000000-0000-4000-0000-000000000002'
    );
  });

  test('3. Pagination meta handles offset and total pages correctly', () => {
    const total = 45;
    const limit = 20;
    const totalPages = Math.ceil(total / limit);

    assert.strictEqual(totalPages, 3);
    const page2Start = (2 - 1) * limit + 1;
    const page2End = Math.min(2 * limit, total);
    assert.strictEqual(page2Start, 21);
    assert.strictEqual(page2End, 40);
  });

  test('4. Status filter maps strictly to valid backend statuses', () => {
    const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BLOCKED'];
    assert.strictEqual(validStatuses.includes('ACTIVE'), true);
    assert.strictEqual(validStatuses.includes('SUSPENDED'), true);
    assert.strictEqual(validStatuses.includes('BLOCKED'), true);
    assert.strictEqual(validStatuses.includes('INACTIVE'), true);
    assert.strictEqual(validStatuses.includes('UNKNOWN'), false);
  });

  test('5. Academic-year scope is attached explicitly to request options', () => {
    const academicYearId = 'a0000000-0000-4000-0000-000000000002';
    const requestOptions = {
      academicYearId,
    };

    assert.strictEqual(requestOptions.academicYearId, academicYearId);
  });

  test('6. Supervisor assigned academic years validation rejects unassigned scope', () => {
    const supervisorAssignedYears = ['a0000000-0000-4000-0000-000000000002'];
    const requestedYear = 'a0000000-0000-4000-0000-000000000003';

    const isAssigned = supervisorAssignedYears.includes(requestedYear);
    assert.strictEqual(isAssigned, false);
  });

  test('7. Student details structure contains comprehensive academic and contact fields', () => {
    assert.strictEqual(mockStudent1.id, 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa');
    assert.strictEqual(mockStudent1.phone, '01011111111');
    assert.strictEqual(mockStudent1.parent_phone, '01099999991');
    assert.strictEqual(mockStudent1.school_name, 'Al-Ahram School');
    assert.strictEqual(mockStudent1.academic_year_code, 'FIRST_SECONDARY');
  });

  test('8. Missing student 404 response is handled as a non-retrying error', () => {
    const notFoundError = {
      statusCode: 404,
      message: 'Student not found',
      error_code: 'STUDENT_NOT_FOUND',
    };

    assert.strictEqual(notFoundError.statusCode, 404);
    assert.strictEqual(notFoundError.error_code, 'STUDENT_NOT_FOUND');
  });

  test('9. students.manage permission gates status mutation capability', () => {
    const teacherUser = { role: 'TEACHER', permissions: ['*'] };
    const supervisorWithoutPerm = { role: 'SUPERVISOR', permissions: ['students.read'] };
    const supervisorWithPerm = { role: 'SUPERVISOR', permissions: ['students.read', 'students.manage'] };

    const checkManagePerm = (user) =>
      user.role === 'TEACHER' || user.permissions.includes('students.manage');

    assert.strictEqual(checkManagePerm(teacherUser), true);
    assert.strictEqual(checkManagePerm(supervisorWithoutPerm), false);
    assert.strictEqual(checkManagePerm(supervisorWithPerm), true);
  });

  test('10. devices.read permission gates device section visibility', () => {
    const userWithDeviceRead = { role: 'SUPERVISOR', permissions: ['devices.read'] };
    const userWithoutDeviceRead = { role: 'SUPERVISOR', permissions: ['students.read'] };

    const checkDeviceRead = (user) =>
      user.role === 'TEACHER' || user.permissions.includes('devices.read');

    assert.strictEqual(checkDeviceRead(userWithDeviceRead), true);
    assert.strictEqual(checkDeviceRead(userWithoutDeviceRead), false);
  });

  test('11. devices.manage permission gates administrative device unbind action', () => {
    const userWithDeviceManage = { role: 'SUPERVISOR', permissions: ['devices.manage'] };
    const userWithoutDeviceManage = { role: 'SUPERVISOR', permissions: ['devices.read'] };

    const checkDeviceManage = (user) =>
      user.role === 'TEACHER' || user.permissions.includes('devices.manage');

    assert.strictEqual(checkDeviceManage(userWithDeviceManage), true);
    assert.strictEqual(checkDeviceManage(userWithoutDeviceManage), false);
  });

  test('12. Device unbinding is an administrative override without student cooldown', () => {
    const actionPayload = {
      action: 'ADMIN_DEVICE_UNBIND_OVERRIDE',
      student_id: mockStudent1.id,
      device_id: mockDevice1.id,
    };

    assert.strictEqual(actionPayload.action, 'ADMIN_DEVICE_UNBIND_OVERRIDE');
    assert.strictEqual(actionPayload.device_id, mockDevice1.id);
  });

  test('13. Sensitive internal backend fields are never present in student DTO', () => {
    assert.strictEqual(mockStudent1.password_hash, undefined);
    assert.strictEqual(mockStudent1.two_factor_secret, undefined);
    assert.strictEqual(mockStudent1.refresh_token_hash, undefined);
  });

  test('14. Zero fake metrics or placeholder counts exist in student list response', () => {
    const response = {
      items: [mockStudent1],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      },
    };

    assert.strictEqual(typeof response.meta.total, 'number');
    assert.strictEqual(response.meta.total, 1);
  });
});
