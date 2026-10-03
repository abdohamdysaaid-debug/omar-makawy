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
  ExternalLink,
  Plus,
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

  // Form Fields State (Arabic-first UX)
  const [academicYearId, setAcademicYearId] = useState<string>('');
  const [titleAr, setTitleAr] = useState<string>('');
  const [descriptionAr, setDescriptionAr] = useState<string>('');
  const [sequenceOrder, setSequenceOrder] = useState<number>(1);
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [status, setStatus] = useState<string>('PUBLISHED');
  const [visibility, setVisibility] = useState<string>('SUBSCRIBER_ONLY');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('20:00');
  const [isFree, setIsFree] = useState<boolean>(false);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);

  // Thumbnail State (16:9 Cover)
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

  // Attachments State
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachmentDraft[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);

  // Submission & Preview State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadProgressStatus, setUploadProgressStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);

  // Initialize or reset form data
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setUploadProgressStatus(null);
      setPendingCropFile(null);
      setMainVideoError(null);
      setSolutionVideoError(null);
      setIsPreviewModalOpen(false);

      if (initialLecture) {
        setAcademicYearId(initialLecture.academic_year_id);
        setTitleAr(initialLecture.title_ar || '');
        setDescriptionAr(initialLecture.description_ar || '');
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
        setDescriptionAr('');
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
        setPendingAttachments([]);
        setExistingAttachments([]);
      }
    }
  }, [isOpen, initialLecture, activeAcademicYearId, availableYears]);

  // Load available courses & packages dynamically for chosen academic year
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

      // If specific year had 0 items, fallback to all
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

  // Toggle Course Selection
  const toggleCourse = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  // Toggle Package Selection
  const togglePackage = (pkgId: string) => {
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

  // Video Validation
  const handleMainVideoChange = (val: string) => {
    setMainVideoUrl(val);
    if (!val.trim()) {
      setMainVideoError(null);
      return;
    }
    const extractedId = extractYouTubeVideoId(val);
    if (!extractedId) {
      setMainVideoError(isAr ? 'رابط YouTube غير صالح' : 'Invalid YouTube URL or ID');
    } else {
      setMainVideoError(null);
    }
  };

  const handleSolutionVideoChange = (val: string) => {
    setSolutionVideoUrl(val);
    if (!val.trim()) {
      setSolutionVideoError(null);
      return;
    }
    const extractedId = extractYouTubeVideoId(val);
    if (!extractedId) {
      setSolutionVideoError(isAr ? 'رابط YouTube غير صالح' : 'Invalid YouTube URL or ID');
    } else {
      setSolutionVideoError(null);
    }
  };

  const mainExtractedId = useMemo(() => {
    return mainVideoUrl.trim() ? extractYouTubeVideoId(mainVideoUrl) : null;
  }, [mainVideoUrl]);

  const solutionExtractedId = useMemo(() => {
    return solutionVideoUrl.trim() ? extractYouTubeVideoId(solutionVideoUrl) : null;
  }, [solutionVideoUrl]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validation
    const cleanTitleAr = titleAr.trim();
    if (!cleanTitleAr) {
      setErrorMessage(isAr ? 'يرجى إدخال اسم المحاضرة بالعربية' : 'Arabic title is required');
      return;
    }

    if (!academicYearId) {
      setErrorMessage(isAr ? 'يرجى اختيار السنة الدراسية' : 'Academic year is required');
      return;
    }

    if (mainVideoUrl.trim()) {
      const extractedMain = extractYouTubeVideoId(mainVideoUrl);
      if (!extractedMain) {
        setErrorMessage(isAr ? 'رابط فيديو المحاضرة الأساسي غير صالح' : 'Invalid main YouTube URL');
        return;
      }
    }

    if (solutionVideoUrl.trim()) {
      const extractedSol = extractYouTubeVideoId(solutionVideoUrl);
      if (!extractedSol) {
        setErrorMessage(isAr ? 'رابط فيديو الحل غير صالح' : 'Invalid solution YouTube URL');
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
          isAr ? 'جاري رفع صورة الغلاف إلى التخزين السحابي...' : 'Uploading image to Cloud Storage...'
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
          description_ar: descriptionAr.trim() || undefined,
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
          description_ar: descriptionAr.trim() || undefined,
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

  // Preview Data calculation for Student Live Modal
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
      descriptionAr,
      academicYearName: activeYearObj ? (isAr ? activeYearObj.name_ar : activeYearObj.name_en) : undefined,
      thumbnailUrl: localPreviewUrl,
      visibility,
      scheduledAt: previewScheduledAt,
      selectedCourseNames,
      selectedPackageNames,
      mainVideoUrl,
      solutionVideoUrl,
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
    descriptionAr,
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
    existingAttachments,
    pendingAttachments,
    isAr,
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[94vh] flex flex-col bg-[#0b0f0c] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800/80 bg-[#101612] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60 shadow-xs">
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
                  ? 'نموذج موحد متكامل لإدارة بيانات المحاضرة، الكورسات، الباقات، الفيديوهات والمرفقات'
                  : 'One continuous form for lecture metadata, courses, packages, videos and attachments'}
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

        {/* Modal Body: Continuous Vertical Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-950/70 border border-red-800/80 text-red-200 text-xs font-semibold shadow-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* SECTION 01 — بيانات المحاضرة */}
          {/* ============================================================ */}
          <div className="bg-[#101612] border border-neutral-800/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-800/70">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 font-mono font-bold text-xs border border-emerald-800/60">
                01
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isAr ? 'بيانات المحاضرة' : 'Lecture Basic Info'}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  {isAr ? 'البيانات الأساسية وتحديد السنة الدراسية' : 'Title, description and academic year'}
                </p>
              </div>
            </div>

            {/* Academic Year Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                {isAr ? 'السنة الدراسية *' : 'Academic Year *'}
              </label>
              <select
                value={academicYearId}
                onChange={(e) => setAcademicYearId(e.target.value)}
                disabled={isSubmitting || (isEdit && Boolean(initialLecture?.academic_year_id))}
                className="w-full bg-[#141b16] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="">{isAr ? '-- اختر المرحلة الدراسية --' : '-- Select Academic Year --'}</option>
                {availableYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {isAr ? year.name_ar : year.name_en} ({year.code})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-neutral-400">
                {isAr
                  ? 'يتحكم اختيار السنة الدراسية في قائمة الكورسات والباقات المتاحة أدناه.'
                  : 'Controls which courses and packages are available for selection.'}
              </p>
            </div>

            {/* Title (Arabic Only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-200">
                {isAr ? 'اسم المحاضرة *' : 'Lecture Title (Arabic) *'}
              </label>
              <input
                type="text"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder={isAr ? 'مثال: المحاضرة الأولى — مقدمة في الكيمياء العضوية' : 'Arabic Lecture Title'}
                disabled={isSubmitting}
                className="w-full bg-[#141b16] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors font-medium"
              />
            </div>

            {/* Description (Arabic Only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-200">
                {isAr ? 'الوصف' : 'Description (Arabic)'}
              </label>
              <textarea
                rows={3}
                value={descriptionAr}
                onChange={(e) => setDescriptionAr(e.target.value)}
                placeholder={isAr ? 'اكتب ملخصاً لمحتوى المحاضرة والنقاط الأساسية والتمارين...' : 'Lecture description in Arabic...'}
                disabled={isSubmitting}
                className="w-full bg-[#141b16] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              />
            </div>

            {/* Optional Thumbnail (16:9) */}
            <div className="space-y-2 pt-2 border-t border-neutral-800/60">
              <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <Crop className="w-3.5 h-3.5 text-emerald-400" />
                {isAr ? 'صورة غلاف المحاضرة — اختياري (16:9)' : 'Lecture Thumbnail (16:9 - Optional)'}
              </label>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#141b16] p-3.5 rounded-xl border border-neutral-800">
                <div className="relative aspect-video w-40 rounded-lg overflow-hidden bg-black/60 border border-neutral-700 flex items-center justify-center flex-shrink-0">
                  {localPreviewUrl ? (
                    <img
                      src={localPreviewUrl}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Video className="w-7 h-7 text-neutral-600" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCropperOpen(true)}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80 text-xs font-bold transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>
                        {localPreviewUrl
                          ? isAr
                            ? 'تغيير صورة الغلاف'
                            : 'Change Cover'
                          : isAr
                          ? 'رفع وقص صورة غلاف'
                          : 'Upload & Crop Cover'}
                      </span>
                    </button>

                    {localPreviewUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveThumbnail}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-red-950/80 hover:text-red-300 text-neutral-400 text-xs transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{isAr ? 'إزالة' : 'Remove'}</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    {isAr
                      ? 'في حال عدم رفع صورة مخصصة، سيتم استخدام صورة فيديو YouTube تلقائياً.'
                      : 'If omitted, the YouTube video thumbnail will be automatically displayed.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 02 — الكورسات والباقات */}
          {/* ============================================================ */}
          <div className="bg-[#101612] border border-neutral-800/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800/70">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 font-mono font-bold text-xs border border-emerald-800/60">
                  02
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {isAr ? 'الكورسات والباقات' : 'Courses & Packages'}
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    {isAr
                      ? 'حدد الكورسات والباقات التي تتبع لها هذه المحاضرة (متعدد الاختيارات)'
                      : 'Multi-select courses and packages for this lecture'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono">
                  {selectedCourseIds.length} {isAr ? 'كورس' : 'courses'} | {selectedPackageIds.length} {isAr ? 'باقة' : 'packages'}
                </span>
              </div>
            </div>

            {/* Courses and Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Courses Column */}
              <div className="space-y-3 bg-[#141b16] p-4 rounded-xl border border-neutral-800/90 flex flex-col">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    {isAr ? 'الكورسات' : 'Courses'}
                  </label>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={selectAllCourses}
                      disabled={availableCourses.length === 0}
                      className="text-emerald-400 hover:text-emerald-300 underline font-medium"
                    >
                      {isAr ? 'تحديد الكل' : 'Select All'}
                    </button>
                    <span className="text-neutral-600">|</span>
                    <button
                      type="button"
                      onClick={clearAllCourses}
                      disabled={selectedCourseIds.length === 0}
                      className="text-neutral-400 hover:text-white underline font-medium"
                    >
                      {isAr ? 'إلغاء' : 'Clear'}
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute start-3 top-2.5" />
                  <input
                    type="text"
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    placeholder={isAr ? 'بحث في الكورسات...' : 'Search courses...'}
                    className="w-full bg-[#0c100d] border border-neutral-700/80 rounded-lg ps-8 pe-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Selected Courses Chips */}
                {selectedCourseIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {availableCourses
                      .filter((c) => selectedCourseIds.includes(c.id))
                      .map((c) => (
                        <span
                          key={c.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/90 text-emerald-300 border border-emerald-700 text-[11px] font-bold animate-in fade-in"
                        >
                          <span className="truncate max-w-[140px]">{isAr ? c.title_ar : c.title_en || c.title_ar}</span>
                          <button
                            type="button"
                            onClick={() => toggleCourse(c.id)}
                            className="text-emerald-400 hover:text-white p-0.5 rounded-full hover:bg-emerald-900/50"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                  </div>
                )}

                {/* Courses Selection List */}
                <div className="max-h-48 overflow-y-auto space-y-1.5 pe-1 pt-1 flex-1">
                  {isLoadingRelations ? (
                    <div className="py-6 flex items-center justify-center text-xs text-neutral-400 gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>{isAr ? 'جاري تحميل الكورسات...' : 'Loading courses...'}</span>
                    </div>
                  ) : filteredCourses.length === 0 ? (
                    <div className="py-6 text-center text-xs text-neutral-500">
                      {isAr ? 'لا توجد كورسات متاحة لهذه المرحلة' : 'No courses found for this year'}
                    </div>
                  ) : (
                    filteredCourses.map((c) => {
                      const isSelected = selectedCourseIds.includes(c.id);
                      return (
                        <label
                          key={c.id}
                          className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-emerald-950/50 border-emerald-700/80 text-white'
                              : 'bg-[#0e1310] border-neutral-800 text-neutral-300 hover:bg-neutral-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleCourse(c.id)}
                              className="w-3.5 h-3.5 rounded border-neutral-700 bg-neutral-900 text-emerald-500 focus:ring-0"
                            />
                            <span className="truncate font-medium">
                              {isAr ? c.title_ar : c.title_en || c.title_ar}
                            </span>
                          </div>
                          {c.price !== undefined && (
                            <span className="text-[10px] text-neutral-400 font-mono flex-shrink-0 ms-2">
                              {c.price > 0 ? `${c.price} ج.م` : isAr ? 'مجاني' : 'Free'}
                            </span>
                          )}
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Packages Column */}
              <div className="space-y-3 bg-[#141b16] p-4 rounded-xl border border-neutral-800/90 flex flex-col">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-200 flex items-center gap-1.5">
                    <PackageIcon className="w-4 h-4 text-purple-400" />
                    {isAr ? 'الباقات' : 'Packages'}
                  </label>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={selectAllPackages}
                      disabled={availablePackages.length === 0}
                      className="text-purple-400 hover:text-purple-300 underline font-medium"
                    >
                      {isAr ? 'تحديد الكل' : 'Select All'}
                    </button>
                    <span className="text-neutral-600">|</span>
                    <button
                      type="button"
                      onClick={clearAllPackages}
                      disabled={selectedPackageIds.length === 0}
                      className="text-neutral-400 hover:text-white underline font-medium"
                    >
                      {isAr ? 'إلغاء' : 'Clear'}
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute start-3 top-2.5" />
                  <input
                    type="text"
                    value={packageSearch}
                    onChange={(e) => setPackageSearch(e.target.value)}
                    placeholder={isAr ? 'بحث في الباقات...' : 'Search packages...'}
                    className="w-full bg-[#0c100d] border border-neutral-700/80 rounded-lg ps-8 pe-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Selected Packages Chips */}
                {selectedPackageIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {availablePackages
                      .filter((p) => selectedPackageIds.includes(p.id))
                      .map((p) => (
                        <span
                          key={p.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950/90 text-purple-300 border border-purple-700 text-[11px] font-bold animate-in fade-in"
                        >
                          <span className="truncate max-w-[140px]">{isAr ? p.title_ar : p.title_en || p.title_ar}</span>
                          <button
                            type="button"
                            onClick={() => togglePackage(p.id)}
                            className="text-purple-400 hover:text-white p-0.5 rounded-full hover:bg-purple-900/50"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                  </div>
                )}

                {/* Packages Selection List */}
                <div className="max-h-48 overflow-y-auto space-y-1.5 pe-1 pt-1 flex-1">
                  {isLoadingRelations ? (
                    <div className="py-6 flex items-center justify-center text-xs text-neutral-400 gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                      <span>{isAr ? 'جاري تحميل الباقات...' : 'Loading packages...'}</span>
                    </div>
                  ) : filteredPackages.length === 0 ? (
                    <div className="py-6 text-center text-xs text-neutral-500">
                      {isAr ? 'لا توجد باقات متاحة لهذه المرحلة' : 'No packages found for this year'}
                    </div>
                  ) : (
                    filteredPackages.map((p) => {
                      const isSelected = selectedPackageIds.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-purple-950/50 border-purple-700/80 text-white'
                              : 'bg-[#0e1310] border-neutral-800 text-neutral-300 hover:bg-neutral-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => togglePackage(p.id)}
                              className="w-3.5 h-3.5 rounded border-neutral-700 bg-neutral-900 text-purple-500 focus:ring-0"
                            />
                            <span className="truncate font-medium">
                              {isAr ? p.title_ar : p.title_en || p.title_ar}
                            </span>
                          </div>
                          {p.price !== undefined && (
                            <span className="text-[10px] text-neutral-400 font-mono flex-shrink-0 ms-2">
                              {p.price > 0 ? `${p.price} ج.م` : isAr ? 'مجاني' : 'Free'}
                            </span>
                          )}
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 03 — فيديو المحاضرة (Normal YouTube URL Only) */}
          {/* ============================================================ */}
          <div className="bg-[#101612] border border-neutral-800/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-800/70">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 font-mono font-bold text-xs border border-emerald-800/60">
                03
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isAr ? 'فيديو المحاضرة' : 'Lecture Video'}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  {isAr
                    ? 'أدخل رابط YouTube العادي فقط — يقوم النظام بالتحقق واستخراج المعرف والمعاينة تلقائياً'
                    : 'Paste normal YouTube URL — system automatically extracts ID and builds secure embed'}
                </p>
              </div>
            </div>

            {/* Main Video Input */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-emerald-400" />
                    {isAr ? 'رابط فيديو YouTube الأساسي *' : 'Main YouTube Video URL *'}
                  </span>
                  {mainExtractedId && (
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                      ID: {mainExtractedId}
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={mainVideoUrl}
                  onChange={(e) => handleMainVideoChange(e.target.value)}
                  placeholder="https://youtu.be/S_p-Q0h67os أو https://www.youtube.com/watch?v=S_p-Q0h67os"
                  dir="ltr"
                  disabled={isSubmitting}
                  className="w-full bg-[#141b16] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <p className="text-[11px] text-neutral-400">
                  {isAr
                    ? 'يقبل النظام الروابط المباشرة لـ YouTube (بما فيها الروابط المختصرة و Shorts). لا تقم بلصق كود iframe.'
                    : 'Accepts standard YouTube URLs (watch, share, shorts). Do not enter iframe HTML.'}
                </p>
              </div>

              {/* Main Video Error */}
              {mainVideoError && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/50 border border-red-800/80 text-red-300 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{mainVideoError}</span>
                </div>
              )}

              {/* Main Video Live 16:9 Embed Preview */}
              {mainExtractedId && (
                <div className="bg-[#141b16] p-3.5 rounded-xl border border-neutral-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-300 font-semibold">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isAr ? 'معاينة مشغل الفيديو الأساسي' : 'Main Video Player Preview'}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">youtube-nocookie.com</span>
                  </div>
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-neutral-800 shadow-md">
                    <iframe
                      src={buildYouTubeEmbedUrl(mainExtractedId)}
                      title="Main Video Preview"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Solution Video Input (Optional) */}
            <div className="space-y-3 pt-4 border-t border-neutral-800/60">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    {isAr ? 'رابط فيديو الحل — اختياري' : 'Solution Video URL (Optional)'}
                  </span>
                  {solutionExtractedId && (
                    <span className="text-[11px] font-mono text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/60">
                      ID: {solutionExtractedId}
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={solutionVideoUrl}
                  onChange={(e) => handleSolutionVideoChange(e.target.value)}
                  placeholder="https://youtu.be/... (فيديو حل الأسئلة والتمارين)"
                  dir="ltr"
                  disabled={isSubmitting}
                  className="w-full bg-[#141b16] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Solution Video Error */}
              {solutionVideoError && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/50 border border-red-800/80 text-red-300 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{solutionVideoError}</span>
                </div>
              )}

              {/* Solution Video Live 16:9 Embed Preview */}
              {solutionExtractedId && (
                <div className="bg-[#141b16] p-3.5 rounded-xl border border-neutral-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-neutral-300 font-semibold">
                    <span className="flex items-center gap-1.5 text-purple-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isAr ? 'معاينة فيديو الحل' : 'Solution Video Player Preview'}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">youtube-nocookie.com</span>
                  </div>
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-neutral-800 shadow-md">
                    <iframe
                      src={buildYouTubeEmbedUrl(solutionExtractedId)}
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

          {/* ============================================================ */}
          {/* SECTION 04 — النشر والجدولة */}
          {/* ============================================================ */}
          <div className="bg-[#101612] border border-neutral-800/90 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-800/70">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 font-mono font-bold text-xs border border-emerald-800/60">
                04
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isAr ? 'النشر والجدولة' : 'Publishing & Scheduling'}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  {isAr
                    ? 'حدد حالة إتاحة المحاضرة وسياسة الوصول وسعر المشاهدة'
                    : 'Set visibility status, access control, and scheduled release date'}
                </p>
              </div>
            </div>

            {/* Publication Status (3 Clear Options) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-200">
                {isAr ? 'حالة النشر *' : 'Publication Status *'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* 1. Publish Now */}
                <button
                  type="button"
                  onClick={() => {
                    setVisibility('SUBSCRIBER_ONLY');
                    setStatus('PUBLISHED');
                  }}
                  className={`p-3.5 rounded-xl border text-start transition-all flex flex-col justify-between gap-2 ${
                    visibility === 'SUBSCRIBER_ONLY' && status === 'PUBLISHED'
                      ? 'bg-emerald-950/60 border-emerald-600 text-white shadow-xs'
                      : 'bg-[#141b16] border-neutral-800 text-neutral-300 hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-400">
                      <Globe className="w-3.5 h-3.5" />
                      {isAr ? 'نشر الآن' : 'Publish Now'}
                    </span>
                    {visibility === 'SUBSCRIBER_ONLY' && status === 'PUBLISHED' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    {isAr ? 'تكون المحاضرة متاحة للطلاب فوراً' : 'Immediately visible to students'}
                  </p>
                </button>

                {/* 2. Draft */}
                <button
                  type="button"
                  onClick={() => {
                    setVisibility('DRAFT');
                    setStatus('DRAFT');
                  }}
                  className={`p-3.5 rounded-xl border text-start transition-all flex flex-col justify-between gap-2 ${
                    visibility === 'DRAFT' || status === 'DRAFT'
                      ? 'bg-neutral-800/80 border-neutral-500 text-white shadow-xs'
                      : 'bg-[#141b16] border-neutral-800 text-neutral-300 hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold flex items-center gap-1.5 text-neutral-300">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      {isAr ? 'مسودة' : 'Draft'}
                    </span>
                    {(visibility === 'DRAFT' || status === 'DRAFT') && (
                      <CheckCircle2 className="w-4 h-4 text-neutral-300" />
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    {isAr ? 'مخفية تماماً عن الطلاب للتجهيز' : 'Hidden from students'}
                  </p>
                </button>

                {/* 3. Scheduled */}
                <button
                  type="button"
                  onClick={() => {
                    setVisibility('SCHEDULED');
                    setStatus('PUBLISHED');
                  }}
                  className={`p-3.5 rounded-xl border text-start transition-all flex flex-col justify-between gap-2 ${
                    visibility === 'SCHEDULED'
                      ? 'bg-amber-950/60 border-amber-600 text-white shadow-xs'
                      : 'bg-[#141b16] border-neutral-800 text-neutral-300 hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold flex items-center gap-1.5 text-amber-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {isAr ? 'جدولة المحاضرة' : 'Schedule Release'}
                    </span>
                    {visibility === 'SCHEDULED' && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    {isAr ? 'تفتح المحاضرة تلقائياً في موعد محدد' : 'Auto-unlocks at specified date/time'}
                  </p>
                </button>
              </div>
            </div>

            {/* Scheduled Date/Time Picker */}
            {visibility === 'SCHEDULED' && (
              <div className="bg-[#141b16] p-4 rounded-xl border border-amber-800/70 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Clock className="w-4 h-4" />
                  <span>{isAr ? 'تاريخ ووقت النشر المجدول (بتوقيت القاهرة)' : 'Scheduled Release Date & Time'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-300">
                      {isAr ? 'تاريخ النزول *' : 'Release Date *'}
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full bg-[#0c100d] border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-neutral-300">
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

                <p className="text-[11px] text-neutral-400">
                  {isAr
                    ? 'يتم قفل المحاضرة وحمايتها برمجياً على الخادم (403 Locked) حتى حلول هذا التوقيت.'
                    : 'Strictly locked on server side prior to release time.'}
                </p>
              </div>
            )}

            {/* Access Tier / Price Selection */}
            <div className="space-y-2 pt-2 border-t border-neutral-800/60">
              <label className="text-xs font-bold text-neutral-200">
                {isAr ? 'نوع الوصول / السعر' : 'Access Tier / Pricing'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Subscribers Only */}
                <button
                  type="button"
                  onClick={() => {
                    setIsFree(false);
                    if (visibility === 'FREE') setVisibility('SUBSCRIBER_ONLY');
                  }}
                  className={`p-3.5 rounded-xl border text-start transition-all flex items-center justify-between ${
                    visibility !== 'FREE' && !isFree
                      ? 'bg-blue-950/60 border-blue-600 text-white'
                      : 'bg-[#141b16] border-neutral-800 text-neutral-300 hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="text-xs font-bold">{isAr ? 'للمشتركين فقط' : 'Subscribers Only'}</p>
                      <p className="text-[11px] text-neutral-400">
                        {isAr ? 'تتطلب اشتراكاً فعالاً في الكورس أو الباقة' : 'Requires active course/package subscription'}
                      </p>
                    </div>
                  </div>
                  {visibility !== 'FREE' && !isFree && (
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  )}
                </button>

                {/* Free Access */}
                <button
                  type="button"
                  onClick={() => {
                    setIsFree(true);
                    setVisibility('FREE');
                  }}
                  className={`p-3.5 rounded-xl border text-start transition-all flex items-center justify-between ${
                    visibility === 'FREE' || isFree
                      ? 'bg-emerald-950/60 border-emerald-600 text-white'
                      : 'bg-[#141b16] border-neutral-800 text-neutral-300 hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold">{isAr ? 'مجانية للجميع' : 'Free for Everyone'}</p>
                      <p className="text-[11px] text-neutral-400">
                        {isAr ? 'عينة مجانية متاحة لجميع الطلاب دون اشتراك' : 'Available for all students without subscription'}
                      </p>
                    </div>
                  </div>
                  {(visibility === 'FREE' || isFree) && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 05 — المذكرات والمرفقات */}
          {/* ============================================================ */}
          <div className="bg-[#101612] border border-neutral-800/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-800/70">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 font-mono font-bold text-xs border border-emerald-800/60">
                05
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isAr ? 'المذكرات والمرفقات' : 'Memos & PDF Attachments'}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  {isAr
                    ? 'رفع مذكرة المحاضرة وملفات الشرح والواجبات الإضافية (PDF)'
                    : 'Upload lecture PDF notes, summaries and homework attachments'}
                </p>
              </div>
            </div>

            {/* Attachments Manager */}
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
          </div>

          {/* ============================================================ */}
          {/* SECTION 06 — المعاينة الحية */}
          {/* ============================================================ */}
          <div className="bg-[#101612] border border-neutral-800/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-3 pb-3 border-b border-neutral-800/70">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-950 text-emerald-400 font-mono font-bold text-xs border border-emerald-800/60">
                06
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isAr ? 'معاينة المحاضرة' : 'Live Student Preview'}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  {isAr
                    ? 'تحقق من الشكل النهائي للمحاضرة ومظهرها للطالب قبل الحفظ'
                    : 'Preview exactly how the lecture appears to enrolled students'}
                </p>
              </div>
            </div>

            <div className="bg-[#141b16] p-5 rounded-xl border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-start">
                <p className="text-xs font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? 'معاينة تجربة الطالب الحقيقية' : 'Realistic Student Experience'}</span>
                </p>
                <p className="text-[11px] text-neutral-400">
                  {isAr
                    ? 'شاهد الفيديو الأساسي وفيديو الحل وتنزيل المذكرات كما ستظهر داخل حساب الطالب.'
                    : 'Preview video player, solution video, and memo download buttons.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-all shadow-sm border border-neutral-700/80 hover:border-emerald-500/50"
              >
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'معاينة شكل المحاضرة للطلاب' : 'Preview Student View'}</span>
              </button>
            </div>
          </div>

          {/* Sticky Bottom Action Bar Inside Form */}
          <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-4 p-4 -mx-6 -mb-6 bg-[#0b0f0c]/95 backdrop-blur-md border-t border-neutral-800 shadow-2xl">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="font-medium text-neutral-300">
                {titleAr ? `«${titleAr}»` : isAr ? 'محاضرة جديدة' : 'New Lecture'}
              </span>
              <span>•</span>
              <span>
                {selectedCourseIds.length} {isAr ? 'كورس' : 'courses'}
              </span>
              <span>•</span>
              <span>
                {selectedPackageIds.length} {isAr ? 'باقة' : 'packages'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>

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
                    <span>
                      {isEdit
                        ? isAr
                          ? 'حفظ التعديلات'
                          : 'Save Changes'
                        : isAr
                        ? 'حفظ المحاضرة'
                        : 'Create Lecture'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Realistic Student Preview Modal */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0b0f0c] border border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  {isAr ? 'معاينة المحاضرة (كما يراها الطالب)' : 'Student View Preview'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <LectureCardPreview data={previewData} mode="full" />
          </div>
        </div>
      )}

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
