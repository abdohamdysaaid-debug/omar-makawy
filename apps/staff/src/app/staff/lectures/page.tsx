'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Video,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Clock,
  Globe,
  Lock,
  BookOpen,
  Package,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Archive,
  CheckCircle2,
  AlertCircle,
  FileText,
  ListOrdered,
  X,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAcademicYearScope } from '@/context/AcademicYearContext';
import { usePermissions } from '@/hooks/usePermissions';
import {
  LectureItem,
  LecturesListQuery,
  SystemPermissions,
  resolveLectureThumbnailUrl,
  createLecturesApi,
} from '@omar-makawy/shared';
import { staffApiClient } from '@/context/StaffAuthContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/FeedbackStates';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LectureFormModal } from '@/components/lectures/LectureFormModal';
import { LectureCardPreview } from '@/components/lectures/LectureCardPreview';

const staffLecturesApi = createLecturesApi(staffApiClient);

function LectureThumbnailCell({ lecture }: { lecture: LectureItem }) {
  const [hasError, setHasError] = useState(false);
  const resolvedUrl = resolveLectureThumbnailUrl(lecture);

  useEffect(() => {
    setHasError(false);
  }, [lecture.thumbnail_url, lecture.videos]);

  if (!resolvedUrl || hasError) {
    return (
      <div className="w-12 h-7 rounded-md bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-600">
        <Video className="w-4 h-4" />
      </div>
    );
  }

  return (
    <div className="w-12 h-7 rounded-md overflow-hidden bg-black border border-neutral-800 flex-shrink-0">
      <img
        src={resolvedUrl}
        alt={lecture.title_ar}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function LectureVisibilityBadge({ visibility, isAr }: { visibility?: string; isAr: boolean }) {
  switch (visibility) {
    case 'FREE':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
          <Globe className="w-2.5 h-2.5" />
          {isAr ? 'مفتوحة' : 'Free'}
        </span>
      );
    case 'SCHEDULED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-950/80 text-amber-400 border border-amber-800/60">
          <Calendar className="w-2.5 h-2.5" />
          {isAr ? 'مجدولة' : 'Scheduled'}
        </span>
      );
    case 'DRAFT':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-neutral-800 text-neutral-400 border border-neutral-700">
          <Clock className="w-2.5 h-2.5" />
          {isAr ? 'مسودة' : 'Draft'}
        </span>
      );
    case 'SUBSCRIBER_ONLY':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-950/80 text-blue-400 border border-blue-800/60">
          <Lock className="w-2.5 h-2.5" />
          {isAr ? 'للمشتركين' : 'Subscribers'}
        </span>
      );
  }
}

export default function StaffLecturesPage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const { hasPermission, isTeacher } = usePermissions();
  const { availableYears, activeAcademicYearId } = useAcademicYearScope();

  const canManage = isTeacher || hasPermission(SystemPermissions.LECTURES_MANAGE);

  // Filters State
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [filterYearId, setFilterYearId] = useState<string>(activeAcademicYearId || 'ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  // Data State
  const [lectures, setLectures] = useState<LectureItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals State
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedLectureForEdit, setSelectedLectureForEdit] = useState<LectureItem | null>(null);
  const [previewLecture, setPreviewLecture] = useState<LectureItem | null>(null);
  const [lectureToDelete, setLectureToDelete] = useState<LectureItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Sync active academic year change
  useEffect(() => {
    if (activeAcademicYearId) {
      setFilterYearId(activeAcademicYearId);
    } else {
      setFilterYearId('ALL');
    }
  }, [activeAcademicYearId]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Lectures List
  const fetchLectures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query: LecturesListQuery = {
        page,
        limit,
        search: debouncedSearch.trim() || undefined,
        academic_year_id: filterYearId !== 'ALL' ? filterYearId : undefined,
      };

      if (statusFilter !== 'ALL') {
        query.status = statusFilter;
      }
      if (visibilityFilter !== 'ALL') {
        query.visibility = visibilityFilter;
      }

      const res = await staffLecturesApi.listLectures(
        query,
        filterYearId !== 'ALL' ? filterYearId : undefined
      );

      setLectures(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err: any) {
      setError(
        err?.message || (isAr ? 'فشل تحميل قائمة المحاضرات' : 'Failed to load lectures')
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, filterYearId, statusFilter, visibilityFilter, isAr]);

  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);

  // Create Handlers
  const handleOpenCreate = () => {
    setSelectedLectureForEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (lecture: LectureItem) => {
    setSelectedLectureForEdit(lecture);
    setIsFormOpen(true);
  };

  const handleFormSuccess = (saved: LectureItem) => {
    setActionSuccessMessage(
      isAr
        ? `تم حفظ المحاضرة "${saved.title_ar}" بنجاح`
        : `Lecture "${saved.title_ar}" saved successfully`
    );
    setTimeout(() => setActionSuccessMessage(null), 4000);
    fetchLectures();
  };

  // Archive / Unpublish
  const handleToggleArchive = async (lecture: LectureItem) => {
    const isCurrentlyArchived = lecture.status === 'ARCHIVED';
    const newStatus = isCurrentlyArchived ? 'PUBLISHED' : 'ARCHIVED';

    try {
      await staffLecturesApi.updateLecture(
        lecture.id,
        {
          status: newStatus,
          is_published: newStatus === 'PUBLISHED',
        },
        lecture.academic_year_id
      );

      setActionSuccessMessage(
        isAr
          ? isCurrentlyArchived
            ? 'تم إلغاء أرشفة المحاضرة ونشرها بنجاح'
            : 'تمت أرشفة المحاضرة بنجاح'
          : isCurrentlyArchived
          ? 'Lecture unarchived & published'
          : 'Lecture archived successfully'
      );
      setTimeout(() => setActionSuccessMessage(null), 4000);
      fetchLectures();
    } catch (err: any) {
      alert(err?.message || (isAr ? 'فشل تعديل حالة الأرشفة' : 'Failed to change archive status'));
    }
  };

  // Delete Handlers
  const handleConfirmDelete = async () => {
    if (!lectureToDelete) return;
    setIsDeleting(true);
    try {
      await staffLecturesApi.deleteLecture(lectureToDelete.id, lectureToDelete.academic_year_id);
      setActionSuccessMessage(
        isAr
          ? `تم حذف المحاضرة "${lectureToDelete.title_ar}" بنجاح`
          : `Lecture "${lectureToDelete.title_ar}" deleted successfully`
      );
      setLectureToDelete(null);
      setTimeout(() => setActionSuccessMessage(null), 4000);
      fetchLectures();
    } catch (err: any) {
      alert(err?.message || (isAr ? 'فشل حذف المحاضرة' : 'Failed to delete lecture'));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60 shadow-xs">
              <Video className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">
              {isAr ? 'المحاضرات' : 'Lectures'}
            </h1>
          </div>
          <p className="text-xs text-neutral-400">
            {isAr
              ? 'إدارة المحاضرات والفيديوهات والمحتوى التعليمي'
              : 'Manage lectures, videos, chapters and educational content'}
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-950/40 hover:bg-emerald-500 transition-all active:scale-98"
          >
            <Plus className="h-4 w-4" />
            <span>{isAr ? '+ إضافة محاضرة' : '+ Add Lecture'}</span>
          </button>
        )}
      </div>

      {/* Success Notification */}
      {actionSuccessMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs font-medium animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 bg-[#0c100d] p-3.5 rounded-2xl border border-neutral-800/80 shadow-xs">
        {/* Search */}
        <div className="lg:col-span-4 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث بالاسم بالعربي أو الإنجليزي...' : 'Search by title (Arabic/English)...'}
            className="w-full bg-[#121814] border border-neutral-700/80 rounded-xl px-9 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Academic Year Filter */}
        <div className="lg:col-span-3">
          <select
            value={filterYearId}
            onChange={(e) => {
              setFilterYearId(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#121814] border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="ALL">{isAr ? 'جميع المراحل الدراسية' : 'All Academic Years'}</option>
            {availableYears.map((year) => (
              <option key={year.id} value={year.id}>
                {isAr ? year.name_ar : year.name_en} ({year.code})
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="lg:col-span-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#121814] border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="ALL">{isAr ? 'كل الحالات' : 'All Statuses'}</option>
            <option value="PUBLISHED">{isAr ? 'منشورة' : 'Published'}</option>
            <option value="DRAFT">{isAr ? 'مسودة' : 'Draft'}</option>
            <option value="ARCHIVED">{isAr ? 'مؤرشفة' : 'Archived'}</option>
          </select>
        </div>

        {/* Visibility Filter */}
        <div className="lg:col-span-2">
          <select
            value={visibilityFilter}
            onChange={(e) => {
              setVisibilityFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#121814] border border-neutral-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="ALL">{isAr ? 'كل أنواع الظهور' : 'All Visibility'}</option>
            <option value="SUBSCRIBER_ONLY">{isAr ? 'للمشتركين' : 'Subscribers Only'}</option>
            <option value="FREE">{isAr ? 'مفتوحة' : 'Free'}</option>
            <option value="SCHEDULED">{isAr ? 'مجدولة' : 'Scheduled'}</option>
            <option value="DRAFT">{isAr ? 'مسودة' : 'Draft'}</option>
          </select>
        </div>

        {/* Refresh */}
        <div className="lg:col-span-1 flex items-center justify-end">
          <button
            type="button"
            onClick={() => fetchLectures()}
            disabled={loading}
            title={isAr ? 'تحديث' : 'Refresh'}
            className="w-full h-full min-h-[34px] flex items-center justify-center rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Table / Feedback States */}
      {loading ? (
        <LoadingState message={isAr ? 'جاري تحميل المحاضرات...' : 'Loading lectures...'} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLectures} />
      ) : lectures.length === 0 ? (
        <EmptyState
          title={isAr ? 'لا توجد محاضرات' : 'No lectures found'}
          description={
            isAr
              ? 'لم يتم العثور على محاضرات تطابق معايير البحث أو المرحلة المحددة.'
              : 'No lectures matched your search or selected filters.'
          }
          actionLabel={canManage ? (isAr ? '+ إضافة أول محاضرة' : '+ Add First Lecture') : undefined}
          onAction={canManage ? handleOpenCreate : undefined}
        />
      ) : (
        <div className="bg-[#0c100d] border border-neutral-800/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-[#121814] text-neutral-400 border-b border-neutral-800 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 text-start">{isAr ? 'المحاضرة' : 'Lecture'}</th>
                  <th className="py-3.5 px-3 text-start">{isAr ? 'المرحلة' : 'Grade'}</th>
                  <th className="py-3.5 px-3 text-start">{isAr ? 'الكورسات' : 'Courses'}</th>
                  <th className="py-3.5 px-3 text-start">{isAr ? 'الباقات' : 'Packages'}</th>
                  <th className="py-3.5 px-3 text-start">{isAr ? 'الظهور' : 'Visibility'}</th>
                  <th className="py-3.5 px-3 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="py-3.5 px-3 text-start">{isAr ? 'الجدولة / النشر' : 'Schedule'}</th>
                  <th className="py-3.5 px-4 text-end">{isAr ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850 text-neutral-300">
                {lectures.map((lec) => {
                  const isScheduledFuture =
                    lec.visibility === 'SCHEDULED' &&
                    lec.scheduled_at &&
                    new Date(lec.scheduled_at).getTime() > Date.now();

                  return (
                    <tr key={lec.id} className="hover:bg-[#101612] transition-colors group">
                      {/* Thumbnail & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <LectureThumbnailCell lecture={lec} />
                          <div className="truncate max-w-xs">
                            <p className="font-bold text-white truncate text-xs">{lec.title_ar}</p>
                            {lec.title_en && (
                              <p className="text-[11px] text-neutral-400 font-sans truncate" dir="ltr">
                                {lec.title_en}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Academic Year */}
                      <td className="py-3 px-3">
                        <span className="inline-block font-mono text-[11px] text-neutral-300 bg-neutral-800/80 px-2 py-0.5 rounded">
                          {lec.academic_year_code || lec.academic_year_name_ar || '—'}
                        </span>
                      </td>

                      {/* Linked Courses Count/Badges */}
                      <td className="py-3 px-3">
                        {lec.courses && lec.courses.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span className="font-semibold text-white">{lec.courses.length}</span>
                            <span className="text-[10px] text-neutral-500">
                              ({lec.courses.map((c) => c.title_ar).slice(0, 2).join('، ')}
                              {lec.courses.length > 2 ? '...' : ''})
                            </span>
                          </div>
                        ) : (
                          <span className="text-neutral-500 text-[11px] italic">
                            {isAr ? 'بدون كورس' : 'None'}
                          </span>
                        )}
                      </td>

                      {/* Linked Packages Count/Badges */}
                      <td className="py-3 px-3">
                        {lec.packages && lec.packages.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                            <span className="font-semibold text-white">{lec.packages.length}</span>
                            <span className="text-[10px] text-neutral-500">
                              ({lec.packages.map((p) => p.title_ar).slice(0, 1).join('، ')}
                              {lec.packages.length > 1 ? '...' : ''})
                            </span>
                          </div>
                        ) : (
                          <span className="text-neutral-500 text-[11px] italic">
                            {isAr ? 'بدون باقة' : 'None'}
                          </span>
                        )}
                      </td>

                      {/* Visibility Badge */}
                      <td className="py-3 px-3">
                        <LectureVisibilityBadge visibility={lec.visibility} isAr={isAr} />
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3">
                        <StatusBadge status={lec.status || 'PUBLISHED'} />
                      </td>

                      {/* Scheduled Date or Created Date */}
                      <td className="py-3 px-3">
                        {lec.scheduled_at && lec.visibility === 'SCHEDULED' ? (
                          <div className="text-[11px]">
                            <p className="font-mono text-amber-300 font-bold">
                              {new Date(lec.scheduled_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                            </p>
                            <p className="text-[10px] text-neutral-400 font-mono">
                              {new Date(lec.scheduled_at).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-neutral-400 font-mono">
                            {new Date(lec.created_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-end">
                        <div className="flex items-center justify-end gap-1">
                          {/* Preview Action */}
                          <button
                            type="button"
                            onClick={() => setPreviewLecture(lec)}
                            title={isAr ? 'معاينة المحاضرة' : 'Preview Lecture'}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-300 hover:bg-emerald-950/60 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {canManage && (
                            <>
                              {/* Edit Action */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(lec)}
                                title={isAr ? 'تعديل المحاضرة' : 'Edit Lecture'}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Archive/Unpublish Action */}
                              <button
                                type="button"
                                onClick={() => handleToggleArchive(lec)}
                                title={
                                  lec.status === 'ARCHIVED'
                                    ? isAr
                                      ? 'إلغاء الأرشفة'
                                      : 'Unarchive'
                                    : isAr
                                    ? 'أرشفة'
                                    : 'Archive'
                                }
                                className={`p-1.5 rounded-lg transition-colors ${
                                  lec.status === 'ARCHIVED'
                                    ? 'text-amber-400 hover:bg-amber-950/60'
                                    : 'text-neutral-400 hover:text-amber-300 hover:bg-neutral-800'
                                }`}
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Action */}
                              <button
                                type="button"
                                onClick={() => setLectureToDelete(lec)}
                                title={isAr ? 'حذف المحاضرة' : 'Delete Lecture'}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-[#101612] border-t border-neutral-800 text-xs">
              <span className="text-neutral-400">
                {isAr ? `إجمالي ${total} محاضرة` : `Total ${total} lectures`} •{' '}
                {isAr ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .map((p, idx, arr) => (
                      <React.Fragment key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="text-neutral-600 px-1">...</span>
                        )}
                        <button
                          type="button"
                          onClick={() => setPage(p)}
                          className={`min-w-[28px] h-7 px-2 rounded-lg font-mono text-xs font-bold transition-colors ${
                            page === p
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form Modal (Create / Edit) */}
      {isFormOpen && (
        <LectureFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
          initialLecture={selectedLectureForEdit}
        />
      )}

      {/* Preview Modal */}
      {previewLecture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0b0f0c] border border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  {isAr ? 'معاينة المحاضرة' : 'Lecture Preview'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewLecture(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <LectureCardPreview
              data={{
                titleAr: previewLecture.title_ar,
                titleEn: previewLecture.title_en,
                descriptionAr: previewLecture.description_ar || undefined,
                descriptionEn: previewLecture.description_en || undefined,
                academicYearName: previewLecture.academic_year_code || previewLecture.academic_year_name_ar,
                thumbnailUrl: resolveLectureThumbnailUrl(previewLecture),
                visibility: previewLecture.visibility || 'SUBSCRIBER_ONLY',
                scheduledAt: previewLecture.scheduled_at,
                selectedCourseNames: previewLecture.courses?.map((c) => c.title_ar) || [],
                selectedPackageNames: previewLecture.packages?.map((p) => p.title_ar) || [],
                mainVideoUrl: previewLecture.videos?.find((v) => v.video_type === 'MAIN')?.provider_video_id,
                solutionVideoUrl: previewLecture.videos?.find((v) => v.video_type === 'SOLUTION')?.provider_video_id,
                chapters: previewLecture.chapters?.map((ch) => ({
                  timestamp_seconds: ch.timestamp_seconds,
                  title_ar: ch.title_ar,
                  title_en: ch.title_en,
                })),
                attachments: previewLecture.attachments?.map((a) => ({
                  title_ar: a.title_ar,
                  title_en: a.title_en,
                  file_type: a.file_type,
                  download_allowed: a.download_allowed,
                })),
              }}
            />
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {lectureToDelete && (
        <ConfirmDialog
          isOpen={Boolean(lectureToDelete)}
          title={isAr ? 'حذف المحاضرة نهائياً' : 'Delete Lecture Permanently'}
          message={
            isAr
              ? `هل أنت متأكد من حذف المحاضرة "${lectureToDelete.title_ar}"؟ سيتم حذف فيديوهات ومرفقات وفهرس المحاضرة فقط، دون التأثير على الكورسات أو الباقات أو المشتركين.`
              : `Are you sure you want to delete lecture "${lectureToDelete.title_ar}"? This will only remove lecture-specific assets and relations.`
          }
          confirmText={isAr ? 'نعم، احذف المحاضرة' : 'Yes, Delete Lecture'}
          cancelText={isAr ? 'إلغاء' : 'Cancel'}
          isDestructive
          isLoading={isDeleting}
          onConfirm={handleConfirmDelete}
          onClose={() => setLectureToDelete(null)}
        />
      )}
    </div>
  );
}
