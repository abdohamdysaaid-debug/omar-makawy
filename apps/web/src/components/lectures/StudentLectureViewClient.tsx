'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Play,
  Clock,
  BookOpen,
  Package as PackageIcon,
  CheckCircle2,
  Lock,
  Calendar,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Video,
  Sparkles,
  RefreshCw,
  FileText,
  Download,
  ExternalLink,
  GraduationCap,
  Info,
  Layers,
  Paperclip,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import StudentLayout from '@/components/layout/StudentLayout';
import {
  defaultLecturesApi,
  defaultVideosApi,
  LectureItem,
  VideoItem,
  LectureChapterItem,
  LectureProgressResponse,
  buildYouTubeEmbedUrl,
  extractYouTubeVideoId,
  formatTimestamp,
  DEFAULT_API_BASE_URL,
} from '@omar-makawy/shared';

interface StudentLectureViewClientProps {
  lectureId: string;
  courseId?: string | number;
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function formatFileSize(bytes?: number): string {
  if (!bytes || isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function StudentLectureViewClient({
  lectureId,
  courseId,
}: StudentLectureViewClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, t } = useLanguage();
  const isAr = language === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const { isAuthenticated, student } = useAuth();

  // Navigation context parameters
  const queryCourseId =
    searchParams?.get('courseId') ||
    searchParams?.get('course_id') ||
    (courseId ? String(courseId) : undefined);
  const queryPackageId =
    searchParams?.get('packageId') || searchParams?.get('package_id');

  // Primary Lecture State
  const [lecture, setLecture] = useState<LectureItem | null>(null);
  const [progress, setProgress] = useState<LectureProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{
    status?: number;
    code?: string;
    message?: string;
    scheduledAt?: string | null;
  } | null>(null);

  // Video Player & Watch Session State
  const [currentVideoType, setCurrentVideoType] = useState<'MAIN' | 'SOLUTION'>('MAIN');
  const [watchSessionId, setWatchSessionId] = useState<string | null>(null);
  const [resumePosition, setResumePosition] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const videoPlayerContainerRef = useRef<HTMLDivElement | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentPositionRef = useRef<number>(0);

  // Back Navigation Icon
  const BackArrow = dir === 'rtl' ? ArrowRight : ArrowLeft;

  // 1. Fetch Lecture Details and Initial Progress
  const fetchLectureData = useCallback(async () => {
    if (!lectureId || lectureId === 'detail' || lectureId.trim() === '') {
      setLoading(false);
      setError({
        status: 404,
        code: 'LECTURE_NOT_FOUND',
        message: isAr
          ? 'لم يتم تحديد معرّف المحاضرة المطلوب'
          : 'Lecture ID was not specified',
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call Authoritative Backend API
      const lectureData = await defaultLecturesApi.getLectureById(lectureId);
      setLecture(lectureData);

      // Fetch watch progress if available
      try {
        const progressData = await defaultVideosApi.getLectureProgress(lectureId);
        setProgress(progressData);
        setIsCompleted(progressData.is_completed || false);
        const mainPct = Math.round((progressData.main_video?.percentage || 0) * 100);
        setCompletionPercentage(mainPct);
        if (progressData.main_video?.max_position) {
          setResumePosition(progressData.main_video.max_position);
          currentPositionRef.current = progressData.main_video.max_position;
        }
      } catch {
        // Non-blocking progress fetch
      }
    } catch (err: any) {
      const status =
        err?.statusCode ||
        err?.status ||
        err?.response?.status ||
        (err?.message?.includes('403') ? 403 : err?.message?.includes('404') ? 404 : 500);
      const code =
        err?.error_code ||
        err?.data?.error_code ||
        (status === 404
          ? 'LECTURE_NOT_FOUND'
          : status === 403
          ? 'LECTURE_ACCESS_DENIED'
          : 'UNKNOWN_ERROR');
      const message =
        err?.message ||
        (isAr ? 'حدث خطأ أثناء تحميل المحاضرة' : 'An error occurred while loading lecture');
      const scheduledAt = err?.data?.scheduled_at || err?.scheduled_at;

      setError({
        status,
        code,
        message,
        scheduledAt,
      });
    } finally {
      setLoading(false);
    }
  }, [lectureId, isAr]);

  useEffect(() => {
    fetchLectureData();
  }, [fetchLectureData]);

  // 2. Authorize Playback Session when Lecture or Video Type changes
  useEffect(() => {
    if (!lecture || !lecture.videos || lecture.videos.length === 0) {
      return;
    }

    const targetVideo = lecture.videos.find((v: VideoItem) => v.video_type === currentVideoType);
    if (!targetVideo) {
      // If SOLUTION is not available, fallback to MAIN
      if (currentVideoType === 'SOLUTION') {
        setCurrentVideoType('MAIN');
      }
      return;
    }

    let isMounted = true;

    async function authorizeSession() {
      try {
        const authRes = await defaultVideosApi.authorizeVideo(lectureId, currentVideoType);
        if (isMounted) {
          setWatchSessionId(authRes.watch_session_id);
          const resume = authRes.resume_position || 0;
          setResumePosition(resume);
          currentPositionRef.current = resume;
          if (authRes.is_completed) {
            setIsCompleted(true);
          }
          if (authRes.playback_info?.provider_video_id) {
            setCurrentVideoId(authRes.playback_info.provider_video_id);
          } else if (targetVideo?.provider_video_id) {
            setCurrentVideoId(targetVideo.provider_video_id);
          }
        }
      } catch {
        // Fallback to direct video id if playback auth returned standard session
        if (targetVideo?.provider_video_id && isMounted) {
          setCurrentVideoId(targetVideo.provider_video_id);
        }
      }
    }

    authorizeSession();

    return () => {
      isMounted = false;
    };
  }, [lecture, lectureId, currentVideoType]);

  // 3. Heartbeat Tracking Loop (Every 15s)
  const sendHeartbeatUpdate = useCallback(async () => {
    if (!watchSessionId || !isPlaying) return;

    try {
      const payload = {
        heartbeat_id: generateUUID(),
        watch_session_id: watchSessionId,
        current_position: Math.max(0, Math.floor(currentPositionRef.current)),
        client_timestamp: Date.now(),
      };

      const res = await defaultVideosApi.sendHeartbeat(payload);
      if (res) {
        if (res.is_completed) {
          setIsCompleted(true);
        }
        if (typeof res.completion_percentage === 'number') {
          const pct = Math.round(res.completion_percentage * 100);
          setCompletionPercentage(pct);
        }
      }
    } catch {
      // Non-blocking telemetry
    }
  }, [watchSessionId, isPlaying]);

  useEffect(() => {
    if (isPlaying && watchSessionId) {
      heartbeatTimerRef.current = setInterval(() => {
        currentPositionRef.current += 15;
        sendHeartbeatUpdate();
      }, 15000);
    } else if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }

    return () => {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
    };
  }, [isPlaying, watchSessionId, sendHeartbeatUpdate]);

  // Video switching & focusing helpers
  const handleSelectVideoType = (type: 'MAIN' | 'SOLUTION') => {
    setCurrentVideoType(type);
    if (videoPlayerContainerRef.current) {
      videoPlayerContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Helper values
  const hasSolutionVideo = lecture?.videos?.some((v) => v.video_type === 'SOLUTION');
  const mainVideo = lecture?.videos?.find((v) => v.video_type === 'MAIN');
  const solutionVideo = lecture?.videos?.find((v) => v.video_type === 'SOLUTION');

  // Video embed URL
  const rawTargetVideoId =
    currentVideoType === 'MAIN'
      ? currentVideoId || mainVideo?.provider_video_id
      : currentVideoId || solutionVideo?.provider_video_id;

  const cleanVideoId = rawTargetVideoId ? extractYouTubeVideoId(rawTargetVideoId) : null;

  const embedUrl = cleanVideoId
    ? `https://www.youtube-nocookie.com/embed/${cleanVideoId}?enablejsapi=1&controls=1&rel=0&playsinline=1&modestbranding=1${
        resumePosition > 0 ? `&start=${Math.floor(resumePosition)}` : ''
      }`
    : null;

  const attachmentsList = lecture?.attachments || [];
  const pdfAttachments = attachmentsList.filter(
    (a: any) =>
      a.mime_type === 'application/pdf' ||
      a.file_type === 'PDF' ||
      (a.title_ar && a.title_ar.toLowerCase().includes('pdf')) ||
      (a.file_url && a.file_url.toLowerCase().endsWith('.pdf'))
  );
  const otherAttachments = attachmentsList.filter(
    (a: any) => !pdfAttachments.includes(a)
  );

  // Compute Context-Aware Back URL & Label
  let backUrl = '/student/subscriptions';
  let backLabel = isAr ? 'العودة إلى اشتراكاتي' : 'Back to Subscriptions';

  if (queryPackageId) {
    backUrl = `/student/packages/detail?id=${queryPackageId}`;
    backLabel = isAr ? 'العودة إلى محتوى الباقة' : 'Back to Package Content';
  } else if (queryCourseId) {
    backUrl = `/student/courses/detail?id=${queryCourseId}`;
    backLabel = isAr ? 'العودة إلى محتوى الكورس' : 'Back to Course Content';
  } else if (lecture?.packages && lecture.packages.length > 0) {
    backUrl = `/student/packages/detail?id=${lecture.packages[0].id}`;
    backLabel = isAr ? 'العودة إلى محتوى الباقة' : 'Back to Package Content';
  } else if (lecture?.courses && lecture.courses.length > 0) {
    backUrl = `/student/courses/detail?id=${lecture.courses[0].id}`;
    backLabel = isAr ? 'العودة إلى محتوى الكورس' : 'Back to Course Content';
  }

  // --- LOADING SKELETON ---
  if (loading) {
    return (
      <StudentLayout>
        <div className="space-y-6 animate-pulse max-w-7xl mx-auto py-4 font-cairo">
          <div className="flex items-center justify-between">
            <div className="h-8 w-44 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded-full" />
          </div>
          <div className="aspect-video w-full bg-gray-200 dark:bg-gray-800 rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-xl" />
              <div className="h-24 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl" />
            </div>
            <div className="h-72 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
          </div>
        </div>
      </StudentLayout>
    );
  }

  // --- ERROR / LOCKED / ACCESS DENIED STATES ---
  if (error || !lecture) {
    // 1. Scheduled Lock State
    if (
      error?.code === 'LECTURE_LOCKED_SCHEDULED' ||
      (error?.message && error.message.includes('scheduled'))
    ) {
      return (
        <StudentLayout>
          <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6 animate-fade-in font-cairo">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/10">
              <Lock className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Calendar className="w-3.5 h-3.5" />
                {t('lectures.lockedScheduled')}
              </span>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                {t('lectures.scheduledNotice')}
              </h1>
              {error?.scheduledAt && (
                <p className="text-base font-bold text-amber-600 dark:text-amber-400 font-mono">
                  {new Date(error.scheduledAt).toLocaleString(isAr ? 'ar-EG' : 'en-US', {
                    dateStyle: 'full',
                    timeStyle: 'short',
                  })}
                </p>
              )}
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              {isAr
                ? 'تم تجهيز هذه المحاضرة وستفتح للمشاهدة والدراسة تلقائياً فور حلول الموعد المحدد.'
                : 'This lecture has been scheduled and will unlock automatically at the specified date.'}
            </p>

            <div className="pt-4">
              <Link
                href={backUrl}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0d6e4f] hover:bg-[#0a4834] text-white font-black text-xs shadow-lg shadow-[#0d6e4f]/20 transition-all"
              >
                <BackArrow className="w-4 h-4" />
                <span>{backLabel}</span>
              </Link>
            </div>
          </div>
        </StudentLayout>
      );
    }

    // 2. Access Denied State (403)
    if (error?.status === 403 || error?.code === 'LECTURE_ACCESS_DENIED') {
      return (
        <StudentLayout>
          <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6 animate-fade-in font-cairo">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10">
              <Lock className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                {t('lectures.accessDeniedTitle')}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                {isAr
                  ? 'هذه المحاضرة تتطلب اشتراكاً سارياً في الكورس أو الباقة التابعة لها.'
                  : t('lectures.accessDeniedDesc')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href="/student/subscriptions"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#0d6e4f] hover:bg-[#0a4834] text-white font-black text-xs shadow-lg shadow-[#0d6e4f]/20 transition-all text-center"
              >
                {t('lectures.browseSubscriptions')}
              </Link>
              <Link
                href={backUrl}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-black text-xs transition-all text-center"
              >
                {backLabel}
              </Link>
            </div>
          </div>
        </StudentLayout>
      );
    }

    // 3. Not Found (404) or General Error
    return (
      <StudentLayout>
        <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6 animate-fade-in font-cairo">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500">
            <AlertCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              {error?.status === 404
                ? isAr
                  ? 'المحاضرة غير موجودة'
                  : t('lectures.notFoundTitle')
                : t('ui.error')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {error?.message ||
                (isAr
                  ? 'تعذر العثور على بيانات المحاضرة، يرجى التأكد من الرابط أو المحاولة لاحقاً.'
                  : 'Failed to load lecture details.')}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={fetchLectureData}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0d6e4f] hover:bg-[#0a4834] text-white font-black text-xs transition-all shadow-md shadow-[#0d6e4f]/20 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('ui.retry')}</span>
            </button>
            <Link
              href={backUrl}
              className="px-6 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-black text-xs transition-all"
            >
              <span>{backLabel}</span>
            </Link>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // --- LECTURE FOUND & AUTHORIZED VIEW ---
  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in max-w-7xl mx-auto py-2 font-cairo">
        {/* Top Header & Breadcrumb Bar with Context-Aware Back Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#121814] p-4 sm:p-5 rounded-3xl border border-gray-100 dark:border-gray-800/80 shadow-xs">
          <Link
            href={backUrl}
            className="inline-flex items-center gap-2 text-xs font-black text-gray-700 dark:text-gray-300 hover:text-[#0d6e4f] dark:hover:text-emerald-400 transition-colors w-fit px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
          >
            <BackArrow className="w-4 h-4 text-[#0d6e4f] dark:text-emerald-400" />
            <span>{backLabel}</span>
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Completion Status Badge */}
            {isCompleted ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'تم إكمال المحاضرة (100%)' : 'Completed (100%)'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                <Clock className="w-3.5 h-3.5" />
                <span>{isAr ? `جاري المشاهدة (${completionPercentage}%)` : `Watching (${completionPercentage}%)`}</span>
              </span>
            )}
          </div>
        </div>

        {/* Video Player Switcher Tabs (If Solution Video Exists) */}
        {hasSolutionVideo && (
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-gray-100 dark:bg-[#121814] border border-gray-200 dark:border-gray-800 w-fit">
            <button
              onClick={() => handleSelectVideoType('MAIN')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                currentVideoType === 'MAIN'
                  ? 'bg-[#0d6e4f] text-white shadow-md shadow-[#0d6e4f]/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>{isAr ? 'فيديو الشرح الأساسي' : t('lectures.mainVideo')}</span>
            </button>
            <button
              onClick={() => handleSelectVideoType('SOLUTION')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                currentVideoType === 'SOLUTION'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAr ? 'فيديو حل الواجب والتمارين' : t('lectures.solutionVideo')}</span>
            </button>
          </div>
        )}

        {/* Main Secured 16:9 Video Player Frame */}
        <div
          ref={videoPlayerContainerRef}
          className="relative w-full rounded-3xl p-2.5 sm:p-3.5 bg-stone-950 border-2 border-[#0d6e4f]/40 dark:border-emerald-500/30 shadow-2xl space-y-2.5 overflow-hidden group/frame"
        >
          {/* Frame Top Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#121a15] rounded-2xl border border-emerald-900/40 text-xs text-white">
            <div className="flex items-center gap-2 font-black text-[#0d6e4f] dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">مشغل المحاضرات المحمي — منصة مستر عمر مكاوي</span>
              <span className="sm:hidden">مشغل المحاضرات المحمي</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400">
              <span className="flex items-center gap-1.5 bg-emerald-950/80 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                مشاهدة آمنة
              </span>
              {student?.fullName && (
                <span className="hidden md:inline text-gray-400 font-mono">
                  طالب: {student.fullName}
                </span>
              )}
            </div>
          </div>

          {/* Inner 16:9 Player Viewport with Shields */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner">
            {embedUrl ? (
              <>
                <iframe
                  ref={iframeRef}
                  src={embedUrl}
                  title={lecture.title_ar || lecture.title_en || 'Lecture Video'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0 relative z-10"
                  onLoad={() => setIsPlaying(true)}
                />

                {/* --- ANTI-YOUTUBE REDIRECT SHIELDS --- */}
                {/* 1. Top Shield: Blocks YouTube title link and share options */}
                <div
                  className="absolute top-0 inset-x-0 h-16 z-20 pointer-events-auto bg-gradient-to-b from-black/85 via-black/40 to-transparent flex items-start justify-between px-4 py-2.5 text-white select-none cursor-default"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <span className="font-extrabold text-xs sm:text-sm text-gray-100 truncate max-w-[75%] drop-shadow-sm">
                    {lecture.title_ar}
                  </span>
                  <span className="text-[10px] font-black bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-emerald-400 border border-emerald-500/30 shadow-xs">
                    منصة مستر عمر مكاوي
                  </span>
                </div>

                {/* 2. Bottom-Left Shield: Blocks "Watch on YouTube" button */}
                <div
                  className="absolute bottom-0 left-0 w-44 h-14 z-20 pointer-events-auto bg-transparent select-none cursor-default"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  title="المشاهدة مقتصرة داخل منصة مستر عمر مكاوي"
                />

                {/* 3. Bottom-Right Shield: Blocks YouTube logo link */}
                <div
                  className="absolute bottom-0 right-0 w-32 h-14 z-20 pointer-events-auto bg-transparent select-none cursor-default"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  title="المشاهدة مقتصرة داخل منصة مستر عمر مكاوي"
                />
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-3 p-6 text-center">
                <Video className="w-16 h-16 stroke-[1.5] text-gray-600" />
                <span className="text-base font-bold text-gray-300">
                  {isAr ? 'فيديو المحاضرة غير متوفر حالياً' : 'Lecture video is currently unavailable'}
                </span>
                <p className="text-xs text-gray-500 max-w-sm">
                  {isAr
                    ? 'يرجى مراجعة المدرس أو التأكد من إرفاق رابط الفيديو لهذه المحاضرة.'
                    : 'Please contact support if you believe this is an error.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Watch Progress Indicator */}
        <div className="bg-white dark:bg-[#121814] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#0d6e4f] dark:text-emerald-400" />
              <span>{isAr ? 'نسبة المشاهدة والإنجاز:' : 'Watch Progress:'}</span>
            </span>
            <span className="text-[#0d6e4f] dark:text-emerald-400 font-mono font-black text-sm">
              {completionPercentage}%
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isCompleted
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-[#0d6e4f] to-emerald-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, completionPercentage))}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 shrink-0 text-[#0d6e4f] dark:text-emerald-400" />
            <span>
              {isAr
                ? 'تكتمل المحاضرة تلقائياً عند تجاوز 90% من وقت المشاهدة.'
                : 'Lecture automatically marks as complete after 90% watch progress.'}
            </span>
          </p>
        </div>

        {/* Lecture Content & Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Lecture Metadata (Col 1 & 2) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#121814] rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-xs space-y-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-lg bg-[#0d6e4f]/10 text-[#0d6e4f] dark:text-emerald-400 text-xs font-black">
                    مستر عمر مكاوي
                  </span>
                  {lecture.duration_seconds && lecture.duration_seconds > 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      {Math.floor(lecture.duration_seconds / 60)} {isAr ? 'دقيقة' : 'min'}
                    </span>
                  ) : null}
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-snug">
                  {lecture.title_ar}
                </h1>
                {lecture.title_en && (
                  <p className="text-xs text-gray-400 font-medium font-sans" dir="ltr">
                    {lecture.title_en}
                  </p>
                )}
              </div>

              {/* Description */}
              {(lecture.description_ar || lecture.description_en) && (
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-xs font-black text-gray-900 dark:text-white mb-1">
                    {isAr ? 'وصف المحاضرة:' : 'Lecture Description:'}
                  </h4>
                  {lecture.description_ar && (
                    <p className="whitespace-pre-line leading-relaxed">{lecture.description_ar}</p>
                  )}
                  {!lecture.description_ar && lecture.description_en && (
                    <p dir="ltr" className="whitespace-pre-line font-sans">{lecture.description_en}</p>
                  )}
                </div>
              )}

              {/* Linked Courses & Packages */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 text-xs">
                {lecture.courses && lecture.courses.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="font-black text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-[#0d6e4f] dark:text-emerald-400" />
                      {isAr ? 'الكورسات المضمنة بها:' : t('lectures.linkedCourses')}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {lecture.courses.map((c) => (
                        <Link
                          key={c.id}
                          href={`/student/courses/detail?id=${c.id}`}
                          className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-bold hover:bg-emerald-100 transition-colors"
                        >
                          {c.title_ar || c.title_en}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {lecture.packages && lecture.packages.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="font-black text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <PackageIcon className="w-3.5 h-3.5 text-amber-500" />
                      {isAr ? 'الباقات المضمنة بها:' : t('lectures.linkedPackages')}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {lecture.packages.map((p) => (
                        <Link
                          key={p.id}
                          href={`/student/packages/detail?id=${p.id}`}
                          className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-bold hover:bg-amber-100 transition-colors"
                        >
                          {p.title_ar || p.title_en}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Canonical Resource Section: "محتوى المحاضرة" (Col 3) */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#121814] rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 font-black text-sm text-gray-900 dark:text-white">
                  <Layers className="w-4 h-4 text-[#0d6e4f] dark:text-emerald-400" />
                  <span>{isAr ? 'محتوى المحاضرة' : 'Lecture Content'}</span>
                </div>
              </div>

              {/* Resource List Items */}
              <div className="space-y-2.5">
                {/* 1. Main Video Resource Card */}
                {mainVideo && (
                  <button
                    type="button"
                    onClick={() => handleSelectVideoType('MAIN')}
                    className={`w-full text-start p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                      currentVideoType === 'MAIN'
                        ? 'bg-[#0d6e4f]/10 dark:bg-[#0d6e4f]/20 border-[#0d6e4f]/40 dark:border-emerald-500/40 shadow-xs'
                        : 'bg-gray-50 dark:bg-[#161e19] hover:bg-gray-100 dark:hover:bg-gray-800/60 border-gray-100 dark:border-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          currentVideoType === 'MAIN'
                            ? 'bg-[#0d6e4f] text-white'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-[#0d6e4f] dark:text-emerald-400'
                        }`}
                      >
                        <Play className="w-5 h-5 fill-current ms-0.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-gray-900 dark:text-white truncate">
                          {isAr ? 'شرح المحاضرة' : 'Main Lecture'}
                        </h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          {isAr ? 'الفيديو الأساسي' : 'Primary Video'}
                        </p>
                      </div>
                    </div>

                    {currentVideoType === 'MAIN' && (
                      <span className="text-[10px] font-black text-[#0d6e4f] dark:text-emerald-400 bg-white dark:bg-[#121814] px-2 py-0.5 rounded-md border border-[#0d6e4f]/20 shadow-2xs">
                        {isAr ? 'يتم المشاهدة' : 'Active'}
                      </span>
                    )}
                  </button>
                )}

                {/* 2. Solution Video Resource Card (Only if exists) */}
                {hasSolutionVideo && (
                  <button
                    type="button"
                    onClick={() => handleSelectVideoType('SOLUTION')}
                    className={`w-full text-start p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                      currentVideoType === 'SOLUTION'
                        ? 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/40 shadow-xs'
                        : 'bg-gray-50 dark:bg-[#161e19] hover:bg-gray-100 dark:hover:bg-gray-800/60 border-gray-100 dark:border-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          currentVideoType === 'SOLUTION'
                            ? 'bg-amber-600 text-white'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-gray-900 dark:text-white truncate">
                          {isAr ? 'فيديو الحل' : 'Solution Video'}
                        </h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          {isAr ? 'حل الواجب والتمارين' : 'Exercise Walkthrough'}
                        </p>
                      </div>
                    </div>

                    {currentVideoType === 'SOLUTION' ? (
                      <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 bg-white dark:bg-[#121814] px-2 py-0.5 rounded-md border border-amber-500/20 shadow-2xs">
                        {isAr ? 'يتم المشاهدة' : 'Active'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                        {isAr ? 'متاح' : 'Available'}
                      </span>
                    )}
                  </button>
                )}

                {/* 3. PDF / Memo Cards (Only if exist) */}
                {pdfAttachments.map((pdf: any, idx: number) => {
                  const directDownloadUrl = pdf.id
                    ? `${DEFAULT_API_BASE_URL}/attachments/${pdf.id}/access?download=true`
                    : pdf.file_url;
                  const inlineViewUrl = pdf.id
                    ? `${DEFAULT_API_BASE_URL}/attachments/${pdf.id}/access`
                    : pdf.file_url;

                  return (
                    <div
                      key={pdf.id || idx}
                      className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#161e19] border border-gray-100 dark:border-gray-800 space-y-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-black text-gray-900 dark:text-white truncate">
                            {pdf.title_ar || pdf.title_en || (isAr ? 'المذكرة' : 'PDF Memo')}
                          </h4>
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                            {pdf.file_size_bytes ? formatFileSize(pdf.file_size_bytes) : 'PDF'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-800/80">
                        {directDownloadUrl && (
                          <a
                            href={directDownloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-3 rounded-xl bg-[#0d6e4f] hover:bg-[#0a4834] text-white text-[11px] font-black transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-[#0d6e4f]/20"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{isAr ? 'تحميل المذكرة' : 'Download'}</span>
                          </a>
                        )}
                        {inlineViewUrl && (
                          <a
                            href={inlineViewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2 px-3 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-[11px] font-bold transition-all flex items-center justify-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>{isAr ? 'عرض' : 'View'}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* 4. Exam / Quiz Card */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0d6e4f] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-black text-gray-900 dark:text-white truncate">
                        {isAr ? 'اختبار المحاضرة' : 'Lecture Quiz'}
                      </h4>
                      <p className="text-[10px] text-gray-600 dark:text-gray-400">
                        {isAr ? 'الامتحان والواجب التفاعلي' : 'Interactive Assessment'}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/student/exams${queryCourseId ? `?courseId=${queryCourseId}` : ''}`}
                    className="w-full py-2 px-3 rounded-xl bg-[#0d6e4f] hover:bg-[#0a4834] text-white text-[11px] font-black transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-[#0d6e4f]/20"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>{isAr ? 'ابدأ الاختبار' : 'Start Exam'}</span>
                    <ArrowLeft className="w-3 h-3" />
                  </Link>
                </div>

                {/* 5. Other Extra Attachments (Only if exist) */}
                {otherAttachments.map((att: any, idx: number) => {
                  const downloadUrl = att.id
                    ? `${DEFAULT_API_BASE_URL}/attachments/${att.id}/access?download=true`
                    : att.file_url;

                  return (
                    <div
                      key={att.id || idx}
                      className="p-3 rounded-2xl bg-gray-50 dark:bg-[#161e19] border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Paperclip className="w-4 h-4 text-[#0d6e4f] dark:text-emerald-400 shrink-0" />
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                          {att.title_ar || att.title_en || (isAr ? 'مرفق إضافي' : 'Attachment')}
                        </span>
                      </div>
                      {downloadUrl && (
                        <a
                          href={downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-[#0d6e4f] hover:text-white text-gray-700 dark:text-gray-200 text-[10px] font-black transition-colors shrink-0"
                        >
                          <Download className="w-3 h-3 inline me-1" />
                          <span>{isAr ? 'تحميل' : 'Download'}</span>
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
