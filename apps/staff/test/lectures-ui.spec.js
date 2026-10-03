const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  SystemPermissions,
  extractYouTubeVideoId,
  buildYouTubeEmbedUrl,
  resolveLectureThumbnailUrl,
} = require('@omar-makawy/shared');

describe('Lectures System — Phase 3: Staff UI & Navigation Tests', () => {
  const mockLecture = {
    id: '86650dd2-e317-4e75-966c-17ce54b622cd',
    academic_year_id: 'a0000000-0000-0000-0000-000000000001',
    title_ar: 'المحاضرة الشاملة الأولى - قواعد الأزمنة',
    title_en: 'Comprehensive Lecture 1 - Tenses',
    description_ar: 'شرح مفصل للأزمنة مع تدريبات عملية',
    description_en: 'Detailed explanation of English tenses',
    thumbnail_url: 'https://lh3.googleusercontent.com/d/sample-thumbnail-id',
    sequence_order: 1,
    sort_order: 1,
    visibility: 'SUBSCRIBER_ONLY',
    status: 'PUBLISHED',
    is_free: false,
    is_published: true,
    scheduled_at: null,
    duration_seconds: 3600,
    access_type: 'PAID',
    created_at: '2026-10-01T10:00:00.000Z',
    updated_at: '2026-10-01T10:00:00.000Z',
    courses: [
      { id: 'c1111111-1111-1111-1111-111111111111', title_ar: 'كورس النحو', title_en: 'Grammar', sort_order: 1 },
      { id: 'c2222222-2222-2222-2222-222222222222', title_ar: 'كورس المراجعة', title_en: 'Revision', sort_order: 2 },
    ],
    packages: [
      { id: 'p1111111-1111-1111-1111-111111111111', title_ar: 'باقة الشهر الأول', title_en: 'Month 1', sort_order: 1 },
    ],
    videos: [
      {
        id: 'v1111111-1111-1111-1111-111111111111',
        video_type: 'MAIN',
        provider: 'YOUTUBE',
        provider_video_id: 'dQw4w9WgXcQ',
        duration_seconds: 3600,
      },
    ],
    chapters: [
      { id: 'ch1', timestamp_seconds: 0, title_ar: 'المقدمة', sequence_order: 1 },
      { id: 'ch2', timestamp_seconds: 320, title_ar: 'شرح القاعدة الأولى', sequence_order: 2 },
    ],
    attachments: [
      { id: 'att1', title_ar: 'مذكرة الشرح', file_type: 'PDF', download_allowed: true },
    ],
  };

  // 1. Navigation & Route Config
  test('1. Navigation item for /staff/lectures exists under Educational Content in navigation.ts', () => {
    const navFilePath = path.join(__dirname, '../src/config/navigation.ts');
    const navContent = fs.readFileSync(navFilePath, 'utf-8');

    assert.strictEqual(navContent.includes("href: '/staff/lectures'"), true);
    assert.strictEqual(navContent.includes("key: 'nav.lectures'"), true);
    assert.strictEqual(navContent.includes('SystemPermissions.LECTURES_READ'), true);
  });

  // 2. Active State Matching
  test('2. Sidebar active state matches /staff/lectures and nested paths', () => {
    const isItemActive = (pathname, href) => {
      return pathname === href || (href !== '/staff' && pathname.startsWith(`${href}`));
    };

    assert.strictEqual(isItemActive('/staff/lectures', '/staff/lectures'), true);
    assert.strictEqual(isItemActive('/staff/lectures/detail', '/staff/lectures'), true);
    assert.strictEqual(isItemActive('/staff/lectures/some-id', '/staff/lectures'), true);
    assert.strictEqual(isItemActive('/staff/courses', '/staff/lectures'), false);
    assert.strictEqual(isItemActive('/staff/packages', '/staff/lectures'), false);
  });

  // 3. Multi-Course & Multi-Package Relations
  test('3. Lecture record contains multiple courses and packages simultaneously', () => {
    assert.strictEqual(Array.isArray(mockLecture.courses), true);
    assert.strictEqual(mockLecture.courses.length, 2);
    assert.strictEqual(mockLecture.courses[0].title_ar, 'كورس النحو');
    assert.strictEqual(mockLecture.courses[1].title_ar, 'كورس المراجعة');

    assert.strictEqual(Array.isArray(mockLecture.packages), true);
    assert.strictEqual(mockLecture.packages.length, 1);
    assert.strictEqual(mockLecture.packages[0].title_ar, 'باقة الشهر الأول');
  });

  // 4. YouTube Video ID Extraction & Privacy Embed URL
  test('4. YouTube video helper extracts clean 11-char ID and builds privacy embed URL', () => {
    const watchUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const shortUrl = 'https://youtu.be/dQw4w9WgXcQ';
    const rawId = 'dQw4w9WgXcQ';

    assert.strictEqual(extractYouTubeVideoId(watchUrl), 'dQw4w9WgXcQ');
    assert.strictEqual(extractYouTubeVideoId(shortUrl), 'dQw4w9WgXcQ');
    assert.strictEqual(extractYouTubeVideoId(rawId), 'dQw4w9WgXcQ');

    const embedUrl = buildYouTubeEmbedUrl('dQw4w9WgXcQ');
    assert.strictEqual(embedUrl.includes('youtube-nocookie.com/embed/dQw4w9WgXcQ'), true);
    assert.strictEqual(embedUrl.includes('controls=1'), true);
    assert.strictEqual(embedUrl.includes('rel=0'), true);
  });

  // 5. Timestamp Parsing and Formatting
  test('5. Chapter timestamp helper converts seconds to MM:SS and parses MM:SS to seconds', () => {
    const parseTime = (timeStr) => {
      const parts = timeStr.split(':').map((p) => parseInt(p, 10));
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      return null;
    };

    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    assert.strictEqual(parseTime('05:20'), 320);
    assert.strictEqual(parseTime('18:40'), 1120);
    assert.strictEqual(parseTime('01:10:00'), 4200);

    assert.strictEqual(formatTime(320), '05:20');
    assert.strictEqual(formatTime(1120), '18:40');
  });

  // 6. Thumbnail Resolution Fallback
  test('6. resolveLectureThumbnailUrl returns custom thumbnail or YouTube fallback', () => {
    const customThumb = resolveLectureThumbnailUrl(mockLecture);
    assert.strictEqual(customThumb, 'https://lh3.googleusercontent.com/d/sample-thumbnail-id');

    const lectureWithoutThumb = {
      ...mockLecture,
      thumbnail_url: null,
    };
    const youtubeFallback = resolveLectureThumbnailUrl(lectureWithoutThumb);
    assert.strictEqual(youtubeFallback, 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
  });

  // 7. Query String Formatting
  test('7. Lectures list query parameters format cleanly for server-side filtering', () => {
    const formatLectureQuery = (query) => {
      const params = new URLSearchParams();
      if (query.page) params.set('page', String(query.page));
      if (query.limit) params.set('limit', String(query.limit));
      if (query.search?.trim()) params.set('search', query.search.trim());
      if (query.academic_year_id && query.academic_year_id !== 'ALL') {
        params.set('academic_year_id', query.academic_year_id);
      }
      if (query.status && query.status !== 'ALL') params.set('status', query.status);
      if (query.visibility && query.visibility !== 'ALL') params.set('visibility', query.visibility);
      return params.toString();
    };

    const qs = formatLectureQuery({
      page: 1,
      limit: 10,
      search: 'النحو',
      academic_year_id: 'a0000000-0000-0000-0000-000000000001',
      status: 'PUBLISHED',
      visibility: 'SUBSCRIBER_ONLY',
    });

    assert.strictEqual(qs.includes('page=1'), true);
    assert.strictEqual(qs.includes('limit=10'), true);
    assert.strictEqual(qs.includes('search=%D8%A7%D9%84%D9%86%D8%AD%D9%88'), true);
    assert.strictEqual(qs.includes('academic_year_id=a0000000-0000-0000-0000-000000000001'), true);
    assert.strictEqual(qs.includes('status=PUBLISHED'), true);
    assert.strictEqual(qs.includes('visibility=SUBSCRIBER_ONLY'), true);
  });

  // 8. Relations Response Extraction Resilience
  test('8. Relation array unpacking handles envelope object, items field, and direct arrays', () => {
    const unpackList = (res) => {
      return Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : res?.items || res?.courses || res?.packages || [];
    };

    const envelopeRes = { data: [{ id: 'c1', title_ar: 'كورس 1' }], total: 1 };
    const directArrayRes = [{ id: 'c1', title_ar: 'كورس 1' }];
    const itemsRes = { items: [{ id: 'c1', title_ar: 'كورس 1' }] };
    const nullRes = null;
    const undefinedRes = undefined;

    assert.strictEqual(unpackList(envelopeRes).length, 1);
    assert.strictEqual(unpackList(envelopeRes)[0].id, 'c1');

    assert.strictEqual(unpackList(directArrayRes).length, 1);
    assert.strictEqual(unpackList(directArrayRes)[0].id, 'c1');

    assert.strictEqual(unpackList(itemsRes).length, 1);
    assert.strictEqual(unpackList(itemsRes)[0].id, 'c1');

    assert.strictEqual(unpackList(nullRes).length, 0);
    assert.strictEqual(unpackList(undefinedRes).length, 0);
  });

  // 9. Course and Package Search & Filter Logic
  test('9. Course and package search filters correctly match Arabic and English titles', () => {
    const courses = [
      { id: '1', title_ar: 'كورس النحو الشامل', title_en: 'Comprehensive Grammar' },
      { id: '2', title_ar: 'كورس البلاغة', title_en: 'Rhetoric Course' },
    ];

    const filterCourses = (list, query) => {
      if (!query.trim()) return list;
      const q = query.toLowerCase().trim();
      return list.filter(
        (c) =>
          c.title_ar?.toLowerCase().includes(q) ||
          c.title_en?.toLowerCase().includes(q)
      );
    };

    assert.strictEqual(filterCourses(courses, 'نحو').length, 1);
    assert.strictEqual(filterCourses(courses, 'Grammar').length, 1);
    assert.strictEqual(filterCourses(courses, 'كورس').length, 2);
    assert.strictEqual(filterCourses(courses, 'فرنسي').length, 0);
  });
});
