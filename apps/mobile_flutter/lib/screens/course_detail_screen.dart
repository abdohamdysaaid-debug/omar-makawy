import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../models/course_model.dart';
import '../models/lecture_model.dart';
import '../providers/auth_provider.dart';
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
  bool _isPurchasing = false;

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

      // Fetch lectures for this course
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

      setState(() {
        _course = course;
        _lectures = lectures;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _handlePurchase() async {
    if (_course == null) return;
    final auth = Provider.of<AuthProvider>(context, listen: false);

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('تأكيد الاشتراك'),
        content: Text(
          'هل ترغب في الاشتراك في "${_course!.name}" بسعر ${_course!.discountPrice ?? _course!.price} ج.م من رصيد محفظتك؟',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('تأكيد وخصم الرصيد', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() => _isPurchasing = true);
    try {
      await _apiService.post(
        '/purchases',
        body: {
          'item_type': 'COURSE',
          'item_id': _course!.id,
        },
      );

      await auth.refreshProfile();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('تم الاشتراك في الكورس بنجاح!'),
          backgroundColor: AppColors.primary,
        ),
      );
      _fetchCourseDetails();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString()),
          backgroundColor: AppColors.error,
        ),
      );
    } finally {
      if (mounted) setState(() => _isPurchasing = false);
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
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _errorMessage != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.error_outline, size: 56, color: AppColors.error),
                        const SizedBox(height: 16),
                        Text(_errorMessage!, textAlign: TextAlign.center),
                        const SizedBox(height: 20),
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
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Thumbnail Card
          ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: AspectRatio(
              aspectRatio: 16 / 9,
              child: Container(
                color: isDark ? AppColors.darkCard : Colors.grey.shade200,
                child: course.thumbnailUrl != null && course.thumbnailUrl!.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: course.thumbnailUrl!,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) => const Center(
                          child: Icon(Icons.menu_book, size: 64, color: AppColors.primary),
                        ),
                      )
                    : const Center(
                        child: Icon(Icons.menu_book, size: 64, color: AppColors.primary),
                      ),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Course Info
          Text(
            course.name,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),

          if (course.description != null && course.description!.isNotEmpty)
            Text(
              course.description!,
              style: TextStyle(
                fontSize: 14,
                color: isDark ? Colors.white70 : Colors.black87,
                height: 1.5,
              ),
            ),
          const SizedBox(height: 16),

          // Enrollment / Pricing Bar
          if (!course.isEnrolled)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkCard : AppColors.lightCard,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                ),
              ),
              child: Row(
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'سعر الكورس الكامل',
                        style: TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${course.discountPrice ?? course.price} ج.م',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                  const Spacer(),
                  ElevatedButton(
                    onPressed: _isPurchasing ? null : _handlePurchase,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: _isPurchasing
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                          )
                        : const Text('اشترك الآن', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ),

          const SizedBox(height: 24),

          // Lectures Header
          Row(
            children: [
              const Icon(Icons.video_library, color: AppColors.primary, size: 22),
              const SizedBox(width: 8),
              const Text(
                'محتوى ومحاضرات الكورس',
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${_lectures.length} محاضرة',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Lecture List
          if (_lectures.isEmpty)
            Container(
              padding: const EdgeInsets.all(24),
              alignment: Alignment.center,
              child: const Text('لا توجد محاضرات متاحة في هذا الكورس بعد'),
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

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      elevation: 0,
      color: isDark ? AppColors.darkCard : AppColors.lightCard,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
        ),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        leading: Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            color: canAccess ? AppColors.primary.withOpacity(0.12) : Colors.grey.withOpacity(0.12),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Center(
            child: canAccess
                ? (lec.isCompleted
                    ? const Icon(Icons.check_circle, color: AppColors.primary, size: 24)
                    : Text('$number', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)))
                : const Icon(Icons.lock, color: Colors.grey, size: 20),
          ),
        ),
        title: Text(
          lec.title,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 15,
            color: canAccess ? (isDark ? Colors.white : Colors.black87) : Colors.grey,
          ),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Row(
            children: [
              Icon(Icons.timer_outlined, size: 14, color: isDark ? Colors.white60 : Colors.black54),
              const SizedBox(width: 4),
              Text(
                '${lec.durationMinutes} دقيقة',
                style: TextStyle(fontSize: 12, color: isDark ? Colors.white60 : Colors.black54),
              ),
              if (lec.isFree && !isCourseEnrolled) ...[
                const SizedBox(width: 10),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Text(
                    'مجانية',
                    style: TextStyle(fontSize: 10, color: Colors.green, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ],
          ),
        ),
        trailing: canAccess
            ? const Icon(Icons.play_circle_fill, color: AppColors.primary, size: 30)
            : const Icon(Icons.lock_outline, color: Colors.grey),
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
              const SnackBar(content: Text('يرجى الاشتراك في الكورس لمشاهدة هذه المحاضرة')),
            );
          }
        },
      ),
    );
  }
}
