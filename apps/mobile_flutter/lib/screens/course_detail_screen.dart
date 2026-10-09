import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../config/theme.dart';
import '../models/course_model.dart';
import '../models/lecture_model.dart';
import '../services/api_service.dart';
import '../widgets/app_header.dart';
import 'lecture_player_screen.dart';

class CourseDetailScreen extends StatefulWidget {
  final String courseId;

  const CourseDetailScreen({super.key, required this.courseId});

  @override
  State<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends State<CourseDetailScreen> {
  final ApiService _apiService = ApiService();
  CourseModel? _course;
  List<LectureModel> _lectures = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _fetchCourseDetails();
  }

  Future<void> _fetchCourseDetails() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await _apiService.get('/courses/${widget.courseId}');
      CourseModel course;
      if (response is Map<String, dynamic>) {
        course = CourseModel.fromJson(response);
      } else {
        throw Exception('بيانات الكورس غير صالحة');
      }

      List<LectureModel> lectures = course.lectures;
      if (lectures.isEmpty) {
        try {
          final lecResponse = await _apiService.get('/courses/${widget.courseId}/lectures');
          if (lecResponse is List) {
            lectures = lecResponse
                .map((item) => LectureModel.fromJson(item as Map<String, dynamic>))
                .toList();
          }
        } catch (_) {}
      }

      if (mounted) {
        setState(() {
          _course = course;
          _lectures = lectures;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppHeader(
        title: _course?.name ?? 'تفاصيل الكورس',
        showBackButton: true,
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(
                color: AppColors.primary,
                strokeWidth: 2.8,
              ),
            )
          : _errorMessage != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline_rounded, size: 48, color: AppColors.error),
                        const SizedBox(height: 14),
                        Text(_errorMessage!, textAlign: TextAlign.center),
                        const SizedBox(height: 18),
                        ElevatedButton(
                          onPressed: _fetchCourseDetails,
                          child: const Text('إعادة المحاولة'),
                        ),
                      ],
                    ),
                  ),
                )
              : _buildContent(isDark),
    );
  }

  Widget _buildContent(bool isDark) {
    final course = _course!;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Luxury Thumbnail Banner
          ClipRRect(
            borderRadius: BorderRadius.circular(22),
            child: AspectRatio(
              aspectRatio: 16 / 9,
              child: Container(
                color: isDark ? AppColors.darkCard : AppColors.lightCard,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    course.thumbnailUrl != null && course.thumbnailUrl!.isNotEmpty
                        ? CachedNetworkImage(
                            imageUrl: course.thumbnailUrl!,
                            fit: BoxFit.cover,
                            errorWidget: (_, __, ___) => const Center(
                              child: Icon(Icons.menu_book_rounded, size: 60, color: AppColors.primary),
                            ),
                          )
                        : const Center(
                            child: Icon(Icons.menu_book_rounded, size: 60, color: AppColors.primary),
                          ),
                    if (course.price != null && course.price! > 0)
                      Positioned(
                        top: 14,
                        right: 14,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            gradient: AppColors.goldGradient,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.3),
                                blurRadius: 8,
                              ),
                            ],
                          ),
                          child: Text(
                            '${course.price} ج.م',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 13,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 18),

          // Course Title & Meta
          Text(
            course.name,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w900,
              color: isDark ? Colors.white : AppColors.textDark,
              letterSpacing: -0.4,
            ),
          ),
          const SizedBox(height: 8),

          if (course.description != null && course.description!.isNotEmpty)
            Text(
              course.description!,
              style: TextStyle(
                fontSize: 13.5,
                color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                height: 1.5,
              ),
            ),
          const SizedBox(height: 22),

          // Syllabus Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(isDark ? 0.16 : 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.video_library_rounded, color: AppColors.primary, size: 18),
              ),
              const SizedBox(width: 10),
              Text(
                'محتوى ومحاضرات الكورس',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                  color: isDark ? Colors.white : AppColors.textDark,
                  letterSpacing: -0.3,
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(isDark ? 0.16 : 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${_lectures.length} محاضرة',
                  style: const TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w800,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          // Lectures List
          if (_lectures.isEmpty)
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkCard : AppColors.lightCard,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
              ),
              alignment: Alignment.center,
              child: Text(
                'لا توجد محاضرات متاحة في هذا الكورس حالياً',
                style: TextStyle(
                  color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                  fontWeight: FontWeight.w600,
                ),
              ),
            )
          else
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _lectures.length,
              itemBuilder: (context, index) {
                final lec = _lectures[index];
                return _buildLectureTile(lec, index + 1, isDark, course.isEnrolled);
              },
            ),
        ],
      ),
    );
  }

  Widget _buildLectureTile(LectureModel lec, int number, bool isDark, bool isCourseEnrolled) {
    final canAccess = isCourseEnrolled || lec.isFree || !lec.isLocked;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : AppColors.lightCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: canAccess
              ? (lec.isCompleted ? AppColors.primary.withOpacity(0.4) : (isDark ? AppColors.darkBorder : AppColors.lightBorder))
              : (isDark ? AppColors.darkBorder.withOpacity(0.5) : AppColors.lightBorder),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.2 : 0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: canAccess ? AppColors.primary.withOpacity(isDark ? 0.16 : 0.12) : (isDark ? AppColors.darkSurfaceLight : Colors.grey.shade100),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Center(
            child: canAccess
                ? (lec.isCompleted
                    ? const Icon(Icons.check_circle_rounded, color: AppColors.primary, size: 24)
                    : Text('$number', style: const TextStyle(fontWeight: FontWeight.w900, color: AppColors.primary, fontSize: 16)))
                : Icon(Icons.lock_rounded, color: isDark ? Colors.white30 : Colors.black26, size: 20),
          ),
        ),
        title: Text(
          lec.title,
          style: TextStyle(
            fontWeight: FontWeight.w800,
            fontSize: 14.5,
            color: canAccess ? (isDark ? Colors.white : AppColors.textDark) : (isDark ? Colors.white38 : Colors.black38),
          ),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Row(
            children: [
              Icon(Icons.timer_outlined, size: 13, color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight),
              const SizedBox(width: 4),
              Text(
                '${lec.durationMinutes} دقيقة',
                style: TextStyle(fontSize: 11.5, color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight),
              ),
              if (lec.isFree && !isCourseEnrolled) ...[
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    'محاضرة مجانية',
                    style: TextStyle(fontSize: 10, color: AppColors.primary, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ],
          ),
        ),
        trailing: canAccess
            ? const Icon(Icons.play_circle_fill_rounded, color: AppColors.primary, size: 28)
            : Icon(Icons.lock_outline_rounded, color: isDark ? Colors.white30 : Colors.black26, size: 20),
        onTap: () {
          if (canAccess) {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => LecturePlayerScreen(lectureId: lec.id),
              ),
            );
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: const Text('يرجى الاشتراك في الكورس لمشاهدة هذه المحاضرة'),
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            );
          }
        },
      ),
    );
  }
}
