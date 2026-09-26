'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Film,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  ExternalLink,
  Clock,
  Plus,
  Edit,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import {
  defaultVideosApi,
  VideoItem,
  VideoType,
  AttachVideoPayload,
  SystemPermissions,
  extractYouTubeVideoId,
  buildYouTubeEmbedUrl,
  ApiError,
} from '@omar-makawy/shared';
import { PermissionGate } from '../rbac/PermissionGate';
import { useLanguage } from '../../context/LanguageContext';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { StatusBadge } from '../ui/StatusBadge';
import { LoadingState, ErrorState } from '../ui/FeedbackStates';

interface LectureVideosModalProps {
  isOpen: boolean;
  onClose: () => void;
  lectureId: string;
  lectureTitle: string;
  onVideoAttached?: (updatedVideo: VideoItem) => void;
}

export function LectureVideosModal({
  isOpen,
  onClose,
  lectureId,
  lectureTitle,
  onVideoAttached,
}: LectureVideosModalProps) {
  const { isArabic } = useLanguage();
  const { activeAcademicYearId, isGlobalScope } = useAcademicYear();

  // Video data states
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Form states for attaching/updating
  const [activeFormType, setActiveFormType] = useState<VideoType | null>(null);
  const [videoInput, setVideoInput] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(3600);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch videos attached to this lecture
  const fetchVideos = useCallback(async () => {
    if (!lectureId) return;

    setIsLoading(true);
    setError(null);

    const yearScope = isGlobalScope ? undefined : activeAcademicYearId || undefined;

    try {
      const res = await defaultVideosApi.getLectureVideos(lectureId, yearScope);
      setVideos(res || []);
    } catch (err: any) {
      setError(err as ApiError);
    } finally {
      setIsLoading(false);
    }
  }, [lectureId, activeAcademicYearId, isGlobalScope]);

  useEffect(() => {
    if (isOpen) {
      fetchVideos();
      setActiveFormType(null);
      setFormError(null);
    }
  }, [isOpen, fetchVideos]);

  if (!isOpen) return null;

  const mainVideo = videos.find((v) => v.video_type === 'MAIN');
  const solutionVideo = videos.find((v) => v.video_type === 'SOLUTION');

  // Open attach/update form
  const handleOpenForm = (type: VideoType) => {
    const existing = type === 'MAIN' ? mainVideo : solutionVideo;
    setActiveFormType(type);
    setVideoInput(existing ? existing.provider_video_id : '');
    setDurationSeconds(existing ? existing.duration_seconds : 3600);
    setThumbnailUrl(existing?.thumbnail_url || '');
    setFormError(null);
  };

  const handleCloseForm = () => {
    setActiveFormType(null);
    setFormError(null);
    setVideoInput('');
  };

  // Submit Video Attachment / Update
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFormType) return;

    const extractedId = extractYouTubeVideoId(videoInput);
    if (!extractedId) {
      setFormError(
        isArabic
          ? 'يرجى إدخال رابط يوتيوب صحيح أو معرف فيديو يوتيوب مكون من 11 حرفاً.'
          : 'Please enter a valid YouTube URL or an 11-character video ID.'
      );
      return;
    }

    if (durationSeconds <= 0) {
      setFormError(
        isArabic
          ? 'مدة الفيديو يجب أن تكون أكبر من 0 ثانية.'
          : 'Video duration must be greater than 0 seconds.'
      );
      return;
    }

    setIsSaving(true);
    setFormError(null);

    const yearScope = isGlobalScope ? undefined : activeAcademicYearId || undefined;

    try {
      const payload: AttachVideoPayload = {
        video_type: activeFormType,
        provider: 'YOUTUBE',
        video_input: videoInput.trim(),
        duration_seconds: Number(durationSeconds),
        thumbnail_url: thumbnailUrl.trim() || undefined,
        status: 'READY',
      };

      const result = await defaultVideosApi.attachVideo(lectureId, payload, yearScope);

      setVideos((prev) => {
        const filtered = prev.filter((v) => v.video_type !== activeFormType);
        return [...filtered, result];
      });

      if (onVideoAttached) {
        onVideoAttached(result);
      }

      handleCloseForm();
    } catch (err: any) {
      setFormError(err.message || (isArabic ? 'فشل حفظ الفيديو.' : 'Failed to save video.'));
    } finally {
      setIsSaving(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return isArabic ? '0 ثانية' : '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return isArabic ? `${hrs} ساعة و ${remainingMins} دقيقة` : `${hrs}h ${remainingMins}m`;
    }
    return isArabic ? `${mins} دقيقة ${secs > 0 ? `و ${secs} ثانية` : ''}` : `${mins}m ${secs > 0 ? `${secs}s` : ''}`;
  };

  const previewId = extractYouTubeVideoId(videoInput);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm overflow-y-auto">
      <div
        className="relative w-full max-w-4xl rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Film className="h-4 w-4 text-brand-600 dark:text-brand-400" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                {isArabic ? 'إدارة فيديوهات المحاضرة' : 'Lecture Videos Management'}
              </h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              {lectureTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading ? (
            <LoadingState message={isArabic ? 'جاري تحميل بيانات الفيديوهات...' : 'Loading videos...'} />
          ) : error ? (
            <ErrorState
              title={isArabic ? 'تعذر تحميل الفيديوهات' : 'Failed to Load Videos'}
              message={error.message || (isArabic ? 'حدث خطأ أثناء استرجاع الفيديوهات.' : 'An error occurred.')}
              onRetry={fetchVideos}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* --- MAIN VIDEO CARD --- */}
              <div className="flex flex-col justify-between rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 overflow-hidden">
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-neutral-900">
                  <div className="flex items-center gap-2">
                    <PlayCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                      {isArabic ? 'فيديو الشرح الأساسي (Main Video)' : 'Main Explanation Video'}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    YouTube
                  </span>
                </div>

                <div className="p-4 flex-1 space-y-4">
                  {mainVideo ? (
                    <div className="space-y-3">
                      {/* Embed Preview */}
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black shadow-sm">
                        <iframe
                          src={buildYouTubeEmbedUrl(mainVideo.provider_video_id)}
                          title="Main Video Preview"
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>

                      {/* Video Info */}
                      <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-300">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{isArabic ? 'معرف الفيديو:' : 'Video ID:'}</span>
                          <span className="font-mono text-neutral-900 dark:text-white font-bold">{mainVideo.provider_video_id}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{isArabic ? 'المدة:' : 'Duration:'}</span>
                          <span className="font-medium text-neutral-900 dark:text-white">{formatDuration(mainVideo.duration_seconds)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{isArabic ? 'الحالة:' : 'Status:'}</span>
                          <StatusBadge status={mainVideo.status} isArabic={isArabic} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center space-y-2">
                      <Film className="h-10 w-10 text-neutral-300 dark:text-neutral-600 mx-auto" />
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                        {isArabic ? 'لم يتم إسناد فيديو الشرح الأساسي بعد.' : 'No main video attached yet.'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between">
                  <PermissionGate permission={SystemPermissions.VIDEOS_MANAGE}>
                    <button
                      type="button"
                      onClick={() => handleOpenForm('MAIN')}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
                    >
                      {mainVideo ? (
                        <>
                          <Edit className="h-3.5 w-3.5" />
                          {isArabic ? 'تحديث فيديو الشرح' : 'Update Main Video'}
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" />
                          {isArabic ? 'إسناد فيديو الشرح' : 'Attach Main Video'}
                        </>
                      )}
                    </button>
                  </PermissionGate>
                </div>
              </div>

              {/* --- SOLUTION VIDEO CARD --- */}
              <div className="flex flex-col justify-between rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 overflow-hidden">
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-neutral-900">
                  <div className="flex items-center gap-2">
                    <PlayCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                      {isArabic ? 'فيديو حل التمارين (Solution Video)' : 'Solution / Graded Video'}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                    YouTube
                  </span>
                </div>

                <div className="p-4 flex-1 space-y-4">
                  {solutionVideo ? (
                    <div className="space-y-3">
                      {/* Embed Preview */}
                      <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black shadow-sm">
                        <iframe
                          src={buildYouTubeEmbedUrl(solutionVideo.provider_video_id)}
                          title="Solution Video Preview"
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>

                      {/* Video Info */}
                      <div className="space-y-1 text-xs text-neutral-600 dark:text-neutral-300">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{isArabic ? 'معرف الفيديو:' : 'Video ID:'}</span>
                          <span className="font-mono text-neutral-900 dark:text-white font-bold">{solutionVideo.provider_video_id}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{isArabic ? 'المدة:' : 'Duration:'}</span>
                          <span className="font-medium text-neutral-900 dark:text-white">{formatDuration(solutionVideo.duration_seconds)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{isArabic ? 'الحالة:' : 'Status:'}</span>
                          <StatusBadge status={solutionVideo.status} isArabic={isArabic} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center space-y-2">
                      <Film className="h-10 w-10 text-neutral-300 dark:text-neutral-600 mx-auto" />
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                        {isArabic ? 'لم يتم إسناد فيديو حل التمارين بعد.' : 'No solution video attached yet.'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between">
                  <PermissionGate permission={SystemPermissions.VIDEOS_MANAGE}>
                    <button
                      type="button"
                      onClick={() => handleOpenForm('SOLUTION')}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
                    >
                      {solutionVideo ? (
                        <>
                          <Edit className="h-3.5 w-3.5" />
                          {isArabic ? 'تحديث فيديو الحل' : 'Update Solution Video'}
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5" />
                          {isArabic ? 'إسناد فيديو الحل' : 'Attach Solution Video'}
                        </>
                      )}
                    </button>
                  </PermissionGate>
                </div>
              </div>
            </div>
          )}

          {/* Form Modal (Attach / Update Video) */}
          {activeFormType && (
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <PlayCircle className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                    {activeFormType === 'MAIN'
                      ? isArabic
                        ? 'إسناد / تحديث فيديو الشرح الأساسي'
                        : 'Attach / Update Main Video'
                      : isArabic
                      ? 'إسناد / تحديث فيديو حل التمارين'
                      : 'Attach / Update Solution Video'}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveVideo} className="space-y-4">
                {formError && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
                    {formError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    {isArabic ? 'رابط يوتيوب أو معرف الفيديو (11 حرفاً) *' : 'YouTube URL or Video ID (11 chars) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={videoInput}
                    onChange={(e) => setVideoInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or dQw4w9WgXcQ"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white font-mono"
                  />
                  <span className="text-[11px] text-neutral-400 block">
                    {isArabic
                      ? 'يدعم روابط youtube.com/watch?v= أو youtu.be/ أو المعرف المباشر.'
                      : 'Supports youtube.com/watch?v=..., youtu.be/..., or direct 11-char ID.'}
                  </span>
                </div>

                {/* Live Embed Preview */}
                {previewId && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 block">
                      {isArabic ? 'معاينة الفيديو المباشرة:' : 'Live Video Preview:'}
                    </span>
                    <div className="relative aspect-video max-w-sm rounded-lg overflow-hidden bg-black shadow-sm">
                      <iframe
                        src={buildYouTubeEmbedUrl(previewId)}
                        title="Live Preview"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      {isArabic ? 'المدة الإجمالية (بالثواني) *' : 'Duration (seconds) *'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={durationSeconds}
                      onChange={(e) => setDurationSeconds(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
                    />
                    <span className="text-[11px] text-neutral-400 block">
                      {formatDuration(durationSeconds)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      {isArabic ? 'رابط صورة مخصصة (اختياري)' : 'Custom Thumbnail URL (Optional)'}
                    </label>
                    <input
                      type="url"
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/50 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    disabled={isSaving}
                    className="px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    {isArabic ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isSaving && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                    {isArabic ? 'حفظ الفيديو' : 'Save Video'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
