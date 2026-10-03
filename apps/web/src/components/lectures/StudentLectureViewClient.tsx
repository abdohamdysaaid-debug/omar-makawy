'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Play,
  Clock,
  BookOpen,
  Package,
  CheckCircle2,
  Lock,
  Calendar,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ListOrdered,
  Video,
  Sparkles,
  RefreshCw,
  Eye,
  Check,
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

export function StudentLectureViewClient({
  lectureId,
  courseId,
}: StudentLectureViewClientProps) {
  const router = useRouter();
  const { language, t } = useLanguage();
  const isAr = language === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const { isAuthenticated, student } = useAuth();

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
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentPositionRef = useRef<number>(0);

  // Back Navigation Icon
  const BackArrow = dir === 'rtl' ? ArrowRight : ArrowLeft;

  // 1. Fetch Lecture Details and Initial Progress
  const fetchLectureData = useCallback(async () => {
    if (!lectureId || lectureId === 'detail' || lectureId.trim() === '') {
      setLoading(false);
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
      } catch (progErr) {
        // Non-blocking progress fetch
      }
    } catch (err: any) {
      const status = err?.status || err?.response?.status || (err?.message?.includes('403') ? 403 : err?.message?.includes('404') ? 404 : 500);
      const code = err?.error_code || err?.data?.error_code || (status === 404 ? 'LECTURE_NOT_FOUND' : status === 403 ? 'LECTURE_ACCESS_DENIED' : 'UNKNOWN_ERROR');
      const message = err?.message || (isAr ? 'حدث خطأ أثناء تحميل المحاضرة' : 'An error occurred while loading lecture');
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
      } catch (authErr) {
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

  // 4. Chapter Seek Command (via YouTube iframe postMessage)
  const handleChapterClick = (timestampSeconds: number) => {
    currentPositionRef.current = timestampSeconds;
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'seekTo',
          args: [timestampSeconds, true],
        }),
        '*'
      );
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'playVideo',
          args: [],
        }),
        '*'
      );
    }
    setIsPlaying(true);
  };

  // Helper values
  const hasSolutionVideo = lecture?.videos?.some((v) => v.video_type === 'SOLUTION');
  const mainVideo = lecture?.videos?.find((v) => v.video_type === 'MAIN');
  const solutionVideo = lecture?.videos?.find((v) => v.video_type === 'SOLUTION');

  // Video embed URL
  const activeVideoId =
    currentVideoType === 'MAIN'
      ? currentVideoId || mainVideo?.provider_video_id
      : currentVideoId || solutionVideo?.provider_video_id;

  const embedUrl = activeVideoId
    ? `https://www.youtube-nocookie.com/embed/${activeVideoId}?enablejsapi=1&controls=1&rel=0&playsinline=1&modestbranding=1${
        resumePosition > 0 ? `&start=${Math.floor(resumePosition)}` : ''
      }`
    : null;

  // --- LOADING STATE ---
  if (loading) {
    return (
      <StudentLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-xl" />
          <div className="aspect-video w-full max-w-5xl mx-auto bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-xl" />
              <div className="h-24 w-full bg-gray-200 dark:bg-gray-800 rounded-xl" />
            </div>
            <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          </div>
        </div>
      </StudentLayout>
    );
  }

  // --- ERROR / LOCKED / ACCESS DENIED STATES ---
  if (error) {
    // 1. Scheduled Lock State
    if (
      error.code === 'LECTURE_LOCKED_SCHEDULED' ||
      (error.message && error.message.includes('scheduled'))
    ) {
      return (
        <StudentLayout>
          <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6 animate-fade-in">
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
              {error.scheduledAt && (
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
                href="/student/lectures"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all"
              >
                <BackArrow className="w-4 h-4" />
                {t('lectures.backToLectures')}
              </Link>
            </div>
          </div>
        </StudentLayout>
      );
    }

    // 2. Access Denied State (403)
    if (error.status === 403 || error.code === 'LECTURE_ACCESS_DENIED') {
      return (
        <StudentLayout>
          <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-center justify-center text-red-500 shadow-xl shadow-red-500/10">
              <Lock className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                {t('lectures.accessDeniedTitle')}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                {t('lectures.accessDeniedDesc')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href="/student/subscriptions"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all text-center"
              >
                {t('lectures.browseSubscriptions')}
              </Link>
              <Link
                href="/student/lectures"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm transition-all text-center"
              >
                {t('lectures.backToLectures')}
              </Link>
            </div>
          </div>
        </StudentLayout>
      );
    }

    // 3. Not Found (404) or General Error
    return (
      <StudentLayout>
        <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500">
            <AlertCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              {error.status === 404 ? t('lectures.notFoundTitle') : t('ui.error')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {error.status === 404 ? t('lectures.notFoundDesc') : error.message}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={fetchLectureData}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              {t('ui.retry')}
            </button>
            <Link
              href="/student/lectures"
              className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-sm"
            >
              {t('lectures.backToLectures')}
            </Link>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!lecture) {
    return null;
  }

  return (
    <StudentLayout>
      <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
        {/* Top Navigation & Breadcrumbs */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/student/lectures"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <BackArrow className="w-4 h-4" />
            <span>{t('lectures.backToLectures')}</span>
          </Link>

          {/* Completion Status Badge */}
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t('lectures.completed')} (100%)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <Clock className="w-3.5 h-3.5" />
              {t('lectures.inProgress')} ({completionPercentage}%)
            </span>
          )}
        </div>

        {/* Video Type Tabs (When Solution Video Exists) */}
        {hasSolutionVideo && (
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-gray-100 dark:bg-[#121814] border border-gray-200 dark:border-gray-800 w-fit">
            <button
              onClick={() => setCurrentVideoType('MAIN')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentVideoType === 'MAIN'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>{t('lectures.mainVideo')}</span>
            </button>
            <button
              onClick={() => setCurrentVideoType('SOLUTION')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                currentVideoType === 'SOLUTION'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('lectures.solutionVideo')}</span>
            </button>
          </div>
        )}

        {/* Main 16:9 Video Player */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-gray-200 dark:border-gray-800 shadow-2xl">
          {embedUrl ? (
            <iframe
              ref={iframeRef}
              src={embedUrl}
              title={lecture.title_ar || lecture.title_en || 'Lecture Video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
              onLoad={() => setIsPlaying(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-3">
              <Video className="w-16 h-16 stroke-[1.5]" />
              <span className="text-sm font-bold">
                {isAr ? 'فيديو المحاضرة غير متوفر حالياً' : 'Lecture video is currently unavailable'}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar & Automatic 90% Notice */}
        <div className="bg-white dark:bg-[#121814] rounded-2xl p-4 border border-gray-200 dark:border-gray-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {t('lectures.progress')}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono">
              {completionPercentage}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isCompleted
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, completionPercentage))}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            {t('lectures.completionThresholdNotice')}
          </p>
        </div>

        {/* 2-Column Layout: Left Details, Right Chapters */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lecture Info (Col 1 & 2) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#121814] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-snug">
                  {isAr ? lecture.title_ar : lecture.title_en || lecture.title_ar}
                </h1>
                {isAr && lecture.title_en && (
                  <p className="text-xs text-gray-400 font-medium font-sans" dir="ltr">
                    {lecture.title_en}
                  </p>
                )}
              </div>

              {/* Description */}
              {(lecture.description_ar || lecture.description_en) && (
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  {isAr && lecture.description_ar && <p>{lecture.description_ar}</p>}
                  {!isAr && lecture.description_en && (
                    <p dir="ltr">{lecture.description_en}</p>
                  )}
                  {isAr && !lecture.description_ar && lecture.description_en && (
                    <p dir="ltr" className="text-gray-400 font-sans">
                      {lecture.description_en}
                    </p>
                  )}
                </div>
              )}

              {/* Associated Courses & Packages Tags */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-4 text-xs">
                {lecture.courses && lecture.courses.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                      {t('lectures.linkedCourses')}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {lecture.courses.map((c) => (
                        <span
                          key={c.id}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-semibold"
                        >
                          {isAr ? c.title_ar : c.title_en || c.title_ar}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {lecture.packages && lecture.packages.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-amber-500" />
                      {t('lectures.linkedPackages')}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {lecture.packages.map((p) => (
                        <span
                          key={p.id}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-semibold"
                        >
                          {isAr ? p.title_ar : p.title_en || p.title_ar}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chapters Sidebar (Col 3) */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#121814] rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white">
                  <ListOrdered className="w-4 h-4 text-emerald-500" />
                  <span>{t('lectures.chapters')}</span>
                </div>
                {lecture.chapters && lecture.chapters.length > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    {lecture.chapters.length}
                  </span>
                )}
              </div>

              {lecture.chapters && lecture.chapters.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {lecture.chapters.map((chapter: LectureChapterItem) => {
                    const timeFormatted = formatTimestamp(chapter.timestamp_seconds);
                    return (
                      <button
                        key={chapter.id}
                        onClick={() => handleChapterClick(chapter.timestamp_seconds)}
                        className="w-full text-start p-3 rounded-xl bg-gray-50 dark:bg-[#161e19] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-gray-100 dark:border-gray-800/80 transition-all flex items-center justify-between gap-2 group"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            {timeFormatted}
                          </span>
                          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                            {isAr ? chapter.title_ar : chapter.title_en || chapter.title_ar}
                          </span>
                        </div>
                        <Play className="w-3.5 h-3.5 text-gray-400 group-hover:text-emerald-500 shrink-0 fill-current opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400 text-xs">
                  <p>{t('lectures.noChapters')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
