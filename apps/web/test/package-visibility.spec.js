const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

describe('Web Package Visibility Contracts', () => {
  const packagesList = [
    {
      id: 'pkg-1',
      title_ar: 'باقة منشورة مخفية من الرئيسية',
      is_published: true,
      is_public: false,
      status: 'PUBLISHED',
      academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    },
    {
      id: 'pkg-2',
      title_ar: 'باقة منشورة وظاهرة بالرئيسية',
      is_published: true,
      is_public: true,
      status: 'PUBLISHED',
      academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    },
    {
      id: 'pkg-3',
      title_ar: 'باقة مسودة غير منشورة',
      is_published: false,
      is_public: false,
      status: 'DRAFT',
      academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    },
  ];

  it('1. Student Packages page includes packages with is_public = false as long as is_published = true', () => {
    const studentAvailable = packagesList.filter(
      (p) => p.is_published === true && p.status === 'PUBLISHED'
    );
    const ids = studentAvailable.map((p) => p.id);
    assert.deepEqual(ids, ['pkg-1', 'pkg-2']);
    assert.equal(ids.includes('pkg-1'), true);
  });

  it('2. Homepage package section includes ONLY packages where is_public = true and is_published = true', () => {
    const homepageAvailable = packagesList.filter(
      (p) => p.is_published === true && p.is_public === true && p.status === 'PUBLISHED'
    );
    const ids = homepageAvailable.map((p) => p.id);
    assert.deepEqual(ids, ['pkg-2']);
    assert.equal(ids.includes('pkg-1'), false);
    assert.equal(ids.includes('pkg-3'), false);
  });

  it('3. Draft packages are excluded from both student and homepage views', () => {
    const studentIds = packagesList
      .filter((p) => p.is_published === true && p.status === 'PUBLISHED')
      .map((p) => p.id);
    const homepageIds = packagesList
      .filter((p) => p.is_published === true && p.is_public === true && p.status === 'PUBLISHED')
      .map((p) => p.id);

    assert.equal(studentIds.includes('pkg-3'), false);
    assert.equal(homepageIds.includes('pkg-3'), false);
  });
});
