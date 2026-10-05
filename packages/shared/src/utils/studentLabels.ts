/**
 * Formats student section / track to Arabic or English display label.
 * Handles both standard keys (SCIENCE_GENERAL, SCIENCE_MATH, LITERATURE)
 * and short keys (SCIENCE, MATH, LITERARY).
 */
export function formatSectionLabel(
  section?: string | null,
  educationType?: string | null,
  isArabic: boolean = true
): string {
  if (!section || !section.trim()) {
    return isArabic ? 'عام (شعبة عامة)' : 'General';
  }

  const s = section.toUpperCase().trim();
  const isAzhar = educationType?.toUpperCase().includes('AZHAR');

  switch (s) {
    case 'SCIENCE_GENERAL':
    case 'SCIENCE':
      return isArabic ? (isAzhar ? 'علمي' : 'علمي علوم') : 'Science';
    case 'SCIENCE_MATH':
    case 'MATH':
      return isArabic ? 'علمي رياضة' : 'Math';
    case 'LITERATURE':
    case 'LITERARY':
      return isArabic ? 'أدبي' : 'Literature';
    case 'GENERAL':
      return isArabic ? 'عام (شعبة عامة)' : 'General';
    default:
      return section;
  }
}

/**
 * Formats student education type (General vs Azhar).
 */
export function formatEducationTypeLabel(
  educationType?: string | null,
  isArabic: boolean = true
): string {
  if (!educationType || !educationType.trim()) {
    return isArabic ? 'تعليم عام' : 'General Education';
  }
  const ed = educationType.toUpperCase().trim();
  if (ed === 'AZHAR' || ed === 'AL_AZHAR') {
    return isArabic ? 'أزهر شريف' : 'Al-Azhar';
  }
  return isArabic ? 'تعليم عام' : 'General Education';
}

/**
 * Formats student study type (Arabic vs Languages).
 */
export function formatStudyTypeLabel(
  studyType?: string | null,
  isArabic: boolean = true
): string {
  if (!studyType || !studyType.trim()) {
    return isArabic ? 'عربي' : 'Arabic';
  }
  const st = studyType.toUpperCase().trim();
  if (st === 'LANGUAGES') {
    return isArabic ? 'لغات / تجريبي' : 'Languages';
  }
  return isArabic ? 'عربي' : 'Arabic';
}

/**
 * Formats student gender.
 */
export function formatGenderLabel(
  gender?: string | null,
  isArabic: boolean = true
): string {
  if (!gender || !gender.trim()) return '—';
  const g = gender.toUpperCase().trim();
  if (g === 'MALE') return isArabic ? 'ذكر' : 'Male';
  if (g === 'FEMALE') return isArabic ? 'أنثى' : 'Female';
  return gender;
}
