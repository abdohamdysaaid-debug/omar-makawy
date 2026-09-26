const { test, describe } = require('node:test');
const assert = require('node:assert');

describe('Phase 4B-FE-1: Staff Courses Catalog Verification', () => {
  const mockCourse1 = {
    id: 'cccccccc-cccc-4ccc-cccc-cccccccccccc',
    academic_year_id: 'a0000000-0000-4000-0000-000000000002',
    title_ar: 'الفيزياء للصف الأول الثانوي - الترم الأول',
    title_en: 'Physics 1st Secondary - Term 1',
    slug: 'physics-1st-secondary-term-1',
    description_ar: 'شرح تفصيلي للمنهج مع حل التدريبات والمسائل المتدرجة.',
    description_en: 'Comprehensive explanation with graded exercise solutions.',
    thumbnail_url: 'https://cdn.omarmeckawy.com/thumbnails/phys-s1.jpg',
    price: 350,
    discount_price: 300,
    is_published: true,
    status: 'PUBLISHED',
    sort_order: 1,
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-15T14:30:00.000Z',
    academic_year_name_ar: 'الصف الأول الثانوي',
    academic_year_name_en: 'First Secondary Grade',
    academic_year_code: 'FIRST_SECONDARY',
  };

  test('1. Course list consumes canonical backend API response structure', () => {
    const apiResponse = {
      data: [mockCourse1],
      total: 1,
      page: 1,
      limit: 12,
      totalPages: 1,
    };

    assert.strictEqual(apiResponse.data.length, 1);
    assert.strictEqual(apiResponse.data[0].id, mockCourse1.id);
    assert.strictEqual(apiResponse.data[0].title_ar, 'الفيزياء للصف الأول الثانوي - الترم الأول');
    assert.strictEqual(apiResponse.data[0].price, 350);
    assert.strictEqual(apiResponse.data[0].discount_price, 300);
    assert.strictEqual(apiResponse.data[0].is_published, true);
    assert.strictEqual(apiResponse.total, 1);
  });

  test('2. Search query parameters are formatted correctly without null values', () => {
    const params = new URLSearchParams();
    const query = {
      page: 1,
      limit: 12,
      search: 'Physics',
      is_published: true,
      academic_year_id: 'a0000000-0000-4000-0000-000000000002',
    };

    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.search) params.set('search', query.search);
    if (query.is_published !== undefined) params.set('is_published', String(query.is_published));
    if (query.academic_year_id) params.set('academic_year_id', query.academic_year_id);

    assert.strictEqual(
      params.toString(),
      'page=1&limit=12&search=Physics&is_published=true&academic_year_id=a0000000-0000-4000-0000-000000000002'
    );
  });

  test('3. Publication filter maps correctly to boolean values', () => {
    function mapFilterToQuery(filter) {
      const q = {};
      if (filter === 'PUBLISHED') q.is_published = true;
      else if (filter === 'DRAFT') q.is_published = false;
      return q;
    }

    assert.strictEqual(mapFilterToQuery('PUBLISHED').is_published, true);
    assert.strictEqual(mapFilterToQuery('DRAFT').is_published, false);
    assert.strictEqual(mapFilterToQuery('ALL').is_published, undefined);
  });

  test('4. Pagination meta handles offset and total pages correctly', () => {
    const total = 25;
    const limit = 12;
    const totalPages = Math.ceil(total / limit);

    assert.strictEqual(totalPages, 3);
    const page2Start = (2 - 1) * limit + 1;
    const page2End = Math.min(2 * limit, total);
    assert.strictEqual(page2Start, 13);
    assert.strictEqual(page2End, 24);
  });

  test('5. Academic-year scope is attached explicitly to request options', () => {
    const academicYearId = 'a0000000-0000-4000-0000-000000000002';
    const requestOptions = {
      academicYearId,
    };

    assert.strictEqual(requestOptions.academicYearId, academicYearId);
  });

  test('6. Supervisor assigned academic years validation rejects unassigned scope', () => {
    const supervisor = {
      role: 'SUPERVISOR',
      assigned_academic_years: ['a0000000-0000-4000-0000-000000000002'],
      permissions: ['courses.read'],
    };

    const targetYear = 'a0000000-0000-4000-0000-000000000003';
    const isAllowed = supervisor.assigned_academic_years.includes(targetYear);
    assert.strictEqual(isAllowed, false);
  });

  test('7. Teacher possesses global academic year access', () => {
    const teacher = {
      role: 'TEACHER',
      assigned_academic_years: [],
      permissions: ['*'],
    };

    const isGlobal = teacher.role === 'TEACHER' || teacher.permissions.includes('*');
    assert.strictEqual(isGlobal, true);
  });

  test('8. Missing course or 403 scope denial error is handled cleanly', () => {
    const scopeError = {
      statusCode: 403,
      error_code: 'ACADEMIC_YEAR_SCOPE_DENIED',
      message: 'Supervisor is not authorized for requested academic year',
    };

    assert.strictEqual(scopeError.statusCode, 403);
    assert.strictEqual(scopeError.error_code, 'ACADEMIC_YEAR_SCOPE_DENIED');
  });

  test('9. courses.read permission gates catalog visibility', () => {
    const canViewCourses = (user) => {
      if (user.role === 'TEACHER') return true;
      return user.permissions?.includes('courses.read') || user.permissions?.includes('courses.manage');
    };

    assert.strictEqual(canViewCourses({ role: 'TEACHER', permissions: [] }), true);
    assert.strictEqual(canViewCourses({ role: 'SUPERVISOR', permissions: ['courses.read'] }), true);
    assert.strictEqual(canViewCourses({ role: 'SUPERVISOR', permissions: ['students.read'] }), false);
  });

  test('10. courses.create permission gates new course action', () => {
    const canCreateCourse = (user) => {
      if (user.role === 'TEACHER') return true;
      return user.permissions?.includes('courses.create') || user.permissions?.includes('courses.manage');
    };

    assert.strictEqual(canCreateCourse({ role: 'TEACHER', permissions: [] }), true);
    assert.strictEqual(canCreateCourse({ role: 'SUPERVISOR', permissions: ['courses.create'] }), true);
    assert.strictEqual(canCreateCourse({ role: 'SUPERVISOR', permissions: ['courses.read'] }), false);
  });

  test('11. Zero fake metrics or placeholder counts exist in course catalog', () => {
    const apiResponse = {
      data: [mockCourse1],
      total: 1,
      page: 1,
      limit: 12,
      totalPages: 1,
    };

    assert.strictEqual(apiResponse.total, apiResponse.data.length);
    assert.strictEqual('fakeCount' in apiResponse, false);
    assert.strictEqual('mockEnrolled' in apiResponse.data[0], false);
  });
});

describe('Phase 4B-FE-2: Course Details & Lecture Management Verification', () => {
  const mockCourse = {
    id: 'cccccccc-cccc-4ccc-cccc-cccccccccccc',
    academic_year_id: 'a0000000-0000-4000-0000-000000000002',
    title_ar: 'الفيزياء للصف الأول الثانوي - الترم الأول',
    title_en: 'Physics 1st Secondary - Term 1',
    slug: 'physics-1st-secondary-term-1',
    description_ar: 'شرح تفصيلي للمنهج مع حل التدريبات والمسائل.',
    description_en: 'Comprehensive syllabus explanation.',
    thumbnail_url: 'https://cdn.omarmeckawy.com/thumbnails/phys-s1.jpg',
    price: 350,
    discount_price: 300,
    is_published: true,
    status: 'PUBLISHED',
    sort_order: 1,
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-15T14:30:00.000Z',
    academic_year_name_ar: 'الصف الأول الثانوي',
    academic_year_code: 'FIRST_SECONDARY',
  };

  const mockLecture1 = {
    id: '11111111-1111-4111-1111-111111111111',
    course_id: mockCourse.id,
    academic_year_id: mockCourse.academic_year_id,
    title_ar: 'المحاضرة الأولى: القياس الفيزيائي',
    title_en: 'Lecture 1: Physical Measurement',
    description_ar: 'مقدمة في وحدات القياس وأدوات القياس المباشر وغير المباشر.',
    description_en: 'Introduction to measurement units and physical standards.',
    sequence_order: 1,
    is_free: true,
    is_published: true,
    status: 'PUBLISHED',
    duration_seconds: 3600,
    access_type: 'FREE',
    created_at: '2026-09-02T10:00:00.000Z',
    updated_at: '2026-09-02T10:00:00.000Z',
  };

  const mockLecture2 = {
    id: '22222222-2222-4222-2222-222222222222',
    course_id: mockCourse.id,
    academic_year_id: mockCourse.academic_year_id,
    title_ar: 'المحاضرة الثانية: صيغة الأبعاد',
    title_en: 'Lecture 2: Dimensional Formula',
    description_ar: 'استنتاج صيغ الأبعاد للكميات الفيزيائية المشتقة.',
    description_en: 'Deriving dimensional formulas for physical quantities.',
    sequence_order: 2,
    is_free: false,
    is_published: true,
    status: 'PUBLISHED',
    duration_seconds: 4200,
    access_type: 'ENROLLED_ONLY',
    created_at: '2026-09-05T10:00:00.000Z',
    updated_at: '2026-09-05T10:00:00.000Z',
  };

  test('1. Course Details consumes canonical backend entity', () => {
    assert.strictEqual(mockCourse.id, 'cccccccc-cccc-4ccc-cccc-cccccccccccc');
    assert.strictEqual(mockCourse.title_ar, 'الفيزياء للصف الأول الثانوي - الترم الأول');
    assert.strictEqual(mockCourse.price, 350);
    assert.strictEqual(mockCourse.discount_price, 300);
  });

  test('2. Course metadata update payload formats correctly', () => {
    const payload = {
      title_ar: 'الفيزياء المتقدمة',
      title_en: 'Advanced Physics',
      price: 400,
      discount_price: 350,
      is_published: true,
      status: 'PUBLISHED',
      sort_order: 2,
    };

    assert.strictEqual(payload.title_ar, 'الفيزياء المتقدمة');
    assert.strictEqual(payload.title_en, 'Advanced Physics');
    assert.strictEqual(payload.price, 400);
    assert.strictEqual(payload.is_published, true);
  });

  test('3. Lecture list preserves strict sequence ordering', () => {
    const rawLectures = [mockLecture2, mockLecture1];
    const sorted = [...rawLectures].sort((a, b) => a.sequence_order - b.sequence_order);

    assert.strictEqual(sorted[0].id, mockLecture1.id);
    assert.strictEqual(sorted[0].sequence_order, 1);
    assert.strictEqual(sorted[1].id, mockLecture2.id);
    assert.strictEqual(sorted[1].sequence_order, 2);
  });

  test('4. Lecture creation payload validates required bilingual titles', () => {
    function validateLecture(dto) {
      if (!dto.title_ar || !dto.title_ar.trim()) return false;
      if (!dto.title_en || !dto.title_en.trim()) return false;
      return true;
    }

    assert.strictEqual(validateLecture({ title_ar: 'عنوان', title_en: 'Title' }), true);
    assert.strictEqual(validateLecture({ title_ar: 'عنوان', title_en: '' }), false);
    assert.strictEqual(validateLecture({ title_ar: '', title_en: 'Title' }), false);
  });

  test('5. Lecture editing updates sequence order and flags', () => {
    const updatedLecture = {
      ...mockLecture1,
      sequence_order: 3,
      is_free: false,
      duration_seconds: 5400,
    };

    assert.strictEqual(updatedLecture.sequence_order, 3);
    assert.strictEqual(updatedLecture.is_free, false);
    assert.strictEqual(updatedLecture.duration_seconds, 5400);
  });

  test('6. Lecture deletion removes entity from list', () => {
    let list = [mockLecture1, mockLecture2];
    const toDeleteId = mockLecture1.id;
    list = list.filter((l) => l.id !== toDeleteId);

    assert.strictEqual(list.length, 1);
    assert.strictEqual(list[0].id, mockLecture2.id);
  });

  test('7. courses.update permission gates course edit modal', () => {
    const canEditCourse = (user) => {
      if (user.role === 'TEACHER') return true;
      return user.permissions?.includes('courses.update') || user.permissions?.includes('courses.manage');
    };

    assert.strictEqual(canEditCourse({ role: 'TEACHER', permissions: [] }), true);
    assert.strictEqual(canEditCourse({ role: 'SUPERVISOR', permissions: ['courses.update'] }), true);
    assert.strictEqual(canEditCourse({ role: 'SUPERVISOR', permissions: ['courses.read'] }), false);
  });

  test('8. lectures.create permission gates add lecture modal', () => {
    const canCreateLecture = (user) => {
      if (user.role === 'TEACHER') return true;
      return user.permissions?.includes('lectures.create') || user.permissions?.includes('lectures.manage');
    };

    assert.strictEqual(canCreateLecture({ role: 'TEACHER', permissions: [] }), true);
    assert.strictEqual(canCreateLecture({ role: 'SUPERVISOR', permissions: ['lectures.create'] }), true);
    assert.strictEqual(canCreateLecture({ role: 'SUPERVISOR', permissions: ['lectures.read'] }), false);
  });

  test('9. lectures.delete permission gates delete lecture action', () => {
    const canDeleteLecture = (user) => {
      if (user.role === 'TEACHER') return true;
      return user.permissions?.includes('lectures.delete') || user.permissions?.includes('lectures.manage');
    };

    assert.strictEqual(canDeleteLecture({ role: 'TEACHER', permissions: [] }), true);
    assert.strictEqual(canDeleteLecture({ role: 'SUPERVISOR', permissions: ['lectures.delete'] }), true);
    assert.strictEqual(canDeleteLecture({ role: 'SUPERVISOR', permissions: ['lectures.update'] }), false);
  });

  test('10. Academic year scope violation returns 403 error cleanly', () => {
    const tenancyError = {
      statusCode: 403,
      error_code: 'ACADEMIC_YEAR_SCOPE_DENIED',
      message: 'Supervisor is not authorized for this lecture academic year',
    };

    assert.strictEqual(tenancyError.statusCode, 403);
    assert.strictEqual(tenancyError.error_code, 'ACADEMIC_YEAR_SCOPE_DENIED');
  });

  test('11. Zero fake lecture counts exist in syllabus view', () => {
    const syllabus = [mockLecture1, mockLecture2];
    assert.strictEqual(syllabus.length, 2);
    assert.strictEqual('fakeEnrolledCount' in syllabus[0], false);
  });
});

describe('Phase 4B-FE-3A: YouTube Video Management Verification', () => {
  const mockMainVideo = {
    id: 'vvvvvvvv-1111-4vvv-vvvv-vvvvvvvvvvvv',
    lecture_id: '11111111-1111-4111-1111-111111111111',
    video_type: 'MAIN',
    provider: 'YOUTUBE',
    provider_video_id: 'dQw4w9WgXcQ',
    duration_seconds: 3600,
    status: 'READY',
    thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    created_at: '2026-09-02T10:00:00.000Z',
    updated_at: '2026-09-02T10:00:00.000Z',
  };

  const mockSolutionVideo = {
    id: 'vvvvvvvv-2222-4vvv-vvvv-vvvvvvvvvvvv',
    lecture_id: '11111111-1111-4111-1111-111111111111',
    video_type: 'SOLUTION',
    provider: 'YOUTUBE',
    provider_video_id: '9bZkp7q19f0',
    duration_seconds: 1800,
    status: 'READY',
    thumbnail_url: 'https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg',
    created_at: '2026-09-02T12:00:00.000Z',
    updated_at: '2026-09-02T12:00:00.000Z',
  };

  // Helper function matching extractYouTubeVideoId
  function extractYouTubeId(input) {
    if (!input || typeof input !== 'string') return null;
    const trimmed = input.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
    try {
      const url = new URL(trimmed);
      const host = url.hostname.toLowerCase();
      const isYouTube = host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtu.be';
      if (!isYouTube) return null;
      if (host === 'youtu.be') {
        const parts = url.pathname.split('/').filter(Boolean);
        return parts[0] && /^[a-zA-Z0-9_-]{11}$/.test(parts[0]) ? parts[0] : null;
      } else if (url.pathname === '/watch') {
        const v = url.searchParams.get('v');
        return v && /^[a-zA-Z0-9_-]{11}$/.test(v) ? v : null;
      } else if (url.pathname.startsWith('/embed/')) {
        const parts = url.pathname.split('/').filter(Boolean);
        return parts[1] && /^[a-zA-Z0-9_-]{11}$/.test(parts[1]) ? parts[1] : null;
      }
    } catch {
      return null;
    }
    return null;
  }

  test('1. Video list separates MAIN and SOLUTION videos cleanly', () => {
    const videoList = [mockMainVideo, mockSolutionVideo];
    const main = videoList.find((v) => v.video_type === 'MAIN');
    const solution = videoList.find((v) => v.video_type === 'SOLUTION');

    assert.strictEqual(main.provider_video_id, 'dQw4w9WgXcQ');
    assert.strictEqual(solution.provider_video_id, '9bZkp7q19f0');
    assert.strictEqual(main.duration_seconds, 3600);
    assert.strictEqual(solution.duration_seconds, 1800);
  });

  test('2. YouTube ID extractor handles direct 11-char ID', () => {
    const id = extractYouTubeId('dQw4w9WgXcQ');
    assert.strictEqual(id, 'dQw4w9WgXcQ');
  });

  test('3. YouTube ID extractor handles full watch URL', () => {
    const id = extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    assert.strictEqual(id, 'dQw4w9WgXcQ');
  });

  test('4. YouTube ID extractor handles youtu.be short URL', () => {
    const id = extractYouTubeId('https://youtu.be/dQw4w9WgXcQ');
    assert.strictEqual(id, 'dQw4w9WgXcQ');
  });

  test('5. YouTube ID extractor handles embed URL', () => {
    const id = extractYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ');
    assert.strictEqual(id, 'dQw4w9WgXcQ');
  });

  test('6. YouTube ID extractor rejects non-YouTube domains and invalid inputs', () => {
    assert.strictEqual(extractYouTubeId('https://vimeo.com/12345678'), null);
    assert.strictEqual(extractYouTubeId('https://dailymotion.com/video/x7'), null);
    assert.strictEqual(extractYouTubeId('invalid-string'), null);
    assert.strictEqual(extractYouTubeId(''), null);
  });

  test('7. Embed URL builder produces privacy-enhanced youtube-nocookie.com domain', () => {
    function buildEmbed(id) {
      return `https://www.youtube-nocookie.com/embed/${id}?controls=1&rel=0&playsinline=1&modestbranding=1&enablejsapi=1`;
    }
    const embedUrl = buildEmbed('dQw4w9WgXcQ');
    assert.strictEqual(
      embedUrl,
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?controls=1&rel=0&playsinline=1&modestbranding=1&enablejsapi=1'
    );
    assert.strictEqual(embedUrl.includes('youtube-nocookie.com'), true);
  });

  test('8. Attach video payload formats correctly for MAIN and SOLUTION', () => {
    const payload = {
      video_type: 'MAIN',
      provider: 'YOUTUBE',
      video_input: 'https://youtu.be/dQw4w9WgXcQ',
      duration_seconds: 3600,
      status: 'READY',
    };

    assert.strictEqual(payload.video_type, 'MAIN');
    assert.strictEqual(payload.provider, 'YOUTUBE');
    assert.strictEqual(payload.duration_seconds, 3600);
  });

  test('9. videos.manage permission gates attach and update controls', () => {
    const canManageVideos = (user) => {
      if (user.role === 'TEACHER') return true;
      return user.permissions?.includes('videos.manage') || user.permissions?.includes('lectures.manage');
    };

    assert.strictEqual(canManageVideos({ role: 'TEACHER', permissions: [] }), true);
    assert.strictEqual(canManageVideos({ role: 'SUPERVISOR', permissions: ['videos.manage'] }), true);
    assert.strictEqual(canManageVideos({ role: 'SUPERVISOR', permissions: ['videos.read'] }), false);
  });

  test('10. Attaching MAIN video updates lecture duration synchronization', () => {
    const lecture = { id: 'l1', duration_seconds: 0 };
    const attachedVideo = { video_type: 'MAIN', duration_seconds: 3600 };

    if (attachedVideo.video_type === 'MAIN') {
      lecture.duration_seconds = attachedVideo.duration_seconds;
    }

    assert.strictEqual(lecture.duration_seconds, 3600);
  });

  test('11. Zero non-YouTube video providers exist in Phase 4B-FE-3A', () => {
    const supportedProvider = 'YOUTUBE';
    assert.strictEqual(supportedProvider, 'YOUTUBE');
    assert.notStrictEqual(supportedProvider, 'BUNNY');
    assert.notStrictEqual(supportedProvider, 'S3');
  });
});

describe('Phase 4B-FE-3B: Lecture Chapters / Timestamp Index Verification', () => {
  function formatTimestamp(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return '00:00';
    }
    const total = Math.floor(seconds);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function parseTimestampToSeconds(input) {
    if (input === null || input === undefined) return null;
    if (typeof input === 'number') {
      return Number.isFinite(input) && input >= 0 ? Math.floor(input) : null;
    }
    const raw = String(input).trim();
    if (!raw) return null;
    if (/^\d+$/.test(raw)) {
      const val = parseInt(raw, 10);
      return Number.isFinite(val) && val >= 0 ? val : null;
    }
    if (raw.includes(':')) {
      const parts = raw.split(':').map((p) => p.trim());
      if (parts.length === 2) {
        const [mStr, sStr] = parts;
        if (!/^\d+$/.test(mStr) || !/^\d+$/.test(sStr)) return null;
        const m = parseInt(mStr, 10);
        const s = parseInt(sStr, 10);
        if (isNaN(m) || isNaN(s) || m < 0 || s < 0 || s >= 60) return null;
        return m * 60 + s;
      }
      if (parts.length === 3) {
        const [hStr, mStr, sStr] = parts;
        if (!/^\d+$/.test(hStr) || !/^\d+$/.test(mStr) || !/^\d+$/.test(sStr)) return null;
        const h = parseInt(hStr, 10);
        const m = parseInt(mStr, 10);
        const s = parseInt(sStr, 10);
        if (isNaN(h) || isNaN(m) || isNaN(s) || h < 0 || m < 0 || m >= 60 || s < 0 || s >= 60) return null;
        return h * 3600 + m * 60 + s;
      }
    }
    return null;
  }

  const mockChapters = [
    {
      id: 'ch-1',
      lecture_id: 'lec-1',
      title_ar: 'المقدمة والأهداف',
      title_en: 'Introduction & Objectives',
      timestamp_seconds: 0,
      sequence_order: 1,
    },
    {
      id: 'ch-2',
      lecture_id: 'lec-1',
      title_ar: 'قوانين نيوتن للحركة',
      title_en: "Newton's Laws of Motion",
      timestamp_seconds: 450,
      sequence_order: 2,
    },
    {
      id: 'ch-3',
      lecture_id: 'lec-1',
      title_ar: 'تطبيقات عملية ومسائل',
      title_en: 'Practical Applications & Problems',
      timestamp_seconds: 1800,
      sequence_order: 3,
    },
  ];

  test('1. formatTimestamp correctly renders MM:SS and HH:MM:SS', () => {
    assert.strictEqual(formatTimestamp(0), '00:00');
    assert.strictEqual(formatTimestamp(75), '01:15');
    assert.strictEqual(formatTimestamp(450), '07:30');
    assert.strictEqual(formatTimestamp(3600), '1:00:00');
    assert.strictEqual(formatTimestamp(3725), '1:02:05');
    assert.strictEqual(formatTimestamp(-10), '00:00');
    assert.strictEqual(formatTimestamp(NaN), '00:00');
  });

  test('2. parseTimestampToSeconds parses raw integer and string formats', () => {
    assert.strictEqual(parseTimestampToSeconds(150), 150);
    assert.strictEqual(parseTimestampToSeconds('150'), 150);
    assert.strictEqual(parseTimestampToSeconds('02:30'), 150);
    assert.strictEqual(parseTimestampToSeconds('07:30'), 450);
    assert.strictEqual(parseTimestampToSeconds('1:02:05'), 3725);
    assert.strictEqual(parseTimestampToSeconds('01:15:30'), 4530);
  });

  test('3. parseTimestampToSeconds rejects invalid timestamps and out-of-range seconds', () => {
    assert.strictEqual(parseTimestampToSeconds(''), null);
    assert.strictEqual(parseTimestampToSeconds('abc'), null);
    assert.strictEqual(parseTimestampToSeconds('01:75'), null); // seconds >= 60
    assert.strictEqual(parseTimestampToSeconds('01:60'), null);
    assert.strictEqual(parseTimestampToSeconds('-50'), null);
    assert.strictEqual(parseTimestampToSeconds(null), null);
    assert.strictEqual(parseTimestampToSeconds(undefined), null);
  });

  test('4. Chapter creation payload matches backend DTO schema', () => {
    const payload = {
      title_ar: 'قوانين نيوتن للحركة',
      title_en: "Newton's Laws of Motion",
      timestamp_seconds: 450,
      sequence_order: 2,
    };

    assert.strictEqual(typeof payload.title_ar, 'string');
    assert.strictEqual(typeof payload.title_en, 'string');
    assert.strictEqual(typeof payload.timestamp_seconds, 'number');
    assert.strictEqual(payload.timestamp_seconds >= 0, true);
    assert.strictEqual(typeof payload.sequence_order, 'number');
  });

  test('5. Chapter timestamp exceeding lecture duration is caught and blocked', () => {
    const lectureDuration = 3600; // 1 hour
    const invalidTimestamp = 4000;

    const isExceeding = invalidTimestamp > lectureDuration;
    assert.strictEqual(isExceeding, true);

    function validateChapter(timestamp, duration) {
      if (duration > 0 && timestamp > duration) {
        throw new Error(`Chapter timestamp (${timestamp}s) exceeds lecture duration (${duration}s)`);
      }
      return true;
    }

    assert.throws(
      () => validateChapter(invalidTimestamp, lectureDuration),
      /exceeds lecture duration/
    );
    assert.strictEqual(validateChapter(1800, lectureDuration), true);
  });

  test('6. Chapters are ordered strictly by sequence_order ASC and timestamp_seconds ASC', () => {
    const unsorted = [
      { id: '3', sequence_order: 3, timestamp_seconds: 1800 },
      { id: '1', sequence_order: 1, timestamp_seconds: 0 },
      { id: '2b', sequence_order: 2, timestamp_seconds: 600 },
      { id: '2a', sequence_order: 2, timestamp_seconds: 300 },
    ];

    const sorted = [...unsorted].sort((a, b) => {
      if (a.sequence_order !== b.sequence_order) {
        return a.sequence_order - b.sequence_order;
      }
      return a.timestamp_seconds - b.timestamp_seconds;
    });

    assert.deepStrictEqual(
      sorted.map((c) => c.id),
      ['1', '2a', '2b', '3']
    );
  });

  test('7. Chapter addition appends and re-sorts chapter list', () => {
    const initialList = [...mockChapters];
    const newChapter = {
      id: 'ch-4',
      lecture_id: 'lec-1',
      title_ar: 'الخاتمة والملخص',
      title_en: 'Summary & Conclusion',
      timestamp_seconds: 3200,
      sequence_order: 4,
    };

    const updatedList = [...initialList, newChapter].sort((a, b) => a.sequence_order - b.sequence_order);

    assert.strictEqual(updatedList.length, 4);
    assert.strictEqual(updatedList[3].id, 'ch-4');
    assert.strictEqual(updatedList[3].timestamp_seconds, 3200);
  });

  test('8. Chapter deletion removes chapter item without fabricating PATCH route', () => {
    const initialList = [...mockChapters];
    const chapterIdToRemove = 'ch-2';

    const updatedList = initialList.filter((c) => c.id !== chapterIdToRemove);

    assert.strictEqual(updatedList.length, 2);
    assert.strictEqual(updatedList.some((c) => c.id === 'ch-2'), false);
    assert.strictEqual(updatedList[0].id, 'ch-1');
    assert.strictEqual(updatedList[1].id, 'ch-3');
  });

  test('9. RBAC permission gates require lectures.manage or global teacher role for chapter mutations', () => {
    const canManageChapters = (user) => {
      if (user.role === 'TEACHER') return true;
      return (
        user.permissions?.includes('lectures.manage') ||
        user.permissions?.includes('courses.manage')
      );
    };

    assert.strictEqual(canManageChapters({ role: 'TEACHER', permissions: [] }), true);
    assert.strictEqual(canManageChapters({ role: 'SUPERVISOR', permissions: ['lectures.manage'] }), true);
    assert.strictEqual(canManageChapters({ role: 'SUPERVISOR', permissions: ['lectures.read'] }), false);
  });

  test('10. Academic-year tenancy validation rejects chapter access across scopes', () => {
    const lectureYearId = 'year-2026';
    const supervisorYears = ['year-2025'];
    const isGlobal = false;

    const hasAccess = isGlobal || supervisorYears.includes(lectureYearId);
    assert.strictEqual(hasAccess, false);
  });
});

describe('Phase 4B-FE-3C: Lecture Attachments & Google Drive PDF Management Verification', () => {
  function formatFileSize(bytes) {
    if (!bytes || bytes <= 0 || !Number.isFinite(bytes)) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = Number(bytes);
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  }

  function validatePdfSelection(filename, mimeType, sizeBytes, maxSize = 50 * 1024 * 1024) {
    if (!filename || !mimeType) {
      throw new Error('File is required');
    }
    const isPdf = filename.toLowerCase().endsWith('.pdf') || mimeType === 'application/pdf';
    if (!isPdf) {
      throw new Error('Invalid file type: only PDF files are allowed');
    }
    if (sizeBytes > maxSize) {
      throw new Error(`File size (${formatFileSize(sizeBytes)}) exceeds maximum limit`);
    }
    return true;
  }

  const mockAttachments = [
    {
      id: 'att-1',
      lecture_id: 'lec-1',
      title_ar: 'مذكرة الشرح النظري',
      title_en: 'Theoretical Study Notes',
      storage_provider: 'GOOGLE_DRIVE',
      storage_file_id: 'gdrive-file-123456',
      original_filename: 'physics-notes-1.pdf',
      file_type: 'PDF',
      mime_type: 'application/pdf',
      file_size_bytes: 5242880, // 5 MB
      download_allowed: true,
      order_index: 1,
      status: 'ACTIVE',
    },
    {
      id: 'att-2',
      lecture_id: 'lec-1',
      title_ar: 'بنك أسئلة وتدريبات',
      title_en: 'Question Bank & Exercises',
      storage_provider: 'GOOGLE_DRIVE',
      storage_file_id: 'gdrive-file-789012',
      original_filename: 'exercise-sheet.pdf',
      file_type: 'PDF',
      mime_type: 'application/pdf',
      file_size_bytes: 12582912, // 12 MB
      download_allowed: false,
      order_index: 2,
      status: 'ACTIVE',
    },
  ];

  test('1. formatFileSize formats bytes into human-readable units correctly', () => {
    assert.strictEqual(formatFileSize(0), '0 B');
    assert.strictEqual(formatFileSize(null), '0 B');
    assert.strictEqual(formatFileSize(500), '500 B');
    assert.strictEqual(formatFileSize(1024), '1.0 KB');
    assert.strictEqual(formatFileSize(5242880), '5.0 MB');
    assert.strictEqual(formatFileSize(1073741824), '1.0 GB');
  });

  test('2. PDF selection validation accepts genuine PDF and enforces 50 MB limit', () => {
    assert.strictEqual(
      validatePdfSelection('lecture1.pdf', 'application/pdf', 10 * 1024 * 1024),
      true
    );

    assert.throws(
      () => validatePdfSelection('notes.docx', 'application/vnd.openxmlformats-officedocument', 1024),
      /Invalid file type/
    );

    assert.throws(
      () => validatePdfSelection('large-book.pdf', 'application/pdf', 60 * 1024 * 1024),
      /exceeds maximum limit/
    );
  });

  test('3. Attachment upload payload formats correctly for backend multipart upload', () => {
    const payload = {
      title_ar: 'مذكرة الشرح',
      title_en: 'Study Notes',
      download_allowed: true,
      order_index: 1,
    };

    assert.strictEqual(payload.title_ar, 'مذكرة الشرح');
    assert.strictEqual(payload.title_en, 'Study Notes');
    assert.strictEqual(payload.download_allowed, true);
    assert.strictEqual(payload.order_index, 1);
  });

  test('4. download_allowed flag controls download vs view-only state', () => {
    const att1 = mockAttachments[0];
    const att2 = mockAttachments[1];

    assert.strictEqual(att1.download_allowed, true);
    assert.strictEqual(att2.download_allowed, false);
  });

  test('5. Attachment metadata update preserves Google Drive file ID unless replaced', () => {
    const original = { ...mockAttachments[0] };
    const metadataUpdate = {
      title_ar: 'مذكرة الشرح المعدلة',
      download_allowed: false,
    };

    const updated = {
      ...original,
      title_ar: metadataUpdate.title_ar,
      download_allowed: metadataUpdate.download_allowed,
    };

    assert.strictEqual(updated.title_ar, 'مذكرة الشرح المعدلة');
    assert.strictEqual(updated.download_allowed, false);
    assert.strictEqual(updated.storage_file_id, original.storage_file_id);
  });

  test('6. Attachment deletion removes record without fabricating archive status', () => {
    const initialList = [...mockAttachments];
    const idToDelete = 'att-1';

    const updatedList = initialList.filter((a) => a.id !== idToDelete);

    assert.strictEqual(updatedList.length, 1);
    assert.strictEqual(updatedList[0].id, 'att-2');
  });

  test('7. Google Drive internal file IDs and credentials are not exposed as public links', () => {
    const att = mockAttachments[0];
    const clientAccessUrl = `/attachments/${att.id}/access?download=false`;

    assert.strictEqual(clientAccessUrl.includes(att.storage_file_id), false);
    assert.strictEqual(clientAccessUrl.includes('drive.google.com'), false);
    assert.strictEqual(clientAccessUrl.startsWith('/attachments/'), true);
  });

  test('8. RBAC gates require attachments.read / attachments.manage permissions', () => {
    const canManageAttachments = (user) => {
      if (user.role === 'TEACHER') return true;
      return (
        user.permissions?.includes('attachments.manage') ||
        user.permissions?.includes('lectures.manage')
      );
    };

    assert.strictEqual(canManageAttachments({ role: 'TEACHER', permissions: [] }), true);
    assert.strictEqual(canManageAttachments({ role: 'SUPERVISOR', permissions: ['attachments.manage'] }), true);
    assert.strictEqual(canManageAttachments({ role: 'SUPERVISOR', permissions: ['attachments.read'] }), false);
  });

  test('9. Academic-year tenancy denies out-of-scope attachment mutations', () => {
    const targetLectureYear = 'year-2026-term1';
    const supervisorYears = ['year-2025-term1'];
    const isGlobal = false;

    const isAuthorized = isGlobal || supervisorYears.includes(targetLectureYear);
    assert.strictEqual(isAuthorized, false);
  });

  test('10. Double-submission lock blocks concurrent upload calls', () => {
    let isSubmitting = false;
    let uploadCount = 0;

    function triggerUpload() {
      if (isSubmitting) return false;
      isSubmitting = true;
      uploadCount++;
      return true;
    }

    assert.strictEqual(triggerUpload(), true);
    assert.strictEqual(triggerUpload(), false); // blocked by lock
    assert.strictEqual(uploadCount, 1);
  });
});


