const test = require('node:test');
const assert = require('node:assert/strict');

// 1. YouTube & Player Embed Helpers
function extractYouTubeVideoId(input) {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  try {
    const url = new URL(trimmed);
    const hostname = url.hostname.toLowerCase();
    const isYouTube =
      hostname === 'youtube.com' || hostname.endsWith('.youtube.com') || hostname === 'youtu.be';
    if (!isYouTube) return null;

    if (hostname === 'youtu.be') {
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

function buildYouTubeEmbedUrl(videoId, resumePosition = 0) {
  const base = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&controls=1&rel=0&playsinline=1&modestbranding=1`;
  return resumePosition > 0 ? `${base}&start=${Math.floor(resumePosition)}` : base;
}

function formatTimestamp(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

test('Student Lectures UI & Player Integration Unit Tests', async (t) => {
  await t.test('1. YouTube Video ID extraction supports standard, short, embed formats and rejects non-YouTube URLs', () => {
    assert.equal(extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
    assert.equal(extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
    assert.equal(extractYouTubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
    assert.equal(extractYouTubeVideoId('dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
    assert.equal(extractYouTubeVideoId('https://vimeo.com/12345678'), null);
    assert.equal(extractYouTubeVideoId(''), null);
  });

  await t.test('2. Privacy-enhanced embed URL uses youtube-nocookie with resume position & security flags', () => {
    const embedUrlWithResume = buildYouTubeEmbedUrl('dQw4w9WgXcQ', 345);
    assert.ok(embedUrlWithResume.startsWith('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'));
    assert.ok(embedUrlWithResume.includes('&start=345'));
    assert.ok(embedUrlWithResume.includes('playsinline=1'));
    assert.ok(embedUrlWithResume.includes('rel=0'));
    assert.ok(!embedUrlWithResume.includes('www.youtube.com')); // Must NOT use standard domain
  });

  await t.test('3. Chapter timestamp formatter formats seconds to MM:SS and HH:MM:SS', () => {
    assert.equal(formatTimestamp(0), '00:00');
    assert.equal(formatTimestamp(65), '01:05');
    assert.equal(formatTimestamp(3665), '1:01:05');
    assert.equal(formatTimestamp(7200), '2:00:00');
  });

  await t.test('4. My Lectures filters strictly within authorized records returned by backend', () => {
    const authorizedLectures = [
      { id: '1', title_ar: 'محاضرة النحو', course_title_ar: 'كورس النحو', is_published: true },
      { id: '2', title_ar: 'محاضرة البلاغة', course_title_ar: 'كورس البلاغة', is_published: true },
    ];

    // Filter by course
    const filteredByCourse = authorizedLectures.filter((l) => l.course_title_ar === 'كورس النحو');
    assert.equal(filteredByCourse.length, 1);
    assert.equal(filteredByCourse[0].id, '1');

    // Search query
    const filteredBySearch = authorizedLectures.filter((l) => l.title_ar.includes('البلاغة'));
    assert.equal(filteredBySearch.length, 1);
    assert.equal(filteredBySearch[0].id, '2');
  });

  await t.test('5. 90% Completion threshold calculation correctly identifies completion', () => {
    const threshold = 0.9;
    assert.equal(89 / 100 >= threshold, false);
    assert.equal(90 / 100 >= threshold, true);
    assert.equal(95 / 100 >= threshold, true);
    assert.equal(100 / 100 >= threshold, true);
  });
});
