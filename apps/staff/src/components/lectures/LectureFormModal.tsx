'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  Loader2,
  AlertCircle,
  Upload,
  BookOpen,
  Package as PackageIcon,
  Video,
  FileText,
  ListOrdered,
  Eye,
  Calendar,
  Clock,
  Globe,
  Lock,
  Sparkles,
  Trash2,
  CheckCircle2,
  Search,
  Crop,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAcademicYearScope } from '@/context/AcademicYearContext';
import {
  LectureItem,
  CreateLecturePayload,
  UpdateLecturePayload,
  CourseItem,
  PackageItem,
  createLecturesApi,
  createCoursesApi,
  createPackagesApi,
  createAttachmentsApi,
  extractYouTubeVideoId,
  buildYouTubeEmbedUrl,
} from '@omar-makawy/shared';
import { staffApiClient } from '@/context/StaffAuthContext';
import { ImageCropperModal } from '../courses/ImageCropperModal';
import { LectureCardPreview } from './LectureCardPreview';
import { LectureChaptersManager, ChapterDraft } from './LectureChaptersManager';
import {
  LectureAttachmentsManager,
  PendingAttachmentDraft,
} from './LectureAttachmentsManager';

const staffLecturesApi = createLecturesApi(staffApiClient);
const staffCoursesApi = createCoursesApi(staffApiClient);
const staffPackagesApi = createPackagesApi(staffApiClient);
const staffAttachmentsApi = createAttachmentsApi(staffApiClient);

interface LectureFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (lecture: LectureItem) => void;
  initialLecture?: LectureItem | null;
}

type TabKey = 'basic' | 'access' | 'videos' | 'visibility' | 'chapters' | 'attachments' | 'preview';

export function LectureFormModal({
  isOpen,
  onClose,
  onSuccess,
  initialLecture = null,
}: LectureFormModalProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { availableYears, activeAcademicYearId } = useAcademicYearScope();

  const isEdit = Boolean(initialLecture);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<TabKey>('basic');

  // Form Fields State
  const [academicYearId, setAcademicYearId] = useState<string>('');
  const [titleAr, setTitleAr] = useState<string>('');
  const [titleEn, setTitleEn] = useState<string>('');
  const [descriptionAr, setDescriptionAr] = useState<string>('');
  const [descriptionEn, setDescriptionEn] = useState<string>('');
  const [sequenceOrder, setSequenceOrder] = useState<number>(1);
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [status, setStatus] = useState<string>('PUBLISHED');
  const [visibility, setVisibility] = useState<string>('SUBSCRIBER_ONLY');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('20:00');
  const [isFree, setIsFree] = useState<boolean>(false);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);

  // Thumbnail State
  const [currentServerThumbnail, setCurrentServerThumbnail] = useState<string | null>(null);
  const [pendingCropFile, setPendingCropFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState<boolean>(false);

  // Multi-Course & Multi-Package Selection State
  const [availableCourses, setAvailableCourses] = useState<CourseItem[]>([]);
  const [availablePackages, setAvailablePackages] = useState<PackageItem[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);
  const [courseSearch, setCourseSearch] = useState<string>('');
  const [packageSearch, setPackageSearch] = useState<string>('');
  const [isLoadingRelations, setIsLoadingRelations] = useState<boolean>(false);

  // Videos State
  const [mainVideoUrl, setMainVideoUrl] = useState<string>('');
  const [solutionVideoUrl, setSolutionVideoUrl] = useState<string>('');
  const [mainVideoError, setMainVideoError] = useState<string | null>(null);
  const [solutionVideoError, setSolutionVideoError] = useState<string | null>(null);

  // Chapters & Attachments State
  const [chapters, setChapters] = useState<ChapterDraft[]>([]);
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachmentDraft[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadProgressStatus, setUploadProgressStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize or reset form data
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setUploadProgressStatus(null);
      setPendingCropFile(null);
      setMainVideoError(null);
      setSolutionVideoError(null);
      setActiveTab('basic');

      if (initialLecture) {
        setAcademicYearId(initialLecture.academic_year_id);
        setTitleAr(initialLecture.title_ar || '');
        setTitleEn(initialLecture.title_en || '');
        setDescriptionAr(initialLecture.description_ar || '');
        setDescriptionEn(initialLecture.description_en || '');
        setSequenceOrder(initialLecture.sequence_order || 1);
        setSortOrder(initialLecture.sort_order || 0);
        setStatus(initialLecture.status || 'PUBLISHED');
        setVisibility(initialLecture.visibility || (initialLecture.is_free ? 'FREE' : 'SUBSCRIBER_ONLY'));
        setIsFree(initialLecture.is_free ?? false);
        setDurationSeconds(initialLecture.duration_seconds || 0);

        if (initialLecture.scheduled_at) {
          const d = new Date(initialLecture.scheduled_at);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          setScheduledDate(`${yyyy}-${mm}-${dd}`);
          const hh = String(d.getHours()).padStart(2, '0');
          const min = String(d.getMinutes()).padStart(2, '0');
          setScheduledTime(`${hh}:${min}`);
        } else {
          setScheduledDate('');
          setScheduledTime('20:00');
        }

        setCurrentServerThumbnail(initialLecture.thumbnail_url || null);
        setLocalPreviewUrl(initialLecture.thumbnail_url || null);

        // Course & Package Relations
        const cIds: string[] = [];
        if (initialLecture.courses && Array.isArray(initialLecture.courses)) {
          initialLecture.courses.forEach((c) => cIds.push(c.id));
        } else if (initialLecture.course_ids && Array.isArray(initialLecture.course_ids)) {
          cIds.push(...initialLecture.course_ids);
        } else if (initialLecture.course_id) {
          cIds.push(initialLecture.course_id);
        }
        setSelectedCourseIds(cIds);

        const pIds: string[] = [];
        if (initialLecture.packages && Array.isArray(initialLecture.packages)) {
          initialLecture.packages.forEach((p) => pIds.push(p.id));
        } else if (initialLecture.package_ids && Array.isArray(initialLecture.package_ids)) {
          pIds.push(...initialLecture.package_ids);
        }
        setSelectedPackageIds(pIds);

        // Videos
        if (initialLecture.videos && Array.isArray(initialLecture.videos)) {
          const main = initialLecture.videos.find((v) => v.video_type === 'MAIN');
          const sol = initialLecture.videos.find((v) => v.video_type === 'SOLUTION');
          setMainVideoUrl(main ? (main.provider_video_id || '') : '');
          setSolutionVideoUrl(sol ? (sol.provider_video_id || '') : '');
        } else {
          setMainVideoUrl('');
          setSolutionVideoUrl('');
        }

        // Chapters
        if (initialLecture.chapters && Array.isArray(initialLecture.chapters)) {
          setChapters(
            initialLecture.chapters.map((ch) => ({
              id: ch.id,
              timestamp_seconds: ch.timestamp_seconds,
              title_ar: ch.title_ar,
              title_en: ch.title_en,
            }))
          );
        } else {
          setChapters([]);
        }

        // Attachments
        if (initialLecture.attachments && Array.isArray(initialLecture.attachments)) {
          setExistingAttachments(initialLecture.attachments);
        } else {
          setExistingAttachments([]);
        }
        setPendingAttachments([]);
      } else {
        // Create mode defaults
        const defaultYear = activeAcademicYearId || (availableYears[0]?.id ?? '');
        setAcademicYearId(defaultYear);
        setTitleAr('');
        setTitleEn('');
        setDescriptionAr('');
        setDescriptionEn('');
        setSequenceOrder(1);
        setSortOrder(0);
        setStatus('PUBLISHED');
        setVisibility('SUBSCRIBER_ONLY');
        setScheduledDate('');
        setScheduledTime('20:00');
        setIsFree(false);
        setDurationSeconds(0);
        setCurrentServerThumbnail(null);
        setLocalPreviewUrl(null);
        setSelectedCourseIds([]);
        setSelectedPackageIds([]);
        setMainVideoUrl('');
        setSolutionVideoUrl('');
        setChapters([]);
        setPendingAttachments([]);
        setExistingAttachments([]);
      }
    }
  }, [isOpen, initialLecture, activeAcademicYearId, availableYears]);

  // Load available courses & packages
  const fetchRelations = useCallback(async (yearId?: string) => {
    setIsLoadingRelations(true);
    try {
      const [coursesResult, packagesResult] = await Promise.allSettled([
        staffCoursesApi
          .listCourses(
            yearId ? { academic_year_id: yearId, limit: 100 } : { limit: 100 },
            yearId || undefined
          )
          .catch(() => staffCoursesApi.listCourses({ limit: 100 }).catch(() => null)),
        staffPackagesApi
          .listPackages(
            yearId ? { academic_year_id: yearId, limit: 100 } : { limit: 100 },
            yearId || undefined
          )
          .catch(() => staffPackagesApi.listPackages({ limit: 100 }).catch(() => null)),
      ]);

      let coursesList: any[] = [];
      if (coursesResult.status === 'fulfilled' && coursesResult.value) {
        const val: any = coursesResult.value;
        coursesList = Array.isArray(val)
          ? val
          : Array.isArray(val?.data)
          ? val.data
          : val?.items || val?.courses || [];
      }

      let packagesList: any[] = [];
      if (packagesResult.status === 'fulfilled' && packagesResult.value) {
        const val: any = packagesResult.value;
        packagesList = Array.isArray(val)
          ? val
          : Array.isArray(val?.data)
          ? val.data
          : val?.items || val?.packages || [];
      }

      // If specific year had 0 items, fallback to fetching all courses/packages across all years
      if (coursesList.length === 0 && yearId) {
        const allCoursesRes: any = await staffCoursesApi.listCourses({ limit: 100 }).catch(() => null);
        const allCourses = Array.isArray(allCoursesRes)
          ? allCoursesRes
          : Array.isArray(allCoursesRes?.data)
          ? allCoursesRes.data
          : allCoursesRes?.items || allCoursesRes?.courses || [];
        if (allCourses.length > 0) {
          coursesList = allCourses;
        }
      }

      if (packagesList.length === 0 && yearId) {
        const allPkgsRes: any = await staffPackagesApi.listPackages({ limit: 100 }).catch(() => null);
        const allPkgs = Array.isArray(allPkgsRes)
          ? allPkgsRes
          : Array.isArray(allPkgsRes?.data)
          ? allPkgsRes.data
          : allPkgsRes?.items || allPkgsRes?.packages || [];
        if (allPkgs.length > 0) {
          packagesList = allPkgs;
        }
      }

      setAvailableCourses(coursesList);
      setAvailablePackages(packagesList);
    } catch (err) {
      console.error('Failed to load relations:', err);
    } finally {
      setIsLoadingRelations(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchRelations(academicYearId);
    }
  }, [isOpen, academicYearId, fetchRelations]);

  // Filtered courses based on search
  const filteredCourses = useMemo(() => {
    if (!courseSearch.trim()) return availableCourses;
    const q = courseSearch.toLowerCase().trim();
    return availableCourses.filter(
      (c) =>
        c.title_ar?.toLowerCase().includes(q) ||
        c.title_en?.toLowerCase().includes(q)
    );
  }, [availableCourses, courseSearch]);

  // Filtered packages based on search
  const filteredPackages = useMemo(() => {
    if (!packageSearch.trim()) return availablePackages;
    const q = packageSearch.toLowerCase().trim();
    return availablePackages.filter(
      (p) =>
        p.title_ar?.toLowerCase().includes(q) ||
        p.title_en?.toLowerCase().includes(q)
    );
  }, [availablePackages, packageSearch]);

  // Toggle Course Selection with auto academicYearId sync
  const toggleCourse = (course: any) => {
    const courseId = typeof course === 'string' ? course : course.id;
    const courseObj = typeof course === 'object' ? course : availableCourses.find((c) => c.id === courseId);

    if (!academicYearId && courseObj?.academic_year_id) {
      setAcademicYearId(courseObj.academic_year_id);
    }

    setSelectedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  // Toggle Package Selection with auto academicYearId sync
  const togglePackage = (pkg: any) => {
    const pkgId = typeof pkg === 'string' ? pkg : pkg.id;
    const pkgObj = typeof pkg === 'object' ? pkg : availablePackages.find((p) => p.id === pkgId);

    if (!academicYearId && pkgObj?.academic_year_id) {
      setAcademicYearId(pkgObj.academic_year_id);
    }

    setSelectedPackageIds((prev) =>
      prev.includes(pkgId) ? prev.filter((id) => id !== pkgId) : [...prev, pkgId]
    );
  };

  // Select all visible courses
  const selectAllCourses = () => {
    const visibleIds = filteredCourses.map((c) => c.id);
    setSelectedCourseIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
  };

  // Clear all courses
  const clearAllCourses = () => {
    setSelectedCourseIds([]);
  };

  // Select all visible packages
  const selectAllPackages = () => {
    const visibleIds = filteredPackages.map((p) => p.id);
    setSelectedPackageIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
  };

  // Clear all packages
  const clearAllPackages = () => {
    setSelectedPackageIds([]);
  };

  // Thumbnail Crop Handlers
  const handleCropComplete = (croppedFile: File, previewUrl: string) => {
    setPendingCropFile(croppedFile);
    setLocalPreviewUrl(previewUrl);
    setErrorMessage(null);
  };

  const handleRemoveThumbnail = () => {
    setPendingCropFile(null);
    setLocalPreviewUrl(null);
    setCurrentServerThumbnail(null);
  };

  // Video Validation on blur/change
  const validateMainVideo = (val: string) => {
    setMainVideoUrl(val);
    if (!val.trim()) {
      setMainVideoError(null);
      return;
    }
    const extractedId = extractYouTubeVideoId(val);
    if (!extractedId) {
      setMainVideoError(isAr ? 'رابط يوتيوب غير صالح' : 'Invalid YouTube URL or ID');
    } else {
      setMainVideoError(null);
    }
  };

  const validateSolutionVideo = (val: string) => {
    setSolutionVideoUrl(val);
    if (!val.trim()) {
      setSolutionVideoError(null);
      return;
    }
    const extractedId = extractYouTubeVideoId(val);
    if (!extractedId) {
      setSolutionVideoError(isAr ? 'رابط يوتيوب غير صالح' : 'Invalid YouTube URL or ID');
    } else {
      setSolutionVideoError(null);
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validation
    const cleanTitleAr = titleAr.trim();
    if (!cleanTitleAr) {
      setErrorMessage(isAr ? 'يرجى إدخال اسم المحاضرة بالعربية' : 'Arabic title is required');
      setActiveTab('basic');
      return;
    }

    if (!academicYearId) {
      setErrorMessage(isAr ? 'يرجى اختيار المرحلة الدراسية' : 'Academic year is required');
      setActiveTab('basic');
      return;
    }

    if (mainVideoUrl.trim()) {
      const extractedMain = extractYouTubeVideoId(mainVideoUrl);
      if (!extractedMain) {
        setErrorMessage(isAr ? 'رابط فيديو المحاضرة الأساسي غير صالح' : 'Invalid main YouTube URL');
        setActiveTab('videos');
        return;
      }
    }

    if (solutionVideoUrl.trim()) {
      const extractedSol = extractYouTubeVideoId(solutionVideoUrl);
      if (!extractedSol) {
        setErrorMessage(isAr ? 'رابط فيديو الحل غير صالح' : 'Invalid solution YouTube URL');
        setActiveTab('videos');
        return;
      }
    }

    // Schedule validation
    let finalScheduledAt: string | null = null;
    if (visibility === 'SCHEDULED') {
      if (!scheduledDate) {
        setErrorMessage(
          isAr
            ? 'يرجى تحديد تاريخ نزول المحاضرة المجدولة'
            : 'Scheduled date is required for scheduled lectures'
        );
        setActiveTab('visibility');
        return;
      }
      finalScheduledAt = `${scheduledDate}T${scheduledTime || '20:00'}:00.000Z`;
    }

    setIsSubmitting(true);

    try {
      // 2. Upload thumbnail if a new cropped file was provided
      let finalThumbnailUrl: string | undefined = currentServerThumbnail || undefined;

      if (pendingCropFile) {
        setUploadProgressStatus(
          isAr ? 'جاري رفع صورة الغلاف إلى Google Drive...' : 'Uploading image to Google Drive...'
        );

        const uploadRes = await staffLecturesApi.uploadThumbnail(
          pendingCropFile,
          academicYearId
        );

        if (!uploadRes || !uploadRes.url) {
          throw new Error(
            isAr ? 'فشل استلام رابط الصورة من الخادم' : 'Failed to receive thumbnail URL from server'
          );
        }

        finalThumbnailUrl = uploadRes.url;
      } else if (currentServerThumbnail === null && isEdit) {
        finalThumbnailUrl = '';
      }

      setUploadProgressStatus(
        isAr ? 'جاري حفظ بيانات المحاضرة والعلاقات...' : 'Saving lecture record & relations...'
      );

      let savedLecture: LectureItem;

      if (isEdit && initialLecture) {
        const payload: UpdateLecturePayload = {
          academic_year_id: academicYearId,
          title_ar: cleanTitleAr,
          title_en: titleEn.trim() || undefined,
          description_ar: descriptionAr.trim() || undefined,
          description_en: descriptionEn.trim() || undefined,
          sequence_order: sequenceOrder,
          sort_order: sortOrder,
          status,
          visibility,
          scheduled_at: finalScheduledAt,
          is_free: visibility === 'FREE',
          is_published: status === 'PUBLISHED',
          thumbnail_url: finalThumbnailUrl,
          course_ids: selectedCourseIds,
          package_ids: selectedPackageIds,
          main_video_url: mainVideoUrl.trim() || '',
          solution_video_url: solutionVideoUrl.trim() || '',
        };

        savedLecture = await staffLecturesApi.updateLecture(
          initialLecture.id,
          payload,
          academicYearId
        );
      } else {
        const payload: CreateLecturePayload = {
          academic_year_id: academicYearId,
          title_ar: cleanTitleAr,
          title_en: titleEn.trim() || undefined,
          description_ar: descriptionAr.trim() || undefined,
          description_en: descriptionEn.trim() || undefined,
          sequence_order: sequenceOrder,
          sort_order: sortOrder,
          status,
          visibility,
          scheduled_at: finalScheduledAt,
          is_free: visibility === 'FREE',
          is_published: status === 'PUBLISHED',
          thumbnail_url: finalThumbnailUrl,
          course_ids: selectedCourseIds,
          package_ids: selectedPackageIds,
          main_video_url: mainVideoUrl.trim() || undefined,
          solution_video_url: solutionVideoUrl.trim() || undefined,
        };

        savedLecture = await staffLecturesApi.createLecture(payload, academicYearId);

        // Upload pending attachments if any for newly created lecture
        if (pendingAttachments.length > 0 && savedLecture.id) {
          setUploadProgressStatus(
            isAr ? 'جاري رفع المرفقات والمذكرات...' : 'Uploading PDF attachments...'
          );
          for (const att of pendingAttachments) {
            try {
              await staffAttachmentsApi.uploadAttachment(
                savedLecture.id,
                {
                  file: att.file,
                  title_ar: att.title_ar,
                  title_en: att.title_en?.trim() || att.title_ar,
                  download_allowed: att.download_allowed,
                },
                academicYearId
              );
            } catch (err) {
              console.error('Failed to upload pending attachment:', err);
            }
          }
        }

        // Add chapters if any for newly created lecture
        if (chapters.length > 0 && savedLecture.id) {
          for (let i = 0; i < chapters.length; i++) {
            const ch = chapters[i];
            try {
              await staffLecturesApi.addChapter(
                savedLecture.id,
                {
                  timestamp_seconds: ch.timestamp_seconds,
                  title_ar: ch.title_ar,
                  title_en: ch.title_en || ch.title_ar || '',
                  sequence_order: i + 1,
                },
                academicYearId
              );
            } catch (err) {
              console.error('Failed to save chapter:', err);
            }
          }
        }
      }

      onSuccess(savedLecture);
      onClose();
    } catch (err: any) {
      setErrorMessage(
        err?.message || (isAr ? 'حدث خطأ أثناء حفظ المحاضرة' : 'An error occurred while saving lecture')
      );
    } finally {
      setIsSubmitting(false);
      setUploadProgressStatus(null);
    }
  };

  // Preview Data calculation
  const previewData = useMemo(() => {
    const activeYearObj = availableYears.find((y) => y.id === academicYearId);
    const selectedCourseNames = availableCourses
      .filter((c) => selectedCourseIds.includes(c.id))
      .map((c) => (isAr ? c.title_ar : c.title_en || c.title_ar));
    const selectedPackageNames = availablePackages
      .filter((p) => selectedPackageIds.includes(p.id))
      .map((p) => (isAr ? p.title_ar : p.title_en || p.title_ar));

    let previewScheduledAt: string | null = null;
    if (visibility === 'SCHEDULED' && scheduledDate) {
      previewScheduledAt = `${scheduledDate}T${scheduledTime || '20:00'}:00.000Z`;
    }

    return {
      titleAr: titleAr || (isAr ? 'عنوان المحاضرة' : 'Lecture Title'),
      titleEn,
      descriptionAr,
      descriptionEn,
      academicYearName: activeYearObj ? (isAr ? activeYearObj.name_ar : activeYearObj.name_en) : undefined,
      thumbnailUrl: localPreviewUrl,
      visibility,
      scheduledAt: previewScheduledAt,
      selectedCourseNames,
      selectedPackageNames,
      mainVideoUrl,
      solutionVideoUrl,
      chapters,
      attachments: [
        ...existingAttachments.map((a) => ({
          title_ar: a.title_ar,
          title_en: a.title_en,
          file_type: a.file_type,
          download_allowed: a.download_allowed,
        })),
        ...pendingAttachments.map((a) => ({
          title_ar: a.title_ar,
          title_en: a.title_en,
          file_type: 'PDF',
          download_allowed: a.download_allowed,
        })),
      ],
    };
  }, [
    titleAr,
    titleEn,
    descriptionAr,
    descriptionEn,
    academicYearId,
    availableYears,
    availableCourses,
    availablePackages,
    selectedCourseIds,
    selectedPackageIds,
    localPreviewUrl,
    visibility,
    scheduledDate,
    scheduledTime,
    mainVideoUrl,
    solutionVideoUrl,
    chapters,
    existingAttachments,
    pendingAttachments,
    isAr,
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[#0b0f0c] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/80 bg-[#101612]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60 shadow-xs">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {isEdit
                  ? isAr
                    ? 'تعديل المحاضرة'
                    : 'Edit Lecture'
                  : isAr
                  ? 'إضافة محاضرة جديدة'
                  : 'Create New Lecture'}
              </h2>
              <p className="text-xs text-neutral-400">
                {isAr
                  ? 'إدارة محتوى المحاضرة، الكورسات، الباقات، الفيديوهات والمرفقات'
                  : 'Manage lecture metadata, assigned courses, packages, videos and attachments'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 py-2.5 bg-[#0e1310] border-b border-neutral-800 overflow-x-auto select-none">
          {[
            { key: 'basic', label: isAr ? 'البيانات الأساسية' : 'Basic Info', icon: FileText },
            {
              key: 'access',
              label: isAr ? 'الكورسات والباقات' : 'Courses & Packages',
              icon: BookOpen,
              count: selectedCourseIds.length + selectedPackageIds.length,
            },
            { key: 'videos', label: isAr ? 'الفيديوهات' : 'Videos', icon: Video },
            { key: 'visibility', label: isAr ? 'النشر والجدولة' : 'Visibility & Schedule', icon: Globe },
            { key: 'chapters', label: isAr ? 'الفهرس' : 'Chapters', icon: ListOrdered, count: chapters.length },
            {
              key: 'attachments',
              label: isAr ? 'المذكرات والمرفقات' : 'PDF Attachments',
              icon: FileText,
              count: existingAttachments.length + pendingAttachments.length,
            },
            { key: 'preview', label: isAr ? 'المعاينة الحية' : 'Live Preview', icon: Eye },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as TabKey)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-neutral-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="text-[10px] bg-emerald-900/80 text-emerald-200 px-1.5 py-0.2 rounded-full font-mono">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Body / Tab Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* Academic Year Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  {isAr ? 'السنة الدراسية *' : 'Academic Year *'}
                </label>
                <select
                  value={academicYearId}
                  onChange={(e) => setAcademicYearId(e.target.value)}
                  disabled={isSubmitting || (isEdit && Boolean(initialLecture?.academic_year_id))}
                  className="w-full bg-[#121814] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="">{isAr ? '-- اختر المرحلة الدراسية --' : '-- Select Academic Year --'}</option>
                  {availableYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {isAr ? year.name_ar : year.name_en} ({year.code})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-neutral-500">
                  {isAr
                    ? 'يتم عزل الكورسات والباقات والمحاضرات وفقاً للسنة الدراسية لحماية خصوصية الطلاب.'
                    : 'Courses, packages and lectures are strictly isolated by academic year.'}
                </p>
              </div>

              {/* Titles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300">
                    {isAr ? 'اسم المحاضرة بالعربي *' : 'Lecture Title (Arabic) *'}
                  </label>
                  <input
                    type="text"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder={isAr ? 'الوحدة الأولى: قواعد الأزمنة' : 'Arabic Lecture Title'}
                    disabled={isSubmitting}
                    className="w-full bg-[#121814] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300">
                    {isAr ? 'اسم المحاضرة بالإنجليزي' : 'Lecture Title (English)'}
                  </label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="Unit 1: Tenses & Grammar"
                    disabled={isSubmitting}
                    dir="ltr"
                    className="w-full bg-[#121814] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 font-sans focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Descriptions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300">
                    {isAr ? 'الوصف بالعربي' : 'Description (Arabic)'}
                  </label>
                  <textarea
                    rows={3}
                    value={descriptionAr}
                    onChange={(e) => setDescriptionAr(e.target.value)}
                    placeholder={isAr ? 'شرح تفصيلي لمحتوى المحاضرة والتمارين...' : 'Lecture description in Arabic...'}
                    disabled={isSubmitting}
                    className="w-full bg-[#121814] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300">
                    {isAr ? 'الوصف بالإنجليزي' : 'Description (English)'}
                  </label>
                  <textarea
                    rows={3}
                    value={descriptionEn}
                    onChange={(e) => setDescriptionEn(e.target.value)}
                    placeholder="Detailed explanation of lecture topics and exercises..."
                    disabled={isSubmitting}
                    dir="ltr"
                    className="w-full bg-[#121814] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 font-sans focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Thumbnail / Cover Image (16:9 Crop) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  <Crop className="w-3.5 h-3.5 text-emerald-400" />
                  {isAr ? 'صورة غلاف المحاضرة (16:9)' : 'Lecture Thumbnail / Cover (16:9)'}
                </label>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#121814] p-4 rounded-xl border border-neutral-800/80">
                  <div className="relative aspect-video w-44 rounded-lg overflow-hidden bg-black/60 border border-neutral-700 flex items-center justify-center flex-shrink-0">
                    {localPreviewUrl ? (
                      <img
                        src={localPreviewUrl}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Video className="w-8 h-8 text-neutral-600" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCropperOpen(true)}
                        disabled={isSubmitting}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{localPreviewUrl ? (isAr ? 'استبدال وقص' : 'Replace & Crop') : (isAr ? 'رفع وقص صورة' : 'Upload & Crop')}</span>
                      </button>

                      {localPreviewUrl && (
                        <button
                          type="button"
                          onClick={handleRemoveThumbnail}
                          disabled={isSubmitting}
                          className="flex items-center gap-1 text-xs text-neutral-400 hover:text-red-400 py-1.5 px-2.5 rounded-lg border border-neutral-700 hover:border-red-900/60 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isAr ? 'إزالة' : 'Remove'}</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      {isAr
                        ? 'يتم تخزين الصور عبر Google Drive Proxy بنسبة 16:9 ولا يتم كشف روابط التخزين المباشرة.'
                        : 'Uploaded via secure Google Drive backend proxy in 16:9 ratio.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ordering */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300">
                    {isAr ? 'ترتيب المحاضرة (Sort Order)' : 'Sort Order'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                    disabled={isSubmitting}
                    className="w-full bg-[#121814] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300">
                    {isAr ? 'الترتيب التسلسلي (Sequence Order)' : 'Sequence Order'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={sequenceOrder}
                    onChange={(e) => setSequenceOrder(parseInt(e.target.value, 10) || 1)}
                    disabled={isSubmitting}
                    className="w-full bg-[#121814] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COURSE & PACKAGE ACCESS (Sections 7, 8, 9) */}
          {activeTab === 'access' && (
            <div className="space-y-6">
              {/* Academic Year Filter Bar inside Tab 2 */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#121814] rounded-2xl border border-neutral-800">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-neutral-300">
                    {isAr ? 'المرحلة الدراسية:' : 'Academic Stage:'}
                  </span>
                  <select
                    value={academicYearId}
                    onChange={(e) => setAcademicYearId(e.target.value)}
                    disabled={isSubmitting || (isEdit && Boolean(initialLecture?.academic_year_id))}
                    className="bg-[#0b0f0c] border border-neutral-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">{isAr ? '-- جميع المراحل الدراسية --' : '-- All Academic Stages --'}</option>
                    {availableYears.map((year) => (
                      <option key={year.id} value={year.id}>
                        {isAr ? year.name_ar : year.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => fetchRelations(academicYearId)}
                  disabled={isLoadingRelations}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isLoadingRelations ? 'animate-spin' : ''}`} />
                  <span>{isAr ? 'تحديث الكورسات والباقات' : 'Refresh'}</span>
                </button>
              </div>

              {/* Courses Multi-Select Section */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold text-white">
                      {isAr ? 'المحاضرة تظهر في الكورسات التالية:' : 'Lecture belongs to following courses:'}
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.2 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                      {selectedCourseIds.length} {isAr ? 'محدد' : 'selected'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllCourses}
                      disabled={isSubmitting || filteredCourses.length === 0}
                      className="text-[11px] text-emerald-400 hover:underline"
                    >
                      {isAr ? 'تحديد الكل' : 'Select All'}
                    </button>
                    <span className="text-neutral-600">•</span>
                    <button
                      type="button"
                      onClick={clearAllCourses}
                      disabled={isSubmitting || selectedCourseIds.length === 0}
                      className="text-[11px] text-neutral-400 hover:text-red-400"
                    >
                      {isAr ? 'إلغاء التحديد' : 'Clear'}
                    </button>
                  </div>
                </div>

                {/* Course Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder={isAr ? 'بحث في الكورسات...' : 'Search courses...'}
                    className="w-full bg-[#121814] border border-neutral-700/80 rounded-xl px-8 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Courses List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {isLoadingRelations ? (
                    <div className="col-span-2 text-center py-6 text-xs text-neutral-500 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>{isAr ? 'جاري تحميل الكورسات...' : 'Loading courses...'}</span>
                    </div>
                  ) : filteredCourses.length > 0 ? (
                    filteredCourses.map((c) => {
                      const isChecked = selectedCourseIds.includes(c.id);
                      const yearObj = availableYears.find((y) => y.id === c.academic_year_id);
                      const yearName = c.academic_year_name_ar || yearObj?.name_ar;

                      return (
                        <label
                          key={c.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-emerald-950/40 border-emerald-600/80 text-white'
                              : 'bg-[#101612] border-neutral-800 text-neutral-300 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCourse(c)}
                              className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-0 focus:ring-offset-0 shrink-0"
                            />
                            <div className="truncate">
                              <span className="font-semibold truncate block">{c.title_ar}</span>
                              {yearName && (
                                <span className="text-[10px] text-neutral-400 block truncate">{yearName}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {c.is_published ? (
                              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded font-mono">
                                {isAr ? 'منشور' : 'Pub'}
                              </span>
                            ) : (
                              <span className="text-[10px] text-neutral-500 bg-neutral-900 px-1.5 py-0.2 rounded font-mono">
                                {isAr ? 'مسودة' : 'Draft'}
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })
                  ) : (
                    <div className="col-span-2 text-center py-5 px-3 text-xs text-neutral-400 bg-[#101612] rounded-xl border border-neutral-800 space-y-2">
                      <p>{isAr ? 'لا توجد كورسات مضافة في هذه المرحلة الدراسية' : 'No courses found in this stage'}</p>
                      <button
                        type="button"
                        onClick={() => setAcademicYearId('')}
                        className="text-emerald-400 hover:underline text-[11px] font-bold block mx-auto"
                      >
                        {isAr ? 'عرض كافة الكورسات من جميع المراحل' : 'Show courses from all stages'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Packages Multi-Select Section */}
              <div className="space-y-3 pt-4 border-t border-neutral-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <PackageIcon className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-white">
                      {isAr ? 'المحاضرة تظهر في الباقات التالية:' : 'Lecture belongs to following packages:'}
                    </h3>
                    <span className="text-xs font-mono px-2 py-0.2 rounded-full bg-amber-950 text-amber-300 border border-amber-800/60">
                      {selectedPackageIds.length} {isAr ? 'محدد' : 'selected'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={selectAllPackages}
                      disabled={isSubmitting || filteredPackages.length === 0}
                      className="text-[11px] text-amber-400 hover:underline"
                    >
                      {isAr ? 'تحديد الكل' : 'Select All'}
                    </button>
                    <span className="text-neutral-600">•</span>
                    <button
                      type="button"
                      onClick={clearAllPackages}
                      disabled={isSubmitting || selectedPackageIds.length === 0}
                      className="text-[11px] text-neutral-400 hover:text-red-400"
                    >
                      {isAr ? 'إلغاء التحديد' : 'Clear'}
                    </button>
                  </div>
                </div>

                {/* Package Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    value={packageSearch}
                    onChange={(e) => setPackageSearch(e.target.value)}
                    placeholder={isAr ? 'بحث في الباقات...' : 'Search packages...'}
                    className="w-full bg-[#121814] border border-neutral-700/80 rounded-xl px-8 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Packages List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {isLoadingRelations ? (
                    <div className="col-span-2 text-center py-6 text-xs text-neutral-500 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>{isAr ? 'جاري تحميل الباقات...' : 'Loading packages...'}</span>
                    </div>
                  ) : filteredPackages.length > 0 ? (
                    filteredPackages.map((p) => {
                      const isChecked = selectedPackageIds.includes(p.id);
                      const yearObj = availableYears.find((y) => y.id === p.academic_year_id);
                      const yearName = p.academic_year_name_ar || yearObj?.name_ar;

                      return (
                        <label
                          key={p.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-amber-950/40 border-amber-600/80 text-white'
                              : 'bg-[#101612] border-neutral-800 text-neutral-300 hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePackage(p)}
                              className="w-4 h-4 rounded border-neutral-700 bg-neutral-900 text-amber-500 focus:ring-0 focus:ring-offset-0 shrink-0"
                            />
                            <div className="truncate">
                              <span className="font-semibold truncate block">{p.title_ar}</span>
                              {yearName && (
                                <span className="text-[10px] text-neutral-400 block truncate">{yearName}</span>
                              )}
                            </div>
                          </div>
                          <span className="text-[10px] text-amber-400 font-mono shrink-0">
                            {p.price} EGP
                          </span>
                        </label>
                      );
                    })
                  ) : (
                    <div className="col-span-2 text-center py-5 px-3 text-xs text-neutral-400 bg-[#101612] rounded-xl border border-neutral-800 space-y-2">
                      <p>{isAr ? 'لا توجد باقات مضافة في هذه المرحلة الدراسية' : 'No packages found in this stage'}</p>
                      <button
                        type="button"
                        onClick={() => setAcademicYearId('')}
                        className="text-amber-400 hover:underline text-[11px] font-bold block mx-auto"
                      >
                        {isAr ? 'عرض كافة الباقات من جميع المراحل' : 'Show packages from all stages'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VIDEOS (Sections 10, 11, 12) */}
          {activeTab === 'videos' && (
            <div className="space-y-6">
              {/* Main Video Section */}
              <div className="space-y-3 bg-[#121814] p-4 rounded-xl border border-neutral-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? 'رابط فيديو المحاضرة الأساسي (Main Video)' : 'Main Lecture Video (YouTube)'}</span>
                  </label>
                  {mainVideoUrl && extractYouTubeVideoId(mainVideoUrl) && (
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800/60 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      ID: {extractYouTubeVideoId(mainVideoUrl)}
                    </span>
                  )}
                </div>

                <input
                  type="text"
                  value={mainVideoUrl}
                  onChange={(e) => validateMainVideo(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... أو معرف الفيديو 11 حرف"
                  disabled={isSubmitting}
                  dir="ltr"
                  className={`w-full bg-[#0c100d] border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 font-sans focus:outline-none transition-colors ${
                    mainVideoError ? 'border-red-600 focus:border-red-500' : 'border-neutral-700/80 focus:border-emerald-500'
                  }`}
                />

                {mainVideoError && (
                  <p className="text-xs text-red-400 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {mainVideoError}
                  </p>
                )}

                {/* 16:9 YouTube Preview (Section 11) */}
                {mainVideoUrl && extractYouTubeVideoId(mainVideoUrl) && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-semibold text-neutral-400">
                      {isAr ? 'معاينة مشغل الفيديو (16:9 YouTube No-Cookie Player)' : '16:9 Player Preview'}
                    </span>
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-neutral-700 shadow-lg">
                      <iframe
                        src={buildYouTubeEmbedUrl(extractYouTubeVideoId(mainVideoUrl)!)}
                        title="Main Video Preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Solution Video Section */}
              <div className="space-y-3 bg-[#121814] p-4 rounded-xl border border-neutral-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-amber-400" />
                    <span>{isAr ? 'رابط فيديو الحل النموذجي (Solution Video - اختياري)' : 'Solution Video (Optional)'}</span>
                  </label>
                  {solutionVideoUrl && extractYouTubeVideoId(solutionVideoUrl) && (
                    <span className="text-[11px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded-md border border-amber-800/60 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      ID: {extractYouTubeVideoId(solutionVideoUrl)}
                    </span>
                  )}
                </div>

                <input
                  type="text"
                  value={solutionVideoUrl}
                  onChange={(e) => validateSolutionVideo(e.target.value)}
                  placeholder="https://youtu.be/... أو معرف الفيديو"
                  disabled={isSubmitting}
                  dir="ltr"
                  className={`w-full bg-[#0c100d] border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 font-sans focus:outline-none transition-colors ${
                    solutionVideoError ? 'border-red-600 focus:border-red-500' : 'border-neutral-700/80 focus:border-amber-500'
                  }`}
                />

                {solutionVideoError && (
                  <p className="text-xs text-red-400 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {solutionVideoError}
                  </p>
                )}

                {/* Solution Video Preview */}
                {solutionVideoUrl && extractYouTubeVideoId(solutionVideoUrl) && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-semibold text-neutral-400">
                      {isAr ? 'معاينة فيديو الحل (16:9 Player)' : 'Solution Player Preview'}
                    </span>
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-neutral-700 shadow-lg">
                      <iframe
                        src={buildYouTubeEmbedUrl(extractYouTubeVideoId(solutionVideoUrl)!)}
                        title="Solution Video Preview"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: VISIBILITY & SCHEDULE (Sections 13, 14, 15) */}
          {activeTab === 'visibility' && (
            <div className="space-y-6">
              {/* Visibility Options */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300">
                  {isAr ? 'حالة الظهور وإتاحة المحاضرة *' : 'Visibility & Access Tier *'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'SUBSCRIBER_ONLY',
                      title: isAr ? 'للمشتركين (Subscriber Only)' : 'Subscribers Only',
                      desc: isAr ? 'تتطلب اشتراكاً نشطاً في أحد الكورسات أو الباقات المرتبطة.' : 'Requires active subscription in linked courses or packages.',
                      icon: Lock,
                      color: 'border-blue-700/80 bg-blue-950/30 text-blue-300',
                    },
                    {
                      id: 'FREE',
                      title: isAr ? 'مفتوحة للجميع (Free Preview)' : 'Free Access',
                      desc: isAr ? 'متاحة مجاناً لجميع طلاب السنة الدراسية كمعاينة تجريبية.' : 'Free for all students in this grade level.',
                      icon: Globe,
                      color: 'border-emerald-700/80 bg-emerald-950/30 text-emerald-300',
                    },
                    {
                      id: 'SCHEDULED',
                      title: isAr ? 'مجدولة النشر (Scheduled Release)' : 'Scheduled Release',
                      desc: isAr ? 'تظل مغلقة ومحمية حتى يحين تاريخ ووقت النزول المحدد.' : 'Locked and protected until the scheduled date/time arrives.',
                      icon: Calendar,
                      color: 'border-amber-700/80 bg-amber-950/30 text-amber-300',
                    },
                    {
                      id: 'DRAFT',
                      title: isAr ? 'مسودة (Draft)' : 'Draft',
                      desc: isAr ? 'مخفية تماماً عن الطلاب وتظهر فقط للإدارة والمعلمين.' : 'Hidden from students; staff only.',
                      icon: Clock,
                      color: 'border-neutral-700 bg-neutral-900/60 text-neutral-300',
                    },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = visibility === opt.id;
                    return (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? `${opt.color} shadow-sm`
                            : 'bg-[#121814] border-neutral-800 hover:border-neutral-700 text-neutral-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="visibility"
                          value={opt.id}
                          checked={isSelected}
                          onChange={() => setVisibility(opt.id)}
                          className="mt-0.5 text-emerald-500 focus:ring-0"
                        />
                        <div className="space-y-0.5">
                          <span className="font-bold text-xs flex items-center gap-1.5 text-white">
                            <Icon className="w-3.5 h-3.5" />
                            {opt.title}
                          </span>
                          <p className="text-[11px] leading-relaxed text-neutral-400">{opt.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Schedule Date & Time Pickers (Section 14) */}
              {visibility === 'SCHEDULED' && (
                <div className="bg-[#121814] p-4 rounded-xl border border-amber-900/60 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <Clock className="w-4 h-4" />
                    <span>{isAr ? 'توقيت نزول المحاضرة (Scheduled Date & Time)' : 'Scheduled Date & Time'}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-neutral-400">
                        {isAr ? 'تاريخ النزول *' : 'Release Date *'}
                      </label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full bg-[#0c100d] border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-neutral-400">
                        {isAr ? 'وقت النزول *' : 'Release Time *'}
                      </label>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        disabled={isSubmitting}
                        className="w-full bg-[#0c100d] border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-500">
                    {isAr
                      ? 'يتم التحكم في الإتاحة بالكامل من الخادم (Server-Side Authorization). قبل حلول الوقت المحدد يُرفض تشغيل الفيديو أو تحميل الملفات للمشتركين بـ 403 LECTURE_LOCKED_SCHEDULED.'
                      : 'Server-side enforced scheduled lock. Returns 403 LECTURE_LOCKED_SCHEDULED prior to release.'}
                  </p>
                </div>
              )}

              {/* Status Select */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-neutral-300">
                  {isAr ? 'حالة النشر العامة (Status)' : 'Publication Status'}
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-[#121814] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="PUBLISHED">{isAr ? 'منشورة (PUBLISHED)' : 'Published'}</option>
                  <option value="DRAFT">{isAr ? 'مسودة (DRAFT)' : 'Draft'}</option>
                  <option value="ARCHIVED">{isAr ? 'مؤرشفة (ARCHIVED)' : 'Archived'}</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 5: CHAPTERS (Section 17) */}
          {activeTab === 'chapters' && (
            <LectureChaptersManager
              chapters={chapters}
              onChange={setChapters}
              disabled={isSubmitting}
            />
          )}

          {/* TAB 6: ATTACHMENTS & PDF (Sections 18, 19) */}
          {activeTab === 'attachments' && (
            <LectureAttachmentsManager
              existingAttachments={existingAttachments}
              pendingAttachments={pendingAttachments}
              onPendingChange={setPendingAttachments}
              onExistingDeleted={() => {
                if (initialLecture) {
                  staffLecturesApi.getLectureById(initialLecture.id, academicYearId).then((lec) => {
                    setExistingAttachments(lec.attachments || []);
                  });
                }
              }}
              lectureId={initialLecture?.id}
              academicYearId={academicYearId}
              disabled={isSubmitting}
            />
          )}

          {/* TAB 7: LIVE PREVIEW (Section 20) */}
          {activeTab === 'preview' && (
            <LectureCardPreview data={previewData} mode="full" />
          )}

          {/* Modal Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-800 bg-[#0b0f0c]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-emerald-950/40"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{uploadProgressStatus || (isAr ? 'جاري الحفظ...' : 'Saving...')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isEdit ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'حفظ وإنشاء المحاضرة' : 'Create Lecture')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Image Cropper Modal */}
      {isCropperOpen && (
        <ImageCropperModal
          isOpen={isCropperOpen}
          onClose={() => setIsCropperOpen(false)}
          onCropComplete={(croppedFile, previewUrl) => {
            handleCropComplete(croppedFile, previewUrl);
            setIsCropperOpen(false);
          }}
          aspectRatio={16 / 9}
        />
      )}
    </div>
  );
}
