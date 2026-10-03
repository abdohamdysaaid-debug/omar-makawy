'use client';

import React from 'react';
import {
  Video,
  BookOpen,
  Package,
  Calendar,
  Clock,
  FileText,
  Lock,
  Globe,
  Sparkles,
  ListOrdered,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { extractYouTubeVideoId, buildYouTubeEmbedUrl } from '@omar-makawy/shared';

interface LecturePreviewData {
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  academicYearName?: string;
  thumbnailUrl?: string | null;
  visibility: string;
  scheduledAt?: string | null;
  selectedCourseNames?: string[];
  selectedPackageNames?: string[];
  mainVideoUrl?: string;
  solutionVideoUrl?: string;
  chapters?: Array<{ timestamp_seconds: number; title_ar: string; title_en?: string }>;
  attachments?: Array<{ title_ar: string; title_en?: string; file_type?: string; download_allowed?: boolean }>;
}

interface LectureCardPreviewProps {
  data: LecturePreviewData;
  mode?: 'card' | 'full';
}

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function LectureCardPreview({ data, mode = 'full' }: LectureCardPreviewProps) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const mainVideoId = data.mainVideoUrl ? extractYouTubeVideoId(data.mainVideoUrl) : null;
  const solutionVideoId = data.solutionVideoUrl ? extractYouTubeVideoId(data.solutionVideoUrl) : null;

  const getVisibilityBadge = () => {
    switch (data.visibility) {
      case 'FREE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
            <Globe className="w-3 h-3" />
            {isAr ? 'مفتوحة للجميع' : 'Free Access'}
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950/80 text-amber-400 border border-amber-800/60">
            <Calendar className="w-3 h-3" />
            {isAr ? 'مجدولة' : 'Scheduled'}
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-800 text-neutral-400 border border-neutral-700">
            <Clock className="w-3 h-3" />
            {isAr ? 'مسودة' : 'Draft'}
          </span>
        );
      case 'SUBSCRIBER_ONLY':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-950/80 text-blue-400 border border-blue-800/60">
            <Lock className="w-3 h-3" />
            {isAr ? 'للمشتركين' : 'Subscribers Only'}
          </span>
        );
    }
  };

  return (
    <div className="bg-[#0e1310] border border-neutral-800 rounded-2xl overflow-hidden shadow-xl text-neutral-200">
      {/* Header Bar */}
      <div className="bg-[#141a16] px-4 py-3 border-b border-neutral-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-neutral-300">
            {isAr ? 'معاينة المحاضرة الحية' : 'Live Lecture Preview'}
          </span>
        </div>
        {getVisibilityBadge()}
      </div>

      <div className="p-5 space-y-6">
        {/* Main Video or Thumbnail 16:9 */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/60 border border-neutral-800/80 shadow-inner flex items-center justify-center">
          {mainVideoId ? (
            <iframe
              src={buildYouTubeEmbedUrl(mainVideoId)}
              title={data.titleAr || 'Video Preview'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : data.thumbnailUrl ? (
            <img
              src={data.thumbnailUrl}
              alt={data.titleAr || 'Lecture Thumbnail'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-neutral-500">
              <Video className="w-12 h-12 stroke-[1.5]" />
              <span className="text-xs">
                {isAr ? 'لم يتم إدخال فيديو أو صورة غلاف بعد' : 'No video or thumbnail entered yet'}
              </span>
            </div>
          )}
        </div>

        {/* Title & Metadata */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {data.academicYearName && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                {data.academicYearName}
              </span>
            )}
            {data.scheduledAt && data.visibility === 'SCHEDULED' && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-950/60 text-amber-300 border border-amber-800/40 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(data.scheduledAt).toLocaleString(isAr ? 'ar-EG' : 'en-US')}
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {data.titleAr || (isAr ? 'عنوان المحاضرة' : 'Lecture Title')}
          </h2>
          {data.titleEn && (
            <p className="text-xs text-neutral-400 font-medium mt-0.5" dir="ltr">
              {data.titleEn}
            </p>
          )}
        </div>

        {/* Description */}
        {(data.descriptionAr || data.descriptionEn) && (
          <div className="bg-[#121814] rounded-xl p-3.5 border border-neutral-800/80 text-xs text-neutral-300 space-y-1">
            {data.descriptionAr && <p className="leading-relaxed">{data.descriptionAr}</p>}
            {data.descriptionEn && (
              <p className="text-neutral-400 leading-relaxed font-sans" dir="ltr">
                {data.descriptionEn}
              </p>
            )}
          </div>
        )}

        {/* Linked Courses & Packages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Linked Courses */}
          <div className="bg-[#121814] p-3 rounded-xl border border-neutral-800/80">
            <div className="flex items-center gap-1.5 text-neutral-400 font-bold mb-2">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'الكورسات المرتبطة' : 'Linked Courses'}</span>
              <span className="text-[10px] bg-neutral-800 px-1.5 py-0.2 rounded-full text-neutral-300">
                {data.selectedCourseNames?.length || 0}
              </span>
            </div>
            {data.selectedCourseNames && data.selectedCourseNames.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {data.selectedCourseNames.map((name, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-950/40 text-emerald-300 border border-emerald-900/60 text-[11px]"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-neutral-500 italic">
                {isAr ? 'لم يتم ربط أي كورس' : 'No courses linked'}
              </p>
            )}
          </div>

          {/* Linked Packages */}
          <div className="bg-[#121814] p-3 rounded-xl border border-neutral-800/80">
            <div className="flex items-center gap-1.5 text-neutral-400 font-bold mb-2">
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>{isAr ? 'الباقات المرتبطة' : 'Linked Packages'}</span>
              <span className="text-[10px] bg-neutral-800 px-1.5 py-0.2 rounded-full text-neutral-300">
                {data.selectedPackageNames?.length || 0}
              </span>
            </div>
            {data.selectedPackageNames && data.selectedPackageNames.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {data.selectedPackageNames.map((name, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-950/40 text-amber-300 border border-amber-900/60 text-[11px]"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5 text-amber-400" />
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-neutral-500 italic">
                {isAr ? 'لم يتم ربط أي باقة' : 'No packages linked'}
              </p>
            )}
          </div>
        </div>

        {/* Chapters Section */}
        {data.chapters && data.chapters.length > 0 && (
          <div className="bg-[#121814] p-3.5 rounded-xl border border-neutral-800/80">
            <div className="flex items-center gap-2 font-bold text-xs text-neutral-300 mb-2.5">
              <ListOrdered className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'فهرس المحاضرة' : 'Lecture Chapters'}</span>
            </div>
            <div className="space-y-1.5">
              {data.chapters.map((ch, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-emerald-400 font-mono text-[11px] font-bold">
                      {formatTimestamp(ch.timestamp_seconds)}
                    </span>
                    <span className="text-neutral-200 truncate">{ch.title_ar}</span>
                  </div>
                  {ch.title_en && (
                    <span className="text-neutral-500 text-[11px] font-sans truncate" dir="ltr">
                      {ch.title_en}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attachments Section */}
        {data.attachments && data.attachments.length > 0 && (
          <div className="bg-[#121814] p-3.5 rounded-xl border border-neutral-800/80">
            <div className="flex items-center gap-2 font-bold text-xs text-neutral-300 mb-2.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>{isAr ? 'المذكرات والمرفقات' : 'Attachments & PDFs'}</span>
            </div>
            <div className="space-y-1.5">
              {data.attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-800/60">
                      {att.file_type || 'PDF'}
                    </span>
                    <span className="text-neutral-200 truncate">{att.title_ar}</span>
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    {att.download_allowed ? (isAr ? 'مسموح بالتحميل' : 'Downloadable') : (isAr ? 'عرض فقط' : 'View only')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Solution Video Preview if present */}
        {solutionVideoId && (
          <div className="bg-[#121814] p-3.5 rounded-xl border border-neutral-800/80 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-amber-300">
              <Video className="w-3.5 h-3.5" />
              <span>{isAr ? 'فيديو الحل النموذجي' : 'Solution Video'}</span>
            </div>
            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black/60 border border-neutral-800">
              <iframe
                src={buildYouTubeEmbedUrl(solutionVideoId)}
                title={isAr ? 'فيديو الحل' : 'Solution Video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
