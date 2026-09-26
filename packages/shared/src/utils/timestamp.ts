/**
 * Formats a timestamp in seconds to 'MM:SS' or 'HH:MM:SS'
 */
export function formatTimestamp(seconds: number): string {
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

/**
 * Parses user input string (e.g. '01:30', '1:20:00', or '90') or numeric seconds into integer seconds.
 * Returns null if invalid.
 */
export function parseTimestampToSeconds(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) {
    return null;
  }

  if (typeof input === 'number') {
    if (Number.isFinite(input) && input >= 0) {
      return Math.floor(input);
    }
    return null;
  }

  const raw = String(input).trim();
  if (!raw) {
    return null;
  }

  // Pure integer string
  if (/^\d+$/.test(raw)) {
    const val = parseInt(raw, 10);
    return Number.isFinite(val) && val >= 0 ? val : null;
  }

  // Colon-separated format
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
