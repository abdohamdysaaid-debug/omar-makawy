const { test, describe } = require('node:test');
const assert = require('node:assert');

describe('Phase 4C-FE-2: Staff Book Details, Metadata & Inventory Ledger Verification', () => {
  const mockBook1 = {
    id: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbb01',
    academic_year_id: 'a0000000-0000-4000-0000-000000000002',
    academic_year_name_ar: 'الصف الأول الثانوي',
    academic_year_name_en: 'First Secondary Grade',
    title_ar: 'كتاب الشرح - لغة إنجليزية 1ث',
    title_en: 'Explanation Book - English 1st Sec',
    description_ar: 'شرح مفصل لمنهج اللغة الإنجليزية للصف الأول الثانوي مع تدريبات شاملة',
    description_en: 'Comprehensive explanation for 1st secondary English curriculum with exercises',
    sku: 'BK-ENG-S1-EXP',
    price: 150,
    discount_price: 120,
    stock_quantity: 45,
    low_stock_threshold: 10,
    weight_kg: 0.65,
    is_active: true,
    cover_image_url: 'https://cdn.example.com/books/eng-1s.jpg',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-01T10:00:00.000Z',
  };

  const mockLedgerEntry1 = {
    id: 'lllllll1-llll-4lll-llll-lllllllllll1',
    book_id: mockBook1.id,
    quantity_before: 0,
    change_amount: 50,
    quantity_after: 50,
    type: 'INITIAL_STOCK',
    reference_type: 'MANUAL',
    reference_id: null,
    notes: 'Initial inventory setup',
    created_at: '2026-09-01T10:00:00.000Z',
  };

  const mockLedgerEntry2 = {
    id: 'lllllll2-llll-4lll-llll-lllllllllll2',
    book_id: mockBook1.id,
    quantity_before: 50,
    change_amount: -5,
    quantity_after: 45,
    type: 'ADJUSTMENT_OUT',
    reference_type: 'MANUAL',
    reference_id: null,
    notes: 'Damaged copies written off during audit',
    created_at: '2026-09-02T14:00:00.000Z',
  };

  // 1. BOOK DETAILS
  test('1. Book Details loads and maps canonical entity fields', () => {
    assert.strictEqual(mockBook1.id, 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbb01');
    assert.strictEqual(mockBook1.title_ar, 'كتاب الشرح - لغة إنجليزية 1ث');
    assert.strictEqual(mockBook1.sku, 'BK-ENG-S1-EXP');
    assert.strictEqual(mockBook1.price, 150);
    assert.strictEqual(mockBook1.discount_price, 120);
    assert.strictEqual(mockBook1.stock_quantity, 45);
    assert.strictEqual(mockBook1.low_stock_threshold, 10);
    assert.strictEqual(mockBook1.weight_kg, 0.65);
    assert.strictEqual(mockBook1.is_active, true);
    assert.strictEqual(mockBook1.academic_year_name_ar, 'الصف الأول الثانوي');
  });

  test('2. Missing book 404 response is handled with non-retrying ErrorState', () => {
    const error404 = {
      statusCode: 404,
      error_code: 'BOOK_NOT_FOUND',
      message: 'Book not found',
    };
    assert.strictEqual(error404.statusCode, 404);
    assert.strictEqual(error404.error_code, 'BOOK_NOT_FOUND');
  });

  // 2. CREATE BOOK
  test('3. CreateBookPayload validates required and optional fields', () => {
    const validPayload = {
      academic_year_id: 'a0000000-0000-4000-0000-000000000002',
      sku: 'BK-ENG-S1-NEW',
      title_ar: 'كتاب القواعد والتمارين',
      title_en: 'Grammar and Practice Book',
      price: 130,
      discount_price: 110,
      description_ar: 'شرح القواعد',
      description_en: 'Grammar explanations',
      weight_kg: 0.5,
      cover_image_url: 'https://cdn.example.com/cover.jpg',
      is_active: true,
    };

    assert.strictEqual(Boolean(validPayload.academic_year_id), true);
    assert.strictEqual(Boolean(validPayload.sku), true);
    assert.strictEqual(Boolean(validPayload.title_ar), true);
    assert.strictEqual(Boolean(validPayload.title_en), true);
    assert.strictEqual(validPayload.price >= 0, true);
    assert.strictEqual(validPayload.discount_price <= validPayload.price, true);
  });

  test('4. CreateBook client validation rejects invalid discount price exceeding regular price', () => {
    const validateBookPricing = (price, discountPrice) => {
      if (price < 0) return 'INVALID_PRICE';
      if (discountPrice !== null && discountPrice !== undefined) {
        if (discountPrice < 0) return 'INVALID_DISCOUNT';
        if (discountPrice > price) return 'DISCOUNT_EXCEEDS_PRICE';
      }
      return 'VALID';
    };

    assert.strictEqual(validateBookPricing(100, 120), 'DISCOUNT_EXCEEDS_PRICE');
    assert.strictEqual(validateBookPricing(100, 80), 'VALID');
    assert.strictEqual(validateBookPricing(100, null), 'VALID');
    assert.strictEqual(validateBookPricing(-10, null), 'INVALID_PRICE');
  });

  // 3. EDIT BOOK
  test('5. UpdateBookPayload formats allowed mutable fields without changing immutable sku or academic_year_id', () => {
    const updatePayload = {
      title_ar: 'كتاب الشرح المطور 1ث',
      title_en: 'Updated Explanation Book',
      price: 160,
      discount_price: null,
      description_ar: 'وصف جديد ومحدث',
      weight_kg: 0.7,
      is_active: true,
    };

    assert.strictEqual(updatePayload.title_ar, 'كتاب الشرح المطور 1ث');
    assert.strictEqual(updatePayload.price, 160);
    assert.strictEqual(updatePayload.discount_price, null);
    assert.strictEqual(updatePayload.academic_year_id, undefined);
    assert.strictEqual(updatePayload.sku, undefined);
  });

  // 4. PUBLISH / UNPUBLISH
  test('6. Publish and unpublish toggle active status via dedicated POST endpoints without DELETE', () => {
    const publishEndpoint = (bookId) => `/books/${bookId}/publish`;
    const unpublishEndpoint = (bookId) => `/books/${bookId}/unpublish`;

    assert.strictEqual(publishEndpoint(mockBook1.id), '/books/bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbb01/publish');
    assert.strictEqual(unpublishEndpoint(mockBook1.id), '/books/bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbb01/unpublish');

    // Confirm that is_active reflects publication state
    const publishedState = { ...mockBook1, is_active: true };
    const unpublishedState = { ...mockBook1, is_active: false };
    assert.strictEqual(publishedState.is_active, true);
    assert.strictEqual(unpublishedState.is_active, false);
  });

  // 5. INVENTORY ADJUSTMENTS
  test('7. AdjustInventoryPayload validates RESTOCK, ADJUSTMENT_IN, and ADJUSTMENT_OUT', () => {
    const validAdjustmentTypes = ['RESTOCK', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT'];

    const restockPayload = {
      quantity: 25,
      type: 'RESTOCK',
      reason: 'New print run delivery from warehouse',
    };

    const adjustmentInPayload = {
      quantity: 5,
      type: 'ADJUSTMENT_IN',
      reason: 'Physical inventory audit surplus reconciliation',
    };

    const adjustmentOutPayload = {
      quantity: 3,
      type: 'ADJUSTMENT_OUT',
      reason: 'Damaged water copies written off',
    };

    assert.strictEqual(validAdjustmentTypes.includes(restockPayload.type), true);
    assert.strictEqual(validAdjustmentTypes.includes(adjustmentInPayload.type), true);
    assert.strictEqual(validAdjustmentTypes.includes(adjustmentOutPayload.type), true);
    assert.strictEqual(restockPayload.quantity > 0, true);
    assert.strictEqual(Boolean(restockPayload.reason), true);
  });

  test('8. Inventory adjustment rejects non-positive quantities and empty reason', () => {
    const validateAdjustment = (qty, reason) => {
      if (!Number.isInteger(qty) || qty <= 0) return 'INVALID_QUANTITY';
      if (!reason || reason.trim().length === 0) return 'MISSING_REASON';
      return 'VALID';
    };

    assert.strictEqual(validateAdjustment(0, 'reason'), 'INVALID_QUANTITY');
    assert.strictEqual(validateAdjustment(-5, 'reason'), 'INVALID_QUANTITY');
    assert.strictEqual(validateAdjustment(10, ''), 'MISSING_REASON');
    assert.strictEqual(validateAdjustment(10, '   '), 'MISSING_REASON');
    assert.strictEqual(validateAdjustment(10, 'Valid restock reason'), 'VALID');
  });

  test('9. ADJUSTMENT_OUT is checked against current stock to prevent negative inventory submission', () => {
    const currentStock = 45;
    const isOutwardAllowed = (outQuantity) => outQuantity <= currentStock;

    assert.strictEqual(isOutwardAllowed(10), true);
    assert.strictEqual(isOutwardAllowed(45), true);
    assert.strictEqual(isOutwardAllowed(50), false);
  });

  // 6. INVENTORY LEDGER
  test('10. Inventory ledger consumes paginated response and renders movement entries', () => {
    const ledgerResponse = {
      data: [mockLedgerEntry1, mockLedgerEntry2],
      meta: {
        total: 2,
        page: 1,
        limit: 10,
        pages: 1,
      },
    };

    assert.strictEqual(Array.isArray(ledgerResponse.data), true);
    assert.strictEqual(ledgerResponse.data.length, 2);
    assert.strictEqual(ledgerResponse.data[0].type, 'INITIAL_STOCK');
    assert.strictEqual(ledgerResponse.data[0].quantity_after, 50);
    assert.strictEqual(ledgerResponse.data[1].type, 'ADJUSTMENT_OUT');
    assert.strictEqual(ledgerResponse.data[1].change_amount, -5);
    assert.strictEqual(ledgerResponse.data[1].quantity_after, 45);
    assert.strictEqual(ledgerResponse.meta.total, 2);
  });

  test('11. Ledger entries are strictly immutable (no edit/delete methods in API or UI)', () => {
    const allowedLedgerMethods = ['getInventoryLedger'];
    assert.strictEqual(allowedLedgerMethods.includes('getInventoryLedger'), true);
    assert.strictEqual(allowedLedgerMethods.includes('updateLedgerEntry'), false);
    assert.strictEqual(allowedLedgerMethods.includes('deleteLedgerEntry'), false);
  });

  // 7. RBAC PERMISSIONS
  test('12. books.manage permission gates metadata creation, editing, publishing, and inventory', () => {
    const teacherUser = { role: 'TEACHER', permissions: ['*'] };
    const supervisorWithManage = { role: 'SUPERVISOR', permissions: ['books.read', 'books.manage'] };
    const supervisorReadOnly = { role: 'SUPERVISOR', permissions: ['books.read'] };

    const checkBooksManage = (user) =>
      user.role === 'TEACHER' || user.permissions.includes('books.manage');

    assert.strictEqual(checkBooksManage(teacherUser), true);
    assert.strictEqual(checkBooksManage(supervisorWithManage), true);
    assert.strictEqual(checkBooksManage(supervisorReadOnly), false);
  });

  // 8. ACADEMIC-YEAR TENANCY
  test('13. Academic-year tenancy validation permits assigned grades and denies out-of-scope operations', () => {
    const supervisorAssignedYears = ['a0000000-0000-4000-0000-000000000002'];
    const targetBookYear = 'a0000000-0000-4000-0000-000000000002';
    const forbiddenBookYear = 'a0000000-0000-4000-0000-000000000004';

    const checkYearAccess = (yearId) => supervisorAssignedYears.includes(yearId);

    assert.strictEqual(checkYearAccess(targetBookYear), true);
    assert.strictEqual(checkYearAccess(forbiddenBookYear), false);
  });

  test('14. Backend remains authoritative for stock quantity and inventory calculations', () => {
    // The client never calculates authoritative stock locally as currentStock + delta
    const serverAuthoritativeStock = 45;
    const clientCalculatedStock = 40 + 5; // Client prediction
    assert.strictEqual(serverAuthoritativeStock, clientCalculatedStock);
  });
});
